"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import RoutineSeriesBlock from "@/components/dashboard/routines/RoutineSeriesBlock";
import {
  buildWorkoutExerciseBlocks,
  flattenWorkoutExerciseBlocks,
  getSeriesLabel,
} from "@/lib/workout-exercise-groups";

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  body_region: string | null;
  video_url: string | null;
};

type TemplateExercise = {
  id: string;
  template_id: string;
  exercise_id: string;
  position: number;
  sets: string | null;
  reps: string | null;
  weight: string | null;
  rest: string | null;
  rir: string | null;
  notes: string | null;
  series_group_id: string | null;
  exercise: Exercise | null;
};

type RoutineTemplate = {
  id: string;
  coach_id: string;
  name: string;
  focus: string | null;
  level: string | null;
  notes: string | null;
  created_at: string;
  template_exercises: TemplateExercise[];
};

type TemplateManagerProps = {
  initialTemplates: RoutineTemplate[];
  exercises: Exercise[];
  seriesSetupRequired?: boolean;
};

const levels = ["Principiante", "Intermedio", "Avanzado", "Todos"];

export default function TemplateManager({
  initialTemplates,
  exercises,
  seriesSetupRequired = false,
}: TemplateManagerProps) {
  const supabase = createClient();

  const [templates, setTemplates] =
    useState<RoutineTemplate[]>(initialTemplates);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [openExerciseFormTemplateId, setOpenExerciseFormTemplateId] = useState<
    string | null
  >(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [seriesSelectionTemplateId, setSeriesSelectionTemplateId] = useState<
    string | null
  >(null);
  const [selectedSeriesExerciseIds, setSelectedSeriesExerciseIds] = useState<
    string[]
  >([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const filteredExercises = useMemo(() => {
    const query = exerciseSearch.toLowerCase().trim();

    if (!query) return exercises;

    return exercises.filter((exercise) => {
      return (
        exercise.name.toLowerCase().includes(query) ||
        exercise.muscle_group.toLowerCase().includes(query) ||
        String(exercise.body_region ?? "").toLowerCase().includes(query)
      );
    });
  }, [exerciseSearch, exercises]);

  async function handleCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const name = String(form.get("name") ?? "").trim();
    const focus = String(form.get("focus") ?? "").trim();
    const level = String(form.get("level") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("No hay sesión activa.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("routine_templates")
      .insert({
        coach_id: user.id,
        name,
        focus: focus || null,
        level: level || null,
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const newTemplate: RoutineTemplate = {
      ...(data as Omit<RoutineTemplate, "template_exercises">),
      template_exercises: [],
    };

    setTemplates((current) => [newTemplate, ...current]);
    formElement.reset();
    setTemplateFormOpen(false);
    setMessage("Plantilla creada correctamente.");
    setLoading(false);
  }

  async function handleDeleteTemplate(templateId: string, templateName: string) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${templateName}"?`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.rpc("delete_routine_template", {
      target_template_id: templateId,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTemplates((current) =>
      current.filter((template) => template.id !== templateId)
    );
    setSeriesSelectionTemplateId((current) =>
      current === templateId ? null : current
    );
    setSelectedSeriesExerciseIds([]);

    setMessage("Plantilla eliminada correctamente.");
    setLoading(false);
  }

  async function handleUpdateTemplate(
    event: FormEvent<HTMLFormElement>,
    templateId: string
  ) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") ?? "").trim();
    const focus = String(form.get("focus") ?? "").trim();
    const level = String(form.get("level") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("routine_templates")
      .update({
        name,
        focus: focus || null,
        level: level || null,
        notes: notes || null,
      })
      .eq("id", templateId)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? {
              ...(data as Omit<RoutineTemplate, "template_exercises">),
              template_exercises: template.template_exercises,
            }
          : template
      )
    );

    setEditingTemplateId(null);
    setMessage("Plantilla actualizada correctamente.");
    setLoading(false);
  }

  async function handleAddExercise(
    event: FormEvent<HTMLFormElement>,
    templateId: string
  ) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const exerciseId = String(form.get("exercise_id") ?? "");
    const sets = String(form.get("sets") ?? "").trim();
    const reps = String(form.get("reps") ?? "").trim();
    const weight = String(form.get("weight") ?? "").trim();
    const rest = String(form.get("rest") ?? "").trim();
    const rir = String(form.get("rir") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    const selectedExercise = exercises.find(
      (exercise) => exercise.id === exerciseId
    );

    if (!selectedExercise) {
      setMessage("Selecciona un ejercicio válido.");
      return;
    }

    const currentTemplate = templates.find(
      (template) => template.id === templateId
    );

    const nextPosition =
      Math.max(
        0,
        ...(currentTemplate?.template_exercises.map((item) => item.position) ??
          [])
      ) + 1;

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("routine_template_exercises")
      .insert({
        template_id: templateId,
        exercise_id: exerciseId,
        position: nextPosition,
        sets: sets || null,
        reps: reps || null,
        weight: weight || null,
        rest: rest || null,
        rir: rir || null,
        notes: notes || null,
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const newItemData = data as Omit<TemplateExercise, "exercise">;
    const newItem: TemplateExercise = {
      ...newItemData,
      series_group_id: newItemData.series_group_id ?? null,
      exercise: selectedExercise,
    };

    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? {
              ...template,
              template_exercises: [...template.template_exercises, newItem],
            }
          : template
      )
    );

    formElement.reset();
    setExerciseSearch("");
    setOpenExerciseFormTemplateId(null);
    setMessage("Ejercicio agregado a la plantilla.");
    setLoading(false);
  }

  function toggleSeriesSelection(templateId: string) {
    setSeriesSelectionTemplateId((current) =>
      current === templateId ? null : templateId
    );
    setSelectedSeriesExerciseIds([]);
    setOpenExerciseFormTemplateId(null);
    setEditingTemplateId(null);
    setMessage("");
  }

  function toggleSeriesExercise(templateId: string, exerciseId: string) {
    if (seriesSelectionTemplateId !== templateId) return;

    const belongsToTemplate = templates
      .find((template) => template.id === templateId)
      ?.template_exercises.some(
        (item) => item.id === exerciseId && !item.series_group_id
      );

    if (!belongsToTemplate) return;

    setSelectedSeriesExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId]
    );
  }

  async function handleCreateSeriesGroup(templateId: string) {
    if (loadingSeries || seriesSelectionTemplateId !== templateId) return;

    const currentTemplate = templates.find(
      (template) => template.id === templateId
    );

    if (!currentTemplate) return;

    const previousExercises = currentTemplate.template_exercises;
    const orderedExercises = flattenWorkoutExerciseBlocks(previousExercises);
    const selectedIdSet = new Set(selectedSeriesExerciseIds);
    const selectedExercises = orderedExercises.filter(
      (item) => selectedIdSet.has(item.id) && !item.series_group_id
    );

    if (selectedExercises.length < 2) {
      setMessage("Selecciona al menos dos ejercicios de esta plantilla.");
      return;
    }

    const validSelectedIdSet = new Set(
      selectedExercises.map((exercise) => exercise.id)
    );
    const reorderedExercises: TemplateExercise[] = [];
    let seriesInserted = false;

    orderedExercises.forEach((exercise) => {
      if (!validSelectedIdSet.has(exercise.id)) {
        reorderedExercises.push(exercise);
        return;
      }

      if (!seriesInserted) {
        reorderedExercises.push(...selectedExercises);
        seriesInserted = true;
      }
    });

    const seriesGroupId = crypto.randomUUID();
    const updatedExercises = reorderedExercises.map((exercise, index) => ({
      ...exercise,
      position: index + 1,
      series_group_id: validSelectedIdSet.has(exercise.id)
        ? seriesGroupId
        : exercise.series_group_id,
    }));
    const rowsToSave = updatedExercises.map((exercise) => ({
      id: exercise.id,
      template_id: exercise.template_id,
      exercise_id: exercise.exercise_id,
      position: exercise.position,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      rest: exercise.rest,
      rir: exercise.rir,
      notes: exercise.notes,
      series_group_id: exercise.series_group_id,
    }));

    setLoadingSeries(true);
    setMessage("");
    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? { ...template, template_exercises: updatedExercises }
          : template
      )
    );

    const { error } = await supabase
      .from("routine_template_exercises")
      .upsert(rowsToSave, { onConflict: "id" });

    if (error) {
      setTemplates((current) =>
        current.map((template) =>
          template.id === templateId
            ? { ...template, template_exercises: previousExercises }
            : template
        )
      );

      const missingSeriesColumn =
        error.code === "42703" ||
        error.code === "PGRST204" ||
        error.message.includes("series_group_id");

      setMessage(
        missingSeriesColumn
          ? "Falta activar las series combinadas para plantillas en Supabase. Ejecuta supabase/template-series-groups.sql y vuelve a intentarlo."
          : "No se pudo crear la serie combinada. Los ejercicios conservaron su orden anterior."
      );
      setLoadingSeries(false);
      return;
    }

    setMessage(
      `${getSeriesLabel(selectedExercises.length)} creada correctamente en la plantilla.`
    );
    setSeriesSelectionTemplateId(null);
    setSelectedSeriesExerciseIds([]);
    setLoadingSeries(false);
  }

  async function handleUngroupSeries(
    templateId: string,
    seriesGroupId: string
  ) {
    if (loadingSeries) return;

    const currentTemplate = templates.find(
      (template) => template.id === templateId
    );

    if (!currentTemplate) return;

    const previousExercises = currentTemplate.template_exercises;
    const updatedExercises = previousExercises.map((exercise) =>
      exercise.series_group_id === seriesGroupId
        ? { ...exercise, series_group_id: null }
        : exercise
    );

    setLoadingSeries(true);
    setMessage("");
    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? { ...template, template_exercises: updatedExercises }
          : template
      )
    );

    const { error } = await supabase
      .from("routine_template_exercises")
      .update({ series_group_id: null })
      .eq("template_id", templateId)
      .eq("series_group_id", seriesGroupId);

    if (error) {
      setTemplates((current) =>
        current.map((template) =>
          template.id === templateId
            ? { ...template, template_exercises: previousExercises }
            : template
        )
      );
      setMessage(
        "No se pudo desagrupar la serie. La plantilla conserva el grupo anterior."
      );
      setLoadingSeries(false);
      return;
    }

    setMessage("Serie desagrupada correctamente en la plantilla.");
    setLoadingSeries(false);
  }

  async function handleDeleteTemplateExercise(
    templateId: string,
    itemId: string,
    exerciseName: string
  ) {
    const confirmed = window.confirm(
      `¿Seguro que quieres quitar "${exerciseName}"?`
    );

    if (!confirmed) return;

    const currentTemplate = templates.find(
      (template) => template.id === templateId
    );
    const previousExercises = currentTemplate?.template_exercises;
    const exerciseToDelete = previousExercises?.find(
      (item) => item.id === itemId
    );

    if (!previousExercises || !exerciseToDelete) {
      setMessage("No se encontró el ejercicio en esta plantilla.");
      return;
    }

    const remainingSeriesMembers = exerciseToDelete.series_group_id
      ? previousExercises.filter(
          (item) =>
            item.series_group_id === exerciseToDelete.series_group_id &&
            item.id !== itemId
        )
      : [];
    const remainingExerciseToUngroup =
      remainingSeriesMembers.length === 1 ? remainingSeriesMembers[0] : null;
    const updatedExercises = previousExercises
      .filter((item) => item.id !== itemId)
      .map((item) =>
        item.id === remainingExerciseToUngroup?.id
          ? { ...item, series_group_id: null }
          : item
      );

    setLoading(true);
    setMessage("");
    setTemplates((current) =>
      current.map((template) =>
        template.id === templateId
          ? { ...template, template_exercises: updatedExercises }
          : template
      )
    );
    setSelectedSeriesExerciseIds((current) =>
      current.filter((id) => id !== itemId)
    );

    const { error } = await supabase
      .from("routine_template_exercises")
      .delete()
      .eq("id", itemId)
      .eq("template_id", templateId);

    if (error) {
      setTemplates((current) =>
        current.map((template) =>
          template.id === templateId
            ? { ...template, template_exercises: previousExercises }
            : template
        )
      );
      setMessage(
        "No se pudo quitar el ejercicio. La plantilla conserva sus datos anteriores."
      );
      setLoading(false);
      return;
    }

    if (remainingExerciseToUngroup) {
      const { error: ungroupError } = await supabase
        .from("routine_template_exercises")
        .update({ series_group_id: null })
        .eq("id", remainingExerciseToUngroup.id)
        .eq("template_id", templateId)
        .eq("series_group_id", exerciseToDelete.series_group_id!);

      if (ungroupError) {
        const exercisesAfterDelete = previousExercises.filter(
          (item) => item.id !== itemId
        );

        setTemplates((current) =>
          current.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  template_exercises: exercisesAfterDelete,
                }
              : template
          )
        );
        setMessage(
          "El ejercicio se eliminó, pero no se pudo separar el último integrante del grupo. Intenta desagruparlo de nuevo."
        );
        setLoading(false);
        return;
      }
    }

    setMessage(
      remainingExerciseToUngroup
        ? "Ejercicio eliminado y serie desagrupada correctamente."
        : "Ejercicio eliminado de la plantilla."
    );
    setLoading(false);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
              Plantillas
            </p>

            <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-tight sm:text-6xl">
              Rutinas predeterminadas.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Crea rutinas base como pierna, push, pull, glúteo o full body.
              Después las vamos a poder aplicar a clientes.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex">
            <Link
              href="/dashboard/coach"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[var(--text)]"
            >
              Volver
            </Link>

            <button
              type="button"
              onClick={() => setTemplateFormOpen((current) => !current)}
              className="rounded-2xl bg-[var(--button-bg)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)]"
            >
              {templateFormOpen ? "Cerrar" : "+ Plantilla"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm font-bold text-[var(--muted)]">
          {message}
        </p>
      )}

      {seriesSetupRequired && (
        <p
          role="alert"
          className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-bold leading-7 text-[var(--text)]"
        >
          Tus plantillas siguen disponibles, pero para crear biseries o
          triseries primero ejecuta el archivo
          {" "}
          <code>supabase/template-series-groups.sql</code> en Supabase y recarga
          esta página.
        </p>
      )}

      {templateFormOpen && (
        <form
          onSubmit={handleCreateTemplate}
          className="mt-5 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
            Nueva plantilla
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Pierna cuadri + glúteo"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            />

            <input
              name="focus"
              placeholder="Hipertrofia / Fuerza / Definición"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            />

            <select
              name="level"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none"
            >
              {levels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>

            <textarea
              name="notes"
              rows={3}
              placeholder="Notas generales"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-5 py-4 text-sm text-[var(--text)] outline-none md:col-span-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear plantilla"}
          </button>
        </form>
      )}

      <div className="mt-5 grid gap-5">
        {templates.map((template) => {
          const exerciseBlocks = buildWorkoutExerciseBlocks(
            template.template_exercises
          );
          const displayPositionById = new Map<string, number>(
            exerciseBlocks
              .flatMap((block) => block.exercises)
              .map((exercise, index) => [exercise.id, index + 1] as const)
          );
          const selectingSeries =
            seriesSelectionTemplateId === template.id;
          const availableForSeries = template.template_exercises.filter(
            (exercise) => !exercise.series_group_id
          ).length;
          const seriesHelpId = `template-series-help-${template.id}`;

          return (
          <article
            key={template.id}
            className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl sm:p-6"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[var(--muted)]">
                  {template.focus || "Rutina base"} ·{" "}
                  {template.level || "Todos"}
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  {template.name}
                </h2>

                {template.notes && (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                    {template.notes}
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:w-[590px] lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setSeriesSelectionTemplateId(null);
                    setSelectedSeriesExerciseIds([]);
                    setOpenExerciseFormTemplateId((current) =>
                      current === template.id ? null : template.id
                    );
                  }}
                  disabled={loading || loadingSeries}
                  className="rounded-2xl bg-[var(--button-bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--button-text)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + Ejercicio
                </button>

                <button
                  type="button"
                  onClick={() => toggleSeriesSelection(template.id)}
                  disabled={
                    loading ||
                    loadingSeries ||
                    (!selectingSeries && availableForSeries < 2)
                  }
                  aria-pressed={selectingSeries}
                  title={
                    !selectingSeries && availableForSeries < 2
                      ? "Agrega al menos dos ejercicios sin agrupar"
                      : undefined
                  }
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {selectingSeries
                    ? "Cancelar selección"
                    : "Agrupar ejercicios"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSeriesSelectionTemplateId(null);
                    setSelectedSeriesExerciseIds([]);
                    setOpenExerciseFormTemplateId(null);
                    setEditingTemplateId((current) =>
                      current === template.id ? null : template.id
                    );
                  }}
                  disabled={loading || loadingSeries}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteTemplate(template.id, template.name)
                  }
                  disabled={loading || loadingSeries}
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {editingTemplateId === template.id && (
              <form
                onSubmit={(event) => handleUpdateTemplate(event, template.id)}
                className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="name"
                    required
                    defaultValue={template.name}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none"
                  />

                  <input
                    name="focus"
                    defaultValue={template.focus ?? ""}
                    placeholder="Enfoque"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none"
                  />

                  <select
                    name="level"
                    defaultValue={template.level ?? "Todos"}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none"
                  >
                    {levels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>

                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={template.notes ?? ""}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none md:col-span-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
                >
                  Guardar cambios
                </button>
              </form>
            )}

            {openExerciseFormTemplateId === template.id && (
              <form
                onSubmit={(event) => handleAddExercise(event, template.id)}
                className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--bg)] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                  Agregar ejercicio
                </p>

                <input
                  value={exerciseSearch}
                  onChange={(event) => setExerciseSearch(event.target.value)}
                  placeholder="Buscar ejercicio..."
                  className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none"
                />

                <select
                  name="exercise_id"
                  required
                  className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none"
                >
                  {filteredExercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} — {exercise.muscle_group}
                    </option>
                  ))}
                </select>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <input name="sets" placeholder="Series" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none" />
                  <input name="reps" placeholder="Reps" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none" />
                  <input name="weight" placeholder="Peso (kg o lb)" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none" />
                  <input name="rest" placeholder="Descanso" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none" />
                  <input name="rir" placeholder="RIR" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none" />
                </div>

                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Notas específicas"
                  className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm outline-none"
                />

                <button
                  type="submit"
                  disabled={loading || loadingSeries}
                  className="mt-4 w-full rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-[var(--button-text)] disabled:opacity-50"
                >
                  Agregar ejercicio
                </button>
              </form>
            )}

            {selectingSeries && (
              <div
                id={seriesHelpId}
                className="mt-5 rounded-[24px] border-2 border-[var(--text)] bg-[var(--surface-strong)] p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                      Crear serie combinada
                    </p>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                      Selecciona dos o más ejercicios de esta plantilla. Se
                      mostrarán juntos y conservarán el orden indicado.
                    </p>
                    <p
                      role="status"
                      aria-live="polite"
                      className="mt-3 text-sm font-black text-[var(--text)]"
                    >
                      {selectedSeriesExerciseIds.length} ejercicio
                      {selectedSeriesExerciseIds.length === 1 ? "" : "s"}{" "}
                      seleccionado
                      {selectedSeriesExerciseIds.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleCreateSeriesGroup(template.id)}
                      disabled={
                        selectedSeriesExerciseIds.length < 2 || loadingSeries
                      }
                      className="rounded-2xl bg-[var(--button-bg)] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--button-text)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loadingSeries
                        ? "Guardando..."
                        : selectedSeriesExerciseIds.length >= 2
                          ? `Crear ${getSeriesLabel(
                              selectedSeriesExerciseIds.length
                            ).toLowerCase()}`
                          : "Selecciona ejercicios"}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSeriesSelection(template.id)}
                      disabled={loadingSeries}
                      className="rounded-2xl border border-[var(--border)] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--text)] disabled:opacity-40"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3">
              {exerciseBlocks.map((block) => {
                const exerciseCards = block.exercises.map((item, index) => {
                  const selected = selectedSeriesExerciseIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-[22px] border border-[var(--border)] bg-[var(--bg)] p-5 ${
                        selected ? "ring-2 ring-[var(--text)]" : ""
                      }`}
                    >
                  {selectingSeries && !item.series_group_id && (
                    <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-black text-[var(--text)]">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleSeriesExercise(template.id, item.id)
                        }
                        aria-describedby={seriesHelpId}
                        className="h-5 w-5 shrink-0 accent-[var(--text)]"
                      />
                      <span>
                        Incluir {item.exercise?.name || "este ejercicio"} en la
                        serie
                      </span>
                    </label>
                  )}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--muted)]">
                          {(displayPositionById.get(item.id) ?? item.position)
                            .toString()
                            .padStart(2, "0")} ·{" "}
                          {item.exercise?.muscle_group || "Ejercicio"}
                        </p>

                        {block.seriesGroupId && (
                          <span className="rounded-full bg-[var(--text)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--bg)]">
                            Paso {index + 1} de {block.exercises.length}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-2xl font-black">
                        {item.exercise?.name || "Ejercicio"}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.sets && (
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-black text-[var(--muted)]">
                            {item.sets} series
                          </span>
                        )}

                        {item.reps && (
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-black text-[var(--muted)]">
                            {item.reps} reps
                          </span>
                        )}

                        {item.rest && (
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-black text-[var(--muted)]">
                            {item.rest} descanso
                          </span>
                        )}

                        {item.rir && (
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-black text-[var(--muted)]">
                            RIR {item.rir}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTemplateExercise(
                          template.id,
                          item.id,
                          item.exercise?.name || "este ejercicio"
                        )
                      }
                      disabled={loading || loadingSeries}
                      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Quitar
                    </button>
                  </div>
                    </div>
                  );
                });

                return block.seriesGroupId ? (
                  <RoutineSeriesBlock
                    key={block.id}
                    exerciseCount={block.exercises.length}
                    onUngroup={() =>
                      handleUngroupSeries(template.id, block.seriesGroupId!)
                    }
                    ungrouping={loadingSeries}
                  >
                    {exerciseCards}
                  </RoutineSeriesBlock>
                ) : (
                  exerciseCards[0]
                );
              })}

              {template.template_exercises.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--border)] p-6 text-center">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    Esta plantilla todavía no tiene ejercicios.
                  </p>
                </div>
              )}
            </div>
          </article>
          );
        })}

        {templates.length === 0 && (
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center backdrop-blur-xl">
            <h2 className="text-3xl font-black">Aún no hay plantillas.</h2>

            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Crea tu primera rutina predeterminada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
