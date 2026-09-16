import React from "react";
import { 
  FileText, ArrowRight, Info, ChevronUp, ChevronDown, Upload, Headset, MessageSquare 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
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
  openDocs,
  toggleDoc,
  handleFileChange,
  triggerPreview,
  setActiveTab,
}) => {
  const currentDocs = {
    dniFile: applicant.docs?.dniFile || { status: "No Enviado" as const },
    certificadoFile: applicant.docs?.certificadoFile || { status: "No Enviado" as const },
    partidaFile: applicant.docs?.partidaFile || { status: "No Enviado" as const },
    fotoFile: applicant.docs?.fotoFile || { status: "No Enviado" as const }
  };

  return (
    <PageTransition id="documentos" className="space-y-6">
      {/* Breadcrumb path */}
      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-left">
        Admisión 2026 &gt; <span className="text-slate-600">Expediente de Admisión</span>
      </div>

      {/* Header section with Ver Tutorial button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-left">Expediente de Admisión</h2>
          <p className="text-xs text-slate-500 font-bold leading-none mt-1">Gestione y cargue los documentos necesarios para completar su proceso de inscripción.</p>
        </div>

        <button 
          onClick={() => alert("Simulación de Video Tutorial: 'Cómo escanear y subir correctamente los requisitos de matrícula en formato PDF de baja compresión y alta fidelidad.'")}
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
            
            <div className="flex justify-between items-baseline mt-4">
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
                alert(`No se han completado los 4 requisitos necesarios. Asegúrese de cargar sus archivos y que todos estén bajo estado 'Validado' (Aprobado) por secretaría para formalizar.`);
              } else {
                alert(`¡Expediente enviado a revisión final! El comité académico de admisiones confirmará su plaza de estudios hoy mismo.`);
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

      {/* MIDDLE SECTION: Documentos Requeridos en formato Desplegable (Accordion) */}
      <div className="space-y-4 pt-2 text-left">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8B0020]" />
            Requisitos del Expediente ({approvedCount} de {totalDocs} Válidos)
          </h3>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider hidden sm:inline">Haga clic en un documento para desplegar las opciones</span>
        </div>

        {/* Document 1: Copia Legible de DNI */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleDoc("dniFile")}
            className={`w-full p-4 text-left transition-colors flex justify-between items-center gap-4 cursor-pointer ${
              openDocs.dniFile ? "bg-slate-50/90 border-b border-slate-200" : "hover:bg-slate-50/60"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <span className="h-10 w-10 shrink-0 bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center rounded-lg font-bold">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Copia Legible de DNI</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Anverso y reverso en una sola cara (Formato Imagen).</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                currentDocs.dniFile.status === "Validado" 
                  ? "bg-emerald-100 text-emerald-800 font-bold" 
                  : currentDocs.dniFile.status === "Pendiente"
                    ? "bg-amber-100 text-amber-800 font-bold animate-pulse"
                    : currentDocs.dniFile.status === "Observado"
                      ? "bg-red-100 text-red-800 font-bold"
                      : "bg-slate-100 text-slate-500 font-bold"
              }`}>
                {currentDocs.dniFile.status === "No Enviado" ? "No Enviado" : currentDocs.dniFile.status}
              </span>

              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform">
                {openDocs.dniFile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {openDocs.dniFile && (
            <div className="p-5 space-y-4 bg-white animate-fade-in">
              {(currentDocs.dniFile.status === "Validado" || currentDocs.dniFile.status === "Pendiente") && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-semibold text-slate-700 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="truncate max-w-[130px] sm:max-w-xs font-mono">
                      Archivo: {currentDocs.dniFile.fileName || `dni_captura.jpg`} 
                      {currentDocs.dniFile.status === "Pendiente" && " (Revision Pendiente)"}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => triggerPreview("Copia de DNI - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), currentDocs.dniFile.fileName || "dni_captura.jpg", "image", { fileDataUrl: currentDocs.dniFile.fileDataUrl })}
                        className="p-1.5 px-3 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer shrink-0 shadow-2xs"
                      >
                        Ver Imagen
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById("file-input-dni-replace")?.click()}
                        className="p-1.5 px-3 bg-[#8B0020] hover:bg-[#6e0019] text-white text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                      >
                        Editar / Cambiar
                      </button>
                    </div>
                  </div>
                  <input 
                    id="file-input-dni-replace"
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, "dniFile")} 
                  />
                </div>
              )}

              {currentDocs.dniFile.status === "Observado" && (
                <div className="p-3.5 bg-red-50/70 border border-red-200 text-red-800 rounded-xl text-xs font-bold leading-normal text-left">
                  <strong>Observación:</strong> {currentDocs.dniFile.observations || "El documento enviado carga ilegibilidad. Por favor verifique el encuadre e iluminación en el escáner."}
                </div>
              )}

              {currentDocs.dniFile.status !== "Validado" && currentDocs.dniFile.status !== "Pendiente" && (
                <div>
                  <label htmlFor="file-input-dni" className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/40 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-center items-center text-center cursor-pointer block group">
                    <input 
                      id="file-input-dni"
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, "dniFile")} 
                    />
                    <div className="w-12 h-12 rounded-full bg-[#8B0020]/5 group-hover:bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center mb-2 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      Seleccionar Imagen JPG o PNG
                    </span>
                    <span className="text-[10px] text-[#8B0020] font-bold block mt-1">
                      Haga clic para elegir foto desde su dispositivo
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Formatos permitidos: JPG, JPEG, PNG (Máx 5MB)</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document 2: Certificado de Secundaria */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleDoc("certificadoFile")}
            className={`w-full p-4 text-left transition-colors flex justify-between items-center gap-4 cursor-pointer ${
              openDocs.certificadoFile ? "bg-slate-50/90 border-b border-slate-200" : "hover:bg-slate-50/60"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <span className="h-10 w-10 shrink-0 bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center rounded-lg font-bold">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Certificado de Secundaria</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Certificado oficial visado por la UGEL (Formato Imagen).</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                currentDocs.certificadoFile.status === "Validado" 
                  ? "bg-emerald-100 text-emerald-800 font-bold" 
                  : currentDocs.certificadoFile.status === "Pendiente"
                    ? "bg-amber-100 text-amber-800 font-bold animate-pulse"
                    : currentDocs.certificadoFile.status === "Observado"
                      ? "bg-red-100 text-red-800 font-bold"
                      : "bg-slate-100 text-slate-500 font-bold"
              }`}>
                {currentDocs.certificadoFile.status === "No Enviado" ? "No Enviado" : currentDocs.certificadoFile.status}
              </span>

              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform">
                {openDocs.certificadoFile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {openDocs.certificadoFile && (
            <div className="p-5 space-y-4 bg-white animate-fade-in">
              {(currentDocs.certificadoFile.status === "Validado" || currentDocs.certificadoFile.status === "Pendiente") && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-semibold text-slate-700 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="truncate max-w-[130px] sm:max-w-xs font-mono">
                      Archivo: {currentDocs.certificadoFile.fileName || `certificado_captura.jpg`} 
                      {currentDocs.certificadoFile.status === "Pendiente" && " (Revision Pendiente)"}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => triggerPreview("Certificado de Secundaria - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), currentDocs.certificadoFile.fileName || "certificado_captura.jpg", "image", { fileDataUrl: currentDocs.certificadoFile.fileDataUrl })}
                        className="p-1.5 px-3 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer shrink-0 shadow-2xs"
                      >
                        Ver Imagen
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById("file-input-cert-replace")?.click()}
                        className="p-1.5 px-3 bg-[#8B0020] hover:bg-[#6e0019] text-white text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                      >
                        Editar / Cambiar
                      </button>
                    </div>
                  </div>
                  <input 
                    id="file-input-cert-replace"
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, "certificadoFile")} 
                  />
                </div>
              )}

              {currentDocs.certificadoFile.status === "Observado" && (
                <div className="p-3.5 bg-red-50/70 border border-red-200 text-red-800 rounded-xl text-xs font-bold leading-normal text-left">
                  <strong>Observación:</strong> {currentDocs.certificadoFile.observations || "El certificado institucional se registra sin firma o sello visado oficial."}
                </div>
              )}

              {currentDocs.certificadoFile.status !== "Validado" && currentDocs.certificadoFile.status !== "Pendiente" && (
                <div>
                  <label htmlFor="file-input-cert" className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/40 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-center items-center text-center cursor-pointer block group">
                    <input 
                      id="file-input-cert"
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, "certificadoFile")} 
                    />
                    <div className="w-12 h-12 rounded-full bg-[#8B0020]/5 group-hover:bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center mb-2 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      Seleccionar Imagen JPG o PNG
                    </span>
                    <span className="text-[10px] text-[#8B0020] font-bold block mt-1">
                      Haga clic para elegir foto desde su dispositivo
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Formatos permitidos: JPG, JPEG, PNG (Máx 5MB)</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document 3: Partida de Nacimiento */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleDoc("partidaFile")}
            className={`w-full p-4 text-left transition-colors flex justify-between items-center gap-4 cursor-pointer ${
              openDocs.partidaFile ? "bg-slate-50/90 border-b border-slate-200" : "hover:bg-slate-50/60"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <span className="h-10 w-10 shrink-0 bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center rounded-lg font-bold">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Partida de Nacimiento</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Copia original legible y actualizada (Formato Imagen).</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                currentDocs.partidaFile.status === "Validado" 
                  ? "bg-emerald-100 text-emerald-800 font-bold" 
                  : currentDocs.partidaFile.status === "Pendiente"
                    ? "bg-amber-100 text-amber-800 font-bold animate-pulse"
                    : currentDocs.partidaFile.status === "Observado"
                      ? "bg-red-100 text-red-800 font-bold"
                      : "bg-slate-100 text-slate-500 font-bold"
              }`}>
                {currentDocs.partidaFile.status === "No Enviado" ? "No Enviado" : currentDocs.partidaFile.status}
              </span>

              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform">
                {openDocs.partidaFile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {openDocs.partidaFile && (
            <div className="p-5 space-y-4 bg-white animate-fade-in">
              {(currentDocs.partidaFile.status === "Validado" || currentDocs.partidaFile.status === "Pendiente") && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-semibold text-slate-700 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="truncate max-w-[130px] sm:max-w-xs font-mono">
                      Archivo: {currentDocs.partidaFile.fileName || `partida_captura.jpg`} 
                      {currentDocs.partidaFile.status === "Pendiente" && " (Revision Pendiente)"}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => triggerPreview("Partida de Nacimiento - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), currentDocs.partidaFile.fileName || "partida_captura.jpg", "image", { fileDataUrl: currentDocs.partidaFile.fileDataUrl })}
                        className="p-1.5 px-3 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer shrink-0 shadow-2xs"
                      >
                        Ver Imagen
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById("file-input-partida-replace")?.click()}
                        className="p-1.5 px-3 bg-[#8B0020] hover:bg-[#6e0019] text-white text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                      >
                        Editar / Cambiar
                      </button>
                    </div>
                  </div>
                  <input 
                    id="file-input-partida-replace"
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, "partidaFile")} 
                  />
                </div>
              )}

              {currentDocs.partidaFile.status === "Observado" && (
                <div className="p-3.5 bg-red-50/75 border border-red-200 text-red-800 rounded-xl text-xs font-bold leading-normal text-left">
                  <strong>Observación:</strong> {currentDocs.partidaFile.observations || "La imagen está borrosa en la zona de la firma del registrador. Por favor vuelva a escanear en alta resolución."}
                </div>
              )}

              {currentDocs.partidaFile.status !== "Validado" && currentDocs.partidaFile.status !== "Pendiente" && (
                <div>
                  <label htmlFor="file-input-partida" className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/40 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-center items-center text-center cursor-pointer block group">
                    <input 
                      id="file-input-partida"
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, "partidaFile")} 
                    />
                    <div className="w-12 h-12 rounded-full bg-[#8B0020]/5 group-hover:bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center mb-2 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      Seleccionar Imagen JPG o PNG
                    </span>
                    <span className="text-[10px] text-[#8B0020] font-bold block mt-1">
                      Haga clic para elegir foto desde su dispositivo
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Formatos permitidos: JPG, JPEG, PNG (Máx 5MB)</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document 4: Foto Tamaño Carné */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleDoc("fotoFile")}
            className={`w-full p-4 text-left transition-colors flex justify-between items-center gap-4 cursor-pointer ${
              openDocs.fotoFile ? "bg-slate-50/90 border-b border-slate-200" : "hover:bg-slate-50/60"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <span className="h-10 w-10 shrink-0 bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center rounded-lg font-bold">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Foto Tamaño Carné</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Fondo blanco, ropa formal, sin anteojos (Formato Imagen).</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                currentDocs.fotoFile.status === "Validado" 
                  ? "bg-emerald-100 text-emerald-800 font-bold" 
                  : currentDocs.fotoFile.status === "Pendiente"
                    ? "bg-amber-100 text-amber-800 font-bold animate-pulse"
                    : currentDocs.fotoFile.status === "Observado"
                      ? "bg-red-100 text-red-800 font-bold"
                      : "bg-slate-100 text-slate-500 font-bold"
              }`}>
                {currentDocs.fotoFile.status === "No Enviado" ? "No Enviado" : currentDocs.fotoFile.status}
              </span>

              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform">
                {openDocs.fotoFile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {openDocs.fotoFile && (
            <div className="p-5 space-y-4 bg-white animate-fade-in">
              {(currentDocs.fotoFile.status === "Validado" || currentDocs.fotoFile.status === "Pendiente") && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-semibold text-slate-700 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="truncate max-w-[130px] sm:max-w-xs font-mono">
                      Archivo: {currentDocs.fotoFile.fileName || `foto_estudio.jpg`} 
                      {currentDocs.fotoFile.status === "Pendiente" && " (Revision Pendiente)"}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => triggerPreview("Fotografia Personal - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), currentDocs.fotoFile.fileName || "foto_estudio.jpg", "image", { fileDataUrl: currentDocs.fotoFile.fileDataUrl })}
                        className="p-1.5 px-3 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer shrink-0 shadow-2xs"
                      >
                        Ver Imagen
                      </button>
                      <button 
                        type="button"
                        onClick={() => document.getElementById("file-input-foto-replace")?.click()}
                        className="p-1.5 px-3 bg-[#8B0020] hover:bg-[#6e0019] text-white text-[10px] font-sans font-bold uppercase rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                      >
                        Editar / Cambiar
                      </button>
                    </div>
                  </div>
                  <input 
                    id="file-input-foto-replace"
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, "fotoFile")} 
                  />
                </div>
              )}

              {currentDocs.fotoFile.status === "Observado" && (
                <div className="p-3.5 bg-red-50/70 border border-[#8B0020]/20 text-slate-700 rounded-xl text-xs font-semibold leading-normal text-left">
                  <p className="text-[#8B0020] font-extrabold uppercase text-[10px] tracking-wide mb-1 leading-none">Motivo de Rechazo:</p>
                  <span className="font-bold text-slate-600 block bg-white border border-[#8B0020]/10 p-2 rounded-lg mt-1.5 text-[11px] leading-relaxed">
                    {currentDocs.fotoFile.observations || "No cumple con el formato requerido. Se requiere foto formal con fondo blanco liso y rostro despejado."}
                  </span>
                </div>
              )}

              {currentDocs.fotoFile.status !== "Validado" && currentDocs.fotoFile.status !== "Pendiente" && (
                <div>
                  <label htmlFor="file-input-foto" className="border-2 border-dashed border-slate-200 hover:border-[#8B0020]/40 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-center items-center text-center cursor-pointer block group">
                    <input 
                      id="file-input-foto"
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, "fotoFile")} 
                    />
                    <div className="w-12 h-12 rounded-full bg-[#8B0020]/5 group-hover:bg-[#8B0020]/10 text-[#8B0020] flex items-center justify-center mb-2 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      Seleccionar Imagen JPG o PNG
                    </span>
                    <span className="text-[10px] text-[#8B0020] font-bold block mt-1">
                      Haga clic para elegir foto desde su dispositivo
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Formatos permitidos: JPG, JPEG, PNG (Máx 5MB)</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM SECTION: ¿Necesita ayuda? Card */}
      <div className="bg-gradient-to-r from-slate-900 via-[#5C0015] to-[#8B0020] text-white p-6 rounded-2xl shadow-xl border border-[#8B0020]/30 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-left relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
            <Headset className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-white text-base leading-tight flex items-center gap-2">
              ¿Necesita ayuda?
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Atención En Vivo</span>
            </h4>
            <p className="text-xs text-slate-200 font-medium mt-1 leading-relaxed max-w-xl">
              Nuestro equipo de secretaría académica está disponible para guiarte en tu proceso de <strong className="text-amber-300 font-extrabold">L-V de 8am a 6pm</strong>.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab("soporte")}
          className="z-10 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 flex items-center gap-2 group"
        >
          <MessageSquare className="w-4 h-4 text-slate-950" />
          <span>Contactar Soporte</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </PageTransition>
  );
});

DocumentosTab.displayName = "DocumentosTab";
export default DocumentosTab;
