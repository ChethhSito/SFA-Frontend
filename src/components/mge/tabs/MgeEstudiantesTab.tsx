import React, { useState } from "react";
import { Search, Plus, FilePenLine, UserRoundX, UserRoundCheck, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  filteredStudents: ProcessedStudent[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onEditClick: (dni: string) => void;
  onDeleteStudent: (dni: string) => void;
}

export default function MgeEstudiantesTab({ filteredStudents, totalCount, searchQuery, onSearchChange, onOpenAddModal, onEditClick, onDeleteStudent }: Props) {
  const { programs } = useAcademicCatalog();
  const [program, setProgram] = useState("");
  const [shift, setShift] = useState("");
  const [status, setStatus] = useState("");
  const [activity, setActivity] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"name" | "dni">("name");
  const [ascending, setAscending] = useState(true);
  const rows = filteredStudents.filter((s) => (!program || s.programId === program) && (!shift || s.shift === shift) && (!status || (s.enrollmentStatus || s.academicStatus) === status) && (!activity || (activity === "active" ? s.active !== false : s.active === false)))
    .sort((a, b) => (ascending ? 1 : -1) * (sort === "dni" ? a.dni.localeCompare(b.dni) : `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es", { sensitivity: "base" })) || a.dni.localeCompare(b.dni));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const hasFilters = !!(searchQuery || program || shift || status || activity);
  const reset = () => { onSearchChange(""); setProgram(""); setShift(""); setStatus(""); setActivity(""); setPage(1); };
  const order = (field: "name" | "dni") => { setAscending(sort === field ? !ascending : true); setSort(field); setPage(1); };
  const selectClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:outline-[#9F062A]";
  const otherPrograms = [...new Set(filteredStudents.map((s) => s.programId).filter((id) => id && !programs.some((p) => p.id === id)))];
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-bold text-slate-900">Padrón de estudiantes</h2><p className="mt-1 text-sm text-slate-500">{totalCount} estudiantes registrados · Consulte y actualice sus fichas.</p></div><button type="button" onClick={onOpenAddModal} className="flex items-center gap-2 rounded-xl bg-[#9F062A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#800521]"><Plus className="h-4 w-4" />Registrar estudiante</button></div>
    <section aria-label="Buscar y filtrar estudiantes" className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(230px,1.6fr)_repeat(4,minmax(0,1fr))_auto]">
        <label htmlFor="roster-search" className="block min-w-0 text-xs font-semibold text-slate-500 sm:col-span-2 xl:col-span-1">Buscador<div className="relative mt-1.5"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input id="roster-search" aria-label="Buscar estudiante" placeholder="Nombre, DNI o correo" value={searchQuery} onChange={(event) => { onSearchChange(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-800 focus:outline-[#9F062A]" /></div></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500">Carrera<select value={program} onChange={(e) => { setProgram(e.target.value); setPage(1); }} className={selectClass}><option value="">Todas las carreras</option>{programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}{otherPrograms.map((id) => <option key={id} value={id}>{id}</option>)}</select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500">Turno<select value={shift} onChange={(e) => { setShift(e.target.value); setPage(1); }} className={selectClass}><option value="">Todos los turnos</option>{["Mañana", "Tarde", "Noche"].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500">Estado<select value={activity} onChange={(e) => { setActivity(e.target.value); setPage(1); }} className={selectClass}><option value="">Todos los estudiantes</option><option value="active">Activos</option><option value="inactive">De baja</option></select></label>
        <label className="block min-w-0 text-xs font-semibold text-slate-500">Matrícula<select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectClass}><option value="">Todos los estados</option><option value="MATRICULADO">Matriculado</option><option value="ADMITIDO">Admitido</option><option value="Sin matrícula">Sin matrícula</option></select></label>
        {hasFilters ? <button type="button" onClick={reset} className="h-11 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Limpiar</button> : null}
      </div>
    </section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label="Resultados del padrón">
      <div className="overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr>
          {([['name', 'Estudiante'], ['dni', 'DNI']] as const).map(([field, label]) => <th key={field} scope="col" aria-sort={sort === field ? ascending ? "ascending" : "descending" : "none"} className="px-5 py-4"><button type="button" onClick={() => order(field)} className="flex items-center gap-2" aria-label={`Ordenar por ${label.toLowerCase()}`}>{label}<ArrowUpDown className="h-3.5 w-3.5" /></button></th>)}
          <th scope="col" className="px-4 py-4">Carrera y turno</th><th scope="col" className="px-4 py-4">Contacto</th><th scope="col" className="px-4 py-4">Estado y matrícula</th><th scope="col" className="px-5 py-4 text-right">Acciones</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.slice(start, start + pageSize).map((s) => <tr key={s.dni} className="hover:bg-slate-50/70">
          <td className="px-5 py-4"><p className="font-semibold text-slate-900">{s.lastName}, {s.name}</p><p className="mt-1 text-xs text-slate-500">{s.email || "Sin correo registrado"}</p></td>
          <td className="px-4 py-4 font-mono text-slate-600">{s.dni}</td>
          <td className="px-4 py-4"><p className="font-medium text-slate-700">{programs.find((p) => p.id === s.programId)?.name || s.programId || "Sin carrera asignada"}</p><p className="mt-1 text-xs text-slate-500">{s.shift ? `Turno ${s.shift.toLowerCase()}` : "Sin turno asignado"}</p></td>
          <td className="px-4 py-4 text-slate-700"><p>{s.phone || "Sin teléfono"}</p><p className="mt-1 text-xs text-slate-500">{s.district?.trim() || "Distrito sin registrar"}</p></td>
          <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.active === false ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{s.active === false ? "De baja" : "Activo"}</span><p className="mt-1.5 text-xs text-slate-600">{(s.enrollmentStatus || s.academicStatus) === "MATRICULADO" ? "Matriculado" : (s.enrollmentStatus || s.academicStatus) === "ADMITIDO" ? "Admitido · Matrícula pendiente" : s.academicStatus === "BAJA" ? "Estudiante inactivo" : "Sin matrícula"}</p>{s.active === false ? <details className="mt-1 text-xs text-slate-500"><summary className="cursor-pointer">Ver motivo de baja</summary><p className="mt-1 max-w-56 break-words">{s.deactivationReason || "Sin motivo registrado"}</p>{s.deactivatedAt ? <p>{new Date(s.deactivatedAt).toLocaleDateString("es-PE", { timeZone: "America/Lima" })}</p> : null}</details> : null}</td>
          <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEditClick(s.dni)} aria-label={`Ver ficha de ${s.name} ${s.lastName}`} className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><FilePenLine className="h-3.5 w-3.5" />Ver ficha</button><button type="button" onClick={() => onDeleteStudent(s.dni)} aria-label={`${s.active === false ? "Reactivar" : "Desactivar"} a ${s.name} ${s.lastName}`} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${s.active === false ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "text-red-700 hover:bg-red-50"}`}>{s.active === false ? <UserRoundCheck className="h-3.5 w-3.5" /> : <UserRoundX className="h-3.5 w-3.5" />}{s.active === false ? "Reactivar" : "Desactivar"}</button></div></td>
        </tr>)}</tbody>
      </table>{!rows.length ? <div className="space-y-2 p-10 text-center"><p className="font-semibold text-slate-700">No se encontraron estudiantes</p><p className="text-sm text-slate-500">Pruebe con otro nombre o cambie los filtros.</p></div> : null}</div>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs text-slate-600"><p role="status">Mostrando {rows.length ? start + 1 : 0}–{Math.min(start + pageSize, rows.length)} de {rows.length} estudiantes{hasFilters ? ` · ${totalCount} en total` : ""}</p><div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-2">Por página<select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 p-2">{[10, 20, 50].map((v) => <option key={v}>{v}</option>)}</select></label><nav aria-label="Paginación de estudiantes" className="flex items-center gap-3"><button type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span>Página {currentPage} de {pages}</span><button type="button" aria-label="Página siguiente" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></nav></div></footer>
    </section>
    <p className="text-xs text-slate-500">La matrícula muestra el registro disponible del estudiante; no acredita matrícula en el ciclo activo.</p>
  </div>;
}
