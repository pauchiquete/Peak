import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { loadCoachAccess } from "@/lib/coach-access";
import { createClient } from "@/lib/supabase/server";

type CoachRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  is_demo?: boolean;
};

type ClientRow = {
  id: string;
  coach_id: string;
  user_id: string | null;
  full_name: string;
  objective: string | null;
  created_at: string;
};

type WorkoutDayRow = {
  id: string;
  client_id: string;
  coach_id: string;
};

type CalendarRow = {
  client_id: string;
  scheduled_on: string;
  completed_at: string | null;
};

type ProgressRow = {
  client_id: string;
  recorded_on: string;
};

function formatDate(value: string | null) {
  if (!value) return "Sin actividad reciente";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

export default async function CoachTeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await loadCoachAccess(supabase, user.id, user.email);

  if (access.profile?.role !== "coach") redirect("/dashboard/client");
  if (!access.profile.is_head_coach) redirect("/dashboard/coach");

  const enhancedCoaches = await supabase
    .from("profiles")
    .select("id, full_name, email, is_demo")
    .eq("role", "coach")
    .order("full_name", { ascending: true });

  let coaches = (enhancedCoaches.data ?? []) as CoachRow[];
  let setupRequired = access.setupRequired;

  if (enhancedCoaches.error) {
    const legacyCoaches = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "coach")
      .order("full_name", { ascending: true });
    coaches = (legacyCoaches.data ?? []) as CoachRow[];
    setupRequired = true;
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 27);
  const sinceKey = since.toISOString().slice(0, 10);

  const [clientsResult, daysResult, calendarResult, progressResult] =
    await Promise.all([
    supabase
      .from("clients")
      .select("id, coach_id, user_id, full_name, objective, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("workout_days").select("id, client_id, coach_id"),
    supabase
      .from("workout_calendar_entries")
      .select("client_id, scheduled_on, completed_at")
      .gte("scheduled_on", sinceKey)
      .order("scheduled_on", { ascending: false }),
    supabase
      .from("exercise_progress_logs")
      .select("client_id, recorded_on")
      .gte("recorded_on", sinceKey)
      .order("recorded_on", { ascending: false }),
  ]);

  const clients = (clientsResult.data ?? []) as ClientRow[];
  const workoutDays = (daysResult.data ?? []) as WorkoutDayRow[];
  const calendar = (calendarResult.data ?? []) as CalendarRow[];
  const progress = (progressResult.data ?? []) as ProgressRow[];
  const dataError =
    clientsResult.error ??
    daysResult.error ??
    calendarResult.error ??
    progressResult.error;

  const linkedClients = clients.filter((client) => client.user_id).length;
  const completedSessions = calendar.filter((entry) => entry.completed_at).length;
  const adherence =
    calendar.length > 0
      ? Math.round((completedSessions / calendar.length) * 100)
      : null;

  const coachSummaries = coaches.map((coach) => {
    const coachClients = clients.filter(
      (client) => client.coach_id === coach.id
    );
    const clientIds = new Set(coachClients.map((client) => client.id));
    const coachDays = workoutDays.filter((day) => clientIds.has(day.client_id));
    const coachCalendar = calendar.filter((entry) =>
      clientIds.has(entry.client_id)
    );
    const coachCompleted = coachCalendar.filter(
      (entry) => entry.completed_at
    ).length;
    const coachProgress = progress.filter((entry) =>
      clientIds.has(entry.client_id)
    );
    const latestActivity = coachCalendar[0]?.scheduled_on ?? null;

    return {
      ...coach,
      clients: coachClients,
      days: coachDays,
      calendar: coachCalendar,
      progress: coachProgress,
      completed: coachCompleted,
      adherence:
        coachCalendar.length > 0
          ? Math.round((coachCompleted / coachCalendar.length) * 100)
          : null,
      latestActivity,
    };
  });

  const alerts = clients
    .flatMap((client) => {
      const clientDays = workoutDays.filter(
        (day) => day.client_id === client.id
      );
      const clientCalendar = calendar.filter(
        (entry) => entry.client_id === client.id
      );
      const clientCompleted = clientCalendar.filter(
        (entry) => entry.completed_at
      ).length;
      const clientAdherence =
        clientCalendar.length >= 2
          ? Math.round((clientCompleted / clientCalendar.length) * 100)
          : null;
      const messages: string[] = [];

      if (!client.user_id) messages.push("sin acceso vinculado");
      if (clientDays.length === 0) messages.push("sin rutina asignada");
      if (clientAdherence !== null && clientAdherence < 50) {
        messages.push(`${clientAdherence}% de cumplimiento en 28 días`);
      }

      return messages.length > 0
        ? [{ client, message: messages.join(" · ") }]
        : [];
    })
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-12 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Supervisión Head Coach
            </p>
            <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
              Equipo Peak.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
              Un resumen breve de entrenadores, clientes, rutinas y constancia
              durante los últimos 28 días.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/coach"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em]"
            >
              Volver
            </Link>
            <LogoutButton />
          </div>
        </div>

        {(setupRequired || dataError) && (
          <div className="mt-8 rounded-[24px] border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-bold leading-6 text-amber-700 dark:text-amber-300">
            {dataError
              ? "Aún no se puede consultar toda la información del equipo."
              : "Vista compatible activa."} Ejecuta la migración
            multi-entrenador para habilitar la supervisión completa y segura.
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Entrenadores", coaches.length],
            ["Clientes", clients.length],
            ["Con acceso", `${linkedClients}/${clients.length}`],
            ["Adherencia · 28 días", adherence === null ? "Sin datos" : `${adherence}%`],
          ].map(([label, value]) => (
            <article
              key={String(label)}
              className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                {label}
              </p>
              <p className="mt-4 text-4xl font-black">{value}</p>
            </article>
          ))}
        </div>

        {alerts.length > 0 && (
          <section className="mt-8 rounded-[30px] border border-amber-500/30 bg-amber-500/10 p-6 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
              Atención recomendada
            </p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {alerts.map(({ client, message }) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-amber-500/20 bg-[var(--bg)]/60 px-4 py-3"
                >
                  <p className="font-black">{client.full_name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-5">
          {coachSummaries.map((coach) => (
            <article
              key={coach.id}
              className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--muted)]">
                      Coach
                    </p>
                    {coach.is_demo && (
                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-sky-600">
                        Demo
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-3xl font-black">
                    {coach.full_name || coach.email || "Coach sin nombre"}
                  </h2>
                  {coach.email && (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {coach.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["Clientes", coach.clients.length],
                    ["Con login", coach.clients.filter((item) => item.user_id).length],
                    ["Días", coach.days.length],
                    ["Adherencia", coach.adherence === null ? "—" : `${coach.adherence}%`],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                        {label}
                      </p>
                      <p className="mt-2 text-xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-5 text-xs font-bold text-[var(--muted)]">
                Última actividad: {formatDate(coach.latestActivity)}
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {coach.clients.map((client) => {
                  const days = coach.days.filter(
                    (day) => day.client_id === client.id
                  ).length;
                  const entries = coach.calendar.filter(
                    (entry) => entry.client_id === client.id
                  );
                  const completed = entries.filter(
                    (entry) => entry.completed_at
                  ).length;
                  const progressEntries = coach.progress.filter(
                    (entry) => entry.client_id === client.id
                  );

                  return (
                    <div
                      key={client.id}
                      className="rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black">{client.full_name}</h3>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {client.objective || "Sin objetivo registrado"}
                          </p>
                        </div>
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            client.user_id ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          title={client.user_id ? "Con login" : "Sin login"}
                        />
                      </div>
                      <p className="mt-4 text-xs font-bold text-[var(--muted)]">
                        {days} días de rutina · {completed}/{entries.length}
                        sesiones completadas
                      </p>
                      <p className="mt-2 text-xs font-bold text-[var(--muted)]">
                        Bitácora 28 días: {progressEntries.length} registros
                        {progressEntries[0]
                          ? ` · última ${formatDate(progressEntries[0].recorded_on)}`
                          : ""}
                      </p>
                      <Link
                        href={`/dashboard/coach/clientes/${client.id}`}
                        className="mt-4 inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition hover:bg-[var(--surface-strong)]"
                      >
                        {client.coach_id === user.id
                          ? "Administrar cliente"
                          : "Ver seguimiento"}
                      </Link>
                    </div>
                  );
                })}

                {coach.clients.length === 0 && (
                  <p className="rounded-[22px] border border-dashed border-[var(--border)] px-5 py-8 text-sm text-[var(--muted)]">
                    Este coach todavía no tiene clientes asignados.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
