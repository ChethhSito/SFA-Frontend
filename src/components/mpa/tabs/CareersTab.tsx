import React, { useState } from "react";
import { Trash2 } from "lucide-react";
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
}

export function CareersTab({ careers, curriculum, groups, tasks, saveDb, setCareers }: CareersTabProps) {
  const [formCareer, setFormCareer] = useState<{
    id: string;
    name: string;
    code: string;
    description?: string;
    status?: "Activo" | "Inactivo";
    durationSemesters: number;
  }>({ id: "", name: "", code: "", description: "", status: "Activo", durationSemesters: 6 });

  return (
    <PageTransition id="careers">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Carrera</h3>
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
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre de la Carrera *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Arquitectura de Plataformas y TI" 
                value={formCareer.name}
                onChange={(e) => setFormCareer({ ...formCareer, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md font-bold text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Código Oficial *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: APTI" 
                  value={formCareer.code}
                  onChange={(e) => setFormCareer({ ...formCareer, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Periodos Regulados *</label>
                <input 
                  type="number" 
                  required 
                  value={formCareer.durationSemesters}
                  onChange={(e) => setFormCareer({ ...formCareer, durationSemesters: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-md font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Descripción de la Carrera *</label>
              <textarea 
                required
                placeholder="Propósito formativo del programa..." 
                value={formCareer.description || ""}
                onChange={(e) => setFormCareer({ ...formCareer, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md h-16 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Operativo *</label>
              <select
                value={formCareer.status || "Activo"}
                onChange={(e) => setFormCareer({ ...formCareer, status: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-white font-bold"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Guardar Carrera Académica
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Carreras Registradas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Nombre / Descripción</th>
                  <th className="p-3">Duración</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
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
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-black text-[#9F062A] text-xs">{item.code}</td>
                      <td className="p-3 leading-tight">
                        <div className="font-bold text-slate-950">{item.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1 max-w-sm line-clamp-2">{item.description || "Sin descripción registrada"}</div>
                      </td>
                      <td className="p-3 font-mono whitespace-nowrap">{item.durationSemesters} Perio.</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                          (item.status || "Activo") === "Activo"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}>
                          {item.status || "Activo"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1.5 mr-3">
                          <button 
                            onClick={() => {
                              const next = careers.map(c => ({
                                ...c,
                                status: c.id === item.id ? (c.status === "Activo" ? ("Inactivo" as const) : ("Activo" as const)) : (c.status || "Activo")
                              }));
                              saveDb("careers", next, setCareers);
                            }}
                            className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded font-black hover:bg-slate-200 uppercase cursor-pointer"
                          >
                            Alternar
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
                              alert("No se puede eliminar la carrera porque tiene mallas curriculares, grupos académicos o programaciones asociadas.");
                              return;
                            }
                            const next = careers.filter(c => c.id !== item.id);
                            saveDb("careers", next, setCareers);
                          }}
                          className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                        >
                          <Trash2 className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
