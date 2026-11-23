import React, { useState, useEffect, useMemo } from "react";
import {
  User, FileText, Calendar, BookOpen, Clock, Award, HelpCircle, Building, ClipboardList, ArrowLeft,
  ChevronLeft, ChevronRight, CreditCard, Briefcase
} from "lucide-react";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CycleStatus, AttendanceRecord, Graduation, CourseEvaluation } from "../../types";
import { useAcademicCatalog } from "../../context/AcademicCatalogContext";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "../ui/Sidebar";
import SidebarCursoAlumno from "./SidebarCursoAlumno";
import Toast, { ToastNotice } from "../ui/Toast";

import { WelcomeTab } from "./tabs/WelcomeTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { ClassesTab } from "./tabs/ClassesTab";
import { ScheduleTab } from "./tabs/ScheduleTab";
import CourseEnrollmentTab from "./tabs/CourseEnrollmentTab";
import { AttendanceTab } from "./tabs/AttendanceTab";
import { ClosureTab } from "./tabs/ClosureTab";
import { GradesTab } from "./tabs/GradesTab";
import { ProceduresTab } from "./tabs/ProceduresTab";
import { EconomicInfoTab } from "./tabs/EconomicInfoTab";
import { PracticasPreprofesionalesTab } from "./tabs/PracticasPreprofesionalesTab";
import GuidesLibrary from "../shared/GuidesLibrary";
import AcademicCalendarBoard from "../shared/AcademicCalendarBoard";
import { fetchMpaCollections } from "../../services/mpaApi";
import { getCourseFormula } from "../../constants/courseFormulas";

interface AlumnoDashboardProps {
  studentDni: string;
  personalData: StudentPersonalData;
  enrollment: Enrollment;
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  attendanceLoading: boolean;
  attendanceError: string | null;
  onReloadAttendance: () => Promise<boolean>;
  cycleStatuses: CycleStatus[];
  graduation: Graduation | undefined;
  onUpdatePersonal: (data: StudentPersonalData) => void;
  onUpdateEnrollment: (enroll: Enrollment) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
  onLogout: () => void;
  onGoToPortal?: () => void;
}

export default function AlumnoDashboard({
  studentDni,
  personalData,
  enrollment,
  courses,
  materials,
  assignments,
  evaluations,
  attendance,
  attendanceLoading,
  attendanceError,
  onReloadAttendance,
  cycleStatuses,
  graduation,
  onUpdatePersonal,
  onUpdateEnrollment,
  onUpdateAssignments,
  onLogout,
  onGoToPortal
}: AlumnoDashboardProps) {
  const { programs: ACADEMIC_PROGRAMS, courses: catalogCourses } = useAcademicCatalog();
  const [activeTab, setActiveTab] = useState<"welcome" | "profile" | "classes" | "schedule" | "attendance" | "closure" | "notas" | "secretaria" | "guias" | "calendar" | "enrollment" | "economic_info" | "practicas">(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sfa_alumno_active_tab");
      if (saved) return saved as any;
    }
    return "welcome";
  });

  // Profile edit form fields
  const [profileForm, setProfileForm] = useState<StudentPersonalData>({ ...personalData });
  const [profileSavedMsg, setProfileSavedMsg] = useState("");

  // Outstanding billing simulation state (el alumno matriculado tiene su matrícula pagada y sin deuda)
  const isEnrolledAndPaid = enrollment?.academicStatus === "MATRICULADO" || (enrollment?.paymentStatus as string) === "Validado" || (enrollment?.paymentStatus as string) === "Pagado" || (enrollment?.paymentStatus as string) === "PAGADO";
  const [isPaidInvoice, setIsPaidInvoice] = useState(isEnrolledAndPaid);
  const [paymentOp, setPaymentOp] = useState(enrollment?.paymentOperation || (isEnrolledAndPaid ? `OP-MATR-2027-${personalData?.dni ? personalData.dni.slice(-4) : "0001"}` : ""));
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  useEffect(() => {
    if (enrollment?.academicStatus === "MATRICULADO" || (enrollment?.paymentStatus as string) === "Validado" || (enrollment?.paymentStatus as string) === "Pagado" || (enrollment?.paymentStatus as string) === "PAGADO") {
      setIsPaidInvoice(true);
    }
  }, [enrollment]);

  const [, setStorageSync] = useState(0);

  const isCycle2Paid = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_cycle2_payment_${studentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_payment") === "true" ||
    localStorage.getItem(`sfa_cycle2_validated_${studentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_validated_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_validated") === "true" ||
    (enrollment?.paymentStatus === "Validado" && (
      localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
      localStorage.getItem(`sfa_cycle2_payment_${studentDni}`) === "true" ||
      localStorage.getItem("sfa_cycle2_payment") === "true"
    ))
  );

  const isPromotedCycle2 = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle2_${studentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2") === "true" ||
    localStorage.getItem(`sfa_student_promoted_${studentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
    localStorage.getItem(`sfa_student_cycle_${studentDni}`) === "2" ||
    localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
    localStorage.getItem("sfa_student_cycle") === "2"
  );
  useEffect(() => {
    const handleSync = () => setStorageSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  // Sub-tab selection inside Profile View (Carga de Documentos / Historial de Pagos / Datos Académicos)
  const [profileInnerTab, setProfileInnerTab] = useState<"docs" | "payments" | "academic">("docs");

  // State members for interactive Consulta Académica multi-sidebar view
  const [selectedQueryCycle, setSelectedQueryCycle] = useState<"I" | "II" | "III" | "IV" | "V" | "VI">(() => {
    return isPromotedCycle2 ? "II" : "I";
  });
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});

  // Custom states for Image 1 and Image 2 High Fidelity replication
  const [expandedAttendanceCourse, setExpandedAttendanceCourse] = useState<string | null>("redes");
  const [selectedAcademicOption, setSelectedAcademicOption] = useState<string>("plan_curricular");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>(() => {
    return isPromotedCycle2 ? "02" : "01";
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("52");
  const [selectedQueryPeriod, setSelectedQueryPeriod] = useState<string>(() => {
    return isPromotedCycle2 ? "2027-II" : "2027-I";
  });
  const [selectedAttendanceSemester, setSelectedAttendanceSemester] = useState<string>(() => {
    return isPromotedCycle2 ? "2027-II" : "2027-I";
  });
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("sfa_alumno_course_detail") || "";
    }
    return "";
  });

  // Desktop sidebars collapsible states (toggle in the center/middle border)
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  const [isCourseSidebarCollapsed, setIsCourseSidebarCollapsed] = useState(false);
  const [activeCourseComponentId, setActiveCourseComponentId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sfa_alumno_course_comp_id");
      if (saved && saved !== "null" && saved !== "undefined") return saved;
    }
    return null;
  });

  // Aula Virtual substates
  const [activeCourseSection, setActiveCourseSection] = useState<"general" | "horarios" | "week" | "cierre">(() => {
    if (typeof window !== "undefined") {
      return (sessionStorage.getItem("sfa_alumno_course_section") as any) || "general";
    }
    return "general";
  });
  const [selectedClassWeek, setSelectedClassWeek] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return Number(sessionStorage.getItem("sfa_alumno_class_week")) || 1;
    }
    return 1;
  });
  const [selectedClassWeekOption, setSelectedClassWeekOption] = useState<"asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias">(() => {
    if (typeof window !== "undefined") {
      return (sessionStorage.getItem("sfa_alumno_week_option") as any) || "materiales";
    }
    return "materiales";
  });
  const [simulationHWFiles, setSimulationHWFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasTeacherActa = assignments.some(a =>
      (a.title?.startsWith("[Planilla]") || a.title?.includes("EX_FINAL") || a.title?.includes("PC1") || a.courseId?.includes("101") || a.courseId === "cur_ei_101") &&
      a.submissions?.some(s => (s.studentDni === studentDni || s.studentDni === "74859612") && typeof s.grade === "number")
    );
    if (hasTeacherActa && !localStorage.getItem("sfa_simulated_cycle1_74859612")) {
      const simulationPayload = {
        studentDni: studentDni || "74859612",
        studentName: personalData?.name ? `${personalData.name} ${personalData.lastName}` : "Mateo Sebastián Quispe Rojas",
        cycle: 1,
        completedAt: new Date().toISOString(),
        weightedAverage: 16.0,
        courses: [
          { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, grade: 15.6, isManual: true, approved: true },
          { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, grade: 16.5, isManual: false, approved: true },
          { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, grade: 17.0, isManual: false, approved: true },
          { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, grade: 15.0, isManual: false, approved: true },
          { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, grade: 16.0, isManual: false, approved: true }
        ]
      };
      localStorage.setItem("sfa_simulated_cycle1_74859612", JSON.stringify(simulationPayload));
      localStorage.setItem(`sfa_simulated_cycle1_${studentDni}`, JSON.stringify(simulationPayload));
      localStorage.setItem("sfa_simulated_cycle1", JSON.stringify(simulationPayload));
      localStorage.setItem("sfa_student_promoted_cycle2_74859612", "true");
      localStorage.setItem(`sfa_student_promoted_cycle2_${studentDni}`, "true");
      localStorage.setItem("sfa_student_promoted_cycle2", "true");
      localStorage.setItem("sfa_student_promoted_74859612", "true");
      localStorage.setItem(`sfa_student_promoted_${studentDni}`, "true");
      localStorage.setItem("sfa_student_promoted", "true");
      localStorage.setItem("sfa_student_cycle_74859612", "2");
      localStorage.setItem(`sfa_student_cycle_${studentDni}`, "2");
      localStorage.setItem("sfa_student_cycle", "2");
      window.dispatchEvent(new Event("storage"));
    }
  }, [assignments, studentDni, personalData]);
  const [expandedStudentWeeks, setExpandedStudentWeeks] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    try {
      sessionStorage.setItem("sfa_alumno_active_tab", activeTab);
      if (selectedCourseDetail) sessionStorage.setItem("sfa_alumno_course_detail", selectedCourseDetail);
      if (activeCourseComponentId) sessionStorage.setItem("sfa_alumno_course_comp_id", activeCourseComponentId);
      sessionStorage.setItem("sfa_alumno_course_section", activeCourseSection);
      sessionStorage.setItem("sfa_alumno_class_week", String(selectedClassWeek));
      sessionStorage.setItem("sfa_alumno_week_option", selectedClassWeekOption);
    } catch { }
  }, [activeTab, selectedCourseDetail, activeCourseComponentId, activeCourseSection, selectedClassWeek, selectedClassWeekOption]);

  // Academic advisory mailbox simulation
  const [advisorConsultText, setAdvisorConsultText] = useState("");
  const [advisorConsultSuccess, setAdvisorConsultSuccess] = useState(false);

  useEffect(() => {
    setProfileForm({ ...personalData });
  }, [personalData]);

  useEffect(() => {
    if (cycleStatuses && cycleStatuses.length > 0) {
      setSimulatedGrades((prev) => {
        const next = { ...prev };
        cycleStatuses.forEach((cs) => {
          if (cs.courses) {
            cs.courses.forEach((c) => {
              if (c.name && typeof c.grade === "number" && c.grade > 0) {
                const key = c.name.toLowerCase();
                next[key] = c.grade;
              }
            });
          }
        });
        return next;
      });
    }
  }, [cycleStatuses]);


  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePersonal(profileForm);
    setProfileSavedMsg("¡Sus datos de estudiante fueron actualizados en el sistema rector de la intranet!");
    setTimeout(() => setProfileSavedMsg(""), 4000);
  };

  const simulateDocUpload = (docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile", name: string) => {
    const isEnr = enrollment.academicStatus === "MATRICULADO";
    const updatedDocs = { ...enrollment.docs };
    updatedDocs[docKey] = {
      status: isEnr ? ("Validado" as const) : ("Pendiente" as const),
      fileName: name
    };
    const updated = { ...enrollment, docs: updatedDocs };
    onUpdateEnrollment(updated);
    try {
      localStorage.setItem(`sfa_doc_status_${studentDni}`, JSON.stringify(updatedDocs));
    } catch (e) { }
  };

  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);

  const notify = (message: string, kind: ToastNotice["kind"] = "info") => {
    setToastNotice({ id: Date.now(), message, kind });
  };

  const handlePayInvoice = () => {
    setIsPaidInvoice(true);
    notify("Pago de S/. 450.00 realizado satisfactoriamente mediante pasarela virtual de pagos. Su cuenta está al día.", "success");
  };

  const currentProgram = ACADEMIC_PROGRAMS.find((p) => p.id === enrollment.programId);

  // Dynamic integration of MAMC curriculum and MPA academic programming / schedule
  const [mpaPlanningData, setMpaPlanningData] = useState(() => {
    try {
      const tasksRaw = localStorage.getItem("mpa_db_tasks");
      const coursesRaw = localStorage.getItem("mpa_db_courses");
      const schedulesRaw = localStorage.getItem("mpa_db_schedules");
      const groupsRaw = localStorage.getItem("mpa_db_groups");
      const teachersRaw = localStorage.getItem("mpa_db_teachers");
      const classroomsRaw = localStorage.getItem("mpa_db_classrooms");
      const periodsRaw = localStorage.getItem("mpa_db_periods");
      const shiftsRaw = localStorage.getItem("mpa_db_shifts");
      const curriculumRaw = localStorage.getItem("mpa_db_curriculum");
      const versionsRaw = localStorage.getItem("mpa_db_curriculum_versions");

      return {
        tasks: tasksRaw ? JSON.parse(tasksRaw) : [],
        courses: coursesRaw ? JSON.parse(coursesRaw) : [],
        schedules: schedulesRaw ? JSON.parse(schedulesRaw) : [],
        groups: groupsRaw ? JSON.parse(groupsRaw) : [],
        teachers: teachersRaw ? JSON.parse(teachersRaw) : [],
        classrooms: classroomsRaw ? JSON.parse(classroomsRaw) : [],
        periods: periodsRaw ? JSON.parse(periodsRaw) : [],
        shifts: shiftsRaw ? JSON.parse(shiftsRaw) : [],
        curriculum: curriculumRaw ? JSON.parse(curriculumRaw) : [],
        curriculumVersions: versionsRaw ? JSON.parse(versionsRaw) : []
      };
    } catch (e) {
      console.error("Error loading MPA data in AlumnoDashboard:", e);
      return { tasks: [], courses: [], schedules: [], groups: [], teachers: [], classrooms: [], periods: [], shifts: [], curriculum: [], curriculumVersions: [] };
    }
  });

  useEffect(() => {
    let current = true;
    fetchMpaCollections().then((data) => {
      if (!current) return;
      setMpaPlanningData({
        tasks: data.tasks, courses: data.courses, schedules: data.schedules,
        groups: data.groups, teachers: data.teachers, classrooms: data.classrooms,
        periods: data.periods, shifts: data.shifts,
        curriculum: data.curriculum, curriculumVersions: data.curriculum_versions
      });
    }).catch((error) => console.error("Error loading MPA data from local API:", error));
    return () => { current = false; };
  }, []);

  // Realistic full morning shift schedule (Turno Mañana 08:00 AM - 01:00 PM) for Ciclo I Electricidad Industrial
  const DEFAULT_ELECTRICIDAD_TASKS = useMemo(() => [
    {
      id: "prog_ei_1_teo",
      groupId: "EI-I-A",
      courseId: "cur_ei_101",
      teacherDni: "99887766",
      classroomId: "aula_101",
      dayOfWeek: "Lunes",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_1_tal",
      groupId: "EI-I-A",
      courseId: "cur_ei_101",
      teacherDni: "99887766",
      classroomId: "lab_elec_1",
      dayOfWeek: "Lunes",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_2_teo",
      groupId: "EI-I-A",
      courseId: "cur_ei_102",
      teacherDni: "44556677",
      classroomId: "aula_102",
      dayOfWeek: "Martes",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_2_tal",
      groupId: "EI-I-A",
      courseId: "cur_ei_102",
      teacherDni: "44556677",
      classroomId: "lab_elec_3",
      dayOfWeek: "Martes",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_3_teo",
      groupId: "EI-I-A",
      courseId: "cur_ei_103",
      teacherDni: "66778899",
      classroomId: "aula_101",
      dayOfWeek: "Miércoles",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_3_tal",
      groupId: "EI-I-A",
      courseId: "cur_ei_103",
      teacherDni: "66778899",
      classroomId: "lab_elec_1",
      dayOfWeek: "Miércoles",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_5_lab",
      groupId: "EI-I-A",
      courseId: "cur_ei_105",
      teacherDni: "77889900",
      classroomId: "aula_101",
      dayOfWeek: "Jueves",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_4_pra",
      groupId: "EI-I-A",
      courseId: "cur_ei_104",
      teacherDni: "88990011",
      classroomId: "aula_101",
      dayOfWeek: "Jueves",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_1_med",
      groupId: "EI-I-A",
      courseId: "cur_ei_101",
      teacherDni: "99887766",
      classroomId: "lab_elec_1",
      dayOfWeek: "Viernes",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei_2_mon",
      groupId: "EI-I-A",
      courseId: "cur_ei_102",
      teacherDni: "44556677",
      classroomId: "lab_elec_3",
      dayOfWeek: "Viernes",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    }
  ], []);

  // Realistic full morning shift schedule (Turno Mañana 08:00 AM - 01:00 PM) for Ciclo II Electricidad Industrial (Grupo EI-II-A)
  const DEFAULT_ELECTRICIDAD_CICLO2_TASKS = useMemo(() => [
    {
      id: "prog_ei2_202_teo",
      groupId: "EI-II-A",
      courseId: "cur_ei_202",
      teacherDni: "44556677",
      classroomId: "aula_102",
      dayOfWeek: "Lunes",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_202_lab",
      groupId: "EI-II-A",
      courseId: "cur_ei_202",
      teacherDni: "44556677",
      classroomId: "lab_elec_3",
      dayOfWeek: "Lunes",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_201_teo",
      groupId: "EI-II-A",
      courseId: "cur_ei_201",
      teacherDni: "99887766",
      classroomId: "aula_101",
      dayOfWeek: "Martes",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_201_lab",
      groupId: "EI-II-A",
      courseId: "cur_ei_201",
      teacherDni: "99887766",
      classroomId: "lab_elec_1",
      dayOfWeek: "Martes",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_202_pra",
      groupId: "EI-II-A",
      courseId: "cur_ei_202",
      teacherDni: "44556677",
      classroomId: "lab_elec_3",
      dayOfWeek: "Miércoles",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_204_cad",
      groupId: "EI-II-A",
      courseId: "cur_ei_204",
      teacherDni: "88990011",
      classroomId: "lab_elec_2",
      dayOfWeek: "Miércoles",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_201_alt",
      groupId: "EI-II-A",
      courseId: "cur_ei_201",
      teacherDni: "99887766",
      classroomId: "lab_elec_1",
      dayOfWeek: "Jueves",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_205_ing",
      groupId: "EI-II-A",
      courseId: "cur_ei_205",
      teacherDni: "77889900",
      classroomId: "aula_101",
      dayOfWeek: "Jueves",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Teoría",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_203_med1",
      groupId: "EI-II-A",
      courseId: "cur_ei_203",
      teacherDni: "66778899",
      classroomId: "lab_elec_1",
      dayOfWeek: "Viernes",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    },
    {
      id: "prog_ei2_203_med2",
      groupId: "EI-II-A",
      courseId: "cur_ei_203",
      teacherDni: "66778899",
      classroomId: "lab_elec_1",
      dayOfWeek: "Viernes",
      startTime: "11:00 AM",
      endTime: "01:00 PM",
      sessionType: "Laboratorio",
      pedagogicalHours: 2
    }
  ], []);

  // Map student shift and career to find their registered group in MPA
  const studentGroup = useMemo(() => {
    if (isCycle2Paid || isPromotedCycle2) {
      return {
        id: "EI-II-A",
        name: "EI-II-A",
        careerId: enrollment.programId,
        shiftId: "sh_m",
        cycle: 2,
        capacity: 35,
        periodId: "admision-2027-ii"
      } as any;
    }
    if (enrollment.groupId) {
      const found = mpaPlanningData.groups.find((g: any) =>
        g.id === enrollment.groupId ||
        (enrollment.groupId.includes("ele") && g.id.includes("electronica")) ||
        (enrollment.groupId.includes("con") && g.id.includes("contabilidad"))
      );
      if (found) return found;
    }
    const shiftMapped = enrollment.shift === "Mañana" ? "sh_m" : enrollment.shift === "Tarde" ? "sh_t" : "sh_n";
    return mpaPlanningData.groups.find(
      (g: any) => g.careerId === enrollment.programId && g.shiftId === shiftMapped && g.cycle === 1
    ) || mpaPlanningData.groups.find((g: any) => g.careerId === enrollment.programId && g.cycle === 1) || mpaPlanningData.groups[0];
  }, [enrollment, mpaPlanningData, isCycle2Paid, isPromotedCycle2]);

  // The main group supplies regular courses; individual course assignments may use another shift.
  const studentTasks = useMemo(() => {
    if (isCycle2Paid || isPromotedCycle2) {
      return DEFAULT_ELECTRICIDAD_CICLO2_TASKS;
    }
    let tasks: any[] = [];
    if (studentGroup) {
      if (enrollment.registeredCourses) {
        tasks = mpaPlanningData.tasks.filter((task: any) => enrollment.registeredCourses?.some(
          (item) => item.courseId === task.courseId && item.groupId === task.groupId,
        ));
      } else {
        const extraAssignments = enrollment.courseGroupAssignments || [];
        tasks = mpaPlanningData.tasks.filter((task: any) =>
          extraAssignments.some((item) => item.courseId === task.courseId && item.groupId === task.groupId)
          || (task.groupId === studentGroup.id && !extraAssignments.some((item) => item.courseId === task.courseId)),
        );
      }
    }
    // If tasks are incomplete (fewer than 8 sessions), use the realistic complete morning schedule
    if (tasks.length < 8) {
      return DEFAULT_ELECTRICIDAD_TASKS;
    }
    return tasks;
  }, [studentGroup, mpaPlanningData, enrollment.courseGroupAssignments, enrollment.registeredCourses, DEFAULT_ELECTRICIDAD_TASKS, DEFAULT_ELECTRICIDAD_CICLO2_TASKS, isCycle2Paid, isPromotedCycle2]);

  // Build dynamic courses list combining MAMC/MPA Malla and Programación
  const dynamicMpaCourses = useMemo(() => {
    if (studentTasks.length === 0) return [];

    const uniqueCourseIds = Array.from(new Set(studentTasks.map((t: any) => t.courseId)));

    return uniqueCourseIds.map((courseId: any) => {
      const courseObj = mpaPlanningData.courses.find((c: any) => c.id === courseId || c.code === courseId);
      const associatedTasks = studentTasks.filter((t: any) => t.courseId === courseId);
      const primaryTask = associatedTasks[0];

      const teacherObj = mpaPlanningData.teachers.find((t: any) => t.dni === primaryTask?.teacherDni);
      const classroomObj = mpaPlanningData.classrooms.find((c: any) => c.id === primaryTask?.classroomId);

      const courseFallbackNames: Record<string, { name: string; code: string; credits: number }> = {
        "cur_ei_101": { name: "Fundamentos de Electricidad y Circuitos CC", code: "EIND-101", credits: 4 },
        "cur_ei_102": { name: "Instalaciones Eléctricas de Edificaciones", code: "EIND-102", credits: 4 },
        "cur_ei_103": { name: "Seguridad e Higiene Industrial en Baja Tensión", code: "EIND-103", credits: 3 },
        "cur_ei_104": { name: "Matemática Aplicada a la Tecnología Eléctrica", code: "EIND-104", credits: 3 },
        "cur_ei_105": { name: "Comunicación y Tecnologías Digitales", code: "EIND-105", credits: 2 },
        "cur_ei_201": { name: "Circuitos Eléctricos en Corriente Alterna", code: "EIND-201", credits: 4 },
        "EIND-101": { name: "Fundamentos de Electricidad y Circuitos CC", code: "EIND-101", credits: 4 },
        "EIND-102": { name: "Instalaciones Eléctricas de Edificaciones", code: "EIND-102", credits: 4 },
        "EIND-103": { name: "Seguridad e Higiene Industrial en Baja Tensión", code: "EIND-103", credits: 3 },
        "EIND-104": { name: "Matemática Aplicada a la Tecnología Eléctrica", code: "EIND-104", credits: 3 },
        "EIND-105": { name: "Comunicación y Tecnologías Digitales", code: "EIND-105", credits: 2 },
        "EIND-201": { name: "Circuitos Eléctricos en Corriente Alterna", code: "EIND-201", credits: 4 }
      };

      const teacherFallbackNames: Record<string, string> = {
        "99887766": "Ing. Manuel Ramos Salazar",
        "44556677": "Ing. Carlos Alberto Mendoza Quispe",
        "66778899": "Ing. Jorge Luis Paucar Silva",
        "88990011": "Lic. Fernando Gabriel Díaz Torres",
        "77889900": "Lic. Sofía Lorena Valenzuela Ríos",
        "40112233": "Ing. Manuel Ramos Salazar",
        "41223344": "Ing. Carlos Alberto Mendoza Quispe",
        "42334455": "Ing. Jorge Luis Paucar Silva",
        "43445566": "Lic. Fernando Gabriel Díaz Torres"
      };

      const classroomFallbackNames: Record<string, string> = {
        "aula_101": "Aula 101 - Pabellón A",
        "aula_102": "Aula 102 - Pabellón A",
        "lab_elec_1": "Taller de Máquinas Eléctricas y Tableros",
        "lab_elec_2": "Laboratorio de Cómputo y Simulación",
        "lab_elec_3": "Taller de Instalaciones Eléctricas y Redes BT",
        "aula-101": "Aula 101 - Pabellón A",
        "aula-102": "Aula 102 - Pabellón A",
        "aula-103": "Aula 103 - Pabellón A",
        "taller-maquinas": "Taller de Máquinas Eléctricas y Tableros",
        "taller-redes": "Taller de Instalaciones Eléctricas y Redes BT"
      };

      const fallback = courseFallbackNames[courseId] || courseFallbackNames[courseObj?.code || ""];
      const courseName = courseObj ? courseObj.name : (fallback?.name || "Unidad Didáctica");
      const courseCode = courseObj ? courseObj.code : (fallback?.code || courseId || "UD-101");
      const credits = courseObj ? courseObj.credits : (fallback?.credits || primaryTask?.pedagogicalHours || 4);
      const classroomName = classroomObj ? classroomObj.name : (classroomFallbackNames[primaryTask?.classroomId || ""] || "Aula Asignada");
      const teacherFullName = teacherObj ? `${teacherObj.name} ${teacherObj.lastName}` : (teacherFallbackNames[primaryTask?.teacherDni || ""] || "Docente Principal");

      const scheduleText = associatedTasks.map((t: any) => {
        return `${t.dayOfWeek || "Lunes"} ${t.startTime || "08:00 AM"} - ${t.endTime || "01:00 PM"}`;
      }).join(" / ");

      const relatedDbCourses = courses.filter((cItem: any) =>
        cItem.code === courseCode ||
        cItem.code?.startsWith(`${courseCode}-`) ||
        cItem.id === courseId ||
        (cItem as any)._id === courseId
      );
      const dynamicAttendanceIds = Array.from(new Set([
        `cur-${courseId}`,
        courseId,
        courseCode,
        courseObj?.id,
        courseObj?.code,
        ...relatedDbCourses.map((rc: any) => rc.id),
        ...relatedDbCourses.map((rc: any) => (rc as any)._id),
        ...relatedDbCourses.map((rc: any) => rc.code)
      ].filter(Boolean)));

      return {
        id: `cur-${courseId}`,
        name: courseName,
        code: courseCode,
        credits: credits,
        classroom: classroomName,
        schedule: scheduleText,
        teacherDni: primaryTask?.teacherDni || "docente",
        teacherName: teacherFullName,
        career: enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad",
        group: mpaPlanningData.groups.find((group: any) => group.id === primaryTask?.groupId)?.name || studentGroup?.name || "Grupo A",
        cycle: (courseCode.includes("-20") || courseObj?.referenceCycle === 2 || courseObj?.cycle === 2) ? "Ciclo II" : "Ciclo I",
        startDate: mpaPlanningData.periods?.find((p: any) => p.id === studentGroup?.periodId)?.startDate || "2027-03-22",
        endDate: mpaPlanningData.periods?.find((p: any) => p.id === studentGroup?.periodId)?.endDate || "2027-07-30",
        studentCount: studentGroup?.capacity || 30,
        description: `Unidad didáctica curricular matriculada. Plan de estudios de la carrera técnica de ${enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}.`,
        formula: `NF = ${getCourseFormula(courseCode).expression}`,
        attendanceCourseIds: dynamicAttendanceIds
      };
    });
  }, [studentTasks, mpaPlanningData, enrollment, studentGroup]);

  // Real courses for Ciclo I of the student's career
  const ciclo1Courses = useMemo(() => {
    return catalogCourses
      .filter((c: any) => c.careerId === enrollment.programId && (c.referenceCycle === 1 || c.cycle === 1))
      .map((c: any) => ({
        id: `cur-${c.id}`,
        name: c.name,
        code: c.code,
        credits: c.credits || 4,
        classroom: "Aula Asignada",
        schedule: enrollment.shift ? `Turno ${enrollment.shift}` : "Horario Regular",
        teacherDni: "",
        teacherName: "Docente por Asignar",
        career: enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad",
        group: studentGroup?.name || "Grupo A",
        cycle: "Ciclo I",
        startDate: mpaPlanningData.periods?.find((p: any) => p.id === studentGroup?.periodId)?.startDate || "2027-03-22",
        endDate: mpaPlanningData.periods?.find((p: any) => p.id === studentGroup?.periodId)?.endDate || "2027-07-30",
        studentCount: studentGroup?.capacity || 30,
        description: `Unidad didáctica del Ciclo I correspondiente al plan de estudios oficial de ${enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}.`,
        formula: `NF = ${getCourseFormula(c.code).expression}`
      }));
  }, [catalogCourses, enrollment.programId, enrollment.shift, studentGroup, mpaPlanningData.periods]);

  const ciclo2Courses = useMemo(() => [
    {
      id: "cur_ei_201",
      name: "Circuitos Eléctricos en Corriente Alterna",
      code: "EIND-201",
      credits: 4,
      classroom: "Aula 201 • Pabellón A",
      schedule: "Martes y Jueves 08:00 AM - 12:00 PM",
      teacherDni: "08529631",
      teacherName: "Ing. Manuel Ramos Salazar",
      career: "Electricidad Industrial",
      group: "EI-II-A",
      cycle: "Ciclo II",
      startDate: "2027-08-16",
      endDate: "2027-12-17",
      studentCount: 30,
      description: "Unidad didáctica del Ciclo II. Análisis de formas de onda senoidales, fasores, potencia activa, reactiva y aparente en circuitos RLC.",
      formula: "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL"
    },
    {
      id: "cur_ei_202",
      name: "Electrónica Analógica y de Potencia Básica",
      code: "EIND-202",
      credits: 4,
      classroom: "Taller de Electrónica 102",
      schedule: "Lunes y Miércoles 08:00 AM - 12:00 PM",
      teacherDni: "44556677",
      teacherName: "Ing. Carlos Alberto Mendoza Quispe",
      career: "Electricidad Industrial",
      group: "EI-II-A",
      cycle: "Ciclo II",
      startDate: "2027-08-16",
      endDate: "2027-12-17",
      studentCount: 30,
      description: "Diodos, transistores BJT y MOSFET, tiristores, rectificación controlada y fuentes conmutadas.",
      formula: "NF = 0.25*NPA + 0.25*PC1 + 0.25*PC2 + 0.25*EX_FINAL"
    },
    {
      id: "cur_ei_203",
      name: "Taller de Medidas e Instrumentos Eléctricos",
      code: "EIND-203",
      credits: 3,
      classroom: "Lab. Medidas Eléctricas 103",
      schedule: "Viernes 08:00 AM - 01:00 PM",
      teacherDni: "77889900",
      teacherName: "Lic. Jorge Luis Paucar Silva",
      career: "Electricidad Industrial",
      group: "EI-II-A",
      cycle: "Ciclo II",
      startDate: "2027-08-16",
      endDate: "2027-12-17",
      studentCount: 30,
      description: "Uso de osciloscopios, analizadores de redes, vatímetros, telurómetros y megóhmetros.",
      formula: "NF = 0.30*NPA + 0.30*LAB + 0.40*EX_FINAL"
    },
    {
      id: "cur_ei_204",
      name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)",
      code: "EIND-204",
      credits: 3,
      classroom: "Centro de Cómputo CAD 204",
      schedule: "Miércoles 02:00 PM - 06:00 PM",
      teacherDni: "33221100",
      teacherName: "Ing. Fernando Gabriel Díaz Torres",
      career: "Electricidad Industrial",
      group: "EI-II-A",
      cycle: "Ciclo II",
      startDate: "2027-08-16",
      endDate: "2027-12-17",
      studentCount: 30,
      description: "Diseño y diagramación de planos unifilares, esquemas de fuerza y mando según norma IEC.",
      formula: "NF = 0.30*NPA + 0.30*PROY + 0.40*EX_FINAL"
    },
    {
      id: "cur_ei_205",
      name: "Inglés Técnico para Electricidad",
      code: "EIND-205",
      credits: 2,
      classroom: "Aula 205 • Pabellón B",
      schedule: "Lunes 02:00 PM - 05:00 PM",
      teacherDni: "55667788",
      teacherName: "Prof. Sofía Lorena Valenzuela Ríos",
      career: "Electricidad Industrial",
      group: "EI-II-A",
      cycle: "Ciclo II",
      startDate: "2027-08-16",
      endDate: "2027-12-17",
      studentCount: 30,
      description: "Terminología técnica en inglés aplicada a manuales de equipos, datasheets y normas internacionales.",
      formula: "NF = 0.30*NPA + 0.30*ORAL + 0.40*EX_FINAL"
    }
  ], []);

  const baseStudentCourses = enrollment.registeredCourses ? dynamicMpaCourses : dynamicMpaCourses.length > 0
    ? dynamicMpaCourses
    : (ciclo1Courses.length > 0 ? ciclo1Courses : courses.filter((c: any) => c.careerId === enrollment.programId || c.career === currentProgram?.name));

  const studentCourses = useMemo(() => {
    if (isCycle2Paid || isPromotedCycle2) {
      return ciclo2Courses;
    }
    return baseStudentCourses;
  }, [baseStudentCourses, isCycle2Paid, isPromotedCycle2, ciclo2Courses]);

  const enrichSingleCourse = useCallback((c: any) => {
    let iconType = "BarChart3";
    if (c.code.includes("101") || c.name.toLowerCase().includes("automatización") || c.name.toLowerCase().includes("control")) {
      iconType = "Cpu";
    } else if (c.code.includes("403") || c.name.toLowerCase().includes("circuitos") || c.name.toLowerCase().includes("instalaciones")) {
      iconType = "Zap";
    } else if (c.code.includes("502") || c.name.toLowerCase().includes("maquinaria") || c.name.toLowerCase().includes("potencia") || c.name.toLowerCase().includes("motores")) {
      iconType = "Sliders";
    }

    let description = c.description || `Unidad didáctica del plan curricular para la carrera de ${currentProgram?.name || "Electricidad Industrial"}. Enfocada en desarrollar competencias profesionales esenciales del sector tecnológico nacional.`;

    const courseFormula = getCourseFormula(c.code);
    const formula = `NF = ${courseFormula.expression}`;
    const relatedDbCourses = courses.filter((course) =>
      course.code === c.code ||
      course.code?.startsWith(`${c.code}-`) ||
      course.id === c.id ||
      (course as any)._id === c.id
    );

    const matchIds = new Set<string>([c.id, c.code]);
    relatedDbCourses.forEach((rc: any) => {
      if (rc.id) matchIds.add(rc.id);
      if (rc._id) matchIds.add(rc._id);
      if (rc.code) matchIds.add(rc.code);
    });

    const courseAssignments = assignments.filter((a) => matchIds.has(a.courseId));

    // 1. Weekly formative homework / tasks (NPA - Nota de Participación y Actividades Continuas)
    // Weekly reports and workshop tasks across weeks that accumulate and average into the NPA
    const weeklyTasks = courseAssignments
      .filter((a) =>
        !a.title.startsWith("[Planilla] ") &&
        a.kind !== "assessment" &&
        !a.curricularComponent
      )
      .map((assignment, index) => {
        const submission = assignment.submissions.find((item) => item.studentDni === studentDni);
        const grade = submission?.grade;
        return {
          id: assignment.id || `task-${index}`,
          name: assignment.title,
          sub: assignment.description || "Evidencia y reporte técnico de sesión semanal",
          prefix: `SEM ${index + 1}`,
          category: "Actividad Semanal / NPA",
          dueDate: assignment.dueDate,
          feedback: submission?.feedback || "",
          grade: grade === undefined ? "NR" : grade,
          hasSubmitted: !!submission,
          isGraded: typeof grade === "number",
          isCurricular: false
        };
      });

    // NPA average: arithmetic mean of graded weekly tasks
    const gradedTasks = weeklyTasks.filter((t) => typeof t.grade === "number");
    const npaAverage = gradedTasks.length > 0
      ? Math.round((gradedTasks.reduce((acc, t) => acc + (t.grade as number), 0) / gradedTasks.length) * 10) / 10
      : null;

    // Check if student has simulated cycle 1 completion from MGE
    const simCourse = (() => {
      try {
        const rawSim = typeof window !== "undefined" ? (
          localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`) ||
          localStorage.getItem("sfa_simulated_cycle1_74859612") ||
          localStorage.getItem("sfa_simulated_cycle1")
        ) : null;
        if (rawSim) {
          const simData = JSON.parse(rawSim);
          const found = simData.courses?.find((sc: any) => sc.code === c.code || sc.name === c.name);
          if (found) return found;
        }

        const hasTeacherActa = assignments.some(a =>
          (a.title?.startsWith("[Planilla]") || a.title?.includes("EX_FINAL") || a.title?.includes("PC1") || a.courseId?.includes("101") || a.courseId === "cur_ei_101") &&
          a.submissions?.some(s => (s.studentDni === studentDni || s.studentDni === "74859612") && typeof s.grade === "number")
        );

        const isAnyPromotionOrSimulationActive = typeof window !== "undefined" && Boolean(
          hasTeacherActa ||
          localStorage.getItem(`sfa_student_promoted_${studentDni}`) === "true" ||
          localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted") === "true" ||
          localStorage.getItem(`sfa_student_promoted_cycle2_${studentDni}`) === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle2") === "true" ||
          localStorage.getItem(`sfa_student_cycle_${studentDni}`) === "2" ||
          localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
          localStorage.getItem("sfa_student_cycle") === "2" ||
          localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`) ||
          localStorage.getItem("sfa_simulated_cycle1_74859612") ||
          localStorage.getItem("sfa_simulated_cycle1")
        );

        if (isAnyPromotionOrSimulationActive) {
          const defaults: Record<string, number> = {
            "EIND-101": 15.6,
            "EIND-102": 16.5,
            "EIND-103": 17.0,
            "EIND-104": 15.0,
            "EIND-105": 16.0
          };
          if (defaults[c.code]) {
            return { code: c.code, grade: defaults[c.code], isManual: false };
          }
        }
      } catch {}
      return null;
    })();

    // 2. Curricular components from the official course formula (NPA, PC1, PC2, EX_FINAL)
    // Matches explicit planilla entries, NPA continuous average, or official scheduled assessments
    const formulaEvaluations = courseFormula.variables.map((variable) => {
      // Check explicit [Planilla] assignment
      const planillaAssignment = courseAssignments.find((a) => a.title === `[Planilla] ${variable.id}`);
      const planillaSub = planillaAssignment?.submissions.find((s) => s.studentDni === studentDni);

      // Check official assessment explicitly matching variable id (e.g. "[Semana 4] PC1: Práctica Calificada" or kind === "assessment")
      const assessmentAssignment = courseAssignments.find((a) =>
        !a.title.startsWith("[Planilla] ") && (
          a.curricularComponent === variable.id ||
          (a.kind === "assessment" && a.title.toUpperCase().includes(variable.id)) ||
          a.title.toUpperCase().includes(`[${variable.id}]`)
        )
      );
      const assessmentSub = assessmentAssignment?.submissions.find((s) => s.studentDni === studentDni);

      let grade: number | "NR" = "NR";
      let subDesc = variable.label;
      if (planillaSub?.grade !== undefined) {
        grade = planillaSub.grade;
      } else if (assessmentSub?.grade !== undefined) {
        grade = assessmentSub.grade;
        subDesc = `${assessmentAssignment?.title}`;
      } else if (variable.id === "NPA") {
        if (npaAverage !== null) {
          grade = npaAverage;
          subDesc = `Promedio continuo de tareas de aula virtual (${gradedTasks.length} calificada${gradedTasks.length > 1 ? "s" : ""})`;
        } else if (simCourse && !simCourse.isManual && typeof simCourse.grade === "number") {
          grade = simCourse.grade;
          subDesc = "Acta Oficial de Calificaciones Consolidada (MGE)";
        } else {
          subDesc = "Promedio acumulado de tareas de aula virtual";
        }
      } else if (variable.id === "TEO") {
        const pc1 = courseAssignments.find((a) => !a.title.startsWith("[Planilla] ") && /\[PC1\]|PC1/i.test(a.title))?.submissions.find((s) => s.studentDni === studentDni)?.grade;
        const pc2 = courseAssignments.find((a) => !a.title.startsWith("[Planilla] ") && /\[PC2\]|PC2/i.test(a.title))?.submissions.find((s) => s.studentDni === studentDni)?.grade;
        const npa = npaAverage !== null ? npaAverage : (typeof pc1 === "number" ? pc1 : null);
        const valid = [npa, pc1, pc2].filter((v): v is number => typeof v === "number");
        if (valid.length > 0) {
          grade = Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1));
          subDesc = `NPA: ${npa ?? "NR"} • PC1: ${pc1 ?? "NR"} • PC2: ${pc2 ?? "NR"} (Evaluación Continua)`;
        } else if (simCourse && !simCourse.isManual && typeof simCourse.grade === "number") {
          grade = simCourse.grade;
          subDesc = "Acta Oficial de Calificaciones Consolidada (MGE)";
        }
      } else if (variable.id === "TAL") {
        const talAsgs = assignments.filter((a) => !a.title.startsWith("[Planilla] ") && !/EX_FINAL|EXAMEN FINAL/i.test(a.title) && (a.courseId === "6afe1412016eccb3be7af0eb" || a.courseId?.toLowerCase().includes("tal")));
        const talGrades = talAsgs.map((a) => {
          const s = a.submissions?.find((item) => item.studentDni === studentDni && item.grade !== undefined);
          return s ? { title: a.title, grade: Number(s.grade) } : null;
        }).filter(Boolean) as Array<{ title: string; grade: number }>;
        if (talGrades.length > 0) {
          const sum = talGrades.reduce((a, b) => a + b.grade, 0);
          grade = Number((sum / talGrades.length).toFixed(1));
          subDesc = talGrades.map((g) => {
            const shortName = g.title.replace(/\[Semana\s*\d+\]\s*/i, "").replace(/\[.*?\]\s*/i, "").trim().split(" ")[0];
            return `${shortName}: ${g.grade}`;
          }).join(" • ");
        } else if (simCourse && !simCourse.isManual && typeof simCourse.grade === "number") {
          grade = simCourse.grade;
          subDesc = "Acta Oficial de Calificaciones Consolidada (MGE)";
        }
      } else if (variable.id === "LAB") {
        const labAsgs = assignments.filter((a) => !a.title.startsWith("[Planilla] ") && !/EX_FINAL|EXAMEN FINAL/i.test(a.title) && (a.courseId === "6afe141f016eccb3be7af0ec" || a.courseId?.toLowerCase().includes("lab")));
        const labGrades = labAsgs.map((a) => {
          const s = a.submissions?.find((item) => item.studentDni === studentDni && item.grade !== undefined);
          return s ? { title: a.title, grade: Number(s.grade) } : null;
        }).filter(Boolean) as Array<{ title: string; grade: number }>;
        if (labGrades.length > 0) {
          const sum = labGrades.reduce((a, b) => a + b.grade, 0);
          grade = Number((sum / labGrades.length).toFixed(1));
          subDesc = labGrades.map((g) => {
            const shortName = g.title.replace(/\[Semana\s*\d+\]\s*/i, "").replace(/\[.*?\]\s*/i, "").trim().split(" ")[0];
            return `${shortName}: ${g.grade}`;
          }).join(" • ");
        } else if (simCourse && !simCourse.isManual && typeof simCourse.grade === "number") {
          grade = simCourse.grade;
          subDesc = "Acta Oficial de Calificaciones Consolidada (MGE)";
        }
      } else if (simCourse && !simCourse.isManual && typeof simCourse.grade === "number") {
        grade = simCourse.grade;
        subDesc = "Acta Oficial de Calificaciones Consolidada (MGE)";
      }

      return {
        id: variable.id,
        name: variable.label,
        sub: subDesc,
        prefix: variable.id,
        weight: `${(variable.weight * 100).toFixed(0)}%`,
        weightDecimal: variable.weight,
        grade,
        isCurricular: true
      };
    });

    const evaluationsList = [...formulaEvaluations, ...weeklyTasks];

    const idSet = new Set<string>();
    [c.id, c.code, c.id?.replace(/^cur-/, '')].filter(Boolean).forEach((id: string) => idSet.add(id));
    if (Array.isArray(c.attendanceCourseIds)) {
      c.attendanceCourseIds.forEach((id: string) => idSet.add(id));
    }
    relatedDbCourses.forEach((rc: any) => {
      if (rc.id) idSet.add(rc.id);
      if (rc._id) idSet.add(rc._id);
      if (rc.code) idSet.add(rc.code);
    });
    const finalAttendanceCourseIds = Array.from(idSet);

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      cycle: c.cycle || (c.code?.includes("-20") ? "Ciclo II" : "Ciclo I"),
      classroom: c.classroom || "Aula Virtual",
      credits: c.credits,
      schedule: c.schedule,
      teacherName: c.teacherName,
      group: c.group || studentGroup?.name || "Grupo A",
      curriculum: c.curriculum || "Diseño Curricular Modular (Vigente)",
      studentCount: c.studentCount || 30,
      iconType,
      description,
      formula,
      formulaObj: courseFormula,
      weeklyTasks,
      npaAverage,
      attendanceCourseIds: finalAttendanceCourseIds,
      evaluations: evaluationsList
    };
  }, [assignments, courses, currentProgram, studentDni, studentGroup]);

  const enrichedCourses = useMemo(() => {
    return studentCourses.map(enrichSingleCourse);
  }, [studentCourses, enrichSingleCourse]);

  const allAvailableCourses = useMemo(() => {
    const list = [...(ciclo1Courses.length > 0 ? ciclo1Courses : baseStudentCourses), ...ciclo2Courses];
    const map = new Map<string, any>();
    list.forEach((item) => {
      if (!map.has(item.code)) {
        map.set(item.code, item);
      }
    });
    return Array.from(map.values());
  }, [ciclo1Courses, baseStudentCourses, ciclo2Courses]);

  const allEnrichedCourses = useMemo(() => {
    return allAvailableCourses.map(enrichSingleCourse);
  }, [allAvailableCourses, enrichSingleCourse]);

  const activeCourseObj = useMemo(() => {
    if (!selectedCourseDetail) return null;
    return enrichedCourses.find(c => c.name === selectedCourseDetail || c.code === selectedCourseDetail) || null;
  }, [enrichedCourses, selectedCourseDetail]);

  const activeCourseSubComponents = useMemo(() => {
    if (!activeCourseObj) return [];
    if (activeCourseObj.code === "EIND-101" || activeCourseObj.code?.startsWith("EIND-101")) {
      return [
        {
          id: "teo",
          code: "EIND-101-TEO",
          name: "Fundamentos de Electricidad y Circuitos CC (Teoría)",
          shortLabel: "Teoría",
          badge: "Teoría"
        },
        {
          id: "tal",
          code: "EIND-101-TAL",
          name: "Fundamentos de Electricidad y Circuitos CC (Taller)",
          shortLabel: "Taller",
          badge: "Taller"
        },
        {
          id: "lab",
          code: "EIND-101-LAB",
          name: "Fundamentos de Electricidad y Circuitos CC (Laboratorio)",
          shortLabel: "Laboratorio",
          badge: "Laboratorio"
        }
      ];
    }
    return [];
  }, [activeCourseObj]);

  const activeSelectedComponent = activeCourseSubComponents.find(c => c.id === activeCourseComponentId) || (activeCourseSubComponents.length > 0 ? activeCourseSubComponents[0] : null);

  const showCourseSidebar = activeTab === "classes" && !!selectedCourseDetail && (activeCourseSubComponents.length === 0 || !!activeCourseComponentId);

  return (
    <div id="alumno-portal" className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-slate-800">
      {/* 1. SIDEBAR PRINCIPAL (INTRANET) */}
      <Sidebar
        institution={{
          name: "IESTP SFA",
          subtitle: "Intranet Académica"
        }}
        user={{
          name: `${personalData.name} ${personalData.lastName}`,
          role: currentProgram?.name || "Estudiante",
          status: enrollment.academicStatus,
        }}
        sections={[
          {
            title: "MENÚ PRINCIPAL",
            items: [
              {
                label: "Institucional",
                icon: <Building className="w-4 h-4" />,
                route: "welcome",
                active: activeTab === "welcome"
              },
              {
                label: "Información Personal",
                icon: <User className="w-4 h-4" />,
                route: "profile",
                active: activeTab === "profile"
              }
            ]
          },
          {
            title: "ACADÉMICO",
            items: [
              {
                label: "Consulta Académica",
                icon: <ClipboardList className="w-4 h-4" />,
                route: "closure",
                active: activeTab === "closure"
              },
              {
                label: "Matrícula de Cursos",
                icon: <BookOpen className="w-4 h-4" />,
                route: "enrollment",
                active: activeTab === "enrollment"
              },
              {
                label: "Mis Cursos",
                icon: <BookOpen className="w-4 h-4" />,
                route: "classes",
                active: activeTab === "classes"
              },
              {
                label: "Mi Horario",
                icon: <Calendar className="w-4 h-4" />,
                route: "schedule",
                active: activeTab === "schedule"
              },
              {
                label: "Mis Calificaciones",
                icon: <Award className="w-4 h-4" />,
                route: "notas",
                active: activeTab === "notas"
              },
              {
                label: "Control de Asistencia",
                icon: <Clock className="w-4 h-4" />,
                route: "attendance",
                active: activeTab === "attendance"
              },
              {
                label: "Calendario Académico",
                icon: <Calendar className="w-4 h-4" />,
                route: "calendar",
                active: activeTab === "calendar"
              }
            ]
          },
          {
            title: "SERVICIOS",
            items: [
              {
                label: "Información Económica",
                icon: <CreditCard className="w-4 h-4" />,
                route: "economic_info",
                active: activeTab === "economic_info"
              },
              {
                label: "Práctica Preprofesional",
                icon: <Briefcase className="w-4 h-4" />,
                route: "practicas",
                active: activeTab === "practicas"
              },
              {
                label: "Trámites de Secretaría",
                icon: <FileText className="w-4 h-4" />,
                route: "secretaria",
                active: activeTab === "secretaria"
              },
              {
                label: "Guías y Reglamentos",
                icon: <HelpCircle className="w-4 h-4" />,
                route: "guias",
                active: activeTab === "guias"
              }
            ]
          }
        ]}
        isCollapsed={isMainSidebarCollapsed}
        onToggleCollapse={setIsMainSidebarCollapsed}
        onItemClick={(route) => {
          if (route === "classes") {
            setSelectedCourseDetail("");
            setActiveCourseComponentId(null);
            try {
              sessionStorage.removeItem("sfa_alumno_course_detail");
              sessionStorage.removeItem("sfa_alumno_course_comp_id");
            } catch { }
            setActiveCourseSection("general");
          }
          setActiveTab(route as typeof activeTab);
        }}
        onLogout={onLogout}
        onGoToPortal={onGoToPortal}
      />

      {/* 2. SIDEBAR SECUNDARIO CURRICULAR DINÁMICO (SEMANAS) */}
      {showCourseSidebar && (
        <div className="hidden md:flex shrink-0 relative z-20 h-full">
          {/* Animated sliding panel */}
          <div
            className={`transition-all duration-300 ease-in-out h-full overflow-hidden ${
              isCourseSidebarCollapsed ? "w-0 min-w-0" : "w-64 min-w-[16rem]"
            }`}
          >
            <div className="w-64 h-full">
              <SidebarCursoAlumno
                courseCode={activeSelectedComponent ? activeSelectedComponent.code : (activeCourseObj?.code || selectedCourseDetail)}
                courseName={activeSelectedComponent ? activeSelectedComponent.name : (activeCourseObj?.name || selectedCourseDetail)}
                componentBadge={activeSelectedComponent ? {
                  label: activeSelectedComponent.badge,
                  className: activeSelectedComponent.id === "teo"
                    ? "text-[#800521] bg-[#800521]/10 border-[#800521]/20"
                    : activeSelectedComponent.id === "tal"
                      ? "text-amber-800 bg-amber-50 border-amber-200"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                } : null}
                hasMultipleComponents={activeCourseSubComponents.length > 1}
                onChangeComponent={() => {
                  setActiveCourseComponentId(null);
                  try {
                    sessionStorage.removeItem("sfa_alumno_course_comp_id");
                  } catch { }
                  setActiveCourseSection("general");
                }}
                activeSection={activeCourseSection}
                selectedWeek={selectedClassWeek}
                selectedWeekOption={selectedClassWeekOption}
                onSelectGeneral={() => setActiveCourseSection("general")}
                onSelectHorarios={() => setActiveCourseSection("horarios")}
                onSelectCierre={() => setActiveCourseSection("cierre")}
                onSelectWeekOption={(weekNum, option) => {
                  setActiveCourseSection("week");
                  setSelectedClassWeek(weekNum);
                  setSelectedClassWeekOption(option);
                }}
                onBackToCourses={() => {
                  setSelectedCourseDetail("");
                  setActiveCourseComponentId(null);
                  try {
                    sessionStorage.removeItem("sfa_alumno_course_detail");
                    sessionStorage.removeItem("sfa_alumno_course_comp_id");
                  } catch { }
                  setActiveCourseSection("general");
                }}
              />
            </div>
          </div>

          {/* Desplegable / botón de SEMANAS DEL CURSO (Círculo Granate Institucional con Libro Dorado) */}
          <button
            type="button"
            onClick={() => setIsCourseSidebarCollapsed(!isCourseSidebarCollapsed)}
            title={isCourseSidebarCollapsed ? "Ver Semanas del Curso (1 a 16)" : "Ocultar Semanas del Curso"}
            className={`absolute top-[48%] -translate-y-1/2 z-40 transition-all cursor-pointer group ${
              isCourseSidebarCollapsed
                ? "left-0 bg-[#800521] hover:bg-[#68031a] text-amber-300 hover:text-white rounded-r-xl py-2 px-1.5 shadow-lg border-y border-r border-white/20 flex items-center gap-1 hover:pl-2"
                : "-right-[14px] bg-[#800521] hover:bg-[#68031a] text-white border-2 border-white ring-2 ring-[#800521]/25 w-[28px] h-[28px] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
            }`}
          >
            {isCourseSidebarCollapsed ? (
              <>
                <BookOpen className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                <ChevronRight className="w-3 h-3 text-white/90" />
              </>
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-white group-hover:-translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      )}

      {/* 3. PRIMARY CONTENT AREA WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 custom-scrollbar bg-[#F8F9FA] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedCourseDetail ? `-${selectedCourseDetail}-${activeCourseComponentId || "comp"}` : "")}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-7xl mx-auto"
            >
              {activeTab === "welcome" && (
                <WelcomeTab
                  personalData={personalData}
                  currentProgram={currentProgram}
                  enrollment={enrollment}
                  setActiveTab={setActiveTab}
                  setProfileInnerTab={setProfileInnerTab}
                  studentTasks={studentTasks}
                  mpaPlanningData={mpaPlanningData}
                  studentGroup={studentGroup}
                  studentCourses={studentCourses}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab
                  personalData={personalData}
                  enrollment={enrollment}
                  currentProgram={currentProgram}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  profileSavedMsg={profileSavedMsg}
                  handleSaveProfile={handleSaveProfile}
                  profileInnerTab={profileInnerTab}
                  setProfileInnerTab={setProfileInnerTab}
                  simulateDocUpload={simulateDocUpload}
                  isPaidInvoice={isPaidInvoice}
                  paymentOp={paymentOp}
                  setPaymentOp={setPaymentOp}
                  paySuccessMsg={paySuccessMsg}
                  handlePayInvoice={handlePayInvoice}
                  onUpdateEnrollment={onUpdateEnrollment}
                  graduation={graduation}
                  enrichedCourses={enrichedCourses}
                />
              )}

              {activeTab === "classes" && (
                <ClassesTab
                  attendance={attendance}
                  attendanceLoading={attendanceLoading}
                  attendanceError={attendanceError}
                  enrichedCourses={allEnrichedCourses}
                  currentProgram={currentProgram}
                  selectedCourseDetail={selectedCourseDetail}
                  setSelectedCourseDetail={setSelectedCourseDetail}
                  activeCourseComponentId={activeCourseComponentId}
                  setActiveCourseComponentId={setActiveCourseComponentId}
                  activeCourseSection={activeCourseSection}
                  setActiveCourseSection={setActiveCourseSection}
                  selectedClassWeek={selectedClassWeek}
                  setSelectedClassWeek={setSelectedClassWeek}
                  selectedClassWeekOption={selectedClassWeekOption}
                  setSelectedClassWeekOption={setSelectedClassWeekOption}
                  simulationHWFiles={simulationHWFiles}
                  setSimulationHWFiles={setSimulationHWFiles}
                  expandedStudentWeeks={expandedStudentWeeks}
                  setExpandedStudentWeeks={setExpandedStudentWeeks}
                  materials={materials}
                  assignments={assignments}
                  evaluations={evaluations}
                  studentDni={studentDni}
                  personalData={personalData}
                  onUpdateAssignments={onUpdateAssignments}
                />
              )}

              {activeTab === "enrollment" && (
                <CourseEnrollmentTab
                  enrollment={enrollment}
                  studentGroup={studentGroup}
                  data={mpaPlanningData}
                  onSaved={onUpdateEnrollment}
                  personalData={personalData}
                  currentProgram={currentProgram}
                />
              )}

              {activeTab === "schedule" && (
                <ScheduleTab
                  personalData={personalData}
                  currentProgram={currentProgram}
                  studentTasks={studentTasks}
                  mpaPlanningData={mpaPlanningData}
                  studentGroup={studentGroup}
                />
              )}

              {activeTab === "attendance" && (
                <AttendanceTab
                  loading={attendanceLoading}
                  error={attendanceError}
                  onReload={onReloadAttendance}
                  enrollment={enrollment}
                  studentDni={studentDni}
                  attendance={attendance}
                  selectedAttendanceSemester={selectedAttendanceSemester}
                  setSelectedAttendanceSemester={setSelectedAttendanceSemester}
                  expandedAttendanceCourse={expandedAttendanceCourse}
                  setExpandedAttendanceCourse={setExpandedAttendanceCourse}
                  setActiveTab={setActiveTab}
                  studentCourses={enrichedCourses}
                  studentTasks={studentTasks}
                  mpaPlanningData={mpaPlanningData}
                  studentGroup={studentGroup}
                />
              )}

              {activeTab === "closure" && (
                <ClosureTab
                  personalData={personalData}
                  enrollment={enrollment}
                  currentProgram={currentProgram}
                  courses={courses}
                  enrichedCourses={allEnrichedCourses}
                  assignments={assignments}
                  selectedAcademicOption={selectedAcademicOption}
                  setSelectedAcademicOption={setSelectedAcademicOption}
                  selectedSemesterFilter={selectedSemesterFilter}
                  setSelectedSemesterFilter={setSelectedSemesterFilter}
                  selectedPlan={selectedPlan}
                  setSelectedPlan={setSelectedPlan}
                  selectedQueryPeriod={selectedQueryPeriod}
                  setSelectedQueryPeriod={setSelectedQueryPeriod}
                  selectedQueryCycle={selectedQueryCycle}
                  setSelectedQueryCycle={setSelectedQueryCycle}
                  simulatedGrades={simulatedGrades}
                  setSimulatedGrades={setSimulatedGrades}
                  advisorConsultText={advisorConsultText}
                  setAdvisorConsultText={setAdvisorConsultText}
                  advisorConsultSuccess={advisorConsultSuccess}
                  setAdvisorConsultSuccess={setAdvisorConsultSuccess}
                  cycleStatuses={cycleStatuses}
                />
              )}

              {activeTab === "notas" && (
                <GradesTab
                  enrichedCourses={allEnrichedCourses}
                  selectedCourseDetail={selectedCourseDetail}
                  setSelectedCourseDetail={setSelectedCourseDetail}
                  studentInfo={{
                    dni: studentDni,
                    name: personalData ? `${personalData.name} ${personalData.lastName}` : "Mateo Sebastián Quispe Rojas",
                    career: currentProgram?.name || "Electricidad Industrial"
                  }}
                />
              )}

              {activeTab === "economic_info" && (
                <EconomicInfoTab
                  studentDni={studentDni}
                  personalData={personalData}
                  enrollment={enrollment}
                  onNavigateToEnrollment={() => setActiveTab("enrollment")}
                />
              )}

              {activeTab === "practicas" && (
                <PracticasPreprofesionalesTab
                  studentDni={studentDni}
                  personalData={personalData}
                  enrollment={enrollment}
                />
              )}

              {activeTab === "secretaria" && <ProceduresTab studentDni={studentDni} period="" />}
              {activeTab === "guias" && <GuidesLibrary audience="student" />}
              {activeTab === "calendar" && <AcademicCalendarBoard preferredPeriodId={studentGroup?.periodId} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {toastNotice && (
        <Toast notice={toastNotice} onClose={() => setToastNotice(null)} />
      )}
    </div>
  );
}
