import React, { useState, useEffect } from "react";
import { 
  BookOpen, ChevronDown, ChevronRight, FileText, Upload, Plus, Award, Users, AlertCircle, CheckCircle2, Clock
} from "lucide-react";

export type WeekOption = "asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias";

export type CourseSection = "general" | "horarios" | "week" | "cierre";

export interface SidebarCursoAlumnoProps {
  courseCode: string;
  courseName: string;
  componentBadge?: { label: string; className: string } | null;
  hasMultipleComponents?: boolean;
  onChangeComponent?: () => void;
  activeSection: CourseSection;
  selectedWeek: number;
  selectedWeekOption: WeekOption;
  onSelectGeneral: () => void;
  onSelectHorarios: () => void;
  onSelectCierre: () => void;
  onSelectWeekOption: (week: number, option: WeekOption) => void;
  onBackToCourses: () => void;
}

export function SemanaAccordionAlumno({
  weekNumber,
  isExpanded,
  onToggleExpanded,
  selectedOption,
  onSelectOption,
  isActiveWeek
}: {
  key?: React.Key;
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
    <div className="border-b border-rose-100/70">
      <button
        onClick={onToggleExpanded}
        className={`w-full py-2.5 px-3 flex items-center justify-between transition-colors text-left text-[11px] font-extrabold cursor-pointer ${
          isActiveWeek
            ? "bg-rose-100/70 text-[#800521] border-l-2 border-[#800521]"
            : "text-slate-700 hover:bg-rose-50/60 hover:text-[#800521]"
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
        <div className="py-1 bg-white/60 pl-4 space-y-0.5">
          {options.map((opt) => {
            const isOptActive = isActiveWeek && selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all duration-150 flex items-center gap-2 cursor-pointer text-[10.5px] font-bold ${
                  isOptActive
                    ? "bg-[#8D0C26]/10 text-[#8B0026] border-l-2 border-[#8B0026] font-black"
                    : "text-slate-600 hover:bg-rose-50/50 hover:text-slate-950"
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

export default function SidebarCursoAlumno({
  courseCode,
  courseName,
  componentBadge,
  hasMultipleComponents,
  onChangeComponent,
  activeSection,
  selectedWeek,
  selectedWeekOption,
  onSelectGeneral,
  onSelectHorarios,
  onSelectCierre,
  onSelectWeekOption,
  onBackToCourses
}: SidebarCursoAlumnoProps) {
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

  const upperCode = (courseCode || "").toUpperCase();
  const badge = componentBadge || (
    upperCode.includes("TEO")
      ? { label: "Teoría", className: "text-[#800521] bg-[#800521]/10 border-[#800521]/20" }
      : upperCode.includes("TAL")
      ? { label: "Taller", className: "text-amber-800 bg-amber-50 border-amber-200" }
      : upperCode.includes("LAB")
      ? { label: "Laboratorio", className: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      : null
  );

  return (
    <aside className="w-64 h-full bg-[#FFFBFB] border-r border-rose-200/90 flex flex-col shrink-0 select-none text-left">
      {/* Top institutional color stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#800521] via-amber-500 to-[#800521] shrink-0" />

      {/* Current Course Code Header with reddish institutional styling */}
      <div className="p-4 border-b border-rose-100 bg-gradient-to-b from-rose-50/70 to-[#FFFBFB] shrink-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] font-black text-[#800521] bg-rose-100/90 border border-rose-250 px-2 py-0.5 rounded-sm select-none block w-max uppercase tracking-widest font-mono shadow-2xs">
            {courseCode}
          </span>
          {badge && (
            <span className={`text-[8.5px] font-black border px-1.5 py-0.5 rounded uppercase font-mono ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
        <h3 className="text-xs font-black text-slate-900 tracking-tight block mt-1.5 leading-snug break-words uppercase" title={courseName}>
          {courseName}
        </h3>
        <p className="text-[9px] text-[#800521] font-bold tracking-wider uppercase block mt-1">
          Estructura Académica
        </p>


      </div>

      {/* Main Secondary Links Scroll Box */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-rose-100/60 pr-0.5">
        
        {/* GENERAL VIEW BUTTON */}
        <div className="p-2 shrink-0 space-y-1">
          <button
            onClick={onSelectGeneral}
            className={`w-full py-2.5 px-3 rounded-lg transition-all text-xs font-black uppercase text-left flex items-center gap-2 cursor-pointer ${
              activeSection === "general"
                ? "bg-[#800521] text-white shadow-sm font-black"
                : "text-slate-700 hover:bg-rose-50/70 hover:text-[#800521]"
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
                ? "bg-[#800521] text-white shadow-sm font-black"
                : "text-slate-700 hover:bg-rose-50/70 hover:text-[#800521]"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="tracking-wider font-extrabold text-[11px]">Horarios Lectivos</span>
          </button>
        </div>

        {/* WEEKS ACCORDION LIST */}
        <div className="flex-1">
          <span className="text-[9px] text-[#800521] font-black uppercase tracking-widest block px-4 py-2 mt-2">
            Desarrollo por Semanas
          </span>
          <div className="divide-y divide-rose-100/60 pb-4">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((weekNum) => (
              <SemanaAccordionAlumno
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

        {/* COURSE STATUS BUTTON */}
        <div className="p-3 bg-slate-100/60 shrink-0">
          <button
            onClick={onSelectCierre}
            className={`w-full py-2.5 px-3 rounded-lg transition-all text-xs font-black uppercase tracking-wider text-left flex items-center gap-2 cursor-pointer ${
              activeSection === "cierre"
                ? "bg-[#8B0026] text-white shadow-sm font-black"
                : "text-slate-700 hover:bg-white border hover:border-slate-350"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Estado de Curso</span>
          </button>
        </div>

      </div>

      {/* Footer Action: Back to Courses list */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0">
        <button
          onClick={onBackToCourses}
          className="w-full bg-slate-100 hover:bg-slate-200 text-[#800521] border border-slate-200/60 rounded-lg text-[10px] font-black py-2.5 flex items-center justify-center gap-1.5 select-none uppercase transition-all cursor-pointer"
        >
          ← Volver a Mis Cursos
        </button>
      </div>
    </aside>
  );
}
