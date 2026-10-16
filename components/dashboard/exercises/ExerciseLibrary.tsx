"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EffectiveExercise } from "@/lib/coach-exercises";

type ExerciseLibraryProps = {
  exercises: EffectiveExercise[];
  coachId: string;
  isHeadCoach: boolean;
  setupRequired: boolean;
};

const bodyRegions = [
  "Tren superior",
  "Tren inferior",
  "Core",
  "Full body",
  "Movilidad",
  "Cardio",
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

      if (id) return `https://www.youtube.com/embed/${id}`;

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

export default function ExerciseLibrary({
  exercises,
  coachId,
  isHeadCoach,
  setupRequired,
}: ExerciseLibraryProps) {
  const supabase = createClient();

  const [items, setItems] = useState<EffectiveExercise[]>(exercises);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);

  const groups = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((item) => item.muscle_group).filter(Boolean))
    ).sort();

    return ["Todos", ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesAvailability =
        showUnavailable || (!item.hidden && !item.archived_at);
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.muscle_group.toLowerCase().includes(query) ||
        String(item.body_region ?? "").toLowerCase().includes(query);

      const matchesGroup =
        selectedGroup === "Todos" || item.muscle_group === selectedGroup;

      return matchesAvailability && matchesSearch && matchesGroup;
    });
  }, [items, search, selectedGroup, showUnavailable]);

  async function handleCreateExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (setupRequired) {
      setMessage("Ejecuta primero la migración multi-entrenador en Supabase.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const name = String(form.get("name") ?? "").trim();
    const muscleGroup = String(form.get("muscle_group") ?? "").trim();
    const bodyRegion = String(form.get("body_region") ?? "").trim();
    const videoUrl = String(form.get("video_url") ?? "").trim();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        name,
        muscle_group: muscleGroup,
        body_region: bodyRegion || null,
        video_url: videoUrl || null,
        owner_coach_id: coachId,
        is_shared_base: isHeadCoach,
      })
      .select(
        "id, name, muscle_group, body_region, video_url, created_at, owner_coach_id, is_shared_base, archived_at"
      )
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const createdExercise: EffectiveExercise = {
      ...data,
      source: data.is_shared_base ? "base" : "custom",
      has_override: false,
      hidden: false,
    };

    setItems((current) =>
      [createdExercise, ...current].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    formElement.reset();
    setFormOpen(false);
    setMessage("Ejercicio creado correctamente.");
    setLoading(false);
  }

  async function handleUpdateExercise(
    event: FormEvent<HTMLFormElement>,
    exerciseId: string
  ) {
    event.preventDefault();

    if (setupRequired) {
      setMessage("Ejecuta primero la migración multi-entrenador en Supabase.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") ?? "").trim();
    const muscleGroup = String(form.get("muscle_group") ?? "").trim();
    const bodyRegion = String(form.get("body_region") ?? "").trim();
    const videoUrl = String(form.get("video_url") ?? "").trim();

    setLoading(true);
    setMessage("");

    const currentExercise = items.find((item) => item.id === exerciseId);
    const usesPrivateOverride =
      currentExercise?.is_shared_base && !isHeadCoach;

    const result = usesPrivateOverride
      ? await supabase
          .from("exercise_overrides")
          .upsert(
            {
              coach_id: coachId,
              exercise_id: exerciseId,
              name,
              muscle_group: muscleGroup,
              body_region: bodyRegion || null,
              video_url: videoUrl || null,
              hidden: false,
            },
            { onConflict: "coach_id,exercise_id" }
          )
          .select("exercise_id")
          .single()
      : await supabase
          .from("exercises")
          .update({
            name,
            muscle_group: muscleGroup,
            body_region: bodyRegion || null,
            video_url: videoUrl || null,
          })
          .eq("id", exerciseId)
          .eq("owner_coach_id", coachId)
          .select("id")
          .single();

    const { error } = result;

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setItems((current) =>
      current
        .map((item) =>
          item.id === exerciseId
            ? {
                ...item,
                name,
                muscle_group: muscleGroup,
                body_region: bodyRegion || null,
                video_url: videoUrl || null,
                has_override: usesPrivateOverride || item.has_override,
                hidden: false,
              }
            : item
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    setEditingId(null);
    setMessage(
      usesPrivateOverride
        ? "Personalización guardada sólo para tu cuenta y tus clientes."
        : "Ejercicio actualizado correctamente."
    );
    setLoading(false);
  }

  async function handleDeleteExercise(exerciseId: string, exerciseName: string) {
    if (setupRequired) {
      setMessage("Ejecuta primero la migración multi-entrenador en Supabase.");
      return;
    }

    const exercise = items.find((item) => item.id === exerciseId);
    const hidesSharedExercise = exercise?.is_shared_base && !isHeadCoach;
    const confirmed = window.confirm(
      hidesSharedExercise
        ? `¿Seguro que quieres ocultar "${exerciseName}" de tu biblioteca? Las rutinas existentes conservarán su historial.`
        : `¿Seguro que quieres archivar "${exerciseName}"? Las rutinas existentes conservarán su historial.`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const result = hidesSharedExercise
      ? await supabase.from("exercise_overrides").upsert(
          {
            coach_id: coachId,
            exercise_id: exerciseId,
            name: exercise?.name ?? exerciseName,
            muscle_group: exercise?.muscle_group ?? "Sin grupo",
            body_region: exercise?.body_region ?? null,
            video_url: exercise?.video_url ?? null,
            hidden: true,
          },
          { onConflict: "coach_id,exercise_id" }
        )
      : await supabase
          .from("exercises")
          .update({ archived_at: new Date().toISOString() })
          .eq("id", exerciseId)
          .eq("owner_coach_id", coachId);
    const { error } = result;

    if (error) {
      setMessage(
        "No se pudo archivar el ejercicio. Revisa la configuración de Supabase."
      );
      setLoading(false);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === exerciseId
          ? {
              ...item,
              hidden: hidesSharedExercise || item.hidden,
              has_override: hidesSharedExercise || item.has_override,
              archived_at: hidesSharedExercise
                ? item.archived_at
                : new Date().toISOString(),
            }
          : item
      )
    );
    setMessage(
      hidesSharedExercise
        ? "Ejercicio ocultado sólo de tu biblioteca."
        : "Ejercicio archivado correctamente."
    );
    setLoading(false);
  }

  async function handleRestoreExercise(exercise: EffectiveExercise) {
    if (setupRequired) return;

    setLoading(true);
    setMessage("");

    const result = exercise.is_shared_base && !isHeadCoach
      ? await supabase
          .from("exercise_overrides")
          .delete()
          .eq("coach_id", coachId)
          .eq("exercise_id", exercise.id)
      : await supabase
          .from("exercises")
          .update({ archived_at: null })
          .eq("id", exercise.id)
          .eq("owner_coach_id", coachId);

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
      return;
    }

    if (exercise.is_shared_base && !isHeadCoach) {
      window.location.reload();
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === exercise.id ? { ...item, archived_at: null } : item
      )
    );
    setMessage("Ejercicio restaurado.");
    setLoading(false);
  }

  function openVideo(exercise: EffectiveExercise) {
    if (!exercise.video_url) return;

    setSelectedExerciseName(exercise.name);
    setSelectedVideo(getYouTubeEmbedUrl(exercise.video_url));
  }

  return (
    <div>
      {setupRequired && (
        <div className="mb-5 rounded-[26px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-bold leading-6 text-amber-700 dark:text-amber-300">
          La biblioteca está en modo de lectura para proteger los ejercicios
          actuales. Ejecuta <code>supabase/multi-coach-platform.sql</code> para
          activar ejercicios privados y personalizaciones por coach.
        </div>
      )}

      <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto] lg:items-end">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Buscar
            </label>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Press, sentadilla, curl..."
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Grupo
            </label>

            <select
              value={selectedGroup}
              onChange={(event) => setSelectedGroup(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            >
              {groups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen((current) => !current)}
            disabled={setupRequired}
            className="w-full rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] transition active:scale-95 lg:w-auto"
          >
            {formOpen ? "Cerrar" : "+ Ejercicio"}
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[var(--muted)]">
            {filteredItems.length} ejercicios encontrados
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowUnavailable((value) => !value)}
              className="w-fit rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]"
            >
              {showUnavailable ? "Ocultar archivados" : "Incluir archivados"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedGroup("Todos");
              }}
              className="w-fit rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm font-bold text-[var(--muted)]">
          {message}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleCreateExercise}
          className="mt-5 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Nuevo ejercicio
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Nombre del ejercicio"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            />

            <input
              name="muscle_group"
              required
              placeholder="Grupo muscular"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            />

            <select
              name="body_region"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            >
              {bodyRegions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>

            <input
              name="video_url"
              placeholder="Link del video"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar ejercicio"}
          </button>
        </form>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((exercise) => (
          <article
            key={exercise.id}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl transition hover:bg-[var(--surface-strong)]"
          >
            <div className="min-h-[120px]">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                  {exercise.body_region || "Sin región"}
                </p>
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                  {exercise.source === "base"
                    ? exercise.has_override
                      ? "Personalizado"
                      : "Biblioteca Peak"
                    : "Ejercicio propio"}
                </span>
                {(exercise.hidden || exercise.archived_at) && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-amber-600">
                    Archivado
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight">
                {exercise.name}
              </h2>

              <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                {exercise.muscle_group}
              </p>
            </div>

            <div className="mt-5 grid gap-2">
              {exercise.video_url && (
                <button
                  type="button"
                  onClick={() => openVideo(exercise)}
                  className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)]"
                >
                  Ver video
                </button>
              )}

              {exercise.hidden || exercise.archived_at ? (
                <button
                  type="button"
                  disabled={loading || setupRequired}
                  onClick={() => handleRestoreExercise(exercise)}
                  className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-emerald-600 disabled:opacity-50"
                >
                  Restaurar ejercicio
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={setupRequired}
                      onClick={() =>
                        setEditingId((current) =>
                          current === exercise.id ? null : exercise.id
                        )
                      }
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--text)] disabled:opacity-50"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={setupRequired}
                      onClick={() =>
                        handleDeleteExercise(exercise.id, exercise.name)
                      }
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-500 disabled:opacity-50"
                    >
                      {exercise.is_shared_base && !isHeadCoach
                        ? "Ocultar"
                        : "Archivar"}
                    </button>
                  </div>

                  {exercise.has_override && !isHeadCoach && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRestoreExercise(exercise)}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)] disabled:opacity-50"
                    >
                      Restablecer original
                    </button>
                  )}
                </>
              )}
            </div>

            {editingId === exercise.id &&
              !exercise.hidden &&
              !exercise.archived_at && (
              <form
                onSubmit={(event) => handleUpdateExercise(event, exercise.id)}
                className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-4"
              >
                <div className="grid gap-3">
                  <input
                    name="name"
                    required
                    defaultValue={exercise.name}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                  />

                  <input
                    name="muscle_group"
                    required
                    defaultValue={exercise.muscle_group}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                  />

                  <select
                    name="body_region"
                    defaultValue={exercise.body_region ?? "Tren superior"}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                  >
                    {bodyRegions.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>

                  <input
                    name="video_url"
                    defaultValue={exercise.video_url ?? ""}
                    placeholder="Link del video"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-[var(--button-bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--button-text)] disabled:opacity-50"
                  >
                    Guardar
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-2xl border border-[var(--border)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </article>
        ))}
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
