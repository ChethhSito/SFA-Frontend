import React, { useEffect, useState } from "react";
import { fetchTutoringReferrals, markTutoringReferralRead, updateTutoringCase, TutoringReferral } from "../../../services/api";

import MgeTablePagination from "../MgeTablePagination";
import MgeListFilters from "../MgeListFilters";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";

const caseLabels = { PENDIENTE: "Pendiente", EN_ATENCION: "En atención", CERRADO: "Cerrado" };
type CaseDraft = { status: NonNullable<TutoringReferral["status"]>; responsible: string; note: string };
function TutoringCase({ item, draft, onDraft, onSaved }: { item: TutoringReferral; draft: CaseDraft; onDraft: (draft: CaseDraft) => void; onSaved: (item: TutoringReferral) => void }) {
  const { status, responsible, note } = draft;
  const setStatus = (value: CaseDraft["status"]) => onDraft({ ...draft, status: value });
  const setResponsible = (value: string) => onDraft({ ...draft, responsible: value });
  const setNote = (value: string) => onDraft({ ...draft, note: value });
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
  const [drafts, setDrafts] = useState<Record<string, CaseDraft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const visible = items.filter((item) => words.every((word) => normalizeStudentSearch(item.studentName + " " + item.studentDni).includes(word)) && (!situation || (item.status || "PENDIENTE") === situation)).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  const current = Math.min(page, Math.max(1, Math.ceil(visible.length / pageSize)));
  return <section aria-labelledby="tutoring-inbox-title" className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
    <div className="flex flex-wrap justify-between gap-3">
      <h3 id="tutoring-inbox-title" className="font-bold">Notificaciones de tutoría{!loading && !error ? ` · ${items.filter((item) => !item.readAt).length} sin leer` : ""}</h3>
      <button type="button" disabled={loading || saving} onClick={() => setRetry((value) => value + 1)} className="rounded-lg bg-slate-100 px-3 py-2 disabled:opacity-50">Actualizar bandeja</button>
    </div>
    <p className="text-sm text-slate-600">Avisos internos de MGE creados al registrar una derivación. Marcar un aviso como leído no significa que el caso haya sido atendido.</p>
    <MgeListFilters label="Filtros de tutoría" query={query} onQuery={(value) => { setQuery(value); setPage(1); }} onClear={() => { setQuery(""); setSituation(""); setPage(1); }} filters={[{ label: "Situación", value: situation, onChange: (value) => { setSituation(value); setPage(1); }, options: [{ value: "", label: "Todos los casos" }, ...Object.entries(caseLabels).map(([value, label]) => ({ value, label }))] }]} />
    {loading ? <p role="status">Cargando notificaciones...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : visible.length === 0 ? <p>No hay derivaciones registradas.</p> : null}
    {!loading && visible.slice((current - 1) * pageSize, current * pageSize).map((item) => <article key={item.studentDni} className="space-y-3 border-t border-slate-100 py-4">
      <header className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold">{item.studentName}</h4><p className="mt-1 text-xs text-slate-500">DNI {item.studentDni} · {item.readAt ? "Leído" : "Sin leer"}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">{caseLabels[item.status || "PENDIENTE"]}</span></header>
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-600">{item.reason}</p>
      <p className="text-xs text-slate-600">Registrado: {new Date(item.registeredAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima)</p>
      {!item.readAt ? <button type="button" disabled={saving} onClick={() => { void markRead(item.studentDni); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Marcar como leído</button> : null}
      <div key={`${item.studentDni}-${item.revision || 0}`}><TutoringCase item={item} draft={drafts[item.studentDni] || { status: item.status || "PENDIENTE", responsible: item.responsible || "", note: "" }} onDraft={(draft) => setDrafts((current) => ({ ...current, [item.studentDni]: draft }))} onSaved={(saved) => { setItems((current) => current.map((row) => row.studentDni === saved.studentDni ? saved : row)); setDrafts((current) => { const next = { ...current }; delete next[item.studentDni]; return next; }); }} /></div>
    </article>)}
    {!loading ? <MgeTablePagination total={visible.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="casos" /> : null}
  </section>;
}
