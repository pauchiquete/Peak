"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const proof = [
  "+280 clientes",
  "7 años entrenando",
  "Ex atleta de alto rendimiento",
];

export default function HeroContent() {
  return (
    <div className="max-w-[720px]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="
          inline-flex
          items-center
          rounded-full
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-4
          py-2
          backdrop-blur-xl
        "
      >
        <span className="mr-3 h-2 w-2 rounded-full bg-[var(--text)]" />

        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)] sm:text-xs">
          Entrenamiento personalizado
        </p>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.12 }}
        className="
          mt-7
          text-[clamp(4.3rem,19vw,9rem)]
          font-black
          uppercase
          leading-[0.86]
          tracking-[-0.075em]
        "
      >
        <span className="block">EL</span>
        <span className="block">SIGUIENTE</span>
        <span className="block italic opacity-80">NIVEL</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.24 }}
        className="
          mt-7
          max-w-[560px]
          text-base
          leading-7
          text-[var(--muted)]
          sm:text-lg
          sm:leading-8
        "
      >
        Entrena con{" "}
        <span className="font-bold text-[var(--text)]">
          Sebastián González
        </span>
        : ex atleta de alto rendimiento, especialista en hipertrofia,
        calistenia y rendimiento físico.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.36 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/contacto"
          className="
            rounded-2xl
            bg-[var(--button-bg)]
            px-7
            py-4
            text-center
            text-sm
            font-black
            uppercase
            tracking-[0.18em]
            text-[var(--button-text)]
            transition
            hover:scale-[1.02]
            active:scale-95
          "
        >
          Agendar valoración
        </Link>

        <Link
          href="/planes"
          className="
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            px-7
            py-4
            text-center
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
          Ver programas
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.48 }}
        className="
          mt-7
          flex
          flex-wrap
          gap-2.5
        "
      >
        {proof.map((item) => (
          <span
            key={item}
            className="
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              px-4
              py-2
              text-xs
              font-bold
              text-[var(--muted)]
              backdrop-blur-xl
            "
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}