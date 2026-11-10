import { StudentFormState } from "../components/mge/mgeTypes";
import { academicToday } from "./attendance";

export function validateStudentForm(form: StudentFormState, existing: { dni: string; email: string }[], editingDni?: string) {
  const errors: Partial<Record<keyof StudentFormState, string>> = {};
  if (!/^\d{8}$/.test(form.dni.trim())) errors.dni = "Ingrese un DNI de exactamente 8 dígitos.";
  else if (!editingDni && existing.some((row) => row.dni === form.dni.trim())) errors.dni = "Este DNI ya está registrado. Abra su ficha desde el padrón.";
  if (!form.name.trim()) errors.name = "Ingrese los nombres del estudiante.";
  if (!form.lastName.trim()) errors.lastName = "Ingrese los apellidos del estudiante.";
  const email = form.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Ingrese un correo electrónico válido.";
  else if (existing.some((row) => row.dni !== editingDni && row.email?.trim().toLowerCase() === email)) errors.email = "El correo ya pertenece a otro estudiante.";
  for (const field of ["phone", "emergencyPhone"] as const) {
    const value = form[field].trim();
    if (value && (!/^\+?[\d\s()-]+$/.test(value) || !/^\d{7,15}$/.test(value.replace(/\D/g, "")))) errors[field] = "Ingrese entre 7 y 15 dígitos; puede incluir el prefijo +51.";
  }
  if (form.birthDate) {
    const date = new Date(`${form.birthDate}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== form.birthDate || form.birthDate > academicToday()) errors.birthDate = "Ingrese una fecha válida que no sea futura.";
  }
  if (!form.programId) errors.programId = "Seleccione una carrera.";
  if (!["Mañana", "Tarde", "Noche"].includes(form.shift)) errors.shift = "Seleccione un turno.";
  return errors;
}

export const normalizeStudentSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
