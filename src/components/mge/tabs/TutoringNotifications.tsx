import React, { useEffect, useState } from "react";
import { fetchTutoringReferrals, markTutoringReferralRead, updateTutoringCase, TutoringReferral } from "../../../services/api";

const caseLabels = { PENDIENTE: "Pendiente", EN_ATENCION: "En atención", CERRADO: "Cerrado" };
function TutoringCase({ item, onSaved }: { item: TutoringReferral; onSaved: (item: TutoringReferral) => void }) {
  const [status, setStatus] = useState(item.status || "PENDIENTE");
  const [responsible, setResponsible] = useState(item.responsible || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (saving || !note.trim()) return;
    setSaving(true); setError("");
    try {
      const saved = await updateTutoringCase(item.studentDni, { status, responsible, note, revision: item.revision || 0 });
      if (!saved || saved.studentDni !== item.studentDni) throw new Error("No guardado");
      onSaved(saved);
    } catch { setError("No se pudo guardar el seguimiento. Si otra persona cambió el caso, actualice la bandeja. Sus observaciones se conservan."); }
    finally { setSaving(false); }
  };
  return <details className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer font-semibold">Seguimiento · {caseLabels[item.status || "PENDIENTE"]}</summary>
    <fieldset disabled={saving} className="mt-3 space-y-3">
      <label className="block text-sm">Estado<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="block border rounded-lg p-2 mt-1">
        <option value="PENDIENTE">Pendiente / Reabrir</option><option value="EN_ATENCION">En atención</option>{item.status !== undefined && item.status !== "PENDIENTE" ? <option value="CERRADO">Cerrado</option> : null}
      </select></label>
      <label className="block text-sm">Responsable asignado<input value={responsible} onChange={(event) => setResponsible(event.target.value)} maxLength={150} className="block border rounded-lg p-2 mt-1 w-full" /></label>
      <label className="block text-sm">Observación de seguimiento<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} className="block border rounded-lg p-2 mt-1 w-full" /></label>
      <button type="button" disabled={saving || !note.trim() || (status !== "PENDIENTE" && !responsible.trim()) || (item.status === "CERRADO" && status === "CERRADO")} onClick={() => { void save(); }} className="bg-[#9F062A] text-white rounded-lg px-3 py-2 disabled:opacity-50">{saving ? "Guardando..." : "Guardar seguimiento"}</button>
      {error ? <p role="alert" className="text-red-700 text-sm">{error}</p> : null}
    </fieldset>
    <ol className="mt-4 space-y-3">{(item.history || []).map((entry, index) => <li key={index} className="border-t pt-2 text-sm"><p className="font-semibold">{caseLabels[entry.status as keyof typeof caseLabels] || entry.status} · {entry.responsible || "Sin responsable asignado"}</p><p className="whitespace-pre-wrap break-words">{entry.note}</p><p className="text-xs text-slate-600">{new Date(entry.date).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima)</p></li>)}</ol>
    {!item.history?.length ? <p className="mt-3 text-sm text-slate-600">Sin actuaciones de seguimiento registradas.</p> : null}
  </details>;
}

export default function TutoringNotifications({ refresh }: { refresh: number }) {
  const [items, setItems] = useState<TutoringReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchTutoringReferrals().then((result) => {
      if (!Array.isArray(result)) throw new Error("No se pudo cargar la bandeja de tutoría.");
      if (active) setItems(result);
    }).catch(() => { if (active) setError("No se pudo cargar la bandeja de tutoría. Reintente la consulta."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh, retry]);

  const markRead = async (dni: string) => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const result = await markTutoringReferralRead(dni);
      if (!result?.readAt || result.studentDni !== dni) throw new Error("No guardado");
      setItems((current) => current.map((item) => item.studentDni === dni ? result : item));
    } catch { setError("No se pudo guardar la lectura del aviso. Reintente."); }
    finally { setSaving(false); }
  };

  return <section aria-labelledby="tutoring-inbox-title" className="rounded-xl border bg-white p-5 space-y-3">
    <div className="flex flex-wrap justify-between gap-3">
      <h3 id="tutoring-inbox-title" className="font-bold">Notificaciones de tutoría{!loading && !error ? ` · ${items.filter((item) => !item.readAt).length} sin leer` : ""}</h3>
      <button type="button" disabled={loading || saving} onClick={() => setRetry((value) => value + 1)} className="rounded-lg bg-slate-100 px-3 py-2 disabled:opacity-50">Actualizar bandeja</button>
    </div>
    <p className="text-sm text-slate-600">Avisos internos de MGE creados al registrar una derivación. Marcar un aviso como leído no significa que el caso haya sido atendido.</p>
    {loading ? <p role="status">Cargando notificaciones...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : items.length === 0 ? <p>No hay derivaciones registradas.</p> : null}
    {!loading && items.map((item) => <article key={item.studentDni} className="border-t pt-3 space-y-2">
      <p className="font-semibold">{item.studentName} · {item.studentDni} · {item.readAt ? "Leído" : "Sin leer"}</p>
      <p className="text-sm whitespace-pre-wrap break-words">{item.reason}</p>
      <p className="text-xs text-slate-600">Registrado: {new Date(item.registeredAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima)</p>
      {!item.readAt ? <button type="button" disabled={saving} onClick={() => { void markRead(item.studentDni); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Marcar como leído</button> : null}
      <div key={`${item.studentDni}-${item.revision || 0}`}><TutoringCase item={item} onSaved={(saved) => setItems((current) => current.map((row) => row.studentDni === saved.studentDni ? saved : row))} /></div>
    </article>)}
  </section>;
}
