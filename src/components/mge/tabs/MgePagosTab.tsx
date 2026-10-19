import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import { Enrollment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  processedStudents: ProcessedStudent[];
  enrollments: Enrollment[];
  onUpdatePaymentStatus: (dni: string, status: "Validado" | "Observado") => void;
  onRegisterOperation: (dni: string, operation: string) => void;
}

export default function MgePagosTab({ processedStudents, enrollments, onUpdatePaymentStatus, onRegisterOperation }: Props) {
  const [operations, setOperations] = useState<Record<string, string>>({});
  return (
    <div className="space-y-6">
      <div className="bg-slate-100 p-4 border border-slate-200 rounded-xl space-y-1.5">
        <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#9F062A]" />
          Auditoría Financiera de Matrículas Semestrales
        </h4>
        <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
          Los directivos verifican las operaciones de pago registradas con el extracto bancario de la cuenta institucional antes de validarlas.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Concepto de Pago</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Operación N°</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado de Validación</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Acciones Directas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {processedStudents.map((st) => {
                const enrollment = enrollments.find((item) => item.studentDni === st.dni);
                const operation = enrollment?.paymentOperation?.trim();
                const validated = st.paymentStatus === "Validado";
                const canValidate = st.enrolled && !!operation && !validated;
                return (
                <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold">DNI: {st.dni}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-700">Derecho de matrícula</div>
                    <div className="text-[10px] text-slate-500">Monto no registrado en la matrícula</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-slate-800 font-bold block">
                      {operation || "Sin operación registrada"}
                    </span>
                    {operation ? <span className="text-[9px] text-slate-500">Operación registrada para revisión</span> : st.enrolled ? (
                      <form className="mt-2 flex flex-wrap items-center gap-2" onSubmit={(event) => {
                        event.preventDefault();
                        onRegisterOperation(st.dni, operations[st.dni] || "");
                      }}>
                        <input type="text" required maxLength={100}
                          aria-label={`Número de operación de ${st.name} ${st.lastName}`}
                          placeholder="Número de operación"
                          value={operations[st.dni] || ""}
                          onChange={(event) => setOperations((previous) => ({ ...previous, [st.dni]: event.target.value }))}
                          className="w-44 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-[#9F062A]" />
                        <button type="submit" disabled={!operations[st.dni]?.trim()}
                          className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed">
                          Registrar operación
                        </button>
                      </form>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5">
                    {st.paymentStatus === "Validado" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px] uppercase">Validado</span>
                    ) : st.paymentStatus === "Observado" ? (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 font-bold text-[10px] uppercase">Observado</span>
                    ) : !st.enrolled ? (
                      <span className="text-slate-500">Sin registro de matrícula</span>
                    ) : st.paymentStatus === "No Pagado" ? (
                      <span className="text-slate-500">No pagado</span>
                    ) : st.paymentStatus === "Pagado" ? (
                      <span className="text-slate-500">Pagado, pendiente de validación</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px] uppercase">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onUpdatePaymentStatus(st.dni, "Validado")}
                        disabled={!canValidate}
                        title={!st.enrolled ? "Primero registre la matrícula" : !operation ? "Registre la operación antes de validar" : validated ? "El pago ya está validado" : "Validar la operación revisada"}
                        className="px-2.5 py-1.5 bg-emerald-600 enabled:hover:bg-emerald-700 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
                      >
                        {validated ? "Validado" : "Validar"}
                      </button>
                      <button
                        onClick={() => onUpdatePaymentStatus(st.dni, "Observado")}
                        disabled={!st.enrolled || !operation}
                        className="px-2.5 py-1.5 bg-red-700 enabled:hover:bg-red-800 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer disabled:bg-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
                      >
                        Observar
                      </button>
                    </div>
                    {st.enrolled && !operation ? <p className="mt-2 text-[10px] text-slate-600">Registra la operación antes de validar.</p> : null}
                  </td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
