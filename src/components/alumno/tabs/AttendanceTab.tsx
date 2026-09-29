import React from "react";
import { 
  ChevronDown, Printer, AlertTriangle, FileText, Calendar, CreditCard, Award, User, Clock, MapPin, CheckCircle2 
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
  studentCourses?: any[];
  studentTasks?: any[];
  mpaPlanningData?: any;
  studentGroup?: any;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  enrollment,
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
  // Real enrolled courses for Ciclo I
  const currentAttendanceCourses = studentCourses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    group: studentGroup?.name || "Ciclo I - Sección A",
    attendanceRate: 100,
    statusText: "100% Asistencia",
    statusDesc: "REGULAR • AL DÍA",
    statusType: "excellent",
    sesRealizadas: "0 / 16",
    puntualidad: "100%",
    faltas: "00",
    creditos: (c.credits || 4).toString().padStart(2, "0"),
    schedule: c.schedule || "Horario Regular",
    classroom: c.classroom || "Aula Principal",
    teacher: c.teacherName || "Docente Titular"
  }));

  const totalInasistencias = 0;
  const totalAlertsCount = 0;
  const alertMsg = "Sin faltas registradas. El alumno asiste con regularidad.";

  return (
    <PageTransition id="attendance" className="space-y-6">
      {/* High Fidelity Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Control Escolar y Asistencia • Semestre 2026-I
            </span>
          </div>
          <h2 id="asis-view-main" className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Control de Asistencia del Estudiante
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Seguimiento de puntualidad, asistencias en taller y justificaciones reglamentarias
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="text-left bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl select-none">
            <span className="text-[9px] text-[#800521] font-extrabold block uppercase tracking-wider">Semestre Lectivo</span>
            <span className="text-xs font-black text-slate-800">2026-I (Ciclo I)</span>
          </div>

          <button
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Récord</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Asistencia General</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">100%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Al Día</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 block mt-2">Semestre 2026-I en curso</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Asignaturas en Formación</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{currentAttendanceCourses.length.toString().padStart(2, "0")}</span>
              <span className="text-xs font-bold text-slate-400">Cursos Oficiales</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 block mt-2">Ciclo I • Malla Curricular</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Inasistencias Totales</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">00</span>
              <span className="text-xs font-bold text-slate-400">Sesiones</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 block mt-2">Límite permitido: 30% por curso</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Alertas de Riesgo</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">00</span>
            </div>
          </div>
          <span className="text-emerald-700 text-[10px] font-bold leading-tight">{alertMsg}</span>
        </div>
      </div>

      {/* Main panel: LISTADO DE CURSOS + Right Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div id="asis-courses" className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                Listado de Asignaturas Matriculadas (Ciclo I)
              </h3>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                Periodo 2026-I
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

        {/* Right Sidebar options */}
        <aside className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block text-left">Atajos Académicos</span>

            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => setActiveTab("schedule")}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#800521] bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Calendar className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-black text-slate-800">Mi Horario</span>
              </button>

              <button 
                onClick={() => setActiveTab("classes")}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#800521] bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-black text-slate-800">Mis Cursos</span>
              </button>

              <button 
                onClick={() => setActiveTab("notas")}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#800521] bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Award className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-black text-slate-800">Notas</span>
              </button>

              <button 
                onClick={() => { setActiveTab("profile"); }}
                className="p-3 rounded-xl border border-slate-200 hover:border-[#800521] bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <User className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-black text-slate-800">Matrícula</span>
              </button>
            </div>
          </div>

          {/* Próximas Sesiones reales desde studentTasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block text-left">Próximas Sesiones Programadas</span>
            
            <div className="space-y-3">
              {studentTasks.slice(0, 3).map((task: any, tIdx: number) => {
                const courseObj = mpaPlanningData?.courses?.find((c: any) => c.id === task.courseId);
                const classroomObj = mpaPlanningData?.classrooms?.find((c: any) => c.id === task.classroomId);

                return (
                  <div key={task.id || tIdx} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3">
                    <div className="bg-red-50 border border-red-200 text-[#800521] font-black text-[10px] py-1 px-2 rounded-lg text-center leading-none tracking-tight shrink-0 flex flex-col justify-center items-center min-w-[48px]">
                      <span className="uppercase text-[8px] font-bold block mb-0.5">DÍA</span>
                      <span className="text-xs block font-bold">{task.dayOfWeek?.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-xs font-black text-slate-900 block truncate">
                        {courseObj ? courseObj.name : "Sesión Lectiva"}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" /> {task.startTime} - {task.endTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 font-semibold">
                        <MapPin className="w-3 h-3 text-indigo-600" /> {classroomObj ? classroomObj.name : "Aula Asignada"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estado Académico Real */}
          <div className="bg-[#800521] text-white rounded-2xl p-5 shadow-xs border-b-4 border-amber-400 flex flex-col items-center text-center space-y-2">
            <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Estado Académico</span>
            <div className="pt-2">
              <span className="text-[10px] text-slate-200 block uppercase font-bold">Condición de Matrícula</span>
              <span className="text-xl font-black block mt-0.5">MATRICULADO OFICIAL</span>
            </div>
            <span className="inline-block bg-white/15 text-white border border-white/20 rounded-md px-2.5 py-1 text-[9px] uppercase font-extrabold mt-2 tracking-wide select-none">
              Ciclo I • Semestre 2026-I
            </span>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
};
