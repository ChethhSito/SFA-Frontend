import React from "react";
import { MafExoneration } from "../mafTypes";

interface ExonerationModalProps {
  show: boolean;
  onClose: () => void;
  exonerationForm: {
    studentDni: string;
    studentName: string;
    type: MafExoneration["type"];
    percentage: number;
    conceptCode: string;
    reason: string;
  };
  setExonerationForm: React.Dispatch<React.SetStateAction<{
    studentDni: string;
    studentName: string;
    type: MafExoneration["type"];
    percentage: number;
    conceptCode: string;
    reason: string;
  }>>;
  setFormExonerationDni: (dni: string) => void;
  handleAddExoneration: (e: React.FormEvent) => void;
}

export const ExonerationModal: React.FC<ExonerationModalProps> = ({
  show,
  onClose,
  exonerationForm,
  setExonerationForm,
  setFormExonerationDni,
  handleAddExoneration
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-purple-900 text-white p-5 border-b-2 border-purple-500">
          <h3 className="text-xs font-black uppercase tracking-widest">Registrar Beca o Exoneración Escolar</h3>
          <p className="text-[10px] text-purple-200 font-bold mt-1 leading-relaxed">Aplique exoneraciones basadas en resoluciones o convenios autorizados.</p>
        </div>

        <form onSubmit={handleAddExoneration} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI del Alumno Afectado *</label>
            <input
              type="text"
              required
              placeholder="8 dígitos"
              value={exonerationForm.studentDni}
              onChange={(e) => setFormExonerationDni(e.target.value)}
              className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold font-mono rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Completo del Estudiante</label>
            <input
              type="text"
              required
              placeholder="p.ej. Alva Mendoza, Gino"
              value={exonerationForm.studentName}
              onChange={(e) => setExonerationForm({ ...exonerationForm, studentName: e.target.value })}
              className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Tipo de Exención *</label>
              <select
                value={exonerationForm.type}
                onChange={(e) => {
                  const val = e.target.value as any;
                  const pct = val.includes("Integral") || val.includes("Exoneración") ? 100 : 50;
                  setExonerationForm({ ...exonerationForm, type: val, percentage: pct });
                }}
                className="w-full p-2.5 border border-slate-205 text-xs font-extrabold text-slate-850 bg-white rounded-lg"
              >
                <option value="Beca Integral (100%)">Beca Integral (100%)</option>
                <option value="Media Beca (50%)">Media Beca (50%)</option>
                <option value="Exoneración por Convenio">Exoneración por Convenio</option>
                <option value="Caso Social">Caso Social Especial</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Porcentaje Descuento %</label>
              <input
                type="number"
                readOnly
                value={exonerationForm.percentage}
                className="w-full p-2.5 border border-slate-205 bg-slate-100 text-xs font-black font-mono rounded-lg focus:outline-none text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Tasa Afectada *</label>
            <select
              required
              value={exonerationForm.conceptCode}
              onChange={(e) => setExonerationForm({ ...exonerationForm, conceptCode: e.target.value })}
              className="w-full p-2.5 border border-slate-205 text-xs font-extrabold text-slate-850 bg-white rounded-lg focus:outline-none"
            >
              <option value="MAT01">MAT01 - Matrícula Semestral Regular</option>
              <option value="ADM01">ADM01 - Derecho de Examen de Admisión</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Resolución N° / Fundamento de Exoneración *</label>
            <textarea
              required
              rows={3}
              placeholder="Escriba el motivo técnico legal de la resolución directorial"
              value={exonerationForm.reason}
              onChange={(e) => setExonerationForm({ ...exonerationForm, reason: e.target.value })}
              className="w-full p-2.5 border border-slate-205 text-xs font-semibold rounded-lg focus:outline-none"
            />
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
              className="px-6 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
            >
              Registrar Beca
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
