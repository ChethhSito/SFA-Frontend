import React, { useState } from "react";
import { Plus, X, HelpCircle, MessageSquare } from "lucide-react";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

export interface SupportTicket {
  id: string;
  subject: string;
  text: string;
  date: string;
  reply?: string;
}

export interface SupportTabProps {
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function SupportTab({ notify }: SupportTabProps = {}) {
  const [showForm, setShowForm] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem("mpa_support_tickets");
    return saved ? JSON.parse(saved) : [
      { 
        id: "tk1", 
        subject: "Conflicto de Aula 201 en Mañana", 
        text: "Trato de programar Teoría el día Lunes pero se solapa con Laboratorio", 
        date: "11/06/2026", 
        reply: "Hola, verifique que la sesión de tipo Teoría esté asignada a un aula de tipo Teoría en vez del Lab." 
      }
    ];
  });
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketText, setNewTicketText] = useState("");

  const repliedCount = supportTickets.filter(t => t.reply).length;
  const pendingCount = supportTickets.length - repliedCount;

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketText) return;
    const next: SupportTicket[] = [
      ...supportTickets,
      {
        id: "tk_" + Date.now(),
        subject: newTicketSubject,
        text: newTicketText,
        date: new Date().toLocaleDateString("es-PE"),
      }
    ];
    setSupportTickets(next);
    localStorage.setItem("mpa_support_tickets", JSON.stringify(next));
    setNewTicketSubject("");
    setNewTicketText("");
    setShowForm(false);
    notify?.("Consulta de Soporte Técnico enviada a la Secretaría del Local.", "success");
  };

  return (
    <PageTransition id="support" className="p-5 md:p-6 space-y-4 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Consultas</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {supportTickets.length} Solicitudes
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Respuestas SFA</span>
            <span className="text-sm font-black text-emerald-600 font-mono block mt-0.5">
              {repliedCount} Contestadas
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estado de Atención</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              {pendingCount > 0 ? `${pendingCount} Pendiente(s)` : "Al Día"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer border ${
            showForm 
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" 
              : "bg-[#800521] hover:bg-[#67041a] text-white border-[#800521]"
          }`}
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showForm ? "Cerrar Formulario" : "+ Nueva Consulta"}</span>
        </button>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Registrar Nueva Solicitud de Asistencia
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Mesa de Ayuda Académica
            </span>
          </div>

          <form onSubmit={handleAddTicket} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Tema de Solicitud *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Conflicto de Disponibilidad de Aula 302" 
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Detalle del Requerimiento en MPA *</label>
              <textarea 
                required 
                rows={3}
                placeholder="Escriba los pormenores técnicos del cruce de docentes, cambio en la malla o inconvenientes experimentados..." 
                value={newTicketText}
                onChange={(e) => setNewTicketText(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border rounded-lg font-medium text-slate-800"
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <Button type="submit" className="bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider px-6">
                Enviar Consulta a Soporte
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de Tickets a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#9F062A]" />
            Mis Tickets de Asistencia ({supportTickets.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Canal de Soporte
          </span>
        </div>
        
        <div className="p-4 space-y-3">
          {supportTickets.length === 0 ? (
            <p className="text-center text-xs text-slate-400 font-semibold py-8">
              No registra solicitudes de soporte técnico.
            </p>
          ) : (
            supportTickets.map(item => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2.5">
                  <div>
                    <span className="text-xs font-black text-slate-900 leading-tight uppercase block">{item.subject}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Enviado: {item.date}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border ${
                    item.reply 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {item.reply ? "Contestado" : "Pendiente"}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 p-3 rounded-lg">
                  "{item.text}"
                </p>
                
                {item.reply && (
                  <div className="p-3 bg-[#9F062A]/5 border border-[#9F062A]/15 rounded-lg text-xs font-semibold leading-relaxed">
                    <span className="block text-[9px] font-black text-[#9F062A] tracking-wider uppercase mb-1">
                      Respuesta de Mesa Académica / SFA:
                    </span>
                    <p className="text-slate-800">{item.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
