/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = "portal" | "postulante" | "alumno" | "docente" | "administrador" | "mpa" | "mge" | "maf";

export type ProgramId = 
  | "sistemas" 
  | "administracion" 
  | "contabilidad" 
  | "enfermeria" 
  | "electronica" 
  | "mecanica";

export interface Program {
  id: ProgramId;
  name: string;
  description: string;
  duration: string;
  courses: string[];
}

export interface Applicant {
  id?: string;
  uid?: string;
  applicantCode: string;
  dni: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  programId: ProgramId;
  paymentStatus: "No Pagado" | "Pendiente" | "Validado" | "Rechazado" | "Observado";
  paymentOperation?: string;
  paymentObservations?: string;
  paymentType?: "number" | "voucher";
  paymentVoucherUrl?: string;
  paymentVoucherFileName?: string;
  examStatus: "No Programado" | "Programado" | "Rindiendo" | "Finalizado";
  examScore?: number;
  examClassroom?: string;
  admitted: boolean | "PENDIENTE" | "ADMITIDO" | "NO ADMITIDO";
  docs?: {
    dniFile: StudentDoc;
    certificadoFile: StudentDoc;
    partidaFile?: StudentDoc;
    fotoFile: StudentDoc;
  };
  periodId: string;
  folderStatus: "Pending" | "Observed" | "Approved" | "Enrolled";
  folderObservations?: string;
  password?: string;
  registeredAt?: string;
  paymentValidatedAt?: string;
  folderApprovedAt?: string;
  supportMessages?: {
    id: string;
    sender: "postulante" | "admin";
    category?: string;
    text: string;
    date: string;
  }[];
}

export type FileVerifyStatus = "No Enviado" | "Pendiente" | "Validado" | "Observado";

export interface StudentDoc {
  status: FileVerifyStatus;
  fileName?: string;
  observations?: string;
  fileDataUrl?: string;
}

export interface StudentPersonalData {
  dni: string;
  birthDate: string;
  name: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
}

export interface Enrollment {
  studentDni: string;
  programId: ProgramId;
  academicStatus: "ADMITIDO" | "MATRICULADO";
  docs: {
    dniFile: StudentDoc;
    certificadoFile: StudentDoc;
    partidaFile: StudentDoc;
    fotoFile: StudentDoc;
  };
  paymentStatus: "No Pagado" | "Pendiente" | "Validado" | "Observado";
  paymentOperation?: string;
  paymentType?: "number" | "voucher";
  paymentVoucherUrl?: string;
  paymentVoucherFileName?: string;
  paymentObservations?: string;
  updatedAt?: string;
  shift?: "Mañana" | "Tarde" | "Noche";
  groupId?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  classroom: string;
  schedule: string;
  teacherDni: string;
  career?: string;
  group?: string;
  curriculum?: string;
  startDate?: string;
  endDate?: string;
  studentCount?: number;
  description?: string;
  cycle?: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  date: string;
  fileName: string;
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  submissions: {
    studentDni: string;
    studentName: string;
    fileName: string;
    submitDate: string;
    grade?: number; // scale 0-20
  }[];
}

export interface CourseEvaluation {
  id: string;
  courseId: string;
  title: string;
  questionsCount: number;
  durationMinutes: number;
  grades: {
    studentDni: string;
    score: number;
    date: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  statusMap: { [studentDni: string]: "Presente" | "Tardanza" | "Falta" | "Justificado" };
}

export interface CycleStatus {
  cycleNumber: number;
  year: number;
  status: "Aprobado" | "Pendiente" | "Observado";
  average: number;
  credits: number;
  courses: { name: string; grade: number; approved: boolean }[];
  obs?: string;
}

export interface Graduation {
  studentDni: string;
  status: "Solicitado" | "En Proceso" | "Apto" | "No Apto" | "Certificado Emitido";
  step: "Solicitud" | "Revision Documental" | "Emision";
  docsChecked: {
    solicitud: boolean;
    constanciaEgresado: boolean;
    practicasPre: boolean;
    pagoDerecho: boolean;
  };
  obs?: string;
}

export interface Classroom {
  id: string;
  name: string;
  location: string;
  floor: number;
  capacity: number;
}

export interface Teacher {
  dni: string;
  name: string;
  lastName: string;
  email: string;
  specialty: string;
  specialties?: string[];
  status?: "Disponible" | "Licencia" | "Inactivo";
}

export interface AdmissionPeriod {
  id: string;
  name: string;
  isActive: boolean;
  status: "PENDIENTE" | "APERTURADO" | "EXAMEN" | "MATRICULA" | "CERRADO";
  preEnrollmentStartDate: string;
  preEnrollmentEndDate: string;
  admissionDate: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  classesStartDate: string;
  resultsPublicationDate?: string;
  academicPeriodId?: string;
}

export interface MpaPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status?: "Planificación" | "Activo" | "Cerrado";
}

export interface MpaCareer {
  id: string;
  name: string;
  code: string;
  durationSemesters: number;
  description?: string;
  status?: "Activo" | "Inactivo";
}

export interface MpaCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  theoryHours?: number;
  labHours?: number;
  status?: "Activo" | "Inactivo";
  careerId?: string;
  referenceCycle?: number;
  type?: "General" | "Especialidad";
}

export interface MpaCurriculumItem {
  id: string;
  careerId: string;
  courseId: string;
  cycle: number;
  versionId?: string;
}

export interface MpaShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface MpaSchedule {
  id: string;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
  timeSlot: string;
  shiftId?: string;
}

export interface MpaClassroom {
  id: string;
  name: string;
  type: "Teoría" | "Laboratorio";
  location: string;
  capacity: number;
  careerId?: string;
}

export interface MpaAcademicGroup {
  id: string;
  name: string;
  periodId: string;
  careerId: string;
  cycle: number;
  shiftId: string;
  capacity: number;
  curriculumVersionId?: string;
}

export interface MpaProgramTask {
  id: string;
  groupId: string;
  courseId: string;
  teacherDni: string;
  classroomId: string;
  scheduleId?: string;
  sessionType: "Teoría" | "Laboratorio";
  grpNum?: string;
  subGrpNum?: string;
  sessionClassType?: "Teo" | "Lab" | "Tal";
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  shiftId?: string;
  pedagogicalHours?: number;
}


