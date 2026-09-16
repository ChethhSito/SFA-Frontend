import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

interface PortalFooterProps {
  setCurrentTab: (tab: "inicio" | "nosotros" | "programas" | "admision" | "transparencia" | "contactanos") => void;
  setSelectedProgramId: (id: string) => void;
  onEnterIntranet: () => void;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  setCurrentTab,
  setSelectedProgramId,
  onEnterIntranet
}) => {
  return (
    <footer className="bg-[#4D0213] text-slate-200 border-t border-red-950 text-xs py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/SFA-Logo.jpeg"
              alt="Logo Oficial IESTP San Francisco de Asís"
              className="w-10 h-10 object-contain rounded-full border-2 border-[#CFA020] bg-white p-0.5 shadow-md shrink-0"
            />
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-tight leading-tight">IESTP San Francisco de Asís</h4>
              <span className="text-[9.5px] font-mono font-bold text-amber-300 uppercase block leading-none mt-0.5">Luz y Verdad • VMT</span>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium text-xs">
            Educación superior tecnológica pública de calidad en Villa María del Triunfo. Formación profesional modular con título a Nombre de la Nación.
          </p>
          <span className="text-[10px] text-amber-300 font-mono font-extrabold block">
            RESOLUCIÓN MINEDU: R.M. 124-2021
          </span>
        </div>

        <div>
          <h5 className="text-white font-extrabold uppercase tracking-wider mb-3 text-[11px]">Carreras Licenciadas</h5>
          <ul className="space-y-2 text-[11px] font-medium">
            <li><button onClick={() => { setSelectedProgramId("electronica"); setCurrentTab("programas"); }} className="hover:text-amber-300 transition-colors text-slate-200 cursor-pointer">Electricidad Industrial</button></li>
            <li><button onClick={() => { setSelectedProgramId("contabilidad"); setCurrentTab("programas"); }} className="hover:text-amber-300 transition-colors text-slate-200 cursor-pointer">Contabilidad Financiera</button></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-extrabold uppercase tracking-wider mb-3 text-[11px]">Enlaces de Interés</h5>
          <ul className="space-y-2 text-[11px] font-medium">
            <li><button onClick={() => setCurrentTab("admision")} className="hover:text-amber-300 transition-colors text-slate-200 cursor-pointer">Pre-Inscripción 2026-I</button></li>
            <li><button onClick={() => setCurrentTab("transparencia")} className="hover:text-amber-300 transition-colors text-slate-200 cursor-pointer">Portal de Transparencia</button></li>
            <li><button onClick={onEnterIntranet} className="hover:text-amber-300 transition-colors text-slate-200 cursor-pointer">Intranet Académica</button></li>
          </ul>
        </div>

        <div className="space-y-2 font-medium">
          <h5 className="text-white font-extrabold uppercase tracking-wider mb-3 text-[11px]">Ubicación Institucional</h5>
          <p className="flex items-center gap-1.5 text-slate-200"><MapPin className="w-4 h-4 text-amber-300 shrink-0" /> Av. Pachacútec Cdra. 50, Villa María del Triunfo</p>
          <p className="flex items-center gap-1.5 text-slate-200"><Phone className="w-4 h-4 text-amber-300 shrink-0" /> (01) 500 6177</p>
          <p className="flex items-center gap-1.5 text-slate-200"><Mail className="w-4 h-4 text-amber-300 shrink-0" /> admision@iestpsfa.edu.pe</p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-rose-950/60 mt-10 pt-6 text-center text-[10px] text-slate-300 font-medium">
        &copy; 2026 IESTP San Francisco de Asís. Todos los derechos reservados. Villa María del Triunfo, Lima - Perú.
      </div>
    </footer>
  );
};
