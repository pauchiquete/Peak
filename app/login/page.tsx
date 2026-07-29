"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const supabase = createClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "coach") {
      router.push("/dashboard/coach");
      return;
    }

    router.push("/dashboard/client");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
          Peak App
        </p>

        <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
          Accede a tu entrenamiento.
        </h1>

        <p className="mt-6 text-base leading-8 text-[var(--muted)]">
          Entra como entrenador o cliente para consultar programas, rutinas y
          seguimiento.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8"
        >
          <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            Correo
          </label>

          <input
            name="email"
            type="email"
            required
            placeholder="correo@ejemplo.com"
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
          />

          <label className="mt-5 block text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            Contraseña
          </label>

          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
          />

          {error && (
            <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}