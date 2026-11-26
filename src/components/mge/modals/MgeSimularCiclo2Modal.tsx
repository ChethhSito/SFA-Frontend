import React, { useState } from "react";
import { GraduationCap, XCircle, CheckCircle2, ShieldCheck, AlertCircle, Award } from "lucide-react";
import { ProcessedStudent } from "../mgeTypes";
import { Course, CourseAssignment } from "../../../types";
import { getCourseFormula } from "../../../constants/courseFormulas";
import { updateStudentCycleStatuses } from "../../../services/api";

interface MgeSimularCiclo2ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  student?: ProcessedStudent;
  courses?: Course[];
  assignments?: CourseAssignment[];
  onSimulated?: (studentDni: string) => void;
}

export const MgeSimularCiclo2Modal: React.FC<MgeSimularCiclo2ModalProps> = ({
  isOpen = true,
  onClose,
  student,
  courses = [],
  assignments = [],
  onSimulated,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !student) return null;

  const careerStr = ((student as any).programId || (student as any).career || (student as any).program || "").toLowerCase();
  const isContabilidad = careerStr.includes("cont");

  const detectRealCourseGrade2 = (courseCode: string, courseId: string) => {
    const formula = getCourseFormula(courseCode);
    const matchIds = new Set<string>([courseCode, courseId, `cur-${courseId}`]);
    courses.forEach((c: any) => {
      if (c.code === courseCode || c.code?.startsWith(`${courseCode}-`) || c.id === courseId || c.id === `cur-${courseId}`) {
        if (c.id) matchIds.add(c.id);
        if (c._id) matchIds.add(c._id);
        if (c.code) matchIds.add(c.code);
      }
    });
    const courseAssignments = assignments.filter((a) => matchIds.has(a.courseId));
    let localParsed: Record<string, any> | null = null;
    try {
      const rawLocal = localStorage.getItem(`sfa_grades_${courseCode}_${student.dni}`) ||
        localStorage.getItem(`sfa_grades_${courseId}_${student.dni}`);
      if (rawLocal) localParsed = JSON.parse(rawLocal);
    } catch {}

    let weightedSum = 0;
    let gradedWeight = 0;
    let gradedCount = 0;
    formula.variables.forEach((v) => {
      let val: number | null = null;
      const matchingAsg = courseAssignments.find((a) =>
        a.curricularComponent === v.id ||
        a.title === `[Planilla] ${v.id}` ||
        a.title.toUpperCase().includes(`[${v.id}]`)
      );
      const sub = matchingAsg?.submissions?.find((s) => s.studentDni === student.dni && typeof s.grade === "number");
      if (sub && typeof sub.grade === "number") val = sub.grade;
      if ((val === null || val === undefined) && localParsed && typeof localParsed[v.id] === "number") {
        val = Number(localParsed[v.id]);
      }
      if (typeof val === "number" && Number.isFinite(val)) {
        weightedSum += val * v.weight;
        gradedWeight += v.weight;
        gradedCount += 1;
      }
    });
    const hasAnyGrade = gradedCount > 0 || (localParsed !== null && typeof localParsed.finalGrade === "number");
    const grade = gradedCount > 0
      ? Math.round((gradedCount === formula.variables.length ? weightedSum : weightedSum / Math.max(gradedWeight, 0.01)) * 10) / 10
      : (localParsed && typeof localParsed.finalGrade === "number" ? Number(localParsed.finalGrade) : 0);
    return { hasAnyGrade, grade };
  };

  // The 5 official courses for Ciclo II (con detector inteligente de notas docentes)
  const baseCiclo2 = isContabilidad ? [
    { id: "cur_co_201", code: "CONT-201", name: "Contabilidad General Aplicada", credits: 4, defaultGrade: 16.5, doc: "Lic. Patricia Elena Benavides Silva" },
    { id: "cur_co_202", code: "CONT-202", name: "Administración de Archivos Contables", credits: 3, defaultGrade: 17.0, doc: "Lic. Patricia Elena Benavides Silva" },
    { id: "cur_co_203", code: "CONT-203", name: "Sistema de Información Contable I", credits: 3, defaultGrade: 16.0, doc: "Lic. Fernando Gabriel Díaz Torres" },
    { id: "cur_co_204", code: "CONT-204", name: "Tributación y Legislación Comercial", credits: 3, defaultGrade: 16.5, doc: "Lic. Carlos Alberto Mendoza Quispe" },
    { id: "cur_co_205", code: "CONT-205", name: "Estadística Aplicada a los Negocios", credits: 3, defaultGrade: 15.5, doc: "Lic. Jorge Luis Paucar Silva" },
  ] : [
    { id: "cur_ei_201", code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", credits: 4, defaultGrade: 16.5, doc: "Ing. Manuel Ramos Salazar" },
    { id: "cur_ei_202", code: "EIND-202", name: "Electrónica Analógica y de Potencia Básica", credits: 4, defaultGrade: 17.0, doc: "Ing. Roberto Chávez Peña" },
    { id: "cur_ei_203", code: "EIND-203", name: "Mediciones Eléctricas e Instrumentación", credits: 3, defaultGrade: 16.0, doc: "Ing. Walter Fernández" },
    { id: "cur_ei_204", code: "EIND-204", name: "Máquinas Eléctricas Estáticas (Transformadores)", credits: 4, defaultGrade: 16.5, doc: "Ing. Manuel Ramos Salazar" },
    { id: "cur_ei_205", code: "EIND-205", name: "Inglés Técnico Aplicado a la Electricidad", credits: 2, defaultGrade: 15.5, doc: "Lic. Carmen Luzardo" },
  ];

  const ciclo2Courses = baseCiclo2.map((c) => {
    const detected = detectRealCourseGrade2(c.code, c.id);
    return {
      code: c.code,
      name: c.name,
      credits: c.credits,
      doc: c.doc,
      simulatedGrade: detected.hasAnyGrade ? detected.grade : c.defaultGrade,
      isManual: detected.hasAnyGrade,
    };
  });

  const totalCredits = ciclo2Courses.reduce((sum, c) => sum + c.credits, 0);
  const weightedAverage = (
    ciclo2Courses.reduce((sum, c) => sum + c.credits * c.simulatedGrade, 0) / totalCredits
  ).toFixed(1);

  const handleConfirm = () => {
    setIsProcessing(true);

    try {
      const studentDni = student.dni || "74859612";
      const studentName = `${student.name || "Mateo Sebastián"} ${student.lastName || "Quispe Rojas"}`;

      // 1. Simulation payload for Ciclo II
      const simulationData = {
        studentDni,
        studentName,
        cycle: 2,
        period: "2027-II",
        completedAt: new Date().toISOString(),
        weightedAverage: Number(weightedAverage),
        courses: ciclo2Courses.map((c) => ({
          code: c.code,
          name: c.name,
          credits: c.credits,
          grade: c.simulatedGrade,
          teacher: c.doc,
          approved: true,
        })),
      };

      // Store in localStorage for multiple key access patterns
      localStorage.setItem(`sfa_simulated_cycle2_${studentDni}`, JSON.stringify(simulationData));

      // Guarantee Ciclo I is preserved and approved
      localStorage.setItem(`sfa_student_promoted_cycle2_${studentDni}`, "true");
      localStorage.setItem(`sfa_student_promoted_${studentDni}`, "true");

      if (!localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`)) {
        const c1Payload = {
          studentDni,
          studentName,
          cycle: 1,
          period: "2027-I",
          completedAt: new Date().toISOString(),
          weightedAverage: 16.2,
          courses: isContabilidad ? [
            { code: "CONT-101", name: "Fundamentos de Contabilidad y Doctrina Contable", credits: 4, grade: 17.0, approved: true },
            { code: "CONT-102", name: "Documentación Comercial, Mercantil y Bancaria", credits: 4, grade: 16.5, approved: true },
            { code: "CONT-103", name: "Matemática Financiera y Comercial", credits: 3, grade: 16.0, approved: true },
            { code: "CONT-104", name: "Legislación Comercial y Societaria", credits: 3, grade: 15.5, approved: true },
            { code: "CONT-105", name: "Comunicación y Competencias Digitales", credits: 2, grade: 16.0, approved: true }
          ] : [
            { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, grade: 16.4, approved: true },
            { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, grade: 16.5, approved: true },
            { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, grade: 17.0, approved: true },
            { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, grade: 15.0, approved: true },
            { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, grade: 16.0, approved: true }
          ]
        };
        localStorage.setItem(`sfa_simulated_cycle1_${studentDni}`, JSON.stringify(c1Payload));
      }

      // Individual grades for simulated courses only (preserve teacher-graded courses)
      ciclo2Courses.forEach(c => {
        if (!c.isManual) {
          const obj = { NPA: c.simulatedGrade, PC1: c.simulatedGrade, PC2: c.simulatedGrade, EX_FINAL: c.simulatedGrade, finalGrade: c.simulatedGrade };
          localStorage.setItem(`sfa_grades_${c.code}_${studentDni}`, JSON.stringify(obj));
        }
      });

      // Attendance consolidation
      localStorage.setItem(`sfa_attendance_complete_cycle2_${studentDni}`, "true");
      localStorage.setItem(`sfa_attendance_complete_cycle1_${studentDni}`, "true");
      ciclo2Courses.forEach((c) => {
        localStorage.setItem(`sfa_attendance_complete_${c.code}`, "true");
        localStorage.setItem(`sfa_attendance_count_${c.code}_${studentDni}`, "16");
      });

      // Mark cycle 2 closed and promote student to Ciclo III
      localStorage.setItem(`sfa_student_promoted_cycle3_${studentDni}`, "true");
      localStorage.setItem(`sfa_efsrt_modulo1_approved_${studentDni}`, "true");
      localStorage.setItem(`sfa_student_cycle_${studentDni}`, "3");

      // Persist Ciclo I + Ciclo II in MongoDB
      try {
        const rawC1 = localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`);
        const parsedC1 = rawC1 ? JSON.parse(rawC1) : null;
        const c1Entry = parsedC1 && Array.isArray(parsedC1.courses)
          ? {
              cycleNumber: 1,
              year: 2027,
              status: "Aprobado",
              average: Number(parsedC1.weightedAverage) || 16.0,
              credits: parsedC1.courses.reduce((s: number, c: any) => s + (Number(c.credits) || 3), 0) || 16,
              courses: parsedC1.courses.map((c: any) => ({
                name: `${c.code}::${c.name}`,
                grade: Number(c.grade) || 0,
                approved: Number(c.grade) >= 12.5,
              })),
            }
          : null;
        const c2Entry = {
          cycleNumber: 2,
          year: 2027,
          status: "Aprobado",
          average: Number(weightedAverage),
          credits: totalCredits,
          courses: ciclo2Courses.map((c) => ({
            name: `${c.code}::${c.name}`,
            grade: c.simulatedGrade,
            approved: c.simulatedGrade >= 12.5,
          })),
        };
        void updateStudentCycleStatuses(studentDni, c1Entry ? [c1Entry, c2Entry] : [c2Entry]);
      } catch {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }

      setTimeout(() => {
        setIsProcessing(false);
        if (onSimulated) {
          onSimulated(studentDni);
        }
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error al simular cierre de Ciclo II:", err);
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800 font-sans text-left">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#9F062A] to-[#800521] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs md:text-sm uppercase tracking-wide">
              Simulación y Consolidación de Actas • Ciclo II (Presentación)
            </span>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Student Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estudiante Titular
              </span>
              <p className="font-extrabold text-slate-800 text-sm">
                {student.name} {student.lastName}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                DNI: {student.dni} • Programa: {isContabilidad ? "Contabilidad" : "Electricidad Industrial"} • Período 2027-II
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Asistencia Reglamentaria
                </span>
                <span className="text-lg font-black text-slate-800 font-mono">100%</span>
                <span className="text-[9.5px] text-emerald-700 font-bold block uppercase">16/16 Semanas</span>
              </div>
              <div className="text-right border-l border-slate-200 pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Promedio Ponderado
                </span>
                <span className="text-xl font-black text-emerald-700 font-mono">{weightedAverage}</span>
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Aprobado</span>
              </div>
            </div>
          </div>

          {/* Institutional note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <p className="font-bold text-[11px]">Consolidación Automática para Demostración</p>
              <p className="text-[10px] text-amber-800 mt-0.5">
                Al confirmar, se registrarán las calificaciones formativas y finales, así como las <strong>16 semanas de asistencia reglamentaria (100% de asistencia presencial, sin faltas ni inhabilitación por DPI)</strong> de las 5 asignaturas de Segundo Ciclo, se cerrarán las actas y se habilitará la certificación del <strong>Módulo Técnico I (EFSRT)</strong> para su visualización en el portal del estudiante y secretaría.
              </p>
            </div>
          </div>

          {/* Courses Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-3xs">
            <table className="w-full min-w-[580px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Asignatura</th>
                  <th className="py-2 px-3">Docente</th>
                  <th className="py-2 px-3 text-center">Créd.</th>
                  <th className="py-2 px-3 text-center">Asistencia</th>
                  <th className="py-2 px-3 text-center">Nota Final</th>
                  <th className="py-2 px-3 text-center">Condición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ciclo2Courses.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">{c.code}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-2 px-3 text-[10px] text-slate-500 font-medium">{c.doc}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-600">{c.credits}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-mono text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        16/16 (100%)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-black text-emerald-700 font-mono">{c.simulatedGrade.toFixed(1)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        Aprobado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-blue-900 text-[10px]">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <p>
              Esta acción genera el acta con validez institucional y el registro de 16 semanas de asistencia presencial cumplidas, permitiendo al jurado comprobar de inmediato el ciclo de vida académico continuo, la transición al Módulo EFSRT y la emisión de constancias sin demoras.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isProcessing ? "Consolidando Actas..." : "Confirmar y Consolidar Ciclo II"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
