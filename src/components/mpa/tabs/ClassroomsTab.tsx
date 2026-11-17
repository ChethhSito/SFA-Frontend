import React, { useState } from "react";
import { Trash2, Building, Plus, CheckCircle2, MapPin, X } from "lucide-react";
import { MpaClassroom, MpaCareer, MpaProgramTask } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";

interface ClassroomsTabProps {
  classrooms: MpaClassroom[];
  careers: MpaCareer[];
  tasks: MpaProgramTask[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setClassrooms: React.Dispatch<React.SetStateAction<MpaClassroom[]>>;
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function ClassroomsTab({ classrooms, careers, tasks, saveDb, setClassrooms, notify }: ClassroomsTabProps) {
  const [showForm, setShowForm] = useState(false);
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

  const labCount = classrooms.filter(c => c.type === "Laboratorio").length;
  const theoryCount = classrooms.filter(c => c.type === "Teoría").length;

  return (
    <PageTransition id="classrooms" className="space-y-6 text-left">
      {/* Banner Institucional Borgoña Oficial */}
      <header className="rounded-2xl bg-[#800521] p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-amber-300 shrink-0" />
          <div>
            <h1 className="text-xl font-black">Gestión de Aulas y Laboratorios</h1>
            <p className="mt-1 text-sm text-rose-50">
              Distribución de ambientes físicos, talleres de potencia y capacidad de aforo.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "Cerrar Formulario" : "Registrar Nueva Aula"}</span>
        </button>
      </header>

      {/* Tarjetas de Resumen Ejecutivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Ambientes</span>
          <span className="text-lg font-black text-[#800521] font-mono mt-1 block">
            {classrooms.length} Espacios Físicos
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Habilitados para el semestre
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aulas de Teoría</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
            {theoryCount} Aulas
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Sesiones presenciales magistrales
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Talleres y Laboratorios</span>
          <span className="text-lg font-black text-amber-600 font-mono mt-1 block">
            {labCount} Laboratorios
          </span>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            Equipamiento técnico especializado
          </span>
        </div>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Registrar Nuevo Ambiente Físico
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Capacidad y Asignación Institucional
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formRoom.name || !formRoom.location) return;
              const id = "r_" + Date.now();
              const next = [...classrooms, { ...formRoom, id }];
              saveDb("classrooms", next, setClassrooms);
              setFormRoom({ id: "", name: "", type: "Teoría", location: "", capacity: 40, careerId: "comun" });
              setShowForm(false);
              notify?.(`Ambiente ${formRoom.name} registrado exitosamente.`, "success");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Ambiente *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Laboratorio 402, Taller de PLC" 
                  value={formRoom.name}
                  onChange={(e) => setFormRoom({ ...formRoom, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Tipo de Ambiente *</label>
                <select 
                  required 
                  value={formRoom.type}
                  onChange={(e) => setFormRoom({ ...formRoom, type: e.target.value as any })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  <option value="Teoría">Teoría</option>
                  <option value="Laboratorio">Laboratorio / Taller</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Capacidad Máxima (Aforo) *</label>
                <input 
                  type="number" 
                  required 
                  value={formRoom.capacity}
                  onChange={(e) => setFormRoom({ ...formRoom, capacity: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Programa / Carrera Asignada *</label>
                <select
                  required
                  value={formRoom.careerId || "comun"}
                  onChange={(e) => setFormRoom({ ...formRoom, careerId: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  <option value="comun">Todas / Uso Común o General</option>
                  {careers.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} ({car.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Ubicación Física Institucional *</label>
              <input 
                type="text" 
                required 
                placeholder="Pabellón B Piso 2, Taller de Máquinas Eléctricas" 
                value={formRoom.location}
                onChange={(e) => setFormRoom({ ...formRoom, location: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-700"
              />
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
                Guardar Ambiente
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Ambientes a Todo lo Ancho */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
            Ambientes Registrados ({classrooms.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Infraestructura y Aforos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Nombre del Ambiente</th>
                <th className="p-4 text-center">Tipo</th>
                <th className="p-4">Ubicación Institucional</th>
                <th className="p-4 text-center font-mono">Aforo Máximo</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {classrooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen ambientes registrados.
                  </td>
                </tr>
              ) : (
                classrooms.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#9F062A]" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[9.5px] font-black uppercase border inline-block ${
                        item.type === "Laboratorio"
                          ? "bg-amber-50 text-amber-800 border-amber-250 font-bold"
                          : "bg-blue-50 text-blue-800 border-blue-250 font-bold"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{item.location}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-900">{item.capacity} Estudiantes</td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        onClick={() => {
                          const inTasks = tasks.some(t => t.classroomId === item.id);
                          if (inTasks) {
                            notify?.("No se puede eliminar el ambiente porque está asignado a programaciones activas.", "warning");
                            return;
                          }
                          const next = classrooms.filter(c => c.id !== item.id);
                          saveDb("classrooms", next, setClassrooms);
                          notify?.(`Ambiente eliminado.`, "info");
                        }}
                        className="text-red-500 hover:text-red-800 cursor-pointer p-1.5 rounded hover:bg-red-50"
                        title="Eliminar ambiente"
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