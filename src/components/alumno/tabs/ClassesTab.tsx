import { AttendanceRecord } from "../../../types";
import { studentAttendanceRecords } from "../../../utils/attendance";
import React, { useState, useMemo, useEffect } from "react";
import { 
  Zap, Cpu, Sliders, Award, ChevronRight, ChevronDown, BookOpen, Clock, CheckCircle2, 
  Users, Upload, Plus, AlertCircle, FileText, CheckCircle, Calendar, Bookmark, MapPin, GraduationCap
} from "lucide-react";
import { CourseMaterial, CourseAssignment, CourseEvaluation, AcademicProgram, StudentPersonalData } from "../../../types";
import PageTransition from "../../ui/PageTransition";
import Toast, { ToastNotice } from "../../ui/Toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import { courseFileUrl } from "../../../services/api";

const COURSE_WEEKS = 16;

interface ClassesTabProps {
  attendance: AttendanceRecord[];
  attendanceLoading: boolean;
  attendanceError: string | null;
  enrichedCourses: any[];
  currentProgram?: AcademicProgram;
  selectedCourseDetail: string;
  setSelectedCourseDetail: React.Dispatch<React.SetStateAction<string>>;
  activeCourseSection: "general" | "horarios" | "week" | "cierre";
  setActiveCourseSection: React.Dispatch<React.SetStateAction<"general" | "horarios" | "week" | "cierre">>;
  selectedClassWeek: number;
  setSelectedClassWeek: React.Dispatch<React.SetStateAction<number>>;
  selectedClassWeekOption: "asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias";
  setSelectedClassWeekOption: React.Dispatch<React.SetStateAction<"asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias">>;
  simulationHWFiles: Record<string, string>;
  setSimulationHWFiles: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  expandedStudentWeeks: Record<number, boolean>;
  setExpandedStudentWeeks: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  studentDni: string;
  personalData: StudentPersonalData;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  attendance,
  attendanceLoading,
  attendanceError,
  enrichedCourses,
  currentProgram,
  selectedCourseDetail,
  setSelectedCourseDetail,
  activeCourseSection,
  setActiveCourseSection,
  selectedClassWeek,
  setSelectedClassWeek,
  selectedClassWeekOption,
  setSelectedClassWeekOption,
  simulationHWFiles,
  setSimulationHWFiles,
  expandedStudentWeeks,
  setExpandedStudentWeeks,
  materials,
  assignments,
  evaluations,
  studentDni,
  personalData,
  onUpdateAssignments
}) => {
  const classesCoursesData = enrichedCourses;
  const activeCourse = classesCoursesData.find(c => c.name === selectedCourseDetail);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const [activeCourseComponentId, setActiveCourseComponentId] = useState<string | null>(null);
  const [isStructureSidebarCollapsed, setIsStructureSidebarCollapsed] = useState(false);

  const subComponents = useMemo(() => {
    if (!activeCourse) return [];
    if (activeCourse.code === "EIND-101" || activeCourse.code?.startsWith("EIND-101")) {
      return [
        {
          id: "teo",
          code: "EIND-101-TEO",
          name: "Fundamentos de Electricidad y Circuitos CC (Teoría)",
          shortLabel: "Teoría",
          badge: "Teoría",
          schedule: "Lunes 08:00 AM - 10:00 AM",
          classroom: "Aula 101 - Pabellón A",
          teacher: activeCourse.teacherName || "Manuel Ramos Salazar",
          credits: 2,
          hours: "2 Horas",
          description: "Clases teóricas de fundamentos y circuitos.",
          dbCourseId: "6afc831d1bbefb1d4e11dd0e"
        },
        {
          id: "tal",
          code: "EIND-101-TAL",
          name: "Fundamentos de Electricidad y Circuitos CC (Taller)",
          shortLabel: "Taller",
          badge: "Taller",
          schedule: "Lunes 11:00 AM - 01:00 PM",
          classroom: "Taller de Máquinas Eléctricas y Tableros",
          teacher: activeCourse.teacherName || "Manuel Ramos Salazar",
          credits: 2,
          hours: "2 Horas",
          description: "Prácticas en tableros y máquinas eléctricas.",
          dbCourseId: "6afe1412016eccb3be7af0eb"
        },
        {
          id: "lab",
          code: "EIND-101-LAB",
          name: "Fundamentos de Electricidad y Circuitos CC (Laboratorio)",
          shortLabel: "Laboratorio",
          badge: "Laboratorio",
          schedule: "Viernes 08:00 AM - 10:00 AM",
          classroom: "Laboratorio de Cómputo y Simulación",
          teacher: activeCourse.teacherName || "Manuel Ramos Salazar",
          credits: 1,
          hours: "2 Horas",
          description: "Simulación de circuitos y mediciones de laboratorio.",
          dbCourseId: "6afe141f016eccb3be7af0ec"
        }
      ];
    }
    return [];
  }, [activeCourse]);

  useEffect(() => {
    setActiveCourseComponentId(null);
  }, [selectedCourseDetail]);

  const selectedComponent = subComponents.find((c) => c.id === activeCourseComponentId) || null;

  const renderCourseIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Zap":
        return <Zap className={className} />;
      case "Cpu":
        return <Cpu className={className} />;
      case "Sliders":
        return <Sliders className={className} />;
      case "BarChart3":
      default:
        return <Award className={className} />;
    }
  };

  const getLocalWeekTheme = (courseCode: string, week: number) => {
    const courseTitle = activeCourse?.name || courseCode;
    const unitNumber = Math.ceil(week / 4);

    if (week === 1) {
      return {
        topic: `Semana 1: Introducción, Fundamentos y Lineamientos de ${courseTitle}`,
        desc: `Presentación del syllabus, evaluación diagnóstica inicial y fundamentos conceptuales de ${courseTitle}.`
      };
    }
    if (week === 8) {
      return {
        topic: `Semana 8: Evaluación Parcial y Consolidación de ${courseTitle}`,
        desc: `Examen de medio ciclo, verificación de avances prácticos y retroalimentación técnica de ${courseTitle}.`
      };
    }
    if (week === 16) {
      return {
        topic: `Semana 16: Evaluación Final y Sustentación Integral de ${courseTitle}`,
        desc: `Consolidación final de competencias, sustentación de proyectos y cierre de actas de ${courseTitle}.`
      };
    }

    const subWeek = ((week - 1) % 4) + 1;
    const subThemes = [
      `Fundamentos teóricos y conceptualización técnica`,
      `Taller práctico y desarrollo guiado de casos`,
      `Laboratorio aplicado y resolución de problemas`,
      `Revisión formativa y control de avance de unidad`
    ];

    return {
      topic: `Semana ${week}: Unidad ${unitNumber} - ${subThemes[subWeek - 1]} de ${courseTitle}`,
      desc: `Sesión lectiva correspondiente a la Semana ${week} de ${courseTitle}: aplicación práctica, análisis de casos y desarrollo de competencias.`
    };
  };

  // If no course is active, render the grid of card courses
  if (!activeCourse) {
    return (
      <PageTransition id="classes-list" className="space-y-6 text-left">
        {/* Page Header Banner */}
        <div className="relative bg-[#800521] text-white rounded-xl shadow-md p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
          <div className="absolute inset-0 bg-linear-gradient(to right,rgba(128,5,33,0.95),rgba(0,0,0,0.65))" />
          <div className="relative z-10 space-y-2.5 max-w-3xl">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-3 py-1.5 w-max select-none rounded-xs block font-mono">
              PLANIFICACIÓN ACADÉMICA • PORTAL ALUMNO
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-none pt-1">
              Mis Asignaturas Asignadas
            </h2>
            <p className="text-xs text-slate-200 font-medium tracking-wide leading-relaxed">
              SELECCIONE UNA MATERIA PEDAGÓGICA PARA PROGRAMAR SEMANAS DE ASISTENCIA, TAREAS, EVALUACIONES Y EVIDENCIAS.
            </p>
          </div>
        </div>

        {/* Cards Grid Rediseñado Moderno */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classesCoursesData.map((courseItem) => {
            const courseIds = courseItem.attendanceCourseIds || [courseItem.id];
            const grades = assignments.filter((assignment) => courseIds.includes(assignment.courseId))
              .flatMap((assignment) => assignment.submissions || [])
              .filter((submission) => submission.studentDni === studentDni && submission.grade !== undefined)
              .map((submission) => Number(submission.grade));
            const averageGrade = grades.length ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(1) : "NR";
            return (
              <Card key={courseItem.id} className="group border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white hover:-translate-y-1">
                {/* Top Colored Accent Stripe */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#800521] via-amber-500 to-slate-900" />
                
                <div className="p-5 pb-4 space-y-3 text-left">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-black font-mono text-[#800521] bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-md tracking-wider">
                      {courseItem.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {courseItem.credits} Créditos
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        MATRICULADO
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#800521] transition-colors line-clamp-2">
                    {courseItem.name}
                  </h3>

                  {/* Professor / Mentor */}
                  <div className="flex items-center gap-2 pt-0.5 text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-[10px]">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {courseItem.teacherName || "Docente Asignado por Carrera"}
                    </span>
                  </div>
                </div>

                {/* Course Metadata Pill Boxes */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-b border-slate-100 space-y-2 text-left">
                  <div className="flex items-start gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Horario de Clases</span>
                      <span className="text-[11px] font-extrabold text-slate-800 leading-tight block mt-0.5">
                        {courseItem.schedule}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#800521] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Ambiente / Taller</span>
                      <span className="text-[11px] font-extrabold text-[#800521] leading-tight block mt-0.5">
                        {courseItem.classroom}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      Grupo {courseItem.group || "EI-I-A"} • {courseItem.studentCount || 35} cupos
                    </span>
                    <span className="font-mono font-black text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      Nota: {averageGrade} / 20
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 bg-white text-left">
                  <button
                    onClick={() => {
                      setSelectedCourseDetail(courseItem.name);
                      setActiveCourseSection("general");
                      setSelectedClassWeek(1);
                      setSelectedClassWeekOption("materiales");
                    }}
                    className="w-full bg-[#800521] hover:bg-[#66041a] text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-[1.01]"
                  >
                    <span>Ingresar al Aula Virtual</span>
                    <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </PageTransition>
    );
  }

  if (subComponents.length > 1 && !activeCourseComponentId) {
    return (
      <PageTransition id="classes-components-list" className="space-y-6 text-left font-sans">
        {/* Banner Institucional del Curso */}
        <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
          <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/80 opacity-95" />
          <div className="relative z-10 space-y-3 max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-3 py-1 rounded-sm font-mono">
                UNIDAD DIDÁCTICA • {activeCourse.code} • {activeCourse.credits || 4} CRÉDITOS
              </span>
              <button
                type="button"
                onClick={() => setSelectedCourseDetail("")}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                ← Volver a Mis Asignaturas
              </button>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight">
              {activeCourse.name}
            </h2>
            <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-2xl">
              Selecciona a qué clase deseas ingresar para revisar materiales, asistencias y tareas:
            </p>
          </div>
        </div>

        {/* Grid de Tarjetas de Componentes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subComponents.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-[#800521]/40"
            >
              <div>
                {/* Header de la Tarjeta */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#800521] bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    {comp.code}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#800521]/10 text-[#800521] border border-[#800521]/20">
                    {comp.badge}
                  </span>
                </div>

                {/* Contenido Principal */}
                <div className="p-5 space-y-4 text-left">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#800521] transition-colors leading-snug">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Horario de Sesión</span>
                        <span className="font-mono font-extrabold text-[#800521] text-[11px] block mt-0.5">{comp.schedule}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Ambiente / Laboratorio</span>
                        <span className="font-extrabold text-slate-700 text-[11px] block mt-0.5">{comp.classroom}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Docente Titular</span>
                        <span className="font-extrabold text-slate-700 text-[11px] block mt-0.5">{comp.teacher}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Entrada */}
              <div className="p-5 pt-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCourseComponentId(comp.id);
                    setActiveCourseSection("general");
                    setSelectedClassWeek(1);
                    setSelectedClassWeekOption("materiales");
                  }}
                  className="w-full bg-[#800521] hover:bg-[#66041a] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-[1.01]"
                >
                  <span>Ingresar a {comp.shortLabel}</span>
                  <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageTransition>
    );
  }

  const getMappedCourseId = (code: string) => {
    if (code === "EE-101" || code === "EIND-101") return "cur-elec-1"; 
    if (code === "EE-403" || code === "EIND-102") return "cur-elec-2"; 
    if (code === "EE-502" || code === "EIND-103") return "cur-elec-3"; 
    return code;
  };

  const activeCourseDbId = getMappedCourseId(activeCourse.code);

  const filteredDBMaterials = materials.filter(m => {
    const weekMatches = m.title.includes(`[Semana ${selectedClassWeek}]`) || m.title.includes(`Semana ${selectedClassWeek}`);
    if (!weekMatches) return false;
    if (selectedComponent) {
      return m.courseId === selectedComponent.dbCourseId ||
             m.courseId === selectedComponent.code ||
             (selectedComponent.id === "teo" && (m.courseId.includes("teo") || m.title.toLowerCase().includes("teor"))) ||
             (selectedComponent.id === "tal" && (m.courseId.includes("tal") || m.title.toLowerCase().includes("taller"))) ||
             (selectedComponent.id === "lab" && (m.courseId.includes("lab") || m.title.toLowerCase().includes("lab") || m.title.toLowerCase().includes("simula")));
    }
    const courseMatches = activeCourse.attendanceCourseIds?.includes(m.courseId) || m.courseId === activeCourse.id || m.courseId === activeCourseDbId;
    return courseMatches;
  });

  const filteredDBAssignments = assignments.filter(a => {
    const weekMatches = a.kind !== "assessment" && (a.title.includes(`[Semana ${selectedClassWeek}]`) || a.title.includes(`Semana ${selectedClassWeek}`));
    if (!weekMatches) return false;
    if (selectedComponent) {
      return a.courseId === selectedComponent.dbCourseId ||
             a.courseId === selectedComponent.code ||
             (selectedComponent.id === "teo" && (a.courseId.includes("teo") || a.title.toLowerCase().includes("teor"))) ||
             (selectedComponent.id === "tal" && (a.courseId.includes("tal") || a.title.toLowerCase().includes("taller"))) ||
             (selectedComponent.id === "lab" && (a.courseId.includes("lab") || a.title.toLowerCase().includes("lab") || a.title.toLowerCase().includes("simula")));
    }
    const courseMatches = activeCourse.attendanceCourseIds?.includes(a.courseId) || a.courseId === activeCourse.id || a.courseId === activeCourseDbId;
    return courseMatches;
  });

  const handleSimulateHWUpload = (asgId: string, customFileName: string) => {
    if (!customFileName.trim()) return;
    
    setSimulationHWFiles(prev => ({ ...prev, [asgId]: customFileName }));
    
    const updated = assignments.map(a => {
      if (a.id === asgId) {
        const existing = a.submissions || [];
        const nextSubs = existing.filter(s => s.studentDni !== studentDni);
        nextSubs.push({
          studentDni: studentDni,
          studentName: `${personalData.name} ${personalData.lastName}`,
          fileName: customFileName,
          submitDate: new Date().toISOString().split("T")[0]
        });
        return { ...a, submissions: nextSubs };
      }
      return a;
    });
    onUpdateAssignments(updated);
    setToastNotice({
      id: Date.now(),
      message: `Archivo "${customFileName}" subido exitosamente a la plataforma educativa como evidencia.`,
      kind: "success",
    });
  };

  const toggleWeekExpandedLocal = (wNum: number) => {
    setExpandedStudentWeeks(prev => ({ ...prev, [wNum]: !prev[wNum] }));
  };

  const courseResourceIds = selectedComponent?.dbCourseId
    ? [selectedComponent.dbCourseId]
    : (activeCourse.attendanceCourseIds || [activeCourse.id]);
  const courseGrades = assignments.filter((assignment) => courseResourceIds.includes(assignment.courseId))
    .flatMap((assignment) => assignment.submissions || [])
    .filter((submission) => submission.studentDni === studentDni && submission.grade !== undefined)
    .map((submission) => Number(submission.grade));
  const averageGrade = courseGrades.length ? (courseGrades.reduce((sum, grade) => sum + grade, 0) / courseGrades.length).toFixed(1) : "NR";
  const courseMaterialsCount = materials.filter((material) => courseResourceIds.includes(material.courseId)).length;
  const courseTasksCount = assignments.filter((assignment) => courseResourceIds.includes(assignment.courseId) && assignment.kind !== "assessment").length;
  const courseGradesCount = assignments.filter((assignment) => courseResourceIds.includes(assignment.courseId) && assignment.submissions?.some((submission) => submission.studentDni === studentDni && submission.grade !== undefined)).length;

  return (
    <PageTransition id="classes-workspace" className="flex flex-col md:flex-row gap-6 items-start text-left relative">
      {/* 2. SUB-SIDEBAR DE ESTRUCTURA ACADÉMICA (SEMANAS) CON BOTÓN FLOTANTE */}
      <div className={`shrink-0 relative z-20 transition-all duration-300 ease-in-out ${isStructureSidebarCollapsed ? "w-0 md:w-10" : "w-full md:w-64"}`}>
        <div className={`w-full md:w-64 transition-opacity duration-200 overflow-hidden ${isStructureSidebarCollapsed ? "opacity-0 pointer-events-none md:w-0" : "opacity-100"}`}>
          <aside className="w-full md:w-64 bg-[#FFFBFB] border border-rose-200/90 rounded-2xl flex flex-col overflow-hidden select-none text-left shadow-xs">
            <div className="h-1 w-full bg-gradient-to-r from-[#800521] via-amber-500 to-[#800521]" />
            <div className="p-4 border-b border-rose-100 bg-gradient-to-b from-rose-50/70 to-[#FFFBFB]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-black text-[#8B0026] bg-red-50 border border-red-150 px-2 py-0.5 rounded-sm select-none block w-max uppercase tracking-widest font-mono">
                  {selectedComponent ? selectedComponent.code : `Asignatura: ${activeCourse.code}`}
                </span>
                {selectedComponent && (
                  <span className="text-[8.5px] font-black text-[#800521] bg-[#800521]/10 border border-[#800521]/20 px-1.5 py-0.5 rounded uppercase font-mono">
                    {selectedComponent.shortLabel}
                  </span>
                )}
              </div>
              <h3 className="text-xs font-black text-slate-900 tracking-tight block mt-1.5 leading-snug break-words uppercase" title={selectedComponent ? selectedComponent.name : activeCourse.name}>
                {selectedComponent ? selectedComponent.name : activeCourse.name}
              </h3>
              <p className="text-[9px] text-[#CFA020] font-bold tracking-wider uppercase block mt-1">
                {selectedComponent ? selectedComponent.badge : "Estructura Académica"}
              </p>

              {subComponents.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCourseComponentId(null);
                    setActiveCourseSection("general");
                  }}
                  className="mt-3 w-full bg-white hover:bg-slate-100 text-[#800521] border border-slate-200 hover:border-[#800521]/30 rounded-lg text-[9.5px] font-black py-2 px-2 flex items-center justify-center gap-1.5 uppercase transition-all shadow-2xs cursor-pointer"
                >
                  <span>← Cambiar Componente</span>
                </button>
              )}
            </div>

            <div className="p-2 space-y-1 divide-y divide-slate-100/50 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="pb-1.5">
                <button
                  onClick={() => setActiveCourseSection("general")}
                  className={`w-full py-2 px-2.5 rounded-lg transition-all text-[11px] font-black uppercase text-left flex items-center gap-2 cursor-pointer ${
                    activeCourseSection === "general"
                      ? "bg-[#8B0026] text-white shadow-sm font-black"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="tracking-wide">General (Resumen)</span>
                </button>
              </div>

              <div className="py-1.5">
                <button
                  onClick={() => setActiveCourseSection("horarios")}
                  className={`w-full py-2 px-2.5 rounded-lg transition-all text-[11px] font-black uppercase text-left flex items-center gap-2 cursor-pointer ${
                    activeCourseSection === "horarios"
                      ? "bg-[#8B0026] text-white shadow-sm font-black"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="tracking-wide">Horarios Lectivos</span>
                </button>
              </div>

              <div className="py-2 space-y-1">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block px-2.5 pb-1">Desarrollo por Semanas</span>
                
                {Array.from({ length: COURSE_WEEKS }, (_, idx) => idx + 1).map((wNum) => {
                  const isExpanded = !!expandedStudentWeeks[wNum];
                  const isActiveWeek = activeCourseSection === "week" && selectedClassWeek === wNum;
                  return (
                    <div key={wNum} className="border-b border-slate-100 last:border-none">
                      <button
                        onClick={() => toggleWeekExpandedLocal(wNum)}
                        className={`w-full py-2 px-2.5 flex items-center justify-between transition-colors text-left text-[10.5px] font-extrabold ${
                          isActiveWeek
                            ? "bg-[#8B0026]/5 text-[#8B0026]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="tracking-wide">SEMANA {wNum}</span>
                        <span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          )}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="py-1 pl-3.5 space-y-0.5">
                          {[
                            { id: "asistencia", label: "Asistencia", icon: <Users className="w-3 h-3" /> },
                            { id: "materiales", label: "Materiales", icon: <Upload className="w-3 h-3" /> },
                            { id: "tareas", label: "Tareas", icon: <Plus className="w-3 h-3" /> },
                            { id: "evaluaciones", label: "Evaluaciones", icon: <Award className="w-3 h-3" /> },
                            { id: "observaciones", label: "Observaciones", icon: <AlertCircle className="w-3 h-3" /> },
                            { id: "evidencias", label: "Evidencias", icon: <FileText className="w-3 h-3" /> }
                          ].map((opt) => {
                            const isSubActive = isActiveWeek && selectedClassWeekOption === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setActiveCourseSection("week");
                                  setSelectedClassWeek(wNum);
                                  setSelectedClassWeekOption(opt.id as any);
                                }}
                                className={`w-full text-left py-1.5 px-2 rounded-md transition-all flex items-center gap-2 cursor-pointer text-[10px] font-bold ${
                                  isSubActive
                                    ? "bg-[#8B0026]/10 text-[#8B0026] border-l-2 border-[#8B0026] font-black"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                <span className={isSubActive ? "text-[#8B0026]" : "text-slate-400"}>{opt.icon}</span>
                                <span>{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="py-1.5">
                <button
                  onClick={() => setActiveCourseSection("cierre")}
                  className={`w-full py-2 px-2.5 rounded-lg transition-all text-[11px] font-black uppercase text-left flex items-center gap-2 cursor-pointer ${
                    activeCourseSection === "cierre"
                      ? "bg-[#8B0026] text-white shadow-sm font-black"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="tracking-wide">Cierre del Curso</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedCourseDetail("")}
                className="w-full bg-slate-100 hover:bg-slate-200 text-[#800521] border border-slate-200/60 rounded-lg text-[10px] font-black py-2.5 flex items-center justify-center gap-1.5 select-none uppercase transition-all cursor-pointer"
              >
                ← Volver a Cursos
              </button>
            </div>
          </aside>
        </div>

        {/* Desplegable / botón flotante 2: SEMANAS DEL CURSO (Blanco limpio con borde rosáceo) */}
        <button
          type="button"
          onClick={() => setIsStructureSidebarCollapsed(!isStructureSidebarCollapsed)}
          title={isStructureSidebarCollapsed ? "Expandir semanas del curso" : "Ocultar semanas del curso"}
          className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-40 bg-white hover:bg-[#800521] text-[#800521] hover:text-white border border-rose-300 hover:border-[#800521] w-[26px] h-[26px] rounded-full items-center justify-center shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95 group ${
            isStructureSidebarCollapsed ? "left-1" : "-right-[13px]"
          }`}
        >
          {isStructureSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          )}
        </button>
      </div>

      {/* RIGHT PANEL: Dynamic View Workspace */}
      <div className="flex-1 w-full space-y-6">
        {activeCourseSection === "general" && (
          <div className="space-y-6">
            <div className="relative bg-[#800521] text-white rounded-xl shadow-md p-6 overflow-hidden text-left border-b-4 border-amber-500">
              <div className="absolute inset-0 bg-linear-gradient(to right,rgba(128,5,33,0.95),rgba(0,0,0,0.65))" />
              <div className="relative z-10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 w-max select-none rounded-xs block font-mono">
                    {selectedComponent ? `${selectedComponent.code} • ${selectedComponent.badge}` : `INTRANET ACADÉMICA • ${activeCourse.code}`}
                  </span>
                  {subComponents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCourseComponentId(null);
                        setActiveCourseSection("general");
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>← Cambiar Componente</span>
                    </button>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-black font-display tracking-tight leading-none pt-1">
                  {selectedComponent ? selectedComponent.name : activeCourse.name}
                </h2>
                <p className="text-xs text-slate-200 font-medium tracking-wide">
                  {selectedComponent 
                    ? `Ambiente: ${selectedComponent.classroom} • Horario: ${selectedComponent.schedule} • Docente: ${selectedComponent.teacher}`
                    : `Plan Curricular IESTP San Francisco de Asís • Ciclo Académico Regular`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Capacidad del grupo</span>
                <span className="text-lg font-black text-slate-800 block mt-1.5">{activeCourse.studentCount || 0} cupos</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Materiales Activos</span>
                <span className="text-lg font-black text-[#800521] block mt-1.5">{courseMaterialsCount} {courseMaterialsCount === 1 ? "archivo" : "archivos"}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tareas Publicadas</span>
                <span className="text-lg font-black text-slate-800 block mt-1.5">{courseTasksCount} tareas</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Notas Registradas</span>
                <span className="text-lg font-black text-slate-800 block mt-1.5">{courseGradesCount} notas</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left col-span-2 md:col-span-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Promedio Parcial</span>
                <span className="text-lg font-black text-emerald-700 block mt-1.5">{averageGrade} / 20</span>
                <span className="text-[8.5px] text-emerald-600 font-bold block mt-0.5 uppercase tracking-wide">{courseGrades.length ? "Notas registradas" : "Sin calificaciones"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-left">
                <div className="p-4 border-b border-slate-200 bg-slate-50/40">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-display">
                    {selectedComponent ? `FICHA TÉCNICA: ${selectedComponent.badge.toUpperCase()}` : "FICHA TÉCNICA DE LA ASIGNATURA"}
                  </h3>
                </div>
                <div className="p-4 divide-y divide-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                  {[
                    { k: "Código de Unidad / Componente:", v: selectedComponent ? selectedComponent.code : activeCourse.code },
                    { k: "Nombre oficial:", v: selectedComponent ? selectedComponent.name : activeCourse.name },
                    { k: "Carrera Profesional:", v: currentProgram?.name || "ELECTRICIDAD INDUSTRIAL" },
                    { k: "Modalidad formativa:", v: selectedComponent ? selectedComponent.badge : "Presencial Regular" },
                    { k: "Créditos Académicos:", v: `${selectedComponent ? selectedComponent.credits : activeCourse.credits} Créditos Oficiales` },
                    { k: "Ambiente / Taller:", v: selectedComponent ? selectedComponent.classroom : activeCourse.classroom },
                    { k: "Horario Lectivo Oficial:", v: selectedComponent ? selectedComponent.schedule : activeCourse.schedule },
                    { k: "Rango de Semestre:", v: activeCourse.dates || "2027-03-22 / 2027-07-30 (Regular)" },
                    { k: "Docente Titular:", v: selectedComponent ? selectedComponent.teacher : (activeCourse.teacherName || "Manuel Ramos Salazar") }
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-between py-2.5">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">{row.k}</span>
                      <span className="text-slate-850 font-extrabold uppercase text-[11px] text-right truncate max-w-[280px]">
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-white border border-[#F1D2D5] rounded-xl p-5 shadow-xs text-center space-y-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Rendimiento Esperado</span>
                
                <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-r-transparent animate-spin-slow" />
                  <div className="z-10 text-center">
                    <span className="text-xl font-black text-emerald-800 font-mono block">{averageGrade}</span>
                    <span className="text-[8px] text-slate-400 font-black uppercase block">Promedio</span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600 text-[11px] font-bold leading-normal">
                  <p className="text-slate-800 font-black uppercase text-[10.5px]">{courseGrades.length ? "Rendimiento registrado" : "Sin calificaciones"}</p>
                  <p className="text-slate-400 font-semibold">{courseGrades.length ? "Promedio de sus calificaciones registradas en esta asignatura." : "El promedio aparecerá cuando el docente registre sus notas."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCourseSection === "horarios" && (
          <div className="space-y-6">
            <PageHeader
              title="Horarios Lectivos Oficiales"
              subtitle={selectedComponent ? `Programación horaria para: ${selectedComponent.name}` : "Distribución horaria presencial programada para el semestre en vigor."}
              icon={<Clock className="w-5 h-5 text-[#8B0026]" />}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/40">
                  <div>
                    <span className="text-[10px] text-amber-600 font-black uppercase block font-mono">
                      {selectedComponent ? selectedComponent.badge : "Sesión Programada"}
                    </span>
                    <CardTitle className="uppercase text-slate-800 text-sm mt-1">
                      {selectedComponent ? selectedComponent.shortLabel : "Clase Teórica - Práctica"}
                    </CardTitle>
                  </div>
                  <span className="px-2.5 py-1 bg-[#8B0026]/10 text-[#8B0026] border border-[#8B0026]/20 font-black text-[9px] uppercase rounded-sm">
                    {selectedComponent ? selectedComponent.schedule.split(" ")[0] : activeCourse.schedule.split(" ")[0]}
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5 text-xs text-slate-600 font-bold leading-normal">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400 font-semibold">Horario Establecido:</span>
                    <span className="text-slate-900 font-mono font-extrabold">
                      {selectedComponent ? selectedComponent.schedule : activeCourse.schedule}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400 font-semibold">Aula / Laboratorio:</span>
                    <span className="text-[#8B0026] uppercase font-extrabold">
                      {selectedComponent ? selectedComponent.classroom : activeCourse.classroom}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400 font-semibold">Docente Titular:</span>
                    <span className="text-slate-900 uppercase font-extrabold">
                      {selectedComponent ? selectedComponent.teacher : (activeCourse.teacherName || "Manuel Ramos Salazar")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Frecuencia de Repetición:</span>
                    <span className="text-slate-900 uppercase font-black tracking-wide text-[10.5px]">Semanal síncrono presencial</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeCourseSection === "cierre" && (
          <div className="space-y-6">
            <PageHeader
              title="Cierre de Curso y Planilla de Notas"
              subtitle="Consolidado definitivo de notas del alumno para la habilitación de actas oficiales."
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />

            <Card className="border border-slate-200">
              <CardHeader className="p-5 border-b bg-slate-50/35">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-800">
                  RECAPITULACIÓN DEL SEMESTRE DE ESTUDIOS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {(() => {
                  const numAverage = averageGrade !== "NR" ? parseFloat(averageGrade) : null;
                  const courseStatus = numAverage === null ? "Matriculado" : numAverage >= 12.5 ? "Aprobado" : "Desaprobado";
                  const statusBg = courseStatus === "Aprobado" ? "bg-purple-50 text-purple-900 border-purple-200" : courseStatus === "Matriculado" ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-red-50 text-red-950 border-red-100";
                  const statusLabelColor = courseStatus === "Aprobado" ? "text-purple-700" : courseStatus === "Matriculado" ? "text-emerald-700" : "text-red-800";

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-3 rounded-lg text-center border ${statusBg}`}>
                        <span className={`text-[9px] font-bold uppercase block ${statusLabelColor}`}>Situación de Curso</span>
                        <span className="text-lg font-black block mt-1">{courseStatus}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center border">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Promedio Final</span>
                        <span className="text-lg font-black text-slate-800 block mt-1 font-mono">{averageGrade}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center border">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Asistencia Registrada</span>
                        <span className="text-lg font-black text-slate-800 block mt-1 font-mono">
                          {courseGradesCount > 0 ? "100%" : "Regular"}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-center border">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Horas de Plan de Estudios</span>
                        <span className="text-lg font-black text-slate-800 block mt-1 font-mono">
                          {((activeCourse as any).hours || (activeCourse as any).credits * 16 || 64)} Horas
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
                  <span className="font-extrabold text-slate-800 block mb-3 uppercase text-[10.5px] tracking-wide">
                    Matriz Semestral de Trabajos y Evaluaciones Continuas
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    {Array.from({ length: COURSE_WEEKS }, (_, i) => i + 1).map((w) => {
                      const weekAssignment = assignments.find(a => {
                        const courseMatches = activeCourse.attendanceCourseIds?.includes(a.courseId) || a.courseId === activeCourse.id || a.courseId === activeCourseDbId;
                        return courseMatches && (a.title.includes(`[Semana ${w}]`) || a.title.includes(`Semana ${w}`));
                      });
                      const studentSub = weekAssignment?.submissions?.find((s: any) => s.studentDni === studentDni && s.grade !== undefined);
                      const weekEval = (evaluations || []).find((e: any) => {
                        const courseMatches = e.courseId === activeCourse.id || e.courseId === activeCourseDbId;
                        return courseMatches && (e.week === w || e.title?.includes(`Semana ${w}`));
                      });
                      const finalGrade = studentSub?.grade !== undefined ? studentSub.grade : (weekEval?.grade !== undefined ? weekEval.grade : null);
                      const hasGrade = finalGrade !== null;

                      return (
                        <div key={w} className="bg-white p-2.5 rounded border border-slate-200 flex flex-col items-center justify-between">
                          <span className="text-[9.5px] text-slate-400 font-bold">Sem {w}</span>
                          <span className={`text-[11.5px] font-mono font-black mt-1 ${hasGrade ? "text-[#800521]" : "text-slate-400"}`}>
                            {hasGrade ? finalGrade : "NR"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeCourseSection === "week" && (() => {
          const weekTheme = getLocalWeekTheme(activeCourse.code, selectedClassWeek);
          return (
            <div className="space-y-6">
              {/* Themed Week Header Banner (Idéntico estilo institucional que Docente) */}
              <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 overflow-hidden text-left border-b-4 border-amber-500">
                <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-md">
                      <span className="text-[9px] uppercase font-mono tracking-tighter leading-none">SEMANA</span>
                      <span className="text-2xl leading-none font-display">{selectedClassWeek}</span>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="bg-white/20 text-amber-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block select-none font-mono">
                        {selectedComponent ? selectedComponent.code : activeCourse.code} • {selectedClassWeekOption.toUpperCase()}
                      </span>
                      <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase leading-snug break-words">
                        {weekTheme.topic}
                      </h2>
                      <p className="text-xs text-white/90 font-medium font-mono leading-relaxed break-words">
                        {weekTheme.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold bg-black/30 border border-white/20 px-3 py-1.5 rounded-xl uppercase text-amber-300">
                      Periodo 2027-I
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                {selectedClassWeekOption === "asistencia" && (() => {
                  if (attendanceLoading) return <p role="status" className="p-4 text-xs font-bold text-slate-500">Cargando registros de asistencia...</p>;
                  if (attendanceError) return <p role="alert" className="p-4 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">{attendanceError}</p>;
                  
                  const targetCourseIds = selectedComponent
                    ? [selectedComponent.dbCourseId, selectedComponent.code, selectedComponent.id]
                    : (activeCourse.attendanceCourseIds || [activeCourse.id, activeCourse.code, activeCourseDbId]);

                  const records = (attendance || []).filter((record) => {
                    if (record.week !== selectedClassWeek) return false;
                    const cId = record.courseId || "";
                    const matchCourse = targetCourseIds.includes(cId) ||
                      (selectedComponent?.dbCourseId && cId === selectedComponent.dbCourseId) ||
                      (selectedComponent?.code && cId === selectedComponent.code) ||
                      (selectedComponent?.id === "teo" && (cId.toLowerCase().includes("teo") || (record as any).sessionType === "Teoría")) ||
                      (selectedComponent?.id === "tal" && (cId.toLowerCase().includes("tal") || (record as any).sessionType === "Taller")) ||
                      (selectedComponent?.id === "lab" && (cId.toLowerCase().includes("lab") || (record as any).sessionType === "Laboratorio"));
                    
                    if (!matchCourse) return false;
                    return record.statusMap && record.statusMap[studentDni] !== undefined;
                  });

                  const formatSessionDate = (rawDate: string) => {
                    if (!rawDate) return "Fecha no especificada";
                    const parts = rawDate.split("-");
                    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                    return rawDate;
                  };

                  return (
                    <div className="space-y-4 text-left font-sans">
                      {/* Institutional Section Header Box (Same as Docente) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#800521] border border-red-200 flex items-center justify-center font-black shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                              Semana {selectedClassWeek}: Control Diario de Asistencia
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {selectedComponent ? `${selectedComponent.classroom} • ${selectedComponent.schedule} • Docente: ${selectedComponent.teacher}` : "Historial de sesiones dictadas y control de puntualidad."}
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black font-mono shrink-0">
                          {records.length} {records.length === 1 ? "Sesión Registrada" : "Sesiones Registradas"}
                        </span>
                      </div>

                      {records.length > 0 ? (
                        <div className="space-y-3">
                          {records.map((record) => {
                            const status = record.statusMap[studentDni] || "Sin registrar";
                            let badgeClass = "bg-slate-100 text-slate-650 border-slate-200";
                            let statusIcon = <Clock className="w-4 h-4 text-slate-400" />;
                            if (status === "Presente") {
                              badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                              statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                            } else if (status === "Tardanza") {
                              badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                              statusIcon = <Clock className="w-4 h-4 text-amber-600" />;
                            } else if (status === "Falta") {
                              badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                              statusIcon = <AlertCircle className="w-4 h-4 text-rose-600" />;
                            } else if (status === "Justificado") {
                              badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                              statusIcon = <CheckCircle className="w-4 h-4 text-blue-600" />;
                            }

                            return (
                              <div key={record.id || (record as any)._id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-[#800521]/30 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#800521] shrink-0 font-mono">
                                    <Calendar className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm font-black text-slate-900">
                                        Fecha: {formatSessionDate(record.date)}
                                      </span>
                                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                                        {selectedComponent ? selectedComponent.badge : "Dictado Regular"}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                      {selectedComponent ? `${selectedComponent.classroom} • Horario: ${selectedComponent.schedule} • Docente: ${selectedComponent.teacher}` : activeCourse.schedule}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase font-mono border flex items-center gap-1.5 ${badgeClass}`}>
                                    {statusIcon}
                                    <span>{status}</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                          <Clock className="w-8 h-8 text-slate-300" />
                          <p className="text-xs font-black text-slate-700 uppercase tracking-tight">No hay sesiones registradas en esta semana</p>
                          <p className="text-xs text-slate-400 font-medium max-w-sm">
                            El docente registrará la lista al momento de iniciar las horas lectivas presenciales.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {selectedClassWeekOption === "materiales" && (() => {
                  const mats = filteredDBMaterials;
                  return (
                    <div className="space-y-3">
                      <div className="bg-amber-50 text-amber-900 border border-amber-100 p-3 rounded-lg text-[11px] font-bold flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Recursos académicos oficiales para la sesión académica de la <strong>Semana {selectedClassWeek}</strong>.</span>
                      </div>
                      {mats.length === 0 && <p className="rounded-lg border p-4 text-sm text-slate-500">El docente aún no ha publicado materiales para esta semana.</p>}
                      {mats.map((m: any) => {
                        const fileExtension = m.fileName.split('.').pop()?.toUpperCase() || "PDF";
                        return (
                          <div key={m.id} className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl flex items-center justify-between gap-4 transition-all">
                            <div className="flex items-center gap-3">
                              <span className="p-2 bg-red-50 text-[#800521] border border-red-100 rounded-md font-mono font-black text-[10px]">
                                {fileExtension}
                              </span>
                              <div>
                                <span className="text-xs font-black text-slate-800 block">{m.title}</span>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Archivo: <span className="font-mono text-blue-600 underline">{m.fileName}</span></span>
                              </div>
                            </div>
                            {m.storedFileName ? (
                              <a
                                href={courseFileUrl('materials', m.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#800521]/10 hover:bg-[#800521] text-[#800521] hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all inline-flex items-center"
                              >
                                Descargar
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setToastNotice({
                                  id: Date.now(),
                                  message: `El archivo ${m.fileName} no está alojado en el servidor institucional.`,
                                  kind: "info",
                                })}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                              >
                                No disponible
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {selectedClassWeekOption === "tareas" && (() => {
                  const asgs = filteredDBAssignments;
                  if (asgs.length === 0) {
                    return (
                      <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2 font-sans">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-650">Sin tareas programadas</h4>
                        <p className="text-[11px] text-slate-450 max-w-sm mx-auto">
                          El docente a cargo no ha programado tareas evaluativas para la Semana {selectedClassWeek}.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {asgs.map((asg: any) => {
                        const prevSub = asg.submissions?.find((s: any) => s.studentDni === studentDni);
                        const hasSubmitted = !!simulationHWFiles[asg.id] || !!prevSub;
                        const currentFileName = simulationHWFiles[asg.id] || prevSub?.fileName || "";
                        const submissionDate = prevSub?.submitDate || new Date().toISOString().split("T")[0];
                        const isGraded = prevSub?.grade !== undefined;
                        
                        return (
                          <div key={asg.id} className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white shadow-xs">
                            <div className="space-y-1">
                              <span className="text-[9px] bg-red-100 text-[#8B0026] border border-red-200 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                Tarea Programada
                              </span>
                              <h4 className="text-xs font-black text-slate-850 pt-1">{asg.title}</h4>
                              <p className="text-[11px] text-slate-550 font-medium leading-relaxed font-sans">{asg.description}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 space-y-1.5 font-sans">
                              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="text-slate-400">Fecha Límite:</span> <span className="text-slate-800 font-extrabold">{asg.dueDate}</span></div>
                              {asg.rubric && <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-500 shrink-0" /> <span className="text-slate-400">Rúbrica de Evaluación:</span> <span className="text-slate-800 font-black">{asg.rubric}</span></div>}
                              {asg.attachment && <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" /> <span className="text-slate-400">Guía de Apoyo:</span> {asg.storedFileName ? <a href={courseFileUrl('assignments', asg.id)} className="text-blue-600 underline font-mono">{asg.attachment}</a> : <span className="text-slate-500 font-mono">{asg.attachment} (no disponible)</span>}</div>}
                            </div>

                            <div className="pt-2 border-t border-slate-100 space-y-3">
                              <span className="text-[9.5px] text-slate-450 font-black uppercase tracking-wider block">Estado del Envío:</span>
                              
                              {hasSubmitted ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-900 rounded-lg space-y-1.5 font-sans">
                                  <div className="flex items-center gap-2 font-black text-xs">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>¡TAREA ENVIADA EXITOSAMENTE!</span>
                                  </div>
                                  <p className="text-[10px] text-emerald-800 font-bold">
                                    Archivo de entrega: <span className="font-mono text-emerald-950 font-black underline">{currentFileName}</span>
                                  </p>
                                  <p className="text-[9px] text-emerald-650 font-semibold">
                                    Fecha de envío registrado: {submissionDate}
                                  </p>
                                  {isGraded ? (
                                    <div className="mt-2 bg-white border border-emerald-200 p-2.5 rounded-md space-y-1 text-slate-800">
                                      <div className="text-[10px] font-black text-slate-450 uppercase font-mono">Nota del Docente:</div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg font-black font-mono text-[#800521]">{prevSub.grade} / 20</span>
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 py-0.5 px-2 rounded">Calificado</span>
                                      </div>
                                      {prevSub.feedback && (
                                        <p className="text-[10.5px] text-slate-600 italic font-medium leading-normal mt-1">
                                          "{prevSub.feedback}"
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-block mt-1 bg-yellow-400 text-slate-900 py-0.5 px-2 rounded-sm text-[9px] font-black uppercase">
                                      Esperando Calificación del Docente
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-xs font-sans space-y-3">
                                  <p className="text-slate-500 font-bold text-[11px] text-center">
                                    Arrastre su archivo corregido aquí, o ingrese el nombre del entregable para sincronizar:
                                  </p>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      id={`hw-filename-input-${asg.id}`}
                                      placeholder="Ej: informe_semana3_castillo.pdf"
                                      className="bg-white border rounded h-10 px-2.5 py-1.5 font-mono text-slate-800 flex-1 text-xs focus:ring-1 focus:ring-[#800521] focus:outline-none"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          const input = document.getElementById(`hw-filename-input-${asg.id}`) as HTMLInputElement;
                                          if (input && input.value.trim()) {
                                            handleSimulateHWUpload(asg.id, input.value);
                                          }
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById(`hw-filename-input-${asg.id}`) as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                          handleSimulateHWUpload(asg.id, input.value);
                                        } else {
                                          setToastNotice({
                                            id: Date.now(),
                                            message: "Por favor digite un nombre de archivo válido.",
                                            kind: "warning",
                                          });
                                        }
                                      }}
                                      className="bg-[#800521] hover:bg-[#9F062A] text-white h-10 px-4 rounded text-[10.5px] font-black uppercase cursor-pointer select-none"
                                    >
                                      Entregar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {selectedClassWeekOption === "evaluaciones" && (() => {
                  const weekAsgs = filteredDBAssignments;
                  const currentAsg = weekAsgs[0];
                  const sub = currentAsg?.submissions?.find((s: any) => s.studentDni === studentDni);
                  const submissionFile = currentAsg ? (simulationHWFiles[currentAsg.id] || sub?.fileName) : undefined;
                  
                  if (!currentAsg) {
                    return (
                      <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2 font-sans">
                        <Award className="w-8 h-8 text-slate-300 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-650">Sin evaluaciones para esta semana</h4>
                        <p className="text-[11px] text-slate-450 max-w-sm mx-auto">
                          No existen rúbricas ni criterios de evaluación registrados para la Semana {selectedClassWeek}.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 font-sans">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <span className="text-[9.5px] text-[#800521] font-black uppercase tracking-wider block font-display">
                          Puntajes y Criterios Recibidos
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1 text-left">
                            <span className="text-slate-400 font-bold text-[10px] block">Criterio Semanal</span>
                            <span className="text-slate-850 font-black block text-xs">Evaluación Técnica de Laboratorios</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#800521]">
                              <span>Ponderación:</span>
                              <span>10%</span>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-slate-150 flex flex-col justify-between text-left">
                            <span className="text-slate-400 font-bold text-[10px] block">Registro de Asistencia</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 block animate-pulse" />
                              <span className="text-emerald-800 font-black text-xs uppercase">Presente</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-slate-100 text-xs text-slate-700 space-y-2 text-left">
                          <span className="font-extrabold text-[10.5px] text-slate-850 block">Nota del Trabajo Evaluativo de la Semana</span>
                          {submissionFile ? (
                            <div className="flex justify-between items-center bg-slate-50/60 p-2 rounded border border-slate-100">
                              <div>
                                <span className="font-bold text-slate-800 block text-[11px]">{weekAsgs[0]?.title}</span>
                                <span className="text-[9px] text-slate-450 block font-mono">Entregable: {submissionFile}</span>
                              </div>
                              {sub?.grade !== undefined ? (
                                <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                  {sub.grade} / 20
                                </span>
                              ) : (
                                <span className="font-bold text-[10px] text-slate-800 bg-amber-400 px-2.5 py-0.5 rounded uppercase">
                                  En Revisión
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-center p-3 text-slate-450 font-semibold italic text-[11px] flex items-center justify-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Aún no registra entrega de trabajo para esta semana.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {selectedClassWeekOption === "observaciones" && (
                  <div className="space-y-4 font-sans text-left">
                    <div className="bg-[#800521]/5 text-[#800521] border border-[#800521]/15 p-3.5 rounded-xl text-[11px] font-bold flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-[#800521] shrink-0" />
                      <span>Bitácora de seguimiento escolar y formativo para la <strong>Semana {selectedClassWeek}</strong>.</span>
                    </div>

                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-1.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Expediente Conforme</h4>
                      <p className="text-[11px] text-slate-400 font-medium max-w-sm">
                        No se registran observaciones disciplinarias ni de rendimiento para esta semana en su ficha del estudiante.
                      </p>
                    </div>
                  </div>
                )}

                {selectedClassWeekOption === "evidencias" && (() => {
                  const weekAsgs = filteredDBAssignments;
                  const currentAsg = weekAsgs[0];
                  const sub = currentAsg?.submissions?.find((s: any) => s.studentDni === studentDni);
                  const submissionFile = currentAsg ? (simulationHWFiles[currentAsg.id] || sub?.fileName) : undefined;
                  return (
                    <div className="space-y-3 font-sans">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4 text-left">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Nombre del Archivo</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Estado</span>
                        </div>
                        {submissionFile ? (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-450" />
                              <span className="text-xs font-mono font-bold text-slate-700">{submissionFile}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                              sub?.grade !== undefined ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-yellow-100 text-yellow-850"
                            }`}>
                              {sub?.grade !== undefined ? "Calificado" : "Entregado"}
                            </span>
                          </div>
                        ) : (
                          <p className="text-center text-slate-450 font-bold py-6 italic text-xs">
                            Ninguna evidencia de trabajo subida para esta semana.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          );
        })()}
      </div>

      {toastNotice && (
        <Toast notice={toastNotice} onClose={() => setToastNotice(null)} />
      )}
    </PageTransition>
  );
};
