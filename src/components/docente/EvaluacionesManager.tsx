import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, Award, FileSpreadsheet, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import PageHeader from "../ui-custom/PageHeader";
import { ROSTER } from "./DocenteTypes";

interface EvaluationItem {
  id: string;
  title: string;
  weight: number; // e.g. 20%
  points: number; // e.g. 20
}

interface EvaluacionesManagerProps {
  courseId: string;
  week: number;
  grades: { [dni: string]: { grade?: number; feedback?: string } };
  onSaveGrade: (studentDni: string, grade: number, feedback: string) => void;
}

export default function EvaluacionesManager({
  courseId,
  week,
  grades,
  onSaveGrade,
}: EvaluacionesManagerProps) {
  const [evalList, setEvalList] = useState<EvaluationItem[]>([]);
  const [selectedEvalId, setSelectedEvalId] = useState<string>("");
  
  // Form states for creating evaluations
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState(15);
  const [points, setPoints] = useState(20);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Temporary local state for interactive grade entries
  const [localGrades, setLocalGrades] = useState<{ [studentDni: string]: { grade: string; feedback: string } }>({});

  // Fetch or seed evaluations under course & week
  useEffect(() => {
    const key = `sfa_evaluaciones_list_${courseId}_w${week}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      setEvalList(parsed);
      if (parsed.length > 0) {
        setSelectedEvalId(parsed[0].id);
      }
    } else {
      // Seed default evaluation for this week
      const seeded: EvaluationItem[] = [
        { id: `ev-${courseId}-w${week}-1`, title: `Suficiencia Académica Semana ${week}`, weight: 15, points: 20 }
      ];
      setEvalList(seeded);
      setSelectedEvalId(seeded[0].id);
      localStorage.setItem(key, JSON.stringify(seeded));
    }
  }, [courseId, week]);

  // Load appropriate grades when selected evaluation shifts
  useEffect(() => {
    if (!selectedEvalId) return;
    const initial: { [studentDni: string]: { grade: string; feedback: string } } = {};
    ROSTER.forEach((std) => {
      // Look up in global grades registry via custom composite keys
      const customKey = `${courseId}-w${week}-${selectedEvalId}-${std.dni}`;
      const savedGrade = localStorage.getItem(`sfa_custom_g_${customKey}`);
      if (savedGrade) {
        const parsed = JSON.parse(savedGrade);
        initial[std.dni] = {
          grade: parsed.grade?.toString() || "",
          feedback: parsed.feedback || ""
        };
      } else {
        // Fallback to legacy composite keys in prop
        const legacy = grades[std.dni];
        initial[std.dni] = {
          grade: legacy?.grade?.toString() || "",
          feedback: legacy?.feedback || ""
        };
      }
    });
    setLocalGrades(initial);
  }, [selectedEvalId, courseId, week, grades]);

  const saveEvaluationList = (updated: EvaluationItem[]) => {
    setEvalList(updated);
    const key = `sfa_evaluaciones_list_${courseId}_w${week}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing) {
      const updated = evalList.map((ev) =>
        ev.id === isEditing ? { ...ev, title: title.trim(), weight, points } : ev
      );
      saveEvaluationList(updated);
      setIsEditing(null);
    } else {
      const newEv: EvaluationItem = {
        id: `ev-${Date.now()}`,
        title: title.trim(),
        weight: weight,
        points: points
      };
      const nextList = [...evalList, newEv];
      saveEvaluationList(nextList);
      setSelectedEvalId(newEv.id);
    }

    setTitle("");
    setWeight(15);
    setPoints(20);
  };

  const handleEditInit = (ev: EvaluationItem) => {
    setTitle(ev.title);
    setWeight(ev.weight);
    setPoints(ev.points);
    setIsEditing(ev.id);
  };

  const handleDelete = (id: string) => {
    const nextList = evalList.filter((ev) => ev.id !== id);
    saveEvaluationList(nextList);
    if (selectedEvalId === id) {
      setSelectedEvalId(nextList[0]?.id || "");
    }
  };

  const handleGradeChange = (studentDni: string, field: "grade" | "feedback", value: string) => {
    setLocalGrades((prev) => ({
      ...prev,
      [studentDni]: {
        ...prev[studentDni],
        [field]: value
      }
    }));
  };

  const handleSaveGradesSpreadsheet = () => {
    if (!selectedEvalId) return;

    ROSTER.forEach((std) => {
      const row = localGrades[std.dni] || { grade: "", feedback: "" };
      const parsedNum = parseFloat(row.grade);
      const gradeVal = isNaN(parsedNum) ? 0 : Math.min(20, Math.max(0, parsedNum));
      
      // Save in local storage via custom evaluation key
      const customKey = `${courseId}-w${week}-${selectedEvalId}-${std.dni}`;
      localStorage.setItem(`sfa_custom_g_${customKey}`, JSON.stringify({ grade: gradeVal, feedback: row.feedback }));

      // Also propagate legacy state upward for compatibility
      onSaveGrade(std.dni, gradeVal, row.feedback);
    });

    // Alert indicator
    const alertId = "evaluacion-saved-alert";
    const element = document.getElementById(alertId);
    if (element) {
      element.classList.remove("hidden");
      setTimeout(() => {
        element.classList.add("hidden");
      }, 3000);
    }
  };

  const selectedEval = evalList.find((e) => e.id === selectedEvalId);

  return (
    <div id="evaluaciones-section" className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Planificación de Evaluaciones y Planilla`}
        subtitle="Agrega evaluaciones específicas de la semana y califica mediante una cuadrícula de notas."
        icon={<Award className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Create / Edit Evaluations */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="text-left border border-slate-150">
            <CardHeader>
              <CardTitle>{isEditing ? "Editar Evaluación" : "Nueva Evaluación de Semana"}</CardTitle>
              <CardDescription>Establezca ponderación y directrices de calificación</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs font-bold text-slate-705">
                <div>
                  <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Nombre de la Evaluación</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ej: Evaluación Continua 2 (Teoría)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Peso en Fórmula (%)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={weight}
                      onChange={(e) => setWeight(parseInt(e.target.value) || 15)}
                      className="w-full px-3 py-2 border rounded-md font-mono text-slate-800 focus:outline-[#8B0026]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Puntaje Máximo</label>
                    <input
                      type="number"
                      required
                      disabled
                      value={points}
                      className="w-full px-3 py-2 border rounded-md bg-slate-100 font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(null);
                        setTitle("");
                        setWeight(15);
                      }}
                      className="flex-1 py-2.5 font-bold text-[10px] uppercase tracking-wider"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-3 font-black text-[10px] uppercase tracking-wider bg-[#8B0026] text-white"
                  >
                    {isEditing ? "Guardar Cambios" : "Crear Evaluación"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Evaluations Registered lists */}
          <Card className="text-left border border-slate-150">
            <CardHeader>
              <CardTitle>Evaluaciones de la Semana {week}</CardTitle>
              <CardDescription>Haga clic para calificar a su grupo asignado</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5">
              {evalList.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic">No hay evaluaciones programadas.</div>
              ) : (
                evalList.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvalId(ev.id)}
                    className={`p-3 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                      selectedEvalId === ev.id
                        ? "bg-[#8D0C26]/5 border-[#8B0026]"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-left min-w-0 pr-2">
                      <span className="font-extrabold text-slate-800 text-[11px] block uppercase truncate">
                        {ev.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-extrabold block mt-0.5">
                        Peso: {ev.weight}% • Escala: Vigésimal (0-{ev.points})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditInit(ev);
                        }}
                        className="p-1 text-slate-505 font-bold uppercase hover:bg-white text-[9px] hover:text-[#8B0026] px-1.5 py-0.5 rounded border"
                      >
                        editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(ev.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-rose-50 rounded"
                        title="Eliminar evaluación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Spreadsheet table */}
        <div className="lg:col-span-3 space-y-6">
          {selectedEval ? (
            <Card className="border border-slate-150">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/50">
                <div>
                  <CardTitle>Planilla Digital: de {selectedEval.title}</CardTitle>
                  <CardDescription>Escala de 0 a 20. Los promedios se sincronizan automáticamente.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-[#8B0026]/10 text-[#8B0026] border border-[#8B0026]/20 py-0.5 text-[9px] uppercase font-black rounded-sm">
                    PESO {selectedEval.weight}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto select-text">
                <table className="w-full text-xs font-bold border-collapse text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b text-slate-500 uppercase tracking-wider text-[9px] font-black">
                      <th className="py-2.5 px-4">Estudiante</th>
                      <th className="py-2.5 px-3 font-mono">DNI</th>
                      <th className="py-2.5 px-4 text-center w-20">Nota (0-20)</th>
                      <th className="py-2.5 px-4">Comentario / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150/60 text-xs">
                    {ROSTER.map((std) => {
                      const row = localGrades[std.dni] || { grade: "", feedback: "" };
                      const scoreNum = parseFloat(row.grade);
                      const isApproved = !isNaN(scoreNum) && scoreNum >= 13;
                      
                      return (
                        <tr key={std.dni} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="text-left font-extrabold uppercase text-slate-800 leading-tight">
                              {std.lastName}, {std.name}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 font-bold select-all">
                            {std.dni}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              required
                              placeholder="--"
                              value={row.grade}
                              onChange={(e) => handleGradeChange(std.dni, "grade", e.target.value)}
                              className={`w-14 mx-auto p-1.5 border rounded text-center font-mono font-bold font-black text-sm focus:outline-[#8B0026] ${
                                row.grade === ""
                                  ? "bg-white border-slate-200"
                                  : isApproved
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-350"
                                  : "bg-[#8B0026]/5 text-[#8B0026] border-red-350"
                              }`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              maxLength={100}
                              placeholder="Indicar observaciones del desempeño..."
                              value={row.feedback}
                              onChange={(e) => handleGradeChange(std.dni, "feedback", e.target.value)}
                              className="w-full p-2 border rounded text-xs font-semibold text-slate-700 bg-white border-slate-200 focus:outline-[#8B0026]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Submit row */}
                <div className="p-4 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div
                    id="evaluacion-saved-alert"
                    className="hidden transition-all duration-300 flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-250 py-1.5 px-3 rounded-lg text-[10.5px] font-bold"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Calificaciones publicadas y recalculadas con éxito en el sistema.</span>
                  </div>
                  <div className="flex-1" />
                  <Button
                    onClick={handleSaveGradesSpreadsheet}
                    variant="primary"
                    className="font-black text-[10.5px] uppercase tracking-wider py-3 px-6 bg-[#8B0026] text-white"
                  >
                    <Save className="w-4 h-4 mr-1.5" /> Publicar Calificaciones
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-16 text-center text-slate-400 italic border rounded-xl bg-slate-50 border-dashed">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>Seleccione o agregue una evaluación académica de la izquierda para desplegar la planilla.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

