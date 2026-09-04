type RoutineDayToggleProps = {
  buttonId: string;
  panelId: string;
  dayOfWeek: string | null;
  title: string;
  exerciseCount: number;
  expanded: boolean;
  onToggle: () => void;
};

export default function RoutineDayToggle({
  buttonId,
  panelId,
  dayOfWeek,
  title,
  exerciseCount,
  expanded,
  onToggle,
}: RoutineDayToggleProps) {
  const exerciseLabel = `${exerciseCount} ${
    exerciseCount === 1 ? "ejercicio" : "ejercicios"
  }`;

  return (
    <h2>
      <button
        id={buttonId}
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--text)] sm:px-6 sm:py-6"
      >
        <span className="min-w-0">
          <span className="block text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
            {dayOfWeek || "Día de entrenamiento"}
          </span>
          <span className="mt-2 block text-2xl font-black tracking-tight sm:text-3xl">
            {title}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="flex shrink-0 items-center gap-3"
        >
          <span className="text-xs font-bold text-[var(--muted)] sm:text-sm">
            {exerciseLabel}
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`h-5 w-5 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </span>
        <span className="sr-only">
          {expanded ? "Ocultar rutina" : "Mostrar rutina"}: {exerciseLabel}
        </span>
      </button>
    </h2>
  );
}
