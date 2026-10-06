import React from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle2, Send } from "lucide-react";

interface ContactanosTabProps {
  contactName: string;
  setContactName: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  contactSubject: string;
  setContactSubject: (val: string) => void;
  contactMessage: string;
  setContactMessage: (val: string) => void;
  contactSuccessMsg: string;
  setContactSuccessMsg: (val: string) => void;
  handleContactSubmit: (e: React.FormEvent) => void;
}

export const ContactanosTab: React.FC<ContactanosTabProps> = ({
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactSubject,
  setContactSubject,
  contactMessage,
  setContactMessage,
  contactSuccessMsg,
  setContactSuccessMsg,
  handleContactSubmit
}) => {
  return (
    <div className="bg-slate-50 py-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">

        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">MESA DE PARTES Y SECRETARÍA</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Canales de Atención Institucional</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Estamos a tu disposición para resolver consultas sobre admisión, trámites documentarios, traslados e información académica.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-5 space-y-4">

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Ubicación del Campus</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">Av. Pachacútec Cdra. 50, Villa María del Triunfo, Lima - Perú.</p>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Referencia: Altura del Paradero Pachacútec.</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Central Telefónica</h3>
                <p className="text-xs text-slate-600 font-bold mt-1">01 500 6177</p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">Horario de atención: Lunes a Viernes de 8:00 am a 5:00 pm.</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Mesa de Partes Virtual</h3>
                <p className="text-xs text-[#9F062A] font-bold mt-1">admision@iestpsfa.edu.pe</p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">Recepción de solicitudes de trámites y consultas.</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Turnos Académicos</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">Turno Mañana: 8:00 am - 1:00 pm</p>
                <p className="text-xs text-slate-600 font-medium">Turno Tarde: 1:00 pm - 6:00 pm</p>
                <p className="text-xs text-slate-600 font-medium">Turno Noche: 6:00 pm - 10:00 pm</p>
              </div>
            </div>

          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-2xl shadow-md">
              <div className="border-b border-slate-200 pb-4 mb-5">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Envío de Mensajes y Consultas</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Escribe tu consulta y el área encargada te responderá a la brevedad.</p>
              </div>

              {contactSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-xl text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{contactSuccessMsg}</p>
                  </div>
                  <button
                    onClick={() => setContactSuccessMsg("")}
                    className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Enviar Otra Consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ingrese su nombre y apellido"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Área o Tipo de Consulta *</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                    >
                      <option value="admision">Información sobre Admisión 2026</option>
                      <option value="tramites">Trámites de Secretaría Académica</option>
                      <option value="traslados">Traslados y Convalidaciones</option>
                      <option value="otros">Otras Consultas Institucionales</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Mensaje *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describa aquí su consulta detalladamente..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Enviar Consulta a Secretaría Académica</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
