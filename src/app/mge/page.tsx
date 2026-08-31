"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MgeRouter from "@/components/routers/MgeRouter";
import { Applicant, Enrollment, StudentPersonalData, Course, CourseAssignment, AttendanceRecord, Graduation, AdmissionPeriod } from "@/types";
import {
  INITIAL_APPLICANTS,
  INITIAL_ENROLLMENTS,
  INITIAL_STUDENTS_DATA,
  INITIAL_COURSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_GRADUATIONS
} from "@/lib/mockData";

export default function MgePage() {
  const router = useRouter();
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentsList, setStudentsList] = useState<{ [dni: string]: StudentPersonalData }>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_mge");
    if (!s) {
      router.push("/ingresar");
      return;
    }
    setSession(s);

    // Load DB States
    const savedApps = localStorage.getItem("sfa_applicants");
    const savedEnrolls = localStorage.getItem("sfa_enrollments");
    const savedStudents = localStorage.getItem("sfa_students");
    const savedCourses = localStorage.getItem("sfa_courses");
    const savedAsgs = localStorage.getItem("sfa_assignments");
    const savedAtt = localStorage.getItem("sfa_attendance");
    const savedGrad = localStorage.getItem("sfa_graduations");
    const savedPeriods = localStorage.getItem("sfa_admission_periods");

    setApplicants(savedApps ? JSON.parse(savedApps) : INITIAL_APPLICANTS);
    setEnrollments(savedEnrolls ? JSON.parse(savedEnrolls) : INITIAL_ENROLLMENTS);
    setStudentsList(savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS_DATA);
    setCourses(savedCourses ? JSON.parse(savedCourses) : INITIAL_COURSES);
    setAssignments(savedAsgs ? JSON.parse(savedAsgs) : INITIAL_ASSIGNMENTS);
    setAttendance(savedAtt ? JSON.parse(savedAtt) : INITIAL_ATTENDANCE);
    setGraduations(savedGrad ? JSON.parse(savedGrad) : INITIAL_GRADUATIONS);

    if (savedPeriods) {
      setAdmissionPeriods(JSON.parse(savedPeriods));
    } else {
      const defaultPeriods: AdmissionPeriod[] = [
        { id: "1", name: "2026-I", isActive: true, status: "APERTURADO", preEnrollmentStartDate: "2026-02-01", preEnrollmentEndDate: "2026-03-20", admissionDate: "2026-03-22", enrollmentStartDate: "2026-03-24", enrollmentEndDate: "2026-03-29", classesStartDate: "2026-04-06" },
        { id: "2", name: "2026-II", isActive: false, status: "PENDIENTE", preEnrollmentStartDate: "2026-07-01", preEnrollmentEndDate: "2026-08-14", admissionDate: "2026-08-16", enrollmentStartDate: "2026-08-18", enrollmentEndDate: "2026-08-23", classesStartDate: "2026-09-01" }
      ];
      setAdmissionPeriods(defaultPeriods);
      localStorage.setItem("sfa_admission_periods", JSON.stringify(defaultPeriods));
    }

    setLoading(false);
  }, [router]);

  const saveState = (key: string, value: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleLogout = () => {
    localStorage.removeItem("sfa_session_mge");
    router.push("/ingresar");
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Validando Sesión de Gestión de Estudiantes (MGE)...</span>
      </div>
    );
  }

  return (
    <MgeRouter
      applicants={applicants}
      enrollments={enrollments}
      studentsList={studentsList}
      courses={courses}
      assignments={assignments}
      attendance={attendance}
      graduations={graduations}
      admissionPeriods={admissionPeriods}
      onUpdateEnrollments={(updated) => saveState("sfa_enrollments", updated, setEnrollments)}
      onUpdateStudentsList={(updated) => saveState("sfa_students", updated, setStudentsList)}
      onUpdateCourses={(updated) => saveState("sfa_courses", updated, setCourses)}
      onUpdateAssignments={(updated) => saveState("sfa_assignments", updated, setAssignments)}
      onUpdateAttendance={(updated) => saveState("sfa_attendance", updated, setAttendance)}
      onUpdateGraduations={(updated) => saveState("sfa_graduations", updated, setGraduations)}
      onLogout={handleLogout}
    />
  );
}
