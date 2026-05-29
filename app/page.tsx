"use client";

import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "+200", label: "Clientes" },
  { value: "4 años", label: "Experiencia" },
  { value: "98%", label: "Satisfacción" },
];

const services = [
  { title: "Plan Personalizado",   desc: "Rutina diseñada para tu cuerpo, objetivo y estilo de vida. Nada genérico, nada copiado." },
  { title: "Seguimiento Semanal",  desc: "Revisamos progreso, ajustamos el plan y mantenemos la motivación alta cada semana." },
  { title: "Asesoría Nutricional", desc: "Guía alimentaria adaptada a ti. Sin dietas extremas ni restricciones absurdas." },
];

export default function Home() {
  return (
    <main>

      {/* ══════════════════════════════
          HERO — pantalla completa
      ══════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-end overflow-hidden"
        style={{ minHeight: "100svh" }}
      >
        {/* Fondo */}
        <div className="absolute inset-0">
          <Image
            src="/coach.jpeg"
            alt="Peak Level Training"
            fill
            className="object-cover object-top"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.05) 0%, rgba(13,13,13,0.95) 75%)" }}
          />
        </div>

        {/* Texto */}
        <div
          className="relative z-10 w-full text-center"
          style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 96px" }}
        >
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase rounded-full anim-fadeIn"
            style={{
              padding: "8px 20px",
              marginBottom: "28px",
              background: "rgba(245,240,235,0.12)",
              color: "#f5f0eb",
              border: "1px solid rgba(245,240,235,0.22)",
              backdropFilter: "blur(8px)",
            }}
          >
            Entrenamiento Personal Online
          </span>

          <h1
            className="font-display font-black text-white anim-fadeUp"
            style={{ fontSize: "clamp(3.2rem, 13vw, 6rem)", lineHeight: 1.0, marginBottom: "24px" }}
          >
            Alcanza tu
            <br />
            <em style={{ opacity: 0.88 }}>Peak.</em>
          </h1>

          <p
            className="anim-fadeUp-d1"
            style={{
              color: "rgba(245,240,235,0.68)",
              fontSize: "clamp(1rem, 3vw, 1.15rem)",
              lineHeight: 1.8,
              maxWidth: "460px",
              margin: "0 auto 40px",
            }}
          >
            Entrenamiento personalizado, seguimiento semanal y asesoría nutricional.
            Sin excusas. Sin rutinas genéricas.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center anim-fadeUp-d2"
          >
            <Link
              href="/contacto"
              className="font-bold tracking-widest uppercase rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#f5f0eb", color: "#0d0d0d", fontSize: "13px", padding: "18px 36px" }}
            >
              Empezar ahora
            </Link>
            <Link
              href="/planes"
              className="font-bold tracking-widest uppercase rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(245,240,235,0.08)",
                color: "#f5f0eb",
                border: "1px solid rgba(245,240,235,0.25)",
                backdropFilter: "blur(8px)",
                fontSize: "13px",
                padding: "18px 36px",
              }}
            >
              Ver planes
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute flex flex-col items-center gap-1.5 anim-pulse"
          style={{ bottom: "32px", left: "50%", transform: "translateX(-50%)", color: "rgba(245,240,235,0.4)", zIndex: 10 }}
        >
          <span style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase" }}>Scroll</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS — franja oscura
      ══════════════════════════════ */}
      <section style={{ background: "#0d0d0d", padding: "64px 24px" }}>
        <div
          className="grid grid-cols-3"
          style={{ maxWidth: "600px", margin: "0 auto", gap: "16px", textAlign: "center" }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "8px" }}>
              <p
                className="font-display font-black"
                style={{ fontSize: "clamp(2rem, 6vw, 2.8rem)", color: "#f5f0eb", lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "rgba(245,240,235,0.4)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginTop: "8px",
                  fontWeight: 600,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          SERVICIOS
      ══════════════════════════════ */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          <h2
            className="font-display font-black text-center"
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)", color: "var(--foreground)", marginBottom: "12px" }}
          >
            ¿Qué incluye?
          </h2>
          <p
            className="text-center"
            style={{ color: "var(--muted)", fontSize: "15px", marginBottom: "56px" }}
          >
            Todo lo que necesitas en un solo plan.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {services.map((s) => (
              <div
                key={s.title}
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                  padding: "28px",
                  borderRadius: "20px",
                  background: "var(--card-alt)",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: "24px", flexShrink: 0, marginTop: "2px" }}></span>
                <div>
                  <h3
                    style={{
                      color: "var(--foreground)",
                      fontWeight: 700,
                      fontSize: "15px",
                      marginBottom: "8px",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.7 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA FINAL
      ══════════════════════════════ */}
      <section style={{ padding: "0 24px 100px" }}>
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            background: "#0d0d0d",
            borderRadius: "28px",
            padding: "80px 48px",
            textAlign: "center",
          }}
        >
          <h2
            className="font-display font-black"
            style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#f5f0eb", lineHeight: 1.2, marginBottom: "16px" }}
          >
            El mejor momento
            <br />
            para empezar es hoy.
          </h2>
          <p style={{ color: "rgba(245,240,235,0.48)", fontSize: "15px", lineHeight: 1.8, marginBottom: "40px" }}>
            Primera asesoría sin costo. Sin compromisos.
          </p>
          <Link
            href="/contacto"
            className="inline-block font-bold tracking-widest uppercase rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "#f5f0eb", color: "#0d0d0d", fontSize: "13px", padding: "18px 40px" }}
          >
            Agendar asesoría gratis
          </Link>
        </div>
      </section>

    </main>
  );
}