import React from "react";
import { Lock } from "lucide-react";

interface SecurePinModalProps {
  isOpen: boolean;
  activeStudentName: string;
  activeVariableId: string;
  enteredPin: string;
  errorMessage: string;
  keypadNumbers: number[];
  onPressDigit: (digit: number) => void;
  onClearPin: () => void;
  onClose: () => void;
}

export const SecurePinModal: React.FC<SecurePinModalProps> = ({
  isOpen,
  activeStudentName,
  activeVariableId,
  enteredPin,
  errorMessage,
  keypadNumbers,
  onPressDigit,
  onClearPin,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-150 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="text-center space-y-1">
          <div className="mx-auto w-10 h-10 rounded-full bg-[#8B0026]/10 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-[#8B0026]" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase">Seguridad de Calificaciones</h3>
          <p className="text-[10px] text-slate-500 font-bold leading-normal">
            Ingrese su firma digital docente para modificar al alumno: <br />
            <span className="text-slate-800 uppercase font-black">{activeStudentName}</span> <br />
            Componente curricular: <span className="text-[#8B0026] font-mono font-extrabold">[{activeVariableId}]</span>
          </p>
        </div>

        {/* PIN Dots indicators */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                enteredPin.length > idx
                  ? "bg-[#8B0026] border-[#8B0026] scale-110"
                  : "bg-slate-100 border-slate-300"
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <p className="text-[10px] text-[#8B0026] font-extrabold text-center uppercase animate-bounce">{errorMessage}</p>
        )}

        <div className="text-center bg-amber-50 border border-amber-200 text-amber-800 text-[9.5px] font-mono py-1 rounded select-none font-bold">
          PIN del Docente de Prueba: <span className="font-extrabold select-all">1234</span>
        </div>

        {/* Randomized virtual keypad */}
        <div className="grid grid-cols-3 gap-2 py-1 max-w-[240px] mx-auto">
          {keypadNumbers.map((num) => (
            <button
              key={num}
              onClick={() => onPressDigit(num)}
              className="py-3 px-2 text-center text-slate-800 font-extrabold font-mono hover:bg-slate-100 border border-slate-150 rounded-lg text-lg select-none hover:border-slate-350 active:bg-slate-200 transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={onClearPin}
            className="col-span-1 py-3 px-2 text-center text-slate-500 hover:text-[#8B0026] hover:bg-red-50 hover:border-red-200 font-black uppercase text-[10px] border border-slate-150 rounded-lg select-none cursor-pointer"
          >
            BORRAR
          </button>
          <button
            onClick={onClose}
            className="col-span-1 py-3 px-2 text-center text-slate-500 hover:bg-slate-100 font-black uppercase text-[10px] border border-slate-150 rounded-lg select-none cursor-pointer"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
