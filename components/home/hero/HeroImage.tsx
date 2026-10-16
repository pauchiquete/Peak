"use client";

import Image from "next/image";

export default function HeroImage() {
  return (
    <div className="absolute inset-0 bg-[var(--bg)]">
      <Image
        src="/Imagen de ChatGPT 11 oct 2026, 12_46_01.png"
        alt="Equipo para entrenamiento de fuerza, carrera, natación y Pilates en Peak"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-center"
      />

      <div
        className="absolute inset-0 lg:hidden"
        style={{ background: "var(--hero-mobile-overlay)" }}
      />

      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: "var(--hero-side-overlay)" }}
      />

      <div
        className="absolute inset-0"
        style={{ background: "var(--hero-overlay)" }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </div>
  );
}
