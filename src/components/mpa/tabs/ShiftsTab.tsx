import React, { useState } from "react";
import { Trash2 } from "lucide-react";
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
    <PageTransition id="shifts">
      <div className="space-y-8 text-left">
        {/* SECTION 1: SHIFTS / TURNOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Turno</h3>
            
            {shiftErrorMessage && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-bold space-y-1">
                <p>⚠️ {shiftErrorMessage}</p>
                <p className="text-[10px] font-medium text-slate-500">
                  Recuerde que el Turno Mañana debe ser entre 08:00 AM y 01:00 PM, y no puede haber solapamiento entre turnos.
                </p>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] font-medium text-amber-900 leading-relaxed space-y-1">
              <p className="font-extrabold uppercase text-[9px] text-amber-800 tracking-wider">🎯 Reglas de Operación:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>Mañana:</strong> Permitido exclusivamente de <b>08:00 AM a 01:00 PM</b>.</li>
                <li><strong>Evitar Cruces:</strong> No se pueden programar turnos que se superpongan en horario.</li>
              </ul>
            </div>

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
                  setShiftErrorMessage("Cruze de turnos detectado. Ya existe otro turno registrado que se solapa total o parcialmente con las horas especificadas.");
                  return;
                }

                setShiftErrorMessage(null);
                const id = "s_" + Date.now();
                const next = [...shifts, { ...formShift, id }];
                saveDb("shifts", next, setShifts);
                setFormShift({ id: "", name: "", startTime: "", endTime: "" });
              }}
              className="space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Plantilla de Turno Académico</label>
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
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800"
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
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Inicio *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej: 08:00 AM" 
                    value={formShift.startTime}
                    onChange={(e) => setFormShift({ ...formShift, startTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase">Hora Salida *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej: 01:00 PM" 
                    value={formShift.endTime}
                    onChange={(e) => setFormShift({ ...formShift, endTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                Guardar Turno
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Turnos Habilitados</h3>
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#9F062A]/5 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Turno</th>
                  <th className="p-3">Horario Regulado de Ingreso / Salida</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {shifts.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-black text-[#9F062A] text-xs">{item.name}</td>
                    <td className="p-3 font-mono font-bold">{item.startTime} a {item.endTime}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          const next = shifts.filter(s => s.id !== item.id);
                          saveDb("shifts", next, setShifts);
                        }}
                        className="text-red-650 hover:text-red-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: SCHEDULES / HORARIOS */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-[#9F062A] uppercase tracking-wider border-b pb-2">Registrar Horario de Clase</h3>
            
            {scheduleErrorMessage && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 font-bold space-y-1">
                <p>⚠️ {scheduleErrorMessage}</p>
                <p className="text-[10px] font-medium text-slate-500">
                  Por favor seleccione un rango diferente o revise los horarios registrados a la derecha.
                </p>
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
                  setScheduleErrorMessage(`Ya existe un bloque de clases registrado para el día ${formSchedule.dayOfWeek} en el rango horario solicitado (${finalStart} - ${finalEnd}), o se cruza con él.`);
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
              }}
              className="space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Día Académico *</label>
                <select 
                  required 
                  value={formSchedule.dayOfWeek}
                  onChange={(e) => {
                    setFormSchedule({ ...formSchedule, dayOfWeek: e.target.value });
                    setScheduleErrorMessage(null);
                  }}
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                >
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Turno de Clase Coincidente *</label>
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
                  className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold"
                >
                  {shifts.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      Turno {sh.name} ({sh.startTime} - {sh.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-mono"
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
                    className="w-full mt-1 p-2 bg-slate-50 border rounded-md font-bold text-slate-800 font-mono"
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

              <Button type="submit" className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-[10px] font-black tracking-wider">
                Guardar Horario Académico
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Matriz de Horarios Habilitados</h3>
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 uppercase tracking-wider text-[9px] font-black text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3">Día Comercial</th>
                  <th className="p-3">Turno Relacionado</th>
                  <th className="p-3">Rango Horario de Clase</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {schedules.map(item => {
                  const associatedShift = shifts.find(s => s.id === item.shiftId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-black text-slate-900">{item.dayOfWeek}</td>
                      <td className="p-3">
                        {associatedShift ? (
                          <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                            Turno {associatedShift.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-450 italic">No especificado</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs text-[#9F062A] font-black">{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : item.timeSlot}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => {
                            const next = schedules.filter(s => s.id !== item.id);
                            saveDb("schedules", next, setSchedules);
                          }}
                          className="text-red-650 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
