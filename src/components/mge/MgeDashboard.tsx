import React, { useState, useMemo } from "react";
import { 
  Users, FileText, CreditCard, Award, GraduationCap, CheckSquare, 
  TrendingUp, CircleDot, Plus, Search, Edit2, Check, X, AlertTriangle, 
  Trash2, BookOpen, Calendar, HelpCircle, FileSpreadsheet, Download, RefreshCw, BarChart2, ShieldCheck, UserCheck, PhoneCall, Printer
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
import { ACADEMIC_PROGRAMS } from "../../lib/mockData";
import Button from "../ui-custom/Button";
import Badge from "../ui-custom/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";

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

type MgeSubTab = 
  | "estudiantes" 
  | "matricula_gral" 
  | "pagos" 
  | "notas" 
  | "asistencias" 
  | "historial" 
  | "constancias" 
  | "reportes";

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
  onLogout
}: MgeDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<MgeSubTab>("estudiantes");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals / Form States
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentDni, setEditingStudentDni] = useState<string | null>(null);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    dni: "",
    name: "",
    lastName: "",
    birthDate: "2002-05-15",
    gender: "Masculino",
    email: "",
    phone: "",
    address: "",
    district: "San Juan de Lurigancho",
    province: "Lima",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "Padre/Madre",
    programId: "sistemas" as ProgramId,
    shift: "Mañana" as "Mañana" | "Tarde" | "Noche"
  });

  // State for Grades Tab
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string>("Evaluación Final");
  const [temporaryGrades, setTemporaryGrades] = useState<{ [dni: string]: number }>({});

  // State for Attendance Tab
  const [selectedAttendanceCourseId, setSelectedAttendanceCourseId] = useState<string>(courses[0]?.id || "");
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // State for Academic History lookup
  const [selectedHistoryDni, setSelectedHistoryDni] = useState<string>("");

  // Reusable custom alerting
  const triggerNotification = (msg: string) => {
    window.alert(msg);
  };

  // 1. GESTIÓN DE ESTUDIANTES: List both enrolled and raw student profiles
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

    // Add to students personal data list
    const updatedStudents = { ...studentsList };
    updatedStudents[dni] = {
      dni,
      name,
      lastName,
      birthDate,
      gender,
      email,
      phone,
      address,
      district,
      province,
      emergencyName,
      emergencyPhone,
      emergencyRelation
    };
    onUpdateStudentsList(updatedStudents);

    // Create a validated enrollment for this student automatically
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
    
    // Clear form
    setStudentForm({
      dni: "",
      name: "",
      lastName: "",
      birthDate: "2002-05-15",
      gender: "Masculino",
      email: "",
      phone: "",
      address: "",
      district: "San Juan de Lurigancho",
      province: "Lima",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "Padre/Madre",
      programId: "sistemas",
      shift: "Mañana"
    });

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
      shift: enrollment?.shift || "Noche"
    });
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentDni) return;

    // Update students data
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
      emergencyRelation: studentForm.emergencyRelation
    };
    onUpdateStudentsList(updatedStudents);

    // Update Program/Shift in enrollment
    const updatedEnrollments = enrollments.map((en) => {
      if (en.studentDni === editingStudentDni) {
        return {
          ...en,
          programId: studentForm.programId,
          shift: studentForm.shift
        };
      }
      return en;
    });
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

      const updatedEnrollments = enrollments.filter((e) => e.studentDni !== dni);
      onUpdateEnrollments(updatedEnrollments);

      triggerNotification("Se completó la baja del estudiante y se vació su matrícula actual.");
    }
  };

  // 2. MATRÍCULA GENERAL: Status switches, shift assignments, and manual enrollments
  const handleToggleAcademicStatus = (dni: string) => {
    const existing = enrollments.find(e => e.studentDni === dni);
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

    const updated = enrollments.map((e) => {
      if (e.studentDni === dni) {
        return { ...e, academicStatus: nextStatus };
      }
      return e;
    });
    onUpdateEnrollments(updated);
    triggerNotification(`Estado de matrícula actualizado.`);
  };

  const handleEnrollmentShiftChange = (dni: string, shift: "Mañana" | "Tarde" | "Noche") => {
    const updated = enrollments.map((e) => {
      if (e.studentDni === dni) {
        return { ...e, shift };
      }
      return e;
    });
    onUpdateEnrollments(updated);
    triggerNotification(`Turno asignado a ${shift}.`);
  };

  const handleEnrollmentCareerChange = (dni: string, programId: ProgramId) => {
    const updated = enrollments.map((e) => {
      if (e.studentDni === dni) {
        return { ...e, programId };
      }
      return e;
    });
    onUpdateEnrollments(updated);
    triggerNotification(`Carrera del alumno reasignada exitosamente.`);
  };

  // 3. GESTIÓN DE PAGOS DE MATRÍCULA: S/. 250 fee auditing
  const handleUpdatePaymentStatus = (dni: string, status: "Validado" | "Observado") => {
    const updated = enrollments.map((e) => {
      if (e.studentDni === dni) {
        return { ...e, paymentStatus: status };
      }
      return e;
    });
    onUpdateEnrollments(updated);
    triggerNotification(`Pago de matrícula ${status === "Validado" ? "VALIDADO con éxito y habilitado" : "OBSERVADO por tesorería"}.`);
  };

  // 4. GESTIÓN DE NOTAS: Entering grades scale 0-20
  const activeCourseObj = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const studentsInActiveCourse = useMemo(() => {
    if (!activeCourseObj) return [];
    // Just display all active matriculated students in this course
    return processedStudents.filter(s => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === activeCourseObj.career);
  }, [activeCourseObj, processedStudents]);

  // Load existing grades for selected course assignment
  const currentGradesForTask = useMemo(() => {
    const matchingAssignment = assignments.find(
      (a) => a.courseId === selectedCourseId && a.title.toLowerCase() === selectedTaskTitle.toLowerCase()
    );
    const gradesMap: { [dni: string]: number } = {};
    if (matchingAssignment) {
      matchingAssignment.submissions.forEach((sub) => {
        if (sub.grade !== undefined) {
          gradesMap[sub.studentDni] = sub.grade;
        }
      });
    }
    return gradesMap;
  }, [assignments, selectedCourseId, selectedTaskTitle]);

  const handleGradeChange = (dni: string, value: string) => {
    const score = Math.max(0, Math.min(20, Number(value) || 0));
    setTemporaryGrades((prev) => ({
      ...prev,
      [dni]: score
    }));
  };

  const handleSaveGrades = () => {
    if (!selectedCourseId) return;

    let targetAssignment = assignments.find(
      (a) => a.courseId === selectedCourseId && a.title.toLowerCase() === selectedTaskTitle.toLowerCase()
    );

    let updatedAssignments = [...assignments];

    if (!targetAssignment) {
      // Create a brand new assignments block for this course task
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

    // Prepare submissions
    const finalSubmissions = [...targetAssignment.submissions];
    
    // Merge existing and temporary
    const currentStudentsMap = new Map(finalSubmissions.map(s => [s.studentDni, s]));

    studentsInActiveCourse.forEach((student) => {
      const isTempChanged = temporaryGrades[student.dni] !== undefined;
      const scoreToSave = isTempChanged 
        ? temporaryGrades[student.dni] 
        : (currentGradesForTask[student.dni] ?? 12); // Default mock grade of 12 if untracked

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

    // Update assignment inside array
    updatedAssignments = updatedAssignments.map((a) => {
      if (a.courseId === selectedCourseId && a.title.toLowerCase() === selectedTaskTitle.toLowerCase()) {
        return {
          ...a,
          submissions: finalSubmissions
        };
      }
      return a;
    });

    onUpdateAssignments(updatedAssignments);
    setTemporaryGrades({});
    triggerNotification(`¡Notas del Curso guardadas con éxito en el Registro Académico!`);
  };

  // 5. GESTIÓN DE ASISTENCIAS: attendance status switches
  const activeAttendanceRecord = useMemo(() => {
    return attendance.find(
      (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
    );
  }, [attendance, selectedAttendanceCourseId, selectedAttendanceDate]);

  const studentsInAttendanceCourse = useMemo(() => {
    const course = courses.find((c) => c.id === selectedAttendanceCourseId);
    if (!course) return [];
    return processedStudents.filter(
      (s) => s.enrolled && s.academicStatus === "MATRICULADO" && s.programId === course.career
    );
  }, [courses, selectedAttendanceCourseId, processedStudents]);

  const handleUpdateStudentAttendance = (studentDni: string, status: "Presente" | "Tardanza" | "Falta" | "Justificado") => {
    let updatedAttendance = [...attendance];
    
    const existingIndex = attendance.findIndex(
      (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
    );

    if (existingIndex >= 0) {
      const record = { ...attendance[existingIndex] };
      record.statusMap = {
        ...record.statusMap,
        [studentDni]: status
      };
      updatedAttendance[existingIndex] = record;
    } else {
      // Build a whole new attendance record
      const newRecord: AttendanceRecord = {
        id: "att-" + Math.floor(100000 + Math.random() * 900000),
        courseId: selectedAttendanceCourseId,
        date: selectedAttendanceDate,
        statusMap: {
          [studentDni]: status
        }
      };
      updatedAttendance.push(newRecord);
    }

    onUpdateAttendance(updatedAttendance);
  };

  const handleFillAttendanceAllMock = (status: "Presente" | "Falta") => {
    let updatedAttendance = [...attendance];
    const existingIndex = attendance.findIndex(
      (att) => att.courseId === selectedAttendanceCourseId && att.date === selectedAttendanceDate
    );

    const fullMap: { [dni: string]: any } = {};
    studentsInAttendanceCourse.forEach((student) => {
      fullMap[student.dni] = status;
    });

    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = {
        ...updatedAttendance[existingIndex],
        statusMap: fullMap
      };
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

  // 6. HISTORIAL ACADÉMICO: transcript, cycle logs and global weighted average GPA
  const activeHistoryStudent = useMemo(() => {
    if (!selectedHistoryDni) return null;
    return processedStudents.find((s) => s.dni === selectedHistoryDni);
  }, [processedStudents, selectedHistoryDni]);

  const activeHistoryGradesList = useMemo(() => {
    if (!selectedHistoryDni) return [];
    // Collect all grades for this student from our assignments
    const list: { courseName: string; code: string; grade: number; credits: number; status: string }[] = [];
    
    courses.forEach((course) => {
      // Gather assignments of this course
      const courseAsgs = assignments.filter((a) => a.courseId === course.id);
      if (courseAsgs.length > 0) {
        // Average the score of all assignments of this course
        let sum = 0;
        let count = 0;
        courseAsgs.forEach((asg) => {
          const studentSub = asg.submissions.find((s) => s.studentDni === selectedHistoryDni);
          if (studentSub && studentSub.grade !== undefined) {
            sum += studentSub.grade;
            count++;
          }
        });

        const average = count > 0 ? Math.round(sum / count) : 12 + Math.floor(Math.random() * 5); // Fallback to premium simulated records if no submission listed
        list.push({
          courseName: course.name,
          code: course.code,
          grade: average,
          credits: course.credits || 4,
          status: average >= 13 ? "Aprobado" : "Desaprobado"
        });
      } else {
        // Mock default completed courses history
        const randomGrade = 13 + Math.floor(Math.random() * 7);
        list.push({
          courseName: course.name,
          code: course.code,
          grade: randomGrade,
          credits: course.credits || 4,
          status: "Aprobado"
        });
      }
    });
    return list;
  }, [selectedHistoryDni, courses, assignments]);

  const activeHistoryWeightedAverage = useMemo(() => {
    if (activeHistoryGradesList.length === 0) return 0;
    const totalCredits = activeHistoryGradesList.reduce((acc, c) => acc + c.credits, 0);
    const sumPoints = activeHistoryGradesList.reduce((acc, c) => acc + (c.grade * c.credits), 0);
    return Math.round((sumPoints / totalCredits) * 10) / 10;
  }, [activeHistoryGradesList]);

  // 7. CONSTANCIAS Y CERTIFICADOS: request auditing and issue triggers
  const handleIssuerUpdate = (studentDni: string, approve: boolean) => {
    const nextStatus = approve ? "Certificado Emitido" : "No Apto";
    const updated = graduations.map((g) => {
      if (g.studentDni === studentDni) {
        return { 
          ...g, 
          status: nextStatus as any, 
          step: "Emision" as any,
          obs: approve ? "Constancia Digital oficial generada y firmada por Coordinación Académica" : "Expediente observado por falta de horas de práctica"
        };
      }
      return g;
    });
    onUpdateGraduations(updated);
    triggerNotification(`Trámite académico ${approve ? "APROBADO. El certificado ha sido emitido con firma digital!" : "OBSERVADO por inconsistencia de datos"}.`);
  };

  const handleCreateGraduationProcess = (dni: string) => {
    const alreadyExists = graduations.some((g) => g.studentDni === dni);
    if (alreadyExists) {
      triggerNotification("El estudiante ya cuenta con una solicitud registrada o en trámite activo.");
      return;
    }

    const newGrad: Graduation = {
      studentDni: dni,
      status: "Solicitado",
      step: "Solicitud",
      docsChecked: {
        solicitud: true,
        constanciaEgresado: true,
        practicasPre: true,
        pagoDerecho: true
      },
      obs: "Ingresado manualmente por el MGE Administrativo"
    };

    onUpdateGraduations([...graduations, newGrad]);
    triggerNotification("Se aperturó el expediente de Constancia de Egresado y Certificado de Estudios modulado.");
  };

  // 8. REPORTES: Statistical metrics and summaries
  const statsOverview = useMemo(() => {
    const totalMatriculados = enrollments.filter(e => e.academicStatus === "MATRICULADO").length;
    const totalAdmitidos = enrollments.filter(e => e.academicStatus === "ADMITIDO").length;
    const pagosValidados = enrollments.filter(e => e.paymentStatus === "Validado").length;
    const recaudadoSoles = pagosValidados * 250;

    // Career-wise chart metrics
    const careerCounts: { [key in ProgramId]?: number } = {};
    enrollments.forEach((e) => {
      if (e.academicStatus === "MATRICULADO") {
        careerCounts[e.programId] = (careerCounts[e.programId] || 0) + 1;
      }
    });

    return {
      totalMatriculados,
      totalAdmitidos,
      pagosValidados,
      recaudadoSoles,
      careerCounts
    };
  }, [enrollments]);

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

      {/* Module Horizontal Sub-Navigation */}
      <div className="bg-slate-100 p-2 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 custom-scrollbar">
        <button
          onClick={() => { setActiveSubTab("estudiantes"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "estudiantes" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> 1. Gestión Estudiantes
        </button>
        <button
          onClick={() => { setActiveSubTab("matricula_gral"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "matricula_gral" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> 2. Matrícula General
        </button>
        <button
          onClick={() => { setActiveSubTab("pagos"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "pagos" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> 3. Pagos de Matrícula
        </button>
        <button
          onClick={() => { setActiveSubTab("notas"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "notas" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> 4. Gestión de Notas
        </button>
        <button
          onClick={() => { setActiveSubTab("asistencias"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "asistencias" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> 5. Asistencias
        </button>
        <button
          onClick={() => { setActiveSubTab("historial"); setSearchQuery(""); if (processedStudents.length > 0 && !selectedHistoryDni) { setSelectedHistoryDni(processedStudents[0].dni); } }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "historial" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> 6. Historial Académico
        </button>
        <button
          onClick={() => { setActiveSubTab("constancias"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "constancias" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> 7. Constancias y Certificados
        </button>
        <button
          onClick={() => { setActiveSubTab("reportes"); setSearchQuery(""); }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeSubTab === "reportes" 
              ? "bg-[#9F062A] text-white shadow-md shadow-[#9F062A]/20" 
              : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> 8. Reportes Estadísticos
        </button>
      </div>

      <CardContent className="p-6">
        
        {/* ==================== TAB 1: GESTIÓN DE ESTUDIANTES ==================== */}
        {activeSubTab === "estudiantes" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiante por DNI, Nombre o Correo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#9F062A] bg-slate-50/50"
                />
              </div>
              <Button
                onClick={() => setShowAddStudentModal(true)}
                className="w-full md:w-auto bg-[#9F062A] hover:bg-[#820522] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar Nuevo Estudiante
              </Button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">DNI</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Carrera Técnica</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Contacto</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado Académico</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-wide">
                          No se encontraron registros de estudiantes con ese criterio.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-4 py-3.5">
                            <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                            <div className="text-[10px] text-slate-450 font-medium">{st.email}</div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">{st.dni}</td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-slate-800 text-[11px] block">
                              {ACADEMIC_PROGRAMS.find(p => p.id === st.programId)?.name || st.programId}
                            </span>
                            <span className="text-[9px] text-[#9F062A] font-black uppercase bg-red-50 px-1.5 py-0.5 rounded">
                              Turno: {st.shift}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-700">{st.phone || "Sin Teléfono"}</div>
                            <div className="text-[9.5px] text-slate-450 font-medium">Distrito: {st.district}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            {st.academicStatus === "MATRICULADO" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px] uppercase tracking-wide">
                                <CircleDot className="w-2.5 h-2.5 animate-pulse" /> Matriculado Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px] uppercase tracking-wide">
                                ADMITIDO (PENDIENTE MATRÍCULA)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(st.dni)}
                                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold tracking-wide uppercase text-[10px] rounded transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Ficha
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st.dni)}
                                className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded transition-all cursor-pointer"
                                title="Dar de baja"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: MATRÍCULA GENERAL ==================== */}
        {activeSubTab === "matricula_gral" && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-extrabold uppercase">Reglas de Operación de Matrícula General (MGE)</p>
                <p className="font-medium mt-0.5">
                  Los ingresantes admitidos ordinariamente por la oficina de admisión pueden ser activados al estado de <b>MATRICULADO</b> de forma individual. Aquí se puede asignar el turno institucional (Mañana, Tarde o Noche) y corregir la carrera técnica seleccionada.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado Matrícula</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Asignación Carrera</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Asignación de Turno</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Interruptores de Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {processedStudents.map((st) => {
                      return (
                        <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-4 py-3.5">
                            <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                            <div className="text-[10px] font-mono font-bold text-slate-500">DNI: {st.dni}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            {st.academicStatus === "MATRICULADO" ? (
                              <Badge variant="success">MATRICULADO ACTIVO</Badge>
                            ) : st.paymentStatus === "Validado" ? (
                              <Badge variant="warning" className="bg-sky-100 text-sky-850 border-sky-300">PENDIENTE A MATRICULAR</Badge>
                            ) : (
                              <Badge variant="warning">SOLO ADMITIDO</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={st.programId}
                              onChange={(e) => handleEnrollmentCareerChange(st.dni, e.target.value as ProgramId)}
                              className="p-1 px-2 border border-slate-250 bg-white font-bold rounded-lg text-slate-850 text-xs focus:outline-none"
                            >
                              {ACADEMIC_PROGRAMS.map((program) => (
                                <option key={program.id} value={program.id}>
                                  {program.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex gap-1.5">
                              {(["Mañana", "Tarde", "Noche"] as const).map((shiftOpt) => (
                                <button
                                  key={shiftOpt}
                                  onClick={() => handleEnrollmentShiftChange(st.dni, shiftOpt)}
                                  className={`px-2 py-1 text-[9px] font-black uppercase rounded transition-all cursor-pointer ${
                                    st.shift === shiftOpt
                                      ? "bg-[#9F062A] text-white"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-650"
                                  }`}
                                >
                                  {shiftOpt}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              onClick={() => handleToggleAcademicStatus(st.dni)}
                              className={`text-[9.5px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg ${
                                st.academicStatus === "MATRICULADO"
                                  ? "bg-slate-100 hover:bg-red-50 text-red-650 hover:text-red-750"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {st.academicStatus === "MATRICULADO" ? "Anular Matrícula" : "Matricular Alumno"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: PAGOS DE MATRÍCULA ==================== */}
        {activeSubTab === "pagos" && (
          <div className="space-y-6">
            <div className="bg-slate-100 p-4 border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#9F062A]" />
                Auditoría Financiera de Matrículas Semestrales
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                Cada estudiante que se matricula en el semestre regular debe registrar su voucher de pago (S/. 250). Los directivos verifican los números de operación bancaria con el extracto bancario de la cuenta institucional del IESTP.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Concepto de Pago</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Operación N°</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado de Validación</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Acciones Directas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {processedStudents.map((st) => {
                      return (
                        <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-4 py-3.5">
                            <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold">DNI: {st.dni}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-700">Derecho de Matrícula 2026-I</div>
                            <div className="text-[10px] text-emerald-600 font-black uppercase">Monto: S/. 250.00</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-slate-800 font-bold block">
                              {st.enrolled && enrollments.find(e => e.studentDni === st.dni)?.paymentOperation 
                                ? enrollments.find(e => e.studentDni === st.dni)?.paymentOperation 
                                : "OP-" + (904800 + Math.floor(Math.random() * 5000))
                              }
                            </span>
                            <span className="text-[9px] text-slate-450 italic font-medium">Bco. de la Nación / Ventanilla</span>
                          </td>
                          <td className="px-4 py-3.5">
                            {st.paymentStatus === "Validado" ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px] uppercase">
                                Validado
                              </span>
                            ) : st.paymentStatus === "Observado" ? (
                              <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 font-bold text-[10px] uppercase">
                                Observado
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px] uppercase">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdatePaymentStatus(st.dni, "Validado")}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Validar
                              </button>
                              <button
                                onClick={() => handleUpdatePaymentStatus(st.dni, "Observado")}
                                className="px-2.5 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Observar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: GESTIÓN DE NOTAS ==================== */}
        {activeSubTab === "notas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Paso 1: Seleccione Asignatura / Curso
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setTemporaryGrades({}); // Reset grades
                  }}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code}) - {ACADEMIC_PROGRAMS.find(p=>p.id===course.career)?.name || course.career}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  Paso 2: Unidad / Criterio de Evaluación
                </label>
                <select
                  value={selectedTaskTitle}
                  onChange={(e) => {
                    setSelectedTaskTitle(e.target.value);
                    setTemporaryGrades({});
                  }}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
                >
                  <option value="Evaluación Final">Examen / Evaluación de Final del Módulo</option>
                  <option value="Práctica de Laboratorio 1">Práctica Práctica de Laboratorio N° 01</option>
                  <option value="Avance Proyecto Integrador">Proyecto Integrador Modular</option>
                  <option value="Constancia Portafolio">Presentación de Portafolio de Evidencias</option>
                </select>
              </div>
            </div>

            {activeCourseObj && (
              <div className="border border-slate-205 rounded-xl bg-white overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 text-white flex justify-between items-center">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-450 uppercase block text-[9px] tracking-widest">Registrando Notas de:</span>
                    <span className="font-extrabold text-white text-xs block">{activeCourseObj.name} ({activeCourseObj.code})</span>
                  </div>
                  <Button
                    onClick={handleSaveGrades}
                    className="bg-[#9F062A] hover:bg-[#820522] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2"
                  >
                    Guardar Todas las Notas
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Carrera</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Nota Existente</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider" style={{ width: "200px" }}>Nueva Nota (Escala 0 al 20)</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {studentsInActiveCourse.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-extrabold uppercase">
                            No hay alumnos matriculados en la carrera de este curso ({activeCourseObj.career}) para calificar.
                          </td>
                        </tr>
                      ) : (
                        studentsInActiveCourse.map((st) => {
                          const existingScore = currentGradesForTask[st.dni];
                          const currentTemp = temporaryGrades[st.dni];
                          const scoreToEvaluate = currentTemp !== undefined ? currentTemp : (existingScore ?? 12);
                          
                          return (
                            <tr key={st.dni} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3">
                                <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                                <div className="text-[10px] font-mono text-slate-500">DNI: {st.dni}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-650 tracking-wide text-[11px]">
                                  {ACADEMIC_PROGRAMS.find(p=>p.id===st.programId)?.name}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-bold font-mono">
                                {existingScore !== undefined ? `${existingScore} / 20` : "Sin nota registrada"}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="20"
                                  placeholder="Escriba de 00 a 20"
                                  value={currentTemp !== undefined ? currentTemp : ""}
                                  onChange={(e) => handleGradeChange(st.dni, e.target.value)}
                                  className="w-32 px-3 py-1.5 border border-slate-250 bg-slate-50 text-slate-800 font-black font-mono text-xs rounded focus:outline-[#9F062A]"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                {scoreToEvaluate >= 13 ? (
                                  <span className="font-black text-emerald-600 block uppercase tracking-wider text-[11px]">
                                    Aprobado ({scoreToEvaluate})
                                  </span>
                                ) : (
                                  <span className="font-black text-red-650 block uppercase tracking-wider text-[11px]">
                                    Desaprobado ({scoreToEvaluate})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 5: GESTIÓN DE ASISTENCIAS ==================== */}
        {activeSubTab === "asistencias" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  1. Curso / Turno Evaluado:
                </label>
                <select
                  value={selectedAttendanceCourseId}
                  onChange={(e) => setSelectedAttendanceCourseId(e.target.value)}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                  2. Fecha Registrada:
                </label>
                <input
                  type="date"
                  value={selectedAttendanceDate}
                  onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                  className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#9F062A]" />
                  Control de Asistencia del {selectedAttendanceDate}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleFillAttendanceAllMock("Presente")}
                    className="px-2.5 py-1 bg-emerald-650 hover:bg-emerald-700 text-white rounded text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Marcar Todos Presentes
                  </button>
                  <button
                    onClick={() => handleFillAttendanceAllMock("Falta")}
                    className="px-2.5 py-1 bg-red-650 hover:bg-red-750 text-white rounded text-[10px] uppercase font-bold cursor-pointer"
                  >
                    Marcar Todos Faltas
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">DNI</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado de Asistencia</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Acción de Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {studentsInAttendanceCourse.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-extrabold uppercase">
                          No hay alumnos asignados a la carrera vinculada a esta asignatura curricular.
                        </td>
                      </tr>
                    ) : (
                      studentsInAttendanceCourse.map((st) => {
                        const currentStatus = activeAttendanceRecord?.statusMap[st.dni] || "Presente";
                        return (
                          <tr key={st.dni} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-extrabold text-slate-900">
                              {st.lastName}, {st.name}
                            </td>
                            <td className="px-4 py-3 font-bold font-mono text-slate-700">{st.dni}</td>
                            <td className="px-4 py-3">
                              {currentStatus === "Presente" && (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-black uppercase text-[9.5px]">Presente</span>
                              )}
                              {currentStatus === "Tardanza" && (
                                <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 font-black uppercase text-[9.5px]">Tardanza</span>
                              )}
                              {currentStatus === "Falta" && (
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-black uppercase text-[9.5px]">Falta de Asistencia</span>
                              )}
                              {currentStatus === "Justificado" && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-black uppercase text-[9.5px]">Justificado</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                {(["Presente", "Tardanza", "Falta", "Justificado"] as const).map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => handleUpdateStudentAttendance(st.dni, opt)}
                                    className={`px-2 py-1 text-[9px] font-black rounded uppercase transition-all cursor-pointer ${
                                      currentStatus === opt
                                        ? "bg-slate-800 text-white"
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: HISTORIAL ACADÉMICO ==================== */}
        {activeSubTab === "historial" && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Seleccione Estudiante para revisar su Récord Consolidado:
                </label>
                <select
                  value={selectedHistoryDni}
                  onChange={(e) => setSelectedHistoryDni(e.target.value)}
                  className="p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
                >
                  <option value="">-- Seleccionar Estudiante --</option>
                  {processedStudents.map((st) => (
                    <option key={st.dni} value={st.dni}>
                      {st.lastName}, {st.name} (DNI: {st.dni})
                    </option>
                  ))}
                </select>
              </div>

              {activeHistoryStudent && (
                <button
                  onClick={() => triggerNotification(`Simulación de descarga del Récord de Notas en PDF para el alumno ${activeHistoryStudent.name} ${activeHistoryStudent.lastName}. Documento digital firmado.`)}
                  className="self-start sm:self-center px-4 py-2.5 bg-[#9F062A] hover:bg-[#820522] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir Boleta Consolidada
                </button>
              )}
            </div>

            {activeHistoryStudent ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual student profile card card */}
                <div className="lg:col-span-1 border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-3xs space-y-4">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <div className="w-16 h-16 bg-[#9F062A] text-white rounded-full flex items-center justify-center mx-auto text-xl font-black mb-3">
                      {activeHistoryStudent.name[0]}{activeHistoryStudent.lastName[0]}
                    </div>
                    <h4 className="font-extrabold text-[#9F062A] uppercase tracking-wide">
                      {activeHistoryStudent.name} {activeHistoryStudent.lastName}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 font-mono">DNI: {activeHistoryStudent.dni}</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[9.5px] font-black uppercase text-slate-450 block">Programa Curricular:</span>
                      <span className="font-bold text-slate-800">
                        {ACADEMIC_PROGRAMS.find(p=>p.id===activeHistoryStudent.programId)?.name || activeHistoryStudent.programId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-black uppercase text-slate-450 block">Correo Institucional:</span>
                      <span className="font-bold text-slate-800 font-mono">{activeHistoryStudent.email}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-black uppercase text-slate-450 block">Estado Actual:</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase border border-emerald-150">
                        Regular Matriculado
                      </span>
                    </div>
                    <div>
                      <span className="text-[9.5px] font-black uppercase text-slate-450 block">Turno:</span>
                      <span className="font-bold text-slate-800">{activeHistoryStudent.shift}</span>
                    </div>
                  </div>
                </div>

                {/* Performance overview of course academic history grades */}
                <div className="lg:col-span-2 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-3xs">
                  <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
                    <span className="text-xs font-black uppercase tracking-wider">Historial Escolar de Clases</span>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">PROMEDIO PONDERADO</span>
                      <span className="text-sm font-black font-mono text-emerald-400">{activeHistoryWeightedAverage} / 20</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activeHistoryGradesList.map((c, i) => (
                      <div key={i} className="p-4 flex justify-between items-center text-xs hover:bg-slate-50/50 transition-all">
                        <div>
                          <div className="font-bold text-slate-900">{c.courseName}</div>
                          <div className="text-[10px] text-slate-450 font-bold font-mono">Código: {c.code} · Créditos: {c.credits}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black font-mono text-slate-800 bg-slate-100 px-2.5 py-1 rounded text-center min-w-[50px]">
                            {c.grade}
                          </span>
                          {c.status === "Aprobado" ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px]">Aprobado</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold uppercase text-[9px]">Reprobado</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-440 font-bold uppercase">
                Por favor seleccione un alumno de la lista para renderizar su récord de notas.
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 7: CONSTANCIAS Y CERTIFICADOS ==================== */}
        {activeSubTab === "constancias" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black uppercase text-slate-800">
                  Gestión y Solicitudes de Certificados Escolares
                </h4>
                <p className="text-[10.5px] font-semibold text-slate-450">
                  Registre o tramite certificados de estudios modulares completos o constancias de egresado oficiales.
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  id="add-grad-student"
                  className="p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleCreateGraduationProcess(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="" disabled>-- Aperturar para un estudiante --</option>
                  {processedStudents.map(st => (
                    <option key={st.dni} value={st.dni}>{st.lastName}, {st.name} ({st.dni})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-slate-205 rounded-xl overflow-hidden bg-white shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Trámite Académico</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Requisitos Presentados</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado de Trámite</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Firma & Emisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {graduations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-bold uppercase">
                          No hay solicitudes de certificados presentados en este periodo.
                        </td>
                      </tr>
                    ) : (
                      graduations.map((g) => {
                        const studentObj = studentsList[g.studentDni];
                        return (
                          <tr key={g.studentDni} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-4 py-3.5">
                              <div className="font-extrabold text-slate-900">
                                {studentObj ? `${studentObj.lastName}, ${studentObj.name}` : "Estudiante Desconocido"}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-slate-450 text-slate-400">DNI: {g.studentDni}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-800">Certificado Oficial de Egresado (Módulos Completos)</div>
                              {g.obs && <p className="text-[9px] text-[#9F062A] font-medium leading-normal italic mt-0.5">* Obs: {g.obs}</p>}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.solicitud ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Sol.</span>
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.constanciaEgresado ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Const. Mod.</span>
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.practicasPre ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Prácticas Pre.</span>
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.pagoDerecho ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Pago Der.</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              {g.status === "Certificado Emitido" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-extrabold text-[9.5px] uppercase">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 block" /> EMITIDO FIRMADO
                                </span>
                              ) : g.status === "Solicitado" ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-bold uppercase text-[9.5px]">
                                  SOLICITADO / REVISIÓN
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-bold uppercase text-[9.5px]">
                                  {g.status}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleIssuerUpdate(g.studentDni, true)}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Emitir
                                </button>
                                <button
                                  onClick={() => handleIssuerUpdate(g.studentDni, false)}
                                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-wider rounded transition-all cursor-pointer"
                                  title="Observar"
                                >
                                  Observar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 8: REPORTES ESTADÍSTICOS ==================== */}
        {activeSubTab === "reportes" && (
          <div className="space-y-6">
            
            {/* Cards Overview Stats panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-slate-150 shadow-3xs p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Matriculados Activos</p>
                    <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">{statsOverview.totalMatriculados}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-[#9F062A]" />
                </div>
              </Card>

              <Card className="border border-slate-150 shadow-3xs p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Pre-Inscritos / Admitidos</p>
                    <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">{statsOverview.totalAdmitidos}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </Card>

              <Card className="border border-slate-150 shadow-3xs p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Recibos de Matrícula</p>
                    <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">{statsOverview.pagosValidados}</p>
                  </div>
                  <CheckSquare className="w-8 h-8 text-emerald-600" />
                </div>
              </Card>

              <Card className="border border-slate-150 shadow-3xs p-4 bg-[#9F062A]/5 border-[#9F062A]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none text-[#9F062A]">Caja: Total Matriculación</p>
                    <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">S/. {statsOverview.recaudadoSoles}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-[#9F062A]" />
                </div>
              </Card>
            </div>

            {/* Visual horizontal SVG Progress bar distributions of students by career */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="border border-slate-205 rounded-xl p-5 bg-white space-y-4 shadow-3xs">
                <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#9F062A]" /> 
                  Matrícula por Especialidades Profesionales
                </h4>
                
                <div className="space-y-3.5">
                  {ACADEMIC_PROGRAMS.map((prog) => {
                    const count = statsOverview.careerCounts[prog.id] || 0;
                    const maxCount = Math.max(...(Object.values(statsOverview.careerCounts) as number[]), 1);
                    const percentage = Math.round((count / maxCount) * 100);

                    return (
                      <div key={prog.id} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span className="truncate text-[11px] block">{prog.name}</span>
                          <span className="font-mono">{count} Alum.</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#9F062A] h-2 rounded-full transition-all"
                            style={{ width: `${percentage || 5}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendance and system compliance metrics */}
              <div className="border border-slate-205 rounded-xl p-5 bg-white space-y-4 shadow-3xs flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#9F062A]" /> 
                    Tasa de Asistencia General Promedio
                  </h4>
                  <p className="text-[11px] text-slate-450 font-semibold leading-relaxed mt-1">
                    Control de cumplimiento en horas pedagógicas efectivas según los lineamientos del Ministerio de Educación (MINEDU).
                  </p>
                </div>

                <div className="py-6 flex flex-col items-center justify-center space-y-2">
                  <span className="text-5xl font-black font-mono text-[#9F062A]">94.8%</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Nivel Óptimo (Supera el 85% Minedu)
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Reportes Pendientes</span>
                    <span className="font-bold text-slate-700">03 Mapeos de Aula</span>
                  </div>
                  <button
                    onClick={() => triggerNotification("Generando Reporte Estadístico Integrado Semestral en Excel para su exportación a la UGEL...")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10.5px] font-extrabold uppercase rounded-lg cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar Consolidado
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </CardContent>

      {/* ==================== MODAL: REGISTRAR NUEVO ESTUDIANTE ==================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-105 max-w-2xl w-full overflow-hidden transform scale-100 transition-all max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9F062A]" /> Registrar Estudiante Directo
              </h3>
              <button 
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-5 text-xs text-slate-750">
              
              {/* Personal details container block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI (8 dígitos) *</label>
                  <input
                    type="text"
                    maxLength={8}
                    required
                    value={studentForm.dni}
                    onChange={(e) => setStudentForm({ ...studentForm, dni: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                    placeholder="Escriba DNI..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                    placeholder="Nombre del alumno..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                    placeholder="Apellidos institucionales..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">F. de Nacimiento</label>
                  <input
                    type="date"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Género</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                    placeholder="999-999-999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Email Institucional *</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                    placeholder="estudiante@is-sanfrancisco.edu.pe"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Dirección Completa</label>
                  <input
                    type="text"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]"
                    placeholder="Av. Los Ruiseñores Nro 120"
                  />
                </div>
              </div>

              {/* Program and shift assignments */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block border-b border-slate-200 pb-1.5">
                  Asignación Curricular de Vacante
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Programa Profesional</label>
                    <select
                      value={studentForm.programId}
                      onChange={(e) => setStudentForm({ ...studentForm, programId: e.target.value as ProgramId })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                    >
                      {ACADEMIC_PROGRAMS.map(prog => (
                        <option key={prog.id} value={prog.id}>{prog.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Turno Asignado</label>
                    <select
                      value={studentForm.shift}
                      onChange={(e) => setStudentForm({ ...studentForm, shift: e.target.value as any })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block border-b border-slate-200 pb-1.5">
                  Caso de Emergencia y Contacto
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={studentForm.emergencyName}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyName: e.target.value })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                      placeholder="Nombre del apoderado..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={studentForm.emergencyPhone}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyPhone: e.target.value })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                      placeholder="999-000-111"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Relación / Parentesco</label>
                    <input
                      type="text"
                      value={studentForm.emergencyRelation}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyRelation: e.target.value })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                      placeholder="Ej. Padre / Hno"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#9F062A] hover:bg-[#820522] text-white font-bold uppercase tracking-wider transition-all shadow-md shadow-[#9F062A]/20 cursor-pointer"
                >
                  Registrar & Matricular
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EXAMINAR / EDITAR FICHA DE ESTUDIANTE ==================== */}
      {showEditStudentModal && editingStudentDni && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-105 max-w-2xl w-full overflow-hidden transform scale-100 transition-all max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#9F062A]" /> Ficha Integral del Alumno (Modificar)
              </h3>
              <button 
                onClick={() => { setShowEditStudentModal(false); setEditingStudentDni(null); }}
                className="text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="p-6 space-y-5 text-xs text-slate-750">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Apellidos</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Género</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">F. Nacimiento</label>
                  <input
                    type="date"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Correo Institucional</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Dirección actual</label>
                  <input
                    type="text"
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                    className="w-full p-2 border border-slate-250 bg-slate-50 font-bold rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block border-b border-slate-200 pb-1.5">
                  Carrera & Turno Asignado
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Programa</label>
                    <select
                      value={studentForm.programId}
                      onChange={(e) => setStudentForm({ ...studentForm, programId: e.target.value as ProgramId })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none text-slate-800"
                    >
                      {ACADEMIC_PROGRAMS.map(prog => (
                        <option key={prog.id} value={prog.id}>{prog.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Turno</label>
                    <select
                      value={studentForm.shift}
                      onChange={(e) => setStudentForm({ ...studentForm, shift: e.target.value as any })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none text-slate-800"
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block border-b border-slate-200 pb-1.5">
                  Contacto de Emergencia
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Apoderado</label>
                    <input
                      type="text"
                      value={studentForm.emergencyName}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyName: e.target.value })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={studentForm.emergencyPhone}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyPhone: e.target.value })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Relación</label>
                    <input
                      type="text"
                      value={studentForm.emergencyRelation}
                      onChange={(e) => setStudentForm({ ...studentForm, emergencyRelation: e.target.value })}
                      className="w-full p-2 border border-slate-250 bg-white font-bold rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditStudentModal(false); setEditingStudentDni(null); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Guardar Datos
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </Card>
  );
}

