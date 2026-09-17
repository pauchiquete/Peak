"use client";

import { useEffect, useMemo, useState } from "react";
import RoutineDayToggle from "@/components/dashboard/routines/RoutineDayToggle";
import RoutineSeriesBlock from "@/components/dashboard/routines/RoutineSeriesBlock";
import ExerciseProgressJournal from "@/components/dashboard/clients/ExerciseProgressJournal";
import ClientWorkoutCalendar, {
  getWorkoutCalendarSavingKey,
} from "@/components/dashboard/clients/WorkoutCalendar";
import { createClient } from "@/lib/supabase/client";
import { sortWorkoutDays } from "@/lib/workout-days";
import { buildWorkoutExerciseBlocks } from "@/lib/workout-exercise-groups";
import {
  type ExerciseProgressEntry,
  formatProgressDate,
  formatProgressWeight,
  getProgressReminder,
  isBiweeklyProgressPromptDue,
  sortProgressEntries,
} from "@/lib/exercise-progress";
import {
  addDaysToDateKey,
  formatWorkoutCalendarDate,
  getCurrentWeekScheduledDate,
  getMexicoCityDateKey,
  getWorkoutCompletionKey,
  getWorkoutDayStartDate,
  getWorkoutWeekDayIndex,
  type WorkoutCompletionEntry,
} from "@/lib/workout-calendar";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
};

type WorkoutExercise = {
  id: string;
  workout_day_id: string;
  exercise_id: string;
  position: number;
  sets: string | null;
  reps: string | null;
  weight: string | null;
  rest: string | null;
  rir: string | null;
  notes: string | null;
  series_group_id: string | null;
  exercise: Exercise | null;
};

type WorkoutDay = {
  id: string;
  title: string;
  day_of_week: string | null;
  notes: string | null;
  created_at: string;
  schedule_started_on: string | null;
  exercises: WorkoutExercise[];
};

type ClientInfo = {
  id: string;
  full_name: string;
  objective: string | null;
  notes: string | null;
};

type ClientRoutineViewProps = {
  client: ClientInfo;
  days: WorkoutDay[];
  initialProgressEntries: ExerciseProgressEntry[];
  initialProgressPromptedAt: string | null;
  progressStorageReady: boolean;
  progressWeightUnitsReady: boolean;
  progressReminderReady: boolean;
  initialWorkoutCompletions: WorkoutCompletionEntry[];
  workoutTrackingStartedOn: string;
  workoutCalendarReady: boolean;
  todayInMexico: string;
};

type ClientExerciseCardProps = {
  item: WorkoutExercise;
  displayPosition: number;
  seriesStep?: string;
  latestProgress: ExerciseProgressEntry | null;
  progressDue: boolean;
  progressOpen: boolean;
  progressPanelId: string;
  onOpenVideo: (exercise: Exercise | null) => void;
  onToggleProgress: () => void;
};

function ClientExerciseCard({
  item,
  displayPosition,
  seriesStep,
  latestProgress,
  progressDue,
  progressOpen,
  progressPanelId,
  onOpenVideo,
  onToggleProgress,
}: ClientExerciseCardProps) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              {displayPosition.toString().padStart(2, "0")} ·{" "}
              {item.exercise?.muscle_group || "Ejercicio"}
            </p>

            {seriesStep && (
              <span className="rounded-full bg-[var(--button-bg)] px-3 py-1 text-xs font-black text-[var(--button-text)]">
                {seriesStep}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-2xl font-black tracking-tight">
            {item.exercise?.name || "Ejercicio"}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.sets && (
              <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black text-[var(--muted)]">
                {item.sets} series
              </span>
            )}

            {item.reps && (
              <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black text-[var(--muted)]">
                {item.reps} reps
              </span>
            )}

            {item.weight && (
              <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black text-[var(--muted)]">
                {item.weight}
              </span>
            )}

            {item.rest && (
              <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black text-[var(--muted)]">
                Descanso {item.rest}
              </span>
            )}

            {item.rir && (
              <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black text-[var(--muted)]">
                RIR {item.rir}
              </span>
            )}
          </div>

          {item.notes && (
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {item.notes}
            </p>
          )}

          {latestProgress && (
            <p className="mt-4 text-sm font-black text-[var(--text)]">
              Último avance: {formatProgressWeight(latestProgress)}
              {latestProgress.reps ? ` · ${latestProgress.reps} reps` : ""}
              <span className="ml-2 font-bold text-[var(--muted)]">
                {formatProgressDate(latestProgress.recorded_on)}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          {progressDue && (
            <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
              Momento de progresar
            </span>
          )}

          {item.exercise && (
            <button
              type="button"
              onClick={onToggleProgress}
              aria-expanded={progressOpen}
              aria-controls={progressPanelId}
              aria-label={`${progressOpen ? "Cerrar" : "Abrir"} bitácora de ${
                item.exercise.name
              }`}
              className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] transition active:scale-95"
            >
              {progressOpen ? "Cerrar bitácora" : "Ver bitácora"}
            </button>
          )}

          {item.exercise?.video_url && (
            <button
              type="button"
              onClick={() => onOpenVideo(item.exercise)}
              aria-label={`Ver video de ${item.exercise.name}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--text)] transition active:scale-95"
            >
              Ver video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const id = parsedUrl.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${id}`;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const id = parsedUrl.searchParams.get("v");

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }

      if (parsedUrl.pathname.includes("/shorts/")) {
        const shortId = parsedUrl.pathname.split("/shorts/")[1];
        return `https://www.youtube.com/embed/${shortId}`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

export default function ClientRoutineView({
  client,
  days,
  initialProgressEntries,
  initialProgressPromptedAt,
  progressStorageReady,
  progressWeightUnitsReady,
  progressReminderReady,
  initialWorkoutCompletions,
  workoutTrackingStartedOn,
  workoutCalendarReady,
  todayInMexico,
}: ClientRoutineViewProps) {
  const [supabase] = useState(() => createClient());
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [openProgressItemId, setOpenProgressItemId] = useState<string | null>(
    null
  );
  const [progressEntries, setProgressEntries] = useState(
    initialProgressEntries
  );
  const [progressPromptedAt, setProgressPromptedAt] = useState(
    initialProgressPromptedAt
  );
  const [acknowledgingPrompt, setAcknowledgingPrompt] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [workoutCompletions, setWorkoutCompletions] = useState(
    initialWorkoutCompletions
  );
  const [workoutCalendarStorageReady, setWorkoutCalendarStorageReady] =
    useState(workoutCalendarReady);
  const [completionSavingKey, setCompletionSavingKey] = useState<string | null>(
    null
  );
  const [completionMessage, setCompletionMessage] = useState("");
  const [calendarToday, setCalendarToday] = useState(todayInMexico);

  useEffect(() => {
    function syncCalendarDate() {
      setCalendarToday(getMexicoCityDateKey());
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") syncCalendarDate();
    }

    syncCalendarDate();
    const dateInterval = window.setInterval(syncCalendarDate, 60_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(dateInterval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const orderedDays = useMemo(() => sortWorkoutDays(days), [days]);
  const progressByExerciseId = useMemo(() => {
    const entriesByExercise = new Map<string, ExerciseProgressEntry[]>();

    progressEntries.forEach((entry) => {
      const exerciseEntries = entriesByExercise.get(entry.exercise_id) ?? [];
      exerciseEntries.push(entry);
      entriesByExercise.set(entry.exercise_id, exerciseEntries);
    });

    entriesByExercise.forEach((entries, exerciseId) => {
      entriesByExercise.set(exerciseId, sortProgressEntries(entries));
    });

    return entriesByExercise;
  }, [progressEntries]);
  const progressReminders = useMemo(() => {
    const exercisesById = new Map<string, Exercise>();

    days.forEach((day) => {
      day.exercises.forEach((item) => {
        if (item.exercise) exercisesById.set(item.exercise.id, item.exercise);
      });
    });

    return [...exercisesById.values()].filter((exercise) => {
      const entries = progressByExerciseId.get(exercise.id) ?? [];
      return getProgressReminder(entries).isDue;
    });
  }, [days, progressByExerciseId]);
  const progressPromptDue = useMemo(
    () =>
      progressReminderReady &&
      progressReminders.length > 0 &&
      isBiweeklyProgressPromptDue(progressEntries, progressPromptedAt),
    [
      progressEntries,
      progressPromptedAt,
      progressReminders.length,
      progressReminderReady,
    ]
  );
  const workoutCompletionKeys = useMemo(
    () =>
      new Set(
        workoutCompletions.map((entry) =>
          getWorkoutCompletionKey(entry.workout_day_id, entry.completed_on)
        )
      ),
    [workoutCompletions]
  );
  const hasCalendarDays = useMemo(
    () =>
      days.some(
        (day) =>
          day.exercises.length > 0 &&
          getWorkoutWeekDayIndex(day.day_of_week) !== -1
      ),
    [days]
  );

  function openVideo(exercise: Exercise | null) {
    if (!exercise?.video_url) return;

    setSelectedExerciseName(exercise.name);
    setSelectedVideo(getYouTubeEmbedUrl(exercise.video_url));
  }

  function handleProgressEntryAdded(entry: ExerciseProgressEntry) {
    setProgressEntries((current) => [entry, ...current]);
  }

  function handleProgressEntryDeleted(entryId: string) {
    setProgressEntries((current) =>
      current.filter((entry) => entry.id !== entryId)
    );
  }

  async function handleAcknowledgeProgressPrompt() {
    setAcknowledgingPrompt(true);
    setPromptError("");

    const { data, error } = await supabase.rpc(
      "mark_client_progress_prompt_shown",
      { target_client_id: client.id }
    );

    if (error) {
      setPromptError("No se pudo cerrar el recordatorio. Inténtalo de nuevo.");
      setAcknowledgingPrompt(false);
      return;
    }

    setProgressPromptedAt(
      typeof data === "string" ? data : new Date().toISOString()
    );
    setAcknowledgingPrompt(false);
  }

  async function handleToggleWorkoutCompletion(
    workoutDayId: string,
    completedOn: string,
    nextCompleted: boolean
  ) {
    if (!workoutCalendarStorageReady || completionSavingKey) return;

    const savingKey = getWorkoutCalendarSavingKey(
      workoutDayId,
      completedOn
    );
    setCompletionSavingKey(savingKey);
    setCompletionMessage("");

    const { error } = await supabase.rpc("set_workout_day_completed", {
      target_workout_day_id: workoutDayId,
      target_completed_on: completedOn,
      target_completed: nextCompleted,
    });

    if (error) {
      const missingStorage =
        error.code === "PGRST202" ||
        error.code === "42883" ||
        error.message.toLowerCase().includes("set_workout_day_completed");

      if (missingStorage) setWorkoutCalendarStorageReady(false);

      setCompletionMessage(
        missingStorage
          ? "El calendario necesita la actualización pendiente de Supabase."
          : "No se pudo actualizar este entrenamiento. Inténtalo de nuevo."
      );
      setCompletionSavingKey(null);
      return;
    }

    setWorkoutCompletions((current) => {
      const withoutTarget = current.filter(
        (entry) =>
          getWorkoutCompletionKey(
            entry.workout_day_id,
            entry.completed_on
          ) !== savingKey
      );

      if (!nextCompleted) return withoutTarget;

      return [
        {
          id: savingKey,
          client_id: client.id,
          workout_day_id: workoutDayId,
          completed_on: completedOn,
          created_at: new Date().toISOString(),
        },
        ...withoutTarget,
      ];
    });
    setCompletionMessage(
      nextCompleted
        ? "¡Entrenamiento completado! Tu calendario ya está en verde."
        : "Quitamos la palomita de esa fecha."
    );
    setCompletionSavingKey(null);
  }

  return (
    <div>
      <div className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
          Mi entrenamiento
        </p>

        <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-7xl">
          Hola, {client.full_name}.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
          {client.objective || "Tu rutina personalizada está lista."}
        </p>

        {client.notes && (
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            {client.notes}
          </p>
        )}
      </div>

      {progressPromptDue && (
        <div
          role="status"
          className="mt-5 rounded-[28px] border border-amber-500/35 bg-amber-500/10 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                Es momento de ir por más
              </p>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                Han pasado dos semanas desde tu último avance en{" "}
                <span className="font-black text-[var(--text)]">
                  {progressReminders
                    .slice(0, 2)
                    .map((exercise) => exercise.name)
                    .join(" y ")}
                  {progressReminders.length > 2
                    ? ` y ${progressReminders.length - 2} ejercicio${
                        progressReminders.length - 2 === 1 ? "" : "s"
                      } más`
                    : ""}
                </span>
                . Si completas las repeticiones con buena técnica y todavía
                tienes margen, prueba subir un poco el peso o hacer una
                repetición más.
              </p>

              {promptError && (
                <p role="alert" className="mt-3 text-sm font-bold text-red-500">
                  {promptError}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAcknowledgeProgressPrompt}
              disabled={acknowledgingPrompt}
              className="shrink-0 rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] disabled:opacity-50"
            >
              {acknowledgingPrompt ? "Guardando..." : "Entendido"}
            </button>
          </div>
        </div>
      )}

      {hasCalendarDays && (
        <div className="mt-5">
          <ClientWorkoutCalendar
            days={days}
            completions={workoutCompletions}
            trackingStartedOn={workoutTrackingStartedOn}
            storageReady={workoutCalendarStorageReady}
            savingKey={completionSavingKey}
            onToggleCompletion={handleToggleWorkoutCompletion}
            today={calendarToday}
          />

          {completionMessage && (
            <p
              role="status"
              aria-live="polite"
              className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--muted)]"
            >
              {completionMessage}
            </p>
          )}
        </div>
      )}

      {days.length > 0 && (
        <p className="mt-7 text-sm font-bold text-[var(--muted)]">
          Selecciona un día para ver la rutina completa.
        </p>
      )}

      <div className={days.length > 0 ? "mt-4 grid gap-5" : "mt-7 grid gap-5"}>
        {orderedDays.map((day) => {
          const expanded = expandedDayId === day.id;
          const buttonId = `client-day-toggle-${day.id}`;
          const panelId = `client-day-panel-${day.id}`;
          const exerciseBlocks = buildWorkoutExerciseBlocks(day.exercises);
          const displayPositionById = new Map<string, number>(
            exerciseBlocks
              .flatMap((block) => block.exercises)
              .map((exercise, index) => [exercise.id, index + 1] as const)
          );
          const completionTrackingStart = getWorkoutDayStartDate(
            day,
            workoutTrackingStartedOn
          );
          const currentWeekCompletionDate = getCurrentWeekScheduledDate(
            day.day_of_week,
            calendarToday
          );
          const completionDate =
            currentWeekCompletionDate &&
            currentWeekCompletionDate < completionTrackingStart
              ? addDaysToDateKey(currentWeekCompletionDate, 7)
              : currentWeekCompletionDate;
          const completionAvailable =
            day.exercises.length > 0 &&
            completionDate !== null &&
            completionDate >= completionTrackingStart;
          const completionIsFuture =
            completionDate !== null && completionDate > calendarToday;
          const dayCompletionKey = completionDate
            ? getWorkoutCompletionKey(day.id, completionDate)
            : null;
          const dayCompleted = dayCompletionKey
            ? workoutCompletionKeys.has(dayCompletionKey)
            : false;
          const dayCompletionSaving =
            dayCompletionKey !== null &&
            completionSavingKey === dayCompletionKey;

          return (
            <article
              key={day.id}
              className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl"
            >
            <RoutineDayToggle
              buttonId={buttonId}
              panelId={panelId}
              dayOfWeek={day.day_of_week}
              title={day.title}
              exerciseCount={day.exercises.length}
              expanded={expanded}
              onToggle={() => {
                setOpenProgressItemId(null);
                setExpandedDayId((current) =>
                  current === day.id ? null : day.id
                );
              }}
            />

            {expanded && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="border-t border-[var(--border)] px-5 pb-5 pt-5 sm:px-6 sm:pb-6"
              >
                {day.notes && (
                  <p className="mb-5 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                    {day.notes}
                  </p>
                )}

                <div className="grid gap-3">
                  {exerciseBlocks.map((block) => {
                    const exerciseCards = block.exercises.map((item, index) => {
                      const exerciseProgress = item.exercise
                        ? progressByExerciseId.get(item.exercise.id) ?? []
                        : [];
                      const progressReminder = getProgressReminder(
                        exerciseProgress
                      );
                      const progressPanelId = `progress-panel-${item.id}`;
                      const progressOpen = openProgressItemId === item.id;

                      return (
                        <div key={item.id} className="grid gap-3">
                          <ClientExerciseCard
                            item={item}
                            displayPosition={
                              displayPositionById.get(item.id) ?? 0
                            }
                            seriesStep={
                              block.seriesGroupId && block.exercises.length > 1
                                ? `Paso ${index + 1} de ${
                                    block.exercises.length
                                  }`
                                : undefined
                            }
                            latestProgress={progressReminder.latestEntry}
                            progressDue={progressReminder.isDue}
                            progressOpen={progressOpen}
                            progressPanelId={progressPanelId}
                            onOpenVideo={openVideo}
                            onToggleProgress={() =>
                              setOpenProgressItemId((current) =>
                                current === item.id ? null : item.id
                              )
                            }
                          />

                          {progressOpen && item.exercise && (
                            <ExerciseProgressJournal
                              panelId={progressPanelId}
                              clientId={client.id}
                              exerciseId={item.exercise.id}
                              workoutExerciseId={item.id}
                              exerciseName={item.exercise.name}
                              entries={exerciseProgress}
                              storageReady={progressStorageReady}
                              weightUnitsReady={progressWeightUnitsReady}
                              onEntryAdded={handleProgressEntryAdded}
                              onEntryDeleted={handleProgressEntryDeleted}
                            />
                          )}
                        </div>
                      );
                    });

                    if (block.seriesGroupId && block.exercises.length > 1) {
                      return (
                        <RoutineSeriesBlock
                          key={block.id}
                          exerciseCount={block.exercises.length}
                        >
                          {exerciseCards}
                        </RoutineSeriesBlock>
                      );
                    }

                    return exerciseCards[0];
                  })}

                  {day.exercises.length === 0 && (
                    <div className="rounded-[24px] border border-dashed border-[var(--border)] p-6 text-center">
                      <p className="text-sm font-bold text-[var(--muted)]">
                        Este día todavía no tiene ejercicios.
                      </p>
                    </div>
                  )}
                </div>

                {completionAvailable && completionDate && (
                  <div className="mt-5 flex flex-col gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                        Palomita de esta semana
                      </p>
                      <p className="mt-2 font-black text-[var(--text)]">
                        {formatWorkoutCalendarDate(completionDate, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {completionIsFuture
                          ? "Podrás marcarla cuando llegue ese día."
                          : dayCompleted
                            ? "Esta rutina ya aparece en verde en tu calendario."
                            : "Cuando termines, marca la rutina como realizada."}
                      </p>
                    </div>

                    {completionIsFuture ? (
                      <span className="shrink-0 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                        Próximamente
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          void handleToggleWorkoutCompletion(
                            day.id,
                            completionDate,
                            !dayCompleted
                          )
                        }
                        disabled={
                          !workoutCalendarStorageReady ||
                          completionSavingKey !== null
                        }
                        aria-pressed={dayCompleted}
                        className={`shrink-0 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                          dayCompleted
                            ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-[var(--button-bg)] text-[var(--button-text)]"
                        }`}
                      >
                        {dayCompletionSaving
                          ? "Guardando..."
                          : dayCompleted
                            ? "✓ Completada"
                            : "✓ Marcar como hecha"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            </article>
          );
        })}

        {days.length === 0 && (
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center backdrop-blur-xl">
            <h2 className="text-3xl font-black">Tu rutina aún no está lista.</h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Cuando tu coach asigne entrenamientos, aparecerán aquí.
            </p>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-xl">
          <div className="w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/10 bg-[#0d0d0d] text-[#f5f0eb] shadow-2xl">
            <div className="flex items-center justify-between gap-5 border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/40">
                  Video técnica
                </p>

                <h3 className="mt-2 text-xl font-black">
                  {selectedExerciseName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedVideo(null);
                  setSelectedExerciseName("");
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={selectedVideo}
                title={selectedExerciseName}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
