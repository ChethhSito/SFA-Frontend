import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users, BookOpen, Clock, FileText, CheckCircle, CheckCircle2,
  Upload, Plus, Save, Award, Trash2, Calendar, LayoutDashboard, LogOut, GraduationCap, ChevronRight, ChevronLeft, BarChart3, Settings, AlertCircle, RefreshCw, FileSpreadsheet, Megaphone,
  MapPin, ShieldCheck, Menu, X, FileCheck, Clock3, School
} from "lucide-react";
import { Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, StudentPersonalData, Teacher, Enrollment, MpaPeriod, MpaAcademicGroup, MpaProgramTask, MpaCourse, MpaClassroom, MpaShift } from "../../types";

// Reusable Custom Design System Components
import Button from "../ui/Button";
import Toast, { ToastNotice } from "../ui/Toast";
import Badge from "../ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card";
import PageHeader from "../ui/PageHeader";
import PageTransition from "../ui/PageTransition";
import AlertBox from "../ui/AlertBox";

// Modular Docente Components
import { ROSTER, getWeekTheme, WeeklyObservation } from "./DocenteTypes";
import SidebarPrincipal from "./SidebarPrincipal";
import SidebarCurso, { WeekOption, CourseSection } from "./SidebarCurso";
import {
  ResumenCurso, MaterialManager, TareaManager, ObservacionManager, CierreCurso
} from "./WeeklyViews";

import AsistenciaManager from "./AsistenciaManager";
import EvidenciasManager from "./EvidenciasManager";
import EvaluacionesManager from "./EvaluacionesManager";
import ControlAsistenciaPrincipal from "./ControlAsistenciaPrincipal";
import EvaluacionesCursosPrincipal from "./EvaluacionesCursosPrincipal";
import AvisosReportesPrincipal from "./AvisosReportesPrincipal";
import GuidesLibrary from "../shared/GuidesLibrary";
import AcademicCalendarBoard from "../shared/AcademicCalendarBoard";
import TeacherProceduresTab from "./TeacherProceduresTab";
import TeacherScheduleTab, { TeacherScheduleData } from "./TeacherScheduleTab";
import TeacherProfileTab from "./TeacherProfileTab";
import { fetchMpaCollection } from "../../services/mpaApi";
import { fileToBase64, fetchCourseObservations, createCourseObservation, deleteCourseObservation } from "../../services/api";

interface DocenteDashboardProps {
  teacherDni: string;
  teachers?: Teacher[];
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  attendanceLoading: boolean;
  attendanceError: string | null;
  onReloadAttendance: () => Promise<boolean>;
  studentsList: { [dni: string]: StudentPersonalData };
  enrollments?: Enrollment[];
  onUpdateMaterials: (mats: CourseMaterial[]) => Promise<boolean>;
  onUpdateAssignments: (asgs: CourseAssignment[]) => Promise<boolean>;
  onUpdateAttendance: (att: AttendanceRecord[]) => Promise<boolean>;
  onLogout: () => void;
  onGoToPortal?: () => void;
}

const DASHBOARD_COURSES_PER_PAGE = 2;
const DIRECTORY_COURSES_PER_PAGE = 3;
const SCHEDULE_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function scheduleMinutes(value?: string): number {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]);
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function CoursePagination({ page, total, pageSize, onPageChange }: {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginación de cursos" className="flex flex-wrap items-center justify-between gap-3 pt-3">
      <span className="text-xs font-semibold text-slate-500">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total} cursos
      </span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50">
          Anterior
        </button>
        <span className="min-w-16 text-center text-xs font-bold text-slate-700" aria-live="polite">
          {page} de {totalPages}
        </span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50">
          Siguiente
        </button>
      </div>
    </nav>
  );
}

export default function DocenteDashboard({
  teacherDni,
  teachers = [],
  courses,
  materials,
  assignments,
  evaluations,
  attendance,
  studentsList,
  enrollments = [],
  onUpdateMaterials,
  onUpdateAssignments,
  onUpdateAttendance,
  attendanceLoading,
  attendanceError,
  onReloadAttendance,
  onLogout,
  onGoToPortal
}: DocenteDashboardProps) {
  // Main Selection States
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard"); // "dashboard" | "cursos" | "control_asistencia" | "avisos_reportes" | "evaluaciones_cursos" | "configuracion" | "curso"
  const [dashboardCoursePage, setDashboardCoursePage] = useState(1);
  const [directoryCoursePage, setDirectoryCoursePage] = useState(1);
  const [scheduleData, setScheduleData] = useState<TeacherScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");

  const reloadTeacherSchedule = useCallback(async () => {
    setScheduleLoading(true);
    setScheduleError("");
    try {
      const [periods, groups, tasks, mpaCourses, classrooms, shifts] = await Promise.all([
        fetchMpaCollection<MpaPeriod>("periods"),
        fetchMpaCollection<MpaAcademicGroup>("groups"),
        fetchMpaCollection<MpaProgramTask>("tasks"),
        fetchMpaCollection<MpaCourse>("courses"),
        fetchMpaCollection<MpaClassroom>("classrooms"),
        fetchMpaCollection<MpaShift>("shifts"),
      ]);
      setScheduleData({ periods, groups, tasks, courses: mpaCourses, classrooms, shifts });
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : "No se pudo consultar el horario de MPA.");
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => { void reloadTeacherSchedule(); }, [reloadTeacherSchedule]);

  // Weekly Syllabus States (active when selectedCourseId !== null)
  const [activeSection, setActiveSection] = useState<CourseSection>("general");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedWeekOption, setSelectedWeekOption] = useState<WeekOption>("materiales");

  // Mobile navigation views toggling
  const [showMobileSidebarCurso, setShowMobileSidebarCurso] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Desktop sidebars collapsible states (toggle in the center/middle border)
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  const [isCourseSidebarCollapsed, setIsCourseSidebarCollapsed] = useState(false);

  // Resolve courses and teachers safely with storage cache fallback
  const allCourses = courses.length > 0 ? courses : (() => {
    try {
      const saved = localStorage.getItem("sfa_courses");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })();

  const allTeachers = teachers.length > 0 ? teachers : (() => {
    try {
      const saved = localStorage.getItem("sfa_teachers");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  })();

  // Resolve current logged-in teacher by DNI, email, id, or Mongo _id
  const currentTeacher = allTeachers.find((t) =>
    t.dni === teacherDni ||
    t.email?.toLowerCase() === teacherDni?.toLowerCase() ||
    (t as any)._id === teacherDni ||
    t.id === teacherDni
  ) || (teacherDni === "docente" || !teacherDni ? (allTeachers.find((t) => t.careerId === "electronica") || allTeachers[0] || null) : null);

  const effectiveTeacherDni = currentTeacher?.dni || teacherDni;
  const teacherMpaTasks = scheduleData?.tasks.filter((task) =>
    task.teacherDni === effectiveTeacherDni && scheduleData.groups.some((group) => group.id === task.groupId),
  ) || [];
  const teacherPeriodIds = new Set(teacherMpaTasks.map((task) => scheduleData?.groups.find((group) => group.id === task.groupId)?.periodId));
  const teacherPeriods = scheduleData?.periods.filter((period) => teacherPeriodIds.has(period.id)) || [];
  const schedulePeriod = teacherPeriods.find((period) => period.isActive)
    || [...teacherPeriods].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  const currentTeacherSessions = teacherMpaTasks.filter((task) =>
    scheduleData?.groups.find((group) => group.id === task.groupId)?.periodId === schedulePeriod?.id,
  ).sort((a, b) => SCHEDULE_DAYS.indexOf(a.dayOfWeek || "") - SCHEDULE_DAYS.indexOf(b.dayOfWeek || "")
    || scheduleMinutes(a.startTime) - scheduleMinutes(b.startTime));

  // Filter courses assigned to this specific teacher (supporting multiple professors per course)
  const teacherCourses = allCourses.filter((c) => {
    if (c.teacherDni === effectiveTeacherDni) return true;
    if (c.teacherDnis && c.teacherDnis.includes(effectiveTeacherDni)) return true;
    if (c.teachers && c.teachers.some((t: any) => t.dni === effectiveTeacherDni)) return true;
    if (teacherDni === "docente" || !teacherDni) {
      if (currentTeacher) {
        return (
          c.teacherDni === currentTeacher.dni ||
          c.teacherDnis?.includes(currentTeacher.dni) ||
          c.teachers?.some((t: any) => t.dni === currentTeacher.dni) ||
          (c.careerId && currentTeacher.careerId && c.careerId === currentTeacher.careerId)
        );
      }
      return true;
    }
    return false;
  });
  const dashboardPageCount = Math.max(1, Math.ceil(teacherCourses.length / DASHBOARD_COURSES_PER_PAGE));
  const directoryPageCount = Math.max(1, Math.ceil(teacherCourses.length / DIRECTORY_COURSES_PER_PAGE));
  const safeDashboardCoursePage = Math.min(dashboardCoursePage, dashboardPageCount);
  const safeDirectoryCoursePage = Math.min(directoryCoursePage, directoryPageCount);
  const dashboardCourses = teacherCourses.slice(
    (safeDashboardCoursePage - 1) * DASHBOARD_COURSES_PER_PAGE,
    safeDashboardCoursePage * DASHBOARD_COURSES_PER_PAGE
  );
  const directoryCourses = teacherCourses.slice(
    (safeDirectoryCoursePage - 1) * DIRECTORY_COURSES_PER_PAGE,
    safeDirectoryCoursePage * DIRECTORY_COURSES_PER_PAGE
  );
  const selectedCourse = allCourses.find((c) => c.id === selectedCourseId) || null;

  useEffect(() => {
    if (selectedCourse) {
      localStorage.setItem("sfa_selected_course_career", selectedCourse.careerId || selectedCourse.career || "");
    } else {
      localStorage.removeItem("sfa_selected_course_career");
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (enrollments && enrollments.length > 0) {
      try {
        localStorage.setItem("sfa_enrollments", JSON.stringify(enrollments));
      } catch (e) {
        console.warn("Could not sync sfa_enrollments:", e);
      }
    }
  }, [enrollments]);

  useEffect(() => {
    if (studentsList && Object.keys(studentsList).length > 0) {
      try {
        localStorage.setItem("sfa_students", JSON.stringify(studentsList));
      } catch (e) {
        console.warn("Could not sync sfa_students:", e);
      }
    }
  }, [studentsList]);

  const [weeklyObservations, setWeeklyObservations] = useState<WeeklyObservation[]>([]);
  const [observationsLoading, setObservationsLoading] = useState(false);
  useEffect(() => {
    if (!selectedCourseId || activeSection !== "week" || selectedWeekOption !== "observaciones") return;
    let current = true;
    setObservationsLoading(true);
    fetchCourseObservations(selectedCourseId, selectedWeek).then((items) => {
      if (current) {
        setWeeklyObservations(items || []);
        setObservationsLoading(false);
        if (!items) notify("No se pudieron cargar las observaciones.", false);
      }
    });
    return () => { current = false; };
  }, [selectedCourseId, selectedWeek, selectedWeekOption, activeSection]);

  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const notify = (message: string, success: boolean) => setNotice({ id: Date.now(), message, kind: success ? "success" : "error" });
  const gradesRegistry = useMemo(() => {
    const registry: Record<string, { grade?: number; feedback?: string }> = {};
    assignments.forEach((assignment) => {
      const week = assignment.title.match(/^\[Semana (\d+)\]/)?.[1];
      if (!week) return;
      assignment.submissions.forEach((submission) => {
        if (submission.grade !== undefined) registry[`${assignment.courseId}-${week}-${submission.studentDni}`] = submission;
      });
    });
    return registry;
  }, [assignments]);

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
      return a.kind !== "assessment" && a.title.startsWith(weekPattern);
    });
  };

  // Actions: Publish material
  const handlePublishMaterial = async (title: string, file: File) => {
    if (!selectedCourseId) return false;
    if (!file.size || file.size > 10 * 1024 * 1024) { notify("El archivo debe tener como máximo 10 MB.", false); return false; }
    let contentBase64: string;
    try { contentBase64 = await fileToBase64(file); }
    catch { notify("No se pudo leer el archivo.", false); return false; }
    const newMaterial: CourseMaterial = {
      id: `mat-${Date.now()}`,
      courseId: selectedCourseId,
      title: `[Semana ${selectedWeek}] ${title}`,
      date: new Date().toISOString().split("T")[0],
      fileName: file.name,
      contentBase64,
      mimeType: file.type || "application/octet-stream",
    };
    const saved = await onUpdateMaterials([...materials, newMaterial]);
    notify(saved ? "Material y archivo guardados en el servidor." : "No se pudo subir el material.", saved);
    return saved;
  };

  // Actions: Delete material
  const handleDeleteMaterial = async (id: string) => {
    const saved = await onUpdateMaterials(materials.filter((m) => m.id !== id));
    notify(saved ? "Material eliminado." : "No se pudo eliminar el material.", saved);
  };

  // Actions: Publish assignment
  const handlePublishAssignment = async (title: string, desc: string, dueDate: string, attachment?: File, rubric?: string) => {
    if (!selectedCourseId) return;
    if (attachment && (!attachment.size || attachment.size > 10 * 1024 * 1024)) {
      notify("El adjunto debe tener como máximo 10 MB.", false); return false;
    }
    const newAsg: CourseAssignment = {
      id: `asg-${Date.now()}`,
      courseId: selectedCourseId,
      title: `[Semana ${selectedWeek}] ${title}`,
      description: desc,
      dueDate: dueDate,
      submissions: []
    };
    if (attachment) {
      try {
        newAsg.attachment = attachment.name;
        newAsg.contentBase64 = await fileToBase64(attachment);
        newAsg.mimeType = attachment.type || "application/octet-stream";
      } catch { notify("No se pudo leer el archivo adjunto.", false); return false; }
    }
    if (rubric) newAsg.rubric = rubric;

    const saved = await onUpdateAssignments([...assignments, newAsg]);
    notify(saved ? "Tarea guardada en el servidor." : "No se pudo guardar la tarea.", saved);
    return saved;
  };

  // Actions: Delete assignment
  const handleDeleteAssignment = async (id: string) => {
    const saved = await onUpdateAssignments(assignments.filter((a) => a.id !== id));
    notify(saved ? "Tarea eliminada." : "No se pudo eliminar la tarea.", saved);
  };

  // Actions: Add observation
  const handleAddObservation = async (text: string, type: "General" | "Incidencia" | "Acuerdo") => {
    if (!selectedCourseId) return false;
    const saved = await createCourseObservation({ courseId: selectedCourseId, week: selectedWeek, text, type });
    if (saved) setWeeklyObservations((prev) => [{ ...saved, id: saved._id || saved.id }, ...prev]);
    notify(saved ? "Observación guardada en el servidor." : "No se pudo guardar la observación.", !!saved);
    return !!saved;
  };

  // Actions: Delete observation
  const handleDeleteObservation = async (id: string) => {
    const deleted = await deleteCourseObservation(id);
    if (deleted) setWeeklyObservations((prev) => prev.filter((obs) => obs.id !== id));
    notify(deleted ? "Observación eliminada." : "No se pudo eliminar la observación.", deleted);
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

    const gpa = counts > 0 ? totalScore / counts : 0;

    return {
      materialsCount: courseMats,
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

    let attPresente = 0;
    let attTotal = 0;
    attendance.forEach((rec) => {
      if (activeCourseIds.includes(rec.courseId)) {
        Object.values(rec.statusMap).forEach((st) => {
          if (st === "Presente" || st === "Tardanza" || st === "Justificado") attPresente++;
          attTotal++;
        });
      }
    });

    const realAttendanceRate = attTotal > 0 ? (attPresente / attTotal) * 100 : 0;

    return {
      totalCourses: teacherCourses.length,
      totalStudents: ROSTER.length * teacherCourses.length,
      pendingGrades: pendingReviews,
      attendanceRate: realAttendanceRate
    };
  };

  const globalStats = getGlobalStats();

  // Course schedule is sourced from the same MPA programming as Mi Horario.
  const getCourseSchedulesList = (courseCode: string) => {
    const mpaCourse = scheduleData?.courses.find((course) => course.code === courseCode);
    if (!mpaCourse) return [];
    return currentTeacherSessions.filter((task) => task.courseId === mpaCourse.id)
      .map((task) => ({
        type: task.sessionType,
        day: task.dayOfWeek || "Sin día",
        start: task.startTime || "",
        end: task.endTime || "",
        classroom: scheduleData?.classrooms.find((classroom) => classroom.id === task.classroomId)?.name || task.classroomId,
        group: scheduleData?.groups.find((group) => group.id === task.groupId)?.name || task.groupId,
        freq: "Semanal",
      }));
  };
  const getCourseScheduleSummary = (courseCode: string) => {
    const rows = getCourseSchedulesList(courseCode);
    return rows.length ? rows.map((row) => `${row.day} ${row.start} - ${row.end} (${row.group})`).join(" • ") : "Sin programación en MPA para el período seleccionado";
  };
  const getCourseWithSchedule = (course: Course): Course => {
    const rows = getCourseSchedulesList(course.code);
    if (!rows.length) return course;
    const teacherName = currentTeacher ? `${currentTeacher.name} ${currentTeacher.lastName}` : course.teacherName;
    return {
      ...course,
      group: [...new Set(rows.map((row) => row.group))].join(', '),
      classroom: [...new Set(rows.map((row) => row.classroom))].join(', '),
      schedule: getCourseScheduleSummary(course.code),
      startDate: schedulePeriod?.startDate || course.startDate,
      endDate: schedulePeriod?.endDate || course.endDate,
      teacherName,
      teachers: teacherName ? [{ dni: effectiveTeacherDni, name: teacherName }] : course.teachers,
    };
  };

  return (
    <div id="docente-viewport" className="flex h-screen w-full overflow-hidden bg-slate-100 select-none text-left font-sans">
      {notice ? <Toast notice={notice} onClose={closeNotice} /> : null}

      {/* 1. SIDEBAR PRINCIPAL */}
      <div className={`hidden md:block shrink-0 relative transition-all duration-300 ease-in-out ${isMainSidebarCollapsed ? "w-0" : "w-64"}`}>
        <div className={`w-64 h-full transition-opacity duration-200 overflow-hidden ${isMainSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <SidebarPrincipal
            teacherDni={teacherDni}
            teacher={currentTeacher}
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
            onGoToPortal={onGoToPortal}
          />
        </div>

        {/* Desplegable / botón flotante en el centro vertical de los sidebars para ocultarlo o expandirlo */}
        <button
          type="button"
          onClick={() => setIsMainSidebarCollapsed(!isMainSidebarCollapsed)}
          title={isMainSidebarCollapsed ? "Expandir menú principal" : "Ocultar menú principal"}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 bg-white hover:bg-amber-50 text-slate-700 hover:text-[#800521] border border-slate-300 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          {isMainSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-[#800521]" /> : <ChevronLeft className="w-4 h-4 text-[#800521]" />}
        </button>
      </div>

      {/* 2. SIDEBAR SECUNDARIO CURRICULAR DINÁMICO */}
      {selectedCourseId && activeTab === "curso" && (
        <div className={`hidden md:block shrink-0 relative transition-all duration-300 ease-in-out ${isCourseSidebarCollapsed ? "w-0" : "w-64"}`}>
          <div className={`w-64 h-full transition-opacity duration-200 overflow-hidden ${isCourseSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
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

          {/* Desplegable / botón flotante en el centro vertical del menú de curso */}
          <button
            type="button"
            onClick={() => setIsCourseSidebarCollapsed(!isCourseSidebarCollapsed)}
            title={isCourseSidebarCollapsed ? "Expandir semanas del curso" : "Ocultar semanas del curso"}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 bg-white hover:bg-amber-50 text-slate-700 hover:text-[#800521] border border-slate-300 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            {isCourseSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-[#800521]" /> : <ChevronLeft className="w-4 h-4 text-[#800521]" />}
          </button>
        </div>
      )}

      {/* MOBILE HEADER RESPONSIVENESS AND DRAWERS */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 select-none shadow-xs">
        <div className="flex items-center gap-2.5">
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
              className="text-xs font-black text-[#800521] hover:bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
            >
              ← {showMobileSidebarCurso ? "Listado" : "Estructura"}
            </button>
          ) : (
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-center"
              title="Abrir menú"
            >
              {showMobileNav ? <X className="w-5 h-5 text-[#800521]" /> : <Menu className="w-5 h-5 text-[#800521]" />}
            </button>
          )}
          <span className="text-xs font-black text-[#800521] truncate max-w-[170px] uppercase font-display">
            {selectedCourseId ? (showMobileSidebarCurso ? "Curso: " + selectedCourse?.code : selectedCourse?.name) : "Portal Docente"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedCourseId && (
            <button
              onClick={() => setShowMobileSidebarCurso(!showMobileSidebarCurso)}
              className="text-[10px] uppercase font-black px-2.5 py-1 bg-amber-400 text-slate-900 rounded-md border border-amber-500 cursor-pointer shadow-2xs"
            >
              {showMobileSidebarCurso ? "Ver Contenido" : "Menú Curso"}
            </button>
          )}
          <button
            onClick={onLogout}
            className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md hover:bg-rose-100 cursor-pointer uppercase"
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

      {!selectedCourseId && showMobileNav && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-slate-950/50 backdrop-blur-2xs" onClick={() => setShowMobileNav(false)}>
          <div className="w-64 h-full bg-white border-r shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <SidebarPrincipal
              teacherDni={teacherDni}
              teacher={currentTeacher}
              courses={teacherCourses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={(courseId) => {
                setSelectedCourseId(courseId);
                setShowMobileNav(false);
                if (courseId) {
                  setActiveSection("general");
                  setActiveTab("curso");
                  setShowMobileSidebarCurso(true);
                }
              }}
              activeTab={activeTab === "curso" ? "cursos" : activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setShowMobileNav(false);
              }}
              onLogout={onLogout}
              onGoToPortal={onGoToPortal}
            />
          </div>
        </div>
      )}

      {/* 3. PRIMARY CONTENT AREA WORKSPACE */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-slate-50 relative pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

          {/* TAB 1: DASHBOARD (HOME) */}
          {selectedCourseId === null && activeTab === "dashboard" && (
            <PageTransition id="teacher-dashboard" className="space-y-6 text-left">
              {/* Institutional Burgundy Header Banner */}
              <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
                <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
                      SISTEMA INTRANET INSTITUCIONAL • PORTAL DOCENTE
                    </span>
                    <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
                      ¡Buenos días, {currentTeacher ? `Profesor(a) ${currentTeacher.lastName || currentTeacher.name}` : "Profesor(a)"}!
                    </h1>
                    <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
                      Gestione la carga académica asignada, controle asistencias de sesión, califique tareas y valide actas curriculares.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-xl shadow-inner text-xs">
                    <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-amber-300 block">Condición Docente</span>
                      <span className="font-extrabold text-white text-[11px] uppercase">
                        {currentTeacher?.careerId === "electronica" ? "Electricidad Industrial" : currentTeacher?.careerId === "contabilidad" ? "Contabilidad" : "Docente Titular"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative KPIs Dashboard Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between text-left hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Asignaturas a Cargo</span>
                    <span className="text-2xl font-black text-slate-900 block font-display tracking-tight">{globalStats.totalCourses} Materia{globalStats.totalCourses === 1 ? "" : "s"}</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Periodo Académico 2027-I</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#800521] border border-red-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between text-left hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Alumnos a Cargo</span>
                    <span className="text-2xl font-black text-slate-900 block font-display tracking-tight">{globalStats.totalStudents} Alumno{globalStats.totalStudents === 1 ? "" : "s"}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">✓ Matrículas Regulares</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between text-left hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Revisiones Pendientes</span>
                    <span className="text-2xl font-black text-amber-700 block font-display tracking-tight">{globalStats.pendingGrades} Tareas</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Evidencias por calificar</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between text-left hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Quórum de Asistencia</span>
                    <span className="text-2xl font-black text-emerald-600 block font-display tracking-tight">{globalStats.attendanceRate}%</span>
                    <span className="text-[10px] text-slate-500 font-bold block">Registro oficial al día</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Short course references directory */}
                <div className="lg:col-span-2 space-y-4 text-left">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-150">
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">
                          Asignaturas Tecnológicas Asignadas
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Seleccione la materia para abrir el aula virtual, syllabus y seguimiento de 16 semanas.
                        </p>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full w-max">
                        {dashboardCourses.length} de {teacherCourses.length} cursos
                      </span>
                    </div>

                    <div className="space-y-4">
                      {dashboardCourses.map((rawCourse) => {
                        const c = getCourseWithSchedule(rawCourse);
                        const stats = getCourseAggregates(c.id);
                        return (
                          <div
                            key={c.id}
                            className="group border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden bg-white hover:-translate-y-0.5"
                          >
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#800521] via-amber-500 to-slate-900" />
                            <div className="p-5">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-black font-mono text-[#800521] bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-md tracking-wider">
                                    {c.code}
                                  </span>
                                  <span className="text-[9.5px] font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                                    {c.credits} Créditos
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    DICTADO REGULAR
                                  </span>
                                </div>
                                <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  {c.studentCount || stats.studentsCount || 1} Alumno{(c.studentCount || stats.studentsCount || 1) === 1 ? "" : "s"}
                                </span>
                              </div>

                              <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#800521] transition-colors uppercase mb-3">
                                {c.name}
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-150 mb-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                    <span className="font-bold truncate text-[11px]">{getCourseScheduleSummary(c.code)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-[#800521] shrink-0" />
                                    <span className="font-extrabold text-[#800521] truncate text-[11px]">{c.classroom}</span>
                                  </div>
                                </div>
                                <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:pl-3">
                                  <p className="text-[11px] text-slate-600"><span className="text-slate-400 font-bold">Carrera:</span> <strong className="text-slate-800 uppercase">{c.career || "Electricidad Industrial"}</strong></p>
                                  <p className="text-[11px] text-slate-600"><span className="text-slate-400 font-bold">Grupo:</span> <strong className="text-slate-800">Grupo {c.group || "EI-I-A"}</strong></p>
                                </div>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => {
                                    setSelectedCourseId(c.id);
                                    setActiveSection("general");
                                    setActiveTab("curso");
                                    setShowMobileSidebarCurso(false);
                                  }}
                                  className="w-full sm:w-auto bg-[#800521] hover:bg-[#66041a] text-white py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                  <span>Gestionar Estructura Académica</span>
                                  <ChevronRight className="w-4 h-4 text-amber-300" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {teacherCourses.length === 0 && (
                        <p className="py-8 text-center text-sm text-slate-500">No tiene cursos asignados en este período.</p>
                      )}
                    </div>

                    <div className="mt-4">
                      <CoursePagination page={safeDashboardCoursePage} total={teacherCourses.length}
                        pageSize={DASHBOARD_COURSES_PER_PAGE} onPageChange={setDashboardCoursePage} />
                    </div>
                  </div>
                </div>

                {/* Right Column: Weekly schedule & Notice summary widget */}
                <div className="space-y-6">
                  {/* Scheduled lessons sessions info box */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-3xs text-left">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-150">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Sesiones Semanales</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Asignadas en MPA • Periodo 2027-I</span>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-800 font-mono font-black px-2.5 py-1 rounded-md">
                        {currentTeacherSessions.length} Clases
                      </span>
                    </div>

                    <div className="space-y-3 font-sans">
                      {currentTeacherSessions.length === 0 ? (
                        <p className="text-slate-400 text-xs font-medium py-4 text-center">
                          No registra sesiones lectivas en MPA para este período.
                        </p>
                      ) : (
                        currentTeacherSessions.map((task) => {
                          const mpaCourse = scheduleData?.courses.find((course) => course.id === task.courseId);
                          const classroom = scheduleData?.classrooms.find((room) => room.id === task.classroomId);
                          const dayColors: Record<string, { bg: string; text: string; border: string }> = {
                            "Lunes": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300" },
                            "Martes": { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-300" },
                            "Miércoles": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300" },
                            "Jueves": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-300" },
                            "Viernes": { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-300" },
                            "Sábado": { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-300" },
                          };
                          const dayStyle = dayColors[task.dayOfWeek || ""] || { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200" };
                          return (
                            <div key={task.id} className="p-3 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 transition-all">
                              <div className="min-w-0 flex-1">
                                <span className="block font-black text-xs text-slate-900 leading-tight truncate">
                                  {mpaCourse?.name || task.courseId}
                                </span>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-semibold">
                                  <span className="flex items-center gap-1 font-mono text-slate-700">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    {task.startTime} - {task.endTime}
                                  </span>
                                  <span>•</span>
                                  <span className="truncate text-[#800521] font-bold">
                                    📍 {classroom?.name || task.classroomId}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-[9.5px] ${dayStyle.bg} ${dayStyle.text} ${dayStyle.border} border font-black px-2.5 py-1 rounded-md uppercase font-mono tracking-wider shrink-0`}>
                                {task.dayOfWeek}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Notices and warnings */}
                  <div className="bg-gradient-to-br from-amber-50/60 to-white rounded-2xl border border-amber-200/80 p-5 shadow-3xs text-left">
                    <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-amber-100">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-800 shrink-0">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-amber-950 uppercase tracking-tight">Avisos de Coordinación</h4>
                        <span className="text-[10px] text-amber-800 font-bold block">Directivas del Ciclo Regular</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                      <p className="pb-2 border-b border-amber-100/70">
                        <strong className="text-slate-900">Registro de Asistencias:</strong> Se solicita a los docentes pasar lista durante los primeros 15 minutos de cada sesión presencial.
                      </p>
                      <p>
                        <strong className="text-slate-900">Syllabus y Calificaciones:</strong> La carga de evidencias y evaluaciones de la semana debe completarse en la plataforma oficial antes del cierre de periodo.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </PageTransition>
          )}

          {/* TAB 2: GENERAL LIST OF COURSES ("Mis Cursos") */}
          {selectedCourseId === null && activeTab === "cursos" && (
            <PageTransition id="cursos-directory-screen" className="space-y-6 text-left">
              {/* Institutional Burgundy Header Banner */}
              <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
                <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
                      PLANIFICACIÓN ACADÉMICA • PORTAL DOCENTE
                    </span>
                    <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
                      Mis Asignaturas Asignadas
                    </h1>
                    <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
                      Seleccione una unidad didáctica para planificar las 16 semanas pedagógicas, calificar tareas y registrar asistencias.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-xl shadow-inner text-xs">
                    <Award className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase font-bold text-amber-300 block">Total de Cursos</span>
                      <span className="font-extrabold text-white text-[11px]">
                        {teacherCourses.length} Asignatura{teacherCourses.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Course Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {directoryCourses.map((rawCourse) => {
                  const c = getCourseWithSchedule(rawCourse);
                  const stats = getCourseAggregates(c.id);
                  return (
                    <div
                      key={c.id}
                      className="group border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white hover:-translate-y-1 text-left"
                    >
                      {/* Top Accent Stripe */}
                      <div className="h-1.5 w-full bg-gradient-to-r from-[#800521] via-amber-500 to-slate-900" />

                      <div className="p-5 pb-4 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-black font-mono text-[#800521] bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-md tracking-wider">
                            {c.code}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9.5px] font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                              {c.credits} Créditos
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              DICTADO REGULAR
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#800521] transition-colors line-clamp-2 uppercase">
                          {c.name}
                        </h3>

                        <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-600 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {c.career || "Electricidad Industrial"}
                          </span>
                          <span className="text-[10.5px] font-extrabold text-slate-700">
                            Grupo {c.group || "EI-I-A"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {c.curriculum || "Ciclo I"}
                          </span>
                        </div>
                      </div>

                      {/* Course Metadata Pill Boxes */}
                      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-b border-slate-100 space-y-2.5 text-left text-xs">
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Horario Programado (MPA)</span>
                            <span className="text-[11px] font-extrabold text-slate-800 leading-tight block mt-0.5">
                              {getCourseScheduleSummary(c.code)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#800521] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Ambiente / Laboratorio</span>
                            <span className="text-[11px] font-extrabold text-[#800521] leading-tight block mt-0.5">
                              {c.classroom}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                          <span className="text-slate-600 font-bold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {c.studentCount || stats.studentsCount || 1} Alumno{(c.studentCount || stats.studentsCount || 1) === 1 ? "" : "s"} Matriculado{(c.studentCount || stats.studentsCount || 1) === 1 ? "" : "s"}
                          </span>
                          <span className="font-mono text-slate-600 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded">
                            16 Semanas
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="p-4 bg-white text-left">
                        <button
                          onClick={() => {
                            setSelectedCourseId(c.id);
                            setActiveSection("general");
                            setActiveTab("curso");
                            setShowMobileSidebarCurso(false);
                          }}
                          className="w-full bg-[#800521] hover:bg-[#66041a] text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group-hover:scale-[1.01]"
                        >
                          <span>Gestionar Estructura Académica</span>
                          <ChevronRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {teacherCourses.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">No tiene cursos asignados en este período.</p>
              )}

              <CoursePagination page={safeDirectoryCoursePage} total={teacherCourses.length}
                pageSize={DIRECTORY_COURSES_PER_PAGE} onPageChange={setDirectoryCoursePage} />
            </PageTransition>
          )}

          {selectedCourseId === null && activeTab === "horario" && (
            <PageTransition id="teacher-schedule-tab">
              <TeacherScheduleTab teacherDni={effectiveTeacherDni} data={scheduleData}
                loading={scheduleLoading} error={scheduleError} onReload={() => void reloadTeacherSchedule()} />
            </PageTransition>
          )}

          {/* TAB 3: CONTROL DE ASISTENCIA GENERAL (CONSULTAS) */}
          {selectedCourseId === null && activeTab === "control_asistencia" && (
            <PageTransition id="control-asistencia-general-tab">
              <ControlAsistenciaPrincipal
                students={Object.values(studentsList)}
                loading={attendanceLoading}
                error={attendanceError}
                onReload={onReloadAttendance}
                courses={teacherCourses}
                attendanceRecords={attendance}
              />
            </PageTransition>
          )}

          {/* TAB 4: AVISOS Y REPORTES GENERAL */}
          {selectedCourseId === null && activeTab === "avisos_reportes" && (
            <PageTransition id="avisos-reportes-general-tab">
              <AvisosReportesPrincipal
                teacherName={currentTeacher ? `${currentTeacher.name} ${currentTeacher.lastName}` : "Docente Titular"}
                courses={teacherCourses}
              />
            </PageTransition>
          )}

          {/* TAB 5: EVALUACIONES DE CURSOS SPREADSHEETS */}
          {selectedCourseId === null && activeTab === "evaluaciones_cursos" && (
            <PageTransition id="evaluaciones-cursos-general-tab">
              <EvaluacionesCursosPrincipal studentsList={studentsList} enrollments={enrollments} assignments={assignments} onUpdateAssignments={onUpdateAssignments}
                courses={teacherCourses}
              />
            </PageTransition>
          )}

          {selectedCourseId === null && activeTab === "guias" && (
            <PageTransition id="teacher-guides-tab">
              <GuidesLibrary audience="teacher" />
            </PageTransition>
          )}

          {selectedCourseId === null && activeTab === "calendar" && (
            <PageTransition id="teacher-calendar-tab">
              <AcademicCalendarBoard />
            </PageTransition>
          )}

          {selectedCourseId === null && activeTab === "tramites" && <TeacherProceduresTab teacherDni={effectiveTeacherDni} />}

          {/* TAB 6: CONFIGURACION PERSONAL */}
          {selectedCourseId === null && activeTab === "configuracion" && (
            <TeacherProfileTab
              teacher={currentTeacher}
              teacherDni={effectiveTeacherDni}
              onShowNotice={(n) => setNotice(n)}
            />
          )}

          {/* COURSE INTEGRATION SUB SECTIONS (Selected course context) */}
          {selectedCourseId && activeTab === "curso" && selectedCourse && (
            <div className="space-y-6">

              {/* SECTION A: GENERAL SUMMARY BANNER AND SHEET */}
              {activeSection === "general" && (
                <PageTransition id="curso-general" className="space-y-6">
                  <ResumenCurso
                    course={getCourseWithSchedule(selectedCourse)}
                    {...getCourseAggregates(selectedCourseId)}
                  />
                </PageTransition>
              )}

              {/* SECTION B: HORARIOS LECTIVOS SCREEN */}
              {activeSection === "horarios" && (
                <PageTransition id="curso-horarios" className="space-y-6 text-left font-sans">
                  <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
                          ASIGNATURA: {selectedCourse.code} • HORARIO DE CLASES
                        </span>
                        <h2 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
                          Horarios Lectivos: {selectedCourse.name}
                        </h2>
                        <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
                          Distribución horaria presencial programada en MPA para las sesiones de teoría y taller del semestre 2027-I.
                        </p>
                      </div>
                      <div className="bg-white/10 border border-white/20 px-3.5 py-2.5 rounded-xl shadow-inner text-xs shrink-0">
                        <span className="text-[9px] uppercase font-bold text-amber-300 block font-mono">Sesiones Semanales</span>
                        <span className="font-extrabold text-white text-xs uppercase">{getCourseSchedulesList(selectedCourse.code).length} Bloques</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getCourseSchedulesList(selectedCourse.code).map((sch, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden text-left">
                        <div className="flex flex-row items-center justify-between p-5 border-b border-slate-150 bg-slate-50/50">
                          <div>
                            <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block font-mono">Sesión MPA</span>
                            <h3 className="uppercase text-slate-900 text-sm font-black mt-0.5">Clase {sch.type}</h3>
                          </div>
                          <span className="px-3 py-1 bg-[#800521] text-white font-black text-[10px] uppercase rounded-lg shadow-2xs">
                            {sch.day}
                          </span>
                        </div>
                        <div className="p-5 space-y-3 text-xs text-slate-650 font-bold leading-normal">
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-400 font-semibold">Hora de Inicio:</span>
                            <span className="text-slate-900 font-mono font-extrabold">{sch.start}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-400 font-semibold">Hora de Finalización:</span>
                            <span className="text-slate-900 font-mono font-extrabold">{sch.end}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-400 font-semibold">Aula / Taller:</span>
                            <span className="text-[#800521] uppercase font-black">{sch.classroom}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-400 font-semibold">Grupo Formativo:</span>
                            <span className="text-slate-900 uppercase font-black">{sch.group}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Frecuencia:</span>
                            <span className="text-slate-900 uppercase font-black text-[10.5px]">{sch.freq}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getCourseSchedulesList(selectedCourse.code).length === 0 && (
                      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 font-bold">Esta asignatura no tiene horario registrado para este docente en MPA.</p>
                    )}
                  </div>
                </PageTransition>
              )}

              {/* SECTION C: 16 WEEKS INTERACTIVE OPERATIONS SUB VIEW */}
              {activeSection === "week" && (
                <div className="space-y-6 block text-left font-sans">
                  {/* Themed Week Header Banner */}
                  <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 overflow-hidden text-left border-b-4 border-amber-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-md">
                          <span className="text-[9px] uppercase font-mono tracking-tighter leading-none">SEMANA</span>
                          <span className="text-2xl leading-none font-display">{selectedWeek}</span>
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="bg-white/20 text-amber-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block select-none font-mono">
                            {selectedCourse.code} • {selectedWeekOption.toUpperCase()}
                          </span>
                          <h2 className="text-lg md:text-xl font-black text-white tracking-tight uppercase leading-snug truncate">
                            {getWeekTheme(selectedCourse.code, selectedWeek, selectedCourse.name).topic}
                          </h2>
                          <p className="text-xs text-white/90 font-medium font-mono line-clamp-1">
                            {getWeekTheme(selectedCourse.code, selectedWeek, selectedCourse.name).desc}
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

                  {/* Wire sub-options dynamically */}
                  <div className="block">
                    {/* Sub-item 1: Asistencia */}
                    {selectedWeekOption === "asistencia" && (
                      <AsistenciaManager
                        loading={attendanceLoading}
                        error={attendanceError}
                        onReload={onReloadAttendance}
                        students={enrollments.filter((enrollment) => enrollment.academicStatus === "MATRICULADO" && enrollment.programId === (selectedCourse?.careerId || selectedCourse?.career)).map((enrollment) => studentsList[enrollment.studentDni]).filter(Boolean)}
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
                        students={enrollments.filter((enrollment) => enrollment.academicStatus === "MATRICULADO" && enrollment.programId === (selectedCourse?.careerId || selectedCourse?.career)).map((enrollment) => studentsList[enrollment.studentDni]).filter(Boolean)}
                        assignments={assignments}
                        onUpdateAssignments={onUpdateAssignments}
                      />
                    )}

                    {/* Sub-item 5: Observaciones */}
                    {selectedWeekOption === "observaciones" && (
                      <ObservacionManager
                        courseId={selectedCourseId}
                        week={selectedWeek}
                        observations={observationsLoading ? [] : weeklyObservations}
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
