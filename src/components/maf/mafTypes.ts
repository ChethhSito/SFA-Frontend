export interface MafConcept {
  id: string;
  code: string;
  name: string;
  amount: number;
  description: string;
  category: "Admisión" | "Matrícula" | "Servicios" | "Trámites";
  active: boolean;
}

export interface MafObligation {
  id: string;
  studentDni: string;
  studentName: string;
  conceptCode: string;
  conceptName: string;
  amount: number;
  discount: number;
  finalAmount: number;
  period: string;
  status: "Pendiente" | "En Proceso" | "Validado" | "Observado";
  dateCreated: string;
  createdAt?: string;
  voucherRegisteredAt?: string;
  source?: "estudiante" | "docente" | "llamada_apoderado";
  requestReason?: string;
  requestedBy?: string;
  contactPhone?: string;
  deliveryStatus?: 'Pendiente' | 'Emitido';
  resultFileName?: string;
  voucherRegistered?: boolean;
  voucherDetails?: {
    operationNumber: string;
    bankName: string;
    paymentDate: string;
    amountPaid: number;
    observations?: string;
  };
}

export interface MafAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  type: "success" | "warning" | "info" | "danger";
}

export interface SupportTicket {
  id: string;
  sender: string;
  dni: string;
  topic: string;
  date: string;
  status: string;
  detail: string;
}
