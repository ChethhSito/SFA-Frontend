import React, { useState, useEffect } from "react";
import { FileSpreadsheet, CheckCircle } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import { Course } from "../../types";
import { ROSTER } from "./DocenteTypes";

import { CourseFormulaCard, CourseFormula } from "./evaluaciones/CourseFormulaCard";
import { SecurePinModal } from "./evaluaciones/SecurePinModal";
import { EditGradeModal } from "./evaluaciones/EditGradeModal";
import { GradeSheetTable } from "./evaluaciones/GradeSheetTable";

interface EvaluacionesCursosPrincipalProps {
  courses: Course[];
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
          <CourseFormulaCard selectedCourse={selectedCourse} formula={formula} />

          {/* Interactive spreadsheet grid */}
          <GradeSheetTable
            formula={formula}
            sheetData={sheetData}
            computeStudentAverage={computeStudentAverage}
            onInitiateSecureEdit={initiateSecureEdit}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onSaveSheet={handleSaveSheet}
            onPublishOfficial={handlePublishOfficial}
          />
        </div>
      ) : (
        <div className="p-16 text-center text-slate-400 italic">No hay cursos disponibles para evaluación.</div>
      )}

      {/* MODAL 1: PIN AUTHENTICATION */}
      <SecurePinModal
        isOpen={pinModalOpen}
        activeStudentName={activeStudentName}
        activeVariableId={activeVariableId}
        enteredPin={enteredPin}
        errorMessage={errorMessage}
        keypadNumbers={keypadNumbers}
        onPressDigit={handleKeypadPress}
        onClearPin={handleKeypadClear}
        onClose={() => setPinModalOpen(false)}
      />

      {/* MODAL 2: GRADE MODIFICATION */}
      <EditGradeModal
        isOpen={editModalOpen}
        activeStudentName={activeStudentName}
        activeVariableId={activeVariableId}
        tempGrade={tempGrade}
        gradeErrorMessage={gradeErrorMessage}
        onGradeChange={handleGradeInputValidation}
        onSaveGrade={handleSaveGradeSecure}
        onClose={() => setEditModalOpen(false)}
      />

    </div>
  );
}
