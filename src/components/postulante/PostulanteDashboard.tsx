import React, { useState } from "react";
import { 
  FileText, CreditCard, Award, Upload, CheckCircle2, 
  XCircle, LayoutDashboard, Landmark, Headset, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Applicant, Enrollment } from "../../types";
import { useAcademicCatalog } from "../../context/AcademicCatalogContext";

// Design System UI Components
import Sidebar from "../ui/Sidebar";
import PageHeader from "../ui/PageHeader";
import AlertBox from "../ui/AlertBox";
import ImagePreviewModal from "../ui/ImagePreviewModal";

// Modular Sub-components for Postulante Dashboard
import ConstanciaModal from "./modals/ConstanciaModal";
import DashboardMainTab from "./tabs/DashboardMainTab";
import DocumentosTab from "./tabs/DocumentosTab";
import PagosTab from "./tabs/PagosTab";
import ResultadosTab from "./tabs/ResultadosTab";
import SoporteTab from "./tabs/SoporteTab";
import MatriculaTab from "./tabs/MatriculaTab";

interface PostulanteDashboardProps {
  applicant: Applicant;
  onUpdateApplicant: (updated: Applicant) => void;
  onLogout: () => void;
  onGoToPortal?: () => void;
  enrollments?: Enrollment[];
  onUpdateEnrollment?: (updated: Enrollment) => void;
}

export default function PostulanteDashboard({ 
  applicant, 
  onUpdateApplicant, 
  onLogout,
  onGoToPortal,
  enrollments = [],
  onUpdateEnrollment
}: PostulanteDashboardProps) {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();
  // Active Navigation Tab State
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

  // Fee payment voucher state
  const [paymentVoucher, setPaymentVoucher] = useState(applicant.paymentOperation || "");
  const [paymentType, setPaymentType] = useState<"number" | "voucher">(applicant.paymentType || "number");
  const [stagedVoucherFile, setStagedVoucherFile] = useState<string>("");
  const [stagedVoucherPreview, setStagedVoucherPreview] = useState<string>("");

  // Matricula enrollment states
  const [matriculaVoucher, setMatriculaVoucher] = useState("");
  const [matriculaPaymentType, setMatriculaPaymentType] = useState<"number" | "voucher">("voucher");
  const [stagedMatriculaFile, setStagedMatriculaFile] = useState<string>("");
  const [stagedMatriculaPreview, setStagedMatriculaPreview] = useState<string>("");
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

  // Local document upload staged states
  const [stagedDniFile, setStagedDniFile] = useState<string>("");
  const [stagedDniPreview, setStagedDniPreview] = useState<string>("");

  const [stagedCertFile, setStagedCertFile] = useState<string>("");
  const [stagedCertPreview, setStagedCertPreview] = useState<string>("");

  const [stagedPartidaFile, setStagedPartidaFile] = useState<string>("");
  const [stagedPartidaPreview, setStagedPartidaPreview] = useState<string>("");

  const [stagedFotoFile, setStagedFotoFile] = useState<string>("");
  const [stagedFotoPreview, setStagedFotoPreview] = useState<string>("");

  // Accordion toggle state for documents
  const [openDocs, setOpenDocs] = useState<Record<string, boolean>>({
    dniFile: true,
    certificadoFile: false,
    partidaFile: false,
    fotoFile: false
  });

  const toggleDoc = (docKey: string) => {
    setOpenDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  // Staged upload modal state
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

  // Support input states
  const [supportCategory, setSupportCategory] = useState("Dificultad con el formato o visualizacion del PDF");
  const [supportMessage, setSupportMessage] = useState("");
  const [isConstanciaModalOpen, setIsConstanciaModalOpen] = useState(false);

  const triggerPreview = (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => {
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

  const currentDocs = {
    dniFile: applicant.docs?.dniFile || { status: "No Enviado" as const },
    certificadoFile: applicant.docs?.certificadoFile || { status: "No Enviado" as const },
    partidaFile: applicant.docs?.partidaFile || { status: "No Enviado" as const },
    fotoFile: applicant.docs?.fotoFile || { status: "No Enviado" as const }
  };

  const totalDocs = 4;
  let approvedCount = 0;
  if (currentDocs.dniFile.status === "Validado") approvedCount++;
  if (currentDocs.certificadoFile.status === "Validado") approvedCount++;
  if (currentDocs.partidaFile?.status === "Validado") approvedCount++;
  if (currentDocs.fotoFile.status === "Validado") approvedCount++;
  
  const globalProgressPercentage = Math.round((approvedCount / totalDocs) * 100);
  const isActuallyAdmitted = applicant.admitted === true || applicant.admitted === "ADMITIDO";

  // Compress image helper
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

  const handleSaveDocument = (docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile") => {
    let filename = "";
    let dataUrl = "";
    if (docKey === "dniFile") {
      filename = stagedDniFile;
      dataUrl = stagedDniPreview;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Copia de DNI primero.");
        return;
      }
      setStagedDniFile("");
    } else if (docKey === "certificadoFile") {
      filename = stagedCertFile;
      dataUrl = stagedCertPreview;
      if (!filename) {
        alert("Por favor, seleccione una imagen para el Certificado de Secundaria primero.");
        return;
      }
      setStagedCertFile("");
    } else if (docKey === "partidaFile") {
      filename = stagedPartidaFile;
      dataUrl = stagedPartidaPreview;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Partida de Nacimiento primero.");
        return;
      }
      setStagedPartidaFile("");
    } else if (docKey === "fotoFile") {
      filename = stagedFotoFile;
      dataUrl = stagedFotoPreview;
      if (!filename) {
        alert("Por favor, seleccione una imagen para la Foto primero.");
        return;
      }
      setStagedFotoFile("");
    }

    const updatedApplicant: Applicant = {
      ...applicant,
      docs: {
        ...applicant.docs,
        [docKey]: {
          status: "Pendiente" as const,
          fileName: filename,
          fileDataUrl: dataUrl
        }
      }
    };

    onUpdateApplicant(updatedApplicant);
    alert(`¡Documento "${filename}" enviado a validación por secretaría!`);
  };

  const handleSubmitPaymentVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentType === "number") {
      if (!paymentVoucher.trim()) {
        alert("Por favor ingrese el número de operación bancaria de su pago.");
        return;
      }
      const updatedApplicant: Applicant = {
        ...applicant,
        paymentStatus: "Pendiente" as const,
        paymentOperation: paymentVoucher.trim(),
        paymentType: "number",
        paymentVoucherFileName: undefined,
        paymentVoucherUrl: undefined
      };
      onUpdateApplicant(updatedApplicant);
      alert("¡Número de operación de pago ingresado correctamente! Estado actualizado a Pendiente de validación bancaria.");
    } else {
      if (!stagedVoucherPreview) {
        alert("Por favor seleccione la imagen de su voucher de pago primero.");
        return;
      }
      const updatedApplicant: Applicant = {
        ...applicant,
        paymentStatus: "Pendiente" as const,
        paymentOperation: stagedVoucherFile || "VOUCHER-IMG",
        paymentType: "voucher",
        paymentVoucherFileName: stagedVoucherFile,
        paymentVoucherUrl: stagedVoucherPreview
      };
      onUpdateApplicant(updatedApplicant);
      setStagedVoucherFile("");
      setStagedVoucherPreview("");
      alert("¡Voucher de pago enviado correctamente! Estado actualizado a Pendiente de validación por Tesorería.");
    }
  };

  const handleSubmitMatriculaVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    let currentEnr = enrollments.find(enr => enr.studentDni === applicant.dni);
    if (!currentEnr) {
      currentEnr = {
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

    if (matriculaPaymentType === "number") {
      if (!matriculaVoucher.trim()) {
        alert("Por favor ingrese el número de operación de su depósito de matrícula.");
        return;
      }
      const updatedEnr: Enrollment = {
        ...currentEnr,
        paymentStatus: "Pendiente" as const,
        paymentOperation: matriculaVoucher.trim(),
        paymentType: "number",
        paymentVoucherFileName: undefined,
        paymentVoucherUrl: undefined
      };
      if (onUpdateEnrollment) onUpdateEnrollment(updatedEnr);
      setIsEditingMatricula(false);
      alert("¡Operación de matrícula enviada! La oficina de caja (MAMC) validará el abono de S/. 250.00 a la brevedad.");
    } else {
      if (!stagedMatriculaPreview) {
        alert("Por favor seleccione la foto de su voucher de depósito de matrícula.");
        return;
      }
      const updatedEnr: Enrollment = {
        ...currentEnr,
        paymentStatus: "Pendiente" as const,
        paymentOperation: stagedMatriculaFile || "VOUCHER-MATRICULA",
        paymentType: "voucher",
        paymentVoucherFileName: stagedMatriculaFile,
        paymentVoucherUrl: stagedMatriculaPreview
      };
      if (onUpdateEnrollment) onUpdateEnrollment(updatedEnr);
      setIsEditingMatricula(false);
      setStagedMatriculaFile("");
      setStagedMatriculaPreview("");
      alert("¡Foto de voucher de matrícula enviada! La oficina de caja (MAMC) verificará el comprobante.");
    }
  };

  const currentProgram = ACADEMIC_PROGRAMS.find(p => p.id === applicant.programId) || {
    id: applicant.programId,
    name: "Electricidad Industrial",
    code: "EI-2026",
    duration: "3 años (6 Semestres)",
    title: "Profesional Técnico en Electricidad Industrial",
    description: "Formación integral en sistemas eléctricos industriales."
  };

  // Nav items list for Sidebar
  const sidebarItems = [
    { id: "dashboard", label: "Inicio / Mi Resumen", icon: LayoutDashboard },
    { id: "documentos", label: "Expediente de Admisión", icon: FileText, badge: `${approvedCount}/4` },
    { id: "pagos", label: "Estado de Pago", icon: CreditCard },
    { id: "resultados", label: "Resultados y Constancia", icon: Award },
    { id: "soporte", label: "Atención y Soporte", icon: Headset },
  ];

  if (isActuallyAdmitted) {
    sidebarItems.push({ id: "matricula", label: "Pago de Matrícula (Ingresantes)", icon: Landmark });
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        title='SFA Admisión'
        subtitle='Portal del Postulante'
        items={sidebarItems}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as any)}
        onLogout={onLogout}
        onGoToPortal={onGoToPortal}
        userProfile={{
          name: `${applicant.name} ${applicant.lastName}`,
          role: "Postulante 2026-I",
          avatarBg: "bg-gradient-to-br from-[#8B0020] to-[#590013] text-amber-300 font-black border border-amber-400/40"
        }}
      />

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8 custom-scrollbar">
        {/* TOP BAR HEADER */}
        <PageHeader 
          title={
            activeTab === "dashboard" ? "Resumen de Admisión" :
            activeTab === "documentos" ? "Expediente Digital" :
            activeTab === "pagos" ? "Estado de Pago" :
            activeTab === "resultados" ? "Resultados de Evaluación" :
            activeTab === "soporte" ? "Mesa de Ayuda" : "Matrícula de Ingresante"
          }
          subtitle={`Bienvenido al portal institucional, ${applicant.name}`}
        />


        {/* ALERTS DISPLAY */}
        {applicant.admitted === true && (
          <AlertBox 
            variant="success"
            title="¡FELICIDADES! VACANTE OFICIAL ALCANZADA"
            message={`Ha sido ADMITIDO oficialmente en la carrera técnica de ${currentProgram.name}. Ya puede acceder a la pestaña de 'Pago de Matrícula' y descargar su Constancia de Admisión.`}
            action={
              <button 
                onClick={() => setIsConstanciaModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-md cursor-pointer"
              >
                Ver Constancia
              </button>
            }
          />
        )}

        {/* ACTIVE TAB CONTENT RENDER */}
        {activeTab === "dashboard" && (
          <DashboardMainTab 
            applicant={applicant}
            currentProgram={currentProgram}
            globalProgressPercentage={globalProgressPercentage}
            approvedCount={approvedCount}
            isActuallyAdmitted={isActuallyAdmitted}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "documentos" && (
          <DocumentosTab 
            applicant={applicant}
            approvedCount={approvedCount}
            totalDocs={totalDocs}
            globalProgressPercentage={globalProgressPercentage}
            openDocs={openDocs}
            toggleDoc={toggleDoc}
            handleFileChange={handleFileChange}
            triggerPreview={triggerPreview}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "pagos" && (
          <PagosTab 
            applicant={applicant}
            paymentDate={paymentDate}
            paymentVoucher={paymentVoucher}
            setPaymentVoucher={setPaymentVoucher}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            stagedVoucherFile={stagedVoucherFile}
            setStagedVoucherFile={setStagedVoucherFile}
            stagedVoucherPreview={stagedVoucherPreview}
            setStagedVoucherPreview={setStagedVoucherPreview}
            handleSubmitPaymentVoucher={handleSubmitPaymentVoucher}
            compressAndResizeImage={compressAndResizeImage}
            triggerPreview={triggerPreview}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "resultados" && (
          <ResultadosTab 
            applicant={applicant}
            currentProgram={currentProgram}
            isActuallyAdmitted={isActuallyAdmitted}
            approvedCount={approvedCount}
            registrationDate={registrationDate}
            paymentDate={paymentDate}
            setIsConstanciaModalOpen={setIsConstanciaModalOpen}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "soporte" && (
          <SoporteTab 
            applicant={applicant}
            onUpdateApplicant={onUpdateApplicant}
            supportCategory={supportCategory}
            setSupportCategory={setSupportCategory}
            supportMessage={supportMessage}
            setSupportMessage={setSupportMessage}
          />
        )}

        {activeTab === "matricula" && (
          <MatriculaTab 
            applicant={applicant}
            currentProgram={currentProgram}
            enrollments={enrollments}
            matriculaVoucher={matriculaVoucher}
            setMatriculaVoucher={setMatriculaVoucher}
            matriculaPaymentType={matriculaPaymentType}
            setMatriculaPaymentType={setMatriculaPaymentType}
            stagedMatriculaFile={stagedMatriculaFile}
            setStagedMatriculaFile={setStagedMatriculaFile}
            stagedMatriculaPreview={stagedMatriculaPreview}
            setStagedMatriculaPreview={setStagedMatriculaPreview}
            isEditingMatricula={isEditingMatricula}
            setIsEditingMatricula={setIsEditingMatricula}
            handleStartEditMatricula={handleStartEditMatricula}
            handleSubmitMatriculaVoucher={handleSubmitMatriculaVoucher}
            compressAndResizeImage={compressAndResizeImage}
          />
        )}
      </main>

      {/* CONSTANCIA MODAL */}
      <ConstanciaModal 
        isOpen={isConstanciaModalOpen}
        onClose={() => setIsConstanciaModalOpen(false)}
        applicant={applicant}
      />

      {/* STAGED UPLOAD PREVIEW MODAL */}
      <AnimatePresence>
        {stagedUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden text-left"
            >
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

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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

      {/* FULL-SIZE IMAGE PREVIEW MODAL */}
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
