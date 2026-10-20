import React from "react";
import { X, Printer, Shield, CheckCircle, FileText, CheckCircle2, FileCheck, ExternalLink } from "lucide-react";

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
    fullName?: string;
    programName?: string;
    transactionId?: string;
    amount?: string;
    date?: string;
    concept?: string;
    fileDataUrl?: string;
    fileName?: string;
    docLabel?: string;
    docKey?: string;
    docStatus?: string;
    isVoucher?: boolean;
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

  const appName = "I.E.S.T.P. San Francisco de Asís";
  const safeDni = metadata?.dni || "";
  const fullName = (
    metadata?.fullName ||
    (metadata?.studentName || metadata?.studentLastName
      ? `${metadata?.studentName || ""} ${metadata?.studentLastName || ""}`.trim()
      : "") ||
    title.replace(/Voucher (Matrícula )?de |Recibo de Caja - |Constancia - /i, "").trim() ||
    "Postulante / Estudiante Registrado"
  ).toUpperCase();
  const program = metadata?.programName || "Educación Superior Tecnológica";
  const trId = metadata?.transactionId || (safeDni ? `OP-${safeDni}` : "OP-VENTANILLA");
  const dateStr = metadata?.date || new Date().toISOString().split("T")[0];
  const amountStr = metadata?.amount || (title.toLowerCase().includes("matrícula") ? "S/. 250.00" : "S/. 120.00");
  const conceptStr = metadata?.concept || (title.toLowerCase().includes("matrícula") ? "Derecho de Matrícula Regular" : "Derecho de Examen de Admisión");

  const [activeTabMode, setActiveTabMode] = React.useState<"file" | "receipt">(
    fileType === "receipt" ? "receipt" : "file"
  );

  const isPersonalDocument = Boolean(
    metadata?.docKey ||
    title.toLowerCase().includes("dni") ||
    title.toLowerCase().includes("certificado") ||
    title.toLowerCase().includes("partida") ||
    title.toLowerCase().includes("foto") ||
    title.toLowerCase().includes("expediente")
  );

  const canToggleReceipt = !isPersonalDocument && (
    fileType === "receipt" ||
    Boolean(metadata?.isVoucher || title.toLowerCase().includes("voucher") || title.toLowerCase().includes("recibo"))
  );

  // Attempt to resolve file data URL from props, localStorage cache or fallback
  const resolvedFileDataUrl = React.useMemo(() => {
    if (metadata?.fileDataUrl) return metadata.fileDataUrl;
    if (safeDni && metadata?.docKey) {
      try {
        const stored = localStorage.getItem(`sfa_file_data_${safeDni}_${metadata.docKey}`);
        if (stored) return stored;
      } catch (e) {}
    }
    if (safeDni && (metadata?.isVoucher || title.toLowerCase().includes("voucher"))) {
      try {
        const storedVoucher = localStorage.getItem(`sfa_voucher_data_${safeDni}`);
        if (storedVoucher) return storedVoucher;
      } catch (e) {}
    }
    // Also try docKey derived from title
    if (safeDni) {
      const derivedKey = title.toLowerCase().includes("dni") ? "dniFile"
        : title.toLowerCase().includes("certificado") ? "certificadoFile"
        : title.toLowerCase().includes("partida") ? "partidaFile"
        : title.toLowerCase().includes("foto") ? "fotoFile"
        : null;
      if (derivedKey) {
        try {
          const stored = localStorage.getItem(`sfa_file_data_${safeDni}_${derivedKey}`);
          if (stored) return stored;
        } catch (e) {}
      }
    }
    return null;
  }, [metadata?.fileDataUrl, metadata?.docKey, metadata?.isVoucher, safeDni, title]);

  React.useEffect(() => {
    if (isOpen) {
      if (fileType === "receipt") {
        setActiveTabMode("receipt");
      } else {
        setActiveTabMode("file");
      }
    }
  }, [isOpen, fileType, resolvedFileDataUrl, fileName]);

  const isPdf = Boolean(
    resolvedFileDataUrl?.startsWith("data:application/pdf") ||
    fileName?.toLowerCase().endsWith(".pdf")
  );

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
          <div className="flex items-center gap-2">
            {canToggleReceipt && (
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTabMode("file")}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded tracking-wider transition-colors ${
                    activeTabMode === "file" ? "bg-[#9F062A] text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {metadata?.docLabel ? "Documento" : "Comprobante"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode("receipt")}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded tracking-wider transition-colors ${
                    activeTabMode === "receipt" ? "bg-[#9F062A] text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Recibo Oficial
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-black p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="p-6 bg-slate-50 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">

          {activeTabMode === "receipt" ? (
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
                  <span className="text-slate-400 font-bold uppercase text-[9px]">N° Operación:</span>
                  <span className="font-mono font-black text-[#9F062A]">{trId}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Fecha de Emisión:</span>
                  <span className="font-bold text-slate-800">{dateStr}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Titular:</span>
                  <span className="font-extrabold text-slate-900">{fullName}</span>
                </div>
                {safeDni && (
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">D.N.I.:</span>
                    <span className="font-mono font-bold text-slate-800">{safeDni}</span>
                  </div>
                )}
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
                    <p className="text-[7px] font-bold text-emerald-600 uppercase mt-0.5 leading-none">Oficina de Tesorería</p>
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
            <div className="w-full max-w-md bg-white p-6 shadow-sm border border-slate-250 rounded-xl relative overflow-hidden text-slate-800">

              {resolvedFileDataUrl ? (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  {isPdf ? (
                    <iframe
                      src={resolvedFileDataUrl}
                      title={title}
                      className="w-full h-[380px] rounded border border-slate-200"
                    />
                  ) : (
                    <img
                      src={resolvedFileDataUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[380px] object-contain rounded shadow-xs border border-slate-300"
                    />
                  )}
                </div>
              ) : (fileName || metadata?.fileName || metadata?.docLabel) ? (
                <div className="p-6 bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-xl text-slate-800 space-y-4 shadow-3xs w-full">
                  <div className="flex items-center gap-3 border-b border-slate-150 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#9F062A]/10 border border-[#9F062A]/20 flex items-center justify-center text-[#9F062A]">
                      <FileCheck className="w-5 h-5 text-[#9F062A]" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#9F062A] block">
                        Expediente Digital Oficial
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {metadata?.docLabel || title}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[9.5px]">Archivo Registrado:</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] truncate max-w-[200px]" title={fileName || metadata?.fileName}>
                        {fileName || metadata?.fileName || "Documento Digital"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[9.5px]">Postulante:</span>
                      <span className="font-extrabold text-slate-900">{fullName}</span>
                    </div>
                    {safeDni && (
                      <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                        <span className="text-slate-400 font-bold uppercase text-[9.5px]">DNI:</span>
                        <span className="font-mono font-bold text-slate-800">{safeDni}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[9.5px]">Especialidad:</span>
                      <span className="font-bold text-slate-700">{program}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 font-bold uppercase text-[9.5px]">Estado Auditoría:</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Registrado en Base de Datos
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-100/80 rounded-lg p-2.5 border border-slate-200 text-center">
                    <p className="text-[10px] text-slate-600 font-medium">
                      El postulante adjuntó <strong className="text-slate-900">{fileName || metadata?.fileName}</strong> como respaldo oficial para su validación.
                    </p>
                  </div>

                  {canToggleReceipt && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveTabMode("receipt")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#9F062A] hover:bg-[#800521] text-white text-[10.5px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Ver Recibo Digital Oficial</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-2">
                  <p className="font-extrabold text-[11px] uppercase tracking-wider text-[#9F062A]">Voucher no adjuntado</p>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold">El postulante aún no ha cargado una captura física del comprobante.</p>
                  {canToggleReceipt && (
                    <button
                      type="button"
                      onClick={() => setActiveTabMode("receipt")}
                      className="mt-2 px-3 py-1.5 bg-[#9F062A] text-white text-[10px] font-black uppercase rounded shadow-xs hover:bg-[#800521] transition-colors"
                    >
                      Ver Recibo Digital Oficial
                    </button>
                  )}
                </div>
              )}

              {/* Watermark file stamp details */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] font-semibold text-slate-400">
                <span>Archivo adjunto: {fileName || metadata?.fileName || "Sin archivo"}</span>
                <span className="font-mono text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                  {metadata?.fileDataUrl ? "Cargado" : (fileName || metadata?.fileName) ? "Registrado" : "Pendiente"}
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

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 rounded font-black uppercase text-[10px] tracking-wider cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Recibo</span>
          </button>
        </div>

      </div>
    </div>
  );
}
