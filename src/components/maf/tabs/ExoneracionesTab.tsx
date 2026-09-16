import React from "react";
import { Percent, PlusCircle } from "lucide-react";
import Button from "../../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageTransition from "../../ui/PageTransition";
import { MafExoneration } from "../mafTypes";

interface ExoneracionesTabProps {
  exonerations: MafExoneration[];
  handleOpenAddExoneration: () => void;
  handleDeleteExoneration: (id: string, name: string) => void;
}

export const ExoneracionesTab: React.FC<ExoneracionesTabProps> = ({
  exonerations,
  handleOpenAddExoneration,
  handleDeleteExoneration
}) => {
  return (
    <PageTransition id="exoneraciones" className="space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-600" />
                Registro y Control de Becas y Exoneraciones Extraordinarias
              </CardTitle>
              <CardDescription>
                Registre estudiantes exonerados del examen de admisión o con becas institucionales del pago de derecho de matrícula regular.
              </CardDescription>
            </div>
            <div>
              <Button
                onClick={handleOpenAddExoneration}
                className="bg-purple-600 text-white hover:bg-purple-700 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/20"
              >
                <PlusCircle className="w-4 h-4" /> Registrar Beca/Exoneración
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Afectado / DNI</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Tipo de Exoneración</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Descuento (%)</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Concepto de Tasa Afectado</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Fecha Resolución</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 font-mono">Justificación / Motivo</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 text-right">Anulación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {exonerations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-450 uppercase font-black tracking-widest">
                      No se han computado becas deportivas, sociales ni exoneraciones en este periodo.
                    </td>
                  </tr>
                ) : (
                  exonerations.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50/50 transition-all text-xs">
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900 uppercase">{ex.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-bold block">DNI: {ex.studentDni}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded bg-purple-55 text-purple-750 text-[10px] font-extrabold uppercase">
                          {ex.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-purple-900 font-black text-sm">
                        {ex.percentage}%
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[9px] font-black font-mono uppercase">
                          {ex.conceptCode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">{ex.dateGranted}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 max-w-sm italic">
                        "{ex.reason}"
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteExoneration(ex.id, ex.studentName)}
                          className="p-1 px-2 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-150 rounded transition-all cursor-pointer"
                        >
                          Revocar Beca
                        </button>
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
