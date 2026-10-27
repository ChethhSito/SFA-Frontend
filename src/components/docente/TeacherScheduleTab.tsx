import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, RefreshCw, Users } from 'lucide-react';
import { MpaAcademicGroup, MpaClassroom, MpaCourse, MpaPeriod, MpaProgramTask, MpaShift } from '../../types';

export interface TeacherScheduleData {
  periods: MpaPeriod[];
  groups: MpaAcademicGroup[];
  tasks: MpaProgramTask[];
  courses: MpaCourse[];
  classrooms: MpaClassroom[];
  shifts: MpaShift[];
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] as const;

function minutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hours = Number(match[1]);
  if (match[3]) hours = (hours % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hours * 60 + Number(match[2]);
}

export default function TeacherScheduleTab({ teacherDni, data, loading, error, onReload }: {
  teacherDni: string;
  data: TeacherScheduleData | null;
  loading: boolean;
  error: string;
  onReload: () => void;
}) {
  const [requestedPeriodId, setRequestedPeriodId] = useState('');
  const [view, setView] = useState<'matrix' | 'list'>('matrix');

  const groupById = useMemo(() => new Map((data?.groups || []).map((item) => [item.id, item])), [data]);
  const courseById = useMemo(() => new Map((data?.courses || []).map((item) => [item.id, item])), [data]);
  const classroomById = useMemo(() => new Map((data?.classrooms || []).map((item) => [item.id, item])), [data]);
  const shiftById = useMemo(() => new Map((data?.shifts || []).map((item) => [item.id, item])), [data]);

  const assignedTasks = useMemo(() => (data?.tasks || []).filter((task) =>
    task.teacherDni === teacherDni && groupById.has(task.groupId),
  ), [data, teacherDni, groupById]);
  const periodIds = new Set(assignedTasks.map((task) => groupById.get(task.groupId)?.periodId));
  const periods = (data?.periods || []).filter((period) => periodIds.has(period.id));
  const selectedPeriod = periods.find((period) => period.id === requestedPeriodId)
    || periods.find((period) => period.isActive)
    || [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  const sessions = assignedTasks.filter((task) => groupById.get(task.groupId)?.periodId === selectedPeriod?.id)
    .sort((a, b) => DAYS.indexOf(a.dayOfWeek as typeof DAYS[number]) - DAYS.indexOf(b.dayOfWeek as typeof DAYS[number])
      || minutes(a.startTime) - minutes(b.startTime));

  const renderSession = (task: MpaProgramTask) => {
    const course = courseById.get(task.courseId);
    const group = groupById.get(task.groupId);
    const classroom = classroomById.get(task.classroomId);
    const shift = shiftById.get(task.shiftId || group?.shiftId || '');
    return <article key={task.id} className="rounded-xl border-l-4 border-[#800521] bg-rose-50/60 p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="text-xs font-black text-[#800521]">{course?.code || task.courseId}</span>
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{task.sessionType}</span>
      </div>
      <h3 className="mt-1 text-sm font-bold text-slate-900">{course?.name || 'Asignatura pendiente de identificar'}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700"><Clock3 className="h-3.5 w-3.5" /> {task.startTime} - {task.endTime}{shift ? ` · ${shift.name}` : ''}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-700"><Users className="h-3.5 w-3.5" /> {group?.name || task.groupId}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-700"><MapPin className="h-3.5 w-3.5" /> {classroom?.name || task.classroomId}</p>
    </article>;
  };

  return <section className="space-y-6 text-left">
    <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm">
      <div className="flex items-center gap-3"><CalendarDays className="h-7 w-7 text-amber-300" /><div>
        <h1 className="text-xl font-black">Mi horario docente</h1>
        <p className="mt-1 text-sm text-rose-50">Sesiones semanales asignadas en Planificación Académica (MPA)</p>
      </div></div>
    </header>

    <div className="flex flex-wrap items-end justify-between gap-3">
      {periods.length > 0 && <label className="block min-w-52 text-sm font-bold text-slate-700">Período
        <select value={selectedPeriod?.id || ''} onChange={(event) => setRequestedPeriodId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5">
          {periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
        </select>
      </label>}
      <div className="flex gap-2">
        <button type="button" onClick={onReload} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /> Actualizar</button>
        {sessions.length > 0 && <div className="flex rounded-lg border border-slate-300 bg-white p-1 text-xs font-bold">
          <button type="button" aria-pressed={view === 'matrix'} onClick={() => setView('matrix')} className={`rounded px-3 py-1.5 ${view === 'matrix' ? 'bg-[#800521] text-white' : 'text-slate-600'}`}>Semana</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`rounded px-3 py-1.5 ${view === 'list' ? 'bg-[#800521] text-white' : 'text-slate-600'}`}>Por días</button>
        </div>}
      </div>
    </div>

    {loading && <p role="status" className="text-sm text-slate-600">Cargando horario desde MPA...</p>}
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    {!loading && !error && !sessions.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No hay sesiones programadas para este docente en MPA.</p>}

    {!loading && !error && selectedPeriod && sessions.length > 0 && <>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Período</p><p className="mt-1 font-black text-slate-900">{selectedPeriod.name}</p><p className="text-xs text-slate-600">{selectedPeriod.startDate} al {selectedPeriod.endDate}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Asignaturas</p><p className="mt-1 text-xl font-black text-[#800521]">{new Set(sessions.map((task) => task.courseId)).size}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Sesiones semanales</p><p className="mt-1 text-xl font-black text-[#800521]">{sessions.length}</p></div>
      </div>
      {view === 'matrix' ? <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[960px] w-full border-collapse text-left"><thead><tr>{DAYS.map((day) => <th key={day} className="w-1/6 border-b border-r border-slate-200 bg-slate-50 p-3 text-center text-xs font-black uppercase text-slate-700 last:border-r-0">{day}</th>)}</tr></thead>
          <tbody><tr>{DAYS.map((day) => <td key={day} className="align-top border-r border-slate-200 p-3 last:border-r-0"><div className="space-y-3">
            {sessions.filter((task) => task.dayOfWeek === day).map(renderSession)}
            {!sessions.some((task) => task.dayOfWeek === day) && <p className="py-5 text-center text-xs text-slate-400">Sin clases</p>}
          </div></td>)}</tr></tbody>
        </table>
      </div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{DAYS.map((day) => <div key={day} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 border-b pb-2 text-sm font-black uppercase text-slate-800">{day}</h2>
        <div className="space-y-3">{sessions.filter((task) => task.dayOfWeek === day).map(renderSession)}
          {!sessions.some((task) => task.dayOfWeek === day) && <p className="text-sm text-slate-400">Sin clases</p>}</div>
      </div>)}</div>}
    </>}
  </section>;
}
