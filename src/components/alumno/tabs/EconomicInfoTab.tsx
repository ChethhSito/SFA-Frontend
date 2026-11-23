import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Clock, FileText, Download, Building, ShieldCheck, ArrowRight, Printer, Eye, Receipt, X } from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { StudentPersonalData, Enrollment } from "../../../types";
import { generateVoucherSvgDataUrl } from "../../../utils/voucherGenerator";

interface EconomicInfoTabProps {
  personalData?: StudentPersonalData;
  enrollment?: Enrollment;
  studentDni?: string;
  onNavigateToEnrollment?: () => void;
}

export const EconomicInfoTab: React.FC<EconomicInfoTabProps> = ({
  personalData,
  enrollment,
  studentDni = "74859612",
  onNavigateToEnrollment
}) => {
  const [, setSync] = useState(0);

  useEffect(() => {
    const handleSync = () => setSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const currentDni = enrollment?.studentDni || personalData?.dni || studentDni;

  const isPromotedCycle2 = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle2_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2") === "true" ||
    localStorage.getItem(`sfa_student_cycle_${currentDni}`) === "2" ||
    localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
    localStorage.getItem("sfa_student_cycle") === "2"
  );

  const isCycle2Paid = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_cycle2_payment_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_payment") === "true"
  );

  const isCycle2Validated = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_cycle2_validated_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_validated_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_validated") === "true" ||
    (enrollment?.paymentStatus === "Validado" && (
      localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
      localStorage.getItem(`sfa_cycle2_payment_${currentDni}`) === "true" ||
      localStorage.getItem("sfa_cycle2_payment") === "true"
    ))
  );

  const isGraduated = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
    localStorage.getItem("sfa_student_promoted") === "true" ||
    localStorage.getItem(`sfa_student_graduated_all_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_student_graduated_all_74859612") === "true" ||
    localStorage.getItem("sfa_student_graduated_all") === "true" ||
    localStorage.getItem(`sfa_titulacion_enabled_${currentDni}`) === "true" ||
    localStorage.getItem("sfa_titulacion_enabled_74859612") === "true" ||
    localStorage.getItem(`sfa_student_status_${currentDni}`) === "Egresado"
  );

  const cycle2Op = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_operation_${currentDni}`) ||
    localStorage.getItem("sfa_cycle2_operation_74859612") ||
    localStorage.getItem("sfa_cycle2_operation") ||
    "OP-2027-02-BCO-94812"
  ) : "OP-2027-02-BCO-94812";

  const cycle2Bank = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_bank_${currentDni}`) ||
    localStorage.getItem("sfa_cycle2_bank_74859612") ||
    "Banco de la Nación — Cta. Cte. 00-000-123456"
  ) : "Banco de la Nación — Cta. Cte. 00-000-123456";

  const cycle2Date = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_date_${currentDni}`) ||
    localStorage.getItem("sfa_cycle2_date_74859612") ||
    new Date().toLocaleDateString("es-PE")
  ) : new Date().toLocaleDateString("es-PE");

  const cycle2DataUrl = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_voucher_data_${currentDni}`) ||
    localStorage.getItem("sfa_cycle2_voucher_data_74859612") ||
    localStorage.getItem("sfa_cycle2_voucher_data") ||
    ""
  ) : "";

  const cycle2FileName = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_voucher_file_${currentDni}`) ||
    localStorage.getItem("sfa_cycle2_voucher_file_74859612") ||
    localStorage.getItem("sfa_cycle2_voucher_file") ||
    "VOUCHER DE PGO.png"
  ) : "VOUCHER DE PGO.png";

  const [viewingVoucher, setViewingVoucher] = useState<{
    period: string;
    cycle: string;
    concept: string;
    amount: string;
    bank: string;
    operation: string;
    date: string;
    status: string;
    dataUrl?: string;
    fileName?: string;
  } | null>(null);

  const careerName = enrollment?.programId === "electronica" || !enrollment?.programId
    ? "Electricidad Industrial"
    : "Contabilidad";

  const studentFullName = personalData
    ? `${personalData.lastName || ""}, ${personalData.name || ""}`.trim() || "Quispe Rojas, Mateo Sebastián"
    : "Quispe Rojas, Mateo Sebastián";

  const currentDebt = isPromotedCycle2 && !isCycle2Paid ? 250.00 : 0.00;

  return (
    <PageTransition id="economic-info-tab" className="space-y-6 text-left font-sans">
      {/* Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              SERVICIOS DEL ESTUDIANTE • CONTROL FINANCIERO Y PAGOS
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Información Económica y Estado de Cuenta
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Consulta de pagos de matrícula por semestre, tasas institucionales auditadas por Tesorería/Caja y comprobantes oficiales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/40 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-400 font-extrabold block uppercase mb-0.5 tracking-wider">Estado Financiero</span>
              <span className={`text-xs font-black font-mono flex items-center gap-1.5 ${
                currentDebt > 0 ? "text-amber-300" : "text-emerald-300"
              }`}>
                {currentDebt > 0 ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pendiente S/ {currentDebt.toFixed(2)}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Al Día • Sin Deuda</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Resumen Financiero (3 tarjetas institucionales) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Régimen Económico */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#800521]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">Régimen Educativo</span>
            </div>
            <span className="text-[9.5px] font-black uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Público Licenciado
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-semibold">Carrera Técnica:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[170px]">{careerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-semibold">Pensiones Mensuales:</span>
              <span className="font-extrabold text-emerald-700 font-mono">S/ 0.00 (No Aplica)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold">Tasa de Matrícula:</span>
              <span className="font-mono font-black text-slate-900">S/ 250.00 / ciclo</span>
            </div>
          </div>
        </div>

        {/* Card 2: Deuda y Compromiso Semestre */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 border-l-4 border-l-[#800521]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#800521]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">Semestre en Curso</span>
            </div>
            <span className="text-[9.5px] font-black uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {isGraduated ? "Periodo 2029-II (Egresado)" : isPromotedCycle2 ? "Periodo 2027-II" : "Periodo 2027-I"}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-semibold">Tasa de Semestre:</span>
              <span className="font-mono font-black text-slate-900">S/ 250.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-semibold">Estado de Pago:</span>
              <span className={`font-mono font-black ${
                isGraduated ? "text-emerald-700" : currentDebt > 0 ? "text-amber-700" : isCycle2Paid && !isCycle2Validated ? "text-blue-700" : "text-emerald-700"
              }`}>
                {isGraduated ? "Cancelado" : currentDebt > 0 ? "Pendiente" : isCycle2Paid && !isCycle2Validated ? "En Auditoría" : "Cancelado"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold">Deuda Semestre:</span>
              <span className={`font-mono font-black text-sm ${isGraduated ? "text-emerald-700" : currentDebt > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                S/ {isGraduated ? "0.00" : currentDebt.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Deudas Anteriores */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">Semestres Anteriores</span>
            </div>
            <span className="text-[9.5px] font-black uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Conforme
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-semibold">Deuda Semestre 2027-I:</span>
              <span className="font-mono font-black text-emerald-700">S/ 0.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-semibold">Histórico de Adeudos:</span>
              <span className="font-mono font-black text-emerald-700">S/ 0.00</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-semibold">Total Deuda Anterior:</span>
              <span className="font-mono font-black text-sm text-emerald-700">S/ 0.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de acción si tiene pago pendiente de matrícula */}
      {currentDebt > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded font-mono">
              Derecho de Matrícula Ciclo II Pendiente
            </span>
            <h4 className="text-sm font-black text-slate-900">
              Usted tiene habilitada la matrícula para el Ciclo II por un importe de S/ 250.00.
            </h4>
            <p className="text-xs text-slate-600">
              Puede registrar su comprobante de pago o voucher bancario directamente en la pestaña de matrícula.
            </p>
          </div>
          {onNavigateToEnrollment && (
            <button
              type="button"
              onClick={onNavigateToEnrollment}
              className="bg-[#800521] hover:bg-[#66041a] text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>Ir a Matrícula de Cursos</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          )}
        </div>
      )}

      {/* Tabla 1: Historial de Pagos de Matrícula */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-3xs overflow-hidden">
        <div className="py-3 px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#800521]" />
              Historial de Pagos por Semestre Académico
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Comprobantes registrados en plataforma y conciliados ante Tesorería / Secretaría Académica.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg shadow-3xs">
            Estudiante: {currentDni}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Periodo / Concepto</th>
                <th className="py-3 px-3 text-center">Ciclo</th>
                <th className="py-3 px-3 text-right">Importe</th>
                <th className="py-3 px-3">Canal / Entidad</th>
                <th className="py-3 px-3 font-mono">N° Operación / Voucher</th>
                <th className="py-3 px-3 text-center">Fecha</th>
                <th className="py-3 px-4 text-center">Estado de Caja</th>
                <th className="py-3 px-4 text-center">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {/* Semestre 2027-I (Siempre Cancelado Oficialmente) */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-black text-slate-900 block">Derecho de Matrícula Regular</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Periodo Lectivo 2027-I</span>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                  Ciclo I
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                  S/ 250.00
                </td>
                <td className="py-3 px-3 text-slate-600 text-[11px]">
                  Banco de la Nación (Cta. Recaudadora)
                </td>
                <td className="py-3 px-3 font-mono font-extrabold text-[#800521]">
                  OP-2027-01-BCO-11842
                </td>
                <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                  15/03/2027
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Validado por Caja
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => setViewingVoucher({
                      period: "2027-I",
                      cycle: "Ciclo I",
                      concept: "Derecho de Matrícula Regular",
                      amount: "S/ 250.00",
                      bank: "Banco de la Nación (Cta. Recaudadora)",
                      operation: "OP-2027-01-BCO-11842",
                      date: "15/03/2027",
                      status: "Validado por Caja",
                      dataUrl: "/voucher_ciclo1.png",
                      fileName: "Voucher_Matricula_2027_I.png"
                    })}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#800521] border border-rose-200 font-bold text-[10.5px] transition-colors cursor-pointer shadow-3xs"
                    title="Ver comprobante oficial de pago"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#800521]" />
                    <span>Ver Voucher</span>
                  </button>
                </td>
              </tr>

              {/* Semestre 2027-II (Dinámico según estado del estudiante) */}
              {(isPromotedCycle2 || isGraduated) && (
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-black text-slate-900 block">Derecho de Matrícula Regular</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Periodo Lectivo 2027-II</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                    Ciclo II
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                    S/ 250.00
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {isCycle2Paid || isGraduated ? cycle2Bank : "Banco de la Nación / Transferencia"}
                  </td>
                  <td className="py-3 px-3 font-mono font-extrabold text-[#800521]">
                    {isCycle2Paid || isGraduated ? cycle2Op : "—"}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                    {isCycle2Paid || isGraduated ? cycle2Date : "Pendiente"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isCycle2Validated || isGraduated ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Validado por Caja
                      </span>
                    ) : isCycle2Paid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
                        <Clock className="w-3 h-3 text-blue-600" />
                        En Auditoría de Caja
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Pendiente de Pago
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isCycle2Paid || isGraduated ? (
                      <button
                        type="button"
                        onClick={() => setViewingVoucher({
                          period: "2027-II",
                          cycle: "Ciclo II",
                          concept: "Derecho de Matrícula Regular",
                          amount: "S/ 250.00",
                          bank: cycle2Bank,
                          operation: cycle2Op,
                          date: cycle2Date,
                          status: "Validado por Caja",
                          dataUrl: cycle2DataUrl || "/voucher_ciclo2.png",
                          fileName: cycle2FileName
                        })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[10.5px] transition-colors cursor-pointer shadow-3xs"
                        title="Ver comprobante registrado por el alumno"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Voucher</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              )}

              {/* Semestres III a VI (Acreditados al completar plan de estudios / egresado) */}
              {isGraduated && (
                <>
                  {/* Semestre 2028-I (Ciclo III) */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 block">Derecho de Matrícula Regular</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Periodo Lectivo 2028-I</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      Ciclo III
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      S/ 250.00
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      Banco de la Nación (Cta. Recaudadora)
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-[#800521]">
                      OP-2028-01-BCO-38291
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                      14/03/2028
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Validado por Caja
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingVoucher({
                          period: "2028-I",
                          cycle: "Ciclo III",
                          concept: "Derecho de Matrícula Regular",
                          amount: "S/ 250.00",
                          bank: "Banco de la Nación (Cta. Recaudadora)",
                          operation: "OP-2028-01-BCO-38291",
                          date: "14/03/2028",
                          status: "Validado por Caja",
                          dataUrl: generateVoucherSvgDataUrl({
                            cycle: "Ciclo III",
                            period: "2028-I",
                            op: "OP-2028-01-BCO-38291",
                            date: "14/03/2028",
                            studentName: personalData?.name ? `${personalData.lastName}, ${personalData.name}` : "QUISPE ROJAS, MATEO SEBASTIÁN",
                            dni: currentDni
                          }),
                          fileName: "Voucher_Matricula_2028_I.png"
                        })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[10.5px] transition-colors cursor-pointer shadow-3xs"
                        title="Ver comprobante oficial de pago"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Voucher</span>
                      </button>
                    </td>
                  </tr>

                  {/* Semestre 2028-II (Ciclo IV) */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 block">Derecho de Matrícula Regular</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Periodo Lectivo 2028-II</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      Ciclo IV
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      S/ 250.00
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      Banco de la Nación (Cta. Recaudadora)
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-[#800521]">
                      OP-2028-02-BCO-47209
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                      18/08/2028
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Validado por Caja
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingVoucher({
                          period: "2028-II",
                          cycle: "Ciclo IV",
                          concept: "Derecho de Matrícula Regular",
                          amount: "S/ 250.00",
                          bank: "Banco de la Nación (Cta. Recaudadora)",
                          operation: "OP-2028-02-BCO-47209",
                          date: "18/08/2028",
                          status: "Validado por Caja",
                          dataUrl: generateVoucherSvgDataUrl({
                            cycle: "Ciclo IV",
                            period: "2028-II",
                            op: "OP-2028-02-BCO-47209",
                            date: "18/08/2028",
                            studentName: personalData?.name ? `${personalData.lastName}, ${personalData.name}` : "QUISPE ROJAS, MATEO SEBASTIÁN",
                            dni: currentDni
                          }),
                          fileName: "Voucher_Matricula_2028_II.png"
                        })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[10.5px] transition-colors cursor-pointer shadow-3xs"
                        title="Ver comprobante oficial de pago"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Voucher</span>
                      </button>
                    </td>
                  </tr>

                  {/* Semestre 2029-I (Ciclo V) */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 block">Derecho de Matrícula Regular</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Periodo Lectivo 2029-I</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      Ciclo V
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      S/ 250.00
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      Banco de la Nación (Cta. Recaudadora)
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-[#800521]">
                      OP-2029-01-BCO-59182
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                      16/03/2029
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Validado por Caja
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingVoucher({
                          period: "2029-I",
                          cycle: "Ciclo V",
                          concept: "Derecho de Matrícula Regular",
                          amount: "S/ 250.00",
                          bank: "Banco de la Nación (Cta. Recaudadora)",
                          operation: "OP-2029-01-BCO-59182",
                          date: "16/03/2029",
                          status: "Validado por Caja",
                          dataUrl: generateVoucherSvgDataUrl({
                            cycle: "Ciclo V",
                            period: "2029-I",
                            op: "OP-2029-01-BCO-59182",
                            date: "16/03/2029",
                            studentName: personalData?.name ? `${personalData.lastName}, ${personalData.name}` : "QUISPE ROJAS, MATEO SEBASTIÁN",
                            dni: currentDni
                          }),
                          fileName: "Voucher_Matricula_2029_I.png"
                        })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[10.5px] transition-colors cursor-pointer shadow-3xs"
                        title="Ver comprobante oficial de pago"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Voucher</span>
                      </button>
                    </td>
                  </tr>

                  {/* Semestre 2029-II (Ciclo VI) */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-black text-slate-900 block">Derecho de Matrícula Regular</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">Periodo Lectivo 2029-II</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      Ciclo VI
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                      S/ 250.00
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      Banco de la Nación (Cta. Recaudadora)
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-[#800521]">
                      OP-2029-02-BCO-68403
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px]">
                      17/08/2029
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Validado por Caja
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setViewingVoucher({
                          period: "2029-II",
                          cycle: "Ciclo VI",
                          concept: "Derecho de Matrícula Regular",
                          amount: "S/ 250.00",
                          bank: "Banco de la Nación (Cta. Recaudadora)",
                          operation: "OP-2029-02-BCO-68403",
                          date: "17/08/2029",
                          status: "Validado por Caja",
                          dataUrl: generateVoucherSvgDataUrl({
                            cycle: "Ciclo VI",
                            period: "2029-II",
                            op: "OP-2029-02-BCO-68403",
                            date: "17/08/2029",
                            studentName: personalData?.name ? `${personalData.lastName}, ${personalData.name}` : "QUISPE ROJAS, MATEO SEBASTIÁN",
                            dni: currentDni
                          }),
                          fileName: "Voucher_Matricula_2029_II.png"
                        })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[10.5px] transition-colors cursor-pointer shadow-3xs"
                        title="Ver comprobante oficial de pago"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Ver Voucher</span>
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla 2: Trámites Institucionales y Tasas Administrativas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-3xs overflow-hidden">
        <div className="py-3 px-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              Tasas por Trámites de Secretaría y Certificaciones
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Tarifario reglamentario oficial aprobado por Resolución Directoral.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold text-[10px] uppercase">
                <th className="py-2.5 px-4">Concepto / Trámite</th>
                <th className="py-2.5 px-3">Modalidad</th>
                <th className="py-2.5 px-3 text-right">Tasa Oficial</th>
                <th className="py-2.5 px-4 text-center">Estado del Alumno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  Constancia de Matrícula Digital Oficial
                </td>
                <td className="py-3 px-3 text-slate-500 text-[11px]">
                  Emisión inmediata vía SFA Cloud
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                  S/ 0.00 (Gratuito)
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Habilitado
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  Boleta Oficial de Notas y Récord de Calificaciones
                </td>
                <td className="py-3 px-3 text-slate-500 text-[11px]">
                  Descarga en PDF con firma digital
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                  S/ 0.00 (Gratuito)
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Habilitado
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800">
                  Apertura de Expediente de Titulación y Constancia de Egresado (EFSRT)
                </td>
                <td className="py-3 px-3 text-slate-500 text-[11px]">
                  Validación de Malla Completa (120 créditos)
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                  S/ 120.00
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isGraduated
                      ? "text-emerald-800 bg-emerald-100/90 border-emerald-300"
                      : "text-slate-600 bg-slate-100 border-slate-200"
                  }`}>
                    {isGraduated ? "Habilitado" : "Fase VI Semestre"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Institucional: Visor de Voucher y Comprobante de Pago */}
      {viewingVoucher && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs font-sans animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) setViewingVoucher(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Compacto */}
            <div className="bg-[#800521] px-4 py-3 text-white flex items-center justify-between border-b-2 border-amber-500 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span className="font-black text-xs uppercase tracking-wide">
                  Comprobante: {viewingVoucher.fileName || "Voucher.png"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingVoucher(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagen Principal Limpia */}
            <div className="p-3 bg-slate-100 flex-1 overflow-y-auto flex items-center justify-center min-h-[260px]">
              <img
                src={viewingVoucher.dataUrl || (viewingVoucher.period === "2027-I" ? "/voucher_ciclo1.png" : "/voucher_ciclo2.png")}
                alt="Comprobante digital del estudiante"
                className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl border border-slate-200 shadow-md bg-white"
              />
            </div>

            {/* Footer Compacto con Datos Clave */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-600">
                  {viewingVoucher.operation}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase font-mono ${
                  viewingVoucher.status.includes("Validado")
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-blue-100 text-blue-900 border border-blue-300"
                }`}>
                  {viewingVoucher.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingVoucher(null)}
                className="px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-[#800521] hover:bg-[#66041a] text-white rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
