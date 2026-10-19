import React, { useEffect, useMemo, useState } from "react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { AttendanceRecord, Enrollment } from "../../../types";
import { fetchPayments } from "../../../services/api";
import { ProcessedStudent } from "../mgeTypes";
import { RecordedPayment, summarizeMge } from "../../../utils/mgeReports";
import { downloadFile, reportCsv } from "../../../utils/mgeExports";
import { academicToday } from "../../../utils/attendance";
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
  const stats = useMemo(() => summarizeMge(enrollments, students, payments, attendance), [enrollments, students, payments, attendance]);
  const programName = (id: string) => programs.find((row) => row.id === id)?.name || id;
  const exportReport = async (format: "csv" | "xlsx") => {
    if (loading || error || attendanceLoading || attendanceError || exporting) return;
    setExporting(true);
    setExportError("");
    const date = academicToday();
    const sections = [
      { name: "Resumen", rows: [["Indicador", "Valor"], ["Fecha de corte", academicToday()], ["Alcance", "Registros históricos, sin filtro de semestre"],
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
  return <div className="space-y-6">
    <div className="flex flex-wrap justify-between gap-3"><p className="text-sm text-slate-600">Registros históricos, sin filtro de semestre. Los alumnos de baja se excluyen de los conteos activos; sus cobros históricos se conservan.</p>
      <button type="button" disabled={loading} onClick={() => setRefresh((value) => value + 1)} className="border rounded-lg p-2 disabled:opacity-50">Actualizar importes</button></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[["Matriculados activos", stats.totalMatriculados], ["Admitidos activos", stats.totalAdmitidos], ["Matrículas con pago validado", stats.pagosValidados],
        ["Cobros de matrícula aprobados en Caja", loading ? "Cargando..." : error ? "No disponible" : `S/ ${stats.totalCollected.toFixed(2)}`]].map(([label, value]) =>
        <div key={label} className="border rounded-xl bg-white p-5"><p className="text-sm text-slate-600">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></div>)}
    </div>
    {error ? <p role="alert" className="text-red-700">{error}</p> : !loading ? <p className="text-sm text-slate-600">Se suman únicamente pagos APROBADOS del concepto matrícula con importe registrado en Caja. Hay {stats.missingPaymentAmount} matrículas validadas sin un cobro aprobado asociado; no se les asigna un importe supuesto.</p> : null}
    <div className="grid md:grid-cols-2 gap-5">
      <section className="border rounded-xl p-5 bg-white space-y-4"><h3 className="font-bold">Matrícula activa por programa</h3>
        {[...new Set([...programs.map((row) => row.id), ...Object.keys(stats.careerCounts)])].map((id) => {
          const count = stats.careerCounts[id] || 0;
          return <div key={id}><p className="text-sm">{programName(id)} · {count}</p><div className="h-2 bg-slate-100 rounded mt-1"><div className="h-2 bg-[#9F062A] rounded" style={{ width: `${stats.totalMatriculados ? count / stats.totalMatriculados * 100 : 0}%` }} /></div></div>;
        })}
      </section>
      <section className="border rounded-xl p-5 bg-white space-y-4"><h3 className="font-bold">Asistencia registrada</h3>
        {attendanceLoading ? <p role="status">Cargando asistencias...</p> : attendanceError ? <p role="alert" className="text-red-700">{attendanceError}</p> : <><p className="text-4xl font-bold">{stats.attendanceRate == null ? "Sin datos" : `${stats.attendanceRate}%`}</p><p className="text-sm">{stats.recordedMarks} marcas de alumnos activos hasta hoy (Lima). Presente, tardanza y justificado cuentan como asistencia. Los días sin marcar y futuros quedan excluidos.</p></>}
      </section>
    </div>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={loading || !!error || attendanceLoading || !!attendanceError || exporting} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void exportReport("xlsx"); }} className="bg-[#9F062A] text-white rounded-lg px-4 py-3 disabled:opacity-50">{exporting ? "Generando reporte..." : "Descargar Excel (.xlsx)"}</button>
      <button type="button" disabled={loading || !!error || attendanceLoading || !!attendanceError || exporting} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void exportReport("csv"); }} className="border rounded-lg px-4 py-3 disabled:opacity-50">Descargar CSV</button>
    </div>
    {exportError ? <p role="alert" className="text-red-700">{exportError}</p> : null}
    <p className="text-xs text-slate-600">Excel incluye hojas de resumen, matrículas y cobros, con títulos y filtros. El CSV incluye las mismas secciones e indica a Excel que use la coma como separador.</p>
  </div>;
}
