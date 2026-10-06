import React from "react";
import { CreditCard } from "lucide-react";
import { Enrollment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  processedStudents: ProcessedStudent[];
  enrollments: Enrollment[];
  onUpdatePaymentStatus: (dni: string, status: "Validado" | "Observado") => void;
}

export default function MgePagosTab({ processedStudents, enrollments, onUpdatePaymentStatus }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-100 p-4 border border-slate-200 rounded-xl space-y-1.5">
        <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#9F062A]" />
          Auditoría Financiera de Matrículas Semestrales
        </h4>
        <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
          Cada estudiante que se matricula en el semestre regular debe registrar su voucher de pago (S/. 250). Los directivos verifican los números de operación bancaria con el extracto bancario de la cuenta institucional del IESTP.
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
              {processedStudents.map((st) => (
                <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold">DNI: {st.dni}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-700">Derecho de Matrícula 2026-I</div>
                    <div className="text-[10px] text-emerald-600 font-black uppercase">Monto: S/. 250.00</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-slate-800 font-bold block">
                      {st.enrolled && enrollments.find((e) => e.studentDni === st.dni)?.paymentOperation
                        ? enrollments.find((e) => e.studentDni === st.dni)?.paymentOperation
                        : "OP-" + (904800 + Math.floor(Math.random() * 5000))}
                    </span>
                    <span className="text-[9px] text-slate-450 italic font-medium">Bco. de la Nación / Ventanilla</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {st.paymentStatus === "Validado" ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px] uppercase">Validado</span>
                    ) : st.paymentStatus === "Observado" ? (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 font-bold text-[10px] uppercase">Observado</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px] uppercase">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onUpdatePaymentStatus(st.dni, "Validado")}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Validar
                      </button>
                      <button
                        onClick={() => onUpdatePaymentStatus(st.dni, "Observado")}
                        className="px-2.5 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Observar
                      </button>
                    </div>
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
