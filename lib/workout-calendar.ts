import { WEEK_DAYS } from "@/lib/workout-days";

export const WORKOUT_CALENDAR_TIME_ZONE = "America/Mexico_City";

export type WorkoutCompletionEntry = {
  id: string;
  client_id: string;
  workout_day_id: string;
  completed_on: string;
  created_at: string;
};

export type WorkoutCalendarDay = {
  id: string;
  title: string;
  day_of_week: string | null;
  created_at: string;
  schedule_started_on: string | null;
  exercises: readonly unknown[];
};

export type WorkoutCalendarStatus =
  | "none"
  | "complete"
  | "missed"
  | "pending"
  | "unavailable";

function removeAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getWorkoutWeekDayIndex(dayOfWeek: string | null) {
  if (!dayOfWeek) return -1;

  const normalizedDay = removeAccents(dayOfWeek.trim().toLowerCase());

  return WEEK_DAYS.findIndex(
    (weekDay) =>
      removeAccents(weekDay.toLowerCase()) === normalizedDay
  );
}

function datePartsInMexicoCity(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WORKOUT_CALENDAR_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const getPart = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
}

export function getMexicoCityDateKey(date = new Date()) {
  const { year, month, day } = datePartsInMexicoCity(date);
  return `${year}-${month}-${day}`;
}

export function getMexicoCityDateKeyFromTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : getMexicoCityDateKey(date);
}

export function parseDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);

  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDateKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);

  if (!date) return dateKey;

  date.setUTCDate(date.getUTCDate() + amount);
  return formatDateKey(date);
}

export function getDateWeekDayIndex(dateKey: string) {
  const date = parseDateKey(dateKey);

  if (!date) return -1;

  return (date.getUTCDay() + 6) % 7;
}

export function getWorkoutDayStartDate(
  day: Pick<WorkoutCalendarDay, "created_at" | "schedule_started_on">,
  trackingStartedOn: string
) {
  const createdOn = getMexicoCityDateKeyFromTimestamp(day.created_at);
  const scheduleStartedOn =
    day.schedule_started_on && parseDateKey(day.schedule_started_on)
      ? day.schedule_started_on
      : null;

  return (
    [trackingStartedOn, createdOn, scheduleStartedOn]
      .filter((date): date is string => Boolean(date))
      .sort()
      .at(-1) ?? trackingStartedOn
  );
}

export function getScheduledWorkoutDaysForDate<T extends WorkoutCalendarDay>(
  days: readonly T[],
  dateKey: string,
  trackingStartedOn: string
) {
  const dateWeekDayIndex = getDateWeekDayIndex(dateKey);

  if (dateWeekDayIndex === -1) return [];

  return days.filter((day) => {
    if (day.exercises.length === 0) return false;

    const workoutWeekDayIndex = getWorkoutWeekDayIndex(day.day_of_week);

    return (
      workoutWeekDayIndex === dateWeekDayIndex &&
      dateKey >= getWorkoutDayStartDate(day, trackingStartedOn)
    );
  });
}

export function getWorkoutCompletionKey(
  workoutDayId: string,
  completedOn: string
) {
  return `${workoutDayId}:${completedOn}`;
}

export function getWorkoutCalendarStatus(
  scheduledDays: readonly Pick<WorkoutCalendarDay, "id">[],
  completions: readonly Pick<
    WorkoutCompletionEntry,
    "workout_day_id" | "completed_on"
  >[],
  dateKey: string,
  today: string,
  storageReady: boolean
): WorkoutCalendarStatus {
  if (scheduledDays.length === 0) return "none";
  if (!storageReady) return "unavailable";

  const completionKeys = new Set(
    completions.map((entry) =>
      getWorkoutCompletionKey(entry.workout_day_id, entry.completed_on)
    )
  );
  const allComplete = scheduledDays.every((day) =>
    completionKeys.has(getWorkoutCompletionKey(day.id, dateKey))
  );

  if (allComplete) return "complete";
  return dateKey < today ? "missed" : "pending";
}

export function getCurrentWeekScheduledDate(
  dayOfWeek: string | null,
  today: string
) {
  const targetIndex = getWorkoutWeekDayIndex(dayOfWeek);
  const todayIndex = getDateWeekDayIndex(today);

  if (targetIndex === -1 || todayIndex === -1) return null;

  return addDaysToDateKey(today, targetIndex - todayIndex);
}

export function formatWorkoutCalendarDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  }
) {
  const date = parseDateKey(dateKey);

  if (!date) return dateKey;

  return new Intl.DateTimeFormat("es-MX", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}
