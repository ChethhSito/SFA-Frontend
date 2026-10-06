import React, { useState, useEffect, useMemo } from "react";
import {
  BrainCircuit,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  UserCheck,
  Send,
  X,
  FileText,
  Info,
  Clock,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Card } from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import { fetchAttritionRiskReport, referStudentToTutoring } from "../../../services/api";

interface StudentRiskItem {
  studentDni: string;
  studentName: string;
  career: string;
  cycle: string;
  shift: string;
  riskScore: number;
  riskLevel: "CRITICO" | "MODERADO" | "BAJO";
  primaryCause: string;
  recommendation: string;
  metrics: {
    attendanceRate: number;
    currentGpa: number;
    homeworkCompletion: number;
    hasOverduePayment: boolean;
  };
  referredToTutoring?: boolean;
}

export default function MgeRiesgoIaTab() {
  const [loading, setLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<StudentRiskItem[]>([]);
  const [kpis, setKpis] = useState({
    totalEvaluated: 0,
    retentionRate: 92.5,
    criticalCount: 0,
    moderateCount: 0,
    lowRiskCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [careerFilter, setCareerFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  // Tutoring Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentRiskItem | null>(null);
  const [tutoringNotes, setTutoringNotes] = useState("");
  const [referSuccessMsg, setReferSuccessMsg] = useState("");
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchAttritionRiskReport();
      if (data && data.students) {
        setStudents(data.students);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error("Error loading attrition risk report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentDni.includes(searchQuery);

      const matchesCareer =
        careerFilter === "all" ||
        (careerFilter === "electronica" && s.career.includes("Electricidad")) ||
        (careerFilter === "contabilidad" && s.career.includes("Contabilidad"));

      const matchesRisk =
        riskFilter === "all" || s.riskLevel === riskFilter;

      return matchesSearch && matchesCareer && matchesRisk;
    });
  }, [students, searchQuery, careerFilter, riskFilter]);

  const handleOpenReferralModal = (student: StudentRiskItem) => {
    setSelectedStudent(student);
    setTutoringNotes(
      `Estudiante derivado por alerta de IA (${student.riskLevel}). Motivo principal: ${student.primaryCause}. Recomendación: ${student.recommendation}`
    );
    setReferSuccessMsg("");
  };

  const handleConfirmReferral = async () => {
    if (!selectedStudent) return;
    setIsSubmittingReferral(true);
    try {
      await referStudentToTutoring(selectedStudent.studentDni, tutoringNotes);
      setStudents((prev) =>
        prev.map((s) =>
          s.studentDni === selectedStudent.studentDni ? { ...s, referredToTutoring: true } : s
        )
      );
      setReferSuccessMsg(
        `¡Caso del estudiante ${selectedStudent.studentName} derivado formalmente a Consejería y Tutoría!`
      );
      setTimeout(() => {
        setSelectedStudent(null);
        setReferSuccessMsg("");
      }, 2000);
    } catch (err) {
      console.error("Error referring student:", err);
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#9F062A]/10 text-[#9F062A] text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#9F062A]/20 flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-[#9F062A]" />
              MACHINE LEARNING • XAI
            </span>
            <span className="text-slate-400 text-xs font-semibold">Semestre 2026-I</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
            Riesgo Académico IA
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Sistema predictivo de alerta temprana para la prevención de deserción estudiantil y desaprobación por inasistencias (DPI).
          </p>
        </div>

        <button
          onClick={loadReport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar Inferencia</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 shadow-3xs p-5 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                Retención Proyectada
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
                {kpis.retentionRate}%
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                {kpis.totalEvaluated} estudiantes monitoreados
              </p>
            </div>
            <div className="p-3 bg-red-50 text-[#9F062A] rounded-xl border border-red-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-rose-200 shadow-3xs p-5 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest leading-none">
                Riesgo Crítico (DPI / Abandono)
              </p>
              <p className="text-2xl font-black text-rose-700 mt-1.5 font-mono">
                {kpis.criticalCount}
              </p>
              <p className="text-[10px] text-rose-600 font-semibold mt-1">
                Requieren citación inmediata
              </p>
            </div>
            <div className="p-3 bg-rose-100 text-rose-700 rounded-xl border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-amber-200 shadow-3xs p-5 bg-amber-50/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none">
                Riesgo Moderado
              </p>
              <p className="text-2xl font-black text-amber-700 mt-1.5 font-mono">
                {kpis.moderateCount}
              </p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                Seguimiento preventivo
              </p>
            </div>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border border-emerald-200 shadow-3xs p-5 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">
                Rendimiento Favorable
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-1.5 font-mono">
                {kpis.lowRiskCount}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                Asistencia y notas óptimas
              </p>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Normative & Model Explanatory Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#9F062A] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-slate-900">
            Criterios de Ponderación Normativa (MINEDU & IESTP San Francisco de Asís):
          </p>
          <p className="leading-relaxed text-slate-600 font-medium">
            El modelo pondera: <strong>Inasistencias (35%)</strong> (límite crítico del 30% inhabilita automáticamente por DPI),{" "}
            <strong>Promedio Ponderado Inicial (30%)</strong> (nota mínima aprobatoria de 13),{" "}
            <strong>Cumplimiento en Aula Virtual (15%)</strong>, <strong>Estado de Matrícula (10%)</strong> y{" "}
            <strong>Factor de Turno (10%)</strong>.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por DNI o Nombres del estudiante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#9F062A] bg-white shadow-3xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Career Filter */}
          <select
            value={careerFilter}
            onChange={(e) => setCareerFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-3xs"
          >
            <option value="all">Todas las Carreras</option>
            <option value="electronica">Electricidad Industrial</option>
            <option value="contabilidad">Contabilidad Financiera</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-3xs"
          >
            <option value="all">Todos los Niveles de Riesgo</option>
            <option value="CRITICO">🔴 Riesgo Crítico</option>
            <option value="MODERADO">🟡 Riesgo Moderado</option>
            <option value="BAJO">🟢 Bajo Riesgo</option>
          </select>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Estudiante
                </th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Carrera / Turno
                </th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Asistencia
                </th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Promedio
                </th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-center">
                  Score / Nivel IA
                </th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Causa Raíz Detectada (XAI)
                </th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                    No se encontraron estudiantes que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isCritical = st.riskLevel === "CRITICO";
                  const isModerate = st.riskLevel === "MODERADO";

                  return (
                    <tr key={st.studentDni} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{st.studentName}</div>
                        <div className="text-[10px] font-mono font-medium text-slate-400">
                          DNI: {st.studentDni}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{st.career}</div>
                        <div className="text-[10px] text-slate-500">
                          {st.cycle} • Turno {st.shift}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              st.metrics.attendanceRate < 72
                                ? "text-rose-600"
                                : st.metrics.attendanceRate < 82
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {st.metrics.attendanceRate}%
                          </span>
                          {st.metrics.attendanceRate < 72 && (
                            <span
                              className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold"
                              title="Peligro de inhabilitación por DPI (>30% inasistencias)"
                            >
                              DPI
                            </span>
                          )}
                        </div>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              st.metrics.attendanceRate < 72
                                ? "bg-rose-500"
                                : st.metrics.attendanceRate < 82
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${st.metrics.attendanceRate}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                            st.metrics.currentGpa < 11
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : st.metrics.currentGpa < 13
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {st.metrics.currentGpa.toFixed(1)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                              isCritical
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isModerate
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {st.riskLevel} ({(st.riskScore * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                          {st.primaryCause}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {st.referredToTutoring ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Derivado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenReferralModal(st)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                              isCritical
                                ? "bg-[#9F062A] hover:bg-[#800521] text-white shadow-xs active:scale-95"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {isCritical ? "Derivar a Tutoría" : "Ver Detalle"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ficha de Consejería y Tutoría Académica */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#9F062A] tracking-widest block">
                  EXPEDIENTE DE SEGUIMIENTO ACADÉMICO
                </span>
                <h3 className="text-lg font-black text-slate-900 uppercase mt-0.5">
                  Ficha de Intervención • {selectedStudent.studentName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">DNI: {selectedStudent.studentDni} • {selectedStudent.career}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {referSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{referSuccessMsg}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Metrics Breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Asistencia</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {selectedStudent.metrics.attendanceRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Promedio</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {selectedStudent.metrics.currentGpa.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tareas Entregadas</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {selectedStudent.metrics.homeworkCompletion}%
                    </span>
                  </div>
                </div>

                {/* Primary Cause Alert Box */}
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    selectedStudent.riskLevel === "CRITICO"
                      ? "bg-rose-50 border-rose-200 text-rose-950"
                      : "bg-amber-50 border-amber-200 text-amber-950"
                  }`}
                >
                  <p className="font-extrabold uppercase text-[10px] tracking-wide">
                    Diagnóstico IA (Causa Principal):
                  </p>
                  <p className="font-medium leading-relaxed">{selectedStudent.primaryCause}</p>
                  <p className="pt-1 text-[11px] font-semibold text-slate-700">
                    <strong>Acción recomendada:</strong> {selectedStudent.recommendation}
                  </p>
                </div>

                {/* Intervention Form Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-700 block">
                    Observaciones y Plan de Acción para Tutoría:
                  </label>
                  <textarea
                    rows={3}
                    value={tutoringNotes}
                    onChange={(e) => setTutoringNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-xl p-3 text-xs text-slate-900 outline-none font-medium resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReferral}
                    onClick={handleConfirmReferral}
                    className="px-4 py-2.5 bg-[#9F062A] hover:bg-[#800521] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>Confirmar y Notificar a Tutoría</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
