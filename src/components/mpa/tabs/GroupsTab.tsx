import React, { useState } from "react";
import { Calendar, Trash2, Plus, X, Users } from "lucide-react";
import { 
  MpaAcademicGroup, MpaPeriod, MpaCareer, MpaShift, 
  MpaProgramTask, MpaSchedule, MpaCourse, MpaClassroom 
} from "../../../types";
import { MpaCurriculumVersion } from "./CurriculumTab";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";
import { WeeklyScheduleGrid } from "../../ui/WeeklyScheduleGrid";

interface GroupsTabProps {
  groups: MpaAcademicGroup[];
  periods: MpaPeriod[];
  careers: MpaCareer[];
  shifts: MpaShift[];
  curriculumVersions: MpaCurriculumVersion[];
  tasks: MpaProgramTask[];
  schedules: MpaSchedule[];
  courses: MpaCourse[];
  classrooms: MpaClassroom[];
  teachers: any[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setGroups: React.Dispatch<React.SetStateAction<MpaAcademicGroup[]>>;
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
}

export function GroupsTab({
  groups,
  periods,
  careers,
  shifts,
  curriculumVersions,
  tasks,
  schedules,
  courses,
  classrooms,
  teachers,
  saveDb,
  setGroups,
  notify
}: GroupsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formGroup, setFormGroup] = useState({
    id: "",
    name: "",
    periodId: "",
    careerId: "",
    cycle: 1,
    shiftId: "",
    capacity: 30
  });
  const [viewingScheduleGroupId, setViewingScheduleGroupId] = useState<string | null>(null);

  const activeCareersInGroups = new Set(groups.map(g => g.careerId)).size;

  return (
    <PageTransition id="groups" className="p-5 md:p-6 space-y-4 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Grupos</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {groups.length} Secciones
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Carreras con Grupos</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              {activeCareersInGroups} de {careers.length} Carreras
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Capacidad Planificada</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              Aforo Regular (30 est.)
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
          <span>{showForm ? "Cerrar Formulario" : "+ Registrar Grupo"}</span>
        </button>
      </div>

      {/* FORMULARIO EXPANDIBLE AL 100% */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Crear Nuevo Grupo Académico
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Vinculación de carrera, ciclo lectivo y turno
            </span>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formGroup.name || !formGroup.periodId || !formGroup.careerId || !formGroup.shiftId) {
                notify?.("Todos los campos con asteriscos son mandatorios.", "warning");
                return;
              }
              
              const activeVersion = curriculumVersions.find(v => v.careerId === formGroup.careerId && v.isActive);
              if (!activeVersion) {
                notify?.("No es posible crear el grupo porque la carrera seleccionada no posee una malla curricular activa.", "warning");
                return;
              }

              const id = "g_" + Date.now();
              const next = [...groups, { ...formGroup, curriculumVersionId: activeVersion.id, id }];
              saveDb("groups", next, setGroups);
              setFormGroup({ id: "", name: "", periodId: "", careerId: "", cycle: 1, shiftId: "", capacity: 30 });
              setShowForm(false);
              notify?.(`Grupo ${formGroup.name} registrado exitosamente.`, "success");
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Código del Grupo Académico *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: EIND-I-1 / CONT-II-1" 
                  value={formGroup.name}
                  onChange={(e) => setFormGroup({ ...formGroup, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Período Académico *</label>
                <select 
                  required 
                  value={formGroup.periodId}
                  onChange={(e) => setFormGroup({ ...formGroup, periodId: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  <option value="">-- Seleccionar Período --</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Especialidad de la Carrera *</label>
                <select 
                  required 
                  value={formGroup.careerId}
                  onChange={(e) => setFormGroup({ ...formGroup, careerId: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  <option value="">-- Seleccionar Carrera --</option>
                  {careers.map(car => (
                    <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Curricular *</label>
                <select 
                  required 
                  value={formGroup.cycle}
                  onChange={(e) => setFormGroup({ ...formGroup, cycle: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>Ciclo {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Turno de Aula *</label>
                <select 
                  required 
                  value={formGroup.shiftId}
                  onChange={(e) => setFormGroup({ ...formGroup, shiftId: e.target.value })}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800"
                >
                  <option value="">-- Seleccionar Turno --</option>
                  {shifts.map(sh => (
                    <option key={sh.id} value={sh.id}>{sh.name} ({sh.startTime} - {sh.endTime})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Capacidad Máxima de Alumnos *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={200}
                  value={formGroup.capacity}
                  onChange={(e) => setFormGroup({ ...formGroup, capacity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg leading-relaxed text-[11px] font-medium">
              <strong>Regla del Negocio:</strong> Programación Académica filtrará y habilitará automáticamente las asignaturas de la malla que correspondan al ciclo y carrera de este grupo.
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
                Guardar Grupo Académico
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TABLA DE GRUPOS A TODO LO ANCHO */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#9F062A]" />
            Grupos de Planificación Registrados ({groups.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Secciones Académicas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Código de Grupo</th>
                <th className="p-3.5">Período</th>
                <th className="p-3.5">Carrera / Malla Curricular</th>
                <th className="p-3.5">Ciclo y Turno</th>
                <th className="p-3.5 text-center font-mono">Aforo</th>
                <th className="p-3.5 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen grupos académicos registrados.
                  </td>
                </tr>
              ) : (
                groups.map(item => {
                  const perName = periods.find(p => p.id === item.periodId)?.name || item.periodId;
                  const carName = careers.find(c => c.id === item.careerId)?.name || item.careerId;
                  const shName = shifts.find(s => s.id === item.shiftId)?.name || item.shiftId;
                  const mVer = curriculumVersions.find(v => v.id === item.curriculumVersionId)?.name 
                    || (item.curriculumVersionId ? item.curriculumVersionId : "Malla Oficial");
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-5 font-black text-[#9F062A] text-sm">{item.name}</td>
                      <td className="p-3.5 text-xs font-mono font-bold text-slate-700">{perName}</td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 leading-tight mb-0.5">{carName}</div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          Plan: <span className="font-extrabold text-[#9F062A] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded text-[9px] uppercase">{mVer}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-blue-50 text-blue-900 text-[9.5px] px-2 py-0.5 rounded border border-blue-200 font-black">
                            Ciclo {item.cycle}
                          </span>
                          <span className="bg-amber-50 text-amber-900 text-[9.5px] px-2 py-0.5 rounded border border-amber-200 font-black">
                            Turno {shName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {item.capacity || 30} est.
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex gap-2 justify-end items-center">
                          <button
                            onClick={() => setViewingScheduleGroupId(item.id)}
                            className="bg-slate-100 hover:bg-[#800521] text-slate-700 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#800521] flex items-center justify-center cursor-pointer transition-all gap-1.5 font-bold text-[10px]"
                            title="Ver Horario de Clases Semanal"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Ver Horario</span>
                          </button>
                          <button 
                            onClick={() => {
                              const hasScheduledTasks = tasks.some(t => t.groupId === item.id);
                              if (hasScheduledTasks) {
                                notify?.("No se puede eliminar el grupo académico porque tiene programaciones académicas activas asignadas.", "warning");
                                return;
                              }
                              const next = groups.filter(g => g.id !== item.id);
                              saveDb("groups", next, setGroups);
                              notify?.(`Grupo eliminado.`, "info");
                            }}
                            className="text-red-500 hover:text-red-800 cursor-pointer p-1.5 rounded hover:bg-red-50"
                            title="Eliminar grupo"
                          >
                            <Trash2 className="w-4 h-4 ml-auto" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Horario de Curso */}
      {viewingScheduleGroupId && (() => {
        const targetGroup = groups.find(g => g.id === viewingScheduleGroupId);
        if (!targetGroup) return null;
        const groupTasks = tasks.filter(t => t.groupId === targetGroup.id);
        const career = careers.find(car => car.id === targetGroup.careerId);
        const period = periods.find(p => p.id === targetGroup.periodId);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200">
              <div className="p-4 bg-slate-100 border-b border-slate-200 text-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-[#9F062A] px-2 py-0.5 rounded-full uppercase tracking-widest font-black text-white">Visualizador de Horario</span>
                  <h3 className="text-sm font-black mt-1">Horario Semanal - Grupo {targetGroup.name}</h3>
                </div>
                <button 
                  onClick={() => setViewingScheduleGroupId(null)}
                  className="text-slate-400 hover:text-slate-800 bg-slate-200/50 hover:bg-slate-300 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-slate-50">
                <WeeklyScheduleGrid 
                  tasks={groupTasks}
                  schedules={schedules}
                  courses={courses}
                  classrooms={classrooms}
                  teachers={teachers}
                  group={targetGroup}
                  title={`Horario Lectivo Oficial • Grupo ${targetGroup.name}`}
                  subtitle={`${career?.name || "Especialidad"} • Ciclo ${targetGroup.cycle} • ${period?.name}`}
                />
              </div>
              <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setViewingScheduleGroupId(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </PageTransition>
  );
}
