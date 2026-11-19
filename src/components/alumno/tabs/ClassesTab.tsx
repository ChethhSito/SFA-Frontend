import { AttendanceRecord } from "../../../types";
import { studentAttendanceRecords } from "../../../utils/attendance";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Zap, Cpu, Sliders, Award, ChevronRight, ChevronLeft, ChevronDown, BookOpen, Clock, CheckCircle2, 
  Users, Upload, Plus, AlertCircle, FileText, CheckCircle, Calendar, Bookmark, MapPin, GraduationCap,
  Eye, Download, Trash2, Pencil, X, MessageSquare, Send, Check, ExternalLink
} from "lucide-react";
import { CourseMaterial, CourseAssignment, CourseEvaluation, AcademicProgram, StudentPersonalData } from "../../../types";
import PageTransition from "../../ui/PageTransition";
import Toast, { ToastNotice } from "../../ui/Toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import ConfirmModal from "../../ui/ConfirmModal";
import { courseFileUrl, fileToBase64 } from "../../../services/api";

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
  activeCourseComponentId?: string | null;
  setActiveCourseComponentId?: React.Dispatch<React.SetStateAction<string | null>>;
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
  onUpdateAssignments,
  activeCourseComponentId: propActiveCourseComponentId,
  setActiveCourseComponentId: propSetActiveCourseComponentId
}) => {
  const classesCoursesData = enrichedCourses;
  const activeCourse = classesCoursesData.find(c => c.name === selectedCourseDetail);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const [internalActiveCourseComponentId, setInternalActiveCourseComponentId] = useState<string | null>(() => {
    if (activeCourse?.code === "EIND-101" || activeCourse?.code?.startsWith("EIND-101")) {
      return "teo";
    }
    return null;
  });
  const activeCourseComponentId = propActiveCourseComponentId !== undefined ? propActiveCourseComponentId : internalActiveCourseComponentId;
  const setActiveCourseComponentId = propSetActiveCourseComponentId || setInternalActiveCourseComponentId;

  // Estados interactivos para la entrega de tareas del alumno
  const [selectedTaskFiles, setSelectedTaskFiles] = useState<Record<string, File | null>>({});
  const [taskComments, setTaskComments] = useState<Record<string, string>>({});
  const [editingTaskSubmission, setEditingTaskSubmission] = useState<Record<string, boolean>>({});
  const [taskSubmitting, setTaskSubmitting] = useState<Record<string, boolean>>({});

  // Visor modal de PDF oficial para guías y entregas
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string; fileName: string } | null>(null);
  const [resolvedPdfBlobUrl, setResolvedPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Modal de confirmación para eliminar entrega
  const [submissionToDelete, setSubmissionToDelete] = useState<{ assignmentId: string; assignmentTitle: string } | null>(null);
  const [isDeletingSubmission, setIsDeletingSubmission] = useState(false);

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
    if (activeCourse?.code === "EIND-101" || activeCourse?.code?.startsWith("EIND-101")) {
      setActiveCourseComponentId("teo");
    } else {
      setActiveCourseComponentId(null);
    }
  }, [selectedCourseDetail, activeCourse?.code]);

  useEffect(() => {
    if (!pdfModal?.url) {
      setResolvedPdfBlobUrl(null);
      setPdfLoading(false);
      return;
    }
    if (pdfModal.url.startsWith("blob:") || pdfModal.url.startsWith("data:")) {
      setResolvedPdfBlobUrl(pdfModal.url);
      setPdfLoading(false);
      return;
    }
    let active = true;
    setPdfLoading(true);
    fetch(pdfModal.url)
      .then(res => {
        if (!res.ok) throw new Error("Error cargando archivo");
        return res.blob();
      })
      .then(blob => {
        if (!active) return;
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const objectUrl = URL.createObjectURL(pdfBlob);
        setResolvedPdfBlobUrl(objectUrl);
      })
      .catch(err => {
        console.warn("No se pudo convertir a Blob URL:", err);
        if (active) setResolvedPdfBlobUrl(pdfModal.url);
      })
      .finally(() => {
        if (active) setPdfLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pdfModal]);

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

  const WEEK_CURRICULAR_TOPICS: Record<number, { topic: string; desc: string }> = {
    1: { topic: "Semana 1: Introducción y Fundamentos", desc: "Presentación del syllabus, lineamientos y diagnóstico inicial." },
    2: { topic: "Semana 2: Leyes y Magnitudes Eléctricas", desc: "Cálculo de magnitudes, leyes de Kirchhoff y análisis guiado." },
    3: { topic: "Semana 3: Laboratorio y Análisis de Circuitos", desc: "Prácticas de taller, mediciones técnicas y resolución de casos." },
    4: { topic: "Semana 4: Control Formativo de Unidad 1", desc: "Revisión de informes técnicos y verificación de avances." },
    5: { topic: "Semana 5: Circuitos en Corriente Continua", desc: "Análisis de redes y configuración en protoboard." },
    6: { topic: "Semana 6: Taller de Mediciones e Instrumental", desc: "Uso de multímetro, fuentes reguladas y osciloscopio." },
    7: { topic: "Semana 7: Potencia y Energía Eléctrica", desc: "Cálculo de consumo, rendimiento y disipación de calor." },
    8: { topic: "Semana 8: Examen Parcial de Semestre", desc: "Evaluación de medio ciclo y consolidación técnica." },
    9: { topic: "Semana 9: Máquinas Eléctricas y Bobinados", desc: "Principios electromagnéticos e inducción aplicada." },
    10: { topic: "Semana 10: Taller de Conexiones Industriales", desc: "Armado de tableros y esquemas de cableado." },
    11: { topic: "Semana 11: Seguridad y Protección de Circuitos", desc: "Interruptores termomagnéticos y puesta a tierra." },
    12: { topic: "Semana 12: Control Formativo de Unidad 3", desc: "Pruebas de continuidad, aislamiento y seguridad." },
    13: { topic: "Semana 13: Automatismos y Contactores", desc: "Esquemas de mando y arranque de motores." },
    14: { topic: "Semana 14: Diagnóstico y Detección de Fallas", desc: "Localización de averías y mantenimiento preventivo." },
    15: { topic: "Semana 15: Integración de Proyectos Técnicos", desc: "Pruebas finales de funcionamiento y montaje." },
    16: { topic: "Semana 16: Evaluación Final y Sustentación", desc: "Cierre del periodo lectivo y sustentación de proyectos." }
  };

  const getLocalWeekTheme = (courseCode: string, week: number) => {
    if (WEEK_CURRICULAR_TOPICS[week]) {
      return WEEK_CURRICULAR_TOPICS[week];
    }
    const unitNumber = Math.ceil(week / 4);
    return {
      topic: `Semana ${week}: Unidad ${unitNumber} - Desarrollo Curricular`,
      desc: "Sesión de aprendizaje práctico y desarrollo de competencias técnicas."
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

  // Cálculo de puntualidad / antelación de entrega respecto a la fecha límite
  const getSubmissionTiming = (submitDateStr?: string, dueDateStr?: string) => {
    if (!submitDateStr || !dueDateStr) {
      return { text: "Entregado a tiempo", isEarly: true, days: 0 };
    }
    try {
      const due = new Date(dueDateStr + "T23:59:59");
      const sub = new Date(submitDateStr);
      if (isNaN(sub.getTime()) || isNaN(due.getTime())) {
        return { text: "Entregado a tiempo", isEarly: true, days: 0 };
      }
      const diffMs = due.getTime() - sub.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) {
        return {
          text: `Entregado con ${diffDays} ${diffDays === 1 ? 'día' : 'días'}${diffHours > 0 ? ` y ${diffHours} h` : ''} de anticipación`,
          isEarly: true,
          days: diffDays
        };
      } else if (diffDays === 0 && diffHours >= 0) {
        return {
          text: `Entregado con ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'} de anticipación`,
          isEarly: true,
          days: 0
        };
      } else {
        const lateDays = Math.abs(diffDays);
        return {
          text: `Entregado con ${lateDays} ${lateDays === 1 ? 'día' : 'días'} de retraso`,
          isEarly: false,
          days: lateDays
        };
      }
    } catch {
      return { text: "Entregado a tiempo", isEarly: true, days: 0 };
    }
  };

  const formatSubmissionDateTime = (isoDateStr?: string) => {
    if (!isoDateStr) return "Fecha no registrada";
    try {
      const d = new Date(isoDateStr);
      if (isNaN(d.getTime())) return isoDateStr;
      return d.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return isoDateStr;
    }
  };

  const handleStudentSubmitTask = async (asgId: string) => {
    const file = selectedTaskFiles[asgId];
    const comment = taskComments[asgId] || "";
    const targetAsg = assignments.find(a => a.id === asgId);
    const prevSub = targetAsg?.submissions?.find(s => s.studentDni === studentDni);

    if (!file && !prevSub?.fileName) {
      setToastNotice({
        id: Date.now(),
        message: "Por favor seleccione un archivo en formato PDF o documento para su entrega.",
        kind: "warning",
      });
      return;
    }

    setTaskSubmitting(prev => ({ ...prev, [asgId]: true }));
    try {
      let fileBase64Content = prevSub?.fileBase64 || "";
      let fileName = prevSub?.fileName || "";
      let mimeType = prevSub?.mimeType || "application/pdf";

      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          setToastNotice({
            id: Date.now(),
            message: "El archivo no debe exceder los 15 MB.",
            kind: "warning",
          });
          return;
        }
        fileName = file.name;
        mimeType = file.type || "application/pdf";
        try {
          fileBase64Content = await fileToBase64(file);
        } catch {
          setToastNotice({
            id: Date.now(),
            message: "No se pudo leer el archivo seleccionado.",
            kind: "error",
          });
          return;
        }
      }

      const nowIso = new Date().toISOString();
      const updated = assignments.map(a => {
        if (a.id === asgId) {
          const existing = a.submissions || [];
          const nextSubs = existing.filter(s => s.studentDni !== studentDni);
          nextSubs.push({
            studentDni: studentDni,
            studentName: `${personalData.name} ${personalData.lastName}`,
            fileName,
            submitDate: nowIso,
            comment: comment.trim() || prevSub?.comment || undefined,
            fileBase64: fileBase64Content,
            mimeType,
            grade: prevSub?.grade,
            feedback: prevSub?.feedback
          });
          return { ...a, submissions: nextSubs };
        }
        return a;
      });

      onUpdateAssignments(updated);
      setSimulationHWFiles(prev => ({ ...prev, [asgId]: fileName }));
      setEditingTaskSubmission(prev => ({ ...prev, [asgId]: false }));
      setSelectedTaskFiles(prev => ({ ...prev, [asgId]: null }));

      setToastNotice({
        id: Date.now(),
        message: `Tarea entregada exitosamente: "${fileName}".`,
        kind: "success",
      });
    } finally {
      setTaskSubmitting(prev => ({ ...prev, [asgId]: false }));
    }
  };

  const handleDeleteStudentSubmission = () => {
    if (!submissionToDelete) return;
    setIsDeletingSubmission(true);
    try {
      const asgId = submissionToDelete.assignmentId;
      const updated = assignments.map(a => {
        if (a.id === asgId) {
          const existing = a.submissions || [];
          const nextSubs = existing.filter(s => s.studentDni !== studentDni);
          return { ...a, submissions: nextSubs };
        }
        return a;
      });
      onUpdateAssignments(updated);
      setSimulationHWFiles(prev => {
        const next = { ...prev };
        delete next[asgId];
        return next;
      });
      setSelectedTaskFiles(prev => ({ ...prev, [asgId]: null }));
      setTaskComments(prev => ({ ...prev, [asgId]: "" }));
      setEditingTaskSubmission(prev => ({ ...prev, [asgId]: false }));
      setToastNotice({
        id: Date.now(),
        message: "Entrega eliminada correctamente. Puede enviar un nuevo archivo.",
        kind: "info",
      });
    } finally {
      setIsDeletingSubmission(false);
      setSubmissionToDelete(null);
    }
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
    <PageTransition id="classes-workspace" className="w-full space-y-6 text-left relative">
      {/* Dynamic View Workspace */}
      <div className="w-full space-y-6">
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
                    <div className="space-y-4">
                      <div className="bg-amber-50 text-amber-900 border border-amber-200/80 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-3xs">
                        <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Recursos académicos oficiales para la sesión académica de la <strong>Semana {selectedClassWeek}</strong>.</span>
                      </div>

                      {mats.length === 0 ? (
                        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center mb-1 shadow-3xs">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            Sin Materiales Publicados en Semana {selectedClassWeek}
                          </h4>
                          <p className="text-xs text-slate-400 font-medium max-w-sm">
                            El docente a cargo aún no ha publicado diapositivas, separatas o guías teóricas para esta semana.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {mats.map((m: any) => {
                            const fileExt = (m.fileName || "").split('.').pop()?.toUpperCase() || "PDF";
                            const fileUrl = courseFileUrl('materials', m.id);
                            const isPdf = fileExt === "PDF";
                            return (
                              <div key={m.id} className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition-all shadow-3xs">
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#800521] border border-red-200 flex items-center justify-center font-black font-mono text-[11px] shrink-0 shadow-3xs">
                                    {fileExt}
                                  </div>
                                  <div className="min-w-0 text-left">
                                    <span className="text-xs font-black text-slate-900 block truncate" title={m.title}>
                                      {m.title}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono font-semibold block mt-0.5 truncate max-w-md">
                                      {m.fileName}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {isPdf && m.storedFileName && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPdfModal({
                                          url: fileUrl,
                                          title: "Material Didáctico Oficial",
                                          fileName: m.fileName
                                        });
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-[#800521] border border-slate-200 rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer active:scale-95"
                                      title="Ver material en visor modal"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-[#800521]" />
                                      <span>Ver Documento</span>
                                    </button>
                                  )}

                                  {m.storedFileName ? (
                                    <a
                                      href={fileUrl}
                                      download={m.fileName}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#800521] hover:bg-[#66041a] text-white rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer active:scale-95"
                                      title="Descargar material"
                                    >
                                      <Download className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Descargar</span>
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setToastNotice({
                                        id: Date.now(),
                                        message: `El archivo ${m.fileName} no está disponible actualmente en el servidor.`,
                                        kind: "info",
                                      })}
                                      className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-not-allowed"
                                    >
                                      No disponible
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
                    <div className="space-y-5">
                      {asgs.map((asg: any) => {
                        const prevSub = asg.submissions?.find((s: any) => s.studentDni === studentDni);
                        const hasSubmitted = !!simulationHWFiles[asg.id] || !!prevSub;
                        const currentFileName = simulationHWFiles[asg.id] || prevSub?.fileName || "";
                        const submissionDate = prevSub?.submitDate || new Date().toISOString();
                        const isGraded = prevSub?.grade !== undefined;
                        const isEditingThis = !!editingTaskSubmission[asg.id];
                        const timing = getSubmissionTiming(prevSub?.submitDate, asg.dueDate);

                        const guideFileName = asg.attachmentName || asg.attachment;
                        const guideUrl = asg.contentBase64 
                          ? `data:${asg.mimeType || 'application/pdf'};base64,${asg.contentBase64}` 
                          : courseFileUrl('assignments', asg.id);

                        const studentFileUrl = prevSub?.fileBase64 
                          ? `data:${prevSub.mimeType || 'application/pdf'};base64,${prevSub.fileBase64}`
                          : '#';

                        const cleanDisplayTitle = asg.title.replace(/^\[Semana\s*\d+\]\s*/i, "").trim();

                        return (
                          <div key={asg.id} className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white shadow-3xs text-left">
                            {/* Cabecera de la Tarea */}
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] bg-[#800521]/10 text-[#800521] border border-[#800521]/20 px-2.5 py-0.5 rounded-full font-black uppercase font-mono tracking-wider">
                                  Semana {selectedClassWeek} • Tarea Programada
                                </span>
                                <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 font-mono">
                                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                                  Límite: <strong className="text-slate-800">{asg.dueDate}</strong>
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-900 pt-0.5" title={asg.title}>
                                {cleanDisplayTitle || asg.title}
                              </h4>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed font-sans">
                                {asg.description}
                              </p>
                            </div>

                            {/* Rúbrica y Criterios */}
                            {asg.rubric && (
                              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                                    Criterios de Evaluación y Rúbrica
                                  </span>
                                  <p className="text-xs font-bold text-amber-950 font-sans leading-relaxed">
                                    {asg.rubric}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Guía de Apoyo Adjunta Oficial con diseño institucional */}
                            {guideFileName && (
                              <div className="bg-slate-50 hover:bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#800521] border border-red-200 flex items-center justify-center shrink-0 shadow-3xs">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 text-left">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-mono">
                                      Guía de Apoyo del Docente
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 block truncate max-w-xs sm:max-w-md font-mono" title={guideFileName}>
                                      {guideFileName}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPdfModal({
                                        url: guideUrl,
                                        title: "Guía de Apoyo Oficial de Taller",
                                        fileName: guideFileName
                                      });
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-[#800521] border border-slate-200 rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer active:scale-95"
                                    title="Ver guía en visor modal oficial"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#800521]" />
                                    <span>Ver Guía</span>
                                  </button>

                                  <a
                                    href={guideUrl}
                                    download={guideFileName}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#800521] hover:bg-[#66041a] text-white rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer active:scale-95"
                                    title="Descargar guía de apoyo"
                                  >
                                    <Download className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Descargar</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* SECCIÓN DEL ESTADO DEL ENVÍO DEL ESTUDIANTE */}
                            <div className="pt-3 border-t border-slate-150 space-y-3">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                                Estado de la Entrega:
                              </span>

                              {hasSubmitted && !isEditingThis ? (
                                <div className="p-4 sm:p-5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-4 font-sans text-left">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-3xs flex items-center gap-1.5">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Entregado para Calificar
                                      </span>
                                    </div>

                                    {/* Indicador de Antelación / Puntualidad */}
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 font-mono ${
                                      timing.isEarly 
                                        ? "bg-emerald-100 text-emerald-900 border-emerald-300" 
                                        : "bg-amber-100 text-amber-900 border-amber-300"
                                    }`}>
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{timing.text}</span>
                                    </div>
                                  </div>

                                  {/* Archivo entregado con acciones */}
                                  <div className="bg-white rounded-xl border border-emerald-200 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-3xs">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0 text-left">
                                        <span className="text-xs font-black text-slate-900 block truncate font-mono" title={currentFileName}>
                                          {currentFileName}
                                        </span>
                                        <span className="text-[10.5px] text-slate-400 font-semibold block">
                                          Registrado el: {formatSubmissionDateTime(submissionDate)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {prevSub?.fileBase64 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPdfModal({
                                              url: studentFileUrl,
                                              title: "Informe Entregado por el Alumno",
                                              fileName: currentFileName
                                            });
                                          }}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                          title="Ver mi informe en visor modal"
                                        >
                                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                                          <span>Ver Mi Archivo</span>
                                        </button>
                                      )}

                                      {prevSub?.fileBase64 && (
                                        <a
                                          href={studentFileUrl}
                                          download={currentFileName}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                                          title="Descargar mi archivo"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                          <span>Descargar</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  {/* Comentario del Alumno */}
                                  {prevSub?.comment && (
                                    <div className="bg-white/80 border border-emerald-200/70 rounded-xl p-3 space-y-1">
                                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Comentario de entrega del estudiante:</span>
                                      </div>
                                      <p className="text-xs text-slate-700 italic font-medium leading-relaxed pl-5">
                                        "{prevSub.comment}"
                                      </p>
                                    </div>
                                  )}

                                  {/* Calificación y Retroalimentación si ya fue calificada */}
                                  {isGraded ? (
                                    <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 space-y-2 text-left shadow-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                                          Calificación Oficial del Docente
                                        </span>
                                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                                          Registrado en Acta
                                        </span>
                                      </div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black font-mono text-[#800521]">
                                          {prevSub.grade}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 font-mono">/ 20 Puntos</span>
                                      </div>
                                      {prevSub.feedback && (
                                        <div className="pt-2 border-t border-slate-100 space-y-1">
                                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                            Retroalimentación Pedagógica:
                                          </span>
                                          <p className="text-xs text-slate-700 font-medium leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            "{prevSub.feedback}"
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                                      {/* Botones para Editar y Eliminar Entrega */}
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingTaskSubmission(prev => ({ ...prev, [asg.id]: true }));
                                            if (prevSub?.comment) {
                                              setTaskComments(prev => ({ ...prev, [asg.id]: prevSub.comment }));
                                            }
                                          }}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer"
                                          title="Modificar entrega de archivo o comentario"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                          <span>Editar Entrega</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSubmissionToDelete({
                                              assignmentId: asg.id,
                                              assignmentTitle: asg.title
                                            });
                                          }}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-3xs transition-all cursor-pointer"
                                          title="Eliminar entrega para volver a subirla"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                          <span>Eliminar</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* FORMULARIO DE ENVÍO DE TAREA */
                                <div className="p-4 sm:p-5 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl space-y-4 font-sans text-left">
                                  <div className="space-y-1">
                                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                      {isEditingThis ? "Editar Entrega de Tarea" : "Cargar Entrega de Tarea"}
                                    </h5>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                      Adjunte su informe técnico en PDF, hojas de cálculo o esquemas solicitados en la rúbrica.
                                    </p>
                                  </div>

                                  {/* Selector de Archivo */}
                                  <div>
                                    {!selectedTaskFiles[asg.id] ? (
                                      <label
                                        htmlFor={`hw-file-input-${asg.id}`}
                                        className="w-full border-2 border-dashed border-slate-300 hover:border-[#800521] bg-white hover:bg-rose-50/20 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group block"
                                      >
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-red-50 text-slate-500 group-hover:text-[#800521] flex items-center justify-center transition-colors">
                                          <Upload className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                          <span className="text-xs font-bold text-slate-700 group-hover:text-[#800521] block">
                                            Haga clic para seleccionar o arrastre su archivo aquí
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-semibold block">
                                            Formatos soportados: PDF, Word, Excel, esquemas CAD (Máx. 15 MB)
                                          </span>
                                        </div>
                                      </label>
                                    ) : (
                                      <div className="w-full bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-3xs">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-9 h-9 rounded-lg bg-red-50 text-[#800521] border border-red-200 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                          </div>
                                          <div className="min-w-0 text-left">
                                            <span className="text-xs font-black text-slate-900 block truncate font-mono">
                                              {selectedTaskFiles[asg.id]?.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold block">
                                              {((selectedTaskFiles[asg.id]?.size || 0) / 1024).toFixed(1)} KB • Archivo listo para enviar
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => setSelectedTaskFiles(prev => ({ ...prev, [asg.id]: null }))}
                                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="Cambiar archivo"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}

                                    <input
                                      type="file"
                                      id={`hw-file-input-${asg.id}`}
                                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        if (file) {
                                          setSelectedTaskFiles(prev => ({ ...prev, [asg.id]: file }));
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </div>

                                  {/* Comentario opcional para el docente */}
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                                      Comentarios o notas de entrega para el docente (opcional):
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={taskComments[asg.id] || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setTaskComments(prev => ({ ...prev, [asg.id]: val }));
                                      }}
                                      placeholder="Ej: Profesor, adjunto el informe con los esquemas de Proteus y los cálculos revisados según la guía."
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#800521] transition-all resize-none placeholder:text-slate-400"
                                    />
                                  </div>

                                  {/* Botones de acción */}
                                  <div className="flex items-center justify-end gap-2.5 pt-1">
                                    {isEditingThis && (
                                      <button
                                        type="button"
                                        onClick={() => setEditingTaskSubmission(prev => ({ ...prev, [asg.id]: false }))}
                                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      disabled={taskSubmitting[asg.id] || (!selectedTaskFiles[asg.id] && !prevSub?.fileName)}
                                      onClick={() => handleStudentSubmitTask(asg.id)}
                                      className="bg-[#800521] hover:bg-[#66041a] text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                    >
                                      <Upload className="w-4 h-4 text-amber-300" />
                                      <span>
                                        {taskSubmitting[asg.id] 
                                          ? "Enviando..." 
                                          : isEditingThis 
                                            ? "Guardar Cambios de Entrega" 
                                            : "Entregar Tarea Evaluativa"}
                                      </span>
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
                  const weekEvaluations = assignments.filter((a) => {
                    if (a.kind !== "assessment") return false;
                    if (a.title.startsWith("[Planilla] ")) return false;
                    const weekMatches = a.title.includes(`[Semana ${selectedClassWeek}]`) || a.title.includes(`Semana ${selectedClassWeek}`);
                    if (!weekMatches) return false;
                    if (selectedComponent) {
                      return a.courseId === selectedComponent.dbCourseId ||
                             a.courseId === selectedComponent.code ||
                             a.courseId === selectedComponent.id ||
                             (activeCourse && (a.courseId === activeCourse.id || a.courseId === activeCourseDbId)) ||
                             (selectedComponent.id === "teo" && (a.courseId.includes("teo") || a.title.toLowerCase().includes("teor"))) ||
                             (selectedComponent.id === "tal" && (a.courseId.includes("tal") || a.title.toLowerCase().includes("taller"))) ||
                             (selectedComponent.id === "lab" && (a.courseId.includes("lab") || a.title.toLowerCase().includes("lab")));
                    }
                    return !activeCourse ? true : (activeCourse.attendanceCourseIds?.includes(a.courseId) || a.courseId === activeCourse.id || a.courseId === activeCourseDbId);
                  });

                  if (weekEvaluations.length === 0) {
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

                  const activeSchedule = selectedComponent?.schedule || activeCourse?.schedule || "Lunes 08:00 AM - 10:00 AM";
                  const activeClassroom = selectedComponent?.classroom || activeCourse?.classroom || "Aula 101 - Pabellón A";
                  const activeTeacher = selectedComponent?.teacher || activeCourse?.teacherName || "Manuel Ramos Salazar";

                  return (
                    <div className="space-y-6 font-sans text-left">
                      {weekEvaluations.map((ev) => {
                        const sub = ev.submissions?.find((s: any) => s.studentDni === studentDni);
                        const hasGrade = sub && sub.grade !== undefined;
                        const isApproved = hasGrade && Number(sub.grade) >= 12.5;

                        // Clean title stripping [Semana X]
                        const cleanTitle = ev.title.replace(/\[Semana\s*\d+\]\s*/i, "").trim();
                        const isPresencial = ev.modality !== "virtual";
                        const isOfficialMilestone = !!ev.curricularComponent || /PC1|PC2|EX|FINAL|PARCIAL/i.test(ev.title);

                        return (
                          <div 
                            key={ev.id}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all space-y-0"
                          >
                            {/* Header de la Evaluación */}
                            <div className="p-5 bg-gradient-to-r from-rose-50/70 via-white to-slate-50/50 border-b border-rose-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9.5px] font-black text-[#800521] bg-rose-100/80 border border-rose-200 px-2.5 py-0.5 rounded uppercase font-mono tracking-wider">
                                    SEMANA {selectedClassWeek} • EVALUACIÓN
                                  </span>
                                  {isPresencial ? (
                                    <span className="text-[9.5px] font-black text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wide">
                                      MODALIDAD: PRESENCIAL
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] font-black text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wide">
                                      MODALIDAD: VIRTUAL
                                    </span>
                                  )}
                                  {isOfficialMilestone && (
                                    <span className="text-[9.5px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase tracking-wide">
                                      HITO CURRICULAR (20%)
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                  {cleanTitle}
                                </h3>
                              </div>

                              <div>
                                {hasGrade ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Calificado en Acta</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Pendiente de Calificación</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Aviso de Programación del Examen (Horario, Aula, Presencial) */}
                            <div className="p-5 space-y-4">
                              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    HORARIO Y SEDE DE APLICACIÓN:
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800">
                                    <span className="flex items-center gap-1.5 text-[#800521]">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {activeSchedule}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 text-slate-700">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      {activeClassroom}
                                    </span>
                                    <span>•</span>
                                    <span className="text-slate-500 font-medium">
                                      Docente: {activeTeacher}
                                    </span>
                                  </div>
                                </div>

                                {isPresencial && (
                                  <div className="text-[11px] font-bold text-rose-900 bg-rose-50/80 border border-rose-200/70 px-3 py-2 rounded-lg max-w-md">
                                    Examen Presencial en el aula y fecha programadas para esta semana lectiva. Debe asistir con puntualidad.
                                  </div>
                                )}
                              </div>

                              {/* Panel de Resultado del Estudiante */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                {/* Columna 1: Nota Oficial */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-left">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    CALIFICACIÓN OFICIAL (0 - 20):
                                  </span>
                                  {hasGrade ? (
                                    <div className="flex items-baseline gap-2">
                                      <span className={`text-3xl font-black font-mono ${isApproved ? "text-emerald-700" : "text-rose-700"}`}>
                                        {Number(sub.grade).toFixed(1)}
                                      </span>
                                      <span className="text-xs font-bold text-slate-400 font-mono">/ 20</span>
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ml-auto ${
                                        isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                      }`}>
                                        {isApproved ? "Aprobado" : "Desaprobado"}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="py-2">
                                      <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-block uppercase">
                                        Sin nota registrada
                                      </span>
                                      <p className="text-[10.5px] text-slate-400 font-medium mt-1.5">
                                        El docente registrará la nota con su firma PIN al culminar la evaluación.
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Columna 2 y 3: Observación / Retroalimentación del Docente */}
                                <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                      OBSERVACIÓN Y RETROALIMENTACIÓN DOCENTE:
                                    </span>
                                    {sub?.verifiedAt && (
                                      <span className="text-[9.5px] font-mono text-slate-400 font-bold">
                                        Firmado el: {new Date(sub.verifiedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {sub?.feedback ? (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                      <p className="text-xs text-slate-800 font-medium italic leading-relaxed">
                                        "{sub.feedback}"
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="py-2.5">
                                      <p className="text-[11px] text-slate-400 italic">
                                        Aún no se ha registrado observación ni retroalimentación por parte del docente.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

      {/* Modal de Confirmación para Eliminar Entrega del Estudiante */}
      <ConfirmModal
        isOpen={!!submissionToDelete}
        variant="danger"
        title="Eliminar Entrega de Tarea"
        message={
          <div className="space-y-3 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Está seguro de que desea retirar su entrega realizada para:
            </p>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <span className="text-xs font-black text-slate-900 block truncate">
                {submissionToDelete?.assignmentTitle}
              </span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200/60 rounded-lg p-2.5">
              Al retirar su entrega, el docente no podrá visualizar el archivo anterior y deberá subir una nueva entrega antes de la fecha límite.
            </p>
          </div>
        }
        confirmText="Sí, Eliminar Entrega"
        cancelText="Cancelar"
        isLoading={isDeletingSubmission}
        onClose={() => setSubmissionToDelete(null)}
        onConfirm={handleDeleteStudentSubmission}
      />

      {/* Visor Modal de PDF Oficial (Guías y Entregables) */}
      {pdfModal && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPdfModal(null);
          }}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[85vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Visor */}
            <div className="bg-[#800521] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs border-b border-[#800521]/20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-white/10 text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    {pdfModal.title}
                  </h3>
                  <p className="text-[10.5px] text-rose-200 font-mono truncate max-w-md">
                    {pdfModal.fileName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.open(resolvedPdfBlobUrl || pdfModal.url, "_blank")}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Abrir en pestaña nueva"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Pestaña Externa</span>
                </button>
                <button 
                  onClick={() => setPdfModal(null)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cerrar visor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Visor con iframe embebido y fallback reactivo */}
            <div className="flex-1 p-2 bg-slate-100 flex flex-col overflow-hidden relative">
              {pdfLoading && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-2xs flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#800521] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-slate-700">Cargando documento institucional...</span>
                </div>
              )}
              <iframe
                src={resolvedPdfBlobUrl || pdfModal.url}
                title={pdfModal.fileName}
                className="w-full flex-1 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-slate-500 font-bold truncate max-w-sm">
                {pdfModal.fileName}
              </span>
              <button
                type="button"
                onClick={() => setPdfModal(null)}
                className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
};
