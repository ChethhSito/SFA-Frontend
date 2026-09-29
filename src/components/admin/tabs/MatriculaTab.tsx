import React, { useState, useMemo } from "react";
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Search, 
  Users, 
  CreditCard, 
  ArrowRight, 
  BookOpen, 
  Sun, 
  Sunset, 
  Moon, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Filter,
  CheckCircle,
  Building,
  Sparkles,
  UserCheck
} from "lucide-react";
import { Applicant, Enrollment } from "../../../types";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";

interface MatriculaTabProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  selectedPeriodId: string;
  selectedMatriculaDni: string | null;
  setSelectedMatriculaDni: (dni: string | null) => void;
  careerFilter: string;
  setCareerFilter: (c: string) => void;
  matriculaShifts: { [dni: string]: "Mañana" | "Tarde" | "Noche" };
  setMatriculaShifts: React.Dispatch<React.SetStateAction<{ [dni: string]: "Mañana" | "Tarde" | "Noche" }>>;
  matriculaCareers: { [dni: string]: any };
  setMatriculaCareers: React.Dispatch<React.SetStateAction<{ [dni: string]: any }>>;
  matriculaGroups: { [dni: string]: string };
  setMatriculaGroups: React.Dispatch<React.SetStateAction<{ [dni: string]: string }>>;
  setSelectedDossierAppDni: (dni: string | null) => void;
  handleConfirmMatricula: (studentDni: string, shift: "Mañana" | "Tarde" | "Noche", programId: any, groupId?: string) => void;
  handleResetMatricula: (studentDni: string) => void;
  renderPeriodSelector: () => React.ReactNode;
  onNavigateToCajaMatriculas?: () => void;
  onUpdateEnrollments?: (enrs: Enrollment[]) => void;
}

export const MatriculaTab: React.FC<MatriculaTabProps> = ({
  applicants,
  enrollments,
  selectedPeriodId,
  selectedMatriculaDni,
  setSelectedMatriculaDni,
  careerFilter,
  setCareerFilter,
  matriculaShifts,
  setMatriculaShifts,
  matriculaCareers,
  setMatriculaCareers,
  matriculaGroups,
  setMatriculaGroups,
  setSelectedDossierAppDni,
  handleConfirmMatricula,
  handleResetMatricula,
  renderPeriodSelector,
  onNavigateToCajaMatriculas,
  onUpdateEnrollments,
}) => {
  // Local search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "matriculados" | "aptos" | "pendientes">("all");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // 1. Get dynamic careers from MPA
  const activeMpaCareers = useMemo(() => {
    try {
      const saved = localStorage.getItem("mpa_db_careers");
      if (saved) {
        const allC = JSON.parse(saved);
        if (Array.isArray(allC)) {
          return allC.filter((c: any) => c.status === "Activo" || !c.status);
        }
      }
    } catch (e) {
      console.error("Error loading mpa_db_careers", e);
    }
    return [];
  }, []);

  // 2. Get active curriculum version for this active career
  const mpaCurriculumVersions = useMemo(() => {
    try {
      const saved = localStorage.getItem("mpa_db_curriculum_versions");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading mpa_db_curriculum_versions", e);
    }
    return [];
  }, []);

  // 3. Get curriculum mapping (malla mapping)
  const mpaCurriculumMapping = useMemo(() => {
    try {
      const saved = localStorage.getItem("mpa_db_curriculum");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading mpa_db_curriculum", e);
    }
    return [];
  }, []);

  // 4. Get courses list
  const mpaCoursesList = useMemo(() => {
    try {
      const saved = localStorage.getItem("mpa_db_courses");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading mpa_db_courses", e);
    }
    return [];
  }, []);

  // Filter admitted candidates by period (flexible matching like SecretariaTab)
  const admittedCandidates = useMemo(() => {
    return applicants.filter((app) => {
      const matchesPeriod =
        !selectedPeriodId ||
        selectedPeriodId === "all" ||
        app.periodId === selectedPeriodId ||
        !app.periodId ||
        app.periodId === "1" ||
        app.periodId === "p1";

      const isAdmitted =
        app.admitted === true ||
        app.admitted === "ADMITIDO" ||
        app.folderStatus === "Approved" ||
        app.folderStatus === "Enrolled";

      return matchesPeriod && isAdmitted;
    });
  }, [applicants, selectedPeriodId]);

  // Overall metrics calculation
  const metrics = useMemo(() => {
    let matriculadosCount = 0;
    let pagadosCount = 0;
    let pendientesPagoCount = 0;

    admittedCandidates.forEach((cand) => {
      const enr = enrollments.find((e) => e.studentDni === cand.dni);
      if (enr?.academicStatus === "MATRICULADO") matriculadosCount++;
      if (enr?.paymentStatus === "Validado") pagadosCount++;
      else pendientesPagoCount++;
    });

    return {
      total: admittedCandidates.length,
      matriculados: matriculadosCount,
      pagados: pagadosCount,
      pendientesPago: pendientesPagoCount,
    };
  }, [admittedCandidates, enrollments]);

  // Filter admitted candidates by career, search term and status
  const filteredCandidates = useMemo(() => {
    return admittedCandidates.filter((cand) => {
      // Career filter
      if (careerFilter !== "all" && cand.programId !== careerFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const fullName = `${cand.name} ${cand.lastName}`.toLowerCase();
        const matchesDni = (cand.dni || "").includes(term);
        const matchesName = fullName.includes(term);
        if (!matchesDni && !matchesName) return false;
      }

      // Status filter
      const candEnr = enrollments.find((e) => e.studentDni === cand.dni);
      const isEnr = candEnr?.academicStatus === "MATRICULADO";
      const isPaid = candEnr?.paymentStatus === "Validado";

      if (statusFilter === "matriculados") return isEnr;
      if (statusFilter === "aptos") return !isEnr && isPaid;
      if (statusFilter === "pendientes") return !isPaid;

      return true;
    });
  }, [admittedCandidates, careerFilter, searchTerm, statusFilter, enrollments]);

  // Selected candidate logic
  const targetDni = selectedMatriculaDni || (filteredCandidates[0]?.dni || null);
  const targetCandidate = admittedCandidates.find((c) => c.dni === targetDni);
  const existingEnrollment = enrollments.find((e) => e.studentDni === targetDni);

  const activeShift = matriculaShifts[targetDni || ""] || existingEnrollment?.shift || "Mañana";

  // Fallback to first active career from MPA if available
  const defaultCareerId = activeMpaCareers.length > 0 ? activeMpaCareers[0].id : "electronica";
  const activeCareer =
    matriculaCareers[targetDni || ""] || existingEnrollment?.programId || targetCandidate?.programId || defaultCareerId;

  // Find active curriculum version for active career
  const activeVersion = mpaCurriculumVersions.find(
    (v: any) => v.careerId === activeCareer && (v.isActive || v.status === "Activa")
  );

  let cicloICoursesFromMpa: any[] = [];
  if (activeVersion) {
    const versionCoursesMapping = mpaCurriculumMapping.filter(
      (item: any) => item.versionId === activeVersion.id && item.cycle === 1
    );
    const versionCourseIds = versionCoursesMapping.map((m: any) => m.courseId);
    cicloICoursesFromMpa = mpaCoursesList
      .filter((c: any) => versionCourseIds.includes(c.id))
      .map((c: any) => ({
        code: c.code || "CRS-" + c.id.substring(4, 8),
        name: c.name,
        credits: Number(c.credits || 3),
        type: c.type || "Especialidad",
      }));
  }

  const cicloICourses = cicloICoursesFromMpa.length > 0 ? cicloICoursesFromMpa : [
    { code: "ELC-101", name: "Introducción a la Tecnología y Electricidad", credits: 4, type: "Especialidad" },
    { code: "ELC-102", name: "Circuitos Eléctricos y Mediciones Básicas", credits: 5, type: "Especialidad" },
    { code: "MAT-101", name: "Matemática Aplicada para la Industria", credits: 4, type: "General" },
    { code: "SEG-101", name: "Seguridad y Salud en el Trabajo Industrial", credits: 3, type: "General" },
    { code: "COM-101", name: "Comunicación Efectiva e Informática", credits: 4, type: "General" }
  ];

  const isTargetPaid = existingEnrollment?.paymentStatus === "Validado";
  const isTargetEnrolled = existingEnrollment?.academicStatus === "MATRICULADO";

  // Quick payment validation by direct admin override
  const handleQuickValidatePayment = () => {
    if (!targetCandidate || !onUpdateEnrollments) return;

    let updatedList = [...enrollments];
    const idx = updatedList.findIndex(e => e.studentDni === targetCandidate.dni);
    
    if (idx >= 0) {
      updatedList[idx] = {
        ...updatedList[idx],
        paymentStatus: "Validado",
        paymentOperation: updatedList[idx].paymentOperation || `MANUAL-${Date.now().toString().slice(-6)}`
      };
    } else {
      updatedList.push({
        studentDni: targetCandidate.dni,
        programId: targetCandidate.programId,
        academicStatus: "ADMITIDO",
        docs: {
          dniFile: { status: "Validado" },
          certificadoFile: { status: "Validado" },
          partidaFile: { status: "Validado" },
          fotoFile: { status: "Validado" }
        },
        paymentStatus: "Validado",
        paymentOperation: `MANUAL-${Date.now().toString().slice(-6)}`,
        shift: "Mañana"
      });
    }

    onUpdateEnrollments(updatedList);
    setActionSuccessMsg("Pago de matrícula validado exitosamente. Ya puede formalizar la inscripción del alumno.");
    setTimeout(() => setActionSuccessMsg(""), 4500);
  };

  const getCareerName = (id?: string) => {
    if (!id) return "No asignado";
    const found = activeMpaCareers.find((c: any) => c.id === id);
    if (found) return found.name;
    if (id === "electronica") return "Electricidad Industrial";
    if (id === "contabilidad") return "Contabilidad";
    if (id === "sistemas") return "Desarrollo de Sistemas";
    if (id === "enfermeria") return "Enfermería Técnica";
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  return (
    <PageTransition id="matricula" className="space-y-6 text-left pb-12 animate-fade-in">
      
      {/* 1. Header Institucional Elegante */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9F062A] to-[#6c021b] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#9F062A]/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#9F062A]/10 text-[#9F062A] border border-[#9F062A]/20">
                Secretaría Académica • MAMC
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Admisión y Matrícula Regular
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
              Módulo de Ingresantes y Matrícula
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-2xl">
              Formalice la matrícula oficial del Ciclo I para los postulantes que alcanzaron vacante. Configure turno, grupo de estudio y verifique la malla de asignaturas sincronizada con Planificación Académica.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {renderPeriodSelector()}
        </div>
      </div>

      {/* 2. Barra de Métricas Rápidas (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ingresantes</span>
            <span className="text-xl font-black text-slate-900 font-mono leading-tight">{metrics.total}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 font-black border border-sky-100">
            <CreditCard className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pagos Validados</span>
            <span className="text-xl font-black text-sky-700 font-mono leading-tight">{metrics.pagados}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-black border border-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matriculados Oficiales</span>
            <span className="text-xl font-black text-emerald-700 font-mono leading-tight">{metrics.matriculados}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-black border border-amber-100">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pago Pendiente</span>
            <span className="text-xl font-black text-amber-700 font-mono leading-tight">{metrics.pendientesPago}</span>
          </div>
        </div>
      </div>

      {/* Alerta de acción exitosa si aplica */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-xs font-bold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="flex-1">{actionSuccessMsg}</p>
        </div>
      )}

      {/* 3. Panel Principal: Lista Lateral (Izquierda) + Ficha de Configuración (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL IZQUIERDO: LISTA DE INGRESANTES */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          
          {/* Cabecera del panel de selección */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#9F062A]" />
                  Ingresantes Admitidos
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Seleccione un ingresante para procesar su matrícula.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full">
                {filteredCandidates.length}
              </span>
            </div>

            {/* Buscador en tiempo real */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por DNI o apellidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#9F062A] transition-colors"
              />
            </div>

            {/* Filtros de Carrera y Estado */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Programa
                </label>
                <select
                  value={careerFilter}
                  onChange={(e) => {
                    setCareerFilter(e.target.value);
                    setSelectedMatriculaDni(null);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none focus:border-[#9F062A] cursor-pointer"
                >
                  <option value="all">Todas las Carreras</option>
                  {activeMpaCareers.length > 0 ? (
                    activeMpaCareers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="electronica">Electricidad</option>
                      <option value="contabilidad">Contabilidad</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 outline-none focus:border-[#9F062A] cursor-pointer"
                >
                  <option value="all">Todos ({admittedCandidates.length})</option>
                  <option value="aptos">Aptos (Pago OK)</option>
                  <option value="matriculados">Matriculados</option>
                  <option value="pendientes">Pendiente Pago</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista scrollable de ingresantes */}
          <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto custom-scrollbar">
            {filteredCandidates.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Filter className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-600">No se encontraron ingresantes</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {searchTerm ? "Pruebe con otro término de búsqueda o limpie los filtros." : "No hay candidatos admitidos en el periodo seleccionado."}
                </p>
              </div>
            ) : (
              filteredCandidates.map((cand) => {
                const candEnr = enrollments.find((e) => e.studentDni === cand.dni);
                const isEnr = candEnr?.academicStatus === "MATRICULADO";
                const isPaid = candEnr?.paymentStatus === "Validado";
                const isPending = candEnr?.paymentStatus === "Pendiente";
                const isObserved = candEnr?.paymentStatus === "Observado";
                const isSel = cand.dni === targetDni;

                const initials = `${cand.name?.charAt(0) || ""}${cand.lastName?.charAt(0) || ""}`.toUpperCase();

                return (
                  <button
                    key={cand.dni}
                    onClick={() => setSelectedMatriculaDni(cand.dni)}
                    className={`w-full p-3.5 text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                      isSel 
                        ? "bg-gradient-to-r from-[#9F062A]/8 to-transparent border-l-4 border-l-[#9F062A]" 
                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Avatar con iniciales */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
                      isSel 
                        ? "bg-[#9F062A] text-white shadow-xs" 
                        : isEnr 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {initials || "ST"}
                    </div>

                    {/* Información del candidato */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-extrabold text-xs text-slate-900 truncate">
                          {cand.name} {cand.lastName}
                        </span>
                        {isEnr ? (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                            Matriculado
                          </span>
                        ) : isPaid ? (
                          <span className="text-[9px] font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 shrink-0">
                            Apto
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            Admitido
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span className="font-mono text-slate-600 font-bold">DNI {cand.dni}</span>
                        <span className="truncate max-w-[120px] text-slate-400">
                          {getCareerName(cand.programId)}
                        </span>
                      </div>

                      {/* Estado de pago badge */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {isPaid ? (
                          <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pago de Matrícula Validado
                          </span>
                        ) : isPending ? (
                          <span className="text-[9px] font-bold text-amber-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Voucher por Validar
                          </span>
                        ) : isObserved ? (
                          <span className="text-[9px] font-bold text-rose-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Pago Observado
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Sin Pago Registrado
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL DERECHO: DETALLE Y CONFIGURACIÓN DE MATRÍCULA */}
        <div className="lg:col-span-8 space-y-6">
          {targetCandidate ? (
            <div className="space-y-6">
              
              {/* FICHA DEL ESTUDIANTE: BANNER INSTITUCIONAL EJECUTIVO */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl border border-slate-700/60 p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#9F062A]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-[#CFA020] flex items-center justify-center shrink-0 font-black text-lg shadow-inner">
                      {targetCandidate.name?.charAt(0)}{targetCandidate.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] bg-[#9F062A] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Expediente de Ingreso
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          DNI {targetCandidate.dni}
                        </span>
                      </div>
                      <h2 className="text-lg font-black uppercase tracking-wide text-white font-display">
                        {targetCandidate.name} {targetCandidate.lastName}
                      </h2>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        Programa Asignado: <span className="text-amber-400 font-bold">{getCareerName(targetCandidate.programId)}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Contacto: {targetCandidate.email || "Sin correo"} {targetCandidate.phone ? `• Cel: ${targetCandidate.phone}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSelectedDossierAppDni(targetCandidate.dni)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/15 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#CFA020]" />
                      <span>Ver Dossier de Documentos</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isTargetEnrolled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Matriculado Oficial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pendiente de Matrícula
                        </span>
                      )}

                      {isTargetPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CreditCard className="w-3 h-3" /> Caja: Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" /> Caja: No Validado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL: CONDICIONAL DE PAGO */}
              {!isTargetPaid ? (
                /* PANTALLA PROFESIONAL CUANDO EL PAGO NO HA SIDO VALIDADO */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-left space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                        Control de Recaudación • Oficina de Caja
                      </span>
                      <h3 className="text-base font-black text-slate-900 font-display mt-1">
                        Inscripción Bloqueada: Pago de Matrícula Pendiente
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed max-w-2xl">
                        De acuerdo con las directivas de Admisión y Tesorería, el ingresante debe registrar y tener debidamente validado su comprobante de pago de derecho de matrícula regular por el importe de <strong className="text-slate-900 font-black">S/. 250.00</strong> antes de la emisión de su ficha de matrícula y asignación de asignaturas.
                      </p>
                    </div>
                  </div>

                  {/* Tarjeta de Resumen de Recaudación */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#9F062A]" />
                      Estado del Trámite en Caja
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Concepto Institucional</span>
                        <span className="font-extrabold text-slate-800 mt-0.5 block">Matrícula Regular Ciclo I</span>
                        <span className="text-[10px] text-slate-500 font-medium">Tarifa oficial: S/. 250.00</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">N° Operación / Voucher</span>
                        <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                          {existingEnrollment?.paymentOperation || "No registrado aún"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Comprobante de depósito</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Estado en Caja</span>
                        <span className={`text-[11px] font-black mt-0.5 block ${
                          existingEnrollment?.paymentStatus === "Pendiente" 
                            ? "text-amber-700" 
                            : existingEnrollment?.paymentStatus === "Observado"
                            ? "text-rose-700"
                            : "text-slate-600"
                        }`}>
                          {existingEnrollment?.paymentStatus ? existingEnrollment.paymentStatus.toUpperCase() : "NO PAGADO"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Revisión por Tesorería</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones para resolver el bloqueo dirigiendo a Caja */}
                  <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Para matricular al ingresante, la tasa de matrícula regular (S/. 250.00) debe ser validada exclusivamente por la Oficina de Caja & Tesorería.
                    </p>

                    {onNavigateToCajaMatriculas && (
                      <button
                        type="button"
                        onClick={onNavigateToCajaMatriculas}
                        className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#9F062A] hover:bg-[#800521] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ir a Matrículas en Caja</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* FORMULARIO OFICIAL DE CONFIGURACIÓN DE MATRÍCULA (CUANDO EL PAGO ESTÁ OK) */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  
                  {/* Encabezado del Formulario */}
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Requisitos Completados
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          Periodo {selectedPeriodId}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 font-display mt-1">
                        Configuración de Matrícula Regular • Ciclo I
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Establezca el programa académico definitivo, el turno oficial de estudios y asigne la sección de acuerdo con la planificación académica.
                      </p>
                    </div>

                    {isTargetEnrolled && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matrícula Vigente
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-6">

                    {/* PASO 1: CARRERA O PROGRAMA DEFINITIVO */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#9F062A] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                          <span>Carrera Profesional de Destino</span>
                        </label>
                        {activeVersion && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Malla Curricular MPA: {activeVersion.name}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(activeMpaCareers.length > 0
                          ? activeMpaCareers.map((c: any) => ({
                              id: c.id,
                              name: c.name,
                              desc: c.description || `Carrera profesional de ${c.name}. Código institucional: ${c.code || c.id}.`,
                            }))
                          : [
                              {
                                id: "electronica",
                                name: "Electricidad Industrial",
                                desc: "Sistemas eléctricos de media/baja tensión y automatización.",
                              },
                              {
                                id: "contabilidad",
                                name: "Contabilidad",
                                desc: "Auditorías financieras, tributación corporativa e informática aplicada.",
                              },
                            ]
                        ).map((p) => {
                          const isSel = activeCareer === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setMatriculaCareers((prev) => ({ ...prev, [targetDni!]: p.id }));
                              }}
                              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer relative ${
                                isSel
                                  ? "border-[#9F062A] bg-[#9F062A]/5 text-slate-900 shadow-xs ring-2 ring-[#9F062A]/20"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-extrabold text-xs block text-slate-900">{p.name}</span>
                                  {isSel && <Check className="w-4 h-4 text-[#9F062A]" />}
                                </div>
                                <span className="text-[10.5px] leading-relaxed text-slate-500 font-medium block">
                                  {p.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PASO 2: TURNO ACADÉMICO OFICIAL */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#9F062A] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                        <span>Turno Académico Oficial</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { 
                            id: "Mañana" as const, 
                            label: "Turno Mañana", 
                            hours: "08:00 AM - 01:00 PM",
                            icon: <Sun className="w-4 h-4 text-amber-500" />
                          },
                          { 
                            id: "Tarde" as const, 
                            label: "Turno Tarde", 
                            hours: "01:15 PM - 06:15 PM",
                            icon: <Sunset className="w-4 h-4 text-orange-500" />
                          },
                          { 
                            id: "Noche" as const, 
                            label: "Turno Noche", 
                            hours: "06:30 PM - 10:30 PM",
                            icon: <Moon className="w-4 h-4 text-indigo-500" />
                          },
                        ].map((shiftItem) => {
                          const isSel = activeShift === shiftItem.id;
                          return (
                            <button
                              key={shiftItem.id}
                              type="button"
                              onClick={() => {
                                setMatriculaShifts((prev) => ({ ...prev, [targetDni!]: shiftItem.id }));
                              }}
                              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                isSel
                                  ? "border-emerald-600 bg-emerald-50/80 text-slate-900 shadow-xs ring-2 ring-emerald-600/20"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-extrabold text-xs block text-slate-900">{shiftItem.label}</span>
                                {shiftItem.icon}
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold font-mono">
                                {shiftItem.hours}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PASO 3: GRUPO / SECCIÓN ACADÉMICA */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#9F062A] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                          <span>Grupo Académico y Sección Destino (Ciclo I)</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Requerido por Planificación</span>
                      </div>

                      <select
                        value={matriculaGroups[targetDni!] || existingEnrollment?.groupId || ""}
                        onChange={(e) => {
                          setMatriculaGroups({
                            ...matriculaGroups,
                            [targetDni!]: e.target.value,
                          });
                        }}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#9F062A] cursor-pointer"
                      >
                        <option value="">-- SELECCIONE GRUPO ACADÉMICO DEL CICLO I --</option>
                        {(() => {
                          let mpaGroups: any[] = [];
                          try {
                            const rawGroups = localStorage.getItem("mpa_db_groups");
                            if (rawGroups) mpaGroups = JSON.parse(rawGroups);
                          } catch (e) {
                            console.error(e);
                          }

                          if (mpaGroups.length === 0) {
                            return (
                              <>
                                <option value="GRP-ELEC-1A">Sección 1-A (Mañana - Ciclo I)</option>
                                <option value="GRP-ELEC-1B">Sección 1-B (Noche - Ciclo I)</option>
                              </>
                            );
                          }

                          return mpaGroups.map((grp: any) => {
                            let mpaTasks: any[] = [];
                            try {
                              const rawTasks = localStorage.getItem("mpa_db_tasks");
                              if (rawTasks) mpaTasks = JSON.parse(rawTasks);
                            } catch (e) {
                              console.error(e);
                            }
                            const isScheduled = mpaTasks.some((tk: any) => tk.groupId === grp.id);
                            return (
                              <option key={grp.id} value={grp.id}>
                                {grp.name} (Ciclo {grp.cycle}) {isScheduled ? "• Horario Planificado" : "• Sin Programación"}
                              </option>
                            );
                          });
                        })()}
                      </select>
                      <p className="text-[11px] text-slate-400 font-medium">
                        La asignación de grupo conecta la matrícula del alumno con su horario y aula en el portal estudiantil.
                      </p>
                    </div>

                    {/* PASO 4: ASIGNATURAS OFICIALES DEL CICLO I */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#9F062A] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                          <span>Asignaturas a Inscribir en Ciclo I</span>
                        </label>
                        <span className="text-xs font-black font-mono text-[#9F062A] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          {cicloICourses.reduce((acc, c) => acc + (c.credits || 0), 0)} Créditos Académicos
                        </span>
                      </div>

                      <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 overflow-hidden">
                        <div className="divide-y divide-slate-200/70">
                          {cicloICourses.map((course, idx) => (
                            <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-100/60 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 font-bold text-[10px]">
                                  {idx + 1}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 block text-xs">
                                    {course.name}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                                      {course.code}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded font-bold uppercase">
                                      {course.type}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="font-mono font-bold text-[11px] text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-3xs shrink-0">
                                {course.credits} Cr.
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* PIE DE ACCIONES DEL FORMULARIO */}
                  <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      {isTargetEnrolled && (
                        <button
                          type="button"
                          onClick={() => handleResetMatricula(targetDni!)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 hover:text-amber-800 bg-white hover:bg-amber-50 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer a Solo Admitido</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmMatricula(
                          targetDni!,
                          activeShift,
                          activeCareer,
                          matriculaGroups[targetDni!] || existingEnrollment?.groupId || ""
                        )
                      }
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isTargetEnrolled
                          ? "Actualizar Datos de Matrícula"
                          : "Confirmar e Inscribir Matrícula Oficial"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-700">Ningún estudiante seleccionado</h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                Por favor, elija un estudiante admitido de la lista de la izquierda para configurar su turno, grupo y matrícula académica.
              </p>
            </div>
          )}
        </div>

      </div>

    </PageTransition>
  );
};
