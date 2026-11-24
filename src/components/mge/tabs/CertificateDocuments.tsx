import React, { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Download, Trash2, Search, UploadCloud, RefreshCw, Eye } from "lucide-react";
import { fetchCertificateFile, fetchCertificates, IssuedCertificate, registerCertificate, revokeCertificate, verifyCertificate } from "../../../services/api";
import { downloadFile } from "../../../utils/mgeExports";
import { academicToday } from "../../../utils/attendance";
import { generateOfficialCertificatePdf } from "../../../utils/officialCertificatePdf";
import { GraduationSummaryExtra } from "../../../utils/graduationSummaryPdf";
import { deliverServiceRequestResult, fetchServiceRequests } from "../../../services/serviceRequests";
import type { Graduation } from "../../../types";

const fingerprint = async (bytes: ArrayBuffer) => {
  if (!crypto.subtle) throw new Error("La verificación de integridad requiere HTTPS o localhost.");
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map((value) => value.toString(16).padStart(2, "0")).join("");
};

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.onabort = reject;
    reader.readAsDataURL(file);
  });
}

interface CertificateDocumentsProps {
  dni: string;
  ready: boolean;
  studentName?: string;
  program?: string;
  record?: Graduation;
  extra?: GraduationSummaryExtra;
}

export default function CertificateDocuments({
  dni,
  ready,
  studentName = "Mateo Sebastián Quispe Rojas",
  program = "Electricidad Industrial",
  record,
  extra,
}: CertificateDocumentsProps) {
  const [items, setItems] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [number, setNumber] = useState(() => `CERT-2026-${dni.slice(-4) || "0042"}-SFA`);
  const [date, setDate] = useState(() => academicToday());
  const [issuer, setIssuer] = useState("Mg. Carlos Mendoza Quispe — Secretaría Académica");
  const [file, setFile] = useState<File | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [revokeId, setRevokeId] = useState("");
  const [reason, setReason] = useState("");
  const [verification, setVerification] = useState("");

  const autoGenerateCertificatePdf = async () => {
    setGeneratingPdf(true);
    try {
      const pdf = await generateOfficialCertificatePdf({
        studentName,
        studentDni: dni,
        program,
        certificateNumber: number,
        issueDate: date,
        issuerName: issuer,
      });
      const blob = pdf.output("blob");
      const autoFile = new File([blob], `Certificado_Oficial_${dni}_SFA.pdf`, {
        type: "application/pdf",
      });
      setFile(autoFile);
    } catch (err) {
      console.warn("Could not auto-generate official certificate PDF:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    fetchCertificates(dni).then((rows) => {
      if (!Array.isArray(rows)) throw new Error("No disponible");
      if (active) setItems(rows);
    }).catch(() => {
      if (active) {
        setItems([]);
        setLoadError("");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [dni, retry]);

  const current = items.find((item) => item.active);

  useEffect(() => {
    if (ready && !current && !file && !generatingPdf) {
      void autoGenerateCertificatePdf();
    }
  }, [ready, current, file, dni]);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo completar la operación.");
    } finally {
      setBusy(false);
    }
  };

  const register = async () => {
    if (!file || !ready || current || loadError || loading) return;
    if (file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Seleccione un archivo PDF institucional válido de hasta 5 MB.");
    }
    const rawData = await readFile(file);
    const cleanData = rawData.replace(/\s+/g, "");
    const saved = await registerCertificate({
      studentDni: dni,
      number,
      issuedDate: date,
      issuerName: issuer,
      fileName: file.name,
      fileData: cleanData
    });
    if (!saved?._id) throw new Error("No se pudo registrar el PDF. Verifique los requisitos e intente nuevamente.");
    setItems((previous) => [saved, ...previous.filter((item) => item._id !== saved._id)]);

    // Sincronizar automáticamente la emisión con la solicitud del portal del estudiante
    try {
      const requests = await fetchServiceRequests(dni);
      const targetReq = requests.find((r) => r.conceptCode === 'CER01' || r.conceptCode === 'TIT01') || requests[0];
      if (targetReq?.id) {
        await deliverServiceRequestResult(targetReq.id, file);
      }
    } catch (syncErr) {
      console.warn("Could not auto-deliver result to service request:", syncErr);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sfa_service_requests_changed"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const download = async (item: IssuedCertificate) => {
    try {
      const pdf = await generateOfficialCertificatePdf({
        studentName,
        studentDni: dni,
        program,
        certificateNumber: item.number,
        issueDate: item.issuedDate,
        issuerName: item.issuerName,
      });
      pdf.save(`Certificado_Oficial_${dni}_${item.number}.pdf`);
      return;
    } catch (e) {
      console.warn("Direct official certificate download failed, falling back to server file:", e);
    }
    const result = await fetchCertificateFile(item._id);
    if (!result?.fileData) throw new Error("No se pudo descargar el documento.");
    const bytes = Uint8Array.from(atob(result.fileData), (value) => value.charCodeAt(0));
    downloadFile(bytes.buffer, result.fileName, "application/pdf");
  };

  const verify = async (item: IssuedCertificate, compare?: File) => {
    const result = await verifyCertificate(item.verificationCode);
    if (!result?.registered) throw new Error("No se pudo verificar el registro.");
    let comparison = "";
    if (compare) {
      comparison = await fingerprint(await compare.arrayBuffer()) === result.sha256
        ? " El PDF coincide exactamente con la huella digital SHA-256 registrada."
        : " El PDF NO coincide con la huella digital del registro.";
    }
    setVerification(`Documento oficial ${result.number}: ${result.active ? "Registro institucional VIGENTE" : "Registro REVOCADO"}.${comparison}`);
  };

  return (
    <section className="border-t border-slate-200 pt-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#800521]" />
          <div>
            <h4 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900">
              Expediente Digital del Certificado Oficial Emitido
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Custodia digital y validación de autenticidad mediante huella criptográfica SHA-256.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={loading || busy}
          onClick={() => setRetry((value) => value + 1)}
          className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
        >
          Sincronizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 py-4">
          <Loader2 className="w-4 h-4 text-[#800521] animate-spin" />
          <span>Consultando repositorium institucional de certificados...</span>
        </div>
      ) : loadError ? (
        <p role="alert" className="text-rose-700 text-xs font-bold bg-rose-50 border border-rose-200 p-3 rounded-xl">
          {loadError}
        </p>
      ) : (
        <>
          {!current && (
            <fieldset
              disabled={busy || !ready}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3.5"
            >
              <div className="text-[11px] font-black uppercase font-mono tracking-wider text-slate-700">
                Registro de Documento Oficial Acreditado
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-slate-700">
                  Número de Resolución o Certificado
                  <input
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    maxLength={80}
                    placeholder="Ej. CERT-2026-0042-SFA"
                    className="block w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-white mt-1 focus:ring-1 focus:ring-[#800521] focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Fecha Oficial de Emisión
                  <input
                    type="date"
                    value={date}
                    max={academicToday()}
                    onChange={(event) => setDate(event.target.value)}
                    className="block w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-white mt-1 focus:ring-1 focus:ring-[#800521] focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Autoridad Institucional Firmante
                  <input
                    value={issuer}
                    onChange={(event) => setIssuer(event.target.value)}
                    maxLength={150}
                    placeholder="Ej. Mg. Carlos Ramírez - Dirección General"
                    className="block w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium bg-white mt-1 focus:ring-1 focus:ring-[#800521] focus:outline-none"
                  />
                </label>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Archivo Digital PDF Oficial *</span>
                    {generatingPdf && (
                      <span className="text-[10px] text-amber-700 font-normal flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generando visado automático...
                      </span>
                    )}
                  </label>

                  {file ? (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-emerald-700 font-bold uppercase">
                            Documento oficial visado adjuntado automáticamente ({(file.size / 1024).toFixed(0)} KB)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (file) {
                              const url = URL.createObjectURL(file);
                              window.open(url, "_blank");
                            }
                          }}
                          title="Ver vista previa del Certificado Oficial de Estudios"
                          className="text-[#800521] hover:text-[#66041a] text-[10.5px] font-bold bg-white border border-rose-200 px-2 py-1 rounded-lg cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3 h-3 text-[#800521]" />
                          <span>Vista Previa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void autoGenerateCertificatePdf()}
                          disabled={generatingPdf}
                          title="Volver a generar el certificado con los datos actualizados"
                          className="text-slate-600 hover:text-slate-900 text-[10.5px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg cursor-pointer inline-flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${generatingPdf ? "animate-spin" : ""}`} />
                          <span>Regenerar</span>
                        </button>
                        <label className="text-[10.5px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded-lg cursor-pointer">
                          Examinar
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                        className="block w-full text-xs font-medium file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#800521] file:text-white hover:file:bg-[#66041a] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => void autoGenerateCertificatePdf()}
                        disabled={generatingPdf}
                        className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${generatingPdf ? "animate-spin" : ""}`} />
                        <span>Auto-generar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Datos y archivo precargados automáticamente para {studentName}.
                </span>
                <button
                  type="button"
                  disabled={busy || !ready || !file || !number.trim() || !date || !issuer.trim()}
                  onClick={() => { void run(register); }}
                  className="bg-[#800521] hover:bg-[#66041a] text-white font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-4 py-2.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  {busy ? "Registrando en Libro Oficial..." : "Registrar Certificado Institucional"}
                </button>
              </div>
            </fieldset>
          )}

          {!ready && !current && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl font-medium">
              Nota institucional: Para registrar el certificado PDF es requisito que el estudiante tenga todos sus documentos evaluados y el estado marcado como <strong>Apto</strong>.
            </p>
          )}

          {items.map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h5 className="font-mono font-black text-sm text-slate-900">
                    {item.number}
                  </h5>
                  <p className="text-xs text-slate-600 font-medium">
                    Firmado por: <strong>{item.issuerName}</strong> · Fecha: {item.issuedDate}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border self-start sm:self-auto ${
                  item.active
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}>
                  {item.active ? "Certificado Vigente" : "Certificado Revocado"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-500">
                  Código Hash de Verificación Digital (SHA-256)
                </span>
                <input
                  readOnly
                  value={item.verificationCode}
                  className="block w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-700 mt-1 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { void run(() => download(item)); }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-3.5 py-2 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { void run(() => verify(item)); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-3.5 py-2 border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verificar Integridad
                </button>
                {item.active && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => { setRevokeId(item._id); setReason(""); }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-3.5 py-2 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Revocar
                  </button>
                )}
              </div>

              {revokeId === item._id && (
                <div className="rounded-xl bg-rose-50/80 border border-rose-200 p-4 space-y-2.5">
                  <p className="text-xs font-black uppercase font-mono text-rose-900">
                    Confirmación de Revocación Administrativa - Documento {item.number}
                  </p>
                  <textarea
                    value={reason}
                    maxLength={2000}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Indique la causal o número de resolución administrativa de revocación..."
                    className="block w-full border border-rose-300 rounded-xl p-2.5 text-xs text-slate-800 bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy || !reason.trim()}
                      onClick={() => {
                        void run(async () => {
                          const saved = await revokeCertificate(item._id, reason);
                          if (!saved || saved.active) throw new Error("No se pudo revocar el documento.");
                          setItems((previous) => previous.map((row) => row._id === saved._id ? saved : row));
                          setRevokeId("");
                        });
                      }}
                      className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-4 py-2 cursor-pointer disabled:opacity-40"
                    >
                      Confirmar revocación
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setRevokeId("")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl px-4 py-2 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </>
      )}

      {verification && (
        <div role="status" className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs font-medium text-blue-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span>{verification}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
