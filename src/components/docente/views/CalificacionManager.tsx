import React, { useState } from "react";
import { Award, Save, CheckCircle } from "lucide-react";
import { CourseAssignment } from "../../../types";
import { ROSTER } from "../DocenteTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";

interface Props {
  courseId: string;
  week: number;
  assignment: CourseAssignment | null;
  grades: { [dni: string]: { grade?: number; feedback?: string } };
  onSaveGrade: (studentDni: string, grade: number, feedback: string) => void;
}

export function CalificacionManager({ courseId, week, assignment, grades, onSaveGrade }: Props) {
  const [editingGrades, setEditingGrades] = useState<{ [key: string]: string }>({});
  const [editingFeedbacks, setEditingFeedbacks] = useState<{ [key: string]: string }>({});

  const handleSave = (dni: string) => {
    const rawGrade = editingGrades[dni] || grades[dni]?.grade?.toString() || "";
    const feedback = editingFeedbacks[dni] || grades[dni]?.feedback || "";
    const parsedGrade = parseInt(rawGrade, 10);

    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 20) {
      alert("Por favor ingrese una nota válida entre 0 y 20 de la escala nominal oficial.");
      return;
    }

    onSaveGrade(dni, parsedGrade, feedback);
    setEditingGrades((prev) => { const c = { ...prev }; delete c[dni]; return c; });
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Calificador Nominal de Alumnos`}
        subtitle="Asigne notas oficiales en la escala nacional regular (0 a 20) con comentarios cualitativos directos."
        icon={<Award className="w-5 h-5 text-[#8B0026]" />}
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{assignment?.title || "Planilla de Evaluaciones"}</CardTitle>
            <CardDescription>
              {assignment
                ? `Asignación de notas obligatorias: ${assignment.description}`
                : "No hay tareas programadas en esta semana para evaluar"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5 font-sans">
          {!assignment ? (
            <div className="p-12 text-center text-slate-400 italic font-bold">
              <p>No se registran tareas evaluativas en la Semana {week}.</p>
              <p className="text-[10px] mt-1 text-slate-400">Las notas registradas aquí se computarán en el Acta Final del Curso.</p>
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {ROSTER.map((student) => {
                const finalGrade =
                  editingGrades[student.dni] !== undefined
                    ? editingGrades[student.dni]
                    : grades[student.dni]?.grade !== undefined
                    ? grades[student.dni].grade?.toString()
                    : "";

                const finalFeedback =
                  editingFeedbacks[student.dni] !== undefined
                    ? editingFeedbacks[student.dni]
                    : grades[student.dni]?.feedback || "";

                const hasSavedGrade = grades[student.dni]?.grade !== undefined;

                return (
                  <div
                    key={student.dni}
                    className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-colors text-xs font-bold"
                  >
                    <div className="text-left space-y-1.5 lg:max-w-xs xl:max-w-md w-full">
                      <span className="font-extrabold text-slate-900 block text-xs md:text-sm">{student.name} {student.lastName}</span>
                      <span className="text-[10px] text-slate-400 block">DNI: {student.dni} • Correo: {student.email}</span>
                      {hasSavedGrade && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10.5px] text-slate-550 italic font-medium w-64 block truncate" title={grades[student.dni]?.feedback}>
                            Ok: "{grades[student.dni]?.feedback || "Sin observaciones"}"
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">Comentario Cualitativo / Feedback:</label>
                        <input
                          type="text"
                          placeholder="Fórmula excelente, falta rótulo..."
                          value={finalFeedback}
                          onChange={(e) => setEditingFeedbacks({ ...editingFeedbacks, [student.dni]: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md font-mono text-[11px] font-semibold text-slate-800 focus:outline-[#8B0026] h-10"
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">Nota (0-20):</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          placeholder="Nota"
                          value={finalGrade}
                          onChange={(e) => setEditingGrades({ ...editingGrades, [student.dni]: e.target.value })}
                          className="w-16 h-10 border border-slate-200 bg-white rounded-md font-mono text-center font-black text-slate-900 text-sm focus:outline-[#8B0026]"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleSave(student.dni)}
                        variant={hasSavedGrade ? "outline" : "primary"}
                        className="font-black uppercase text-[10px] tracking-wide inline-flex items-center justify-center gap-1.5 self-end h-10 px-4 mt-auto shrink-0 bg-[#8B0026]"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {hasSavedGrade ? "Modificar" : "Puntuar"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
