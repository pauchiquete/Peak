"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const password = String(form.get("password") ?? "").trim();
    const confirmPassword = String(form.get("confirm_password") ?? "").trim();

    setMessage("");

    if (password.length < 8) {
      setMessage("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    formElement.reset();
    setMessage("Contraseña actualizada correctamente.");
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleChangePassword}
      className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
        Seguridad
      </p>

      <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
        Cambiar contraseña.
      </h1>

      <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
        Usa esta sección para reemplazar tu contraseña temporal por una
        contraseña personal.
      </p>

      <div className="mt-8 grid gap-4">
        <input
          name="password"
          type="password"
          required
          placeholder="Nueva contraseña"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        />

        <input
          name="confirm_password"
          type="password"
          required
          placeholder="Confirmar nueva contraseña"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
        />

        {message && (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 text-sm font-bold text-[var(--muted)]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition active:scale-95 disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </div>
    </form>
  );
}