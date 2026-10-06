import React, { useState } from "react";
import { Printer, Download, Calendar, Clock, MapPin, User, CheckCircle2, LayoutGrid, ListFilter } from "lucide-react";
import { StudentPersonalData, AcademicProgram, Enrollment } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface ScheduleTabProps {
  personalData: StudentPersonalData;
  currentProgram?: AcademicProgram;
  studentTasks: any[];
  mpaPlanningData: any;
  enrollment?: Enrollment;
  studentGroup?: any;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  personalData,
  currentProgram,
  studentTasks = [],
  mpaPlanningData,
  enrollment,
  studentGroup
}) => {
  const [viewMode, setViewMode] = useState<"matrix" | "cards">("matrix");

  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

  // Hourly slots based on shift
  const shift = enrollment?.shift || "Mañana";
  const timeBlocks = shift === "Noche" ? [
    { label: "18:45 - 19:30", key: "n1" },
    { label: "19:30 - 20:15", key: "n2" },
    { label: "20:15 - 21:00", key: "n3" },
    { label: "21:00 - 21:45", key: "n4" },
    { label: "21:45 - 22:30", key: "n5" },
  ] : shift === "Tarde" ? [
    { label: "13:30 - 14:30", key: "t1" },
    { label: "14:30 - 15:30", key: "t2" },
    { label: "15:30 - 16:30", key: "t3" },
    { label: "16:30 - 17:30", key: "t4" },
    { label: "17:30 - 18:30", key: "t5" },
  ] : [
    { label: "08:00 - 09:00", key: "m1" },
    { label: "09:00 - 10:00", key: "m2" },
    { label: "10:00 - 11:00", key: "m3" },
    { label: "11:00 - 12:00", key: "m4" },
    { label: "12:00 - 13:00", key: "m5" },
  ];

  const getDayStyle = (index: number) => {
    const styles = [
      { bg: "bg-emerald-50/80", border: "border-l-4 border-emerald-500", text: "text-emerald-950", sub: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800" },
      { bg: "bg-sky-50/80", border: "border-l-4 border-sky-500", text: "text-sky-950", sub: "text-sky-700", badge: "bg-sky-100 text-sky-800" },
      { bg: "bg-indigo-50/80", border: "border-l-4 border-indigo-500", text: "text-indigo-950", sub: "text-indigo-700", badge: "bg-indigo-100 text-indigo-800" },
      { bg: "bg-amber-50/80", border: "border-l-4 border-amber-500", text: "text-amber-950", sub: "text-amber-700", badge: "bg-amber-100 text-amber-800" },
      { bg: "bg-purple-50/80", border: "border-l-4 border-purple-500", text: "text-purple-950", sub: "text-purple-700", badge: "bg-purple-100 text-purple-800" }
    ];
    return styles[index % styles.length];
  };

  return (
    <PageTransition id="schedule" className="space-y-6">
      {/* Header metadata layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Horario Lectivo Oficial 2026-I
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-display tracking-tight mt-1">
            Horario Semanal de Clases • {personalData.name} {personalData.lastName}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {currentProgram?.name || "Electricidad Industrial"} • Ciclo I • Sección {studentGroup?.name || "1-A"} • Turno {shift}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* View mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "matrix" ? "bg-white text-[#800521] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Matriz Horaria</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "cards" ? "bg-white text-[#800521] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Por Días</span>
            </button>
          </div>

          <button 
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Imprimir
          </button>
          <button 
            onClick={() => alert("Descargando horario oficial de Ciclo I en formato PDF firmado...")}
            className="bg-[#800521] hover:bg-[#9F062A] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Official MPA Sync Banner */}
      <div className="bg-emerald-50 text-emerald-950 border border-emerald-200/80 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-3xs">
        <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          Programación académica y asignación de aulas oficiales sincronizadas en tiempo real desde el <strong>Módulo de Planificación Académica (MPA)</strong> para el Periodo 2026-I.
        </span>
      </div>

      {studentTasks.length > 0 ? (
        viewMode === "matrix" ? (
          /* TABLA MATRIZ DE HORARIO SEMANAL COMPLETA */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-center text-xs font-black uppercase tracking-wider text-slate-500 w-32 border-r border-slate-200">
                      Horario
                    </th>
                    {daysOfWeek.map((day, idx) => (
                      <th key={day} className="p-4 text-center text-xs font-black uppercase tracking-wider text-slate-700 border-r border-slate-200 last:border-r-0">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Single session spanning whole shift or row by row */}
                  <tr>
                    <td className="p-4 bg-slate-50/70 border-r border-b border-slate-200 text-center font-mono font-bold text-xs text-slate-700 align-top">
                      <div className="space-y-1">
                        <span className="block font-black text-slate-900">JORNADA {shift.toUpperCase()}</span>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {studentTasks[0]?.startTime || "08:00 AM"} - {studentTasks[0]?.endTime || "01:00 PM"}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100/60 px-2 py-0.5 rounded-full inline-block">
                          6 Hrs Pedagógicas
                        </span>
                      </div>
                    </td>

                    {daysOfWeek.map((day, idx) => {
                      const dayTasks = studentTasks.filter((t: any) => t.dayOfWeek === day);
                      const style = getDayStyle(idx);

                      return (
                        <td key={day} className="p-3 border-r border-b border-slate-200 last:border-r-0 align-top min-w-[180px]">
                          {dayTasks.length > 0 ? (
                            dayTasks.map((task: any) => {
                              const courseObj = mpaPlanningData.courses.find((c: any) => c.id === task.courseId);
                              const teacherObj = mpaPlanningData.teachers.find((t: any) => t.dni === task.teacherDni);
                              const classroomObj = mpaPlanningData.classrooms.find((c: any) => c.id === task.classroomId);

                              return (
                                <div
                                  key={task.id}
                                  className={`${style.bg} ${style.border} p-3.5 rounded-xl shadow-xs space-y-2.5 transition-all hover:scale-[1.01]`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${style.badge}`}>
                                        {task.sessionType || "Especialidad"}
                                      </span>
                                      <span className="text-[10px] font-mono font-bold text-slate-400">
                                        {courseObj?.code || task.courseId}
                                      </span>
                                    </div>
                                    <h4 className={`text-xs font-black ${style.text} leading-snug uppercase`}>
                                      {courseObj ? courseObj.name : "Unidad Didáctica"}
                                    </h4>
                                  </div>

                                  <div className="space-y-1.5 text-[11px] font-medium text-slate-700 pt-1 border-t border-slate-200/50">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span className="font-mono text-[10px] font-bold">{task.startTime} - {task.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span className="font-bold text-[11px] truncate">{classroomObj ? classroomObj.name : "Aula Asignada"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span className="font-semibold text-[11px] truncate">
                                        {teacherObj ? `${teacherObj.name} ${teacherObj.lastName}` : "Docente Titular"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 font-semibold italic text-xs">
                              <span>Sin clases programadas</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* VISTA POR TARJETAS DIARIAS */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysOfWeek.map((day, idx) => {
              const dayTasks = studentTasks.filter((t: any) => t.dayOfWeek === day);
              const style = getDayStyle(idx);

              return (
                <div key={day} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
                  <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                    <span className="font-black text-slate-900 text-sm tracking-wide block uppercase font-display">{day}</span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">Día {idx + 1}</span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {dayTasks.length > 0 ? (
                      dayTasks.map((task: any) => {
                        const courseObj = mpaPlanningData.courses.find((c: any) => c.id === task.courseId);
                        const teacherObj = mpaPlanningData.teachers.find((t: any) => t.dni === task.teacherDni);
                        const classroomObj = mpaPlanningData.classrooms.find((c: any) => c.id === task.classroomId);

                        return (
                          <div key={task.id} className={`${style.bg} ${style.border} rounded-xl p-3.5 shadow-xs space-y-2 text-left`}>
                            <span className="font-black text-xs text-[#800521] block leading-tight uppercase font-display">
                              {courseObj ? courseObj.name : "Unidad Didáctica"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold block font-mono">
                              {courseObj ? courseObj.code : task.courseId} • {task.pedagogicalHours || 6} Hrs
                            </span>
                            <div className="border-t border-dashed border-slate-200/80 my-2"></div>
                            <div className="space-y-1.5 text-[11px] text-slate-700 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{task.startTime} - {task.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="font-bold">{classroomObj ? classroomObj.name : "Aula Asignada"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{teacherObj ? `${teacherObj.name} ${teacherObj.lastName}` : "Docente"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400 font-semibold italic text-xs h-full">
                        <span>Día Libre</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
              Horario del Ciclo I en Consolidación
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              La Coordinación de Planificación Académica (MPA) está asignando los ambientes para su sección. En breve se reflejarán sus turnos semanales en este panel.
            </p>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
