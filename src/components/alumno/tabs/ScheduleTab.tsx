import React from "react";
import { Printer, Download } from "lucide-react";
import { StudentPersonalData, AcademicProgram } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface ScheduleTabProps {
  personalData: StudentPersonalData;
  currentProgram?: AcademicProgram;
  studentTasks: any[];
  mpaPlanningData: any;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  personalData,
  currentProgram,
  studentTasks,
  mpaPlanningData
}) => {
  return (
    <PageTransition id="schedule" className="space-y-6">
      {/* Header metadata layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Hola, {personalData.name}, bienvenido, hoy es miércoles 27 de mayo de 2026
          </h2>
          <p className="text-xs text-slate-500 font-semibold">{currentProgram?.name || "Electricidad Industrial"} - Ciclo V</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print
          </button>
          <button 
            onClick={() => alert("Descargando su horario de clases consolidado del semestre 2026-I en PDF...")}
            className="bg-[#800521] hover:bg-[#9F062A] text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-500" /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Schedule content: Dynamic programmed agenda or fallback table */}
      {studentTasks.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>📅</span>
            <span>Se ha sincronizado con éxito su programación de aula y horarios oficiales desde el <strong>Módulo de Planificación Académica (MPA)</strong> para el semestre lectivo actual.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const).map((day) => {
              const dayTasks = studentTasks.filter((t: any) => t.dayOfWeek === day);
              return (
                <div key={day} className="bg-white rounded-xl border border-slate-150 p-4 shadow-xs flex flex-col">
                  <div className="border-b border-slate-100 pb-2 mb-3">
                    <span className="font-extrabold text-slate-800 text-sm tracking-wide block uppercase text-center font-display">{day}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {dayTasks.length > 0 ? (
                      dayTasks.map((task: any) => {
                        const courseObj = mpaPlanningData.courses.find((c: any) => c.id === task.courseId);
                        const teacherObj = mpaPlanningData.teachers.find((t: any) => t.dni === task.teacherDni);
                        const classroomObj = mpaPlanningData.classrooms.find((c: any) => c.id === task.classroomId);
                        
                        return (
                          <div key={task.id} className="bg-slate-50/70 border border-slate-100 rounded-lg p-3 hover:shadow-xs transition-all text-left">
                            <span className="font-black text-xs text-[#800521] block leading-tight uppercase font-display">
                              {courseObj ? courseObj.name : "Unidad Didáctica"}
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold block font-mono mt-1">
                              {courseObj ? courseObj.code : task.courseId} • {task.pedagogicalHours || 4} Hrs
                            </span>
                            <div className="border-t border-dashed border-slate-200 my-2"></div>
                            <div className="space-y-1 text-[10px] text-slate-600 font-semibold">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#800521]"></span>
                                <span>Horario: {task.startTime} - {task.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span>Aula: {classroomObj ? classroomObj.name : "Aula de Teoría"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Docente: {teacherObj ? `${teacherObj.name} ${teacherObj.lastName.split(' ')[0]}` : "Docente"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-400 font-semibold italic text-[11px] h-full">
                        <span>Día Libre</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Calendar hourly grid layout (Reference 3 style) - FALLBACK */
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] uppercase">
                  <th className="p-4 border-r border-slate-100 w-32">Time</th>
                  <th className="p-4 border-r border-slate-100">Lunes</th>
                  <th className="p-4 border-r border-slate-100">Martes</th>
                  <th className="p-4 border-r border-slate-100">Miércoles</th>
                  <th className="p-4 border-r border-slate-100">Jueves</th>
                  <th className="p-4">Viernes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">08:00 - 09:00</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-sky-950">TEORÍA DE CIRCUITOS II</span>
                      <span className="text-[9px] text-sky-600 block mt-2">Aula A-102 • Ing. Vizcarra</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-sky-950">TEORÍA DE CIRCUITOS II</span>
                      <span className="text-[9px] text-sky-600 block mt-2">Aula A-102 • Ing. Vizcarra</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3">-</td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">09:00 - 10:00</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={3}>
                    <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-emerald-950">LAB. ELECTRICIDAD</span>
                      <span className="text-[9px] text-emerald-600 block mt-2">Taller L-1 • Ing. Ramos</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100" rowSpan={3}>
                    <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-emerald-950">ELECTRÓNICA POT.</span>
                      <span className="text-[9px] text-emerald-600 block mt-2">Taller L-3 • Prof. Díaz</span>
                    </div>
                  </td>
                  <td className="p-3">-</td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">10:00 - 11:00</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-sky-950">MATEMÁTICA V</span>
                      <span className="text-[9px] text-sky-600 block mt-2">Aula A-202 • Prof. Santos</span>
                    </div>
                  </td>
                  <td className="p-3">-</td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">11:00 - 12:00</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-orange-50 text-orange-850 border-l-4 border-orange-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-orange-955">ÉTICA PROFESIONAL</span>
                      <span className="text-[9px] text-orange-600 block mt-2">Virtual Sync • Tutoria</span>
                    </div>
                  </td>
                  <td className="p-3">-</td>
                </tr>

                <tr className="bg-slate-100 text-slate-500 font-bold overflow-hidden">
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-black text-slate-500">12:00 - 13:00</td>
                  <td className="p-2 border-r border-slate-100 text-center tracking-widest font-extrabold uppercase bg-slate-100 text-slate-400" colSpan={5}>
                    RECESO ALMUERZO
                  </td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">13:00 - 14:00</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-indigo-50 text-indigo-805 border-l-4 border-indigo-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-indigo-950">SISTEMAS DE CONTROL II</span>
                      <span className="text-[9px] text-indigo-600 block mt-2">Aula A-105 • Prof. Ramos</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-indigo-50 text-indigo-805 border-l-4 border-indigo-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-indigo-950">SISTEMAS DE CONTROL II</span>
                      <span className="text-[9px] text-indigo-600 block mt-2">Aula A-105 • Prof. Ramos</span>
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100" rowSpan={2}>
                    <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-sky-950">MANTENIMIENTO IND.</span>
                      <span className="text-[9px] text-sky-600 block mt-2">Aula A-201 • Ing. Ramos</span>
                    </div>
                  </td>
                  <td className="p-3">-</td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">14:00 - 15:00</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3">-</td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">15:00 - 16:00</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3 border-r border-slate-100">-</td>
                  <td className="p-3" rowSpan={2}>
                    <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                      <span className="font-extrabold block text-[11px] leading-tight text-emerald-950">INSTALACIONES II</span>
                      <span className="text-[9px] text-emerald-600 block mt-2">Taller L-2 • Ing. Salazar</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">16:00 - 17:00</td>
                  <td className="p-2 border-r border-slate-100">-</td>
                  <td className="p-2 border-r border-slate-100">-</td>
                  <td className="p-2 border-r border-slate-100">-</td>
                  <td className="p-2 border-r border-slate-100">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
