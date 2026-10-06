import React, { useState } from "react";
import {
  Award, Compass, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Zap, Users,
  HeartHandshake, Download
} from "lucide-react";

export const NosotrosTab: React.FC = () => {
  const [currentValueIdx, setCurrentValueIdx] = useState(0);

  const valuesList = [
    {
      title: "Excelencia Académica",
      subtitle: "Calidad Formativa de Nivel Superior",
      desc: "Rigurosidad en el aprendizaje práctico, actualización tecnológica constante y desarrollo de competencias profesionales alineadas a las demandas reales del mercado laboral peruano.",
      icon: <CheckCircle2 className="w-8 h-8 text-[#9F062A]" />
    },
    {
      title: "Ética y Deontología",
      subtitle: "Integridad y Transparencia",
      desc: "Formación integral sustentada en valores humanos, honestidad profesional, transparencia en la gestión académica y un compromiso indestructible con la comunidad estudiantil.",
      icon: <ShieldCheck className="w-8 h-8 text-[#9F062A]" />
    },
    {
      title: "Innovación Tecnológica",
      subtitle: "Equipamiento Industrial Moderno",
      desc: "Uso de laboratorios equipados con tecnología industrial avanzada, simuladores ERP de última generación, módulos PLC automatizados y plataformas digitales completas.",
      icon: <Zap className="w-8 h-8 text-[#9F062A]" />
    },
    {
      title: "Inclusión y Equidad",
      subtitle: "Educación Superior Gratuita y Abierta",
      desc: "Garantizamos el derecho universal a la educación técnica profesional de calidad sin pensiones mensuales (S/. 0.00) ni barreras económicas en Villa María del Triunfo.",
      icon: <Users className="w-8 h-8 text-[#9F062A]" />
    },
    {
      title: "Compromiso Social",
      subtitle: "Transformación Socioeconómica",
      desc: "Alianzas estratégicas con empresas e instituciones para impulsar proyectos de investigación aplicada, prácticas pre-profesionales y alta tasa de empleabilidad.",
      icon: <HeartHandshake className="w-8 h-8 text-[#9F062A]" />
    }
  ];

  const total = valuesList.length;
  const activeIdx = currentValueIdx % total;
  const leftIdx = (activeIdx + total - 1) % total;
  const rightIdx = (activeIdx + 1) % total;

  const leftVal = valuesList[leftIdx];
  const centerVal = valuesList[activeIdx];
  const rightVal = valuesList[rightIdx];

  return (
    <div className="bg-slate-50 py-12 sm:py-16 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* 1. Header Banner Institucional con Imagen Real de Facachada del Campus */}
        <div className="bg-gradient-to-r from-[#800521] via-[#9F062A] to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-red-950">
          <div className="absolute inset-0 w-full h-full opacity-40 sm:opacity-55 pointer-events-none overflow-hidden">
            <img
              src="/campus_facade_sfa.jpg"
              alt="Fachada Principal IESTP San Francisco de Asís"
              className="w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#630217] via-[#800521]/95 via-45% to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl space-y-4">
            <span className="bg-slate-900/90 text-amber-300 text-[11px] font-mono font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border border-amber-400/30 inline-flex items-center gap-2 shadow-xs">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>INSTITUCIÓN PÚBLICA LICENCIADA • R.M. 124-2021</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
              Nuestra Identidad e Historia
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
              El Instituto de Educación Superior Tecnológico Público San Francisco de Asís lidera la formación técnica profesional gratuita en Villa María del Triunfo y Lima Sur, formando líderes capacitados con ética, innovación y visión de futuro para transformar el país.
            </p>
          </div>
        </div>

        {/* 2. Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-xs relative overflow-hidden group hover:border-[#9F062A] transition-colors">
            <div className="w-2 h-full bg-[#9F062A] absolute top-0 left-0" />
            <div className="w-12 h-12 bg-rose-50 text-[#9F062A] rounded-xl flex items-center justify-center border border-rose-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Nuestra Misión</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Somos un Instituto de Educación Superior Tecnológico Público que forma profesionales técnicos competitivos, con pensamiento crítico, valores éticos e innovación tecnológica, capaces de responder a las exigencias del mercado laboral y contribuir al desarrollo socioeconómico del Perú.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-xs relative overflow-hidden group hover:border-[#CFA020] transition-colors">
            <div className="w-2 h-full bg-[#CFA020] absolute top-0 left-0" />
            <div className="w-12 h-12 bg-amber-50 text-[#CFA020] rounded-xl flex items-center justify-center border border-amber-100">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Nuestra Visión</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Ser un Instituto de Educación Superior Tecnológico Público referente en Lima Metropolitana, acreditado y reconocido por su excelencia académica, calidad educativa, infraestructura moderna y alto nivel de empleabilidad de sus egresados.
            </p>
          </div>
        </div>

        {/* 3. Carrusel Interactivo de Valores Institucionales */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
            <div className="text-center sm:text-left">
              <span className="text-[#9F062A] font-black text-xs uppercase tracking-widest font-mono">PRINCIPIOS FUNDAMENTALES</span>
              <h3 className="text-2xl font-black text-slate-900 uppercase mt-0.5">Valores Institucionales</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentValueIdx((prev) => (prev === 0 ? 4 : prev - 1))}
                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-[#9F062A] hover:text-white hover:border-[#9F062A] transition-colors flex items-center justify-center cursor-pointer text-slate-700 shadow-2xs active:scale-95"
                aria-label="Anterior Valor"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentValueIdx((prev) => (prev === 4 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-[#9F062A] hover:text-white hover:border-[#9F062A] transition-colors flex items-center justify-center cursor-pointer text-slate-700 shadow-2xs active:scale-95"
                aria-label="Siguiente Valor"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-4">
            <div
              onClick={() => setCurrentValueIdx(leftIdx)}
              className="hidden lg:flex lg:col-span-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex-col items-center justify-center text-center opacity-70 hover:opacity-100 hover:border-[#9F062A] transition-all cursor-pointer scale-95 space-y-2 select-none shadow-2xs"
            >
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                {leftVal.icon}
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase leading-snug">{leftVal.title}</h4>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">{leftVal.subtitle}</span>
            </div>

            <div className="lg:col-span-6 bg-gradient-to-b from-white to-rose-50/30 border-2 border-[#9F062A] p-8 sm:p-10 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl z-10 space-y-4 scale-100 sm:scale-105 transition-all">
              <div className="w-16 h-16 bg-rose-100/80 rounded-2xl flex items-center justify-center border-2 border-rose-200 shadow-xs">
                {centerVal.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{centerVal.title}</h4>
                <span className="text-xs font-extrabold text-[#9F062A] tracking-wider uppercase block">{centerVal.subtitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-lg">
                {centerVal.desc}
              </p>
            </div>

            <div
              onClick={() => setCurrentValueIdx(rightIdx)}
              className="hidden lg:flex lg:col-span-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex-col items-center justify-center text-center opacity-70 hover:opacity-100 hover:border-[#9F062A] transition-all cursor-pointer scale-95 space-y-2 select-none shadow-2xs"
            >
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                {rightVal.icon}
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase leading-snug">{rightVal.title}</h4>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">{rightVal.subtitle}</span>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 pt-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentValueIdx(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${currentValueIdx % 5 === idx ? "w-9 bg-[#9F062A]" : "w-2.5 bg-slate-200 hover:bg-slate-300"}`}
                aria-label={`Ver valor ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4. Organigrama Institucional Gráfico */}
        <div id="organigrama-section" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 overflow-x-auto scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="bg-[#9F062A] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-1">
                ORGANIGRAMA INSTITUCIONAL 2026
              </span>
              <h3 className="text-2xl font-black text-slate-900 uppercase">Estructura Organizacional Oficial</h3>
              <p className="text-xs text-slate-500 font-medium">Plana directiva y jerarquía académica del IESTP San Francisco de Asís</p>
            </div>

            <button
              onClick={() => window.print()}
              className="py-2.5 px-4 bg-slate-900 hover:bg-[#9F062A] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Descargar Organigrama</span>
            </button>
          </div>

          <div className="min-w-[900px] pt-4 pb-8 space-y-8">
            <div className="flex justify-center">
              <div className="w-64 bg-gradient-to-r from-[#9F062A] to-[#800521] text-white rounded-xl p-4 text-center shadow-lg border border-amber-400/40 relative z-20">
                <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest block">DIRECCIÓN GENERAL</span>
                <h4 className="text-base font-black uppercase mt-0.5 text-white">Lic. Manuel Ramos</h4>
                <span className="text-[10.5px] text-rose-100 font-medium block mt-0.5">Director General</span>
              </div>
            </div>

            <div className="relative z-10">
              <div className="w-0.5 h-6 bg-slate-400 mx-auto" />
              <div className="w-[78%] h-0.5 bg-slate-400 mx-auto" />
            </div>

            <div className="grid grid-cols-4 gap-4 relative z-20 pt-1">
              {[
                {
                  headRole: "SUB-DIRECCIÓN ACADÉMICA",
                  headName: "Mg. Rosa Elvira Huamán",
                  color: "bg-slate-800 text-white border-slate-700",
                  items: [
                    { title: "Coordinación Electricidad", name: "Ing. Jorge Toledo" },
                    { title: "Coordinación Contabilidad", name: "Lic. Elena Morales" },
                    { title: "Unidad de Investigación", name: "Ing. Luis Castillo" }
                  ]
                },
                {
                  headRole: "SECRETARÍA ACADÉMICA",
                  headName: "Ing. Carlos Mendoza",
                  color: "bg-slate-800 text-white border-slate-700",
                  items: [
                    { title: "Registro y Matrículas", name: "Lic. Carmen Vargas" },
                    { title: "Certificación y Titulación", name: "Lic. Roberto Soto" },
                    { title: "Trámite Documentario", name: "Sra. Ana Gutiérrez" }
                  ]
                },
                {
                  headRole: "UNIDAD ADMINISTRATIVA",
                  headName: "Lic. Fernando Castro",
                  color: "bg-slate-800 text-white border-slate-700",
                  items: [
                    { title: "Tesorería y Caja", name: "CPC. Maria Fernández" },
                    { title: "Recursos Humanos", name: "Lic. Javier Paredes" },
                    { title: "Servicios Generales", name: "Sr. Pedro Morales" }
                  ]
                },
                {
                  headRole: "COORDINACIÓN ÁREAS TÉCNICAS",
                  headName: "Ing. Patricia Alva",
                  color: "bg-slate-800 text-white border-slate-700",
                  items: [
                    { title: "Taller de Potencia PLC", name: "Ing. Víctor Ramos" },
                    { title: "Laboratorio ERP Contable", name: "CPC. Daniel Ríos" },
                    { title: "Prácticas EFSRT", name: "Mg. Gloria Silva" }
                  ]
                }
              ].map((col, cIdx) => (
                <div key={cIdx} className="space-y-4 flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-slate-400 -mt-5" />
                  <div className={`w-full ${col.color} rounded-xl p-3.5 text-center shadow-md border space-y-0.5`}>
                    <span className="text-[9.5px] font-mono font-bold text-amber-300 uppercase tracking-wide block">{col.headRole}</span>
                    <h5 className="text-xs font-black uppercase text-white leading-tight">{col.headName}</h5>
                  </div>
                  <div className="w-full space-y-2.5 pl-3 border-l-2 border-slate-300">
                    {col.items.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left shadow-2xs hover:border-[#9F062A] hover:bg-white transition-all space-y-0.5 relative"
                      >
                        <div className="w-3 h-0.5 bg-slate-300 absolute -left-3 top-1/2 -translate-y-1/2" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase font-mono block leading-none">{sub.title}</span>
                        <h6 className="text-[11px] font-black text-slate-900 uppercase leading-snug">{sub.name}</h6>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
