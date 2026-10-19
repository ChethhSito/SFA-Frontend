import React, { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "warning" | "info";
export interface ToastNotice { id: number; message: string; kind: ToastKind }

const styles = {
  success: { icon: CheckCircle2, title: "Cambio guardado", color: "border-emerald-300 bg-emerald-50 text-emerald-950" },
  error: { icon: AlertCircle, title: "No se pudo completar", color: "border-red-300 bg-red-50 text-red-950" },
  warning: { icon: AlertTriangle, title: "Revisa los datos", color: "border-amber-300 bg-amber-50 text-amber-950" },
  info: { icon: Info, title: "Información", color: "border-sky-300 bg-sky-50 text-sky-950" },
};

export default function Toast({ notice, onClose }: { notice: ToastNotice; onClose: () => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(onClose, notice.kind === "success" ? 5000 : 9000);
    return () => window.clearTimeout(timer);
  }, [notice.id, notice.kind, paused, onClose]);
  const { icon: Icon, title, color } = styles[notice.kind];
  return <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-[1200] pointer-events-none sm:w-96 max-w-[calc(100vw-2.5rem)]">
    <div role={notice.kind === "error" || notice.kind === "warning" ? "alert" : "status"}
      aria-atomic="true" className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${color}`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0 flex-1"><p className="font-bold text-sm">{title}</p><p className="text-sm mt-1 break-words">{notice.message}</p></div>
      <button type="button" aria-label="Cerrar aviso" onClick={onClose} className="shrink-0 rounded p-1 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2"><X className="w-4 h-4" /></button>
    </div>
  </div>;
}
