import React from "react";
import { CheckCircle2, Clock, XCircle, Upload } from "lucide-react";
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
  return (
    <PageTransition id="profile" className="space-y-6">
      {/* Intro row */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-display mb-1">Información Personal del Estudiante</h2>
        <p className="text-xs text-slate-500 font-semibold font-medium">Gestione sus datos de contacto, cargue los expedientes requisitarios oficiales de matrícula y verifique sus estados de cobros institucionales.</p>
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
                <span className="text-slate-800 font-mono font-bold">SFA-2026-0043</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Celular:</span>
                <span className="text-slate-800 font-bold">{personalData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dirección:</span>
                <span className="text-slate-800 shrink-0 text-right truncate max-w-[130px]">{personalData.address}</span>
              </div>
            </div>

            <button 
              onClick={() => alert("Simulación: Para cambiar sus datos de domicilio oficiales para titulación, consulte a ventanilla única de secretaría con copia certificada.")}
              className="w-full mt-6 bg-[#800521] hover:bg-[#9F062A] text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Editar Perfil
            </button>
          </div>

          {/* Pending billing crimson state block */}
          <div className="bg-[#800521] text-white rounded-xl p-5 shadow-sm border-l-4 border-amber-400 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-950/75 text-amber-300 font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">
                  Periodo 2026-I
                </span>
                <span className="text-slate-100 font-bold text-[10px]">Vence: 30 de Mayo</span>
              </div>
              <span className="text-slate-205 text-[9px] uppercase font-bold tracking-wider block">Saldo Pendiente Regularización</span>
              <span className="text-2.5xl font-black text-amber-300 tracking-tight block mt-0.5">
                {isPaidInvoice ? "S/. 0.00" : "S/. 450.00"}
              </span>
              <p className="text-[10px] text-slate-100 font-medium leading-relaxed mt-1.5">
                {isPaidInvoice ? "Su cuenta se encuentra totalmente al día." : "Pensión ordinaria del mes corriente. Por favor efectúe el pago para mantener habilitada su carpeta digital de ciclo."}
              </p>
            </div>

            {!isPaidInvoice && (
              <button 
                onClick={handlePayInvoice}
                className="w-full bg-white hover:bg-[#9f062a]/10 text-[#800521] font-extrabold py-2 rounded-lg text-xs uppercase tracking-wider transition-all mt-4 shadow-sm cursor-pointer"
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
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] font-semibold text-slate-6y shrink-0 mb-4">
                  <span className="text-slate-500">Carpeta Requisitorial del Alumno</span>
                  <span className="font-bold text-slate-800">3 de 5 documentos validados</span>
                </div>

                {[
                  { title: "Copia legalizada de DNI (Anverso y Reverso)", key: "dniFile" as const, mandatory: true, mockStatus: "Validado" },
                  { title: "Certificado de Estudios de Educación Secundaria Completa", key: "certificadoFile" as const, mandatory: true, mockStatus: enrollment.docs.certificadoFile?.status || "Pendiente" },
                  { title: "Certificado Médico de Salud e Invalidez", key: "partidaFile" as const, mandatory: false, mockStatus: enrollment.docs.partidaFile?.status || "Pendiente" },
                  { title: "Constancia de Certificación de No Antecedentes Penales", key: "constancia" as const, mandatory: true, mockStatus: "Missing" },
                  { title: "Fotos Tamaño Carnet a color en alta resolución", key: "fotoFile" as const, mandatory: true, mockStatus: "Validado" }
                ].map((doc, idx) => {
                  const isMissing = doc.mockStatus === "Missing";
                  const isPending = doc.mockStatus === "Pendiente";
                  const isValidated = doc.mockStatus === "Validado";
                  const isObserved = doc.mockStatus === "Observado";

                  return (
                    <div key={idx} className="p-4 border border-slate-100 bg-slate-50/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{doc.title}</span>
                          {doc.mandatory && <span className="text-[8px] bg-red-100 text-[#800521] font-black px-1.5 py-0.5 rounded leading-none">Obligatorio</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Requisito digital escaneado a color en formato PDF o JPG continuo.</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto text-right">
                        <div>
                          {isValidated && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Validado
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5" /> Pendiente
                            </span>
                          )}
                          {isObserved && (
                            <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Observado
                            </span>
                          )}
                          {isMissing && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded font-extrabold uppercase">
                              Por Devolver / Subir
                            </span>
                          )}
                        </div>

                        {!isValidated && (
                          <button 
                            onClick={() => {
                              const name = prompt("Escriba el nombre del archivo requisitorial que desea subir para validación:", `requisito_${doc.key || "doc"}_${personalData.dni}.pdf`);
                              if (name && doc.key !== "constancia") {
                                simulateDocUpload(doc.key, name);
                              } else if (name) {
                                alert("¡Documento subido! Se guardó como plantilla pendiente de revisión técnica de secretaría.");
                              }
                            }}
                            className="bg-[#800521] hover:bg-[#9F062A] text-white text-[10px] uppercase font-bold py-1 px-3.5 rounded transition-all inline-flex items-center gap-1 cursor-pointer select-none"
                          >
                            <Upload className="w-3 L-3 text-amber-300" /> Subir archivo
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                        <td className="py-3 font-mono text-[11px] text-[#800521]">OP-9921</td>
                        <td className="py-3">Matrícula Semestral 2026-I</td>
                        <td className="py-3 font-bold">S/. 250.00</td>
                        <td className="py-3 text-slate-400">01/03/2026</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200">Aprobado</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 font-mono text-[11px] text-[#800521]">OP-9832</td>
                        <td className="py-3">Derecho de Examen Ordinario de Admisión</td>
                        <td className="py-3 font-bold">S/. 120.00</td>
                        <td className="py-3 text-slate-400">12/02/2026</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200">Aprobado</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {profileInnerTab === "academic" && (
              <div className="space-y-4">
                <span className="text-[10px] text-[#800521] font-bold uppercase tracking-wider block">Malla de Avance del Estudiante</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">PPA Promedio</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">16.8</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Ciclos Completos</span>
                    <span className="text-xl font-black text-[#800521] block mt-1">4 / 6</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Créditos Aprobados</span>
                    <span className="text-xl font-black text-slate-800 block mt-1">120 CTR</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Plan Académico</span>
                    <span className="text-lg font-black text-slate-700 block mt-1">NIIF / 2024</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available billing methods footer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3 text-center">MÉTODOS DE PAGO DISPONIBLES</span>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-700 block">Tarjeta de Crédito</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Visa, Mastercard</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-700 block">Agentes y Banca</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">BCP, BBVA, Interbank</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-700 block">Yape / Plin</span>
                <span className="text-[8px] text-slate-400 block mt-0.5">Escaneado inmediato</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
