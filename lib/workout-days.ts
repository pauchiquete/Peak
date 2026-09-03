export const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export function sortWorkoutDays<T extends { day_of_week: string | null }>(
  days: readonly T[]
) {
  return days
    .map((day, originalIndex) => ({ day, originalIndex }))
    .sort((first, second) => {
      const firstIndex = WEEK_DAYS.findIndex(
        (weekDay) => weekDay === first.day.day_of_week
      );
      const secondIndex = WEEK_DAYS.findIndex(
        (weekDay) => weekDay === second.day.day_of_week
      );
      const normalizedFirstIndex =
        firstIndex === -1 ? WEEK_DAYS.length : firstIndex;
      const normalizedSecondIndex =
        secondIndex === -1 ? WEEK_DAYS.length : secondIndex;

      return (
        normalizedFirstIndex - normalizedSecondIndex ||
        first.originalIndex - second.originalIndex
      );
    })
    .map(({ day }) => day);
}
