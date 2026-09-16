import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { MpaClassroom, MpaCareer, MpaProgramTask } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

interface ClassroomsTabProps {
  classrooms: MpaClassroom[];
  careers: MpaCareer[];
  tasks: MpaProgramTask[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setClassrooms: React.Dispatch<React.SetStateAction<MpaClassroom[]>>;
}

export function ClassroomsTab({ classrooms, careers, tasks, saveDb, setClassrooms }: ClassroomsTabProps) {
  const [formRoom, setFormRoom] = useState<{
    id: string;
    name: string;
    type: "Teoría" | "Laboratorio";
    location: string;
    capacity: number;
    careerId: string;
  }>({
    id: "",
    name: "",
    type: "Teoría",
    location: "",
    capacity: 40,
    careerId: "comun"
  });

  return (
    <PageTransition id="classrooms">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Infraestructura</h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formRoom.name || !formRoom.location) return;
              const id = "r_" + Date.now();
              const next = [...classrooms, { ...formRoom, id }];
              saveDb("classrooms", next, setClassrooms);
              setFormRoom({ id: "", name: "", type: "Teoría", location: "", capacity: 40, careerId: "comun" });
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Aula / Ambiente *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: Laboratorio 402, Aula General 110" 
                value={formRoom.name}
                onChange={(e) => setFormRoom({ ...formRoom, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Aula *</label>
                <select 
                  required 
                  value={formRoom.type}
                  onChange={(e) => setFormRoom({ ...formRoom, type: e.target.value as any })}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                >
                  <option value="Teoría">Teoría</option>
                  <option value="Laboratorio">Laboratorio</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Capacidad Máxima *</label>
                <input 
                  type="number" 
                  required 
                  value={formRoom.capacity}
                  onChange={(e) => setFormRoom({ ...formRoom, capacity: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera Asignada *</label>
              <select
                required
                value={formRoom.careerId || "comun"}
                onChange={(e) => setFormRoom({ ...formRoom, careerId: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
              >
                <option value="comun">Todas / Uso Común o General</option>
                {careers.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} ({car.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Ubicación Física *</label>
              <input 
                type="text" 
                required 
                placeholder="Pabellón B Piso 2, Taller de Electrónica" 
                value={formRoom.location}
                onChange={(e) => setFormRoom({ ...formRoom, location: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md font-bold text-slate-700"
              />
            </div>

            <div className="p-3 bg-[#9F062A]/5 text-[#9F062A] rounded border border-[#9F062A]/20 text-[10px] leading-relaxed">
              ⚠️ <strong>Regla Especial:</strong> Programación Académica forzará que las sesiones de Laboratorio solo puedan asignarse a aulas tipo Laboratorio.
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Guardar Aula / Ambiente
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Ambientes Académicos</h3>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Tipo Aula</th>
                <th className="p-3">Referencia Ubicación</th>
                <th className="p-3 font-mono">Capacidad</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {classrooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen aulas registradas.
                  </td>
                </tr>
              ) : (
                classrooms.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-black text-slate-900">
                      <div>{item.name}</div>
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
                            ? "Uso Común" 
                            : careers.find(car => car.id === item.careerId)?.code || "Especialidad"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                        item.type === "Laboratorio" 
                          ? "bg-rose-50 text-red-900 border-red-200" 
                          : "bg-blue-50 text-blue-900 border-blue-200"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-505 text-[11px]">{item.location}</td>
                    <td className="p-3 font-mono">{item.capacity} estudiantes</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          const hasScheduled = tasks.some(t => t.classroomId === item.id);
                          if (hasScheduled) {
                            alert("No se puede eliminar el aula porque está ocupada por programación activa.");
                            return;
                          }
                          const next = classrooms.filter(r => r.id !== item.id);
                          saveDb("classrooms", next, setClassrooms);
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
    </PageTransition>
  );
}
