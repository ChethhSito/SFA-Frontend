import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrainCircuit, RefreshCw, X } from "lucide-react";
import { fetchAttritionRiskReport, referStudentToTutoring } from "../../../services/api";
import Toast, { ToastNotice } from "../../ui/Toast";
import TutoringNotifications from "./TutoringNotifications";
import AcademicAlerts from "./AcademicAlerts";

interface StudentRiskItem {
  studentDni: string;
  studentName: string;
  career: string;
  cycle: string;
  shift: string;
  riskScore: number | null;
  riskLevel: "CRITICO" | "MODERADO" | "BAJO" | "SIN_DATOS";
  primaryCause: string;
  recommendation: string;
  metrics: {
    attendanceRate: number | null;
    currentGpa: number | null;
    homeworkCompletion: number | null;
    hasOverduePayment: boolean | null;
  };
  referredToTutoring?: boolean;
}
interface RiskReport {
  students: StudentRiskItem[];
  timestamp: string;
  kpis: {
    totalStudents: number;
    totalEvaluated: number;
    insufficientDataCount: number;
    retentionRate: number | null;
    criticalCount: number;
    moderateCount: number;
    lowRiskCount: number;
  };
}
const levelLabels = { CRITICO: "Crítico", MODERADO: "Moderado", BAJO: "Bajo", SIN_DATOS: "Sin datos" };
const metric = (value: number | null, suffix = "") => value == null ? "Sin datos" : `${value}${suffix}`;

export default function MgeRiesgoIaTab() {
  const [report, setReport] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [career, setCareer] = useState("all");
  const [risk, setRisk] = useState("all");
  const [selected, setSelected] = useState<StudentRiskItem | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchAttritionRiskReport().then((data: RiskReport | null) => {
      if (!active) return;
      if (!data || !Array.isArray(data.students) || !data.kpis) {
        setReport(null);
        setError("No se pudo consultar el riesgo académico. Intente actualizar nuevamente.");
      } else setReport(data);
    }).catch(() => {
      if (active) { setReport(null); setError("No se pudo consultar el riesgo académico."); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  const careers = useMemo(() => [...new Set((report?.students || []).map((s) => s.career))], [report]);
  const students = useMemo(() => (report?.students || []).filter((student) =>
    (student.studentName.toLowerCase().includes(search.toLowerCase().trim()) || student.studentDni.includes(search.trim())) &&
    (career === "all" || student.career === career) && (risk === "all" || student.riskLevel === risk)), [report, search, career, risk]);

  const confirmReferral = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const result = await referStudentToTutoring(selected.studentDni, notes);
      if (!result?.success || result.referral?.studentDni !== selected.studentDni) throw new Error("No se pudo registrar la derivación.");
      setReport((current) => current ? { ...current, students: current.students.map((student) =>
        student.studentDni === selected.studentDni ? { ...student, referredToTutoring: true } : student) } : current);
      setNotice({ id: Date.now(), kind: "success", message: "Derivación guardada. Aviso disponible en la bandeja de tutoría de MGE." });
      setSelected(null);
      setRefresh((value) => value + 1);
    } catch {
      setNotice({ id: Date.now(), kind: "error", message: "No se pudo registrar la derivación. Conservamos las observaciones para reintentar." });
    } finally { setSubmitting(false); }
  };

  return <div className="space-y-6">
    {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap justify-between gap-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><BrainCircuit /> Riesgo Académico</h2>
        <p className="text-sm text-slate-600 mt-2">Alertas calculadas con registros académicos disponibles.</p>
      </div>
      <button type="button" onClick={() => setRefresh((value) => value + 1)} disabled={loading}
        className="inline-flex items-center gap-2 p-3 rounded-xl bg-slate-100 disabled:opacity-50">
        <RefreshCw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} /> Actualizar
      </button>
    </div>
    <p className="p-4 bg-slate-100 rounded-xl text-sm text-slate-700">
      El indicador usa reglas de ponderación: asistencia 35%, notas 30%, entregas 15%, estado del pago 10% y turno 10%.
      No es una predicción de retención ni determina una inhabilitación automática.
      Se consideran registros históricos; no hay un filtro por semestre. El promedio es simple y usa las calificaciones guardadas de evaluaciones y entregas.
      Las tareas vencidas se cuentan solo en cursos donde el alumno tiene asistencia registrada.
      Si falta algún indicador, el estudiante queda sin evaluación.
    </p>
    {loading ? <p role="status">Consultando registros académicos...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : report ? <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Evaluados", report.kpis.totalEvaluated], ["Riesgo crítico", report.kpis.criticalCount],
          ["Riesgo moderado", report.kpis.moderateCount], ["Riesgo bajo", report.kpis.lowRiskCount]].map(([label, value]) =>
          <div key={label} className="p-5 bg-white border rounded-xl"><p className="text-sm text-slate-600">{label}</p><p className="text-2xl font-bold">{value}</p></div>)}
      </div>
      <p className="text-sm text-slate-600">{report.kpis.totalStudents} estudiantes registrados · {report.kpis.insufficientDataCount} sin datos suficientes.
        Última consulta: {new Date(report.timestamp).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima).</p>
      <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
        La asistencia considera únicamente las marcas registradas hasta el {new Date(report.timestamp).toLocaleDateString("es-PE", { timeZone: "America/Lima" })} (hora de Lima).
        {" "}Las fechas futuras quedan excluidas hasta que llegue ese día. El porcentaje cuenta los días registrados de todos los cursos del estudiante.
      </p>
      <div className="flex flex-wrap gap-3">
        <input aria-label="Buscar estudiante por nombre o DNI" placeholder="Buscar por nombre o DNI" value={search} onChange={(event) => setSearch(event.target.value)} className="border rounded-lg p-2" />
        <select aria-label="Filtrar por carrera" value={career} onChange={(event) => setCareer(event.target.value)} className="border rounded-lg p-2">
          <option value="all">Todas las carreras</option>{careers.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select aria-label="Filtrar por riesgo" value={risk} onChange={(event) => setRisk(event.target.value)} className="border rounded-lg p-2">
          <option value="all">Todos los niveles</option>{Object.entries(levelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50"><tr>{["Estudiante", "Carrera / ciclo / turno", "Asistencia", "Promedio", "Entregas", "Nivel / indicador", "Detalle"].map((heading) => <th key={heading} scope="col" className="p-4">{heading}</th>)}</tr></thead>
          <tbody>{students.length === 0 ? <tr><td colSpan={7} className="p-6 text-center">No hay estudiantes para los filtros seleccionados.</td></tr> : students.map((student) =>
            <tr key={student.studentDni} className="border-t">
              <td className="p-4"><p className="font-bold">{student.studentName}</p><p>{student.studentDni}</p></td>
              <td className="p-4">{student.career}<p className="text-xs">{student.cycle} · {student.shift}</p></td>
              <td className="p-4">{metric(student.metrics.attendanceRate, "%")}</td>
              <td className="p-4">{metric(student.metrics.currentGpa, "/20")}</td>
              <td className="p-4">{metric(student.metrics.homeworkCompletion, "%")}</td>
              <td className="p-4">{levelLabels[student.riskLevel]}{student.riskScore == null ? "" : ` (${(student.riskScore * 100).toFixed(0)}/100)`}</td>
              <td className="p-4"><button type="button" className="p-2 rounded-lg bg-slate-100" onClick={() => {
                setSelected(student); setNotes(student.riskLevel === "SIN_DATOS" ? "" : student.recommendation);
              }}>Ver detalle{student.referredToTutoring ? " · Derivado" : ""}</button></td>
            </tr>)}</tbody>
        </table>
      </div>
    </> : null}
    <AcademicAlerts refresh={refresh} />
    <TutoringNotifications refresh={refresh} />
    {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <section role="dialog" aria-modal="true" aria-labelledby="risk-detail-title" className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
        <div className="flex justify-between gap-3"><h3 id="risk-detail-title" className="font-bold">{selected.studentName}</h3>
          <button type="button" aria-label="Cerrar detalle" disabled={submitting} onClick={() => setSelected(null)}><X /></button></div>
        <p>{selected.primaryCause}</p><p>{selected.recommendation}</p>
        {!selected.referredToTutoring ? <>
          {selected.riskLevel === "SIN_DATOS" ? <p className="text-sm text-slate-600">Puede registrar una derivación manual indicando el motivo. Esto no asigna un nivel de riesgo al estudiante.</p> : null}
          <label htmlFor="tutoring-notes" className="block">Observaciones para tutoría</label>
          <textarea id="tutoring-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} className="border rounded-lg p-3 w-full" disabled={submitting} />
          <button type="button" onClick={confirmReferral} disabled={submitting || !notes.trim()} className="bg-[#9F062A] text-white p-3 rounded-lg disabled:opacity-50">{submitting ? "Guardando..." : "Registrar derivación"}</button>
        </> : null}
        {selected.referredToTutoring ? <p>Derivación registrada. Consulte el motivo y la fecha en la bandeja de tutoría.</p> : null}
      </section>
    </div> : null}
  </div>;
}
