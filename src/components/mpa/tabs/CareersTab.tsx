import React, { useState } from "react";
import { Trash2, GraduationCap, Plus, CheckCircle2, Clock, Award, X } from "lucide-react";
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
    <PageTransition id="careers" className="space-y-6 text-left">
      {/* Banner Institucional Borgoña Oficial */}
      <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-amber-300 shrink-0" />
          <div>
            <h1 className="text-xl font-black">Gestión de Carreras y Programas de Estudio</h1>
            <p className="mt-1 text-sm text-rose-50">
              Programas formativos profesionales autorizados según normativa del MINEDU.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "Cerrar Formulario" : "Registrar Nueva Carrera"}</span>
        </button>
      </header>

      {/* Tarjetas de Resumen Ejecutivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carreras Habilitadas</span>
          <span className="text-lg font-black text-[#800521] font-mono mt-1 block">
            {activeCareersCount} Especialidades
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Programas con admisión activa
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duración Reglamentaria</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
            6 Semestres (3 Años)
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Nivel Profesional Técnico
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Créditos de Titulación</span>
          <span className="text-lg font-black text-amber-600 font-mono mt-1 block">
            120.0 Créditos
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Malla curricular completa
          </span>
        </div>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Descripción Formativa *</label>
                <textarea 
                  required
                  placeholder="Propósito y campo ocupacional del programa..." 
                  value={formCareer.description || ""}
                  onChange={(e) => setFormCareer({ ...formCareer, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg h-20 font-semibold"
                />
              </div>

              <div className="space-y-3">
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
              <Button type="submit" className="bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider px-6">
                Guardar Carrera Académica
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Carreras a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
            Programas de Estudio Vigentes ({careers.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Malla Curricular Modular
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Código</th>
                <th className="p-4">Programa / Propósito Formativo</th>
                <th className="p-4 text-center">Duración</th>
                <th className="p-4 text-center">Estado Oficial</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {careers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen carreras registradas.
                  </td>
                </tr>
              ) : (
                careers.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-black text-[#9F062A] text-sm">{item.code}</td>
                    <td className="p-4 leading-tight">
                      <div className="font-bold text-slate-950 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-500 mt-1 max-w-xl line-clamp-2">{item.description || "Sin descripción registrada"}</div>
                    </td>
                    <td className="p-4 text-center font-mono whitespace-nowrap text-slate-800 font-bold">{item.durationSemesters} Semestres</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[9.5px] font-black uppercase border inline-block ${
                        (item.status || "Activo") === "Activo"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold" 
                          : "bg-slate-100 text-slate-500 border-slate-200 font-bold"
                      }`}>
                        {item.status || "Activo"}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="inline-flex gap-2 mr-3">
                        <button 
                          onClick={() => {
                            const next = careers.map(c => ({
                              ...c,
                              status: c.id === item.id ? (c.status === "Activo" ? ("Inactivo" as const) : ("Activo" as const)) : (c.status || "Activo")
                            }));
                            saveDb("careers", next, setCareers);
                            notify?.(`Estado de ${item.name} actualizado.`, "info");
                          }}
                          className="text-[10px] bg-slate-100 text-slate-700 border border-slate-300 px-2 py-1 rounded font-bold hover:bg-slate-200 uppercase cursor-pointer"
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
                        className="text-red-500 hover:text-red-800 cursor-pointer inline-block align-middle p-1.5 rounded hover:bg-red-50"
                        title="Eliminar carrera"
                      >
                        <Trash2 className="w-4 h-4" />
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