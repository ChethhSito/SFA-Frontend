import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronLeft, ChevronRight, FilePenLine, X, Info, Loader2, ArrowUpDown } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import ConfirmModal from "../../ui/ConfirmModal";
import { ProgramId } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";
import { enrollmentBlockers } from "../../../utils/enrollmentEligibility";

type Shift = "Mañana" | "Tarde" | "Noche";
interface Props {
  processedStudents: ProcessedStudent[];
  saving: boolean;
  onToggleAcademicStatus: (dni: string) => Promise<boolean | undefined>;
  onSaveAssignment: (dni: string, programId: ProgramId, shift: Shift) => Promise<boolean | undefined>;
  onOpenStudent: (dni: string) => void;
  onOpenPayments: () => void;
}

function AssignmentDialog({ student, saving, onSave, onClose }: { student: ProcessedStudent; saving: boolean; onSave: Props['onSaveAssignment']; onClose: () => void }) {
  const { programs } = useAcademicCatalog();
  const [program, setProgram] = useState(student.programId);
  const [shift, setShift] = useState(student.shift);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const dirty = program !== student.programId || shift !== student.shift;
  const close = () => { if (!saving) { if (dirty) setDiscard(true); else onClose(); } };
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; root.current?.querySelector<HTMLElement>('button')?.focus(); return () => previous?.focus(); }, []);
  useEffect(() => {
    if (discard) document.getElementById('confirm-modal-title')?.closest('[role="dialog"]')?.querySelector<HTMLElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !discard) { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const scope = discard ? document.getElementById('confirm-modal-title')?.closest('[role="dialog"]') : root.current;
        const controls = Array.from(scope?.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled)') || []) as HTMLElement[];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [dirty, saving, discard]);
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" onClick={(event) => { if (event.currentTarget === event.target) close(); }}>
    <section ref={root} role="dialog" aria-modal="true" aria-labelledby="assignment-title" className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-6"><div><h2 id="assignment-title" className="text-lg font-bold">Editar asignación</h2><p className="mt-1 text-sm text-slate-500">{student.lastName}, {student.name} · DNI {student.dni}</p></div><button type="button" aria-label="Cerrar asignación" disabled={saving} onClick={close} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></header>
      <form onSubmit={async (event) => { event.preventDefault(); if (saving || !dirty) return; setError(""); try { if (await onSave(student.dni, program as ProgramId, shift as Shift)) onClose(); else setError("No se guardó la asignación. Sus cambios siguen aquí para reintentar."); } catch { setError("No se pudo guardar. Intente nuevamente."); } }}>
        <fieldset disabled={saving} className="space-y-5 p-6"><p className="text-sm leading-relaxed text-slate-500">Los cambios se aplican al registro de matrícula al guardar. El estado de matrícula y la validación del pago se conservan.</p><label className="block text-sm font-semibold" htmlFor="assignment-program">Carrera <span className="text-[#9F062A]">*</span><select id="assignment-program" required value={program} onChange={(event) => setProgram(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm font-normal"><option value="">Seleccione una carrera</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}{student.programId && !programs.some((item) => item.id === student.programId) ? <option value={student.programId}>{student.programId}</option> : null}</select></label><label className="block text-sm font-semibold" htmlFor="assignment-shift">Turno <span className="text-[#9F062A]">*</span><select id="assignment-shift" required value={shift} onChange={(event) => setShift(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3 text-sm font-normal"><option value="">Seleccione un turno</option>{["Mañana", "Tarde", "Noche"].map((value) => <option key={value}>{value}</option>)}</select></label>{dirty ? <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Tiene cambios sin guardar. Revise la carrera y el turno antes de confirmar.</p> : null}{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}</fieldset>
        <footer className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" disabled={saving} onClick={close} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</button><button type="submit" disabled={saving || !dirty || !program || !shift} className="flex items-center gap-2 rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? "Guardando…" : "Guardar asignación"}</button></footer>
      </form>
    </section>
    <ConfirmModal isOpen={discard} title="¿Descartar la asignación?" message="La carrera y el turno que modificó todavía no se han guardado." confirmText="Descartar cambios" cancelText="Seguir editando" variant="warning" onConfirm={onClose} onClose={() => setDiscard(false)} />
  </div>;
}

export default function MgeMatriculaTab({ processedStudents, saving, onToggleAcademicStatus, onSaveAssignment, onOpenStudent, onOpenPayments }: Props) {
  const { programs } = useAcademicCatalog();
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("");
  const [shift, setShift] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ascending, setAscending] = useState(true);
  const [editingDni, setEditingDni] = useState("");
  const [confirmDni, setConfirmDni] = useState("");
  const [actionError, setActionError] = useState("");
  const enrolled = (student: ProcessedStudent) => (student.enrollmentStatus || student.academicStatus) === "MATRICULADO";
  const ready = (student: ProcessedStudent) => !enrolled(student) && !enrollmentBlockers(student).length;
  const matchStatus = (student: ProcessedStudent) => !status || (status === "enrolled" ? enrolled(student) && student.active !== false : status === "ready" ? ready(student) : status === "inactive" ? student.active === false : student.active !== false && !enrolled(student) && !ready(student));
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = processedStudents.filter((student) => words.every((word) => normalizeStudentSearch(`${student.lastName} ${student.name} ${student.dni} ${student.email}`).includes(word)) && (!program || student.programId === program) && (!shift || student.shift === shift) && matchStatus(student)).sort((a, b) => (ascending ? 1 : -1) * `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es", { sensitivity: "base" }) || a.dni.localeCompare(b.dni));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pages), start = (currentPage - 1) * pageSize;
  const active = processedStudents.filter((student) => student.active !== false);
  const editing = processedStudents.find((student) => student.dni === editingDni);
  const confirming = processedStudents.find((student) => student.dni === confirmDni);
  const cancelling = confirming ? enrolled(confirming) : false;
  const hasFilters = !!(query || program || shift || status);
  const clear = () => { setQuery(""); setProgram(""); setShift(""); setStatus(""); setPage(1); };
  const selectClass = "mt-1.5 block h-11 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal text-slate-700 focus:outline-[#9F062A]";
  return <div className="space-y-5">
    <div><h2 className="text-lg font-bold text-slate-900">Gestión de matrículas</h2><p className="mt-1 text-sm text-slate-500">Revise los pendientes, asigne carrera y turno y confirme la matrícula de cada estudiante.</p></div>
    <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span><strong className="font-semibold text-slate-800">{active.filter(enrolled).length}</strong> matriculados</span><span><strong className="font-semibold text-slate-800">{active.filter(ready).length}</strong> listos para matricular</span><span><strong className="font-semibold text-slate-800">{active.filter((student) => !enrolled(student) && !ready(student)).length}</strong> con pendientes</span><span>{processedStudents.length - active.length} de baja</span></p>
    <section aria-label="Filtros de matrícula" className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(230px,1.6fr)_repeat(3,minmax(0,1fr))_auto]">
        <label htmlFor="enroll-search" className="block min-w-0 text-xs font-semibold text-slate-500 sm:col-span-2 xl:col-span-1">Buscador<div className="relative mt-1.5"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input id="enroll-search" aria-label="Buscar matrícula" placeholder="Nombre, DNI o correo" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-800 focus:outline-[#9F062A]" /></div></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500" htmlFor="enroll-program">Carrera<select id="enroll-program" value={program} onChange={(event) => { setProgram(event.target.value); setPage(1); }} className={selectClass}><option value="">Todas las carreras</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500" htmlFor="enroll-shift">Turno<select id="enroll-shift" value={shift} onChange={(event) => { setShift(event.target.value); setPage(1); }} className={selectClass}><option value="">Todos los turnos</option>{["Mañana", "Tarde", "Noche"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500" htmlFor="enroll-status">Situación<select id="enroll-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={selectClass}><option value="">Todas las situaciones</option><option value="enrolled">Matriculados activos</option><option value="ready">Listos para matricular</option><option value="pending">Con pendientes</option><option value="inactive">Estudiantes de baja</option></select></label>

        {hasFilters ? <button type="button" onClick={clear} className="h-11 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Limpiar</button> : null}
      </div>
    </section>
    <section aria-label="Matrículas registradas" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th scope="col" aria-sort={ascending ? "ascending" : "descending"} className="px-5 py-4"><button type="button" onClick={() => { setAscending(!ascending); setPage(1); }} className="flex items-center gap-2">Estudiante<ArrowUpDown className="h-3.5 w-3.5" /></button></th><th scope="col" className="px-4 py-4">Carrera y turno</th><th scope="col" className="px-4 py-4">Pago registrado</th><th scope="col" className="px-4 py-4">Situación de matrícula</th><th scope="col" className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.slice(start, start + pageSize).map((student) => { const blockers = enrollmentBlockers(student); return <tr key={student.dni} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{student.lastName}, {student.name}</p><p className="mt-1 text-xs text-slate-500">DNI {student.dni}</p></td><td className="px-4 py-4"><p className="font-medium text-slate-700">{programs.find((item) => item.id === student.programId)?.name || student.programId || "Sin carrera asignada"}</p><p className="mt-1 text-xs text-slate-500">{student.shift ? `Turno ${student.shift.toLowerCase()}` : "Sin turno asignado"}</p></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${student.paymentStatus === "Validado" ? "bg-emerald-50 text-emerald-700" : student.paymentStatus === "Observado" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{student.paymentStatus}</span></td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${student.active === false ? "bg-slate-100 text-slate-600" : enrolled(student) ? "bg-emerald-50 text-emerald-700" : ready(student) ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"}`}>{student.active === false ? "Estudiante de baja" : enrolled(student) ? "Matriculado" : ready(student) ? "Listo para matricular" : "Con pendientes"}</span>{!enrolled(student) && student.active !== false && blockers.length ? <p className="mt-2 max-w-64 text-xs leading-relaxed text-slate-500">{blockers[0]}</p> : null}{student.active === false ? <p className="mt-2 text-xs text-slate-500">Reactive desde el padrón.</p> : null}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" disabled={saving || student.active === false} aria-label={`${student.enrolled ? "Editar asignación" : "Abrir ficha"} de ${student.name} ${student.lastName}`} onClick={() => { if (student.enrolled) setEditingDni(student.dni); else onOpenStudent(student.dni); }} className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"><FilePenLine className="h-3.5 w-3.5" />{student.enrolled ? "Editar asignación" : "Abrir ficha"}</button>{enrolled(student) ? <button type="button" disabled={saving || student.active === false} onClick={() => { setConfirmDni(student.dni); setActionError(""); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40">Anular matrícula</button> : ready(student) ? <button type="button" disabled={saving} onClick={() => { setConfirmDni(student.dni); setActionError(""); }} className="rounded-lg bg-[#9F062A] px-3 py-2 text-xs font-semibold text-white">Matricular</button> : student.enrolled && student.active !== false && student.paymentStatus !== "Validado" ? <button type="button" onClick={onOpenPayments} className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Revisar pago</button> : null}</div></td></tr>; })}</tbody></table>{!rows.length ? <div className="p-10 text-center"><p className="font-semibold text-slate-700">No hay estudiantes con estos criterios</p><p className="mt-2 text-sm text-slate-500">Cambie la búsqueda o limpie los filtros.</p></div> : null}</div><footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><p role="status">Mostrando {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} de {rows.length} estudiantes</p><div className="flex items-center gap-4"><label htmlFor="enroll-page-size" className="flex items-center gap-2">Por página<select id="enroll-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 p-2">{[10, 20, 50].map((value) => <option key={value}>{value}</option>)}</select></label><nav aria-label="Paginación de matrículas" className="flex items-center gap-3"><button type="button" disabled={currentPage === 1} aria-label="Página anterior" onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span>{currentPage} de {pages}</span><button type="button" disabled={currentPage === pages} aria-label="Página siguiente" onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></nav></div></footer></section>
    <details className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500"><summary className="flex cursor-pointer items-center gap-2 font-semibold"><Info className="h-4 w-4" />Cómo se gestiona la matrícula</summary><p className="mt-3 leading-relaxed">Para matricular se requiere un estudiante activo, un registro de admisión, carrera y turno asignados y pago validado. Anular devuelve el registro al estado Admitido y conserva su información. Estos registros no están asociados a un periodo, por lo que no acreditan matrícula en el ciclo mostrado en el encabezado.</p></details>
    {editing ? <div key={editing.dni}><AssignmentDialog student={editing} saving={saving} onSave={onSaveAssignment} onClose={() => setEditingDni("")} /></div> : null}
    <ConfirmModal isOpen={!!confirming} title={cancelling ? "¿Anular la matrícula?" : "¿Confirmar la matrícula?"} message={<div className="space-y-3"><p className="font-semibold text-slate-800">{confirming?.lastName}, {confirming?.name} · DNI {confirmDni}</p><p>{cancelling ? "El estudiante volverá al estado Admitido. Se conservarán su ficha, la carrera, el turno y los registros de pago." : "El registro cambiará de Admitido a Matriculado con la carrera y el turno asignados."}</p>{actionError ? <p role="alert" className="text-red-700">{actionError}</p> : null}</div>} confirmText={cancelling ? "Anular matrícula" : "Confirmar matrícula"} variant={cancelling ? "danger" : "primary"} isLoading={saving} onClose={() => { if (!saving) setConfirmDni(""); }} onConfirm={async () => { try { if (await onToggleAcademicStatus(confirmDni)) setConfirmDni(""); else setActionError("No se pudo actualizar la matrícula. Revise el aviso y reintente."); } catch { setActionError("No se pudo actualizar la matrícula. Intente nuevamente."); } }} />
  </div>;
}
