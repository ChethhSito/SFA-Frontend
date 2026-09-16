import React from "react";
import { 
  ArrowRight, HelpCircle, MessageSquare, Send 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { Applicant } from "../../../types";

interface SoporteTabProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
  supportCategory: string;
  setSupportCategory: (category: string) => void;
  supportMessage: string;
  setSupportMessage: (message: string) => void;
}

export const SoporteTab: React.FC<SoporteTabProps> = React.memo(({
  applicant,
  onUpdateApplicant,
  supportCategory,
  setSupportCategory,
  supportMessage,
  setSupportMessage,
}) => {
  return (
    <PageTransition id="soporte" className="space-y-6">
      {/* Breadcrumb path */}
      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-left">
        Admisión 2026 &gt; <span className="text-slate-600">Centro de Soporte y Atención</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-left">Centro de Soporte y Mesa de Partes</h2>
          <p className="text-xs text-slate-500 font-bold leading-none mt-1">¿Tiene dudas o inconvenientes con su inscripción, pago o validación de requisitos? Envíe su consulta para recibir asistencia directa.</p>
        </div>
      </div>

      {/* TOP ROW: 2 Cards side by side (Mesa de Atención Directa + Guía y Preguntas Frecuentes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Card 1: Mesa de Atención Directa (Borgoña Theme) */}
        <div className="bg-[#8B0020] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between border-l-4 border-amber-400 text-left relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider block leading-none">Mesa de Atención Directa</h3>
              <span className="text-[10px] font-extrabold bg-white/10 text-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/20">
                Atención En Vivo
              </span>
            </div>

            <p className="text-slate-100 font-medium text-[11px] leading-relaxed mb-4">
              Nuestro equipo de Secretaría Académica está disponible de <strong className="text-amber-300 font-extrabold">Lunes a Viernes de 8:00 am a 6:00 pm</strong> para absolver cualquier duda técnica de su trámite.
            </p>

            <div className="space-y-2 text-xs border-t border-white/10 pt-3">
              <div className="flex items-center gap-2 text-slate-200 text-[11px]">
                <span className="font-black text-amber-300">WhatsApp Oficial:</span> +51 956 123 456
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-[11px]">
                <span className="font-black text-amber-300">Central Telefónica:</span> (056) 261-234
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-[11px]">
                <span className="font-black text-amber-300">Campus Presencial:</span> Av. Mariscal Benavides 1320, Chincha Alta
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              const formEl = document.getElementById("form-soporte-consulta");
              if (formEl) {
                formEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="w-full mt-6 bg-white hover:bg-amber-50 text-[#8B0020] font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 group"
          >
            <span>Redactar Nueva Consulta</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Guía y Preguntas Frecuentes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">Preguntas Frecuentes</h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">01</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Validación de Vouchers: Las transferencias interbancarias se verifican en un plazo estimado de 24 horas hábiles.</p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">02</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Documentos Observados: Suba la captura fotográfica nítida de su requisito en formato JPG, JPEG o PNG (menor a 5MB).</p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">03</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Asignación de Aula: Su aula para el examen presencial se habilitará automáticamente tras ser validados sus requisitos.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Split Layout (Mesa de Partes Form + Conversational Chat) */}
      <div id="form-soporte-consulta" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#8B0020]" />
            Mesa de Partes Virtual &amp; Asistencia Directa
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COL: Formulario de Nueva Consulta */}
          <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r pb-6 lg:pb-0 lg:pr-6 border-slate-100">
            <span className="text-[10px] font-black uppercase text-[#8B0020] tracking-wider block">Redactar Nueva Consulta</span>
            
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                if (!supportMessage.trim()) return;
                const newMsg = {
                  id: "msg_" + Date.now(),
                  sender: "postulante" as any,
                  category: supportCategory,
                  text: supportMessage.trim(),
                  date: new Date().toLocaleDateString("es-PE")
                };
                const updated = {
                  ...applicant,
                  supportMessages: [...(applicant.supportMessages || []), newMsg]
                };
                onUpdateApplicant(updated);
                setSupportMessage("");
              }} 
              className="space-y-4 text-xs font-bold text-slate-700"
            >
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="block uppercase text-slate-400 text-[10px] mb-1 font-extrabold">Nombre Completo</label>
                  <input type="text" disabled value={`${applicant.name} ${applicant.lastName}`} className="w-full bg-slate-100/80 px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold" />
                </div>
                <div>
                  <label className="block uppercase text-slate-400 text-[10px] mb-1 font-extrabold">Teléfono Móvil de Contacto</label>
                  <input type="text" value={applicant.phone} disabled className="w-full bg-slate-100/80 px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold" />
                </div>
              </div>

              <div>
                <label className="block uppercase text-slate-400 text-[10px] mb-1 font-extrabold">Categoría del Reclamo Técnico</label>
                <select 
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#8B0020]/20"
                >
                  <option>Dificultad con el formato o carga de imagen (JPG/PNG)</option>
                  <option>El voucher físico no se registra en la base de datos bancaria</option>
                  <option>Observación en mis documentos de expediente</option>
                  <option>Otro trámite o consulta regular</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-slate-400 text-[10px] mb-1 font-extrabold">Detalle del Mensaje o Dificultad</label>
                <textarea 
                  required
                  rows={5} 
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describa de manera detallada sus dudas técnicas para recibir asistencia oficial..." 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#8B0020]/20"
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-[#8B0020] hover:bg-[#700018] text-white py-3 px-6 rounded-xl font-extrabold uppercase text-[10px] tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Enviar Mensaje a Secretaría</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COL: Conversational Chat History */}
          <div className="lg:col-span-7 flex flex-col h-full space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Historial de Conversación (Mesa de Partes)</span>
            
            <div className="border border-slate-200/90 rounded-xl p-4 bg-slate-50/70 h-[380px] overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
              {(!applicant.supportMessages || applicant.supportMessages.length === 0) ? (
                <div className="text-center py-16 text-xs text-slate-400 font-semibold leading-relaxed my-auto flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="w-8 h-8 text-slate-300" />
                  <span>No se han registrado mensajes previos. Use el formulario para enviar su primera consulta técnica.</span>
                </div>
              ) : (
                applicant.supportMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex flex-col mb-1.5 ${msg.sender === "postulante" ? "items-end" : "items-start"}`}>
                    <div className={`p-3.5 rounded-2xl max-w-sm sm:max-w-md text-xs font-semibold leading-normal shadow-2xs text-left ${
                      msg.sender === "postulante" 
                        ? "bg-[#8B0020] text-white rounded-br-xs" 
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                    }`}>
                      {msg.category && (
                        <span className={`block text-[8.5px] font-black uppercase tracking-wider mb-1 ${
                          msg.sender === "postulante" ? "text-amber-300" : "text-[#8B0020]"
                        }`}>
                          Categoría: {msg.category}
                        </span>
                      )}
                      <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                    </div>
                    <span className="text-[8px] text-slate-400 font-black block mt-1 tracking-wide uppercase px-1">
                      {msg.sender === "postulante" ? `Usted - ${msg.date}` : `Mesa de Partes - ${msg.date}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
});

SoporteTab.displayName = "SoporteTab";
export default SoporteTab;
