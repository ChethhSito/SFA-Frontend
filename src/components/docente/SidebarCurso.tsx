import React, { useState, useEffect } from "react";
import { 
  BookOpen, ChevronDown, ChevronRight, FileText, Upload, Plus, Award, Users, AlertCircle, CheckCircle2, Clock
} from "lucide-react";

export type WeekOption = "asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias";

export type CourseSection = "general" | "horarios" | "week" | "cierre";

export interface SidebarCursoProps {
  courseId: string;
  courseName: string;
  courseCode: string;
  activeSection: CourseSection;
  selectedWeek: number;
  selectedWeekOption: WeekOption;
  onSelectGeneral: () => void;
  onSelectHorarios: () => void;
  onSelectCierre: () => void;
  onSelectWeekOption: (week: number, option: WeekOption) => void;
}

export function SemanaAccordion({
  weekNumber,
  isExpanded,
  onToggleExpanded,
  selectedOption,
  onSelectOption,
  isActiveWeek
}: {
  key?: any;
  weekNumber: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  selectedOption: WeekOption;
  onSelectOption: (option: WeekOption) => void;
  isActiveWeek: boolean;
}) {
  const options = [
    { id: "asistencia", label: "Asistencia", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "materiales", label: "Materiales", icon: <Upload className="w-3.5 h-3.5" /> },
    { id: "tareas", label: "Tareas", icon: <Plus className="w-3.5 h-3.5" /> },
    { id: "evaluaciones", label: "Evaluaciones", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "observaciones", label: "Observaciones", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    { id: "evidencias", label: "Evidencias", icon: <FileText className="w-3.5 h-3.5" /> }
  ] as const;

  return (
    <div className="border-b border-slate-200/50">
      <button
        onClick={onToggleExpanded}
        className={`w-full py-2.5 px-3 flex items-center justify-between transition-colors text-left text-[11px] font-extrabold ${
          isActiveWeek
            ? "bg-[#8B0026]/5 text-[#8B0026]"
            : "text-slate-750 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span className="tracking-wide">SEMANA {weekNumber}</span>
        <span>
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-slate-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-400" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="py-1 bg-white/40 pl-4 space-y-0.5">
          {options.map((opt) => {
            const isOptActive = isActiveWeek && selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-150 flex items-center gap-2 cursor-pointer text-[10.5px] font-bold ${
                  isOptActive
                    ? "bg-[#8D0C26]/10 text-[#8B0026] border-l-2 border-[#8B0026] font-black"
                    : "text-slate-550 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <span className={`${isOptActive ? "text-[#8B0026]" : "text-slate-400"}`}>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SidebarCurso({
  courseId,
  courseName,
  courseCode,
  activeSection,
  selectedWeek,
  selectedWeekOption,
  onSelectGeneral,
  onSelectHorarios,
  onSelectCierre,
  onSelectWeekOption
}: SidebarCursoProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: number]: boolean }>({
    1: true
  });

  useEffect(() => {
    if (activeSection === "week" && !expandedWeeks[selectedWeek]) {
      setExpandedWeeks((prev) => ({ ...prev, [selectedWeek]: true }));
    }
  }, [selectedWeek, activeSection]);

  const toggleWeekExpanded = (week: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  return (
    <aside className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 select-none text-left">
      {/* Current Course Code Header */}
      <div className="p-5 border-b border-slate-200 shrink-0">
        <span className="text-[9px] font-black text-[#8B0026] bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm select-none block w-max uppercase tracking-widest font-mono">
          Asignatura: {courseCode}
        </span>
        <h3 className="text-xs font-black text-slate-900 tracking-tight block mt-1.5 truncate uppercase" title={courseName}>
          {courseName}
        </h3>
        <p className="text-[9px] text-[#CFA020] font-bold tracking-wider uppercase block mt-1">
          Estructura Académica
        </p>
      </div>

      {/* Main Secondary Links Scroll Box */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        
        {/* GENERAL VIEW BUTTON */}
        <div className="p-2 shrink-0 space-y-1">
          <button
            onClick={onSelectGeneral}
            className={`w-full py-2.5 px-3 rounded-lg transition-all text-xs font-black uppercase text-left flex items-center gap-2 cursor-pointer ${
              activeSection === "general"
                ? "bg-[#8B0026] text-white shadow-sm font-black"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="tracking-wider font-extrabold text-[11px]">General (Resumen)</span>
          </button>

          {/* HORARIOS VIEW BUTTON */}
          <button
            onClick={onSelectHorarios}
            className={`w-full py-2.5 px-3 rounded-lg transition-all text-xs font-black uppercase text-left flex items-center gap-2 cursor-pointer ${
              activeSection === "horarios"
                ? "bg-[#8B0026] text-white shadow-sm font-black"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="tracking-wider font-extrabold text-[11px]">Horarios</span>
          </button>
        </div>

        {/* WEEKS ACCORDION LIST */}
        <div className="flex-1">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block px-4 py-2 mt-2">
            Desarrollo por Semanas
          </span>
          <div className="divide-y divide-slate-100 pb-4">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((weekNum) => (
              <SemanaAccordion
                key={weekNum}
                weekNumber={weekNum}
                isExpanded={!!expandedWeeks[weekNum]}
                onToggleExpanded={() => toggleWeekExpanded(weekNum)}
                selectedOption={selectedWeekOption}
                onSelectOption={(opt) => onSelectWeekOption(weekNum, opt)}
                isActiveWeek={activeSection === "week" && selectedWeek === weekNum}
              />
            ))}
          </div>
        </div>

        {/* COURSE CLOSURE BUTTON */}
        <div className="p-3 bg-slate-100/60 shrink-0">
          <button
            onClick={onSelectCierre}
            className={`w-full py-2.5 px-3 rounded-lg transition-all text-xs font-black uppercase tracking-wider text-left flex items-center gap-2 cursor-pointer ${
              activeSection === "cierre"
                ? "bg-[#8B0026] text-white shadow-sm"
                : "text-slate-700 hover:bg-white border hover:border-slate-350"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Cierre de Curso</span>
          </button>
        </div>

      </div>
    </aside>
  );
}
