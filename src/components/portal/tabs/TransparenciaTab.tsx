import React from "react";
import { FileText, ArrowRight } from "lucide-react";
import { transparencyDocs } from "../portalData";

export const TransparenciaTab: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">PORTAL DE TRANSPARENCIA INSTITUCIONAL</span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Reglamentos y Documentos Oficiales</h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 max-w-2xl mx-auto leading-relaxed">
          Acceso público a la normativa académica, resoluciones de licenciamiento, reglamentos de titulación y directivas de gestión institucional del IESTP San Francisco de Asís.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transparencyDocs.map((doc, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs hover:border-[#9F062A] transition-all hover:shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-[#9F062A]">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[9.5px] font-mono font-bold text-[#9F062A] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {doc.code}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase leading-snug">{doc.title}</h3>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{doc.size}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {doc.desc}
              </p>
            </div>

            <button className="pt-3 border-t border-slate-100 text-xs text-[#9F062A] font-bold uppercase tracking-wider flex items-center justify-between hover:text-[#800521] transition-colors cursor-pointer w-full">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Descargar PDF Oficial</span>
              <ArrowRight className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
