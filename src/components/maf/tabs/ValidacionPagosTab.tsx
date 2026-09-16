import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";
import Button from "../../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageTransition from "../../ui/PageTransition";
import { MafObligation } from "../mafTypes";

interface ValidacionPagosTabProps {
  obligations: MafObligation[];
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  vouchersPorValidar: number;
  handleOpenObservePayment: (oblId: string) => void;
  handleApprovePayment: (oblId: string) => void;
}

export const ValidacionPagosTab: React.FC<ValidacionPagosTabProps> = ({
  obligations,
  statusFilter,
  setStatusFilter,
  vouchersPorValidar,
  handleOpenObservePayment,
  handleApprovePayment
}) => {
  const filteredList = obligations.filter(ob =>
    statusFilter === "todos" ? ob.voucherRegistered : ob.status === statusFilter
  );

  return (
    <PageTransition id="validacion_pagos" className="space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Auditoría e Inspección de Comprobantes Bancarios Registrados
              </CardTitle>
              <CardDescription>
                Compare los vouchers virtuales y números de operación con el extracto de cuenta bancaria del IESTP. Apruebe para dar conformidad o declare observado para notificar corrección.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-slate-500">Filtrar por validación:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1 px-2 border border-slate-205 bg-white font-bold rounded-lg text-xs"
              >
                <option value="En Proceso">Por Validar ({vouchersPorValidar})</option>
                <option value="todos">Ver Historial Completo</option>
                <option value="Validado">Validados</option>
                <option value="Observado">Observados / Rechazados</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estudiante / DNI</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Concepto Solicitado</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Datos del Voucher</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Importe Recibido</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estado de Caja</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 text-right">Acciones de Verificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-450 uppercase font-black tracking-widest leading-none">
                      No se encontraron vouchers bancarios pendientes de auditoría en este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((ob) => (
                    <tr key={ob.id} className="hover:bg-slate-55/60 transition-all">
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900 uppercase">{ob.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-bold">DNI: {ob.studentDni} | Periodo: {ob.period}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">{ob.conceptName}</div>
                        <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-black tracking-wider uppercase font-mono">{ob.conceptCode}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <div className="text-slate-850 font-extrabold text-xs">#{ob.voucherDetails?.operationNumber || "SIN REGISTRO"}</div>
                        <div className="text-[9.5px] text-slate-400 font-bold block">Banco: {ob.voucherDetails?.bankName} ({ob.voucherDetails?.paymentDate})</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-emerald-700 font-black text-xs">S/. {(ob.voucherDetails?.amountPaid || ob.finalAmount).toFixed(2)}</div>
                        <span className="text-[9px] text-slate-400 block font-bold leading-none">Tasa: S/. {ob.amount}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ob.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          ob.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                          "bg-blue-50 text-blue-700 border border-blue-150"
                        }`}>
                          {ob.status}
                        </span>
                        {ob.status === "Observado" && ob.voucherDetails?.observations && (
                          <div className="text-[9.5px] text-red-650 font-bold mt-1 max-w-xs truncate leading-tight">Reason: {ob.voucherDetails.observations}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {ob.status === "En Proceso" ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleOpenObservePayment(ob.id)}
                              className="bg-red-50 text-red-700 hover:bg-red-100 font-black text-[9.5px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Observar
                            </Button>
                            <Button
                              onClick={() => handleApprovePayment(ob.id)}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[9.5px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Validar Pago
                            </Button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-450 font-bold">
                            Auditoría Concluida
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
