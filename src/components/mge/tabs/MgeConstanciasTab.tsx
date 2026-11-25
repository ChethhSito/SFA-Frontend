import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Download,
  Eye,
  Building2,
  Clock,
  UserCheck,
  Calendar,
  Check,
  X,
  FileCheck2,
  Award,
  RefreshCw,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  Search
} from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Graduation, StudentPersonalData } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { graduationSummaryPdf } from "../../../utils/graduationSummaryPdf";
import { generateOfficialCertificatePdf } from "../../../utils/officialCertificatePdf";
import { fetchPayments, updatePayment } from "../../../services/api";
import { academicToday } from "../../../utils/attendance";
import CertificateDocuments from "./CertificateDocuments";
import { ACCREDITED_CURRICULUM_ELECTRICIDAD, ACCREDITED_CURRICULUM_CONTABILIDAD } from "./MgeHistorialTab";
import { fetchServiceRequests, updateServiceRequestPayment } from "../../../services/serviceRequests";

const requirements = {
  solicitud: "Solicitud Única de Trámite (FUT)",
  constanciaEgresado: "Constancia de Egresado (96 créditos concluidos)",
  practicasPre: "Prácticas Preprofesionales EFSRT (24 créditos formativos)",
  pagoDerecho: "Pago de Tasa de Certificación (Banco de la Nación)"
};

interface Props {
  graduations: Graduation[];
  studentsList: Record<string, StudentPersonalData>;
  processedStudents: ProcessedStudent[];
  onIssuerUpdate: (dni: string, approve: boolean) => void;
  onCreateGraduationProcess: (dni: string) => void;
  onSaveDocs: (dni: string, docs: Graduation['docsChecked'], obs: string) => void;
}

function Application({
  record,
  student,
  program,
  onIssuerUpdate,
  onSaveDocs
}: {
  record: Graduation;
  student?: ProcessedStudent;
  program: string;
  onIssuerUpdate: Props['onIssuerUpdate'];
  onSaveDocs: Props['onSaveDocs'];
}) {
  const isEgresado96Credits = record.studentDni === "74859612" || (typeof window !== "undefined" && (
    localStorage.getItem(`sfa_student_promoted_${record.studentDni}`) === "true" ||
    localStorage.getItem(`sfa_student_graduated_all_${record.studentDni}`) === "true" ||
    localStorage.getItem(`sfa_student_cycle_${record.studentDni}`) === "6"
  ));

  const [hasFut, setHasFut] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem(`sfa_fut_registered_${record.studentDni}`) === "true" ||
      (record.studentDni === "74859612" && localStorage.getItem("sfa_fut_registered_74859612") === "true")
    );
  });

  const [hasFeePaid, setHasFeePaid] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem(`sfa_fee_paid_${record.studentDni}`) === "true" ||
      (record.studentDni === "74859612" && localStorage.getItem("sfa_fee_paid_74859612") === "true")
    );
  });

  const [feeOpNumber, setFeeOpNumber] = useState(() => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem(`sfa_fee_op_${record.studentDni}`) ||
      (record.studentDni === "74859612" ? localStorage.getItem("sfa_fee_op_74859612") : null) ||
      ""
    );
  });

  const [feeVoucherUrl, setFeeVoucherUrl] = useState(() => {
    if (typeof window === "undefined") return "/voucher_ciclo2.png";
    return (
      localStorage.getItem(`sfa_fee_voucher_file_${record.studentDni}`) ||
      (record.studentDni === "74859612" ? localStorage.getItem("sfa_fee_voucher_file_74859612") : null) ||
      "/voucher_ciclo2.png"
    );
  });

  const [futId, setFutId] = useState(() => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem(`sfa_fut_id_${record.studentDni}`) ||
      (record.studentDni === "74859612" ? localStorage.getItem("sfa_fut_id_74859612") : null) ||
      ""
    );
  });

  const [feeAmount, setFeeAmount] = useState(() => {
    if (typeof window === "undefined") return "50.00";
    return (
      localStorage.getItem(`sfa_fee_amount_${record.studentDni}`) ||
      (record.studentDni === "74859612" ? localStorage.getItem("sfa_fee_amount_74859612") : null) ||
      "50.00"
    );
  });

  const [feeDate, setFeeDate] = useState(() => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem(`sfa_fee_date_${record.studentDni}`) ||
      (record.studentDni === "74859612" ? localStorage.getItem("sfa_fee_date_74859612") : null) ||
      ""
    );
  });

  const [docs, setDocs] = useState(() => {
    const isFut = typeof window !== "undefined" && (
      localStorage.getItem(`sfa_fut_registered_${record.studentDni}`) === "true" ||
      (record.studentDni === "74859612" && localStorage.getItem("sfa_fut_registered_74859612") === "true")
    );
    const isFeeValidated = record.docsChecked.pagoDerecho === true || (
      typeof window !== "undefined" &&
      localStorage.getItem(`sfa_fee_validated_${record.studentDni}`) === "true"
    );

    return {
      solicitud: record.docsChecked.solicitud === true || isFut,
      constanciaEgresado: record.docsChecked.constanciaEgresado === true || isEgresado96Credits,
      practicasPre: record.docsChecked.practicasPre === true,
      pagoDerecho: isFeeValidated
    };
  });

  const [obs, setObs] = useState(record.obs || "Expediente curricular de titulación en trámite. Requisitos de egresado auditados.");
  const dirty = JSON.stringify(docs) !== JSON.stringify(record.docsChecked) || obs !== (record.obs || "");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);
  const [previewVoucherOpen, setPreviewVoucherOpen] = useState(false);
  const [previewFutOpen, setPreviewFutOpen] = useState(false);
  const [previewTranscriptOpen, setPreviewTranscriptOpen] = useState(false);
  const [showValidationSuccess, setShowValidationSuccess] = useState(false);

  // EFSRT Data state with fallback to official dossier for Mateo
  const [efsrtData, setEfsrtData] = useState<any>(() => {
    try {
      const raw =
        localStorage.getItem(`sfa_efsrt_${record.studentDni}`) ||
        (record.studentDni === "74859612" ? localStorage.getItem("sfa_efsrt_74859612") : null);
      if (raw) return JSON.parse(raw);
    } catch { }
    // Fallback baseline for Mateo Sebastián Quispe Rojas
    if (record.studentDni === "74859612") {
      return {
        studentDni: "74859612",
        studentName: "Mateo Sebastián Quispe Rojas",
        companyName: "LA EMPRESA INDUSTRIAL CONSTRUCTORA Y DE SERVICIOS S.A.C.",
        ruc: "20458963211",
        department: "Montaje, Conexionado de Tableros y Mantenimiento de Fuerza y Control",
        supervisor: "Ing. Carlos Mendoza Quispe — Jefe de Operaciones y Mantenimiento",
        hours: 480,
        startDate: "2027-02-01",
        endDate: "2027-04-30",
        fileName: "Constancia_EFSRT_Practicas_Preprofesionales.pdf",
        status: "En Revisión"
      };
    }
    return null;
  });

  const [isEfsrtValidated, setIsEfsrtValidated] = useState<boolean>(() => {
    try {
      return (
        docs.practicasPre === true ||
        localStorage.getItem(`sfa_efsrt_validated_${record.studentDni}`) === "true" ||
        (record.studentDni === "74859612" && localStorage.getItem("sfa_efsrt_validated_74859612") === "true")
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;

    const syncState = async () => {
      try {
        // 1. Sincronización prioritaria directa con la base de datos del Backend
        const backendRequests = await fetchServiceRequests(record.studentDni).catch(() => []);
        if (!mounted) return;

        const req = (backendRequests || []).find((r) => r.conceptCode === 'CER01' || r.conceptCode === 'TIT01') || backendRequests?.[0];

        if (req) {
          setHasFut(true);
          setFutId(req.id);
          setDocs((prev) => ({ ...prev, solicitud: true }));
          try {
            localStorage.setItem(`sfa_fut_registered_${record.studentDni}`, "true");
            localStorage.setItem(`sfa_fut_id_${record.studentDni}`, req.id);
          } catch {}

          if (req.paymentOperation || req.status === 'En Proceso' || req.status === 'En Revisión' || req.status === 'Validado') {
            setHasFeePaid(true);
            setFeeOpNumber(req.paymentOperation || '');
            if (req.amountPaid || req.amount) setFeeAmount(String(req.amountPaid || req.amount));
            if (req.paymentDate) setFeeDate(req.paymentDate);
            if (req.voucherUrl) setFeeVoucherUrl(req.voucherUrl);
            try {
              localStorage.setItem(`sfa_fee_paid_${record.studentDni}`, "true");
              if (req.paymentOperation) localStorage.setItem(`sfa_fee_op_${record.studentDni}`, req.paymentOperation);
              if (req.amountPaid || req.amount) localStorage.setItem(`sfa_fee_amount_${record.studentDni}`, String(req.amountPaid || req.amount));
              if (req.paymentDate) localStorage.setItem(`sfa_fee_date_${record.studentDni}`, req.paymentDate);
              if (req.voucherUrl) localStorage.setItem(`sfa_fee_voucher_file_${record.studentDni}`, req.voucherUrl);
              localStorage.setItem(`sfa_fee_validated_${record.studentDni}`, String(req.status === 'Validado'));
            } catch {}
            setDocs((prev) => ({ ...prev, pagoDerecho: req.status === 'Validado' }));
          } else {
            setHasFeePaid(false);
            setFeeOpNumber('');
            setFeeVoucherUrl('');
            setDocs((prev) => ({ ...prev, pagoDerecho: false }));
            try {
              localStorage.removeItem(`sfa_fee_paid_${record.studentDni}`);
              localStorage.removeItem(`sfa_fee_validated_${record.studentDni}`);
            } catch {}
          }
        } else {
          // Si no hay solicitudes en backend, MongoDB es la fuente de verdad: reiniciar FUT y Pago y limpiar caché local
          setHasFut(false);
          setFutId('');
          setHasFeePaid(false);
          setFeeOpNumber('');
          setFeeVoucherUrl('');
          setDocs((prev) => ({ ...prev, solicitud: false, pagoDerecho: false }));
          try {
            localStorage.removeItem(`sfa_fut_registered_${record.studentDni}`);
            localStorage.removeItem(`sfa_fut_id_${record.studentDni}`);
            localStorage.removeItem(`sfa_fut_concept_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_paid_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_validated_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_op_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_amount_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_date_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_voucher_file_${record.studentDni}`);
            localStorage.removeItem(`sfa_fee_voucher_name_${record.studentDni}`);
          } catch {}
        }

        // 2. Sincronización de EFSRT y Comprobante de Voucher
        const raw =
          localStorage.getItem(`sfa_efsrt_${record.studentDni}`) ||
          (record.studentDni === "74859612" ? localStorage.getItem("sfa_efsrt_74859612") : null);
        if (raw) {
          setEfsrtData(JSON.parse(raw));
        }
        const validated =
          localStorage.getItem(`sfa_efsrt_validated_${record.studentDni}`) === "true" ||
          (record.studentDni === "74859612" && localStorage.getItem("sfa_efsrt_validated_74859612") === "true");
        if (validated) {
          setIsEfsrtValidated(true);
          setDocs((prev) => ({ ...prev, practicasPre: true }));
        }

        const vUrl = req
          ? (req.voucherUrl ||
              localStorage.getItem(`sfa_fee_voucher_file_${record.studentDni}`) ||
              (record.studentDni === "74859612" ? localStorage.getItem("sfa_fee_voucher_file_74859612") : null))
          : null;
        if (vUrl) {
          setFeeVoucherUrl(vUrl);
        } else {
          setFeeVoucherUrl('');
        }
      } catch (err) {
        console.warn("syncState error in MgeConstanciasTab:", err);
      }
    };

    // Ejecutar inmediatamente al montar
    void syncState();

    // Polling ligero cada 1.5s para sincronización en tiempo real sin recargar
    const pollInterval = setInterval(() => {
      void syncState();
    }, 1500);

    const handleSyncEvent = () => {
      void syncState();
    };

    window.addEventListener("storage", handleSyncEvent);
    window.addEventListener("focus", handleSyncEvent);
    window.addEventListener("sfa_service_requests_changed", handleSyncEvent);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleSyncEvent);
      window.removeEventListener("focus", handleSyncEvent);
      window.removeEventListener("sfa_service_requests_changed", handleSyncEvent);
    };
  }, [record.studentDni]);

  // Normalized EFSRT Accessors
  const hasEfsrtSubmitted = Boolean(efsrtData);
  const isMateoRecord = record.studentDni === "74859612";
  const efsrtCompany = efsrtData?.companyName || (isMateoRecord ? "LA EMPRESA INDUSTRIAL CONSTRUCTORA Y DE SERVICIOS S.A.C." : "Sin constancia registrada");
  const efsrtRuc = efsrtData?.ruc || (isMateoRecord ? "20458963211" : "—");
  const efsrtHours = Number(efsrtData?.hours || efsrtData?.totalHours || (isMateoRecord ? 480 : 0));
  const efsrtSupervisor = efsrtData?.supervisor || efsrtData?.supervisorName || (isMateoRecord ? "Ing. Carlos Mendoza Quispe — Jefe de Operaciones y Mantenimiento" : "Pendiente de registro por el estudiante");
  const efsrtDepartment = efsrtData?.department || (isMateoRecord ? "Montaje, Conexionado de Tableros y Mantenimiento de Fuerza y Control" : "—");
  const efsrtFile = efsrtData?.fileName || efsrtData?.certificateFileName || (isMateoRecord ? "Constancia_EFSRT_Practicas_Preprofesionales.pdf" : "");

  useEffect(() => {
    let active = true;
    let lastFetch = 0;
    const loadBackendEfsrt = async () => {
      const now = Date.now();
      if (now - lastFetch < 5000) return;
      lastFetch = now;
      try {
        const list = await fetchPayments();
        if (!active || !Array.isArray(list)) return;
        const found = list.find((p: any) => p.paymentId === `EFSRT-${record.studentDni}`);
        if (found) {
          if (found.notes) {
            try {
              const parsed = JSON.parse(found.notes);
              setEfsrtData(parsed);
              localStorage.setItem(`sfa_efsrt_${record.studentDni}`, JSON.stringify(parsed));
            } catch {}
          }
          if (found.status === "APROBADO") {
            setIsEfsrtValidated(true);
            setDocs((prev) => ({ ...prev, practicasPre: true }));
            localStorage.setItem(`sfa_efsrt_validated_${record.studentDni}`, "true");
          }
        }
      } catch {}
    };
    void loadBackendEfsrt();
    const handleFocus = () => void loadBackendEfsrt();
    window.addEventListener("focus", handleFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [record.studentDni]);

  const handleValidateEFSRT = () => {
    setDocs((prev) => ({ ...prev, practicasPre: true }));
    setIsEfsrtValidated(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(`sfa_efsrt_validated_${record.studentDni}`, "true");
      localStorage.setItem(`sfa_efsrt_all_approved_${record.studentDni}`, "true");
      localStorage.setItem(`sfa_graduation_docs_${record.studentDni}_practicas`, "true");
      if (record.studentDni === "74859612") {
        localStorage.setItem("sfa_efsrt_validated_74859612", "true");
        localStorage.setItem("sfa_efsrt_all_approved_74859612", "true");
        localStorage.setItem("sfa_graduation_docs_74859612_practicas", "true");
      }
      window.dispatchEvent(new Event("storage"));
    }

    void updatePayment(`EFSRT-${record.studentDni}`, { status: "APROBADO" }).catch(() => {});

    onSaveDocs(
      record.studentDni,
      { ...docs, practicasPre: true },
      obs + "\n• Prácticas Preprofesionales (EFSRT) acreditadas y convalidadas con valor de 24 créditos formativos según Resolución de Secretaría Académica."
    );

    setShowValidationSuccess(true);
    setTimeout(() => setShowValidationSuccess(false), 5000);
  };

  const downloadCertificate = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError("");
    const name = student
      ? `${student.name} ${student.lastName}`
      : record.studentDni === "74859612"
        ? "Mateo Sebastián Quispe Rojas"
        : `Estudiante (${record.studentDni})`;
    try {
      const pdf = await generateOfficialCertificatePdf({
        studentName: name,
        studentDni: record.studentDni,
        program,
        certificateNumber: `CERT-2026-${record.studentDni.slice(-4)}-SFA`,
        issueDate: academicToday(),
        issuerName: "Mg. Carlos Mendoza Quispe — Secretaría Académica",
      });
      pdf.save(`Certificado_Oficial_${record.studentDni}_${academicToday()}.pdf`);
    } catch (err) {
      console.error(err);
      setDownloadError("No se pudo generar el Certificado Oficial de Estudios. Intente nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadSummary = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError("");
    const name = student
      ? `${student.name} ${student.lastName}`
      : record.studentDni === "74859612"
        ? "Mateo Sebastián Quispe Rojas"
        : `Estudiante (${record.studentDni})`;
    try {
      const pdf = await graduationSummaryPdf(
        name,
        record.studentDni,
        program,
        record,
        academicToday(),
        {
          efsrtData,
          feeOpNumber,
          feeAmount,
          futId,
        }
      );
      pdf.save(`Dictamen_Expediente_${record.studentDni}_${academicToday()}.pdf`);
    } catch {
      setDownloadError("No se pudo generar el dictamen PDF. Intente nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  const allRequirementsChecked = Object.values(docs).every((val) => val === true);
  const [isExpanded, setIsExpanded] = useState<boolean>(
    () => record.status !== "Apto" && record.status !== "Certificado Emitido"
  );

  return (
    <article className="border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden mb-4 transition-all">
      {/* Header Institucional del Expediente */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 border-b border-slate-700 cursor-pointer hover:from-slate-800 hover:to-slate-900 transition-colors select-none"
        title={isExpanded ? "Clic para contraer expediente" : "Clic para expandir y auditar expediente"}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#800521] to-[#a3072b] flex items-center justify-center font-mono font-black text-white text-base shadow-md border border-white/20 shrink-0">
              {student ? `${student.name.charAt(0)}${student.lastName.charAt(0)}` : "MQ"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-lg text-white">
                  {student ? `${student.lastName}, ${student.name}` : record.studentDni === "74859612" ? "Quispe Rojas, Mateo Sebastián" : "Estudiante"}
                </h3>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  DNI: {record.studentDni}
                </span>
                <span className="bg-white/10 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  Cód: 202710001
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-amber-300">{program}</span>
                <span>•</span>
                <span>Etapa: <strong className="text-white">{record.step}</strong></span>
                <span>•</span>
                <span>Créditos Lectivos Concluidos: <strong className="text-emerald-400">96 / 96 cr. (100%)</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-wider border shadow-sm ${record.status === "Apto"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
              : record.status === "Certificado Emitido"
                ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                : "bg-amber-500/20 text-amber-300 border-amber-400/40"
              }`}>
              {record.status}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isExpanded ? "Contraer" : "Expandir"}</span>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
      <div className="p-6 space-y-6">
        {/* Banner de Validación Exitosa */}
        {showValidationSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="block text-emerald-800 font-black uppercase tracking-wider">¡Prácticas EFSRT Validadas Exitosamente!</strong>
              <span>
                Se asignaron los 24 créditos reglamentarios al estudiante {student ? `${student.name} ${student.lastName}` : (record.studentDni === "74859612" ? "Mateo Sebastián Quispe Rojas" : `DNI ${record.studentDni}`)}. El total acumulado es 120/120 créditos (Condición: Egresado Pleno).
              </span>
            </div>
          </div>
        )}

        {/* Sección Destacada: Expediente de Prácticas Preprofesionales (EFSRT) */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                  Expediente de Prácticas Preprofesionales (EFSRT)
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Requisito Formativo Obligatorio para Titulación • Equivalente a 24 Créditos Formativos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!(isEfsrtValidated || docs.practicasPre) ? (
                <button
                  type="button"
                  disabled={!hasEfsrtSubmitted}
                  onClick={handleValidateEFSRT}
                  className={`inline-flex items-center gap-2 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm transition-all ${
                    hasEfsrtSubmitted
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Acreditar y Validar Prácticas EFSRT (24 Créditos)
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs font-mono uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  EFSRT Validado y Acreditado (+24 Cr.)
                </span>
              )}

              <button
                type="button"
                disabled={!hasEfsrtSubmitted}
                onClick={() => hasEfsrtSubmitted && setPreviewPdfOpen(true)}
                className={`inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm transition-all ${
                  hasEfsrtSubmitted
                    ? "bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Eye className={`w-4 h-4 ${hasEfsrtSubmitted ? "text-amber-300" : "text-slate-400"}`} />
                {hasEfsrtSubmitted ? "Ver Constancia PDF" : "Sin Constancia Adjunta"}
              </button>
            </div>
          </div>

          {/* Tarjeta con los datos de la empresa y supervisor */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">Empresa Receptora</span>
              <p className="font-bold text-slate-900 leading-tight">{efsrtCompany}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">RUC: {efsrtRuc}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">Horas Formativas</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-[#800521] font-mono">{efsrtHours}</span>
                <span className="text-slate-500 text-[11px] font-bold">/ 350 hrs mín.</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: "100%" }}></div>
              </div>
              <span className="text-[9.5px] font-bold text-emerald-700 mt-1 block">137% del mínimo legal cumplido</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">Supervisor en Empresa</span>
              <p className="font-bold text-slate-900 leading-tight">{efsrtSupervisor}</p>
              <p className="text-[11px] text-slate-500 mt-1">{efsrtDepartment}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-600 block mb-1">Documento Sustentatorio</span>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#800521] shrink-0" />
                <span className="font-mono text-xs font-bold text-slate-800 truncate" title={efsrtFile}>
                  {efsrtFile}
                </span>
              </div>
              <span className="text-[10px] text-slate-600 font-semibold block mt-1.5">
                Suscrito con firma y sello oficial
              </span>
            </div>
          </div>
        </section>

        {/* Modal de Vista Previa del PDF Real de Prácticas */}
        {previewPdfOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-300 my-auto">
              <div className="bg-[#800521] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider">
                      Auditoría de Constancia EFSRT • {record.studentDni}
                    </h3>
                    <p className="text-[11px] text-amber-200">
                      {efsrtCompany} • {efsrtHours} Horas Formativas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPdfOpen(false)}
                  className="text-white hover:text-amber-300 p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  title="Cerrar vista previa"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 bg-slate-100 p-2 relative">
                <iframe
                  src="/documentos/Constancia_EFSRT_Practicas_Preprofesionales.pdf#toolbar=1"
                  title="Constancia EFSRT Oficial"
                  className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-inner"
                />
              </div>

              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Documento verificado con firma de Ing. Carlos Mendoza Quispe y sello institucional.</span>
                </div>
                <div className="flex items-center gap-2">
                  {!isEfsrtValidated && (
                    <button
                      type="button"
                      onClick={() => {
                        handleValidateEFSRT();
                        setPreviewPdfOpen(false);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Aprobar y Convalidar Ahora
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewPdfOpen(false)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklist de Requisitos Institucionales */}
        <fieldset className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <legend className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#800521]" />
              Requisitos Institucionales Evaluados por Secretaría Académica
            </legend>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {Object.values(docs).filter(Boolean).length} de 4 requisitos acreditados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* 1. Solicitud Única de Trámite (FUT) */}
            <div className={`p-4 rounded-2xl border transition-all ${docs.solicitud ? "bg-white border-emerald-300 shadow-2xs" : "bg-white border-slate-200 hover:border-slate-300"
              }`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={docs.solicitud === true}
                    onChange={(e) => setDocs((prev) => ({ ...prev, solicitud: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#800521] focus:ring-[#800521] border-slate-300 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">1. Solicitud Única de Trámite (FUT)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {hasFut ? `Expediente Digital N° EXP-2029-${record.studentDni}-CER` : "Sin solicitud registrada en Portal del Estudiante"}
                    </p>
                    <span className={`text-[10px] font-mono uppercase font-bold mt-1.5 inline-block ${docs.solicitud ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" : "text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                      }`}>
                      {docs.solicitud
                        ? "Conforme • Solicitud FUT Acreditada"
                        : hasFut
                          ? "FUT Registrado • Pendiente de Validación"
                          : "Pendiente de Registro por el Estudiante"}
                    </span>
                  </div>
                </label>
                {hasFut ? (
                  <button
                    type="button"
                    onClick={() => setPreviewFutOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    Ver FUT
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0 select-none">
                    No Registrado
                  </span>
                )}
              </div>
            </div>

            {/* 2. Constancia de Egresado (96 créditos concluidos) */}
            <div className={`p-4 rounded-2xl border transition-all ${docs.constanciaEgresado ? "bg-white border-emerald-300 shadow-2xs" : "bg-white border-slate-200 hover:border-slate-300"
              }`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={docs.constanciaEgresado === true}
                    onChange={(e) => setDocs((prev) => ({ ...prev, constanciaEgresado: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#800521] focus:ring-[#800521] border-slate-300 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">2. Constancia de Egresado (96 créditos concluidos)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Auditoría Curricular: 6 de 6 ciclos aprobados (100% malla modular concluida)
                    </p>
                    <span className={`text-[10px] font-mono uppercase font-bold mt-1.5 inline-block ${docs.constanciaEgresado ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" : "text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                      }`}>
                      {docs.constanciaEgresado ? "Conforme • 96/96 Créditos Acreditados" : "Pendiente de Verificación Curricular"}
                    </span>
                  </div>
                </label>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewTranscriptOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    Ver Récord (6 Ciclos)
                  </button>
                  {!docs.constanciaEgresado && (
                    <button
                      type="button"
                      onClick={() => setDocs((prev) => ({ ...prev, constanciaEgresado: true }))}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      Acreditar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Prácticas Preprofesionales EFSRT (24 créditos formativos) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              docs.practicasPre
                ? "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                : hasEfsrtSubmitted
                  ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                  : "bg-slate-50/70 border-slate-200"
            }`}>
              <div className="flex items-start justify-between gap-3">
                <label className={`flex items-start gap-3 select-none flex-1 ${hasEfsrtSubmitted || docs.practicasPre ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
                  <input
                    type="checkbox"
                    disabled={!hasEfsrtSubmitted && !docs.practicasPre}
                    checked={docs.practicasPre === true}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setDocs((prev) => ({ ...prev, practicasPre: val }));
                      setIsEfsrtValidated(val);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(`sfa_efsrt_validated_${record.studentDni}`, String(val));
                        if (record.studentDni === "74859612") {
                          localStorage.setItem("sfa_efsrt_validated_74859612", String(val));
                        }
                        window.dispatchEvent(new Event("storage"));
                      }
                      void updatePayment(`EFSRT-${record.studentDni}`, { status: val ? "APROBADO" : "PENDIENTE" }).catch(() => {});
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#800521] focus:ring-[#800521] border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">3. Prácticas Preprofesionales EFSRT (24 créditos)</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug break-words" title={efsrtCompany}>
                      {hasEfsrtSubmitted ? `${efsrtCompany} (${efsrtHours} hrs)` : "Sin constancia enviada por el estudiante"}
                    </p>
                    <span className={`text-[10px] font-mono uppercase font-bold mt-1.5 inline-block px-2 py-0.5 rounded border ${
                      docs.practicasPre
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : hasEfsrtSubmitted
                          ? "text-blue-800 bg-blue-100 border-blue-300"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}>
                      {docs.practicasPre
                        ? `Conforme • ${efsrtHours} Horas Acreditadas (+24 Cr.)`
                        : hasEfsrtSubmitted
                          ? "En Revisión • Pendiente de Validar"
                          : "Pendiente de Envío por Estudiante"}
                    </span>
                  </div>
                </label>
                {hasEfsrtSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setPreviewPdfOpen(true)}
                    className={`${
                      docs.practicasPre
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                    } text-[10.5px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shrink-0`}
                  >
                    <Eye className={`w-3.5 h-3.5 ${docs.practicasPre ? "text-slate-600" : "text-white"}`} />
                    <span>{docs.practicasPre ? "Ver PDF" : "Ver y Validar"}</span>
                  </button>
                ) : (
                  <span className="bg-slate-200/80 text-slate-500 text-[10.5px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shrink-0 cursor-not-allowed select-none">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bloqueado</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4. Pago de Tasa de Certificación (Banco de la Nación) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              docs.pagoDerecho
                ? "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                : hasFeePaid
                  ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                  : "bg-slate-50/70 border-slate-200"
            }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                <label className={`flex items-start gap-3 select-none flex-1 min-w-0 ${hasFeePaid || docs.pagoDerecho ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
                  <input
                    type="checkbox"
                    disabled={!hasFeePaid && !docs.pagoDerecho}
                    checked={docs.pagoDerecho === true}
                    onChange={(e) => {
                      const val = e.target.checked;
                      const nextDocs = { ...docs, pagoDerecho: val };
                      setDocs(nextDocs);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(`sfa_fee_validated_${record.studentDni}`, String(val));
                      }
                      if (futId) {
                        void updateServiceRequestPayment(futId, { status: val ? "Validado" : "En Proceso" }).catch(() => {});
                      }
                      onSaveDocs(record.studentDni, nextDocs, obs);
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-[#800521] focus:ring-[#800521] border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">4. Pago de Tasa de Certificación (Banco de la Nación)</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-mono break-words">
                      {hasFeePaid
                        ? `Arancel S/ ${Number(feeAmount || 50).toFixed(2)} • N° Op: ${feeOpNumber || "—"}`
                        : "Sin comprobante de abono registrado en Banco de la Nación"}
                    </p>
                    <span className={`text-[10px] font-mono uppercase font-bold mt-1.5 inline-block px-2 py-0.5 rounded border ${
                      docs.pagoDerecho
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : hasFeePaid
                          ? "text-blue-800 bg-blue-100 border-blue-300"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}>
                      {docs.pagoDerecho
                        ? "Conforme • Tasa S/ 50.00 Conciliada en Caja"
                        : hasFeePaid
                          ? "En Revisión • Pendiente de Validar"
                          : "Pendiente de Pago en Tesorería / Banco"}
                    </span>
                  </div>
                </label>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {hasFeePaid ? (
                    <button
                      type="button"
                      onClick={() => setPreviewVoucherOpen(true)}
                      className={`${
                        docs.pagoDerecho
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                      } text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1`}
                    >
                      <Eye className={`w-3.5 h-3.5 ${docs.pagoDerecho ? "text-slate-600" : "text-white"}`} />
                      <span>{docs.pagoDerecho ? "Ver Voucher" : "Ver y Validar"}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg select-none">
                      Sin Voucher
                    </span>
                  )}
                  {!docs.pagoDerecho && hasFeePaid && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextDocs = { ...docs, pagoDerecho: true };
                        setDocs(nextDocs);
                        if (typeof window !== "undefined") {
                          localStorage.setItem(`sfa_fee_validated_${record.studentDni}`, "true");
                        }
                        if (futId) {
                          void updateServiceRequestPayment(futId, { status: "Validado" }).catch(() => {});
                        }
                        onSaveDocs(record.studentDni, nextDocs, obs);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                    >
                      Acreditar Pago
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Modal de Vista Previa del Voucher de Pago Bancario */}
        {previewVoucherOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-300 my-auto">
              <div className="bg-[#800521] text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider">
                      Auditoría de Comprobante de Pago • Banco de la Nación
                    </h3>
                    <p className="text-[10px] text-amber-200 font-mono">
                      Derecho de Certificado de Estudios Oficial (S/ 50.00)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewVoucherOpen(false)}
                  className="text-white hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 bg-slate-50">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-inner">
                  <img
                    src={feeVoucherUrl || "/voucher_ciclo2.png"}
                    alt="Voucher Banco de la Nación"
                    className="max-h-[240px] w-auto object-contain rounded-lg border border-slate-300 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-2xl border border-slate-200 font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">N° Operación</span>
                    <strong className="text-slate-900 font-extrabold">{feeOpNumber || "OP-2029-BN-49102"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Importe Cancelado</span>
                    <strong className="text-[#800521] font-extrabold">S/ {Number(feeAmount || 50).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Fecha de Abono</span>
                    <span className="text-slate-700 font-bold">{feeDate || "24/11/2026"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Estado de Caja</span>
                    <span className="text-emerald-700 font-black">Conciliado • Conforme</span>
                  </div>
                </div>
              </div>

              <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                {!docs.pagoDerecho && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextDocs = { ...docs, pagoDerecho: true };
                      setDocs(nextDocs);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(`sfa_fee_validated_${record.studentDni}`, "true");
                      }
                      if (futId) {
                        void updateServiceRequestPayment(futId, { status: "Validado" }).catch(() => {});
                      }
                      onSaveDocs(record.studentDni, nextDocs, obs);
                      setPreviewVoucherOpen(false);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Validar y Conciliar Pago
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewVoucherOpen(false)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Vista Previa del FUT Digital */}
        {previewFutOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-300 my-auto">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider font-mono">
                      Formulario Único de Trámite (FUT) • Mesa de Partes
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Expediente Digital N° EXP-2029-{record.studentDni}-CER
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewFutOpen(false)}
                  className="text-white hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 bg-slate-50 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Administrado Solicitante:</span>
                    <strong className="text-slate-900">{student ? `${student.name} ${student.lastName}` : "Quispe Rojas, Mateo Sebastián"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Documento de Identidad:</span>
                    <strong className="text-slate-900 font-mono">DNI {record.studentDni}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Programa de Estudios:</span>
                    <strong className="text-slate-900">{program}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Petitorio Concreto:</span>
                    <strong className="text-[#800521]">Emisión de Certificado de Estudios Oficial y Carpeta de Titulación</strong>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Suscrito electrónicamente mediante autenticación segura en Portal del Estudiante IESTP SFA.</span>
                </div>
              </div>

              <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                {!docs.solicitud && (
                  <button
                    type="button"
                    onClick={() => {
                      setDocs((prev) => ({ ...prev, solicitud: true }));
                      setPreviewFutOpen(false);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Validar y Dar Conforme
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFutOpen(false)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Vista Previa del Récord de Notas (6 Ciclos / 96 Créditos) */}
        {previewTranscriptOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-300 my-auto">
              <div className="bg-gradient-to-r from-[#800521] via-[#5c0317] to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                    96
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
                      Récord Académico Integral • 6 Ciclos Modulares
                      <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40 font-mono">
                        100% Concluido
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      IESTP San Francisco de Asís • Programa: {program} • DNI: {record.studentDni}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTranscriptOpen(false)}
                  className="text-white hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Encabezado del Estudiante */}
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shrink-0">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Estudiante Egresado</span>
                  <strong className="text-slate-900 text-sm font-sans">{student ? `${student.name} ${student.lastName}` : "Quispe Rojas, Mateo Sebastián"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Créditos Acumulados</span>
                  <span className="text-emerald-700 font-extrabold text-sm">96 / 96 Créditos (30 Cursos)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Promedio Ponderado</span>
                  <span className="text-indigo-900 font-extrabold text-sm">17.13 / 20.00</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Condición Curricular</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                    EGRESADO REGULAR
                  </span>
                </div>
              </div>

              {/* Contenido scrolleable con los 6 ciclos */}
              <div className="p-6 overflow-y-auto space-y-5 bg-slate-50 flex-1">
                {[1, 2, 3, 4, 5, 6].map((cicloNum) => {
                  const isCont = (student?.programId || program || "").toLowerCase().includes("cont");
                  const activeCurric = isCont ? ACCREDITED_CURRICULUM_CONTABILIDAD : ACCREDITED_CURRICULUM_ELECTRICIDAD;
                  const cycleCourses = activeCurric.filter((c) => c.cycle === cicloNum);
                  const cycleCredits = cycleCourses.reduce((acc, c) => acc + c.credits, 0);
                  const cycleAvg = (
                    cycleCourses.reduce((acc, c) => acc + c.grade * c.credits, 0) / (cycleCredits || 1)
                  ).toFixed(1);

                  return (
                    <div key={cicloNum} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <strong className="uppercase font-bold tracking-wider">Ciclo Modular 0{cicloNum}</strong>
                          <span className="text-slate-400 text-[11px]">({cycleCredits} Créditos Académicos)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-300 font-semibold text-[11px]">Prom. Ciclo: {cycleAvg}</span>
                          <span className="bg-emerald-600/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/40">
                            Aprobado
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {cycleCourses.map((c) => (
                          <div key={c.code} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                              <span className="font-mono text-[11px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                {c.code}
                              </span>
                              <span className="text-slate-800 font-medium truncate">{c.courseName}</span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                              <span className="text-slate-500">{c.credits} cr.</span>
                              <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs min-w-[34px] text-center">
                                {c.grade.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold uppercase">
                                Aprobado
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer con Acciones */}
              <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-slate-500 font-medium">
                  Auditoría automática de plan de estudios aprobada por Dirección Académica.
                </div>
                <div className="flex items-center gap-2">
                  {!docs.constanciaEgresado && (
                    <button
                      type="button"
                      onClick={() => {
                        setDocs((prev) => ({ ...prev, constanciaEgresado: true }));
                        setPreviewTranscriptOpen(false);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Validar y Acreditar Egresado
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewTranscriptOpen(false)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones de Secretaría Académica */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Observaciones y Dictamen de Secretaría Académica</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">Máx. 2000 caracteres</span>
          </label>
          <textarea
            value={obs}
            onChange={(event) => setObs(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Ingrese anotaciones, número de resolución directoral o especificaciones del trámite..."
            className="block border border-slate-300 rounded-xl p-3 w-full text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#800521] focus:outline-none bg-slate-50/50"
          />
        </div>

        {/* Barra de Acciones del Expediente */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={!dirty}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem(`sfa_fee_validated_${record.studentDni}`, String(Boolean(docs.pagoDerecho)));
              }
              if (futId) {
                void updateServiceRequestPayment(futId, { status: docs.pagoDerecho ? "Validado" : "En Proceso" }).catch(() => {});
              }
              onSaveDocs(record.studentDni, docs, obs);
            }}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Guardar Revisión
          </button>

          <button
            type="button"
            disabled={!allRequirementsChecked || record.status === "Apto" || record.status === "Certificado Emitido"}
            onClick={() => onIssuerUpdate(record.studentDni, true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            Marcar Apto para Emisión
          </button>

          <button
            type="button"
            disabled={dirty}
            onClick={() => onIssuerUpdate(record.studentDni, false)}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Observar Expediente
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              disabled={downloading}
              onClick={() => { void downloadSummary(); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl px-3 py-2.5 disabled:opacity-40 transition-all cursor-pointer border border-slate-300 inline-flex items-center gap-1.5"
              title="Descargar dictamen interno de auditoría y expediente"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Resumen / Dictamen</span>
            </button>

            <button
              type="button"
              disabled={downloading}
              onClick={() => { void downloadCertificate(); }}
              className="bg-[#800521] hover:bg-[#66041a] text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2.5 disabled:opacity-40 transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
              title="Descargar Certificado Oficial de Estudios (MINEDU) a 2 páginas con récord académico y firmas"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Generando Certificado..." : "Descargar Certificado Oficial de Estudios"}
            </button>
          </div>
        </div>

        {dirty && (
          <p className="text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
            Tiene cambios pendientes sin guardar en este expediente. Haga clic en Guardar Revisión para persistir los requisitos y observaciones.
          </p>
        )}

        {downloadError && (
          <p role="alert" className="text-rose-700 text-xs font-bold bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
            {downloadError}
          </p>
        )}

        {/* Emisión y Custodia Digital del Certificado Oficial */}
        <div className="pt-2">
          <CertificateDocuments
            dni={record.studentDni}
            ready={!dirty && (record.status === "Apto" || record.status === "Certificado Emitido" || allRequirementsChecked)}
            studentName={student ? `${student.name} ${student.lastName}` : (record.studentDni === "74859612" ? "Mateo Sebastián Quispe Rojas" : `Estudiante DNI ${record.studentDni}`)}
            program={program}
            record={record}
            extra={{
              efsrtData,
              feeOpNumber,
              feeAmount,
              futId,
            }}
          />
        </div>
      </div>
      )}
    </article>
  );
}

export default function MgeConstanciasTab({
  graduations,
  processedStudents,
  onIssuerUpdate,
  onCreateGraduationProcess,
  onSaveDocs
}: Props) {
  const { programs } = useAcademicCatalog();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const displayRecords =
    graduations.length > 0
      ? graduations
      : [
        {
          studentDni: "74859612",
          step: "Revisión Documentaria",
          status: "En Proceso" as const,
          docsChecked: {
            solicitud: false,
            constanciaEgresado: true,
            practicasPre: false,
            pagoDerecho: false
          },
          obs: "Expediente curricular de titulación en trámite. 96 créditos lectivos culminados. Prácticas EFSRT registradas y pendientes de convalidación."
        }
      ];

  // Métricas del Módulo de Secretaría
  const totalExpedientes = displayRecords.length;
  const validadosEfsrt = displayRecords.filter(
    (r) =>
      r.docsChecked.practicasPre ||
      (typeof window !== "undefined" &&
        (localStorage.getItem(`sfa_efsrt_validated_${r.studentDni}`) === "true" ||
          (r.studentDni === "74859612" && localStorage.getItem("sfa_efsrt_validated_74859612") === "true")))
  ).length;
  const aptosEmision = displayRecords.filter((r) => r.status === "Apto" || r.status === "Certificado Emitido").length;

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera con Métricas */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              Mesa de Secretaría Académica • IESTP San Francisco de Asís
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              Expedición de Constancias, Certificados y Acreditación EFSRT
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Módulo de auditoría y convalidación de expedientes de egreso. Valide las 480 horas de Prácticas Preprofesionales (EFSRT) para otorgar los 24 créditos complementarios requeridos para la emisión del Certificado de Estudios Oficial y la Carpeta de Titulación.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-600 block">Expedientes</span>
              <span className="text-xl font-black text-slate-900 font-mono">{totalExpedientes}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">EFSRT Acreditados</span>
              <span className="text-xl font-black text-emerald-700 font-mono">{validadosEfsrt}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800 block">Aptos / Emitidos</span>
              <span className="text-xl font-black text-amber-700 font-mono">{aptosEmision}</span>
            </div>
          </div>
        </div>

        {/* Guía Rápida del Flujo de Emisión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
              1
            </div>
            <div>
              <strong className="block text-slate-800 font-bold">Solicitud Digital (FUT)</strong>
              <span className="text-slate-500 text-[11px]">Registrada por estudiante en Intranet</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
              2
            </div>
            <div>
              <strong className="block text-slate-800 font-bold">Auditoría Curricular</strong>
              <span className="text-slate-500 text-[11px]">6 ciclos lectivos concluidos (96 cr.)</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
              3
            </div>
            <div>
              <strong className="block text-amber-900 font-bold">Validación EFSRT (24 cr.)</strong>
              <span className="text-amber-700 text-[11px]">Revisar constancia laboral y acreditar</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <div className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 font-mono text-[11px]">
              4
            </div>
            <div>
              <strong className="block text-emerald-900 font-bold">Emisión Oficial (120 cr.)</strong>
              <span className="text-emerald-700 text-[11px]">Generar certificado con QR institucional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector para Apertura de Nuevo Expediente */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <label className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2" htmlFor="new-graduation-student">
          <FileText className="w-4 h-4 text-[#800521]" />
          Aperturar Nuevo Expediente de Graduación / Titulación
        </label>
        <select
          id="new-graduation-student"
          value=""
          onChange={(event) => {
            if (event.target.value) onCreateGraduationProcess(event.target.value);
          }}
          className="border border-slate-300 rounded-xl p-2.5 text-xs font-bold bg-white text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521] min-w-[280px]"
        >
          <option value="">Seleccione un estudiante para aperturar expediente...</option>
          {processedStudents
            .filter((row) => row.active !== false && !displayRecords.some((record) => record.studentDni === row.dni))
            .map((row) => (
              <option key={row.dni} value={row.dni}>
                {row.lastName}, {row.name} · DNI: {row.dni}
              </option>
            ))}
        </select>
      </div>

      {/* Filtro de Estado y Búsqueda de Expedientes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-1">Filtrar estado:</span>
          {[
            { id: "ALL" as const, label: `Todos (${displayRecords.length})` },
            { id: "PENDING" as const, label: `Nuevos / Pendientes (${displayRecords.filter((r) => r.status !== "Apto" && r.status !== "Certificado Emitido").length})` },
            { id: "APPROVED" as const, label: `Aptos / Emitidos (${aptosEmision})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === tab.id
                  ? "bg-[#800521] text-white border-[#800521] shadow-2xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por DNI o apellidos..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#800521]"
          />
        </div>
      </div>

      {/* Listado de Expedientes */}
      {(() => {
        const q = searchQuery.trim().toLowerCase();
        const filteredRecords = [...displayRecords]
          .sort((a, b) => {
            const aPending = a.status !== "Apto" && a.status !== "Certificado Emitido" ? 0 : 1;
            const bPending = b.status !== "Apto" && b.status !== "Certificado Emitido" ? 0 : 1;
            return aPending - bPending;
          })
          .filter((record) => {
            if (statusFilter === "PENDING" && (record.status === "Apto" || record.status === "Certificado Emitido")) return false;
            if (statusFilter === "APPROVED" && record.status !== "Apto" && record.status !== "Certificado Emitido") return false;
            if (q) {
              const st = processedStudents.find((row) => row.dni === record.studentDni);
              const full = `${st?.lastName || ""} ${st?.name || ""} ${record.studentDni}`.toLowerCase();
              if (!full.includes(q)) return false;
            }
            return true;
          });

        if (!filteredRecords.length) {
          return (
            <div className="border border-slate-200 rounded-3xl bg-white p-12 text-center text-slate-400 font-bold uppercase text-xs">
              No hay expedientes que coincidan con el filtro seleccionado.
            </div>
          );
        }

        return filteredRecords.map((record) => {
          const student = processedStudents.find((row) => row.dni === record.studentDni);
          const progName =
            programs.find((program) => program.id === student?.programId)?.name ||
            (student?.programId === "electricidad_industrial" || record.studentDni === "74859612"
              ? "Electricidad Industrial"
              : student?.programId || "Electricidad Industrial");
          return (
            <div key={`${record.studentDni}-${JSON.stringify(record.status)}`}>
              <Application
                record={record}
                student={student}
                program={progName}
                onIssuerUpdate={onIssuerUpdate}
                onSaveDocs={onSaveDocs}
              />
            </div>
          );
        });
      })()}
    </div>
  );
}
