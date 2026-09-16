import React from "react";
import { 
  Landmark, CheckCircle2, Clock, AlertTriangle, Info, Download, Check, Lock, CreditCard, RefreshCw, Printer, Smartphone, Upload 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../ui/Card";
import { Applicant, Enrollment } from "../../../types";
import { REAL_MPA_COURSES } from "../../../mockData";

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
}) => {
  let myEnrollment = enrollments.find(enr => enr.studentDni === applicant.dni);
  if (!myEnrollment) {
    myEnrollment = {
      studentDni: applicant.dni,
      programId: applicant.programId,
      academicStatus: "ADMITIDO" as const,
      docs: {
        dniFile: { status: "No Enviado" as const },
        certificadoFile: { status: "No Enviado" as const },
        partidaFile: { status: "No Enviado" as const },
        fotoFile: { status: "No Enviado" as const }
      },
      paymentStatus: "No Pagado" as const
    };
  }
  const isPaid = myEnrollment.paymentStatus === "Validado";
  const isEnrolled = myEnrollment.academicStatus === "MATRICULADO";
  const isPending = myEnrollment.paymentStatus === "Pendiente";
  const isObserved = myEnrollment.paymentStatus === "Observado";

  const cycleCourses = REAL_MPA_COURSES.filter(
    c => c.careerId === applicant.programId && c.referenceCycle === 1
  );

  return (
    <PageTransition id="matricula" className="max-w-6xl mx-auto space-y-6 text-left animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
              <Landmark className="w-6 h-6 text-[#9F062A]" /> 
              Proceso de Matrícula Regular - Primer Ciclo
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-1">
              Bienvenido ingresante, aquí podrá registrar su voucher de pago de matrícula de S/. 250.00 para la Oficina de Caja (MAMC) y visualizar su malla curricular activa.
            </p>
          </div>
          <div>
            {isPaid ? (
              isEnrolled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4" /> Matriculado Oficial
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-150 text-sky-850 border border-sky-300 animate-pulse">
                  <Clock className="w-4 h-4 text-sky-700" /> Pago Aprobado • Esperando Cursos
                </span>
              )
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                <Clock className="w-4 h-4" /> En Validación por Caja
              </span>
            ) : isObserved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-4 h-4" /> Pago Observado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-300">
                <Clock className="w-4 h-4" /> Pago Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form or Approved Status */}
          <div className="lg:col-span-7 space-y-6">
            {isPaid ? (
              isEnrolled ? (
                <Card className="border-emerald-300 shadow-lg overflow-hidden bg-white">
                  <div className="bg-emerald-600 text-white p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-amber-300 animate-bounce" />
                    <h3 className="text-lg font-black uppercase tracking-wider">¡Matrícula Validada e Inscrita Exitosamente!</h3>
                    <p className="text-xs text-emerald-100 font-medium mt-1">
                      Felicidades, la Secretaría General ha completado su matrícula oficial. Ya es estudiante oficial del primer ciclo.
                    </p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="p-4 bg-slate-50 border rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Estudiante:</span>
                        <span className="font-extrabold text-slate-800">{applicant.name} {applicant.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Documento (DNI):</span>
                        <span className="font-mono font-extrabold text-slate-800">{applicant.dni}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Carrera Profesional:</span>
                        <span className="font-extrabold text-[#9F062A] uppercase">{currentProgram.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Ciclo de Estudios:</span>
                        <span className="font-extrabold text-slate-800">I (Primer Ciclo)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Turno Académico Oficial:</span>
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px] font-mono">{myEnrollment?.shift || "Mañana"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Sección / Grupo Académico:</span>
                        <span className="font-extrabold text-slate-800">
                          {(() => {
                            if (!myEnrollment?.groupId) return "Asignado";
                            let groups = [];
                            try {
                              const saved = localStorage.getItem("mpa_db_groups");
                              if (saved) groups = JSON.parse(saved);
                            } catch (e) {}
                            const g = groups.find((grp: any) => grp.id === myEnrollment.groupId);
                            return g ? g.name : myEnrollment.groupId;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-slate-500 font-bold">Costo de Matrícula:</span>
                        <span className="font-extrabold text-slate-800">S/. 250.00 (VALIDADO)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Operación de Depósito:</span>
                        <span className="font-mono font-extrabold text-emerald-700">{myEnrollment?.paymentOperation}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs text-emerald-800 flex gap-2">
                      <Info className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                      <div>
                        <strong className="block">Asignación Horaria y Sección Activa:</strong>
                        Su aula, sección, horario de clases y su Módulo de Alumno con su intranet oficial han sido planificados y sincronizados por el Módulo de Planificación Académica (MPA). Sus clases iniciarán formalmente según el calendario académico institucional.
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 p-4 border-t flex justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">SISTEMA INTEGRADO SFA • SECRETARÍA GENERAL</span>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        alert("Descargando Ficha Oficial de Matrícula Semestral...");
                      }}
                      className="text-xs uppercase font-black tracking-wider border-emerald-300 hover:bg-emerald-50 text-emerald-800"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Ficha de Matrícula
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="border-sky-300 shadow-lg overflow-hidden bg-white">
                  <div className="bg-sky-600 text-white p-6 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-sky-100 animate-pulse" />
                    <h3 className="text-lg font-black uppercase tracking-wider">¡Pago de Matrícula Validado!</h3>
                    <p className="text-xs text-sky-100 font-medium mt-1">
                      Su pago ha sido aprobado de manera exitosa por la Oficina de Caja (MAMC). El derecho de matrícula de S/. 250.00 está registrado.
                    </p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="p-4 bg-slate-50 border rounded-lg space-y-2.5 text-xs text-slate-700">
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-slate-500 font-bold">DNI del Alumno:</span>
                        <span className="font-mono font-extrabold text-slate-800">{applicant.dni}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-slate-500 font-bold">Carrera Profesional:</span>
                        <span className="font-extrabold text-[#9F062A] uppercase">{currentProgram.name}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-slate-500 font-bold">Estado de Pago:</span>
                        <span className="px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">APROBADO POR CAJA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Matrícula y Cursos:</span>
                        <span className="px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider bg-amber-100 text-amber-850 border border-amber-200 animate-pulse">PENDIENTE DE ASIGNACIÓN</span>
                      </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg text-xs text-sky-950 space-y-2">
                      <div className="flex gap-2 font-bold text-sky-900">
                        <Info className="w-4.5 h-4.5 flex-shrink-0 text-sky-600" />
                        <span>Debe esperar su matrícula</span>
                      </div>
                      <p className="leading-relaxed font-medium">
                        Su pago está conforme. Actualmente, debe esperar a que la <strong className="text-slate-900">Secretaría General</strong> proceda con su matrícula oficial en un ciclo/sección y le asigne sus cursos y horarios del Ciclo I.
                      </p>
                      <p className="leading-relaxed text-[11px] text-slate-500 font-medium">
                        Una vez que sea matriculado formalmente por el administrador, se activará su Módulo de Alumno/Intranet y podrá ver sus asignaturas oficiales, sección, turno y horarios aquí mismo.
                      </p>
                    </div>

                    {/* Simple interactive timeline */}
                    <div className="pt-2 border-t">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Estado de su Matrícula</span>
                      <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-4">
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-white shadow-xs">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <p className="text-[11px] font-black text-slate-800">1. Envío de Comprobante</p>
                          <p className="text-[10px] text-slate-500 font-medium">Usted registró exitosamente su voucher de S/. 250.00.</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center border-2 border-white shadow-xs">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <p className="text-[11px] font-black text-slate-800">2. Aprobación en Recaudación (Caja)</p>
                          <p className="text-[10px] text-slate-500 font-medium">La Oficina de Caja validó y aprobó su operación bancaria: <strong className="font-mono text-emerald-700">{myEnrollment?.paymentOperation}</strong>.</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          <p className="text-[11px] font-black text-slate-800 animate-pulse">3. Asignación de Sección y Cursos (Secretaría General)</p>
                          <p className="text-[10px] text-slate-500 font-semibold text-amber-800">La Secretaría está asignando su sección, aula, turno y carga de asignaturas.</p>
                        </div>
                        <div className="relative opacity-60">
                          <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center border-2 border-white shadow-xs">
                            <Lock className="w-2 text-slate-500" />
                          </div>
                          <p className="text-[11px] font-black text-slate-600">4. Activación Total de Intranet de Alumno</p>
                          <p className="text-[10px] text-slate-500 font-medium">Acceso libre al portal del estudiante con horarios detallados, notas y docentes.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 p-4 border-t flex justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">ESPERANDO ASIGNACIÓN ACADÉMICA</span>
                    <Button 
                      variant="outline"
                      disabled
                      className="text-xs uppercase font-black tracking-wider border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Ficha de Matrícula (Bloqueado)
                    </Button>
                  </CardFooter>
                </Card>
              )
            ) : (
              <Card className="shadow-md bg-white">
                <CardHeader className="border-b">
                  <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-5 h-5 text-[#9F062A]" /> Registrar Pago de Matrícula
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Complete el pago por depósito bancario y registre su comprobante para habilitar su matrícula del primer ciclo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isPending && !isEditingMatricula && (
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 text-center mb-6 space-y-4 animate-fade-in">
                      <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
                      <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">Pago de Matrícula en Proceso de Validación</h4>
                      
                      <div className="p-4 bg-white border border-slate-200 rounded-lg max-w-md mx-auto text-left space-y-3 shadow-xs">
                        <span className="text-[9px] font-black tracking-wider text-slate-400 block uppercase font-mono border-b pb-1">Comprobante Enviado por Alumno:</span>
                        {myEnrollment?.paymentType === "number" ? (
                          <div className="text-xs space-y-1.5">
                            <p className="text-slate-600 font-bold"><strong>Método registrado:</strong> Número de Operación Bancaria</p>
                            <p className="text-slate-850 font-extrabold"><strong>N° de Operación:</strong> <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-[13px] border border-slate-200">{myEnrollment?.paymentOperation}</span></p>
                          </div>
                        ) : (
                          <div className="text-xs space-y-2">
                            <p className="text-slate-600 font-bold"><strong>Método registrado:</strong> Foto de Voucher de Depósito</p>
                            {myEnrollment?.paymentVoucherFileName && (
                              <p className="text-slate-750"><strong>Archivo:</strong> <span className="font-mono text-slate-600 font-bold break-all bg-slate-50 px-1 rounded">{myEnrollment.paymentVoucherFileName}</span></p>
                            )}
                            {myEnrollment?.paymentVoucherUrl && (
                              <div className="mt-2 border rounded p-1 bg-slate-50 flex flex-col items-center">
                                <span className="text-[8px] text-slate-404 font-black block mb-1 uppercase tracking-widest">Vista de su Voucher:</span>
                                <img 
                                  src={myEnrollment.paymentVoucherUrl} 
                                  alt="Voucher de matrícula enviado" 
                                  className="max-h-48 object-contain rounded border shadow-sm animate-fade-in" 
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
                        La Oficina de Caja (MAMC) está validando el depósito. Esto puede tardar unos minutos. Podrá ver su estado aquí mismo en tiempo real.
                      </p>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditMatricula(myEnrollment)}
                          className="px-4 py-2 border border-amber-300 bg-white hover:bg-amber-100/50 rounded-lg text-xs font-black uppercase text-amber-900 tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Editar o Cambiar Comprobante
                        </button>
                      </div>
                    </div>
                  )}

                  {isObserved && (
                    <div className="bg-rose-50 border border-rose-300 rounded-lg p-5 mb-6 space-y-3">
                      <div className="flex items-center gap-2 text-rose-800 font-black uppercase text-xs tracking-wider">
                        <AlertTriangle className="w-5 h-5 text-rose-600" /> ¡Comprobante Observado por Caja!
                      </div>
                      <p className="text-xs text-rose-700 font-bold">
                        Motivo de observación: <span className="underline">{myEnrollment?.paymentObservations || "Código de operación no encontrado o ilegible."}</span>
                      </p>
                      
                      <div className="p-4 bg-white border border-rose-100 rounded-lg max-w-md text-left space-y-3 shadow-xs">
                        <span className="text-[9px] font-black tracking-wider text-rose-400 block uppercase font-mono border-b pb-1">Comprobante que fue Observado:</span>
                        {myEnrollment?.paymentType === "number" ? (
                          <div className="text-xs space-y-1.5">
                            <p className="text-slate-600 font-bold"><strong>Método:</strong> Número de Operación Bancaria</p>
                            <p className="text-slate-850 font-extrabold"><strong>N° de Operación:</strong> <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-[13px] border border-slate-250">{myEnrollment?.paymentOperation}</span></p>
                          </div>
                        ) : (
                          <div className="text-xs space-y-2">
                            <p className="text-slate-600 font-bold"><strong>Método:</strong> Foto de Voucher de Depósito</p>
                            {myEnrollment?.paymentVoucherFileName && (
                              <p className="text-slate-750"><strong>Archivo:</strong> <span className="font-mono text-slate-600 font-bold break-all bg-slate-50 px-1 rounded">{myEnrollment.paymentVoucherFileName}</span></p>
                            )}
                            {myEnrollment?.paymentVoucherUrl && (
                              <div className="mt-2 border rounded p-1 bg-slate-50 flex flex-col items-center">
                                <img 
                                  src={myEnrollment.paymentVoucherUrl} 
                                  alt="Voucher observado" 
                                  className="max-h-48 object-contain rounded border shadow-sm grayscale opacity-75" 
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600">
                        Por favor, revise y vuelva a cargar el voucher correcto o ingrese un número de operación válido a continuación.
                      </p>
                    </div>
                  )}

                  {/* Payment instructions */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 space-y-3 text-xs">
                    <h4 className="font-black text-slate-800 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5 text-[11px]">
                      <Landmark className="w-4 h-4 text-[#9F062A]" /> Cuentas de Recaudación Oficial SFA
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-2.5 bg-white border rounded">
                        <span className="font-extrabold text-slate-700 block text-[11px]">BANCO DE LA NACIÓN</span>
                        <span className="font-mono text-slate-500 block text-[10px]">Cta. Corriente: 00-015-123456</span>
                        <span className="font-mono text-slate-500 block text-[10px]">CCI: 018-015-000015123456-12</span>
                      </div>
                      <div className="p-2.5 bg-white border rounded">
                        <span className="font-extrabold text-slate-700 block text-[11px]">BCP (PAGO DE SERVICIOS)</span>
                        <span className="font-mono text-slate-500 block text-[10px]">Cta: 191-2345678-0-91</span>
                        <span className="font-mono text-slate-500 block text-[10px]">Empresa: SFA ADMISIONES</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-500">Monto Único Matrícula:</span>
                      <span className="font-black text-[#9F062A] text-xs">S/. 250.00</span>
                    </div>
                  </div>

                  {/* Form */}
                  {((!isPending && !isObserved) || isObserved || isEditingMatricula) && (
                    <form onSubmit={handleSubmitMatriculaVoucher} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Método de Validación de Depósito:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMatriculaPaymentType("voucher")}
                            className={`py-2 px-3 border rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                              matriculaPaymentType === "voucher"
                                ? "bg-[#9F062A]/5 border-[#9F062A] text-[#9F062A] font-extrabold shadow-xs"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <Printer className="w-3.5 h-3.5" /> Subir Foto de Voucher
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatriculaPaymentType("number")}
                            className={`py-2 px-3 border rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                              matriculaPaymentType === "number"
                                ? "bg-[#9F062A]/5 border-[#9F062A] text-[#9F062A] font-extrabold shadow-xs"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" /> Número de Operación
                          </button>
                        </div>
                      </div>

                      {matriculaPaymentType === "number" ? (
                        <div className="space-y-2 animate-fade-in">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Número de Operación Bancaria:</label>
                          <input
                            type="text"
                            placeholder="Ej: DEP-8492048"
                            value={matriculaVoucher}
                            onChange={(e) => setMatriculaVoucher(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9F062A] font-mono font-bold text-sm"
                          />
                          <span className="text-[9px] text-slate-400 block font-medium leading-none">Ingrese exactamente el número de operación impreso en su comprobante o transferencia.</span>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-fade-in">
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-50/50 hover:bg-slate-50 hover:border-[#9F062A]/40 transition-all text-center relative cursor-pointer">
                            <input
                              id="matricula-voucher-file"
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setStagedMatriculaFile(file.name);
                                compressAndResizeImage(file, (compressedDataUrl) => {
                                  setStagedMatriculaPreview(compressedDataUrl);
                                });
                              }}
                            />
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Upload className="w-5 h-5 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">SELECCIONAR IMAGEN JPG O PNG</span>
                              <span className="text-[9px] text-slate-400 font-bold max-w-xs leading-normal block">
                                {stagedMatriculaFile ? `Seleccionado: ${stagedMatriculaFile}` : "Haga clic o arrastre foto de su voucher de depósito aquí."}
                              </span>
                            </div>
                          </div>

                          {stagedMatriculaPreview && (
                            <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center animate-fade-in text-center">
                              <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-2">Vista Previa de Voucher Seleccionado:</span>
                              <img 
                                src={stagedMatriculaPreview} 
                                alt="Preview matricula voucher" 
                                className="max-h-36 object-contain rounded border border-slate-300 shadow-sm" 
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setStagedMatriculaFile("");
                                  setStagedMatriculaPreview("");
                                }}
                                className="mt-1.5 text-[8px] font-black uppercase text-red-700 tracking-wider hover:underline animate-pulse"
                              >
                                Eliminar para Cambiar
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                        {isEditingMatricula && (
                          <button
                            type="button"
                            onClick={() => setIsEditingMatricula(false)}
                            className="flex-1 py-2.5 px-6 rounded font-extrabold uppercase text-[10px] tracking-widest bg-slate-150 hover:bg-slate-200 text-slate-700 transition-all text-center border border-slate-200 h-[40px] cursor-pointer"
                          >
                            Cancelar Edición
                          </button>
                        )}
                        <button 
                          type="submit"
                          disabled={matriculaPaymentType === "number" ? !matriculaVoucher.trim() : !stagedMatriculaPreview}
                          className={`flex-grow py-2.5 px-6 rounded font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all text-center flex items-center justify-center gap-1.5 h-[40px] cursor-pointer ${
                            (matriculaPaymentType === "number" ? matriculaVoucher.trim() : stagedMatriculaPreview)
                              ? "bg-[#9F062A] hover:bg-[#800521] text-white shadow-sm"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>{isEditingMatricula ? "Actualizar Comprobante" : "Enviar Comprobante de Matrícula"}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Curriculum (La Malla Activa de MPA) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-md bg-white border-[#9F062A]/10">
              <CardHeader className="bg-slate-50 border-b">
                <span className="text-[9px] text-[#9F062A] font-extrabold tracking-widest uppercase">Malla de MPA Sincronizada</span>
                <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider mt-1">
                  Plan Curricular Ciclo I
                </CardTitle>
                <CardDescription className="text-xs">
                  Cursos oficiales de la carrera activa en la planificación de IESTP SFA.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-lg text-xs text-indigo-900 flex gap-2">
                  <Info className="w-4.5 h-4.5 flex-shrink-0 text-indigo-600" />
                  <div>
                    Se ha cargado la estructura de asignaturas de <strong>{currentProgram.name}</strong> directamente desde el Módulo de Planificación Académica.
                  </div>
                </div>

                <div className="space-y-2">
                  {cycleCourses.map((crs) => (
                    <div key={crs.id} className="p-3 bg-white border border-slate-200 hover:border-[#9F062A]/30 rounded-lg flex items-center justify-between gap-2 transition-all shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                            {crs.code}
                          </span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                            {crs.type === "Especialidad" ? "Especialidad" : "Común"}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-800 block uppercase leading-snug">
                          {crs.name}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-404 font-extrabold uppercase block">CRÉDITOS</span>
                        <span className="text-xs font-black text-slate-700">{crs.credits}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t flex justify-between items-center text-xs px-2">
                  <span className="font-bold text-slate-500">Total Unidades Didácticas:</span>
                  <span className="font-black text-slate-800">{cycleCourses.length} cursos</span>
                </div>
                <div className="flex justify-between items-center text-xs px-2">
                  <span className="font-bold text-slate-500">Créditos Totales Ciclo I:</span>
                  <span className="font-black text-[#9F062A]">{cycleCourses.reduce((acc, curr) => acc + curr.credits, 0)} Cr.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
});

MatriculaTab.displayName = "MatriculaTab";
export default MatriculaTab;
