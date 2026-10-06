import React from "react";
import { Clock, UserCheck, Layers, ArrowRight } from "lucide-react";
import { careersDetail } from "../portalData";

interface ProgramasTabProps {
  selectedProgramId: string;
  setSelectedProgramId: (id: string) => void;
  setProgramSelection: (id: string) => void;
  setCurrentTab: (tab: "inicio" | "nosotros" | "programas" | "admision" | "transparencia" | "contactanos") => void;
  setSubmitSuccessMsg: (msg: string) => void;
}

export const ProgramasTab: React.FC<ProgramasTabProps> = ({
  selectedProgramId,
  setSelectedProgramId,
  setProgramSelection,
  setCurrentTab,
  setSubmitSuccessMsg
}) => {
  const activeCareer = careersDetail.find(c => c.id === selectedProgramId) || careersDetail[0];

  return (
    <div className="bg-slate-50 py-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">

        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">MALLA CURRICULAR Y PLANES DE ESTUDIO</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Programas de Estudio Licenciados</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Conoce en detalle el plan modular por ciclos académicos, la carga horaria y las competencias profesionales de cada especialidad.
          </p>
        </div>

        {/* Selector de Carrera */}
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {careersDetail.map((c) => {
            const isActive = selectedProgramId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedProgramId(c.id)}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2.5 ${isActive ? "bg-[#9F062A] text-white border-[#9F062A] shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-[#9F062A]"}`}
              >
                {React.cloneElement(c.icon as React.ReactElement, {
                  className: `w-5 h-5 ${isActive ? "text-amber-300" : "text-[#9F062A]"}`
                })}
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detalle Completo de la Carrera Seleccionada */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-10 max-w-5xl mx-auto">

          {/* Cabecera del Programa */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-center gap-4">
              <img src={activeCareer.image} alt={activeCareer.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs" />
              <div>
                <span className="text-xs font-bold text-slate-600 inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9F062A]" />
                  <span>{activeCareer.hours}</span>
                </span>
                <h3 className="text-2xl font-black text-slate-900 uppercase mt-2">{activeCareer.name}</h3>
                <span className="text-xs text-slate-500 font-bold block mt-0.5">{activeCareer.title}</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400">Proyección Salarial Promedio:</span>
              <span className="text-emerald-700 font-black text-base bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                {activeCareer.salaryEst}
              </span>
            </div>
          </div>

          {/* Perfil del Egresado */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#9F062A] flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Perfil Profesional del Egresado
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {activeCareer.profile}
            </p>
          </div>

          {/* Malla Curricular Detallada: Ciclo I al VI */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#9F062A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9F062A]" />
                Ruta Formativa de Plan de Estudios (Ciclo I al VI)
              </h4>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                6 Semestres Académicos • 3 Años de Formación
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeCareer.careerPath.map((cp, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs hover:border-[#9F062A] hover:shadow-md transition-all relative group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#800521] text-amber-300 text-[10.5px] font-mono font-black flex items-center justify-center shadow-xs">
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          {cp.cycle}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#9F062A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-mono">
                        Semestre {idx + 1}
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 font-semibold pt-1">
                      {cp.courses.map((course, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9F062A] shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                          <span className="leading-snug">{course}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase font-mono">
                    <span></span>
                    {idx < 5 ? (
                      <span className="text-[#9F062A] flex items-center gap-1 font-bold">
                        Siguiente <ArrowRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-black">
                        Titulación Oficial ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de Postulación a la Carrera */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <button
              onClick={() => {
                setProgramSelection(activeCareer.id);
                setCurrentTab("admision");
                setSubmitSuccessMsg("");
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  const el = document.getElementById("admision-form");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="py-4 px-8 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Postular a {activeCareer.name}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
