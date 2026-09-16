import React, { useMemo } from "react";
import { BarChart2, CheckSquare, CreditCard, Download, UserCheck, Users } from "lucide-react";
import { ACADEMIC_PROGRAMS } from "../../../mockData";
import { Card } from "../../ui/Card";
import { Enrollment, ProgramId } from "../../../types";

interface Props {
  enrollments: Enrollment[];
  onDownload: () => void;
}

export default function MgeReportesTab({ enrollments, onDownload }: Props) {
  const statsOverview = useMemo(() => {
    const totalMatriculados = enrollments.filter((e) => e.academicStatus === "MATRICULADO").length;
    const totalAdmitidos = enrollments.filter((e) => e.academicStatus === "ADMITIDO").length;
    const pagosValidados = enrollments.filter((e) => e.paymentStatus === "Validado").length;
    const recaudadoSoles = pagosValidados * 250;

    const careerCounts: { [key in ProgramId]?: number } = {};
    enrollments.forEach((e) => {
      if (e.academicStatus === "MATRICULADO") {
        careerCounts[e.programId] = (careerCounts[e.programId] || 0) + 1;
      }
    });

    return { totalMatriculados, totalAdmitidos, pagosValidados, recaudadoSoles, careerCounts };
  }, [enrollments]);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-150 shadow-3xs p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Matriculados Activos</p>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">{statsOverview.totalMatriculados}</p>
            </div>
            <UserCheck className="w-8 h-8 text-[#9F062A]" />
          </div>
        </Card>

        <Card className="border border-slate-150 shadow-3xs p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Pre-Inscritos / Admitidos</p>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">{statsOverview.totalAdmitidos}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="border border-slate-150 shadow-3xs p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Recibos de Matrícula</p>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">{statsOverview.pagosValidados}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-emerald-600" />
          </div>
        </Card>

        <Card className="border border-slate-150 shadow-3xs p-4 bg-[#9F062A]/5 border-[#9F062A]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-[#9F062A] uppercase tracking-widest leading-none">Caja: Total Matriculación</p>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">S/. {statsOverview.recaudadoSoles}</p>
            </div>
            <CreditCard className="w-8 h-8 text-[#9F062A]" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career distribution bar chart */}
        <div className="border border-slate-205 rounded-xl p-5 bg-white space-y-4 shadow-3xs">
          <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#9F062A]" />
            Matrícula por Especialidades Profesionales
          </h4>

          <div className="space-y-3.5">
            {ACADEMIC_PROGRAMS.map((prog) => {
              const count = statsOverview.careerCounts[prog.id] || 0;
              const maxCount = Math.max(...(Object.values(statsOverview.careerCounts) as number[]), 1);
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <div key={prog.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate text-[11px] block">{prog.name}</span>
                    <span className="font-mono">{count} Alum.</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#9F062A] h-2 rounded-full transition-all" style={{ width: `${percentage || 5}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance compliance metrics */}
        <div className="border border-slate-205 rounded-xl p-5 bg-white space-y-4 shadow-3xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#9F062A]" />
              Tasa de Asistencia General Promedio
            </h4>
            <p className="text-[11px] text-slate-450 font-semibold leading-relaxed mt-1">
              Control de cumplimiento en horas pedagógicas efectivas según los lineamientos del Ministerio de Educación (MINEDU).
            </p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <span className="text-5xl font-black font-mono text-[#9F062A]">94.8%</span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Nivel Óptimo (Supera el 85% Minedu)
            </span>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block">Reportes Pendientes</span>
              <span className="font-bold text-slate-700">03 Mapeos de Aula</span>
            </div>
            <button
              onClick={onDownload}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-extrabold uppercase rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Consolidado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
