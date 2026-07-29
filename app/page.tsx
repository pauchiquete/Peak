import Hero from "@/components/home/hero/Hero";
import Stats from "@/components/home/Stats";
import Services from "@/components/home/Services";
import Process from "@/components/home/Process";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <Process />
      <FAQ />
      <CTA />
    </>
  );
}