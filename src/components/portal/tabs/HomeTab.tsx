import React, { useState } from "react";
import {
  GraduationCap, Users, Building2, ShieldCheck, ArrowRight, Calendar,
  CheckSquare, Landmark, FileText, ChevronDown
} from "lucide-react";
import { careersDetail, faqsList } from "../portalData";

interface HomeTabProps {
  setCurrentTab: (tab: "inicio" | "nosotros" | "programas" | "admision" | "transparencia" | "contactanos") => void;
  setSelectedProgramId: (id: string) => void;
  setProgramSelection: (id: string) => void;
  setSubmitSuccessMsg: (msg: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  setCurrentTab,
  setSelectedProgramId,
  setProgramSelection,
  setSubmitSuccessMsg
}) => {
  const [hoveredCareerId, setHoveredCareerId] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {/* HERO PRINCIPAL INSTITUCIONAL Y REALISTA */}
      <section className="relative min-h-[500px] lg:min-h-[560px] bg-slate-950 flex items-center overflow-hidden">
        {/* Fotografía Realista de Estudiantes del Instituto */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_campus_sfa.jpg"
            alt="Estudiantes del IESTP San Francisco de Asís caminando en el campus"
            className="w-full h-full object-cover object-center scale-100"
          />
          {/* Degradado Granate Institucional desde la Izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#450212] via-[#66031A]/95 via-45% to-transparent z-10" />
        </div>

        {/* Contenido del Hero Integrado en el Lado Izquierdo */}
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-5 text-white">
            {/* Etiqueta de Admisión con Línea Dorada */}
            <div className="inline-flex items-center gap-2 bg-black/40 border-l-4 border-[#CFA020] px-3.5 py-1.5 rounded-r-md text-xs font-bold uppercase tracking-wider text-white">
              <span>ADMISION ORDINARIA 2026 ABIERTA</span>
            </div>

            {/* Título Grande: Blanco + Dorado para "DE ASÍS" */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
              IESTP SAN FRANCISCO<br />
              <span className="text-[#CFA020]">DE ASÍS</span>
            </h2>

            {/* Subtítulo en Blanco Negrita */}
            <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
              Formación técnica de calidad para un mejor futuro.
            </h3>

            {/* Texto Institucional */}
            <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-xl">
              En el IESTP San Francisco de Asís te preparamos con valores, conocimientos y habilidades para que seas un profesional competitivo y comprometido con la sociedad.
            </p>

            {/* Botones Principal (Granate) y Secundario (Borde Blanco) */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                className="bg-[#9F062A] hover:bg-[#800521] text-white font-bold px-6 py-3.5 rounded-md text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>EXAMEN DE ADMISIÓN ORDINARIO</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setCurrentTab("programas")}
                className="bg-transparent hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-md text-xs uppercase tracking-wider border border-white/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>VER PLANES TECNOLÓGICOS</span>
              </button>
            </div>
          </div>

          {/* Detalle Visual Discreto en la Esquina Inferior Derecha */}
          <div className="hidden lg:block lg:col-span-5 relative h-full">
            <div className="absolute bottom-4 right-0 text-right select-none">
              <p className="font-serif italic text-white/95 text-xl sm:text-2xl drop-shadow-md tracking-wide">
                “Tu esfuerzo también es parte de nuestra historia”
              </p>
              <div className="w-36 h-0.5 bg-[#CFA020] ml-auto mt-1 rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        {/* Transición Orgánica Inferior Blanca */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-[50%] z-20 translate-y-3" />
      </section>

      {/* 4. FRANJA DE BENEFICIOS INSTITUCIONALES */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-4 relative z-30 shadow-xs">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

            {/* Beneficio 1 */}
            <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">PROGRAMAS TÉCNICOS</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Formación alineada al mercado laboral</p>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">DOCENTES CALIFICADOS</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Profesionales con experiencia real</p>
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">INFRAESTRUCTURA MODERNA</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Ambientes seguros y equipados</p>
              </div>
            </div>

            {/* Beneficio 4 */}
            <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">COMPROMISO SOCIAL</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Educación que transforma vidas</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CARRERAS DESTACADAS Y PRESENTACIÓN INSTITUCIONAL */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-y border-slate-200/60 overflow-hidden">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[#9F062A] font-black text-xs uppercase tracking-widest block font-mono">CONOCE NUESTRAS ESPECIALIDADES</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Carreras Profesionales Licenciadas
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Formación técnica de 3 años con titulación oficial expedida directamente por el Ministerio de Educación (MINEDU) y pensión mensual de S/ 0.00.
            </p>
          </div>

          {/* Tarjetas Horizontales Alternadas (Zig-Zag) */}
          <div className="space-y-6">
            {/* CARRERA 01: ELECTRICIDAD INDUSTRIAL */}
            <div
              onMouseEnter={() => setHoveredCareerId("electronica")}
              onMouseLeave={() => setHoveredCareerId(null)}
              onClick={() => {
                setSelectedProgramId("electronica");
                setProgramSelection("electronica");
                setCurrentTab("programas");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`group bg-white rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer ${hoveredCareerId === "electronica"
                ? "border-[#9F062A] shadow-2xl scale-[1.015] z-10 bg-gradient-to-r from-rose-50/30 via-white to-white"
                : hoveredCareerId === "contabilidad"
                  ? "border-slate-200/80 shadow-sm opacity-85 scale-[0.985]"
                  : "border-slate-200/90 shadow-md hover:shadow-xl"
                }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[280px]">
                <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 min-h-[220px] lg:min-h-full">
                  <img
                    src={careersDetail[0].image}
                    alt={careersDetail[0].name}
                    className="w-full h-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute top-0 left-0 bg-slate-950/90 text-amber-300 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 border-b border-r border-amber-400/40 rounded-br-xl shadow-md">
                    ● LICENCIAMIENTO MINEDU
                  </div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-[10px] font-extrabold font-mono text-amber-300 uppercase tracking-widest block">ESPECIALIDAD 01</span>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-md">
                      ELECTRICIDAD INDUSTRIAL
                    </h4>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-amber-400 via-[#9F062A] to-amber-400 transition-all duration-500" />
                </div>

                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-[#9F062A] font-mono">01</span>
                      <div className="h-0.5 w-12 group-hover:w-24 bg-amber-400 transition-all duration-500" />
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">TITULACIÓN DIRECTA</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight hidden lg:block">
                      ELECTRICIDAD INDUSTRIAL
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      Diagnostica, instala, programa y realiza el mantenimiento preventivo y correctivo de sistemas eléctricos de media y baja tensión, maquinaria de potencia, automatización industrial mediante PLCs, motores eléctricos y tableros de control.
                    </p>
                  </div>

                  <div className="py-2.5 border-y border-slate-200/80 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">ARANCEL</span>
                      <span className="text-sm font-black text-[#9F062A]">S/ 0.00</span>
                    </div>
                    <div className="border-x border-slate-200/80 px-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">DURACIÓN</span>
                      <span className="text-sm font-black text-slate-900">3 Años</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">HORAS</span>
                      <span className="text-sm font-black text-slate-900">3,080 Hrs</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProgramId("electronica");
                      setProgramSelection("electronica");
                      setCurrentTab("programas");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-3 px-5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-lg active:scale-98"
                  >
                    <span>VER MALLA CURRICULAR Y CURSOS</span>
                    <ArrowRight className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CARRERA 02: CONTABILIDAD FINANCIERA */}
            <div
              onMouseEnter={() => setHoveredCareerId("contabilidad")}
              onMouseLeave={() => setHoveredCareerId(null)}
              onClick={() => {
                setSelectedProgramId("contabilidad");
                setProgramSelection("contabilidad");
                setCurrentTab("programas");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`group bg-white rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer ${hoveredCareerId === "contabilidad"
                ? "border-[#9F062A] shadow-2xl scale-[1.015] z-10 bg-gradient-to-r from-white via-white to-rose-50/30"
                : hoveredCareerId === "electronica"
                  ? "border-slate-200/80 shadow-sm opacity-85 scale-[0.985]"
                  : "border-slate-200/90 shadow-md hover:shadow-xl"
                }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[280px]">
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4 order-2 lg:order-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-[#9F062A] font-mono">02</span>
                      <div className="h-0.5 w-12 group-hover:w-24 bg-amber-400 transition-all duration-500" />
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">TITULACIÓN DIRECTA</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight hidden lg:block">
                      CONTABILIDAD FINANCIERA
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      Domina el control tributario y financiero de acuerdo a las Normas Internacionales de Información Financiera (NIIF), auditoría tributaria en PyMEs, costos de producción y sistematización contable con software ERP moderno.
                    </p>
                  </div>

                  <div className="py-2.5 border-y border-slate-200/80 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">ARANCEL</span>
                      <span className="text-sm font-black text-[#9F062A]">S/ 0.00</span>
                    </div>
                    <div className="border-x border-slate-200/80 px-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">DURACIÓN</span>
                      <span className="text-sm font-black text-slate-900">3 Años</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">HORAS</span>
                      <span className="text-sm font-black text-slate-900">3,040 Hrs</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProgramId("contabilidad");
                      setProgramSelection("contabilidad");
                      setCurrentTab("programas");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-3 px-5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-lg active:scale-98"
                  >
                    <span>VER MALLA CURRICULAR Y CURSOS</span>
                    <ArrowRight className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                </div>

                <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 min-h-[220px] lg:min-h-full order-1 lg:order-2">
                  <img
                    src={careersDetail[1].image}
                    alt={careersDetail[1].name}
                    className="w-full h-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute top-0 left-0 bg-slate-950/90 text-amber-300 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 border-b border-r border-amber-400/40 rounded-br-xl shadow-md">
                    ● LICENCIAMIENTO MINEDU
                  </div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-[10px] font-extrabold font-mono text-amber-300 uppercase tracking-widest block">ESPECIALIDAD 02</span>
                    <h4 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-md">
                      CONTABILIDAD FINANCIERA
                    </h4>
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-amber-400 via-[#9F062A] to-amber-400 transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PASO A PASO DEL PROCESO DE ADMISIÓN */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">
              PROCESO ORDINARIO DE ADMISIÓN 2026-I
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
              Pasos para la Inscripción
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Sigue esta secuencia escalonada de 4 pasos para completar tu pre-inscripción y asegurar tu vacante institucional.
            </p>
          </div>

          <div className="relative pt-6 pb-12">
            <div className="hidden lg:block absolute bottom-12 left-16 right-16 h-1 bg-gradient-to-r from-[#9F062A] via-[#800521] to-[#CFA020] z-0 rounded-full opacity-30" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 relative z-10 items-end">
              {[
                {
                  step: "01",
                  title: "Pre-Inscripción Virtual",
                  desc: "Registra tus datos personales en el formulario web para obtener tu Código Oficial de Postulante.",
                  icon: <CheckSquare className="w-6 h-6 text-[#9F062A]" />,
                  stairClass: "lg:translate-y-12"
                },
                {
                  step: "02",
                  title: "Pago de Tasa Ordinaria",
                  desc: "Abona S/. 120 por derecho de examen en las agencias o agentes del Banco de la Nación.",
                  icon: <Landmark className="w-6 h-6 text-[#9F062A]" />,
                  stairClass: "lg:translate-y-8"
                },
                {
                  step: "03",
                  title: "Examen de Admisión",
                  desc: "Rinde la evaluación presencial de aptitud académica y conocimientos en nuestro campus.",
                  icon: <FileText className="w-6 h-6 text-[#9F062A]" />,
                  stairClass: "lg:translate-y-4"
                },
                {
                  step: "04",
                  title: "Adjudicación y Matrícula",
                  desc: "Con tu vacante obtenida, formaliza tu matrícula semestral e inicia tus clases profesionales.",
                  icon: <GraduationCap className="w-6 h-6 text-[#9F062A]" />,
                  stairClass: "lg:translate-y-0"
                }
              ].map((st, idx) => (
                <div
                  key={idx}
                  className={`bg-white border-2 border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm hover:border-[#9F062A] hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group ${st.stairClass}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] flex items-center justify-center border border-amber-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                        {st.icon}
                      </div>
                      <span className="w-8 h-8 rounded-full bg-[#800521] text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-amber-400/40 shadow-xs">
                        {st.step}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{st.title}</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">{st.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#9F062A] group-hover:text-white transition-all flex items-center justify-center text-slate-500 shadow-2xs">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center">
            <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">RESOLVEMOS TUS DUDAS</span>
            <h3 className="text-2xl sm:text-4xl font-black mt-1 text-slate-900 uppercase tracking-tight">Preguntas Frecuentes</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Encuentra respuestas inmediatas sobre el proceso de admisión y vida académica</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
            {[
              faqsList.slice(0, 4),
              faqsList.slice(4, 8)
            ].map((faqCol, colIdx) => (
              <div key={colIdx} className="space-y-3">
                {faqCol.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? "border-[#9F062A] shadow-md ring-1 ring-[#9F062A]/20 bg-rose-50/10" : "border-slate-200 hover:border-slate-300 hover:shadow-xs"}`}
                    >
                      <button
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="w-full text-left p-4.5 text-xs sm:text-[13px] font-black text-slate-900 uppercase flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <span className="leading-snug">{faq.question}</span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? "bg-[#9F062A] text-amber-300" : "bg-slate-100 text-slate-500"}`}>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                      >
                        <div className="px-4.5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
