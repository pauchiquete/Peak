import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-[var(--bg)] px-5 py-20 text-[var(--text)] sm:px-8 lg:px-10">
      <div
        className="
          mx-auto
          max-w-4xl
          rounded-[34px]
          border
          border-[var(--border)]
          bg-[var(--button-bg)]
          px-6
          py-16
          text-center
          text-[var(--button-text)]
          sm:px-10
          sm:py-20
        "
      >
        <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50">
          Primera valoración
        </p>

        <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
          El mejor momento para empezar es hoy.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 opacity-60 sm:text-lg">
          Agenda una valoración y descubre qué tipo de entrenamiento necesitas
          para avanzar con estructura.
        </p>

        <Link
          href="/contacto"
          className="
            mt-9
            inline-flex
            rounded-2xl
            bg-[var(--button-text)]
            px-8
            py-4
            text-sm
            font-black
            uppercase
            tracking-[0.18em]
            text-[var(--button-bg)]
            transition
            hover:scale-[1.03]
            active:scale-95
          "
        >
          Agendar valoración
        </Link>
      </div>
    </section>
  );
}