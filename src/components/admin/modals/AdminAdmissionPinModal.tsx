import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, X, CheckCircle2, AlertTriangle, User, Award, MapPin } from "lucide-react";
import { Applicant } from "../../../types";

interface AdminAdmissionPinModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onConfirmAdmission: (dni: string) => void;
  onClose: () => void;
}

export const AdminAdmissionPinModal: React.FC<AdminAdmissionPinModalProps> = ({
  isOpen,
  applicant,
  onConfirmAdmission,
  onClose,
}) => {
  const [enteredPin, setEnteredPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEnteredPin("");
      setErrorMessage("");
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !applicant) return null;

  const programName =
    applicant.programId === "electronica"
      ? "Electricidad Industrial"
      : applicant.programId === "contabilidad"
      ? "Contabilidad"
      : "Programa Institucional";

  const handleDigitPress = (digit: number) => {
    if (enteredPin.length >= 4 || isSuccess) return;
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setErrorMessage("");

    // Validación automática al alcanzar 4 dígitos (PIN oficial de dirección: 1234)
    if (nextPin === "1234") {
      setIsSuccess(true);
      setTimeout(() => {
        onConfirmAdmission(applicant.dni);
        onClose();
      }, 700);
    } else if (nextPin.length === 4) {
      setErrorMessage("PIN de Dirección incorrecto. Intente de nuevo.");
      setTimeout(() => {
        setEnteredPin("");
      }, 800);
    }
  };

  const handleClear = () => {
    setEnteredPin("");
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header institucional */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9F062A]/20 border border-[#9F062A]/40 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#9F062A] block leading-none">
                Firma Digital Institucional
              </span>
              <h3 className="text-sm font-black uppercase text-white mt-0.5 tracking-wide">
                Autorización de Admisión (MAMC)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Postulante Target Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider">
                Postulante Apto a Ingreso
              </span>
              <span className="text-[9.5px] font-mono font-bold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded">
                DNI: {applicant.dni}
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase">
              {applicant.name} {applicant.lastName}
            </h4>
            <div className="flex items-center gap-2 text-xs font-bold text-[#9F062A]">
              <Award className="w-3.5 h-3.5" />
              <span>{programName}</span>
            </div>

            {/* Aviso sobre el aula */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px]">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Aula para examen:
              </span>
              {applicant.examClassroom ? (
                <span className="font-extrabold text-indigo-700 font-sans">
                  {applicant.examClassroom}
                </span>
              ) : (
                <span className="font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded text-[10px]">
                  Sin Asignar (Se admitirá sin aula física)
                </span>
              )}
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Ingrese su PIN de Dirección para firmar digitalmente la resolución de ingreso y promover al postulante a la condición de <strong>ADMITIDO</strong>.
            </p>
          </div>

          {/* PIN Indicators Dots */}
          <div className="flex justify-center gap-3 py-1">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isSuccess
                      ? "bg-emerald-500 border-emerald-500 scale-110"
                      : isFilled
                      ? "bg-[#9F062A] border-[#9F062A] scale-110"
                      : "bg-slate-100 border-slate-300"
                  }`}
                />
              );
            })}
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <p className="text-[10.5px] text-rose-600 font-black text-center uppercase tracking-wide animate-pulse">
              {errorMessage}
            </p>
          )}

          {isSuccess && (
            <p className="text-[11px] text-emerald-700 font-black text-center uppercase tracking-wide flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ¡Firma Digital Validada con Éxito!
            </p>
          )}

          <div className="text-center bg-amber-50/80 border border-amber-200 text-amber-800 text-[10px] py-1 px-2 rounded-lg font-mono font-bold">
            PIN de Dirección Institucional: <span className="font-black text-slate-900 select-all">1234</span>
          </div>

          {/* Virtual Keypad */}
          <div className="grid grid-cols-3 gap-2 py-1 max-w-[240px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigitPress(num)}
                className="py-3 text-center text-slate-800 font-black font-mono hover:bg-slate-100 border border-slate-200 rounded-xl text-lg select-none active:bg-slate-200 transition-all cursor-pointer shadow-3xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 text-center text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider select-none cursor-pointer"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleDigitPress(0)}
              className="py-3 text-center text-slate-800 font-black font-mono hover:bg-slate-100 border border-slate-200 rounded-xl text-lg select-none active:bg-slate-200 transition-all cursor-pointer shadow-3xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 text-center text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider select-none cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
