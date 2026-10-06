import React from "react";
import { Award, XCircle, Printer, Download, FileText, CheckCircle2 } from "lucide-react";

interface ConstanciaMatriculaModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentDni: string;
  studentName: string;
  careerName: string;
  cycleNumber: number;
  period: string;
  issueDate?: string;
}

export const ConstanciaMatriculaModal: React.FC<ConstanciaMatriculaModalProps> = ({
  isOpen,
  onClose,
  studentDni,
  studentName,
  careerName,
  cycleNumber,
  period = "2026-I",
  issueDate = "24 de Septiembre de 2026"
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContents = document.getElementById("constancia-matricula-card")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Constancia de Matrícula Digital - ${studentName}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: white; padding: 40px; display: flex; justify-content: center; }
              #mat { border: 4px double #800521; padding: 35px; max-width: 650px; background: #fafaf9; }
              h1 { font-size: 16px; color: #800521; font-weight: bold; text-align: center; }
              p { font-size: 12px; line-height: 1.6; text-align: justify; margin: 15px 0; }
              .info-box { background: white; border: 1px solid #cbd5e1; padding: 15px; margin: 15px 0; font-size: 11px; }
            </style>
          </head>
          <body>
            <div id="mat">${printContents}</div>
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
MINISTERIO DE EDUCACIÓN DEL PERÚ
IESTP "SAN FRANCISCO DE ASÍS"
================================================================================

CONSTANCIA DE MATRÍCULA DIGITAL - PERÍODO ${period}

LA SECRETARÍA ACADÉMICA DEL IESTP "SAN FRANCISCO DE ASÍS"

HACE CONSTAR QUE:
El(La) estudiante: ${studentName}
Identificado(a) con DNI N°: ${studentDni}

Se encuentra oficialmente MATRICULADO(A) en la Carrera Profesional Técnica de:
${careerName}

CICLO ACADÉMICO: Ciclo ${cycleNumber}
PERÍODO LECTIVO: ${period}
TURNO / MODALIDAD: Presencial Sede Rectoral

Documento emitido con Firma Digital Institucional de la Secretaría Académica.

Dado en Lima, Perú a los ${issueDate}.

================================================================================
CÓDIGO DE VERIFICACIÓN DIGITAL MINEDU: CONST-MAT-${period}-${studentDni}
================================================================================
    `;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Constancia_Matricula_${period}_${studentDni}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-[#800521] to-[#9F062A] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs uppercase tracking-wide">
              Constancia de Matrícula Digital • Período {period}
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
            id="constancia-matricula-card"
            className="bg-white border-4 border-double border-[#800521] p-6 max-w-xl mx-auto shadow-sm rounded-xl text-slate-900 font-sans"
          >
            <div className="border-b-2 border-amber-500 pb-3 mb-4 text-center">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block">
                MINISTERIO DE EDUCACIÓN DEL PERÚ
              </span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO
              </h2>
              <h1 className="text-sm font-black text-[#800521] uppercase tracking-widest">
                "SAN FRANCISCO DE ASÍS"
              </h1>
              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block mt-1">
                CONSTANCIA DE MATRÍCULA DIGITAL PERÍODO {period}
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 text-justify">
              <p>
                La Secretaría Académica del <strong>IESTP "SAN FRANCISCO DE ASÍS"</strong> certifica que el estudiante detallado a continuación registra matrícula conforme para el presente periodo lectivo:
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Estudiante:</span>
                  <span className="font-extrabold text-slate-900 uppercase">{studentName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">DNI:</span>
                  <span className="font-mono font-bold text-[#800521]">{studentDni}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Carrera Profesional:</span>
                  <span className="font-extrabold text-slate-800">{careerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Ciclo Académico / Periodo:</span>
                  <span className="font-bold text-amber-600">Ciclo {cycleNumber} ({period})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Estado de Matrícula: VIGENTE Y REGISTRADA EN EL SISTEMA SGE</span>
              </div>

              <p className="text-right text-[10px] font-semibold text-slate-500 pt-1">
                Lima, {issueDate}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-[8px] font-mono text-slate-400">
              <span>FIRMA DIGITAL SECRETARÍA ACADÉMICA</span>
              <span>CÓDIGO QR SFA-MAT-{period}</span>
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
            <span>Imprimir Constancia</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-[#800521] hover:bg-[#9F062A] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF/TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
