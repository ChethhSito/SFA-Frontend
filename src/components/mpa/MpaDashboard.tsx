import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, BookOpen, User, Users, Clipboard, MapPin, Clock, BarChart3, HelpCircle, GraduationCap, Layers
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { 
  MpaPeriod, MpaCareer, MpaCourse, MpaCurriculumItem, MpaShift, 
  MpaSchedule, MpaClassroom, MpaAcademicGroup, MpaProgramTask 
} from "../../types";
import Sidebar from "../ui/Sidebar";
import { MPA_KEYS, MpaKey, fetchMpaCollections, saveMpaCollection } from "../../services/mpaApi";

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
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");
  const pendingSaves = useRef<Partial<Record<MpaKey, Promise<unknown>>>>({});

  // Load the existing academic data from the backend.
  useEffect(() => {

    const setters: Record<MpaKey, Function> = {
      periods: setPeriods, careers: setCareers, courses: setCourses,
      curriculum: setCurriculum, curriculum_versions: setCurriculumVersions,
      shifts: setShifts, schedules: setSchedules, classrooms: setClassrooms,
      groups: setGroups, teachers: setTeachers, tasks: setTasks,
    };
    let active = true;
    async function loadMpa() {
      try {
        const collections = await fetchMpaCollections();
        if (!active) return;
        MPA_KEYS.forEach(key => {
          setters[key](collections[key]);
          localStorage.setItem(`mpa_db_${key}`, JSON.stringify(collections[key]));
        });
        setSyncError("");
      } catch (error) {
        if (!active) return;
        setSyncError(`Sin conexión con el backend MPA: ${error instanceof Error ? error.message : "error desconocido"}. No se cargaron los datos académicos.`);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMpa();
    return () => { active = false; };
  }, []);

  const saveDb = (key: string, value: any, setter: Function) => {
    setter(value);
    localStorage.setItem(`mpa_db_${key}`, JSON.stringify(value));
    if (!MPA_KEYS.includes(key as MpaKey)) return;
    const mpaKey = key as MpaKey;
    const previous = pendingSaves.current[mpaKey] || Promise.resolve();
    const next = previous.catch(() => undefined).then(() => saveMpaCollection(mpaKey, value));
    pendingSaves.current[mpaKey] = next;
    void next.then(() => setSyncError(""), error => {
      setSyncError(`No se guardó ${mpaKey} en el backend: ${error instanceof Error ? error.message : "error desconocido"}. La copia local sigue disponible.`);
    });
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

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 min-w-0">
        {syncError && <div role="alert" className="bg-amber-50 text-amber-900 px-6 py-2 text-xs font-semibold border-b border-amber-200">{syncError}</div>}
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

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain relative">
          {loading ? <div className="p-8 text-sm text-slate-600">Cargando planificación académica...</div> : (
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
          )}
        </div>
      </main>
    </div>
  );
}
