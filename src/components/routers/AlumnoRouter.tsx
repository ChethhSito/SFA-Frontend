import React, { useEffect, useState } from "react";
import AlumnoDashboard from "../AlumnoDashboard";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, CycleStatus, Graduation } from "../../types";
import { Lock, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

interface AlumnoRouterProps {
  enrollments: Enrollment[];
  studentsData: { [dni: string]: StudentPersonalData };
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  cycleStatuses: { [dni: string]: CycleStatus[] };
  graduations: Graduation[];
  onUpdatePersonal: (studentDni: string, updated: StudentPersonalData) => void;
  onUpdateEnrollment: (enr: Enrollment) => void;
  onUpdateAssignments: (updated: CourseAssignment[]) => void;
  onLogout: () => void;
}

export default function AlumnoRouter({
  enrollments,
  studentsData,
  courses,
  materials,
  assignments,
  evaluations,
  attendance,
  cycleStatuses,
  graduations,
  onUpdatePersonal,
  onUpdateEnrollment,
  onUpdateAssignments,
  onLogout
}: AlumnoRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_alumno");
    setSession(s);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Iniciando Portal del Estudiante...</span>
      </div>
    );
  }

  const currentDni = session || "";
  const personal = studentsData[currentDni];

  if (!session || !personal) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-950 text-[#CFA020] flex items-center justify-center mx-auto border border-yellow-905_color">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider">Módulo de Alumnos</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Área reservada para estudiantes matriculados de la institución. Inicie sesión para ver su avance académico y asignaturas.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={onLogout}
              className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-xs font-bold tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Ingresar a Intranet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const enr = enrollments.find((e) => e.studentDni === currentDni) || {
    studentDni: currentDni,
    programId: "electronica",
    academicStatus: "ADMITIDO" as const,
    docs: {
      dniFile: { status: "No Enviado" as const },
      certificadoFile: { status: "No Enviado" as const },
      partidaFile: { status: "No Enviado" as const },
      fotoFile: { status: "No Enviado" as const }
    },
    paymentStatus: "No Pagado" as const
  };
  const historyList = cycleStatuses[currentDni] || [];
  const gradDoc = graduations.find((g) => g.studentDni === currentDni);

  return (
    <AlumnoDashboard 
      studentDni={currentDni}
      personalData={personal}
      enrollment={enr}
      courses={courses}
      materials={materials}
      assignments={assignments}
      evaluations={evaluations}
      attendance={attendance}
      cycleStatuses={historyList}
      graduation={gradDoc}
      onUpdatePersonal={(updated) => onUpdatePersonal(currentDni, updated)}
      onUpdateEnrollment={onUpdateEnrollment}
      onUpdateAssignments={onUpdateAssignments}
      onLogout={onLogout}
    />
  );
}
