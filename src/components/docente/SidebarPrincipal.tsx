import React, { useState } from "react";
import { 
  Users, BookOpen, Clock, FileText, CheckCircle, 
  Upload, Plus, Save, Award, Trash2, Calendar, LayoutDashboard, LogOut, GraduationCap, ChevronDown, ChevronRight, Settings, BarChart3, Megaphone, FileSpreadsheet
} from "lucide-react";
import { Course } from "@/types";
import Badge from "../ui-custom/Badge";

export interface SidebarPrincipalProps {
  teacherDni: string;
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function SidebarPrincipal({
  teacherDni,
  courses,
  selectedCourseId,
  onSelectCourse,
  activeTab,
  setActiveTab,
  onLogout
}: SidebarPrincipalProps) {
  // Hardcoded teacher details per prompt guidelines
  const teacherInfo = {
    name: "Miguel Ángel Ramos Torres",
    role: "Docente de Ingeniería y Automatización",
    status: "ACTIVO",
    specialty: "Sistemas & Automatización Industrial"
  };

  const getInitials = (name: string) => {
    return "MR";
  };

  // Seven requested items in EXACT order:
  // 1. Dashboard
  // 2. Mis Cursos
  // 3. Control de Asistencia
  // 4. Avisos y Reportes
  // 5. Evaluaciones de Cursos
  // 6. Configuración
  // 7. Cerrar Sesión

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "cursos", label: "Mis Cursos", icon: <BookOpen className="w-4 h-4" /> },
    { id: "control_asistencia", label: "Control de Asistencia", icon: <Users className="w-4 h-4" /> },
    { id: "avisos_reportes", label: "Avisos y Reportes", icon: <Megaphone className="w-4 h-4" /> },
    { id: "evaluaciones_cursos", label: "Evaluaciones de Cursos", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "configuracion", label: "Configuración", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-100 flex flex-col shrink-0 select-none text-left">
      {/* SFA Logo Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-150/40">
        <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 border border-[#8B0026]/10">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h1 className="text-sm font-black text-[#8B0026] tracking-tight leading-none uppercase">
            IESTP SFA
          </h1>
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block mt-1">
            Portal Docente
          </span>
        </div>
      </div>

      {/* Docente Profile Card */}
      <div className="px-4 py-4 mt-1">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left relative overflow-hidden transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-400 text-slate-900 border border-amber-300 rounded-full flex items-center justify-center font-black text-xs shrink-0 tracking-tight">
              {getInitials(teacherInfo.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[11.5px] font-black text-slate-800 leading-tight block truncate" title={teacherInfo.name}>
                {teacherInfo.name}
              </h4>
              <span className="text-[9.5px] text-slate-500 font-semibold block truncate mt-0.5" title={teacherInfo.role}>
                {teacherInfo.role}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">ESTADO:</span>
            <Badge variant="success" className="font-extrabold tracking-wider px-2 py-0.5 text-[9px] uppercase border">
              {teacherInfo.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Primary Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        <div>
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block px-2.5 mb-2">
            CONSOLA DOCENTE
          </span>

          <div className="space-y-1">
            {menuItems.map((item) => {
              // Active if either selectedCourseId is null and activeTab is correct
              // or for course tab if explicitly clicked "Mis Cursos"
              const isActive = (selectedCourseId === null || item.id === "cursos") && activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCourse(null);
                    setActiveTab(item.id);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center gap-3 cursor-pointer text-xs font-semibold ${
                    isActive
                      ? "bg-[#8B0026] text-white font-bold shadow-md border border-red-900/10"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <span className={`w-4 h-4 shrink-0 flex items-center justify-center transition-colors ${isActive ? "text-amber-400" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  <span className="truncate tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logout Action Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40 shrink-0">
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-transparent hover:bg-rose-50 text-slate-600 hover:text-[#8B0026] text-xs font-black uppercase transition-all flex items-center justify-center gap-2 tracking-wider border border-transparent hover:border-red-100 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

