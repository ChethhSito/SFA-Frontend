import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { MpaPeriod } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

interface PeriodsTabProps {
  periods: MpaPeriod[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setPeriods: React.Dispatch<React.SetStateAction<MpaPeriod[]>>;
}

export function PeriodsTab({ periods, saveDb, setPeriods }: PeriodsTabProps) {
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

  return (
    <PageTransition id="periods">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        {/* Creación / Modificación de Periodos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Nuevo Período</h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const computedName = `Periodo ${formPeriodYear}-${formPeriodTerm}`;
              const exist = periods.some(p => p.name === computedName);
              if (exist) {
                alert(`Ya existe un período con el nombre "${computedName}".`);
                return;
              }
              if (!formPeriod.startDate || !formPeriod.endDate) {
                alert("Por favor configure las fechas de inicio y de cierre.");
                return;
              }
              const id = "p_" + Date.now();
              const finalPStatus = formPeriod.status || "Planificación";
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
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Año Académico *</label>
                <select
                  value={formPeriodYear}
                  onChange={(e) => setFormPeriodYear(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-bold text-slate-800"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Término Periodo *</label>
                <select
                  value={formPeriodTerm}
                  onChange={(e) => setFormPeriodTerm(e.target.value as "0" | "I" | "II")}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-black text-[#9F062A]"
                >
                  <option value="0">0 (Ciclo Cero / Nivelación)</option>
                  <option value="I">I (Primer Periodo)</option>
                  <option value="II">II (Segundo Periodo)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/80">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Vista Previa de Nombre</span>
              <span className="text-xs font-extrabold text-[#9F062A] font-mono select-all">
                Periodo {formPeriodYear}-{formPeriodTerm}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Fecha Inicio *</label>
                <input 
                  type="date" 
                  required 
                  value={formPeriod.startDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    let computedEnd = formPeriod.endDate;
                    if (val) {
                      // Default period duration is 16 weeks (112 days)
                      const d = new Date(val + "T12:00:00");
                      d.setDate(d.getDate() + 112);
                      computedEnd = d.toISOString().split("T")[0];
                    }
                    setFormPeriod({ ...formPeriod, startDate: val, endDate: computedEnd });
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-md font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Fecha Cierre *</label>
                <input 
                  type="date" 
                  required 
                  value={formPeriod.endDate}
                  onChange={(e) => setFormPeriod({ ...formPeriod, endDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md font-bold"
                />
                <span className="text-[9px] text-emerald-600 font-bold block mt-1 tracking-tight">
                  * Auto-calculado a 16 semanas por defecto
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado del Período *</label>
              <select
                value={formPeriod.status || "Planificación"}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFormPeriod({ ...formPeriod, status: val, isActive: val === "Activo" });
                }}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-bold text-slate-800"
              >
                <option value="Planificación">Planificación</option>
                <option value="Activo">Activo</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Guardar Período Académico
            </Button>
          </form>
        </div>

        {/* Listado de Periodos */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Registros Registrados</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Nombre del Periodo</th>
                  <th className="p-3">Fecha Inicio / Fin</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {periods.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-semibold text-xs">
                      No existen períodos académicos registrados.
                    </td>
                  </tr>
                ) : (
                  periods.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-black text-slate-800 font-mono text-xs">{item.name}</td>
                      <td className="p-3 font-mono">{item.startDate} al {item.endDate}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                          (item.status || (item.isActive ? "Activo" : "Planificación")) === "Activo"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : (item.status || (item.isActive ? "Activo" : "Planificación")) === "Cerrado"
                            ? "bg-rose-50 text-rose-800 border-rose-250"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {item.status || (item.isActive ? "Activo" : "Planificación")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1.5 mr-3">
                          <button 
                            onClick={() => {
                              const next = periods.map(p => ({
                                ...p,
                                status: p.id === item.id ? ("Activo" as const) : p.status === "Activo" ? ("Planificación" as const) : p.status,
                                isActive: p.id === item.id ? true : false
                              }));
                              saveDb("periods", next, setPeriods);
                            }}
                            className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black hover:bg-emerald-100 uppercase cursor-pointer"
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
                            }}
                            className="text-[9px] bg-rose-50 text-rose-850 border border-rose-200 px-1.5 py-0.5 rounded font-black hover:bg-rose-100 uppercase cursor-pointer"
                          >
                            Cerrar
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            const next = periods.filter(p => p.id !== item.id);
                            saveDb("periods", next, setPeriods);
                          }}
                          className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                        >
                          <Trash2 className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
