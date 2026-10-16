import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingMultiCoachSchemaError } from "@/lib/coach-access";

export type EffectiveExercise = {
  id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
  created_at?: string;
  owner_coach_id: string | null;
  is_shared_base: boolean;
  archived_at: string | null;
  source: "base" | "custom";
  has_override: boolean;
  hidden: boolean;
};

type ExerciseRow = Omit<
  EffectiveExercise,
  "source" | "has_override" | "hidden"
>;

type ExerciseOverrideRow = {
  exercise_id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
  hidden: boolean;
};

export type EffectiveExerciseLibrary = {
  all: EffectiveExercise[];
  catalog: EffectiveExercise[];
  byId: Map<string, EffectiveExercise>;
  setupRequired: boolean;
  error: { code?: string; message: string } | null;
};

function sortExercises(items: EffectiveExercise[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function asLegacyExercise(row: {
  id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
  created_at?: string;
}): EffectiveExercise {
  return {
    ...row,
    owner_coach_id: null,
    is_shared_base: true,
    archived_at: null,
    source: "base",
    has_override: false,
    hidden: false,
  };
}

export async function loadEffectiveExercises(
  supabase: SupabaseClient,
  coachId: string
): Promise<EffectiveExerciseLibrary> {
  const exerciseResult = await supabase
    .from("exercises")
    .select(
      "id, name, muscle_group, body_region, video_url, created_at, owner_coach_id, is_shared_base, archived_at"
    )
    .or(`is_shared_base.eq.true,owner_coach_id.eq.${coachId}`)
    .order("name", { ascending: true });

  if (exerciseResult.error) {
    const missingSchema = isMissingMultiCoachSchemaError(exerciseResult.error);

    if (!missingSchema) {
      return {
        all: [],
        catalog: [],
        byId: new Map(),
        setupRequired: false,
        error: exerciseResult.error,
      };
    }

    const legacyResult = await supabase
      .from("exercises")
      .select("id, name, muscle_group, body_region, video_url, created_at")
      .order("name", { ascending: true });
    const legacyItems = sortExercises(
      (legacyResult.data ?? []).map(asLegacyExercise)
    );

    return {
      all: legacyItems,
      catalog: legacyItems,
      byId: new Map(legacyItems.map((item) => [item.id, item])),
      setupRequired: true,
      error: legacyResult.error,
    };
  }

  const overrideResult = await supabase
    .from("exercise_overrides")
    .select(
      "exercise_id, name, muscle_group, body_region, video_url, hidden"
    )
    .eq("coach_id", coachId);

  if (overrideResult.error) {
    const missingSchema = isMissingMultiCoachSchemaError(overrideResult.error);

    if (!missingSchema) {
      return {
        all: [],
        catalog: [],
        byId: new Map(),
        setupRequired: false,
        error: overrideResult.error,
      };
    }
  }

  const overrides = new Map(
    ((overrideResult.data ?? []) as ExerciseOverrideRow[]).map((item) => [
      item.exercise_id,
      item,
    ])
  );

  const all = sortExercises(
    ((exerciseResult.data ?? []) as ExerciseRow[]).map((exercise) => {
      const override = overrides.get(exercise.id);

      return {
        ...exercise,
        name: override?.name ?? exercise.name,
        muscle_group: override?.muscle_group ?? exercise.muscle_group,
        body_region: override ? override.body_region : exercise.body_region,
        video_url: override ? override.video_url : exercise.video_url,
        source: exercise.is_shared_base ? "base" : "custom",
        has_override: Boolean(override),
        hidden: Boolean(override?.hidden),
      };
    })
  );
  const catalog = all.filter(
    (exercise) => !exercise.hidden && !exercise.archived_at
  );

  return {
    all,
    catalog,
    byId: new Map(all.map((item) => [item.id, item])),
    setupRequired: Boolean(overrideResult.error),
    error: null,
  };
}
