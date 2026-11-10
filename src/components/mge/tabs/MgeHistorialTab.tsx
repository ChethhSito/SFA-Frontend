import React, { useMemo, useState } from "react";
import { Search, ArrowUpDown, Download, Info, UserRound } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Course, CourseAssignment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { recordedHistory } from "../../../utils/mgeReports";
import { createHistoryPdf } from "../../../utils/historyPdf";
import { academicToday } from "../../../utils/attendance";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";
import MgeTablePagination from "../MgeTablePagination";
import StudentPicker from "../StudentPicker";

interface Props {
  processedStudents: ProcessedStudent[];
  courses: Course[];
  assignments: CourseAssignment[];
  selectedHistoryDni: string;
  onSelectDni: (dni: string) => void;
}

export default function MgeHistorialTab({ processedStudents, courses, assignments, selectedHistoryDni, onSelectDni }: Props) {
  const { programs } = useAcademicCatalog();
  const [printError, setPrintError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"code" | "courseName">("code");
  const [ascending, setAscending] = useState(true);
  const student = processedStudents.find((row) => row.dni === selectedHistoryDni);
  const history = useMemo(() => student ? recordedHistory(student, courses, assignments) : [], [student, courses, assignments]);
  const program = programs.find((row) => row.id === student?.programId)?.name || student?.programId || "Sin programa registrado";
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = history.filter((row) => words.every((word) => normalizeStudentSearch(`${row.courseName} ${row.code}`).includes(word)) && (!situation || (situation === "graded" ? row.grade !== null : row.grade === null)))
    .sort((a, b) => (ascending ? 1 : -1) * a[sort].localeCompare(b[sort], "es", { numeric: true, sensitivity: "base" }));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize))), start = (currentPage - 1) * pageSize;
  const order = (field: typeof sort) => { setSort(field); setAscending(sort === field ? !ascending : true); setPage(1); };
  const download = async () => {
    if (!student || downloading) return;
    setPrintError(""); setDownloading(true);
    try { const pdf = await createHistoryPdf(student, program, history, academicToday()); pdf.save(`Historial_${student.dni}_${academicToday()}.pdf`); }
    catch { setPrintError("No se pudo generar el PDF del historial. Intente nuevamente."); }
    finally { setDownloading(false); }
  };
  const control = "mt-1.5 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:outline-[#9F062A]";
  const clear = () => { setQuery(""); setSituation(""); setPage(1); };
  return <div className="space-y-5">
    <header><h2 className="text-lg font-bold text-slate-900">Consulta del historial académico</h2><p className="mt-1 text-sm text-slate-500">Seleccione un estudiante para consultar sus cursos, calificaciones y promedios registrados.</p></header>
    <section aria-label="Filtros del historial" className="rounded-xl border border-slate-200 bg-white p-4"><div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(210px,1.2fr)_minmax(0,1.8fr)_minmax(0,1fr)_auto]">
      <label htmlFor="history-search" className="text-xs font-semibold text-slate-500">Buscador<div className="relative mt-1.5"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input id="history-search" aria-label="Buscar curso en el historial" placeholder="Nombre o código del curso" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm font-normal focus:outline-[#9F062A]" /></div></label>
      <StudentPicker students={processedStudents} value={selectedHistoryDni} disabled={downloading} onChange={(dni) => { onSelectDni(dni); setPrintError(""); clear(); }} />
      <label htmlFor="history-status" className="text-xs font-semibold text-slate-500">Situación<select id="history-status" value={situation} onChange={(event) => { setSituation(event.target.value); setPage(1); }} className={control}><option value="">Todos los cursos</option><option value="graded">Con calificaciones</option><option value="ungraded">Sin calificaciones</option></select></label>
      {query || situation ? <button type="button" onClick={clear} className="h-11 rounded-lg px-3 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Limpiar</button> : null}
    </div></section>
    {student ? <>
      <section aria-label="Datos del estudiante" className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="rounded-xl bg-rose-50 p-3 text-[#9F062A]"><UserRound className="h-5 w-5" /></span><div><h3 className="font-bold text-slate-900">{student.lastName}, {student.name}</h3><p className="mt-1 text-xs text-slate-500">DNI {student.dni} · {student.active === false ? "Estudiante de baja" : "Estudiante activo"}</p></div></div><button type="button" disabled={downloading || !history.length} onClick={() => { void download(); }} className="flex items-center gap-2 rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4" />{downloading ? "Generando PDF…" : "Descargar historial completo"}</button></div><dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3 border-t border-slate-100 pt-4 text-sm"><div><dt className="text-xs text-slate-500">Carrera actual</dt><dd className="mt-1 font-medium text-slate-700">{program}</dd></div><div><dt className="text-xs text-slate-500">Matrícula registrada</dt><dd className="mt-1 font-medium text-slate-700">{(student.enrollmentStatus || student.academicStatus) === "MATRICULADO" ? "Matriculado" : (student.enrollmentStatus || student.academicStatus) === "ADMITIDO" ? "Admitido" : "Sin matrícula"}</dd></div><div><dt className="text-xs text-slate-500">Turno</dt><dd className="mt-1 font-medium text-slate-700">{student.shift || "Sin turno registrado"}</dd></div></dl>{printError ? <p role="alert" className="mt-3 text-sm text-red-700">{printError}</p> : null}</section>
      <section aria-label="Cursos del historial" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h3 className="font-bold text-slate-900">Cursos y calificaciones</h3><p className="text-xs text-slate-500">{history.length} cursos · {history.filter((row) => row.grade !== null).length} con notas · {history.filter((row) => row.grade === null).length} sin notas</p></header><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr>{([['code', 'Código'], ['courseName', 'Curso']] as const).map(([field, title]) => <th key={field} scope="col" aria-sort={sort === field ? ascending ? "ascending" : "descending" : "none"} className="px-5 py-4"><button type="button" onClick={() => order(field)} className="flex items-center gap-2">{title}<ArrowUpDown className="h-3.5 w-3.5" /></button></th>)}<th scope="col" className="px-4 py-4">Créditos del catálogo</th><th scope="col" className="px-4 py-4">Notas registradas</th><th scope="col" className="px-5 py-4 text-right">Promedio simple /20</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.slice(start, start + pageSize).map((row, index) => <tr key={`${row.code}-${row.courseName}-${index}`} className="hover:bg-slate-50/60"><td className="px-5 py-4 font-mono text-xs text-slate-500">{row.code}</td><td className="px-5 py-4 font-medium text-slate-800">{row.courseName}</td><td className="px-4 py-4 text-slate-600">{row.credits ?? "Sin datos"}</td><td className="px-4 py-4 text-slate-600">{row.count || <span className="text-xs text-slate-400">Sin registros</span>}</td><td className="px-5 py-4 text-right">{row.grade === null ? <span className="text-xs text-slate-400">Sin calificación</span> : <span className="font-mono font-semibold text-slate-800">{row.grade.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="font-normal text-slate-400">/ 20</span></span>}</td></tr>)}</tbody></table>{!rows.length ? <div className="p-10 text-center"><p className="font-semibold text-slate-700">{history.length ? "No hay cursos con estos filtros" : "No hay registros académicos disponibles"}</p><p className="mt-2 text-sm text-slate-500">{history.length ? "Cambie la búsqueda o la situación seleccionada." : "Los cursos y calificaciones aparecerán cuando estén registrados en el sistema."}</p></div> : null}</div><MgeTablePagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="cursos" /></section>
      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />El PDF incluye el historial completo del estudiante, aunque aplique filtros o cambie de página.</p>
      <details className="text-xs text-slate-500"><summary className="cursor-pointer font-semibold">Cómo interpretar este historial</summary><p className="mt-2 leading-relaxed">Se incluyen cursos de la carrera actual y calificaciones históricas disponibles. Los promedios son simples y se calculan con notas guardadas; sin calificación no equivale a cero. Los créditos son los del catálogo y no acreditan cursos aprobados. Este resumen no sustituye un acta ni determina la aprobación oficial.</p></details>
    </> : <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><p className="font-semibold text-slate-700">Seleccione un estudiante</p><p className="mt-2 text-sm text-slate-500">Su historial aparecerá aquí, incluyendo los registros disponibles de estudiantes de baja.</p></div>}
  </div>;
}
