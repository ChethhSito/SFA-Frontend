import React, { useState } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, XCircle, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { ProcessedStudent } from "../mgeTypes";
import { Course, CourseAssignment } from "../../../types";

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

  // Determine Ciclo I courses
  const ciclo1Courses = [
    { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, simulatedGrade: 15.5, isManual: true },
    { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, simulatedGrade: 16.5, isManual: false },
    { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, simulatedGrade: 17.0, isManual: false },
    { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, simulatedGrade: 15.0, isManual: false },
    { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, simulatedGrade: 16.0, isManual: false },
  ];

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
      localStorage.setItem("sfa_simulated_cycle1_74859612", JSON.stringify(simulationData));
      localStorage.setItem("sfa_simulated_cycle1", JSON.stringify(simulationData));
      localStorage.setItem(`sfa_student_promoted_cycle2_${student.dni}`, "true");
      localStorage.setItem("sfa_student_promoted_cycle2_74859612", "true");
      localStorage.setItem(`sfa_student_cycle_${student.dni}`, "2");
      localStorage.setItem("sfa_student_cycle_74859612", "2");
      localStorage.setItem("sfa_student_cycle", "2");

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
              <span>Carrera: <b className="text-slate-800">{student.programId.toUpperCase()}</b></span>
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
                La asignatura evaluada manualmente en el portal docente mantendrá su calificación real intacta. Las 4 asignaturas restantes se completarán con actas oficiales y notas aprobatorias realistas. Al confirmar, el estudiante quedará formalmente promovido y con la <b>Matrícula del Ciclo II habilitada</b>.
              </p>
            </div>
          </div>

          {/* Preview Table of Ciclo I courses */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                Asignaturas del Ciclo I a Consolidar
              </span>
              <span className="text-[9.5px] font-mono font-bold text-slate-500">
                5 Cursos • 16 Créditos
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
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
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        {c.isManual ? "Manual Docente" : "Oficial MGE"}
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
