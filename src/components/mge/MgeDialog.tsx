import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function MgeDialog({ title, onClose, busy = false, children }: { title: string; onClose: () => void; busy?: boolean; children: React.ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const controls = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]') || []) as HTMLElement[];
    (controls()[0] || ref.current)?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) close.current();
      if (event.key === "Tab") {
        const elements = controls(), first = elements[0], last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); ref.current?.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); previous?.focus(); };
  }, [busy]);
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"><section ref={ref} role="dialog" tabIndex={-1} aria-modal="true" aria-labelledby={id} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"><header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5"><h2 id={id} className="text-lg font-bold text-slate-900">{title}</h2><button type="button" aria-label="Cerrar detalle" disabled={busy} onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><X className="h-5 w-5" /></button></header><div className="space-y-5 p-6">{children}</div></section></div>;
}
