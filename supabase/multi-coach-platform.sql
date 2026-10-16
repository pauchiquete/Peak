-- Peak · plataforma multi-entrenador
-- Ejecutar una sola vez en Supabase SQL Editor después de las migraciones
-- de bitácora y calendario. Es idempotente y conserva los registros actuales.

begin;

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists is_head_coach boolean not null default false,
  add column if not exists is_demo boolean not null default false,
  add column if not exists coach_slug text,
  add column if not exists whatsapp_phone text;

create unique index if not exists profiles_coach_slug_unique_idx
  on public.profiles (coach_slug)
  where coach_slug is not null;

-- Las cuentas compartidas de demostración no pueden cambiar correo, teléfono
-- ni contraseña desde una sesión normal. El script administrativo de reset
-- usa una marca de app_metadata que un usuario no puede establecer por sí mismo.
create or replace function public.protect_peak_demo_auth_credentials()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if exists (
    select 1
    from public.profiles
    where profiles.id = old.id
      and profiles.is_demo = true
  )
  and (
    new.email is distinct from old.email
    or new.phone is distinct from old.phone
    or new.encrypted_password is distinct from old.encrypted_password
  )
  and coalesce(
    (new.raw_app_meta_data ->> 'peak_demo_reset_until')::timestamptz,
    '-infinity'::timestamptz
  ) <= clock_timestamp() then
    raise exception 'Las credenciales de la cuenta demo están protegidas.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_peak_demo_auth_credentials on auth.users;
create trigger protect_peak_demo_auth_credentials
  before update on auth.users
  for each row execute function public.protect_peak_demo_auth_credentials();

revoke all on function public.protect_peak_demo_auth_credentials() from public;

alter table public.exercises
  add column if not exists owner_coach_id uuid references public.profiles(id) on delete restrict,
  add column if not exists is_shared_base boolean not null default false,
  add column if not exists archived_at timestamptz;

do $$
declare
  head_coach_id uuid;
begin
  select profiles.id
    into head_coach_id
  from public.profiles
  where profiles.role = 'coach'
    and lower(coalesce(profiles.email, '')) = 'sebgnzlzram@gmail.com'
  limit 1;

  if head_coach_id is null then
    raise exception 'No se encontró el perfil coach de Sebastián con correo sebgnzlzram@gmail.com. Corrige ese perfil antes de ejecutar la migración; el acceso Head Coach nunca se asigna por aproximación.';
  end if;

  update public.profiles
  set is_head_coach = (id = head_coach_id)
  where role = 'coach';

  update public.profiles
  set
    coach_slug = coalesce(coach_slug, 'sebastian-gonzalez'),
    whatsapp_phone = coalesce(nullif(regexp_replace(whatsapp_phone, '[^0-9]', '', 'g'), ''), '525548792525')
  where id = head_coach_id;

  -- Sólo las filas previas a esta migración tienen owner nulo. Se convierten
  -- en la biblioteca canónica de Sebastián sin cambiar sus UUID.
  update public.exercises
  set
    owner_coach_id = head_coach_id,
    is_shared_base = true
  where owner_coach_id is null;
end
$$;

create index if not exists exercises_owner_active_idx
  on public.exercises (owner_coach_id, archived_at);

create index if not exists exercises_shared_active_idx
  on public.exercises (is_shared_base, archived_at);

create table if not exists public.exercise_overrides (
  coach_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  name text not null,
  muscle_group text not null,
  body_region text,
  video_url text,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (coach_id, exercise_id)
);

create index if not exists exercise_overrides_coach_hidden_idx
  on public.exercise_overrides (coach_id, hidden);

create or replace function public.set_peak_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_exercise_overrides_updated_at
  on public.exercise_overrides;
create trigger set_exercise_overrides_updated_at
  before update on public.exercise_overrides
  for each row execute function public.set_peak_updated_at();

create or replace function public.validate_peak_exercise_override()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.exercises
    where exercises.id = new.exercise_id
      and exercises.is_shared_base = true
  ) then
    raise exception 'Sólo se pueden personalizar ejercicios de la biblioteca Peak.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_peak_exercise_override
  on public.exercise_overrides;
create trigger validate_peak_exercise_override
  before insert or update on public.exercise_overrides
  for each row execute function public.validate_peak_exercise_override();

create or replace function public.peak_is_coach(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select profiles.role = 'coach'
    from public.profiles
    where profiles.id = target_user_id
  ), false);
$$;

create or replace function public.peak_is_head_coach(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select profiles.role = 'coach' and profiles.is_head_coach
    from public.profiles
    where profiles.id = target_user_id
  ), false);
$$;

create or replace function public.peak_is_demo_coach(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select profiles.role = 'coach' and profiles.is_demo
    from public.profiles
    where profiles.id = target_user_id
  ), false);
$$;

create or replace function public.peak_client_coach_id(target_user_id uuid default auth.uid())
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clients.coach_id
  from public.clients
  where clients.user_id = target_user_id
  order by clients.created_at asc, clients.id asc
  limit 1;
$$;

revoke all on function public.peak_is_coach(uuid) from public;
revoke all on function public.peak_is_head_coach(uuid) from public;
revoke all on function public.peak_is_demo_coach(uuid) from public;
revoke all on function public.peak_client_coach_id(uuid) from public;
grant execute on function public.peak_is_coach(uuid) to authenticated;
grant execute on function public.peak_is_head_coach(uuid) to authenticated;
grant execute on function public.peak_is_demo_coach(uuid) to authenticated;
grant execute on function public.peak_client_coach_id(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_overrides enable row level security;
alter table public.routine_templates enable row level security;
alter table public.routine_template_exercises enable row level security;
alter table public.workout_days enable row level security;
alter table public.workout_exercises enable row level security;

-- Las políticas permisivas se combinan con OR. Por eso reemplazamos todas las
-- políticas de las tablas núcleo en lugar de sólo agregar políticas nuevas.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'profiles',
        'clients',
        'exercises',
        'exercise_overrides',
        'routine_templates',
        'routine_template_exercises',
        'workout_days',
        'workout_exercises'
      ])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;

-- Perfiles: nadie puede cambiar role/is_head_coach/is_demo desde el navegador.
create policy "Peak profiles visible by relationship"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or public.peak_is_head_coach()
    or exists (
      select 1
      from public.clients
      where clients.coach_id = (select auth.uid())
        and clients.user_id = profiles.id
    )
    or exists (
      select 1
      from public.clients
      where clients.user_id = (select auth.uid())
        and clients.coach_id = profiles.id
    )
  );

-- Clientes: cada coach administra sólo los suyos; Sebastián ve todos.
create policy "Peak clients select"
  on public.clients
  for select
  to authenticated
  using (
    coach_id = (select auth.uid())
    or user_id = (select auth.uid())
    or public.peak_is_head_coach()
  );

create policy "Peak clients insert own"
  on public.clients
  for insert
  to authenticated
  with check (
    coach_id = (select auth.uid())
    and public.peak_is_coach()
    and not public.peak_is_demo_coach()
    and user_id is null
  );

create policy "Peak clients update own"
  on public.clients
  for update
  to authenticated
  using (
    coach_id = (select auth.uid())
    and not public.peak_is_demo_coach()
  )
  with check (
    coach_id = (select auth.uid())
    and not public.peak_is_demo_coach()
  );

create policy "Peak clients delete own"
  on public.clients
  for delete
  to authenticated
  using (
    coach_id = (select auth.uid())
    and not public.peak_is_demo_coach()
  );

-- Biblioteca canónica + ejercicios privados.
create policy "Peak exercises select"
  on public.exercises
  for select
  to authenticated
  using (
    public.peak_is_head_coach()
    or is_shared_base
    or owner_coach_id = (select auth.uid())
    or owner_coach_id = public.peak_client_coach_id()
  );

create policy "Peak exercises insert own"
  on public.exercises
  for insert
  to authenticated
  with check (
    owner_coach_id = (select auth.uid())
    and public.peak_is_coach()
    and (not is_shared_base or public.peak_is_head_coach())
  );

create policy "Peak exercises update own"
  on public.exercises
  for update
  to authenticated
  using (owner_coach_id = (select auth.uid()))
  with check (
    owner_coach_id = (select auth.uid())
    and (not is_shared_base or public.peak_is_head_coach())
  );

create policy "Peak exercises delete own"
  on public.exercises
  for delete
  to authenticated
  using (owner_coach_id = (select auth.uid()));

create policy "Peak exercise overrides select"
  on public.exercise_overrides
  for select
  to authenticated
  using (
    coach_id = (select auth.uid())
    or public.peak_is_head_coach()
    or coach_id = public.peak_client_coach_id()
  );

create policy "Peak exercise overrides insert own"
  on public.exercise_overrides
  for insert
  to authenticated
  with check (
    coach_id = (select auth.uid())
    and public.peak_is_coach()
    and exists (
      select 1
      from public.exercises
      where exercises.id = exercise_overrides.exercise_id
        and exercises.is_shared_base
    )
  );

create policy "Peak exercise overrides update own"
  on public.exercise_overrides
  for update
  to authenticated
  using (coach_id = (select auth.uid()))
  with check (
    coach_id = (select auth.uid())
    and exists (
      select 1
      from public.exercises
      where exercises.id = exercise_overrides.exercise_id
        and exercises.is_shared_base
    )
  );

create policy "Peak exercise overrides delete own"
  on public.exercise_overrides
  for delete
  to authenticated
  using (coach_id = (select auth.uid()));

-- Plantillas: privadas por coach; Head Coach tiene supervisión de lectura.
create policy "Peak templates select"
  on public.routine_templates
  for select
  to authenticated
  using (coach_id = (select auth.uid()) or public.peak_is_head_coach());

create policy "Peak templates insert own"
  on public.routine_templates
  for insert
  to authenticated
  with check (coach_id = (select auth.uid()) and public.peak_is_coach());

create policy "Peak templates update own"
  on public.routine_templates
  for update
  to authenticated
  using (coach_id = (select auth.uid()))
  with check (coach_id = (select auth.uid()));

create policy "Peak templates delete own"
  on public.routine_templates
  for delete
  to authenticated
  using (coach_id = (select auth.uid()));

create policy "Peak template exercises select"
  on public.routine_template_exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.routine_templates
      where routine_templates.id = routine_template_exercises.template_id
        and (
          routine_templates.coach_id = (select auth.uid())
          or public.peak_is_head_coach()
        )
    )
  );

create policy "Peak template exercises insert own"
  on public.routine_template_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.routine_templates
      where routine_templates.id = routine_template_exercises.template_id
        and routine_templates.coach_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises
      where exercises.id = routine_template_exercises.exercise_id
        and (
          exercises.is_shared_base
          or exercises.owner_coach_id = (select auth.uid())
        )
    )
  );

create policy "Peak template exercises update own"
  on public.routine_template_exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.routine_templates
      where routine_templates.id = routine_template_exercises.template_id
        and routine_templates.coach_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.routine_templates
      where routine_templates.id = routine_template_exercises.template_id
        and routine_templates.coach_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises
      where exercises.id = routine_template_exercises.exercise_id
        and (
          exercises.is_shared_base
          or exercises.owner_coach_id = (select auth.uid())
        )
    )
  );

create policy "Peak template exercises delete own"
  on public.routine_template_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.routine_templates
      where routine_templates.id = routine_template_exercises.template_id
        and routine_templates.coach_id = (select auth.uid())
    )
  );

-- Rutinas de clientes.
create policy "Peak workout days select"
  on public.workout_days
  for select
  to authenticated
  using (
    coach_id = (select auth.uid())
    or public.peak_is_head_coach()
    or exists (
      select 1
      from public.clients
      where clients.id = workout_days.client_id
        and clients.user_id = (select auth.uid())
    )
  );

create policy "Peak workout days insert own"
  on public.workout_days
  for insert
  to authenticated
  with check (
    coach_id = (select auth.uid())
    and exists (
      select 1
      from public.clients
      where clients.id = workout_days.client_id
        and clients.coach_id = (select auth.uid())
    )
  );

create policy "Peak workout days update own"
  on public.workout_days
  for update
  to authenticated
  using (coach_id = (select auth.uid()))
  with check (
    coach_id = (select auth.uid())
    and exists (
      select 1
      from public.clients
      where clients.id = workout_days.client_id
        and clients.coach_id = (select auth.uid())
    )
  );

create policy "Peak workout days delete own"
  on public.workout_days
  for delete
  to authenticated
  using (coach_id = (select auth.uid()));

create policy "Peak workout exercises select"
  on public.workout_exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_days
      left join public.clients on clients.id = workout_days.client_id
      where workout_days.id = workout_exercises.workout_day_id
        and (
          workout_days.coach_id = (select auth.uid())
          or clients.user_id = (select auth.uid())
          or public.peak_is_head_coach()
        )
    )
  );

create policy "Peak workout exercises insert own"
  on public.workout_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workout_days
      where workout_days.id = workout_exercises.workout_day_id
        and workout_days.coach_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises
      where exercises.id = workout_exercises.exercise_id
        and (
          exercises.is_shared_base
          or exercises.owner_coach_id = (select auth.uid())
        )
    )
  );

create policy "Peak workout exercises update own"
  on public.workout_exercises
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.workout_days
      where workout_days.id = workout_exercises.workout_day_id
        and workout_days.coach_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workout_days
      where workout_days.id = workout_exercises.workout_day_id
        and workout_days.coach_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.exercises
      where exercises.id = workout_exercises.exercise_id
        and (
          exercises.is_shared_base
          or exercises.owner_coach_id = (select auth.uid())
        )
    )
  );

create policy "Peak workout exercises delete own"
  on public.workout_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.workout_days
      where workout_days.id = workout_exercises.workout_day_id
        and workout_days.coach_id = (select auth.uid())
    )
  );

-- La vista de supervisión sólo agrega lectura a los historiales existentes.
drop policy if exists "Peak head coach reads progress" on public.exercise_progress_logs;
create policy "Peak head coach reads progress"
  on public.exercise_progress_logs
  for select
  to authenticated
  using (public.peak_is_head_coach());

drop policy if exists "Peak head coach reads completions" on public.workout_day_completions;
create policy "Peak head coach reads completions"
  on public.workout_day_completions
  for select
  to authenticated
  using (public.peak_is_head_coach());

drop policy if exists "Peak head coach reads calendar" on public.workout_calendar_entries;
create policy "Peak head coach reads calendar"
  on public.workout_calendar_entries
  for select
  to authenticated
  using (public.peak_is_head_coach());

-- Vinculación segura: no permite tomar el login de otro coach.
drop function if exists public.link_client_to_profile(uuid, text);
create function public.link_client_to_profile(
  target_client_id uuid,
  target_email text
)
returns public.clients
language plpgsql
security definer
set search_path = public
as $$
declare
  target_profile_id uuid;
  linked_client public.clients;
begin
  if not public.peak_is_coach() then
    raise exception 'Sólo un coach puede vincular clientes.';
  end if;

  if public.peak_is_demo_coach() then
    raise exception 'La cuenta demo no puede vincular usuarios reales.';
  end if;

  if not exists (
    select 1
    from public.clients
    where clients.id = target_client_id
      and clients.coach_id = auth.uid()
  ) then
    raise exception 'Cliente no encontrado o no autorizado.';
  end if;

  select profiles.id
    into target_profile_id
  from public.profiles
  where lower(profiles.email) = lower(trim(target_email))
    and profiles.role = 'client'
  limit 1;

  if target_profile_id is null then
    raise exception 'No existe un perfil de cliente con ese correo.';
  end if;

  if exists (
    select 1
    from public.clients
    where clients.user_id = target_profile_id
      and clients.id <> target_client_id
  ) then
    raise exception 'Ese acceso ya está vinculado a otro cliente.';
  end if;

  update public.clients
  set
    user_id = target_profile_id,
    email = lower(trim(target_email))
  where clients.id = target_client_id
    and clients.coach_id = auth.uid()
  returning * into linked_client;

  return linked_client;
end;
$$;

revoke all on function public.link_client_to_profile(uuid, text) from public;
grant execute on function public.link_client_to_profile(uuid, text) to authenticated;

drop function if exists public.delete_routine_template(uuid);
create function public.delete_routine_template(target_template_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.routine_templates
    where routine_templates.id = target_template_id
      and routine_templates.coach_id = auth.uid()
  ) then
    raise exception 'Plantilla no encontrada o no autorizada.';
  end if;

  delete from public.routine_template_exercises
  where routine_template_exercises.template_id = target_template_id;

  delete from public.routine_templates
  where routine_templates.id = target_template_id
    and routine_templates.coach_id = auth.uid();
end;
$$;

revoke all on function public.delete_routine_template(uuid) from public;
grant execute on function public.delete_routine_template(uuid) to authenticated;

-- Defensa adicional: crea la unicidad sólo si los datos actuales no contienen
-- una cuenta cliente repetida. Nunca borra ni desvincula registros existentes.
do $$
begin
  if not exists (
    select 1
    from public.clients
    where clients.user_id is not null
    group by clients.user_id
    having count(*) > 1
  ) then
    execute 'create unique index if not exists clients_user_id_unique_idx on public.clients (user_id) where user_id is not null';
  else
    raise notice 'No se creó clients_user_id_unique_idx porque ya existen logins repetidos. Los registros se conservaron; revísalos antes de crear el índice.';
  end if;
end
$$;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

revoke all on table public.clients from anon, authenticated;
grant select, delete on table public.clients to authenticated;
grant update (full_name, email, phone, objective, notes) on table public.clients to authenticated;

revoke all on table public.exercises from anon, authenticated;
grant select, insert, update, delete on table public.exercises to authenticated;

revoke all on table public.exercise_overrides from anon, authenticated;
grant select, insert, update, delete on table public.exercise_overrides to authenticated;

revoke all on table public.routine_templates from anon, authenticated;
grant select, insert, update, delete on table public.routine_templates to authenticated;

revoke all on table public.routine_template_exercises from anon, authenticated;
grant select, insert, update, delete on table public.routine_template_exercises to authenticated;

revoke all on table public.workout_days from anon, authenticated;
grant select, insert, update, delete on table public.workout_days to authenticated;

revoke all on table public.workout_exercises from anon, authenticated;
grant select, insert, update, delete on table public.workout_exercises to authenticated;

comment on table public.exercise_overrides is
  'Personalizaciones privadas de un coach sobre la biblioteca canónica Peak.';
comment on column public.exercises.owner_coach_id is
  'Propietario del ejercicio; los ejercicios base pertenecen al Head Coach.';
comment on column public.exercises.is_shared_base is
  'Indica si el ejercicio forma parte de la biblioteca base visible para todos los coaches.';
comment on column public.exercises.archived_at is
  'Archivo lógico para conservar rutinas, bitácoras e historial referenciados.';

commit;
