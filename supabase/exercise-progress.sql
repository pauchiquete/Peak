begin;

create table if not exists public.exercise_progress_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  weight_kg numeric(7, 2) not null check (weight_kg >= 0 and weight_kg <= 2000),
  weight_value numeric(8, 2),
  weight_unit text not null default 'kg',
  reps integer check (reps is null or (reps > 0 and reps <= 1000)),
  notes text check (notes is null or char_length(notes) <= 500),
  recorded_on date not null default ((now() at time zone 'America/Mexico_City')::date),
  created_at timestamptz not null default now()
);

-- También repara una instalación anterior o parcial de esta migración.
alter table public.exercise_progress_logs
  add column if not exists workout_exercise_id uuid
  references public.workout_exercises(id)
  on delete set null;

alter table public.exercise_progress_logs
  add column if not exists weight_value numeric(8, 2),
  add column if not exists weight_unit text;

update public.exercise_progress_logs
set weight_unit = 'kg'
where weight_unit is null;

update public.exercise_progress_logs
set weight_value = weight_kg
where weight_value is null;

-- Permitir NULL mantiene compatible una versión anterior de la app durante
-- el despliegue; la versión nueva siempre guarda este valor.
alter table public.exercise_progress_logs
  alter column weight_value drop not null,
  alter column weight_unit set default 'kg',
  alter column weight_unit set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_progress_logs'::regclass
      and conname = 'exercise_progress_weight_value_range'
  ) then
    alter table public.exercise_progress_logs
      add constraint exercise_progress_weight_value_range
      check (weight_value >= 0 and weight_value <= 5000);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.exercise_progress_logs'::regclass
      and conname = 'exercise_progress_weight_unit_allowed'
  ) then
    alter table public.exercise_progress_logs
      add constraint exercise_progress_weight_unit_allowed
      check (weight_unit in ('kg', 'lb'));
  end if;
end
$$;

create index if not exists exercise_progress_client_exercise_date_idx
  on public.exercise_progress_logs (client_id, exercise_id, recorded_on desc, created_at desc);

create index if not exists exercise_progress_workout_exercise_idx
  on public.exercise_progress_logs (workout_exercise_id)
  where workout_exercise_id is not null;

alter table public.exercise_progress_logs enable row level security;

drop policy if exists "Clients can view their progress" on public.exercise_progress_logs;
create policy "Clients can view their progress"
  on public.exercise_progress_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = exercise_progress_logs.client_id
        and clients.user_id = (select auth.uid())
    )
  );

drop policy if exists "Clients can add their progress" on public.exercise_progress_logs;
create policy "Clients can add their progress"
  on public.exercise_progress_logs
  for insert
  to authenticated
  with check (
    exercise_progress_logs.recorded_on <= ((now() at time zone 'America/Mexico_City')::date)
    and
    exists (
      select 1
      from public.clients
      where clients.id = exercise_progress_logs.client_id
        and clients.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.workout_days
      join public.workout_exercises
        on workout_exercises.workout_day_id = workout_days.id
      where workout_days.client_id = exercise_progress_logs.client_id
        and workout_exercises.id = exercise_progress_logs.workout_exercise_id
        and workout_exercises.exercise_id = exercise_progress_logs.exercise_id
    )
  );

drop policy if exists "Clients can delete their progress" on public.exercise_progress_logs;
create policy "Clients can delete their progress"
  on public.exercise_progress_logs
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = exercise_progress_logs.client_id
        and clients.user_id = (select auth.uid())
    )
  );

drop policy if exists "Coaches can view client progress" on public.exercise_progress_logs;
create policy "Coaches can view client progress"
  on public.exercise_progress_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = exercise_progress_logs.client_id
        and clients.coach_id = (select auth.uid())
    )
  );

revoke all on table public.exercise_progress_logs from anon, authenticated;

grant select, delete on table public.exercise_progress_logs to authenticated;

grant insert (
  client_id,
  exercise_id,
  workout_exercise_id,
  weight_kg,
  weight_value,
  weight_unit,
  reps,
  notes,
  recorded_on
) on table public.exercise_progress_logs to authenticated;

comment on table public.exercise_progress_logs is
  'Bitácora de cargas y repeticiones registrada por cada cliente y ejercicio.';

comment on column public.exercise_progress_logs.weight_value is
  'Valor exacto de la carga en la unidad elegida por el cliente.';

comment on column public.exercise_progress_logs.weight_unit is
  'Unidad original de la carga: kg o lb.';

create table if not exists public.client_progress_reminder_state (
  client_id uuid primary key references public.clients(id) on delete cascade,
  last_prompted_at timestamptz not null default now()
);

alter table public.client_progress_reminder_state enable row level security;

drop policy if exists "Clients can view their progress reminder" on public.client_progress_reminder_state;
create policy "Clients can view their progress reminder"
  on public.client_progress_reminder_state
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clients
      where clients.id = client_progress_reminder_state.client_id
        and clients.user_id = (select auth.uid())
    )
  );

revoke all on table public.client_progress_reminder_state from anon, authenticated;
grant select on table public.client_progress_reminder_state to authenticated;

create or replace function public.mark_client_progress_prompt_shown(
  target_client_id uuid
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  shown_at timestamptz := now();
begin
  if not exists (
    select 1
    from public.clients
    where clients.id = target_client_id
      and clients.user_id = auth.uid()
  ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  insert into public.client_progress_reminder_state (client_id, last_prompted_at)
  values (target_client_id, shown_at)
  on conflict (client_id)
  do update set last_prompted_at = excluded.last_prompted_at;

  return shown_at;
end;
$$;

revoke all on function public.mark_client_progress_prompt_shown(uuid) from public;
grant execute on function public.mark_client_progress_prompt_shown(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
