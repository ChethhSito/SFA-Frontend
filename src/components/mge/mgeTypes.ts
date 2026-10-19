import { ProgramId } from "../../types";

export type MgeSubTab =
  | "estudiantes"
  | "matricula_gral"
  | "pagos"
  | "notas"
  | "asistencias"
  | "riesgo_ia"
  | "historial"
  | "constancias"
  | "reportes";

export interface StudentFormState {
  dni: string;
  name: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  programId: ProgramId | "";
  shift: "" | "Mañana" | "Tarde" | "Noche";
}

export const defaultStudentForm: StudentFormState = {
  dni: "",
  name: "",
  lastName: "",
  birthDate: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  district: "",
  province: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  programId: "",
  shift: "",
};

export interface ProcessedStudent {
  active?: boolean;
  deactivatedAt?: string | null;
  deactivationReason?: string;
  dni: string;
  name: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  email: string;
  phone?: string;
  address?: string;
  district?: string;
  province?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  enrolled: boolean;
  academicStatus: string;
  programId: string;
  shift: string;
  paymentStatus: string;
}
