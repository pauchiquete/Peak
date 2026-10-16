import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Head Coach", href: "/head-coach" },
  { label: "Coaches", href: "/coaches" },
  { label: "Contacto", href: "/contacto" },
];

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="bg-[var(--bg)] px-5 pb-10 pt-16 text-[var(--text)] sm:px-8 lg:px-10"
    >
      <div
        className="
          mx-auto
          max-w-7xl
          rounded-[30px]
          border
          border-[var(--border)]
          bg-[var(--surface)]
          p-7
          backdrop-blur-xl
          sm:p-9
        "
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <Link
              href="/"
              aria-label="Peak Level Training · Inicio"
              className="inline-flex rounded-[24px] bg-[#f7f3ee] p-3 ring-1 ring-black/10"
            >
              <Image
                src="/Peak-Level-Training-logos/01-logo-principal.png"
                alt=""
                width={1970}
                height={1910}
                className="brand-logo h-24 w-auto opacity-90 sm:h-28"
              />
            </Link>

            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--muted)]">
              Un equipo de entrenadores dedicado a mejorar tu salud física con
              planes personalizados, seguimiento real y dirección profesional.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Navegación
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-bold text-[var(--muted)] transition hover:text-[var(--text)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Contacto
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-[var(--muted)]">
                <Link href="/coaches" className="hover:text-[var(--text)]">
                  Elegir entrenador
                </Link>

                <Link href="/contacto" className="hover:text-[var(--text)]">
                  Agendar valoración
                </Link>

                <a href="mailto:sebgnzlzram@gmail.com" className="hover:text-[var(--text)]">
                  Contacto Head Coach
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Modalidad
              </p>

              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                Online y presencial.
                <br />
                Coaches en crecimiento.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            © 2026 Peak Level Training. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
