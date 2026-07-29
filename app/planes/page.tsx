import Link from "next/link";

const plans = [
  {
    name: "Mensual",
    price: "$1,600",
    period: "1 mes",
    description: "Ideal para comenzar y probar el método con seguimiento real.",
    features: [
      "Rutinas semanales",
      "Seguimiento personalizado",
      "Ajustes según progreso",
      "Acceso a plataforma",
    ],
  },
  {
    name: "Bimestral",
    price: "$2,100",
    period: "2 meses",
    description: "Mejor para construir constancia y notar cambios visibles.",
    features: [
      "8 semanas de entrenamiento",
      "Seguimiento 24/7",
      "Chequeo mensual",
      "Acceso a plataforma",
    ],
    featured: true,
  },
  {
    name: "Trimestral",
    price: "$2,500",
    period: "3 meses",
    description: "La mejor opción para un proceso completo y medible.",
    features: [
      "12 semanas de entrenamiento",
      "Progresión completa",
      "Mayor estructura",
      "Acceso a plataforma",
    ],
  },
];

export default function PlanesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Planes
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
            Elige el tiempo.
            <br />
            El plan se adapta a ti.
          </h1>

          <p className="mt-6 text-base leading-7 text-[var(--muted)] sm:text-lg">
            Todos los planes incluyen entrenamiento personalizado, seguimiento y
            acceso a la plataforma. La diferencia está en el tiempo de
            acompañamiento.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`
                relative
                overflow-hidden
                rounded-[30px]
                border
                p-7
                backdrop-blur-xl
                ${
                  plan.featured
                    ? "border-[var(--text)] bg-[var(--button-bg)] text-[var(--button-text)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                }
              `}
            >
              {plan.featured && (
                <div className="mb-5 w-fit rounded-full bg-[var(--button-text)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--button-bg)]">
                  Recomendado
                </div>
              )}

              <p
                className={`text-xs font-black uppercase tracking-[0.28em] ${
                  plan.featured ? "opacity-55" : "text-[var(--muted)]"
                }`}
              >
                {plan.name}
              </p>

              <h2 className="mt-6 text-5xl font-black tracking-tight">
                {plan.price}
              </h2>

              <p
                className={`mt-2 text-sm font-black uppercase tracking-[0.2em] ${
                  plan.featured ? "opacity-55" : "text-[var(--muted)]"
                }`}
              >
                {plan.period}
              </p>

              <p
                className={`mt-5 text-sm leading-7 ${
                  plan.featured ? "opacity-65" : "text-[var(--muted)]"
                }`}
              >
                {plan.description}
              </p>

              <div
                className={`my-7 h-px ${
                  plan.featured
                    ? "bg-[var(--button-text)]/20"
                    : "bg-[var(--border)]"
                }`}
              />

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <p
                    key={feature}
                    className={`text-sm font-bold ${
                      plan.featured ? "opacity-75" : "text-[var(--muted)]"
                    }`}
                  >
                    ✓ {feature}
                  </p>
                ))}
              </div>

              <Link
                href="/contacto"
                className={`
                  mt-8
                  flex
                  items-center
                  justify-center
                  rounded-2xl
                  px-6
                  py-4
                  text-center
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.16em]
                  transition
                  active:scale-95
                  ${
                    plan.featured
                      ? "bg-[var(--button-text)] text-[var(--button-bg)]"
                      : "bg-[var(--button-bg)] text-[var(--button-text)]"
                  }
                `}
              >
                Agendar
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Activación
          </p>

          <h2 className="mt-4 text-3xl font-black">
            El coach activa tu cuenta.
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Después de confirmar el plan directamente con el coach, se crea tu
            acceso a la plataforma para que puedas ver tus rutinas, ejercicios y
            videos.
          </p>
        </div>
      </section>
    </main>
  );
}