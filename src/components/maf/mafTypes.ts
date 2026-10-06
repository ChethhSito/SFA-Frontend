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
  discount: number; // For exonerations / scholarships
  finalAmount: number;
  period: string;
  status: "Pendiente" | "En Proceso" | "Validado" | "Observado" | "Exonerado";
  dateCreated: string;
  voucherRegistered?: boolean;
  voucherDetails?: {
    operationNumber: string;
    bankName: string;
    paymentDate: string;
    amountPaid: number;
    observations?: string;
  };
}

export interface MafExoneration {
  id: string;
  studentDni: string;
  studentName: string;
  type: "Beca Integral (100%)" | "Media Beca (50%)" | "Exoneración por Convenio" | "Caso Social";
  percentage: number; // 50 or 100
  reason: string;
  dateGranted: string;
  conceptCode: string; // Exoneration applied to specific concept (e.g. MATRICULA)
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
