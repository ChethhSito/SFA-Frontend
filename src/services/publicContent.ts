const base = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:3001";

export interface PublicCareer { id: string; code?: string; name: string; description?: string; durationSemesters?: number }
export interface PublicCourse { id: string; name: string; careerId?: string; referenceCycle?: number }
export interface PublicCurriculumItem { careerId: string; courseId: string; versionId?: string; cycle: number }
export interface PublicFee { id?: string; code?: string; name?: string; concept?: string; amount?: number; price?: number; status?: string; active?: boolean }
export interface PublicCatalog {
  careers: PublicCareer[];
  courses: PublicCourse[];
  versions: { id: string; careerId: string; name?: string }[];
  items: PublicCurriculumItem[];
  fees: PublicFee[];
}
export interface TransparencyDocument { id: string; title: string; description?: string; code?: string; url: string; publishedAt?: string }

export async function fetchPublicCatalog(): Promise<PublicCatalog> {
  const response = await fetch(`${base}/public-content/catalog`);
  if (!response.ok) throw new Error("No se pudo cargar el catálogo institucional.");
  return response.json();
}

export async function fetchTransparencyDocuments(): Promise<TransparencyDocument[]> {
  const response = await fetch(`${base}/public-content/transparency`);
  if (!response.ok) throw new Error("No se pudo cargar Transparencia.");
  return response.json();
}

export async function sendPublicInquiry(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
  const response = await fetch(`${base}/public-content/contact`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("No se pudo registrar la consulta.");
}
