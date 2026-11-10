import React from "react";
import { AttendanceRecord, Course, StudentPersonalData } from "../../types";
import MgeAttendanceSessions from "../mge/tabs/MgeAttendanceSessions";
interface Props {
  teacherDni: string; course: Course; courseId: string; week: number;
  students: StudentPersonalData[]; attendanceRecords: AttendanceRecord[];
  loading: boolean; error: string | null; onReload: () => Promise<boolean>;
  onUpdateAttendance: (updated: AttendanceRecord[]) => Promise<boolean>;
}
// Assignment is enforced by the API using the verified Firebase identity.
export default function AsistenciaManager({ teacherDni, course, courseId, students, attendanceRecords, onReload }: Props) {
  return <MgeAttendanceSessions courses={[course]} courseFilter={courseId} teacherFilter={teacherDni} enrollments={[]}
    students={students.map((student) => ({ ...student, enrolled: true, academicStatus: "MATRICULADO", programId: course.careerId || course.career || "", shift: "", paymentStatus: "" }))}
    legacyAttendance={attendanceRecords} onAttendanceChanged={onReload} />;
}
