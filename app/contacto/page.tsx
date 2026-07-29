"use client";

import { FormEvent } from "react";

const phone = "525548792525";

export default function ContactoPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const nombre = form.get("nombre");
    const objetivo = form.get("objetivo");
    const mensaje = form.get("mensaje");

    const text = `Hola Sebastián, soy ${nombre}. Me interesa iniciar entrenamiento. Mi objetivo es: ${objetivo}. ${mensaje ? `Mensaje: ${mensaje}` : ""}`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 pb-20 pt-32 text-[var(--text)] sm:px-8 lg:px-10">
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Contacto
          </p>

          <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
            Agenda tu valoración.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            Déjanos tus datos y abre una conversación directa por WhatsApp para
            iniciar tu proceso.
          </p>

          <div className="mt-8 grid gap-3">
            <a
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                WhatsApp
              </p>
              <p className="mt-3 text-2xl font-black">5548792525</p>
            </a>

            <a
              href="https://instagram.com/sebglezcoach"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Instagram
              </p>
              <p className="mt-3 text-2xl font-black">@sebglezcoach</p>
            </a>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Nombre
              </label>

              <input
                name="nombre"
                required
                placeholder="Tu nombre"
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Objetivo
              </label>

              <select
                name="objetivo"
                required
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
              >
                <option>Perder grasa</option>
                <option>Ganar músculo</option>
                <option>Definición muscular</option>
                <option>Mejorar rendimiento</option>
                <option>Rehabilitación / movilidad</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                Mensaje
              </label>

              <textarea
                name="mensaje"
                rows={5}
                placeholder="Cuéntanos un poco sobre ti..."
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition active:scale-95"
            >
              Abrir WhatsApp
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}