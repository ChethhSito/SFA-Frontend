import React from "react";
import { Unlock } from "lucide-react";
import Button from "../../ui/Button";

interface EditGradeModalProps {
  isOpen: boolean;
  activeStudentName: string;
  activeVariableId: string;
  tempGrade: string;
  gradeErrorMessage: string;
  onGradeChange: (value: string) => void;
  onSaveGrade: () => void;
  onClose: () => void;
}

export const EditGradeModal: React.FC<EditGradeModalProps> = ({
  isOpen,
  activeStudentName,
  activeVariableId,
  tempGrade,
  gradeErrorMessage,
  onGradeChange,
  onSaveGrade,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-150 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center space-y-1">
          <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <Unlock className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase">Establecer Nueva Nota</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-normal font-bold">
            Modificando nota en <span className="text-slate-800 uppercase font-black">{activeStudentName}</span> <br />
            para el indicador <span className="text-[#8B0026] font-mono font-extrabold">[{activeVariableId}]</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-slate-500 uppercase text-[9px] font-black tracking-wider text-left">Firma Digital Habilitada. Nueva Nota:</label>
          <input
            type="text"
            autoFocus
            placeholder="Ejemplo: 14.5"
            value={tempGrade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="w-full text-center py-3 border border-slate-200 rounded-xl font-mono text-2xl font-black text-[#8B0521] focus:outline-[#8B0026] select-all bg-slate-50/50"
          />
          <p className="text-[9.5px] text-slate-400 font-bold leading-normal text-center">
            Rango exigido de 0.0 a 20.0 (se permiten números decimales, no letras).
          </p>
        </div>

        {gradeErrorMessage && (
          <p className="text-[10px] text-[#8B0026] font-extrabold text-center uppercase animate-pulse">{gradeErrorMessage}</p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1 py-2.5 font-bold uppercase text-[10px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSaveGrade}
            variant="primary"
            className="flex-1 py-2.5 font-bold uppercase text-[10px] bg-[#8B0026] text-white"
          >
            Guardar Nota
          </Button>
        </div>
      </div>
    </div>
  );
};
