import React, { useState } from "react";
import { Trash2 } from "lucide-react";
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
}

export function TeachersTab({ teachers, careers, tasks, saveDb, setTeachers }: TeachersTabProps) {
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

  return (
    <PageTransition id="teachers">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Docente</h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formTeacher.name || !formTeacher.dni) return;
              if (teacherSelectedSpecialties.length === 0) {
                alert("Por favor seleccione o agregue al menos una especialidad.");
                return;
              }
              const exist = teachers.some(t => t.dni === formTeacher.dni);
              if (exist) {
                alert("Ya existe un docente registrado con ese DNI.");
                return;
              }
              const next = [...teachers, { 
                ...formTeacher, 
                specialties: teacherSelectedSpecialties,
                specialty: teacherSelectedSpecialties.join(", ")
              }];
              saveDb("teachers", next, setTeachers);
              setFormTeacher({ dni: "", name: "", lastName: "", email: "", specialty: "", status: "Disponible", careerId: "comun" });
              setTeacherSelectedSpecialties([]);
              setCustomSpecialty("");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">DNI Docente *</label>
                <input 
                  type="text" 
                  required 
                  maxLength={8} 
                  placeholder="DNI" 
                  value={formTeacher.dni}
                  onChange={(e) => setFormTeacher({ ...formTeacher, dni: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombres *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Marcos Alberto" 
                  value={formTeacher.name}
                  onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Apellidos del Docente *</label>
              <input 
                type="text" 
                required 
                placeholder="Ramos Meléndez" 
                value={formTeacher.lastName}
                onChange={(e) => setFormTeacher({ ...formTeacher, lastName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Correo Electrónico *</label>
              <input 
                type="email" 
                required 
                placeholder="ejemplo@iestpsfa.edu.pe" 
                value={formTeacher.email}
                onChange={(e) => setFormTeacher({ ...formTeacher, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md font-mono"
              />
            </div>

            {/* Especialidades MULTI SELECT CHECKBOXES */}
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-500 font-bold uppercase border-b pb-1">
                Especialidades de Trabajo *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-200">
                {[
                  "Desarrollo de Sistemas",
                  "Contabilidad",
                  "Administración",
                  "Cursos Generales",
                  "Matemática",
                  "Comunicación",
                  "Electricidad Industrial",
                  "Electrónica"
                ].map(spec => (
                  <label key={spec} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-700">
                    <input 
                      type="checkbox"
                      checked={teacherSelectedSpecialties.includes(spec)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTeacherSelectedSpecialties([...teacherSelectedSpecialties, spec]);
                        } else {
                          setTeacherSelectedSpecialties(teacherSelectedSpecialties.filter(s => s !== spec));
                        }
                      }}
                      className="rounded text-[#9F062A] focus:ring-[#9F062A] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{spec}</span>
                  </label>
                ))}
                {/* Render custom ones added in this form */}
                {teacherSelectedSpecialties.filter(s => ![
                  "Desarrollo de Sistemas",
                  "Contabilidad",
                  "Administración",
                  "Cursos Generales",
                  "Matemática",
                  "Comunicación",
                  "Electricidad Industrial",
                  "Electrónica"
                ].includes(s)).map(spec => (
                  <label key={spec} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-[#9F062A]">
                    <input 
                      type="checkbox"
                      checked={true}
                      onChange={() => {
                        setTeacherSelectedSpecialties(teacherSelectedSpecialties.filter(s => s !== spec));
                      }}
                      className="rounded text-[#9F062A] focus:ring-[#9F062A] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate">{spec}</span>
                  </label>
                ))}
              </div>

              {/* Nueva Especialidad Personalizada */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Agregar otra..." 
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border rounded-md text-xs font-semibold bg-white text-slate-950 placeholder-slate-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = customSpecialty.trim();
                    if (trimmed && !teacherSelectedSpecialties.includes(trimmed)) {
                      setTeacherSelectedSpecialties([...teacherSelectedSpecialties, trimmed]);
                      setCustomSpecialty("");
                    }
                  }}
                  className="bg-[#9F062A] hover:bg-[#800521] text-white px-2.5 py-1.5 rounded text-[9px] font-black uppercase cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera Asociada *</label>
              <select
                required
                value={formTeacher.careerId || "comun"}
                onChange={(e) => setFormTeacher({ ...formTeacher, careerId: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
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
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
              >
                <option value="Disponible">Disponible</option>
                <option value="Licencia">Licencia</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Registrar Docente
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Plana Docente Registrada</h3>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">DNI / Email</th>
                <th className="p-3">Apellidos y Nombres</th>
                <th className="p-3">Especialidad</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen docentes registrados.
                  </td>
                </tr>
              ) : (
                teachers.map(item => {
                  const statusVal = item.status || "Disponible";
                  return (
                    <tr key={item.dni} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        <span className="font-bold text-slate-800 block">{item.dni}</span>
                        <span className="text-[10px] block font-semibold">{item.email}</span>
                      </td>
                      <td className="p-3 font-black text-[#9F062A]">{item.lastName}, {item.name}</td>
                      <td className="p-3 text-[11px] font-semibold">
                        <div className="flex flex-wrap gap-1 mb-1.5 max-w-xs">
                          {getTeacherSpecialties(item).map(spec => (
                            <span key={spec} className="inline-block bg-pink-50 border border-pink-100/70 text-[#9F062A] text-[9.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                              {spec}
                            </span>
                          ))}
                          {getTeacherSpecialties(item).length === 0 && (
                            <span className="text-slate-400 italic">Ninguna</span>
                          )}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white ${
                            item.careerId === "comun" 
                              ? "bg-slate-500" 
                              : item.careerId === "contabilidad"
                              ? "bg-sky-600"
                              : item.careerId === "electronica"
                              ? "bg-amber-600"
                              : "bg-purple-600"
                          }`}>
                            {item.careerId === "comun" 
                              ? "Todas / General" 
                              : careers.find(car => car.id === item.careerId)?.code || "Especialidad"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          statusVal === "Disponible" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : statusVal === "Licencia"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-500 border-slate-250"
                        }`}>
                          {statusVal}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5 mr-3">
                          <select
                            value={statusVal}
                            onChange={(e) => {
                              const next = teachers.map(t => t.dni === item.dni ? { ...t, status: e.target.value } : t);
                              saveDb("teachers", next, setTeachers);
                            }}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer"
                          >
                            <option value="Disponible">Disponible</option>
                            <option value="Licencia">Licencia</option>
                            <option value="Inactivo">Inactivo</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => {
                            const hasScheduledSessions = tasks.some(t => t.teacherDni === item.dni);
                            if (hasScheduledSessions) {
                              alert("No se puede eliminar la cuenta de este docente porque tiene sesiones programadas en el sistema. Modifique su estado de disponibilidad en su lugar.");
                              return;
                            }
                            const next = teachers.filter(t => t.dni !== item.dni);
                            saveDb("teachers", next, setTeachers);
                          }}
                          className="text-red-650 hover:text-red-800 cursor-pointer inline-block align-middle"
                        >
                          <Trash2 className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </PageTransition>
  );
}
