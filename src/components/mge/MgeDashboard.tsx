import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Users, FileText, CreditCard, Award, GraduationCap, CheckSquare,
  TrendingUp, BookOpen, BrainCircuit, Calendar, CheckCircle2, Coins, Loader2
} from "lucide-react";
import {
  Applicant,
  Enrollment,
  StudentPersonalData,
  Course,
  CourseAssignment,
  AttendanceRecord,
  Graduation,
  AdmissionPeriod,
  ProgramId
} from "../../types";
import Sidebar from "../ui/Sidebar";
import Toast, { ToastKind, ToastNotice } from "../ui/Toast";
import { createGraduation, updateGraduation } from "../../services/api";

// Modular tabs
import MgeEstudiantesTab from "./tabs/MgeEstudiantesTab";
import MgeMatriculaTab from "./tabs/MgeMatriculaTab";
import MgePagosTab from "./tabs/MgePagosTab";
import MgeNotasTab from "./tabs/MgeNotasTab";
import MgeAsistenciasTab from "./tabs/MgeAsistenciasTab";
import MgeHistorialTab from "./tabs/MgeHistorialTab";
import MgeConstanciasTab from "./tabs/MgeConstanciasTab";
import MgeReportesTab from "./tabs/MgeReportesTab";
import MgeRiesgoIaTab from "./tabs/MgeRiesgoIaTab";

// Modular modals
import MgeAddStudentModal from "./modals/MgeAddStudentModal";
import MgeEditStudentModal from "./modals/MgeEditStudentModal";

// Types
import { MgeSubTab, StudentFormState, defaultStudentForm } from "./mgeTypes";
import { useMgeNavigation } from "../../hooks/mge/useMgeNavigation";
import GraduationAccessPanel from "./GraduationAccessPanel";

interface MgeDashboardProps {
  onReloadGraduations: () => Promise<boolean>;
  graduationsLoading: boolean;
  graduationsError: string | null;
  sourceLoading: boolean;
  sourceError: string | null;
  assignmentsLoading: boolean;
  assignmentsError: string | null;
  onSetStudentActive: (dni: string, active: boolean, reason?: string) => Promise<boolean>;
  applicants: Applicant[];
  enrollments: Enrollment[];
  studentsList: { [dni: string]: StudentPersonalData };
  courses: Course[];
  assignments: CourseAssignment[];
  attendance: AttendanceRecord[];
  attendanceLoading: boolean;
  attendanceError: string | null;
  onReloadAttendance: () => Promise<boolean>;
  graduations: Graduation[];
  admissionPeriods?: AdmissionPeriod[];
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateStudentsList: (students: { [dni: string]: StudentPersonalData }) => Promise<boolean>;
  onCreateEnrollment: (data: Enrollment) => Promise<Enrollment | null>;
  onSaveEnrollment: (dni: string, data: Partial<Enrollment>) => Promise<Enrollment | null>;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => Promise<boolean>;
  onUpdateAttendance: (att: AttendanceRecord[]) => Promise<boolean>;
  onUpdateGraduations: (grads: Graduation[]) => void;
  selectedPeriodId?: string;
  onSelectPeriodId?: (periodId: string) => void;
  onLogout?: () => void;
  onGoToPortal?: () => void;
}

export default function MgeDashboard({
  onReloadGraduations,
  graduationsLoading, graduationsError,
  sourceLoading, sourceError, assignmentsLoading, assignmentsError,
  onSetStudentActive,
  applicants,
  enrollments,
  studentsList,
  courses,
  assignments,
  attendance,
  graduations,
  admissionPeriods = [],
  onUpdateEnrollments,
  onUpdateStudentsList,
  onCreateEnrollment,
  onSaveEnrollment,
  onUpdateCourses,
  onUpdateAssignments,
  onUpdateAttendance,
  attendanceLoading,
  attendanceError,
  onReloadAttendance,
  onUpdateGraduations,
  selectedPeriodId,
  onSelectPeriodId,
  onLogout,
  onGoToPortal,
}: MgeDashboardProps) {
  // Navigation
  const { activeSubTab, setActiveSubTab } = useMgeNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const noticeSequence = useRef(0);
  const closeNotice = useCallback(() => setNotice(null), []);
  const triggerNotification = (message: string, kind: ToastKind = "success") => {
    setNotice({ id: ++noticeSequence.current, message, kind });
  };
  const [saving, setSaving] = useState(false);
  const saveInProgress = useRef(false);
  const runSave = async (action: () => Promise<void>) => {
    if (saveInProgress.current) return;
    saveInProgress.current = true;
    setSaving(true);
    try { await action(); }
    catch { triggerNotification("No se pudo completar el guardado. Intente nuevamente.", "error"); }
    finally { saveInProgress.current = false; setSaving(false); }
  };

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentDni, setEditingStudentDni] = useState<string | null>(null);
  const [statusDni, setStatusDni] = useState<string | null>(null);
  const [statusReason, setStatusReason] = useState("");

  // Shared form state for both modals
  const [studentForm, setStudentForm] = useState<StudentFormState>(defaultStudentForm);

  // Tab-local state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>("PROMEDIO_CONSOLIDADO");
  const [temporaryGrades, setTemporaryGrades] = useState<{ [dni: string]: number }>({});
  const [selectedAttendanceCourseId, setSelectedAttendanceCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())
  );
  const [selectedHistoryDni, setSelectedHistoryDni] = useState<string>("");
  useEffect(() => {
    if (!courses.some((course) => course.id === selectedCourseId)) setSelectedCourseId(courses[0]?.id || "");
    if (!courses.some((course) => course.id === selectedAttendanceCourseId)) setSelectedAttendanceCourseId(courses[0]?.id || "");
  }, [courses, selectedCourseId, selectedAttendanceCourseId]);

  // ── Gestión y Formateo Breve de Periodos Institucionales ───────────────────
  const effectiveAdmissionPeriods = useMemo(() => {
    const list = [...admissionPeriods];
    if (!list.some(p => p.id === "period-2027-2" || p.name?.includes("2027-II") || p.name?.includes("2027-2"))) {
      list.push({
        id: "period-2027-2",
        name: "Semestre Académico 2027-II",
        year: 2027,
        status: "MATRICULA",
        isActive: true,
        startDate: "2027-08-16",
        endDate: "2027-12-17"
      } as any);
    }
    return list;
  }, [admissionPeriods]);

  const [internalPeriodId, setInternalPeriodId] = useState<string>(() => {
    if (selectedPeriodId) return selectedPeriodId;
    const active = effectiveAdmissionPeriods.find((p) => p.status === "APERTURADO" || p.status === "MATRICULA" || p.isActive);
    return active ? active.id : (effectiveAdmissionPeriods[0]?.id || "all");
  });

  const handlePeriodChange = (id: string) => {
    setInternalPeriodId(id);
    if (onSelectPeriodId) onSelectPeriodId(id);
  };

  const currentPeriod = useMemo(() => {
    if (internalPeriodId === "all") return null;
    return effectiveAdmissionPeriods.find((p) => p.id === internalPeriodId) || null;
  }, [effectiveAdmissionPeriods, internalPeriodId]);

  const isPeriodActive = useMemo(() => {
    if (!currentPeriod) return true;
    return Boolean(currentPeriod.isActive || currentPeriod.status === "APERTURADO" || currentPeriod.status === "MATRICULA");
  }, [currentPeriod]);

  const compactPeriodName = (rawName?: string) => {
    if (!rawName) return "Periodo";
    const clean = rawName
      .replace(/\uFFFD/g, "é")
      .replace(/Acad[\uFFFD\?a-zA-Z]*mico/gi, "Académico")
      .replace(/Acadmico/gi, "Académico");
    const match = clean.match(/\b(20\d{2}-[I|V|X|1-2]+)\b/i);
    if (match) return match[1].toUpperCase();
    return clean
      .replace(/Admisi[oó]n\s+Ordinaria/gi, "")
      .replace(/Periodo\s+Acad[eé]mico/gi, "")
      .trim() || clean;
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const processedStudents = useMemo(() => {
    return Object.values(studentsList)
      .filter((student) => {
        if (!internalPeriodId || internalPeriodId === "all" || admissionPeriods.length === 0) return true;
        const applicant = applicants.find((a) => a.dni === student.dni);
        const enrollment = enrollments.find((e) => e.studentDni === student.dni);

        if (internalPeriodId === "period-2027-2" || internalPeriodId.includes("2027-2") || internalPeriodId.includes("2027-II")) {
          const isCycle2 = typeof window !== "undefined" && Boolean(
            localStorage.getItem(`sfa_student_promoted_cycle2_${student.dni}`) === "true" ||
            localStorage.getItem(`sfa_cycle2_payment_${student.dni}`) === "true" ||
            localStorage.getItem(`sfa_student_cycle_${student.dni}`) === "2" ||
            (student.dni === "74859612")
          );
          return isCycle2;
        }

        if (applicant?.periodId && applicant.periodId === internalPeriodId) return true;
        if ((enrollment as any)?.periodId && (enrollment as any).periodId === internalPeriodId) return true;
        if (!applicant?.periodId && !(enrollment as any)?.periodId) {
          const activeP = admissionPeriods.find((p) => p.isActive || p.status === "APERTURADO" || p.status === "MATRICULA") || admissionPeriods[0];
          return !activeP || activeP.id === internalPeriodId;
        }
        return false;
      })
      .map((student) => {
        const enrollment = enrollments.find((e) => e.studentDni === student.dni);
        return {
          ...student,
          enrolled: !!enrollment,
          academicStatus: student.active === false ? "BAJA" : enrollment?.academicStatus || "Sin matrícula",
          programId: enrollment?.programId || "",
          shift: enrollment?.shift || "",
          paymentStatus: enrollment?.paymentStatus || "Sin registro",
        };
      });
  }, [studentsList, enrollments, applicants, internalPeriodId, admissionPeriods]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return processedStudents;
    return processedStudents.filter(
      (s) =>
        s.dni.includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [processedStudents, searchQuery]);

  const activePeriodName = useMemo(() => {
    if (internalPeriodId === "all") return "Todos los Periodos";
    const found = admissionPeriods.find((p) => p.id === internalPeriodId) ||
                  admissionPeriods.find((p) => p.status === "APERTURADO" || (p as any).status === "ACTIVO" || (p as any).active) ||
                  admissionPeriods[0];
    return compactPeriodName(found?.name || "2026-I");
  }, [admissionPeriods, internalPeriodId]);

  // ── Handlers: Students ───────────────────────────────────────────────────
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { dni, name, lastName, birthDate, gender, email, phone, address, district, province, emergencyName, emergencyPhone, emergencyRelation, programId, shift } = studentForm;

    if (!dni || dni.length !== 8 || isNaN(Number(dni))) {
      triggerNotification("El DNI debe contener exactamente 8 números.", "warning");
      return;
    }
    if (!name || !lastName || !email || !programId || !shift) {
      triggerNotification("Complete nombre, apellido, correo, carrera y turno.", "warning");
      return;
    }

    if (studentsList[dni] || enrollments.some((en) => en.studentDni === dni)) {
      triggerNotification("El DNI ya está registrado. Use la opción de editar.", "warning");
      return;
    }
    const updatedStudents = { ...studentsList };
    updatedStudents[dni] = { dni, name, lastName, birthDate, gender, email, phone, address, district, province, emergencyName, emergencyPhone, emergencyRelation };
    if (!await onUpdateStudentsList(updatedStudents)) {
      triggerNotification("No se pudieron guardar los datos del estudiante. Intente nuevamente.", "error");
      return;
    }

    const newEnrollment: Enrollment = {
      studentDni: dni,
      programId,
      academicStatus: "ADMITIDO",
      docs: {
        dniFile: { status: "No Enviado" },
        certificadoFile: { status: "No Enviado" },
        partidaFile: { status: "No Enviado" },
        fotoFile: { status: "No Enviado" }
      },
      paymentStatus: "No Pagado",
      shift
    };

    if (!await onCreateEnrollment(newEnrollment)) {
      triggerNotification("Se guardó la ficha, pero no se pudo crear la matrícula. Puede completarla editando la ficha.", "error");
      setShowAddStudentModal(false);
      return;
    }
    setShowAddStudentModal(false);
    setStudentForm(defaultStudentForm);
    triggerNotification(`Estudiante ${name} ${lastName} registrado como admitido. Falta validar documentos y pago.`);
  };

  const handleEditClick = (dni: string) => {
    const student = studentsList[dni];
    const enrollment = enrollments.find((e) => e.studentDni === dni);
    if (!student) return;

    setEditingStudentDni(dni);
    setStudentForm({
      dni: student.dni,
      name: student.name,
      lastName: student.lastName,
      birthDate: student.birthDate || "",
      gender: student.gender || "",
      email: student.email,
      phone: student.phone || "",
      address: student.address || "",
      district: student.district || "",
      province: student.province || "",
      emergencyName: student.emergencyName || "",
      emergencyPhone: student.emergencyPhone || "",
      emergencyRelation: student.emergencyRelation || "",
      programId: enrollment?.programId || "",
      shift: enrollment?.shift || "",
    });
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentDni) return;
    if (!studentForm.programId || !studentForm.shift) {
      triggerNotification("Seleccione la carrera y el turno del estudiante.", "warning");
      return;
    }

    const updatedStudents = { ...studentsList };
    updatedStudents[editingStudentDni] = {
      dni: editingStudentDni,
      name: studentForm.name,
      lastName: studentForm.lastName,
      birthDate: studentForm.birthDate,
      gender: studentForm.gender,
      email: studentForm.email,
      phone: studentForm.phone,
      address: studentForm.address,
      district: studentForm.district,
      province: studentForm.province,
      emergencyName: studentForm.emergencyName,
      emergencyPhone: studentForm.emergencyPhone,
      emergencyRelation: studentForm.emergencyRelation,
    };
    if (!await onUpdateStudentsList(updatedStudents)) {
      triggerNotification("No se pudieron guardar los datos del estudiante. Intente nuevamente.", "error");
      return;
    }

    const enrollmentData = { programId: studentForm.programId, shift: studentForm.shift };
    const savedEnrollment = enrollments.some((en) => en.studentDni === editingStudentDni)
      ? await onSaveEnrollment(editingStudentDni, enrollmentData)
      : await onCreateEnrollment({ studentDni: editingStudentDni, ...enrollmentData,
          academicStatus: "ADMITIDO", paymentStatus: "No Pagado",
          docs: { dniFile: { status: "No Enviado" }, certificadoFile: { status: "No Enviado" },
            partidaFile: { status: "No Enviado" }, fotoFile: { status: "No Enviado" } } });
    if (!savedEnrollment) {
      triggerNotification("La ficha se guardó, pero la carrera y el turno no se pudieron guardar. Intente nuevamente.", "error");
      return;
    }

    setShowEditStudentModal(false);
    setEditingStudentDni(null);
    triggerNotification("Ficha y datos del estudiante actualizados con éxito.");
  };

  const handleDeleteStudent = (dni: string) => {
    setStatusDni(dni);
    setStatusReason("");
  };
  const saveStudentStatus = async () => {
    if (sourceLoading || sourceError) { triggerNotification("Recargue los datos del servidor antes de cambiar el estado.", "error"); return; }
    if (!statusDni) return;
    const active = studentsList[statusDni]?.active === false;
    if (!await onSetStudentActive(statusDni, active, statusReason)) {
      triggerNotification("No se pudo guardar el estado del estudiante. Intente nuevamente.", "error");
      return;
    }
    setStatusDni(null);
    triggerNotification(active ? "Estudiante reactivado. Se conserva su matrícula anterior." : "Baja registrada. Se conservan la matrícula y el historial académico.");
  };

  const persistEnrollment = async (dni: string, data: Partial<Enrollment>) => {
    if (!await onSaveEnrollment(dni, data)) {
      triggerNotification("No se pudo guardar el cambio en el servidor. Intente nuevamente.", "error");
      return false;
    }
    return true;
  };

  // ── Handlers: Matrícula ───────────────────────────────────────────────────
  const handleToggleAcademicStatus = async (dni: string) => {
    if (studentsList[dni]?.active === false) { triggerNotification("Reactive al estudiante desde el padrón antes de matricularlo.", "warning"); return; }
    const existing = enrollments.find((e) => e.studentDni === dni);
    const nextStatus: "ADMITIDO" | "MATRICULADO" = existing?.academicStatus === "MATRICULADO" ? "ADMITIDO" : "MATRICULADO";

    if (nextStatus === "MATRICULADO") {
      const currentPayStatus = existing?.paymentStatus || "No Pagado";
      if (currentPayStatus !== "Validado") {
        triggerNotification(
          `No se puede matricular: el pago ${currentPayStatus === "Observado" ? "está observado" : "aún no está validado"}. Revísalo en Pagos de Matrícula.`,
          "warning",
        );
        return;
      }
    }

    if (!await persistEnrollment(dni, { academicStatus: nextStatus })) return;
    triggerNotification(`Estado de matrícula actualizado.`);
  };

  const handleEnrollmentShiftChange = async (dni: string, shift: "Mañana" | "Tarde" | "Noche") => {
    if (!await persistEnrollment(dni, { shift })) return;
    triggerNotification(`Turno asignado a ${shift}.`);
  };

  const handleEnrollmentCareerChange = async (dni: string, programId: ProgramId) => {
    if (!await persistEnrollment(dni, { programId })) return;
    triggerNotification(`Carrera del alumno reasignada exitosamente.`);
  };

  // ── Handlers: Pagos ───────────────────────────────────────────────────────
  const handleRegisterPaymentOperation = async (dni: string, rawOperation: string) => {
    const operation = rawOperation.trim();
    if (!operation || operation.length > 100) {
      triggerNotification("Ingrese un número de operación válido (máximo 100 caracteres).", "warning");
      return;
    }
    if (!enrollments.some((enrollment) => enrollment.studentDni === dni)) {
      triggerNotification("Primero registre la matrícula del estudiante.", "warning");
      return;
    }
    if (!await persistEnrollment(dni, { paymentOperation: operation, paymentStatus: "Pendiente" })) return;
    triggerNotification("Operación registrada. Revisa el pago y luego pulsa Validar.");
  };

  const handleUpdatePaymentStatus = async (dni: string, status: "Validado" | "Observado") => {
    if (status === "Validado" && !enrollments.find((enrollment) => enrollment.studentDni === dni)?.paymentOperation?.trim()) {
      triggerNotification("No hay una operación de pago registrada para validar.", "warning");
      return;
    }
    if (!await persistEnrollment(dni, { paymentStatus: status })) return;
    triggerNotification(`Pago de matrícula ${status === "Validado" ? "VALIDADO con éxito y habilitado" : "OBSERVADO por tesorería"}.`);
  };

  // ── Handlers: Notas ───────────────────────────────────────────────────────
  const handleGradeChange = (dni: string, value: string) => {
    if (!value.trim()) {
      setTemporaryGrades((previous) => {
        const next = { ...previous };
        delete next[dni];
        return next;
      });
      return;
    }
    const score = Math.max(0, Math.min(20, Number(value) || 0));
    setTemporaryGrades((prev) => ({ ...prev, [dni]: score }));
  };

  const handleSaveGrades = async () => {
    if (!selectedCourseId) return;
    const activeCourseObj = courses.find((c) => c.id === selectedCourseId || c.code === selectedCourseId);
    const courseCode = activeCourseObj?.code || selectedCourseId;

    // Sellar acta institucionalmente
    localStorage.setItem(`sfa_acta_signed_${courseCode}`, "true");
    localStorage.setItem(`sfa_acta_signed_${selectedCourseId}`, "true");
    localStorage.setItem(`sfa_acta_signed_${courseCode}_date`, new Date().toLocaleDateString("es-PE"));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }

    if (Object.keys(temporaryGrades).length === 0) {
      triggerNotification("Acta Oficial Sellada e Inscrita Institucionalmente con Validez Oficial.", "success");
      return;
    }

    const studentsInActiveCourse = activeCourseObj
      ? processedStudents.filter((s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === (activeCourseObj.careerId || activeCourseObj.career))
      : [];

    const matchingAssignment = assignments.find(
      (a) => a.courseId === selectedCourseId && a.title.toLowerCase() === selectedTaskTitle.toLowerCase()
    );
    const currentGradesForTask: { [dni: string]: number } = {};
    if (matchingAssignment) {
      matchingAssignment.submissions.forEach((sub) => {
        if (sub.grade !== undefined) currentGradesForTask[sub.studentDni] = sub.grade;
      });
    }

    let targetAssignment = matchingAssignment;
    let updatedAssignments = [...assignments];

    if (!targetAssignment) {
      const newAsg: CourseAssignment = {
        kind: "assessment",
        id: "asg-" + Math.floor(100000 + Math.random() * 900000),
        courseId: selectedCourseId,
        title: selectedTaskTitle,
        description: "Registro de notas consolidado por administración",
        dueDate: new Date().toISOString().split("T")[0],
        submissions: []
      };
      updatedAssignments.push(newAsg);
      targetAssignment = newAsg;
    }

    const finalSubmissions = targetAssignment.submissions.map((submission) => ({ ...submission }));
    const currentStudentsMap = new Map(finalSubmissions.map((s) => [s.studentDni, s]));

    studentsInActiveCourse.forEach((student) => {
      const isTempChanged = temporaryGrades[student.dni] !== undefined;
      const scoreToSave = isTempChanged ? temporaryGrades[student.dni] : currentGradesForTask[student.dni];
      if (scoreToSave === undefined) return;

      if (currentStudentsMap.has(student.dni)) {
        const sub = currentStudentsMap.get(student.dni)!;
        sub.grade = scoreToSave;
      } else {
        finalSubmissions.push({
          studentDni: student.dni,
          studentName: `${student.name} ${student.lastName}`,
          fileName: "",
          submitDate: new Date().toISOString().split("T")[0],
          grade: scoreToSave
        });
      }
    });

    updatedAssignments = updatedAssignments.map((a) =>
      a.courseId === selectedCourseId && a.title.toLowerCase() === selectedTaskTitle.toLowerCase()
        ? { ...a, submissions: finalSubmissions }
        : a
    );

    if (!await onUpdateAssignments(updatedAssignments)) {
      triggerNotification("No se pudieron guardar todas las notas. Los cambios pendientes se conservaron para reintentar.", "error");
      return;
    }
    setTemporaryGrades({});
    triggerNotification(`¡Notas del Curso guardadas con éxito en el Registro Académico!`);
  };

  // ── Handlers: Asistencias ─────────────────────────────────────────────────
  const handleUpdateStudentAttendance = async (studentDni: string, status: "Presente" | "Tardanza" | "Falta" | "Justificado") => {
    if (!selectedAttendanceCourseId || !selectedAttendanceDate) {
      triggerNotification("Seleccione un curso y una fecha para registrar asistencia.", "warning"); return;
    }
    let updatedAttendance = [...attendance];
    const existingIndex = attendance.findIndex(
      (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
    );

    if (existingIndex >= 0) {
      const record = { ...attendance[existingIndex] };
      record.statusMap = { ...record.statusMap, [studentDni]: status };
      updatedAttendance[existingIndex] = record;
    } else {
      updatedAttendance.push({
        id: "att-" + Math.floor(100000 + Math.random() * 900000),
        courseId: selectedAttendanceCourseId,
        date: selectedAttendanceDate,
        statusMap: { [studentDni]: status }
      });
    }
    if (!await onUpdateAttendance(updatedAttendance)) {
      triggerNotification("No se pudo guardar la asistencia en el servidor. Intente nuevamente.", "error"); return;
    }
    triggerNotification("Asistencia guardada en el servidor.");
  };

  const handleFillAttendanceAll = async (status: "Presente" | "Falta") => {
    const course = courses.find((c) => c.id === selectedAttendanceCourseId);
    const studentsInCourse = course
      ? processedStudents.filter((s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === (course.careerId || course.career))
      : [];

    if (!selectedAttendanceCourseId || !selectedAttendanceDate) {
      triggerNotification("Seleccione un curso y una fecha para registrar asistencia.", "warning"); return;
    }
    let updatedAttendance = [...attendance];
    const existingIndex = attendance.findIndex(
      (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
    );

    if (!studentsInCourse.length) { triggerNotification("No hay alumnos matriculados para registrar asistencia.", "warning"); return; }
    const fullMap: { [dni: string]: any } = {};
    studentsInCourse.forEach((s) => { fullMap[s.dni] = status; });

    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], statusMap: { ...updatedAttendance[existingIndex].statusMap, ...fullMap } };
    } else {
      updatedAttendance.push({
        id: "att-" + Math.floor(100000 + Math.random() * 900000),
        courseId: selectedAttendanceCourseId,
        date: selectedAttendanceDate,
        statusMap: fullMap
      });
    }

    if (!await onUpdateAttendance(updatedAttendance)) {
      triggerNotification("No se pudo guardar la asistencia en el servidor. Intente nuevamente.", "error"); return;
    }
    triggerNotification(`Asistencia masiva registrada como: "${status}" para todos los alumnos.`);
  };

  // ── Handlers: Constancias ─────────────────────────────────────────────────
  const handleIssuerUpdate = async (studentDni: string, approve: boolean) => {
    const current = graduations.find((row) => row.studentDni === studentDni);
    if (approve && (!current || !Object.values(current.docsChecked).every((checked) => checked === true))) {
      triggerNotification("Revise y guarde todos los requisitos antes de marcar el expediente apto.", "warning"); return;
    }
    const saved = await updateGraduation(studentDni, { status: approve ? "Apto" : "No Apto", step: "Revision Documental" });
    if (!saved) { triggerNotification("No se pudo guardar la revisión del expediente.", "error"); return; }
    onUpdateGraduations(graduations.map((row) => row.studentDni === studentDni ? saved : row));
    triggerNotification("Revisión del expediente guardada.");
  };

  const handleCreateGraduationProcess = async (dni: string) => {
    if (graduations.some((g) => g.studentDni === dni)) {
      triggerNotification("El estudiante ya cuenta con una solicitud registrada o en trámite activo.", "warning");
      return;
    }
    const saved = await createGraduation({
        studentDni: dni,
        status: "Solicitado",
        step: "Solicitud",
        docsChecked: { solicitud: false, constanciaEgresado: false, practicasPre: false, pagoDerecho: false },
        obs: "Ingresado manualmente por el MGE Administrativo"
    });
    if (!saved) { triggerNotification("No se pudo abrir el expediente en el servidor.", "error"); return; }
    onUpdateGraduations([...graduations, saved]);
    triggerNotification("Se aperturó el expediente de Constancia de Egresado y Certificado de Estudios modulado.");
  };

  const handleSaveGraduationDocs = async (dni: string, docsChecked: Graduation['docsChecked'], obs: string) => {
    const saved = await updateGraduation(dni, { docsChecked, obs, status: "En Proceso", step: "Revision Documental" });
    if (!saved) { triggerNotification("No se pudieron guardar los requisitos del expediente.", "error"); return; }
    onUpdateGraduations(graduations.map((row) => row.studentDni === dni ? saved : row));
    triggerNotification("Requisitos y observaciones guardados.");
  };

  return (
    <div
      id="mge-dashboard"
      className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row pb-0"
    >
      {/* Sidebar navigation */}
      <Sidebar
        institution={{
          name: "MGE SFA",
          subtitle: "Gestión Estudiantil"
        }}
        user={{
          name: "Coordinación MGE",
          role: "Gestor Académico",
          status: "GESTOR / MGE"
        }}
        sections={[
          {
            title: "GESTIÓN Y MATRÍCULA",
            items: [
              {
                label: "1. Padrón Estudiantes",
                icon: <Users className="w-4 h-4" />,
                route: "estudiantes",
                active: activeSubTab === "estudiantes"
              },
              {
                label: "2. Matrícula General",
                icon: <GraduationCap className="w-4 h-4" />,
                route: "matricula_gral",
                active: activeSubTab === "matricula_gral"
              },
              {
                label: "3. Pagos de Matrícula",
                icon: <CreditCard className="w-4 h-4" />,
                route: "pagos",
                active: activeSubTab === "pagos"
              }
            ]
          },
          {
            title: "EVALUACIÓN Y ASISTENCIA",
            items: [
              {
                label: "4. Gestión de Notas",
                icon: <Award className="w-4 h-4" />,
                route: "notas",
                active: activeSubTab === "notas"
              },
              {
                label: "5. Asistencias Diarias",
                icon: <CheckSquare className="w-4 h-4" />,
                route: "asistencias",
                active: activeSubTab === "asistencias"
              },
              {
                label: "6. Historial Académico",
                icon: <FileText className="w-4 h-4" />,
                route: "historial",
                active: activeSubTab === "historial"
              }
            ]
          },
          {
            title: "INTELIGENCIA Y REPORTES",
            items: [
              {
                label: "7. Constancias y Certificados",
                icon: <Award className="w-4 h-4" />,
                route: "constancias",
                active: activeSubTab === "constancias"
              },
              {
                label: "8. Reportes Estadísticos",
                icon: <TrendingUp className="w-4 h-4" />,
                route: "reportes",
                active: activeSubTab === "reportes"
              },
              {
                label: "9. Riesgo Académico IA",
                icon: <BrainCircuit className="w-4 h-4" />,
                route: "riesgo_ia",
                active: activeSubTab === "riesgo_ia"
              }
            ]
          }
        ]}
        onItemClick={(route) => {
          setActiveSubTab(route as MgeSubTab);
          setSearchQuery("");
          if (route === "historial" && processedStudents.length > 0 && !selectedHistoryDni) {
            setSelectedHistoryDni(processedStudents[0].dni);
          }
        }}
        onLogout={onLogout}
        onGoToPortal={onGoToPortal}
      />

      {/* Main viewport */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 min-w-0">
        <header className="relative bg-[#800521] text-white rounded-none border-b-4 border-amber-500 p-6 md:p-7 shadow-md text-left shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm select-none font-mono">
                  SISTEMA INTRANET INSTITUCIONAL • MÓDULO MGE
                </span>
                <span className="bg-white/10 text-white text-[10px] font-black px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest font-mono">
                  ROL: GESTIÓN DE ESTUDIANTES
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight uppercase pt-0.5">
                {activeSubTab === "estudiantes" && "1. Padrón General de Estudiantes"}
                {activeSubTab === "matricula_gral" && "2. Matrícula General y Asignación de Turnos"}
                {activeSubTab === "pagos" && "3. Auditoría de Pagos de Matrícula"}
                {activeSubTab === "notas" && "4. Registro y Calificación de Notas"}
                {activeSubTab === "asistencias" && "5. Control de Asistencias Diarias"}
                {activeSubTab === "historial" && "6. Historial Académico y Récord de Notas"}
                {activeSubTab === "constancias" && "7. Expedición de Constancias y Certificados"}
                {activeSubTab === "reportes" && "8. Reportes Estadísticos Consolidados"}
                {activeSubTab === "riesgo_ia" && "9. Riesgo Académico IA • Detección Temprana y Deserción"}
              </h1>
              <p className="text-xs text-white/90 font-medium">
                Padrón consolidado, seguimiento curricular, calificaciones y emisión de constancias oficiales.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/20 shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-wider">Periodo:</span>
                <select
                  value={internalPeriodId}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="bg-black/60 text-white font-mono font-bold text-xs rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  title="Filtrar por periodo académico"
                >
                  <option value="all" className="bg-slate-900 text-white">Todos</option>
                  {effectiveAdmissionPeriods.map((p) => {
                    const shortName = compactPeriodName(p.name);
                    const isPActive = Boolean(p.isActive || p.status === "APERTURADO" || p.status === "MATRICULA");
                    return (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {shortName} • {isPActive ? "Activo" : "Cerrado"}
                      </option>
                    );
                  })}
                </select>

                <span
                  className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md font-mono ${
                    internalPeriodId === "all"
                      ? "bg-slate-500/30 text-slate-300 border border-slate-500/40"
                      : isPeriodActive
                      ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {internalPeriodId === "all" ? "Todos" : isPeriodActive ? "Activo" : "Cerrado"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        {saving ? (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#800521]" />
            <span>Guardando cambios en el servidor central...</span>
          </div>
        ) : null}
        <fieldset disabled={saving} className="flex-1 min-h-0 min-w-0 border-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">

          {activeSubTab === "estudiantes" && (
            sourceLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
                <Loader2 className="w-10 h-10 text-[#800521] animate-spin" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                  Cargando Padrón General de Estudiantes...
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Sincronizando información académica y de matrículas en tiempo real
                </span>
              </div>
            ) : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue para reintentar.</p> : <MgeEstudiantesTab
              filteredStudents={filteredStudents}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddModal={() => setShowAddStudentModal(true)}
              onEditClick={handleEditClick}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeSubTab === "matricula_gral" && (
            sourceLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
                <Loader2 className="w-10 h-10 text-[#800521] animate-spin" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                  Cargando Matrículas y Turnos Institucionales...
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Verificando condición académica de ingresantes y promovidos
                </span>
              </div>
            ) : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue para reintentar.</p> : <MgeMatriculaTab
              processedStudents={processedStudents}
              onToggleAcademicStatus={(dni) => { void runSave(() => handleToggleAcademicStatus(dni)); }}
              onShiftChange={(dni, shift) => { void runSave(() => handleEnrollmentShiftChange(dni, shift)); }}
              onCareerChange={(dni, programId) => { void runSave(() => handleEnrollmentCareerChange(dni, programId)); }}
            />
          )}

          {activeSubTab === "pagos" && (
            <MgePagosTab
              processedStudents={processedStudents}
              enrollments={enrollments}
              onUpdatePaymentStatus={(dni, status) => { void runSave(() => handleUpdatePaymentStatus(dni, status)); }}
              onRegisterOperation={(dni, operation) => { void runSave(() => handleRegisterPaymentOperation(dni, operation)); }}
              currentPeriodName={internalPeriodId === "period-2027-2" || internalPeriodId.includes("2027-2") || internalPeriodId.includes("2027-II") ? "Periodo 2027-II" : (internalPeriodId === "all" ? "Todos los Periodos" : "Periodo 2027-I")}
            />
          )}

          {activeSubTab === "notas" && (
            <MgeNotasTab
              courses={courses}
              assignments={assignments}
              processedStudents={processedStudents}
              selectedCourseId={selectedCourseId}
              selectedTaskTitle={selectedTaskTitle}
              temporaryGrades={temporaryGrades}
              onCourseChange={(id) => { setSelectedCourseId(id); setTemporaryGrades({}); }}
              onTaskChange={(t) => { setSelectedTaskTitle(t); setTemporaryGrades({}); }}
              onGradeChange={handleGradeChange}
              onSaveGrades={() => { void runSave(handleSaveGrades); }}
            />
          )}

          {activeSubTab === "asistencias" && (
            <MgeAsistenciasTab
              courses={courses}
              processedStudents={processedStudents}
              attendance={attendance}
              selectedAttendanceCourseId={selectedAttendanceCourseId}
              selectedAttendanceDate={selectedAttendanceDate}
              onCourseChange={setSelectedAttendanceCourseId}
              onDateChange={setSelectedAttendanceDate}
              loading={attendanceLoading}
              error={attendanceError}
              onReload={onReloadAttendance}
              onUpdateStudentAttendance={(dni, status) => { void runSave(() => handleUpdateStudentAttendance(dni, status)); }}
              onFillAttendanceAll={(status) => { void runSave(() => handleFillAttendanceAll(status)); }}
            />
          )}

          {activeSubTab === "historial" && (
            sourceLoading || assignmentsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
                <Loader2 className="w-10 h-10 text-[#800521] animate-spin" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                  Cargando Historial Académico y Actas Oficiales...
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Auditando calificaciones y récord acumulado
                </span>
              </div>
            ) : sourceError || assignmentsError ? <p role="alert" className="text-red-700">{sourceError || assignmentsError} Recargue la página para reintentar.</p> : <MgeHistorialTab
              processedStudents={processedStudents}
              courses={courses}
              assignments={assignments}
              selectedHistoryDni={selectedHistoryDni}
              onSelectDni={setSelectedHistoryDni}
            />
          )}

          {activeSubTab === "constancias" && (
            sourceLoading || graduationsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
                <Loader2 className="w-10 h-10 text-[#800521] animate-spin" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                  Cargando Expedientes y Certificados...
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Consultando estado de graduación y requisitos EFSRT
                </span>
              </div>
            ) : sourceError ? <p role="alert" className="text-red-700">{sourceError}</p> : <MgeConstanciasTab
              graduations={graduations}
              studentsList={studentsList}
              processedStudents={processedStudents}
              onIssuerUpdate={(dni, approve) => { void runSave(() => handleIssuerUpdate(dni, approve)); }}
              onCreateGraduationProcess={(dni) => { void runSave(() => handleCreateGraduationProcess(dni)); }}
              onSaveDocs={(dni, docs, obs) => { void runSave(() => handleSaveGraduationDocs(dni, docs, obs)); }}
            />
          )}

          {activeSubTab === "reportes" && (
            sourceLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs text-center p-6 my-2">
                <Loader2 className="w-10 h-10 text-[#800521] animate-spin" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest font-mono">
                  Cargando Reportes y Estadísticas Curriculares...
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Compilando métricas institucionales del periodo activo
                </span>
              </div>
            ) : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue la página para reintentar.</p> : <MgeReportesTab
              enrollments={enrollments}
              students={processedStudents}
              attendance={attendance}
              attendanceLoading={attendanceLoading}
              attendanceError={attendanceError}
            />
          )}

          {activeSubTab === "riesgo_ia" && (
            <MgeRiesgoIaTab />
          )}
        </fieldset>
      </main>

      {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}

      {/* Modals */}
      {statusDni ? <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="student-status-title" className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
          <h2 id="student-status-title" className="font-bold">{studentsList[statusDni]?.active === false ? "Reactivar estudiante" : "Dar de baja al estudiante"}</h2>
          <p>{studentsList[statusDni]?.name} {studentsList[statusDni]?.lastName} · {statusDni}</p>
          <p className="text-sm">La ficha, matrícula, pagos y notas se conservarán. Puede revertir la baja desde el padrón.</p>
          {studentsList[statusDni]?.active !== false ? <><label htmlFor="deactivation-reason" className="block">Motivo de la baja</label><textarea id="deactivation-reason" value={statusReason} onChange={(event) => setStatusReason(event.target.value)} maxLength={1000} disabled={saving} className="border rounded-lg p-3 w-full" /></> : null}
          <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setStatusDni(null)} className="border rounded-lg px-4 py-2">Cancelar</button><button type="button" disabled={saving || (studentsList[statusDni]?.active !== false && !statusReason.trim())} onClick={() => { void runSave(saveStudentStatus); }} className="bg-[#9F062A] text-white rounded-lg px-4 py-2 disabled:opacity-50">{saving ? "Guardando..." : "Confirmar cambio"}</button></div>
        </section>
      </div> : null}
      {showAddStudentModal && (
        <MgeAddStudentModal
          studentForm={studentForm}
          onFormChange={setStudentForm}
          saving={saving}
          onSubmit={(event) => { event.preventDefault(); void runSave(() => handleCreateStudent(event)); }}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {showEditStudentModal && editingStudentDni && (
        <MgeEditStudentModal
          studentForm={studentForm}
          editingStudentDni={editingStudentDni}
          onFormChange={setStudentForm}
          saving={saving}
          onSubmit={(event) => { event.preventDefault(); void runSave(() => handleUpdateStudent(event)); }}
          onClose={() => { setShowEditStudentModal(false); setEditingStudentDni(null); }}
        />
      )}
    </div>
  );
}
