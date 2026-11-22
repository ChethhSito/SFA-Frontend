import React, { useEffect, useMemo, useState } from "react";
import { Loader2, BarChart3, FileSpreadsheet, Download, RefreshCw, Users, CheckCircle2, DollarSign, Calendar } from "lucide-react";
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
    setLoading(true);
    setError("");
    fetchPayments().then((rows) => {
      if (!Array.isArray(rows)) throw new Error("Error de consulta");
      if (active) setPayments(rows);
    }).catch(() => {
      if (active) setError("No se pudieron consultar los importes de Caja. Reintente.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [refresh]);

  const stats = useMemo(() => summarizeMge(enrollments, students, payments, attendance), [enrollments, students, payments, attendance]);
  const programName = (id: string) => programs.find((row) => row.id === id)?.name || (id === "electricidad_industrial" ? "Electricidad Industrial" : id);

  const exportReport = async (format: "csv" | "xlsx") => {
    if (loading || error || attendanceLoading || attendanceError || exporting) return;
    setExporting(true);
    setExportError("");
    const date = academicToday();
    const sections = [
      {
        name: "Resumen",
        rows: [
          ["Indicador", "Valor"],
          ["Fecha de corte", academicToday()],
          ["Alcance", "Registros institucionales, periodo académico activo"],
          ["Matriculados activos", stats.totalMatriculados],
          ["Admitidos activos", stats.totalAdmitidos],
          ["Matrículas con pago validado", stats.pagosValidados],
          ["Cobros de matrícula aprobados en Caja (PEN)", stats.totalCollected],
          ["Matrículas validadas sin cobro asociado", stats.missingPaymentAmount],
          ["Asistencia por marcas registradas (%)", stats.attendanceRate],
          ["Marcas contabilizadas", stats.recordedMarks]
        ]
      },
      {
        name: "Matriculas",
        rows: [
          ["DNI", "Programa", "Estado académico", "Turno", "Estado de pago", "Operación"],
          ...stats.activeEnrollments.map((row) => [
            row.studentDni,
            programName(row.programId),
            row.academicStatus,
            row.shift || "Sin datos",
            row.paymentStatus,
            row.paymentOperation || "Sin datos"
          ])
        ]
      },
      {
        name: "Cobros de matricula",
        rows: [
          ["Identificador", "DNI", "Concepto", "Importe PEN", "Fecha", "Operación"],
          ...stats.enrollmentPayments.map((row) => [
            row.paymentId || row._id || "Sin datos",
            row.studentDni,
            row.concept,
            row.amount,
            row.date,
            row.receiptNumber || "Sin datos"
          ])
        ]
      },
    ];

    try {
      if (format === "csv") {
        downloadFile(reportCsv(sections), `Reporte_MGE_${date}.csv`, "text/csv;charset=utf-8");
      } else {
        const workbook = await createReportWorkbook(sections, date);
        const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
        downloadFile(bytes.buffer, `Reporte_MGE_${date}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      }
    } catch {
      setExportError("No se pudo generar el reporte. Intente descargarlo nuevamente.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Context Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#D97706] flex items-center justify-center font-bold shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              Consolidado y Reportes Estadísticos Institucionales
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Métricas oficiales de matrícula, conciliación de caja y asistencia estudiantil.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => setRefresh((value) => value + 1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono uppercase tracking-wider transition-all border border-slate-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={loading ? "animate-spin w-3.5 h-3.5 text-[#800521]" : "w-3.5 h-3.5 text-[#800521]"} />
          Actualizar Cifras
        </button>
      </section>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Matriculados Activos */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-600">
              Matriculados Activos
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
            {stats.totalMatriculados}
          </div>
          <p className="text-[11px] font-medium text-slate-600">
            Estudiantes con matrícula formalizada en ciclo activo
          </p>
        </div>

        {/* Admitidos Ordinarios */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-600">
              Padrón de Admitidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
            {stats.totalAdmitidos}
          </div>
          <p className="text-[11px] font-medium text-slate-600">
            Postulantes con vacante asignada ordinaria
          </p>
        </div>

        {/* Matrículas Validadas */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-600">
              Pagos Validados
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
            {stats.pagosValidados}
          </div>
          <p className="text-[11px] font-medium text-slate-600">
            Comprobantes conciliados con extracto bancario
          </p>
        </div>

        {/* Recaudación Total */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-600">
              Recaudación de Caja
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#800521] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#800521] tracking-tight font-display">
            {loading ? "Cargando..." : error ? "No disponible" : `S/ ${stats.totalCollected.toFixed(2)}`}
          </div>
          <p className="text-[11px] font-medium text-slate-600">
            Importe neto acreditado en cuentas institucionales
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl font-bold">
          {error}
        </p>
      ) : null}

      {/* Breakdown Grids */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Distribución por Carrera */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900">
              Distribución de Matrícula por Carrera
            </h3>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              {stats.totalMatriculados} Total
            </span>
          </div>
          <div className="space-y-3.5">
            {[...new Set([...programs.map((row) => row.id), ...Object.keys(stats.careerCounts)])].map((id) => {
              const count = stats.careerCounts[id] || 0;
              const percent = stats.totalMatriculados ? Math.round((count / stats.totalMatriculados) * 100) : 0;
              return (
                <div key={id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{programName(id)}</span>
                    <span className="font-mono text-slate-600">{count} estudiantes ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-[#800521] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Asistencia Global */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900">
              Métrica Consolidada de Asistencia
            </h3>
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              Corte Oficial
            </span>
          </div>
          {attendanceLoading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 py-6">
              <Loader2 className="w-5 h-5 text-[#800521] animate-spin" />
              <span>Calculando porcentaje de asistencia del periodo...</span>
            </div>
          ) : attendanceError ? (
            <p role="alert" className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl font-bold">{attendanceError}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-emerald-700 font-display">
                  {stats.attendanceRate == null ? "Sin datos" : `${stats.attendanceRate}%`}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  promedio general de asistencia en actas
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Contabiliza un total de <strong className="text-slate-900 font-mono">{stats.recordedMarks}</strong> marcas registradas por los docentes hasta la fecha. Se consideran marcas válidas: Presente, Tardanza y Justificado conforme al Reglamento Institucional.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Export Actions Bar */}
      <section className="bg-[#0F172A] rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black uppercase font-mono tracking-wider text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#D97706]" />
            Descarga de Reportes Institucionales Oficiales
          </h4>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Exporte los padrones y conciliaciones de matrícula para auditorías externas del MINEDU o DRE.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={loading || !!error || attendanceLoading || !!attendanceError || exporting}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); void exportReport("xlsx"); }}
            className="bg-[#800521] hover:bg-[#9F062A] text-white font-black text-xs uppercase tracking-wider font-mono rounded-xl px-4 py-2.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Generando..." : "Descargar Excel (.xlsx)"}
          </button>
          <button
            type="button"
            disabled={loading || !!error || attendanceLoading || !!attendanceError || exporting}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); void exportReport("csv"); }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-4 py-2.5 border border-slate-700 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Exportar CSV
          </button>
        </div>
      </section>
      {exportError ? <p role="alert" className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl font-bold">{exportError}</p> : null}
    </div>
  );
}
