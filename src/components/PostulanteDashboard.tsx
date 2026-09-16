import React, { useState, useEffect } from "react";
import { 
  FileText, CreditCard, Award, HelpCircle, Upload, LogOut, ArrowRight, CheckCircle2, 
  XCircle, Clock, ChevronRight, Download, RefreshCw, AlertTriangle, Play, HelpCircle as HelpIcon,
  ChevronLeft, ArrowLeft, Terminal, LayoutDashboard, Compass, Info, CheckSquare, Settings,
  Landmark, Store, Smartphone, Printer, Check, Calendar, MapPin, Lightbulb, ChevronDown, ChevronUp, Headset, MessageSquare
} from "lucide-react";
import { Applicant, ProgramId, Enrollment } from "../types";
import { ACADEMIC_PROGRAMS, REAL_MPA_COURSES } from "../mockData";
import { motion, AnimatePresence } from "motion/react";

// Reusable Custom Design System Components
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/Card";
import PageHeader from "./ui/PageHeader";
import AlertBox from "./ui/AlertBox";
import Sidebar from "./ui/Sidebar";
import PageTransition from "./ui/PageTransition";
import ImagePreviewModal from "./ui/ImagePreviewModal";

interface PostulanteDashboardProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
  onLogout: () => void;
  enrollments?: Enrollment[];
  onUpdateEnrollment?: (updated: Enrollment) => void;
}

export default function PostulanteDashboard({ 
  applicant, 
  onUpdateApplicant, 
  onLogout,
  enrollments = [],
  onUpdateEnrollment
}: PostulanteDashboardProps) {
  // Navigation tabs matching screenshots: Documentos de Admisión, Pagos, Resultados, Soporte, Dashboard, Pago de Matrícula
  const [activeTab, setActiveTab] = useState<"dashboard" | "documentos" | "pagos" | "resultados" | "soporte" | "matricula">("dashboard");

  const getFormattedDate = (isoDate?: string, fallback: string = "12/03/2026") => {
    if (!isoDate) return fallback;
    if (/\d{2}\/\d{2}\/\d{4}/.test(isoDate)) return isoDate;
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const registrationDate = getFormattedDate(applicant.registeredAt, new Date().toLocaleDateString('es-PE'));
  const paymentDate = getFormattedDate(applicant.paymentValidatedAt, registrationDate);
  const folderApprovalDate = getFormattedDate(applicant.folderApprovedAt, new Date().toLocaleDateString('es-PE'));
  const [paymentVoucher, setPaymentVoucher] = useState(applicant.paymentOperation || "");
  const [paymentType, setPaymentType] = useState<"number" | "voucher">(applicant.paymentType || "number");
  const [stagedVoucherFile, setStagedVoucherFile] = useState<string>("");
  const [stagedVoucherPreview, setStagedVoucherPreview] = useState<string>("");

  // Enrollment / Matrícula states
  const [matriculaVoucher, setMatriculaVoucher] = useState("");
  const [matriculaPaymentType, setMatriculaPaymentType] = useState<"number" | "voucher">("voucher");
  const [stagedMatriculaFile, setStagedMatriculaFile] = useState<string>("");
  const [stagedMatriculaPreview, setStagedMatriculaPreview] = useState<string>("");
  const [isSubmittingMatricula, setIsSubmittingMatricula] = useState(false);
  const [isEditingMatricula, setIsEditingMatricula] = useState(false);

  const handleStartEditMatricula = (myEnrollment: any) => {
    if (myEnrollment) {
      if (myEnrollment.paymentType === "number") {
        setMatriculaPaymentType("number");
        setMatriculaVoucher(myEnrollment.paymentOperation || "");
        setStagedMatriculaFile("");
        setStagedMatriculaPreview("");
      } else {
        setMatriculaPaymentType("voucher");
        setMatriculaVoucher("");
        setStagedMatriculaFile(myEnrollment.paymentVoucherFileName || "");
        setStagedMatriculaPreview(myEnrollment.paymentVoucherUrl || "");
      }
    }
    setIsEditingMatricula(true);
  };

  // Local staged files and image preview URLs
  const [stagedDniFile, setStagedDniFile] = useState<string>("");
  const [stagedDniPreview, setStagedDniPreview] = useState<string>("");

  const [stagedCertFile, setStagedCertFile] = useState<string>("");
  const [stagedCertPreview, setStagedCertPreview] = useState<string>("");

  const [stagedPartidaFile, setStagedPartidaFile] = useState<string>("");
  const [stagedPartidaPreview, setStagedPartidaPreview] = useState<string>("");

  const [stagedFotoFile, setStagedFotoFile] = useState<string>("");
  const [stagedFotoPreview, setStagedFotoPreview] = useState<string>("");

  // Accordion toggle state for documents (DNI open by default)
  const [openDocs, setOpenDocs] = useState<Record<string, boolean>>({
    dniFile: true,
    certificadoFile: false,
    partidaFile: false,
    fotoFile: false
  });

  const toggleDoc = (docKey: string) => {
    setOpenDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  // Modal state for uploading/previewing document
  const [stagedUploadModal, setStagedUploadModal] = useState<{
    docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile";
    docTitle: string;
    fileName: string;
    fileDataUrl: string;
  } | null>(null);

  const handleCancelUploadModal = () => {
    if (!stagedUploadModal) return;
    const key = stagedUploadModal.docKey;
    if (key === "dniFile") { setStagedDniFile(""); setStagedDniPreview(""); }
    else if (key === "certificadoFile") { setStagedCertFile(""); setStagedCertPreview(""); }
    else if (key === "partidaFile") { setStagedPartidaFile(""); setStagedPartidaPreview(""); }
    else if (key === "fotoFile") { setStagedFotoFile(""); setStagedFotoPreview(""); }
    setStagedUploadModal(null);
  };

  const handleConfirmUploadModal = () => {
    if (!stagedUploadModal) return;
    const key = stagedUploadModal.docKey;
    handleSaveDocument(key);
    setStagedUploadModal(null);
  };

  // Image preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileType, setPreviewFileType] = useState<"image" | "receipt">("image");
  const [previewMetadata, setPreviewMetadata] = useState<any>({});

  // Support inputs state
  const [supportCategory, setSupportCategory] = useState("Dificultad con el formato o visualizacion del PDF");
  const [supportMessage, setSupportMessage] = useState("");
  const [isConstanciaModalOpen, setIsConstanciaModalOpen] = useState(false);

  const triggerPreview = (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => {
    // Resolve program name
    const prg = ACADEMIC_PROGRAMS.find(p => p.id === applicant.programId)?.name || "Electricidad Industrial";
    setPreviewTitle(title);
    setPreviewFileName(fileName);
    setPreviewFileType(fileType);
    setPreviewMetadata({
      dni: applicant.dni,
      studentName: applicant.name,
      studentLastName: applicant.lastName,
      programName: prg,
      transactionId: applicant.paymentOperation || "PRE-620323",
      amount: "S/. 120.00",
      date: paymentDate,
      concept: "Derecho de Examen Ordinario 2026",
      ...customMeta
    });
    setPreviewOpen(true);
  };

  // Read docs structure from applicant model with defaults
  const currentDocs = {
    dniFile: applicant.docs?.dniFile || { status: "No Enviado" as const },
    certificadoFile: applicant.docs?.certificadoFile || { status: "No Enviado" as const },
    partidaFile: applicant.docs?.partidaFile || { status: "No Enviado" as const },
    fotoFile: applicant.docs?.fotoFile || { status: "No Enviado" as const }
  };

  // Helper calculation for global document completion percentage
  const totalDocs = 4;
  let approvedCount = 0;
  if (currentDocs.dniFile.status === "Validado") approvedCount++;
  if (currentDocs.certificadoFile.status === "Validado") approvedCount++;
  if (currentDocs.partidaFile?.status === "Validado") approvedCount++;
  if (currentDocs.fotoFile.status === "Validado") approvedCount++;
  
  const globalProgressPercentage = Math.round((approvedCount / totalDocs) * 100);

  const isActuallyAdmitted = applicant.admitted === true || applicant.admitted === "ADMITIDO";

  // Compress and resize images on client-side to fit within Firestore's 1MB limit and guarantee fast loading
  const compressAndResizeImage = (file: File, callback: (resizedDataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          callback(dataUrl);
        } else {
          callback(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Helper function to handle image selection with automatic compression
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const docTitles = {
      dniFile: "Copia Legible de DNI",
      certificadoFile: "Certificado de Secundaria",
      partidaFile: "Partida de Nacimiento",
      fotoFile: "Foto Tamaño Carné"
    };

    compressAndResizeImage(file, (compressedDataUrl) => {
      if (docKey === "dniFile") {
        setStagedDniFile(fileName);
        setStagedDniPreview(compressedDataUrl);
      } else if (docKey === "certificadoFile") {
        setStagedCertFile(fileName);
        setStagedCertPreview(compressedDataUrl);
      } else if (docKey === "partidaFile") {
        setStagedPartidaFile(fileName);
        setStagedPartidaPreview(compressedDataUrl);
      } else if (docKey === "fotoFile") {
        setStagedFotoFile(fileName);
        setStagedFotoPreview(compressedDataUrl);
      }

      setStagedUploadModal({
        docKey,
        docTitle: docTitles[docKey],
        fileName,
        fileDataUrl: compressedDataUrl
      });
    });
    e.target.value = "";
  };

  // Save/Submit selected file to institutional verification
  const handleSaveDocument = (docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile") => {
    let filename = "";
    if (docKey === "dniFile") {
      filename = stagedDniFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Copia de DNI primero.");
        return;
      }
      setStagedDniFile("");
    } else if (docKey === "certificadoFile") {
      filename = stagedCertFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para el Certificado de Secundaria primero.");
        return;
      }
      setStagedCertFile("");
    } else if (docKey === "partidaFile") {
      filename = stagedPartidaFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Partida de Nacimiento primero.");
        return;
      }
      setStagedPartidaFile("");
    } else if (docKey === "fotoFile") {
      filename = stagedFotoFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Foto primero.");
        return;
      }
      setStagedFotoFile("");
    }

    const updated = {
      ...applicant,
      docs: {
        ...currentDocs,
        [docKey]: {
          status: "Pendiente" as const,
          fileName: filename,
          fileDataUrl: docKey === "dniFile" ? stagedDniPreview
                     : docKey === "certificadoFile" ? stagedCertPreview
                     : docKey === "partidaFile" ? stagedPartidaPreview
                     : stagedFotoPreview,
          observations: ""
        }
      }
    };
    onUpdateApplicant(updated);
    alert("¡Imagen guardada con éxito y enviada para validación institucional de admisión!");
  };

  // Submit payment operaton code from screen 4
  const handleSubmitPaymentVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: any = {
      ...applicant,
      paymentStatus: "Pendiente" as const,
      paymentObservations: "",
      paymentType: paymentType
    };

    if (paymentType === "number") {
      if (!paymentVoucher.trim()) {
        alert("Por favor, ingrese un número de operación bancario correcto.");
        return;
      }
      updated.paymentOperation = paymentVoucher;
      updated.paymentVoucherUrl = "";
      updated.paymentVoucherFileName = "";
    } else {
      if (!stagedVoucherPreview) {
        alert("Por favor, seleccione o cargue una imagen de su voucher de pago primero.");
        return;
      }
      updated.paymentOperation = "VER VOUCHER ADJUNTO";
      updated.paymentVoucherUrl = stagedVoucherPreview;
      updated.paymentVoucherFileName = stagedVoucherFile;
    }

    onUpdateApplicant(updated);
    alert(`Comprobante de pago S/. 120.00 enviado para validación institucional de derecho de admisión.`);
    
    // Clear staged files and previews
    setStagedVoucherFile("");
    setStagedVoucherPreview("");
  };

  const handleSubmitMatriculaVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateEnrollment) return;
    
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

    let updated: Enrollment = {
      ...myEnrollment,
      paymentStatus: "Pendiente",
      paymentObservations: "",
      paymentType: matriculaPaymentType,
      updatedAt: new Date().toISOString()
    };

    if (matriculaPaymentType === "number") {
      if (!matriculaVoucher.trim()) {
        alert("Por favor, ingrese un número de operación de depósito válido.");
        return;
      }
      updated.paymentOperation = matriculaVoucher;
      updated.paymentVoucherUrl = "";
      updated.paymentVoucherFileName = "";
    } else {
      if (!stagedMatriculaPreview) {
        alert("Por favor, seleccione o cargue una imagen de su voucher primero.");
        return;
      }
      updated.paymentOperation = "VER VOUCHER MATRÍCULA";
      updated.paymentVoucherUrl = stagedMatriculaPreview;
      updated.paymentVoucherFileName = stagedMatriculaFile;
    }

    onUpdateEnrollment(updated);
    alert("¡Voucher de Pago de Matrícula (S/. 250.00) enviado con éxito a la Oficina de Caja (MAMC)!");
    
    // Clear staged states
    setStagedMatriculaFile("");
    setStagedMatriculaPreview("");
    setMatriculaVoucher("");
    setIsEditingMatricula(false);
  };

  const currentProgram = ACADEMIC_PROGRAMS.find((p) => p.id === applicant.programId) || ACADEMIC_PROGRAMS[0];

  return (
    <div 
      id="portal-postulante"
      className="relative h-screen w-full bg-slate-50 font-sans text-slate-800 overflow-hidden flex flex-col md:flex-row"
      style={{
        backgroundImage: `radial-gradient(ellipse at top right, rgba(207,160,32,0.03), transparent 50%), radial-gradient(ellipse at bottom left, rgba(159,6,42,0.02), transparent 50%)`
      }}
    >
      {/* Floating slowly rotating graphic background color shapes to mirror the Login Portal style */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9F062A]/3 rounded-full blur-[90px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-1/5 right-1/4 w-[450px] h-[450px] bg-amber-400/2 rounded-full blur-[110px] pointer-events-none animate-pulse duration-[15s]" />

      {/* 3. SIDEBAR NAVIGATION */}
      <Sidebar
        institution={{
          name: "IESTP SFA",
          subtitle: "Admisión Postulante"
        }}
        user={{
          name: `${applicant.name} ${applicant.lastName}`,
          role: currentProgram.name,
          status: isActuallyAdmitted ? "ADMITIDO" : (applicant.admitted === "NO ADMITIDO" ? "NO ADMITIDO" : "EN PROCESO"),
        }}
        sections={[
          {
            title: "MENÚ PRINCIPAL",
            items: [
              {
                label: "Dashboard",
                icon: <LayoutDashboard className="w-4 h-4" />,
                route: "dashboard",
                active: activeTab === "dashboard"
              },
              {
                label: "Documentos de Admisión",
                icon: <FileText className="w-4 h-4" />,
                route: "documentos",
                active: activeTab === "documentos"
              },
              {
                label: "Pagos",
                icon: <CreditCard className="w-4 h-4" />,
                route: "pagos",
                active: activeTab === "pagos"
              },
              ...(isActuallyAdmitted ? [
                {
                  label: "Pago de Matrícula",
                  icon: <Landmark className="w-4.5 h-4.5" />,
                  route: "matricula",
                  active: activeTab === "matricula"
                }
              ] : []),
              {
                label: "Resultados",
                icon: <Award className="w-4 h-4" />,
                route: "resultados",
                active: activeTab === "resultados"
              },
              {
                label: "Soporte",
                icon: <HelpCircle className="w-4 h-4" />,
                route: "soporte",
                active: activeTab === "soporte"
              }
            ]
          }
        ]}
        onItemClick={(route) => setActiveTab(route as any)}
        onLogout={onLogout}
      />

      {/* 4. MAIN VIEWPORT AREA */}
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto z-10 w-full">
        
        {/* BANNER INDICATING EVALUATION MODALITIES */}
        {activeTab !== "resultados" && !isActuallyAdmitted && (approvedCount < 4 || applicant.paymentStatus !== "Validado") && (
          <AlertBox
            className="mb-6"
            title="Modalidad de Admisión IESTP San Francisco de Asís"
            description="Para obtener la vacante, el postulante deberá registrar su carpeta electrónica de 4 requisitos, completar su derecho de pago de S/.120 y rendir de forma presencial el examen de admisión ordinario programado."
            variant="brand"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("documentos")}
                className="font-bold shrink-0 text-[10px] tracking-wider border-slate-300 hover:border-brand-wine mt-2 md:mt-0"
              >
                Completar Expediente &rarr;
              </Button>
            }
          />
        )}

        {/* ACTIVE TABS SWITCH */}
        {activeTab === "dashboard" && (
          <PageTransition id="dashboard" className="space-y-6">
            {/* INSTITUTIONAL HEADER BANNER */}
            <div className="p-7 md:p-8 bg-gradient-to-r from-[#8B0020] via-[#700019] to-[#590013] text-white rounded-2xl shadow-lg border-b-4 border-[#CFA020] relative overflow-hidden space-y-4">
              <div className="relative z-10 space-y-2">
                <span className="text-[11px] text-amber-300 font-black tracking-widest uppercase block">PROCESO DE ADMISIÓN CONTINUA INSTITUCIONAL</span>
                <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight flex flex-wrap items-center gap-3">
                  ¡Hola, {applicant.name}!
                  <span className="text-[11px] bg-black/30 backdrop-blur-xs text-amber-300 font-mono px-3 py-1 rounded-lg font-bold uppercase tracking-wider border border-amber-400/30">
                    CÓDIGO POSTULANTE: {applicant.applicantCode || "202610028"}
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed max-w-3xl">
                  Sube tus requisitos digitales para reservar tu vacante de estudios en la carrera técnica de <strong className="text-white underline decoration-amber-400 decoration-2 underline-offset-2">{currentProgram.name}</strong>. (DNI: {applicant.dni})
                </p>
                
                <div className="pt-2 flex flex-wrap gap-6 text-xs font-bold items-center text-slate-200 border-t border-white/10">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-300 font-medium uppercase text-[11px]">Operación Pago Tasas:</span> 
                    <span className={`font-extrabold text-[13px] tracking-wider uppercase px-2 py-0.5 rounded ${applicant.paymentStatus === "Validado" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"}`}>
                      {applicant.paymentStatus === "Validado" ? "VALIDADO" : (applicant.paymentStatus || "NO PAGADO")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-300 font-medium uppercase text-[11px]">Expediente Digital:</span> 
                    <span className="font-extrabold text-amber-300 text-[13px] tracking-wider px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded">
                      {globalProgressPercentage}% COMPLETADO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Folder Observation Display alert bar */}
            {applicant.folderStatus === "Observed" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs font-bold leading-relaxed shadow-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-650 shrink-0" />
                  <span className="text-red-700 font-black uppercase tracking-wider text-[11px]">Expediente Observado por Secretaría de Admisión</span>
                </div>
                <p className="text-slate-600 font-semibold">
                  Su carpeta de admisión presenta observaciones oficiales que deben ser subsanadas a la brevedad. Por favor examine sus requisitos y compruebe los comentarios indicados:
                </p>
                <div className="p-3 bg-white rounded-lg border border-red-200 text-red-750 italic font-medium leading-relaxed">
                  "{applicant.folderObservations || "Corrija los documentos con estado 'Observado' indicados por la secretaría."}"
                </div>
                <div className="pt-1.5">
                  <Button 
                    onClick={() => setActiveTab("documentos")} 
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-lg"
                  >
                    Examinar Requisitos de Admisión
                  </Button>
                </div>
              </div>
            )}

            {/* PROGRESS LANDING TIMELINE WIDGET */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
              
              {/* STEP 1: Inscripción Inicial (Siempre Completado) */}
              <div className="p-5 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <span className="inline-block bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">1. INSCRIPCIÓN INICIAL</span>
                  <h4 className="font-black text-emerald-950 text-sm mt-1">{currentProgram.name}</h4>
                  <p className="text-emerald-800/90 font-medium text-[11px] mt-1.5 leading-relaxed">Carrera oficial registrada en el sistema de admisiones.</p>
                </div>
                <div className="mt-5 pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado
                  </span>
                </div>
              </div>

              {/* STEP 2: Tasa de Derechos */}
              {(() => {
                const isPaymentDone = applicant.paymentStatus === "Validado";
                return (
                  <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
                    isPaymentDone ? "bg-emerald-50/90 border-emerald-300/80 text-emerald-950" : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
                  }`}>
                    <div>
                      <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                        isPaymentDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>2. TASA DE DERECHOS S/ 120</span>
                      <h4 className={`font-black text-sm mt-1 ${isPaymentDone ? "text-emerald-950" : "text-slate-800"}`}>Estado: {applicant.paymentStatus || "No Pagado"}</h4>
                      <p className={`font-medium text-[11px] mt-1.5 leading-relaxed ${isPaymentDone ? "text-emerald-800/90" : "text-slate-500"}`}>
                        Operación de validación bancaria. {applicant.paymentOperation ? `Ref: ${applicant.paymentOperation}` : "Sin registrar."}
                      </p>
                    </div>
                    <div className={`mt-5 pt-3 border-t ${isPaymentDone ? "border-emerald-200/80" : "border-slate-100"}`}>
                      {isPaymentDone ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado</span>
                      ) : (
                        <button 
                          onClick={() => setActiveTab("pagos")}
                          className="w-full bg-[#8B0020] hover:bg-[#700019] text-white font-black uppercase text-[11px] tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                        >
                          <span>Ir a Pagos</span> <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* STEP 3: Validación de Expediente */}
              {(() => {
                const isFolderDone = approvedCount >= 4;
                return (
                  <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
                    isFolderDone ? "bg-emerald-50/90 border-emerald-300/80 text-emerald-950" : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
                  }`}>
                    <div>
                      <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                        isFolderDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>3. VALIDACIÓN DE EXPEDIENTE</span>
                      <h4 className={`font-black text-sm mt-1 ${isFolderDone ? "text-emerald-950" : "text-slate-800"}`}>Aprobados: {approvedCount} de 4</h4>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                        <div className={`h-full transition-all duration-300 ${isFolderDone ? "bg-emerald-600" : "bg-[#8B0020]"}`} style={{ width: `${globalProgressPercentage}%` }} />
                      </div>
                    </div>
                    <div className={`mt-5 pt-3 border-t ${isFolderDone ? "border-emerald-200/80" : "border-slate-100"}`}>
                      {isFolderDone ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado</span>
                      ) : (
                        <button 
                          onClick={() => setActiveTab("documentos")}
                          className="w-full bg-[#8B0020] hover:bg-[#700019] text-white font-black uppercase text-[11px] tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                        >
                          <span>Subir Documentos</span> <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* STEP 4: Examen y Admisión */}
              {(() => {
                const isAdmittedDone = isActuallyAdmitted;
                return (
                  <div className={`p-5 rounded-2xl border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group ${
                    isAdmittedDone ? "bg-emerald-50/90 border-emerald-300/80 text-emerald-950" : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-800"
                  }`}>
                    <div>
                      <span className={`inline-block font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                        isAdmittedDone ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>4. EXAMEN Y ADMISIÓN</span>
                      <h4 className={`font-black text-sm mt-1 uppercase ${isAdmittedDone ? "text-emerald-700" : (applicant.admitted === "NO ADMITIDO" ? "text-rose-600" : "text-slate-700")}`}>
                        {isAdmittedDone ? "ADMITIDO" : (applicant.admitted === "NO ADMITIDO" ? "NO ADMITIDO" : "PENDIENTE EVAL")}
                      </h4>
                      <p className={`font-medium text-[11px] mt-1.5 leading-relaxed ${isAdmittedDone ? "text-emerald-800/90" : "text-slate-500"}`}>Asignación de aula de examen, rendición presencial y publicación de resultados oficiales.</p>
                    </div>
                    <div className={`mt-5 pt-3 border-t ${isAdmittedDone ? "border-emerald-200/80" : "border-slate-100"}`}>
                      {isAdmittedDone ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider"><Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> Completado</span>
                      ) : (
                        <button 
                          onClick={() => setActiveTab("resultados")}
                          className="w-full bg-[#8B0020] hover:bg-[#700019] text-white font-black uppercase text-[11px] tracking-wider py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow cursor-pointer"
                        >
                          <span>Ver Resultados</span> <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* PRE-VISUAL EXPLANATION GUIDE */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#8B0020]/10 flex items-center justify-center text-[#8B0020]">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-xs uppercase font-black tracking-widest text-slate-700">Guía de Procedimiento para Ingreso Exitoso</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center gap-2 font-black text-[#8B0020] text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#8B0020] text-white flex items-center justify-center text-[10px] font-bold">A</span>
                    <span>Depósito de Tasa</span>
                  </div>
                  <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                    Realice el abono de S/.120 en cualquier agente del Banco de la Nación. Ingrese a la pestaña de pagos y registre el código numérico de operación que figura en su comprobante físico.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center gap-2 font-black text-[#8B0020] text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#8B0020] text-white flex items-center justify-center text-[10px] font-bold">B</span>
                    <span>Adjunte los 4 Requisitos</span>
                  </div>
                  <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                    Escanee de forma nítida en PDF su DNI, su Partida de Nacimiento, su Certificado secundario oficial, y suba su foto tamaño carné formal. Se validarán en un plazo estimado de 24 horas hábiles.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center gap-2 font-black text-[#8B0020] text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#8B0020] text-white flex items-center justify-center text-[10px] font-bold">C</span>
                    <span>Examen y Admisión</span>
                  </div>
                  <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                    Cuando sus requisitos físicos se validen, se le programará un aula de evaluación presencial. Tras rendir y aprobar el examen, se asignará su estado "Admitido" con su Constancia Oficial de Admisión.
                  </p>
                </div>
              </div>
            </div>
          </PageTransition>
        )}

        {/* TAB 2: DOCUMENTOS DE ADMISIÓN (REFORMA VISUAL REORGANIZADA Y DESPLEGABLE) */}
        {activeTab === "documentos" && (
          <PageTransition id="documentos" className="space-y-6">
            
            {/* Breadcrumb path */}
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Admisión 2026  &gt;  <span className="text-slate-600">Expediente de Admisión</span>
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

            {/* TOP ROW: 2 Cards side by side in 1 row (Progreso del Expediente + Instrucciones Importantes) */}
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
            <div className="space-y-4 pt-2">
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
                    {/* Image Upload results info if validado/pendiente */}
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

                    {/* Interactive Upload Dropzone */}
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
                    {/* Image Upload results info if validado/pendiente */}
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

                    {/* Interactive Upload Dropzone */}
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
                    {/* Image Upload results info if validado/pendiente */}
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

                    {/* Interactive Upload Dropzone */}
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
                    {/* Image Upload results info if validado/pendiente */}
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

                    {/* Interactive Upload Dropzone */}
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

            {/* BOTTOM SECTION: ¿Necesita ayuda? Card styled with high-end dark borgoña banner */}
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
        )}

        {/* TAB 3: PAGOS DE ADMISIÓN (REPLICATING SCREENSHOT 4 PERFECTLY) */}
        {activeTab === "pagos" && (
          <PageTransition id="pagos" className="space-y-6">
            
            {/* Breadcrumb path */}
            <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Admisión 2026  &gt;  <span className="text-slate-600">Estado de Pago</span>
            </div>

            {/* Title block */}
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-left">Estado de Pago</h2>
              <p className="text-xs text-slate-500 font-bold leading-none mt-1">Completa el pago del derecho de examen para habilitar tu inscripción definitiva.</p>
            </div>

            {/* Layout divided in 2 panels matching image 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left major column (Concept block + Voucher input simulator) */}
              <div className="lg:col-span-2 space-y-5">
                
                <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <span className="text-[9px] text-[#9F062A] font-black uppercase tracking-widest block leading-none">CONCEPTO DE PAGO</span>
                      <h3 className="text-base font-black text-slate-900 mt-2">Derecho de Examen Admisión 2026</h3>
                    </div>

                    {/* Dynamic status pill matching state */}
                    <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full inline-block ${
                      applicant.paymentStatus === "Validado" 
                        ? "bg-emerald-100 text-emerald-800"
                        : applicant.paymentStatus === "Pendiente"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : applicant.paymentStatus === "Observado"
                            ? "bg-red-50 text-red-700 font-extrabold border border-red-200"
                            : applicant.paymentStatus === "Rechazado"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-150 text-slate-500 font-semibold"
                    }`}>
                      {applicant.paymentStatus}
                    </span>
                  </div>

                  {/* Pricing amount visual exact match */}
                  <div className="my-6 border-b pb-5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono font-black">
                      S/. 120.00
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase">Monto Único Regular de Derechos</span>
                  </div>

                  {/* Operational Status Display and Form Submission */}
                  {applicant.paymentStatus === "Validado" ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-slate-750 text-xs text-left font-semibold">
                      <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-wide mb-1 leading-none">Pago Validado con Exito</p>
                      Su pago de derecho de admisión por S/. 120.00 ha sido aprobado de manera oficial. ¡Puede pasar a la siguiente etapa de admisión!
                    </div>
                  ) : applicant.paymentStatus === "Pendiente" ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-slate-700 text-xs text-left font-semibold space-y-3">
                      <p className="text-amber-800 font-bold uppercase text-[10px] tracking-wide mb-1 leading-none">Validación de Pago en Curso</p>
                      {applicant.paymentType === "voucher" || applicant.paymentVoucherUrl ? (
                        <div className="space-y-2">
                          <p>Comprobante adjuntado: <span className="font-mono font-black text-slate-900">{applicant.paymentVoucherFileName || "voucher_comprobante.jpg"}</span></p>
                          {applicant.paymentVoucherUrl && (
                            <div className="p-2 bg-white rounded border border-slate-200 inline-block">
                              <span className="text-[8px] text-slate-400 font-black block mb-1">Tu Voucher Enviado:</span>
                              <img 
                                src={applicant.paymentVoucherUrl} 
                                alt="Voucher depositado" 
                                className="max-h-24 object-contain rounded border border-slate-100" 
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>Su número de operación ingresado: <span className="font-mono font-bold text-slate-900">{applicant.paymentOperation || "No registrado"}</span></p>
                      )}
                      <p className="text-[11px] text-slate-600 font-medium leading-normal">La de oficina de Tesorería está verificando su comprobante. Por favor, espere a que su estado sea validado para registrarse al examen de admisión.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 font-bold text-xs text-slate-700">
                      {applicant.paymentStatus === "Observado" && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-slate-750 text-xs text-left font-semibold">
                          <p className="text-red-750 font-extrabold uppercase text-[10px] tracking-wide mb-1 leading-none">Operación Observada por Administración</p>
                          <span className="text-slate-600 block mt-1 leading-relaxed bg-white border border-red-100 p-2.5 rounded text-[11px]">
                            Observación enviada: "{applicant.paymentObservations || "Su comprobante de depósito no coincide con nuestros registros."}"
                          </span>
                          <span className="text-[11px] block text-red-800 font-bold mt-2">
                            Por favor complete nuevamente el comprobante o código de operación real para que sea evaluado de nuevo.
                          </span>
                        </div>
                      )}

                      {/* Submission form area of Screenshot 4 */}
                      <form onSubmit={handleSubmitPaymentVoucher} className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#9F062A] uppercase tracking-wider block mb-1">
                          Registrar Declaración de Pago
                        </h4>

                        {/* Interactive Toggle tabs */}
                        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setPaymentType("number")}
                            className={`py-1.5 px-3 rounded-md text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer text-center ${
                              paymentType === "number"
                                ? "bg-white text-[#9F062A] shadow-xs border border-slate-200"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            N° de Operación
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType("voucher")}
                            className={`py-1.5 px-3 rounded-md text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer text-center ${
                              paymentType === "voucher"
                                ? "bg-white text-[#9F062A] shadow-xs border border-slate-200"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Subir Foto de Voucher
                          </button>
                        </div>

                        {paymentType === "number" ? (
                          /* Numeric code entry physical field */
                          <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                            <div className="space-y-1 flex-1 w-full text-left">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Código de N° de Operación del Depósito</label>
                              <input 
                                type="text"
                                required
                                placeholder="Ej: BN-994102-S1"
                                value={paymentVoucher}
                                onChange={(e) => setPaymentVoucher(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#9F062A]"
                              />
                            </div>

                            <button 
                              type="submit"
                              className="bg-[#9F062A] hover:bg-[#800521] text-white px-6 py-2.5 rounded font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto h-[40px] mb-0.5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-300" />
                              <span>Enviar Operación</span>
                            </button>
                          </div>
                        ) : (
                          /* Voucher upload interface */
                          <div className="space-y-4 pt-2">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-50/50 hover:bg-slate-50 hover:border-[#9F062A]/40 transition-all text-center relative cursor-pointer">
                              <input
                                id="payment-voucher-file"
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setStagedVoucherFile(file.name);
                                  compressAndResizeImage(file, (compressedDataUrl) => {
                                    setStagedVoucherPreview(compressedDataUrl);
                                  });
                                }}
                              />
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">SELECCIONAR IMAGEN JPG O PNG</span>
                                <span className="text-[9px] text-slate-405 font-bold max-w-xs leading-normal block">
                                  {stagedVoucherFile ? `Seleccionado: ${stagedVoucherFile}` : "Haga clic o arrastre foto de su voucher de depósito aquí."}
                                </span>
                              </div>
                            </div>

                            {/* Live preview ONLY if actually loaded and present */}
                            {stagedVoucherPreview && (
                              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center animate-fade-in text-center">
                                <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-2">Vista Previa de Voucher Seleccionado:</span>
                                <img 
                                  src={stagedVoucherPreview} 
                                  alt="Preview voucher" 
                                  className="max-h-36 object-contain rounded border border-slate-300 shadow-sm" 
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStagedVoucherFile("");
                                    setStagedVoucherPreview("");
                                  }}
                                  className="mt-1.5 text-[8px] font-black uppercase text-red-700 tracking-wider hover:underline"
                                >
                                  Eliminar para Cambiar
                                </button>
                              </div>
                            )}

                            <button 
                              type="submit"
                              disabled={!stagedVoucherPreview}
                              className={`w-full py-2.5 px-6 rounded font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all text-center flex items-center justify-center gap-1.5 h-[40px] cursor-pointer ${
                                stagedVoucherPreview
                                  ? "bg-[#9F062A] hover:bg-[#800521] text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-amber-300" />
                              <span>Enviar Voucher de Pago</span>
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>

              </div>

              {/* R: SIDEBAR INFORMATION (REPLICATING SCREENSHOT 4 RIGHT SIDEBAR) */}
              <div className="space-y-6">
                
                {/* Methods block structure exact matching image 4 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm text-left">
                  <span className="text-[10px] font-black text-[#9F062A] uppercase tracking-wider block border-b pb-2 mb-3">
                    Métodos de Pago
                  </span>
                  
                  <div className="space-y-4 text-left">
                    {/* BCP BBVA detail */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center gap-2.5">
                      <Landmark className="w-5 h-5 text-[#9F062A] shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Transferencia</span>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">BCP, BBVA, Interbank y Scotiabank</p>
                      </div>
                    </div>

                    {/* Agentes detail */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center gap-2.5">
                      <Store className="w-5 h-5 text-[#9F062A] shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Ventanilla</span>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">Bancos y Agentes Autorizados</p>
                      </div>
                    </div>

                    {/* Yape Plin detail */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center gap-2.5">
                      <Smartphone className="w-5 h-5 text-[#9F062A] shrink-0" />
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">App Móvil</span>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">Yape y Plin mediante código QR</p>
                      </div>
                    </div>
                  </div>

                  {/* Warning label warning block matching bottom note on image 4 */}
                  <div className="mt-5 p-3.5 bg-amber-50 rounded text-slate-600 border border-amber-200 text-[10px] leading-relaxed text-left">
                    <p className="text-[#9F062A] font-black uppercase tracking-wider text-[9px] leading-tight mb-1">Nota Importante:</p>
                    <span className="font-semibold block text-slate-500">
                      Los pagos por transferencia interbancaria pueden demorar hasta 24 horas hábiles en ser validados por tesorería institucional académica.
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* BOTTOM TRANSACTION HISTORY LEDGER TABLE (REPLICATING SCREENSHOT 4 TABLE EXACTLY) */}
            <div className="bg-white rounded-xl border border-slate-200/95 shadow-sm overflow-hidden text-left">
              <div className="p-4 border-b bg-slate-50/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none">
                  Historial de Transacciones del Postulante
                </span>
                <p className="text-[9px] text-slate-400 font-extrabold mt-1">
                  * El pago inicial por Prospecto de Admisión se valida automáticamente por la Intranet Académica al registrar su cuenta virtual.
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-semibold border-collapse text-left text-slate-600">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 border-b text-[10px] font-extrabold uppercase">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Id Operación</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[11px] bg-white divide-slate-100">
                    {/* Row 1 matching image 4 */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">12/03/2026</td>
                      <td className="p-3 font-mono font-bold text-slate-800">#TRX-9921</td>
                      <td className="p-3 font-bold text-slate-900">Prospecto de Admision Regular</td>
                      <td className="p-3 text-slate-900 font-extrabold">S/. 30.00</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Validado
                        </span>
                      </td>
                      <td className="p-3">
                        <span 
                          onClick={() => triggerPreview("Recibo de Prospecto", "TRX-9921", "receipt", { 
                            amount: "S/. 30.00", 
                            concept: "Prospecto de Admision Regular", 
                            date: "12/03/2026", 
                            transactionId: "TRX-9921",
                            dni: applicant.dni,
                            studentName: applicant.name,
                            studentLastName: applicant.lastName
                          })}
                          className="text-[#9F062A] hover:underline font-bold cursor-pointer"
                        >
                          Ver Recibo
                        </span>
                      </td>
                    </tr>

                    {/* Row 2 dynamic matching image 4 */}
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500">{paymentDate}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {applicant.paymentStatus === "No Pagado" ? "Sin registrar" : (applicant.paymentOperation || "No registrado")}
                      </td>
                      <td className="p-3 font-bold text-slate-900">Derecho de Examen Ordinario 2026</td>
                      <td className="p-3 text-slate-900 font-extrabold">S/. 120.00</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          applicant.paymentStatus === "Validado"
                            ? "bg-emerald-100 text-emerald-800"
                            : applicant.paymentStatus === "Pendiente"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : applicant.paymentStatus === "Observado"
                                ? "bg-red-50 text-red-700 font-extrabold border border-red-200"
                                : applicant.paymentStatus === "Rechazado"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-slate-100 text-slate-400"
                        }`}>
                          {applicant.paymentStatus === "No Pagado" ? "Sin Enviar" : applicant.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {applicant.paymentStatus === "Validado" ? (
                          <span 
                            onClick={() => triggerPreview("Recibo de Examen de Admision", applicant.paymentOperation || "PRE-620323", "receipt", { 
                              amount: "S/. 120.00", 
                              concept: "Derecho de Examen Ordinario 2026", 
                              date: paymentDate, 
                              transactionId: applicant.paymentOperation,
                              dni: applicant.dni,
                              studentName: applicant.name,
                              studentLastName: applicant.lastName
                            })}
                            className="text-[#9F062A] hover:underline font-bold cursor-pointer"
                          >
                            Ver Recibo
                          </span>
                        ) : applicant.paymentStatus === "Observado" ? (
                          <span className="text-red-700 font-bold">Observado</span>
                        ) : applicant.paymentStatus === "No Pagado" ? (
                          <span className="text-slate-400 font-bold">Pendiente</span>
                        ) : (
                          <span className="text-slate-500 font-bold">En Revision</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </PageTransition>
        )}

        {/* TAB 4: RESULTADOS (REPLICATING SCREENSHOT 3 PERFECTLY - WITH ORDINARY EXAM FLOW) */}
        {activeTab === "resultados" && (
          <PageTransition id="resultados" className="space-y-6 text-left">
            
            {/* Conditional view depending of the candidate document approvals */}
            {isActuallyAdmitted ? (
              // CANDIDATE ADMITTED VIEW (REPLICATES SCREENSHOT 3 HIGHLY ACCURATELY)
              <>
                {/* 1. TOP GREEN NOTIFICATION BOX (MATCHES IMAGE 3 EXACTLY) */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3 text-emerald-900 shadow-sm animate-fade-in items-start">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-700" />
                  </span>
                  <div>
                    <span className="font-extrabold text-[12px] block text-emerald-950">
                      ¡Felicidades! Admisión Oficial Confirmada
                    </span>
                    <p className="text-[11px] text-emerald-800 font-bold mt-1 max-w-4xl">
                      Has alcanzado una vacante oficial tras culminar con éxito el proceso de evaluación presencial ordinaria. Tu condición académica actual es de **Admitido**. Proceda a verificar su información de ingreso y descargar su constancia correspondiente.
                    </p>
                  </div>
                </div>

                {/* 2. MAIN SPLIT INFO PANEL MATCHING IMAGE 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left Column (Admissions Certificate card details) */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    <div className="bg-white p-6 rounded-xl border border-slate-205 shadow-sm text-center relative overflow-hidden">
                      
                      {/* Subtitle element */}
                      <div className="flex justify-between items-center border-b pb-3 mb-6">
                        <span className="text-[10px] font-black tracking-widest text-[#9F062A] uppercase block">
                          INFORMACIÓN DE INGRESO OFICIAL SFA
                        </span>

                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest py-0.5 px-3 rounded-full">
                          CONFIRMADO
                        </span>
                      </div>

                      {/* Display grid for Place, Date, Hour & Modality */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold leading-relaxed text-left border-b pb-6 mb-6">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Fecha de Matrícula</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1 md:whitespace-nowrap">Lunes 16 al Viernes 20 de Marzo, 2026</span>
                            <span className="text-[9px] text-emerald-650 font-bold block mt-0.5 uppercase">Plazo Regular del Periodo</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shrink-0">
                            <Clock className="w-4 h-4 text-indigo-600" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Hora de Atención</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">08:30 AM - 01:30 PM</span>
                            <span className="text-[9px] text-indigo-650 font-bold block mt-0.5 uppercase">Lunes a Viernes</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center text-sm shrink-0">
                            <MapPin className="w-4 h-4 text-[#9F062A]" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Ubicación Física</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">Oficina de Admisión - Pabellón A</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase">Oficinas Administrativas</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0">
                            <Award className="w-4 h-4 text-amber-600" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Modalidad</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">Examen Ordinario Aprobado</span>
                            <span className="text-[9px] text-amber-650 font-bold block mt-0.5 uppercase">Vacante Ganada por Rendimiento</span>
                          </div>
                        </div>
                      </div>

                      {/* Large primary branding action button matching layout requirements list in Image 3 */}
                      <button 
                        onClick={() => {
                          setIsConstanciaModalOpen(true);
                        }}
                        className="w-full bg-[#9F062A] hover:bg-[#800521] text-white py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-1.5 transition-all scroll-smooth cursor-pointer leading-none"
                      >
                        <Download className="w-4 h-4 text-amber-350" />
                        <span>Descargar Constancia Oficial de Admisión</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-bold block mt-2.5">
                        Este documento es obligatorio para el ingreso al campus administrativo al momento de la matrícula presencial de ingresante.
                      </span>

                    </div>

                    {/* BLUE INFO BOX ON BOTTOM LEFT OF IMAGE 3 */}
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg flex gap-3 text-sky-905 text-left text-xs leading-relaxed">
                      <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <p className="text-[#2F6187] font-semibold text-[11px]">
                        <strong>Recordatorio de Admisión:</strong> Recuerde traer su DNI físico vigente y la constancia de ingreso e inscripción de matrícula impresa. El acceso de ventanillas administrativas cerrará puntualmente en las fechas asignadas de Matrícula.
                      </p>
                    </div>

                  </div>

                  {/* Right Column (TIMELINE OF STATS IN IMAGE 3) */}
                  <div className="space-y-6">
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm text-left">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b pb-2 mb-4">
                        Timeline del Proceso
                      </span>

                      {/* Timeline points matches image 3 bullets perfectly */}
                      <div className="space-y-5 text-slate-600 relative pl-4 border-l border-slate-100">
                        {/* Point 1 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Registro de Postulante</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Completado el {registrationDate}</span>
                        </div>

                        {/* Point 2 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Pago de Derechos (S/ 120)</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Validado el {paymentDate}</span>
                        </div>

                        {/* Point 3 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Validación de Expediente</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">
                            {applicant.folderStatus === "Approved" || applicant.folderStatus === "Enrolled" ? `Aprobado el ${folderApprovalDate} por Comité` : "Pendiente de Validación"}
                          </span>
                        </div>

                        {/* Point 4 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 animate-pulse border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Vacante Adjudicada / Examen Completo</span>
                          <span className="text-[9px] text-emerald-600 font-black uppercase leading-none mt-1 inline-block">Confirmado como Admitido</span>
                        </div>
                      </div>
                    </div>

                    {/* EXPLORE THE CAMPUS GRAPHIC BAR CARD (BOTTOM RIGHT CORNER MATCHING IMAGE 3) */}
                    <div className="rounded-xl border border-slate-202 bg-white shadow-sm overflow-hidden text-left relative flex flex-col justify-between group transition-shadow hover:shadow">
                      {/* Fake stylized graphics block */}
                      <div className="bg-slate-900/10 min-h-36 relative flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80" 
                          alt="Campus San Francisco"
                          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 opacity-80"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 pt-12 text-left">
                          <span className="text-white font-black text-xs block leading-tight">Explora el Campus</span>
                          <span className="text-slate-300 text-[9px] font-semibold mt-0.5 block leading-tight">Conoce nuestras instalaciones de primer nivel antes del inicio de clases.</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </>
            ) : applicant.admitted === "NO ADMITIDO" ? (
              // NO ADMITIDO SCREEN
              <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-xl text-center shadow-md my-12 space-y-5 animate-fade-in text-left">
                <span className="inline-flex p-3 bg-rose-50 rounded-full border border-rose-200 text-rose-600 my-2">
                  <XCircle className="w-10 h-10" />
                </span>
                
                <h3 className="text-lg font-black text-rose-700 uppercase">EVALUACIÓN DE ADMISIÓN: NO ADMITIDO</h3>
                
                <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-sm mx-auto text-center">
                  Estimado(a) postulante, su proceso de admisión para este ciclo ha concluido con la condición de <strong>NO ADMITIDO</strong>.
                </p>

                <div className="p-4 bg-slate-50 border rounded-lg text-xs text-slate-600 font-semibold leading-relaxed">
                  <p>Agradecemos sinceramente su participación en el proceso de admisión del IESTP San Francisco de Asís. Lo invitamos cordialmente a seguir preparándose para presentarse en nuestras futuras convocatorias académicas.</p>
                </div>
              </div>
            ) : (approvedCount === 4 && applicant.paymentStatus === "Validado") ? (
              // CANDIDATE APPROVED BUT NOT ADMITTED (APTO PARA EVALUACIÓN - WAITING/DUE EXAM)
              <>
                {/* 1. TOP INDIGO NOTIFICATION BOX */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex gap-3 text-indigo-900 shadow-sm animate-fade-in items-start">
                  <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-indigo-700" />
                  </span>
                  <div>
                    <span className="font-extrabold text-[12px] block text-indigo-950">
                      Expediente de Admisión Validado - Apto para Rendir el Examen
                    </span>
                    <p className="text-[11px] text-indigo-800 font-bold mt-1 max-w-4xl">
                      Tu expediente administrativo de documentos y el pago de tasa se encuentran estrictamente calificados como **VÁLIDOS**. Te encuentras formalmente APTO(A) para rendir el examen general de admisión presencial obligatorio.
                    </p>
                  </div>
                </div>

                {/* 2. MAIN SPLIT INFO PANEL (EXAM PROGRAM CARD) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left Column (Exam details layout) */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    <div className="bg-white p-6 rounded-xl border border-slate-205 shadow-sm text-center relative overflow-hidden">
                      
                      {/* Subtitle element */}
                      <div className="flex justify-between items-center border-b pb-3 mb-6">
                        <span className="text-[10px] font-black tracking-widest text-[#9F062A] uppercase block">
                          INFORMACIÓN DEL EXAMEN DE ADMISIÓN
                        </span>

                        <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-widest py-0.5 px-3 rounded-full">
                          AULA ASIGNADA
                        </span>
                      </div>

                      {/* Display grid for Place, Date, Hour & Modality */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold leading-relaxed text-left border-b pb-6 mb-6">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm shrink-0">
                            <Calendar className="w-4 h-4 text-amber-600" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Fecha del Examen</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">Domingo, 15 de Marzo de 2026</span>
                            <span className="text-[9px] text-amber-650 font-bold block mt-0.5 uppercase">Evaluación General Presencial</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                            <Clock className="w-4 h-4 text-emerald-600" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Hora del Examen</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">08:30 AM (Ingreso al Campus)</span>
                            <span className="text-[9px] text-emerald-650 font-bold block mt-0.5 uppercase">Tolerancia Máxima 15 Minutos</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shrink-0">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Ubicación / Aula Física</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">
                              {applicant.examClassroom ? `Aula ${applicant.examClassroom}` : "No Asignado de forma definitiva"}
                            </span>
                            <span className="text-[9px] text-indigo-650 font-bold block mt-0.5 uppercase">
                              {applicant.examClassroom ? "Pabellón Académico Designado" : "Pendiente de Asignación por Secretaría"}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center text-sm shrink-0">
                            <FileText className="w-4 h-4 text-[#9F062A]" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Modalidad</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">Examen de Admisión Ordinario</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase">Admisión General Obligatoria</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Notice card explaining they cannot download certificate yet */}
                      <div className="p-4 bg-[#FAF7EE] border border-[#D5A023]/25 rounded-lg text-xs leading-relaxed text-slate-700 font-bold flex gap-2.5 text-left items-start">
                        <AlertTriangle className="w-4 h-4 text-[#CFA020] shrink-0 mt-0.5" />
                        <div className="text-[11px] text-slate-750 font-semibold">
                          <strong>Constancia de Admisión bloqueada temporalmente:</strong> No se cuenta con una vacante adjudicada previamente. Una vez que asista y rinda satisfactoriamente la evaluación presencial general en su aula reservada, secretaría registrará sus notas calificadas para habilitar el egreso definitivo de su Constancia Digital oficial.
                        </div>
                      </div>

                    </div>

                    {/* RECOMMENDATIONS BOX */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-left">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-blue-800 font-semibold text-[11px] leading-relaxed">
                        <strong>Requerimientos obligatorios para examen:</strong> Es mandatorio portar su DNI físico vigente, su lápiz 2B de carbón, un borrador limpio y el comprobante físico del pago impreso para poder acceder a las instalaciones del campus.
                      </p>
                    </div>

                  </div>

                  {/* Right Column (TIMELINE OF STATS IN REQ COMPLETED STAGE) */}
                  <div className="space-y-6">
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm text-left">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b pb-2 mb-4">
                        Timeline del Proceso
                      </span>

                      {/* Timeline points matches bullets perfectly */}
                      <div className="space-y-5 text-slate-600 relative pl-4 border-l border-slate-100">
                        {/* Point 1 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Registro de Postulante</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Completado el {registrationDate}</span>
                        </div>

                        {/* Point 2 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Pago de Derechos (S/ 120)</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Validado el {paymentDate}</span>
                        </div>

                        {/* Point 3 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Validación de Expediente</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">
                            {applicant.folderStatus === "Approved" || applicant.folderStatus === "Enrolled" ? `Aprobado el ${folderApprovalDate} por Comité` : "Pendiente de Validación"}
                          </span>
                        </div>

                        {/* Point 4 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-amber-500 animate-pulse border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Rendir Examen de Admisión</span>
                          <span className="text-[9px] text-amber-600 font-extrabold uppercase leading-none mt-1 inline-block">Aula Asignada / Programado</span>
                        </div>
                      </div>
                    </div>

                    {/* EXPLORE THE CAMPUS GRAPHIC BAR CARD */}
                    <div className="rounded-xl border border-slate-202 bg-white shadow-sm overflow-hidden text-left relative flex flex-col justify-between group transition-shadow hover:shadow">
                      <div className="bg-slate-900/10 min-h-36 relative flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80" 
                          alt="Campus San Francisco"
                          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 opacity-80"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 pt-12 text-left">
                          <span className="text-white font-black text-xs block leading-tight">Explora el Campus</span>
                          <span className="text-slate-300 text-[9px] font-semibold mt-0.5 block leading-tight">Conoce nuestras instalaciones de primer nivel antes del inicio de clases.</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </>
            ) : (
              // NON-APPROVED EXPEDIENTE SCREEN (STILL WAITING TO BE FULLY APPROVED)
              <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-xl text-center shadow-md my-12 space-y-5">
                <span className="inline-flex p-3 bg-amber-50 rounded-full border border-amber-200 text-amber-600 my-2 animate-bounce">
                  <Clock className="w-10 h-10" />
                </span>
                
                <h3 className="text-lg font-black text-slate-950 uppercase">Expediente en Fase de Evaluación</h3>
                
                <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">
                  Sus requisitos de expediente de admisión y pago de tasa se encuentran en fase de validación administrativa por secretaría. 
                </p>

                <div className="p-4 bg-slate-50 border rounded-lg text-left text-xs text-slate-600 font-semibold leading-relaxed space-y-2.5">
                  <span className="text-[10px] text-[#9F062A] tracking-wider uppercase block font-black leading-none">REQUISITOS PENDIENTES DE VALIDACIÓN:</span>
                  <p>• Derecho de Admisión S/. 120: <span className="font-extrabold text-slate-900">{applicant.paymentStatus === "Validado" ? "✓ Aprobado" : applicant.paymentStatus === "Pendiente" ? "En revisión por secretaría" : "No registrado aún"}</span></p>
                  <p>• Expediente de Documentos: <span className="font-extrabold text-slate-900">{globalProgressPercentage === 100 ? "✓ Completo" : `${globalProgressPercentage}% completado (${approvedCount} de 4 validados)`}</span></p>
                </div>

                <div className="pt-4 border-t text-left">
                  <p className="text-[10px] text-slate-500 font-medium leading-normal bg-slate-50 border border-slate-200 p-3 rounded flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Siguiente Paso:</strong> Una vez validados todos sus documentos y el pago por secretaría académica, se habilitará la asignación de su aula para que rinda el examen presencial correspondiente para adjudicarse su vacante oficial.</span>
                  </p>
                </div>
              </div>
            )}

          </PageTransition>
        )}

        {/* TAB: PAGO DE MATRÍCULA (INGRESANTES) */}
        {activeTab === "matricula" && (
          <PageTransition id="matricula" className="max-w-6xl mx-auto space-y-6 text-left animate-fade-in">
            {(() => {
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
              );
            })()}
          </PageTransition>
        )}

        {/* TAB 5: SOPORTE DE ADMISIÓN */}
        {activeTab === "soporte" && (
          <PageTransition id="soporte" className="max-w-6xl mx-auto space-y-6 text-left animate-fade-in">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
              <h2 className="text-lg font-black text-slate-900 border-b pb-2 mb-4 font-display flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#9F062A]" /> Centro de Soporte Técnico y Atención
              </h2>
              <p className="text-xs text-slate-500 font-bold mb-6">¿Tiene dudas o inconvenientes con su inscripción, pago o validación de requisitos? Envíe su consulta para recibir asistencia directa de la Secretaría Académica.</p>

              {/* Grid 2 Columns for Form (Left) & Chat History (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COL: Send Support Message Form */}
                <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r pb-6 lg:pb-0 lg:pr-6 border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Nueva Consulta</span>
                  
                  <form 
                    onSubmit={(e) => { 
                      e.preventDefault(); 
                      if (!supportMessage.trim()) return;
                      const newMsg = {
                        id: "msg_" + Date.now(),
                        sender: "postulante" as any,
                        category: supportCategory,
                        text: supportMessage.trim(),
                        date: new Date().toLocaleDateString("es-PE")
                      };
                      const updated = {
                        ...applicant,
                        supportMessages: [...(applicant.supportMessages || []), newMsg]
                      };
                      onUpdateApplicant(updated);
                      setSupportMessage("");
                    }} 
                    className="space-y-4 text-xs font-bold text-slate-700"
                  >
                    <div className="grid grid-cols-1 gap-3.5">
                      <div>
                        <label className="block uppercase text-slate-400 text-[10px] mb-1">Nombre Completo</label>
                        <input type="text" disabled value={`${applicant.name} ${applicant.lastName}`} className="w-full bg-slate-100 px-3 py-2 border rounded text-slate-500 font-bold" />
                      </div>
                      <div>
                        <label className="block uppercase text-slate-400 text-[10px] mb-1">Teléfono Móvil de Contacto</label>
                        <input type="text" value={applicant.phone} disabled className="w-full bg-slate-100 px-3 py-2 border rounded text-slate-500 font-bold" />
                      </div>
                    </div>

                    <div>
                      <label className="block uppercase text-slate-400 text-[10px] mb-1">Categoría del Reclamo Técnico</label>
                      <select 
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-xs focus:outline-hidden"
                      >
                        <option>Dificultad con el formato o visualización del PDF</option>
                        <option>El voucher físico no se registra en la base de datos bancaria</option>
                        <option>Observación en mi Partida de Nacimiento sin justificación médica</option>
                        <option>Otro trámite regular</option>
                      </select>
                    </div>

                    <div>
                      <label className="block uppercase text-slate-400 text-[10px] mb-1">Detalle del Mensaje o Dificultad</label>
                      <textarea 
                        required
                        rows={5} 
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Describa de manera detallada las dificultades técnicas de su trámite de admisión para recibir asistencia..." 
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-xs focus:outline-hidden"
                      ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button 
                        type="submit"
                        className="w-full bg-[#9F062A] hover:bg-[#800521] text-white py-2.5 px-6 rounded font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all cursor-pointer text-center"
                      >
                        Enviar Mensaje a Secretaría
                      </button>
                    </div>
                  </form>
                </div>

                {/* RIGHT COL: Conversational Chat History */}
                <div className="lg:col-span-7 flex flex-col h-full space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Historial de Conversación (Mesa de Partes)</span>
                  
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 h-[380px] overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
                    {(!applicant.supportMessages || applicant.supportMessages.length === 0) ? (
                      <div className="text-center py-16 text-xs text-slate-400 font-semibold leading-relaxed my-auto flex flex-col items-center justify-center gap-2">
                        <HelpIcon className="w-8 h-8 text-slate-300" />
                        <span>No se han registrado mensajes previos. Use el formulario de la izquierda para enviar su consulta técnica a la institución.</span>
                      </div>
                    ) : (
                      applicant.supportMessages.map((msg: any) => (
                        <div key={msg.id} className={`flex flex-col mb-1.5 ${msg.sender === "postulante" ? "items-end" : "items-start"}`}>
                          <div className={`p-3 rounded-lg max-w-sm sm:max-w-md text-xs font-semibold leading-normal shadow-xs text-left ${
                            msg.sender === "postulante" 
                              ? "bg-[#9F062A] text-white rounded-br-none" 
                              : "bg-white border border-slate-300 text-slate-800 rounded-bl-none"
                          }`}>
                            {msg.category && (
                              <span className={`block text-[8px] font-black uppercase tracking-wider mb-1 ${
                                msg.sender === "postulante" ? "text-red-200" : "text-[#9F062A]"
                              }`}>
                                Categoría: {msg.category}
                              </span>
                            )}
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </div>
                          <span className="text-[8px] text-slate-400 font-black block mt-1 tracking-wide uppercase">
                            {msg.sender === "postulante" ? `Usted - ${msg.date}` : `Mesa de Partes - ${msg.date}`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </PageTransition>
        )}

      </main>

      {/* CONSTANCIA DE INGRESO DIRECTO MODEL MODAL COHORT */}
      {isConstanciaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-250 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            
            {/* Modal Header Bar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#9F062A]">
                <Award className="w-5 h-5 shrink-0" />
                <span className="font-extrabold text-xs uppercase tracking-widest text-slate-800">
                  Constancia Digital de Admisión - Código {applicant.dni}
                </span>
              </div>
              <button 
                onClick={() => setIsConstanciaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Print Area Wrapper */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100/50 custom-scrollbar id-print-container">
              
              {/* Document Certificate Frame */}
              <div 
                id="constancia-print-card" 
                className="bg-stone-50 border-[6px] border-double border-[#9F062A] p-8 max-w-xl mx-auto shadow-sm relative overflow-hidden rounded-md text-slate-900 font-sans print:m-0 print:border-0 print:bg-white print:p-0"
              >
                
                {/* Gold Crest Decal Header */}
                <div className="border-b-[3px] border-amber-500 pb-3 mb-6 text-center">
                  <div className="text-amber-600 text-center flex justify-center gap-1.5 font-bold uppercase tracking-widest text-[9px] mb-1.5">
                    <span>MINISTERIO DE EDUCACIÓN DEL PERÚ</span>
                  </div>
                  <h1 className="text-[13px] font-black text-slate-900 uppercase tracking-wider mb-0.5 leading-none">
                    INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO
                  </h1>
                  <h2 className="text-[15px] font-black text-[#9F062A] uppercase tracking-widest leading-normal">
                    "SAN FRANCISCO DE ASÍS"
                  </h2>
                  <span className="text-[8px] font-bold text-slate-400 block tracking-wider uppercase mt-1">
                    R.M. N° 0233-80-ED • CHINCHA • ICA - PERÚ
                  </span>
                </div>

                {/* Subtile Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <span className="text-[130px] font-black text-[#9F062A] border-8 border-current rounded-full p-4 tracking-tighter leading-none select-none">
                    SFA
                  </span>
                </div>

                {/* Document Main Heading */}
                <div className="text-center my-6">
                  <span className="inline-block bg-[#9F062A]/5 text-[#9F062A] border border-[#9F062A]/25 rounded-md px-4 py-1.5 font-black text-[13px] tracking-widest uppercase">
                    CONSTANCIA OFICIAL DE ADMISIÓN
                  </span>
                  <span className="text-[10px] font-mono font-bold block mt-3 text-slate-500">
                    REGISTRO N° C.O.A - 2026-{applicant.dni}
                  </span>
                </div>

                {/* Body details */}
                <div className="space-y-4 text-[11px] leading-relaxed text-slate-800 text-left font-sans font-medium">
                  <p>
                    La Comisión de Admisión General de Directivos del Instituto de Educación Superior Tecnológico Público 
                    <strong> "San Francisco de Asís" </strong>, mediante las facultades otorgadas por el Ministerio de Educación, hace constar oficialmente que:
                  </p>

                  {/* Recipient Card Block */}
                  <div className="bg-white border text-left border-dashed border-slate-350 rounded-lg p-4 my-2.5 space-y-1.5 shadow-3xs">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 uppercase font-bold text-[8.5px]">Postulante:</span>
                      <span className="col-span-2 text-slate-900 font-extrabold uppercase text-[11px]">
                        {applicant.lastName}, {applicant.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 uppercase font-bold text-[8.5px]">DOCUMENTO DNI:</span>
                      <span className="col-span-2 font-mono font-bold text-[#9F062A] text-[11px]">
                        {applicant.dni}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 uppercase font-bold text-[8.5px]">ESPECIALIDAD:</span>
                      <span className="col-span-2 text-slate-900 font-extrabold uppercase text-[11px]">
                        {applicant.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-slate-400 uppercase font-bold text-[8.5px]">MODALIDAD:</span>
                      <span className="col-span-2 text-slate-900 font-black text-[10px] uppercase tracking-wide">
                        Ingreso Ordinario por Examen de Admisión
                      </span>
                    </div>
                  </div>

                  <p>
                    Ha alcanzado una vacante de estudios definitiva por cumplir con la entrega de todos sus requisitos indispensables y la tasa de postulación exonerada/validada. Encontrándose con la condición oficial de 
                    <span className="text-emerald-700 font-black"> ADMITIDO(A) </span> e inscrito(a) en el período académico de ingreso general 2026-I.
                  </p>

                  <p>
                    Se expide la presente constancia para los fines de trámite oficial e ingreso físico para la Matrícula Presencial de Ingresante.
                  </p>
                </div>

                {/* Seal decoratives */}
                <div className="grid grid-cols-12 gap-2 mt-8 pt-4 items-end justify-between border-t border-slate-200">
                  {/* Left QR details code */}
                  <div className="col-span-4 text-left font-sans">
                    <div className="w-16 h-16 bg-white border border-slate-200 p-1 rounded-sm shadow-3xs flex items-center justify-center">
                      {/* Generar un mock de QR Code visualmente precioso */}
                      <div className="grid grid-cols-5 gap-[2px] w-full h-full bg-slate-100 p-0.5">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-full h-full rounded-[1px] ${
                              (i % 2 === 0 && i !== 12) || i === 0 || i === 4 || i === 20 || i === 24 ? "bg-slate-900" : "bg-white"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[7.5px] font-mono font-bold block text-slate-400 mt-1 uppercase">
                      Verificación SFA-SEC
                    </span>
                  </div>

                  {/* Stamp 1 */}
                  <div className="col-span-4 text-center pb-1">
                    <div className="inline-block relative">
                      {/* Fake Signature */}
                      <span className="font-serif italic text-blue-800 opacity-90 text-[11.5px] -rotate-6 transform block select-none -mb-1">
                        Lic. Rosa Ramos P.
                      </span>
                      <div className="border-t border-slate-400 text-[7px] font-black tracking-wide text-slate-500 uppercase pt-1">
                        JEFATURA DE ADMISIÓN
                      </div>
                      <div className="absolute inset-0 border-2 border-blue-500/20 text-blue-500/20 text-[6px] font-sans rounded-full -rotate-12 translate-x-2 -translate-y-2 p-0.5 pointer-events-none select-none uppercase">
                        IESTP "SFA" CHINCHA
                      </div>
                    </div>
                  </div>

                  {/* Stamp 2 */}
                  <div className="col-span-4 text-center pb-1">
                    <div className="inline-block relative">
                      {/* Fake Signature 2 */}
                      <span className="font-serif italic text-blue-800 opacity-90 text-[11.5px] -rotate-3 transform block select-none -mb-1">
                        Dr. Ricardo Mendoza V.
                      </span>
                      <div className="border-t border-slate-400 text-[7px] font-black tracking-wide text-slate-500 uppercase pt-1">
                        DIRECCIÓN GENERAL
                      </div>
                      {/* Round blue seal stamp */}
                      <div className="absolute inset-x-0 -top-5 mx-auto border border-blue-700/60 text-blue-700/60 font-black text-[5px] rounded-full flex flex-col justify-center items-center w-8 h-8 rotate-12 bg-white/20 select-none pointer-events-none">
                        <span className="scale-[0.8] leading-none uppercase">SFA</span>
                        <span className="scale-[0.6] leading-none uppercase">CHINCHA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                  CON CARÁCTER DE DECLARACIÓN JURADA INSTITUCIONAL • VALIDEZ FISICA E INFORMÁTICA
                </div>

              </div>

            </div>

            {/* Modal Bottom toolbar buttons */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex flex-wrap gap-2.5 items-center justify-between text-xs font-bold text-slate-700">
              <span className="text-[10px] text-[#2F6187] font-semibold flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Sugerencia: Imprima el documento para presentarlo en ventanilla.</span>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConstanciaModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-650 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
                >
                  Cerrar
                </button>
                
                {/* Print button */}
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById("constancia-print-card")?.innerHTML;
                    if (!printContents) return;
                    
                    // Create simple helper to open a popup and trigger print or do a clean print
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Constancia Oficial de Admisión - SFA 2026</title>
                            <style>
                              body { font-family: system-ui, -apple-system, sans-serif; background-color: white; padding: 40px; display: flex; justify-content: center; }
                              #constancia { border: 6px double #9F062A; padding: 40px; max-width: 600px; background-color: #fafaf9; position: relative; }
                              ul, li { list-style: none; }
                              .grid { display: grid; }
                              .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
                              .col-span-4 { grid-column: span 4 / span 4; }
                              .text-center { text-align: center; }
                              .text-left { text-align: left; }
                              .border-b { border-bottom: 2px solid #f59e0b; }
                              .border-t { border-top: 1px solid #cbd5e1; }
                              .bg-white { background-color: white; }
                              .border { border: 1px solid #cbd5e1; }
                              .rounded-lg { border-radius: 8px; }
                              .p-4 { padding: 16px; }
                              .font-black { font-weight: 900; }
                              .font-bold { font-weight: 700; }
                              .text-xs { font-size: 11px; }
                              .uppercase { text-transform: uppercase; }
                              .text-[13px] { font-size: 13px; }
                              .text-[15px] { font-size: 15px; color: #9F062A; }
                              .text-[#9F062A] { color: #9F062A; }
                              .text-slate-900 { color: #0f172a; }
                              .text-slate-400 { color: #94a3b8; }
                              .text-slate-500 { color: #64748b; }
                              .mt-1 { margin-top: 4px; }
                              .mb-1 { margin-bottom: 4px; }
                              .leading-none { line-height: 1; }
                              .leading-normal { leading: 1.5; }
                              .inline-block { display: inline-block; }
                              .bg-\\[\\#9F062A\\]\\/5 { background-color: rgba(159, 6, 42, 0.05); }
                              .font-mono { font-family: monospace; }
                              .mt-3 { margin-top: 12px; }
                              .space-y-4 > * + * { margin-top: 16px; }
                              .text-emerald-700 { color: #047857; }
                              .flex { display: flex; }
                              .justify-center { justify-content: center; }
                              .items-end { align-items: flex-end; }
                              .justify-between { justify-content: space-between; }
                              .w-16 { width: 64px; }
                              .h-16 { height: 64px; }
                              .p-1 { padding: 4px; }
                              .rounded-sm { border-radius: 2px; }
                              .shadow-3xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                              .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
                              .gap-\\[2px\\] { gap: 2px; }
                              .bg-slate-100 { background-color: #f1f5f9; }
                              .bg-slate-900 { background-color: #0f172a; }
                              .w-full { width: 100%; }
                              .h-full { height: 100%; }
                              .relative { position: relative; }
                              .italic { font-style: italic; }
                              .text-blue-800 { color: #1e40af; }
                              .text-\\[11\\.5px\\] { font-size: 11.5px; }
                              .pt-1 { padding-top: 4px; }
                              .tracking-wide { tracking: 0.025em; }
                              .absolute { position: absolute; }
                              .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
                              .opacity-\\[0\\.03\\] { opacity: 0.03; }
                              .text-\\[130px\\] { font-size: 130px; }
                              .border-8 { border-width: 8px; }
                              .col-span-2 { grid-column: span 2 / span 2; }
                              .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                              .gap-2 { gap: 8px; }
                              .bg-stone-50 { background-color: #fafaf9; }
                            </style>
                          </head>
                          <body>
                            <div id="constancia">${printContents}</div>
                            <script>
                              window.onload = function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 500);
                              }
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    } else {
                      // Fallback
                      window.print();
                    }
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-semibold cursor-pointer text-xs flex items-center gap-1"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>Imprimir</span>
                </button>

                {/* Simulated Download button with feedback */}
                <button
                  type="button"
                  onClick={() => {
                    const btn = document.getElementById("download-constancia-btn");
                    if (btn) btn.innerText = "Firmando digitalmente...";
                    
                    setTimeout(() => {
                      if (btn) btn.innerText = "Descargando...";
                      
                      setTimeout(() => {
                        if (btn) btn.innerText = "¡Descargado con éxito!";
                        
                        // Perform client-side data url download of a mock text file styled nicely or triggering standard prompt
                        const textContent = `
========================================
MINISTERIO DE EDUCACIÓN EN EL PERÚ
IESTP "SAN FRANCISCO DE ASÍS" - CHINCHA
R.M. N° 0233-80-ED • ICA - PERÚ
========================================

CONSTANCIA OFICIAL DE ADMISIÓN DIGITAL
N° C.O.A - 2026-${applicant.dni}

POSTULANTE: ${applicant.lastName}, ${applicant.name}
DOCUMENTO DNI: ${applicant.dni}
CARRERA PROFESIONAL: ${applicant.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
MODALIDAD DE INGRESO: Ingreso Ordinario por Examen de Admisión
ESTADO DE MATRÍCULA: APTO / ADMITIDO

--------------------------------------------------
Este documento acredita haber obtenido una vacante
de estudios en el IESTP "San Francisco de Asís"
por el canal de Admisión Ordinaria Directa.
Documento Oficial firmado digitilmente.
Proceso 2026-I • Chincha Alta, Perú.
========================================
                        `;
                        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `Constancia_Admision_SFA_${applicant.dni}.txt`;
                        link.click();
                        
                        setTimeout(() => {
                          if (btn) btn.innerText = "Descargar Constancia Oficial";
                          setIsConstanciaModalOpen(false);
                          alert(`¡Constancia de Admisión guardada como 'Constancia_Admision_SFA_${applicant.dni}.txt'!`);
                        }, 1000);
                        
                      }, 1200);
                    }, 1200);
                  }}
                  id="download-constancia-btn"
                  className="px-4 py-2 bg-[#9F062A] text-white rounded-lg hover:bg-[#800521] font-semibold cursor-pointer text-xs flex items-center gap-1"
                >
                  <Download className="w-4 h-4 text-red-200" />
                  <span>Descargar Constancia Oficial</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE PREVISUALIZACIÓN Y CONFIRMACIÓN DE CARGA DE DOCUMENTO */}
      <AnimatePresence>
        {stagedUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-[#5C0015] to-[#8B0020] text-white p-5 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white leading-tight uppercase tracking-wider">
                      Previsualizar y Confirmar Documento
                    </h3>
                    <p className="text-[10px] text-slate-200 font-medium">Verifique la nitidez antes de enviarlo a secretaría</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleCancelUploadModal}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* File Metadata Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#8B0020] font-black uppercase tracking-wider block">
                      {stagedUploadModal.docTitle}
                    </span>
                    <span className="font-mono font-bold text-slate-700 block truncate max-w-[240px] mt-0.5">
                      {stagedUploadModal.fileName}
                    </span>
                  </div>

                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full uppercase tracking-wider shrink-0">
                    Imagen Capturada
                  </span>
                </div>

                {/* Large Crisp Image Preview Window */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Vista Previa de Imagen:
                  </span>
                  <div className="bg-slate-900/5 border border-slate-200 rounded-xl p-3 flex justify-center items-center max-h-72 overflow-hidden shadow-inner">
                    <img 
                      src={stagedUploadModal.fileDataUrl} 
                      alt="Previsualización de documento" 
                      className="max-h-64 object-contain rounded-lg shadow-md border border-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-semibold flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Asegúrese de que el documento sea legible y sin reflejos. Al confirmar, quedará registrado para revisión del comité de admisiones.
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={handleCancelUploadModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    const inputId = stagedUploadModal.docKey === "dniFile" 
                      ? "file-input-dni" 
                      : stagedUploadModal.docKey === "certificadoFile" 
                        ? "file-input-cert" 
                        : stagedUploadModal.docKey === "partidaFile" 
                          ? "file-input-partida" 
                          : "file-input-foto";
                    handleCancelUploadModal();
                    setTimeout(() => {
                      document.getElementById(inputId)?.click();
                    }, 100);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-[#8B0020] font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Elegir Otra Foto
                </button>

                <button 
                  type="button"
                  onClick={handleConfirmUploadModal}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0020] hover:bg-[#6e0019] text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Guardar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render High Fidelity Image of Document Preview Component */}
      <ImagePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        fileName={previewFileName}
        fileType={previewFileType}
        metadata={previewMetadata}
      />

    </div>
  );
}
