import React from "react";
import { Printer } from "lucide-react";
import { Enrollment, Applicant, AdmissionPeriod } from "../../../types";
import Button from "../../ui/Button";

interface FichaEstudianteModalProps {
  selectedFichaDni: string | null;
  enrollments: Enrollment[];
  applicants: Applicant[];
  admissionPeriods: AdmissionPeriod[];
  onClose: () => void;
}

export const FichaEstudianteModal: React.FC<FichaEstudianteModalProps> = ({
  selectedFichaDni,
  enrollments,
  applicants,
  admissionPeriods,
  onClose,
}) => {
  if (!selectedFichaDni) return null;

  const enr = enrollments.find((e) => e.studentDni === selectedFichaDni);
  const app = applicants.find((a) => a.dni === selectedFichaDni);
  if (!enr) return null;

  const pId = enr.programId || "electronica";

  const getFichaCourses = (programId: string) => {
    if (programId === "electronica") {
      return [
        { code: "EE-101", name: "Introducción a la Automatización", credits: 4, type: "Específico" },
        { code: "EE-102", name: "Dibujo e Instalaciones Eléctricas", credits: 4, type: "Específico" },
        { code: "EE-103", name: "Seguridad e Higiene Industrial", credits: 3, type: "Específico" },
        { code: "EE-104", name: "Matemática Aplicada a la Electricidad", credits: 4, type: "General" },
        { code: "EE-105", name: "Circuitos Técnicos y Mediciones", credits: 4, type: "Específico" },
        { code: "EE-106", name: "Ofimática e Investigación", credits: 3, type: "General" },
      ];
    } else {
      return [
        { code: "CO-101", name: "Fundamentos de Contabilidad", credits: 4, type: "Específico" },
        { code: "CO-102", name: "Técnicas de Documentación y Archivo", credits: 3, type: "Específico" },
        { code: "CO-103", name: "Matemática para Negocios", credits: 4, type: "General" },
        { code: "CO-104", name: "Informática Contable Básica", credits: 4, type: "Específico" },
        { code: "CO-105", name: "Legislación Tributaria General", credits: 4, type: "Específico" },
        { code: "CO-106", name: "Ofimática para la Gestión", credits: 3, type: "General" },
      ];
    }
  };

  const selectedCourses = getFichaCourses(pId);
  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  const periodName = admissionPeriods.find((p) => p.id === (app?.periodId || "1"))?.name || "Periodo Regular 2026-I";
  const code = app?.applicantCode || `REG-${enr.studentDni.slice(0, 4)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full text-slate-800 relative flex flex-col max-h-[90vh]">
        {/* Modal Header Actions */}
        <div className="bg-slate-50 border-b border-slate-150 px-5 py-3 flex justify-between items-center shrink-0">
          <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Matrícula Confirmada: Visor de Constancia
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wide"
          >
            Cerrar
          </button>
        </div>

        {/* Printable Body Sheet */}
        <div className="p-8 overflow-y-auto flex-1 text-left space-y-6" id="ficha-print-sheet">
          {/* Sheet Title Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1.5">
            <h1 className="text-[11px] font-black tracking-widest text-[#9F062A] uppercase">
              Instituto de Educación Superior Tecnológico Público "San Francisco de Asís"
            </h1>
            <h2 className="text-[14px] font-extrabold tracking-normal text-slate-900 uppercase">
              Constancia Oficial de Matrícula Regular
            </h2>
            <p className="text-[9.5px] font-bold text-slate-500 font-mono">
              PERIODO ACADÉMICO / ADMISIÓN: {periodName.toUpperCase()}
            </p>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-[11px] font-semibold border-b border-dashed border-slate-200 pb-5">
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Estudiante</span>
              <span className="text-slate-900 font-black text-xs uppercase">
                {app ? `${app.lastName}, ${app.name}` : "Estudiante Regular"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Código Único</span>
              <span className="text-[#9F062A] font-black text-xs uppercase font-mono">{code}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                Documento de Identidad
              </span>
              <span className="text-slate-800 font-black font-mono">{enr.studentDni}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">
                Especialidad Académica
              </span>
              <span className="text-slate-900 font-bold uppercase">
                {pId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Estudios Turno</span>
              <span className="text-slate-800 font-bold uppercase">{enr.shift || "Mañana"}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Periodo de Ingreso</span>
              <span className="text-slate-800 font-mono font-bold">CICLO I</span>
            </div>
          </div>

          {/* Enrolled Courses Container */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Asignaturas Curriculares Registradas:
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-150">
              {selectedCourses.map((course, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center text-[10.5px]">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block text-[11.5px]">{course.name}</span>
                    <span className="font-mono text-[9px] text-slate-400 uppercase font-semibold">
                      Código: {course.code} | {course.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded text-[10px] font-mono select-none">
                    {course.credits} Créditos
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-slate-50 border p-3.5 rounded-lg text-xs font-bold text-slate-700 font-mono mt-3">
              <span>MÁXIMO PERMITIDO (CICLO I): 22 CRÉDITOS</span>
              <span>
                INSCRITOS: <span className="font-black text-emerald-700">{totalCredits} CRÉDITOS</span>
              </span>
            </div>
          </div>

          {/* Approvals Stamp Footnote */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[9px] text-slate-450 space-y-0.5 max-w-sm text-left font-semibold italic">
              <p>* Esta constancia acredita la inscripción formal del estudiante ingresante en los registros del IESTP San Francisco de Asís.</p>
              <p>* Toda enmendadura o alteración invalida este documento.</p>
            </div>

            {/* Seal Stamp */}
            <div className="border-2 border-emerald-600 text-emerald-700/80 rounded-lg px-4 py-2.5 text-center font-mono uppercase bg-emerald-50/50 select-none scale-95 origin-right tracking-tight">
              <span className="text-[9px] block font-black leading-tight">IESTP SAN FRANCISCO DE ASÍS</span>
              <span className="text-[10px] block font-black leading-tight border-b border-emerald-300 py-0.5 my-0.5">
                VALOR ACADÉMICO
              </span>
              <span className="text-[8px] block font-extrabold leading-tight">OFICINA ADMISIÓN Y MATRÍCULA</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-slate-50 border-t border-slate-150 p-4 flex justify-end gap-3 shrink-0 rounded-b-xl">
          <Button onClick={onClose} variant="outline" size="sm" className="font-bold cursor-pointer">
            Regresar al Padrón
          </Button>
          <Button
            onClick={() => {
              window.print();
            }}
            variant="primary"
            size="sm"
            className="font-black uppercase tracking-wider text-[10.5px] bg-[#9F062A] hover:bg-black inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
