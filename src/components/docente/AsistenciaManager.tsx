import React, { useCallback, useMemo, useState } from "react";
import { Users, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, RefreshCw } from "lucide-react";
import { AttendanceRecord, StudentPersonalData } from "../../types";
import Toast, { ToastNotice } from "../ui/Toast";
import { academicToday } from "../../utils/attendance";
import { ROSTER } from "./DocenteTypes";

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

export default function AsistenciaManager({ 
  courseId, 
  week, 
  students, 
  attendanceRecords, 
  loading, 
  error, 
  onReload, 
  onUpdateAttendance 
}: Props) {
  const [date, setDate] = useState(() => new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()));
  const [drafts, setDrafts] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);

  // Ensure active student roster is never empty if students exist in system
  const effectiveStudents = useMemo(() => {
    if (students && students.length > 0) return students;
    if (ROSTER && ROSTER.length > 0) {
      return ROSTER.map(r => ({
        dni: r.dni,
        name: r.name,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone
      } as StudentPersonalData));
    }
    return [];
  }, [students]);

  const key = JSON.stringify([courseId, date]);
  const existing = attendanceRecords.find((record) => record.courseId === courseId && record.date === date);
  const draft = drafts[key] || {};
  const notify = (message: string, kind: ToastNotice['kind']) => setNotice({ id: Date.now(), message, kind });

  const mark = (dni: string, status: AttendanceStatus) => setDrafts((previous) => ({
    ...previous,
    [key]: { ...previous[key], [dni]: status }
  }));

  const markAll = (status: AttendanceStatus) => setDrafts((previous) => ({
    ...previous,
    [key]: Object.fromEntries(effectiveStudents.map((student) => [student.dni, status]))
  }));

  const save = async () => {
    if (saving || loading || error) return;
    if (!date || !courseId || !Object.keys(draft).length) {
      notify("Seleccione la fecha y marque al menos un alumno antes de guardar.", "warning");
      return;
    }
    const record: AttendanceRecord = {
      ...existing,
      id: existing?.id || `attendance-${Date.now()}`,
      courseId,
      date,
      week,
      statusMap: { ...existing?.statusMap, ...draft }
    };
    const next = existing 
      ? attendanceRecords.map((item) => item === existing ? record : item) 
      : [...attendanceRecords, record];
    
    setSaving(true);
    try {
      const saved = await onUpdateAttendance(next);
      if (!saved) {
        notify("No se pudo guardar la asistencia. Conservamos tus marcas para reintentar.", "error");
        return;
      }
      setDrafts((previous) => {
        const result = { ...previous };
        delete result[key];
        return result;
      });
      notify("Asistencia sincronizada y guardada en el servidor.", "success");
    } catch {
      notify("No se pudo guardar la asistencia. Conservamos tus marcas para reintentar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case "Presente":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Presente</span>;
      case "Tardanza":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" /> Tardanza</span>;
      case "Falta":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-600" /> Falta</span>;
      case "Justificado":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1"><AlertCircle className="w-3 h-3 text-blue-600" /> Justificado</span>;
      default:
        return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Sin registrar</span>;
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}

      {/* Header institucional */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Semana {week}: Control Diario de Asistencia
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Seleccione la fecha de dictado y registre la puntualidad de los alumnos matriculados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!effectiveStudents.length}
            onClick={() => markAll("Presente")}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Marcar Todos Presentes
          </button>
          <button
            type="button"
            disabled={!effectiveStudents.length}
            onClick={() => markAll("Falta")}
            className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            Marcar Todos Faltas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-200 shadow-3xs">
          Cargando registros de asistencia...
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center justify-between">
          <p className="text-xs font-bold">{error}</p>
          <button 
            type="button" 
            onClick={() => { void onReload(); }} 
            className="text-xs font-black uppercase text-rose-900 underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reintentar carga
          </button>
        </div>
      ) : null}

      <fieldset disabled={saving || loading || !!error} className="space-y-6 min-w-0">
        {/* Selector de fecha y barra de estado */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="teacher-attendance-date" className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Fecha de Sesión Lectiva
              </label>
              <input
                id="teacher-attendance-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Estado: {existing ? (
                <strong className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono text-[11px]">Guardado en servidor</strong>
              ) : (
                <strong className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">Pendiente de registro</strong>
              )}
            </span>
            {Object.keys(draft).length > 0 && (
              <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-pulse">
                {Object.keys(draft).length} cambios sin guardar
              </span>
            )}
          </div>
        </div>

        {date > academicToday() ? (
          <div role="status" className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-xs font-semibold text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Fecha futura:</strong> Las marcas se guardarán formalmente en el sistema, pero se computarán en las estadísticas oficiales y alertas tempranas en la fecha programada.
            </span>
          </div>
        ) : null}

        {/* Tabla institucional de estudiantes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th scope="col" className="p-4">Estudiante</th>
                  <th scope="col" className="p-4">Estado Guardado</th>
                  <th scope="col" className="p-4 text-center">Registrar Asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {effectiveStudents.map((student) => {
                  const selected = draft[student.dni] || existing?.statusMap[student.dni];
                  const initials = `${(student.name || "E").charAt(0)}${(student.lastName || "S").charAt(0)}`.toUpperCase();

                  return (
                    <tr key={student.dni} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {student.lastName ? `${student.lastName}, ${student.name}` : student.name}
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-400 font-bold block">
                              DNI: {student.dni}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {getStatusBadge(existing?.statusMap[student.dni])}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(["Presente", "Tardanza", "Falta", "Justificado"] as const).map((status) => {
                            const isChosen = selected === status;
                            let activeClass = "";
                            if (isChosen) {
                              if (status === "Presente") activeClass = "bg-emerald-600 text-white shadow-xs font-black";
                              else if (status === "Tardanza") activeClass = "bg-amber-600 text-white shadow-xs font-black";
                              else if (status === "Falta") activeClass = "bg-rose-700 text-white shadow-xs font-black";
                              else if (status === "Justificado") activeClass = "bg-blue-600 text-white shadow-xs font-black";
                            } else {
                              activeClass = "bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold";
                            }

                            return (
                              <button
                                type="button"
                                key={status}
                                aria-pressed={isChosen}
                                onClick={() => mark(student.dni, status)}
                                className={`rounded-xl px-3 py-1.5 text-xs transition-all cursor-pointer active:scale-95 ${activeClass}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!effectiveStudents.length ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              No hay estudiantes matriculados en la carrera de este curso.
            </div>
          ) : null}
        </div>

        {/* Barra inferior de guardado */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-medium">
            Total matriculados en este grupo: <strong className="text-slate-800">{effectiveStudents.length} alumnos</strong>
          </span>

          <button
            type="button"
            onClick={save}
            disabled={!effectiveStudents.length || !Object.keys(draft).length || saving}
            className="bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{saving ? "Guardando en servidor..." : "Guardar Asistencia"}</span>
          </button>
        </div>
      </fieldset>
    </div>
  );
}
