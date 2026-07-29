import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function CoachDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    redirect("/dashboard/client");
  }

  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: exercisesCount } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true });

  const { count: templatesCount } = await supabase
    .from("routine_templates")
    .select("*", { count: "exact", head: true });

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Dashboard Coach
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
              Hola, {profile?.full_name}.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Administra clientes, rutinas predeterminadas y ejercicios desde un
              solo lugar.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Link
            href="/dashboard/coach/clientes"
            className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition hover:bg-[var(--surface-strong)] active:scale-[0.99]"
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
              01
            </p>

            <h2 className="mt-5 text-3xl font-black">Clientes</h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {clientsCount ?? 0} clientes registrados. Crea clientes, conecta
              su login y asigna entrenamientos.
            </p>
          </Link>

          <Link
            href="/dashboard/coach/rutinas-predeterminadas"
            className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition hover:bg-[var(--surface-strong)] active:scale-[0.99]"
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
              02
            </p>

            <h2 className="mt-5 text-3xl font-black">
              Rutinas predeterminadas
            </h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {templatesCount ?? 0} plantillas creadas. Guarda rutinas base para
              pierna, push, pull, glúteo o full body.
            </p>
          </Link>

          <Link
            href="/dashboard/coach/ejercicios"
            className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition hover:bg-[var(--surface-strong)] active:scale-[0.99]"
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
              03
            </p>

            <h2 className="mt-5 text-3xl font-black">Ejercicios</h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {exercisesCount ?? 0} ejercicios disponibles. Crea, edita, elimina
              y abre videos demostrativos.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}