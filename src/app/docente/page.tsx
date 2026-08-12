"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import DocenteDashboard from "@/components/DocenteDashboard";
import Button from "@/components/ui-custom/Button";
import { Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, StudentPersonalData } from "@/types";
import {
  INITIAL_COURSES,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_STUDENTS_DATA
} from "@/lib/mockData";

export default function DocentePage() {
  const router = useRouter();
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studentsList, setStudentsList] = useState<{ [dni: string]: StudentPersonalData }>({});

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_docente");
    setSession(s);

    // Load DB States
    const savedCourses = localStorage.getItem("sfa_courses");
    const savedMats = localStorage.getItem("sfa_materials");
    const savedAsgs = localStorage.getItem("sfa_assignments");
    const savedEvals = localStorage.getItem("sfa_evaluations");
    const savedAtt = localStorage.getItem("sfa_attendance");
    const savedStudents = localStorage.getItem("sfa_students");

    setCourses(savedCourses ? JSON.parse(savedCourses) : INITIAL_COURSES);
    setMaterials(savedMats ? JSON.parse(savedMats) : INITIAL_MATERIALS);
    setAssignments(savedAsgs ? JSON.parse(savedAsgs) : INITIAL_ASSIGNMENTS);
    setEvaluations(savedEvals ? JSON.parse(savedEvals) : INITIAL_EVALUATIONS);
    setAttendance(savedAtt ? JSON.parse(savedAtt) : INITIAL_ATTENDANCE);
    setStudentsList(savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS_DATA);

    setLoading(false);
  }, []);

  const saveState = (key: string, value: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleLogout = () => {
    localStorage.removeItem("sfa_session_docente");
    router.push("/ingresar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Iniciando Portal Docente...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center p-4">
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

  return (
    <DocenteDashboard
      teacherDni={session}
      courses={courses}
      materials={materials}
      assignments={assignments}
      evaluations={evaluations}
      attendance={attendance}
      studentsList={studentsList}
      onUpdateMaterials={(updated) => saveState("sfa_materials", updated, setMaterials)}
      onUpdateAssignments={(updated) => saveState("sfa_assignments", updated, setAssignments)}
      onUpdateAttendance={(updated) => saveState("sfa_attendance", updated, setAttendance)}
      onLogout={handleLogout}
    />
  );
}
