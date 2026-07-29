"use client";

import { useState } from "react";

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
  title: string;
  day_of_week: string | null;
  notes: string | null;
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
};

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
}: ClientRoutineViewProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");

  function openVideo(exercise: Exercise | null) {
    if (!exercise?.video_url) return;

    setSelectedExerciseName(exercise.name);
    setSelectedVideo(getYouTubeEmbedUrl(exercise.video_url));
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

      <div className="mt-7 grid gap-5">
        {days.map((day) => (
          <article
            key={day.id}
            className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
          >
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
                    </div>

                    {item.exercise?.video_url && (
                      <button
                        type="button"
                        onClick={() => openVideo(item.exercise)}
                        className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] transition active:scale-95"
                      >
                        Ver video
                      </button>
                    )}
                  </div>
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