"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Coach } from "@/lib/coaches";

type CoachDirectoryProps = {
  coaches: Coach[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function CoachDirectory({ coaches }: CoachDirectoryProps) {
  const [specialty, setSpecialty] = useState("all");

  const specialties = useMemo(
    () =>
      Array.from(new Set(coaches.flatMap((coach) => coach.specialties))).sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
    [coaches],
  );

  const filteredCoaches = coaches.filter(
    (coach) =>
      specialty === "all" || coach.specialties.includes(specialty),
  );

  const hasActiveFilters = specialty !== "all";

  function clearFilters() {
    setSpecialty("all");
  }

  return (
    <>
      <section
        aria-labelledby="coach-filters-title"
        className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              id="coach-filters-title"
              className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]"
            >
              Encuentra tu mejor opción
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Elige el enfoque que buscas para conocer a los coaches disponibles.
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
              Especialidad
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 text-sm font-bold normal-case tracking-normal text-[var(--text)] outline-none transition focus:border-[var(--text)]"
              >
                <option value="all">Todas</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <p aria-live="polite" className="text-sm text-[var(--muted)]">
            {filteredCoaches.length === 1
              ? "1 coach disponible"
              : `${filteredCoaches.length} coaches disponibles`}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text)]"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </section>

      {filteredCoaches.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCoaches.map((coach) => {
            const originalIndex = coaches.findIndex(
              (item) => item.slug === coach.slug,
            );

            return (
              <Link
                key={coach.slug}
                href={`/contacto?coach=${coach.slug}`}
                aria-label={`Conocer y contactar a ${coach.name}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:bg-[var(--surface-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text)]"
              >
                <div className="relative aspect-[4/3] min-h-[280px] overflow-hidden bg-[#0d0d0d] sm:min-h-[340px]">
                  {coach.image ? (
                    <Image
                      src={coach.image}
                      alt={coach.imageAlt}
                      fill
                      priority={originalIndex === 0}
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className={`object-cover transition duration-700 ${
                        coach.slug === "sergio-gonzales"
                          ? "origin-top scale-[1.15] object-center group-hover:scale-[1.19]"
                          : coach.slug === "sebastian-gonzalez"
                            ? "object-[center_48%] group-hover:scale-[1.025]"
                            : "object-[center_42%] group-hover:scale-[1.025]"
                      }`}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                      style={{
                        background:
                          "radial-gradient(circle at 72% 20%, rgba(245,240,235,0.18), transparent 34%), linear-gradient(145deg, #252525 0%, #0d0d0d 68%)",
                      }}
                    >
                      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/10" />
                      <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full border border-white/[0.07]" />
                      <span
                        aria-hidden="true"
                        className="relative text-[clamp(5rem,17vw,10rem)] font-black leading-none tracking-[-0.1em] text-[#f5f0eb]/90"
                      >
                        {getInitials(coach.name)}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d]/85 via-transparent to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                    <p
                      className={`font-black uppercase text-[#f5f0eb]/70 ${
                        coach.role === "Head Coach"
                          ? "text-xs tracking-[0.2em] sm:text-sm"
                          : "text-[10px] tracking-[0.24em]"
                      }`}
                    >
                      {coach.role}
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-[#f5f0eb] sm:text-4xl">
                      {coach.name}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--muted)]">
                    {coach.age ? <span>{coach.age} años</span> : null}
                    {coach.age ? (
                      <span aria-hidden="true" className="opacity-40">
                        /
                      </span>
                    ) : null}
                    <span>Atención personalizada</span>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-[var(--muted)] sm:text-base">
                    {coach.intro}
                  </p>

                  {!coach.image && (
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      Perfil inicial · más información próximamente
                    </p>
                  )}

                  {coach.specialties.length > 0 ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {coach.specialties.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-[11px] font-bold text-[var(--muted)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-auto pt-8">
                    <div className="h-px bg-[var(--border)]" />
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="text-xs font-black uppercase tracking-[0.18em]">
                        Conocer y contactar
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-xl text-[var(--muted)] transition duration-300 group-hover:translate-x-1 group-hover:text-[var(--text)]"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center sm:px-10">
          <p className="text-xl font-black">No encontramos coaches con esos filtros.</p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--muted)]">
            Prueba otra combinación o vuelve a ver todos los perfiles disponibles.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-full bg-[var(--text)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--bg)] transition hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text)]"
          >
            Ver todos los coaches
          </button>
        </div>
      )}
    </>
  );
}
