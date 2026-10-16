import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    console.error(`Falta ${name} en .env.local`);
    process.exit(1);
  }

  return value;
}

const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
const supabasePublishableKey = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
);
const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
const coachEmail = (
  process.env.DEMO_COACH_EMAIL ?? "coach.demo@peakleveltraining.mx"
).trim().toLowerCase();
const coachPassword = required("DEMO_COACH_PASSWORD");
const clientEmail = (
  process.env.DEMO_CLIENT_EMAIL ?? "cliente.demo@peakleveltraining.mx"
).trim().toLowerCase();
const clientPassword = required("DEMO_CLIENT_PASSWORD");
const coachName = (process.env.DEMO_COACH_NAME ?? "Coach Demo Peak").trim();
const clientName = (process.env.DEMO_CLIENT_NAME ?? "Cliente Demo Peak").trim();
const coachWhatsapp = (
  process.env.DEMO_COACH_WHATSAPP ?? "525548792525"
).replace(/\D/g, "");
const resetDemoContent = process.argv.includes("--reset");
let currentStage = "inicio";

if (coachPassword.length < 10 || clientPassword.length < 10) {
  throw new Error("Las contraseñas demo deben tener al menos 10 caracteres.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (match) return match;
    if (data.users.length < 1000) return null;
  }

  throw new Error("No se pudo completar la búsqueda de usuarios demo.");
}

async function ensureAuthUser({ email, password, fullName, role }) {
  const existing = await findUserByEmail(email);

  if (existing) {
    const { data: existingProfile, error: profileError } = await admin
      .from("profiles")
      .select("id, role, is_demo")
      .eq("id", existing.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!existingProfile?.is_demo || existingProfile.role !== role) {
      throw new Error(
        `El correo ${email} ya pertenece a una cuenta que no es demo. No se modificó.`
      );
    }

    const appMetadata = {
      ...(existing.app_metadata ?? {}),
      role,
      demo: true,
      peak_demo_reset_until: new Date(Date.now() + 60_000).toISOString(),
    };
    const { error: unlockError } = await admin.auth.admin.updateUserById(
      existing.id,
      { app_metadata: appMetadata }
    );

    if (unlockError) throw unlockError;

    let updatedUser = null;
    let updateFailure = null;

    try {
      const { data, error } = await admin.auth.admin.updateUserById(
        existing.id,
        {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role, demo: true },
        }
      );

      if (error || !data.user) {
        updateFailure = error ?? new Error("No se actualizó el usuario demo.");
      } else {
        updatedUser = data.user;
      }
    } finally {
      const { error: protectError } = await admin.auth.admin.updateUserById(
        existing.id,
        {
          app_metadata: { ...appMetadata, peak_demo_reset_until: null },
        }
      );

      if (protectError) throw protectError;
    }

    if (updateFailure) throw updateFailure;
    if (!updatedUser) throw new Error("No se actualizó el usuario demo.");

    return updatedUser;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role, demo: true },
    app_metadata: {
      role,
      demo: true,
      peak_demo_reset_until: null,
    },
  });

  if (error || !data.user) throw error ?? new Error("No se creó el usuario.");
  return data.user;
}

async function ensureProfile(user, profile) {
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: profile.fullName,
      email: profile.email,
      role: profile.role,
      is_head_coach: false,
      is_demo: true,
      coach_slug: profile.coachSlug ?? null,
      whatsapp_phone: profile.whatsappPhone ?? null,
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}

async function ensureDemoClient(coachId, clientUserId) {
  const { data: existing, error: lookupError } = await admin
    .from("clients")
    .select("id, coach_id")
    .eq("user_id", clientUserId)
    .limit(1)
    .maybeSingle();

  if (lookupError) throw lookupError;

  const values = {
    coach_id: coachId,
    user_id: clientUserId,
    full_name: clientName,
    email: clientEmail,
    phone: "+52 55 0000 0000",
    objective: "Mejorar fuerza y condición física",
    notes: "Cliente muestra para recorridos comerciales de la plataforma.",
  };

  if (existing) {
    if (existing.coach_id !== coachId) {
      throw new Error(
        "El cliente demo ya está asignado a otro coach. No se reasignó."
      );
    }

    const { data, error } = await admin
      .from("clients")
      .update(values)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await admin
    .from("clients")
    .insert(values)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function resetDemoWorkspace(coachId, clientId) {
  const [templatesResult, daysResult] = await Promise.all([
    admin.from("routine_templates").select("id").eq("coach_id", coachId),
    admin
      .from("workout_days")
      .select("id")
      .eq("coach_id", coachId)
      .eq("client_id", clientId),
  ]);

  if (templatesResult.error) throw templatesResult.error;
  if (daysResult.error) throw daysResult.error;

  const templateIds = (templatesResult.data ?? []).map((item) => item.id);
  const workoutDayIds = (daysResult.data ?? []).map((item) => item.id);

  const preRoutineDeletes = [
    admin.from("exercise_progress_logs").delete().eq("client_id", clientId),
    admin
      .from("client_progress_reminder_state")
      .delete()
      .eq("client_id", clientId),
  ];

  for (const operation of preRoutineDeletes) {
    const { error } = await operation;
    if (error) throw error;
  }

  if (workoutDayIds.length > 0) {
    const { error: exerciseError } = await admin
      .from("workout_exercises")
      .delete()
      .in("workout_day_id", workoutDayIds);
    if (exerciseError) throw exerciseError;

    const { error: dayError } = await admin
      .from("workout_days")
      .delete()
      .in("id", workoutDayIds);
    if (dayError) throw dayError;
  }

  // Los triggers de calendario fotografían el historial antes de borrar una
  // rutina. En una cuenta demo sí queremos un reinicio total, por eso estos
  // registros se limpian después de eliminar los días.
  const historyDeletes = [
    admin.from("workout_day_completions").delete().eq("client_id", clientId),
    admin.from("workout_calendar_entries").delete().eq("client_id", clientId),
  ];

  for (const operation of historyDeletes) {
    const { error } = await operation;
    if (error) throw error;
  }

  if (templateIds.length > 0) {
    const { error: exerciseError } = await admin
      .from("routine_template_exercises")
      .delete()
      .in("template_id", templateIds);
    if (exerciseError) throw exerciseError;

    const { error: templateError } = await admin
      .from("routine_templates")
      .delete()
      .in("id", templateIds);
    if (templateError) throw templateError;
  }

  const { error: overrideError } = await admin
    .from("exercise_overrides")
    .delete()
    .eq("coach_id", coachId);
  if (overrideError) throw overrideError;

  const { error: customExerciseError } = await admin
    .from("exercises")
    .delete()
    .eq("owner_coach_id", coachId)
    .eq("is_shared_base", false);
  if (customExerciseError) throw customExerciseError;
}

async function getBaseExercises() {
  const { data, error } = await admin
    .from("exercises")
    .select("id")
    .eq("is_shared_base", true)
    .is("archived_at", null)
    .order("name", { ascending: true })
    .limit(3);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("No hay ejercicios base para preparar la cuenta demo.");
  }

  return data.map((exercise) => exercise.id);
}

async function ensureDemoTemplate(coachId, exerciseIds) {
  const templateName = "Plantilla muestra · Full body";
  const { data: existing, error: lookupError } = await admin
    .from("routine_templates")
    .select("id")
    .eq("coach_id", coachId)
    .eq("name", templateName)
    .limit(1)
    .maybeSingle();
  if (lookupError) throw lookupError;

  let templateId = existing?.id;

  if (!templateId) {
    const { data, error } = await admin
      .from("routine_templates")
      .insert({
        coach_id: coachId,
        name: templateName,
        focus: "Full body",
        level: "Intermedio",
        notes: "Plantilla editable de ejemplo para conocer la plataforma.",
      })
      .select("id")
      .single();
    if (error) throw error;
    templateId = data.id;
  } else if (resetDemoContent) {
    const { error: updateError } = await admin
      .from("routine_templates")
      .update({
        focus: "Full body",
        level: "Intermedio",
        notes: "Plantilla editable de ejemplo para conocer la plataforma.",
      })
      .eq("id", templateId)
      .eq("coach_id", coachId);
    if (updateError) throw updateError;

    const { error: clearError } = await admin
      .from("routine_template_exercises")
      .delete()
      .eq("template_id", templateId);
    if (clearError) throw clearError;
  }

  const { count, error: countError } = await admin
    .from("routine_template_exercises")
    .select("id", { count: "exact", head: true })
    .eq("template_id", templateId);
  if (countError) throw countError;

  if (!count) {
    const { error } = await admin.from("routine_template_exercises").insert(
      exerciseIds.map((exerciseId, index) => ({
        template_id: templateId,
        exercise_id: exerciseId,
        position: index + 1,
        sets: "3",
        reps: index === 0 ? "8-10" : "10-12",
        rest: "90 s",
        rir: "2",
        notes: "Ejercicio de muestra",
      }))
    );
    if (error) throw error;
  }
}

async function ensureDemoWorkout(coachId, clientId, exerciseIds) {
  const days = [
    { title: "Rutina muestra · Fuerza", day: "Lunes" },
    { title: "Rutina muestra · Técnica", day: "Miércoles" },
    { title: "Rutina muestra · Full body", day: "Viernes" },
  ];

  for (const [dayIndex, definition] of days.entries()) {
    const { data: existing, error: lookupError } = await admin
      .from("workout_days")
      .select("id")
      .eq("coach_id", coachId)
      .eq("client_id", clientId)
      .eq("title", definition.title)
      .limit(1)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let workoutDayId = existing?.id;

    if (!workoutDayId) {
      const { data, error } = await admin
        .from("workout_days")
        .insert({
          coach_id: coachId,
          client_id: clientId,
          title: definition.title,
          day_of_week: definition.day,
          notes: "Día editable de demostración.",
        })
        .select("id")
        .single();
      if (error) throw error;
      workoutDayId = data.id;
    } else if (resetDemoContent) {
      const { error: updateError } = await admin
        .from("workout_days")
        .update({
          day_of_week: definition.day,
          notes: "Día editable de demostración.",
        })
        .eq("id", workoutDayId)
        .eq("coach_id", coachId)
        .eq("client_id", clientId);
      if (updateError) throw updateError;

      const { error: clearError } = await admin
        .from("workout_exercises")
        .delete()
        .eq("workout_day_id", workoutDayId);
      if (clearError) throw clearError;
    }

    const { count, error: countError } = await admin
      .from("workout_exercises")
      .select("id", { count: "exact", head: true })
      .eq("workout_day_id", workoutDayId);
    if (countError) throw countError;

    if (!count) {
      const rotated = exerciseIds.map(
        (_, index) => exerciseIds[(index + dayIndex) % exerciseIds.length]
      );
      const { error } = await admin.from("workout_exercises").insert(
        rotated.map((exerciseId, index) => ({
          workout_day_id: workoutDayId,
          exercise_id: exerciseId,
          position: index + 1,
          sets: "3",
          reps: index === 0 ? "8-10" : "10-12",
          rest: "90 s",
          rir: "2",
          notes: "Registro de muestra",
        }))
      );
      if (error) throw error;
    }
  }
}

async function verifyDemoLogin({ email, password, role }) {
  const sessionClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data: login, error: loginError } =
    await sessionClient.auth.signInWithPassword({ email, password });

  if (loginError || !login.user) {
    throw loginError ?? new Error(`No se pudo iniciar sesión con ${email}.`);
  }

  const { data: profile, error: profileError } = await sessionClient
    .from("profiles")
    .select("role, is_demo")
    .eq("id", login.user.id)
    .single();

  if (profileError) throw profileError;
  if (profile?.role !== role || !profile.is_demo) {
    throw new Error(`El perfil demo ${email} no tiene el rol esperado.`);
  }

  if (role === "coach") {
    const [{ count: clients, error: clientError }, { count: templates, error: templateError }] =
      await Promise.all([
        sessionClient
          .from("clients")
          .select("id", { count: "exact", head: true }),
        sessionClient
          .from("routine_templates")
          .select("id", { count: "exact", head: true }),
      ]);

    if (clientError) throw clientError;
    if (templateError) throw templateError;
    if (!clients || !templates) {
      throw new Error("El coach demo no puede consultar sus datos muestra.");
    }
  } else {
    const { data: client, error: clientError } = await sessionClient
      .from("clients")
      .select("id")
      .eq("user_id", login.user.id)
      .single();

    if (clientError || !client) {
      throw clientError ?? new Error("El cliente demo no está vinculado.");
    }

    const { count: days, error: daysError } = await sessionClient
      .from("workout_days")
      .select("id", { count: "exact", head: true })
      .eq("client_id", client.id);

    if (daysError) throw daysError;
    if (!days) {
      throw new Error("El cliente demo no puede consultar su rutina muestra.");
    }
  }

  await sessionClient.auth.signOut();
  console.log(`Acceso ${role} verificado: ${email}`);
}

async function main() {
  currentStage = "preparar usuario demo coach";
  const coachUser = await ensureAuthUser({
    email: coachEmail,
    password: coachPassword,
    fullName: coachName,
    role: "coach",
  });
  currentStage = "guardar perfil demo coach";
  await ensureProfile(coachUser, {
    email: coachEmail,
    fullName: coachName,
    role: "coach",
    coachSlug: "coach-demo-peak",
    whatsappPhone: coachWhatsapp,
  });

  currentStage = "preparar usuario demo cliente";
  const clientUser = await ensureAuthUser({
    email: clientEmail,
    password: clientPassword,
    fullName: clientName,
    role: "client",
  });
  currentStage = "guardar perfil demo cliente";
  await ensureProfile(clientUser, {
    email: clientEmail,
    fullName: clientName,
    role: "client",
  });

  currentStage = "vincular cliente demo";
  const clientId = await ensureDemoClient(coachUser.id, clientUser.id);
  if (resetDemoContent) {
    currentStage = "limpiar espacio demo";
    await resetDemoWorkspace(coachUser.id, clientId);
  }
  currentStage = "cargar biblioteca base";
  const exerciseIds = await getBaseExercises();
  currentStage = "preparar plantilla demo";
  await ensureDemoTemplate(coachUser.id, exerciseIds);
  currentStage = "preparar rutinas demo";
  await ensureDemoWorkout(coachUser.id, clientId, exerciseIds);
  currentStage = "verificar login demo coach";
  await verifyDemoLogin({
    email: coachEmail,
    password: coachPassword,
    role: "coach",
  });
  currentStage = "verificar login demo cliente";
  await verifyDemoLogin({
    email: clientEmail,
    password: clientPassword,
    role: "client",
  });

  console.log("Cuenta demo preparada correctamente.");
  console.log(`Coach: ${coachEmail}`);
  console.log(`Cliente: ${clientEmail}`);
  console.log("Las contraseñas permanecen únicamente en tu .env.local.");
  if (resetDemoContent) {
    console.log("La plantilla y las tres rutinas muestra volvieron a su estado inicial.");
  }
}

main().catch((error) => {
  console.error(`Falló la etapa: ${currentStage}`);
  if (error instanceof Error) {
    console.error(error.message);
  } else if (error && typeof error === "object") {
    const details = [
      error.message,
      error.code,
      error.status,
      error.details,
      error.hint,
    ].filter(Boolean);
    console.error(details.length > 0 ? details.join(" · ") : String(error));
  } else {
    console.error(String(error));
  }
  process.exitCode = 1;
});
