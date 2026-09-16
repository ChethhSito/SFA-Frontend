import React, { useState } from "react";
import { Trash2 } from "lucide-react";
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
}

export function CoursesTab({ courses, careers, curriculum, tasks, saveDb, setCourses }: CoursesTabProps) {
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

  return (
    <PageTransition id="courses">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Nuevo Curso</h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formCourse.name || !formCourse.code) return;
              
              const isGeneral = formCourse.type === "General";
              if (!isGeneral && (!formCourse.careerId || formCourse.careerId === "comun")) {
                alert("Para un curso de Especialidad, debe asociar obligatoriamente una carrera de referencia.");
                return;
              }
              
              const finalCareerId = isGeneral ? (formCourse.careerId || "comun") : formCourse.careerId;
              
              const id = "crs_" + Date.now();
              const next = [...courses, { ...formCourse, careerId: finalCareerId, id }];
              saveDb("courses", next, setCourses);
              setFormCourse({ id: "", name: "", code: "", credits: 3, theoryHours: 2, labHours: 2, status: "Activo", careerId: "", referenceCycle: 1, type: "Especialidad" });
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Curso *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Base de Datos Relacionales" 
                value={formCourse.name}
                onChange={(e) => setFormCourse({ ...formCourse, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

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
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
              >
                <option value="Especialidad">Especialidad (Debe asociarse a una carrera)</option>
                <option value="General">General (Transversal / Reutilizable)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Sigla / Código *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: BDR-101" 
                  value={formCourse.code}
                  onChange={(e) => setFormCourse({ ...formCourse, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Créditos de Minedu *</label>
                <input 
                  type="number" 
                  required 
                  min={1} 
                  max={10} 
                  value={formCourse.credits}
                  onChange={(e) => setFormCourse({ ...formCourse, credits: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas de Teoría *</label>
                <input 
                  type="number" 
                  required 
                  min={0} 
                  max={20} 
                  value={formCourse.theoryHours ?? 2}
                  onChange={(e) => setFormCourse({ ...formCourse, theoryHours: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Horas de Laboratorio *</label>
                <input 
                  type="number" 
                  required 
                  min={0} 
                  max={20} 
                  value={formCourse.labHours ?? 2}
                  onChange={(e) => setFormCourse({ ...formCourse, labHours: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">
                {formCourse.type === "General" ? "Carrera de Referencia (Opcional)" : "Carrera SFA Destino (Obligatorio) *"}
              </label>
              <select
                required={formCourse.type !== "General"}
                value={formCourse.careerId}
                onChange={(e) => setFormCourse({ ...formCourse, careerId: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
              >
                <option value="">{formCourse.type === "General" ? "-- Sin carrera (Curso Común) --" : "-- Seleccione una Carrera --"}</option>
                {careers.map(car => (
                  <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                ))}
                <option value="comun">Cursos Generales</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Curricular de Referencia *</label>
              <select
                required
                value={formCourse.referenceCycle ?? 1}
                onChange={(e) => setFormCourse({ ...formCourse, referenceCycle: Number(e.target.value) })}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
              >
                <option value={1}>I Ciclo Académico (Primer Periodo)</option>
                <option value={2}>II Ciclo Académico (Segundo Periodo)</option>
                <option value={3}>III Ciclo Académico (Tercer Periodo)</option>
                <option value={4}>IV Ciclo Académico (Cuarto Periodo)</option>
                <option value={5}>V Ciclo Académico (Quinto Periodo)</option>
                <option value={6}>VI Ciclo Académico (Sexto Periodo)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado Académico *</label>
              <select
                required
                value={formCourse.status ?? "Activo"}
                onChange={(e) => setFormCourse({ ...formCourse, status: e.target.value as any })}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
              >
                <option value="Activo">Activo (Habilitado)</option>
                <option value="Inactivo">Inactivo (Suspendido)</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[10.5px] text-amber-900 leading-normal font-semibold">
              ⚠️ Al asignar este curso a una carrera, se vinculará de forma permanente. Luego, asigne el <strong>Ciclo Académico</strong> y la <strong>Malla Curricular</strong> en la pestaña correspondiente.
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Guardar Curso Académico
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Asignaturas Existentes</h3>
            
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-slate-500 whitespace-nowrap">Filtrar por Carrera:</label>
              <select
                value={coursesFilterCareer}
                onChange={(e) => setCoursesFilterCareer(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#800521]"
              >
                <option value="all">Todas las Carreras</option>
                {careers.map(car => (
                  <option key={car.id} value={car.id}>{car.name}</option>
                ))}
                <option value="comun">Cursos Generales</option>
              </select>
            </div>
          </div>
          
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Nombre de la Asignatura</th>
                <th className="p-3">Carrera / Ciclo Ref.</th>
                <th className="p-3 font-mono">Créditos</th>
                <th className="p-3 font-mono">Horas T/L</th>
                <th className="p-3 font-mono">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {(() => {
                const filtered = courses.filter(item => coursesFilterCareer === "all" || item.careerId === coursesFilterCareer);
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold text-xs">
                        No existen cursos registrados.
                      </td>
                    </tr>
                  );
                }
                return filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-black text-slate-800">{item.code}</td>
                    <td className="p-3 text-slate-900 font-bold">{item.name}</td>
                    <td className="p-3">
                      {(() => {
                        const courseType = item.type || (item.careerId === "comun" ? "General" : "Especialidad");
                        const isGeneral = courseType === "General";
                        const car = careers.find(c => c.id === item.careerId);
                        
                        return (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                isGeneral 
                                  ? "bg-slate-100 text-slate-700 border border-slate-200" 
                                  : "bg-[#9F062A]/10 text-[#9F062A] border border-[#9F062A]/20"
                              }`}>
                                {courseType}
                              </span>
                              {car && (
                                <span className="text-[10px] bg-slate-50 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-bold uppercase">
                                  {car.code}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-amber-700 font-extrabold uppercase font-mono tracking-wider">
                              Ciclo {item.referenceCycle || 1} {isGeneral ? "(Sugerido)" : ""}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 font-mono">{item.credits} u.</td>
                    <td className="p-3 font-mono text-slate-500">
                      T: {item.theoryHours ?? 2}h | L: {item.labHours ?? 2}h
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        (item.status ?? "Activo") === "Activo"
                          ? "bg-emerald-100 text-emerald-850"
                          : "bg-red-100 text-red-850"
                      }`}>
                        {item.status ?? "Activo"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          const inCurriculum = curriculum.some(curr => curr.courseId === item.id);
                          const inTasks = tasks.some(t => t.courseId === item.id);
                          if (inCurriculum || inTasks) {
                            alert("No se puede eliminar el curso porque ya está siendo utilizado.");
                            return;
                          }
                          const next = courses.filter(c => c.id !== item.id);
                          saveDb("courses", next, setCourses);
                        }}
                        className="text-red-650 hover:text-red-800 cursor-pointer"
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
