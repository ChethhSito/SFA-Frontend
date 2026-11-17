import React, { useState } from "react";
import { Trash2, Users, Plus, CheckCircle2, Mail, Award, X } from "lucide-react";
import { MpaCareer, MpaProgramTask } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";
import { getTeacherSpecialties } from "../mpaUtils";

interface TeachersTabProps {
  teachers: any[];
  careers: MpaCareer[];
  tasks: MpaProgramTask[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>;
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function TeachersTab({ teachers, careers, tasks, saveDb, setTeachers, notify }: TeachersTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formTeacher, setFormTeacher] = useState({
    dni: "",
    name: "",
    lastName: "",
    email: "",
    specialty: "",
    status: "Disponible" as "Disponible" | "Licencia" | "Inactivo",
    careerId: "comun"
  });
  const [teacherSelectedSpecialties, setTeacherSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState<string>("");

  const availableCount = teachers.filter(t => (t.status || "Disponible") === "Disponible").length;

  return (
    <PageTransition id="teachers" className="space-y-6 text-left">
      {/* Banner Institucional Borgoña Oficial */}
      <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-amber-300 shrink-0" />
          <div>
            <h1 className="text-xl font-black">Gestión de Plana Docente</h1>
            <p className="mt-1 text-sm text-rose-50">
              Registro de catedráticos, especialidades técnicas y asignación horaria.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "Cerrar Formulario" : "Registrar Nuevo Docente"}</span>
        </button>
      </header>

      {/* Tarjetas de Resumen Ejecutivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Docentes</span>
          <span className="text-lg font-black text-[#800521] font-mono mt-1 block">
            {teachers.length} Profesores
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Plana activa del semestre
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Disponibles para Carga</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
            {availableCount} Docentes
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Sin cruce ni licencias
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialidades Cubiertas</span>
          <span className="text-lg font-black text-amber-600 font-mono mt-1 block">
            Electricidad & Contabilidad
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            + Formación General y Empleabilidad
          </span>
        </div>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Registrar Nuevo Docente Catedrático
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Datos personales y especialidades
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formTeacher.name || !formTeacher.dni) return;
              if (teacherSelectedSpecialties.length === 0) {
                notify?.("Por favor seleccione o agregue al menos una especialidad.", "warning");
                return;
              }
              const exist = teachers.some(t => t.dni === formTeacher.dni);
              if (exist) {
                notify?.("Ya existe un docente registrado con ese DNI.", "warning");
                return;
              }
              const next = [...teachers, { 
                ...formTeacher, 
                specialty: teacherSelectedSpecialties.join(", "),
                id: "t_" + formTeacher.dni
              }];
              saveDb("teachers", next, setTeachers);
              setFormTeacher({
                dni: "",
                name: "",
                lastName: "",
                email: "",
                specialty: "",
                status: "Disponible",
                careerId: "comun"
              });
              setTeacherSelectedSpecialties([]);
              setShowForm(false);
              notify?.(`Docente ${formTeacher.name} registrado exitosamente.`, "success");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">DNI del Docente *</label>
                <input 
                  type="text" 
                  required 
                  maxLength={8}
                  placeholder="8 dígitos" 
                  value={formTeacher.dni}
                  onChange={(e) => setFormTeacher({ ...formTeacher, dni: e.target.value.replace(/\D/g, "") })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombres *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Carlos Eduardo" 
                  value={formTeacher.name}
                  onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Apellidos Completos *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Mendoza Quispe" 
                  value={formTeacher.lastName}
                  onChange={(e) => setFormTeacher({ ...formTeacher, lastName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Correo Electrónico *</label>
                <input 
                  type="email" 
                  required 
                  placeholder="docente@sfa.edu.pe" 
                  value={formTeacher.email}
                  onChange={(e) => setFormTeacher({ ...formTeacher, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                  Especialidades Académicas *
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {["Electricidad Industrial", "Contabilidad", "Matemática Aplicada", "Control y Automatización", "Tributación", "Legislación"].map(spec => (
                    <label key={spec} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                      <input 
                        type="checkbox"
                        checked={teacherSelectedSpecialties.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) setTeacherSelectedSpecialties([...teacherSelectedSpecialties, spec]);
                          else setTeacherSelectedSpecialties(teacherSelectedSpecialties.filter(s => s !== spec));
                        }}
                        className="rounded text-[#9F062A] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera Principal *</label>
                  <select
                    required
                    value={formTeacher.careerId || "comun"}
                    onChange={(e) => setFormTeacher({ ...formTeacher, careerId: e.target.value })}
                    className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                  >
                    <option value="comun">Todas / Cursos Generales</option>
                    {careers.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.name} ({car.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Estado de Disponibilidad *</label>
                  <select
                    value={formTeacher.status}
                    onChange={(e) => setFormTeacher({ ...formTeacher, status: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Licencia">Licencia</option>
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
                Guardar Docente
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Docentes a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
            Plana Docente Registrada ({teachers.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Cuerpo Académico Oficial
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">DNI / Identificación</th>
                <th className="p-4">Apellidos y Nombres</th>
                <th className="p-4">Correo Institucional</th>
                <th className="p-4">Especialidad Formativa</th>
                <th className="p-4 text-center font-mono">Estado</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen docentes registrados.
                  </td>
                </tr>
              ) : (
                teachers.map(item => (
                  <tr key={item.dni || item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono font-black text-[#9F062A] text-sm">{item.dni}</td>
                    <td className="p-4 text-slate-900 font-bold text-sm">
                      {item.lastName ? `${item.lastName}, ${item.name}` : item.name}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">{item.email || "No registrado"}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {getTeacherSpecialties(item).map((spec: string, idx: number) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[9.5px] font-bold">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[9.5px] font-black uppercase border inline-block ${
                        (item.status || "Disponible") === "Disponible"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-250 font-bold"
                          : "bg-amber-50 text-amber-800 border-amber-250 font-bold"
                      }`}>
                        {item.status || "Disponible"}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        onClick={() => {
                          const inTasks = tasks.some(t => t.teacherDni === item.dni);
                          if (inTasks) {
                            notify?.("No se puede eliminar el docente porque tiene horarios o sesiones asignadas.", "warning");
                            return;
                          }
                          const next = teachers.filter(t => t.dni !== item.dni);
                          saveDb("teachers", next, setTeachers);
                          notify?.(`Docente retirado.`, "info");
                        }}
                        className="text-red-500 hover:text-red-800 cursor-pointer p-1.5 rounded hover:bg-red-50"
                        title="Eliminar docente"
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
    </PageTransition>
  );
}