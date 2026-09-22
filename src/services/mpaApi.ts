const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

export const MPA_KEYS = ["periods", "careers", "courses", "curriculum", "curriculum_versions", "shifts", "schedules", "classrooms", "groups", "teachers", "tasks"] as const;
export type MpaKey = (typeof MPA_KEYS)[number];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/mpa${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(Array.isArray(error.message) ? error.message.join(", ") : error.message || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchMpaCollections(): Promise<Record<MpaKey, Record<string, unknown>[]>> {
  return request<Record<MpaKey, Record<string, unknown>[]>>("");
}

export function fetchMpaCollection<T>(key: MpaKey): Promise<T[]> {
  return request<T[]>(`/${key}`);
}

export function saveMpaCollection<T>(key: MpaKey, items: T[]): Promise<T[]> {
  return request<T[]>(`/${key}`, { method: "PUT", body: JSON.stringify({ items }) }).then((saved) => {
    if (key === "careers" || key === "courses") window.dispatchEvent(new Event("mpa:catalog-changed"));
    return saved;
  });
}
