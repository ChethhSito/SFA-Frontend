import React, { useState } from "react";
import { BookOpen, Calendar, Filter, Users, Search, HelpCircle, BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Clock3, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import { Course, AttendanceRecord, StudentPersonalData } from "../../types";

interface ControlAsistenciaPrincipalProps {
  students: StudentPersonalData[];
  loading: boolean;
  error: string | null;
  onReload: () => Promise<boolean>;
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
}

export default function ControlAsistenciaPrincipal({
  students,
  loading,
  error,
  onReload,
  courses,
  attendanceRecords,
}: ControlAsistenciaPrincipalProps) {
  // Query Filter States
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedStudentDni, setSelectedStudentDni] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Process global stats
  const totalStudents = new Set(attendanceRecords.filter((record) => courses.some((course) => course.id === record.courseId)).flatMap((record) => Object.keys(record.statusMap))).size;
  
  // Calculate attendance counters
  let totalPresente = 0;
  let totalTardanza = 0;
  let totalFalta = 0;
  let totalJustificado = 0;

  // Track values from nested statusMaps
  const relevantRecords = attendanceRecords.filter((record) => courses.some((course) => course.id === record.courseId));
  relevantRecords.forEach((record) => {
    Object.values(record.statusMap).forEach((status) => {
      if (status === "Presente") totalPresente++;
      else if (status === "Tardanza") totalTardanza++;
      else if (status === "Falta") totalFalta++;
      else if (status === "Justificado") totalJustificado++;
    });
  });

  const totalStatesCount = totalPresente + totalTardanza + totalFalta + totalJustificado;
  const attendanceRate = totalStatesCount > 0 
    ? ((totalPresente + totalTardanza + totalJustificado) / totalStatesCount) * 100 
    : 0;

  // Apply filters to compile a flattened list of attendance transactions
  interface CompiledAttendanceRow {
    id: string;
    courseCode: string;
    courseName: string;
    weekNumber: number;
    sessionType: string;
    date: string;
    studentName: string;
    studentLastName: string;
    studentDni: string;
    status: "Presente" | "Tardanza" | "Falta" | "Justificado";
  }

  const compiledRows: CompiledAttendanceRow[] = [];

  attendanceRecords.forEach((record) => {
    // Determine course details
    const course = courses.find((c) => c.id === record.courseId);
    if (!course) return;

    // Parse week and session typed from ID: `att-${courseId}-w${week}-${session}`
    const idParts = record.id.split("-");
    let weekNum = record.week || 0;
    let sessionType = "Registro diario";

    // Regex check week
    const weekMatch = record.id.match(/-w(\d+)-/);
    if (weekMatch) {
      weekNum = record.week || parseInt(weekMatch[1], 10);
    }
    if (record.id.toLowerCase().includes("-laboratorio") || record.id.toLowerCase().includes("lab")) {
      sessionType = "Laboratorio";
    }

    // Filter course
    if (selectedCourseId !== "all" && record.courseId !== selectedCourseId) return;

    // Filter week
    if (selectedWeek !== "all" && weekNum.toString() !== selectedWeek) return;

    // Filter date
    if (selectedDate && record.date !== selectedDate) return;

    // Build subrows for each student matching state
    Object.keys(record.statusMap).forEach((dni) => {
      const student = students.find((s) => s.dni === dni);
      if (!student) return;

      // Filter student
      if (selectedStudentDni !== "all" && dni !== selectedStudentDni) return;

      compiledRows.push({
        id: `${record.id}-${dni}`,
        courseCode: course.code,
        courseName: course.name,
        weekNumber: weekNum,
        sessionType: sessionType,
        date: record.date,
        studentName: student.name,
        studentLastName: student.lastName,
        studentDni: dni,
        status: record.statusMap[dni] as any,
      });
    });
  });

  return (
    <div id="control-asistencia-report-screen" className="space-y-6 text-left font-sans">
      {/* 1. Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL DOCENTE • QUÓRUM Y SEGUIMIENTO ACADÉMICO
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Control Consolidado de Asistencia
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Consulte el historial de asistencias, tardanzas e inasistencias de los estudiantes matriculados en sus cursos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Quórum Global</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {totalStatesCount ? `${attendanceRate.toFixed(1)}%` : "100.0%"}
              </span>
            </div>
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Cursos Activos</span>
              <span className="text-xs font-black text-white font-mono">{courses.length} Materias</span>
            </div>
          </div>
        </div>

        {/* Cinta de Parámetros */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <Clock3 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Tolerancia Ingreso</span>
              <span className="font-extrabold text-white">15 Minutos Oficiales</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Estudiantes en Carga</span>
              <span className="font-extrabold text-white">{totalStudents || students.length} Alumnos</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Inasistencia Límite</span>
              <span className="font-extrabold text-white">30% (Desaprobado por DPI)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Validación</span>
              <span className="font-extrabold text-white">Registro en Acta Diaria</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? <p role="status">Cargando asistencias...</p> : null}
      {error ? <div role="alert" className="text-red-700"><p>{error}</p><button type="button" onClick={() => { void onReload(); }}>Reintentar carga</button></div> : null}
      
      {/* Aggregate metrics KPIs rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Quórum de Asistencia</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{totalStatesCount ? `${attendanceRate.toFixed(1)}%` : "100%"}</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded uppercase">Regular</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Tardanzas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-600 font-mono">{totalTardanza}</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded uppercase">Sesiones</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Inasistencias Sin Justificar</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-[#800521] font-mono">{totalFalta}</span>
            <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded uppercase">Faltas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-5 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Faltas Justificadas</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-sky-600 font-mono">{totalJustificado}</span>
            <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded uppercase">Justificadas</span>
          </div>
        </div>
      </div>

      {/* Multi-layered Filter Query Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900">Filtros de Búsqueda Académica</h3>
            <p className="text-xs text-slate-500">Segmente el historial utilizando criterios cruzados.</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-[#800521]" />
            <span>{compiledRows.length} registro{compiledRows.length === 1 ? '' : 's'} encontrado{compiledRows.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
          {/* Filter 1: Course */}
          <div>
            <label className="block text-slate-500 uppercase text-[10px] mb-1 font-black">Asignatura</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todas las Asignaturas</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.code}] {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 2: Week */}
          <div>
            <label className="block text-slate-500 uppercase text-[10px] mb-1 font-black">Semana Silábica</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todas las Semanas (1 a 16)</option>
              {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w.toString()}>
                  Semana {w}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Student */}
          <div>
            <label className="block text-slate-500 uppercase text-[10px] mb-1 font-black">Estudiante</label>
            <select
              value={selectedStudentDni}
              onChange={(e) => setSelectedStudentDni(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">Todos los Alumnos</option>
              {students.map((s) => (
                <option key={s.dni} value={s.dni}>
                  {s.lastName}, {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Date */}
          <div>
            <label className="block text-slate-500 uppercase text-[10px] mb-1 font-black">Buscar Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Query results spreadsheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden text-left">
        <div className="overflow-x-auto select-text">
          <table className="w-full text-left text-xs font-medium border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                <th className="py-3.5 px-5">Estudiante</th>
                <th className="py-3.5 px-3 font-mono">DNI</th>
                <th className="py-3.5 px-4">Asignatura / Curso</th>
                <th className="py-3.5 px-3 text-center">Semana</th>
                <th className="py-3.5 px-3">Sesión</th>
                <th className="py-3.5 px-3">Fecha</th>
                <th className="py-3.5 px-5 text-center">Estado de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-sans text-xs">
              {compiledRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic font-bold">
                    No se encontraron registros de asistencia que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                compiledRows.map((row) => {
                  let badgeVariant: "success" | "warning" | "danger" | "info" = "success";
                  if (row.status === "Tardanza") badgeVariant = "warning";
                  if (row.status === "Falta") badgeVariant = "danger";
                  if (row.status === "Justificado") badgeVariant = "info";

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-extrabold text-slate-800 uppercase block">
                          {row.studentLastName}, {row.studentName}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-450 font-semibold">
                        {row.studentDni}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700 block truncate max-w-[180px]" title={row.courseName}>
                          {row.courseName}
                        </span>
                        <span className="font-mono text-[9px] bg-slate-105 bg-slate-100 px-1.5 py-0.5 text-slate-500 rounded font-bold">
                          {row.courseCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-800 text-center font-mono">
                        {row.weekNumber ? `S${row.weekNumber}` : "Sin registrar"}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold text-slate-500 text-[10.5px]">
                          {row.sessionType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500 font-semibold">
                        {row.date}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <Badge variant={badgeVariant} className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider font-extrabold">
                          {row.status}
                        </Badge>
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
