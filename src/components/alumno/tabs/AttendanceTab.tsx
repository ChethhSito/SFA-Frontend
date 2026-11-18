import React from "react";
import {
  ChevronDown, Printer, AlertTriangle, FileText, Calendar, Clock, CheckCircle2
} from "lucide-react";
import { Enrollment, AttendanceRecord } from "../../../types";
import { studentAttendanceRecords } from "../../../utils/attendance";
import PageTransition from "../../ui/PageTransition";

interface AttendanceTabProps {
  loading: boolean;
  error: string | null;
  onReload: () => Promise<boolean>;
  enrollment: Enrollment;
  studentDni?: string;
  attendance?: AttendanceRecord[];
  selectedAttendanceSemester: string;
  setSelectedAttendanceSemester: React.Dispatch<React.SetStateAction<string>>;
  expandedAttendanceCourse: string | null;
  setExpandedAttendanceCourse: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: (tab: any) => void;
  studentCourses?: any[];
  studentTasks?: any[];
  mpaPlanningData?: any;
  studentGroup?: any;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  loading,
  error,
  onReload,
  enrollment,
  studentDni,
  attendance = [],
  selectedAttendanceSemester,
  setSelectedAttendanceSemester,
  expandedAttendanceCourse,
  setExpandedAttendanceCourse,
  setActiveTab,
  studentCourses = [],
  studentTasks = [],
  mpaPlanningData,
  studentGroup
}) => {
  if (loading) return <p role="status">Cargando asistencias del servidor...</p>;
  if (error) return <div role="alert" className="text-red-700"><p>{error}</p><button type="button" onClick={() => { void onReload(); }} className="border rounded-lg p-2 mt-2">Reintentar carga</button></div>;
  const activeDni = studentDni || enrollment.studentDni;

  // Real enrolled courses for Ciclo I with live attendance calculations
  const currentAttendanceCourses = studentCourses.map((c) => {
    const courseRecords = studentAttendanceRecords(attendance, c.attendanceCourseIds || [c.id, c.code], activeDni);
    const sesDictadas = courseRecords.length;

    let asistencias = 0;
    let faltas = 0;
    let tardanzas = 0;

    courseRecords.forEach((rec) => {
      const status = rec.statusMap?.[activeDni];
      if (status === "Presente" || status === "Justificado") {
        asistencias++;
      } else if (status === "Tardanza") {
        asistencias++;
        tardanzas++;
      } else if (status === "Falta") {
        faltas++;
      }
    });

    const attendanceRate = sesDictadas > 0 ? Math.round((asistencias / sesDictadas) * 100) : null;
    const puntualidad = asistencias > 0
      ? `${Math.round(((asistencias - tardanzas) / Math.max(asistencias, 1)) * 100)}%`
      : "Sin datos";

    return {
      id: c.id,
      code: c.code,
      name: c.name,
      group: studentGroup?.name || "Ciclo I - Sección A",
      attendanceRate,
      statusText: attendanceRate === null ? "Sin datos" : `${attendanceRate}% Asistencia`,
      statusDesc: sesDictadas === 0 ? "SIN REGISTROS" : (attendanceRate >= 70 ? "REGULAR • AL DÍA" : "EN RIESGO POR FALTAS"),
      statusType: attendanceRate >= 70 ? "excellent" : "warning",
      sesRealizadas: String(sesDictadas),
      sesDictadas,
      records: courseRecords,
      puntualidad,
      faltas: faltas.toString().padStart(2, "0"),
      faltasCount: faltas,
      asistenciasCount: asistencias,
      creditos: (c.credits || 4).toString().padStart(2, "0"),
      schedule: c.schedule || "Horario Regular",
      classroom: c.classroom || "Aula Principal",
      teacher: c.teacherName || "Docente Titular"
    };
  });

  const totalInasistencias = currentAttendanceCourses.reduce((acc, c) => acc + c.faltasCount, 0);
  const totalSesiones = currentAttendanceCourses.reduce((acc, c) => acc + c.sesDictadas, 0);
  const totalAsistencias = currentAttendanceCourses.reduce((acc, c) => acc + c.asistenciasCount, 0);
  const overallRate = totalSesiones > 0 ? Math.round((totalAsistencias / totalSesiones) * 100) : null;
  const totalAlertsCount = currentAttendanceCourses.filter((c) => c.attendanceRate < 70 && c.sesDictadas > 0).length;
  const alertMsg = totalAlertsCount > 0
    ? `${totalAlertsCount} curso(s) en riesgo por inasistencias (>30% faltas reglamentarias)`
    : totalSesiones ? "No hay alertas en los registros disponibles." : "Sin asistencias registradas para evaluar.";

  return (
    <PageTransition id="attendance" className="space-y-6">
      {/* High Fidelity Header */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • CONTROL ESCOLAR
            </span>
            <h2 id="asis-view-main" className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Control de Asistencia del Estudiante
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl">
              Seguimiento de puntualidad presencial, registro de sesiones dictadas en taller y control de asistencia mínima reglamentaria del 70%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-400 font-extrabold block uppercase mb-0.5 tracking-wider">Semestre Lectivo</span>
              <span className="text-xs font-black text-white font-mono">Historial Disponible</span>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Printer className="w-3.5 h-3.5 text-[#800521]" />
              <span>Imprimir Récord</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-blue-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Asistencia General</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{overallRate === null ? "Sin datos" : `${overallRate}%`}</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-emerald-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sesiones Asistidas</span>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{totalAsistencias} / {totalSesiones}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-purple-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Inasistencias Acumuladas</span>
            <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{totalInasistencias}</p>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-amber-500 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cursos en Alerta (&lt;70%)</span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{totalAlertsCount}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>
      {/* Main panel: LISTADO DE ASIGNATURAS MATRICULADAS (Ancho Completo y Responsivo) */}
      <div id="asis-courses" className="w-full space-y-4 text-left">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
              Listado de Asignaturas Matriculadas (Ciclo I)
            </h3>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase">
              Historial de asistencia
            </span>
          </div>

          <div className="space-y-3">
            {currentAttendanceCourses.map((c) => {
              const isOpen = expandedAttendanceCourse === c.id;
              return (
                <div key={c.id} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                  <div
                    onClick={() => setExpandedAttendanceCourse(isOpen ? null : c.id)}
                    className="p-4 bg-white hover:bg-slate-50/70 flex items-center justify-between cursor-pointer select-none transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#800521] flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-slate-900 font-extrabold text-xs block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold block font-mono">
                          {c.code} • Grupo: {c.group} • {c.creditos} Créditos
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="text-right">
                        <span className="text-xs font-black block text-emerald-600">
                          {c.statusText}
                        </span>
                        <span className="text-[9px] font-bold block uppercase tracking-wider text-emerald-700">
                          {c.statusDesc}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "transform rotate-180 text-slate-600" : ""}`} />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3 text-left">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Sesiones Dictadas</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.sesRealizadas}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Puntualidad</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.puntualidad}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Faltas Injustificadas</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.faltas}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Créditos</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.creditos} Cr.</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border text-xs space-y-2">
                        <p className="font-bold">Registros diarios del alumno</p>
                        {c.records.length ? c.records.map((record) => <p key={record.id}>{record.date}: {record.statusMap[activeDni]}</p>) : <p>Sin registros de asistencia.</p>}
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Docente Titular:</span>
                          <span className="font-extrabold text-slate-800">{c.teacher}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Aula Asignada:</span>
                          <span className="font-extrabold text-slate-800">{c.classroom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Horario:</span>
                          <span className="font-mono font-bold text-[#800521]">{c.schedule}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
