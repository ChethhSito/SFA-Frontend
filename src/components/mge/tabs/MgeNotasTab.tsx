import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Save, RotateCcw, Info, X } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Course, CourseAssignment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";
import { parseGradeInput } from "../../../utils/gradeInput";
import ConfirmModal from "../../ui/ConfirmModal";

interface Props {
  courses: Course[];
  assignments: CourseAssignment[];
  processedStudents: ProcessedStudent[];
  selectedCourseId: string;
  selectedTaskTitle: string;
  temporaryGrades: Record<string, string>;
  saving: boolean;
  onCourseChange: (id: string) => void;
  onTaskChange: (title: string) => void;
  onGradeChange: (dni: string, value: string) => void;
  onDiscardGrades: () => void;
  onSaveGrades: () => Promise<boolean | undefined>;
}

const standardTasks = ["Evaluación Final", "Práctica de Laboratorio 1", "Avance Proyecto Integrador", "Constancia Portafolio"];
export default function MgeNotasTab({ courses, assignments, processedStudents, selectedCourseId, selectedTaskTitle, temporaryGrades, saving, onCourseChange, onTaskChange, onGradeChange, onDiscardGrades, onSaveGrades }: Props) {
  const { programs } = useAcademicCatalog();
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ascending, setAscending] = useState(true);
  const [pendingAction, setPendingAction] = useState<{ type: "course" | "task" | "discard"; value: string } | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saveError, setSaveError] = useState("");
  const course = courses.find((item) => item.id === selectedCourseId);
  const assignment = assignments.find((item) => item.courseId === selectedCourseId && item.title.toLowerCase() === selectedTaskTitle.toLowerCase());
  const stored = new Map(assignment?.submissions.filter((submission) => submission.grade !== undefined).map((submission) => [submission.studentDni, submission.grade!]) || []);
  const students = course ? processedStudents.filter((student) => student.active !== false && student.enrolled && student.academicStatus === "MATRICULADO" && student.programId === (course.careerId || course.career)) : [];
  const changed = students.filter((student) => temporaryGrades[student.dni] !== undefined);
  const invalid = changed.filter((student) => parseGradeInput(temporaryGrades[student.dni]) === null);
  const dirty = Object.keys(temporaryGrades).length > 0;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const changeContext = (type: "course" | "task" | "discard", value = "") => {
    if (saving) return;
    if (dirty) { setPendingAction({ type, value }); return; }
    if (type === "course") onCourseChange(value);
    if (type === "task") onTaskChange(value);
    setPage(1);
  };
  const effectiveGrade = (student: ProcessedStudent) => temporaryGrades[student.dni] !== undefined ? parseGradeInput(temporaryGrades[student.dni]) : stored.get(student.dni);
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = students.filter((student) => {
    const score = effectiveGrade(student);
    return words.every((word) => normalizeStudentSearch(`${student.lastName} ${student.name} ${student.dni}`).includes(word)) && (!situation || (situation === "pending" ? temporaryGrades[student.dni] !== undefined : situation === "missing" ? !stored.has(student.dni) : situation === "approved" ? score != null && score >= 13 : score != null && score < 13));
  }).sort((a, b) => (ascending ? 1 : -1) * `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es", { sensitivity: "base" }) || a.dni.localeCompare(b.dni));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize)), currentPage = Math.min(page, pages), start = (currentPage - 1) * pageSize;
  const customTasks = assignments.filter((item) => item.courseId === selectedCourseId).map((item) => item.title);
  const tasks = Array.from(new Map([...standardTasks, ...customTasks, selectedTaskTitle].filter(Boolean).map((title) => [title.toLowerCase(), title])).values());
  const selectClass = "mt-1.5 block h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:outline-[#9F062A]";
  const clear = () => { setQuery(""); setSituation(""); setPage(1); };
  return <div className="space-y-5">
    <header><h2 className="text-lg font-bold text-slate-900">Registro de calificaciones</h2><p className="mt-1 text-sm text-slate-500">Seleccione el curso y la evaluación. Ingrese las notas y revise los cambios antes de guardarlos.</p></header>
    <section aria-label="Filtros de notas" className="rounded-xl border border-slate-200 bg-white p-4"><div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(210px,1.2fr)_minmax(0,1.7fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto]">
      <label htmlFor="grade-search" className="block min-w-0 text-xs font-semibold text-slate-500">Buscador<div className="relative mt-1.5"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input id="grade-search" aria-label="Buscar estudiante para calificar" placeholder="Nombre o DNI" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm font-normal text-slate-800 focus:outline-[#9F062A]" /></div></label>
      <label htmlFor="grade-course" className="block min-w-0 text-xs font-semibold text-slate-500">Curso<select id="grade-course" value={selectedCourseId} disabled={saving || !courses.length} onChange={(event) => changeContext("course", event.target.value)} className={selectClass}>{!courses.length ? <option value="">Sin cursos disponibles</option> : null}{courses.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code}) · {programs.find((program) => program.id === (item.careerId || item.career))?.name || item.careerId || item.career || "Sin carrera"}</option>)}</select></label>
      <label htmlFor="grade-task" className="block min-w-0 text-xs font-semibold text-slate-500">Evaluación<select id="grade-task" value={selectedTaskTitle} disabled={saving || !course} onChange={(event) => changeContext("task", event.target.value)} className={selectClass}>{tasks.map((title) => <option key={title.toLowerCase()} value={title}>{title}</option>)}</select></label>
      <label htmlFor="grade-situation" className="block min-w-0 text-xs font-semibold text-slate-500">Situación<select id="grade-situation" value={situation} onChange={(event) => { setSituation(event.target.value); setPage(1); }} className={selectClass}><option value="">Todos los estudiantes</option><option value="missing">Sin nota guardada</option><option value="pending">Con cambios pendientes</option><option value="approved">Aprobados</option><option value="failed">Desaprobados</option></select></label>
      {query || situation ? <button type="button" onClick={clear} className="h-11 rounded-lg px-3 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Limpiar</button> : null}
    </div></section>
    {course ? <section aria-label="Registro de notas" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><div><h3 className="font-bold text-slate-900">{course.name} <span className="font-normal text-slate-500">· {course.code}</span></h3><p className="mt-1 text-xs text-slate-500">{selectedTaskTitle} · Escala de 0 a 20</p></div><div className="flex flex-wrap items-center gap-4"><span role="status" className={`text-xs ${changed.length ? "font-semibold text-amber-800" : "text-slate-500"}`}>{changed.length ? `${changed.length} ${changed.length === 1 ? "cambio pendiente" : "cambios pendientes"}` : "Sin cambios pendientes"}</span>{dirty ? <button type="button" disabled={saving} onClick={() => changeContext("discard")} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><RotateCcw className="h-3.5 w-3.5" />Descartar</button> : null}<button type="button" disabled={saving || !changed.length || !!invalid.length} onClick={() => { setSaveError(""); setConfirmSave(true); }} className="flex items-center gap-2 rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"><Save className="h-4 w-4" />{saving ? "Guardando…" : "Revisar y guardar"}</button></div></div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-100 px-5 py-3 text-xs text-slate-500"><span>{students.length} estudiantes</span><span>{students.filter((student) => stored.has(student.dni)).length} con nota guardada</span><span>{students.filter((student) => !stored.has(student.dni)).length} sin calificar</span>{invalid.length ? <span role="alert" className="font-semibold text-red-700">{invalid.length} {invalid.length === 1 ? "nota por corregir" : "notas por corregir"} · Ingrese valores de 0 a 20</span> : null}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th scope="col" aria-sort={ascending ? "ascending" : "descending"} className="px-5 py-4"><button type="button" onClick={() => { setAscending(!ascending); setPage(1); }} className="flex items-center gap-2">Estudiante<ArrowUpDown className="h-3.5 w-3.5" /></button></th><th scope="col" className="px-4 py-4">Nota guardada</th><th scope="col" className="px-4 py-4">Ingresar nota</th><th scope="col" className="px-5 py-4">Resultado</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.slice(start, start + pageSize).map((student) => {
        const draft = temporaryGrades[student.dni];
        const score = effectiveGrade(student);
        const hasDraft = draft !== undefined;
        const bad = hasDraft && score === null;
        return <tr key={student.dni} className={hasDraft ? "bg-amber-50/40" : "hover:bg-slate-50/60"}>
          <td className="px-5 py-4"><p className="font-semibold text-slate-900">{student.lastName}, {student.name}</p><p className="mt-1 text-xs text-slate-500">DNI {student.dni}</p></td>
          <td className="px-4 py-4">{stored.has(student.dni) ? <span className="font-mono font-semibold text-slate-700">{stored.get(student.dni)} <span className="font-normal text-slate-400">/ 20</span></span> : <span className="text-xs text-slate-400">Sin nota</span>}</td>
          <td className="px-4 py-4"><div className="flex items-center gap-2"><input type="text" inputMode="decimal" maxLength={12} aria-label={`Nota de ${student.name} ${student.lastName}`} aria-invalid={bad} aria-describedby={bad ? `grade-error-${student.dni}` : undefined} placeholder="0–20" value={draft ?? ""} onChange={(event) => onGradeChange(student.dni, event.target.value)} disabled={saving} className={`h-10 w-24 rounded-lg border bg-white px-3 text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 ${bad ? "border-red-400" : hasDraft ? "border-amber-300" : "border-slate-300"}`} />{hasDraft ? <button type="button" disabled={saving} aria-label={`Descartar nota de ${student.name} ${student.lastName}`} onClick={() => onGradeChange(student.dni, "")} className="rounded p-1 text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button> : null}</div>{bad ? <p id={`grade-error-${student.dni}`} className="mt-1 text-xs text-red-700">Ingrese un número entre 0 y 20.</p> : hasDraft ? <p className="mt-1 text-xs text-amber-800">Sin guardar</p> : null}</td>
          <td className="px-5 py-4">{score == null ? <span className="text-xs text-slate-400">{bad ? "Revise la nota" : "Sin calificar"}</span> : <><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${score >= 13 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{score >= 13 ? "Aprobado" : "Desaprobado"}</span>{hasDraft ? <p className="mt-1 text-xs text-slate-500">Vista previa · {score}/20</p> : null}</>}</td>
        </tr>;
      })}</tbody></table>{!rows.length ? <div className="p-10 text-center"><p className="font-semibold text-slate-700">{students.length ? "No hay estudiantes con estos filtros" : "No hay estudiantes disponibles para calificar"}</p><p className="mt-2 text-sm text-slate-500">{students.length ? "Cambie la búsqueda o la situación seleccionada." : "Se muestran estudiantes activos y matriculados en la carrera del curso."}</p></div> : null}</div>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><p role="status">Mostrando {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} de {rows.length} estudiantes</p><div className="flex items-center gap-4"><label htmlFor="grades-page-size" className="flex items-center gap-2">Por página<select id="grades-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 p-2">{[10, 20, 50].map((value) => <option key={value}>{value}</option>)}</select></label><nav aria-label="Paginación de notas" className="flex items-center gap-3"><button type="button" disabled={currentPage === 1} aria-label="Página anterior" onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span>{currentPage} de {pages}</span><button type="button" disabled={currentPage === pages} aria-label="Página siguiente" onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></nav></div></footer>
    </section> : <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No hay cursos disponibles para registrar notas.</p>}
    <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />Las casillas vacías conservan la nota guardada. El guardado incluye los cambios de todas las páginas. Se muestran estudiantes matriculados en la carrera del curso.</p>
    <ConfirmModal isOpen={!!pendingAction} title="¿Descartar las notas pendientes?" message="Los cambios todavía no se guardaron. Puede seguir editando o descartarlos para continuar." confirmText="Descartar cambios" cancelText="Seguir editando" variant="warning" isLoading={saving} onClose={() => setPendingAction(null)} onConfirm={() => { onDiscardGrades(); if (pendingAction?.type === "course") onCourseChange(pendingAction.value); if (pendingAction?.type === "task") onTaskChange(pendingAction.value); setPendingAction(null); setPage(1); }} />
    <ConfirmModal isOpen={confirmSave} title="Revisar calificaciones" message={<div className="space-y-3"><p>{course?.name} · {selectedTaskTitle}</p><p>{changed.length === 1 ? "Se guardará 1 calificación" : `Se guardarán ${changed.length} calificaciones`}, incluyendo los cambios de otras páginas o filtros.</p><ul className="max-h-52 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">{changed.map((student) => <li key={student.dni} className="flex justify-between gap-3"><span>{student.lastName}, {student.name} · {student.dni}</span><strong className="whitespace-nowrap">{stored.get(student.dni) ?? "Sin nota"} → {parseGradeInput(temporaryGrades[student.dni])}</strong></li>)}</ul>{saveError ? <p role="alert" className="text-red-700">{saveError}</p> : null}</div>} confirmText={saving ? "Guardando…" : "Confirmar guardado"} isLoading={saving} onClose={() => { if (!saving) setConfirmSave(false); }} onConfirm={async () => { if (invalid.length) return; try { if (await onSaveGrades()) setConfirmSave(false); else setSaveError("No se completó el guardado. Las notas pendientes se conservaron para reintentar."); } catch { setSaveError("No se pudo guardar. Las notas pendientes se conservaron."); } }} />
  </div>;
}
