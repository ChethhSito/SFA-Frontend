import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { createServiceRequest, fetchServiceRequests, ServiceRequest, StudentProcedureCode, submitServiceRequestVoucher } from '../../../services/serviceRequests';

const procedures: { code: StudentProcedureCode; title: string; amount: number; why: string }[] = [
  { code: 'CER01', title: 'Certificado de Estudios Oficial', amount: 50,
    why: 'Acredita oficialmente los estudios cursados y sus calificaciones para un traslado, empleo u otro trámite.' },
  { code: 'CON01', title: 'Constancia de Matrícula Institucional', amount: 30,
    why: 'Acredita la matrícula vigente para becas, prácticas u otras gestiones que la soliciten.' },
];

export function ProceduresTab({ studentDni, period }: { studentDni: string; period: string }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const created = await createServiceRequest({ studentDni, conceptCode: selected, source: 'estudiante', period, reason: reason.trim() });
      setItems(current => [created, ...current]);
      setReason('');
      setMessage(`Solicitud ${created.id} enviada a MAF. Después de pagar, registra los datos del voucher en Mis solicitudes.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  const procedure = procedures.find(item => item.code === selected)!;
  const startVoucher = (item: ServiceRequest) => {
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    setVoucher({ requestId: item.id, operationNumber: item.paymentOperation || '', paymentDate: item.paymentDate || today, amountPaid: String(item.amountPaid || item.amount) });
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
      setVoucherFeedback('Voucher enviado a MAF. Su estado es En Proceso hasta compararlo con el reporte del banco.');
    } catch (e) {
      setVoucherError(e instanceof Error ? e.message : 'No se pudo registrar el voucher.');
    } finally {
      setVoucherSaving(false);
    }
  };
  return <section className="space-y-6">
    <header>
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><FileText className="w-6 h-6 text-[#9F062A]" /> Trámites de Secretaría</h1>
      <p className="text-sm text-slate-600 mt-2">Solicita un documento asociado a tu ficha de estudiante. La solicitud genera una obligación de pago en MAF. Después de pagar en el Banco de la Nación, registra aquí los datos de tu voucher. MAF comprobará el pago con el reporte del banco antes de validarlo.</p>
    </header>

    <div className="grid gap-4 md:grid-cols-2">
      {procedures.map(item => <div key={item.code} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-bold text-slate-900">{item.title}</p>
        <p className="text-sm text-slate-600 mt-2">{item.why}</p>
        <p className="text-sm font-bold text-[#9F062A] mt-3">Tasa: S/ {item.amount.toFixed(2)}</p>
      </div>)}
    </div>

    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 max-w-2xl">
      <h2 className="font-bold text-slate-900">Nueva solicitud</h2>
      <p className="text-xs text-slate-600">Se vinculará al DNI {studentDni}. Podrás consultar su estado aquí.</p>
      <label className="block text-sm font-semibold text-slate-700">Trámite
        <select className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 bg-white" value={selected} onChange={e => setSelected(e.target.value as StudentProcedureCode)}>
          {procedures.map(item => <option key={item.code} value={item.code}>{item.title} — S/ {item.amount.toFixed(2)}</option>)}
        </select>
      </label>
      <p className="text-sm text-slate-600">{procedure.why}</p>
      <label className="block text-sm font-semibold text-slate-700">Motivo de la solicitud (opcional)
        <textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2.5" maxLength={300} rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ejemplo: presentar en una convocatoria de beca" />
      </label>
      <button type="submit" disabled={saving} className="rounded-lg bg-[#9F062A] px-5 py-2.5 text-white font-bold disabled:opacity-60">{saving ? 'Enviando...' : 'Enviar solicitud a MAF'}</button>
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>

    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-slate-900">Mis solicitudes</h2><button onClick={() => void reload()} type="button" className="flex items-center gap-1 text-sm text-slate-700"><RefreshCw className="w-4 h-4" /> Actualizar</button></div>
      {voucherFeedback && <p role="status" className="text-sm text-emerald-700 mt-3">{voucherFeedback}</p>}
      {voucherError && <p role="alert" className="text-sm text-red-700 mt-3">{voucherError}</p>}
      {loading ? <p className="text-sm text-slate-500 mt-3">Cargando...</p> : items.length === 0 ? <p className="text-sm text-slate-500 mt-3">Aún no tienes solicitudes.</p> :
        <ul className="divide-y divide-slate-100 mt-3">{items.map(item => <li key={item.id} className="py-4 text-sm space-y-3">
          <div className="flex flex-wrap justify-between gap-2">
            <div><p className="font-semibold">{item.conceptName}</p><p className="text-xs text-slate-500">{item.id} · S/ {item.amount.toFixed(2)}</p></div>
            <span className="font-bold text-slate-700">{item.status}</span>
          </div>
          {item.paymentOperation && <p className="text-xs text-slate-600">Voucher comunicado: {item.paymentOperation}. MAF aún debe contrastarlo con el banco si el estado es En Proceso.</p>}
          {(item.status === 'Pendiente' || item.status === 'Observado') && <button type="button" onClick={() => startVoucher(item)} className="rounded-lg border border-[#9F062A] px-3 py-2 text-xs font-bold text-[#9F062A]">{item.status === 'Observado' ? 'Corregir datos del voucher' : 'Registrar mi voucher'}</button>}
          {voucher.requestId === item.id && <form onSubmit={saveVoucher} className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3 max-w-lg">
            <p className="text-xs text-slate-600">Copia los datos de tu comprobante del Banco de la Nación. Registrarlo no confirma el pago: MAF lo validará con el reporte bancario.</p>
            <label className="block text-xs font-semibold">Número de operación
              <input required maxLength={100} value={voucher.operationNumber} onChange={event => setVoucher(current => ({ ...current, operationNumber: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-semibold">Fecha de pago
                <input required type="date" value={voucher.paymentDate} onChange={event => setVoucher(current => ({ ...current, paymentDate: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" />
              </label>
              <label className="block text-xs font-semibold">Monto pagado (S/)
                <input required type="number" min="0.01" step="0.01" value={voucher.amountPaid} onChange={event => setVoucher(current => ({ ...current, amountPaid: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 p-2" />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={voucherSaving} className="rounded-lg bg-[#9F062A] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{voucherSaving ? 'Enviando...' : 'Enviar voucher a MAF'}</button>
              <button type="button" onClick={() => setVoucher({ requestId: '', operationNumber: '', paymentDate: '', amountPaid: '' })} className="text-xs text-slate-600">Cancelar</button>
            </div>
          </form>}
        </li>)}</ul>}
    </div>
  </section>;
}
