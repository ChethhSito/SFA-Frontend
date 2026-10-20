import React, { useState } from "react";
import { 
  FileText, ArrowRight, Info, Upload, Eye, CheckCircle2, 
  AlertCircle, Award, FileCheck, Camera, CreditCard, RefreshCw 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import AlertBox from "../../ui/AlertBox";
import { Applicant } from "../../../types";

interface DocumentosTabProps {
  applicant: Applicant;
  approvedCount: number;
  totalDocs: number;
  globalProgressPercentage: number;
  openDocs: Record<string, boolean>;
  toggleDoc: (docKey: string) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"
  ) => void;
  triggerPreview: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
  setActiveTab: (tab: "dashboard" | "documentos" | "pagos" | "resultados" | "soporte" | "matricula") => void;
}

export const DocumentosTab: React.FC<DocumentosTabProps> = React.memo(({
  applicant,
  approvedCount,
  totalDocs,
  globalProgressPercentage,
  handleFileChange,
  triggerPreview,
}) => {
  // Helper to get doc with persistent localStorage cache fallback
  const getDoc = (key: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile") => {
    const doc = applicant.docs?.[key] || { status: "No Enviado" as const };
    const cachedUrl = doc.fileDataUrl || (applicant.dni ? localStorage.getItem(`sfa_file_data_${applicant.dni}_${key}`) : null) || undefined;
    return {
      ...doc,
      fileDataUrl: cachedUrl
    };
  };

  const currentDocs = {
    dniFile: getDoc("dniFile"),
    certificadoFile: getDoc("certificadoFile"),
    partidaFile: getDoc("partidaFile"),
    fotoFile: getDoc("fotoFile")
  };

  const [notice, setNotice] = useState<{ message: string; variant: "danger" | "warning" | "success" | "info" } | null>(null);

  // Configuration for the 4 Expediente Requirements (2x2 Grid)
  const docConfigs: Array<{
    key: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile";
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    inputId: string;
    fullTitle: string;
    fallbackName: string;
  }> = [
    {
      key: "dniFile",
      title: "Copia Legible de DNI",
      subtitle: "Anverso y reverso en una sola cara (Formato Imagen)",
      icon: <CreditCard className="w-5 h-5 text-[#8B0020]" />,
      inputId: "file-input-dni",
      fullTitle: `Copia de DNI - ${applicant.name.toUpperCase()} ${applicant.lastName.toUpperCase()}`,
      fallbackName: "dni_captura.jpg"
    },
    {
      key: "certificadoFile",
      title: "Certificado de Secundaria",
      subtitle: "Constancia de logros o certificado de estudios visado",
      icon: <Award className="w-5 h-5 text-[#8B0020]" />,
      inputId: "file-input-certificado",
      fullTitle: `Certificado de Secundaria - ${applicant.name.toUpperCase()} ${applicant.lastName.toUpperCase()}`,
      fallbackName: "certificado_estudios.jpg"
    },
    {
      key: "partidaFile",
      title: "Partida de Nacimiento",
      subtitle: "Copia legible expedida por RENIEC o municipalidad",
      icon: <FileCheck className="w-5 h-5 text-[#8B0020]" />,
      inputId: "file-input-partida",
      fullTitle: `Partida de Nacimiento - ${applicant.name.toUpperCase()} ${applicant.lastName.toUpperCase()}`,
      fallbackName: "partida_nacimiento.jpg"
    },
    {
      key: "fotoFile",
      title: "Fotografía Tamaño Carné",
      subtitle: "Fondo blanco liso, rostro despejado y vestimenta formal",
      icon: <Camera className="w-5 h-5 text-[#8B0020]" />,
      inputId: "file-input-foto",
      fullTitle: `Fotografía Personal - ${applicant.name.toUpperCase()} ${applicant.lastName.toUpperCase()}`,
      fallbackName: "foto_estudio.jpg"
    }
  ];

  return (
    <PageTransition id="documentos" className="space-y-6">
      {/* Breadcrumb path */}
      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-left">
        Admisión 2026 &gt; <span className="text-slate-600">Expediente de Admisión</span>
      </div>

      {notice && (
        <AlertBox 
          variant={notice.variant} 
          title="Notificación de Expediente" 
          message={notice.message} 
          actions={
            <button 
              type="button" 
              onClick={() => setNotice(null)} 
              className="text-xs font-bold underline cursor-pointer"
            >
              Cerrar
            </button>
          }
        />
      )}

      {/* Header section with Ver Tutorial button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-left">Expediente de Admisión</h2>
          <p className="text-xs text-slate-500 font-bold leading-none mt-1">Gestione y cargue los documentos requeridos en su cuadrícula oficial de admisión.</p>
        </div>

        <button 
          onClick={() => setNotice({
            message: "Tutorial: Asegúrese de digitalizar sus documentos oficiales (DNI, Certificados) en orientación vertical con bordes legibles y sin reflejos.",
            variant: "info"
          })}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-extrabold uppercase text-[10px] py-2 px-4 shadow-sm rounded-sm tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Ver Tutorial</span>
        </button>
      </div>

      {/* TOP ROW: 2 Cards side by side (Progreso del Expediente + Instrucciones Importantes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Card 1: Progreso del Expediente */}
        <div className="bg-[#8B0020] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between border-l-4 border-amber-400 text-left relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider block leading-none">Progreso del Expediente</h3>
              <span className="text-[10px] font-extrabold bg-white/10 text-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/20">
                {approvedCount} de {totalDocs} Aprobados
              </span>
            </div>

            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest block">ESTADO GLOBAL</span>
              <span className="text-3xl font-black text-amber-300 font-mono leading-none">{globalProgressPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900/50 h-2.5 rounded-full overflow-hidden mt-3 mb-4 p-0.5 border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${globalProgressPercentage}%` }}
              />
            </div>

            <p className="text-slate-100 font-medium text-[11px] leading-relaxed mb-6">
              Ha completado <strong className="text-white font-extrabold">{approvedCount} de {totalDocs}</strong> documentos requeridos. Debe subsanar las observaciones para continuar con el proceso de asignación de vacante y matrícula de estudiante.
            </p>
          </div>

          <button 
            onClick={() => {
              if (globalProgressPercentage < 100) {
                setNotice({
                  message: "No se han completado los 4 requisitos necesarios. Asegúrese de cargar sus archivos y que todos estén bajo estado 'Validado' (Aprobado) por secretaría para formalizar.",
                  variant: "warning"
                });
              } else {
                setNotice({
                  message: "¡Expediente enviado a revisión final! El comité académico de admisiones confirmará su plaza de estudios hoy mismo.",
                  variant: "success"
                });
              }
            }}
            className="w-full bg-white hover:bg-amber-50 text-[#8B0020] font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-2 group"
          >
            <span>Enviar a Revisión Final</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Instrucciones Importantes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">Instrucciones Importantes</h3>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">01</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Todos los documentos deben estar en formato de imagen (JPG, JPEG o PNG).</p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">02</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">Asegúrese de que la captura o escaneo fotográfico sea nítida, legible y con buena iluminación.</p>
              </div>

              <div className="flex gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/90 hover:bg-slate-50 transition-colors">
                <span className="font-black text-[#8B0020] text-xs font-mono shrink-0 select-none bg-white w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 shadow-2xs">03</span>
                <p className="text-slate-700 font-bold leading-relaxed text-[11px]">El peso máximo por cada imagen cargada debe ser menor a 5MB.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: 2 FILAS Y 2 COLUMNAS (CUADRÍCULA 2x2) CON VISTA PREVIA DIRECTA DE LA IMAGEN */}
      <div className="pt-2 text-left space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8B0020]" />
              Requisitos del Expediente ({approvedCount} de {totalDocs} Válidos)
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Organización en 2 filas y 2 columnas con previsualización fotográfica interactiva.
            </p>
          </div>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Expediente Digital 2026
          </span>
        </div>

        {/* 2x2 GRID (2 filas y 2 columnas en desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {docConfigs.map((cfg) => {
            const doc = currentDocs[cfg.key];
            const hasImage = Boolean(doc.fileDataUrl);
            const isApproved = doc.status === "Validado";
            const isPending = doc.status === "Pendiente";
            const isObserved = doc.status === "Observado";
            const isNotSent = !isApproved && !isPending && !isObserved;

            return (
              <div 
                key={cfg.key} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between text-left group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#8B0020]/10 flex items-center justify-center shrink-0">
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                          {cfg.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
                          {cfg.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      isApproved
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : isPending
                          ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                          : isObserved
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  {/* Card Body: Vista Previa de la Imagen */}
                  <div className="mt-4">
                    {(isApproved || isPending) && (
                      <div className="space-y-3">
                        {/* Image Preview Box */}
                        <div className="relative group/img rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200 h-44 flex items-center justify-center">
                          {hasImage ? (
                            <>
                              <img 
                                src={doc.fileDataUrl} 
                                alt={cfg.title} 
                                className="max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => triggerPreview(cfg.fullTitle, doc.fileName || cfg.fallbackName, "image", { fileDataUrl: doc.fileDataUrl, docKey: cfg.key })}
                                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#8B0020]" />
                                  <span>Ampliar Imagen</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center space-y-1">
                              <FileCheck className="w-10 h-10 text-[#8B0020] mb-1" />
                              <span className="font-mono text-xs font-bold text-slate-800 truncate max-w-[220px]" title={doc.fileName || cfg.fallbackName}>
                                {doc.fileName || cfg.fallbackName}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Archivo Oficial Registrado
                              </span>
                              <p className="text-[9px] text-slate-400 font-medium">Haga clic en 'Ver Imagen' para inspección digital.</p>
                            </div>
                          )}
                        </div>

                        {/* File info banner */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono flex justify-between items-center text-slate-600">
                          <span className="truncate max-w-[200px]" title={doc.fileName || cfg.fallbackName}>
                            Archivo: {doc.fileName || cfg.fallbackName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans font-bold">
                            {isPending ? "Revisión Pendiente" : "Validado"}
                          </span>
                        </div>
                      </div>
                    )}

                    {isObserved && (
                      <div className="space-y-3">
                        <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-slate-700 text-xs">
                          <div className="flex items-center gap-1.5 text-red-800 font-black uppercase text-[10px] tracking-wide mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Observación de Secretaría</span>
                          </div>
                          <p className="font-medium text-slate-600 bg-white border border-red-100 p-2.5 rounded-lg text-[11px] leading-relaxed">
                            {doc.observations || "El documento cargado no presenta la legibilidad requerida o presenta reflejos. Por favor vuelva a digitalizarlo."}
                          </p>
                        </div>
                      </div>
                    )}

                    {isNotSent && (
                      <div>
                        <label 
                          htmlFor={cfg.inputId} 
                          className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/50 rounded-xl p-5 bg-slate-50/50 hover:bg-slate-50 h-44 flex flex-col items-center justify-center text-center cursor-pointer group/upload transition-all"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#8B0020]/5 group-hover/upload:bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center mb-2 transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover/upload:text-[#8B0020] transition-colors block">
                            Seleccionar Imagen JPG o PNG
                          </span>
                          <span className="text-[10px] text-[#8B0020] font-bold block mt-0.5">
                            Haga clic para elegir captura
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-1">Formatos: JPG, PNG • Máx 5MB</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input 
                    id={cfg.inputId}
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, cfg.key)} 
                  />

                  {(isApproved || isPending) && (
                    <>
                      <button 
                        type="button"
                        onClick={() => triggerPreview(cfg.fullTitle, doc.fileName || cfg.fallbackName, "image", { fileDataUrl: doc.fileDataUrl, docKey: cfg.key })}
                        className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8B0020]" />
                        <span>Ver Imagen</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById(cfg.inputId)?.click()}
                        className="flex-1 py-2 px-3 bg-[#8B0020] hover:bg-[#6e0019] text-white text-[10px] font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                    </>
                  )}

                  {isObserved && (
                    <button 
                      type="button"
                      onClick={() => document.getElementById(cfg.inputId)?.click()}
                      className="w-full py-2.5 px-3 bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subsanar y Cargar Nueva Imagen</span>
                    </button>
                  )}

                  {isNotSent && (
                    <button 
                      type="button"
                      onClick={() => document.getElementById(cfg.inputId)?.click()}
                      className="w-full py-2.5 px-3 bg-[#8B0020] hover:bg-[#6e0019] text-white text-[10px] font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cargar Documento</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
});

DocumentosTab.displayName = "DocumentosTab";
export default DocumentosTab;
