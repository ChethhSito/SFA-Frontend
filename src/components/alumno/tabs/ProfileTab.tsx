import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, Upload, FileText, Eye, ShieldCheck, X, BookOpen, Check } from "lucide-react";
import { StudentPersonalData, Enrollment, AcademicProgram, Graduation } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface ProfileTabProps {
  personalData: StudentPersonalData;
  enrollment: Enrollment;
  currentProgram?: AcademicProgram;
  profileForm: StudentPersonalData;
  setProfileForm: React.Dispatch<React.SetStateAction<StudentPersonalData>>;
  profileSavedMsg: string;
  handleSaveProfile: (e: React.FormEvent) => void;
  profileInnerTab: "docs" | "payments" | "academic";
  setProfileInnerTab: React.Dispatch<React.SetStateAction<"docs" | "payments" | "academic">>;
  simulateDocUpload: (docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile", name: string) => void;
  isPaidInvoice: boolean;
  paymentOp: string;
  setPaymentOp: React.Dispatch<React.SetStateAction<string>>;
  paySuccessMsg: string;
  handlePayInvoice: () => void;
  onUpdateEnrollment: (enroll: Enrollment) => void;
  graduation?: Graduation;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  personalData,
  enrollment,
  currentProgram,
  profileForm,
  setProfileForm,
  profileSavedMsg,
  handleSaveProfile,
  profileInnerTab,
  setProfileInnerTab,
  simulateDocUpload,
  isPaidInvoice,
  paymentOp,
  setPaymentOp,
  paySuccessMsg,
  handlePayInvoice,
  onUpdateEnrollment,
  graduation
}) => {
  const [previewDoc, setPreviewDoc] = useState<{ title: string; fileName: string } | null>(null);

  return (
    <PageTransition id="profile" className="space-y-6">
      {/* Modal de Vista Previa de Documento Requisitorial */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#800521] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider">Visor Oficial de Expediente Digital</h3>
                  <p className="text-[10px] text-rose-200 font-medium">{previewDoc.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <div>
                  <span className="font-mono text-xs font-extrabold text-slate-800 block">{previewDoc.fileName}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full mt-1 inline-block uppercase">
                    Documento Validado y Conforme
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Archivo digital custodiado en el repositorio oficial de Secretaría Académica para el ciclo lectivo 2026-I.
                </p>
              </div>

              <div className="text-[11px] text-slate-600 bg-amber-50/60 border border-amber-200/70 p-3 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Titular del Documento:</span>
                  <span className="font-bold text-slate-800 uppercase">{personalData.name} {personalData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">DNI:</span>
                  <span className="font-mono font-bold text-slate-800">{personalData.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Estado en Secretaría:</span>
                  <span className="font-extrabold text-emerald-700 uppercase">Aprobado y Foliado</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="bg-[#800521] hover:bg-[#9F062A] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intro row */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-display mb-1">Información Personal del Estudiante</h2>
        <p className="text-xs text-slate-500 font-semibold font-medium">Gestione sus datos de contacto, revise sus expedientes requisitarios oficiales de matrícula y verifique sus estados institucionales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Profile Summary Photo Card */}
        <div className="space-y-6">
          {/* User profile details block */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs text-center">
            <div className="relative inline-block mx-auto mb-4">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-100 shadow-md">
                <svg className="h-full w-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                </svg>
              </div>
              <span className="absolute bottom-1 right-1 bg-emerald-500 h-4 border-2 border-white w-4 rounded-full" />
            </div>

            <h3 className="text-base font-extrabold text-slate-800 font-display">
              {personalData.name} {personalData.lastName}
            </h3>
            <p className="text-[10px] text-[#800521] uppercase tracking-widest font-black mt-1">
              ESTUDIANTE DE {currentProgram?.name || "ELECTRICIDAD INDUSTRIAL"}
            </p>

            <span className="text-[9px] mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-3 py-0.5 rounded-full inline-block uppercase">
              Matrícula Activa 2026-I
            </span>

            <div className="mt-6 pt-6 border-t border-slate-50 text-[11px] font-semibold text-slate-600 text-left space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">DNI Original:</span>
                <span className="text-slate-800 font-mono font-bold">{personalData.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Código Oficial:</span>
                <span className="text-slate-800 font-mono font-bold">SFA-2026-{personalData.dni.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Celular:</span>
                <span className="text-slate-800 font-bold">{personalData.phone || "No registrado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dirección:</span>
                <span className="text-slate-800 shrink-0 text-right truncate max-w-[130px]">{personalData.address || "Sede Principal"}</span>
              </div>
            </div>

            <button 
              onClick={() => alert("Para actualizar sus datos de domicilio oficiales para titulación, consulte a ventanilla de Secretaría Académica.")}
              className="w-full mt-6 bg-[#800521] hover:bg-[#9F062A] text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Editar Perfil
            </button>
          </div>

          {/* Estado de Pagos / Regularización */}
          <div className="bg-[#800521] text-white rounded-xl p-5 shadow-sm border-l-4 border-amber-400 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-950/75 text-amber-300 font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">
                  Periodo 2026-I
                </span>
                <span className="text-slate-100 font-bold text-[10px]">Vence: 30 de Mayo</span>
              </div>
              <span className="text-slate-200 text-[9px] uppercase font-bold tracking-wider block">Saldo Pendiente Regularización</span>
              <span className="text-2.5xl font-black text-amber-300 tracking-tight block mt-0.5">
                {isPaidInvoice ? "S/. 0.00" : "S/. 450.00"}
              </span>
              <p className="text-[10px] text-slate-100 font-medium leading-relaxed mt-1.5">
                {isPaidInvoice ? "Su cuenta y matrícula se encuentran totalmente al día en Caja Institucional." : "Pensión ordinaria del mes corriente. Por favor efectúe el pago para mantener habilitada su carpeta digital de ciclo."}
              </p>
            </div>

            {!isPaidInvoice && (
              <button 
                onClick={handlePayInvoice}
                className="w-full bg-white hover:bg-slate-100 text-[#800521] font-extrabold py-2 rounded-lg text-xs uppercase tracking-wider transition-all mt-4 shadow-sm cursor-pointer"
              >
                Pagar Ahora
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Tab View containing Document Submission or Payments */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col">
          {/* Tabs Headers Panel */}
          <div className="flex border-b border-slate-100 pb-3 mb-6 gap-6 text-xs font-bold font-display overflow-x-auto">
            <button 
              onClick={() => setProfileInnerTab("docs")}
              className={`pb-2 transition-all relative cursor-pointer pr-1 shrink-0 ${profileInnerTab === "docs" ? "text-[#800521] font-extrabold border-b-2 border-[#800521]" : "text-slate-400 hover:text-slate-600"}`}
            >
              Carga de Documentos
            </button>
            <button 
              onClick={() => setProfileInnerTab("payments")}
              className={`pb-2 transition-all relative cursor-pointer pr-1 shrink-0 ${profileInnerTab === "payments" ? "text-[#800521] font-extrabold border-b-2 border-[#800521]" : "text-slate-400 hover:text-slate-600"}`}
            >
              Historial de Pagos
            </button>
            <button 
              onClick={() => setProfileInnerTab("academic")}
              className={`pb-2 transition-all relative cursor-pointer pr-1 shrink-0 ${profileInnerTab === "academic" ? "text-[#800521] font-extrabold border-b-2 border-[#800521]" : "text-slate-400 hover:text-slate-600"}`}
            >
              Datos Académicos
            </button>
          </div>

          {/* Dynamic Tabs view contents */}
          <div>
            {profileInnerTab === "docs" && (
              <div className="space-y-4">
                {(() => {
                  const rawDocs = enrollment.docs || {};
                  const isEnrolled = enrollment.academicStatus === "MATRICULADO";

                  const docConfigs = [
                    { title: "Copia de Documento Nacional de Identidad (DNI)", key: "dniFile" as const, mandatory: true, defaultFile: `dni_${personalData.dni}.pdf` },
                    { title: "Certificado de Estudios de Educación Secundaria Completa", key: "certificadoFile" as const, mandatory: true, defaultFile: `certificado_secundaria_${personalData.dni}.pdf` },
                    { title: "Partida de Nacimiento Original", key: "partidaFile" as const, mandatory: true, defaultFile: `partida_nacimiento_${personalData.dni}.pdf` },
                    { title: "Fotografía Tamaño Carnet a Color con Fondo Blanco", key: "fotoFile" as const, mandatory: true, defaultFile: `foto_carnet_${personalData.dni}.jpg` }
                  ];

                  const docList = docConfigs.map(cfg => {
                    const d = (rawDocs as any)[cfg.key];
                    const isValidated = d?.status === "Validado" || isEnrolled;
                    const isObserved = d?.status === "Observado";
                    const isPending = d?.status === "Pendiente" || (d?.fileName && !isValidated);
                    const status = isValidated ? "Validado" : isObserved ? "Observado" : isPending ? "Pendiente" : (d?.status || (isEnrolled ? "Validado" : "Pendiente"));
                    const fileName = d?.fileName || (status === "Validado" || isEnrolled ? cfg.defaultFile : undefined);
                    return {
                      ...cfg,
                      status,
                      fileName
                    };
                  });

                  const validatedCount = docList.filter(d => d.status === "Validado").length;

                  return (
                    <>
                      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] font-semibold text-slate-600 shrink-0 mb-4">
                        <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Carpeta Requisitorial del Alumno
                        </span>
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          {validatedCount} de {docList.length} documentos validados
                        </span>
                      </div>

                      {docList.map((doc, idx) => {
                        const isValidated = doc.status === "Validado";
                        const isPending = doc.status === "Pendiente";
                        const isObserved = doc.status === "Observado";

                        return (
                          <div key={idx} className="p-4 border border-slate-100 bg-slate-50/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-colors">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">{doc.title}</span>
                                {doc.mandatory && <span className="text-[8px] bg-red-100 text-[#800521] font-black px-1.5 py-0.5 rounded leading-none">Obligatorio</span>}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">Requisito digital escaneado a color en formato PDF o JPG continuo.</p>
                              {doc.fileName && (
                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded w-fit">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{doc.fileName}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 shrink-0 w-full md:w-auto">
                              <div>
                                {isValidated && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5 animate-pulse">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Pendiente
                                  </span>
                                )}
                                {isObserved && (
                                  <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5">
                                    <XCircle className="w-3.5 h-3.5 text-red-500" /> Observado
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {doc.fileName && (
                                  <button
                                    onClick={() => setPreviewDoc({ title: doc.title, fileName: doc.fileName || "" })}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] uppercase font-bold py-1 px-2.5 rounded transition-all inline-flex items-center gap-1 cursor-pointer select-none"
                                    title="Ver documento adjunto"
                                  >
                                    <Eye className="w-3 h-3 text-slate-600" /> Ver
                                  </button>
                                )}

                                <button 
                                  onClick={() => {
                                    const name = prompt("Escriba el nombre del archivo actualizado que desea adjuntar:", `expediente_${doc.key}_${personalData.dni}.pdf`);
                                    if (name) {
                                      simulateDocUpload(doc.key, name);
                                    }
                                  }}
                                  className="bg-[#800521] hover:bg-[#9F062A] text-white text-[10px] uppercase font-bold py-1 px-3 rounded transition-all inline-flex items-center gap-1 cursor-pointer select-none"
                                >
                                  <Upload className="w-3 h-3 text-amber-300" /> {isValidated ? "Actualizar" : "Subir archivo"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}

            {profileInnerTab === "payments" && (
              <div className="space-y-4">
                <span className="text-[10px] text-[#800521] font-bold uppercase tracking-wider block">Historial de Operaciones Financieras</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                    <thead>
                      <tr className="border-b text-slate-400 text-[10px] uppercase text-left">
                        <th className="py-2">Operación ID</th>
                        <th className="py-2">Concepto</th>
                        <th className="py-2">Monto</th>
                        <th className="py-2">Fecha</th>
                        <th className="py-2 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 font-mono text-[11px] text-[#800521]">{enrollment.paymentOperation || `OP-MATR-2026-${personalData.dni.slice(-4)}`}</td>
                        <td className="py-3">Matrícula Semestral 2026-I (Ciclo I)</td>
                        <td className="py-3 font-bold">S/. 250.00</td>
                        <td className="py-3 text-slate-400">01/03/2026</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Aprobado en Caja
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 font-mono text-[11px] text-[#800521]">OP-ADM-2026-{personalData.dni.slice(-4)}</td>
                        <td className="py-3">Derecho de Examen Ordinario de Admisión</td>
                        <td className="py-3 font-bold">S/. 120.00</td>
                        <td className="py-3 text-slate-400">12/02/2026</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Aprobado en Caja
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {profileInnerTab === "academic" && (
              <div className="space-y-4">
                <span className="text-[10px] text-[#800521] font-bold uppercase tracking-wider block">Malla de Avance del Estudiante • Ciclo I</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">PPA Promedio</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">--</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">En Curso</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Ciclos Completos</span>
                    <span className="text-xl font-black text-[#800521] block mt-1">0 / 6</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Ciclo I Activo</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Créditos Inscritos</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">24 CTR</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Semestre 2026-I</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Plan Académico</span>
                    <span className="text-xs font-black text-slate-700 block mt-1">Plan Modular 2026-I</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{currentProgram?.name || "Electricidad Industrial"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[#800521]" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Asignaturas Matriculadas en Ciclo I (2026-I)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b text-slate-400 text-[10px] uppercase text-left">
                          <th className="py-2">Código</th>
                          <th className="py-2">Asignatura</th>
                          <th className="py-2">Horas</th>
                          <th className="py-2">Créditos</th>
                          <th className="py-2 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { code: "EEI-101", name: "Instalaciones Eléctricas de Interiores", hrs: "6 Hrs", cr: "4 CTR" },
                          { code: "EEI-102", name: "Circuitos Eléctricos I", hrs: "6 Hrs", cr: "4 CTR" },
                          { code: "EEI-103", name: "Dibujo Técnico Eléctrico", hrs: "6 Hrs", cr: "4 CTR" },
                          { code: "EEI-104", name: "Seguridad e Higiene Industrial", hrs: "4 Hrs", cr: "3 CTR" },
                          { code: "EEI-105", name: "Matemática Aplicada I", hrs: "6 Hrs", cr: "4 CTR" },
                          { code: "EEI-106", name: "Comunicación y Redacción Técnica", hrs: "4 Hrs", cr: "2 CTR" },
                          { code: "EEI-107", name: "Informática e Internet", hrs: "4 Hrs", cr: "2 CTR" },
                          { code: "EEI-108", name: "Inglés Técnico I", hrs: "2 Hrs", cr: "1 CTR" },
                          { code: "EEI-109", name: "Medio Ambiente y Desarrollo Sostenible", hrs: "2 Hrs", cr: "1 CTR" }
                        ].map((c) => (
                          <tr key={c.code} className="hover:bg-slate-50">
                            <td className="py-2.5 font-mono text-[11px] text-[#800521] font-bold">{c.code}</td>
                            <td className="py-2.5 font-bold text-slate-800">{c.name}</td>
                            <td className="py-2.5 text-slate-500">{c.hrs}</td>
                            <td className="py-2.5 text-slate-500">{c.cr}</td>
                            <td className="py-2.5 text-right">
                              <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200">
                                Matriculado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available billing methods footer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3 text-center">CANALES DE PAGO HABILITADOS EN CAJA</span>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-700 block">Tarjeta de Crédito</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Visa, Mastercard</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-700 block">Ventanilla de Caja</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Campus Central</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-700 block">Banca Digital / Yape</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Confirmación Inmediata</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
