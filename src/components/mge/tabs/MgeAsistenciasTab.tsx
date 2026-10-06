import React from "react";
import { CheckSquare } from "lucide-react";
import { Course, AttendanceRecord } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  courses: Course[];
  processedStudents: ProcessedStudent[];
  attendance: AttendanceRecord[];
  selectedAttendanceCourseId: string;
  selectedAttendanceDate: string;
  onCourseChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onUpdateStudentAttendance: (dni: string, status: "Presente" | "Tardanza" | "Falta" | "Justificado") => void;
  onFillAttendanceAll: (status: "Presente" | "Falta") => void;
}

export default function MgeAsistenciasTab({
  courses,
  processedStudents,
  attendance,
  selectedAttendanceCourseId,
  selectedAttendanceDate,
  onCourseChange,
  onDateChange,
  onUpdateStudentAttendance,
  onFillAttendanceAll,
}: Props) {
  const activeAttendanceRecord = attendance.find(
    (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
  );

  const course = courses.find((c) => c.id === selectedAttendanceCourseId);
  const studentsInAttendanceCourse = course
    ? processedStudents.filter(
        (s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === course.career
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
            1. Curso / Turno Evaluado:
          </label>
          <select
            value={selectedAttendanceCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
            2. Fecha Registrada:
          </label>
          <input
            type="date"
            value={selectedAttendanceDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#9F062A]" />
            Control de Asistencia del {selectedAttendanceDate}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => onFillAttendanceAll("Presente")}
              className="px-2.5 py-1 bg-emerald-650 hover:bg-emerald-700 text-white rounded text-[10px] uppercase font-bold cursor-pointer"
            >
              Marcar Todos Presentes
            </button>
            <button
              onClick={() => onFillAttendanceAll("Falta")}
              className="px-2.5 py-1 bg-red-650 hover:bg-red-750 text-white rounded text-[10px] uppercase font-bold cursor-pointer"
            >
              Marcar Todos Faltas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">DNI</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado de Asistencia</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Acción de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {studentsInAttendanceCourse.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-extrabold uppercase">
                    No hay alumnos asignados a la carrera vinculada a esta asignatura curricular.
                  </td>
                </tr>
              ) : (
                studentsInAttendanceCourse.map((st) => {
                  const currentStatus = activeAttendanceRecord?.statusMap[st.dni] || "Presente";
                  return (
                    <tr key={st.dni} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-extrabold text-slate-900">{st.lastName}, {st.name}</td>
                      <td className="px-4 py-3 font-bold font-mono text-slate-700">{st.dni}</td>
                      <td className="px-4 py-3">
                        {currentStatus === "Presente" && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-black uppercase text-[9.5px]">Presente</span>
                        )}
                        {currentStatus === "Tardanza" && (
                          <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 font-black uppercase text-[9.5px]">Tardanza</span>
                        )}
                        {currentStatus === "Falta" && (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-black uppercase text-[9.5px]">Falta de Asistencia</span>
                        )}
                        {currentStatus === "Justificado" && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-black uppercase text-[9.5px]">Justificado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {(["Presente", "Tardanza", "Falta", "Justificado"] as const).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => onUpdateStudentAttendance(st.dni, opt)}
                              className={`px-2 py-1 text-[9px] font-black rounded uppercase transition-all cursor-pointer ${
                                currentStatus === opt
                                  ? "bg-slate-800 text-white"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
