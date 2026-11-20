import React, { useEffect, useState } from 'react';
import { 
  FileText, RefreshCw, Award, CheckCircle2, Clock, AlertCircle, 
  Download, ArrowRight, ShieldCheck, Building2, Send, Sparkles, FileCheck 
} from 'lucide-react';
import { 
  createServiceRequest, fetchServiceRequests, ServiceRequest, 
  submitServiceRequestVoucher, serviceRequestResultUrl 
} from '../../services/serviceRequests';
import { readMafState } from '../../services/mafState';
import PageTransition from '../ui/PageTransition';

export type TeacherProcedureCode = 'DOC01' | 'DOC02';

const procedures: { code: TeacherProcedureCode; title: string; amount: number; why: string; timeDays: string }[] = [
  { 
    code: 'DOC01', 
    title: 'Constancia de Trabajo Docente', 
    amount: 30,
    why: 'Certifica la condición de docente titular en ejercicio activo en el IESTP San Francisco de Asís para trámites bancarios, acreditación y préstamos.',
    timeDays: '24 a 48 horas',
  },
  { 
    code: 'DOC02', 
    title: 'Certificado de Servicios Docentes', 
    amount: 50,
    why: 'Acredita el tiempo de servicios, horas lectivas dictadas, asignaturas y resolución directoral de nombramiento/contratación para escalafón ministerial.',
    timeDays: '3 a 5 días hábiles',
  },
];

export default function TeacherProceduresTab({ teacherDni }: { teacherDni: string }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<TeacherProcedureCode>('DOC01');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [voucher, setVoucher] = useState({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
  const [voucherSaving, setVoucherSaving] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState('');
  const [voucherError, setVoucherError] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      setItems(await fetchServiceRequests(undefined, teacherDni));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron consultar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [teacherDni]);

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
        teacherDni, 
        conceptCode: selected, 
        source: 'docente', 
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

  const sendVoucher = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!voucher.operationNumber.trim() || !voucher.paymentDate) {
      setVoucherError('Complete el número de operación y la fecha de pago.');
      return;
    }
    const parsedAmount = Number(voucher.amountPaid);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setVoucherError('Ingrese un importe de pago válido en soles.');
      return;
    }
    setVoucherSaving(true);
    setVoucherError('');
    try {
      const updated = await submitServiceRequestVoucher(voucher.requestId, {
        teacherDni,
        operationNumber: voucher.operationNumber.trim(),
        paymentDate: voucher.paymentDate,
        amountPaid: parsedAmount
      });
      setItems(current => current.map(item => item.id === updated.id ? updated : item));
      setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' });
      setVoucherFeedback('Voucher registrado exitosamente. MAF cotejará la operación bancaria.');
    } catch (e) {
      setVoucherError(e instanceof Error ? e.message : 'No se pudo registrar el voucher.');
    } finally {
      setVoucherSaving(false);
    }
  };

  return (
    <PageTransition id="teacher-procedures-tab" className="space-y-6 text-left font-sans">
      {/* 1. Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              SECRETARÍA GENERAL • ÁREA DOCENTE
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Trámites de Secretaría Académica
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Emisión de constancias de trabajo docente, certificados de servicios y seguimiento de expedientes validados por MAF y Dirección.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-xl shadow-inner text-xs">
            <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-300 block">Normativa Aprobada</span>
              <span className="font-extrabold text-white text-[11px]">R.D. N° 0458-2005-ED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Selección de Trámite Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {procedures.map((p) => {
          const isSelected = selected === p.code;
          const officialAmount = rates[p.code] || p.amount;
          return (
            <div
              key={p.code}
              onClick={() => setSelected(p.code)}
              className={`rounded-2xl p-5 border transition-all duration-200 cursor-pointer text-left relative overflow-hidden ${
                isSelected
                  ? 'border-[#800521] bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 shadow-md ring-2 ring-[#800521]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-3xs hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black text-[#800521] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" /> {p.timeDays}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {p.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-[#800521] tracking-tight block">
                    S/ {officialAmount.toFixed(2)}
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-bold block uppercase">
                    Tasa Única TUPA
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium mt-3 leading-relaxed">
                {p.why}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-500">
                  {isSelected ? 'Trámite seleccionado' : 'Haga clic para seleccionar'}
                </span>
                <span className={`font-black uppercase text-[10px] tracking-wider flex items-center gap-1 ${
                  isSelected ? 'text-[#800521]' : 'text-slate-400'
                }`}>
                  Solicitar trámite <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Panel Dividido: Formulario de Nueva Solicitud (Izquierda) + Cuentas de Pago (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Nueva Solicitud (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Nueva Solicitud de Trámite
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Expediente se vinculará al DNI docente <strong className="text-slate-800 font-mono">{teacherDni}</strong>
              </p>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 font-black px-2.5 py-1 rounded-full uppercase">
              TUPA SFA Vigente (2027)
            </span>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-wider">
                Documento a Tramitar
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-800 block">{procedure.title}</span>
                  <span className="text-xs text-slate-500 font-medium">Tiempo de entrega: {procedure.timeDays}</span>
                </div>
                <span className="text-base font-black text-[#800521]">
                  S/ {(rates[selected] || procedure.amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-wider">
                Motivo / Justificación de la Solicitud (Opcional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ejemplo: Acreditación para escalafón ministerial, concurso público o trámite bancario..."
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#800521] focus:ring-1 focus:ring-[#800521] transition-all bg-white"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#800521] hover:bg-[#66041a] text-white py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>{saving ? 'Registrando en Secretaría...' : 'Enviar Solicitud a Secretaría y MAF'}</span>
            </button>
          </form>
        </div>

        {/* Cuentas de Pago Institucionales (1 col) */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Building2 className="w-5 h-5 text-[#800521]" />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Instrucciones de Pago
              </h3>
              <span className="text-[10px] text-slate-500 font-bold block">Banco de la Nación</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Cuenta Corriente Oficial</span>
              <span className="text-sm font-mono font-black text-slate-900 block mt-0.5">00-000-123456</span>
              <span className="text-[10px] text-slate-500 font-medium">Titular: IESTP San Francisco de Asís</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Código de Tributo Docente</span>
              <span className="text-sm font-mono font-black text-[#800521] block mt-0.5">0183 (Trámites Docentes)</span>
              <span className="text-[10px] text-slate-500 font-medium">Indicar DNI en ventanilla o App BN</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Importante:</strong> Luego de abonar la tasa en ventanilla o banca móvil, registre el número de operación y fecha abajo para su validación inmediata por MAF.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lista de Solicitudes Registradas y Seguimiento */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-3xs text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-150">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Mis Solicitudes y Expedientes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Seguimiento del estado de pago en MAF y emisión de documento digital oficial
            </p>
          </div>
          <button
            onClick={() => void reload()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#800521] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {voucherFeedback && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{voucherFeedback}</span>
          </div>
        )}

        {voucherError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{voucherError}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 uppercase">Aún no registra solicitudes de trámite</p>
            <p className="text-[11px] text-slate-400 mt-1">Seleccione un trámite en el formulario superior para iniciar una solicitud.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const isPending = item.status === 'Pendiente';
              const isValidated = item.status === 'Validado';
              const isIssued = item.deliveryStatus === 'Emitido';

              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between shadow-3xs space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{item.id}
                      </span>
                      {isValidated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Pago Validado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendiente Pago
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-tight uppercase">
                      {item.conceptName || item.conceptCode}
                    </h4>
                    <span className="text-sm font-extrabold text-[#800521] block mt-1">
                      S/ {item.amount.toFixed(2)}
                    </span>

                    {item.reason && (
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic">
                        "{item.reason}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-150 space-y-2">
                    {isIssued ? (
                      <a
                        href={serviceRequestResultUrl(item.id, teacherDni)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Documento Firmado</span>
                      </a>
                    ) : isValidated ? (
                      <p className="text-[11px] font-extrabold text-purple-700 bg-purple-50 p-2 rounded-lg border border-purple-200 text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>En Despacho de Secretaría para Firma Digital</span>
                      </p>
                    ) : (
                      <>
                        <button
                          onClick={() => startVoucher(item)}
                          className="w-full bg-slate-100 hover:bg-[#800521] text-slate-700 hover:text-white py-2 px-3 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Registrar Voucher BN</span>
                        </button>

                        {voucher.requestId === item.id && (
                          <form onSubmit={sendVoucher} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 mt-2">
                            <span className="text-[10px] font-black uppercase text-amber-900 block">Datos del Voucher</span>
                            <input
                              type="text"
                              placeholder="N° de Operación (ej: 045892)"
                              value={voucher.operationNumber}
                              onChange={(e) => setVoucher({ ...voucher, operationNumber: e.target.value })}
                              className="w-full text-xs p-2 bg-white rounded-lg border border-amber-300 font-mono font-bold"
                            />
                            <input
                              type="date"
                              value={voucher.paymentDate}
                              onChange={(e) => setVoucher({ ...voucher, paymentDate: e.target.value })}
                              className="w-full text-xs p-2 bg-white rounded-lg border border-amber-300 font-bold"
                            />
                            <button
                              type="submit"
                              disabled={voucherSaving}
                              className="w-full bg-[#800521] text-white py-1.5 rounded-lg text-[11px] font-black uppercase cursor-pointer"
                            >
                              {voucherSaving ? 'Validando...' : 'Enviar a MAF'}
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
