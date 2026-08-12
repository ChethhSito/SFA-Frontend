"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import AlumnoDashboard from "@/components/AlumnoDashboard";
import Button from "@/components/ui-custom/Button";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, CycleStatus, Graduation } from "@/types";
import {
  INITIAL_ENROLLMENTS,
  INITIAL_STUDENTS_DATA,
  INITIAL_COURSES,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_CYCLE_STATUSES,
  INITIAL_GRADUATIONS
} from "@/lib/mockData";

export default function AlumnoPage() {
  const router = useRouter();
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentsData, setStudentsData] = useState<{ [dni: string]: StudentPersonalData }>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [cycleStatuses, setCycleStatuses] = useState<{ [dni: string]: CycleStatus[] }>({});
  const [graduations, setGraduations] = useState<Graduation[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_alumno");
    setSession(s);

    // Load DB States
    const savedEnrolls = localStorage.getItem("sfa_enrollments");
    const savedStudents = localStorage.getItem("sfa_students");
    const savedCourses = localStorage.getItem("sfa_courses");
    const savedMats = localStorage.getItem("sfa_materials");
    const savedAsgs = localStorage.getItem("sfa_assignments");
    const savedEvals = localStorage.getItem("sfa_evaluations");
    const savedAtt = localStorage.getItem("sfa_attendance");
    const savedCycles = localStorage.getItem("sfa_cycle_statuses");
    const savedGrad = localStorage.getItem("sfa_graduations");

    setEnrollments(savedEnrolls ? JSON.parse(savedEnrolls) : INITIAL_ENROLLMENTS);
    setStudentsData(savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS_DATA);
    setCourses(savedCourses ? JSON.parse(savedCourses) : INITIAL_COURSES);
    setMaterials(savedMats ? JSON.parse(savedMats) : INITIAL_MATERIALS);
    setAssignments(savedAsgs ? JSON.parse(savedAsgs) : INITIAL_ASSIGNMENTS);
    setEvaluations(savedEvals ? JSON.parse(savedEvals) : INITIAL_EVALUATIONS);
    setAttendance(savedAtt ? JSON.parse(savedAtt) : INITIAL_ATTENDANCE);
    setCycleStatuses(savedCycles ? JSON.parse(savedCycles) : INITIAL_CYCLE_STATUSES);
    setGraduations(savedGrad ? JSON.parse(savedGrad) : INITIAL_GRADUATIONS);

    setLoading(false);
  }, []);

  const saveState = (key: string, value: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleUpdatePersonalData = (studentDni: string, details: any) => {
    const nextObj = { ...studentsData, [studentDni]: details };
    saveState("sfa_students", nextObj, setStudentsData);
  };

  const handleUpdateEnrollment = (enr: any) => {
    const nextList = enrollments.map((item) => (item.studentDni === enr.studentDni ? enr : item));
    saveState("sfa_enrollments", nextList, setEnrollments);
  };

  const handleLogout = () => {
    localStorage.removeItem("sfa_session_alumno");
    router.push("/ingresar");
  };

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
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center p-4">
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
              onClick={handleLogout}
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
      onUpdatePersonal={(updated) => handleUpdatePersonalData(currentDni, updated)}
      onUpdateEnrollment={handleUpdateEnrollment}
      onUpdateAssignments={(updated) => saveState("sfa_assignments", updated, setAssignments)}
      onLogout={handleLogout}
    />
  );
}
