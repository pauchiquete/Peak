"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    tag: "Presencial",
    title: "Entrena con Sebastián en CDMX",
    description:
      "Sesiones guiadas con corrección técnica, estructura y seguimiento directo para avanzar sin perder tiempo.",
    points: ["Corrección en tiempo real", "Plan adaptado", "Rutinas si sales de viaje"],
  },
  {
    tag: "Online",
    title: "Tu programa desde cualquier lugar",
    description:
      "Rutinas semanales, seguimiento constante y ajustes según tu progreso, tu horario y tu objetivo.",
    points: ["Seguimiento 24/7", "Rutinas semanales", "Chequeo mensual"],
  },
  {
    tag: "Rendimiento",
    title: "Fuerza, resistencia y alto desempeño",
    description:
      "Preparación para objetivos físicos más exigentes: fuerza, carrera, Hyrox, calistenia o rendimiento deportivo.",
    points: ["Fuerza", "Resistencia", "Progresión medible"],
  },
];

export default function Services() {
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
            Programas
          </p>

          <h2 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl">
            Elige cómo quieres entrenar.
          </h2>

          <p className="mt-6 text-base leading-7 text-[var(--muted)] sm:text-lg">
            Presencial u online, el objetivo es el mismo: que entrenes con
            dirección, técnica y un plan hecho para ti.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.07 }}
              viewport={{ once: true }}
              className="
                rounded-[30px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-6
                backdrop-blur-xl
                transition
                hover:bg-[var(--surface-strong)]
                sm:p-7
              "
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">
                  {service.tag}
                </span>

                <span className="text-2xl text-[var(--muted)]">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                {service.title}
              </h3>

              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
                {service.description}
              </p>

              <div className="my-7 h-px bg-[var(--border)]" />

              <div className="flex flex-wrap gap-2">
                {service.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full bg-[var(--surface-strong)] px-3 py-2 text-xs font-bold text-[var(--muted)]"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Link
            href="/planes"
            className="
              inline-flex
              rounded-2xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
              px-7
              py-4
              text-sm
              font-black
              uppercase
              tracking-[0.18em]
              text-[var(--text)]
              backdrop-blur-xl
              transition
              hover:bg-[var(--surface-strong)]
              active:scale-95
            "
          >
            Ver todos los planes
          </Link>
        </motion.div>
      </div>
    </section>
  );
}