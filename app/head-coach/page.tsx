import Image from "next/image";
import Link from "next/link";

import { coachPlans } from "@/lib/coach-plans";
import { headCoach } from "@/lib/coaches";

export default function HeadCoachPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--surface)]">
          <Image
            src="/coach.jpeg"
            alt={`${headCoach.name}, Head Coach de Peak`}
            fill
            priority
            className="object-cover object-[58%_center] sm:object-[62%_center] lg:object-contain lg:object-right"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[var(--bg)]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/95 to-[var(--bg)]/25 lg:via-[var(--bg)]/90 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-transparent lg:h-36" />
          <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative z-10 flex min-h-[820px] items-center p-7 sm:min-h-[760px] sm:p-10 lg:min-h-[780px] lg:p-14">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                {headCoach.role} · Peak
              </p>

              <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
                {headCoach.name}
              </h1>

              <p className="mt-7 text-lg font-bold leading-8">
                {headCoach.intro}
              </p>

              <div className="mt-6 space-y-4">
                {headCoach.biography.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[var(--muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/contacto?coach=${headCoach.slug}`}
                  className="rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition hover:scale-[1.02] active:scale-95"
                >
                  Entrenar con Sebastián
                </Link>

                <a
                  href="#planes"
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/70 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.18em] backdrop-blur-md transition hover:bg-[var(--surface-strong)] active:scale-95"
                >
                  Ver planes
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl sm:mt-20">
        <div className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-[4/5] min-h-[420px] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[680px]">
            <Image
              src="/coach2.jpeg"
              alt={`${headCoach.name} durante una sesión de entrenamiento`}
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 44vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent lg:hidden" />
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Trayectoria y certificaciones
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Experiencia que guía cada entrenamiento.
            </h2>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {headCoach.experience.map((item) => (
                <div
                  key={item}
                  className="flex min-h-24 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg)]/55 p-4 text-center text-sm font-bold text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {headCoach.certifications.map((certification) => (
                <span
                  key={certification}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-2 text-xs font-bold text-[var(--muted)]"
                >
                  {certification}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-5xl sm:mt-16">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {headCoach.specialties.map((specialty) => (
            <article
              key={specialty}
              className="flex min-h-20 items-center justify-center rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-center sm:min-h-24"
            >
              <h2 className="text-sm font-black leading-snug sm:text-base">
                {specialty}
              </h2>
            </article>
          ))}
        </div>
      </section>

      <section id="planes" className="mx-auto mt-24 max-w-7xl scroll-mt-28">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Planes de Sebastián
          </p>

          <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
            Elige el tiempo. El plan se adapta a ti.
          </h2>

          <p className="mt-6 text-base leading-7 text-[var(--muted)] sm:text-lg">
            Todos los planes incluyen entrenamiento personalizado, seguimiento y
            acceso a la plataforma. La diferencia está en el tiempo de
            acompañamiento.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {coachPlans.map((plan) => (
            <article
              key={plan.name}
              className={`relative overflow-hidden rounded-[30px] border p-7 ${
                plan.featured
                  ? "border-[var(--text)] bg-[var(--button-bg)] text-[var(--button-text)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
            >
              {plan.featured && (
                <p className="w-fit rounded-full bg-[var(--button-text)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--button-bg)]">
                  Recomendado
                </p>
              )}

              <p
                className={`text-xs font-black uppercase tracking-[0.28em] ${
                  plan.featured ? "mt-5 opacity-55" : "text-[var(--muted)]"
                }`}
              >
                {plan.name}
              </p>

              <p className="mt-6 text-5xl font-black tracking-tight">
                {plan.price}
              </p>
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
                href={`/contacto?coach=${headCoach.slug}&plan=${encodeURIComponent(plan.name)}`}
                className={`mt-8 flex items-center justify-center rounded-2xl px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] transition active:scale-95 ${
                  plan.featured
                    ? "bg-[var(--button-text)] text-[var(--button-bg)]"
                    : "bg-[var(--button-bg)] text-[var(--button-text)]"
                }`}
              >
                Elegir plan
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl">
        <div className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-9 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Contacto directo
            </p>
            <h2 className="mt-4 text-3xl font-black">
              Habla con {headCoach.name}.
            </h2>
            <p className="mt-4 text-base text-[var(--muted)]">
              WhatsApp {headCoach.contact.phoneDisplay}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0">
            {headCoach.contact.instagramUrl && headCoach.contact.instagram && (
              <a
                href={headCoach.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-[var(--border)] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em]"
              >
                {headCoach.contact.instagram}
              </a>
            )}

            <a
              href={`https://wa.me/${headCoach.contact.whatsapp}?text=${encodeURIComponent("Hola Sebastián, vi tu perfil como Head Coach de Peak y me gustaría recibir información sobre tus planes de entrenamiento.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[var(--button-text)]"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
