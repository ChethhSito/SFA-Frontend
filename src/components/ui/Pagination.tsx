import { useEffect, useState } from 'react';

export function usePagination<T>(items: T[], initialPageSize = 10, resetKey?: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  useEffect(() => { setPage(1); }, [resetKey]);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  return {
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    page: currentPage,
    pageSize,
    pageCount,
    setPage,
    setPageSize: (size: number) => { setPageSize(size); setPage(1); },
  };
}

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  label?: string;
}

export function Pagination({ total, page, pageSize, pageCount, onPageChange, onPageSizeChange, label = 'registros' }: PaginationProps) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPage + index);
  const buttonClass = 'rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100';

  return <nav aria-label={`Paginación de ${label}`} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2">Mostrar
        <select aria-label={`Cantidad de ${label} por página`} value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-semibold text-slate-800">
          {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
        </select>
        {label} por página
      </label>
      <span>{start}–{end} de {total}</span>
    </div>
    <div className="flex items-center gap-1" aria-label={`Página ${page} de ${pageCount}`}>
      <button type="button" className={buttonClass} disabled={page === 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
      {pages.map(number => <button key={number} type="button" aria-label={`Ir a la página ${number}`} aria-current={number === page ? 'page' : undefined} className={`${buttonClass} ${number === page ? 'bg-slate-900 text-white hover:bg-slate-900' : ''}`} onClick={() => onPageChange(number)}>{number}</button>)}
      <button type="button" className={buttonClass} disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Siguiente</button>
    </div>
  </nav>;
}
