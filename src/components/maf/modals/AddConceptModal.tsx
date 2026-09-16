import React from "react";
import { MafConcept } from "../mafTypes";

interface AddConceptModalProps {
  show: boolean;
  onClose: () => void;
  conceptForm: Omit<MafConcept, "id">;
  setConceptForm: React.Dispatch<React.SetStateAction<Omit<MafConcept, "id">>>;
  handleAddConcept: (e: React.FormEvent) => void;
}

export const AddConceptModal: React.FC<AddConceptModalProps> = ({
  show,
  onClose,
  conceptForm,
  setConceptForm,
  handleAddConcept
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-[#9F062A] text-white p-5">
          <h3 className="text-xs font-black uppercase tracking-widest">Crear Nueva Tasa en el Catálogo</h3>
          <p className="text-[10px] text-amber-250 font-bold mt-1">Registre un concepto institucional de cobro.</p>
        </div>

        <form onSubmit={handleAddConcept} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Código de Tasa (Ej: INS02) *</label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="Ej: MAT02"
              value={conceptForm.code}
              onChange={(e) => setConceptForm({ ...conceptForm, code: e.target.value })}
              className="w-full p-2 border border-slate-205 text-xs font-bold font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Nombre del Concepto *</label>
            <input
              type="text"
              required
              placeholder="Ej: Tasa de Duplicado de Certificado"
              value={conceptForm.name}
              onChange={(e) => setConceptForm({ ...conceptForm, name: e.target.value })}
              className="w-full p-2 border border-slate-205 text-xs font-bold rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Arancel (S/.) *</label>
              <input
                type="number"
                required
                min={1}
                value={conceptForm.amount}
                onChange={(e) => setConceptForm({ ...conceptForm, amount: Number(e.target.value) })}
                className="w-full p-2 border border-slate-205 text-xs font-bold font-mono rounded-lg"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Categoría *</label>
              <select
                value={conceptForm.category}
                onChange={(e) => setConceptForm({ ...conceptForm, category: e.target.value as any })}
                className="w-full p-2 border border-slate-205 text-xs font-extrabold text-slate-800 bg-white rounded-lg"
              >
                <option value="Admisión">Admisión</option>
                <option value="Matrícula">Matrícula</option>
                <option value="Servicios">Servicios</option>
                <option value="Trámites">Trámites</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Descripción Informativa</label>
            <textarea
              rows={2}
              value={conceptForm.description}
              onChange={(e) => setConceptForm({ ...conceptForm, description: e.target.value })}
              className="w-full p-2 border border-slate-205 text-xs font-semibold rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase cursor-pointer hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-widest cursor-pointer"
            >
              Guardar Tasa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
