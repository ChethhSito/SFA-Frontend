import React from "react";

interface ObserveObligationModalProps {
  show: boolean;
  onClose: () => void;
  observationText: string;
  setObservationText: (val: string) => void;
  handleConfirmObservePayment: () => void;
}

export const ObserveObligationModal: React.FC<ObserveObligationModalProps> = ({
  show,
  onClose,
  observationText,
  setObservationText,
  handleConfirmObservePayment
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-slate-900 text-white p-5">
          <h3 className="text-xs font-black uppercase tracking-widest">Declarar Pago como Observado</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Escriba el detalle de por qué el voucher no se aprueba.</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Detalle de Observación / Corrección *</label>
            <textarea
              required
              rows={4}
              placeholder="Ej. El código de operación no coincide con el estado de cuenta diario. / Monto incompleto, tasas son de S/. 250 y abonó S/. 120."
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              className="w-full p-2.5 border border-slate-205 text-xs font-semibold rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase cursor-pointer hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmObservePayment}
              className="px-5 py-2 rounded-xl bg-[#9F062A] text-white hover:bg-[#800521] font-black text-[10px] uppercase tracking-widest cursor-pointer"
            >
              Observar Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
