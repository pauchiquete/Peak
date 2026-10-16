"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { coaches } from "@/lib/coaches";

type AssignedCoachContact = {
  name: string;
  phone: string;
};

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="22"
      height="22"
      fill="white"
      className="shrink-0"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 .4C7.4.4.5 7.3.5 15.8c0 2.8.7 5.5 2.1 7.9L.2 31.6l8.1-2.4c2.3 1.3 4.9 2 7.7 2 8.6 0 15.5-6.9 15.5-15.4C31.5 7.3 24.6.4 16 .4zm0 28.3c-2.4 0-4.8-.6-6.9-1.8l-.5-.3-4.8 1.4 1.5-4.7-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.3 6-13.3 13.4-13.3s13.4 6 13.4 13.3-6 13.4-13.8 13.4zm7.4-9.9c-.4-.2-2.5-1.2-2.9-1.4-.4-.1-.7-.2-1 .2s-1.1 1.4-1.4 1.6c-.3.2-.5.3-.9.1-.4-.2-1.8-.7-3.5-2.2-1.3-1.2-2.2-2.6-2.4-3-.3-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.5-.7.2-.3.1-.6 0-.8-.1-.2-1-2.3-1.4-3.1-.3-.7-.6-.6-1-.6h-.8c-.3 0-.8.1-1.2.6s-1.6 1.6-1.6 3.9 1.6 4.6 1.8 4.9c.2.3 3.2 5 7.8 6.8 1.1.5 2 .8 2.7 1 .9.3 1.7.2 2.3.1.7-.1 2.5-1 2.9-2 .4-1 .4-1.8.3-2-.1-.2-.4-.3-.8-.5z" />
    </svg>
  );
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [assignedCoachResult, setAssignedCoachResult] = useState<{
    pathname: string;
    contact: AssignedCoachContact;
  } | null>(null);
  const isCoachAccount =
    pathname === "/dashboard/coach" ||
    pathname.startsWith("/dashboard/coach/");
  const isClientAccount =
    pathname === "/dashboard/client" ||
    pathname.startsWith("/dashboard/client/");

  useEffect(() => {
    if (!isClientAccount) return;

    const controller = new AbortController();

    async function loadAssignedCoach() {
      try {
        const response = await fetch("/api/client/coach-contact", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as AssignedCoachContact;
        setAssignedCoachResult({ pathname, contact: data });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    loadAssignedCoach();

    return () => controller.abort();
  }, [isClientAccount, pathname]);

  if (isCoachAccount) return null;

  if (isClientAccount) {
    const assignedCoach =
      assignedCoachResult?.pathname === pathname
        ? assignedCoachResult.contact
        : null;

    if (!assignedCoach) return null;

    const firstName = getFirstName(assignedCoach.name);
    const message = `Hola ${firstName}, tengo una duda con la técnica de un ejercicio de mi rutina. ¿Me puedes orientar?`;
    const url = `https://wa.me/${assignedCoach.phone}?text=${encodeURIComponent(
      message
    )}`;
    const label = `Consultar a ${firstName} por WhatsApp`;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25d366] shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366]"
        style={{ boxShadow: "0 8px 32px rgba(37,211,102,0.35)" }}
      >
        <WhatsAppIcon />
      </a>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {selectorOpen && (
        <div
          id="whatsapp-coach-selector"
          className="w-[min(20rem,calc(100vw-3rem))] rounded-[26px] border border-[var(--border)] bg-[var(--bg)]/95 p-4 text-[var(--text)] shadow-2xl backdrop-blur-2xl"
        >
          <p className="px-1 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
            Habla con un coach
          </p>

          <div className="mt-3 grid gap-2">
            {coaches.map((coach) => {
              const firstName = getFirstName(coach.name);
              const message = `Hola ${firstName}, vi tu perfil en Peak y me gustaría recibir información sobre tus planes de entrenamiento.`;
              const url = `https://wa.me/${coach.contact.whatsapp}?text=${encodeURIComponent(
                message
              )}`;

              return (
                <a
                  key={coach.slug}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSelectorOpen(false)}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]"
                >
                  <span>
                    <span className="block text-sm font-black">
                      {coach.name}
                    </span>
                    <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                      {coach.role}
                    </span>
                  </span>
                  <span className="text-xs font-black text-[#1aa94c]">
                    Abrir
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setSelectorOpen((open) => !open)}
        aria-expanded={selectorOpen}
        aria-controls="whatsapp-coach-selector"
        aria-label={
          selectorOpen
            ? "Cerrar selector de coaches"
            : "Elegir coach para contactar por WhatsApp"
        }
        title="Contactar por WhatsApp"
        className="flex items-center gap-2.5 rounded-full bg-[#25d366] py-3 pl-3 pr-5 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366]"
        style={{ boxShadow: "0 8px 32px rgba(37,211,102,0.35)" }}
      >
        <WhatsAppIcon />
        <span className="text-xs font-bold tracking-wide text-white">
          {selectorOpen ? "Cerrar" : "WhatsApp"}
        </span>
      </button>
    </div>
  );
}
