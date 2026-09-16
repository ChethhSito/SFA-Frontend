import React, { useState } from "react";
import { 
  MpaAcademicGroup, MpaCareer, MpaCourse, 
  MpaClassroom, MpaProgramTask, MpaSchedule 
} from "../../../types";
import { PageTransition } from "../PageTransition";
import { WeeklyScheduleGrid } from "../../ui/WeeklyScheduleGrid";

interface CareerSchedulesViewProps {
  groups: MpaAcademicGroup[];
  careers: MpaCareer[];
  courses: MpaCourse[];
  classrooms: MpaClassroom[];
  teachers: any[];
  tasks: MpaProgramTask[];
  schedules: MpaSchedule[];
}

export const CareerSchedulesView: React.FC<CareerSchedulesViewProps> = ({
  groups,
  careers,
  courses,
  classrooms,
  teachers,
  tasks,
  schedules
}) => {
  const [filterSchCareerId, setFilterSchCareerId] = useState("");
  const [filterSchCycle, setFilterSchCycle] = useState(1);
  const [filterSchGroupId, setFilterSchGroupId] = useState("all");

  const activeCareerId = filterSchCareerId || (careers[0]?.id || "");
  const selectedCareer = careers.find(c => c.id === activeCareerId);
  const matchingGroups = groups.filter(g => g.careerId === activeCareerId && g.cycle === filterSchCycle);
  const currentGroupFilter = filterSchGroupId === "all" 
    ? "all" 
    : matchingGroups.some(g => g.id === filterSchGroupId) ? filterSchGroupId : "all";

  const filteredTasks = tasks.filter(t => {
    if (currentGroupFilter === "all") {
      return matchingGroups.some(g => g.id === t.groupId);
    } else {
      return t.groupId === currentGroupFilter;
    }
  });

  const novelArray = (arr: any[]) => Array.from(new Set(arr));
  const uniqueCoursesCount = novelArray(filteredTasks.map(t => t.courseId)).length;
  const laboratoriosCount = filteredTasks.filter(t => t.sessionType === "Laboratorio").length;
  const teoriasCount = filteredTasks.filter(t => t.sessionType === "Teoría").length;
  const uniqueTeachersCount = novelArray(filteredTasks.map(t => t.teacherDni)).length;

  return (
    <PageTransition id="career_schedules">
      <div className="space-y-6 text-left">
        {/* Header info card */}
        <div className="bg-[#9F062A]/5 p-5 rounded-xl border border-[#9F062A]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-black text-[#9F062A] uppercase tracking-wider">Matriz y Calendario de Horarios Integrados</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Consulte y descargue la programación visual de horarios filtrado por programa de estudios y nivel de ciclo académico.
            </p>
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#9F062A] px-2.5 py-1 bg-white border border-[#9F062A]/20 rounded-lg">
            Año Académico: 2026
          </span>
        </div>

        {/* Filter controls panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-4">Criterios de Consulta</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera de Estudios</label>
              <select 
                value={activeCareerId}
                onChange={(e) => {
                  setFilterSchCareerId(e.target.value);
                  setFilterSchGroupId("all");
                }}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-sans"
              >
                {careers.map(car => (
                  <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Formativo Académico</label>
              <select 
                value={filterSchCycle}
                onChange={(e) => {
                  setFilterSchCycle(Number(e.target.value));
                  setFilterSchGroupId("all");
                }}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-sans"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>Ciclo {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Grupo de Planificación</label>
              <select 
                value={currentGroupFilter}
                onChange={(e) => setFilterSchGroupId(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-sans"
              >
                <option value="all">-- MOSTRAR TODOS ({matchingGroups.length}) --</option>
                {matchingGroups.map(grp => (
                  <option key={grp.id} value={grp.id}>Grupo {grp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Grupos Detectados</span>
            <p className="text-xl font-black text-slate-800 mt-1 font-mono">{matchingGroups.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Asignaturas Distintas</span>
            <p className="text-xl font-black text-slate-800 mt-1 font-mono">{uniqueCoursesCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Clases de Teoría / Lab</span>
            <p className="text-xl font-black text-slate-800 mt-1 font-mono">{teoriasCount} T / {laboratoriosCount} L</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Docentes Activos</span>
            <p className="text-xl font-black text-slate-800 mt-1 font-mono">{uniqueTeachersCount}</p>
          </div>
        </div>

        {/* Integrated Weekly View Grid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <WeeklyScheduleGrid 
            tasks={filteredTasks}
            schedules={schedules}
            courses={courses}
            classrooms={classrooms}
            teachers={teachers}
            title={`Horario de Clases Semanal`}
            subtitle={`${selectedCareer?.name || "Especialidad"} • Ciclo ${filterSchCycle} • ${
              currentGroupFilter === "all" ? "Todos los Grupos" : "Grupo " + (groups.find(g => g.id === currentGroupFilter)?.name || currentGroupFilter)
            }`}
          />
        </div>

        {/* List view of lessons */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Detalle de Sesiones Programadas</h4>
            <span className="text-[9.5px] text-slate-500 font-black uppercase font-mono bg-white px-2 py-0.5 rounded border">Total: {filteredTasks.length}</span>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs italic">
              No hay clases programadas correspondientes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Grupo</th>
                    <th className="p-3">Curso / Código</th>
                    <th className="p-3">Docente</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Ambiente / Aula</th>
                    <th className="p-3">Día y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                  {filteredTasks.map(t => {
                    const course = courses.find(c => c.id === t.courseId);
                    const teacher = teachers.find(tr => tr.dni === t.teacherDni);
                    const classroom = classrooms.find(cr => cr.id === t.classroomId);
                    const sch = schedules.find(s => s.id === t.scheduleId);
                    const groupName = groups.find(g => g.id === t.groupId)?.name || t.groupId;
                    
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-black text-[#9F062A]">Grupo {groupName}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{course?.name || t.courseId}</div>
                          <div className="text-[9px] text-slate-450 font-black font-mono mt-0.5">{course?.code || "CÓDIGO"}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-750">
                          {teacher ? `${teacher.lastName}, ${teacher.name}` : t.teacherDni}
                        </td>
                        <td className="p-3">
                          <span className={`text-[8.5px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                            t.sessionType === "Laboratorio"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                              : "bg-sky-50 text-sky-800 border-sky-250"
                          }`}>
                            {t.sessionType}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-850">{classroom?.name || t.classroomId}</div>
                          <div className="text-[9.5px] text-slate-400 font-medium">{classroom?.location || "Pabellón"}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-500">
                          {sch ? (
                            <span>{sch.dayOfWeek} • {sch.startTime ? `${sch.startTime} - ${sch.endTime}` : sch.timeSlot}</span>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
};
