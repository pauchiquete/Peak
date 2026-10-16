"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Head Coach", href: "/head-coach" },
  { label: "Coaches", href: "/coaches" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contacto", href: "/contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="
        fixed
        left-0
        top-0
        z-50
        w-full
        border-b
        border-[var(--border)]
        bg-[var(--bg)]/75
        text-[var(--text)]
        backdrop-blur-2xl
      "
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="Peak Level Training · Inicio"
          className="flex shrink-0 items-center rounded-2xl bg-[#f7f3ee] px-2.5 py-1.5 ring-1 ring-black/10"
        >
          <Image
            src="/Peak-Level-Training-logos/02-logo-corto.png"
            alt=""
            width={1013}
            height={876}
            priority
            className="brand-logo h-9 w-auto lg:hidden"
          />
          <Image
            src="/Peak-Level-Training-logos/04-logo-horizontal-v1.png"
            alt=""
            width={3029}
            height={740}
            priority
            className="brand-logo hidden h-9 w-auto lg:block"
          />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.18em]
                text-[var(--muted)]
                transition
                hover:text-[var(--text)]
              "
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          <Link
            href="/login"
            className="
              rounded-full
              bg-[var(--button-bg)]
              px-5
              py-3
              text-xs
              font-black
              uppercase
              tracking-[0.18em]
              text-[var(--button-text)]
              transition
              hover:scale-[1.03]
              active:scale-95
            "
          >
            Login
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              text-[var(--text)]
              backdrop-blur-xl
            "
            aria-label="Abrir menú"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open && (
        <div
          className="
            border-t
            border-[var(--border)]
            bg-[var(--bg)]/95
            px-5
            py-5
            backdrop-blur-2xl
            lg:hidden
          "
        >
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  px-5
                  py-4
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-[var(--text)]
                "
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="
                rounded-2xl
                bg-[var(--button-bg)]
                px-5
                py-4
                text-center
                text-sm
                font-black
                uppercase
                tracking-[0.18em]
                text-[var(--button-text)]
              "
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
