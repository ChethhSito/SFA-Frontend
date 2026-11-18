import React, { useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { MpaCareer, MpaCurriculumItem, MpaAcademicGroup, MpaProgramTask } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

interface CareersTabProps {
  careers: MpaCareer[];
  curriculum: MpaCurriculumItem[];
  groups: MpaAcademicGroup[];
  tasks: MpaProgramTask[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setCareers: React.Dispatch<React.SetStateAction<MpaCareer[]>>;
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function CareersTab({ careers, curriculum, groups, tasks, saveDb, setCareers, notify }: CareersTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formCareer, setFormCareer] = useState<{
    id: string;
    name: string;
    code: string;
    description?: string;
    status?: "Activo" | "Inactivo";
    durationSemesters: number;
  }>({ id: "", name: "", code: "", description: "", status: "Activo", durationSemesters: 6 });

  const activeCareersCount = careers.filter(c => (c.status || "Activo") === "Activo").length;

  return (
    <PageTransition id="careers" className="p-5 md:p-6 space-y-4 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Carreras Habilitadas</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {activeCareersCount} Especialidades
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duración Reglamentaria</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              6 Semestres (3 Años)
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Créditos de Titulación</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              120.0 Créditos Oficiales
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer border ${
            showForm 
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" 
              : "bg-[#800521] hover:bg-[#67041a] text-white border-[#800521]"
          }`}
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showForm ? "Cerrar Formulario" : "+ Registrar Carrera"}</span>
        </button>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Registrar Nuevo Programa de Estudios
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Especialidad autorizada por el MINEDU
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formCareer.name || !formCareer.code) return;
              const id = "c_" + Date.now();
              const finalStatus = formCareer.status || "Activo";
              const next = [...careers, { 
                ...formCareer, 
                id, 
                description: formCareer.description || "", 
                status: finalStatus 
              }];
              saveDb("careers", next, setCareers);
              setFormCareer({ id: "", name: "", code: "", description: "", status: "Activo", durationSemesters: 6 });
              setShowForm(false);
              notify?.(`Carrera ${formCareer.name} registrada exitosamente.`, "success");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre de la Carrera *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Mecatrónica Industrial" 
                  value={formCareer.name}
                  onChange={(e) => setFormCareer({ ...formCareer, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Código Oficial *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: MIND" 
                  value={formCareer.code}
                  onChange={(e) => setFormCareer({ ...formCareer, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Descripción Formativa *</label>
                <textarea 
                  required
                  placeholder="Propósito y campo ocupacional del programa..." 
                  value={formCareer.description || ""}
                  onChange={(e) => setFormCareer({ ...formCareer, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg h-18 font-semibold"
                />
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Períodos Regulados (Semestres) *</label>
                  <input 
                    type="number" 
                    required 
                    value={formCareer.durationSemesters}
                    onChange={(e) => setFormCareer({ ...formCareer, durationSemesters: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Operativo *</label>
                  <select
                    value={formCareer.status || "Activo"}
                    onChange={(e) => setFormCareer({ ...formCareer, status: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <Button type="submit" className="bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider px-5">
                Guardar Carrera
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Carreras a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider leading-none">
            Programas de Estudio Vigentes ({careers.length})
          </h3>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            Malla Curricular Modular
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3 pl-5">Código</th>
                <th className="p-3">Programa / Propósito Formativo</th>
                <th className="p-3 text-center">Duración</th>
                <th className="p-3 text-center">Estado Oficial</th>
                <th className="p-3 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {careers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-semibold text-xs">
                    No existen carreras registradas.
                  </td>
                </tr>
              ) : (
                careers.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-black text-[#9F062A] text-xs">{item.code}</td>
                    <td className="p-3.5 leading-tight">
                      <div className="font-bold text-slate-950 text-xs">{item.name}</div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5 max-w-xl line-clamp-2">{item.description || "Sin descripción registrada"}</div>
                    </td>
                    <td className="p-3.5 text-center font-mono whitespace-nowrap text-slate-800 font-bold">{item.durationSemesters} Semestres</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border inline-block ${
                        (item.status || "Activo") === "Activo"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold" 
                          : "bg-slate-100 text-slate-500 border-slate-200 font-bold"
                      }`}>
                        {item.status || "Activo"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="inline-flex gap-1.5 mr-2">
                        <button 
                          onClick={() => {
                            const next = careers.map(c => ({
                              ...c,
                              status: c.id === item.id ? (c.status === "Activo" ? ("Inactivo" as const) : ("Activo" as const)) : (c.status || "Activo")
                            }));
                            saveDb("careers", next, setCareers);
                            notify?.(`Estado de ${item.name} actualizado.`, "info");
                          }}
                          className="text-[9.5px] bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-bold hover:bg-slate-200 uppercase cursor-pointer"
                        >
                          Alternar Estado
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          const hasCurriculum = curriculum.some(curr => curr.careerId === item.id);
                          const hasGroups = groups.some(g => g.careerId === item.id);
                          const hasTasks = tasks.some(t => {
                            const gp = groups.find(g => g.id === t.groupId);
                            return gp && gp.careerId === item.id;
                          });
                          if (hasCurriculum || hasGroups || hasTasks) {
                            notify?.("No se puede eliminar la carrera porque tiene mallas curriculares, grupos académicos o programaciones asociadas.", "warning");
                            return;
                          }
                          const next = careers.filter(c => c.id !== item.id);
                          saveDb("careers", next, setCareers);
                          notify?.(`Carrera eliminada exitosamente.`, "info");
                        }}
                        className="text-red-500 hover:text-red-800 cursor-pointer inline-block align-middle p-1 rounded hover:bg-red-50"
                        title="Eliminar carrera"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}