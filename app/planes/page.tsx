"use client";

import Link from "next/link";

const plans = [
  {
    name: "Básico",
    price: "$XXX",
    period: "/ mes",
    tag: null,
    featured: false,
    description: "Ideal para comenzar con una rutina estructurada y apoyo profesional.",
    features: [
      "Rutina mensual personalizada",
      "Ajuste cada 4 semanas",
      "Guía de ejercicios en video",
      "Soporte por WhatsApp",
    ],
  },
  {
    name: "Intermedio",
    price: "$XXX",
    period: "/ mes",
    tag: "Más popular",
    featured: true,
    description: "Para quienes quieren resultados reales, rápidos y sostenibles.",
    features: [
      "Todo lo del plan Básico",
      "Seguimiento semanal 1 a 1",
      "Ajuste de rutina semanal",
      "Asesoría nutricional básica",
      "Check-in de progreso mensual",
    ],
  },
  {
    name: "Personalizado",
    price: "A consultar",
    period: "",
    tag: "Premium",
    featured: false,
    description: "Coaching completo adaptado 100% a tu cuerpo y estilo de vida.",
    features: [
      "Todo lo del plan Intermedio",
      "Sesiones en vivo (Zoom/Meet)",
      "Plan nutricional completo",
      "Acceso prioritario al coach",
      "Seguimiento diario",
    ],
  },
];

export default function Planes() {
  return (
    <main style={{ minHeight: "100svh", paddingTop: "100px", paddingBottom: "100px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              padding: "8px 20px",
              borderRadius: "999px",
              marginBottom: "24px",
              background: "var(--card-alt)",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            Elige tu plan
          </span>
          <h1
            className="font-display font-black"
            style={{ fontSize: "clamp(2.4rem, 8vw, 3.5rem)", color: "var(--foreground)", lineHeight: 1.1, marginBottom: "16px" }}
          >
            Inversión en ti
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.7 }}>
            Todos los planes incluyen acceso a la app de PLT y atención personalizada.
          </p>
        </div>

        {/* ── Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                position: "relative",
                borderRadius: "24px",
                padding: "40px",
                ...(plan.featured
                  ? { background: "#0d0d0d", border: "none" }
                  : { background: "var(--card-alt)", border: "1px solid var(--border)" }),
              }}
            >
              {/* Badge */}
              {plan.tag && (
                <span
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "24px",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    ...(plan.featured
                      ? { background: "#f5f0eb", color: "#0d0d0d" }
                      : { background: "var(--foreground)", color: "var(--background)" }),
                  }}
                >
                  {plan.tag}
                </span>
              )}

              {/* Nombre */}
              <h2
                className="font-display font-black"
                style={{
                  fontSize: "1.7rem",
                  marginBottom: "10px",
                  color: plan.featured ? "#f5f0eb" : "var(--foreground)",
                }}
              >
                {plan.name}
              </h2>

              {/* Descripción */}
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.65,
                  marginBottom: "28px",
                  color: plan.featured ? "rgba(245,240,235,0.52)" : "var(--muted)",
                }}
              >
                {plan.description}
              </p>

              {/* Precio */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "32px" }}>
                <span
                  className="font-display font-black"
                  style={{ fontSize: "clamp(2.2rem, 7vw, 3rem)", color: plan.featured ? "#f5f0eb" : "var(--foreground)" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontSize: "14px", fontWeight: 600, color: plan.featured ? "rgba(245,240,235,0.4)" : "var(--muted)" }}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "14px" }}>
                    <svg
                      width="16" height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.featured ? "rgba(245,240,235,0.55)" : "var(--foreground)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: plan.featured ? "rgba(245,240,235,0.72)" : "var(--muted)", lineHeight: 1.5 }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/contacto"
                className="font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: "12px",
                  padding: "18px",
                  borderRadius: "16px",
                  ...(plan.featured
                    ? { background: "#f5f0eb", color: "#0d0d0d" }
                    : { background: "var(--foreground)", color: "var(--background)" }),
                }}
              >
                Quiero este plan
              </Link>
            </div>
          ))}
        </div>

        {/* Nota */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            marginTop: "40px",
            lineHeight: 1.7,
            color: "var(--muted)",
          }}
        >
          ¿Tienes dudas sobre cuál elegir?{" "}
          <a
            href="https://wa.me/5215540387231"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--foreground)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Escríbenos por WhatsApp
          </a>{" "}
          y te ayudamos sin compromiso.
        </p>
      </div>
    </main>
  );
}