import { Enrollment } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:3001';

export async function saveCourseRegistration(studentDni: string, items: { courseId: string; groupId: string }[]): Promise<Enrollment> {
  const response = await fetch(`${API_BASE_URL}/enrollments/${encodeURIComponent(studentDni)}/courses`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message || `Error HTTP ${response.status}`);
  }
  return response.json() as Promise<Enrollment>;
}
