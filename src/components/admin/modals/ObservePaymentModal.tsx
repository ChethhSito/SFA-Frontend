import React from "react";
import Button from "../../ui/Button";

interface ObservePaymentModalProps {
  isOpen: boolean;
  observePaymentReason: string;
  setObservePaymentReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const ObservePaymentModal: React.FC<ObservePaymentModalProps> = ({
  isOpen,
  observePaymentReason,
  setObservePaymentReason,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left animate-scale-up">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <span className="font-extrabold text-[11px] uppercase tracking-widest">Observar Pago de Admisión</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-[11px] text-red-800 font-bold leading-relaxed">
              Defina el motivo de la observacion de esta operacion bancaria. El postulante podra visualizar la nota y volver a registrar su comprobante corregido.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">
              Motivos Predeterminados
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                "Monto depositado no corresponde a la tasa (S/. 120.00).",
                "El numero de operacion bancaria no coincide con el voucher.",
                "La captura de imagen del voucher esta borrosa o ilegible.",
                "El comprobante de pago recibido ya ha sido registrado previamente.",
                "El depositante indicado no coincide con sus datos de postulante.",
              ].map((motivo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setObservePaymentReason(motivo)}
                  className="text-left text-[11px] p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-350 transition-all font-semibold text-slate-700 cursor-pointer"
                >
                  {motivo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">
              Mensaje de Observacion Personalizado
            </label>
            <textarea
              rows={3}
              value={observePaymentReason}
              onChange={(e) => setObservePaymentReason(e.target.value)}
              placeholder="Escriba detalle explicativo..."
              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9F062A]"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="font-bold cursor-pointer rounded border-slate-300 text-slate-705"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            size="sm"
            className="font-bold bg-[#9F062A] text-white hover:bg-[#800521] cursor-pointer rounded"
          >
            Enviar Observacion
          </Button>
        </div>
      </div>
    </div>
  );
};
