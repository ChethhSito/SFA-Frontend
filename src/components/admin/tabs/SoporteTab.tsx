import React from "react";
import { MessageSquare, Compass, Mail } from "lucide-react";
import { Applicant } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";

interface SoporteTabProps {
  applicants: Applicant[];
  selectedSupportAppDni: string | null;
  setSelectedSupportAppDni: (dni: string | null) => void;
  adminSupportReply: string;
  setAdminSupportReply: (r: string) => void;
  onUpdateApplicants: (apps: Applicant[]) => void;
}

export const SoporteTab: React.FC<SoporteTabProps> = ({
  applicants,
  selectedSupportAppDni,
  setSelectedSupportAppDni,
  adminSupportReply,
  setAdminSupportReply,
  onUpdateApplicants,
}) => {
  return (
    <PageTransition id="soporte" className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bandeja de Soporte Técnico"
        subtitle="Atención de reclamos, dificultades con pagos y asistencia en carga de requisitos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tickets list */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="bg-slate-50/50 py-3.5 px-4 border-b">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-800 font-extrabold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9F062A]" /> Tickets Activos
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-400 font-bold">
                Filtrado por consultas registradas por postulantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {(() => {
                const list = applicants.filter((app) => app.supportMessages && app.supportMessages.length > 0);
                if (list.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs">
                      No hay tickets de soporte activos por el momento.
                    </div>
                  );
                }
                return (
                  <div className="space-y-1.5 divide-y divide-slate-100 max-h-[440px] overflow-y-auto custom-scrollbar">
                    {list.map((app) => {
                      const lastMsg = app.supportMessages[app.supportMessages.length - 1];
                      const isSelected = selectedSupportAppDni === app.dni;
                      return (
                        <button
                          key={app.dni}
                          onClick={() => setSelectedSupportAppDni(app.dni)}
                          className={`w-full text-left p-3 rounded-lg transition-all flex flex-col gap-1 cursor-pointer pt-3 ${
                            isSelected
                              ? "bg-[#9F062A]/5 border border-[#9F062A]/10 text-left"
                              : "hover:bg-slate-100 border border-transparent text-left"
                          }`}
                        >
                          <span className="font-extrabold text-[11px] text-slate-900 leading-tight block">
                            {app.name} {app.lastName}
                          </span>
                          <span className="text-[9px] text-[#5493D5] font-semibold block">{app.dni}</span>
                          {lastMsg && (
                            <p className="text-[10px] text-slate-500 font-bold line-clamp-2 leading-snug mt-1 italic">
                              "{lastMsg.text}"
                            </p>
                          )}
                          <span className="text-[8px] text-slate-400 font-black tracking-wider uppercase block text-right mt-1.5">
                            {lastMsg ? lastMsg.date : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat screen thread */}
        <div className="lg:col-span-2">
          {(() => {
            const activeApp = applicants.find((app) => app.dni === selectedSupportAppDni);
            if (!activeApp) {
              return (
                <Card className="h-full min-h-[300px] flex items-center justify-center text-center shadow-xs border-slate-200">
                  <CardContent className="p-8 space-y-2">
                    <Compass className="w-10 h-10 text-slate-350 mx-auto animate-pulse" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Mesa de Asistencia Técnica
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold max-w-sm">
                      Por favor seleccione un postulante en la barra lateral izquierda para examinar sus mensajes, responder sus preguntas o iniciar el contacto por correo directo.
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card className="shadow-xs border-slate-200 flex flex-col justify-between">
                <CardHeader className="bg-slate-50/50 py-4 px-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5 text-left">
                    <CardTitle className="text-xs font-black uppercase text-slate-900 tracking-wider">
                      Atención de Ticket: {activeApp.name} {activeApp.lastName}
                    </CardTitle>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-semibold">
                      <span>
                        DNI: <span className="text-slate-800 font-bold">{activeApp.dni}</span>
                      </span>
                      <span>
                        Teléfono: <span className="text-slate-800 font-bold">{activeApp.phone}</span>
                      </span>
                      <span>
                        Código:{" "}
                        <span className="text-slate-800 font-bold">{activeApp.applicantCode || "Sin Código"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Direct mail direct reply */}
                  <div className="shrink-0 text-left">
                    <a
                      href={`mailto:${activeApp.email}?subject=Asistencia%20Soporte%20Admision%20IESTP%20SFA`}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[10px] uppercase font-black tracking-wider px-3 py-2 rounded shadow-xs cursor-pointer transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Enviar Email Directo ({activeApp.email})</span>
                    </a>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-150 min-h-[220px] max-h-[360px] overflow-y-auto custom-scrollbar flex flex-col">
                    {activeApp.supportMessages &&
                      activeApp.supportMessages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col mb-3 ${
                            msg.sender === "admin" ? "items-end text-right" : "items-start text-left"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-lg max-w-sm text-xs font-semibold leading-normal shadow-xs ${
                              msg.sender === "admin"
                                ? "bg-[#9F062A] text-white rounded-br-none"
                                : "bg-white border border-slate-350 text-slate-800 rounded-bl-none"
                            }`}
                          >
                            {msg.category && msg.sender === "postulante" && (
                              <span className="block text-[8px] font-black uppercase tracking-wider mb-1 text-red-200">
                                Categoría: {msg.category}
                              </span>
                            )}
                            <p className="whitespace-pre-line text-xs">{msg.text}</p>
                          </div>
                          <span className="text-[8px] text-slate-400 font-bold block mt-1 tracking-wide uppercase">
                            {msg.sender === "admin"
                              ? `Soporte Institucional - ${msg.date}`
                              : `Postulante - ${msg.date}`}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Reply Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!adminSupportReply.trim()) return;
                      const newMsg = {
                        id: "reply_" + Date.now(),
                        sender: "admin" as const,
                        text: adminSupportReply.trim(),
                        date: new Date().toLocaleDateString("es-PE"),
                      };
                      const updated = applicants.map((app) => {
                        if (app.dni === activeApp.dni) {
                          return {
                            ...app,
                            supportMessages: [...(app.supportMessages || []), newMsg],
                          };
                        }
                        return app;
                      });
                      onUpdateApplicants(updated);
                      setAdminSupportReply("");
                      alert("Su respuesta de soporte tecnico fue registrada y enviada con exito.");
                    }}
                    className="pt-3 border-t border-slate-200 space-y-3"
                  >
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">
                        Escribir Respuesta al Postulante
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={adminSupportReply}
                        onChange={(e) => setAdminSupportReply(e.target.value)}
                        placeholder="Escriba aquí los detalles instructivos, aclaraciones de su trámite para responder la consulta..."
                        className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-350 rounded focus:outline-hidden focus:ring-1 focus:ring-[#9F062A]"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="font-extrabold uppercase text-[10px] bg-[#9F062A] text-white hover:bg-[#800521] tracking-wider rounded"
                      >
                        Responder y Notificar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </PageTransition>
  );
};
