import React from "react";
import { X, Users } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { ProgramId } from "../../../types";
import { StudentFormState } from "../mgeTypes";

interface Props {
  studentForm: StudentFormState;
  onFormChange: (form: StudentFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function MgeAddStudentModal({ studentForm, onFormChange, onSubmit, onClose }: Props) {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();
  const set = (partial: Partial<StudentFormState>) => onFormChange({ ...studentForm, ...partial });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-105 max-w-2xl w-full overflow-hidden transform scale-100 transition-all max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-[#9F062A]" /> Registrar Estudiante Directo
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5 text-xs text-slate-750">
          {/* Personal details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI (8 dígitos) *</label>
              <input type="text" maxLength={8} required value={studentForm.dni} onChange={(e) => set({ dni: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                placeholder="Escriba DNI..." />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre *</label>
              <input type="text" required value={studentForm.name} onChange={(e) => set({ name: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                placeholder="Nombre del alumno..." />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Apellidos *</label>
              <input type="text" required value={studentForm.lastName} onChange={(e) => set({ lastName: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                placeholder="Apellidos institucionales..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">F. de Nacimiento</label>
              <input type="date" value={studentForm.birthDate} onChange={(e) => set({ birthDate: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Género</label>
              <select value={studentForm.gender} onChange={(e) => set({ gender: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]">
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Teléfono</label>
              <input type="text" value={studentForm.phone} onChange={(e) => set({ phone: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                placeholder="999-999-999" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Email Institucional *</label>
              <input type="email" required value={studentForm.email} onChange={(e) => set({ email: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                placeholder="estudiante@is-sanfrancisco.edu.pe" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Dirección Completa</label>
              <input type="text" value={studentForm.address} onChange={(e) => set({ address: e.target.value })}
                className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                placeholder="Av. Los Ruiseñores Nro 120" />
            </div>
          </div>

          {/* Program and shift */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block border-b border-slate-200 pb-1.5">
              Asignación Curricular de Vacante
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Programa Profesional</label>
                <select value={studentForm.programId} onChange={(e) => set({ programId: e.target.value as ProgramId })}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none">
                  {ACADEMIC_PROGRAMS.map((prog) => <option key={prog.id} value={prog.id}>{prog.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Turno Asignado</label>
                <select value={studentForm.shift} onChange={(e) => set({ shift: e.target.value as any })}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none">
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block border-b border-slate-200 pb-1.5">
              Caso de Emergencia y Contacto
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre</label>
                <input type="text" value={studentForm.emergencyName} onChange={(e) => set({ emergencyName: e.target.value })}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                  placeholder="Nombre del apoderado..." />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Teléfono</label>
                <input type="text" value={studentForm.emergencyPhone} onChange={(e) => set({ emergencyPhone: e.target.value })}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                  placeholder="999-000-111" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Relación / Parentesco</label>
                <input type="text" value={studentForm.emergencyRelation} onChange={(e) => set({ emergencyRelation: e.target.value })}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                  placeholder="Ej. Padre / Hno" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer">
              Cancelar
            </button>
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#9F062A] hover:bg-[#820522] text-white font-bold uppercase tracking-wider transition-all shadow-md shadow-[#9F062A]/20 cursor-pointer">
              Registrar & Matricular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
