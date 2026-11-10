import { useEffect, useState } from 'react';
import { createServiceRequest, fetchServiceRequests, ServiceRequest, submitServiceRequestVoucher, serviceRequestResultUrl } from '../../services/serviceRequests';
import { readMafState } from '../../services/mafState';

const procedures = [
  { code: 'DOC01' as const, name: 'Constancia de Trabajo Docente', amount: 30 },
  { code: 'DOC02' as const, name: 'Certificado de Servicios Docentes', amount: 50 },
];

export default function TeacherProceduresTab({ teacherDni }: { teacherDni: string }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [code, setCode] = useState<'DOC01' | 'DOC02'>('DOC01');
  const [reason, setReason] = useState('');
  const [voucherId, setVoucherId] = useState('');
  const [operationNumber, setOperationNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const reload = async () => setItems(await fetchServiceRequests(undefined, teacherDni));
  useEffect(() => { void reload().catch(e => setMessage((e as Error).message)); }, [teacherDni]);
  useEffect(() => { void readMafState<{ code: string; amount: number }>('concepts').then(list =>
    setRates(Object.fromEntries(list.map(item => [item.code, item.amount])))).catch(() => {}); }, []);
  const submit = async () => {
    setBusy(true);
    try {
      await createServiceRequest({ teacherDni, conceptCode: code, source: 'docente', reason });
      setReason(''); await reload(); setMessage('Solicitud enviada a MAF. Registre el voucher después de pagar en el Banco de la Nación.');
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  const voucher = async (item: ServiceRequest) => {
    setBusy(true);
    try {
      await submitServiceRequestVoucher(item.id, { teacherDni, operationNumber, paymentDate, amountPaid: item.amount });
      setVoucherId(''); setOperationNumber(''); await reload(); setMessage('Voucher enviado. MAF lo comparará con el reporte bancario.');
    } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  return <section className="space-y-5 text-left">
    <header><h1 className="text-xl font-black">Trámites docentes</h1><p className="text-sm text-slate-600">Solicite un documento y consulte aquí su estado. MAF solo verifica el pago; Secretaría emite el resultado.</p></header>
    <div className="rounded-xl border bg-white p-5 space-y-3 max-w-2xl">
      <label className="block text-sm font-bold">Trámite<select value={code} onChange={e => setCode(e.target.value as typeof code)} className="mt-1 block w-full rounded border p-2">{procedures.map(p => <option key={p.code} value={p.code}>{p.name} · S/ {rates[p.code] || p.amount}</option>)}</select></label>
      <label className="block text-sm font-bold">Motivo<textarea maxLength={300} value={reason} onChange={e => setReason(e.target.value)} className="mt-1 block w-full rounded border p-2" /></label>
      <button disabled={busy} onClick={() => void submit()} className="rounded bg-[#8B0026] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Enviar solicitud</button>
    </div>
    {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
    <div className="rounded-xl border bg-white p-5"><div className="flex justify-between"><h2 className="font-bold">Mis trámites</h2><button onClick={() => void reload().catch(e => setMessage((e as Error).message))} className="text-sm underline">Actualizar</button></div>
      {items.map(item => <div key={item.id} className="border-b py-4 text-sm"><p className="font-bold">{item.conceptName} · S/ {item.amount}</p><p>Estado del pago: {item.status}</p>
        {item.status === 'Validado' && item.deliveryStatus !== 'Emitido' && <p className="text-emerald-700">Pago validado. Documento pendiente de emisión por Secretaría.</p>}
        {item.deliveryStatus === 'Emitido' && <a href={serviceRequestResultUrl(item.id, teacherDni)} className="block font-bold text-[#8B0026] underline">Descargar documento: {item.resultFileName || 'PDF'}</a>}
        {(item.status === 'Pendiente' || item.status === 'Observado') && <button onClick={() => { setVoucherId(item.id); setPaymentDate(new Date().toISOString().slice(0, 10)); }} className="mt-2 text-[#8B0026] underline">Registrar voucher</button>}
        {voucherId === item.id && <div className="mt-3 flex flex-wrap gap-2"><input aria-label="Número de operación" placeholder="Número de operación" value={operationNumber} onChange={e => setOperationNumber(e.target.value)} className="rounded border p-2" /><input aria-label="Fecha del pago" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="rounded border p-2" /><button disabled={busy || !operationNumber || !paymentDate} onClick={() => void voucher(item)} className="rounded bg-[#8B0026] px-3 py-2 text-white disabled:opacity-50">Enviar</button></div>}
      </div>)}{!items.length && <p className="mt-3 text-sm text-slate-500">Aún no hay trámites.</p>}
    </div>
  </section>;
}
