"use client";

import { motion } from "framer-motion";

const faqs = [
  {
    question: "¿Necesito experiencia previa?",
    answer:
      "No. El plan se adapta a tu punto de partida, incluso si vienes de sedentarismo o llevas mucho tiempo sin entrenar.",
  },
  {
    question: "¿Puedo entrenar desde casa?",
    answer:
      "Sí. Puedes entrenar desde casa, gimnasio o parque. Si tienes acceso a gimnasio, los resultados suelen ser más rápidos por la variedad de equipo.",
  },
  {
    question: "¿Qué pasa si tengo una lesión?",
    answer:
      "Primero se considera la lesión para evitar empeorarla. El objetivo es que puedas seguir entrenando sin dolor y con progresión segura.",
  },
  {
    question: "¿Cuántos días debo entrenar?",
    answer:
      "Lo ideal son 5 días, pero para lograr resultados reales se recomienda mínimo 3 días de entrenamiento por semana.",
  },
  {
    question: "¿Hay permanencia mínima?",
    answer:
      "No. Puedes comenzar sin compromiso de permanencia mínima.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      className="bg-[var(--bg)] px-5 py-20 text-[var(--text)] sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Preguntas frecuentes
          </p>

          <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
            Lo que necesitas saber antes de empezar.
          </h2>
        </motion.div>

        <div className="mt-10 grid gap-3">
          {faqs.map((faq, index) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="
                group
                rounded-[26px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-6
                backdrop-blur-xl
                open:bg-[var(--surface-strong)]
              "
            >
              <summary
                className="
                  flex
                  cursor-pointer
                  list-none
                  items-center
                  justify-between
                  gap-5
                  text-lg
                  font-black
                  tracking-tight
                "
              >
                {faq.question}

                <span className="text-2xl text-[var(--muted)] transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                {faq.answer}
              </p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}