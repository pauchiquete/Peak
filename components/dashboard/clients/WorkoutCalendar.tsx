"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  formatDateKey,
  formatWorkoutCalendarDate,
  getMexicoCityDateKey,
  getScheduledWorkoutDaysForDate,
  getWorkoutCalendarStatus,
  getWorkoutCompletionKey,
  parseDateKey,
  type WorkoutCalendarDay,
  type WorkoutCompletionEntry,
} from "@/lib/workout-calendar";

export type ClientWorkoutCalendarDay = WorkoutCalendarDay;

export type ClientWorkoutCompletion = Pick<
  WorkoutCompletionEntry,
  "workout_day_id" | "completed_on"
>;

export type ClientWorkoutCalendarProps = {
  days: readonly ClientWorkoutCalendarDay[];
  completions: readonly ClientWorkoutCompletion[];
  trackingStartedOn: string | null;
  storageReady: boolean;
  savingKey: string | null;
  onToggleCompletion?: (
    workoutDayId: string,
    date: string,
    nextCompleted: boolean
  ) => void | Promise<void>;
  readOnly?: boolean;
  today?: string;
  initialMonth?: string;
};

const WEEKDAY_LABELS = [
  { short: "L", medium: "Lun", long: "Lunes" },
  { short: "M", medium: "Mar", long: "Martes" },
  { short: "M", medium: "Mié", long: "Miércoles" },
  { short: "J", medium: "Jue", long: "Jueves" },
  { short: "V", medium: "Vie", long: "Viernes" },
  { short: "S", medium: "Sáb", long: "Sábado" },
  { short: "D", medium: "Dom", long: "Domingo" },
] as const;

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12));
}

function shiftMonth(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12)
  );
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("es-MX") + value.slice(1);
}

export function getWorkoutCalendarSavingKey(workoutDayId: string, date: string) {
  return getWorkoutCompletionKey(workoutDayId, date);
}

export default function ClientWorkoutCalendar({
  days,
  completions = [],
  trackingStartedOn,
  storageReady,
  savingKey,
  onToggleCompletion,
  readOnly = false,
  today,
  initialMonth,
}: ClientWorkoutCalendarProps) {
  const headingId = useId();
  const todayKey = useMemo(
    () => (today && parseDateKey(today) ? today : getMexicoCityDateKey()),
    [today]
  );
  const resolvedToday = parseDateKey(todayKey) ?? new Date();
  const trackingStartKey =
    trackingStartedOn && parseDateKey(trackingStartedOn)
      ? trackingStartedOn
      : todayKey;
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(
      (initialMonth ? parseDateKey(initialMonth) : null) ?? resolvedToday
    )
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    todayKey
  );
  const lastTodayKey = useRef(todayKey);

  useEffect(() => {
    if (lastTodayKey.current === todayKey) return;

    lastTodayKey.current = todayKey;
    const newToday = parseDateKey(todayKey);

    if (!newToday) return;

    setVisibleMonth(startOfMonth(newToday));
    setSelectedDateKey(todayKey);
  }, [todayKey]);

  const activeDays = useMemo(
    () => days.filter((day) => day.exercises.length > 0),
    [days]
  );

  const completedKeys = useMemo(() => {
    const keys = new Set<string>();

    completions.forEach((completion) => {
      if (!parseDateKey(completion.completed_on)) return;

      keys.add(
        getWorkoutCalendarSavingKey(
          completion.workout_day_id,
          completion.completed_on
        )
      );
    });

    return keys;
  }, [completions]);

  const completionDayIdsByDate = useMemo(() => {
    const idsByDate = new Map<string, Set<string>>();

    completions.forEach((completion) => {
      if (!parseDateKey(completion.completed_on)) return;

      const dayIds = idsByDate.get(completion.completed_on) ?? new Set();
      dayIds.add(completion.workout_day_id);
      idsByDate.set(completion.completed_on, dayIds);
    });

    return idsByDate;
  }, [completions]);

  function getAssignedDays(dateKey: string) {
    const scheduledDays = getScheduledWorkoutDaysForDate(
      activeDays,
      dateKey,
      trackingStartKey
    );
    const scheduledDayIds = new Set(scheduledDays.map((day) => day.id));
    const historicallyCompletedDayIds =
      completionDayIdsByDate.get(dateKey);

    if (!historicallyCompletedDayIds) return scheduledDays;

    const historicalDays = days.filter(
      (day) =>
        historicallyCompletedDayIds.has(day.id) &&
        !scheduledDayIds.has(day.id)
    );

    return [...scheduledDays, ...historicalDays];
  }

  const calendarDates = useMemo(() => {
    const year = visibleMonth.getUTCFullYear();
    const month = visibleMonth.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0, 12));
    const daysInMonth = lastDay.getUTCDate();
    const firstDay = new Date(Date.UTC(year, month, 1, 12));
    const mondayFirstOffset = (firstDay.getUTCDay() + 6) % 7;

    return [
      ...Array.from({ length: mondayFirstOffset }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => new Date(Date.UTC(year, month, index + 1, 12))
      ),
    ];
  }, [visibleMonth]);

  const monthProgress = useMemo(() => {
    let eligibleDates = 0;
    let completedDates = 0;

    calendarDates.forEach((date) => {
      if (!date) return;

      const dateKey = formatDateKey(date);
      if (dateKey > todayKey) return;

      const assignedDays = getAssignedDays(dateKey);
      if (assignedDays.length === 0) return;

      eligibleDates += 1;

      if (
        assignedDays.every((day) =>
          completedKeys.has(getWorkoutCalendarSavingKey(day.id, dateKey))
        )
      ) {
        completedDates += 1;
      }
    });

    return { completedDates, eligibleDates };
    // These values are included because getAssignedDays reads them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeDays,
    calendarDates,
    completedKeys,
    completionDayIdsByDate,
    days,
    todayKey,
    trackingStartKey,
  ]);

  const selectedDate = selectedDateKey ? parseDateKey(selectedDateKey) : null;
  const selectedDays = selectedDate
    ? getAssignedDays(selectedDateKey ?? "")
    : [];
  const selectedDateLabel = selectedDate
    ? capitalize(
        formatWorkoutCalendarDate(selectedDateKey ?? "", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
    : "";

  function getDateStatus(
    dateKey: string,
    assignedDays: readonly ClientWorkoutCalendarDay[]
  ) {
    return getWorkoutCalendarStatus(
      assignedDays,
      completions,
      dateKey,
      todayKey,
      storageReady
    );
  }

  function changeMonth(amount: number) {
    setVisibleMonth((current) => shiftMonth(current, amount));
    setSelectedDateKey(null);
  }

  function returnToToday() {
    setVisibleMonth(startOfMonth(resolvedToday));
    setSelectedDateKey(todayKey);
  }

  const visibleMonthKey = formatDateKey(visibleMonth);
  const trackingMonthKey = `${trackingStartKey.slice(0, 7)}-01`;
  const currentMonthKey = formatDateKey(startOfMonth(resolvedToday));
  const canViewPreviousMonth = visibleMonthKey > trackingMonthKey;
  const canViewNextMonth = visibleMonthKey < currentMonthKey;
  const monthLabel = capitalize(
    formatWorkoutCalendarDate(visibleMonthKey, {
      month: "long",
      year: "numeric",
    })
  );

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-7"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[var(--muted)]">
            {readOnly ? "Constancia del cliente" : "Mi constancia"}
          </p>
          <h2 id={headingId} className="mt-2 text-3xl font-black tracking-tight">
            {monthLabel}
          </h2>
          <p
            className="mt-2 text-sm font-bold text-[var(--muted)]"
            aria-live="polite"
          >
            {!storageReady
              ? "El seguimiento estará disponible al actualizar Supabase"
              : monthProgress.eligibleDates > 0
                ? `${monthProgress.completedDates} de ${
                    monthProgress.eligibleDates
                  } día${
                    monthProgress.eligibleDates === 1 ? "" : "s"
                  } completado${
                    monthProgress.completedDates === 1 ? "" : "s"
                  }`
                : "No hay entrenamientos programados en este periodo"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            disabled={!canViewPreviousMonth}
            aria-label="Ver mes anterior"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] transition hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={returnToToday}
            className="h-11 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] active:scale-95"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={!canViewNextMonth}
            aria-label="Ver mes siguiente"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] transition hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
        {readOnly
          ? "Selecciona un día para ver qué rutinas completó el cliente. Solo él puede marcar sus entrenamientos."
          : "Selecciona un día con entrenamiento para ver el detalle y marcarlo como realizado."}
      </p>

      {!storageReady && (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm font-bold leading-6 text-amber-700 dark:text-amber-300"
        >
          El calendario está en vista previa. Falta activar el seguimiento en
          Supabase.
        </p>
      )}

      <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2" role="grid" aria-label={monthLabel}>
        {WEEKDAY_LABELS.map((weekday) => (
          <div key={weekday.long} role="columnheader" aria-label={weekday.long} className="pb-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs">
            <span className="sm:hidden" aria-hidden="true">{weekday.short}</span>
            <span className="hidden sm:inline" aria-hidden="true">{weekday.medium}</span>
          </div>
        ))}

        {calendarDates.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} role="gridcell" aria-hidden="true" />;
          }

          const dateKey = formatDateKey(date);
          const assignedDays = getAssignedDays(dateKey);
          const hasWorkout = assignedDays.length > 0;
          const status = hasWorkout ? getDateStatus(dateKey, assignedDays) : null;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;
          const fullDateLabel = capitalize(
            formatWorkoutCalendarDate(dateKey, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          );
          const statusLabel =
            status === "complete"
              ? "completado"
              : status === "missed"
                ? "sin completar"
                : dateKey === todayKey
                  ? "programado para hoy"
                  : "programado";

          return (
            <div key={dateKey} role="gridcell">
              <button
                type="button"
                onClick={() => hasWorkout && setSelectedDateKey(dateKey)}
                disabled={!hasWorkout}
                aria-current={isToday ? "date" : undefined}
                aria-pressed={hasWorkout ? isSelected : undefined}
                aria-label={`${fullDateLabel}${
                  hasWorkout
                    ? `: ${assignedDays.length} entrenamiento${assignedDays.length === 1 ? "" : "s"}, ${statusLabel}`
                    : ": sin entrenamiento asignado"
                }`}
                className={`flex min-h-[72px] w-full flex-col rounded-2xl border p-1.5 text-left transition sm:min-h-[88px] sm:p-2 ${
                  isSelected
                    ? "border-[var(--text)] bg-[var(--surface-strong)]"
                    : isToday
                      ? "border-[var(--text)] bg-[var(--bg)]"
                      : "border-transparent"
                } ${
                  hasWorkout
                    ? "cursor-pointer hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] active:scale-[0.98]"
                    : "cursor-default"
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black sm:h-7 sm:w-7 sm:text-sm ${isToday ? "bg-[var(--button-bg)] text-[var(--button-text)]" : "text-[var(--text)]"}`}>
                  {date.getUTCDate()}
                </span>

                {status && (
                  <span
                    aria-hidden="true"
                    className={`mt-auto h-3.5 w-3.5 self-center rounded-full border sm:h-4 sm:w-4 ${
                      status === "complete"
                        ? "border-emerald-600 bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                        : status === "missed"
                          ? "border-red-600 bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                          : "border-[var(--border)] bg-[var(--surface-strong)]"
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-[var(--border)] pt-5 text-xs font-bold text-[var(--muted)]">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />Completado</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />Sin completar</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-[var(--border)] bg-[var(--surface-strong)]" aria-hidden="true" />Hoy o próximo</span>
      </div>

      {selectedDate && selectedDays.length > 0 && (
        <div className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-5" aria-live="polite">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">{selectedDateLabel}</p>

          <div className="mt-4 grid gap-3">
            {selectedDays.map((day) => {
              const completionKey = getWorkoutCalendarSavingKey(day.id, selectedDateKey ?? "");
              const completed = completedKeys.has(completionKey);
              const saving = savingKey === completionKey;
              const future = (selectedDateKey ?? "") > todayKey;

              return (
                <div key={day.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-black text-[var(--text)]">{day.title}</p>
                    <p className={`mt-1 text-xs font-black uppercase tracking-[0.12em] ${completed ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--muted)]"}`}>
                      {completed
                        ? "✓ Entrenamiento completado"
                        : future
                          ? "Próximo entrenamiento"
                          : storageReady
                            ? "Pendiente de completar"
                            : "Seguimiento pendiente de activar"}
                    </p>
                  </div>

                  {!readOnly && !future && (
                    <button
                      type="button"
                      onClick={() => void onToggleCompletion?.(day.id, selectedDateKey ?? "", !completed)}
                      disabled={!storageReady || savingKey !== null}
                      aria-pressed={completed}
                      className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${completed ? "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]" : "bg-[var(--button-bg)] text-[var(--button-text)]"}`}
                    >
                      {saving ? "Guardando..." : completed ? "Desmarcar" : "✓ Marcar como hecho"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
