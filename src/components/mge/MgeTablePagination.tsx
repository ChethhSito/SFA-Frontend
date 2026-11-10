import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MgeTablePagination({ total, page, pageSize, onPage, onPageSize, label }: {
  total: number; page: number; pageSize: number; onPage: (page: number) => void; onPageSize: (size: number) => void; label: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages), start = (current - 1) * pageSize;
  return <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
    <p role="status">Mostrando {total ? start + 1 : 0}–{Math.min(start + pageSize, total)} de {total} {label}</p>
    <div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-2">Por página<select aria-label={`Filas por página de ${label}`} value={pageSize} onChange={(event) => { onPageSize(Number(event.target.value)); onPage(1); }} className="rounded-lg border border-slate-200 bg-white p-2">{[10, 20, 50].map((size) => <option key={size}>{size}</option>)}</select></label>
      <nav aria-label={`Paginación de ${label}`} className="flex items-center gap-3"><button type="button" aria-label="Página anterior" disabled={current === 1} onClick={() => onPage(current - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span>Página {current} de {pages}</span><button type="button" aria-label="Página siguiente" disabled={current === pages} onClick={() => onPage(current + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></nav>
    </div>
  </footer>;
}
