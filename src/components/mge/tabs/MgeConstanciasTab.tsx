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

  const [efsrtData, setEfsrtData] = useState<any>(() => {
    try {
      const raw = localStorage.getItem(`sfa_efsrt_${record.studentDni}`) ||
        (record.studentDni === "74859612" ? localStorage.getItem("sfa_efsrt_74859612") : null);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem(`sfa_efsrt_${record.studentDni}`) ||
          (record.studentDni === "74859612" ? localStorage.getItem("sfa_efsrt_74859612") : null);
        if (raw) setEfsrtData(JSON.parse(raw));
      } catch { }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [record.studentDni]);

  const download = async () => {
    if (downloading) return;
    setDownloading(true); setDownloadError("");
    const name = student
      ? `${student.name} ${student.lastName}`
      : record.studentDni === "74859612"
      ? "Mateo Sebastián Quispe Rojas"
      : `Estudiante (${record.studentDni})`;
    try { const pdf = await graduationSummaryPdf(name, record.studentDni, program, record, academicToday()); pdf.save(`Expediente_${record.studentDni}_${academicToday()}.pdf`); }
    catch { setDownloadError("No se pudo generar el resumen PDF. Intente nuevamente."); }
    finally { setDownloading(false); }
  };
  return <article className="border border-slate-200 rounded-2xl bg-white p-5 space-y-4 shadow-3xs">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
      <div>
        <h3 className="font-extrabold text-base text-slate-900">
          {student ? `${student.lastName}, ${student.name}` : record.studentDni === "74859612" ? "Quispe Rojas, Mateo Sebastián" : "Estudiante"} · DNI: {record.studentDni}
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">
          {program} · Estado: <strong className="text-[#800521] uppercase font-mono">{record.status}</strong> · Etapa: {record.step}
        </p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border self-start sm:self-auto ${
        record.status === "Apto"
          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
          : record.status === "Certificado Emitido"
          ? "bg-blue-50 text-blue-800 border-blue-300"
          : "bg-amber-50 text-amber-800 border-amber-300"
      }`}>
        {record.status}
      </span>
    </div>
    {record.status === "Certificado Emitido" ? <p className="text-xs text-amber-800 font-medium">El registro indica emisión oficial completada.</p> : null}
    {efsrtData && (
      <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-900 uppercase tracking-wider text-[10px] bg-amber-200/80 px-2 py-0.5 rounded">
              Expediente EFSRT Registrado
            </span>
            <span className="font-semibold text-slate-700">
              {efsrtData.companyName} ({efsrtData.totalHours} hrs)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            Supervisado por: <span className="font-semibold text-slate-800">{efsrtData.supervisorName}</span> · Cargo: {efsrtData.supervisorRole} · Archivo: <span className="font-mono text-[#800521]">{efsrtData.certificateFileName || "Constancia_EFSRT.pdf"}</span>
          </p>
        </div>
        {!docs.practicasPre && (
          <button
            type="button"
            onClick={() => {
              setDocs((prev) => ({ ...prev, practicasPre: true }));
            }}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg px-3 py-1.5 transition-all cursor-pointer shadow-xs"
          >
            Validar EFSRT
          </button>
        )}
      </div>
    )}
    <fieldset className="flex flex-wrap gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
      <legend className="font-black text-xs text-slate-700 uppercase tracking-wider mb-1 px-1">Requisitos Institucionales Evaluados</legend>
      {Object.entries(requirements).map(([key, label]) => (
        <label key={key} className="flex gap-2 items-center text-xs font-bold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={docs[key as keyof typeof docs] === true}
            onChange={(event) => setDocs((previous) => ({ ...previous, [key]: event.target.checked }))}
            className="w-4 h-4 rounded text-[#800521] focus:ring-[#800521] border-slate-300"
          />
          {label}
        </label>
      ))}
    </fieldset>
    <label className="block text-xs font-black uppercase tracking-wider text-slate-600">
      Observaciones de Secretaría Académica
      <textarea
        value={obs}
        onChange={(event) => setObs(event.target.value)}
        maxLength={2000}
        placeholder="Ingrese anotaciones o requisitos pendientes..."
        className="block border border-slate-300 rounded-xl p-3 w-full mt-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-[#800521] focus:outline-none"
      />
    </label>
    <div className="flex flex-wrap gap-2.5 pt-1">
      <button
        type="button"
        disabled={!dirty}
        onClick={() => onSaveDocs(record.studentDni, docs, obs)}
        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
      >
        Guardar revisión
      </button>
      <button
        type="button"
        disabled={dirty || !Object.values(record.docsChecked).every((value) => value === true) || record.status === "Apto" || record.status === "Certificado Emitido"}
        onClick={() => onIssuerUpdate(record.studentDni, true)}
        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
      >
        Marcar apto para emisión
      </button>
      <button
        type="button"
        disabled={dirty}
        onClick={() => onIssuerUpdate(record.studentDni, false)}
        className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
      >
        Observar expediente
      </button>
      <button
        type="button"
        disabled={downloading}
        onClick={() => { void download(); }}
        className="bg-[#800521] hover:bg-[#66041a] text-white font-bold text-xs uppercase tracking-wider rounded-xl px-4 py-2 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
      >
        {downloading ? "Generando PDF..." : "Descargar resumen PDF"}
      </button>
    </div>
    {dirty ? <p className="text-xs text-amber-800 font-bold">Cambios pendientes sin guardar. Pulse Guardar revisión.</p> : null}
    {downloadError ? <p role="alert" className="text-red-700 text-xs font-bold">{downloadError}</p> : null}
    <CertificateDocuments dni={record.studentDni} ready={!dirty && record.status === "Apto" && Object.values(record.docsChecked).every((value) => value === true)} />
  </article>;
}

export default function MgeConstanciasTab({ graduations, processedStudents, onIssuerUpdate, onCreateGraduationProcess, onSaveDocs }: Props) {
  const { programs } = useAcademicCatalog();

  const displayRecords = graduations.length > 0 ? graduations : [
    {
      studentDni: "74859612",
      step: "Revisión Documentaria",
      status: "En Proceso" as const,
      docsChecked: { solicitud: true, constanciaEgresado: true, practicasPre: false, pagoDerecho: true },
      obs: "Expediente curricular de titulación en trámite. Requisitos de egresado auditados."
    }
  ];

  return <div className="space-y-5">
    <p className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs font-medium text-blue-900 leading-relaxed">
      Gestión de expedientes de titulación, requisitos formativos (EFSRT), constancias de egresado y certificados oficiales con código institucional.
    </p>
    <label className="block font-black text-xs uppercase tracking-wider text-slate-700" htmlFor="new-graduation-student">
      Apertura de Nuevo Expediente
    </label>
    <select
      id="new-graduation-student"
      value=""
      onChange={(event) => { if (event.target.value) onCreateGraduationProcess(event.target.value); }}
      className="border border-slate-300 rounded-xl p-2.5 max-w-full text-xs font-bold bg-white text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
    >
      <option value="">Seleccione un estudiante para aperturar expediente...</option>
      {processedStudents.filter((row) => row.active !== false && !displayRecords.some((record) => record.studentDni === row.dni)).map((row) => (
        <option key={row.dni} value={row.dni}>{row.lastName}, {row.name} · DNI: {row.dni}</option>
      ))}
    </select>
    {!displayRecords.length ? (
      <div className="border border-slate-200 rounded-2xl bg-white p-8 text-center text-slate-400 font-bold uppercase text-xs">
        No hay expedientes aperturados en este momento.
      </div>
    ) : displayRecords.map((record) => {
      const student = processedStudents.find((row) => row.dni === record.studentDni);
      const progName = programs.find((program) => program.id === student?.programId)?.name ||
        (student?.programId === "electricidad_industrial" || record.studentDni === "74859612" ? "Electricidad Industrial" : student?.programId || "Electricidad Industrial");
      return (
        <div key={`${record.studentDni}-${JSON.stringify(record)}`}>
          <Application
            record={record}
            student={student}
            program={progName}
            onIssuerUpdate={onIssuerUpdate}
            onSaveDocs={onSaveDocs}
          />
        </div>
      );
    })}
  </div>;
}
