import React, { useState, useMemo } from "react";
import {
  Users, FileText, CreditCard, Award, GraduationCap, CheckSquare,
  TrendingUp, BookOpen
} from "lucide-react";
import {
  Applicant,
  Enrollment,
  StudentPersonalData,
  Course,
  CourseAssignment,
  AttendanceRecord,
  Graduation,
  ProgramId
} from "../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";

// Modular tabs
import MgeEstudiantesTab from "./tabs/MgeEstudiantesTab";
import MgeMatriculaTab from "./tabs/MgeMatriculaTab";
import MgePagosTab from "./tabs/MgePagosTab";
import MgeNotasTab from "./tabs/MgeNotasTab";
import MgeAsistenciasTab from "./tabs/MgeAsistenciasTab";
import MgeHistorialTab from "./tabs/MgeHistorialTab";
import MgeConstanciasTab from "./tabs/MgeConstanciasTab";
import MgeReportesTab from "./tabs/MgeReportesTab";

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
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateStudentsList: (students: { [dni: string]: StudentPersonalData }) => void;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
  onUpdateAttendance: (att: AttendanceRecord[]) => void;
  onUpdateGraduations: (grads: Graduation[]) => void;
  selectedPeriodId: string;
  onLogout?: () => void;
}

export default function MgeDashboard({
  applicants,
  enrollments,
  studentsList,
  courses,
  assignments,
  attendance,
  graduations,
  onUpdateEnrollments,
  onUpdateStudentsList,
  onUpdateCourses,
  onUpdateAssignments,
  onUpdateAttendance,
  onUpdateGraduations,
  selectedPeriodId,
  onLogout,
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
          `❌ CONTROL DE RECAUDACIÓN Y PAGOS (MAMC):\n\nNo se puede registrar la matrícula de este alumno porque su pago único de S/. 250.00 de matrícula aún no ha sido VALIDADO por la Oficina de Caja (Estado actual: ${
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

  // ── Tab navigation helper ─────────────────────────────────────────────────
  const tabClass = (tab: MgeSubTab) =>
    `px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
      activeSubTab === tab
        ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20"
        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
    }`;

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#9F062A] text-[10px] font-black uppercase rounded tracking-wider text-white">
                MGE Backend Activo
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Intranet SFA
              </span>
            </div>
            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-[#9F062A]" />
              Módulo: Gestión de Estudiantes (MGE)
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs font-semibold leading-relaxed max-w-2xl">
              Consola unificada de registros académicos, boleta de notas, matrícula general, asistencia ordinaria, caja modular de tesorería y emisión descentralizada de certificados oficiales.
            </CardDescription>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <div className="px-3 py-1.5 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ciclo Activo</p>
              <p className="text-xs font-black text-white">Periodo 2026-I</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Sub-navigation */}
      <div className="bg-slate-100 p-2 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 custom-scrollbar">
        <button onClick={() => { setActiveSubTab("estudiantes"); setSearchQuery(""); }} className={tabClass("estudiantes")}>
          <Users className="w-3.5 h-3.5" /> 1. Gestión Estudiantes
        </button>
        <button onClick={() => { setActiveSubTab("matricula_gral"); setSearchQuery(""); }} className={tabClass("matricula_gral")}>
          <GraduationCap className="w-3.5 h-3.5" /> 2. Matrícula General
        </button>
        <button onClick={() => { setActiveSubTab("pagos"); setSearchQuery(""); }} className={tabClass("pagos")}>
          <CreditCard className="w-3.5 h-3.5" /> 3. Pagos de Matrícula
        </button>
        <button onClick={() => { setActiveSubTab("notas"); setSearchQuery(""); }} className={tabClass("notas")}>
          <Award className="w-3.5 h-3.5" /> 4. Gestión de Notas
        </button>
        <button onClick={() => { setActiveSubTab("asistencias"); setSearchQuery(""); }} className={tabClass("asistencias")}>
          <CheckSquare className="w-3.5 h-3.5" /> 5. Asistencias
        </button>
        <button
          onClick={() => {
            setActiveSubTab("historial");
            setSearchQuery("");
            if (processedStudents.length > 0 && !selectedHistoryDni) {
              setSelectedHistoryDni(processedStudents[0].dni);
            }
          }}
          className={tabClass("historial")}
        >
          <FileText className="w-3.5 h-3.5" /> 6. Historial Académico
        </button>
        <button onClick={() => { setActiveSubTab("constancias"); setSearchQuery(""); }} className={tabClass("constancias")}>
          <Award className="w-3.5 h-3.5" /> 7. Constancias y Certificados
        </button>
        <button onClick={() => { setActiveSubTab("reportes"); setSearchQuery(""); }} className={tabClass("reportes")}>
          <TrendingUp className="w-3.5 h-3.5" /> 8. Reportes Estadísticos
        </button>
      </div>

      <CardContent className="p-6">
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
      </CardContent>

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
    </Card>
  );
}
