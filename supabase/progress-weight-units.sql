begin;

-- Conserva weight_kg como valor canónico para poder comparar registros,
-- y guarda por separado el valor exacto y la unidad que escribió el cliente.
alter table public.exercise_progress_logs
  add column if not exists weight_value numeric(8, 2),
  add column if not exists weight_unit text;

-- Los registros creados antes de esta actualización estaban expresados en kg.
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

-- La tabla usa permisos de INSERT por columna; las columnas nuevas también
-- deben concederse al rol autenticado. Las políticas RLS existentes siguen
-- limitando la escritura al cliente dueño de la bitácora.
grant insert (
  weight_value,
  weight_unit
) on table public.exercise_progress_logs to authenticated;

comment on column public.exercise_progress_logs.weight_value is
  'Valor exacto de la carga en la unidad elegida por el cliente.';

comment on column public.exercise_progress_logs.weight_unit is
  'Unidad original de la carga: kg o lb.';

notify pgrst, 'reload schema';

commit;
