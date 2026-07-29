"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Valoración",
    text: "Entendemos tu objetivo, tu nivel actual, lesiones, horarios y estilo de vida.",
  },
  {
    number: "02",
    title: "Plan",
    text: "Sebastián diseña tu entrenamiento según lo que tu cuerpo necesita para avanzar.",
  },
  {
    number: "03",
    title: "Seguimiento",
    text: "Se revisa tu progreso y se ajusta el programa para mantener resultados constantes.",
  },
];

export default function Process() {
  return (
    <section className="bg-[var(--bg)] px-5 py-20 text-[var(--text)] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Cómo funciona
          </p>

          <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
            Simple para ti.
            <br />
            Personalizado por completo.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.07 }}
              viewport={{ once: true }}
              className="
                rounded-[28px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-6
                backdrop-blur-xl
                sm:p-7
              "
            >
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--muted)]">
                {step.number}
              </p>

              <h3 className="mt-10 text-3xl font-black tracking-tight">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {step.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}