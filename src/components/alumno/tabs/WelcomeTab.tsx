import React from "react";
import { Flame, Clock, FileText, CreditCard, BookOpen, ShieldAlert, CheckCircle } from "lucide-react";
import { StudentPersonalData, Enrollment, AcademicProgram } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface WelcomeTabProps {
  personalData: StudentPersonalData;
  currentProgram?: AcademicProgram;
  enrollment: Enrollment;
  setActiveTab: (tab: "welcome" | "profile" | "classes" | "schedule" | "attendance" | "closure" | "notas") => void;
  setProfileInnerTab: (tab: "docs" | "payments" | "academic") => void;
}

export const WelcomeTab: React.FC<WelcomeTabProps> = ({
  personalData,
  currentProgram,
  enrollment,
  setActiveTab,
  setProfileInnerTab
}) => {
  return (
    <PageTransition id="welcome" className="space-y-6">
      {/* Crimson Welcome Banner */}
      <div className="relative bg-[#800521] text-white rounded-xl shadow-lg p-6 md:p-8 overflow-hidden border-b-4 border-amber-500">
        <div className="absolute top-0 right-0 w-64 h-full bg-linear-gradient(135deg,transparent,rgba(255,255,255,0.05)) transform skew-x-12" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="text-[10px] bg-red-900/60 text-amber-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-block border border-red-700/50">
            Dashboard de Estudiante
          </span>
          <h2 className="text-2xl md:text-3.5xl font-black font-display tracking-tight leading-none pt-1">
            ¡Bienvenido de vuelta, {personalData.name}!
          </h2>
          <p className="text-xs text-slate-100 font-medium tracking-wide">
            Estamos contentos de verte hoy. Revisa tus clases pendientes, el progreso de tu carrera técnica y tus estados administrativos de un vistazo.
          </p>
        </div>
        <Flame className="absolute right-6 bottom-4 w-28 h-28 text-red-900/30 font-black pointer-events-none stroke-[0.5]" />
      </div>

      {/* Subgrid: At a Glance Progress + Current Balance info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career progress card (Left Column) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-xs relative">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Career at a Glance</span>
            <span className="text-xs bg-[#800521]/10 text-[#800521] font-extrabold px-2.5 py-0.5 rounded-full">
              65% Progreso Total
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">
            {currentProgram?.name || "Electricidad Industrial"}
          </h3>

          {/* Horizontal Progress Meter Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
            <div className="bg-[#800521] h-full rounded-full transition-all duration-1000" style={{ width: "65%" }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-50">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-bold">Periodo Actual</span>
              <span className="text-[#9F062A] block font-bold text-sm mt-0.5">V Periodo</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase block font-bold">Sede Principal</span>
              <span className="text-slate-805 block font-bold text-sm mt-0.5">Campus Central</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-amber-50 rounded-lg p-2 flex items-center gap-2 border border-amber-100 shrink-0">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[8px] text-amber-700 uppercase font-black block leading-none">Próxima Clase (15 min)</span>
                <span className="text-[10px] text-slate-800 font-bold block mt-1">Sistemas de Control II, Lab B-302</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Quick balance card (Right Column) */}
        <div className="bg-[#FFFFFF] border border-slate-150 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Current Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 tracking-tight">S/. 0.00</span>
              <span className="text-xs text-emerald-600 font-bold">Al día</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
              No tienes pagos pendientes para el ciclo lectivo en curso. ¡Gran trabajo manteniendo tus obligaciones institucionales al día!
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
                <h4 className="text-xs font-bold text-slate-800 uppercase block">Carga Documental</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sube tus archivos requisito</p>
              </div>
            </div>

            <div 
              onClick={() => { setActiveTab("profile"); setProfileInnerTab("payments"); }}
              className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
            >
              <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase block">Matrícula</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Proceso de inscripción regular</p>
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
                <h4 className="text-xs font-bold text-slate-800 uppercase block">Aula Virtual</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Accede a tus cursos y tareas</p>
              </div>
            </div>
          </div>

          {/* TAREAS PRÓXIMAS List */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-4">Tareas Próximas</span>
            
            <div className="space-y-3">
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Lab 04: Motores Trifásicos de Inducción</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Vence mañana • 23:59 PM • Curso Prácticas Eléctricas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("classes")}
                  className="bg-[#800521] hover:bg-[#9F062A] text-white font-bold text-[10px] px-3.5 py-1.5 rounded uppercase tracking-wider transition-all select-none cursor-pointer"
                >
                  Subir
                </button>
              </div>

              <div className="p-4 border border-slate-150 rounded-lg bg-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Control de Lectura 02: Normativa Eléctrica</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Calificado • Nota del estudiante: 18 / 20</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("classes")}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] px-3.5 py-1.5 rounded uppercase tracking-wider transition-all select-none cursor-pointer"
                >
                  Revisar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT NOTIFICATIONS SIDEBOARD (Right Column) */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recent Notifications</span>
            <span className="bg-red-100 text-[#800521] font-black text-[9px] px-2 py-0.5 rounded-full uppercase leading-none">
              3 Nuevas
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-4 pt-1">
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-red-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 leading-tight">Cambio extraordinario de Aula</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                La clase del taller de Electricidad Industrial II de hoy se dictará excepcionalmente en el Auditorio Central debido a mantenimientos de relés.
              </p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Hace 2 horas</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 leading-tight">Webinar gratuito: Futuro de micro-grids</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                Inscríbete hoy mismo a la conferencia del Dr. Santiago sobre redes eléctricas descentralizadas y almacenamiento solar.
              </p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Hace 5 horas</span>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 leading-tight">Recibo digital de pensión generado</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                Su comprobante mensual de cobros #10593 ha sido cargado con éxito. Estado: Al día, sin adeudos.
              </p>
              <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
