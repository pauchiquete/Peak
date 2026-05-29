"use client";

import { useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: "14px",
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1.5px solid var(--border)",
  fontSize: "15px",
  fontFamily: "'Syne', system-ui, sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  appearance: "none",
};

export default function Contacto() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const res = await fetch("https://formspree.io/f/xdaldyzb", {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) { setStatus("ok"); form.reset(); }
    else setStatus("error");
  }

  return (
    <main style={{ minHeight: "100svh", paddingTop: "100px", paddingBottom: "100px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
            Hablemos
          </span>
          <h1
            className="font-display font-black"
            style={{ fontSize: "clamp(2.2rem, 7vw, 3.2rem)", color: "var(--foreground)", lineHeight: 1.1, marginBottom: "16px" }}
          >
            Agenda tu asesoría
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.75 }}>
            Primera consulta gratuita y sin compromiso.
            Te contactamos en menos de 24 horas.
          </p>
        </div>

        {/* Éxito */}
        {status === "ok" ? (
          <div
            style={{
              textAlign: "center",
              padding: "72px 40px",
              borderRadius: "24px",
              background: "var(--card-alt)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: "52px" }}></span>
            <h2
              className="font-display font-black"
              style={{ fontSize: "1.6rem", color: "var(--foreground)", marginTop: "24px", marginBottom: "12px" }}
            >
              ¡Mensaje enviado!
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.7 }}>
              Te contactaremos pronto por WhatsApp. ¡Nos vemos pronto!
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              background: "var(--card-alt)",
              border: "1px solid var(--border)",
              borderRadius: "24px",
              padding: "40px",
            }}
          >
            {/* Nombre */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
                Nombre completo
              </label>
              <input
                name="nombre"
                placeholder="Tu nombre"
                required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--foreground)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* WhatsApp */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
                WhatsApp
              </label>
              <input
                name="telefono"
                placeholder="+52 55 0000 0000"
                required
                type="tel"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--foreground)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Objetivo */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
                Objetivo
              </label>
              <select
                name="objetivo"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "var(--foreground)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              >
                <option value="Perder grasa">Perder grasa</option>
                <option value="Ganar músculo">Ganar músculo</option>
                <option value="Recomposición corporal">Recomposición corporal</option>
                <option value="Mejorar condición">Mejorar condición física</option>
              </select>
            </div>

            {/* Mensaje */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)" }}>
                Cuéntame sobre ti
              </label>
              <textarea
                name="mensaje"
                placeholder="¿Cuánto llevas entrenando? ¿Alguna lesión? ¿Disponibilidad de tiempo?"
                rows={4}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
                onFocus={e => (e.target.style.borderColor = "var(--foreground)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background: "var(--foreground)",
                color: "var(--background)",
                fontSize: "13px",
                padding: "18px",
                borderRadius: "14px",
                marginTop: "8px",
                cursor: status === "sending" ? "not-allowed" : "pointer",
                opacity: status === "sending" ? 0.6 : 1,
                border: "none",
              }}
            >
              {status === "sending" ? "Enviando..." : "Enviar mensaje →"}
            </button>

            {status === "error" && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#ef4444" }}>
                Hubo un error. Intenta de nuevo o escríbenos directo por WhatsApp.
              </p>
            )}
          </form>
        )}

        {/* Link WA directo */}
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "28px", color: "var(--muted)" }}>
          ¿Prefieres escribir directo?{" "}
          <a
            href="https://wa.me/5215540387231"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--foreground)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Escríbenos en WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}