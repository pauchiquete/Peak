begin;

-- Evita contar como faltas fechas anteriores a la activación del calendario.
alter table public.clients
  add column if not exists workout_tracking_started_on date;

update public.clients
set workout_tracking_started_on =
  ((now() at time zone 'America/Mexico_City')::date)
where workout_tracking_started_on is null;

alter table public.clients
  alter column workout_tracking_started_on
    set default ((now() at time zone 'America/Mexico_City')::date),
  alter column workout_tracking_started_on set not null;

grant select (workout_tracking_started_on)
  on table public.clients to authenticated;

-- Cada cambio de día asignado empieza una etapa nueva del calendario. Así no
-- aparecen faltas retroactivas al mover, por ejemplo, una rutina de lunes a
-- martes o al agregar el primer ejercicio a un día que estaba vacío.
alter table public.workout_days
  add column if not exists schedule_started_on date;

update public.workout_days
set schedule_started_on =
  ((now() at time zone 'America/Mexico_City')::date)
where schedule_started_on is null;

alter table public.workout_days
  alter column schedule_started_on
    set default ((now() at time zone 'America/Mexico_City')::date),
  alter column schedule_started_on set not null;

grant select (schedule_started_on)
  on table public.workout_days to authenticated;

create or replace function public.refresh_workout_day_schedule_on_weekday()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.day_of_week is distinct from old.day_of_week then
    new.schedule_started_on :=
      ((now() at time zone 'America/Mexico_City')::date);
  end if;

  return new;
end;
$$;

drop trigger if exists refresh_workout_day_schedule_on_weekday
  on public.workout_days;
create trigger refresh_workout_day_schedule_on_weekday
  before update of day_of_week on public.workout_days
  for each row
  execute function public.refresh_workout_day_schedule_on_weekday();

create or replace function public.refresh_workout_day_schedule_on_first_exercise()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.workout_exercises
    where workout_exercises.workout_day_id = new.workout_day_id
  ) then
    update public.workout_days
    set schedule_started_on =
      ((now() at time zone 'America/Mexico_City')::date)
    where workout_days.id = new.workout_day_id;
  end if;

  return new;
end;
$$;

drop trigger if exists refresh_workout_day_schedule_on_first_exercise
  on public.workout_exercises;
create trigger refresh_workout_day_schedule_on_first_exercise
  before insert on public.workout_exercises
  for each row
  execute function public.refresh_workout_day_schedule_on_first_exercise();

revoke all on function public.refresh_workout_day_schedule_on_weekday()
  from public;
revoke all on function public.refresh_workout_day_schedule_on_first_exercise()
  from public;

-- Permite asegurar que la rutina completada pertenece al mismo cliente.
create unique index if not exists workout_days_id_client_id_unique_idx
  on public.workout_days (id, client_id);

create table if not exists public.workout_day_completions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  workout_day_id uuid not null,
  completed_on date not null,
  created_at timestamptz not null default now(),
  constraint workout_day_completions_workout_client_fk
    foreign key (workout_day_id, client_id)
    references public.workout_days(id, client_id)
    on delete cascade,
  constraint workout_day_completions_day_date_unique
    unique (workout_day_id, completed_on)
);

create index if not exists workout_day_completions_client_date_idx
  on public.workout_day_completions (client_id, completed_on desc);

alter table public.workout_day_completions enable row level security;

drop policy if exists "Clients can view workout completions"
  on public.workout_day_completions;
create policy "Clients can view workout completions"
  on public.workout_day_completions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = workout_day_completions.client_id
        and clients.user_id = (select auth.uid())
    )
  );

drop policy if exists "Coaches can view client workout completions"
  on public.workout_day_completions;
create policy "Coaches can view client workout completions"
  on public.workout_day_completions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = workout_day_completions.client_id
        and clients.coach_id = (select auth.uid())
    )
  );

revoke all on table public.workout_day_completions from anon, authenticated;
grant select on table public.workout_day_completions to authenticated;

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
  today_in_mexico date :=
    ((now() at time zone 'America/Mexico_City')::date);
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

  if not target_completed then
    delete from public.workout_day_completions
    where workout_day_completions.workout_day_id = target_workout_day_id
      and workout_day_completions.client_id = workout_client_id
      and workout_day_completions.completed_on = target_completed_on;

    return false;
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
  on conflict (workout_day_id, completed_on) do nothing;

  return true;
end;
$$;

revoke all on function public.set_workout_day_completed(uuid, date, boolean)
  from public;
grant execute on function public.set_workout_day_completed(uuid, date, boolean)
  to authenticated;

comment on table public.workout_day_completions is
  'Palomitas del calendario de entrenamiento registradas por el cliente.';

comment on column public.clients.workout_tracking_started_on is
  'Primera fecha que puede contar como cumplimiento o falta en el calendario.';

comment on column public.workout_days.schedule_started_on is
  'Inicio de la etapa actual del día semanal asignado a esta rutina.';

notify pgrst, 'reload schema';

commit;
