import { NextResponse } from "next/server";
import { coaches } from "@/lib/coaches";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function normalizePhone(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("coach_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientError || !client?.coach_id) {
    return NextResponse.json(
      { error: "Tu cuenta todavía no tiene un coach asignado." },
      { status: 404 }
    );
  }

  let coachProfile:
    | {
        full_name: string | null;
        email: string | null;
        coach_slug?: string | null;
        whatsapp_phone?: string | null;
      }
    | null = null;

  const enhancedResult = await admin
    .from("profiles")
    .select("full_name, email, coach_slug, whatsapp_phone")
    .eq("id", client.coach_id)
    .maybeSingle();

  if (!enhancedResult.error) {
    coachProfile = enhancedResult.data;
  } else {
    const legacyResult = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", client.coach_id)
      .maybeSingle();
    coachProfile = legacyResult.data;
  }

  if (!coachProfile) {
    return NextResponse.json(
      { error: "No encontramos la información de tu coach." },
      { status: 404 }
    );
  }

  const publicCoach = coaches.find(
    (coach) =>
      coach.slug === coachProfile?.coach_slug ||
      (coach.contact.email &&
        coach.contact.email.toLowerCase() ===
          String(coachProfile?.email ?? "").toLowerCase())
  );
  const phone = normalizePhone(
    coachProfile.whatsapp_phone ?? publicCoach?.contact.whatsapp
  );

  if (!phone) {
    return NextResponse.json(
      { error: "Tu coach todavía no ha configurado su WhatsApp." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      name: coachProfile.full_name ?? publicCoach?.name ?? "tu coach",
      phone,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}
