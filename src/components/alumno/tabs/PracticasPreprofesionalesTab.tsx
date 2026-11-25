import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, CheckCircle2, Clock, AlertCircle, Upload, FileText, 
  Building2, UserCheck, Calendar, ShieldCheck, X, Eye, Download, 
  Printer, RefreshCw, Trash2 
} from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { StudentPersonalData, Enrollment } from "../../../types";
import { fetchPayments, createPayment, updatePayment } from "../../../services/api";

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
  const isMateo = currentDni === "74859612";
  const isContabilidad = enrollment?.programId === "contabilidad" || currentDni === "71248596";
  const [, setSync] = useState(0);

  const savedEfsrt = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`sfa_efsrt_${currentDni}`) || (isMateo ? localStorage.getItem("sfa_efsrt_74859612") : null);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [companyName, setCompanyName] = useState(
    savedEfsrt?.companyName ?? (
      isMateo
        ? "LA EMPRESA INDUSTRIAL CONSTRUCTORA Y DE SERVICIOS S.A.C."
        : isContabilidad
          ? "ESTUDIO CONTABLE Y AUDITORÍA INTEGRAL S.A.C."
          : ""
    )
  );
  const [ruc, setRuc] = useState(
    savedEfsrt?.ruc ?? (isMateo ? "20458963211" : isContabilidad ? "20548791234" : "")
  );
  const [department, setDepartment] = useState(
    savedEfsrt?.department ?? (
      isMateo
        ? "Montaje, Conexionado de Tableros y Mantenimiento de Fuerza y Control"
        : isContabilidad
          ? "Contabilidad General, Tributación y Formulación de Estados Financieros"
          : ""
    )
  );
  const [supervisor, setSupervisor] = useState(
    savedEfsrt?.supervisor ?? (
      isMateo
        ? "Ing. Carlos Mendoza Quispe — Jefe de Operaciones y Mantenimiento"
        : isContabilidad
          ? "CPC. María Elena Torres Huamán — Contadora General"
          : ""
    )
  );
  const [hours, setHours] = useState<number>(savedEfsrt?.hours ?? (isMateo || isContabilidad ? 480 : 360));
  const [startDate, setStartDate] = useState(savedEfsrt?.startDate ?? (isMateo ? "2027-02-01" : isContabilidad ? "2029-09-01" : ""));
  const [endDate, setEndDate] = useState(savedEfsrt?.endDate ?? (isMateo ? "2027-04-30" : isContabilidad ? "2029-12-15" : ""));
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDocumentRemoved, setIsDocumentRemoved] = useState(() => {
    if (typeof window === "undefined") return !isMateo;
    if (localStorage.getItem(`sfa_efsrt_file_removed_${currentDni}`) === "true") return true;
    return !isMateo && !savedEfsrt?.fileName;
  });

  const hasDocument = !isDocumentRemoved || Boolean(fileAttachment);
  const officialPdfUrl = "/documentos/Constancia_EFSRT_Practicas_Preprofesionales.pdf";
  const previewSource = fileObjectUrl || officialPdfUrl;

  const handleDeleteDocument = () => {
    setFileAttachment(null);
    setIsDocumentRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_efsrt_file_removed_${currentDni}`, "true");
      if (isMateo) localStorage.setItem("sfa_efsrt_file_removed_74859612", "true");
      window.dispatchEvent(new Event("storage"));
    }
    setNotice("Constancia eliminada del expediente. Puede adjuntar un nuevo archivo o restaurar la constancia original cuando lo desee.");
    setTimeout(() => setNotice(""), 6000);
  };

  const handleRestoreDefaultDocument = () => {
    setFileAttachment(null);
    setIsDocumentRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (typeof window !== "undefined") {
      localStorage.removeItem(`sfa_efsrt_file_removed_${currentDni}`);
      if (isMateo) localStorage.removeItem("sfa_efsrt_file_removed_74859612");
      window.dispatchEvent(new Event("storage"));
    }
    setNotice("Se restauró la constancia oficial predeterminada.");
    setTimeout(() => setNotice(""), 5000);
  };

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
    let active = true;
    let lastFetch = 0;
    const syncEfsrtWithBackend = async () => {
      const now = Date.now();
      if (now - lastFetch < 5000) return;
      lastFetch = now;
      try {
        const list = await fetchPayments();
        if (!active || !Array.isArray(list)) return;
        const found = list.find((p: any) => p.paymentId === `EFSRT-${currentDni}`);
        if (found) {
          if (found.status === "APROBADO") {
            localStorage.setItem(`sfa_efsrt_validated_${currentDni}`, "true");
            localStorage.setItem(`sfa_efsrt_all_approved_${currentDni}`, "true");
            localStorage.setItem(`sfa_graduation_docs_${currentDni}_practicas`, "true");
            localStorage.setItem(`sfa_titulacion_enabled_${currentDni}`, "true");
          }
          if (found.notes) {
            try {
              const parsed = JSON.parse(found.notes);
              localStorage.setItem(`sfa_efsrt_${currentDni}`, JSON.stringify(parsed));
            } catch {}
          }
          setSync((v) => v + 1);
        } else {
          const rawLocal = localStorage.getItem(`sfa_efsrt_${currentDni}`);
          if (rawLocal) {
            const isVal = localStorage.getItem(`sfa_efsrt_validated_${currentDni}`) === "true";
            await createPayment({
              paymentId: `EFSRT-${currentDni}`,
              studentDni: currentDni,
              concept: "EFSRT_EXPEDIENTE",
              amount: 0,
              date: new Date().toISOString().slice(0, 10),
              status: isVal ? "APROBADO" : "PENDIENTE",
              receiptNumber: `EFSRT-${currentDni}`,
              notes: rawLocal,
            });
          }
        }
      } catch {}
    };
    void syncEfsrtWithBackend();
    const handleStorageOnly = () => setSync((v) => v + 1);
    const handleFocus = () => {
      setSync((v) => v + 1);
      void syncEfsrtWithBackend();
    };
    window.addEventListener("storage", handleStorageOnly);
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageOnly);
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentDni]);

  // Check saved EFSRT record in localStorage
  const efsrtRecord = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`sfa_efsrt_${currentDni}`) || (isMateo ? localStorage.getItem("sfa_efsrt_74859612") : null);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const isValidatedBySecretaria = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_efsrt_validated_${currentDni}`) === "true" ||
    localStorage.getItem(`sfa_efsrt_all_approved_${currentDni}`) === "true" ||
    localStorage.getItem(`sfa_graduation_docs_${currentDni}_practicas`) === "true" ||
    (isMateo && (
      localStorage.getItem("sfa_efsrt_validated_74859612") === "true" ||
      localStorage.getItem("sfa_graduation_docs_74859612_practicas") === "true"
    ))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDocument) {
      setNotice("Atención: Debe adjuntar una constancia de prácticas (PDF o imagen) antes de enviar el expediente a Secretaría.");
      setTimeout(() => setNotice(""), 6000);
      return;
    }
    const payload = {
      studentDni: currentDni,
      studentName: personalData ? `${personalData.name} ${personalData.lastName}` : "Estudiante",
      companyName,
      ruc,
      department,
      supervisor,
      hours: Number(hours),
      startDate,
      endDate,
      fileName: fileAttachment ? fileAttachment.name : "Constancia_EFSRT_Practicas_Preprofesionales.pdf",
      submittedAt: new Date().toISOString(),
      status: "En Revisión"
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`sfa_efsrt_${currentDni}`, JSON.stringify(payload));
        localStorage.setItem(`sfa_efsrt_pending_review_${currentDni}`, "true");
        if (isMateo) {
          localStorage.setItem("sfa_efsrt_74859612", JSON.stringify(payload));
          localStorage.setItem("sfa_efsrt_pending_review_74859612", "true");
        }
        window.dispatchEvent(new Event("storage"));
      } catch {}
    }

    // Persist EFSRT submission in MongoDB so MGE sees it across any browser/tab
    void (async () => {
      try {
        const list = await fetchPayments();
        const existing = Array.isArray(list) ? list.find((p: any) => p.paymentId === `EFSRT-${currentDni}`) : null;
        const body = {
          paymentId: `EFSRT-${currentDni}`,
          studentDni: currentDni,
          concept: "EFSRT_EXPEDIENTE",
          amount: 0,
          date: new Date().toISOString().slice(0, 10),
          status: "PENDIENTE",
          receiptNumber: `EFSRT-${currentDni}`,
          notes: JSON.stringify(payload),
        };
        if (existing) {
          await updatePayment(existing._id || existing.paymentId, body);
        } else {
          await createPayment(body);
        }
      } catch {}
    })();

    setNotice("Expediente de Prácticas Preprofesionales (EFSRT) enviado exitosamente a Secretaría Académica para su validación.");
    setTimeout(() => setNotice(""), 8000);
    setSync((v) => v + 1);
  };

  const handleValidateBySecretaria = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_efsrt_validated_${currentDni}`, "true");
      localStorage.setItem(`sfa_efsrt_all_approved_${currentDni}`, "true");
      localStorage.setItem(`sfa_graduation_docs_${currentDni}_practicas`, "true");
      localStorage.setItem(`sfa_titulacion_enabled_${currentDni}`, "true");
      if (isMateo) {
        localStorage.setItem("sfa_efsrt_validated_74859612", "true");
        localStorage.setItem("sfa_efsrt_all_approved_74859612", "true");
        localStorage.setItem("sfa_graduation_docs_74859612_practicas", "true");
        localStorage.setItem("sfa_titulacion_enabled_74859612", "true");
      }
      window.dispatchEvent(new Event("storage"));
    }
    setNotice("Prácticas Preprofesionales (EFSRT) validadas y acreditadas por Secretaría General. Se han sumado los 24 créditos (120/120 cr). Certificado de Prácticas, Bachiller Técnico y Carpeta de Titulación han sido DESBLOQUEADOS en Trámites de Secretaría.");
    setTimeout(() => setNotice(""), 10000);
    setSync((v) => v + 1);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`sfa_efsrt_${currentDni}`);
      localStorage.removeItem(`sfa_efsrt_validated_${currentDni}`);
      localStorage.removeItem(`sfa_efsrt_all_approved_${currentDni}`);
      localStorage.removeItem(`sfa_graduation_docs_${currentDni}_practicas`);
      localStorage.removeItem(`sfa_titulacion_enabled_${currentDni}`);
      localStorage.removeItem(`sfa_efsrt_pending_review_${currentDni}`);
      if (isMateo) {
        localStorage.removeItem("sfa_efsrt_74859612");
        localStorage.removeItem("sfa_efsrt_validated_74859612");
        localStorage.removeItem("sfa_efsrt_all_approved_74859612");
        localStorage.removeItem("sfa_graduation_docs_74859612_practicas");
        localStorage.removeItem("sfa_titulacion_enabled_74859612");
        localStorage.removeItem("sfa_efsrt_pending_review_74859612");
      }
      localStorage.removeItem(`sfa_efsrt_file_removed_${currentDni}`);
      localStorage.removeItem("sfa_efsrt_file_removed_74859612");
      setIsDocumentRemoved(false);
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
            {isContabilidad ? "Módulo I: Contabilidad General, Tributación y Finanzas" : "Módulo I: Instalaciones Eléctricas y Mantenimiento"}
          </h4>
          <span className="text-xs text-slate-500 font-medium block">
            {isContabilidad
              ? "Correspondiente al Plan Curricular oficial de Contabilidad (EFSRT)."
              : "Correspondiente a los Ciclos I y II del Plan Curricular oficial de Electricidad Industrial."}
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

        <div className={`rounded-2xl border p-5 shadow-2xs space-y-2 border-l-4 ${
          isValidatedBySecretaria
            ? "bg-emerald-50/70 border-emerald-300 border-l-emerald-600"
            : efsrtRecord
              ? "bg-blue-50/50 border-blue-200 border-l-blue-600"
              : "bg-white border-slate-200/90 border-l-amber-500"
        }`}>
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
      <div className={`border rounded-2xl shadow-3xs p-6 space-y-5 ${
        isValidatedBySecretaria ? "bg-emerald-50/30 border-emerald-300" : "bg-white border-slate-200/90"
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#800521]" />
              {isValidatedBySecretaria
                ? "Expediente EFSRT Validado y Acreditado"
                : efsrtRecord
                  ? "Expediente de Prácticas Registrado"
                  : "Registrar Prácticas Preprofesionales (EFSRT)"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isValidatedBySecretaria
                ? "Sus prácticas preprofesionales fueron auditadas y aprobadas oficialmente por Secretaría Académica (MGE)."
                : "Ingrese los datos de la empresa y adjunte su constancia laboral debidamente firmada."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isValidatedBySecretaria && (
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>24 Créditos EFSRT Acreditados</span>
              </span>
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
                  placeholder={isContabilidad ? "Ej. Estudio Contable & Auditoría Asociados S.A.C." : "Ej. ABB Perú S.A."}
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
                placeholder={isContabilidad ? "Ej. Contabilidad General, Tributación y Planillas" : "Ej. Mantenimiento Eléctrico y Sistemas de Potencia"}
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
                  placeholder={isContabilidad ? "Ej. CPC María Elena Torres — Contadora General" : "Ej. Ing. Roberto Chang — Jefe de Planta"}
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
                  setIsDocumentRemoved(false);
                  if (typeof window !== "undefined") {
                    localStorage.removeItem(`sfa_efsrt_file_removed_${currentDni}`);
                    if (isMateo) localStorage.removeItem("sfa_efsrt_file_removed_74859612");
                    window.dispatchEvent(new Event("storage"));
                  }
                  setNotice(`Archivo "${file.name}" cargado. Haga clic en "Ver Vista Previa" para revisarlo.`);
                  setTimeout(() => setNotice(""), 6000);
                }
              }}
            />

            {hasDocument ? (
              /* Tarjeta del Documento con Acciones Visuales: Vista Previa, Cambiar y Eliminar */
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

                {/* Botones de Acción: Vista Previa, Cambiar y Eliminar */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="bg-[#800521] hover:bg-[#66041a] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    title="Abrir vista previa del documento"
                  >
                    <Eye className="w-4 h-4 text-amber-300" />
                    <span>Ver Vista Previa</span>
                  </button>

                  {!isValidatedBySecretaria && (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                        title="Seleccionar otro archivo PDF o imagen de su computadora"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cambiar Archivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteDocument}
                        className="bg-white hover:bg-red-50 text-red-700 border border-red-300 hover:border-red-400 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                        title="Eliminar esta constancia del expediente"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Eliminar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Estado Vacío para adjuntar constancia */
              <div className="border-2 border-dashed border-slate-300 bg-slate-50/70 rounded-2xl p-5 text-center transition-all space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#800521]/10 text-[#800521] flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="w-5 h-5 text-[#800521]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">
                    Adjunte su Constancia de Prácticas (PDF o Imagen)
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium max-w-md mx-auto">
                    Seleccione desde su computadora el certificado o constancia laboral firmada por su centro de prácticas.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>Adjuntar Archivo (PDF / Imagen)</span>
                  </button>
                  {isMateo && (
                    <button
                      type="button"
                      onClick={handleRestoreDefaultDocument}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Restaurar Constancia Original</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            {isValidatedBySecretaria ? (
              <div className="w-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Prácticas Preprofesionales Validadas y Acreditadas (+24 Créditos). Tu expediente está aprobado oficialmente.</span>
                </div>
                <span className="font-mono text-[10px] uppercase bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0">
                  Aprobado
                </span>
              </div>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-[#800521] hover:bg-[#66041a] text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>{efsrtRecord ? "Actualizar y Reenviar Expediente EFSRT" : "Enviar Expediente a Secretaría"}</span>
              </button>
            )}
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
