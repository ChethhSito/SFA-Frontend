import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageTransition from "../../ui/PageTransition";
import { SupportTicket } from "../mafTypes";

interface SoporteTabProps {
  tickets: SupportTicket[];
  newTicket: {
    sender: string;
    dni: string;
    topic: string;
    detail: string;
  };
  setNewTicket: React.Dispatch<React.SetStateAction<{
    sender: string;
    dni: string;
    topic: string;
    detail: string;
  }>>;
  handleAddTicket: (e: React.FormEvent) => void;
  handleResolveTicket: (id: string) => void;
}

export const SoporteTab: React.FC<SoporteTabProps> = ({
  tickets,
  newTicket,
  setNewTicket,
  handleAddTicket,
  handleResolveTicket
}) => {
  return (
    <PageTransition id="soporte" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Tickets Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-slate-900">Cola de Tickets de Incidencia Financiera</CardTitle>
              <CardDescription>Consulte los reclamos por depósitos no visualizados u observaciones ingresadas por estudiantes y postulantes.</CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {tickets.map(t => (
                <div key={t.id} className="p-4 border border-slate-205 rounded-xl bg-white space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[10px] font-black font-mono uppercase tracking-widest">{t.id}</span>
                      <h4 className="text-xs font-black text-slate-900 uppercase mt-1 leading-none">{t.topic}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      t.status === "Atendido" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-650 leading-relaxed font-semibold">
                    "{t.detail}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-2.5">
                    <div>SENDER: <span className="text-slate-700">{t.sender}</span> (DNI {t.dni})</div>
                    <div className="flex items-center gap-3">
                      <span>REG: {t.date}</span>
                      {t.status === "Pendiente" && (
                        <button
                          onClick={() => handleResolveTicket(t.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black uppercase text-[9px] cursor-pointer"
                        >
                          Marcar Resuelto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Register ticket Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-900 text-sm">Registrar Solicitud / Reclamo de Clientes</CardTitle>
              <CardDescription>Cargue una llamada de soporte o discrepancia reportada por vía telefónica o presencial.</CardDescription>
            </CardHeader>

            <CardContent className="p-4">
              <form onSubmit={handleAddTicket} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newTicket.sender}
                    onChange={(e) => setNewTicket({ ...newTicket, sender: e.target.value })}
                    placeholder="p.ej. Mario Solis"
                    className="w-full p-2 border border-slate-205 rounded-lg text-xs font-bold leading-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI del Estudiante</label>
                  <input
                    type="text"
                    required
                    value={newTicket.dni}
                    onChange={(e) => setNewTicket({ ...newTicket, dni: e.target.value })}
                    placeholder="Número de 8 dígitos"
                    className="w-full p-2 border border-slate-205 rounded-lg text-xs font-bold leading-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Tema / Asunto</label>
                  <input
                    type="text"
                    required
                    value={newTicket.topic}
                    onChange={(e) => setNewTicket({ ...newTicket, topic: e.target.value })}
                    placeholder="p.ej. Error en banco BN"
                    className="w-full p-2 border border-slate-205 rounded-lg text-xs font-bold leading-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Detalle del Inconveniente</label>
                  <textarea
                    required
                    rows={4}
                    value={newTicket.detail}
                    onChange={(e) => setNewTicket({ ...newTicket, detail: e.target.value })}
                    placeholder="Escriba la descripción..."
                    className="w-full p-2 border border-slate-205 rounded-lg text-xs font-semibold font-sans leading-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Enviar Reclamo a Cola
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </PageTransition>
  );
};
