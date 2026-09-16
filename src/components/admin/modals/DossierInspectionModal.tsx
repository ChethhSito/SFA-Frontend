import React from "react";
import { FileSpreadsheet, X, FileText, CheckCircle2, AlertTriangle, Clock, Eye, XCircle, Compass } from "lucide-react";
import { Applicant, AdmissionPeriod } from "../../../types";

interface DossierInspectionModalProps {
  selectedDossierAppDni: string | null;
  applicants: Applicant[];
  admissionPeriods: AdmissionPeriod[];
  individualDocObs: { [key: string]: string };
  setIndividualDocObs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  folderObservationInput: { [key: string]: string };
  setFolderObservationInput: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onClose: () => void;
  triggerAdminPreview: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
  handleValidateApplicantDocument: (
    applicantDni: string,
    docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile",
    status: "Validado" | "Observado" | "Pendiente",
    observations?: string
  ) => void;
  handleUpdateFolderStatus: (applicantDni: string, status: "Pending" | "Observed" | "Approved" | "Enrolled") => void;
  sanitizePeriodName: (name?: string) => string;
}

export const DossierInspectionModal: React.FC<DossierInspectionModalProps> = ({
  selectedDossierAppDni,
  applicants,
  admissionPeriods,
  individualDocObs,
  setIndividualDocObs,
  folderObservationInput,
  setFolderObservationInput,
  onClose,
  triggerAdminPreview,
  handleValidateApplicantDocument,
  handleUpdateFolderStatus,
  sanitizePeriodName,
}) => {
  if (!selectedDossierAppDni) return null;

  const app = applicants.find((a) => a.dni === selectedDossierAppDni);
  if (!app) return null;

  const appDocs = app.docs || {
    dniFile: { status: "No Enviado" as const },
    certificadoFile: { status: "No Enviado" as const },
    partidaFile: { status: "No Enviado" as const },
    fotoFile: { status: "No Enviado" as const },
  };

  const docsConfig = [
    { label: "Copia de DNI", key: "dniFile" as const },
    { label: "Certificado de Secundaria", key: "certificadoFile" as const },
    { label: "Partida de Nacimiento", key: "partidaFile" as const },
    { label: "Fotografía Carnet", key: "fotoFile" as const },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in text-left">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh] animate-scale-up">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9F062A]/20 border border-[#9F062A]/40 flex items-center justify-center text-[#9F062A]">
              <FileSpreadsheet className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#9F062A] text-[9.5px] uppercase tracking-widest leading-none">
                  Carpeta de Admisión
                </span>
                <span className="bg-slate-800 text-slate-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
                  DNI: {app.dni}
                </span>
              </div>
              <h2 className="text-base font-black uppercase text-white mt-1 tracking-wide">
                Dossier de Prepostulante: {app.name} {app.lastName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-rose-950/80 hover:text-red-300 text-slate-300 rounded-xl px-3.5 py-2 text-xs font-black uppercase border border-slate-700 cursor-pointer transition-all flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cerrar</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left panel: the 4 documents */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9F062A]" /> Requisitos de Admisión Registrados
                </h3>
                <span className="text-xs font-extrabold text-[#9F062A] bg-red-50 border border-red-200 px-3 py-1 rounded-full font-mono">
                  {docsConfig.filter((d) => appDocs[d.key]?.status === "Validado").length} de 4 Aprobados
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {docsConfig.map((item) => {
                  const docState = appDocs[item.key] || { status: "No Enviado" as const };
                  const isUploaded = !!docState.fileDataUrl;
                  const obsInputKey = `${app.dni}_${item.key}`;
                  const currentObsText = individualDocObs[obsInputKey] || "";

                  return (
                    <div
                      key={item.key}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col gap-3.5 hover:border-slate-300 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-xs uppercase text-slate-900 tracking-tight flex items-center gap-2">
                            <span>{item.label}</span>
                          </h4>
                          <span className="text-[10.5px] text-slate-500 font-medium block">
                            {isUploaded ? (
                              <span className="font-mono text-slate-700 font-semibold">Archivo: {docState.fileName}</span>
                            ) : (
                              <span className="text-slate-400 italic">Sin archivo recibido del postulante</span>
                            )}
                          </span>
                        </div>
                        <div>
                          {docState.status === "Validado" ? (
                            <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                            </span>
                          ) : docState.status === "Observado" ? (
                            <span className="text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Observado
                            </span>
                          ) : docState.status === "Pendiente" ? (
                            <span className="text-xs font-black text-amber-800 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Por revisar
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              Sin enviar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Verification view or notice */}
                      {isUploaded ? (
                        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-center justify-between">
                          <span className="text-[10.5px] text-emerald-800 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Adjunto cargado y listo para auditoría
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              triggerAdminPreview(
                                item.label + " - " + app.name.toUpperCase(),
                                docState.fileName,
                                "image",
                                {
                                  dni: app.dni,
                                  studentName: app.name,
                                  studentLastName: app.lastName,
                                  fileDataUrl: docState.fileDataUrl,
                                }
                              )
                            }
                            className="inline-flex items-center gap-1.5 uppercase font-extrabold text-[10px] tracking-wider bg-slate-900 hover:bg-[#9F062A] text-white px-3 py-1.5 rounded-lg border border-transparent shadow-3xs transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Documento</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-50/70 border border-slate-200/50 rounded-xl p-3 text-center">
                          <p className="text-[10.5px] text-slate-400 italic font-medium">
                            No existe vista preview. El postulante aún no ha subido el archivo.
                          </p>
                        </div>
                      )}

                      {/* Current observations message */}
                      {docState.status === "Observado" && docState.observations && (
                        <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-semibold italic leading-snug">
                          <span className="text-[#9F062A] font-black uppercase tracking-wider block text-[9.5px] not-italic mb-0.5">
                            Observación Registrada
                          </span>
                          "{docState.observations}"
                        </div>
                      )}

                      {/* Actions frame */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Detalle de observación de este documento específico..."
                            value={currentObsText}
                            onChange={(e) =>
                              setIndividualDocObs({
                                ...individualDocObs,
                                [obsInputKey]: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-medium shadow-3xs"
                          />
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleValidateApplicantDocument(app.dni, item.key, "Pendiente", "");
                              setIndividualDocObs({ ...individualDocObs, [obsInputKey]: "" });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                          >
                            Pendiente
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!currentObsText.trim()) {
                                alert("Por favor ingrese el motivo de observación para este requisito.");
                                return;
                              }
                              handleValidateApplicantDocument(app.dni, item.key, "Observado", currentObsText.trim());
                            }}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shadow-3xs"
                          >
                            Observar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleValidateApplicantDocument(app.dni, item.key, "Validado", "");
                              setIndividualDocObs({ ...individualDocObs, [obsInputKey]: "" });
                            }}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-3xs"
                          >
                            Aprobar / Validar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right panel: Overall Folder Status & Decisions */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#9F062A]" /> Estado del Expediente
              </h3>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4">
                {/* Read-only Admission fee payment status */}
                <div className="space-y-1.5 block">
                  <span className="text-[10px] uppercase text-slate-500 font-extrabold block tracking-wider">
                    Estado del Pago (Tasa S/. 120):
                  </span>
                  <div className="pt-0.5">
                    {app.paymentStatus === "Validado" ? (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pago Validado
                      </span>
                    ) : app.paymentStatus === "Observado" ? (
                      <span className="text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Pago Observado
                      </span>
                    ) : app.paymentStatus === "Rechazado" ? (
                      <span className="text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Pago Rechazado
                      </span>
                    ) : app.paymentStatus === "Pendiente" ? (
                      <span className="text-xs font-black text-amber-800 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> En Evaluación
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Sin enviar
                      </span>
                    )}
                    <p className="text-[9.5px] text-slate-400 mt-1.5 italic font-medium leading-relaxed">
                      * Solo lectura. La validación de tasas se gestiona exclusivamente por la división de Caja & Tesorería.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    Período de Admisión Asociado:
                  </label>
                  <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 font-sans flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9F062A]"></span>
                    <span>
                      {sanitizePeriodName(
                        admissionPeriods.find((p) => p.id === (app.periodId || "1"))?.name || "Periodo Regular 2026-I"
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] uppercase text-slate-500 font-extrabold block tracking-wider">
                    Estado de Carpeta Registrado:
                  </span>
                  <div className="pt-0.5">
                    {app.folderStatus === "Enrolled" ? (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada (Matriculado)
                      </span>
                    ) : app.folderStatus === "Approved" ? (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada
                      </span>
                    ) : app.folderStatus === "Observed" ? (
                      <span className="text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Observada
                      </span>
                    ) : (
                      <span className="text-xs font-black text-amber-800 bg-amber-100/80 border border-amber-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>

                {app.folderObservations && app.folderStatus === "Observed" && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 italic leading-snug">
                    <span className="text-[#9F062A] font-black uppercase tracking-wider block text-[9.5px] not-italic mb-1">
                      Observación de Carpeta
                    </span>
                    "{app.folderObservations}"
                  </div>
                )}

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    Observación Global:
                  </label>
                  <textarea
                    placeholder="Ingrese observaciones de carpeta generales (Requerido solo si va a marcar la carpeta como OBSERVADO)."
                    rows={3}
                    value={folderObservationInput[app.dni] || ""}
                    onChange={(e) =>
                      setFolderObservationInput({
                        ...folderObservationInput,
                        [app.dni]: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white shadow-3xs"
                  />
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    Control de Carpeta (Carpeta Completa):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Pending" as const, label: "Pendiente" },
                      { id: "Observed" as const, label: "Observado" },
                      { id: "Approved" as const, label: "Aprobada" },
                    ].map((opt) => {
                      const isSelected = app.folderStatus === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (opt.id === "Observed" && !(folderObservationInput[app.dni] || "").trim()) {
                              alert("Por favor ingrese una observacion antes de marcar la carpeta como observada.");
                              return;
                            }
                            handleUpdateFolderStatus(app.dni, opt.id);
                          }}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center text-center shadow-3xs ${
                            isSelected
                              ? opt.id === "Approved"
                                ? "bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-sm"
                                : opt.id === "Observed"
                                ? "bg-rose-700 text-white border-rose-800 font-extrabold shadow-sm"
                                : "bg-amber-600 text-white border-amber-700 font-extrabold shadow-sm"
                              : opt.id === "Observed"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                              : opt.id === "Approved"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
