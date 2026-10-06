import { useState } from 'react';
import type { MafObligation } from './mafTypes';
import { bankReconciliationRequest, parseBankReport } from './bankReport';
import type { BankRow, ReconciliationPreview } from './bankReport';

interface Props {
  obligations: MafObligation[];
  onConfirmed: (ids: string[], fileName: string) => void;
}

const labels: Record<string, string> = {
  coincide: 'Coincide', duplicado: 'Duplicado', sin_mapeo: 'Sin mapeo',
  sin_voucher: 'Sin voucher', ambiguo: 'Ambiguo', ya_validado: 'Ya validado',
  estado_invalido: 'Estado no apto', diferencia: 'Diferencia',
  ya_importado: 'Ya importado', conflicto: 'Conflicto',
};

export function BankReconciliationPanel({ obligations, onConfirmed }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<BankRow[]>([]);
  const [preview, setPreview] = useState<ReconciliationPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function selectFile(selected?: File) {
    setFile(selected || null); setRows([]); setPreview(null); setMessage(''); setError('');
    if (!selected) return;
    try { setRows(await parseBankReport(selected)); }
    catch (e) { setError((e as Error).message); }
  }

  async function runPreview() {
    if (!file || !rows.length) return;
    setBusy(true); setError(''); setMessage('');
    try { setPreview(await bankReconciliationRequest<ReconciliationPreview>('preview', file.name, rows, obligations)); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  async function confirm() {
    if (!file || !preview) return;
    setBusy(true); setError('');
    try {
      const result = await bankReconciliationRequest<{ validatedObligationIds: string[]; repeated: boolean }>('confirm', file.name, rows, obligations, preview);
      onConfirmed(result.validatedObligationIds, file.name);
      setMessage(result.repeated ? 'Este reporte ya se había importado. Se recuperó el resultado anterior.' :
        `Reporte guardado en MongoDB. ${result.validatedObligationIds.length} pago(s) validado(s).`);
      setPreview(null);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  return <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
    <div>
      <h3 className="font-bold text-slate-900">Conciliación con reporte bancario</h3>
      <p className="text-sm text-slate-600">Suba el consolidado .xlsx, revise cada resultado y confirme las coincidencias. Las tasas sin equivalencia y los datos diferentes quedan para revisión.</p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <input aria-label="Reporte bancario Excel" type="file" accept=".xlsx" onChange={e => void selectFile(e.target.files?.[0])} className="text-sm" />
      <button type="button" disabled={!rows.length || busy} onClick={() => void runPreview()} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Comparar {rows.length ? `${rows.length} pagos` : ''}</button>
    </div>
    {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
    {message && <p role="status" className="text-sm font-semibold text-emerald-700">{message}</p>}
    {preview && <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">{preview.matches} coincidencias de {preview.total} pagos. {preview.total - preview.matches} requieren revisión.</p>
        <button type="button" disabled={busy} onClick={() => void confirm()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Confirmar e importar</button>
      </div>
      <div className="max-h-80 overflow-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-100"><tr><th className="p-2">Fila</th><th className="p-2">Operación</th><th className="p-2">DNI</th><th className="p-2">Monto</th><th className="p-2">Resultado</th><th className="p-2">Detalle</th></tr></thead>
          <tbody>{preview.results.map(r => <tr key={r.row} className="border-t border-slate-100"><td className="p-2">{r.row}</td><td className="p-2">{r.operation}</td><td className="p-2">{r.dni}</td><td className="p-2">S/ {r.amount.toFixed(2)}</td><td className={`p-2 font-bold ${r.status === 'coincide' ? 'text-emerald-700' : 'text-amber-700'}`}>{labels[r.status] || r.status}</td><td className="p-2">{r.detail}</td></tr>)}</tbody>
        </table>
      </div>
    </>}
  </section>;
}
