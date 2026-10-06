import React from "react";
import { MafConcept } from "../mafTypes";

interface AddObligationModalProps {
  show: boolean;
  onClose: () => void;
  concepts: MafConcept[];
  obligationForm: {
    studentDni: string;
    studentName: string;
    conceptId: string;
    period: string;
  };
  setObligationForm: React.Dispatch<React.SetStateAction<{
    studentDni: string;
    studentName: string;
    conceptId: string;
    period: string;
  }>>;
  setFormStudentByDni: (dni: string) => void;
  handleCreateObligation: (e: React.FormEvent) => void;
}

export const AddObligationModal: React.FC<AddObligationModalProps> = ({
  show,
  onClose,
  concepts,
  obligationForm,
  setObligationForm,
  setFormStudentByDni,
  handleCreateObligation
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-slate-900 text-white p-5 border-b-2 border-amber-500">
          <h3 className="text-xs font-black uppercase tracking-widest">Generar Obligación de Pago Académica</h3>
          <p className="text-[10px] text-slate-450 font-bold mt-1 leading-relaxed">Cárguelo como parte de los requisitos escolares del estudiante.</p>
        </div>

        <form onSubmit={handleCreateObligation} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI del Alumno / Postulante *</label>
            <input
              type="text"
              required
              placeholder="8 dígitos"
              value={obligationForm.studentDni}
              onChange={(e) => setFormStudentByDni(e.target.value)}
              className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold font-mono rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Completo del Estudiante *</label>
            <input
              type="text"
              required
              placeholder="Apellidos, Nombres"
              value={obligationForm.studentName}
              onChange={(e) => setObligationForm({ ...obligationForm, studentName: e.target.value })}
              className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Seleccionar Tasa Arbitrada del Catálogo *</label>
            <select
              required
              value={obligationForm.conceptId}
              onChange={(e) => setObligationForm({ ...obligationForm, conceptId: e.target.value })}
              className="w-full p-2.5 border border-slate-205 bg-white text-xs font-extrabold text-slate-800 rounded-lg"
            >
              <option value="">-- Seleccionar Tasa --</option>
              {concepts.filter(c => c.active).map(c => (
                <option key={c.id} value={c.id}>{c.name} - S/. {c.amount}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Periodo Académico</label>
            <select
              value={obligationForm.period}
              onChange={(e) => setObligationForm({ ...obligationForm, period: e.target.value })}
              className="w-full p-2.5 border border-slate-205 bg-white text-xs font-extrabold text-slate-800 rounded-lg"
            >
              <option value="2026-I">2026-I</option>
              <option value="2026-II">2026-II</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
            <button
              type="reset"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
            >
              Generar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
