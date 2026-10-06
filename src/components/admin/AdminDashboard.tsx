import React, { useState } from "react";
import { 
  Calendar, CreditCard, Users, GraduationCap, CheckSquare, Compass, FileText
} from "lucide-react";
import { Applicant, Enrollment, StudentPersonalData, Classroom, Teacher, Graduation, AdmissionPeriod, Course, CourseAssignment, AttendanceRecord, MpaPeriod } from "../../types";
import { createAdmissionPeriod, updateAdmissionPeriod } from "../../services/api";

// Reusable Custom Design System Components
import Sidebar from "../ui/Sidebar";
import ImagePreviewModal from "../ui/ImagePreviewModal";

// Sub-components: Tabs
import { PeriodosTab } from "./tabs/PeriodosTab";
import { CajaAdmisionTab } from "./tabs/CajaAdmisionTab";
import { CajaRegularTab } from "./tabs/CajaRegularTab";
import { SecretariaTab } from "./tabs/SecretariaTab";
import { PostulantesTab } from "./tabs/PostulantesTab";
import { MatriculaTab } from "./tabs/MatriculaTab";
import { MatriculadosTab } from "./tabs/MatriculadosTab";
import { VistasTab } from "./tabs/VistasTab";
import { SoporteTab } from "./tabs/SoporteTab";

// Sub-components: Modals
import { ObservePaymentModal } from "./modals/ObservePaymentModal";
import { ApprovePaymentConfirmModal } from "./modals/ApprovePaymentConfirmModal";
import { DossierInspectionModal } from "./modals/DossierInspectionModal";
import { FichaEstudianteModal } from "./modals/FichaEstudianteModal";

const sanitizePeriodName = (str?: string) => {
  if (!str) return "";
  return str
    .replace(/\uFFFD/g, "")
    .replace(/Acad[\u0080-\uFFFFa-zA-Z]*mico/gi, "Académico")
    .replace(/Acadmico/gi, "Académico")
    .replace(/Acad[\u0080-\uFFFFa-zA-Z]*mica/gi, "Académica")
    .replace(/Admisi[\u0080-\uFFFFa-zA-Z]*n/gi, "Admisión")
    .replace(/Matr[\u0080-\uFFFFa-zA-Z]*cula/gi, "Matrícula")
    .replace(/Per[\u0080-\uFFFFa-zA-Z]*odo/gi, "Período")
    .replace(/Periodo\s+Periodo/gi, "Periodo")
    .replace(/Evauaci[\u0080-\uFFFFa-zA-Z]*n/gi, "Evaluación")
    .replace(/Publicaci[\u0080-\uFFFFa-zA-Z]*n/gi, "Publicación");
};

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

  // State for confirming approvals
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

    let mpaTasks = [];
    try {
      const rawTasks = localStorage.getItem("mpa_db_tasks");
      if (rawTasks) {
        mpaTasks = JSON.parse(rawTasks);
      }
    } catch (e) {
      console.error(e);
    }

    const hasProgramming = mpaTasks.some((t: any) => t.groupId === groupId);
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
            if (currentDoc.status !== "No Enviado" && currentDoc.fileName) {
              updatedDocs[key] = {
                ...currentDoc,
                status: "Validado" as const
              };
            }
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

          const preEnrollStart = new Date(baseDate);
          preEnrollStart.setDate(baseDate.getDate() - 35);
          const preEnrollEnd = new Date(baseDate);
          preEnrollEnd.setDate(baseDate.getDate() - 21);

          const examDate = new Date(baseDate);
          examDate.setDate(baseDate.getDate() - 20);
          const resultsDate = new Date(baseDate);
          resultsDate.setDate(baseDate.getDate() - 19);

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
          <CajaAdmisionTab
            applicants={applicants}
            selectedPeriodId={selectedPeriodId}
            renderPeriodSelector={renderPeriodSelector}
            triggerAdminPreview={triggerAdminPreview}
            handleApproveApplicantPayment={handleApproveApplicantPayment}
            openObservePaymentModal={openObservePaymentModal}
            handleResetApplicantPayment={handleResetApplicantPayment}
          />
        )}

        {/* Tab Caja / Regular Matrícula & Inscripciones auditing */}
        {activeTab === "caja_regular" && (
          <CajaRegularTab
            enrollments={enrollments}
            applicants={applicants}
            studentsList={studentsList}
            selectedPeriodId={selectedPeriodId}
            renderPeriodSelector={renderPeriodSelector}
            triggerAdminPreview={triggerAdminPreview}
            handleApproveEnrollmentPayment={handleApproveEnrollmentPayment}
            handleResetEnrollmentPayment={handleResetEnrollmentPayment}
          />
        )}

        {/* Tab Secretaria / Document folders reviews */}
        {activeTab === "secretaria" && (
          <SecretariaTab
            applicants={applicants}
            admissionPeriods={admissionPeriods}
            selectedPeriodId={selectedPeriodId}
            setSelectedPeriodId={setSelectedPeriodId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            prepostulantesCareerFilter={prepostulantesCareerFilter}
            setPrepostulantesCareerFilter={setPrepostulantesCareerFilter}
            applicantFilterType={applicantFilterType}
            setApplicantFilterType={setApplicantFilterType}
            setSelectedDossierAppDni={setSelectedDossierAppDni}
            renderPeriodSelector={renderPeriodSelector}
          />
        )}

        {/* Tab Postulantes (Examen y Aulas) */}
        {activeTab === "postulantes" && (
          <PostulantesTab
            applicants={applicants}
            selectedPeriodId={selectedPeriodId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            postulantesCareerFilter={postulantesCareerFilter}
            setPostulantesCareerFilter={setPostulantesCareerFilter}
            postulantesClassroomFilter={postulantesClassroomFilter}
            setPostulantesClassroomFilter={setPostulantesClassroomFilter}
            onUpdateApplicants={onUpdateApplicants}
            renderPeriodSelector={renderPeriodSelector}
          />
        )}

        {/* Tab Vistas y Resultados */}
        {activeTab === "vistas" && (
          <VistasTab
            applicants={applicants}
            enrollments={enrollments}
            selectedPeriodId={selectedPeriodId}
            onUpdateApplicants={onUpdateApplicants}
            renderPeriodSelector={renderPeriodSelector}
          />
        )}

        {/* Tab Proceso de Matrícula */}
        {activeTab === "matricula" && (
          <MatriculaTab
            applicants={applicants}
            enrollments={enrollments}
            selectedPeriodId={selectedPeriodId}
            selectedMatriculaDni={selectedMatriculaDni}
            setSelectedMatriculaDni={setSelectedMatriculaDni}
            careerFilter={careerFilter}
            setCareerFilter={setCareerFilter}
            matriculaShifts={matriculaShifts}
            setMatriculaShifts={setMatriculaShifts}
            matriculaCareers={matriculaCareers}
            setMatriculaCareers={setMatriculaCareers}
            matriculaGroups={matriculaGroups}
            setMatriculaGroups={setMatriculaGroups}
            setSelectedDossierAppDni={setSelectedDossierAppDni}
            handleConfirmMatricula={handleConfirmMatricula}
            handleResetMatricula={handleResetMatricula}
            renderPeriodSelector={renderPeriodSelector}
          />
        )}

        {/* Tab Estudiantes Matriculados */}
        {activeTab === "matriculados" && (
          <MatriculadosTab
            enrollments={enrollments}
            applicants={applicants}
            admissionPeriods={admissionPeriods}
            selectedPeriodId={selectedPeriodId}
            setSelectedPeriodId={setSelectedPeriodId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            careerFilter={careerFilter}
            setCareerFilter={setCareerFilter}
            setSelectedDossierAppDni={setSelectedDossierAppDni}
            setSelectedFichaDni={setSelectedFichaDni}
            renderPeriodSelector={renderPeriodSelector}
          />
        )}

        {/* Tab Periodos de Admisión */}
        {activeTab === "periodos" && (
          <PeriodosTab
            admissionPeriods={admissionPeriods}
            mpaPeriods={mpaPeriods}
            selectedAcademicPeriodId={selectedAcademicPeriodId}
            newPeriodPreEnrollmentStartDate={newPeriodPreEnrollmentStartDate}
            setNewPeriodPreEnrollmentStartDate={setNewPeriodPreEnrollmentStartDate}
            newPeriodPreEnrollmentEndDate={newPeriodPreEnrollmentEndDate}
            setNewPeriodPreEnrollmentEndDate={setNewPeriodPreEnrollmentEndDate}
            newPeriodAdmissionDate={newPeriodAdmissionDate}
            setNewPeriodAdmissionDate={setNewPeriodAdmissionDate}
            newPeriodResultsPublicationDate={newPeriodResultsPublicationDate}
            setNewPeriodResultsPublicationDate={setNewPeriodResultsPublicationDate}
            newPeriodEnrollmentStartDate={newPeriodEnrollmentStartDate}
            setNewPeriodEnrollmentStartDate={setNewPeriodEnrollmentStartDate}
            newPeriodEnrollmentEndDate={newPeriodEnrollmentEndDate}
            setNewPeriodEnrollmentEndDate={setNewPeriodEnrollmentEndDate}
            newPeriodClassesStartDate={newPeriodClassesStartDate}
            onMpaPeriodChange={handleMpaPeriodChange}
            onCreatePeriod={handleCreatePeriod}
            onUpdatePeriodStatus={handleUpdatePeriodStatus}
            onDeletePeriod={handleDeletePeriod}
            sanitizePeriodName={sanitizePeriodName}
          />
        )}

        {/* Tab Soporte Técnico */}
        {activeTab === "soporte" && (
          <SoporteTab
            applicants={applicants}
            selectedSupportAppDni={selectedSupportAppDni}
            setSelectedSupportAppDni={setSelectedSupportAppDni}
            adminSupportReply={adminSupportReply}
            setAdminSupportReply={setAdminSupportReply}
            onUpdateApplicants={onUpdateApplicants}
          />
        )}

      </main>

      {/* Observe Payment Modal */}
      <ObservePaymentModal
        isOpen={observePaymentModalOpen}
        observePaymentReason={observePaymentReason}
        setObservePaymentReason={setObservePaymentReason}
        onClose={() => setObservePaymentModalOpen(false)}
        onConfirm={handleConfirmObservePayment}
      />

      {/* Safety Confirmation Modal for Approving */}
      <ApprovePaymentConfirmModal
        isOpen={approvePaymentModalOpen}
        approvePaymentDni={approvePaymentDni}
        approvePaymentType={approvePaymentType}
        onClose={() => setApprovePaymentModalOpen(false)}
        onConfirm={handleConfirmAndCloseApprovePayment}
      />

      {/* Dossier Inspection Modal */}
      <DossierInspectionModal
        selectedDossierAppDni={selectedDossierAppDni}
        applicants={applicants}
        admissionPeriods={admissionPeriods}
        individualDocObs={individualDocObs}
        setIndividualDocObs={setIndividualDocObs}
        folderObservationInput={folderObservationInput}
        setFolderObservationInput={setFolderObservationInput}
        onClose={() => setSelectedDossierAppDni(null)}
        triggerAdminPreview={triggerAdminPreview}
        handleValidateApplicantDocument={handleValidateApplicantDocument}
        handleUpdateFolderStatus={handleUpdateFolderStatus}
        sanitizePeriodName={sanitizePeriodName}
      />

      {/* Image Previewer Modal */}
      <ImagePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        fileName={previewFileName}
        fileType={previewFileType}
        metadata={previewMetadata}
      />

      {/* Ficha / Constancia de Matrícula Modal */}
      <FichaEstudianteModal
        selectedFichaDni={selectedFichaDni}
        enrollments={enrollments}
        applicants={applicants}
        admissionPeriods={admissionPeriods}
        onClose={() => setSelectedFichaDni(null)}
      />
    </div>
  );
}
