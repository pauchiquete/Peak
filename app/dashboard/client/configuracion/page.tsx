import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";
import ChangePasswordForm from "@/components/dashboard/clients/ChangePasswordForm";
import { loadCoachAccess } from "@/lib/coach-access";

export default async function ClientSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { profile } = await loadCoachAccess(supabase, user.id, user.email);

  if (profile?.role === "coach") {
    redirect("/dashboard/coach");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-12 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/client"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
          >
            Volver
          </Link>

          <LogoutButton />
        </div>

        {profile?.is_demo ? (
          <div className="rounded-[30px] border border-sky-500/30 bg-sky-500/10 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Cuenta de demostración
            </p>
            <h1 className="mt-4 text-4xl font-black">
              La contraseña está protegida.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Esta cuenta se comparte para mostrar la experiencia del cliente,
              por eso sus credenciales no se pueden cambiar desde la interfaz.
            </p>
          </div>
        ) : (
          <ChangePasswordForm />
        )}
      </section>
    </main>
  );
}
