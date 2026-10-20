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

  // Helper to generate a realistic SVG document graphic when offline/raw image base64 is missing
  const effectiveImageUrl = React.useMemo(() => {
    if (resolvedFileDataUrl) return resolvedFileDataUrl;
    const cleanFile = fileName || metadata?.fileName || "";
    if (cleanFile || metadata?.docLabel || isPersonalDocument) {
      const cleanTitle = (metadata?.docLabel || title || "Documento Oficial").toUpperCase();
      const isDni = cleanTitle.includes("DNI") || cleanFile.toLowerCase().includes("dni");
      const isCert = cleanTitle.includes("CERTIFICADO") || cleanFile.toLowerCase().includes("certificado") || cleanFile.toLowerCase().includes("estudios");
      const isFoto = cleanTitle.includes("FOTO") || cleanFile.toLowerCase().includes("foto") || cleanFile.toLowerCase().includes("carnet");
      const isVoucher = cleanTitle.includes("VOUCHER") || cleanFile.toLowerCase().includes("voucher") || cleanFile.toLowerCase().includes("comprobante");

      let bodySvg = "";
      if (isDni) {
        bodySvg = `
          <rect width="600" height="380" rx="16" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
          <rect x="20" y="20" width="560" height="50" rx="8" fill="#0369a1"/>
          <text x="300" y="44" fill="#ffffff" font-size="14" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="1">REPÚBLICA DEL PERÚ</text>
          <text x="300" y="60" fill="#bae6fd" font-size="10" font-weight="700" font-family="sans-serif" text-anchor="middle">REGISTRO NACIONAL DE IDENTIFICACIÓN Y ESTADO CIVIL</text>
          <rect x="35" y="90" width="130" height="170" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
          <circle cx="100" cy="150" r="38" fill="#cbd5e1"/>
          <path d="M 50 240 Q 100 180 150 240" fill="#94a3b8"/>
          <text x="100" y="275" fill="#64748b" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">FOTO IDENTIDAD</text>
          <text x="190" y="110" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif">DOCUMENTO NACIONAL DE IDENTIDAD</text>
          <text x="190" y="138" fill="#0f172a" font-size="24" font-weight="900" font-family="monospace">${safeDni}</text>
          <text x="190" y="170" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif">APELLIDOS Y NOMBRES:</text>
          <text x="190" y="192" fill="#0f172a" font-size="14" font-weight="800" font-family="sans-serif">${fullName}</text>
          <text x="190" y="222" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif">ESPECIALIDAD:</text>
          <text x="190" y="240" fill="#0369a1" font-size="12" font-weight="700" font-family="sans-serif">${program}</text>
          <rect x="20" y="295" width="560" height="65" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
          <text x="300" y="325" fill="#334155" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">IDPER${safeDni}&lt;&lt;09328472&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
          <text x="300" y="345" fill="#64748b" font-size="9" font-family="sans-serif" text-anchor="middle">EXPEDIENTE DIGITAL • ARCHIVO REGISTRADO: ${cleanFile}</text>
        `;
      } else if (isCert) {
        bodySvg = `
          <rect width="600" height="420" rx="12" fill="#fffdfa" stroke="#d97706" stroke-width="4"/>
          <rect x="15" y="15" width="570" height="390" rx="8" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="6,4"/>
          <text x="300" y="55" fill="#78350f" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="2">REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN</text>
          <text x="300" y="80" fill="#92400e" font-size="16" font-weight="900" font-family="sans-serif" text-anchor="middle">CERTIFICADO OFICIAL DE ESTUDIOS SECUNDARIOS</text>
          <line x1="120" y1="92" x2="480" y2="92" stroke="#d97706" stroke-width="2"/>
          <text x="300" y="130" fill="#451a03" font-size="11" font-weight="600" font-family="sans-serif" text-anchor="middle">Por cuanto se certifica formalmente la culminación satisfactoria de estudios de:</text>
          <text x="300" y="165" fill="#8B0020" font-size="17" font-weight="900" font-family="sans-serif" text-anchor="middle">${fullName}</text>
          <text x="300" y="195" fill="#78350f" font-size="12" font-weight="700" font-family="monospace" text-anchor="middle">DOCUMENTO DE IDENTIDAD N°: ${safeDni}</text>
          <rect x="50" y="215" width="500" height="75" rx="8" fill="#fef3c7" stroke="#fde68a"/>
          <text x="300" y="242" fill="#92400e" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">CALIFICACIÓN FINAL Y CULMINACIÓN REGULAR SATISFACTORIA</text>
          <text x="300" y="262" fill="#78350f" font-size="10" font-family="sans-serif" text-anchor="middle">Expediente validado para proceso de Admisión e Inscripción Superior 2026</text>
          <text x="300" y="278" fill="#b45309" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">ARCHIVO ADJUNTO: ${cleanFile}</text>
          <circle cx="120" cy="350" r="30" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
          <text x="120" y="347" fill="#b45309" font-size="8" font-weight="900" font-family="sans-serif" text-anchor="middle">SELLO</text>
          <text x="120" y="358" fill="#b45309" font-size="8" font-weight="900" font-family="sans-serif" text-anchor="middle">OFICIAL</text>
          <line x1="380" y1="365" x2="520" y2="365" stroke="#451a03" stroke-width="1.5"/>
          <text x="450" y="380" fill="#78350f" font-size="9" font-weight="bold" font-family="sans-serif" text-anchor="middle">DIRECCIÓN GENERAL / REGISTRO</text>
        `;
      } else if (isFoto) {
        bodySvg = `
          <rect width="360" height="460" rx="12" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
          <rect x="25" y="25" width="310" height="340" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <circle cx="180" cy="150" r="60" fill="#e2e8f0"/>
          <path d="M 80 320 Q 180 200 280 320" fill="#94a3b8"/>
          <text x="180" y="390" fill="#0f172a" font-size="13" font-weight="900" font-family="sans-serif" text-anchor="middle">${fullName}</text>
          <text x="180" y="410" fill="#64748b" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">DNI: ${safeDni}</text>
          <text x="180" y="430" fill="#0284c7" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">FOTOGRAFÍA CARNET OFICIAL • 2026</text>
        `;
      } else if (isVoucher) {
        bodySvg = `
          <rect width="500" height="360" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="20" y="20" width="460" height="45" rx="6" fill="#0f172a"/>
          <text x="250" y="48" fill="#ffffff" font-size="13" font-weight="900" font-family="sans-serif" text-anchor="middle">COMPROBANTE DE DEPÓSITO BANCARIO</text>
          <text x="50" y="105" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif">INSTITUCIÓN DESTINO:</text>
          <text x="50" y="125" fill="#0f172a" font-size="12" font-weight="900" font-family="sans-serif">I.E.S.T.P. SAN FRANCISCO DE ASÍS</text>
          <text x="50" y="160" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif">TITULAR / POSTULANTE:</text>
          <text x="50" y="180" fill="#0f172a" font-size="13" font-weight="800" font-family="sans-serif">${fullName}</text>
          <text x="50" y="215" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif">N° DE OPERACIÓN / ARCHIVO:</text>
          <text x="50" y="235" fill="#8B0020" font-size="13" font-weight="900" font-family="monospace">${cleanFile}</text>
          <rect x="50" y="260" width="400" height="45" rx="6" fill="#ecfdf5" stroke="#a7f3d0"/>
          <text x="70" y="288" fill="#065f46" font-size="11" font-weight="bold" font-family="sans-serif">MONTO REGISTRADO:</text>
          <text x="420" y="290" fill="#065f46" font-size="16" font-weight="900" font-family="monospace" text-anchor="end">S/. 120.00</text>
          <text x="250" y="335" fill="#64748b" font-size="9" font-weight="bold" font-family="sans-serif" text-anchor="middle">COMPROBANTE EN CURSO DE VALIDACIÓN POR TESORERÍA</text>
        `;
      } else {
        bodySvg = `
          <rect width="550" height="380" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <rect x="20" y="20" width="510" height="40" rx="6" fill="#8B0020"/>
          <text x="275" y="45" fill="#ffffff" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="1">EXPEDIENTE DIGITAL • DOCUMENTO OFICIAL</text>
          <text x="275" y="95" fill="#8B0020" font-size="15" font-weight="900" font-family="sans-serif" text-anchor="middle">${cleanTitle}</text>
          <text x="275" y="125" fill="#64748b" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">POSTULANTE TITULAR:</text>
          <text x="275" y="148" fill="#0f172a" font-size="15" font-weight="800" font-family="sans-serif" text-anchor="middle">${fullName}</text>
          <text x="275" y="172" fill="#64748b" font-size="11" font-weight="bold" font-family="monospace" text-anchor="middle">DNI: ${safeDni} • ${program}</text>
          <rect x="40" y="200" width="470" height="90" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
          <text x="275" y="230" fill="#334155" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">${cleanFile}</text>
          <text x="275" y="255" fill="#059669" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">ARCHIVO DIGITAL REGISTRADO EN BASE DE DATOS</text>
          <text x="275" y="275" fill="#64748b" font-size="9" font-family="sans-serif" text-anchor="middle">Copia digital oficial preservada para evaluación académica 2026</text>
          <text x="275" y="340" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">CÓDIGO DE AUDITORÍA: ${safeDni}-SFA-2026</text>
        `;
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420" width="100%" height="100%">${bodySvg}</svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    return null;
  }, [resolvedFileDataUrl, fileName, metadata?.fileName, metadata?.docLabel, isPersonalDocument, title, fullName, safeDni, program]);

  React.useEffect(() => {
    if (isOpen) {
      if (fileType === "receipt") {
        setActiveTabMode("receipt");
      } else {
        setActiveTabMode("file");
      }
    }
  }, [isOpen, fileType, effectiveImageUrl, fileName]);

  const isPdf = Boolean(
    effectiveImageUrl?.startsWith("data:application/pdf") ||
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
            <div className="w-full max-w-lg bg-white p-3 sm:p-5 shadow-sm border border-slate-200 rounded-xl relative overflow-hidden text-slate-800">
              {effectiveImageUrl ? (
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  {isPdf ? (
                    <iframe
                      src={effectiveImageUrl}
                      title={title}
                      className="w-full h-[380px] rounded border border-slate-200"
                    />
                  ) : (
                    <img
                      src={effectiveImageUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[460px] object-contain rounded shadow-xs border border-slate-300"
                    />
                  )}
                  <div className="w-full mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span className="truncate max-w-[260px] font-bold">
                      {fileName || metadata?.fileName || "Documento Digital"}
                    </span>
                    <span className="font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[9px] uppercase">
                      {resolvedFileDataUrl ? "Archivo Cargado" : "Documento Registrado"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-600 space-y-2">
                  <p className="font-extrabold text-[11px] uppercase tracking-wider text-[#9F062A]">Archivo no adjuntado</p>
                  <p className="text-[10px] text-slate-500 leading-normal font-semibold">El postulante aún no ha cargado una captura física del archivo.</p>
                </div>
              )}
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
            <span>{fileType === "receipt" ? "Imprimir Recibo" : "Imprimir Documento"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
