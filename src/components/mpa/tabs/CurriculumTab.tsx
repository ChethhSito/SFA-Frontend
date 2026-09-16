import React, { useState } from "react";
import { Info, Check, X, Edit2, Trash2 } from "lucide-react";
import { MpaCareer, MpaCurriculumItem, MpaCourse } from "../../../types";
import { PageTransition } from "../PageTransition";

export interface MpaCurriculumVersion {
  id: string;
  name: string;
  careerId: string;
  isActive: boolean;
  status?: "Activa" | "Inactiva" | "Borrador";
  created?: string;
}

interface CurriculumTabProps {
  careers: MpaCareer[];
  courses: MpaCourse[];
  curriculum: MpaCurriculumItem[];
  curriculumVersions: MpaCurriculumVersion[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setCurriculum: React.Dispatch<React.SetStateAction<MpaCurriculumItem[]>>;
  setCurriculumVersions: React.Dispatch<React.SetStateAction<MpaCurriculumVersion[]>>;
}

export function CurriculumTab({
  careers,
  courses,
  curriculum,
  curriculumVersions,
  saveDb,
  setCurriculum,
  setCurriculumVersions
}: CurriculumTabProps) {
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [newVersionName, setNewVersionName] = useState<string>("");
  const [editingVersionId, setEditingVersionId] = useState<string>("");
  const [editingVersionName, setEditingVersionName] = useState<string>("");
  const [cycleSearch, setCycleSearch] = useState<Record<number, string>>({});

  const curCareerId = selectedCareerId || careers[0]?.id || "";
  const selectedCareer = careers.find(c => c.id === curCareerId);
  const careerVersions = curriculumVersions.filter(v => v.careerId === curCareerId);
  const curVersionId = selectedVersionId || careerVersions.find(v => v.isActive)?.id || careerVersions[0]?.id || "";
  const selectedVersion = curriculumVersions.find(v => v.id === curVersionId);

  return (
    <PageTransition id="curriculum">
      <div className="space-y-6 text-left">
        
        {/* TOP CONTROL RAIL: CAREER & VERSION MANAGER */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Editor de Mallas Curriculares</h2>
              <p className="text-xs text-slate-500 font-medium">Configure el plan de estudios, créditos, y organice cursos por ciclos académicos.</p>
            </div>
            
            {/* CAREER SELECTOR */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-black uppercase text-slate-500">Carrera SFA:</label>
              <select
                value={curCareerId}
                onChange={(e) => {
                  setSelectedCareerId(e.target.value);
                  setSelectedVersionId(""); // Reset version selection to auto-resolve for next career
                }}
                className="bg-slate-50 border px-3 py-1.5 rounded-lg text-xs font-black text-[#9F062A]"
              >
                {careers.map(car => (
                  <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* VERSION CONTROLS */}
          {curCareerId ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1 items-start">
              
              {/* VERSION SELECT LIST */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-500 font-black uppercase tracking-wider">Versión de Malla / Plan:</label>
                {careerVersions.length === 0 ? (
                  <p className="text-xs text-amber-600 font-black italic">⚠️ No hay versiones creadas para esta carrera.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {careerVersions.map(v => {
                      const isSelected = v.id === curVersionId;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVersionId(v.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                            isSelected 
                              ? "bg-[#9F062A] text-white border-[#9F062A] shadow-xs" 
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          {v.name}
                          {v.isActive && (
                            <span className="bg-emerald-500 text-white w-2 h-2 rounded-full inline-block" title="Versión Activa" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CREATE NEW VERSION */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                <span className="block text-[10.5px] font-black text-[#9F062A] uppercase">Nueva Versión de Malla</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newVersionName.trim()) return;
                    const id = "ver_" + Date.now();
                    const newV: MpaCurriculumVersion = {
                      id,
                      name: newVersionName.trim(),
                      careerId: curCareerId,
                      isActive: false,
                      status: "Borrador",
                      created: new Date().toLocaleDateString("es-ES")
                    };
                    const next = [...curriculumVersions, newV];
                    saveDb("curriculum_versions", next, setCurriculumVersions);
                    setNewVersionName("");
                    setSelectedVersionId(id);
                  }}
                  className="flex gap-2"
                >
                  <input 
                    type="text"
                    required
                    placeholder="Ej: Malla Innovada 2027"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="bg-white border rounded px-2.5 py-1.5 text-xs font-semibold flex-1 outline-none focus:border-[#9F062A]"
                  />
                  <button
                    type="submit"
                    className="bg-[#9F062A] hover:bg-[#800521] text-white px-3 text-xs font-black rounded uppercase cursor-pointer"
                  >
                    Crear
                  </button>
                </form>
              </div>

              {/* OPTION AND ACTIVE SWITCHES */}
              {selectedVersion ? (() => {
                const vStatus = selectedVersion.status || (selectedVersion.isActive ? "Activa" : "Borrador");
                const vCreated = selectedVersion.created || "N/A";
                return (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                    <span className="block text-[10.5px] font-black text-slate-800 uppercase flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span>Plan de Estudios: <strong className="text-[#9F062A]">{selectedVersion.name}</strong></span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                          vStatus === "Activa" 
                            ? "bg-emerald-100 text-emerald-850 border border-emerald-250 animate-pulse" 
                            : vStatus === "Inactiva" 
                            ? "bg-rose-100 text-rose-850 border border-rose-250" 
                            : "bg-amber-100 text-amber-850 border border-amber-250"
                        }`}>
                          {vStatus}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-slate-400 capitalize mt-0.5">Creado: {vCreated}</span>
                    </span>

                    <div className="flex items-center gap-2 justify-between flex-wrap border-t pt-2.5 mt-2">
                      {editingVersionId === selectedVersion.id ? (
                        <div className="flex gap-1.5 w-full">
                          <input 
                            type="text"
                            value={editingVersionName}
                            onChange={(e) => setEditingVersionName(e.target.value)}
                            className="bg-white border text-xs px-2 py-1 rounded flex-1 font-bold animate-in fade-in duration-100"
                          />
                          <button 
                            onClick={() => {
                              if (!editingVersionName.trim()) return;
                              const next = curriculumVersions.map(v => v.id === selectedVersion.id ? { ...v, name: editingVersionName.trim() } : v);
                              saveDb("curriculum_versions", next, setCurriculumVersions);
                              setEditingVersionId("");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded text-xs cursor-pointer flex items-center justify-center transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setEditingVersionId("")}
                            className="bg-slate-300 hover:bg-slate-400 text-slate-700 p-1 rounded text-xs cursor-pointer flex items-center justify-center transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center flex-wrap w-full">
                          <button
                            onClick={() => {
                              setEditingVersionId(selectedVersion.id);
                              setEditingVersionName(selectedVersion.name);
                            }}
                            className="text-slate-600 hover:text-slate-900 text-[10.5px] font-black flex items-center gap-1 uppercase border border-slate-300 px-2.5 py-1 rounded bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Renombrar
                          </button>

                          {selectedVersion.isActive || vStatus === "Activa" ? (
                            <button
                              onClick={() => {
                                const next = curriculumVersions.map(v => {
                                  if (v.id === selectedVersion.id) {
                                    return { ...v, isActive: false, status: "Inactiva" as const };
                                  }
                                  return v;
                                });
                                saveDb("curriculum_versions", next, setCurriculumVersions);
                              }}
                              className="bg-red-650 hover:bg-red-750 text-white text-[10.5px] font-black flex items-center gap-1 uppercase px-2.5 py-1.5 rounded shadow-xs ml-auto cursor-pointer transition-colors"
                            >
                              Desactivar Malla
                            </button>
                          ) : (
                            <div className="flex gap-1.5 ml-auto items-center flex-wrap">
                              <span className="text-[9px] text-slate-400 font-black uppercase mr-1">Cambiar a:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = curriculumVersions.map(v => {
                                    if (v.id === selectedVersion.id) {
                                      return { ...v, status: "Borrador" as const };
                                    }
                                    return v;
                                  });
                                  saveDb("curriculum_versions", next, setCurriculumVersions);
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-350 text-[10px] font-extrabold px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                Borrador
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = curriculumVersions.map(v => {
                                    if (v.id === selectedVersion.id) {
                                      return { ...v, status: "Inactiva" as const };
                                    }
                                    return v;
                                  });
                                  saveDb("curriculum_versions", next, setCurriculumVersions);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-300 text-[10px] font-extrabold px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                Inactiva
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // Toggle this one active, set other versions of career inactive
                                  const next = curriculumVersions.map(v => {
                                    if (v.careerId === curCareerId) {
                                      const isCurrent = v.id === selectedVersion.id;
                                      return { 
                                        ...v, 
                                        isActive: isCurrent, 
                                        status: isCurrent ? ("Activa" as const) : ("Inactiva" as const)
                                      };
                                    }
                                    return v;
                                  });
                                  saveDb("curriculum_versions", next, setCurriculumVersions);
                                }}
                                className="bg-[#9F062A] hover:bg-[#800521] text-white text-[10.5px] font-black flex items-center gap-1 uppercase px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
                              >
                                Activar Malla Oficial
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="flex items-center justify-center p-4 text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-lg">
                  Seleccione un plan de estudios
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-black uppercase text-center py-4">Registre o habilite al menos una especialidad en carreras.</p>
          )}
        </div>

        {/* MAIN VISUAL EDITOR CANVAS - THE CYCLE GRID */}
        {curCareerId && curVersionId ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-2 border border-slate-200">
              <Info className="w-4 h-4 text-[#9F062A]" />
              <span>Malla consultada: <strong>{selectedCareer?.name}</strong> | Versión del Plan: <strong>{selectedVersion?.name}</strong>. Puede arrastrar o usar chevrons para reasignar ciclos curriculares sin restricciones.</span>
            </div>

            {/* GRID (6 CYCLES) */}
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
                  <div key={cycleNum} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
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

                    {/* Cycle Courses Canvas Area */}
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
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-slate-400 font-bold uppercase text-xs tracking-wider">
            Seleccione una especialidad y un plan de estudios para utilizar el Editor Visual.
          </div>
        )}

      </div>
    </PageTransition>
  );
}
