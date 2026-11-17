import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  XCircle,
  Compass,
  ZoomIn,
  Download,
  ExternalLink,
  User,
  GraduationCap,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Applicant, AdmissionPeriod } from "../../../types";
import { fetchApplicantByDni } from "../../../services/api";

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
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
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
  notify,
}) => {
  const [freshApp, setFreshApp] = useState<Applicant | null>(null);
  const [lightboxDoc, setLightboxDoc] = useState<{
    url: string;
    title: string;
    fileName?: string;
  } | null>(null);

  const baseApp = selectedDossierAppDni
    ? applicants.find((a) => a.dni === selectedDossierAppDni)
    : undefined;

  useEffect(() => {
    if (!selectedDossierAppDni) {
      setFreshApp(null);
      return;
    }
    const currentBase = applicants.find((a) => a.dni === selectedDossierAppDni);
    const docKeys = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;
    const needsBinaryHydration =
      !currentBase ||
      docKeys.some((k) => {
        const d = (currentBase.docs as any)?.[k];
        return d && d.status && d.status !== "No Enviado" && !d.fileDataUrl;
      });

    if (!needsBinaryHydration) {
      return;
    }

    let cancelled = false;
    fetchApplicantByDni(selectedDossierAppDni)
      .then((apiApp) => {
        if (!cancelled && apiApp) {
          setFreshApp(apiApp);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedDossierAppDni]);

  if (!selectedDossierAppDni) return null;

  const app = baseApp
    ? ({
        ...(freshApp && freshApp.dni === selectedDossierAppDni ? freshApp : {}),
        ...baseApp,
      } as Applicant)
    : freshApp && freshApp.dni === selectedDossierAppDni
    ? freshApp
    : undefined;
  if (!app) return null;

  const effectivePaymentStatus = app.paymentStatus || "No Pagado";

  const buildDocEntry = (key: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile") => {
    const baseRaw = (baseApp?.docs as any)?.[key] || {};
    const freshRaw =
      freshApp && freshApp.dni === selectedDossierAppDni
        ? (freshApp.docs as any)?.[key] || {}
        : {};
    const storedUrl =
      typeof window !== "undefined" ? localStorage.getItem(`sfa_file_data_${app.dni}_${key}`) : null;
    const fileDataUrl = baseRaw.fileDataUrl || freshRaw.fileDataUrl || storedUrl || undefined;
    if (!fileDataUrl) {
      return {
        status: "No Enviado" as const,
        fileName: undefined,
        fileDataUrl: undefined,
        observations: baseRaw.observations ?? freshRaw.observations,
      };
    }
    const mergedStatus = baseRaw.status || freshRaw.status;
    return {
      ...freshRaw,
      ...baseRaw,
      status: mergedStatus && mergedStatus !== "No Enviado" ? mergedStatus : ("Pendiente" as const),
      fileName: baseRaw.fileName || freshRaw.fileName || `${key}.jpg`,
      observations:
        baseRaw.status === "Observado"
          ? baseRaw.observations ?? freshRaw.observations
          : undefined,
      fileDataUrl,
    };
  };

  const appDocs: Record<"dniFile" | "certificadoFile" | "partidaFile" | "fotoFile", any> = {
    dniFile: buildDocEntry("dniFile"),
    certificadoFile: buildDocEntry("certificadoFile"),
    partidaFile: buildDocEntry("partidaFile"),
    fotoFile: buildDocEntry("fotoFile"),
  };

  const isAllValid = 
    appDocs.dniFile?.status === "Validado" && 
    appDocs.certificadoFile?.status === "Validado" && 
    appDocs.fotoFile?.status === "Validado";

  const effectiveFolderStatus = (app.folderStatus === "Enrolled")
    ? "Enrolled"
    : (app.folderStatus === "Approved" || isAllValid)
    ? "Approved"
    : (app.folderStatus || "Pending");

  const docsConfig = [
    { label: "Copia de DNI", key: "dniFile" as const, required: true },
    { label: "Certificado de Secundaria", key: "certificadoFile" as const, required: true },
    { label: "Partida de Nacimiento", key: "partidaFile" as const, required: false },
    { label: "Fotografía Carnet", key: "fotoFile" as const, required: true },
  ];

  const validatedCount = docsConfig.filter((d) => appDocs[d.key]?.status === "Validado").length;
  const programName = app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad";

  return (
    <>
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
                    Auditoría de Admisión
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
                    DNI: {app.dni}
                  </span>
                  <span className="bg-[#9F062A]/20 text-rose-300 text-[9px] font-bold px-2 py-0.5 rounded border border-[#9F062A]/30 uppercase">
                    {programName}
                  </span>
                </div>
                <h2 className="text-base font-black uppercase text-white mt-1 tracking-wide">
                  Dossier Digital: {app.name} {app.lastName}
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
                    {validatedCount} de 4 Aprobados
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {docsConfig.map((item) => {
                    const docState = appDocs[item.key] || { status: "No Enviado" as const };
                    const isUploaded = Boolean(docState.fileDataUrl);
                    const obsInputKey = `${app.dni}_${item.key}`;
                    const currentObsText = individualDocObs[obsInputKey] || "";
                    const isPdf =
                      docState.fileDataUrl?.startsWith("data:application/pdf") ||
                      (docState.fileName && docState.fileName.toLowerCase().endsWith(".pdf"));

                    return (
                      <div
                        key={item.key}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col gap-3.5 hover:border-slate-300 transition-all"
                      >
                        {/* Document Header */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-xs uppercase text-slate-900 tracking-tight flex items-center gap-2">
                              <span>{item.label}</span>
                              {item.required ? (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded uppercase">
                                  Obligatorio
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded uppercase">
                                  Opcional
                                </span>
                              )}
                            </h4>
                            <span className="text-[10.5px] text-slate-500 font-medium block">
                              {isUploaded ? (
                                <span className="font-mono text-slate-700 font-semibold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Archivo: {docState.fileName || `${item.key}.png`}
                                </span>
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

                        {/* Visual Image Preview Frame */}
                        {isUploaded ? (
                          <div className="space-y-2">
                            <div className="relative group bg-slate-900/5 border border-slate-200/90 rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[170px] max-h-[240px] p-2 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                              {isPdf ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
                                  <FileText className="w-12 h-12 text-[#9F062A]" />
                                  <span className="text-xs font-black text-slate-800 uppercase">Documento PDF Adjunto</span>
                                  <span className="text-[11px] text-slate-500 font-mono">{docState.fileName || "documento.pdf"}</span>
                                  <button
                                    type="button"
                                    onClick={() => setLightboxDoc({ url: docState.fileDataUrl, title: item.label, fileName: docState.fileName })}
                                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-[#9F062A] text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Visualizar PDF</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={docState.fileDataUrl}
                                    alt={item.label}
                                    onClick={() => setLightboxDoc({ url: docState.fileDataUrl, title: item.label, fileName: docState.fileName })}
                                    className="max-h-[210px] max-w-full w-auto object-contain rounded-lg shadow-xs transition-transform duration-300 group-hover:scale-[1.01] cursor-pointer"
                                  />
                                  {/* Hover overlay with quick actions */}
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 pointer-events-none">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxDoc({ url: docState.fileDataUrl, title: item.label, fileName: docState.fileName });
                                      }}
                                      className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-900 rounded-lg text-xs font-extrabold uppercase shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                    >
                                      <ZoomIn className="w-3.5 h-3.5 text-[#9F062A]" />
                                      <span>Ampliar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const storedDataUrl = typeof window !== "undefined"
                                          ? localStorage.getItem(`sfa_file_data_${app.dni}_${item.key}`)
                                          : null;
                                        let effectiveUrl = docState.fileDataUrl || storedDataUrl || null;
                                        if (!effectiveUrl) {
                                          const reloaded = await fetchApplicantByDni(app.dni);
                                          if (reloaded) {
                                            setFreshApp(reloaded);
                                            effectiveUrl = (reloaded.docs as any)?.[item.key]?.fileDataUrl || null;
                                          }
                                        }
                                        triggerAdminPreview(
                                          item.label + " - " + `${app.name} ${app.lastName}`.trim().toUpperCase(),
                                          docState.fileName || `${item.key}.jpg`,
                                          "image",
                                          {
                                            dni: app.dni,
                                            studentName: app.name,
                                            studentLastName: app.lastName,
                                            fullName: `${app.name} ${app.lastName}`.trim(),
                                            programName,
                                            docLabel: item.label,
                                            docKey: item.key,
                                            fileName: docState.fileName,
                                            fileDataUrl: effectiveUrl,
                                            docStatus: docState.status,
                                            date: new Date().toISOString().split("T")[0],
                                            isVoucher: false,
                                          }
                                        );
                                      }}
                                      className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-lg text-xs font-extrabold uppercase shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                                      <span>Auditoría Formal</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Information footer of image frame */}
                            <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Adjunto recibido y legible
                              </span>
                              <button
                                type="button"
                                onClick={() => setLightboxDoc({ url: docState.fileDataUrl, title: item.label, fileName: docState.fileName })}
                                className="text-[10.5px] font-extrabold text-[#9F062A] hover:underline uppercase tracking-wide inline-flex items-center gap-1 cursor-pointer"
                              >
                                <ZoomIn className="w-3 h-3" />
                                <span>Clic para ampliar</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-200 bg-slate-50/60 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5">
                            <FileText className="w-7 h-7 text-slate-300" />
                            <span className="text-xs font-bold text-slate-500">Documento no adjuntado</span>
                            <span className="text-[11px] text-slate-400">El postulante aún no ha subido este requisito a su carpeta</span>
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
                                  notify?.("Por favor ingrese el motivo de observación para este requisito.", "warning");
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
                              className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-3xs flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprobar / Validar</span>
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
                  {/* Candidate Identity Card */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#9F062A] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {app.name.charAt(0)}{app.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black uppercase text-slate-900 truncate">
                        {app.name} {app.lastName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold truncate">
                        {programName}
                      </p>
                    </div>
                  </div>

                  {/* Requirements Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-slate-600 uppercase tracking-wider">
                        Avance de Auditoría:
                      </span>
                      <span className="font-extrabold text-[#9F062A] font-mono">
                        {validatedCount} de 4 ({Math.round((validatedCount / 4) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(validatedCount / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Read-only Admission fee payment status */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase text-slate-500 font-extrabold block tracking-wider">
                      Estado del Pago (Tasa S/. 120):
                    </span>
                    <div className="pt-0.5">
                      {effectivePaymentStatus === "Validado" ? (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pago Validado
                        </span>
                      ) : effectivePaymentStatus === "Observado" ? (
                        <span className="text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Pago Observado
                        </span>
                      ) : effectivePaymentStatus === "Rechazado" ? (
                        <span className="text-xs font-black text-rose-800 bg-rose-100/80 border border-rose-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Pago Rechazado
                        </span>
                      ) : effectivePaymentStatus === "Pendiente" ? (
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
                      <span className="truncate">
                        {sanitizePeriodName(
                          admissionPeriods.find((p) => p.id === app.periodId)?.name || "Convocatoria no registrada"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase text-slate-500 font-extrabold block tracking-wider">
                      Estado de Carpeta Registrado:
                    </span>
                    <div className="pt-0.5">
                      {effectiveFolderStatus === "Enrolled" ? (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada (Matriculado)
                        </span>
                      ) : effectiveFolderStatus === "Approved" ? (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobada
                        </span>
                      ) : effectiveFolderStatus === "Observed" ? (
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
                                notify?.("Por favor ingrese una observación antes de marcar la carpeta como observada.", "warning");
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

      {/* High-Resolution Direct Lightbox Overlay */}
      {lightboxDoc && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxDoc(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-red-400" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wide">{lightboxDoc.title}</h4>
                  {lightboxDoc.fileName && (
                    <span className="text-[10px] text-slate-400 font-mono">{lightboxDoc.fileName}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxDoc.url}
                  download={lightboxDoc.fileName || "documento.png"}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
                <button
                  onClick={() => setLightboxDoc(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-900/60 overflow-auto flex items-center justify-center min-h-[300px]">
              {lightboxDoc.url.startsWith("data:application/pdf") ? (
                <iframe src={lightboxDoc.url} title={lightboxDoc.title} className="w-full h-[70vh] rounded-lg border-0" />
              ) : (
                <img
                  src={lightboxDoc.url}
                  alt={lightboxDoc.title}
                  className="max-h-[78vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
