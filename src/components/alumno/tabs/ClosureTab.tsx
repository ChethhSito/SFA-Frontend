import React from "react";
import { Printer, Download, Award, CheckCircle2, Mail, FileText, ClipboardList } from "lucide-react";
import { StudentPersonalData, Enrollment, AcademicProgram, CycleStatus } from "../../../types";
import PageTransition from "../../ui/PageTransition";

interface ClosureTabProps {
  personalData: StudentPersonalData;
  enrollment: Enrollment;
  currentProgram?: AcademicProgram;
  selectedAcademicOption: string;
  setSelectedAcademicOption: React.Dispatch<React.SetStateAction<string>>;
  selectedSemesterFilter: string;
  setSelectedSemesterFilter: React.Dispatch<React.SetStateAction<string>>;
  selectedPlan: string;
  setSelectedPlan: React.Dispatch<React.SetStateAction<string>>;
  selectedQueryPeriod: string;
  setSelectedQueryPeriod: React.Dispatch<React.SetStateAction<string>>;
  selectedQueryCycle: "I" | "II" | "III" | "IV" | "V";
  setSelectedQueryCycle: React.Dispatch<React.SetStateAction<"I" | "II" | "III" | "IV" | "V">>;
  simulatedGrades: Record<string, number>;
  setSimulatedGrades: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  advisorConsultText: string;
  setAdvisorConsultText: React.Dispatch<React.SetStateAction<string>>;
  advisorConsultSuccess: boolean;
  setAdvisorConsultSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  cycleStatuses: CycleStatus[];
}

export const ClosureTab: React.FC<ClosureTabProps> = ({
  personalData,
  enrollment,
  currentProgram,
  selectedAcademicOption,
  setSelectedAcademicOption,
  selectedSemesterFilter,
  setSelectedSemesterFilter,
  selectedPlan,
  setSelectedPlan,
  selectedQueryPeriod,
  setSelectedQueryPeriod,
  selectedQueryCycle,
  setSelectedQueryCycle,
  simulatedGrades,
  setSimulatedGrades,
  advisorConsultText,
  setAdvisorConsultText,
  advisorConsultSuccess,
  setAdvisorConsultSuccess,
  cycleStatuses
}) => {
  const CORE_PLAN_COURSES: Record<string, Record<string, Array<{ code: string; name: string; type: string; credits: number; status: string; teo: number; pr: number }>>> = {
    "52": {
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
    "20": {
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

  const activePlanKey = enrollment.programId === "electronica" ? "20" : "52";
  const activeSemesterKey = selectedQueryCycle;
  const activeCoursesList = CORE_PLAN_COURSES[activePlanKey]?.[activeSemesterKey] || CORE_PLAN_COURSES["20"]["V"];
  const cycleCreditsSum = activeCoursesList.reduce((sum, c) => sum + c.credits, 0);
  const weightedGpa = activePlanKey === "20" ? 16.42 : 15.95;

  return (
    <PageTransition id="closure" className="space-y-6">
      {/* High Fidelity Header */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div>
          <h2 id="acad-view-main" className="text-lg font-black text-[#800521] tracking-tight uppercase font-display leading-none">Consulta Académica</h2>
          <p className="text-[11px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">Plan Curricular del Estudiante e Historial de Avance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="text-left bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg select-none">
            <span className="text-[9px] text-[#800521] font-extrabold block uppercase mb-0.5 tracking-wider">Periodo Académico</span>
            <span className="text-xs font-black text-slate-800">2026 - I (Actual)</span>
          </div>

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
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Ciclo Académico Actual</span>
          <span className="text-lg font-black text-[#800521] mt-1 uppercase tracking-tight">V SEMESTRE</span>
          <div className="flex items-center gap-1.5 mt-2 bg-red-50 text-[#800521] px-2 py-0.5 rounded text-[9.5px] font-black w-max">
            <Award className="w-3 h-3 text-[#800521]" /> REGULAR
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Créditos de Carrera</span>
          <span className="text-xl font-black text-[#2D3748] mt-1 font-mono">112.0 / 120.0</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1 font-semibold">Créditos Aprobados: 93.3%</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Promedio Ponderado</span>
          <span className="text-xl font-black text-[#2D3748] mt-1 font-mono">16.42</span>
          <span className="text-[10px] text-[#800521] font-bold block mt-1 font-semibold">Ubicación: Tercio Superior</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between text-left min-h-[110px]">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Estado de Matrícula</span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wide mt-1">MATRICULADO</span>
          <span className="text-[9px] text-slate-400 font-bold block mt-1 font-semibold">Periodo Regular Activo</span>
        </div>
      </div>

      {/* Dual Sidebar grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-4">
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

          <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden text-left">
            {(() => {
              const cyclePeriodDisplayMap: Record<string, string> = {
                "V": "Periodo 2026 - I",
                "IV": "Periodo 2025 - II",
                "III": "Periodo 2025 - I",
                "II": "Periodo 2024 - II",
                "I": "Periodo 2024 - I",
              };
              return (
                <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span id="label-cycle-selected" className="text-xs font-black text-slate-700 uppercase tracking-wide leading-none">
                    Ciclo {selectedQueryCycle} - Unidades Registradas ({cyclePeriodDisplayMap[selectedQueryCycle] || "Periodo 2026 - I"})
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border px-2.5 py-1 rounded-lg shadow-sm">
                    Créditos de Ciclo: {cycleCreditsSum?.toFixed(1)}
                  </span>
                </div>
              );
            })()}

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

        <aside className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs text-center space-y-4">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Promedio de Ciclo</span>
            
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
};
