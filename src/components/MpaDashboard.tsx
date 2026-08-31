import React, { useState, useEffect } from "react";
import { 
  Calendar, BookOpen, User, Users, Clipboard, Plus, Trash2, Edit, Save, Edit2,
  MapPin, Clock, BarChart3, HelpCircle, GraduationCap, LayoutDashboard, ArrowLeft, ArrowRight,
  Layers, Compass, CheckCircle2, ChevronRight, X, AlertCircle, Info, RefreshCw, LogOut, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MpaPeriod, MpaCareer, MpaCourse, MpaCurriculumItem, MpaShift, 
  MpaSchedule, MpaClassroom, MpaAcademicGroup, MpaProgramTask 
} from "../types";
import { REAL_MPA_CAREERS, REAL_MPA_COURSES } from "../lib/mockData";
import Sidebar from "./ui-custom/Sidebar";
import Button from "./ui-custom/Button";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, PieChart, Pie } from "recharts";

// Modern page transition wrapper
function PageTransition({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar p-1 sm:p-6 space-y-6"
    >
      {children}
    </motion.div>
  );
}


// Default initial data for Módulo de Planificación Académica (MPA)
const DEFAULT_PERIODS: MpaPeriod[] = [];

const DEFAULT_CAREERS: MpaCareer[] = [];

const DEFAULT_COURSES: MpaCourse[] = [
];

interface MpaCurriculumVersion {
  id: string;
  name: string;
  careerId: string;
  isActive: boolean;
  status?: "Activa" | "Inactiva" | "Borrador";
  created?: string;
}

const DEFAULT_CURRICULUM_VERSIONS: MpaCurriculumVersion[] = [];

const DEFAULT_CURRICULUM: MpaCurriculumItem[] = [];

const DEFAULT_SHIFTS: MpaShift[] = [];

const DEFAULT_SCHEDULES: MpaSchedule[] = [];

const DEFAULT_CLASSROOMS: MpaClassroom[] = [];

const DEFAULT_GROUPS: MpaAcademicGroup[] = [];

const DEFAULT_TEACHERS: any[] = [];

const DEFAULT_TASKS: MpaProgramTask[] = [];


// Safe specialties list extractor
export function getTeacherSpecialties(teacher: any): string[] {
  if (!teacher) return [];
  if (Array.isArray(teacher.specialties) && teacher.specialties.length > 0) {
    return teacher.specialties;
  }
  if (teacher.specialty) {
    return teacher.specialty.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
}

// Automatically calculates the end time based on pedagogical hours and duration
export function calculateEndTime(startTimeStr: string, pedagogicalHours: number, durationMinutes: number): string {
  if (!startTimeStr) return "";
  const startMins = parseTimeToMinutes(startTimeStr);
  const totalMins = startMins + (pedagogicalHours * durationMinutes);
  return formatMinutesToTime(totalMins);
}

// Helper to parse "08:00 AM", "01:30 PM", or "14:00" into minutes from midnight (0 to 1440)
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  
  if (ampm === "PM" && hours < 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

// Determines if two schedules conflict (overlap on the same day)
export function schedulesConflict(sch1: MpaSchedule, sch2: MpaSchedule): boolean {
  if (sch1.id === sch2.id) return true; // Same exact schedule implies 100% conflict
  if (sch1.dayOfWeek.trim().toLowerCase() !== sch2.dayOfWeek.trim().toLowerCase()) return false;
  
  let start1 = sch1.startTime ? parseTimeToMinutes(sch1.startTime) : 0;
  let end1 = sch1.endTime ? parseTimeToMinutes(sch1.endTime) : 0;
  
  if (!start1 && !end1 && sch1.timeSlot) {
    const parts = sch1.timeSlot.split("-");
    if (parts.length === 2) {
      start1 = parseTimeToMinutes(parts[0]);
      end1 = parseTimeToMinutes(parts[1]);
    }
  }
  
  let start2 = sch2.startTime ? parseTimeToMinutes(sch2.startTime) : 0;
  let end2 = sch2.endTime ? parseTimeToMinutes(sch2.endTime) : 0;
  
  if (!start2 && !end2 && sch2.timeSlot) {
    const parts = sch2.timeSlot.split("-");
    if (parts.length === 2) {
      start2 = parseTimeToMinutes(parts[0]);
      end2 = parseTimeToMinutes(parts[1]);
    }
  }
  
  // They overlap if max(start1, start2) < min(end1, end2) (or start1 < end2 && start2 < end1)
  return start1 < end2 && start2 < end1;
}

// Determines if two day/time ranges overlap
export function hoursOverlap(day1: string, start1Str: string, end1Str: string, day2: string, start2Str: string, end2Str: string): boolean {
  if (day1.trim().toLowerCase() !== day2.trim().toLowerCase()) return false;
  const start1 = parseTimeToMinutes(start1Str);
  const end1 = parseTimeToMinutes(end1Str);
  const start2 = parseTimeToMinutes(start2Str);
  const end2 = parseTimeToMinutes(end2Str);
  return start1 < end2 && start2 < end1;
}
export function getGroupBaseAndSub(name: string) {
  const trimmed = name.trim();
  const index = trimmed.lastIndexOf("-");
  if (index !== -1) {
    const base = trimmed.substring(0, index);
    const sub = trimmed.substring(index + 1);
    // Be robust with double check, only extract if the suffix is reasonably a sub number
    if (/^\d+$/.test(sub) || sub.toLowerCase().startsWith("sub") || sub.length <= 4) {
      return { base, sub };
    }
  }
  return { base: trimmed, sub: "" };
}

// Determines if two group names conflict.
// If bases are different, no conflict.
// If bases are same: conflict if either is general (sub is "") OR they are the same subgroup.
export function groupNamesConflict(nameA: string, nameB: string): boolean {
  const gA = getGroupBaseAndSub(nameA);
  const gB = getGroupBaseAndSub(nameB);
  
  if (gA.base.toLowerCase() !== gB.base.toLowerCase()) {
    return false;
  }
  
  // If one of them is the general group (empty sub), they conflict because general group encompasses all students.
  if (gA.sub === "" || gB.sub === "") {
    return true;
  }
  
  // If they are the same subgroup, they conflict.
  return gA.sub.toLowerCase() === gB.sub.toLowerCase();
}

export function formatMinutesToTime(totalMinutes: number): string {
  let hr = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12;
  if (hr === 0) hr = 12;
  const mmStr = mins < 10 ? `0${mins}` : `${mins}`;
  const hrStr = hr < 10 ? `0${hr}` : `${hr}`;
  return `${hrStr}:${mmStr} ${ampm}`;
}

const GENERAL_CODES = [
  "CO-101", "CO-102", "CO-103", "CO-104",
  "CO-201", "CO-202", "CO-203", "CO-204", "CO-205",
  "CO-301", "CO-302", "CO-303",
  "CO-401", "CO-402",
  "CO-501", "CO-502", "CO-503",
  "CO-601", "CO-602", "CO-603",
  "EL-101", "EL-102", "EL-201"
];

function enrichCourses(list: any[]): any[] {
  return list.map((c: any) => {
    let careerId = c.careerId;
    if (!careerId || careerId === "") {
      if (GENERAL_CODES.includes(c.code)) {
        careerId = "comun";
      } else if (c.code?.startsWith("CO-") || c.id?.startsWith("co_")) {
        careerId = "contabilidad";
      } else if (c.code?.startsWith("EL-") || c.id?.startsWith("el_")) {
        careerId = "electronica";
      } else {
        careerId = "comun";
      }
    } else if (GENERAL_CODES.includes(c.code) && careerId !== "comun") {
      careerId = "comun";
    }

    let referenceCycle = c.referenceCycle;
    if (!referenceCycle || referenceCycle === 0) {
      const match = c.code?.match(/[A-Z]+-(\d)\d\d/i);
      if (match) {
        referenceCycle = parseInt(match[1]);
      } else if (c.id?.includes("_p")) {
        const pMatch = c.id.match(/_p(\d)_/);
        if (pMatch) {
          referenceCycle = parseInt(pMatch[1]);
        }
      } else {
        referenceCycle = 1;
      }
    }
    return { ...c, careerId, referenceCycle };
  });
}

function enrichTeachers(list: any[]): any[] {
  return list.map((t: any) => {
    let careerId = t.careerId;
    if (!careerId || careerId === "") {
      const spec = t.specialty?.toLowerCase() || "";
      if (spec.includes("contabilidad") || spec.includes("costos") || spec.includes("finanzas") || spec.includes("tribut") || spec.includes("audito")) {
        careerId = "contabilidad";
      } else if (spec.includes("electric") || spec.includes("electrónic") || spec.includes("automa") || spec.includes("plc") || spec.includes("motores") || spec.includes("física") || spec.includes("maquinas")) {
        careerId = "electronica";
      } else {
        careerId = "comun";
      }
    }
    
    // Convert specialties securely
    let specialties = t.specialties;
    if (!Array.isArray(specialties) || specialties.length === 0) {
      specialties = t.specialty ? t.specialty.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    }

    return { ...t, careerId, specialties };
  });
}

function enrichClassrooms(list: any[]): any[] {
  return list.map((r: any) => {
    let careerId = r.careerId;
    if (!careerId || careerId === "") {
      const name = r.name?.toLowerCase() || "";
      if (name.includes("contabilidad") || name.includes("conta")) {
        careerId = "contabilidad";
      } else if (name.includes("electric") || name.includes("electrónic") || name.includes("taller") || name.includes("tecnolog")) {
        careerId = "electronica";
      } else {
        careerId = "comun";
      }
    }
    return { ...r, careerId };
  });
}

interface MpaDashboardProps {
  onLogout: () => void;
}

export default function MpaDashboard({ onLogout }: MpaDashboardProps) {
  // Navigation tabs of MPA
  const [activeTab, setActiveTab] = useState<
    "periods" | "careers" | "courses" | "curriculum" | "teachers" |
    "classrooms" | "shifts" | "groups" | "program" | "reports" | "support" | "dashboard" | "schedules" | "career_schedules"
  >("dashboard");

  // State collections
  const [periods, setPeriods] = useState<MpaPeriod[]>([]);
  const [careers, setCareers] = useState<MpaCareer[]>([]);
  const [courses, setCourses] = useState<MpaCourse[]>([]);
  const [curriculum, setCurriculum] = useState<MpaCurriculumItem[]>([]);
  const [curriculumVersions, setCurriculumVersions] = useState<MpaCurriculumVersion[]>([]);
  const [shifts, setShifts] = useState<MpaShift[]>([]);
  const [schedules, setSchedules] = useState<MpaSchedule[]>([]);
  const [classrooms, setClassrooms] = useState<MpaClassroom[]>([]);
  const [groups, setGroups] = useState<MpaAcademicGroup[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<MpaProgramTask[]>([]);

  // Load and Save to localStorage
  useEffect(() => {
    // Overwrite/initialize with real curriculums if not migrated
    const migrationKey = "mpa_db_migrated_v12";
    if (localStorage.getItem(migrationKey) !== "true") {
      // 1. Careers
      localStorage.setItem("mpa_db_careers", JSON.stringify(REAL_MPA_CAREERS));
      
      // 2. Courses
      localStorage.setItem("mpa_db_courses", JSON.stringify(REAL_MPA_COURSES));
      
      // 3. Curriculum Versions
      const versions = [
        { id: "v_electronica_2026", name: "Diseño Curricular 2026", careerId: "electronica", isActive: true, status: "Activa" },
        { id: "v_contabilidad_2026", name: "Diseño Curricular 2026", careerId: "contabilidad", isActive: true, status: "Activa" }
      ];
      localStorage.setItem("mpa_db_curriculum_versions", JSON.stringify(versions));
      
      // 4. Curriculum (links Courses to Versions)
      const curriculumItems = REAL_MPA_COURSES.map(crs => ({
        id: `curr_${crs.id}`,
        careerId: crs.careerId,
        courseId: crs.id,
        cycle: crs.referenceCycle,
        versionId: crs.careerId === "contabilidad" ? "v_contabilidad_2026" : "v_electronica_2026"
      }));
      localStorage.setItem("mpa_db_curriculum", JSON.stringify(curriculumItems));
      
      // 5. Default Period
      const defaultPeriods = [
        { id: "per_2026_1", name: "Periodo Académico 2026-I", startDate: "2026-04-06", endDate: "2026-07-24", isActive: true, status: "Activo" }
      ];
      localStorage.setItem("mpa_db_periods", JSON.stringify(defaultPeriods));

      // 6. Default Shifts
      const defaultShifts = [
        { id: "sh_m", name: "Mañana", startTime: "08:00 AM", endTime: "01:00 PM" },
        { id: "sh_t", name: "Tarde", startTime: "01:30 PM", endTime: "06:30 PM" },
        { id: "sh_n", name: "Noche", startTime: "06:45 PM", endTime: "10:30 PM" }
      ];
      localStorage.setItem("mpa_db_shifts", JSON.stringify(defaultShifts));

      // 7. Default Classrooms
      const defaultClassrooms = [
        { id: "cr_101", name: "Aula 101 - Teoría", type: "Teoría", location: "Pabellón A", capacity: 40, careerId: "comun" },
        { id: "cr_102", name: "Aula 102 - Teoría", type: "Teoría", location: "Pabellón A", capacity: 40, careerId: "comun" },
        { id: "cr_lab_e", name: "Laboratorio Electricidad I", type: "Laboratorio", location: "Pabellón B", capacity: 25, careerId: "electronica" },
        { id: "cr_lab_c", name: "Laboratorio Cómputo / Contable", type: "Laboratorio", location: "Pabellón B", capacity: 30, careerId: "contabilidad" }
      ];
      localStorage.setItem("mpa_db_classrooms", JSON.stringify(defaultClassrooms));

      // 8. Default Teachers
      const defaultTeachers = [
        { dni: "10101010", name: "Carlos", lastName: "Sánchez Mendoza", email: "carlos.sanchez@sfa.edu.pe", specialty: "Contabilidad General y Tributación", status: "Disponible", careerId: "contabilidad" },
        { dni: "20202020", name: "Enrique", lastName: "Gómez Salas", email: "enrique.gomez@sfa.edu.pe", specialty: "Electricidad y Sistemas de Potencia", status: "Disponible", careerId: "electronica" },
        { dni: "30303030", name: "Patricia", lastName: "Ruiz Vargas", email: "patricia.ruiz@sfa.edu.pe", specialty: "Comunicación y Relaciones Laborales", status: "Disponible", careerId: "comun" }
      ];
      localStorage.setItem("mpa_db_teachers", JSON.stringify(defaultTeachers));

      // 9. Default Groups (First Cycle)
      const defaultGroups = [
        { id: "gp_con_p1", name: "CONTABILIDAD-I-A", periodId: "per_2026_1", careerId: "contabilidad", cycle: 1, shiftId: "sh_m", capacity: 30, curriculumVersionId: "v_contabilidad_2026" },
        { id: "gp_ele_p1", name: "ELECTRICIDAD-I-A", periodId: "per_2026_1", careerId: "electronica", cycle: 1, shiftId: "sh_n", capacity: 30, curriculumVersionId: "v_electronica_2026" }
      ];
      localStorage.setItem("mpa_db_groups", JSON.stringify(defaultGroups));

      // 10. Predefined Schedules (Time Slots / Horarios)
      const defaultSchedules = [
        { id: "sch_m1", dayOfWeek: "Lunes", startTime: "08:00 AM", endTime: "01:00 PM", timeSlot: "08:00 AM - 01:00 PM", shiftId: "sh_m" },
        { id: "sch_m2", dayOfWeek: "Martes", startTime: "08:00 AM", endTime: "01:00 PM", timeSlot: "08:00 AM - 01:00 PM", shiftId: "sh_m" },
        { id: "sch_m3", dayOfWeek: "Miércoles", startTime: "08:00 AM", endTime: "01:00 PM", timeSlot: "08:00 AM - 01:00 PM", shiftId: "sh_m" },
        { id: "sch_m4", dayOfWeek: "Jueves", startTime: "08:00 AM", endTime: "01:00 PM", timeSlot: "08:00 AM - 01:00 PM", shiftId: "sh_m" },
        { id: "sch_m5", dayOfWeek: "Viernes", startTime: "08:00 AM", endTime: "01:00 PM", timeSlot: "08:00 AM - 01:00 PM", shiftId: "sh_m" },
        
        { id: "sch_n1", dayOfWeek: "Lunes", startTime: "06:45 PM", endTime: "10:30 PM", timeSlot: "06:45 PM - 10:30 PM", shiftId: "sh_n" },
        { id: "sch_n2", dayOfWeek: "Martes", startTime: "06:45 PM", endTime: "10:30 PM", timeSlot: "06:45 PM - 10:30 PM", shiftId: "sh_n" },
        { id: "sch_n3", dayOfWeek: "Miércoles", startTime: "06:45 PM", endTime: "10:30 PM", timeSlot: "06:45 PM - 10:30 PM", shiftId: "sh_n" },
        { id: "sch_n4", dayOfWeek: "Jueves", startTime: "06:45 PM", endTime: "10:30 PM", timeSlot: "06:45 PM - 10:30 PM", shiftId: "sh_n" },
        { id: "sch_n5", dayOfWeek: "Viernes", startTime: "06:45 PM", endTime: "10:30 PM", timeSlot: "06:45 PM - 10:30 PM", shiftId: "sh_n" }
      ];
      localStorage.setItem("mpa_db_schedules", JSON.stringify(defaultSchedules));

      // 11. Preloaded Academic Programming Tasks (Linked Schedules)
      const defaultTasks = [
        // CONTABILIDAD - Turno Mañana
        {
          id: "task_con_1",
          groupId: "gp_con_p1",
          courseId: "con_p1_5", // Contabilidad General I
          teacherDni: "10101010", // Carlos Sánchez Mendoza
          classroomId: "cr_101", // Aula 101 - Teoría
          scheduleId: "sch_m1", // Lunes Mañana
          sessionType: "Teoría",
          sessionClassType: "Teo",
          dayOfWeek: "Lunes",
          startTime: "08:00 AM",
          endTime: "01:00 PM",
          shiftId: "sh_m",
          pedagogicalHours: 6
        },
        {
          id: "task_con_2",
          groupId: "gp_con_p1",
          courseId: "con_p1_6", // Plan Contable
          teacherDni: "10101010", // Carlos Sánchez Mendoza
          classroomId: "cr_102", // Aula 102 - Teoría
          scheduleId: "sch_m2", // Martes Mañana
          sessionType: "Teoría",
          sessionClassType: "Teo",
          dayOfWeek: "Martes",
          startTime: "08:00 AM",
          endTime: "01:00 PM",
          shiftId: "sh_m",
          pedagogicalHours: 6
        },
        {
          id: "task_con_3",
          groupId: "gp_con_p1",
          courseId: "con_p1_1", // Técnica de Comunicación
          teacherDni: "30303030", // Patricia Ruiz Vargas
          classroomId: "cr_101", // Aula 101
          scheduleId: "sch_m3", // Miércoles Mañana
          sessionType: "Teoría",
          sessionClassType: "Teo",
          dayOfWeek: "Miércoles",
          startTime: "08:00 AM",
          endTime: "01:00 PM",
          shiftId: "sh_m",
          pedagogicalHours: 6
        },
        {
          id: "task_con_4",
          groupId: "gp_con_p1",
          courseId: "con_p1_7", // Documentación Comercial y Contable
          teacherDni: "10101010", // Carlos Sánchez Mendoza
          classroomId: "cr_lab_c", // Laboratorio Cómputo / Contable
          scheduleId: "sch_m4", // Jueves Mañana
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Jueves",
          startTime: "08:00 AM",
          endTime: "01:00 PM",
          shiftId: "sh_m",
          pedagogicalHours: 6
        },
        {
          id: "task_con_5",
          groupId: "gp_con_p1",
          courseId: "con_p1_4", // Informática e Internet
          teacherDni: "30303030", // Patricia Ruiz Vargas
          classroomId: "cr_lab_c", // Laboratorio Cómputo
          scheduleId: "sch_m5", // Viernes Mañana
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Viernes",
          startTime: "08:00 AM",
          endTime: "01:00 PM",
          shiftId: "sh_m",
          pedagogicalHours: 6
        },

        // ELECTRICIDAD INDUSTRIAL - Turno Noche
        {
          id: "task_ele_1",
          groupId: "gp_ele_p1",
          courseId: "ele_p1_1", // Instalaciones Eléctricas de Interiores
          teacherDni: "20202020", // Enrique Gómez Salas
          classroomId: "cr_lab_e", // Laboratorio Electricidad I
          scheduleId: "sch_n1", // Lunes Noche
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Lunes",
          startTime: "06:45 PM",
          endTime: "10:30 PM",
          shiftId: "sh_n",
          pedagogicalHours: 5
        },
        {
          id: "task_ele_2",
          groupId: "gp_ele_p1",
          courseId: "ele_p1_2", // Circuitos Eléctricos I
          teacherDni: "20202020", // Enrique Gómez Salas
          classroomId: "cr_lab_e", // Laboratorio Electricidad I
          scheduleId: "sch_n2", // Martes Noche
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Martes",
          startTime: "06:45 PM",
          endTime: "10:30 PM",
          shiftId: "sh_n",
          pedagogicalHours: 5
        },
        {
          id: "task_ele_3",
          groupId: "gp_ele_p1",
          courseId: "ele_p1_6", // Comunicación y Redacción Técnica
          teacherDni: "30303030", // Patricia Ruiz Vargas
          classroomId: "cr_101", // Aula 101 - Teoría
          scheduleId: "sch_n3", // Miércoles Noche
          sessionType: "Teoría",
          sessionClassType: "Teo",
          dayOfWeek: "Miércoles",
          startTime: "06:45 PM",
          endTime: "10:30 PM",
          shiftId: "sh_n",
          pedagogicalHours: 5
        },
        {
          id: "task_ele_4",
          groupId: "gp_ele_p1",
          courseId: "ele_p1_3", // Dibujo Técnico Eléctrico
          teacherDni: "20202020", // Enrique Gómez Salas
          classroomId: "cr_lab_e", // Laboratorio Electricidad I
          scheduleId: "sch_n4", // Jueves Noche
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Jueves",
          startTime: "06:45 PM",
          endTime: "10:30 PM",
          shiftId: "sh_n",
          pedagogicalHours: 5
        },
        {
          id: "task_ele_5",
          groupId: "gp_ele_p1",
          courseId: "ele_p1_7", // Informática e Internet
          teacherDni: "30303030", // Patricia Ruiz Vargas
          classroomId: "cr_lab_c", // Laboratorio Cómputo
          scheduleId: "sch_n5", // Viernes Noche
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Viernes",
          startTime: "06:45 PM",
          endTime: "10:30 PM",
          shiftId: "sh_n",
          pedagogicalHours: 5
        }
      ];
      localStorage.setItem("mpa_db_tasks", JSON.stringify(defaultTasks));

      localStorage.setItem(migrationKey, "true");
    }

    // Load state helper with fallback
    const getSaved = (key: string, defaults: any) => {
      const saved = localStorage.getItem(`mpa_db_${key}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
          console.error(`Error loading state for key ${key}:`, e);
        }
      }
      return defaults;
    };

    setPeriods(getSaved("periods", DEFAULT_PERIODS));
    setCareers(getSaved("careers", DEFAULT_CAREERS));
    setCourses(getSaved("courses", DEFAULT_COURSES));
    setCurriculum(getSaved("curriculum", DEFAULT_CURRICULUM));
    setCurriculumVersions(getSaved("curriculum_versions", DEFAULT_CURRICULUM_VERSIONS));
    setShifts(getSaved("shifts", DEFAULT_SHIFTS));
    schedulesStateSet(getSaved("schedules", DEFAULT_SCHEDULES));
    setClassrooms(getSaved("classrooms", DEFAULT_CLASSROOMS));
    setGroups(getSaved("groups", DEFAULT_GROUPS));
    setTeachers(getSaved("teachers", DEFAULT_TEACHERS));
    setTasks(getSaved("tasks", DEFAULT_TASKS));
  }, []);

  const schedulesStateSet = (list: MpaSchedule[]) => {
    setSchedules(list);
  };

  const saveDb = (key: string, value: any, setter: Function) => {
    setter(value);
    localStorage.setItem(`mpa_db_${key}`, JSON.stringify(value));
  };

  // Temp Form States
  const [formPeriod, setFormPeriod] = useState<MpaPeriod>({ id: "", name: "", startDate: "", endDate: "", isActive: false });
  const [formPeriodYear, setFormPeriodYear] = useState<number>(new Date().getFullYear());
  const [formPeriodTerm, setFormPeriodTerm] = useState<"0" | "I" | "II">("I");
  const [formCareer, setFormCareer] = useState<MpaCareer>({ id: "", name: "", code: "", durationSemesters: 6 });
  const [formCourse, setFormCourse] = useState({ id: "", name: "", code: "", credits: 3, theoryHours: 2, labHours: 2, status: "Activo" as "Activo" | "Inactivo", careerId: "", referenceCycle: 1, type: "Especialidad" as "General" | "Especialidad" });
  const [formCurr, setFormCurr] = useState({ id: "", careerId: "", courseId: "", cycle: 1, versionId: "" });
  const [formTeacher, setFormTeacher] = useState({ dni: "", name: "", lastName: "", email: "", specialty: "", status: "Disponible" as "Disponible" | "Licencia" | "Inactivo", careerId: "comun" });
  const [formRoom, setFormRoom] = useState({ id: "", name: "", type: "Teoría" as "Teoría" | "Laboratorio", location: "", capacity: 40, careerId: "comun" });
  const [formShift, setFormShift] = useState({ id: "", name: "", startTime: "", endTime: "" });
  const [formSchedule, setFormSchedule] = useState({ id: "", dayOfWeek: "Lunes", startTime: "07:00", endTime: "09:00", timeSlot: "", shiftId: "" });
  const [formGroup, setFormGroup] = useState({ id: "", name: "", periodId: "", careerId: "", cycle: 1, shiftId: "", capacity: 30 });
  const [viewingScheduleGroupId, setViewingScheduleGroupId] = useState<string | null>(null);

  // Institutional and Teacher Filter States
  const [pedagogicalHourDuration, setPedagogicalHourDuration] = useState<number>(() => {
    const saved = localStorage.getItem("mpa_config_pedagogical_hour_duration");
    return saved ? parseInt(saved, 10) : 50;
  });

  const savePedagogicalHourDuration = (duration: number) => {
    setPedagogicalHourDuration(duration);
    localStorage.setItem("mpa_config_pedagogical_hour_duration", duration.toString());
  };

  const [teacherSelectedSpecialties, setTeacherSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [teacherSpecialtyFilter, setTeacherSpecialtyFilter] = useState("all");
  
  // Custom Visual Curriculum Editor States
  const [coursesFilterCareer, setCoursesFilterCareer] = useState<string>("all");
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [newVersionName, setNewVersionName] = useState<string>("");
  const [editingVersionId, setEditingVersionId] = useState<string>("");
  const [editingVersionName, setEditingVersionName] = useState<string>("");
  const [cycleSearch, setCycleSearch] = useState<{[key: number]: string}>({});
  const [formTask, setFormTask] = useState({
    id: "",
    groupId: "",
    courseId: "",
    teacherDni: "",
    classroomId: "",
    scheduleId: "",
    sessionType: "Teoría" as "Teoría" | "Laboratorio",
    dayOfWeek: "Lunes",
    startTime: "",
    endTime: "",
    pedagogicalHours: 3
  });

  // Direct Programación helper states (to resolve "grupo académico dependiente de un curso")
  const [progPeriodId, setProgPeriodId] = useState<string>("");
  const [progCareerId, setProgCareerId] = useState<string>("");
  const [progCycle, setProgCycle] = useState<number>(1);
  const [progShiftId, setProgShiftId] = useState<string>("");
  const [progGroupNum, setProgGroupNum] = useState<string>("01"); // "01", "02", "03"
  const [progSubGroupType, setProgSubGroupType] = useState<string>("0"); // "0", "1", "2"
  const [progClassType, setProgClassType] = useState<"Teo" | "Lab" | "Tal">("Teo");

  // Career Schedules filtering states
  const [filterSchCareerId, setFilterSchCareerId] = useState<string>("");
  const [filterSchCycle, setFilterSchCycle] = useState<number>(1);
  const [filterSchGroupId, setFilterSchGroupId] = useState<string>("all");
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState<string | null>(null);
  const [shiftErrorMessage, setShiftErrorMessage] = useState<string | null>(null);

  // Support State
  const [supportTickets, setSupportTickets] = useState<{ id: string; subject: string; text: string; date: string; reply?: string }[]>(() => {
    const saved = localStorage.getItem("mpa_support_tickets");
    return saved ? JSON.parse(saved) : [
      { id: "tk1", subject: "Conflicto de Aula 201 en Mañana", text: "Trato de programar Teoría el día Lunes pero se solapa con Laboratorio", date: "11/06/2026", reply: "Hola, verifique que la sesión de tipo Teoría esté asignada a un aula de tipo Teoría en vez del Lab." }
    ];
  });
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketText, setNewTicketText] = useState("");

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketText) return;
    const next = [
      ...supportTickets,
      {
        id: "tk_" + Date.now(),
        subject: newTicketSubject,
        text: newTicketText,
        date: new Date().toLocaleDateString("es-PE"),
      }
    ];
    setSupportTickets(next);
    localStorage.setItem("mpa_support_tickets", JSON.stringify(next));
    setNewTicketSubject("");
    setNewTicketText("");
    alert("Consulta de Soporte Técnico enviada a la Secretaría del Local.");
  };

  const getDocenteName = (dni: string) => {
    const t = teachers.find(x => x.dni === dni);
    return t ? `${t.name} ${t.lastName}` : dni;
  };

  const getGroupName = (id: string) => {
    return groups.find(x => x.id === id)?.name || id;
  };

  const get_course_name = (id: string) => {
    return courses.find(x => x.id === id)?.name || id;
  };

  const get_classroom_name = (id: string) => {
    return classrooms.find(x => x.id === id)?.name || id;
  };

  const get_schedule_desc = (id: string) => {
    const s = schedules.find(x => x.id === id);
    return s ? `${s.dayOfWeek} ${s.timeSlot}` : id;
  };

  return (
    <div 
      id="mpa-workspace" 
      className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row pb-0"
    >
      <Sidebar 
        institution={{
          name: "Planificación SFA",
          subtitle: "Módulo MPA Académica"
        }}
        user={{
          name: "Planificador MPA",
          role: "Coordinador Académico",
          status: "ACTIVO / MPA"
        }}
        sections={[
          {
            title: "MÓDULOS DE PLANIFICACIÓN",
            items: [
              { label: "1. Períodos Académicos", icon: <Calendar className="w-4 h-4" />, route: "periods", active: activeTab === "periods" },
              { label: "2. Gestión de Carreras", icon: <GraduationCap className="w-4 h-4" />, route: "careers", active: activeTab === "careers" },
              { label: "3. Gestión de Cursos", icon: <BookOpen className="w-4 h-4" />, route: "courses", active: activeTab === "courses" },
              { label: "4. Mallas Curriculares", icon: <Layers className="w-4 h-4" />, route: "curriculum", active: activeTab === "curriculum" },
              { label: "5. Gestión de Docentes", icon: <User className="w-4 h-4" />, route: "teachers", active: activeTab === "teachers" },
              { label: "6. Gestión de Aulas", icon: <MapPin className="w-4 h-4" />, route: "classrooms", active: activeTab === "classrooms" },
              { label: "7. Gestión de Turnos", icon: <Clock className="w-4 h-4" />, route: "shifts", active: activeTab === "shifts" },
              { label: "8. Grupos Académicos", icon: <Users className="w-4 h-4" />, route: "groups", active: activeTab === "groups" },
              { label: "9. Programación Académica", icon: <Clipboard className="w-4 h-4" />, route: "program", active: activeTab === "program" },
              { label: "10. Reportes", icon: <BarChart3 className="w-4 h-4" />, route: "reports", active: activeTab === "reports" },
              { label: "11. Soporte Técnico", icon: <HelpCircle className="w-4 h-4" />, route: "support", active: activeTab === "support" }
            ]
          }
        ]}
        onItemClick={(route: any) => setActiveTab(route)}
        onLogout={onLogout}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="text-left">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none uppercase">
              {activeTab === "periods" && "1. Gestión de Períodos Académicos"}
              {activeTab === "careers" && "2. Gestión de Carreras"}
              {activeTab === "courses" && "3. Gestión de Cursos"}
              {activeTab === "curriculum" && "4. Gestión de Mallas Curriculares"}
              {activeTab === "teachers" && "5. Gestión de Docentes"}
              {activeTab === "classrooms" && "6. Gestión de Aulas"}
              {activeTab === "shifts" && "7. Gestión de Turnos"}
              {activeTab === "groups" && "8. Gestión de Grupos Académicos"}
              {activeTab === "program" && "9. Programación Académica por Horas Reales"}
              {activeTab === "reports" && "10. Reportes y Horarios Consolidados"}
              {activeTab === "support" && "11. Soporte Técnico"}
            </h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
              IESTP San Francisco de Asís • Cuenta Planificación Académica (MPA)
            </p>
          </div>
          <span className="text-[11px] font-black text-[#9F062A] bg-[#9F062A]/10 px-3 py-1.5 rounded-lg border border-[#9F062A]/20 font-mono tracking-widest hidden sm:inline-block">
            ROL: MPA
          </span>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            /* TABS: DASHBOARD */
            {activeTab === "dashboard" && (
              <PageTransition id="dashboard">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Períodos Académicos
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{periods.length}</p>
                    </div>
                    <span className="text-[9px] block text-slate-500 font-semibold mt-2">Ciclos vigentes y planificados</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        Carreras Profesionales
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{careers.length}</p>
                    </div>
                    <span className="text-[9px] block text-slate-500 font-semibold mt-2">Programas de estudio activos</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        Cursos Registrados
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{courses.length}</p>
                    </div>
                    <span className="text-[9px] block text-slate-500 font-semibold mt-2">Asignaturas en catálogo</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Docentes Disponibles
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{teachers.length}</p>
                    </div>
                    <span className="text-[9px] block text-emerald-600 font-extrabold mt-2">Plana docente habilitada</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Aulas e Infraestructura
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{classrooms.length}</p>
                    </div>
                    <span className="text-[9px] block text-slate-500 font-semibold mt-2">Teorías e instalaciones de cómputo</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        Grupos Académicos
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{groups.length}</p>
                    </div>
                    <span className="text-[9px] block text-[#9F062A] font-extrabold mt-2">Secciones (1-1, 1-2, etc.) creadas</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Horarios Registrados
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{schedules.length}</p>
                    </div>
                    <span className="text-[9px] block text-slate-500 font-semibold mt-2">Franjas de horas habilitadas</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#9F062A]/20 shadow-sm flex flex-col justify-between bg-[#9F062A]/[0.01]">
                    <div>
                      <p className="text-[9px] text-[#9F062A] font-extrabold uppercase flex items-center gap-1">
                        <Clipboard className="w-3.5 h-3.5 text-[#9F062A]" />
                        Cursos Programados
                      </p>
                      <p className="text-2xl font-black text-[#9F062A] mt-2 font-mono">{tasks.length}</p>
                    </div>
                    <span className="text-[9px] block text-slate-500 font-semibold mt-2">Sesiones de clases asignadas</span>
                  </div>
                </div>

                {/* Indicadores de Cobertura de Planificación (Requerimiento 5) */}
                {(() => {
                  const requiredPlanningItems: any[] = [];
                  groups.forEach(group => {
                    const linkedVersionId = group.curriculumVersionId || curriculumVersions.find(v => v.careerId === group.careerId && v.isActive)?.id;
                    const matchedCurriculum = curriculum.filter(
                      it => it.careerId === group.careerId && 
                            it.cycle === group.cycle && 
                            (!linkedVersionId || it.versionId === linkedVersionId)
                    );
                    
                    matchedCurriculum.forEach(it => {
                      const course = courses.find(c => c.id === it.courseId && c.status !== "Inactivo");
                      if (course) {
                        requiredPlanningItems.push({ group, course });
                      }
                    });
                  });

                  let totalCursosCompletos = 0;
                  let totalCursosPendientes = 0;
                  let totalTheoryHoursRequired = 0;
                  let totalLabHoursRequired = 0;
                  let totalTheoryHoursPending = 0;
                  let totalLabHoursPending = 0;

                  requiredPlanningItems.forEach(item => {
                    const { group, course } = item;
                    const relatedTasks = tasks.filter(t => t.groupId === group.id && t.courseId === course.id);
                    const pTheory = relatedTasks
                      .filter(t => t.sessionType === "Teoría")
                      .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                    const pLab = relatedTasks
                      .filter(t => t.sessionType === "Laboratorio")
                      .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                      
                    const rTheory = course.theoryHours || 0;
                    const rLab = course.labHours || 0;
                    
                    totalTheoryHoursRequired += rTheory;
                    totalLabHoursRequired += rLab;
                    
                    const pendingT = Math.max(0, rTheory - pTheory);
                    const pendingL = Math.max(0, rLab - pLab);
                    
                    totalTheoryHoursPending += pendingT;
                    totalLabHoursPending += pendingL;
                    
                    const isComplete = pTheory >= rTheory && pLab >= rLab;
                    if (isComplete) {
                      totalCursosCompletos++;
                    } else {
                      totalCursosPendientes++;
                    }
                  });

                  const totalHoursRequired = totalTheoryHoursRequired + totalLabHoursRequired;
                  const totalHoursPending = totalTheoryHoursPending + totalLabHoursPending;
                  const totalHoursActiveMatched = Math.max(0, totalHoursRequired - totalHoursPending);
                  const percentageAvance = totalHoursRequired > 0 ? Math.round((totalHoursActiveMatched / totalHoursRequired) * 100) : 0;

                  return (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left relative overflow-hidden space-y-4">
                      <div className="border-b pb-3">
                        <span className="text-[9px] text-[#9F062A] font-extrabold uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">
                          Resumen General de Cobertura
                        </span>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-[#9F062A]" />
                          Dashboard de Cobertura Académica
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          Avance en tiempo real de la cobertura horaria y programática respecto a las mallas curriculares vigentes.
                        </p>
                      </div>

                      {/* Main advance section */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-2 flex flex-col justify-center items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Avance Planificación</span>
                          <span className="text-4xl font-black text-[#9F062A] mt-1 font-mono">{percentageAvance}%</span>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full mt-3 overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentageAvance}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold mt-2 text-center leading-none">
                            {totalHoursActiveMatched} de {totalHoursRequired} horas totales cubiertas
                          </span>
                        </div>

                        <div className="md:col-span-3 grid grid-cols-2 gap-3">
                          <div className="p-3 border border-slate-150 rounded-lg bg-emerald-50/20">
                            <span className="block text-[8.5px] text-slate-400 font-extrabold uppercase">Cursos Completados</span>
                            <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">{totalCursosCompletos}</span>
                            <span className="text-[9px] text-slate-500 font-semibold block leading-none mt-1">Planificación horaria 100% cubierta</span>
                          </div>

                          <div className="p-3 border border-slate-150 rounded-lg bg-amber-50/20">
                            <span className="block text-[8.5px] text-slate-400 font-extrabold uppercase">Cursos Pendientes</span>
                            <span className="text-xl font-black text-amber-700 font-mono mt-1 block">{totalCursosPendientes}</span>
                            <span className="text-[9px] text-slate-500 font-semibold block leading-none mt-1">Con horas de Teoría o Lab faltantes</span>
                          </div>

                          <div className="p-3 border border-slate-150 rounded-lg bg-rose-50/20">
                            <span className="block text-[8.5px] text-slate-400 font-extrabold uppercase">Teoría Pendiente</span>
                            <span className="text-xl font-black text-rose-700 font-mono mt-1 block">{totalTheoryHoursPending} <span className="text-xs font-bold font-sans text-slate-400">horas</span></span>
                            <span className="text-[9px] text-slate-500 font-semibold block leading-none mt-1">Por asignar en sesiones teóricas</span>
                          </div>

                          <div className="p-3 border border-slate-150 rounded-lg bg-indigo-50/20">
                            <span className="block text-[8.5px] text-slate-400 font-extrabold uppercase">Laboratorio Pendiente</span>
                            <span className="text-xl font-black text-indigo-700 font-mono mt-1 block">{totalLabHoursPending} <span className="text-xs font-bold font-sans text-slate-400">horas</span></span>
                            <span className="text-[9px] text-slate-500 font-semibold block leading-none mt-1">Por asignar en ambientes prácticos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 hidden lg:block">
                    <Layers className="w-48 h-48 text-[#9F062A]" />
                  </div>
                  <h3 className="text-sm font-black text-[#9F062A] uppercase.tracking-wider">Flujo de Trabajo del MPA</h3>
                  <p className="text-slate-500 text-xs font-semibold max-w-2xl leading-relaxed mt-1">
                    Siga en orden el proceso secuencial establecido por la Dirección General para garantizar una planificación académica sin solapamiento de horarios, docentes ni aulas.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-6 font-semibold">
                    <button onClick={() => setActiveTab("periods")} className="p-3 bg-slate-50 hover:bg-slate-100 border rounded-lg text-left transition-all cursor-pointer">
                      <span className="text-[9px] text-[#9F062A] font-black uppercase">Paso 1</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">Períodos Académicos</p>
                    </button>
                    <button onClick={() => setActiveTab("careers")} className="p-3 bg-slate-50 hover:bg-slate-100 border rounded-lg text-left transition-all cursor-pointer">
                      <span className="text-[9px] text-[#9F062A] font-black uppercase">Paso 2</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">Registrar Carreras</p>
                    </button>
                    <button onClick={() => setActiveTab("courses")} className="p-3 bg-slate-50 hover:bg-slate-100 border rounded-lg text-left transition-all cursor-pointer">
                      <span className="text-[9px] text-[#9F062A] font-black uppercase">Paso 3</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">Registrar Cursos</p>
                    </button>
                    <button onClick={() => setActiveTab("curriculum")} className="p-3 bg-slate-50 hover:bg-slate-100 border rounded-lg text-left transition-all cursor-pointer">
                      <span className="text-[9px] text-[#9F062A] font-black uppercase">Paso 4</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">Mallas Curriculares</p>
                    </button>
                    <button onClick={() => setActiveTab("program")} className="p-3 bg-[#9F062A] hover:bg-[#800521] text-white border-none rounded-lg text-left transition-all cursor-pointer shadow-md">
                      <span className="text-[9px] text-amber-300 font-black uppercase">Paso 5 / Final</span>
                      <p className="text-xs font-bold text-white mt-1">Programación Final</p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest block mb-4 border-b pb-2">Información del Sistema</h4>
                    <ul className="text-xs font-semibold text-slate-600 space-y-3">
                      <li className="flex justify-between">
                        <span>Estado de Servidor:</span>
                        <span className="text-emerald-600 font-extrabold uppercase">● Planificación Abierta</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Regla Curricular Activa:</span>
                        <span className="text-slate-800 font-bold">Un curso es asignado a ciclo vía Malla</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Validación Cruzada:</span>
                        <span className="text-slate-800 font-bold">Filtro Teoría/Laboratorio activo</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#9F062A]/5 p-5 rounded-xl border border-[#9F062A]/20 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-[#9F062A] uppercase tracking-widest">Aviso Importante</h4>
                      <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed mt-2">
                        Debe configurar las mallas curriculares antes de iniciar la programación de los grupos académicos. La asignación automática de cursos a un aula requiere que existan tanto el curso dentro de la malla como el aula con su respectiva topología (Teoría / Laboratorio) habilitada.
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-4 block">Dirección Académica IESTP SFA</span>
                  </div>
                </div>
              </PageTransition>
            )}

            {/* TAB: PERIODS (1) */}
            {activeTab === "periods" && (
              <PageTransition id="periods">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  {/* Creación / Modificación de Periodos */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Nuevo Período</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const computedName = `Periodo ${formPeriodYear}-${formPeriodTerm}`;
                        const exist = periods.some(p => p.name === computedName);
                        if (exist) {
                          alert(`Ya existe un período con el nombre "${computedName}".`);
                          return;
                        }
                        if (!formPeriod.startDate || !formPeriod.endDate) {
                          alert("Por favor configure las fechas de inicio y de cierre.");
                          return;
                        }
                        const id = "p_" + Date.now();
                        const finalPStatus = formPeriod.status || "Planificación";
                        const next = [...periods, { 
                          ...formPeriod, 
                          id, 
                          name: computedName, 
                          status: finalPStatus, 
                          isActive: finalPStatus === "Activo" 
                        }];
                        saveDb("periods", next, setPeriods);
                        setFormPeriod({ id: "", name: "", startDate: "", endDate: "", isActive: false, status: "Planificación" });
                        setFormPeriodTerm("I");
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Año Académico *</label>
                          <select
                            value={formPeriodYear}
                            onChange={(e) => setFormPeriodYear(Number(e.target.value))}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-bold text-slate-800"
                          >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032].map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Término Periodo *</label>
                          <select
                            value={formPeriodTerm}
                            onChange={(e) => setFormPeriodTerm(e.target.value as "0" | "I" | "II")}
                            className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-black text-[#9F062A]"
                          >
                            <option value="0">0 (Ciclo Cero / Nivelación)</option>
                            <option value="I">I (Primer Periodo)</option>
                            <option value="II">II (Segundo Periodo)</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/80">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">Vista Previa de Nombre</span>
                        <span className="text-xs font-extrabold text-[#9F062A] font-mono select-all">
                          Periodo {formPeriodYear}-{formPeriodTerm}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Fecha Inicio *</label>
                          <input 
                            type="date" 
                            required 
                            value={formPeriod.startDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              let computedEnd = formPeriod.endDate;
                              if (val) {
                                // Default period duration is 16 weeks (112 days)
                                const d = new Date(val + "T12:00:00");
                                d.setDate(d.getDate() + 112);
                                computedEnd = d.toISOString().split("T")[0];
                              }
                              setFormPeriod({ ...formPeriod, startDate: val, endDate: computedEnd });
                            }}
                            className="w-full mt-1 px-3 py-2 border rounded-md font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Fecha Cierre *</label>
                          <input 
                            type="date" 
                            required 
                            value={formPeriod.endDate}
                            onChange={(e) => setFormPeriod({ ...formPeriod, endDate: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md font-bold"
                          />
                          <span className="text-[9px] text-emerald-600 font-bold block mt-1 tracking-tight">
                            * Auto-calculado a 16 semanas por defecto
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado del Período *</label>
                        <select
                          value={formPeriod.status || "Planificación"}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setFormPeriod({ ...formPeriod, status: val, isActive: val === "Activo" });
                          }}
                          className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-bold text-slate-800"
                        >
                          <option value="Planificación">Planificación</option>
                          <option value="Activo">Activo</option>
                          <option value="Cerrado">Cerrado</option>
                        </select>
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Guardar Período Académico
                      </Button>
                    </form>
                  </div>

                  {/* Listado de Periodos */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Registros Registrados</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Nombre del Periodo</th>
                            <th className="p-3">Fecha Inicio / Fin</th>
                            <th className="p-3 text-center">Estado</th>
                            <th className="p-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold">
                          {periods.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-400 font-semibold text-xs">
                                No existen períodos académicos registrados.
                              </td>
                            </tr>
                          ) : (
                            periods.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-black text-slate-800 font-mono text-xs">{item.name}</td>
                              <td className="p-3 font-mono">{item.startDate} al {item.endDate}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                                  (item.status || (item.isActive ? "Activo" : "Planificación")) === "Activo"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                    : (item.status || (item.isActive ? "Activo" : "Planificación")) === "Cerrado"
                                    ? "bg-rose-50 text-rose-800 border-rose-250"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}>
                                  {item.status || (item.isActive ? "Activo" : "Planificación")}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex gap-1.5 mr-3">
                                  <button 
                                    onClick={() => {
                                      const next = periods.map(p => ({
                                        ...p,
                                        status: p.id === item.id ? "Activo" as const : p.status === "Activo" ? "Planificación" as const : p.status,
                                        isActive: p.id === item.id ? true : false
                                      }));
                                      saveDb("periods", next, setPeriods);
                                    }}
                                    className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-black hover:bg-emerald-100 uppercase cursor-pointer"
                                  >
                                    Activar
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const next = periods.map(p => ({
                                        ...p,
                                        status: p.id === item.id ? "Cerrado" as const : p.status,
                                        isActive: p.id === item.id ? false : p.isActive
                                      }));
                                      saveDb("periods", next, setPeriods);
                                    }}
                                    className="text-[9px] bg-rose-50 text-rose-850 border border-rose-200 px-1.5 py-0.5 rounded font-black hover:bg-rose-100 uppercase cursor-pointer"
                                  >
                                    Cerrar
                                  </button>
                                </div>
                                <button 
                                  onClick={() => {
                                    const next = periods.filter(p => p.id !== item.id);
                                    saveDb("periods", next, setPeriods);
                                  }}
                                  className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                                >
                                  <Trash2 className="w-4 h-4 ml-auto" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: CAREERS (2) */}
            {activeTab === "careers" && (
              <PageTransition id="careers">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Carrera</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!formCareer.name || !formCareer.code) return;
                        const id = "c_" + Date.now();
                        const finalStatus = formCareer.status || "Activo";
                        const next = [...careers, { 
                          ...formCareer, 
                          id, 
                          description: formCareer.description || "", 
                          status: finalStatus 
                        }];
                        saveDb("careers", next, setCareers);
                        setFormCareer({ id: "", name: "", code: "", description: "", status: "Activo", durationSemesters: 6 });
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre de la Carrera *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: Arquitectura de Plataformas y TI" 
                          value={formCareer.name}
                          onChange={(e) => setFormCareer({ ...formCareer, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md font-bold text-slate-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Código Oficial *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ej: APTI" 
                            value={formCareer.code}
                            onChange={(e) => setFormCareer({ ...formCareer, code: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Periodos Regulados *</label>
                          <input 
                            type="number" 
                            required 
                            value={formCareer.durationSemesters}
                            onChange={(e) => setFormCareer({ ...formCareer, durationSemesters: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 border rounded-md font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Descripción de la Carrera *</label>
                        <textarea 
                          required
                          placeholder="Propósito formativo del programa..." 
                          value={formCareer.description || ""}
                          onChange={(e) => setFormCareer({ ...formCareer, description: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md h-16 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Operativo *</label>
                        <select
                          value={formCareer.status || "Activo"}
                          onChange={(e) => setFormCareer({ ...formCareer, status: e.target.value as any })}
                          className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-bold"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Guardar Carrera Académica
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Carreras Registradas</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Código</th>
                            <th className="p-3">Nombre / Descripción</th>
                            <th className="p-3">Duración</th>
                            <th className="p-3 text-center">Estado</th>
                            <th className="p-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold">
                          {careers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                                No existen carreras registradas.
                              </td>
                            </tr>
                          ) : (
                            careers.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="p-3 font-mono font-black text-[#9F062A] text-xs">{item.code}</td>
                                <td className="p-3 leading-tight">
                                  <div className="font-bold text-slate-950">{item.name}</div>
                                  <div className="text-[10px] text-slate-400 mt-1 max-w-sm line-clamp-2">{item.description || "Sin descripción registrada"}</div>
                                </td>
                                <td className="p-3 font-mono whitespace-nowrap">{item.durationSemesters} Perio.</td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                                    (item.status || "Activo") === "Activo"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                  }`}>
                                    {item.status || "Activo"}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="inline-flex gap-1.5 mr-3">
                                    <button 
                                      onClick={() => {
                                        const next = careers.map(c => ({
                                          ...c,
                                          status: c.id === item.id ? (c.status === "Activo" ? "Inactivo" as const : "Activo" as const) : (c.status || "Activo")
                                        }));
                                        saveDb("careers", next, setCareers);
                                      }}
                                      className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-black hover:bg-slate-200 uppercase cursor-pointer"
                                    >
                                      Alternar
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const hasCurriculum = curriculum.some(curr => curr.careerId === item.id);
                                      const hasGroups = groups.some(g => g.careerId === item.id);
                                      const hasTasks = tasks.some(t => {
                                        const gp = groups.find(g => g.id === t.groupId);
                                        return gp && gp.careerId === item.id;
                                      });
                                      if (hasCurriculum || hasGroups || hasTasks) {
                                        alert("No se puede eliminar la carrera porque tiene mallas curriculares, grupos académicos o programaciones asociadas.");
                                        return;
                                      }
                                      const next = careers.filter(c => c.id !== item.id);
                                      saveDb("careers", next, setCareers);
                                    }}
                                    className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                                  >
                                    <Trash2 className="w-4 h-4 ml-auto" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: COURSES (3) */}
            {activeTab === "courses" && (
              <PageTransition id="courses">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Nuevo Curso</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!formCourse.name || !formCourse.code) return;
                        
                        const isGeneral = formCourse.type === "General";
                        if (!isGeneral && (!formCourse.careerId || formCourse.careerId === "comun")) {
                          alert("Para un curso de Especialidad, debe asociar obligatoriamente una carrera de referencia.");
                          return;
                        }
                        
                        const finalCareerId = isGeneral ? (formCourse.careerId || "comun") : formCourse.careerId;
                        
                        const id = "crs_" + Date.now();
                        const next = [...courses, { ...formCourse, careerId: finalCareerId, id }];
                        saveDb("courses", next, setCourses);
                        setFormCourse({ id: "", name: "", code: "", credits: 3, theoryHours: 2, labHours: 2, status: "Activo", careerId: "", referenceCycle: 1, type: "Especialidad" });
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Curso *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: Base de Datos Relacionales" 
                          value={formCourse.name}
                          onChange={(e) => setFormCourse({ ...formCourse, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Curso *</label>
                        <select
                          required
                          value={formCourse.type ?? "Especialidad"}
                          onChange={(e) => {
                            const newType = e.target.value as "General" | "Especialidad";
                            setFormCourse({ 
                              ...formCourse, 
                              type: newType, 
                              // If change to general, default careerId can be empty or comun
                              careerId: newType === "General" ? "comun" : "" 
                            });
                          }}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                        >
                          <option value="Especialidad">Especialidad (Debe asociarse a una carrera)</option>
                          <option value="General">General (Transversal / Reutilizable)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Sigla / Código *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ej: BDR-101" 
                            value={formCourse.code}
                            onChange={(e) => setFormCourse({ ...formCourse, code: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Créditos de Minedu *</label>
                          <input 
                            type="number" 
                            required 
                            min={1} 
                            max={10} 
                            value={formCourse.credits}
                            onChange={(e) => setFormCourse({ ...formCourse, credits: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas de Teoría *</label>
                          <input 
                            type="number" 
                            required 
                            min={0} 
                            max={20} 
                            value={formCourse.theoryHours ?? 2}
                            onChange={(e) => setFormCourse({ ...formCourse, theoryHours: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas de Laboratorio *</label>
                          <input 
                            type="number" 
                            required 
                            min={0} 
                            max={20} 
                            value={formCourse.labHours ?? 2}
                            onChange={(e) => setFormCourse({ ...formCourse, labHours: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">
                          {formCourse.type === "General" ? "Carrera de Referencia (Opcional)" : "Carrera SFA Destino (Obligatorio) *"}
                        </label>
                        <select
                          required={formCourse.type !== "General"}
                          value={formCourse.careerId}
                          onChange={(e) => setFormCourse({ ...formCourse, careerId: e.target.value })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                        >
                          <option value="">{formCourse.type === "General" ? "-- Sin carrera (Curso Común) --" : "-- Seleccione una Carrera --"}</option>
                          {careers.map(car => (
                            <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                          ))}
                          <option value="comun">Cursos Generales</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Curricular de Referencia *</label>
                        <select
                          required
                          value={formCourse.referenceCycle ?? 1}
                          onChange={(e) => setFormCourse({ ...formCourse, referenceCycle: Number(e.target.value) })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                        >
                          <option value={1}>I Ciclo Académico (Primer Periodo)</option>
                          <option value={2}>II Ciclo Académico (Segundo Periodo)</option>
                          <option value={3}>III Ciclo Académico (Tercer Periodo)</option>
                          <option value={4}>IV Ciclo Académico (Cuarto Periodo)</option>
                          <option value={5}>V Ciclo Académico (Quinto Periodo)</option>
                          <option value={6}>VI Ciclo Académico (Sexto Periodo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Académico *</label>
                        <select
                          required
                          value={formCourse.status ?? "Activo"}
                          onChange={(e) => setFormCourse({ ...formCourse, status: e.target.value as any })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                        >
                          <option value="Activo">Activo (Habilitado)</option>
                          <option value="Inactivo">Inactivo (Suspendido)</option>
                        </select>
                      </div>

                      <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[10.5px] text-amber-900 leading-normal font-semibold">
                        ⚠️ Al asignar este curso a una carrera, se vinculará de forma permanente. Luego, asigne el <strong>Ciclo Académico</strong> y la <strong>Malla Curricular</strong> en la pestaña correspondiente.
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Guardar Curso Académico
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Asignaturas Existentes</h3>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">Filtrar por Carrera:</label>
                        <select
                          value={coursesFilterCareer}
                          onChange={(e) => setCoursesFilterCareer(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#800521]"
                        >
                          <option value="all">Todas las Carreras</option>
                          {careers.map(car => (
                            <option key={car.id} value={car.id}>{car.name}</option>
                          ))}
                          <option value="comun">Cursos Generales</option>
                        </select>
                      </div>
                    </div>
                    
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-3">Código</th>
                          <th className="p-3">Nombre de la Asignatura</th>
                          <th className="p-3">Carrera / Ciclo Ref.</th>
                          <th className="p-3 font-mono">Créditos</th>
                          <th className="p-3 font-mono">Horas T/L</th>
                          <th className="p-3 font-mono">Estado</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {(() => {
                          const filtered = courses.filter(item => coursesFilterCareer === "all" || item.careerId === coursesFilterCareer);
                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold text-xs">
                                  No existen cursos registrados.
                                </td>
                              </tr>
                            );
                          }
                          return filtered.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-black text-slate-800">{item.code}</td>
                              <td className="p-3 text-slate-900 font-bold">{item.name}</td>
                              <td className="p-3">
                                {(() => {
                                  const courseType = item.type || (item.careerId === "comun" ? "General" : "Especialidad");
                                  const isGeneral = courseType === "General";
                                  const car = careers.find(c => c.id === item.careerId);
                                  
                                  return (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                          isGeneral 
                                            ? "bg-slate-100 text-slate-700 border border-slate-200" 
                                            : "bg-[#9F062A]/10 text-[#9F062A] border border-[#9F062A]/20"
                                        }`}>
                                          {courseType}
                                        </span>
                                        {car && (
                                          <span className="text-[10px] bg-slate-50 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase">
                                            {car.code}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-amber-700 font-extrabold uppercase font-mono tracking-wider">
                                        Ciclo {item.referenceCycle || 1} {isGeneral ? "(Sugerido)" : ""}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="p-3 font-mono">{item.credits} u.</td>
                              <td className="p-3 font-mono text-slate-500">
                                T: {item.theoryHours ?? 2}h | L: {item.labHours ?? 2}h
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  (item.status ?? "Activo") === "Activo"
                                    ? "bg-emerald-100 text-emerald-850"
                                    : "bg-red-100 text-red-850"
                                }`}>
                                  {item.status ?? "Activo"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => {
                                    const inCurriculum = curriculum.some(curr => curr.courseId === item.id);
                                    const inTasks = tasks.some(t => t.courseId === item.id);
                                    if (inCurriculum || inTasks) {
                                      alert("No se puede eliminar el curso porque ya está siendo utilizado.");
                                      return;
                                    }
                                    const next = courses.filter(c => c.id !== item.id);
                                    saveDb("courses", next, setCourses);
                                  }}
                                  className="text-red-650 hover:text-red-800 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 ml-auto" />
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: CURRICULUM (4) */}
            {activeTab === "curriculum" && (() => {
              const curCareerId = selectedCareerId || careers[0]?.id || "";
              const selectedCareer = careers.find(c => c.id === curCareerId);
              
              // Versions corresponding to selected Career
              const careerVersions = curriculumVersions.filter(v => v.careerId === curCareerId);
              
              // Selected Version ID state resolver
              const curVersionId = selectedVersionId || careerVersions.find(v => v.isActive)?.id || careerVersions[0]?.id || "";
              const selectedVersion = curriculumVersions.find(v => v.id === curVersionId);

              return (
                <PageTransition id="curriculum">
                  <div className="space-y-6 text-left">
                    
                    {/* TOP CONTROL RAIL: CAREER & VERSION MANAGER */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                        <div>
                          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Editor de Mallas Curriculares</h2>
                          <p className="text-xs text-slate-500 font-medium">Configure el plan de estudios, créditos, y organice cursos por ciclos académicos.</p>
                        </div>
                        
                        {/* CAREER SELECTOR */}
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-black uppercase text-slate-500">Carrera SFA:</label>
                          <select
                            value={curCareerId}
                            onChange={(e) => {
                              setSelectedCareerId(e.target.value);
                              setSelectedVersionId(""); // Reset version selection to auto-resolve for next career
                            }}
                            className="bg-slate-50 border px-3 py-1.5 rounded-lg text-xs font-black text-[#9F062A]"
                          >
                            {careers.map(car => (
                              <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* VERSION CONTROLS */}
                      {curCareerId ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1 items-start">
                          
                          {/* VERSION SELECT LIST */}
                          <div className="space-y-2">
                            <label className="block text-[10px] text-slate-500 font-black uppercase tracking-wider">Versión de Malla / Plan:</label>
                            {careerVersions.length === 0 ? (
                              <p className="text-xs text-amber-600 font-black italic">⚠️ No hay versiones creadas para esta carrera.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {careerVersions.map(v => {
                                  const isSelected = v.id === curVersionId;
                                  return (
                                    <button
                                      key={v.id}
                                      onClick={() => setSelectedVersionId(v.id)}
                                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                                        isSelected 
                                          ? "bg-[#9F062A] text-white border-[#9F062A] shadow-xs" 
                                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                                      }`}
                                    >
                                      {v.name}
                                      {v.isActive && (
                                        <span className="bg-emerald-500 text-white w-2 h-2 rounded-full inline-block" title="Versión Activa" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* CREATE NEW VERSION */}
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                            <span className="block text-[10.5px] font-black text-[#9F062A] uppercase">Nueva Versión de Malla</span>
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (!newVersionName.trim()) return;
                                const id = "ver_" + Date.now();
                                const newV = {
                                  id,
                                  name: newVersionName.trim(),
                                  careerId: curCareerId,
                                  isActive: false,
                                  status: "Borrador" as const,
                                  created: new Date().toLocaleDateString("es-ES")
                                };
                                const next = [...curriculumVersions, newV];
                                saveDb("curriculum_versions", next, setCurriculumVersions);
                                setNewVersionName("");
                                setSelectedVersionId(id);
                              }}
                              className="flex gap-2"
                            >
                              <input 
                                type="text"
                                required
                                placeholder="Ej: Malla Innovada 2027"
                                value={newVersionName}
                                onChange={(e) => setNewVersionName(e.target.value)}
                                className="bg-white border rounded px-2.5 py-1.5 text-xs font-semibold flex-1 outline-none focus:border-[#9F062A]"
                              />
                              <button
                                type="submit"
                                className="bg-[#9F062A] hover:bg-[#800521] text-white px-3 text-xs font-black rounded uppercase cursor-pointer"
                              >
                                Crear
                              </button>
                            </form>
                          </div>

                          {/* OPTION AND ACTIVE SWITCHES */}
                          {selectedVersion ? (() => {
                            const vStatus = selectedVersion.status || (selectedVersion.isActive ? "Activa" : "Borrador");
                            const vCreated = selectedVersion.created || "N/A";
                            return (
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                                <span className="block text-[10.5px] font-black text-slate-800 uppercase flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <span>Plan de Estudios: <strong className="text-[#9F062A]">{selectedVersion.name}</strong></span>
                                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                                      vStatus === "Activa" 
                                        ? "bg-emerald-100 text-emerald-850 border border-emerald-250 animate-pulse" 
                                        : vStatus === "Inactiva" 
                                        ? "bg-rose-100 text-rose-850 border border-rose-250" 
                                        : "bg-amber-100 text-amber-850 border border-amber-250"
                                    }`}>
                                      {vStatus}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono font-semibold text-slate-400 capitalize mt-0.5">Creado: {vCreated}</span>
                                </span>

                                <div className="flex items-center gap-2 justify-between flex-wrap border-t pt-2.5 mt-2">
                                  {editingVersionId === selectedVersion.id ? (
                                    <div className="flex gap-1.5 w-full">
                                      <input 
                                        type="text"
                                        value={editingVersionName}
                                        onChange={(e) => setEditingVersionName(e.target.value)}
                                        className="bg-white border text-xs px-2 py-1 rounded flex-1 font-bold animate-in fade-in duration-100"
                                      />
                                      <button 
                                        onClick={() => {
                                          if (!editingVersionName.trim()) return;
                                          const next = curriculumVersions.map(v => v.id === selectedVersion.id ? { ...v, name: editingVersionName.trim() } : v);
                                          saveDb("curriculum_versions", next, setCurriculumVersions);
                                          setEditingVersionId("");
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded text-xs cursor-pointer flex items-center justify-center transition-colors"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => setEditingVersionId("")}
                                        className="bg-slate-300 hover:bg-slate-400 text-slate-700 p-1 rounded text-xs cursor-pointer flex items-center justify-center transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2 items-center flex-wrap w-full">
                                      <button
                                        onClick={() => {
                                          setEditingVersionId(selectedVersion.id);
                                          setEditingVersionName(selectedVersion.name);
                                        }}
                                        className="text-slate-600 hover:text-slate-900 text-[10.5px] font-black flex items-center gap-1 uppercase border border-slate-300 px-2.5 py-1 rounded bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                                      >
                                        <Edit2 className="w-3 h-3" /> Renombrar
                                      </button>

                                      {selectedVersion.isActive || vStatus === "Activa" ? (
                                        <button
                                          onClick={() => {
                                            const next = curriculumVersions.map(v => {
                                              if (v.id === selectedVersion.id) {
                                                return { ...v, isActive: false, status: "Inactiva" as const };
                                              }
                                              return v;
                                            });
                                            saveDb("curriculum_versions", next, setCurriculumVersions);
                                          }}
                                          className="bg-red-650 hover:bg-red-750 text-white text-[10.5px] font-black flex items-center gap-1 uppercase px-2.5 py-1.5 rounded shadow-xs ml-auto cursor-pointer transition-colors"
                                        >
                                          Desactivar Malla
                                        </button>
                                      ) : (
                                        <div className="flex gap-1.5 ml-auto items-center flex-wrap">
                                          <span className="text-[9px] text-slate-400 font-black uppercase mr-1">Cambiar a:</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = curriculumVersions.map(v => {
                                                if (v.id === selectedVersion.id) {
                                                  return { ...v, status: "Borrador" as const };
                                                }
                                                return v;
                                              });
                                              saveDb("curriculum_versions", next, setCurriculumVersions);
                                            }}
                                            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-350 text-[10px] font-extrabold px-2 py-1 rounded cursor-pointer transition-colors"
                                          >
                                            Borrador
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = curriculumVersions.map(v => {
                                                if (v.id === selectedVersion.id) {
                                                  return { ...v, status: "Inactiva" as const };
                                                }
                                                return v;
                                              });
                                              saveDb("curriculum_versions", next, setCurriculumVersions);
                                            }}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-300 text-[10px] font-extrabold px-2 py-1 rounded cursor-pointer transition-colors"
                                          >
                                            Inactiva
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              // Toggle this one active, set other versions of career inactive
                                              const next = curriculumVersions.map(v => {
                                                if (v.careerId === curCareerId) {
                                                  const isCurrent = v.id === selectedVersion.id;
                                                  return { 
                                                    ...v, 
                                                    isActive: isCurrent, 
                                                    status: isCurrent ? "Activa" : "Inactiva"
                                                  };
                                                }
                                                return v;
                                              });
                                              saveDb("curriculum_versions", next, setCurriculumVersions);
                                            }}
                                            className="bg-[#9F062A] hover:bg-[#800521] text-white text-[10.5px] font-black flex items-center gap-1 uppercase px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
                                          >
                                            Activar Malla Oficial
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })() : (
                            <div className="flex items-center justify-center p-4 text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-lg">
                              Seleccione un plan de estudios
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-black uppercase text-center py-4">Registre o habilite al menos una especialidad en carreras.</p>
                      )}
                    </div>

                    {/* MAIN VISUAL EDITOR CANVAS - THE CYCLE GRID */}
                    {curCareerId && curVersionId ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-2 border border-slate-200">
                          <Info className="w-4 h-4 text-[#9F062A]" />
                          <span>Malla consultada: <strong>{selectedCareer?.name}</strong> | Versión del Plan: <strong>{selectedVersion?.name}</strong>. Puede arrastrar o usar chevrons para reasignar ciclos curriculares sin restricciones.</span>
                        </div>

                        {/* GRID (6 CYCLES) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[1, 2, 3, 4, 5, 6].map((cycleNum) => {
                            // Filter courses mapped to this version, career, and cycle
                            const mappedItems = curriculum.filter(
                              it => it.careerId === curCareerId && it.versionId === curVersionId && it.cycle === cycleNum
                            );

                            // Available courses that are NOT already in this version
                            const availableCourses = courses.filter(
                              crs => !curriculum.some(
                                it => it.careerId === curCareerId && it.versionId === curVersionId && it.courseId === crs.id
                              )
                            );

                            const sortedAvailableCourses = [...availableCourses].sort((a, b) => {
                              const isAComun = a.careerId === "comun" ? 1 : 0;
                              const isBComun = b.careerId === "comun" ? 1 : 0;
                              if (isAComun !== isBComun) return isBComun - isAComun;
                              
                              const cycleA = a.referenceCycle || 1;
                              const cycleB = b.referenceCycle || 1;
                              if (cycleA !== cycleB) return cycleA - cycleB;
                              
                              return (a.code || "").localeCompare(b.code || "");
                            });

                            return (
                              <div key={cycleNum} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                                {/* Cycle Header */}
                                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center gap-1">
                                    <span className="bg-[#CFA020] text-slate-900 font-mono px-2 py-0.5 rounded text-[10px] font-black">
                                      CICLO {cycleNum}
                                    </span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 font-black">
                                    {mappedItems.reduce((currSum, cIdx) => {
                                      const mappedCourseObj = courses.find(cr => cr.id === cIdx.courseId);
                                      return currSum + (mappedCourseObj?.credits || 0);
                                    }, 0)} u. totales
                                  </span>
                                </div>

                                {/* Cycle Courses Canvas Area */}
                                <div className="p-3 space-y-2 flex-1 min-h-[160px] max-h-[350px] overflow-y-auto custom-scrollbar">
                                  {mappedItems.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-center p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                      Sin cursos mapeados
                                    </div>
                                  ) : (
                                    mappedItems.map(itm => {
                                      const crsObj = courses.find(x => x.id === itm.courseId);
                                      if (!crsObj) return null;
                                      return (
                                        <div key={itm.id} className="p-2.5 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-all shadow-xs">
                                          <div className="flex items-start justify-between gap-1.5">
                                            <div className="text-left select-none">
                                              <span className="block text-[11px] font-black tracking-wide text-slate-900 leading-tight">
                                                {crsObj.name}
                                              </span>
                                              <span className="text-[9.5px] text-slate-400 font-black font-mono block uppercase mt-0.5">
                                                {crsObj.code} • {crsObj.credits} u. | T: {crsObj.theoryHours ?? 2}h | L: {crsObj.labHours ?? 2}h
                                              </span>
                                            </div>

                                            {/* Action Delete */}
                                            <button
                                              onClick={() => {
                                                const next = curriculum.filter(it => it.id !== itm.id);
                                                saveDb("curriculum", next, setCurriculum);
                                              }}
                                              className="text-slate-400 hover:text-red-750 cursor-pointer p-0.5"
                                              title="Quitar de Malla"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>

                                          {/* Cycle shifting buttons */}
                                          <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-100 justify-end">
                                            <span className="text-[8px] font-black text-slate-400 uppercase mr-auto tracking-wider font-mono">ciclo: {cycleNum}</span>
                                            
                                            {/* Move Prev */}
                                            {cycleNum > 1 && (
                                              <button
                                                onClick={() => {
                                                  const next = curriculum.map(x => x.id === itm.id ? { ...x, cycle: cycleNum - 1 } : x);
                                                  saveDb("curriculum", next, setCurriculum);
                                                }}
                                                className="text-[#9F062A] hover:bg-[#9F062A]/10 px-1 py-0.5 rounded text-[9px] font-black border border-slate-200 cursor-pointer bg-white"
                                                title="Mover al ciclo previo"
                                              >
                                                ← Ciclo
                                              </button>
                                            )}

                                            {/* Move Next */}
                                            {cycleNum < 6 && (
                                              <button
                                                onClick={() => {
                                                  const next = curriculum.map(x => x.id === itm.id ? { ...x, cycle: cycleNum + 1 } : x);
                                                  saveDb("curriculum", next, setCurriculum);
                                                }}
                                                className="text-[#9F062A] hover:bg-[#9F062A]/10 px-1 py-0.5 rounded text-[9px] font-black border border-slate-200 cursor-pointer bg-white"
                                                title="Mover al ciclo siguiente"
                                              >
                                                Ciclo →
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* Cycle Footer - Inline addition dropdown with text search */}
                                <div className="p-2 border-t border-slate-150 bg-slate-50 space-y-1.5">
                                  <div className="relative">
                                    <input 
                                      type="text"
                                      placeholder="🔍 Buscar curso (nombre o sigla)..."
                                      value={cycleSearch[cycleNum] || ""}
                                      onChange={(e) => setCycleSearch({ ...cycleSearch, [cycleNum]: e.target.value })}
                                      className="w-full text-[10px] px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-[#9F062A] outline-none"
                                    />
                                    {(cycleSearch[cycleNum] || "") && (
                                      <button 
                                        onClick={() => setCycleSearch({ ...cycleSearch, [cycleNum]: "" })}
                                        className="absolute right-1 text-slate-400 hover:text-slate-600 top-1/2 -translate-y-1/2 p-0.5 text-[8px]"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                  <select
                                    onChange={(e) => {
                                      const crsId = e.target.value;
                                      if (crsId) {
                                        // Add course
                                        const id = "curr_" + Date.now();
                                        const newMallaItem = {
                                          id,
                                          careerId: curCareerId,
                                          courseId: crsId,
                                          cycle: cycleNum,
                                          versionId: curVersionId
                                        };
                                        const next = [...curriculum, newMallaItem];
                                        saveDb("curriculum", next, setCurriculum);
                                        // Clear input & dropdown selection
                                        setCycleSearch({ ...cycleSearch, [cycleNum]: "" });
                                        e.target.value = ""; 
                                      }
                                    }}
                                    className="w-full text-[10.5px] font-bold p-1 border rounded bg-white"
                                  >
                                    <option value="">+ Seleccionar Curso Encontrado...</option>
                                    {(() => {
                                      const searchQuery = (cycleSearch[cycleNum] || "").toLowerCase().trim();
                                      const filterBySearch = (crs: MpaCourse) => {
                                        if (!searchQuery) return true;
                                        return (crs.name || "").toLowerCase().includes(searchQuery) || (crs.code || "").toLowerCase().includes(searchQuery);
                                      };

                                      const specCourses = sortedAvailableCourses.filter(c => c.careerId === curCareerId).filter(filterBySearch);
                                      const genCourses = sortedAvailableCourses.filter(c => c.careerId === "comun").filter(filterBySearch);
                                      const otherCourses = sortedAvailableCourses.filter(c => c.careerId !== curCareerId && c.careerId !== "comun").filter(filterBySearch);

                                      if (specCourses.length === 0 && genCourses.length === 0 && otherCourses.length === 0) {
                                        return <option disabled>No hay coincidencias</option>;
                                      }

                                      return (
                                        <>
                                          {specCourses.length > 0 && (
                                            <optgroup label="CURSOS DE LA ESPECIALIDAD">
                                              {specCourses.map(crs => {
                                                const cycleLabel = crs.referenceCycle ? `Ciclo ${crs.referenceCycle}` : "N/A";
                                                return (
                                                  <option key={crs.id} value={crs.id}>
                                                    [{crs.code}] {crs.name} ({cycleLabel})
                                                  </option>
                                                );
                                              })}
                                            </optgroup>
                                          )}
                                          {genCourses.length > 0 && (
                                            <optgroup label="CURSOS GENERALES / TRANSVERSALES">
                                              {genCourses.map(crs => {
                                                const cycleLabel = crs.referenceCycle ? `Ciclo ${crs.referenceCycle}` : "N/A";
                                                return (
                                                  <option key={crs.id} value={crs.id}>
                                                    [{crs.code}] {crs.name} ({cycleLabel})
                                                  </option>
                                                );
                                              })}
                                            </optgroup>
                                          )}
                                          {otherCourses.length > 0 && (
                                            <optgroup label="CURSOS DE OTRAS ESPECIALIDADES">
                                              {otherCourses.map(crs => {
                                                const cycleLabel = crs.referenceCycle ? `Ciclo ${crs.referenceCycle}` : "N/A";
                                                const catLabel = careers.find(car => car.id === crs.careerId)?.code || "N/A";
                                                return (
                                                  <option key={crs.id} value={crs.id}>
                                                    [{crs.code}] {crs.name} ({cycleLabel} • {catLabel})
                                                  </option>
                                                );
                                              })}
                                            </optgroup>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-slate-400 font-bold uppercase text-xs tracking-wider">
                        Seleccione una especialidad y un plan de estudios para utilizar el Editor Visual.
                      </div>
                    )}

                  </div>
                </PageTransition>
              );
            })()}

            {/* TAB: TEACHERS (5) */}
            {activeTab === "teachers" && (
              <PageTransition id="teachers">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Docente</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!formTeacher.name || !formTeacher.dni) return;
                        if (teacherSelectedSpecialties.length === 0) {
                          alert("Por favor seleccione o agregue al menos una especialidad.");
                          return;
                        }
                        const exist = teachers.some(t => t.dni === formTeacher.dni);
                        if (exist) {
                          alert("Ya existe un docente registrado con ese DNI.");
                          return;
                        }
                        const next = [...teachers, { 
                          ...formTeacher, 
                          specialties: teacherSelectedSpecialties,
                          specialty: teacherSelectedSpecialties.join(", ")
                        }];
                        saveDb("teachers", next, setTeachers);
                        setFormTeacher({ dni: "", name: "", lastName: "", email: "", specialty: "", status: "Disponible", careerId: "comun" });
                        setTeacherSelectedSpecialties([]);
                        setCustomSpecialty("");
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">DNI Docente *</label>
                          <input 
                            type="text" 
                            required 
                            maxLength={8} 
                            placeholder="DNI" 
                            value={formTeacher.dni}
                            onChange={(e) => setFormTeacher({ ...formTeacher, dni: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombres *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Marcos Alberto" 
                            value={formTeacher.name}
                            onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Apellidos del Docente *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ramos Meléndez" 
                          value={formTeacher.lastName}
                          onChange={(e) => setFormTeacher({ ...formTeacher, lastName: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Correo Electrónico *</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="ejemplo@iestpsfa.edu.pe" 
                          value={formTeacher.email}
                          onChange={(e) => setFormTeacher({ ...formTeacher, email: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md font-mono"
                        />
                      </div>

                      {/* Especialidades MULTI SELECT CHECKBOXES */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-500 font-bold uppercase border-b pb-1">
                          Especialidades de Trabajo *
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-200">
                          {[
                            "Desarrollo de Sistemas",
                            "Contabilidad",
                            "Administración",
                            "Cursos Generales",
                            "Matemática",
                            "Comunicación",
                            "Electricidad Industrial",
                            "Electrónica"
                          ].map(spec => (
                            <label key={spec} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-700">
                              <input 
                                type="checkbox"
                                checked={teacherSelectedSpecialties.includes(spec)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTeacherSelectedSpecialties([...teacherSelectedSpecialties, spec]);
                                  } else {
                                    setTeacherSelectedSpecialties(teacherSelectedSpecialties.filter(s => s !== spec));
                                  }
                                }}
                                className="rounded text-[#9F062A] focus:ring-[#9F062A] w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>{spec}</span>
                            </label>
                          ))}
                          {/* Render custom ones added in this form */}
                          {teacherSelectedSpecialties.filter(s => ![
                            "Desarrollo de Sistemas",
                            "Contabilidad",
                            "Administración",
                            "Cursos Generales",
                            "Matemática",
                            "Comunicación",
                            "Electricidad Industrial",
                            "Electrónica"
                          ].includes(s)).map(spec => (
                            <label key={spec} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-[#9F062A]">
                              <input 
                                type="checkbox"
                                checked={true}
                                onChange={() => {
                                  setTeacherSelectedSpecialties(teacherSelectedSpecialties.filter(s => s !== spec));
                                }}
                                className="rounded text-[#9F062A] focus:ring-[#9F062A] w-3.5 h-3.5 cursor-pointer"
                              />
                              <span className="truncate">{spec}</span>
                            </label>
                          ))}
                        </div>

                        {/* Nueva Especialidad Personalizada */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Agregar otra..." 
                            value={customSpecialty}
                            onChange={(e) => setCustomSpecialty(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border rounded-md text-xs font-semibold bg-white text-slate-950 placeholder-slate-400 font-sans"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = customSpecialty.trim();
                              if (trimmed && !teacherSelectedSpecialties.includes(trimmed)) {
                                setTeacherSelectedSpecialties([...teacherSelectedSpecialties, trimmed]);
                                setCustomSpecialty("");
                              }
                            }}
                            className="bg-[#9F062A] hover:bg-[#800521] text-white px-2.5 py-1.5 rounded text-[9px] font-black uppercase cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera Asociada *</label>
                        <select
                          required
                          value={formTeacher.careerId || "comun"}
                          onChange={(e) => setFormTeacher({ ...formTeacher, careerId: e.target.value })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                        >
                          <option value="comun">Todas / Cursos Generales</option>
                          {careers.map((car) => (
                            <option key={car.id} value={car.id}>
                              {car.name} ({car.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado de Disponibilidad *</label>
                        <select
                          value={formTeacher.status}
                          onChange={(e) => setFormTeacher({ ...formTeacher, status: e.target.value as any })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Licencia">Licencia</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Registrar Docente
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Plana Docente Registrada</h3>
                    </div>
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-3">DNI / Email</th>
                          <th className="p-3">Apellidos y Nombres</th>
                          <th className="p-3">Especialidad</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {teachers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                              No existen docentes registrados.
                            </td>
                          </tr>
                        ) : (
                          teachers.map(item => {
                            const statusVal = item.status || "Disponible";
                            return (
                              <tr key={item.dni} className="hover:bg-slate-50/50">
                                <td className="p-3 font-mono text-slate-500 text-[11px]">
                                  <span className="font-bold text-slate-800 block">{item.dni}</span>
                                  <span className="text-[10px] block font-semibold">{item.email}</span>
                                </td>
                                <td className="p-3 font-black text-[#9F062A]">{item.lastName}, {item.name}</td>
                                <td className="p-3 text-[11px] font-semibold">
                                  <div className="flex flex-wrap gap-1 mb-1.5 max-w-xs">
                                    {getTeacherSpecialties(item).map(spec => (
                                      <span key={spec} className="inline-block bg-pink-50 border border-pink-100/70 text-[#9F062A] text-[9.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                        {spec}
                                      </span>
                                    ))}
                                    {getTeacherSpecialties(item).length === 0 && (
                                      <span className="text-slate-400 italic">Ninguna</span>
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white ${
                                      item.careerId === "comun" 
                                        ? "bg-slate-500" 
                                        : item.careerId === "contabilidad"
                                        ? "bg-sky-600"
                                        : item.careerId === "electronica"
                                        ? "bg-amber-600"
                                        : "bg-purple-600"
                                    }`}>
                                      {item.careerId === "comun" 
                                        ? "Todas / General" 
                                        : careers.find(car => car.id === item.careerId)?.code || "Especialidad"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                    statusVal === "Disponible" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : statusVal === "Licencia"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-50 text-slate-500 border-slate-250"
                                  }`}>
                                    {statusVal}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="inline-flex items-center gap-1.5 mr-3">
                                    <select
                                      value={statusVal}
                                      onChange={(e) => {
                                        const next = teachers.map(t => t.dni === item.dni ? { ...t, status: e.target.value } : t);
                                        saveDb("teachers", next, setTeachers);
                                      }}
                                      className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer"
                                    >
                                      <option value="Disponible">Disponible</option>
                                      <option value="Licencia">Licencia</option>
                                      <option value="Inactivo">Inactivo</option>
                                    </select>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const hasScheduledSessions = tasks.some(t => t.teacherDni === item.dni);
                                      if (hasScheduledSessions) {
                                        alert("No se puede eliminar la cuenta de este docente porque tiene sesiones programadas en el sistema. Modifique su estado de disponibilidad en su lugar.");
                                        return;
                                      }
                                      const next = teachers.filter(t => t.dni !== item.dni);
                                      saveDb("teachers", next, setTeachers);
                                    }}
                                    className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                                  >
                                    <Trash2 className="w-4 h-4 ml-auto" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: CLASSROOMS (6) */}
            {activeTab === "classrooms" && (
              <PageTransition id="classrooms">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Infraestructura</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!formRoom.name || !formRoom.location) return;
                        const id = "r_" + Date.now();
                        const next = [...classrooms, { ...formRoom, id }];
                        saveDb("classrooms", next, setClassrooms);
                        setFormRoom({ id: "", name: "", type: "Teoría", location: "", capacity: 40, careerId: "comun" });
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Aula / Ambiente *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: Laboratorio 402, Aula General 110" 
                          value={formRoom.name}
                          onChange={(e) => setFormRoom({ ...formRoom, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Aula *</label>
                          <select 
                            required 
                            value={formRoom.type}
                            onChange={(e) => setFormRoom({ ...formRoom, type: e.target.value as any })}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                          >
                            <option value="Teoría">Teoría</option>
                            <option value="Laboratorio">Laboratorio</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Capacidad Máxima *</label>
                          <input 
                            type="number" 
                            required 
                            value={formRoom.capacity}
                            onChange={(e) => setFormRoom({ ...formRoom, capacity: Number(e.target.value) })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera Asignada *</label>
                        <select
                          required
                          value={formRoom.careerId || "comun"}
                          onChange={(e) => setFormRoom({ ...formRoom, careerId: e.target.value })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                        >
                          <option value="comun">Todas / Uso Común o General</option>
                          {careers.map((car) => (
                            <option key={car.id} value={car.id}>
                              {car.name} ({car.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Ubicación Física *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Pabellón B Piso 2, Taller de Electrónica" 
                          value={formRoom.location}
                          onChange={(e) => setFormRoom({ ...formRoom, location: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md font-bold text-slate-700"
                        />
                      </div>

                      <div className="p-3 bg-[#9F062A]/5 text-[#9F062A] rounded border border-[#9F062A]/20 text-[10px] leading-relaxed">
                        ⚠️ <strong>Regla Especial:</strong> Programación Académica forzará que las sesiones de Laboratorio solo puedan asignarse a aulas tipo Laboratorio.
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Guardar Aula / Ambiente
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Ambientes Académicos</h3>
                    </div>
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Tipo Aula</th>
                          <th className="p-3">Referencia Ubicación</th>
                          <th className="p-3 font-mono">Capacidad</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {classrooms.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                              No existen aulas registradas.
                            </td>
                          </tr>
                        ) : (
                          classrooms.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-black text-slate-900">
                                <div>{item.name}</div>
                                <div className="mt-1">
                                  <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white ${
                                    item.careerId === "comun" 
                                      ? "bg-slate-500" 
                                      : item.careerId === "contabilidad"
                                      ? "bg-sky-600"
                                      : item.careerId === "electronica"
                                      ? "bg-amber-600"
                                      : "bg-purple-600"
                                  }`}>
                                    {item.careerId === "comun" 
                                      ? "Uso Común" 
                                      : careers.find(car => car.id === item.careerId)?.code || "Especialidad"}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                  item.type === "Laboratorio" 
                                    ? "bg-rose-50 text-red-900 border-red-200" 
                                    : "bg-blue-50 text-blue-900 border-blue-200"
                                }`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-505 text-[11px]">{item.location}</td>
                              <td className="p-3 font-mono">{item.capacity} estudiantes</td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={() => {
                                    const hasScheduled = tasks.some(t => t.classroomId === item.id);
                                    if (hasScheduled) {
                                      alert("No se puede eliminar el aula porque está ocupada por programación activa.");
                                      return;
                                    }
                                    const next = classrooms.filter(r => r.id !== item.id);
                                    saveDb("classrooms", next, setClassrooms);
                                  }}
                                  className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                                >
                                  <Trash2 className="w-4 h-4 ml-auto" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: SHIFTS (7) */}
            {activeTab === "shifts" && (
              <PageTransition id="shifts">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Turno</h3>
                    
                    {shiftErrorMessage && (
                      <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-bold space-y-1">
                        <p>⚠️ {shiftErrorMessage}</p>
                        <p className="text-[10px] font-medium text-slate-500">
                          Recuerde que el Turno Mañana debe ser entre 08:00 AM y 01:00 PM, y no puede haber solapamiento entre turnos.
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] font-medium text-amber-900 leading-relaxed space-y-1">
                      <p className="font-extrabold uppercase text-[9px] text-amber-800 tracking-wider">🎯 Reglas de Operación:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li><strong>Mañana:</strong> Permitido exclusivamente de <b>08:00 AM a 01:00 PM</b>.</li>
                        <li><strong>Evitar Cruces:</strong> No se pueden programar turnos que se superpongan en horario.</li>
                      </ul>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!formShift.name || !formShift.startTime || !formShift.endTime) {
                          setShiftErrorMessage("Todos los campos marcados con asterisco son obligatorios.");
                          return;
                        }

                        const startMin = parseTimeToMinutes(formShift.startTime);
                        const endMin = parseTimeToMinutes(formShift.endTime);

                        if (startMin >= endMin) {
                          setShiftErrorMessage("La hora de inicio debe ser anterior a la hora de salida.");
                          return;
                        }

                        // Rule 1: Morning hour boundary (08:00 AM to 01:00 PM) for Turno Mañana
                        const isMorningName = formShift.name.trim().toLowerCase().includes("mañ") || formShift.name.trim().toLowerCase().includes("morn");
                        if (isMorningName) {
                          const morningStartBound = parseTimeToMinutes("08:00 AM");
                          const morningEndBound = parseTimeToMinutes("01:00 PM");
                          if (startMin < morningStartBound || endMin > morningEndBound) {
                            setShiftErrorMessage("Turno Mañana fuera de límites. El turno Mañana debe iniciar a partir de las 08:00 AM y concluir a más tardar a la 01:00 PM.");
                            return;
                          }
                        }

                        // Rule 2: Non-overlapping validation across shifts
                        const hasShiftOverlap = shifts.some(existingSh => {
                          const extStart = parseTimeToMinutes(existingSh.startTime);
                          const extEnd = parseTimeToMinutes(existingSh.endTime);
                          // Overlaps if startA < endB and endA > startB
                          return (startMin < extEnd && endMin > extStart);
                        });

                        if (hasShiftOverlap) {
                          setShiftErrorMessage("Cruze de turnos detectado. Ya existe otro turno registrado que se solapa total o parcialmente con las horas especificadas.");
                          return;
                        }

                        // Success saving
                        setShiftErrorMessage(null);
                        const id = "s_" + Date.now();
                        const next = [...shifts, { ...formShift, id }];
                        saveDb("shifts", next, setShifts);
                        setFormShift({ id: "", name: "", startTime: "", endTime: "" });
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Plantilla de Turno Académico</label>
                        <select 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "manana") {
                              setFormShift({ id: "", name: "Mañana", startTime: "08:00 AM", endTime: "01:00 PM" });
                              setShiftErrorMessage(null);
                            } else if (val === "tarde") {
                              setFormShift({ id: "", name: "Tarde", startTime: "01:30 PM", endTime: "06:30 PM" });
                              setShiftErrorMessage(null);
                            } else if (val === "noche") {
                              setFormShift({ id: "", name: "Noche", startTime: "06:45 PM", endTime: "10:45 PM" });
                              setShiftErrorMessage(null);
                            }
                          }}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                        >
                          <option value="custom">-- Personalizado / Escribir Rango --</option>
                          <option value="manana">Turno Mañana (08:00 AM - 01:00 PM)</option>
                          <option value="tarde">Turno Tarde (01:30 PM - 06:30 PM)</option>
                          <option value="noche">Turno Noche (06:45 PM - 10:45 PM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Turno *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: Mañana" 
                          value={formShift.name}
                          onChange={(e) => setFormShift({ ...formShift, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Inicio *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ej: 08:00 AM" 
                            value={formShift.startTime}
                            onChange={(e) => setFormShift({ ...formShift, startTime: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Salida *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Ej: 01:00 PM" 
                            value={formShift.endTime}
                            onChange={(e) => setFormShift({ ...formShift, endTime: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Guardar Turno
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Turnos Habilitados</h3>
                    </div>
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-[#9F062A]/5 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-3">Turno</th>
                          <th className="p-3">Horario Regulado de Ingreso / Salida</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {shifts.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-black text-[#9F062A] text-xs">{item.name}</td>
                            <td className="p-3 font-mono font-bold">{item.startTime} a {item.endTime}</td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => {
                                  const next = shifts.filter(s => s.id !== item.id);
                                  saveDb("shifts", next, setShifts);
                                }}
                                className="text-red-650 hover:text-red-800 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 ml-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: SCHEDULES (8) */}
            {activeTab === "schedules" && (() => {
              const currentShiftId = formSchedule.shiftId || (shifts[0]?.id || "s1");
              const selectedShift = shifts.find(sh => sh.id === currentShiftId) || shifts[0] || DEFAULT_SHIFTS[0];
              
              // Generate the 50-minute blocks (pedagogical hours)
              const markers: string[] = [];
              if (selectedShift) {
                const startMin = parseTimeToMinutes(selectedShift.startTime);
                const endMin = parseTimeToMinutes(selectedShift.endTime);
                let currentMin = startMin;
                while (currentMin <= endMin) {
                  markers.push(formatMinutesToTime(currentMin));
                  currentMin += 50; // increment by 50 minutes (academic hour)
                }
                // Ensure the last boundary is included in markers
                if (markers.length > 0) {
                  const lastMarkerMin = parseTimeToMinutes(markers[markers.length - 1]);
                  if (lastMarkerMin < endMin && endMin - lastMarkerMin >= 5) {
                    markers.push(formatMinutesToTime(endMin));
                  }
                }
              }

              // Filter out valid startTime options (all except the last marker)
              const startOptions = markers.slice(0, -1);
              
              // If formSchedule.startTime is not in startOptions, pick the first start option by default
              const currentStartTime = startOptions.includes(formSchedule.startTime) 
                ? formSchedule.startTime 
                : (startOptions[0] || "");

              // End time options must be greater than currentStartTime
              const startMinVal = parseTimeToMinutes(currentStartTime);
              const endOptions = markers.filter(m => parseTimeToMinutes(m) > startMinVal);

              const currentEndTime = endOptions.includes(formSchedule.endTime)
                ? formSchedule.endTime
                : (endOptions[0] || "");

              return (
                <PageTransition id="schedules">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                    
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                      <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Horario de Clase</h3>
                      
                      {scheduleErrorMessage && (
                        <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-bold space-y-1">
                          <p>⚠️ {scheduleErrorMessage}</p>
                          <p className="text-[10px] font-medium text-slate-500">
                            Por favor seleccione un rango diferente o revise los horarios registrados a la derecha.
                          </p>
                        </div>
                      )}

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const finalStart = currentStartTime;
                          const finalEnd = currentEndTime;

                          if (!finalStart || !finalEnd) {
                            setScheduleErrorMessage("Debe seleccionar una hora de inicio y de fin válidas.");
                            return;
                          }

                          const computedTimeSlot = `${finalStart} - ${finalEnd}`;
                          
                          // Convert times to minutes for overlap validation
                          const newStartMin = parseTimeToMinutes(finalStart);
                          const newEndMin = parseTimeToMinutes(finalEnd);

                          // Check if there is an overlapping schedule for the same day Academic
                          const hasOverlap = schedules.some(sch => {
                            if (sch.dayOfWeek.trim().toLowerCase() !== formSchedule.dayOfWeek.trim().toLowerCase()) {
                              return false;
                            }
                            // Check overlap (regardless of shift) for exact calendar day sanity
                            let extStart = sch.startTime ? parseTimeToMinutes(sch.startTime) : 0;
                            let extEnd = sch.endTime ? parseTimeToMinutes(sch.endTime) : 0;
                            if (!extStart && !extEnd && sch.timeSlot) {
                              const parts = sch.timeSlot.split("-");
                              if (parts.length === 2) {
                                extStart = parseTimeToMinutes(parts[0].trim());
                                extEnd = parseTimeToMinutes(parts[1].trim());
                              }
                            }
                            
                            // Overlap checks if: (newStart < extEnd && newEnd > extStart)
                            return (newStartMin < extEnd && newEndMin > extStart);
                          });

                          if (hasOverlap) {
                            setScheduleErrorMessage(`Ya existe un bloque de clases registrado para el día ${formSchedule.dayOfWeek} en el rango horario solicitado (${finalStart} - ${finalEnd}), o se cruza con él.`);
                            return;
                          }

                          setScheduleErrorMessage(null);

                          const id = "sch_" + Date.now();
                          const newSchedule = {
                            id,
                            dayOfWeek: formSchedule.dayOfWeek,
                            startTime: finalStart,
                            endTime: finalEnd,
                            timeSlot: computedTimeSlot,
                            shiftId: currentShiftId
                          };
                          const next = [...schedules, newSchedule];
                          saveDb("schedules", next, schedulesStateSet);
                          
                          // Safe reset, keeping dayOfWeek and setting default times
                          const firstShift = shifts.find(sh => sh.id === currentShiftId) || shifts[0];
                          const fallbackStart = firstShift ? firstShift.startTime : "08:00 AM";
                          const fallbackStartMin = parseTimeToMinutes(fallbackStart);
                          const fallbackEnd = formatMinutesToTime(fallbackStartMin + 50);

                          setFormSchedule({ 
                            id: "", 
                            dayOfWeek: formSchedule.dayOfWeek,
                            startTime: fallbackStart, 
                            endTime: fallbackEnd, 
                            timeSlot: "", 
                            shiftId: currentShiftId 
                          });
                        }}
                        className="space-y-4 text-xs font-semibold"
                      >
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Día Académico *</label>
                          <select 
                            required 
                            value={formSchedule.dayOfWeek}
                            onChange={(e) => {
                              setFormSchedule({ ...formSchedule, dayOfWeek: e.target.value });
                              setScheduleErrorMessage(null);
                            }}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                          >
                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Turno de Clase Coincidente *</label>
                          <select
                            required
                            value={currentShiftId}
                            onChange={(e) => {
                              const newSId = e.target.value;
                              const sh = shifts.find(s => s.id === newSId);
                              const tS = sh ? sh.startTime : "08:00 AM";
                              const tSMin = parseTimeToMinutes(tS);
                              const tE = formatMinutesToTime(tSMin + 50);
                              
                              setFormSchedule({ 
                                ...formSchedule, 
                                shiftId: newSId,
                                startTime: tS,
                                endTime: tE
                              });
                              setScheduleErrorMessage(null);
                            }}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                          >
                            {shifts.map(sh => (
                              <option key={sh.id} value={sh.id}>
                                Turno {sh.name} ({sh.startTime} - {sh.endTime})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora de Inicio *</label>
                            <select 
                              required 
                              value={currentStartTime}
                              onChange={(e) => {
                                const newStart = e.target.value;
                                const newStartMin = parseTimeToMinutes(newStart);
                                // Pick new valid end time that is greater
                                const newEnds = markers.filter(m => parseTimeToMinutes(m) > newStartMin);
                                const newEnd = newEnds.includes(formSchedule.endTime) ? formSchedule.endTime : (newEnds[0] || "");
                                setFormSchedule({ 
                                  ...formSchedule, 
                                  startTime: newStart,
                                  endTime: newEnd
                                });
                                setScheduleErrorMessage(null);
                              }}
                              className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-mono"
                            >
                              {startOptions.map((st, idx) => (
                                <option key={st} value={st}>
                                  {st} (Hora {idx + 1})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora de Fin *</label>
                            <select 
                              required 
                              value={currentEndTime}
                              onChange={(e) => {
                                setFormSchedule({ 
                                  ...formSchedule, 
                                  endTime: e.target.value 
                                });
                                setScheduleErrorMessage(null);
                              }}
                              className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-mono"
                            >
                              {endOptions.map((et) => {
                                const originalStartMin = parseTimeToMinutes(currentStartTime);
                                const currentEndMin = parseTimeToMinutes(et);
                                const totalPedagogicalHours = Math.round((currentEndMin - originalStartMin) / 50);
                                return (
                                  <option key={et} value={et}>
                                    {totalPedagogicalHours} {totalPedagogicalHours === 1 ? 'Hora' : 'Horas'} (Hasta {et})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                          Guardar Horario Académico
                        </Button>
                      </form>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Matriz de Horarios Habilitados</h3>
                      </div>
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="p-3">Día Comercial</th>
                            <th className="p-3">Turno Relacionado</th>
                            <th className="p-3">Rango Horario de Clase</th>
                            <th className="p-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                          {schedules.map(item => {
                            const associatedShift = shifts.find(s => s.id === item.shiftId);
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="p-3 font-black text-slate-900">{item.dayOfWeek}</td>
                                <td className="p-3">
                                  {associatedShift ? (
                                    <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                      Turno {associatedShift.name}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-450 italic">No especificado</span>
                                  )}
                                </td>
                                <td className="p-3 font-mono text-xs text-[#9F062A] font-black">{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.timeSlot}</td>
                                <td className="p-3 text-right">
                                  <button 
                                    onClick={() => {
                                      const next = schedules.filter(s => s.id !== item.id);
                                      saveDb("schedules", next, schedulesStateSet);
                                    }}
                                    className="text-red-650 hover:text-red-800 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 ml-auto" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </PageTransition>
              );
            })()}

            {/* TAB: GROUPS (9) */}
            {activeTab === "groups" && (
              <PageTransition id="groups">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Crear Grupo Académico</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!formGroup.name || !formGroup.periodId || !formGroup.careerId || !formGroup.shiftId) {
                          alert("Todos los campos con asteriscos son mandatorios.");
                          return;
                        }
                        
                        // Validar la existencia de una Malla Activa antes de crear el Grupo
                        const activeVersion = curriculumVersions.find(v => v.careerId === formGroup.careerId && v.isActive);
                        if (!activeVersion) {
                          alert("No es posible crear el grupo porque la carrera seleccionada no posee una malla curricular activa.");
                          return;
                        }

                        const id = "g_" + Date.now();
                        const next = [...groups, { ...formGroup, curriculumVersionId: activeVersion.id, id }];
                        saveDb("groups", next, setGroups);
                        setFormGroup({ id: "", name: "", periodId: "", careerId: "", cycle: 1, shiftId: "", capacity: 30 });
                      }}
                      className="space-y-4 text-xs font-semibold"
                    >
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Código del Grupo Académico *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: APTI-1-1 / LUN-6" 
                          value={formGroup.name}
                          onChange={(e) => setFormGroup({ ...formGroup, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Académico *</label>
                          <select 
                            required 
                            value={formGroup.cycle}
                            onChange={(e) => setFormGroup({ ...formGroup, cycle: Number(e.target.value) })}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>Ciclo {num}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Turno de Aula *</label>
                          <select 
                            required 
                            value={formGroup.shiftId}
                            onChange={(e) => setFormGroup({ ...formGroup, shiftId: e.target.value })}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                          >
                            <option value="">-- VER --</option>
                            {shifts.map(sh => (
                              <option key={sh.id} value={sh.id}>{sh.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Período Académico del Grupo *</label>
                        <select 
                          required 
                          value={formGroup.periodId}
                          onChange={(e) => setFormGroup({ ...formGroup, periodId: e.target.value })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                        >
                          <option value="">-- SELECCIONAR --</option>
                          {periods.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Especialidad de la Carrera *</label>
                        <select 
                          required 
                          value={formGroup.careerId}
                          onChange={(e) => setFormGroup({ ...formGroup, careerId: e.target.value })}
                          className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                        >
                          <option value="">-- SELECCIONAR --</option>
                          {careers.map(car => (
                            <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Capacidad de Alumnos *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={200}
                          value={formGroup.capacity}
                          onChange={(e) => setFormGroup({ ...formGroup, capacity: parseInt(e.target.value, 10) || 0 })}
                          className="w-full mt-1 px-3 py-2 border rounded-md font-mono"
                          placeholder="Ej: 30"
                        />
                      </div>

                      <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded leading-relaxed text-[10.5px]">
                        💡 <strong>Regla del Negocio:</strong> Programación Académica solo mostrará asignaturas de la malla que correspondan al ciclo del grupo.
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Guardar Grupo Académico
                      </Button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Grupos de Planificación</h3>
                    </div>
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="p-3">Grupo</th>
                          <th className="p-3">Periodo</th>
                          <th className="p-3">Carrera / especialidad</th>
                          <th className="p-3 font-mono">Ciclos</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {groups.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                              No existen grupos académicos registrados.
                            </td>
                          </tr>
                        ) : (
                          groups.map(item => {
                            const perName = periods.find(p => p.id === item.periodId)?.name || item.periodId;
                            const carName = careers.find(c => c.id === item.careerId)?.name || item.careerId;
                            const shName = shifts.find(s => s.id === item.shiftId)?.name || item.shiftId;
                            const mVer = curriculumVersions.find(v => v.id === item.curriculumVersionId)?.name 
                              || (item.curriculumVersionId ? item.curriculumVersionId : "Malla General / Por defecto");
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="p-3 font-black text-[#9F062A]">{item.name}</td>
                                <td className="p-3 text-[11px] font-mono leading-none">{perName}</td>
                                <td className="p-3 max-w-xs text-xs">
                                  <div className="font-extrabold text-slate-900 leading-tight mb-0.5">{carName}</div>
                                  <div className="text-[10px] text-slate-400 font-bold">
                                    Plan: <span className="font-extrabold text-[#9F062A] bg-red-50/50 border border-red-100 px-1.5 py-0.5 rounded text-[9px] uppercase">{mVer}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono">
                                  <div className="flex flex-col sm:flex-row gap-1">
                                    <span className="bg-blue-105 text-blue-900 text-[9px] px-1.5 py-0.5 rounded border border-blue-200 font-black whitespace-nowrap">
                                      Ciclo {item.cycle} ({shName})
                                    </span>
                                    <span className="bg-teal-100 text-teal-900 text-[9px] px-1.5 py-0.5 rounded border border-teal-200 font-black whitespace-nowrap">
                                      C.: {item.capacity || 30} al.
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => setViewingScheduleGroupId(item.id)}
                                      className="bg-slate-100 hover:bg-[#800521] text-slate-700 hover:text-white p-1.5 rounded-lg border border-slate-200 hover:border-[#800521] flex items-center justify-center cursor-pointer transition-all gap-1 font-bold text-[10px]"
                                      title="Ver Horario de Clases Semanal"
                                    >
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">Ver Horario</span>
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const hasScheduledTasks = tasks.some(t => t.groupId === item.id);
                                        if (hasScheduledTasks) {
                                          alert("No se puede eliminar el grupo académico porque tiene programaciones académicas activas asignadas.");
                                          return;
                                        }
                                        const next = groups.filter(g => g.id !== item.id);
                                        saveDb("groups", next, setGroups);
                                      }}
                                      className="text-red-650 hover:text-red-800 cursor-pointer p-1.5 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Modal de Horario de Curso */}
                {viewingScheduleGroupId && (() => {
                  const targetGroup = groups.find(g => g.id === viewingScheduleGroupId);
                  if (!targetGroup) return null;
                  const groupTasks = tasks.filter(t => t.groupId === targetGroup.id);
                  const career = careers.find(car => car.id === targetGroup.careerId);
                  const period = periods.find(p => p.id === targetGroup.periodId);
                  return (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 text-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] bg-[#9F062A] px-2 py-0.5 rounded-full uppercase tracking-widest font-black text-white">Visualizador de Horario</span>
                            <h3 className="text-sm font-black mt-1">Horario Semanal - Grupo {targetGroup.name}</h3>
                          </div>
                          <button 
                            onClick={() => setViewingScheduleGroupId(null)}
                            className="text-slate-400 hover:text-slate-800 bg-slate-200/50 hover:bg-slate-300 p-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-slate-50">
                          <WeeklyScheduleGrid 
                            tasks={groupTasks}
                            schedules={schedules}
                            courses={courses}
                            classrooms={classrooms}
                            teachers={teachers}
                            group={targetGroup}
                            title={`Horario Lectivo Oficial • Grupo ${targetGroup.name}`}
                            subtitle={`${career?.name || "Especialidad"} • Ciclo ${targetGroup.cycle} • ${period?.name}`}
                          />
                        </div>
                        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                          <button 
                            onClick={() => setViewingScheduleGroupId(null)}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                          >
                            Cerrar Visor
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </PageTransition>
            )}

            {/* TAB: PROGRAMACIÓN ACADÉMICA (10) */}
            {activeTab === "program" && (() => {
              return (
                <PageTransition id="program">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                    
                    {/* Form de Programación Académica */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                       <div className="border-b pb-2">
                        <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">Programar Horario por Horas Reales</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">Asigne sesiones de aprendizaje detallando horas exactas, manteniendo consistencia y previniendo cruces.</p>
                      </div>
                      
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const computedEnd = calculateEndTime(formTask.startTime, formTask.pedagogicalHours || 3, pedagogicalHourDuration);
                          
                          if (!formTask.groupId || !formTask.courseId || !formTask.teacherDni || !formTask.classroomId || !formTask.dayOfWeek || !formTask.startTime || !computedEnd) {
                            alert("Por favor complete todos los parámetros obligatorios (*) y asegure que la Hora de Inicio sea válida.");
                            return;
                          }

                          const group = groups.find(g => g.id === formTask.groupId);
                          if (!group) {
                            alert("Grupo académico no seleccionado.");
                            return;
                          }

                          const course = courses.find(c => c.id === formTask.courseId);
                          const teacher = teachers.find(t => t.dni === formTask.teacherDni);
                          const room = classrooms.find(r => r.id === formTask.classroomId);

                          if (!course || !teacher || !room) {
                            alert("Curso, Docente o Aula no válidos.");
                            return;
                          }

                          // VALIDACIÓN 1: Docente activo (Disponible)
                          const statusVal = teacher.status || "Disponible";
                          if (statusVal === "Licencia" || statusVal === "Inactivo") {
                            alert(`Error: El docente "${teacher.lastName}, ${teacher.name}" no está disponible para programación (Estado actual: ${statusVal}).`);
                            return;
                          }

                          // VALIDACIÓN DE HORAS DE TEORÍA O LABORATORIO Y SOBREPROGRAMACIÓN (REQUERIMIENTO 3)
                          const courseTasks = tasks.filter(t => t.groupId === formTask.groupId && t.courseId === course.id);
                          const programmedTheory = courseTasks
                            .filter(t => t.sessionType === "Teoría")
                            .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                          const programmedLab = courseTasks
                            .filter(t => t.sessionType === "Laboratorio")
                            .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

                          const reqTheory = course.theoryHours || 0;
                          const reqLab = course.labHours || 0;
                          const inputHours = formTask.pedagogicalHours || 3;

                          if (formTask.sessionType === "Teoría") {
                            if (programmedTheory >= reqTheory) {
                              alert("Las horas de teoría definidas para este curso ya fueron cubiertas.");
                              return;
                            }
                            if (programmedTheory + inputHours > reqTheory) {
                              alert(`Las horas de teoría definidas para este curso ya fueron cubiertas. Límite: ${reqTheory} hrs, Programado: ${programmedTheory} hrs, Intentando programar: ${inputHours} hrs.`);
                              return;
                            }
                          } else if (formTask.sessionType === "Laboratorio") {
                            if (programmedLab >= reqLab) {
                              alert("Las horas de laboratorio definidas para este curso ya fueron cubiertas.");
                              return;
                            }
                            if (programmedLab + inputHours > reqLab) {
                              alert(`Las horas de laboratorio definidas para este curso ya fueron cubiertas. Límite: ${reqLab} hrs, Programado: ${programmedLab} hrs, Intentando programar: ${inputHours} hrs.`);
                              return;
                            }
                          }

                          // VALIDACIÓN 2: Compatibilidad de Aula de Laboratorio
                          if (formTask.sessionType === "Laboratorio" && room.type !== "Laboratorio") {
                            alert(`Error de Infraestructura: El curso requiere un aula de tipo "Laboratorio" para sesiones prácticas. El ambiente "${room.name}" es de tipo "${room.type}".`);
                            return;
                          }

                          // VALIDACIÓN 3: Verificación de capacidad física del aula vs grupo
                          if (room.capacity < group.capacity) {
                            alert(`Conflicto de Capacidad: El aula "${room.name}" tiene capacidad para ${room.capacity} estudiantes, pero el grupo asignado "${group.name}" requiere capacidad para de ${group.capacity} alumnos.`);
                            return;
                          }

                          // VALIDACIÓN DE TURNO / HORARIO FRONTAL (La hora de inicio y fin deben estar dentro del Turno asignado)
                          const shift = shifts.find(s => s.id === group.shiftId);
                          if (shift && shift.startTime && shift.endTime) {
                            const taskMinStart = parseTimeToMinutes(formTask.startTime);
                            const taskMinEnd = parseTimeToMinutes(computedEnd);
                            const shiftMinStart = parseTimeToMinutes(shift.startTime);
                            const shiftMinEnd = parseTimeToMinutes(shift.endTime);

                            if (taskMinStart < shiftMinStart || taskMinEnd > shiftMinEnd) {
                              alert(`Error de Turno: El turno asignado al Grupo Académico es "${shift.name}" (${shift.startTime} - ${shift.endTime}). La sesión programada ingresada (${formTask.startTime} - ${computedEnd}) supera los límites establecidos para este turno.`);
                              return;
                            }
                          }

                          // VALIDACIÓN 4: No cruce de docentes, aulas o de grupo en horarios reales
                          const currentStart = formTask.startTime;
                          const currentEnd = computedEnd;
                          const currentDay = formTask.dayOfWeek;

                          for (const t of tasks) {
                            const tDay = t.dayOfWeek || "Lunes";
                            const tStart = t.startTime;
                            const tEnd = t.endTime;

                            if (tStart && tEnd && hoursOverlap(currentDay, currentStart, currentEnd, tDay, tStart, tEnd)) {
                              // Check teacher overlap
                              if (t.teacherDni === formTask.teacherDni) {
                                alert(`Conflicto de Docente: El docente "${teacher.lastName}, ${teacher.name}" ya cuenta con otra sesión programada el ${currentDay} de ${tStart} a ${tEnd}.`);
                                return;
                              }

                              // Check classroom overlap
                              if (t.classroomId === formTask.classroomId) {
                                alert(`Conflicto de Aula: El ambiente físico "${room.name}" ya se encuentra reservado el ${currentDay} de ${tStart} a ${tEnd}.`);
                                return;
                              }

                              // Check group overlap
                              if (t.groupId === formTask.groupId) {
                                alert(`Conflicto de Grupo: El Grupo Académico "${group.name}" ya tiene clases el ${currentDay} de ${tStart} a ${tEnd}.`);
                                return;
                              }
                            }
                          }

                          // If all validations succeed, save task!
                          const newTask: MpaProgramTask = {
                            id: "task_" + Date.now(),
                            groupId: formTask.groupId,
                            courseId: formTask.courseId,
                            teacherDni: formTask.teacherDni,
                            classroomId: formTask.classroomId,
                            sessionType: formTask.sessionType,
                            grpNum: group.name,
                            subGrpNum: "0",
                            dayOfWeek: currentDay,
                            startTime: currentStart,
                            endTime: currentEnd,
                            shiftId: group.shiftId,
                            sessionClassType: formTask.sessionType === "Laboratorio" ? "Lab" : "Teo",
                            pedagogicalHours: inputHours
                          };

                          const next = [...tasks, newTask];
                          saveDb("tasks", next, setTasks);

                          // Reset task input fields
                          setFormTask({
                            id: "",
                            groupId: "",
                            courseId: "",
                            teacherDni: "",
                            classroomId: "",
                            scheduleId: "",
                            sessionType: "Teoría",
                            dayOfWeek: "Lunes",
                            startTime: "",
                            endTime: "",
                            pedagogicalHours: 3
                          });

                          alert("¡Sesión programada con éxito!");
                        }}
                        className="space-y-4 text-xs font-semibold"
                      >
                        
                        {/* Grupo Académico */}
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Grupo Académico Principal *</label>
                          <select 
                            required
                            value={formTask.groupId}
                            onChange={(e) => {
                              const gId = e.target.value;
                              const g = groups.find(x => x.id === gId);
                              if (g) {
                                const sh = shifts.find(s => s.id === g.shiftId);
                                setFormTask({
                                  ...formTask,
                                  groupId: gId,
                                  courseId: "",
                                  startTime: sh ? sh.startTime : "08:00 AM",
                                  endTime: sh ? sh.endTime : "10:15 AM",
                                  dayOfWeek: "Lunes"
                                });
                              } else {
                                setFormTask({
                                  ...formTask,
                                  groupId: ""
                                });
                              }
                            }}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
                          >
                            <option value="">-- SELECCIONAR GRUPO --</option>
                            {groups.map(g => {
                              const pName = periods.find(p => p.id === g.periodId)?.name || g.periodId;
                              const cName = careers.find(c => c.id === g.careerId)?.name || g.careerId;
                              const sName = shifts.find(s => s.id === g.shiftId)?.name || g.shiftId;
                              return (
                                <option key={g.id} value={g.id}>
                                  {g.name} - {cName} (Ciclo {g.cycle} • {sName} • {pName})
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Tarjeta informativa del Grupo Académico (Resumen Inteligente del Grupo - Requerimiento 1) */}
                        {(() => {
                          if (!formTask.groupId) return null;
                          const g = groups.find(x => x.id === formTask.groupId);
                          if (!g) return null;
                          const pName = periods.find(p => p.id === g.periodId)?.name || g.periodId;
                          const cName = careers.find(c => c.id === g.careerId)?.name || g.careerId;
                          const sName = shifts.find(s => s.id === g.shiftId)?.name || g.shiftId;

                          // Compute smart stats:
                          const linkedVersionId = g.curriculumVersionId || curriculumVersions.find(v => v.careerId === g.careerId && v.isActive)?.id;
                          const matchedCurriculum = curriculum.filter(
                            it => it.careerId === g.careerId && 
                                  it.cycle === g.cycle && 
                                  (!linkedVersionId || it.versionId === linkedVersionId)
                          );

                          let totalRecommendedCourses = matchedCurriculum.length;
                          let fullyProgrammedCourses = 0;
                          let pendingCourses = 0;
                          let totalTheoryHoursRequired = 0;
                          let totalTheoryHoursProgrammed = 0;
                          let totalLabHoursRequired = 0;
                          let totalLabHoursProgrammed = 0;

                          matchedCurriculum.forEach(it => {
                            const crs = courses.find(c => c.id === it.courseId && c.status !== "Inactivo");
                            if (!crs) return;

                            // Required hours:
                            const reqT = crs.theoryHours || 0;
                            const reqL = crs.labHours || 0;
                            totalTheoryHoursRequired += reqT;
                            totalLabHoursRequired += reqL;

                            // Programmed tasks for this group & course in calendar:
                            const courseTasks = tasks.filter(t => t.groupId === g.id && t.courseId === crs.id);
                            const pTheory = courseTasks
                              .filter(t => t.sessionType === "Teoría")
                              .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                            const pLab = courseTasks
                              .filter(t => t.sessionType === "Laboratorio")
                              .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

                            totalTheoryHoursProgrammed += Math.min(reqT, pTheory);
                            totalLabHoursProgrammed += Math.min(reqL, pLab);

                            const isTheoryDone = pTheory >= reqT;
                            const isLabDone = pLab >= reqL;

                            if (isTheoryDone && isLabDone) {
                              fullyProgrammedCourses++;
                            } else {
                              pendingCourses++;
                            }
                          });

                          const theoryHoursPending = Math.max(0, totalTheoryHoursRequired - totalTheoryHoursProgrammed);
                          const labHoursPending = Math.max(0, totalLabHoursRequired - totalLabHoursProgrammed);

                          const totalRequiredSum = totalTheoryHoursRequired + totalLabHoursRequired;
                          const totalProgrammedSum = totalTheoryHoursProgrammed + totalLabHoursProgrammed;
                          const progressPercentage = totalRequiredSum > 0 
                            ? Math.round((totalProgrammedSum / totalRequiredSum) * 100) 
                            : 0;

                          return (
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-xs text-left animate-in fade-in duration-200">
                              <div className="flex items-center justify-between border-b pb-2">
                                <h4 className="text-[10px] text-[#9F062A] font-black uppercase tracking-wider flex items-center gap-1.5 leading-none">
                                  <LayoutDashboard className="w-3.5 h-3.5" />
                                  Resumen de Planificación de Horarios
                                </h4>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-extrabold font-mono ${
                                  progressPercentage === 100 
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-200" 
                                    : "bg-amber-100 text-amber-900 border-amber-200"
                                }`}>
                                  Progreso: {progressPercentage}%
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                                <div 
                                  style={{ width: `${progressPercentage}%` }} 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    progressPercentage === 100 ? "bg-emerald-500" : "bg-[#800521]"
                                  }`}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed font-semibold">
                                {/* Academic and career context */}
                                <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-100">
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Período Académico:</span>
                                    <span className="font-extrabold text-slate-800">{pName}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Carrera Profesional:</span>
                                    <span className="font-extrabold text-slate-800 truncate block" title={cName}>{cName}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Ciclo & Turno:</span>
                                    <span className="font-extrabold text-[#9F062A] uppercase">Ciclo {g.cycle} — {sName}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Capacidad / Alumnos:</span>
                                    <span className="font-extrabold text-slate-850 font-mono">{g.capacity} Vacantes</span>
                                  </div>
                                </div>

                                {/* Planification process and pending hours */}
                                <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-100">
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Cursos del Ciclo:</span>
                                    <span className="font-extrabold text-slate-800 font-mono">
                                      {totalRecommendedCourses} asignaturas
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between border-b pb-1">
                                    <div>
                                      <span className="block text-[8px] text-slate-400 uppercase font-black">Completos:</span>
                                      <span className="font-bold text-emerald-600 font-mono">{fullyProgrammedCourses} cur.</span>
                                    </div>
                                    <div className="border-l border-slate-200 pl-3">
                                      <span className="block text-[8px] text-slate-400 uppercase font-black">Pendientes:</span>
                                      <span className="font-bold text-amber-600 font-mono">{pendingCourses} cur.</span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Hrs. Teoría Pendientes:</span>
                                    <span className={`font-black font-mono text-xs ${theoryHoursPending > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                                      {theoryHoursPending} horas {theoryHoursPending === 0 ? "✓" : ""}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] text-slate-400 uppercase font-black">Hrs. Lab. Pendientes:</span>
                                    <span className={`font-black font-mono text-xs ${labHoursPending > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                                      {labHoursPending} horas {labHoursPending === 0 ? "✓" : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Asignatura */}
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Asignatura del Plan *</label>
                          <select 
                            required
                            disabled={!formTask.groupId}
                            value={formTask.courseId}
                            onChange={(e) => setFormTask({ ...formTask, courseId: e.target.value })}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950 disabled:opacity-50"
                          >
                            <option value="">-- SELECCIONAR CURSO --</option>
                            {(() => {
                              const group = groups.find(g => g.id === formTask.groupId);
                              if (!group) return null;
                              
                              const linkedVersionId = group.curriculumVersionId || curriculumVersions.find(v => v.careerId === group.careerId && v.isActive)?.id;
                              const matchedCurriculum = curriculum.filter(
                                it => it.careerId === group.careerId && 
                                      it.cycle === group.cycle && 
                                      (!linkedVersionId || it.versionId === linkedVersionId)
                              );
                              
                              return matchedCurriculum.map(it => {
                                const crs = courses.find(c => c.id === it.courseId && c.status !== "Inactivo");
                                if (!crs) return null;
                                return (
                                  <option key={crs.id} value={crs.id}>{crs.name} ({crs.code})</option>
                                );
                              });
                            })()}
                          </select>
                        </div>

                        {/* Control en tiempo real de horas requeridas/programadas (Requerimiento 2) */}
                        {(() => {
                          if (!formTask.groupId || !formTask.courseId) return null;
                          const crs = courses.find(c => c.id === formTask.courseId);
                          if (!crs) return null;
                          const courseTasks = tasks.filter(t => t.groupId === formTask.groupId && t.courseId === crs.id);
                          const pTheory = courseTasks
                            .filter(t => t.sessionType === "Teoría")
                            .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                          const pLab = courseTasks
                            .filter(t => t.sessionType === "Laboratorio")
                            .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

                          const reqT = crs.theoryHours || 0;
                          const reqL = crs.labHours || 0;
                          const pendingT = Math.max(0, reqT - pTheory);
                          const pendingL = Math.max(0, reqL - pLab);

                          return (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5 text-slate-700">
                              <p className="text-[9.5px] text-[#9F062A] font-black uppercase tracking-wider">Control de Horas del Curso</p>
                              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                <div className="border-r pr-1.5 border-slate-200">
                                  <span className="block text-[8px] text-slate-400 font-bold uppercase">Sesiones de Teoría:</span>
                                  <div className="font-semibold text-slate-800">Requeridas: <span className="font-extrabold">{reqT} hrs</span></div>
                                  <div className="font-semibold text-slate-800">Programadas: <span className="font-extrabold text-[#9F062A]">{pTheory} hrs</span></div>
                                  <div className="font-semibold text-slate-800">
                                    Pendiente: {pendingT > 0 ? (
                                      <span className="font-extrabold text-amber-600">{pendingT} hrs</span>
                                    ) : (
                                      <span className="font-extrabold text-emerald-600">Completado ✨</span>
                                    )}
                                  </div>
                                </div>
                                <div className="pl-1.5">
                                  <span className="block text-[8px] text-slate-400 font-bold uppercase">Sesiones de Laboratorio:</span>
                                  <div className="font-semibold text-slate-800">Requeridas: <span className="font-extrabold">{reqL} hrs</span></div>
                                  <div className="font-semibold text-slate-800">Programadas: <span className="font-extrabold text-[#9F062A]">{pLab} hrs</span></div>
                                  <div className="font-semibold text-slate-800">
                                    Pendiente: {pendingL > 0 ? (
                                      <span className="font-extrabold text-amber-600">{pendingL} hrs</span>
                                    ) : (
                                      <span className="font-extrabold text-emerald-600">Completado ✨</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Docente */}
                        <div className="space-y-2 border-y py-2.5 border-slate-100 my-2">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] text-slate-500 font-bold uppercase">Docente Responsable *</label>
                            <span className="text-[8.5px] text-[#9F062A] font-black uppercase tracking-wider bg-rose-100/50 px-1.5 py-0.5 rounded">
                              Docentes Disponibles
                            </span>
                          </div>

                          {/* Search & Specialty filters in a grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input 
                                type="text"
                                placeholder="🔍 Buscar por nombre, DNI..."
                                value={teacherSearchQuery}
                                onChange={(e) => setTeacherSearchQuery(e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] font-semibold bg-white text-slate-900"
                              />
                            </div>
                            <div>
                              <select
                                value={teacherSpecialtyFilter}
                                onChange={(e) => setTeacherSpecialtyFilter(e.target.value)}
                                className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-bold bg-white text-slate-900"
                              >
                                <option value="all">📁 Espe: Todas</option>
                                {[
                                  "Desarrollo de Sistemas",
                                  "Contabilidad",
                                  "Administración",
                                  "Cursos Generales",
                                  "Matemática",
                                  "Comunicación",
                                  "Electricidad Industrial",
                                  "Electrónica"
                                ].map(spec => (
                                  <option key={spec} value={spec}>{spec}</option>
                                ))}
                                {/* Render other unique specialties registered in list */}
                                {Array.from(new Set<string>(teachers.flatMap(t => getTeacherSpecialties(t)) as string[]))
                                  .filter((spec: string) => ![
                                    "Desarrollo de Sistemas",
                                    "Contabilidad",
                                    "Administración",
                                    "Cursos Generales",
                                    "Matemática",
                                    "Comunicación",
                                    "Electricidad Industrial",
                                    "Electrónica"
                                  ].includes(spec))
                                  .map((spec: string) => (
                                    <option key={spec} value={spec}>{spec}</option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          <select 
                            required
                            value={formTask.teacherDni}
                            onChange={(e) => setFormTask({ ...formTask, teacherDni: e.target.value })}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-bold text-slate-950"
                          >
                            <option value="">-- SELECCIONAR DOCENTE --</option>
                            {(() => {
                              // Filter teachers by eligibility (Disponible, but not Licencia/Inactivo)
                              let list = teachers.filter(t => {
                                const statusVal = t.status || "Disponible";
                                return statusVal === "Disponible";
                              });

                              // Search Query
                              const q = teacherSearchQuery.toLowerCase().trim();
                              if (q) {
                                list = list.filter(t => 
                                  t.name.toLowerCase().includes(q) || 
                                  t.lastName.toLowerCase().includes(q) || 
                                  t.dni.includes(q)
                                );
                              }

                              // Specialty filter
                              if (teacherSpecialtyFilter !== "all") {
                                list = list.filter(t => 
                                  getTeacherSpecialties(t).some(spec => spec.toLowerCase() === teacherSpecialtyFilter.toLowerCase())
                                );
                              }

                              return list.map(t => (
                                <option key={t.dni} value={t.dni}>
                                  {t.lastName}, {t.name} (DNI: {t.dni})
                                </option>
                              ));
                            })()}
                          </select>
                          
                          {/* Search badge counter info */}
                          {teacherSearchQuery || teacherSpecialtyFilter !== "all" ? (
                            <p className="text-[10px] text-slate-500 font-bold italic">
                              Encontrados: {
                                teachers.filter(t => (t.status || "Disponible") === "Disponible")
                                  .filter(t => {
                                    const q = teacherSearchQuery.toLowerCase().trim();
                                    if (!q) return true;
                                    return t.name.toLowerCase().includes(q) || t.lastName.toLowerCase().includes(q) || t.dni.includes(q);
                                  })
                                  .filter(t => {
                                    if (teacherSpecialtyFilter === "all") return true;
                                    return getTeacherSpecialties(t).some(spec => spec.toLowerCase() === teacherSpecialtyFilter.toLowerCase());
                                  }).length
                              } disponible(s).
                            </p>
                          ) : null}
                        </div>

                        {/* Tipo de Sesión */}
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Sesión (Tipo) *</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {([
                              { id: "Teo", label: "Teo (Teoría)" },
                              { id: "Lab", label: "Lab (Laboratorio)" }
                            ] as const).map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setFormTask({ 
                                    ...formTask, 
                                    sessionType: item.id === "Lab" ? "Laboratorio" : "Teoría", 
                                    classroomId: "" 
                                  });
                                }}
                                className={`py-1.5 rounded text-[10px] uppercase font-black transition-all border cursor-pointer ${
                                  formTask.sessionType === (item.id === "Lab" ? "Laboratorio" : "Teoría")
                                    ? "bg-[#9F062A] text-white border-transparent"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Classroom */}
                        <div>
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] text-slate-500 font-bold uppercase">Aula / Ambiente físico *</label>
                            <span className="text-[8px] text-red-700 font-black tracking-widest uppercase">FILTRO ACTIVO: {formTask.sessionType === "Laboratorio" ? "LABORATORIO" : "TEORÍA"}</span>
                          </div>
                          <select 
                            required
                            value={formTask.classroomId}
                            onChange={(e) => setFormTask({ ...formTask, classroomId: e.target.value })}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-700"
                          >
                            <option value="">-- ELEGIR AULA --</option>
                            {classrooms
                              .filter(room => room.type === formTask.sessionType)
                              .map(room => (
                                <option key={room.id} value={room.id}>
                                  {room.name} ({room.location}) - Capacidad: {room.capacity} alum.
                                </option>
                              ))
                            }
                          </select>
                        </div>

                        {/* Día de la semana */}
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Día de la semana *</label>
                          <select 
                            required
                            value={formTask.dayOfWeek}
                            onChange={(e) => setFormTask({ ...formTask, dayOfWeek: e.target.value })}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-950"
                          >
                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        {/* Horario Real */}
                        {(() => {
                          const computedEndTime = calculateEndTime(formTask.startTime, formTask.pedagogicalHours || 3, pedagogicalHourDuration);
                          return (
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                              {/* Fila superior: Parametrizar Duración de Hora Pedagógica */}
                              <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-[9px] text-[#9F062A] font-black uppercase">Duración Hora Pedagógica</span>
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="number"
                                    value={pedagogicalHourDuration}
                                    min={30}
                                    max={120}
                                    onChange={(e) => savePedagogicalHourDuration(parseInt(e.target.value, 10) || 50)}
                                    className="w-12 px-1 py-0.5 border border-slate-250 rounded text-right font-bold text-[9px] bg-white text-slate-900"
                                  />
                                  <span className="text-[9px] font-bold text-slate-500">Minutos</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-1">
                                  <label className="block text-[9px] text-slate-500 font-bold uppercase truncate">Hora Inicio *</label>
                                  <input 
                                    type="text"
                                    required
                                    placeholder="Ej: 08:00 AM"
                                    value={formTask.startTime}
                                    onChange={(e) => setFormTask({ ...formTask, startTime: e.target.value })}
                                    className="w-full mt-1 px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono font-bold text-[11px] text-slate-950 placeholder-slate-400"
                                  />
                                </div>
                                
                                <div className="col-span-1">
                                  <label className="block text-[9px] text-slate-500 font-bold uppercase truncate">Horas Pedagóg. *</label>
                                  <input 
                                    type="number"
                                    required
                                    min={1}
                                    max={12}
                                    value={formTask.pedagogicalHours || 3}
                                    onChange={(e) => setFormTask({ ...formTask, pedagogicalHours: parseInt(e.target.value, 10) || 1 })}
                                    className="w-full mt-1 px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono font-bold text-[11px] text-slate-950"
                                  />
                                </div>

                                <div className="col-span-1">
                                  <label className="block text-[9px] text-[#9F062A] font-bold uppercase truncate">Hora Fin (Calc)</label>
                                  <div className="w-full mt-1 px-2.5 py-1.5 border border-rose-100 rounded bg-rose-50/50 font-mono font-black text-[11px] text-[#9F062A] text-center select-none truncate">
                                    {computedEndTime || "--:-- --"}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-[8.5px] text-slate-400 font-semibold text-right leading-none italic mt-1">
                                Calculado con hora pedagógica de {pedagogicalHourDuration} minutos de duración.
                              </p>
                            </div>
                          );
                        })()}

                        <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider shadow-md">
                          Asignar y Grabar Programación
                        </Button>
                      </form>
                    </div>

                    {/* Programaciones académicas activas y Avance de Planificación */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Indicador visual de progreso (Requerimiento 4) */}
                      {formTask.groupId && (() => {
                        const groupObj = groups.find(g => g.id === formTask.groupId);
                        if (!groupObj) return null;

                        const linkedVersionId = groupObj.curriculumVersionId || curriculumVersions.find(v => v.careerId === groupObj.careerId && v.isActive)?.id;
                        const matchedCurriculum = curriculum.filter(
                          it => it.careerId === groupObj.careerId && 
                                it.cycle === groupObj.cycle && 
                                (!linkedVersionId || it.versionId === linkedVersionId)
                        );
                        
                        const list = matchedCurriculum.map(it => {
                          const crs = courses.find(c => c.id === it.courseId && c.status !== "Inactivo");
                          return crs;
                        }).filter(Boolean);

                        return (
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
                            <div className="border-b pb-2.5 mb-3 flex justify-between items-center">
                              <div>
                                <span className="text-[9px] text-[#9F062A] font-extrabold uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">
                                  Progreso del Grupo
                                </span>
                                <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider mt-1.5">
                                  Avance de Planificación por Curso ({groupObj.name})
                                </h4>
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold italic">
                                Total: {list.length} cursos en el ciclo
                              </span>
                            </div>

                            {list.length === 0 ? (
                              <p className="text-slate-400 italic text-xs font-semibold">No hay cursos configurados en la malla curricular para este ciclo/carrera.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {list.map(course => {
                                  if (!course) return null;
                                  const courseTasks = tasks.filter(t => t.groupId === formTask.groupId && t.courseId === course.id);
                                  const pTheory = courseTasks
                                    .filter(t => t.sessionType === "Teoría")
                                    .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);
                                  const pLab = courseTasks
                                    .filter(t => t.sessionType === "Laboratorio")
                                    .reduce((acc, t) => acc + (t.pedagogicalHours || 3), 0);

                                  const reqTheory = course.theoryHours || 0;
                                  const reqLab = course.labHours || 0;

                                  const tComplete = pTheory >= reqTheory;
                                  const lComplete = pLab >= reqLab;
                                  const allComplete = tComplete && lComplete;

                                  return (
                                    <div key={course.id} className="bg-slate-50/50 border border-slate-150 rounded-lg p-3 hover:border-[#9F062A]/30 transition-all flex flex-col justify-between">
                                      <div>
                                        <div className="flex justify-between items-start gap-1">
                                          <span className="font-extrabold text-[12px] text-slate-805 leading-tight block">{course.name}</span>
                                          <span className="font-mono text-[9px] bg-slate-200 text-slate-750 px-1 py-0.2 rounded shrink-0">{course.code}</span>
                                        </div>
                                        
                                        <div className="mt-2 space-y-1 text-[11px] font-medium text-slate-600">
                                          <div className="flex justify-between items-center">
                                            <span>Teoría requerida:</span>
                                            <span className={`font-mono font-black ${tComplete ? "text-emerald-700" : "text-amber-700"}`}>
                                              {pTheory} / {reqTheory} hrs
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span>Laboratorio requerido:</span>
                                            <span className={`font-mono font-black ${lComplete ? "text-emerald-700" : "text-amber-700"}`}>
                                              {pLab} / {reqLab} hrs
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[10px] text-slate-450 font-bold uppercase">Estado actual:</span>
                                        {allComplete ? (
                                          <span className="bg-emerald-100 text-emerald-850 text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded leading-none flex items-center gap-1">
                                            ✅ Completo
                                          </span>
                                        ) : (
                                          <span className="bg-amber-100 text-amber-850 text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded leading-none flex items-center gap-1">
                                            ⚠️ Pendiente de programación
                                          </span>
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

                      {/* Clases programadas */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Clases Programadas en el Período</h3>
                        </div>
                      
                      {tasks.length === 0 ? (
                        <div className="p-10 text-center font-semibold font-sans text-xs text-slate-400">
                          No existen programaciones académicas.
                        </div>
                      ) : (
                        <div className="overflow-x-auto font-sans">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-[#9F062A]/5 uppercase tracking-wider text-[9px] font-black text-[#9F062A] border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Sem.</th>
                                <th className="p-2.5">Curso / Asignatura</th>
                                <th className="p-2.5 font-mono text-center">Grp</th>
                                <th className="p-2.5 font-mono text-center">SGrp</th>
                                <th className="p-2.5 text-center font-mono">Tipo</th>
                                <th className="p-2.5">Aula</th>
                                <th className="p-2.5">Día</th>
                                <th className="p-2.5 font-mono text-center">Horas</th>
                                <th className="p-2.5">Horario</th>
                                <th className="p-2.5">Docente</th>
                                <th className="p-2.5 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                              {tasks.map(item => {
                                const grpObj = groups.find(g => g.id === item.groupId);
                                const cycleFormatted = grpObj ? (grpObj.cycle < 10 ? `0${grpObj.cycle}` : grpObj.cycle.toString()) : "01";
                                
                                const courseObj = courses.find(c => c.id === item.courseId);
                                const courseText = courseObj ? `${courseObj.code} - ${courseObj.name}` : item.courseId;
                                
                                const grpNumNormalized = grpObj ? grpObj.name : (item.grpNum || "01");
                                const subGrpNumNormalized = "-";
                                const classTypeNormalized = item.sessionClassType || "Teo";
                                
                                const dayText = item.dayOfWeek || (schedules.find(s => s.id === item.scheduleId)?.dayOfWeek || "-");
                                const hoursSpan = (item.startTime && item.endTime) ? `${item.startTime} - ${item.endTime}` : (schedules.find(s => s.id === item.scheduleId)?.timeSlot || `${schedules.find(s => s.id === item.scheduleId)?.startTime} - ${schedules.find(s => s.id === item.scheduleId)?.endTime}` || "-");
                                
                                // Calculation of pedagogical hours
                                let startMin = 0;
                                let endMin = 0;
                                if (item.startTime && item.endTime) {
                                  startMin = parseTimeToMinutes(item.startTime);
                                  endMin = parseTimeToMinutes(item.endTime);
                                } else {
                                  const scheduleObj = schedules.find(s => s.id === item.scheduleId);
                                  if (scheduleObj) {
                                    if (scheduleObj.startTime && scheduleObj.endTime) {
                                      startMin = parseTimeToMinutes(scheduleObj.startTime);
                                      endMin = parseTimeToMinutes(scheduleObj.endTime);
                                    } else if (scheduleObj.timeSlot) {
                                      const parts = scheduleObj.timeSlot.split("-");
                                      if (parts.length === 2) {
                                        startMin = parseTimeToMinutes(parts[0].trim());
                                        endMin = parseTimeToMinutes(parts[1].trim());
                                      }
                                    }
                                  }
                                }
                                const diffMin = endMin - startMin;
                                const hrsCount = Math.ceil(diffMin / 50); // standard 50-mins academic hour
                                const totalPedHours = hrsCount > 0 ? hrsCount : 0;

                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="p-2.5 font-bold font-mono text-[11px] text-slate-500">{cycleFormatted}</td>
                                    <td className="p-2.5 text-slate-900 leading-tight">
                                      <div className="font-bold line-clamp-1 truncate select-all">{courseText}</div>
                                    </td>
                                    <td className="p-2.5 font-bold font-mono text-center text-[11px] text-[#9F062A] bg-[#9F062A]/5">{grpNumNormalized}</td>
                                    <td className="p-2.5 font-bold font-mono text-center text-[11px] text-indigo-700 bg-indigo-50/70">{subGrpNumNormalized}</td>
                                    <td className="p-2.5 text-center font-mono">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                        classTypeNormalized === "Lab" 
                                          ? "bg-emerald-100 text-emerald-800" 
                                          : classTypeNormalized === "Tal" 
                                            ? "bg-rose-100 text-rose-800" 
                                            : "bg-amber-100 text-amber-800"
                                      }`}>
                                        {classTypeNormalized}
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <span className="block font-bold text-slate-900 truncate" style={{ maxWidth: '120px' }}>
                                        {get_classroom_name(item.classroomId)}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-[11px] text-slate-700 font-medium">{dayText}</td>
                                    <td className="p-2.5 font-mono text-center text-[11px] font-bold text-slate-600">{totalPedHours > 0 ? totalPedHours : "-"}</td>
                                    <td className="p-2.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">{hoursSpan}</td>
                                    <td className="p-2.5 text-[11px] font-medium leading-tight text-slate-700 max-w-[130px] truncate" title={getDocenteName(item.teacherDni)}>
                                      {getDocenteName(item.teacherDni)}
                                    </td>
                                    <td className="p-2.5 text-right">
                                      <button 
                                        onClick={() => {
                                          const next = tasks.filter(t => t.id !== item.id);
                                          saveDb("tasks", next, setTasks);
                                        }}
                                        className="text-red-550 hover:text-red-800 cursor-pointer inline-block"
                                      >
                                        <Trash2 className="w-4 h-4 ml-auto" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                  </div>
                </PageTransition>
              );
            })()}

            {/* TAB: HORARIOS POR CARRERA Y CICLO */}
            {activeTab === "career_schedules" && (() => {
              const activeCareerId = filterSchCareerId || (careers[0]?.id || "");
              const selectedCareer = careers.find(c => c.id === activeCareerId);
              
              // Get groups filtered by career and cycle
              const matchingGroups = groups.filter(g => g.careerId === activeCareerId && g.cycle === filterSchCycle);
              
              // Resolve active group filter
              const currentGroupFilter = filterSchGroupId === "all" 
                ? "all" 
                : matchingGroups.some(g => g.id === filterSchGroupId) ? filterSchGroupId : "all";
              
              // Filter academic program tasks associated
              const filteredTasks = tasks.filter(t => {
                if (currentGroupFilter === "all") {
                  return matchingGroups.some(g => g.id === t.groupId);
                } else {
                  return t.groupId === currentGroupFilter;
                }
              });

              // Calculate metrics
              const uniqueCoursesCount = novelArray(filteredTasks.map(t => t.courseId)).length;
              const laboratoriosCount = filteredTasks.filter(t => t.sessionType === "Laboratorio").length;
              const teoriasCount = filteredTasks.filter(t => t.sessionType === "Teoría").length;
              const uniqueTeachersCount = novelArray(filteredTasks.map(t => t.teacherDni)).length;

              function novelArray(arr: any[]) {
                return Array.from(new Set(arr));
              }

              return (
                <PageTransition id="career_schedules">
                  <div className="space-y-6 text-left">
                    {/* Header info card */}
                    <div className="bg-[#9F062A]/5 p-5 rounded-xl border border-[#9F062A]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-sm font-black text-[#9F062A] uppercase tracking-wider">Matriz y Calendario de Horarios Integrados</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">
                          Consulte y descargue la programación visual de horarios filtrado por programa de estudios y nivel de ciclo académico.
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#9F062A] px-2.5 py-1 bg-white border border-[#9F062A]/20 rounded-lg">
                        Año Académico: 2026
                      </span>
                    </div>

                    {/* Filter controls panel */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none mb-4">Criterios de Consulta</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera de Estudios</label>
                          <select 
                            value={activeCareerId}
                            onChange={(e) => {
                              setFilterSchCareerId(e.target.value);
                              setFilterSchGroupId("all"); // reset group filter
                            }}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-sans"
                          >
                            {careers.map(car => (
                              <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Formativo Académico</label>
                          <select 
                            value={filterSchCycle}
                            onChange={(e) => {
                              setFilterSchCycle(Number(e.target.value));
                              setFilterSchGroupId("all"); // reset group filter
                            }}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-sans"
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>Ciclo {num}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase">Grupo de Planificación</label>
                          <select 
                            value={currentGroupFilter}
                            onChange={(e) => setFilterSchGroupId(e.target.value)}
                            className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-sans"
                          >
                            <option value="all">-- MOSTRAR TODOS ({matchingGroups.length}) --</option>
                            {matchingGroups.map(grp => (
                              <option key={grp.id} value={grp.id}>Grupo {grp.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Quick Metric Cards Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Grupos Detectados</span>
                        <p className="text-xl font-black text-slate-800 mt-1 font-mono">{matchingGroups.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Asignaturas Distintas</span>
                        <p className="text-xl font-black text-slate-800 mt-1 font-mono">{uniqueCoursesCount}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Clases de Teoría / Lab</span>
                        <p className="text-xl font-black text-slate-800 mt-1 font-mono">{teoriasCount} T / {laboratoriosCount} L</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Docentes Activos</span>
                        <p className="text-xl font-black text-slate-800 mt-1 font-mono">{uniqueTeachersCount}</p>
                      </div>
                    </div>

                    {/* Integrated Weekly View Grid */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200">
                      <WeeklyScheduleGrid 
                        tasks={filteredTasks}
                        schedules={schedules}
                        courses={courses}
                        classrooms={classrooms}
                        teachers={teachers}
                        title={`Horario de Clases Semanal`}
                        subtitle={`${selectedCareer?.name || "Especialidad"} • Ciclo ${filterSchCycle} • ${
                          currentGroupFilter === "all" ? "Todos los Grupos" : "Grupo " + (groups.find(g => g.id === currentGroupFilter)?.name || currentGroupFilter)
                        }`}
                      />
                    </div>

                    {/* List view of lessons for complete data transparency */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Detalle de Sesiones Programadas</h4>
                        <span className="text-[9.5px] text-slate-500 font-black uppercase font-mono bg-white px-2 py-0.5 rounded border">Total: {filteredTasks.length}</span>
                      </div>
                      {filteredTasks.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic">
                          No hay clases programadas correspondientes.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="p-3">Grupo</th>
                                <th className="p-3">Curso / Código</th>
                                <th className="p-3">Docente</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Ambiente / Aula</th>
                                <th className="p-3">Día y Hora</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-850">
                              {filteredTasks.map(t => {
                                const course = courses.find(c => c.id === t.courseId);
                                const teacher = teachers.find(tr => tr.dni === t.teacherDni);
                                const classroom = classrooms.find(cr => cr.id === t.classroomId);
                                const sch = schedules.find(s => s.id === t.scheduleId);
                                const groupName = groups.find(g => g.id === t.groupId)?.name || t.groupId;
                                
                                return (
                                  <tr key={t.id} className="hover:bg-slate-50/50">
                                    <td className="p-3 font-black text-[#9F062A]">Grupo {groupName}</td>
                                    <td className="p-3">
                                      <div className="font-bold text-slate-900">{course?.name || t.courseId}</div>
                                      <div className="text-[9px] text-slate-450 font-black font-mono mt-0.5">{course?.code || "CÓDIGO"}</div>
                                    </td>
                                    <td className="p-3 font-bold text-slate-750">
                                      {teacher ? `${teacher.lastName}, ${teacher.name}` : t.teacherDni}
                                    </td>
                                    <td className="p-3">
                                      <span className={`text-[8.5px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                                        t.sessionType === "Laboratorio"
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                                          : "bg-sky-50 text-sky-800 border-sky-250"
                                      }`}>
                                        {t.sessionType}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-slate-850">{classroom?.name || t.classroomId}</div>
                                      <div className="text-[9.5px] text-slate-400 font-medium">{classroom?.location || "Pabellón"}</div>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-slate-500">
                                      {sch ? (
                                        <span>{sch.dayOfWeek} • {sch.startTime ? `${sch.startTime} - ${sch.endTime}` : sch.timeSlot}</span>
                                      ) : "-"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                </PageTransition>
              );
            })()}

            {/* TAB: REPORTS (11) */}
            {activeTab === "reports" && (
              <PageTransition id="reports">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  
                  {/* Recharts BarChart - Cursos en Carrera */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Cursos Asociados por Especialidad</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={careers.map(car => ({
                            name: car.code,
                            cursos: curriculum.filter(it => it.careerId === car.id).length
                          }))}
                          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" stroke="#64748B" fontSize={10} fontWeight="bold" />
                          <YAxis stroke="#64748B" fontSize={10} fontWeight="bold" />
                          <Tooltip />
                          <Bar dataKey="cursos" fill="#9F062A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Programaciones vs Disponibilidad */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 font-sans justify-between flex items-center">
                      <span>Topología de Servicios Programados</span>
                      <span className="text-[9px] font-bold text-[#9F062A] bg-[#9F062A]/10 px-2 py-0.5 rounded uppercase">Teoría vs Lab</span>
                    </h4>
                    <div className="h-64 flex items-center justify-center">
                      {tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No hay programaciones cargadas para cuantificar.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Teoría", value: tasks.filter(t => t.sessionType === "Teoría").length },
                                { name: "Laboratorio", value: tasks.filter(t => t.sessionType === "Laboratorio").length }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#9F062A" />
                              <Cell fill="#CFA020" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Auditoria / Export area */}
                  <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-[#9F062A] mx-auto opacity-80" />
                    <h4 className="text-sm font-black text-slate-900 uppercase">Exportar Reporte Oficial de Planificación</h4>
                    <p className="text-slate-500 text-xs font-medium max-w-xl mx-auto leading-relaxed">
                      Este documento contiene de manera ordenada los códigos de asignaturas vinculados, docentes, horarios y laboratorios, listo para ser entregado a la Mesa Académica Institucional del IESTP San Francisco de Asís.
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          const printWindow = window.open("", "_blank");
                          if (!printWindow) {
                            alert("Por favor habilitar ventanas emergentes para continuar.");
                            return;
                          }
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Reporte de Planificación Académica - MPA SFA</title>
                                <style>
                                  body { font-family: sans-serif; padding: 30px; font-size: 13px; line-height: 1.5; color: #333; }
                                  h1 { color: #8B0026; margin-bottom: 5px; font-size: 20px; text-transform: uppercase; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                  th { bg-color: #f5f5f5; font-weight: bold; }
                                </style>
                              </head>
                              <body>
                                <h1>IESTP San Francisco de Asís</h1>
                                <p><strong>MÓDULO DE PLANIFICACIÓN ACADÉMICA (MPA)</strong></p>
                                <p>Fecha de emisión: ${new Date().toLocaleDateString("es-PE")} | Total clases: ${tasks.length}</p>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Grupo</th>
                                      <th>Asignatura</th>
                                      <th>Docente</th>
                                      <th>Tipo</th>
                                      <th>Aula</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${tasks.map(t => {
                                      const gName = groups.find(x => x.id === t.groupId)?.name || t.groupId;
                                      const cName = courses.find(x => x.id === t.courseId)?.name || t.courseId;
                                      const tName = teachers.find(x => x.dni === t.teacherDni)?.name || t.teacherDni;
                                      const rName = classrooms.find(x => x.id === t.classroomId)?.name || t.classroomId;
                                      return `
                                        <tr>
                                          <td><strong>${gName}</strong></td>
                                          <td>${cName}</td>
                                          <td>${tName}</td>
                                          <td>${t.sessionType}</td>
                                          <td>${rName}</td>
                                        </tr>
                                      `;
                                    }).join("")}
                                  </tbody>
                                </table>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }}
                        className="bg-[#9F062A] hover:bg-[#800521] text-white py-2.5 px-6 rounded font-black uppercase text-[10.5px] tracking-widest shadow-md transition-all cursor-pointer"
                      >
                        Generar Reporte Imprimible
                      </button>
                    </div>
                  </div>

                </div>
              </PageTransition>
            )}

            {/* TAB: SOPORTE (12) */}
            {activeTab === "support" && (
              <PageTransition id="support">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
                  
                  {/* Formulario de Consultas */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Nueva Consulta</h3>
                    <form onSubmit={handleAddTicket} className="space-y-4 text-xs font-semibold">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Tema de Solicitud *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: Conflicto de Disponibilidad de Aula 302" 
                          value={newTicketSubject}
                          onChange={(e) => setNewTicketSubject(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase">Detalle del Requerimiento en MPA *</label>
                        <textarea 
                          required 
                          rows={4}
                          placeholder="Escriba los pormenores técnicos del cruce de docentes, cambio en la malla o inconvenientes experimentados..." 
                          value={newTicketText}
                          onChange={(e) => setNewTicketText(e.target.value)}
                          className="w-full mt-1 p-2.5 bg-slate-50 border rounded-md"
                        ></textarea>
                      </div>

                      <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                        Enviar Consulta a Soporte Académico
                      </Button>
                    </form>
                  </div>

                  {/* Historial de Tickets */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Mis Tickets de Asistencia</h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {supportTickets.map(item => (
                        <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                          <div className="flex justify-between items-center border-b pb-2">
                            <div>
                              <span className="text-xs font-black text-slate-900 leading-tight uppercase block">{item.subject}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Enviado: {item.date}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                              item.reply 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}>
                              {item.reply ? "CONTESTADO" : "PENDIENTE"}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white border p-2.5 rounded italic">
                            "{item.text}"
                          </p>
                          
                          {item.reply && (
                            <div className="p-3 bg-[#9F062A]/5 border border-[#9F062A]/10 rounded text-xs font-semibold leading-relaxed">
                              <span className="block text-[8.5px] font-black text-[#9F062A] tracking-wider uppercase mb-1">Respuesta de Mesa Ácademica / SFA:</span>
                              <p className="text-slate-700">{item.reply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </PageTransition>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

