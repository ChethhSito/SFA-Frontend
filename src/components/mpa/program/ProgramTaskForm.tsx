import React, { useState } from "react";
import { Trash2, LayoutDashboard } from "lucide-react";
import { 
  MpaAcademicGroup, MpaPeriod, MpaCareer, MpaCourse, 
  MpaCurriculumItem, MpaShift, MpaClassroom, MpaProgramTask 
} from "../../../types";
import { MpaCurriculumVersion } from "../tabs/CurriculumTab";
import Button from "../../ui/Button";
import { calculateEndTime, parseTimeToMinutes, hoursOverlap, getTeacherSpecialties } from "../mpaUtils";

interface ProgramTaskFormProps {
  groups: MpaAcademicGroup[];
  periods: MpaPeriod[];
  careers: MpaCareer[];
  courses: MpaCourse[];
  curriculum: MpaCurriculumItem[];
  curriculumVersions: MpaCurriculumVersion[];
  shifts: MpaShift[];
  classrooms: MpaClassroom[];
  teachers: any[];
  tasks: MpaProgramTask[];
  pedagogicalHourDuration: number;
  savePedagogicalHourDuration: (val: number) => void;
  saveDb: (key: string, value: any, setter: Function) => void;
  setTasks: React.Dispatch<React.SetStateAction<MpaProgramTask[]>>;
}

export const ProgramTaskForm: React.FC<ProgramTaskFormProps> = ({
  groups,
  periods,
  careers,
  courses,
  curriculum,
  curriculumVersions,
  shifts,
  classrooms,
  teachers,
  tasks,
  pedagogicalHourDuration,
  savePedagogicalHourDuration,
  saveDb,
  setTasks
}) => {
  const [formTask, setFormTask] = useState({
    id: "",
    groupId: "",
    courseId: "",
    teacherDni: "",
    classroomId: "",
    scheduleId: "",
    sessionType: "Teoría" as "Teoría" | "Laboratorio",
    dayOfWeek: "Lunes",
    startTime: "",
    endTime: "",
    pedagogicalHours: 3
  });

  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [teacherSpecialtyFilter, setTeacherSpecialtyFilter] = useState("all");

  const getDocenteName = (dni: string) => {
    const t = teachers.find(x => x.dni === dni);
    return t ? `${t.name} ${t.lastName}` : dni;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm text-left">
      <div className="border-b pb-2">
        <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">Programar Horario por Horas Reales</h3>
        <p className="text-[11px] text-slate-500 font-semibold mt-1">Asigne sesiones de aprendizaje detallando horas exactas, manteniendo consistencia y previniendo cruces.</p>
      </div>
      
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const computedEnd = calculateEndTime(formTask.startTime, formTask.pedagogicalHours || 3, pedagogicalHourDuration);
          
          if (!formTask.groupId || !formTask.courseId || !formTask.teacherDni || !formTask.classroomId || !formTask.dayOfWeek || !formTask.startTime || !computedEnd) {
            alert("Por favor complete todos los parámetros obligatorios (*) y asegure que la Hora de Inicio sea válida.");
            return;
          }

          const group = groups.find(g => g.id === formTask.groupId);
          if (!group) {
            alert("Grupo académico no seleccionado.");
            return;
          }

          const course = courses.find(c => c.id === formTask.courseId);
          const teacher = teachers.find(t => t.dni === formTask.teacherDni);
          const room = classrooms.find(r => r.id === formTask.classroomId);

          if (!course || !teacher || !room) {
            alert("Curso, Docente o Aula no válidos.");
            return;
          }

          const statusVal = teacher.status || "Disponible";
          if (statusVal === "Licencia" || statusVal === "Inactivo") {
            alert(`Error: El docente "${teacher.lastName}, ${teacher.name}" no está disponible para programación (Estado actual: ${statusVal}).`);
            return;
          }

          const courseTasks = tasks.filter(t => t.groupId === formTask.groupId && t.courseId === course.id);
          const programmedTheory = courseTasks
            .filter(t => t.sessionType === "Teoría")
            .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
          const programmedLab = courseTasks
            .filter(t => t.sessionType === "Laboratorio")
            .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

          const reqTheory = course.theoryHours || 0;
          const reqLab = course.labHours || 0;
          const inputHours = formTask.pedagogicalHours || 3;

          if (formTask.sessionType === "Teoría") {
            if (programmedTheory >= reqTheory) {
              alert("Las horas de teoría definidas para este curso ya fueron cubiertas.");
              return;
            }
            if (programmedTheory + inputHours > reqTheory) {
              alert(`Las horas de teoría definidas para este curso ya fueron cubiertas. Límite: ${reqTheory} hrs, Programado: ${programmedTheory} hrs, Intentando programar: ${inputHours} hrs.`);
              return;
            }
          } else if (formTask.sessionType === "Laboratorio") {
            if (programmedLab >= reqLab) {
              alert("Las horas de laboratorio definidas para este curso ya fueron cubiertas.");
              return;
            }
            if (programmedLab + inputHours > reqLab) {
              alert(`Las horas de laboratorio definidas para este curso ya fueron cubiertas. Límite: ${reqLab} hrs, Programado: ${programmedLab} hrs, Intentando programar: ${inputHours} hrs.`);
              return;
            }
          }

          if (formTask.sessionType === "Laboratorio" && room.type !== "Laboratorio") {
            alert(`Error de Infraestructura: El curso requiere un aula de tipo "Laboratorio" para sesiones prácticas. El ambiente "${room.name}" es de tipo "${room.type}".`);
            return;
          }

          if (room.capacity < group.capacity) {
            alert(`Conflicto de Capacidad: El aula "${room.name}" tiene capacidad para ${room.capacity} estudiantes, pero el grupo asignado "${group.name}" requiere capacidad para de ${group.capacity} alumnos.`);
            return;
          }

          const shift = shifts.find(s => s.id === group.shiftId);
          if (shift && shift.startTime && shift.endTime) {
            const taskMinStart = parseTimeToMinutes(formTask.startTime);
            const taskMinEnd = parseTimeToMinutes(computedEnd);
            const shiftMinStart = parseTimeToMinutes(shift.startTime);
            const shiftMinEnd = parseTimeToMinutes(shift.endTime);

            if (taskMinStart < shiftMinStart || taskMinEnd > shiftMinEnd) {
              alert(`Error de Turno: El turno asignado al Grupo Académico es "${shift.name}" (${shift.startTime} - ${shift.endTime}). La sesión programada ingresada (${formTask.startTime} - ${computedEnd}) supera los límites establecidos para este turno.`);
              return;
            }
          }

          const currentStart = formTask.startTime;
          const currentEnd = computedEnd;
          const currentDay = formTask.dayOfWeek;

          for (const t of tasks) {
            const tDay = t.dayOfWeek || "Lunes";
            const tStart = t.startTime;
            const tEnd = t.endTime;

            if (tStart && tEnd && hoursOverlap(currentDay, currentStart, currentEnd, tDay, tStart, tEnd)) {
              if (t.teacherDni === formTask.teacherDni) {
                alert(`Conflicto de Docente: El docente "${teacher.lastName}, ${teacher.name}" ya cuenta con otra sesión programada el ${currentDay} de ${tStart} a ${tEnd}.`);
                return;
              }

              if (t.classroomId === formTask.classroomId) {
                alert(`Conflicto de Aula: El ambiente físico "${room.name}" ya se encuentra reservado el ${currentDay} de ${tStart} a ${tEnd}.`);
                return;
              }

              if (t.groupId === formTask.groupId) {
                alert(`Conflicto de Grupo: El Grupo Académico "${group.name}" ya tiene clases el ${currentDay} de ${tStart} a ${tEnd}.`);
                return;
              }
            }
          }

          const newTask: MpaProgramTask = {
            id: "task_" + Date.now(),
            groupId: formTask.groupId,
            courseId: formTask.courseId,
            teacherDni: formTask.teacherDni,
            classroomId: formTask.classroomId,
            sessionType: formTask.sessionType,
            grpNum: group.name,
            subGrpNum: "0",
            dayOfWeek: currentDay,
            startTime: currentStart,
            endTime: currentEnd,
            shiftId: group.shiftId,
            sessionClassType: formTask.sessionType === "Laboratorio" ? "Lab" : "Teo",
            pedagogicalHours: inputHours
          };

          const next = [...tasks, newTask];
          saveDb("tasks", next, setTasks);

          setFormTask({
            id: "",
            groupId: "",
            courseId: "",
            teacherDni: "",
            classroomId: "",
            scheduleId: "",
            sessionType: "Teoría",
            dayOfWeek: "Lunes",
            startTime: "",
            endTime: "",
            pedagogicalHours: 3
          });

          alert("¡Sesión programada con éxito!");
        }}
        className="space-y-4 text-xs font-semibold"
      >
        {/* Grupo Académico */}
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase">Grupo Académico Principal *</label>
          <select 
            required
            value={formTask.groupId}
            onChange={(e) => {
              const gId = e.target.value;
              const g = groups.find(x => x.id === gId);
              if (g) {
                const sh = shifts.find(s => s.id === g.shiftId);
                setFormTask({
                  ...formTask,
                  groupId: gId,
                  courseId: "",
                  startTime: sh ? sh.startTime : "08:00 AM",
                  endTime: sh ? sh.endTime : "10:15 AM",
                  dayOfWeek: "Lunes"
                });
              } else {
                setFormTask({
                  ...formTask,
                  groupId: ""
                });
              }
            }}
            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
          >
            <option value="">-- SELECCIONAR GRUPO --</option>
            {groups.map(g => {
              const pName = periods.find(p => p.id === g.periodId)?.name || g.periodId;
              const cName = careers.find(c => c.id === g.careerId)?.name || g.careerId;
              const sName = shifts.find(s => s.id === g.shiftId)?.name || g.shiftId;
              return (
                <option key={g.id} value={g.id}>
                  {g.name} - {cName} (Ciclo {g.cycle} • {sName} • {pName})
                </option>
              );
            })}
          </select>
        </div>

        {/* Tarjeta informativa del Grupo Académico */}
        {(() => {
          if (!formTask.groupId) return null;
          const g = groups.find(x => x.id === formTask.groupId);
          if (!g) return null;
          const pName = periods.find(p => p.id === g.periodId)?.name || g.periodId;
          const cName = careers.find(c => c.id === g.careerId)?.name || g.careerId;
          const sName = shifts.find(s => s.id === g.shiftId)?.name || g.shiftId;

          const linkedVersionId = g.curriculumVersionId || curriculumVersions.find(v => v.careerId === g.careerId && v.isActive)?.id;
          const matchedCurriculum = curriculum.filter(
            it => it.careerId === g.careerId && 
                  it.cycle === g.cycle && 
                  (!linkedVersionId || it.versionId === linkedVersionId)
          );

          let totalRecommendedCourses = matchedCurriculum.length;
          let fullyProgrammedCourses = 0;
          let pendingCourses = 0;
          let totalTheoryHoursRequired = 0;
          let totalTheoryHoursProgrammed = 0;
          let totalLabHoursRequired = 0;
          let totalLabHoursProgrammed = 0;

          matchedCurriculum.forEach(it => {
            const crs = courses.find(c => c.id === it.courseId && c.status !== "Inactivo");
            if (!crs) return;

            const reqT = crs.theoryHours || 0;
            const reqL = crs.labHours || 0;
            totalTheoryHoursRequired += reqT;
            totalLabHoursRequired += reqL;

            const courseTasks = tasks.filter(t => t.groupId === g.id && t.courseId === crs.id);
            const pTheory = courseTasks
              .filter(t => t.sessionType === "Teoría")
              .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
            const pLab = courseTasks
              .filter(t => t.sessionType === "Laboratorio")
              .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

            totalTheoryHoursProgrammed += Math.min(reqT, pTheory);
            totalLabHoursProgrammed += Math.min(reqL, pLab);

            const isTheoryDone = pTheory >= reqT;
            const isLabDone = pLab >= reqL;

            if (isTheoryDone && isLabDone) {
              fullyProgrammedCourses++;
            } else {
              pendingCourses++;
            }
          });

          const totalRequiredSum = totalTheoryHoursRequired + totalLabHoursRequired;
          const totalProgrammedSum = totalTheoryHoursProgrammed + totalLabHoursProgrammed;
          const progressPercentage = totalRequiredSum > 0 
            ? Math.round((totalProgrammedSum / totalRequiredSum) * 100) 
            : 0;

          return (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-xs text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-[10px] text-[#9F062A] font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Resumen de Planificación
                </h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-extrabold font-mono ${
                  progressPercentage === 100 
                    ? "bg-emerald-100 text-emerald-900 border-emerald-200" 
                    : "bg-amber-100 text-amber-900 border-amber-200"
                }`}>
                  Progreso: {progressPercentage}%
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                <div 
                  style={{ width: `${progressPercentage}%` }} 
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercentage === 100 ? "bg-emerald-500" : "bg-[#800521]"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed font-semibold">
                <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black">Período Académico:</span>
                    <span className="font-extrabold text-slate-800">{pName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black">Carrera Profesional:</span>
                    <span className="font-extrabold text-slate-800 truncate block" title={cName}>{cName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black">Ciclo & Turno:</span>
                    <span className="font-extrabold text-[#9F062A] uppercase">Ciclo {g.cycle} — {sName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black">Capacidad / Alumnos:</span>
                    <span className="font-extrabold text-slate-850 font-mono">{g.capacity} Vacantes</span>
                  </div>
                </div>

                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black">Cursos del Ciclo:</span>
                    <span className="font-extrabold text-slate-800 font-mono">
                      {totalRecommendedCourses} asignaturas
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-[9px] text-slate-500 font-bold">Completados:</span>
                    <span className="font-black text-emerald-600 font-mono text-[10px]">{fullyProgrammedCourses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 font-bold">Pendientes:</span>
                    <span className="font-black text-amber-600 font-mono text-[10px]">{pendingCourses}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Curso Académico */}
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase">Curso Académico *</label>
          <select 
            required
            disabled={!formTask.groupId}
            value={formTask.courseId}
            onChange={(e) => setFormTask({ ...formTask, courseId: e.target.value })}
            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950 disabled:bg-slate-100 disabled:opacity-60"
          >
            <option value="">-- SELECCIONAR CURSO --</option>
            {(() => {
              if (!formTask.groupId) return null;
              const group = groups.find(g => g.id === formTask.groupId);
              if (!group) return null;

              const versionId = group.curriculumVersionId || curriculumVersions.find(v => v.careerId === group.careerId && v.isActive)?.id;
              const matchedItems = curriculum.filter(
                it => it.careerId === group.careerId && 
                      it.cycle === group.cycle && 
                      (!versionId || it.versionId === versionId)
              );

              return matchedItems.map(it => {
                const crs = courses.find(c => c.id === it.courseId && c.status !== "Inactivo");
                if (!crs) return null;

                const courseTasks = tasks.filter(t => t.groupId === group.id && t.courseId === crs.id);
                const pTheory = courseTasks
                  .filter(t => t.sessionType === "Teoría")
                  .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                const pLab = courseTasks
                  .filter(t => t.sessionType === "Laboratorio")
                  .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

                const reqT = crs.theoryHours || 0;
                const reqL = crs.labHours || 0;
                const isComplete = pTheory >= reqT && pLab >= reqL;

                return (
                  <option key={crs.id} value={crs.id}>
                    {crs.name} ({crs.code}) — Req: {reqT}T/{reqL}L • Prog: {pTheory}T/{pLab}L {isComplete ? "✓ (COMPLETO)" : ""}
                  </option>
                );
              });
            })()}
          </select>
        </div>

        {/* Tipo de Sesión */}
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Sesión *</label>
          <select 
            value={formTask.sessionType}
            onChange={(e) => setFormTask({ ...formTask, sessionType: e.target.value as any })}
            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
          >
            <option value="Teoría">Teoría (Sesión Teórica / Aula Regular)</option>
            <option value="Laboratorio">Laboratorio (Sesión Práctica / Laboratorio)</option>
          </select>
        </div>

        {/* Docente Asignado */}
        <div className="space-y-2">
          <label className="block text-[10px] text-slate-500 font-bold uppercase">Docente Responsable *</label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text"
              placeholder="Buscar por Nombre o DNI..."
              value={teacherSearchQuery}
              onChange={(e) => setTeacherSearchQuery(e.target.value)}
              className="p-2 bg-slate-50 border rounded-md font-bold text-slate-950 text-xs"
            />
            <select
              value={teacherSpecialtyFilter}
              onChange={(e) => setTeacherSpecialtyFilter(e.target.value)}
              className="p-2 bg-slate-50 border rounded-md font-bold text-slate-950 text-xs"
            >
              <option value="all">Todas las Especialidades</option>
              {getTeacherSpecialties(teachers).map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>
          </div>

          <select 
            required
            value={formTask.teacherDni}
            onChange={(e) => setFormTask({ ...formTask, teacherDni: e.target.value })}
            className="w-full p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
          >
            <option value="">-- SELECCIONAR DOCENTE --</option>
            {teachers
              .filter(t => {
                const query = teacherSearchQuery.toLowerCase();
                const fullName = `${t.name} ${t.lastName}`.toLowerCase();
                const dni = t.dni.toLowerCase();
                const matchesSearch = !query || fullName.includes(query) || dni.includes(query);
                const matchesSpecialty = teacherSpecialtyFilter === "all" || t.specialty === teacherSpecialtyFilter;
                return matchesSearch && matchesSpecialty;
              })
              .map(t => (
                <option key={t.dni} value={t.dni}>
                  {t.lastName}, {t.name} ({t.dni}) — Esp: {t.specialty || "General"}
                </option>
              ))}
          </select>
        </div>

        {/* Ambiente / Aula */}
        <div>
          <label className="block text-[10px] text-slate-500 font-bold uppercase">Ambiente / Aula Asignada *</label>
          <select 
            required
            value={formTask.classroomId}
            onChange={(e) => setFormTask({ ...formTask, classroomId: e.target.value })}
            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
          >
            <option value="">-- SELECCIONAR AMBIENTE --</option>
            {classrooms.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.location}) — Cap: {r.capacity} • Tipo: {r.type}
              </option>
            ))}
          </select>
        </div>

        {/* Día y Hora de Inicio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase">Día de la Semana *</label>
            <select 
              value={formTask.dayOfWeek}
              onChange={(e) => setFormTask({ ...formTask, dayOfWeek: e.target.value })}
              className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
            >
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora de Inicio (ej: 08:00 AM) *</label>
            <input 
              type="text"
              required
              placeholder="08:00 AM"
              value={formTask.startTime}
              onChange={(e) => setFormTask({ ...formTask, startTime: e.target.value })}
              className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950 font-mono"
            />
          </div>
        </div>

        {/* Horas Pedagógicas y Cálculo de Fin */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas Pedagógicas *</label>
            <input 
              type="number"
              min={1}
              max={8}
              value={formTask.pedagogicalHours}
              onChange={(e) => setFormTask({ ...formTask, pedagogicalHours: Number(e.target.value) })}
              className="w-full mt-1 p-1.5 bg-white border rounded font-bold text-slate-950 text-center font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Final Calculada</label>
            <div className="mt-1 p-1.5 bg-white border rounded font-black text-[#9F062A] text-center font-mono text-xs">
              {calculateEndTime(formTask.startTime, formTask.pedagogicalHours || 3, pedagogicalHourDuration) || "--:--"}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          variant="primary"
          className="w-full py-3 font-black text-xs uppercase tracking-wider bg-[#9F062A] text-white rounded-lg shadow-sm"
        >
          Guardar Sesión Programada
        </Button>
      </form>
    </div>
  );
};
