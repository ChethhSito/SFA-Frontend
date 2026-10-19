import React, { useState } from "react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Graduation, StudentPersonalData } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { graduationSummaryPdf } from "../../../utils/graduationSummaryPdf";
import { academicToday } from "../../../utils/attendance";
import CertificateDocuments from "./CertificateDocuments";

const requirements = { solicitud: "Solicitud", constanciaEgresado: "Constancia de egresado", practicasPre: "Prácticas preprofesionales", pagoDerecho: "Pago del derecho" };
interface Props {
  graduations: Graduation[];
  studentsList: Record<string, StudentPersonalData>;
  processedStudents: ProcessedStudent[];
  onIssuerUpdate: (dni: string, approve: boolean) => void;
  onCreateGraduationProcess: (dni: string) => void;
  onSaveDocs: (dni: string, docs: Graduation['docsChecked'], obs: string) => void;
}

function Application({ record, student, program, onIssuerUpdate, onSaveDocs }: {
  record: Graduation; student?: ProcessedStudent; program: string;
  onIssuerUpdate: Props['onIssuerUpdate']; onSaveDocs: Props['onSaveDocs'];
}) {
  const [docs, setDocs] = useState(record.docsChecked);
  const [obs, setObs] = useState(record.obs || "");
  const dirty = JSON.stringify(docs) !== JSON.stringify(record.docsChecked) || obs !== (record.obs || "");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const download = async () => {
    if (downloading) return;
    setDownloading(true); setDownloadError("");
    const name = student ? `${student.name} ${student.lastName}` : "Ficha no disponible";
    try { const pdf = await graduationSummaryPdf(name, record.studentDni, program, record, academicToday()); pdf.save(`Expediente_${record.studentDni}_${academicToday()}.pdf`); }
    catch { setDownloadError("No se pudo generar el resumen PDF. Intente nuevamente."); }
    finally { setDownloading(false); }
  };
  return <article className="border rounded-xl bg-white p-5 space-y-4">
    <h3 className="font-bold">{student ? `${student.lastName}, ${student.name}` : "Ficha no disponible"} · {record.studentDni}</h3>
    <p className="text-sm">{program} · Estado registrado: <strong>{record.status}</strong> · Etapa: {record.step}</p>
    {record.status === "Certificado Emitido" ? <p className="text-sm text-amber-800">El registro indica emisión. Esta pantalla no dispone del documento firmado ni de un número oficial para verificarlo.</p> : null}
    <fieldset className="flex flex-wrap gap-4"><legend className="font-semibold mb-2">Requisitos revisados</legend>
      {Object.entries(requirements).map(([key, label]) => <label key={key} className="flex gap-2 items-center text-sm"><input type="checkbox" checked={docs[key as keyof typeof docs] === true} onChange={(event) => setDocs((previous) => ({ ...previous, [key]: event.target.checked }))} />{label}</label>)}
    </fieldset>
    <label className="block text-sm">Observaciones<textarea value={obs} onChange={(event) => setObs(event.target.value)} maxLength={2000} className="block border rounded-lg p-2 w-full mt-1" /></label>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={!dirty} onClick={() => onSaveDocs(record.studentDni, docs, obs)} className="border rounded-lg px-3 py-2 disabled:opacity-50">Guardar revisión</button>
      <button type="button" disabled={dirty || !Object.values(record.docsChecked).every((value) => value === true) || record.status === "Apto" || record.status === "Certificado Emitido"} onClick={() => onIssuerUpdate(record.studentDni, true)} className="bg-emerald-700 text-white rounded-lg px-3 py-2 disabled:opacity-50">Marcar apto para emisión</button>
      <button type="button" disabled={dirty} onClick={() => onIssuerUpdate(record.studentDni, false)} className="border rounded-lg px-3 py-2 disabled:opacity-50">Observar expediente</button>
      <button type="button" disabled={downloading} onClick={() => { void download(); }} className="border rounded-lg px-3 py-2 disabled:opacity-50">{downloading ? "Generando PDF..." : "Descargar resumen PDF"}</button>
    </div>
    {dirty ? <p className="text-sm text-amber-800">Cambios pendientes. Guarde la revisión antes de cambiar el estado. La descarga incluye los datos ya guardados.</p> : null}
    {downloadError ? <p role="alert" className="text-red-700 text-sm">{downloadError}</p> : null}
    <CertificateDocuments dni={record.studentDni} ready={!dirty && record.status === "Apto" && Object.values(record.docsChecked).every((value) => value === true)} />
  </article>;
}

export default function MgeConstanciasTab({ graduations, processedStudents, onIssuerUpdate, onCreateGraduationProcess, onSaveDocs }: Props) {
  const { programs } = useAcademicCatalog();
  return <div className="space-y-5">
    <p className="rounded-lg bg-blue-50 p-4 text-sm">Gestión de expedientes, requisitos y PDFs institucionales. Puede descargar el resumen administrativo o registrar el PDF emitido por la institución, con su número y fecha reales. La verificación del registro comprueba la integridad del archivo; no valida su firma criptográfica.</p>
    <label className="block font-bold" htmlFor="new-graduation-student">Abrir expediente</label>
    <select id="new-graduation-student" value="" onChange={(event) => { if (event.target.value) onCreateGraduationProcess(event.target.value); }} className="border rounded-lg p-3 max-w-full">
      <option value="">Seleccione un estudiante sin expediente</option>{processedStudents.filter((row) => row.active !== false && !graduations.some((record) => record.studentDni === row.dni)).map((row) => <option key={row.dni} value={row.dni}>{row.lastName}, {row.name} · {row.dni}</option>)}
    </select>
    {!graduations.length ? <p>No hay expedientes registrados.</p> : graduations.map((record) => {
      const student = processedStudents.find((row) => row.dni === record.studentDni);
      return <div key={`${record.studentDni}-${JSON.stringify(record)}`}><Application record={record} student={student} program={programs.find((program) => program.id === student?.programId)?.name || student?.programId || "Sin programa registrado"} onIssuerUpdate={onIssuerUpdate} onSaveDocs={onSaveDocs} /></div>;
    })}
  </div>;
}
