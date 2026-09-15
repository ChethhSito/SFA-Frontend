import React, { useEffect, useState } from "react";
import AdminDashboard from "../AdminDashboard";
import { Applicant, Enrollment, StudentPersonalData, Classroom, Teacher, Graduation, AdmissionPeriod, Course, CourseAssignment, AttendanceRecord } from "../../types";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

interface AdminRouterProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  studentsList: { [dni: string]: StudentPersonalData };
  classrooms: Classroom[];
  teachers: Teacher[];
  graduations: Graduation[];
  admissionPeriods: AdmissionPeriod[];
  courses?: Course[];
  assignments?: CourseAssignment[];
  attendance?: AttendanceRecord[];
  onUpdateApplicants: (apps: Applicant[]) => void;
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateClassrooms: (rooms: Classroom[]) => void;
  onUpdateTeachers: (tchs: Teacher[]) => void;
  onUpdateGraduations: (grads: Graduation[]) => void;
  onUpdateAdmissionPeriods: (periods: AdmissionPeriod[]) => void;
  onUpdateStudentsList?: (students: { [dni: string]: StudentPersonalData }) => void;
  onUpdateCourses?: (courses: Course[]) => void;
  onUpdateAssignments?: (asgs: CourseAssignment[]) => void;
  onUpdateAttendance?: (att: AttendanceRecord[]) => void;
  onLogout: () => void;
  onGoToPortal?: () => void;
}

export default function AdminRouter(props: AdminRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_administrador");
    setSession(s);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Validando Sesión de Admisión y Matrícula (MAMC)...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950 text-[#9F062A] flex items-center justify-center mx-auto border border-red-900/30">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider">Acceso Restringido</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Consola protegida. No cuenta con una sesión activa para el Módulo de Admisión y Matrícula (MAMC) en este navegador.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={props.onLogout}
              className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-xs font-bold tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Intranet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard {...props} />;
}

