import Image from "next/image";
import Link from "next/link";

export default function SobreMiPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Sobre Sebastián
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
            De alto rendimiento a entrenamiento personal.
          </h1>

          <p className="mt-7 text-base leading-8 text-[var(--muted)] sm:text-lg">
            Sebastián fue atleta de alto rendimiento representando a México en
            natación. Hoy usa esa experiencia para ayudar a personas reales a
            mejorar su físico, su salud y su confianza.
          </p>

          <p className="mt-5 text-base leading-8 text-[var(--muted)] sm:text-lg">
            Su enfoque combina hipertrofia, calistenia, entrenamiento híbrido y
            rendimiento deportivo. El objetivo no es solo entrenar más fuerte,
            sino entrenar con dirección.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {["IFBB PRO", "ISSA", "Calisthenics Kings", "SEP"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--muted)]"
              >
                {item}
              </span>
            ))}
          </div>

          <Link
            href="/contacto"
            className="mt-9 inline-flex rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)]"
          >
            Entrenar con Sebastián
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)]">
          <Image
            src="/coach2.jpeg"
            alt="Sebastián González"
            width={900}
            height={1100}
            className="h-auto w-full object-cover"
            priority
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--bg)]/95 to-transparent p-7">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              +7 años entrenando personas
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}