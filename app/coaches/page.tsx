import { coaches } from "@/lib/coaches";
import CoachDirectory from "./CoachDirectory";

export default function CoachesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-24 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Coaches Peak
            </p>

            <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Encuentra al coach que conecte contigo.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Conoce la experiencia y el enfoque de cada entrenador. Elige el
              perfil que más se acerque a tus objetivos y abre una conversación
              directa por WhatsApp.
            </p>
          </div>

          <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Un mismo estándar
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Todos nuestros entrenadores han sido evaluados por el Head Coach
              y cumplen con el estándar de calidad de Peak.
            </p>
          </aside>
        </div>

        <CoachDirectory coaches={coaches} />
      </section>
    </main>
  );
}
