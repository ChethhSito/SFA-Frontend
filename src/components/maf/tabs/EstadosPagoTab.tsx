import React from "react";
import { CheckSquare, Search } from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { MafObligation } from "../mafTypes";

interface EstadosPagoTabProps {
  filteredObligations: MafObligation[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export const EstadosPagoTab: React.FC<EstadosPagoTabProps> = ({
  filteredObligations,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <PageTransition id="estados_pago" className="space-y-6">
      <div className="bg-white p-6 border border-slate-205 rounded-2xl relative shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#9F062A]" />
              Consulta General de Estados Financieros de Caja
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Visualice el estado general de cobros, tasas académicas, postulantes virtuales y alumnos del instituto.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="DNI o Nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold leading-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1 px-2 border border-slate-205 bg-white font-bold rounded-lg text-xs"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Verificación</option>
              <option value="Validado">Validado / Cerrado</option>
              <option value="Observado">Observado</option>
              <option value="Exonerado">Exonerados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Código Obligación</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estudiante DNI</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Concepto</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Monto Original</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Monto Final</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estado de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredObligations.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-4 py-3 text-slate-650 font-mono font-bold uppercase">{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900 uppercase">{o.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-bold block">DNI: {o.studentDni} | Periodo: {o.period}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{o.conceptName}</div>
                    <span className="text-[9px] text-[#9F062A] font-black font-mono leading-none">{o.conceptCode}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">S/. {o.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono text-slate-905 font-bold">
                    S/. {o.finalAmount.toFixed(2)}
                    {o.discount > 0 && <span className="text-[9px] text-purple-600 block leading-none font-sans font-bold">(- S/. {o.discount.toFixed(2)})</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider block text-center w-36 ${
                      o.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      o.status === "En Proceso" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      o.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                      o.status === "Exonerado" ? "bg-purple-100 text-purple-800 border border-purple-150" :
                      "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
};
