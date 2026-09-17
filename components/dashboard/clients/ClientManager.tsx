"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Client = {
  id: string;
  coach_id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  objective: string | null;
  notes: string | null;
  created_at: string;
};

type ClientManagerProps = {
  initialClients: Client[];
};

const objectives = [
  "Pérdida de grasa",
  "Hipertrofia",
  "Definición muscular",
  "Rendimiento deportivo",
  "Calistenia",
  "Rehabilitación / movilidad",
  "Preparación para carrera",
  "Otro",
];

export default function ClientManager({ initialClients }: ClientManagerProps) {
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [linkingClientId, setLinkingClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clients.filter((client) => {
      return (
        client.full_name.toLowerCase().includes(query) ||
        String(client.email ?? "").toLowerCase().includes(query) ||
        String(client.phone ?? "").toLowerCase().includes(query) ||
        String(client.objective ?? "").toLowerCase().includes(query)
      );
    });
  }, [clients, search]);

  async function handleCreateClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const objective = String(form.get("objective") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/coach/clients/create-with-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        phone,
        objective,
        notes,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "No se pudo crear el cliente.");
      setLoading(false);
      return;
    }

    formElement.reset();
    setClients((current) => [result.client as Client, ...current]);
    setMessage("Cliente y login creados correctamente.");
    setFormOpen(false);
    setLoading(false);
  }

  async function handleUpdateClient(
    event: FormEvent<HTMLFormElement>,
    clientId: string
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const objective = String(form.get("objective") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("clients")
      .update({
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        objective: objective || null,
        notes: notes || null,
      })
      .eq("id", clientId)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setClients((current) =>
      current.map((client) =>
        client.id === clientId ? (data as Client) : client
      )
    );

    setEditingClientId(null);
    setMessage("Cliente actualizado correctamente.");
    setLoading(false);
  }

  async function handleDeleteClient(clientId: string, clientName: string) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a ${clientName}? También se eliminarán sus rutinas.`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("clients").delete().eq("id", clientId);

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setClients((current) => current.filter((client) => client.id !== clientId));
    setMessage("Cliente eliminado correctamente.");
    setLoading(false);
  }

  async function handleLinkClient(
    event: FormEvent<HTMLFormElement>,
    clientId: string
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("login_email") ?? "").trim();

    if (!email) {
      setMessage("Escribe el correo del usuario cliente.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.rpc("link_client_to_profile", {
      target_client_id: clientId,
      target_email: email,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setClients((current) =>
      current.map((client) => (client.id === clientId ? (data as Client) : client))
    );

    setLinkingClientId(null);
    setMessage("Cliente vinculado correctamente.");
    setLoading(false);
  }

  return (
    <div>
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
              Buscar cliente
            </label>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo, teléfono u objetivo..."
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setFormOpen((value) => !value)}
            className="rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition hover:scale-[1.02] active:scale-95"
          >
            {formOpen ? "Cerrar" : "+ Nuevo cliente"}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-[var(--muted)]">
            {filteredClients.length} clientes encontrados
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm font-bold text-[var(--muted)]">
          {message}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={handleCreateClient}
          className="mt-5 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Nuevo cliente
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <input
              name="full_name"
              required
              placeholder="Nombre completo"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            />

            <input
              name="email"
              type="email"
              placeholder="Correo del cliente"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            />

            <input
              name="password"
              type="text"
              required
              placeholder="Contraseña temporal del cliente"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            />

            <input
              name="phone"
              placeholder="Teléfono / WhatsApp"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            />

            <select
              name="objective"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none"
            >
              {objectives.map((objective) => (
                <option key={objective}>{objective}</option>
              ))}
            </select>

            <textarea
              name="notes"
              rows={4}
              placeholder="Notas"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-[var(--text)] outline-none lg:col-span-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[var(--button-bg)] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear cliente"}
          </button>
        </form>
      )}

      <div className="mt-6 grid gap-3">
        {filteredClients.map((client) => (
          <article
            key={client.id}
            className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl transition hover:bg-[var(--surface-strong)] sm:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                    {client.objective || "Sin objetivo"}
                  </p>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                      client.user_id
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : "border-orange-500/30 bg-orange-500/10 text-orange-500"
                    }`}
                  >
                    {client.user_id ? "Login conectado" : "Sin login"}
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[var(--text)]">
                  {client.full_name}
                </h2>

                <div className="mt-3 flex flex-col gap-1 text-sm font-bold text-[var(--muted)]">
                  {client.email && <p>{client.email}</p>}
                  {client.phone && <p>{client.phone}</p>}
                </div>

                {client.notes && (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                    {client.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <Link
                  href={`/dashboard/coach/clientes/${client.id}`}
                  className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)] transition hover:scale-[1.02] active:scale-95"
                >
                  Ver rutina
                </Link>

                <Link
                  href={`/dashboard/coach/clientes/${client.id}#calendario`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
                >
                  Ver calendario
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setLinkingClientId((current) =>
                      current === client.id ? null : client.id
                    )
                  }
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
                >
                  Vincular login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingClientId((current) =>
                      current === client.id ? null : client.id
                    )
                  }
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--text)] transition hover:bg-[var(--surface-strong)]"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClient(client.id, client.full_name)}
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-red-500 transition hover:bg-red-500/20"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {linkingClientId === client.id && (
              <form
                onSubmit={(event) => handleLinkClient(event, client.id)}
                className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                  Vincular login del cliente
                </p>

                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Primero crea el usuario en Supabase Authentication. Después
                  escribe aquí el mismo correo para conectarlo con este cliente.
                </p>

                <input
                  name="login_email"
                  type="email"
                  required
                  defaultValue={client.email ?? ""}
                  placeholder="correo del login del cliente"
                  className="mt-5 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                />

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
                  >
                    {loading ? "Vinculando..." : "Vincular"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkingClientId(null)}
                    className="rounded-2xl border border-[var(--border)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--text)]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {editingClientId === client.id && (
              <form
                onSubmit={(event) => handleUpdateClient(event, client.id)}
                className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                  Editar cliente
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <input
                    name="full_name"
                    required
                    defaultValue={client.full_name}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                  />

                  <input
                    name="email"
                    type="email"
                    defaultValue={client.email ?? ""}
                    placeholder="Correo"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                  />

                  <input
                    name="phone"
                    defaultValue={client.phone ?? ""}
                    placeholder="Teléfono"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                  />

                  <select
                    name="objective"
                    defaultValue={client.objective ?? "Otro"}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none"
                  >
                    {objectives.map((objective) => (
                      <option key={objective}>{objective}</option>
                    ))}
                  </select>

                  <textarea
                    name="notes"
                    rows={4}
                    defaultValue={client.notes ?? ""}
                    placeholder="Notas"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-[var(--text)] outline-none lg:col-span-2"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingClientId(null)}
                    className="rounded-2xl border border-[var(--border)] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[var(--text)]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
