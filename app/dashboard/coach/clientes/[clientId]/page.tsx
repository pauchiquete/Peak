import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoutineManager from "@/components/dashboard/routines/RoutineManager";
import ApplyTemplateForm from "@/components/dashboard/routines/ApplyTemplateForm";
import {
  isMissingProgressWeightUnitsError,
  normalizeProgressEntry,
  type ExerciseProgressEntryFromDb,
} from "@/lib/exercise-progress";
import {
  getMexicoCityDateKey,
  type WorkoutCompletionEntry,
} from "@/lib/workout-calendar";

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
  series_group_id?: string | null;
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
  const todayInMexico = getMexicoCityDateKey();

  const { data: workoutTracking, error: workoutTrackingError } =
    await supabase
      .from("clients")
      .select("workout_tracking_started_on")
      .eq("id", client.id)
      .eq("coach_id", user.id)
      .maybeSingle();
  const workoutTrackingStartedOn =
    typeof workoutTracking?.workout_tracking_started_on === "string"
      ? workoutTracking.workout_tracking_started_on
      : todayInMexico;

  const { data: workoutScheduleData, error: workoutScheduleError } =
    dayIds.length > 0
      ? await supabase
          .from("workout_days")
          .select("id, schedule_started_on")
          .eq("client_id", client.id)
          .eq("coach_id", user.id)
          .in("id", dayIds)
      : { data: [], error: null };
  const scheduleStartByDayId = new Map(
    (workoutScheduleData ?? []).map((day) => [
      day.id,
      typeof day.schedule_started_on === "string"
        ? day.schedule_started_on
        : todayInMexico,
    ])
  );

  let initialWorkoutCompletions: WorkoutCompletionEntry[] = [];
  let workoutCompletionError = workoutTrackingError ?? workoutScheduleError;

  if (!workoutTrackingError && !workoutScheduleError && dayIds.length > 0) {
    const completionPageSize = 1000;

    for (
      let completionOffset = 0;
      ;
      completionOffset += completionPageSize
    ) {
      const completionResult = await supabase
        .from("workout_day_completions")
        .select("id, client_id, workout_day_id, completed_on, created_at")
        .eq("client_id", client.id)
        .in("workout_day_id", dayIds)
        .gte("completed_on", workoutTrackingStartedOn)
        .lte("completed_on", todayInMexico)
        .order("completed_on", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(completionOffset, completionOffset + completionPageSize - 1);

      if (completionResult.error) {
        workoutCompletionError = completionResult.error;
        initialWorkoutCompletions = [];
        break;
      }

      const completionPage = (completionResult.data ??
        []) as WorkoutCompletionEntry[];
      initialWorkoutCompletions.push(...completionPage);

      if (completionPage.length < completionPageSize) break;
    }
  }

  const workoutCalendarReady =
    !workoutTrackingError &&
    !workoutScheduleError &&
    !workoutCompletionError;

  const { data: workoutExercises } =
    dayIds.length > 0
      ? await supabase
          .from("workout_exercises")
          .select(
            `
            *,
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
      series_group_id: typedItem.series_group_id ?? null,
      exercise: normalizeExercise(typedItem.exercise),
    };
  });

  const assignedExerciseIds = [
    ...new Set(normalizedWorkoutExercises.map((item) => item.exercise_id)),
  ];
  let progressData: ExerciseProgressEntryFromDb[] = [];
  let progressError: { code?: string; message: string } | null = null;
  let progressWeightUnitsReady = true;

  if (assignedExerciseIds.length > 0) {
    const progressResult = await supabase
      .from("exercise_progress_logs")
      .select(
        "id, client_id, exercise_id, workout_exercise_id, weight_kg, weight_value, weight_unit, reps, notes, recorded_on, created_at"
      )
      .eq("client_id", client.id)
      .in("exercise_id", assignedExerciseIds)
      .order("recorded_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    progressData = (progressResult.data ??
      []) as ExerciseProgressEntryFromDb[];
    progressError = progressResult.error;

    if (isMissingProgressWeightUnitsError(progressResult.error)) {
      progressWeightUnitsReady = false;

      const legacyProgressResult = await supabase
        .from("exercise_progress_logs")
        .select(
          "id, client_id, exercise_id, workout_exercise_id, weight_kg, reps, notes, recorded_on, created_at"
        )
        .eq("client_id", client.id)
        .in("exercise_id", assignedExerciseIds)
        .order("recorded_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);

      progressData = (legacyProgressResult.data ??
        []) as ExerciseProgressEntryFromDb[];
      progressError = legacyProgressResult.error;
    }
  }

  const initialProgressEntries = progressData.map(normalizeProgressEntry);

  const daysWithExercises = (workoutDays ?? []).map((day) => {
    return {
      ...day,
      schedule_started_on:
        scheduleStartByDayId.get(day.id) ?? todayInMexico,
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
          initialProgressEntries={initialProgressEntries}
          progressStorageReady={!progressError}
          progressWeightUnitsReady={progressWeightUnitsReady}
          initialWorkoutCompletions={initialWorkoutCompletions}
          workoutTrackingStartedOn={workoutTrackingStartedOn}
          workoutCalendarReady={workoutCalendarReady}
          todayInMexico={todayInMexico}
        />
      </section>
    </main>
  );
}
