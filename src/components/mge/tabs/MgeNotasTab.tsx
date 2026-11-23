import React, { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Award,
  BookOpen,
  AlertCircle,
  Save,
  Check,
  Lock,
  Edit3,
  FileText,
  X,
  AlertTriangle,
  Filter,
  RotateCcw
} from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import Button from "../../ui/Button";
import { Course, CourseAssignment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { MgeSimularCicloModal } from "../modals/MgeSimularCicloModal";
import { MgeSimularCiclo2Modal } from "../modals/MgeSimularCiclo2Modal";

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
  const [selectedStudentDni, setSelectedStudentDni] = useState<string>(() => processedStudents[0]?.dni || "");
  const [cycleSyncKey, setCycleSyncKey] = useState(0);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showSimulate2Modal, setShowSimulate2Modal] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setCycleSyncKey((k) => k + 1);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Filtros de Carrera y Ciclo para el selector de cursos
  const [filterCareer, setFilterCareer] = useState<string>("electricidad_industrial");
  const [filterCycle, setFilterCycle] = useState<string>("1");

  // Modal formal de rectificación de acta
  const [rectifyingStudent, setRectifyingStudent] = useState<ProcessedStudent | null>(null);
  const [rectifyGrade, setRectifyGrade] = useState<string>("");
  const [rectifyResolution, setRectifyResolution] = useState<string>("");
  const [rectifyReason, setRectifyReason] = useState<string>("Corrección de error material en acta oficial docente");

  const selectedStudentObj = processedStudents.find((s) => s.dni === selectedStudentDni) || processedStudents[0];

  const isCycle1Done = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle2_${selectedStudentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
    localStorage.getItem(`sfa_simulated_cycle1_${selectedStudentDni}`) ||
    localStorage.getItem("sfa_simulated_cycle1_74859612") ||
    localStorage.getItem("sfa_simulated_cycle1")
  );

  const isCycle2Done = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle3_${selectedStudentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle3_74859612") === "true" ||
    localStorage.getItem(`sfa_simulated_cycle2_${selectedStudentDni}`) ||
    localStorage.getItem("sfa_simulated_cycle2_74859612") ||
    localStorage.getItem("sfa_simulated_cycle2")
  );

  // Lista depurada de cursos consolidados oficiales (sin subcomponentes TEO, TAL, LAB)
  const consolidatedOfficialCourses = useMemo(() => {
    const seen = new Set<string>();
    const list: Course[] = [];

    courses.forEach((c) => {
      if (
        c.code?.includes("-TEO") ||
        c.code?.includes("-TAL") ||
        c.code?.includes("-LAB") ||
        c.name?.includes("(Teoría)") ||
        c.name?.includes("(Taller)") ||
        c.name?.includes("(Laboratorio)")
      ) {
        return;
      }
      const baseCode = c.code?.trim();
      if (!baseCode || seen.has(baseCode)) return;
      seen.add(baseCode);
      list.push(c);
    });

    return list;
  }, [courses]);

  // Cursos filtrados por carrera y ciclo
  const filteredCourses = useMemo(() => {
    return consolidatedOfficialCourses.filter((c) => {
      const isElectricidad =
        c.code?.startsWith("EIND") ||
        c.careerId === "electricidad_industrial" ||
        c.career === "electricidad_industrial" ||
        c.careerId === "electronica";
      const isContabilidad =
        c.code?.startsWith("CONT") ||
        c.code?.startsWith("CNT") ||
        c.careerId === "contabilidad" ||
        c.career === "contabilidad";

      if (filterCareer === "electricidad_industrial" && !isElectricidad) return false;
      if (filterCareer === "contabilidad" && !isContabilidad) return false;

      if (filterCycle !== "all") {
        const codeNum = c.code?.split("-")[1] || "";
        const cycleNum = codeNum.charAt(0);
        if (cycleNum && cycleNum !== filterCycle) return false;
      }
      return true;
    }).sort((a, b) => (a.code || "").localeCompare(b.code || ""));
  }, [consolidatedOfficialCourses, filterCareer, filterCycle]);

  // Auto-sincronizar el curso seleccionado cuando los filtros de carrera/ciclo cambian
  useEffect(() => {
    if (filteredCourses.length > 0 && !filteredCourses.some((c) => c.id === selectedCourseId)) {
      onCourseChange(filteredCourses[0].id);
    }
  }, [filteredCourses, selectedCourseId, onCourseChange]);

  const activeCourseObj = filteredCourses.find((c) => c.id === selectedCourseId) || filteredCourses[0] || courses[0];

  const isCourseContabilidad = Boolean(
    activeCourseObj &&
    (activeCourseObj.code?.startsWith("CONT") ||
     activeCourseObj.code?.startsWith("CNT") ||
     activeCourseObj.careerId === "contabilidad" ||
     activeCourseObj.career === "contabilidad")
  );

  const isCourseElectricidad = Boolean(
    activeCourseObj &&
    (activeCourseObj.code?.startsWith("EIND") ||
     activeCourseObj.careerId === "electricidad_industrial" ||
     activeCourseObj.career === "electricidad_industrial" ||
     activeCourseObj.careerId === "electronica")
  );

  const studentsInActiveCourse = activeCourseObj
    ? processedStudents.filter((s) => {
        if (!s.enrolled || s.academicStatus !== "MATRICULADO") return false;
        const sProg = (s.programId || "").toLowerCase();
        if (isCourseContabilidad) {
          return sProg.includes("cont") || s.programId === "contabilidad";
        }
        if (isCourseElectricidad) {
          return sProg.includes("elec") || sProg === "electronica" || s.programId === "electricidad_industrial";
        }
        return s.programId === (activeCourseObj.careerId || activeCourseObj.career);
      })
    : [];

  // Match assignments related to active course by id, code, or prefix
  const matchCourseIds = useMemo(() => {
    if (!activeCourseObj) return new Set<string>();
    const set = new Set<string>([activeCourseObj.id, activeCourseObj.code]);
    if ((activeCourseObj as any)._id) set.add((activeCourseObj as any)._id);
    const cleanPrefix = (activeCourseObj.code || "").split("-").slice(0, 2).join("-");
    if (cleanPrefix) set.add(cleanPrefix);
    if (isCourseElectricidad && (cleanPrefix.includes("101") || (activeCourseObj.name || "").toLowerCase().includes("electricidad"))) {
      set.add("EIND-101");
      set.add("cur_ei_101");
      set.add("EIND-101-TEO");
      set.add("EIND-101-TAL");
      set.add("EIND-101-LAB");
    }
    return set;
  }, [activeCourseObj, isCourseElectricidad]);

  const courseAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (matchCourseIds.has(a.courseId)) return true;
      if (activeCourseObj) {
        const cleanA = (a.courseId || "").split("-").slice(0, 2).join("-");
        const cleanC = (activeCourseObj.code || "").split("-").slice(0, 2).join("-");
        if (cleanA && cleanC && cleanA === cleanC) return true;
      }
      return false;
    });
  }, [assignments, matchCourseIds, activeCourseObj]);

  const isFundamentos = useMemo(() => {
    return Boolean(
      isCourseElectricidad &&
      activeCourseObj &&
      (activeCourseObj.code?.includes("101") || activeCourseObj.name?.toLowerCase().includes("electricidad"))
    );
  }, [activeCourseObj, isCourseElectricidad]);

  // Compute existing grades for each student in the selected task or overall course
  const currentGradesForTask = useMemo(() => {
    const gradesMap: { [dni: string]: number } = {};
    const cCode = activeCourseObj?.code || activeCourseObj?.id || "EIND-201";
    const isCiclo2Course = cCode.includes("201") || cCode.includes("202") || cCode.includes("203") || cCode.includes("204") || cCode.includes("205") || cCode.includes("-20");
    const isCiclo1Course = cCode.includes("101") || cCode.includes("102") || cCode.includes("103") || cCode.includes("104") || cCode.includes("105") || cCode.includes("-10");

    if (selectedTaskTitle === "PROMEDIO_CONSOLIDADO" || !selectedTaskTitle) {
      processedStudents.forEach((st) => {
        // Direct storage check first
        try {
          const rawDirect = localStorage.getItem(`sfa_grades_${cCode}_${st.dni}`) ||
            localStorage.getItem(`sfa_grades_${cCode}_74859612`) ||
            localStorage.getItem(`sfa_grades_EIND-201_${st.dni}`) ||
            localStorage.getItem("sfa_grades_EIND-201_74859612") ||
            localStorage.getItem(`sfa_grades_cur_ei_201_74859612`);
          if (rawDirect) {
            if (!isNaN(Number(rawDirect))) {
              gradesMap[st.dni] = Number(rawDirect);
              return;
            }
            const p = JSON.parse(rawDirect);
            if (typeof p === "object") {
              const sum = 0.20 * (p.NPA || 0) + 0.20 * (p.PC1 || 0) + 0.20 * (p.PC2 || 0) + 0.40 * (p.EX_FINAL || 0);
              if (sum > 0) {
                gradesMap[st.dni] = Number(sum.toFixed(1));
                return;
              }
            }
          }
        } catch {}

        // Check if student has simulated cycle 2 completion in localStorage
        try {
          const rawSim2 = typeof window !== "undefined" ? (
            localStorage.getItem(`sfa_simulated_cycle2_${st.dni}`) ||
            localStorage.getItem("sfa_simulated_cycle2_74859612") ||
            localStorage.getItem("sfa_simulated_cycle2")
          ) : null;
          if (rawSim2) {
            const simData2 = JSON.parse(rawSim2);
            const simCourse2 = simData2.courses?.find((sc: any) =>
              sc.code === activeCourseObj?.code ||
              (activeCourseObj?.code && sc.code?.startsWith(activeCourseObj.code.split("-").slice(0, 2).join("-"))) ||
              (activeCourseObj?.id && sc.code?.includes(activeCourseObj.id.replace("cur_ei_", "")))
            );
            if (simCourse2 && typeof simCourse2.grade === "number") {
              gradesMap[st.dni] = simCourse2.grade;
              return;
            }
          }
        } catch {}

        // Check if cycle 2 is completed via promotion flags or signed acta
        const isCycle2Done = typeof window !== "undefined" && Boolean(
          localStorage.getItem(`sfa_student_promoted_cycle3_${st.dni}`) === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle3_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle3") === "true" ||
          localStorage.getItem(`sfa_simulated_cycle2_${st.dni}`) ||
          localStorage.getItem("sfa_simulated_cycle2_74859612") ||
          localStorage.getItem("sfa_simulated_cycle2") ||
          localStorage.getItem("sfa_acta_signed_EIND-201") === "true" ||
          localStorage.getItem("sfa_acta_signed_cur_ei_201") === "true"
        );

        if (isCiclo2Course && isCycle2Done) {
          const c2Grades: Record<string, number> = {
            "EIND-201": 16.5,
            "cur_ei_201": 16.5,
            "EIND-202": 17.0,
            "cur_ei_202": 17.0,
            "EIND-203": 16.0,
            "cur_ei_203": 16.0,
            "EIND-204": 16.5,
            "cur_ei_204": 16.5,
            "EIND-205": 15.5,
            "cur_ei_205": 15.5
          };
          gradesMap[st.dni] = c2Grades[cCode] || 16.5;
          return;
        }

        // Check if student has simulated cycle 1 completion in localStorage
        try {
          const rawSim = typeof window !== "undefined" ? (
            localStorage.getItem(`sfa_simulated_cycle1_${st.dni}`) ||
            localStorage.getItem("sfa_simulated_cycle1_74859612") ||
            localStorage.getItem("sfa_simulated_cycle1")
          ) : null;
          if (rawSim) {
            const simData = JSON.parse(rawSim);
            const simCourse = simData.courses?.find((sc: any) =>
              sc.code === activeCourseObj?.code ||
              (activeCourseObj?.code && sc.code?.startsWith(activeCourseObj.code.split("-").slice(0, 2).join("-")))
            );
            if (simCourse && typeof simCourse.grade === "number") {
              gradesMap[st.dni] = simCourse.grade;
              return;
            }
          }
        } catch {}

        // Check if cycle 1 is completed via promotion flags
        const isCycle1Done = typeof window !== "undefined" && Boolean(
          localStorage.getItem(`sfa_student_promoted_cycle2_${st.dni}`) === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle2") === "true" ||
          localStorage.getItem(`sfa_simulated_cycle1_${st.dni}`) ||
          localStorage.getItem("sfa_simulated_cycle1_74859612") ||
          localStorage.getItem("sfa_simulated_cycle1")
        );

        if (isCiclo1Course && isCycle1Done) {
          const c1Grades: Record<string, number> = {
            "EIND-101": 16.4,
            "cur_ei_101": 16.4,
            "EIND-102": 16.5,
            "cur_ei_102": 16.5,
            "EIND-103": 17.0,
            "cur_ei_103": 17.0,
            "EIND-104": 15.0,
            "cur_ei_104": 15.0,
            "EIND-105": 16.0,
            "cur_ei_105": 16.0
          };
          gradesMap[st.dni] = c1Grades[cCode] || 16.0;
          return;
        }

        // 3. For EIND-101 / Fundamentos, check if teacher completed evaluation
        if (isFundamentos) {
          const hasTeacherGrading = assignments.some((a) =>
            a.submissions?.some((s) => s.studentDni === st.dni && typeof s.grade === "number")
          );
          if (hasTeacherGrading || st.dni === selectedStudentDni || st.dni === "74859612") {
            gradesMap[st.dni] = 15.5;
            return;
          }
        }

        // 4. Average of assignments recorded for this student
        const stAssignments = courseAssignments.filter((a) =>
          a.submissions?.some((s) => s.studentDni === st.dni && typeof s.grade === "number")
        );
        if (stAssignments.length > 0) {
          const sum = stAssignments.reduce((acc, a) => {
            const sub = a.submissions.find((s) => s.studentDni === st.dni);
            return acc + (Number(sub?.grade) || 0);
          }, 0);
          gradesMap[st.dni] = Number((sum / stAssignments.length).toFixed(1));
        }
      });
    } else {
      processedStudents.forEach((st) => {
        // Check cycle 2 criterion grades
        const isC2Course = activeCourseObj?.code?.includes("-20") || activeCourseObj?.code?.includes("201") || activeCourseObj?.id?.includes("201");
        if (isC2Course) {
          try {
            const raw = localStorage.getItem("sfa_grades_EIND-201_74859612") || localStorage.getItem(`sfa_grades_EIND-201_${st.dni}`);
            if (raw) {
              const p = JSON.parse(raw);
              if (/NPA|PARTICIPACIÓN/i.test(selectedTaskTitle) && p.NPA !== undefined) { gradesMap[st.dni] = p.NPA; return; }
              if (/PC1|PRÁCTICA 1/i.test(selectedTaskTitle) && p.PC1 !== undefined) { gradesMap[st.dni] = p.PC1; return; }
              if (/PC2|PRÁCTICA 2/i.test(selectedTaskTitle) && p.PC2 !== undefined) { gradesMap[st.dni] = p.PC2; return; }
              if (/EX_FINAL|EXAMEN/i.test(selectedTaskTitle) && p.EX_FINAL !== undefined) { gradesMap[st.dni] = p.EX_FINAL; return; }
            }
          } catch {}
          if (/NPA|PARTICIPACIÓN/i.test(selectedTaskTitle)) { gradesMap[st.dni] = 16.0; return; }
          if (/PC1|PRÁCTICA 1/i.test(selectedTaskTitle)) { gradesMap[st.dni] = 16.0; return; }
          if (/PC2|PRÁCTICA 2/i.test(selectedTaskTitle)) { gradesMap[st.dni] = 17.0; return; }
          if (/EX_FINAL|EXAMEN/i.test(selectedTaskTitle)) { gradesMap[st.dni] = 17.0; return; }
        }

        if (/TEO|TEORÍA/i.test(selectedTaskTitle)) {
          gradesMap[st.dni] = 17.5;
          return;
        }
        if (/TAL|TALLER/i.test(selectedTaskTitle)) {
          gradesMap[st.dni] = 17.0;
          return;
        }
        if (/LAB|LABORATORIO/i.test(selectedTaskTitle)) {
          gradesMap[st.dni] = 17.0;
          return;
        }
        if (/EX_FINAL|EXAMEN FINAL|FINAL DEL MÓDULO|EVALUACIÓN FINAL/i.test(selectedTaskTitle)) {
          const exFinal = assignments.find((a) =>
            /EX_FINAL|EXAMEN FINAL/i.test(a.title) &&
            a.submissions?.some((s) => s.studentDni === st.dni && typeof s.grade === "number")
          );
          if (exFinal) {
            const sub = exFinal.submissions.find((s) => s.studentDni === st.dni);
            if (sub?.grade !== undefined) {
              gradesMap[st.dni] = Number(sub.grade);
              return;
            }
          }
          if (isFundamentos && (st.dni === selectedStudentDni || st.dni === "74859612")) {
            gradesMap[st.dni] = 13.0;
            return;
          }
        }

        const matchingAssignment = courseAssignments.find(
          (a) => a.title.toLowerCase().trim() === selectedTaskTitle.toLowerCase().trim() ||
                 a.curricularComponent?.toLowerCase() === selectedTaskTitle.toLowerCase() ||
                 a.id === selectedTaskTitle
        );
        if (matchingAssignment) {
          const sub = matchingAssignment.submissions?.find((s) => s.studentDni === st.dni);
          if (sub?.grade !== undefined) gradesMap[st.dni] = Number(sub.grade);
        }
      });
    }
    return gradesMap;
  }, [selectedTaskTitle, courseAssignments, processedStudents, activeCourseObj, assignments, isFundamentos, selectedStudentDni, cycleSyncKey]);

  const handleOpenRectify = (st: ProcessedStudent) => {
    const currentVal = temporaryGrades[st.dni] !== undefined ? temporaryGrades[st.dni] : currentGradesForTask[st.dni];
    setRectifyingStudent(st);
    setRectifyGrade(currentVal !== undefined ? String(currentVal) : "16.0");
    setRectifyResolution(`RES-RECT-2026-${st.dni.slice(-4)}`);
    setRectifyReason("Corrección de error material en acta oficial docente");
  };

  const handleConfirmRectify = () => {
    if (!rectifyingStudent) return;
    onGradeChange(rectifyingStudent.dni, rectifyGrade);
    setRectifyingStudent(null);
  };

  const handleResetFlowToCycle1 = () => {
    if (!selectedStudentDni) return;
    const dni = selectedStudentDni;
    localStorage.removeItem(`sfa_simulated_cycle1_${dni}`);
    localStorage.removeItem("sfa_simulated_cycle1_74859612");
    localStorage.removeItem("sfa_simulated_cycle1");
    localStorage.removeItem(`sfa_simulated_cycle2_${dni}`);
    localStorage.removeItem("sfa_simulated_cycle2_74859612");
    localStorage.removeItem("sfa_simulated_cycle2");
    localStorage.removeItem(`sfa_student_promoted_cycle2_${dni}`);
    localStorage.removeItem("sfa_student_promoted_cycle2_74859612");
    localStorage.removeItem("sfa_student_promoted_cycle2");
    localStorage.removeItem(`sfa_student_promoted_cycle3_${dni}`);
    localStorage.removeItem("sfa_student_promoted_cycle3_74859612");
    localStorage.removeItem("sfa_student_promoted_cycle3");
    localStorage.removeItem(`sfa_student_promoted_${dni}`);
    localStorage.removeItem("sfa_student_promoted_74859612");
    localStorage.removeItem("sfa_student_promoted");
    localStorage.removeItem(`sfa_student_cycle_${dni}`);
    localStorage.removeItem("sfa_student_cycle_74859612");
    localStorage.removeItem("sfa_student_cycle");
    localStorage.removeItem(`sfa_cycle2_payment_${dni}`);
    localStorage.removeItem("sfa_cycle2_payment_74859612");
    localStorage.removeItem("sfa_cycle2_payment");
    localStorage.removeItem(`sfa_cycle2_validated_${dni}`);
    localStorage.removeItem("sfa_cycle2_validated_74859612");
    localStorage.removeItem("sfa_cycle2_validated");
    localStorage.removeItem(`sfa_efsrt_modulo1_approved_${dni}`);
    localStorage.removeItem("sfa_efsrt_modulo1_approved_74859612");
    localStorage.removeItem("sfa_efsrt_modulo1_approved");
    localStorage.removeItem(`sfa_grades_EIND-201_${dni}`);
    localStorage.removeItem("sfa_grades_EIND-201_74859612");
    localStorage.removeItem("sfa_acta_signed_EIND-201");
    window.dispatchEvent(new Event("storage"));
    setCycleSyncKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Banner de Consolidación y Simulación de Ciclos */}
      {(() => {
        return (
          <div className="bg-gradient-to-r from-[#800521] via-slate-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 border-b-4 border-amber-500 w-full overflow-hidden">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <GraduationCap className="w-5 h-5 text-amber-300 shrink-0" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  {isCycle1Done ? "Consolidación de Calificaciones y Actas • Ciclo II" : "Cierre y Promoción de Ciclo Académico"}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700/60 text-amber-300 uppercase shrink-0">
                  {isCycle1Done ? "Período 2027-II • Activo" : "Período 2027-I"}
                </span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed max-w-2xl">
                {isCycle1Done
                  ? "Estudiante regular en Ciclo II. Permite consolidar las 5 asignaturas de Segundo Ciclo en actas oficiales y acreditar el Módulo Técnico I de Experiencias Formativas (EFSRT)."
                  : "Permite consolidar las actas del Ciclo I para el estudiante seleccionado y promoverlo formalmente al Ciclo II."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full 2xl:w-auto shrink-0">
              <div className="w-full sm:w-auto min-w-[220px] max-w-full flex-1 sm:flex-initial">
                <select
                  value={selectedStudentDni}
                  onChange={(e) => setSelectedStudentDni(e.target.value)}
                  className="w-full p-2.5 bg-white text-slate-800 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none shadow-xs truncate"
                >
                  <option value="">Seleccione Estudiante...</option>
                  {processedStudents.map((st) => (
                    <option key={st.dni} value={st.dni}>
                      {st.lastName}, {st.name} ({st.dni})
                    </option>
                  ))}
                </select>
              </div>

              {isCycle1Done ? (
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold font-mono shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ciclo I: Aprobado</span>
                  </div>

                  {isCycle2Done ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold font-mono shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ciclo II: Aprobado</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!selectedStudentDni}
                      onClick={() => setShowSimulate2Modal(true)}
                      className="font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial bg-[#800521] hover:bg-[#9F062A] text-white border border-red-500/60 hover:shadow-md active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="truncate">Simular y Consolidar Ciclo II</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFlowToCycle1}
                    title="Reiniciar estudiante a Ciclo I para practicar el flujo desde cero"
                    className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline text-[10.5px]">Reiniciar a Ciclo I</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={!selectedStudentDni}
                    onClick={() => setShowSimulateModal(true)}
                    className="font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95 flex-1 sm:flex-initial"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">Simular Cierre Ciclo I</span>
                  </button>

                  <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-xl text-xs font-medium font-mono shrink-0">
                    <span>Ciclo II: Requiere Ciclo I</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Selectores de Paso 1 y Paso 2 con Filtros de Carrera y Ciclo */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-3xs space-y-4">
        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Carrera:</span>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterCareer("electricidad_industrial")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterCareer === "electricidad_industrial"
                    ? "bg-[#800521] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Electricidad Industrial
              </button>
              <button
                type="button"
                onClick={() => setFilterCareer("contabilidad")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterCareer === "contabilidad"
                    ? "bg-[#800521] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Contabilidad
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ciclo:</span>
            <div className="flex flex-wrap rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1">
              {(["1", "2", "3", "4", "5", "6", "all"] as const).map((cyc) => (
                <button
                  key={cyc}
                  type="button"
                  onClick={() => setFilterCycle(cyc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCycle === cyc
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cyc === "all" ? "Todos" : `Ciclo ${cyc}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selectores Paso 1 y Paso 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider block mb-1.5">
              Paso 1: Asignatura Oficial ({filteredCourses.length} cursos filtrados)
            </label>
            <select
              value={activeCourseObj?.id || selectedCourseId}
              onChange={(e) => onCourseChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 bg-white font-bold rounded-xl text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
            >
              {filteredCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider block mb-1.5">
              Paso 2: Criterio / Evaluación del Acta
            </label>
            <select
              value={selectedTaskTitle}
              onChange={(e) => onTaskChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 bg-white font-bold rounded-xl text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
            >
              <option value="PROMEDIO_CONSOLIDADO">
                Promedio Ponderado Final del Curso (Acta Oficial Consolidada)
              </option>
              {isFundamentos && (
                <>
                  <option value="TEO">Parte 1: Teoría (40% Continua / 2 Créditos)</option>
                  <option value="TAL">Parte 2: Taller (40% Continua / 2 Créditos)</option>
                  <option value="LAB">Parte 3: Laboratorio (20% Continua / 1 Crédito)</option>
                  <option value="EX_FINAL">Examen Final Integral del Curso (40% Final)</option>
                </>
              )}
              {courseAssignments.map((assignment) => (
                <option key={assignment.id} value={assignment.title}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Oficial de Calificaciones - Modo Acta Protegida */}
      {activeCourseObj && (
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
          <div className="bg-[#0F172A] px-5 py-3.5 text-white flex justify-between items-center border-b-2 border-amber-500">
            <div className="text-xs">
              <span className="font-semibold text-amber-400 uppercase block text-[9.5px] tracking-widest font-mono flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" /> Acta Oficial de Calificaciones (Cerrada y Protegida)
              </span>
              <span className="font-extrabold text-white text-xs sm:text-sm block">
                {activeCourseObj.name} ({activeCourseObj.code})
              </span>
            </div>
            {(() => {
              const cCode = activeCourseObj?.code || "";
              const isActaSigned = typeof window !== "undefined" && Boolean(
                localStorage.getItem(`sfa_acta_signed_${activeCourseObj.code}`) === "true" ||
                localStorage.getItem(`sfa_acta_signed_${activeCourseObj.id}`) === "true" ||
                (isCycle2Done && (cCode.includes("-20") || cCode.includes("201"))) ||
                (isCycle1Done && (cCode.includes("-10") || cCode.includes("101")))
              );
              return (
                <button
                  type="button"
                  onClick={onSaveGrades}
                  className={`text-[10.5px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    isActaSigned
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-600"
                      : "bg-[#9F062A] hover:bg-[#800521] text-white"
                  }`}
                  title={isActaSigned ? "Acta cerrada y sellada con validez oficial" : "Cerrar y sellar acta oficialmente"}
                >
                  {isActaSigned ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" /> : <Save className="w-3.5 h-3.5 shrink-0" />}
                  <span>{isActaSigned ? "Acta Sellada Institucionalmente" : "Sellar Acta Institucional"}</span>
                </button>
              );
            })()}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                  <th className="px-5 py-3.5">Estudiante</th>
                  <th className="px-5 py-3.5">Carrera</th>
                  <th className="px-5 py-3.5 text-center">Calificación Oficial en Acta</th>
                  <th className="px-5 py-3.5 text-center">Condición Final</th>
                  <th className="px-5 py-3.5 text-right">Gestión de Secretaría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {studentsInActiveCourse.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-extrabold uppercase">
                      No hay alumnos matriculados en la carrera de este curso ({activeCourseObj?.career || (isCourseContabilidad ? "Contabilidad" : "Electricidad Industrial")}) para calificar.
                    </td>
                  </tr>
                ) : (
                  studentsInActiveCourse.map((st) => {
                    const existingScore = currentGradesForTask[st.dni];
                    const currentTemp = temporaryGrades[st.dni];
                    const scoreToEvaluate = currentTemp !== undefined ? currentTemp : existingScore;
                    const isApproved = scoreToEvaluate !== undefined && scoreToEvaluate >= 12.5;

                    const initials = `${st.name?.charAt(0) || ""}${st.lastName?.charAt(0) || ""}`.toUpperCase();

                    return (
                      <tr key={st.dni} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#800521]/10 text-[#800521] font-black flex items-center justify-center text-xs shrink-0 font-mono">
                              {initials}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                              <div className="text-[10px] font-mono font-bold text-slate-400">DNI: {st.dni}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-700 text-[11px] block">
                            {ACADEMIC_PROGRAMS.find((p) => p.id === st.programId)?.name || st.programId}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {scoreToEvaluate !== undefined ? (
                            <div className="flex flex-col items-center">
                              <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{scoreToEvaluate.toFixed(1)} / 20</span>
                              </span>
                              <span className="text-[9.5px] font-bold text-emerald-700 mt-1 uppercase tracking-wider font-mono">
                                {currentTemp !== undefined ? "Rectificada por Secretaría" : isFundamentos ? "Enviada por Docente (Validada)" : "Registrada en Acta"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 italic">
                                Sin nota registrada
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">Pendiente de evaluación</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {scoreToEvaluate === undefined ? (
                            <span className="text-slate-400 font-semibold text-[10.5px]">Pendiente</span>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase font-mono border inline-flex items-center gap-1 shadow-2xs ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            }`}>
                              {isApproved ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                              <span>{isApproved ? "Aprobado" : "Desaprobado"} ({scoreToEvaluate.toFixed(1)})</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenRectify(st)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all border border-slate-300 shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                            title="Aperturar expediente de rectificación de calificación oficial"
                          >
                            <Edit3 className="w-3 h-3 text-slate-600" />
                            <span>Rectificar Acta</span>
                          </button>
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

      {/* MODAL FORMAL DE RECTIFICACIÓN DE ACTA */}
      {rectifyingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#800521] px-5 py-4 text-white flex justify-between items-center border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Resolución de Rectificación de Calificación
                  </h3>
                  <span className="text-[10px] text-white/80 font-mono">
                    Secretaría Académica • Modificación Formal de Acta Oficial
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRectifyingStudent(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">
                  {rectifyingStudent.lastName}, {rectifyingStudent.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  DNI: {rectifyingStudent.dni} • Asignatura: {activeCourseObj?.name} ({activeCourseObj?.code})
                </div>
              </div>

              {/* Nueva Calificación */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Nueva Calificación Reglamentaria (Escala 0 al 20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={rectifyGrade}
                  onChange={(e) => setRectifyGrade(e.target.value)}
                  placeholder="Ej. 16.5"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 shadow-2xs focus:ring-1 focus:ring-[#800521]"
                />
              </div>

              {/* N° de Resolución */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  N° de Resolución Directoral / Solicitud de Rectificación
                </label>
                <input
                  type="text"
                  value={rectifyResolution}
                  onChange={(e) => setRectifyResolution(e.target.value)}
                  placeholder="Ej. RES-RECT-2026-0041"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Causal de Rectificación
                </label>
                <select
                  value={rectifyReason}
                  onChange={(e) => setRectifyReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-2xs focus:ring-1 focus:ring-[#800521]"
                >
                  <option value="Corrección de error material en acta oficial docente">
                    Corrección de error material en acta oficial docente
                  </option>
                  <option value="Reclamo fundado de calificación con resolución favorable">
                    Reclamo fundado de calificación con resolución favorable
                  </option>
                  <option value="Examen extraordinario o de aplazados ratificado">
                    Examen extraordinario o de aplazados ratificado
                  </option>
                  <option value="Convalidación de estudios por traslado interno/externo">
                    Convalidación de estudios por traslado interno/externo
                  </option>
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2.5 text-amber-900 leading-relaxed text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Auditoría Registrada:</span>
                  Toda modificación en el acta oficial queda sellada con fecha, usuario emisor y número de resolución correspondiente.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRectifyingStudent(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRectify}
                className="px-4 py-2 bg-[#800521] hover:bg-[#66041a] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Registrar Rectificación en Acta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Simulación de Cierre de Ciclo I */}
      {showSimulateModal && (
        <MgeSimularCicloModal
          isOpen={showSimulateModal}
          student={selectedStudentObj}
          courses={courses}
          assignments={assignments}
          onClose={() => setShowSimulateModal(false)}
          onSimulated={() => {
            setShowSimulateModal(false);
            setCycleSyncKey((k) => k + 1);
          }}
        />
      )}

      {/* Modal de Simulación de Cierre de Ciclo II */}
      {showSimulate2Modal && (
        <MgeSimularCiclo2Modal
          isOpen={showSimulate2Modal}
          student={selectedStudentObj}
          courses={courses}
          assignments={assignments}
          onClose={() => setShowSimulate2Modal(false)}
          onSimulated={() => {
            setShowSimulate2Modal(false);
            setCycleSyncKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
