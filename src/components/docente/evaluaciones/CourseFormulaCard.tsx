import React from "react";
import { Course } from "../../../types";
import { CourseFormula } from "../../../constants/courseFormulas";

export type { CourseFormula };

interface CourseFormulaCardProps {
  selectedCourse: Course;
  formula: CourseFormula;
  isMultiComponent?: boolean;
}

export const CourseFormulaCard: React.FC<CourseFormulaCardProps> = ({
  selectedCourse,
  formula,
  isMultiComponent = false
}) => {
  return (
    <div className="bg-[#800521] text-white p-5 rounded-2xl border-b-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-md relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-950/40" />
      <div className="relative z-10 space-y-1">
        <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded font-mono">
          Fórmula del Curso: Código {selectedCourse.code}
        </span>
        <h4 className="text-base font-black uppercase tracking-tight">{selectedCourse.name}</h4>
        <p className="text-[11px] font-mono text-slate-100 select-all font-bold">
          PROMEDIO ACTA = {isMultiComponent ? "0.60*(0.40*TEO + 0.40*TAL + 0.20*LAB) + 0.40*EX_FINAL" : formula.expression}
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap gap-2 shrink-0">
        {isMultiComponent ? (
          <>
            <div className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold border border-white/5 flex gap-1.5 justify-between">
              <span className="text-amber-300 font-mono">TEO:</span>
              <span>40% (2 CR)</span>
            </div>
            <div className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold border border-white/5 flex gap-1.5 justify-between">
              <span className="text-amber-300 font-mono">TAL:</span>
              <span>40% (2 CR)</span>
            </div>
            <div className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold border border-white/5 flex gap-1.5 justify-between">
              <span className="text-amber-300 font-mono">LAB:</span>
              <span>20% (1 CR)</span>
            </div>
            <div className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold border border-white/5 flex gap-1.5 justify-between">
              <span className="text-amber-300 font-mono">EX_FINAL:</span>
              <span>40%</span>
            </div>
          </>
        ) : (
          formula.variables.map((v) => (
            <div key={v.id} className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold border border-white/5 flex gap-1.5 justify-between">
              <span className="text-amber-300 font-mono">{v.id}:</span>
              <span>{(v.weight * 100).toFixed(0)}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
