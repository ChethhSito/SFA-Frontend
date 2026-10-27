import { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CalendarDays, CheckCircle2, Clock3, MapPin } from 'lucide-react';
import { Enrollment, MpaAcademicGroup, MpaClassroom, MpaCourse, MpaCurriculumItem, MpaPeriod, MpaProgramTask, MpaShift } from '../../../types';
import { saveCourseRegistration } from '../../../services/courseRegistration';

interface PlanningData {
  periods: MpaPeriod[];
  groups: MpaAcademicGroup[];
  curriculum: MpaCurriculumItem[];
  curriculumVersions: { id: string; name: string }[];
  courses: MpaCourse[];
  tasks: MpaProgramTask[];
  classrooms: MpaClassroom[];
  shifts: MpaShift[];
}

function minutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.NaN;
  let hour = Number(match[1]);
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export default function CourseEnrollmentTab({ enrollment, studentGroup, data, onSaved }: {
  enrollment: Enrollment;
  studentGroup?: MpaAcademicGroup;
  data: PlanningData;
  onSaved: (enrollment: Enrollment) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!studentGroup) return;
    const legacyOverrides = enrollment.courseGroupAssignments || [];
    const current = enrollment.registeredCourses || [
      ...data.tasks.filter((task) => task.groupId === studentGroup.id && !legacyOverrides.some((item) => item.courseId === task.courseId))
        .map((task) => ({ courseId: task.courseId, groupId: task.groupId })),
      ...legacyOverrides,
    ];
    setSelected(Object.fromEntries(current.map((item) => [item.courseId, item.groupId])));
  }, [enrollment.studentDni, enrollment.registeredCourses, enrollment.courseGroupAssignments, studentGroup, data.tasks]);

  const period = data.periods.find((item) => item.id === studentGroup?.periodId);
  const version = data.curriculumVersions.find((item) => item.id === studentGroup?.curriculumVersionId);
  const curriculum = useMemo(() => {
    if (!studentGroup) return [];
    const seen = new Set<string>();
    return data.curriculum.filter((item) => item.careerId === enrollment.programId && item.cycle === studentGroup.cycle
      && (!studentGroup.curriculumVersionId || !item.versionId || item.versionId === studentGroup.curriculumVersionId)
      && !seen.has(item.courseId) && !!seen.add(item.courseId));
  }, [data.curriculum, enrollment.programId, studentGroup]);
  const eligibleIds = new Set(curriculum.map((item) => item.courseId));
  const groups = data.groups.filter((group) => group.periodId === studentGroup?.periodId
    && group.careerId === enrollment.programId && group.cycle === studentGroup?.cycle
    && (!studentGroup?.curriculumVersionId || !group.curriculumVersionId || group.curriculumVersionId === studentGroup.curriculumVersionId));
  const availableGroups = (courseId: string) => groups.filter((group) =>
    data.tasks.some((task) => task.groupId === group.id && task.courseId === courseId));
  const items = (Object.entries(selected) as [string, string][]).filter(([courseId, groupId]) => eligibleIds.has(courseId) && availableGroups(courseId).some((group) => group.id === groupId))
    .map(([courseId, groupId]) => ({ courseId, groupId }));
  const selectedSessions = items.flatMap((item) => data.tasks.filter((task) => task.courseId === item.courseId && task.groupId === item.groupId));
  let conflict = '';
  for (let i = 0; i < selectedSessions.length && !conflict; i++) {
    for (let j = i + 1; j < selectedSessions.length; j++) {
      const a = selectedSessions[i], b = selectedSessions[j];
      if (a.courseId !== b.courseId && a.dayOfWeek === b.dayOfWeek && minutes(a.startTime) < minutes(b.endTime)
        && minutes(b.startTime) < minutes(a.endTime)) {
        conflict = `Hay un cruce de horario el ${a.dayOfWeek}. Cambie uno de los grupos.`;
        break;
      }
    }
  }
  const credits = items.reduce((total, item) => total + (data.courses.find((course) => course.id === item.courseId)?.credits || 0), 0);

  const save = async () => {
    if (!items.length || conflict || !studentGroup) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const saved = await saveCourseRegistration(enrollment.studentDni, items);
      onSaved(saved);
      setMessage(`${items.length} asignatura(s) matriculada(s). Mis Cursos y Mi Horario ya usan esta selección.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la matrícula de cursos.');
    } finally {
      setSaving(false);
    }
  };

  return <section className="space-y-5 text-left">
    <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm">
      <div className="flex items-center gap-3"><BookOpenCheck className="h-7 w-7 text-amber-300" /><div>
        <h1 className="text-xl font-black">Matrícula de cursos</h1>
        <p className="mt-1 text-sm text-rose-50">Seleccione las asignaturas y grupos de su malla para el período académico.</p>
      </div></div>
    </header>
    {!studentGroup ? <p className="rounded-xl border bg-white p-5 text-sm text-slate-700">Aún no tiene un grupo académico asignado. Solicite su asignación a Secretaría Académica.</p> : <>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Período</p><p className="mt-1 font-black">{period?.name || studentGroup.periodId}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Ciclo y malla</p><p className="mt-1 font-black">Ciclo {studentGroup.cycle} · {version?.name || studentGroup.curriculumVersionId || 'Malla vigente'}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Seleccionadas</p><p className="mt-1 text-xl font-black text-[#800521]">{items.length}</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Créditos</p><p className="mt-1 text-xl font-black text-[#800521]">{credits}</p></div>
      </div>
      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">Se muestran solo asignaturas de su ciclo y malla. Un grupo aparece cuando MPA ya programó sus sesiones. Puede combinar turnos si los horarios no se cruzan.</p>
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="mr-1 inline h-4 w-4" />{message}</p>}
      {conflict && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{conflict}</p>}
      <div className="grid gap-4 lg:grid-cols-2">{curriculum.map((item) => {
        const course = data.courses.find((candidate) => candidate.id === item.courseId);
        const options = availableGroups(item.courseId);
        const chosen = options.find((group) => group.id === selected[item.courseId]);
        const sessions = data.tasks.filter((task) => task.courseId === item.courseId && task.groupId === chosen?.id);
        return <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-[#800521]">{course?.code || item.courseId}</p><h2 className="mt-1 font-black text-slate-900">{course?.name || 'Asignatura de la malla'}</h2></div><span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{course?.credits || 0} créditos</span></div>
          <label className="mt-4 block text-sm font-bold text-slate-700">Grupo y turno
            <select value={selected[item.courseId] || ''} disabled={saving || !options.length} onChange={(event) => { setSelected((previous) => ({ ...previous, [item.courseId]: event.target.value })); setMessage(''); }} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2.5 disabled:bg-slate-100">
              <option value="">Sin matricular</option>{options.map((group) => <option key={group.id} value={group.id}>{group.name} · {data.shifts.find((shift) => shift.id === group.shiftId)?.name || group.shiftId}</option>)}
            </select>
          </label>
          {chosen ? <div className="mt-3 space-y-1 border-t pt-3 text-xs text-slate-700">{sessions.map((task) => <p key={task.id} className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 shrink-0" />{task.dayOfWeek} {task.startTime}–{task.endTime} <MapPin className="ml-1 h-3.5 w-3.5 shrink-0" />{data.classrooms.find((room) => room.id === task.classroomId)?.name || task.classroomId}</p>)}</div>
            : !options.length && <p className="mt-3 text-xs text-slate-500">Aún no hay grupos programados para esta asignatura.</p>}
        </article>;
      })}</div>
      {!curriculum.length && <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">No se encontraron asignaturas para este ciclo y malla en MPA.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4" />La selección guardada aparecerá en Mi Horario y Mis Cursos.</p><button type="button" onClick={() => void save()} disabled={saving || !!conflict || !items.length || enrollment.academicStatus !== 'MATRICULADO'} className="rounded-lg bg-[#800521] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar matrícula de cursos'}</button></div>
    </>}
  </section>;
}
