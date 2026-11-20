import React, { useEffect, useState } from 'react';
import { 
  FileText, RefreshCw, Award, CheckCircle2, Clock, AlertCircle, 
  Download, ArrowRight, ShieldCheck, Building2, Send, Sparkles
} from 'lucide-react';
import { 
  createServiceRequest, fetchServiceRequests, ServiceRequest, 
  StudentProcedureCode, submitServiceRequestVoucher, serviceRequestResultUrl 
} from '../../../services/serviceRequests';
import { readMafState } from '../../../services/mafState';
import { Pagination, usePagination } from '../../ui/Pagination';
import PageTransition from '../../ui/PageTransition';

const procedures: { code: StudentProcedureCode; title: string; amount: number; why: string; timeDays: string; icon: string }[] = [
  { 
    code: 'CER01', 
    title: 'Certificado de Estudios Oficial', 
    amount: 50,
    why: 'Acredita formalmente todas las asignaturas cursadas, créditos y calificaciones vigesimales con valor para traslados, empleo y convalidación.',
    timeDays: '3 a 5 días hábiles',
    icon: 'Award'
  },
  { 
    code: 'CON01', 
    title: 'Constancia de Matrícula Institucional', 
    amount: 30,
    why: 'Certifica la condición de estudiante regular matriculado en el semestre lectivo vigente para becas (Pronabec), seguro y prácticas.',
    timeDays: '24 a 48 horas',
    icon: 'FileCheck'
  },
];

export function ProceduresTab({ studentDni, period }: { studentDni: string; period: string }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<StudentProcedureCode>('CER01');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [voucher, setVoucher] = useState({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
  const [voucherSaving, setVoucherSaving] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const sortedItems = [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const pagination = usePagination(sortedItems, 5, sortedItems[0]?.id, 'sfa_student_requests_page_size');

  const reload = async () => {
    setLoading(true);
    try {
      setItems(await fetchServiceRequests(studentDni));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron consultar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [studentDni]);
  useEffect(() => { 
    void readMafState<{ code: string; amount: number }>('concepts')
      .then(list => setRates(Object.fromEntries(list.map(item => [item.code, item.amount]))))
      .catch(() => {}); 
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const created = await createServiceRequest({ 
        studentDni, 
        conceptCode: selected, 
        source: 'estudiante', 
        period, 
        reason: reason.trim() 
      });
      setItems(current => [created, ...current]);
      setReason('');
      setMessage(`Solicitud #${created.id} registrada exitosamente. Se ha derivado a MAF para su validación de pago.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  const procedure = procedures.find(item => item.code === selected) || procedures[0];

  const startVoucher = (item: ServiceRequest) => {
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    setVoucher({ 
      requestId: item.id, 
      operationNumber: item.paymentOperation || '', 
      paymentDate: item.paymentDate || today, 
      amountPaid: String(item.amountPaid || item.amount) 
    });
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
      });
      setItems(current => current.map(item => item.id === saved.id ? saved : item));
      setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
      setVoucherFeedback('Comprobante de pago enviado a Tesorería MAF. Se verificará contra el reporte del Banco de la Nación.');
    } catch (e) {
      setVoucherError(e instanceof Error ? e.message : 'No se pudo registrar el voucher.');
    } finally {
      setVoucherSaving(false);
    }
  };

  const getStatusBadge = (status: string, deliveryStatus?: string) => {
    if (deliveryStatus === 'Emitido') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-black text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Documento Emitido
        </span>
      );
    }
    if (status === 'Validado') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-black text-purple-700">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          Pago Validado • En Firma
        </span>
      );
    }
    if (status === 'En Proceso') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-black text-sky-700">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          En Verificación Bancaria
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
              Emisión de certificados oficiales de estudios, constancias de matrícula y seguimiento de expedientes suscritos con firma digital y sello institucional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="text-left bg-black/35 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Período Lectivo</span>
              <span className="text-xs font-black text-white font-mono">{period || "2027-I"}</span>
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

      {/* 2. Catálogo Visual de Trámites Disponibles */}
      <div className="grid gap-4 md:grid-cols-2">
        {procedures.map((item) => {
          const isSelected = selected === item.code;
          const rate = (rates[item.code] || item.amount).toFixed(2);

          return (
            <div 
              key={item.code} 
              onClick={() => setSelected(item.code)}
              className={`rounded-2xl border p-5 shadow-3xs cursor-pointer transition-all flex flex-col justify-between ${
                isSelected 
                  ? "border-[#800521] bg-red-50/20 ring-2 ring-[#800521]/20 shadow-md" 
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded border uppercase ${
                    isSelected 
                      ? "bg-[#800521] text-white border-[#800521]" 
                      : "bg-slate-100 text-slate-700 border-slate-250"
                  }`}>
                    {item.code} • Trámite Oficial
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.timeDays}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.why}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Tasa Institucional</span>
                  <span className="text-lg font-black text-[#800521] font-mono">S/ {rate}</span>
                </div>
                <button
                  type="button"
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#800521] text-white font-extrabold shadow-xs" 
                      : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {isSelected ? "Seleccionado" : "Solicitar trámite"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Formulario de Solicitud y Mis Solicitudes en Grid Responsivo */}
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
              {procedures.map(item => (
                <option key={item.code} value={item.code}>
                  {item.title} — S/ {(rates[item.code] || item.amount).toFixed(2)}
                </option>
              ))}
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
              placeholder="Ejemplo: Convocatoria Beca Continuidad, convalidación externa o postulación laboral..." 
            />
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Procedimiento de Emisión Oficial:
            </p>
            <p className="text-amber-900/90 leading-relaxed font-medium">
              Al enviar tu solicitud, se generará una orden en Tesorería MAF. Realiza el pago en el Banco de la Nación y registra tu voucher para su firma y expedición digital.
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
            <ul className="divide-y divide-slate-150">
              {pagination.items.map((item) => (
                <li key={item.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          #{item.id}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">{item.conceptName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Tasa: <span className="font-bold text-slate-800 font-mono">S/ {item.amount.toFixed(2)}</span> • Fecha: {new Date(item.createdAt).toLocaleDateString("es-PE")}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(item.status, item.deliveryStatus)}
                    </div>
                  </div>

                  {item.paymentOperation && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium flex items-center justify-between">
                      <span>Voucher registrado: <strong className="font-mono text-slate-800">{item.paymentOperation}</strong></span>
                      <span className="text-[10px] text-slate-500">{item.paymentDate}</span>
                    </div>
                  )}

                  {/* Acciones del Trámite */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {item.deliveryStatus === 'Emitido' && (
                      <a 
                        href={serviceRequestResultUrl(item.id, studentDni)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Documento Oficial (PDF con Firma y Sello)</span>
                      </a>
                    )}

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
                          onClick={() => setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' })} 
                          className="rounded-xl border border-slate-250 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
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
    </PageTransition>
  );
}
