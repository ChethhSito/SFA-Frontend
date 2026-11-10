import React, { useEffect, useRef, useState } from "react";
import { X, UserRound, Contact, GraduationCap, HeartPulse, Loader2 } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { StudentFormState } from "../mgeTypes";
import { validateStudentForm } from "../../../utils/studentFormValidation";
import { academicToday } from "../../../utils/attendance";
import ConfirmModal from "../../ui/ConfirmModal";

export interface StudentDetailsProps {
  saving: boolean;
  studentForm: StudentFormState;
  existingStudents: { dni: string; email: string }[];
  editingStudentDni?: string;
  onFormChange: (form: StudentFormState) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}

export default function StudentDetailsModal({ saving, studentForm: form, existingStudents, editingStudentDni, onFormChange, onSubmit, onClose }: StudentDetailsProps) {
  const { programs } = useAcademicCatalog();
  const [initial] = useState(() => ({ ...form }));
  const [touched, setTouched] = useState<Partial<Record<keyof StudentFormState, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [discard, setDiscard] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const academicChanged = !!editingStudentDni && (form.programId !== initial.programId || form.shift !== initial.shift);
  const errors = validateStudentForm(form, existingStudents, editingStudentDni);
  const requestClose = () => { if (!saving) { if (dirty) setDiscard(true); else onClose(); } };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLElement>("input, button")?.focus();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    if (!discard) return;
    const previous = document.activeElement as HTMLElement | null;
    document.getElementById("confirm-modal-title")?.closest('[role="dialog"]')?.querySelector<HTMLElement>("button")?.focus();
    return () => previous?.focus();
  }, [discard]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !discard) { event.preventDefault(); requestClose(); }
      if (event.key === "Tab") {
        const scope = discard ? document.getElementById("confirm-modal-title")?.closest('[role="dialog"]') : dialog.current;
        const controls = Array.from(scope?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)') || []) as HTMLElement[];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dirty, saving, discard, onClose]);
  const showError = (key: keyof StudentFormState) => (attempted || touched[key]) ? errors[key] : undefined;
  const set = (key: keyof StudentFormState, value: string) => onFormChange({ ...form, [key]: value });
  const controlClass = (key: keyof StudentFormState) => `mt-1.5 block w-full rounded-lg border px-3 py-2.5 text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-100 ${showError(key) ? "border-red-400" : "border-slate-300 focus:border-[#9F062A]"}`;
  const field = (key: keyof StudentFormState, label: string, type = "text", required = false) => <label className="block text-sm font-medium text-slate-700" htmlFor={`student-${key}`}>{label}{required ? <span className="text-[#9F062A]"> *</span> : null}<input id={`student-${key}`} name={key} type={type} value={form[key]} required={required} max={type === "date" ? academicToday() : undefined} maxLength={key === "dni" ? 8 : type === "tel" ? 25 : 200} inputMode={key === "dni" ? "numeric" : undefined} onChange={(event) => set(key, event.target.value)} onBlur={() => setTouched((prev) => ({ ...prev, [key]: true }))} aria-invalid={!!showError(key)} aria-describedby={showError(key) ? `student-${key}-error` : undefined} className={controlClass(key)} />{showError(key) ? <span id={`student-${key}-error`} className="mt-1 block text-xs text-red-700">{showError(key)}</span> : null}</label>;
  const select = (key: "gender" | "programId" | "shift", label: string, options: { value: string; label: string }[], required = false) => <label className="block text-sm font-medium text-slate-700" htmlFor={`student-${key}`}>{label}{required ? <span className="text-[#9F062A]"> *</span> : null}<select id={`student-${key}`} required={required} value={form[key]} onChange={(event) => set(key, event.target.value)} onBlur={() => setTouched((prev) => ({ ...prev, [key]: true }))} aria-invalid={!!showError(key)} aria-describedby={showError(key) ? `student-${key}-error` : undefined} className={controlClass(key)}><option value="">Seleccione una opción</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{showError(key) ? <span id={`student-${key}-error`} className="mt-1 block text-xs text-red-700">{showError(key)}</span> : null}</label>;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setAttempted(true);
    if (Object.keys(errors).length) { event.currentTarget.querySelector<HTMLElement>(`#student-${Object.keys(errors)[0]}`)?.focus(); return; }
    onSubmit(event);
  };
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs" onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="student-details-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5"><div><h2 id="student-details-title" className="text-lg font-bold text-slate-900">{editingStudentDni ? "Ficha del estudiante" : "Registrar estudiante"}</h2><p className="mt-1 text-sm text-slate-500">{editingStudentDni ? `${initial.lastName}, ${initial.name} · DNI ${editingStudentDni}` : "Complete los datos para crear la ficha y el registro de admisión."}</p></div><button type="button" disabled={saving} aria-label="Cerrar ficha" onClick={requestClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X className="h-5 w-5" /></button></header>
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="overflow-y-auto px-6 py-5"><p className="mb-5 text-xs text-slate-500">Los campos con <span className="text-[#9F062A]">*</span> son obligatorios.</p>
          <fieldset disabled={saving} className="space-y-6">
            <section className="space-y-4"><h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800"><UserRound className="h-4 w-4 text-[#9F062A]" />Datos personales</h3><div className="grid gap-4 sm:grid-cols-2">{!editingStudentDni ? field("dni", "DNI", "text", true) : null}{field("name", "Nombres", "text", true)}{field("lastName", "Apellidos", "text", true)}{select("gender", "Género", ["Masculino", "Femenino"].map((value) => ({ value, label: value })))}{field("birthDate", "Fecha de nacimiento", "date")}</div></section>
            <section className="space-y-4"><h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800"><Contact className="h-4 w-4 text-[#9F062A]" />Contacto y domicilio</h3><div className="grid gap-4 sm:grid-cols-2">{field("email", "Correo electrónico", "email", true)}{field("phone", "Teléfono", "tel")}{field("address", "Dirección actual")}{field("district", "Distrito")}{field("province", "Provincia")}</div></section>
            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><GraduationCap className="h-4 w-4 text-[#9F062A]" />Datos académicos</h3><p className="text-xs leading-relaxed text-slate-500">{editingStudentDni ? "La carrera y el turno pertenecen al registro de matrícula. Al modificarlos, también se actualiza ese registro." : "Se creará un registro como admitido. La matrícula se valida después de revisar los documentos y el pago."}</p><div className="grid gap-4 sm:grid-cols-2">{select("programId", "Carrera", [...programs.map((p) => ({ value: p.id, label: p.name })), ...(initial.programId && !programs.some((p) => p.id === initial.programId) ? [{ value: initial.programId, label: initial.programId }] : [])], true)}{select("shift", "Turno", ["Mañana", "Tarde", "Noche"].map((value) => ({ value, label: value })), true)}</div></section>
            <section className="space-y-4"><h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-800"><HeartPulse className="h-4 w-4 text-[#9F062A]" />Contacto de emergencia</h3><div className="grid gap-4 sm:grid-cols-2">{field("emergencyName", "Nombre del contacto")}{field("emergencyPhone", "Teléfono de emergencia", "tel")}{field("emergencyRelation", "Relación con el estudiante")}</div></section>
          </fieldset>
        </div>
        <footer className="space-y-3 border-t border-slate-200 bg-white px-6 py-4">
          {academicChanged ? <p role="status" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Cambió la carrera o el turno. Al guardar, se actualizarán la ficha y el registro de matrícula.</p> : null}
          {attempted && Object.keys(errors).length ? <p role="alert" className="text-sm text-red-700">Revise los campos señalados antes de guardar.</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{dirty ? "Tiene cambios sin guardar" : editingStudentDni ? "Sin cambios pendientes" : "Nueva ficha"}</p><div className="flex gap-3"><button type="button" disabled={saving} onClick={requestClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40">Cancelar</button><button type="submit" disabled={saving || (!!editingStudentDni && !dirty)} className="flex items-center gap-2 rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#800521] disabled:opacity-40">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{saving ? "Guardando…" : academicChanged ? "Guardar ficha y matrícula" : editingStudentDni ? "Guardar cambios" : "Registrar estudiante"}</button></div></div>
        </footer>
      </form>
    </div>
    <ConfirmModal isOpen={discard} title="¿Descartar los cambios?" message="Hay datos modificados que todavía no se guardaron." confirmText="Descartar cambios" cancelText="Seguir editando" variant="warning" onConfirm={onClose} onClose={() => setDiscard(false)} />
  </div>;
}
