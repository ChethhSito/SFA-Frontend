import React, { useEffect, useRef, useState } from "react";
import { Search, X, UserRound, ChevronDown } from "lucide-react";
import { ProcessedStudent } from "./mgeTypes";
import { normalizeStudentSearch } from "../../utils/studentFormValidation";
import MgeTablePagination from "./MgeTablePagination";
import { useAcademicCatalog } from "../../context/AcademicCatalogContext";

export default function StudentPicker({ students, value, onChange, disabled = false }: { students: ProcessedStudent[]; value: string; onChange: (dni: string) => void; disabled?: boolean }) {
  const { programs } = useAcademicCatalog();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [career, setCareer] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const dialog = useRef<HTMLElement>(null);
  const selected = students.find((student) => student.dni === value);
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = students.filter((student) => (!career || student.programId === career) && words.every((word) => normalizeStudentSearch(`${student.name} ${student.lastName} ${student.dni}`).includes(word)))
    .sort((a, b) => `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es", { sensitivity: "base" }) || a.dni.localeCompare(b.dni));
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>('input')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('input:not(:disabled),select:not(:disabled),button:not(:disabled)') || []) as HTMLElement[];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [open]);
  return <>
    <div className="min-w-0"><span id="history-student-label" className="text-xs font-semibold text-slate-500">Estudiante</span><button type="button" aria-labelledby="history-student-label history-student-value" aria-haspopup="dialog" disabled={disabled} onClick={() => { setQuery(""); setCareer(""); setPage(1); setOpen(true); }} className="mt-1.5 flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 disabled:opacity-40"><UserRound className="h-4 w-4 shrink-0 text-slate-400" /><span id="history-student-value" className="min-w-0 flex-1 truncate">{selected ? `${selected.lastName}, ${selected.name} · ${selected.dni}` : "Buscar estudiante por nombre o DNI"}</span><ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /></button></div>
    {open ? <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="student-picker-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5"><div><h2 id="student-picker-title" className="text-lg font-bold">Buscar estudiante</h2><p className="mt-1 text-sm text-slate-500">Busque por nombre, apellidos o DNI y seleccione su ficha.</p></div><button type="button" aria-label="Cerrar búsqueda de estudiantes" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></header>
      <div className="grid gap-3 border-b border-slate-100 px-6 py-4 sm:grid-cols-[1.6fr_1fr]"><label className="relative"><span className="sr-only">Buscar estudiante por nombre o DNI</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input aria-label="Buscar estudiante por nombre o DNI" placeholder="Ej. Quintana o 14512121" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm focus:outline-[#9F062A]" /></label><select aria-label="Carrera del estudiante" value={career} onChange={(event) => { setCareer(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">Todas las carreras</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6"><ul className="divide-y divide-slate-100">{rows.slice((current - 1) * pageSize, current * pageSize).map((student) => <li key={student.dni}><button type="button" aria-label={`Seleccionar a ${student.name} ${student.lastName}, DNI ${student.dni}`} onClick={() => { onChange(student.dni); setOpen(false); }} className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left hover:bg-rose-50 ${student.dni === value ? "bg-rose-50/60" : ""}`}><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{student.lastName}, {student.name}</p><p className="mt-1 text-xs text-slate-500">DNI {student.dni} · {programs.find((program) => program.id === student.programId)?.name || student.programId || "Sin carrera asignada"}{student.active === false ? " · De baja" : ""}</p></div><span className="shrink-0 text-xs font-semibold text-[#9F062A]">{student.dni === value ? "Seleccionado" : "Ver historial"}</span></button></li>)}</ul>{!rows.length ? <p className="p-8 text-center text-sm text-slate-500">No hay estudiantes con esos criterios.</p> : null}</div>
      <MgeTablePagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="estudiantes" />
    </section></div> : null}
  </>;
}
