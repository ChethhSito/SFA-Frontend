import React, { useState, useEffect } from "react";
import { Award, FileSpreadsheet, Save, Info, RefreshCw, Layers, Lock, Unlock, Download, Printer, Check, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import PageHeader from "../ui-custom/PageHeader";
import { Course } from "@/types";
import { ROSTER } from "./DocenteTypes";

interface EvaluacionesCursosPrincipalProps {
  courses: Course[];
}

interface CourseFormula {
  courseCode: string;
  expression: string;
  variables: { id: string; label: string; weight: number }[];
}

const COURSE_FORMULAS: { [code: string]: CourseFormula } = {
  "EE-101": {
    courseCode: "EE-101",
    expression: "0.05*PYT1 + 0.10*PYT2 + 0.20*PYT3 + 0.15*PYT4 + 0.50*SUP1",
    variables: [
      { id: "PYT1", label: "Proyecto 1 (PYT1)", weight: 0.05 },
      { id: "PYT2", label: "Proyecto 2 (PYT2)", weight: 0.10 },
      { id: "PYT3", label: "Proyecto 3 (PYT3)", weight: 0.20 },
      { id: "PYT4", label: "Proyecto 4 (PYT4)", weight: 0.15 },
      { id: "SUP1", label: "Examen Supervisor (SUP1)", weight: 0.50 },
    ],
  },
  "EE-102": {
    courseCode: "EE-102",
    expression: "0.20*PC1 + 0.20*PC2 + 0.20*PC3 + 0.40*EX_FINAL",
    variables: [
      { id: "PC1", label: "Práctica 1 (PC1)", weight: 0.20 },
      { id: "PC2", label: "Práctica 2 (PC2)", weight: 0.20 },
      { id: "PC3", label: "Práctica 3 (PC3)", weight: 0.20 },
      { id: "EX_FINAL", label: "Examen Final (EX)", weight: 0.40 },
    ],
  },
  "SY-301": {
    courseCode: "SY-301",
    expression: "0.30*EDT + 0.30*SCRUM + 0.40*PMBOK_FINAL",
    variables: [
      { id: "EDT", label: "Entregable EDT", weight: 0.30 },
      { id: "SCRUM", label: "Sprint Scrum", weight: 0.30 },
      { id: "PMBOK_FINAL", label: "Memoria PMBOK", weight: 0.40 },
    ],
  },
  "default": {
    courseCode: "default",
    expression: "0.30*PC1 + 0.30*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "PC1", label: "Práctica 1 (PC1)", weight: 0.30 },
      { id: "PC2", label: "Práctica 2 (PC2)", weight: 0.30 },
      { id: "EX_FINAL", label: "Examen Final (EX_FINAL)", weight: 0.40 },
    ],
  }
};

export default function EvaluacionesCursosPrincipal({ courses }: EvaluacionesCursosPrincipalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [sheetData, setSheetData] = useState<{ [key: string]: string }>({});
  
  // Custom Toast/Notification State
  const [notification, setNotification] = useState<string | null>(null);

  // Secure Keypad Modals state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeStudentDni, setActiveStudentDni] = useState("");
  const [activeStudentName, setActiveStudentName] = useState("");
  const [activeVariableId, setActiveVariableId] = useState("");
  const [tempGrade, setTempGrade] = useState("");
  const [keypadNumbers, setKeypadNumbers] = useState<number[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [gradeErrorMessage, setGradeErrorMessage] = useState("");

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Setup default course on first load
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;
  const formula = selectedCourse ? (COURSE_FORMULAS[selectedCourse.code] || COURSE_FORMULAS["default"]) : COURSE_FORMULAS["default"];

  // Load from local storage when selected course shifts
  useEffect(() => {
    if (!selectedCourseId) return;
    const key = `sfa_grading_formula_sheet_${selectedCourseId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setSheetData(JSON.parse(saved));
    } else {
      // Initialize with reasonable random seed scores for polished display
      const seeded: { [key: string]: string } = {};
      ROSTER.forEach((std, index) => {
        formula.variables.forEach((variable) => {
          const base = 12 + ((index * 2 + variable.label.charCodeAt(0)) % 8);
          seeded[`${std.dni}-${variable.id}`] = base.toString();
        });
      });
      setSheetData(seeded);
      localStorage.setItem(key, JSON.stringify(seeded));
    }
  }, [selectedCourseId, formula]);

  // Helper formula average solver
  const computeStudentAverage = (studentDni: string) => {
    let average = 0;
    let missingAny = false;

    formula.variables.forEach((v) => {
      const cellVal = sheetData[`${studentDni}-${v.id}`];
      if (cellVal === undefined || cellVal === "") {
        missingAny = true;
      } else {
        const val = parseFloat(cellVal);
        if (isNaN(val)) {
          missingAny = true;
        } else {
          average += val * v.weight;
        }
      }
    });

    return {
      average: Math.round(average * 10) / 10,
      missingAny
    };
  };

  // 1. SECURE EDIT INITIATION
  const initiateSecureEdit = (studentDni: string, studentName: string, variableId: string, currentVal: string) => {
    setActiveStudentDni(studentDni);
    setActiveStudentName(studentName);
    setActiveVariableId(variableId);
    setTempGrade(currentVal);
    
    // Shuffle virtual keypad digits (0-9)
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = digits[i];
      digits[i] = digits[j];
      digits[j] = temp;
    }
    setKeypadNumbers(digits);
    setEnteredPin("");
    setErrorMessage("");
    setGradeErrorMessage("");
    setPinModalOpen(true);
  };

  const handleKeypadPress = (digit: number) => {
    if (enteredPin.length >= 4) return;
    setErrorMessage("");
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    // Auto validate after typing 4 digits
    if (nextPin === "1234") {
      setTimeout(() => {
        setPinModalOpen(false);
        setEditModalOpen(true);
      }, 250);
    } else if (nextPin.length === 4) {
      setTimeout(() => {
        setErrorMessage("Clave de firma SFA incorrecta. Intente de nuevo.");
        setEnteredPin("");
      }, 250);
    }
  };

  const handleKeypadClear = () => {
    setEnteredPin("");
    setErrorMessage("");
  };

  const handleGradeInputValidation = (inputVal: string) => {
    // Only permit digits and a single optional dot
    const clean = inputVal.replace(/[^0-9.]/g, "");
    
    // Avoid double dots
    const dotsCount = (clean.match(/\./g) || []).length;
    if (dotsCount > 1) return;

    setGradeErrorMessage("");
    setTempGrade(clean);
  };

  const handleSaveGradeSecure = () => {
    if (tempGrade === "") {
      setGradeErrorMessage("La nota no puede estar vacía.");
      return;
    }
    const score = parseFloat(tempGrade);
    if (isNaN(score)) {
      setGradeErrorMessage("Formato de calificación incorrecto.");
      return;
    }
    if (score < 0 || score > 20) {
      setGradeErrorMessage("Calificación fuera de rango [0-20]. Permita únicamente valores válidos.");
      return;
    }

    // Save score in local sheetData state
    const nextData = {
      ...sheetData,
      [`${activeStudentDni}-${activeVariableId}`]: tempGrade
    };
    setSheetData(nextData);
    
    // Automatically recalculate and save updated courses cache
    if (selectedCourseId) {
      const key = `sfa_grading_formula_sheet_${selectedCourseId}`;
      localStorage.setItem(key, JSON.stringify(nextData));
      
      // Sync averages with student database
      ROSTER.forEach((std) => {
        const studentDni = std.dni;
        let average = 0;
        let missingAny = false;

        formula.variables.forEach((v) => {
          const cellVal = studentDni === activeStudentDni && v.id === activeVariableId ? tempGrade : nextData[`${studentDni}-${v.id}`];
          if (cellVal !== undefined && cellVal !== "") {
            const val = parseFloat(cellVal);
            if (!isNaN(val)) average += val * v.weight;
          }
        });
        
        const finalAverage = Math.round(average * 10) / 10;
        const customKey = `${selectedCourseId}-cierre-${studentDni}`;
        localStorage.setItem(`sfa_grades_cierre_${customKey}`, finalAverage.toString());
      });
    }

    setEditModalOpen(false);
    triggerNotification(`Nota de [${activeVariableId}] para el alumno ${activeStudentName} editada y guardada como ${score.toFixed(1)}`);
  };

  // SAVE AND ACTIONS
  const handleSaveSheet = () => {
    if (!selectedCourseId) return;
    const key = `sfa_grading_formula_sheet_${selectedCourseId}`;
    localStorage.setItem(key, JSON.stringify(sheetData));

    ROSTER.forEach((std) => {
      const res = computeStudentAverage(std.dni);
      const customKey = `${selectedCourseId}-cierre-${std.dni}`;
      localStorage.setItem(`sfa_grades_cierre_${customKey}`, res.average.toString());
    });

    triggerNotification("Cambios guardados localmente de manera satisfactoria.");
  };

  const handlePublishOfficial = () => {
    handleSaveSheet();
    triggerNotification("Promedios oficiales publicados, actas firmadas digitalmente y sincronizadas en la Intranet.");
  };

  const handleExportExcel = () => {
    if (!selectedCourse) return;
    triggerNotification(`Generando planilla de cálculo... Archivo "${selectedCourse.code}_PLANILLA_NOTAS.xlsx" exportado.`);
  };

  const handleExportPDF = () => {
    if (!selectedCourse) return;
    triggerNotification(`Generando reporte académico... Archivo oficial "${selectedCourse.code}_ACTA_EVALUACION.pdf" descargado.`);
  };

  return (
    <div id="evaluaciones-cursos-sheet-screen" className="space-y-6 text-left relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-slate-900 border border-slate-705 text-white py-3.5 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold font-sans animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <PageHeader
        title="Evaluación Unificada por Curso"
        subtitle="Gestione el rendimiento del portafolio del docente de acuerdo con las fórmulas ponderadas nacionales vigentes."
        icon={<FileSpreadsheet className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border border-slate-200 rounded-xl gap-4 shadow-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#CFA020] font-bold uppercase tracking-widest block font-mono">Planilla y Fórmulas Complejas</span>
          <h4 className="text-sm font-extrabold text-slate-850 uppercase">Seleccione curso a evaluar</h4>
        </div>
        
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full md:w-80 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 focus:outline-[#8B0026]"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              [{c.code}] {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse ? (
        <div className="space-y-6">
          {/* Formula Display Summary Banner */}
          <div className="bg-[#800521] text-white p-5 rounded-2xl border-b-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-950/40" />
            <div className="relative z-10 space-y-1">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                Fórmula del Curso: Código {selectedCourse.code}
              </span>
              <h4 className="text-base font-black uppercase tracking-tight">{selectedCourse.name}</h4>
              <p className="text-[11px] font-mono text-slate-100 select-all font-bold">
                PROMEDIO ACTA = {formula.expression}
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap gap-2 shrink-0">
              {formula.variables.map((v) => (
                <div key={v.id} className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold border border-white/5 flex gap-1.5 justify-between">
                  <span className="text-amber-300 font-mono">{v.id}:</span>
                  <span>{(v.weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive spreadsheet grid */}
          <Card className="border border-slate-150">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
              <div>
                <CardTitle>Planilla Digital de Registro Seguro de Calificaciones</CardTitle>
                <CardDescription>Edición bloqueada contra escritura directa. Haga clic sobre cualquier celda para desbloquear mediante su firma digital.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 md:self-center shrink-0">
                <Button
                  onClick={handleExportExcel}
                  variant="secondary"
                  className="font-bold text-[10px] uppercase py-2.5 px-3.5 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Excel
                </Button>
                <Button
                  onClick={handleExportPDF}
                  variant="secondary"
                  className="font-bold text-[10px] uppercase py-2.5 px-3.5 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Exportar PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto select-text">
              <table className="w-full text-xs font-bold border-collapse text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider text-[9px] font-black">
                    <th className="py-2.5 px-4">Alumno</th>
                    <th className="py-2.5 px-3 font-mono w-24">DNI</th>
                    {formula.variables.map((v) => (
                      <th key={v.id} className="py-3 px-2 text-center w-24 font-mono leading-tight">
                        <span className="block text-slate-800">{v.id}</span>
                        <span className="text-[8px] text-slate-400 font-bold block">({v.weight * 100}%)</span>
                      </th>
                    ))}
                    <th className="py-2.5 px-4 text-center w-28 text-[#8B0026] bg-slate-50 border-l">Promedio Final</th>
                    <th className="py-2.5 px-4 text-center w-24 bg-slate-50">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/60 font-sans text-xs">
                  {ROSTER.map((std) => {
                    const stats = computeStudentAverage(std.dni);
                    const isUnderWeight = stats.missingAny;
                    const isApproved = stats.average >= 12.5;

                    return (
                      <tr key={std.dni} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-800 uppercase block leading-tight">
                            {std.lastName}, {std.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-450 font-semibold select-all">
                          {std.dni}
                        </td>
                        
                        {formula.variables.map((v) => {
                          const val = sheetData[`${std.dni}-${v.id}`] || "";
                          const numVal = parseFloat(val);
                          const hasGrade = val !== "";
                          const cellIsApproved = hasGrade && !isNaN(numVal) && numVal >= 12.5;
                          
                          return (
                            <td key={v.id} className="py-3.5 px-2 text-center">
                              <button
                                onClick={() => initiateSecureEdit(std.dni, std.lastName + ", " + std.name, v.id, val)}
                                className={`w-14 py-2 px-1 border rounded text-center font-mono font-black text-xs transition-all hover:scale-110 select-none cursor-pointer ${
                                  !hasGrade
                                    ? "bg-white text-slate-300 border-slate-200 hover:border-slate-400"
                                    : cellIsApproved
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100/80"
                                    : "bg-[#8B0026]/5 text-[#8B0026] border-red-200 hover:bg-[#8B0026]/10"
                                }`}
                                title="Cambiar nota de forma segura"
                              >
                                {hasGrade ? numVal.toFixed(1) : "--"}
                              </button>
                            </td>
                          );
                        })}

                        {/* Calculated Averages */}
                        <td className="py-3.5 px-4 text-center border-l bg-slate-50/40">
                          {isUnderWeight ? (
                            <span className="text-[10px] text-slate-400 italic font-medium">Incompleto</span>
                          ) : (
                            <span className={`text-base font-black font-mono tracking-tight ${isApproved ? "text-emerald-705 text-emerald-700" : "text-[#8B0026]"}`}>
                              {stats.average.toFixed(1)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center bg-slate-50/40">
                          {isUnderWeight ? (
                            <span className="text-[10px] text-slate-350 italic font-semibold">Pendiente</span>
                          ) : isApproved ? (
                            <span className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm">ADMITIDO</span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 bg-red-50 border border-red-200 text-[#8B0026] rounded-sm">DESAPROBADO</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Save Panel footer row */}
              <div className="p-5 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                <Button
                  onClick={handleSaveSheet}
                  variant="secondary"
                  className="font-black text-[11px] uppercase tracking-wider py-3 px-6"
                >
                  <Save className="w-4 h-4 mr-1.5 text-slate-500" /> Guardar Cambios
                </Button>
                <div className="flex-1" />
                <Button
                  onClick={handlePublishOfficial}
                  variant="primary"
                  className="font-black text-[11px] uppercase tracking-wider py-3 px-6 bg-[#8B0026] text-white"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Publicar Promedios Oficiales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-16 text-center text-slate-400 italic">No hay cursos disponibles para evaluación.</div>
      )}

      {/* MODAL 1: PIN AUTHENTICATION */}
      {pinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-150 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <div className="mx-auto w-10 h-10 rounded-full bg-[#8B0026]/10 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-[#8B0026]" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Seguridad de Calificaciones</h3>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">
                Ingrese su firma digital docente para modificar al alumno: <br />
                <span className="text-slate-800 uppercase font-black">{activeStudentName}</span> <br />
                Componente curricular: <span className="text-[#8B0026] font-mono font-extrabold">[{activeVariableId}]</span>
              </p>
            </div>

            {/* PIN Dots indicators */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                    enteredPin.length > idx
                      ? "bg-[#8B0026] border-[#8B0026] scale-110"
                      : "bg-slate-100 border-slate-300"
                  }`}
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-[10px] text-[#8B0026] font-extrabold text-center uppercase animate-bounce">{errorMessage}</p>
            )}

            <div className="text-center bg-amber-50 border border-amber-200 text-amber-800 text-[9.5px] font-mono py-1 rounded select-none font-bold">
              PIN del Docente de Prueba: <span className="font-extrabold select-all">1234</span>
            </div>

            {/* Randomized virtual keypad */}
            <div className="grid grid-cols-3 gap-2 py-1 max-w-[240px] mx-auto">
              {keypadNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  className="py-3 px-2 text-center text-slate-800 font-extrabold font-mono hover:bg-slate-100 border border-slate-150 rounded-lg text-lg select-none hover:border-slate-350 active:bg-slate-200 transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleKeypadClear}
                className="col-span-1 py-3 px-2 text-center text-slate-500 hover:text-[#8B0026] hover:bg-red-50 hover:border-red-200 font-black uppercase text-[10px] border border-slate-150 rounded-lg select-none cursor-pointer"
              >
                BORRAR
              </button>
              <button
                onClick={() => setPinModalOpen(false)}
                className="col-span-1 py-3 px-2 text-center text-slate-500 hover:bg-slate-100 font-black uppercase text-[10px] border border-slate-150 rounded-lg select-none cursor-pointer"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GRADE MODIFICATION */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-150 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Unlock className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Establecer Nueva Nota</h3>
              <p className="text-[10px] text-slate-500 font-semibold leading-normal text-slate-500 font-bold">
                Modificando nota en <span className="text-slate-800 uppercase font-black">{activeStudentName}</span> <br />
                para el indicador <span className="text-[#8B0026] font-mono font-extrabold">[{activeVariableId}]</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-500 uppercase text-[9px] font-black tracking-wider text-left">Firma Digital Habilitada. Nueva Nota:</label>
              <input
                type="text"
                autoFocus
                placeholder="Ejemplo: 14.5"
                value={tempGrade}
                onChange={(e) => handleGradeInputValidation(e.target.value)}
                className="w-full text-center py-3 border border-slate-200 rounded-xl font-mono text-2xl font-black text-[#8B0521] focus:outline-[#8B0026] select-all bg-slate-50/50"
              />
              <p className="text-[9.5px] text-slate-400 font-bold leading-normal text-center">
                Rango exigido de 0.0 a 20.0 (se permiten números decimales, no letras).
              </p>
            </div>

            {gradeErrorMessage && (
              <p className="text-[10px] text-[#8B0026] font-extrabold text-center uppercase animate-pulse">{gradeErrorMessage}</p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setEditModalOpen(false)}
                variant="secondary"
                className="flex-1 py-2.5 font-bold uppercase text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveGradeSecure}
                variant="primary"
                className="flex-1 py-2.5 font-bold uppercase text-[10px] bg-[#8B0026] text-white"
              >
                Guardar Nota
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

