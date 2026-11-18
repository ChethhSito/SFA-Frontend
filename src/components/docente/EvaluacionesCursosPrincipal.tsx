import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FileSpreadsheet, BookOpen, Users, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Course, CourseAssignment, StudentPersonalData, Enrollment } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";

import { CourseFormulaCard, CourseFormula } from "./evaluaciones/CourseFormulaCard";
import { SecurePinModal } from "./evaluaciones/SecurePinModal";
import { EditGradeModal } from "./evaluaciones/EditGradeModal";
import { GradeSheetTable } from "./evaluaciones/GradeSheetTable";

interface EvaluacionesCursosPrincipalProps {
  courses: Course[];
  assignments: CourseAssignment[];
  studentsList: Record<string, StudentPersonalData>;
  enrollments: Enrollment[];
  onUpdateAssignments: (assignments: CourseAssignment[]) => Promise<boolean>;
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

export default function EvaluacionesCursosPrincipal({ courses, assignments, studentsList, enrollments, onUpdateAssignments }: EvaluacionesCursosPrincipalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  // Custom Toast/Notification State
  const [notification, setNotification] = useState<ToastNotice | null>(null);
  const closeNotification = useCallback(() => setNotification(null), []);

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

  const triggerNotification = (message: string, kind: ToastNotice['kind'] = "info") => {
    setNotification({ id: Date.now(), message, kind });
  };

  // Setup default course on first load
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;
  const formula = selectedCourse ? (COURSE_FORMULAS[selectedCourse.code] || COURSE_FORMULAS["default"]) : COURSE_FORMULAS["default"];

  const roster = useMemo(() => enrollments.filter((enrollment) =>
    enrollment.academicStatus === "MATRICULADO" && enrollment.programId === (selectedCourse?.careerId || selectedCourse?.career))
    .map((enrollment) => studentsList[enrollment.studentDni]).filter(Boolean), [enrollments, studentsList, selectedCourse]);
  const sheetData = useMemo(() => {
    const sheet: Record<string, string> = {};
    assignments.filter((assignment) => assignment.courseId === selectedCourseId && assignment.title.startsWith("[Planilla] "))
      .forEach((assignment) => {
        const variable = assignment.title.slice("[Planilla] ".length);
        assignment.submissions.forEach((submission) => {
          if (submission.grade !== undefined) sheet[`${submission.studentDni}-${variable}`] = String(submission.grade);
        });
      });
    return sheet;
  }, [assignments, selectedCourseId]);

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

  const handleSaveGradeSecure = async () => {
    if (saving || !selectedCourseId) return;
    if (tempGrade === "") {
      setGradeErrorMessage("La nota no puede estar vacía.");
      return;
    }
    const score = parseFloat(tempGrade);
    if (isNaN(score)) {
      setGradeErrorMessage("Formato de calificación incorrecto.");
      return;
    }
    if (!Number.isFinite(score) || score < 0 || score > 20) {
      setGradeErrorMessage("Calificación fuera de rango [0-20]. Permita únicamente valores válidos.");
      return;
    }

    const assessmentTitle = `[Planilla] ${activeVariableId}`;
    const existing = assignments.find((assignment) => assignment.courseId === selectedCourseId && assignment.title === assessmentTitle);
    const submissions = existing?.submissions.map((submission) => ({ ...submission })) || [];
    const index = submissions.findIndex((submission) => submission.studentDni === activeStudentDni);
    if (index >= 0) submissions[index] = { ...submissions[index], grade: score };
    else submissions.push({ studentDni: activeStudentDni, studentName: activeStudentName,
      fileName: "", submitDate: new Date().toISOString().slice(0, 10), grade: score });
    const assessment: CourseAssignment = existing ? { ...existing, submissions } : {
      id: `assessment-${Date.now()}`, kind: "assessment", courseId: selectedCourseId,
      title: assessmentTitle, description: "Componente de la planilla de calificaciones",
      dueDate: new Date().toISOString().slice(0, 10), submissions,
    };
    setSaving(true);
    try {
      const saved = await onUpdateAssignments(existing ? assignments.map((item) => item.id === existing.id ? assessment : item) : [...assignments, assessment]);
      if (!saved) { setGradeErrorMessage("No se pudo guardar la nota en el servidor. Intente nuevamente."); return; }
      setEditModalOpen(false);
      triggerNotification(`Nota de ${activeVariableId} guardada en el servidor.`, "success");
    } finally { setSaving(false); }
  };

  const handleSaveSheet = () => triggerNotification("Cada nota se guarda en el servidor al confirmar Guardar Nota.");
  const handlePublishOfficial = () => triggerNotification("Las notas están guardadas. La publicación de actas y su firma oficial siguen pendientes.");

  const handleExportExcel = () => {
    if (!selectedCourse) return;
    triggerNotification("La exportación Excel está pendiente de implementación.");
  };

  const handleExportPDF = () => {
    if (!selectedCourse) return;
    triggerNotification("La exportación PDF está pendiente de implementación.");
  };

  return (
    <div id="evaluaciones-cursos-sheet-screen" className="space-y-6 text-left relative font-sans">
      
      {notification ? <Toast notice={notification} onClose={closeNotification} /> : null}

      {/* 1. Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL DOCENTE • REGISTRO Y ACTAS DE CALIFICACIONES
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Evaluación Curricular por Curso
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Planilla digital con registro seguro de notas bajo firma digital (PIN), fórmulas ponderadas oficiales y consolidado de actas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="bg-white/10 border border-white/20 rounded-xl p-1.5 backdrop-blur-xs flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-amber-300 pl-2 hidden sm:inline font-mono">Curso:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-white text-slate-900 font-extrabold text-xs py-2 px-3 rounded-lg border-0 cursor-pointer transition-all outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cinta de Parámetros */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Asignatura Activa</span>
              <span className="font-extrabold text-white truncate max-w-[150px] block">{selectedCourse?.name || 'Seleccione'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Alumnos Evaluados</span>
              <span className="font-extrabold text-white">{roster.length} Matriculado{roster.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Award className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Escala Calificación</span>
              <span className="font-extrabold text-white">Vigesimal (00 - 20)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Seguridad Acta</span>
              <span className="font-extrabold text-white">Firma PIN Homologada</span>
            </div>
          </div>
        </div>
      </div>

      {selectedCourse ? (
        <div className="space-y-6">
          {/* Formula Display Summary Banner */}
          <CourseFormulaCard selectedCourse={selectedCourse} formula={formula} />

          {/* Interactive spreadsheet grid */}
          <GradeSheetTable
            students={roster}
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
        saving={saving}
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
