import React, { useCallback, useMemo, useState } from "react";
import { CourseAssignment, StudentPersonalData } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";

interface Props {
  students: StudentPersonalData[];
  courseId: string;
  week: number;
  assignments: CourseAssignment[];
  onUpdateAssignments: (assignments: CourseAssignment[]) => Promise<boolean>;
}

export default function EvaluacionesManager({ students, courseId, week, assignments, onUpdateAssignments }: Props) {
  const evaluations = useMemo(() => assignments.filter((item) => item.courseId === courseId && item.kind === "assessment" && item.title.startsWith(`[Semana ${week}]`)), [assignments, courseId, week]);
  const [selectedId, setSelectedId] = useState("");
  const selected = evaluations.find((item) => item.id === selectedId) || evaluations[0];
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const notify = (message: string, kind: ToastNotice['kind']) => setNotice({ id: Date.now(), message, kind });
  const roster = students;

  const createEvaluation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    const evaluationTitle = `[Semana ${week}] ${title.trim()}`;
    if (evaluations.some((item) => item.title.toLowerCase() === evaluationTitle.toLowerCase())) {
      notify("Ya existe una evaluación con ese nombre en esta semana.", "warning"); return;
    }
    setSaving(true);
    try {
      const saved = await onUpdateAssignments([...assignments, {
        id: `assessment-${Date.now()}`, courseId, title: evaluationTitle, kind: "assessment",
        description: "Evaluación registrada por el docente", dueDate: new Date().toISOString().slice(0, 10), submissions: [],
      }]);
      if (saved) { setTitle(""); setSelectedId(""); }
      notify(saved ? "Evaluación guardada en el servidor." : "No se pudo guardar la evaluación. Intente nuevamente.", saved ? "success" : "error");
    } finally { setSaving(false); }
  };

  const saveGrades = async () => {
    if (!selected || saving) return;
    const changed = roster.filter((student) => drafts[`${selected.id}-${student.dni}`]);
    if (!changed.length) { notify("Ingrese al menos una calificación.", "warning"); return; }
    const submissions = selected.submissions.map((item) => ({ ...item }));
    for (const student of changed) {
      const draft = drafts[`${selected.id}-${student.dni}`];
      if (!draft.grade.trim()) { notify("Una nota vacía no es cero. Ingrese una nota entre 0 y 20.", "warning"); return; }
      const grade = Number(draft.grade);
      if (!Number.isFinite(grade) || grade < 0 || grade > 20) { notify("Las notas deben estar entre 0 y 20.", "warning"); return; }
      const existing = submissions.findIndex((item) => item.studentDni === student.dni);
      if (existing >= 0) submissions[existing] = { ...submissions[existing], grade, feedback: draft.feedback };
      else submissions.push({ studentDni: student.dni, studentName: `${student.name} ${student.lastName}`,
        fileName: "", submitDate: new Date().toISOString().slice(0, 10), grade, feedback: draft.feedback });
    }
    setSaving(true);
    try {
      const saved = await onUpdateAssignments(assignments.map((item) => item.id === selected.id ? { ...item, submissions } : item));
      if (saved) setDrafts((previous) => {
        const next = { ...previous }; changed.forEach((student) => delete next[`${selected.id}-${student.dni}`]); return next;
      });
      notify(saved ? "Calificaciones guardadas en el servidor." : "No se pudieron guardar todas las notas. Conservamos tu edición para reintentar.", saved ? "success" : "error");
    } finally { setSaving(false); }
  };

  return <div className="space-y-5">
    {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}
    <h2 className="font-bold text-lg">Semana {week}: Evaluaciones y calificaciones</h2>
    <p className="text-sm text-slate-600">Las notas se guardan en el servidor. Una casilla sin calificación permanece sin nota.</p>
    <fieldset disabled={saving} className="space-y-5 min-w-0">
      <form onSubmit={createEvaluation} className="flex flex-wrap gap-3 rounded-xl border bg-white p-4">
        <label htmlFor="new-evaluation-title" className="self-center text-sm font-bold">Nueva evaluación</label>
        <input id="new-evaluation-title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nombre de la evaluación" className="border rounded-lg p-2" />
        <button type="submit" className="rounded-lg bg-[#9F062A] text-white px-4 py-2">Crear evaluación</button>
      </form>
      <label className="block text-sm font-bold">Evaluación
        <select value={selected?.id || ""} onChange={(event) => setSelectedId(event.target.value)} className="block border rounded-lg p-2 mt-1 w-full">
          {!evaluations.length ? <option value="">No hay evaluaciones guardadas</option> : evaluations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>
      {selected ? <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-sm text-left"><thead className="bg-slate-50"><tr>{["Estudiante", "Nota guardada", "Nueva nota (0–20)", "Observación"].map((heading) => <th scope="col" key={heading} className="p-3">{heading}</th>)}</tr></thead>
          <tbody>{roster.map((student) => {
            const saved = selected.submissions.find((item) => item.studentDni === student.dni);
            const draft = drafts[`${selected.id}-${student.dni}`];
            const update = (partial: Partial<{ grade: string; feedback: string }>) => setDrafts((previous) => ({ ...previous,
              [`${selected.id}-${student.dni}`]: { grade: saved?.grade?.toString() ?? "", feedback: saved?.feedback ?? "", ...previous[`${selected.id}-${student.dni}`], ...partial } }));
            return <tr key={student.dni} className="border-t"><td className="p-3">{student.name} {student.lastName}<p className="text-xs">{student.dni}</p></td>
              <td className="p-3">{saved?.grade === undefined ? "Sin nota" : `${saved.grade}/20`}</td>
              <td className="p-3"><input aria-label={`Nota de ${student.name} ${student.lastName}`} type="number" min="0" max="20" step="0.1"
                value={draft?.grade ?? saved?.grade?.toString() ?? ""} onChange={(event) => update({ grade: event.target.value })} className="border rounded-lg p-2 w-24" /></td>
              <td className="p-3"><input aria-label={`Observación de ${student.name} ${student.lastName}`} value={draft?.feedback ?? saved?.feedback ?? ""} onChange={(event) => update({ feedback: event.target.value })} className="border rounded-lg p-2" /></td></tr>;
          })}</tbody></table>
        {!roster.length ? <p className="p-4">No hay estudiantes matriculados en la carrera de este curso.</p> : null}
      </div> : null}
      <button type="button" disabled={!selected || !roster.length || saving} onClick={saveGrades} className="rounded-lg bg-[#9F062A] text-white px-4 py-2 disabled:bg-slate-200 disabled:text-slate-600">{saving ? "Guardando..." : "Guardar calificaciones"}</button>
    </fieldset>
  </div>;
}
