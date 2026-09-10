import { Applicant, Enrollment, AdmissionPeriod, Course, Teacher, Graduation } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

/**
 * Generic fetch wrapper handling HTTP errors gracefully with logging.
 */
async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      },
      ...options
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
  return fetchJson<Applicant[]>("/applicants");
}

export async function fetchApplicantByDni(dni: string): Promise<Applicant | null> {
  return fetchJson<Applicant>(`/applicants/${dni}`);
}

export async function createApplicant(applicant: Partial<Applicant>): Promise<Applicant | null> {
  return fetchJson<Applicant>("/applicants", {
    method: "POST",
    body: JSON.stringify(applicant)
  });
}

export async function updateApplicant(dni: string, data: Partial<Applicant>): Promise<Applicant | null> {
  return fetchJson<Applicant>(`/applicants/${dni}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export async function deleteApplicant(dni: string): Promise<boolean> {
  const result = await fetchJson<{ success: boolean }>(`/applicants/${dni}`, {
    method: "DELETE"
  });
  return !!result;
}

/* ==========================================================================
   2. ENROLLMENTS (Matrículas e Ingresantes)
   ========================================================================== */

export async function fetchEnrollments(): Promise<Enrollment[] | null> {
  return fetchJson<Enrollment[]>("/enrollments");
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
   3. ADMISSION PERIODS (Planificación & Cronogramas)
   ========================================================================== */

export async function fetchAdmissionPeriods(): Promise<AdmissionPeriod[] | null> {
  return fetchJson<AdmissionPeriod[]>("/admission-periods");
}

export async function createAdmissionPeriod(period: Partial<AdmissionPeriod>): Promise<AdmissionPeriod | null> {
  return fetchJson<AdmissionPeriod>("/admission-periods", {
    method: "POST",
    body: JSON.stringify(period)
  });
}

export async function updateAdmissionPeriod(id: string, data: Partial<AdmissionPeriod>): Promise<AdmissionPeriod | null> {
  return fetchJson<AdmissionPeriod>(`/admission-periods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   4. COURSES & MPA (Cursos y Planificación Académica)
   ========================================================================== */

export async function fetchCourses(): Promise<Course[] | null> {
  return fetchJson<Course[]>("/courses");
}

export async function createCourse(course: Partial<Course>): Promise<Course | null> {
  return fetchJson<Course>("/courses", {
    method: "POST",
    body: JSON.stringify(course)
  });
}

export async function updateCourse(code: string, data: Partial<Course>): Promise<Course | null> {
  return fetchJson<Course>(`/courses/${code}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   5. TEACHERS (Docentes)
   ========================================================================== */

export async function fetchTeachers(): Promise<Teacher[] | null> {
  return fetchJson<Teacher[]>("/teachers");
}

export async function createTeacher(teacher: Partial<Teacher>): Promise<Teacher | null> {
  return fetchJson<Teacher>("/teachers", {
    method: "POST",
    body: JSON.stringify(teacher)
  });
}

export async function updateTeacher(dni: string, data: Partial<Teacher>): Promise<Teacher | null> {
  return fetchJson<Teacher>(`/teachers/${dni}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

/* ==========================================================================
   6. GRADUATIONS (Titulación y Egresados)
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
   7. TRANSACTIONAL EMAILS (Brevo API via NestJS MailService)
   ========================================================================== */

export async function sendTransactionalWelcomeEmail(payload: {
  email: string;
  applicantCode: string;
  password?: string;
  url?: string;
  name?: string;
  dni?: string;
  programName?: string;
}): Promise<boolean> {
  const result = await fetchJson<{ success: boolean; messageId?: string }>("/mail/send-welcome", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (result && result.success) {
    console.info("✅ Transactional welcome email dispatched via NestJS SFA-Backend!", result.messageId);
    return true;
  }
  return false;
}
