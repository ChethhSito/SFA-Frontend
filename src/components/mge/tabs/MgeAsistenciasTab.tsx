import React, { useMemo, useState } from "react";
import { CheckSquare, Loader2, Calendar, Users, Check, AlertCircle, Clock, FileText, Filter } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Course, AttendanceRecord } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { academicToday } from "../../../utils/attendance";

interface Props {
  loading: boolean;
  error: string | null;
  onReload: () => Promise<boolean>;
  courses: Course[];
  processedStudents: ProcessedStudent[];
  attendance: AttendanceRecord[];
  selectedAttendanceCourseId: string;
  selectedAttendanceDate: string;
  onCourseChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onUpdateStudentAttendance: (dni: string, status: "Presente" | "Tardanza" | "Falta" | "Justificado") => void;
  onFillAttendanceAll: (status: "Presente" | "Falta") => void;
}

export default function MgeAsistenciasTab({
  loading,
  error,
  onReload,
  courses,
  processedStudents,
  attendance,
  selectedAttendanceCourseId,
  selectedAttendanceDate,
  onCourseChange,
  onDateChange,
  onUpdateStudentAttendance,
  onFillAttendanceAll,
}: Props) {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();

  // Filtros de Carrera y Ciclo
  const [filterCareer, setFilterCareer] = useState<string>("electricidad_industrial");
  const [filterCycle, setFilterCycle] = useState<string>("1");

  // Filtrar cursos oficiales consolidados
  const consolidatedOfficialCourses = useMemo(() => {
    const seen = new Set<string>();
    const list: Course[] = [];

    courses.forEach((c) => {
      if (
        c.code?.includes("-TEO") ||
        c.code?.includes("-TAL") ||
        c.code?.includes("-LAB") ||
        c.name?.includes("(Teoría)") ||
        c.name?.includes("(Taller)") ||
        c.name?.includes("(Laboratorio)")
      ) {
        return;
      }
      const baseCode = c.code?.trim();
      if (!baseCode || seen.has(baseCode)) return;
      seen.add(baseCode);
      list.push(c);
    });

    return list;
  }, [courses]);

  // Cursos filtrados
  const filteredCourses = useMemo(() => {
    return consolidatedOfficialCourses.filter((c) => {
      const isElectricidad =
        c.code?.startsWith("EIND") ||
        c.careerId === "electricidad_industrial" ||
        c.career === "electricidad_industrial" ||
        c.careerId === "electronica";
      const isContabilidad =
        c.code?.startsWith("CONT") ||
        c.code?.startsWith("CNT") ||
        c.careerId === "contabilidad" ||
        c.career === "contabilidad";

      if (filterCareer === "electricidad_industrial" && !isElectricidad) return false;
      if (filterCareer === "contabilidad" && !isContabilidad) return false;

      if (filterCycle !== "all") {
        const codeNum = c.code?.split("-")[1] || "";
        const cycleNum = codeNum.charAt(0);
        if (cycleNum && cycleNum !== filterCycle) return false;
      }
      return true;
    }).sort((a, b) => (a.code || "").localeCompare(b.code || ""));
  }, [consolidatedOfficialCourses, filterCareer, filterCycle]);

  const activeAttendanceRecord = attendance.find(
    (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
  );

  const course = courses.find((c) => c.id === selectedAttendanceCourseId) || filteredCourses[0];
  const studentsInAttendanceCourse = course
    ? processedStudents.filter(
        (s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === (course.careerId || course.career)
      )
    : [];

  // Métricas del día seleccionado
  const statusCounts = useMemo(() => {
    const counts = { Presente: 0, Tardanza: 0, Falta: 0, Justificado: 0, Pendiente: 0 };
    studentsInAttendanceCourse.forEach((st) => {
      const stStatus = activeAttendanceRecord?.statusMap[st.dni];
      if (stStatus === "Presente") counts.Presente++;
      else if (stStatus === "Tardanza") counts.Tardanza++;
      else if (stStatus === "Falta") counts.Falta++;
      else if (stStatus === "Justificado") counts.Justificado++;
      else counts.Pendiente++;
    });
    return counts;
  }, [studentsInAttendanceCourse, activeAttendanceRecord]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
        <Loader2 className="w-10 h-10 text-[#800521] animate-spin" />
        <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
          Cargando Asistencias del Servidor...
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          Sincronizando marcas de asistencia y asistencia acumulada
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="space-y-3 text-red-700 bg-red-50 p-6 rounded-2xl border border-red-200 text-xs">
        <p className="font-bold">{error}</p>
        <button
          type="button"
          onClick={() => { void onReload(); }}
          className="rounded-xl bg-red-700 text-white font-bold px-4 py-2 uppercase tracking-wider text-xs"
        >
          Reintentar Carga
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Selector de Asignatura y Fecha con Filtros */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-3xs space-y-4">
        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Carrera:</span>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterCareer("electricidad_industrial")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterCareer === "electricidad_industrial"
                    ? "bg-[#800521] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Electricidad Industrial
              </button>
              <button
                type="button"
                onClick={() => setFilterCareer("contabilidad")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterCareer === "contabilidad"
                    ? "bg-[#800521] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Contabilidad
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ciclo:</span>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(["1", "2", "3", "4", "5", "6", "all"] as const).map((cyc) => (
                <button
                  key={cyc}
                  type="button"
                  onClick={() => setFilterCycle(cyc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterCycle === cyc
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cyc === "all" ? "Todos" : `Ciclo ${cyc}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider block mb-1.5">
              1. Asignatura Curricular ({filteredCourses.length} cursos disponibles)
            </label>
            <select
              value={selectedAttendanceCourseId}
              onChange={(e) => onCourseChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 bg-white font-bold rounded-xl text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
            >
              {filteredCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider block mb-1.5">
              2. Fecha de la Sesión de Clases
            </label>
            <input
              type="date"
              value={selectedAttendanceDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full p-2.5 border border-slate-300 bg-white font-bold rounded-xl text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
            />
            {selectedAttendanceDate > academicToday() ? (
              <p role="status" className="mt-1.5 text-[10px] font-semibold text-amber-800">
                Sesión programada a futuro. Las marcas registradas se computarán formalmente en la fecha indicada.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Resumen Métrico de Asistencias del Día */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">Matriculados</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">{studentsInAttendanceCourse.length}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-3xs">
          <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider block">Presentes</span>
          <span className="text-lg font-black text-emerald-900 font-mono mt-0.5 block">{statusCounts.Presente}</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-3xs">
          <span className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider block">Tardanzas</span>
          <span className="text-lg font-black text-amber-900 font-mono mt-0.5 block">{statusCounts.Tardanza}</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-3xs">
          <span className="text-[9.5px] font-bold text-rose-800 uppercase tracking-wider block">Inasistencias</span>
          <span className="text-lg font-black text-rose-900 font-mono mt-0.5 block">{statusCounts.Falta}</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 shadow-3xs">
          <span className="text-[9.5px] font-bold text-blue-800 uppercase tracking-wider block">Justificados</span>
          <span className="text-lg font-black text-blue-900 font-mono mt-0.5 block">{statusCounts.Justificado}</span>
        </div>
      </div>

      {/* Tabla Oficial de Control de Asistencias */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-amber-500">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
              Registro de Asistencia Diaria • Sesión: {selectedAttendanceDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFillAttendanceAll("Presente")}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10.5px] uppercase font-black tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Marcar Todos Presentes
            </button>
            <button
              type="button"
              onClick={() => onFillAttendanceAll("Falta")}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-[10.5px] uppercase font-black tracking-wider transition-all cursor-pointer shadow-xs"
            >
              Marcar Todos Faltas
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                <th className="px-5 py-3.5">Estudiante</th>
                <th className="px-5 py-3.5">Carrera y Turno</th>
                <th className="px-5 py-3.5 text-center">Estado Registrado</th>
                <th className="px-5 py-3.5 text-right">Marcación Institucional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsInAttendanceCourse.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 font-extrabold uppercase tracking-wider">
                    No hay alumnos matriculados en la carrera de esta asignatura ({course?.career || "Electricidad Industrial"}).
                  </td>
                </tr>
              ) : (
                studentsInAttendanceCourse.map((st) => {
                  const currentStatus = activeAttendanceRecord?.statusMap[st.dni] || "";
                  const initials = `${st.name?.charAt(0) || ""}${st.lastName?.charAt(0) || ""}`.toUpperCase();

                  return (
                    <tr key={st.dni} className="hover:bg-slate-50/60 transition-colors">
                      {/* Estudiante */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#800521]/10 text-[#800521] font-black flex items-center justify-center text-xs shrink-0 font-mono">
                            {initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                            <div className="text-[10px] font-mono font-bold text-slate-500">DNI: {st.dni}</div>
                          </div>
                        </div>
                      </td>

                      {/* Carrera y Turno */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 text-xs">
                          {ACADEMIC_PROGRAMS.find((p) => p.id === st.programId)?.name || st.programId}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Turno {st.shift || "Mañana"}</span>
                      </td>

                      {/* Estado Registrado */}
                      <td className="px-5 py-3.5 text-center">
                        {!currentStatus ? (
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono uppercase">
                            Pendiente
                          </span>
                        ) : currentStatus === "Presente" ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                            Presente
                          </span>
                        ) : currentStatus === "Tardanza" ? (
                          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                            Tardanza
                          </span>
                        ) : currentStatus === "Falta" ? (
                          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                            Inasistencia
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                            Justificado
                          </span>
                        )}
                      </td>

                      {/* Marcación Segmentada */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 gap-1">
                          {(["Presente", "Tardanza", "Falta", "Justificado"] as const).map((opt) => {
                            const isSelected = currentStatus === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => onUpdateStudentAttendance(st.dni, opt)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  isSelected
                                    ? opt === "Presente"
                                      ? "bg-emerald-700 text-white shadow-xs"
                                      : opt === "Tardanza"
                                      ? "bg-amber-600 text-white shadow-xs"
                                      : opt === "Falta"
                                      ? "bg-rose-700 text-white shadow-xs"
                                      : "bg-blue-700 text-white shadow-xs"
                                    : "text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
