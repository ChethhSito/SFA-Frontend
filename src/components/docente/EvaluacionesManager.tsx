import React, { useCallback, useMemo, useState } from "react";
import { Award, Plus, Save, CheckCircle2, AlertCircle, FileSpreadsheet, ChevronDown, Check, Lock, Trash2 } from "lucide-react";
import { CourseAssignment, StudentPersonalData } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";
import ConfirmModal from "../ui/ConfirmModal";
import { ROSTER } from "./DocenteTypes";
import { getCourseFormula } from "../../constants/courseFormulas";
import { SecurePinModal } from "./evaluaciones/SecurePinModal";

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
  const formula = useMemo(() => getCourseFormula(courseId), [courseId]);

  const evaluations = useMemo(() => assignments.filter((item) => 
    item.courseId === courseId && item.kind === "assessment" && item.title.startsWith(`[Semana ${week}]`)
  ), [assignments, courseId, week]);

  const [selectedId, setSelectedId] = useState("");
  const selected = evaluations.find((item) => item.id === selectedId) || evaluations[0];
  const [title, setTitle] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedModality, setSelectedModality] = useState<"presencial" | "virtual">("presencial");
  const [drafts, setDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const notify = (message: string, kind: ToastNotice['kind']) => setNotice({ id: Date.now(), message, kind });

  // Secure PIN modal for grade saving
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinErrorMessage, setPinErrorMessage] = useState("");
  const keypadNumbers = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], []);

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

  // Track curricular milestones already scheduled in any week of this course
  const assignedComponentsMap = useMemo(() => {
    const map: Record<string, { week?: number; title: string }> = {};
    assignments
      .filter((a) => a.courseId === courseId && !a.title.startsWith("[Planilla] "))
      .forEach((a) => {
        const comp = a.curricularComponent || formula.variables.find((v) => v.id !== "NPA" && (a.title.toUpperCase().includes(`[${v.id}]`) || a.title.toUpperCase().includes(v.id)))?.id;
        if (comp && comp !== "NPA") {
          const weekMatch = a.title.match(/\[Semana\s*(\d+)\]/i) || a.title.match(/Semana\s*(\d+)/i);
          const w = weekMatch ? Number(weekMatch[1]) : undefined;
          map[comp] = { week: w, title: a.title };
        }
      });
    return map;
  }, [assignments, courseId, formula.variables]);

  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

  const executeDeleteEvaluation = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const evaluationIdToDelete = selected.id;
      const evaluationTitleToDelete = selected.title;
      const linkedComp = selected.curricularComponent;
      
      // Filter out this assessment robustly by ID and Title
      let updatedAssignments = assignments.filter((a) => a.id !== evaluationIdToDelete && a.title !== evaluationTitleToDelete);

      // If it had a curricular component, check if any other evaluation uses it; if not, remove the [Planilla] entry as well
      if (linkedComp) {
        const otherUsesComponent = updatedAssignments.some(
          (a) => a.courseId === courseId && a.id !== evaluationIdToDelete && a.title !== evaluationTitleToDelete && (a.curricularComponent === linkedComp || a.title.toUpperCase().includes(`[${linkedComp}]`))
        );
        if (!otherUsesComponent) {
          updatedAssignments = updatedAssignments.filter(
            (a) => !(a.courseId === courseId && a.title === `[Planilla] ${linkedComp}`)
          );
        }
      }

      const saved = await onUpdateAssignments(updatedAssignments);
      if (saved) {
        setSelectedId("");
        notify(`Evaluación eliminada correctamente de la Semana ${week}.`, "success");
      } else {
        notify("No se pudo eliminar la evaluación. Intente nuevamente.", "error");
      }
    } finally {
      setSaving(false);
      setConfirmDeleteModalOpen(false);
    }
  };

  const createEvaluation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || saving) return;

    let finalComponent = selectedComponent;
    const upperTitle = title.toUpperCase();

    // Auto-detect official milestone if not explicitly chosen in dropdown
    if (!finalComponent) {
      if (upperTitle.includes("PC1") || upperTitle.includes("PRÁCTICA CALIFICADA 1") || upperTitle.includes("PRACTICA CALIFICADA 1")) {
        finalComponent = "PC1";
      } else if (upperTitle.includes("PC2") || upperTitle.includes("PRÁCTICA CALIFICADA 2") || upperTitle.includes("PRACTICA CALIFICADA 2")) {
        finalComponent = "PC2";
      } else if (upperTitle.includes("EX_FINAL") || upperTitle.includes("EXAMEN FINAL") || upperTitle.includes("FINAL")) {
        finalComponent = "EX_FINAL";
      }
    }

    // Prevent duplicate official milestones (e.g. two PC1 or two PC2 in same course)
    if (finalComponent && finalComponent !== "NPA") {
      const existing = assignedComponentsMap[finalComponent];
      if (existing) {
        notify(`El hito oficial "${finalComponent}" ya se encuentra programado${existing.week ? ` en la Semana ${existing.week}` : ""}. Un curso oficial solo puede tener un único hito de este tipo.`, "warning");
        return;
      }
    }

    // Also prevent duplicate if title contains official milestone keywords
    for (const v of formula.variables) {
      if (v.id === "NPA") continue;
      const isMentionedInTitle = 
        upperTitle.includes(`[${v.id}]`) ||
        upperTitle.includes(v.id) ||
        (v.id === "PC1" && (upperTitle.includes("PRÁCTICA CALIFICADA 1") || upperTitle.includes("PRACTICA CALIFICADA 1"))) ||
        (v.id === "PC2" && (upperTitle.includes("PRÁCTICA CALIFICADA 2") || upperTitle.includes("PRACTICA CALIFICADA 2"))) ||
        (v.id === "EX_FINAL" && (upperTitle.includes("EXAMEN FINAL") || upperTitle.includes("FINAL")));

      if (isMentionedInTitle) {
        const existing = assignedComponentsMap[v.id];
        if (existing) {
          notify(`El hito oficial "${v.label}" ya está programado${existing.week ? ` en la Semana ${existing.week}` : ""}. No es posible registrar dos veces el mismo hito en el curso.`, "warning");
          return;
        }
      }
    }

    const tag = finalComponent ? `[${finalComponent}] ` : "";
    const cleanTitle = title.trim().replace(/^\[(PC1|PC2|EX_FINAL|NPA)\]\s*/i, "");
    const evaluationTitle = `[Semana ${week}] ${tag}${cleanTitle}`;
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
        modality: selectedModality,
        curricularComponent: finalComponent || undefined,
        description: finalComponent 
          ? `Hito Curricular Oficial (${finalComponent}) • Modalidad ${selectedModality === "presencial" ? "Presencial de Taller" : "Virtual"}`
          : `Evaluación formativa de sesión semanal (${selectedModality === "presencial" ? "Presencial" : "Virtual"})`,
        dueDate: new Date().toISOString().slice(0, 10),
        submissions: [],
      }]);
      if (saved) {
        setTitle("");
        setSelectedComponent("");
        setSelectedId("");
      }
      notify(saved ? `Evaluación ${selectedModality} programada correctamente para la Semana ${week}.` : "No se pudo guardar la evaluación. Intente nuevamente.", saved ? "success" : "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStartSave = () => {
    if (!selected || saving) return;
    const changed = effectiveStudents.filter((student) => drafts[`${selected.id}-${student.dni}`]);
    if (!changed.length) {
      notify("Ingrese al menos una calificación antes de guardar.", "warning");
      return;
    }
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
    }
    setEnteredPin("");
    setPinErrorMessage("");
    setPinModalOpen(true);
  };

  const handleKeypadPress = (digit: number) => {
    if (enteredPin.length >= 4) return;
    setPinErrorMessage("");
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    if (nextPin === "1234") {
      setTimeout(() => {
        setPinModalOpen(false);
        executeSaveGrades("1234");
      }, 250);
    } else if (nextPin.length === 4) {
      setTimeout(() => {
        setPinErrorMessage("Clave de firma SFA incorrecta. Intente de nuevo.");
        setEnteredPin("");
      }, 350);
    }
  };

  const handleKeypadClear = () => {
    setEnteredPin("");
    setPinErrorMessage("");
  };

  const executeSaveGrades = async (pin: string) => {
    if (!selected || saving) return;
    const changed = effectiveStudents.filter((student) => drafts[`${selected.id}-${student.dni}`]);
    const submissions = selected.submissions.map((item) => ({ ...item }));
    const nowIso = new Date().toISOString();

    for (const student of changed) {
      const draft = drafts[`${selected.id}-${student.dni}`];
      const grade = Number(draft.grade);
      const existing = submissions.findIndex((item) => item.studentDni === student.dni);
      if (existing >= 0) {
        submissions[existing] = {
          ...submissions[existing],
          grade,
          feedback: draft.feedback,
          verifiedByPin: pin,
          verifiedAt: nowIso,
          modality: selected.modality || "presencial"
        };
      } else {
        submissions.push({
          studentDni: student.dni,
          studentName: `${student.name} ${student.lastName}`,
          fileName: "",
          submitDate: nowIso.slice(0, 10),
          grade,
          feedback: draft.feedback,
          verifiedByPin: pin,
          verifiedAt: nowIso,
          modality: selected.modality || "presencial"
        });
      }
    }

    // Check if this evaluation is linked to an official formula component (PC1, PC2, etc.)
    const linkedVar = selected.curricularComponent || 
      formula.variables.find(v => selected.title.toUpperCase().includes(v.id))?.id;

    let updatedAssignments = assignments.map((item) => item.id === selected.id ? { ...item, submissions } : item);

    if (linkedVar) {
      const planillaTitle = `[Planilla] ${linkedVar}`;
      const existingPlanilla = updatedAssignments.find(a => a.courseId === courseId && a.title === planillaTitle);
      const planillaSubmissions = existingPlanilla ? [...existingPlanilla.submissions] : [];

      submissions.forEach(sub => {
        const pIdx = planillaSubmissions.findIndex(ps => ps.studentDni === sub.studentDni);
        if (pIdx >= 0) {
          planillaSubmissions[pIdx] = { 
            ...planillaSubmissions[pIdx], 
            grade: sub.grade,
            feedback: sub.feedback,
            verifiedByPin: pin,
            verifiedAt: nowIso
          };
        } else {
          planillaSubmissions.push({ 
            ...sub,
            verifiedByPin: pin,
            verifiedAt: nowIso
          });
        }
      });

      if (existingPlanilla) {
        updatedAssignments = updatedAssignments.map(a => a.id === existingPlanilla.id ? { ...a, submissions: planillaSubmissions } : a);
      } else {
        updatedAssignments.push({
          id: `assessment-planilla-${Date.now()}`,
          courseId,
          title: planillaTitle,
          kind: "assessment",
          description: "Componente curricular oficial de planilla",
          dueDate: nowIso.slice(0, 10),
          submissions: planillaSubmissions
        });
      }
    }

    setSaving(true);
    try {
      const saved = await onUpdateAssignments(updatedAssignments);
      if (saved) {
        setDrafts((previous) => {
          const next = { ...previous };
          changed.forEach((student) => delete next[`${selected.id}-${student.dni}`]);
          return next;
        });
      }
      notify(saved ? "Calificaciones y observaciones guardadas y firmadas con PIN de seguridad." : "No se pudieron guardar todas las notas.", saved ? "success" : "error");
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card Crear Evaluación */}
          <form onSubmit={createEvaluation} className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label htmlFor="new-evaluation-title" className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Nueva Evaluación para Semana {week}
              </label>
              <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Semana {week} de 16
              </span>
            </div>

            <div className="space-y-2">
              <input
                id="new-evaluation-title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: Práctica Calificada 1 / Evaluación de Taller"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all placeholder:text-slate-400"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Selector de Hito Curricular de Fórmula */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">
                    Hito Oficial:
                  </label>
                  <select
                    value={selectedComponent}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedComponent(val);
                      if (val && !title) {
                        const v = formula.variables.find(item => item.id === val);
                        if (v) setTitle(v.label);
                      }
                    }}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#800521] cursor-pointer"
                  >
                    <option value="">Sin hito oficial</option>
                    {formula.variables.map((v) => {
                      const alreadyAssigned = v.id !== "NPA" && assignedComponentsMap[v.id];
                      return (
                        <option 
                          key={v.id} 
                          value={v.id}
                          disabled={!!alreadyAssigned}
                          style={{ color: alreadyAssigned ? "#dc2626" : undefined }}
                          className={alreadyAssigned ? "text-red-600 font-bold bg-red-50" : ""}
                        >
                          {v.label} ({(v.weight * 100).toFixed(0)}%)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Selector de Modalidad Presencial / Virtual */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">
                    Modalidad:
                  </label>
                  <select
                    value={selectedModality}
                    onChange={(e) => setSelectedModality(e.target.value as "presencial" | "virtual")}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#800521] cursor-pointer"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="w-full bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              Programar Evaluación
            </button>
          </form>

          {/* Card Selector de Evaluación */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Evaluaciones Activas en Semana {week}
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

            {selected && (
              <div className="space-y-2">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Modalidad:</span>
                    <span className="font-extrabold text-slate-800 uppercase px-2 py-0.5 bg-white border rounded text-[10px]">
                      {selected.modality === "virtual" ? "Virtual (Digital)" : "Presencial (Taller/Aula)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase text-[9.5px]">Hito Curricular:</span>
                    <span className="font-mono font-black text-[#800521] px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-[10px]">
                      {selected.curricularComponent || "Evaluación Continua"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteModalOpen(true)}
                    className="text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="Eliminar esta evaluación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Evaluación</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Calificaciones de Alumnos */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden space-y-4 p-5">
            <div className="border-b border-slate-150 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                onClick={handleStartSave}
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

      {/* Modal PIN de Seguridad Docente */}
      <SecurePinModal
        isOpen={pinModalOpen}
        activeStudentName={selected?.title || "Evaluación Oficial"}
        activeVariableId={selected?.curricularComponent || "FIRMA-DOCENTE"}
        enteredPin={enteredPin}
        errorMessage={pinErrorMessage}
        keypadNumbers={keypadNumbers}
        onPressDigit={handleKeypadPress}
        onClearPin={handleKeypadClear}
        onClose={() => setPinModalOpen(false)}
      />

      {/* Modal de Confirmación para Eliminar Evaluación */}
      <ConfirmModal
        isOpen={confirmDeleteModalOpen}
        variant="danger"
        title="Eliminar Evaluación"
        message={
          <div className="space-y-2">
            <p className="text-slate-700 font-medium text-xs leading-relaxed">
              ¿Está seguro de que desea eliminar la evaluación <strong className="text-slate-900">{selected?.title}</strong>?
            </p>
            <p className="text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-200/80 p-2.5 rounded-xl">
              Esta acción removerá esta evaluación de la Semana {week} de forma definitiva. Si existían calificaciones registradas, quedarán desvinculadas.
            </p>
          </div>
        }
        confirmText="Eliminar Evaluación"
        cancelText="Cancelar"
        isLoading={saving}
        onConfirm={executeDeleteEvaluation}
        onClose={() => setConfirmDeleteModalOpen(false)}
      />
    </div>
  );
}
