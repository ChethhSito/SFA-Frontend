import type { AttendanceSession, ScheduledClass } from "../services/attendanceSessions";

export function attendanceBlockReason(session: Pick<AttendanceSession, "date">, row: ScheduledClass | undefined, today: string): string {
  if (!row) return "No se encontró la programación de clase.";
  if (row.issues.length) return row.issues.join(" ");
  if (!row.periodActive || row.periodStatus !== "Activo" || !row.startDate || !row.endDate || today < row.startDate || today > row.endDate) return "El ciclo lectivo no está vigente.";
  const weekday = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][new Date(`${today}T12:00:00Z`).getUTCDay()];
  const scheduled = row.dayOfWeek.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (session.date !== today || scheduled !== weekday) return "La sección seleccionada no se encuentra programada para el día de hoy.";
  return "";
}

export type AttendanceMark = "Presente" | "Tardanza" | "Falta" | "Justificado";
export const attendanceMarks: AttendanceMark[] = ["Presente", "Tardanza", "Falta", "Justificado"];
export function completeAttendance(roster: { dni: string }[], saved: Record<string, string>, draft: Record<string, AttendanceMark>) {
  const statusMap: Record<string, AttendanceMark> = {};
  const missing: string[] = [];
  for (const student of roster) {
    const value = draft[student.dni] || saved[student.dni];
    if (attendanceMarks.includes(value as AttendanceMark)) statusMap[student.dni] = value as AttendanceMark;
    else missing.push(student.dni);
  }
  return { statusMap, missing };
}
