const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:3001';

export type StudentProcedureCode = 'CER01' | 'CON01';
export type ServiceConceptCode = StudentProcedureCode | 'ADM01' | 'MAT01' | 'SUB01' | 'CAR01' | 'DOC01' | 'DOC02';

export interface ServiceRequest {
  id: string;
  studentDni: string;
  teacherDni?: string;
  studentName: string;
  conceptCode: ServiceConceptCode;
  conceptName: string;
  amount: number;
  period: string;
  source: 'estudiante' | 'docente' | 'llamada_apoderado';
  requestedBy?: string;
  contactPhone?: string;
  reason: string;
  status: 'Pendiente' | 'En Proceso' | 'Validado' | 'Observado';
  paymentOperation?: string;
  paymentDate?: string;
  amountPaid?: number;
  bankName?: string;
  deliveryStatus?: 'Pendiente' | 'Emitido';
  resultFileName?: string;
  createdAt: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.message === 'string' ? body.message : `Error del servidor (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function fetchServiceRequests(studentDni?: string, teacherDni?: string): Promise<ServiceRequest[]> {
  const query = studentDni ? `?studentDni=${encodeURIComponent(studentDni)}` : teacherDni ? `?teacherDni=${encodeURIComponent(teacherDni)}` : '';
  return request<ServiceRequest[]>(`/service-requests${query}`);
}

export function createServiceRequest(input: {
  studentDni?: string;
  teacherDni?: string;
  conceptCode: ServiceConceptCode;
  source: 'estudiante' | 'docente' | 'llamada_apoderado';
  period?: string;
  reason?: string;
  requestedBy?: string;
  contactPhone?: string;
}): Promise<ServiceRequest> {
  return request<ServiceRequest>('/service-requests', { method: 'POST', body: JSON.stringify(input) });
}

export function submitServiceRequestVoucher(id: string, input: {
  studentDni?: string; teacherDni?: string; operationNumber: string; paymentDate: string; amountPaid: number;
}): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/service-requests/${encodeURIComponent(id)}/voucher`, {
    method: 'POST', body: JSON.stringify(input),
  });
}

export function updateServiceRequestPayment(id: string, payment: {
  status: ServiceRequest['status']; paymentOperation?: string; paymentDate?: string; amountPaid?: number; bankName?: string;
}): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/service-requests/${encodeURIComponent(id)}/payment`, {
    method: 'PATCH', body: JSON.stringify(payment),
  });
}

export async function deliverServiceRequestResult(id: string, file: File): Promise<ServiceRequest> {
  const form = new FormData(); form.append('file', file);
  const response = await fetch(`${API_BASE_URL}/service-requests/${encodeURIComponent(id)}/result`, { method: 'POST', body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Error del servidor (${response.status}).`);
  }
  return response.json() as Promise<ServiceRequest>;
}

export function serviceRequestResultUrl(id: string, dni: string): string {
  return `${API_BASE_URL}/service-requests/${encodeURIComponent(id)}/result?dni=${encodeURIComponent(dni)}`;
}
