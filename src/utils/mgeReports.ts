import { AttendanceRecord, Course, CourseAssignment, Enrollment } from "../types";
import { ProcessedStudent } from "../components/mge/mgeTypes";
import { academicToday } from "./attendance";

export interface RecordedPayment {
  paymentId?: string;
  _id?: string;
  studentDni: string;
  concept: string;
  amount: number;
  status: string;
  date: string;
  receiptNumber?: string;
}

export function summarizeMge(enrollments: Enrollment[], students: ProcessedStudent[], payments: RecordedPayment[], attendance: AttendanceRecord[], today = academicToday()) {
  const inactive = new Set(students.filter((student) => student.active === false).map((student) => student.dni));
  const activeEnrollments = enrollments.filter((row) => !inactive.has(row.studentDni));
  const enrollmentPayments = payments.filter((row) => row.status === "APROBADO" && typeof row.concept === "string" &&
    /matricul/i.test(row.concept.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) &&
    typeof row.amount === "number" && Number.isFinite(row.amount) && row.amount >= 0);
  const totalCollected = Math.round(enrollmentPayments.reduce((sum, row) => sum + row.amount, 0) * 100) / 100;
  const missingPaymentAmount = activeEnrollments.filter((row) => row.paymentStatus === "Validado" &&
    !enrollmentPayments.some((payment) => payment.studentDni === row.studentDni &&
      (!row.paymentOperation || payment.receiptNumber === row.paymentOperation))).length;
  const activeDnis = new Set(students.filter((student) => student.active !== false).map((student) => student.dni));
  const marks = new Map<string, string>();
  for (const record of attendance) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date) || record.date > today) continue;
    for (const [dni, status] of Object.entries(record.statusMap)) {
      if (activeDnis.has(dni) && ["Presente", "Tardanza", "Falta", "Justificado"].includes(status)) {
        marks.set(JSON.stringify([record.courseId, record.date, dni]), status);
      }
    }
  }
  const attendanceRate = marks.size ? Math.round([...marks.values()].filter((status) => status !== "Falta").length / marks.size * 10000) / 100 : null;
  const careerCounts: Record<string, number> = {};
  for (const row of activeEnrollments) if (row.academicStatus === "MATRICULADO") careerCounts[row.programId] = (careerCounts[row.programId] || 0) + 1;
  return { totalMatriculados: activeEnrollments.filter((row) => row.academicStatus === "MATRICULADO").length,
    totalAdmitidos: activeEnrollments.filter((row) => row.academicStatus === "ADMITIDO").length,
    pagosValidados: activeEnrollments.filter((row) => row.paymentStatus === "Validado").length,
    totalCollected, missingPaymentAmount, attendanceRate, recordedMarks: marks.size, careerCounts, enrollmentPayments, activeEnrollments };
}

export function recordedHistory(student: ProcessedStudent, courses: Course[], assignments: CourseAssignment[]) {
  return courses.flatMap((course) => {
    const grades = assignments.filter((assignment) => assignment.courseId === course.id || assignment.courseId === course.code)
      .flatMap((assignment) => assignment.submissions.filter((submission) => submission.studentDni === student.dni &&
        !!submission.submitDate && submission.submitDate.slice(0, 10) <= academicToday() &&
        typeof submission.grade === "number" && Number.isFinite(submission.grade) && submission.grade >= 0 && submission.grade <= 20)
        .map((submission) => submission.grade as number));
    const career = course.careerId || course.career;
    if (!grades.length && (!student.programId || career !== student.programId)) return [];
    return [{ courseName: course.name, code: course.code, count: grades.length,
      grade: grades.length ? Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length * 100) / 100 : null,
      credits: typeof course.credits === "number" && course.credits > 0 ? course.credits : null }];
  });
}
