export const PROGRESS_REMINDER_DAYS = 14;

export type ExerciseProgressEntry = {
  id: string;
  client_id: string;
  exercise_id: string;
  workout_exercise_id: string | null;
  weight_kg: number;
  reps: number | null;
  notes: string | null;
  recorded_on: string;
  created_at: string;
};

export function sortProgressEntries(
  entries: readonly ExerciseProgressEntry[]
) {
  return [...entries].sort((first, second) => {
    const dateComparison = second.recorded_on.localeCompare(first.recorded_on);

    if (dateComparison !== 0) return dateComparison;

    return second.created_at.localeCompare(first.created_at);
  });
}

export function getProgressReminder(
  entries: readonly ExerciseProgressEntry[],
  now = new Date()
) {
  const latestEntry = sortProgressEntries(entries)[0] ?? null;

  if (!latestEntry) {
    return {
      latestEntry: null,
      isDue: false,
      daysSinceLastEntry: null,
      daysUntilReminder: PROGRESS_REMINDER_DAYS,
    };
  }

  const [year, month, day] = latestEntry.recorded_on.split("-").map(Number);
  const entryDate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceLastEntry = Math.max(
    0,
    Math.floor((today.getTime() - entryDate.getTime()) / 86_400_000)
  );

  return {
    latestEntry,
    isDue: daysSinceLastEntry >= PROGRESS_REMINDER_DAYS,
    daysSinceLastEntry,
    daysUntilReminder: Math.max(
      0,
      PROGRESS_REMINDER_DAYS - daysSinceLastEntry
    ),
  };
}

export function isBiweeklyProgressPromptDue(
  entries: readonly ExerciseProgressEntry[],
  lastPromptedAt: string | null,
  now = new Date()
) {
  if (entries.length === 0) return false;

  const anchorTime = lastPromptedAt
    ? new Date(lastPromptedAt).getTime()
    : Math.min(...entries.map((entry) => new Date(entry.created_at).getTime()));

  if (!Number.isFinite(anchorTime)) return false;

  return now.getTime() - anchorTime >= PROGRESS_REMINDER_DAYS * 86_400_000;
}

export function formatWeight(weight: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(weight);
}

export function formatProgressDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
