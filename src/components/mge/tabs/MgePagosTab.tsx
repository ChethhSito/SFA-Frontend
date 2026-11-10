import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, X, FileSearch, ExternalLink, Loader2, Info } from "lucide-react";
import { Enrollment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";
import ConfirmModal from "../../ui/ConfirmModal";

interface Props {
  processedStudents: ProcessedStudent[];
  enrollments: Enrollment[];
  saving: boolean;
  onUpdatePaymentStatus: (dni: string, status: "Validado" | "Observado", reason?: string) => Promise<boolean | undefined>;
  onRegisterOperation: (dni: string, operation: string) => Promise<boolean | undefined>;
  onOpenStudent: (dni: string) => void;
}

const paymentLabel = (enrollment?: Enrollment) => !enrollment ? "Sin registro" : enrollment.paymentStatus === "Pagado" ? "Pagado · Por validar" : enrollment.paymentStatus === "No Pagado" ? "No pagado" : enrollment.paymentStatus;
const paymentStyle = (enrollment?: Enrollment) => enrollment?.paymentStatus === "Validado" ? "bg-emerald-50 text-emerald-700" : enrollment?.paymentStatus === "Observado" ? "bg-red-50 text-red-700" : enrollment?.paymentStatus === "Pendiente" || enrollment?.paymentStatus === "Pagado" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600";

function PaymentReview({ student, enrollment, saving, onUpdatePaymentStatus, onRegisterOperation, onClose }: Pick<Props, 'saving' | 'onUpdatePaymentStatus' | 'onRegisterOperation'> & { student: ProcessedStudent; enrollment: Enrollment; onClose: () => void }) {
  const [mode, setMode] = useState<"review" | "operation" | "validate" | "observe">("review");
  const [operation, setOperation] = useState(enrollment.paymentOperation || "");
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const dirty = operation !== (enrollment.paymentOperation || "") || !!reason.trim();
  const close = () => { if (!saving) { if (dirty) setDiscard(true); else onClose(); } };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>('button')?.focus();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    if (discard) document.getElementById('confirm-modal-title')?.closest('[role="dialog"]')?.querySelector<HTMLElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !discard) { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const scope = discard ? document.getElementById('confirm-modal-title')?.closest('[role="dialog"]') : dialog.current;
        const controls = Array.from(scope?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href]') || []) as HTMLElement[];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [dirty, saving, discard]);
  const voucher = enrollment.paymentVoucherUrl;
  const safeVoucher = voucher && /^(https?:\/\/|blob:|data:(application\/pdf|image\/(png|jpeg|webp));base64,)/i.test(voucher) ? voucher : null;
  const recordedOperation = enrollment.paymentOperation?.trim();
  const switchMode = (value: typeof mode) => { setMode(value); setError(""); setChecked(false); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || mode === "review") return;
    setError("");
    if (mode === "operation" && (!operation.trim() || operation.trim().length > 100)) { setError("Ingrese una operación de entre 1 y 100 caracteres."); return; }
    if (mode === "observe" && !reason.trim()) { setError("Explique qué debe corregirse antes de confirmar."); return; }
    if (mode === "validate" && !checked) { setError("Confirme que contrastó la operación con el registro bancario."); return; }
    try {
      const saved = mode === "operation" ? await onRegisterOperation(student.dni, operation.trim()) : await onUpdatePaymentStatus(student.dni, mode === "observe" ? "Observado" : "Validado", mode === "observe" ? reason.trim() : undefined);
      if (saved) onClose(); else setError("No se pudo guardar la revisión. Sus datos siguen aquí para reintentar.");
    } catch { setError("No se pudo guardar. Intente nuevamente."); }
  };
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="payment-review-title" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5"><div><h2 id="payment-review-title" className="text-lg font-bold text-slate-900">Revisión del pago de matrícula</h2><p className="mt-1 text-sm text-slate-500">{student.lastName}, {student.name} · DNI {student.dni}</p></div><button type="button" disabled={saving} aria-label="Cerrar revisión" onClick={close} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></header>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-5 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">Derecho de matrícula</p><span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStyle(enrollment)}`}>{paymentLabel(enrollment)}</span></div>
          <dl className="grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Número de operación</dt><dd className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">{recordedOperation || "Sin operación registrada"}</dd></div><div><dt className="text-xs text-slate-500">Comprobante</dt><dd className="mt-1 text-sm">{safeVoucher ? <a href={safeVoucher} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#9F062A]"><ExternalLink className="h-4 w-4" />Abrir comprobante</a> : "Sin comprobante adjunto"}{enrollment.paymentVoucherFileName ? <p className="mt-1 break-all text-xs text-slate-500">{enrollment.paymentVoucherFileName}</p> : null}</dd></div></dl>
          {enrollment.paymentObservations ? <div className="rounded-lg border-l-2 border-amber-400 bg-amber-50 p-4"><p className="text-xs font-semibold text-amber-900">Última observación registrada</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-amber-800">{enrollment.paymentObservations}</p></div> : null}
          {mode === "review" ? <><p className="text-sm leading-relaxed text-slate-500">Contraste el número de operación y el comprobante con el registro bancario antes de validar. Esta pantalla no muestra el importe del pago.</p><div className="flex flex-wrap gap-3">{enrollment.paymentStatus !== "Validado" ? <button type="button" onClick={() => switchMode("operation")} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">{recordedOperation ? "Corregir operación" : "Registrar operación"}</button> : null}{recordedOperation && enrollment.paymentStatus !== "Validado" ? <button type="button" onClick={() => switchMode("validate")} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Validar pago</button> : null}{recordedOperation && enrollment.paymentStatus !== "Observado" ? <button type="button" onClick={() => switchMode("observe")} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">Observar pago</button> : null}</div>{!recordedOperation ? <p className="text-xs text-amber-800">Registre primero la operación para habilitar su revisión.</p> : null}{enrollment.paymentStatus === "Observado" ? <p className="text-xs text-slate-500">Puede corregir la operación o validarla después de resolver la observación.</p> : null}</> : <fieldset disabled={saving} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">{mode === "operation" ? recordedOperation ? "Corregir número de operación" : "Registrar número de operación" : mode === "observe" ? "Observar el pago" : "Confirmar validación"}</h3>
            {mode === "operation" ? <><label className="block text-sm font-medium" htmlFor="payment-operation">Número de operación <span className="text-[#9F062A]">*</span><input id="payment-operation" required maxLength={100} value={operation} onChange={(event) => setOperation(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 p-3 font-mono text-sm" /></label><p className="text-xs text-slate-500">Al guardar, el pago quedará pendiente de validación.</p></> : mode === "observe" ? <><label className="block text-sm font-medium" htmlFor="payment-reason">Motivo de la observación <span className="text-[#9F062A]">*</span><textarea id="payment-reason" required maxLength={1000} rows={4} placeholder="Indique qué dato no coincide o qué documento debe corregirse." value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 p-3 text-sm" /></label><p className="text-xs text-amber-800">El pago quedará observado y no habilitará nuevas confirmaciones de matrícula. La matrícula actual se conserva.</p></> : <><p className="text-sm leading-relaxed text-slate-600">El pago quedará validado y cumplirá el requisito de pago para matricular al estudiante. Esta acción no lo matricula automáticamente.</p><label className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" />Contrasté la operación con el registro bancario y los datos coinciden.</label></>}
          </fieldset>}
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4"><button type="button" disabled={saving} onClick={close} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cerrar</button>{mode !== "review" ? <div className="flex gap-3"><button type="button" disabled={saving} onClick={() => { if (dirty) close(); else switchMode("review"); }} className="px-3 py-2 text-sm text-slate-500">Volver</button><button type="submit" disabled={saving || (mode === "validate" && !checked) || (mode === "observe" && !reason.trim()) || (mode === "operation" && (!operation.trim() || operation.trim() === recordedOperation))} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 ${mode === "observe" ? "bg-red-700" : mode === "validate" ? "bg-emerald-700" : "bg-[#9F062A]"}`}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? "Guardando…" : mode === "observe" ? "Confirmar observación" : mode === "validate" ? "Confirmar validación" : "Guardar operación"}</button></div> : null}</footer>
      </form>
    </section>
    <ConfirmModal isOpen={discard} title="¿Descartar la revisión?" message="Hay datos modificados que todavía no se guardaron." confirmText="Descartar cambios" cancelText="Seguir revisando" variant="warning" onConfirm={onClose} onClose={() => setDiscard(false)} />
  </div>;
}

export default function MgePagosTab({ processedStudents, enrollments, saving, onUpdatePaymentStatus, onRegisterOperation, onOpenStudent }: Props) {
  const { programs } = useAcademicCatalog();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [program, setProgram] = useState("");
  const [shift, setShift] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ascending, setAscending] = useState(true);
  const [reviewDni, setReviewDni] = useState("");
  const byDni = new Map(enrollments.map((item) => [item.studentDni, item]));
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = processedStudents.filter((student) => {
    const enrollment = byDni.get(student.dni);
    return words.every((word) => normalizeStudentSearch(`${student.lastName} ${student.name} ${student.dni} ${enrollment?.paymentOperation || ""}`).includes(word)) && (!program || student.programId === program) && (!shift || student.shift === shift) && (!status || (status === "missing" ? !enrollment : status === "operation" ? !!enrollment && !enrollment.paymentOperation?.trim() : enrollment?.paymentStatus === status));
  }).sort((a, b) => (ascending ? 1 : -1) * `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es", { sensitivity: "base" }) || a.dni.localeCompare(b.dni));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize)), currentPage = Math.min(page, pages), start = (currentPage - 1) * pageSize;
  const selected = processedStudents.find((student) => student.dni === reviewDni), selectedEnrollment = byDni.get(reviewDni);
  const clear = () => { setQuery(""); setStatus(""); setProgram(""); setShift(""); setPage(1); };
  const selectClass = "mt-1.5 block h-11 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal text-slate-700";
  return <div className="space-y-5">
    <header><h2 className="text-lg font-bold text-slate-900">Revisión de pagos de matrícula</h2><p className="mt-1 text-sm text-slate-500">Busque la operación, revise su sustento y registre el resultado de la revisión.</p></header>
    <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500"><span><strong className="font-semibold text-slate-800">{enrollments.filter((item) => item.paymentStatus === "Validado").length}</strong> validados</span><span><strong className="font-semibold text-slate-800">{enrollments.filter((item) => ["Pendiente", "Pagado"].includes(item.paymentStatus)).length}</strong> por revisar</span><span><strong className="font-semibold text-slate-800">{enrollments.filter((item) => item.paymentStatus === "Observado").length}</strong> observados</span></p>
    <section aria-label="Filtros de pagos" className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(230px,1.6fr)_repeat(3,minmax(0,1fr))_auto]">
        <label htmlFor="payment-search" className="block min-w-0 text-xs font-semibold text-slate-500 sm:col-span-2 xl:col-span-1">Buscador<div className="relative mt-1.5"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input id="payment-search" aria-label="Buscar pago" placeholder="Estudiante, DNI u operación" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-800 focus:outline-[#9F062A]" /></div></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500" htmlFor="payment-filter-program">Carrera<select id="payment-filter-program" value={program} onChange={(event) => { setProgram(event.target.value); setPage(1); }} className={selectClass}><option value="">Todas las carreras</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500" htmlFor="payment-filter-shift">Turno<select id="payment-filter-shift" value={shift} onChange={(event) => { setShift(event.target.value); setPage(1); }} className={selectClass}><option value="">Todos los turnos</option>{["Mañana", "Tarde", "Noche"].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500" htmlFor="payment-filter-status">Situación<select id="payment-filter-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={selectClass}><option value="">Todos los estados</option><option value="Validado">Validado</option><option value="Pendiente">Pendiente</option><option value="Pagado">Pagado, por validar</option><option value="Observado">Observado</option><option value="No Pagado">No pagado</option><option value="operation">Sin operación</option><option value="missing">Sin registro de matrícula</option></select></label>

        {query || program || shift || status ? <button type="button" onClick={clear} className="h-11 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Limpiar</button> : null}
      </div>
    </section>
    <section aria-label="Pagos registrados" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[930px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th scope="col" className="px-5 py-4" aria-sort={ascending ? "ascending" : "descending"}><button type="button" onClick={() => { setAscending(!ascending); setPage(1); }} className="flex items-center gap-2">Estudiante<ArrowUpDown className="h-3.5 w-3.5" /></button></th><th scope="col" className="px-4 py-4">Carrera</th><th scope="col" className="px-4 py-4">Número de operación</th><th scope="col" className="px-4 py-4">Estado del pago</th><th scope="col" className="px-5 py-4 text-right">Revisión</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.slice(start, start + pageSize).map((student) => { const enrollment = byDni.get(student.dni); return <tr key={student.dni} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{student.lastName}, {student.name}</p><p className="mt-1 text-xs text-slate-500">DNI {student.dni}{student.active === false ? " · De baja" : ""}</p></td><td className="px-4 py-4 text-slate-700">{programs.find((item) => item.id === student.programId)?.name || student.programId || "Sin carrera asignada"}</td><td className="px-4 py-4"><p className="max-w-64 break-all font-mono text-sm text-slate-700">{enrollment?.paymentOperation?.trim() || "Sin operación registrada"}</p>{enrollment ? <p className="mt-1 text-xs text-slate-500">{enrollment.paymentVoucherUrl ? "Comprobante adjunto" : "Sin comprobante adjunto"}</p> : null}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStyle(enrollment)}`}>{paymentLabel(enrollment)}</span>{enrollment?.paymentObservations ? <p className="mt-1 max-w-52 truncate text-xs text-slate-500" title={enrollment.paymentObservations}>{enrollment.paymentObservations}</p> : null}</td><td className="px-5 py-4 text-right"><button type="button" disabled={saving} aria-label={`${enrollment ? "Revisar pago" : "Abrir ficha"} de ${student.name} ${student.lastName}`} onClick={() => { if (enrollment) setReviewDni(student.dni); else onOpenStudent(student.dni); }} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FileSearch className="h-4 w-4" />{enrollment ? "Revisar pago" : "Abrir ficha"}</button></td></tr>; })}</tbody></table>{!rows.length ? <div className="p-10 text-center"><p className="font-semibold text-slate-700">No hay pagos con estos criterios</p><p className="mt-2 text-sm text-slate-500">Cambie la búsqueda o limpie los filtros.</p></div> : null}</div><footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><p role="status">Mostrando {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} de {rows.length} estudiantes</p><div className="flex items-center gap-4"><label htmlFor="payment-page-size" className="flex items-center gap-2">Por página<select id="payment-page-size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 p-2">{[10, 20, 50].map((value) => <option key={value}>{value}</option>)}</select></label><nav aria-label="Paginación de pagos" className="flex items-center gap-3"><button type="button" disabled={currentPage === 1} aria-label="Página anterior" onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span>{currentPage} de {pages}</span><button type="button" disabled={currentPage === pages} aria-label="Página siguiente" onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></nav></div></footer></section>
    <details className="text-xs text-slate-500"><summary className="flex cursor-pointer items-center gap-2 font-semibold"><Info className="h-4 w-4" />Alcance de la revisión</summary><p className="mt-2 leading-relaxed">Se registra la operación y su estado de validación para el derecho de matrícula. El importe no está disponible en este registro. Validar el pago habilita el requisito de pago; la matrícula se confirma en Matrícula General.</p></details>
    {selected && selectedEnrollment ? <div key={selected.dni}><PaymentReview student={selected} enrollment={selectedEnrollment} saving={saving} onUpdatePaymentStatus={onUpdatePaymentStatus} onRegisterOperation={onRegisterOperation} onClose={() => setReviewDni("")} /></div> : null}
  </div>;
}
