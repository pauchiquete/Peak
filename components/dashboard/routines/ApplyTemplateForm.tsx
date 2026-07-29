"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RoutineTemplateSummary = {
  id: string;
  name: string;
  focus: string | null;
  level: string | null;
  notes: string | null;
  exercise_count: number;
};

type ApplyTemplateFormProps = {
  clientId: string;
  templates: RoutineTemplateSummary[];
};

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function ApplyTemplateForm({
  clientId,
  templates,
}: ApplyTemplateFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleApplyTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const templateId = String(form.get("template_id") ?? "");
    const dayOfWeek = String(form.get("day_of_week") ?? "");

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/coach/routines/apply-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        template_id: templateId,
        day_of_week: dayOfWeek,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "No se pudo aplicar la plantilla.");
      setLoading(false);
      return;
    }

    setMessage("Plantilla aplicada correctamente.");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mb-5 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Rutina predeterminada
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Aplicar plantilla.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Copia una rutina base completa a este cliente y luego puedes
            editarla como rutina normal.
          </p>
        </div>

        {templates.length === 0 && (
          <Link
            href="/dashboard/coach/rutinas-predeterminadas"
            className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)]"
          >
            Crear plantilla
          </Link>
        )}
      </div>

      {templates.length > 0 && (
        <form onSubmit={handleApplyTemplate} className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <select
            name="template_id"
            required
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} · {template.exercise_count} ejercicios
              </option>
            ))}
          </select>

          <select
            name="day_of_week"
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
          >
            {weekDays.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] disabled:opacity-50"
          >
            {loading ? "Aplicando..." : "Aplicar"}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm font-bold text-[var(--muted)]">
          {message}
        </p>
      )}
    </div>
  );
}