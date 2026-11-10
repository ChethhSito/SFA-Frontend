import React, { useEffect, useState } from "react";
import { AcademicAlert, readAcademicAlert, refreshAcademicAlerts } from "../../../services/api";

import MgeTablePagination from "../MgeTablePagination";
import MgeListFilters from "../MgeListFilters";
import { normalizeStudentSearch } from "../../../utils/studentFormValidation";

export default function AcademicAlerts({ refresh }: { refresh: number }) {
  const [items, setItems] = useState<AcademicAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const visible = items.filter((item) => words.every((word) => normalizeStudentSearch(item.studentName + " " + item.studentDni).includes(word)) && (situation === "all" || situation === "active" && item.active || situation === "unread" && item.active && !item.readAt || situation === "resolved" && !item.active)).sort((a, b) => Number(!!a.readAt) - Number(!!b.readAt) || b.evaluatedAt.localeCompare(a.evaluatedAt));
  const current = Math.min(page, Math.max(1, Math.ceil(visible.length / pageSize)));
  return <section aria-labelledby="academic-alerts-title" className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
    <div className="flex flex-wrap justify-between gap-3"><h3 id="academic-alerts-title" className="font-bold">Alertas académicas automáticas{!loading && !error ? ` · ${items.filter((item) => item.active && !item.readAt).length} activas sin leer` : ""}</h3><button type="button" disabled={loading || saving} onClick={() => setRetry((value) => value + 1)} className="border rounded-lg p-2 disabled:opacity-50">Actualizar alertas</button></div>
    <details className="text-xs text-slate-500"><summary className="cursor-pointer font-semibold">Criterios de las alertas</summary><p className="mt-2 leading-relaxed">Se recalculan al abrir o actualizar Riesgo Académico. Asistencia menor a 82% o promedio menor a 12.5/20 generan avisos individuales de seguimiento. No completan indicadores faltantes ni asignan automáticamente tutoría. Leer una alerta no cierra un caso.</p></details>
    <MgeListFilters label="Filtros de alertas" query={query} onQuery={(value) => { setQuery(value); setPage(1); }} onClear={() => { setQuery(""); setSituation("active"); setPage(1); }} filters={[{ label: "Situación", value: situation, onChange: (value) => { setSituation(value); setPage(1); }, options: [{ value: "active", label: "Activas" }, { value: "unread", label: "Activas sin leer" }, { value: "resolved", label: "Ya no aplican" }, { value: "all", label: "Todas las alertas" }] }]} />
    {loading ? <p role="status">Revisando registros académicos...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : !visible.length ? <p>No hay alertas para mostrar.</p> : null}
    {!loading && visible.length > 0 ? <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Estudiante", "Indicador observado", "Situación", "Última revisión", "Acción"].map((label) => <th key={label} scope="col" className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.slice((current - 1) * pageSize, current * pageSize).map((item) => <tr key={item.key} className="align-top hover:bg-slate-50/50">
      <td className="px-4 py-4"><p className="font-semibold">{item.studentName}</p><p className="mt-1 text-xs text-slate-500">DNI {item.studentDni}</p></td>
      <td className="max-w-sm px-4 py-4"><span className={"rounded-full px-2 py-1 text-xs font-semibold " + (!item.active ? "bg-slate-100 text-slate-500" : item.level === "CRITICO" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800")}>{item.active ? item.level === "CRITICO" ? "Indicador crítico" : "Indicador moderado" : "Ya no aplica"}</span><p className="mt-2 leading-relaxed text-slate-600">{item.message}</p>{!item.active ? <p className="mt-2 text-xs text-slate-500">{item.resolutionReason === "RECUPERADO" ? "El indicador actual ya no supera el umbral de alerta." : item.resolutionReason === "SIN_DATOS" ? "Ya no hay datos suficientes para confirmar este indicador." : "El estudiante ya no figura en la evaluación activa."} Se conserva el valor observado anteriormente.</p> : null}</td>
      <td className="px-4 py-4 text-xs text-slate-500">{item.readAt ? "Leída" : "Sin leer"}</td><td className="px-4 py-4 text-xs leading-relaxed text-slate-500">{new Date(item.evaluatedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })} (Lima)</td>
      <td className="px-4 py-4">{!item.readAt && item.active ? <button type="button" disabled={saving} onClick={() => { void markRead(item.key); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#9F062A] disabled:opacity-40">Marcar alerta como leída</button> : <span className="text-xs text-slate-400">Sin acción pendiente</span>}</td>
    </tr>)}</tbody></table></div> : null}
    {!loading ? <MgeTablePagination total={visible.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="alertas" /> : null}
  </section>;
}
