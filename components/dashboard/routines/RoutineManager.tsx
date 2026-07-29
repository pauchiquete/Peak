"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ClientInfo = {
  id: string;
  full_name: string;
  objective: string | null;
  notes: string | null;
};

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
  exercise: Exercise | null;
};

type WorkoutDay = {
  id: string;
  client_id: string;
  coach_id: string;
  title: string;
  day_of_week: string | null;
  notes: string | null;
  created_at: string;
  exercises: WorkoutExercise[];
};

type RoutineManagerProps = {
  client: ClientInfo;
  initialDays: WorkoutDay[];
  exercises: Exercise[];
};

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

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

export default function RoutineManager({
  client,
  initialDays,
  exercises,
}: RoutineManagerProps) {
  const supabase = createClient();

  const [days, setDays] = useState<WorkoutDay[]>(initialDays);
  const [dayFormOpen, setDayFormOpen] = useState(false);
  const [openExerciseFormDayId, setOpenExerciseFormDayId] = useState<
    string | null
  >(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loadingDay, setLoadingDay] = useState(false);
  const [loadingExercise, setLoadingExercise] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");

  const filteredExercises = useMemo(() => {
    const query = exerciseSearch.toLowerCase().trim();

    if (!query) {
      return exercises;
    }

    return exercises.filter((exercise) => {
      return (
        exercise.name.toLowerCase().includes(query) ||
        exercise.muscle_group.toLowerCase().includes(query) ||
        String(exercise.body_region ?? "").toLowerCase().includes(query)
      );
    });
  }, [exerciseSearch, exercises]);

  async function handleCreateDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const title = String(form.get("title") ?? "").trim();
    const dayOfWeek = String(form.get("day_of_week") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    setLoadingDay(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No hay sesión activa. Vuelve a iniciar sesión.");
      setLoadingDay(false);
      return;
    }

    const { data, error } = await supabase
      .from("workout_days")
      .insert({
        client_id: client.id,
        coach_id: user.id,
        title,
        day_of_week: dayOfWeek || null,
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error) {
      setMessage("No se pudo crear el día de entrenamiento.");
      setLoadingDay(false);
      return;
    }

    const newDay: WorkoutDay = {
      ...(data as Omit<WorkoutDay, "exercises">),
      exercises: [],
    };

    setDays((current) => [newDay, ...current]);
    setMessage("Día creado correctamente.");
    setDayFormOpen(false);
    setLoadingDay(false);
    formElement.reset();
  }

  async function handleUpdateDay(
    event: FormEvent<HTMLFormElement>,
    dayId: string
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const title = String(form.get("title") ?? "").trim();
    const dayOfWeek = String(form.get("day_of_week") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    setLoadingDay(true);
    setMessage("");

    const { data, error } = await supabase
      .from("workout_days")
      .update({
        title,
        day_of_week: dayOfWeek || null,
        notes: notes || null,
      })
      .eq("id", dayId)
      .select("*")
      .single();

    if (error) {
      setMessage("No se pudo actualizar el día.");
      setLoadingDay(false);
      return;
    }

    setDays((currentDays) =>
      currentDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              ...data,
              exercises: day.exercises,
            }
          : day
      )
    );

    setEditingDayId(null);
    setMessage("Día actualizado correctamente.");
    setLoadingDay(false);
  }

  async function handleDeleteDay(dayId: string, title: string) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${title}"? También se eliminarán sus ejercicios.`
    );

    if (!confirmed) return;

    setLoadingDay(true);
    setMessage("");

    const { error } = await supabase
      .from("workout_days")
      .delete()
      .eq("id", dayId);

    if (error) {
      setMessage("No se pudo eliminar el día.");
      setLoadingDay(false);
      return;
    }

    setDays((currentDays) => currentDays.filter((day) => day.id !== dayId));
    setMessage("Día eliminado correctamente.");
    setLoadingDay(false);
  }

  async function handleAddExercise(
    event: FormEvent<HTMLFormElement>,
    workoutDayId: string
  ) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const exerciseId = String(form.get("exercise_id") ?? "");
    const sets = String(form.get("sets") ?? "").trim();
    const reps = String(form.get("reps") ?? "").trim();
    const weight = String(form.get("weight") ?? "").trim();
    const rest = String(form.get("rest") ?? "").trim();
    const rir = String(form.get("rir") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    const selectedExercise = exercises.find(
      (exercise) => exercise.id === exerciseId
    );

    if (!selectedExercise) {
      setMessage("Selecciona un ejercicio válido.");
      return;
    }

    const currentDay = days.find((day) => day.id === workoutDayId);
    const nextPosition = (currentDay?.exercises.length ?? 0) + 1;

    setLoadingExercise(true);
    setMessage("");

    const { data, error } = await supabase
      .from("workout_exercises")
      .insert({
        workout_day_id: workoutDayId,
        exercise_id: exerciseId,
        position: nextPosition,
        sets: sets || null,
        reps: reps || null,
        weight: weight || null,
        rest: rest || null,
        rir: rir || null,
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error) {
      setMessage("No se pudo agregar el ejercicio.");
      setLoadingExercise(false);
      return;
    }

    const newWorkoutExercise: WorkoutExercise = {
      ...(data as Omit<WorkoutExercise, "exercise">),
      exercise: selectedExercise,
    };

    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.id !== workoutDayId) return day;

        return {
          ...day,
          exercises: [...day.exercises, newWorkoutExercise],
        };
      })
    );

    setMessage("Ejercicio agregado correctamente.");
    setLoadingExercise(false);
    setOpenExerciseFormDayId(null);
    setExerciseSearch("");
    formElement.reset();
  }

  async function handleUpdateExercise(
    event: FormEvent<HTMLFormElement>,
    workoutExerciseId: string,
    workoutDayId: string
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const exerciseId = String(form.get("exercise_id") ?? "");
    const sets = String(form.get("sets") ?? "").trim();
    const reps = String(form.get("reps") ?? "").trim();
    const weight = String(form.get("weight") ?? "").trim();
    const rest = String(form.get("rest") ?? "").trim();
    const rir = String(form.get("rir") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    const selectedExercise = exercises.find(
      (exercise) => exercise.id === exerciseId
    );

    if (!selectedExercise) {
      setMessage("Selecciona un ejercicio válido.");
      return;
    }

    setLoadingExercise(true);
    setMessage("");

    const { data, error } = await supabase
      .from("workout_exercises")
      .update({
        exercise_id: exerciseId,
        sets: sets || null,
        reps: reps || null,
        weight: weight || null,
        rest: rest || null,
        rir: rir || null,
        notes: notes || null,
      })
      .eq("id", workoutExerciseId)
      .select("*")
      .single();

    if (error) {
      setMessage("No se pudo actualizar el ejercicio.");
      setLoadingExercise(false);
      return;
    }

    const updatedExercise: WorkoutExercise = {
      ...(data as Omit<WorkoutExercise, "exercise">),
      exercise: selectedExercise,
    };

    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.id !== workoutDayId) return day;

        return {
          ...day,
          exercises: day.exercises.map((item) =>
            item.id === workoutExerciseId ? updatedExercise : item
          ),
        };
      })
    );

    setEditingExerciseId(null);
    setMessage("Ejercicio actualizado correctamente.");
    setLoadingExercise(false);
  }

  async function handleDeleteExercise(
    workoutExerciseId: string,
    workoutDayId: string,
    exerciseName: string
  ) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${exerciseName}" de esta rutina?`
    );

    if (!confirmed) return;

    setLoadingExercise(true);
    setMessage("");

    const { error } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("id", workoutExerciseId);

    if (error) {
      setMessage("No se pudo eliminar el ejercicio.");
      setLoadingExercise(false);
      return;
    }

    setDays((currentDays) =>
      currentDays.map((day) => {
        if (day.id !== workoutDayId) return day;

        return {
          ...day,
          exercises: day.exercises.filter(
            (item) => item.id !== workoutExerciseId
          ),
        };
      })
    );

    setMessage("Ejercicio eliminado correctamente.");
    setLoadingExercise(false);
  }

  function openVideo(exercise: Exercise | null) {
    if (!exercise?.video_url) return;

    setSelectedExerciseName(exercise.name);
    setSelectedVideo(getYouTubeEmbedUrl(exercise.video_url));
  }

  return (
    <div>
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Cliente
            </p>

            <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              {client.full_name}
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              {client.objective || "Sin objetivo registrado"}
            </p>

            {client.notes && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                {client.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/coach/clientes"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
            >
              Volver
            </Link>

            <button
              type="button"
              onClick={() => setDayFormOpen((value) => !value)}
              className="rounded-2xl bg-[var(--button-bg)] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition hover:scale-[1.02] active:scale-95"
            >
              {dayFormOpen ? "Cerrar" : "+ Crear día"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm font-bold text-[var(--muted)]">
          {message}
        </p>
      )}

      {dayFormOpen && (
        <form
          onSubmit={handleCreateDay}
          className="mt-5 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Nuevo día de entrenamiento
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <input
              name="title"
              required
              placeholder="Ej. Pierna fuerza, Push, Full body..."
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            />

            <select
              name="day_of_week"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            >
              {weekDays.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>

            <textarea
              name="notes"
              rows={3}
              placeholder="Notas del día..."
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none lg:col-span-2"
            />
          </div>

          <button
            type="submit"
            disabled={loadingDay}
            className="mt-6 w-full rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition active:scale-95 disabled:opacity-50"
          >
            {loadingDay ? "Guardando..." : "Crear día"}
          </button>
        </form>
      )}

      <div className="mt-7 grid gap-5">
        {days.map((day) => (
          <article
            key={day.id}
            className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
                  {day.day_of_week || "Día"}
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  {day.title}
                </h2>

                {day.notes && (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                    {day.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <button
                  type="button"
                  onClick={() =>
                    setOpenExerciseFormDayId((current) =>
                      current === day.id ? null : day.id
                    )
                  }
                  className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] transition active:scale-95"
                >
                  + Ejercicio
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingDayId((current) =>
                      current === day.id ? null : day.id
                    )
                  }
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
                >
                  Editar día
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteDay(day.id, day.title)}
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-500 transition hover:bg-red-500/20"
                >
                  Eliminar día
                </button>
              </div>
            </div>

            {editingDayId === day.id && (
              <form
                onSubmit={(event) => handleUpdateDay(event, day.id)}
                className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--bg)] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                  Editar día
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <input
                    name="title"
                    required
                    defaultValue={day.title}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                  />

                  <select
                    name="day_of_week"
                    defaultValue={day.day_of_week ?? "Lunes"}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                  >
                    {weekDays.map((weekDay) => (
                      <option key={weekDay}>{weekDay}</option>
                    ))}
                  </select>

                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={day.notes ?? ""}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none lg:col-span-2"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loadingDay}
                    className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
                  >
                    Guardar día
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingDayId(null)}
                    className="rounded-2xl border border-[var(--border)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--text)]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {openExerciseFormDayId === day.id && (
              <form
                onSubmit={(event) => handleAddExercise(event, day.id)}
                className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--bg)] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                  Agregar ejercicio
                </p>

                <input
                  value={exerciseSearch}
                  onChange={(event) => setExerciseSearch(event.target.value)}
                  placeholder="Buscar ejercicio..."
                  className="mt-5 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                />

                <select
                  name="exercise_id"
                  required
                  className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                >
                  {filteredExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} — {exercise.muscle_group}
                    </option>
                  ))}
                </select>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <input name="sets" placeholder="Series" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none" />
                  <input name="reps" placeholder="Reps" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none" />
                  <input name="weight" placeholder="Peso" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none" />
                  <input name="rest" placeholder="Descanso" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none" />
                  <input name="rir" placeholder="RIR" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none" />
                </div>

                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Notas específicas..."
                  className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                />

                <button
                  type="submit"
                  disabled={loadingExercise}
                  className="mt-5 w-full rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition active:scale-95 disabled:opacity-50"
                >
                  {loadingExercise ? "Agregando..." : "Agregar ejercicio"}
                </button>
              </form>
            )}

            <div className="mt-6 grid gap-3">
              {day.exercises.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                        {item.position.toString().padStart(2, "0")} ·{" "}
                        {item.exercise?.muscle_group || "Ejercicio"}
                      </p>

                      <h3 className="mt-3 text-2xl font-black tracking-tight">
                        {item.exercise?.name || "Ejercicio eliminado"}
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
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      {item.exercise?.video_url && (
                        <button
                          type="button"
                          onClick={() => openVideo(item.exercise)}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
                        >
                          Ver video
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setEditingExerciseId((current) =>
                            current === item.id ? null : item.id
                          )
                        }
                        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteExercise(
                            item.id,
                            day.id,
                            item.exercise?.name || "este ejercicio"
                          )
                        }
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-red-500 transition hover:bg-red-500/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {editingExerciseId === item.id && (
                    <form
                      onSubmit={(event) =>
                        handleUpdateExercise(event, item.id, day.id)
                      }
                      className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                        Editar ejercicio
                      </p>

                      <select
                        name="exercise_id"
                        defaultValue={item.exercise_id}
                        className="mt-5 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
                      >
                        {exercises.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name} — {exercise.muscle_group}
                          </option>
                        ))}
                      </select>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <input name="sets" defaultValue={item.sets ?? ""} placeholder="Series" className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none" />
                        <input name="reps" defaultValue={item.reps ?? ""} placeholder="Reps" className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none" />
                        <input name="weight" defaultValue={item.weight ?? ""} placeholder="Peso" className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none" />
                        <input name="rest" defaultValue={item.rest ?? ""} placeholder="Descanso" className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none" />
                        <input name="rir" defaultValue={item.rir ?? ""} placeholder="RIR" className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none" />
                      </div>

                      <textarea
                        name="notes"
                        rows={3}
                        defaultValue={item.notes ?? ""}
                        placeholder="Notas específicas..."
                        className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
                      />

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="submit"
                          disabled={loadingExercise}
                          className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
                        >
                          Guardar cambios
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingExerciseId(null)}
                          className="rounded-2xl border border-[var(--border)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--text)]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}

              {day.exercises.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-[var(--border)] p-6 text-center">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    Este día todavía no tiene ejercicios.
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}

        {days.length === 0 && (
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center backdrop-blur-xl">
            <h2 className="text-3xl font-black">Aún no hay rutina.</h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Crea el primer día de entrenamiento para este cliente.
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