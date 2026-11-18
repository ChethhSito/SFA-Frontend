import React, { useState } from "react";
import { Trash2, Plus, Filter, X } from "lucide-react";
import { MpaCourse, MpaCareer, MpaCurriculumItem, MpaProgramTask } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

interface CoursesTabProps {
  courses: MpaCourse[];
  careers: MpaCareer[];
  curriculum: MpaCurriculumItem[];
  tasks: MpaProgramTask[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setCourses: React.Dispatch<React.SetStateAction<MpaCourse[]>>;
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function CoursesTab({ courses, careers, curriculum, tasks, saveDb, setCourses, notify }: CoursesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [coursesFilterCareer, setCoursesFilterCareer] = useState<string>("all");
  const [formCourse, setFormCourse] = useState<{
    id: string;
    name: string;
    code: string;
    credits: number;
    theoryHours: number;
    labHours: number;
    status: "Activo" | "Inactivo";
    careerId: string;
    referenceCycle: number;
    type: "General" | "Especialidad";
  }>({
    id: "",
    name: "",
    code: "",
    credits: 3,
    theoryHours: 2,
    labHours: 2,
    status: "Activo",
    careerId: "",
    referenceCycle: 1,
    type: "Especialidad"
  });

  const especialidadCount = courses.filter(c => (c.type || "Especialidad") === "Especialidad").length;
  const generalCount = courses.filter(c => c.type === "General" || c.careerId === "comun").length;

  return (
    <PageTransition id="courses" className="p-5 md:p-6 space-y-4 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total de Asignaturas</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {courses.length} Cursos Registrados
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cursos de Especialidad</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              {especialidadCount} Unidades
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cursos Generales / Empleabilidad</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              {generalCount} Unidades
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
          <span>{showForm ? "Cerrar Formulario" : "+ Registrar Curso"}</span>
        </button>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Registrar Nueva Unidad Didáctica
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Especialidad o Formación General
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formCourse.name || !formCourse.code) return;
              
              const isGeneral = formCourse.type === "General";
              if (!isGeneral && (!formCourse.careerId || formCourse.careerId === "comun")) {
                notify?.("Para un curso de Especialidad, debe asociar obligatoriamente una carrera de referencia.", "warning");
                return;
              }
              
              const finalCareerId = isGeneral ? (formCourse.careerId || "comun") : formCourse.careerId;
              const id = "crs_" + Date.now();
              const next = [...courses, { ...formCourse, careerId: finalCareerId, id }];
              saveDb("courses", next, setCourses);
              setFormCourse({ id: "", name: "", code: "", credits: 3, theoryHours: 2, labHours: 2, status: "Activo", careerId: "", referenceCycle: 1, type: "Especialidad" });
              setShowForm(false);
              notify?.(`Curso ${formCourse.name} registrado exitosamente.`, "success");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Curso / Unidad Didáctica *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Automatización y Control Industrial" 
                  value={formCourse.name}
                  onChange={(e) => setFormCourse({ ...formCourse, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Código / Sigla *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: ACI-301" 
                  value={formCourse.code}
                  onChange={(e) => setFormCourse({ ...formCourse, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Curso *</label>
                <select
                  required
                  value={formCourse.type ?? "Especialidad"}
                  onChange={(e) => {
                    const newType = e.target.value as "General" | "Especialidad";
                    setFormCourse({ 
                      ...formCourse, 
                      type: newType, 
                      careerId: newType === "General" ? "comun" : "" 
                    });
                  }}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800"
                >
                  <option value="Especialidad">Especialidad (Asociado a carrera)</option>
                  <option value="General">General (Transversal / Empleabilidad)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Carrera Destino *</label>
                <select
                  value={formCourse.careerId}
                  onChange={(e) => setFormCourse({ ...formCourse, careerId: e.target.value })}
                  disabled={formCourse.type === "General"}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800 disabled:opacity-50"
                >
                  <option value="">-- Seleccione una Carrera --</option>
                  {careers.map((car) => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                  {formCourse.type === "General" && <option value="comun">Cursos Generales</option>}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo de Referencia *</label>
                <select
                  value={formCourse.referenceCycle}
                  onChange={(e) => setFormCourse({ ...formCourse, referenceCycle: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>Ciclo {num} ({num === 1 ? "I" : num === 2 ? "II" : num === 3 ? "III" : num === 4 ? "IV" : num === 5 ? "V" : "VI"})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Créditos MINEDU *</label>
                <input 
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={formCourse.credits}
                  onChange={(e) => setFormCourse({ ...formCourse, credits: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas Teoría *</label>
                <input 
                  type="number"
                  min={0}
                  required
                  value={formCourse.theoryHours}
                  onChange={(e) => setFormCourse({ ...formCourse, theoryHours: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas Laboratorio *</label>
                <input 
                  type="number"
                  min={0}
                  required
                  value={formCourse.labHours}
                  onChange={(e) => setFormCourse({ ...formCourse, labHours: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Académico *</label>
                <select
                  value={formCourse.status}
                  onChange={(e) => setFormCourse({ ...formCourse, status: e.target.value as any })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  <option value="Activo">Activo (Habilitado)</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
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
                Guardar Curso
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Asignaturas a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider leading-none">
            Asignaturas Registradas ({courses.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">Filtrar Carrera:</label>
            <select
              value={coursesFilterCareer}
              onChange={(e) => setCoursesFilterCareer(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#800521]"
            >
              <option value="all">Todas las Carreras</option>
              {careers.map(car => (
                <option key={car.id} value={car.id}>{car.name}</option>
              ))}
              <option value="comun">Cursos Generales</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3 pl-5">Código</th>
                <th className="p-3">Nombre de la Asignatura</th>
                <th className="p-3">Especialidad / Ciclo</th>
                <th className="p-3 text-center font-mono">Créditos</th>
                <th className="p-3 text-center font-mono">Horas T/L</th>
                <th className="p-3 text-center font-mono">Estado</th>
                <th className="p-3 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {(() => {
                const filtered = courses.filter(item => coursesFilterCareer === "all" || item.careerId === coursesFilterCareer);
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 font-semibold text-xs">
                        No existen cursos registrados para esta selección.
                      </td>
                    </tr>
                  );
                }
                return filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-black text-[#9F062A] text-xs">{item.code}</td>
                    <td className="p-3.5 text-slate-900 font-bold text-xs">{item.name}</td>
                    <td className="p-3.5">
                      {(() => {
                        const courseType = item.type || (item.careerId === "comun" ? "General" : "Especialidad");
                        const isGeneral = courseType === "General";
                        const car = careers.find(c => c.id === item.careerId);
                        
                        return (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider border ${
                                isGeneral 
                                  ? "bg-slate-100 text-slate-700 border-slate-200" 
                                  : "bg-[#9F062A]/10 text-[#9F062A] border-[#9F062A]/20"
                              }`}>
                                {courseType}
                              </span>
                              {car && (
                                <span className="text-[9.5px] bg-slate-50 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase">
                                  {car.code}
                                </span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-amber-700 font-black uppercase font-mono tracking-wider">
                              Ciclo {item.referenceCycle || 1} {isGeneral ? "(Sugerido)" : ""}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-900">{item.credits} u.</td>
                    <td className="p-3.5 text-center font-mono text-slate-500 text-[11px]">
                      T: {item.theoryHours ?? 2}h | L: {item.labHours ?? 2}h
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border inline-block ${
                        (item.status ?? "Activo") === "Activo"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold"
                          : "bg-red-50 text-red-800 border-red-250 font-bold"
                      }`}>
                        {item.status ?? "Activo"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button 
                        onClick={() => {
                          const inCurriculum = curriculum.some(curr => curr.courseId === item.id);
                          const inTasks = tasks.some(t => t.courseId === item.id);
                          if (inCurriculum || inTasks) {
                            notify?.("No se puede eliminar el curso porque ya está siendo utilizado en mallas o programaciones.", "warning");
                            return;
                          }
                          const next = courses.filter(c => c.id !== item.id);
                          saveDb("courses", next, setCourses);
                          notify?.(`Curso eliminado exitosamente.`, "info");
                        }}
                        className="text-red-500 hover:text-red-800 cursor-pointer p-1 rounded hover:bg-red-50"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}