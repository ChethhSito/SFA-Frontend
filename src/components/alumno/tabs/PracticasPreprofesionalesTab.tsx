import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, CheckCircle2, Clock, AlertCircle, Upload, FileText, 
  Building2, UserCheck, Calendar, ShieldCheck, X, Eye, Download, 
  Printer, RefreshCw, Trash2 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { StudentPersonalData, Enrollment } from "../../../types";

interface PracticasPreprofesionalesTabProps {
  personalData?: StudentPersonalData;
  enrollment?: Enrollment;
  studentDni?: string;
}

export const PracticasPreprofesionalesTab: React.FC<PracticasPreprofesionalesTabProps> = ({
  personalData,
  enrollment,
  studentDni = "74859612"
}) => {
  const currentDni = enrollment?.studentDni || personalData?.dni || studentDni;
  const [, setSync] = useState(0);

  const [companyName, setCompanyName] = useState("LA EMPRESA INDUSTRIAL CONSTRUCTORA Y DE SERVICIOS S.A.C.");
  const [ruc, setRuc] = useState("20458963211");
  const [department, setDepartment] = useState("Montaje, Conexionado de Tableros y Mantenimiento de Fuerza y Control");
  const [supervisor, setSupervisor] = useState("Ing. Carlos Mendoza Quispe — Jefe de Operaciones y Mantenimiento");
  const [hours, setHours] = useState<number>(480);
  const [startDate, setStartDate] = useState("2027-02-01");
  const [endDate, setEndDate] = useState("2027-04-30");
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const officialPdfUrl = "/documentos/Constancia_EFSRT_Practicas_Preprofesionales.pdf";
  const previewSource = fileObjectUrl || officialPdfUrl;

  useEffect(() => {
    if (!fileAttachment) {
      setFileObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(fileAttachment);
    setFileObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileAttachment]);

  useEffect(() => {
    const handleSync = () => setSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  // Check saved EFSRT record in localStorage
  const efsrtRecord = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`sfa_efsrt_${currentDni}`) || localStorage.getItem("sfa_efsrt_74859612");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const isValidatedBySecretaria = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_efsrt_validated_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_efsrt_validated_74859612") === "true" ||
    localStorage.getItem("sfa_graduation_docs_74859612_practicas") === "true"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      studentDni: currentDni,
      studentName: personalData ? `${personalData.name} ${personalData.lastName}` : "Mateo Sebastián Quispe Rojas",
      companyName,
      ruc,
      department,
      supervisor,
      hours: Number(hours),
      startDate,
      endDate,
      fileName: fileAttachment ? fileAttachment.name : "Constancia_EFSRT_Firmada.pdf",
      submittedAt: new Date().toISOString(),
      status: "En Revisión"
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_efsrt_${currentDni}`, JSON.stringify(payload));
      localStorage.setItem("sfa_efsrt_74859612", JSON.stringify(payload));
      // Auto-signal to MGE Pestaña 7 that practices document was provided
      localStorage.setItem(`sfa_efsrt_pending_review_${currentDni}`, "true");
      localStorage.setItem("sfa_efsrt_pending_review_74859612", "true");
      window.dispatchEvent(new Event("storage"));
    }

    setNotice("Expediente de Prácticas Preprofesionales (EFSRT) enviado exitosamente a Secretaría Académica para su validación.");
    setTimeout(() => setNotice(""), 8000);
    setSync((v) => v + 1);
  };

  const handleValidateBySecretaria = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_efsrt_validated_${currentDni}`, "true");
      localStorage.setItem("sfa_efsrt_validated_74859612", "true");
      localStorage.setItem(`sfa_efsrt_all_approved_${currentDni}`, "true");
      localStorage.setItem("sfa_efsrt_all_approved_74859612", "true");
      localStorage.setItem(`sfa_graduation_docs_${currentDni}_practicas`, "true");
      localStorage.setItem("sfa_graduation_docs_74859612_practicas", "true");
      localStorage.setItem(`sfa_titulacion_enabled_${currentDni}`, "true");
      localStorage.setItem("sfa_titulacion_enabled_74859612", "true");
      window.dispatchEvent(new Event("storage"));
    }
    setNotice("Prácticas Preprofesionales (EFSRT) validadas y acreditadas por Secretaría General. Se han sumado los 24 créditos (120/120 cr). Certificado de Prácticas, Bachiller Técnico y Carpeta de Titulación han sido DESBLOQUEADOS en Trámites de Secretaría.");
    setTimeout(() => setNotice(""), 10000);
    setSync((v) => v + 1);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`sfa_efsrt_${currentDni}`);
      localStorage.removeItem("sfa_efsrt_74859612");
      localStorage.removeItem(`sfa_efsrt_validated_${currentDni}`);
      localStorage.removeItem("sfa_efsrt_validated_74859612");
      localStorage.removeItem(`sfa_efsrt_all_approved_${currentDni}`);
      localStorage.removeItem("sfa_efsrt_all_approved_74859612");
      localStorage.removeItem(`sfa_graduation_docs_${currentDni}_practicas`);
      localStorage.removeItem("sfa_graduation_docs_74859612_practicas");
      localStorage.removeItem(`sfa_titulacion_enabled_${currentDni}`);
      localStorage.removeItem("sfa_titulacion_enabled_74859612");
      localStorage.removeItem(`sfa_efsrt_pending_review_${currentDni}`);
      localStorage.removeItem("sfa_efsrt_pending_review_74859612");
      window.dispatchEvent(new Event("storage"));
    }
    setNotice("Registro de prácticas restablecido a estado pendiente.");
    setTimeout(() => setNotice(""), 4000);
    setSync((v) => v + 1);
  };

  return (
    <PageTransition id="practicas-tab" className="space-y-6 text-left font-sans">
      {/* Header Institucional Borgoña */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              SERVICIOS DEL ESTUDIANTE • VINCULACIÓN PROFESIONAL
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Prácticas Preprofesionales (EFSRT)
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Experiencias Formativas en Situaciones Reales de Trabajo. Requisito curricular ministerial indispensable para la titulación técnica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/40 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-400 font-extrabold block uppercase mb-0.5 tracking-wider">Acreditación EFSRT</span>
              <span className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                {isValidatedBySecretaria ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Acreditado (360 Horas)</span>
                  </>
                ) : efsrtRecord ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-300">En Revisión por MGE</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-300">Pendiente de Envío</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-blue-500 hover:text-blue-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid de Estado Curricular EFSRT (3 tarjetas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2 border-l-4 border-l-[#800521]">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Módulo Técnico Profesional</span>
          <h4 className="text-sm font-black text-slate-900 leading-snug">
            Módulo I: Instalaciones Eléctricas y Mantenimiento
          </h4>
          <span className="text-xs text-slate-500 font-medium block">
            Correspondiente a los Ciclos I y II del Plan Curricular oficial de Electricidad Industrial.
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2 border-l-4 border-l-blue-600">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Horas Formativas Requeridas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {efsrtRecord ? efsrtRecord.hours : 0}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">/ 350 Horas Mínimas</span>
          </div>
          <span className="text-xs text-slate-500 font-medium block">
            Cumplimiento ministerial verificado mediante constancia oficial de la empresa.
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2 border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Estado de Validación en MGE</span>
          <div className="pt-0.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase font-mono border ${
              isValidatedBySecretaria
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : efsrtRecord
                ? "bg-blue-50 text-blue-800 border-blue-300"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}>
              {isValidatedBySecretaria ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Validado y Conforme</span>
                </>
              ) : efsrtRecord ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>En Trámite de Aprobación</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sin Registro</span>
                </>
              )}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium block">
            {isValidatedBySecretaria 
              ? "Requisito EFSRT verificado para el expediente de titulación."
              : "Pendiente de validación por Secretaría Académica en Pestaña 7."}
          </span>
        </div>
      </div>

      {/* Formulario de Registro o Detalle de Prácticas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-3xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#800521]" />
              {efsrtRecord ? "Expediente de Prácticas Registrado" : "Registrar Prácticas Preprofesionales (EFSRT)"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ingrese los datos de la empresa y adjunte su constancia laboral debidamente firmada.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isValidatedBySecretaria ? (
              <button
                type="button"
                onClick={handleValidateBySecretaria}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Acreditar formalmente las prácticas para sumar 24 créditos y desbloquear trámites de egreso pleno"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Acreditar Prácticas (Secretaría)</span>
              </button>
            ) : (
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>24 Créditos EFSRT Acreditados</span>
              </span>
            )}
            {(efsrtRecord || isValidatedBySecretaria) && (
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-500 hover:text-slate-800 text-xs font-bold underline cursor-pointer ml-1"
              >
                Restablecer a Pendiente
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Empresa o Entidad Receptora
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. ABB Perú S.A."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#800521]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                RUC de la Empresa
              </label>
              <input
                type="text"
                required
                maxLength={11}
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                placeholder="20100123456"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#800521]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Área o Departamento de Desempeño
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej. Mantenimiento Eléctrico y Sistemas de Potencia"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#800521]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Supervisor de Prácticas en Empresa / Cargo
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Ej. Ing. Roberto Chang — Jefe de Planta"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#800521]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Total de Horas Realizadas
              </label>
              <input
                type="number"
                required
                min={350}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-black text-slate-900 outline-none focus:border-[#800521]"
              />
              <span className="text-[9.5px] text-slate-400 block font-mono">Mínimo legal: 350 horas formativas.</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Fecha de Inicio
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#800521]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Fecha de Culminación
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#800521]"
              />
            </div>
          </div>

          {/* Constancia de Prácticas o Informe Final con Vista Previa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black uppercase text-slate-700">
                Constancia de Prácticas o Informe Final Firmado (PDF o Imagen)
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                Máximo 5 MB • Formato PDF, JPG o PNG
              </span>
            </div>

            {/* Input file nativo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              id="efsrt-file-input"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFileAttachment(file);
                if (file) {
                  setNotice(`Archivo "${file.name}" cargado. Haga clic en "Ver Vista Previa" para revisarlo.`);
                  setTimeout(() => setNotice(""), 6000);
                }
              }}
            />

            {/* Tarjeta del Documento con Acciones Visuales Claras */}
            <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-[#800521] border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-6 h-6 text-[#800521]" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 break-all font-mono">
                      {fileAttachment ? fileAttachment.name : (efsrtRecord?.fileName || "Constancia_EFSRT_Practicas_Preprofesionales.pdf")}
                    </span>
                    <span className="text-[9.5px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                      {fileAttachment ? "Archivo Adjuntado" : "Documento Oficial Conciliado"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {companyName} • {department} • {hours} hrs efectivas
                  </p>
                </div>
              </div>

              {/* Botones de Vista Previa y Cambio de Archivo */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="bg-[#800521] hover:bg-[#66041a] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  title="Abrir vista previa del documento"
                >
                  <Eye className="w-4 h-4 text-amber-300" />
                  <span>Ver Vista Previa</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                  title="Seleccionar otro archivo PDF o imagen de su computadora"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cambiar Archivo</span>
                </button>

                {fileAttachment && (
                  <button
                    type="button"
                    onClick={() => {
                      setFileAttachment(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      setNotice("Se restableció la constancia al documento oficial predeterminado.");
                      setTimeout(() => setNotice(""), 4000);
                    }}
                    className="p-2 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Quitar archivo adjunto personalizado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-[#800521] hover:bg-[#66041a] text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>{efsrtRecord ? "Actualizar y Reenviar Expediente EFSRT" : "Enviar Expediente a Secretaría"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Vista Previa del PDF / Constancia */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreviewModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-300 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800 text-left">
            {/* Header del Modal */}
            <div className="bg-[#800521] text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0 border-b-2 border-amber-500">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
                    VISTA PREVIA DE EXPEDIENTE EFSRT
                  </span>
                  <span className="text-xs text-amber-200 font-bold font-mono">
                    {companyName}
                  </span>
                </div>
                <h3 className="text-base font-black text-white leading-tight">
                  Constancia de Prácticas Preprofesionales
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewSource}
                  download={fileAttachment ? fileAttachment.name : (efsrtRecord?.fileName || "Constancia_EFSRT_Practicas_Preprofesionales.pdf")}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Descargar documento PDF"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const printWin = window.open(previewSource, '_blank');
                    printWin?.focus();
                    printWin?.print();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Imprimir documento"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Visor con el PDF Real */}
            <div className="flex-1 p-2 md:p-4 overflow-hidden bg-slate-900/10 flex items-center justify-center">
              {fileAttachment && fileAttachment.type.startsWith("image/") ? (
                <img 
                  src={previewSource} 
                  alt="Constancia de Prácticas" 
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg border border-slate-300 bg-white"
                />
              ) : (
                <iframe 
                  src={`${previewSource}#toolbar=1&navpanes=0`} 
                  className="w-full h-[75vh] rounded-xl border border-slate-300 shadow-xl bg-white"
                  title="Vista previa del PDF oficial de Prácticas EFSRT"
                />
              )}
            </div>

            {/* Footer con controles */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                Archivo actual: <strong className="font-mono text-slate-800">{fileAttachment ? fileAttachment.name : (efsrtRecord?.fileName || "Constancia_EFSRT_Practicas_Preprofesionales.pdf")}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowPreviewModal(false);
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Subir Otro PDF / Imagen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Aceptar y Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
