import React, { useState } from "react";
import { Graduation } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";
import MgeListFilters from "../MgeListFilters";
import MgeTablePagination from "../MgeTablePagination";

export default function GraduationDirectory({ students, graduations, onSelect }: { students: ProcessedStudent[]; graduations: Graduation[]; onSelect: (dni: string) => void }) {
  const { programs } = useAcademicCatalog();
  const [query, setQuery] = useState("");
  const [career, setCareer] = useState("");
  const [shift, setShift] = useState("");
  const [situation, setSituation] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const records = new Map(graduations.map((item) => [item.studentDni, item]));
  const choices = students.filter((student) => student.active !== false || records.has(student.dni));
  const missing = graduations.filter((item) => !choices.some((row) => row.dni === item.studentDni));
  const all = [...choices, ...missing.map((item): ProcessedStudent => ({ dni: item.studentDni, name: "Ficha no disponible", lastName: "", email: "", enrolled: false, academicStatus: "", programId: "", shift: "", paymentStatus: "" }))];
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = all.filter((row) => words.every((word) => normalizeStudentSearch(`${row.name} ${row.lastName} ${row.dni}`).includes(word)) && (!career || row.programId === career) && (!shift || row.shift === shift) && (!situation || (situation === "none" ? !records.has(row.dni) : situation === "registered" ? records.has(row.dni) : records.get(row.dni)?.status === situation)))
    .sort((a, b) => `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es", { sensitivity: "base" }));
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const change = (set: (value: string) => void) => (value: string) => { set(value); setPage(1); };
  return <div className="space-y-5">
    <MgeListFilters label="Filtros de expedientes" query={query} onQuery={change(setQuery)} onClear={() => { setQuery(""); setCareer(""); setShift(""); setSituation(""); setPage(1); }} filters={[
      { label: "Carrera", value: career, onChange: change(setCareer), options: [{ value: "", label: "Todas las carreras" }, ...programs.map((p) => ({ value: p.id, label: p.name }))] },
      { label: "Turno", value: shift, onChange: change(setShift), options: [{ value: "", label: "Todos los turnos" }, ...["Mañana", "Tarde", "Noche"].map((s) => ({ value: s, label: s }))] },
      { label: "Situación", value: situation, onChange: change(setSituation), options: [{ value: "", label: "Todas las situaciones" }, { value: "registered", label: "Con expediente" }, { value: "none", label: "Sin expediente" }, ...["Solicitado", "No Apto", "Apto", "Certificado Emitido"].map((s) => ({ value: s, label: s === "No Apto" ? "Con observaciones" : s }))] },
    ]} />
    <section aria-label="Directorio de expedientes" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h3 className="font-bold">Estudiantes y expedientes</h3><p className="text-xs text-slate-500">{graduations.length} expedientes registrados · {all.length} estudiantes disponibles</p></header>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Estudiante", "Carrera y turno", "Requisitos revisados", "Situación", "Acción"].map((label) => <th key={label} scope="col" className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.slice((current - 1) * pageSize, current * pageSize).map((row) => { const item = records.get(row.dni); return <tr key={row.dni} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold">{row.lastName}{row.lastName ? ", " : ""}{row.name}</p><p className="mt-1 text-xs text-slate-500">DNI {row.dni}{row.active === false ? " · De baja" : ""}</p></td><td className="px-5 py-4"><p>{programs.find((p) => p.id === row.programId)?.name || row.programId || "Sin carrera registrada"}</p><p className="mt-1 text-xs text-slate-500">{row.shift || "Sin turno"}</p></td><td className="px-5 py-4 text-slate-500">{item ? `${[item.docsChecked.solicitud, item.docsChecked.constanciaEgresado, item.docsChecked.practicasPre, item.docsChecked.pagoDerecho].filter(Boolean).length} de 4` : "—"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item?.status === "Apto" || item?.status === "Certificado Emitido" ? "bg-emerald-50 text-emerald-700" : item?.status === "No Apto" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{item?.status === "No Apto" ? "Con observaciones" : item?.status || "Sin expediente"}</span></td><td className="px-5 py-4"><button type="button" aria-label={`Consultar expediente de ${row.name} ${row.lastName}, DNI ${row.dni}`} onClick={() => onSelect(row.dni)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">{item ? "Revisar expediente" : "Consultar estudiante"}</button></td></tr>; })}</tbody></table>{!rows.length ? <div className="p-10 text-center text-sm text-slate-500">No hay estudiantes con estos filtros. Pruebe otro nombre o limpie la búsqueda.</div> : null}</div>
      <MgeTablePagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="estudiantes" />
    </section>
  </div>;
}
