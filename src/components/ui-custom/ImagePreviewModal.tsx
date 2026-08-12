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
               ============================================== */
            <div className="w-full max-w-sm bg-white p-6 shadow-sm border border-slate-250 rounded-xl relative overflow-hidden text-slate-800">
              
              {(() => {
                const lowerFn = fileName.toLowerCase();
                const lowerTitle = title.toLowerCase();
                
                const isDni = lowerFn.includes("dni") || lowerTitle.includes("dni");
                const isCertificado = lowerFn.includes("certificado") || lowerTitle.includes("certificado") || lowerTitle.includes("estudio") || lowerFn.includes("estudios");
                const isPartida = lowerFn.includes("partida") || lowerTitle.includes("partida") || lowerTitle.includes("nacimiento");
                const isVoucher = lowerFn.includes("op-") || lowerFn.includes("pre-") || lowerFn.includes("matr-") || lowerFn.includes("voucher") || lowerFn.includes("trx-") || lowerTitle.includes("voucher") || lowerTitle.includes("pago") || lowerTitle.includes("recibo") || lowerFn.includes("motox");
                const isFoto = lowerFn.includes("foto") || lowerTitle.includes("foto") || lowerTitle.includes("perfil") || lowerTitle.includes("fotografía");

                if (metadata?.fileDataUrl) {
                  return (
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                      <img 
                        src={metadata.fileDataUrl} 
                        alt={title} 
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-[350px] object-contain rounded shadow-xs border border-slate-300"
                      />
                    </div>
                  );
                }

                if (isDni) {
                  return (
                    /* MOCK DNI PREVIEW */
                    <div className="space-y-4">
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex flex-col relative overflow-hidden">
                        <span className="text-[8px] font-black text-blue-700 tracking-wider">DOCUMENTO NACIONAL DE IDENTIDAD (ANVERSO)</span>
                        <div className="flex gap-3 mt-2">
                          <div className="w-14 h-16 bg-slate-200 border border-slate-350 rounded flex items-center justify-center text-[9px] font-bold text-slate-500 uppercase font-mono tracking-widest select-none">FOTO</div>
                          <div className="flex-1 text-[9px] space-y-0.5">
                            <p><span className="text-slate-400 font-bold">Apellidos:</span> <span className="font-bold">{metadata?.studentLastName || "Quintana"}</span></p>
                            <p><span className="text-slate-400 font-bold">Nombres:</span> <span className="font-bold">{metadata?.studentName || "Raul"}</span></p>
                            <p><span className="text-slate-400 font-bold">Nacionalidad:</span> <span className="font-bold">Peruana</span></p>
                            <p><span className="text-slate-400 font-bold">Cód. DNI:</span> <span className="font-mono font-bold text-blue-700">{safeDni}</span></p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex flex-col">
                        <span className="text-[8px] font-black text-blue-700 tracking-wider">REVERSO DEL DOCUMENTO</span>
                        <div className="mt-2 h-10 bg-[linear-gradient(90deg,#e2e8f0_25%,transparent_25%,transparent_50%,#e2e8f0_50%,#e2e8f0_75%,transparent_75%)] bg-[length:20px_20px] opacity-70 border border-slate-300 rounded" />
                        <p className="text-[7px] text-slate-400 text-right mt-1 font-mono">{safeDni} &lt;&lt; PERU &lt;&lt; ADMISION</p>
                      </div>
                    </div>
                  );
                } else if (isCertificado) {
                  return (
                    /* MOCK CERTIFICADO PREVIEW */
                    <div className="border-4 border-double border-slate-300 p-4 text-center space-y-3 relative">
                      <div className="absolute top-1 right-1 border-2 border-slate-200 p-1 opacity-20 transform rotate-12">OFICIAL</div>
                      <h4 className="text-[9px] font-black tracking-widest uppercase text-slate-650">MINISTERIO DE EDUCACIÓN</h4>
                      <h3 className="text-[11px] font-black tracking-tight text-slate-900 border-b pb-1">CERTIFICADO DE ESTUDIOS SECUNDARIOS</h3>
                      
                      <p className="text-[10px] leading-relaxed text-slate-600 px-2 font-serif">
                        Se certifica solemnemente que don <strong>{fullName}</strong> ha cursado de manera aprobatoria los ciclos académicos escolares, demostrando suficiencia de egreso para continuar estudios de educación superior.
                      </p>

                      <div className="flex justify-around pt-4 border-t border-dashed">
                        <div className="text-center font-mono text-[8px] text-slate-400">
                          <div className="h-6 w-12 border-b border-slate-350 mx-auto" />
                          Firma del Director
                        </div>
                        <div className="text-center font-mono text-[8px] text-slate-300">
                          <div className="h-6 w-12 border border-slate-300 rounded-full mx-auto" />
                          Sello de Visado
                        </div>
                      </div>
                    </div>
                  );
                } else if (isPartida) {
                  return (
                    /* MOCK PARTIDA PREVIEW */
                    <div className="border border-slate-250 p-4 text-left space-y-2.5 font-mono text-[9px] text-slate-600 leading-normal">
                      <h4 className="text-center font-black border-b pb-1 text-slate-800 tracking-tight">REGISTRO CIVIL - ACTA DE NACIMIENTO</h4>
                      
                      <p><strong>Departamento:</strong> Lima</p>
                      <p><strong>Inscrito:</strong> {fullName}</p>
                      <p><strong>DNI Referencia:</strong> {safeDni}</p>
                      <p><strong>Fecha Nacimiento:</strong> 10/10/2006</p>
                      
                      <div className="p-1.5 bg-slate-50 border rounded text-[7.5px] leading-relaxed text-slate-400">
                        Sello Digital de Reniec: Verificado por la municipalidad provincial con código único de firma digital activa.
                      </div>
                    </div>
                  );
                } else if (isVoucher) {
                  return (
                    /* HIGH FIDELITY MOCK BANK VOUCHER DEPOSIT SLIP PREVIEW */
                    <div className="bg-amber-50/60 border border-amber-200/90 p-5 rounded-lg text-slate-850 font-mono text-[10px] leading-normal shadow-xs">
                      <div className="text-center border-b border-dashed border-amber-300 pb-2 mb-2">
                        <span className="font-extrabold text-[11px] block uppercase text-amber-900 tracking-wider">BANCO DE LA NACIÓN</span>
                        <span className="text-[7.5px] text-amber-700 uppercase font-black tracking-widest">SUCURSAL VIRTUAL AGENTE MULTIRED</span>
                      </div>
                      <div className="space-y-1 text-amber-950 font-semibold">
                        <div className="flex justify-between">
                          <span>TRANSACCIÓN:</span>
                          <span className="font-black text-amber-900">{trId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FECHA:</span>
                          <span>{dateStr} 11:24:02 AM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DNI DEPOSITANTE:</span>
                          <span className="font-bold">{safeDni}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RECEPTOR:</span>
                          <span className="font-bold">IESTP SAN FRANCISCO DE ASIS</span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-amber-300 pt-1 mt-1 text-[11px]">
                          <span>TRIBUTO / TASA:</span>
                          <span className="font-bold">06203 - ADMISIÓN</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IMPORTE COMPROMISO:</span>
                          <span className="font-black text-amber-900">{amountStr}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OPERACIÓN:</span>
                          <span className="font-black text-amber-900">{trId}</span>
                        </div>
                      </div>
                      <div className="text-center mt-4 pt-2 border-t border-dashed border-amber-300 text-[8px] text-amber-600 font-extrabold">
                        *** VALIDACIÓN AUTOMÁTICA PROCESADA CON ÉXITO ***
                      </div>
                    </div>
                  );
                } else {
                  return (
                    /* MOCK PORTRAIT PHOTO PREVIEW as fallback */
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-32 h-40 bg-slate-100 border-2 border-slate-300 shadow-inner rounded-md flex flex-col items-center justify-between p-3 select-none">
                        <div className="w-14 h-14 bg-slate-350 rounded-full mt-4 flex items-center justify-center" />
                        <div className="w-24 h-14 bg-slate-355 rounded-t-3xl mt-2" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">FOTOGRAFÍA FORMATO POSTULANTE</p>
                    </div>
                  );
                }
              })()}

              {/* Watermark file stamp details */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] font-semibold text-slate-400">
                <span>Archivo adjunto: {fileName}</span>
                <span className="font-mono text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">Verificado</span>
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
