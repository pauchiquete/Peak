"use client";

import { FormEvent, useMemo, useState } from "react";
import { getCoachPlans } from "@/lib/coach-plans";
import { coaches, headCoach } from "@/lib/coaches";

type ContactExperienceProps = {
  initialCoachSlug: string | null;
  initialPlan: string | null;
};

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export default function ContactExperience({
  initialCoachSlug,
  initialPlan,
}: ContactExperienceProps) {
  const [selectedCoachSlug, setSelectedCoachSlug] = useState(
    initialCoachSlug ?? headCoach.slug
  );

  const selectedCoach = useMemo(
    () =>
      coaches.find((coach) => coach.slug === selectedCoachSlug) ?? headCoach,
    [selectedCoachSlug]
  );

  const firstName = getFirstName(selectedCoach.name);
  const profilePlans =
    selectedCoach.slug === "sergio-gonzales"
      ? getCoachPlans(selectedCoach.slug)
      : [];
  const selectedPlan =
    selectedCoach.slug === (initialCoachSlug ?? headCoach.slug)
      ? initialPlan
      : null;
  const directMessage = selectedPlan
    ? `Hola ${firstName}, vi tu perfil en Peak y me interesa el plan ${selectedPlan}. ¿Me puedes compartir más información?`
    : `Hola ${firstName}, vi tu perfil en Peak y me gustaría recibir información sobre tus planes de entrenamiento.`;
  const directWhatsAppUrl = `https://wa.me/${selectedCoach.contact.whatsapp}?text=${encodeURIComponent(
    directMessage
  )}`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const nombre = String(form.get("nombre") ?? "").trim();
    const objetivo = String(form.get("objetivo") ?? "").trim();
    const mensaje = String(form.get("mensaje") ?? "").trim();

    const text = [
      `Hola ${firstName}, soy ${nombre}. Vi tu perfil en Peak y me interesa iniciar entrenamiento contigo.`,
      selectedPlan ? `Me interesa el plan ${selectedPlan}.` : "",
      `Mi objetivo es: ${objetivo}.`,
      mensaje ? `Mensaje: ${mensaje}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    window.open(
      `https://wa.me/${selectedCoach.contact.whatsapp}?text=${encodeURIComponent(
        text
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const contactCards = (
    <div className="grid gap-3">
      <a
        href={directWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl transition hover:bg-[var(--surface-strong)]"
      >
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
          WhatsApp de {firstName}
        </p>
        <p className="mt-3 text-2xl font-black">
          {selectedCoach.contact.phoneDisplay}
        </p>
      </a>

      {selectedCoach.contact.instagram &&
        selectedCoach.contact.instagramUrl && (
          <a
            href={selectedCoach.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl transition hover:bg-[var(--surface-strong)]"
          >
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Instagram
            </p>
            <p className="mt-3 text-2xl font-black">
              {selectedCoach.contact.instagram}
            </p>
          </a>
        )}

      {selectedCoach.contact.email && (
        <a
          href={`mailto:${selectedCoach.contact.email}`}
          className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl transition hover:bg-[var(--surface-strong)]"
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            Correo
          </p>
          <p className="mt-3 break-all text-lg font-black sm:text-xl">
            {selectedCoach.contact.email}
          </p>
        </a>
      )}
    </div>
  );

  const plansSection = profilePlans.length > 0 && (
    <section
      aria-labelledby="sergio-plans-title"
      className="mx-auto mt-16 max-w-7xl"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
          Planes de Sergio
        </p>
        <h2
          id="sergio-plans-title"
          className="mt-5 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl"
        >
          Entrenamiento en línea con seguimiento directo.
        </h2>
        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          Elige la duración de tu proceso. Todos los planes se adaptan a tu
          nivel, objetivos y equipo disponible.
        </p>
      </div>

      <div className="mt-9 grid gap-4 lg:grid-cols-3">
        {profilePlans.map((plan) => {
          const planMessage = `Hola ${firstName}, vi tu perfil en Peak y me interesa el plan ${plan.name}. ¿Me puedes compartir más información?`;
          const planUrl = `https://wa.me/${selectedCoach.contact.whatsapp}?text=${encodeURIComponent(
            planMessage
          )}`;

          return (
            <article
              key={plan.name}
              className={`rounded-[30px] border p-7 ${
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
              <p className="mt-5 text-5xl font-black tracking-tight">
                {plan.price}
              </p>
              <p
                className={`mt-2 text-xs font-black uppercase tracking-[0.18em] ${
                  plan.featured ? "opacity-55" : "text-[var(--muted)]"
                }`}
              >
                {plan.period}
              </p>
              <p
                className={`mt-5 text-sm leading-7 ${
                  plan.featured ? "opacity-70" : "text-[var(--muted)]"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-6 space-y-3">
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

              <a
                href={planUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-7 flex items-center justify-center rounded-2xl px-5 py-4 text-center text-xs font-black uppercase tracking-[0.16em] transition active:scale-95 ${
                  plan.featured
                    ? "bg-[var(--button-text)] text-[var(--button-bg)]"
                    : "bg-[var(--button-bg)] text-[var(--button-text)]"
                }`}
              >
                Elegir plan
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Contacto
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
            Elige a tu coach.
            <br />
            Agenda tu valoración.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Conoce el enfoque de cada entrenador y abre una conversación directa
            por WhatsApp con quien mejor encaje contigo.
          </p>

          <div className="mt-8" aria-label="Selecciona a tu coach">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Quiero entrenar con
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {coaches.map((coach) => {
                const isSelected = coach.slug === selectedCoach.slug;

                return (
                  <button
                    key={coach.slug}
                    type="button"
                    onClick={() => setSelectedCoachSlug(coach.slug)}
                    aria-pressed={isSelected}
                    className={`rounded-[24px] border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text)] ${
                      isSelected
                        ? "border-[var(--text)] bg-[var(--button-bg)] text-[var(--button-text)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-strong)]"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.22em] ${
                        isSelected ? "opacity-60" : "text-[var(--muted)]"
                      }`}
                    >
                      {coach.role}
                    </span>
                    <span className="mt-2 block text-xl font-black">
                      {coach.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">
              Perfil de {firstName}
            </p>
            <p className="mt-3 text-lg font-black leading-7">
              {selectedCoach.intro}
            </p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-[var(--muted)]">
              {selectedCoach.biography.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedCoach.experience.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]"
                >
                  {item}
                </span>
              ))}
            </div>

            {selectedCoach.certifications.length > 0 && (
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                  Formación y certificaciones
                </p>
                <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
                  {selectedCoach.certifications.join(" · ")}
                </p>
              </div>
            )}
          </div>
      </section>

      {plansSection}

      <section className="mx-auto mt-16 grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {contactCards}
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8"
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            Mensaje para {selectedCoach.name}
          </p>

          {selectedPlan && (
            <p className="mt-4 w-fit rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
              Plan de interés: {selectedPlan}
            </p>
          )}

          <div className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="contact-name"
                className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]"
              >
                Nombre
              </label>

              <input
                id="contact-name"
                name="nombre"
                required
                autoComplete="name"
                placeholder="Tu nombre"
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none focus:border-[var(--text)]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-goal"
                className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]"
              >
                Objetivo
              </label>

              <select
                id="contact-goal"
                name="objetivo"
                required
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none focus:border-[var(--text)]"
              >
                <option>Perder grasa</option>
                <option>Ganar músculo</option>
                <option>Definición muscular</option>
                <option>Mejorar rendimiento</option>
                <option>Rehabilitación / movilidad</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]"
              >
                Mensaje
              </label>

              <textarea
                id="contact-message"
                name="mensaje"
                rows={5}
                placeholder="Cuéntanos un poco sobre ti..."
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none focus:border-[var(--text)]"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition hover:scale-[1.01] active:scale-95"
            >
              Abrir WhatsApp con {firstName}
            </button>
          </div>
        </form>
      </section>

    </main>
  );
}
