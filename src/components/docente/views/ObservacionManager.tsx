import React, { useState } from "react";
import { Save, AlertCircle, Trash2 } from "lucide-react";
import { WeeklyObservation } from "../DocenteTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";

interface Props {
  courseId: string;
  week: number;
  observations: WeeklyObservation[];
  onAddObservation: (text: string, type: "General" | "Incidencia" | "Acuerdo") => void;
  onDeleteObservation: (id: string) => void;
}

export function ObservacionManager({ courseId, week, observations, onAddObservation, onDeleteObservation }: Props) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"General" | "Incidencia" | "Acuerdo">("General");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddObservation(text, type);
    setText("");
  };

  const getBadgeVariant = (t: string): "danger" | "warning" | "brand" => {
    if (t === "Incidencia") return "danger";
    if (t === "Acuerdo") return "warning";
    return "brand";
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Observaciones de Clase e Incidencias`}
        subtitle="Monitoree acuerdos, fallas de equipos de laboratorio o progresos conductuales recurrentes."
        icon={<AlertCircle className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Registrar Nueva Nota</CardTitle>
              <CardDescription>Anotaciones oficiales visibles para el área de coordinación</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700 font-sans">
              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] tracking-wide mb-1">Categoría del Registro</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border rounded-md font-semibold text-slate-850 focus:outline-[#8B0026]"
                >
                  <option value="General">Observación General</option>
                  <option value="Incidencia">Incidencia Académica / Técnica</option>
                  <option value="Acuerdo">Acuerdo de Aula / Compromiso</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] tracking-wide mb-1">Detalle del Registro</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalle de la sesión técnica, incidentes con terminales táctiles, etc."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026] resize-none"
                />
              </div>

              <Button type="submit" variant="primary" fullWidth className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026] text-white">
                <Save className="w-4 h-4 mr-1.5" /> Registrar Nota
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Línea de Tiempo de Observaciones Oficiales</CardTitle>
              <CardDescription>Bitácora de seguimiento institucional</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 font-sans">
            <div className="relative border-l border-slate-200 pl-4 space-y-5 text-left">
              {observations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic font-bold border-0">
                  <p>No se han registrado observaciones en esta semana.</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Use el panel lateral para formalizar su primer apunte.</p>
                </div>
              ) : (
                observations.map((obs) => (
                  <div key={obs.id} className="relative space-y-1.5 group select-none">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-white border-2 border-[#8B0026] block shrink-0" />
                    <div className="flex justify-between items-center bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl group-hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getBadgeVariant(obs.type)} className="px-2 py-0.5 text-[8.5px] uppercase font-extrabold tracking-wider border">
                            {obs.type}
                          </Badge>
                          <span className="text-[9px] text-slate-450 font-bold">{obs.date}</span>
                        </div>
                        <p className="text-xs text-slate-850 font-semibold leading-relaxed font-sans">{obs.text}</p>
                      </div>
                      <button
                        onClick={() => onDeleteObservation(obs.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-rose-50 rounded-md transition-all cursor-pointer opacity-80 hover:opacity-100"
                        title="Eliminar observación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
