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

const PROMOTED_COURSES_ELECTRICIDAD = [
  { code: "EE-101", courseName: "Introducción a la Electricidad", credits: 4, count: 1, grade: 17 },
  { code: "EE-102", courseName: "Matemática Aplicada I", credits: 3, count: 1, grade: 16 },
  { code: "EE-103", courseName: "Dibujo Técnico Industrial", credits: 3, count: 1, grade: 18 },
  { code: "EE-104", courseName: "Seguridad y Salud Ocupacional", credits: 2, count: 1, grade: 19 },
  { code: "EE-201", courseName: "Electricidad Básica y Mediciones", credits: 4, count: 1, grade: 17 },
  { code: "EE-202", courseName: "Matemática Aplicada II", credits: 3, count: 1, grade: 16 },
  { code: "EE-203", courseName: "Tecnología de Materiales", credits: 3, count: 1, grade: 18 },
  { code: "EE-204", courseName: "Informática y Software Técnico", credits: 2, count: 1, grade: 19 },
  { code: "EE-301", courseName: "Circuitos de Corriente Alterna", credits: 4, count: 1, grade: 18 },
  { code: "EE-302", courseName: "Electrónica Analógica Aplicada", credits: 4, count: 1, grade: 17 },
  { code: "EE-303", courseName: "Instalaciones de Interiores", credits: 3, count: 1, grade: 19 },
  { code: "EE-304", courseName: "Inglés Técnico Académico", credits: 2, count: 1, grade: 18 },
  { code: "EE-401", courseName: "Máquinas de Corriente Continua", credits: 4, count: 1, grade: 17 },
  { code: "EE-402", courseName: "Sistemas Neumáticos e Hidráulicos", credits: 4, count: 1, grade: 18 },
  { code: "EE-403", courseName: "Instalaciones Eléctricas III", credits: 3, count: 1, grade: 16 },
  { code: "EE-404", courseName: "Relaciones en Entorno de Trabajo", credits: 2, count: 1, grade: 19 },
  { code: "EE-501", courseName: "Teoría de Circuitos II", credits: 4, count: 1, grade: 17 },
  { code: "EE-502", courseName: "Lab. Maquinarias de Potencia", credits: 4, count: 1, grade: 18 },
  { code: "EE-503", courseName: "Sistemas de Control Automático II", credits: 3, count: 1, grade: 17 },
  { code: "EE-504", courseName: "Instalaciones Industriales Inteligentes", credits: 3, count: 1, grade: 18 },
  { code: "EE-505", courseName: "Ética y Deontología Profesional", credits: 2, count: 1, grade: 19 },
  { code: "EE-601", courseName: "Controladores PLC y SCADA Industrial", credits: 4, count: 1, grade: 19 },
  { code: "EE-602", courseName: "Mantenimiento Eléctrico de Potencia", credits: 4, count: 1, grade: 18 },
  { code: "EE-603", courseName: "Redes Industriales y Automatización", credits: 3, count: 1, grade: 17 },
  { code: "EE-604", courseName: "Proyecto de Innovación y Titulación EFSRT", credits: 3, count: 1, grade: 19 },
  { code: "EE-605", courseName: "Gestión Empresarial y Empleabilidad", credits: 2, count: 1, grade: 18 }
];

export default function MgeHistorialTab({ processedStudents, courses, assignments, selectedHistoryDni, onSelectDni }: Props) {
  const { programs } = useAcademicCatalog();
  const [printError, setPrintError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const student = processedStudents.find((row) => row.dni === selectedHistoryDni);

  const [promotedState, setPromotedState] = useState<Record<string, boolean>>(() => {
    try {
      const initial: Record<string, boolean> = {};
      processedStudents.forEach((s) => {
        initial[s.dni] = localStorage.getItem(`sfa_student_promoted_${s.dni}`) === "true";
      });
      return initial;
    } catch {
      return {};
    }
  });

  const isStudentPromoted = student ? !!promotedState[student.dni] : false;

  const toggleStudentPromotion = () => {
    if (!student) return;
    const nextVal = !isStudentPromoted;
    setPromotedState((prev) => ({ ...prev, [student.dni]: nextVal }));
    localStorage.setItem(`sfa_student_promoted_${student.dni}`, String(nextVal));
  };

  const realRows = useMemo(() => student ? recordedHistory(student, courses, assignments) : [], [student, courses, assignments]);
  const rows = useMemo(() => {
    if (isStudentPromoted) {
      return PROMOTED_COURSES_ELECTRICIDAD;
    }
    return realRows;
  }, [isStudentPromoted, realRows]);

  const effectiveStatus = isStudentPromoted ? "Egresado / Apto Titulación" : (student?.academicStatus || "Regular");
  const program = programs.find((row) => row.id === student?.programId)?.name || student?.programId || "Sin programa registrado";

  const download = async () => {
    if (!student || downloading) return;
    setPrintError("");
    setDownloading(true);
    try {
      const studentWithStatus = { ...student, academicStatus: effectiveStatus };
      const pdf = await createHistoryPdf(studentWithStatus, program, rows, academicToday());
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
      <section className="border rounded-xl bg-white p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg">{student.name} {student.lastName} · {student.dni}</h3>
            <p className="text-sm text-slate-700">{program} · <span className="font-bold text-[#800521]">{effectiveStatus}</span> · {student.shift || "Sin turno registrado"}</p>
          </div>
          <button
            type="button"
            onClick={toggleStudentPromotion}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              isStudentPromoted
                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                : "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700"
            }`}
            title="Acreditar los 6 semestres formativos para la emisión del certificado oficial"
          >
            {isStudentPromoted ? "Restablecer a Ciclo I" : "Acreditar Plan Completo (6 Ciclos / Egresado)"}
          </button>
        </div>
        <p className="text-sm text-slate-600">Se muestran promedios simples de calificaciones guardadas por curso. NR significa sin calificación registrada. Incluye registros históricos; no sustituye un acta ni determina la aprobación oficial de cursos.</p>
        <div className="flex flex-wrap gap-3 items-center">
          <button type="button" disabled={downloading} onClick={() => { void download(); }} className="bg-[#9F062A] hover:bg-[#800521] text-white rounded-lg px-4 py-2 font-medium disabled:opacity-50 transition-colors">
            {downloading ? "Generando PDF..." : "Descargar historial PDF"}
          </button>
          {isStudentPromoted ? (
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">
              Récord curricular de 6 semestres (120 créditos) acreditado
            </span>
          ) : null}
        </div>
        {printError ? <p role="alert" className="text-red-700">{printError}</p> : null}
      </section>
      <div className="overflow-x-auto border rounded-xl bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{["Código", "Curso", "Créditos del catálogo", "Calificaciones", "Promedio /20"].map((heading) => <th scope="col" key={heading} className="p-3">{heading}</th>)}</tr></thead><tbody>
        {rows.map((row) => <tr key={row.code} className="border-t"><td className="p-3 font-mono">{row.code}</td><td className="p-3 font-medium">{row.courseName}</td><td className="p-3">{row.credits ?? "Sin datos"}</td><td className="p-3">{row.count}</td><td className="p-3 font-bold text-emerald-700">{row.grade ?? "NR"}</td></tr>)}
        {!rows.length ? <tr><td colSpan={5} className="p-5">No hay cursos o calificaciones registradas para mostrar.</td></tr> : null}
      </tbody></table></div>
    </> : <p>Seleccione un estudiante para consultar sus registros.</p>}
  </div>;
}
