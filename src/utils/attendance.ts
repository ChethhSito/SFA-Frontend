import { AttendanceRecord } from '../types';

export function academicToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function studentAttendanceRecords(records: AttendanceRecord[], courseIds: string[], dni: string, today = academicToday()): AttendanceRecord[] {
  return records.filter((record) => courseIds.includes(record.courseId) &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date) && record.date <= today &&
    ['Presente', 'Tardanza', 'Falta', 'Justificado'].includes(record.statusMap?.[dni]));
}
