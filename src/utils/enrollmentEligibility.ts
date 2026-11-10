import { ProcessedStudent } from "../components/mge/mgeTypes";

export function enrollmentBlockers(student: ProcessedStudent): string[] {
  const reasons: string[] = [];
  if (student.active === false) reasons.push("Reactive al estudiante desde el padrón.");
  if (!student.enrolled) reasons.push("Cree el registro de admisión desde la ficha del estudiante.");
  if (!student.programId) reasons.push("Asigne una carrera.");
  if (!["Mañana", "Tarde", "Noche"].includes(student.shift)) reasons.push("Asigne un turno.");
  if (student.paymentStatus !== "Validado") reasons.push(student.paymentStatus === "Observado" ? "El pago está observado. Revíselo en Pagos de Matrícula." : "Valide el pago en Pagos de Matrícula.");
  return reasons;
}
