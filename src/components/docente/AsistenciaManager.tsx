import React, { useCallback, useState } from "react";
import { AttendanceRecord, StudentPersonalData } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";
import { academicToday } from "../../utils/attendance";

type AttendanceStatus = "Presente" | "Tardanza" | "Falta" | "Justificado";
interface Props {
  courseId: string;
  week: number;
  students: StudentPersonalData[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  onReload: () => Promise<boolean>;
  onUpdateAttendance: (updated: AttendanceRecord[]) => Promise<boolean>;
}

export default function AsistenciaManager({ courseId, week, students, attendanceRecords, loading, error, onReload, onUpdateAttendance }: Props) {
  const [date, setDate] = useState(() => new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()));
  const [drafts, setDrafts] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const key = JSON.stringify([courseId, date]);
  const existing = attendanceRecords.find((record) => record.courseId === courseId && record.date === date);
  const draft = drafts[key] || {};
  const notify = (message: string, kind: ToastNotice['kind']) => setNotice({ id: Date.now(), message, kind });
  const mark = (dni: string, status: AttendanceStatus) => setDrafts((previous) => ({ ...previous,
    [key]: { ...previous[key], [dni]: status } }));
  const markAll = (status: AttendanceStatus) => setDrafts((previous) => ({ ...previous,
    [key]: Object.fromEntries(students.map((student) => [student.dni, status])) }));
  const save = async () => {
    if (saving || loading || error) return;
    if (!date || !courseId || !Object.keys(draft).length) {
      notify("Seleccione la fecha y marque al menos un alumno antes de guardar.", "warning"); return;
    }
    const record: AttendanceRecord = { ...existing, id: existing?.id || `attendance-${Date.now()}`,
      courseId, date, week, statusMap: { ...existing?.statusMap, ...draft } };
    const next = existing ? attendanceRecords.map((item) => item === existing ? record : item) : [...attendanceRecords, record];
    setSaving(true);
    try {
      const saved = await onUpdateAttendance(next);
      if (!saved) { notify("No se pudo guardar la asistencia. Conservamos tus marcas para reintentar.", "error"); return; }
      setDrafts((previous) => { const result = { ...previous }; delete result[key]; return result; });
      notify("Asistencia guardada en el servidor.", "success");
    } catch { notify("No se pudo guardar la asistencia. Conservamos tus marcas para reintentar.", "error"); }
    finally { setSaving(false); }
  };

  return <div className="space-y-5">
    {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}
    <h2 className="font-bold text-lg">Semana {week}: Registro diario de asistencia</h2>
    <p className="text-sm text-slate-600">Seleccione la fecha real de la clase. Se guarda una lista diaria por curso; ningún alumno se marca automáticamente.</p>
    {loading ? <p role="status">Cargando asistencias...</p> : null}
    {error ? <div role="alert" className="text-red-700 space-y-2"><p>{error}</p><button type="button" onClick={() => { void onReload(); }} className="border rounded-lg p-2">Reintentar carga</button></div> : null}
    <fieldset disabled={saving || loading || !!error} className="space-y-4 min-w-0">
      <div className="flex flex-wrap gap-3 items-center rounded-xl border bg-white p-4">
        <label htmlFor="teacher-attendance-date" className="font-bold text-sm">Fecha de la clase</label>
        <input id="teacher-attendance-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="border rounded-lg p-2" />
        <span className="text-sm text-slate-600">{existing ? "Registro guardado" : "Sin registrar"}{Object.keys(draft).length ? " · Cambios pendientes" : ""}</span>
      </div>
      {date > academicToday() ? <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Fecha futura: estas marcas se guardan, pero se incluirán en los porcentajes de asistencia y riesgo académico cuando llegue esa fecha (hora de Lima).
      </p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!students.length} onClick={() => markAll("Presente")} className="bg-emerald-600 text-white rounded-lg px-3 py-2 disabled:opacity-50">Marcar todos presentes</button>
        <button type="button" disabled={!students.length} onClick={() => markAll("Falta")} className="bg-red-700 text-white rounded-lg px-3 py-2 disabled:opacity-50">Marcar todos faltas</button>
      </div>
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Estudiante", "Estado guardado", "Registrar asistencia"].map((heading) => <th scope="col" key={heading} className="p-3">{heading}</th>)}</tr></thead>
          <tbody>{students.map((student) => {
            const selected = draft[student.dni] || existing?.statusMap[student.dni];
            return <tr key={student.dni} className="border-t"><td className="p-3 font-bold">{student.name} {student.lastName}<p className="text-xs font-normal">{student.dni}</p></td>
              <td className="p-3">{existing?.statusMap[student.dni] || "Sin registrar"}</td>
              <td className="p-3"><div className="flex flex-wrap gap-2">{(["Presente", "Tardanza", "Falta", "Justificado"] as const).map((status) =>
                <button type="button" key={status} aria-pressed={selected === status} onClick={() => mark(student.dni, status)} className={`rounded-lg px-3 py-2 text-xs ${selected === status ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`}>{status}</button>)}</div></td></tr>;
          })}</tbody></table>
        {!students.length ? <p className="p-4">No hay estudiantes matriculados en la carrera de este curso.</p> : null}
      </div>
      <button type="button" onClick={save} disabled={!students.length || !Object.keys(draft).length} className="bg-[#9F062A] text-white rounded-lg px-4 py-3 disabled:bg-slate-200 disabled:text-slate-600">{saving ? "Guardando..." : "Guardar asistencia"}</button>
    </fieldset>
  </div>;
}
