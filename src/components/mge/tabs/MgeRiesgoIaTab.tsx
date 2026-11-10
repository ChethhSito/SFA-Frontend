import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Info } from "lucide-react";
import { fetchAttritionRiskReport, referStudentToTutoring } from "../../../services/api";
import Toast, { ToastNotice } from "../../ui/Toast";
import TutoringNotifications from "./TutoringNotifications";
import AcademicAlerts from "./AcademicAlerts";
import MgeListFilters from "../MgeListFilters";
import MgeTablePagination from "../MgeTablePagination";
import MgeDialog from "../MgeDialog";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";

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
  const [shift, setShift] = useState("all");
  const [tab, setTab] = useState<"students" | "alerts" | "tutoring">("students");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("priority");
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

  const careers = useMemo(() => [...new Set<string>((report?.students || []).map((s: StudentRiskItem) => s.career))].sort((a, b) => a.localeCompare(b, "es")), [report]);
  const words = normalizeStudentSearch(search).trim().split(/\s+/).filter(Boolean);
  const priority = { CRITICO: 0, MODERADO: 1, BAJO: 2, SIN_DATOS: 3 };
  const students = (report?.students || []).filter((student) => words.every((word) => normalizeStudentSearch(student.studentName + " " + student.studentDni).includes(word)) &&
    (career === "all" || student.career === career) && (risk === "all" || student.riskLevel === risk) && (shift === "all" || student.shift === shift))
    .sort((a, b) => (sort === "priority" ? priority[a.riskLevel] - priority[b.riskLevel] || (b.riskScore ?? -1) - (a.riskScore ?? -1) : 0) || a.studentName.localeCompare(b.studentName, "es", { sensitivity: "base" }));
  const current = Math.min(page, Math.max(1, Math.ceil(students.length / pageSize))), start = (current - 1) * pageSize;
  const change = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const badge = (level: StudentRiskItem["riskLevel"]) => level === "CRITICO" ? "bg-rose-50 text-rose-700" : level === "MODERADO" ? "bg-amber-50 text-amber-800" : level === "BAJO" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500";

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

  return <div className="space-y-5">
    {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Seguimiento del riesgo académico</h2><p className="mt-1 text-sm text-slate-500">Revise indicadores, consulte alertas y gestione la atención de tutoría.</p></div><button type="button" onClick={() => setRefresh((value) => value + 1)} disabled={loading || submitting} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 disabled:opacity-40"><RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin" : "")} />Actualizar evaluación</button></header>
    <nav aria-label="Vistas de seguimiento académico" className="flex flex-wrap gap-2">{([["students", "Evaluación de estudiantes"], ["alerts", "Alertas académicas"], ["tutoring", "Casos de tutoría"]] as const).map(([key, label]) => <button key={key} type="button" aria-pressed={tab === key} onClick={() => setTab(key)} className={"rounded-lg border px-4 py-2.5 text-sm font-semibold " + (tab === key ? "border-[#9F062A] bg-[#9F062A] text-white" : "border-slate-200 bg-white text-slate-600")}>{label}</button>)}</nav>
    {tab === "students" ? <>
      {loading ? <p role="status" className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Consultando registros académicos…</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : report ? <>
        <section aria-label="Resumen de evaluación" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><dl className="grid grid-cols-2 divide-slate-100 lg:grid-cols-5 lg:divide-x">{[["Evaluados", report.kpis.totalEvaluated], ["Riesgo crítico", report.kpis.criticalCount], ["Riesgo moderado", report.kpis.moderateCount], ["Riesgo bajo", report.kpis.lowRiskCount], ["Sin datos suficientes", report.kpis.insufficientDataCount]].map(([label, value]) => <div key={label} className="px-5 py-4"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-2 text-2xl font-bold">{value}</dd></div>)}</dl><p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Resumen general: {report.kpis.totalStudents} estudiantes · Última consulta: {new Date(report.timestamp).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima)</p></section>
        {report.kpis.insufficientDataCount > 0 ? <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>{report.kpis.insufficientDataCount} estudiantes aún no tienen todos los indicadores necesarios. Abra su detalle para revisar qué información falta.</p></div> : null}
        <MgeListFilters label="Filtros de riesgo" query={search} onQuery={change(setSearch)} onClear={() => { setSearch(""); setCareer("all"); setShift("all"); setRisk("all"); setPage(1); }} filters={[
          { label: "Carrera", value: career, onChange: change(setCareer), options: [{ value: "all", label: "Todas las carreras" }, ...careers.map((name) => ({ value: name, label: name }))] },
          { label: "Turno", value: shift, onChange: change(setShift), options: [{ value: "all", label: "Todos los turnos" }, ...[...new Set(report.students.map((student) => student.shift))].sort().map((name) => ({ value: name, label: name || "Sin turno" }))] },
          { label: "Situación", value: risk, onChange: change(setRisk), options: [{ value: "all", label: "Todos los niveles" }, ...Object.entries(levelLabels).map(([value, label]) => ({ value, label }))] },
        ]} />
        <section aria-label="Evaluación de estudiantes" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h3 className="font-bold">Estudiantes e indicadores</h3><label className="flex items-center gap-2 text-xs text-slate-500">Ordenar<select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2"><option value="priority">Mayor prioridad</option><option value="name">Nombre del estudiante</option></select></label></header>
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Estudiante", "Carrera y turno", "Asistencia", "Promedio /20", "Entregas", "Nivel de riesgo", "Acción"].map((heading) => <th key={heading} scope="col" className="px-5 py-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{students.slice(start, start + pageSize).map((student) => <tr key={student.studentDni} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold">{student.studentName}</p><p className="mt-1 text-xs text-slate-500">DNI {student.studentDni}</p></td><td className="px-5 py-4">{student.career}<p className="mt-1 text-xs text-slate-500">{student.cycle} · {student.shift}</p></td><td className="px-5 py-4 text-slate-600">{metric(student.metrics.attendanceRate, "%")}</td><td className="px-5 py-4 text-slate-600">{metric(student.metrics.currentGpa)}</td><td className="px-5 py-4 text-slate-600">{metric(student.metrics.homeworkCompletion, "%")}</td><td className="px-5 py-4"><span className={"inline-block rounded-full px-2.5 py-1 text-xs font-semibold " + badge(student.riskLevel)}>{levelLabels[student.riskLevel]}</span><p className="mt-1 text-xs text-slate-400">{student.riskScore == null ? "Evaluación pendiente" : "Indicador " + (student.riskScore * 100).toFixed(0) + "/100"}</p></td><td className="px-5 py-4"><button type="button" aria-label={"Ver detalle de " + student.studentName + ", DNI " + student.studentDni} onClick={() => { setSelected(student); setNotes(student.riskLevel === "SIN_DATOS" ? "" : student.recommendation); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Ver detalle</button>{student.referredToTutoring ? <p className="mt-1 text-xs text-slate-500">Derivación registrada</p> : null}</td></tr>)}</tbody></table>{!students.length ? <p className="p-10 text-center text-sm text-slate-500">No hay estudiantes con estos filtros.</p> : null}</div>
          <MgeTablePagination total={students.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="estudiantes" />
        </section>
        <details className="text-xs leading-relaxed text-slate-500"><summary className="cursor-pointer font-semibold">Cómo se calcula el indicador</summary><p className="mt-2">Reglas de ponderación: asistencia 35%, notas 30%, entregas 15%, pago 10% y turno 10%. Si falta un indicador, el estudiante queda sin evaluación. Se consideran registros históricos, sin filtro de semestre; la asistencia solo cuenta marcas hasta hoy (Lima) y excluye fechas futuras. El promedio es simple. Las tareas vencidas se cuentan solo en cursos con asistencia registrada. El indicador orienta el seguimiento y no determina una inhabilitación ni predice retención.</p></details>
      </> : null}
    </> : null}
    <div hidden={tab !== "alerts"}><AcademicAlerts refresh={refresh} /></div>
    <div hidden={tab !== "tutoring"}><TutoringNotifications refresh={refresh} /></div>
    {selected ? <MgeDialog title="Detalle del estudiante" busy={submitting} onClose={() => setSelected(null)}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{selected.studentName}</h3><p className="mt-1 text-xs text-slate-500">DNI {selected.studentDni} · {selected.career} · {selected.shift}</p></div><span className={"rounded-full px-3 py-1 text-xs font-semibold " + badge(selected.riskLevel)}>{levelLabels[selected.riskLevel]}</span></div>
      <dl className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">{[["Asistencia", metric(selected.metrics.attendanceRate, "%")], ["Promedio", metric(selected.metrics.currentGpa, "/20")], ["Entregas", metric(selected.metrics.homeworkCompletion, "%")], ["Pago vencido", selected.metrics.hasOverduePayment == null ? "Sin datos" : selected.metrics.hasOverduePayment ? "Sí" : "No"]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>)}</dl>
      <section><h4 className="text-sm font-semibold">Situación observada</h4><p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.primaryCause}</p><p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.recommendation}</p></section>
      {!selected.referredToTutoring ? <div className="space-y-3 border-t border-slate-100 pt-4"><h4 className="font-semibold">Derivar a tutoría</h4>{selected.riskLevel === "SIN_DATOS" ? <p className="text-xs leading-relaxed text-slate-500">Puede registrar una derivación manual con un motivo. Esto no asigna un nivel de riesgo.</p> : null}<label htmlFor="tutoring-notes" className="block text-sm font-medium">Motivo y observaciones<textarea id="tutoring-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} placeholder="Describa el motivo del seguimiento…" className="mt-2 w-full rounded-lg border border-slate-300 p-3 font-normal focus:outline-[#9F062A]" disabled={submitting} /></label><p className="text-xs text-slate-400">{notes.length}/2000 caracteres · Se guardará en la bandeja interna de tutoría.</p><div className="flex justify-end gap-3"><button type="button" disabled={submitting} onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Cancelar</button><button type="button" onClick={confirmReferral} disabled={submitting || !notes.trim()} className="rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{submitting ? "Guardando…" : "Registrar derivación"}</button></div></div> : <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">Derivación registrada. Consulte el motivo y la fecha en Casos de tutoría.</p>}
    </MgeDialog> : null}
  </div>;
}
