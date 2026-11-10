import React, { useEffect, useMemo, useState } from "react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { AttendanceRecord, Enrollment } from "../../../types";
import { fetchPayments } from "../../../services/api";
import { ProcessedStudent } from "../mgeTypes";
import { RecordedPayment, summarizeMge, filterMgeReport } from "../../../utils/mgeReports";
import { downloadFile, reportCsv } from "../../../utils/mgeExports";
import { academicToday } from "../../../utils/attendance";
import MgeTablePagination from "../MgeTablePagination";
import MgeListFilters from "../MgeListFilters";
import { Download, RefreshCw, Info } from "lucide-react";
import { createReportWorkbook } from "../../../utils/reportXlsx";

interface Props {
  enrollments: Enrollment[];
  students: ProcessedStudent[];
  attendance: AttendanceRecord[];
  attendanceLoading: boolean;
  attendanceError: string | null;
}

export default function MgeReportesTab({ enrollments, students, attendance, attendanceLoading, attendanceError }: Props) {
  const { programs } = useAcademicCatalog();
  const [payments, setPayments] = useState<RecordedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    fetchPayments().then((rows) => {
      if (!Array.isArray(rows)) throw new Error("Error de consulta");
      if (active) setPayments(rows);
    }).catch(() => { if (active) setError("No se pudieron consultar los importes de Caja. Reintente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);
  const [query, setQuery] = useState("");
  const [career, setCareer] = useState("");
  const [shift, setShift] = useState("");
  const [situation, setSituation] = useState("");
  const [tab, setTab] = useState<"enrollments" | "payments">("enrollments");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const scope = useMemo(() => filterMgeReport(enrollments, students, payments, { query, career, shift, situation }), [enrollments, students, payments, query, career, shift, situation]);
  const stats = useMemo(() => summarizeMge(scope.enrollments, scope.students, scope.payments, attendance), [scope, attendance]);
  const byDni = new Map(students.map((student) => [student.dni, student]));
  const studentName = (dni: string) => { const student = byDni.get(dni); return student ? student.lastName + ", " + student.name : "Ficha no disponible"; };
  const enrollmentRows = [...stats.activeEnrollments].sort((a, b) => studentName(a.studentDni).localeCompare(studentName(b.studentDni), "es"));
  const paymentRows = [...stats.enrollmentPayments].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const total = tab === "enrollments" ? enrollmentRows.length : paymentRows.length;
  const current = Math.min(page, Math.max(1, Math.ceil(total / pageSize))), start = (current - 1) * pageSize;
  const change = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const money = (amount: number) => amount.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
  const programName = (id: string) => programs.find((row) => row.id === id)?.name || id;
  const exportReport = async (format: "csv" | "xlsx") => {
    if (loading || error || attendanceLoading || attendanceError || exporting) return;
    setExporting(true);
    setExportError("");
    const date = academicToday();
    const sections = [
      { name: "Resumen", rows: [["Indicador", "Valor"], ["Fecha de corte", academicToday()], ["Alcance", "Registros históricos, sin filtro de semestre"], ["Búsqueda", query || "Todas"], ["Carrera", career ? programName(career) : "Todas"], ["Turno", shift || "Todos"], ["Situación", situation || "Todas"],
        ["Matriculados activos", stats.totalMatriculados], ["Admitidos activos", stats.totalAdmitidos], ["Matrículas con pago validado", stats.pagosValidados],
        ["Cobros de matrícula aprobados en Caja (PEN)", stats.totalCollected], ["Matrículas validadas sin cobro asociado", stats.missingPaymentAmount],
        ["Asistencia por marcas registradas (%)", stats.attendanceRate], ["Marcas contabilizadas", stats.recordedMarks]] },
      { name: "Matriculas", rows: [["DNI", "Programa", "Estado académico", "Turno", "Estado de pago", "Operación"],
        ...stats.activeEnrollments.map((row) => [row.studentDni, programName(row.programId), row.academicStatus, row.shift || "Sin datos", row.paymentStatus, row.paymentOperation || "Sin datos"])] },
      { name: "Cobros de matricula", rows: [["Identificador", "DNI", "Concepto", "Importe PEN", "Fecha", "Operación"],
        ...stats.enrollmentPayments.map((row) => [row.paymentId || row._id || "Sin datos", row.studentDni, row.concept, row.amount, row.date, row.receiptNumber || "Sin datos"])] },
    ];
    try {
      if (format === "csv") {
        downloadFile(reportCsv(sections), `Reporte_MGE_${date}.csv`, "text/csv;charset=utf-8");
      } else {
        const workbook = await createReportWorkbook(sections, date);
        const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
        downloadFile(bytes.buffer, `Reporte_MGE_${date}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      }
    } catch { setExportError("No se pudo generar el reporte. Intente descargarlo nuevamente."); }
    finally { setExporting(false); }
  };
  return <div className="space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Resumen de gestión estudiantil</h2><p className="mt-1 text-sm text-slate-500">Consulte matrícula, cobros y asistencia con el mismo alcance de filtros.</p></div><button type="button" disabled={loading} onClick={() => setRefresh((value) => value + 1)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Actualizar importes</button></header>
    <MgeListFilters label="Filtros de reportes" query={query} onQuery={change(setQuery)} filters={[
      { label: "Carrera", value: career, onChange: change(setCareer), options: [{ value: "", label: "Todas las carreras" }, ...programs.map((p) => ({ value: p.id, label: p.name }))] },
      { label: "Turno", value: shift, onChange: change(setShift), options: [{ value: "", label: "Todos los turnos" }, ...["Mañana", "Tarde", "Noche"].map((s) => ({ value: s, label: s }))] },
      { label: "Situación", value: situation, onChange: change(setSituation), options: [{ value: "", label: "Todas las situaciones" }, { value: "MATRICULADO", label: "Matriculados" }, { value: "ADMITIDO", label: "Admitidos" }] },
    ]} onClear={() => { setQuery(""); setCareer(""); setShift(""); setSituation(""); setPage(1); }} />
    <p className="flex gap-2 text-xs text-slate-500"><Info className="h-4 w-4 shrink-0" />Acumulado histórico · Corte: {academicToday()} (Lima). La búsqueda y los filtros se aplican al resumen y a la descarga; la paginación solo cambia la vista.</p>
    <section aria-label="Indicadores del reporte" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><dl className="grid divide-y divide-slate-100 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-y-0">{[["Matriculados activos", stats.totalMatriculados], ["Admitidos activos", stats.totalAdmitidos], ["Matrículas con pago validado", stats.pagosValidados], ["Cobros aprobados de matrícula", loading ? "Cargando…" : error ? "No disponible" : money(stats.totalCollected)]].map(([label, value]) => <div key={label} className="px-5 py-5"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</dd></div>)}</dl></section>
    {error ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    {!loading && !error && stats.missingPaymentAmount > 0 ? <p className="rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">{stats.missingPaymentAmount} matrículas tienen pago validado, pero no un cobro aprobado asociado en Caja. Sus importes no se incluyen en la recaudación.</p> : null}
    <section aria-label="Distribución del reporte" className="grid overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-4 p-5"><h3 className="font-bold">Matriculados por carrera</h3>{[...new Set([...programs.map((row) => row.id), ...Object.keys(stats.careerCounts)])].map((id) => { const count = stats.careerCounts[id] || 0; return <div key={id}><div className="flex justify-between gap-3 text-sm"><span className="text-slate-600">{programName(id)}</span><span className="font-semibold">{count} <span className="font-normal text-slate-400">· {stats.totalMatriculados ? Math.round(count / stats.totalMatriculados * 100) : 0}%</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#9F062A]" style={{ width: (stats.totalMatriculados ? count / stats.totalMatriculados * 100 : 0) + "%" }} /></div></div>; })}</div>
      <div className="border-t border-slate-100 p-5 lg:border-l lg:border-t-0"><h3 className="font-bold">Asistencia registrada</h3>{attendanceLoading ? <p role="status" className="mt-4 text-sm text-slate-500">Cargando asistencias…</p> : attendanceError ? <p role="alert" className="mt-4 text-sm text-red-700">{attendanceError}</p> : <><p className="mt-5 text-4xl font-bold text-slate-900">{stats.attendanceRate == null ? "Sin registros" : stats.attendanceRate + "%"}</p><p className="mt-3 text-sm leading-relaxed text-slate-500">{stats.recordedMarks} marcas de alumnos activos hasta hoy. Presente, tardanza y justificado cuentan como asistencia. Las fechas futuras y días sin marcar se excluyen.</p></>}</div>
    </section>
    <section aria-label="Detalle del reporte" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div className="flex gap-2">{([["enrollments", "Matrículas"], ["payments", "Cobros aprobados"]] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={tab === key} onClick={() => { setTab(key); setPage(1); }} className={"rounded-lg px-3 py-2 text-sm font-semibold " + (tab === key ? "bg-[#9F062A] text-white" : "text-slate-500 hover:bg-slate-50")}>{label}</button>)}</div><div className="flex gap-2"><button type="button" disabled={loading || !!error || attendanceLoading || !!attendanceError || exporting} onClick={() => { void exportReport("xlsx"); }} className="flex items-center gap-2 rounded-lg bg-[#9F062A] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Download className="h-4 w-4" />{exporting ? "Generando…" : "Descargar Excel"}</button><button type="button" disabled={loading || !!error || attendanceLoading || !!attendanceError || exporting} onClick={() => { void exportReport("csv"); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40">CSV</button></div></header>
      {exportError ? <p role="alert" className="px-5 py-3 text-sm text-red-700">{exportError}</p> : null}
      {tab === "payments" && loading ? <p role="status" className="p-10 text-center text-sm text-slate-500">Consultando cobros…</p> : tab === "payments" && error ? <p className="p-10 text-center text-sm text-slate-500">Los cobros no están disponibles. Actualice los importes para reintentar.</p> : <><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{(tab === "enrollments" ? ["Estudiante", "Carrera y turno", "Matrícula", "Pago", "Operación"] : ["Estudiante", "Concepto", "Fecha registrada", "Operación", "Importe"]).map((label) => <th key={label} scope="col" className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{tab === "enrollments" ? enrollmentRows.slice(start, start + pageSize).map((row) => <tr key={row.studentDni} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold">{studentName(row.studentDni)}</p><p className="mt-1 text-xs text-slate-500">DNI {row.studentDni}</p></td><td className="px-5 py-4">{programName(row.programId)}<p className="mt-1 text-xs text-slate-500">{row.shift || "Sin turno"}</p></td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{row.academicStatus === "MATRICULADO" ? "Matriculado" : "Admitido"}</span></td><td className="px-5 py-4 text-slate-600">{row.paymentStatus}</td><td className="px-5 py-4 font-mono text-xs text-slate-500">{row.paymentOperation || "Sin operación"}</td></tr>) : paymentRows.slice(start, start + pageSize).map((row, index) => <tr key={row.paymentId || row._id || index} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold">{studentName(row.studentDni)}</p><p className="mt-1 text-xs text-slate-500">DNI {row.studentDni}{byDni.get(row.studentDni)?.active === false ? " · De baja" : ""}</p></td><td className="px-5 py-4">{row.concept}</td><td className="px-5 py-4 text-slate-600">{row.date || "Sin fecha"}</td><td className="px-5 py-4 font-mono text-xs text-slate-500">{row.receiptNumber || "Sin operación"}</td><td className="px-5 py-4 font-semibold">{money(row.amount)}</td></tr>)}</tbody></table>{!total ? <p className="p-10 text-center text-sm text-slate-500">No hay registros con estos filtros.</p> : null}</div><MgeTablePagination total={total} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label={tab === "enrollments" ? "matrículas" : "cobros"} /></>}
    </section>
    <details className="text-xs leading-relaxed text-slate-500"><summary className="cursor-pointer font-semibold">Alcance de los datos y la descarga</summary><p className="mt-2">Los alumnos de baja se excluyen de los conteos activos; sus cobros históricos se conservan. Se suman solo pagos APROBADOS de matrícula con importe registrado en Caja. {loading || error ? "El estado de los importes aún no está disponible." : "Hay " + stats.missingPaymentAmount + " matrículas validadas sin cobro aprobado asociado; no se les asigna un importe supuesto."} Excel y CSV incluyen todas las filas que coinciden con los filtros en tres secciones: resumen, matrículas y cobros. No hay filtro por semestre.</p></details>
  </div>;
}
