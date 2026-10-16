import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TemplateManager from "@/components/dashboard/templates/TemplateManager";
import { loadEffectiveExercises } from "@/lib/coach-exercises";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
};

type TemplateExerciseFromDb = {
  id: string;
  template_id: string;
  exercise_id: string;
  position: number;
  sets: string | null;
  reps: string | null;
  weight: string | null;
  rest: string | null;
  rir: string | null;
  notes: string | null;
  series_group_id: string | null;
  exercise: Exercise | Exercise[] | null;
};

function normalizeExercise(exercise: Exercise | Exercise[] | null) {
  if (Array.isArray(exercise)) {
    return exercise[0] ?? null;
  }

  return exercise;
}

export default async function RoutineTemplatesPage() {
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

  const { data: templates } = await supabase
    .from("routine_templates")
    .select("*")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false });

  const templateIds = (templates ?? []).map((template) => template.id);

  const templateExercisesResult =
    templateIds.length > 0
      ? await supabase
          .from("routine_template_exercises")
          .select(
            `
            id,
            template_id,
            exercise_id,
            position,
            sets,
            reps,
            weight,
            rest,
            rir,
            notes,
            series_group_id,
            exercise:exercises (
              id,
              name,
              muscle_group,
              body_region,
              video_url
            )
          `
          )
          .in("template_id", templateIds)
          .order("position", { ascending: true })
      : { data: [], error: null };

  const templateSeriesSetupRequired = Boolean(
    templateExercisesResult.error &&
      (templateExercisesResult.error.code === "42703" ||
        templateExercisesResult.error.code === "PGRST204" ||
        templateExercisesResult.error.message.includes("series_group_id"))
  );
  let templateExercises = (templateExercisesResult.data ??
    []) as TemplateExerciseFromDb[];

  if (templateSeriesSetupRequired && templateIds.length > 0) {
    const { data: exercisesWithoutSeries } = await supabase
      .from("routine_template_exercises")
      .select(
        `
        id,
        template_id,
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
      .in("template_id", templateIds)
      .order("position", { ascending: true });

    templateExercises = (exercisesWithoutSeries ?? []).map((item) => ({
      ...item,
      series_group_id: null,
    })) as TemplateExerciseFromDb[];
  }

  const exerciseLibrary = await loadEffectiveExercises(supabase, user.id);

  const normalizedTemplateExercises = templateExercises.map((typedItem) => {
    return {
      ...typedItem,
      series_group_id: typedItem.series_group_id ?? null,
      exercise:
        exerciseLibrary.byId.get(typedItem.exercise_id) ??
        normalizeExercise(typedItem.exercise),
    };
  });

  const templatesWithExercises = (templates ?? []).map((template) => {
    return {
      ...template,
      template_exercises: normalizedTemplateExercises.filter(
        (item) => item.template_id === template.id
      ),
    };
  });

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-12 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        {exerciseLibrary.setupRequired && (
          <div className="mb-5 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-bold leading-6 text-amber-700 dark:text-amber-300">
            Ejecuta la migración multi-entrenador para activar la biblioteca
            privada. Tus plantillas actuales permanecen intactas.
          </div>
        )}
        <TemplateManager
          initialTemplates={templatesWithExercises}
          exercises={exerciseLibrary.catalog}
          seriesSetupRequired={templateSeriesSetupRequired}
        />
      </section>
    </main>
  );
}
