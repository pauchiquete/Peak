import Link from "next/link";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Planes", href: "/planes" },
  { label: "Sobre mí", href: "/sobre-mi" },
  { label: "Contacto", href: "/contacto" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg)] px-5 pb-10 pt-16 text-[var(--text)] sm:px-8 lg:px-10">
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
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[var(--text)]" />

              <p className="text-sm font-black uppercase tracking-[0.24em]">
                Peak
              </p>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">
              Entrenamiento personalizado con Sebastián González. Presencial en
              Ciudad de México y online desde cualquier lugar.
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
                <a href="mailto:sebgnzlzram@gmail.com" className="hover:text-[var(--text)]">
                  sebgnzlzram@gmail.com
                </a>

                <a
                  href="https://instagram.com/sebglezcoach"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text)]"
                >
                  @sebglezcoach
                </a>

                <a
                  href="https://wa.me/525548792525"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text)]"
                >
                  WhatsApp
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
                Atención 24/7.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            © 2026 Peak. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}