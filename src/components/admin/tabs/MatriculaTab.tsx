import React from "react";
import { GraduationCap, CheckCircle2, Clock, AlertTriangle, ShieldAlert, FileText } from "lucide-react";
import { Applicant, Enrollment } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
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
}) => {
  // 1. Get dynamic careers from MPA
  let activeMpaCareers: any[] = [];
  try {
    const saved = localStorage.getItem("mpa_db_careers");
    if (saved) {
      const allC = JSON.parse(saved);
      if (Array.isArray(allC)) {
        activeMpaCareers = allC.filter((c: any) => c.status === "Activo" || !c.status);
      }
    }
  } catch (e) {
    console.error("Error loading mpa_db_careers", e);
  }

  // 2. Get active curriculum version for this active career
  let mpaCurriculumVersions: any[] = [];
  try {
    const saved = localStorage.getItem("mpa_db_curriculum_versions");
    if (saved) mpaCurriculumVersions = JSON.parse(saved);
  } catch (e) {
    console.error("Error loading mpa_db_curriculum_versions", e);
  }

  // 3. Get curriculum mapping (malla mapping)
  let mpaCurriculumMapping: any[] = [];
  try {
    const saved = localStorage.getItem("mpa_db_curriculum");
    if (saved) mpaCurriculumMapping = JSON.parse(saved);
  } catch (e) {
    console.error("Error loading mpa_db_curriculum", e);
  }

  // 4. Get courses list
  let mpaCoursesList: any[] = [];
  try {
    const saved = localStorage.getItem("mpa_db_courses");
    if (saved) mpaCoursesList = JSON.parse(saved);
  } catch (e) {
    console.error("Error loading mpa_db_courses", e);
  }

  const admittedCandidates = applicants.filter(
    (app) => app.periodId === selectedPeriodId && (app.admitted === true || app.admitted === "ADMITIDO")
  );
  const filteredAdmittedCandidates =
    careerFilter === "all" ? admittedCandidates : admittedCandidates.filter((c) => c.programId === careerFilter);

  const targetDni = selectedMatriculaDni || (filteredAdmittedCandidates[0]?.dni || null);
  const targetCandidate = filteredAdmittedCandidates.find((c) => c.dni === targetDni);
  const existingEnrollment = enrollments.find((e) => e.studentDni === targetDni);

  const activeShift = matriculaShifts[targetDni || ""] || existingEnrollment?.shift || "Mañana";

  // Fallback to first active career from MPA if available
  const defaultCareerId = activeMpaCareers.length > 0 ? activeMpaCareers[0].id : "electronica";
  const activeCareer =
    matriculaCareers[targetDni || ""] || existingEnrollment?.programId || targetCandidate?.programId || defaultCareerId;

  // Find active curriculum version for active career
  const activeVersion = mpaCurriculumVersions.find(
    (v) => v.careerId === activeCareer && (v.isActive || v.status === "Activa")
  );
  let cicloICoursesFromMpa: any[] = [];
  if (activeVersion) {
    const versionCoursesMapping = mpaCurriculumMapping.filter(
      (item) => item.versionId === activeVersion.id && item.cycle === 1
    );
    const versionCourseIds = versionCoursesMapping.map((m) => m.courseId);
    cicloICoursesFromMpa = mpaCoursesList
      .filter((c) => versionCourseIds.includes(c.id))
      .map((c) => ({
        code: c.code || "CRS-" + c.id.substring(4, 8),
        name: c.name,
        credits: Number(c.credits || 3),
        type: c.type || "Especialidad",
      }));
  }

  const cicloICourses = cicloICoursesFromMpa;
  const hasUsedMpaMalla = cicloICoursesFromMpa.length > 0;

  return (
    <PageTransition id="matricula" className="space-y-6">
      <PageHeader
        title="Módulo de Ingresantes y Matrícula"
        subtitle="Gestione el proceso de matrícula oficial para los estudiantes que han sido previamente admitidos de acuerdo con los resultados del examen."
        icon={<GraduationCap className="w-6 h-6 text-slate-800" />}
        actions={renderPeriodSelector()}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left">
        <div className="xl:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-sm font-bold">Matriculados del Período</CardTitle>
                <select
                  value={careerFilter}
                  onChange={(e) => {
                    setCareerFilter(e.target.value);
                    setSelectedMatriculaDni(null);
                  }}
                  className="bg-white border border-slate-200 rounded px-2.5 py-1 text-[11px] font-extrabold text-slate-700 outline-none focus:border-[#9F062A] cursor-pointer"
                >
                  <option value="all">Todas las Carreras</option>
                  {activeMpaCareers.length > 0 ? (
                    activeMpaCareers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="electronica">Electricidad</option>
                      <option value="contabilidad">Contabilidad</option>
                    </>
                  )}
                </select>
              </div>
              <CardDescription className="text-[11px] mt-1">
                Seleccione un ingresante admitido para administrar su ciclo, turno y asignaturas del primer semestre académico.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAdmittedCandidates.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                  No hay ingresantes admitidos aptos para matricular en esta carrera todavía.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {filteredAdmittedCandidates.map((cand) => {
                    const candEnr = enrollments.find((e) => e.studentDni === cand.dni);
                    const isEnr = candEnr?.academicStatus === "MATRICULADO";
                    const isSel = cand.dni === targetDni;

                    return (
                      <button
                        key={cand.dni}
                        onClick={() => setSelectedMatriculaDni(cand.dni)}
                        className={`w-full p-4 flex flex-col gap-1 text-left transition-colors cursor-pointer ${
                          isSel ? "bg-[#9F062A]/5 border-l-4 border-l-[#9F062A]" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full gap-2">
                          <span className="font-extrabold text-slate-900 text-[11.5px] truncate max-w-[130px]">
                            {cand.name} {cand.lastName}
                          </span>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {isEnr ? (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Matriculado
                              </span>
                            ) : candEnr?.paymentStatus === "Validado" ? (
                              <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sky-500" /> Pendiente matrícula
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600">Admitido</span>
                            )}
                            {(() => {
                              const payStatus = candEnr?.paymentStatus || "No Pagado";
                              if (payStatus === "Validado") {
                                return (
                                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pago validado
                                  </span>
                                );
                              } else if (payStatus === "Pendiente") {
                                return (
                                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-500" /> Pendiente validación
                                  </span>
                                );
                              } else if (payStatus === "Observado") {
                                return (
                                  <span className="text-[10px] font-bold text-red-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-red-600" /> Pago observado
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-[10px] font-bold text-red-700 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-red-600" /> Pendiente de pago
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mt-1">
                          <span>
                            Carrera:{" "}
                            <span className="uppercase text-slate-700">
                              {cand.programId === "electronica" ? "Electricidad" : "Contabilidad"}
                            </span>
                          </span>
                          <span>DNI: {cand.dni}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-8">
          {targetCandidate ? (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-[9px] bg-[#9F062A] text-white px-2 py-0.5 rounded font-black uppercase tracking-widest leading-none">
                    Ficha de Configuración
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-sm font-black uppercase tracking-wide">
                      {targetCandidate.name} {targetCandidate.lastName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedDossierAppDni(targetCandidate.dni)}
                      className="inline-flex items-center gap-1.5 uppercase font-black text-[9px] tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded border border-slate-700/60 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Dossier</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold">
                    DNI Operacional: {targetCandidate.dni} | Correo Electrónico: {targetCandidate.email}
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest font-mono leading-none">
                      Estado Académico
                    </span>
                    <span className="text-[11px] font-black text-amber-400 block uppercase mt-0.5">
                      {existingEnrollment?.academicStatus === "MATRICULADO"
                        ? "REGISTRADO COMO MATRICULADO"
                        : "PENDIENTE DE MATRÍCULA"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-widest font-mono leading-none">
                      Control de Pago (Oficina de Caja)
                    </span>
                    {(() => {
                      const payStatus = existingEnrollment?.paymentStatus || "No Pagado";
                      if (payStatus === "Validado") {
                        return <span className="text-[11px] font-black text-emerald-400 block uppercase mt-0.5">VALIDADO</span>;
                      } else if (payStatus === "Pendiente") {
                        return <span className="text-[11px] font-black text-sky-400 block uppercase mt-0.5">PENDIENTE VALIDACIÓN</span>;
                      } else if (payStatus === "Observado") {
                        return <span className="text-[11px] font-black text-rose-500 block uppercase mt-0.5">PAGO OBSERVADO</span>;
                      } else {
                        return <span className="text-[11px] font-black text-rose-500 block uppercase mt-0.5">PENDIENTE DE PAGO</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader className="border-b border-slate-100">
                  <CardTitle>Configuración de Matrícula Regular - Ciclo / Periodo I</CardTitle>
                  <CardDescription>
                    Determine la Carrera Final de Destino, Turno Oficial (recuerde los 3 turnos mañana, tarde y noche), ciclo actual y verifique la currícula de asignaturas del Ciclo I.
                  </CardDescription>
                </CardHeader>

                {existingEnrollment?.paymentStatus !== "Validado" ? (
                  <div className="p-8 text-center space-y-4 bg-rose-50/10 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-rose-100 text-[#9F062A] flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
                      <ShieldAlert className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">
                        Inscripción Bloqueada por Recaudación
                      </h3>
                      <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                        No se puede matricular a este ingresante porque su derecho de{" "}
                        <span className="font-bold text-slate-800">Matrícula Regular (S/. 250.00)</span> aún no ha sido{" "}
                        <span className="text-[#9F062A] font-black underline">VALIDADO</span> por la Oficina de Caja (MAMC).
                      </p>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 mt-3 text-left space-y-2 shadow-2xs">
                        <p className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">DNI del Alumno:</span>{" "}
                          <span className="font-mono text-slate-800">{targetDni}</span>
                        </p>
                        <p className="flex justify-between border-b pb-1.5">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Estado de Pago:</span>{" "}
                          <span
                            className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                              existingEnrollment?.paymentStatus === "Pendiente"
                                ? "bg-amber-100 text-amber-850 border border-amber-200 animate-pulse"
                                : existingEnrollment?.paymentStatus === "Observado"
                                ? "bg-red-150 text-red-850 border border-red-200"
                                : "bg-slate-150 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {existingEnrollment?.paymentStatus || "PENDIENTE DE PAGO"}
                          </span>
                        </p>
                        {existingEnrollment?.paymentOperation && (
                          <p className="flex justify-between">
                            <span className="text-slate-400 font-bold uppercase text-[9px]">N° de Operación:</span>{" "}
                            <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {existingEnrollment.paymentOperation}
                            </span>
                          </p>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9F062A] font-extrabold leading-normal pt-3">
                        POR FAVOR, REVISE Y APRUEBE EL VOUCHER EN LA SECCIÓN "CAJA (MATRÍCULAS)" ANTES DE CONTINUAR CON LA SECRETARÍA GENERAL.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardContent className="space-y-6 p-6">
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <span>1. Carrera de Destino</span>
                          {hasUsedMpaMalla && (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase leading-none">
                              Unificado con MPA
                            </span>
                          )}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(activeMpaCareers.length > 0
                            ? activeMpaCareers.map((c) => ({
                                id: c.id,
                                name: c.name,
                                desc: c.description || `Carrera profesional de ${c.name}. Código: ${c.code || c.id}.`,
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
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-full cursor-pointer ${
                                  isSel
                                    ? "border-[#9F062A] bg-[#9F062A]/5 text-slate-900 shadow-3xs font-semibold"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span className="font-black text-xs block">{p.name}</span>
                                <span className="text-[9.5px] leading-relaxed text-slate-400 font-medium mt-1">
                                  {p.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                          2. Turno Académico (Mañana, Tarde, Noche)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { id: "Mañana" as const, label: "Turno Mañana", hours: "08:00 AM - 01:00 PM" },
                            { id: "Tarde" as const, label: "Turno Tarde", hours: "01:15 PM - 06:15 PM" },
                            { id: "Noche" as const, label: "Turno Noche", hours: "06:30 PM - 10:30 PM" },
                          ].map((shiftItem) => {
                            const isSel = activeShift === shiftItem.id;
                            return (
                              <button
                                key={shiftItem.id}
                                type="button"
                                onClick={() => {
                                  setMatriculaShifts((prev) => ({ ...prev, [targetDni!]: shiftItem.id }));
                                }}
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col cursor-pointer ${
                                  isSel
                                    ? "border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-3xs font-semibold"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span className="font-extrabold text-xs block">{shiftItem.label}</span>
                                <span className="text-[9px] text-slate-400 font-bold mt-1 font-mono">
                                  {shiftItem.hours}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                          3. Grupo Académico Destino *
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={matriculaGroups[targetDni!] || existingEnrollment?.groupId || ""}
                            onChange={(e) => {
                              setMatriculaGroups({
                                ...matriculaGroups,
                                [targetDni!]: e.target.value,
                              });
                            }}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-[#9F062A] cursor-pointer"
                          >
                            <option value="">-- SELECCIONE GRUPO ACADÉMICO --</option>
                            {(() => {
                              let mpaGroups: any[] = [];
                              try {
                                const rawGroups = localStorage.getItem("mpa_db_groups");
                                if (rawGroups) mpaGroups = JSON.parse(rawGroups);
                              } catch (e) {
                                console.error(e);
                              }

                              return mpaGroups.map((grp) => {
                                let mpaTasks: any[] = [];
                                try {
                                  const rawTasks = localStorage.getItem("mpa_db_tasks");
                                  if (rawTasks) mpaTasks = JSON.parse(rawTasks);
                                } catch (e) {
                                  console.error(e);
                                }
                                const isScheduled = mpaTasks.some((tk) => tk.groupId === grp.id);
                                return (
                                  <option key={grp.id} value={grp.id}>
                                    {grp.name} (Ciclo {grp.cycle}) {isScheduled ? "Programado" : "Sin Programación"}
                                  </option>
                                );
                              });
                            })()}
                          </select>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-normal">
                          De acuerdo con las políticas del módulo de planificación (MPA), el grupo debe poseer al menos un curso programado.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-left">
                        <div>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">
                            4. Ciclo Autorizado
                          </span>
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wide mt-0.5">
                            Ciclo I (Primer Periodo Regular)
                          </span>
                        </div>
                        <span className="px-2.5 py-1 text-[9px] bg-sky-50 text-sky-700 border border-sky-200 rounded font-black uppercase">
                          Ingresante
                        </span>
                      </div>

                      <div className="space-y-3 text-left">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                            <span>5. Asignaturas de Currícula para Inscripción</span>
                            {hasUsedMpaMalla ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0">
                                Currícula MPA: {activeVersion?.name}
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-[#9F062A] border border-rose-200 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none shrink-0">
                                Sin Configuración en MPA
                              </span>
                            )}
                          </label>
                          <span className="text-[9.5px] text-slate-400 font-extrabold font-mono uppercase">
                            Créditos Totales: {cicloICourses.reduce((a, c) => a + c.credits, 0)}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-150">
                          {cicloICourses.length === 0 ? (
                            <div className="p-6 text-center text-[#9F062A] bg-rose-50/25 border border-rose-100 rounded-xl text-xs font-bold space-y-1">
                              <p>No existen asignaturas pre-diseñadas para el Ciclo I en esta carrera.</p>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                Configure primero la malla/versión curricular y sus cursos asociados dentro de la Planificación Académica (MPA).
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-150">
                              {cicloICourses.map((course, cIdx) => (
                                <div key={cIdx} className="p-3.5 flex justify-between items-center text-xs">
                                  <div className="space-y-0.5">
                                    <span className="font-black text-slate-800 block text-[11px]">{course.name}</span>
                                    <div className="flex gap-1.5 items-center">
                                      <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">
                                        {course.code}
                                      </span>
                                      <span className="text-[9px] text-slate-400">•</span>
                                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                                        {course.type}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-bold text-slate-600 bg-white px-2 py-1 border rounded text-[10px] font-mono shrink-0 select-none">
                                    {course.credits} Cr.
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between gap-3 rounded-b-xl">
                      <div>
                        {existingEnrollment?.academicStatus === "MATRICULADO" && (
                          <Button
                            type="button"
                            onClick={() => handleResetMatricula(targetDni!)}
                            variant="outline"
                            size="sm"
                            className="font-extrabold tracking-wide text-amber-700 border-amber-250 bg-white hover:bg-amber-50"
                          >
                            Restablecer a Admitido
                          </Button>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={() =>
                          handleConfirmMatricula(
                            targetDni!,
                            activeShift,
                            activeCareer,
                            matriculaGroups[targetDni!] || existingEnrollment?.groupId || ""
                          )
                        }
                        variant="primary"
                        size="sm"
                        className="font-black uppercase tracking-wider text-[11px] bg-emerald-600 hover:bg-emerald-700"
                      >
                        {existingEnrollment?.academicStatus === "MATRICULADO"
                          ? "Actualizar Matrícula"
                          : "Confirmar e Inscribir Matrícula de Ciclo I"}
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 font-semibold border-2 border-dashed border-slate-200 rounded-xl">
              Por favor, seleccione un estudiante disponible de la lista izquierda para ingresar su matrícula.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
