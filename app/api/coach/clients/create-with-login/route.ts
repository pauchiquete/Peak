import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const objective = String(body.objective ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No hay sesión activa." },
        { status: 401 }
      );
    }

    const { data: coachProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (coachProfile?.role !== "coach") {
      return NextResponse.json(
        { error: "Solo el coach puede crear clientes." },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    let clientUserId = existingProfile?.id ?? null;

    if (existingProfile && existingProfile.role !== "client") {
      return NextResponse.json(
        { error: "Ese correo ya existe, pero no pertenece a un cliente." },
        { status: 400 }
      );
    }

    if (!clientUserId) {
      const { data: createdUser, error: createUserError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role: "client",
          },
        });

      if (createUserError || !createdUser.user) {
        return NextResponse.json(
          {
            error:
              createUserError?.message ??
              "No se pudo crear el usuario cliente.",
          },
          { status: 400 }
        );
      }

      clientUserId = createdUser.user.id;

      await admin.from("profiles").upsert({
        id: clientUserId,
        full_name: fullName,
        email,
        role: "client",
      });
    }

    const { data: repeatedClient } = await admin
      .from("clients")
      .select("id")
      .eq("coach_id", user.id)
      .eq("user_id", clientUserId)
      .maybeSingle();

    if (repeatedClient) {
      return NextResponse.json(
        { error: "Este cliente ya está creado y vinculado." },
        { status: 400 }
      );
    }

    const { data: client, error: clientError } = await admin
      .from("clients")
      .insert({
        coach_id: user.id,
        user_id: clientUserId,
        full_name: fullName,
        email,
        phone: phone || null,
        objective: objective || null,
        notes: notes || null,
      })
      .select("*")
      .single();

    if (clientError) {
      return NextResponse.json(
        { error: clientError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado creando cliente.",
      },
      { status: 500 }
    );
  }
}