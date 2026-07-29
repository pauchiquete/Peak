import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const clientId = String(body.client_id ?? "").trim();
    const templateId = String(body.template_id ?? "").trim();
    const dayOfWeek = String(body.day_of_week ?? "").trim();

    if (!clientId || !templateId) {
      return NextResponse.json(
        { error: "Faltan datos para aplicar la plantilla." },
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "coach") {
      return NextResponse.json(
        { error: "Solo el coach puede aplicar plantillas." },
        { status: 403 }
      );
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("coach_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    const { data: template } = await supabase
      .from("routine_templates")
      .select("id, name, notes")
      .eq("id", templateId)
      .eq("coach_id", user.id)
      .single();

    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada." },
        { status: 404 }
      );
    }

    const { data: templateExercises, error: templateExercisesError } =
      await supabase
        .from("routine_template_exercises")
        .select(
          "exercise_id, position, sets, reps, weight, rest, rir, notes"
        )
        .eq("template_id", templateId)
        .order("position", { ascending: true });

    if (templateExercisesError) {
      return NextResponse.json(
        { error: templateExercisesError.message },
        { status: 400 }
      );
    }

    const { data: workoutDay, error: workoutDayError } = await supabase
      .from("workout_days")
      .insert({
        client_id: clientId,
        coach_id: user.id,
        title: template.name,
        day_of_week: dayOfWeek || null,
        notes: template.notes || null,
      })
      .select("*")
      .single();

    if (workoutDayError || !workoutDay) {
      return NextResponse.json(
        {
          error:
            workoutDayError?.message ??
            "No se pudo crear el día de entrenamiento.",
        },
        { status: 400 }
      );
    }

    if ((templateExercises ?? []).length > 0) {
      const rows = templateExercises!.map((item) => ({
        workout_day_id: workoutDay.id,
        exercise_id: item.exercise_id,
        position: item.position,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight,
        rest: item.rest,
        rir: item.rir,
        notes: item.notes,
      }));

      const { error: insertExercisesError } = await supabase
        .from("workout_exercises")
        .insert(rows);

      if (insertExercisesError) {
        return NextResponse.json(
          { error: insertExercisesError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      workout_day_id: workoutDay.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado aplicando plantilla.",
      },
      { status: 500 }
    );
  }
}