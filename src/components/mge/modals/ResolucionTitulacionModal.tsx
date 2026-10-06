import React from "react";
import { Award, XCircle, Printer, Download, ShieldCheck, FileCheck } from "lucide-react";

interface ResolucionTitulacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolutionNumber: string;
  studentDni: string;
  studentName: string;
  careerName: string;
  issueDate?: string;
}

export const ResolucionTitulacionModal: React.FC<ResolucionTitulacionModalProps> = ({
  isOpen,
  onClose,
  resolutionNumber = "RD-2026-048-IESTP-SFA",
  studentDni,
  studentName,
  careerName,
  issueDate = "24 de Septiembre de 2026"
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContents = document.getElementById("resolucion-titulacion-card")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Resolución Directoral de Titulación - ${resolutionNumber}</title>
            <style>
              body { font-family: 'Times New Roman', serif; background: white; padding: 40px; display: flex; justify-content: center; }
              #res { border: 2px solid #1e293b; padding: 40px; max-width: 700px; background: white; text-align: justify; }
              h1 { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 2px; }
              h2 { font-size: 13px; font-weight: bold; text-align: center; margin-top: 0; color: #800521; }
              p { font-size: 12px; line-height: 1.6; margin: 12px 0; }
              .section-title { font-weight: bold; text-decoration: underline; margin-top: 15px; display: block; }
              .sign-grid { margin-top: 60px; display: flex; justify-[#space-around]; text-align: center; font-size: 11px; }
            </style>
          </head>
          <body>
            <div id="res">${printContents}</div>
            <script>
              window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    const textContent = `
================================================================================
RESOLUCIÓN DIRECTORAL INSTITUCIONAL N° ${resolutionNumber}
IESTP "SAN FRANCISCO DE ASÍS" • LIMA, PERÚ
================================================================================

VISTO: El expediente de Titulación Profesional presentado por el(la) egresado(a)
${studentName}, identificado(a) con DNI N° ${studentDni}, de la Carrera Profesional de
${careerName}.

CONSIDERANDO:
Que, habiendo cumplido con la totalidad del Plan de Estudios, Prácticas Preprofesionales
y Examen Institucional de Suficiencia Profesional conforme a la Ley de Educación Superior Tecnológica N° 30512.

SE RESUELVE:
ARTÍCULO PRIMERO.- CONFERIR el TÍTULO PROFESIONAL TÉCNICO en ${careerName.toUpperCase()} a don(ña) ${studentName}.
ARTÍCULO SEGUNDO.- INSCRÍBASE el presente título en el Registro Institucional y ante la Dirección Regional de Educación de Lima Metropolitana (DRELM / MINEDU).

Regístrese, comuníquese y archívese.

Dado en la Sede Rectoral del IESTP San Francisco de Asís, a los ${issueDate}.

================================================================================
DIRECCIÓN GENERAL • SECRETARÍA ACADÉMICA
Firma Digital Firmado Digitalmente MINEDU: RD-TIT-2026-${studentDni}
================================================================================
    `;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Resolucion_Titulacion_${resolutionNumber}_${studentDni}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-[#800521] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs uppercase tracking-wide">
              Resolución Directoral de Titulación N° {resolutionNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto bg-slate-100/50 custom-scrollbar">
          <div
            id="resolucion-titulacion-card"
            className="bg-white border-2 border-slate-800 p-8 max-w-xl mx-auto shadow-sm rounded-xl text-slate-900 font-serif"
          >
            <div className="text-center border-b pb-4 mb-4">
              <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO
              </h1>
              <h2 className="text-base font-black text-[#800521] uppercase tracking-widest mt-0.5">
                "SAN FRANCISCO DE ASÍS"
              </h2>
              <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest block mt-1">
                RESOLUCIÓN DIRECTORAL N° {resolutionNumber}
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-justify font-sans">
              <p>
                <strong>VISTO:</strong> El expediente de Titulación Profesional con dictamen favorable expedido por la Comisión Institucional de Grados y Títulos del IESTP San Francisco de Asís.
              </p>

              <p>
                <strong>CONSIDERANDO:</strong> Que el(la) egresado(a) <strong>{studentName}</strong>, con DNI N° <strong>{studentDni}</strong>, ha culminado satisfactoriamente los 6 semestres académicos de la carrera profesional de <strong>{careerName}</strong> y aprobado la Sustentación del Proyecto de Innovación Tecnológica.
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-semibold space-y-1">
                <span className="text-[#800521] font-black uppercase text-[10px] block">SE RESUELVE:</span>
                <p className="text-slate-800">
                  <strong>ARTÍCULO PRIMERO.-</strong> Otorgar el <strong>TÍTULO PROFESIONAL TÉCNICO EN {careerName.toUpperCase()}</strong> a don(ña) <strong>{studentName}</strong>.
                </p>
                <p className="text-slate-700">
                  <strong>ARTÍCULO SEGUNDO.-</strong> Disponer la inscripción del título en el Libro de Actas de Grados y Títulos del MINEDU.
                </p>
              </div>

              <p className="text-right text-[10px] font-bold text-slate-600 pt-2">
                Dado en la Sede Principal, Lima, {issueDate}.
              </p>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-6 text-center text-[9px] font-sans font-bold text-slate-700 uppercase">
              <div className="border-t border-slate-400 pt-2">
                <span>Presidente Comisión Titulación</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span>Director General IESTP SFA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir R.D.</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar R.D.</span>
          </button>
        </div>
      </div>
    </div>
  );
};
