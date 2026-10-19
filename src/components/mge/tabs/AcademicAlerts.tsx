import React, { useEffect, useState } from "react";
import { AcademicAlert, readAcademicAlert, refreshAcademicAlerts } from "../../../services/api";

export default function AcademicAlerts({ refresh }: { refresh: number }) {
  const [items, setItems] = useState<AcademicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    refreshAcademicAlerts().then((result) => {
      if (!Array.isArray(result?.alerts)) throw new Error("No disponible");
      if (active) setItems(result.alerts);
    }).catch(() => { if (active) setError("No se pudieron actualizar las alertas. Reintente la consulta."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh, retry]);
  const markRead = async (key: string) => {
    if (saving) return;
    setSaving(true); setError("");
    try {
      const current = items.find((item) => item.key === key);
      if (!current) throw new Error("Aviso no encontrado");
      const result = await readAcademicAlert(key, current.detectedAt);
      if (!result?.readAt || result.key !== key) throw new Error("No guardado");
      setItems((current) => current.map((item) => item.key === key ? result : item));
    } catch { setError("No se pudo guardar la lectura de la alerta. Si el indicador cambió, actualice las alertas y reintente."); }
    finally { setSaving(false); }
  };
  const visible = items.filter((item) => showResolved || item.active);
  return <section aria-labelledby="academic-alerts-title" className="border rounded-xl bg-white p-5 space-y-3">
    <div className="flex flex-wrap justify-between gap-3"><h3 id="academic-alerts-title" className="font-bold">Alertas académicas automáticas{!loading && !error ? ` · ${items.filter((item) => item.active && !item.readAt).length} activas sin leer` : ""}</h3><button type="button" disabled={loading || saving} onClick={() => setRetry((value) => value + 1)} className="border rounded-lg p-2 disabled:opacity-50">Actualizar alertas</button></div>
    <p className="text-sm text-slate-600">Se recalculan al abrir o actualizar Riesgo Académico. Asistencia menor a 82% o promedio menor a 12.5/20 generan avisos individuales de seguimiento. No completan indicadores faltantes ni asignan automáticamente tutoría. Leer una alerta no cierra un caso.</p>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={showResolved} onChange={(event) => setShowResolved(event.target.checked)} />Mostrar alertas que ya no aplican</label>
    {loading ? <p role="status">Revisando registros académicos...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : !visible.length ? <p>No hay alertas para mostrar.</p> : null}
    {!loading && visible.map((item) => <article key={item.key} className="border-t pt-3 space-y-2">
      <p className="font-semibold">{item.studentName} · {item.studentDni} · {item.active ? item.level === "CRITICO" ? "Indicador crítico" : "Indicador moderado" : "Ya no aplica"} · {item.readAt ? "Leída" : "Sin leer"}</p>
      <p className="text-sm">{item.message}</p><p className="text-xs text-slate-600">Última revisión: {new Date(item.evaluatedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima)</p>
      {!item.active ? <p className="text-sm text-slate-600">Motivo: {item.resolutionReason === "RECUPERADO" ? "el indicador actual ya no supera el umbral de alerta" : item.resolutionReason === "SIN_DATOS" ? "ya no hay datos suficientes para confirmar este indicador" : "el estudiante ya no figura en la evaluación activa"}. El aviso conserva el valor observado anteriormente.</p> : null}
      {!item.readAt && item.active ? <button type="button" disabled={saving} onClick={() => { void markRead(item.key); }} className="border rounded-lg px-3 py-2 text-sm disabled:opacity-50">Marcar alerta como leída</button> : null}
    </article>)}
  </section>;
}
