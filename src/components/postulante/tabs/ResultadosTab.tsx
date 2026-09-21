import React from "react";
import { 
  Award, ArrowRight, Calendar, Clock, MapPin, Download, AlertTriangle, Headset, MessageSquare, FileText 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { Applicant } from "../../../types";

interface ResultadosTabProps {
  applicant: Applicant;
  currentProgram: { name: string; [key: string]: any };
  isActuallyAdmitted: boolean;
  approvedCount: number;
  registrationDate: string;
  paymentDate: string;
  setIsConstanciaModalOpen: (open: boolean) => void;
  setActiveTab: (tab: "dashboard" | "documentos" | "pagos" | "resultados" | "soporte" | "matricula") => void;
}

export const ResultadosTab: React.FC<ResultadosTabProps> = React.memo(({
  applicant,
  currentProgram,
  isActuallyAdmitted,
  approvedCount,
  registrationDate,
  paymentDate,
  setIsConstanciaModalOpen,
  setActiveTab,
}) => {
  const globalProgressPercentage = Math.round((approvedCount / 4) * 100);

  return (
    <PageTransition id="resultados" className="space-y-4 text-left">
      {/* Breadcrumb path */}
      <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
        Admisión 2026 &gt; <span className="text-slate-600 font-extrabold">Resultados y Constancia</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="text-left">
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight text-left">Resultados y Constancia de Admisión</h2>
          <p className="text-[11px] text-slate-500 font-semibold leading-tight mt-0.5">Consulte el estado oficial de su evaluación presencial y descargue su constancia de ingreso.</p>
        </div>
      </div>

      {/* TOP ROW: 2 Cards side by side (Estado de Resultados Borgoña + Guía y Pasos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        
        {/* Card 1: Estado de Admisión (Borgoña Theme) */}
        <div className="bg-[#8B0020] text-white p-5 rounded-xl shadow-md flex flex-col justify-between border-l-4 border-amber-400 text-left relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3">
              <h3 className="font-black text-white text-xs uppercase tracking-wider block leading-none">Resultados Oficiales SFA</h3>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isActuallyAdmitted
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : applicant.admitted === "NO ADMITIDO"
                    ? "bg-red-500/30 text-red-200 border border-red-400/40"
                    : (approvedCount === 4 && applicant.paymentStatus === "Validado")
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
                      : "bg-white/10 text-amber-300 border border-amber-400/20"
              }`}>
                {isActuallyAdmitted 
                  ? "ADMITIDO" 
                  : applicant.admitted === "NO ADMITIDO" 
                    ? "NO ADMITIDO" 
                    : (approvedCount === 4 && applicant.paymentStatus === "Validado") 
                      ? "APTO PARA EXAMEN" 
                      : "EN EVALUACIÓN"}
              </span>
            </div>

            <span className="text-[9px] text-slate-200 font-bold uppercase tracking-wider block mt-1">CARRERA DE POSTULACIÓN</span>
            <h4 className="text-lg sm:text-xl font-black text-amber-300 tracking-tight leading-snug mt-0.5 mb-1.5">
              {currentProgram.name}
            </h4>

            <p className="text-slate-100 font-medium text-[11px] leading-relaxed mb-4">
              {isActuallyAdmitted
                ? "¡Felicidades! Ha alcanzado una vacante oficial en la carrera técnica elegida. Su Constancia Digital de Admisión se encuentra disponible para su descarga."
                : applicant.admitted === "NO ADMITIDO"
                  ? "Estimado postulante, su proceso de admisión ha concluido. Le invitamos a estar atento a nuestras siguientes convocatorias."
                  : (approvedCount === 4 && applicant.paymentStatus === "Validado")
                    ? "Su expediente y pago han sido aprobados. Se le ha asignado el Aula 104 para rendir su examen de admisión presencial."
                    : "Su carpeta se encuentra en fase de validación por secretaría. Complete la carga de sus 4 requisitos y el pago de tasa para habilitar su aula."}
            </p>
          </div>

          <button 
            onClick={() => {
              if (isActuallyAdmitted) {
                setIsConstanciaModalOpen(true);
              } else if (approvedCount < 4 || applicant.paymentStatus !== "Validado") {
                setActiveTab("documentos");
              } else {
                alert("Su aula de examen presencial es el Aula 104 - Pabellón A. Presentarse este Domingo 15 de Marzo a las 08:30 AM.");
              }
            }}
            className="w-full bg-white hover:bg-amber-50 text-[#8B0020] font-black py-2.5 rounded-lg text-[11px] uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-2 group"
          >
            <span>
              {isActuallyAdmitted 
                ? "Descargar Constancia Oficial" 
                : (approvedCount === 4 && applicant.paymentStatus === "Validado")
                  ? "Ver Detalles del Examen"
                  : "Completar Expediente"}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Guía de Requisitos y Recomendaciones */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
              <div className="w-6 h-6 rounded-md bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Recomendaciones del Proceso</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="font-mono text-[10px] font-black text-[#8B0020] shrink-0 bg-white w-5 h-5 rounded flex items-center justify-center border border-slate-200 shadow-2xs">01</span>
                <p className="text-slate-700 font-semibold leading-tight text-[10.5px]">Presentar DNI Físico Vigente e impreso en el ingreso al campus administrativo.</p>
              </div>

              <div className="flex items-center gap-2.5 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="font-mono text-[10px] font-black text-[#8B0020] shrink-0 bg-white w-5 h-5 rounded flex items-center justify-center border border-slate-200 shadow-2xs">02</span>
                <p className="text-slate-700 font-semibold leading-tight text-[10.5px]">Asistir puntualmente a la evaluación (Ingreso 08:30 AM, tolerancia máxima 15 min).</p>
              </div>

              <div className="flex items-center gap-2.5 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <span className="font-mono text-[10px] font-black text-[#8B0020] shrink-0 bg-white w-5 h-5 rounded flex items-center justify-center border border-slate-200 shadow-2xs">03</span>
                <p className="text-slate-700 font-semibold leading-tight text-[10.5px]">Formalización de Matrícula presencial en las fechas establecidas por Secretaría.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Detailed Split Panel */}
      {isActuallyAdmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start pt-1">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs text-center relative overflow-hidden">
              <div className="flex justify-between items-center border-b pb-2.5 mb-4">
                <span className="text-[9.5px] font-black tracking-wider text-[#8B0020] uppercase block">
                  INFORMACIÓN DE INGRESO OFICIAL SFA
                </span>

                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider py-0.5 px-3 rounded-full">
                  CONFIRMADO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold leading-relaxed text-left border-b pb-4 mb-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Fecha de Matrícula</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">Lunes 16 al Viernes 20 de Marzo, 2026</span>
                    <span className="text-[8.5px] text-emerald-600 font-bold block mt-0.5 uppercase">Plazo Regular del Periodo</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm shrink-0">
                    <Clock className="w-4 h-4 text-indigo-700" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Hora de Atención</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">08:30 AM - 01:30 PM</span>
                    <span className="text-[8.5px] text-indigo-600 font-bold block mt-0.5 uppercase">Lunes a Viernes</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center text-sm shrink-0">
                    <MapPin className="w-4 h-4 text-[#8B0020]" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Ubicación Física</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">Oficina de Admisión - Pabellón A</span>
                    <span className="text-[8.5px] text-slate-500 font-bold block mt-0.5 uppercase">Oficinas Administrativas</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm shrink-0">
                    <Award className="w-4 h-4 text-amber-700" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Modalidad</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">Examen Ordinario Aprobado</span>
                    <span className="text-[8.5px] text-amber-600 font-bold block mt-0.5 uppercase">Vacante Ganada por Rendimiento</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsConstanciaModalOpen(true)}
                className="w-full bg-[#8B0020] hover:bg-[#700018] text-white py-3 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer leading-none"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Descargar Constancia Oficial de Admisión</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs text-left">
              <span className="text-[9.5px] font-black text-[#8B0020] uppercase tracking-wider block border-b pb-2 mb-3">
                Timeline del Proceso
              </span>

              <div className="space-y-4 text-slate-600 relative pl-3.5 border-l-2 border-slate-100">
                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Registro de Postulante</span>
                  <span className="text-[8.5px] text-[#8B0020] font-bold uppercase leading-none mt-0.5 inline-block">Completado el {registrationDate}</span>
                </div>

                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Pago de Derechos (S/ 120)</span>
                  <span className="text-[8.5px] text-[#8B0020] font-bold uppercase leading-none mt-0.5 inline-block">Validado el {paymentDate}</span>
                </div>

                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Validación de Expediente</span>
                  <span className="text-[8.5px] text-[#8B0020] font-bold uppercase leading-none mt-0.5 inline-block">Aprobado por Comité</span>
                </div>

                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Vacante Adjudicada</span>
                  <span className="text-[8.5px] text-emerald-700 font-black uppercase leading-none mt-0.5 inline-block">Confirmado como Admitido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (approvedCount === 4 && applicant.paymentStatus === "Validado") ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start pt-1">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs text-center relative overflow-hidden">
              <div className="flex justify-between items-center border-b pb-2.5 mb-4">
                <span className="text-[9.5px] font-black tracking-wider text-[#8B0020] uppercase block">
                  INFORMACIÓN DEL EXAMEN DE ADMISIÓN
                </span>

                <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider py-0.5 px-3 rounded-full">
                  AULA ASIGNADA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold leading-relaxed text-left border-b pb-4 mb-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm shrink-0">
                    <Calendar className="w-4 h-4 text-amber-700" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Fecha del Examen</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">Domingo, 15 de Marzo de 2026</span>
                    <span className="text-[8.5px] text-amber-600 font-bold block mt-0.5 uppercase">Evaluación General Presencial</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0">
                    <Clock className="w-4 h-4 text-emerald-700" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Hora de Ingreso</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">08:30 AM (Tolerancia 15 min)</span>
                    <span className="text-[8.5px] text-emerald-600 font-bold block mt-0.5 uppercase">Puerta Principal del Campus</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm shrink-0">
                    <MapPin className="w-4 h-4 text-indigo-700" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Ubicación / Aula Física</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">Aula 104 - Pabellón A</span>
                    <span className="text-[8.5px] text-indigo-600 font-bold block mt-0.5 uppercase">Pabellón Académico Designado</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-2.5 items-center">
                  <span className="h-8 w-8 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center text-sm shrink-0">
                    <FileText className="w-4 h-4 text-[#8B0020]" />
                  </span>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Modalidad</span>
                    <span className="text-slate-800 text-[10.5px] font-extrabold block mt-0.5">Examen de Admisión Ordinario</span>
                    <span className="text-[8.5px] text-slate-500 font-bold block mt-0.5 uppercase">Admisión General Obligatoria</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs leading-relaxed text-slate-700 font-bold flex gap-2.5 text-left items-start">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[10.5px] text-slate-700 font-semibold">
                  <strong>Constancia bloqueada temporalmente:</strong> Rendir el examen presencial en su aula reservada para que la Secretaría registre sus notas y emita la Constancia Digital.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs text-left">
              <span className="text-[9.5px] font-black text-[#8B0020] uppercase tracking-wider block border-b pb-2 mb-3">
                Timeline del Proceso
              </span>

              <div className="space-y-4 text-slate-600 relative pl-3.5 border-l-2 border-slate-100">
                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Registro de Postulante</span>
                  <span className="text-[8.5px] text-[#8B0020] font-bold uppercase leading-none mt-0.5 inline-block">Completado</span>
                </div>

                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Pago de Derechos (S/ 120)</span>
                  <span className="text-[8.5px] text-[#8B0020] font-bold uppercase leading-none mt-0.5 inline-block">Validado</span>
                </div>

                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-emerald-600 border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Validación de Expediente</span>
                  <span className="text-[8.5px] text-[#8B0020] font-bold uppercase leading-none mt-0.5 inline-block">Aprobado</span>
                </div>

                <div className="relative">
                  <span className="absolute -left-[19px] top-0.5 h-3 w-3 rounded-full bg-amber-500 animate-pulse border-2 border-white shrink-0" />
                  <span className="text-[10.5px] font-black text-slate-900 block leading-tight">Rendir Examen Presencial</span>
                  <span className="text-[8.5px] text-amber-600 font-extrabold uppercase leading-none mt-0.5 inline-block">Aula 104 Asignada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-5 bg-white border border-slate-200/80 rounded-xl text-center shadow-xs my-4 space-y-3">
          <span className="inline-flex p-2.5 bg-amber-50 rounded-full border border-amber-200 text-amber-600 my-0.5">
            <Clock className="w-6 h-6" />
          </span>
          
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Expediente en Fase de Evaluación</h3>
          
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            Sus requisitos de expediente y pago de tasa se encuentran en fase de validación administrativa por secretaría. 
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-[11px] text-slate-600 font-medium leading-normal space-y-1.5">
            <span className="text-[9px] text-[#8B0020] tracking-wider uppercase block font-black leading-none">REQUISITOS PENDIENTES:</span>
            <p>• Pago S/. 120: <span className="font-extrabold text-slate-900">{applicant.paymentStatus === "Validado" ? "✓ Aprobado" : "Pendiente"}</span></p>
            <p>• Documentos: <span className="font-extrabold text-slate-900">{globalProgressPercentage === 100 ? "✓ Completo" : `${globalProgressPercentage}% completado (${approvedCount} de 4)`}</span></p>
          </div>
        </div>
      )}
    </PageTransition>
  );
});

ResultadosTab.displayName = "ResultadosTab";
export default ResultadosTab;


