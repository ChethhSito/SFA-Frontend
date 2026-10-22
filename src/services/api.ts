import { Applicant, Enrollment, AdmissionPeriod, Course, Teacher, Graduation, SystemUser } from "../types";
import { sendWelcomeEmailBrevo } from "../firebase/emailService";
import { auth } from "../firebase/config";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:3001";

/**
 * Generic fetch wrapper handling HTTP errors gracefully with logging.
 */
async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    let authorization: Record<string, string> = {};
    if ((endpoint.startsWith("/graduations") || endpoint.startsWith("/certificates")) && auth) {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      if (token) authorization = { Authorization: `Bearer ${token}` };
    }
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
        ...authorization,
      },
    });

    if (!res.ok) {
      console.warn(`[API] Endpoint ${endpoint} returned status ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[API Network Error] Could not connect to ${API_BASE_URL}${endpoint}:`, error);
    return null;
  }
}

/* ==========================================================================
   1. APPLICANTS (Admisión & Postulantes)
   ========================================================================== */

export async function fetchApplicants(): Promise<Applicant[] | null> {
  const list = await fetchJson<any[]>("/applicants");
  if (!list) return null;
  return list.map((item) => ({
    ...item,
    id: item.id || item._id
  })) as Applicant[];
}

export async function fetchApplicantByDni(dni: string): Promise<Applicant | null> {
  const item = await fetchJson<any>(`/applicants/${dni}`);
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as Applicant;
}

export async function createApplicant(applicant: Partial<Applicant>): Promise<Applicant | null> {
  const item = await fetchJson<any>("/applicants", {
    method: "POST",
    body: JSON.stringify(applicant)
  });
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as Applicant;
}

export async function updateApplicant(dni: string, data: Partial<Applicant>): Promise<Applicant | null> {
  let item = await fetchJson<any>(`/applicants/${dni}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  if (!item) {
    item = await fetchJson<any>(`/applicants/${dni}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as Applicant;
}

export async function deleteApplicant(dni: string): Promise<boolean> {
  const result = await fetchJson<{ success: boolean }>(`/applicants/${dni}`, {
    method: "DELETE"
  });
  return !!result;
}

/* ==========================================================================
   2. ENROLLMENTS (Matrículas y Expedientes)
   ========================================================================== */

export async function fetchEnrollments(): Promise<Enrollment[] | null> {
  const list = await fetchJson<any[]>("/enrollments");
  if (!list) return null;
  return list.map((item) => ({
    ...item,
    id: item.id || item._id
  })) as Enrollment[];
}

export async function createEnrollment(enrollment: Partial<Enrollment>): Promise<Enrollment | null> {
  return fetchJson<Enrollment>("/enrollments", {
    method: "POST",
    body: JSON.stringify(enrollment)
  });
}

export async function updateEnrollment(studentDni: string, data: Partial<Enrollment>): Promise<Enrollment | null> {
  return fetchJson<Enrollment>(`/enrollments/${studentDni}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   3. ADMISSION PERIODS (Periodos de Admisión)
   ========================================================================== */

export async function fetchAdmissionPeriods(): Promise<AdmissionPeriod[] | null> {
  const list = await fetchJson<any[]>("/admission-periods");
  if (!list) return null;
  return list.map((item) => ({
    ...item,
    id: item.id || item._id
  })) as AdmissionPeriod[];
}

export async function createAdmissionPeriod(period: Partial<AdmissionPeriod>): Promise<AdmissionPeriod | null> {
  const item = await fetchJson<any>("/admission-periods", {
    method: "POST",
    body: JSON.stringify(period)
  });
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as AdmissionPeriod;
}

export async function updateAdmissionPeriod(id: string, data: Partial<AdmissionPeriod>): Promise<AdmissionPeriod | null> {
  const item = await fetchJson<any>(`/admission-periods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as AdmissionPeriod;
}

export async function deleteAdmissionPeriod(id: string): Promise<boolean> {
  const result = await fetchJson<{ success: boolean }>(`/admission-periods/${id}`, { method: "DELETE" });
  return result?.success === true;
}

/* ==========================================================================
   4. COURSES (Catálogo de Cursos)
   ========================================================================== */

export async function fetchCourses(): Promise<Course[] | null> {
  const [classroomCourses, catalogCourses] = await Promise.all([
    fetchJson<any[]>("/courses"), fetchJson<any[]>("/mpa/courses"),
  ]);
  if (!classroomCourses && !catalogCourses) return null;
  const catalogByCode = new Map((catalogCourses || []).map((course) => [course.code, course]));
  const byCode = new Map((classroomCourses || []).map((course) => [course.code, {
    ...course, careerId: course.careerId || catalogByCode.get(course.code)?.careerId,
  }]));
  for (const course of catalogCourses || []) {
    if (!byCode.has(course.code)) byCode.set(course.code, course);
  }
  return [...byCode.values()].map((item) => ({ ...item, id: item.id || item._id || item.code })) as Course[];
}

export async function createCourse(course: Partial<Course>): Promise<Course | null> {
  return fetchJson<Course>("/courses", {
    method: "POST",
    body: JSON.stringify(course)
  });
}

export async function updateCourse(code: string, data: Partial<Course>): Promise<Course | null> {
  return fetchJson<Course>(`/courses/${code}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   5. TEACHERS (Docentes)
   ========================================================================== */

export async function fetchTeachers(): Promise<Teacher[] | null> {
  let list = await fetchJson<any[]>("/teachers");
  if (!list || list.length === 0) {
    list = await fetchJson<any[]>("/mpa/teachers");
  }
  if (!list) return null;
  return list.map((item) => ({
    ...item,
    id: item.id || item._id || item.dni
  })) as Teacher[];
}

export async function createTeacher(teacher: Partial<Teacher>): Promise<Teacher | null> {
  return fetchJson<Teacher>("/teachers", {
    method: "POST",
    body: JSON.stringify(teacher)
  });
}

export async function updateTeacher(dni: string, data: Partial<Teacher>): Promise<Teacher | null> {
  return fetchJson<Teacher>(`/teachers/${dni}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   6. GRADUATIONS (Egresados)
   ========================================================================== */

export async function fetchGraduations(): Promise<Graduation[] | null> {
  return fetchJson<Graduation[]>("/graduations");
}

export async function createGraduation(graduation: Partial<Graduation>): Promise<Graduation | null> {
  return fetchJson<Graduation>("/graduations", {
    method: "POST",
    body: JSON.stringify(graduation)
  });
}

export async function updateGraduation(studentDni: string, data: Partial<Graduation>): Promise<Graduation | null> {
  return fetchJson<Graduation>(`/graduations/${studentDni}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   7. TRANSACTIONAL EMAILS
   ========================================================================== */

export async function sendTransactionalWelcomeEmail(payload: {
  email: string;
  name?: string;
  applicantCode?: string;
  password?: string;
  url?: string;
  programName?: string;
  dni?: string;
}): Promise<boolean> {
  if (!payload.email || !payload.email.trim()) return false;
  return sendWelcomeEmailBrevo(payload.email.trim(), payload.name || "Postulante", {
    email: payload.email.trim(),
    applicantCode: payload.applicantCode,
    password: payload.password || "clave123",
    url: payload.url || `${window.location.origin}/ingresar`,
    programName: payload.programName,
    dni: payload.dni
  });
}

/* ==========================================================================
   8. SYSTEM USERS & ROLES (SuperAdmin & Gestión de Usuarios)
   ========================================================================== */

export async function fetchUsers(): Promise<SystemUser[] | null> {
  const list = await fetchJson<any[]>("/users");
  if (!list) return null;
  return list.map((item) => ({
    ...item,
    id: item.id || item._id
  })) as SystemUser[];
}

export async function createUser(user: Partial<SystemUser>): Promise<SystemUser | null> {
  const item = await fetchJson<any>("/users", {
    method: "POST",
    body: JSON.stringify(user)
  });
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as SystemUser;
}

export async function updateUser(id: string, data: Partial<SystemUser>): Promise<SystemUser | null> {
  const item = await fetchJson<any>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
  if (!item) return null;
  return {
    ...item,
    id: item.id || item._id
  } as SystemUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await fetchJson<{ success: boolean }>(`/users/${id}`, {
    method: "DELETE"
  });
  return !!result;
}

/* ==========================================================================
   9. PAYMENTS & FINANCE (Tesorería, Caja y Recaudación MAF)
   ========================================================================== */

export async function fetchPayments(): Promise<any[] | null> {
  return fetchJson<any[]>("/payments");
}

export async function createPayment(payment: any): Promise<any | null> {
  return fetchJson<any>("/payments", {
    method: "POST",
    body: JSON.stringify(payment)
  });
}

export async function updatePayment(id: string, data: any): Promise<any | null> {
  return fetchJson<any>(`/payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function deletePayment(id: string): Promise<boolean> {
  const result = await fetchJson<{ success: boolean }>(`/payments/${id}`, {
    method: "DELETE"
  });
  return !!result;
}

/* ==========================================================================
   10. STUDENTS & INTRANET ALUMNO (Legajo, Récord y Datos del Alumno)
   ========================================================================== */

export async function fetchStudents(): Promise<any[] | null> {
  return fetchJson<any[]>("/students");
}

export async function fetchStudentByDni(dni: string): Promise<any | null> {
  return fetchJson<any>(`/students/${dni}`);
}

export function setStudentActive(dni: string, active: boolean, reason?: string): Promise<any | null> {
  return fetchJson<any>(`/students/${encodeURIComponent(dni)}/status`, { method: "PATCH", body: JSON.stringify({ active, reason }) });
}

export async function updateStudentPersonalData(dni: string, data: any): Promise<any | null> {
  return fetchJson<any>(`/students/${dni}/personal-data`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function updateStudentCycleStatuses(dni: string, cycleStatuses: any[]): Promise<any | null> {
  return fetchJson<any>(`/students/${dni}/cycle-status`, {
    method: "PUT",
    body: JSON.stringify({ cycleStatuses })
  });
}

export async function updateStudentCourseGrade(dni: string, courseName: string, grade: number): Promise<any | null> {
  return fetchJson<any>(`/students/${dni}/course-grade`, {
    method: "PUT",
    body: JSON.stringify({ courseName, grade })
  });
}

/* ==========================================================================
   11. ATTENDANCE, MATERIALS, ASSIGNMENTS & CLASSROOMS (Docentes & Alumnos)
   ========================================================================== */

export async function fetchCourseAttendance(courseId?: string): Promise<any[] | null> {
  const list = await fetchJson<any[]>(courseId ? `/courses/attendance/${encodeURIComponent(courseId)}` : '/courses/attendance/list');
  return list?.map((record) => ({ ...record, id: record._id || record.id || `${record.courseId}-${record.date}` })) ?? null;
}

export async function saveCourseAttendance(courseId: string, date: string, statusMap: Record<string, string>, week?: number): Promise<any | null> {
  return fetchJson<any>(`/courses/attendance/${courseId}`, {
    method: "POST",
    body: JSON.stringify({ date, statusMap, week })
  });
}

export async function fetchCourseMaterials(courseId?: string): Promise<any[] | null> {
  const query = courseId ? `?courseId=${courseId}` : "";
  const list = await fetchJson<any[]>(`/courses/materials/list${query}`);
  return list?.map((item) => ({ ...item, id: item._id || item.id })) ?? null;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export function courseFileUrl(kind: 'materials' | 'evidences' | 'assignments', id: string): string {
  return `${API_BASE_URL}/courses/${kind}/${encodeURIComponent(id)}/file`;
}

export async function uploadCourseMaterial(material: { courseId: string; title: string; fileName: string; contentBase64: string; mimeType: string }): Promise<any | null> {
  return fetchJson<any>("/courses/materials/upload", {
    method: "POST",
    body: JSON.stringify(material)
  });
}

export async function deleteCourseMaterial(id: string): Promise<boolean> {
  return !!(await fetchJson<{ success: boolean }>(`/courses/materials/${encodeURIComponent(id)}`, { method: 'DELETE' }))?.success;
}

export async function fetchCourseEvidences(courseId: string, week: number): Promise<any[] | null> {
  const list = await fetchJson<any[]>(`/courses/evidences/list?courseId=${encodeURIComponent(courseId)}&week=${week}`);
  return list?.map((item) => ({ ...item, id: item._id || item.id })) ?? null;
}

export async function uploadCourseEvidence(evidence: { courseId: string; week: number; category: string; title: string; fileName: string; contentBase64: string; mimeType: string }): Promise<any | null> {
  return fetchJson<any>('/courses/evidences/upload', { method: 'POST', body: JSON.stringify(evidence) });
}

export async function deleteCourseEvidence(id: string): Promise<boolean> {
  return !!(await fetchJson<{ success: boolean }>(`/courses/evidences/${encodeURIComponent(id)}`, { method: 'DELETE' }))?.success;
}

export async function fetchCourseObservations(courseId: string, week: number): Promise<any[] | null> {
  const list = await fetchJson<any[]>(`/courses/observations/list?courseId=${encodeURIComponent(courseId)}&week=${week}`);
  return list?.map((item) => ({ ...item, id: item._id || item.id })) ?? null;
}

export async function createCourseObservation(observation: { courseId: string; week: number; type: string; text: string }): Promise<any | null> {
  return fetchJson<any>('/courses/observations', { method: 'POST', body: JSON.stringify(observation) });
}

export async function deleteCourseObservation(id: string): Promise<boolean> {
  return !!(await fetchJson<{ success: boolean }>(`/courses/observations/${encodeURIComponent(id)}`, { method: 'DELETE' }))?.success;
}

export async function fetchCourseAssignments(courseId?: string): Promise<any[] | null> {
  const query = courseId ? `?courseId=${courseId}` : "";
  const list = await fetchJson<any[]>(`/courses/assignments/list${query}`);
  return list?.map((item) => ({ ...item, id: item._id || item.id })) ?? null;
}

export async function updateCourseAssignment(id: string, assignment: any): Promise<any | null> {
  return fetchJson<any>(`/courses/assignments/${id}`, { method: 'PATCH', body: JSON.stringify(assignment) });
}

export async function deleteCourseAssignment(id: string): Promise<{ success: boolean } | null> {
  return fetchJson<{ success: boolean }>(`/courses/assignments/${id}`, { method: 'DELETE' });
}

export async function createCourseAssignment(assignment: { courseId: string; title: string; description: string; dueDate: string; attachment?: string; rubric?: string; contentBase64?: string; mimeType?: string }): Promise<any | null> {
  return fetchJson<any>("/courses/assignments/create", {
    method: "POST",
    body: JSON.stringify(assignment)
  });
}

export async function submitCourseAssignment(assignmentId: string, submission: { studentDni: string; studentName: string; fileName: string; submitDate: string; grade?: number }): Promise<any | null> {
  return fetchJson<any>(`/courses/assignments/${assignmentId}/submit`, {
    method: "POST",
    body: JSON.stringify(submission)
  });
}

export async function fetchClassroomsApi(): Promise<any[] | null> {
  return fetchJson<any[]>("/mpa/classrooms");
}

export async function saveClassroomsApi(classrooms: any[]): Promise<any | null> {
  return fetchJson<any>("/mpa/classrooms", {
    method: "PUT",
    body: JSON.stringify({ items: classrooms })
  });
}

export async function closeCourseGradesApi(courseCode: string, teacherDni: string): Promise<any | null> {
  return fetchJson<any>(`/courses/${courseCode}/close-grades`, {
    method: "POST",
    body: JSON.stringify({ teacherDni })
  });
}

/* ==========================================================================
   11. ANALYTICS & MACHINE LEARNING (Riesgo Académico IA)
   ========================================================================== */

export async function fetchAttritionRiskReport(): Promise<any | null> {
  return fetchJson<any>("/analytics/attrition-risk");
}

export async function referStudentToTutoring(studentDni: string, reason?: string): Promise<any | null> {
  return fetchJson<any>("/analytics/tutoring/refer", {
    method: "POST",
    body: JSON.stringify({ studentDni, reason })
  });
}

export interface TutoringReferral {
  studentDni: string;
  studentName: string;
  reason: string;
  registeredAt: string;
  readAt: string | null;
  status?: "PENDIENTE" | "EN_ATENCION" | "CERRADO";
  responsible?: string;
  revision?: number;
  closedAt?: string | null;
  history?: { status: string; note: string; responsible: string; date: string }[];
}

export function fetchTutoringReferrals(): Promise<TutoringReferral[] | null> {
  return fetchJson<TutoringReferral[]>("/analytics/tutoring/referrals");
}

export function markTutoringReferralRead(studentDni: string): Promise<TutoringReferral | null> {
  return fetchJson<TutoringReferral>(`/analytics/tutoring/referrals/${encodeURIComponent(studentDni)}/read`, { method: "PATCH" });
}

export function updateTutoringCase(dni: string, data: { status: string; responsible: string; note: string; revision: number }) {
  return fetchJson<TutoringReferral>(`/analytics/tutoring/referrals/${encodeURIComponent(dni)}/case`, { method: "PATCH", body: JSON.stringify(data) });
}

export interface AcademicAlert {
  key: string;
  studentDni: string;
  studentName: string;
  kind: "ASISTENCIA" | "NOTAS";
  level: "CRITICO" | "MODERADO";
  value: number;
  message: string;
  active: boolean;
  detectedAt: string;
  evaluatedAt: string;
  resolvedAt: string | null;
  resolutionReason?: "" | "RECUPERADO" | "SIN_DATOS" | "INACTIVO";
  readAt: string | null;
}
export function refreshAcademicAlerts() {
  return fetchJson<{ alerts: AcademicAlert[]; refreshedAt: string }>("/analytics/alerts/refresh", { method: "POST" });
}
export function readAcademicAlert(key: string, detectedAt: string) {
  return fetchJson<AcademicAlert>(`/analytics/alerts/${encodeURIComponent(key)}/read`, { method: "PATCH", body: JSON.stringify({ detectedAt }) });
}

export interface IssuedCertificate {
  _id: string;
  studentDni: string;
  studentName: string;
  number: string;
  issuedDate: string;
  issuerName: string;
  fileName: string;
  sha256: string;
  verificationCode: string;
  registeredAt: string;
  active: boolean;
  revokedAt: string | null;
  revocationReason: string;
}
export function fetchCertificates(dni?: string) { return fetchJson<IssuedCertificate[]>(dni ? `/certificates/student/${encodeURIComponent(dni)}` : "/certificates"); }
export function registerCertificate(data: { studentDni: string; number: string; issuedDate: string; issuerName: string; fileName: string; fileData: string }) {
  return fetchJson<IssuedCertificate>("/certificates", { method: "POST", body: JSON.stringify(data) });
}
export function fetchCertificateFile(id: string) {
  return fetchJson<{ fileName: string; fileData: string; sha256: string; active: boolean }>(`/certificates/${encodeURIComponent(id)}/file`);
}
export function revokeCertificate(id: string, reason: string) {
  return fetchJson<IssuedCertificate>(`/certificates/${encodeURIComponent(id)}/revoke`, { method: "PATCH", body: JSON.stringify({ reason }) });
}
export function verifyCertificate(code: string) {
  return fetchJson<{ registered: boolean; active: boolean; number: string; issuedDate: string; sha256: string; signatureValidation: string; message: string }>(`/certificate-verification/${encodeURIComponent(code)}`);
}



