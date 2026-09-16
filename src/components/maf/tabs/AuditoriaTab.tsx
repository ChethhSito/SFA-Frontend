import React from "react";
import { History } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageTransition from "../../ui/PageTransition";
import { MafAuditLog } from "../mafTypes";

interface AuditoriaTabProps {
  auditLogs: MafAuditLog[];
}

export const AuditoriaTab: React.FC<AuditoriaTabProps> = ({ auditLogs }) => {
  return (
    <PageTransition id="auditoria" className="space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Registro de Auditoría Integral (Log de Actividades del MAF)
          </CardTitle>
          <CardDescription>
            Registro inmutable e intransferible de todas las transacciones financieras, aprobaciones de caja, exoneraciones dictadas y de las tasas ingresadas en el sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
            Auditoría General Administrativa — Trazabilidad Completa
          </div>

          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar bg-slate-900 text-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-800 rounded-lg border-l-4 border-l-amber-500 text-xs md:flex items-start justify-between font-mono gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-slate-700 text-amber-400 text-[10px] font-black font-mono">
                      {log.id}
                    </span>
                    <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                    <span className="px-1.5 bg-blue-900 text-blue-200 rounded text-[9px] font-black uppercase font-sans">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-200 font-extrabold text-[11px] leading-relaxed mt-1">
                    {log.details}
                  </p>
                </div>
                <div className="text-right shrink-0 mt-2 md:mt-0 text-[10px] font-sans text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-bold uppercase font-mono tracking-wider block mb-1">
                    USER: {log.user}
                  </span>
                  <span>MODULE: {log.module}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
