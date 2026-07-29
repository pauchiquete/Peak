import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TemplateManager from "@/components/dashboard/templates/TemplateManager";

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

  const { data: templateExercises } =
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
      : { data: [] };

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, body_region, video_url")
    .order("name", { ascending: true });

  const normalizedTemplateExercises = (templateExercises ?? []).map((item) => {
    const typedItem = item as TemplateExerciseFromDb;

    return {
      ...typedItem,
      exercise: normalizeExercise(typedItem.exercise),
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
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-28 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <TemplateManager
          initialTemplates={templatesWithExercises}
          exercises={exercises ?? []}
        />
      </section>
    </main>
  );
}