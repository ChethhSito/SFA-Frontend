"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import { Applicant, Enrollment, StudentPersonalData, Classroom, Teacher, Graduation, AdmissionPeriod } from "@/types";
import {
  INITIAL_APPLICANTS,
  INITIAL_STUDENTS_DATA,
  INITIAL_ENROLLMENTS,
  GENERAL_TEACHERS,
  GENERAL_CLASSROOMS,
  INITIAL_GRADUATIONS
} from "@/lib/mockData";

export default function AdministradorPage() {
  const router = useRouter();
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Database States
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentsList, setStudentsList] = useState<{ [dni: string]: StudentPersonalData }>({});
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>([]);

  useEffect(() => {
    // Session validation
    const s = localStorage.getItem("sfa_session_administrador");
    if (!s) {
      router.push("/ingresar");
      return;
    }
    setSession(s);

    // Load DB States
    const savedApps = localStorage.getItem("sfa_applicants");
    const savedEnrolls = localStorage.getItem("sfa_enrollments");
    const savedStudents = localStorage.getItem("sfa_students");
    const savedClass = localStorage.getItem("sfa_classrooms");
    const savedTeachers = localStorage.getItem("sfa_teachers");
    const savedGrad = localStorage.getItem("sfa_graduations");
    const savedPeriods = localStorage.getItem("sfa_admission_periods");

    setApplicants(savedApps ? JSON.parse(savedApps) : INITIAL_APPLICANTS);
    setEnrollments(savedEnrolls ? JSON.parse(savedEnrolls) : INITIAL_ENROLLMENTS);
    setStudentsList(savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS_DATA);
    setClassrooms(savedClass ? JSON.parse(savedClass) : GENERAL_CLASSROOMS);
    setTeachers(savedTeachers ? JSON.parse(savedTeachers) : GENERAL_TEACHERS);
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
    localStorage.removeItem("sfa_session_administrador");
    router.push("/ingresar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Validando Sesión de Administrador...</span>
      </div>
    );
  }

  return (
    <AdminDashboard
      applicants={applicants}
      enrollments={enrollments}
      studentsList={studentsList}
      classrooms={classrooms}
      teachers={teachers}
      graduations={graduations}
      admissionPeriods={admissionPeriods}
      onUpdateApplicants={(updated) => saveState("sfa_applicants", updated, setApplicants)}
      onUpdateEnrollments={(updated) => saveState("sfa_enrollments", updated, setEnrollments)}
      onUpdateClassrooms={(updated) => saveState("sfa_classrooms", updated, setClassrooms)}
      onUpdateTeachers={(updated) => saveState("sfa_teachers", updated, setTeachers)}
      onUpdateGraduations={(updated) => saveState("sfa_graduations", updated, setGraduations)}
      onUpdateAdmissionPeriods={(updated) => saveState("sfa_admission_periods", updated, setAdmissionPeriods)}
      onLogout={handleLogout}
    />
  );
}
