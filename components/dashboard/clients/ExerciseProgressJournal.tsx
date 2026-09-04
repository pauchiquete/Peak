"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ExerciseProgressEntry,
  formatProgressDate,
  formatWeight,
  getProgressReminder,
  sortProgressEntries,
} from "@/lib/exercise-progress";

type ExerciseProgressJournalProps = {
  panelId: string;
  clientId: string;
  exerciseId: string;
  workoutExerciseId: string;
  exerciseName: string;
  entries: ExerciseProgressEntry[];
  storageReady: boolean;
  onEntryAdded: (entry: ExerciseProgressEntry) => void;
  onEntryDeleted: (entryId: string) => void;
};

type ProgressChartProps = {
  entries: ExerciseProgressEntry[];
  exerciseName: string;
};

function getTodayInputValue() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const datePart = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${datePart("year")}-${datePart("month")}-${datePart("day")}`;
}

function ProgressChart({ entries, exerciseName }: ProgressChartProps) {
  const chronologicalEntries = [...entries]
    .sort((first, second) =>
      first.recorded_on.localeCompare(second.recorded_on)
    )
    .slice(-12);
  const weights = chronologicalEntries.map((entry) => entry.weight_kg);
  const minimumWeight = Math.min(...weights);
  const maximumWeight = Math.max(...weights);
  const weightRange = Math.max(1, maximumWeight - minimumWeight);
  const width = 640;
  const height = 180;
  const horizontalPadding = 22;
  const verticalPadding = 22;
  const usableWidth = width - horizontalPadding * 2;
  const usableHeight = height - verticalPadding * 2;
  const points = chronologicalEntries.map((entry, index) => {
    const x =
      horizontalPadding +
      (chronologicalEntries.length === 1
        ? usableWidth / 2
        : (index / (chronologicalEntries.length - 1)) * usableWidth);
    const y =
      verticalPadding +
      ((maximumWeight - entry.weight_kg) / weightRange) * usableHeight;

    return { entry, x, y };
  });
  const firstWeight = chronologicalEntries[0]?.weight_kg ?? 0;
  const latestWeight = chronologicalEntries.at(-1)?.weight_kg ?? 0;

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="mb-3 flex items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
        <span>{formatWeight(maximumWeight)} kg</span>
        <span>Últimos {chronologicalEntries.length} registros</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Progreso de ${exerciseName}: de ${formatWeight(
          firstWeight
        )} a ${formatWeight(latestWeight)} kilogramos.`}
        className="h-auto w-full overflow-visible"
      >
        {[0, 0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1={horizontalPadding}
            x2={width - horizontalPadding}
            y1={verticalPadding + usableHeight * ratio}
            y2={verticalPadding + usableHeight * ratio}
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="2"
          />
        ))}

        {points.length > 1 && (
          <polyline
            points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map(({ entry, x, y }) => (
          <circle
            key={entry.id}
            cx={x}
            cy={y}
            r="7"
            fill="var(--bg)"
            stroke="currentColor"
            strokeWidth="5"
          />
        ))}
      </svg>

      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
        Mínimo {formatWeight(minimumWeight)} kg
      </p>
    </div>
  );
}

export default function ExerciseProgressJournal({
  panelId,
  clientId,
  exerciseId,
  workoutExerciseId,
  exerciseName,
  entries,
  storageReady,
  onEntryAdded,
  onEntryDeleted,
}: ExerciseProgressJournalProps) {
  const [supabase] = useState(() => createClient());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const orderedEntries = useMemo(() => sortProgressEntries(entries), [entries]);
  const reminder = useMemo(() => getProgressReminder(entries), [entries]);
  const chronologicalEntries = [...orderedEntries].reverse();
  const firstEntry = chronologicalEntries[0] ?? null;
  const latestEntry = orderedEntries[0] ?? null;
  const bestWeight =
    orderedEntries.length > 0
      ? Math.max(...orderedEntries.map((entry) => entry.weight_kg))
      : null;
  const weightChange =
    firstEntry && latestEntry
      ? latestEntry.weight_kg - firstEntry.weight_kg
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!storageReady) {
      setMessage(
        "La bitácora todavía no está activada en Supabase. Aplica la actualización y recarga la página."
      );
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const weight = Number(form.get("weight_kg"));
    const repsValue = String(form.get("reps") ?? "").trim();
    const reps = repsValue ? Number(repsValue) : null;
    const notes = String(form.get("notes") ?? "").trim();
    const recordedOn = String(form.get("recorded_on") ?? "");

    if (!Number.isFinite(weight) || weight < 0) {
      setMessage("Escribe un peso válido.");
      return;
    }

    if (reps !== null && (!Number.isInteger(reps) || reps <= 0)) {
      setMessage("Las repeticiones deben ser un número entero mayor que cero.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("exercise_progress_logs")
      .insert({
        client_id: clientId,
        exercise_id: exerciseId,
        workout_exercise_id: workoutExerciseId,
        weight_kg: weight,
        reps,
        notes: notes || null,
        recorded_on: recordedOn,
      })
      .select(
        "id, client_id, exercise_id, workout_exercise_id, weight_kg, reps, notes, recorded_on, created_at"
      )
      .single();

    if (error || !data) {
      const storageMissing =
        error?.code === "42P01" ||
        error?.code === "PGRST205" ||
        Boolean(error?.message.includes("exercise_progress_logs"));

      setMessage(
        storageMissing
          ? "Falta activar la bitácora en Supabase. Ejecuta supabase/exercise-progress.sql y recarga la página."
          : "No se pudo guardar el avance. Inténtalo de nuevo."
      );
      setSaving(false);
      return;
    }

    onEntryAdded({
      ...(data as ExerciseProgressEntry),
      weight_kg: Number(data.weight_kg),
      reps: data.reps === null ? null : Number(data.reps),
    });
    formElement.reset();
    setMessage("Avance guardado. Tu progreso ya quedó actualizado.");
    setSaving(false);
  }

  async function handleDelete(entry: ExerciseProgressEntry) {
    const confirmed = window.confirm(
      `¿Eliminar el registro de ${formatWeight(entry.weight_kg)} kg del ${formatProgressDate(
        entry.recorded_on
      )}?`
    );

    if (!confirmed) return;

    setDeletingId(entry.id);
    setMessage("");

    const { error } = await supabase
      .from("exercise_progress_logs")
      .delete()
      .eq("id", entry.id)
      .eq("client_id", clientId);

    if (error) {
      setMessage("No se pudo eliminar el registro.");
      setDeletingId(null);
      return;
    }

    onEntryDeleted(entry.id);
    setMessage("Registro eliminado.");
    setDeletingId(null);
  }

  return (
    <section
      id={panelId}
      aria-labelledby={`${panelId}-title`}
      className="rounded-[28px] border-2 border-[var(--text)] bg-[var(--surface-strong)] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
            Bitácora de progreso
          </p>
          <h3
            id={`${panelId}-title`}
            className="mt-3 text-3xl font-black tracking-tight"
          >
            {exerciseName}
          </h3>
        </div>

        {latestEntry && (
          <p className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm font-black">
            Último: {formatWeight(latestEntry.weight_kg)} kg
          </p>
        )}
      </div>

      {reminder.isDue && (
        <div
          role="status"
          className="mt-5 rounded-[24px] border border-amber-500/35 bg-amber-500/10 p-5"
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
            Es momento de ir por más
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Han pasado dos semanas desde tu último registro. Si completas tus
            repeticiones con buena técnica, prueba subir un poco el peso.
          </p>
        </div>
      )}

      {!storageReady && (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm font-bold leading-6 text-amber-700 dark:text-amber-300"
        >
          La bitácora requiere la actualización pendiente de Supabase antes de
          poder guardar registros.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--bg)] p-5"
      >
        <p className="text-sm font-black">Registrar avance</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-[var(--muted)]">
            Peso (kg)
            <input
              name="weight_kg"
              type="number"
              min="0"
              max="2000"
              step="0.25"
              inputMode="decimal"
              required
              disabled={!storageReady || saving}
              placeholder="Ej. 42.5"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--text)] disabled:opacity-50"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[var(--muted)]">
            Repeticiones
            <input
              name="reps"
              type="number"
              min="1"
              max="1000"
              step="1"
              inputMode="numeric"
              disabled={!storageReady || saving}
              placeholder="Ej. 10"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--text)] disabled:opacity-50"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[var(--muted)]">
            Fecha
            <input
              name="recorded_on"
              type="date"
              max={getTodayInputValue()}
              defaultValue={getTodayInputValue()}
              required
              disabled={!storageReady || saving}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--text)] disabled:opacity-50"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-bold text-[var(--muted)]">
          Notas
          <textarea
            name="notes"
            rows={2}
            maxLength={500}
            disabled={!storageReady || saving}
            placeholder="¿Cómo se sintió? Técnica, dificultad o cualquier detalle útil."
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--text)] disabled:opacity-50"
          />
        </label>

        <button
          type="submit"
          disabled={!storageReady || saving}
          className="mt-4 w-full rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[var(--button-text)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Guardando..." : "Guardar avance"}
        </button>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-sm font-bold leading-6 text-[var(--muted)]"
          >
            {message}
          </p>
        )}
      </form>

      {orderedEntries.length > 0 ? (
        <div className="mt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                Inicio
              </p>
              <p className="mt-2 text-2xl font-black">
                {formatWeight(firstEntry?.weight_kg ?? 0)} kg
              </p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                Mejor carga
              </p>
              <p className="mt-2 text-2xl font-black">
                {formatWeight(bestWeight ?? 0)} kg
              </p>
            </div>
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                Cambio
              </p>
              <p className="mt-2 text-2xl font-black">
                {(weightChange ?? 0) > 0 ? "+" : ""}
                {formatWeight(weightChange ?? 0)} kg
              </p>
            </div>
          </div>

          <div className="mt-4 text-[var(--text)]">
            <ProgressChart entries={orderedEntries} exerciseName={exerciseName} />
          </div>

          {!reminder.isDue && reminder.daysUntilReminder > 0 && (
            <p className="mt-4 text-sm font-bold text-[var(--muted)]">
              Próximo recordatorio de progreso en {reminder.daysUntilReminder}{" "}
              día{reminder.daysUntilReminder === 1 ? "" : "s"}.
            </p>
          )}

          <h4 className="mt-7 text-xl font-black">Historial reciente</h4>
          <ol className="mt-4 grid gap-3">
            {orderedEntries.slice(0, 12).map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-black">
                    {formatWeight(entry.weight_kg)} kg
                    {entry.reps ? ` · ${entry.reps} reps` : ""}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                    {formatProgressDate(entry.recorded_on)}
                  </p>
                  {entry.notes && (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {entry.notes}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(entry)}
                  disabled={deletingId === entry.id}
                  aria-label={`Eliminar registro de ${formatWeight(
                    entry.weight_kg
                  )} kilogramos del ${formatProgressDate(entry.recorded_on)}`}
                  className="shrink-0 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deletingId === entry.id ? "Eliminando..." : "Eliminar"}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="mt-6 rounded-[24px] border border-dashed border-[var(--border)] p-5 text-center">
          <p className="font-black">Tu progreso comienza con un registro.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Guarda el peso que usaste hoy y aquí verás cómo avanzas con el
            tiempo.
          </p>
        </div>
      )}
    </section>
  );
}
