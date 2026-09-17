begin;

alter table public.routine_template_exercises
  add column if not exists series_group_id uuid;

create index if not exists routine_template_exercises_series_group_position_idx
  on public.routine_template_exercises (template_id, series_group_id, position)
  where series_group_id is not null;

comment on column public.routine_template_exercises.series_group_id is
  'UUID compartido por los ejercicios de una biserie, triserie o serie combinada dentro de una plantilla.';

commit;
