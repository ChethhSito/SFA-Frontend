import React, { useState } from "react";
import { Trash2, Plus, X, Clock, CalendarDays } from "lucide-react";
import { MpaShift, MpaSchedule } from "../../../types";
import Button from "../../ui/Button";
import { PageTransition } from "../PageTransition";
import { parseTimeToMinutes, formatMinutesToTime } from "../mpaUtils";

interface ShiftsTabProps {
  shifts: MpaShift[];
  schedules: MpaSchedule[];
  saveDb: (key: string, value: any, setter: Function) => void;
  setShifts: React.Dispatch<React.SetStateAction<MpaShift[]>>;
  setSchedules: React.Dispatch<React.SetStateAction<MpaSchedule[]>>;
}

export function ShiftsTab({ shifts, schedules, saveDb, setShifts, setSchedules }: ShiftsTabProps) {
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const [shiftErrorMessage, setShiftErrorMessage] = useState<string | null>(null);
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState<string | null>(null);
  
  const [formShift, setFormShift] = useState({ id: "", name: "", startTime: "", endTime: "" });
  const [formSchedule, setFormSchedule] = useState({
    id: "",
    dayOfWeek: "Lunes",
    startTime: "07:00",
    endTime: "09:00",
    timeSlot: "",
    shiftId: ""
  });

  const currentShiftId = formSchedule.shiftId || (shifts[0]?.id || "s1");
  const selectedShift = shifts.find(sh => sh.id === currentShiftId) || shifts[0] || { id: "default", name: "Mañana", startTime: "08:00 AM", endTime: "01:00 PM" };
  
  // Generate 50-minute markers
  const markers: string[] = [];
  if (selectedShift) {
    const startMin = parseTimeToMinutes(selectedShift.startTime);
    const endMin = parseTimeToMinutes(selectedShift.endTime);
    let currentMin = startMin;
    while (currentMin <= endMin) {
      markers.push(formatMinutesToTime(currentMin));
      currentMin += 50;
    }
    if (markers.length > 0) {
      const lastMarkerMin = parseTimeToMinutes(markers[markers.length - 1]);
      if (lastMarkerMin < endMin && endMin - lastMarkerMin >= 5) {
        markers.push(formatMinutesToTime(endMin));
      }
    }
  }

  const startOptions = markers.slice(0, -1);
  const currentStartTime = startOptions.includes(formSchedule.startTime) 
    ? formSchedule.startTime 
    : (startOptions[0] || "");

  const startMinVal = parseTimeToMinutes(currentStartTime);
  const endOptions = markers.filter(m => parseTimeToMinutes(m) > startMinVal);

  const currentEndTime = endOptions.includes(formSchedule.endTime)
    ? formSchedule.endTime
    : (endOptions[0] || "");

  return (
    <PageTransition id="shifts" className="p-5 md:p-6 space-y-6 text-left">
      {/* Barra de KPIs Compacta + Botones de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Turnos Habilitados</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {shifts.length} Turnos Activos
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Franjas de Clase</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              {schedules.length} Bloques Registrados
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hora Pedagógica</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              50 Minutos / Sesión
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowShiftForm(!showShiftForm);
              if (!showShiftForm) setShowScheduleForm(false);
            }}
            className={`text-xs font-black px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border ${
              showShiftForm 
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" 
                : "bg-[#800521] hover:bg-[#67041a] text-white border-[#800521]"
            }`}
          >
            {showShiftForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showShiftForm ? "Cerrar Turno" : "+ Registrar Turno"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowScheduleForm(!showScheduleForm);
              if (!showScheduleForm) setShowShiftForm(false);
            }}
            className={`text-xs font-black px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer border ${
              showScheduleForm 
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" 
                : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
            }`}
          >
            {showScheduleForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showScheduleForm ? "Cerrar Horario" : "+ Registrar Horario"}</span>
          </button>
        </div>
      </div>

      {/* FORMULARIO EXPANDIBLE DE TURNO */}
      {showShiftForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider">
              Registrar Nuevo Turno Académico
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              Regla de operación: Mañana de 08:00 AM a 01:00 PM sin solapamientos
            </span>
          </div>

          {shiftErrorMessage && (
            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-bold">
              {shiftErrorMessage}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!formShift.name || !formShift.startTime || !formShift.endTime) {
                setShiftErrorMessage("Todos los campos marcados con asterisco son obligatorios.");
                return;
              }

              const startMin = parseTimeToMinutes(formShift.startTime);
              const endMin = parseTimeToMinutes(formShift.endTime);

              if (startMin >= endMin) {
                setShiftErrorMessage("La hora de inicio debe ser anterior a la hora de salida.");
                return;
              }

              const isMorningName = formShift.name.trim().toLowerCase().includes("mañ") || formShift.name.trim().toLowerCase().includes("morn");
              if (isMorningName) {
                const morningStartBound = parseTimeToMinutes("08:00 AM");
                const morningEndBound = parseTimeToMinutes("01:00 PM");
                if (startMin < morningStartBound || endMin > morningEndBound) {
                  setShiftErrorMessage("Turno Mañana fuera de límites. El turno Mañana debe iniciar a partir de las 08:00 AM y concluir a más tardar a la 01:00 PM.");
                  return;
                }
              }

              const hasShiftOverlap = shifts.some(existingSh => {
                const extStart = parseTimeToMinutes(existingSh.startTime);
                const extEnd = parseTimeToMinutes(existingSh.endTime);
                return (startMin < extEnd && endMin > extStart);
              });

              if (hasShiftOverlap) {
                setShiftErrorMessage("Cruce de turnos detectado. Ya existe otro turno registrado que se solapa total o parcialmente.");
                return;
              }

              setShiftErrorMessage(null);
              const id = "s_" + Date.now();
              const next = [...shifts, { ...formShift, id }];
              saveDb("shifts", next, setShifts);
              setFormShift({ id: "", name: "", startTime: "", endTime: "" });
              setShowShiftForm(false);
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Plantilla Rápida</label>
                <select 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "manana") {
                      setFormShift({ id: "", name: "Mañana", startTime: "08:00 AM", endTime: "01:00 PM" });
                      setShiftErrorMessage(null);
                    } else if (val === "tarde") {
                      setFormShift({ id: "", name: "Tarde", startTime: "01:30 PM", endTime: "06:30 PM" });
                      setShiftErrorMessage(null);
                    } else if (val === "noche") {
                      setFormShift({ id: "", name: "Noche", startTime: "06:45 PM", endTime: "10:45 PM" });
                      setShiftErrorMessage(null);
                    }
                  }}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-lg font-bold text-slate-800"
                >
                  <option value="custom">-- Personalizado / Escribir Rango --</option>
                  <option value="manana">Turno Mañana (08:00 AM - 01:00 PM)</option>
                  <option value="tarde">Turno Tarde (01:30 PM - 06:30 PM)</option>
                  <option value="noche">Turno Noche (06:45 PM - 10:45 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Nombre del Turno *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej: Mañana" 
                  value={formShift.name}
                  onChange={(e) => setFormShift({ ...formShift, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Inicio *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="08:00 AM" 
                    value={formShift.startTime}
                    onChange={(e) => setFormShift({ ...formShift, startTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Salida *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="01:00 PM" 
                    value={formShift.endTime}
                    onChange={(e) => setFormShift({ ...formShift, endTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowShiftForm(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <Button type="submit" className="bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider px-6">
                Guardar Turno
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* FORMULARIO EXPANDIBLE DE HORARIO */}
      {showScheduleForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Registrar Nueva Franja Horaria de Clase
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              Bloques de 50 minutos según normativa pedagógica
            </span>
          </div>

          {scheduleErrorMessage && (
            <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-bold">
              {scheduleErrorMessage}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const finalStart = currentStartTime;
              const finalEnd = currentEndTime;

              if (!finalStart || !finalEnd) {
                setScheduleErrorMessage("Debe seleccionar una hora de inicio y de fin válidas.");
                return;
              }

              const computedTimeSlot = `${finalStart} - ${finalEnd}`;
              const newStartMin = parseTimeToMinutes(finalStart);
              const newEndMin = parseTimeToMinutes(finalEnd);

              const hasOverlap = schedules.some(sch => {
                if (sch.dayOfWeek.trim().toLowerCase() !== formSchedule.dayOfWeek.trim().toLowerCase()) {
                  return false;
                }
                let extStart = sch.startTime ? parseTimeToMinutes(sch.startTime) : 0;
                let extEnd = sch.endTime ? parseTimeToMinutes(sch.endTime) : 0;
                if (!extStart && !extEnd && sch.timeSlot) {
                  const parts = sch.timeSlot.split("-");
                  if (parts.length === 2) {
                    extStart = parseTimeToMinutes(parts[0].trim());
                    extEnd = parseTimeToMinutes(parts[1].trim());
                  }
                }
                return (newStartMin < extEnd && newEndMin > extStart);
              });

              if (hasOverlap) {
                setScheduleErrorMessage(`Ya existe un bloque de clases registrado para el día ${formSchedule.dayOfWeek} en el rango ${finalStart} - ${finalEnd}.`);
                return;
              }

              setScheduleErrorMessage(null);

              const id = "sch_" + Date.now();
              const newSchedule = {
                id,
                dayOfWeek: formSchedule.dayOfWeek,
                startTime: finalStart,
                endTime: finalEnd,
                timeSlot: computedTimeSlot,
                shiftId: currentShiftId
              };
              const next = [...schedules, newSchedule];
              saveDb("schedules", next, setSchedules);
              
              const firstShift = shifts.find(sh => sh.id === currentShiftId) || shifts[0];
              const fallbackStart = firstShift ? firstShift.startTime : "08:00 AM";
              const fallbackStartMin = parseTimeToMinutes(fallbackStart);
              const fallbackEnd = formatMinutesToTime(fallbackStartMin + 50);

              setFormSchedule({ 
                id: "", 
                dayOfWeek: formSchedule.dayOfWeek,
                startTime: fallbackStart, 
                endTime: fallbackEnd, 
                timeSlot: "", 
                shiftId: currentShiftId 
              });
              setShowScheduleForm(false);
            }}
            className="space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Día Académico *</label>
                <select 
                  required 
                  value={formSchedule.dayOfWeek}
                  onChange={(e) => {
                    setFormSchedule({ ...formSchedule, dayOfWeek: e.target.value });
                    setScheduleErrorMessage(null);
                  }}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Turno Vinculado *</label>
                <select
                  required
                  value={currentShiftId}
                  onChange={(e) => {
                    const newSId = e.target.value;
                    const sh = shifts.find(s => s.id === newSId);
                    const tS = sh ? sh.startTime : "08:00 AM";
                    const tSMin = parseTimeToMinutes(tS);
                    const tE = formatMinutesToTime(tSMin + 50);
                    
                    setFormSchedule({ 
                      ...formSchedule, 
                      shiftId: newSId,
                      startTime: tS,
                      endTime: tE
                    });
                    setScheduleErrorMessage(null);
                  }}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold"
                >
                  {shifts.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      Turno {sh.name} ({sh.startTime} - {sh.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora de Inicio *</label>
                <select 
                  required 
                  value={currentStartTime}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    const newStartMin = parseTimeToMinutes(newStart);
                    const newEnds = markers.filter(m => parseTimeToMinutes(m) > newStartMin);
                    const newEnd = newEnds.includes(formSchedule.endTime) ? formSchedule.endTime : (newEnds[0] || "");
                    setFormSchedule({ 
                      ...formSchedule, 
                      startTime: newStart,
                      endTime: newEnd
                    });
                    setScheduleErrorMessage(null);
                  }}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800 font-mono"
                >
                  {startOptions.map((st, idx) => (
                    <option key={st} value={st}>
                      {st} (Hora {idx + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora de Fin *</label>
                <select 
                  required 
                  value={currentEndTime}
                  onChange={(e) => {
                    setFormSchedule({ 
                      ...formSchedule, 
                      endTime: e.target.value 
                    });
                    setScheduleErrorMessage(null);
                  }}
                  className="w-full mt-1 p-2 bg-white border rounded-lg font-bold text-slate-800 font-mono"
                >
                  {endOptions.map((et) => {
                    const originalStartMin = parseTimeToMinutes(currentStartTime);
                    const currentEndMin = parseTimeToMinutes(et);
                    const totalPedagogicalHours = Math.round((currentEndMin - originalStartMin) / 50);
                    return (
                      <option key={et} value={et}>
                        {totalPedagogicalHours} {totalPedagogicalHours === 1 ? 'Hora' : 'Horas'} (Hasta {et})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white uppercase text-[10px] font-black tracking-wider px-6">
                Guardar Horario Académico
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SECCIÓN 1: TABLA DE TURNOS A TODO LO ANCHO */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#9F062A]" />
            Turnos Habilitados ({shifts.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Jornadas Oficiales
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Nombre del Turno</th>
                <th className="p-3.5">Horario Regulado de Ingreso y Salida</th>
                <th className="p-3.5 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen turnos configurados.
                  </td>
                </tr>
              ) : (
                shifts.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 pl-5 font-black text-[#9F062A] text-sm">
                      Turno {item.name}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {item.startTime} a {item.endTime}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button 
                        onClick={() => {
                          const next = shifts.filter(s => s.id !== item.id);
                          saveDb("shifts", next, setShifts);
                        }}
                        className="text-red-500 hover:text-red-800 cursor-pointer p-1.5 rounded hover:bg-red-50"
                        title="Eliminar turno"
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

      {/* SECCIÓN 2: TABLA DE MATRIZ DE HORARIOS A TODO LO ANCHO */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-[#9F062A]" />
            Matriz de Horarios de Clase Habilitados ({schedules.length})
          </h3>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Franjas Semanales
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Día de Semana</th>
                <th className="p-3.5">Turno Asignado</th>
                <th className="p-3.5">Rango Horario del Bloque</th>
                <th className="p-3.5 text-right pr-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-semibold text-xs">
                    No existen bloques de horarios registrados.
                  </td>
                </tr>
              ) : (
                schedules.map(item => {
                  const associatedShift = shifts.find(s => s.id === item.shiftId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-5 font-black text-slate-900">{item.dayOfWeek}</td>
                      <td className="p-3.5">
                        {associatedShift ? (
                          <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                            Turno {associatedShift.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No especificado</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-xs text-[#9F062A] font-black">
                        {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.timeSlot}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <button 
                          onClick={() => {
                            const next = schedules.filter(s => s.id !== item.id);
                            saveDb("schedules", next, setSchedules);
                          }}
                          className="text-red-500 hover:text-red-800 cursor-pointer p-1.5 rounded hover:bg-red-50"
                          title="Eliminar bloque horario"
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
