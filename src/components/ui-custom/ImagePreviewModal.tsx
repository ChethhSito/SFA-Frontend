import React from "react";
import { X, Printer, Shield, CheckCircle } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileName: string;
  fileType: "image" | "receipt";
  metadata?: {
    dni?: string;
    studentName?: string;
    studentLastName?: string;
    programName?: string;
    transactionId?: string;
    amount?: string;
    date?: string;
    concept?: string;
    fileDataUrl?: string;
  };
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  title,
  fileName,
  fileType,
  metadata
}: ImagePreviewModalProps) {
  if (!isOpen) return null;

  const appName = "I.E.S.T.P. San Francisco de Asis";
  const safeDni = metadata?.dni || "71218314";
  const fullName = `${metadata?.studentName || "Raul"} ${metadata?.studentLastName || "Quintana"}`.toUpperCase();
  const program = metadata?.programName || "Electricidad Industrial";
  const trId = metadata?.transactionId || "PRE-620323";
  const dateStr = metadata?.date || "15/03/2026";
  const amountStr = metadata?.amount || "S/. 120.00";
  const conceptStr = metadata?.concept || "Derecho de Examen Ordinario 2026";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
      {/* Dynamic print-override styles to ensure clean, isolated receipt printing in pdf */}
      <style>{`
        @media print {
          /* Hide EVERYTHING in the page */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the receipt print area card and its contents */
          #receipt-print-area, #receipt-print-area * {
            visibility: visible !important;
          }
          /* Position the receipt precisely at the top left of the printed canvas */
          #receipt-print-area {
            position: absolute !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 400px !important;
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            padding: 24px !important;
            background: white !important;
          }
          @page {
            size: auto;
            margin: 15mm 10mm 15mm 10mm;
          }
        }
      `}</style>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-extrabold text-[11px] uppercase tracking-widest">{title}</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-black p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Viewport */}
        <div className="p-6 bg-slate-50 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">
          
          {fileType === "receipt" ? (
            /* ==============================================
               HIGH-FIDELITY TUITION / FEE RECEIPT TEMPLATE 
               ============================================== */
            <div id="receipt-print-area" className="w-full max-w-sm bg-white border border-slate-300 p-6 shadow-sm rounded-lg relative overflow-hidden font-sans border-t-4 border-t-[#9F062A]">
              <div className="text-center space-y-1">
                <h3 className="text-xs font-black tracking-tight uppercase text-slate-800">{appName}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">R.U.C. 20450123591 | Sede Central</p>
                <div className="border-y border-dashed border-slate-300 py-1 my-2">
                  <span className="text-[10px] uppercase font-mono font-black text-[#9F062A]">RECIBO DE CAJA OFICIAL</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-[11px] text-slate-700">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">N° Operacion:</span>
                  <span className="font-mono font-black text-[#9F062A]">{trId}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Fecha de Emision:</span>
                  <span className="font-bold text-slate-800">{dateStr}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Postulante:</span>
                  <span className="font-extrabold text-slate-900">{fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">D.N.I.:</span>
                  <span className="font-mono font-bold text-slate-800">{safeDni}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Especialidad:</span>
                  <span className="font-bold text-slate-800">{program}</span>
                </div>
                <div className="flex justify-between border-b border-dashed pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Concepto de Pago:</span>
                  <span className="font-bold text-slate-800">{conceptStr}</span>
                </div>
              </div>

              {/* Total Box */}
              <div className="mt-5 p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Cancelado</span>
                <span className="text-sm font-mono font-black text-slate-900">{amountStr}</span>
              </div>

              {/* Verified Badge / Stamp */}
              <div className="mt-6 flex flex-col items-center justify-center">
                <div className="border-2 border-emerald-600/30 text-emerald-700 bg-emerald-50 rounded-lg p-2 flex items-center gap-1.5 transform -rotate-2 select-none">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none">PAGO VALIDADO</p>
                    <p className="text-[7px] font-bold text-emerald-600 uppercase mt-0.5 leading-none">Oficina de Tesoreria</p>
                  </div>
                </div>
                
                {/* Barcode representation */}
                <div className="mt-5 flex flex-col items-center space-y-1 opacity-70">
                  <div className="h-6 w-44 bg-[repeating-linear-gradient(90deg,currentColor,currentColor_1px,transparent_1px,transparent_4px)] text-slate-800" />
                  <span className="font-mono text-[8px] text-slate-400">{trId} - SAN_FRANCISCO_ASIS</span>
                </div>
              </div>
            </div>
          ) : (
            /* ==============================================
               HIGH-FIDELITY DIGITAL FILE SCAN REPRESENTATIONS 
               ============================================== */            <div className="w-full max-w-sm bg-white p-6 shadow-sm border border-slate-250 rounded-xl relative overflow-hidden text-slate-800">
              
              {metadata?.fileDataUrl ? (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <img 
                    src={metadata.fileDataUrl} 
                    alt={title} 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[350px] object-contain rounded shadow-xs border border-slate-300"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-2">
                  <p className="font-extrabold text-[11px] uppercase tracking-wider text-[#9F062A]">Imagen no recibida</p>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold">El postulante aún no ha cargado una captura o fotografía física real de este requisito en el sistema de admisiones.</p>
                </div>
              )}

              {/* Watermark file stamp details */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] font-semibold text-slate-400">
                <span>Archivo adjunto: {fileName || "Sin archivo"}</span>
                <span className="font-mono text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                  {metadata?.fileDataUrl ? "Cargado" : "Pendiente"}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            Cerrar Vista
          </button>
          
          {fileType === "receipt" && (
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 rounded font-black uppercase text-[10px] tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Recibo</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
