import React, { useState } from "react";
import { MpaCurriculumItem, MpaCourse, MpaCareer } from "../../../types";
import { Trash2 } from "lucide-react";

interface CurriculumTreeProps {
  curriculum: MpaCurriculumItem[];
  courses: MpaCourse[];
  careers: MpaCareer[];
  curCareerId: string;
  curVersionId: string;
  saveDb: (key: string, value: any, setter: Function) => void;
  setCurriculum: React.Dispatch<React.SetStateAction<MpaCurriculumItem[]>>;
}

export function CurriculumTree({
  curriculum,
  courses,
  careers,
  curCareerId,
  curVersionId,
  saveDb,
  setCurriculum
}: CurriculumTreeProps) {
  const [cycleSearch, setCycleSearch] = useState<Record<number, string>>({});

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((cycleNum) => {
        const mappedItems = curriculum.filter(
          it => it.careerId === curCareerId && it.versionId === curVersionId && it.cycle === cycleNum
        );

        const availableCourses = courses.filter(
          crs => !curriculum.some(
            it => it.careerId === curCareerId && it.versionId === curVersionId && it.courseId === crs.id
          )
        );

        const sortedAvailableCourses = [...availableCourses].sort((a, b) => {
          const isAComun = a.careerId === "comun" ? 1 : 0;
          const isBComun = b.careerId === "comun" ? 1 : 0;
          if (isAComun !== isBComun) return isBComun - isAComun;
          
          const cycleA = a.referenceCycle || 1;
          const cycleB = b.referenceCycle || 1;
          if (cycleA !== cycleB) return cycleA - cycleB;
          
          return (a.code || "").localeCompare(b.code || "");
        });

        return (
          <div key={cycleNum} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
            {/* Cycle Header */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center gap-1">
                <span className="bg-[#CFA020] text-slate-900 font-mono px-2 py-0.5 rounded text-[10px] font-black">
                  CICLO {cycleNum}
                </span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-black">
                {mappedItems.reduce((currSum, cIdx) => {
                  const mappedCourseObj = courses.find(cr => cr.id === cIdx.courseId);
                  return currSum + (mappedCourseObj?.credits || 0);
                }, 0)} u. totales
              </span>
            </div>

            {/* Cycle Courses Area */}
            <div className="p-3 space-y-2 flex-1 min-h-[160px] max-h-[350px] overflow-y-auto custom-scrollbar">
              {mappedItems.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Sin cursos mapeados
                </div>
              ) : (
                mappedItems.map(itm => {
                  const crsObj = courses.find(x => x.id === itm.courseId);
                  if (!crsObj) return null;
                  return (
                    <div key={itm.id} className="p-2.5 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-all shadow-xs">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="text-left select-none">
                          <span className="block text-[11px] font-black tracking-wide text-slate-900 leading-tight">
                            {crsObj.name}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-black font-mono block uppercase mt-0.5">
                            {crsObj.code} • {crsObj.credits} u. | T: {crsObj.theoryHours ?? 2}h | L: {crsObj.labHours ?? 2}h
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            const next = curriculum.filter(it => it.id !== itm.id);
                            saveDb("curriculum", next, setCurriculum);
                          }}
                          className="text-slate-400 hover:text-red-750 cursor-pointer p-0.5"
                          title="Quitar de Malla"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-100 justify-end">
                        <span className="text-[8px] font-black text-slate-400 uppercase mr-auto tracking-wider font-mono">ciclo: {cycleNum}</span>
                        
                        {cycleNum > 1 && (
                          <button
                            onClick={() => {
                              const next = curriculum.map(x => x.id === itm.id ? { ...x, cycle: cycleNum - 1 } : x);
                              saveDb("curriculum", next, setCurriculum);
                            }}
                            className="text-[#9F062A] hover:bg-[#9F062A]/10 px-1 py-0.5 rounded text-[9px] font-black border border-slate-200 cursor-pointer bg-white"
                            title="Mover al ciclo previo"
                          >
                            ← Ciclo
                          </button>
                        )}

                        {cycleNum < 6 && (
                          <button
                            onClick={() => {
                              const next = curriculum.map(x => x.id === itm.id ? { ...x, cycle: cycleNum + 1 } : x);
                              saveDb("curriculum", next, setCurriculum);
                            }}
                            className="text-[#9F062A] hover:bg-[#9F062A]/10 px-1 py-0.5 rounded text-[9px] font-black border border-slate-200 cursor-pointer bg-white"
                            title="Mover al ciclo siguiente"
                          >
                            Ciclo →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selector de Cursos por Ciclo */}
            <div className="p-2 border-t border-slate-150 bg-slate-50 space-y-1.5">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="🔍 Buscar curso (nombre o sigla)..."
                  value={cycleSearch[cycleNum] || ""}
                  onChange={(e) => setCycleSearch({ ...cycleSearch, [cycleNum]: e.target.value })}
                  className="w-full text-[10px] px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-[#9F062A] outline-none"
                />
                {(cycleSearch[cycleNum] || "") && (
                  <button 
                    onClick={() => setCycleSearch({ ...cycleSearch, [cycleNum]: "" })}
                    className="absolute right-1 text-slate-400 hover:text-slate-600 top-1/2 -translate-y-1/2 p-0.5 text-[8px]"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                onChange={(e) => {
                  const crsId = e.target.value;
                  if (crsId) {
                    const id = "curr_" + Date.now();
                    const newMallaItem = {
                      id,
                      careerId: curCareerId,
                      courseId: crsId,
                      cycle: cycleNum,
                      versionId: curVersionId
                    };
                    const next = [...curriculum, newMallaItem];
                    saveDb("curriculum", next, setCurriculum);
                    setCycleSearch({ ...cycleSearch, [cycleNum]: "" });
                    e.target.value = ""; 
                  }
                }}
                className="w-full text-[10.5px] font-bold p-1 border rounded bg-white"
              >
                <option value="">+ Seleccionar Curso Encontrado...</option>
                {(() => {
                  const searchQuery = (cycleSearch[cycleNum] || "").toLowerCase().trim();
                  const filterBySearch = (crs: MpaCourse) => {
                    if (!searchQuery) return true;
                    return (crs.name || "").toLowerCase().includes(searchQuery) || (crs.code || "").toLowerCase().includes(searchQuery);
                  };

                  const specCourses = sortedAvailableCourses.filter(c => c.careerId === curCareerId).filter(filterBySearch);
                  const genCourses = sortedAvailableCourses.filter(c => c.careerId === "comun").filter(filterBySearch);
                  const otherCourses = sortedAvailableCourses.filter(c => c.careerId !== curCareerId && c.careerId !== "comun").filter(filterBySearch);

                  if (specCourses.length === 0 && genCourses.length === 0 && otherCourses.length === 0) {
                    return <option disabled>No hay coincidencias</option>;
                  }

                  return (
                    <>
                      {specCourses.length > 0 && (
                        <optgroup label="CURSOS DE LA ESPECIALIDAD">
                          {specCourses.map(crs => {
                            const cycleLabel = crs.referenceCycle ? `Ciclo ${crs.referenceCycle}` : "N/A";
                            return (
                              <option key={crs.id} value={crs.id}>
                                [{crs.code}] {crs.name} ({cycleLabel})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                      {genCourses.length > 0 && (
                        <optgroup label="CURSOS GENERALES / TRANSVERSALES">
                          {genCourses.map(crs => {
                            const cycleLabel = crs.referenceCycle ? `Ciclo ${crs.referenceCycle}` : "N/A";
                            return (
                              <option key={crs.id} value={crs.id}>
                                [{crs.code}] {crs.name} ({cycleLabel})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                      {otherCourses.length > 0 && (
                        <optgroup label="CURSOS DE OTRAS ESPECIALIDADES">
                          {otherCourses.map(crs => {
                            const cycleLabel = crs.referenceCycle ? `Ciclo ${crs.referenceCycle}` : "N/A";
                            const catLabel = careers.find(car => car.id === crs.careerId)?.code || "N/A";
                            return (
                              <option key={crs.id} value={crs.id}>
                                [{crs.code}] {crs.name} ({cycleLabel} • {catLabel})
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                    </>
                  );
                })()}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CurriculumTree;
