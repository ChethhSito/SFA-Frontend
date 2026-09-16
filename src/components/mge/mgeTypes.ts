import { ProgramId } from "../../types";

export type MgeSubTab =
  | "estudiantes"
  | "matricula_gral"
  | "pagos"
  | "notas"
  | "asistencias"
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
  programId: ProgramId;
  shift: "Mañana" | "Tarde" | "Noche";
}

export const defaultStudentForm: StudentFormState = {
  dni: "",
  name: "",
  lastName: "",
  birthDate: "2002-05-15",
  gender: "Masculino",
  email: "",
  phone: "",
  address: "",
  district: "San Juan de Lurigancho",
  province: "Lima",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "Padre/Madre",
  programId: "sistemas",
  shift: "Mañana",
};

export interface ProcessedStudent {
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
