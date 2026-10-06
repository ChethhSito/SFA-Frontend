import React, { useEffect, useState } from "react";
import MgeDashboard from "../mge";
import { Applicant, Enrollment, StudentPersonalData, Course, CourseAssignment, AttendanceRecord, Graduation, AdmissionPeriod } from "../../types";
import { Lock, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

interface MgeRouterProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  studentsList: { [dni: string]: StudentPersonalData };
  courses: Course[];
  assignments: CourseAssignment[];
  attendance: AttendanceRecord[];
  graduations: Graduation[];
  admissionPeriods: AdmissionPeriod[];
  onUpdateEnrollments: (enrolls: Enrollment[]) => void;
  onUpdateStudentsList: (students: { [dni: string]: StudentPersonalData }) => void;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
  onUpdateAttendance: (att: AttendanceRecord[]) => void;
  onUpdateGraduations: (grads: Graduation[]) => void;
  onLogout: () => void;
}

export default function MgeRouter(props: MgeRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(() => {
    const active = props.admissionPeriods.find((p) => p.status === "APERTURADO") || props.admissionPeriods[0];
    return active ? active.id : "1";
  });

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_mge");
    setSession(s);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">
          Validando Sesión de Gestión de Estudiantes (MGE)...
        </span>
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
            <h3 className="text-white font-black text-lg uppercase tracking-wider font-display">Acreditación Requerida</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Consola Protegida. No cuenta con una sesión autorizada para el Módulo de Gestión de Estudiantes (MGE).
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

  return (
    <MgeDashboard
      applicants={props.applicants}
      enrollments={props.enrollments}
      studentsList={props.studentsList}
      courses={props.courses}
      assignments={props.assignments}
      attendance={props.attendance}
      graduations={props.graduations}
      admissionPeriods={props.admissionPeriods}
      selectedPeriodId={selectedPeriodId}
      onUpdateEnrollments={props.onUpdateEnrollments}
      onUpdateStudentsList={props.onUpdateStudentsList}
      onUpdateCourses={props.onUpdateCourses}
      onUpdateAssignments={props.onUpdateAssignments}
      onUpdateAttendance={props.onUpdateAttendance}
      onUpdateGraduations={props.onUpdateGraduations}
      onLogout={props.onLogout}
    />
  );
}
