import React from "react";
import { Info } from "lucide-react";

interface RegisterVoucherModalProps {
  show: boolean;
  onClose: () => void;
  voucherForm: {
    operationNumber: string;
    bankName: string;
    paymentDate: string;
    amountPaid: number;
    observations: string;
  };
  setVoucherForm: React.Dispatch<React.SetStateAction<{
    operationNumber: string;
    bankName: string;
    paymentDate: string;
    amountPaid: number;
    observations: string;
  }>>;
  handleRegisterVoucher: (e: React.FormEvent) => void;
}

export const RegisterVoucherModal: React.FC<RegisterVoucherModalProps> = ({
  show,
  onClose,
  voucherForm,
  setVoucherForm,
  handleRegisterVoucher
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-[#9F062A] text-white p-5 border-b-2 border-amber-400">
          <h3 className="text-xs font-black uppercase tracking-widest">Registrar Comprobante Bancario Físico</h3>
          <p className="text-[10px] text-amber-200 font-bold mt-1 leading-relaxed">Asocie el dinero bancario de ventanilla a la cuenta del estudiante.</p>
        </div>

        <form onSubmit={handleRegisterVoucher} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Operación Bancaria N° *</label>
              <input
                type="text"
                required
                placeholder="Ej. 908123"
                value={voucherForm.operationNumber}
                onChange={(e) => setVoucherForm({ ...voucherForm, operationNumber: e.target.value })}
                className="w-full p-2.5 border border-slate-205 text-xs font-bold font-mono rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Banco Emisor *</label>
              <select
                value={voucherForm.bankName}
                onChange={(e) => setVoucherForm({ ...voucherForm, bankName: e.target.value })}
                className="w-full p-2.5 border border-slate-205 text-xs font-extrabold text-slate-800 rounded-lg bg-white"
              >
                <option value="Banco de la Nación">Banco de la Nación</option>
                <option value="BCP">BCP (Agente/App)</option>
                <option value="BBVA">BBVA Continental</option>
                <option value="Interbank">Interbank</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Monto Depositado *</label>
              <input
                type="number"
                required
                min={0.1}
                step={0.01}
                value={voucherForm.amountPaid}
                onChange={(e) => setVoucherForm({ ...voucherForm, amountPaid: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-205 text-xs font-bold font-mono rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Fecha de Operación</label>
              <input
                type="date"
                required
                value={voucherForm.paymentDate}
                onChange={(e) => setVoucherForm({ ...voucherForm, paymentDate: e.target.value })}
                className="w-full p-2.5 border border-slate-205 text-xs font-bold font-mono rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Observaciones Internas de Caja</label>
            <input
              type="text"
              placeholder="Opcional..."
              value={voucherForm.observations}
              onChange={(e) => setVoucherForm({ ...voucherForm, observations: e.target.value })}
              className="w-full p-2.5 border border-slate-205 text-xs font-bold rounded-lg"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-205 rounded-lg flex items-start gap-2 text-[10.5px] font-semibold text-slate-500 leading-normal">
            <Info className="w-4 h-4 shrink-0 text-[#9F062A]" />
            <p>
              Asegúrese de constatar que el importe coincida exactamente con la tasa adeudada antes de guardar el registro en MAF.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
            >
              Registrar Depósito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
