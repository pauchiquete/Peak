"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--surface)]" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
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
        text-sm
        text-[var(--text)]
        backdrop-blur-xl
        transition
        hover:bg-[var(--surface-strong)]
        active:scale-95
      "
      aria-label="Cambiar tema"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
