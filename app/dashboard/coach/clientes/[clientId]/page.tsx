import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoutineManager from "@/components/dashboard/routines/RoutineManager";
import ApplyTemplateForm from "@/components/dashboard/routines/ApplyTemplateForm";

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

type PageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

function normalizeExercise(exercise: Exercise | Exercise[] | null) {
  if (Array.isArray(exercise)) {
    return exercise[0] ?? null;
  }

  return exercise;
}

export default async function ClientRoutinePage({ params }: PageProps) {
  const { clientId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    redirect("/dashboard/client");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name, objective, notes")
    .eq("id", clientId)
    .eq("coach_id", user.id)
    .single();

  if (!client) {
    notFound();
  }

  const { data: workoutDays } = await supabase
    .from("workout_days")
    .select("*")
    .eq("client_id", clientId)
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false });

  const dayIds = (workoutDays ?? []).map((day) => day.id);

  const { data: workoutExercises } =
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
      : { data: [] };

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, body_region, video_url")
    .order("name", { ascending: true });

  const { data: templates } = await supabase
    .from("routine_templates")
    .select("id, name, focus, level, notes")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false });

  const templateIds = (templates ?? []).map((template) => template.id);

  const { data: templateExercisesForCount } =
    templateIds.length > 0
      ? await supabase
          .from("routine_template_exercises")
          .select("id, template_id")
          .in("template_id", templateIds)
      : { data: [] };

  const templateSummaries = (templates ?? []).map((template) => {
    const exerciseCount = (templateExercisesForCount ?? []).filter(
      (item) => item.template_id === template.id
    ).length;

    return {
      ...template,
      exercise_count: exerciseCount,
    };
  });

  const normalizedWorkoutExercises = (workoutExercises ?? []).map((item) => {
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
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-28 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <ApplyTemplateForm clientId={client.id} templates={templateSummaries} />

        <RoutineManager
          client={client}
          initialDays={daysWithExercises}
          exercises={exercises ?? []}
        />
      </section>
    </main>
  );
}