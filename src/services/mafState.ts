const base = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:3001';
type Key = 'concepts' | 'obligations' | 'auditLogs';

export async function readMafState<T>(key: Key): Promise<T[]> {
  const response = await fetch(`${base}/maf-state/${key}`);
  if (!response.ok) throw new Error(`No se pudo cargar ${key} desde MongoDB.`);
  return (await response.json()).items as T[];
}

export async function saveMafState<T>(key: Key, items: T[]): Promise<void> {
  const response = await fetch(`${base}/maf-state/${key}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }),
  });
  if (!response.ok) throw new Error(`No se pudo guardar ${key} en MongoDB.`);
}
