import React, { useState } from "react";
import { Zap, Cpu, Sliders, Award, Printer, Info, ChevronRight, FileText } from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { BoletaNotasModal } from "../modals/BoletaNotasModal";

interface GradesTabProps {
  enrichedCourses: any[];
  selectedCourseDetail: string;
  setSelectedCourseDetail: React.Dispatch<React.SetStateAction<string>>;
  studentInfo?: {
    dni?: string;
    name?: string;
    career?: string;
  };
}

export const GradesTab: React.FC<GradesTabProps> = ({
  enrichedCourses,
  selectedCourseDetail,
  setSelectedCourseDetail,
  studentInfo
}) => {
  const [showBoletaModal, setShowBoletaModal] = useState(false);
  const activeCourse = enrichedCourses.find(c => c.name === selectedCourseDetail || c.id === selectedCourseDetail) || enrichedCourses[0];

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
    <PageTransition id="notas" className="space-y-6">
      {/* Header widget */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div>
          <h2 id="notas-view-main" className="text-lg font-black text-[#800521] tracking-tight uppercase font-display leading-none">Mis Calificaciones</h2>
          <p className="text-[11px] text-slate-550 font-bold mt-1.5 uppercase tracking-wider">Boleta de calificaciones actual, fórmulas de notas y avance ponderado</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="text-left bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg select-none">
            <span className="text-[9px] text-[#800521] font-extrabold block uppercase mb-0.5 tracking-wider">Período Académico</span>
            <span className="text-xs font-black text-slate-800">2026 - I</span>
          </div>
          <div className="text-left bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg select-none">
            <span className="text-[9px] text-[#800521] font-extrabold block uppercase mb-0.5 tracking-wider">Sede Rectoral</span>
            <span className="text-xs font-black text-slate-800">Principal</span>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs text-left">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Promedio Ponderado</span>
          <span className="text-xl font-black text-[#800521] block mt-1 font-mono">16.8</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs text-left">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Créditos Llevados</span>
          <span className="text-xl font-black text-[#800521] block mt-1 font-mono">22.0</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs text-left">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Unidades Didácticas</span>
          <span className="text-xl font-black text-slate-800 block mt-1 font-mono">{enrichedCourses.length}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs text-left">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Condición Alumno</span>
          <span className="text-xs font-extrabold text-emerald-850 bg-emerald-50 px-2 py-0.5 inline-block border border-emerald-100 rounded-md uppercase tracking-wider mt-1.5">
            REGULAR (APROBADO)
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT AREA: Evaluations detail card */}
        <div className="xl:col-span-8 space-y-6 text-left">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight font-display flex items-center gap-2 flex-wrap">
                  {renderCourseIcon(activeCourse?.iconType || "BarChart3", "w-4 h-4 text-[#800521]")}
                  Detalle Evaluativo de {activeCourse?.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5 block">Unidad Didáctica: {activeCourse?.code} • Aula: {activeCourse?.classroom}</span>
              </div>
              
              <button 
                onClick={() => setShowBoletaModal(true)}
                className="bg-[#9F062A] hover:bg-[#800521] text-white font-black text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 uppercase transition-all shadow-xs cursor-pointer select-none"
              >
                <Printer className="w-3.5 h-3.5" /> Generar Boleta PDF
              </button>
            </div>

            {activeCourse ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left">
                        <th className="py-3 px-1">Concepto Evaluación</th>
                        <th className="py-3 text-center">Prefijo</th>
                        <th className="py-3 text-center">Peso</th>
                        <th className="py-3 text-right">Nota Escala 0-20</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeCourse.evaluations.map((evalItem: any, idx: number) => {
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

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5 text-left mt-4">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Fórmula de Calificación Final:</span>
                  <code className="text-[11.5px] font-mono font-black text-[#800521] block">
                    {activeCourse.formula}
                  </code>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-lg text-[10.5px] font-bold text-slate-650 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Nota Importante:</strong> Conforme al reglamento académico institucional de la sede rectoral, la nota aprobatoria mínima general por unidad didáctica tecnológica es de <strong>13 (trece)</strong>. Las notas no registrables se denotan temporalmente como <em>"NR"</em> y se regularizarán al cierre lectivo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-400 italic">No hay datos para esta unidad didáctica.</div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: Course navigator bar sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4 text-left">
            <h3 className="text-[11.5px] font-black uppercase text-slate-500 tracking-wider">Unidades Didácticas Llevadas</h3>
            
            <div className="space-y-2.5">
              {enrichedCourses.map((courseItem) => {
                const isSelected = activeCourse?.id === courseItem.id;
                return (
                  <button
                    key={courseItem.id}
                    onClick={() => setSelectedCourseDetail(courseItem.name)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-[#800521]/5 border-[#800521]/20 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#800521] text-white border-[#800521]"
                          : "bg-slate-50 text-slate-400 group-hover:text-slate-700 border-slate-100 group-hover:border-slate-200"
                      }`}>
                        {renderCourseIcon(courseItem.iconType, "w-4 h-4")}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className={`text-[12.5px] font-black block truncate leading-tight ${
                          isSelected ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {courseItem.name}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wide uppercase block mt-1">
                          Código: {courseItem.code}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-[#800521] translate-x-0.5" : "text-slate-350 group-hover:text-slate-600"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <BoletaNotasModal
        isOpen={showBoletaModal}
        onClose={() => setShowBoletaModal(false)}
        studentDni={studentInfo?.dni || "76543210"}
        studentName={studentInfo?.name || "CARLOS EDURADO QUISPE TAPIA"}
        careerName={studentInfo?.career || "Electrotecnia Industrial"}
        cycleNumber={5}
        courses={enrichedCourses.map(c => ({
          name: c.name,
          grade: typeof c.evaluations?.[0]?.grade === "number" ? c.evaluations[0].grade : 16,
          approved: true
        }))}
        average={16.8}
      />
    </PageTransition>
  );
};
