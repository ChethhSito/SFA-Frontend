import React from "react";
import { AlertTriangle } from "lucide-react";
import { ACADEMIC_PROGRAMS } from "../../../mockData";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { ProgramId } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  processedStudents: ProcessedStudent[];
  onToggleAcademicStatus: (dni: string) => void;
  onShiftChange: (dni: string, shift: "Mañana" | "Tarde" | "Noche") => void;
  onCareerChange: (dni: string, programId: ProgramId) => void;
}

export default function MgeMatriculaTab({
  processedStudents,
  onToggleAcademicStatus,
  onShiftChange,
  onCareerChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-amber-800">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-extrabold uppercase">Reglas de Operación de Matrícula General (MGE)</p>
          <p className="font-medium mt-0.5">
            Los ingresantes admitidos ordinariamente por la oficina de admisión pueden ser activados al estado de <b>MATRICULADO</b> de forma individual. Aquí se puede asignar el turno institucional (Mañana, Tarde o Noche) y corregir la carrera técnica seleccionada.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado Matrícula</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Asignación Carrera</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Asignación de Turno</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Interruptores de Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {processedStudents.map((st) => (
                <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                    <div className="text-[10px] font-mono font-bold text-slate-500">DNI: {st.dni}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {st.academicStatus === "MATRICULADO" ? (
                      <Badge variant="success">MATRICULADO ACTIVO</Badge>
                    ) : st.paymentStatus === "Validado" ? (
                      <Badge variant="warning" className="bg-sky-100 text-sky-850 border-sky-300">PENDIENTE A MATRICULAR</Badge>
                    ) : (
                      <Badge variant="warning">SOLO ADMITIDO</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={st.programId}
                      onChange={(e) => onCareerChange(st.dni, e.target.value as ProgramId)}
                      className="p-1 px-2 border border-slate-250 bg-white font-bold rounded-lg text-slate-850 text-xs focus:outline-none"
                    >
                      {ACADEMIC_PROGRAMS.map((program) => (
                        <option key={program.id} value={program.id}>{program.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      {(["Mañana", "Tarde", "Noche"] as const).map((shiftOpt) => (
                        <button
                          key={shiftOpt}
                          onClick={() => onShiftChange(st.dni, shiftOpt)}
                          className={`px-2 py-1 text-[9px] font-black uppercase rounded transition-all cursor-pointer ${
                            st.shift === shiftOpt
                              ? "bg-[#9F062A] text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-650"
                          }`}
                        >
                          {shiftOpt}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      onClick={() => onToggleAcademicStatus(st.dni)}
                      className={`text-[9.5px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg ${
                        st.academicStatus === "MATRICULADO"
                          ? "bg-slate-100 hover:bg-red-50 text-red-650 hover:text-red-750"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {st.academicStatus === "MATRICULADO" ? "Anular Matrícula" : "Matricular Alumno"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
