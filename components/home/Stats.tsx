"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "+280",
    label: "Clientes entrenados",
    description:
      "Más de 80 clientes presenciales y más de 200 online a lo largo de su carrera.",
  },
  {
    value: "7 años",
    label: "Experiencia",
    description:
      "Acompañando procesos físicos desde pérdida de grasa hasta alto rendimiento.",
  },
  {
    value: "4+",
    label: "Certificaciones",
    description:
      "IFBB PRO League, ISSA, Calisthenics Kings y entrenamiento avalado por la SEP.",
  },
  {
    value: "24/7",
    label: "Seguimiento",
    description:
      "Acompañamiento constante para ajustar el plan y mantener el progreso.",
  },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] px-6 py-28 text-[#f5f0eb] sm:px-8 lg:px-10">
      {/* Glow sutil */}
      <div className="absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[#f5f0eb]/[0.04] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#f5f0eb]/40">
            Por qué entrenar con Sebastián
          </p>

          <h2 className="mt-6 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-[#f5f0eb] sm:text-5xl lg:text-7xl">
            Experiencia real.
            <br />
            Resultados medibles.
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-8 text-[#f5f0eb]/55 sm:text-lg">
            No se trata de copiar rutinas ni seguir tendencias. Cada programa se
            construye según tu punto de partida, tus objetivos, tu movilidad y
            tu estilo de vida.
          </p>
        </motion.div>

        <div className="mt-18 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
              className="
                group
                rounded-[28px]
                border
                border-[#f5f0eb]/10
                bg-[#f5f0eb]/[0.045]
                p-7
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#f5f0eb]/20
                hover:bg-[#f5f0eb]/[0.07]
              "
            >
              <p className="text-5xl font-black leading-none tracking-tight text-[#f5f0eb]">
                {item.value}
              </p>

              <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-[#f5f0eb]/45">
                {item.label}
              </h3>

              <div className="my-6 h-px w-full bg-gradient-to-r from-[#f5f0eb]/20 via-[#f5f0eb]/5 to-transparent" />

              <p className="text-sm leading-7 text-[#f5f0eb]/50">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          viewport={{ once: true }}
          className="
            mt-8
            rounded-[32px]
            border
            border-[#f5f0eb]/10
            bg-[#f5f0eb]/[0.04]
            p-8
            backdrop-blur-xl
            sm:p-10
            lg:mt-10
            lg:grid
            lg:grid-cols-[1.1fr_0.9fr]
            lg:items-center
            lg:gap-12
          "
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5f0eb]/40">
              Enfoque
            </p>

            <h3 className="mt-5 text-3xl font-black leading-tight text-[#f5f0eb] sm:text-4xl">
              Entrenar fuerte no sirve si no entrenas con dirección.
            </h3>
          </div>

          <p className="mt-6 text-base leading-8 text-[#f5f0eb]/55 lg:mt-0">
            El objetivo es que cada entrenamiento tenga intención: técnica,
            progresión, control y seguimiento. Desde perder grasa hasta preparar
            un reto físico, el plan se adapta a lo que tu cuerpo necesita para
            avanzar sin lesionarte.
          </p>
        </motion.div>
      </div>
    </section>
  );
}