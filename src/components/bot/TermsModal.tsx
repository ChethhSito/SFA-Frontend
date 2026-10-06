import React from "react";
import { X, ShieldCheck, Lock, CheckCircle2, GraduationCap } from "lucide-react";
import { motion } from "motion/react";

interface TermsModalProps {
  onClose: () => void;
}

export default function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-[#9F062A] to-[#800521] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Políticas de Uso • SFABot</h3>
              <p className="text-[10px] text-amber-200/90 font-medium">Asistente Virtual Institucional SFA</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed custom-scrollbar">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-[11px] font-bold flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Este asistente brinda orientación virtual oficial sobre Admisión 2026-I, carreras técnicas, matrículas y trámites institucionales.
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2.5 items-start">
              <CheckCircle2 className="w-4 h-4 text-[#9F062A] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px]">1. Orientación Académica Oficial</h4>
                <p className="text-slate-600 mt-0.5">
                  Las respuestas ofrecidas por SFABot son informativas y basadas en la reglamentación del IESTP San Francisco de Asís y las directivas del MINEDU.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <Lock className="w-4 h-4 text-[#9F062A] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px]">2. Protección de Datos (Ley N° 29733)</h4>
                <p className="text-slate-600 mt-0.5">
                  El asistente no solicitará datos bancarios ni contraseñas privadas. La información de contacto proporcionada en formularios está protegida por la Ley de Protección de Datos Personales del Perú.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 text-[#9F062A] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase text-[11px]">3. Canales Oficiales</h4>
                <p className="text-slate-600 mt-0.5">
                  Para trámites formales de mesa de partes, solicitudes de certificados u homologaciones, diríjase a Secretaría Académica o comuníquese a `contacto@iestpsfa.edu.pe`.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#9F062A] hover:bg-[#800521] text-white text-xs font-bold uppercase rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
