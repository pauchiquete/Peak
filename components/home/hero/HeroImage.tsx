"use client";

import Image from "next/image";

export default function HeroImage() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/coach.jpeg"
        alt="Sebastián González - Entrenador personal"
        fill
        priority
        className="object-cover object-top"
      />

      <div
        className="absolute inset-0"
        style={{ background: "var(--hero-overlay)" }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </div>
  );
}