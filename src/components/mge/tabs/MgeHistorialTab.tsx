import React, { useMemo, useState } from "react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Course, CourseAssignment } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { recordedHistory } from "../../../utils/mgeReports";
import { createHistoryPdf } from "../../../utils/historyPdf";
import { academicToday } from "../../../utils/attendance";

interface Props {
  processedStudents: ProcessedStudent[];
  courses: Course[];
  assignments: CourseAssignment[];
  selectedHistoryDni: string;
  onSelectDni: (dni: string) => void;
}

export default function MgeHistorialTab({ processedStudents, courses, assignments, selectedHistoryDni, onSelectDni }: Props) {
  const { programs } = useAcademicCatalog();
  const [printError, setPrintError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const student = processedStudents.find((row) => row.dni === selectedHistoryDni);
  const rows = useMemo(() => student ? recordedHistory(student, courses, assignments) : [], [student, courses, assignments]);
  const program = programs.find((row) => row.id === student?.programId)?.name || student?.programId || "Sin programa registrado";
  const download = async () => {
    if (!student || downloading) return;
    setPrintError("");
    setDownloading(true);
    try {
      const pdf = await createHistoryPdf(student, program, rows, academicToday());
      pdf.save(`Historial_${student.dni}_${academicToday()}.pdf`);
    } catch { setPrintError("No se pudo generar el PDF del historial. Intente nuevamente."); }
    finally { setDownloading(false); }
  };
  return <div className="space-y-5">
    <label htmlFor="history-student" className="block font-bold">Historial académico del estudiante</label>
    <select id="history-student" value={selectedHistoryDni} onChange={(event) => { onSelectDni(event.target.value); setPrintError(""); }} className="border rounded-lg p-3 max-w-full">
      <option value="">Seleccione un estudiante</option>{processedStudents.map((row) => <option key={row.dni} value={row.dni}>{row.lastName}, {row.name} · {row.dni}{row.active === false ? " · De baja" : ""}</option>)}
    </select>
    {student ? <>
      <section className="border rounded-xl bg-white p-5 space-y-3"><h3 className="font-bold">{student.name} {student.lastName} · {student.dni}</h3><p>{program} · {student.academicStatus} · {student.shift || "Sin turno registrado"}</p>
        <p className="text-sm text-slate-600">Se muestran promedios simples de calificaciones guardadas por curso. NR significa sin calificación registrada. Incluye registros históricos; no sustituye un acta ni determina la aprobación oficial de cursos.</p>
        <button type="button" disabled={downloading} onClick={() => { void download(); }} className="bg-[#9F062A] text-white rounded-lg px-4 py-2 disabled:opacity-50">{downloading ? "Generando PDF..." : "Descargar historial PDF"}</button>
        {printError ? <p role="alert" className="text-red-700">{printError}</p> : null}
      </section>
      <div className="overflow-x-auto border rounded-xl bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Código", "Curso", "Créditos del catálogo", "Calificaciones", "Promedio /20"].map((heading) => <th scope="col" key={heading} className="p-3">{heading}</th>)}</tr></thead><tbody>
        {rows.map((row) => <tr key={row.code} className="border-t"><td className="p-3">{row.code}</td><td className="p-3">{row.courseName}</td><td className="p-3">{row.credits ?? "Sin datos"}</td><td className="p-3">{row.count}</td><td className="p-3 font-bold">{row.grade ?? "NR"}</td></tr>)}
        {!rows.length ? <tr><td colSpan={5} className="p-5">No hay cursos o calificaciones registradas para mostrar.</td></tr> : null}
      </tbody></table></div>
    </> : <p>Seleccione un estudiante para consultar sus registros.</p>}
  </div>;
}
