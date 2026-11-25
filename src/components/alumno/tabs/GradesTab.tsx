import React, { useState, useEffect } from "react";
import { Zap, Cpu, Sliders, Award, Printer, Info, ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { BoletaNotasModal } from "../modals/BoletaNotasModal";

interface GradesTabProps {
  enrichedCourses: any[];
  selectedCourseDetail: string;
  setSelectedCourseDetail: React.Dispatch<React.SetStateAction<string>>;
  cycleStatuses?: any[];
  studentInfo?: {
    dni?: string;
    name?: string;
    career?: string;
  };
}

// Helper to compute course progressive stats from formula variables
export const computeCourseStats = (course: any) => {
  const evals = course?.evaluations || [];
  const weightedEvals = evals.filter((e: any) => typeof e.weightDecimal === "number" && e.weightDecimal > 0);
  
  let accumulatedPoints = 0;
  let evaluatedWeight = 0;

  weightedEvals.forEach((e: any) => {
    if (typeof e.grade === "number") {
      accumulatedPoints += e.grade * e.weightDecimal;
      evaluatedWeight += e.weightDecimal;
    }
  });

  const isFullyEvaluated = evaluatedWeight >= 0.99;
  const progressiveAverage = evaluatedWeight > 0 
    ? (accumulatedPoints / evaluatedWeight) 
    : 0;

  const isMultiComp = (course?.code || "").startsWith("EIND-101") || (course?.name || "").toLowerCase().includes("fundamentos de electricidad");
  let breakdownText = "";
  if (isMultiComp) {
    const gTeo = weightedEvals.find((e: any) => e.prefix === "TEO")?.grade ?? "NR";
    const gTal = weightedEvals.find((e: any) => e.prefix === "TAL")?.grade ?? "NR";
    const gLab = weightedEvals.find((e: any) => e.prefix === "LAB")?.grade ?? "NR";
    const gExFinal = weightedEvals.find((e: any) => e.prefix === "EX_FINAL")?.grade ?? "NR";
    breakdownText = `0.60×[0.40×(${gTeo}) + 0.40×(${gTal}) + 0.20×(${gLab})] + 0.40×(${gExFinal})`;
  } else {
    breakdownText = weightedEvals.length > 0
      ? weightedEvals.map((e: any) => {
          const g = typeof e.grade === "number" ? e.grade : "NR";
          return `${e.weightDecimal.toFixed(2)}×(${g})`;
        }).join(" + ")
      : "Sin componentes ponderados";
  }

  return {
    accumulatedPoints: Math.round(accumulatedPoints * 10) / 10,
    evaluatedWeight: Math.round(evaluatedWeight * 100) / 100,
    progressiveAverage: Math.round(progressiveAverage * 10) / 10,
    isFullyEvaluated,
    hasAnyGrade: evaluatedWeight > 0,
    breakdownText
  };
};

export const GradesTab: React.FC<GradesTabProps> = ({
  enrichedCourses,
  selectedCourseDetail,
  setSelectedCourseDetail,
  cycleStatuses = [],
  studentInfo
}) => {
  const studentDni = studentInfo?.dni || "74859612";
  const isMateo = studentDni === "74859612";

  const hasBackendGraduated = Array.isArray(cycleStatuses) && cycleStatuses.some(
    (c: any) => c.cycleNumber === 6 && c.status === "Aprobado"
  );

  const isGraduated = typeof window !== "undefined" && Boolean(
    hasBackendGraduated || (
      !isMateo && localStorage.getItem(`sfa_student_graduated_all_${studentDni}`) !== "true"
        ? false
        : (
          localStorage.getItem(`sfa_student_graduated_all_${studentDni}`) === "true" ||
          localStorage.getItem(`sfa_titulacion_enabled_${studentDni}`) === "true" ||
          localStorage.getItem(`sfa_student_status_${studentDni}`) === "Egresado" ||
          (isMateo && (
            localStorage.getItem(`sfa_student_promoted_${studentDni}`) === "true" ||
            localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
            localStorage.getItem("sfa_student_promoted") === "true" ||
            localStorage.getItem("sfa_student_graduated_all_74859612") === "true" ||
            localStorage.getItem("sfa_student_graduated_all") === "true" ||
            localStorage.getItem("sfa_titulacion_enabled_74859612") === "true"
          ))
        )
    )
  );

  const hasBackendCycle1Approved = Array.isArray(cycleStatuses) && cycleStatuses.some(
    (c: any) => c.cycleNumber === 1 && c.status === "Aprobado"
  );

  const isPromotedCycle2 = typeof window !== "undefined" && Boolean(
    hasBackendCycle1Approved || (
      !isMateo &&
        localStorage.getItem(`sfa_student_promoted_cycle2_${studentDni}`) !== "true" &&
        localStorage.getItem(`sfa_student_cycle_${studentDni}`) !== "2"
        ? false
        : (
          localStorage.getItem(`sfa_student_promoted_cycle2_${studentDni}`) === "true" ||
          localStorage.getItem(`sfa_student_cycle_${studentDni}`) === "2" ||
          (isMateo && (
            localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
            localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
            localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
            localStorage.getItem("sfa_student_promoted_74859612") === "true"
          ))
        )
    )
  );

  const [storageSyncKey, setStorageSyncKey] = useState(0);

  useEffect(() => {
    const handleSync = () => setStorageSyncKey((k) => k + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const [showBoletaModal, setShowBoletaModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<"2027-I" | "2027-II" | "2028-I" | "2028-II" | "2029-I" | "2029-II">(() => {
    return isGraduated ? "2029-II" : isPromotedCycle2 ? "2027-II" : "2027-I";
  });

  useEffect(() => {
    if (isGraduated) {
      setSelectedSemester((prev) => (prev === "2027-I" || prev === "2027-II" ? "2029-II" : prev));
    }
  }, [isGraduated]);

  const isContabilidad = studentInfo?.career?.toLowerCase().includes("contab") ||
    studentDni === "71248596" ||
    enrichedCourses.some(c => c.code?.startsWith("CONT") || c.career?.toLowerCase().includes("contab"));

  const semesterCourses = React.useMemo(() => {
    // 0. Contabilidad
    if (isContabilidad) {
      if (selectedSemester === "2027-I") {
        const getGrades = (code: string) => {
          try {
            const raw = localStorage.getItem(`sfa_grades_${code}_${studentDni}`) ||
              localStorage.getItem(`sfa_grades_${code.toLowerCase()}_${studentDni}`);
            if (raw) return JSON.parse(raw);
          } catch {}
          return null;
        };

        const g101 = getGrades("CONT-101");
        const g102 = getGrades("CONT-102");
        const g103 = getGrades("CONT-103");
        const g104 = getGrades("CONT-104");
        const g105 = getGrades("CONT-105");

        const findEnriched = (code: string) =>
          enrichedCourses.find((x: any) =>
            x.code === code ||
            x.id === `cur_${code.toLowerCase().replace("cont-", "co_")}` ||
            x.id === `cur-cur_${code.toLowerCase().replace("cont-", "co_")}`
          );

        const simCycle1Map: Record<string, number> = {};
        try {
          if (Array.isArray(cycleStatuses)) {
            const backendC1 = cycleStatuses.find((c: any) => c.cycleNumber === 1 && c.status === "Aprobado");
            if (backendC1 && Array.isArray(backendC1.courses)) {
              backendC1.courses.forEach((sc: any) => {
                const codePart = sc?.code || (typeof sc?.name === "string" && sc.name.includes("::") ? sc.name.split("::")[0] : "");
                if (codePart && typeof sc.grade === "number") {
                  simCycle1Map[codePart] = sc.grade;
                }
              });
            }
          }
          const rawSim1 = localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`) ||
            (isMateo ? (localStorage.getItem("sfa_simulated_cycle1_74859612") || localStorage.getItem("sfa_simulated_cycle1")) : null);
          if (rawSim1) {
            const parsed = JSON.parse(rawSim1);
            if (Array.isArray(parsed?.courses)) {
              parsed.courses.forEach((sc: any) => {
                if (sc?.code && typeof sc.grade === "number") {
                  simCycle1Map[sc.code] = sc.grade;
                }
              });
            }
          }
        } catch {}

        const resolveEvalGrade = (code: string, prefix: string, localVal: any, mateoFallback: number) => {
          const ec = findEnriched(code);
          const ecEval = ec?.evaluations?.find((ev: any) => ev.prefix === prefix || ev.id === prefix);
          if (ecEval && typeof ecEval.grade === "number") return ecEval.grade;
          if (localVal !== undefined) return Number(localVal);
          if (code !== "CONT-101" && simCycle1Map[code] !== undefined) return simCycle1Map[code];
          return isMateo ? mateoFallback : undefined;
        };

        return [
          {
            id: "cur_co_101",
            code: "CONT-101",
            name: "Fundamentos de Contabilidad y Doctrina Contable",
            credits: 4,
            cycle: "Ciclo I",
            classroom: "Aula 201 • Pabellón C",
            iconType: "Zap",
            formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
            weeklyTasks: findEnriched("CONT-101")?.weeklyTasks || [],
            evaluations: [
              { id: "NPA", name: "Nota de Participación Activa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-101", "NPA", g101?.NPA, 16.0), isCurricular: true },
              { id: "PC1", name: "Práctica Calificada 1 (Doctrina)", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-101", "PC1", g101?.PC1, 15.0), isCurricular: true },
              { id: "PC2", name: "Práctica Calificada 2 (Partida Doble)", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-101", "PC2", g101?.PC2, 16.0), isCurricular: true },
              { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveEvalGrade("CONT-101", "EX_FINAL", g101?.EX_FINAL, 16.0), isCurricular: true }
            ]
          },
          {
            id: "cur_co_102",
            code: "CONT-102",
            name: "Documentación Comercial, Mercantil y Bancaria",
            credits: 4,
            cycle: "Ciclo I",
            classroom: "Aula 201 • Pabellón C",
            iconType: "Sliders",
            formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
            evaluations: [
              { id: "NPA", name: "Nota de Participación Activa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-102", "NPA", g102?.NPA, 16.0), isCurricular: true },
              { id: "PC1", name: "Práctica Calificada 1 (Comprobantes)", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-102", "PC1", g102?.PC1, 16.0), isCurricular: true },
              { id: "PC2", name: "Práctica Calificada 2 (Títulos Valores)", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-102", "PC2", g102?.PC2, 17.0), isCurricular: true },
              { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveEvalGrade("CONT-102", "EX_FINAL", g102?.EX_FINAL, 17.0), isCurricular: true }
            ]
          },
          {
            id: "cur_co_103",
            code: "CONT-103",
            name: "Matemática Financiera y Comercial",
            credits: 3,
            cycle: "Ciclo I",
            classroom: "Aula 201 • Pabellón C",
            iconType: "Cpu",
            formula: "NF = 0.20*NPA + 0.30*PC1 + 0.50*EX_FINAL",
            evaluations: [
              { id: "NPA", name: "Participación y Casos", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: resolveEvalGrade("CONT-103", "NPA", g103?.NPA, 17.0), isCurricular: true },
              { id: "PC1", name: "Práctica 1 (Interés y Tasas)", prefix: "PC1", weight: "30%", weightDecimal: 0.3, grade: resolveEvalGrade("CONT-103", "PC1", g103?.PC1, 17.0), isCurricular: true },
              { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "50%", weightDecimal: 0.5, grade: resolveEvalGrade("CONT-103", "EX_FINAL", g103?.EX_FINAL, 17.0), isCurricular: true }
            ]
          },
          {
            id: "cur_co_104",
            code: "CONT-104",
            name: "Legislación Comercial y Societaria",
            credits: 3,
            cycle: "Ciclo I",
            classroom: "Aula 201 • Pabellón C",
            iconType: "Award",
            formula: "NF = 0.30*PC1 + 0.30*PC2 + 0.40*EX_FINAL",
            evaluations: [
              { id: "PC1", name: "Práctica 1 (Ley General Sociedades)", prefix: "PC1", weight: "30%", weightDecimal: 0.3, grade: resolveEvalGrade("CONT-104", "PC1", g104?.PC1, 15.0), isCurricular: true },
              { id: "PC2", name: "Práctica 2 (Contratos Mercantiles)", prefix: "PC2", weight: "30%", weightDecimal: 0.3, grade: resolveEvalGrade("CONT-104", "PC2", g104?.PC2, 15.0), isCurricular: true },
              { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveEvalGrade("CONT-104", "EX_FINAL", g104?.EX_FINAL, 16.0), isCurricular: true }
            ]
          },
          {
            id: "cur_co_105",
            code: "CONT-105",
            name: "Comunicación y Competencias Digitales",
            credits: 2,
            cycle: "Ciclo I",
            classroom: "Lab. Contable 1 • Pabellón C",
            iconType: "Award",
            formula: "NF = 0.30*ACT + 0.30*ORAL + 0.40*EX_FINAL",
            evaluations: [
              { id: "ACT", name: "Hojas de Cálculo y Software", prefix: "ACT", weight: "30%", weightDecimal: 0.3, grade: resolveEvalGrade("CONT-105", "ACT", g105?.ACT, 16.0), isCurricular: true },
              { id: "ORAL", name: "Presentación de Informes", prefix: "ORAL", weight: "30%", weightDecimal: 0.3, grade: resolveEvalGrade("CONT-105", "ORAL", g105?.ORAL, 16.0), isCurricular: true },
              { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveEvalGrade("CONT-105", "EX_FINAL", g105?.EX_FINAL, 16.0), isCurricular: true }
            ]
          }
        ];
      }

      const simCycle2Map: Record<string, number> = {};
      try {
        if (Array.isArray(cycleStatuses)) {
          const backendC2 = cycleStatuses.find((c: any) => c.cycleNumber === 2 && c.status === "Aprobado");
          if (backendC2 && Array.isArray(backendC2.courses)) {
            backendC2.courses.forEach((sc: any) => {
              const codePart = sc?.code || (typeof sc?.name === "string" && sc.name.includes("::") ? sc.name.split("::")[0] : "");
              if (codePart && typeof sc.grade === "number") {
                simCycle2Map[codePart] = sc.grade;
              }
            });
          }
        }
        const rawSim2 = localStorage.getItem(`sfa_simulated_cycle2_${studentDni}`) ||
          (isMateo ? (localStorage.getItem("sfa_simulated_cycle2_74859612") || localStorage.getItem("sfa_simulated_cycle2")) : null);
        if (rawSim2) {
          const parsed2 = JSON.parse(rawSim2);
          if (Array.isArray(parsed2?.courses)) {
            parsed2.courses.forEach((sc: any) => {
              if (sc?.code && typeof sc.grade === "number" && simCycle2Map[sc.code] === undefined) {
                simCycle2Map[sc.code] = sc.grade;
              }
            });
          }
        }
      } catch {}

      const getCont2Grades = (code: string) => {
        try {
          const raw = localStorage.getItem(`sfa_grades_${code}_${studentDni}`);
          if (raw) return JSON.parse(raw);
        } catch {}
        return null;
      };
      const resolveCont2 = (code: string, comp: string, localObj: any) => {
        if (localObj?.[comp] !== undefined) return Number(localObj[comp]);
        if (simCycle2Map[code] !== undefined) return simCycle2Map[code];
        return undefined;
      };
      const g201 = getCont2Grades("CONT-201");
      const g202 = getCont2Grades("CONT-202");
      const g203 = getCont2Grades("CONT-203");
      const g204 = getCont2Grades("CONT-204");
      const g205 = getCont2Grades("CONT-205");

      return [
        {
          id: "cur_co_201",
          code: "CONT-201",
          name: "Contabilidad General y Plan Contable General Empresarial",
          credits: 4,
          cycle: "Ciclo II",
          classroom: "Aula 201 • Pabellón C",
          iconType: "BarChart3",
          formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Nota de Participación Activa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-201", "NPA", g201), isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1 (PCGE)", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-201", "PC1", g201), isCurricular: true },
            { id: "PC2", name: "Práctica Calificada 2 (Libros Contables)", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-201", "PC2", g201), isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo II", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveCont2("CONT-201", "EX_FINAL", g201), isCurricular: true }
          ]
        },
        {
          id: "cur_co_202",
          code: "CONT-202",
          name: "Títulos Valores y Operaciones Financieras",
          credits: 4,
          cycle: "Ciclo II",
          classroom: "Aula 202 • Pabellón C",
          iconType: "Sliders",
          formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Nota de Participación Activa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-202", "NPA", g202), isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-202", "PC1", g202), isCurricular: true },
            { id: "PC2", name: "Práctica Calificada 2", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-202", "PC2", g202), isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo II", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveCont2("CONT-202", "EX_FINAL", g202), isCurricular: true }
          ]
        },
        {
          id: "cur_co_203",
          code: "CONT-203",
          name: "Estadística Aplicada a la Gestión Contable",
          credits: 3,
          cycle: "Ciclo II",
          classroom: "Aula 203 • Pabellón C",
          iconType: "Cpu",
          formula: "NF = 0.20*NPA + 0.30*PC1 + 0.50*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Participación y Casos", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: resolveCont2("CONT-203", "NPA", g203), isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1", prefix: "PC1", weight: "30%", weightDecimal: 0.3, grade: resolveCont2("CONT-203", "PC1", g203), isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo II", prefix: "EX_FINAL", weight: "50%", weightDecimal: 0.5, grade: resolveCont2("CONT-203", "EX_FINAL", g203), isCurricular: true }
          ]
        },
        {
          id: "cur_co_204",
          code: "CONT-204",
          name: "Ofimática Aplicada a los Negocios (Excel Contable)",
          credits: 3,
          cycle: "Ciclo II",
          classroom: "Lab. Contable 1 • Pabellón C",
          iconType: "Sliders",
          formula: "NF = 0.30*NPA + 0.30*PROY + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Participación y Talleres", prefix: "NPA", weight: "30%", weightDecimal: 0.3, grade: resolveCont2("CONT-204", "NPA", g204), isCurricular: true },
            { id: "PROY", name: "Proyecto Excel Contable", prefix: "PROY", weight: "30%", weightDecimal: 0.3, grade: resolveCont2("CONT-204", "PROY", g204), isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo II", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveCont2("CONT-204", "EX_FINAL", g204), isCurricular: true }
          ]
        },
        {
          id: "cur_co_205",
          code: "CONT-205",
          name: "Inglés Técnico para Negocios y Finanzas",
          credits: 2,
          cycle: "Ciclo II",
          classroom: "Aula 205 • Pabellón C",
          iconType: "Award",
          formula: "NF = 0.30*NPA + 0.30*ORAL + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Participación Activa", prefix: "NPA", weight: "30%", weightDecimal: 0.3, grade: resolveCont2("CONT-205", "NPA", g205), isCurricular: true },
            { id: "ORAL", name: "Exposición en Inglés", prefix: "ORAL", weight: "30%", weightDecimal: 0.3, grade: resolveCont2("CONT-205", "ORAL", g205), isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo II", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: resolveCont2("CONT-205", "EX_FINAL", g205), isCurricular: true }
          ]
        }
      ];
    }

    // 1. Ciclo I oficial
    if (selectedSemester === "2027-I") {
      return [
        {
          id: "cur_ei_101",
          code: "EIND-101",
          name: "Fundamentos de Electricidad y Circuitos CC",
          credits: 4,
          cycle: "Ciclo I",
          classroom: "Aula 101 • Pabellón A",
          iconType: "Zap",
          formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Nota de Participación Activa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: 16.0, isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1 (Circuitos)", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: 15.0, isCurricular: true },
            { id: "PC2", name: "Práctica Calificada 2 (Leyes Kirchhoff)", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: 15.0, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: 16.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_102",
          code: "EIND-102",
          name: "Instalaciones Eléctricas de Edificaciones",
          credits: 4,
          cycle: "Ciclo I",
          classroom: "Aula 102 • Pabellón A",
          iconType: "Sliders",
          formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Nota de Participación Activa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: 16.0, isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1 (Tableros)", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: 16.0, isCurricular: true },
            { id: "PC2", name: "Práctica Calificada 2 (Canalizaciones)", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: 17.0, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: 17.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_103",
          code: "EIND-103",
          name: "Seguridad e Higiene Industrial en Baja Tensión",
          credits: 3,
          cycle: "Ciclo I",
          classroom: "Aula 101 • Pabellón A",
          iconType: "Cpu",
          formula: "NF = 0.20*NPA + 0.30*PC1 + 0.50*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Participación y Normativa", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: 17.0, isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1 (EPP y Riesgo)", prefix: "PC1", weight: "30%", weightDecimal: 0.3, grade: 17.0, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "50%", weightDecimal: 0.5, grade: 17.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_104",
          code: "EIND-104",
          name: "Matemática Aplicada a la Tecnología Eléctrica",
          credits: 3,
          cycle: "Ciclo I",
          classroom: "Aula 101 • Pabellón A",
          iconType: "BarChart3",
          formula: "NF = 0.30*PC1 + 0.30*PC2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "PC1", name: "Práctica Calificada 1 (Trigonometría)", prefix: "PC1", weight: "30%", weightDecimal: 0.3, grade: 15.0, isCurricular: true },
            { id: "PC2", name: "Práctica Calificada 2 (Fasores Básicos)", prefix: "PC2", weight: "30%", weightDecimal: 0.3, grade: 15.0, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: 15.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_105",
          code: "EIND-105",
          name: "Comunicación y Tecnologías Digitales",
          credits: 2,
          cycle: "Ciclo I",
          classroom: "Aula 101 • Pabellón A",
          iconType: "Award",
          formula: "NF = 0.30*ACT + 0.30*ORAL + 0.40*EX_FINAL",
          evaluations: [
            { id: "ACT", name: "Actividades Digitales", prefix: "ACT", weight: "30%", weightDecimal: 0.3, grade: 16.0, isCurricular: true },
            { id: "ORAL", name: "Exposición de Proyectos", prefix: "ORAL", weight: "30%", weightDecimal: 0.3, grade: 16.0, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo I", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: 16.0, isCurricular: true }
          ]
        }
      ];
    } else {
      // 2. Ciclo II oficial
      const studentDni = studentInfo?.dni || "74859612";

      let g201Npa: number = 16.0;
      let g201Pc1: number = 16.0;
      let g201Pc2: number = 17.0;
      let g201Ex: number = 17.0;

      try {
        const raw = localStorage.getItem(`sfa_grades_EIND-201_${studentDni}`) ||
          localStorage.getItem("sfa_grades_EIND-201_74859612") ||
          localStorage.getItem(`sfa_grades_cur_ei_201_${studentDni}`) ||
          localStorage.getItem("sfa_grades_cur_ei_201_74859612");
        if (raw) {
          const p = JSON.parse(raw);
          if (p.NPA !== undefined) g201Npa = Number(p.NPA);
          if (p.PC1 !== undefined) g201Pc1 = Number(p.PC1);
          if (p.PC2 !== undefined) g201Pc2 = Number(p.PC2);
          if (p.EX_FINAL !== undefined) g201Ex = Number(p.EX_FINAL);
        }
      } catch {}

      return [
        {
          id: "cur_ei_201",
          code: "EIND-201",
          name: "Circuitos Eléctricos en Corriente Alterna",
          credits: 4,
          cycle: "Ciclo II",
          classroom: "Aula 201 • Pabellón A",
          iconType: "Zap",
          formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Nota de Participación / Informes", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: g201Npa, isCurricular: true },
            { id: "PC1", name: "Práctica Calificada 1 (CA)", prefix: "PC1", weight: "20%", weightDecimal: 0.2, grade: g201Pc1, isCurricular: true },
            { id: "PC2", name: "Práctica Calificada 2 (Mediciones)", prefix: "PC2", weight: "20%", weightDecimal: 0.2, grade: g201Pc2, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular Ciclo II", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: g201Ex, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_202",
          code: "EIND-202",
          name: "Electrónica Analógica y de Potencia Básica",
          credits: 4,
          cycle: "Ciclo II",
          classroom: "Taller de Potencia",
          iconType: "Sliders",
          formula: "NF = 0.20*NPA + 0.20*LAB1 + 0.20*LAB2 + 0.40*EX_FINAL",
          evaluations: [
            { id: "NPA", name: "Nota de Participación", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: 17.0, isCurricular: true },
            { id: "LAB1", name: "Laboratorio Diodos y Tiristores", prefix: "LAB1", weight: "20%", weightDecimal: 0.2, grade: 17.0, isCurricular: true },
            { id: "LAB2", name: "Laboratorio Circuitos Rectificadores", prefix: "LAB2", weight: "20%", weightDecimal: 0.2, grade: 17.0, isCurricular: true },
            { id: "EX_FINAL", name: "Evaluación Modular", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: 17.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_203",
          code: "EIND-203",
          name: "Taller de Medidas e Instrumentos Eléctricos",
          credits: 3,
          cycle: "Ciclo II",
          classroom: "Laboratorio de Mediciones",
          iconType: "Cpu",
          formula: "NF = 0.20*NPA + 0.30*PC1 + 0.50*PROY",
          evaluations: [
            { id: "NPA", name: "Participación y Seguridad", prefix: "NPA", weight: "20%", weightDecimal: 0.2, grade: 16.0, isCurricular: true },
            { id: "PC1", name: "Práctica de Osciloscopio y Fasores", prefix: "PC1", weight: "30%", weightDecimal: 0.3, grade: 16.0, isCurricular: true },
            { id: "PROY", name: "Proyecto de Calibración", prefix: "PROY", weight: "50%", weightDecimal: 0.5, grade: 16.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_204",
          code: "EIND-204",
          name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)",
          credits: 3,
          cycle: "Ciclo II",
          classroom: "Cómputo 2 • Pabellón A",
          iconType: "Sliders",
          formula: "NF = 0.30*PL1 + 0.30*PL2 + 0.40*PROY_CAD",
          evaluations: [
            { id: "PL1", name: "Plano Unifilar en CAD", prefix: "PL1", weight: "30%", weightDecimal: 0.3, grade: 16.0, isCurricular: true },
            { id: "PL2", name: "Plano Multifilar de Tableros", prefix: "PL2", weight: "30%", weightDecimal: 0.3, grade: 17.0, isCurricular: true },
            { id: "PROY_CAD", name: "Proyecto Final Planimetría", prefix: "PROY_CAD", weight: "40%", weightDecimal: 0.4, grade: 17.0, isCurricular: true }
          ]
        },
        {
          id: "cur_ei_205",
          code: "EIND-205",
          name: "Inglés Técnico para Electricidad",
          credits: 2,
          cycle: "Ciclo II",
          classroom: "Aula 201 • Pabellón A",
          iconType: "Award",
          formula: "NF = 0.30*ACT + 0.30*ORAL + 0.40*EX_FINAL",
          evaluations: [
            { id: "ACT", name: "Technical Vocabulary", prefix: "ACT", weight: "30%", weightDecimal: 0.3, grade: 15.0, isCurricular: true },
            { id: "ORAL", name: "Oral Presentation (Diagrams)", prefix: "ORAL", weight: "30%", weightDecimal: 0.3, grade: 15.0, isCurricular: true },
            { id: "EX_FINAL", name: "Final Technical Test", prefix: "EX_FINAL", weight: "40%", weightDecimal: 0.4, grade: 16.0, isCurricular: true }
          ]
        }
      ];
    }

    const buildCourse = (
      id: string,
      code: string,
      name: string,
      credits: number,
      cycleName: string,
      classroom: string,
      iconType: string,
      baseGrade: number
    ) => {
      let finalGrade: number | undefined = (isMateo || isGraduated) ? baseGrade : undefined;
      try {
        if (Array.isArray(cycleStatuses)) {
          for (const cyc of cycleStatuses) {
            const found = cyc?.courses?.find((sc: any) =>
              sc?.code === code || (typeof sc?.name === "string" && sc.name.startsWith(`${code}::`))
            );
            if (found && typeof found.grade === "number") {
              finalGrade = found.grade;
              break;
            }
          }
        }
        const stored = localStorage.getItem(`sfa_grades_${code}_${studentDni}`) ||
          (isMateo ? localStorage.getItem(`sfa_grades_${code}_74859612`) : null);
        if (stored) finalGrade = Number(stored);
      } catch {}

      return {
        id,
        code,
        name,
        credits,
        cycle: cycleName,
        classroom,
        iconType,
        formula: "NF = 0.20*EC1 + 0.30*EP + 0.20*EC2 + 0.30*EF",
        evaluations: [
          { id: "EC1", name: "Evaluación Continua 1", prefix: "EC1", weight: "20%", weightDecimal: 0.2, grade: finalGrade, isCurricular: true },
          { id: "EP", name: "Evaluación Parcial Práctica", prefix: "EP", weight: "30%", weightDecimal: 0.3, grade: finalGrade, isCurricular: true },
          { id: "EC2", name: "Evaluación Continua 2 / Talleres", prefix: "EC2", weight: "20%", weightDecimal: 0.2, grade: finalGrade, isCurricular: true },
          { id: "EF", name: "Evaluación Modular Final", prefix: "EF", weight: "30%", weightDecimal: 0.3, grade: finalGrade, isCurricular: true }
        ]
      };
    };

    if (selectedSemester === "2028-I") {
      if (isContabilidad) {
        return [
          buildCourse("cur_co_301", "CONT-301", "Contabilidad de Sociedades Mercantiles", 4, "Ciclo III", "Aula 301 • Pabellón C", "BarChart3", 17.0),
          buildCourse("cur_co_302", "CONT-302", "Legislación Tributaria I (IGV, Comprobantes y Detracciones)", 4, "Ciclo III", "Aula 302 • Pabellón C", "Sliders", 16.5),
          buildCourse("cur_co_303", "CONT-303", "Costos y Presupuestos Básicos", 3, "Ciclo III", "Aula 303 • Pabellón C", "Cpu", 17.5),
          buildCourse("cur_co_304", "CONT-304", "Contabilidad Computarizada I (Concar / Siigo)", 3, "Ciclo III", "Lab. Contable 1", "Sliders", 16.0),
          buildCourse("cur_co_305", "CONT-305", "Ética y Deontología Profesional", 2, "Ciclo III", "Aula 305 • Pabellón C", "Award", 17.0)
        ];
      }
      return [
        buildCourse("cur_ei_301", "EIND-301", "Máquinas Eléctricas Rotativas y Generadores", 4, "Ciclo III", "Lab. Máquinas Eléctricas", "Zap", 17.0),
        buildCourse("cur_ei_302", "EIND-302", "Instalaciones Eléctricas Industriales en Media Tensión", 4, "Ciclo III", "Taller de MT 302", "Cpu", 16.5),
        buildCourse("cur_ei_303", "EIND-303", "Tableros Eléctricos y Sistemas de Protección", 3, "Ciclo III", "Lab. Tableros 301", "Sliders", 17.5),
        buildCourse("cur_ei_304", "EIND-304", "Electrónica de Potencia Industrial", 3, "Ciclo III", "Lab. Potencia 2", "Zap", 16.0),
        buildCourse("cur_ei_305", "EIND-305", "Sociedad y Economía en la Globalización", 2, "Ciclo III", "Aula 305", "Award", 17.0)
      ];
    }

    if (selectedSemester === "2028-II") {
      if (isContabilidad) {
        return [
          buildCourse("cur_co_401", "CONT-401", "Contabilidad de Costos Avanzada por Procesos y Órdenes", 4, "Ciclo IV", "Aula 401 • Pabellón C", "BarChart3", 17.5),
          buildCourse("cur_co_402", "CONT-402", "Legislación Tributaria II (Impuesto a la Renta de 3ra)", 4, "Ciclo IV", "Aula 402 • Pabellón C", "Sliders", 18.0),
          buildCourse("cur_co_403", "CONT-403", "Legislación Laboral, Planillas y T-Registro / PLAME", 3, "Ciclo IV", "Aula 403 • Pabellón C", "Cpu", 16.5),
          buildCourse("cur_co_404", "CONT-404", "Contabilidad Computarizada II (Sistemas ERP Integrados)", 3, "Ciclo IV", "Lab. Contable 2", "Sliders", 17.0),
          buildCourse("cur_co_405", "CONT-405", "Gestión Financiera y Flujo de Caja", 2, "Ciclo IV", "Aula 405 • Pabellón C", "Award", 18.0)
        ];
      }
      return [
        buildCourse("cur_ei_401", "EIND-401", "Control de Motores y Arranque Electrónico", 4, "Ciclo IV", "Taller Motores 401", "Zap", 17.5),
        buildCourse("cur_ei_402", "EIND-402", "Automatización con Controladores Lógicos Programables (PLC I)", 4, "Ciclo IV", "Lab. Automatización PLC", "Cpu", 18.0),
        buildCourse("cur_ei_403", "EIND-403", "Mantenimiento de Subestaciones y Redes de Distribución", 3, "Ciclo IV", "Campo de Subestaciones", "Sliders", 16.5),
        buildCourse("cur_ei_404", "EIND-404", "Sistemas Neumáticos y Electroneumáticos Industriales", 3, "Ciclo IV", "Lab. Neumática 402", "Zap", 17.0),
        buildCourse("cur_ei_405", "EIND-405", "Medio Ambiente y Desarrollo Sostenible", 2, "Ciclo IV", "Aula 405", "Award", 18.0)
      ];
    }

    if (selectedSemester === "2029-I") {
      if (isContabilidad) {
        return [
          buildCourse("cur_co_501", "CONT-501", "Auditoría Financiera y Procedimientos de Control", 4, "Ciclo V", "Aula 501 • Pabellón C", "BarChart3", 18.0),
          buildCourse("cur_co_502", "CONT-502", "Formulación y Presentación de Estados Financieros (NIIF)", 4, "Ciclo V", "Aula 502 • Pabellón C", "Sliders", 17.5),
          buildCourse("cur_co_503", "CONT-503", "Finanzas Corporativas y Valoración de Empresas", 3, "Ciclo V", "Aula 503 • Pabellón C", "Cpu", 18.0),
          buildCourse("cur_co_504", "CONT-504", "Tributación Municipal y Aduanera", 3, "Ciclo V", "Aula 504 • Pabellón C", "Sliders", 16.5),
          buildCourse("cur_co_505", "CONT-505", "Emprendimiento y Plan de Negocios Contables", 2, "Ciclo V", "Aula 505 • Pabellón C", "Award", 19.0)
        ];
      }
      return [
        buildCourse("cur_ei_501", "EIND-501", "Automatización Avanzada PLC II y Redes Industriales", 4, "Ciclo V", "Lab. Redes Industriales", "Cpu", 18.0),
        buildCourse("cur_ei_502", "EIND-502", "Sistemas de Supervisión SCADA y Pantallas HMI", 4, "Ciclo V", "Centro de Cómputo SCADA", "Sliders", 17.5),
        buildCourse("cur_ei_503", "EIND-503", "Instrumentación y Control de Procesos Industriales", 3, "Ciclo V", "Lab. Instrumentación", "Zap", 18.0),
        buildCourse("cur_ei_504", "EIND-504", "Eficiencia Energética y Auditorías Eléctricas", 3, "Ciclo V", "Aula 504", "Sliders", 16.5),
        buildCourse("cur_ei_505", "EIND-505", "Ética y Deontología Profesional", 2, "Ciclo V", "Aula 505", "Award", 19.0)
      ];
    }

    // Default: 2029-II (Ciclo VI)
    if (isContabilidad) {
      return [
        buildCourse("cur_co_601", "CONT-601", "Proyecto Integrador de Gestión Contable y Tributaria", 5, "Ciclo VI", "Aula 601 • Pabellón C", "BarChart3", 18.5),
        buildCourse("cur_co_602", "CONT-602", "Auditoría Tributaria, Fiscalización y Peritaje Contable", 4, "Ciclo VI", "Aula 602 • Pabellón C", "Sliders", 17.0),
        buildCourse("cur_co_603", "CONT-603", "Análisis e Interpretación de Estados Financieros", 3, "Ciclo VI", "Aula 603 • Pabellón C", "Cpu", 17.5),
        buildCourse("cur_co_604", "CONT-604", "Control Interno y Gestión Integral de Riesgos (COSO)", 2, "Ciclo VI", "Aula 604 • Pabellón C", "Award", 19.0),
        buildCourse("cur_co_605", "CONT-605", "Legislación Laboral y Relaciones de Trabajo", 2, "Ciclo VI", "Aula 605 • Pabellón C", "Award", 18.0)
      ];
    }
    return [
      buildCourse("cur_ei_601", "EIND-601", "Integración de Sistemas Automatizados y Robótica", 4, "Ciclo VI", "Taller Robótica Industrial", "Cpu", 18.5),
      buildCourse("cur_ei_602", "EIND-602", "Mantenimiento Predictivo y Gestión de Activos Eléctricos", 4, "Ciclo VI", "Lab. Predictivo 602", "Sliders", 17.0),
      buildCourse("cur_ei_603", "EIND-603", "Proyectos Electromecánicos y Gestión de Obras", 3, "Ciclo VI", "Aula de Proyectos 603", "Sliders", 17.5),
      buildCourse("cur_ei_604", "EIND-604", "Proyecto de Innovación y Titulación EFSRT", 3, "Ciclo VI", "Taller de Titulación", "Award", 19.0),
      buildCourse("cur_ei_605", "EIND-605", "Emprendimiento y Gestión Empresarial", 2, "Ciclo VI", "Aula 605", "Award", 18.0)
    ];
  }, [selectedSemester, studentDni, storageSyncKey, enrichedCourses, isContabilidad, isMateo, cycleStatuses]);

  const activeCourse = semesterCourses.find(c => c.name === selectedCourseDetail || c.id === selectedCourseDetail || c.code === selectedCourseDetail) || semesterCourses[0];

  const renderCourseIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Zap":
        return <Zap className={className} />;
      case "Cpu":
        return <Cpu className={className} />;
      case "Sliders":
        return <Sliders className={className} />;
      case "BarChart3":
      default:
        return <Award className={className} />;
    }
  };

  const totalCredits = semesterCourses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0) || (selectedSemester === "2027-I" ? 16 : 16);

  const activeStats = computeCourseStats(activeCourse);

  // Curricular evaluations of the active course (formula variables: PC1, PC2, EX_FINAL)
  const formulaEvaluations = activeCourse?.evaluations?.filter((e: any) => e.isCurricular !== false) || [];

  // Weekly tasks of the active course (accumulated into NPA)
  const weeklyTasks = activeCourse?.weeklyTasks || activeCourse?.evaluations?.filter((e: any) => e.isCurricular === false) || [];
  const gradedWeeklyTasks = weeklyTasks.filter((t: any) => typeof t.grade === "number");
  const courseNpa = gradedWeeklyTasks.length > 0
    ? (gradedWeeklyTasks.reduce((sum: number, t: any) => sum + (t.grade as number), 0) / gradedWeeklyTasks.length).toFixed(1)
    : null;

  // Global cycle NPA across all courses
  const allGradedWeeklyTasks = semesterCourses.flatMap((c) => c.weeklyTasks || c.evaluations?.filter((e: any) => e.isCurricular === false) || []).filter((t: any) => typeof t.grade === "number");
  const cycleNpaAverage = allGradedWeeklyTasks.length > 0
    ? (allGradedWeeklyTasks.reduce((sum: number, t: any) => sum + (t.grade as number), 0) / allGradedWeeklyTasks.length).toFixed(1)
    : null;

  // Overall cycle calculation: weighted average of courses that have evaluations
  const coursesWithEvaluations = semesterCourses.map(c => ({
    course: c,
    stats: computeCourseStats(c)
  })).filter(item => item.stats.hasAnyGrade);

  const cycleProgressiveAverage = coursesWithEvaluations.length > 0
    ? (
        coursesWithEvaluations.reduce((sum, item) => sum + (item.stats.progressiveAverage * (Number(item.course.credits) || 4)), 0) /
        coursesWithEvaluations.reduce((sum, item) => sum + (Number(item.course.credits) || 4), 0)
      ).toFixed(1)
    : "Sin notas";

  const hasAnyEvaluations = coursesWithEvaluations.length > 0;

  return (
    <PageTransition id="notas" className="space-y-6">
      {/* Header widget */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • CONTROL DE RENDIMIENTO
            </span>
            <h2 id="notas-view-main" className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Récord de Calificaciones
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl">
              Calificaciones oficiales guardadas por evaluación. El promedio mostrado es ponderado y auditado por secretaría académica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/40 border border-white/20 px-3.5 py-1.5 rounded-xl select-none shadow-inner flex items-center gap-2">
              <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">Periodo:</span>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value as any);
                  setSelectedCourseDetail("");
                }}
                className="bg-transparent text-xs font-black text-white font-mono outline-none cursor-pointer"
              >
                <option value="2027-I" className="text-slate-900 bg-white">Semestre 2027-I (Ciclo I)</option>
                {(isPromotedCycle2 || isGraduated) && (
                  <option value="2027-II" className="text-slate-900 bg-white">Semestre 2027-II (Ciclo II)</option>
                )}
                {isGraduated && (
                  <>
                    <option value="2028-I" className="text-slate-900 bg-white">Semestre 2028-I (Ciclo III)</option>
                    <option value="2028-II" className="text-slate-900 bg-white">Semestre 2028-II (Ciclo IV)</option>
                    <option value="2029-I" className="text-slate-900 bg-white">Semestre 2029-I (Ciclo V)</option>
                    <option value="2029-II" className="text-slate-900 bg-white">Semestre 2029-II (Ciclo VI)</option>
                  </>
                )}
              </select>
            </div>
            <button
              onClick={() => setShowBoletaModal(true)}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Printer className="w-3.5 h-3.5 text-[#800521]" />
              <span>Descargar Boleta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-[#800521] flex items-center justify-between text-left">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Promedio del Ciclo</span>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono ${
                hasAnyEvaluations && Number(cycleProgressiveAverage) >= 12.5
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {hasAnyEvaluations ? "Ponderado Oficial" : "Sin Registro"}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {hasAnyEvaluations ? cycleProgressiveAverage : "0.0"}
            </p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              {hasAnyEvaluations 
                ? `${coursesWithEvaluations.length} de ${semesterCourses.length} curso${semesterCourses.length === 1 ? "" : "s"} calificado${coursesWithEvaluations.length === 1 ? "" : "s"}`
                : `Semestre Académico ${selectedSemester}`}
            </span>
          </div>
          <div className="p-2.5 bg-[#800521]/10 text-[#800521] rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-emerald-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Créditos Llevados</span>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{totalCredits.toFixed(1)}</p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              Total matriculado {
                selectedSemester === "2029-II" ? "Ciclo VI" :
                selectedSemester === "2029-I" ? "Ciclo V" :
                selectedSemester === "2028-II" ? "Ciclo IV" :
                selectedSemester === "2028-I" ? "Ciclo III" :
                selectedSemester === "2027-II" ? "Ciclo II" : "Ciclo I"
              }
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-purple-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Materias Matriculadas</span>
            <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{semesterCourses.length}</p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">{semesterCourses.length} Unidades Didácticas</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-emerald-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Condición Académica</span>
            <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
              {hasAnyEvaluations && Number(cycleProgressiveAverage) >= 12.5 ? "APROBADO" : "MATRICULADO"}
            </p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              {selectedSemester === "2029-II"
                ? "Egresado Regular • Apto Titulación"
                : selectedSemester === "2029-I"
                ? "Promovido a Ciclo VI"
                : selectedSemester === "2028-II"
                ? "Promovido a Ciclo V • Módulo EFSRT II"
                : selectedSemester === "2028-I"
                ? "Promovido a Ciclo IV"
                : selectedSemester === "2027-II"
                ? (hasAnyEvaluations && Number(cycleProgressiveAverage) >= 12.5 ? "Promovido a Ciclo III • Módulo EFSRT I" : "Semestre Académico 2027-II")
                : (hasAnyEvaluations && Number(cycleProgressiveAverage) >= 12.5 ? "Promovido a Ciclo II" : "Semestre Académico 2027-I")}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT AREA: Evaluations detail card */}
        <div className="xl:col-span-8 space-y-6 text-left">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 leading-tight">
                  {renderCourseIcon(activeCourse?.iconType || "BarChart3", "w-5 h-5 text-[#800521] shrink-0")}
                  <span>{activeCourse?.name}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-bold uppercase block">
                  {activeCourse?.code} • {activeCourse?.classroom}
                </span>
              </div>

              {activeStats.hasAnyGrade && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-emerald-100/70 border-2 border-emerald-500/40 rounded-2xl px-4 py-3 shrink-0 shadow-xs self-start md:self-center">
                  <div className="text-right">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-800 block">
                      Promedio del Curso
                    </span>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-2xl md:text-3.5xl font-black font-mono text-emerald-800 leading-none">
                        {activeStats.progressiveAverage.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600">/ 20</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-2xs font-mono ${
                    activeStats.progressiveAverage >= 12.5
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}>
                    {activeStats.progressiveAverage >= 12.5 ? "Aprobado" : "Desaprobado"}
                  </span>
                </div>
              )}
            </div>

            {activeCourse ? (
              <div className="space-y-6">
                {/* 1. SECCIÓN: EVALUACIONES OFICIALES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#800521]" />
                        Evaluaciones Oficiales
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Calificaciones registradas para el acta final.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {formulaEvaluations.length} evaluaciones
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left">
                          <th className="py-2.5 px-1">Evaluación</th>
                          <th className="py-2.5 text-center">Código</th>
                          <th className="py-2.5 text-center">Peso</th>
                          <th className="py-2.5 text-center">Estado</th>
                          <th className="py-2.5 text-right">Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formulaEvaluations.map((evalItem: any, idx: number) => {
                          const isNotRegistered = evalItem.grade === "NR" || evalItem.grade === undefined;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-all font-sans">
                              <td className="py-3 px-1">
                                <span className="text-slate-800 font-black block text-[12px]">{evalItem.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{evalItem.sub}</span>
                              </td>
                              
                              <td className="py-3 text-center">
                                <span className="font-mono text-[11px] text-[#800521] font-black bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase">
                                  {evalItem.prefix}
                                </span>
                              </td>
                              
                              <td className="py-3 text-center font-mono text-slate-600 font-bold text-[11px]">
                                {evalItem.weight}
                              </td>

                              <td className="py-3 text-center">
                                <span className="text-[9.5px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                  {isNotRegistered ? "Pendiente" : "Registrado"}
                                </span>
                              </td>
                              
                              <td className="py-3 text-right">
                                <span className={`font-mono font-black text-[13px] min-w-12 h-8 inline-flex items-center justify-center px-2.5 rounded-lg border select-none ${
                                  isNotRegistered 
                                    ? "bg-slate-100 text-slate-400 border-slate-200" 
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold"
                                }`}>
                                  {isNotRegistered ? "NR" : evalItem.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Official Course Formula & Progressive Breakdown */}
                  <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl space-y-3 text-left shadow-3xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">
                        Fórmula Curricular Oficial del Curso:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-3xs">
                          Avance Evaluado: {(activeStats.evaluatedWeight * 100).toFixed(0)}%
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                          activeStats.isFullyEvaluated 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}>
                          {activeStats.isFullyEvaluated ? "Evaluación Cerrada" : "En Desarrollo Lectivo"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                      <code className="text-xs md:text-sm font-mono font-black text-[#800521] block select-all">
                        {activeCourse.formula}
                      </code>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                        Desglose de cálculo: <span className="font-mono font-extrabold text-slate-800">{activeStats.breakdownText}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-xs">
                      {activeStats.isFullyEvaluated ? (
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-slate-500 font-black text-[10px] uppercase tracking-wider block">
                              Promedio Ponderado Final del Curso:
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Evaluación curricular ministerial consolidada y cerrada en acta
                            </span>
                          </div>
                          <div className="text-right flex items-center gap-2.5">
                            <span className="font-mono text-[#800521] font-black text-xl leading-none">
                              {activeStats.progressiveAverage.toFixed(1)} / 20
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                              activeStats.progressiveAverage >= 12.5
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}>
                              {activeStats.progressiveAverage >= 12.5 ? "Aprobado" : "Desaprobado"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-slate-500 font-black text-[10px] uppercase tracking-wider block">
                              Puntaje al Momento:
                            </span>
                            <span className="font-mono text-emerald-700 font-black text-base">
                              {activeStats.accumulatedPoints.toFixed(1)} / 20.0 pts
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 font-black text-[10px] uppercase tracking-wider block">
                              Rendimiento Parcial:
                            </span>
                            <span className="font-mono text-slate-900 font-black text-base">
                              {activeStats.hasAnyGrade ? `${activeStats.progressiveAverage.toFixed(1)} / 20` : "Pendiente de primer hito (PC1)"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN: ACTIVIDADES Y TAREAS CONTINUAS (NPA) */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Tareas y Actividades Continuas
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Tareas e informes semanales que acumulan en la nota de participación.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-700">Promedio:</span>
                      <span className="font-mono font-black text-blue-900 text-sm">
                        {courseNpa !== null ? `${courseNpa} / 20` : "Sin tareas"}
                      </span>
                    </div>
                  </div>

                  {weeklyTasks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left">
                            <th className="py-2.5 px-1">Tarea</th>
                            <th className="py-2.5 text-center">Semana</th>
                            <th className="py-2.5 text-center">Estado</th>
                            <th className="py-2.5 text-right">Nota</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {weeklyTasks.map((task: any, idx: number) => {
                            const isGraded = typeof task.grade === "number";
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-all font-sans">
                                <td className="py-3 px-1">
                                  <span className="text-slate-800 font-black block text-[12px]">{task.name}</span>
                                  {task.feedback && (
                                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 italic">
                                      "{task.feedback}"
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 text-center">
                                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    {task.prefix}
                                  </span>
                                </td>

                                <td className="py-3 text-center">
                                  <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded ${
                                    task.hasSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {task.hasSubmitted ? "Entregado" : "Pendiente"}
                                  </span>
                                </td>

                                <td className="py-3 text-right">
                                  <span className={`font-mono font-black text-[13px] min-w-12 h-8 inline-flex items-center justify-center px-2.5 rounded-lg border select-none ${
                                    isGraded
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold"
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}>
                                    {isGraded ? task.grade : "NR"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400 italic">
                      No se han asignado tareas aún.
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-lg text-[10.5px] font-bold text-slate-650 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Nota Importante:</strong> La nota aprobatoria mínima institucional es de <strong>13 (trece)</strong>. Las notas pendientes se registran como <em>"NR"</em> y se regularizan conforme el docente evalúe en las sesiones.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-400 italic">No hay datos para esta unidad didáctica.</div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: Course navigator bar sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4 text-left">
            <h3 className="text-[11.5px] font-black uppercase text-slate-500 tracking-wider">Cursos del Ciclo</h3>
            
            <div className="space-y-2.5">
              {semesterCourses.map((courseItem) => {
                const isSelected = activeCourse?.id === courseItem.id;
                const courseItemStats = computeCourseStats(courseItem);
                return (
                  <button
                    key={courseItem.id}
                    onClick={() => setSelectedCourseDetail(courseItem.name)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-[#800521]/5 border-[#800521]/20 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#800521] text-white border-[#800521]"
                          : "bg-slate-50 text-slate-400 group-hover:text-slate-700 border-slate-100 group-hover:border-slate-200"
                      }`}>
                        {renderCourseIcon(courseItem.iconType, "w-4 h-4")}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className={`text-[12.5px] font-black block truncate leading-tight ${
                          isSelected ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {courseItem.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wide uppercase">
                            Código: {courseItem.code}
                          </span>
                          {courseItemStats.hasAnyGrade && (
                            <span className="text-[10.5px] font-mono font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-2xs">
                              {courseItemStats.progressiveAverage.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-[#800521] translate-x-0.5" : "text-slate-350 group-hover:text-slate-600"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <BoletaNotasModal
        isOpen={showBoletaModal}
        onClose={() => setShowBoletaModal(false)}
        studentDni={studentInfo?.dni || "74859612"}
        studentName={studentInfo?.name || "Mateo Sebastián Quispe Rojas"}
        careerName={studentInfo?.career || "Electricidad Industrial"}
        cycleNumber={selectedSemester === "2027-I" ? 1 : 2}
        courses={semesterCourses.map((c) => {
          const stats = computeCourseStats(c);
          return {
            code: c.code,
            name: c.name,
            credits: Number(c.credits) || 4,
            grade: stats.hasAnyGrade ? stats.progressiveAverage : "NR",
            approved: stats.hasAnyGrade ? stats.progressiveAverage >= 12.5 : null,
            status: stats.hasAnyGrade 
              ? (stats.progressiveAverage >= 12.5 ? "Aprobado" : "Desaprobado")
              : "En Curso"
          };
        })}
        average={hasAnyEvaluations ? Number(cycleProgressiveAverage) : 0}
      />
    </PageTransition>
  );
};
