import React from "react";
import { Landmark, FileCheck, Check, CheckCircle2, Loader2, Send } from "lucide-react";

interface AdmisionTabProps {
  dniInput: string;
  setDniInput: (val: string) => void;
  nameInput: string;
  setNameInput: (val: string) => void;
  lastNameInput: string;
  setLastNameInput: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  programSelection: string;
  setProgramSelection: (val: string) => void;
  submitSuccessMsg: string;
  setSubmitSuccessMsg: (val: string) => void;
  isSubmittingForm: boolean;
  handlePreEnrollmentSubmit: (e: React.FormEvent) => void;
}

export const AdmisionTab: React.FC<AdmisionTabProps> = ({
  dniInput,
  setDniInput,
  nameInput,
  setNameInput,
  lastNameInput,
  setLastNameInput,
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  programSelection,
  setProgramSelection,
  submitSuccessMsg,
  setSubmitSuccessMsg,
  isSubmittingForm,
  handlePreEnrollmentSubmit
}) => {
  return (
    <div className="bg-slate-50 py-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">

        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">PROCESO ORDINARIO 2026-I</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Pre-Inscripción Virtual de Admisión</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Completa el formulario oficial para obtener tu Código de Postulante y registrar tus credenciales de acceso a la Intranet Académica.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Lado Izquierdo: Tasas Ordinarias y Requisitos del Proceso */}
          <div className="lg:col-span-5 space-y-6">

            <div id="tasas-requisitos" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 scroll-mt-24">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-rose-50 text-[#9F062A] rounded-lg border border-rose-100">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">Tasas Ordinarias de Admisión</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Aranceles oficiales aprobados por la Dirección</span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Derecho de Examen de Admisión Ordinario</span>
                  <span className="text-[#9F062A] font-black text-sm">S/. 120.00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-700">Matrícula Semestral Regular</span>
                  <span className="text-[#9F062A] font-black text-sm">S/. 250.00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                  <span className="font-bold">Pensión Mensual de Enseñanza</span>
                  <span className="font-black text-sm text-emerald-700">S/. 0.00 (Gratuito)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#9F062A]" />
                Documentos Requeridos
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Copia simple de DNI vigente o Carné de Extranjería.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Certificado oficial de estudios de 5to de Secundaria (original o digital MINEDU).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Voucher original de pago por derecho de examen (Banco de la Nación).</span>
                </li>
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl text-xs space-y-2 text-rose-950">
              <span className="font-extrabold uppercase text-[#9F062A] block">¿Necesitas ayuda con tu inscripción?</span>
              <p className="font-medium leading-relaxed text-slate-700">
                Comunícate con la Secretaría de Admisión llamando al <strong>01 500 6177</strong> o escribiendo a <strong>admision@iestpsfa.edu.pe</strong>.
              </p>
            </div>

          </div>

          {/* Lado Derecho: Formulario Oficial de Pre-Inscripción */}
          <div id="admision-form" className="lg:col-span-7 scroll-mt-24">
            <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-2xl shadow-md">

              <div className="border-b border-slate-200 pb-4 mb-5 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Formulario de Inscripción Virtual</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Ingresa tus datos completos tal como figuran en tu DNI.</p>
                </div>
                <span className="bg-[#9F062A] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase">
                  ADMISIÓN 2026-I
                </span>
              </div>

              {submitSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-xl text-xs space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="font-semibold text-sm leading-relaxed">{submitSuccessMsg}</p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccessMsg("")}
                    className="w-full py-3 bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                  >
                    Realizar Otra Inscripción
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePreEnrollmentSubmit} className="space-y-4">

                  {/* DNI y Programa al que Postula */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-700 block mb-1">DNI del Postulante *</label>
                      <input
                        type="text"
                        maxLength={8}
                        required
                        placeholder="Ingrese 8 dígitos de su DNI"
                        value={dniInput}
                        onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Programa al que Postula *</label>
                      <select
                        value={programSelection}
                        onChange={(e) => setProgramSelection(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                      >
                        <option value="electronica">Electricidad Industrial</option>
                        <option value="contabilidad">Contabilidad Financiera</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Nombres *</label>
                      <input
                        type="text"
                        required
                        placeholder="Sus Nombres completos"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Apellidos *</label>
                      <input
                        type="text"
                        required
                        placeholder="Sus Apellidos completos"
                        value={lastNameInput}
                        onChange={(e) => setLastNameInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        placeholder="correo@ejemplo.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Teléfono / Celular *</label>
                      <input
                        type="tel"
                        required
                        placeholder="987654321"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="w-full mt-4 py-3.5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSubmittingForm ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                        <span>Registrando en Sistema...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 text-amber-300" />
                        <span>Completar Registro de Pre-Inscripción</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-500 text-center font-medium pt-2">
                    Al registrarte se generará tu Código de Postulante y se enviarán tus credenciales de la Intranet por correo electrónico.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
