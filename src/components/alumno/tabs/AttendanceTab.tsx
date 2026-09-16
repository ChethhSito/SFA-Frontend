import React from "react";
import { 
  ChevronDown, Printer, AlertTriangle, FileText, Info, Calendar, CreditCard, Award, User, Clock, MapPin 
} from "lucide-react";
import { Enrollment } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface AttendanceTabProps {
  enrollment: Enrollment;
  selectedAttendanceSemester: string;
  setSelectedAttendanceSemester: React.Dispatch<React.SetStateAction<string>>;
  expandedAttendanceCourse: string | null;
  setExpandedAttendanceCourse: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: (tab: any) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  enrollment,
  selectedAttendanceSemester,
  setSelectedAttendanceSemester,
  expandedAttendanceCourse,
  setExpandedAttendanceCourse,
  setActiveTab
}) => {
  const getAttendanceCourses = () => {
    const prog = enrollment.programId; // "electronica" | "contabilidad"
    const sem = selectedAttendanceSemester; // "2026-I" | "2025-II" | "2025-I"
    
    if (prog === "electronica") {
      if (sem === "2026-I") {
        return [
          {
            id: "circuitos-ii",
            code: "EE-501",
            name: "Teoría de Circuitos II",
            group: "EE-51",
            attendanceRate: 98,
            statusText: "98% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "14 / 14",
            puntualidad: "100%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 14, date: "24 Mayo 2026", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              { num: 13, date: "17 Mayo 2026", time: "08:02 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              { num: 12, date: "10 Mayo 2026", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          },
          {
            id: "maquinas",
            code: "EE-502",
            name: "Lab. Maquinarias de Potencia",
            group: "EE-51",
            attendanceRate: 94,
            statusText: "94% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "14 / 14",
            puntualidad: "93%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 14, date: "25 Mayo 2026", time: "08:12 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" },
              { num: 13, date: "18 Mayo 2026", time: "08:02 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          },
          {
            id: "control-ii",
            code: "EE-503",
            name: "Sistemas de Control Automático II",
            group: "EE-52",
            attendanceRate: 75,
            statusText: "75% Asistencia",
            statusDesc: "RIESGO DE DESAPROBACIÓN",
            statusType: "danger",
            sesRealizadas: "10 / 14",
            puntualidad: "80%",
            faltas: "03",
            creditos: "03",
            sessions: [
              { num: 14, date: "26 Mayo 2026", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
              { num: 13, date: "19 Mayo 2026", time: "10:05 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" },
              { num: 12, date: "12 Mayo 2026", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" }
            ]
          }
        ];
      } else if (sem === "2025-II") {
        return [
          {
            id: "maquinas-cc",
            code: "EE-401",
            name: "Máquinas de Corriente Continua",
            group: "EE-41",
            attendanceRate: 96,
            statusText: "96% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "16 / 16",
            puntualidad: "98%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 16, date: "12 Nov 2025", time: "08:01 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              { num: 15, date: "05 Nov 2025", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          },
          {
            id: "neumatica",
            code: "EE-402",
            name: "Sistemas Neumáticos e Hidráulicos",
            group: "EE-41",
            attendanceRate: 71,
            statusText: "71% Asistencia",
            statusDesc: "RIESGO DE DESAPROBACIÓN",
            statusType: "danger",
            sesRealizadas: "11 / 15",
            puntualidad: "78%",
            faltas: "04",
            creditos: "04",
            sessions: [
              { num: 15, date: "14 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
              { num: 14, date: "07 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
              { num: 13, date: "31 Oct 2025", time: "08:14 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" }
            ]
          }
        ];
      } else {
        return [
          {
            id: "circuitos-ca",
            code: "EE-301",
            name: "Circuitos de Corriente Alterna",
            group: "EE-31",
            attendanceRate: 95,
            statusText: "95% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "16 / 16",
            puntualidad: "94%",
            faltas: "01",
            creditos: "04",
            sessions: [
              { num: 16, date: "21 Jun 2025", time: "08:04 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" },
              { num: 15, date: "14 Jun 2025", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          },
          {
            id: "analogica",
            code: "EE-302",
            name: "Electrónica Analógica Aplicada",
            group: "EE-31",
            attendanceRate: 100,
            statusText: "100% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "16 / 16",
            puntualidad: "100%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 16, date: "19 Jun 2025", time: "08:01 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          }
        ];
      }
    } else {
      // Contabilidad
      if (sem === "2026-I") {
        return [
          {
            id: "c-gubernamental",
            code: "CO-501",
            name: "Contabilidad Gubernamental",
            group: "CO-51",
            attendanceRate: 96,
            statusText: "96% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "14 / 14",
            puntualidad: "95%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 14, date: "24 Mayo 2026", time: "08:01 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
              { num: 13, date: "17 Mayo 2026", time: "08:02 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          },
          {
            id: "c-eeff",
            code: "CO-502",
            name: "Formulación de Estados Financieros",
            group: "CO-51",
            attendanceRate: 98,
            statusText: "98% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "14 / 14",
            puntualidad: "98%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 14, date: "25 Mayo 2026", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          },
          {
            id: "c-auditoria",
            code: "CO-503",
            name: "Auditoría Financiera Integral",
            group: "CO-52",
            attendanceRate: 78,
            statusText: "78% Asistencia",
            statusDesc: "RIESGO DE DESAPROBACIÓN",
            statusType: "danger",
            sesRealizadas: "11 / 14",
            puntualidad: "82%",
            faltas: "02",
            creditos: "03",
            sessions: [
              { num: 14, date: "26 Mayo 2026", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
              { num: 13, date: "19 Mayo 2026", time: "10:11 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" }
            ]
          }
        ];
      } else if (sem === "2025-II") {
        return [
          {
            id: "c-costos",
            code: "CO-401",
            name: "Contabilidad de Costos Financieros",
            group: "CO-41",
            attendanceRate: 93,
            statusText: "93% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "15 / 15",
            puntualidad: "94%",
            faltas: "01",
            creditos: "04",
            sessions: [
              { num: 15, date: "12 Nov 2025", time: "08:10 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" }
            ]
          },
          {
            id: "c-trib",
            code: "CO-402",
            name: "Auditoría Tributaria Corporativa",
            group: "CO-41",
            attendanceRate: 74,
            statusText: "74% Asistencia",
            statusDesc: "RIESGO DE DESAPROBACIÓN",
            statusType: "danger",
            sesRealizadas: "11 / 15",
            puntualidad: "80%",
            faltas: "04",
            creditos: "04",
            sessions: [
              { num: 15, date: "14 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
              { num: 14, date: "07 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" }
            ]
          }
        ];
      } else {
        return [
          {
            id: "c-ind",
            code: "CO-301",
            name: "Contabilidad de Costos Industriales",
            group: "CO-31",
            attendanceRate: 97,
            statusText: "97% Asistencia",
            statusDesc: "ESTADO: EXCELENTE",
            statusType: "excellent",
            sesRealizadas: "16 / 16",
            puntualidad: "98%",
            faltas: "00",
            creditos: "04",
            sessions: [
              { num: 16, date: "21 Jun 2025", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
            ]
          }
        ];
      }
    }
  };

  const currentAttendanceCourses = getAttendanceCourses();
  const globalAttendanceRate = Math.round(currentAttendanceCourses.reduce((sum, c) => sum + c.attendanceRate, 0) / (currentAttendanceCourses.length || 1));
  const totalInasistencias = currentAttendanceCourses.reduce((sum, c) => sum + parseInt(c.faltas || "0", 10), 0);
  const riskyCourses = currentAttendanceCourses.filter(c => c.attendanceRate < 80);
  const totalAlertsCount = riskyCourses.length;
  const alertMsg = totalAlertsCount > 0 
    ? `${riskyCourses[0].name}: ${100 - riskyCourses[0].attendanceRate}% inasistencias`
    : "Sin alertas críticas este semestre";

  return (
    <PageTransition id="attendance" className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h2 id="asis-title" className="text-xl font-black text-slate-900 tracking-tight font-display mb-1">Control de Asistencia</h2>
          <p className="text-xs text-slate-500 font-bold">Monitorea tu puntualidad y estado académico por curso.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              id="semestre-asis-select"
              value={selectedAttendanceSemester}
              onChange={(e) => setSelectedAttendanceSemester(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-black py-1.5 pl-3 pr-8 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#800521] shadow-xs"
            >
              <option value="2026-I">Periodo 2026-I (Actual)</option>
              <option value="2025-II">Periodo 2025-II</option>
              <option value="2025-I">Periodo 2025-I</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button 
            onClick={() => alert(`Imprimiendo reporte consolidado de inasistencias para el Periodo ${selectedAttendanceSemester}...`)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Imprimir
          </button>
        </div>
      </div>

      {/* 3 Metric cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-left relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Asistencia Global</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-950">{globalAttendanceRate}%</span>
              <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                ↑ {globalAttendanceRate >= 90 ? "+3%" : "+1%"}
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded mt-3 relative">
            <div className="bg-[#800521] h-full rounded" style={{ width: `${globalAttendanceRate}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-left flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Inasistencias Totales</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-950">{totalInasistencias.toString().padStart(2, "0")} <span className="text-xs font-bold text-slate-400">Sesiones</span></span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 block mt-2">Límite permitido: 12 por curso</span>
        </div>

        <div className={`${totalAlertsCount > 0 ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100"} border rounded-xl p-5 shadow-sm text-left flex flex-col justify-between min-h-[110px]`}>
          <div>
            <div className="flex justify-between items-center">
              <span className={`${totalAlertsCount > 0 ? "text-rose-700" : "text-slate-400"} text-[10px] font-black uppercase tracking-wider block`}>Alertas de Riesgo</span>
              <AlertTriangle className={`w-4 h-4 ${totalAlertsCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-300"} shrink-0`} />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${totalAlertsCount > 0 ? "text-rose-700 animate-pulse" : "text-slate-900"}`}>{totalAlertsCount.toString().padStart(2, "0")}</span>
            </div>
          </div>
          <span className={`${totalAlertsCount > 0 ? "text-rose-700" : "text-slate-500"} text-[10px] font-bold leading-tight`}>{alertMsg}</span>
        </div>
      </div>

      {/* Main panel: LISTADO DE CURSOS + Right Sidebar options */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div id="asis-courses" className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Listado de Cursos</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedAttendanceSemester === "2026-I" ? "Mayo 2026" : selectedAttendanceSemester === "2025-II" ? "Noviembre 2025" : "Junio 2025"}</span>
            </div>

            <div className="space-y-3">
              {currentAttendanceCourses.map((c, idx) => {
                const isOpen = expandedAttendanceCourse === c.id || (expandedAttendanceCourse === "redes" && idx === 0);
                return (
                  <div key={c.id} className="border border-slate-100 rounded-lg overflow-hidden transition-all duration-200">
                    <div 
                      onClick={() => setExpandedAttendanceCourse(isOpen ? null : c.id)}
                      className="p-4 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none border-b border-transparent transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div className="text-left">
                          <span className="text-slate-805 font-bold text-xs block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">Grupo: {c.group}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div className="text-right">
                          <span className={`text-xs font-black block ${c.attendanceRate < 80 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                            {c.statusText}
                          </span>
                          <span className={`text-[9px] font-bold block uppercase tracking-wider ${
                            c.statusType === "danger" ? "text-rose-600" : c.statusType === "excellent" ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {c.statusDesc}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "transform rotate-180 text-slate-600" : ""}`} />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="bg-slate-50 border-t border-slate-100/70 p-4 space-y-4 text-left">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Sesiones Realizadas</span>
                            <span className="text-xs font-black text-slate-800 block mt-2">{c.sesRealizadas}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Puntualidad</span>
                            <span className="text-xs font-black text-slate-800 block mt-2">{c.puntualidad}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Faltas Injustificadas</span>
                            <span className="text-xs font-black text-slate-800 block mt-2">{c.faltas}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Créditos</span>
                            <span className="text-xs font-black text-slate-800 block mt-2">{c.creditos}</span>
                          </div>
                        </div>

                        <div className="overflow-x-auto bg-white rounded-lg border border-slate-100">
                          <table className="w-full text-xs text-left border-collapse font-sans font-semibold">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-bold text-slate-400">
                                <th className="p-3">Sesión</th>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Hora Marcación</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {c.sessions.map((ses, sIdx) => (
                                <tr key={sIdx} className="hover:bg-slate-50/40">
                                  <td className="p-3 text-slate-800 font-extrabold text-[12.5px]">Sesión {ses.num}</td>
                                  <td className="p-3 font-semibold">{ses.date}</td>
                                  <td className="p-3 font-mono font-bold">{ses.time}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border inline-block select-none ${ses.style}`}>
                                      {ses.labelName}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <button 
                                      onClick={() => alert(`Consulta Detalle: Sesión ${ses.num} del curso ${c.name}. Registrada en intranet oficial.`)}
                                      className="text-slate-400 hover:text-[#800521] p-1 rounded transition-all"
                                    >
                                      <Info className="w-4 h-4 inline-block" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-4 items-center text-[10px] font-bold text-slate-500">
            <span className="text-slate-400 uppercase tracking-widest text-[9px] block">Leyenda:</span>
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-[9px]">P</span> Presencial (Presente)</span>
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-[9px]">T</span> Tardanza</span>
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-[9px]">J</span> Justificado</span>
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-black text-[9px]">F</span> Falta</span>
          </div>
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Atajos Académicos</span>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveTab("schedule")}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Calendar className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] font-black text-slate-700">Horario</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("profile")}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <CreditCard className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] font-black text-slate-700">Pagos</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("closure")}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Award className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] font-black text-slate-700">Notas</span>
              </button>

              <button 
                onClick={() => alert("Simulación: Abriendo matrícula online para pre-registro modular...")}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <User className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] font-black text-slate-700">Matrícula</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block text-left">Próximas Sesiones</span>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/45 flex items-start gap-3">
                <div className="bg-amber-100 border border-amber-200 text-amber-800 font-black text-[10px] py-1.5 px-2 rounded-lg text-center leading-none tracking-tight shrink-0 flex flex-col justify-center items-center min-w-[50px]">
                  <span className="uppercase text-[8px] font-bold block mb-0.5">OCT</span>
                  <span className="text-sm block">25</span>
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-[11.5px] font-black text-slate-800 block truncate">Inteligencia de Negocios</span>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1 font-semibold">
                    <Clock className="w-3 h-3 text-slate-400" /> 14:00 - 18:00
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5 font-semibold">
                    <MapPin className="w-3 h-3 text-slate-400" /> Lab 402-B
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/45 flex items-start gap-3">
                <div className="bg-amber-100 border border-amber-200 text-amber-800 font-black text-[10px] py-1.5 px-2 rounded-lg text-center leading-none tracking-tight shrink-0 flex flex-col justify-center items-center min-w-[50px]">
                  <span className="uppercase text-[8px] font-bold block mb-0.5">OCT</span>
                  <span className="text-sm block">26</span>
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-[11.5px] font-black text-slate-800 block truncate">Redes y Comunicación II</span>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1 font-semibold">
                    <Clock className="w-3 h-3 text-slate-400" /> 08:00 - 10:00
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5 font-semibold">
                    <MapPin className="w-3 h-3 text-slate-400" /> Aula 201
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#800521] text-white rounded-xl p-5 shadow-sm border-b-4 border-amber-400 flex flex-col items-center text-center space-y-2">
            <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Estado Académico</span>
            <div className="pt-2">
              <span className="text-[10px] text-slate-200 block uppercase font-bold">Promedio General</span>
              <span className="text-3xl font-black block mt-0.5 font-mono">16.4</span>
            </div>
            <span className="inline-block bg-white/15 text-white border border-white/20 rounded px-2.5 py-1 text-[9px] uppercase font-extrabold mt-2 tracking-wide select-none">
              Ranking: Tercio Superior
            </span>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
};
