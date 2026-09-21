import React from "react";
import { 
  CreditCard, ArrowRight, CheckCircle2, Clock, Check, Landmark, Store, Smartphone, Headset, MessageSquare, Upload 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { Applicant } from "../../../types";

interface PagosTabProps {
  applicant: Applicant;
  paymentDate: string;
  paymentVoucher: string;
  setPaymentVoucher: (val: string) => void;
  paymentType: "number" | "voucher";
  setPaymentType: (type: "number" | "voucher") => void;
  stagedVoucherFile: string;
  setStagedVoucherFile: (file: string) => void;
  stagedVoucherPreview: string;
  setStagedVoucherPreview: (preview: string) => void;
  handleSubmitPaymentVoucher: (e: React.FormEvent) => void;
  compressAndResizeImage: (file: File, callback: (resizedDataUrl: string) => void) => void;
  triggerPreview: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
  setActiveTab: (tab: "dashboard" | "documentos" | "pagos" | "resultados" | "soporte" | "matricula") => void;
}

export const PagosTab: React.FC<PagosTabProps> = React.memo(({
  applicant,
  paymentDate,
  paymentVoucher,
  setPaymentVoucher,
  paymentType,
  setPaymentType,
  stagedVoucherFile,
  setStagedVoucherFile,
  stagedVoucherPreview,
  setStagedVoucherPreview,
  handleSubmitPaymentVoucher,
  compressAndResizeImage,
  triggerPreview,
  setActiveTab,
}) => {
  return (
    <PageTransition id="pagos" className="space-y-6">
      {/* Breadcrumb path */}
      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-left">
        Admisión 2026 &gt; <span className="text-slate-600">Estado de Pago</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-left">Estado de Pago</h2>
          <p className="text-xs text-slate-500 font-bold leading-none mt-1">Completa el pago del derecho de examen para habilitar tu inscripción definitiva.</p>
        </div>
      </div>

      {/* TOP ROW: 2 Cards side by side (Estado de Pago + Instrucciones de Pago) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Card 1: Estado de Pago de Derechos (Borgoña Theme) */}
        <div className="bg-[#8B0020] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between border-l-4 border-amber-400 text-left relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider block leading-none">Concepto de Pago Principal</h3>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                applicant.paymentStatus === "Validado" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : applicant.paymentStatus === "Pendiente"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
                    : applicant.paymentStatus === "Observado"
                      ? "bg-red-500/30 text-red-200 border border-red-400/40 font-black"
                      : "bg-white/10 text-amber-300 border border-amber-400/20"
              }`}>
                {applicant.paymentStatus === "Validado" ? "PAGO VALIDADO" : (applicant.paymentStatus || "NO PAGADO")}
              </span>
            </div>

            <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest block mt-2">DERECHO DE EXAMEN ADMISIÓN 2026</span>
            <div className="flex items-baseline gap-2 mt-1 mb-3">
              <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight leading-none">S/. 120.00</span>
              <span className="text-[10px] text-slate-200 font-bold uppercase">Monto Único Regular</span>
            </div>

            <p className="text-slate-100 font-medium text-[11px] leading-relaxed mb-6">
              {applicant.paymentStatus === "Validado"
                ? "Su pago por S/. 120.00 ha sido validado satisfactoriamente por tesorería. Ya cuenta con derecho habilitado para rendir el examen de admisión."
                : applicant.paymentStatus === "Pendiente"
                  ? "Su comprobante se encuentra en proceso de validación bancaria por nuestra tesorería institucional."
                  : applicant.paymentStatus === "Observado"
                    ? "Su pago presenta una observación por parte de tesorería. Por favor vuelva a enviar el voucher o código corregido."
                    : "Realice el pago de S/. 120.00 mediante transferencia, agente o Yape/Plin y registre el número de operación o la foto del comprobante a continuación."}
            </p>
          </div>

          <button 
            onClick={() => {
              const formEl = document.getElementById("form-registro-pago");
              if (formEl) {
                formEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="w-full bg-white hover:bg-amber-50 text-[#8B0020] font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 group"
          >
            <span>{applicant.paymentStatus === "Validado" ? "Ver Detalles de Transacción" : "Registrar / Modificar Pago"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Instrucciones para Registro de Pago */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">Instrucciones de Pago</h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">01</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Realice el depósito de S/. 120.00 en Banco de la Nación, BCP, Agentes o Yape/Plin.</p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">02</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Ingrese el N° de Operación exacto o cargue una foto nítida de su voucher impreso.</p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">03</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Tesorería verificará su comprobante en un plazo máximo de 24 horas hábiles.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Split Layout (Voucher Registration Form + Methods & Channels) */}
      <div id="form-registro-pago" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-2 text-left">
        
        {/* Left Column: Form & Current Status */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8B0020]" />
                Declaración y Registro de Pago
              </span>

              <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                applicant.paymentStatus === "Validado" 
                  ? "bg-emerald-100 text-emerald-800"
                  : applicant.paymentStatus === "Pendiente"
                    ? "bg-amber-100 text-amber-800 animate-pulse"
                    : applicant.paymentStatus === "Observado"
                      ? "bg-red-50 text-red-700 font-extrabold border border-red-200"
                      : "bg-slate-100 text-slate-500 font-semibold"
              }`}>
                {applicant.paymentStatus}
              </span>
            </div>

            {/* Operational Status Display and Form Submission */}
            {applicant.paymentStatus === "Validado" ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-750 text-xs text-left font-semibold space-y-2">
                <p className="text-emerald-800 font-bold uppercase text-[11px] tracking-wide leading-none flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Pago Validado con Éxito
                </p>
                <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                  Su pago de derecho de admisión por S/. 120.00 ha sido aprobado de manera oficial por Tesorería. ¡Puede continuar con su expediente y asignación de aula de examen!
                </p>
              </div>
            ) : applicant.paymentStatus === "Pendiente" ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-slate-700 text-xs text-left font-semibold space-y-3">
                <p className="text-amber-800 font-bold uppercase text-[11px] tracking-wide leading-none flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Validación de Pago en Curso
                </p>
                {applicant.paymentType === "voucher" || applicant.paymentVoucherUrl ? (
                  <div className="space-y-2">
                    <p className="text-[11px]">Comprobante adjuntado: <span className="font-mono font-black text-slate-900">{applicant.paymentVoucherFileName || "voucher_comprobante.jpg"}</span></p>
                    {applicant.paymentVoucherUrl && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 inline-block">
                        <span className="text-[9px] text-slate-400 font-black block mb-1 uppercase">Voucher Enviado:</span>
                        <img 
                          src={applicant.paymentVoucherUrl} 
                          alt="Voucher depositado" 
                          className="max-h-28 object-contain rounded-md border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => triggerPreview("Voucher Registrado", applicant.paymentVoucherFileName || "voucher.jpg", "image", { fileDataUrl: applicant.paymentVoucherUrl })}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px]">Su número de operación ingresado: <span className="font-mono font-bold text-slate-900">{applicant.paymentOperation || "No registrado"}</span></p>
                )}
                <p className="text-[11px] text-slate-600 font-medium leading-normal">
                  La oficina de Tesorería está verificando su comprobante. Por favor espere a que su estado sea actualizado a 'Validado'.
                </p>
              </div>
            ) : (
              <div className="space-y-4 font-bold text-xs text-slate-700">
                {applicant.paymentStatus === "Observado" && (
                  <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl text-slate-750 text-xs text-left font-semibold">
                    <p className="text-red-750 font-extrabold uppercase text-[10px] tracking-wide mb-1 leading-none">Operación Observada por Tesorería</p>
                    <span className="text-slate-600 block mt-1 leading-relaxed bg-white border border-red-100 p-2.5 rounded-lg text-[11px]">
                      Observación enviada: "{applicant.paymentObservations || "Su comprobante de depósito no coincide con nuestros registros."}"
                    </span>
                    <span className="text-[11px] block text-red-800 font-bold mt-2">
                      Por favor vuelva a ingresar el comprobante o número de operación real para que sea evaluado de nuevo.
                    </span>
                  </div>
                )}

                {/* Submission form area */}
                <form onSubmit={handleSubmitPaymentVoucher} className="space-y-4">
                  <h4 className="text-[10px] font-black text-[#8B0020] uppercase tracking-wider block mb-1">
                    Seleccione la Forma de Registro de Su Pago
                  </h4>

                  {/* Interactive Toggle tabs */}
                  <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPaymentType("number")}
                      className={`py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer text-center ${
                        paymentType === "number"
                          ? "bg-white text-[#8B0020] shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      N° de Operación
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType("voucher")}
                      className={`py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer text-center ${
                        paymentType === "voucher"
                          ? "bg-white text-[#8B0020] shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Subir Foto de Voucher
                    </button>
                  </div>

                  {paymentType === "number" ? (
                    <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                      <div className="space-y-1 flex-1 w-full text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Código de N° de Operación del Depósito</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej: BN-994102-S1"
                          value={paymentVoucher}
                          onChange={(e) => setPaymentVoucher(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0020]/20"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="bg-[#8B0020] hover:bg-[#700018] text-white px-6 py-2.5 rounded-xl font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto h-[42px] mb-0.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Enviar Operación</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <label htmlFor="payment-voucher-file" className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/40 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-center items-center text-center cursor-pointer block group">
                        <input
                          id="payment-voucher-file"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setStagedVoucherFile(file.name);
                            compressAndResizeImage(file, (compressedDataUrl) => {
                              setStagedVoucherPreview(compressedDataUrl);
                            });
                          }}
                        />
                        <div className="w-12 h-12 rounded-full bg-[#8B0020]/5 group-hover:bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center mb-2 transition-colors">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                          Seleccionar Imagen JPG o PNG
                        </span>
                        <span className="text-[10px] text-[#8B0020] font-bold block mt-1">
                          {stagedVoucherFile ? `Seleccionado: ${stagedVoucherFile}` : "Haga clic para elegir foto de su voucher"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Formatos permitidos: JPG, JPEG, PNG (Máx 5MB)</span>
                      </label>

                      {stagedVoucherPreview && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center animate-fade-in text-center">
                          <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-2">Vista Previa del Voucher Seleccionado:</span>
                          <img 
                            src={stagedVoucherPreview} 
                            alt="Preview voucher" 
                            className="max-h-40 object-contain rounded-lg border border-slate-300 shadow-xs" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setStagedVoucherFile("");
                              setStagedVoucherPreview("");
                            }}
                            className="mt-2 text-[9px] font-black uppercase text-red-700 tracking-wider hover:underline cursor-pointer"
                          >
                            Eliminar para Cambiar
                          </button>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={!stagedVoucherPreview}
                        className={`w-full py-3 px-6 rounded-xl font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          stagedVoucherPreview
                            ? "bg-[#8B0020] hover:bg-[#700018] text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Enviar Voucher de Pago</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Methods & Channels */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left">
            <span className="text-[10px] font-black text-[#8B0020] uppercase tracking-wider block border-b pb-2.5 mb-4">
              Métodos de Pago Autorizados
            </span>
            
            <div className="space-y-3.5 text-left">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Transferencia Bancaria</span>
                  <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">BCP, BBVA, Interbank y Scotiabank</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                  <Store className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Ventanilla &amp; Agentes</span>
                  <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">Banco de la Nación y Agentes Autorizados</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                  <Smartphone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">App Móvil (QR)</span>
                  <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">Yape y Plin mediante código QR institucional</p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-amber-50/80 rounded-xl text-slate-600 border border-amber-200 text-[10px] leading-relaxed text-left">
              <p className="text-[#8B0020] font-black uppercase tracking-wider text-[9px] leading-tight mb-1">Nota Importante:</p>
              <span className="font-semibold block text-slate-600">
                Los pagos por transferencia interbancaria pueden demorar hasta 24 horas hábiles en ser validados por tesorería institucional académica.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM TRANSACTION HISTORY LEDGER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-left">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider block leading-none">
              Historial de Transacciones del Postulante
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              * El pago inicial por Prospecto de Admisión se valida automáticamente al registrar su cuenta virtual.
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-semibold border-collapse text-left text-slate-600">
            <thead>
              <tr className="bg-slate-100/80 text-slate-500 border-b text-[10px] font-extrabold uppercase">
                <th className="p-3.5 pl-5">Fecha</th>
                <th className="p-3.5">Id Operación</th>
                <th className="p-3.5">Concepto</th>
                <th className="p-3.5">Monto</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[11px] bg-white divide-slate-100">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-3.5 pl-5 text-slate-500">12/03/2026</td>
                <td className="p-3.5 font-mono font-bold text-slate-800">#TRX-9921</td>
                <td className="p-3.5 font-bold text-slate-900">Prospecto de Admisión Regular</td>
                <td className="p-3.5 text-slate-900 font-extrabold font-mono">S/. 30.00</td>
                <td className="p-3.5">
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Validado
                  </span>
                </td>
                <td className="p-3.5 pr-5">
                  <span 
                    onClick={() => triggerPreview("Recibo de Prospecto", "TRX-9921", "receipt", { 
                      amount: "S/. 30.00", 
                      concept: "Prospecto de Admisión Regular", 
                      date: "12/03/2026", 
                      transactionId: "TRX-9921",
                      dni: applicant.dni,
                      studentName: applicant.name,
                      studentLastName: applicant.lastName
                    })}
                    className="text-[#8B0020] hover:underline font-extrabold cursor-pointer"
                  >
                    Ver Recibo
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-3.5 pl-5 text-slate-500">{paymentDate}</td>
                <td className="p-3.5 font-mono font-bold text-slate-800">
                  {applicant.paymentStatus === "No Pagado" ? "Sin registrar" : (applicant.paymentOperation || "No registrado")}
                </td>
                <td className="p-3.5 font-bold text-slate-900">Derecho de Examen Ordinario 2026</td>
                <td className="p-3.5 text-slate-900 font-extrabold font-mono">S/. 120.00</td>
                <td className="p-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    applicant.paymentStatus === "Validado"
                      ? "bg-emerald-100 text-emerald-800"
                      : applicant.paymentStatus === "Pendiente"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : applicant.paymentStatus === "Observado"
                          ? "bg-red-50 text-red-700 font-extrabold border border-red-200"
                          : applicant.paymentStatus === "Rechazado"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-400"
                  }`}>
                    {applicant.paymentStatus === "No Pagado" ? "Sin Enviar" : applicant.paymentStatus}
                  </span>
                </td>
                <td className="p-3.5 pr-5">
                  {applicant.paymentStatus === "Validado" ? (
                    <span 
                      onClick={() => triggerPreview("Recibo de Examen de Admisión", applicant.paymentOperation || "PRE-620323", "receipt", { 
                        amount: "S/. 120.00", 
                        concept: "Derecho de Examen Ordinario 2026", 
                        date: paymentDate, 
                        transactionId: applicant.paymentOperation,
                        dni: applicant.dni,
                        studentName: applicant.name,
                        studentLastName: applicant.lastName
                      })}
                      className="text-[#8B0020] hover:underline font-extrabold cursor-pointer"
                    >
                      Ver Recibo
                    </span>
                  ) : applicant.paymentStatus === "Observado" ? (
                    <span className="text-red-700 font-bold">Observado</span>
                  ) : applicant.paymentStatus === "No Pagado" ? (
                    <span className="text-slate-400 font-bold">Pendiente</span>
                  ) : (
                    <span className="text-slate-500 font-bold">En Revisión</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
});

PagosTab.displayName = "PagosTab";
export default PagosTab;

