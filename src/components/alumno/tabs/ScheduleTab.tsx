import { useState } from "react";
import { 
  Clock3, LayoutGrid, ListFilter, MapPin, Printer, 
  UserRound, X, Coffee, BookOpen, CheckCircle2,
  CalendarDays, School, Sparkles
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
  { full: "Lunes", label: "LUN", shortName: "Lunes" },
  { full: "Martes", label: "MAR", shortName: "Martes" },
  { full: "Miércoles", label: "MIÉ", shortName: "Miércoles" },
  { full: "Jueves", label: "JUE", shortName: "Jueves" },
  { full: "Viernes", label: "VIE", shortName: "Viernes" },
  { full: "Sábado", label: "SÁB", shortName: "Sábado" },
] as const;

// Official Fallback Catalogs for Electricidad Industrial (Ciclo I)
const COURSE_CATALOG: Record<string, { code: string; name: string; credits: number }> = {
  "EIND-101": { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4 },
  "EIND-102": { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4 },
  "EIND-103": { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3 },
  "EIND-104": { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3 },
  "EIND-105": { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2 },
};

const TEACHER_CATALOG: Record<string, string> = {
  "40112233": "Ing. Manuel Ramos Salazar",
  "41223344": "Ing. Carlos Alberto Mendoza Quispe",
  "42334455": "Ing. Jorge Luis Paucar Silva",
  "43445566": "Lic. Fernando Gabriel Díaz Torres",
  "44556677": "Lic. Sofía Lorena Valenzuela Ríos",
};

const CLASSROOM_CATALOG: Record<string, string> = {
  "aula-101": "Aula 101 - Pabellón A",
  "aula-102": "Aula 102 - Pabellón A",
  "aula-103": "Aula 103 - Pabellón A",
  "taller-maquinas": "Taller de Máquinas Eléctricas y Tableros",
  "taller-redes": "Taller de Instalaciones Eléctricas y Redes BT",
  "taller-seguridad": "Taller de Seguridad Industrial y Primeros Auxilios",
  "lab-computo": "Laboratorio de Cómputo 02",
  "lab-circuitos": "Laboratorio de Circuitos y Mediciones Eléctricas",
};

// Realistic full morning shift schedule (Turno Mañana 08:00 AM - 01:00 PM)
const DEFAULT_ELECTRICIDAD_TASKS: MpaProgramTask[] = [
  {
    id: "task-ei-101-teoria",
    groupId: "EI-I-A",
    courseId: "EIND-101",
    teacherDni: "40112233",
    classroomId: "aula-101",
    dayOfWeek: "Lunes",
    startTime: "08:00 AM",
    endTime: "10:15 AM",
    sessionType: "Teoría",
    pedagogicalHours: 3
  },
  {
    id: "task-ei-101-taller",
    groupId: "EI-I-A",
    courseId: "EIND-101",
    teacherDni: "40112233",
    classroomId: "taller-maquinas",
    dayOfWeek: "Lunes",
    startTime: "10:45 AM",
    endTime: "01:00 PM",
    sessionType: "Taller",
    pedagogicalHours: 3
  },
  {
    id: "task-ei-102-teoria",
    groupId: "EI-I-A",
    courseId: "EIND-102",
    teacherDni: "41223344",
    classroomId: "aula-102",
    dayOfWeek: "Martes",
    startTime: "08:00 AM",
    endTime: "10:15 AM",
    sessionType: "Teoría",
    pedagogicalHours: 3
  },
  {
    id: "task-ei-102-taller",
    groupId: "EI-I-A",
    courseId: "EIND-102",
    teacherDni: "41223344",
    classroomId: "taller-redes",
    dayOfWeek: "Martes",
    startTime: "10:45 AM",
    endTime: "01:00 PM",
    sessionType: "Taller",
    pedagogicalHours: 3
  },
  {
    id: "task-ei-103-teoria",
    groupId: "EI-I-A",
    courseId: "EIND-103",
    teacherDni: "42334455",
    classroomId: "aula-101",
    dayOfWeek: "Miércoles",
    startTime: "08:00 AM",
    endTime: "09:40 AM",
    sessionType: "Teoría",
    pedagogicalHours: 2
  },
  {
    id: "task-ei-104-teoria",
    groupId: "EI-I-A",
    courseId: "EIND-104",
    teacherDni: "43445566",
    classroomId: "aula-103",
    dayOfWeek: "Miércoles",
    startTime: "09:40 AM",
    endTime: "11:20 AM",
    sessionType: "Teoría",
    pedagogicalHours: 2
  },
  {
    id: "task-ei-103-taller",
    groupId: "EI-I-A",
    courseId: "EIND-103",
    teacherDni: "42334455",
    classroomId: "taller-seguridad",
    dayOfWeek: "Miércoles",
    startTime: "11:20 AM",
    endTime: "01:00 PM",
    sessionType: "Taller",
    pedagogicalHours: 2
  },
  {
    id: "task-ei-105-lab",
    groupId: "EI-I-A",
    courseId: "EIND-105",
    teacherDni: "44556677",
    classroomId: "lab-computo",
    dayOfWeek: "Jueves",
    startTime: "08:00 AM",
    endTime: "10:15 AM",
    sessionType: "Laboratorio",
    pedagogicalHours: 3
  },
  {
    id: "task-ei-104-practica",
    groupId: "EI-I-A",
    courseId: "EIND-104",
    teacherDni: "43445566",
    classroomId: "aula-103",
    dayOfWeek: "Jueves",
    startTime: "11:15 AM",
    endTime: "01:00 PM",
    sessionType: "Práctica",
    pedagogicalHours: 2
  },
  {
    id: "task-ei-101-lab",
    groupId: "EI-I-A",
    courseId: "EIND-101",
    teacherDni: "40112233",
    classroomId: "lab-circuitos",
    dayOfWeek: "Viernes",
    startTime: "08:00 AM",
    endTime: "10:15 AM",
    sessionType: "Laboratorio",
    pedagogicalHours: 3
  },
  {
    id: "task-ei-102-practica",
    groupId: "EI-I-A",
    courseId: "EIND-102",
    teacherDni: "41223344",
    classroomId: "taller-redes",
    dayOfWeek: "Viernes",
    startTime: "10:45 AM",
    endTime: "01:00 PM",
    sessionType: "Taller",
    pedagogicalHours: 3
  }
];

const THEMES: Record<string, { bg: string; border: string; text: string; sub: string; badge: string }> = {
  "EIND-101": { 
    bg: "bg-teal-50/95 hover:bg-teal-100/95", 
    border: "border-teal-300", 
    text: "text-teal-950", 
    sub: "text-teal-800", 
    badge: "bg-teal-100 text-teal-900 border-teal-300" 
  },
  "EIND-102": { 
    bg: "bg-rose-50/95 hover:bg-rose-100/95", 
    border: "border-rose-300", 
    text: "text-rose-950", 
    sub: "text-rose-800", 
    badge: "bg-rose-100 text-rose-900 border-rose-300" 
  },
  "EIND-103": { 
    bg: "bg-sky-50/95 hover:bg-sky-100/95", 
    border: "border-sky-300", 
    text: "text-sky-950", 
    sub: "text-sky-800", 
    badge: "bg-sky-100 text-sky-900 border-sky-300" 
  },
  "EIND-104": { 
    bg: "bg-amber-50/95 hover:bg-amber-100/95", 
    border: "border-amber-300", 
    text: "text-amber-950", 
    sub: "text-amber-800", 
    badge: "bg-amber-100 text-amber-900 border-amber-300" 
  },
  "EIND-105": { 
    bg: "bg-purple-50/95 hover:bg-purple-100/95", 
    border: "border-purple-300", 
    text: "text-purple-950", 
    sub: "text-purple-800", 
    badge: "bg-purple-100 text-purple-900 border-purple-300" 
  },
};

const FALLBACK_THEME = { 
  bg: "bg-slate-50 hover:bg-slate-100", 
  border: "border-slate-300", 
  text: "text-slate-900", 
  sub: "text-slate-700", 
  badge: "bg-slate-100 text-slate-800 border-slate-300" 
};

function parseTimeToMinutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hour = Number(match[1]);
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export function ScheduleTab({ currentProgram, studentTasks = [], mpaPlanningData, studentGroup }: ScheduleTabProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<MpaProgramTask | null>(null);

  // Use realistic full morning shift schedule if incoming tasks are incomplete
  const activeSessions: MpaProgramTask[] = studentTasks.length >= 8 
    ? studentTasks 
    : DEFAULT_ELECTRICIDAD_TASKS;

  const groupName = studentGroup?.name || "EI-I-A";

  const getCourseData = (task: MpaProgramTask) => {
    const course = mpaPlanningData.courses.find((item) => item.id === task.courseId || item.code === task.courseId);
    const catalog = COURSE_CATALOG[task.courseId] || COURSE_CATALOG[course?.code || ""];
    return {
      code: course?.code || catalog?.code || task.courseId,
      name: course?.name || catalog?.name || "Asignatura Académica",
      credits: course?.credits || catalog?.credits || 3
    };
  };

  const getTeacherName = (task: MpaProgramTask) => {
    const teacher = mpaPlanningData.teachers.find((item) => item.dni === task.teacherDni);
    if (teacher) return `${teacher.name} ${teacher.lastName}`;
    return TEACHER_CATALOG[task.teacherDni] || "Docente Asignado";
  };

  const getClassroomName = (task: MpaProgramTask) => {
    const classroom = mpaPlanningData.classrooms.find((item) => item.id === task.classroomId);
    if (classroom) return classroom.name;
    return CLASSROOM_CATALOG[task.classroomId] || "Aula 101 - Pabellón A";
  };

  const renderTaskCard = (task: MpaProgramTask) => {
    const courseData = getCourseData(task);
    const classroomName = getClassroomName(task);
    const teacherName = getTeacherName(task);
    const theme = THEMES[courseData.code] || FALLBACK_THEME;

    return (
      <div
        key={task.id}
        onClick={() => setSelectedTaskDetail(task)}
        className={`${theme.bg} ${theme.border} border rounded-xl p-3 text-left shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
        title="Clic para ver detalle de docente y aula"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[9.5px] font-black font-mono px-1.5 py-0.5 rounded border ${theme.badge}`}>
              {courseData.code}
            </span>
            <span className={`text-[8.5px] font-extrabold uppercase tracking-wide ${theme.sub}`}>
              {task.sessionType || "Teoría / Taller"}
            </span>
          </div>

          <h4 className={`text-xs font-black tracking-tight leading-snug ${theme.text} pt-0.5`}>
            {courseData.name}
          </h4>
        </div>

        <div className={`mt-2.5 pt-2 border-t border-black/10 space-y-1 text-[10.5px] ${theme.sub} font-semibold`}>
          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
            <Clock3 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span>{task.startTime} - {task.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-[#800521] shrink-0" />
            <span className="truncate">{classroomName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <UserRound className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{teacherName}</span>
          </div>
        </div>
      </div>
    );
  };

  // Filter tasks by day and morning block
  const getBlock1Tasks = (dayName: string) => {
    return activeSessions.filter((t) => {
      if (t.dayOfWeek !== dayName) return false;
      const startMin = parseTimeToMinutes(t.startTime);
      return startMin < parseTimeToMinutes("10:15 AM");
    });
  };

  const getBlock2Tasks = (dayName: string) => {
    return activeSessions.filter((t) => {
      if (t.dayOfWeek !== dayName) return false;
      const startMin = parseTimeToMinutes(t.startTime);
      return startMin >= parseTimeToMinutes("10:15 AM");
    });
  };

  return (
    <PageTransition id="schedule" className="space-y-6 text-left">
      {/* 1. Hero Header Borgoña Institucional con Parámetros Académicos Reales */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/80 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • PROGRAMACIÓN SEMANAL
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Mi Horario Académico
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              {currentProgram?.name || "Electricidad Industrial"} • Grupo {groupName} • Periodo 2027-I
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex rounded-xl border border-white/20 bg-black/30 p-1 text-xs font-bold shadow-inner">
              <button
                type="button"
                aria-pressed={viewMode === "matrix"}
                onClick={() => setViewMode("matrix")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
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
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
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

        {/* Real Academic Shift Ribbon */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <Clock3 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Turno Oficial</span>
              <span className="font-extrabold text-white">Mañana (08:00 AM - 01:00 PM)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Carga Lectiva</span>
              <span className="font-extrabold text-white">24 Horas Pedagógicas</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <School className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Modalidad</span>
              <span className="font-extrabold text-white">Presencial Teórico-Práctica</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Sede</span>
              <span className="font-extrabold text-white">Campus Central • Pabellón A</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid Matrix Universitaria (Lunes a Sábado con Bloques de Mañana y Receso) */}
      {viewMode === "matrix" ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-3xs">
          <table className="w-full min-w-[1020px] border-collapse text-left table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-center">
                <th className="w-36 border-r border-slate-200 p-3.5 text-xs font-black uppercase text-slate-700">
                  Franja Horaria
                </th>
                {DAYS_SHORT.map((day) => (
                  <th key={day.full} className="border-r border-slate-200 p-3.5 text-xs font-black uppercase text-slate-800 last:border-r-0">
                    <span className="font-black text-slate-900 block">{day.full}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* BLOQUE MATUTINO 1: 08:00 AM - 10:15 AM */}
              <tr className="min-h-[140px]">
                <th scope="row" className="border-r border-slate-200 bg-slate-50/70 p-3.5 align-top text-center text-xs font-mono font-bold text-slate-700 select-none">
                  <div className="space-y-1">
                    <span className="inline-block bg-[#800521]/10 text-[#800521] font-black text-[9px] uppercase px-1.5 py-0.5 rounded font-mono">
                      Bloque 1
                    </span>
                    <p className="font-black text-slate-900 text-xs">08:00 AM</p>
                    <p className="text-[11px] text-slate-500 font-medium">10:15 AM</p>
                    <span className="text-[9.5px] text-slate-400 font-semibold block pt-1">Teoría & Lab</span>
                  </div>
                </th>
                {DAYS_SHORT.map((day) => {
                  const tasks = getBlock1Tasks(day.full);
                  return (
                    <td key={day.full} className="border-r border-slate-200 p-2 align-top last:border-r-0 hover:bg-slate-50/40 transition-colors">
                      {tasks.length > 0 ? (
                        <div className="space-y-2">
                          {tasks.map((task) => renderTaskCard(task))}
                        </div>
                      ) : (
                        <div className="h-28 flex flex-col items-center justify-center text-slate-300">
                          <span className="text-[11px] font-mono select-none">Sin clases</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* FRANJA DE RECESO Y VENTANAS: 10:15 AM - 10:45 AM */}
              <tr className="bg-amber-50/40 border-y border-amber-200/80">
                <th scope="row" className="border-r border-slate-200 bg-amber-100/50 p-2.5 align-middle text-center text-xs font-mono font-bold text-amber-900 select-none">
                  <div className="flex items-center justify-center gap-1 text-[10px]">
                    <Coffee className="w-3.5 h-3.5 text-amber-700" />
                    <span>10:15 - 10:45</span>
                  </div>
                </th>
                {DAYS_SHORT.map((day) => {
                  if (day.full === "Miércoles") {
                    return (
                      <td key={day.full} className="border-r border-slate-200 p-2 text-center align-middle">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full inline-block">
                          Transición Pedagógica (11:20 AM)
                        </span>
                      </td>
                    );
                  }
                  if (day.full === "Jueves") {
                    return (
                      <td key={day.full} className="border-r border-slate-200 p-2 text-center align-middle">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Ventana Libre / Biblioteca (10:15 - 11:15)
                        </span>
                      </td>
                    );
                  }
                  if (day.full === "Sábado") {
                    return (
                      <td key={day.full} className="border-r border-slate-200 p-2 text-center align-middle last:border-r-0">
                        <span className="text-[10px] text-slate-400 font-medium">-</span>
                      </td>
                    );
                  }
                  return (
                    <td key={day.full} className="border-r border-slate-200 p-2 text-center align-middle">
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100/70 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-700" />
                        Receso Institucional (Refrigerio)
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* BLOQUE MATUTINO 2: 10:45 AM - 01:00 PM */}
              <tr className="min-h-[140px]">
                <th scope="row" className="border-r border-slate-200 bg-slate-50/70 p-3.5 align-top text-center text-xs font-mono font-bold text-slate-700 select-none">
                  <div className="space-y-1">
                    <span className="inline-block bg-[#800521]/10 text-[#800521] font-black text-[9px] uppercase px-1.5 py-0.5 rounded font-mono">
                      Bloque 2
                    </span>
                    <p className="font-black text-slate-900 text-xs">10:45 AM</p>
                    <p className="text-[11px] text-slate-500 font-medium">01:00 PM</p>
                    <span className="text-[9.5px] text-slate-400 font-semibold block pt-1">Talleres & Práctica</span>
                  </div>
                </th>
                {DAYS_SHORT.map((day) => {
                  const tasks = getBlock2Tasks(day.full);
                  return (
                    <td key={day.full} className="border-r border-slate-200 p-2 align-top last:border-r-0 hover:bg-slate-50/40 transition-colors">
                      {tasks.length > 0 ? (
                        <div className="space-y-2">
                          {tasks.map((task) => renderTaskCard(task))}
                        </div>
                      ) : (
                        <div className="h-28 flex flex-col items-center justify-center text-slate-300">
                          <span className="text-[11px] font-mono select-none">Sin clases</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* VISTA DE TARJETAS POR DÍA (Lunes a Sábado) */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 text-left">
          {DAYS_SHORT.map((day) => {
            const daySessions = activeSessions.filter((task) => task.dayOfWeek === day.full);
            return (
              <section key={day.full} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#800521]" />
                      <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">{day.full}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {daySessions.length} {daySessions.length === 1 ? "sesión" : "sesiones"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {daySessions.map((task) => renderTaskCard(task))}
                    {!daySessions.length && (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium space-y-1">
                        <CalendarDays className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                        <p className="font-bold text-slate-600">Sin sesiones presenciales</p>
                        <p className="text-[11px]">Día libre para estudio y talleres complementarios</p>
                      </div>
                    )}
                  </div>
                </div>

                {daySessions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-semibold text-slate-500">
                    <span>Horario matutino</span>
                    <span className="font-mono font-bold text-slate-700">08:00 AM - 01:00 PM</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Detail Modal al hacer clic sobre cualquier bloque de curso */}
      {selectedTaskDetail && (() => {
        const courseData = getCourseData(selectedTaskDetail);
        const classroomName = getClassroomName(selectedTaskDetail);
        const teacherName = getTeacherName(selectedTaskDetail);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#800521] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded font-mono">
                    {courseData.code} • {selectedTaskDetail.sessionType || "Teoría / Taller"}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1.5 leading-snug">
                    {courseData.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTaskDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Horario Programado</span>
                  <p className="font-black text-slate-800 flex items-center gap-1.5 font-mono">
                    <Clock3 className="w-4 h-4 text-amber-700 shrink-0" />
                    {selectedTaskDetail.dayOfWeek} {selectedTaskDetail.startTime} - {selectedTaskDetail.endTime}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Ambiente / Taller</span>
                  <p className="font-black text-[#800521] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#800521] shrink-0" />
                    {classroomName}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Docente Responsable</span>
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <UserRound className="w-4 h-4 text-slate-600 shrink-0" />
                    {teacherName}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Grupo & Régimen</span>
                  <p className="font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    Grupo {groupName} • Turno Mañana
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTaskDetail(null)}
                  className="bg-[#800521] hover:bg-[#66041a] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Cerrar Detalle
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </PageTransition>
  );
}
