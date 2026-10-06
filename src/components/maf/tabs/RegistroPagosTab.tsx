import React from "react";
import { CreditCard, Layers, Search, Plus } from "lucide-react";
import Button from "../../ui/Button";
import PageTransition from "../../ui/PageTransition";
import { MafObligation } from "../mafTypes";

interface RegistroPagosTabProps {
  filteredObligations: MafObligation[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleOpenRegisterVoucher: (oblId: string) => void;
}

export const RegistroPagosTab: React.FC<RegistroPagosTabProps> = ({
  filteredObligations,
  searchQuery,
  setSearchQuery,
  handleOpenRegisterVoucher
}) => {
  return (
    <PageTransition id="registro_pagos" className="space-y-6">
      <div className="bg-white p-6 border border-slate-205 rounded-2xl relative shadow-xs overflow-hidden">
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#9F062A]" />
              Registro Directo de Voucher Bancario
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Registre e ingrese depósitos bancarios traídos por ventanilla. El voucher ingresará en fase de validación en MAF.
            </p>
          </div>
        </div>

        {/* Informative Step Box */}
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs text-slate-600 leading-relaxed font-semibold">
          <div className="flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0">1</span>
            <p>Asocie el depósito físico a una obligación de pago ingresando los datos del estudiante en ventanilla.</p>
          </div>
          <div className="flex gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0">2</span>
            <p>Ingrese el monto pagado, el banco (BN, BCP, BBVA, etc.) y fecha impresa en el váucher.</p>
          </div>
          <div className="flex gap-2.5 font-bold text-slate-900">
            <span className="w-5 h-5 rounded-full bg-[#9F062A] text-white font-black flex items-center justify-center shrink-0">3</span>
            <p>El voucher quedará cargado con estado Pendiente de Validación en la cola oficial financiera.</p>
          </div>
        </div>

        {/* Quick Obligations List to Trigger Voucher Setup */}
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-between pb-3 gap-3">
            <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Seleccione una obligación de pago para cargar comprobante bancario:
            </h4>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="DNI o Nombre Alumno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold leading-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Alumno</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Concepto de Tasa</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Importe Ajustado</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Estado</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredObligations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-450 uppercase font-black tracking-wider">
                      No se encontraron obligaciones pendientes que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredObligations.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900 uppercase">{o.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-black">DNI: {o.studentDni} | Periodo: {o.period}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{o.conceptName}</div>
                        <div className="text-[9px] text-[#9F062A] font-black font-mono">{o.conceptCode}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <div className="text-slate-900 font-extrabold text-xs">S/. {o.finalAmount.toFixed(2)}</div>
                        {o.discount > 0 && (
                          <div className="text-[9px] text-purple-650 font-black">Desc. Exoneración: S/. {o.discount.toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          o.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          o.status === "En Proceso" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          o.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                          o.status === "Exonerado" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                          "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {o.status === "Pendiente" || o.status === "Observado" ? (
                          <Button
                            onClick={() => handleOpenRegisterVoucher(o.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ml-auto"
                          >
                            <Plus className="w-3.5 h-3.5" /> Registrar Pago
                          </Button>
                        ) : o.voucherRegistered ? (
                          <div className="text-[10px] text-slate-500 font-bold">
                            Voucher #{o.voucherDetails?.operationNumber}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">No Aplica</span>
                        )}
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
};
