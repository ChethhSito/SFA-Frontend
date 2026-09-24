import React from "react";
import { Award, XCircle, Printer, Download, GraduationCap, ShieldCheck } from "lucide-react";

interface CertificadoEstudiosModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentDni: string;
  studentName: string;
  careerName: string;
  modulesCompleted: number;
  totalCredits: number;
  issueDate?: string;
}

export const CertificadoEstudiosModal: React.FC<CertificadoEstudiosModalProps> = ({
  isOpen,
  onClose,
  studentDni,
  studentName,
  careerName,
  modulesCompleted,
  totalCredits,
  issueDate = "24 de Septiembre de 2026"
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContents = document.getElementById("certificado-estudios-card")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificado Oficial de Estudios - ${studentName}</title>
            <style>
              body { font-family: 'Times New Roman', serif; background: white; padding: 40px; display: flex; justify-content: center; }
              #cert { border: 6px double #800521; padding: 40px; max-width: 700px; background: #fffdfa; text-align: center; }
              h1 { font-size: 18px; color: #800521; font-weight: bold; margin-bottom: 5px; }
              h2 { font-size: 14px; color: #333; margin-top: 0; text-transform: uppercase; }
              p { font-size: 12px; line-height: 1.6; text-align: justify; margin: 15px 0; }
              .stamp { margin-top: 50px; display: flex; justify-content: space-around; }
              .sign-line { border-top: 1px solid #333; width: 180px; font-size: 10px; font-weight: bold; padding-top: 5px; }
            </style>
          </head>
          <body>
            <div id="cert">${printContents}</div>
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
INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO "SAN FRANCISCO DE ASÍS"
================================================================================

CERTIFICADO DE ESTUDIOS SUPERIORES TÉCNICOS SGE / MINEDU

EL DIRECTOR GENERAL DEL IESTP "SAN FRANCISCO DE ASÍS"

CERTIFICA QUE:
Don(ña): ${studentName}
Con DNI N°: ${studentDni}

Ha cursado y aprobado satisfactoriamente los módulos profesionales de la carrera
técnica de: ${careerName}

MÓDULOS TECNOLÓGICOS COMPLETADOS: ${modulesCompleted} / 3 MÓDULOS
TOTAL CRÉDITOS ACADÉMICOS ACUMULADOS: ${totalCredits} CRÉDITOS
CONDICIÓN DE EGRESADO: APTO PARA TITULACIÓN PROFESIONAL

Se expide el presente Certificado de Estudios a solicitud del interesado para los fines
legales y administrativos que estime conveniente.

Dado en Lima, Perú a los ${issueDate}.

================================================================================
SECRETARÍA ACADÉMICA • DIRECCIÓN GENERAL SFA
Firma Digital de Verificación QR MINEDU: SFA-CERT-2026-${studentDni}
================================================================================
    `;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Certificado_Estudios_SGE_${studentDni}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-[#800521] to-[#9F062A] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs uppercase tracking-wide">
              Certificado Oficial de Estudios SGE / MINEDU
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
            id="certificado-estudios-card"
            className="bg-amber-50/30 border-8 border-double border-[#800521] p-8 max-w-xl mx-auto shadow-sm rounded-xl text-slate-900 font-serif"
          >
            <div className="text-center border-b-2 border-amber-600 pb-4 mb-6">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block font-sans">
                MINISTERIO DE EDUCACIÓN DEL PERÚ • GRELL / DRELM
              </span>
              <h1 className="text-base font-black text-[#800521] uppercase tracking-wider mt-1">
                IESTP "SAN FRANCISCO DE ASÍS"
              </h1>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest mt-0.5 font-sans">
                CERTIFICADO OFICIAL DE ESTUDIOS SUPERIORES
              </h2>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-800 text-justify">
              <p>
                El suscrito Director General del <strong>IESTP "SAN FRANCISCO DE ASÍS"</strong>, hace constar que en los archivos de la Secretaría Académica de esta institución educativa, constan los registros evaluativos de:
              </p>

              <div className="bg-white p-4 rounded-xl border border-amber-200/80 font-sans space-y-1.5 shadow-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Estudiante Egresado:</span>
                  <span className="font-extrabold text-slate-900 uppercase">{studentName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">N° Documento DNI:</span>
                  <span className="font-mono font-bold text-[#800521]">{studentDni}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Carrera Profesional:</span>
                  <span className="font-extrabold text-slate-800">{careerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Módulos / Créditos:</span>
                  <span className="font-bold text-emerald-700">{modulesCompleted} Módulos ({totalCredits} Créditos)</span>
                </div>
              </div>

              <p>
                Quien ha cursado y culminado en forma satisfactoria la totalidad de los módulos modulares y de práctica preprofesional reglamentarios, estando habilitado(a) para la expedición de su Título Profesional Técnico a Nombre de la Nación.
              </p>

              <p className="text-right text-[11px] font-semibold text-slate-600 font-sans pt-2">
                Lima, {issueDate}
              </p>
            </div>

            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-[9px] font-sans font-extrabold text-slate-600 uppercase">
              <div className="border-t border-slate-400 pt-2">
                <span>Secretario Académico</span>
                <span className="block text-[8px] text-slate-400 font-normal">IESTP San Francisco de Asís</span>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <span>Director General</span>
                <span className="block text-[8px] text-slate-400 font-normal">Sello Institucional MINEDU</span>
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
            <span>Imprimir Certificado</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-[#800521] hover:bg-[#9F062A] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Documento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
