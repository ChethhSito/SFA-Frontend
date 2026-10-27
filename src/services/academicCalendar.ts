import { fileToBase64 } from './api';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:3001';

export type CalendarEventType = 'Feriado' | 'Actividad' | 'Aviso';

export interface AcademicCalendarEvent {
  id: string;
  date: string;
  type: CalendarEventType;
  title: string;
  description: string;
}

export interface AcademicCalendarData {
  periodId: string;
  events: AcademicCalendarEvent[];
  hasImage: boolean;
  imageFileName: string | null;
  imageUpdatedAt: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/academic-calendar${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.message === 'string' ? body.message : `Error del servidor (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function fetchAcademicCalendar(periodId: string): Promise<AcademicCalendarData> {
  return request<AcademicCalendarData>(`/${encodeURIComponent(periodId)}`);
}

export function saveAcademicCalendarEvents(periodId: string, events: AcademicCalendarEvent[]): Promise<AcademicCalendarData> {
  return request<AcademicCalendarData>(`/${encodeURIComponent(periodId)}/events`, {
    method: 'PUT', body: JSON.stringify({ events }),
  });
}

export async function uploadAcademicCalendarImage(periodId: string, file: File): Promise<AcademicCalendarData> {
  return request<AcademicCalendarData>(`/${encodeURIComponent(periodId)}/image`, {
    method: 'PUT', body: JSON.stringify({ fileName: file.name, mimeType: file.type, contentBase64: await fileToBase64(file) }),
  });
}

export function deleteAcademicCalendarImage(periodId: string): Promise<AcademicCalendarData> {
  return request<AcademicCalendarData>(`/${encodeURIComponent(periodId)}/image`, { method: 'DELETE' });
}

export function academicCalendarImageUrl(periodId: string, updatedAt?: string | null): string {
  const version = updatedAt ? `?v=${encodeURIComponent(updatedAt)}` : '';
  return `${API_BASE_URL}/academic-calendar/${encodeURIComponent(periodId)}/image${version}`;
}
