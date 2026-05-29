import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "+200", label: "Clientes transformados" },
  { value: "4 años", label: "De experiencia" },
  { value: "100%", label: "Planes personalizados" },
];

const values = [
  { title: "Entrenamiento inteligente",  desc: "No se trata de matarte en el gym. Se trata de entrenar con propósito y técnica correcta." },
  { title: "Resultados sostenibles",     desc: "Mi objetivo es que aprendas a entrenar para que los resultados duren toda la vida." },
  { title: "Acompañamiento real",        desc: "Estoy contigo en cada paso. No desaparezco después de enviarte la rutina." },
];

export default function SobreMi() {
  return (
    <main style={{ minHeight: "100svh", paddingBottom: "100px" }}>

      {/* ── FOTO HERO ── */}
      <div style={{ position: "relative", width: "100%", height: "clamp(420px, 70svh, 600px)" }}>
        <Image
          src="/coach2.jpeg"
          alt="Entrenador Peak Level Training"
          fill
          className="object-cover object-top"
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(13,13,13,0.05) 40%, rgba(13,13,13,0.92) 100%)",
          }}
        />
        {/* Texto sobre foto */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "40px 28px",
            maxWidth: "680px",
            margin: "0 auto",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              padding: "7px 16px",
              borderRadius: "999px",
              marginBottom: "16px",
              background: "rgba(245,240,235,0.13)",
              color: "#f5f0eb",
              border: "1px solid rgba(245,240,235,0.22)",
              backdropFilter: "blur(8px)",
            }}
          >
            Peak Level Training
          </span>
          <h1
            className="font-display font-black text-white"
            style={{ fontSize: "clamp(2.6rem, 10vw, 4.5rem)", lineHeight: 1.0 }}
          >
            Tu coach
            <br />
            <em style={{ opacity: 0.85 }}>personal.</em>
          </h1>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginTop: "40px",
            marginBottom: "64px",
            background: "var(--card-alt)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          {stats.map((h) => (
            <div key={h.label}>
              <p
                className="font-display font-black"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", color: "var(--foreground)", lineHeight: 1 }}
              >
                {h.value}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginTop: "8px",
                  lineHeight: 1.4,
                }}
              >
                {h.label}
              </p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "64px" }}>
          {[
            <>Me especializo en <strong style={{ color: "var(--foreground)" }}>recomposición corporal</strong>, pérdida de grasa y aumento de masa muscular. Mi objetivo no es solo que entrenes, sino que <strong style={{ color: "var(--foreground)" }}>aprendas a entrenar correctamente</strong> para que los resultados sean sostenibles.</>,
            <>Cada programa es personalizado según tu nivel, horarios, lesiones y estilo de vida. <strong style={{ color: "var(--foreground)" }}>No existen rutinas genéricas</strong> ni planes copiados.</>,
            <>Mi enfoque combina entrenamiento inteligente, nutrición y hábitos para lograr cambios físicos reales <strong style={{ color: "var(--foreground)" }}>sin poner en riesgo tu salud</strong>.</>,
          ].map((text, i) => (
            <p key={i} style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.85 }}>
              {text}
            </p>
          ))}
        </div>

        {/* Valores */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "64px" }}>
          {values.map((v) => (
            <div
              key={v.title}
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
              <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}></span>
              <div>
                <h3 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>
                  {v.title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.7 }}>
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            background: "#0d0d0d",
            borderRadius: "24px",
            padding: "64px 40px",
            textAlign: "center",
          }}
        >
          <h2
            className="font-display font-black"
            style={{ fontSize: "clamp(1.7rem, 5vw, 2.4rem)", color: "#f5f0eb", marginBottom: "14px", lineHeight: 1.2 }}
          >
            ¿Listo para empezar?
          </h2>
          <p style={{ color: "rgba(245,240,235,0.5)", fontSize: "15px", marginBottom: "36px", lineHeight: 1.7 }}>
            Primera asesoría gratis. Sin compromiso.
          </p>
          <Link
            href="/contacto"
            className="inline-block font-bold tracking-widest uppercase rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "#f5f0eb", color: "#0d0d0d", fontSize: "13px", padding: "18px 40px" }}
          >
            Agendar ahora
          </Link>
        </div>

      </div>
    </main>
  );
}