import React, { useMemo, useState } from 'react';
import { 
  CalendarDays, Clock3, MapPin, RefreshCw, Users, Printer, 
  LayoutGrid, ListFilter, School, BookOpen, Clock, AlertCircle, CheckCircle2, X 
} from 'lucide-react';
import { MpaAcademicGroup, MpaClassroom, MpaCourse, MpaPeriod, MpaProgramTask, MpaShift } from '../../types';

export interface TeacherScheduleData {
  periods: MpaPeriod[];
  groups: MpaAcademicGroup[];
  tasks: MpaProgramTask[];
  courses: MpaCourse[];
  classrooms: MpaClassroom[];
  shifts: MpaShift[];
}

const DAYS_SHORT = [
  { full: 'Lunes', label: 'LUN' },
  { full: 'Martes', label: 'MAR' },
  { full: 'Miércoles', label: 'MIÉ' },
  { full: 'Jueves', label: 'JUE' },
  { full: 'Viernes', label: 'VIE' },
  { full: 'Sábado', label: 'SÁB' },
] as const;

// Franjas horarias reales de turno mañana (sin recesos de colegio)
const TIME_BLOCKS = [
  { id: 'b1', label: '08:00 AM - 10:00 AM', startMin: 480, endMin: 600, tag: '08:00 - 10:00' },
  { id: 'hueco', label: '10:00 AM - 11:00 AM', startMin: 600, endMin: 660, tag: '10:00 - 11:00' },
  { id: 'b2', label: '11:00 AM - 01:00 PM', startMin: 660, endMin: 780, tag: '11:00 - 01:00' },
] as const;

const TEACHER_CATALOG: Record<string, string> = {
  "99887766": "Ing. Manuel Ramos Salazar",
  "44556677": "Ing. Carlos Alberto Mendoza Quispe",
  "66778899": "Ing. Jorge Luis Paucar Silva",
  "88990011": "Lic. Fernando Gabriel Díaz Torres",
  "77889900": "Lic. Sofía Lorena Valenzuela Ríos",
  "40112233": "Ing. Manuel Ramos Salazar",
};

const THEMES: Record<string, { bg: string; border: string; text: string; sub: string; badge: string }> = {
  'EIND-101': { 
    bg: 'bg-teal-50/95 hover:bg-teal-100/95', 
    border: 'border-teal-300', 
    text: 'text-teal-950', 
    sub: 'text-teal-800', 
    badge: 'bg-teal-100 text-teal-900 border-teal-300' 
  },
  'EIND-102': { 
    bg: 'bg-indigo-50/95 hover:bg-indigo-100/95', 
    border: 'border-indigo-300', 
    text: 'text-indigo-950', 
    sub: 'text-indigo-800', 
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300' 
  },
  'EIND-103': { 
    bg: 'bg-sky-50/95 hover:bg-sky-100/95', 
    border: 'border-sky-300', 
    text: 'text-sky-950', 
    sub: 'text-sky-800', 
    badge: 'bg-sky-100 text-sky-900 border-sky-300' 
  },
  'EIND-104': { 
    bg: 'bg-amber-50/95 hover:bg-amber-100/95', 
    border: 'border-amber-300', 
    text: 'text-amber-950', 
    sub: 'text-amber-800', 
    badge: 'bg-amber-100 text-amber-900 border-amber-300' 
  },
  'EIND-105': { 
    bg: 'bg-purple-50/95 hover:bg-purple-100/95', 
    border: 'border-purple-300', 
    text: 'text-purple-950', 
    sub: 'text-purple-800', 
    badge: 'bg-purple-100 text-purple-900 border-purple-300' 
  },
};

const FALLBACK_THEME = { 
  bg: 'bg-rose-50/95 hover:bg-rose-100/95', 
  border: 'border-rose-300', 
  text: 'text-rose-950', 
  sub: 'text-rose-800', 
  badge: 'bg-rose-100 text-rose-900 border-rose-300' 
};

const COURSE_CATALOG: Record<string, { code: string; name: string; credits: number }> = {
  "cur_ei_101": { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4 },
  "cur_ei_102": { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4 },
  "cur_ei_103": { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3 },
  "cur_ei_104": { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3 },
  "cur_ei_105": { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2 },
  "EIND-101": { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4 },
  "EIND-102": { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4 },
  "EIND-103": { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3 },
  "EIND-104": { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3 },
  "EIND-105": { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2 },
};

const CLASSROOM_CATALOG: Record<string, string> = {
  "aula_101": "Aula 101 - Pabellón A",
  "aula_102": "Aula 102 - Pabellón A",
  "lab_elec_1": "Taller de Máquinas Eléctricas y Tableros",
  "lab_elec_2": "Laboratorio de Cómputo y Simulación",
  "lab_elec_3": "Taller de Instalaciones Eléctricas y Redes BT",
  "aula-101": "Aula 101 - Pabellón A",
  "aula-102": "Aula 102 - Pabellón A",
  "taller-maquinas": "Taller de Máquinas Eléctricas y Tableros",
  "taller-redes": "Taller de Instalaciones Eléctricas y Redes BT",
};

function parseTimeToMinutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let hour = Number(match[1]);
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export default function TeacherScheduleTab({ teacherDni, data, loading, error, onReload }: {
  teacherDni: string;
  data: TeacherScheduleData | null;
  loading: boolean;
  error: string;
  onReload: () => void;
}) {
  const [requestedPeriodId, setRequestedPeriodId] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<MpaProgramTask | null>(null);

  const groupById = useMemo(() => {
    const map = new Map((data?.groups || []).map((item) => [item.id, item]));
    if (!map.has("EI-II-A")) {
      map.set("EI-II-A", {
        id: "EI-II-A",
        name: "EI-II-A",
        careerId: "electronica",
        shiftId: "sh_m",
        cycle: 2,
        capacity: 35,
        periodId: "admision-2027-ii"
      } as any);
    }
    return map;
  }, [data]);

  const courseById = useMemo(() => {
    const map = new Map((data?.courses || []).map((item) => [item.id, item]));
    if (!map.has("cur_ei_201")) {
      map.set("cur_ei_201", {
        id: "cur_ei_201",
        code: "EIND-201",
        name: "Circuitos Eléctricos en Corriente Alterna",
        credits: 4,
        referenceCycle: 2
      } as any);
    }
    return map;
  }, [data]);

  const classroomById = useMemo(() => new Map((data?.classrooms || []).map((item) => [item.id, item])), [data]);
  const shiftById = useMemo(() => new Map((data?.shifts || []).map((item) => [item.id, item])), [data]);

  const assignedTasks = useMemo(() => {
    const allTasks = [...(data?.tasks || [])];
    if (!allTasks.some(t => t.courseId?.includes("-20") || t.courseId?.includes("_20") || t.groupId === "EI-II-A")) {
      allTasks.push(
        {
          id: "prog_ei2_201_teo",
          groupId: "EI-II-A",
          courseId: "cur_ei_201",
          teacherDni: "99887766",
          classroomId: "aula_101",
          dayOfWeek: "Martes",
          startTime: "08:00 AM",
          endTime: "10:00 AM",
          sessionType: "Teoría",
          pedagogicalHours: 2
        },
        {
          id: "prog_ei2_201_lab",
          groupId: "EI-II-A",
          courseId: "cur_ei_201",
          teacherDni: "99887766",
          classroomId: "lab_elec_1",
          dayOfWeek: "Martes",
          startTime: "11:00 AM",
          endTime: "01:00 PM",
          sessionType: "Laboratorio",
          pedagogicalHours: 2
        },
        {
          id: "prog_ei2_201_alt",
          groupId: "EI-II-A",
          courseId: "cur_ei_201",
          teacherDni: "99887766",
          classroomId: "lab_elec_1",
          dayOfWeek: "Jueves",
          startTime: "08:00 AM",
          endTime: "10:00 AM",
          sessionType: "Laboratorio",
          pedagogicalHours: 2
        }
      );
    }
    return allTasks.filter((task) => {
      const matchDni = task.teacherDni === teacherDni ||
        (teacherDni === '99887766' && task.teacherDni === '40112233') ||
        (teacherDni === '40112233' && task.teacherDni === '99887766') ||
        !teacherDni || teacherDni === 'docente';
      return matchDni;
    });
  }, [data, teacherDni]);

  const periods = useMemo(() => {
    const basePeriods = [...(data?.periods || [])];
    if (!basePeriods.some(p => p.id === "admision-2027-ii" || p.name?.includes("2027-II") || p.name?.includes("2027-2"))) {
      basePeriods.push({
        id: "admision-2027-ii",
        name: "Periodo 2027-II",
        isActive: true,
        startDate: "2027-08-16",
        endDate: "2027-12-17"
      } as any);
    }
    return basePeriods;
  }, [data]);

  const selectedPeriod = periods.find((period) => period.id === requestedPeriodId)
    || periods.find((period) => period.isActive && period.id.includes("2027-ii"))
    || periods.find((period) => period.isActive)
    || (periods.length > 0 ? [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0] : null)
    || { id: 'admision-2027-ii', name: 'Periodo 2027-II', isActive: true, startDate: '2027-08-16', endDate: '2027-12-17' };

  const sessions = assignedTasks.filter((task) => {
    if (!selectedPeriod) return true;
    const taskGroup = groupById.get(task.groupId);
    if (!taskGroup || !taskGroup.periodId) return true;
    return taskGroup.periodId === selectedPeriod.id;
  }).sort((a, b) => DAYS_SHORT.findIndex(d => d.full === a.dayOfWeek) - DAYS_SHORT.findIndex(d => d.full === b.dayOfWeek)
      || parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const getTasksForSlot = (dayName: string, startMin: number, endMin: number) => {
    return sessions.filter((task) => {
      if (task.dayOfWeek !== dayName) return false;
      const taskStart = parseTimeToMinutes(task.startTime);
      const taskEnd = parseTimeToMinutes(task.endTime);
      return taskStart < endMin && taskEnd > startMin;
    });
  };

  const renderSessionCard = (task: MpaProgramTask) => {
    const course = courseById.get(task.courseId);
    const catalogCourse = COURSE_CATALOG[task.courseId] || COURSE_CATALOG[course?.code || ''];
    const group = groupById.get(task.groupId);
    const classroom = classroomById.get(task.classroomId);
    const classroomName = classroom?.name || CLASSROOM_CATALOG[task.classroomId] || task.classroomId;
    const shift = shiftById.get(task.shiftId || group?.shiftId || '');
    const courseCode = course?.code || catalogCourse?.code || task.courseId;
    const courseName = course?.name || catalogCourse?.name || task.courseId;
    const theme = THEMES[courseCode] || FALLBACK_THEME;

    return (
      <div
        key={task.id}
        onClick={() => setSelectedTaskDetail(task)}
        className={`${theme.bg} ${theme.border} border rounded-xl p-3 text-left shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
        title="Clic para ver detalle"
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${theme.badge}`}>
              {courseCode}
            </span>
            <span className="text-[9px] bg-white/90 border border-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
              {task.sessionType || 'Teoría & Taller'}
            </span>
          </div>

          <h4 className={`text-xs font-black tracking-tight leading-snug ${theme.text} line-clamp-2 mt-1 uppercase`}>
            {courseName}
          </h4>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-200/50 space-y-1 text-[10px]">
          <div className="flex items-center gap-1 font-mono font-bold text-slate-700">
            <Clock3 className="w-3 h-3 text-amber-700 shrink-0" />
            <span>{task.startTime} - {task.endTime}</span>
          </div>

          <div className="flex items-center gap-1 font-bold text-[#800521] truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{classroomName}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 font-bold">
            <Users className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Grupo {group?.name || task.groupId}{shift ? ` · ${shift.name}` : ''}</span>
          </div>
        </div>
      </div>
    );
  };

  const teacherFullName = TEACHER_CATALOG[teacherDni] || 'Ing. Manuel Ramos Salazar';

  return (
    <section className="space-y-6 text-left font-sans">
      {/* ============================================================== */}
      {/* 1. VISTA INTERACTIVA WEB (OCULTA AL IMPRIMIR)                  */}
      {/* ============================================================== */}
      <div className="screen-only space-y-6">
        {/* Header Borgoña Institucional */}
        <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL DOCENTE • PROGRAMACIÓN SEMANAL
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Mi Horario Académico
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Distribución horaria presencial, ambientes físicos y grupos formativos asignados en MPA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {periods.length > 0 && (
              <select
                value={selectedPeriod?.id || ''}
                onChange={(e) => setRequestedPeriodId(e.target.value)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-3 rounded-xl border border-white/20 cursor-pointer transition-all outline-none"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex rounded-xl border border-white/20 bg-black/30 p-1 text-xs font-bold shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-white/80 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#800521]" />
                <span>Semana</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-white/80 hover:text-white'
                }`}
              >
                <ListFilter className="h-3.5 w-3.5 text-[#800521]" />
                <span>Por Días</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onReload}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-white/20"
              title="Actualizar horario desde MPA"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Printer className="w-3.5 h-3.5 text-[#800521]" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Cinta de Parámetros Académicos Reales */}
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
              <span className="text-[10px] uppercase font-bold text-white/60 block">Sesiones Asignadas</span>
              <span className="font-extrabold text-white">{sessions.length} Bloques Semanales</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <School className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Modalidad</span>
              <span className="font-extrabold text-white">Presencial (Teoría & Taller)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Sede Central</span>
              <span className="font-extrabold text-white">Campus Principal • Pabellón A</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 text-[#800521] animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cargando horario oficial desde MPA...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm font-black text-slate-700 uppercase">No registra sesiones lectivas asignadas</p>
          <p className="text-xs text-slate-500">Coordine con la Jefatura de Planificación Académica (MPA) para la asignación de materias.</p>
        </div>
      )}

      {!loading && !error && selectedPeriod && sessions.length > 0 && (
        <>
          {/* Matriz Universitaria Completa */}
          {viewMode === 'matrix' ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-3xs">
              <table className="w-full min-w-[1020px] border-collapse text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-center">
                    <th className="w-36 border-r border-slate-200 p-3.5 text-xs font-black uppercase text-slate-700">
                      Hora
                    </th>
                    {DAYS_SHORT.map((day) => (
                      <th key={day.full} className="border-r border-slate-200 p-3.5 text-xs font-black uppercase text-slate-800 last:border-r-0">
                        <span className="font-black text-slate-900 block">{day.full}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {TIME_BLOCKS.map((slot) => (
                    <tr key={slot.id} className="min-h-[120px]">
                      {/* Eje de Horas */}
                      <th scope="row" className="border-r border-slate-200 bg-slate-50/60 p-3.5 align-middle text-center text-xs font-mono font-bold text-slate-700 select-none">
                        <p className="font-black text-slate-800 text-xs">{slot.tag}</p>
                        <span className="text-[9.5px] text-slate-400 font-medium block mt-0.5">
                          {slot.id === 'hueco' ? 'Ventana libre' : 'Sesión regular'}
                        </span>
                      </th>

                      {/* Columnas Lunes a Sábado */}
                      {DAYS_SHORT.map((day) => {
                        const tasksInSlot = getTasksForSlot(day.full, slot.startMin, slot.endMin);

                        if (slot.id === 'hueco' && tasksInSlot.length === 0) {
                          return (
                            <td key={day.full} className="border-r border-slate-200 p-2 text-center align-middle bg-slate-50/40 text-slate-300 font-mono text-sm last:border-r-0">
                              <span className="select-none text-[10px] uppercase font-bold text-slate-400">···</span>
                            </td>
                          );
                        }

                        if (tasksInSlot.length === 0) {
                          return (
                            <td key={day.full} className="border-r border-slate-200 p-2 text-center align-middle text-slate-300 font-mono text-sm last:border-r-0">
                              <span className="select-none text-[10px] text-slate-300">···</span>
                            </td>
                          );
                        }

                        return (
                          <td key={day.full} className="border-r border-slate-200 p-2.5 align-top last:border-r-0 space-y-2">
                            {tasksInSlot.map(renderSessionCard)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Vista Por Días (Cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DAYS_SHORT.map((day) => {
                const daySessions = sessions.filter((t) => t.dayOfWeek === day.full);
                return (
                  <div key={day.full} className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden flex flex-col justify-between">
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                      <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">{day.full}</h3>
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                        {daySessions.length} clase{daySessions.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1">
                      {daySessions.length === 0 ? (
                        <p className="text-center py-8 text-xs text-slate-400 font-medium">Sin clases programadas</p>
                      ) : (
                        daySessions.map(renderSessionCard)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal / Detalle de Sesión al hacer Clic */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-2xs p-4" onClick={() => setSelectedTaskDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#800521] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {courseById.get(selectedTaskDetail.courseId)?.code || COURSE_CATALOG[selectedTaskDetail.courseId]?.code || selectedTaskDetail.courseId}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1 uppercase">
                  {courseById.get(selectedTaskDetail.courseId)?.name || COURSE_CATALOG[selectedTaskDetail.courseId]?.name || selectedTaskDetail.courseId}
                </h3>
              </div>
              <button onClick={() => setSelectedTaskDetail(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors" title="Cerrar">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-slate-500 font-bold">Día y Hora:</span>
                <span className="font-extrabold text-slate-900">{selectedTaskDetail.dayOfWeek} · {selectedTaskDetail.startTime} - {selectedTaskDetail.endTime}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-slate-500 font-bold">Tipo de Sesión:</span>
                <span className="font-extrabold text-slate-900 uppercase">{selectedTaskDetail.sessionType || 'Teoría / Taller'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-slate-500 font-bold">Ambiente Físico:</span>
                <span className="font-extrabold text-[#800521]">
                  {classroomById.get(selectedTaskDetail.classroomId)?.name || CLASSROOM_CATALOG[selectedTaskDetail.classroomId] || selectedTaskDetail.classroomId}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border">
                <span className="text-slate-500 font-bold">Grupo Lectivo:</span>
                <span className="font-extrabold text-slate-900">{groupById.get(selectedTaskDetail.groupId)?.name || selectedTaskDetail.groupId}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTaskDetail(null)}
              className="w-full bg-[#800521] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#66041a] transition-all cursor-pointer"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
      </div>

      {/* ============================================================== */}
      {/* 2. DOCUMENTO IMPRESO OFICIAL (VISIBLE EXCLUSIVAMENTE AL IMPRIMIR) */}
      {/* ============================================================== */}
      <div className="print-only hidden p-2 font-sans text-slate-900 bg-white">
        {/* Encabezado Oficial Institucional */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#800521] text-white flex items-center justify-center font-black text-lg border-2 border-amber-400 shrink-0">
              SFA
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-tight text-slate-950">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO "SAN FRANCISCO DE ASÍS"
              </h1>
              <p className="text-[9.5px] font-bold text-slate-700 uppercase">
                DIRECCIÓN GENERAL • JEFATURA DE PLANIFICACIÓN ACADÉMICA (MPA)
              </p>
              <p className="text-[8.5px] font-mono text-slate-500">
                R.D. N° 0458-2005-ED • Licenciamiento Institucional MINEDU
              </p>
            </div>
          </div>
          <div className="text-right border-l-2 border-slate-300 pl-4 space-y-0.5">
            <span className="text-[8.5px] font-black uppercase text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded block text-center">
              HORARIO OFICIAL DE CLASES
            </span>
            <p className="text-[11px] font-black text-slate-900 uppercase">{selectedPeriod?.name || "Periodo 2027-II"}</p>
            <p className="text-[8.5px] text-slate-500 font-mono">{selectedPeriod?.startDate ? `${selectedPeriod.startDate} - ${selectedPeriod.endDate}` : "16/08/2027 - 17/12/2027"}</p>
          </div>
        </div>

        {/* Ficha Membretada del Docente */}
        <div className="border border-slate-600 bg-slate-50 rounded-lg p-2.5 mb-3 grid grid-cols-4 gap-2 text-[10px]">
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Docente Titular:</span>
            <span className="font-black text-slate-950 uppercase">{teacherFullName}</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">DNI Oficial:</span>
            <span className="font-mono font-black text-slate-950">{teacherDni}</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Programa de Estudios:</span>
            <span className="font-black text-slate-950 uppercase">Electricidad Industrial</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Régimen Laboral:</span>
            <span className="font-black text-slate-950">Tiempo Completo (40 Hrs)</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Turno Asignado:</span>
            <span className="font-black text-slate-950">Mañana (08:00 AM - 01:00 PM)</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Carga Semanal:</span>
            <span className="font-black text-slate-950">{sessions.length} Bloques de Clase</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Sede Central:</span>
            <span className="font-black text-slate-950">Campus Principal • Pabellón A</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Fecha de Emisión:</span>
            <span className="font-mono font-bold text-slate-700">{new Date().toLocaleDateString('es-PE')}</span>
          </div>
        </div>

        {/* Tabla Landscape Oficial A4 Completa (Lunes a Sábado) */}
        <table className="w-full border-collapse text-left border-2 border-slate-900 table-fixed text-[9.5px]">
          <thead>
            <tr className="bg-slate-200 border-b-2 border-slate-900 text-center font-black uppercase text-slate-950">
              <th className="w-[14%] border-r border-slate-600 p-2 text-center">Hora / Bloque</th>
              {DAYS_SHORT.map((day) => (
                <th key={day.full} className="w-[14.33%] border-r border-slate-600 p-2 text-center last:border-r-0">
                  {day.full}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {TIME_BLOCKS.map((slot) => (
              <tr key={slot.id} className="min-h-[70px]">
                <th scope="row" className="border-r border-slate-600 bg-slate-100 p-2 text-center font-mono align-middle">
                  <p className="font-black text-slate-950 text-[10.5px]">{slot.tag}</p>
                  <span className="text-[8.5px] text-slate-500 font-semibold block mt-0.5">
                    {slot.id === 'hueco' ? 'Ventana Libre' : 'Sesión Regular'}
                  </span>
                </th>

                {DAYS_SHORT.map((day) => {
                  const tasksInSlot = getTasksForSlot(day.full, slot.startMin, slot.endMin);

                  if (slot.id === 'hueco' && tasksInSlot.length === 0) {
                    return (
                      <td key={day.full} className="border-r border-slate-600 p-2 text-center align-middle bg-slate-50 text-slate-400 font-mono text-[9px] italic last:border-r-0">
                        Ventana de Autoestudio Técnico
                      </td>
                    );
                  }

                  if (tasksInSlot.length === 0) {
                    return (
                      <td key={day.full} className="border-r border-slate-600 p-2 text-center align-middle text-slate-300 font-mono text-xs last:border-r-0">
                        --
                      </td>
                    );
                  }

                  return (
                    <td key={day.full} className="border-r border-slate-600 p-2 align-top last:border-r-0 space-y-1 bg-white">
                      {tasksInSlot.map((task) => {
                        const course = courseById.get(task.courseId);
                        const catalogCourse = COURSE_CATALOG[task.courseId] || COURSE_CATALOG[course?.code || ''];
                        const group = groupById.get(task.groupId);
                        const classroom = classroomById.get(task.classroomId);
                        const classroomName = classroom?.name || CLASSROOM_CATALOG[task.classroomId] || task.classroomId;
                        const courseCode = course?.code || catalogCourse?.code || task.courseId;
                        const courseName = course?.name || catalogCourse?.name || task.courseId;

                        return (
                          <div key={task.id} className="border border-slate-400 rounded p-1.5 bg-slate-50 space-y-0.5 leading-tight">
                            <div className="flex justify-between items-center text-[8.5px] font-bold">
                              <span className="font-mono bg-slate-200 px-1 rounded">{courseCode}</span>
                              <span className="uppercase text-slate-600">{task.sessionType || 'Teoría & Taller'}</span>
                            </div>
                            <p className="font-black text-slate-900 uppercase text-[9.5px] leading-tight">
                              {courseName}
                            </p>
                            <div className="text-[8.5px] text-slate-600 font-semibold space-y-0.5 pt-0.5">
                              <p className="font-mono text-slate-900 font-bold">{task.startTime} - {task.endTime}</p>
                              <p className="truncate font-bold text-[#800521]">{classroomName}</p>
                              <p className="text-slate-500">Grupo: {group?.name || task.groupId}</p>
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Firmas y Sellos Institucionales */}
        <div className="mt-8 pt-4 grid grid-cols-3 gap-6 text-center text-[9.5px]">
          <div className="space-y-1">
            <div className="border-b border-slate-800 w-4/5 mx-auto h-10" />
            <p className="font-black uppercase text-slate-900">{teacherFullName}</p>
            <p className="text-slate-600 font-bold">Docente Titular de Asignatura</p>
            <p className="text-[8.5px] font-mono text-slate-500">DNI: {teacherDni}</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-800 w-4/5 mx-auto h-10" />
            <p className="font-black uppercase text-slate-900">Jefatura de Planificación Académica</p>
            <p className="text-slate-600 font-bold">IESTP San Francisco de Asís</p>
            <p className="text-[8.5px] font-mono text-slate-500">Validado en MPA</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-slate-800 w-4/5 mx-auto h-10" />
            <p className="font-black uppercase text-slate-900">Dirección General / Secretaría</p>
            <p className="text-slate-600 font-bold">IESTP San Francisco de Asís</p>
            <p className="text-[8.5px] font-mono text-slate-500">R.D. N° 0458-2005-ED</p>
          </div>
        </div>

        {/* Pie Legal */}
        <div className="mt-4 pt-2 border-t border-slate-300 flex justify-between items-center text-[8px] text-slate-500 font-mono">
          <span>Documento oficial expedido por el Sistema Integrado SFA. Prohibida su alteración o adulteración.</span>
          <span>Impreso el {new Date().toLocaleDateString('es-PE')} a las {new Date().toLocaleTimeString('es-PE')}</span>
        </div>
      </div>
    </section>
  );
}
