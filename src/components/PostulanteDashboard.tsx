import React, { useState, useEffect } from "react";
import { 
  FileText, CreditCard, Award, HelpCircle, Upload, LogOut, ArrowRight, CheckCircle2, 
  XCircle, Clock, ChevronRight, Download, RefreshCw, AlertTriangle, Play, HelpCircle as HelpIcon,
  ChevronLeft, ArrowLeft, Terminal, LayoutDashboard, Compass, Info, CheckSquare, Settings
} from "lucide-react";
import { Applicant, ProgramId } from "@/types";
import { ACADEMIC_PROGRAMS } from "@/lib/mockData";
import { motion, AnimatePresence } from "motion/react";

// Reusable Custom Design System Components
import Button from "./ui-custom/Button";
import Badge from "./ui-custom/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui-custom/Card";
import PageHeader from "./ui-custom/PageHeader";
import AlertBox from "./ui-custom/AlertBox";
import Sidebar from "./ui-custom/Sidebar";
import PageTransition from "./ui-custom/PageTransition";
import ImagePreviewModal from "./ui-custom/ImagePreviewModal";

interface PostulanteDashboardProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
  onLogout: () => void;
}

export default function PostulanteDashboard({ applicant, onUpdateApplicant, onLogout }: PostulanteDashboardProps) {
  // Navigation tabs matching screenshots: Documentos de Admisión, Pagos, Resultados, Soporte, Dashboard
  const [activeTab, setActiveTab] = useState<"dashboard" | "documentos" | "pagos" | "resultados" | "soporte">("dashboard");
  const [showSimConsole, setShowSimConsole] = useState(false);
  
  // Custom states for interactive simulation upload files
  const [uploadedDniFile, setUploadedDniFile] = useState(applicant.docs?.dniFile?.fileName || "");
  const [uploadedCertificadoFile, setUploadedCertificadoFile] = useState(applicant.docs?.certificadoFile?.fileName || "");
  const [uploadedPartidaFile, setUploadedPartidaFile] = useState(applicant.docs?.partidaFile?.fileName || "");
  const [uploadedFotoFile, setUploadedFotoFile] = useState(applicant.docs?.fotoFile?.fileName || "");
  const [paymentVoucher, setPaymentVoucher] = useState(applicant.paymentOperation || "");

  // Local staged files and image preview URLs
  const [stagedDniFile, setStagedDniFile] = useState<string>("");
  const [stagedDniPreview, setStagedDniPreview] = useState<string>("");

  const [stagedCertFile, setStagedCertFile] = useState<string>("");
  const [stagedCertPreview, setStagedCertPreview] = useState<string>("");

  const [stagedPartidaFile, setStagedPartidaFile] = useState<string>("");
  const [stagedPartidaPreview, setStagedPartidaPreview] = useState<string>("");

  const [stagedFotoFile, setStagedFotoFile] = useState<string>("");
  const [stagedFotoPreview, setStagedFotoPreview] = useState<string>("");

  // Image preview modal states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileType, setPreviewFileType] = useState<"image" | "receipt">("image");
  const [previewMetadata, setPreviewMetadata] = useState<any>({});

  // Support inputs state
  const [supportCategory, setSupportCategory] = useState("Dificultad con el formato o visualizacion del PDF");
  const [supportMessage, setSupportMessage] = useState("");

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
      date: "15/03/2026",
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

  // Helper function to handle image selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (docKey === "dniFile") {
        setStagedDniFile(fileName);
        setStagedDniPreview(dataUrl);
      } else if (docKey === "certificadoFile") {
        setStagedCertFile(fileName);
        setStagedCertPreview(dataUrl);
      } else if (docKey === "partidaFile") {
        setStagedPartidaFile(fileName);
        setStagedPartidaPreview(dataUrl);
      } else if (docKey === "fotoFile") {
        setStagedFotoFile(fileName);
        setStagedFotoPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
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
      setUploadedDniFile(filename);
      setStagedDniFile("");
    } else if (docKey === "certificadoFile") {
      filename = stagedCertFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para el Certificado de Secundaria primero.");
        return;
      }
      setUploadedCertificadoFile(filename);
      setStagedCertFile("");
    } else if (docKey === "partidaFile") {
      filename = stagedPartidaFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Partida de Nacimiento primero.");
        return;
      }
      setUploadedPartidaFile(filename);
      setStagedPartidaFile("");
    } else if (docKey === "fotoFile") {
      filename = stagedFotoFile;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Foto primero.");
        return;
      }
      setUploadedFotoFile(filename);
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
    if (!paymentVoucher.trim()) {
      alert("Ingrese un número de operación bancario correcto.");
      return;
    }
    const updated = {
      ...applicant,
      paymentStatus: "Pendiente" as const,
      paymentOperation: paymentVoucher,
      paymentObservations: ""
    };
    onUpdateApplicant(updated);
    alert(`Comprobante de pago S/. 120.00 enviado para validación institucional de derecho de admisión.`);
  };

  // Quick helper simulation presets from console
  const setSimPreset = (type: "new" | "pending_docs" | "observed" | "all_approved") => {
    let updated: Applicant;

    if (type === "new") {
      updated = {
        ...applicant,
        paymentStatus: "No Pagado",
        paymentOperation: "",
        admitted: false,
        docs: {
          dniFile: { status: "No Enviado" },
          certificadoFile: { status: "No Enviado" },
          partidaFile: { status: "No Enviado" },
          fotoFile: { status: "No Enviado" }
        }
      };
      setUploadedDniFile("");
      setUploadedCertificadoFile("");
      setUploadedPartidaFile("");
      setUploadedFotoFile("");
      setPaymentVoucher("");
    } else if (type === "pending_docs") {
      updated = {
        ...applicant,
        paymentStatus: "Validado",
        paymentOperation: "OP-998241",
        admitted: false,
        docs: {
          dniFile: { status: "Pendiente", fileName: "dni_anverso_reverso.pdf" },
          certificadoFile: { status: "Validado", fileName: "certificado_secundaria_regular.pdf" },
          partidaFile: { status: "Pendiente", fileName: "partida_nacimiento_fiel.pdf" },
          fotoFile: { status: "No Enviado" }
        }
      };
      setUploadedDniFile("dni_anverso_reverso.pdf");
      setUploadedCertificadoFile("certificado_secundaria_regular.pdf");
      setUploadedPartidaFile("partida_nacimiento_fiel.pdf");
      setUploadedFotoFile("");
      setPaymentVoucher("OP-998241");
    } else if (type === "observed") {
      updated = {
        ...applicant,
        paymentStatus: "Validado",
        paymentOperation: "OP-104523",
        admitted: false,
        docs: {
          dniFile: { status: "Validado", fileName: "dni_copia_legible.pdf" },
          certificadoFile: { status: "Validado", fileName: "certificado_final_2024.pdf" },
          partidaFile: { 
            status: "Observado", 
            fileName: "defecto_partida.png", 
            observations: "La imagen está borrosa en la zona de la firma del registrador. Por favor vuelva a escanear en alta resolución." 
          },
          fotoFile: { 
            status: "Observado", 
            fileName: "foto_casual.jpg", 
            observations: "No cumple con el formato requerido. Se requiere foto tipo carné formal con fondo blanco liso y sin anteojos." 
          }
        }
      };
      setUploadedDniFile("dni_copia_legible.pdf");
      setUploadedCertificadoFile("certificado_final_2024.pdf");
      setUploadedPartidaFile("defecto_partida.png");
      setUploadedFotoFile("foto_casual.jpg");
      setPaymentVoucher("OP-104523");
    } else { // all_approved (DIRECT ADMISSION ASSIGNED)
      updated = {
        ...applicant,
        paymentStatus: "Validado",
        paymentOperation: "OP-1200192",
        admitted: true,
        docs: {
          dniFile: { status: "Validado", fileName: "dni_validado_reniec.pdf" },
          certificadoFile: { status: "Validado", fileName: "certificado_secundaria_valido.pdf" },
          partidaFile: { status: "Validado", fileName: "partida_oficial_municipal.pdf" },
          fotoFile: { status: "Validado", fileName: "foto_estudio_oficial.jpg" }
        }
      };
      setUploadedDniFile("dni_validado_reniec.pdf");
      setUploadedCertificadoFile("certificado_secundaria_valido.pdf");
      setUploadedPartidaFile("partida_oficial_municipal.pdf");
      setUploadedFotoFile("foto_estudio_oficial.jpg");
      setPaymentVoucher("OP-1200192");
    }

    onUpdateApplicant(updated);
  };

  // Set single document state
  const setSingleDocState = (key: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile", status: any, obsText = "") => {
    const updated = {
      ...applicant,
      docs: {
        ...currentDocs,
        [key]: {
          status,
          fileName: currentDocs[key].fileName || `simulacion_${key}.pdf`,
          observations: obsText
        }
      }
    };
    onUpdateApplicant(updated);
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
      {/* 1. LAYOUT GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-75 pointer-events-none" />

      {/* Floating slowly rotating graphic background color shapes to mirror the Login Portal style */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9F062A]/3 rounded-full blur-[90px] pointer-events-none animate-pulse duration-[10s]" />
      <div className="absolute bottom-1/5 right-1/4 w-[450px] h-[450px] bg-amber-400/2 rounded-full blur-[110px] pointer-events-none animate-pulse duration-[15s]" />

      {/* 2. PERSISTENT FLOATING DEMO ASSISTANT & SIMULATION CONSOLE */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {showSimConsole && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-2xl max-w-sm w-80 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#E3BD26] flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Consola de Simulación
                </span>
                <button 
                  onClick={() => setShowSimConsole(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <span className="text-[9px] text-slate-400 font-extrabold block mb-2 uppercase tracking-wide">Preajustes Rápidos de Proceso:</span>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                <button 
                  onClick={() => setSimPreset("new")}
                  className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold py-1.5 px-2 rounded text-slate-200 text-left border border-slate-700/60 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3 text-slate-400 shrink-0" /> 1. Todo Inicial
                </button>
                <button 
                  onClick={() => setSimPreset("pending_docs")}
                  className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold py-1.5 px-2 rounded text-slate-200 text-left border border-slate-700/60 flex items-center gap-1"
                >
                  <Clock className="w-3 h-3 text-amber-500 shrink-0" /> 2. Docs Pendientes
                </button>
                <button 
                  onClick={() => setSimPreset("observed")}
                  className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold py-1.5 px-2 rounded text-slate-200 text-left border border-slate-700/60 flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" /> 3. Docs Observados
                </button>
                <button 
                  onClick={() => setSimPreset("all_approved")}
                  className="bg-emerald-950/80 hover:bg-emerald-900 text-[10px] font-extrabold py-1.5 px-2 rounded text-emerald-400 text-left border border-emerald-800/80 flex items-center gap-1"
                >
                  <Award className="w-3 h-3 text-emerald-400 shrink-0" /> 4. ¡Aprobado / Vacante!
                </button>
              </div>

              <span className="text-[9px] text-slate-400 font-extrabold block mb-1 uppercase tracking-wide">Estados Manuales de Simulación:</span>
              <div className="space-y-2 text-[10px] font-bold">
                {/* Pago Toggle */}
                <div className="flex items-center justify-between bg-slate-800/40 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-300">Pago Admisión:</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => onUpdateApplicant({ ...applicant, paymentStatus: "Validado", paymentOperation: applicant.paymentOperation || "OP-VAL" })}
                      className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide font-black ${applicant.paymentStatus === "Validado" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    >
                      Aprobado
                    </button>
                    <button 
                      onClick={() => onUpdateApplicant({ ...applicant, paymentStatus: "Pendiente", paymentOperation: applicant.paymentOperation || "OP-PEND" })}
                      className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide font-black ${applicant.paymentStatus === "Pendiente" ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    >
                      Pend.
                    </button>
                  </div>
                </div>

                {/* Docs Toggles */}
                <div className="bg-slate-800/20 p-2 rounded border border-slate-800 space-y-2">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-1">Aprobación de Requisitos Individuales:</span>
                  {[
                    { label: "1. Copia de DNI", key: "dniFile" as const },
                    { label: "2. Certificado", key: "certificadoFile" as const },
                    { label: "3. Partida Nac.", key: "partidaFile" as const },
                    { label: "4. Foto Carné", key: "fotoFile" as const },
                  ].map((d) => (
                    <div key={d.key} className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-300 font-medium">{d.label}:</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setSingleDocState(d.key, "Validado")}
                          className={`px-1 rounded-xs font-bold text-[8px] uppercase ${currentDocs[d.key]?.status === "Validado" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"}`}
                        >
                          Ok
                        </button>
                        <button 
                          onClick={() => setSingleDocState(d.key, "Observado", "Documento enviado no corresponde al solicitado o tiene baja resolución de escaneo.")}
                          className={`px-1 rounded-xs font-bold text-[8px] uppercase ${currentDocs[d.key]?.status === "Observado" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-400"}`}
                        >
                          Obs
                        </button>
                        <button 
                          onClick={() => setSingleDocState(d.key, "Pendiente")}
                          className={`px-1 rounded-xs font-bold text-[8px] uppercase ${currentDocs[d.key]?.status === "Pendiente" ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400"}`}
                        >
                          Pend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-normal bg-slate-950/40 p-2 rounded border border-slate-800 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>¿Cómo funciona?</strong> Cambie los estados arriba para simular la evaluación administrativa de secretaría. Pruebe <strong>Todo Aprobado</strong> para desbloquear la admisión directa.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setShowSimConsole(!showSimConsole)}
          className="bg-slate-900 border border-slate-800 text-amber-400 hover:text-white font-extrabold uppercase text-[10px] py-2 px-4 rounded-full shadow-2xl tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer select-none"
        >
          <Terminal className="w-3.5 h-3.5 text-[#E3BD26] animate-pulse" />
          <span>{showSimConsole ? "Cerrar Panel" : "Abrir Consola de Pruebas"}</span>
        </button>
      </div>

      {/* 3. SIDEBAR NAVIGATION */}
      <Sidebar
        institution={{
          name: "IESTP SFA",
          subtitle: "Admisión Postulante"
        }}
        user={{
          name: `${applicant.name} ${applicant.lastName}`,
          role: currentProgram.name,
          status: applicant.admitted ? "ADMITIDO" : "EN PROCESO",
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
        <AlertBox
          className="mb-6"
          title="Modalidad de Ingreso Directo SFA"
          description="El ingreso NO requiere dar un examen de admisión presencial. Se otorga automáticamente al completar, adjuntar y validar sus 4 requisitos de admisión y pago de S/.120."
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

        {/* ACTIVE TABS SWITCH */}
        {activeTab === "dashboard" && (
          <PageTransition id="dashboard" className="space-y-6">
            <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md border-b-4 border-[#CFA020] relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] text-amber-300 font-black tracking-widest uppercase block mb-1">PROCESO DE ADMISIÓN CONTINUA INSTITUCIONAL</span>
                <h2 className="text-xl md:text-2xl font-black font-display tracking-tight flex flex-wrap items-center gap-2.5">
                  ¡Hola, {applicant.name}!
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-widest leading-none">
                    Código Postulante: {applicant.applicantCode || "Asignando..."}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 font-semibold mt-1">Sube tus requisitos digitales para reservar tu vacante de estudios en la carrera técnica de <strong>{currentProgram.name}</strong>. (DNI: {applicant.dni})</p>
                
                <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold items-center text-slate-200">
                  <div className="bg-white/10 px-3.5 py-2.5 rounded-lg flex items-center gap-2 border border-white/5">
                    Operación Pago Tasas: 
                    {applicant.paymentStatus === "Validado" ? (
                      <Badge variant="success" pulse>VALIDADO</Badge>
                    ) : (
                      <Badge variant="warning">{applicant.paymentStatus}</Badge>
                    )}
                  </div>

                  <div className="bg-white/10 px-3.5 py-2.5 rounded-lg flex items-center gap-2 border border-white/5">
                    Expediente Digital: 
                    <Badge variant="gold" className="font-mono">{globalProgressPercentage}% completado</Badge>
                  </div>
                </div>
              </div>

              {/* Decorative shield background vector in solid sidebar banner */}
              <div className="absolute right-6 bottom-6 opacity-10 pointer-events-none hidden md:block">
                <Compass className="w-32 h-32" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-[10px] text-slate-400 block uppercase">1. Inscripción Inicial</span>
                  <span className="font-black text-slate-800 block text-xs mt-1">{currentProgram.name}</span>
                  <p className="text-slate-500 font-semibold mt-1 text-[11px] leading-relaxed">Carrera oficial registrada en el sistema de admisiones.</p>
                </div>
                <div className="mt-4 pt-2.5 border-t flex justify-between items-center text-[#9F062A] font-extrabold uppercase text-[9px]">
                  <span>Completado ✓</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-[10px] text-slate-400 block uppercase">2. Tasa de Derechos S/ 120</span>
                  <span className="font-black text-slate-800 block text-xs mt-1">Estado: {applicant.paymentStatus}</span>
                  <p className="text-slate-500 font-semibold mt-1 text-[11px] leading-relaxed">
                    Operación de validación bancaria. {applicant.paymentOperation ? `Ref: ${applicant.paymentOperation}` : "Sin registrar."}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t">
                  <button 
                    onClick={() => setActiveTab("pagos")}
                    className="text-[#9F062A] hover:text-[#CFA020] font-extrabold uppercase text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ir a Pagos</span> <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-[10px] text-slate-400 block uppercase">3. Validación de Expediente</span>
                  <span className="font-black text-slate-800 block text-xs mt-1">Aprobados: {approvedCount} de 4</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-[#9F062A] h-full" style={{ width: `${globalProgressPercentage}%` }} />
                  </div>
                </div>
                <div className="mt-4 pt-2.5 border-t">
                  <button 
                    onClick={() => setActiveTab("documentos")}
                    className="text-[#9F062A] hover:text-[#CFA020] font-extrabold uppercase text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Subir Documentos</span> <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <span className="font-extrabold text-[10px] text-slate-400 block uppercase">4. Ingreso Directo vacante</span>
                  <span className={`font-black uppercase text-xs mt-1 block ${applicant.admitted ? "text-emerald-600 animate-pulse" : "text-slate-500"}`}>
                    {applicant.admitted ? "★ ADMITIDO ★" : "PENDIENTE EVAL"}
                  </span>
                  <p className="text-slate-500 font-semibold mt-1 text-[11px] leading-relaxed">Concesión del folio de vacante oficial una vez calificados los requisitos.</p>
                </div>
                <div className="mt-4 pt-2.5 border-t">
                  <button 
                    onClick={() => setActiveTab("resultados")}
                    className="text-[#9F062A] hover:text-[#CFA020] font-extrabold uppercase text-[9px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Resultados</span> <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* PRE-VISUAL EXPLANATION */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Guía de Procedimiento para Ingreso Exitoso</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-semibold leading-relaxed">
                <div>
                  <span className="text-[#9F062A] font-extrabold block text-sm mb-1.5">A. Depósito de Tasa</span>
                  Realice el abono de S/.120 en cualquier agente del Banco de la Nación. Ingrese a la pestaña de pagos y registre el código numérico de operación que figura en su comprobante físico.
                </div>
                <div>
                  <span className="text-[#9F062A] font-extrabold block text-sm mb-1.5">B. Adjunte los 4 Requisitos</span>
                  Escanee de forma nítida en PDF su DNI, su Partida de Nacimiento, su Certificado secundario oficial, y suba su foto tamaño carné formal. Se validarán en un plazo estimado de 24 horas hábiles.
                </div>
                <div>
                  <span className="text-[#9F062A] font-extrabold block text-sm mb-1.5">C. Descargue Ficha de Ingreso</span>
                  Una vez que secretaría verifique que todo está completo y correcto, su estado pasará a "Admitido" y se emitirá su Constancia de Vacante Directa, la cual certifica su ingreso directo al tecnológico.
                </div>
              </div>
            </div>
          </PageTransition>
        )}

        {/* TAB 2: DOCUMENTOS DE ADMISIÓN (REPLICATING SCREENSHOT 2 PERFECTLY) */}
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

            {/* Master Document list containing matching styling & actions of Screenshot 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* L: 4 Documents details cards column */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* File item 1: Copia de DNI */}
                <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 text-left">
                      <span className="h-10 w-10 shrink-0 bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center rounded">
                        <FileText className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Copia Legible de DNI</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Anverso y reverso en una sola cara (Formato Imagen).</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                      currentDocs.dniFile.status === "Validado" 
                        ? "bg-emerald-100 text-emerald-800 font-bold text-[9px]" 
                        : currentDocs.dniFile.status === "Pendiente"
                          ? "bg-amber-100 text-amber-800 font-bold animate-pulse text-[9px]"
                          : currentDocs.dniFile.status === "Observado"
                            ? "bg-red-100 text-red-800 font-bold text-[9px]"
                            : "bg-slate-100 text-slate-500 font-bold text-[9px]"
                    }`}>
                      {currentDocs.dniFile.status === "No Enviado" ? "No Enviado" : currentDocs.dniFile.status}
                    </span>
                  </div>

                  {/* Image Upload results info if validado/pendiente */}
                  {currentDocs.dniFile.status === "Validado" && (
                    <div className="mt-4 p-3.5 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedDniFile || `dni_captura.jpg`}</span>
                      <button 
                        onClick={() => triggerPreview("Copia de DNI - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), uploadedDniFile || "dni_captura.jpg", "image", { fileDataUrl: currentDocs.dniFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.dniFile.status === "Pendiente" && !stagedDniFile && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedDniFile || `dni_captura.jpg`} (Revision Pendiente)</span>
                      <button 
                        onClick={() => triggerPreview("Copia de DNI (Revision) - " + applicant.name.toUpperCase(), uploadedDniFile || "dni_captura.jpg", "image", { fileDataUrl: currentDocs.dniFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.dniFile.status === "Observado" && (
                    <div className="mt-4 p-3.5 bg-red-50/70 border border-red-200 text-red-800 rounded-lg text-xs font-bold leading-normal text-left">
                      <strong>Observación:</strong> {currentDocs.dniFile.observations || "El documento enviado carga ilegibilidad. Por favor verifique el encuadre e iluminación en el escáner."}
                    </div>
                  )}

                  {/* Interactive Upload Box area matching standard design */}
                  {currentDocs.dniFile.status !== "Validado" && (
                    <div className="mt-4 space-y-3">
                      <label className="border-2 border-dashed border-slate-200 hover:border-[#9F062A]/40 rounded-lg p-5 bg-slate-50/50 hover:bg-slate-50/80 transition-all flex flex-col justify-center items-center text-center cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, "dniFile")} 
                        />
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <span className="text-[11px] font-extrabold text-slate-700 block uppercase">
                          {stagedDniFile ? "Imagen Seleccionada" : "Seleccionar Imagen JPG o PNG"}
                        </span>
                        <span className="text-[9px] text-[#9F062A] font-bold block mt-1">
                          {stagedDniFile ? stagedDniFile : "Haga clic para elegir foto desde su dispositivo"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">Formatos: JPG, JPEG, PNG (Max 5MB)</span>
                      </label>
                      
                      {stagedDniPreview && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 font-semibold block mb-1">Vista Previa de Imagen:</span>
                          <img src={stagedDniPreview} alt="Copia DNI preview" className="max-h-24 object-contain rounded border border-slate-200" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveDocument("dniFile")}
                        disabled={!stagedDniFile}
                        className={`w-full py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all text-center ${
                          stagedDniFile 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm" 
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        Guardar Copia de DNI
                      </button>
                    </div>
                  )}
                </div>

                {/* File item 2: Certificado de Secundaria */}
                <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 text-left">
                      <span className="h-10 w-10 shrink-0 bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center rounded">
                        <FileText className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Certificado de Secundaria</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Certificado oficial visado por la UGEL (Formato Imagen).</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                      currentDocs.certificadoFile.status === "Validado" 
                        ? "bg-emerald-100 text-emerald-800 font-bold text-[9px]" 
                        : currentDocs.certificadoFile.status === "Pendiente"
                          ? "bg-amber-100 text-amber-800 font-bold animate-pulse text-[9px]"
                          : currentDocs.certificadoFile.status === "Observado"
                            ? "bg-red-100 text-red-800 font-bold text-[9px]"
                            : "bg-slate-100 text-slate-500 font-bold text-[9px]"
                    }`}>
                      {currentDocs.certificadoFile.status === "No Enviado" ? "No Enviado" : currentDocs.certificadoFile.status}
                    </span>
                  </div>

                  {/* Image Upload results info if validado/pendiente */}
                  {currentDocs.certificadoFile.status === "Validado" && (
                    <div className="mt-4 p-3.5 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedCertificadoFile || `certificado_captura.jpg`}</span>
                      <button 
                        onClick={() => triggerPreview("Certificado de Secundaria - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), uploadedCertificadoFile || "certificado_captura.jpg", "image", { fileDataUrl: currentDocs.certificadoFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.certificadoFile.status === "Pendiente" && !stagedCertFile && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedCertificadoFile || `certificado_captura.jpg`} (Revision Pendiente)</span>
                      <button 
                        onClick={() => triggerPreview("Certificado de Secundaria (Revision) - " + applicant.name.toUpperCase(), uploadedCertificadoFile || "certificado_captura.jpg", "image", { fileDataUrl: currentDocs.certificadoFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.certificadoFile.status === "Observado" && (
                    <div className="mt-4 p-3.5 bg-red-50/70 border border-red-200 text-red-800 rounded-lg text-xs font-bold leading-normal text-left">
                      <strong>Observación:</strong> {currentDocs.certificadoFile.observations || "El certificado institucional se registra sin firma o sello visado oficial."}
                    </div>
                  )}

                  {/* Interactive Upload Box area matching standard design */}
                  {currentDocs.certificadoFile.status !== "Validado" && (
                    <div className="mt-4 space-y-3">
                      <label className="border-2 border-dashed border-slate-200 hover:border-[#9F062A]/40 rounded-lg p-5 bg-slate-50/50 hover:bg-slate-50/80 transition-all flex flex-col justify-center items-center text-center cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, "certificadoFile")} 
                        />
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <span className="text-[11px] font-extrabold text-slate-700 block uppercase">
                          {stagedCertFile ? "Imagen Seleccionada" : "Seleccionar Imagen JPG o PNG"}
                        </span>
                        <span className="text-[9px] text-[#9F062A] font-bold block mt-1">
                          {stagedCertFile ? stagedCertFile : "Haga clic para elegir foto desde su dispositivo"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">Formatos: JPG, JPEG, PNG (Max 5MB)</span>
                      </label>

                      {stagedCertPreview && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 font-semibold block mb-1">Vista Previa de Imagen:</span>
                          <img src={stagedCertPreview} alt="Certificado preview" className="max-h-24 object-contain rounded border border-slate-200" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveDocument("certificadoFile")}
                        disabled={!stagedCertFile}
                        className={`w-full py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all text-center ${
                          stagedCertFile 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm" 
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        Guardar Certificado
                      </button>
                    </div>
                  )}
                </div>

                {/* File item 3: Partida de Nacimiento */}
                <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 text-left">
                      <span className="h-10 w-10 shrink-0 bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center rounded">
                        <FileText className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Partida de Nacimiento</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Copia original legible y actualizada (Formato Imagen).</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                      currentDocs.partidaFile.status === "Validado" 
                        ? "bg-emerald-100 text-emerald-800 font-bold text-[9px]" 
                        : currentDocs.partidaFile.status === "Pendiente"
                          ? "bg-amber-100 text-amber-800 font-bold animate-pulse text-[9px]"
                          : currentDocs.partidaFile.status === "Observado"
                            ? "bg-red-100 text-red-800 font-bold text-[9px]"
                            : "bg-slate-100 text-slate-500 font-bold text-[9px]"
                    }`}>
                      {currentDocs.partidaFile.status === "No Enviado" ? "No Enviado" : currentDocs.partidaFile.status}
                    </span>
                  </div>

                  {/* Image Upload results info if validado/pendiente */}
                  {currentDocs.partidaFile.status === "Validado" && (
                    <div className="mt-4 p-3.5 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedPartidaFile || `partida_captura.jpg`}</span>
                      <button 
                        onClick={() => triggerPreview("Partida de Nacimiento - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), uploadedPartidaFile || "partida_captura.jpg", "image", { fileDataUrl: currentDocs.partidaFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.partidaFile.status === "Pendiente" && !stagedPartidaFile && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedPartidaFile || `partida_captura.jpg`} (Revision Pendiente)</span>
                      <button 
                        onClick={() => triggerPreview("Partida de Nacimiento (Revision) - " + applicant.name.toUpperCase(), uploadedPartidaFile || "partida_captura.jpg", "image", { fileDataUrl: currentDocs.partidaFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.partidaFile.status === "Observado" && (
                    <div className="mt-4 p-3.5 bg-red-50/75 border border-red-200 text-red-800 rounded-lg text-xs font-bold leading-normal text-left">
                      <strong>Observación:</strong> {currentDocs.partidaFile.observations || "La imagen está borrosa en la zona de la firma del registrador. Por favor vuelva a escanear en alta resolución."}
                    </div>
                  )}

                  {/* Interactive Upload Box area matching standard design */}
                  {currentDocs.partidaFile.status !== "Validado" && (
                    <div className="mt-4 space-y-3">
                      <label className="border-2 border-dashed border-slate-200 hover:border-[#9F062A]/40 rounded-lg p-5 bg-slate-50 hover:bg-slate-50/80 transition-all flex flex-col justify-center items-center text-center cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, "partidaFile")} 
                        />
                        <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                        <span className="text-[11px] font-extrabold text-slate-700 block uppercase">
                          {stagedPartidaFile ? "Imagen Seleccionada" : "Seleccionar Imagen JPG o PNG"}
                        </span>
                        <span className="text-[9px] text-[#9F062A] font-bold block mt-1">
                          {stagedPartidaFile ? stagedPartidaFile : "Haga clic para elegir foto desde su dispositivo"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">Formatos: JPG, JPEG, PNG (Max 5MB)</span>
                      </label>

                      {stagedPartidaPreview && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 font-semibold block mb-1">Vista Previa de Imagen:</span>
                          <img src={stagedPartidaPreview} alt="Partida preview" className="max-h-24 object-contain rounded border border-slate-200" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveDocument("partidaFile")}
                        disabled={!stagedPartidaFile}
                        className={`w-full py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all text-center ${
                          stagedPartidaFile 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm" 
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        Guardar Partida de Nacimiento
                      </button>
                    </div>
                  )}
                </div>

                {/* File item 4: Foto Tamaño Carné */}
                <div className="bg-white p-5 rounded-lg border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 text-left">
                      <span className="h-10 w-10 shrink-0 bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center rounded">
                        <FileText className="w-5 h-5" />
                      </span>
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Foto Tamaño Carné</span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Fondo blanco, ropa formal, sin anteojos (Formato Imagen).</span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full ${
                      currentDocs.fotoFile.status === "Validado" 
                        ? "bg-emerald-100 text-emerald-800 font-bold text-[9px]" 
                        : currentDocs.fotoFile.status === "Pendiente"
                          ? "bg-amber-100 text-amber-800 font-bold animate-pulse text-[9px]"
                          : currentDocs.fotoFile.status === "Observado"
                            ? "bg-red-100 text-red-800 font-bold text-[9px]"
                            : "bg-slate-100 text-slate-500 font-bold text-[9px]"
                    }`}>
                      {currentDocs.fotoFile.status === "No Enviado" ? "No Enviado" : currentDocs.fotoFile.status}
                    </span>
                  </div>

                  {/* Image Upload results info if validado/pendiente */}
                  {currentDocs.fotoFile.status === "Validado" && (
                    <div className="mt-4 p-3.5 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedFotoFile || `foto_estudio.jpg`}</span>
                      <button 
                        onClick={() => triggerPreview("Fotografia Personal - " + applicant.name.toUpperCase() + " " + applicant.lastName.toUpperCase(), uploadedFotoFile || "foto_estudio.jpg", "image", { fileDataUrl: currentDocs.fotoFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.fotoFile.status === "Pendiente" && !stagedFotoFile && (
                    <div className="mt-4 p-3 bg-slate-50 border rounded-lg flex justify-between items-center animate-fade-in text-xs font-semibold text-slate-700 font-mono">
                      <span>Archivo: {uploadedFotoFile || `foto_estudio.jpg`} (Revision Pendiente)</span>
                      <button 
                        onClick={() => triggerPreview("Fotografia Personal (Revision) - " + applicant.name.toUpperCase(), uploadedFotoFile || "foto_estudio.jpg", "image", { fileDataUrl: currentDocs.fotoFile.fileDataUrl })}
                        className="p-1 px-2.5 bg-white hover:bg-slate-200 border text-[10px] font-sans font-bold uppercase rounded cursor-pointer"
                      >
                        Ver Imagen
                      </button>
                    </div>
                  )}

                  {currentDocs.fotoFile.status === "Observado" && (
                    <div className="mt-4 p-3.5 bg-red-50/70 border border-[#9F062A]/20 text-slate-700 rounded-lg text-xs font-semibold leading-normal text-left">
                      <p className="text-[#9F062A] font-extrabold uppercase text-[10px] tracking-wide mb-1 leading-none">Motivo de Rechazo:</p>
                      <span className="font-bold text-slate-600 block bg-white border border-[#9F062A]/10 p-2 rounded mt-1.5 text-[11px] leading-relaxed">
                        {currentDocs.fotoFile.observations || "No cumple con el formato requerido. Se requiere foto formal con fondo blanco liso y rostro despejado."}
                      </span>
                    </div>
                  )}

                  {currentDocs.fotoFile.status !== "Validado" && (
                    <div className="mt-4 space-y-3">
                      <label className="border-2 border-dashed border-slate-200 hover:border-[#9F062A]/40 rounded-lg p-5 bg-slate-50/50 hover:bg-slate-50/80 transition-all flex flex-col justify-center items-center text-center cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg, image/jpg" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(e, "fotoFile")} 
                        />
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <span className="text-[11px] font-extrabold text-slate-700 block uppercase">
                          {stagedFotoFile ? "Imagen Seleccionada" : "Seleccionar Imagen JPG o PNG"}
                        </span>
                        <span className="text-[9px] text-[#9F062A] font-bold block mt-1">
                          {stagedFotoFile ? stagedFotoFile : "Haga clic para elegir foto desde su dispositivo"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5 font-semibold">Toma formal o carné (Max 5MB)</span>
                      </label>

                      {stagedFotoPreview && (
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 font-semibold block mb-1">Vista Previa de Imagen:</span>
                          <img src={stagedFotoPreview} alt="Foto preview" className="max-h-24 object-contain rounded border border-slate-200" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveDocument("fotoFile")}
                        disabled={!stagedFotoFile}
                        className={`w-full py-2 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all text-center ${
                          stagedFotoFile 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm" 
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        Guardar Foto Tamaño Carné
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* R: SIDEBAR FOR PROGRESS GAUGE (REPLICATING SCREENSHOT 2 SIDEBAR WIDGETS) */}
              <div className="space-y-6">
                
                {/* Visual Progress card on right matching deep solid red look of image 2 */}
                <div className="bg-[#9F062A] text-white p-5 rounded-2xl shadow-xl flex flex-col justify-between border-l-4 border-amber-400 text-left">
                  <div>
                    <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider block leading-none">Progreso del Expediente</h3>
                    
                    <div className="mt-5 flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest block">ESTADO GLOBAL</span>
                      <span className="text-2xl font-black text-amber-300 font-mono leading-none">{globalProgressPercentage}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-900/40 h-2 rounded-full overflow-hidden mt-3 mb-4">
                      <div 
                        className="bg-amber-400 h-full transition-all duration-300" 
                        style={{ width: `${globalProgressPercentage}%` }}
                      />
                    </div>

                    <p className="text-slate-100 font-medium text-[11px] leading-normal mb-5">
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
                    className="w-full bg-white hover:bg-slate-100 text-[#9F062A] hover:text-[#800521] py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer text-center"
                  >
                    Enviar a Revisión Final
                  </button>
                </div>

                {/* Instructions card EXACTLY matching Layout requirements list detail on image 2 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm text-left">
                  <span className="text-[10px] font-black text-[#9F062A] uppercase tracking-wider block border-b pb-2 mb-3">
                    🛈 Instrucciones Importantes
                  </span>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2.5 text-xs">
                      <span className="font-black text-[#9F062A] text-[11px] font-mono select-none">01.</span>
                      <p className="text-slate-600 font-bold leading-normal text-[11px]">Todos los documentos deben estar en formato de imagen (JPG, JPEG o PNG).</p>
                    </div>

                    <div className="flex gap-2.5 text-xs">
                      <span className="font-black text-[#9F062A] text-[11px] font-mono select-none">02.</span>
                      <p className="text-slate-600 font-bold leading-normal text-[11px]">Asegúrese de que la captura o escaneo fotográfico sea nítida, legible y con buena iluminación.</p>
                    </div>

                    <div className="flex gap-2.5 text-xs">
                      <span className="font-black text-[#9F062A] text-[11px] font-mono select-none">03.</span>
                      <p className="text-slate-600 font-bold leading-normal text-[11px]">El peso máximo por cada imagen cargada debe ser menor a 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Need Help contact card matching image 2 */}
                <div className="bg-slate-100/80 p-5 rounded-xl border border-slate-205 shadow-sm text-center">
                  <span className="h-6 w-6 shrink-0 text-[#9F062A] flex items-center justify-center mx-auto mb-2 text-base">🎧</span>
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm leading-tight">¿Necesita ayuda?</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-normal max-w-sm mx-auto">
                    Nuestro equipo de secretaría académica está disponible para guiarte en tu proceso de L-V de 8am a 6pm.
                  </p>
                  <button 
                    onClick={() => setActiveTab("soporte")}
                    className="text-[10px] text-[#9F062A] hover:text-[#CFA020] font-black uppercase tracking-wider block mx-auto mt-3.5 border-b border-[#9F062A] hover:border-[#CFA020] cursor-pointer"
                  >
                    Contactar Soporte
                  </button>
                </div>

              </div>

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
                      Su pago de derecho de admision por S/. 120.00 ha sido aprobado de manera oficial. ¡Puede pasar a la siguiente etapa de admision!
                    </div>
                  ) : applicant.paymentStatus === "Pendiente" ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-slate-750 text-xs text-left font-semibold space-y-2">
                      <p className="text-amber-800 font-bold uppercase text-[10px] tracking-wide mb-1 leading-none">Validacion de Pago en Curso</p>
                      <p>Su numero de operacion ingresado: <span className="font-mono font-bold text-slate-900">{applicant.paymentOperation || "No registrado"}</span></p>
                      <p className="text-[11px] text-slate-600">La oficina de Tesoreria esta verificando su comprobante. Por favor, espere a que su estado sea validado para registrarse al examen de admision.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applicant.paymentStatus === "Observado" && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-slate-750 text-xs text-left font-semibold">
                          <p className="text-red-750 font-extrabold uppercase text-[10px] tracking-wide mb-1 leading-none">Operacion Observada por Administracion</p>
                          <span className="text-slate-600 block mt-1 leading-relaxed bg-white border border-red-100 p-2.5 rounded text-[11px]">
                            Observacion enviada: "{applicant.paymentObservations || "Su comprobante de deposito no coincide con nuestros registros."}"
                          </span>
                          <span className="text-[11px] block text-red-800 font-bold mt-2">
                            Por favor complete nuevamente el comprobante o codigo de operacion real para que sea evaluado de nuevo.
                          </span>
                        </div>
                      )}

                      {/* Submission form area of Screenshot 4 */}
                      <form onSubmit={handleSubmitPaymentVoucher} className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#9F062A] uppercase tracking-wider block mb-1">
                          Registrar Operacion de Pago
                        </h4>

                        {/* Numeric code entry physical field */}
                        <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                          <div className="space-y-1 flex-1 w-full text-left">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Codigo de N° de Operacion del Deposito</label>
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
                            <span>Enviar Operacion</span>
                          </button>
                        </div>
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
                  
                  <div className="space-y-4">
                    {/* BCP BBVA detail */}
                    <div className="p-3 bg-slate-50 border rounded flex items-start gap-2.5">
                      <span className="text-[14px]">🏦</span>
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Transferencia</span>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">BCP, BBVA, Interbank y Scotiabank</p>
                      </div>
                    </div>

                    {/* Agentes detail */}
                    <div className="p-3 bg-slate-50 border rounded flex items-start gap-2.5">
                      <span className="text-[14px]">🏪</span>
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">Ventanilla</span>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">Bancos y Agentes Autorizados</p>
                      </div>
                    </div>

                    {/* Yape Plin detail */}
                    <div className="p-3 bg-slate-50 border rounded flex items-start gap-2.5">
                      <span className="text-[14px]">📱</span>
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">App Móvil</span>
                        <p className="text-[10px] text-slate-400 font-semibold block mt-0.5">Yape y Plin mediante código QR</p>
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
                      <td className="p-3 text-slate-500">15/03/2026</td>
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
                              date: "15/03/2026", 
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

        {/* TAB 4: RESULTADOS (REPLICATING SCREENSHOT 3 PERFECTLY - NO EXAM) */}
        {activeTab === "resultados" && (
          <PageTransition id="resultados" className="space-y-6 text-left">
            
            {/* Conditional view depending of the candidate document approvals */}
            {applicant.admitted ? (
              // CANDIDATE ADMITTED VIEW (REPLICATES SCREENSHOT 3 HIGHLY ACCURATELY)
              <>
                {/* 1. TOP GREEN NOTIFICATION BOX (MATCHES IMAGE 3 EXACTLY) */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-3 text-emerald-900 shadow-sm animate-fade-in items-start">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <span className="font-extrabold text-[12px] block text-emerald-950">
                      Expediente de Admisión Completado
                    </span>
                    <p className="text-[11px] text-emerald-800 font-bold mt-1 max-w-4xl">
                      Tu expediente ha sido revisado y aprobado satisfactoriamente por el comité académico. Cumples con todos los requisitos para proceder al ingreso definitivo y reserva de plaza lectiva como ingresante oficial.
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
                          INFORMACIÓN DE INGRESO CONTINUO SFA
                        </span>

                        <span className="bg-red-100 text-[#9F062A] text-[9px] font-black uppercase tracking-widest py-0.5 px-3 rounded-full">
                          CONFIRMADO
                        </span>
                      </div>

                      {/* Display grid for Place & Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold leading-relaxed text-left border-b pb-6 mb-6">
                        <div className="p-4 bg-slate-50 border rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center text-sm">📍</span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Lugar Asignado</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">Campus Principal - Pabellón A</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase">Ubicación de Oficinas Administrativas</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border rounded-lg flex gap-3 items-center">
                          <span className="h-8 w-8 rounded-full bg-[#9F062A]/5 text-[#9F062A] flex items-center justify-center text-sm">🗓</span>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider leading-none">Modalidad Ordinaria</span>
                            <span className="text-slate-800 text-[11px] font-extrabold block mt-1">Ingreso Directo por Requisitos</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase">Plaza de Estudios Asegurada</span>
                          </div>
                        </div>
                      </div>

                      {/* Large primary branding action button matching layout requirements list in Image 3 */}
                      <button 
                        onClick={() => {
                          alert(`Simulando la generación y descarga segura del documento oficial 'Constancia de Ingreso Directo - Código de Registro SFA-2026-${applicant.dni}.pdf'. Contiene firmas digitales de la Dirección y Secretaría.`);
                        }}
                        className="w-full bg-[#9F062A] hover:bg-[#800521] text-white py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-1.5 transition-all scroll-smooth cursor-pointer leading-none"
                      >
                        <Download className="w-4 h-4 text-amber-350" />
                        <span>Descargar Constancia de Ingreso Directo</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-bold block mt-2.5">
                        Este documento es obligatorio para el ingreso al campus administrativo al momento de la matrícula presencial de ingresante.
                      </span>

                    </div>

                    {/* BLUE INFO BOX ON BOTTOM LEFT OF IMAGE 3 */}
                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg flex gap-3 text-sky-905 text-left text-xs leading-relaxed">
                      <span className="text-sky-600 text-[16px] font-bold select-none h-5 w-5 shrink-0 bg-sky-100/50 rounded-full flex items-center justify-center mt-0.5">ℹ</span>
                      <p className="text-[#2F6187] font-semibold text-[11px]">
                        <strong>Recordatorio de Admisión:</strong> Recuerde traer su DNI físico vigente y la constancia de ingreso e inscripción impresa. El acceso de ventanillas administrativas cerrará puntualmente en las fechas asignadas de Matrícula.
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
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Completado el 12/03/2026</span>
                        </div>

                        {/* Point 2 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Pago de Derechos (S/ 120)</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Validado el 14/03/2026</span>
                        </div>

                        {/* Point 3 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Validación de Expediente</span>
                          <span className="text-[9px] text-[#9F062A] font-bold uppercase leading-none mt-1 inline-block">Aprobado Hoy por Comité</span>
                        </div>

                        {/* Point 4 */}
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-0 h-3 w-3 rounded-full bg-emerald-600 animate-pulse border border-white shrink-0" />
                          <span className="text-[11px] font-black text-slate-900 block leading-tight">Vacante Asignada / Ingreso Directo</span>
                          <span className="text-[9px] text-emerald-600 font-black uppercase leading-none mt-1 inline-block">Confirmado</span>
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
            ) : (
              // NON-APPROVED EXPEDIENTE SCREEN
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
                  <p>• Derecho de Admisión S/. 120: <span className="font-extrabold text-slate-900">{applicant.paymentStatus === "Validado" ? "✓ Aprobado" : "⚠️ Pendiente de validación"}</span></p>
                  <p>• Expediente de Documentos: <span className="font-extrabold text-slate-900">{globalProgressPercentage}% completado ({approvedCount} de 4 validados)</span></p>
                </div>

                <div className="pt-4 border-t text-left">
                  <p className="text-[10px] text-slate-400 font-medium leading-normal bg-[#FFFDF4] border border-[#CFA020]/20 p-3 rounded">
                    💡 <strong>Omitir Paso Temporalmente:</strong> Puedes abrir el widget flotante <strong>"Consola de Pruebas"</strong> de abajo a la derecha, presionar <strong>"Auto-Aprobar Todo"</strong> y verás de forma instantánea como se genera tu constancia de ingreso directo.
                  </p>
                </div>
              </div>
            )}

          </PageTransition>
        )}

        {/* TAB 5: SOPORTE DE ADMISIÓN */}
        {activeTab === "soporte" && (
          <PageTransition id="soporte" className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-6 text-left animate-fade-in">
            <h2 className="text-lg font-black text-slate-900 border-b pb-2 mb-4 font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#9F062A]" /> Centro de Soporte Técnico y Atención
            </h2>
            <p className="text-xs text-slate-500 font-bold">¿Tiene dudas o inconvenientes con su inscripción, pago o validación de requisitos? Envíe su consulta para recibir asistencia directa de la Secretaría Académica.</p>

            {/* Chat bubble record matching user requests */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Historial de Conversación</span>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-[160px] max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
                {(!applicant.supportMessages || applicant.supportMessages.length === 0) ? (
                  <div className="text-center py-10 text-xs text-slate-400 font-semibold leading-relaxed my-auto">
                    No se han registrado mensajes previos. Use el formulario de abajo para enviar su consulta técnica a la institución.
                  </div>
                ) : (
                  applicant.supportMessages.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col mb-1.5 ${msg.sender === "postulante" ? "items-end" : "items-start"}`}>
                      <div className={`p-3 rounded-lg max-w-md text-xs font-semibold leading-normal shadow-xs ${
                        msg.sender === "postulante" 
                          ? "bg-[#9F062A] text-white rounded-br-none" 
                          : "bg-white border border-slate-350 text-slate-800 rounded-bl-none"
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
                      <span className="text-[8px] text-slate-400 font-bold block mt-1 tracking-wide uppercase">
                        {msg.sender === "postulante" ? `Usted - ${msg.date}` : `Mesa de Partes - ${msg.date}`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Form for sending support messages */}
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
              className="space-y-4 text-xs font-bold text-slate-700 pt-4 border-t"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-slate-500 mb-1">Nombre Completo</label>
                  <input type="text" disabled value={`${applicant.name} ${applicant.lastName}`} className="w-full bg-slate-100 px-3 py-2 border rounded text-slate-500 font-bold" />
                </div>
                <div>
                  <label className="block uppercase text-slate-550 mb-1">Teléfono Móvil de Contacto</label>
                  <input type="text" value={applicant.phone} disabled className="w-full bg-slate-100 px-3 py-2 border rounded text-slate-500 font-bold" />
                </div>
              </div>

              <div>
                <label className="block uppercase text-slate-550 mb-1">Categoría del Reclamo Técnico</label>
                <select 
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold focus:outline-hidden"
                >
                  <option>Dificultad con el formato o visualización del PDF</option>
                  <option>El voucher físico no se registra en la base de datos bancaria</option>
                  <option>Observación en mi Partida de Nacimiento sin justificación médica</option>
                  <option>Otro trámite regular</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-slate-500 mb-1">Detalle del Mensaje o Dificultad</label>
                <textarea 
                  required
                  rows={4} 
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describa de manera detallada las dificultades técnicas de su trámite de admisión para poder asistirle..." 
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button 
                  type="submit"
                  className="bg-[#9F062A] hover:bg-[#800521] text-white py-2.5 px-6 rounded font-extrabold uppercase text-[10px] tracking-widest shadow-md transition-all cursor-pointer text-center"
                >
                  Enviar Mensaje a Secretaría
                </button>
              </div>
            </form>
          </PageTransition>
        )}

      </main>

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


