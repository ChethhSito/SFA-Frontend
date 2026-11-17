import React from "react";
import { CheckCircle2, Printer, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Cell, PieChart, Pie, Legend
} from "recharts";
import { 
  MpaCareer, MpaCurriculumItem, MpaProgramTask, 
  MpaAcademicGroup, MpaCourse, MpaClassroom 
} from "../../../types";
import { PageTransition } from "../PageTransition";

interface ReportsTabProps {
  careers: MpaCareer[];
  curriculum: MpaCurriculumItem[];
  tasks: MpaProgramTask[];
  groups: MpaAcademicGroup[];
  courses: MpaCourse[];
  teachers: any[];
  classrooms: MpaClassroom[];
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function ReportsTab({
  careers,
  curriculum,
  tasks,
  groups,
  courses,
  teachers,
  classrooms,
  notify
}: ReportsTabProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      notify?.("Por favor habilitar ventanas emergentes para continuar.", "warning");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Planificación Académica - MPA SFA</title>
          <style>
            body { font-family: sans-serif; padding: 30px; font-size: 13px; line-height: 1.5; color: #333; }
            h1 { color: #8B0026; margin-bottom: 5px; font-size: 20px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>IESTP San Francisco de Asís</h1>
          <p><strong>MÓDULO DE PLANIFICACIÓN ACADÉMICA (MPA)</strong></p>
          <p>Fecha de emisión: ${new Date().toLocaleDateString("es-PE")} | Total clases: ${tasks.length}</p>
          <table>
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Tipo</th>
                <th>Aula</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(t => {
                const gName = groups.find(x => x.id === t.groupId)?.name || t.groupId;
                const cName = courses.find(x => x.id === t.courseId)?.name || t.courseId;
                const tName = teachers.find(x => x.dni === t.teacherDni)?.name || t.teacherDni;
                const rName = classrooms.find(x => x.id === t.classroomId)?.name || t.classroomId;
                return `
                  <tr>
                    <td><strong>${gName}</strong></td>
                    <td>${cName}</td>
                    <td>${tName}</td>
                    <td>${t.sessionType}</td>
                    <td>${rName}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <PageTransition id="reports" className="p-5 md:p-6 space-y-6 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sesiones Planificadas</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {tasks.length} Cargas Semanales
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Carreras Monitoreadas</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              {careers.length} Especialidades
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Docentes Activos</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              {teachers.length} en Plana
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="shrink-0 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer border bg-[#800521] hover:bg-[#67041a] text-white border-[#800521]"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Generar Reporte Imprimible</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Recharts BarChart - Cursos en Carrera */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#9F062A]" />
            Cursos Asociados por Especialidad
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={careers.map(car => ({
                  name: car.code,
                  cursos: curriculum.filter(it => it.careerId === car.id).length
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748B" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="cursos" fill="#9F062A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Programaciones vs Disponibilidad */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 font-sans justify-between flex items-center">
            <span className="flex items-center gap-2">
              <PieChartIcon className="w-3.5 h-3.5 text-[#9F062A]" />
              Topología de Servicios Programados
            </span>
            <span className="text-[9px] font-bold text-[#9F062A] bg-[#9F062A]/10 px-2 py-0.5 rounded uppercase font-mono">
              Teoría vs Laboratorio
            </span>
          </h4>
          <div className="h-64 flex items-center justify-center">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No hay programaciones cargadas para cuantificar.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Teoría", value: tasks.filter(t => t.sessionType === "Teoría").length },
                      { name: "Laboratorio", value: tasks.filter(t => t.sessionType === "Laboratorio").length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#9F062A" />
                    <Cell fill="#CFA020" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Auditoria / Export area */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4 shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-[#9F062A] mx-auto opacity-80" />
          <h4 className="text-sm font-black text-slate-900 uppercase">Exportar Reporte Oficial de Planificación</h4>
          <p className="text-slate-500 text-xs font-medium max-w-xl mx-auto leading-relaxed">
            Este documento contiene de manera ordenada los códigos de asignaturas vinculados, docentes, horarios y laboratorios, listo para ser entregado a la Mesa Académica Institucional del IESTP San Francisco de Asís.
          </p>
          <div className="pt-1">
            <button 
              onClick={handlePrint}
              className="bg-[#9F062A] hover:bg-[#800521] text-white py-2.5 px-6 rounded-xl font-black uppercase text-[10.5px] tracking-widest shadow-xs transition-all cursor-pointer flex items-center gap-2 mx-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Horarios Consolidados</span>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
