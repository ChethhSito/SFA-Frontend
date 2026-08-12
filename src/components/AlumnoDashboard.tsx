import React, { useState, useEffect } from "react";
import { 
  User, FileText, CreditCard, Calendar, BookOpen, Clock, 
  CheckCircle, CheckCircle2, XCircle, AlertCircle, Upload, LogOut, ArrowRight, Save, Download,
  Printer, Award, HelpCircle, GraduationCap, Building, Wallet, Flame,
  ChevronRight, MessageSquare, ChevronDown, Check, Briefcase, Mail, Info, ShieldAlert,
  Sliders, ClipboardList, MapPin, AlertTriangle, Zap, Cpu
} from "lucide-react";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CycleStatus, AttendanceRecord, Graduation, CourseEvaluation } from "@/types";
import { ACADEMIC_PROGRAMS } from "@/lib/mockData";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./ui-custom/Sidebar";
import PageTransition from "./ui-custom/PageTransition";

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
  const [activeTab, setActiveTab] = useState<"welcome" | "profile" | "classes" | "schedule" | "attendance" | "closure">("welcome");
  
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
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<string>("Inteligencia de Negocios");

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
  const enrolledCourses = courses.filter((c) => {
    return enrollment.programId === "electronica" ? c.code.startsWith("EE") : c.code.startsWith("CF");
  });

  return (
    <div id="alumno-portal" className="h-screen w-full overflow-hidden bg-[#F8F9FA] text-[#2D3748] flex flex-col md:flex-row font-sans antialiased">
      
      {/* LEFT SIDEBAR (LIGHT WOODEN/WHITE DESIGN THEME FROM SCREENSHOTS) */}
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
                label: "Control de Asistencia",
                icon: <Clock className="w-4 h-4" />,
                route: "attendance",
                active: activeTab === "attendance"
              },
              {
                label: "Consulta Académica",
                icon: <Award className="w-4 h-4" />,
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
            
            {/* VIEW 1: WELCOME / INSTITUCIONAL (Reference 1) */}
            {activeTab === "welcome" && (
              <PageTransition id="welcome" className="space-y-6">
                
                {/* Crimson Welcome Banner */}
                <div className="relative bg-[#800521] text-white rounded-xl shadow-lg p-6 md:p-8 overflow-hidden border-b-4 border-amber-500">
                  <div className="absolute top-0 right-0 w-64 h-full bg-linear-gradient(135deg,transparent,rgba(255,255,255,0.05)) transform skew-x-12" />
                  <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[10px] bg-red-900/60 text-amber-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-block border border-red-700/50">
                      Dashboard de Estudiante
                    </span>
                    <h2 className="text-2xl md:text-3.5xl font-black font-display tracking-tight leading-none pt-1">
                      ¡Bienvenido de vuelta, {personalData.name}!
                    </h2>
                    <p className="text-xs text-slate-100 font-medium tracking-wide">
                      Estamos contentos de verte hoy. Revisa tus clases pendientes, el progreso de tu carrera técnica y tus estados administrativos de un vistazo.
                    </p>
                  </div>
                  <Flame className="absolute right-6 bottom-4 w-28 h-28 text-red-900/30 font-black pointer-events-none stroke-[0.5]" />
                </div>

                {/* Subgrid: At a Glance Progress + Current Balance info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Career progress card (Left Column) */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-xs relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Career at a Glance</span>
                      <span className="text-xs bg-[#800521]/10 text-[#800521] font-extrabold px-2.5 py-0.5 rounded-full">
                        65% Progreso Total
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">
                      {currentProgram?.name || "Electricidad Industrial"}
                    </h3>

                    {/* Horizontal Progress Meter Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
                      <div className="bg-[#800521] h-full rounded-full transition-all duration-1000" style={{ width: "65%" }} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-50">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Semestre Actual</span>
                        <span className="text-slate-805 block font-bold text-sm mt-0.5">V Semestre</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-bold">Sede Principal</span>
                        <span className="text-slate-805 block font-bold text-sm mt-0.5">Campus Central</span>
                      </div>
                      <div className="col-span-2 md:col-span-1 bg-amber-50 rounded-lg p-2 flex items-center gap-2 border border-amber-100 shrink-0">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-[8px] text-amber-700 uppercase font-black block leading-none">Próxima Clase (15 min)</span>
                          <span className="text-[10px] text-slate-800 font-bold block mt-1">Sistemas de Control II, Lab B-302</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Quick balance card (Right Column) */}
                  <div className="bg-[#FFFFFF] border border-slate-150 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Current Balance</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">S/. 0.00</span>
                        <span className="text-xs text-emerald-600 font-bold">Al día</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed">
                        No tienes pagos pendientes para el ciclo lectivo en curso. ¡Gran trabajo manteniendo tus obligaciones institucionales al día!
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTab("profile");
                        setProfileInnerTab("payments");
                      }}
                      className="w-full border border-slate-200 hover:border-[#800521] text-slate-700 hover:text-[#800521] font-bold py-2 rounded-lg text-xs text-center transition-all mt-6 cursor-pointer"
                    >
                      Ver Historial de Pagos
                    </button>
                  </div>

                </div>

                {/* Subgrid: Action Cards with Circular layout + Tareas Próximas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Column with circular quick action items */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div 
                        onClick={() => { setActiveTab("profile"); setProfileInnerTab("docs"); }}
                        className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
                      >
                        <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase block">Carga Documental</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sube tus archivos requisito</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => { setActiveTab("profile"); setProfileInnerTab("payments"); }}
                        className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
                      >
                        <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase block">Matrícula</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Proceso de inscripción regular</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => { setActiveTab("classes"); }}
                        className="bg-white hover:bg-slate-50/50 p-5 rounded-xl border border-slate-100 shadow-xs cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4 group"
                      >
                        <div className="h-10 w-10 rounded-full bg-red-50 text-[#800521] flex items-center justify-center shrink-0 font-bold group-hover:bg-[#800521] group-hover:text-white transition-all">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase block">Aula Virtual</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Accede a tus cursos y tareas</p>
                        </div>
                      </div>

                    </div>

                    {/* TAREAS PRÓXIMAS List */}
                    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-4">Tareas Próximas</span>
                      
                      <div className="space-y-3">
                        
                        <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-bold">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">Lab 04: Motores Trifásicos de Inducción</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Vence mañana • 23:59 PM • Curso Prácticas Eléctricas</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab("classes")}
                            className="bg-[#800521] hover:bg-[#9F062A] text-white font-bold text-[10px] px-3.5 py-1.5 rounded uppercase tracking-wider transition-all select-none cursor-pointer"
                          >
                            Subir
                          </button>
                        </div>

                        <div className="p-4 border border-slate-150 rounded-lg bg-white flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">Control de Lectura 02: Normativa Eléctrica</h4>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Calificado • Nota del estudiante: 18 / 20</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab("classes")}
                            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] px-3.5 py-1.5 rounded uppercase tracking-wider transition-all select-none cursor-pointer"
                          >
                            Revisar
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* RECENT NOTIFICATIONS SIDEBOARD (Right Column) */}
                  <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recent Notifications</span>
                      <span className="bg-red-100 text-[#800521] font-black text-[9px] px-2 py-0.5 rounded-full uppercase leading-none">
                        3 Nuevas
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 space-y-4 pt-1">
                      
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2 w-2 rounded-full bg-red-600 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">Cambio extraordinario de Aula</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                          La clase del taller de Electricidad Industrial II de hoy se dictará excepcionalmente en el Auditorio Central debido a mantenimientos de relés.
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Hace 2 horas</span>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">Webinar gratuito: Futuro de micro-grids</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                          Inscríbete hoy mismo a la conferencia del Dr. Santiago sobre redes eléctricas descentralizadas y almacenamiento solar.
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Hace 5 horas</span>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">Recibo digital de pensión generado</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-semibold pl-4">
                          Su comprobante mensual de cobros #10593 ha sido cargado con éxito. Estado: Al día, sin adeudos.
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1 pl-4">Ayer</span>
                      </div>

                    </div>
                  </div>

                </div>

              </PageTransition>
            )}

            {/* VIEW 2: INFORMACIÓN PERSONAL / CARGA DOCUMENTAL / PAGOS (Reference 5) */}
            {activeTab === "profile" && (
              <PageTransition id="profile" className="space-y-6">
                
                {/* Intro row */}
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight font-display mb-1">Información Personal del Estudiante</h2>
                  <p className="text-xs text-slate-500 font-semibold font-medium">Gestione sus datos de contacto, cargue los expedientes requisitarios oficiales de matrícula y verifique sus estados de cobros institucionales.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column Profile Summary Photo Card */}
                  <div className="space-y-6">
                    
                    {/* User profile details block */}
                    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-xs text-center">
                      <div className="relative inline-block mx-auto mb-4">
                        <div className="h-24 w-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-100 shadow-md">
                          <svg className="h-full w-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                          </svg>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-emerald-500 h-4 border-2 border-white w-4 rounded-full" />
                      </div>

                      <h3 className="text-base font-extrabold text-slate-800 font-display">
                        {personalData.name} {personalData.lastName}
                      </h3>
                      <p className="text-[10px] text-[#800521] uppercase tracking-widest font-black mt-1">
                        ESTUDIANTE DE {currentProgram?.name || "ELECTRICIDAD INDUSTRIAL"}
                      </p>

                      <span className="text-[9px] mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-3 py-0.5 rounded-full inline-block uppercase">
                        Matrícula Activa 2026-I
                      </span>

                      <div className="mt-6 pt-6 border-t border-slate-50 text-[11px] font-semibold text-slate-600 text-left space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">DNI Original:</span>
                          <span className="text-slate-800 font-mono font-bold">{personalData.dni}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Código Oficial:</span>
                          <span className="text-slate-800 font-mono font-bold">SFA-2026-0043</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Celular:</span>
                          <span className="text-slate-800 font-bold">{personalData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dirección:</span>
                          <span className="text-slate-800 shrink-0 text-right truncate max-w-[130px]">{personalData.address}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert("Simulación: Para cambiar sus datos de domicilio oficiales para titulación, consulte a ventanilla única de secretaría con copia certificada.")}
                        className="w-full mt-6 bg-[#800521] hover:bg-[#9F062A] text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Editar Perfil
                      </button>
                    </div>

                    {/* Pending billing crimson state block (Reference 5 style) */}
                    <div className="bg-[#800521] text-white rounded-xl p-5 shadow-sm border-l-4 border-amber-400 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-red-950/75 text-amber-300 font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">
                            Periodo 2026-I
                          </span>
                          <span className="text-slate-100 font-bold text-[10px]">Vence: 30 de Mayo</span>
                        </div>
                        <span className="text-slate-205 text-[9px] uppercase font-bold tracking-wider block">Saldo Pendiente Regularización</span>
                        <span className="text-2.5xl font-black text-amber-300 tracking-tight block mt-0.5">
                          {isPaidInvoice ? "S/. 0.00" : "S/. 450.00"}
                        </span>
                        <p className="text-[10px] text-slate-100 font-medium leading-relaxed mt-1.5">
                          {isPaidInvoice ? "Su cuenta se encuentra totalmente al día." : "Pensión ordinaria del mes corriente. Por favor efectúe el pago para mantener habilitada su carpeta digital de ciclo."}
                        </p>
                      </div>

                      {!isPaidInvoice && (
                        <button 
                          onClick={handlePayInvoice}
                          className="w-full bg-white hover:bg-[#9f062a]/10 text-[#800521] font-extrabold py-2 rounded-lg text-xs uppercase tracking-wider transition-all mt-4 shadow-sm cursor-pointer"
                        >
                          Pagar Ahora
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Tab View containing Document Submission or Payments (Reference 5) */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-100 shadow-xs flex flex-col">
                    
                    {/* Tabs Headers Panel */}
                    <div className="flex border-b border-slate-100 pb-3 mb-6 gap-6 text-xs font-bold font-display overflow-x-auto">
                      <button 
                        onClick={() => setProfileInnerTab("docs")}
                        className={`pb-2 transition-all relative cursor-pointer pr-1 shrink-0 ${profileInnerTab === "docs" ? "text-[#800521] font-extrabold border-b-2 border-[#800521]" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        Carga de Documentos
                      </button>
                      <button 
                        onClick={() => setProfileInnerTab("payments")}
                        className={`pb-2 transition-all relative cursor-pointer pr-1 shrink-0 ${profileInnerTab === "payments" ? "text-[#800521] font-extrabold border-b-2 border-[#800521]" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        Historial de Pagos
                      </button>
                      <button 
                        onClick={() => setProfileInnerTab("academic")}
                        className={`pb-2 transition-all relative cursor-pointer pr-1 shrink-0 ${profileInnerTab === "academic" ? "text-[#800521] font-extrabold border-b-2 border-[#800521]" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        Datos Académicos
                      </button>
                    </div>

                    {/* Dynamic Tabs view contents */}
                    <div>
                      {profileInnerTab === "docs" && (
                        <div className="space-y-4">
                          
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] font-semibold text-slate-6y shrink-0 mb-4">
                            <span className="text-slate-500">Carpeta Requisitorial del Alumno</span>
                            <span className="font-bold text-slate-800">3 de 5 documentos validados</span>
                          </div>

                          {[
                            { title: "Copia legalizada de DNI (Anverso y Reverso)", key: "dniFile" as const, mandatory: true, mockStatus: "Validado" },
                            { title: "Certificado de Estudios de Educación Secundaria Completa", key: "certificadoFile" as const, mandatory: true, mockStatus: enrollment.docs.certificadoFile?.status || "Pendiente" },
                            { title: "Certificado Médico de Salud e Invalidez", key: "partidaFile" as const, mandatory: false, mockStatus: enrollment.docs.partidaFile?.status || "Pendiente" },
                            { title: "Constancia de Certificación de No Antecedentes Penales", key: "constancia" as const, mandatory: true, mockStatus: "Missing" },
                            { title: "Fotos Tamaño Carnet a color en alta resolución", key: "fotoFile" as const, mandatory: true, mockStatus: "Validado" }
                          ].map((doc, idx) => {
                            const isMissing = doc.mockStatus === "Missing";
                            const isPending = doc.mockStatus === "Pendiente";
                            const isValidated = doc.mockStatus === "Validado";
                            const isObserved = doc.mockStatus === "Observado";

                            return (
                              <div key={idx} className="p-4 border border-slate-100 bg-slate-50/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">{doc.title}</span>
                                    {doc.mandatory && <span className="text-[8px] bg-red-100 text-[#800521] font-black px-1.5 py-0.5 rounded leading-none">Obligatorio</span>}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium">Requisito digital escaneado a color en formato PDF o JPG continuo.</p>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto text-right">
                                  <div>
                                    {isValidated && (
                                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Validado
                                      </span>
                                    )}
                                    {isPending && (
                                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5 animate-pulse">
                                        <Clock className="w-3.5 h-3.5" /> Pendiente
                                      </span>
                                    )}
                                    {isObserved && (
                                      <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded font-extrabold uppercase inline-flex items-center gap-1.5">
                                        <XCircle className="w-3.5 h-3.5" /> Observado
                                      </span>
                                    )}
                                    {isMissing && (
                                      <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded font-extrabold uppercase">
                                        Por Devolver / Subir
                                      </span>
                                    )}
                                  </div>

                                  {!isValidated && (
                                    <button 
                                      onClick={() => {
                                        const name = prompt("Escriba el nombre del archivo requisitorial que desea subir para validación:", `requisito_${doc.key || "doc"}_${personalData.dni}.pdf`);
                                        if (name && doc.key !== "constancia") {
                                          simulateDocUpload(doc.key, name);
                                        } else if (name) {
                                          alert("¡Documento subido! Se guardó como plantilla pendiente de revisión técnica de secretaría.");
                                        }
                                      }}
                                      className="bg-[#800521] hover:bg-[#9F062A] text-white text-[10px] uppercase font-bold py-1 px-3.5 rounded transition-all inline-flex items-center gap-1 cursor-pointer select-none"
                                    >
                                      <Upload className="w-3 L-3 text-amber-300" /> Subir archivo
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                        </div>
                      )}

                      {profileInnerTab === "payments" && (
                        <div className="space-y-4">
                          <span className="text-[10px] text-[#800521] font-bold uppercase tracking-wider block">Historial de Operaciones Financieras</span>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                              <thead>
                                <tr className="border-b text-slate-400 text-[10px] uppercase text-left">
                                  <th className="py-2">Operación ID</th>
                                  <th className="py-2">Concepto</th>
                                  <th className="py-2">Monto</th>
                                  <th className="py-2">Fecha</th>
                                  <th className="py-2 text-right">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50">
                                  <td className="py-3 font-mono text-[11px] text-[#800521]">OP-9921</td>
                                  <td className="py-3">Matrícula Semestral 2026-I</td>
                                  <td className="py-3 font-bold">S/. 250.00</td>
                                  <td className="py-3 text-slate-400">01/03/2026</td>
                                  <td className="py-3 text-right">
                                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200">Aprobado</span>
                                  </td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                  <td className="py-3 font-mono text-[11px] text-[#800521]">OP-9832</td>
                                  <td className="py-3">Derecho de Examen Ordinario de Admisión</td>
                                  <td className="py-3 font-bold">S/. 120.00</td>
                                  <td className="py-3 text-slate-400">12/02/2026</td>
                                  <td className="py-3 text-right">
                                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-emerald-200">Aprobado</span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {profileInnerTab === "academic" && (
                        <div className="space-y-4">
                          <span className="text-[10px] text-[#800521] font-bold uppercase tracking-wider block">Malla de Avance del Estudiante</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg text-center border">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">PPA Promedio</span>
                              <span className="text-xl font-black text-slate-800 block mt-1">16.8</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg text-center border">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Ciclos Completos</span>
                              <span className="text-xl font-black text-[#800521] block mt-1">4 / 6</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg text-center border">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Créditos Aprobados</span>
                              <span className="text-xl font-black text-slate-800 block mt-1">120 CTR</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg text-center border">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Plan Académico</span>
                              <span className="text-lg font-black text-slate-700 block mt-1">NIIF / 2024</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Available billing methods footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3 text-center">MÉTODOS DE PAGO DISPONIBLES</span>
                      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-slate-700 block">Tarjeta de Crédito</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">Visa, Mastercard</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-slate-700 block">Agentes y Banca</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">BCP, BBVA, Interbank</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-slate-700 block">Yape / Plin</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">Escaneado inmediato</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </PageTransition>
            )}

                   {/* VIEW 3: MIS CURSOS / PROGRAMA PROFESIONAL (Reference 2) */}
            {activeTab === "classes" && (() => {
              const classesCoursesData = [
                {
                  id: "inteligencia-negocios",
                  name: "Inteligencia de Negocios",
                  code: "EE-503",
                  cycle: "Ciclo V",
                  classroom: "Aula Virtual",
                  iconType: "BarChart3",
                  description: "Dominando el análisis de datos para la toma de decisiones estratégicas, modelado predictivo y visualización de KPIs para el entorno empresarial moderno.",
                  formula: "NF = (EP1 * 0.20) + (TR1 * 0.15) + (EC1 * 0.15) + (PF1 * 0.50)",
                  evaluations: [
                    { name: "Examen Parcial", sub: "Realizado el 15 Oct, 2026", prefix: "EP1", weight: "20%", grade: "15" },
                    { name: "Trabajo de Investigación I", sub: "Modelado de Almacén de Datos", prefix: "TR1", weight: "15%", grade: "18" },
                    { name: "Evaluación Continua", sub: "Promedio de quizzes y participación", prefix: "EC1", weight: "15%", grade: "NR" },
                    { name: "Proyecto Final: Dashboard Ejecutivo", sub: "Entrega prevista: 20 Dic, 2026", prefix: "PF1", weight: "50%", grade: "NR" }
                  ]
                },
                {
                  id: "instalaciones-electricas-iii",
                  name: "Instalaciones Eléctricas III",
                  code: "EE-403",
                  cycle: "Ciclo V",
                  classroom: "Aula 302",
                  iconType: "Zap",
                  description: "Diseño, montaje y mantenimiento de tableros de transferencia automática, instalaciones automatizadas y domótica aplicada a edificaciones industriales de gran envergadura o centros de datos.",
                  formula: "NF = (ED1 * 0.30) + (TR1 * 0.20) + (EC1 * 0.10) + (EF1 * 0.40)",
                  evaluations: [
                    { name: "Evaluación Diagnóstica", sub: "Realizado el 12 Oct, 2026", prefix: "ED1", weight: "30%", grade: "16" },
                    { name: "Trabajo de Campo I", sub: "Conexiones de Transferencia", prefix: "TR1", weight: "20%", grade: "14" },
                    { name: "Desempeño Continuo", sub: "Evaluación presencial", prefix: "EC1", weight: "10%", grade: "15" },
                    { name: "Examen Final Teórico-Práctico", sub: "Ejecución presencial de circuito", prefix: "EF1", weight: "40%", grade: "NR" }
                  ]
                },
                {
                  id: "microcontroladores-avanzados",
                  name: "Microcontroladores Avanzados",
                  code: "EE-502",
                  cycle: "Ciclo V",
                  classroom: "Laboratorio 4",
                  iconType: "Cpu",
                  description: "Programación en lenguaje C embebido para microcontroladores ARM y PIC, control interactivo de periféricos de potencia, buses de datos industriales y sensado analógico avanzado.",
                  formula: "NF = (EP1 * 0.25) + (LB1 * 0.25) + (AC1 * 0.10) + (PF1 * 0.40)",
                  evaluations: [
                    { name: "Examen Parcial Escrito", sub: "Realizado el 14 Oct, 2026", prefix: "EP1", weight: "25%", grade: "13" },
                    { name: "Informes de Laboratorio", sub: "Suma de guías completadas", prefix: "LB1", weight: "25%", grade: "15" },
                    { name: "Asistencia y Participación", sub: "Evaluación continua del docente", prefix: "AC1", weight: "10%", grade: "17" },
                    { name: "Proyecto Armado de Robot", sub: "Sustentación en semana final", prefix: "PF1", weight: "40%", grade: "NR" }
                  ]
                },
                {
                  id: "control-procesos",
                  name: "Control de Procesos",
                  code: "EE-504",
                  cycle: "Ciclo V",
                  classroom: "Aula 102",
                  iconType: "Sliders",
                  description: "Modelado matemático de sistemas dinámicos continuos, sintonización de controladores PID industriales, control cascada y compensación ante perturbaciones severas en procesos de manufactura.",
                  formula: "NF = (EP1 * 0.20) + (TR1 * 0.15) + (EC1 * 0.15) + (PF1 * 0.50)",
                  evaluations: [
                    { name: "Examen Teórico I", sub: "Realizado el 11 Oct, 2026", prefix: "EP1", weight: "20%", grade: "14" },
                    { name: "Trabajo de Simulación MATLAB", sub: "Análisis de respuesta temporal", prefix: "TR1", weight: "15%", grade: "16" },
                    { name: "Evaluaciones de Taller", sub: "Uso de banco de procesos", prefix: "EC1", weight: "15%", grade: "NR" },
                    { name: "Proyecto del Lazo Sintonizado", sub: "Entrega en repositorio virtual", prefix: "PF1", weight: "50%", grade: "NR" }
                  ]
                }
              ];

              const activeCourse = classesCoursesData.find(c => c.name === selectedCourseDetail) || classesCoursesData[0];

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

              return (
                <PageTransition id="classes" className="space-y-6">
                  
                  {/* Custom Big Banner matching the reference image */}
                  <div className="relative bg-[#800521] text-white rounded-xl shadow-md p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
                    <div className="absolute inset-0 bg-linear-gradient(to right,rgba(128,5,33,0.95),rgba(0,0,0,0.65))" />
                    
                    <div className="relative z-10 space-y-3 max-w-2xl">
                      <span className="bg-yellow-400 text-[#800521] text-[9.5px] font-black uppercase tracking-widest px-3 py-1.5 w-max select-none rounded-xs block font-display">
                        PROGRAMA PROFESIONAL
                      </span>
                      
                      <h2 id="active-course-banner-title" className="text-2xl md:text-3.5xl font-black font-display tracking-tight leading-none pt-1">
                        {activeCourse.name}
                      </h2>
                      
                      <p className="text-xs text-white/90 font-medium tracking-wide leading-relaxed">
                        {activeCourse.description}
                      </p>
                    </div>

                    {/* Low opacity overlay decorative chart icon on the right */}
                    <div className="absolute right-6 bottom-4 text-white/5 pointer-events-none select-none hidden md:block">
                      {renderCourseIcon(activeCourse.iconType, "w-44 h-44 stroke-[0.5]")}
                    </div>
                  </div>

                  {/* Stat Metrics Row exactly matching Image Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* card 1: ESTADO DE MATRÍCULA */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[90px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado de Matrícula</span>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 block animate-pulse" />
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Vigente</span>
                      </div>
                    </div>

                    {/* card 2: CRÉDITOS CICLO */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[90px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Créditos Ciclo</span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-lg font-mono font-black text-slate-800">22 / 180</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Totales</span>
                      </div>
                    </div>

                    {/* card 3: PROMEDIO PONDERADO */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[90px]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Promedio Ponderado</span>
                      <span className="text-lg font-mono font-black text-[#800521] mt-2 block">16.8</span>
                    </div>

                    {/* card 4: MÁS INFORMACIÓN Button */}
                    <div className="h-full">
                      <button 
                        onClick={() => alert(`Simulación: Abriendo el plan de estudios oficial para la carrera de ${currentProgram?.name || "Electricidad Industrial"} - Ciclo V en el sistema institucional...`)}
                        className="bg-[#800521] hover:bg-[#9F062A] text-white text-[11px] uppercase font-black px-4 py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 select-none h-full w-full font-bold shadow-md shadow-[#800521]/10"
                      >
                        <Info className="w-4 h-4 text-white" /> Más Información
                      </button>
                    </div>

                  </div>

                  {/* Main Grid: Detail View + Right Sidebar of Courses */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT CONTAINER: Detalle de Evaluaciones Table Card (8-cols) */}
                    <div className="xl:col-span-8 space-y-6 text-left">
                      
                      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
                        
                        {/* Title & Print Action Row */}
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h3 id="classes-detail-box-title" className="text-sm font-black text-slate-800 uppercase tracking-tight font-display">
                            Detalle de Evaluaciones
                          </h3>
                          <button 
                            onClick={() => alert(`Generando Boleta de Notas oficial para la materia ${activeCourse.name}...`)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-[10px] py-1.5 px-3 rounded-lg border border-slate-200 flex items-center gap-1.5 uppercase transition-all shadow-xs cursor-pointer select-none"
                          >
                            <Printer className="w-3.5 h-3.5" /> Imprimir Boleta
                          </button>
                        </div>

                        {/* Interactive evaluations table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left">
                                <th className="py-3 px-1">Evaluación</th>
                                <th className="py-3 text-center">Prefijo</th>
                                <th className="py-3 text-center">Peso</th>
                                <th className="py-3 text-right">Nota</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {activeCourse.evaluations.map((evalItem, idx) => {
                                const isNotRegistered = evalItem.grade === "NR";
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-all font-sans">
                                    <td className="py-4 px-1">
                                      <span className="text-slate-800 font-black block text-[12px]">{evalItem.name}</span>
                                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{evalItem.sub}</span>
                                    </td>
                                    
                                    <td className="py-4 text-center">
                                      <span className="font-mono text-[11px] text-slate-500 font-bold bg-slate-55 border px-2 py-0.5 rounded uppercase">
                                        {evalItem.prefix}
                                      </span>
                                    </td>
                                    
                                    <td className="py-4 text-center font-mono text-slate-600 font-bold text-[11px]">
                                      {evalItem.weight}
                                    </td>
                                    
                                    <td className="py-4 text-right">
                                      <span className={`font-mono font-black text-[14px] w-12 h-9 inline-flex items-center justify-center rounded-lg border select-none ${
                                        isNotRegistered 
                                          ? "bg-gray-150/40 text-gray-500 border-gray-200" 
                                          : "bg-emerald-50 text-emerald-750 border-emerald-100 font-extrabold"
                                      }`}>
                                        {evalItem.grade}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Rating formula box */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5 text-left mt-4">
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">FÓRMULA DE CALIFICACIÓN FINAL:</span>
                          <code className="text-[11.5px] font-mono font-black text-slate-700 block">
                            {activeCourse.formula}
                          </code>
                        </div>

                      </div>

                      {/* Event/Details cards footer matching Image bottom items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Event 1 */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex items-start gap-4">
                          <div className="bg-red-50 text-[#800521] border border-red-150 h-14 w-14 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-wider leading-none">OCT</span>
                            <span className="text-xl font-extrabold leading-none mt-1">28</span>
                          </div>
                          <div className="space-y-1 text-left">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Visita Técnica Guiada</h4>
                            <p className="text-[10px] text-slate-500 font-semibold leading-tight">Subestación Eléctrica del Sur • 08:00 AM</p>
                            <button 
                              onClick={() => alert("Mostrando detalles de la visita: Salida de bus de patio de honor, indispensable portar fotocheck y equipo de seguridad personal (EPP).")}
                              className="text-[9.5px] text-[#800521] font-black uppercase tracking-wider block mt-1 hover:underline cursor-pointer"
                            >
                              Ver Detalles &gt;
                            </button>
                          </div>
                        </div>

                        {/* Event 2 */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex items-start gap-4">
                          <div className="bg-amber-50 text-amber-800 border border-amber-150 h-14 w-14 rounded-lg flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-wider leading-none">NOV</span>
                            <span className="text-xl font-extrabold leading-none mt-1">05</span>
                          </div>
                          <div className="space-y-1 text-left">
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Cierre de Matrícula</h4>
                            <p className="text-[10px] text-slate-500 font-semibold leading-tight">Plazo definitivo improrrogable extemporáneo</p>
                            <button 
                              onClick={() => alert("Soporte académico: Recuerde registrar su matrícula extemporánea antes de que las vacantes pasen al sorteo regular de plazas.")}
                              className="text-[9.5px] text-[#800521] font-black uppercase tracking-wider block mt-1 hover:underline cursor-pointer"
                            >
                              Ver Detalles &gt;
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* RIGHT SIDEBAR: Courses List (4-cols) */}
                    <aside className="xl:col-span-4 space-y-6 text-left">
                      
                      {/* Courses List Container */}
                      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                        
                        <div className="space-y-1 border-b border-slate-100 pb-2">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">CURSOS POR PROGRAMA</span>
                          <span className="text-[11px] text-slate-500 font-bold block">
                            Carrera: {currentProgram?.name || "Electricidad Industrial"}
                          </span>
                        </div>

                        {/* Course Card list mapping */}
                        <div className="space-y-3">
                          {classesCoursesData.map((courseItem) => {
                            const isSelected = selectedCourseDetail === courseItem.name;
                            return (
                              <button
                                key={courseItem.id}
                                onClick={() => setSelectedCourseDetail(courseItem.name)}
                                className={`w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center group cursor-pointer relative ${
                                  isSelected 
                                    ? "bg-[#FFF5F6] border-[#F1D2D5] text-[#800521] ring-1 ring-[#F1D2D5]" 
                                    : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50/50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Icon box */}
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                    isSelected ? "bg-[#800521]/10 text-[#800521]" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 transition-all"
                                  }`}>
                                    {renderCourseIcon(courseItem.iconType, "w-4 h-4")}
                                  </div>
                                  
                                  <div>
                                    <span className={`text-[12px] font-black block tracking-tight leading-none ${
                                      isSelected ? "text-[#800521]" : "text-slate-800"
                                    }`}>
                                      {courseItem.name}
                                    </span>
                                    <span className="text-[9.5px] text-slate-400 font-semibold block mt-1">
                                      {courseItem.cycle} • {courseItem.classroom}
                                    </span>
                                  </div>
                                </div>

                                {/* Active tag / actual chevron */}
                                <div>
                                  {isSelected ? (
                                    <span className="bg-[#800521] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm select-none font-display">
                                      ACTUAL
                                    </span>
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-350 select-none opacity-0 group-hover:opacity-100 transition-all" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                      </div>

                      {/* Coordinator section exactly matching Image Reference */}
                      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block border-b border-slate-100 pb-2">COORDINADOR DE CARRERA</span>
                        
                        <div className="flex items-center gap-3 font-sans">
                          {/* Profile Avatar with image initials */}
                          <div className="h-10 w-10 bg-slate-150 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-black text-slate-600 text-sm">
                            CM
                          </div>
                          <div className="text-left font-sans">
                            <span className="text-xs font-black text-[#2D3748] block">Ing. Carlos Mendoza</span>
                            <span className="text-[10px] text-slate-400 block font-bold leading-none mt-0.5">u.mendoza@iestpsfa.edu.pe</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => window.open("mailto:u.mendoza@iestpsfa.edu.pe")}
                          className="w-full bg-white hover:bg-slate-50 text-[#800521] border border-slate-200 text-[10.5px] font-extrabold py-2 rounded-lg flex items-center justify-center gap-2 select-none uppercase transition-all shadow-xs cursor-pointer font-bold"
                        >
                          <Mail className="w-4 h-4" /> Enviar Correo
                        </button>
                      </div>

                    </aside>

                  </div>

                </PageTransition>
              );
            })()}

            {/* VIEW 4: MI HORARIO (Reference 3) */}
            {activeTab === "schedule" && (
              <PageTransition id="schedule" className="space-y-6">
                
                {/* Header metadata layout */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-display">
                      Hola, {personalData.name}, bienvenido, hoy es miércoles 27 de mayo de 2026
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">{currentProgram?.name || "Electricidad Industrial"} - Ciclo V</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.print()}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" /> Print
                    </button>
                    <button 
                      onClick={() => alert("Descargando su horario de clases consolidado del semestre 2026-I en PDF...")}
                      className="bg-[#800521] hover:bg-[#9F062A] text-white px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-500" /> Download PDF
                    </button>
                  </div>
                </div>

                {/* Calendar hourly grid layout (Reference 3 style) */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold border-collapse text-left min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] uppercase">
                          <th className="p-4 border-r border-slate-100 w-32">Time</th>
                          <th className="p-4 border-r border-slate-100">Lunes</th>
                          <th className="p-4 border-r border-slate-100">Martes</th>
                          <th className="p-4 border-r border-slate-100">Miércoles</th>
                          <th className="p-4 border-r border-slate-100">Jueves</th>
                          <th className="p-4">Viernes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        
                        {/* 08:00 - 09:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">08:00 - 09:00</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-sky-950">TEORÍA DE CIRCUITOS II</span>
                              <span className="text-[9px] text-sky-600 block mt-2">Aula A-102 • Ing. Vizcarra</span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-sky-950">TEORÍA DE CIRCUITOS II</span>
                              <span className="text-[9px] text-sky-600 block mt-2">Aula A-102 • Ing. Vizcarra</span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3">-</td>
                        </tr>

                        {/* 09:00 - 10:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">09:00 - 10:00</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={3}>
                            <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-emerald-950">LAB. ELECTRICIDAD</span>
                              <span className="text-[9px] text-emerald-600 block mt-2">Taller L-1 • Ing. Ramos</span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-100" rowSpan={3}>
                            <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-emerald-950">ELECTRÓNICA POT.</span>
                              <span className="text-[9px] text-emerald-600 block mt-2">Taller L-3 • Prof. Díaz</span>
                            </div>
                          </td>
                          <td className="p-3">-</td>
                        </tr>

                        {/* 10:00 - 11:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">10:00 - 11:00</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-sky-950">MATEMÁTICA V</span>
                              <span className="text-[9px] text-sky-600 block mt-2">Aula A-202 • Prof. Santos</span>
                            </div>
                          </td>
                          <td className="p-3">-</td>
                        </tr>

                        {/* 11:00 - 12:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">11:00 - 12:00</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-orange-50 text-orange-850 border-l-4 border-orange-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-orange-955">ÉTICA PROFESIONAL</span>
                              <span className="text-[9px] text-orange-600 block mt-2">Virtual Sync • Tutoria</span>
                            </div>
                          </td>
                          <td className="p-3">-</td>
                        </tr>

                        {/* 12:00 - 13:00 (RECESO - Reference 3) */}
                        <tr className="bg-slate-100 text-slate-500 font-bold overflow-hidden">
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-black text-slate-500">12:00 - 13:00</td>
                          <td className="p-2 border-r border-slate-100 text-center tracking-widest font-extrabold uppercase bg-slate-100 text-slate-400" colSpan={5}>
                            RECESO ALMUERZO
                          </td>
                        </tr>

                        {/* 13:00 - 14:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">13:00 - 14:00</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-indigo-50 text-indigo-805 border-l-4 border-indigo-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-indigo-950">SISTEMAS DE CONTROL II</span>
                              <span className="text-[9px] text-indigo-600 block mt-2">Aula A-105 • Prof. Ramos</span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-indigo-50 text-indigo-805 border-l-4 border-indigo-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-indigo-950">SISTEMAS DE CONTROL II</span>
                              <span className="text-[9px] text-indigo-600 block mt-2">Aula A-105 • Prof. Ramos</span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-100" rowSpan={2}>
                            <div className="bg-sky-50 text-sky-800 border-l-4 border-sky-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-sky-950">MANTENIMIENTO IND.</span>
                              <span className="text-[9px] text-sky-600 block mt-2">Aula A-201 • Ing. Ramos</span>
                            </div>
                          </td>
                          <td className="p-3">-</td>
                        </tr>

                        {/* 14:00 - 15:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">14:00 - 15:00</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3">-</td>
                        </tr>

                        {/* 15:00 - 16:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">15:00 - 16:00</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3 border-r border-slate-100">-</td>
                          <td className="p-3" rowSpan={2}>
                            <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 p-2.5 rounded shadow-xs h-full flex flex-col justify-between">
                              <span className="font-extrabold block text-[11px] leading-tight text-emerald-950">INSTALACIONES II</span>
                              <span className="text-[9px] text-emerald-600 block mt-2">Taller L-2 • Ing. Salazar</span>
                            </div>
                          </td>
                        </tr>

                        {/* 16:00 - 17:00 */}
                        <tr>
                          <td className="p-4 bg-slate-50 border-r border-slate-100 font-mono font-bold text-slate-500">16:00 - 17:00</td>
                          <td className="p-2 border-r border-slate-100">-</td>
                          <td className="p-2 border-r border-slate-100">-</td>
                          <td className="p-2 border-r border-slate-100">-</td>
                          <td className="p-2 border-r border-slate-100">-</td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

              </PageTransition>
            )}

            {/* VIEW 5: CONTROL DE ASISTENCIA (Reference 4) */}
            {activeTab === "attendance" && (() => {
              // Helper to resolve dynamic attendance courses and sessions by active Semester and Student Program
              const getAttendanceCourses = () => {
                const prog = enrollment.programId; // "electronica" | "contabilidad"
                const sem = selectedAttendanceSemester; // "2026-I" | "2025-II" | "2025-I"
                
                if (prog === "electronica") {
                  if (sem === "2026-I") {
                    return [
                      {
                        id: "circuitos-ii",
                        code: "EE-501",
                        name: "Teoría de Circuitos II",
                        group: "EE-51",
                        attendanceRate: 98,
                        statusText: "98% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "14 / 14",
                        puntualidad: "100%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 14, date: "24 Mayo 2026", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { num: 13, date: "17 Mayo 2026", time: "08:02 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { num: 12, date: "10 Mayo 2026", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      },
                      {
                        id: "maquinas",
                        code: "EE-502",
                        name: "Lab. Maquinarias de Potencia",
                        group: "EE-51",
                        attendanceRate: 94,
                        statusText: "94% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "14 / 14",
                        puntualidad: "93%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 14, date: "25 Mayo 2026", time: "08:12 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" },
                          { num: 13, date: "18 Mayo 2026", time: "08:02 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      },
                      {
                        id: "control-ii",
                        code: "EE-503",
                        name: "Sistemas de Control Automático II",
                        group: "EE-52",
                        attendanceRate: 75,
                        statusText: "75% Asistencia",
                        statusDesc: "RIESGO DE DESAPROBACIÓN",
                        statusType: "danger",
                        sesRealizadas: "10 / 14",
                        puntualidad: "80%",
                        faltas: "03",
                        creditos: "03",
                        sessions: [
                          { num: 14, date: "26 Mayo 2026", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
                          { num: 13, date: "19 Mayo 2026", time: "10:05 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" },
                          { num: 12, date: "12 Mayo 2026", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" }
                        ]
                      }
                    ];
                  } else if (sem === "2025-II") {
                    return [
                      {
                        id: "maquinas-cc",
                        code: "EE-401",
                        name: "Máquinas de Corriente Continua",
                        group: "EE-41",
                        attendanceRate: 96,
                        statusText: "96% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "16 / 16",
                        puntualidad: "98%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 16, date: "12 Nov 2025", time: "08:01 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { num: 15, date: "05 Nov 2025", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      },
                      {
                        id: "neumatica",
                        code: "EE-402",
                        name: "Sistemas Neumáticos e Hidráulicos",
                        group: "EE-41",
                        attendanceRate: 71,
                        statusText: "71% Asistencia",
                        statusDesc: "RIESGO DE DESAPROBACIÓN",
                        statusType: "danger",
                        sesRealizadas: "11 / 15",
                        puntualidad: "78%",
                        faltas: "04",
                        creditos: "04",
                        sessions: [
                          { num: 15, date: "14 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
                          { num: 14, date: "07 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
                          { num: 13, date: "31 Oct 2025", time: "08:14 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" }
                        ]
                      }
                    ];
                  } else {
                    return [
                      {
                        id: "circuitos-ca",
                        code: "EE-301",
                        name: "Circuitos de Corriente Alterna",
                        group: "EE-31",
                        attendanceRate: 95,
                        statusText: "95% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "16 / 16",
                        puntualidad: "94%",
                        faltas: "01",
                        creditos: "04",
                        sessions: [
                          { num: 16, date: "21 Jun 2025", time: "08:04 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" },
                          { num: 15, date: "14 Jun 2025", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      },
                      {
                        id: "analogica",
                        code: "EE-302",
                        name: "Electrónica Analógica Aplicada",
                        group: "EE-31",
                        attendanceRate: 100,
                        statusText: "100% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "16 / 16",
                        puntualidad: "100%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 16, date: "19 Jun 2025", time: "08:01 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      }
                    ];
                  }
                } else {
                  // Contabilidad
                  if (sem === "2026-I") {
                    return [
                      {
                        id: "c-gubernamental",
                        code: "CO-501",
                        name: "Contabilidad Gubernamental",
                        group: "CO-51",
                        attendanceRate: 96,
                        statusText: "96% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "14 / 14",
                        puntualidad: "95%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 14, date: "24 Mayo 2026", time: "08:01 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                          { num: 13, date: "17 Mayo 2026", time: "08:02 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      },
                      {
                        id: "c-eeff",
                        code: "CO-502",
                        name: "Formulación de Estados Financieros",
                        group: "CO-51",
                        attendanceRate: 98,
                        statusText: "98% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "14 / 14",
                        puntualidad: "98%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 14, date: "25 Mayo 2026", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      },
                      {
                        id: "c-auditoria",
                        code: "CO-503",
                        name: "Auditoría Financiera Integral",
                        group: "CO-52",
                        attendanceRate: 78,
                        statusText: "78% Asistencia",
                        statusDesc: "RIESGO DE DESAPROBACIÓN",
                        statusType: "danger",
                        sesRealizadas: "11 / 14",
                        puntualidad: "82%",
                        faltas: "02",
                        creditos: "03",
                        sessions: [
                          { num: 14, date: "26 Mayo 2026", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
                          { num: 13, date: "19 Mayo 2026", time: "10:11 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" }
                        ]
                      }
                    ];
                  } else if (sem === "2025-II") {
                    return [
                      {
                        id: "c-costos",
                        code: "CO-401",
                        name: "Contabilidad de Costos Financieros",
                        group: "CO-41",
                        attendanceRate: 93,
                        statusText: "93% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "15 / 15",
                        puntualidad: "94%",
                        faltas: "01",
                        creditos: "04",
                        sessions: [
                          { num: 15, date: "12 Nov 2025", time: "08:10 AM", label: "T", labelName: "Tardanza", style: "bg-amber-50 text-amber-700 border-amber-100" }
                        ]
                      },
                      {
                        id: "c-trib",
                        code: "CO-402",
                        name: "Auditoría Tributaria Corporativa",
                        group: "CO-41",
                        attendanceRate: 74,
                        statusText: "74% Asistencia",
                        statusDesc: "RIESGO DE DESAPROBACIÓN",
                        statusType: "danger",
                        sesRealizadas: "11 / 15",
                        puntualidad: "80%",
                        faltas: "04",
                        creditos: "04",
                        sessions: [
                          { num: 15, date: "14 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" },
                          { num: 14, date: "07 Nov 2025", time: "--:--", label: "F", labelName: "Falta", style: "bg-rose-50 text-rose-700 border-rose-100" }
                        ]
                      }
                    ];
                  } else {
                    return [
                      {
                        id: "c-ind",
                        code: "CO-301",
                        name: "Contabilidad de Costos Industriales",
                        group: "CO-31",
                        attendanceRate: 97,
                        statusText: "97% Asistencia",
                        statusDesc: "ESTADO: EXCELENTE",
                        statusType: "excellent",
                        sesRealizadas: "16 / 16",
                        puntualidad: "98%",
                        faltas: "00",
                        creditos: "04",
                        sessions: [
                          { num: 16, date: "21 Jun 2025", time: "08:00 AM", label: "P", labelName: "Presente", style: "bg-emerald-50 text-emerald-700 border-emerald-100" }
                        ]
                      }
                    ];
                  }
                }
              };

              const currentAttendanceCourses = getAttendanceCourses();
              
              // Dynamic calculations based on active courses list
              const globalAttendanceRate = Math.round(currentAttendanceCourses.reduce((sum, c) => sum + c.attendanceRate, 0) / (currentAttendanceCourses.length || 1));
              const totalInasistencias = currentAttendanceCourses.reduce((sum, c) => sum + parseInt(c.faltas || "0", 10), 0);
              const riskyCourses = currentAttendanceCourses.filter(c => c.attendanceRate < 80);
              const totalAlertsCount = riskyCourses.length;
              const alertMsg = totalAlertsCount > 0 
                ? `${riskyCourses[0].name}: ${100 - riskyCourses[0].attendanceRate}% inasistencias`
                : "Sin alertas críticas este semestre";

              return (
                <PageTransition id="attendance" className="space-y-6">
                  
                  {/* Header Section */}
                  <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                    <div>
                      <h2 id="asis-title" className="text-xl font-black text-slate-900 tracking-tight font-display mb-1">Control de Asistencia</h2>
                      <p className="text-xs text-slate-500 font-bold">Monitorea tu puntualidad y estado académico por curso.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select 
                          id="semestre-asis-select"
                          value={selectedAttendanceSemester}
                          onChange={(e) => {
                            setSelectedAttendanceSemester(e.target.value);
                          }}
                          className="bg-white border border-slate-200 text-slate-800 text-xs font-black py-1.5 pl-3 pr-8 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#800521] shadow-xs"
                        >
                          <option value="2026-I">Semestre 2026-I (Actual)</option>
                          <option value="2025-II">Semestre 2025-II</option>
                          <option value="2025-I">Semestre 2025-I</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>

                      <button 
                        onClick={() => alert(`Imprimiendo reporte consolidado de inasistencias para el Semestre ${selectedAttendanceSemester}...`)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Printer className="w-4 h-4 text-slate-400" /> Imprimir
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric cards row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Card 1: ASISTENCIA GLOBAL */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-left relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Asistencia Global</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-950">{globalAttendanceRate}%</span>
                          <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                            ↑ {globalAttendanceRate >= 90 ? "+3%" : "+1%"}
                          </span>
                        </div>
                      </div>
                      {/* Dark red progress bar filled to global percentage */}
                      <div className="w-full bg-slate-100 h-2 rounded mt-3 relative">
                        <div className="bg-[#800521] h-full rounded" style={{ width: `${globalAttendanceRate}%` }} />
                      </div>
                    </div>

                    {/* Card 2: INASISTENCIAS TOTALES */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-left flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Inasistencias Totales</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-950">{totalInasistencias.toString().padStart(2, "0")} <span className="text-xs font-bold text-slate-400">Sesiones</span></span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block mt-2">Límite permitido: 12 por curso</span>
                    </div>

                    {/* Card 3: ALERTAS DE RIESGO - styled with pink/red hazards */}
                    <div className={`${totalAlertsCount > 0 ? "bg-rose-50 border-rose-100" : "bg-white border-slate-100"} border rounded-xl p-5 shadow-sm text-left flex flex-col justify-between min-h-[110px]`}>
                      <div>
                        <div className="flex justify-between items-center">
                          <span className={`${totalAlertsCount > 0 ? "text-rose-700" : "text-slate-400"} text-[10px] font-black uppercase tracking-wider block`}>Alertas de Riesgo</span>
                          <AlertTriangle className={`w-4 h-4 ${totalAlertsCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-300"} shrink-0`} />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className={`text-2xl font-black ${totalAlertsCount > 0 ? "text-rose-700 animate-pulse" : "text-slate-900"}`}>{totalAlertsCount.toString().padStart(2, "0")}</span>
                        </div>
                      </div>
                      <span className={`${totalAlertsCount > 0 ? "text-rose-700" : "text-slate-500"} text-[10px] font-bold leading-tight`}>{alertMsg}</span>
                    </div>

                  </div>

                  {/* Main panel: LISTADO DE CURSOS + Right Sidebar options */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Left part: Course list block (8 cols) */}
                    <div id="asis-courses" className="xl:col-span-8 space-y-4">
                      
                      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
                        
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Listado de Cursos</h3>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedAttendanceSemester === "2026-I" ? "Mayo 2026" : selectedAttendanceSemester === "2025-II" ? "Noviembre 2025" : "Junio 2025"}</span>
                        </div>

                        <div className="space-y-3">
                          
                          {/* Course accordions mapping */}
                          {currentAttendanceCourses.map((c, idx) => {
                            const isOpen = expandedAttendanceCourse === c.id || (expandedAttendanceCourse === "redes" && idx === 0);
                            return (
                            <div key={c.id} className="border border-slate-100 rounded-lg overflow-hidden transition-all duration-200">
                              
                              {/* Header Trigger row */}
                              <div 
                                onClick={() => setExpandedAttendanceCourse(isOpen ? null : c.id)}
                                className="p-4 bg-white hover:bg-slate-50 flex items-center justify-between cursor-pointer select-none border-b border-transparent transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-slate-400" />
                                  <div className="text-left">
                                    <span className="text-slate-805 font-bold text-xs block">{c.name}</span>
                                    <span className="text-[10px] text-slate-400 font-bold block">Grupo: {c.group}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-right">
                                  <div className="text-right">
                                    <span className={`text-xs font-black block ${c.attendanceRate < 80 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                                      {c.statusText}
                                    </span>
                                    <span className={`text-[9px] font-bold block uppercase tracking-wider ${
                                      c.statusType === "danger" ? "text-rose-600" : c.statusType === "excellent" ? "text-emerald-600" : "text-slate-400"
                                    }`}>
                                      {c.statusDesc}
                                    </span>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "transform rotate-180 text-slate-600" : ""}`} />
                                </div>
                              </div>

                              {/* Expanded Panel Details */}
                              {isOpen && (
                                <div className="bg-slate-50 border-t border-slate-100/70 p-4 space-y-4 text-left">
                                  {/* Sub-cards summary stats row */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                      <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Sesiones Realizadas</span>
                                      <span className="text-xs font-black text-slate-800 block mt-2">{c.sesRealizadas}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                      <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Puntualidad</span>
                                      <span className="text-xs font-black text-slate-800 block mt-2">{c.puntualidad}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                      <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Faltas Injustificadas</span>
                                      <span className="text-xs font-black text-slate-800 block mt-2">{c.faltas}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                      <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Créditos</span>
                                      <span className="text-xs font-black text-slate-800 block mt-2">{c.creditos}</span>
                                    </div>
                                  </div>

                                  {/* Sessions register table */}
                                  <div className="overflow-x-auto bg-white rounded-lg border border-slate-100">
                                    <table className="w-full text-xs text-left border-collapse font-sans font-semibold">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[9px] uppercase font-bold text-slate-400">
                                          <th className="p-3">Sesión</th>
                                          <th className="p-3">Fecha</th>
                                          <th className="p-3">Hora Marcación</th>
                                          <th className="p-3">Estado</th>
                                          <th className="p-3 text-right">Acción</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-slate-600">
                                        {c.sessions.map((ses, sIdx) => (
                                          <tr key={sIdx} className="hover:bg-slate-50/40">
                                            <td className="p-3 text-slate-800 font-extrabold text-[12.5px]">Sesión {ses.num}</td>
                                            <td className="p-3 font-semibold">{ses.date}</td>
                                            <td className="p-3 font-mono font-bold">{ses.time}</td>
                                            <td className="p-3">
                                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border inline-block select-none ${ses.style}`}>
                                                {ses.labelName}
                                              </span>
                                            </td>
                                            <td className="p-3 text-right">
                                              <button 
                                                onClick={() => alert(`Consulta Detalle: Sesión ${ses.num} del curso ${c.name}. Registrada en intranet oficial.`)}
                                                className="text-slate-400 hover:text-[#800521] p-1 rounded transition-all"
                                              >
                                                <Info className="w-4 h-4 inline-block" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                      </div>

                      {/* Leyenda Footer box */}
                      <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-4 items-center text-[10px] font-bold text-slate-500">
                        <span className="text-slate-400 uppercase tracking-widest text-[9px] block">Leyenda:</span>
                        <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-[9px]">P</span> Presencial (Presente)</span>
                        <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-[9px]">T</span> Tardanza</span>
                        <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-black text-[9px]">J</span> Justificado</span>
                        <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-black text-[9px]">F</span> Falta</span>
                      </div>

                    </div>

                  </div>

                  {/* Right part: Secondary Sidebar (4 cols) */}
                  <aside className="xl:col-span-4 space-y-6">
                    
                    {/* ATAJOS ACADÉMICOS: 2x2 grid of awesome square option buttons */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Atajos Académicos</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setActiveTab("schedule")}
                          className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <Calendar className="w-5 h-5 text-slate-500" />
                          <span className="text-[10px] font-black text-slate-700">Horario</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab("profile")}
                          className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <CreditCard className="w-5 h-5 text-slate-500" />
                          <span className="text-[10px] font-black text-slate-700">Pagos</span>
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab("closure")}
                          className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <Award className="w-5 h-5 text-slate-500" />
                          <span className="text-[10px] font-black text-slate-700">Notas</span>
                        </button>

                        <button 
                          onClick={() => alert("Simulación: Abriendo matrícula online para pre-registro modular...")}
                          className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <User className="w-5 h-5 text-slate-500" />
                          <span className="text-[10px] font-black text-slate-700">Matrícula</span>
                        </button>
                      </div>
                    </div>

                    {/* PRÓXIMAS SESIONES: lists sessions scheduled soon */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block text-left">Próximas Sesiones</span>
                      
                      <div className="space-y-3">
                        
                        {/* Upcoming session 1 */}
                        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/45 flex items-start gap-3">
                          <div className="bg-amber-100 border border-amber-200 text-amber-800 font-black text-[10px] py-1.5 px-2 rounded-lg text-center leading-none tracking-tight shrink-0 flex flex-col justify-center items-center min-w-[50px]">
                            <span className="uppercase text-[8px] font-bold block mb-0.5">OCT</span>
                            <span className="text-sm block">25</span>
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[11.5px] font-black text-slate-800 block truncate">Inteligencia de Negocios</span>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1 font-semibold">
                              <Clock className="w-3 h-3 text-slate-400" /> 14:00 - 18:00
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5 font-semibold">
                              <MapPin className="w-3 h-3 text-slate-400" /> Lab 402-B
                            </div>
                          </div>
                        </div>

                        {/* Upcoming session 2 */}
                        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/45 flex items-start gap-3">
                          <div className="bg-amber-100 border border-amber-200 text-amber-800 font-black text-[10px] py-1.5 px-2 rounded-lg text-center leading-none tracking-tight shrink-0 flex flex-col justify-center items-center min-w-[50px]">
                            <span className="uppercase text-[8px] font-bold block mb-0.5">OCT</span>
                            <span className="text-sm block">26</span>
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[11.5px] font-black text-slate-800 block truncate">Redes y Comunicación II</span>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-1 font-semibold">
                              <Clock className="w-3 h-3 text-slate-400" /> 08:00 - 10:00
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5 font-semibold">
                              <MapPin className="w-3 h-3 text-slate-400" /> Aula 201
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* ESTADO ACADÉMICO: Red widget box */}
                    <div className="bg-[#800521] text-white rounded-xl p-5 shadow-sm border-b-4 border-amber-400 flex flex-col items-center text-center space-y-2">
                      <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">Estado Académico</span>
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-200 block uppercase font-bold">Promedio General</span>
                        <span className="text-3xl font-black block mt-0.5 font-mono">16.4</span>
                      </div>
                      <span className="inline-block bg-white/15 text-white border border-white/20 rounded px-2.5 py-1 text-[9px] uppercase font-extrabold mt-2 tracking-wide select-none">
                        Ranking: Tercio Superior
                      </span>
                    </div>

                  </aside>

                </div>

              </PageTransition>
            );
          })()}

            {/* VIEW 6: CONSULTA ACADÉMICA / PORTAL DE DOS BARRA (Reference 6) */}
            {activeTab === "closure" && (() => {
              // High fidelity academic plan definitions matching our institute's two careers
              const CORE_PLAN_COURSES: Record<string, Record<string, Array<{ code: string; name: string; type: string; credits: number; status: string; teo: number; pr: number }>>> = {
                "52": { // Contabilidad
                  "I": [
                    { code: "CO-101", name: "Introducción a la Contabilidad", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "CO-102", name: "Matemática Financiera", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 2, pr: 2 },
                    { code: "CO-103", name: "Documentación Comercial y SUNAT", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "CO-104", name: "Comunicación y Redacción", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "II": [
                    { code: "CO-201", name: "Contabilidad General Aplicada", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "CO-202", name: "Administración de Archivos Contables", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "CO-203", name: "Sistema de Información Contable I", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "CO-204", name: "Tributación y Legislación Comercial", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "III": [
                    { code: "CO-301", name: "Contabilidad de Costos Industriales", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "CO-302", name: "Análisis e Interpretación de EEFF", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "CO-303", name: "Dinámica de Plan Contable PCGE", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 2, pr: 2 },
                    { code: "CO-304", name: "Inglés Técnico de Negocios", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "IV": [
                    { code: "CO-401", name: "Contabilidad de Costos Financieros", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "CO-402", name: "Auditoría Tributaria Corporativa", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "CO-403", name: "Regímenes Tributarios SUNAT", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "CO-404", name: "Legislación Laboral General", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "V": [
                    { code: "CO-501", name: "Contabilidad Gubernamental", type: "Obligatorio", credits: 4, status: "Activo", teo: 2, pr: 4 },
                    { code: "CO-502", name: "Formulación de Estados Financieros", type: "Obligatorio", credits: 4, status: "Activo", teo: 2, pr: 4 },
                    { code: "CO-503", name: "Auditoría Financiera Integral", type: "Obligatorio", credits: 3, status: "Activo", teo: 1, pr: 4 },
                    { code: "CO-504", name: "Software Aplicado SISCONT / CONCAR", type: "Obligatorio", credits: 3, status: "Activo", teo: 1, pr: 4 },
                    { code: "CO-505", name: "Ética en los Negocios y Finanzas", type: "Obligatorio", credits: 2, status: "Activo", teo: 1, pr: 2 }
                  ]
                },
                "20": { // Electrónica Industrial
                  "I": [
                    { code: "EE-101", name: "Introducción a la Electricidad", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "EE-102", name: "Matemática Aplicada I", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 2, pr: 2 },
                    { code: "EE-103", name: "Dibujo Técnico Industrial", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "EE-104", name: "Seguridad y Salud Ocupacional", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "II": [
                    { code: "EE-201", name: "Electricidad Básica y Mediciones", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "EE-202", name: "Matemática Aplicada II", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 2, pr: 2 },
                    { code: "EE-203", name: "Tecnología de Materiales", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "EE-204", name: "Informática y Software Técnico", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "III": [
                    { code: "EE-301", name: "Circuitos de Corriente Alterna", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "EE-302", name: "Electrónica Analógica Aplicada", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "EE-303", name: "Instalaciones de Interiores", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "EE-304", name: "Inglés Técnico Académico", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "IV": [
                    { code: "EE-401", name: "Máquinas de Corriente Continua", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "EE-402", name: "Sistemas Neumáticos e Hidráulicos", type: "Obligatorio", credits: 4, status: "Aprobado", teo: 2, pr: 4 },
                    { code: "EE-403", name: "Instalaciones Eléctricas III", type: "Obligatorio", credits: 3, status: "Aprobado", teo: 1, pr: 4 },
                    { code: "EE-404", name: "Relaciones en Entorno de Trabajo", type: "Obligatorio", credits: 2, status: "Aprobado", teo: 1, pr: 2 }
                  ],
                  "V": [
                    { code: "EE-501", name: "Teoría de Circuitos II", type: "Obligatorio", credits: 4, status: "Activo", teo: 2, pr: 4 },
                    { code: "EE-502", name: "Lab. Maquinarias de Potencia", type: "Obligatorio", credits: 4, status: "Activo", teo: 2, pr: 4 },
                    { code: "EE-503", name: "Sistemas de Control Automático II", type: "Obligatorio", credits: 3, status: "Activo", teo: 1, pr: 4 },
                    { code: "EE-504", name: "Instalaciones Industriales Inteligentes", type: "Obligatorio", credits: 3, status: "Activo", teo: 1, pr: 4 },
                    { code: "EE-505", name: "Ética y Deontología Profesional", type: "Obligatorio", credits: 2, status: "Activo", teo: 1, pr: 2 }
                  ]
                }
              };

              // Determine active plan key automatically based on student's active enrollment career
              const activePlanKey = enrollment.programId === "electronica" ? "20" : "52";
              const activeSemesterKey = selectedQueryCycle; // "I" | "II" | "III" | "IV" | "V"
              const activeCoursesList = CORE_PLAN_COURSES[activePlanKey]?.[activeSemesterKey] || CORE_PLAN_COURSES["20"]["V"];

              // Total credits calculation for displayed cycle
              const cycleCreditsSum = activeCoursesList.reduce((sum, c) => sum + c.credits, 0);

              // Standardized GPA calculation based on fixed mapping
              const weightedGpa = activePlanKey === "20" ? 16.42 : 15.95;
              const hasCleanedUpTransition = true;


              return (
                <PageTransition id="closure" className="space-y-6">
                  
                  {/* High Fidelity Header matching Image 1 */}
                  <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
                    <div>
                      <h2 id="acad-view-main" className="text-lg font-black text-[#800521] tracking-tight uppercase font-display leading-none">Consulta Académica</h2>
                      <p className="text-[11px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Plan Curricular del Estudiante e Historial de Avance</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      
                      {/* Periodo Académico - FIJO DE FORMA NO SELECCIONABLE */}
                      <div className="text-left bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg select-none">
                        <span className="text-[9px] text-[#800521] font-extrabold block uppercase mb-0.5 tracking-wider">Periodo Académico</span>
                        <span className="text-xs font-black text-slate-800">2026 - I (Actual)</span>
                      </div>

                      {/* Plan Curricular Registrado - FIJO DE FORMA NO SELECCIONABLE */}
                      <div className="text-left bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg select-none">
                        <span className="text-[9px] text-slate-400 font-extrabold block uppercase mb-0.5 tracking-wider">Plan Curricular Registrado</span>
                        <span className="text-xs font-black text-slate-800">
                          {activePlanKey === "20" ? "Plan 20 - Electrónica Industrial" : "Plan 52 - Contabilidad"}
                        </span>
                      </div>

                      <button
                        onClick={() => alert(`Simulación: Generando y descargando el récord oficial de estudios para el ${activePlanKey === "20" ? "Plan 20 - Electrónica Industrial" : "Plan 52 - Contabilidad"} en formato PDF firmado...`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10.5px] py-1.5 px-4 rounded-lg flex items-center gap-2 select-none uppercase tracking-wide cursor-pointer transition-all h-[34px] shadow-sm font-bold"
                      >
                        <Printer className="w-4 h-4" /> IMPRIMIR RECORD
                      </button>
                    </div>
                  </div>

                  {/* High Fidelity Performance Metrics cards row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* card 1 */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Ciclo Académico Actual</span>
                      <span className="text-lg font-black text-[#800521] mt-1 uppercase tracking-tight">V SEMESTRE</span>
                      <div className="flex items-center gap-1.5 mt-2 bg-red-50 text-[#800521] px-2 py-0.5 rounded text-[9.5px] font-black w-max">
                        <Award className="w-3 h-3 text-[#800521]" /> REGULAR
                      </div>
                    </div>

                    {/* card 2 */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Créditos de Carrera</span>
                      <span className="text-xl font-black text-[#2D3748] mt-1 font-mono">112.0 / 120.0</span>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1 font-semibold">Créditos Aprobados: 93.3%</span>
                    </div>

                    {/* card 3 */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Promedio Ponderado</span>
                      <span className="text-xl font-black text-[#2D3748] mt-1 font-mono">16.42</span>
                      <span className="text-[10px] text-[#800521] font-bold block mt-1 font-semibold">Ubicación: Tercio Superior</span>
                    </div>

                    {/* card 4 */}
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Estado de Matrícula</span>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide mt-1">MATRICULADO</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1 font-semibold">Semestre Regular Activo</span>
                    </div>

                  </div>

                  {/* Dual Sidebar grid layout matching Image 1 exactly */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT CONTAINER: Course selection and curriculum structure table (8-cols) */}
                    <div className="xl:col-span-8 space-y-4">
                      
                      {/* Horizontal Navigation filters */}
                      <div className="flex bg-white p-1 rounded-xl border border-slate-150 overflow-x-auto gap-1">
                        {(["I", "II", "III", "IV", "V"] as const).map((cycle) => (
                          <button
                            key={cycle}
                            onClick={() => setSelectedQueryCycle(cycle)}
                            className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer text-center ${
                              selectedQueryCycle === cycle 
                                ? "bg-[#800521] text-white shadow-sm" 
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {cycle} Ciclo
                          </button>
                        ))}
                      </div>
                    
                      {/* Unified grid list panel */}
                      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
                        
                        {/* Table head info */}
                        {(() => {
                          const cyclePeriodDisplayMap: Record<string, string> = {
                            "V": "Semestre 2026 - I",
                            "IV": "Semestre 2025 - II",
                            "III": "Semestre 2025 - I",
                            "II": "Semestre 2024 - II",
                            "I": "Semestre 2024 - I",
                          };
                          return (
                            <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <span id="label-cycle-selected" className="text-xs font-black text-slate-700 uppercase tracking-wide leading-none">
                                Ciclo {selectedQueryCycle} - Unidades Registradas ({cyclePeriodDisplayMap[selectedQueryCycle] || "Semestre 2026 - I"})
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white border px-2.5 py-1 rounded-lg shadow-sm">
                                Créditos de Ciclo: {cycleCreditsSum?.toFixed(1)}
                              </span>
                            </div>
                          );
                        })()}

                        {/* Interactive list table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left bg-slate-50/20">
                                <th className="p-4 pl-6">Código Curso</th>
                                <th className="p-4">Unidad Didáctica / Asignatura</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-center">Créditos</th>
                                <th className="p-4 text-center">Estado Académico</th>
                                <th className="p-4 text-center">Teo (Horas)</th>
                                <th className="p-4 text-center">Pr (Horas)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {activeCoursesList.map((crs, idx) => {
                                const isApproved = crs.status === "Aprobado";
                                return (
                                  <tr id={`row-course-${idx}`} key={idx} className="hover:bg-slate-50/40 transition-all">
                                    <td className="p-4 pl-6 font-mono text-slate-400 text-[10.5px] font-bold">{crs.code}</td>
                                    <td className="p-4 text-slate-800 font-extrabold text-[12px] max-w-[200px] leading-tight">
                                      {crs.name}
                                    </td>
                                    <td className="p-4 text-slate-500 font-bold text-[10.5px]">{crs.type}</td>
                                    <td className="p-4 text-center text-slate-900 font-mono font-black">{crs.credits}.0</td>
                                    <td className="p-4 text-center">
                                      <span className={`px-2.5 py-0.5 rounded text-[9.5px] uppercase font-bold inline-block border select-none ${
                                        isApproved 
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                          : "bg-amber-50 text-amber-700 border-amber-100"
                                      }`}>
                                        {crs.status}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center font-mono text-slate-405 font-bold">{crs.teo} hrs</td>
                                    <td className="p-4 text-center font-mono text-slate-405 font-bold">{crs.pr} hrs</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                      </div>

                      {/* Cumulative academic requirements of Egreso Checklist */}
                      <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 text-left font-sans">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-4">Requisitos Oficiales para Certificación y Egreso</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div className="p-3 border rounded-lg bg-slate-50/50 border-slate-100 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Créditos Curriculares</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block font-bold">120 / 120 Créditos aprobados. Requisito al día.</span>
                            </div>
                          </div>

                          <div className="p-3 border rounded-lg bg-slate-50/50 border-slate-100 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Proyección Social / Comunitario</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block font-bold">Servicio social complementario acreditado.</span>
                            </div>
                          </div>

                          <div className="p-3 border rounded-lg bg-slate-50/50 border-slate-100 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Certificación de Idioma Extranjero</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block font-bold font-mono">Suficiencia inglés validado Nivel B2 Académico.</span>
                            </div>
                          </div>

                          <div className="p-3 border rounded-lg bg-white border-slate-200 flex items-center gap-3">
                            <div className="h-5 w-5 rounded-full border border-amber-300 bg-amber-50 text-amber-600 flex items-center justify-center font-black text-[10px] shrink-0 animate-pulse">!</div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Prácticas Pre-Profesionales</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block font-bold">Validación modular de prácticas en curso académico.</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* SECONDARY RIGHT SIDEBAR (4-cols) */}
                    <aside className="xl:col-span-4 space-y-6">
                      
                      {/* GPA metric widget */}
                      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs text-center space-y-4">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Promedio de Ciclo</span>
                        
                        {/* Circle diagram displaying weighted averages */}
                        <div className="relative inline-flex items-center justify-center">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="50" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="50" 
                              stroke="#800521" 
                              strokeWidth="10" 
                              fill="transparent" 
                              strokeDasharray="314" 
                              strokeDashoffset={314 - (314 * (weightedGpa / 20))}
                              className="transition-all duration-300" 
                            />
                          </svg>
                          <div className="absolute flex flex-col justify-center items-center">
                            <span className="text-3xl font-black text-slate-800 tracking-tighter">{weightedGpa}</span>
                            <span className="text-[8px] text-slate-400 uppercase font-black">sobre 20</span>
                          </div>
                        </div>

                        <div className="text-xs font-semibold">
                          <span className="text-slate-500">Rendimiento Estimado: </span>
                          <span className={`font-black ${
                            weightedGpa >= 16 ? "text-emerald-600" : weightedGpa >= 13 ? "text-slate-800" : "text-rose-600"
                          }`}>
                            {weightedGpa >= 16 ? "Sobresaliente" : weightedGpa >= 13 ? "Aceptable" : "Bajo Rendimiento"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs font-semibold">
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Créditos de Ciclo</span>
                            <span className="text-slate-900 font-mono text-sm font-black block mt-1">{cycleCreditsSum?.toFixed(1) || "0.0"}</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Cursos de Ciclo</span>
                            <span className="text-slate-900 font-mono text-sm font-black block mt-1">{activeCoursesList.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tutoría / Mentoring direct access widget */}
                      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                          <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-tight block">Tutoría de Carrera</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 rounded-full border flex items-center justify-center font-bold text-slate-700 text-sm">
                            CM
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-850 block">Ing. Carlos Mendoza</span>
                            <span className="text-[10px] text-slate-400 block font-medium">Coordinador & Mentor de Alumnos</span>
                          </div>
                        </div>

                        {/* Interactive message box simulating contact query */}
                        <div className="space-y-2 pt-1">
                          <textarea
                            value={advisorConsultText}
                            onChange={(e) => setAdvisorConsultText(e.target.value)}
                            placeholder="Envíe una consulta académica a su coordinador..."
                            className="w-full h-16 p-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#800521] focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!advisorConsultText.trim()) return;
                              setAdvisorConsultSuccess(true);
                              setAdvisorConsultText("");
                              setTimeout(() => setAdvisorConsultSuccess(false), 5000);
                            }}
                            className="w-full bg-[#800521] hover:bg-[#9F062A] text-white text-[10px] font-black uppercase tracking-wider py-1.5 rounded-md cursor-pointer select-none"
                          >
                            Enviar Mensaje
                          </button>
                          
                          {advisorConsultSuccess && (
                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2 rounded text-[10px] font-semibold">
                              ¡Su consulta académica ha sido enviada al coordinador de carrera! Se responderá en un plazo máximo de 24 horas hábiles.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fast documentation download actions */}
                      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs space-y-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Descarga de Documentación</span>
                        
                        <div className="space-y-2">
                          
                          <button 
                            onClick={() => alert(`Simulación: Generando y descargando Boleta Oficial de Notas de Alumno (${selectedQueryCycle} Ciclo - Periodo Activo).`)}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Boleta de Notas ({selectedQueryCycle} Ciclo)</span>
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button 
                            onClick={() => alert("Simulación: Abriendo Plan Curricular Completo del Estudiante firmado digitalmente por Secretaría Académica.")}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span className="flex items-center gap-2"><ClipboardList className="w-3.5 h-3.5 text-slate-400" /> Plan Curricular Completo</span>
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <button 
                            onClick={() => alert("Simulación: Descargando Ficha de Matrícula Consolidada semestre activo.")}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /> Ficha de Matrícula Activa</span>
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                        </div>
                      </div>

                    </aside>

                  </div>

                </PageTransition>
              );
            })()}

          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}


