import React, { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Download, Trash2, Search, UploadCloud } from "lucide-react";
import { fetchCertificateFile, fetchCertificates, IssuedCertificate, registerCertificate, revokeCertificate, verifyCertificate } from "../../../services/api";
import { downloadFile } from "../../../utils/mgeExports";
import { academicToday } from "../../../utils/attendance";

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

export default function CertificateDocuments({ dni, ready }: { dni: string; ready: boolean }) {
  const [items, setItems] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [number, setNumber] = useState("");
  const [date, setDate] = useState("");
  const [issuer, setIssuer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [revokeId, setRevokeId] = useState("");
  const [reason, setReason] = useState("");
  const [verification, setVerification] = useState("");

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
    const saved = await registerCertificate({
      studentDni: dni,
      number,
      issuedDate: date,
      issuerName: issuer,
      fileName: file.name,
      fileData: await readFile(file)
    });
    if (!saved?._id) throw new Error("No se pudo registrar el PDF. Verifique los requisitos e intente nuevamente.");
    setItems((previous) => [saved, ...previous.filter((item) => item._id !== saved._id)]);
    setFile(null);
    setNumber("");
    setDate("");
    setIssuer("");
  };

  const download = async (item: IssuedCertificate) => {
    const result = await fetchCertificateFile(item._id);
    if (!result?.fileData) throw new Error("No se pudo descargar el documento.");
    const bytes = Uint8Array.from(atob(result.fileData), (value) => value.charCodeAt(0));
    if (await fingerprint(bytes.buffer) !== result.sha256) {
      throw new Error("El archivo no coincide con la huella digital del registro.");
    }
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
                <label className="block text-xs font-bold text-slate-700">
                  Archivo Digital PDF (Hasta 5 MB)
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                    className="block w-full text-xs font-medium mt-1 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#800521] file:text-white hover:file:bg-[#66041a] cursor-pointer"
                  />
                </label>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={busy || !ready || !file || !number.trim() || !date || !issuer.trim()}
                  onClick={() => { void run(register); }}
                  className="bg-[#800521] hover:bg-[#66041a] text-white font-bold text-xs uppercase tracking-wider font-mono rounded-xl px-4 py-2 disabled:opacity-40 transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  {busy ? "Registrando..." : "Registrar Certificado Institucional"}
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
