import React, { useState } from "react";
import { Calendar, Trash2, X } from "lucide-react";
import { 
  MpaAcademicGroup, MpaPeriod, MpaCareer, MpaShift, 
  MpaProgramTask, MpaSchedule, MpaCourse, MpaClassroom 
} from "../../../types";
import { MpaCurriculumVersion } from "./CurriculumTab";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";
import { WeeklyScheduleGrid } from "../../WeeklyScheduleGrid";

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
  setGroups
}: GroupsTabProps) {
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

  return (
    <PageTransition id="groups">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Crear Grupo Académico</h3>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formGroup.name || !formGroup.periodId || !formGroup.careerId || !formGroup.shiftId) {
                alert("Todos los campos con asteriscos son mandatorios.");
                return;
              }
              
              const activeVersion = curriculumVersions.find(v => v.careerId === formGroup.careerId && v.isActive);
              if (!activeVersion) {
                alert("No es posible crear el grupo porque la carrera seleccionada no posee una malla curricular activa.");
                return;
              }

              const id = "g_" + Date.now();
              const next = [...groups, { ...formGroup, curriculumVersionId: activeVersion.id, id }];
              saveDb("groups", next, setGroups);
              setFormGroup({ id: "", name: "", periodId: "", careerId: "", cycle: 1, shiftId: "", capacity: 30 });
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Código del Grupo Académico *</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: APTI-1-1 / LUN-6" 
                value={formGroup.name}
                onChange={(e) => setFormGroup({ ...formGroup, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Ciclo Académico *</label>
                <select 
                  required 
                  value={formGroup.cycle}
                  onChange={(e) => setFormGroup({ ...formGroup, cycle: Number(e.target.value) })}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
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
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
                >
                  <option value="">-- VER --</option>
                  {shifts.map(sh => (
                    <option key={sh.id} value={sh.id}>{sh.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Período Académico del Grupo *</label>
              <select 
                required 
                value={formGroup.periodId}
                onChange={(e) => setFormGroup({ ...formGroup, periodId: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
              >
                <option value="">-- SELECCIONAR --</option>
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
                className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
              >
                <option value="">-- SELECCIONAR --</option>
                {careers.map(car => (
                  <option key={car.id} value={car.id}>{car.name} ({car.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Capacidad de Alumnos *</label>
              <input
                type="number"
                required
                min={1}
                max={200}
                value={formGroup.capacity}
                onChange={(e) => setFormGroup({ ...formGroup, capacity: parseInt(e.target.value, 10) || 0 })}
                className="w-full mt-1 px-3 py-2 border rounded-md font-mono"
                placeholder="Ej: 30"
              />
            </div>

            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded leading-relaxed text-[10.5px]">
              💡 <strong>Regla del Negocio:</strong> Programación Académica solo mostrará asignaturas de la malla que correspondan al ciclo del grupo.
            </div>

            <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
              Guardar Grupo Académico
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Grupos de Planificación</h3>
          </div>
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Grupo</th>
                <th className="p-3">Periodo</th>
                <th className="p-3">Carrera / especialidad</th>
                <th className="p-3 font-mono">Ciclos</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen grupos académicos registrados.
                  </td>
                </tr>
              ) : (
                groups.map(item => {
                  const perName = periods.find(p => p.id === item.periodId)?.name || item.periodId;
                  const carName = careers.find(c => c.id === item.careerId)?.name || item.careerId;
                  const shName = shifts.find(s => s.id === item.shiftId)?.name || item.shiftId;
                  const mVer = curriculumVersions.find(v => v.id === item.curriculumVersionId)?.name 
                    || (item.curriculumVersionId ? item.curriculumVersionId : "Malla General / Por defecto");
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-black text-[#9F062A]">{item.name}</td>
                      <td className="p-3 text-[11px] font-mono leading-none">{perName}</td>
                      <td className="p-3 max-w-xs text-xs">
                        <div className="font-extrabold text-slate-900 leading-tight mb-0.5">{carName}</div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          Plan: <span className="font-extrabold text-[#9F062A] bg-red-50/50 border border-red-100 px-1.5 py-0.5 rounded text-[9px] uppercase">{mVer}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="flex flex-col sm:flex-row gap-1">
                          <span className="bg-blue-105 text-blue-900 text-[9px] px-1.5 py-0.5 rounded border border-blue-200 font-black whitespace-nowrap">
                            Ciclo {item.cycle} ({shName})
                          </span>
                          <span className="bg-teal-100 text-teal-900 text-[9px] px-1.5 py-0.5 rounded border border-teal-200 font-black whitespace-nowrap">
                            C.: {item.capacity || 30} al.
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setViewingScheduleGroupId(item.id)}
                            className="bg-slate-100 hover:bg-[#800521] text-slate-700 hover:text-white p-1.5 rounded-lg border border-slate-200 hover:border-[#800521] flex items-center justify-center cursor-pointer transition-all gap-1 font-bold text-[10px]"
                            title="Ver Horario de Clases Semanal"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ver Horario</span>
                          </button>
                          <button 
                            onClick={() => {
                              const hasScheduledTasks = tasks.some(t => t.groupId === item.id);
                              if (hasScheduledTasks) {
                                alert("No se puede eliminar el grupo académico porque tiene programaciones académicas activas asignadas.");
                                return;
                              }
                              const next = groups.filter(g => g.id !== item.id);
                              saveDb("groups", next, setGroups);
                            }}
                            className="text-red-650 hover:text-red-800 cursor-pointer p-1.5 hover:bg-red-50 rounded-lg flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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
