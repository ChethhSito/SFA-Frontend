import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Users, FileText, CreditCard, Award, GraduationCap, CheckSquare,
  TrendingUp, BookOpen, BrainCircuit, Calendar
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
import MgeAttendanceSessions from "./tabs/MgeAttendanceSessions";
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
import { normalizeStudentSearch, validateStudentForm } from "../../utils/studentFormValidation";
import { enrollmentBlockers } from "../../utils/enrollmentEligibility";
import { parseGradeInput } from "../../utils/gradeInput";

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
  onLogout,
  onGoToPortal,
}: MgeDashboardProps) {
  // Navigation
  const { activeSubTab, setActiveSubTab } = useMgeNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [attendancePeriodReference, setAttendancePeriodReference] = useState("");
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const noticeSequence = useRef(0);
  const closeNotice = useCallback(() => setNotice(null), []);
  const triggerNotification = (message: string, kind: ToastKind = "success") => {
    setNotice({ id: ++noticeSequence.current, message, kind });
  };
  const [saving, setSaving] = useState(false);
  const saveInProgress = useRef(false);
  const runSave = async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (saveInProgress.current) return;
    saveInProgress.current = true;
    setSaving(true);
    try { return await action(); }
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
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>("Evaluación Final");
  const [temporaryGrades, setTemporaryGrades] = useState<Record<string, string>>({});
  const [selectedHistoryDni, setSelectedHistoryDni] = useState<string>("");
  useEffect(() => {
    if (!courses.some((course) => course.id === selectedCourseId)) setSelectedCourseId(courses[0]?.id || "");
  }, [courses, selectedCourseId]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const processedStudents = useMemo(() => {
    return Object.values(studentsList).map((student) => {
      const enrollment = enrollments.find((e) => e.studentDni === student.dni);
      return {
        ...student,
        enrolled: !!enrollment,
        academicStatus: student.active === false ? "BAJA" : enrollment?.academicStatus || "Sin matrícula",
        enrollmentStatus: enrollment?.academicStatus || "Sin matrícula",
        programId: enrollment?.programId || "",
        shift: enrollment?.shift || "",
        paymentStatus: enrollment?.paymentStatus || "Sin registro",
      };
    });
  }, [studentsList, enrollments]);

  const filteredStudents = useMemo(() => {
    const q = normalizeStudentSearch(searchQuery);
    if (!q) return processedStudents;
    return processedStudents.filter(
      (s) =>
        s.dni.includes(q) ||
        normalizeStudentSearch(`${s.name} ${s.lastName}`).includes(q) ||
        normalizeStudentSearch(`${s.lastName} ${s.name}`).includes(q) ||
        normalizeStudentSearch(s.email).includes(q)
    );
  }, [processedStudents, searchQuery]);

  const activePeriodName = useMemo(() => {
    const found = admissionPeriods.find((p) => p.id === selectedPeriodId);
    const raw = found?.name || "Sin periodo seleccionado";
    return raw
      .replace(/\uFFFD/g, "é")
      .replace(/Acad[\uFFFD\?a-zA-Z]*mico/gi, "Académico")
      .replace(/Acadmico/gi, "Académico");
  }, [admissionPeriods, selectedPeriodId]);

  // ── Handlers: Students ───────────────────────────────────────────────────
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStudentForm(studentForm, Object.values(studentsList));
    if (Object.keys(errors).length) { triggerNotification(Object.values(errors)[0]!, "warning"); return; }
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
    const errors = validateStudentForm(studentForm, Object.values(studentsList), editingStudentDni);
    if (Object.keys(errors).length) { triggerNotification(Object.values(errors)[0]!, "warning"); return; }
    if (!studentForm.programId || !studentForm.shift) {
      triggerNotification("Seleccione la carrera y el turno del estudiante.", "warning");
      return;
    }

    const updatedStudents = { ...studentsList };
    updatedStudents[editingStudentDni] = {
      ...studentsList[editingStudentDni],
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
    const existingEnrollment = enrollments.find((en) => en.studentDni === editingStudentDni);
    const savedEnrollment = existingEnrollment
      ? existingEnrollment.programId === enrollmentData.programId && existingEnrollment.shift === enrollmentData.shift
        ? existingEnrollment
        : await onSaveEnrollment(editingStudentDni, enrollmentData)
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
    if (!existing) { triggerNotification("Cree primero el registro de admisión desde la ficha del estudiante.", "warning"); return false; }
    const nextStatus: "ADMITIDO" | "MATRICULADO" = existing?.academicStatus === "MATRICULADO" ? "ADMITIDO" : "MATRICULADO";

    if (nextStatus === "MATRICULADO") {
      const student = processedStudents.find((row) => row.dni === dni);
      const blockers = student ? enrollmentBlockers(student) : ["No se encontró al estudiante."];
      if (blockers.length) { triggerNotification(blockers[0], "warning"); return false; }
    }

    if (!await persistEnrollment(dni, { academicStatus: nextStatus })) return;
    triggerNotification(`Estado de matrícula actualizado.`);
    return true;
  };

  const handleEnrollmentAssignment = async (dni: string, programId: ProgramId, shift: "Mañana" | "Tarde" | "Noche") => {
    if (!studentsList[dni] || studentsList[dni].active === false || !enrollments.some((row) => row.studentDni === dni)) {
      triggerNotification("El estudiante debe estar activo y contar con un registro de admisión.", "warning"); return false;
    }
    if (!programId || !["Mañana", "Tarde", "Noche"].includes(shift)) { triggerNotification("Seleccione una carrera y un turno válidos.", "warning"); return false; }
    if (!await persistEnrollment(dni, { programId, shift })) return false;
    triggerNotification("Carrera y turno actualizados.");
    return true;
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
    return true;
  };

  const handleUpdatePaymentStatus = async (dni: string, status: "Validado" | "Observado", reason?: string) => {
    if (!enrollments.find((enrollment) => enrollment.studentDni === dni)?.paymentOperation?.trim()) {
      triggerNotification("No hay una operación de pago registrada para validar.", "warning");
      return;
    }
    if (status === "Observado" && (!reason?.trim() || reason.trim().length > 1000)) { triggerNotification("Ingrese un motivo de observación de hasta 1000 caracteres.", "warning"); return false; }
    if (!await persistEnrollment(dni, { paymentStatus: status, ...(status === "Observado" ? { paymentObservations: reason!.trim() } : {}) })) return;
    triggerNotification(`Pago de matrícula ${status === "Validado" ? "VALIDADO con éxito y habilitado" : "OBSERVADO por tesorería"}.`);
    return true;
  };

  // ── Handlers: Notas ───────────────────────────────────────────────────────
  const handleGradeChange = (dni: string, value: string) => {
    const existing = assignments.find((assignment) => assignment.courseId === selectedCourseId && assignment.title.toLowerCase() === selectedTaskTitle.toLowerCase())?.submissions.find((submission) => submission.studentDni === dni)?.grade;
    if (!value.trim() || (existing !== undefined && parseGradeInput(value) === existing)) {
      setTemporaryGrades((previous) => {
        const next = { ...previous };
        delete next[dni];
        return next;
      });
      return;
    }
    setTemporaryGrades((prev) => ({ ...prev, [dni]: value }));
  };

  const handleSaveGrades = async () => {
    if (!selectedCourseId) return;
    if (Object.keys(temporaryGrades).length === 0) {
      triggerNotification("Ingrese al menos una calificación antes de guardar.", "warning");
      return;
    }

    const activeCourseObj = courses.find((c) => c.id === selectedCourseId);
    const studentsInActiveCourse = activeCourseObj
      ? processedStudents.filter((s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === (activeCourseObj.careerId || activeCourseObj.career))
      : [];

    const changedStudents = studentsInActiveCourse.filter((student) => temporaryGrades[student.dni] !== undefined);
    if (!changedStudents.length || changedStudents.some((student) => parseGradeInput(temporaryGrades[student.dni]) === null)) {
      triggerNotification("Revise las notas pendientes. Cada calificación debe estar entre 0 y 20.", "warning");
      return false;
    }

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
      const scoreToSave = isTempChanged ? parseGradeInput(temporaryGrades[student.dni])! : currentGradesForTask[student.dni];
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
    return true;
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
                label: "9. Riesgo Académico",
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
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="text-left">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {activeSubTab === "estudiantes" && "1. Padrón General de Estudiantes"}
              {activeSubTab === "matricula_gral" && "Matrícula general"}
              {activeSubTab === "pagos" && "Pagos de matrícula"}
              {activeSubTab === "notas" && "Gestión de notas"}
              {activeSubTab === "asistencias" && "Asistencias diarias"}
              {activeSubTab === "historial" && "Historial académico"}
              {activeSubTab === "constancias" && "Constancias y certificados"}
              {activeSubTab === "reportes" && "Reportes estadísticos"}
              {activeSubTab === "riesgo_ia" && "Riesgo académico y tutoría"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              IESTP San Francisco de Asís · Gestión estudiantil
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">{activeSubTab === "matricula_gral" || activeSubTab === "pagos" || activeSubTab === "asistencias" ? "Periodo de referencia:" : "Ciclo activo:"}</span>
              <span className="text-xs font-black text-slate-800">
                {activeSubTab === "asistencias" ? attendancePeriodReference || activePeriodName : activePeriodName}
              </span>
            </div>
            <span className="text-[11px] font-black text-[#9F062A] bg-[#9F062A]/10 px-3 py-1.5 rounded-lg border border-[#9F062A]/20 font-mono tracking-widest hidden sm:inline-block">
              ROL: MGE
            </span>
          </div>
        </header>

        {/* Content area */}
        {saving ? <p role="status" className="p-3">Guardando cambios en el servidor...</p> : null}
        <fieldset disabled={saving} className="flex-1 min-h-0 min-w-0 border-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {activeSubTab === "estudiantes" && (
            sourceLoading ? <p role="status">Cargando el padrón y las matrículas...</p> : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue para reintentar.</p> : <MgeEstudiantesTab
              filteredStudents={filteredStudents}
              totalCount={processedStudents.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddModal={() => { setStudentForm({ ...defaultStudentForm }); setShowAddStudentModal(true); }}
              onEditClick={handleEditClick}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeSubTab === "matricula_gral" && (
            sourceLoading ? <p role="status">Cargando matrículas...</p> : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue para reintentar.</p> : <MgeMatriculaTab
              processedStudents={processedStudents}
              saving={saving}
              onToggleAcademicStatus={(dni) => runSave(() => handleToggleAcademicStatus(dni))}
              onSaveAssignment={(dni, programId, shift) => runSave(() => handleEnrollmentAssignment(dni, programId, shift))}
              onOpenStudent={handleEditClick}
              onOpenPayments={() => setActiveSubTab("pagos")}
            />
          )}

          {activeSubTab === "pagos" && (
            sourceLoading ? <p role="status">Cargando pagos...</p> : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue para reintentar.</p> : <MgePagosTab
              processedStudents={processedStudents}
              enrollments={enrollments}
              saving={saving}
              onUpdatePaymentStatus={(dni, status, reason) => runSave(() => handleUpdatePaymentStatus(dni, status, reason))}
              onRegisterOperation={(dni, operation) => runSave(() => handleRegisterPaymentOperation(dni, operation))}
              onOpenStudent={handleEditClick}
            />
          )}

          {activeSubTab === "notas" && (
            sourceLoading || assignmentsLoading ? <p role="status">Cargando estudiantes y evaluaciones...</p> : sourceError || assignmentsError ? <p role="alert" className="text-red-700">{sourceError || assignmentsError} Recargue para reintentar.</p> : <MgeNotasTab
              courses={courses}
              assignments={assignments}
              processedStudents={processedStudents}
              selectedCourseId={selectedCourseId}
              selectedTaskTitle={selectedTaskTitle}
              temporaryGrades={temporaryGrades}
              saving={saving}
              onDiscardGrades={() => setTemporaryGrades({})}
              onCourseChange={(id) => { setSelectedCourseId(id); setTemporaryGrades({}); }}
              onTaskChange={(t) => { setSelectedTaskTitle(t); setTemporaryGrades({}); }}
              onGradeChange={handleGradeChange}
              onSaveGrades={() => runSave(handleSaveGrades)}
            />
          )}

          {activeSubTab === "asistencias" && (
            sourceLoading ? <p role="status">Cargando estudiantes y cursos...</p> : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue para reintentar.</p> : <MgeAttendanceSessions courses={courses} students={processedStudents} enrollments={enrollments} legacyAttendance={attendance} onAttendanceChanged={onReloadAttendance} onPeriodReferenceChange={setAttendancePeriodReference} />
          )}
          {activeSubTab === "historial" && (
            sourceLoading || assignmentsLoading ? <p role="status">Cargando registros académicos...</p> : sourceError || assignmentsError ? <p role="alert" className="text-red-700">{sourceError || assignmentsError} Recargue la página para reintentar.</p> : <MgeHistorialTab
              processedStudents={processedStudents}
              courses={courses}
              assignments={assignments}
              selectedHistoryDni={selectedHistoryDni}
              onSelectDni={setSelectedHistoryDni}
            />
          )}

          {activeSubTab === "constancias" && (
            sourceLoading || graduationsLoading ? <p role="status">Cargando expedientes...</p> : sourceError ? <p role="alert" className="text-red-700">{sourceError}</p> : graduationsError ? <GraduationAccessPanel error={graduationsError} onReload={onReloadGraduations} /> : <MgeConstanciasTab
              graduations={graduations}
              studentsList={studentsList}
              processedStudents={processedStudents}
              onIssuerUpdate={(dni, approve) => { void runSave(() => handleIssuerUpdate(dni, approve)); }}
              onCreateGraduationProcess={(dni) => { void runSave(() => handleCreateGraduationProcess(dni)); }}
              onSaveDocs={(dni, docs, obs) => { void runSave(() => handleSaveGraduationDocs(dni, docs, obs)); }}
            />
          )}

          {activeSubTab === "reportes" && (
            sourceLoading ? <p role="status">Cargando datos de estudiantes y matrícula...</p> : sourceError ? <p role="alert" className="text-red-700">{sourceError} Recargue la página para reintentar.</p> : <MgeReportesTab
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
          existingStudents={Object.values(studentsList)}
          studentForm={studentForm}
          onFormChange={setStudentForm}
          saving={saving}
          onSubmit={(event) => { event.preventDefault(); void runSave(() => handleCreateStudent(event)); }}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {showEditStudentModal && editingStudentDni && (
        <MgeEditStudentModal
          existingStudents={Object.values(studentsList)}
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
