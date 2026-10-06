import { readSheet } from 'read-excel-file/browser';
import type { MafObligation } from './mafTypes';

export interface BankRow {
  operation: string;
  date: string;
  conceptCode: string;
  concept: string;
  dni: string;
  payer: string;
  amount: number;
}

export interface ReconciliationResult {
  row: number;
  operation: string;
  dni: string;
  amount: number;
  status: string;
  detail: string;
  obligationId?: string;
}

export interface ReconciliationPreview {
  fingerprint: string;
  total: number;
  matches: number;
  results: ReconciliationResult[];
}

export async function parseBankReport(file: File): Promise<BankRow[]> {
  if (!/\.xlsx$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
    throw new Error('Seleccione un archivo .xlsx de hasta 10 MB.');
  }
  const sheet = await readSheet(file);
  const header = sheet.findIndex(row => String(row[1] ?? '').trim().includes('Operación') && String(row[10] ?? '').includes('Monto'));
  if (header < 0) throw new Error('No se encontraron las columnas del reporte consolidado del Banco de la Nación.');
  const values = sheet.slice(header + 1).filter(row => row.some(cell => cell !== null && cell !== ''));
  if (!values.length || values.length > 5000) throw new Error('El reporte debe tener entre 1 y 5000 pagos.');
  return values.map((row, index) => {
    const rawDate = row[2];
    const date = rawDate instanceof Date ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}` : String(rawDate ?? '').slice(0, 10);
    const parsed: BankRow = {
      operation: String(row[1] ?? '').trim(), date,
      conceptCode: String(row[4] ?? '').trim().padStart(5, '0'),
      concept: String(row[5] ?? '').trim(), dni: String(row[7] ?? '').trim(),
      payer: String(row[8] ?? '').trim(), amount: Number(row[10]),
    };
    if (!parsed.operation || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date) || !/^\d{5}$/.test(parsed.conceptCode) ||
      !/^\d{8}$/.test(parsed.dni) || !Number.isFinite(parsed.amount) || parsed.amount <= 0) {
      throw new Error(`La fila ${header + index + 2} tiene datos incompletos o inválidos.`);
    }
    return parsed;
  });
}

export async function bankReconciliationRequest<T>(action: 'preview' | 'confirm', fileName: string, rows: BankRow[], obligations: MafObligation[], preview?: ReconciliationPreview): Promise<T> {
  const base = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:3001';
  const response = await fetch(`${base}/bank-reconciliation/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, rows, obligations,
      expectedFingerprint: preview?.fingerprint,
      expectedObligationIds: preview?.results.filter(r => r.status === 'coincide').map(r => r.obligationId),
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || `Error del servidor (${response.status}).`);
  }
  return response.json() as Promise<T>;
}
