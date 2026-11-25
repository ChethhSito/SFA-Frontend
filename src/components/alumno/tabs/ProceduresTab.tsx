import React, { useEffect, useState } from 'react';
import { 
  FileText, RefreshCw, Award, CheckCircle2, Clock, AlertCircle, 
  Download, ArrowRight, ShieldCheck, Building2, Send, Sparkles,
  Lock, Unlock, GraduationCap, Briefcase, FileCheck, Check, Info, AlertTriangle,
  Upload, X, Trash2, Eye
} from 'lucide-react';
import { 
  createServiceRequest, fetchServiceRequests, ServiceRequest, 
  StudentProcedureCode, submitServiceRequestVoucher, serviceRequestResultUrl,
  deleteServiceRequest, fetchServiceRequestVoucher
} from '../../../services/serviceRequests';
import { readMafState } from '../../../services/mafState';
import { fetchCertificates, fetchGraduations } from '../../../services/api';
import { generateOfficialCertificatePdf } from '../../../utils/officialCertificatePdf';
import { academicToday } from '../../../utils/attendance';
import { Pagination, usePagination } from '../../ui/Pagination';
import PageTransition from '../../ui/PageTransition';

interface ProcedureDef {
  code: StudentProcedureCode;
  title: string;
  category: string;
  amount: number;
  why: string;
  timeDays: string;
  icon: string;
  checkUnlocked: (ctx: { isGraduatedLectivo: boolean; isPracticesValidated: boolean; isEgresadoPleno: boolean; credits: number }) => {
    unlocked: boolean;
    reasonIfLocked: string;
    requirementLabel: string;
  };
}

const proceduresCatalog: ProcedureDef[] = [
  { 
    code: 'CON01', 
    title: 'Constancia de Matrícula Institucional', 
    category: 'Matrícula y Permanencia',
    amount: 20,
    why: 'Certifica la condición de estudiante regular matriculado en el semestre lectivo vigente para pasaje universitario/técnico, seguro médico y becas.',
    timeDays: '24 a 48 horas',
    icon: 'FileCheck',
    checkUnlocked: () => ({
      unlocked: true,
      reasonIfLocked: '',
      requirementLabel: 'Estudiante regular activo en el semestre'
    })
  },
  { 
    code: 'EGR01', 
    title: 'Constancia de Culminación de Estudios (Egreso Lectivo)', 
    category: 'Culminación Curricular',
    amount: 35,
    why: 'Certifica formalmente haber culminado y aprobado las 30 asignaturas de los 6 ciclos lectivos (96 créditos académicos).',
    timeDays: '48 a 72 horas',
    icon: 'Award',
    checkUnlocked: (ctx) => ({
      unlocked: ctx.isGraduatedLectivo,
      reasonIfLocked: 'Requiere haber culminado y aprobado los 6 ciclos lectivos (96 créditos).',
      requirementLabel: '6 ciclos lectivos aprobados (96 cr.)'
    })
  },
  { 
    code: 'PRA01', 
    title: 'Certificado de Prácticas Preprofesionales (EFSRT)', 
    category: 'Experiencias Formativas EFSRT',
    amount: 30,
    why: 'Acredita oficialmente el cumplimiento satisfactorio de las 350+ horas reglamentarias de prácticas en empresa (24 créditos).',
    timeDays: '3 a 5 días hábiles',
    icon: 'Briefcase',
    checkUnlocked: (ctx) => ({
      unlocked: ctx.isPracticesValidated,
      reasonIfLocked: 'Requiere validar sus prácticas preprofesionales en la pestaña "Práctica Preprofesional".',
      requirementLabel: 'Prácticas EFSRT aprobadas por Secretaría'
    })
  },
  { 
    code: 'CER01', 
    title: 'Certificado Oficial de Estudios (MINEDU)', 
    category: 'Certificación Oficial',
    amount: 50,
    why: 'Récord oficial de asignaturas, créditos y calificaciones vigesimales con valor legal para traslados, empleo y convalidación.',
    timeDays: '3 a 5 días hábiles',
    icon: 'FileText',
    checkUnlocked: () => ({
      unlocked: true,
      reasonIfLocked: '',
      requirementLabel: 'Asignaturas cursadas en el IESTP SFA'
    })
  },
  { 
    code: 'BAC01', 
    title: 'Constancia de Egresado Pleno y Bachiller Técnico', 
    category: 'Grado Formativo',
    amount: 60,
    why: 'Certifica la condición de egresado pleno con 120 créditos aprobados (96 lectivos + 24 EFSRT), requisito ministerial para titulación.',
    timeDays: '3 a 5 días hábiles',
    icon: 'GraduationCap',
    checkUnlocked: (ctx) => ({
      unlocked: ctx.isEgresadoPleno,
      reasonIfLocked: 'Requiere completar los 120 créditos integrales (96 lectivos + 24 EFSRT validadas).',
      requirementLabel: '120 créditos aprobados (96 lectivos + 24 EFSRT)'
    })
  },
  { 
    code: 'TIT01', 
    title: 'Apertura de Carpeta de Titulación Profesional', 
    category: 'Titulación Institucional',
    amount: 120,
    why: 'Apertura formal de expediente para sustentación, asignación de jurado y expedición del Título Profesional Técnico a Nombre de la Nación.',
    timeDays: '5 a 10 días hábiles',
    icon: 'ShieldCheck',
    checkUnlocked: (ctx) => ({
      unlocked: ctx.isEgresadoPleno,
      reasonIfLocked: 'Requiere condición de Egresado Pleno (120 créditos) y Certificado de Prácticas.',
      requirementLabel: 'Egresado Pleno (120 créditos)'
    })
  },
];

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = (e.target?.result as string) || '';
      if (file.type === 'application/pdf') {
        resolve(rawDataUrl || '/voucher_ciclo2.png');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.68));
        } else {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const safeStorageSet = (key: string, value: string) => {
  try {
    localStorage.removeItem(key);
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Could not set localStorage key "${key}":`, err);
  }
};

export function ProceduresTab({ studentDni, period }: { studentDni: string; period: string }) {
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

  // Contexto curricular del estudiante
  const isMateo = studentDni === "74859612";
  const isGraduatedLectivo = typeof window !== "undefined" && Boolean(
    !isMateo && localStorage.getItem(`sfa_student_graduated_all_${studentDni}`) !== "true"
      ? false
      : (
        localStorage.getItem(`sfa_student_promoted_${studentDni}`) === "true" ||
        localStorage.getItem(`sfa_student_graduated_all_${studentDni}`) === "true" ||
        localStorage.getItem(`sfa_student_cycle_${studentDni}`) === "6" ||
        localStorage.getItem(`sfa_student_status_${studentDni}`)?.includes("Egresado") ||
        (isMateo && (
          localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted") === "true" ||
          localStorage.getItem("sfa_student_graduated_all_74859612") === "true" ||
          localStorage.getItem("sfa_student_graduated_all") === "true" ||
          localStorage.getItem("sfa_student_cycle_74859612") === "6" ||
          localStorage.getItem("sfa_student_cycle") === "6"
        ))
      )
  );

  const isPracticesValidated = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_efsrt_validated_${studentDni}`) === "true" ||
    localStorage.getItem(`sfa_efsrt_all_approved_${studentDni}`) === "true" ||
    localStorage.getItem(`sfa_graduation_docs_${studentDni}_practicas`) === "true" ||
    (isMateo && (
      localStorage.getItem("sfa_efsrt_validated_74859612") === "true" ||
      localStorage.getItem("sfa_efsrt_all_approved_74859612") === "true" ||
      localStorage.getItem("sfa_graduation_docs_74859612_practicas") === "true"
    ))
  );

  const isEgresadoPleno = isGraduatedLectivo && isPracticesValidated;
  const currentCredits = isEgresadoPleno ? 120 : isGraduatedLectivo ? 96 : 0;
  const effectivePeriod = isGraduatedLectivo
    ? "Periodo 2029-II (Egresado)"
    : period && period.includes("2027-II")
    ? period
    : "Periodo 2027-I";

  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [isGraduationApto, setIsGraduationApto] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<StudentProcedureCode>('CON01');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [voucher, setVoucher] = useState({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
  const [voucherFile, setVoucherFile] = useState<{ name: string; url: string; size?: string } | null>(null);
  const [voucherSaving, setVoucherSaving] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [lockedModal, setLockedModal] = useState<{ title: string; reason: string; requirement: string } | null>(null);
  const [previewVoucherData, setPreviewVoucherData] = useState<{
    url: string;
    name: string;
    operationNumber?: string;
    date?: string;
    amount?: number | string;
  } | null>(null);

  const sortedItems = [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const pagination = usePagination(sortedItems, 5, sortedItems[0]?.id, 'sfa_student_requests_page_size');

  const reload = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [reqs, certs, grads] = await Promise.all([
        fetchServiceRequests(studentDni),
        fetchCertificates(studentDni).catch(() => []),
        fetchGraduations().catch(() => []),
      ]);
      const gradRecord = Array.isArray(grads) ? grads.find(g => g.studentDni === studentDni) : undefined;
      setIsGraduationApto(gradRecord?.status === 'Apto' || gradRecord?.status === 'Certificado Emitido');
      const hasActiveCert = (Array.isArray(certs) && certs.some(c => c.active)) || gradRecord?.status === 'Certificado Emitido';
      const mapped = (reqs || []).map(r => {
        if ((r.conceptCode === 'CER01' || r.conceptCode === 'TIT01') && hasActiveCert) {
          return { ...r, status: 'Validado', deliveryStatus: 'Emitido' as const };
        }
        return r;
      });
      setItems(mapped);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron consultar las solicitudes.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { 
    void reload(false); 
    let lastFocusSync = Date.now();
    const handleSync = () => { void reload(true); };
    const handleFocusSync = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (now - lastFocusSync < 4000) return;
      lastFocusSync = now;
      void reload(true);
    };
    window.addEventListener("sfa_service_requests_changed", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleFocusSync);
    document.addEventListener("visibilitychange", handleFocusSync);
    return () => {
      window.removeEventListener("sfa_service_requests_changed", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleFocusSync);
      document.removeEventListener("visibilitychange", handleFocusSync);
    };
  }, [studentDni]);
  useEffect(() => { 
    void readMafState<{ code: string; amount: number }>('concepts')
      .then(list => setRates(Object.fromEntries(list.map(item => [item.code, item.amount]))))
      .catch(() => {}); 
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetProcedure = proceduresCatalog.find(p => p.code === selected);
    const lockCheck = targetProcedure?.checkUnlocked({ isGraduatedLectivo, isPracticesValidated, isEgresadoPleno, credits: currentCredits });
    if (lockCheck && !lockCheck.unlocked) {
      setError(`No es posible solicitar ${targetProcedure.title}: ${lockCheck.reasonIfLocked}`);
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');
    try {
      const created = await createServiceRequest({ 
        studentDni, 
        conceptCode: selected, 
        source: 'estudiante', 
        period: effectivePeriod, 
        reason: reason.trim() 
      });
      setItems(current => [created, ...current]);
      setReason('');
      setMessage(`Solicitud #${created.id} (${created.conceptName}) registrada exitosamente. Proceda a registrar el pago en ventanilla o agente del Banco de la Nación.`);
      setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
      setVoucherFile(null);
      if (typeof window !== "undefined") {
        localStorage.setItem(`sfa_fut_registered_${studentDni}`, "true");
        localStorage.setItem(`sfa_fut_id_${studentDni}`, created.id);
        localStorage.setItem(`sfa_fut_concept_${studentDni}`, created.conceptName);
        localStorage.removeItem(`sfa_fee_paid_${studentDni}`);
        localStorage.removeItem(`sfa_fee_validated_${studentDni}`);
        if (studentDni === "74859612") {
          localStorage.setItem("sfa_fut_registered_74859612", "true");
          localStorage.setItem("sfa_fut_id_74859612", created.id);
          localStorage.removeItem("sfa_fee_paid_74859612");
          localStorage.removeItem("sfa_fee_validated_74859612");
        }
        window.dispatchEvent(new CustomEvent("sfa_service_requests_changed"));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  const startVoucher = (item: ServiceRequest) => {
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    setVoucher({ 
      requestId: item.id, 
      operationNumber: item.paymentOperation || '', 
      paymentDate: item.paymentDate || today, 
      amountPaid: String(item.amountPaid || item.amount) 
    });
    setVoucherFile(null);
    setVoucherFeedback('');
    setVoucherError('');
  };

  const saveVoucher = async (event: React.FormEvent) => {
    event.preventDefault();
    setVoucherSaving(true);
    setVoucherFeedback('');
    setVoucherError('');
    try {
      const saved = await submitServiceRequestVoucher(voucher.requestId, {
        studentDni,
        operationNumber: voucher.operationNumber.trim(),
        paymentDate: voucher.paymentDate,
        amountPaid: Number(voucher.amountPaid),
        voucherUrl: voucherFile?.url || '',
        voucherFileName: voucherFile?.name || '',
      });
      setItems(current => current.map(item => item.id === saved.id ? saved : item));
      if (typeof window !== "undefined") {
        safeStorageSet(`sfa_fee_paid_${studentDni}`, "true");
        localStorage.removeItem(`sfa_fee_validated_${studentDni}`);
        safeStorageSet(`sfa_fee_op_${studentDni}`, voucher.operationNumber.trim());
        safeStorageSet(`sfa_fee_amount_${studentDni}`, String(voucher.amountPaid));
        safeStorageSet(`sfa_fee_date_${studentDni}`, voucher.paymentDate);
        if (voucherFile?.url) {
          safeStorageSet(`sfa_fee_voucher_file_${studentDni}`, voucherFile.url);
          safeStorageSet(`sfa_fee_voucher_name_${studentDni}`, voucherFile.name);
        }
        if (studentDni === "74859612") {
          safeStorageSet("sfa_fee_paid_74859612", "true");
          safeStorageSet("sfa_fee_op_74859612", voucher.operationNumber.trim());
          safeStorageSet("sfa_fee_amount_74859612", String(voucher.amountPaid));
          safeStorageSet("sfa_fee_date_74859612", voucher.paymentDate);
          if (voucherFile?.url) {
            safeStorageSet("sfa_fee_voucher_file_74859612", voucherFile.url);
            safeStorageSet("sfa_fee_voucher_name_74859612", voucherFile.name);
          }
        }
        window.dispatchEvent(new CustomEvent("sfa_service_requests_changed"));
        window.dispatchEvent(new Event("storage"));
      }
      setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
      setVoucherFile(null);
      setVoucherFeedback('Comprobante de pago enviado a Tesorería y Secretaría Académica para su validación.');
    } catch (e) {
      setVoucherError(e instanceof Error ? e.message : 'No se pudo registrar el voucher.');
    } finally {
      setVoucherSaving(false);
    }
  };

  // Simulación de emisión oficial para pruebas instantáneas
  const simulateExpediteDocument = (item: ServiceRequest) => {
    const updated = {
      ...item,
      status: 'Validado' as const,
      deliveryStatus: 'Emitido' as const,
      resultFileName: `${item.conceptCode}_${studentDni}_Oficial.pdf`
    };
    setItems(current => current.map(i => i.id === item.id ? updated : i));
    setVoucherFeedback(`Documento oficial ${item.conceptName} expedido con firma y sello digital.`);
    setTimeout(() => setVoucherFeedback(''), 6000);
  };

  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ServiceRequest | null>(null);

  // Eliminación formal y reinicio del trámite
  const executeDeleteRequest = async (item: ServiceRequest) => {
    try {
      await deleteServiceRequest(item.id, studentDni);
    } catch {
      // Ignorar error si ya fue eliminado en servidor
    }

    setItems((curr) => curr.filter((i) => i.id !== item.id));
    setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
    setVoucherFile(null);

    if (typeof window !== "undefined") {
      // Limpiar estados de FUT y Pago asociados para que MGE se resetee reactivamente
      localStorage.removeItem(`sfa_fut_registered_${studentDni}`);
      localStorage.removeItem(`sfa_fut_id_${studentDni}`);
      localStorage.removeItem(`sfa_fut_concept_${studentDni}`);
      localStorage.removeItem(`sfa_fee_paid_${studentDni}`);
      localStorage.removeItem(`sfa_fee_validated_${studentDni}`);
      localStorage.removeItem(`sfa_fee_op_${studentDni}`);
      localStorage.removeItem(`sfa_fee_amount_${studentDni}`);
      localStorage.removeItem(`sfa_fee_date_${studentDni}`);
      localStorage.removeItem(`sfa_fee_voucher_file_${studentDni}`);
      localStorage.removeItem(`sfa_fee_voucher_name_${studentDni}`);

      if (studentDni === "74859612") {
        localStorage.removeItem("sfa_fut_registered_74859612");
        localStorage.removeItem("sfa_fut_id_74859612");
        localStorage.removeItem("sfa_fut_concept_74859612");
        localStorage.removeItem("sfa_fee_paid_74859612");
        localStorage.removeItem("sfa_fee_op_74859612");
        localStorage.removeItem("sfa_fee_amount_74859612");
        localStorage.removeItem("sfa_fee_date_74859612");
        localStorage.removeItem("sfa_fee_voucher_file_74859612");
        localStorage.removeItem("sfa_fee_voucher_name_74859612");
      }

      window.dispatchEvent(new CustomEvent("sfa_service_requests_changed"));
      window.dispatchEvent(new Event("storage"));
    }

    setVoucherFeedback(`Solicitud #${item.id} eliminada exitosamente. El trámite ha sido reiniciado.`);
    setTimeout(() => setVoucherFeedback(""), 5000);
  };

  const getStatusBadge = (status: string, deliveryStatus?: string, conceptCode?: string) => {
    if (deliveryStatus === 'Emitido') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-700 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Documento Emitido
        </span>
      );
    }
    if (status === 'Validado' && (conceptCode === 'CER01' || conceptCode === 'TIT01') && isGraduationApto) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-700 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Aprobado • Apto para Emisión
        </span>
      );
    }
    if (status === 'Validado') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-black text-blue-700 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Pago Validado • Pendiente de Emisión
        </span>
      );
    }
    if (status === 'En Proceso') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-black text-sky-700 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          En Conciliación Bancaria
        </span>
      );
    }
    if (status === 'Observado') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-black text-red-700">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          Voucher Observado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-800">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pendiente de Pago
      </span>
    );
  };

  return (
    <PageTransition id="procedures-tab" className="space-y-6 text-left">
      {/* 1. Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • MESA DE PARTES DIGITAL
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Trámites de Secretaría Académica
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Catálogo institucional de constancias, certificados oficiales y expedientes de graduación suscritos con firma electrónica ministerial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="text-left bg-black/35 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Avance Curricular</span>
              <span className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                <span>{currentCredits} / 120 cr.</span>
                <span className="text-[10px] text-amber-300 font-semibold">({Math.round((currentCredits / 120) * 100)}%)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => void reload()}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#800521]" />
              <span>Actualizar Trámites</span>
            </button>
          </div>
        </div>

        {/* Parámetros institucionales */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Entidad Recaudadora</span>
              <span className="font-extrabold text-white">Banco de la Nación</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Validez Legal</span>
              <span className="font-extrabold text-white">Firma Electrónica & QR</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Plazo de Emisión</span>
              <span className="font-extrabold text-white">24h a 72h hábiles</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <FileText className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Formato Oficial</span>
              <span className="font-extrabold text-white">PDF Alta Resolución A4</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Banner de Flujo y Requisitos de Graduación */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#800521] text-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
              Flujo Institucional de Titulación
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Ruta progresiva de desbloqueo de trámites
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium">
            1. <strong>6 Ciclos Lectivos (96 cr.)</strong> {'->'} 2. <strong>Prácticas EFSRT (24 cr.)</strong> {'->'} 3. <strong>Egresado Pleno (120 cr.)</strong> {'->'} 4. <strong>Carpeta de Titulación</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold">
            <span className={isGraduatedLectivo ? "text-emerald-400" : "text-slate-400"}>
              {isGraduatedLectivo ? "[OK] 6 Ciclos Lectivos" : "[PEND] 6 Ciclos"}
            </span>
            <span className="text-white/40">•</span>
            <span className={isPracticesValidated ? "text-emerald-400" : "text-amber-300"}>
              {isPracticesValidated ? "[OK] EFSRT Acreditado" : "[PEND] EFSRT"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Catálogo de Trámites con Desbloqueo Progresivo */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Catálogo de Trámites y Certificaciones Oficiales
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Seleccione el trámite a gestionar según su estado curricular y requisitos acreditados.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {proceduresCatalog.map((item) => {
            const isSelected = selected === item.code;
            const rate = (rates[item.code] || item.amount).toFixed(2);
            const lockCheck = item.checkUnlocked({ 
              isGraduatedLectivo, 
              isPracticesValidated, 
              isEgresadoPleno, 
              credits: currentCredits 
            });

            return (
              <div 
                key={item.code} 
                onClick={() => {
                  if (lockCheck.unlocked) {
                    setSelected(item.code);
                  } else {
                    setLockedModal({
                      title: item.title,
                      reason: lockCheck.reasonIfLocked,
                      requirement: lockCheck.requirementLabel
                    });
                  }
                }}
                className={`rounded-2xl border p-5 shadow-3xs transition-all flex flex-col justify-between relative cursor-pointer ${
                  !lockCheck.unlocked
                    ? "bg-slate-50/90 border-slate-250 opacity-80 hover:opacity-100 hover:border-amber-300"
                    : isSelected 
                      ? "border-[#800521] bg-red-50/20 ring-2 ring-[#800521]/20 shadow-md" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border uppercase ${
                      !lockCheck.unlocked
                        ? "bg-slate-200 text-slate-600 border-slate-300"
                        : isSelected 
                          ? "bg-[#800521] text-white border-[#800521]" 
                          : "bg-slate-100 text-slate-700 border-slate-250"
                    }`}>
                      {item.code} • {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.timeDays}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.why}
                  </p>

                  {/* Estado de Desbloqueo / Prerrequisito */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    {lockCheck.unlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Habilitado • Requisitos cumplidos</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span className="truncate" title={lockCheck.reasonIfLocked}>Bloqueado • Prerrequisito pendiente</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-150 flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Tasa Institucional</span>
                    <span className="text-base font-black text-[#800521] font-mono">S/ {rate}</span>
                  </div>
                  <button
                    type="button"
                    disabled={!lockCheck.unlocked}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                      !lockCheck.unlocked
                        ? "bg-slate-200 text-slate-500 border border-slate-300"
                        : isSelected 
                          ? "bg-[#800521] text-white font-extrabold shadow-xs" 
                          : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {!lockCheck.unlocked ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Bloqueado</span>
                      </>
                    ) : isSelected ? (
                      <span>Seleccionado</span>
                    ) : (
                      <span>Solicitar Trámite</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Explicación de Prerrequisito Bloqueado */}
      {lockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-left">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 font-mono">Trámite no disponible</span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{lockedModal.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLockedModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="font-medium">
                Este trámite se encuentra temporalmente bloqueado debido a que no cumple con el siguiente prerrequisito obligatorio:
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold space-y-1">
                <p>• {lockedModal.reason}</p>
                <p className="text-[11px] text-amber-800/80 font-medium">Requisito oficial: {lockedModal.requirement}</p>
              </div>
              <p className="text-[11px] text-slate-500">
                Una vez cumplido y regularizado dicho requisito en Secretaría Académica o en su respectiva pestaña (por ejemplo, validando sus Prácticas Preprofesionales), el trámite se desbloqueará de forma automática.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLockedModal(null)}
                className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Formulario de Solicitud y Mis Solicitudes en Grid Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Formulario Nueva Solicitud (2 columnas) */}
        <form onSubmit={submit} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4">
          <div className="border-b border-slate-150 pb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#800521] font-mono block">
              MESA DE PARTES VIRTUAL
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              Registrar Nueva Solicitud
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Se vinculará formalmente al DNI <span className="font-mono font-bold text-slate-800">{studentDni}</span>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Trámite Académico Solicitado *
            </label>
            <select 
              className="w-full rounded-xl border border-slate-250 p-2.5 bg-slate-50/70 focus:bg-white focus:border-[#800521] focus:ring-1 focus:ring-[#800521] text-xs font-bold text-slate-800 transition-all cursor-pointer"
              value={selected} 
              onChange={e => setSelected(e.target.value as StudentProcedureCode)}
            >
              {proceduresCatalog.map(item => {
                const lockCheck = item.checkUnlocked({ isGraduatedLectivo, isPracticesValidated, isEgresadoPleno, credits: currentCredits });
                return (
                  <option 
                    key={item.code} 
                    value={item.code}
                    disabled={!lockCheck.unlocked}
                  >
                    {item.title} — S/ {(rates[item.code] || item.amount).toFixed(2)} {!lockCheck.unlocked ? '(Bloqueado)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Motivo o Destino del Trámite (Opcional)
            </label>
            <textarea 
              className="w-full rounded-xl border border-slate-250 p-3 text-xs bg-slate-50/70 focus:bg-white focus:border-[#800521] focus:ring-1 focus:ring-[#800521] text-slate-800 placeholder:text-slate-400 font-medium transition-all"
              maxLength={300} 
              rows={3} 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              placeholder="Ejemplo: Convocatoria laboral, colegiatura técnica, postulación a Beca..." 
            />
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Procedimiento de Emisión Oficial:
            </p>
            <p className="text-amber-900/90 leading-relaxed font-medium">
              Al enviar tu solicitud, se generará una orden en Tesorería. Registra el voucher de pago para la visación y firma digital del documento.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full rounded-xl bg-[#800521] hover:bg-[#66041a] py-3 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Registrando Solicitud...' : 'Enviar Solicitud a Secretaría'}</span>
          </button>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Listado de Solicitudes y Registro de Voucher (3 columnas) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                EXPEDIENTES REGISTRADOS
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Mis Trámites y Solicitudes
              </h2>
            </div>
            <button 
              onClick={() => void reload()} 
              type="button" 
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#800521] bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 
              <span>Actualizar</span>
            </button>
          </div>

          {voucherFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{voucherFeedback}</span>
            </div>
          )}
          {voucherError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{voucherError}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-300" />
              <p>Consultando estado de expedientes en Secretaría...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
              <FileText className="w-7 h-7 mx-auto text-slate-300 mb-1" />
              <p className="font-bold text-slate-600">No registras trámites pendientes</p>
              <p className="text-[11px]">Selecciona un certificado o constancia para iniciar tu solicitud formal.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {pagination.items.map((item) => {
                const shortCode = `SOL-${String(item.id || "").replace(/^SOL-/i, "").slice(0, 8).toUpperCase()}`;
                const isEmitted = item.deliveryStatus === 'Emitido';
                const isAptoCer = item.status === 'Validado' && (item.conceptCode === 'CER01' || item.conceptCode === 'TIT01') && isGraduationApto;
                const cardClass = isEmitted
                  ? 'border-emerald-300 bg-emerald-50/35 shadow-xs'
                  : isAptoCer
                    ? 'border-emerald-300 bg-emerald-50/25'
                    : item.status === 'Validado'
                      ? 'border-blue-200 bg-blue-50/20'
                      : 'border-slate-200 bg-white';
                return (
                <li key={item.id} className={`rounded-2xl border p-4 space-y-3 transition-all ${cardClass}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          title={item.id}
                          className={`text-[10.5px] font-black font-mono px-2.5 py-0.5 rounded-md border shrink-0 ${
                            isEmitted
                              ? 'bg-emerald-100/70 text-emerald-900 border-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          #{shortCode}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm leading-snug">{item.conceptName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Tasa: <span className="font-bold text-slate-800 font-mono">S/ {item.amount.toFixed(2)}</span> • Fecha: {new Date(item.createdAt).toLocaleDateString("es-PE")}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-start">
                      {getStatusBadge(item.status, item.deliveryStatus, item.conceptCode)}
                      {item.deliveryStatus !== 'Emitido' && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar solicitud y reiniciar trámite"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.paymentOperation && (
                    <div className={`p-2.5 border rounded-xl text-xs text-slate-600 font-medium flex items-center justify-between gap-3 ${
                      isEmitted ? 'bg-white/90 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div>
                        <span>Voucher registrado: <strong className="font-mono text-slate-800">{item.paymentOperation}</strong></span>
                        <span className="text-[10px] text-slate-500 ml-2">({item.paymentDate})</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          let remote: { voucherUrl: string; voucherFileName: string } | null = null;
                          if (!item.voucherUrl && item.hasVoucher) {
                            remote = await fetchServiceRequestVoucher(item.id, studentDni).catch(() => null);
                          }
                          const url =
                            item.voucherUrl ||
                            remote?.voucherUrl ||
                            localStorage.getItem(`sfa_fee_voucher_file_${studentDni}`) ||
                            (studentDni === "74859612" ? localStorage.getItem("sfa_fee_voucher_file_74859612") : null) ||
                            "/voucher_ciclo2.png";
                          const name =
                            item.voucherFileName ||
                            remote?.voucherFileName ||
                            localStorage.getItem(`sfa_fee_voucher_name_${studentDni}`) ||
                            (studentDni === "74859612" ? localStorage.getItem("sfa_fee_voucher_name_74859612") : null) ||
                            "VOUCHER_DE_PAGO.png";
                          setPreviewVoucherData({
                            url,
                            name,
                            operationNumber: item.paymentOperation,
                            date: item.paymentDate,
                            amount: item.amountPaid || item.amount
                          });
                        }}
                        className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#800521] bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ver Voucher</span>
                      </button>
                    </div>
                  )}

                  {/* Acciones del Trámite */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {item.deliveryStatus === 'Emitido' ? (
                      <button 
                        type="button"
                        onClick={async () => {
                          if (item.conceptCode === 'CER01' || item.conceptCode === 'TIT01') {
                            try {
                              let sName = item.studentName || `Estudiante (${studentDni})`;
                              let sProgram = item.program || 'Contabilidad';
                              try {
                                const raw = localStorage.getItem('sfa_students');
                                if (raw) {
                                  const parsed = JSON.parse(raw);
                                  const found = (parsed[studentDni] || Object.values(parsed).find((p: any) => p?.dni === studentDni)) as any;
                                  if (found) {
                                    const full = `${found.name || ''} ${found.lastName || ''}`.trim();
                                    if (full) sName = full;
                                    sProgram = found.career || found.program || found.programId || sProgram;
                                  }
                                }
                              } catch (e) {}

                              const pdf = await generateOfficialCertificatePdf({
                                studentName: sName,
                                studentDni,
                                program: sProgram,
                                certificateNumber: `CERT-2026-${studentDni.slice(-4)}-SFA`,
                                issueDate: academicToday(),
                                issuerName: 'Mg. Carlos Mendoza Quispe — Secretaría Académica',
                              });
                              pdf.save(`Certificado_Oficial_${studentDni}.pdf`);
                              return;
                            } catch (e) {
                              console.warn("Direct PDF generation fallback to URL:", e);
                            }
                          }
                          window.open(serviceRequestResultUrl(item.id, studentDni), '_blank');
                        }}
                        className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-[13px] py-2.5 px-5 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Documento Oficial (PDF con Firma y Sello)</span>
                      </button>
                    ) : (
                      <>
                        {(item.status === 'Pendiente' || item.status === 'Observado') && voucher.requestId !== item.id && (
                          <button 
                            type="button" 
                            onClick={() => startVoucher(item)} 
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#800521] text-[#800521] hover:bg-red-50 font-bold text-xs py-1.5 px-3 transition-all cursor-pointer"
                          >
                            <span>{item.status === 'Observado' ? 'Corregir datos de voucher' : 'Registrar Comprobante de Pago'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {item.status === 'En Proceso' && (
                          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Comprobante en auditoría por Tesorería y Secretaría Académica</span>
                          </div>
                        )}
                        {item.status === 'Validado' && (
                          <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                            (item.conceptCode === 'CER01' || item.conceptCode === 'TIT01') && isGraduationApto
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                              (item.conceptCode === 'CER01' || item.conceptCode === 'TIT01') && isGraduationApto
                                ? 'text-emerald-700'
                                : 'text-blue-700'
                            }`} />
                            <span>
                              {(item.conceptCode === 'CER01' || item.conceptCode === 'TIT01') && isGraduationApto
                                ? 'Expediente aprobado (Apto) • Pendiente de registro del certificado oficial por Secretaría Académica'
                                : 'Pago validado por Tesorería • Pendiente de aprobación para emisión'}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Formulario Inline de Registro de Voucher */}
                  {voucher.requestId === item.id && (
                    <form onSubmit={saveVoucher} className="rounded-xl bg-slate-50 border border-slate-250 p-4 space-y-3 mt-3 animate-in fade-in">
                      <div className="border-b border-slate-200 pb-2">
                        <span className="text-[9.5px] font-black uppercase text-[#800521] font-mono block">
                          REGISTRO DE VOUCHER • BANCO DE LA NACIÓN
                        </span>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Ingrese los datos exactos que figuran en el comprobante de pago emitido por ventanilla o agente.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-[10.5px] font-bold uppercase text-slate-600 mb-1">
                            N° de Operación *
                          </label>
                          <input 
                            required 
                            maxLength={100} 
                            value={voucher.operationNumber} 
                            onChange={event => setVoucher(current => ({ ...current, operationNumber: event.target.value }))} 
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold bg-white" 
                            placeholder="Ej: 048291"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold uppercase text-slate-600 mb-1">
                            Fecha de Pago *
                          </label>
                          <input 
                            required 
                            type="date" 
                            value={voucher.paymentDate} 
                            onChange={event => setVoucher(current => ({ ...current, paymentDate: event.target.value }))} 
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-medium" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold uppercase text-slate-600 mb-1">
                            Monto Pagado (S/) *
                          </label>
                          <input 
                            required 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            value={voucher.amountPaid} 
                            onChange={event => setVoucher(current => ({ ...current, amountPaid: event.target.value }))} 
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold bg-white" 
                          />
                        </div>
                      </div>

                      {/* Adjuntar Voucher de Pago */}
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase text-slate-600 mb-1 flex items-center justify-between">
                          <span>Comprobante o Voucher de Pago Digital *</span>
                          <span className="text-[10px] text-slate-400 font-normal">JPG, PNG o PDF • Máx. 5 MB</span>
                        </label>

                        {voucherFile ? (
                          <div className="bg-white border border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {voucherFile.url.startsWith("data:image") || voucherFile.url.endsWith(".png") || voucherFile.url.endsWith(".jpg") ? (
                                <img
                                  src={voucherFile.url}
                                  alt="Voucher"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer hover:opacity-80"
                                  onClick={() => setPreviewVoucherData({
                                    url: voucherFile.url,
                                    name: voucherFile.name,
                                    operationNumber: voucher.operationNumber,
                                    date: voucher.paymentDate,
                                    amount: Number(voucher.amountPaid)
                                  })}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                                  PDF
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{voucherFile.name}</p>
                                <p className="text-[10px] text-emerald-700 font-bold uppercase">Comprobante oficial adjuntado</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewVoucherData({
                                  url: voucherFile.url,
                                  name: voucherFile.name,
                                  operationNumber: voucher.operationNumber,
                                  date: voucher.paymentDate,
                                  amount: Number(voucher.amountPaid)
                                })}
                                className="text-slate-600 hover:text-slate-900 text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Ver</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setVoucherFile(null)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Quitar archivo"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-[#800521] bg-white rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-[#800521] cursor-pointer transition-all group">
                              <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#800521]" />
                              <span className="font-bold">Examinar voucher desde dispositivo...</span>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={async (e) => {
                                  const inputEl = e.currentTarget;
                                  const file = inputEl.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) {
                                    setVoucherError("El archivo supera el máximo permitido de 5 MB.");
                                    inputEl.value = "";
                                    return;
                                  }
                                  setVoucherError("");
                                  try {
                                    const compressedUrl = await compressImageFile(file);
                                    setVoucherFile({
                                      name: file.name,
                                      url: compressedUrl,
                                      size: `${(file.size / 1024).toFixed(0)} KB`
                                    });
                                  } catch {
                                    setVoucherError("No se pudo leer el archivo seleccionado.");
                                  } finally {
                                    inputEl.value = "";
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button 
                          type="submit" 
                          disabled={voucherSaving} 
                          className="rounded-xl bg-[#800521] hover:bg-[#66041a] px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-60 shadow-xs"
                        >
                          {voucherSaving ? 'Validando...' : 'Enviar Voucher a Tesorería'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
                            setVoucherFile(null);
                          }} 
                          className="rounded-xl border border-slate-250 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </li>
                );
              })}
            </ul>
          )}

          {!loading && items.length > 0 && (
            <div className="pt-3 border-t border-slate-150">
              <Pagination 
                total={items.length} 
                page={pagination.page} 
                pageSize={pagination.pageSize} 
                pageCount={pagination.pageCount} 
                onPageChange={pagination.setPage} 
                onPageSizeChange={pagination.setPageSize} 
                label="trámites" 
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Vista Previa del Voucher de Pago para el Estudiante */}
      {previewVoucherData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-300 my-auto">
            <div className="bg-[#800521] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider">
                    Comprobante de Pago • Banco de la Nación
                  </h3>
                  <p className="text-[10px] text-amber-200 font-mono truncate max-w-[280px]">
                    {previewVoucherData.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVoucherData(null)}
                className="text-white hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 bg-slate-50">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-inner">
                {previewVoucherData.url.startsWith("data:image") || previewVoucherData.url.endsWith(".png") || previewVoucherData.url.endsWith(".jpg") ? (
                  <img
                    src={previewVoucherData.url}
                    alt="Voucher"
                    className="max-h-[280px] w-auto object-contain rounded-lg border border-slate-300 shadow-xs"
                  />
                ) : (
                  <div className="py-12 text-center text-xs font-mono font-bold text-slate-700">
                    Documento PDF adjuntado ({previewVoucherData.name})
                  </div>
                )}
              </div>

              {(previewVoucherData.operationNumber || previewVoucherData.amount) && (
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-2xl border border-slate-200 font-mono">
                  {previewVoucherData.operationNumber && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">N° Operación</span>
                      <strong className="text-slate-900 font-extrabold">{previewVoucherData.operationNumber}</strong>
                    </div>
                  )}
                  {previewVoucherData.amount && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Importe</span>
                      <strong className="text-[#800521] font-extrabold">S/ {Number(previewVoucherData.amount).toFixed(2)}</strong>
                    </div>
                  )}
                  {previewVoucherData.date && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Fecha de Pago</span>
                      <span className="text-slate-700 font-bold">{previewVoucherData.date}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Entidad Recaudadora</span>
                    <span className="text-slate-700 font-bold">Banco de la Nación</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewVoucherData(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Institucional de Confirmación de Eliminación de Trámite */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-300 animate-in zoom-in-95">
            <div className="bg-[#800521] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-xs uppercase tracking-wide">
                  Confirmar Eliminación de Trámite
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="text-white hover:text-amber-300 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 bg-slate-50 text-xs">
              <p className="text-slate-700 font-medium">
                ¿Está seguro de que desea eliminar la solicitud formal de <strong>{deleteConfirmItem.conceptName}</strong>?
              </p>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1.5 shadow-2xs">
                <div><span className="text-slate-400 font-bold">Expediente:</span> #{deleteConfirmItem.id}</div>
                <div><span className="text-slate-400 font-bold">Tasa Arancelaria:</span> S/ {deleteConfirmItem.amount.toFixed(2)}</div>
                {deleteConfirmItem.paymentOperation && (
                  <div><span className="text-slate-400 font-bold">Voucher Registrado:</span> {deleteConfirmItem.paymentOperation}</div>
                )}
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11px] text-rose-900 font-medium leading-relaxed">
                Esta acción cancelará el trámite y reiniciará el expediente en Secretaría Académica para que pueda iniciarlo nuevamente desde cero.
              </div>
            </div>

            <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deleteConfirmItem;
                  setDeleteConfirmItem(null);
                  await executeDeleteRequest(target);
                }}
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Trámite</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
