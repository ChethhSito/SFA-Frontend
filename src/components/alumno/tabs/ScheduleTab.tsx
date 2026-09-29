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
            Hola, {personalData.name}, bienvenido al periodo académico 2026-I
          </h2>
          <p className="text-xs text-slate-500 font-semibold">{currentProgram?.name || "Electricidad Industrial"} - Ciclo I</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Imprimir
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
        /* Estado informativo limpio para estudiante de primer ciclo */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl">
            📅
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-base font-black text-slate-900 font-display uppercase tracking-wide">
              Horario del Ciclo I en Proceso de Programación
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
              La <strong>Secretaría General</strong> y la <strong>Coordinación de Planificación Académica (MPA)</strong> están distribuyendo las aulas y turnos docentes correspondientes a su especialidad. En cuanto la asignación horaria quede consolidada, sus bloques de clase se sincronizarán y mostrarán automáticamente en este panel.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs max-w-md mx-auto space-y-2">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500 font-bold">Programa Académico:</span>
              <span className="font-extrabold text-[#800521] uppercase">{currentProgram?.name || "Electricidad Industrial"}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500 font-bold">Nivel Formativo:</span>
              <span className="font-extrabold text-slate-800">Ciclo I (Primer Semestre)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Estado de Matrícula:</span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase">
                Matriculado Oficial
              </span>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
