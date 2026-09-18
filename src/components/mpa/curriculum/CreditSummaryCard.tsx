import React from "react";
import { MpaCurriculumItem, MpaCourse } from "../../../types";
import { BookOpen, Award, Clock, Layers } from "lucide-react";

interface CreditSummaryCardProps {
  curriculumItems: MpaCurriculumItem[];
  courses: MpaCourse[];
  selectedCareerName?: string;
  selectedVersionName?: string;
}

export function CreditSummaryCard({
  curriculumItems,
  courses,
  selectedCareerName,
  selectedVersionName
}: CreditSummaryCardProps) {
  const mappedCourses = curriculumItems.map(item => courses.find(c => c.id === item.courseId)).filter(Boolean) as MpaCourse[];

  const totalCourses = mappedCourses.length;
  const totalCredits = mappedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const totalTheoryHours = mappedCourses.reduce((sum, c) => sum + (c.theoryHours || 0), 0);
  const totalLabHours = mappedCourses.reduce((sum, c) => sum + (c.labHours || 0), 0);
  const totalHours = totalTheoryHours + totalLabHours;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Asignaturas Mapeadas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#9F062A]/10 text-[#9F062A] flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Asignaturas</span>
          <span className="text-xl font-black text-slate-900 font-mono">{totalCourses}</span>
          {selectedVersionName && (
            <span className="text-[9.5px] font-bold text-slate-500 block truncate">{selectedVersionName}</span>
          )}
        </div>
      </div>

      {/* 2. Total Créditos Académicos */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Créditos</span>
          <span className="text-xl font-black text-slate-900 font-mono">{totalCredits} <span className="text-xs font-bold text-slate-500">u.</span></span>
          <span className="text-[9.5px] font-bold text-slate-500 block">Distribución en 6 Ciclos</span>
        </div>
      </div>

      {/* 3. Horas Pedagógicas Totales */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Horas Cronológicas</span>
          <span className="text-xl font-black text-slate-900 font-mono">{totalHours} <span className="text-xs font-bold text-slate-500">hrs.</span></span>
          <span className="text-[9.5px] font-bold text-slate-500 block">T: {totalTheoryHours}h | L: {totalLabHours}h</span>
        </div>
      </div>

      {/* 4. Especialidad SFA */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Carrera / Plan</span>
          <span className="text-xs font-black text-slate-900 block truncate">{selectedCareerName || "SFA Especialidad"}</span>
          <span className="text-[9.5px] font-bold text-emerald-600 block uppercase">Estructura Modular VI</span>
        </div>
      </div>
    </div>
  );
}

export default CreditSummaryCard;
