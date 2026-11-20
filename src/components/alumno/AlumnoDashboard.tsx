import React, { useState, useEffect, useMemo } from "react";
import { 
  User, FileText, Calendar, BookOpen, Clock, Award, HelpCircle, Building, ClipboardList
} from "lucide-react";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CycleStatus, AttendanceRecord, Graduation, CourseEvaluation } from "../../types";
import { useAcademicCatalog } from "../../context/AcademicCatalogContext";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "../ui/Sidebar";
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
import GuidesLibrary from "../shared/GuidesLibrary";
import AcademicCalendarBoard from "../shared/AcademicCalendarBoard";
import { fetchMpaCollections } from "../../services/mpaApi";

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
  const [activeTab, setActiveTab] = useState<"welcome" | "profile" | "classes" | "schedule" | "attendance" | "closure" | "notas" | "secretaria" | "guias" | "calendar" | "enrollment">("welcome");
  
  // Profile edit form fields
  const [profileForm, setProfileForm] = useState<StudentPersonalData>({ ...personalData });
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  
  // Outstanding billing simulation state (el alumno matriculado tiene su matrícula pagada y sin deuda)
  const isEnrolledAndPaid = enrollment.academicStatus === "MATRICULADO" || (enrollment.paymentStatus as string) === "Validado" || (enrollment.paymentStatus as string) === "Pagado" || (enrollment.paymentStatus as string) === "PAGADO";
  const [isPaidInvoice, setIsPaidInvoice] = useState(isEnrolledAndPaid);
  const [paymentOp, setPaymentOp] = useState(enrollment.paymentOperation || (isEnrolledAndPaid ? `OP-MATR-2027-${personalData.dni ? personalData.dni.slice(-4) : "0001"}` : ""));
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  useEffect(() => {
    if (enrollment.academicStatus === "MATRICULADO" || (enrollment.paymentStatus as string) === "Validado" || (enrollment.paymentStatus as string) === "Pagado" || (enrollment.paymentStatus as string) === "PAGADO") {
      setIsPaidInvoice(true);
    }
  }, [enrollment]);

  // Sub-tab selection inside Profile View (Carga de Documentos / Historial de Pagos / Datos Académicos)
  const [profileInnerTab, setProfileInnerTab] = useState<"docs" | "payments" | "academic">("docs");

  // State members for interactive Consulta Académica multi-sidebar view
  const [selectedQueryCycle, setSelectedQueryCycle] = useState<"I" | "II" | "III" | "IV" | "V" | "VI">("I");
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});
  
  // Custom states for Image 1 and Image 2 High Fidelity replication
  const [expandedAttendanceCourse, setExpandedAttendanceCourse] = useState<string | null>("redes");
  const [selectedAcademicOption, setSelectedAcademicOption] = useState<string>("plan_curricular");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>("01");
  const [selectedPlan, setSelectedPlan] = useState<string>("52");
  const [selectedQueryPeriod, setSelectedQueryPeriod] = useState<string>("2027-I");
  const [selectedAttendanceSemester, setSelectedAttendanceSemester] = useState<string>("2027-I");
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<string>("");

  // Aula Virtual substates
  const [activeCourseSection, setActiveCourseSection] = useState<"general" | "horarios" | "week" | "cierre">("general");
  const [selectedClassWeek, setSelectedClassWeek] = useState<number>(1);
  const [selectedClassWeekOption, setSelectedClassWeekOption] = useState<"asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias">("materiales");
  const [simulationHWFiles, setSimulationHWFiles] = useState<Record<string, string>>({});
  const [expandedStudentWeeks, setExpandedStudentWeeks] = useState<Record<number, boolean>>({ 1: true });

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
    } catch (e) {}
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
      setMpaPlanningData({ tasks: data.tasks, courses: data.courses, schedules: data.schedules,
        groups: data.groups, teachers: data.teachers, classrooms: data.classrooms,
        periods: data.periods, shifts: data.shifts,
        curriculum: data.curriculum, curriculumVersions: data.curriculum_versions });
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

  // Map student shift and career to find their registered group in MPA
  const studentGroup = useMemo(() => {
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
  }, [enrollment, mpaPlanningData]);

  // The main group supplies regular courses; individual course assignments may use another shift.
  const studentTasks = useMemo(() => {
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
  }, [studentGroup, mpaPlanningData, enrollment.courseGroupAssignments, enrollment.registeredCourses, DEFAULT_ELECTRICIDAD_TASKS]);

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
        "EIND-101": { name: "Fundamentos de Electricidad y Circuitos CC", code: "EIND-101", credits: 4 },
        "EIND-102": { name: "Instalaciones Eléctricas de Edificaciones", code: "EIND-102", credits: 4 },
        "EIND-103": { name: "Seguridad e Higiene Industrial en Baja Tensión", code: "EIND-103", credits: 3 },
        "EIND-104": { name: "Matemática Aplicada a la Tecnología Eléctrica", code: "EIND-104", credits: 3 },
        "EIND-105": { name: "Comunicación y Tecnologías Digitales", code: "EIND-105", credits: 2 }
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
        cycle: "Ciclo I",
        startDate: mpaPlanningData.periods?.find((p: any) => p.id === studentGroup?.periodId)?.startDate || "2027-03-22",
        endDate: mpaPlanningData.periods?.find((p: any) => p.id === studentGroup?.periodId)?.endDate || "2027-07-30",
        studentCount: studentGroup?.capacity || 30,
        description: `Unidad didáctica curricular matriculada. Plan de estudios de la carrera técnica de ${enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}.`,
        formula: "NF = (EP1 * 0.20) + (TR1 * 0.15) + (EC1 * 0.15) + (PF1 * 0.50)",
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
        formula: "NF = (EP1 * 0.20) + (TR1 * 0.15) + (EC1 * 0.15) + (PF1 * 0.50)"
      }));
  }, [catalogCourses, enrollment.programId, enrollment.shift, studentGroup, mpaPlanningData.periods]);

  const studentCourses = enrollment.registeredCourses ? dynamicMpaCourses : dynamicMpaCourses.length > 0
    ? dynamicMpaCourses 
    : (ciclo1Courses.length > 0 ? ciclo1Courses : courses.filter((c: any) => c.careerId === enrollment.programId || c.career === currentProgram?.name));

  const enrichedCourses = studentCourses.map((c) => {
    let iconType = "BarChart3";
    if (c.code.includes("101") || c.name.toLowerCase().includes("automatización") || c.name.toLowerCase().includes("control")) {
      iconType = "Cpu";
    } else if (c.code.includes("403") || c.name.toLowerCase().includes("circuitos") || c.name.toLowerCase().includes("instalaciones")) {
      iconType = "Zap";
    } else if (c.code.includes("502") || c.name.toLowerCase().includes("maquinaria") || c.name.toLowerCase().includes("potencia") || c.name.toLowerCase().includes("motores")) {
      iconType = "Sliders";
    }

    let description = c.description || `Unidad didáctica del plan curricular para la carrera de ${currentProgram?.name || "Electricidad Industrial"}. Enfocada en desarrollar competencias profesionales esenciales del sector tecnológico nacional.`;

    const formula = "Calificaciones registradas por evaluación";
    const relatedDbCourses = courses.filter((course) =>
      course.code === c.code ||
      course.code?.startsWith(`${c.code}-`) ||
      course.id === c.id ||
      (course as any)._id === c.id
    );
    const relatedCourse = relatedDbCourses[0];
    const evaluationsList = assignments.filter((assignment) => {
      const matchIds = new Set<string>([c.id, c.code]);
      relatedDbCourses.forEach((rc: any) => {
        if (rc.id) matchIds.add(rc.id);
        if (rc._id) matchIds.add(rc._id);
        if (rc.code) matchIds.add(rc.code);
      });
      return matchIds.has(assignment.courseId);
    }).map((assignment, index) => {
      const submission = assignment.submissions.find((item) => item.studentDni === studentDni);
      return { name: assignment.title, sub: assignment.description, prefix: `EV${index + 1}`,
        weight: "Sin ponderación", grade: submission?.grade === undefined ? "NR" : submission.grade };
    });

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
      cycle: c.cycle || "Ciclo I",
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
      attendanceCourseIds: finalAttendanceCourseIds,
      evaluations: evaluationsList
    };
  });

  return (
    <div id="alumno-portal" className="h-screen w-full overflow-hidden bg-[#F8F9FA] text-[#2D3748] flex flex-col md:flex-row font-sans antialiased">
      {/* LEFT SIDEBAR */}
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
        onItemClick={(route) => setActiveTab(route as typeof activeTab)}
        onLogout={onLogout}
        onGoToPortal={onGoToPortal}
      />

      {/* MAIN VIEWPORT SCROLL AREA */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 custom-scrollbar bg-[#F8F9FA]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
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
                enrichedCourses={enrichedCourses}
                currentProgram={currentProgram}
                selectedCourseDetail={selectedCourseDetail}
                setSelectedCourseDetail={setSelectedCourseDetail}
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
                enrichedCourses={enrichedCourses}
                selectedCourseDetail={selectedCourseDetail}
                setSelectedCourseDetail={setSelectedCourseDetail}
              />
            )}

            {activeTab === "secretaria" && <ProceduresTab studentDni={studentDni} period="" />}
            {activeTab === "guias" && <GuidesLibrary audience="student" />}
            {activeTab === "calendar" && <AcademicCalendarBoard preferredPeriodId={studentGroup?.periodId} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {toastNotice && (
        <Toast notice={toastNotice} onClose={() => setToastNotice(null)} />
      )}
    </div>
  );
}
