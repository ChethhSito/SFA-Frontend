import React from "react";
import { createPortal } from "react-dom";
import { XCircle, Printer, Download, GraduationCap } from "lucide-react";
import { generateBoletaNotasPdf } from "../../../utils/matriculaPdf";
import { SFA_LOGO_BASE64 } from "../../../utils/sfaLogo";

export interface BoletaCourseItem {
  code?: string;
  name: string;
  credits?: number;
  grade: number | string;
  approved?: boolean | null;
  status?: string;
}

interface BoletaNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentDni: string;
  studentName: string;
  careerName: string;
  cycleNumber: number;
  courses: BoletaCourseItem[];
  average?: number | string;
}

export const BoletaNotasModal: React.FC<BoletaNotasModalProps> = ({
  isOpen,
  onClose,
  studentDni,
  studentName,
  careerName,
  cycleNumber,
  courses
}) => {
  if (!isOpen) return null;

  const filteredCourses = courses.filter((c) => {
    if (cycleNumber === 1) {
      return !c.code?.includes("-20");
    } else {
      return c.code?.includes("-20");
    }
  });

  const isContabilidad = careerName?.toLowerCase().includes("contab") || studentDni === "71248596";
  const pfx = isContabilidad ? "CONT" : "EIND";

  const formattedCourses = filteredCourses.map((c, i) => {
    const rawGrade = typeof c.grade === "number" ? c.grade : (Number(c.grade) > 0 ? Number(c.grade) : undefined);
    return {
      code: c.code || (cycleNumber === 1 ? `${pfx}-10${i + 1}` : `${pfx}-20${i + 1}`),
      name: c.name,
      credits: typeof c.credits === "number" ? c.credits : 4,
      grade: rawGrade
    };
  });

  const handleDownload = async () => {
    try {
      await generateBoletaNotasPdf(
        cycleNumber.toString(),
        studentName,
        studentDni,
        careerName,
        formattedCourses,
        true
      );
    } catch (err) {
      console.error("Error al descargar PDF de la boleta de notas:", err);
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById("boleta-oficial-print-card");
    if (!printArea) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Boleta_Notas_SFA_Ciclo_${cycleNumber}_${studentDni}</title>
            <meta charset="utf-8" />
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print-container { width: 100%; max-width: 190mm; margin: 0 auto; border: 1px solid #cbd5e1; box-sizing: border-box; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11px; }
              th { background-color: #0f172a !important; color: white !important; font-weight: 700; text-align: left; }
              .text-center { text-align: center; }
              .text-emerald { color: #047857; font-weight: 700; }
              .text-burgundy { color: #800521; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printArea.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(() => window.close(), 600);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const content = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#9F062A] to-[#800521] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs md:text-sm uppercase tracking-wide">
              Boleta Informativa Oficial de Calificaciones • Ciclo {cycleNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: High-Fidelity Vector-Crisp A4 Official Document */}
        <div className="flex-1 p-3 sm:p-6 bg-slate-200/60 overflow-y-auto custom-scrollbar">
          <div 
            id="boleta-oficial-print-card"
            className="w-full max-w-[660px] mx-auto my-1 bg-white shadow-xl rounded-sm border border-slate-300 overflow-hidden flex flex-col text-slate-800 font-sans"
          >
            {/* 1. Institutional Banner */}
            <div className="bg-[#800521] px-4 py-2.5 flex items-center justify-between gap-3 relative select-none">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-sm shrink-0 flex items-center justify-center">
                  <img 
                    src={SFA_LOGO_BASE64} 
                    alt="Escudo Oficial IESTP San Francisco de Asís" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="text-[7.5px] font-bold text-amber-300 uppercase tracking-widest block leading-tight">
                    República del Perú • Ministerio de Educación
                  </span>
                  <span className="text-[8.5px] font-bold text-white uppercase tracking-wider block leading-tight">
                    Instituto de Educación Superior Tecnológico Público
                  </span>
                  <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider leading-snug">
                    "SAN FRANCISCO DE ASÍS"
                  </h1>
                  <span className="text-[7px] text-white/80 block leading-tight">
                    R.M. N° 0233-80-ED • R.D. N° 0458-2005-ED • Lima - Perú
                  </span>
                </div>
              </div>

              <div className="hidden sm:block border border-amber-400/60 rounded-md px-3 py-1.5 text-center bg-black/15 shrink-0">
                <span className="text-[8px] font-extrabold text-amber-300 uppercase tracking-wider block">
                  Secretaría Académica
                </span>
                <span className="text-[7.5px] font-semibold text-white uppercase tracking-wide block">
                  Boleta de Calificaciones
                </span>
                <span className="text-[6.5px] text-slate-300 block font-mono">
                  Plataforma SFA Cloud
                </span>
              </div>
            </div>

            {/* Gold Accent Bar */}
            <div className="h-1 bg-[#D97706] w-full" />

            {/* 2. Student Info Header */}
            <div className="p-4 sm:p-5 pb-10 bg-white space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left space-y-1">
                <div className="text-xs font-black text-slate-900 uppercase">
                  Estudiante: <span className="text-slate-800">{studentName.toUpperCase()}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  DNI: <span className="font-mono font-bold text-slate-900">{studentDni}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  Programa: <span className="font-bold text-slate-900">{careerName.toUpperCase()}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  Semestre: <span className="font-mono font-bold text-slate-900">2027-I</span>
                </div>
                <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                  Condición: Alumno Regular
                </div>
              </div>

              {/* 3. Official Grades Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0F172A] text-white text-[9px] uppercase font-bold tracking-wider">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Asignatura / Unidad Didáctica</th>
                      <th className="py-2 px-2 text-center">Créd.</th>
                      <th className="py-2 px-2 text-center">Calificación</th>
                      <th className="py-2 px-3 text-center">Condición Académica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px] sm:text-[10.5px]">
                    {formattedCourses.map((c, idx) => {
                      const isGraded = c.grade !== undefined && c.grade > 0;
                      const isApproved = isGraded && c.grade! >= 12.5;
                      const gradeDisplay = isGraded 
                        ? (Number.isInteger(c.grade!) ? c.grade!.toString().padStart(2, "0") : c.grade!.toFixed(1))
                        : "--";
                      const conditionDisplay = isGraded ? (isApproved ? "APROBADO" : "DESAPROBADO") : "MATRICULADO";

                      return (
                        <tr key={c.code} className={idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}>
                          <td className="py-1.5 px-3 font-mono font-bold text-[#800521] text-[10px]">
                            {c.code}
                          </td>
                          <td className="py-1.5 px-3 font-medium text-slate-800">
                            {c.name}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-600 text-[10px]">
                            {c.credits.toFixed(1)}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono font-black text-slate-900">
                            {gradeDisplay}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            <span className={`text-[9.5px] font-black uppercase font-mono ${
                              conditionDisplay === "APROBADO"
                                ? "text-emerald-700"
                                : conditionDisplay === "DESAPROBADO"
                                ? "text-rose-700"
                                : "text-slate-500"
                            }`}>
                              {conditionDisplay}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. Signatures and Official Stamp Section with generous breathing room */}
              <div className="pt-4 pb-6 px-2 grid grid-cols-3 items-center gap-2 text-center select-none">
                {/* Left Signature: Secretaria General */}
                <div className="flex flex-col items-center">
                  <div className="h-9 flex items-end justify-center w-full">
                    <div className="font-serif italic text-blue-900 text-sm font-semibold select-none flex items-center justify-center">
                      <span style={{ fontFamily: "Georgia, serif", letterSpacing: "1px" }}>Carmen Valdivia M.</span>
                    </div>
                  </div>
                  <div className="w-32 border-t border-slate-400 mt-1 mb-1" />
                  <span className="text-[8px] font-bold text-slate-900 uppercase block leading-tight">
                    Mg. Carmen R. Valdivia Morán
                  </span>
                  <span className="text-[7px] text-slate-500 block leading-tight">
                    Secretaria General Académica
                  </span>
                  <span className="text-[6.5px] text-slate-400 block leading-tight">
                    Reg. Col. N° 0948 • IESTP SFA
                  </span>
                </div>

                {/* Center: Official Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-18 h-18 rounded-full border-2 border-[#800521] p-0.5 flex items-center justify-center relative shadow-2xs">
                    <div className="w-full h-full rounded-full border border-dashed border-[#800521]/70 flex flex-col items-center justify-center text-center p-0.5 bg-rose-50/20">
                      <span className="text-[5px] font-extrabold text-[#800521] uppercase leading-tight">
                        IESTP San Francisco de Asís
                      </span>
                      <span className="text-[4.5px] font-bold text-amber-700 tracking-wider my-0.5">
                        SELLO INSTITUCIONAL
                      </span>
                      <span className="text-[6px] font-black text-slate-900 uppercase leading-none">
                        Dirección General
                      </span>
                      <span className="text-[5.5px] font-bold text-[#800521] uppercase leading-tight">
                        Registro de Notas
                      </span>
                      <span className="text-[4.5px] text-slate-400 leading-tight">
                        Lima - Perú
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Signature: Director General */}
                <div className="flex flex-col items-center">
                  <div className="h-9 flex items-end justify-center w-full">
                    <div className="font-serif italic text-blue-900 text-sm font-semibold select-none flex items-center justify-center">
                      <span style={{ fontFamily: "Georgia, serif", letterSpacing: "1px" }}>J. Morales Rojas</span>
                    </div>
                  </div>
                  <div className="w-32 border-t border-slate-400 mt-1 mb-1" />
                  <span className="text-[8px] font-bold text-slate-900 uppercase block leading-tight">
                    Dr. Juan Alberto Morales Rojas
                  </span>
                  <span className="text-[7px] text-slate-500 block leading-tight">
                    Director General - IESTP SFA
                  </span>
                  <span className="text-[6.5px] text-slate-400 block leading-tight">
                    R.D. N° 0458-2005-ED • MINEDU
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-4 w-full shrink-0" />
        </div>

        {/* Modal Toolbar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-[#9F062A] hover:bg-[#800521] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Boleta (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
