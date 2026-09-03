import type { ReactNode } from "react";
import { getSeriesLabel } from "@/lib/workout-exercise-groups";

type RoutineSeriesBlockProps = {
  exerciseCount: number;
  children: ReactNode;
  onUngroup?: () => void;
  ungrouping?: boolean;
};

export default function RoutineSeriesBlock({
  exerciseCount,
  children,
  onUngroup,
  ungrouping = false,
}: RoutineSeriesBlockProps) {
  return (
    <div className="rounded-[28px] border-2 border-[var(--text)] bg-[var(--surface-strong)] p-3 sm:p-4">
      <div className="flex flex-col gap-4 px-2 pb-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em]">
            {getSeriesLabel(exerciseCount)}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Completa los ejercicios en este orden como un solo bloque.
          </p>
        </div>

        {onUngroup && (
          <button
            type="button"
            onClick={onUngroup}
            disabled={ungrouping}
            className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {ungrouping ? "Separando..." : "Desagrupar"}
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}
