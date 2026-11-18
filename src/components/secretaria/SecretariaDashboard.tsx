import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, RefreshCw, Search, Upload } from 'lucide-react';
import Sidebar from '../ui/Sidebar';
import { deliverServiceRequestResult, fetchSecretaryQueue, serviceRequestResultUrl, type ServiceRequest } from '../../services/serviceRequests';

type View = 'pending' | 'issued';
const PAGE_SIZE = 10;

export default function SecretariaDashboard({ onLogout, onGoToPortal }: { onLogout: () => void; onGoToPortal: () => void }) {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [view, setView] = useState<View>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busyId, setBusyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    setError('');
    try { setItems(await fetchSecretaryQueue()); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la bandeja.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  const pending = items.filter(item => item.status === 'Validado' && item.deliveryStatus !== 'Emitido');
  const issued = items.filter(item => item.deliveryStatus === 'Emitido');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (view === 'pending' ? pending : issued).filter(item =>
      !q || [item.id, item.studentDni, item.teacherDni, item.studentName, item.conceptName, item.conceptCode]
        .some(value => String(value || '').toLowerCase().includes(q)));
  }, [items, view, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((Math.min(page, pageCount) - 1) * PAGE_SIZE, Math.min(page, pageCount) * PAGE_SIZE);

  const upload = async (item: ServiceRequest) => {
    const file = files[item.id];
    if (!file || file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf') || file.size < 5 || file.size > 5_000_000) {
      setError('Seleccione un PDF válido de hasta 5 MB.'); return;
    }
    setBusyId(item.id); setError(''); setNotice('');
    try {
      await deliverServiceRequestResult(item.id, file);
      setFiles(previous => ({ ...previous, [item.id]: null }));
      setNotice(`Documento emitido para ${item.studentName}. Ya está disponible en Mis trámites.`);
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo emitir el documento.'); }
    finally { setBusyId(''); }
  };

  return <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-slate-50 text-slate-800">
    <Sidebar institution={{ name: 'IESTP SFA', subtitle: 'Secretaría Académica' }}
      user={{ name: 'Gestor de Secretaría', role: 'Emisión de trámites', status: 'Activo' }}
      sections={[{ title: 'Trámites', items: [
        { label: `Pendientes de emisión (${pending.length})`, icon: <FileText size={16}/>, route: 'pending', active: view === 'pending' },
        { label: `Documentos emitidos (${issued.length})`, icon: <CheckCircle2 size={16}/>, route: 'issued', active: view === 'issued' },
      ] }]}
      onItemClick={route => { setView(route as View); setPage(1); setNotice(''); }}
      onLogout={onLogout} onGoToPortal={onGoToPortal}/>
    <main className="flex-1 min-w-0 overflow-y-auto p-5 md:p-8 space-y-5">
      <header className="rounded-xl bg-[#800521] text-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Secretaría Académica</p>
        <h1 className="text-2xl font-black mt-1">Emisión de documentos solicitados</h1>
        <p className="text-sm text-white/85 mt-2">Reciba trámites de alumnos y docentes tras la validación del pago por MAF. Adjunte el PDF institucional para entregarlo en Mis trámites.</p>
      </header>
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <label className="relative flex-1 max-w-md"><Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
          <input aria-label="Buscar trámite" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por DNI, solicitud o concepto" className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm"/>
        </label>
        <button onClick={() => { setLoading(true); void reload(); }} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold inline-flex gap-2 items-center"><RefreshCw size={16}/> Actualizar</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">{notice}</p>}
      {loading ? <p className="text-sm">Cargando trámites…</p> : shown.length === 0 ?
        <p className="rounded-xl border bg-white p-8 text-center text-slate-500">No hay trámites {view === 'pending' ? 'validados pendientes de emisión' : 'emitidos'}.</p> :
        <div className="space-y-3">{shown.map(item => <article key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3">
            <div><p className="text-xs font-mono text-slate-500">{item.id}</p><h2 className="font-bold text-lg">{item.conceptName}</h2>
              <p className="text-sm">{item.studentName} · DNI {item.teacherDni || item.studentDni} · {item.source === 'docente' ? 'Docente' : 'Alumno'}</p></div>
            <span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${item.deliveryStatus === 'Emitido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{item.deliveryStatus === 'Emitido' ? 'Emitido' : 'Pago validado'}</span>
          </div>
          <p className="text-sm text-slate-600 mt-3">Motivo: {item.reason || 'Sin descripción adicional'}</p>
          <p className="text-xs text-slate-500 mt-2">Operación: {item.paymentOperation || '—'} · Importe: S/ {Number(item.amountPaid || item.amount).toFixed(2)}</p>
          {item.deliveryStatus === 'Emitido' ? <div className="mt-4 text-sm">
            <a className="font-bold text-[#800521] underline" href={serviceRequestResultUrl(item.id, item.teacherDni || item.studentDni)}>Descargar {item.resultFileName || 'PDF emitido'}</a>
            {item.deliveredAt && <span className="ml-3 text-slate-500">Emitido: {new Date(item.deliveredAt).toLocaleString('es-PE')}</span>}
          </div> : <div className="mt-4 border-t pt-4 space-y-3">
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 sm:p-5 focus-within:border-[#800521]">
              <input id={`pdf-${item.id}`} aria-describedby={`pdf-help-${item.id}`} type="file" accept=".pdf,application/pdf"
                onChange={e => setFiles(previous => ({ ...previous, [item.id]: e.target.files?.[0] || null }))}
                className="sr-only"/>
              <label htmlFor={`pdf-${item.id}`} className="flex cursor-pointer flex-col items-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#800521] shadow-sm"><Upload size={20}/></span>
                <span className="font-bold text-sm text-slate-800">{files[item.id] ? 'Cambiar PDF seleccionado' : 'Seleccione el documento PDF'}</span>
                <span className="rounded-lg border border-[#800521] bg-white px-3 py-1.5 text-xs font-bold text-[#800521]">Elegir archivo</span>
              </label>
              <p id={`pdf-help-${item.id}`} className="mt-2 text-center text-xs text-slate-500">Solo PDF · máximo 5 MB</p>
              {files[item.id] && <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700" role="status">Archivo seleccionado: {files[item.id]?.name}</p>}
            </div>
            <button disabled={!files[item.id] || !!busyId} onClick={() => void upload(item)} className="rounded-lg bg-[#800521] px-4 py-2 text-white text-sm font-bold disabled:opacity-50 inline-flex gap-2 items-center"><Upload size={15}/>{busyId === item.id ? 'Emitiendo…' : 'Emitir documento'}</button>
          </div>}
        </article>)}</div>}
      <nav aria-label="Páginas de trámites" className="flex items-center justify-end gap-3 text-sm">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-50">Anterior</button>
        <span>Página {Math.min(page, pageCount)} de {pageCount}</span>
        <button disabled={page >= pageCount} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Siguiente</button>
      </nav>
    </main>
  </div>;
}
