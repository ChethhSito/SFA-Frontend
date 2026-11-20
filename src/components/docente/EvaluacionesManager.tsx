import React, { useCallback, useMemo, useState } from "react";
import { Award, Plus, Save, CheckCircle2, AlertCircle, FileSpreadsheet, ChevronDown } from "lucide-react";
import { CourseAssignment, StudentPersonalData } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";
import { ROSTER } from "./DocenteTypes";

interface Props {
  students: StudentPersonalData[];
  courseId: string;
  week: number;
  assignments: CourseAssignment[];
  onUpdateAssignments: (assignments: CourseAssignment[]) => Promise<boolean>;
}

export default function EvaluacionesManager({ 
  students, 
  courseId, 
  week, 
  assignments, 
  onUpdateAssignments 
}: Props) {
  const evaluations = useMemo(() => assignments.filter((item) => 
    item.courseId === courseId && item.kind === "assessment" && item.title.startsWith(`[Semana ${week}]`)
  ), [assignments, courseId, week]);

  const [selectedId, setSelectedId] = useState("");
  const selected = evaluations.find((item) => item.id === selectedId) || evaluations[0];
  const [title, setTitle] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const notify = (message: string, kind: ToastNotice['kind']) => setNotice({ id: Date.now(), message, kind });

  // Ensure active student roster is never empty if students exist in system
  const effectiveStudents = useMemo(() => {
    if (students && students.length > 0) return students;
    if (ROSTER && ROSTER.length > 0) {
      return ROSTER.map(r => ({
        dni: r.dni,
        name: r.name,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone
      } as StudentPersonalData));
    }
    return [];
  }, [students]);

  const createEvaluation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;
    const evaluationTitle = `[Semana ${week}] ${title.trim()}`;
    if (evaluations.some((item) => item.title.toLowerCase() === evaluationTitle.toLowerCase())) {
      notify("Ya existe una evaluación con ese nombre en esta semana.", "warning");
      return;
    }
    setSaving(true);
    try {
      const saved = await onUpdateAssignments([...assignments, {
        id: `assessment-${Date.now()}`,
        courseId,
        title: evaluationTitle,
        kind: "assessment",
        description: "Evaluación modular registrada por el docente titular",
        dueDate: new Date().toISOString().slice(0, 10),
        submissions: [],
      }]);
      if (saved) {
        setTitle("");
        setSelectedId("");
      }
      notify(saved ? "Evaluación habilitada en el servidor." : "No se pudo guardar la evaluación. Intente nuevamente.", saved ? "success" : "error");
    } finally {
      setSaving(false);
    }
  };

  const saveGrades = async () => {
    if (!selected || saving) return;
    const changed = effectiveStudents.filter((student) => drafts[`${selected.id}-${student.dni}`]);
    if (!changed.length) {
      notify("Ingrese al menos una calificación antes de guardar.", "warning");
      return;
    }
    const submissions = selected.submissions.map((item) => ({ ...item }));
    for (const student of changed) {
      const draft = drafts[`${selected.id}-${student.dni}`];
      if (!draft.grade.trim()) {
        notify("Una nota vacía no es cero. Ingrese una nota entre 0 y 20.", "warning");
        return;
      }
      const grade = Number(draft.grade);
      if (!Number.isFinite(grade) || grade < 0 || grade > 20) {
        notify("Las calificaciones oficiales deben estar entre 0 y 20.", "warning");
        return;
      }
      const existing = submissions.findIndex((item) => item.studentDni === student.dni);
      if (existing >= 0) {
        submissions[existing] = { ...submissions[existing], grade, feedback: draft.feedback };
      } else {
        submissions.push({
          studentDni: student.dni,
          studentName: `${student.name} ${student.lastName}`,
          fileName: "",
          submitDate: new Date().toISOString().slice(0, 10),
          grade,
          feedback: draft.feedback
        });
      }
    }
    setSaving(true);
    try {
      const saved = await onUpdateAssignments(assignments.map((item) => item.id === selected.id ? { ...item, submissions } : item));
      if (saved) {
        setDrafts((previous) => {
          const next = { ...previous };
          changed.forEach((student) => delete next[`${selected.id}-${student.dni}`]);
          return next;
        });
      }
      notify(saved ? "Calificaciones guardadas y auditadas en el servidor." : "No se pudieron guardar todas las notas.", saved ? "success" : "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}

      {/* Header Institucional */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Semana {week}: Evaluaciones y Calificaciones
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Califique pruebas formativas, evaluaciones de taller y asigne retroalimentación a los estudiantes.
            </p>
          </div>
        </div>

        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-black font-mono">
          {evaluations.length} {evaluations.length === 1 ? "evaluación programada" : "evaluaciones programadas"}
        </span>
      </div>

      <fieldset disabled={saving} className="space-y-6 min-w-0">
        {/* Formulario Crear Evaluación & Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Crear Evaluación */}
          <form onSubmit={createEvaluation} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-3">
            <label htmlFor="new-evaluation-title" className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Nueva Evaluación para Semana {week}
            </label>
            <div className="flex gap-2">
              <input
                id="new-evaluation-title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: Evaluación Práctica de Circuitos BT"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                Crear
              </button>
            </div>
          </form>

          {/* Card Selector de Evaluación */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Seleccionar Evaluación a Calificar
            </label>
            <div className="relative">
              <select
                value={selected?.id || ""}
                onChange={(event) => setSelectedId(event.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer appearance-none pr-9"
              >
                {!evaluations.length ? (
                  <option value="">No hay evaluaciones guardadas en esta semana</option>
                ) : (
                  evaluations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.submissions.length} calificados)
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabla de Calificaciones de Alumnos */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden space-y-4 p-5">
            <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                  {selected.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Ingrese las notas individuales del registro pedagógico.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Ponderación Vigente: <strong className="text-slate-800">Escala Vigesimal (0 a 20)</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                  <tr>
                    <th scope="col" className="p-3.5">Estudiante</th>
                    <th scope="col" className="p-3.5 text-center">Nota Guardada</th>
                    <th scope="col" className="p-3.5 text-center">Nueva Nota (0–20)</th>
                    <th scope="col" className="p-3.5">Observación / Retroalimentación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {effectiveStudents.map((student) => {
                    const saved = selected.submissions.find((item) => item.studentDni === student.dni);
                    const draft = drafts[`${selected.id}-${student.dni}`];
                    const update = (partial: Partial<{ grade: string; feedback: string }>) => setDrafts((previous) => ({
                      ...previous,
                      [`${selected.id}-${student.dni}`]: {
                        grade: saved?.grade?.toString() ?? "",
                        feedback: saved?.feedback ?? "",
                        ...previous[`${selected.id}-${student.dni}`],
                        ...partial
                      }
                    }));

                    const initials = `${(student.name || "E").charAt(0)}${(student.lastName || "S").charAt(0)}`.toUpperCase();
                    const isApproved = saved?.grade !== undefined && saved.grade >= 12.5;

                    return (
                      <tr key={student.dni} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 shrink-0">
                              {initials}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block text-xs">
                                {student.lastName ? `${student.lastName}, ${student.name}` : student.name}
                              </span>
                              <span className="text-[10.5px] font-mono text-slate-400 font-bold block">
                                DNI: {student.dni}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          {saved?.grade === undefined ? (
                            <span className="text-slate-400 font-bold font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                              Sin nota
                            </span>
                          ) : (
                            <span className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full inline-block ${
                              isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {saved.grade.toFixed(1)} / 20
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <input
                            aria-label={`Nota de ${student.name} ${student.lastName}`}
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={draft?.grade ?? saved?.grade?.toString() ?? ""}
                            onChange={(event) => update({ grade: event.target.value })}
                            placeholder="0 - 20"
                            className="w-20 px-2.5 py-1.5 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-extrabold text-slate-900 outline-none focus:border-[#800521] focus:bg-white transition-all mx-auto block"
                          />
                        </td>

                        <td className="p-3.5">
                          <input
                            aria-label={`Observación de ${student.name} ${student.lastName}`}
                            value={draft?.feedback ?? saved?.feedback ?? ""}
                            onChange={(event) => update({ feedback: event.target.value })}
                            placeholder="Anotación técnica de desempeño..."
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all placeholder:text-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-150">
              <span className="text-xs text-slate-500 font-medium">
                Calificaciones respaldadas en pasarela de actas MINEDU.
              </span>

              <button
                type="button"
                disabled={!effectiveStudents.length || saving}
                onClick={saveGrades}
                className="bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{saving ? "Guardando..." : "Guardar Calificaciones"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center mb-1">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
              No hay evaluaciones guardadas en esta semana
            </h4>
            <p className="text-xs text-slate-400 font-medium max-w-sm">
              Utilice el formulario superior para crear la primera evaluación o prueba de taller de la Semana {week}.
            </p>
          </div>
        )}
      </fieldset>
    </div>
  );
}
