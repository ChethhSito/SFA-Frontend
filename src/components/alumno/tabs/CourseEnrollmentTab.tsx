import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Download, FileText, Printer, ShieldCheck, CreditCard, Building, X, Upload, Clock, AlertCircle, Lock, Eye, Receipt } from 'lucide-react';
import { Enrollment, MpaAcademicGroup, MpaClassroom, MpaCourse, MpaCurriculumItem, MpaPeriod, MpaProgramTask, MpaShift, Program, StudentPersonalData } from '../../../types';
import { generateMatriculaPdf, generateManualMatriculaPdf } from '../../../utils/matriculaPdf';

interface PlanningData {
  periods: MpaPeriod[];
  groups: MpaAcademicGroup[];
  curriculum: MpaCurriculumItem[];
  curriculumVersions: { id: string; name: string }[];
  courses: MpaCourse[];
  tasks: MpaProgramTask[];
  classrooms: MpaClassroom[];
  shifts: MpaShift[];
}

interface CourseEnrollmentTabProps {
  enrollment: Enrollment;
  studentGroup?: MpaAcademicGroup;
  data: PlanningData;
  onSaved?: (enrollment: Enrollment) => void;
  personalData?: StudentPersonalData;
  currentProgram?: Program;
}

export default function CourseEnrollmentTab({
  enrollment,
  studentGroup,
  data,
  personalData,
  currentProgram
}: CourseEnrollmentTabProps) {
  const currentStudentDni = enrollment.studentDni || personalData?.dni || "74859612";
  const [, setStorageSync] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`sfa_cycle2_bank_${currentStudentDni}`) ||
             localStorage.getItem("sfa_cycle2_bank_74859612") ||
             "Banco de la Nación — Cta. Cte. 00-000-123456";
    }
    return "Banco de la Nación — Cta. Cte. 00-000-123456";
  });
  const [operationNumber, setOperationNumber] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`sfa_cycle2_operation_${currentStudentDni}`) ||
             localStorage.getItem("sfa_cycle2_operation_74859612") ||
             "OP-2027-02-BCO-94812";
    }
    return "OP-2027-02-BCO-94812";
  });
  const [paymentDate, setPaymentDate] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`sfa_cycle2_date_${currentStudentDni}`) ||
             localStorage.getItem("sfa_cycle2_date_74859612") ||
             new Date().toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  });
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [voucherPreviewUrl, setVoucherPreviewUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`sfa_cycle2_voucher_data_${currentStudentDni}`) ||
             localStorage.getItem("sfa_cycle2_voucher_data_74859612") ||
             localStorage.getItem("sfa_cycle2_voucher_data") || "";
    }
    return "";
  });

  useEffect(() => {
    const handleSync = () => setStorageSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const isPromotedCycle2 = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle2_${currentStudentDni}`) === "true" ||
    localStorage.getItem(`sfa_student_promoted_cycle2_${personalData?.dni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
    localStorage.getItem(`sfa_student_cycle_${currentStudentDni}`) === "2" ||
    localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
    localStorage.getItem("sfa_student_cycle") === "2"
  );

  const isCycle2Paid = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_cycle2_payment_${currentStudentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_payment") === "true"
  );

  const isCycle2Validated = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_cycle2_validated_${currentStudentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_validated_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_validated") === "true" ||
    localStorage.getItem("sfa_cycle2_status") === "Validado" ||
    (enrollment?.paymentStatus === "Validado" && (
      localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
      localStorage.getItem(`sfa_cycle2_payment_${currentStudentDni}`) === "true" ||
      localStorage.getItem("sfa_cycle2_payment") === "true"
    ))
  );

  useEffect(() => {
    if (isCycle2Validated && typeof window !== "undefined") {
      localStorage.setItem(`sfa_cycle2_validated_${currentStudentDni}`, "true");
      localStorage.setItem("sfa_cycle2_validated_74859612", "true");
      localStorage.setItem("sfa_cycle2_validated", "true");
    }
  }, [isCycle2Validated, currentStudentDni]);

  const storedOp = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_operation_${currentStudentDni}`) ||
    localStorage.getItem("sfa_cycle2_operation_74859612") ||
    localStorage.getItem("sfa_cycle2_operation")
  ) : null;

  const storedVoucherFileName = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_voucher_file_${currentStudentDni}`) ||
    localStorage.getItem("sfa_cycle2_voucher_file_74859612") ||
    localStorage.getItem("sfa_cycle2_voucher_file") ||
    "VOUCHER DE PGO.png"
  ) : "VOUCHER DE PGO.png";

  const storedVoucherDataUrl = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_voucher_data_${currentStudentDni}`) ||
    localStorage.getItem("sfa_cycle2_voucher_data_74859612") ||
    localStorage.getItem("sfa_cycle2_voucher_data") ||
    ""
  ) : "";

  const storedBank = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_bank_${currentStudentDni}`) ||
    localStorage.getItem("sfa_cycle2_bank_74859612") ||
    "Banco de la Nación — Cta. Cte. 00-000-123456"
  ) : "Banco de la Nación — Cta. Cte. 00-000-123456";

  const storedDate = typeof window !== "undefined" ? (
    localStorage.getItem(`sfa_cycle2_date_${currentStudentDni}`) ||
    localStorage.getItem("sfa_cycle2_date_74859612") ||
    "2026-11-23"
  ) : "2026-11-23";

  const cycleNum = isPromotedCycle2 ? 2 : (studentGroup?.cycle || 1);
  const period = data.periods.find((item) => item.id === studentGroup?.periodId);
  const periodLabel = isPromotedCycle2 ? "2027-II" : (period?.name || "2027-I");
  const studentCode = personalData?.dni ? `202710001` : "202710001";
  const studentFullName = personalData
    ? `${personalData.lastName || ''}, ${personalData.name || ''}`.trim() || "Quispe Rojas, Mateo Sebastián"
    : "Quispe Rojas, Mateo Sebastián";
  const programName = currentProgram?.name || (enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad");

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOp = operationNumber.trim() || "OP-2027-02-BCO-94812";
    const fileName = voucherFile ? voucherFile.name : (storedVoucherFileName || "VOUCHER DE PGO.png");
    const finalUrl = voucherPreviewUrl || storedVoucherDataUrl;

    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_cycle2_payment_${currentStudentDni}`, "true");
      localStorage.setItem("sfa_cycle2_payment_74859612", "true");
      localStorage.setItem("sfa_cycle2_payment", "true");
      localStorage.setItem(`sfa_cycle2_operation_${currentStudentDni}`, cleanOp);
      localStorage.setItem("sfa_cycle2_operation_74859612", cleanOp);
      localStorage.setItem("sfa_cycle2_operation", cleanOp);
      localStorage.setItem(`sfa_cycle2_bank_${currentStudentDni}`, selectedBank);
      localStorage.setItem("sfa_cycle2_bank_74859612", selectedBank);
      localStorage.setItem(`sfa_cycle2_date_${currentStudentDni}`, paymentDate);
      localStorage.setItem("sfa_cycle2_date_74859612", paymentDate);
      localStorage.setItem(`sfa_cycle2_voucher_file_${currentStudentDni}`, fileName);
      localStorage.setItem("sfa_cycle2_voucher_file_74859612", fileName);
      localStorage.setItem("sfa_cycle2_voucher_file", fileName);
      if (finalUrl) {
        localStorage.setItem(`sfa_cycle2_voucher_data_${currentStudentDni}`, finalUrl);
        localStorage.setItem("sfa_cycle2_voucher_data_74859612", finalUrl);
        localStorage.setItem("sfa_cycle2_voucher_data", finalUrl);
      }
      window.dispatchEvent(new Event("storage"));
    }
    setShowPaymentModal(false);
    setPaymentNotice(`Voucher ${cleanOp} registrado exitosamente. Ha sido enviado a Caja (Pestaña 3 en Secretaría) para su validación oficial.`);
    setTimeout(() => setPaymentNotice(""), 8000);
    setStorageSync((v) => v + 1);
  };

  const handleInstantValidation = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_cycle2_validated_${currentStudentDni}`, "true");
      localStorage.setItem("sfa_cycle2_validated_74859612", "true");
      localStorage.setItem("sfa_cycle2_validated", "true");
      localStorage.setItem(`sfa_cycle2_payment_${currentStudentDni}`, "true");
      localStorage.setItem("sfa_cycle2_payment_74859612", "true");
      localStorage.setItem("sfa_cycle2_payment", "true");
      window.dispatchEvent(new Event("storage"));
    }
    setPaymentNotice("¡Matrícula formalmente aprobada y validada por Caja de Secretaría! Su condición actual es Matriculado Activo.");
    setTimeout(() => setPaymentNotice(""), 8000);
    setStorageSync((v) => v + 1);
  };

  const handleResetPayment = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`sfa_cycle2_payment_${currentStudentDni}`);
      localStorage.removeItem("sfa_cycle2_payment_74859612");
      localStorage.removeItem("sfa_cycle2_payment");
      localStorage.removeItem(`sfa_cycle2_operation_${currentStudentDni}`);
      localStorage.removeItem("sfa_cycle2_operation_74859612");
      localStorage.removeItem("sfa_cycle2_operation");
      localStorage.removeItem(`sfa_cycle2_validated_${currentStudentDni}`);
      localStorage.removeItem("sfa_cycle2_validated_74859612");
      localStorage.removeItem("sfa_cycle2_validated");
      localStorage.removeItem(`sfa_cycle2_voucher_file_${currentStudentDni}`);
      localStorage.removeItem("sfa_cycle2_voucher_file_74859612");
      localStorage.removeItem("sfa_cycle2_voucher_file");
      localStorage.removeItem(`sfa_cycle2_voucher_data_${currentStudentDni}`);
      localStorage.removeItem("sfa_cycle2_voucher_data_74859612");
      localStorage.removeItem("sfa_cycle2_voucher_data");
      window.dispatchEvent(new Event("storage"));
    }
    setPaymentNotice("Pago restablecido a estado pendiente. Puede ingresar un nuevo voucher manualmente.");
    setTimeout(() => setPaymentNotice(""), 5000);
    setStorageSync((v) => v + 1);
  };

  // Derive official registered courses for the student's active cycle
  const registeredCoursesList = useMemo(() => {
    let list: Array<{
      id: string;
      code: string;
      name: string;
      credits: number;
      cycle: number;
      type: string;
      group: string;
      sg: number;
      tsg: string;
      status: string;
    }> = [];

    const careerCourses = data.courses.filter(
      (c) => c.careerId === enrollment.programId && (Number(c.cycle ?? c.referenceCycle) === cycleNum || Number(c.referenceCycle ?? c.cycle) === cycleNum)
    );

    const computeStatus = () => {
      if (!isPromotedCycle2) return "Matriculado";
      if (isCycle2Validated) return "Matriculado";
      if (isCycle2Paid) return "En Trámite";
      return "Pendiente de Pago";
    };

    const statusVal = computeStatus();

    if (cycleNum === 2) {
      list = [
        { id: "eind-201", code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", credits: 4, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Teoría / Taller", status: statusVal },
        { id: "eind-202", code: "EIND-202", name: "Electrónica Analógica y de Potencia Básica", credits: 4, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Taller", status: statusVal },
        { id: "eind-203", code: "EIND-203", name: "Taller de Medidas e Instrumentos Eléctricos", credits: 3, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Teoría / Taller", status: statusVal },
        { id: "eind-204", code: "EIND-204", name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)", credits: 3, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Práctica", status: statusVal },
        { id: "eind-205", code: "EIND-205", name: "Inglés Técnico para Electricidad", credits: 2, cycle: 2, type: "General", group: "EI-II-A", sg: 0, tsg: "Teoría / Taller", status: statusVal },
      ];
    } else {
      list = [
        { id: "eind-101", code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, cycle: 1, type: "Obligatorio", group: studentGroup?.name || "EI-I-A", sg: 0, tsg: "Teoría / Taller", status: "Matriculado" },
        { id: "eind-102", code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, cycle: 1, type: "Obligatorio", group: studentGroup?.name || "EI-I-A", sg: 0, tsg: "Taller", status: "Matriculado" },
        { id: "eind-103", code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, cycle: 1, type: "Obligatorio", group: studentGroup?.name || "EI-I-A", sg: 0, tsg: "Práctica", status: "Matriculado" },
        { id: "eind-104", code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, cycle: 1, type: "General", group: studentGroup?.name || "EI-I-A", sg: 0, tsg: "Teoría", status: "Matriculado" },
        { id: "eind-105", code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, cycle: 1, type: "General", group: studentGroup?.name || "EI-I-A", sg: 0, tsg: "Laboratorio", status: "Matriculado" },
      ];
    }
    return list;
  }, [data.courses, enrollment.programId, studentGroup, cycleNum, isPromotedCycle2, isCycle2Paid, isCycle2Validated]);

  const totalCredits = registeredCoursesList.reduce((acc, c) => acc + c.credits, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadConstancia = async () => {
    if (isPromotedCycle2 && !isCycle2Validated) {
      setPaymentNotice("La Constancia Oficial de Matrícula se encuentra bloqueada: debe ser validada previamente por Caja de Secretaría.");
      setTimeout(() => setPaymentNotice(""), 6000);
      return;
    }
    await generateMatriculaPdf({
      studentName: personalData?.name || "Mateo Sebastián",
      studentLastName: personalData?.lastName || "Quispe Rojas",
      dni: enrollment.studentDni || personalData?.dni || "74859612",
      studentCode,
      programName,
      period: periodLabel,
      cycle: isPromotedCycle2 ? "II" : "I",
      shift: enrollment.shift || "Mañana",
      courses: registeredCoursesList.map((c) => ({
        code: c.code,
        name: c.name,
        credits: c.credits,
        cycle: c.cycle,
        type: c.type,
        group: c.group,
        tsg: c.tsg,
        status: c.status,
      })),
      totalCredits,
      totalCourses: registeredCoursesList.length,
      maxCredits: 22,
      paymentStatus: isCycle2Validated
        ? "PAGADO (S/. 250.00)"
        : isCycle2Paid
        ? `EN TRÁMITE / VOUCHER: ${storedOp || "OP-2027-02-BCO-94812"}`
        : "PENDIENTE DE PAGO",
    });
  };

  const handleDownloadManual = async () => {
    await generateManualMatriculaPdf();
  };

  return (
    <div className="space-y-4 text-left">
      {paymentNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{paymentNotice}</span>
          </div>
          <button onClick={() => setPaymentNotice("")} className="text-blue-500 hover:text-blue-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Hero Banner Borgoña Institucional Oficial */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • MATRÍCULA ACADÉMICA
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Matrícula Periodo {periodLabel}
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Código Oficial: <span className="text-amber-300 font-bold">{studentCode}</span> • Estudiante: <span className="text-white font-bold">{studentFullName}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              disabled={isPromotedCycle2 && !isCycle2Validated}
              onClick={handleDownloadConstancia}
              className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2 ${
                isPromotedCycle2 && !isCycle2Validated
                  ? "bg-slate-700/80 text-slate-300 border border-white/20 cursor-not-allowed opacity-85"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer"
              }`}
              title={
                isPromotedCycle2 && !isCycle2Validated
                  ? "Bloqueado: La constancia oficial estará disponible una vez que Caja valide su matrícula"
                  : "Descargar Constancia Oficial de Matrícula"
              }
            >
              {isPromotedCycle2 && !isCycle2Validated ? (
                <Lock className="w-4 h-4 text-amber-300" />
              ) : (
                <Download className="w-4 h-4 text-slate-950" />
              )}
              <span>
                {isPromotedCycle2 && !isCycle2Validated
                  ? "Constancia Bloqueada (En Trámite)"
                  : "Constancia PDF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner 1: Pago Requerido para Ciclo II (Sin Voucher Registrado) */}
      {isPromotedCycle2 && !isCycle2Paid && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded font-mono">
              Paso Requerido • Matrícula Ciclo II
            </span>
            <h4 className="text-sm font-black text-slate-900">
              Ciclo II Habilitado: Pago de Matrícula Pendiente (S/ 250.00)
            </h4>
            <p className="text-xs text-slate-600">
              El estudiante ha concluido el Ciclo I. Registre manualmente los datos de su comprobante de pago o transferencia bancaria para que Caja y Secretaría validen su matrícula.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="bg-[#800521] hover:bg-[#9F062A] text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-amber-300" />
            <span>Registrar Pago (S/ 250.00)</span>
          </button>
        </div>
      )}

      {/* Banner 2: Voucher Registrado en Espera de Validación de Caja */}
      {isPromotedCycle2 && isCycle2Paid && !isCycle2Validated && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded font-mono">
                  Voucher Enviado • En Espera de Validación en Caja
                </span>
                <span className="text-xs font-mono font-black text-blue-800">
                  {storedOp || "OP-2027-02-BCO-94812"}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Comprobante de S/ 250.00 remitido a Secretaría Académica y Caja
              </h4>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Su matrícula y los 5 cursos del Ciclo II están registrados formalmente en estado <strong>EN TRÁMITE</strong>. Por normativa institucional, la condición de <strong>Matriculado Activo</strong> y la descarga de la <strong>Constancia Oficial de Matrícula</strong> se desbloquean una vez que el personal de Caja valida este voucher.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-blue-200/80">
            <button
              type="button"
              onClick={() => setShowVoucherModal(true)}
              className="bg-white hover:bg-slate-50 text-blue-900 border border-blue-300 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>Ver Comprobante Enviado</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Modificar Voucher
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer ml-auto"
              title="Restablecer para ingresar otro comprobante"
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* Banner 3: Matrícula Oficialmente Validada por Caja */}
      {isPromotedCycle2 && isCycle2Validated && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded font-mono">
                Matrícula Oficializada • Periodo 2027-II
              </span>
              <span className="text-xs font-mono font-black text-emerald-800">
                {storedOp || "OP-2027-02-BCO-94812"} (Validado)
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900">
              Pago de Matrícula Auditado y Validado por Caja (S/ 250.00)
            </h4>
            <p className="text-xs text-slate-600">
              Secretaría Académica y Caja han verificado la conformidad bancaria. El estudiante se encuentra formalmente como <strong>Matriculado Activo en el Ciclo II</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              title="Restablecer para probar nuevamente el pago"
            >
              Reiniciar Estado
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout (Modelo Universidad adaptado a SFA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Columna Izquierda: Tabla de Cursos Matriculados (8 de 12 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200/90 rounded-xl shadow-3xs overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Cursos Matriculados
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre del curso</th>
                  <th className="py-2.5 px-2 text-center">Créditos</th>
                  <th className="py-2.5 px-2 text-center">Ciclo</th>
                  <th className="py-2.5 px-2 text-center">Tipo</th>
                  <th className="py-2.5 px-2 text-center">Grupo</th>
                  <th className="py-2.5 px-2 text-center">SG</th>
                  <th className="py-2.5 px-2 text-center">TSG</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {registeredCoursesList.map((c) => {
                  const isPending = c.status === "Pendiente de Pago";
                  const isProcessing = c.status === "En Trámite";
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-black text-[#800521]">
                        {c.code}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                        {c.credits}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                        {c.cycle}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">
                        {c.type}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-700">
                        {c.group}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                        {c.sg}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">
                        {c.tsg}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase border ${
                          isPending
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : isProcessing
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {isPending ? (
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                          ) : isProcessing ? (
                            <Clock className="w-3 h-3 text-blue-600" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer (Estilo Universidad: 16 | 5 | 22) */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50/70 text-center py-2.5 text-xs font-black text-slate-800 font-mono">
            <div>
              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block">Créditos Inscritos</span>
              <span className="text-sm font-black text-[#800521]">{totalCredits}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block">Total Cursos</span>
              <span className="text-sm font-black text-slate-900">{registeredCoursesList.length}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block">Máximo Permitido</span>
              <span className="text-sm font-black text-slate-600">22</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Información (4 de 12 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200/90 rounded-xl shadow-3xs p-4 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#800521]" />
              Información
            </h3>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Carrera</span>
              <span className="font-extrabold text-slate-800 uppercase text-right truncate max-w-[150px]">{programName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Currículo</span>
              <span className="font-bold text-slate-800">52</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Especialidad</span>
              <span className="font-bold text-slate-600">-</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Ampliación de Créditos</span>
              <span className="font-bold text-slate-600">No</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Máximo Ciclo</span>
              <span className="font-bold text-slate-800 font-mono">10</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Máximo de Créditos</span>
              <span className="font-bold text-slate-800 font-mono">22</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Matrícula Especial</span>
              <span className="font-bold text-slate-600">No</span>
            </div>
            <div className="flex justify-between items-start py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold mt-0.5">Estado de Pago</span>
              {isPromotedCycle2 && !isCycle2Paid ? (
                <span className="font-black text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  Pendiente (S/ 250.00)
                </span>
              ) : isPromotedCycle2 && !isCycle2Validated ? (
                <div className="text-right">
                  <span className="font-black text-blue-700 bg-blue-50 border border-blue-300 px-2 py-0.5 rounded text-[10px] font-mono block">
                    En Auditoría de Caja
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(true)}
                    className="text-[10px] text-blue-700 hover:text-blue-900 underline font-bold mt-0.5 cursor-pointer inline-flex items-center gap-0.5"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    <span>Ver voucher</span>
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono block">
                    Validado por Caja
                  </span>
                  {storedOp && (
                    <button
                      type="button"
                      onClick={() => setShowVoucherModal(true)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-bold mt-0.5 cursor-pointer inline-flex items-center gap-0.5"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>Ver voucher</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Permitir Cruces</span>
              <span className="font-bold text-slate-600">No</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleDownloadManual}
              className="text-[#800521] hover:text-[#66041a] hover:underline text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual de Matrícula (PDF)</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL OFICIAL: Registro Manual de Comprobante de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-[#800521] p-4 text-white flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide">
                    Registro de Comprobante de Pago
                  </h3>
                  <span className="text-[10px] text-amber-200 block font-mono">
                    Derecho de Matrícula Regular • Periodo 2027-II
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4 text-left">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <Building className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-black block uppercase text-[10px] tracking-wider">Tasa Institucional de Matrícula</span>
                  Monto a pagar: <strong>S/ 250.00</strong>. Una vez registrado, su comprobante quedará visible en el panel de Caja de Secretaría para su validación oficial.
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-slate-700">
                  Entidad Bancaria o Canal de Pago
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#800521]"
                >
                  <option value="Banco de la Nación — Cta. Cte. 00-000-123456">Banco de la Nación — Cta. Cte. 00-000-123456</option>
                  <option value="Banco de Crédito del Perú (BCP) — Cta. Recaudo 191-88452-SFA">Banco de Crédito del Perú (BCP) — Cta. Recaudo 191-88452-SFA</option>
                  <option value="BBVA Continental — Cta. Institucional 0011-0421-SFA">BBVA Continental — Cta. Institucional 0011-0421-SFA</option>
                  <option value="Interbank — Código de Convenio SFA 04910">Interbank — Código de Convenio SFA 04910</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase text-slate-700">
                    N° de Operación / Voucher
                  </label>
                  <input
                    type="text"
                    required
                    value={operationNumber}
                    onChange={(e) => setOperationNumber(e.target.value)}
                    placeholder="Ej. OP-2027-02-BCO-94812"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-black text-slate-900 outline-none focus:border-[#800521]"
                  />
                  <span className="text-[9.5px] text-slate-400 block">Número impreso en su comprobante físico o digital.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase text-slate-700">
                    Fecha de Operación
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#800521]"
                  />
                  <span className="text-[9.5px] text-slate-400 block">Fecha en la que realizó el depósito.</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-slate-700">
                  Comprobante Digital (Foto o PDF) <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-3 text-center transition-all bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setVoucherFile(file);
                      if (file && file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          setVoucherPreviewUrl(result);
                          if (typeof window !== "undefined") {
                            localStorage.setItem(`sfa_cycle2_voucher_data_${currentStudentDni}`, result);
                            localStorage.setItem("sfa_cycle2_voucher_data_74859612", result);
                            localStorage.setItem("sfa_cycle2_voucher_data", result);
                            localStorage.setItem(`sfa_cycle2_voucher_file_${currentStudentDni}`, file.name);
                            localStorage.setItem("sfa_cycle2_voucher_file_74859612", file.name);
                            localStorage.setItem("sfa_cycle2_voucher_file", file.name);
                            window.dispatchEvent(new Event("storage"));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="voucher-file-input"
                  />
                  <label htmlFor="voucher-file-input" className="cursor-pointer block space-y-2">
                    {voucherPreviewUrl ? (
                      <div className="space-y-2 py-1">
                        <img
                          src={voucherPreviewUrl}
                          alt="Vista previa del comprobante"
                          className="max-h-44 w-auto mx-auto object-contain rounded-lg border border-slate-300 shadow-xs"
                        />
                        <span className="text-xs font-bold text-[#800521] block">
                          {voucherFile ? voucherFile.name : (storedVoucherFileName || "VOUCHER DE PGO.png")}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Haga clic sobre la imagen para cambiar de archivo</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                        <span className="text-xs font-bold text-[#800521] block">
                          {voucherFile ? voucherFile.name : "Haga clic para adjuntar comprobante"}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Formatos permitidos: JPG, PNG o PDF (máx. 5 MB)</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-[#800521] hover:bg-[#66041a] text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Registrar y Enviar a Caja</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTITUCIONAL: Visor del Comprobante / Voucher Enviado */}
      {showVoucherModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs font-sans animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) setShowVoucherModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Compacto */}
            <div className="bg-[#800521] px-4 py-3 text-white flex items-center justify-between border-b-2 border-amber-500 shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span className="font-black text-xs uppercase tracking-wide">
                  Comprobante: {storedVoucherFileName || "Voucher.png"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagen Principal Limpia */}
            <div className="p-3 bg-slate-100 flex-1 overflow-y-auto flex items-center justify-center min-h-[260px]">
              <img
                src={storedVoucherDataUrl || voucherPreviewUrl || "/voucher_ciclo2.png"}
                alt="Comprobante digital del estudiante"
                className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl border border-slate-200 shadow-md bg-white"
              />
            </div>

            {/* Footer Compacto con Datos Clave */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-600">
                  {storedOp || "OP-2027-02-BCO-94812"}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase font-mono ${
                  isCycle2Validated
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-blue-100 text-blue-900 border border-blue-300"
                }`}>
                  {isCycle2Validated ? "Validado" : "En Auditoría"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-[#800521] hover:bg-[#66041a] text-white rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE CONFIRMACIÓN: Reiniciar Matrícula */}
      {showResetConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) setShowResetConfirmModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-5 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-sm text-slate-900">
                  ¿Reiniciar registro de matrícula?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Esta acción restablecerá el estado a <strong>Pendiente de Pago</strong> y eliminará el comprobante registrado. Deberá adjuntar o registrar un nuevo voucher para continuar el trámite.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirmModal(false);
                  handleResetPayment();
                }}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-rose-700 hover:bg-rose-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sí, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
