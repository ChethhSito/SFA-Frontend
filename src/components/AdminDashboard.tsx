import React, { useState } from "react";
import { 
  ShieldAlert, CheckCircle, XCircle, FileText, CreditCard, Users, 
  MapPin, Plus, Trash2, Award, Calendar, FileSpreadsheet, Compass, LogOut, Save, GraduationCap, CheckSquare, Mail, Phone, MessageSquare
} from "lucide-react";
import { Applicant, Enrollment, StudentPersonalData, Program, Classroom, Teacher, Graduation, AdmissionPeriod } from "@/types";
import { ACADEMIC_PROGRAMS } from "@/lib/mockData";

// Reusable Custom Design System Components
import Button from "./ui-custom/Button";
import Badge from "./ui-custom/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui-custom/Card";
import PageHeader from "./ui-custom/PageHeader";
import AlertBox from "./ui-custom/AlertBox";
import Sidebar from "./ui-custom/Sidebar";
import PageTransition from "./ui-custom/PageTransition";
import ImagePreviewModal from "./ui-custom/ImagePreviewModal";

interface AdminDashboardProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  studentsList: { [dni: string]: StudentPersonalData };
  classrooms: Classroom[];
  teachers: Teacher[];
  graduations: Graduation[];
  admissionPeriods?: AdmissionPeriod[];
  onUpdateApplicants: (apps: Applicant[]) => void;
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateClassrooms: (rooms: Classroom[]) => void;
  onUpdateTeachers: (tchs: Teacher[]) => void;
  onUpdateGraduations: (grads: Graduation[]) => void;
  onUpdateAdmissionPeriods?: (periods: AdmissionPeriod[]) => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  applicants,
  enrollments,
  studentsList,
  classrooms,
  teachers,
  graduations,
  admissionPeriods = [],
  onUpdateApplicants,
  onUpdateEnrollments,
  onUpdateClassrooms,
  onUpdateTeachers,
  onUpdateGraduations,
  onUpdateAdmissionPeriods = () => {},
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"caja" | "secretaria" | "aprobados" | "matricula" | "periodos" | "soporte">("caja");
  const [selectedMatriculaDni, setSelectedMatriculaDni] = useState<string | null>(null);
  const [matriculaShifts, setMatriculaShifts] = useState<{ [dni: string]: "Mañana" | "Tarde" | "Noche" }>({});
  const [matriculaCareers, setMatriculaCareers] = useState<{ [dni: string]: any }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pending" | "matriculado">("all");
  
  // Period & applicant-oriented folder states
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const active = admissionPeriods.find(p => p.isActive);
    return active ? active.id : (admissionPeriods[0]?.id || "1");
  });
  const [applicantFilterType, setApplicantFilterType] = useState<"all" | "pending" | "observed" | "approved" | "enrolled">("all");

  // Local state for the new period creator
  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodPreEnrollmentStartDate, setNewPeriodPreEnrollmentStartDate] = useState("");
  const [newPeriodPreEnrollmentEndDate, setNewPeriodPreEnrollmentEndDate] = useState("");
  const [newPeriodAdmissionDate, setNewPeriodAdmissionDate] = useState("");
  const [newPeriodEnrollmentStartDate, setNewPeriodEnrollmentStartDate] = useState("");
  const [newPeriodEnrollmentEndDate, setNewPeriodEnrollmentEndDate] = useState("");
  const [newPeriodClassesStartDate, setNewPeriodClassesStartDate] = useState("");

  // Correction feedback field for document validation
  const [docObservationInput, setDocObservationInput] = useState<{ [key: string]: string }>({});

  // Local state for folder levels observations input
  const [folderObservationInput, setFolderObservationInput] = useState<{ [key: string]: string }>({});

  // State for observing payment modal
  const [observePaymentModalOpen, setObservePaymentModalOpen] = useState(false);
  const [observePaymentDni, setObservePaymentDni] = useState<string | null>(null);
  const [observePaymentReason, setObservePaymentReason] = useState("");

  // State for confirming approvals (safety check: "seguro de aprobar confirmar y cerrar")
  const [approvePaymentModalOpen, setApprovePaymentModalOpen] = useState(false);
  const [approvePaymentDni, setApprovePaymentDni] = useState<string | null>(null);
  const [approvePaymentType, setApprovePaymentType] = useState<"admision" | "matricula">("admision");

  // State for image previewer
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileType, setPreviewFileType] = useState<"image" | "receipt">("image");
  const [previewMetadata, setPreviewMetadata] = useState<any>({});

  // States for Admin support help desk
  const [selectedSupportAppDni, setSelectedSupportAppDni] = useState<string | null>(null);
  const [adminSupportReply, setAdminSupportReply] = useState("");

  const triggerAdminPreview = (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => {
    setPreviewTitle(title);
    setPreviewFileName(fileName);
    setPreviewFileType(fileType);
    setPreviewMetadata(customMeta);
    setPreviewOpen(true);
  };

  const openObservePaymentModal = (dni: string) => {
    setObservePaymentDni(dni);
    setObservePaymentReason("");
    setObservePaymentModalOpen(true);
  };

  const handleConfirmObservePayment = () => {
    if (!observePaymentReason.trim()) {
      alert("Por favor escriba o seleccione un motivo para la observacion.");
      return;
    }
    const updated = applicants.map((app) => {
      if (app.dni === observePaymentDni) {
        return { 
          ...app, 
          paymentStatus: "Observado" as any,
          paymentObservations: observePaymentReason
        };
      }
      return app;
    });

    onUpdateApplicants(updated);
    setObservePaymentModalOpen(false);
    setObservePaymentDni(null);
    setObservePaymentReason("");
    alert("Pago del Postulante observado con exito");
  };

  const openApprovePaymentConfirm = (dni: string, type: "admision" | "matricula") => {
    setApprovePaymentDni(dni);
    setApprovePaymentType(type);
    setApprovePaymentModalOpen(true);
  };

  const handleConfirmAndCloseApprovePayment = () => {
    if (!approvePaymentDni) return;

    if (approvePaymentType === "admision") {
      const updated = applicants.map((app) => {
        if (app.dni === approvePaymentDni) {
          return { 
            ...app, 
            paymentStatus: "Validado" as any,
            paymentObservations: "" 
          };
        }
        return app;
      });
      onUpdateApplicants(updated);
      alert("Pago de admision del Postulante APROBADO con exito, confirmado y cerrado.");
    } else {
      const updated = enrollments.map((enr) => {
        if (enr.studentDni === approvePaymentDni) {
          return { 
            ...enr, 
            paymentStatus: "Validado" as any,
            academicStatus: "MATRICULADO" as any 
          };
        }
        return enr;
      });
      onUpdateEnrollments(updated);
      alert("¡Pago de Matricula APROBADO con exito, confirmado y cerrado!");
    }

    setApprovePaymentModalOpen(false);
    setApprovePaymentDni(null);
  };

  // Caja/Tesoreria approval functions
  const handleApproveApplicantPayment = (applicantDni: string, approve: boolean) => {
    if (approve) {
      openApprovePaymentConfirm(applicantDni, "admision");
      return;
    }
    const updated = applicants.map((app) => {
      if (app.dni === applicantDni) {
        return { 
          ...app, 
          paymentStatus: "Rechazado" as any,
          paymentObservations: "" 
        };
      }
      return app;
    });

    onUpdateApplicants(updated);
    alert("Pago de admision del Postulante RECHAZADO con exito");
  };

  const handleApproveEnrollmentPayment = (studentDni: string, approve: boolean) => {
    if (approve) {
      openApprovePaymentConfirm(studentDni, "matricula");
      return;
    }
    const updated = enrollments.map((enr) => {
      if (enr.studentDni === studentDni) {
        return { 
          ...enr, 
          paymentStatus: "Observado" as any,
          academicStatus: "ADMITIDO" as any 
        };
      }
      return enr;
    });

    onUpdateEnrollments(updated);
    alert("Pago de Matricula RECHAZADO/OBSERVADO con exito");
  };

  const handleResetApplicantPayment = (applicantDni: string) => {
    const updated = applicants.map((app) => {
      if (app.dni === applicantDni) {
        return { 
          ...app, 
          paymentStatus: "Pendiente" as any,
          paymentObservations: "" 
        };
      }
      return app;
    });
    onUpdateApplicants(updated);
    alert("Estado del pago de examen restablecido a 'Pendiente' para su corrección.");
  };

  const handleResetEnrollmentPayment = (studentDni: string) => {
    const updated = enrollments.map((enr) => {
      if (enr.studentDni === studentDni) {
        return { 
          ...enr, 
          paymentStatus: "Pendiente" as any,
          academicStatus: "ADMITIDO" as any 
        };
      }
      return enr;
    });
    onUpdateEnrollments(updated);
    alert("Estado del pago de matrícula restablecido a 'Pendiente' para su corrección.");
  };

  const handleConfirmMatricula = (studentDni: string, shift: "Mañana" | "Tarde" | "Noche", programId: any) => {
    const existing = enrollments.find(e => e.studentDni === studentDni);
    let updatedEnrList: Enrollment[];
    if (existing) {
      updatedEnrList = enrollments.map(enr => {
        if (enr.studentDni === studentDni) {
          return {
            ...enr,
            programId: programId,
            academicStatus: "MATRICULADO" as const,
            shift: shift,
            paymentStatus: "Validado" as const
          };
        }
        return enr;
      });
    } else {
      updatedEnrList = [
        ...enrollments,
        {
          studentDni: studentDni,
          programId: programId,
          academicStatus: "MATRICULADO" as const,
          docs: {
            dniFile: { status: "Validado" },
            certificadoFile: { status: "Validado" },
            partidaFile: { status: "Validado" },
            fotoFile: { status: "Validado" }
          },
          paymentStatus: "Validado",
          paymentOperation: "MATR-" + Math.floor(10000 + Math.random() * 90000),
          shift: shift
        }
      ];
    }
    
    const updatedApps = applicants.map(a => {
      if (a.dni === studentDni) {
        return {
          ...a,
          folderStatus: "Enrolled" as const,
          admitted: true
        };
      }
      return a;
    });
    
    onUpdateApplicants(updatedApps);
    onUpdateEnrollments(updatedEnrList);
    alert("Postulante admisionado matriculado con éxito en el Ciclo I");
  };

  const handleResetMatricula = (studentDni: string) => {
    const updated = enrollments.map(enr => {
      if (enr.studentDni === studentDni) {
        return {
          ...enr,
          academicStatus: "ADMITIDO" as const
        };
      }
      return enr;
    });
    const updatedApps = applicants.map(a => {
      if (a.dni === studentDni) {
        return {
          ...a,
          folderStatus: "Approved" as const
        };
      }
      return a;
    });
    onUpdateApplicants(updatedApps);
    onUpdateEnrollments(updated);
    alert("Inscripción de matrícula revertida a Solo Admitido.");
  };

  // Document validation & observations registering for Applicants
  const handleValidateApplicantDocument = (
    applicantDni: string,
    docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile",
    approve: boolean
  ) => {
    const observationMessage = docObservationInput[`${applicantDni}-${docKey}`] || "";

    if (!approve && !observationMessage.trim()) {
      alert("Para observar un archivo de admisión es obligatorio registrar una nota explicativa.");
      return;
    }

    const updated = applicants.map((app) => {
      if (app.dni === applicantDni) {
        const docsObj = app.docs || {
          dniFile: { status: "No Enviado" as const },
          certificadoFile: { status: "No Enviado" as const },
          partidaFile: { status: "No Enviado" as const },
          fotoFile: { status: "No Enviado" as const }
        };
        const currentDoc = docsObj[docKey] || { status: "No Enviado" as const };

        return {
          ...app,
          docs: {
            ...docsObj,
            [docKey]: {
              ...currentDoc,
              status: (approve ? "Validado" : "Observado") as any,
              observations: approve ? "" : observationMessage
            }
          }
        };
      }
      return app;
    });

    onUpdateApplicants(updated);

    // clear input
    setDocObservationInput({
      ...docObservationInput,
      [`${applicantDni}-${docKey}`]: ""
    });

    alert(`¡Archivo ${docKey} clasificado como ${approve ? "VALIDADO" : "OBSERVADO"} para el postulante!`);
  };

  // Change overall applicant folder status and observations
  const handleUpdateFolderStatus = (
    applicantDni: string,
    status: "Pending" | "Observed" | "Approved" | "Enrolled"
  ) => {
    const obsText = folderObservationInput[applicantDni] || "";
    if (status === "Observed" && !obsText.trim()) {
      alert("Para marcar un expediente como observado es obligatorio ingresar una observación general.");
      return;
    }

    const updated = applicants.map((app) => {
      if (app.dni === applicantDni) {
        const isAdmitted = status === "Approved" || status === "Enrolled";
        return {
          ...app,
          folderStatus: status,
          folderObservations: status === "Observed" ? obsText : app.folderObservations,
          admitted: isAdmitted ? true : app.admitted
        };
      }
      return app;
    });

    onUpdateApplicants(updated);
    alert(`Carpeta del postulante con DNI ${applicantDni} actualizada a estado: ${status}.`);
  };

  // Pre-existing document validation for regular students
  const handleValidateDocument = (studentDni: string, docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile", approve: boolean) => {
    const observationMessage = docObservationInput[`${studentDni}-${docKey}`] || "";
    
    if (!approve && !observationMessage.trim()) {
      alert("Para observar un archivo escolar es obligatorio registrar una nota explicativa.");
      return;
    }

    const updated = enrollments.map((enr) => {
      if (enr.studentDni === studentDni) {
        const updatedDocs = { ...enr.docs };
        updatedDocs[docKey] = {
          ...updatedDocs[docKey],
          status: (approve ? "Validado" : "Observado") as any,
          observations: approve ? undefined : observationMessage
        };
        return { ...enr, docs: updatedDocs };
      }
      return enr;
    });

    onUpdateEnrollments(updated);
    
    // clear input
    setDocObservationInput({
      ...docObservationInput,
      [`${studentDni}-${docKey}`]: ""
    });

    alert(`¡Documento escolar ${docKey} clasificado como ${approve ? "VALIDADO" : "OBSERVADO"} para el alumno!`);
  };

  // Filter and search logic for Secretaría General
  const filteredEnrollments = enrollments.filter((enr) => {
    const student = studentsList[enr.studentDni];
    if (!student) return false;
    
    const fullName = `${student.name} ${student.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || student.dni.includes(query);
    
    if (!matchesSearch) return false;
    
    if (filterType === "pending") {
      return Object.values(enr.docs).some((d: any) => d.status === "Pendiente");
    }
    if (filterType === "matriculado") {
      return enr.academicStatus === "MATRICULADO";
    }
    return true;
  });

  // Admission periods handlers
  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newPeriodName.trim().toUpperCase();
    if (!formatted) return;

    if (
      !newPeriodPreEnrollmentStartDate || 
      !newPeriodPreEnrollmentEndDate || 
      !newPeriodAdmissionDate || 
      !newPeriodEnrollmentStartDate || 
      !newPeriodEnrollmentEndDate || 
      !newPeriodClassesStartDate
    ) {
      alert("Por favor complete todas las fechas del período: Pre-Inscripción, Examen de Admisión, de Matrícula e Inicio de Clases.");
      return;
    }

    const exists = admissionPeriods.some(p => p.name === formatted);
    if (exists) {
      alert(`El periodo académico "${formatted}" ya ha sido registrado.`);
      return;
    }

    const newPeriod: AdmissionPeriod = {
      id: `period-${Date.now()}`,
      name: formatted,
      isActive: false,
      status: "PENDIENTE",
      preEnrollmentStartDate: newPeriodPreEnrollmentStartDate,
      preEnrollmentEndDate: newPeriodPreEnrollmentEndDate,
      admissionDate: newPeriodAdmissionDate,
      enrollmentStartDate: newPeriodEnrollmentStartDate,
      enrollmentEndDate: newPeriodEnrollmentEndDate,
      classesStartDate: newPeriodClassesStartDate
    };

    onUpdateAdmissionPeriods([...admissionPeriods, newPeriod]);
    setNewPeriodName("");
    setNewPeriodPreEnrollmentStartDate("");
    setNewPeriodPreEnrollmentEndDate("");
    setNewPeriodAdmissionDate("");
    setNewPeriodEnrollmentStartDate("");
    setNewPeriodEnrollmentEndDate("");
    setNewPeriodClassesStartDate("");
  };

  const handleUpdatePeriodStatus = (id: string, nextStatus: "PENDIENTE" | "APERTURADO" | "EXAMEN" | "MATRICULA" | "CERRADO") => {
    const updated = admissionPeriods.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          status: nextStatus, 
          isActive: nextStatus === "APERTURADO" 
        };
      }
      // Deactivate other periods if this one is becoming the active one
      return {
        ...p,
        isActive: nextStatus === "APERTURADO" ? false : p.isActive
      };
    });

    onUpdateAdmissionPeriods(updated);
  };

  return (
    <div 
      id="admin-dashboard" 
      className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row pb-0"
    >
      {/* Sidebar navigation */}
      <Sidebar
        institution={{
          name: "IESTP SFA",
          subtitle: "Consola Administrativa"
        }}
        user={{
          name: "Personal Directivo / SFA",
          role: "Coordinación & Tesorería",
          status: "DIRECTOR",
        }}
        sections={[
          {
            title: "MÓDULOS DE ADMINISTRACIÓN",
            items: [
              {
                label: "Caja & Tesorería",
                icon: <CreditCard className="w-4 h-4" />,
                route: "caja",
                active: activeTab === "caja"
              },
              {
                label: "Secretaría General",
                icon: <FileText className="w-4 h-4" />,
                route: "secretaria",
                active: activeTab === "secretaria"
              },
              {
                label: "Postulantes",
                icon: <Users className="w-4 h-4" />,
                route: "aprobados",
                active: activeTab === "aprobados"
              },
              {
                label: "Ingresantes",
                icon: <GraduationCap className="w-4 h-4" />,
                route: "matricula",
                active: activeTab === "matricula"
              },
              {
                label: "Períodos de Admisión",
                icon: <Calendar className="w-4 h-4" />,
                route: "periodos",
                active: activeTab === "periodos"
              },
              {
                label: "Soporte Técnico",
                icon: <Compass className="w-4 h-4" />,
                route: "soporte",
                active: activeTab === "soporte"
              }
            ]
          }
        ]}
        onItemClick={(route) => setActiveTab(route as any)}
        onLogout={onLogout}
      />

      {/* Main viewport area - scrollable only inside */}
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-slate-50 relative custom-scrollbar">
        
        {/* Tab Caixa / Admission or Regular payments auditing */}
        {activeTab === "caja" && (
          <PageTransition id="caja" className="space-y-6">
            <PageHeader
              title="Oficina de Caja y Tesorería Académica"
              subtitle="Audite los recibos financieros emitidos de derecho de admisión ordinario y matrículas semestrales de S/. 250."
              icon={<CreditCard className="w-6 h-6" />}
            />

            {/* Applicant Admission paid vouchers list */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>1. Validaciones para Examen de Admisión Directo/Ordinario</CardTitle>
                  <CardDescription>Derechos de postulación pagados por postulantes virtuales (Tasa S/. 120.00)</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto text-xs font-semibold animate-fade-in">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                        <th className="p-4 text-left">Postulante</th>
                        <th className="p-4 text-left">DNI / Código</th>
                        <th className="p-4 text-left">Especialidad</th>
                        <th className="p-4 text-left">Operación N°</th>
                        <th className="p-4 text-left">Costo Base</th>
                        <th className="p-4 text-left">Estado</th>
                        <th className="p-4 text-center">Acción Fiscal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {applicants.filter((app) => app.paymentOperation).map((app, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-black text-slate-900">{app.name} {app.lastName}</td>
                          <td className="p-4 font-mono text-xs text-slate-600 leading-tight">
                            <span className="block font-bold text-slate-850">{app.dni}</span>
                            <span className="block text-[9px] text-amber-600 font-extrabold">{app.applicantCode || "No tiene"}</span>
                          </td>
                          <td className="p-4 uppercase text-slate-500 text-[11px] font-bold">
                            {ACADEMIC_PROGRAMS.find(p => p.id === app.programId)?.name || app.programId}
                          </td>
                          <td className="p-4 font-mono text-xs">
                            <span className="font-bold text-[#5493D5] block mb-1">{app.paymentOperation}</span>
                            <button 
                              onClick={() => triggerAdminPreview("Voucher de Admisión - " + app.name.toUpperCase(), app.paymentOperation || "VOUCHER", "image", { 
                                dni: app.dni, 
                                studentName: app.name, 
                                studentLastName: app.lastName,
                                amount: "S/. 120.00",
                                concept: "Derecho de Examen Ordinario 2026",
                                transactionId: app.paymentOperation
                              })}
                              className="text-[9px] uppercase font-sans font-extrabold bg-slate-100 hover:bg-[#9F062A]/5 hover:text-[#9F062A] text-slate-600 rounded px-1.5 py-0.5 tracking-wider border border-slate-200 transition-colors cursor-pointer"
                            >
                              Ver Voucher
                            </button>
                          </td>
                          <td className="p-4 font-bold">S/. 120.00</td>
                          <td className="p-4">
                            {app.paymentStatus === "Validado" ? (
                              <Badge variant="success" pulse>VALIDADO</Badge>
                            ) : app.paymentStatus === "Observado" ? (
                              <Badge variant="danger">OBSERVADO</Badge>
                            ) : app.paymentStatus === "Rechazado" ? (
                              <Badge variant="danger">RECHAZADO</Badge>
                            ) : (
                              <Badge variant="warning">PENDIENTE</Badge>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {app.paymentStatus === "Pendiente" ? (
                              <div className="flex gap-1.5 justify-center">
                                <Button 
                                  onClick={() => handleApproveApplicantPayment(app.dni, true)}
                                  variant="primary"
                                  size="sm"
                                  className="font-bold tracking-wider rounded-md"
                                >
                                  Aprobar
                                </Button>
                                <Button 
                                  onClick={() => openObservePaymentModal(app.dni)}
                                  variant="outline"
                                  size="sm"
                                  className="font-bold tracking-wider rounded-md border-red-200 hover:bg-red-50 text-red-700"
                                >
                                  Observar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 justify-center">
                                {app.paymentStatus === "Observado" ? (
                                  <div className="text-left max-w-xs p-1.5 bg-red-50/60 border border-red-200 rounded text-[9.5px] font-bold text-slate-700 leading-tight">
                                    <span className="font-black uppercase text-red-750 block text-[8px] mb-0.5">Observado:</span>
                                    "{app.paymentObservations}"
                                  </div>
                                ) : app.paymentStatus === "Rechazado" ? (
                                  <span className="text-red-700 font-black text-[10px] uppercase tracking-wider">Pago Rechazado</span>
                                ) : (
                                  <span className="text-emerald-700 font-black text-[10px] uppercase tracking-wider">Aprobado / Cerrado</span>
                                )}
                                <button 
                                  onClick={() => handleResetApplicantPayment(app.dni)}
                                  className="text-[8.5px] uppercase font-sans font-black bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-1 tracking-wider transition-colors cursor-pointer"
                                  title="Restablecer para poder cambiar de estado o corregir aprobación por causalidad"
                                >
                                  🔄 Corregir / Reestablecer
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Students matricula regular semester paid vouchers lists */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>2. Validaciones de Matrícula Regular e Inscripción</CardTitle>
                  <CardDescription>Inscripciones para el periodo ordinario de ingresantes y estudiantes admitidos (Tasa S/. 250.00)</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto text-xs font-semibold animate-fade-in">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                        <th className="p-4 text-left">Alumno</th>
                        <th className="p-4 text-left">DNI</th>
                        <th className="p-4 text-left">Inscripción N°</th>
                        <th className="p-4 text-left">Derecho Regular</th>
                        <th className="p-4 text-left">Estado Pago</th>
                        <th className="p-4 text-left">Ficha Matrícula</th>
                        <th className="p-4 text-center">Acción Fiscal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                      {enrollments.filter((enr) => enr.paymentOperation).map((enr, idx) => {
                        const student = studentsList[enr.studentDni];
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-black text-slate-900">{student?.name} {student?.lastName}</td>
                            <td className="p-4 font-mono text-slate-600 font-bold">{enr.studentDni}</td>
                            <td className="p-4 font-mono text-xs">
                              <span className="font-bold text-[#5493D5] block mb-1">{enr.paymentOperation}</span>
                              <button 
                                onClick={() => triggerAdminPreview("Voucher de Matrícula - " + (student?.name || "").toUpperCase(), enr.paymentOperation || "VOUCHER", "image", { 
                                  dni: enr.studentDni, 
                                  studentName: student?.name, 
                                  studentLastName: student?.lastName,
                                  amount: "S/. 250.00",
                                  concept: "Derecho Regular de Matrícula 2026",
                                  transactionId: enr.paymentOperation
                                })}
                                className="text-[9px] uppercase font-sans font-extrabold bg-slate-100 hover:bg-[#9F062A]/5 hover:text-[#9F062A] text-slate-600 rounded px-1.5 py-0.5 tracking-wider border border-slate-200 transition-colors cursor-pointer"
                              >
                                Ver Voucher
                              </button>
                            </td>
                            <td className="p-4 font-bold">S/. 250.00</td>
                            <td className="p-4">
                              {enr.paymentStatus === "Validado" ? (
                                <Badge variant="success" pulse>VALIDADO</Badge>
                              ) : enr.paymentStatus === "Observado" ? (
                                <Badge variant="danger">RECHAZADO/OBS.</Badge>
                              ) : (
                                <Badge variant="warning">PENDIENTE</Badge>
                              )}
                            </td>
                            <td className="p-4">
                              {enr.academicStatus === "MATRICULADO" ? (
                                <Badge variant="success">MATRICULADO</Badge>
                              ) : (
                                <Badge variant="neutral">SOLO ADMITIDO</Badge>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {enr.paymentStatus === "Pendiente" ? (
                                <div className="flex gap-1.5 justify-center">
                                  <Button 
                                    onClick={() => handleApproveEnrollmentPayment(enr.studentDni, true)}
                                    variant="primary"
                                    size="sm"
                                    className="font-bold tracking-wider"
                                  >
                                    Validar S/.250
                                  </Button>
                                  <Button 
                                    onClick={() => handleApproveEnrollmentPayment(enr.studentDni, false)}
                                    variant="outline"
                                    size="sm"
                                    className="font-bold tracking-wider"
                                  >
                                    Rechazar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-emerald-700 font-black text-[10px] uppercase tracking-wider">Verificado / Cerrado</span>
                                  <button 
                                    onClick={() => handleResetEnrollmentPayment(enr.studentDni)}
                                    className="text-[8px] uppercase font-sans font-black bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-0.5 tracking-wider transition-colors cursor-pointer"
                                    title="Restablecer para poder corregir o cambiar de estado"
                                  >
                                    🔄 Restablecer 
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}

         {/* Tab Secretaria / Document folders reviews */}
        {activeTab === "secretaria" && (
          <PageTransition id="secretaria" className="space-y-6">
            <PageHeader
              title="División de Admisiones Institucionales"
              subtitle="Gestione carpetas de admisión, audite requisitos digitales por período y resuelva incidencias de postulación."
              icon={<FileText className="w-6 h-6 text-[#9F062A]" />}
            />

            {/* 1. Academic Period Selector Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 shadow-md border-b-4 border-amber-500 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 z-10">
                <span className="text-[10px] text-amber-300 font-extrabold tracking-widest uppercase block">Período de Admisión Administrado</span>
                <h3 className="text-lg md:text-xl font-black font-display tracking-tight">Periodo de Admisión: {admissionPeriods.find(p => p.id === selectedPeriodId)?.name || "Seleccione Periodo"}</h3>
                <p className="text-xs text-slate-300 font-medium">Las estadísticas, filtros y postulantes mostrados corresponden únicamente a esta cohorte.</p>
              </div>
              <div className="flex items-center gap-2.5 z-10 bg-slate-800 p-2 rounded-lg border border-slate-700 w-full md:w-auto">
                <label htmlFor="period-dashboard-selector" className="text-xs font-extrabold tracking-wide text-slate-300 uppercase whitespace-nowrap">Periodo:</label>
                <select
                  id="period-dashboard-selector"
                  value={selectedPeriodId}
                  onChange={(e) => setSelectedPeriodId(e.target.value)}
                  className="bg-slate-950 text-white border border-slate-800 rounded-md px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-amber-500 w-full md:w-auto cursor-pointer"
                >
                  {admissionPeriods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.status === "APERTURADO" ? "(ACTIVO)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="absolute right-6 bottom-4 opacity-5 pointer-events-none hidden lg:block">
                <GraduationCap className="w-32 h-32" />
              </div>
            </div>

            {/* 2. Key Dynamic Stats for selected period */}
            {(() => {
              const activeApplicants = applicants.filter(app => app.periodId === selectedPeriodId);
              const totalInPeriod = activeApplicants.length;
              const pendingF = activeApplicants.filter(a => a.folderStatus === "Pending").length;
              const observedF = activeApplicants.filter(a => a.folderStatus === "Observed").length;
              const approvedF = activeApplicants.filter(a => a.folderStatus === "Approved").length;
              const enrolledF = activeApplicants.filter(a => a.folderStatus === "Enrolled").length;
              const totalRevenue = activeApplicants.filter(a => a.paymentStatus === "Validado").length * 120;

              return (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-bold font-mono">
                  <div className="bg-white border rounded-lg p-3.5 shadow-sm space-y-1 border-slate-200">
                    <span className="text-slate-455 uppercase text-[9px] font-black tracking-wider block text-slate-400">Postulantes</span>
                    <span className="text-xl font-black text-slate-900 block">{totalInPeriod}</span>
                  </div>
                  <div className="bg-yellow-50/40 border border-yellow-200/55 rounded-lg p-3.5 shadow-xs space-y-1">
                    <span className="text-yellow-600/80 uppercase text-[9px] font-black tracking-wider block">Pendientes</span>
                    <span className="text-xl font-black text-yellow-700 block">{pendingF}</span>
                  </div>
                  <div className="bg-red-50/40 border border-red-200/50 rounded-lg p-3.5 shadow-xs space-y-1">
                    <span className="text-red-500/80 uppercase text-[9px] font-black tracking-wider block">Observados</span>
                    <span className="text-xl font-black text-red-650 block">{observedF}</span>
                  </div>
                  <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-lg p-3.5 shadow-xs space-y-1">
                    <span className="text-emerald-600/80 uppercase text-[9px] font-black tracking-wider block">Aprobados & Matric.</span>
                    <span className="text-xl font-black text-emerald-700 block">{approvedF + enrolledF}</span>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3.5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
                    <span className="text-blue-600 uppercase text-[9px] font-black tracking-wider block">Tasa Recaudada</span>
                    <span className="text-xl font-black text-blue-800 block">S/. {totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

            {/* 3. Search & Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Buscar postulante por nombre, apellido o DNI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Buscar</span>
              </div>

              {/* Folder Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "Todos" },
                  { id: "pending", label: "Pendientes" },
                  { id: "observed", label: "Observados" },
                  { id: "approved", label: "Aprobados" },
                  { id: "enrolled", label: "Matriculados" }
                ].map((filt) => (
                  <button
                    key={filt.id}
                    type="button"
                    onClick={() => setApplicantFilterType(filt.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      applicantFilterType === filt.id
                        ? "bg-[#9F062A] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Applicants List Grid */}
            {(() => {
              const activeApplicants = applicants.filter(app => app.periodId === selectedPeriodId);
              const filteredApplicants = activeApplicants.filter((app) => {
                const fullName = `${app.name} ${app.lastName}`.toLowerCase();
                const matchesQuery = 
                  fullName.includes(searchQuery.toLowerCase()) || 
                  app.dni.includes(searchQuery) ||
                  (app.applicantCode && app.applicantCode.toLowerCase().includes(searchQuery.toLowerCase()));
                if (!matchesQuery) return false;

                if (applicantFilterType === "pending") return app.folderStatus === "Pending";
                if (applicantFilterType === "observed") return app.folderStatus === "Observed";
                if (applicantFilterType === "approved") return app.folderStatus === "Approved";
                if (applicantFilterType === "enrolled") return app.folderStatus === "Enrolled";
                return true;
              });

              if (filteredApplicants.length === 0) {
                return (
                  <div className="p-12 text-center bg-white rounded-xl border border-slate-150 shadow-xs">
                    <span className="p-3 bg-slate-50 text-slate-400 rounded-full inline-block mb-3">
                      <Users className="w-8 h-8 mx-auto" />
                    </span>
                    <h4 className="text-slate-800 font-bold text-sm">No se encontraron expedientes de admisiones</h4>
                    <p className="text-slate-400 text-xs mt-1">Verifique la búsqueda, cambie el filtro de estado o agregue postulantes para este período.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {filteredApplicants.map((app, index) => {
                    // Document completions calculations
                    const appDocs = app.docs || {
                      dniFile: { status: "No Enviado" as const },
                      certificadoFile: { status: "No Enviado" as const },
                      partidaFile: { status: "No Enviado" as const },
                      fotoFile: { status: "No Enviado" as const }
                    };
                    const docsList = [
                      { label: "Copia de DNI", key: "dniFile" as const },
                      { label: "Certificado de Secundaria", key: "certificadoFile" as const },
                      { label: "Partida de Nacimiento", key: "partidaFile" as const },
                      { label: "Fotografía Carnet", key: "fotoFile" as const }
                    ];

                    const approvedCount = docsList.filter(d => appDocs[d.key]?.status === "Validado").length;

                    return (
                      <Card key={index} withActiveHighlight className="overflow-hidden border-t-2 border-slate-200">
                        {/* Section 4a: Card Header */}
                        <CardHeader className="bg-slate-50/60 border-b border-slate-100 p-4 sm:p-5">
                          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <span className="w-11 h-11 rounded-full bg-[#9F062A]/10 text-[#9F062A] flex items-center justify-center font-black text-sm shrink-0 border border-slate-200 shadow-3xs">
                                {app.name.charAt(0)}{app.lastName.charAt(0)}
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <CardTitle className="text-sm md:text-base font-black text-slate-900">{app.name} {app.lastName}</CardTitle>
                                  <Badge 
                                    variant={
                                      app.folderStatus === "Enrolled" ? "success" :
                                      app.folderStatus === "Approved" ? "gold" :
                                      app.folderStatus === "Observed" ? "danger" : "neutral"
                                    }
                                  >
                                    Expediente: {
                                      app.folderStatus === "Pending" ? "PENDIENTE" :
                                      app.folderStatus === "Observed" ? "OBSERVADO" :
                                      app.folderStatus === "Approved" ? "APROBADO" : "MATRICULADO"
                                    }
                                  </Badge>
                                </div>
                                <CardDescription className="text-xs text-slate-500 mt-0.5">
                                  Postulando a: <span className="uppercase font-extrabold text-[#9F062A]">
                                    {ACADEMIC_PROGRAMS.find(p => p.id === app.programId)?.name || app.programId}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>

                            {/* Contact Details and Period Tag */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-y-2 gap-x-4 text-[10px] font-bold text-slate-650 bg-white p-3 rounded-lg border border-slate-100 w-full xl:w-auto">
                              <div>
                                <span className="text-slate-400 uppercase text-[9px] block mb-0.5 font-black">DNI / ID</span>
                                <span className="font-mono font-bold">{app.dni}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 uppercase text-[9px] block mb-0.5 font-black text-amber-600">Código</span>
                                <span className="font-mono font-bold text-amber-600 block">{app.applicantCode || "-"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 uppercase text-[9px] block mb-0.5 font-black font-sans">Celular</span>
                                <span>{app.phone}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 uppercase text-[9px] block mb-0.5 font-black">Email Aspirante</span>
                                <span className="truncate max-w-[130px] block" title={app.email}>{app.email}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-400 uppercase text-[9px] block mb-0.5 font-black">Periodo Admisión</span>
                                <span className="text-[#9F062A] font-extrabold block">
                                  {admissionPeriods.find(p => p.id === app.periodId)?.name || "Regular 2026-II"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        {/* Section 4b: Card Content */}
                        <CardContent className="p-4 sm:p-5 space-y-5">
                          {/* Financial & General Folder Observation indicator */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Validation of fee payment record */}
                            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-between gap-3 text-xs">
                              <div className="space-y-0.5">
                                <span className="text-slate-400 uppercase tracking-wide font-black text-[9px] block">Tasa de Admisión S/. 120.00</span>
                                <span className="font-mono font-black text-[#9F062A] text-xs">
                                  {app.paymentOperation ? app.paymentOperation : <span className="text-slate-400 font-bold italic text-[11px]">No registrado</span>}
                                </span>
                              </div>
                              <div>
                                {app.paymentStatus === "Validado" ? (
                                  <Badge variant="success">VALIDADO</Badge>
                                ) : app.paymentStatus === "Observado" ? (
                                  <Badge variant="danger">OBSERVADO</Badge>
                                ) : app.paymentStatus === "Rechazado" ? (
                                  <Badge variant="danger">RECHAZADO</Badge>
                                ) : app.paymentStatus === "Pendiente" ? (
                                  <Badge variant="warning">PENDIENTE</Badge>
                                ) : (
                                  <Badge variant="neutral">SIN ENVIAR</Badge>
                                )}
                              </div>
                            </div>

                            {/* Verification Progress */}
                            <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-between text-xs col-span-2">
                              <div className="space-y-1 w-full mr-4">
                                <span className="text-slate-400 uppercase tracking-wide font-black text-[9px] block">Progreso de Documentación de Admisión Obligatoria</span>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-[#9F062A] h-full" style={{ width: `${Math.round((approvedCount / 4) * 100)}%` }} />
                                </div>
                              </div>
                              <span className="font-mono font-black text-slate-800 text-right whitespace-nowrap shrink-0">{approvedCount} de 4 Aprobados</span>
                            </div>
                          </div>

                          {/* Render folder level global observations box if exists */}
                          {app.folderObservations && app.folderStatus === "Observed" && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs leading-relaxed text-slate-705 font-bold shadow-3xs">
                              <span className="text-[#9F062A] font-black uppercase tracking-wider block text-[9.5px] mb-0.5">⚠️ Observación Global Oficial del Expediente</span>
                              "{app.folderObservations}"
                            </div>
                          )}

                          {/* Verification checklist for files */}
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-1">
                            {docsList.map((docItem) => {
                              const docState = appDocs[docItem.key] || { status: "No Enviado" as const };
                              return (
                                <div 
                                  key={docItem.key} 
                                  className="p-3 bg-slate-50 border border-slate-150/80 rounded-lg flex flex-col justify-between gap-3 text-xs"
                                >
                                  <div>
                                    <div className="flex justify-between items-start gap-1 mb-1.5">
                                      <span className="font-extrabold text-[10px] text-slate-700 uppercase tracking-tight line-clamp-1">{docItem.label}</span>
                                      <div>
                                        {docState.status === "Validado" ? (
                                          <Badge variant="success">VALIDADO</Badge>
                                        ) : docState.status === "Observado" ? (
                                          <Badge variant="danger">OBSERVADO</Badge>
                                        ) : docState.status === "Pendiente" ? (
                                          <Badge variant="warning">POR REVISAR</Badge>
                                        ) : (
                                          <Badge variant="neutral">SIN ENVIAR</Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <span className="text-[10.5px] text-slate-500 font-mono font-bold block">
                                        Archivo:{" "}
                                        {docState.fileName ? (
                                          <span 
                                            onClick={() => triggerAdminPreview(docItem.label + " - " + app.name.toUpperCase(), docState.fileName!, "image", { 
                                              dni: app.dni, 
                                              studentName: app.name, 
                                              studentLastName: app.lastName,
                                              fileDataUrl: docState.fileDataUrl
                                            })}
                                            className="text-blue-600 hover:text-blue-800 underline font-extrabold cursor-pointer transition-colors"
                                            title="Click para ver vista previa oficial"
                                          >
                                            {docState.fileName}
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 italic">No cargado</span>
                                        )}
                                      </span>
                                      {docState.fileName && (
                                        <button 
                                          type="button"
                                          onClick={() => triggerAdminPreview(docItem.label + " - " + app.name.toUpperCase(), docState.fileName!, "image", { 
                                            dni: app.dni, 
                                            studentName: app.name, 
                                            studentLastName: app.lastName,
                                            fileDataUrl: docState.fileDataUrl
                                          })}
                                          className="inline-flex items-center gap-1 text-[8.5px] uppercase font-sans font-black bg-blue-50 hover:bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 tracking-wider border border-blue-200 transition-colors cursor-pointer"
                                        >
                                          Vista Previa
                                        </button>
                                      )}
                                      {docState.status === "Observado" && docState.observations && (
                                        <p className="text-[10px] text-red-550/90 italic font-semibold leading-relaxed">
                                          * Obs: "{docState.observations}"
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Individual Doc Actions */}
                                  {docState.status === "Pendiente" && (
                                    <div className="bg-white p-2 rounded border border-slate-205 space-y-2 mt-1.5 shadow-3xs">
                                      <div>
                                        <label className="block text-[8.5px] uppercase font-black text-slate-400 mb-0.5">Nota de Observación:</label>
                                        <input 
                                          type="text"
                                          placeholder="Causa de observación..."
                                          value={docObservationInput[`${app.dni}-${docItem.key}`] || ""}
                                          onChange={(e) => setDocObservationInput({
                                            ...docObservationInput,
                                            [`${app.dni}-${docItem.key}`]: e.target.value
                                          })}
                                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 focus:bg-white rounded text-[10.5px] font-semibold text-slate-800 focus:outline-[#9F062A]"
                                        />
                                      </div>
                                      <div className="flex gap-1 justify-end pt-0.5">
                                        <Button 
                                          onClick={() => handleValidateApplicantDocument(app.dni, docItem.key, true)}
                                          variant="success"
                                          size="sm"
                                          className="font-bold uppercase text-[8px] py-1 px-2 tracking-wide rounded"
                                        >
                                          Validar
                                        </Button>
                                        <Button 
                                          onClick={() => handleValidateApplicantDocument(app.dni, docItem.key, false)}
                                          variant="danger"
                                          size="sm"
                                          className="font-bold uppercase text-[8px] py-1 px-2 tracking-wide rounded"
                                        >
                                          Observar
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Section 4c: Set Folder Status of Application */}
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-xs">
                            <div className="space-y-1.5 flex-1 w-full">
                              <span className="text-[#9F062A] font-extrabold uppercase tracking-widest text-[9px] block">Manejo General del Expediente</span>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[9px] uppercase">Obs. Carpeta:</span>
                                <input 
                                  type="text"
                                  placeholder="Escriba aquí la observación general únicamente si va a marcar el expediente como 'OBSERVADO'."
                                  value={folderObservationInput[app.dni] || ""}
                                  onChange={(e) => setFolderObservationInput({
                                    ...folderObservationInput,
                                    [app.dni]: e.target.value
                                  })}
                                  className="w-full pl-22 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
                                />
                              </div>
                            </div>

                            {/* Folder Status Actions Array */}
                            <div className="flex flex-wrap gap-1.5 shrink-0 w-full lg:w-auto justify-end">
                              {[
                                { id: "Pending" as const, label: "Pendiente" },
                                { id: "Observed" as const, label: "Observado" },
                                { id: "Approved" as const, label: "Aprobado" },
                                { id: "Enrolled" as const, label: "Matriculado" }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => handleUpdateFolderStatus(app.dni, opt.id)}
                                  className={`px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                                    opt.id === "Observed" ? "bg-red-50 text-red-600 hover:bg-red-105 border border-red-200 font-black" :
                                    opt.id === "Approved" ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-105 border border-yellow-200 font-black" :
                                    opt.id === "Enrolled" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-105 border border-emerald-200 font-black" :
                                    "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </PageTransition>
        )}

        {/* ================= POSTULANTES APROBADOS VIEW ================= */}
        {activeTab === "aprobados" && (
          <PageTransition id="aprobados" className="space-y-6">
            <PageHeader
              title="Evaluación e Ingreso de Postulantes"
              subtitle="Establezca la condición de admisión (Admitido u Omiso / No Admitido) de los postulantes de acuerdo con su resultado del examen de suficiencia."
              icon={<Users className="w-6 h-6 text-slate-800" />}
            />

            {/* Statistics */}
            {(() => {
              const approvedList = applicants.filter(app => {
                const isDocDniOk = app.docs?.dniFile?.status === "Validado";
                const isDocCertOk = app.docs?.certificadoFile?.status === "Validado";
                const isDocPartidaOk = app.docs?.partidaFile ? app.docs.partidaFile.status === "Validado" : true;
                const isDocFotoOk = app.docs?.fotoFile?.status === "Validado";
                const isPaymentOk = app.paymentStatus === "Validado";
                return (isDocDniOk && isDocCertOk && isDocPartidaOk && isDocFotoOk && isPaymentOk) || app.admitted || app.folderStatus === "Approved";
              });

              const elecCount = approvedList.filter(a => a.programId === "electronica").length;
              const contCount = approvedList.filter(a => a.programId === "contabilidad").length;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs text-left">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Postulantes Aprobados</span>
                      <span className="text-2xl font-black text-[#9F062A] mt-1 block font-mono">{approvedList.length}</span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1">Expedientes Aptos para Calificación</span>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs text-left">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Electricidad Industrial</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{elecCount}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">Sistemas de Potencia</span>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs text-left">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Contabilidad</span>
                      <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{contCount}</span>
                      <span className="text-[10px] text-blue-600 font-bold block mt-1">Auditoría Financiera</span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle>Control de Admisión de Postulantes</CardTitle>
                        <CardDescription>Asigne el resultado académico del examen de admisión para postulantes con expedientes completos. Al ser admitidos, figurarán automáticamente en el módulo de Ingresantes para iniciar su proceso de matrícula regular.</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {approvedList.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                          No hay postulantes con expediente 100% aprobado en este período de admisión aún.
                        </div>
                      ) : (
                        <div className="overflow-x-auto text-xs font-semibold">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                                <th className="p-4 text-left">Postulante</th>
                                <th className="p-4 text-left">DNI</th>
                                <th className="p-4 text-left">Carrera postulada</th>
                                <th className="p-4 text-left">Contacto</th>
                                <th className="p-4 text-left">Verificación de Expediente</th>
                                <th className="p-4 text-center">Estado de Admisión</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                              {approvedList.map((app, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 text-left">
                                    <span className="font-black text-slate-900 block">{app.name} {app.lastName}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{app.applicantCode}</span>
                                  </td>
                                  <td className="p-4 font-mono font-bold">{app.dni}</td>
                                  <td className="p-4 uppercase text-[10.5px]">
                                    {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                                  </td>
                                  <td className="p-4 font-semibold text-slate-500">
                                    <div className="space-y-0.5">
                                      <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-300" /> {app.email}</p>
                                      <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-300" /> {app.phone}</p>
                                    </div>
                                  </td>
                                  <td className="p-4 text-left">
                                    <div className="flex flex-wrap gap-1">
                                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase">DNI COMPLETADO</span>
                                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase">CERTIFICADO COMPLETADO</span>
                                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase font-black">FICHA PAGO COMPLETADO</span>
                                      {app.docs?.partidaFile?.status === "Validado" && (
                                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase">ACTA COMPLETADO</span>
                                      )}
                                      {app.docs?.fotoFile?.status === "Validado" && (
                                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase">FOTO COMPLETADO</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-4 text-center">
                                    <div className="flex items-center justify-center">
                                      <select
                                        value={app.admitted ? "admitido" : "no_admitido"}
                                        onChange={(e) => {
                                          const isAdmitted = e.target.value === "admitido";
                                          const updatedList = applicants.map((a) => {
                                            if (a.dni === app.dni) {
                                              return {
                                                ...a,
                                                admitted: isAdmitted,
                                                folderStatus: isAdmitted ? "Approved" as const : "Pending" as const
                                              };
                                            }
                                            return a;
                                          });
                                          onUpdateApplicants(updatedList);
                                          
                                          if (isAdmitted) {
                                            alert(`El postulante ${app.name} ${app.lastName} ha sido marcado como ADMITIDO con éxito. Ahora figura en el módulo de Ingresantes para su matrícula.`);
                                          } else {
                                            alert(`El postulante ${app.name} ${app.lastName} ha sido marcado como NO ADMITIDO.`);
                                          }
                                        }}
                                        className="text-[11px] font-sans font-extrabold uppercase tracking-wider bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 shadow-3xs cursor-pointer focus:outline-none focus:border-[#9F062A]"
                                      >
                                        <option value="no_admitido">NO ADMITIDO</option>
                                        <option value="admitido">ADMITIDO</option>
                                      </select>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </PageTransition>
        )}

        {/* ================= PROCESO DE MATRÍCULA VIEW ================= */}
        {activeTab === "matricula" && (
          <PageTransition id="matricula" className="space-y-6">
            <PageHeader
              title="Módulo de Ingresantes y Matrícula"
              subtitle="Gestione el proceso de matrícula oficial para los estudiantes que han sido previamente admitidos de acuerdo con los resultados del examen."
              icon={<GraduationCap className="w-6 h-6 text-slate-800" />}
            />

            {(() => {
              const admittedCandidates = applicants.filter(app => app.admitted === true);

              const targetDni = selectedMatriculaDni || (admittedCandidates[0]?.dni || null);
              const targetCandidate = admittedCandidates.find(c => c.dni === targetDni);
              const existingEnrollment = enrollments.find(e => e.studentDni === targetDni);

              const activeShift = matriculaShifts[targetDni || ""] || existingEnrollment?.shift || "Mañana";
              const activeCareer = matriculaCareers[targetDni || ""] || existingEnrollment?.programId || targetCandidate?.programId || "electronica";

              const cicloICourses = activeCareer === "electronica" 
                ? [
                    { code: "EE-101", name: "Automatización Industrial y PLC", credits: 4, type: "Especialidad" },
                    { code: "EE-102", name: "Circuitos de Media y Baja Tensión", credits: 3, type: "Especialidad" },
                    { code: "EE-103", name: "Maquinaria de Potencia", credits: 4, type: "Instalación" },
                    { code: "EE-104", name: "Instalaciones Eléctricas de Edificaciones", credits: 3, type: "Taller Práctico" }
                  ]
                : [
                    { code: "CO-101", name: "Contabilidad de Costos Financieros", credits: 4, type: "Especialidad" },
                    { code: "CO-102", name: "Auditoría Tributaria Corporativa", credits: 4, type: "Tributación" },
                    { code: "CO-103", name: "Sistemas de Información Contable (SIAF)", credits: 3, type: "Herramientas" },
                    { code: "CO-104", name: "Tributación General y Normas NIIF", credits: 3, type: "Finanzas" }
                  ];

              return (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left">
                  
                  <div className="xl:col-span-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <CardTitle>Ingresantes Admitidos</CardTitle>
                        <CardDescription>Seleccione un ingresante admitido para administrar su ciclo, turno y asignaturas del primer semestre académico.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        {admittedCandidates.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                            No hay ingresantes admitidos aptos para matricular en la base de datos todavía.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {admittedCandidates.map((cand) => {
                              const candEnr = enrollments.find(e => e.studentDni === cand.dni);
                              const isEnr = candEnr?.academicStatus === "MATRICULADO";
                              const isSel = cand.dni === targetDni;

                              return (
                                <button
                                  key={cand.dni}
                                  onClick={() => setSelectedMatriculaDni(cand.dni)}
                                  className={`w-full p-4 flex flex-col gap-1 text-left transition-colors cursor-pointer ${
                                    isSel ? "bg-[#9F062A]/5 border-l-4 border-l-[#9F062A]" : "hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-extrabold text-slate-900 text-[11.5px] truncate max-w-[180px]">
                                      {cand.name} {cand.lastName}
                                    </span>
                                    {isEnr ? (
                                      <Badge variant="success">MATRICULADO</Badge>
                                    ) : (
                                      <Badge variant="warning">ADMITIDO</Badge>
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-1">
                                    <span>Carrera: <span className="uppercase text-slate-700">{cand.programId === "electronica" ? "Electricidad" : "Contabilidad"}</span></span>
                                    <span>DNI: {cand.dni}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="xl:col-span-8">
                    {targetCandidate ? (
                      <div className="space-y-6">
                        
                        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-[#9F062A] text-white px-2 py-0.5 rounded font-black uppercase tracking-widest leading-none">
                              Ficha de Configuración
                            </span>
                            <h3 className="text-sm font-black uppercase tracking-wide">
                              {targetCandidate.name} {targetCandidate.lastName}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold">
                              DNI Operacional: {targetCandidate.dni} | Correo Electrónico: {targetCandidate.email}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest font-mono">Estado Actual</span>
                            <span className="text-[11px] font-black text-amber-400 block uppercase mt-0.5">
                              {existingEnrollment?.academicStatus === "MATRICULADO" ? "REGISTRADO COMO MATRICULADO" : "PENDIENTE DE MATRÍCULA"}
                            </span>
                          </div>
                        </div>

                        <Card>
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle>Configuración de Matrícula Regular - Semestre I</CardTitle>
                            <CardDescription>Determine la Carrera Final de Destino, Turno Oficial (recuerde los 3 turnos mañana, tarde y noche), ciclo actual y verifique la currícula de asignaturas del Ciclo I.</CardDescription>
                          </CardHeader>
                          
                          <CardContent className="space-y-6 p-6">
                            
                            <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">1. Carrera de Destino (Solo Dos Carreras)</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                  { id: "electronica", name: "Electricidad Industrial", desc: "Sistemas eléctricos de media/baja tensión y automatización." },
                                  { id: "contabilidad", name: "Contabilidad", desc: "Auditorías financieras, tributación corporativa e informática aplicada." }
                                ].map(p => {
                                  const isSel = activeCareer === p.id;
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => {
                                        setMatriculaCareers(prev => ({ ...prev, [targetDni!]: p.id }));
                                      }}
                                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                                        isSel 
                                          ? "border-[#9F062A] bg-[#9F062A]/5 text-slate-900 shadow-3xs font-semibold" 
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      <span className="font-black text-xs block">{p.name}</span>
                                      <span className="text-[9.5px] leading-relaxed text-slate-400 font-medium mt-1">{p.desc}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">2. Turno Académico (Mañana, Tarde, Noche)</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                  { id: "Mañana" as const, label: "Turno Mañana", hours: "08:00 AM - 01:00 PM" },
                                  { id: "Tarde" as const, label: "Turno Tarde", hours: "01:15 PM - 06:15 PM" },
                                  { id: "Noche" as const, label: "Turno Noche", hours: "06:30 PM - 10:30 PM" }
                                ].map(shiftItem => {
                                  const isSel = activeShift === shiftItem.id;
                                  return (
                                    <button
                                      key={shiftItem.id}
                                      type="button"
                                      onClick={() => {
                                        setMatriculaShifts(prev => ({ ...prev, [targetDni!]: shiftItem.id }));
                                      }}
                                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col cursor-pointer ${
                                        isSel 
                                          ? "border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-3xs font-semibold" 
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      <span className="font-extrabold text-xs block">{shiftItem.label}</span>
                                      <span className="text-[9px] text-slate-400 font-bold mt-1 font-mono">{shiftItem.hours}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-left">
                              <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">3. Ciclo Autorizado</span>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wide mt-0.5">Ciclo I (Primer Periodo Regular)</span>
                              </div>
                              <span className="px-2.5 py-1 text-[9px] bg-sky-50 text-sky-700 border border-sky-200 rounded font-black uppercase">Ingresante</span>
                            </div>

                            <div className="space-y-3 text-left">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                                  4. Asignaturas de Currícula para Inscripción (Ciclo I)
                                </label>
                                <span className="text-[9.5px] text-slate-400 font-extrabold font-mono uppercase">
                                  Créditos Totales: {cicloICourses.reduce((a, c) => a + c.credits, 0)}
                                </span>
                              </div>
                              <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-150 divide-y divide-slate-150">
                                {cicloICourses.map((course, cIdx) => (
                                  <div key={cIdx} className="p-3.5 flex justify-between items-center text-xs">
                                    <div className="space-y-0.5">
                                      <span className="font-black text-slate-800 block text-[11px]">{course.name}</span>
                                      <div className="flex gap-1.5 items-center">
                                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">{course.code}</span>
                                        <span className="text-[9px] text-slate-400">•</span>
                                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold uppercase tracking-wider">{course.type}</span>
                                      </div>
                                    </div>
                                    <span className="font-bold text-slate-600 bg-white px-2 py-1 border rounded text-[10px] font-mono shrink-0 select-none">
                                      {course.credits} Cr.
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </CardContent>

                          <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between gap-3 rounded-b-xl">
                            <div>
                              {existingEnrollment?.academicStatus === "MATRICULADO" && (
                                <Button
                                  type="button"
                                  onClick={() => handleResetMatricula(targetDni!)}
                                  variant="outline"
                                  size="sm"
                                  className="font-extrabold tracking-wide text-amber-700 border-amber-250 bg-white hover:bg-amber-50"
                                >
                                  Restablecer a Admitido
                                </Button>
                              )}
                            </div>
                            
                            <Button
                              type="button"
                              onClick={() => handleConfirmMatricula(targetDni!, activeShift, activeCareer)}
                              variant="primary"
                              size="sm"
                              className="font-black uppercase tracking-wider text-[11px] bg-emerald-600 hover:bg-emerald-700"
                            >
                              {existingEnrollment?.academicStatus === "MATRICULADO" ? "Actualizar Matrícula" : "Confirmar e Inscribir Matrícula de Ciclo I"}
                            </Button>
                          </CardFooter>
                        </Card>

                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-xl">
                        Por favor, seleccione un estudiante disponible de la lista izquierda para ingresar su matrícula.
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}
          </PageTransition>
        )}

        {/* ================= PERIODOS DE ADMISIÓN VIEW ================= */}
        {activeTab === "periodos" && (
          <PageTransition id="periodos" className="space-y-6 animate-fade-in">
            <PageHeader
              title="Apertura y Gestión de Períodos de Admisión"
              subtitle="Cree nuevos períodos académicos de examen y programe sus fechas clave. Actívelos para habilitar o desactivar el formulario de pre-inscripción pública."
              icon={<Calendar className="w-6 h-6" />}
            />

            {/* General Admission Status Banner */}
            {admissionPeriods.find(p => p.isActive) ? (
              <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-lg flex items-start gap-4 shadow-3xs animate-fade-in">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full shrink-0 animate-fade-in/70">
                  <CheckCircle className="w-5 h-5 text-emerald-700 font-bold" />
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                    PROCESO DE ADMISIÓN ACTIVO: {admissionPeriods.find(p => p.isActive)?.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    El formulario de pre-inscripción en línea está habilitado para recibir postulantes en el portal público con el cronograma configurado.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-250 p-5 rounded-lg flex items-start gap-4 shadow-3xs animate-fade-in">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-full shrink-0 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    PORTAL DE ADMISIÓN DESACTIVADO
                  </h4>
                  <p className="text-[11px] text-slate-650 font-semibold leading-relaxed">
                    No hay ningún periodo de admisión activo en este momento. El formulario público de admisión mostrará el siguiente aviso:
                  </p>
                  <div className="mt-2 bg-rose-50 text-[#9F062A] text-[10px] font-black uppercase px-3 py-1.5 text-center rounded border border-rose-100 inline-block tracking-wide shadow-3xs">
                    Pronto se reaperturarán los exámenes de admisión
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form card: Create Period */}
              <div className="lg:col-span-5">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Aperturar Nuevo Periodo</CardTitle>
                      <CardDescription>Registre un nuevo ciclo académico reprogramando las fechas clave</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePeriod} className="space-y-4 text-xs font-semibold text-left">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-[#9F062A] uppercase tracking-wide">
                          Nombre del Periodo Académico
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: 2026-I, 2026-II, 2027-I..."
                          value={newPeriodName}
                          onChange={(e) => setNewPeriodName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white transition-all uppercase placeholder-slate-400 font-extrabold"
                        />
                      </div>

                      {/* Section 1: Pre-inscripción */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          1. Periodo de Pre-Inscripción
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase">
                              Fecha Inicio
                            </label>
                            <input
                              type="date"
                              required
                              value={newPeriodPreEnrollmentStartDate}
                              onChange={(e) => setNewPeriodPreEnrollmentStartDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase">
                              Fecha Límite
                            </label>
                            <input
                              type="date"
                              required
                              value={newPeriodPreEnrollmentEndDate}
                              onChange={(e) => setNewPeriodPreEnrollmentEndDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Examen de Admisión */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          2. Examen General de Admisión
                        </span>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase">
                            Fecha de Examen
                          </label>
                          <input
                            type="date"
                            required
                            value={newPeriodAdmissionDate}
                            onChange={(e) => setNewPeriodAdmissionDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-bold"
                          />
                        </div>
                      </div>

                      {/* Section 3: Matrícula */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          3. Periodo de Matrícula Regular
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase">
                              Inicio Matrícula
                            </label>
                            <input
                              type="date"
                              required
                              value={newPeriodEnrollmentStartDate}
                              onChange={(e) => setNewPeriodEnrollmentStartDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-500 uppercase">
                              Límite Matrícula
                            </label>
                            <input
                              type="date"
                              required
                              value={newPeriodEnrollmentEndDate}
                              onChange={(e) => setNewPeriodEnrollmentEndDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Inicio de Clases */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          4. Inicio del Ciclo Académico
                        </span>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase">
                            Fecha de Inicio de Clases
                          </label>
                          <input
                            type="date"
                            required
                            value={newPeriodClassesStartDate}
                            onChange={(e) => setNewPeriodClassesStartDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-bold"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full font-black uppercase text-[10px] tracking-widest py-3 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Registrar Periodo
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* List of Periods */}
              <div className="lg:col-span-7">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Listado de Periodos Académicos registrados</CardTitle>
                      <CardDescription>Habilite o deshabilite el estado de admisión (Los registros son indefinidos y no se eliminan)</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {admissionPeriods.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                        No hay periodos registrados en el sistema.
                      </div>
                    ) : (
                      <div className="divide-y text-xs font-semibold divide-slate-100">
                        {admissionPeriods.map((period) => (
                          <div
                            key={period.id}
                            className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-slate-50/50 transition-all gap-4 text-left"
                          >
                            <div className="space-y-2 text-left w-full">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 tracking-wide block text-sm">
                                  ADMISIÓN {period.name}
                                </span>
                                {period.status === "APERTURADO" && (
                                  <Badge variant="success" className="font-black text-[9px] uppercase tracking-wide">
                                    APERTURADO
                                  </Badge>
                                )}
                                {period.status === "PENDIENTE" && (
                                  <Badge variant="warning" className="font-bold text-[9px] uppercase tracking-wide">
                                    PENDIENTE
                                  </Badge>
                                )}
                                {period.status === "EXAMEN" && (
                                  <Badge variant="brand" className="font-black text-[9px] uppercase tracking-wide bg-[#9F062A] text-white hover:bg-[#9F062A]">
                                    EN EXAMEN
                                  </Badge>
                                )}
                                {period.status === "MATRICULA" && (
                                  <Badge variant="info" className="font-black text-[9px] uppercase tracking-wide bg-indigo-600 text-white hover:bg-indigo-600">
                                    MATRÍCULA
                                  </Badge>
                                )}
                                {period.status === "CERRADO" && (
                                  <Badge variant="neutral" className="font-bold text-[9px] uppercase tracking-wide text-slate-400 bg-slate-100 border-none">
                                    CERRADO
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-bold">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">PRE-INSCRIPCIÓN VIRTUAL</span>
                                  <span className="text-slate-800 font-extrabold flex items-center gap-1.5 mt-0.5">
                                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>
                                      {period.preEnrollmentStartDate ? new Date(period.preEnrollmentStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : "-"} al {period.preEnrollmentEndDate ? new Date(period.preEnrollmentEndDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                    </span>
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">EXAMEN DE ADMISIÓN</span>
                                  <span className="text-slate-800 font-extrabold flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {period.admissionDate ? new Date(period.admissionDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">MATRÍCULA REGULAR</span>
                                  <span className="text-slate-800 font-extrabold flex items-center gap-1.5 mt-0.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>
                                      {period.enrollmentStartDate ? new Date(period.enrollmentStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : "-"} al {period.enrollmentEndDate ? new Date(period.enrollmentEndDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                    </span>
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider font-mono">INICIO DE CLASES</span>
                                  <span className="text-indigo-900 font-black flex items-center gap-1.5 mt-0.5">
                                    <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                                    {period.classesStartDate ? new Date(period.classesStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-48 shrink-0">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                Cambiar Estado:
                              </label>
                              <select
                                value={period.status}
                                onChange={(e) => handleUpdatePeriodStatus(period.id, e.target.value as any)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-[11px] focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] font-extrabold text-slate-800 uppercase appearance-none cursor-pointer"
                              >
                                <option value="PENDIENTE">PENDIENTE (INACTIVO)</option>
                                <option value="APERTURADO">APERTURADO (PRE-INSCRIPCIÓN)</option>
                                <option value="EXAMEN">EXAMEN DE ADMISIÓN</option>
                                <option value="MATRICULA">REGISTRANDO MATRÍCULA</option>
                                <option value="CERRADO">CERRADO / FINALIZADO</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </PageTransition>
        )}

        {/* Tab Soporte Técnico */}
        {activeTab === "soporte" && (
          <PageTransition id="soporte" className="space-y-6 animate-fade-in">
            <PageHeader
              title="Bandeja de Soporte Técnico"
              subtitle="Atención de reclamos, dificultades con pagos y asistencia en carga de requisitos."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Tickets list */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="shadow-xs border-slate-200">
                  <CardHeader className="bg-slate-50/50 py-3.5 px-4 border-b">
                    <CardTitle className="text-xs uppercase tracking-widest text-slate-800 font-extrabold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#9F062A]" /> Tickets Activos
                    </CardTitle>
                    <CardDescription className="text-[10px] text-slate-400 font-bold">
                      Filtrado por consultas registradas por postulantes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    {(() => {
                      const list = applicants.filter(app => app.supportMessages && app.supportMessages.length > 0);
                      if (list.length === 0) {
                        return (
                          <div className="text-center py-12 text-slate-400 font-bold text-xs">
                            No hay tickets de soporte activos por el momento.
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-1.5 divide-y divide-slate-100 max-h-[440px] overflow-y-auto custom-scrollbar">
                          {list.map((app) => {
                            const lastMsg = app.supportMessages![app.supportMessages!.length - 1];
                            const isSelected = selectedSupportAppDni === app.dni;
                            return (
                              <button
                                key={app.dni}
                                onClick={() => setSelectedSupportAppDni(app.dni)}
                                className={`w-full text-left p-3 rounded-lg transition-all flex flex-col gap-1 cursor-pointer pt-3 ${
                                  isSelected 
                                    ? "bg-[#9F062A]/5 border border-[#9F062A]/10 text-left" 
                                    : "hover:bg-slate-100 border border-transparent text-left"
                                }`}
                              >
                                <span className="font-extrabold text-[11px] text-slate-900 leading-tight block">
                                  {app.name} {app.lastName}
                                </span>
                                <span className="text-[9px] text-[#5493D5] font-semibold block">{app.dni}</span>
                                {lastMsg && (
                                  <p className="text-[10px] text-slate-500 font-bold line-clamp-2 leading-snug mt-1 italic">
                                    "{lastMsg.text}"
                                  </p>
                                )}
                                <span className="text-[8px] text-slate-400 font-black tracking-wider uppercase block text-right mt-1.5">
                                  {lastMsg ? lastMsg.date : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Chat screen thread */}
              <div className="lg:col-span-2">
                {(() => {
                  const activeApp = applicants.find(app => app.dni === selectedSupportAppDni);
                  if (!activeApp) {
                    return (
                      <Card className="h-full min-h-[300px] flex items-center justify-center text-center shadow-xs border-slate-200">
                        <CardContent className="p-8 space-y-2">
                          <Compass className="w-10 h-10 text-slate-350 mx-auto animate-pulse" />
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Mesa de Asistencia Técnica</h4>
                          <p className="text-[11px] text-slate-400 font-semibold max-w-sm">
                            Por favor seleccione un postulante en la barra lateral izquierda para examinar sus mensajes, responder sus preguntas o iniciar el contacto por correo directo.
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Card className="shadow-xs border-slate-200 flex flex-col justify-between">
                      <CardHeader className="bg-slate-50/50 py-4 px-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-0.5 text-left">
                          <CardTitle className="text-xs font-black uppercase text-slate-900 tracking-wider">
                            Atención de Ticket: {activeApp.name} {activeApp.lastName}
                          </CardTitle>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-semibold">
                            <span>DNI: <span className="text-slate-800 font-bold">{activeApp.dni}</span></span>
                            <span>Teléfono: <span className="text-slate-800 font-bold">{activeApp.phone}</span></span>
                            <span>Código: <span className="text-slate-800 font-bold">{activeApp.applicantCode || "Sin Código"}</span></span>
                          </div>
                        </div>

                        {/* Direct mail direct reply */}
                        <div className="shrink-0 text-left">
                          <a 
                            href={`mailto:${activeApp.email}?subject=Asistencia%20Soporte%20Admision%20IESTP%20SFA`}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[10px] uppercase font-black tracking-wider px-3 py-2 rounded shadow-xs cursor-pointer transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Enviar Email Directo ({activeApp.email})</span>
                          </a>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 space-y-4">
                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-150 min-h-[220px] max-h-[360px] overflow-y-auto custom-scrollbar flex flex-col">
                          {activeApp.supportMessages && activeApp.supportMessages.map((msg: any) => (
                            <div key={msg.id} className={`flex flex-col mb-3 ${msg.sender === "admin" ? "items-end text-right" : "items-start text-left"}`}>
                              <div className={`p-3 rounded-lg max-w-sm text-xs font-semibold leading-normal shadow-xs ${
                                msg.sender === "admin" 
                                  ? "bg-[#9F062A] text-white rounded-br-none" 
                                  : "bg-white border border-slate-350 text-slate-800 rounded-bl-none"
                              }`}>
                                {msg.category && msg.sender === "postulante" && (
                                  <span className="block text-[8px] font-black uppercase tracking-wider mb-1 text-red-200">
                                    Categoría: {msg.category}
                                  </span>
                                )}
                                <p className="whitespace-pre-line text-xs">{msg.text}</p>
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold block mt-1 tracking-wide uppercase">
                                {msg.sender === "admin" ? `Soporte Institucional - ${msg.date}` : `Postulante - ${msg.date}`}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Reply Form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!adminSupportReply.trim()) return;
                            const newMsg = {
                              id: "reply_" + Date.now(),
                              sender: "admin" as const,
                              text: adminSupportReply.trim(),
                              date: new Date().toLocaleDateString("es-PE")
                            };
                            const updated = applicants.map(app => {
                              if (app.dni === activeApp.dni) {
                                return {
                                  ...app,
                                  supportMessages: [...(app.supportMessages || []), newMsg]
                                };
                              }
                              return app;
                            });
                            onUpdateApplicants(updated);
                            setAdminSupportReply("");
                            alert("Su respuesta de soporte tecnico fue registrada y enviada con exito.");
                          }}
                          className="pt-3 border-t border-slate-200 space-y-3"
                        >
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">Escribir Respuesta al Postulante</label>
                            <textarea
                              rows={3}
                              required
                              value={adminSupportReply}
                              onChange={(e) => setAdminSupportReply(e.target.value)}
                              placeholder="Escriba aquí los detalles instructivos, aclaraciones de su trámite para responder la consulta..."
                              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-350 rounded focus:outline-hidden focus:ring-1 focus:ring-[#9F062A]"
                            />
                          </div>

                          <div className="flex justify-end pt-1">
                            <Button
                              type="submit"
                              variant="primary"
                              size="sm"
                              className="font-extrabold uppercase text-[10px] bg-[#9F062A] text-white hover:bg-[#800521] tracking-wider rounded"
                            >
                              Responder y Notificar
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </div>
          </PageTransition>
        )}

      </main>

      {observePaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left animate-scale-up">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-[11px] uppercase tracking-widest">Observar Pago de Admisión</span>
              <button 
                onClick={() => setObservePaymentModalOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[11px] text-red-800 font-bold leading-relaxed">
                  Defina el motivo de la observacion de esta operacion bancaria. El postulante podra visualizar la nota y volver a registrar su comprobante corregido.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">Motivos Predeterminados</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    "Monto depositado no corresponde a la tasa (S/. 120.00).",
                    "El numero de operacion bancaria no coincide con el voucher.",
                    "La captura de imagen del voucher esta borrosa o ilegible.",
                    "El comprobante de pago recibido ya ha sido registrado previamente.",
                    "El depositante indicado no coincide con sus datos de postulante."
                  ].map((motivo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setObservePaymentReason(motivo)}
                      className="text-left text-[11px] p-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-350 transition-all font-semibold text-slate-700 cursor-pointer"
                    >
                      {motivo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">Mensaje de Observacion Personalizado</label>
                <textarea
                  rows={3}
                  value={observePaymentReason}
                  onChange={(e) => setObservePaymentReason(e.target.value)}
                  placeholder="Escriba detalle explicativo..."
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9F062A]"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <Button 
                onClick={() => setObservePaymentModalOpen(false)}
                variant="outline" 
                size="sm"
                className="font-bold cursor-pointer rounded border-slate-300 text-slate-705"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmObservePayment}
                variant="primary" 
                size="sm"
                className="font-bold bg-[#9F062A] text-white hover:bg-[#800521] cursor-pointer rounded"
              >
                Enviar Observacion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Modal for Approving (seguro de aprobar confirmar y cerrar) */}
      {approvePaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left animate-scale-up">
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-[10px] uppercase tracking-widest">¿Está seguro de aprobar?</span>
              <button 
                onClick={() => setApprovePaymentModalOpen(false)} 
                className="text-white/80 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 text-emerald-600">
                <ShieldAlert className="w-10 h-10 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-950 uppercase">Confirmar Aprobación</h4>
                  <p className="text-[10px] text-slate-555 font-semibold mt-0.5">
                    ¿Está seguro de que desea aprobar el pago para este registro? Esta acción actualizará la intranet académica de inmediato.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5 border border-slate-200 leading-relaxed text-[11px] text-slate-700 font-medium">
                <p>• Identificador / DNI: <strong className="text-slate-950 font-extrabold">{approvePaymentDni}</strong></p>
                <p>• Concepto Tributo: <strong className="text-slate-950 font-extrabold">{approvePaymentType === "admision" ? "Derecho de Examen Ordinario (S/. 120.00)" : "Derecho Regular de Matrícula (S/. 250.00)"}</strong></p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setApprovePaymentModalOpen(false)}
                className="px-4 py-2 border rounded text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Cerrar sin aprobar
              </button>
              <button
                onClick={handleConfirmAndCloseApprovePayment}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-colors"
              >
                Confirmar y cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render High Fidelity Image of Document Preview Component for Admin */}
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


