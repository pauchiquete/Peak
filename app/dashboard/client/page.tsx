import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";
import ClientRoutineView from "@/components/dashboard/clients/ClientRoutineView";
import Link from "next/link";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
};

type WorkoutExerciseFromDb = {
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
  exercise: Exercise | Exercise[] | null;
};

function normalizeExercise(exercise: Exercise | Exercise[] | null) {
  if (Array.isArray(exercise)) {
    return exercise[0] ?? null;
  }

  return exercise;
}

export default async function ClientDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "coach") {
    redirect("/dashboard/coach");
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, full_name, objective, notes")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientError) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[34px] border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              Error
            </p>

            <h1 className="mt-4 text-4xl font-black">
              No se pudo cargar tu perfil de cliente.
            </h1>

            <p className="mt-4 text-sm leading-7 text-red-500">
              {clientError.message}
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-6 flex justify-end">
            <LogoutButton />
          </div>

          <div className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-8 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Mi entrenamiento
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
              Aún no estás vinculado.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Tu cuenta existe, pero todavía no está conectada a un cliente.
            </p>

            <p className="mt-4 text-sm font-bold text-[var(--muted)]">
              Usuario actual: {user.email}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { data: workoutDays, error: daysError } = await supabase
    .from("workout_days")
    .select("id, title, day_of_week, notes, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (daysError) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[34px] border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              Error
            </p>

            <h1 className="mt-4 text-4xl font-black">
              No se pudieron cargar los días.
            </h1>

            <p className="mt-4 text-sm leading-7 text-red-500">
              {daysError.message}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const dayIds = (workoutDays ?? []).map((day) => day.id);

  const { data: workoutExercises, error: exercisesError } =
    dayIds.length > 0
      ? await supabase
          .from("workout_exercises")
          .select(
            `
            id,
            workout_day_id,
            exercise_id,
            position,
            sets,
            reps,
            weight,
            rest,
            rir,
            notes,
            exercise:exercises (
              id,
              name,
              muscle_group,
              body_region,
              video_url
            )
          `
          )
          .in("workout_day_id", dayIds)
          .order("position", { ascending: true })
      : { data: [], error: null };

  if (exercisesError) {
    return (
      <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[34px] border border-red-500/30 bg-red-500/10 p-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              Error
            </p>

            <h1 className="mt-4 text-4xl font-black">
              No se pudieron cargar los ejercicios.
            </h1>

            <p className="mt-4 text-sm leading-7 text-red-500">
              {exercisesError.message}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const normalizedWorkoutExercises = (
    workoutExercises ?? []
  ).map((item) => {
    const typedItem = item as WorkoutExerciseFromDb;

    return {
      ...typedItem,
      exercise: normalizeExercise(typedItem.exercise),
    };
  });

  const daysWithExercises = (workoutDays ?? []).map((day) => {
    return {
      ...day,
      exercises: normalizedWorkoutExercises.filter(
        (item) => item.workout_day_id === day.id
      ),
    };
  });

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/client/configuracion"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
          >
            Cambiar contraseña
          </Link>

          <LogoutButton />
        </div>

        <ClientRoutineView client={client} days={daysWithExercises} />
      </section>
    </main>
  );
}