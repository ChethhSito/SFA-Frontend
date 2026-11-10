import React, { useEffect, useState } from "react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Graduation, StudentPersonalData } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { graduationSummaryPdf } from "../../../utils/graduationSummaryPdf";
import { academicToday } from "../../../utils/attendance";
import CertificateDocuments from "./CertificateDocuments";
import GraduationAccessPanel from "../GraduationAccessPanel";
import GraduationDirectory from "./GraduationDirectory";
import MgeDialog from "../MgeDialog";
import { UserRound, ClipboardCheck, Download, CheckCircle2, Circle, FileText } from "lucide-react";

const requirements = { solicitud: "Solicitud", constanciaEgresado: "Constancia de egresado", practicasPre: "Prácticas preprofesionales", pagoDerecho: "Pago del derecho" };
interface Props {
  graduations: Graduation[];
  studentsList: Record<string, StudentPersonalData>;
  processedStudents: ProcessedStudent[];
  onIssuerUpdate: (dni: string, approve: boolean) => void;
  onCreateGraduationProcess: (dni: string) => void;
  onSaveDocs: (dni: string, docs: Graduation['docsChecked'], obs: string) => void;
}

function Application({ record, student, program, onIssuerUpdate, onSaveDocs, authRevision, onDirtyChange }: {
  record: Graduation; student?: ProcessedStudent; program: string;
  authRevision: number; onDirtyChange: (dirty: boolean) => void;
  onIssuerUpdate: Props['onIssuerUpdate']; onSaveDocs: Props['onSaveDocs'];
}) {
  const [docs, setDocs] = useState(record.docsChecked);
  const [obs, setObs] = useState(record.obs || "");
  const dirty = JSON.stringify(docs) !== JSON.stringify(record.docsChecked) || obs !== (record.obs || "");
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const reviewed = Object.keys(requirements).filter((key) => docs[key as keyof typeof docs] === true).length;
  const approved = record.status === "Apto" || record.status === "Certificado Emitido";
  const statusStyle = approved ? "bg-emerald-100 text-emerald-800" : record.status === "No Apto" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800";
  const nextStep = dirty ? "Guarde los cambios de la revisión para continuar." : approved ? "Continúe con el documento del certificado en el siguiente bloque." : reviewed < 4 ? "Revise los documentos del estudiante y marque los requisitos verificados." : "Todos los requisitos están revisados. Puede marcar el expediente como apto.";
  const download = async () => {
    if (downloading) return;
    setDownloading(true); setDownloadError("");
    const name = student ? `${student.name} ${student.lastName}` : "Ficha no disponible";
    try { const pdf = await graduationSummaryPdf(name, record.studentDni, program, record, academicToday()); pdf.save(`Expediente_${record.studentDni}_${academicToday()}.pdf`); }
    catch { setDownloadError("No se pudo generar el resumen PDF. Intente nuevamente."); }
    finally { setDownloading(false); }
  };
  return <article className="space-y-5">
    <header className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-rose-50 p-3 text-[#9F062A]"><UserRound className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expediente del estudiante</p><h3 className="mt-1 text-lg font-bold text-slate-900">{student ? `${student.lastName}, ${student.name}` : "Ficha no disponible"}</h3></div></div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle}`}>{record.status === "No Apto" ? "Con observaciones" : record.status}</span>
      </div>
      <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_2fr_1fr]"><div><dt className="text-xs text-slate-500">DNI</dt><dd className="mt-1 text-sm font-semibold">{record.studentDni}</dd></div><div><dt className="text-xs text-slate-500">Programa de estudios</dt><dd className="mt-1 text-sm font-semibold">{program}</dd></div><div><dt className="text-xs text-slate-500">Etapa actual</dt><dd className="mt-1 text-sm font-semibold">{record.step === "Revision Documental" ? "Revisión documental" : record.step}</dd></div></dl>
    </header>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-sm font-bold text-[#9F062A]">1</span><div><h4 className="font-bold text-slate-900">Revisión del expediente</h4><p className="text-xs text-slate-500 mt-0.5">Verifique los requisitos antes de autorizar la emisión.</p></div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{reviewed} de 4 revisados</span></div>
      <div className="space-y-5 p-5 sm:p-6">
        <fieldset><legend className="mb-3 text-sm font-semibold text-slate-700">Documentos requeridos</legend><div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(requirements).map(([key, label]) => { const checked = docs[key as keyof typeof docs] === true; return <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${checked ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 hover:bg-slate-50"}`}><input type="checkbox" className="h-4 w-4 accent-emerald-700" checked={checked} onChange={(event) => setDocs((previous) => ({ ...previous, [key]: event.target.checked }))} /><span className="flex-1"><span className="block text-sm font-medium text-slate-800">{label}</span><span className={`mt-1 block text-xs ${checked ? "text-emerald-700" : "text-slate-500"}`}>{checked ? "Revisado" : "Pendiente de revisión"}</span></span>{checked ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}</label>; })}
        </div></fieldset>
        <label className="block text-sm font-semibold text-slate-700">Observaciones de la revisión<textarea rows={3} placeholder="Detalle los documentos faltantes o las correcciones necesarias." value={obs} onChange={(event) => setObs(event.target.value)} maxLength={2000} className="mt-2 block w-full rounded-lg border border-slate-300 p-3 font-normal focus:border-[#9F062A] focus:outline-none focus:ring-2 focus:ring-rose-100" /></label>
        <div role="status" className={`flex items-start gap-2 rounded-lg p-3 text-sm ${dirty ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-600"}`}><ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0" />{nextStep}</div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <button type="button" disabled={!dirty} onClick={() => onSaveDocs(record.studentDni, docs, obs)} className="rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#800521] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Guardar revisión</button>
          <button type="button" disabled={dirty || !Object.values(record.docsChecked).every((value) => value === true) || approved} onClick={() => onIssuerUpdate(record.studentDni, true)} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">Marcar como apto</button>
          <button type="button" disabled={dirty} onClick={() => onIssuerUpdate(record.studentDni, false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">Observar expediente</button>
        </div>
      </div>
    </section>
    <CertificateDocuments dni={record.studentDni} authRevision={authRevision} ready={!dirty && record.status === "Apto" && Object.values(record.docsChecked).every((value) => value === true)} />
    <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4"><div className="flex items-center gap-2 text-sm text-slate-600"><FileText className="h-4 w-4" />Resumen administrativo del expediente</div><button type="button" disabled={downloading} onClick={() => { void download(); }} className="flex items-center gap-2 text-sm font-semibold text-[#9F062A] disabled:opacity-50"><Download className="h-4 w-4" />{downloading ? "Generando..." : "Descargar resumen PDF"}</button><p className="w-full text-xs text-slate-500">Incluye la última revisión guardada. No reemplaza el certificado institucional.</p>{downloadError ? <p role="alert" className="text-red-700 text-sm">{downloadError}</p> : null}</footer>
  </article>;
}

export default function MgeConstanciasTab({ graduations, processedStudents, onIssuerUpdate, onCreateGraduationProcess, onSaveDocs }: Props) {
  const { programs } = useAcademicCatalog();
  const [selectedDni, setSelectedDni] = useState("");
  const [authRevision, setAuthRevision] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [confirmBack, setConfirmBack] = useState(false);
  const record = graduations.find((item) => item.studentDni === selectedDni);
  const student = processedStudents.find((row) => row.dni === selectedDni);
  return <div className="space-y-5">
    <header><h2 className="text-lg font-bold text-slate-900">Gestión de constancias y certificados</h2><p className="mt-1 text-sm text-slate-500">Busque al estudiante, revise su expediente y registre el documento emitido.</p></header>
    <GraduationAccessPanel onReload={async () => { setAuthRevision((value) => value + 1); return true; }} />
    <div className={selectedDni ? "hidden" : ""}><GraduationDirectory students={processedStudents} graduations={graduations} onSelect={setSelectedDni} /></div>
    {selectedDni ? <button type="button" onClick={() => { if (dirty) setConfirmBack(true); else setSelectedDni(""); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">← Volver al listado de estudiantes</button> : null}
    {selectedDni && !record ? <section className="rounded-xl border border-slate-200 bg-white p-6"><h3 className="font-bold">{student ? student.lastName + ", " + student.name : selectedDni}</h3><p className="mt-1 text-xs text-slate-500">DNI {selectedDni}</p><div className="mt-5 border-t border-slate-100 pt-5"><h4 className="font-semibold">Sin expediente registrado</h4><p className="mt-2 text-sm text-slate-500">Cree un expediente para comenzar la revisión de los cuatro requisitos.</p><button type="button" onClick={() => onCreateGraduationProcess(selectedDni)} className="mt-4 rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white">Crear expediente</button></div></section> : null}
    {confirmBack ? <MgeDialog title="Hay una revisión sin guardar" onClose={() => setConfirmBack(false)}><p className="text-sm text-slate-600">Guarde los requisitos y observaciones antes de cambiar de estudiante, o descarte estos cambios para volver al listado.</p><div className="flex justify-end gap-3"><button type="button" onClick={() => setConfirmBack(false)} className="rounded-lg border px-4 py-2.5 text-sm">Seguir revisando</button><button type="button" onClick={() => { setConfirmBack(false); setSelectedDni(""); setDirty(false); }} className="rounded-lg bg-[#9F062A] px-4 py-2.5 text-sm font-semibold text-white">Descartar y volver</button></div></MgeDialog> : null}
    {record ? <div key={`${record.studentDni}-${JSON.stringify(record)}`}><Application record={record} student={student} authRevision={authRevision} program={programs.find((program) => program.id === student?.programId)?.name || student?.programId || "Sin programa registrado"} onIssuerUpdate={onIssuerUpdate} onSaveDocs={onSaveDocs} onDirtyChange={setDirty} /></div> : null}
  </div>;
}
