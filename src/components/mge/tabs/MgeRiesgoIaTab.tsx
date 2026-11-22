import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BrainCircuit, RefreshCw, X, Loader2, Search, Filter, ShieldAlert, ArrowRight, UserCheck } from "lucide-react";
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
const metric = (value: number | null, suffix = "") => value == null ? "—" : `${value}${suffix}`;

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
      } else {
        setReport(data);
      }
    }).catch(() => {
      if (active) {
        setReport(null);
        setError("No se pudo consultar el riesgo académico.");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [refresh]);

  const careers = useMemo(() => [...new Set((report?.students || []).map((s) => s.career))], [report]);

  const students = useMemo(() => (report?.students || []).filter((student) =>
    (student.studentName.toLowerCase().includes(search.toLowerCase().trim()) || student.studentDni.includes(search.trim())) &&
    (career === "all" || student.career === career) &&
    (risk === "all" || student.riskLevel === risk)
  ), [report, search, career, risk]);

  const confirmReferral = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const result = await referStudentToTutoring(selected.studentDni, notes);
      if (!result?.success || result.referral?.studentDni !== selected.studentDni) {
        throw new Error("No se pudo registrar la derivación.");
      }
      setReport((current) => current ? {
        ...current,
        students: current.students.map((student) =>
          student.studentDni === selected.studentDni ? { ...student, referredToTutoring: true } : student
        )
      } : current);
      setNotice({ id: Date.now(), kind: "success", message: "Derivación institucional guardada. Registrada en la bandeja de tutoría de MGE." });
      setSelected(null);
      setRefresh((value) => value + 1);
    } catch {
      setNotice({ id: Date.now(), kind: "error", message: "No se pudo registrar la derivación. Reintente." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}

      {/* Header Context Card */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#D97706] flex items-center justify-center font-bold shadow-xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
              Monitor de Riesgo Académico y Detección Temprana IA
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Evaluación predictiva de permanencia y alertas automáticas para derivación a tutoría.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRefresh((value) => value + 1)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono uppercase tracking-wider transition-all border border-slate-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={loading ? "animate-spin w-3.5 h-3.5 text-[#800521]" : "w-3.5 h-3.5 text-[#800521]"} />
          Actualizar Análisis
        </button>
      </section>

      {/* Institutional Explanatory Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
        El indicador computa reglas de ponderación institucional: asistencia 35%, rendimiento en evaluaciones 30%, entrega de tareas 15%, situación de pagos 10% y turno formativo 10%. Las alertas permiten a Secretaría Académica y Coordinación derivar oportunamente a los estudiantes en riesgo hacia las consejerías de tutoría.
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
          <Loader2 className="w-8 h-8 text-[#800521] animate-spin" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
            Analizando Indicadores y Riesgo Académico IA...
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Procesando asistencia, evaluaciones, rendimiento y retención estudiantil
          </span>
        </div>
      ) : error ? (
        <p role="alert" className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-4 rounded-xl font-bold">{error}</p>
      ) : report ? (
        <>
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-600">Total Evaluados</span>
              <p className="text-3xl font-black text-slate-900 font-display">{report.kpis.totalEvaluated}</p>
              <p className="text-[11px] text-slate-500 font-medium">{report.kpis.totalStudents} matriculados en padrón</p>
            </div>
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-black uppercase font-mono tracking-wider text-rose-700">Riesgo Crítico</span>
              <p className="text-3xl font-black text-rose-700 font-display">{report.kpis.criticalCount}</p>
              <p className="text-[11px] text-rose-600 font-medium">Prioridad alta de intervención</p>
            </div>
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-black uppercase font-mono tracking-wider text-amber-700">Riesgo Moderado</span>
              <p className="text-3xl font-black text-amber-700 font-display">{report.kpis.moderateCount}</p>
              <p className="text-[11px] text-amber-600 font-medium">Seguimiento preventivo</p>
            </div>
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-1">
              <span className="text-[11px] font-black uppercase font-mono tracking-wider text-emerald-700">Riesgo Bajo</span>
              <p className="text-3xl font-black text-emerald-700 font-display">{report.kpis.lowRiskCount}</p>
              <p className="text-[11px] text-emerald-600 font-medium">Progreso académico regular</p>
            </div>
          </div>

          {/* Filters Bar */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2.5 items-center flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  aria-label="Buscar estudiante por nombre o DNI"
                  placeholder="Buscar por DNI o apellido..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#800521]"
                />
              </div>

              <select
                aria-label="Filtrar por carrera"
                value={career}
                onChange={(event) => setCareer(event.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#800521] cursor-pointer"
              >
                <option value="all">Todas las carreras</option>
                {careers.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              <select
                aria-label="Filtrar por riesgo"
                value={risk}
                onChange={(event) => setRisk(event.target.value)}
                className="px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#800521] cursor-pointer"
              >
                <option value="all">Todos los niveles de riesgo</option>
                {Object.entries(levelLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <span className="text-[11px] font-mono text-slate-500 font-bold">
              {students.length} estudiantes filtrados
            </span>
          </section>

          {/* Table */}
          <div className="overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-[#0F172A] text-slate-200 text-[11px] font-black uppercase tracking-wider font-mono">
                  <tr>
                    <th scope="col" className="py-3 px-4">Estudiante</th>
                    <th scope="col" className="py-3 px-4">Carrera / Turno</th>
                    <th scope="col" className="py-3 px-4 text-center">Asistencia</th>
                    <th scope="col" className="py-3 px-4 text-center">Promedio</th>
                    <th scope="col" className="py-3 px-4 text-center">Entregas</th>
                    <th scope="col" className="py-3 px-4 text-center">Nivel Riesgo</th>
                    <th scope="col" className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs font-medium text-slate-500">
                        No hay estudiantes que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st.studentDni} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-xs text-slate-900">{st.studentName}</p>
                          <p className="font-mono text-[11px] text-slate-500">DNI: {st.studentDni}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-medium text-slate-800">{st.career}</p>
                          <p className="text-[11px] text-slate-500">{st.cycle} · Turno {st.shift}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-700">
                          {metric(st.metrics.attendanceRate, "%")}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-700">
                          {metric(st.metrics.currentGpa, "/20")}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-700">
                          {metric(st.metrics.homeworkCompletion, "%")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border ${
                            st.riskLevel === "CRITICO"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : st.riskLevel === "MODERADO"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : st.riskLevel === "BAJO"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}>
                            {levelLabels[st.riskLevel]}
                            {st.riskScore != null ? ` (${(st.riskScore * 100).toFixed(0)}%)` : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(st);
                              setNotes(st.riskLevel === "SIN_DATOS" ? "" : st.recommendation);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer border ${
                              st.referredToTutoring
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                            }`}
                          >
                            {st.referredToTutoring ? "Derivado" : "Auditar"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      <AcademicAlerts refresh={refresh} />
      <TutoringNotifications refresh={refresh} />

      {/* Referral Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="risk-detail-title"
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 space-y-0"
          >
            <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 id="risk-detail-title" className="text-sm font-black uppercase tracking-wider font-mono text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Auditoría y Derivación a Tutoría
              </h3>
              <button
                type="button"
                aria-label="Cerrar detalle"
                disabled={submitting}
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">{selected.studentName}</h4>
                <p className="text-xs text-slate-600 font-mono">DNI: {selected.studentDni} · {selected.career} · {selected.cycle}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div>
                  <span className="font-black uppercase tracking-wider text-slate-700 block">Causa Primaria Detectada:</span>
                  <p className="text-slate-800 font-medium">{selected.primaryCause}</p>
                </div>
                <div>
                  <span className="font-black uppercase tracking-wider text-slate-700 block">Recomendación Institucional:</span>
                  <p className="text-slate-800 font-medium">{selected.recommendation}</p>
                </div>
              </div>

              {!selected.referredToTutoring ? (
                <div className="space-y-3">
                  <label htmlFor="tutoring-notes" className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Instrucciones u Observaciones para el Consejero
                  </label>
                  <textarea
                    id="tutoring-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={2000}
                    rows={3}
                    className="border border-slate-300 rounded-xl p-3 text-xs w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#800521]"
                    disabled={submitting}
                    placeholder="Indique los acuerdos o puntos clave a tratar en la sesión de tutoría..."
                  />
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setSelected(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmReferral}
                      disabled={submitting || !notes.trim()}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider font-mono text-white bg-[#800521] hover:bg-[#66041a] transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                    >
                      {submitting ? "Guardando..." : "Derivar a Tutoría"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
                  Este estudiante ya cuenta con un expediente de derivación activo en la bandeja de tutoría.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
