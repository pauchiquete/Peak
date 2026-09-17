export const PROGRESS_REMINDER_DAYS = 14;

export const KILOGRAMS_PER_POUND = 0.45359237;

export type WeightUnit = "kg" | "lb";

export type ExerciseProgressEntry = {
  id: string;
  client_id: string;
  exercise_id: string;
  workout_exercise_id: string | null;
  weight_kg: number;
  weight_value: number;
  weight_unit: WeightUnit;
  reps: number | null;
  notes: string | null;
  recorded_on: string;
  created_at: string;
};

export type ExerciseProgressEntryFromDb = Omit<
  ExerciseProgressEntry,
  "weight_kg" | "weight_value" | "weight_unit" | "reps"
> & {
  weight_kg: number | string;
  weight_value?: number | string | null;
  weight_unit?: string | null;
  reps: number | string | null;
};

export function isWeightUnit(value: unknown): value is WeightUnit {
  return value === "kg" || value === "lb";
}

export function convertWeightToKg(weight: number, unit: WeightUnit) {
  return unit === "lb" ? weight * KILOGRAMS_PER_POUND : weight;
}

export function convertWeightFromKg(weightKg: number, unit: WeightUnit) {
  return unit === "lb" ? weightKg / KILOGRAMS_PER_POUND : weightKg;
}

export function normalizeProgressEntry(
  entry: ExerciseProgressEntryFromDb
): ExerciseProgressEntry {
  const weightKg = Number(entry.weight_kg);
  const weightUnit: WeightUnit = isWeightUnit(entry.weight_unit)
    ? entry.weight_unit
    : "kg";
  const storedWeightValue =
    entry.weight_value === null || entry.weight_value === undefined
      ? Number.NaN
      : Number(entry.weight_value);

  return {
    ...entry,
    weight_kg: weightKg,
    weight_value: Number.isFinite(storedWeightValue)
      ? storedWeightValue
      : convertWeightFromKg(weightKg, weightUnit),
    weight_unit: weightUnit,
    reps: entry.reps === null ? null : Number(entry.reps),
  };
}

export function isMissingProgressWeightUnitsError(
  error: { code?: string; message?: string } | null
) {
  if (!error) return false;

  const message = error.message?.toLowerCase() ?? "";
  const mentionsWeightUnitColumns =
    message.includes("weight_value") || message.includes("weight_unit");

  return (
    mentionsWeightUnitColumns &&
    (error.code === "PGRST204" ||
      error.code === "42703" ||
      message.includes("schema cache") ||
      message.includes("does not exist") ||
      message.includes("could not find"))
  );
}

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

export function formatProgressWeight(
  entry: Pick<
    ExerciseProgressEntry,
    "weight_kg" | "weight_value" | "weight_unit"
  >
) {
  const weightValue = Number.isFinite(entry.weight_value)
    ? entry.weight_value
    : convertWeightFromKg(entry.weight_kg, entry.weight_unit);

  return `${formatWeight(weightValue)} ${entry.weight_unit}`;
}

export function formatProgressDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
