import React, { useState, useEffect } from "react";
import { Printer, Download, Award, CheckCircle2, Mail, FileText, ClipboardList } from "lucide-react";
import { StudentPersonalData, Enrollment, AcademicProgram, CycleStatus, Course, CourseAssignment } from "../../../types";
import PageTransition from "../../ui/PageTransition";
import Toast, { ToastNotice } from "../../ui/Toast";
import { generateMatriculaPdf, generateCurriculumPlanPdf, generateBoletaNotasPdf } from "../../../utils/matriculaPdf";
import { computeCourseStats } from "./GradesTab";

interface ClosureTabProps {
  personalData: StudentPersonalData;
  enrollment: Enrollment;
  currentProgram?: AcademicProgram;
  courses?: Course[];
  enrichedCourses?: any[];
  assignments?: CourseAssignment[];
  selectedAcademicOption: string;
  setSelectedAcademicOption: React.Dispatch<React.SetStateAction<string>>;
  selectedSemesterFilter: string;
  setSelectedSemesterFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedPlan: string;
  setSelectedPlan: React.Dispatch<React.SetStateAction<string>>;
  selectedQueryPeriod: string;
  setSelectedQueryPeriod: React.Dispatch<React.SetStateAction<string>>;
  selectedQueryCycle: "I" | "II" | "III" | "IV" | "V" | "VI";
  setSelectedQueryCycle: React.Dispatch<React.SetStateAction<"I" | "II" | "III" | "IV" | "V" | "VI">>;
  simulatedGrades: Record<string, number>;
  setSimulatedGrades: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  advisorConsultText: string;
  setAdvisorConsultText: React.Dispatch<React.SetStateAction<string>>;
  advisorConsultSuccess: boolean;
  setAdvisorConsultSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  cycleStatuses: CycleStatus[];
}

export const ClosureTab: React.FC<ClosureTabProps> = ({
  personalData,
  enrollment,
  currentProgram,
  courses = [],
  enrichedCourses = [],
  assignments = [],
  selectedAcademicOption,
  setSelectedAcademicOption,
  selectedSemesterFilter,
  setSelectedSemesterFilter,
  selectedPlan,
  setSelectedPlan,
  selectedQueryPeriod,
  setSelectedQueryPeriod,
  selectedQueryCycle,
  setSelectedQueryCycle,
  simulatedGrades,
  setSimulatedGrades,
  advisorConsultText,
  setAdvisorConsultText,
  advisorConsultSuccess,
  setAdvisorConsultSuccess,
  cycleStatuses
}) => {
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const [, setStorageSync] = useState(0);
  useEffect(() => {
    const handleSync = () => setStorageSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);
  const CORE_PLAN_COURSES: Record<string, Record<string, Array<{ code: string; name: string; type: string; credits: number; status: string; teo: number; pr: number }>>> = {
    "52": {
      "I": [
        { code: "CO-101", name: "Introducción a la Contabilidad", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-102", name: "Matemática Financiera", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 2, pr: 2 },
        { code: "CO-103", name: "Documentación Comercial y SUNAT", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-104", name: "Comunicación y Redacción", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ],
      "II": [
        { code: "CO-201", name: "Contabilidad General Aplicada", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-202", name: "Administración de Archivos Contables", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-203", name: "Sistema de Información Contable I", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-204", name: "Tributación y Legislación Comercial", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ],
      "III": [
        { code: "CO-301", name: "Contabilidad de Costos Industriales", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-302", name: "Análisis e Interpretación de EEFF", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-303", name: "Dinámica de Plan Contable PCGE", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 2, pr: 2 },
        { code: "CO-304", name: "Inglés Técnico de Negocios", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ],
      "IV": [
        { code: "CO-401", name: "Contabilidad de Costos Financieros", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-402", name: "Auditoría Tributaria Corporativa", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-403", name: "Regímenes Tributarios SUNAT", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-404", name: "Legislación Laboral General", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ],
      "V": [
        { code: "CO-501", name: "Contabilidad Gubernamental", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "CO-502", name: "Formulación de Estados Financieros", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "CO-503", name: "Auditoría Financiera Integral", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "CO-504", name: "Software Aplicado SISCONT / CONCAR", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "CO-505", name: "Ética en los Negocios y Finanzas", type: "Obligatorio", credits: 2, status: "Matriculado", teo: 1, pr: 2 }
      ],
      "VI": [
        { code: "CO-601", name: "Formulación de Proyectos de Inversión", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-602", name: "Comercio Exterior y Regímenes Aduaneros", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "CO-603", name: "Finanzas Corporativas y Mercado de Valores", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-604", name: "Seminario de Titulación y Prácticas EFSRT", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "CO-605", name: "Liderazgo, Gestión y Emprendimiento", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ]
    },
    "20": {
      "I": [
        { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", type: "General", credits: 3, status: "Matriculado", teo: 2, pr: 2 },
        { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", type: "General", credits: 2, status: "Matriculado", teo: 1, pr: 2 }
      ],
      "II": [
        { code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "EIND-202", name: "Electrónica Analógica y de Potencia Básica", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "EIND-203", name: "Taller de Medidas e Instrumentos Eléctricos", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "EIND-204", name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "EIND-205", name: "Inglés Técnico para Electricidad", type: "General", credits: 2, status: "Matriculado", teo: 1, pr: 2 }
      ],
      "III": [
        { code: "EIND-301", name: "Circuitos de Corriente Alterna", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "EIND-302", name: "Electrónica Analógica Aplicada", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "EIND-303", name: "Instalaciones de Interiores", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "EIND-304", name: "Inglés Técnico Académico", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ],
      "IV": [
        { code: "EIND-401", name: "Máquinas de Corriente Continua", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "EIND-402", name: "Sistemas Neumáticos e Hidráulicos", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "EIND-403", name: "Instalaciones Eléctricas III", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "EIND-404", name: "Relaciones en Entorno de Trabajo", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ],
      "V": [
        { code: "EIND-501", name: "Teoría de Circuitos II", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "EIND-502", name: "Lab. Maquinarias de Potencia", type: "Obligatorio", credits: 4, status: "Matriculado", teo: 2, pr: 4 },
        { code: "EIND-503", name: "Sistemas de Control Automático II", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "EIND-504", name: "Instalaciones Industriales Inteligentes", type: "Obligatorio", credits: 3, status: "Matriculado", teo: 1, pr: 4 },
        { code: "EIND-505", name: "Ética y Deontología Profesional", type: "Obligatorio", credits: 2, status: "Matriculado", teo: 1, pr: 2 }
      ],
      "VI": [
        { code: "EIND-601", name: "Controladores PLC y SCADA Industrial", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "EIND-602", name: "Mantenimiento Eléctrico de Potencia", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
        { code: "EIND-603", name: "Redes Industriales y Automatización", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "EIND-604", name: "Proyecto de Innovación y Titulación EFSRT", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
        { code: "EIND-605", name: "Gestión Empresarial y Empleabilidad", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
      ]
    }
  };

  const studentDni = personalData?.dni || enrollment?.studentDni || "74859612";
  const rawSim = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`) ||
    localStorage.getItem("sfa_simulated_cycle1_74859612") ||
    localStorage.getItem("sfa_simulated_cycle1")
  ) : null;
  const simData = rawSim ? (() => { try { return JSON.parse(rawSim); } catch { return null; } })() : null;

  const rawSim2 = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_simulated_cycle2_${studentDni}`) ||
    localStorage.getItem("sfa_simulated_cycle2_74859612") ||
    localStorage.getItem("sfa_simulated_cycle2")
  ) : null;
  const simData2 = rawSim2 ? (() => { try { return JSON.parse(rawSim2); } catch { return null; } })() : null;

  const isCycle2Simulated = Boolean(
    (simData2 && Array.isArray(simData2.courses) && simData2.courses.length > 0) ||
    (typeof window !== "undefined" && (
      localStorage.getItem(`sfa_student_promoted_cycle3_${studentDni}`) === "true" ||
      localStorage.getItem("sfa_student_promoted_cycle3_74859612") === "true" ||
      localStorage.getItem("sfa_student_promoted_cycle3") === "true" ||
      localStorage.getItem(`sfa_efsrt_modulo1_approved_${studentDni}`) === "true" ||
      localStorage.getItem("sfa_efsrt_modulo1_approved_74859612") === "true"
    ))
  );

  const hasTeacherActa = Boolean(
    assignments?.some((a) =>
      (a.title?.startsWith("[Planilla]") || a.title?.includes("EX_FINAL") || a.title?.includes("PC1") || a.courseId?.includes("101") || a.courseId === "cur_ei_101") &&
      a.submissions?.some((s) => (s.studentDni === studentDni || s.studentDni === "74859612") && typeof s.grade === "number")
    ) ||
    enrichedCourses?.some((ec: any) => ec.code === "EIND-101" && ec.evaluations?.some((e: any) => typeof e.grade === "number"))
  );

  const isCycle1Simulated = Boolean(
    hasTeacherActa ||
    (simData && Array.isArray(simData.courses) && simData.courses.length > 0) ||
    (typeof window !== "undefined" && (
      localStorage.getItem(`sfa_student_promoted_cycle2_${studentDni}`) === "true" ||
      localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
      localStorage.getItem("sfa_student_promoted_cycle2") === "true" ||
      localStorage.getItem(`sfa_student_cycle_${studentDni}`) === "2" ||
      localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
      localStorage.getItem("sfa_student_cycle") === "2" ||
      localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`) ||
      localStorage.getItem("sfa_simulated_cycle1_74859612") ||
      localStorage.getItem("sfa_simulated_cycle1")
    ))
  );
  const isPromotedToCycle2 = isCycle1Simulated;

  const isGraduatedVI = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_graduated_all_${studentDni}`) === "true" ||
    localStorage.getItem("sfa_student_graduated_all_74859612") === "true" ||
    localStorage.getItem(`sfa_student_promoted_${studentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_74859612") === "true"
  );
  const isPromoted = isGraduatedVI;

  const effectiveSimCourses = simData?.courses || [
    { code: "EIND-101", grade: 15.6 },
    { code: "EIND-102", grade: 16.5 },
    { code: "EIND-103", grade: 17.0 },
    { code: "EIND-104", grade: 15.0 },
    { code: "EIND-105", grade: 16.0 },
  ];

  const isElectricidad = studentDni === "74859612" ||
    enrollment?.programId === "electronica" ||
    enrollment?.programId === "electricidad_industrial" ||
    enrollment?.programId === "electricidad" ||
    currentProgram?.name?.toLowerCase().includes("electricidad") ||
    !enrollment?.programId;
  const activePlanKey = isElectricidad ? "20" : "52";
  const activeSemesterKey = selectedQueryCycle || "I";
  const cycleMap: Record<string, number> = { "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6 };
  const targetCycleNum = cycleMap[activeSemesterKey] || 1;

  // Filter real courses from database by student's career program and selected cycle
  const realDbCourses = courses.filter((c) => {
    const isProgMatch = c.careerId === enrollment?.programId || (c as any).career?.toLowerCase().includes(enrollment?.programId || "");
    const isCycleMatch = c.referenceCycle === targetCycleNum || (c as any).cycle === targetCycleNum;
    return isProgMatch && isCycleMatch;
  });

  // Merge official plan courses with real database courses so full curriculum structure is always displayed
  const planCourses = CORE_PLAN_COURSES[activePlanKey]?.[activeSemesterKey] || CORE_PLAN_COURSES["20"]["I"] || [];
  const rawCoursesList = planCourses.map((planC) => {
    const dbCourse = realDbCourses.find((c) => c.code === planC.code);
    const enriched = enrichedCourses?.find((ec: any) => ec.code === planC.code);
    const simCourse = effectiveSimCourses.find((sc: any) => sc.code === planC.code || sc.name === planC.name);

    let gradeFromEnriched: number | undefined = undefined;
    if (enriched) {
      const stats = computeCourseStats(enriched);
      if (stats.hasAnyGrade) {
        gradeFromEnriched = stats.progressiveAverage;
      }
    }

    const isApprovedCourse = isGraduatedVI || (targetCycleNum === 1 && isCycle1Simulated);
    const simGrade = isGraduatedVI
      ? undefined
      : (gradeFromEnriched !== undefined
        ? gradeFromEnriched
        : (isApprovedCourse
          ? (typeof simCourse?.grade === "number" ? simCourse.grade : (planC.code === "EIND-101" ? 15.6 : 16.0))
          : undefined));

    return {
      code: planC.code,
      name: dbCourse?.name || enriched?.name || planC.name,
      type: planC.type,
      credits: dbCourse?.credits || enriched?.credits || planC.credits,
      status: isApprovedCourse ? "Aprobado" : (targetCycleNum === 2 && isPromotedToCycle2 ? "Matriculado" : (targetCycleNum === 1 ? "Matriculado" : "Pendiente")),
      teo: planC.teo || 2,
      pr: planC.pr || 4,
      simGrade
    };
  });

  // Real academic progress status: Only graduated VI shows all approved. In cycle 2, only cycle 1 is approved.
  const activeCoursesList = rawCoursesList.map((c, index) => {
    if (isGraduatedVI) {
      const grades = [17, 18, 16, 19, 17, 18];
      const grade = grades[index % grades.length];
      return {
        ...c,
        status: "Aprobado",
        simGrade: grade
      };
    }
    if (targetCycleNum === 1 && isCycle1Simulated) {
      return {
        ...c,
        status: "Aprobado",
        simGrade: typeof c.simGrade === "number" ? c.simGrade : (c.code === "EIND-101" ? 15.6 : 16.0)
      };
    }
    if (targetCycleNum === 2 && isPromotedToCycle2) {
      if (isCycle2Simulated) {
        const sim2Course = simData2?.courses?.find((sc: any) => sc.code === c.code || sc.name === c.name);
        const storedGradeStr = typeof window !== "undefined" ? (
          localStorage.getItem(`sfa_grades_${c.code}_${studentDni}`) ||
          localStorage.getItem(`sfa_grades_${c.code}_74859612`)
        ) : null;
        const finalC2Grade = storedGradeStr
          ? Number(storedGradeStr)
          : (typeof sim2Course?.grade === "number" ? sim2Course.grade : (c.code === "EIND-202" ? 17.0 : 16.5));
        return {
          ...c,
          status: "Aprobado",
          simGrade: finalC2Grade
        };
      }
      const isCourseApproved = (c.code === "EIND-201" || c.code === "cur_ei_201") && (
        localStorage.getItem("sfa_acta_signed_EIND-201") === "true" ||
        localStorage.getItem("sfa_acta_signed_cur_ei_201") === "true" ||
        localStorage.getItem("sfa_course_passed_EIND-201_74859612") === "true" ||
        Boolean(localStorage.getItem("sfa_grades_EIND-201_74859612"))
      );
      if (isCourseApproved) {
        let passedGrade = 16.6;
        try {
          const raw = localStorage.getItem("sfa_grades_EIND-201_74859612") || localStorage.getItem("sfa_grades_cur_ei_201_74859612");
          if (raw) {
            const p = JSON.parse(raw);
            const sum = 0.20 * (p.NPA || 0) + 0.20 * (p.PC1 || 0) + 0.20 * (p.PC2 || 0) + 0.40 * (p.EX_FINAL || 0);
            if (sum > 0) passedGrade = Number(sum.toFixed(1));
          }
        } catch {}
        return {
          ...c,
          status: "Aprobado",
          simGrade: passedGrade
        };
      }
      return {
        ...c,
        status: "Matriculado",
        simGrade: undefined
      };
    }
    return {
      ...c,
      status: targetCycleNum === 1 ? "Matriculado" : "Pendiente",
      simGrade: undefined
    };
  });
  const cycleCreditsSum = activeCoursesList.reduce((sum, c) => sum + c.credits, 0);
  const totalCreds = activeCoursesList.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = activeCoursesList.reduce((sum, c) => sum + c.credits * (typeof c.simGrade === "number" ? c.simGrade : 16.0), 0);
  const computedAverage = totalCreds > 0 ? Math.round((totalPoints / totalCreds) * 10) / 10 : 16.0;
  const weightedGpa = isGraduatedVI ? 17.4 : isCycle1Simulated ? (simData?.weightedAverage ? Number(simData.weightedAverage) : computedAverage) : 0.0;

  const gradedCoursesInActiveCycle = activeCoursesList.filter((c) => typeof c.simGrade === "number");
  const activeCycleGpa = gradedCoursesInActiveCycle.length > 0
    ? (gradedCoursesInActiveCycle.reduce((sum, c) => sum + (c.simGrade as number) * c.credits, 0) / gradedCoursesInActiveCycle.reduce((sum, c) => sum + c.credits, 0))
    : (targetCycleNum === 1 && isCycle1Simulated ? weightedGpa : null);

  return (
    <PageTransition id="closure" className="space-y-6">
      {/* Hero Banner Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • PLAN CURRICULAR
            </span>
            <h2 id="acad-view-main" className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Consulta Académica
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl">
              Malla curricular oficial, avance por semestres lectivos y verificación del plan de estudios aprobado por el Ministerio de Educación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-400 font-extrabold block uppercase mb-0.5 tracking-wider">Plan Registrado</span>
              <span className="text-xs font-black text-white font-mono">
                {activePlanKey === "20" ? "Plan 20 - Electricidad" : "Plan 52 - Contabilidad"}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await generateCurriculumPlanPdf(
                  currentProgram?.name || "Electricidad Industrial",
                  `${personalData.name} ${personalData.lastName}`,
                  personalData.dni
                );
              }}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Download className="w-3.5 h-3.5 text-[#800521]" />
              <span>Descargar Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* High Fidelity Performance Metrics cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Ciclo Académico Actual</span>
          <span className="text-lg font-black text-[#800521] mt-1 uppercase tracking-tight">
            {isGraduatedVI ? "VI SEMESTRE (EGRESADO)" : isPromotedToCycle2 ? "II SEMESTRE" : "I SEMESTRE"}
          </span>
          <div className="flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[9.5px] font-black w-max">
            <Award className="w-3 h-3 text-emerald-600" /> {isGraduatedVI ? "APTO TITULACIÓN" : isPromotedToCycle2 ? "MATRICULADO ACTIVO" : "REGULAR"}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Créditos de Carrera</span>
          <span className="text-xl font-black text-[#2D3748] mt-1 font-mono">
            {isGraduatedVI ? "120.0 / 120.0" : isPromotedToCycle2 ? "16.0 / 120.0" : "0.0 / 120.0"}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1 font-semibold">
            {isGraduatedVI ? "100% Plan Culminado (6 Ciclos)" : isPromotedToCycle2 ? "16 Créditos Aprobados (Ciclo I Culminado)" : "Créditos Inscritos: 16 (Ciclo I)"}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Promedio Ponderado</span>
          <span className="text-xl font-black text-[#2D3748] mt-1 font-mono">
            {isGraduatedVI ? "17.40" : isPromotedToCycle2 ? (simData?.weightedAverage ? Number(simData.weightedAverage).toFixed(2) : "16.00") : "0.00"}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1 font-semibold">
            {isGraduatedVI ? "Tercio Superior Oficial" : isPromotedToCycle2 ? "Promedio Oficial Ciclo I" : "Semestre 2027-I"}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Estado de Matrícula</span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wide mt-1">
            {isGraduatedVI ? "EGRESADO CONCLUIDO" : isPromotedToCycle2 ? "MATRICULADO (CICLO II)" : "MATRICULADO (CICLO I)"}
          </span>
          <span className="text-[9px] text-emerald-600 font-bold block mt-1 font-semibold">
            {isGraduatedVI ? "Apto para Certificados Oficiales" : isPromotedToCycle2 ? "Periodo 2027-II Vigente" : "Periodo 2027-I Vigente"}
          </span>
        </div>
      </div>

      {/* Dual Sidebar grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-4">
          <div className="flex bg-white p-1 rounded-xl border border-slate-150 overflow-x-auto gap-1">
            {(["I", "II", "III", "IV", "V", "VI"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setSelectedQueryCycle(cycle)}
                className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer text-center ${selectedQueryCycle === cycle
                  ? "bg-[#800521] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {cycle} Ciclo
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
            {(() => {
              const cyclePeriodDisplayMap: Record<string, string> = {
                "VI": "Periodo 2029 - II",
                "V": "Periodo 2029 - I",
                "IV": "Periodo 2028 - II",
                "III": "Periodo 2028 - I",
                "II": "Periodo 2027 - II",
                "I": "Periodo 2027 - I",
              };
              return (
                <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span id="label-cycle-selected" className="text-xs font-black text-slate-700 uppercase tracking-wide leading-none">
                    Ciclo {selectedQueryCycle} - Unidades Registradas ({cyclePeriodDisplayMap[selectedQueryCycle] || "Periodo 2027 - I"})
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border px-2.5 py-1 rounded-lg shadow-sm">
                    Créditos de Ciclo: {cycleCreditsSum?.toFixed(1)}
                  </span>
                </div>
              );
            })()}

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left bg-slate-50/20">
                    <th className="p-4 pl-6">Código Curso</th>
                    <th className="p-4">Unidad Didáctica / Asignatura</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4 text-center">Créditos</th>
                    <th className="p-4 text-center">Estado Académico</th>
                    <th className="p-4 text-center">Teo (Horas)</th>
                    <th className="p-4 text-center">Pr (Horas)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCoursesList.map((crs, idx) => {
                    const isApproved = crs.status === "Aprobado";
                    return (
                      <tr id={`row-course-${idx}`} key={idx} className="hover:bg-slate-50/40 transition-all">
                        <td className="p-4 pl-6 font-mono text-slate-400 text-[10.5px] font-bold">{crs.code}</td>
                        <td className="p-4 text-slate-800 font-extrabold text-[12px] max-w-[200px] leading-tight">
                          {crs.name}
                        </td>
                        <td className="p-4 text-slate-500 font-bold text-[10.5px]">{crs.type}</td>
                        <td className="p-4 text-center text-slate-900 font-mono font-black">{crs.credits}.0</td>
                        <td className="p-4 text-center">
                          {(() => {
                            const statusUpper = (crs.status || "").toUpperCase();
                            const isApprovedCourse = statusUpper.includes("APROBADO") || isApproved || crs.simGrade !== undefined;
                            const isMatriculado = statusUpper.includes("MATRICULADO") && !isApprovedCourse;

                            if (isApprovedCourse) {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 select-none shadow-3xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                  APROBADO{crs.simGrade ? ` (${crs.simGrade})` : ""}
                                </span>
                              );
                            }
                            if (isMatriculado) {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 select-none shadow-3xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  MATRICULADO
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 select-none">
                                {crs.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-405 font-bold">{crs.teo} hrs</td>
                        <td className="p-4 text-center font-mono text-slate-405 font-bold">{crs.pr} hrs</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 text-left font-sans">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-4">Requisitos Oficiales para Certificación y Egreso</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-3.5 border rounded-xl flex items-center gap-3 ${isGraduatedVI ? "bg-slate-50/50 border-slate-200" : "bg-emerald-50/40 border-emerald-200"}`}>
                <CheckCircle2 className={`w-5 h-5 shrink-0 text-emerald-600`} />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Créditos Curriculares</span>
                  <span className="text-[10.5px] text-slate-600 mt-0.5 block font-bold">
                    {isGraduatedVI ? "120 / 120 Créditos aprobados. Requisito al día." : isPromotedToCycle2 ? "16.0 / 120 Créditos aprobados (Ciclo I Culminado)." : "0.0 / 120 Créditos. Ciclo I en proceso."}
                  </span>
                </div>
              </div>

              <div className={`p-3.5 border rounded-xl flex items-center gap-3 bg-slate-50/50 border-slate-200`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${isGraduatedVI ? "bg-emerald-100 text-emerald-700" : isPromotedToCycle2 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {isGraduatedVI ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : isPromotedToCycle2 ? "✓" : "!"}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Prácticas Pre-Profesionales (EFSRT)</span>
                  <span className="text-[10.5px] text-slate-600 mt-0.5 block font-bold">
                    {isGraduatedVI ? "Módulos I, II y III acreditados formalmente." : isPromotedToCycle2 ? "Habilitado formalmente para acreditar Módulo I." : "Se habilitan tras la culminación del Ciclo I."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs text-center space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Promedio de Ciclo</span>

            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  stroke="#800521"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * (activeCycleGpa !== null ? (activeCycleGpa / 20) : 0))}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute flex flex-col justify-center items-center">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">
                  {activeCycleGpa !== null ? activeCycleGpa.toFixed(1) : "--"}
                </span>
                <span className="text-[8px] text-slate-400 uppercase font-black">sobre 20</span>
              </div>
            </div>

            <div className="text-xs font-semibold">
              <span className="text-slate-500">Rendimiento Estimado: </span>
              <span className={`font-black ${activeCycleGpa !== null
                ? (activeCycleGpa >= 14 ? "text-emerald-600" : "text-slate-800")
                : targetCycleNum === 2
                ? "text-blue-600"
                : "text-amber-600"
                }`}>
                {isGraduatedVI
                  ? "Sobresaliente"
                  : (isCycle1Simulated && targetCycleNum === 1)
                  ? (weightedGpa >= 16 ? "Sobresaliente" : "Aceptable")
                  : targetCycleNum === 2
                  ? (activeCycleGpa !== null ? (activeCycleGpa >= 14 ? "Sobresaliente (En Proceso)" : "Regular (En Proceso)") : "Semestre en Curso (2027-II)")
                  : "No Cursado"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs font-semibold">
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Créditos de Ciclo</span>
                <span className="text-slate-900 font-mono text-sm font-black block mt-1">{cycleCreditsSum?.toFixed(1) || "16.0"}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Cursos de Ciclo</span>
                <span className="text-slate-900 font-mono text-sm font-black block mt-1">{activeCoursesList.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tight block">Tutoría de Carrera</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#800521]/10 rounded-full border border-[#800521]/20 flex items-center justify-center font-bold text-[#800521] text-xs">
                CA
              </div>
              <div>
                <span className="text-xs font-bold text-slate-850 block">Coordinación de Carrera</span>
                <span className="text-[10px] text-slate-400 block font-medium">Tutoría y Asesoría Académica • {currentProgram?.name || "IESTP SFA"}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <textarea
                value={advisorConsultText}
                onChange={(e) => setAdvisorConsultText(e.target.value)}
                placeholder="Envíe una consulta académica a su coordinador..."
                className="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#800521] focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!advisorConsultText.trim()) return;
                  setAdvisorConsultSuccess(true);
                  setAdvisorConsultText("");
                  setTimeout(() => setAdvisorConsultSuccess(false), 5000);
                }}
                className="w-full bg-[#800521] hover:bg-[#9F062A] text-white text-[10px] font-black uppercase tracking-wider py-1.5 rounded-md cursor-pointer select-none"
              >
                Enviar Mensaje
              </button>

              {advisorConsultSuccess && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2 rounded text-[10px] font-semibold">
                  ¡Su consulta académica ha sido enviada al coordinador de carrera! Se responderá en un plazo máximo de 24 horas hábiles.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Descarga de Documentación Oficial</span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await generateBoletaNotasPdf(
                    selectedQueryCycle,
                    `${personalData.name} ${personalData.lastName}`,
                    personalData.dni,
                    currentProgram?.name || "Electricidad Industrial",
                    activeCoursesList.map((c) => ({
                      code: c.code,
                      name: c.name,
                      credits: c.credits,
                      grade: typeof c.simGrade === "number" ? c.simGrade : (isCycle1Simulated ? (c.code === "EIND-101" ? 15.6 : 16.0) : undefined),
                    }))
                  );
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all shadow-2xs"
              >
                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Boleta de Notas ({selectedQueryCycle} Ciclo)</span>
                <Download className="w-3.5 h-3.5 text-[#800521]" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await generateCurriculumPlanPdf(
                    currentProgram?.name || "Electricidad Industrial",
                    `${personalData.name} ${personalData.lastName}`,
                    personalData.dni
                  );
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all shadow-2xs"
              >
                <span className="flex items-center gap-2"><ClipboardList className="w-3.5 h-3.5 text-slate-400" /> Plan Curricular Completo</span>
                <Download className="w-3.5 h-3.5 text-[#800521]" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await generateMatriculaPdf({
                    studentName: personalData.name,
                    studentLastName: personalData.lastName,
                    dni: personalData.dni,
                    studentCode: personalData?.dni ? `202710001` : "202710001",
                    programName: currentProgram?.name || "Electricidad Industrial",
                    period: isPromotedToCycle2 && selectedQueryCycle === "II" ? "2027-II" : "2027-I",
                    cycle: selectedQueryCycle === "II" ? "Ciclo II" : "Ciclo I",
                    shift: enrollment?.shift || "Mañana",
                    courses: activeCoursesList.map((c) => ({
                      code: c.code,
                      name: c.name,
                      credits: c.credits,
                      cycle: selectedQueryCycle,
                      type: c.type,
                      group: selectedQueryCycle === "II" ? "EI-II-A" : "EI-I-A",
                      tsg: "Teoría / Taller",
                      status: isGraduatedVI ? "APROBADO" : (selectedQueryCycle === "I" ? "APROBADO" : (selectedQueryCycle === "II" && isCycle2Simulated ? "APROBADO" : (selectedQueryCycle === "II" ? "MATRICULADO" : "PENDIENTE"))),
                    })),
                    totalCredits: cycleCreditsSum || 16,
                    totalCourses: activeCoursesList.length,
                    maxCredits: 22,
                    paymentStatus: "PAGADO (S/. 250.00)",
                  });
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all shadow-2xs"
              >
                <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Ficha de Matrícula Activa</span>
                <Download className="w-3.5 h-3.5 text-[#800521]" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {toastNotice && (
        <Toast notice={toastNotice} onClose={() => setToastNotice(null)} />
      )}
    </PageTransition>
  );
};
