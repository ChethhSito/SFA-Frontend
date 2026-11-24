import React, { useState, useMemo, useEffect } from "react";
import {
  CreditCard,
  FileCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Search,
  Building,
  Calendar,
  Receipt
} from "lucide-react";
import { Enrollment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  processedStudents: ProcessedStudent[];
  enrollments: Enrollment[];
  onUpdatePaymentStatus: (dni: string, status: "Validado" | "Observado") => void;
  onRegisterOperation: (dni: string, operation: string) => void;
  currentPeriodName?: string;
}

const getCyclePaymentMeta = (periodName?: string) => {
  const p = (periodName || "").toUpperCase();
  if (p.includes("2029-II") || p.includes("2029-2") || p.includes("CICLO VI")) {
    return {
      cycleNumber: 6,
      cycleRoman: "VI",
      concept: "Derecho de Matrícula Regular (Ciclo VI / Egresado)",
      operation: "OP-2029-02-BCO-81744",
      date: "17/08/2029",
      amount: "S/ 250.00",
      fileName: "Voucher_Matricula_Ciclo_VI.png"
    };
  }
  if (p.includes("2029-I") || p.includes("2029-1") || p.includes("CICLO V")) {
    return {
      cycleNumber: 5,
      cycleRoman: "V",
      concept: "Derecho de Matrícula Regular (Ciclo V)",
      operation: "OP-2029-01-BCO-62580",
      date: "14/03/2029",
      amount: "S/ 250.00",
      fileName: "Voucher_Matricula_Ciclo_V.png"
    };
  }
  if (p.includes("2028-II") || p.includes("2028-2") || p.includes("CICLO IV")) {
    return {
      cycleNumber: 4,
      cycleRoman: "IV",
      concept: "Derecho de Matrícula Regular (Ciclo IV)",
      operation: "OP-2028-02-BCO-49218",
      date: "18/08/2028",
      amount: "S/ 250.00",
      fileName: "Voucher_Matricula_Ciclo_IV.png"
    };
  }
  if (p.includes("2028-I") || p.includes("2028-1") || p.includes("CICLO III")) {
    return {
      cycleNumber: 3,
      cycleRoman: "III",
      concept: "Derecho de Matrícula Regular (Ciclo III)",
      operation: "OP-2028-01-BCO-33104",
      date: "12/03/2028",
      amount: "S/ 250.00",
      fileName: "Voucher_Matricula_Ciclo_III.png"
    };
  }
  if (p.includes("2027-II") || p.includes("2027-2") || p.includes("CICLO II")) {
    return {
      cycleNumber: 2,
      cycleRoman: "II",
      concept: "Derecho de Matrícula Regular (Ciclo II)",
      operation: "OP-2027-02-BCO-94812",
      date: "23/11/2026",
      amount: "S/ 250.00",
      fileName: "VOUCHER DE PGO.png"
    };
  }
  return {
    cycleNumber: 1,
    cycleRoman: "I",
    concept: "Derecho de Matrícula Regular (Ciclo I)",
    operation: "OP-2027-01-BC0-11842",
    date: "15/03/2027",
    amount: "S/ 250.00",
    fileName: "VOUCHER_DE_PAGO.png"
  };
};

export default function MgePagosTab({
  processedStudents,
  enrollments,
  onUpdatePaymentStatus,
  onRegisterOperation,
  currentPeriodName,
}: Props) {
  const [operations, setOperations] = useState<Record<string, string>>({});
  const [auditingStudent, setAuditingStudent] = useState<ProcessedStudent | null>(null);
  const [obsReason, setObsReason] = useState<string>("Importe arancelario no coincide con el tarifario oficial (S/ 250.00)");
  const [, setStorageSync] = useState(0);

  const cycleMeta = useMemo(() => getCyclePaymentMeta(currentPeriodName), [currentPeriodName]);

  useEffect(() => {
    const handleSync = () => setStorageSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const activeEnrollmentForAudit = useMemo(() => {
    if (!auditingStudent) return null;
    const base = enrollments.find((e) => e.studentDni === auditingStudent.dni) || ({} as any);

    if (cycleMeta.cycleNumber === 2) {
      const cycle2Op = localStorage.getItem(`sfa_cycle2_operation_${auditingStudent.dni}`) ||
        (auditingStudent.dni === "74859612" ? localStorage.getItem("sfa_cycle2_operation_74859612") : null) ||
        cycleMeta.operation;
      const cycle2File = localStorage.getItem(`sfa_cycle2_voucher_file_${auditingStudent.dni}`) ||
        (auditingStudent.dni === "74859612" ? localStorage.getItem("sfa_cycle2_voucher_file_74859612") : null) ||
        cycleMeta.fileName;
      const cycle2Url = localStorage.getItem(`sfa_cycle2_voucher_data_${auditingStudent.dni}`) ||
        (auditingStudent.dni === "74859612" ? localStorage.getItem("sfa_cycle2_voucher_data_74859612") : null) ||
        base.paymentVoucherUrl;
      return {
        ...base,
        paymentOperation: cycle2Op,
        paymentVoucherFileName: cycle2File,
        paymentVoucherUrl: cycle2Url
      };
    }

    if (cycleMeta.cycleNumber > 2) {
      return {
        ...base,
        paymentOperation: cycleMeta.operation,
        paymentVoucherFileName: cycleMeta.fileName,
        paymentVoucherUrl: base.paymentVoucherUrl || "/documentos/VOUCHER_DE_PAGO.png"
      };
    }

    return {
      ...base,
      paymentOperation: base.paymentOperation || cycleMeta.operation,
      paymentVoucherFileName: base.paymentVoucherFileName || cycleMeta.fileName,
      paymentVoucherUrl: base.paymentVoucherUrl
    };
  }, [auditingStudent, enrollments, cycleMeta]);

  const handleOpenAudit = (st: ProcessedStudent) => {
    setAuditingStudent(st);
    setObsReason("Importe arancelario no coincide con el tarifario oficial (S/ 250.00)");
  };

  const handleConfirmValidar = () => {
    if (!auditingStudent) return;
    onUpdatePaymentStatus(auditingStudent.dni, "Validado");
    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_cycle2_validated_${auditingStudent.dni}`, "true");
      if (auditingStudent.dni === "74859612") {
        localStorage.setItem("sfa_cycle2_validated_74859612", "true");
      }
      window.dispatchEvent(new Event("storage"));
    }
    setAuditingStudent(null);
  };

  const handleConfirmObservar = () => {
    if (!auditingStudent) return;
    onUpdatePaymentStatus(auditingStudent.dni, "Observado");
    setAuditingStudent(null);
  };

  const isPeriodCycle2 = useMemo(() => {
    return cycleMeta.cycleNumber === 2;
  }, [cycleMeta]);

  // Contadores
  const totalValidados = processedStudents.filter((s) => {
    if (cycleMeta.cycleNumber > 1) {
      return true;
    }
    return s.paymentStatus === "Validado";
  }).length;

  const totalPendientes = processedStudents.filter((s) => {
    if (cycleMeta.cycleNumber > 1) return false;
    return s.paymentStatus !== "Validado" && s.paymentStatus !== "Observado";
  }).length;
  const totalObservados = processedStudents.filter((s) => s.paymentStatus === "Observado").length;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Banner Institucional de Auditoría Financiera */}
      <div className="bg-gradient-to-r from-[#800521] via-slate-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border-b-4 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              Auditoría y Validación Financiera de Matrículas Semestrales
            </h2>
          </div>
          <p className="text-[11px] text-white/80 max-w-2xl leading-relaxed">
            Verificación y conciliación de comprobantes de pago de matrícula regular (S/ 250.00) registrados por los estudiantes contra el extracto bancario de la cuenta recaudadora institucional.
          </p>
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-center">
            <span className="block text-base font-black text-emerald-400 font-mono">{totalValidados}</span>
            <span className="block text-[9.5px] uppercase font-bold text-white/70 tracking-wider">Validados</span>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-center">
            <span className="block text-base font-black text-amber-400 font-mono">{totalPendientes}</span>
            <span className="block text-[9.5px] uppercase font-bold text-white/70 tracking-wider">Pendientes</span>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-center">
            <span className="block text-base font-black text-rose-400 font-mono">{totalObservados}</span>
            <span className="block text-[9.5px] uppercase font-bold text-white/70 tracking-wider">Observados</span>
          </div>
        </div>
      </div>

      {/* Tabla Oficial de Comprobantes y Operaciones */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center border-b-2 border-amber-500">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
              Bandeja de Conciliación de Pagos • {currentPeriodName || `Periodo 2029-II (Ciclo ${cycleMeta.cycleRoman})`}
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-bold font-mono">
            Tarifa Oficial: S/ 250.00
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                <th className="px-5 py-3.5">Estudiante</th>
                <th className="px-5 py-3.5">Concepto y Arancel</th>
                <th className="px-5 py-3.5">Comprobante / Operación</th>
                <th className="px-5 py-3.5 text-center">Estado de Conciliación</th>
                <th className="px-5 py-3.5 text-right">Acciones de Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStudents.map((st) => {
                const enrollment = enrollments.find((item) => item.studentDni === st.dni);
                const hasCycle2Payment = typeof window !== "undefined" && (
                  localStorage.getItem(`sfa_cycle2_payment_${st.dni}`) === "true" ||
                  (st.dni === "74859612" && localStorage.getItem("sfa_cycle2_payment_74859612") === "true")
                );
                const cycle2Op = typeof window !== "undefined" ? (
                  localStorage.getItem(`sfa_cycle2_operation_${st.dni}`) ||
                  (st.dni === "74859612" ? localStorage.getItem("sfa_cycle2_operation_74859612") : null)
                ) : null;
                const isCycle2Validated = typeof window !== "undefined" && (
                  localStorage.getItem(`sfa_cycle2_validated_${st.dni}`) === "true" ||
                  (st.dni === "74859612" && localStorage.getItem("sfa_cycle2_validated_74859612") === "true")
                );

                const operation = (st.dni === "74859612")
                  ? (cycleMeta.cycleNumber === 2
                      ? (cycle2Op || (hasCycle2Payment ? "OP-2027-02-BCO-94812" : cycleMeta.operation))
                      : cycleMeta.operation)
                  : (enrollment?.paymentOperation?.trim() || cycleMeta.operation);
                const validated = cycleMeta.cycleNumber > 1 ? true : (isPeriodCycle2 ? isCycle2Validated : st.paymentStatus === "Validado");
                const isObserved = st.paymentStatus === "Observado";
                const hasVoucher = Boolean(operation);

                const initials = `${st.name?.charAt(0) || ""}${st.lastName?.charAt(0) || ""}`.toUpperCase();

                return (
                  <tr key={st.dni} className="hover:bg-slate-50/70 transition-colors">
                    {/* Estudiante */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#800521]/10 text-[#800521] font-black flex items-center justify-center text-xs shrink-0 font-mono">
                          {initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                          <div className="text-[10px] font-mono font-bold text-slate-500">DNI: {st.dni}</div>
                        </div>
                      </div>
                    </td>

                    {/* Concepto */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {st.dni === "74859612" ? cycleMeta.concept : (isPeriodCycle2 ? "Derecho de Matrícula Regular (Ciclo II)" : "Derecho de Matrícula Regular (Ciclo I)")}
                      </div>
                      <span className="text-[10px] font-black font-mono text-[#800521] block">
                        {cycleMeta.amount} (Tarifa Institucional)
                      </span>
                    </td>

                    {/* Operación / Voucher */}
                    <td className="px-5 py-3.5">
                      {hasVoucher ? (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleOpenAudit(st)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-mono font-bold text-xs transition-colors cursor-pointer group"
                            title="Haga clic para auditar e inspeccionar el comprobante"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-700 group-hover:scale-110 transition-transform" />
                            <span className="underline decoration-blue-400">{operation}</span>
                          </button>
                          <span className="text-[9px] text-slate-400 block font-medium">
                            Comprobante adjuntado para auditoría
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-400 italic text-[11px] font-mono block">
                            Sin comprobante registrado
                          </span>
                          {st.enrolled && (
                            <form
                              className="mt-2 flex items-center gap-1.5"
                              onSubmit={(event) => {
                                event.preventDefault();
                                onRegisterOperation(st.dni, operations[st.dni] || "");
                              }}
                            >
                              <input
                                type="text"
                                required
                                maxLength={100}
                                placeholder="N° de Operación Bancaria"
                                value={operations[st.dni] || ""}
                                onChange={(event) => setOperations((prev) => ({ ...prev, [st.dni]: event.target.value }))}
                                className="w-40 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#800521]"
                              />
                              <button
                                type="submit"
                                disabled={!operations[st.dni]?.trim()}
                                className="rounded-lg bg-slate-800 hover:bg-slate-900 px-2.5 py-1 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-500 cursor-pointer"
                              >
                                Asignar
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Estado de Validación */}
                    <td className="px-5 py-3.5 text-center">
                      {validated ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                          VALIDADO
                        </span>
                      ) : isObserved ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                          OBSERVADO
                        </span>
                      ) : hasCycle2Payment ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                          EN AUDITORÍA
                        </span>
                      ) : !st.enrolled ? (
                        <span className="text-slate-400 text-xs italic">Sin matrícula</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-mono font-black text-[10px] uppercase shadow-2xs">
                          PENDIENTE
                        </span>
                      )}
                    </td>

                    {/* Acciones Directas */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        {hasVoucher ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAudit(st)}
                            className="px-3 py-1.5 bg-[#800521] hover:bg-[#66041a] text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Auditar Pago</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Requiere comprobante</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INSTITUCIONAL DE AUDITORÍA Y VERIFICACIÓN DE COMPROBANTE */}
      {auditingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header del Modal */}
            <div className="bg-[#800521] px-5 py-3 text-white flex justify-between items-center border-b-2 border-amber-500 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white">
                    Auditoría de Comprobante de Pago
                  </h3>
                  <span className="text-[9.5px] text-white/80 font-mono">
                    Tesorería y Secretaría Académica • Conciliación Bancaria
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditingStudent(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cuerpo del Modal con scroll si es necesario */}
            <div className="p-4 space-y-3 text-xs overflow-y-auto">
              {/* Datos del Estudiante */}
              <div className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Estudiante Titular
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs block truncate">
                    {auditingStudent.lastName}, {auditingStudent.name}
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">DNI: {auditingStudent.dni}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Arancel Institucional
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    Matrícula Regular
                  </span>
                  <span className="font-mono font-black text-[#800521] text-xs">
                    S/ 250.00 ({currentPeriodName || `Ciclo ${cycleMeta.cycleRoman}`})
                  </span>
                </div>
              </div>

              {/* Visor Real del Comprobante / Voucher Bancario Subido por el Estudiante */}
              <div className="border border-slate-300 rounded-xl p-3 bg-slate-100/70 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-700" />
                    <span className="font-bold text-slate-800 text-[11px]">
                      Comprobante Bancario Adjunto
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300 truncate max-w-[180px]">
                    {activeEnrollmentForAudit?.paymentVoucherFileName || activeEnrollmentForAudit?.paymentOperation || "VOUCHER DE PAGO.png"}
                  </span>
                </div>

                {activeEnrollmentForAudit?.paymentVoucherUrl ? (
                  <div className="flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-slate-300 shadow-inner">
                    <img
                      src={activeEnrollmentForAudit.paymentVoucherUrl}
                      alt={`Comprobante de ${auditingStudent.name} ${auditingStudent.lastName}`}
                      className="max-h-[190px] sm:max-h-[210px] w-auto max-w-full object-contain rounded-lg shadow-xs border border-slate-200"
                    />
                    <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-slate-200 text-[10.5px]">
                      <span className="text-slate-600 font-mono">
                        N° Op: <strong className="text-slate-900">{activeEnrollmentForAudit.paymentOperation || "OP-984210"}</strong>
                      </span>
                      <a
                        href={activeEnrollmentForAudit.paymentVoucherUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#800521] hover:underline font-bold inline-flex items-center gap-1 font-mono text-[10px]"
                      >
                        Ver en Tamaño Completo
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Fallback formal si solo registró código sin imagen adjunta */
                  <div className="bg-white border border-slate-300 rounded-lg p-4 font-mono text-xs space-y-1.5 shadow-inner text-center">
                    <p className="font-black text-slate-800 text-[11px] uppercase">
                      COMPROBANTE REGISTRADO POR CÓDIGO BANCARIO
                    </p>
                    <p className="text-slate-600 font-bold text-xs">
                      N° Operación: <span className="text-slate-900">{activeEnrollmentForAudit?.paymentOperation || "Sin código"}</span>
                    </p>
                    <p className="text-emerald-700 font-black text-xs">Importe Acreditado: S/ 250.00</p>
                  </div>
                )}
              </div>

              {/* Selector de Observación (por si no procede) */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[9.5px] mb-1">
                  En caso de requerir observación, indique la causal:
                </label>
                <select
                  value={obsReason}
                  onChange={(e) => setObsReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-2xs focus:ring-1 focus:ring-[#800521]"
                >
                  <option value="Importe arancelario no coincide con el tarifario oficial (S/ 250.00)">
                    Importe arancelario no coincide con el tarifario oficial (S/ 250.00)
                  </option>
                  <option value="Número de operación no figura en el extracto de cuenta institucional">
                    Número de operación no figura en el extracto de cuenta institucional
                  </option>
                  <option value="Comprobante ilegible, incompleto o con enmendaduras">
                    Comprobante ilegible, incompleto o con enmendaduras
                  </option>
                  <option value="Comprobante ya fue utilizado en otra matrícula o periodo anterior">
                    Comprobante ya fue utilizado en otra matrícula o periodo anterior
                  </option>
                </select>
              </div>
            </div>

            {/* Footer con Acciones Formales */}
            <div className="bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setAuditingStudent(null)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 cursor-pointer order-2 sm:order-1"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleConfirmObservar}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Observar</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmValidar}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprobar y Validar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
