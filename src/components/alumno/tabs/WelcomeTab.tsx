import React from "react";
import { Flame, Clock, FileText, CreditCard, BookOpen, CheckCircle2, Calendar } from "lucide-react";
import { StudentPersonalData, Enrollment, AcademicProgram } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface WelcomeTabProps {
  personalData: StudentPersonalData;
  currentProgram?: AcademicProgram;
  enrollment: Enrollment;
  setActiveTab: (tab: "welcome" | "profile" | "classes" | "schedule" | "attendance" | "closure" | "notas") => void;
  setProfileInnerTab: (tab: "docs" | "payments" | "academic") => void;
  studentTasks?: any[];
  mpaPlanningData?: any;
  studentGroup?: any;
  studentCourses?: any[];
}

export const WelcomeTab: React.FC<WelcomeTabProps> = ({
  personalData,
  currentProgram,
  enrollment,
  setActiveTab,
  setProfileInnerTab,
  studentTasks = [],
  mpaPlanningData,
  studentGroup,
  studentCourses = []
}) => {
  const currentPeriod = "I Periodo (2026-I)";

  // Find next class dynamically from studentTasks
  const nextTask = studentTasks && studentTasks.length > 0 ? studentTasks[0] : null;
  const nextCourse = nextTask && mpaPlanningData?.courses?.find((c: any) => c.id === nextTask.courseId);
  const nextClassroom = nextTask && mpaPlanningData?.classrooms?.find((c: any) => c.id === nextTask.classroomId);
  const nextClassText = nextTask
    ? `${nextCourse?.name || 'Unidad Didáctica'}, ${nextClassroom?.name || 'Aula Asignada'}`
    : "Programación oficial en curso por MPA";
  const nextClassTime = nextTask
    ? `${nextTask.dayOfWeek} ${nextTask.startTime}`
    : "Horario Regular";

  return (
    <PageTransition id="welcome" className="space-y-6">
      {/* Crimson Welcome Banner */}
      <div className="relative bg-[#800521] text-white rounded-xl shadow-lg p-6 md:p-8 overflow-hidden border-b-4 border-amber-500">
        <div className="absolute top-0 right-0 w-64 h-full bg-linear-gradient(135deg,transparent,rgba(255,255,255,0.05)) transform skew-x-12" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[10px] bg-red-900/60 text-amber-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-block border border-red-700/50">
            Portal del Estudiante • Periodo 2026-I
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black font-display tracking-tight leading-none pt-1">
            ¡Bienvenido de vuelta, {personalData.name}!
          </h2>
          <p className="text-xs text-slate-100 font-medium tracking-wide">
            Estamos contentos de tenerte en el IESTP San Francisco de Asís. Revisa tus asignaturas inscritas de Ciclo I, tu horario de clases oficial y tus estados administrativos de un vistazo.
          </p>
        </div>
        <Flame className="absolute right-6 bottom-4 w-28 h-28 text-red-900/30 font-black pointer-events-none stroke-[0.5]" />
      </div>

      {/* Subgrid: At a Glance Progress + Current Balance info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career progress card (Left Column) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-xs relative">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avance de Carrera Técnica</span>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2.5 py-0.5 rounded-full">
              Inicio de Formación • Ciclo I (0% Concluido)
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">
            {currentProgram?.name || "Electricidad Industrial"}
          </h3>

          {/* Horizontal Progress Meter Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
            <div className="bg-[#800521] h-full rounded-full transition-all duration-1000" style={{ width: "3%" }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-50">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-bold">Periodo Actual</span>
              <span className="text-[#9F062A] block font-bold text-sm mt-0.5">{currentPeriod}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-bold">Grupo / Sección</span>
              <span className="text-slate-800 block font-bold text-sm mt-0.5 truncate">
                {studentGroup?.name || "Ciclo I - Turno " + (enrollment.shift || "Mañana")}
              </span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-amber-50 rounded-lg p-2.5 flex items-center gap-2 border border-amber-100 shrink-0">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[8px] text-amber-700 uppercase font-black block leading-none">Próxima Sesión ({nextClassTime})</span>
                <span className="text-[10px] text-slate-800 font-bold block mt-1 truncate" title={nextClassText}>
                  {nextClassText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Quick balance card (Right Column) */}
        <div className="bg-[#FFFFFF] border border-slate-150 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Estado de Cuenta</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">S/. 0.00</span>
              <span className="text-xs text-emerald-600 font-bold">Al día</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
              No tienes pagos pendientes para el ciclo lectivo 2026-I. ¡Matrícula y cuotas institucionales al día!
            </p>
          </div>

          <button 
            onClick={() => {
              setActiveTab("profile");
              setProfileInnerTab("payments");
            }}
            className="w-full border border-slate-200 hover:border-[#800521] text-slate-700 hover:text-[#800521] font-bold py-2 rounded-lg text-xs text-center transition-all mt-6 cursor-pointer"
          >
            Ver Historial de Pagos
          </button>
        </div>
      </div>

      {/* Subgrid: Action Cards with Circular layout + Tareas Próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column with circular quick action items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => { setActiveTab("profile"); setProfileInnerTab("docs"); }}
              className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
            >
              <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase block">Expediente Digital</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Documentos y requisitos</p>
              </div>
            </div>

            <div 
              onClick={() => { setActiveTab("schedule"); }}
              className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
            >
              <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase block">Mi Horario</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Aulas y programación semanal</p>
              </div>
            </div>

            <div 
              onClick={() => { setActiveTab("classes"); }}
              className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
            >
              <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase block">Mis Asignaturas</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{studentCourses.length} cursos en Ciclo I</p>
              </div>
            </div>
          </div>

          {/* TAREAS PRÓXIMAS List */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-4">Actividades Académicas del Ciclo I</span>
            
            <div className="space-y-3">
              <div className="p-4 border border-emerald-100 bg-emerald-50/40 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Semana Inaugural de Clases • Ciclo I (2026-I)</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      No registra tareas pendientes de entrega. Asista puntualmente a sus talleres según su horario semanal asignado.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("classes")}
                  className="bg-[#800521] hover:bg-[#9F062A] text-white font-bold text-[10px] px-3.5 py-2 rounded-lg uppercase tracking-wider transition-all select-none cursor-pointer shrink-0"
                >
                  Ver Cursos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT NOTIFICATIONS SIDEBOARD (Right Column) */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Notificaciones Oficiales</span>
            <span className="bg-red-100 text-[#800521] font-black text-[9px] px-2 py-0.5 rounded-full uppercase leading-none">
              Institucional
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-3 pt-1">
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 leading-tight">Matrícula Oficial 2026-I Regularizada</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                Su matrícula académica en Ciclo I y asignación de sección han sido completadas con conformidad de Secretaría General.
              </p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Semestre 2026-I</span>
            </div>

            <div className="pt-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-[#800521] shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 leading-tight">Programación de Talleres y Aulas</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                Su horario de clases para el turno {enrollment.shift || "Mañana"} se encuentra sincronizado con el Módulo de Planificación Académica.
              </p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Campus Central</span>
            </div>

            <div className="pt-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 leading-tight">Acceso al Aula Virtual</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                Puede consultar el material de estudio, sílabos de cada asignatura y recursos en la pestaña "Mis Cursos".
              </p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Recursos Digitales</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
