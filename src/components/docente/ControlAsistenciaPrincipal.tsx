import React, { useState } from "react";
import { BookOpen, Calendar, Filter, Users, Search, HelpCircle, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import Badge from "../ui-custom/Badge";
import PageHeader from "../ui-custom/PageHeader";
import { Course, AttendanceRecord } from "@/types";
import { ROSTER } from "./DocenteTypes";

interface ControlAsistenciaPrincipalProps {
  courses: Course[];
  attendanceRecords: AttendanceRecord[];
}

export default function ControlAsistenciaPrincipal({
  courses,
  attendanceRecords,
}: ControlAsistenciaPrincipalProps) {
  // Query Filter States
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedStudentDni, setSelectedStudentDni] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Process global stats
  const totalStudents = ROSTER.length;
  
  // Calculate attendance counters
  let totalPresente = 0;
  let totalTardanza = 0;
  let totalFalta = 0;
  let totalJustificado = 0;

  // Track values from nested statusMaps
  attendanceRecords.forEach((record) => {
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
    : 94.2; // fallback

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
    let weekNum = 1;
    let sessionType = "Teoría";

    // Regex check week
    const weekMatch = record.id.match(/-w(\d+)-/);
    if (weekMatch) {
      weekNum = parseInt(weekMatch[1], 10);
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
      const student = ROSTER.find((s) => s.dni === dni);
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
    <div id="control-asistencia-report-screen" className="space-y-6 text-left">
      <PageHeader
        title="Consultar Historial de Asistencia"
        subtitle="Módulo de consulta consolidada. Filtre estadísticas de inasistencias y tardanzas de su carga académica."
        icon={<BarChart3 className="w-5 h-5 text-[#8B0026]" />}
      />

      {/* Aggregate metrics KPIs rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-150">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Quórum de Asistencia</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{attendanceRate.toFixed(1)}%</span>
            <span className="text-[9px] text-slate-400 font-bold block">Aceptable</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-150">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-sans">Tardanzas Registradas</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-500 font-mono">{totalTardanza}</span>
            <span className="text-[9px] text-slate-450 font-bold block uppercase">valores</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-150">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-sans">Faltas por Justificar</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-[#8B0026] font-mono">{totalFalta}</span>
            <span className="text-[9px] text-slate-450 font-semibold block">Inasistencias</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-150">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-sans">Faltas Justificadas</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-blue-600 font-mono">{totalJustificado}</span>
            <span className="text-[9px] text-slate-450 font-semibold block uppercase">Oficiales</span>
          </div>
        </Card>
      </div>

      {/* Multi-layered Filter Query Card */}
      <Card className="border border-slate-150">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
          <div>
            <CardTitle>Filtros de Búsqueda Académica</CardTitle>
            <CardDescription>Segmente el historial utilizando criterios cruzados</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs mt-2 sm:mt-0">
            <Filter className="w-4 h-4 text-[#8B0026]" />
            <span>Resultados: {compiledRows.length} registros</span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
            {/* Filter 1: Course */}
            <div>
              <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">Asignatura</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg font-semibold focus:outline-[#8B0026]"
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
              <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">Semana Silábica</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg font-semibold focus:outline-[#8B0026]"
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
              <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">Estudiante</label>
              <select
                value={selectedStudentDni}
                onChange={(e) => setSelectedStudentDni(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg font-semibold focus:outline-[#8B0026]"
              >
                <option value="all">Todos los Alumnos</option>
                {ROSTER.map((s) => (
                  <option key={s.dni} value={s.dni}>
                    {s.lastName}, {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 4: Date */}
            <div>
              <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">Buscar Fecha Específica</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg font-semibold focus:outline-[#8B0026]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query results spreadsheet */}
      <Card className="border border-slate-150">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase text-[9.5px] font-bold tracking-wider">
                <th className="py-3 px-5">Estudiante</th>
                <th className="py-3 px-3 font-mono">DNI</th>
                <th className="py-3 px-4">Asignatura / Curso</th>
                <th className="py-3 px-3 text-center">Semana</th>
                <th className="py-3 px-3">Sesión</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-5 text-center">Estado de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {compiledRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-450 italic font-bold">
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
                        S{row.weekNumber}
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
        </CardContent>
      </Card>
    </div>
  );
}

