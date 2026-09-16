import React, { useState, useEffect } from "react";
import { 
  Calendar, BookOpen, User, Users, Clipboard, MapPin, Clock, BarChart3, HelpCircle, GraduationCap, Layers
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { 
  MpaPeriod, MpaCareer, MpaCourse, MpaCurriculumItem, MpaShift, 
  MpaSchedule, MpaClassroom, MpaAcademicGroup, MpaProgramTask 
} from "../../types";
import { REAL_MPA_CAREERS, REAL_MPA_COURSES } from "../../mockData";
import Sidebar from "../ui/Sidebar";

// Tab Subcomponents
import { PeriodsTab } from "./tabs/PeriodsTab";
import { CareersTab } from "./tabs/CareersTab";
import { CoursesTab } from "./tabs/CoursesTab";
import { CurriculumTab, MpaCurriculumVersion } from "./tabs/CurriculumTab";
import { TeachersTab } from "./tabs/TeachersTab";
import { ClassroomsTab } from "./tabs/ClassroomsTab";
import { ShiftsTab } from "./tabs/ShiftsTab";
import { GroupsTab } from "./tabs/GroupsTab";
import { ProgramTab } from "./tabs/ProgramTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { SupportTab } from "./tabs/SupportTab";

// Default initial data for Módulo de Planificación Académica (MPA)
const DEFAULT_PERIODS: MpaPeriod[] = [];
const DEFAULT_CAREERS: MpaCareer[] = [];
const DEFAULT_COURSES: MpaCourse[] = [];
const DEFAULT_CURRICULUM_VERSIONS: MpaCurriculumVersion[] = [];
const DEFAULT_CURRICULUM: MpaCurriculumItem[] = [];
const DEFAULT_SHIFTS: MpaShift[] = [];
const DEFAULT_SCHEDULES: MpaSchedule[] = [];
const DEFAULT_CLASSROOMS: MpaClassroom[] = [];
const DEFAULT_GROUPS: MpaAcademicGroup[] = [];
const DEFAULT_TEACHERS: any[] = [];
const DEFAULT_TASKS: MpaProgramTask[] = [];

interface MpaDashboardProps {
  onLogout: () => void;
}

export default function MpaDashboard({ onLogout }: MpaDashboardProps) {
  // Navigation tabs of MPA
  const [activeTab, setActiveTab] = useState<
    "periods" | "careers" | "courses" | "curriculum" | "teachers" |
    "classrooms" | "shifts" | "groups" | "program" | "reports" | "support"
  >("periods");

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

      // 10. Predefined Schedules
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

      // 11. Preloaded Academic Programming Tasks
      const defaultTasks = [
        {
          id: "task_con_1",
          groupId: "gp_con_p1",
          courseId: "con_p1_5",
          teacherDni: "10101010",
          classroomId: "cr_101",
          scheduleId: "sch_m1",
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
          courseId: "con_p1_6",
          teacherDni: "10101010",
          classroomId: "cr_102",
          scheduleId: "sch_m2",
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
          courseId: "con_p1_1",
          teacherDni: "30303030",
          classroomId: "cr_101",
          scheduleId: "sch_m3",
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
          courseId: "con_p1_7",
          teacherDni: "10101010",
          classroomId: "cr_lab_c",
          scheduleId: "sch_m4",
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
          courseId: "con_p1_4",
          teacherDni: "30303030",
          classroomId: "cr_lab_c",
          scheduleId: "sch_m5",
          sessionType: "Laboratorio",
          sessionClassType: "Lab",
          dayOfWeek: "Viernes",
          startTime: "08:00 AM",
          endTime: "01:00 PM",
          shiftId: "sh_m",
          pedagogicalHours: 6
        },
        {
          id: "task_ele_1",
          groupId: "gp_ele_p1",
          courseId: "ele_p1_1",
          teacherDni: "20202020",
          classroomId: "cr_lab_e",
          scheduleId: "sch_n1",
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
          courseId: "ele_p1_2",
          teacherDni: "20202020",
          classroomId: "cr_lab_e",
          scheduleId: "sch_n2",
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
          courseId: "ele_p1_6",
          teacherDni: "30303030",
          classroomId: "cr_101",
          scheduleId: "sch_n3",
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
          courseId: "ele_p1_3",
          teacherDni: "20202020",
          classroomId: "cr_lab_e",
          scheduleId: "sch_n4",
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
          courseId: "ele_p1_7",
          teacherDni: "30303030",
          classroomId: "cr_lab_c",
          scheduleId: "sch_n5",
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
    setSchedules(getSaved("schedules", DEFAULT_SCHEDULES));
    setClassrooms(getSaved("classrooms", DEFAULT_CLASSROOMS));
    setGroups(getSaved("groups", DEFAULT_GROUPS));
    setTeachers(getSaved("teachers", DEFAULT_TEACHERS));
    setTasks(getSaved("tasks", DEFAULT_TASKS));
  }, []);

  const saveDb = (key: string, value: any, setter: Function) => {
    setter(value);
    localStorage.setItem(`mpa_db_${key}`, JSON.stringify(value));
  };

  // Institutional states
  const [pedagogicalHourDuration, setPedagogicalHourDuration] = useState<number>(() => {
    const saved = localStorage.getItem("mpa_pedagogical_hour_duration");
    return saved ? parseInt(saved, 10) : 50;
  });

  const savePedagogicalHourDuration = (duration: number) => {
    setPedagogicalHourDuration(duration);
    localStorage.setItem("mpa_pedagogical_hour_duration", duration.toString());
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
              {activeTab === "shifts" && "7. Gestión de Turnos y Horarios"}
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
            {activeTab === "periods" && (
              <PeriodsTab 
                periods={periods}
                saveDb={saveDb}
                setPeriods={setPeriods}
              />
            )}

            {activeTab === "careers" && (
              <CareersTab 
                careers={careers}
                curriculum={curriculum}
                groups={groups}
                tasks={tasks}
                saveDb={saveDb}
                setCareers={setCareers}
              />
            )}

            {activeTab === "courses" && (
              <CoursesTab 
                courses={courses}
                careers={careers}
                curriculum={curriculum}
                tasks={tasks}
                saveDb={saveDb}
                setCourses={setCourses}
              />
            )}

            {activeTab === "curriculum" && (
              <CurriculumTab 
                careers={careers}
                courses={courses}
                curriculum={curriculum}
                curriculumVersions={curriculumVersions}
                saveDb={saveDb}
                setCurriculum={setCurriculum}
                setCurriculumVersions={setCurriculumVersions}
              />
            )}

            {activeTab === "teachers" && (
              <TeachersTab 
                teachers={teachers}
                careers={careers}
                tasks={tasks}
                saveDb={saveDb}
                setTeachers={setTeachers}
              />
            )}

            {activeTab === "classrooms" && (
              <ClassroomsTab 
                classrooms={classrooms}
                careers={careers}
                tasks={tasks}
                saveDb={saveDb}
                setClassrooms={setClassrooms}
              />
            )}

            {activeTab === "shifts" && (
              <ShiftsTab 
                shifts={shifts}
                schedules={schedules}
                saveDb={saveDb}
                setShifts={setShifts}
                setSchedules={setSchedules}
              />
            )}

            {activeTab === "groups" && (
              <GroupsTab 
                groups={groups}
                periods={periods}
                careers={careers}
                shifts={shifts}
                curriculumVersions={curriculumVersions}
                tasks={tasks}
                schedules={schedules}
                courses={courses}
                classrooms={classrooms}
                teachers={teachers}
                saveDb={saveDb}
                setGroups={setGroups}
              />
            )}

            {activeTab === "program" && (
              <ProgramTab 
                groups={groups}
                periods={periods}
                careers={careers}
                courses={courses}
                curriculum={curriculum}
                curriculumVersions={curriculumVersions}
                shifts={shifts}
                classrooms={classrooms}
                teachers={teachers}
                tasks={tasks}
                schedules={schedules}
                pedagogicalHourDuration={pedagogicalHourDuration}
                savePedagogicalHourDuration={savePedagogicalHourDuration}
                saveDb={saveDb}
                setTasks={setTasks}
              />
            )}

            {activeTab === "reports" && (
              <ReportsTab 
                careers={careers}
                curriculum={curriculum}
                tasks={tasks}
                groups={groups}
                courses={courses}
                teachers={teachers}
                classrooms={classrooms}
              />
            )}

            {activeTab === "support" && (
              <SupportTab />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
