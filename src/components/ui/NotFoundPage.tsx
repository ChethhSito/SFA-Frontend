import React from "react";
import { AlertCircle } from "lucide-react";

interface NotFoundPageProps {
  onGoToPortal?: () => void;
}

export function NotFoundPage({ onGoToPortal }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-50 text-[#9F062A] flex items-center justify-center border border-rose-100 shadow-md mb-6 animate-pulse">
        <AlertCircle className="w-10 h-10" />
      </div>
      <span className="text-[#9F062A] font-mono font-black text-xs uppercase tracking-widest block mb-2">
        ERROR 404 • PÁGINA NO ENCONTRADA
      </span>
      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
        Página No Encontrada
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-medium mb-8">
        La página o ruta a la que estás intentando acceder no existe o fue movida dentro del Portal Institucional IESTP San Francisco de Asís.
      </p>
      {onGoToPortal && (
        <button
          onClick={onGoToPortal}
          className="py-3.5 px-8 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          Volver al Portal Principal
        </button>
      )}
    </div>
  );
}

export default NotFoundPage;
