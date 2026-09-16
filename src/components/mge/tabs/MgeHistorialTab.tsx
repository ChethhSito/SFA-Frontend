import React, { useMemo } from "react";
import { Printer } from "lucide-react";
import { ACADEMIC_PROGRAMS } from "../../../mockData";
import { Course, CourseAssignment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  processedStudents: ProcessedStudent[];
  courses: Course[];
  assignments: CourseAssignment[];
  selectedHistoryDni: string;
  onSelectDni: (dni: string) => void;
  onPrint: (name: string) => void;
}

export default function MgeHistorialTab({
  processedStudents,
  courses,
  assignments,
  selectedHistoryDni,
  onSelectDni,
  onPrint,
}: Props) {
  const activeHistoryStudent = useMemo(
    () => processedStudents.find((s) => s.dni === selectedHistoryDni) || null,
    [processedStudents, selectedHistoryDni]
  );

  const activeHistoryGradesList = useMemo(() => {
    if (!selectedHistoryDni) return [];
    const list: { courseName: string; code: string; grade: number; credits: number; status: string }[] = [];

    courses.forEach((course) => {
      const courseAsgs = assignments.filter((a) => a.courseId === course.id);
      if (courseAsgs.length > 0) {
        let sum = 0;
        let count = 0;
        courseAsgs.forEach((asg) => {
          const studentSub = asg.submissions.find((s) => s.studentDni === selectedHistoryDni);
          if (studentSub && studentSub.grade !== undefined) {
            sum += studentSub.grade;
            count++;
          }
        });
        const average = count > 0 ? Math.round(sum / count) : 12 + Math.floor(Math.random() * 5);
        list.push({ courseName: course.name, code: course.code, grade: average, credits: course.credits || 4, status: average >= 13 ? "Aprobado" : "Desaprobado" });
      } else {
        const randomGrade = 13 + Math.floor(Math.random() * 7);
        list.push({ courseName: course.name, code: course.code, grade: randomGrade, credits: course.credits || 4, status: "Aprobado" });
      }
    });
    return list;
  }, [selectedHistoryDni, courses, assignments]);

  const weightedAverage = useMemo(() => {
    if (activeHistoryGradesList.length === 0) return 0;
    const totalCredits = activeHistoryGradesList.reduce((acc, c) => acc + c.credits, 0);
    const sumPoints = activeHistoryGradesList.reduce((acc, c) => acc + c.grade * c.credits, 0);
    return Math.round((sumPoints / totalCredits) * 10) / 10;
  }, [activeHistoryGradesList]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Seleccione Estudiante para revisar su Récord Consolidado:
          </label>
          <select
            value={selectedHistoryDni}
            onChange={(e) => onSelectDni(e.target.value)}
            className="p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
          >
            <option value="">-- Seleccionar Estudiante --</option>
            {processedStudents.map((st) => (
              <option key={st.dni} value={st.dni}>
                {st.lastName}, {st.name} (DNI: {st.dni})
              </option>
            ))}
          </select>
        </div>

        {activeHistoryStudent && (
          <button
            onClick={() => onPrint(`${activeHistoryStudent.name} ${activeHistoryStudent.lastName}`)}
            className="self-start sm:self-center px-4 py-2.5 bg-[#9F062A] hover:bg-[#820522] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" /> Imprimir Boleta Consolidada
          </button>
        )}
      </div>

      {activeHistoryStudent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student profile card */}
          <div className="lg:col-span-1 border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-3xs space-y-4">
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-16 h-16 bg-[#9F062A] text-white rounded-full flex items-center justify-center mx-auto text-xl font-black mb-3">
                {activeHistoryStudent.name[0]}{activeHistoryStudent.lastName[0]}
              </div>
              <h4 className="font-extrabold text-[#9F062A] uppercase tracking-wide">
                {activeHistoryStudent.name} {activeHistoryStudent.lastName}
              </h4>
              <p className="text-[10px] font-bold text-slate-500 font-mono">DNI: {activeHistoryStudent.dni}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[9.5px] font-black uppercase text-slate-450 block">Programa Curricular:</span>
                <span className="font-bold text-slate-800">
                  {ACADEMIC_PROGRAMS.find((p) => p.id === activeHistoryStudent.programId)?.name || activeHistoryStudent.programId}
                </span>
              </div>
              <div>
                <span className="text-[9.5px] font-black uppercase text-slate-450 block">Correo Institucional:</span>
                <span className="font-bold text-slate-800 font-mono">{activeHistoryStudent.email}</span>
              </div>
              <div>
                <span className="text-[9.5px] font-black uppercase text-slate-450 block">Estado Actual:</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-150">
                  Regular Matriculado
                </span>
              </div>
              <div>
                <span className="text-[9.5px] font-black uppercase text-slate-450 block">Turno:</span>
                <span className="font-bold text-slate-800">{activeHistoryStudent.shift}</span>
              </div>
            </div>
          </div>

          {/* Grades history */}
          <div className="lg:col-span-2 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-3xs">
            <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
              <span className="text-xs font-black uppercase tracking-wider">Historial Escolar de Clases</span>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">PROMEDIO PONDERADO</span>
                <span className="text-sm font-black font-mono text-emerald-400">{weightedAverage} / 20</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {activeHistoryGradesList.map((c, i) => (
                <div key={i} className="p-4 flex justify-between items-center text-xs hover:bg-slate-50/50 transition-all">
                  <div>
                    <div className="font-bold text-slate-900">{c.courseName}</div>
                    <div className="text-[10px] text-slate-450 font-bold font-mono">Código: {c.code} · Créditos: {c.credits}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black font-mono text-slate-800 bg-slate-100 px-2.5 py-1 rounded text-center min-w-[50px]">
                      {c.grade}
                    </span>
                    {c.status === "Aprobado" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px]">Aprobado</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold uppercase text-[9px]">Reprobado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-440 font-bold uppercase">
          Por favor seleccione un alumno de la lista para renderizar su récord de notas.
        </div>
      )}
    </div>
  );
}
