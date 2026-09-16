import React, { useState } from "react";
import { 
  ShieldAlert, CheckCircle, CheckCircle2, XCircle, FileText, CreditCard, Users, 
  MapPin, Plus, Trash2, Award, Calendar, FileSpreadsheet, Compass, LogOut, Save, GraduationCap, CheckSquare, Mail, Phone, MessageSquare, Printer, BookOpen,
  Eye, RefreshCw, AlertTriangle, Clock, X
} from "lucide-react";
import { Applicant, Enrollment, StudentPersonalData, Program, Classroom, Teacher, Graduation, AdmissionPeriod, Course, CourseAssignment, AttendanceRecord, MpaPeriod } from "../types";
import { ACADEMIC_PROGRAMS } from "../mockData";
import { createAdmissionPeriod, updateAdmissionPeriod } from "../services/api";

const sanitizePeriodName = (str: string) => {
  if (!str) return "";
  return str
    .replace(/\uFFFD/g, "")
    .replace(/Acad[\u0080-\uFFFFa-zA-Z]*mico/gi, "Académico")
    .replace(/Acad[\u0080-\uFFFFa-zA-Z]*mica/gi, "Académica")
    .replace(/Admisi[\u0080-\uFFFFa-zA-Z]*n/gi, "Admisión")
    .replace(/Matr[\u0080-\uFFFFa-zA-Z]*cula/gi, "Matrícula")
    .replace(/Per[\u0080-\uFFFFa-zA-Z]*odo/gi, "Período")
    .replace(/Evauaci[\u0080-\uFFFFa-zA-Z]*n/gi, "Evaluación")
    .replace(/Publicaci[\u0080-\uFFFFa-zA-Z]*n/gi, "Publicación");
};

// Reusable Custom Design System Components
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/Card";
import PageHeader from "./ui/PageHeader";
import AlertBox from "./ui/AlertBox";
import Sidebar from "./ui/Sidebar";
import PageTransition from "./ui/PageTransition";
import ImagePreviewModal from "./ui/ImagePreviewModal";

interface AdminDashboardProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  studentsList: { [dni: string]: StudentPersonalData };
  classrooms: Classroom[];
  teachers: Teacher[];
  graduations: Graduation[];
  admissionPeriods?: AdmissionPeriod[];
  courses?: Course[];
  assignments?: CourseAssignment[];
  attendance?: AttendanceRecord[];
  onUpdateApplicants: (apps: Applicant[]) => void;
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateClassrooms: (rooms: Classroom[]) => void;
  onUpdateTeachers: (tchs: Teacher[]) => void;
  onUpdateGraduations: (grads: Graduation[]) => void;
  onUpdateAdmissionPeriods?: (periods: AdmissionPeriod[]) => void;
  onUpdateStudentsList?: (students: { [dni: string]: StudentPersonalData }) => void;
  onUpdateCourses?: (courses: Course[]) => void;
  onUpdateAssignments?: (asgs: CourseAssignment[]) => void;
  onUpdateAttendance?: (att: AttendanceRecord[]) => void;
  onLogout: () => void;
  onGoToPortal?: () => void;
}

export default function AdminDashboard({
  applicants,
  enrollments,
  studentsList,
  classrooms,
  teachers,
  graduations,
  admissionPeriods = [],
  courses = [],
  assignments = [],
  attendance = [],
  onUpdateApplicants,
  onUpdateEnrollments,
  onUpdateClassrooms,
  onUpdateTeachers,
  onUpdateGraduations,
  onUpdateAdmissionPeriods = () => {},
  onUpdateStudentsList = () => {},
  onUpdateCourses = () => {},
  onUpdateAssignments = () => {},
  onUpdateAttendance = () => {},
  onLogout,
  onGoToPortal
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"caja_admision" | "caja_regular" | "secretaria" | "postulantes" | "vistas" | "matricula" | "matriculados" | "periodos" | "soporte">("periodos");
  const [selectedMatriculaDni, setSelectedMatriculaDni] = useState<string | null>(null);
  const [selectedFichaDni, setSelectedFichaDni] = useState<string | null>(null);
  const [selectedDossierAppDni, setSelectedDossierAppDni] = useState<string | null>(null);
  const [individualDocObs, setIndividualDocObs] = useState<{ [key: string]: string }>({});
  const [prepostulantesCareerFilter, setPrepostulantesCareerFilter] = useState<string>("all");
  const [postulantesCareerFilter, setPostulantesCareerFilter] = useState<string>("all");
  const [postulantesClassroomFilter, setPostulantesClassroomFilter] = useState<string>("all");
  const [matriculaShifts, setMatriculaShifts] = useState<{ [dni: string]: "Mañana" | "Tarde" | "Noche" }>({});
  const [matriculaCareers, setMatriculaCareers] = useState<{ [dni: string]: any }>({});
  const [matriculaGroups, setMatriculaGroups] = useState<{ [dni: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pending" | "matriculado">("all");
  const [careerFilter, setCareerFilter] = useState<string>("all");
  
  // Period & applicant-oriented folder states
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const active = admissionPeriods.find(p => p.isActive);
    return active ? active.id : (admissionPeriods[0]?.id || "1");
  });
  const [applicantFilterType, setApplicantFilterType] = useState<"all" | "pending" | "observed" | "approved" | "enrolled">("all");

  const renderPeriodSelector = () => {
    return (
      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-205 shadow-3xs">
        <label htmlFor="global-period-selector" className="text-[10px] font-black tracking-wider text-slate-500 uppercase whitespace-nowrap pl-1">
          Período:
        </label>
         <select
          id="global-period-selector"
          value={selectedPeriodId}
          onChange={(e) => {
            setSelectedPeriodId(e.target.value);
            setSelectedMatriculaDni(null); // Reset selection when period changes
          }}
          className="bg-white border border-slate-200 text-slate-800 rounded px-2.5 py-1 text-xs font-black focus:outline-none cursor-pointer"
          disabled={admissionPeriods.length === 0}
        >
          {admissionPeriods.length === 0 ? (
            <option value="">(Sin Períodos)</option>
          ) : (
            <>
              <option value="all">TODOS LOS PERIODOS ({applicants.length})</option>
              {admissionPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.status === "APERTURADO" ? "(ACTIVO)" : ""}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    );
  };

  // Local state for the new period creator
  const [selectedAcademicPeriodId, setSelectedAcademicPeriodId] = useState("");
  const sanitizePeriodName = (name?: string) => {
    if (!name) return "";
    return name
      .replace(/Acad[\uFFFD\?a-zA-Z]*mico/gi, "Académico")
      .replace(/Acadmico/gi, "Académico")
      .replace(/Periodo\s+Periodo/gi, "Periodo");
  };

  const [newPeriodResultsPublicationDate, setNewPeriodResultsPublicationDate] = useState("");
  const [mpaPeriods, setMpaPeriods] = useState<MpaPeriod[]>([]);
  
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("mpa_db_periods");
      if (saved) {
        let loaded = JSON.parse(saved);
        if (Array.isArray(loaded) && loaded.length > 0) {
          loaded = loaded.map((p: any) => ({
            ...p,
            name: sanitizePeriodName(p.name?.replace(/^Semestre\s+/i, "Periodo ") || p.name)
          }));
          setMpaPeriods(loaded);
          return;
        }
      }
      // Provide default fallback periods from MPA so the admin can always create admission periods
      const defaultMpaPeriods = [
        { id: "per_2026_1", name: "Periodo Académico 2026-I", startDate: "2026-04-06", endDate: "2026-07-24", isActive: true, status: "Activo" },
        { id: "per_2026_2", name: "Periodo Académico 2026-II", startDate: "2026-08-17", endDate: "2026-12-18", isActive: false, status: "Pendiente" }
      ];
      localStorage.setItem("mpa_db_periods", JSON.stringify(defaultMpaPeriods));
      setMpaPeriods(defaultMpaPeriods);
    } catch (e) {
      console.error(e);
      setMpaPeriods([]);
    }
  }, []);

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
            paymentObservations: "",
            paymentValidatedAt: new Date().toISOString().split("T")[0]
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
            academicStatus: "ADMITIDO" as any 
          };
        }
        return enr;
      });
      onUpdateEnrollments(updated);
      alert("¡Pago de Matrícula APROBADO con éxito! El estudiante se encuentra ahora con pago validado y PENDIENTE DE MATRÍCULA.");
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

  const handleConfirmMatricula = (studentDni: string, shift: "Mañana" | "Tarde" | "Noche", programId: any, groupId?: string) => {
    if (!groupId) {
      alert("Por favor, seleccione un Grupo Académico para el estudiante antes de procesar la matrícula.");
      return;
    }

    // Validar programación completa del Grupo Académico
    let mpaTasks = [];
    try {
      const rawTasks = localStorage.getItem("mpa_db_tasks");
      if (rawTasks) {
        mpaTasks = JSON.parse(rawTasks);
      }
    } catch (e) {
      console.error(e);
    }

    const hasProgramming = mpaTasks.some(t => t.groupId === groupId);
    if (!hasProgramming) {
      alert("El Grupo Académico seleccionado aún no posee una programación académica completa. Finalice la programación antes de utilizar este grupo.");
      return;
    }

    const existing = enrollments.find(e => e.studentDni === studentDni);
    const currentPayStatus = existing?.paymentStatus || "No Pagado";
    if (currentPayStatus !== "Validado") {
      alert(
        `CONTROL DE RECAUDACIÓN Y PAGOS (MAMC):\n\nNo se puede registrar la matrícula de este ingresante porque su pago único de S/. 250.00 de matrícula aún no ha sido VALIDADO por la Oficina de Caja.\n\nPor favor, vaya a la pestaña de "Caja (Matrículas)" para auditar, verificar y registrar la conformidad del voucher antes de continuar.`
      );
      return;
    }

    let updatedEnrList: Enrollment[];
    if (existing) {
      updatedEnrList = enrollments.map(enr => {
        if (enr.studentDni === studentDni) {
          return {
            ...enr,
            programId: programId,
            academicStatus: "MATRICULADO" as const,
            shift: shift,
            paymentStatus: enr.paymentStatus || "No Pagado",
            groupId: groupId
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
          paymentStatus: "No Pagado",
          shift: shift,
          groupId: groupId
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
    status: "Validado" | "Observado" | "Pendiente",
    observations?: string
  ) => {
    const updated = applicants.map((app) => {
      if (app.dni === applicantDni) {
        const docsObj = app.docs || {
          dniFile: { status: "No Enviado" as const },
          certificadoFile: { status: "No Enviado" as const },
          partidaFile: { status: "No Enviado" as const },
          fotoFile: { status: "No Enviado" as const }
        };
        const currentDoc = docsObj[docKey] || { status: "No Enviado" as const };

        const updatedDocs = {
          ...docsObj,
          [docKey]: {
            ...currentDoc,
            status: status as any,
            observations: status === "Observado" ? (observations || "") : undefined
          }
        };

        const allDocsValidated = 
          updatedDocs.dniFile.status === "Validado" && 
          updatedDocs.certificadoFile.status === "Validado" && 
          (!updatedDocs.partidaFile || updatedDocs.partidaFile.status === "Validado" || updatedDocs.partidaFile.status === "No Enviado") && 
          updatedDocs.fotoFile.status === "Validado";

        return {
          ...app,
          folderStatus: allDocsValidated ? ("Approved" as const) : ("Pending" as const),
          docs: updatedDocs
        };
      }
      return app;
    });

    onUpdateApplicants(updated);
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
        
        // Auto-validate individual files when the whole folder is Approved/Completed
        const updatedDocs = {
          dniFile: app.docs?.dniFile || { status: "No Enviado" as const },
          certificadoFile: app.docs?.certificadoFile || { status: "No Enviado" as const },
          partidaFile: app.docs?.partidaFile || { status: "No Enviado" as const },
          fotoFile: app.docs?.fotoFile || { status: "No Enviado" as const }
        };

        if (status === "Approved" || status === "Enrolled") {
          const docKeys: Array<"dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"> = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"];
          docKeys.forEach((key) => {
            const currentDoc = updatedDocs[key] || { status: "No Enviado" };
            // Only auto-validate docs the postulante actually uploaded — never fake "No Enviado" docs
            if (currentDoc.status !== "No Enviado" && currentDoc.fileName) {
              updatedDocs[key] = {
                ...currentDoc,
                status: "Validado" as const
              };
            }
            // Docs that were never uploaded remain "No Enviado" — no placeholder filenames
          });
        }

        return {
          ...app,
          folderStatus: status,
          folderObservations: status === "Observed" ? obsText : app.folderObservations,
          admitted: (isAdmitted ? "ADMITIDO" : ((app.admitted === "ADMITIDO" || app.admitted === true) ? "ADMITIDO" : (app.admitted === "NO ADMITIDO" ? "NO ADMITIDO" : "PENDIENTE"))) as "PENDIENTE" | "ADMITIDO" | "NO ADMITIDO" | boolean,
          docs: updatedDocs,
          folderApprovedAt: (status === "Approved" || status === "Enrolled") ? new Date().toISOString().split("T")[0] : app.folderApprovedAt
        };
      }
      return app;
    });

    onUpdateApplicants(updated);
    alert(`Expediente del postulante con DNI ${applicantDni} actualizado a estado: ${status === "Approved" ? "COMPLETADO (APROBADO)" : status}.`);
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
    const fallbackApplicant = applicants.find(a => a.dni === enr.studentDni);
    if (!student && !fallbackApplicant) return false;
    
    const name = student ? student.name : (fallbackApplicant ? fallbackApplicant.name : "");
    const lastName = student ? student.lastName : (fallbackApplicant ? fallbackApplicant.lastName : "");
    const dni = student ? student.dni : (fallbackApplicant ? fallbackApplicant.dni : enr.studentDni);

    const fullName = `${name} ${lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || dni.includes(query);
    
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
  const handleMpaPeriodChange = (periodId: string) => {
    setSelectedAcademicPeriodId(periodId);
    const selected = mpaPeriods.find(p => p.id === periodId);
    if (selected) {
      setNewPeriodClassesStartDate(selected.startDate);
      
      const classesDateStr = selected.startDate;
      if (classesDateStr) {
        const parts = classesDateStr.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const baseDate = new Date(year, month, day);

          const formatDate = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const r = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${r}`;
          };

          // 1. Pre-inscripción (starts 35 days before classes start, ends 21 days before)
          const preEnrollStart = new Date(baseDate);
          preEnrollStart.setDate(baseDate.getDate() - 35);
          const preEnrollEnd = new Date(baseDate);
          preEnrollEnd.setDate(baseDate.getDate() - 21);

          // 2. Evaluación y Publicación (Exam is 20 days before, Results is 19 days before classes)
          const examDate = new Date(baseDate);
          examDate.setDate(baseDate.getDate() - 20);
          const resultsDate = new Date(baseDate);
          resultsDate.setDate(baseDate.getDate() - 19);

          // 3. Matrícula (Enrollment starts 10 days before, ends 3 days before classes)
          const enrollStart = new Date(baseDate);
          enrollStart.setDate(baseDate.getDate() - 10);
          const enrollEnd = new Date(baseDate);
          enrollEnd.setDate(baseDate.getDate() - 3);

          setNewPeriodPreEnrollmentStartDate(formatDate(preEnrollStart));
          setNewPeriodPreEnrollmentEndDate(formatDate(preEnrollEnd));
          setNewPeriodAdmissionDate(formatDate(examDate));
          setNewPeriodResultsPublicationDate(formatDate(resultsDate));
          setNewPeriodEnrollmentStartDate(formatDate(enrollStart));
          setNewPeriodEnrollmentEndDate(formatDate(enrollEnd));
        }
      }
    } else {
      setNewPeriodClassesStartDate("");
      setNewPeriodPreEnrollmentStartDate("");
      setNewPeriodPreEnrollmentEndDate("");
      setNewPeriodAdmissionDate("");
      setNewPeriodResultsPublicationDate("");
      setNewPeriodEnrollmentStartDate("");
      setNewPeriodEnrollmentEndDate("");
    }
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcademicPeriodId) {
      alert("Por favor seleccione un Período Académico del MPA.");
      return;
    }

    const selectedMpaPeriod = mpaPeriods.find(p => p.id === selectedAcademicPeriodId);
    if (!selectedMpaPeriod) {
      alert("El Período Académico seleccionado no es válido.");
      return;
    }

    // Restricciones:
    // 1. Cada Período Académico solo puede tener un único Período de Admisión asociado.
    const alreadyAssociated = admissionPeriods.some(p => p.academicPeriodId === selectedAcademicPeriodId);
    if (alreadyAssociated) {
      alert(`El Período Académico "${selectedMpaPeriod.name}" ya está asociado a otro Período de Admisión.`);
      return;
    }

    if (
      !newPeriodPreEnrollmentStartDate || 
      !newPeriodPreEnrollmentEndDate || 
      !newPeriodAdmissionDate || 
      !newPeriodResultsPublicationDate ||
      !newPeriodEnrollmentStartDate ||
      !newPeriodEnrollmentEndDate
    ) {
      alert("Por favor complete todas las fechas obligatorias: Pre-Inscripción, Examen, Publicación de Resultados y Límites de Matrícula.");
      return;
    }

    // Chronological validations
    if (newPeriodPreEnrollmentStartDate > newPeriodPreEnrollmentEndDate) {
      alert("Error de validación: La fecha de inicio de Pre-Inscripción no puede ser posterior a su fecha límite.");
      return;
    }
    if (newPeriodPreEnrollmentEndDate > newPeriodAdmissionDate) {
      alert("Error de validación: La fecha límite de Pre-Inscripción no puede ser posterior a la fecha del Examen de Admisión.");
      return;
    }
    if (newPeriodAdmissionDate > newPeriodResultsPublicationDate) {
      alert("Error de validación: La fecha de Examen de Admisión no puede ser posterior a la publicación de resultados.");
      return;
    }
    if (newPeriodResultsPublicationDate > newPeriodEnrollmentStartDate) {
      alert("Error de validación: La fecha de publicación de resultados no puede ser posterior al inicio de la Matrícula Regular.");
      return;
    }
    if (newPeriodEnrollmentStartDate > newPeriodEnrollmentEndDate) {
      alert("Error de validación: La fecha de inicio de Matrícula no puede ser posterior a su fecha límite.");
      return;
    }
    if (newPeriodEnrollmentEndDate > selectedMpaPeriod.startDate) {
      alert("Error de validación: La fecha límite de Matrícula no puede ser posterior al inicio de clases establecido por el MPA.");
      return;
    }

    const formattedName = selectedMpaPeriod.name.replace(/^(Semestre|Periodo)\s+/i, "").trim().toUpperCase();

    const newPeriod: AdmissionPeriod = {
      id: `period-${Date.now()}`,
      name: formattedName,
      academicPeriodId: selectedAcademicPeriodId,
      isActive: false,
      status: "PENDIENTE",
      preEnrollmentStartDate: newPeriodPreEnrollmentStartDate,
      preEnrollmentEndDate: newPeriodPreEnrollmentEndDate,
      admissionDate: newPeriodAdmissionDate,
      resultsPublicationDate: newPeriodResultsPublicationDate,
      enrollmentStartDate: newPeriodEnrollmentStartDate,
      enrollmentEndDate: newPeriodEnrollmentEndDate,
      classesStartDate: selectedMpaPeriod.startDate
    };

    onUpdateAdmissionPeriods([...admissionPeriods, newPeriod]);
    createAdmissionPeriod(newPeriod).catch(err => console.error("Error creating period in MongoDB REST API:", err));

    setSelectedAcademicPeriodId("");
    setNewPeriodResultsPublicationDate("");
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
    updated.forEach(p => {
      updateAdmissionPeriod(p.id, p).catch(err => console.error("Error updating period in MongoDB REST API:", err));
    });
  };

  const handleDeletePeriod = (id: string) => {
    const period = admissionPeriods.find(p => p.id === id);
    if (!period) return;
    
    const confirmDelete = window.confirm(
      `¿Está seguro que desea eliminar el Periodo de Admisión "${period.name}"? Al hacerlo, el Período Académico del MPA volverá a estar disponible para su selección.`
    );
    if (confirmDelete) {
      const filtered = admissionPeriods.filter(p => p.id !== id);
      onUpdateAdmissionPeriods(filtered);
      alert(`Periodo de Admisión "${period.name}" eliminado correctamente. El periodo académico asociado ya está disponible nuevamente para selección.`);
    }
  };

  return (
    <div 
      id="admin-dashboard" 
      className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row pb-0"
    >
      {/* Sidebar navigation */}
      <Sidebar
        institution={{
          name: "MAMC SFA",
          subtitle: "Admisión y Matrícula"
        }}
        user={{
          name: "MAMC Directivo",
          role: "Coordinación & Tesorería",
          status: "DIRECTOR / MAMC",
        }}
        sections={[
          {
            title: "MÓDULOS DE ADMINISTRACIÓN",
            items: [
              {
                label: "Períodos de Admisión",
                icon: <Calendar className="w-4 h-4" />,
                route: "periodos",
                active: activeTab === "periodos"
              },
              {
                label: "Prepostulantes",
                icon: <FileText className="w-4 h-4" />,
                route: "secretaria",
                active: activeTab === "secretaria"
              },
              {
                label: "Caja & Tesorería",
                icon: <CreditCard className="w-4 h-4" />,
                route: "caja_parent",
                subItems: [
                  {
                    label: "1. Control de Pagos",
                    route: "caja_admision",
                    active: activeTab === "caja_admision"
                  },
                  {
                    label: "2. Matrículas e Inscripciones",
                    route: "caja_regular",
                    active: activeTab === "caja_regular"
                  }
                ]
              },
              {
                label: "Postulantes (Examen)",
                icon: <Users className="w-4 h-4" />,
                route: "postulantes",
                active: activeTab === "postulantes"
              },
              {
                label: "Ingresantes (Matrícula)",
                icon: <GraduationCap className="w-4 h-4" />,
                route: "matricula",
                active: activeTab === "matricula"
              },
              {
                label: "Estudiantes Matriculados",
                icon: <CheckSquare className="w-4 h-4" />,
                route: "matriculados",
                active: activeTab === "matriculados"
              },
              {
                label: "Vistas y Resultados",
                icon: <Users className="w-4 h-4" />,
                route: "vistas",
                active: activeTab === "vistas"
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
        onGoToPortal={onGoToPortal}
      />

      {/* Main viewport area - scrollable only inside */}
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-slate-50 relative custom-scrollbar">
        
        {/* Tab Caja / Admission payments auditing */}
        {activeTab === "caja_admision" && (
          <PageTransition id="caja_admision" className="space-y-6">
            <PageHeader
              title="Derechos de Admisión - Oficina de Caja"
              subtitle="Audite los recibos financieros de postulación virtuales (Tasa S/. 120.00)."
              icon={<CreditCard className="w-6 h-6" />}
              actions={renderPeriodSelector()}
            />

            {/* Applicant Admission paid vouchers list */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Validaciones para Examen de Admisión Directo/Ordinario</CardTitle>
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
                      {applicants.filter((app) => app.periodId === selectedPeriodId && app.paymentOperation).map((app, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-black text-slate-900">{app.name} {app.lastName}</td>
                          <td className="p-4 font-mono text-xs text-slate-600 leading-tight">
                            <span className="block font-bold text-slate-850">{app.dni}</span>
                            <span className="block text-[9px] text-amber-600 font-extrabold">{app.applicantCode || "No tiene"}</span>
                          </td>
                          <td className="p-4 uppercase text-slate-500 text-[11px] font-bold">
                            {ACADEMIC_PROGRAMS.find(p => p.id === app.programId)?.name || app.programId}
                          </td>
                          <td className="p-4 font-mono text-xs text-left">
                            <span className="font-bold text-[#5493D5] block mb-1">{app.paymentOperation}</span>
                            {app.paymentVoucherUrl ? (
                              <button
                                onClick={() => triggerAdminPreview(
                                  "Voucher de " + app.name + " " + app.lastName,
                                  app.paymentVoucherFileName || "voucher_pago.jpg",
                                  "image",
                                  { fileDataUrl: app.paymentVoucherUrl }
                                )}
                                className="px-2 py-1 bg-[#9F062A]/10 hover:bg-[#9F062A]/20 text-[#9F062A] text-[9px] font-black uppercase tracking-wider rounded border border-[#9F062A]/20 transition-all cursor-pointer flex items-center gap-1 mt-1 shrink-0"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Voucher Adjunto</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Sin Voucher Físico</span>
                            )}
                          </td>
                          <td className="p-4 font-bold">S/. 120.00</td>
                          <td className="p-4">
                            {app.paymentStatus === "Validado" ? (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                              </span>
                            ) : app.paymentStatus === "Observado" ? (
                              <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Observado
                              </span>
                            ) : app.paymentStatus === "Rechazado" ? (
                              <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-red-600" /> Rechazado
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500" /> Pendiente
                              </span>
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
                              <div className="flex items-center justify-center gap-2">
                                {app.paymentStatus === "Validado" ? (
                                  <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobado
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-black text-[10px] uppercase tracking-wider">Aprobado / Cerrado</span>
                                )}
                                <button 
                                  onClick={() => handleResetApplicantPayment(app.dni)}
                                  className="text-[8.5px] uppercase font-sans font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-1 tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                  title="Restablecer para poder cambiar de estado o corregir aprobación por causalidad"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Restablecer</span>
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
          </PageTransition>
        )}

        {/* Tab Caja / Regular Matrícula & Inscripciones auditing */}
        {activeTab === "caja_regular" && (
          <PageTransition id="caja_regular" className="space-y-6">
            <PageHeader
              title="Matrículas e Inscripciones Semestrales - Oficina de Caja"
              subtitle="Audite las tasas de S/. 250 de matrícula regular y registre la conformidad del pago de ingresantes y alumnos."
              icon={<CreditCard className="w-6 h-6" />}
              actions={renderPeriodSelector()}
            />

            {/* Students matricula regular semester paid vouchers lists */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Validaciones de Matrícula Regular e Inscripción</CardTitle>
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
                      {enrollments.filter((enr) => {
                        const app = applicants.find(a => a.dni === enr.studentDni);
                        return enr.paymentOperation && (!app || app.periodId === selectedPeriodId);
                      }).map((enr, idx) => {
                        const student = studentsList[enr.studentDni];
                        const fallbackApplicant = applicants.find(a => a.dni === enr.studentDni);
                        const displayName = student 
                          ? `${student.name} ${student.lastName}` 
                          : (fallbackApplicant 
                            ? `${fallbackApplicant.name} ${fallbackApplicant.lastName}` 
                            : "Estudiante Admitido");
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-black text-slate-900">{displayName}</td>
                            <td className="p-4 font-mono text-slate-600 font-bold">{enr.studentDni}</td>
                            <td className="p-4 font-mono text-xs text-left">
                              <span className="font-bold text-[#5493D5] block mb-1">{enr.paymentOperation}</span>
                              {enr.paymentVoucherUrl ? (
                                <button
                                  onClick={() => triggerAdminPreview(
                                    "Voucher Matrícula de " + displayName,
                                    enr.paymentVoucherFileName || "voucher_matricula.jpg",
                                    "image",
                                    { fileDataUrl: enr.paymentVoucherUrl }
                                  )}
                                  className="px-2 py-1 bg-[#9F062A]/10 hover:bg-[#9F062A]/20 text-[#9F062A] text-[9px] font-black uppercase tracking-wider rounded border border-[#9F062A]/20 transition-all cursor-pointer flex items-center gap-1 mt-1 shrink-0"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Ver Voucher Adjunto</span>
                                </button>
                              ) : (
                                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Sin Voucher Físico</span>
                              )}
                            </td>
                            <td className="p-4 font-bold">S/. 250.00</td>
                            <td className="p-4">
                              {enr.paymentStatus === "Validado" ? (
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                                </span>
                              ) : enr.paymentStatus === "Observado" ? (
                                <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Rechazado / Obs.
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Pendiente
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {enr.academicStatus === "MATRICULADO" ? (
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matriculado
                                </span>
                              ) : enr.paymentStatus === "Validado" ? (
                                <span className="text-xs font-bold text-sky-700 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-sky-500" /> Pendiente a matricular
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-600">Admitido</span>
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
                                  <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verificado
                                  </span>
                                  <button 
                                    onClick={() => handleResetEnrollmentPayment(enr.studentDni)}
                                    className="text-[8.5px] uppercase font-sans font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-0.5 tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                    title="Restablecer para poder corregir o cambiar de estado"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Restablecer</span>
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
              actions={renderPeriodSelector()}
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
                  <option value="all">TODOS LOS PERIODOS ({applicants.length})</option>
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
              const activeApplicants = applicants.filter(app => !selectedPeriodId || selectedPeriodId === "all" || app.periodId === selectedPeriodId || (!app.periodId || app.periodId === "1" || app.periodId === admissionPeriods[0]?.id));
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
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Buscar postulante por nombre, apellido o DNI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Buscar</span>
              </div>

              {/* Career Selection Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-550 whitespace-nowrap">Especialidad:</span>
                <select 
                  value={prepostulantesCareerFilter}
                  onChange={(e) => setPrepostulantesCareerFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-705 outline-none focus:border-[#9F062A] cursor-pointer"
                >
                  <option value="all">TODAS LAS CARRERAS</option>
                  <option value="electronica">ELECTRICIDAD INDUSTRIAL</option>
                  <option value="contabilidad">CONTABILIDAD</option>
                </select>
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
              const activeApplicants = applicants.filter(app => !selectedPeriodId || selectedPeriodId === "all" || app.periodId === selectedPeriodId || (!app.periodId || app.periodId === "1" || app.periodId === admissionPeriods[0]?.id));
              const filteredApplicants = activeApplicants.filter((app) => {
                const fullName = `${app.name} ${app.lastName}`.toLowerCase();
                const matchesQuery = 
                  fullName.includes(searchQuery.toLowerCase()) || 
                  app.dni.includes(searchQuery) ||
                  (app.applicantCode && app.applicantCode.toLowerCase().includes(searchQuery.toLowerCase()));
                if (!matchesQuery) return false;

                // Career program filter
                if (prepostulantesCareerFilter !== "all" && app.programId !== prepostulantesCareerFilter) {
                  return false;
                }

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
                <Card className="overflow-hidden border border-slate-150 shadow-sm mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-white font-extrabold uppercase tracking-wide text-[10px]">
                          <th className="p-3">Postulante / Código</th>
                          <th className="p-3">Especialidad de Destino</th>
                          <th className="p-3">Pago Tasa (S/. 120)</th>
                          <th className="p-3">Dossier Digital</th>
                          <th className="p-3 text-center">Revisión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-semibold text-slate-700">
                        {filteredApplicants.map((app) => {
                          const appDocs = app.docs || {
                            dniFile: { status: "No Enviado" as const },
                            certificadoFile: { status: "No Enviado" as const },
                            partidaFile: { status: "No Enviado" as const },
                            fotoFile: { status: "No Enviado" as const }
                          };

                          const docsListKeys: Array<"dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"> = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"];
                          const valCount = docsListKeys.filter(k => appDocs[k]?.status === "Validado").length;
                          const obsCount = docsListKeys.filter(k => appDocs[k]?.status === "Observado").length;
                          const pendCount = docsListKeys.filter(k => appDocs[k]?.status === "Pendiente").length;

                          return (
                            <tr key={app.dni} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5 border-none">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-155 text-[#9F062A] font-extrabold flex items-center justify-center border border-slate-200 select-none">
                                    {app.name.charAt(0)}{app.lastName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-[#9F062A] uppercase leading-none block text-[11.5px]">
                                      {app.name} {app.lastName}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 font-bold block mt-1 tracking-tight">
                                      DNI: {app.dni} | Código: <span className="font-mono text-slate-800">{app.applicantCode || "PE-2026-" + app.dni.slice(-4)}</span>
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-bold uppercase tracking-tight text-slate-900 border-none">
                                {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                              </td>
                              <td className="p-3.5 border-none">
                                {app.paymentStatus === "Validado" ? (
                                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tasa Validada (S/ 120)
                                  </span>
                                ) : app.paymentStatus === "Observado" ? (
                                  <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Tasa Observada
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Por revisar
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 border-none">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-tight">
                                    <span className="text-emerald-700 font-black">{valCount} OK</span>
                                    {obsCount > 0 && <span className="text-red-600 font-black">{obsCount} OBS</span>}
                                    {pendCount > 0 && <span className="text-amber-600 font-black">{pendCount} PEND</span>}
                                  </div>
                                  <div className="w-24 h-1 border border-slate-200 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-600 transition-all duration-300"
                                      style={{ width: `${(valCount / 4) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 text-center border-none">
                                <button
                                  type="button"
                                  onClick={() => setSelectedDossierAppDni(app.dni)}
                                  className="inline-flex items-center gap-1.5 uppercase font-black text-[9px] tracking-wider bg-[#9F062A] hover:bg-[#800521] text-white px-2.5 py-1.5 rounded-lg border border-transparent shadow-xs transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Dossier</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })()}
          </PageTransition>
        )}

        {/* ================= POSTULANTES DE ADMISIÓN (EXAMEN Y AULAS) VIEW ================= */}
        {activeTab === "postulantes" && (
          <PageTransition id="postulantes" className="space-y-6 text-left">
            <PageHeader
              title="Postulantes Aptos (Examen de Admisión)"
              subtitle="Gestione los postulantes que ya tienen sus 5 requisitos completamente validados (4 documentos y pago S/.120 de Tasa confirmados). Asigne aulas físicas de evaluación y registre los resultados para admisión."
              icon={<Users className="w-6 h-6 text-[#9F062A]" />}
              actions={renderPeriodSelector()}
            />

            {(() => {
              const activeApps = applicants.filter(app => app.periodId === selectedPeriodId);
              
              // A candidate is a ready "Postulante" once all 4 documents are validated AND payment is validated.
              const readyPostulantes = activeApps.filter(app => {
                const isDni = app.docs?.dniFile?.status === "Validado";
                const isCert = app.docs?.certificadoFile?.status === "Validado";
                const isPartida = app.docs?.partidaFile ? app.docs.partidaFile.status === "Validado" : true;
                const isFoto = app.docs?.fotoFile?.status === "Validado";
                const isPayment = app.paymentStatus === "Validado";
                return isDni && isCert && isPartida && isFoto && isPayment;
              });

              // Filtering by search, career and classroom
              const filteredList = readyPostulantes.filter(app => {
                const fullName = `${app.name} ${app.lastName}`.toLowerCase();
                const matchesQuery = 
                  fullName.includes(searchQuery.toLowerCase()) || 
                  app.dni.includes(searchQuery) ||
                  (app.applicantCode && app.applicantCode.toLowerCase().includes(searchQuery.toLowerCase()));
                if (!matchesQuery) return false;

                if (postulantesCareerFilter !== "all" && app.programId !== postulantesCareerFilter) {
                  return false;
                }

                if (postulantesClassroomFilter !== "all") {
                  if (postulantesClassroomFilter === "none") {
                    return !app.examClassroom;
                  }
                  return app.examClassroom === postulantesClassroomFilter;
                }

                return true;
              });

              const admittedCount = readyPostulantes.filter(a => a.admitted === "ADMITIDO" || a.admitted === true).length;
              const notAdmittedCount = readyPostulantes.filter(a => a.admitted === "NO ADMITIDO").length;
              const pendingCount = readyPostulantes.filter(a => a.admitted !== "ADMITIDO" && a.admitted !== true && a.admitted !== "NO ADMITIDO").length;
              const hasClassroomCount = readyPostulantes.filter(a => !!a.examClassroom).length;

              const classroomOptions = [
                "Aula A-101 (Teoría)",
                "Aula B-201 (Cómputo)",
                "Aula C-102 (Motores)",
                "Laboratorio L-101",
                "Auditorio Principal"
              ];

              return (
                <div className="space-y-6">
                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Postulantes Aptos</span>
                      <span className="text-xl font-black text-slate-800 mt-1 block font-mono">{readyPostulantes.length}</span>
                      <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Expedientes 100% aprobados</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider block">Con Aula Asignada</span>
                      <span className="text-xl font-black text-indigo-700 mt-1 block font-mono">{hasClassroomCount} de {readyPostulantes.length}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Aulas distribuidas</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wider block">Evaluación Pendiente</span>
                      <span className="text-xl font-black text-amber-700 mt-1 block font-mono">{pendingCount}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Esperando examen</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-[#9F062A] font-extrabold uppercase tracking-wider block">Admitidos (Ingresantes)</span>
                      <span className="text-xl font-black text-[#9F062A] mt-1 block font-mono">{admittedCount}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Historial rechazados: {notAdmittedCount}</span>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-3xs flex flex-wrap gap-4 items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search Input inline */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar por DNI, Nombre o Código..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-[#9F062A]"
                        />
                      </div>

                      {/* Career Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-extrabold uppercase text-[9px]">Especialidad:</span>
                        <select
                          value={postulantesCareerFilter}
                          onChange={(e) => setPostulantesCareerFilter(e.target.value)}
                          className="border border-slate-200 bg-white rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold focus:outline-[#9F062A] cursor-pointer"
                        >
                          <option value="all">TODAS</option>
                          <option value="electronica">ELECTRICIDAD INDUSTRIAL</option>
                          <option value="contabilidad">CONTABILIDAD</option>
                        </select>
                      </div>

                      {/* Classroom Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-extrabold uppercase text-[9px]">Aula Examen:</span>
                        <select
                          value={postulantesClassroomFilter}
                          onChange={(e) => setPostulantesClassroomFilter(e.target.value)}
                          className="border border-slate-200 bg-white rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold focus:outline-[#9F062A] cursor-pointer"
                        >
                          <option value="all">TODAS LAS AULAS</option>
                          <option value="none">SIN AULA ASIGNADA</option>
                          {classroomOptions.map(cl => (
                            <option key={cl} value={cl}>{cl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-extrabold uppercase">
                      Resultados Filtrados: {filteredList.length} de {readyPostulantes.length}
                    </div>
                  </div>

                  {/* Listings Table */}
                  <Card>
                    <CardHeader>
                      <div className="text-left">
                        <CardTitle>Control de Aulas y Resultados del Examen</CardTitle>
                        <CardDescription>
                          A continuación se listan todos los aspirantes aptos. Usted puede asignarles el respectivo aula físico para el examen de admisión y calibrar la decisión oficial de ingreso como ADMITIDO o NO ADMITIDO.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {readyPostulantes.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-xs font-bold space-y-2">
                          <p>No se encontraron expedientes aptos en este período.</p>
                          <p className="text-[10px] text-slate-500 font-medium max-w-md mx-auto">
                            Recuerde que para pasar a esta lista, cada prepostulante debe tener sus 4 documentos (DNI, Certificado, Partida/Foto) evaluados como "Validado" en la carpeta, y el pago de tasa de admisión cobrado y "Validado" por Caja.
                          </p>
                        </div>
                      ) : filteredList.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-xs font-bold leading-normal">
                          Ningún postulante coincide con los criterios de búsqueda o filtros seleccionados.
                        </div>
                      ) : (
                        <div className="overflow-x-auto text-[11.5px] font-semibold animate-scale-up">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-[10.5px] uppercase border-b border-slate-150">
                                <th className="p-4 text-left">Postulante</th>
                                <th className="p-4 text-left">DNI / Contacto</th>
                                <th className="p-4 text-left">Carrera Postulada</th>
                                <th className="p-4 text-left">Asignar Aula de Examen</th>
                                <th className="p-4 text-center">Estado de Admisión</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                              {filteredList.map((app, idx) => (
                                <tr key={app.dni || idx} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="p-4 text-left">
                                    <span className="font-extrabold text-slate-900 block">{app.name} {app.lastName}</span>
                                    <span className="text-[9.5px] text-slate-400 font-extrabold uppercase mt-0.5 block">
                                      CÓDIGO: {app.applicantCode || "PE-2026-" + app.dni.slice(-4)}
                                    </span>
                                  </td>
                                  <td className="p-4 text-left">
                                    <span className="font-mono font-bold text-slate-700 block">{app.dni}</span>
                                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{app.phone || app.email}</span>
                                  </td>
                                  <td className="p-4 uppercase text-[10.5px] text-slate-800">
                                    {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                                  </td>
                                  <td className="p-4 text-left">
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                                      <select
                                        value={app.examClassroom || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updatedList = applicants.map(a => {
                                            if (a.dni === app.dni) {
                                              return { 
                                                ...a, 
                                                examClassroom: val || undefined,
                                                examStatus: val ? "Programado" as const : "No Programado" as const
                                              };
                                            }
                                            return a;
                                          });
                                          onUpdateApplicants(updatedList);
                                        }}
                                        className="text-[11px] font-sans font-bold bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-850 shadow-3xs cursor-pointer focus:outline-none focus:border-indigo-500"
                                      >
                                        <option value="">-- Sin Asignar Aula --</option>
                                        {classroomOptions.map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                  <td className="p-4 text-center">
                                    <div className="flex items-center justify-center">
                                      <select
                                        value={app.admitted === "ADMITIDO" || app.admitted === true ? "admitido" : (app.admitted === "NO ADMITIDO" ? "no_admitido" : "pendiente")}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updatedList = applicants.map((a) => {
                                            if (a.dni === app.dni) {
                                              let admittedValue: "PENDIENTE" | "ADMITIDO" | "NO ADMITIDO" = "PENDIENTE";
                                              let folderStatusValue = a.folderStatus;
                                              if (val === "admitido") {
                                                admittedValue = "ADMITIDO";
                                                folderStatusValue = "Approved";
                                              } else if (val === "no_admitido") {
                                                admittedValue = "NO ADMITIDO";
                                              } else {
                                                admittedValue = "PENDIENTE";
                                              }
                                              return {
                                                ...a,
                                                admitted: admittedValue,
                                                folderStatus: folderStatusValue,
                                                folderApprovedAt: (folderStatusValue === "Approved") ? new Date().toISOString().split("T")[0] : a.folderApprovedAt
                                              };
                                            }
                                            return a;
                                          });
                                          onUpdateApplicants(updatedList);
                                          
                                          if (val === "admitido") {
                                            alert(`El ingresante ${app.name} ${app.lastName} ahora figura con el resultado ADMITIDO y pasará instantáneamente a la bandeja de matrícula.`);
                                          } else if (val === "no_admitido") {
                                            alert(`El postulante ${app.name} ${app.lastName} ha sido calificado como NO ADMITIDO.`);
                                          } else {
                                            alert(`El postulante ${app.name} ${app.lastName} queda en estado PENDIENTE.`);
                                          }
                                        }}
                                        className={`text-[11px] font-sans font-black uppercase tracking-wider bg-white border rounded-md px-3 py-1.5 shadow-3xs cursor-pointer focus:outline-none ${
                                          app.admitted === "ADMITIDO" || app.admitted === true
                                            ? "text-emerald-700 border-emerald-250 bg-emerald-50 hover:bg-emerald-100"
                                            : app.admitted === "NO ADMITIDO"
                                              ? "text-rose-700 border-rose-250 bg-rose-50 hover:bg-rose-100"
                                              : "text-slate-800 border-slate-300 hover:bg-slate-50"
                                        }`}
                                      >
                                        <option value="pendiente">PENDIENTE / EVALUACION</option>
                                        <option value="admitido">ADMITIDO (INGRESO)</option>
                                        <option value="no_admitido">NO ADMITIDO (HISTORIAL)</option>
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

        {/* ================= VISTAS Y RESULTADOS DE ADMISIÓN VIEW ================= */}
        {activeTab === "vistas" && (
          <PageTransition id="vistas" className="space-y-6">
            <PageHeader
              title="Vistas y Reportes de Admisión"
              subtitle="Consulte estadísticas generales del proceso de admisión, analice el embudo de conversión y registre los resultados del examen de suficiencia académica."
              icon={<Users className="w-6 h-6 text-[#9F062A]" />}
              actions={renderPeriodSelector()}
            />

            {/* General Stats Cohort */}
            {(() => {
              const activeApps = applicants.filter(app => app.periodId === selectedPeriodId);
              const totalAppsCount = activeApps.length;
              const completedDossiers = activeApps.filter(app => {
                const isDni = app.docs?.dniFile?.status === "Validado";
                const isCert = app.docs?.certificadoFile?.status === "Validado";
                const isPartida = app.docs?.partidaFile ? app.docs.partidaFile.status === "Validado" : true;
                const isFoto = app.docs?.fotoFile?.status === "Validado";
                const isPayment = app.paymentStatus === "Validado";
                return isDni && isCert && isPartida && isFoto && isPayment;
              });

              const admittedList = activeApps.filter(a => a.admitted === "ADMITIDO" || a.admitted === true);
              const enrolledList = enrollments.filter(enr => {
                const isApp = applicants.find(a => a.dni === enr.studentDni && a.periodId === selectedPeriodId);
                return enr.academicStatus === "MATRICULADO" && isApp;
              });

              const revenue = activeApps.filter(a => a.paymentStatus === "Validado").length * 120;

              return (
                <div className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">1. Prepostulantes</span>
                      <span className="text-xl font-black text-slate-800 mt-1 block font-mono">{totalAppsCount}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">En este período</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wider block">2. Expedientes Aptos</span>
                      <span className="text-xl font-black text-amber-700 mt-1 block font-mono">{completedDossiers.length}</span>
                      <span className="text-[9px] text-slate-550 font-bold block mt-0.5">Pagos y Docs aprobados</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-[#9F062A] font-extrabold uppercase tracking-wider block">3. Admitidos (Examen)</span>
                      <span className="text-xl font-black text-[#9F062A] mt-1 block font-mono">{admittedList.length}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Ingresantes aprobados</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
                      <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">4. Matriculados</span>
                      <span className="text-xl font-black text-emerald-700 mt-1 block font-mono">{enrolledList.length}</span>
                      <span className="text-[9px] text-slate-550 font-bold block mt-0.5">Con matrícula confirmada</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left col-span-1 sm:col-span-2 lg:col-span-1">
                      <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider block">Total Recaudación</span>
                      <span className="text-xl font-black text-blue-800 mt-1 block font-mono">S/. {revenue.toFixed(2)}</span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Por derecho de admisión</span>
                    </div>
                  </div>

                  {/* Funnel chart and program division */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                      <h3 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider">Embudo de Proceso</h3>
                      <div className="space-y-3.5">
                        {[
                          { label: "Postulación Inicial", value: totalAppsCount, pct: 100, color: "bg-slate-400" },
                          { label: "Expediente Validado", value: completedDossiers.length, pct: totalAppsCount ? Math.round((completedDossiers.length / totalAppsCount) * 100) : 0, color: "bg-amber-500" },
                          { label: "Admitidos (Ingresantes)", value: admittedList.length, pct: totalAppsCount ? Math.round((admittedList.length / totalAppsCount) * 100) : 0, color: "bg-[#9F062A]" },
                          { label: "Matrícula Completada", value: enrolledList.length, pct: admittedList.length ? Math.round((enrolledList.length / admittedList.length) * 100) : 0, color: "bg-emerald-500" },
                        ].map((step, sIdx) => (
                          <div key={sIdx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span>{step.label}</span>
                              <span className="font-mono font-black">{step.value} ({step.pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`${step.color} h-2 rounded-full`} style={{ width: `${Math.min(100, step.pct)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                      <h3 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider">Distribución por Programas de Estudio</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-150 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">ELECTRICIDAD INDUSTRIAL</span>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 leading-none">
                              {activeApps.filter(a => a.programId === "electronica").length}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">Inscritos</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 font-mono pt-2.5 border-t border-slate-100">
                            <div>Admitidos: <span className="font-black text-[#9F062A]">{admittedList.filter(a => a.programId === "electronica").length}</span></div>
                            <div>Matriculados: <span className="font-black text-emerald-700">{enrolledList.filter(item => item.programId === "electronica").length}</span></div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-150 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">CONTABILIDAD</span>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 leading-none">
                              {activeApps.filter(a => a.programId === "contabilidad").length}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">Inscritos</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 font-mono pt-2.5 border-t border-slate-100">
                            <div>Admitidos: <span className="font-black text-[#9F062A]">{admittedList.filter(a => a.programId === "contabilidad").length}</span></div>
                            <div>Matriculados: <span className="font-black text-emerald-700">{enrolledList.filter(item => item.programId === "contabilidad").length}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grading and Admission exam results board */}
                  <Card>
                    <CardHeader>
                      <div className="text-left">
                        <CardTitle>Resultados Académicos y Calificación del Examen</CardTitle>
                        <CardDescription>Rellene el resultado oficial para los postulantes calificados correspondientes al período seleccionado. Cuando marque a un postulante como ADMITIDO, pasará instantáneamente a la bandeja de matrícula de Ingresantes.</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {completedDossiers.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-xs font-bold leading-normal">
                          No se han detectado expedientes completamente aprobados (carpeta validada y pago validado) en este período aún.
                        </div>
                      ) : (
                        <div className="overflow-x-auto text-xs font-semibold animate-scale-up">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                                <th className="p-4 text-left">Postulante</th>
                                <th className="p-4 text-left">DNI</th>
                                <th className="p-4 text-left">Especialidad Postulada</th>
                                <th className="p-4 text-left">Expediente Administrativo</th>
                                <th className="p-4 text-center">Estado del Examen / Admisión</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                              {completedDossiers.map((app, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 text-left">
                                    <span className="font-black text-slate-900 block">{app.name} {app.lastName}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{app.applicantCode || "Sin Código"}</span>
                                  </td>
                                  <td className="p-4 font-mono font-bold text-slate-600">{app.dni}</td>
                                  <td className="p-4 uppercase text-[10.5px]">
                                    {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                                  </td>
                                  <td className="p-4 text-left">
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-850 border border-emerald-250 rounded-full text-[9px] font-black uppercase tracking-wider">
                                      EXPEDIENTE COMPLETO
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <div className="flex items-center justify-center">
                                      <select
                                        value={app.admitted === "ADMITIDO" || app.admitted === true ? "admitido" : (app.admitted === "NO ADMITIDO" ? "no_admitido" : "pendiente")}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updatedList = applicants.map((a) => {
                                            if (a.dni === app.dni) {
                                              let admittedValue: "PENDIENTE" | "ADMITIDO" | "NO ADMITIDO" = "PENDIENTE";
                                              let folderStatusValue: "Pending" | "Observed" | "Approved" | "Enrolled" = "Pending";
                                              if (val === "admitido") {
                                                admittedValue = "ADMITIDO";
                                                folderStatusValue = "Approved";
                                              } else if (val === "no_admitido") {
                                                admittedValue = "NO ADMITIDO";
                                                folderStatusValue = "Pending";
                                              } else {
                                                admittedValue = "PENDIENTE";
                                                folderStatusValue = "Pending";
                                              }
                                              return {
                                                ...a,
                                                admitted: admittedValue,
                                                folderStatus: folderStatusValue
                                              };
                                            }
                                            return a;
                                          });
                                          onUpdateApplicants(updatedList);
                                          
                                          if (val === "admitido") {
                                            alert(`El ingresante ${app.name} ${app.lastName} ahora figura con el resultado ADMITIDO.`);
                                          } else if (val === "no_admitido") {
                                            alert(`El postulante ${app.name} ${app.lastName} ha sido calificado como NO ADMITIDO.`);
                                          } else {
                                            alert(`El postulante ${app.name} ${app.lastName} queda en estado PENDIENTE.`);
                                          }
                                        }}
                                        className="text-[11px] font-sans font-extrabold uppercase tracking-wider bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 shadow-3xs cursor-pointer focus:outline-none focus:border-[#9F062A]"
                                      >
                                        <option value="pendiente">PENDIENTE / SIN ENTRAR</option>
                                        <option value="admitido">ADMITIDO (INSPECTADO)</option>
                                        <option value="no_admitido">NO ADMITIDO / OMISO</option>
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
              actions={renderPeriodSelector()}
            />

            {(() => {
              // 1. Get dynamic careers from MPA
              let activeMpaCareers: any[] = [];
              try {
                const saved = localStorage.getItem("mpa_db_careers");
                if (saved) {
                  const allC = JSON.parse(saved);
                  if (Array.isArray(allC)) {
                    activeMpaCareers = allC.filter((c: any) => c.status === "Activo" || !c.status);
                  }
                }
              } catch (e) {
                console.error("Error loading mpa_db_careers", e);
              }

              // 2. Get active curriculum version for this active career
              let mpaCurriculumVersions: any[] = [];
              try {
                const saved = localStorage.getItem("mpa_db_curriculum_versions");
                if (saved) mpaCurriculumVersions = JSON.parse(saved);
              } catch (e) {
                console.error("Error loading mpa_db_curriculum_versions", e);
              }

              // 3. Get curriculum mapping (malla mapping)
              let mpaCurriculumMapping: any[] = [];
              try {
                const saved = localStorage.getItem("mpa_db_curriculum");
                if (saved) mpaCurriculumMapping = JSON.parse(saved);
              } catch (e) {
                console.error("Error loading mpa_db_curriculum", e);
              }

              // 4. Get courses list
              let mpaCoursesList: any[] = [];
              try {
                const saved = localStorage.getItem("mpa_db_courses");
                if (saved) mpaCoursesList = JSON.parse(saved);
              } catch (e) {
                console.error("Error loading mpa_db_courses", e);
              }

              const admittedCandidates = applicants.filter(app => app.periodId === selectedPeriodId && (app.admitted === true || app.admitted === "ADMITIDO"));
              const filteredAdmittedCandidates = careerFilter === "all" 
                ? admittedCandidates 
                : admittedCandidates.filter(c => c.programId === careerFilter);

              const targetDni = selectedMatriculaDni || (filteredAdmittedCandidates[0]?.dni || null);
              const targetCandidate = filteredAdmittedCandidates.find(c => c.dni === targetDni);
              const existingEnrollment = enrollments.find(e => e.studentDni === targetDni);

              const activeShift = matriculaShifts[targetDni || ""] || existingEnrollment?.shift || "Mañana";
              
              // Fallback to first active career from MPA if available
              const defaultCareerId = activeMpaCareers.length > 0 ? activeMpaCareers[0].id : "electronica";
              const activeCareer = matriculaCareers[targetDni || ""] || existingEnrollment?.programId || targetCandidate?.programId || defaultCareerId;

              // Find active curriculum version for active career
              const activeVersion = mpaCurriculumVersions.find(v => v.careerId === activeCareer && (v.isActive || v.status === "Activa"));
              let cicloICoursesFromMpa: any[] = [];
              if (activeVersion) {
                const versionCoursesMapping = mpaCurriculumMapping.filter(item => item.versionId === activeVersion.id && item.cycle === 1);
                const versionCourseIds = versionCoursesMapping.map(m => m.courseId);
                cicloICoursesFromMpa = mpaCoursesList
                  .filter(c => versionCourseIds.includes(c.id))
                  .map(c => ({
                    code: c.code || "CRS-" + c.id.substring(4, 8),
                    name: c.name,
                    credits: Number(c.credits || 3),
                    type: c.type || "Especialidad"
                  }));
              }

              const cicloICourses = cicloICoursesFromMpa;
              const hasUsedMpaMalla = cicloICoursesFromMpa.length > 0;

              return (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left">
                  
                  <div className="xl:col-span-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <CardTitle className="text-sm font-bold">Matriculados del Período</CardTitle>
                          <select 
                            value={careerFilter}
                            onChange={(e) => {
                              setCareerFilter(e.target.value);
                              setSelectedMatriculaDni(null); // Reset selection
                            }}
                            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-[11px] font-extrabold text-slate-700 outline-none focus:border-[#9F062A] cursor-pointer"
                          >
                            <option value="all">Todas las Carreras</option>
                            {activeMpaCareers.length > 0 ? (
                              activeMpaCareers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))
                            ) : (
                              <>
                                <option value="electronica">Electricidad</option>
                                <option value="contabilidad">Contabilidad</option>
                              </>
                            )}
                          </select>
                        </div>
                        <CardDescription className="text-[11px] mt-1">Seleccione un ingresante admitido para administrar su ciclo, turno y asignaturas del primer semestre académico.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        {filteredAdmittedCandidates.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                            No hay ingresantes admitidos aptos para matricular en esta carrera todavía.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {filteredAdmittedCandidates.map((cand) => {
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
                                  <div className="flex justify-between items-start w-full gap-2">
                                    <span className="font-extrabold text-slate-900 text-[11.5px] truncate max-w-[130px]">
                                      {cand.name} {cand.lastName}
                                    </span>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                      {isEnr ? (
                                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Matriculado</span>
                                      ) : candEnr?.paymentStatus === "Validado" ? (
                                        <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1"><Clock className="w-3 h-3 text-sky-500" /> Pendiente matrícula</span>
                                      ) : (
                                        <span className="text-[10px] font-bold text-slate-600">Admitido</span>
                                      )}
                                      {(() => {
                                        const payStatus = candEnr?.paymentStatus || "No Pagado";
                                        if (payStatus === "Validado") {
                                          return <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pago validado</span>;
                                        } else if (payStatus === "Pendiente") {
                                          return <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> Pendiente validación</span>;
                                        } else if (payStatus === "Observado") {
                                          return <span className="text-[10px] font-bold text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-600" /> Pago observado</span>;
                                        } else {
                                          return <span className="text-[10px] font-bold text-red-700 flex items-center gap-1"><Clock className="w-3 h-3 text-red-600" /> Pendiente de pago</span>;
                                        }
                                      })()}
                                    </div>
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
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h3 className="text-sm font-black uppercase tracking-wide">
                                {targetCandidate.name} {targetCandidate.lastName}
                              </h3>
                              <button
                                type="button"
                                onClick={() => setSelectedDossierAppDni(targetCandidate.dni)}
                                className="inline-flex items-center gap-1.5 uppercase font-black text-[9px] tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700/60 cursor-pointer transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver Dossier</span>
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold">
                              DNI Operacional: {targetCandidate.dni} | Correo Electrónico: {targetCandidate.email}
                            </p>
                          </div>
                          <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest font-mono leading-none">Estado Académico</span>
                              <span className="text-[11px] font-black text-amber-400 block uppercase mt-0.5">
                                {existingEnrollment?.academicStatus === "MATRICULADO" ? "REGISTRADO COMO MATRICULADO" : "PENDIENTE DE MATRÍCULA"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest font-mono leading-none">Control de Pago (Oficina de Caja)</span>
                              {(() => {
                                const payStatus = existingEnrollment?.paymentStatus || "No Pagado";
                                if (payStatus === "Validado") {
                                  return <span className="text-[11px] font-black text-emerald-400 block uppercase mt-0.5">VALIDADO</span>;
                                } else if (payStatus === "Pendiente") {
                                  return <span className="text-[11px] font-black text-sky-400 block uppercase mt-0.5">PENDIENTE VALIDACIÓN</span>;
                                } else if (payStatus === "Observado") {
                                  return <span className="text-[11px] font-black text-rose-500 block uppercase mt-0.5">PAGO OBSERVADO</span>;
                                } else {
                                  return <span className="text-[11px] font-black text-rose-500 block uppercase mt-0.5">PENDIENTE DE PAGO</span>;
                                }
                              })()}
                            </div>
                          </div>
                        </div>

                        <Card>
                          <CardHeader className="border-b border-slate-100">
                            <CardTitle>Configuración de Matrícula Regular - Ciclo / Periodo I</CardTitle>
                            <CardDescription>Determine la Carrera Final de Destino, Turno Oficial (recuerde los 3 turnos mañana, tarde y noche), ciclo actual y verifique la currícula de asignaturas del Ciclo I.</CardDescription>
                          </CardHeader>
                          
                          {existingEnrollment?.paymentStatus !== "Validado" ? (
                            <div className="p-8 text-center space-y-4 bg-rose-50/10 animate-fade-in">
                              <div className="w-16 h-16 rounded-full bg-rose-100 text-[#9F062A] flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
                                <ShieldAlert className="w-8 h-8 animate-pulse" />
                              </div>
                              <div className="space-y-2 max-w-md mx-auto">
                                <h3 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Inscripción Bloqueada por Recaudación</h3>
                                <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                                  No se puede matricular a este ingresante porque su derecho de <span className="font-bold text-slate-800">Matrícula Regular (S/. 250.00)</span> aún no ha sido <span className="text-[#9F062A] font-black underline">VALIDADO</span> por la Oficina de Caja (MAMC).
                                </p>
                                <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 mt-3 text-left space-y-2 shadow-2xs">
                                  <p className="flex justify-between border-b pb-1.5"><span className="text-slate-400 font-bold uppercase text-[9px]">DNI del Alumno:</span> <span className="font-mono text-slate-800">{targetDni}</span></p>
                                  <p className="flex justify-between border-b pb-1.5"><span className="text-slate-400 font-bold uppercase text-[9px]">Estado de Pago:</span> <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                                    existingEnrollment?.paymentStatus === "Pendiente" ? "bg-amber-100 text-amber-850 border border-amber-200 animate-pulse" :
                                    existingEnrollment?.paymentStatus === "Observado" ? "bg-red-150 text-red-850 border border-red-200" : "bg-slate-150 text-slate-600 border border-slate-200"
                                  }`}>{existingEnrollment?.paymentStatus || "PENDIENTE DE PAGO"}</span></p>
                                  {existingEnrollment?.paymentOperation && (
                                    <p className="flex justify-between"><span className="text-slate-400 font-bold uppercase text-[9px]">N° de Operación:</span> <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{existingEnrollment.paymentOperation}</span></p>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#9F062A] font-extrabold leading-normal pt-3">
                                  POR FAVOR, REVISE Y APRUEBE EL VOUCHER EN LA SECCIÓN "CAJA (MATRÍCULAS)" ANTES DE CONTINUAR CON LA SECRETARÍA GENERAL.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <CardContent className="space-y-6 p-6">
                                
                                <div className="space-y-2 text-left">
                                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <span>1. Carrera de Destino</span>
                                    {hasUsedMpaMalla && (
                                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase leading-none">
                                        Unificado con MPA
                                      </span>
                                    )}
                                  </label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(activeMpaCareers.length > 0
                                      ? activeMpaCareers.map(c => ({
                                          id: c.id,
                                          name: c.name,
                                          desc: c.description || `Carrera profesional de ${c.name}. Código: ${c.code || c.id}.`
                                        }))
                                      : [
                                          { id: "electronica", name: "Electricidad Industrial", desc: "Sistemas eléctricos de media/baja tensión y automatización." },
                                          { id: "contabilidad", name: "Contabilidad", desc: "Auditorías financieras, tributación corporativa e informática aplicada." }
                                        ]
                                    ).map(p => {
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

                                <div className="space-y-2 text-left">
                                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                                    3. Grupo Académico Destino *
                                  </label>
                                  <div className="flex gap-2">
                                    <select
                                      value={matriculaGroups[targetDni!] || existingEnrollment?.groupId || ""}
                                      onChange={(e) => {
                                        setMatriculaGroups({
                                          ...matriculaGroups,
                                          [targetDni!]: e.target.value
                                        });
                                      }}
                                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-[#9F062A] cursor-pointer"
                                    >
                                      <option value="">-- SELECCIONE GRUPO ACADÉMICO --</option>
                                      {(() => {
                                        let mpaGroups = [];
                                        try {
                                          const rawGroups = localStorage.getItem("mpa_db_groups");
                                          if (rawGroups) mpaGroups = JSON.parse(rawGroups);
                                        } catch (e) {
                                          console.error(e);
                                        }
                                        
                                        return mpaGroups.map(grp => {
                                          let mpaTasks = [];
                                          try {
                                            const rawTasks = localStorage.getItem("mpa_db_tasks");
                                            if (rawTasks) mpaTasks = JSON.parse(rawTasks);
                                          } catch (e) {
                                            console.error(e);
                                          }
                                          const isScheduled = mpaTasks.some(tk => tk.groupId === grp.id);
                                          return (
                                            <option key={grp.id} value={grp.id}>
                                              {grp.name} (Ciclo {grp.cycle}) {isScheduled ? "Programado" : "Sin Programación"}
                                            </option>
                                          );
                                        });
                                      })()}
                                    </select>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold leading-normal">
                                    De acuerdo con las políticas del módulo de planificación (MPA), el grupo debe poseer al menos un curso programado.
                                  </p>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-left">
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">4. Ciclo Autorizado</span>
                                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide mt-0.5">Ciclo I (Primer Periodo Regular)</span>
                                  </div>
                                  <span className="px-2.5 py-1 text-[9px] bg-sky-50 text-sky-700 border border-sky-200 rounded font-black uppercase">Ingresante</span>
                                </div>

                                <div className="space-y-3 text-left">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                                      <span>5. Asignaturas de Currícula para Inscripción</span>
                                      {hasUsedMpaMalla ? (
                                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0">
                                          Currícula MPA: {activeVersion?.name}
                                        </span>
                                      ) : (
                                        <span className="bg-rose-100 text-[#9F062A] border border-rose-200 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0">
                                          Sin Configuración en MPA
                                        </span>
                                      )}
                                    </label>
                                    <span className="text-[9.5px] text-slate-400 font-extrabold font-mono uppercase">
                                      Créditos Totales: {cicloICourses.reduce((a, c) => a + c.credits, 0)}
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-150">
                                    {cicloICourses.length === 0 ? (
                                      <div className="p-6 text-center text-[#9F062A] bg-rose-50/25 border border-rose-100 rounded-xl text-xs font-bold space-y-1">
                                        <p>No existen asignaturas pre-diseñadas para el Ciclo I en esta carrera.</p>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Configure primero la malla/versión curricular y sus cursos asociados dentro de la Planificación Académica (MPA).</p>
                                      </div>
                                    ) : (
                                      <div className="divide-y divide-slate-150">
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
                                    )}
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
                                  onClick={() => handleConfirmMatricula(targetDni!, activeShift, activeCareer, matriculaGroups[targetDni!] || existingEnrollment?.groupId || "")}
                                  variant="primary"
                                  size="sm"
                                  className="font-black uppercase tracking-wider text-[11px] bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {existingEnrollment?.academicStatus === "MATRICULADO" ? "Actualizar Matrícula" : "Confirmar e Inscribir Matrícula de Ciclo I"}
                                </Button>
                              </CardFooter>
                            </>
                          )}
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

        {/* ================= ESTUDIANTES MATRICULADOS VIEW ================= */}
        {activeTab === "matriculados" && (
          <PageTransition id="matriculados" className="space-y-6">
            <PageHeader
              title="Padrón Oficial de Estudiantes Matriculados"
              subtitle="Consulte la nómina oficial, administre la cohorte matriculada y expida constancias oficiales de matrícula con validez institucional."
              icon={<CheckSquare className="w-6 h-6 text-emerald-600" />}
              actions={renderPeriodSelector()}
            />

            {/* Stats Summary Panel */}
            {(() => {
              const matriculatedListInSearch = enrollments
                .filter(enr => enr.academicStatus === "MATRICULADO")
                .map(enr => {
                  const applicant = applicants.find(a => a.dni === enr.studentDni);
                  return { enr, app: applicant };
                })
                .filter(item => {
                  const matchesPeriod = selectedPeriodId === "all" || item.app?.periodId === selectedPeriodId;
                  const matchesCareer = careerFilter === "all" || item.enr.programId === careerFilter;
                  
                  let matchesSearch = true;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const nameOk = item.app?.name?.toLowerCase().includes(q) || false;
                    const lastNameOk = item.app?.lastName?.toLowerCase().includes(q) || false;
                    const dniOk = item.enr.studentDni.includes(q);
                    const codeOk = item.app?.applicantCode?.toLowerCase().includes(q) || false;
                    matchesSearch = nameOk || lastNameOk || dniOk || codeOk;
                  }
                  return matchesPeriod && matchesCareer && matchesSearch;
                });

              const totalMatriculados = matriculatedListInSearch.length;
              const elecMatriculados = matriculatedListInSearch.filter(item => item.enr.programId === "electronica").length;
              const contMatriculados = matriculatedListInSearch.filter(item => item.enr.programId === "contabilidad").length;

              return (
                <div className="space-y-6 text-left">
                  {/* Performance Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Matriculados Filtrados</span>
                        <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">{totalMatriculados}</span>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">Con Matrícula validada</span>
                      </div>
                      <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckSquare className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Electricidad Industrial</span>
                        <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{elecMatriculados}</span>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">Sistemas Electromecánicos</span>
                      </div>
                      <div className="p-3.5 bg-sky-50 rounded-xl text-sky-600">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Contabilidad Regular</span>
                        <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{contMatriculados}</span>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1">Contabilidad Pública e Impuestos</span>
                      </div>
                      <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Query Filters Control bar */}
                  <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search string */}
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        placeholder="Buscar por DNI, Apellidos, Nombres, Código..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase font-mono">Buscar</span>
                    </div>

                    {/* Filters dropdowns */}
                    <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <label htmlFor="padr-period-sel" className="text-[9.5px] font-black uppercase text-slate-500 whitespace-nowrap">Periodo:</label>
                        <select
                          id="padr-period-sel"
                          value={selectedPeriodId}
                          onChange={(e) => setSelectedPeriodId(e.target.value)}
                          className="bg-transparent text-slate-800 border-none font-extrabold text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="all">TODOS LOS PERIODOS</option>
                          {admissionPeriods.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <label htmlFor="padr-career-sel" className="text-[9.5px] font-black uppercase text-slate-500 whitespace-nowrap">Carrera:</label>
                        <select
                          id="padr-career-sel"
                          value={careerFilter}
                          onChange={(e) => setCareerFilter(e.target.value)}
                          className="bg-transparent text-slate-800 border-none font-extrabold text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="all">TODAS LAS ESPECIALIDADES</option>
                          <option value="electronica">ELECTRICIDAD INDUSTRIAL</option>
                          <option value="contabilidad">CONTABILIDAD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Main Padrón Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <CardTitle>Nómina de Matriculados Oficiales del Instituto</CardTitle>
                          <CardDescription>Estudiantes que completaron exitosamente su proceso de carpeta, examen y registro académico regular.</CardDescription>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {totalMatriculados} Estudiantes Registrados
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {matriculatedListInSearch.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 font-bold text-xs">
                          No se encontraron estudiantes matriculados que coincidan con los filtros seleccionados en este período.
                        </div>
                      ) : (
                        <div className="overflow-x-auto text-xs font-semibold">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 text-[10.5px] uppercase border-b border-slate-100">
                                <th className="p-4 text-center w-12">N°</th>
                                <th className="p-4 text-left">Código de Matrícula</th>
                                <th className="p-4 text-left">Nombre Completo / DNI</th>
                                <th className="p-4 text-left">Especialidad de Destino</th>
                                <th className="p-4 text-left">Turno Asignado</th>
                                <th className="p-4 text-center">Ciclo Activo</th>
                                <th className="p-4 text-center">Condición de Matrícula</th>
                                <th className="p-4 text-center">Carpeta / Constancia</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                              {matriculatedListInSearch.map((item, idx) => {
                                const code = item.app?.applicantCode || `REG-${item.enr.studentDni.slice(0, 4)}`;
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                                    <td className="p-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                                    <td className="p-4 font-mono font-black text-[#9F062A] uppercase">{code}</td>
                                    <td className="p-4 text-left">
                                      <span className="font-black text-slate-900 block">{item.app ? `${item.app.lastName}, ${item.app.name}` : "Estudiante Sin Registro de Enlace"}</span>
                                      <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 block">DNI: {item.enr.studentDni}</span>
                                    </td>
                                    <td className="p-4 text-left">
                                      {item.enr.programId === "electronica" ? (
                                        <span className="inline-flex items-center gap-1.5 uppercase font-bold text-[10px] text-slate-800">
                                          <span className="w-2 h-2 rounded-full bg-sky-500" />
                                          Electricidad Industrial
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 uppercase font-bold text-[10px] text-slate-800">
                                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                                          Contabilidad
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4 text-left font-bold text-slate-600">
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md font-sans text-[10px] border">
                                        {item.enr.shift || "Mañana"}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center font-black text-slate-800 font-mono">CICLO I</td>
                                    <td className="p-4 text-center">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-850 hover:bg-emerald-150 border border-emerald-250 rounded-full text-[9px] font-black uppercase tracking-wider select-none animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                                        Matrícula Regular
                                      </span>
                                    </td>
                                    <td className="p-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        {item.app && (
                                          <button
                                            type="button"
                                            onClick={() => setSelectedDossierAppDni(item.app!.dni)}
                                            className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg shadow-3xs cursor-pointer select-none transition-all"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Dossier</span>
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setSelectedFichaDni(item.enr.studentDni)}
                                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-3xs cursor-pointer select-none transition-all border border-transparent"
                                        >
                                          Emitir Ficha
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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

        {/* ================= PERIODOS DE ADMISIÓN VIEW ================= */}
        {activeTab === "periodos" && (
          <PageTransition id="periodos" className="space-y-6 animate-fade-in">
            <PageHeader
              title="Apertura y Gestión de Períodos de Admisión"
              subtitle="Cree nuevos períodos académicos de examen y programe sus fechas clave. Actívelos para habilitar o desactivar el formulario de pre-inscripción pública."
              icon={<Calendar className="w-6 h-6" />}
            />

            {/* General Admission Status Banner */}
            {admissionPeriods.find(p => p.status === "APERTURADO" || p.isActive) ? (
              <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-lg flex items-start gap-4 shadow-3xs animate-fade-in">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full shrink-0 animate-fade-in/70">
                  <CheckCircle className="w-5 h-5 text-emerald-700 font-bold" />
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                    PROCESO DE ADMISIÓN ACTIVO: {(admissionPeriods.find(p => p.status === "APERTURADO" || p.isActive))?.name}
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

            {/* Interactive Stacked Layout: Top Form, Bottom List */}
            <div className="space-y-6">
              {/* Top Form card: Create Period */}
              <Card>
                <CardHeader className="border-b border-slate-100">
                  <div>
                    <CardTitle>Aperturar Nuevo Periodo de Admisión</CardTitle>
                    <CardDescription>Registre un nuevo ciclo académico reprogramando sus fechas clave de pre-inscripción, examen y matrícula</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {mpaPeriods.length === 0 ? (
                    <div className="py-8 px-4 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-[#9F062A]">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider block">Planificación requerida</h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          No se registran períodos académicos en el MPA. Es obligatorio que primero cree al menos un período académico en el Módulo de Planificación Académica antes de aperturar un proceso de admisión.
                        </p>
                      </div>
                      <div className="pt-2">
                        <span className="inline-block bg-rose-50 text-[#9F062A] text-[9px] font-black uppercase px-3 py-1.5 rounded tracking-wider border border-rose-100">
                           Requiere Registro en MPA
                        </span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreatePeriod} className="space-y-6 text-xs font-semibold text-left">
                      <div className="space-y-2 max-w-xl">
                        <label className="block text-[10px] font-black text-[#9F062A] uppercase tracking-wide">
                          Seleccionar Período Académico del MPA *
                        </label>
                        <select
                          required
                          value={selectedAcademicPeriodId}
                          onChange={(e) => handleMpaPeriodChange(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-extrabold text-slate-800 cursor-pointer"
                        >
                          <option value="">-- SELECCIONE PERÍODO ACADÉMICO --</option>
                          {mpaPeriods.map(ap => {
                            const alreadyLinked = admissionPeriods.some(adp => adp.academicPeriodId === ap.id);
                            return (
                              <option key={ap.id} value={ap.id} disabled={alreadyLinked}>
                                {sanitizePeriodName(ap.name)} {alreadyLinked ? " (Ya tiene Admisión)" : ""}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-[10px] text-slate-400 font-bold leading-normal">
                          Por restricciones de integración, un Período Académico solo puede tener un único Período de Admisión asociado.
                        </p>
                        {selectedAcademicPeriodId && (
                          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-900 leading-normal font-medium space-y-1 animate-fade-in mt-2">
                            <span className="font-extrabold uppercase text-amber-800 flex items-center gap-1 text-[9.5px]">
                              Fechas Sugeridas Calculadas
                            </span>
                            <p>
                              Se han pre-completado fechas referenciales calculadas en base a la Fecha de Inicio de Clases del MPA:
                            </p>
                            <ul className="list-disc pl-3.5 space-y-0.5 mt-1 font-bold text-amber-850">
                              <li><strong>Pre-Inscripción:</strong> 35 días antes del inicio de clases</li>
                              <li><strong>Evaluación y Publicación:</strong> 20 días antes del inicio de clases</li>
                              <li><strong>Matrícula Regular:</strong> 10 días antes del inicio de clases</li>
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 4 HORIZONTAL GRID COLUMNS FOR DATES */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-slate-100">
                        {/* Section 1: Pre-inscripción */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                          <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200">
                            1. Pre-Inscripción Virtual
                          </span>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                Fecha Inicio
                              </label>
                              <input
                                type="date"
                                required
                                value={newPeriodPreEnrollmentStartDate}
                                max={newPeriodPreEnrollmentEndDate || undefined}
                                onChange={(e) => setNewPeriodPreEnrollmentStartDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
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
                                min={newPeriodPreEnrollmentStartDate || undefined}
                                max={newPeriodAdmissionDate || undefined}
                                onChange={(e) => setNewPeriodPreEnrollmentEndDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Examen y Publicación */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                          <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200">
                            2. Evaluación y Publicación
                          </span>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                Fecha de Examen
                              </label>
                              <input
                                type="date"
                                required
                                value={newPeriodAdmissionDate}
                                min={newPeriodPreEnrollmentEndDate || newPeriodPreEnrollmentStartDate || undefined}
                                max={newPeriodResultsPublicationDate || undefined}
                                onChange={(e) => setNewPeriodAdmissionDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                Publicación Resultados
                              </label>
                              <input
                                type="date"
                                required
                                value={newPeriodResultsPublicationDate}
                                min={newPeriodAdmissionDate || undefined}
                                max={newPeriodEnrollmentStartDate || undefined}
                                onChange={(e) => setNewPeriodResultsPublicationDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Matrícula Regular */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                          <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200">
                            3. Matrícula Regular
                          </span>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                Inicio Matrícula
                              </label>
                              <input
                                type="date"
                                required
                                value={newPeriodEnrollmentStartDate}
                                min={newPeriodResultsPublicationDate || newPeriodAdmissionDate || undefined}
                                max={newPeriodEnrollmentEndDate || undefined}
                                onChange={(e) => setNewPeriodEnrollmentStartDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
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
                                min={newPeriodEnrollmentStartDate || undefined}
                                max={newPeriodClassesStartDate || undefined}
                                onChange={(e) => setNewPeriodEnrollmentEndDate(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Inicio de Clases */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
                          <div>
                            <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200 mb-3">
                              4. Inicio del Ciclo Académico
                            </span>
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">
                                Fecha Inicio Clases (MPA)
                              </label>
                              <input
                                type="date"
                                disabled
                                value={newPeriodClassesStartDate}
                                className="w-full px-3 py-1.5 bg-slate-200/70 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          className="font-extrabold uppercase text-xs tracking-wider py-3 px-6 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Registrar Periodo de Admisión</span>
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Bottom List of Periods (Full Width) */}
              <Card>
                <CardHeader className="border-b border-slate-100">
                  <div>
                    <CardTitle>Listado de Periodos Académicos Registrados</CardTitle>
                    <CardDescription>Habilite o deshabilite el estado de admisión (Los registros son indefinidos y no se eliminan)</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {mpaPeriods.length === 0 ? (
                    <div className="p-12 text-center space-y-3 col-span-full">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400 mb-2">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <p className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">
                        Sin períodos académicos en MPA
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold leading-normal max-w-sm mx-auto">
                        Debe registrar y publicar primeramente un período escolar dentro del módulo de Planificación Académica (MPA) para habilitar esta vista.
                      </p>
                    </div>
                  ) : admissionPeriods.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                      No hay periodos registrados en el sistema.
                    </div>
                  ) : (
                    <div className="divide-y text-xs font-semibold divide-slate-100">
                      {admissionPeriods.map((period) => (
                        <div
                          key={period.id}
                          className="p-5 space-y-4 hover:bg-slate-50/40 transition-all text-left"
                        >
                          {/* Header bar: Title & Status badge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="p-2 rounded-lg bg-red-50 text-[#9F062A]">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="font-black text-slate-900 tracking-wide text-base block">
                                  ADMISIÓN {sanitizePeriodName(period.name)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold block">
                                  ID Periodo: {period.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {period.status === "APERTURADO" && (
                                <span className="px-3 py-1 bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Aperturado (Pre-Inscripción)
                                </span>
                              )}
                              {period.status === "PENDIENTE" && (
                                <span className="px-3 py-1 bg-amber-100/80 text-amber-800 border border-amber-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                                  <Clock className="w-4 h-4 text-amber-600" /> Pendiente (Inactivo)
                                </span>
                              )}
                              {period.status === "EXAMEN" && (
                                <span className="px-3 py-1 bg-red-100/80 text-[#9F062A] border border-red-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                                  <FileText className="w-4 h-4 text-[#9F062A]" /> Examen de Admisión
                                </span>
                              )}
                              {period.status === "MATRICULA" && (
                                <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 border border-indigo-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                                  <CreditCard className="w-4 h-4 text-indigo-600" /> Matrícula Regular
                                </span>
                              )}
                              {period.status === "CERRADO" && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                                  Cerrado / Finalizado
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 3x2 Grid for key dates & details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Card 1: Pre-Inscripción Virtual */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                              <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                                PRE-INSCRIPCIÓN VIRTUAL
                              </span>
                              <div className="text-slate-800 font-extrabold text-xs flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#9F062A] shrink-0" />
                                <span>
                                  {period.preEnrollmentStartDate ? new Date(period.preEnrollmentStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : "-"} al {period.preEnrollmentEndDate ? new Date(period.preEnrollmentEndDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                </span>
                              </div>
                            </div>

                            {/* Card 2: Examen de Admisión */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                              <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                                EXAMEN DE ADMISIÓN
                              </span>
                              <div className="text-slate-800 font-extrabold text-xs flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#9F062A] shrink-0" />
                                <span>
                                  {period.admissionDate ? new Date(period.admissionDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                </span>
                              </div>
                            </div>

                            {/* Card 3: Publicación de Resultados */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                              <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                                PUBLICACIÓN DE RESULTADOS
                              </span>
                              <div className="text-[#9F062A] font-extrabold text-xs flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#9F062A] shrink-0" />
                                <span>
                                  {period.resultsPublicationDate ? new Date(period.resultsPublicationDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "24 de Marzo, 2026"}
                                </span>
                              </div>
                            </div>

                            {/* Card 4: Matrícula Regular */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                              <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                                MATRÍCULA REGULAR
                              </span>
                              <div className="text-slate-800 font-extrabold text-xs flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>
                                  {period.enrollmentStartDate ? new Date(period.enrollmentStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : "-"} al {period.enrollmentEndDate ? new Date(period.enrollmentEndDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                                </span>
                              </div>
                            </div>

                            {/* Card 5: Inicio de Clases */}
                            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                              <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                                INICIO DE CLASES
                              </span>
                              <div className="text-indigo-950 font-black text-xs flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>
                                  {period.classesStartDate ? new Date(period.classesStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                </span>
                              </div>
                            </div>

                            {/* Card 6: Período Asociado (MPA) */}
                            {(() => {
                              const mpaP = mpaPeriods.find(ap => ap.id === period.academicPeriodId);
                              return (
                                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                                  <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                                    PERÍODO ASOCIADO (MPA)
                                  </span>
                                  <div className="text-emerald-900 font-black text-xs flex items-center gap-2 uppercase">
                                    <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{mpaP ? sanitizePeriodName(mpaP.name) : "PERIODO PREESTABLECIDO"}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Action Bar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                            <div className="flex items-center gap-3 flex-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                Cambiar Estado:
                              </label>
                              <select
                                value={period.status}
                                onChange={(e) => handleUpdatePeriodStatus(period.id, e.target.value as any)}
                                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] uppercase cursor-pointer flex-1 max-w-md shadow-3xs"
                              >
                                <option value="PENDIENTE">PENDIENTE (INACTIVO)</option>
                                <option value="APERTURADO">APERTURADO (PRE-INSCRIPCIÓN)</option>
                                <option value="EXAMEN">EXAMEN DE ADMISIÓN</option>
                                <option value="MATRICULA">REGISTRANDO MATRÍCULA</option>
                                <option value="CERRADO">CERRADO / FINALIZADO</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleDeletePeriod(period.id)}
                              className="px-4 py-2 text-xs font-extrabold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-3xs"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar Periodo</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
                            const lastMsg = app.supportMessages[app.supportMessages.length - 1];
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

      {selectedDossierAppDni && (() => {
        const app = applicants.find(a => a.dni === selectedDossierAppDni);
        if (!app) return null;

        const appDocs = app.docs || {
          dniFile: { status: "No Enviado" as const },
          certificadoFile: { status: "No Enviado" as const },
          partidaFile: { status: "No Enviado" as const },
          fotoFile: { status: "No Enviado" as const }
        };

        const docsConfig = [
          { label: "Copia de DNI", key: "dniFile" as const },
          { label: "Certificado de Secundaria", key: "certificadoFile" as const },
          { label: "Partida de Nacimiento", key: "partidaFile" as const },
          { label: "Fotografía Carnet", key: "fotoFile" as const }
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
                  onClick={() => setSelectedDossierAppDni(null)}
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
                        {docsConfig.filter(d => appDocs[d.key]?.status === "Validado").length} de 4 Aprobados
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {docsConfig.map((item) => {
                        const docState = appDocs[item.key] || { status: "No Enviado" as const };
                        const isUploaded = !!docState.fileDataUrl;
                        const obsInputKey = `${app.dni}_${item.key}`;
                        const currentObsText = individualDocObs[obsInputKey] || "";

                        return (
                          <div key={item.key} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs flex flex-col gap-3.5 hover:border-slate-300 transition-all">
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
                                  onClick={() => triggerAdminPreview(item.label + " - " + app.name.toUpperCase(), docState.fileName, "image", {
                                    dni: app.dni,
                                    studentName: app.name,
                                    studentLastName: app.lastName,
                                    fileDataUrl: docState.fileDataUrl
                                  })}
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
                                  onChange={(e) => setIndividualDocObs({
                                    ...individualDocObs,
                                    [obsInputKey]: e.target.value
                                  })}
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
                            {sanitizePeriodName(admissionPeriods.find(p => p.id === (app.periodId || "1"))?.name || "Periodo Regular 2026-I")}
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
                          onChange={(e) => setFolderObservationInput({
                            ...folderObservationInput,
                            [app.dni]: e.target.value
                          })}
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
                            { id: "Approved" as const, label: "Aprobada" }
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
      })()}

      {/* Render High Fidelity Image of Document Preview Component for Admin */}
      <ImagePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        fileName={previewFileName}
        fileType={previewFileType}
        metadata={previewMetadata}
      />

      {/* ================= FICHA / CONSTANCIA DE MATRÍCULA MODAL ================= */}
      {selectedFichaDni && (() => {
        const enr = enrollments.find(e => e.studentDni === selectedFichaDni);
        const app = applicants.find(a => a.dni === selectedFichaDni);
        if (!enr) return null;

        const pId = enr.programId || "electronica";
        
        const getFichaCourses = (programId: string) => {
          if (programId === "electronica") {
            return [
              { code: "EE-101", name: "Introducción a la Automatización", credits: 4, type: "Específico" },
              { code: "EE-102", name: "Dibujo e Instalaciones Eléctricas", credits: 4, type: "Específico" },
              { code: "EE-103", name: "Seguridad e Higiene Industrial", credits: 3, type: "Específico" },
              { code: "EE-104", name: "Matemática Aplicada a la Electricidad", credits: 4, type: "General" },
              { code: "EE-105", name: "Circuitos Técnicos y Mediciones", credits: 4, type: "Específico" },
              { code: "EE-106", name: "Ofimática e Investigación", credits: 3, type: "General" },
            ];
          } else {
            return [
              { code: "CO-101", name: "Fundamentos de Contabilidad", credits: 4, type: "Específico" },
              { code: "CO-102", name: "Técnicas de Documentación y Archivo", credits: 3, type: "Específico" },
              { code: "CO-103", name: "Matemática para Negocios", credits: 4, type: "General" },
              { code: "CO-104", name: "Informática Contable Básica", credits: 4, type: "Específico" },
              { code: "CO-105", name: "Legislación Tributaria General", credits: 4, type: "Específico" },
              { code: "CO-106", name: "Ofimática para la Gestión", credits: 3, type: "General" },
            ];
          }
        };

        const selectedCourses = getFichaCourses(pId);
        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
        const periodName = admissionPeriods.find(p => p.id === (app?.periodId || "1"))?.name || "Periodo Regular 2026-I";
        const code = app?.applicantCode || `REG-${enr.studentDni.slice(0, 4)}`;

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full text-slate-800 relative flex flex-col max-h-[90vh]">
              
              {/* Modal Header Actions */}
              <div className="bg-slate-50 border-b border-slate-150 px-5 py-3 flex justify-between items-center shrink-0">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Matrícula Confirmada: Visor de Constancia
                </span>
                <button
                  onClick={() => setSelectedFichaDni(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wide"
                >
                  Cerrar
                </button>
              </div>

              {/* Printable Body Sheet */}
              <div className="p-8 overflow-y-auto flex-1 text-left space-y-6" id="ficha-print-sheet">
                {/* Sheet Title Banner */}
                <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1.5">
                  <h1 className="text-[11px] font-black tracking-widest text-[#9F062A] uppercase">
                    Instituto de Educación Superior Tecnológico Público "San Francisco de Asís"
                  </h1>
                  <h2 className="text-[14px] font-extrabold tracking-normal text-slate-900 uppercase">
                    Constancia Oficial de Matrícula Regular
                  </h2>
                  <p className="text-[9.5px] font-bold text-slate-500 font-mono">
                    PERIODO ACADÉMICO / ADMISIÓN: {periodName.toUpperCase()}
                  </p>
                </div>

                {/* Personal Information Grid */}
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-[11px] font-semibold border-b border-dashed border-slate-200 pb-5">
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Estudiante</span>
                    <span className="text-slate-900 font-black text-xs uppercase">{app ? `${app.lastName}, ${app.name}` : "Estudiante Regular"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Código Único</span>
                    <span className="text-[#9F062A] font-black text-xs uppercase font-mono">{code}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Documento de Identidad</span>
                    <span className="text-slate-800 font-black font-mono">{enr.studentDni}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Especialidad Académica</span>
                    <span className="text-slate-900 font-bold uppercase">{pId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Estudios Turno</span>
                    <span className="text-slate-800 font-bold uppercase">{enr.shift || "Mañana"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block">Periodo de Ingreso</span>
                    <span className="text-slate-800 font-mono font-bold">CICLO I</span>
                  </div>
                </div>

                {/* Enrolled Courses Container */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Asignaturas Curriculares Registradas:
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-150">
                    {selectedCourses.map((course, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-[10.5px]">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-800 block text-[11.5px]">{course.name}</span>
                          <span className="font-mono text-[9px] text-slate-400 uppercase font-semibold">Código: {course.code} | {course.type.toUpperCase()}</span>
                        </div>
                        <span className="font-bold text-slate-700 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded text-[10px] font-mono select-none">
                          {course.credits} Créditos
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border p-3.5 rounded-lg text-xs font-bold text-slate-700 font-mono mt-3">
                    <span>MÁXIMO PERMITIDO (CICLO I): 22 CRÉDITOS</span>
                    <span>INSCRITOS: <span className="font-black text-emerald-700">{totalCredits} CRÉDITOS</span></span>
                  </div>
                </div>

                {/* Approvals Stamp Footnote */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-[9px] text-slate-450 space-y-0.5 max-w-sm text-left font-semibold italic">
                    <p>* Esta constancia acredita la inscripción formal del estudiante ingresante en los registros del IESTP San Francisco de Asís.</p>
                    <p>* Toda enmendadura o alteración invalida este documento.</p>
                  </div>
                  
                  {/* Seal Stamp */}
                  <div className="border-2 border-emerald-600 text-emerald-700/80 rounded-lg px-4 py-2.5 text-center font-mono uppercase bg-emerald-50/50 select-none scale-95 origin-right tracking-tight">
                    <span className="text-[9px] block font-black leading-tight">IESTP SAN FRANCISCO DE ASÍS</span>
                    <span className="text-[10px] block font-black leading-tight border-b border-emerald-300 py-0.5 my-0.5">VALOR ACADÉMICO</span>
                    <span className="text-[8px] block font-extrabold leading-tight">OFICINA ADMISIÓN Y MATRÍCULA</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="bg-slate-50 border-t border-slate-150 p-4 flex justify-end gap-3 shrink-0 rounded-b-xl">
                <Button
                  onClick={() => setSelectedFichaDni(null)}
                  variant="outline"
                  size="sm"
                  className="font-bold cursor-pointer"
                >
                  Regresar al Padrón
                </Button>
                <Button
                  onClick={() => {
                    window.print();
                  }}
                  variant="primary"
                  size="sm"
                  className="font-black uppercase tracking-wider text-[10.5px] bg-[#9F062A] hover:bg-black inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar PDF
                </Button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
