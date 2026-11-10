import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, History } from 'lucide-react';
import type { MafObligation } from './mafTypes';
import { bankReconciliationRequest, downloadImportFile, fetchImportHistory, fileToBase64, parseBankReport } from './bankReport';
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
  const [history, setHistory] = useState<Array<{
    fingerprint: string;
    fileName: string;
    importedAt: string;
    validatedObligationIds: string[];
    fileSizeBytes?: number;
  }>>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await fetchImportHistory();
      setHistory(data);
    } catch {
      // ignore
    }
  }

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
      const fileBase64 = await fileToBase64(file);
      const result = await bankReconciliationRequest<{ validatedObligationIds: string[]; repeated: boolean }>(
        'confirm',
        file.name,
        rows,
        obligations,
        preview,
        {
          fileBase64,
          fileMimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileSizeBytes: file.size,
        }
      );
      onConfirmed(result.validatedObligationIds, file.name);
      setMessage(result.repeated ? 'Este reporte ya se había importado. Se recuperó el resultado anterior.' :
        `Reporte consolidado guardado en MongoDB con custodia de archivo original (.xlsx). ${result.validatedObligationIds.length} pago(s) validado(s) y matrícula vinculada.`);
      setPreview(null);
      void loadHistory();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  async function handleDownload(fingerprint: string, name: string) {
    setDownloading(fingerprint);
    try {
      await downloadImportFile(fingerprint, name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDownloading(null);
    }
  }

  return <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
    <div>
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-[#800521]" />
        Conciliación con reporte bancario y custodia de archivos (.xlsx)
      </h3>
      <p className="text-sm text-slate-600 mt-1">
        Suba el consolidado .xlsx oficial del Banco de la Nación. El sistema valida los datos, custodia el archivo binario para auditoría fiscal y formaliza automáticamente la matrícula en Ciclo I de los postulantes admitidos.
      </p>
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
        <button type="button" disabled={busy} onClick={() => void confirm()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Confirmar, custodiar archivo e importar</button>
      </div>
      <div className="max-h-80 overflow-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-100"><tr><th className="p-2">Fila</th><th className="p-2">Operación</th><th className="p-2">DNI</th><th className="p-2">Monto</th><th className="p-2">Resultado</th><th className="p-2">Detalle</th></tr></thead>
          <tbody>{preview.results.map(r => <tr key={r.row} className="border-t border-slate-100"><td className="p-2">{r.row}</td><td className="p-2">{r.operation}</td><td className="p-2">{r.dni}</td><td className="p-2">S/ {r.amount.toFixed(2)}</td><td className={`p-2 font-bold ${r.status === 'coincide' ? 'text-emerald-700' : 'text-amber-700'}`}>{labels[r.status] || r.status}</td><td className="p-2">{r.detail}</td></tr>)}</tbody>
        </table>
      </div>
    </>}

    {/* Archivos Originales Custodiados para Auditoría Fiscal */}
    {history.length > 0 && (
      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-[#800521]" />
          Archivos Originales Custodiados en Servidor (Auditoría Fiscal)
        </h4>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          {history.map(item => (
            <div key={item.fingerprint} className="p-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">{item.fileName}</p>
                  <p className="text-[10px] text-slate-400">
                    Importado: {new Date(item.importedAt).toLocaleString('es-PE')} • {item.validatedObligationIds.length} pago(s) validado(s) {item.fileSizeBytes ? `• ${(item.fileSizeBytes / 1024).toFixed(1)} KB` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload(item.fingerprint, item.fileName)}
                disabled={downloading === item.fingerprint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#800521] text-slate-700 hover:text-[#800521] text-xs font-bold transition-all bg-white shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === item.fingerprint ? 'Descargando...' : 'Descargar Original'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </section>;
}
