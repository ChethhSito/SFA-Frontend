import React, { useEffect, useState } from "react";
import MgeDashboard from "../mge/MgeDashboard";
import { Applicant, Enrollment, StudentPersonalData, Course, CourseAssignment, AttendanceRecord, Graduation, AdmissionPeriod } from "../../types";
import { Lock, ArrowLeft, Calendar } from "lucide-react";
import Button from "../ui-custom/Button";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner and Quick Admission Period Selector */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 drop-shadow-sm shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 L85 22 C85 58 68 85 50 95 C32 85 15 58 15 22 Z" fill="#9F062A" />
            <polygon points="50,22 53,30 61,30 55,35 57,43 50,38 43,43 45,35 39,30 47,30" fill="#E3BD26" />
          </svg>
          <div>
            <h2 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider">
              IESTP San Francisco de Asís
            </h2>
            <p className="text-[10px] text-[#9F062A] font-black uppercase tracking-widest">
              Consola de Gestión Académica (MGE)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wide">
              Periodo:
            </label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="p-1.5 border border-slate-250 bg-white font-bold rounded-lg text-xs"
            >
              <option value="all">Ver Todos</option>
              {props.admissionPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={props.onLogout}
            className="px-4 py-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all border border-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Cerrar MGE
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto">
        <MgeDashboard
          applicants={props.applicants}
          enrollments={props.enrollments}
          studentsList={props.studentsList}
          courses={props.courses}
          assignments={props.assignments}
          attendance={props.attendance}
          graduations={props.graduations}
          onUpdateEnrollments={props.onUpdateEnrollments}
          onUpdateStudentsList={props.onUpdateStudentsList}
          onUpdateCourses={props.onUpdateCourses}
          onUpdateAssignments={props.onUpdateAssignments}
          onUpdateAttendance={props.onUpdateAttendance}
          onUpdateGraduations={props.onUpdateGraduations}
          selectedPeriodId={selectedPeriodId}
          onLogout={props.onLogout}
        />
      </main>
    </div>
  );
}

