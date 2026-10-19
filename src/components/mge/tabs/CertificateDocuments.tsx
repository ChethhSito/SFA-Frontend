import React, { useEffect, useState } from "react";
import { fetchCertificateFile, fetchCertificates, IssuedCertificate, registerCertificate, revokeCertificate, verifyCertificate } from "../../../services/api";
import { downloadFile } from "../../../utils/mgeExports";
import { academicToday } from "../../../utils/attendance";

const fingerprint = async (bytes: ArrayBuffer) => {
  if (!crypto.subtle) throw new Error("La verificación de integridad requiere HTTPS o localhost.");
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map((value) => value.toString(16).padStart(2, "0")).join("");
};
function readFile(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.onabort = reject; reader.readAsDataURL(file); });
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
    setLoading(true); setLoadError("");
    fetchCertificates(dni).then((rows) => {
      if (!Array.isArray(rows)) throw new Error("No disponible");
      if (active) setItems(rows);
    }).catch(() => { if (active) setLoadError("No se pudieron consultar los certificados. La cuenta Firebase necesita un claim de rol mge, administrador o superadmin."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dni, retry]);
  const current = items.find((item) => item.active);
  const run = async (action: () => Promise<void>) => { if (busy) return; setBusy(true); setError(""); try { await action(); } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo completar la operación."); } finally { setBusy(false); } };
  const register = async () => {
    if (!file || !ready || current || loadError || loading) return;
    if (file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Seleccione un PDF de hasta 5 MB.");
    const saved = await registerCertificate({ studentDni: dni, number, issuedDate: date, issuerName: issuer, fileName: file.name, fileData: await readFile(file) });
    if (!saved?._id) throw new Error("No se pudo registrar el PDF. Verifique los requisitos, el número, el archivo y los permisos de su cuenta.");
    setItems((previous) => [saved, ...previous.filter((item) => item._id !== saved._id)]); setFile(null); setNumber(""); setDate(""); setIssuer("");
  };
  const download = async (item: IssuedCertificate) => {
    const result = await fetchCertificateFile(item._id);
    if (!result?.fileData) throw new Error("No se pudo descargar el documento.");
    const bytes = Uint8Array.from(atob(result.fileData), (value) => value.charCodeAt(0));
    if (await fingerprint(bytes.buffer) !== result.sha256) throw new Error("El archivo no coincide con la huella del registro. No se descargó.");
    downloadFile(bytes.buffer, result.fileName, "application/pdf");
  };
  const verify = async (item: IssuedCertificate, compare?: File) => {
    const result = await verifyCertificate(item.verificationCode);
    if (!result?.registered) throw new Error("No se pudo verificar el registro.");
    let comparison = "";
    if (compare) comparison = await fingerprint(await compare.arrayBuffer()) === result.sha256 ? " El PDF coincide con el archivo registrado." : " El PDF NO coincide con el archivo registrado.";
    setVerification(`Documento ${result.number}: ${result.active ? "registro vigente" : "registro revocado"}.${comparison} La firma criptográfica no se valida en este módulo.`);
  };
  return <section className="border-t pt-4 space-y-3">
    <h4 className="font-semibold">PDF del certificado emitido</h4>
    <p className="text-sm text-slate-600">Adjunte el documento emitido por la institución con su número y fecha reales. Se conserva el PDF original y se verifica su integridad; el sistema no genera ni valida una firma institucional.</p>
    <button type="button" disabled={loading || busy} onClick={() => setRetry((value) => value + 1)} className="border rounded-lg px-3 py-2 disabled:opacity-50">Actualizar documentos</button>
    {loading ? <p role="status">Cargando documentos...</p> : loadError ? <p role="alert" className="text-red-700 text-sm">{loadError}</p> : <>
      {!current ? <fieldset disabled={busy || !ready} className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Número del documento<input value={number} onChange={(event) => setNumber(event.target.value)} maxLength={80} className="block border rounded-lg p-2 w-full mt-1" /></label>
        <label className="text-sm">Fecha de emisión<input type="date" value={date} max={academicToday()} onChange={(event) => setDate(event.target.value)} className="block border rounded-lg p-2 w-full mt-1" /></label>
        <label className="text-sm">Firmante según el PDF<input value={issuer} onChange={(event) => setIssuer(event.target.value)} maxLength={150} className="block border rounded-lg p-2 w-full mt-1" /></label>
        <label className="text-sm">PDF institucional (máximo 5 MB)<input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block mt-1 max-w-full" /></label>
        <button type="button" disabled={busy || !ready || !file || !number.trim() || !date || !issuer.trim()} onClick={() => { void run(register); }} className="bg-[#9F062A] text-white rounded-lg px-3 py-2 disabled:opacity-50">Registrar PDF emitido</button>
      </fieldset> : null}
      {!ready && !current ? <p className="text-sm text-amber-800">Guarde todos los requisitos y marque el expediente Apto antes de registrar un certificado.</p> : null}
      {items.map((item) => <article key={item._id} className="rounded-lg border p-3 space-y-2 text-sm"><p className="font-semibold">{item.number} · {item.active ? "Vigente en el registro" : "Revocado"} · Emitido: {item.issuedDate}</p><p>Firmante declarado: {item.issuerName}</p>
        <label className="block">Código de verificación del registro<input readOnly value={item.verificationCode} className="block border rounded-lg p-2 w-full mt-1" /></label>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => { void run(() => download(item)); }} className="border rounded-lg px-3 py-2">{item.active ? "Descargar PDF original" : "Descargar PDF archivado"}</button><button type="button" disabled={busy} onClick={() => { void run(() => verify(item)); }} className="border rounded-lg px-3 py-2">Verificar registro</button>
          {item.active ? <button type="button" disabled={busy} onClick={() => { setRevokeId(item._id); setReason(""); }} className="border rounded-lg px-3 py-2 text-red-700">Revocar documento</button> : null}</div>
        <label className="block">Comparar un PDF con este registro<input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(event) => { const compare = event.target.files?.[0]; if (compare) { if (compare.size > 5 * 1024 * 1024) { setError("El PDF debe tener como máximo 5 MB."); return; } void run(() => verify(item, compare)); } }} className="block mt-1 max-w-full" /></label>
        {!item.active ? <p>Motivo de revocación: {item.revocationReason}</p> : null}
        {revokeId === item._id ? <div className="rounded-lg bg-red-50 p-3 space-y-2"><p>Confirme la revocación de {item.number}. El PDF y su registro quedarán archivados.</p><label className="block">Motivo<textarea value={reason} maxLength={2000} onChange={(event) => setReason(event.target.value)} className="block border rounded-lg p-2 w-full" /></label><button type="button" disabled={busy || !reason.trim()} onClick={() => { void run(async () => { const saved = await revokeCertificate(item._id, reason); if (!saved || saved.active) throw new Error("No se pudo revocar el documento."); setItems((previous) => previous.map((row) => row._id === saved._id ? saved : row)); setRevokeId(""); }); }} className="bg-red-700 text-white rounded-lg px-3 py-2 disabled:opacity-50">Confirmar revocación</button><button type="button" disabled={busy} onClick={() => setRevokeId("")} className="ml-3 border rounded-lg px-3 py-2">Cancelar</button></div> : null}
      </article>)}
    </>}
    {verification ? <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm">{verification}</p> : null}
    {error ? <p role="alert" className="text-red-700 text-sm">{error}</p> : null}
  </section>;
}
