"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--surface)]
        px-5
        py-3
        text-xs
        font-black
        uppercase
        tracking-[0.18em]
        text-[var(--text)]
        backdrop-blur-xl
        transition
        hover:bg-[var(--surface-strong)]
        active:scale-95
      "
    >
      Cerrar sesión
    </button>
  );
}