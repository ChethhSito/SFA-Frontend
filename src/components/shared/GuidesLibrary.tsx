import { useState } from "react";
import { BookOpen, Download, ExternalLink, FileText, Info, X } from "lucide-react";
import { GuideAudience, guideCatalog, guideFileUrl } from "./guideCatalog";

export default function GuidesLibrary({ audience }: { audience: GuideAudience }) {
  const documents = guideCatalog[audience];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = documents.find((document) => document.id === selectedId);

  return (
    <section className="space-y-6 text-left">
      <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-amber-300" />
          <div>
            <h1 className="text-xl font-black">Guías y reglamentos</h1>
            <p className="mt-1 text-sm text-rose-50">
              {audience === "student" ? "Documentos para estudiantes" : "Documentos para docentes"}
            </p>
          </div>
        </div>
      </header>

      <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Los PDF publicados aquí son ejemplos para probar el portal. No son reglamentos aprobados ni sustituyen los documentos oficiales de la institución.
      </p>

      {(["Guías", "Procedimientos", "Reglamentos"] as const).map((category) => (
        <div key={category} className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">{category}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {documents.filter((document) => document.category === category).map((document) => (
              <article key={document.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-rose-50 p-2 text-[#800521]"><FileText className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">{document.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{document.description}</p>
                    <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-950">PDF de demostración</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs font-bold">
                  <button type="button" onClick={() => setSelectedId(document.id)} className="rounded-lg bg-[#800521] px-3 py-2 text-white hover:bg-[#65041a]">Vista previa</button>
                  <a href={guideFileUrl(document.fileName)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"><ExternalLink className="h-3.5 w-3.5" /> Abrir PDF</a>
                  <a href={guideFileUrl(document.fileName)} download={document.fileName} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Descargar</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      {selected && (
        <div role="dialog" aria-modal="true" aria-label={`Vista previa de ${selected.title}`} className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 p-3 md:p-6">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-t-xl bg-white px-4 py-3">
            <div><p className="font-bold text-slate-900">{selected.title}</p><p className="text-xs text-amber-800">Documento de demostración</p></div>
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Cerrar vista previa" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>
          <iframe title={selected.title} src={guideFileUrl(selected.fileName)} className="mx-auto min-h-0 w-full max-w-5xl flex-1 rounded-b-xl bg-white" />
        </div>
      )}
    </section>
  );
}
