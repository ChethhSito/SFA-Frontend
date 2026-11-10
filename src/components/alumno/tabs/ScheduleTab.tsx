import { useState } from "react";
import { BookOpen, CalendarDays, Clock3, LayoutGrid, ListFilter, MapPin, Printer, UserRound } from "lucide-react";
import { AcademicProgram, MpaAcademicGroup, MpaClassroom, MpaCourse, MpaPeriod, MpaProgramTask, MpaShift, StudentPersonalData } from "../../../types";
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

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
const SHIFTS = ["Mañana", "Tarde", "Noche"] as const;
type ShiftName = typeof SHIFTS[number];

function minutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]);
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function shiftFor(task: MpaProgramTask, group: MpaAcademicGroup | undefined, shifts: MpaShift[]): ShiftName {
  const start = minutes(task.startTime);
  if (start !== Number.MAX_SAFE_INTEGER) return start >= 18 * 60 ? "Noche" : start >= 12 * 60 ? "Tarde" : "Mañana";
  const shift = shifts.find((item) => item.id === (task.shiftId || group?.shiftId))?.name.toLowerCase() || "";
  return shift.includes("noche") ? "Noche" : shift.includes("tarde") ? "Tarde" : "Mañana";
}

export function ScheduleTab({ personalData, currentProgram, studentTasks = [], mpaPlanningData, studentGroup }: ScheduleTabProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");
  const shifts = mpaPlanningData.shifts || [];
  const period = mpaPlanningData.periods?.find((item) => item.id === studentGroup?.periodId);
  const sessions = [...studentTasks].sort((a, b) =>
    DAYS.indexOf(a.dayOfWeek as typeof DAYS[number]) - DAYS.indexOf(b.dayOfWeek as typeof DAYS[number])
    || minutes(a.startTime) - minutes(b.startTime));
  const groupFor = (task: MpaProgramTask) => mpaPlanningData.groups.find((item) => item.id === task.groupId);
  const activeShifts = SHIFTS.filter((shift) => sessions.some((task) => shiftFor(task, groupFor(task), shifts) === shift));
  const groupNames = [...new Set(sessions.map((task) => groupFor(task)?.name || task.groupId))];

  const renderSession = (task: MpaProgramTask) => {
    const course = mpaPlanningData.courses.find((item) => item.id === task.courseId);
    const classroom = mpaPlanningData.classrooms.find((item) => item.id === task.classroomId);
    const teacher = mpaPlanningData.teachers.find((item) => item.dni === task.teacherDni);
    const shift = shiftFor(task, groupFor(task), shifts);
    return <article key={task.id} className="rounded-xl border-l-4 border-[#800521] bg-rose-50/70 p-3 text-left shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold text-[#800521]">
        <span>{course?.code || task.courseId}</span><span>{task.sessionType} · {shift}</span>
      </div>
      <h3 className="mt-1 text-sm font-black text-slate-900">{course?.name || "Asignatura por identificar"}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Clock3 className="h-3.5 w-3.5 shrink-0" />{task.startTime} - {task.endTime}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-700"><MapPin className="h-3.5 w-3.5 shrink-0" />{classroom?.name || task.classroomId}</p>
      <p className="mt-1 text-xs text-slate-700">Grupo: {groupFor(task)?.name || task.groupId}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-700"><UserRound className="h-3.5 w-3.5 shrink-0" />{teacher ? `${teacher.name} ${teacher.lastName}` : task.teacherDni}</p>
    </article>;
  };

  return <PageTransition id="schedule" className="space-y-6 text-left">
    <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
            PORTAL DEL ESTUDIANTE • PROGRAMACIÓN SEMANAL
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
            Mi Horario Académico
          </h2>
          <p className="text-xs text-white/90 font-medium max-w-2xl">
            {currentProgram?.name || "Programa Académico"} • {groupNames.length ? groupNames.join(" · ") : studentGroup?.name || "Grupo Regular"} • Sesiones oficiales sincronizadas con MPA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex rounded-xl border border-white/20 bg-black/30 p-1 text-xs font-bold shadow-inner">
            <button type="button" aria-pressed={viewMode === "matrix"} onClick={() => setViewMode("matrix")} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${viewMode === "matrix" ? "bg-white text-slate-900 shadow-xs" : "text-white/80 hover:text-white"}`}><LayoutGrid className="h-3.5 w-3.5 text-[#800521]" />Semana</button>
            <button type="button" aria-pressed={viewMode === "cards"} onClick={() => setViewMode("cards")} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${viewMode === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-white/80 hover:text-white"}`}><ListFilter className="h-3.5 w-3.5 text-[#800521]" />Por días</button>
          </div>
          <button type="button" onClick={() => window.print()} className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30">
            <Printer className="w-3.5 h-3.5 text-[#800521]" />
            <span>Imprimir Horario</span>
          </button>
        </div>
      </div>
    </div>

    {!sessions.length ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Tu grupo todavía no tiene sesiones programadas en MPA.</div> : <>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Asignaturas</p><p className="text-xl font-black text-[#800521]">{new Set(sessions.map((task) => task.courseId)).size}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Sesiones semanales</p><p className="text-xl font-black text-[#800521]">{sessions.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Turnos con clases</p><p className="mt-1 text-sm font-bold text-slate-800">{activeShifts.join(" · ")}</p></div>
      </div>

      {viewMode === "matrix" ? <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <thead><tr className="bg-slate-50"><th className="w-28 border-b border-r p-3 text-xs font-black uppercase text-slate-700">Turno</th>{DAYS.map((day) => <th key={day} className="border-b border-r p-3 text-center text-xs font-black uppercase text-slate-700 last:border-r-0">{day}</th>)}</tr></thead>
          <tbody>{activeShifts.map((shift) => <tr key={shift}>
            <th scope="row" className="border-r border-b bg-slate-50 p-3 align-top text-xs font-black text-slate-800">{shift}</th>
            {DAYS.map((day) => {
              const daySessions = sessions.filter((task) => task.dayOfWeek === day && shiftFor(task, groupFor(task), shifts) === shift);
              return <td key={day} className="min-w-40 border-r border-b p-2 align-top last:border-r-0"><div className="space-y-2">{daySessions.map(renderSession)}{!daySessions.length && <p className="py-5 text-center text-xs text-slate-400">Sin clases</p>}</div></td>;
            })}
          </tr>)}</tbody>
        </table>
      </div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{DAYS.map((day) => {
        const daySessions = sessions.filter((task) => task.dayOfWeek === day);
        return <section key={day} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="mb-3 border-b pb-2 text-sm font-black uppercase text-slate-800">{day}</h3><div className="space-y-3">{daySessions.map(renderSession)}{!daySessions.length && <p className="text-sm text-slate-400">Sin clases</p>}</div></section>;
      })}</div>}
    </>}
  </PageTransition>;
}
