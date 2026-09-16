import React, { useState } from "react";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

export interface SupportTicket {
  id: string;
  subject: string;
  text: string;
  date: string;
  reply?: string;
}

export function SupportTab() {
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
    alert("Consulta de Soporte Técnico enviada a la Secretaría del Local.");
  };

  return (
    <PageTransition id="support">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        {/* Formulario de Consultas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Nueva Consulta</h3>
          <form onSubmit={handleAddTicket} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Tema de Solicitud *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Conflicto de Disponibilidad de Aula 302" 
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Detalle del Requerimiento en MPA *</label>
              <textarea 
                required 
                rows={4}
                placeholder="Escriba los pormenores técnicos del cruce de docentes, cambio en la malla o inconvenientes experimentados..." 
                value={newTicketText}
                onChange={(e) => setNewTicketText(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border rounded-md"
              ></textarea>
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Enviar Consulta a Soporte Académico
            </Button>
          </form>
        </div>

        {/* Historial de Tickets */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Mis Tickets de Asistencia</h3>
          </div>
          
          <div className="p-4 space-y-4">
            {supportTickets.map(item => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="text-xs font-black text-slate-900 leading-tight uppercase block">{item.subject}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Enviado: {item.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                    item.reply 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}>
                    {item.reply ? "CONTESTADO" : "PENDIENTE"}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white border p-2.5 rounded italic">
                  "{item.text}"
                </p>
                
                {item.reply && (
                  <div className="p-3 bg-[#9F062A]/5 border border-[#9F062A]/10 rounded text-xs font-semibold leading-relaxed">
                    <span className="block text-[8.5px] font-black text-[#9F062A] tracking-wider uppercase mb-1">Respuesta de Mesa Ácademica / SFA:</span>
                    <p className="text-slate-700">{item.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
