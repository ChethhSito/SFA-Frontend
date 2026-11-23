import React, { useState } from "react";
import { GraduationCap, XCircle, CheckCircle2, ShieldCheck, AlertCircle, Award } from "lucide-react";
import { ProcessedStudent } from "../mgeTypes";
import { Course, CourseAssignment } from "../../../types";

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
  onSimulated,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !student) return null;

  // The 5 official courses for Ciclo II - Electricidad Industrial
  const ciclo2Courses = [
    { code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", credits: 4, simulatedGrade: 16.5, doc: "Ing. Manuel Ramos Salazar" },
    { code: "EIND-202", name: "Electrónica Analógica y de Potencia Básica", credits: 4, simulatedGrade: 17.0, doc: "Ing. Roberto Chávez Peña" },
    { code: "EIND-203", name: "Mediciones Eléctricas e Instrumentación", credits: 3, simulatedGrade: 16.0, doc: "Ing. Walter Fernández" },
    { code: "EIND-204", name: "Máquinas Eléctricas Estáticas (Transformadores)", credits: 4, simulatedGrade: 16.5, doc: "Ing. Manuel Ramos Salazar" },
    { code: "EIND-205", name: "Inglés Técnico Aplicado a la Electricidad", credits: 2, simulatedGrade: 15.5, doc: "Lic. Carmen Luzardo" },
  ];

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
      localStorage.setItem("sfa_simulated_cycle2_74859612", JSON.stringify(simulationData));
      localStorage.setItem("sfa_simulated_cycle2", JSON.stringify(simulationData));

      // Individual grades for courses including EIND-201
      localStorage.setItem(`sfa_grades_EIND-201_${studentDni}`, "16.5");
      localStorage.setItem("sfa_grades_EIND-201_74859612", "16.5");
      localStorage.setItem(`sfa_grades_EIND-202_${studentDni}`, "17.0");
      localStorage.setItem("sfa_grades_EIND-202_74859612", "17.0");
      localStorage.setItem(`sfa_grades_EIND-203_${studentDni}`, "16.0");
      localStorage.setItem("sfa_grades_EIND-203_74859612", "16.0");
      localStorage.setItem(`sfa_grades_EIND-204_${studentDni}`, "16.5");
      localStorage.setItem("sfa_grades_EIND-204_74859612", "16.5");
      localStorage.setItem(`sfa_grades_EIND-205_${studentDni}`, "15.5");
      localStorage.setItem("sfa_grades_EIND-205_74859612", "15.5");

      // Mark cycle 2 closed and promote student to Ciclo III
      localStorage.setItem(`sfa_student_promoted_cycle3_${studentDni}`, "true");
      localStorage.setItem("sfa_student_promoted_cycle3_74859612", "true");
      localStorage.setItem("sfa_student_promoted_cycle3", "true");

      // Unlock EFSRT Módulo I (Ciclo I + II completed)
      localStorage.setItem(`sfa_efsrt_modulo1_approved_${studentDni}`, "true");
      localStorage.setItem("sfa_efsrt_modulo1_approved_74859612", "true");
      localStorage.setItem("sfa_efsrt_modulo1_approved", "true");

      // Set current active cycle
      localStorage.setItem(`sfa_student_cycle_${studentDni}`, "2");
      localStorage.setItem("sfa_student_cycle_74859612", "2");
      localStorage.setItem("sfa_student_cycle", "2");

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
                DNI: {student.dni} • Programa: Electricidad Industrial • Período 2027-II
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Promedio Ponderado Proyectado
              </span>
              <span className="text-xl font-black text-emerald-700">{weightedAverage}</span>
              <span className="text-[10px] text-emerald-700 font-bold block uppercase">Aprobado</span>
            </div>
          </div>

          {/* Institutional note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <p className="font-bold text-[11px]">Consolidación Automática para Demostración</p>
              <p className="text-[10px] text-amber-800 mt-0.5">
                Al confirmar, se registrarán las calificaciones formativas y finales de las 5 asignaturas de Segundo Ciclo, se cerrarán las actas y se habilitará la certificación del <strong>Módulo Técnico I (EFSRT)</strong> para su visualización en el portal del estudiante y secretaría.
              </p>
            </div>
          </div>

          {/* Courses Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-3xs">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Asignatura</th>
                  <th className="py-2 px-3">Docente</th>
                  <th className="py-2 px-3 text-center">Créd.</th>
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
                    <td className="py-2 px-3 text-center font-black text-emerald-700">{c.simulatedGrade.toFixed(1)}</td>
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
              Esta acción genera el acta con validez institucional, permitiendo al jurado comprobar de inmediato el ciclo de vida académico continuo, la transición al Módulo EFSRT y la emisión de constancias sin demoras.
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
