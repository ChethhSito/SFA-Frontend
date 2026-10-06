import React, { useEffect, useState } from "react";
import DocenteDashboard from "../docente/DocenteDashboard";
import { Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, StudentPersonalData } from "../../types";
import { Lock, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

interface DocenteRouterProps {
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  studentsList: { [dni: string]: StudentPersonalData };
  onUpdateMaterials: (updated: CourseMaterial[]) => void;
  onUpdateAssignments: (updated: CourseAssignment[]) => void;
  onUpdateAttendance: (updated: AttendanceRecord[]) => void;
  onLogout: () => void;
}

export default function DocenteRouter({
  courses,
  materials,
  assignments,
  evaluations,
  attendance,
  studentsList,
  onUpdateMaterials,
  onUpdateAssignments,
  onUpdateAttendance,
  onLogout
}: DocenteRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_docente");
    setSession(s);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Iniciando Portal Docente...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-950 text-[#CFA020] flex items-center justify-center mx-auto border border-amber-900/40">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider">Módulo Docente</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Área de docentes calificados del IESTP. Inicie sesión para registrar notas, programar asignaciones y controlar asistencia.
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

  return (
    <DocenteDashboard 
      teacherDni={session}
      courses={courses}
      materials={materials}
      assignments={assignments}
      evaluations={evaluations}
      attendance={attendance}
      studentsList={studentsList}
      onUpdateMaterials={onUpdateMaterials}
      onUpdateAssignments={onUpdateAssignments}
      onUpdateAttendance={onUpdateAttendance}
      onLogout={onLogout}
    />
  );
}
