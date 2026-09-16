import React from "react";
import { 
  Zap, Cpu, Sliders, Award, ChevronRight, ChevronDown, BookOpen, Clock, CheckCircle2, 
  Users, Upload, Plus, AlertCircle, FileText, CheckCircle
} from "lucide-react";
import { CourseMaterial, CourseAssignment, CourseEvaluation, AcademicProgram, StudentPersonalData } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface ClassesTabProps {
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

  const Card = ({ children, className = "" }: any) => <div className={`bg-white rounded-xl border border-slate-100 p-6 shadow-xs ${className}`}>{children}</div>;
  const CardHeader = ({ children, className = "" }: any) => <div className={`space-y-1.5 ${className}`}>{children}</div>;
  const CardTitle = ({ children, className = "" }: any) => <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
  const CardContent = ({ children, className = "" }: any) => <div className={`pt-0 ${className}`}>{children}</div>;
  const PageHeader = ({ title, subtitle, icon }: any) => (
    <div className="flex items-center gap-3 border-b pb-4 text-left">
      {icon}
      <div>
        <h2 className="text-lg font-bold text-slate-900 font-display">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>}
      </div>
    </div>
  );

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
    const topics: Record<string, { topic: string, desc: string }[]> = {
      "EE-101": [
        { topic: "Introducción a la Automatización Industrial", desc: "Syllabus del curso, pirámide de automatización, arquitecturas de control." },
        { topic: "Sensores y Actuadores de Campo", desc: "Mediciones analógicas y discretas, actuadores neumáticos y contactores." },
        { topic: "Controladores Lógicos Programables", desc: "Controladores Lógicos Programables: Arquitectura del PLC Siemens S7-1200, módulos de comunicación y direccionamiento." },
        { topic: "Lógica de Contactos Ladder", desc: "Lógica de relés combinatoria, contactos NA/NC, bobinas, temporizadores TON/TOF." },
        { topic: "Temporizadores y Conteo de Eventos", desc: "Configuración de temporizadores en cascada y contadores CTU/CTD." },
        { topic: "Interfaces Hombre-Máquina (HMI)", desc: "Sistemas HMI de panel dinámico, botones, indicadores luminosos y alarmas." },
        { topic: "Sistemas SCADA", desc: "Supervisión remota, visualización de tendencias, base de datos de tags lectivos." },
        { topic: "Seguridad Industrial y Redes", desc: "Normativas de seguridad en celdas de automatización y buses de campo (Profinet)." },
        { topic: "Evaluación Parcial Práctica", desc: "Examen de control secuencial por lotes en estación modular síncrona." },
        { topic: "Variadores de Frecuencia", desc: "Integración de variador de velocidad con motor mediante señales analógicas." },
        { topic: "Procesamiento Analógico", desc: "Escalamiento normado de señales de temperatura, presión y nivel en PLC." },
        { topic: "Control PID Avanzado", desc: "Sintonización empírica de bucles de control PID mediante autotuning." }
      ],
      "EE-403": [
        { topic: "Sistemas de Distribución Eléctrica", desc: "Topologías de redes urbanas e industriales de media y baja tensión." },
        { topic: "Conductores y Canalizaciones", desc: "Cálculo de sección por capacidad de corriente y caída de tensión." },
        { topic: "Celdas de Media Tensión", desc: "Interruptores de potencia, seccionadores y sistemas de protección SF6." },
        { topic: "Transformadores de Distribución", desc: "Conexiones delta-estrella, refrigeración, ensayos de vacío y cortocircuito." }
      ]
    };

    const courseList = topics[courseCode];
    if (courseList && courseList[week - 1]) {
      return courseList[week - 1];
    }
    return {
      topic: `Tema de Aprendizaje - Semana ${week}`,
      desc: `Unidad didáctica del plan curricular para la carrera correspondiente al programa de estudios de ${courseCode}.`
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classesCoursesData.map((courseItem) => {
            const averageGrade = courseItem.code === "EE-101" ? "16.8" : courseItem.code === "EE-403" ? "15.0" : "15.5";
            return (
              <Card key={courseItem.id} className="border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden bg-white hover:shadow-md transition-all duration-200">
                <div className="p-5 border-b border-slate-100 bg-slate-50/40 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black text-[#800521] bg-[#800521]/10 border border-[#800521]/25 px-2.5 py-1 rounded-xs font-mono">
                      {courseItem.code}
                    </span>
                    <span className="text-[9.5px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xs uppercase tracking-wider">
                      {courseItem.credits} Créditos
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase font-display pt-1">
                    {courseItem.name}
                  </h3>
                </div>

                <div className="p-5 space-y-2.5 text-xs text-slate-600 font-medium leading-relaxed divide-y divide-slate-100">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Carrera:</span>
                    <span className="text-slate-800 font-extrabold uppercase text-[10.5px] truncate max-w-[180px]">
                      {currentProgram?.name || "ELECTRICIDAD INDUSTRIAL"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Grupo:</span>
                    <span className="text-slate-800 font-bold uppercase">{courseItem.group || "Grupo A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Currícula:</span>
                    <span className="text-slate-800 font-mono font-bold text-slate-550">{courseItem.curriculum || "Diseño Curricular 2026"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Aula / Taller:</span>
                    <span className="text-slate-800 font-extrabold text-[#800521] truncate max-w-[180px]">
                      {courseItem.classroom}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Cant. Alumnos:</span>
                    <span className="text-slate-850 font-bold">{courseItem.studentCount || 5} Matriculados</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Horario:</span>
                    <span className="text-slate-800 font-mono font-extrabold text-slate-700 truncate max-w-[180px]">
                      {courseItem.schedule}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">Promedio Estimado:</span>
                    <span className="text-[#800521] font-black font-mono text-xs">{averageGrade} / 20</span>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setSelectedCourseDetail(courseItem.name);
                      setActiveCourseSection("general");
                      setSelectedClassWeek(1);
                      setSelectedClassWeekOption("materiales");
                    }}
                    className="w-full bg-[#800521] hover:bg-[#9F062A] text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer font-bold select-none"
                  >
                    Gestionar Curso <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </PageTransition>
    );
  }

  const getMappedCourseId = (code: string) => {
    if (code === "EE-101") return "cur-elec-1"; 
    if (code === "EE-403") return "cur-elec-2"; 
    if (code === "EE-502") return "cur-elec-3"; 
    return "cur-elec-1";
  };

  const activeCourseDbId = getMappedCourseId(activeCourse.code);

  const filteredDBMaterials = materials.filter(m => {
    const courseMatches = m.courseId === activeCourse.id || m.courseId === activeCourseDbId;
    return courseMatches && (m.title.includes(`[Semana ${selectedClassWeek}]`) || m.title.includes(`Semana ${selectedClassWeek}`));
  });

  const filteredDBAssignments = assignments.filter(a => {
    const courseMatches = a.courseId === activeCourse.id || a.courseId === activeCourseDbId;
    return courseMatches && (a.title.includes(`[Semana ${selectedClassWeek}]`) || a.title.includes(`Semana ${selectedClassWeek}`) || selectedClassWeek === 1);
  });

  const fallbackAssignments = filteredDBAssignments.length > 0 ? filteredDBAssignments : [
    {
      id: `fasg-1-${selectedClassWeek}`,
      courseId: activeCourseDbId,
      title: `Tarea Virtual Semana ${selectedClassWeek}: Cuestionario y Práctica`,
      description: `Resuelva el cuestionario de afianzamiento sobre los temas tratados en esta sección de ${activeCourse.name}. Presentar informe técnico individual en PDF.`,
      dueDate: `2026-06-${Math.min(28, 5 + selectedClassWeek)}`,
      rubric: "Estructura: 10pts, Lógica y Simulación: 10pts",
      attachment: `guia_de_laboratorio_semana_${selectedClassWeek}.pdf`,
      submissions: []
    }
  ];

  const getFallbackMaterialsForWeek = (week: number, name: string, code: string) => {
    return [
      {
        id: `fmat-1-${week}`,
        title: `Lectura Obligatoria: Fundamentos de ${name} (Semana ${week})`,
        date: `2026-05-${10 + week}`,
        fileName: `silabo_lectura_semana_${week}_${code.toLowerCase()}.pdf`
      },
      {
        id: `fmat-2-${week}`,
        title: `Diapositivas de Clase: Aplicaciones Críticas y Guía Práctica`,
        date: `2026-05-${12 + week}`,
        fileName: `slides_presentacion_semanal_v${week}.pptx`
      }
    ];
  };

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
    
    alert(`¡Archivo "${customFileName}" subido exitosamente a la plataforma educativa como evidencia para la evaluación!`);
  };

  const toggleWeekExpandedLocal = (wNum: number) => {
    setExpandedStudentWeeks(prev => ({ ...prev, [wNum]: !prev[wNum] }));
  };

  const averageGrade = activeCourse.code === "EE-101" ? "16.8" : activeCourse.code === "EE-403" ? "15.0" : "15.5";

  return (
    <PageTransition id="classes-workspace" className="flex flex-col md:flex-row gap-6 items-start text-left">
      {/* LEFT SUB-SIDEBAR: Estructura Académica */}
      <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden select-none text-left">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <span className="text-[9px] font-black text-[#8B0026] bg-red-50 border border-red-150 px-2 py-0.5 rounded-sm select-none block w-max uppercase tracking-widest font-mono">
            Asignatura: {activeCourse.code}
          </span>
          <h3 className="text-xs font-black text-slate-900 tracking-tight block mt-1.5 truncate uppercase" title={activeCourse.name}>
            {activeCourse.name}
          </h3>
          <p className="text-[9px] text-[#CFA020] font-bold tracking-wider uppercase block mt-1">
            Estructura Académica
          </p>
        </div>

        <div className="p-2 space-y-1 divide-y divide-slate-100/50 max-h-[500px] overflow-y-auto">
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
            
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((wNum) => {
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

      {/* RIGHT PANEL: Dynamic View Workspace */}
      <div className="flex-1 w-full space-y-6">
        {activeCourseSection === "general" && (
          <div className="space-y-6">
            <div className="relative bg-[#800521] text-white rounded-xl shadow-md p-6 overflow-hidden text-left border-b-4 border-amber-500">
              <div className="absolute inset-0 bg-linear-gradient(to right,rgba(128,5,33,0.95),rgba(0,0,0,0.65))" />
              <div className="relative z-10 space-y-2">
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 w-max select-none rounded-xs block font-mono">
                  INTRANET ACADÉMICA • PORTAL ALUMNO
                </span>
                <h2 className="text-xl md:text-2xl font-black font-display tracking-tight leading-none pt-1">
                  {activeCourse.name}
                </h2>
                <p className="text-xs text-slate-200 font-medium tracking-wide">
                  Plan Curricular IESTP San Francisco de Asís • Ciclo Académico Regular
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Alumnos Inscritos</span>
                <span className="text-lg font-black text-slate-800 block mt-1.5">{activeCourse.studentCount || 5} Matriculados</span>
                <span className="text-[8.5px] text-amber-600 font-bold block mt-0.5 uppercase tracking-wide">● 100% activos</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Materiales Activos</span>
                <span className="text-lg font-black text-[#800521] block mt-1.5">24 archivos</span>
                <span className="text-[8.5px] text-slate-450 font-bold block mt-0.5">Syllabus publicado</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tareas Publicadas</span>
                <span className="text-lg font-black text-slate-800 block mt-1.5">12 talleres / tareas</span>
                <span className="text-[8.5px] text-slate-450 font-bold block mt-0.5">Con rúbricas activas</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Notas Registradas</span>
                <span className="text-lg font-black text-slate-800 block mt-1.5">3 parciales</span>
                <span className="text-[8.5px] text-slate-450 font-bold block mt-0.5">En registro auxiliar</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left col-span-2 md:col-span-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Promedio Parcial</span>
                <span className="text-lg font-black text-emerald-700 block mt-1.5">{averageGrade} / 20</span>
                <span className="text-[8.5px] text-emerald-600 font-bold block mt-0.5 uppercase tracking-wide">● Situación: Aprobado</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-left">
                <div className="p-4 border-b border-slate-200 bg-slate-50/40">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 font-display">
                    FICHA TÉCNICA DE LA ASIGNATURA ASIGNADA
                  </h3>
                </div>
                <div className="p-4 divide-y divide-slate-100 text-xs text-slate-700 font-medium leading-relaxed">
                  {[
                    { k: "Código del curso:", v: activeCourse.code },
                    { k: "Nombre del curso:", v: activeCourse.name },
                    { k: "Carrera Profesional:", v: currentProgram?.name || "ELECTRICIDAD INDUSTRIAL" },
                    { k: "Grupo Académico:", v: activeCourse.group || "Grupo A" },
                    { k: "Malla / Diseño Curricular:", v: activeCourse.curriculum || "Diseño Curricular 2026" },
                    { k: "Créditos Académicos:", v: `${activeCourse.credits} Créditos Oficiales` },
                    { k: "Aula o Laboratorio:", v: activeCourse.classroom },
                    { k: "Cantidad de Alumnos:", v: `${activeCourse.studentCount || 5} Alumnos Matriculados` },
                    { k: "Horario Lectivo Oficial:", v: activeCourse.schedule },
                    { k: "Rango de Semestre:", v: "2026-04-06 / 2026-07-24 (Regular)" },
                    { k: "Catedrático Titular:", v: activeCourse.code.startsWith("EE") ? "Ing. César Augusto Valdivia Rojas" : "Ing. Carlos Mendoza Sánchez" }
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
                  <p className="text-slate-800 font-black uppercase text-[10.5px]">Rendimiento Óptimo</p>
                  <p className="text-slate-400 font-semibold">Su desempeño para este curso está en el rango superior del semestre.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCourseSection === "horarios" && (
          <div className="space-y-6">
            <PageHeader
              title="Horarios Lectivos Oficiales"
              subtitle="Distribución horaria presencial programada para el semestre en vigor."
              icon={<Clock className="w-5 h-5 text-[#8B0026]" />}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-slate-50/40">
                  <div>
                    <span className="text-[10px] text-amber-600 font-black uppercase block font-mono">Sesión Programada</span>
                    <CardTitle className="uppercase text-slate-800 text-sm mt-1">Clase Teórica - Práctica</CardTitle>
                  </div>
                  <span className="px-2.5 py-1 bg-[#8B0026]/10 text-[#8B0026] border border-[#8B0026]/20 font-black text-[9px] uppercase rounded-sm">
                    {activeCourse.schedule.split(" ")[0]}
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5 text-xs text-slate-600 font-bold leading-normal">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400 font-semibold">Horario Establecido:</span>
                    <span className="text-slate-900 font-mono font-extrabold">{activeCourse.schedule.substring(activeCourse.schedule.indexOf(" ") + 1)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-slate-400 font-semibold">Aula / Laboratorio:</span>
                    <span className="text-[#8B0026] uppercase font-extrabold">{activeCourse.classroom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Frecuencia de Repetición:</span>
                    <span className="text-slate-900 uppercase font-black tracking-wide text-[10.5px]">Semanal síncrono</span>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg text-center border border-emerald-100">
                    <span className="text-[9px] text-emerald-800 font-bold uppercase block">Situación de Curso</span>
                    <span className="text-lg font-black text-emerald-950 block mt-1">Aprobado</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Promedio Final</span>
                    <span className="text-lg font-black text-slate-800 block mt-1 font-mono">{averageGrade}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Asistencia Total</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">95.5%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center border">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Horas Realizadas</span>
                    <span className="text-lg font-black text-slate-800 block mt-1">96 Horas</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
                  <span className="font-extrabold text-slate-800 block mb-3 uppercase text-[10.5px] tracking-wide">
                    Matriz Trimestral de Trabajos y Evaluaciones Continuas
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => {
                      const hasGrade = w < 4;
                      const gr = hasGrade ? (w === 1 ? 16 : w === 2 ? 17 : 18) : "NR";
                      return (
                        <div key={w} className="bg-white p-2.5 rounded border border-slate-200 flex flex-col items-center justify-between">
                          <span className="text-[9.5px] text-slate-400 font-bold">Sem {w}</span>
                          <span className={`text-[11.5px] font-mono font-black mt-1 ${hasGrade ? "text-[#800521]" : "text-slate-400"}`}>
                            {gr}
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
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-left font-sans flex items-start gap-4">
                <div className="h-10 w-10 bg-[#8B0026]/10 text-[#8B0026] border border-red-150 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                  S{selectedClassWeek}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight uppercase">
                    Tema: {weekTheme.topic}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold block mt-1">
                    {weekTheme.desc}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                {selectedClassWeekOption === "asistencia" && (
                  <div className="space-y-3 font-sans">
                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-100 p-3 rounded-lg text-[11px] font-bold">
                      ✔ Control de Asistencia Semanal Procesada Correctamente.
                    </div>
                    <div className="border border-slate-150 rounded-lg p-4 space-y-3.5">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Estado de Asistencia</span>
                        <span className="bg-emerald-100 text-emerald-800 font-black border border-emerald-200 px-2.5 py-0.5 rounded text-[10px] uppercase">
                          Presente
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Fecha de Control:</span>
                        <span className="text-slate-800 font-extrabold">2026-05-{10 + selectedClassWeek}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Hora de Entrada Registrada:</span>
                        <span className="text-slate-800 font-mono font-bold">08:05 AM</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Validado por Docente Titular:</span>
                        <span className="text-slate-800 font-extrabold">Sí, firma digitalizada.</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedClassWeekOption === "materiales" && (() => {
                  const mats = filteredDBMaterials.length > 0 ? filteredDBMaterials : getFallbackMaterialsForWeek(selectedClassWeek, activeCourse.name, activeCourse.code);
                  return (
                    <div className="space-y-3">
                      <div className="bg-amber-50 text-amber-900 border border-amber-100 p-3 rounded-lg text-[11px] font-bold">
                        📚 Recursos académicos oficiales para la sesión académica de la <strong>Semana {selectedClassWeek}</strong>.
                      </div>
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
                            <button
                              onClick={() => alert(`Se ha emulado la descarga del material adjunto: ${m.fileName}`)}
                              className="bg-[#800521]/10 hover:bg-[#800521] text-[#800521] hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer select-none"
                            >
                              Descargar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {selectedClassWeekOption === "tareas" && (() => {
                  const asgs = fallbackAssignments;
                  return (
                    <div className="space-y-4">
                      {asgs.map((asg: any) => {
                        const prevSub = asg.submissions?.find((s: any) => s.studentDni === studentDni || s.studentDni === "12345678");
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

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 space-y-1 font-sans">
                              <div>📅 <span className="text-slate-400">Fecha Límite:</span> <span className="text-slate-800 font-extrabold">{asg.dueDate}</span></div>
                              {asg.rubric && <div>💯 <span className="text-slate-400">Rúbrica de Evaluación:</span> <span className="text-slate-800 font-black">{asg.rubric}</span></div>}
                              {asg.attachment && <div>📁 <span className="text-slate-400">Guía de Apoyo:</span> <span className="text-blue-600 underline font-mono">{asg.attachment}</span></div>}
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
                                      ⌛ Esperando Calificación del Docente
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
                                          alert("Por favor digite un nombre de archivo válido.");
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
                  const weekAsgs = fallbackAssignments;
                  const sub = weekAsgs[0]?.submissions?.find((s: any) => s.studentDni === studentDni || s.studentDni === "12345678");
                  const submissionFile = simulationHWFiles[weekAsgs[0]?.id] || sub?.fileName;
                  
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
                            <div className="text-center p-3 text-slate-450 font-semibold italic text-[11px]">
                              ⚠️ Aún no registra entrega de trabajo para esta semana.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {selectedClassWeekOption === "observaciones" && (
                  <div className="space-y-3 font-sans">
                    <div className="bg-sky-50 text-sky-900 border border-sky-100 p-3 rounded-lg text-[11px] font-bold">
                      📌 Bitácora de seguimiento escolar. Anotaciones registradas por el docente encargado de aula para la <strong>Semana {selectedClassWeek}</strong>.
                    </div>
                    <p className="text-xs text-slate-500 italic p-4 text-center border rounded-lg bg-slate-50/50">
                      No se registran observaciones disciplinarias ni de rendimiento para esta semana en su ficha del alumno.
                    </p>
                  </div>
                )}

                {selectedClassWeekOption === "evidencias" && (() => {
                  const weekAsgs = fallbackAssignments;
                  const sub = weekAsgs[0]?.submissions?.find((s: any) => s.studentDni === studentDni || s.studentDni === "12345678");
                  const submissionFile = simulationHWFiles[weekAsgs[0]?.id] || sub?.fileName;
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
    </PageTransition>
  );
};
