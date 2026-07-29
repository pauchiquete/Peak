import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExerciseLibrary from "@/components/dashboard/exercises/ExerciseLibrary";

export default async function CoachExercisesPage() {
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

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, body_region, video_url, created_at")
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-28 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                Biblioteca
              </p>

              <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
                Ejercicios.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Crea, edita y organiza ejercicios con video. Esta biblioteca se
                usa para rutinas de clientes y plantillas.
              </p>
            </div>

            <Link
              href="/dashboard/coach"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
            >
              Volver
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <ExerciseLibrary exercises={exercises ?? []} />
        </div>
      </section>
    </main>
  );
}