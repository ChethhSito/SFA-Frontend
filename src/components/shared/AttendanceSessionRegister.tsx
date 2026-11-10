import React, { useEffect, useState } from "react";
import { AttendanceSession } from "../../services/attendanceSessions";
import { AttendanceMark, attendanceMarks, completeAttendance } from "../../utils/attendanceSessionRules";
import { normalizeStudentSearch } from "../../utils/studentFormValidation";
import MgeListFilters from "../mge/MgeListFilters";
import MgeTablePagination from "../mge/MgeTablePagination";
import MgeDialog from "../mge/MgeDialog";

const colors: Record<AttendanceMark, string> = { Presente: "bg-emerald-50 text-emerald-700", Tardanza: "bg-amber-50 text-amber-800", Falta: "bg-red-50 text-red-700", Justificado: "bg-blue-50 text-blue-700" };
export default function AttendanceSessionRegister({ session, blocked, onSave, onReload, onDirtyChange }: {
  session: AttendanceSession; blocked: string; onSave: (marks: Record<string, string>) => Promise<boolean>; onReload: () => Promise<boolean>; onDirtyChange: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState<Record<string, AttendanceMark>>({});
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState("");
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(10);
  const [saving, setSaving] = useState(false), [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bulk, setBulk] = useState<AttendanceMark | "reload" | null>(null);
  const result = completeAttendance(session.roster, session.statusMap, draft);
  const dirty = Object.keys(draft).some((dni) => draft[dni] !== session.statusMap[dni]);
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const words = normalizeStudentSearch(query).split(/\s+/).filter(Boolean);
  const rows = session.roster.filter((s) => words.every((word) => normalizeStudentSearch(`${s.lastName} ${s.name} ${s.dni}`).includes(word)) && (!situation || (situation === "missing" ? !result.statusMap[s.dni] : result.statusMap[s.dni] === situation))).sort((a, b) => `${a.lastName} ${a.name}`.localeCompare(`${b.lastName} ${b.name}`, "es"));
  const current = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const save = async () => {
    if (saving || blocked) return;
    setError(""); setNotice("");
    if (result.missing.length || !session.roster.length) { setError("Debe registrar la asistencia de todos los alumnos antes de guardar."); setSituation("missing"); setPage(1); return; }
    setSaving(true);
    try {
      if (!await onSave(result.statusMap)) throw new Error();
      setDraft({}); setNotice("Asistencia completa guardada correctamente.");
    } catch (failure) { setError(`No se pudo guardar la asistencia. Inténtelo nuevamente.${failure instanceof Error && failure.message ? " " + failure.message : ""}`); }
    finally { setSaving(false); }
  };
  return <div className="space-y-5">
    <header><h2 className="text-lg font-bold">{blocked ? "Consulta de asistencia" : "Registro de asistencia de hoy"}</h2><p className="mt-1 text-sm text-slate-500">{session.date.split("-").reverse().join("/")} · {session.sessionType} · {session.roster.length} alumnos de la sección</p></header>
    {blocked ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{blocked} Puede consultar este registro; la edición está bloqueada.</p> : <p className="text-sm text-slate-500">Marque a todos los alumnos y pulse Guardar asistencia. Los cambios permanecen como borrador hasta guardar.</p>}
    <MgeListFilters label="Filtros de asistencia" query={query} onQuery={(value) => { setQuery(value); setPage(1); }} onClear={() => { setQuery(""); setSituation(""); setPage(1); }} filters={[{ label: "Situación", value: situation, onChange: (value) => { setSituation(value); setPage(1); }, options: [{ value: "", label: "Todas las situaciones" }, { value: "missing", label: "Sin registrar" }, ...attendanceMarks.map((mark) => ({ value: mark, label: mark }))] }]} />
    <section aria-label="Registro de asistencias" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h3 className="font-bold">{session.courseName} · {session.courseCode}</h3><div className="flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={() => { if (dirty) setBulk("reload"); else void onReload(); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Actualizar lista</button>{(["Presente", "Falta"] as const).map((mark) => <button key={mark} type="button" disabled={saving || !!blocked || !session.roster.length} onClick={() => setBulk(mark)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#9F062A] disabled:opacity-40">{mark === "Presente" ? "Marcar todos presentes" : "Marcar todos faltas"}</button>)}</div></header>
      <p role="status" className="border-b border-slate-100 px-5 py-3 text-xs text-slate-500">{session.roster.length - result.missing.length} de {session.roster.length} alumnos completos · {result.missing.length} sin registrar{dirty ? " · Cambios sin guardar" : ""}</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["Estudiante", "Estado guardado", "Registrar asistencia"].map((title) => <th key={title} scope="col" className="px-5 py-4">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.slice((current - 1) * pageSize, current * pageSize).map((student) => <tr key={student.dni} className="hover:bg-slate-50/50"><td className="px-5 py-4"><p className="font-semibold">{student.lastName}, {student.name}</p><p className="mt-1 text-xs text-slate-500">DNI {student.dni}</p></td><td className="px-5 py-4 text-xs text-slate-500">{session.statusMap[student.dni] || "Sin registrar"}</td><td className="px-5 py-4"><div role="group" aria-label={`Asistencia de ${student.name} ${student.lastName}`} className="flex gap-2">{attendanceMarks.map((mark) => <button key={mark} type="button" aria-label={`${mark}: ${student.name} ${student.lastName}`} aria-pressed={result.statusMap[student.dni] === mark} disabled={saving || !!blocked} onClick={() => { setDraft((previous) => ({ ...previous, [student.dni]: mark })); setError(""); setNotice(""); }} className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${result.statusMap[student.dni] === mark ? colors[mark] + " border-transparent" : "border-slate-200 text-slate-600"}`}>{mark}</button>)}</div></td></tr>)}</tbody></table>{!rows.length ? <p className="p-10 text-center text-sm text-slate-500">No hay alumnos con estos filtros.</p> : null}</div>
      <MgeTablePagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} label="alumnos" />
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4"><p className="text-xs text-slate-500">La validación incluye todos los alumnos, también los de otras páginas.</p><button type="button" disabled={saving || !!blocked || !dirty} onClick={() => { void save(); }} className="rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{saving ? "Guardando…" : "Guardar asistencia"}</button></footer>
    </section>
    {error ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error} Sus marcas se conservan para reintentar.</p> : null}
    {notice ? <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p> : null}
    {bulk ? <MgeDialog title={bulk === "reload" ? "Descartar borrador y actualizar" : "Aplicar marcas a toda la sección"} onClose={() => setBulk(null)}><p className="text-sm text-slate-600">{bulk === "reload" ? "Se perderán las marcas que aún no guardó. Se cargarán los datos confirmados del servidor." : `Se marcarán ${session.roster.length} alumnos como ${bulk}, incluyendo las otras páginas. Revise la lista y guarde después.`}</p><div className="flex justify-end gap-3"><button type="button" onClick={() => setBulk(null)} className="rounded-lg border px-4 py-2.5 text-sm">Cancelar</button><button type="button" onClick={() => { if (bulk === "reload") { setDraft({}); void onReload(); } else setDraft(Object.fromEntries(session.roster.map((student) => [student.dni, bulk]))); setBulk(null); setError(""); setNotice(""); }} className="rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white">Confirmar</button></div></MgeDialog> : null}
  </div>;
}
