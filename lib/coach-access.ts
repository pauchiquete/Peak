import type { SupabaseClient } from "@supabase/supabase-js";

export const HEAD_COACH_EMAIL = "sebgnzlzram@gmail.com";

type QueryError = {
  code?: string;
  message?: string;
} | null;

export type CoachAccessProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_head_coach: boolean;
  is_demo: boolean;
  coach_slug: string | null;
  whatsapp_phone: string | null;
};

export function isMissingMultiCoachSchemaError(error: QueryError) {
  if (!error) return false;

  return (
    error.code === "42703" ||
    error.code === "42P01" ||
    error.code === "PGRST204" ||
    String(error.message ?? "").includes("is_head_coach") ||
    String(error.message ?? "").includes("is_demo") ||
    String(error.message ?? "").includes("coach_slug") ||
    String(error.message ?? "").includes("whatsapp_phone")
  );
}

export async function loadCoachAccess(
  supabase: SupabaseClient,
  userId: string,
  sessionEmail?: string | null
) {
  const enhancedResult = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, is_head_coach, is_demo, coach_slug, whatsapp_phone"
    )
    .eq("id", userId)
    .maybeSingle();

  if (!enhancedResult.error) {
    const row = enhancedResult.data;

    return {
      profile: row
        ? ({
            id: row.id,
            full_name: row.full_name ?? null,
            email: row.email ?? sessionEmail ?? null,
            role: row.role ?? null,
            is_head_coach: Boolean(row.is_head_coach),
            is_demo: Boolean(row.is_demo),
            coach_slug: row.coach_slug ?? null,
            whatsapp_phone: row.whatsapp_phone ?? null,
          } as CoachAccessProfile)
        : null,
      setupRequired: false,
      error: null,
    };
  }

  if (!isMissingMultiCoachSchemaError(enhancedResult.error)) {
    return {
      profile: null,
      setupRequired: false,
      error: enhancedResult.error,
    };
  }

  const legacyResult = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .maybeSingle();

  const legacy = legacyResult.data;
  const email = String(legacy?.email ?? sessionEmail ?? "").toLowerCase();

  return {
    profile: legacy
      ? ({
          id: legacy.id,
          full_name: legacy.full_name ?? null,
          email: legacy.email ?? sessionEmail ?? null,
          role: legacy.role ?? null,
          is_head_coach: email === HEAD_COACH_EMAIL,
          is_demo: false,
          coach_slug:
            email === HEAD_COACH_EMAIL ? "sebastian-gonzalez" : null,
          whatsapp_phone:
            email === HEAD_COACH_EMAIL ? "525548792525" : null,
        } as CoachAccessProfile)
      : null,
    setupRequired: true,
    error: legacyResult.error,
  };
}
