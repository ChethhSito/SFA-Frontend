import { AttendanceRecord } from "../../../types";
import { studentAttendanceRecords } from "../../../utils/attendance";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Zap, Cpu, Sliders, Award, ChevronRight, ChevronLeft, ChevronDown, BookOpen, Clock, CheckCircle2,
  Users, Upload, Plus, AlertCircle, FileText, CheckCircle, Calendar, Bookmark, MapPin, GraduationCap,
  Eye, Download, Trash2, Pencil, X, MessageSquare, Send, Check, ExternalLink, Loader2
} from "lucide-react";
import { CourseMaterial, CourseAssignment, CourseEvaluation, AcademicProgram, StudentPersonalData } from "../../../types";
import PageTransition from "../../ui/PageTransition";
import Toast, { ToastNotice } from "../../ui/Toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import ConfirmModal from "../../ui/ConfirmModal";
import { courseFileUrl, assignmentSubmissionFileUrl, fileToBase64 } from "../../../services/api";
import { getCourseFormula } from "../../../constants/courseFormulas";

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
  assignmentsLoading?: boolean;
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
  assignmentsLoading = false,
  activeCourseComponentId: propActiveCourseComponentId,
  setActiveCourseComponentId: propSetActiveCourseComponentId
}) => {
  const isMateo = studentDni === "74859612";
  const isPromotedCycle2 = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle2_${studentDni}`) === "true" ||
    localStorage.getItem(`sfa_student_cycle_${studentDni}`) === "2" ||
    localStorage.getItem(`sfa_cycle2_payment_${studentDni}`) === "true" ||
    (isMateo && (
      localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
      localStorage.getItem("sfa_student_promoted_cycle2") === "true" ||
      localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
      localStorage.getItem("sfa_student_cycle") === "2" ||
      localStorage.getItem("sfa_cycle2_payment_74859612") === "true"
    ))
  );

  const [selectedClassesPeriod, setSelectedClassesPeriod] = useState<"2027-II" | "2027-I">(() => {
    return isPromotedCycle2 ? "2027-II" : "2027-I";
  });

  const isContabilidad = personalData?.dni === "71248596" || enrichedCourses.some(c => c.career?.toLowerCase().includes("contab") || c.code?.includes("CONT"));

  const classesCoursesData = useMemo(() => {
    if (selectedClassesPeriod === "2027-II") {
      const c2 = enrichedCourses.filter(c => c.code?.includes("-20") || c.cycle === "Ciclo II" || c.cycle === 2 || c.group?.includes("II"));
      if (c2.length > 0 && !c2.some(c => isContabilidad && c.code?.includes("EIND"))) {
        return c2;
      }
      if (isContabilidad) {
        return [
          {
            id: "cur_co_201",
            code: "CONT-201",
            name: "Contabilidad General Aplicada",
            credits: 4,
            classroom: "Aula 201 • Pabellón C",
            schedule: "Lunes y Miércoles 08:00 AM - 10:00 AM",
            teacherName: "Lic. Patricia Elena Benavides Silva",
            group: "Grupo CONT-II-A • 30 cupos",
            cycle: "Ciclo II"
          },
          {
            id: "cur_co_202",
            code: "CONT-202",
            name: "Administración de Archivos Contables",
            credits: 3,
            classroom: "Aula 202 • Pabellón C",
            schedule: "Martes 08:00 AM - 11:00 AM",
            teacherName: "Lic. Patricia Elena Benavides Silva",
            group: "Grupo CONT-II-A • 30 cupos",
            cycle: "Ciclo II"
          },
          {
            id: "cur_co_203",
            code: "CONT-203",
            name: "Sistema de Información Contable I",
            credits: 3,
            classroom: "Lab. Contable 1 • Pabellón C",
            schedule: "Jueves 08:00 AM - 11:00 AM",
            teacherName: "Lic. Fernando Gabriel Díaz Torres",
            group: "Grupo CONT-II-A • 30 cupos",
            cycle: "Ciclo II"
          },
          {
            id: "cur_co_204",
            code: "CONT-204",
            name: "Tributación y Legislación Comercial",
            credits: 2,
            classroom: "Aula 203 • Pabellón C",
            schedule: "Viernes 08:00 AM - 10:00 AM",
            teacherName: "Dr. Roberto Carlos Vega Santos",
            group: "Grupo CONT-II-A • 30 cupos",
            cycle: "Ciclo II"
          },
          {
            id: "cur_co_205",
            code: "CONT-205",
            name: "Inglés Técnico para Contabilidad",
            credits: 2,
            classroom: "Aula 204 • Pabellón C",
            schedule: "Viernes 10:00 AM - 12:00 PM",
            teacherName: "Lic. Sofía Lorena Valenzuela Ríos",
            group: "Grupo CONT-II-A • 30 cupos",
            cycle: "Ciclo II"
          }
        ];
      }
      const defaultCycle2 = [
        {
          id: "cur_ei_201",
          code: "EIND-201",
          name: "Circuitos Eléctricos en Corriente Alterna",
          credits: 4,
          classroom: "Aula 201 • Pabellón A",
          schedule: "Martes y Jueves 08:00 AM - 12:00 PM",
          teacherName: "Ing. Manuel Ramos Salazar",
          group: "Grupo EI-II-A • 30 cupos",
          cycle: "Ciclo II"
        },
        {
          id: "cur_ei_202",
          code: "EIND-202",
          name: "Electrónica Analógica y de Potencia Básica",
          credits: 4,
          classroom: "Aula 102 • Pabellón A",
          schedule: "Lunes y Miércoles 08:00 AM - 12:00 PM",
          teacherName: "Ing. Carlos Alberto Mendoza Quispe",
          group: "Grupo EI-II-A • 30 cupos",
          cycle: "Ciclo II"
        },
        {
          id: "cur_ei_203",
          code: "EIND-203",
          name: "Taller de Medidas e Instrumentos Eléctricos",
          credits: 3,
          classroom: "Laboratorio de Mediciones",
          schedule: "Viernes 08:00 AM - 01:00 PM",
          teacherName: "Ing. Jorge Luis Paucar Silva",
          group: "Grupo EI-II-A • 30 cupos",
          cycle: "Ciclo II"
        },
        {
          id: "cur_ei_204",
          code: "EIND-204",
          name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)",
          credits: 3,
          classroom: "Cómputo 2 • Pabellón A",
          schedule: "Miércoles 11:00 AM - 01:00 PM",
          teacherName: "Lic. Fernando Gabriel Díaz Torres",
          group: "Grupo EI-II-A • 30 cupos",
          cycle: "Ciclo II"
        },
        {
          id: "cur_ei_205",
          code: "EIND-205",
          name: "Inglés Técnico para Electricidad",
          credits: 2,
          classroom: "Aula 201 • Pabellón A",
          schedule: "Jueves 11:00 AM - 01:00 PM",
          teacherName: "Lic. Sofía Lorena Valenzuela Ríos",
          group: "Grupo EI-II-A • 30 cupos",
          cycle: "Ciclo II"
        }
      ];
      return defaultCycle2.map(def => {
        const found = c2.find(c => c.code === def.code || c.id === def.id);
        return found ? { ...def, ...found } : def;
      });
    } else {
      const c1 = enrichedCourses.filter(c => {
        const isC2 = c.code?.includes("-20") || c.cycle === "Ciclo II" || c.cycle === 2 || c.group?.includes("II");
        if (isC2) return false;
        return c.code?.includes("-10") || c.cycle === "Ciclo I" || c.cycle === 1 || c.group?.includes("I-A");
      });
      if (c1.length > 0 && !c1.some(c => isContabilidad && c.code?.includes("EIND"))) {
        return c1;
      }
      if (isContabilidad) {
        return [
          {
            id: "cur_co_101",
            code: "CONT-101",
            name: "Fundamentos de Contabilidad y Doctrina Contable",
            credits: 4,
            classroom: "Aula 201 • Pabellón C",
            schedule: "Lunes 08:00 AM - 09:40 AM",
            teacherName: "Lic. Patricia Elena Benavides Silva",
            group: "Grupo CONT-I-A • 35 cupos",
            cycle: "Ciclo I"
          },
          {
            id: "cur_co_102",
            code: "CONT-102",
            name: "Documentación Comercial, Mercantil y Bancaria",
            credits: 4,
            classroom: "Aula 201 • Pabellón C",
            schedule: "Martes 08:00 AM - 09:40 AM",
            teacherName: "Lic. Patricia Elena Benavides Silva",
            group: "Grupo CONT-I-A • 35 cupos",
            cycle: "Ciclo I"
          },
          {
            id: "cur_co_103",
            code: "CONT-103",
            name: "Matemática Financiera y Comercial",
            credits: 3,
            classroom: "Aula 201 • Pabellón C",
            schedule: "Miércoles 08:00 AM - 09:40 AM",
            teacherName: "Lic. Fernando Gabriel Díaz Torres",
            group: "Grupo CONT-I-A • 35 cupos",
            cycle: "Ciclo I"
          },
          {
            id: "cur_co_104",
            code: "CONT-104",
            name: "Legislación Comercial y Societaria",
            credits: 3,
            classroom: "Aula 201 • Pabellón C",
            schedule: "Jueves 08:00 AM - 09:40 AM",
            teacherName: "Dr. Roberto Carlos Vega Santos",
            group: "Grupo CONT-I-A • 35 cupos",
            cycle: "Ciclo I"
          },
          {
            id: "cur_co_105",
            code: "CONT-105",
            name: "Comunicación y Competencias Digitales",
            credits: 2,
            classroom: "Lab. Cómputo 1 • Pabellón C",
            schedule: "Viernes 08:00 AM - 09:40 AM",
            teacherName: "Lic. Sofía Lorena Valenzuela Ríos",
            group: "Grupo CONT-I-A • 35 cupos",
            cycle: "Ciclo I"
          }
        ];
      }
      const defaultCycle1 = [
        {
          id: "cur_ei_101",
          code: "EIND-101",
          name: "Fundamentos de Electricidad y Circuitos CC",
          credits: 4,
          classroom: "Aula 101 • Pabellón A",
          schedule: "Lunes 08:00 AM - 01:00 PM / Viernes 08:00 AM - 10:00 AM",
          teacherName: "Manuel Ramos Salazar",
          group: "Grupo EI-I-A • 35 cupos",
          cycle: "Ciclo I"
        },
        {
          id: "cur_ei_102",
          code: "EIND-102",
          name: "Instalaciones Eléctricas de Edificaciones",
          credits: 4,
          classroom: "Aula 102 • Pabellón A",
          schedule: "Martes 08:00 AM - 01:00 PM / Viernes 11:00 AM - 01:00 PM",
          teacherName: "Carlos Alberto Mendoza Quispe",
          group: "Grupo EI-I-A • 35 cupos",
          cycle: "Ciclo I"
        },
        {
          id: "cur_ei_103",
          code: "EIND-103",
          name: "Seguridad e Higiene Industrial en Baja Tensión",
          credits: 3,
          classroom: "Aula 101 • Pabellón A",
          schedule: "Miércoles 08:00 AM - 01:00 PM",
          teacherName: "Jorge Luis Paucar Silva",
          group: "Grupo EI-I-A • 35 cupos",
          cycle: "Ciclo I"
        },
        {
          id: "cur_ei_104",
          code: "EIND-104",
          name: "Matemática Aplicada a la Tecnología Eléctrica",
          credits: 3,
          classroom: "Aula 101 • Pabellón A",
          schedule: "Jueves 11:00 AM - 01:00 PM",
          teacherName: "Fernando Gabriel Díaz Torres",
          group: "Grupo EI-I-A • 35 cupos",
          cycle: "Ciclo I"
        },
        {
          id: "cur_ei_105",
          code: "EIND-105",
          name: "Comunicación y Tecnologías Digitales",
          credits: 2,
          classroom: "Aula 101 • Pabellón A",
          schedule: "Jueves 08:00 AM - 10:00 AM",
          teacherName: "Sofía Lorena Valenzuela Ríos",
          group: "Grupo EI-I-A • 35 cupos",
          cycle: "Ciclo I"
        }
      ];
      return defaultCycle1.map(def => {
        const found = c1.find(c => c.code === def.code || c.id === def.id);
        return found ? { ...def, ...found } : def;
      });
    }
  }, [enrichedCourses, selectedClassesPeriod, isContabilidad]);

  const activeCourse = classesCoursesData.find(c => c.name === selectedCourseDetail || c.code === selectedCourseDetail || c.id === selectedCourseDetail);
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const [internalActiveCourseComponentId, setInternalActiveCourseComponentId] = useState<string | null>(null);
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

  const getLocalWeekTheme = (courseCode: string, week: number) => {
    const rawName = activeCourse?.name || courseCode;
    const cleanCourseName = rawName
      .replace(/\s*\(.*?\)\s*/g, "")
      .replace(/y\s+circuitos\s+cc/i, "")
      .trim();

    if (week === 1) {
      return {
        topic: `Semana 1: Introducción a ${cleanCourseName}`,
        desc: "Presentación del syllabus, lineamientos y diagnóstico inicial."
      };
    }
    if (week === 2) {
      return {
        topic: `Semana 2: Taller de ${cleanCourseName}`,
        desc: "Leyes de Kirchhoff y análisis guiado de circuitos."
      };
    }
    if (week === 3) {
      return {
        topic: `Semana 3: Laboratorio de ${cleanCourseName}`,
        desc: "Prácticas de laboratorio, mediciones y resolución de problemas."
      };
    }
    if (week === 4) {
      return {
        topic: `Semana 4: Control Formativo de ${cleanCourseName}`,
        desc: "Revisión técnica de informes y verificación de avances de Unidad 1."
      };
    }
    if (week === 8) {
      return {
        topic: `Semana 8: Examen Parcial de ${cleanCourseName}`,
        desc: "Evaluación oficial de medio ciclo y consolidación técnica."
      };
    }
    if (week === 16) {
      return {
        topic: `Semana 16: Evaluación Final de ${cleanCourseName}`,
        desc: "Cierre del periodo lectivo y sustentación de proyectos finales."
      };
    }

    const subWeek = ((week - 1) % 4) + 1;
    const subThemes = [
      `Teoría de ${cleanCourseName}`,
      `Taller de ${cleanCourseName}`,
      `Laboratorio de ${cleanCourseName}`,
      `Control y Avance de ${cleanCourseName}`
    ];
    const unitNumber = Math.ceil(week / 4);

    return {
      topic: `Semana ${week}: ${subThemes[subWeek - 1]}`,
      desc: `Sesión de aprendizaje práctico y desarrollo de competencias técnicas (Unidad ${unitNumber}).`
    };
  };

  // If no course is active, render the grid of card courses
  if (!activeCourse) {
    return (
      <PageTransition id="classes-list" className="space-y-6 text-left">
        {/* Page Header Banner */}
        <div className="relative bg-[#800521] text-white rounded-xl shadow-md p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
          <div className="absolute inset-0 bg-linear-gradient(to right,rgba(128,5,33,0.95),rgba(0,0,0,0.65))" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
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

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-black/35 border border-white/20 px-3.5 py-2 rounded-xl text-left shadow-inner flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold text-amber-300 block tracking-wider font-mono">Periodo:</span>
                <select
                  aria-label="Periodo Académico Asignaturas"
                  value={selectedClassesPeriod}
                  onChange={(e) => {
                    setSelectedClassesPeriod(e.target.value as any);
                    setSelectedCourseDetail("");
                  }}
                  className="bg-transparent text-white font-black text-xs border-0 outline-none cursor-pointer pr-1 font-mono"
                >
                  {isPromotedCycle2 && (
                    <option value="2027-II" className="bg-slate-900 text-white font-bold">2027-II • Ciclo II (Activo)</option>
                  )}
                  <option value="2027-I" className="bg-slate-900 text-white font-bold">
                    {isPromotedCycle2 ? "2027-I • Ciclo I (Concluido)" : "2027-I • Ciclo I (Activo)"}
                  </option>
                </select>
              </div>
            </div>
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

            const isCiclo1 = selectedClassesPeriod === "2027-I";
            const isMateo = studentDni === "74859612";
            const isRealCiclo1Simulated = typeof window !== "undefined" && Boolean(
              localStorage.getItem(`sfa_simulated_cycle1_${studentDni}`) ||
              (isMateo && (localStorage.getItem("sfa_simulated_cycle1_74859612") || localStorage.getItem("sfa_simulated_cycle1")))
            );
            const isCiclo2AllSimulated = Boolean(
              localStorage.getItem(`sfa_simulated_cycle2_${studentDni}`) ||
              (isMateo && (
                localStorage.getItem("sfa_simulated_cycle2_74859612") ||
                localStorage.getItem("sfa_student_promoted_cycle3_74859612") === "true"
              )) ||
              localStorage.getItem(`sfa_student_promoted_cycle3_${studentDni}`) === "true"
            );
            const isCiclo2Passed = (courseItem.code === "EIND-201" && isMateo && (
              localStorage.getItem("sfa_acta_signed_EIND-201") === "true" ||
              localStorage.getItem("sfa_acta_signed_cur_ei_201") === "true" ||
              localStorage.getItem("sfa_course_passed_EIND-201_74859612") === "true" ||
              Boolean(localStorage.getItem("sfa_grades_EIND-201_74859612"))
            )) || isCiclo2AllSimulated;
            const isApproved = (isCiclo1 && (isMateo || isRealCiclo1Simulated)) || isCiclo2Passed;

            let displayGrade = averageGrade;
            if (isCiclo1 && (isMateo || isRealCiclo1Simulated)) {
              const c1Defaults: Record<string, string> = {
                "EIND-101": "16.4",
                "EIND-102": "16.5",
                "EIND-103": "17.0",
                "EIND-104": "15.0",
                "EIND-105": "16.0",
                "CONT-101": "17.0",
                "CONT-102": "16.5",
                "CONT-103": "16.0",
                "CONT-104": "15.5",
                "CONT-105": "16.0"
              };
              displayGrade = c1Defaults[courseItem.code] || (averageGrade !== "NR" ? averageGrade : "16.0");
            } else if (isCiclo2AllSimulated) {
              const c2Defaults: Record<string, string> = {
                "EIND-201": "16.5",
                "EIND-202": "17.0",
                "EIND-203": "16.0",
                "EIND-204": "16.5",
                "EIND-205": "15.5"
              };
              displayGrade = c2Defaults[courseItem.code] || "16.5";
            } else if (courseItem.code === "EIND-201" && isMateo) {
              try {
                const raw = localStorage.getItem("sfa_grades_EIND-201_74859612") || localStorage.getItem("sfa_grades_cur_ei_201_74859612");
                if (raw) {
                  const p = JSON.parse(raw);
                  const sum = 0.20 * (p.NPA || 0) + 0.20 * (p.PC1 || 0) + 0.20 * (p.PC2 || 0) + 0.40 * (p.EX_FINAL || 0);
                  if (sum > 0) displayGrade = sum.toFixed(1);
                }
              } catch {}
            } else {
              try {
                const raw = localStorage.getItem(`sfa_grades_${courseItem.code}_${studentDni}`) ||
                  localStorage.getItem(`sfa_grades_${courseItem.id}_${studentDni}`);
                if (raw) {
                  const p = JSON.parse(raw);
                  if (typeof p.finalGrade === "number") {
                    displayGrade = p.finalGrade.toFixed(1);
                  } else {
                    const sum = 0.20 * (p.NPA || 0) + 0.20 * (p.PC1 || 0) + 0.20 * (p.PC2 || 0) + 0.40 * (p.EX_FINAL || 0);
                    if (sum > 0) displayGrade = sum.toFixed(1);
                  }
                }
              } catch {}
            }

            const effectiveIsApproved = isApproved || (displayGrade !== "NR" && !isNaN(Number(displayGrade)) && Number(displayGrade) >= 12.5);

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
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border ${
                        effectiveIsApproved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {effectiveIsApproved ? "APROBADO" : "MATRICULADO"}
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
                      {courseItem.group || (isCiclo1 ? "Grupo EI-I-A • 35 cupos" : "Grupo EI-II-A • 30 cupos")}
                    </span>
                    <span className="font-mono font-black text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      Nota: {displayGrade} / 20
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 bg-white text-left">
                  <button
                    onClick={() => {
                      setSelectedCourseDetail(courseItem.name);
                      if (setActiveCourseComponentId) setActiveCourseComponentId(null);
                      setInternalActiveCourseComponentId(null);
                      try {
                        sessionStorage.removeItem("sfa_alumno_course_comp_id");
                      } catch { }
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
    const contMatch = code?.match(/^CONT-(\d+)$/i);
    if (contMatch) return `cur_co_${contMatch[1]}`;
    const eindMatch = code?.match(/^EIND-(\d+)$/i);
    if (eindMatch) return `cur_ei_${eindMatch[1]}`;
    return code;
  };

  const activeCourseDbId = getMappedCourseId(activeCourse.code);
  const rawCourseId = activeCourse.id?.replace(/^cur-/, "");
  const matchesActiveCourse = (targetCourseId?: string) => {
    if (!targetCourseId) return false;
    return (
      activeCourse.attendanceCourseIds?.includes(targetCourseId) ||
      targetCourseId === activeCourse.id ||
      targetCourseId === rawCourseId ||
      targetCourseId === activeCourse.code ||
      targetCourseId === activeCourseDbId
    );
  };

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
    return matchesActiveCourse(m.courseId);
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
    return matchesActiveCourse(a.courseId);
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

      await onUpdateAssignments(updated);
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

  const handleDeleteStudentSubmission = async () => {
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
      await onUpdateAssignments(updated);
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
  const validAssignments = assignments.filter((assignment) => courseResourceIds.includes(assignment.courseId) && !assignment.title.startsWith("[Planilla] "));
  const courseGrades = validAssignments
    .flatMap((assignment) => assignment.submissions || [])
    .filter((submission) => submission.studentDni === studentDni && submission.grade !== undefined)
    .map((submission) => Number(submission.grade));
  const averageGrade = courseGrades.length ? (courseGrades.reduce((sum, grade) => sum + grade, 0) / courseGrades.length).toFixed(1) : "NR";
  const courseMaterialsCount = materials.filter((material) => courseResourceIds.includes(material.courseId)).length;
  const courseTasksCount = validAssignments.filter((assignment) => assignment.kind !== "assessment").length;
  const courseGradesCount = validAssignments.filter((assignment) => assignment.submissions?.some((submission) => submission.studentDni === studentDni && submission.grade !== undefined)).length;

  // Official Weighted Grade calculation (aligned with Docente Cierre and MINEDU standard)
  const officialGradeData = useMemo(() => {
    let pc1: number | null = null;
    let pc2: number | null = null;
    let exFinal: number | null = null;
    let sumHomeworks = 0;
    let countHomeworks = 0;

    assignments.forEach((asg) => {
      const courseMatches = courseResourceIds.includes(asg.courseId) || asg.courseId === activeCourse.id || asg.courseId === activeCourseDbId;
      if (!courseMatches) return;
      const titleUpper = asg.title.toUpperCase();
      const sub = asg.submissions?.find((s: any) => s.studentDni === studentDni && s.grade !== undefined);
      if (!sub) return;

      const g = Number(sub.grade);
      if (titleUpper.includes("PC1") || titleUpper.includes("PRÁCTICA CALIFICADA 1") || titleUpper.includes("PRACTICA CALIFICADA 1")) {
        pc1 = g;
      } else if (titleUpper.includes("PC2") || titleUpper.includes("PRÁCTICA CALIFICADA 2") || titleUpper.includes("PRACTICA CALIFICADA 2")) {
        pc2 = g;
      } else if (titleUpper.includes("EX_FINAL") || titleUpper.includes("EXAMEN FINAL") || titleUpper.includes("FINAL")) {
        exFinal = g;
      } else {
        sumHomeworks += g;
        countHomeworks++;
      }
    });

    const vNpa = countHomeworks > 0 ? Number((sumHomeworks / countHomeworks).toFixed(1)) : null;
    const vPc1 = pc1;
    const vPc2 = pc2;
    const vExFinal = exFinal;

    const hasAnyGrade = vNpa !== null || vPc1 !== null || vPc2 !== null || vExFinal !== null;
    const isComplete = vNpa !== null && vPc1 !== null && vPc2 !== null && vExFinal !== null;

    let weighted: number | null = null;
    if (isComplete) {
      weighted = Number((0.20 * vNpa! + 0.20 * vPc1! + 0.20 * vPc2! + 0.40 * vExFinal!).toFixed(1));
    } else if (hasAnyGrade) {
      weighted = Number((0.20 * (vNpa ?? 0) + 0.20 * (vPc1 ?? 0) + 0.20 * (vPc2 ?? 0) + 0.40 * (vExFinal ?? 0)).toFixed(1));
    }

    const isApproved = weighted !== null && weighted >= 12.5;

    return {
      npa: vNpa,
      pc1: vPc1,
      pc2: vPc2,
      exFinal: vExFinal,
      finalGrade: weighted,
      isApproved,
      isComplete,
      condition: !isComplete ? "EN PROCESO" : (isApproved ? "APROBADO" : "DESAPROBADO"),
      formulaExpression: "0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL"
    };
  }, [assignments, courseResourceIds, activeCourse, activeCourseDbId, studentDni]);

  // Multi-component Course Formula Calculation (Integral: Evaluación Continua 60% + Examen Final Integral 40%)
  const courseMultiComponentData = useMemo(() => {
    // Helper to calculate continuous evaluations of each component dynamically from assignments
    const getShortEvaluationLabel = (title: string): string => {
      if (/PC\s*1|Práctica Calificada\s*1/i.test(title)) return "PC1";
      if (/PC\s*2|Práctica Calificada\s*2/i.test(title)) return "PC2";
      if (/PC\s*3|Práctica Calificada\s*3/i.test(title)) return "PC3";
      if (/EX_FINAL|EXAMEN FINAL/i.test(title)) return "Ex. Final";
      if (/Informe/i.test(title)) {
        const match = title.match(/Informe\s*(?:Práctico\s*)?(\d+)/i);
        return match ? `Informe ${match[1]}` : "Informe";
      }
      if (/Tablero/i.test(title)) return "Tableros";
      if (/Montaje/i.test(title)) return "Montaje";
      if (/Práctica Final|Practica Final/i.test(title)) return "Práct. Final";
      if (/Simulaci[oó]n/i.test(title)) return "Simulación";
      if (/Medici[oó]n/i.test(title)) return "Mediciones";

      const clean = title.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim();
      const words = clean.split(/[:\s-]+/).filter(Boolean);
      return words.slice(0, 2).join(" ") || "Actividad";
    };

    const getCompGrades = (compCode: string, compDbId: string, keywords: string[]) => {
      const compAsgs = assignments.filter((a) => {
        if (a.title.startsWith("[Planilla] ")) return false;
        // Do not include the transversal final exam in the continuous component average
        if (/EX_FINAL|EXAMEN FINAL/i.test(a.title)) return false;
        const cId = a.courseId || "";
        return cId === compDbId || cId === compCode || keywords.some((kw) => cId.toLowerCase().includes(kw));
      });

      const gradedSubs = compAsgs
        .map((a) => {
          const sub = a.submissions?.find((s: any) => s.studentDni === studentDni && s.grade !== undefined);
          return {
            title: a.title,
            grade: sub ? Number(sub.grade) : null
          };
        })
        .filter((item) => item.grade !== null);

      if (gradedSubs.length === 0) {
        return {
          avg: null,
          count: 0,
          summary: "Sin evaluaciones registradas"
        };
      }

      const sum = gradedSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
      const avg = Number((sum / gradedSubs.length).toFixed(1));
      const summary = gradedSubs.map((s) => {
        const shortName = getShortEvaluationLabel(s.title);
        return `${shortName}: ${s.grade}`;
      }).join(" • ");

      return { avg, count: gradedSubs.length, summary };
    };

    // Componente 1: Teoría
    const compTeo = getCompGrades("EIND-101-TEO", "6afc831d1bbefb1d4e11dd0e", ["teo", "teor"]);
    // In theory, if we have NPA, PC1, PC2, calculate ministerial weighted formula: 0.30*NPA + 0.35*PC1 + 0.35*PC2
    let gradeTeo: number | null = null;
    let summaryTeo = compTeo.summary;
    if (officialGradeData.npa !== null && officialGradeData.pc1 !== null && officialGradeData.pc2 !== null) {
      gradeTeo = Number(((officialGradeData.npa + officialGradeData.pc1 + officialGradeData.pc2) / 3).toFixed(1));
      summaryTeo = `NPA: ${officialGradeData.npa} • PC1: ${officialGradeData.pc1} • PC2: ${officialGradeData.pc2}`;
    } else {
      gradeTeo = compTeo.avg;
    }

    // Componente 2: Taller
    const compTal = getCompGrades("EIND-101-TAL", "6afe1412016eccb3be7af0eb", ["tal", "taller"]);
    const gradeTal: number | null = compTal.avg;

    // Componente 3: Laboratorio
    const compLab = getCompGrades("EIND-101-LAB", "6afe141f016eccb3be7af0ec", ["lab", "laboratorio"]);
    const gradeLab: number | null = compLab.avg;

    // Ponderación de la Evaluación Continua (PEC - 60% de la Nota Final) por créditos:
    // Teoría: 40% del continuo (2 cr), Taller: 40% del continuo (2 cr), Laboratorio: 20% del continuo (1 cr)
    const weightTeoInPec = 0.40;
    const weightTalInPec = 0.40;
    const weightLabInPec = 0.20;

    const teoContrib = gradeTeo !== null ? Number((0.60 * weightTeoInPec * gradeTeo).toFixed(2)) : 0;
    const talContrib = gradeTal !== null ? Number((0.60 * weightTalInPec * gradeTal).toFixed(2)) : 0;
    const labContrib = gradeLab !== null ? Number((0.60 * weightLabInPec * gradeLab).toFixed(2)) : 0;

    // Continuous average across active components
    const continuousGrade = (gradeTeo !== null || gradeTal !== null || gradeLab !== null)
      ? Number(((weightTeoInPec * (gradeTeo ?? 0) + weightTalInPec * (gradeTal ?? 0) + weightLabInPec * (gradeLab ?? 0))).toFixed(1))
      : null;

    // Examen Final Integral del Curso (40% de la Nota Final - transversal a toda la Unidad Didáctica)
    // Searches across all course assignments for any exam marked EX_FINAL / EXAMEN FINAL
    const finalExamAsg = assignments.find((a) =>
      !a.title.startsWith("[Planilla] ") &&
      /EX_FINAL|EXAMEN FINAL/i.test(a.title)
    );
    const finalExamSub = finalExamAsg?.submissions?.find((s: any) => s.studentDni === studentDni && s.grade !== undefined);
    const finalExamGrade: number | null = finalExamSub ? Number(finalExamSub.grade) : null;
    const finalExamContrib = finalExamGrade !== null ? Number((0.40 * finalExamGrade).toFixed(2)) : 0;

    // Consolidated / Integrated Status
    const isComplete = gradeTeo !== null && gradeTal !== null && gradeLab !== null && finalExamGrade !== null;
    const totalAccumulated = Number((teoContrib + talContrib + labContrib + finalExamContrib).toFixed(1));
    const integratedGrade = isComplete ? totalAccumulated : totalAccumulated;
    const isIntegratedApproved = isComplete && totalAccumulated >= 12.5;
    const integralCondition = !isComplete ? "EN PROCESO" : (isIntegratedApproved ? "APROBADO" : "DESAPROBADO");

    return {
      hasMultiple: subComponents.length > 1,
      components: [
        {
          id: "teo",
          code: "EIND-101-TEO",
          name: "Teoría",
          fullName: "Fundamentos de Electricidad y Circuitos CC (Teoría)",
          credits: 2,
          weightLabel: "PESO: 40% (2 CR)",
          weight: 0.40,
          grade: gradeTeo,
          weightedContribution: teoContrib,
          condition: gradeTeo === null ? "PENDIENTE" : (gradeTeo >= 12.5 ? "APROBADO" : "DESAPROBADO"),
          teacher: "Manuel Ramos Salazar",
          formula: "0.30*NPA + 0.35*PC1 + 0.35*PC2",
          summaryEvaluations: summaryTeo
        },
        {
          id: "tal",
          code: "EIND-101-TAL",
          name: "Taller",
          fullName: "Fundamentos de Electricidad y Circuitos CC (Taller)",
          credits: 2,
          weightLabel: "PESO: 40% (2 CR)",
          weight: 0.40,
          grade: gradeTal,
          weightedContribution: talContrib,
          condition: gradeTal === null ? "PENDIENTE" : (gradeTal >= 12.5 ? "APROBADO" : "DESAPROBADO"),
          teacher: "Manuel Ramos Salazar",
          formula: "0.30*TABLEROS + 0.30*MONTAJE + 0.40*PRACT_FINAL",
          summaryEvaluations: compTal.summary
        },
        {
          id: "lab",
          code: "EIND-101-LAB",
          name: "Laboratorio",
          fullName: "Fundamentos de Electricidad y Circuitos CC (Laboratorio)",
          credits: 1,
          weightLabel: "PESO: 20% (1 CR)",
          weight: 0.20,
          grade: gradeLab,
          weightedContribution: labContrib,
          condition: gradeLab === null ? "PENDIENTE" : (gradeLab >= 12.5 ? "APROBADO" : "DESAPROBADO"),
          teacher: "Manuel Ramos Salazar",
          formula: "0.50*SIMULACION + 0.50*MEDICIONES",
          summaryEvaluations: compLab.summary
        }
      ],
      continuousGrade,
      finalExamGrade,
      finalExamContribution: finalExamContrib,
      integralFormulaExpression: "0.60*(0.40*TEO + 0.40*TAL + 0.20*LAB) + 0.40*EX_FINAL",
      integralGrade: integratedGrade,
      isIntegratedApproved,
      integralCondition,
      isComplete,
      totalCredits: 5
    };
  }, [assignments, officialGradeData, subComponents, studentDni]);

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
            {/* Themed Estado de Curso Header Banner (Idéntico estilo institucional #800521) */}
            <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 overflow-hidden text-left border-b-4 border-amber-500">
              <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
                      ASIGNATURA: {activeCourse.code} • {courseMultiComponentData.hasMultiple ? "UNIDAD DIDÁCTICA INTEGRAL" : "UNIDAD DIDÁCTICA OFICIAL"}
                    </span>
                    <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block font-mono">
                      PERIODO 2027-I • {courseMultiComponentData.hasMultiple ? 5 : (activeCourse.credits || 4)} CRÉDITOS OFICIALES
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black font-display tracking-tight uppercase leading-snug">
                    {activeCourse.name}
                  </h2>
                  <p className="text-xs text-white/85 font-medium font-mono leading-relaxed max-w-2xl">
                    {courseMultiComponentData.hasMultiple
                      ? "Consolidado definitivo de calificaciones y fórmula integral de aprobación curricular (3 partes: Teoría 40% + Taller 40% + Laboratorio 20%) ante el Ministerio de Educación (MINEDU)."
                      : `Consolidado oficial de calificaciones y fórmula curricular vigente (${activeCourse.formula || "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL"}) ante el Ministerio de Educación (MINEDU).`}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {(() => {
                    const isApp = courseMultiComponentData.hasMultiple
                      ? courseMultiComponentData.isIntegratedApproved
                      : officialGradeData.isApproved;
                    const cond = courseMultiComponentData.hasMultiple
                      ? courseMultiComponentData.integralCondition
                      : officialGradeData.condition;
                    const partialScore = Number(
                      ((officialGradeData.npa ?? 0) * 0.2 +
                      (officialGradeData.pc1 ?? 0) * 0.2 +
                      (officialGradeData.pc2 ?? 0) * 0.2 +
                      (officialGradeData.exFinal ?? 0) * 0.4).toFixed(1)
                    );
                    const val = courseMultiComponentData.hasMultiple
                      ? courseMultiComponentData.integralGrade
                      : (officialGradeData.finalGrade ?? partialScore);
                    return (
                      <span className={`font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow-sm font-mono flex items-center gap-2 border ${isApp
                        ? "bg-emerald-500 text-white border-emerald-400"
                        : "bg-amber-400 text-slate-950 border-amber-300"
                        }`}>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{cond} ({val.toFixed(1)})</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: FÓRMULA INTEGRAL DE LA ASIGNATURA */}
            {courseMultiComponentData.hasMultiple ? (
              <Card className="border border-slate-200">
                <CardHeader className="p-5 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">
                      FÓRMULA CURRICULAR INTEGRAL DE APROBACIÓN (3 COMPONENTES)
                    </CardTitle>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Para aprobar la asignatura, la evaluación ministerial consolida las 3 áreas formativas según su peso en créditos.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#800521]/10 text-[#800521] border border-[#800521]/20 px-3 py-1.5 rounded-lg uppercase self-start sm:self-auto shadow-2xs">
                    FÓRMULA: {courseMultiComponentData.integralFormulaExpression}
                  </span>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Grid de las 3 Partes / Componentes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {courseMultiComponentData.components.map((comp) => (
                      <div
                        key={comp.id}
                        className={`p-4 rounded-xl border transition-all text-left space-y-3 ${(activeCourseComponentId || "teo") === comp.id
                          ? "bg-rose-50/40 border-[#800521]/40 shadow-xs ring-1 ring-[#800521]/20"
                          : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                            {comp.code}
                          </span>
                          <span className="text-[9px] font-mono font-black text-[#800521] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded uppercase whitespace-nowrap">
                            {comp.weightLabel}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase">
                            PARTE {comp.id === "teo" ? "1: TEORÍA" : comp.id === "tal" ? "2: TALLER" : "3: LABORATORIO"}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Docente: {comp.teacher}
                          </p>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                          <div>
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Promedio Parcial</span>
                            <span className="text-lg font-black font-mono text-slate-900 block leading-tight">
                              {comp.grade !== null ? comp.grade.toFixed(1) : "NR"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Aporte a Nota Final</span>
                            <span className="text-sm font-black font-mono text-[#800521] block leading-tight">
                              {comp.grade !== null ? `+${comp.weightedContribution.toFixed(2)} pts` : "+0.00 pts"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-150 text-[9.5px] text-slate-600 font-medium space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Condición:</span>
                            <span className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                              comp.condition === "APROBADO"
                                ? "text-emerald-700 bg-emerald-50"
                                : comp.condition === "PENDIENTE"
                                ? "text-amber-700 bg-amber-50"
                                : "text-rose-700 bg-rose-50"
                            }`}>
                              {comp.condition}
                            </span>
                          </div>
                          <div className="text-[8.5px] text-slate-500 font-mono tracking-tight leading-relaxed" title={comp.summaryEvaluations}>
                            {comp.summaryEvaluations}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hito Integrador: Examen Final del Curso Completo (40%) */}
                  <div className="mt-4 p-4 rounded-xl border border-amber-300 bg-amber-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded uppercase">
                        HITO FINAL DEL CURSO • PESO: 40% OFICIAL
                      </span>
                      <h4 className="text-xs font-black text-slate-900 uppercase">
                        Examen Final Integral de la Unidad Didáctica
                      </h4>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Evaluación comprehensiva transversal de toda la asignatura (evalúa conjuntamente Teoría, Taller y Laboratorio).
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 bg-white px-4 py-2.5 rounded-xl border border-amber-200 shadow-2xs">
                      <div>
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Nota Examen Final</span>
                        <span className="text-lg font-black font-mono text-slate-900 block leading-tight">
                          {courseMultiComponentData.finalExamGrade !== null ? courseMultiComponentData.finalExamGrade.toFixed(1) : "NR"}
                        </span>
                      </div>
                      <div className="text-right border-l pl-3 border-slate-200">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Aporte a Nota Final</span>
                        <span className="text-sm font-black font-mono text-[#800521] block leading-tight">
                          {courseMultiComponentData.finalExamGrade !== null
                            ? `+${courseMultiComponentData.finalExamContribution.toFixed(2)} pts`
                            : "+0.00 pts (Pendiente)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-slate-200">
                <CardHeader className="p-5 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">
                      FÓRMULA CURRICULAR OFICIAL DE APROBACIÓN ({activeCourse.code})
                    </CardTitle>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Docente titular: <strong className="text-slate-700">{activeCourse.teacherName || "Docente Asignado"}</strong> • Escala vigesimal (0 – 20).
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#800521]/10 text-[#800521] border border-[#800521]/20 px-3 py-1.5 rounded-lg uppercase self-start sm:self-auto shadow-2xs">
                    {activeCourse.formula || "NF = 0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL"}
                  </span>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { code: "NPA", label: "Participación y Tareas", weight: 0.2, val: officialGradeData.npa },
                      { code: "PC1", label: "Práctica Calificada 1", weight: 0.2, val: officialGradeData.pc1 },
                      { code: "PC2", label: "Práctica Calificada 2", weight: 0.2, val: officialGradeData.pc2 },
                      { code: "EX_FINAL", label: "Examen Final Modular", weight: 0.4, val: officialGradeData.exFinal }
                    ].map((item) => {
                      const hasVal = item.val !== null && item.val !== undefined;
                      const contrib = hasVal ? Number(item.val) * item.weight : 0;
                      return (
                        <div key={item.code} className={`p-4 rounded-xl border text-left space-y-3 ${hasVal ? "bg-emerald-50/30 border-emerald-200" : "bg-white border-slate-200"}`}>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">{item.code}</span>
                            <span className="text-[9px] font-mono font-black text-[#800521] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded uppercase">Peso: {Math.round(item.weight * 100)}%</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 uppercase">{item.label}</h4>
                          <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                            <div>
                              <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Nota</span>
                              <span className="text-lg font-black font-mono text-slate-900 block leading-tight">
                                {hasVal ? Number(item.val).toFixed(1) : "NR"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8.5px] font-bold text-slate-400 uppercase block">Aporte</span>
                              <span className="text-sm font-black font-mono text-[#800521] block leading-tight">
                                +{contrib.toFixed(2)} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECCIÓN 2: RECAPITULACIÓN Y CONDICIÓN FINAL DEL CURSO */}
            <Card className="border border-slate-200">
              <CardHeader className="p-5 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">
                    RECAPITULACIÓN DEL SEMESTRE DE ESTUDIOS
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Resumen consolidado de rendimiento semestral y cumplimiento curricular oficial.
                  </p>
                </div>
                {(() => {
                  const isClosed = courseMultiComponentData.hasMultiple ? courseMultiComponentData.isComplete : officialGradeData.isComplete;
                  return (
                    <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-lg uppercase self-start sm:self-auto ${
                      isClosed
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {isClosed ? "ESTADO: CONSOLIDADO INTEGRAL CERRADO" : "ESTADO: EN PROCESO DE EVALUACIÓN"}
                    </span>
                  );
                })()}
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {(() => {
                  const isClosed = courseMultiComponentData.hasMultiple ? courseMultiComponentData.isComplete : officialGradeData.isComplete;
                  const isApp = courseMultiComponentData.hasMultiple ? courseMultiComponentData.isIntegratedApproved : officialGradeData.isApproved;
                  const cond = courseMultiComponentData.hasMultiple ? courseMultiComponentData.integralCondition : officialGradeData.condition;
                  const partialScore = Number(
                    ((officialGradeData.npa ?? 0) * 0.2 +
                    (officialGradeData.pc1 ?? 0) * 0.2 +
                    (officialGradeData.pc2 ?? 0) * 0.2 +
                    (officialGradeData.exFinal ?? 0) * 0.4).toFixed(1)
                  );
                  const displayGrade = courseMultiComponentData.hasMultiple
                    ? courseMultiComponentData.integralGrade
                    : (officialGradeData.finalGrade ?? partialScore);
                  const creditsCount = courseMultiComponentData.hasMultiple ? 5 : (activeCourse.credits || 4);

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl text-center border ${
                        !isClosed
                          ? "bg-amber-50 text-amber-900 border-amber-200 shadow-2xs"
                          : isApp
                          ? "bg-emerald-50 text-emerald-900 border-emerald-200 shadow-2xs"
                          : "bg-rose-50 text-rose-950 border-rose-200"
                        }`}>
                        <span className="text-[10px] font-black uppercase block tracking-wider text-slate-600">
                          Situación de Curso
                        </span>
                        <span className="text-xl font-black block mt-1 tracking-tight">
                          {cond}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">
                          Logro Curricular MINEDU
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block tracking-wider">
                          {isClosed ? "Promedio Ponderado Final" : "Puntaje Parcial Acumulado"}
                        </span>
                        <span className="text-xl font-black text-[#800521] block mt-1 font-mono tracking-tight">
                          {displayGrade !== null ? displayGrade.toFixed(1) : "NR"}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">
                          {isClosed ? "Escala Vigesimal (0 - 20)" : "Evaluaciones en curso"}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block tracking-wider">
                          Asistencia Registrada
                        </span>
                        <span className="text-xl font-black text-slate-800 block mt-1 font-mono tracking-tight">
                          100%
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">
                          Asistente Regular
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block tracking-wider">
                          Horas de Plan de Estudios
                        </span>
                        <span className="text-xl font-black text-slate-800 block mt-1 font-mono tracking-tight">
                          64 Horas
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 block mt-0.5">
                          {creditsCount} Créditos Académicos Otorgados
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Desglose de Componentes de Evaluación */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800 uppercase text-[11px] tracking-wide">
                      Desglose de Calificaciones ({courseMultiComponentData.hasMultiple ? "EIND-101-TEO" : activeCourse.code})
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      MINEDU R.V.M. N° 049-2024
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">NPA (20%)</span>
                      <span className="text-sm font-black font-mono text-slate-800 block mt-1">{officialGradeData.npa !== null ? officialGradeData.npa : "NR"}</span>
                      <span className="text-[8px] text-slate-400 font-medium block">Participación / Informes</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">PC1 (20%)</span>
                      <span className="text-sm font-black font-mono text-slate-800 block mt-1">{officialGradeData.pc1 !== null ? officialGradeData.pc1 : "NR"}</span>
                      <span className="text-[8px] text-slate-400 font-medium block">Práctica Calificada 1</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">PC2 (20%)</span>
                      <span className="text-sm font-black font-mono text-slate-800 block mt-1">{officialGradeData.pc2 !== null ? officialGradeData.pc2 : "NR"}</span>
                      <span className="text-[8px] text-slate-400 font-medium block">Práctica Calificada 2</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">EX_FINAL (40%)</span>
                      <span className="text-sm font-black font-mono text-slate-800 block mt-1">{officialGradeData.exFinal !== null ? officialGradeData.exFinal : "NR"}</span>
                      <span className="text-[8px] text-slate-400 font-medium block">Examen Final Modular</span>
                    </div>
                  </div>
                </div>

                {/* Matriz Semestral */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                  <span className="font-extrabold text-slate-800 block mb-3 uppercase text-[10.5px] tracking-wide">
                    Matriz Semestral de Trabajos y Evaluaciones Continuas
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    {Array.from({ length: COURSE_WEEKS }, (_, i) => i + 1).map((w) => {
                      const weekAssignment = assignments.find(a => {
                        return matchesActiveCourse(a.courseId) && (a.title.includes(`[Semana ${w}]`) || a.title.includes(`Semana ${w}`));
                      });
                      const studentSub = weekAssignment?.submissions?.find((s: any) => s.studentDni === studentDni && s.grade !== undefined);
                      const weekEval = (evaluations || []).find((e: any) => {
                        const courseMatches = e.courseId === activeCourse.id || e.courseId === activeCourseDbId;
                        return courseMatches && (e.week === w || e.title?.includes(`Semana ${w}`));
                      });
                      const finalGrade = studentSub?.grade !== undefined ? studentSub.grade : (weekEval?.grade !== undefined ? weekEval.grade : null);
                      const hasGrade = finalGrade !== null;

                      return (
                        <div key={w} className="bg-white p-2.5 rounded border border-slate-200 flex flex-col items-center justify-between shadow-2xs">
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
                  if (asgs.length === 0 && assignmentsLoading) {
                    return (
                      <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5 font-sans">
                        <Loader2 className="w-8 h-8 text-[#800521] animate-spin mx-auto" />
                        <h4 className="text-xs font-bold text-slate-700">Cargando tareas programadas...</h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Sincronizando actividades de la Semana {selectedClassWeek} con el servidor.
                        </p>
                      </div>
                    );
                  }
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
                          ? (prevSub.fileBase64.startsWith("data:") ? prevSub.fileBase64 : `data:${prevSub.mimeType || 'application/pdf'};base64,${prevSub.fileBase64}`)
                          : (prevSub?.fileName ? assignmentSubmissionFileUrl(asg.id, studentDni) : '#');

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
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 font-mono ${timing.isEarly
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
                    return !activeCourse ? true : matchesActiveCourse(a.courseId);
                  });

                  if (weekEvaluations.length === 0 && assignmentsLoading) {
                    return (
                      <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2.5 font-sans">
                        <Loader2 className="w-8 h-8 text-[#800521] animate-spin mx-auto" />
                        <h4 className="text-xs font-bold text-slate-700">Cargando evaluaciones...</h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Sincronizando criterios y calificaciones de la Semana {selectedClassWeek}.
                        </p>
                      </div>
                    );
                  }
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
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ml-auto ${isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
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
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${sub?.grade !== undefined ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-yellow-100 text-yellow-850"
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
