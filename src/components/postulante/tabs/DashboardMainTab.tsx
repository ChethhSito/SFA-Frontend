import React from "react";
import { XCircle, Check, ChevronRight, Compass } from "lucide-react";
import Button from "../../ui/Button";
import PageTransition from "../../ui/PageTransition";
import { Applicant } from "../../../types";

interface DashboardMainTabProps {
  applicant: Applicant;
  currentProgram: { name: string; [key: string]: any };
  globalProgressPercentage: number;
  approvedCount: number;
  isActuallyAdmitted: boolean;
  setActiveTab: (tab: "dashboard" | "documentos" | "pagos" | "resultados" | "soporte" | "matricula") => void;
}

export const DashboardMainTab: React.FC<DashboardMainTabProps> = React.memo(({
  applicant,
  currentProgram,
  globalProgressPercentage,
  approvedCount,
  isActuallyAdmitted,
  setActiveTab,
}) => {
  return (
    <PageTransition id="dashboard" className="space-y-6">
      {/* INSTITUTIONAL HEADER BANNER */}
      <div className="p-7 md:p-8 bg-gradient-to-r from-[#8B0020] via-[#700019] to-[#590013] text-white rounded-2xl shadow-lg border-b-4 border-[#CFA020] relative overflow-hidden space-y-4 text-left">
        <div className="relative z-10 space-y-2">
          <span className="text-[11px] text-amber-300 font-black tracking-widest uppercase block">PROCESO DE ADMISIÓN CONTINUA INSTITUCIONAL</span>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight flex flex-wrap items-center gap-3">
            ¡Hola, {applicant.name}!
            <span className="text-[11px] bg-black/30 backdrop-blur-xs text-amber-300 font-mono px-3 py-1 rounded-lg font-bold uppercase tracking-wider border border-amber-400/30">
              CÓDIGO POSTULANTE: {applicant.applicantCode || "202610028"}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed max-w-3xl">
            Sube tus requisitos digitales para reservar tu vacante de estudios en la carrera técnica de <strong className="text-white underline decoration-amber-400 decoration-2 underline-offset-2">{currentProgram.name}</strong>. (DNI: {applicant.dni})
          </p>
          
          <div className="pt-2 flex flex-wrap gap-6 text-xs font-bold items-center text-slate-200 border-t border-white/10">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-300 font-medium uppercase text-[11px]">Operación Pago Tasas:</span> 
              <span className={`font-extrabold text-[13px] tracking-wider uppercase px-2 py-0.5 rounded ${applicant.paymentStatus === "Validado" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"}`}>
                {applicant.paymentStatus === "Validado" ? "VALIDADO" : (applicant.paymentStatus || "NO PAGADO")}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-300 font-medium uppercase text-[11px]">Expediente Digital:</span> 
              <span className="font-extrabold text-amber-300 text-[13px] tracking-wider px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded">
                {globalProgressPercentage}% COMPLETADO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Observation Display alert bar */}
      {applicant.folderStatus === "Observed" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs font-bold leading-relaxed shadow-xs text-slate-800 text-left">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-650 shrink-0" />
            <span className="text-red-700 font-black uppercase tracking-wider text-[11px]">Expediente Observado por Secretaría de Admisión</span>
          </div>
          <p className="text-slate-600 font-semibold">
            Su carpeta de admisión presenta observaciones oficiales que deben ser subsanadas a la brevedad. Por favor examine sus requisitos y compruebe los comentarios indicados:
          </p>
          <div className="p-3 bg-white rounded-lg border border-red-200 text-red-750 italic font-medium leading-relaxed">
            "{applicant.folderObservations || "Corrija los documentos con estado 'Observado' indicados por la secretaría."}"
          </div>
          <div className="pt-1.5">
            <Button 
              onClick={() => setActiveTab("documentos")} 
              className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-lg"
            >
              Examinar Requisitos de Admisión
            </Button>
          </div>
        </div>
      )}

      {/* PROGRESS LANDING TIMELINE WIDGET */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs text-left">
        {/* STEP 1: Inscripción Inicial (Siempre Completado) */}
        <div className="p-5 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
          <div>
            <span className="inline-block bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">1. INSCRIPCIÓN INICIAL</span>
            <h4 className="font-black text-emerald-950 text-sm mt-1">{currentProgram.name}</h4>
            <p className="text-emerald-800/90 font-medium text-[11px] mt-1.5 leading-relaxed">Carrera oficial registrada en el sistema de admisiones.</p>
          </div>
          <div className="mt-5 pt-3 border-t border-emerald-200/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado
            </span>
          </div>
        </div>

        {/* STEP 2: Tasa de Derechos */}
        {(() => {
          const isPaymentDone = applicant.paymentStatus === "Validado";
          return (
            <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
              isPaymentDone ? "bg-emerald-50/90 border-emerald-300/80 text-emerald-950" : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
            }`}>
              <div>
                <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                  isPaymentDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>2. TASA DE DERECHOS S/ 120</span>
                <h4 className={`font-black text-sm mt-1 ${isPaymentDone ? "text-emerald-950" : "text-slate-800"}`}>Estado: {applicant.paymentStatus || "No Pagado"}</h4>
                <p className={`font-medium text-[11px] mt-1.5 leading-relaxed ${isPaymentDone ? "text-emerald-800/90" : "text-slate-500"}`}>
                  Operación de validación bancaria. {applicant.paymentOperation ? `Ref: ${applicant.paymentOperation}` : "Sin registrar."}
                </p>
              </div>
              <div className={`mt-5 pt-3 border-t ${isPaymentDone ? "border-emerald-200/80" : "border-slate-100"}`}>
                {isPaymentDone ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado</span>
                ) : (
                  <button 
                    onClick={() => setActiveTab("pagos")}
                    className="w-full bg-[#8B0020] hover:bg-[#700019] text-white font-black uppercase text-[11px] tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                  >
                    <span>Ir a Pagos</span> <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* STEP 3: Validación de Expediente */}
        {(() => {
          const isFolderDone = approvedCount >= 4;
          return (
            <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
              isFolderDone ? "bg-emerald-50/90 border-emerald-300/80 text-emerald-950" : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
            }`}>
              <div>
                <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                  isFolderDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>3. VALIDACIÓN DE EXPEDIENTE</span>
                <h4 className={`font-black text-sm mt-1 ${isFolderDone ? "text-emerald-950" : "text-slate-800"}`}>Aprobados: {approvedCount} de 4</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                  <div className={`h-full transition-all duration-300 ${isFolderDone ? "bg-emerald-600" : "bg-[#8B0020]"}`} style={{ width: `${globalProgressPercentage}%` }} />
                </div>
              </div>
              <div className={`mt-5 pt-3 border-t ${isFolderDone ? "border-emerald-200/80" : "border-slate-100"}`}>
                {isFolderDone ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado</span>
                ) : (
                  <button 
                    onClick={() => setActiveTab("documentos")}
                    className="w-full bg-[#8B0020] hover:bg-[#700018] text-white font-black uppercase text-[11px] tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                  >
                    <span>Subir Documentos</span> <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* STEP 4: Examen y Admisión */}
        {(() => {
          const isAdmittedDone = isActuallyAdmitted;
          return (
            <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
              isAdmittedDone ? "bg-emerald-50/90 border-emerald-300/80 text-emerald-950" : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
            }`}>
              <div>
                <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                  isAdmittedDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>4. EXAMEN Y ADMISIÓN</span>
                <h4 className={`font-black text-sm mt-1 uppercase ${isAdmittedDone ? "text-emerald-700" : (applicant.admitted === "NO ADMITIDO" ? "text-rose-600" : "text-slate-700")}`}>
                  {isAdmittedDone ? "ADMITIDO" : (applicant.admitted === "NO ADMITIDO" ? "NO ADMITIDO" : "PENDIENTE EVAL")}
                </h4>
                <p className={`font-medium text-[11px] mt-1.5 leading-relaxed ${isAdmittedDone ? "text-emerald-800/90" : "text-slate-500"}`}>Asignación de aula de examen, rendición presencial y publicación de resultados oficiales.</p>
              </div>
              <div className={`mt-5 pt-3 border-t ${isAdmittedDone ? "border-emerald-200/80" : "border-slate-100"}`}>
                {isAdmittedDone ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado</span>
                ) : (
                  <button 
                    onClick={() => setActiveTab("resultados")}
                    className="w-full bg-[#8B0020] hover:bg-[#700019] text-white font-black uppercase text-[11px] tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                  >
                    <span>Ver Resultados</span> <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* PRE-VISUAL EXPLANATION GUIDE */}
      <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-left">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#8B0020]/10 flex items-center justify-center text-[#8B0020]">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-xs uppercase font-black tracking-widest text-slate-700">Guía de Procedimiento para Ingreso Exitoso</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2">
            <div className="flex items-center gap-2 font-black text-[#8B0020] text-xs">
              <span className="w-6 h-6 rounded-full bg-[#8B0020] text-white flex items-center justify-center text-[10px] font-bold">A</span>
              <span>Depósito de Tasa</span>
            </div>
            <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
              Realice el abono de S/.120 en cualquier agente del Banco de la Nación. Ingrese a la pestaña de pagos y registre el código numérico de operación que figura en su comprobante físico.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2">
            <div className="flex items-center gap-2 font-black text-[#8B0020] text-xs">
              <span className="w-6 h-6 rounded-full bg-[#8B0020] text-white flex items-center justify-center text-[10px] font-bold">B</span>
              <span>Adjunte los 4 Requisitos</span>
            </div>
            <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
              Escanee de forma nítida en PDF su DNI, su Partida de Nacimiento, su Certificado secundario oficial, y suba su foto tamaño carné formal. Se validarán en un plazo estimado de 24 horas hábiles.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2">
            <div className="flex items-center gap-2 font-black text-[#8B0020] text-xs">
              <span className="w-6 h-6 rounded-full bg-[#8B0020] text-white flex items-center justify-center text-[10px] font-bold">C</span>
              <span>Examen y Admisión</span>
            </div>
            <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
              Cuando sus requisitos físicos se validen, se le programará un aula de evaluación presencial. Tras rendir y aprobar el examen, se asignará su estado "Admitido" con su Constancia Oficial de Admisión.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
});

DashboardMainTab.displayName = "DashboardMainTab";
export default DashboardMainTab;
