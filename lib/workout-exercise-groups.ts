export type GroupableWorkoutExercise = {
  id: string;
  position: number;
  series_group_id: string | null;
};

export type WorkoutExerciseBlock<T> = {
  id: string;
  seriesGroupId: string | null;
  exercises: T[];
};

export function getSeriesLabel(exerciseCount: number) {
  if (exerciseCount === 2) return "Biserie";
  if (exerciseCount === 3) return "Triserie";
  if (exerciseCount > 3) return `Serie de ${exerciseCount} ejercicios`;

  return "Serie combinada";
}

export function buildWorkoutExerciseBlocks<
  T extends GroupableWorkoutExercise,
>(exercises: readonly T[]): WorkoutExerciseBlock<T>[] {
  const orderedExercises = [...exercises].sort(
    (first, second) => first.position - second.position
  );
  const blocks: WorkoutExerciseBlock<T>[] = [];
  const groupedBlocks = new Map<string, WorkoutExerciseBlock<T>>();

  orderedExercises.forEach((exercise) => {
    if (!exercise.series_group_id) {
      blocks.push({
        id: `exercise-${exercise.id}`,
        seriesGroupId: null,
        exercises: [exercise],
      });
      return;
    }

    const existingBlock = groupedBlocks.get(exercise.series_group_id);

    if (existingBlock) {
      existingBlock.exercises.push(exercise);
      return;
    }

    const newBlock: WorkoutExerciseBlock<T> = {
      id: `series-${exercise.series_group_id}`,
      seriesGroupId: exercise.series_group_id,
      exercises: [exercise],
    };

    groupedBlocks.set(exercise.series_group_id, newBlock);
    blocks.push(newBlock);
  });

  return blocks;
}

export function flattenWorkoutExerciseBlocks<T extends GroupableWorkoutExercise>(
  exercises: readonly T[]
) {
  return buildWorkoutExerciseBlocks(exercises).flatMap(
    (block) => block.exercises
  );
}
