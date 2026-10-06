import React from "react";
import { ShieldAlert } from "lucide-react";

interface ApprovePaymentConfirmModalProps {
  isOpen: boolean;
  approvePaymentDni: string | null;
  approvePaymentType: "admision" | "matricula";
  onClose: () => void;
  onConfirm: () => void;
}

export const ApprovePaymentConfirmModal: React.FC<ApprovePaymentConfirmModalProps> = ({
  isOpen,
  approvePaymentDni,
  approvePaymentType,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left animate-scale-up">
        <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
          <span className="font-extrabold text-[10px] uppercase tracking-widest">¿Está seguro de aprobar?</span>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer text-xs font-bold"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 text-emerald-600">
            <ShieldAlert className="w-10 h-10 shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-950 uppercase">Confirmar Aprobación</h4>
              <p className="text-[10px] text-slate-555 font-semibold mt-0.5">
                ¿Está seguro de que desea aprobar el pago para este registro? Esta acción actualizará la intranet académica de inmediato.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-200 leading-relaxed text-[11px] text-slate-700 font-medium">
            <p>
              • Identificador / DNI: <strong className="text-slate-950 font-extrabold">{approvePaymentDni}</strong>
            </p>
            <p>
              • Concepto Tributo:{" "}
              <strong className="text-slate-950 font-extrabold">
                {approvePaymentType === "admision"
                  ? "Derecho de Examen Ordinario (S/. 120.00)"
                  : "Derecho Regular de Matrícula (S/. 250.00)"}
              </strong>
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            Cerrar sin aprobar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-colors"
          >
            Confirmar y cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
