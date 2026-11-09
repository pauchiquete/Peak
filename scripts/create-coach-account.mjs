import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function requiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta ${name} en .env.local.`);
  }

  return value;
}

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function generateTemporaryPassword() {
  return `Peak!${randomBytes(12).toString("base64url")}9a`;
}

async function readInput() {
  const lines = createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
    terminal: false,
  });

  for await (const line of lines) {
    const raw = line.trim();
    if (!raw) continue;

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("El contenido recibido por stdin no es JSON válido.");
    }
  }

  throw new Error(
    "Envía por stdin un JSON con email, full_name, coach_slug y whatsapp_phone."
  );
}

function validateInput(input) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const fullName = String(input.full_name ?? "").trim();
  const coachSlug = String(input.coach_slug ?? "").trim().toLowerCase();
  const whatsappPhone = normalizePhone(input.whatsapp_phone);
  const requestedPassword = String(input.temporary_password ?? "").trim();
  const allowClientConversion = input.allow_client_conversion === true;
  const resetPassword = input.reset_password === true;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("El correo del coach no es válido.");
  }

  if (fullName.length < 2) {
    throw new Error("El nombre completo del coach es obligatorio.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(coachSlug)) {
    throw new Error(
      "coach_slug sólo puede contener minúsculas, números y guiones."
    );
  }

  if (whatsappPhone.length < 10 || whatsappPhone.length > 15) {
    throw new Error("whatsapp_phone debe incluir código de país y sólo números.");
  }

  if (requestedPassword && requestedPassword.length < 12) {
    throw new Error("La contraseña temporal debe tener al menos 12 caracteres.");
  }

  return {
    email,
    fullName,
    coachSlug,
    whatsappPhone,
    requestedPassword,
    allowClientConversion,
    resetPassword,
  };
}

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

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
      (user) => user.email?.toLowerCase() === email
    );

    if (match) return match;
    if (data.users.length < 1000) return null;
  }

  throw new Error("No se pudo completar la búsqueda de usuarios.");
}

async function assertExistingCoachIsSafe(user, { allowClientConversion }) {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, role, is_head_coach, is_demo")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!profile) {
    throw new Error(
      "El correo ya existe en Authentication pero no tiene un perfil verificable. No se modificó."
    );
  }

  if (profile.role === "client") {
    if (!allowClientConversion) {
      throw new Error(
        "El correo ya pertenece a un perfil client. No se modificó."
      );
    }

    const { count, error: linkedClientError } = await admin
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (linkedClientError) throw linkedClientError;
    if (count) {
      throw new Error(
        "El perfil cliente todavía tiene datos vinculados. No se convirtió automáticamente."
      );
    }
  } else if (profile.role !== "coach") {
    throw new Error(
      `El correo ya pertenece a un perfil ${profile.role ?? "sin rol"}. No se modificó.`
    );
  }

  if (profile.is_head_coach || profile.is_demo) {
    throw new Error(
      "La cuenta existente es Head Coach o demo y no puede modificarse con este script."
    );
  }

  return profile;
}

async function verifyNewCoachLogin({ email, password, userId }) {
  const sessionClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data: login, error: loginError } =
    await sessionClient.auth.signInWithPassword({ email, password });

  if (loginError || login.user?.id !== userId) {
    throw loginError ?? new Error("No se pudo verificar el acceso del coach.");
  }

  const { data: profile, error: profileError } = await sessionClient
    .from("profiles")
    .select("role, is_head_coach, is_demo")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;
  if (
    profile.role !== "coach" ||
    profile.is_head_coach ||
    profile.is_demo
  ) {
    throw new Error("El perfil creado no tiene los permisos de coach esperados.");
  }

  const { error: clientsError } = await sessionClient
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("coach_id", userId);

  if (clientsError) throw clientsError;

  const { count: baseExercises, error: exercisesError } = await sessionClient
    .from("exercises")
    .select("id", { count: "exact", head: true })
    .eq("is_shared_base", true)
    .is("archived_at", null);

  if (exercisesError) throw exercisesError;
  if (!baseExercises) {
    throw new Error("El coach creado no puede consultar la biblioteca Peak.");
  }

  await sessionClient.auth.signOut();
}

async function main() {
  const input = validateInput(await readInput());
  const existingUser = await findUserByEmail(input.email);
  const temporaryPassword =
    input.requestedPassword || generateTemporaryPassword();
  let authUser = existingUser;
  let created = false;
  let convertedFromClient = false;
  const passwordWasReset = Boolean(existingUser && input.resetPassword);

  if (existingUser) {
    const existingProfile = await assertExistingCoachIsSafe(existingUser, input);
    convertedFromClient = existingProfile.role === "client";

    const { data, error } = await admin.auth.admin.updateUserById(
      existingUser.id,
      {
        ...(input.resetPassword ? { password: temporaryPassword } : {}),
        user_metadata: {
          ...(existingUser.user_metadata ?? {}),
          full_name: input.fullName,
          role: "coach",
        },
        app_metadata: {
          ...(existingUser.app_metadata ?? {}),
          role: "coach",
          demo: false,
        },
      }
    );

    if (error || !data.user) {
      throw error ?? new Error("No se pudo actualizar el usuario coach.");
    }

    authUser = data.user;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        role: "coach",
      },
      app_metadata: {
        role: "coach",
        demo: false,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error("No se pudo crear el usuario coach.");
    }

    authUser = data.user;
    created = true;
  }

  if (!authUser) {
    throw new Error("No se obtuvo el usuario coach.");
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: authUser.id,
      full_name: input.fullName,
      email: input.email,
      role: "coach",
      is_head_coach: false,
      is_demo: false,
      coach_slug: input.coachSlug,
      whatsapp_phone: input.whatsappPhone,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    if (created) {
      await admin.auth.admin.deleteUser(authUser.id);
    }

    throw profileError;
  }

  if (created || passwordWasReset) {
    try {
      await verifyNewCoachLogin({
        email: input.email,
        password: temporaryPassword,
        userId: authUser.id,
      });
    } catch (error) {
      if (created) {
        await admin.auth.admin.deleteUser(authUser.id);
      }
      throw error;
    }
  }

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      created,
      converted_from_client: convertedFromClient,
      id: authUser.id,
      email: input.email,
      temporary_password:
        created || passwordWasReset ? temporaryPassword : null,
      message:
        created || passwordWasReset
          ? "Acceso de coach verificado. Debe cambiar la contraseña temporal al iniciar sesión."
          : "El perfil del coach existente se actualizó sin cambiar su contraseña.",
    })}\n`
  );
}

main().catch((error) => {
  const message =
    error instanceof Error
      ? error.message
      : String(error?.message ?? error ?? "Error inesperado.");

  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exitCode = 1;
});
