import React, { useState, useMemo } from "react";
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

interface MgeDashboardProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  studentsList: { [dni: string]: StudentPersonalData };
  courses: Course[];
  assignments: CourseAssignment[];
  attendance: AttendanceRecord[];
  graduations: Graduation[];
  admissionPeriods?: AdmissionPeriod[];
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateStudentsList: (students: { [dni: string]: StudentPersonalData }) => void;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
  onUpdateAttendance: (att: AttendanceRecord[]) => void;
  onUpdateGraduations: (grads: Graduation[]) => void;
  selectedPeriodId?: string;
  onLogout?: () => void;
  onGoToPortal?: () => void;
}

export default function MgeDashboard({
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
  onUpdateCourses,
  onUpdateAssignments,
  onUpdateAttendance,
  onUpdateGraduations,
  selectedPeriodId,
  onLogout,
  onGoToPortal,
}: MgeDashboardProps) {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<MgeSubTab>("estudiantes");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentDni, setEditingStudentDni] = useState<string | null>(null);

  // Shared form state for both modals
  const [studentForm, setStudentForm] = useState<StudentFormState>(defaultStudentForm);

  // Tab-local state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>("Evaluación Final");
  const [temporaryGrades, setTemporaryGrades] = useState<{ [dni: string]: number }>({});
  const [selectedAttendanceCourseId, setSelectedAttendanceCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedHistoryDni, setSelectedHistoryDni] = useState<string>("");

  const triggerNotification = (msg: string) => window.alert(msg);

  // ── Derived data ──────────────────────────────────────────────────────────
  const processedStudents = useMemo(() => {
    return Object.values(studentsList).map((student) => {
      const enrollment = enrollments.find((e) => e.studentDni === student.dni);
      return {
        ...student,
        enrolled: !!enrollment,
        academicStatus: enrollment?.academicStatus || "ADMITIDO",
        programId: enrollment?.programId || "sistemas",
        shift: enrollment?.shift || "Noche",
        paymentStatus: enrollment?.paymentStatus || "No Pagado",
      };
    });
  }, [studentsList, enrollments]);

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

  // ── Handlers: Students ───────────────────────────────────────────────────
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const { dni, name, lastName, birthDate, gender, email, phone, address, district, province, emergencyName, emergencyPhone, emergencyRelation, programId, shift } = studentForm;

    if (!dni || dni.length !== 8 || isNaN(Number(dni))) {
      triggerNotification("El DNI debe contener exactamente 8 números.");
      return;
    }
    if (!name || !lastName || !email) {
      triggerNotification("Por favor complete nombre, apellido y correo institucional.");
      return;
    }

    const updatedStudents = { ...studentsList };
    updatedStudents[dni] = { dni, name, lastName, birthDate, gender, email, phone, address, district, province, emergencyName, emergencyPhone, emergencyRelation };
    onUpdateStudentsList(updatedStudents);

    const newEnrollment: Enrollment = {
      studentDni: dni,
      programId,
      academicStatus: "MATRICULADO",
      docs: {
        dniFile: { status: "Validado", fileName: "dni_manual.pdf" },
        certificadoFile: { status: "Validado", fileName: "certificado_manual.pdf" },
        partidaFile: { status: "Validado", fileName: "partida_manual.pdf" },
        fotoFile: { status: "Validado", fileName: "foto_manual.jpg" }
      },
      paymentStatus: "Validado",
      paymentOperation: "OP-MANUAL-" + Math.floor(100000 + Math.random() * 900000),
      paymentType: "number",
      shift
    };

    onUpdateEnrollments([...enrollments, newEnrollment]);
    setShowAddStudentModal(false);
    setStudentForm(defaultStudentForm);
    triggerNotification(`¡Estudiante ${name} ${lastName} ingresado y matriculado correctamente!`);
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
      birthDate: student.birthDate || "2002-05-15",
      gender: student.gender || "Masculino",
      email: student.email,
      phone: student.phone || "",
      address: student.address || "",
      district: student.district || "San Juan de Lurigancho",
      province: student.province || "Lima",
      emergencyName: student.emergencyName || "",
      emergencyPhone: student.emergencyPhone || "",
      emergencyRelation: student.emergencyRelation || "Padre/Madre",
      programId: enrollment?.programId || "sistemas",
      shift: enrollment?.shift || "Noche",
    });
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentDni) return;

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
    onUpdateStudentsList(updatedStudents);

    const updatedEnrollments = enrollments.map((en) =>
      en.studentDni === editingStudentDni
        ? { ...en, programId: studentForm.programId, shift: studentForm.shift }
        : en
    );
    onUpdateEnrollments(updatedEnrollments);

    setShowEditStudentModal(false);
    setEditingStudentDni(null);
    triggerNotification("Ficha y datos del estudiante actualizados con éxito.");
  };

  const handleDeleteStudent = (dni: string) => {
    if (confirm(`¿Está seguro de eliminar o dar de baja el registro académico del estudiante DNI ${dni}? Esta acción es irreversible.`)) {
      const updatedStudents = { ...studentsList };
      delete updatedStudents[dni];
      onUpdateStudentsList(updatedStudents);
      onUpdateEnrollments(enrollments.filter((e) => e.studentDni !== dni));
      triggerNotification("Se completó la baja del estudiante y se vació su matrícula actual.");
    }
  };

  // ── Handlers: Matrícula ───────────────────────────────────────────────────
  const handleToggleAcademicStatus = (dni: string) => {
    const existing = enrollments.find((e) => e.studentDni === dni);
    const nextStatus: "ADMITIDO" | "MATRICULADO" = existing?.academicStatus === "ADMITIDO" ? "MATRICULADO" : "ADMITIDO";

    if (nextStatus === "MATRICULADO") {
      const currentPayStatus = existing?.paymentStatus || "No Pagado";
      if (currentPayStatus !== "Validado") {
        alert(
          `[ALERTA] CONTROL DE RECAUDACIÓN Y PAGOS (MAMC):\n\nNo se puede registrar la matrícula de este alumno porque su pago único de S/. 250.00 de matrícula aún no ha sido VALIDADO por la Oficina de Caja (Estado actual: ${
            currentPayStatus === "Pendiente" ? "PENDIENTE DE VALIDACIÓN" :
            currentPayStatus === "Observado" ? "PAGO OBSERVADO / RECHAZADO" : "PENDIENTE DE PAGO"
          }).\n\nPor favor, diríjase a la sección de Caja de Matrícula para validar el pago primero.`
        );
        return;
      }
    }

    onUpdateEnrollments(enrollments.map((e) => e.studentDni === dni ? { ...e, academicStatus: nextStatus } : e));
    triggerNotification(`Estado de matrícula actualizado.`);
  };

  const handleEnrollmentShiftChange = (dni: string, shift: "Mañana" | "Tarde" | "Noche") => {
    onUpdateEnrollments(enrollments.map((e) => e.studentDni === dni ? { ...e, shift } : e));
    triggerNotification(`Turno asignado a ${shift}.`);
  };

  const handleEnrollmentCareerChange = (dni: string, programId: ProgramId) => {
    onUpdateEnrollments(enrollments.map((e) => e.studentDni === dni ? { ...e, programId } : e));
    triggerNotification(`Carrera del alumno reasignada exitosamente.`);
  };

  // ── Handlers: Pagos ───────────────────────────────────────────────────────
  const handleUpdatePaymentStatus = (dni: string, status: "Validado" | "Observado") => {
    onUpdateEnrollments(enrollments.map((e) => e.studentDni === dni ? { ...e, paymentStatus: status } : e));
    triggerNotification(`Pago de matrícula ${status === "Validado" ? "VALIDADO con éxito y habilitado" : "OBSERVADO por tesorería"}.`);
  };

  // ── Handlers: Notas ───────────────────────────────────────────────────────
  const handleGradeChange = (dni: string, value: string) => {
    const score = Math.max(0, Math.min(20, Number(value) || 0));
    setTemporaryGrades((prev) => ({ ...prev, [dni]: score }));
  };

  const handleSaveGrades = () => {
    if (!selectedCourseId) return;

    const activeCourseObj = courses.find((c) => c.id === selectedCourseId);
    const studentsInActiveCourse = activeCourseObj
      ? processedStudents.filter((s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === activeCourseObj.career)
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
        id: "asg-" + Math.floor(100000 + Math.random() * 900000),
        courseId: selectedCourseId,
        title: selectedTaskTitle,
        description: "Registro de notas consolidado por administración",
        dueDate: "2026-06-30",
        submissions: []
      };
      updatedAssignments.push(newAsg);
      targetAssignment = newAsg;
    }

    const finalSubmissions = [...targetAssignment.submissions];
    const currentStudentsMap = new Map(finalSubmissions.map((s) => [s.studentDni, s]));

    studentsInActiveCourse.forEach((student) => {
      const isTempChanged = temporaryGrades[student.dni] !== undefined;
      const scoreToSave = isTempChanged ? temporaryGrades[student.dni] : (currentGradesForTask[student.dni] ?? 12);

      if (currentStudentsMap.has(student.dni)) {
        const sub = currentStudentsMap.get(student.dni)!;
        sub.grade = scoreToSave;
        sub.submitDate = new Date().toISOString().split("T")[0];
      } else {
        finalSubmissions.push({
          studentDni: student.dni,
          studentName: `${student.name} ${student.lastName}`,
          fileName: "registro_nota_admin.pdf",
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

    onUpdateAssignments(updatedAssignments);
    setTemporaryGrades({});
    triggerNotification(`¡Notas del Curso guardadas con éxito en el Registro Académico!`);
  };

  // ── Handlers: Asistencias ─────────────────────────────────────────────────
  const handleUpdateStudentAttendance = (studentDni: string, status: "Presente" | "Tardanza" | "Falta" | "Justificado") => {
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
    onUpdateAttendance(updatedAttendance);
  };

  const handleFillAttendanceAll = (status: "Presente" | "Falta") => {
    const course = courses.find((c) => c.id === selectedAttendanceCourseId);
    const studentsInCourse = course
      ? processedStudents.filter((s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === course.career)
      : [];

    let updatedAttendance = [...attendance];
    const existingIndex = attendance.findIndex(
      (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
    );

    const fullMap: { [dni: string]: any } = {};
    studentsInCourse.forEach((s) => { fullMap[s.dni] = status; });

    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], statusMap: fullMap };
    } else {
      updatedAttendance.push({
        id: "att-" + Math.floor(100000 + Math.random() * 900000),
        courseId: selectedAttendanceCourseId,
        date: selectedAttendanceDate,
        statusMap: fullMap
      });
    }

    onUpdateAttendance(updatedAttendance);
    triggerNotification(`Asistencia masiva registrada como: "${status}" para todos los alumnos.`);
  };

  // ── Handlers: Constancias ─────────────────────────────────────────────────
  const handleIssuerUpdate = (studentDni: string, approve: boolean) => {
    const nextStatus = approve ? "Certificado Emitido" : "No Apto";
    onUpdateGraduations(
      graduations.map((g) =>
        g.studentDni === studentDni
          ? { ...g, status: nextStatus as any, step: "Emision" as any, obs: approve ? "Constancia Digital oficial generada y firmada por Coordinación Académica" : "Expediente observado por falta de horas de práctica" }
          : g
      )
    );
    triggerNotification(`Trámite académico ${approve ? "APROBADO. El certificado ha sido emitido con firma digital!" : "OBSERVADO por inconsistencia de datos"}.`);
  };

  const handleCreateGraduationProcess = (dni: string) => {
    if (graduations.some((g) => g.studentDni === dni)) {
      triggerNotification("El estudiante ya cuenta con una solicitud registrada o en trámite activo.");
      return;
    }
    onUpdateGraduations([
      ...graduations,
      {
        studentDni: dni,
        status: "Solicitado",
        step: "Solicitud",
        docsChecked: { solicitud: true, constanciaEgresado: true, practicasPre: true, pagoDerecho: true },
        obs: "Ingresado manualmente por el MGE Administrativo"
      }
    ]);
    triggerNotification("Se aperturó el expediente de Constancia de Egresado y Certificado de Estudios modulado.");
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
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="text-left">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none uppercase">
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
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
              IESTP San Francisco de Asís • Cuenta Gestión de Estudiantes (MGE)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ciclo Activo:</span>
              <span className="text-xs font-black text-slate-800">
                {admissionPeriods.find((p) => p.id === selectedPeriodId)?.name || "Periodo 2026-I"}
              </span>
            </div>
            <span className="text-[11px] font-black text-[#9F062A] bg-[#9F062A]/10 px-3 py-1.5 rounded-lg border border-[#9F062A]/20 font-mono tracking-widest hidden sm:inline-block">
              ROL: MGE
            </span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {activeSubTab === "estudiantes" && (
            <MgeEstudiantesTab
              filteredStudents={filteredStudents}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddModal={() => setShowAddStudentModal(true)}
              onEditClick={handleEditClick}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeSubTab === "matricula_gral" && (
            <MgeMatriculaTab
              processedStudents={processedStudents}
              onToggleAcademicStatus={handleToggleAcademicStatus}
              onShiftChange={handleEnrollmentShiftChange}
              onCareerChange={handleEnrollmentCareerChange}
            />
          )}

          {activeSubTab === "pagos" && (
            <MgePagosTab
              processedStudents={processedStudents}
              enrollments={enrollments}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
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
              onSaveGrades={handleSaveGrades}
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
              onUpdateStudentAttendance={handleUpdateStudentAttendance}
              onFillAttendanceAll={handleFillAttendanceAll}
            />
          )}

          {activeSubTab === "historial" && (
            <MgeHistorialTab
              processedStudents={processedStudents}
              courses={courses}
              assignments={assignments}
              selectedHistoryDni={selectedHistoryDni}
              onSelectDni={setSelectedHistoryDni}
              onPrint={(name) => triggerNotification(`Simulación de descarga del Récord de Notas en PDF para el alumno ${name}. Documento digital firmado.`)}
            />
          )}

          {activeSubTab === "constancias" && (
            <MgeConstanciasTab
              graduations={graduations}
              studentsList={studentsList}
              processedStudents={processedStudents}
              onIssuerUpdate={handleIssuerUpdate}
              onCreateGraduationProcess={handleCreateGraduationProcess}
            />
          )}

          {activeSubTab === "reportes" && (
            <MgeReportesTab
              enrollments={enrollments}
              onDownload={() => triggerNotification("Generando Reporte Estadístico Integrado Semestral en Excel para su exportación a la UGEL...")}
            />
          )}

          {activeSubTab === "riesgo_ia" && (
            <MgeRiesgoIaTab />
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddStudentModal && (
        <MgeAddStudentModal
          studentForm={studentForm}
          onFormChange={setStudentForm}
          onSubmit={handleCreateStudent}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {showEditStudentModal && editingStudentDni && (
        <MgeEditStudentModal
          studentForm={studentForm}
          editingStudentDni={editingStudentDni}
          onFormChange={setStudentForm}
          onSubmit={handleUpdateStudent}
          onClose={() => { setShowEditStudentModal(false); setEditingStudentDni(null); }}
        />
      )}
    </div>
  );
}
