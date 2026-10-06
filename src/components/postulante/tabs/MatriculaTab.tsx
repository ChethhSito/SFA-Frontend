import React from "react";
import { 
  Landmark, CheckCircle2, Clock, AlertTriangle, Info, Download, Check, CreditCard, 
  RefreshCw, Smartphone, Upload, ArrowRight, Store, BookOpen, Printer, Building2
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";
import { Applicant, Enrollment } from "../../../types";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";

interface MatriculaTabProps {
  applicant: Applicant;
  currentProgram: { name: string; [key: string]: any };
  enrollments?: Enrollment[];
  matriculaVoucher: string;
  setMatriculaVoucher: (val: string) => void;
  matriculaPaymentType: "number" | "voucher";
  setMatriculaPaymentType: (type: "number" | "voucher") => void;
  stagedMatriculaFile: string;
  setStagedMatriculaFile: (val: string) => void;
  stagedMatriculaPreview: string;
  setStagedMatriculaPreview: (val: string) => void;
  isEditingMatricula: boolean;
  setIsEditingMatricula: (val: boolean) => void;
  handleStartEditMatricula: (myEnrollment: any) => void;
  handleSubmitMatriculaVoucher: (e: React.FormEvent) => void;
  compressAndResizeImage: (file: File, callback: (resizedDataUrl: string) => void) => void;
  triggerPreview?: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
}

export const MatriculaTab: React.FC<MatriculaTabProps> = React.memo(({
  applicant,
  currentProgram,
  enrollments = [],
  matriculaVoucher,
  setMatriculaVoucher,
  matriculaPaymentType,
  setMatriculaPaymentType,
  stagedMatriculaFile,
  setStagedMatriculaFile,
  stagedMatriculaPreview,
  setStagedMatriculaPreview,
  isEditingMatricula,
  setIsEditingMatricula,
  handleStartEditMatricula,
  handleSubmitMatriculaVoucher,
  compressAndResizeImage,
  triggerPreview,
}) => {
  const { courses: REAL_MPA_COURSES } = useAcademicCatalog();

  // Find or initialize enrollment object
  let myEnrollment = enrollments.find((enr) => enr.studentDni === applicant.dni);
  if (!myEnrollment) {
    try {
      const saved = localStorage.getItem("sfa_enrollments");
      if (saved) {
        const parsed = JSON.parse(saved);
        myEnrollment = parsed.find((e: any) => e.studentDni === applicant.dni);
      }
    } catch (e) {}
  }

  if (!myEnrollment) {
    myEnrollment = {
      studentDni: applicant.dni,
      programId: applicant.programId,
      academicStatus: "ADMITIDO" as const,
      docs: {
        dniFile: { status: "No Enviado" as const },
        certificadoFile: { status: "No Enviado" as const },
        partidaFile: { status: "No Enviado" as const },
        fotoFile: { status: "No Enviado" as const },
      },
      paymentStatus: "No Pagado" as const,
    };
  }

  const isPaid = myEnrollment.paymentStatus === "Validado";
  const isEnrolled = myEnrollment.academicStatus === "MATRICULADO";
  const isPending = myEnrollment.paymentStatus === "Pendiente";
  const isObserved = myEnrollment.paymentStatus === "Observado";

  const cycleCourses = REAL_MPA_COURSES.filter(
    (c) => c.careerId === applicant.programId && c.referenceCycle === 1
  );
  const totalCredits = cycleCourses.reduce((acc, c) => acc + (c.credits || 0), 0) || 24;

  return (
    <PageTransition id="matricula" className="space-y-6 text-left">
      {/* 1. Breadcrumb path */}
      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-left">
        Admisión 2026 &gt; <span className="text-slate-600">Pago de Matrícula Regular</span>
      </div>

      {/* 2. Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#8B0020]" />
            Pago de Matrícula de Ingresante
          </h2>
          <p className="text-xs text-slate-500 font-bold leading-none mt-1">
            Complete el pago del derecho regular de matrícula (S/. 250.00) para habilitar su inscripción oficial y carga horaria del primer ciclo.
          </p>
        </div>
      </div>

      {/* 3. TOP ROW: 2 Cards side by side (Hero Borgoña Card + Instrucciones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Card 1: Estado de Matrícula (Borgoña Theme con Amber borders) */}
        <div className="bg-[#8B0020] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between border-l-4 border-amber-400 text-left relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider block leading-none">
                Concepto de Matrícula Institucional
              </h3>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                isEnrolled 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : isPaid
                    ? "bg-sky-500/20 text-sky-200 border border-sky-400/40"
                    : isPending
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse"
                      : isObserved
                        ? "bg-red-500/30 text-red-200 border border-red-400/40 font-black"
                        : "bg-white/10 text-amber-300 border border-amber-400/20"
              }`}>
                {isEnrolled
                  ? "MATRICULADO OFICIAL"
                  : isPaid
                  ? "PAGO VALIDADO - CAJA"
                  : isPending
                  ? "EN REVISIÓN POR CAJA"
                  : isObserved
                  ? "PAGO OBSERVADO"
                  : "PENDIENTE DE PAGO"}
              </span>
            </div>

            <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest block mt-2">
              DERECHO DE MATRÍCULA Y REGISTRO SEMESTRAL 2026-I
            </span>
            <div className="flex items-baseline gap-2 mt-1 mb-3">
              <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight leading-none">
                S/. 250.00
              </span>
              <span className="text-[10px] text-slate-200 font-bold uppercase">
                Tasa Regular Única
              </span>
            </div>

            <p className="text-slate-100 font-medium text-[11px] leading-relaxed mb-6">
              {isEnrolled
                ? `¡Felicidades! Su matrícula de S/. 250.00 ha sido validada por la Oficina de Caja y la Secretaría General ha completado su asignación de primer ciclo en ${currentProgram.name}. Ya cuenta con intranet y carga académica oficial.`
                : isPaid
                ? "Su abono de matrícula por S/. 250.00 ha sido aprobado de manera exitosa por la Oficina de Caja. La Secretaría General está procesando la asignación de su sección y horarios."
                : isPending
                ? "Su comprobante de depósito bancario de S/. 250.00 ha sido recibido y está en proceso de auditoría y conciliación por la Oficina de Caja."
                : isObserved
                ? `Su depósito de matrícula presenta una observación: "${myEnrollment.paymentObservations || "El comprobante no es legible o los datos bancarios no coinciden"}". Por favor vuelva a enviar el comprobante corregido.`
                : "Realice el pago de S/. 250.00 mediante depósito en ventanilla, transferencia interbancaria o agentes autorizados y registre a continuación su voucher para activar su matrícula."}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => {
              const formEl = document.getElementById("form-registro-matricula");
              if (formEl) {
                formEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="w-full bg-white hover:bg-amber-50 text-[#8B0020] font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 group"
          >
            <span>
              {isEnrolled 
                ? "Ver Ficha y Asignaturas de Matrícula" 
                : isPaid 
                ? "Ver Estado de Conciliación Bancaria" 
                : isPending 
                ? "Ver Voucher en Revisión" 
                : "Registrar / Subir Voucher de Matrícula"}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Instrucciones de Pago de Matrícula (Cards 01, 02, 03) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                Instrucciones de Matrícula Regular
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">
                  01
                </span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">
                  Realice el depósito de <strong>S/. 250.00</strong> en Banco de la Nación, BCP - Pago de Servicios, Agentes autorizados o transferencia bancaria.
                </p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">
                  02
                </span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">
                  Ingrese el <strong>N° de Operación</strong> bancaria exacto o adjunte una fotografía nítida de su voucher impreso emitido por la entidad financiera.
                </p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">
                  03
                </span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">
                  La <strong>Oficina de Caja y Tesorería</strong> validará su comprobante en un plazo de 24 horas y la <strong>Secretaría General</strong> consolidará su aula y sección.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. MIDDLE SECTION: Split Layout (Form on Left + Accounts & Curricular Malla on Right) */}
      <div id="form-registro-matricula" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-2 text-left">
        
        {/* Left Column: Form & Current Status (col-span-2) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8B0020]" />
                Declaración y Registro de Pago de Matrícula
              </span>

              <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                isEnrolled
                  ? "bg-emerald-100 text-emerald-800"
                  : isPaid 
                  ? "bg-sky-100 text-sky-850"
                  : isPending
                  ? "bg-amber-100 text-amber-800 animate-pulse"
                  : isObserved
                  ? "bg-red-50 text-red-700 font-extrabold border border-red-200"
                  : "bg-slate-100 text-slate-500 font-semibold"
              }`}>
                {isEnrolled ? "MATRICULADO" : (myEnrollment.paymentStatus || "No Pagado")}
              </span>
            </div>

            {/* CASO 1: Matrícula Oficial Completa */}
            {isEnrolled ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-750 text-xs text-left font-semibold space-y-2">
                  <p className="text-emerald-800 font-bold uppercase text-[11px] tracking-wide leading-none flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Matrícula Semestral Validada e Inscrita Oficialmente
                  </p>
                  <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                    Felicidades, la Secretaría General ha procesado formalmente su matrícula en el Sistema Integrado SFA. Ya cuenta con intranet de estudiante activa.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 font-bold">Estudiante:</span>
                    <span className="font-extrabold text-slate-900">{applicant.name} {applicant.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 font-bold">Documento DNI:</span>
                    <span className="font-mono font-extrabold text-slate-900">{applicant.dni}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 font-bold">Especialidad Académica:</span>
                    <span className="font-extrabold text-[#8B0020] uppercase">{currentProgram.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 font-bold">Ciclo Académico:</span>
                    <span className="font-extrabold text-slate-800">I - Primer Ciclo Ordinario</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 font-bold">Turno Asignado:</span>
                    <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                      {myEnrollment.shift || "Mañana"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 font-bold">Tasa Cancelada:</span>
                    <span className="font-mono font-extrabold text-emerald-700">S/. 250.00 - VALIDADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Código de Operación:</span>
                    <span className="font-mono font-extrabold text-slate-900">{myEnrollment.paymentOperation || "VENTANILLA-CAJA"}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => alert("Descargando Ficha Oficial de Matrícula...")}
                    className="text-xs uppercase font-black tracking-wider border-emerald-300 hover:bg-emerald-50 text-emerald-800 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar Ficha de Matrícula
                  </Button>
                </div>
              </div>
            ) : isPaid ? (
              /* CASO 2: Pago Aprobado en Caja, esperando asignación final */
              <div className="space-y-4">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-slate-750 text-xs text-left font-semibold space-y-2">
                  <p className="text-sky-900 font-bold uppercase text-[11px] tracking-wide leading-none flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-sky-600 stroke-[3]" /> Pago de Matrícula Aprobado por la Oficina de Caja y Tesorería
                  </p>
                  <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                    Su tasa regular de S/. 250.00 ha sido verificada con éxito. Actualmente, la Secretaría General está asignando su sección y horarios en el Módulo de Matrícula.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-bold">DNI del Alumno:</span>
                    <span className="font-mono font-extrabold text-slate-900">{applicant.dni}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-bold">Carrera Técnica:</span>
                    <span className="font-extrabold text-[#8B0020] uppercase">{currentProgram.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-500 font-bold">Monto Validado:</span>
                    <span className="font-mono font-extrabold text-emerald-700">S/. 250.00 - APROBADO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Carga Académica:</span>
                    <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
                      PENDIENTE DE ASIGNACIÓN
                    </span>
                  </div>
                </div>
              </div>
            ) : isPending && !isEditingMatricula ? (
              /* CASO 3: Voucher en evaluación por Caja */
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl text-slate-700 text-xs text-left font-semibold space-y-3">
                <p className="text-amber-800 font-bold uppercase text-[11px] tracking-wide leading-none flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Validación de Matrícula en Curso
                </p>

                {myEnrollment.paymentType === "voucher" || myEnrollment.paymentVoucherUrl ? (
                  <div className="space-y-2">
                    <p className="text-[11px]">
                      Comprobante adjuntado:{" "}
                      <span className="font-mono font-black text-slate-900">
                        {myEnrollment.paymentVoucherFileName || "voucher_matricula.jpg"}
                      </span>
                    </p>
                    {myEnrollment.paymentVoucherUrl && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 inline-block shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-black block mb-1 uppercase">
                          Voucher Enviado a Caja:
                        </span>
                        <img 
                          src={myEnrollment.paymentVoucherUrl} 
                          alt="Voucher de matrícula" 
                          className="max-h-32 object-contain rounded-md border border-slate-100 cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => {
                            if (triggerPreview) {
                              triggerPreview("Voucher Matrícula", myEnrollment?.paymentVoucherFileName || "voucher.jpg", "image", { fileDataUrl: myEnrollment?.paymentVoucherUrl });
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px]">
                    Su número de operación registrado:{" "}
                    <span className="font-mono font-bold text-slate-900">
                      {myEnrollment.paymentOperation || "No registrado"}
                    </span>
                  </p>
                )}

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  La <strong>Oficina de Caja y Tesorería</strong> está auditando su comprobante. En cuanto sea confirmado, se activará su matrícula oficial del primer ciclo.
                </p>

                <div className="pt-2 border-t border-amber-200/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingMatricula(true)}
                    className="text-[10px] font-black uppercase text-[#8B0020] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Modificar Comprobante o Código
                  </button>
                </div>
              </div>
            ) : (
              /* CASO 4: Formulario de Registro o Corrección */
              <div className="space-y-4 font-bold text-xs text-slate-700">
                {isObserved && (
                  <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl text-slate-750 text-xs text-left font-semibold">
                    <p className="text-red-750 font-extrabold uppercase text-[10px] tracking-wide mb-1 leading-none">
                      Abono de Matrícula Observado por Caja
                    </p>
                    <span className="text-slate-600 block mt-1 leading-relaxed bg-white border border-red-100 p-2.5 rounded-lg text-[11px]">
                      Observación: "{myEnrollment.paymentObservations || "El comprobante no es legible o los datos bancarios no coinciden."}"
                    </span>
                    <span className="text-[11px] block text-red-800 font-bold mt-2">
                      Por favor vuelva a cargar el voucher correcto o ingrese el código de operación emitido por el banco.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmitMatriculaVoucher} className="space-y-4">
                  <h4 className="text-[10px] font-black text-[#8B0020] uppercase tracking-wider block mb-1">
                    Seleccione la Forma de Registro del Abono de Matrícula
                  </h4>

                  {/* Toggle tabs */}
                  <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setMatriculaPaymentType("number")}
                      className={`py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer text-center ${
                        matriculaPaymentType === "number"
                          ? "bg-white text-[#8B0020] shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      N° de Operación
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatriculaPaymentType("voucher")}
                      className={`py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer text-center ${
                        matriculaPaymentType === "voucher"
                          ? "bg-white text-[#8B0020] shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Subir Foto de Voucher
                    </button>
                  </div>

                  {matriculaPaymentType === "number" ? (
                    <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                      <div className="space-y-1 flex-1 w-full text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Código de N° de Operación Bancaria
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Ej: DEP-8492048 o TRX-29401"
                          value={matriculaVoucher}
                          onChange={(e) => setMatriculaVoucher(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B0020]/20 font-mono"
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
                      <label 
                        htmlFor="matricula-voucher-file" 
                        className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/40 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-center items-center text-center cursor-pointer block group"
                      >
                        <input
                          id="matricula-voucher-file"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setStagedMatriculaFile(file.name);
                            compressAndResizeImage(file, (compressedDataUrl) => {
                              setStagedMatriculaPreview(compressedDataUrl);
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
                          {stagedMatriculaFile ? `Seleccionado: ${stagedMatriculaFile}` : "Haga clic para elegir foto del voucher de matrícula"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          Formatos permitidos: JPG, JPEG, PNG • Tasa oficial S/. 250.00
                        </span>
                      </label>

                      {stagedMatriculaPreview && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center animate-fade-in text-center">
                          <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-2">
                            Vista Previa del Voucher de Matrícula:
                          </span>
                          <img 
                            src={stagedMatriculaPreview} 
                            alt="Preview voucher matrícula" 
                            className="max-h-40 object-contain rounded-lg border border-slate-300 shadow-xs" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setStagedMatriculaFile("");
                              setStagedMatriculaPreview("");
                            }}
                            className="mt-2 text-[9px] font-black uppercase text-red-700 tracking-wider hover:underline cursor-pointer"
                          >
                            Eliminar para Cambiar
                          </button>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={!stagedMatriculaPreview}
                        className={`w-full py-3 px-6 rounded-xl font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          stagedMatriculaPreview
                            ? "bg-[#8B0020] hover:bg-[#700018] text-white shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Enviar Voucher de Matrícula</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Methods & Cuentas Oficiales (col-span-1) */}
        <div className="space-y-6">
          
          {/* Cuentas de Recaudación Oficiales */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left">
            <span className="text-[10px] font-black text-[#8B0020] uppercase tracking-wider block border-b pb-2.5 mb-4">
              Cuentas Oficiales de Matrícula SFA
            </span>
            
            <div className="space-y-3 text-left">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#8B0020]" />
                  <span className="text-[11px] font-extrabold text-slate-800">BANCO DE LA NACIÓN</span>
                </div>
                <p className="text-[10px] font-mono text-slate-600 font-bold">Cta. Corriente: 00-015-123456</p>
                <p className="text-[9.5px] font-mono text-slate-500">CCI: 018-015-000015123456-12</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#8B0020]" />
                  <span className="text-[11px] font-extrabold text-slate-800">BCP - PAGO DE SERVICIOS</span>
                </div>
                <p className="text-[10px] font-mono text-slate-600 font-bold">Cta: 191-2345678-0-91</p>
                <p className="text-[9.5px] text-slate-500 font-bold">Empresa: SFA ADMISIONES</p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-amber-50/80 rounded-xl text-slate-600 border border-amber-200 text-[10px] leading-relaxed text-left">
              <p className="text-[#8B0020] font-black uppercase tracking-wider text-[9px] leading-tight mb-1">
                Nota de Tesorería:
              </p>
              <span className="font-semibold block text-slate-600">
                La tasa de S/. 250.00 cubre todos los derechos de matrícula regular del Ciclo I y registro en el Ministerio de Educación.
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 5. PLAN CURRICULAR - CICLO I (AMPLIO Y COMPLETO EN LA PARTE INFERIOR) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8B0020]" />
              Plan Curricular Oficial • Ciclo I
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Asignaturas oficiales correspondientes al primer semestre regular de <strong className="text-slate-800">{currentProgram.name}</strong> sincronizadas con Planificación Académica.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono border border-slate-200">
              {cycleCourses.length} Asignaturas
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#8B0020]/10 text-[#8B0020] px-3 py-1 rounded-full font-mono border border-[#8B0020]/20">
              {totalCredits} Créditos Académicos
            </span>
          </div>
        </div>

        {/* Multi-column grid for courses - no cramped vertical scrollbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {cycleCourses.map((c) => (
            <div 
              key={c.id} 
              className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 hover:border-[#8B0020]/30 rounded-xl flex flex-col justify-between gap-3 transition-all shadow-2xs group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-black text-[#8B0020] bg-white px-2 py-0.5 rounded border border-slate-200 group-hover:border-[#8B0020]/30 transition-colors">
                    {c.code}
                  </span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-slate-500 bg-white/80 border border-slate-200">
                    {c.type === "especificos" ? "Especialidad" : "Empleabilidad"}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-800 leading-snug">
                  {c.name}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 text-[10px]">
                <span className="text-slate-400 font-medium">Carga horaria y créditos:</span>
                <span className="font-black text-slate-800 font-mono bg-white px-2.5 py-0.5 rounded border border-slate-200">
                  {c.credits} Créditos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </PageTransition>
  );
});

export default MatriculaTab;
