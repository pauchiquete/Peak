"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/theme-toggle";

const links = [
  { href: "/",         label: "Inicio" },
  { href: "/planes",   label: "Planes" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cierra menú al navegar
  useEffect(() => setOpen(false), [pathname]);

  // Bloquea scroll cuando menú abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── BARRA ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          className="flex items-center justify-between px-5"
          style={{ height: "64px", maxWidth: "1200px", margin: "0 auto" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-black tracking-[0.18em] uppercase text-lg"
            style={{ color: "var(--foreground)", fontFamily: "'Syne', sans-serif", letterSpacing: "0.2em" }}
          >
            PLT
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold tracking-widest uppercase transition-all duration-150"
                style={{
                  color: pathname === l.href ? "var(--foreground)" : "var(--muted)",
                  borderBottom: pathname === l.href ? "1.5px solid var(--foreground)" : "1.5px solid transparent",
                  paddingBottom: "1px",
                }}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle inline />
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle inline />
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menú"
              className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl"
              style={{ background: "var(--card-alt)", border: "1px solid var(--border)" }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-[1.5px] w-5 transition-all duration-300 origin-center"
                  style={{
                    background: "var(--foreground)",
                    transform:
                      i === 0 && open ? "translateY(6.5px) rotate(45deg)"
                      : i === 2 && open ? "translateY(-6.5px) rotate(-45deg)"
                      : "none",
                    opacity: i === 1 && open ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MENÚ MOBILE FULLSCREEN ── */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 md:hidden"
        style={{
          background: "var(--background)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-16px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-black tracking-widest uppercase"
            style={{
              fontSize: "clamp(2rem, 8vw, 3rem)",
              color: pathname === l.href ? "var(--foreground)" : "var(--muted)",
              transition: `all 0.3s ${i * 0.07}s ease`,
              transform: open ? "translateY(0)" : "translateY(18px)",
              opacity: open ? 1 : 0,
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {l.label}
          </Link>
        ))}

        {/* Link de contacto directo */}
        <a
          href="https://wa.me/5215540387231"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-bold tracking-wider mt-4 px-6 py-3 rounded-2xl transition-all duration-200"
          style={{
            background: "#25d366",
            color: "#fff",
            transition: `all 0.3s ${links.length * 0.07 + 0.05}s ease`,
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(18px)",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18" fill="white">
            <path d="M16 .4C7.4.4.5 7.3.5 15.8c0 2.8.7 5.5 2.1 7.9L.2 31.6l8.1-2.4c2.3 1.3 4.9 2 7.7 2 8.6 0 15.5-6.9 15.5-15.4C31.5 7.3 24.6.4 16 .4zm7.4 21.9c-.4-.2-2.5-1.2-2.9-1.4-.4-.1-.7-.2-1 .2s-1.1 1.4-1.4 1.6c-.3.2-.5.3-.9.1-.4-.2-1.8-.7-3.5-2.2-1.3-1.2-2.2-2.6-2.4-3-.3-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.5-.7.2-.3.1-.6 0-.8-.1-.2-1-2.3-1.4-3.1-.3-.7-.6-.6-1-.6h-.8c-.3 0-.8.1-1.2.6s-1.6 1.6-1.6 3.9 1.6 4.6 1.8 4.9c.2.3 3.2 5 7.8 6.8 1.1.5 2 .8 2.7 1 .9.3 1.7.2 2.3.1.7-.1 2.5-1 2.9-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.8-.5z"/>
          </svg>
          WhatsApp
        </a>
      </div>
    </>
  );
}