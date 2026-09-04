begin;

alter table public.workout_exercises
  add column if not exists series_group_id uuid;

create index if not exists workout_exercises_series_group_position_idx
  on public.workout_exercises (workout_day_id, series_group_id, position)
  where series_group_id is not null;

comment on column public.workout_exercises.series_group_id is
  'UUID compartido por los ejercicios de una biserie, triserie o serie combinada.';

commit;
