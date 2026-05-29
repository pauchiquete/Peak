"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Props {
  inline?: boolean;
}

export default function ThemeToggle({ inline }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  /* ── Inline (dentro del Navbar) ── */
  if (inline) {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "var(--card-alt)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  /* ── Flotante (esquina inferior derecha) ── */
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        background: "var(--foreground)",
        color: "var(--background)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
      }}
    >
      {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}

function SunIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"   x2="5.64"  y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}