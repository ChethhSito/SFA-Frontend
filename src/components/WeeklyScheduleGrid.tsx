import React from "react";
import { 
  MpaProgramTask, 
  MpaSchedule, 
  MpaCourse, 
  MpaClassroom, 
  MpaAcademicGroup,
  MpaCareer
} from "../types";
import { Printer, Download, MapPin, User, Calendar, MessageSquare, Clock } from "lucide-react";

interface WeeklyScheduleGridProps {
  tasks: MpaProgramTask[];
  schedules: MpaSchedule[];
  courses: MpaCourse[];
  classrooms: MpaClassroom[];
  teachers: any[];
  group?: MpaAcademicGroup;
  title: string;
  subtitle?: string;
}

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  tasks,
  schedules,
  courses,
  classrooms,
  teachers,
  group,
  title,
  subtitle
}) => {
  const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // Fetch unique time slots from both schedule blocks and tasks with real-time hours
  const uniqueTimeSlots = Array.from(
    new Set([
      ...schedules.map(s => {
        if (s.startTime && s.endTime) {
          return `${s.startTime} - ${s.endTime}`;
        }
        return s.timeSlot;
      }),
      ...tasks.map(t => {
        if (t.startTime && t.endTime) {
          return `${t.startTime} - ${t.endTime}`;
        }
        return "";
      })
    ].filter(Boolean))
  ).sort((a: string, b: string) => {
    const getMinutes = (str: string) => {
      const match = str.match(/(\d+):(\d+)/);
      if (!match) return 0;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPM = str.toLowerCase().includes("pm");
      if (isPM && h < 12) {
        h += 12;
      } else if (!isPM && h === 12) {
        h = 0;
      }
      return h * 60 + m;
    };
    return getMinutes(a) - getMinutes(b);
  });

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes.");
      return;
    }

    const style = `
      body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 20px; }
      h1 { font-size: 18px; color: #800521; margin-bottom: 5px; text-transform: uppercase; }
      h2 { font-size: 11px; color: #64748b; margin-top: 0; text-transform: uppercase; letter-spacing: 0.1em; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; vertical-align: top; }
      th { background-color: #f8fafc; font-weight: 800; color: #475569; }
      .time-col { font-family: monospace; font-weight: bold; background-color: #f8fafc; width: 100px; }
      .card { border-left: 3px solid #0284c7; padding-left: 6px; margin-bottom: 4px; }
      .card.lab { border-left-color: #059669; }
      .course-name { font-weight: 800; display: block; color: #0f172a; text-transform: uppercase; }
      .meta { font-size: 9px; color: #64748b; margin-top: 2px; }
    `;

    let htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>${style}</style>
        </head>
        <body>
          <h1>${title}</h1>
          <h2>${subtitle || "Horario Consolidado"}</h2>
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                ${DAYS_OF_WEEK.map(d => `<th>${d}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
    `;

    uniqueTimeSlots.forEach(slot => {
      htmlContent += `<tr><td class="time-col">${slot}</td>`;
      DAYS_OF_WEEK.forEach(day => {
        const cellTasks = tasks.filter(t => {
          if (t.dayOfWeek && t.startTime && t.endTime) {
            if (t.dayOfWeek !== day) return false;
            return `${t.startTime} - ${t.endTime}` === slot;
          }
          const sch = schedules.find(s => s.id === t.scheduleId);
          if (!sch) return false;
          if (sch.dayOfWeek !== day) return false;
          const schSlot = sch.startTime && sch.endTime ? `${sch.startTime} - ${sch.endTime}` : sch.timeSlot;
          return schSlot === slot;
        });

        htmlContent += `<td>`;
        cellTasks.forEach(t => {
          const course = courses.find(c => c.id === t.courseId);
          const teacher = teachers.find(tr => tr.dni === t.teacherDni);
          const classroom = classrooms.find(cr => cr.id === t.classroomId);
          const classType = (t.sessionClassType || (t.sessionType === "Laboratorio" ? "Lab" : "Teo")).toUpperCase();
          const grp = t.grpNum || "A";
          const subgrpText = t.subGrpNum && t.subGrpNum !== "0" ? ` | Subgrupo: ${t.subGrpNum}` : "";
          htmlContent += `
            <div class="card ${classType === "LAB" ? "lab" : ""}">
              <span class="course-name">${course?.name || t.courseId} (${classType})</span>
              <div class="meta">
                <strong>Grupo: ${grp}${subgrpText}</strong><br/>
                Ambiente: ${classroom?.name || t.classroomId}<br/>
                Docente: ${teacher ? `${teacher.lastName}, ${teacher.name}` : t.teacherDni}
              </div>
            </div>
          `;
        });
        htmlContent += `</td>`;
      });
      htmlContent += `</tr>`;
    });

    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Horario Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4">
        <div>
          <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
          {subtitle && (
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            type="button"
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Imprimir Horario
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 bg-slate-50/50 border border-dashed rounded-xl text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <h5 className="text-xs font-black text-slate-700 uppercase">Sin Clases Programadas</h5>
          <p className="text-[11px] text-slate-500 font-semibold max-w-sm mx-auto">
            Aún no se han programado asignaturas académicas en turnos o franjas de horarios para este rango de consulta.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold border-collapse text-left min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-black">
                  <th className="p-4 border-r border-slate-100 w-36 whitespace-nowrap">Franja Horaria</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day} className="p-4 border-r border-slate-100 font-extrabold text-slate-700 last:border-0">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {uniqueTimeSlots.map(slot => (
                  <tr key={slot} className="hover:bg-slate-50/20">
                    <td className="p-4 bg-slate-50/60 border-r border-slate-200 font-mono font-black text-slate-600 text-[11px] flex flex-col justify-center min-h-[90px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{slot}</span>
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map(day => {
                      const cellTasks = tasks.filter(t => {
                        if (t.dayOfWeek && t.startTime && t.endTime) {
                          if (t.dayOfWeek !== day) return false;
                          return `${t.startTime} - ${t.endTime}` === slot;
                        }
                        const sch = schedules.find(s => s.id === t.scheduleId);
                        if (!sch) return false;
                        if (sch.dayOfWeek !== day) return false;
                        const schSlot = sch.startTime && sch.endTime ? `${sch.startTime} - ${sch.endTime}` : sch.timeSlot;
                        return schSlot === slot;
                      });

                      return (
                        <td key={day} className="p-2 border-r border-slate-150 last:border-0 align-top min-w-[130px] w-[16%]">
                          {cellTasks.length === 0 ? (
                            <div className="h-full min-h-[60px] flex items-center justify-center text-slate-250 italic text-[10px]">
                              -
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {cellTasks.map(t => {
                                const course = courses.find(c => c.id === t.courseId);
                                const teacher = teachers.find(tr => tr.dni === t.teacherDni);
                                const classroom = classrooms.find(cr => cr.id === t.classroomId);

                                return (
                                  <div 
                                    key={t.id}
                                    className={`p-2.5 rounded shadow-xs flex flex-col justify-between border-l-4 transition-all duration-200 ${
                                      (t.sessionClassType || (t.sessionType === "Laboratorio" ? "Lab" : "Teo")) === "Lab"
                                        ? "bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-800 border-emerald-500"
                                        : (t.sessionClassType || (t.sessionType === "Laboratorio" ? "Lab" : "Teo")) === "Tal"
                                        ? "bg-amber-50/95 hover:bg-amber-100 text-amber-900 border-amber-500"
                                        : "bg-sky-50/90 hover:bg-sky-100/90 text-sky-800 border-sky-500"
                                    }`}
                                  >
                                    <div>
                                      <span className="font-extrabold block text-[11px] leading-tight text-slate-900">
                                        {course?.name || t.courseId}
                                      </span>
                                      
                                      {/* Grupo and Subgrupo indicator */}
                                      <div className="text-[9.5px] font-black text-[#9F062A]/90 mt-1 uppercase font-mono">
                                        Grupo: {t.grpNum || "A"} {t.subGrpNum && t.subGrpNum !== "0" ? `| Subgrupo: ${t.subGrpNum}` : ""}
                                      </div>

                                      <div className="flex justify-between items-center mt-1">
                                        <span className="text-[9px] text-slate-450 font-black font-mono">
                                          {course?.code || "CÓDIGO"}
                                        </span>
                                        <span className={`text-[8.5px] font-black uppercase px-1 rounded-sm text-white ${
                                          (t.sessionClassType || (t.sessionType === "Laboratorio" ? "Lab" : "Teo")) === "Lab" ? "bg-emerald-600" :
                                          (t.sessionClassType || (t.sessionType === "Laboratorio" ? "Lab" : "Teo")) === "Tal" ? "bg-amber-600" : "bg-sky-600"
                                        }`}>
                                          {(t.sessionClassType || (t.sessionType === "Laboratorio" ? "Lab" : "Teo")).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-2.5 space-y-1 border-t border-slate-200/55 pt-1.5 text-[9px] leading-none">
                                      <div className="flex items-center gap-1 font-bold text-slate-600 py-0.5">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate" title={classroom?.name || t.classroomId}>
                                          {classroom?.name ? classroom.name : t.classroomId}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-slate-500 font-semibold py-0.5">
                                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span className="truncate">
                                          {teacher ? `${teacher.lastName}, ${teacher.name?.substring(0, 1)}.` : "Docente"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

