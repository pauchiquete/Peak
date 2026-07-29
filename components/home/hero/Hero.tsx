"use client";

import HeroImage from "./HeroImage";
import HeroContent from "./HeroContent";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <HeroImage />

      <div className="relative z-10 flex min-h-[100svh] items-end px-5 pb-20 pt-28 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <HeroContent />
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}