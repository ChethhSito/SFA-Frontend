import React from "react";
import { Search } from "lucide-react";

export const filterControl = "mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 focus:outline-[#9F062A]";
export default function MgeListFilters({ label, query, onQuery, placeholder = "Nombre o DNI", filters, onClear }: {
  label: string; query: string; onQuery: (value: string) => void; placeholder?: string;
  filters: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }[];
  onClear: () => void;
}) {
  return <section aria-label={label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-end gap-3">
    <label className="min-w-[200px] flex-[1.6] text-xs font-semibold text-slate-500">Buscador<div className="relative mt-1.5"><Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input aria-label={`Buscar en ${label.toLowerCase()}`} placeholder={placeholder} value={query} onChange={(event) => onQuery(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm font-normal text-slate-700 focus:outline-[#9F062A]" /></div></label>
    {filters.map((filter) => <label key={filter.label} className="min-w-[150px] flex-1 text-xs font-semibold text-slate-500">{filter.label}<select value={filter.value} onChange={(event) => filter.onChange(event.target.value)} className={filterControl}>{filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}
    <button type="button" onClick={onClear} className="h-11 rounded-lg px-3 text-xs font-semibold text-[#9F062A] hover:bg-rose-50">Limpiar</button>
  </div></section>;
}
