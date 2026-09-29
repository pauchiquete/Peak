begin;

-- El respaldo inicial debe ver una fotografía consistente. Estas tablas siguen
-- disponibles para lectura, pero no aceptan cambios hasta terminar el commit.
lock table
  public.clients,
  public.workout_days,
  public.workout_exercises,
  public.workout_day_completions
in share row exclusive mode;

-- Historial permanente del calendario. workout_day_id es una copia estable y
-- deliberadamente no tiene FK: debe sobrevivir aunque la rutina se elimine.
create table if not exists public.workout_calendar_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  workout_day_id uuid not null,
  workout_title text not null,
  day_of_week text,
  scheduled_on date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint workout_calendar_entries_day_unique
    unique (client_id, workout_day_id, scheduled_on)
);

create index if not exists workout_calendar_entries_client_date_idx
  on public.workout_calendar_entries (client_id, scheduled_on desc);

alter table public.workout_calendar_entries enable row level security;

drop policy if exists "Clients can view workout calendar history"
  on public.workout_calendar_entries;
create policy "Clients can view workout calendar history"
  on public.workout_calendar_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = workout_calendar_entries.client_id
        and clients.user_id = (select auth.uid())
    )
  );

drop policy if exists "Coaches can view workout calendar history"
  on public.workout_calendar_entries;
create policy "Coaches can view workout calendar history"
  on public.workout_calendar_entries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = workout_calendar_entries.client_id
        and clients.coach_id = (select auth.uid())
    )
  );

revoke all on table public.workout_calendar_entries from anon, authenticated;
grant select on table public.workout_calendar_entries to authenticated;

-- Fotografía todas las asignaciones completas de cada fecha. Si una fecha ya
-- fue fotografiada, no agrega rutinas nuevas: el punto de ese día es inmutable.
create or replace function public.snapshot_client_workout_calendar(
  target_client_id uuid,
  target_through_on date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  client_tracking_started_on date;
begin
  if target_client_id is null or target_through_on is null then
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'workout-calendar:' || target_client_id::text,
      0
    )
  );

  select clients.workout_tracking_started_on
  into client_tracking_started_on
  from public.clients
  where clients.id = target_client_id;

  if not found then
    return;
  end if;

  insert into public.workout_calendar_entries (
    client_id,
    workout_day_id,
    workout_title,
    day_of_week,
    scheduled_on,
    completed_at
  )
  select
    target_client_id,
    workout_days.id,
    workout_days.title,
    workout_days.day_of_week,
    period.starts_on + offsets.day_offset,
    workout_day_completions.created_at
  from public.workout_days
  cross join lateral (
    select greatest(
      client_tracking_started_on,
      (workout_days.created_at at time zone 'America/Mexico_City')::date,
      workout_days.schedule_started_on
    ) as starts_on
  ) as period
  cross join lateral pg_catalog.generate_series(
    0,
    target_through_on - period.starts_on
  ) as offsets(day_offset)
  left join public.workout_day_completions
    on workout_day_completions.client_id = target_client_id
    and workout_day_completions.workout_day_id = workout_days.id
    and workout_day_completions.completed_on =
      period.starts_on + offsets.day_offset
  where workout_days.client_id = target_client_id
    and exists (
      select 1
      from public.workout_exercises
      where workout_exercises.workout_day_id = workout_days.id
    )
    and extract(
      isodow from period.starts_on + offsets.day_offset
    )::integer = case lower(trim(workout_days.day_of_week))
      when 'lunes' then 1
      when 'martes' then 2
      when 'miércoles' then 3
      when 'miercoles' then 3
      when 'jueves' then 4
      when 'viernes' then 5
      when 'sábado' then 6
      when 'sabado' then 6
      when 'domingo' then 7
      else null
    end
    and not exists (
      select 1
      from public.workout_calendar_entries
      where workout_calendar_entries.client_id = target_client_id
        and workout_calendar_entries.scheduled_on =
          period.starts_on + offsets.day_offset
    )
  on conflict (client_id, workout_day_id, scheduled_on) do nothing;
end;
$$;

revoke all on function public.snapshot_client_workout_calendar(uuid, date)
  from public;

-- Respaldo inicial. Primero copia todos los puntos que hoy se reconstruyen con
-- la rutina activa y luego conserva cualquier palomita existente fuera de la
-- etapa actual. Nada de lo que todavía existe se elimina ni se reemplaza.
do $$
declare
  client_record record;
  today_in_mexico date :=
    ((statement_timestamp() at time zone 'America/Mexico_City')::date);
begin
  if not exists (
    select 1
    from public.workout_calendar_entries
  ) then
    for client_record in
      select clients.id
      from public.clients
    loop
      perform public.snapshot_client_workout_calendar(
        client_record.id,
        today_in_mexico
      );
    end loop;

    insert into public.workout_calendar_entries (
      client_id,
      workout_day_id,
      workout_title,
      day_of_week,
      scheduled_on,
      completed_at,
      created_at
    )
    select
      workout_day_completions.client_id,
      workout_day_completions.workout_day_id,
      workout_days.title,
      workout_days.day_of_week,
      workout_day_completions.completed_on,
      workout_day_completions.created_at,
      workout_day_completions.created_at
    from public.workout_day_completions
    join public.workout_days
      on workout_days.id = workout_day_completions.workout_day_id
      and workout_days.client_id = workout_day_completions.client_id
    on conflict (client_id, workout_day_id, scheduled_on)
    do update set
      completed_at = coalesce(
        workout_calendar_entries.completed_at,
        excluded.completed_at
      );
  end if;
end;
$$;

-- Cliente y entrenador sincronizan el calendario al abrirlo. La autorización
-- se valida dentro de la función y las escrituras directas siguen bloqueadas.
create or replace function public.sync_workout_calendar_history(
  target_client_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_in_mexico date :=
    ((statement_timestamp() at time zone 'America/Mexico_City')::date);
begin
  if auth.uid() is null or not exists (
    select 1
    from public.clients
    where clients.id = target_client_id
      and (
        clients.user_id = auth.uid()
        or clients.coach_id = auth.uid()
      )
  ) then
    raise exception 'Cliente no encontrado o no autorizado'
      using errcode = '42501';
  end if;

  perform public.snapshot_client_workout_calendar(
    target_client_id,
    today_in_mexico
  );

  return true;
end;
$$;

revoke all on function public.sync_workout_calendar_history(uuid)
  from public;
grant execute on function public.sync_workout_calendar_history(uuid)
  to authenticated;

-- Cualquier edición o eliminación congela primero el calendario completo del
-- cliente, antes de que la estructura mutable de la rutina pueda cambiar.
create or replace function public.preserve_calendar_before_workout_day_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.snapshot_client_workout_calendar(
    old.client_id,
    ((statement_timestamp() at time zone 'America/Mexico_City')::date)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists preserve_calendar_before_workout_day_change
  on public.workout_days;
create trigger preserve_calendar_before_workout_day_change
  before update or delete on public.workout_days
  for each row
  execute function public.preserve_calendar_before_workout_day_change();

create or replace function public.preserve_calendar_before_exercise_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workout_client_id uuid;
begin
  select workout_days.client_id
  into workout_client_id
  from public.workout_days
  where workout_days.id = old.workout_day_id;

  if found then
    perform public.snapshot_client_workout_calendar(
      workout_client_id,
      ((statement_timestamp() at time zone 'America/Mexico_City')::date)
    );
  end if;

  if tg_op = 'UPDATE'
    and new.workout_day_id is distinct from old.workout_day_id
  then
    select workout_days.client_id
    into workout_client_id
    from public.workout_days
    where workout_days.id = new.workout_day_id;

    if found then
      perform public.snapshot_client_workout_calendar(
        workout_client_id,
        ((statement_timestamp() at time zone 'America/Mexico_City')::date)
      );
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists preserve_calendar_before_exercise_change
  on public.workout_exercises;
create trigger preserve_calendar_before_exercise_change
  before update or delete on public.workout_exercises
  for each row
  execute function public.preserve_calendar_before_exercise_change();

revoke all on function public.preserve_calendar_before_workout_day_change()
  from public;
revoke all on function public.preserve_calendar_before_exercise_change()
  from public;

-- La palomita actualiza tanto la tabla original como su fotografía permanente.
create or replace function public.set_workout_day_completed(
  target_workout_day_id uuid,
  target_completed_on date,
  target_completed boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  workout_client_id uuid;
  scheduled_day text;
  scheduled_start date;
  scheduled_iso_day integer;
  completion_timestamp timestamptz;
  today_in_mexico date :=
    ((statement_timestamp() at time zone 'America/Mexico_City')::date);
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if target_completed_on is null or target_completed is null then
    raise exception 'Faltan datos del entrenamiento' using errcode = '22004';
  end if;

  select
    workout_days.client_id,
    workout_days.day_of_week,
    greatest(
      (workout_days.created_at at time zone 'America/Mexico_City')::date,
      workout_days.schedule_started_on,
      clients.workout_tracking_started_on
    )
  into workout_client_id, scheduled_day, scheduled_start
  from public.workout_days
  join public.clients
    on clients.id = workout_days.client_id
  where workout_days.id = target_workout_day_id
    and clients.user_id = auth.uid();

  if not found then
    raise exception 'Rutina no encontrada o no autorizada'
      using errcode = '42501';
  end if;

  if target_completed_on > today_in_mexico then
    raise exception 'No puedes completar una rutina futura'
      using errcode = '22007';
  end if;

  if target_completed_on < scheduled_start then
    raise exception 'La rutina todavía no estaba activa en esa fecha'
      using errcode = '22007';
  end if;

  scheduled_iso_day := case lower(trim(scheduled_day))
    when 'lunes' then 1
    when 'martes' then 2
    when 'miércoles' then 3
    when 'miercoles' then 3
    when 'jueves' then 4
    when 'viernes' then 5
    when 'sábado' then 6
    when 'sabado' then 6
    when 'domingo' then 7
    else null
  end;

  if scheduled_iso_day is null
    or extract(isodow from target_completed_on)::integer <> scheduled_iso_day
  then
    raise exception 'La fecha no corresponde al día asignado de la rutina'
      using errcode = '22007';
  end if;

  if not exists (
    select 1
    from public.workout_exercises
    where workout_exercises.workout_day_id = target_workout_day_id
  ) then
    raise exception 'La rutina todavía no tiene ejercicios'
      using errcode = '22023';
  end if;

  perform public.snapshot_client_workout_calendar(
    workout_client_id,
    target_completed_on
  );

  if not exists (
    select 1
    from public.workout_calendar_entries
    where workout_calendar_entries.client_id = workout_client_id
      and workout_calendar_entries.workout_day_id = target_workout_day_id
      and workout_calendar_entries.scheduled_on = target_completed_on
  ) then
    raise exception 'El registro de esa fecha ya quedó cerrado'
      using errcode = '22023';
  end if;

  if not target_completed then
    delete from public.workout_day_completions
    where workout_day_completions.workout_day_id = target_workout_day_id
      and workout_day_completions.client_id = workout_client_id
      and workout_day_completions.completed_on = target_completed_on;

    update public.workout_calendar_entries
    set completed_at = null
    where workout_calendar_entries.client_id = workout_client_id
      and workout_calendar_entries.workout_day_id = target_workout_day_id
      and workout_calendar_entries.scheduled_on = target_completed_on;

    return false;
  end if;

  insert into public.workout_day_completions (
    client_id,
    workout_day_id,
    completed_on
  )
  values (
    workout_client_id,
    target_workout_day_id,
    target_completed_on
  )
  on conflict (workout_day_id, completed_on)
  do update set client_id = excluded.client_id
  returning workout_day_completions.created_at into completion_timestamp;

  update public.workout_calendar_entries
  set completed_at = completion_timestamp
  where workout_calendar_entries.client_id = workout_client_id
    and workout_calendar_entries.workout_day_id = target_workout_day_id
    and workout_calendar_entries.scheduled_on = target_completed_on;

  return true;
end;
$$;

revoke all on function public.set_workout_day_completed(uuid, date, boolean)
  from public;
grant execute on function public.set_workout_day_completed(uuid, date, boolean)
  to authenticated;

comment on table public.workout_calendar_entries is
  'Fotografías permanentes de las rutinas asignadas y su estado por fecha.';

notify pgrst, 'reload schema';

commit;
