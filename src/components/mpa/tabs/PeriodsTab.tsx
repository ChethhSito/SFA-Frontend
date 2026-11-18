import React, { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { MpaPeriod } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

interface PeriodsTabProps {
  periods: MpaPeriod[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setPeriods: React.Dispatch<React.SetStateAction<MpaPeriod[]>>;
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function PeriodsTab({ periods, saveDb, setPeriods, notify }: PeriodsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formPeriod, setFormPeriod] = useState<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    status?: "Planificación" | "Activo" | "Cerrado";
  }>({ id: "", name: "", startDate: "", endDate: "", isActive: false, status: "Planificación" });

  const [formPeriodYear, setFormPeriodYear] = useState<number>(new Date().getFullYear());
  const [formPeriodTerm, setFormPeriodTerm] = useState<"0" | "I" | "II">("I");

  const activePeriod = periods.find(p => p.isActive || p.status === "Activo");
  const planningPeriods = periods.filter(p => (p.status || "Planificación") === "Planificación" && !p.isActive);

  return (
    <PageTransition id="periods" className="p-5 md:p-6 space-y-4 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Período Vigente</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {activePeriod ? activePeriod.name : "Ninguno Activo"}
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Períodos</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              {periods.length} Registrados
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">En Planificación</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              {planningPeriods.length} Convocatorias
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
          <span>{showForm ? "Cerrar Formulario" : "+ Registrar Período"}</span>
        </button>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Apertura de Nuevo Período Académico
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              Nombre preliminar: Periodo {formPeriodYear}-{formPeriodTerm}
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const computedName = `Periodo ${formPeriodYear}-${formPeriodTerm}`;
              const exist = periods.some(p => p.name === computedName);
              if (exist) {
                notify?.(`Ya existe un período con el nombre "${computedName}".`, "warning");
                return;
              }
              if (!formPeriod.startDate || !formPeriod.endDate) {
                notify?.("Por favor configure las fechas de inicio y de cierre.", "warning");
                return;
              }
              if (formPeriod.startDate >= formPeriod.endDate) {
                notify?.("La fecha de cierre debe ser posterior a la fecha de inicio.", "warning");
                return;
              }
              const id = "p_" + Date.now();
              const finalPStatus = formPeriod.status || "Planificación";
              if (finalPStatus === "Activo" && periods.some(p => p.isActive || p.status === "Activo")) {
                notify?.("Ya existe un período académico activo. Ciérrelo o seleccione Planificación para el nuevo período.", "warning");
                return;
              }
              const next = [...periods, { 
                ...formPeriod, 
                id, 
                name: computedName, 
                status: finalPStatus, 
                isActive: finalPStatus === "Activo" 
              }];
              saveDb("periods", next, setPeriods);
              setFormPeriod({ id: "", name: "", startDate: "", endDate: "", isActive: false, status: "Planificación" });
              setFormPeriodTerm("I");
              setShowForm(false);
              notify?.(`Período ${computedName} registrado exitosamente.`, "success");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Año Académico *</label>
                <select
                  value={formPeriodYear}
                  onChange={(e) => setFormPeriodYear(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-white font-bold text-slate-800"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Término Período *</label>
                <select
                  value={formPeriodTerm}
                  onChange={(e) => setFormPeriodTerm(e.target.value as "0" | "I" | "II")}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-white font-black text-[#9F062A]"
                >
                  <option value="0">0 (Ciclo Cero / Nivelación)</option>
                  <option value="I">I (Primer Período)</option>
                  <option value="II">II (Segundo Período)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Fecha de Inicio *</label>
                <input 
                  type="date"
                  required
                  value={formPeriod.startDate}
                  onChange={(e) => {
                    const start = e.target.value;
                    let end = formPeriod.endDate;
                    if (start && !end) {
                      const d = new Date(start);
                      d.setDate(d.getDate() + 112);
                      end = d.toISOString().split("T")[0];
                    }
                    setFormPeriod({ ...formPeriod, startDate: start, endDate: end });
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Fecha de Cierre *</label>
                <input 
                  type="date"
                  required
                  value={formPeriod.endDate}
                  onChange={(e) => setFormPeriod({ ...formPeriod, endDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Operativo Inicial *</label>
                <select
                  value={formPeriod.status || "Planificación"}
                  onChange={(e) => setFormPeriod({ ...formPeriod, status: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-white font-bold"
                >
                  <option value="Planificación">Planificación</option>
                  <option value="Activo">Activo</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <Button type="submit" className="bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider px-5">
                  Guardar Período
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Periodos a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider leading-none">
            Períodos Académicos Registrados ({periods.length})
          </h3>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            Vigencia y Estados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3 pl-5">Nombre del Período</th>
                <th className="p-3">Fecha Inicio / Fin</th>
                <th className="p-3 text-center">Estado Oficial</th>
                <th className="p-3 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-semibold text-xs">
                    No existen períodos académicos registrados.
                  </td>
                </tr>
              ) : (
                periods.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 pl-5 font-black text-slate-900 font-mono text-xs">{item.name}</td>
                    <td className="p-3.5 font-mono text-slate-700">{item.startDate} al {item.endDate}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border inline-block ${
                        (item.status || (item.isActive ? "Activo" : "Planificación")) === "Activo"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold" 
                          : (item.status || (item.isActive ? "Activo" : "Planificación")) === "Cerrado"
                          ? "bg-rose-50 text-rose-800 border-rose-250 font-bold"
                          : "bg-slate-100 text-slate-600 border-slate-200 font-bold"
                      }`}>
                        {item.status || (item.isActive ? "Activo" : "Planificación")}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="inline-flex gap-1.5 mr-2">
                        <button 
                          onClick={() => {
                            const next = periods.map(p => ({
                              ...p,
                              status: p.id === item.id ? ("Activo" as const) : p.status === "Activo" ? ("Planificación" as const) : p.status,
                              isActive: p.id === item.id ? true : false
                            }));
                            saveDb("periods", next, setPeriods);
                            notify?.(`Período ${item.name} marcado como ACTIVO oficial.`, "success");
                          }}
                          className="text-[9.5px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold hover:bg-emerald-100 uppercase cursor-pointer"
                        >
                          Activar
                        </button>
                        <button 
                          onClick={() => {
                            const next = periods.map(p => ({
                              ...p,
                              status: p.id === item.id ? ("Cerrado" as const) : p.status,
                              isActive: p.id === item.id ? false : p.isActive
                            }));
                            saveDb("periods", next, setPeriods);
                            notify?.(`Período ${item.name} cerrado.`, "info");
                          }}
                          className="text-[9.5px] bg-rose-50 text-rose-800 border border-rose-300 px-2 py-0.5 rounded font-bold hover:bg-rose-100 uppercase cursor-pointer"
                        >
                          Cerrar
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          const next = periods.filter(p => p.id !== item.id);
                          saveDb("periods", next, setPeriods);
                          notify?.(`Período eliminado.`, "info");
                        }}
                        className="text-red-500 hover:text-red-800 cursor-pointer inline-block align-middle p-1 rounded hover:bg-red-50"
                        title="Eliminar período"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}