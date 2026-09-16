import React, { useState, useEffect, useMemo } from "react";
import { 
  User, FileText, Calendar, BookOpen, Clock, Award, HelpCircle, Building, ClipboardList
} from "lucide-react";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CycleStatus, AttendanceRecord, Graduation, CourseEvaluation } from "../../types";
import { ACADEMIC_PROGRAMS } from "../../mockData";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "../ui/Sidebar";

import { WelcomeTab } from "./tabs/WelcomeTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { ClassesTab } from "./tabs/ClassesTab";
import { ScheduleTab } from "./tabs/ScheduleTab";
import { AttendanceTab } from "./tabs/AttendanceTab";
import { ClosureTab } from "./tabs/ClosureTab";
import { GradesTab } from "./tabs/GradesTab";

interface AlumnoDashboardProps {
  studentDni: string;
  personalData: StudentPersonalData;
  enrollment: Enrollment;
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  cycleStatuses: CycleStatus[];
  graduation: Graduation | undefined;
  onUpdatePersonal: (data: StudentPersonalData) => void;
  onUpdateEnrollment: (enroll: Enrollment) => void;
  onUpdateAssignments: (asgs: CourseAssignment[]) => void;
  onLogout: () => void;
}

export default function AlumnoDashboard({
  studentDni,
  personalData,
  enrollment,
  courses,
  materials,
  assignments,
  evaluations,
  attendance,
  cycleStatuses,
  graduation,
  onUpdatePersonal,
  onUpdateEnrollment,
  onUpdateAssignments,
  onLogout
}: AlumnoDashboardProps) {
  const [activeTab, setActiveTab] = useState<"welcome" | "profile" | "classes" | "schedule" | "attendance" | "closure" | "notas">("welcome");
  
  // Profile edit form fields
  const [profileForm, setProfileForm] = useState<StudentPersonalData>({ ...personalData });
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  
  // Outstanding billing simulation state
  const [isPaidInvoice, setIsPaidInvoice] = useState(false);
  const [paymentOp, setPaymentOp] = useState(enrollment.paymentOperation || "");
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  // Sub-tab selection inside Profile View (Carga de Documentos / Historial de Pagos / Datos Académicos)
  const [profileInnerTab, setProfileInnerTab] = useState<"docs" | "payments" | "academic">("docs");

  // State members for interactive Consulta Académica multi-sidebar view
  const [selectedQueryCycle, setSelectedQueryCycle] = useState<"I" | "II" | "III" | "IV" | "V">("V");
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({
    circuits: 18,
    machines: 16,
    automatic: 15,
    installations: 17,
    management: 16,
  });
  
  // Custom states for Image 1 and Image 2 High Fidelity replication
  const [expandedAttendanceCourse, setExpandedAttendanceCourse] = useState<string | null>("redes");
  const [selectedAcademicOption, setSelectedAcademicOption] = useState<string>("plan_curricular");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>("01");
  const [selectedPlan, setSelectedPlan] = useState<string>("52");
  const [selectedQueryPeriod, setSelectedQueryPeriod] = useState<string>("2026-I");
  const [selectedAttendanceSemester, setSelectedAttendanceSemester] = useState<string>("2026-I");
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<string>("");

  // Aula Virtual substates
  const [activeCourseSection, setActiveCourseSection] = useState<"general" | "horarios" | "week" | "cierre">("general");
  const [selectedClassWeek, setSelectedClassWeek] = useState<number>(1);
  const [selectedClassWeekOption, setSelectedClassWeekOption] = useState<"asistencia" | "materiales" | "tareas" | "evaluaciones" | "observaciones" | "evidencias">("materiales");
  const [simulationHWFiles, setSimulationHWFiles] = useState<Record<string, string>>({});
  const [expandedStudentWeeks, setExpandedStudentWeeks] = useState<Record<number, boolean>>({ 1: true });

  // Academic advisory mailbox simulation
  const [advisorConsultText, setAdvisorConsultText] = useState("");
  const [advisorConsultSuccess, setAdvisorConsultSuccess] = useState(false);

  useEffect(() => {
    setProfileForm({ ...personalData });
  }, [personalData]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePersonal(profileForm);
    setProfileSavedMsg("¡Sus datos de estudiante fueron actualizados en el sistema rector de la intranet!");
    setTimeout(() => setProfileSavedMsg(""), 4000);
  };

  const simulateDocUpload = (docKey: "dniFile" | "certificadoFile" | "partidaFile" | "fotoFile", name: string) => {
    const updatedDocs = { ...enrollment.docs };
    updatedDocs[docKey] = {
      status: "Pendiente" as const,
      fileName: name
    };
    const updated = { ...enrollment, docs: updatedDocs };
    onUpdateEnrollment(updated);
  };

  const handlePayInvoice = () => {
    setIsPaidInvoice(true);
    alert("Simulación: ¡Pago de S/. 450.00 realizado satisfactoriamente mediante pasarela virtual de pagos! Su cuenta está al día.");
  };

  const currentProgram = ACADEMIC_PROGRAMS.find((p) => p.id === enrollment.programId);

  // Dynamic integration of MAMC curriculum and MPA academic programming / schedule
  const mpaPlanningData = useMemo(() => {
    try {
      const tasksRaw = localStorage.getItem("mpa_db_tasks");
      const coursesRaw = localStorage.getItem("mpa_db_courses");
      const schedulesRaw = localStorage.getItem("mpa_db_schedules");
      const groupsRaw = localStorage.getItem("mpa_db_groups");
      const teachersRaw = localStorage.getItem("mpa_db_teachers");
      const classroomsRaw = localStorage.getItem("mpa_db_classrooms");

      return {
        tasks: tasksRaw ? JSON.parse(tasksRaw) : [],
        courses: coursesRaw ? JSON.parse(coursesRaw) : [],
        schedules: schedulesRaw ? JSON.parse(schedulesRaw) : [],
        groups: groupsRaw ? JSON.parse(groupsRaw) : [],
        teachers: teachersRaw ? JSON.parse(teachersRaw) : [],
        classrooms: classroomsRaw ? JSON.parse(classroomsRaw) : []
      };
    } catch (e) {
      console.error("Error loading MPA data in AlumnoDashboard:", e);
      return { tasks: [], courses: [], schedules: [], groups: [], teachers: [], classrooms: [] };
    }
  }, []);

  // Map student shift and career to find their registered group in MPA
  const studentGroup = useMemo(() => {
    const shiftMapped = enrollment.shift === "Mañana" ? "sh_m" : enrollment.shift === "Tarde" ? "sh_t" : "sh_n";
    return mpaPlanningData.groups.find(
      (g: any) => g.careerId === enrollment.programId && g.shiftId === shiftMapped && g.cycle === 1
    ) || mpaPlanningData.groups.find((g: any) => g.careerId === enrollment.programId && g.cycle === 1) || mpaPlanningData.groups[0];
  }, [enrollment, mpaPlanningData]);

  // Retrieve tasks (schedule sessions) assigned to this group
  const studentTasks = useMemo(() => {
    if (!studentGroup) return [];
    return mpaPlanningData.tasks.filter((t: any) => t.groupId === studentGroup.id);
  }, [studentGroup, mpaPlanningData]);

  // Build dynamic courses list combining MAMC/MPA Malla and Programación
  const dynamicMpaCourses = useMemo(() => {
    if (studentTasks.length === 0) return [];

    const uniqueCourseIds = Array.from(new Set(studentTasks.map((t: any) => t.courseId)));
    
    return uniqueCourseIds.map((courseId: any) => {
      const courseObj = mpaPlanningData.courses.find((c: any) => c.id === courseId);
      const associatedTasks = studentTasks.filter((t: any) => t.courseId === courseId);
      const primaryTask = associatedTasks[0];
      
      const teacherObj = mpaPlanningData.teachers.find((t: any) => t.dni === primaryTask?.teacherDni);
      const classroomObj = mpaPlanningData.classrooms.find((c: any) => c.id === primaryTask?.classroomId);

      const courseName = courseObj ? courseObj.name : "Unidad Didáctica";
      const courseCode = courseObj ? courseObj.code : (courseId || "UD-101");
      const credits = courseObj ? courseObj.credits : (primaryTask?.pedagogicalHours || 4);
      const classroomName = classroomObj ? classroomObj.name : "Aula Virtual";
      const teacherFullName = teacherObj ? `${teacherObj.name} ${teacherObj.lastName}` : "Docente Principal";

      const scheduleText = associatedTasks.map((t: any) => {
        return `${t.dayOfWeek || "Lunes"} ${t.startTime || "08:00 AM"} - ${t.endTime || "01:00 PM"}`;
      }).join(" / ");

      return {
        id: `cur-${courseId}`,
        name: courseName,
        code: courseCode,
        credits: credits,
        classroom: classroomName,
        schedule: scheduleText,
        teacherDni: primaryTask?.teacherDni || "docente",
        teacherName: teacherFullName,
        career: enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad",
        group: studentGroup?.name || "Grupo A",
        cycle: "Ciclo I",
        startDate: "2026-08-18",
        endDate: "2026-12-15",
        studentCount: studentGroup?.capacity || 30,
        description: `Unidad didáctica curricular matriculada. Plan de estudios de la carrera técnica de ${enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}.`,
        formula: "NF = (EP1 * 0.20) + (TR1 * 0.15) + (EC1 * 0.15) + (PF1 * 0.50)"
      };
    });
  }, [studentTasks, mpaPlanningData, enrollment, studentGroup]);

  const enrolledCourses = courses.filter((c) => {
    if (enrollment.programId === "electronica") {
      return c.career === "Electricidad Industrial" || c.code.toLowerCase().startsWith("ee");
    } else {
      return c.career === "Contabilidad" || c.code.toLowerCase().startsWith("co") || c.code.toLowerCase().startsWith("cf");
    }
  });

  const studentCourses = dynamicMpaCourses.length > 0 ? dynamicMpaCourses : (enrolledCourses.length > 0 ? enrolledCourses : courses);

  const enrichedCourses = studentCourses.map((c) => {
    let iconType = "BarChart3";
    if (c.code.includes("101") || c.name.toLowerCase().includes("automatización") || c.name.toLowerCase().includes("control")) {
      iconType = "Cpu";
    } else if (c.code.includes("403") || c.name.toLowerCase().includes("circuitos") || c.name.toLowerCase().includes("instalaciones")) {
      iconType = "Zap";
    } else if (c.code.includes("502") || c.name.toLowerCase().includes("maquinaria") || c.name.toLowerCase().includes("potencia") || c.name.toLowerCase().includes("motores")) {
      iconType = "Sliders";
    }

    let description = c.description || `Unidad didáctica del plan curricular para la carrera de ${currentProgram?.name || "Electricidad Industrial"}. Enfocada en desarrollar competencias profesionales esenciales del sector tecnológico nacional.`;

    let formula = "NF = (EP1 * 0.20) + (TR1 * 0.15) + (EC1 * 0.15) + (PF1 * 0.50)";
    if (c.id === "cur-elec-2" || c.code.includes("403")) {
      formula = "NF = (ED1 * 0.30) + (TR1 * 0.20) + (EC1 * 0.10) + (EF1 * 0.40)";
    } else if (c.id === "cur-elec-3" || c.code.includes("502")) {
      formula = "NF = (EP1 * 0.25) + (LB1 * 0.25) + (AC1 * 0.10) + (PF1 * 0.40)";
    }

    let evaluationsList = [
      { name: "Examen Parcial", sub: "Realizado en Octubre", prefix: "EP1", weight: "20%", grade: "15" },
      { name: "Trabajo Continuo I", sub: "Informe Técnico / Monografías", prefix: "TR1", weight: "15%", grade: "18" },
      { name: "Evaluación Diaria", sub: "Desempeño y quizzes de taller", prefix: "EC1", weight: "15%", grade: "16" },
      { name: "Proyecto Final", sub: "Entrega prevista semana final", prefix: "PF1", weight: "50%", grade: "NR" }
    ];

    if (c.id === "cur-elec-2" || c.code.includes("403")) {
      evaluationsList = [
        { name: "Evaluación Diagnóstica", sub: "Realizado en Octubre", prefix: "ED1", weight: "30%", grade: "16" },
        { name: "Trabajo de Campo I", sub: "Conexiones de Transferencia", prefix: "TR1", weight: "20%", grade: "14" },
        { name: "Desempeño Continuo", sub: "Evaluación presencial", prefix: "EC1", weight: "10%", grade: "15" },
        { name: "Examen Final Teórico-Práctico", sub: "Ejecución presencial de circuito", prefix: "EF1", weight: "40%", grade: "NR" }
      ];
    } else if (c.id === "cur-elec-3" || c.code.includes("502")) {
      evaluationsList = [
        { name: "Examen Parcial Escrito", sub: "Realizado en Octubre", prefix: "EP1", weight: "25%", grade: "13" },
        { name: "Informes de Laboratorio", sub: "Suma de guías completadas", prefix: "LB1", weight: "25%", grade: "15" },
        { name: "Asistencia y Participación", sub: "Evaluación continua del docente", prefix: "AC1", weight: "10%", grade: "17" },
        { name: "Proyecto Armado de Robot", sub: "Sustentación en semana final", prefix: "PF1", weight: "40%", grade: "NR" }
      ];
    }

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      cycle: c.cycle || "Ciclo V",
      classroom: c.classroom || "Aula Virtual",
      credits: c.credits,
      schedule: c.schedule,
      group: c.group || "Grupo A",
      curriculum: c.curriculum || "Diseño Curricular 2026",
      studentCount: c.studentCount || 5,
      iconType,
      description,
      formula,
      evaluations: evaluationsList
    };
  });

  return (
    <div id="alumno-portal" className="h-screen w-full overflow-hidden bg-[#F8F9FA] text-[#2D3748] flex flex-col md:flex-row font-sans antialiased">
      {/* LEFT SIDEBAR */}
      <Sidebar
        institution={{
          name: "IESTP SFA",
          subtitle: "Intranet Académica"
        }}
        user={{
          name: `${personalData.name} ${personalData.lastName}`,
          role: currentProgram?.name || "Estudiante",
          status: enrollment.academicStatus,
        }}
        sections={[
          {
            title: "MENÚ PRINCIPAL",
            items: [
              {
                label: "Institucional",
                icon: <Building className="w-4 h-4" />,
                route: "welcome",
                active: activeTab === "welcome"
              },
              {
                label: "Información Personal",
                icon: <User className="w-4 h-4" />,
                route: "profile",
                active: activeTab === "profile"
              }
            ]
          },
          {
            title: "ACADÉMICO",
            items: [
              {
                label: "Mi Horario",
                icon: <Calendar className="w-4 h-4" />,
                route: "schedule",
                active: activeTab === "schedule"
              },
              {
                label: "Mis Cursos",
                icon: <BookOpen className="w-4 h-4" />,
                route: "classes",
                active: activeTab === "classes"
              },
              {
                label: "Mis Calificaciones",
                icon: <Award className="w-4 h-4" />,
                route: "notas",
                active: activeTab === "notas"
              },
              {
                label: "Control de Asistencia",
                icon: <Clock className="w-4 h-4" />,
                route: "attendance",
                active: activeTab === "attendance"
              },
              {
                label: "Consulta Académica",
                icon: <ClipboardList className="w-4 h-4" />,
                route: "closure",
                active: activeTab === "closure"
              }
            ]
          },
          {
            title: "SERVICIOS",
            items: [
              {
                label: "Trámites de Secretaría",
                icon: <FileText className="w-4 h-4" />,
                route: "secretaria",
                active: false
              },
              {
                label: "Guías Académicas",
                icon: <HelpCircle className="w-4 h-4" />,
                route: "guias",
                active: false
              }
            ]
          }
        ]}
        onItemClick={(route) => {
          if (route === "secretaria") {
            alert("Simulación: Abriendo sección de trámites rápidos de secretaría académica sfa online...");
          } else if (route === "guias") {
            alert("Simulación: Abriendo repositorio de guías para el alumno...");
          } else {
            setActiveTab(route as any);
          }
        }}
        onLogout={onLogout}
      />

      {/* MAIN VIEWPORT SCROLL AREA */}
      <main className="flex-1 overflow-y-auto h-full p-4 md:p-8 custom-scrollbar bg-[#F8F9FA]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 max-w-7xl mx-auto"
          >
            {activeTab === "welcome" && (
              <WelcomeTab
                personalData={personalData}
                currentProgram={currentProgram}
                enrollment={enrollment}
                setActiveTab={setActiveTab}
                setProfileInnerTab={setProfileInnerTab}
              />
            )}

            {activeTab === "profile" && (
              <ProfileTab
                personalData={personalData}
                enrollment={enrollment}
                currentProgram={currentProgram}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                profileSavedMsg={profileSavedMsg}
                handleSaveProfile={handleSaveProfile}
                profileInnerTab={profileInnerTab}
                setProfileInnerTab={setProfileInnerTab}
                simulateDocUpload={simulateDocUpload}
                isPaidInvoice={isPaidInvoice}
                paymentOp={paymentOp}
                setPaymentOp={setPaymentOp}
                paySuccessMsg={paySuccessMsg}
                handlePayInvoice={handlePayInvoice}
                onUpdateEnrollment={onUpdateEnrollment}
                graduation={graduation}
              />
            )}

            {activeTab === "classes" && (
              <ClassesTab
                enrichedCourses={enrichedCourses}
                currentProgram={currentProgram}
                selectedCourseDetail={selectedCourseDetail}
                setSelectedCourseDetail={setSelectedCourseDetail}
                activeCourseSection={activeCourseSection}
                setActiveCourseSection={setActiveCourseSection}
                selectedClassWeek={selectedClassWeek}
                setSelectedClassWeek={setSelectedClassWeek}
                selectedClassWeekOption={selectedClassWeekOption}
                setSelectedClassWeekOption={setSelectedClassWeekOption}
                simulationHWFiles={simulationHWFiles}
                setSimulationHWFiles={setSimulationHWFiles}
                expandedStudentWeeks={expandedStudentWeeks}
                setExpandedStudentWeeks={setExpandedStudentWeeks}
                materials={materials}
                assignments={assignments}
                evaluations={evaluations}
                studentDni={studentDni}
                personalData={personalData}
                onUpdateAssignments={onUpdateAssignments}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleTab
                personalData={personalData}
                currentProgram={currentProgram}
                studentTasks={studentTasks}
                mpaPlanningData={mpaPlanningData}
              />
            )}

            {activeTab === "attendance" && (
              <AttendanceTab
                enrollment={enrollment}
                selectedAttendanceSemester={selectedAttendanceSemester}
                setSelectedAttendanceSemester={setSelectedAttendanceSemester}
                expandedAttendanceCourse={expandedAttendanceCourse}
                setExpandedAttendanceCourse={setExpandedAttendanceCourse}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "closure" && (
              <ClosureTab
                personalData={personalData}
                enrollment={enrollment}
                currentProgram={currentProgram}
                selectedAcademicOption={selectedAcademicOption}
                setSelectedAcademicOption={setSelectedAcademicOption}
                selectedSemesterFilter={selectedSemesterFilter}
                setSelectedSemesterFilter={setSelectedSemesterFilter}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                selectedQueryPeriod={selectedQueryPeriod}
                setSelectedQueryPeriod={setSelectedQueryPeriod}
                selectedQueryCycle={selectedQueryCycle}
                setSelectedQueryCycle={setSelectedQueryCycle}
                simulatedGrades={simulatedGrades}
                setSimulatedGrades={setSimulatedGrades}
                advisorConsultText={advisorConsultText}
                setAdvisorConsultText={setAdvisorConsultText}
                advisorConsultSuccess={advisorConsultSuccess}
                setAdvisorConsultSuccess={setAdvisorConsultSuccess}
                cycleStatuses={cycleStatuses}
              />
            )}

            {activeTab === "notas" && (
              <GradesTab
                enrichedCourses={enrichedCourses}
                selectedCourseDetail={selectedCourseDetail}
                setSelectedCourseDetail={setSelectedCourseDetail}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
