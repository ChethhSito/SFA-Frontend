import React from "react";
import { Layers, Plus } from "lucide-react";
import Button from "../../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageTransition from "../../ui/PageTransition";
import { MafObligation } from "../mafTypes";

interface RegistroTransaccionesTabProps {
  obligations: MafObligation[];
  setShowAddObligationModal: (show: boolean) => void;
}

export const RegistroTransaccionesTab: React.FC<RegistroTransaccionesTabProps> = ({
  obligations,
  setShowAddObligationModal
}) => {
  return (
    <PageTransition id="registro_transacciones" className="space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Registro de Solicitudes y Obligaciones de Cobro Académico
              </CardTitle>
              <CardDescription>
                Cada vez que un módulo (MAMC de Admisión o MGE de Alumnos) genera un trámite, se crea un registro de obligación en MAF. Use esta opción para agregar una obligación de forma manual.
              </CardDescription>
            </div>
            <div>
              <Button
                onClick={() => setShowAddObligationModal(true)}
                className="bg-slate-900 text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Generar Solicitud de Pago
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">ID Obligación</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Acreedor / Estudiante</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Tasa Aplicada</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 font-mono">Total Adeudado</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Fecha de Alta</th>
                  <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estado de Cuenta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {obligations.map((ab) => (
                  <tr key={ab.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3 font-mono font-black text-slate-900">{ab.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900 uppercase">{ab.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-bold block">DNI: {ab.studentDni} | Periodo: {ab.period}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-805">{ab.conceptName}</div>
                      <span className="text-[9.5px] text-[#9F062A] font-black font-mono leading-none">{ab.conceptCode}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-950 font-black">
                      S/. {ab.finalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono">{ab.dateCreated}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase block text-center w-28 ${
                        ab.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        ab.status === "En Proceso" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        ab.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                        ab.status === "Exonerado" ? "bg-purple-100 text-purple-800 border border-purple-150" :
                        "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {ab.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
