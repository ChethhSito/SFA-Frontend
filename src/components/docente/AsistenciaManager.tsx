import React, { useState, useEffect } from "react";
import { Users, Save, CheckCircle, AlertCircle, Clock, Calendar } from "lucide-react";
import { AttendanceRecord } from "@/types";
import { ROSTER, StudentRosterItem } from "./DocenteTypes";
import Button from "../ui-custom/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import PageHeader from "../ui-custom/PageHeader";

interface AsistenciaManagerProps {
  courseId: string;
  week: number;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (updated: AttendanceRecord[]) => void;
}

type AttendanceStatus = "Presente" | "Tardanza" | "Falta" | "Justificado";

export default function AsistenciaManager({
  courseId,
  week,
  attendanceRecords,
  onUpdateAttendance,
}: AsistenciaManagerProps) {
  // Session type state: "Teoria" or "Laboratorio"
  const [sessionType, setSessionType] = useState<"Teoria" | "Laboratorio" >("Teoria");
  
  // Local state for temporary attendance editing before saving
  const [selectedStatus, setSelectedStatus] = useState<{ [studentDni: string]: AttendanceStatus }>({});
  
  const recordId = `att-${courseId}-w${week}-${sessionType.toLowerCase()}`;
  
  // Find if record already exists in global attendance array
  const existingRecord = attendanceRecords.find((r) => r.id === recordId || (r.courseId === courseId && r.id === recordId));

  // Dynamic Session Details based on course and week
  const getSessionDetails = (cId: string, wk: number, sType: "Teoria" | "Laboratorio") => {
    // Start date is 06/04/2026 (April 6th, 2026)
    const baseYear = 2026;
    const baseMonth = 3; // April (0-indexed)
    // Theory on Mondays (e.g., April 6th), Lab on Wednesdays (e.g. April 8th)
    const baseDay = sType === "Teoria" ? 6 : 8;
    
    const dateObj = new Date(baseYear, baseMonth, baseDay + (wk - 1) * 7);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    
    let startHour = "08:00 AM";
    let endHour = "10:00 AM";
    if (sType === "Laboratorio") {
      startHour = "02:00 PM";
      endHour = "04:00 PM";
    }
    
    let aulaLab = "Aula Regular B-105";
    if (cId.includes("elec") || cId.includes("EE")) {
      aulaLab = sType === "Teoria" ? "Aula B-201" : "Lab. Automatización I";
    } else if (cId.includes("cont") || cId.includes("CF")) {
      aulaLab = "Aula 101 - Contabilidad";
    } else {
      aulaLab = sType === "Teoria" ? "Aula Regular B-105" : "Laboratorio C-3";
    }
    
    return {
      fecha: dateStr,
      horaInicio: startHour,
      horaFin: endHour,
      aula: aulaLab
    };
  };

  const sessionDetails = getSessionDetails(courseId, week, sessionType);

  // Sync state whenever course, week, or session changes
  useEffect(() => {
    if (existingRecord) {
      setSelectedStatus(existingRecord.statusMap as { [studentDni: string]: AttendanceStatus });
    } else {
      // Default all to Presente
      const defaults: { [studentDni: string]: AttendanceStatus } = {};
      ROSTER.forEach((student) => {
        defaults[student.dni] = "Presente";
      });
      setSelectedStatus(defaults);
    }
  }, [courseId, week, sessionType, existingRecord]);

  // registration status
  const isRegisteredInDb = attendanceRecords.some(r => r.id === recordId);
  let statusOfRecord: "Sin registrar" | "Registrado" | "Modificado" = "Sin registrar";
  if (isRegisteredInDb) {
    statusOfRecord = "Registrado";
    if (existingRecord) {
      const isDifferent = Object.keys(selectedStatus).some(
        (dni) => selectedStatus[dni] !== existingRecord.statusMap[dni]
      );
      if (isDifferent) {
        statusOfRecord = "Modificado";
      }
    }
  }

  const handleStatusChange = (studentDni: string, status: AttendanceStatus) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [studentDni]: status,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: { [studentDni: string]: AttendanceStatus } = {};
    ROSTER.forEach((student) => {
      updated[student.dni] = status;
    });
    setSelectedStatus(updated);
  };

  const handleSave = () => {
    const newRecord: AttendanceRecord = {
      id: recordId,
      courseId: courseId,
      date: sessionDetails.fecha, // Save using calculated session date!
      statusMap: selectedStatus,
    };

    let updatedRecords: AttendanceRecord[];
    const index = attendanceRecords.findIndex((r) => r.id === recordId);
    
    if (index !== -1) {
      updatedRecords = [...attendanceRecords];
      updatedRecords[index] = newRecord;
    } else {
      updatedRecords = [...attendanceRecords, newRecord];
    }

    onUpdateAttendance(updatedRecords);
    
    // Visual indicator of successful save
    const alertId = "asistencia-saved-alert";
    const element = document.getElementById(alertId);
    if (element) {
      element.classList.remove("hidden");
      setTimeout(() => {
        element.classList.add("hidden");
      }, 3000);
    }
  };

  return (
    <div id="asistencia-section" className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Control de Asistencia Regular`}
        subtitle="Registre la asistencia para las sesiones de clase programadas."
        icon={<Users className="w-5 h-5 text-[#8B0026]" />}
      />

      {/* Select Session Details Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-left shadow-xs">
        <div className="space-y-3">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#CFA020] font-bold uppercase tracking-widest block font-mono">Sesiones de la Asignatura</span>
            <h4 className="text-sm font-extrabold text-slate-800 uppercase">Seleccione la clase correspondiente</h4>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border w-full">
            <button
              onClick={() => setSessionType("Teoria")}
              className={`flex-1 py-1.5 px-4 rounded-md text-xs font-bold transition-all ${
                sessionType === "Teoria"
                  ? "bg-white text-[#8B0026] shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Clase Teoría
            </button>
            <button
              onClick={() => setSessionType("Laboratorio")}
              className={`flex-1 py-1.5 px-4 rounded-md text-xs font-bold transition-all ${
                sessionType === "Laboratorio"
                  ? "bg-white text-[#8B0026] shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Clase Laboratorio
            </button>
          </div>
        </div>
        
        <div className="space-y-1.5 font-sans text-xs text-slate-700 font-bold border-l border-slate-100 pl-0 md:pl-6">
          <span className="text-[10px] text-[#8B0026] font-bold uppercase tracking-widest block font-mono">Datos del Horario Académico</span>
          <p><span className="text-slate-400 font-semibold">Tipo de clase:</span> <span className="text-slate-800 uppercase">{sessionType === "Teoria" ? "Teoría" : "Laboratorio"}</span></p>
          <p><span className="text-slate-400 font-semibold">Fecha programada:</span> <span className="text-[#8B0026] font-mono">{sessionDetails.fecha}</span></p>
          <p><span className="text-slate-400 font-semibold">Rango horario:</span> <span className="text-slate-800 font-mono">{sessionDetails.horaInicio} - {sessionDetails.horaFin}</span></p>
          <p><span className="text-slate-400 font-semibold">Aula asignada:</span> <span className="text-slate-800 uppercase font-mono">{sessionDetails.aula}</span></p>
          <div className="flex items-center gap-2 pt-1 font-semibold text-xs">
            <span className="text-slate-400">Estado de registro:</span>
            {statusOfRecord === "Sin registrar" ? (
              <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-slate-100 border border-slate-205 text-slate-600 rounded-sm">
                Sin registrar
              </span>
            ) : statusOfRecord === "Registrado" ? (
              <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-sm">
                Registrado
              </span>
            ) : (
              <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-amber-50 border border-amber-250 text-amber-700 rounded-sm">
                Modificado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions Panel */}
        <Card className="lg:col-span-1 border border-slate-150 text-left">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Automatice el registro de la clase</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <Button
              onClick={() => handleMarkAll("Presente")}
              variant="secondary"
              fullWidth
              className="font-bold text-[11px] justify-start py-2.5 hover:bg-emerald-50 hover:text-emerald-700 border-dashed"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0" />
              Marcar Todos: Presente
            </Button>
            <Button
              onClick={() => handleMarkAll("Falta")}
              variant="secondary"
              fullWidth
              className="font-bold text-[11px] justify-start py-2.5 hover:bg-rose-50 hover:text-rose-700 border-dashed"
            >
              <div className="w-2 h-2 rounded-full bg-[#8B0026] mr-2 shrink-0" />
              Marcar Todos: Falta
            </Button>
            
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-500 leading-relaxed text-[11px]">
              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>La asistencia recurrente menor a 70% puede inhabilitar al alumno del examen final.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>Solo el docente titular puede registrar y modificar estos registros de asistencia.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Attendance List Table Grid */}
        <Card className="lg:col-span-3 border border-slate-150">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Planilla de Alumnos Matriculados</CardTitle>
              <CardDescription>Establezca de manera individual la asistencia regular</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse min-w-[555px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-5">Alumno</th>
                  <th className="py-3 px-3 font-mono">DNI</th>
                  <th className="py-3 px-1 text-center font-bold">Presente</th>
                  <th className="py-3 px-1 text-center font-bold">Tardanza</th>
                  <th className="py-3 px-1 text-center font-bold">Falta</th>
                  <th className="py-3 px-1 text-center font-bold">Justificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {ROSTER.map((student) => {
                  const currentStatus = selectedStatus[student.dni] || "Presente";
                  return (
                    <tr key={student.dni} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="text-left">
                          <span className="font-extrabold text-slate-800 uppercase block">
                            {student.lastName}, {student.name}
                          </span>
                          <span className="text-[10px] text-slate-450 block font-semibold leading-none mt-1">
                            {student.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-650 font-bold">
                        {student.dni}
                      </td>
                      
                      {/* Presente Radio */}
                      <td className="py-3.5 px-1 text-center">
                        <button
                          onClick={() => handleStatusChange(student.dni, "Presente")}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto ${
                            currentStatus === "Presente"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105"
                              : "border-slate-350 bg-white hover:bg-slate-50"
                          }`}
                        >
                          {currentStatus === "Presente" && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      </td>

                      {/* Tardanza Radio */}
                      <td className="py-3.5 px-1 text-center">
                        <button
                          onClick={() => handleStatusChange(student.dni, "Tardanza")}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto ${
                            currentStatus === "Tardanza"
                              ? "bg-amber-500 border-amber-500 text-white shadow-xs scale-105"
                              : "border-slate-350 bg-white hover:bg-slate-50"
                          }`}
                        >
                          {currentStatus === "Tardanza" && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      </td>

                      {/* Falta Radio */}
                      <td className="py-3.5 px-1 text-center">
                        <button
                          onClick={() => handleStatusChange(student.dni, "Falta")}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto ${
                            currentStatus === "Falta"
                              ? "bg-[#8B0026] border-[#8B0026] text-white shadow-xs scale-105"
                              : "border-slate-350 bg-white hover:bg-slate-50"
                          }`}
                        >
                          {currentStatus === "Falta" && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      </td>

                      {/* Justificado Radio */}
                      <td className="py-3.5 px-1 text-center">
                        <button
                          onClick={() => handleStatusChange(student.dni, "Justificado")}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mx-auto ${
                            currentStatus === "Justificado"
                              ? "bg-blue-600 border-blue-600 text-white shadow-xs scale-105"
                              : "border-slate-350 bg-white hover:bg-slate-50"
                          }`}
                        >
                          {currentStatus === "Justificado" && <span className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="p-5 bg-slate-50/50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
              <div id="asistencia-saved-alert" className="hidden transition-opacity duration-300 flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-250 py-2 px-4 rounded-lg text-xs font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Asistencia académica guardada localmente de manera satisfactoria.</span>
              </div>
              <div className="flex-1" />
              <Button
                onClick={handleSave}
                variant="primary"
                className="font-black text-[11px] uppercase tracking-wider px-6 py-3 shrink-0 self-end bg-[#8B0026] text-white"
              >
                <Save className="w-4 h-4 mr-1.5" /> Guardar Asistencia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

