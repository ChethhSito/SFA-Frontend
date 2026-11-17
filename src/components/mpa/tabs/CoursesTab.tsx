import React, { useState } from "react";
import { Trash2, BookOpen, Plus, CheckCircle2, Filter, X } from "lucide-react";
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
    <PageTransition id="courses" className="space-y-6 text-left">
      {/* Banner Institucional Borgoña Oficial */}
      <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-amber-300 shrink-0" />
          <div>
            <h1 className="text-xl font-black">Catálogo de Cursos y Unidades Didácticas</h1>
            <p className="mt-1 text-sm text-rose-50">
              Malla curricular oficial, horas lectivas y asignación por especialidad formativa.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "Cerrar Formulario" : "Registrar Nuevo Curso"}</span>
        </button>
      </header>

      {/* Tarjetas de Resumen Ejecutivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Asignaturas</span>
          <span className="text-lg font-black text-[#800521] font-mono mt-1 block">
            {courses.length} Cursos
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Catálogo curricular oficial
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cursos de Especialidad</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
            {especialidadCount} Unidades
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Asociadas a Electricidad y Contabilidad
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cursos Generales / Empleabilidad</span>
          <span className="text-lg font-black text-amber-600 font-mono mt-1 block">
            {generalCount} Unidades
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Competencias transversales
          </span>
        </div>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas Teoría / Sem *</label>
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
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas Laboratorio / Sem *</label>
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
              <Button type="submit" className="bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider px-6">
                Guardar Curso Académico
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Asignaturas a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
            Asignaturas Registradas ({courses.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">Filtrar por Carrera:</label>
            <select
              value={coursesFilterCareer}
              onChange={(e) => setCoursesFilterCareer(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#800521]"
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
                <th className="p-4 pl-6">Código</th>
                <th className="p-4">Nombre de la Asignatura</th>
                <th className="p-4">Especialidad / Ciclo</th>
                <th className="p-4 text-center font-mono">Créditos</th>
                <th className="p-4 text-center font-mono">Horas T/L</th>
                <th className="p-4 text-center font-mono">Estado</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {(() => {
                const filtered = courses.filter(item => coursesFilterCareer === "all" || item.careerId === coursesFilterCareer);
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold text-xs">
                        No existen cursos registrados para esta selección.
                      </td>
                    </tr>
                  );
                }
                return filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-black text-[#9F062A] text-sm">{item.code}</td>
                    <td className="p-4 text-slate-900 font-bold text-sm">{item.name}</td>
                    <td className="p-4">
                      {(() => {
                        const courseType = item.type || (item.careerId === "comun" ? "General" : "Especialidad");
                        const isGeneral = courseType === "General";
                        const car = careers.find(c => c.id === item.careerId);
                        
                        return (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase tracking-wider border ${
                                isGeneral 
                                  ? "bg-slate-100 text-slate-700 border-slate-200" 
                                  : "bg-[#9F062A]/10 text-[#9F062A] border-[#9F062A]/20"
                              }`}>
                                {courseType}
                              </span>
                              {car && (
                                <span className="text-[10px] bg-slate-50 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase">
                                  {car.code}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-amber-700 font-black uppercase font-mono tracking-wider">
                              Ciclo {item.referenceCycle || 1} {isGeneral ? "(Sugerido)" : ""}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-900">{item.credits} u.</td>
                    <td className="p-4 text-center font-mono text-slate-500">
                      T: {item.theoryHours ?? 2}h | L: {item.labHours ?? 2}h
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[9.5px] font-black uppercase border inline-block ${
                        (item.status ?? "Activo") === "Activo"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold"
                          : "bg-red-50 text-red-800 border-red-250 font-bold"
                      }`}>
                        {item.status ?? "Activo"}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
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
                        className="text-red-500 hover:text-red-800 cursor-pointer p-1.5 rounded hover:bg-red-50"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4 ml-auto" />
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