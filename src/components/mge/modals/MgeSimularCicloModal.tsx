import React, { useState } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, XCircle, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { ProcessedStudent } from "../mgeTypes";
import { Course, CourseAssignment } from "../../../types";
import { getCourseFormula } from "../../../constants/courseFormulas";
import { updateStudentCycleStatuses } from "../../../services/api";

interface MgeSimularCicloModalProps {
  isOpen?: boolean;
  onClose: () => void;
  student?: ProcessedStudent;
  courses?: Course[];
  assignments?: CourseAssignment[];
  onSimulated?: (studentDni: string) => void;
  activeCourse?: any;
}

export const MgeSimularCicloModal: React.FC<MgeSimularCicloModalProps> = ({
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

  // Detector inteligente por asignatura: revisa los 5 cursos del Ciclo I y detecta
  // automáticamente cuáles ya tienen notas reales del docente (los conserva intactos)
  // y cuáles no tienen notas aún (los simula con acta oficial MGE).
  const computeRealCourseGrade = (courseCode: string, courseId: string) => {
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
    const regularHomeworks = courseAssignments.filter((a) =>
      !a.title.startsWith("[Planilla] ") &&
      a.kind !== "assessment" &&
      !a.curricularComponent &&
      !/\[PC\d+\]|PC\d+|EX_FINAL|EXAMEN|FINAL|TABLEROS|MONTAJE|SIMULACION|MEDICIONES|PRACT_FINAL/i.test(a.title)
    );

    let localParsed: Record<string, any> | null = null;
    try {
      const rawLocal = localStorage.getItem(`sfa_grades_${courseCode}_${student.dni}`) ||
        localStorage.getItem(`sfa_grades_${courseId}_${student.dni}`) ||
        localStorage.getItem(`sfa_grades_cur-${courseId}_${student.dni}`);
      if (rawLocal) localParsed = JSON.parse(rawLocal);
    } catch {}

    let weightedSum = 0;
    let gradedWeight = 0;
    let gradedCount = 0;

    formula.variables.forEach((v) => {
      let val: number | null = null;
      if (v.id === "NPA") {
        const hwGrades = regularHomeworks
          .map((a) => a.submissions?.find((s) => s.studentDni === student.dni && typeof s.grade === "number")?.grade)
          .filter((g): g is number => typeof g === "number");
        if (hwGrades.length > 0) {
          val = Number((hwGrades.reduce((a, b) => a + b, 0) / hwGrades.length).toFixed(1));
        }
      } else {
        const matchingAsg = courseAssignments.find((a) =>
          !a.title.startsWith("[Planilla] ") && (
            a.curricularComponent === v.id ||
            a.title.toUpperCase().includes(`[${v.id}]`) ||
            a.title.toUpperCase().includes(v.id) ||
            (v.id === "EX_FINAL" && /EX_FINAL|EXAMEN FINAL/i.test(a.title))
          )
        );
        const sub = matchingAsg?.submissions?.find((s) => s.studentDni === student.dni && typeof s.grade === "number");
        if (sub && typeof sub.grade === "number") {
          val = sub.grade;
        } else {
          const planillaAsg = courseAssignments.find((a) => a.title === `[Planilla] ${v.id}`);
          const planSub = planillaAsg?.submissions?.find((s) => s.studentDni === student.dni && typeof s.grade === "number");
          if (planSub && typeof planSub.grade === "number") val = planSub.grade;
        }
      }

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
    const hasAllGrades = gradedCount === formula.variables.length || (localParsed !== null && typeof localParsed.finalGrade === "number");
    const computedGrade = gradedCount > 0
      ? Math.round((hasAllGrades ? weightedSum : weightedSum / Math.max(gradedWeight, 0.01)) * 10) / 10
      : (localParsed && typeof localParsed.finalGrade === "number" ? Number(localParsed.finalGrade) : 0);

    return { computedGrade, hasAnyGrade, hasAllGrades };
  };

  const baseCiclo1 = isContabilidad ? [
    { id: "cur_co_101", code: "CONT-101", name: "Fundamentos de Contabilidad y Doctrina Contable", credits: 4, defaultGrade: 16.4 },
    { id: "cur_co_102", code: "CONT-102", name: "Documentación Comercial, Mercantil y Bancaria", credits: 4, defaultGrade: 16.5 },
    { id: "cur_co_103", code: "CONT-103", name: "Matemática Financiera y Comercial", credits: 3, defaultGrade: 16.0 },
    { id: "cur_co_104", code: "CONT-104", name: "Legislación Comercial y Societaria", credits: 3, defaultGrade: 15.5 },
    { id: "cur_co_105", code: "CONT-105", name: "Comunicación y Competencias Digitales", credits: 2, defaultGrade: 16.0 },
  ] : [
    { id: "cur_ei_101", code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, defaultGrade: 16.4 },
    { id: "cur_ei_102", code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, defaultGrade: 16.5 },
    { id: "cur_ei_103", code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, defaultGrade: 17.0 },
    { id: "cur_ei_104", code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, defaultGrade: 15.5 },
    { id: "cur_ei_105", code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, defaultGrade: 16.0 },
  ];

  const ciclo1Courses = baseCiclo1.map((c) => {
    const detected = computeRealCourseGrade(c.code, c.id);
    if (detected.hasAnyGrade) {
      return {
        code: c.code,
        name: c.name,
        credits: c.credits,
        simulatedGrade: detected.computedGrade,
        isManual: true,
        hasAllGrades: detected.hasAllGrades,
      };
    }
    return {
      code: c.code,
      name: c.name,
      credits: c.credits,
      simulatedGrade: c.defaultGrade,
      isManual: false,
      hasAllGrades: true,
    };
  });

  const manualCoursesCount = ciclo1Courses.filter((c) => c.isManual).length;
  const simulatedCoursesCount = ciclo1Courses.length - manualCoursesCount;

  const totalCredits = ciclo1Courses.reduce((sum, c) => sum + c.credits, 0);
  const weightedAverage = (
    ciclo1Courses.reduce((sum, c) => sum + c.credits * c.simulatedGrade, 0) / totalCredits
  ).toFixed(1);

  const handleConfirm = () => {
    setIsProcessing(true);

    try {
      // 1. Store simulated cycle 1 completion in localStorage
      const simulationData = {
        studentDni: student.dni,
        studentName: `${student.name} ${student.lastName}`,
        cycle: 1,
        completedAt: new Date().toISOString(),
        weightedAverage: Number(weightedAverage),
        courses: ciclo1Courses.map((c) => ({
          code: c.code,
          name: c.name,
          credits: c.credits,
          grade: c.simulatedGrade,
          isManual: c.isManual,
          approved: true,
        })),
      };

      localStorage.setItem(`sfa_simulated_cycle1_${student.dni}`, JSON.stringify(simulationData));
      localStorage.setItem(`sfa_attendance_complete_cycle1_${student.dni}`, "true");
      localStorage.setItem(`sfa_student_promoted_cycle2_${student.dni}`, "true");
      localStorage.setItem(`sfa_student_cycle_${student.dni}`, "2");
      localStorage.removeItem(`sfa_student_promoted_${student.dni}`);
      localStorage.removeItem(`sfa_student_graduated_all_${student.dni}`);

      void updateStudentCycleStatuses(student.dni, [
        {
          cycleNumber: 1,
          year: 2027,
          status: "Aprobado",
          average: Number(weightedAverage),
          credits: totalCredits,
          courses: ciclo1Courses.map((c) => ({
            name: `${c.code}::${c.name}`,
            grade: c.simulatedGrade,
            approved: c.simulatedGrade >= 12.5,
          })),
        },
      ]);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }

      setTimeout(() => {
        setIsProcessing(false);
        if (onSimulated) {
          onSimulated(student.dni);
        }
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error al simular cierre de Ciclo I:", err);
      setIsProcessing(false);
    }
  };

  const content = (
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
              Simulación y Cierre de Actas • Ciclo I
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
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* Student Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase text-slate-900">
                Estudiante: <span className="text-[#800521]">{student.lastName}, {student.name}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                DNI: {student.dni}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-3">
              <span>Carrera: <b className="text-slate-800">{isContabilidad ? "CONTABILIDAD" : "ELECTRICIDAD INDUSTRIAL"}</b></span>
              <span>•</span>
              <span>Ciclo Actual: <b className="text-slate-800">Ciclo I</b></span>
              <span>•</span>
              <span>Periodo: <b className="text-slate-800">2027-I</b></span>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex gap-3 text-xs text-amber-900 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Esta acción auditará y cerrará las actas oficiales del Ciclo I para este estudiante.
              </p>
              <p className="text-[11px] text-amber-800/90 font-medium">
                {manualCoursesCount > 0
                  ? `Se detectaron ${manualCoursesCount} asignatura(s) con calificaciones reales del docente (se conservarán intactas) y se completarán automáticamente las ${simulatedCoursesCount} restante(s) con actas oficiales MGE.`
                  : "No se registran calificaciones manuales aún; se completarán las 5 asignaturas del Ciclo I con actas oficiales MGE y notas aprobatorias realistas."}{" "}
                Al confirmar, el estudiante quedará formalmente promovido y con la <b>Matrícula del Ciclo II habilitada</b>.
              </p>
            </div>
          </div>

          {/* Preview Table of Ciclo I courses */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
            <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between min-w-[480px]">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                Asignaturas del Ciclo I a Consolidar
              </span>
              <span className="text-[9.5px] font-mono font-bold text-slate-500">
                5 Cursos • 16 Créditos
              </span>
            </div>

            <table className="w-full min-w-[480px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-b border-slate-200">
                  <th className="p-2.5">Código</th>
                  <th className="p-2.5">Asignatura</th>
                  <th className="p-2.5 text-center">Créd.</th>
                  <th className="p-2.5 text-center">Nota Final</th>
                  <th className="p-2.5 text-center">Origen / Condición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] font-medium text-slate-700">
                {ciclo1Courses.map((c) => (
                  <tr key={c.code} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono font-bold text-[#800521] text-[10.5px]">
                      {c.code}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800">
                      {c.name}
                    </td>
                    <td className="p-2.5 text-center font-mono font-semibold text-slate-500">
                      {c.credits.toFixed(1)}
                    </td>
                    <td className="p-2.5 text-center font-mono font-black text-slate-900">
                      {c.simulatedGrade.toFixed(1)}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase font-mono ${
                        c.isManual
                          ? (!c.hasAllGrades
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300")
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        {c.isManual
                          ? (!c.hasAllGrades ? "Manual Docente (Parcial)" : "Manual Docente")
                          : "Oficial MGE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Summary Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700">
                Promedio Ponderado Final del Ciclo I:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-base text-[#800521]">
                  {weightedAverage} / 20
                </span>
                <span className="bg-emerald-600 text-white font-mono font-bold px-2 py-0.5 rounded text-[9.5px] uppercase">
                  Aprobado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Toolbar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#9F062A] hover:bg-[#800521] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wide rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{isProcessing ? "Procesando actas..." : "Confirmar y Cerrar Ciclo I"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
