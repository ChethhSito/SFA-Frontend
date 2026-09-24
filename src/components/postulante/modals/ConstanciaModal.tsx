import React from "react";
import { Award, XCircle, Lightbulb, Printer, Download } from "lucide-react";
import { Applicant } from "../../../types";

interface ConstanciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant;
}

export const ConstanciaModal: React.FC<ConstanciaModalProps> = React.memo(({
  isOpen,
  onClose,
  applicant,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContents = document.getElementById("constancia-print-card")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Constancia Oficial de Admisión - SFA 2026</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background-color: white; padding: 40px; display: flex; justify-content: center; }
              #constancia { border: 6px double #9F062A; padding: 40px; max-width: 600px; background-color: #fafaf9; position: relative; }
              ul, li { list-style: none; }
              .grid { display: grid; }
              .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
              .col-span-4 { grid-column: span 4 / span 4; }
              .text-center { text-align: center; }
              .text-left { text-align: left; }
              .border-b { border-bottom: 2px solid #f59e0b; }
              .border-t { border-top: 1px solid #cbd5e1; }
              .bg-white { background-color: white; }
              .border { border: 1px solid #cbd5e1; }
              .rounded-lg { border-radius: 8px; }
              .p-4 { padding: 16px; }
              .font-black { font-weight: 900; }
              .font-bold { font-weight: 700; }
              .text-xs { font-size: 11px; }
              .uppercase { text-transform: uppercase; }
              .text-[13px] { font-size: 13px; }
              .text-[15px] { font-size: 15px; color: #9F062A; }
              .text-[#9F062A] { color: #9F062A; }
              .text-slate-900 { color: #0f172a; }
              .text-slate-400 { color: #94a3b8; }
              .text-slate-500 { color: #64748b; }
              .mt-1 { margin-top: 4px; }
              .mb-1 { margin-bottom: 4px; }
              .leading-none { line-height: 1; }
              .inline-block { display: inline-block; }
              .bg-\\[\\#9F062A\\]\\/5 { background-color: rgba(159, 6, 42, 0.05); }
              .font-mono { font-family: monospace; }
              .mt-3 { margin-top: 12px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .text-emerald-700 { color: #047857; }
              .flex { display: flex; }
              .justify-center { justify-content: center; }
              .items-end { align-items: flex-end; }
              .justify-between { justify-content: space-between; }
              .w-16 { width: 64px; }
              .h-16 { height: 64px; }
              .p-1 { padding: 4px; }
              .rounded-sm { border-radius: 2px; }
              .shadow-3xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
              .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
              .gap-\\[2px\\] { gap: 2px; }
              .bg-slate-100 { background-color: #f1f5f9; }
              .bg-slate-900 { background-color: #0f172a; }
              .w-full { width: 100%; }
              .h-full { height: 100%; }
              .relative { position: relative; }
              .italic { font-style: italic; }
              .text-blue-800 { color: #1e40af; }
              .text-\\[11\\.5px\\] { font-size: 11.5px; }
              .pt-1 { padding-top: 4px; }
              .tracking-wide { letter-spacing: 0.025em; }
              .absolute { position: absolute; }
              .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
              .opacity-\\[0\\.03\\] { opacity: 0.03; }
              .text-\\[130px\\] { font-size: 130px; }
              .border-8 { border-width: 8px; }
              .col-span-2 { grid-column: span 2 / span 2; }
              .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
              .gap-2 { gap: 8px; }
              .bg-stone-50 { background-color: #fafaf9; }
            </style>
          </head>
          <body>
            <div id="constancia">${printContents}</div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    const btn = document.getElementById("download-constancia-btn");
    if (btn) btn.innerText = "Firmando digitalmente...";

    setTimeout(() => {
      if (btn) btn.innerText = "Descargando...";

      setTimeout(() => {
        if (btn) btn.innerText = "¡Descargado con éxito!";

        const textContent = `
========================================
MINISTERIO DE EDUCACIÓN EN EL PERÚ
IESTP "SAN FRANCISCO DE ASÍS" - CHINCHA
R.M. N° 0233-80-ED • ICA - PERÚ
========================================

CONSTANCIA OFICIAL DE ADMISIÓN DIGITAL
N° C.O.A - 2026-${applicant.dni}

POSTULANTE: ${applicant.lastName}, ${applicant.name}
DOCUMENTO DNI: ${applicant.dni}
CARRERA PROFESIONAL: ${applicant.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
MODALIDAD DE INGRESO: Ingreso Ordinario por Examen de Admisión
ESTADO DE MATRÍCULA: APTO / ADMITIDO

--------------------------------------------------
Este documento acredita haber obtenido una vacante
de estudios en el IESTP "San Francisco de Asís"
por el canal de Admisión Ordinaria Directa.
Documento Oficial firmado digitalmente.
Proceso 2026-I • Chincha Alta, Perú.
========================================
        `;
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Constancia_Admision_SFA_${applicant.dni}.txt`;
        link.click();

        setTimeout(() => {
          if (btn) btn.innerText = "Descargar Constancia Oficial";
          onClose();
          alert(`¡Constancia de Admisión guardada como 'Constancia_Admision_SFA_${applicant.dni}.txt'!`);
        }, 1000);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-250 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Modal Header Bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#9F062A]">
            <Award className="w-5 h-5 shrink-0" />
            <span className="font-extrabold text-xs uppercase tracking-widest text-slate-800">
              Constancia Digital de Admisión - Código {applicant.dni}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Print Area Wrapper */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 custom-scrollbar id-print-container">
          <div 
            id="constancia-print-card" 
            className="bg-stone-50 border-[6px] border-double border-[#9F062A] p-8 max-w-xl mx-auto shadow-sm relative overflow-hidden rounded-md text-slate-900 font-sans print:m-0 print:border-0 print:bg-white print:p-0"
          >
            <div className="border-b-[3px] border-amber-500 pb-3 mb-6 text-center">
              <div className="text-amber-600 text-center flex justify-center gap-1.5 font-bold uppercase tracking-widest text-[9px] mb-1.5">
                <span>MINISTERIO DE EDUCACIÓN DEL PERÚ</span>
              </div>
              <h1 className="text-[13px] font-black text-slate-900 uppercase tracking-wider mb-0.5 leading-none">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO
              </h1>
              <h2 className="text-[15px] font-black text-[#9F062A] uppercase tracking-widest leading-normal">
                "SAN FRANCISCO DE ASÍS"
              </h2>
              <span className="text-[8px] font-bold text-slate-400 block tracking-wider uppercase mt-1">
                R.M. N° 0233-80-ED • CHINCHA • ICA - PERÚ
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-[130px] font-black text-[#9F062A] border-8 border-current rounded-full p-4 tracking-tighter leading-none select-none">
                SFA
              </span>
            </div>

            <div className="text-center my-6">
              <span className="inline-block bg-[#9F062A]/5 text-[#9F062A] border border-[#9F062A]/25 rounded-md px-4 py-1.5 font-black text-[13px] tracking-widest uppercase">
                CONSTANCIA OFICIAL DE ADMISIÓN
              </span>
              <span className="text-[10px] font-mono font-bold block mt-3 text-slate-500">
                REGISTRO N° C.O.A - 2026-{applicant.dni}
              </span>
            </div>

            <div className="space-y-4 text-[11px] leading-relaxed text-slate-800 text-left font-sans font-medium">
              <p>
                La Comisión de Admisión General de Directivos del Instituto de Educación Superior Tecnológico Público 
                <strong> "San Francisco de Asís" </strong>, mediante las facultades otorgadas por el Ministerio de Educación, hace constar oficialmente que:
              </p>

              <div className="bg-white border text-left border-dashed border-slate-350 rounded-lg p-4 my-2.5 space-y-1.5 shadow-3xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 uppercase font-bold text-[8.5px]">Postulante:</span>
                  <span className="col-span-2 text-slate-900 font-extrabold uppercase text-[11px]">
                    {applicant.lastName}, {applicant.name}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 uppercase font-bold text-[8.5px]">DOCUMENTO DNI:</span>
                  <span className="col-span-2 font-mono font-bold text-[#9F062A] text-[11px]">
                    {applicant.dni}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 uppercase font-bold text-[8.5px]">ESPECIALIDAD:</span>
                  <span className="col-span-2 text-slate-900 font-extrabold uppercase text-[11px]">
                    {applicant.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 uppercase font-bold text-[8.5px]">MODALIDAD:</span>
                  <span className="col-span-2 text-slate-900 font-black text-[10px] uppercase tracking-wide">
                    Ingreso Ordinario por Examen de Admisión
                  </span>
                </div>
              </div>

              <p>
                Ha alcanzado una vacante de estudios definitiva por cumplir con la entrega de todos sus requisitos indispensables y la tasa de postulación exonerada/validada. Encontrándose con la condición oficial de 
                <span className="text-emerald-700 font-black"> ADMITIDO(A) </span> e inscrito(a) en el período académico de ingreso general 2026-I.
              </p>

              <p>
                Se expide la presente constancia para los fines de trámite oficial e ingreso físico para la Matrícula Presencial de Ingresante.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-2 mt-8 pt-4 items-end justify-between border-t border-slate-200">
              <div className="col-span-4 text-left font-sans">
                <div className="w-16 h-16 bg-white border border-slate-200 p-1 rounded-sm shadow-3xs flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-[2px] w-full h-full bg-slate-100 p-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-full h-full rounded-[1px] ${
                          (i % 2 === 0 && i !== 12) || i === 0 || i === 4 || i === 20 || i === 24 ? "bg-slate-900" : "bg-white"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[7.5px] font-mono font-bold block text-slate-400 mt-1 uppercase">
                  Verificación SFA-SEC
                </span>
              </div>

              <div className="col-span-4 text-center pb-1">
                <div className="inline-block relative">
                  <span className="font-serif italic text-blue-800 opacity-90 text-[11.5px] -rotate-6 transform block select-none -mb-1">
                    Lic. Rosa Ramos P.
                  </span>
                  <div className="border-t border-slate-400 text-[7px] font-black tracking-wide text-slate-500 uppercase pt-1">
                    JEFATURA DE ADMISIÓN
                  </div>
                  <div className="absolute inset-0 border-2 border-blue-500/20 text-blue-500/20 text-[6px] font-sans rounded-full -rotate-12 translate-x-2 -translate-y-2 p-0.5 pointer-events-none select-none uppercase">
                    IESTP "SFA" CHINCHA
                  </div>
                </div>
              </div>

              <div className="col-span-4 text-center pb-1">
                <div className="inline-block relative">
                  <span className="font-serif italic text-blue-800 opacity-90 text-[11.5px] -rotate-3 transform block select-none -mb-1">
                    Dr. Ricardo Mendoza V.
                  </span>
                  <div className="border-t border-slate-400 text-[7px] font-black tracking-wide text-slate-500 uppercase pt-1">
                    DIRECCIÓN GENERAL
                  </div>
                  <div className="absolute inset-x-0 -top-5 mx-auto border border-blue-700/60 text-blue-700/60 font-black text-[5px] rounded-full flex flex-col justify-center items-center w-8 h-8 rotate-12 bg-white/20 select-none pointer-events-none">
                    <span className="scale-[0.8] leading-none uppercase">SFA</span>
                    <span className="scale-[0.6] leading-none uppercase">CHINCHA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-6">
              CON CARÁCTER DE DECLARACIÓN JURADA INSTITUCIONAL • VALIDEZ FISICA E INFORMÁTICA
            </div>
          </div>
        </div>

        {/* Modal Bottom toolbar buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex flex-wrap gap-2.5 items-center justify-between text-xs font-bold text-slate-700">
          <span className="text-[10px] text-[#2F6187] font-semibold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Sugerencia: Imprima el documento para presentarlo en ventanilla.</span>
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-650 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
            >
              Cerrar
            </button>
            
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-semibold cursor-pointer text-xs flex items-center gap-1"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              id="download-constancia-btn"
              className="px-4 py-2 bg-[#9F062A] text-white rounded-lg hover:bg-[#800521] font-semibold cursor-pointer text-xs flex items-center gap-1"
            >
              <Download className="w-4 h-4 text-red-200" />
              <span>Descargar Constancia Oficial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ConstanciaModal.displayName = "ConstanciaModal";
export default ConstanciaModal;
