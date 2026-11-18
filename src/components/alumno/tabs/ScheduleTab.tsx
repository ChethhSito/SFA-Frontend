import { useState } from "react";
import { 
  BookOpen, CalendarDays, Clock3, LayoutGrid, ListFilter, MapPin, Printer, 
  UserRound, X, CheckCircle2, Award, Users, Info
} from "lucide-react";
import { 
  AcademicProgram, MpaAcademicGroup, MpaClassroom, MpaCourse, MpaPeriod, 
  MpaProgramTask, MpaShift, StudentPersonalData 
} from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface ScheduleTabProps {
  personalData: StudentPersonalData;
  currentProgram?: AcademicProgram;
  studentTasks: MpaProgramTask[];
  mpaPlanningData: {
    courses: MpaCourse[];
    classrooms: MpaClassroom[];
    teachers: { dni: string; name: string; lastName: string }[];
    groups: MpaAcademicGroup[];
    shifts?: MpaShift[];
    periods?: MpaPeriod[];
  };
  studentGroup?: MpaAcademicGroup;
}

const DAYS_SHORT = [
  { full: "Lunes", label: "Lun" },
  { full: "Martes", label: "Mar" },
  { full: "Miércoles", label: "Mié" },
  { full: "Jueves", label: "Jue" },
  { full: "Viernes", label: "Vie" },
  { full: "Sábado", label: "Sáb." },
  { full: "Domingo", label: "Dom" },
] as const;

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"] as const;

function minutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]);
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function getStartHourString(value?: string): string {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return "08:00";
  let hour = Number(match[1]);
  if (match[3]) {
    const isPm = match[3].toUpperCase() === "PM";
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
  }
  return hour.toString().padStart(2, "0") + ":00";
}

const THEMES: Record<string, { bg: string; border: string; text: string; sub: string; badge: string }> = {
  "EIND-101": { 
    bg: "bg-teal-100/90 hover:bg-teal-200/95", 
    border: "border-teal-400/90", 
    text: "text-teal-950", 
    sub: "text-teal-800", 
    badge: "bg-teal-200/90 text-teal-900 border-teal-300" 
  },
  "EIND-102": { 
    bg: "bg-rose-100/90 hover:bg-rose-200/95", 
    border: "border-rose-400/90", 
    text: "text-rose-950", 
    sub: "text-rose-800", 
    badge: "bg-rose-200/90 text-rose-900 border-rose-300" 
  },
  "EIND-103": { 
    bg: "bg-sky-100/90 hover:bg-sky-200/95", 
    border: "border-sky-400/90", 
    text: "text-sky-950", 
    sub: "text-sky-800", 
    badge: "bg-sky-200/90 text-sky-900 border-sky-300" 
  },
  "EIND-104": { 
    bg: "bg-amber-100/90 hover:bg-amber-200/95", 
    border: "border-amber-400/90", 
    text: "text-amber-950", 
    sub: "text-amber-800", 
    badge: "bg-amber-200/90 text-amber-900 border-amber-300" 
  },
  "EIND-105": { 
    bg: "bg-purple-100/90 hover:bg-purple-200/95", 
    border: "border-purple-400/90", 
    text: "text-purple-950", 
    sub: "text-purple-800", 
    badge: "bg-purple-200/90 text-purple-900 border-purple-300" 
  },
};

const FALLBACK_THEME_LIST = [
  { bg: "bg-teal-100/90 hover:bg-teal-200/95", border: "border-teal-400", text: "text-teal-950", sub: "text-teal-800", badge: "bg-teal-200 text-teal-900" },
  { bg: "bg-rose-100/90 hover:bg-rose-200/95", border: "border-rose-400", text: "text-rose-950", sub: "text-rose-800", badge: "bg-rose-200 text-rose-900" },
  { bg: "bg-sky-100/90 hover:bg-sky-200/95", border: "border-sky-400", text: "text-sky-950", sub: "text-sky-800", badge: "bg-sky-200 text-sky-900" },
  { bg: "bg-amber-100/90 hover:bg-amber-200/95", border: "border-amber-400", text: "text-amber-950", sub: "text-amber-800", badge: "bg-amber-200 text-amber-900" },
  { bg: "bg-purple-100/90 hover:bg-purple-200/95", border: "border-purple-400", text: "text-purple-950", sub: "text-purple-800", badge: "bg-purple-200 text-purple-900" },
];

export function ScheduleTab({ personalData, currentProgram, studentTasks = [], mpaPlanningData, studentGroup }: ScheduleTabProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<MpaProgramTask | null>(null);

  const shifts = mpaPlanningData.shifts || [];
  const sessions = [...studentTasks].sort((a, b) => {
    const dayOrder = DAYS_SHORT.map((d) => d.full);
    return dayOrder.indexOf(a.dayOfWeek as any) - dayOrder.indexOf(b.dayOfWeek as any)
      || minutes(a.startTime) - minutes(b.startTime);
  });

  const groupFor = (task: MpaProgramTask) => mpaPlanningData.groups.find((item) => item.id === task.groupId);
  const groupNames = [...new Set(sessions.map((task) => groupFor(task)?.name || task.groupId))];

  const getThemeForCourse = (courseCode: string, index: number) => {
    if (THEMES[courseCode]) return THEMES[courseCode];
    return FALLBACK_THEME_LIST[index % FALLBACK_THEME_LIST.length];
  };

  const renderTaskBlock = (task: MpaProgramTask, index: number) => {
    const course = mpaPlanningData.courses.find((item) => item.id === task.courseId);
    const classroom = mpaPlanningData.classrooms.find((item) => item.id === task.classroomId);
    const teacher = mpaPlanningData.teachers.find((item) => item.dni === task.teacherDni);
    const theme = getThemeForCourse(course?.code || task.courseId, index);

    return (
      <div
        key={task.id}
        onClick={() => setSelectedTaskDetail(task)}
        className={`${theme.bg} ${theme.border} border rounded-lg p-2.5 text-left shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
        title="Presione para ver el detalle de aula y docente"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[9px] font-black font-mono px-1.5 py-0.2 rounded border ${theme.badge}`}>
              {course?.code || task.courseId}
            </span>
            <span className={`text-[8.5px] font-extrabold uppercase ${theme.sub}`}>
              {task.sessionType || "Teoría / Taller"}
            </span>
          </div>

          <h4 className={`text-xs font-black tracking-tight leading-snug ${theme.text} line-clamp-2 pt-0.5`}>
            {course?.name || "Asignatura Oficial"}
          </h4>
        </div>

        <div className={`mt-2 pt-1.5 border-t border-black/10 space-y-0.5 text-[10px] ${theme.sub} font-semibold`}>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
            <Clock3 className="w-3 h-3 text-slate-600 shrink-0" />
            <span>{task.startTime} - {task.endTime}</span>
          </div>
          <div className="flex items-center gap-1 truncate text-slate-700">
            <MapPin className="w-3 h-3 text-[#800521] shrink-0" />
            <span className="truncate">{classroom?.name || task.classroomId}</span>
          </div>
          <div className="flex items-center gap-1 truncate text-slate-600">
            <UserRound className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{teacher ? `${teacher.name} ${teacher.lastName}` : "Docente Asignado"}</span>
          </div>
        </div>
      </div>
    );
  };

  const selectedCourse = selectedTaskDetail && mpaPlanningData.courses.find((c) => c.id === selectedTaskDetail.courseId);
  const selectedClassroom = selectedTaskDetail && mpaPlanningData.classrooms.find((c) => c.id === selectedTaskDetail.classroomId);
  const selectedTeacher = selectedTaskDetail && mpaPlanningData.teachers.find((t) => t.dni === selectedTaskDetail.teacherDni);
  const selectedGroup = selectedTaskDetail && groupFor(selectedTaskDetail);

  return (
    <PageTransition id="schedule" className="space-y-6 text-left">
      {/* 1. Hero Banner Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • PROGRAMACIÓN SEMANAL
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Mi Horario Académico
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              {currentProgram?.name || "Electricidad Industrial"} • Grupo {groupNames.length ? groupNames.join(" · ") : studentGroup?.name || "EI-I-A"} • Periodo 2027-I
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex rounded-xl border border-white/20 bg-black/30 p-1 text-xs font-bold shadow-inner">
              <button
                type="button"
                aria-pressed={viewMode === "matrix"}
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  viewMode === "matrix" ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-white/80 hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#800521]" />
                <span>Semana</span>
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "cards"}
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  viewMode === "cards" ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-white/80 hover:text-white"
                }`}
              >
                <ListFilter className="h-3.5 w-3.5 text-[#800521]" />
                <span>Por Días</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Printer className="w-3.5 h-3.5 text-[#800521]" />
              <span>Imprimir Horario</span>
            </button>
          </div>
        </div>
      </div>

      {!sessions.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Tu grupo todavía no tiene sesiones programadas en MPA.
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-3xs text-left">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Asignaturas Registradas</p>
              <p className="text-2xl font-black text-[#800521] mt-1 font-mono">{new Set(sessions.map((t) => t.courseId)).size}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-3xs text-left">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sesiones Semanales</p>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{sessions.length} clases</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-3xs text-left">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Turno Académico</p>
              <p className="text-sm font-extrabold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Turno Mañana (08:00 AM - 09:40 AM)
              </p>
            </div>
          </div>

          {/* 2. Instruction Banner (Estilo Universidad) */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-3xs text-center">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Horario</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Para ver el detalle de aula y docente, presione sobre el bloque del curso
            </p>
          </div>

          {/* 3. Grid Matrix Universitaria (Lunes a Domingo con horas Y-Axis) */}
          {viewMode === "matrix" ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-3xs">
              <table className="w-full min-w-[960px] border-collapse text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-center">
                    <th className="w-20 border-r border-slate-200 p-3 text-xs font-black uppercase text-slate-700">
                      Hora
                    </th>
                    {DAYS_SHORT.map((day) => (
                      <th key={day.full} className="border-r border-slate-200 p-3 text-xs font-black uppercase text-slate-700 last:border-r-0">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {TIME_SLOTS.map((hourSlot) => (
                    <tr key={hourSlot} className="min-h-[90px]">
                      {/* Left Hour Label */}
                      <th scope="row" className="border-r border-slate-200 bg-slate-50/60 p-3 align-top text-center text-xs font-mono font-bold text-slate-500 select-none">
                        {hourSlot}
                      </th>

                      {/* Day Columns */}
                      {DAYS_SHORT.map((day) => {
                        const dayTasks = sessions.filter((task) => {
                          if (task.dayOfWeek !== day.full) return false;
                          const taskHour = getStartHourString(task.startTime);
                          return taskHour === hourSlot;
                        });

                        return (
                          <td key={day.full} className="border-r border-slate-200 p-1.5 align-top last:border-r-0 hover:bg-slate-50/50 transition-colors">
                            {dayTasks.length > 0 ? (
                              <div className="space-y-1.5">
                                {dayTasks.map((t, idx) => renderTaskBlock(t, idx))}
                              </div>
                            ) : (
                              <div className="h-16 flex items-center justify-center">
                                <span className="text-[11px] text-slate-300 font-mono select-none">···</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Vista de Tarjetas por Día */
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 text-left">
              {DAYS_SHORT.map((day) => {
                const daySessions = sessions.filter((task) => task.dayOfWeek === day.full);
                return (
                  <section key={day.full} className="rounded-xl border border-slate-200 bg-white p-4 shadow-3xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <h3 className="text-sm font-black uppercase text-slate-800">{day.full}</h3>
                      <span className="text-[10px] font-bold text-slate-400">
                        {daySessions.length} {daySessions.length === 1 ? "sesión" : "sesiones"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {daySessions.map((t, idx) => renderTaskBlock(t, idx))}
                      {!daySessions.length && (
                        <p className="text-xs text-slate-400 text-center py-4 font-medium">Sin clases programadas</p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Detail Modal al hacer clic sobre cualquier bloque de curso */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#800521] bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono">
                  {selectedCourse?.code || selectedTaskDetail.courseId}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 leading-snug">
                  {selectedCourse?.name || "Asignatura Académica"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Horario Programado</span>
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5 text-amber-700" />
                  {selectedTaskDetail.dayOfWeek} {selectedTaskDetail.startTime} - {selectedTaskDetail.endTime}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Ambiente Asignado</span>
                <p className="font-extrabold text-[#800521] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#800521]" />
                  {selectedClassroom?.name || selectedTaskDetail.classroomId}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Docente Responsable</span>
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5 text-slate-600" />
                  {selectedTeacher ? `${selectedTeacher.name} ${selectedTeacher.lastName}` : "Docente Asignado"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Grupo y Modalidad</span>
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  Grupo {selectedGroup?.name || selectedTaskDetail.groupId} • {selectedTaskDetail.sessionType || "Presencial"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTaskDetail(null)}
                className="bg-[#800521] hover:bg-[#66041a] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
