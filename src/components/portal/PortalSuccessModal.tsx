import React from "react";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalData {
  name: string;
  lastName: string;
  email: string;
  programName: string;
}

interface PortalSuccessModalProps {
  data: SuccessModalData | null;
  onClose: () => void;
}

export const PortalSuccessModal: React.FC<PortalSuccessModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase text-[#9F062A] tracking-widest block font-mono">REGISTRO COMPLETADO</span>
          <h3 className="text-xl font-black text-slate-900 uppercase mt-1">¡Pre-Inscripción Exitosa!</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
            Estimado(a) <strong className="text-slate-900">{data.name} {data.lastName}</strong>, tu pre-inscripción al programa de <strong className="text-[#9F062A]">{data.programName}</strong> ha sido registrada en el sistema oficial del IESTP San Francisco de Asís.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-slate-200 pb-1.5">
            <span className="text-slate-500 uppercase font-bold text-[10px]">Correo Electrónico:</span>
            <span className="text-slate-900 font-bold">{data.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 uppercase font-bold text-[10px]">Acceso a Intranet:</span>
            <span className="text-emerald-700 font-bold">Credenciales Enviadas al Correo</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-widest shadow-md cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
