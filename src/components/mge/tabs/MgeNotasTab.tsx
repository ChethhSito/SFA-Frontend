import React from "react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import Button from "../../ui/Button";
import { Course, CourseAssignment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  courses: Course[];
  assignments: CourseAssignment[];
  processedStudents: ProcessedStudent[];
  selectedCourseId: string;
  selectedTaskTitle: string;
  temporaryGrades: { [dni: string]: number };
  onCourseChange: (id: string) => void;
  onTaskChange: (title: string) => void;
  onGradeChange: (dni: string, value: string) => void;
  onSaveGrades: () => void;
}

export default function MgeNotasTab({
  courses,
  assignments,
  processedStudents,
  selectedCourseId,
  selectedTaskTitle,
  temporaryGrades,
  onCourseChange,
  onTaskChange,
  onGradeChange,
  onSaveGrades,
}: Props) {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();
  const activeCourseObj = courses.find((c) => c.id === selectedCourseId);

  const studentsInActiveCourse = activeCourseObj
    ? processedStudents.filter(
        (s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === activeCourseObj.career
      )
    : [];

  const currentGradesForTask = (() => {
    const matchingAssignment = assignments.find(
      (a) => a.courseId === selectedCourseId && a.title.toLowerCase() === selectedTaskTitle.toLowerCase()
    );
    const gradesMap: { [dni: string]: number } = {};
    if (matchingAssignment) {
      matchingAssignment.submissions.forEach((sub) => {
        if (sub.grade !== undefined) gradesMap[sub.studentDni] = sub.grade;
      });
    }
    return gradesMap;
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
            Paso 1: Seleccione Asignatura / Curso
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code}) - {ACADEMIC_PROGRAMS.find((p) => p.id === course.career)?.name || course.career}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
            Paso 2: Unidad / Criterio de Evaluación
          </label>
          <select
            value={selectedTaskTitle}
            onChange={(e) => onTaskChange(e.target.value)}
            className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
          >
            <option value="Evaluación Final">Examen / Evaluación de Final del Módulo</option>
            <option value="Práctica de Laboratorio 1">Práctica de Laboratorio N° 01</option>
            <option value="Avance Proyecto Integrador">Proyecto Integrador Modular</option>
            <option value="Constancia Portafolio">Presentación de Portafolio de Evidencias</option>
          </select>
        </div>
      </div>

      {activeCourseObj && (
        <div className="border border-slate-205 rounded-xl bg-white overflow-hidden">
          <div className="bg-slate-900 px-4 py-3 text-white flex justify-between items-center">
            <div className="text-xs">
              <span className="font-semibold text-slate-450 uppercase block text-[9px] tracking-widest">Registrando Notas de:</span>
              <span className="font-extrabold text-white text-xs block">{activeCourseObj.name} ({activeCourseObj.code})</span>
            </div>
            <Button
              onClick={onSaveGrades}
              className="bg-[#9F062A] hover:bg-[#820522] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2"
            >
              Guardar Todas las Notas
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Carrera</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Nota Existente</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider" style={{ width: "200px" }}>Nueva Nota (Escala 0 al 20)</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {studentsInActiveCourse.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-extrabold uppercase">
                      No hay alumnos matriculados en la carrera de este curso ({activeCourseObj.career}) para calificar.
                    </td>
                  </tr>
                ) : (
                  studentsInActiveCourse.map((st) => {
                    const existingScore = currentGradesForTask[st.dni];
                    const currentTemp = temporaryGrades[st.dni];
                    const scoreToEvaluate = currentTemp !== undefined ? currentTemp : (existingScore ?? 12);

                    return (
                      <tr key={st.dni} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">DNI: {st.dni}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-650 tracking-wide text-[11px]">
                            {ACADEMIC_PROGRAMS.find((p) => p.id === st.programId)?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-bold font-mono">
                          {existingScore !== undefined ? `${existingScore} / 20` : "Sin nota registrada"}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            placeholder="Escriba de 00 a 20"
                            value={currentTemp !== undefined ? currentTemp : ""}
                            onChange={(e) => onGradeChange(st.dni, e.target.value)}
                            className="w-32 px-3 py-1.5 border border-slate-250 bg-slate-50 text-slate-800 font-black font-mono text-xs rounded focus:outline-[#9F062A]"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {scoreToEvaluate >= 13 ? (
                            <span className="font-black text-emerald-600 block uppercase tracking-wider text-[11px]">
                              Aprobado ({scoreToEvaluate})
                            </span>
                          ) : (
                            <span className="font-black text-red-650 block uppercase tracking-wider text-[11px]">
                              Desaprobado ({scoreToEvaluate})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
