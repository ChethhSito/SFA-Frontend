import { useState } from "react";
import { 
  BookOpen, Download, ExternalLink, FileText, X, 
  CheckCircle2, ShieldCheck, Search, Filter, Sparkles
} from "lucide-react";
import { GuideAudience, guideCatalog, guideFileUrl } from "./guideCatalog";
import PageTransition from "../ui/PageTransition";

export default function GuidesLibrary({ audience }: { audience: GuideAudience }) {
  const documents = guideCatalog[audience];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selected = documents.find((document) => document.id === selectedId);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesSearch = searchTerm.trim() === "" || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition id="guides-library" className="space-y-6 text-left">
      {/* 1. Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              SECRETARÍA GENERAL • DIRECCIÓN ACADÉMICA
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Guías y Reglamentos Oficiales
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Compendio oficial de directivas, manuales de trámites de secretaría y reglamentos institucionales con certificación y firmas de validez.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-xl shadow-inner text-xs">
            <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-300 block">Normativa Aprobada</span>
              <span className="font-extrabold text-white text-[11px]">R.D. N° 0458-2005-ED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, código o tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-250 bg-slate-50/70 focus:bg-white focus:border-[#800521] focus:ring-1 focus:ring-[#800521] transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "Todos los Documentos" },
            { id: "Guías", label: "Guías Oficiales" },
            { id: "Procedimientos", label: "Procedimientos" },
            { id: "Reglamentos", label: "Reglamentos" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer select-none ${
                selectedCategory === cat.id
                  ? "bg-[#800521] text-white shadow-xs font-black"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid de Documentos Oficiales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-left">
        {filteredDocs.map((doc) => (
          <article 
            key={doc.id} 
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-3xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900 font-mono">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {doc.docCode}
                </span>
                <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase">
                  {doc.category}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-red-50/90 text-[#800521] border border-red-100 p-2.5 shrink-0 group-hover:bg-[#800521] group-hover:text-white transition-all">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-slate-900 text-sm leading-snug tracking-tight group-hover:text-[#800521] transition-colors">
                    {doc.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-normal">
                    {doc.description}
                  </p>
                </div>
              </div>

              {/* Tag de Validez Oficial */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Con Firmas y Sello Oficial
                </span>
                <span className="font-mono text-slate-400">PDF A4</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-4 pt-3 border-t border-slate-150 flex items-center gap-2 text-xs font-bold">
              <button 
                type="button" 
                onClick={() => setSelectedId(doc.id)} 
                className="flex-1 bg-[#800521] hover:bg-[#65041a] text-white py-2 px-3 rounded-xl transition-all cursor-pointer text-center font-bold text-xs shadow-xs"
              >
                Visualizar
              </button>
              <a 
                href={guideFileUrl(doc.fileName)} 
                download={doc.fileName} 
                className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3.5 rounded-xl transition-all font-bold text-xs"
                title="Descargar documento oficial en PDF"
              >
                <Download className="h-3.5 w-3.5 text-slate-600" />
                <span>Descargar</span>
              </a>
            </div>
          </article>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
            No se encontraron documentos con el criterio "{searchTerm}".
          </div>
        )}
      </div>

      {/* 4. Modal de Visualización Previa de PDF Oficial */}
      {selected && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-label={`Vista previa oficial de ${selected.title}`} 
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-xs p-3 md:p-6 animate-in fade-in"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-t-2xl bg-white px-5 py-3.5 border-b border-slate-200 shadow-md">
            <div>
              <span className="text-[9.5px] font-black uppercase text-[#800521] font-mono block">
                {selected.docCode} • CERTIFICACIÓN INSTITUCIONAL
              </span>
              <h3 className="font-black text-slate-900 text-sm md:text-base leading-tight mt-0.5">
                {selected.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={guideFileUrl(selected.fileName)} 
                download={selected.fileName}
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </a>
              <button 
                type="button" 
                onClick={() => setSelectedId(null)} 
                aria-label="Cerrar vista previa" 
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <iframe 
            title={selected.title} 
            src={guideFileUrl(selected.fileName)} 
            className="mx-auto min-h-0 w-full max-w-5xl flex-1 rounded-b-2xl bg-white shadow-2xl border-x border-b border-slate-200" 
          />
        </div>
      )}
    </PageTransition>
  );
}
