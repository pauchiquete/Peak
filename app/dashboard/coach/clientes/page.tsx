import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientManager from "@/components/dashboard/clients/ClientManager";

export default async function CoachClientsPage() {
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

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Clientes
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
              Administra tus clientes.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Crea clientes y guarda su objetivo, contacto y notas importantes.
              Después asignaremos entrenamientos personalizados a cada uno.
            </p>
          </div>

          <Link
            href="/dashboard/coach"
            className="
              rounded-2xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
              px-5
              py-3
              text-center
              text-xs
              font-black
              uppercase
              tracking-[0.18em]
              text-[var(--text)]
              backdrop-blur-xl
              transition
              hover:bg-[var(--surface-strong)]
            "
          >
            Volver
          </Link>
        </div>

        <div className="mt-10">
            <ClientManager initialClients={clients ?? []} />        </div>
      </section>
    </main>
  );
}