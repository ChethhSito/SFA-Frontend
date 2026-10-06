import React, { useState } from "react";
import { MpaCourse, MpaCurriculumItem } from "../../../types";
import { Search, PlusCircle, CheckCircle2 } from "lucide-react";

interface CourseListTableProps {
  courses: MpaCourse[];
  curriculum: MpaCurriculumItem[];
  curCareerId: string;
  curVersionId: string;
  onAddCourseToCycle: (courseId: string, cycleNumber: number) => void;
}

export function CourseListTable({
  courses,
  curriculum,
  curCareerId,
  curVersionId,
  onAddCourseToCycle
}: CourseListTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<number>(1);

  const mappedCourseIds = new Set(
    curriculum
      .filter(it => it.careerId === curCareerId && it.versionId === curVersionId)
      .map(it => it.courseId)
  );

  const filteredCourses = courses.filter(crs => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      (crs.name || "").toLowerCase().includes(q) ||
      (crs.code || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left space-y-4 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Catálogo Institucional de Cursos</h3>
          <p className="text-xs text-slate-500 font-medium">Asigne asignaturas rápidamente al plan de estudios según el ciclo seleccionado.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white outline-none focus:border-[#9F062A]"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black uppercase text-slate-400">Ciclo Destino:</span>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(Number(e.target.value))}
              className="bg-slate-50 border px-2 py-1 rounded text-xs font-black text-[#9F062A]"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>Ciclo {n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase text-[9.5px] font-black tracking-wider border-b">
              <th className="py-2.5 px-3">Código</th>
              <th className="py-2.5 px-3">Nombre de Asignatura</th>
              <th className="py-2.5 px-3 text-center">Créditos</th>
              <th className="py-2.5 px-3 text-center">Teoría / Lab</th>
              <th className="py-2.5 px-3 text-center">Estado Malla</th>
              <th className="py-2.5 px-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 font-bold uppercase text-[10px]">
                  No se encontraron cursos coincidentes
                </td>
              </tr>
            ) : (
              filteredCourses.map(crs => {
                const isMapped = mappedCourseIds.has(crs.id);
                return (
                  <tr key={crs.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{crs.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{crs.name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">{crs.credits} u.</td>
                    <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[10px]">
                      T: {crs.theoryHours ?? 2}h | L: {crs.labHours ?? 2}h
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isMapped ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mapeado
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!isMapped && (
                        <button
                          onClick={() => onAddCourseToCycle(crs.id, selectedCycle)}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-[#9F062A] hover:bg-[#800521] px-2.5 py-1 rounded transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <PlusCircle className="w-3 h-3" /> Agregar a C-{selectedCycle}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseListTable;
