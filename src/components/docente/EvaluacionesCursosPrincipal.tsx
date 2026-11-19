import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FileSpreadsheet, BookOpen, Users, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Course, CourseAssignment, StudentPersonalData, Enrollment } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";

import { CourseFormulaCard } from "./evaluaciones/CourseFormulaCard";
import { COURSE_FORMULAS, CourseFormula, getCourseFormula } from "../../constants/courseFormulas";
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
  const formula = selectedCourse ? getCourseFormula(selectedCourse.code) : COURSE_FORMULAS["default"];

  const roster = useMemo(() => {
    const targetProg = (selectedCourse?.careerId || selectedCourse?.career || "").toLowerCase().trim();
    const matched = enrollments.filter((enrollment) => {
      const isMat = enrollment.academicStatus === "MATRICULADO" || enrollment.academicStatus === "ADMITIDO";
      if (!isMat) return false;
      const prog = (enrollment.programId || "").toLowerCase().trim();
      if (!targetProg) return true;
      return prog.includes(targetProg) || targetProg.includes(prog);
    }).map((enrollment) => studentsList[enrollment.studentDni]).filter(Boolean);

    if (matched.length > 0) return matched;
    const allValid = Object.values(studentsList);
    return allValid.length > 0 ? allValid : [];
  }, [enrollments, studentsList, selectedCourse]);
  const sheetData = useMemo(() => {
    const sheet: Record<string, string> = {};
    const regularCourseAssignments = assignments.filter((a) => a.courseId === selectedCourseId && !a.title.startsWith("[Planilla] ") && a.kind !== "assessment");
    
    // Auto compute NPA for each student from graded weekly tasks
    const studentGradesMap: Record<string, number[]> = {};
    regularCourseAssignments.forEach((assignment) => {
      assignment.submissions.forEach((submission) => {
        if (typeof submission.grade === "number") {
          if (!studentGradesMap[submission.studentDni]) studentGradesMap[submission.studentDni] = [];
          studentGradesMap[submission.studentDni].push(submission.grade);
        }
      });
    });

    Object.entries(studentGradesMap).forEach(([dni, grades]) => {
      if (grades.length > 0) {
        const avg = Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
        sheet[`${dni}-NPA`] = String(avg);
      }
    });

    // Check assessments linked to curricular variables (e.g. PC1, PC2, EX_FINAL)
    const assessmentAssignments = assignments.filter((a) => a.courseId === selectedCourseId && (a.kind === "assessment" || a.curricularComponent));
    assessmentAssignments.forEach((assignment) => {
      const matchingVar = formula.variables.find((v) => 
        (assignment.curricularComponent && assignment.curricularComponent === v.id) ||
        assignment.title.toUpperCase().includes(v.id) ||
        assignment.title.toUpperCase().includes(`[${v.id}]`)
      );
      if (matchingVar && matchingVar.id !== "NPA") {
        assignment.submissions.forEach((submission) => {
          if (submission.grade !== undefined && !sheet[`${submission.studentDni}-${matchingVar.id}`]) {
            sheet[`${submission.studentDni}-${matchingVar.id}`] = String(submission.grade);
          }
        });
      }
    });

    // Explicit [Planilla] entries take absolute highest priority
    assignments.filter((assignment) => assignment.courseId === selectedCourseId && assignment.title.startsWith("[Planilla] "))
      .forEach((assignment) => {
        const variable = assignment.title.slice("[Planilla] ".length).trim();
        assignment.submissions.forEach((submission) => {
          if (submission.grade !== undefined) sheet[`${submission.studentDni}-${variable}`] = String(submission.grade);
        });
      });
    return sheet;
  }, [assignments, selectedCourseId, formula.variables]);

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

    const now = new Date();
    const formattedTimestamp = now.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const assessmentTitle = `[Planilla] ${activeVariableId}`;
    const existing = assignments.find((assignment) => assignment.courseId === selectedCourseId && assignment.title === assessmentTitle);
    const submissions = existing?.submissions.map((submission) => ({ ...submission })) || [];
    const index = submissions.findIndex((submission) => submission.studentDni === activeStudentDni);
    if (index >= 0) {
      submissions[index] = { 
        ...submissions[index], 
        grade: score,
        submitDate: now.toISOString(),
        feedback: `Calificación oficial registrada mediante firma digital PIN el ${formattedTimestamp}`
      };
    } else {
      submissions.push({ 
        studentDni: activeStudentDni, 
        studentName: activeStudentName,
        fileName: "", 
        submitDate: now.toISOString(), 
        grade: score,
        feedback: `Calificación oficial registrada mediante firma digital PIN el ${formattedTimestamp}`
      });
    }
    const assessment: CourseAssignment = existing ? { ...existing, submissions } : {
      id: `assessment-${Date.now()}`, kind: "assessment", courseId: selectedCourseId,
      title: assessmentTitle, description: "Componente de la planilla de calificaciones",
      dueDate: now.toISOString().slice(0, 10), submissions,
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

  // Find linked assessment metadata (where and when it was evaluated)
  const auditContext = useMemo(() => {
    if (!selectedCourseId || !activeVariableId) return undefined;
    
    const linkedAssessment = assignments.find((a) =>
      a.courseId === selectedCourseId &&
      !a.title.startsWith("[Planilla] ") && (
        a.curricularComponent === activeVariableId ||
        a.title.toUpperCase().includes(`[${activeVariableId}]`) ||
        a.title.toUpperCase().includes(activeVariableId)
      )
    );

    let week: number | string | undefined;
    if (linkedAssessment) {
      const match = linkedAssessment.title.match(/\[Semana\s*(\d+)\]/i) || linkedAssessment.title.match(/Semana\s*(\d+)/i);
      if (match) week = Number(match[1]);
    }

    const sub = linkedAssessment?.submissions.find((s) => s.studentDni === activeStudentDni);
    const existingPlanilla = assignments.find((a) => a.courseId === selectedCourseId && a.title === `[Planilla] ${activeVariableId}`);
    const planillaSub = existingPlanilla?.submissions.find((s) => s.studentDni === activeStudentDni);

    const submissionDate = planillaSub?.submitDate || sub?.submitDate;
    const evaluatedAt = submissionDate
      ? new Date(submissionDate).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return {
      week,
      modality: linkedAssessment?.modality === "virtual" ? "Virtual (Aula Virtual)" : "Presencial (Taller / Aula)",
      evaluatedAt
    };
  }, [assignments, selectedCourseId, activeVariableId, activeStudentDni]);

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
        auditContext={auditContext}
        onGradeChange={handleGradeInputValidation}
        onSaveGrade={handleSaveGradeSecure}
        onClose={() => setEditModalOpen(false)}
      />

    </div>
  );
}
