import React from "react";
import { Trash2 } from "lucide-react";
import { 
  MpaAcademicGroup, MpaCourse, MpaClassroom, 
  MpaProgramTask, MpaSchedule 
} from "../../../types";
import Button from "../../ui/Button";

interface ProgramTaskListTableProps {
  tasks: MpaProgramTask[];
  courses: MpaCourse[];
  teachers: any[];
  classrooms: MpaClassroom[];
  schedules: MpaSchedule[];
  groups: MpaAcademicGroup[];
  onDeleteTask: (taskId: string) => void;
}

export const ProgramTaskListTable: React.FC<ProgramTaskListTableProps> = ({
  tasks,
  courses,
  teachers,
  classrooms,
  schedules,
  groups,
  onDeleteTask
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-left">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Matriz de Clases y Sesiones Registradas</h4>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Consulte el desglose de clases programadas por grupo, docente y espacio físico.</p>
        </div>
        <span className="text-[10px] text-slate-500 font-black uppercase font-mono bg-white px-2.5 py-1 rounded border shadow-2xs">
          Total: {tasks.length} Sesiones
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs italic">
          No hay clases programadas aún. Utilice el formulario lateral para agregar sesiones.
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
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
              {tasks.map(t => {
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
                      {t.startTime ? (
                        <span>{t.dayOfWeek} • {t.startTime} - {t.endTime} ({t.pedagogicalHours || 3}h)</span>
                      ) : sch ? (
                        <span>{sch.dayOfWeek} • {sch.startTime ? `${sch.startTime} - ${sch.endTime}` : sch.timeSlot}</span>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-center">
                      <Button 
                        onClick={() => onDeleteTask(t.id)}
                        variant="secondary"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 shadow-none cursor-pointer"
                        title="Eliminar sesión programada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
