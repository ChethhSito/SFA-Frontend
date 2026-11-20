import React, { useState } from "react";
import { Save, AlertCircle, Trash2, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { WeeklyObservation } from "../DocenteTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";

interface Props {
  courseId: string;
  week: number;
  observations: WeeklyObservation[];
  onAddObservation: (text: string, type: "General" | "Incidencia" | "Acuerdo") => Promise<boolean>;
  onDeleteObservation: (id: string) => Promise<void>;
}

export function ObservacionManager({ courseId, week, observations, onAddObservation, onDeleteObservation }: Props) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"General" | "Incidencia" | "Acuerdo">("General");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    try { 
      if (await onAddObservation(text.trim(), type)) {
        setText(""); 
      }
    } finally { 
      setSaving(false); 
    }
  };

  const getBadgeStyle = (t: string) => {
    switch (t) {
      case "Incidencia":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Acuerdo":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <PageHeader
        title={`Semana ${week}: Observaciones de Clase e Incidencias`}
        subtitle="Monitoree acuerdos de taller, fallas técnicas de equipamiento o novedades pedagógicas del grupo."
        icon={<AlertCircle className="w-5 h-5 text-[#800521]" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario Nueva Observación (1 col) */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-5">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">Registrar Nueva Nota</h3>
              <p className="text-xs text-slate-500 font-medium">Anotación oficial visible para la jefatura académica.</p>
            </div>
            <MessageSquare className="w-5 h-5 text-[#800521]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Categoría del Registro
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
              >
                <option value="General">Observación General de Sesión</option>
                <option value="Incidencia">Incidencia Académica / Técnica</option>
                <option value="Acuerdo">Acuerdo de Aula / Compromiso</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Detalle del Registro Pedagógico
              </label>
              <textarea
                rows={4}
                required
                placeholder="Escriba los pormenores de la sesión técnica, incidentes con terminales o avances logrados..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="w-full bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{saving ? "Guardando nota..." : "Registrar Nota"}</span>
            </button>
          </form>
        </div>

        {/* Línea de Tiempo de Observaciones (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Bitácora de Observaciones de Semana {week}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Historial cronológico de incidencias y acuerdos de clase.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-black font-mono">
              {observations.length} {observations.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          <div className="space-y-3">
            {observations.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center mb-1">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  No se han registrado observaciones en esta semana
                </h4>
                <p className="text-xs text-slate-400 font-medium max-w-sm">
                  Utilice el panel contiguo para formalizar acuerdos de clase o incidencias técnicas ocurridas en los talleres.
                </p>
              </div>
            ) : (
              observations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getBadgeStyle(obs.type)}`}>
                      {obs.type}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {obs.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteObservation(obs.id)}
                        className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar observación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed text-left whitespace-pre-wrap">
                    {obs.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
