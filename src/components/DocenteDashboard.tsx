import React, { useState, useEffect } from "react";
import { 
  Users, BookOpen, Clock, FileText, CheckCircle, 
  Upload, Plus, Save, Award, Trash2, Calendar, LayoutDashboard, LogOut, GraduationCap, ChevronRight, BarChart3, Settings, AlertCircle, RefreshCw, FileSpreadsheet, Megaphone
} from "lucide-react";
import { Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, StudentPersonalData } from "@/types";

// Reusable Custom Design System Components
import Button from "./ui-custom/Button";
import Badge from "./ui-custom/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui-custom/Card";
import PageHeader from "./ui-custom/PageHeader";
import PageTransition from "./ui-custom/PageTransition";
import AlertBox from "./ui-custom/AlertBox";

// Modular Docente Components
import { ROSTER, getWeekTheme, WeeklyObservation } from "./docente/DocenteTypes";
import SidebarPrincipal from "./docente/SidebarPrincipal";
import SidebarCurso, { WeekOption, CourseSection } from "./docente/SidebarCurso";
import { 
  ResumenCurso, MaterialManager, TareaManager, ObservacionManager, CierreCurso 
} from "./docente/WeeklyViews";

import AsistenciaManager from "./docente/AsistenciaManager";
import EvidenciasManager from "./docente/EvidenciasManager";
import EvaluacionesManager from "./docente/EvaluacionesManager";
import ControlAsistenciaPrincipal from "./docente/ControlAsistenciaPrincipal";
import EvaluacionesCursosPrincipal from "./docente/EvaluacionesCursosPrincipal";
import AvisosReportesPrincipal from "./docente/AvisosReportesPrincipal";

interface DocenteDashboardProps {
  teacherDni: string;
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  studentsList: { [dni: string]: StudentPersonalData };
  onUpdateMaterials: (mats: CourseMaterial[]) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
  onUpdateAttendance: (att: AttendanceRecord[]) => void;
  onLogout: () => void;
}

export default function DocenteDashboard({
  teacherDni,
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
}: DocenteDashboardProps) {
  // Main Selection States
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard"); // "dashboard" | "cursos" | "control_asistencia" | "avisos_reportes" | "evaluaciones_cursos" | "configuracion" | "curso"
  
  // Weekly Syllabus States (active when selectedCourseId !== null)
  const [activeSection, setActiveSection] = useState<CourseSection>("general");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedWeekOption, setSelectedWeekOption] = useState<WeekOption>("materiales");

  // Mobile navigation views toggling
  const [showMobileSidebarCurso, setShowMobileSidebarCurso] = useState(false);

  // Filter courses assigned to this specific teacher
  const teacherCourses = courses.filter((c) => c.teacherDni === teacherDni || teacherDni === "docente");
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || null;

  // 1. STATE: Weekly Observations per course & week
  const [weeklyObservations, setWeeklyObservations] = useState<{ [key: string]: WeeklyObservation[] }>(() => {
    const saved = localStorage.getItem("sfa_weekly_observations");
    if (saved) return JSON.parse(saved);
    return {
      "cur-elec-1-1": [
        { id: "obs-init-1", text: "Clase introductoria finalizada con quórum completo. Alumnos muestran amplio interés en el simulador de PLC S7-1200.", date: "2026-06-01", type: "General" },
        { id: "obs-init-2", text: "Se acordó que el trabajo grupal final se entregará de forma obligatoria en la semana 15.", date: "2026-06-01", type: "Acuerdo" }
      ],
      "cur-elec-1-4": [
        { id: "obs-init-3", text: "Dos licencias de TIA Portal fallaron en las PC del laboratorio, se reportó a soporte técnico para reconfiguración.", date: "2026-06-03", type: "Incidencia" }
      ]
    };
  });

  // Save observations status in localStorage
  useEffect(() => {
    localStorage.setItem("sfa_weekly_observations", JSON.stringify(weeklyObservations));
  }, [weeklyObservations]);

  // 2. STATE: Grades registry cache
  const [gradesRegistry, setGradesRegistry] = useState<{ [key: string]: { grade?: number; feedback?: string } }>(() => {
    const saved = localStorage.getItem("sfa_grades_registry");
    if (saved) return JSON.parse(saved);
    return {
      "cur-elec-1-4-12345678": { grade: 17, feedback: "Excelente lógica de enclavamiento y temporizado TON en PLC Siemens." },
      "cur-proj-1-4-12345678": { grade: 16, feedback: "Buen desglose EDT, recuerde delimitar las contingencias de hardware." }
    };
  });

  useEffect(() => {
    localStorage.setItem("sfa_grades_registry", JSON.stringify(gradesRegistry));
  }, [gradesRegistry]);

  // Helper to get materials for selected course & week
  const getFilteredMaterials = () => {
    if (!selectedCourseId) return [];
    return materials.filter((m) => {
      if (m.courseId !== selectedCourseId) return false;
      const weekPattern = `[Semana ${selectedWeek}]`;
      return m.title.startsWith(weekPattern);
    });
  };

  // Helper to get assignments for selected course & week
  const getFilteredAssignments = () => {
    if (!selectedCourseId) return [];
    return assignments.filter((a) => {
      if (a.courseId !== selectedCourseId) return false;
      const weekPattern = `[Semana ${selectedWeek}]`;
      return a.title.startsWith(weekPattern);
    });
  };

  // Actions: Publish material
  const handlePublishMaterial = (title: string, fileName: string, type: string) => {
    if (!selectedCourseId) return;
    const newMaterial: CourseMaterial = {
      id: `mat-${Date.now()}`,
      courseId: selectedCourseId,
      title: `[Semana ${selectedWeek}] ${title} (${type})`,
      date: new Date().toISOString().split("T")[0],
      fileName: fileName
    };
    onUpdateMaterials([...materials, newMaterial]);
  };

  // Actions: Delete material
  const handleDeleteMaterial = (id: string) => {
    onUpdateMaterials(materials.filter((m) => m.id !== id));
  };

  // Actions: Publish assignment
  const handlePublishAssignment = (title: string, desc: string, dueDate: string, attachment?: string, rubric?: string) => {
    if (!selectedCourseId) return;
    const newAsg: CourseAssignment = {
      id: `asg-${Date.now()}`,
      courseId: selectedCourseId,
      title: `[Semana ${selectedWeek}] ${title}`,
      description: desc,
      dueDate: dueDate,
      submissions: []
    };
    if (attachment) (newAsg as any).attachment = attachment;
    if (rubric) (newAsg as any).rubric = rubric;

    onUpdateAssignments([...assignments, newAsg]);
  };

  // Actions: Delete assignment
  const handleDeleteAssignment = (id: string) => {
    onUpdateAssignments(assignments.filter((a) => a.id !== id));
  };

  // Actions: Add observation
  const handleAddObservation = (text: string, type: "General" | "Incidencia" | "Acuerdo") => {
    if (!selectedCourseId) return;
    const key = `${selectedCourseId}-${selectedWeek}`;
    const newObs: WeeklyObservation = {
      id: `obs-${Date.now()}`,
      text: text,
      date: new Date().toLocaleDateString("es-PE"),
      type: type
    };
    setWeeklyObservations((prev) => ({
      ...prev,
      [key]: [newObs, ...(prev[key] || [])]
    }));
  };

  // Actions: Delete observation
  const handleDeleteObservation = (id: string) => {
    if (!selectedCourseId) return;
    const key = `${selectedCourseId}-${selectedWeek}`;
    setWeeklyObservations((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((obs) => obs.id !== id)
    }));
  };

  // Actions: Save grade
  const handleSaveGrade = (studentDni: string, grade: number, feedback: string) => {
    if (!selectedCourseId) return;
    const key = `${selectedCourseId}-${selectedWeek}-${studentDni}`;
    setGradesRegistry((prev) => ({
      ...prev,
      [key]: { grade: grade, feedback: feedback }
    }));
  };

  // Helper to calculate course specific stats
  const getCourseAggregates = (courseId: string) => {
    const courseMats = materials.filter((m) => m.courseId === courseId).length;
    const courseAsgs = assignments.filter((a) => a.courseId === courseId).length;

    let totalScore = 0;
    let counts = 0;
    Object.keys(gradesRegistry).forEach((key) => {
      if (key.startsWith(courseId)) {
        const item = gradesRegistry[key];
        if (item && item.grade !== undefined) {
          totalScore += item.grade;
          counts++;
        }
      }
    });

    const gpa = counts > 0 ? totalScore / counts : 14.5;

    return {
      materialsCount: courseMats + 2, 
      assignmentsCount: courseAsgs,
      incidentsCount: 0,
      studentsCount: ROSTER.length,
      averageGpa: gpa
    };
  };

  // Compute overall statistics across all courses
  const getGlobalStats = () => {
    let pendingReviews = 0;
    const activeCourseIds = teacherCourses.map((c) => c.id);
    const activeAssignments = assignments.filter((a) => activeCourseIds.includes(a.courseId));
    
    activeAssignments.forEach((asg) => {
      ROSTER.forEach((std) => {
        const weekMatch = asg.title.match(/\[Semana (\d+)\]/);
        const weekNum = weekMatch ? parseInt(weekMatch[1], 10) : 1;
        const key = `${asg.courseId}-${weekNum}-${std.dni}`;
        if (!gradesRegistry[key]) {
          pendingReviews++;
        }
      });
    });

    return {
      totalCourses: teacherCourses.length,
      totalStudents: ROSTER.length * teacherCourses.length,
      pendingGrades: pendingReviews || 4,
      attendanceRate: 96.4
    };
  };

  const globalStats = getGlobalStats();

  // Handler for custom weekly schedules per course
  const getCourseSchedulesList = (courseCode: string) => {
    switch (courseCode) {
      case "EE-101":
        return [
          { type: "Teoría", day: "Lunes", start: "08:00 AM", end: "10:30 AM", classroom: "Lab. Automatización I", freq: "Semanal" },
          { type: "Laboratorio", day: "Miércoles", start: "14:00 PM", end: "16:30 PM", classroom: "Estación Siemens S7", freq: "Semanal" }
        ];
      case "EE-102":
        return [
          { type: "Teoría", day: "Martes", start: "10:00 AM", end: "12:30 PM", classroom: "Aula B-201", freq: "Semanal" },
          { type: "Laboratorio", day: "Jueves", start: "08:00 AM", end: "10:30 AM", classroom: "Taller Transformadores", freq: "Semanal" }
        ];
      case "SY-301":
        return [
          { type: "Teoría", day: "Martes", start: "14:00 PM", end: "16:30 PM", classroom: "Lab. de Cómputo C-2", freq: "Semanal" },
          { type: "Laboratorio", day: "Viernes", start: "10:00 AM", end: "12:30 PM", classroom: "Lab. de Cómputo C-2", freq: "Semanal" }
        ];
      case "SY-302":
        return [
          { type: "Teoría", day: "Jueves", start: "10:00 AM", end: "12:30 PM", classroom: "Lab. de Redes R-1", freq: "Semanal" },
          { type: "Laboratorio", day: "Viernes", start: "14:00 PM", end: "16:30 PM", classroom: "Lab. de Redes R-1", freq: "Semanal" }
        ];
      default:
        return [
          { type: "Teoría", day: "Lunes", start: "14:00 PM", end: "16:30 PM", classroom: "Aula Regular B-105", freq: "Semanal" },
          { type: "Laboratorio", day: "Miércoles", start: "15:00 PM", end: "17:30 PM", classroom: "Laboratorio C-3", freq: "Semanal" }
        ];
    }
  };

  return (
    <div id="docente-viewport" className="flex h-screen w-full overflow-hidden bg-slate-100 select-none text-left font-sans">
      
      {/* 1. SIDEBAR PRINCIPAL */}
      <div className="hidden md:block">
        <SidebarPrincipal
          teacherDni={teacherDni}
          courses={teacherCourses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={(courseId) => {
            setSelectedCourseId(courseId);
            if (courseId) {
              setActiveSection("general");
              setActiveTab("curso");
            } else {
              setActiveTab("dashboard");
            }
          }}
          activeTab={activeTab === "curso" ? "cursos" : activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedCourseId(null);
          }}
          onLogout={onLogout}
        />
      </div>

      {/* 2. SIDEBAR SECUNDARIO CURRICULAR DINÁMICO */}
      {selectedCourseId && activeTab === "curso" && (
        <div className="hidden md:block shrink-0">
          <SidebarCurso
            courseId={selectedCourseId}
            courseName={selectedCourse?.name || ""}
            courseCode={selectedCourse?.code || ""}
            activeSection={activeSection}
            selectedWeek={selectedWeek}
            selectedWeekOption={selectedWeekOption}
            onSelectGeneral={() => setActiveSection("general")}
            onSelectHorarios={() => setActiveSection("horarios")}
            onSelectCierre={() => setActiveSection("cierre")}
            onSelectWeekOption={(weekNum, option) => {
              setActiveSection("week");
              setSelectedWeek(weekNum);
              setSelectedWeekOption(option);
            }}
          />
        </div>
      )}

      {/* MOBILE HEADER RESPONSIVENESS AND DRAWERS */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-40 select-none">
        <div className="flex items-center gap-2">
          {selectedCourseId ? (
            <button 
              onClick={() => {
                if (showMobileSidebarCurso) {
                  setSelectedCourseId(null);
                  setActiveTab("cursos");
                } else {
                  setShowMobileSidebarCurso(true);
                }
              }}
              className="text-xs font-black text-[#8B0026] hover:bg-slate-50 px-2.5 py-1.5 border rounded-lg"
            >
              ← {showMobileSidebarCurso ? "Listado" : "Estructura"}
            </button>
          ) : (
            <div className="h-8 w-8 bg-[#8B0026] text-[#CFA020] rounded-lg flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs font-black text-[#8B0026] truncate max-w-[150px] uppercase">
            {selectedCourseId ? (showMobileSidebarCurso ? "Curso: " + selectedCourse?.code : selectedCourse?.name) : "Portal Docente"}
          </span>
        </div>

        <div className="flex gap-2">
          {selectedCourseId && (
            <button 
              onClick={() => setShowMobileSidebarCurso(!showMobileSidebarCurso)}
              className="text-[10px] uppercase font-black px-2 py-1 bg-amber-400 text-slate-900 rounded border"
            >
              {showMobileSidebarCurso ? "Ver Contenido" : "Menú Curso"}
            </button>
          )}
          <button 
            onClick={onLogout}
            className="text-[10px] font-bold text-slate-400 hover:text-red-750"
          >
            Salir
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER INJECTIONS */}
      {selectedCourseId && showMobileSidebarCurso && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-30 bg-white overflow-y-auto">
          <SidebarCurso
            courseId={selectedCourseId}
            courseName={selectedCourse?.name || ""}
            courseCode={selectedCourse?.code || ""}
            activeSection={activeSection}
            selectedWeek={selectedWeek}
            selectedWeekOption={selectedWeekOption}
            onSelectGeneral={() => {
              setActiveSection("general");
              setShowMobileSidebarCurso(false);
            }}
            onSelectHorarios={() => {
              setActiveSection("horarios");
              setShowMobileSidebarCurso(false);
            }}
            onSelectCierre={() => {
              setActiveSection("cierre");
              setShowMobileSidebarCurso(false);
            }}
            onSelectWeekOption={(weekNum, option) => {
              setActiveSection("week");
              setSelectedWeek(weekNum);
              setSelectedWeekOption(option);
              setShowMobileSidebarCurso(false);
            }}
          />
        </div>
      )}

      {!selectedCourseId && (
        <div className="md:hidden fixed top-14 bottom-0 left-0 w-64 z-30 bg-white border-r">
          <SidebarPrincipal
            teacherDni={teacherDni}
            courses={teacherCourses}
            selectedCourseId={selectedCourseId}
            onSelectCourse={(courseId) => {
              setSelectedCourseId(courseId);
              if (courseId) {
                setActiveSection("general");
                setActiveTab("curso");
                setShowMobileSidebarCurso(true);
              }
            }}
            activeTab={activeTab === "curso" ? "cursos" : activeTab}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
          />
        </div>
      )}

      {/* 3. PRIMARY CONTENT AREA WORKSPACE */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

          {/* TAB 1: DASHBOARD (HOME) */}
          {selectedCourseId === null && activeTab === "dashboard" && (
            <PageTransition id="teacher-dashboard" className="space-y-6 text-left">
              <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
                <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/60 opacity-95" />
                <div className="relative z-10 space-y-3">
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm block w-max select-none font-mono">
                    SISTEMA INTRANET INSTITUCIONAL • PORTAL DOCENTE
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none pt-1">
                    ¡Buenos días, Profesor Ramos Torres!
                  </h2>
                  <p className="text-xs text-white/90 font-medium">
                    Gestione la carga académica, controle avance de syllabus presencial y valide calificaciones nacionales.
                  </p>
                </div>
              </div>

              {/* Informative KPIs Dashboard Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-150/80 shadow-xs flex flex-col justify-between text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Asignaturas a Cargo</span>
                  <span className="text-2xl font-black text-slate-900 block mt-2">{globalStats.totalCourses} Materias</span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-150/80 shadow-xs flex flex-col justify-between text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Alumnos Regulados</span>
                  <span className="text-2xl font-black text-slate-900 block mt-2">{globalStats.totalStudents} Alumnos</span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-150/80 shadow-xs flex flex-col justify-between text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Revisiones Pendientes</span>
                  <span className="text-2xl font-black text-[#8B0026] block mt-2">{globalStats.pendingGrades} Entregas</span>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-150/80 shadow-xs flex flex-col justify-between text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Quórum de Asistencia</span>
                  <span className="text-2xl font-black text-emerald-600 block mt-2">{globalStats.attendanceRate}% Promedio</span>
                </div>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Short course references directory */}
                <Card className="lg:col-span-2 text-left">
                  <CardHeader>
                    <div>
                      <CardTitle>Listado de Cursos Tecnológicos Asignados</CardTitle>
                      <CardDescription>Haga clic en gestionar para abrir la estructura académica y curricular de 16 semanas.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 font-sans space-y-3">
                    {teacherCourses.map((c) => {
                      return (
                        <div 
                          key={c.id} 
                          className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-4 transition-all hover:bg-slate-150/50"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] bg-red-50 text-[#8B0026] border border-red-200 px-2 py-0.5 rounded-sm font-black uppercase">
                                  {c.code}
                                </span>
                                <span className="text-[10.5px] font-black text-[#CFA020] uppercase font-mono tracking-wide">
                                  {c.credits} CRÉDITOS
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-900 block text-base mt-2 uppercase leading-snug">{c.name}</span>
                              <div className="text-[11px] text-slate-500 font-bold space-y-1 mt-2.5">
                                <p><span className="text-slate-400">Carrera:</span> <span className="text-slate-800 uppercase">{c.career || "Electricidad Industrial"}</span></p>
                                <p><span className="text-slate-400">Grupo:</span> <span className="text-slate-800 font-mono">Grupo {c.group || "A"}</span></p>
                                <p><span className="text-slate-400">Currícula:</span> <span className="text-slate-800">{c.curriculum || "Currícula 2024"}</span></p>
                              </div>
                            </div>
                            
                            <div className="text-[11px] text-slate-500 font-bold space-y-1 md:self-end">
                              <p><span className="text-slate-400">Aula/Lab:</span> <span className="text-[#8B0026] uppercase font-extrabold">{c.classroom}</span></p>
                              <p><span className="text-slate-400">Alumnos:</span> <span className="text-slate-800">{c.studentCount || 5} Alumnos</span></p>
                              <p><span className="text-slate-400">Horario:</span> <span className="text-slate-800">{c.schedule}</span></p>
                              <p><span className="text-slate-400">Fechas:</span> <span className="text-slate-800 font-mono">{c.startDate || "06/04/2026"} al {c.endDate || "24/07/2026"}</span></p>
                            </div>
                          </div>

                          <div className="flex justify-end pt-3 border-t border-slate-200/60 mt-2">
                            <Button
                              onClick={() => {
                                setSelectedCourseId(c.id);
                                setActiveSection("general");
                                setActiveTab("curso");
                                setShowMobileSidebarCurso(false);
                              }}
                              variant="primary"
                              size="sm"
                              className="font-black uppercase text-[10px] tracking-wider bg-[#8B0026] text-white py-2 px-5 shrink-0 shadow-sm"
                            >
                              Gestionar Curso <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Right Column: Weekly schedule & Notice summary widget */}
                <div className="space-y-6">
                  {/* Scheduled lessons sessions info box */}
                  <Card className="text-left border border-slate-150">
                    <CardHeader>
                      <div>
                        <CardTitle>Próximas Sesiones programadas</CardTitle>
                        <CardDescription>Horarios lectivos de clases presenciales</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 text-xs text-slate-700 font-bold space-y-2.5 font-sans">
                      <div className="p-2 bg-slate-50 border-l-4 border-[#8B0026] rounded flex justify-between">
                        <div>
                          <span className="block font-black text-slate-900 leading-none">Automatización PLC</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">Lab I • Lunes 8:00 AM - 11:30 AM</span>
                        </div>
                        <span className="text-[9px] bg-[#8B0026]/10 text-[#8B0026] font-black h-max px-2 py-0.5 rounded font-mono uppercase">Lunes</span>
                      </div>
                      <div className="p-2 bg-slate-50 border-l-4 border-amber-500 rounded flex justify-between">
                        <div>
                          <span className="block font-black text-slate-900 leading-none">Admin. de Proyectos</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">Lab C-2 • Martes 2:00 PM - 5:30 PM</span>
                        </div>
                        <span className="text-[9px] bg-amber-505 bg-amber-500/15 text-amber-700 font-black h-max px-2 py-0.5 rounded font-mono uppercase">Martes</span>
                      </div>
                      <div className="p-2 bg-slate-50 border-l-4 border-blue-500 rounded flex justify-between">
                        <div>
                          <span className="block font-black text-slate-900 leading-none">Redes y Com II</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">Lab R-1 • Jueves 10:00 AM - 1:00 PM</span>
                        </div>
                        <span className="text-[9px] bg-blue-500/10 text-blue-700 font-black h-max px-2 py-0.5 rounded font-mono uppercase">Jueves</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notices and warnings */}
                  <Card className="text-left bg-gradient-to-br from-amber-50/20 to-slate-50">
                    <CardHeader>
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <CardTitle className="text-amber-950">Avisos de Coordinación</CardTitle>
                          <CardDescription>Directivas vigentes del ciclo regular</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 text-[11px] text-slate-700 font-medium space-y-2">
                      <p className="pb-1.5 border-b border-amber-100">
                        🔔 **Cierre de Actas Parciales**: Se solicita registrar las notas de la Semana 8 en la planilla consolidada antes del 15/06.
                      </p>
                      <p>
                        🔧 **Inventario Laboratorio**: Se han inaugurado los módulos físicos Siemens S7-1200 para prácticas del curso de Automatización.
                      </p>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </PageTransition>
          )}

          {/* TAB 2: GENERAL LIST OF COURSES ("Mis Cursos") */}
          {selectedCourseId === null && activeTab === "cursos" && (
            <PageTransition id="cursos-directory-screen" className="space-y-6 text-left">
              <PageHeader 
                title="Mis Asignaturas Asignadas"
                subtitle="Seleccione una materia pedagógica para programar semanas de asistencia, tareas, evaluaciones y evidencias."
                icon={<BookOpen className="w-6 h-6 text-[#8B0026]" />}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherCourses.map((c) => {
                  const stats = getCourseAggregates(c.id);
                  return (
                    <Card key={c.id} className="border border-slate-150 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
                      <CardHeader className="bg-slate-50/50 border-b pb-4">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-[9px] font-black bg-red-50 border border-red-200 text-[#8B0026] px-2.5 py-0.5 rounded-sm">
                            {c.code}
                          </span>
                          <span className="text-[10px] font-black text-[#CFA020] uppercase font-mono tracking-widest">
                            {c.credits} CRÉDITOS
                          </span>
                        </div>
                        <h4 className="font-black text-slate-850 uppercase text-sm mt-1.5 leading-tight" title={c.name}>{c.name}</h4>
                      </CardHeader>
                      <CardContent className="p-5 space-y-2.5 text-xs text-slate-600 font-bold leading-normal">
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Carrera:</span>
                          <span className="text-slate-900 uppercase font-extrabold">{c.career || "Electricidad Industrial"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Grupo:</span>
                          <span className="text-slate-900 font-mono">Grupo {c.group || "A"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Currícula:</span>
                          <span className="text-slate-900">{c.curriculum || "Currícula 2024"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Aula / Taller:</span>
                          <span className="text-slate-900 uppercase font-extrabold">{c.classroom}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Cantidad de Alumnos:</span>
                          <span className="text-slate-900">{c.studentCount || stats.studentsCount} Alumnos</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Horario:</span>
                          <span className="text-slate-900">{c.schedule}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-semibold">Fecha de Inicio:</span>
                          <span className="text-slate-900 font-mono">{c.startDate || "06/04/2026"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Fecha de Fin:</span>
                          <span className="text-slate-900 font-mono">{c.endDate || "24/07/2026"}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 bg-slate-50 border-t flex justify-end">
                        <Button
                          onClick={() => {
                            setSelectedCourseId(c.id);
                            setActiveSection("general");
                            setActiveTab("curso");
                          }}
                          variant="primary"
                          className="font-black text-[10px] tracking-wider uppercase bg-[#8B0026] text-white w-full py-2.5 shadow-sm"
                        >
                          Gestionar Curso
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </PageTransition>
          )}

          {/* TAB 3: CONTROL DE ASISTENCIA GENERAL (CONSULTAS) */}
          {selectedCourseId === null && activeTab === "control_asistencia" && (
            <PageTransition id="control-asistencia-general-tab">
              <ControlAsistenciaPrincipal 
                courses={teacherCourses}
                attendanceRecords={attendance}
              />
            </PageTransition>
          )}

          {/* TAB 4: AVISOS Y REPORTES GENERAL */}
          {selectedCourseId === null && activeTab === "avisos_reportes" && (
            <PageTransition id="avisos-reportes-general-tab">
              <AvisosReportesPrincipal />
            </PageTransition>
          )}

          {/* TAB 5: EVALUACIONES DE CURSOS SPREADSHEETS */}
          {selectedCourseId === null && activeTab === "evaluaciones_cursos" && (
            <PageTransition id="evaluaciones-cursos-general-tab">
              <EvaluacionesCursosPrincipal 
                courses={teacherCourses}
              />
            </PageTransition>
          )}

          {/* TAB 6: CONFIGURACION PERSONAL */}
          {selectedCourseId === null && activeTab === "configuracion" && (
            <PageTransition id="config-tab" className="space-y-6 text-left">
              <PageHeader 
                title="Configuración de Cuenta Docente"
                subtitle="Firma digital homologada, correo de contacto y habilitaciones del catedrático Ramos."
                icon={<Settings className="w-6 h-6 text-[#8B0026]" />}
              />
              <Card className="max-w-xl mx-auto text-left font-sans text-xs border border-slate-150">
                <CardHeader>
                  <CardTitle>Información del Catedrático Ramos</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4 font-bold text-slate-700">
                    <div>
                      <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">Nombre Completo</label>
                      <input type="text" disabled value="Miguel Ángel Ramos Torres" className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded font-bold" />
                    </div>
                    <div>
                      <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">DNI de Certificación</label>
                      <input type="text" disabled value="docente" className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded font-mono font-bold" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-450 uppercase text-[9px] mb-1 font-black">E-mail Institucional</label>
                      <input type="text" disabled value="miguel.ramos@iestpsfa.edu.pe" className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded font-bold" />
                    </div>
                  </div>
                  <AlertBox variant="success" title="Firma Certificada" description="Acuerdo con directiva nacional, su firma digital mediante DNI se encuentra homologada en la pasarela académica del IESTP San Francisco de Asís." className="mt-2 text-[10.5px]" />
                </CardContent>
              </Card>
            </PageTransition>
          )}

          {/* COURSE INTEGRATION SUB SECTIONS (Selected course context) */}
          {selectedCourseId && activeTab === "curso" && selectedCourse && (
            <div className="space-y-6">
              
              {/* SECTION A: GENERAL SUMMARY BANNER AND SHEET */}
              {activeSection === "general" && (
                <PageTransition id="curso-general" className="space-y-6">
                  <ResumenCurso
                    course={selectedCourse}
                    {...getCourseAggregates(selectedCourseId)}
                  />
                </PageTransition>
              )}

              {/* SECTION B: HORARIOS LECTIVOS SCREEN */}
              {activeSection === "horarios" && (
                <PageTransition id="curso-horarios" className="space-y-6 text-left">
                  <PageHeader
                    title="Horarios Lectivos Oficiales"
                    subtitle="Distribución horaria presencial programada para el semestre en vigor."
                    icon={<Clock className="w-5 h-5 text-[#8B0026]" />}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getCourseSchedulesList(selectedCourse.code).map((sch, idx) => (
                      <Card key={idx} className="border border-slate-150">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/40">
                          <div>
                            <span className="text-[10px] text-[#CFA020] font-black uppercase tracking-wider block font-mono">Sesión programada</span>
                            <CardTitle className="uppercase text-slate-800 text-sm mt-1">Clase {sch.type}</CardTitle>
                          </div>
                          <span className="px-2.5 py-1 bg-[#8B0026]/10 text-[#8B0026] border border-[#8B0026]/20 font-black text-[9px] uppercase rounded-sm">
                            {sch.day}
                          </span>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3.5 text-xs text-slate-600 font-bold leading-normal">
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-slate-400 font-semibold">Hora de Inicio:</span>
                            <span className="text-slate-900 font-mono font-extrabold">{sch.start}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-slate-400 font-semibold">Hora de Finalización:</span>
                            <span className="text-slate-900 font-mono font-extrabold">{sch.end}</span>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-slate-400 font-semibold">Aula / Laboratorio:</span>
                            <span className="text-[#8B0026] uppercase font-extrabold">{sch.classroom}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Frecuencia de Repetición:</span>
                            <span className="text-slate-900 uppercase font-black tracking-wide text-[10.5px]">{sch.freq}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </PageTransition>
              )}

              {/* SECTION C: 16 WEEKS INTERACTIVE OPERATIONS SUB VIEW */}
              {activeSection === "week" && (
                <div className="space-y-6 block">
                  {/* Themed Week Header Banner */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl text-left font-sans flex items-start gap-4">
                    <div className="h-10 w-10 bg-[#8B0026]/10 text-[#8B0026] border border-red-150 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                      S{selectedWeek}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight uppercase">
                        Tema: {getWeekTheme(selectedCourse.code, selectedWeek).topic}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold block mt-1">
                        {getWeekTheme(selectedCourse.code, selectedWeek).desc}
                      </p>
                    </div>
                  </div>

                  {/* Wire sub-options dynamically */}
                  <div className="block">
                    {/* Sub-item 1: Asistencia */}
                    {selectedWeekOption === "asistencia" && (
                      <AsistenciaManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                        attendanceRecords={attendance}
                        onUpdateAttendance={onUpdateAttendance}
                      />
                    )}

                    {/* Sub-item 2: Materiales */}
                    {selectedWeekOption === "materiales" && (
                      <MaterialManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                        materials={getFilteredMaterials()}
                        onPublishMaterial={handlePublishMaterial}
                        onDeleteMaterial={handleDeleteMaterial}
                      />
                    )}

                    {/* Sub-item 3: Tareas */}
                    {selectedWeekOption === "tareas" && (
                      <TareaManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                        assignments={getFilteredAssignments()}
                        onPublishAssignment={handlePublishAssignment}
                        onDeleteAssignment={handleDeleteAssignment}
                      />
                    )}

                    {/* Sub-item 4: Evaluaciones */}
                    {selectedWeekOption === "evaluaciones" && (
                      <EvaluacionesManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                        grades={ROSTER.reduce((acc, current) => {
                          const key = `${selectedCourseId}-${selectedWeek}-${current.dni}`;
                          const saved = gradesRegistry[key];
                          acc[current.dni] = saved || {};
                          return acc;
                        }, {} as { [dni: string]: { grade?: number; feedback?: string } })}
                        onSaveGrade={handleSaveGrade}
                      />
                    )}

                    {/* Sub-item 5: Observaciones */}
                    {selectedWeekOption === "observaciones" && (
                      <ObservacionManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                        observations={weeklyObservations[`${selectedCourseId}-${selectedWeek}`] || []}
                        onAddObservation={handleAddObservation}
                        onDeleteObservation={handleDeleteObservation}
                      />
                    )}

                    {/* Sub-item 6: Evidencias */}
                    {selectedWeekOption === "evidencias" && (
                      <EvidenciasManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* SECTION D: COURSE CLOSURE PANEL */}
              {activeSection === "cierre" && (
                <PageTransition id="curso-cierre">
                  <CierreCurso
                    course={selectedCourse}
                    weeksCount={16}
                    {...getCourseAggregates(selectedCourseId)}
                  />
                </PageTransition>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

