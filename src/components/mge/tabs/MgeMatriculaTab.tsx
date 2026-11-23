import React, { useState } from "react";
import {
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  SlidersHorizontal,
  Ban,
  Download,
  Check,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { ProgramId } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { generateMatriculaPdf, MatriculaPdfData } from "../../../utils/matriculaPdf";

interface Props {
  processedStudents: ProcessedStudent[];
  onToggleAcademicStatus: (dni: string) => void;
  onShiftChange: (dni: string, shift: "Mañana" | "Tarde" | "Noche") => void;
  onCareerChange: (dni: string, programId: ProgramId) => void;
}

export default function MgeMatriculaTab({
  processedStudents,
  onToggleAcademicStatus,
  onShiftChange,
  onCareerChange,
}: Props) {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();

  // Modales formales
  const [studentToAnular, setStudentToAnular] = useState<ProcessedStudent | null>(null);
  const [anulacionMotivo, setAnulacionMotivo] = useState<string>("Retiro voluntario por motivos personales o laborales (Art. 42 R.I.)");
  const [anulacionExpediente, setAnulacionExpediente] = useState<string>("");
  const [anulacionObs, setAnulacionObs] = useState<string>("");

  const [studentToMatricular, setStudentToMatricular] = useState<ProcessedStudent | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<ProgramId>("electricidad_industrial");
  const [selectedShift, setSelectedShift] = useState<"Mañana" | "Tarde" | "Noche">("Mañana");

  const [studentToReasignar, setStudentToReasignar] = useState<ProcessedStudent | null>(null);
  const [reasignarCareer, setReasignarCareer] = useState<ProgramId>("electricidad_industrial");
  const [reasignarShift, setReasignarShift] = useState<"Mañana" | "Tarde" | "Noche">("Mañana");

  const [generatingPdfDni, setGeneratingPdfDni] = useState<string | null>(null);

  // Estadísticas rápidas de matrícula
  const totalMatriculados = processedStudents.filter((s) => s.academicStatus === "MATRICULADO" && s.active !== false).length;
  const totalPendientes = processedStudents.filter((s) => s.academicStatus !== "MATRICULADO" && s.active !== false).length;

  // Descarga de Ficha Oficial de Matrícula en PDF
  const handleDownloadFicha = async (st: ProcessedStudent) => {
    setGeneratingPdfDni(st.dni);
    try {
      const prog = ACADEMIC_PROGRAMS.find((p) => p.id === st.programId);
      const isElectricidad = !st.programId || st.programId === "electricidad_industrial" || st.programId === "electronica";
      
      const isCycle2 = typeof window !== "undefined" && Boolean(
        localStorage.getItem(`sfa_student_promoted_cycle2_${st.dni}`) === "true" ||
        localStorage.getItem(`sfa_cycle2_payment_${st.dni}`) === "true" ||
        localStorage.getItem(`sfa_student_cycle_${st.dni}`) === "2" ||
        st.dni === "74859612"
      );
      const activePeriodName = isCycle2 ? "2027-II" : "2027-I";
      const activeCycleName = isCycle2 ? "Ciclo II" : "Ciclo I";

      const coursesData = isElectricidad ? (
        isCycle2 ? [
          { code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", credits: 4, cycle: "II", type: "Obligatorio", group: "EI-II-A", status: "Matriculado" },
          { code: "EIND-202", name: "Electrónica Analógica y de Potencia Básica", credits: 4, cycle: "II", type: "Obligatorio", group: "EI-II-A", status: "Matriculado" },
          { code: "EIND-203", name: "Taller de Medidas e Instrumentos Eléctricos", credits: 3, cycle: "II", type: "Obligatorio", group: "EI-II-A", status: "Matriculado" },
          { code: "EIND-204", name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)", credits: 3, cycle: "II", type: "Obligatorio", group: "EI-II-A", status: "Matriculado" },
          { code: "EIND-205", name: "Inglés Técnico para Electricidad", credits: 2, cycle: "II", type: "General", group: "EI-II-A", status: "Matriculado" },
        ] : [
          { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, cycle: "I", type: "Obligatorio", group: "EI-I-A", status: "Matriculado" },
          { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, cycle: "I", type: "Obligatorio", group: "EI-I-A", status: "Matriculado" },
          { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, cycle: "I", type: "Obligatorio", group: "EI-I-A", status: "Matriculado" },
          { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, cycle: "I", type: "General", group: "EI-I-A", status: "Matriculado" },
          { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, cycle: "I", type: "General", group: "EI-I-A", status: "Matriculado" },
        ]
      ) : [
        { code: "CNT-101", name: "Contabilidad General I", credits: 4, cycle: "I", type: "Obligatorio", group: "G1", status: "Matriculado" },
        { code: "CNT-102", name: "Documentación Comercial y Contable", credits: 3, cycle: "I", type: "Obligatorio", group: "G1", status: "Matriculado" },
        { code: "CNT-103", name: "Legislación Comercial y Laboral", credits: 3, cycle: "I", type: "Obligatorio", group: "G1", status: "Matriculado" },
        { code: "CNT-104", name: "Matemática Financiera I", credits: 3, cycle: "I", type: "Obligatorio", group: "G1", status: "Matriculado" },
        { code: "CNT-105", name: "Ofimática Aplicada a la Contabilidad", credits: 2, cycle: "I", type: "Obligatorio", group: "G1", status: "Matriculado" },
      ];

      const pdfData: MatriculaPdfData = {
        studentName: st.name,
        studentLastName: st.lastName,
        dni: st.dni,
        studentCode: st.dni === "74859612" ? "202710001" : `2027-${st.dni.slice(-4)}`,
        programName: prog?.name || (isElectricidad ? "Electricidad Industrial" : "Contabilidad"),
        period: activePeriodName,
        cycle: activeCycleName,
        shift: st.shift || "Mañana",
        courses: coursesData,
        totalCredits: coursesData.reduce((acc, c) => acc + c.credits, 0),
        totalCourses: coursesData.length,
        maxCredits: 22,
        paymentStatus: "Validado",
        paymentAmount: "S/ 250.00",
        date: new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
      };

      const doc = await generateMatriculaPdf(pdfData);
      doc.save(`Ficha_Matricula_${st.dni}_${activePeriodName}.pdf`);
    } catch (err) {
      console.error("Error al generar la ficha de matrícula:", err);
    } finally {
      setGeneratingPdfDni(null);
    }
  };

  const handleOpenAnulacion = (st: ProcessedStudent) => {
    setStudentToAnular(st);
    setAnulacionExpediente(`EXP-2026-RET-${st.dni.slice(-4)}`);
    setAnulacionObs("");
  };

  const handleConfirmAnulacion = () => {
    if (!studentToAnular) return;
    onToggleAcademicStatus(studentToAnular.dni);
    setStudentToAnular(null);
  };

  const handleOpenMatricular = (st: ProcessedStudent) => {
    setStudentToMatricular(st);
    setSelectedCareer(st.programId || "electricidad_industrial");
    setSelectedShift(st.shift || "Mañana");
  };

  const handleConfirmMatricular = () => {
    if (!studentToMatricular) return;
    if (studentToMatricular.programId !== selectedCareer) {
      onCareerChange(studentToMatricular.dni, selectedCareer);
    }
    if (studentToMatricular.shift !== selectedShift) {
      onShiftChange(studentToMatricular.dni, selectedShift);
    }
    onToggleAcademicStatus(studentToMatricular.dni);
    setStudentToMatricular(null);
  };

  const handleOpenReasignar = (st: ProcessedStudent) => {
    setStudentToReasignar(st);
    setReasignarCareer(st.programId || "electricidad_industrial");
    setReasignarShift(st.shift || "Mañana");
  };

  const handleConfirmReasignar = () => {
    if (!studentToReasignar) return;
    if (studentToReasignar.programId !== reasignarCareer) {
      onCareerChange(studentToReasignar.dni, reasignarCareer);
    }
    if (studentToReasignar.shift !== reasignarShift) {
      onShiftChange(studentToReasignar.dni, reasignarShift);
    }
    setStudentToReasignar(null);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Banner Institucional Superior */}
      <div className="bg-gradient-to-r from-[#800521] via-slate-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border-b-4 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              Control de Matrícula y Asignación Curricular Institucional
            </h2>
          </div>
          <p className="text-[11px] text-white/80 max-w-2xl leading-relaxed">
            Gestión formal de expedientes de matrícula semestral, adscripción de carreras técnicas, asignación de turnos oficiales y trámites administrativos de retiro o anulación conforme al Reglamento Institucional.
          </p>
        </div>

        {/* Contadores Estadísticos de Gestión */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-center">
            <span className="block text-base font-black text-emerald-400 font-mono">{totalMatriculados}</span>
            <span className="block text-[9.5px] uppercase font-bold text-white/70 tracking-wider">Matriculados</span>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-xl px-3.5 py-2 text-center">
            <span className="block text-base font-black text-amber-400 font-mono">{totalPendientes}</span>
            <span className="block text-[9.5px] uppercase font-bold text-white/70 tracking-wider">Pendientes</span>
          </div>
        </div>
      </div>

      {/* Tabla Oficial de Estudiantes y Matrículas */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
        <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center border-b-2 border-amber-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider font-mono">
              Padrón de Matrículas • Semestre Académico Activo
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-bold font-mono">
            Total en Registro: {processedStudents.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                <th className="px-5 py-3.5">Estudiante</th>
                <th className="px-5 py-3.5">Carrera Técnica Oficial</th>
                <th className="px-5 py-3.5">Turno Asignado</th>
                <th className="px-5 py-3.5 text-center">Condición de Matrícula</th>
                <th className="px-5 py-3.5 text-right">Acciones de Secretaría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                    No hay estudiantes registrados en el padrón de matrículas.
                  </td>
                </tr>
              ) : (
                processedStudents.map((st) => {
                  const programObj = ACADEMIC_PROGRAMS.find((p) => p.id === st.programId);
                  const isMatriculado = st.academicStatus === "MATRICULADO" && st.active !== false;
                  const isAdmitido = st.academicStatus !== "MATRICULADO" && st.active !== false;
                  const isDeBaja = st.active === false;

                  const isCycle2 = typeof window !== "undefined" && Boolean(
                    localStorage.getItem(`sfa_student_cycle_${st.dni}`) === "2" ||
                    localStorage.getItem(`sfa_student_promoted_cycle2_${st.dni}`) === "true" ||
                    (st.dni === "74859612" && (
                      localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
                      localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
                      localStorage.getItem("sfa_student_cycle") === "2"
                    ))
                  );

                  const initials = `${st.name?.charAt(0) || ""}${st.lastName?.charAt(0) || ""}`.toUpperCase();

                  return (
                    <tr key={st.dni} className="hover:bg-slate-50/70 transition-colors">
                      {/* Estudiante */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#800521]/10 text-[#800521] font-black flex items-center justify-center text-xs shrink-0 font-mono">
                            {initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                            <div className="text-[10px] font-mono font-bold text-slate-500">DNI: {st.dni}</div>
                          </div>
                        </div>
                      </td>

                      {/* Carrera */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {programObj?.name || (st.programId === "electricidad_industrial" ? "Electricidad Industrial" : st.programId || "Electricidad Industrial")}
                        </div>
                        <span className="text-[9.5px] font-semibold text-slate-500 font-mono">
                          Plan de Estudios (120 Créditos)
                        </span>
                      </td>

                      {/* Turno */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-800 text-xs block">
                          Turno {st.shift || "Mañana"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {st.shift === "Tarde" ? "13:30 - 18:30" : st.shift === "Noche" ? "18:45 - 22:45" : "08:00 - 13:00"}
                        </span>
                      </td>

                      {/* Condición */}
                      <td className="px-5 py-3.5 text-center">
                        {isDeBaja ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black uppercase font-mono">
                            DE BAJA
                          </span>
                        ) : isMatriculado ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase font-mono shadow-2xs">
                              {isCycle2 ? "MATRICULADO ACTIVO • CICLO II" : "MATRICULADO ACTIVO"}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 font-mono mt-0.5">
                              {isCycle2 ? "Periodo 2027-II" : "Periodo 2027-I"}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black uppercase font-mono shadow-2xs">
                              SOLO ADMITIDO
                            </span>
                            <span className="text-[9px] font-medium text-amber-700 mt-0.5">Pendiente Formalización</span>
                          </div>
                        )}
                      </td>

                      {/* Acciones de Secretaría */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isDeBaja ? (
                            <span className="text-slate-400 text-xs italic">Sin acciones (De baja)</span>
                          ) : isMatriculado ? (
                            <>
                              {/* Descargar Ficha Oficial */}
                              <button
                                type="button"
                                disabled={generatingPdfDni === st.dni}
                                onClick={() => void handleDownloadFicha(st)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs"
                                title="Ver y descargar Ficha Oficial de Matrícula en PDF"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-700" />
                                <span>{generatingPdfDni === st.dni ? "Generando..." : "Ficha Oficial"}</span>
                              </button>

                              {/* Reasignar Turno o Carrera */}
                              <button
                                type="button"
                                onClick={() => handleOpenReasignar(st)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10.5px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs"
                                title="Reasignar carrera técnica o turno formalmente"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
                                <span>Reasignar</span>
                              </button>

                              {/* Anulación Formal */}
                              <button
                                type="button"
                                onClick={() => handleOpenAnulacion(st)}
                                className="px-3 py-1.5 bg-[#800521] hover:bg-[#66041a] text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title="Aperturar expediente de anulación de matrícula"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Anular Matrícula</span>
                              </button>
                            </>
                          ) : (
                            /* Formalizar Matrícula */
                            <button
                              type="button"
                              onClick={() => handleOpenMatricular(st)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Formalizar Matrícula</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ANULACIÓN FORMAL DE MATRÍCULA */}
      {studentToAnular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#800521] px-5 py-4 text-white flex justify-between items-center border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Resolución de Anulación de Matrícula
                  </h3>
                  <span className="text-[10px] text-white/80 font-mono">
                    Secretaría Académica • Procedimiento Administrativo de Retiro
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentToAnular(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Resumen del estudiante */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">
                  {studentToAnular.lastName}, {studentToAnular.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  DNI: {studentToAnular.dni} • Carrera: {ACADEMIC_PROGRAMS.find((p) => p.id === studentToAnular.programId)?.name || studentToAnular.programId} • Turno: {studentToAnular.shift}
                </div>
              </div>

              {/* Selector de Motivo */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Causal / Motivo de Anulación Oficial (Reglamento IESTP)
                </label>
                <select
                  value={anulacionMotivo}
                  onChange={(e) => setAnulacionMotivo(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-2xs focus:ring-1 focus:ring-[#800521]"
                >
                  <option value="Retiro voluntario por motivos personales o laborales (Art. 42 R.I.)">
                    Retiro voluntario por motivos personales o laborales (Art. 42 R.I.)
                  </option>
                  <option value="Traslado externo a otra institución de educación superior (Art. 45 R.I.)">
                    Traslado externo a otra institución de educación superior (Art. 45 R.I.)
                  </option>
                  <option value="Reserva o postergación formal de matrícula para próximo periodo">
                    Reserva o postergación formal de matrícula para próximo periodo
                  </option>
                  <option value="Incumplimiento de requisitos documentarios o arancelarios">
                    Incumplimiento de requisitos documentarios o arancelarios
                  </option>
                  <option value="Anulación administrativa por duplicidad o rectificación">
                    Anulación administrativa por duplicidad o rectificación
                  </option>
                </select>
              </div>

              {/* N° de Expediente */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  N° de Documento / Expediente Administrativo
                </label>
                <input
                  type="text"
                  value={anulacionExpediente}
                  onChange={(e) => setAnulacionExpediente(e.target.value)}
                  placeholder="Ej. EXP-2026-RET-0492"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Observaciones de Secretaría Académica (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={anulacionObs}
                  onChange={(e) => setAnulacionObs(e.target.value)}
                  placeholder="Ingrese el sustento o detalle de la resolución..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#800521]"
                />
              </div>

              {/* Cláusula de advertencia */}
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex gap-2.5 text-rose-900 leading-relaxed text-[11px]">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Efectos Académicos de la Anulación:</span>
                  El estudiante perderá la condición de <b>Matriculado Activo</b>, no figurará en las actas de evaluación ni asistencias docentes del ciclo.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStudentToAnular(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAnulacion}
                className="px-4 py-2 bg-[#800521] hover:bg-[#66041a] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirmar Anulación de Matrícula</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMALIZACIÓN DE MATRÍCULA */}
      {studentToMatricular && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-emerald-800 px-5 py-4 text-white flex justify-between items-center border-b-2 border-emerald-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Formalización de Matrícula Institucional
                  </h3>
                  <span className="text-[10px] text-white/80 font-mono">
                    Secretaría Académica • Apertura de Expediente y Carga Lectiva
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentToMatricular(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">
                  {studentToMatricular.lastName}, {studentToMatricular.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  DNI: {studentToMatricular.dni} • Condición: Ingresante Ordinario
                </div>
              </div>

              {/* Selector de Carrera */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Carrera Técnica Oficial
                </label>
                <select
                  value={selectedCareer}
                  onChange={(e) => setSelectedCareer(e.target.value as ProgramId)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-2xs focus:ring-1 focus:ring-emerald-700"
                >
                  {ACADEMIC_PROGRAMS.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Turno */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Turno Académico Oficial
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Mañana", "Tarde", "Noche"] as const).map((shiftOpt) => (
                    <button
                      key={shiftOpt}
                      type="button"
                      onClick={() => setSelectedShift(shiftOpt)}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                        selectedShift === shiftOpt
                          ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-extrabold">{shiftOpt}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {shiftOpt === "Tarde" ? "13:30 - 18:30" : shiftOpt === "Noche" ? "18:45 - 22:45" : "08:00 - 13:00"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Validación Arancelaria */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">Arancel de Matrícula Regular</span>
                  <span className="text-[10px] text-emerald-700">Comprobante validado conforme en tesorería</span>
                </div>
                <span className="font-mono font-black text-emerald-800 text-sm">S/ 250.00</span>
              </div>

              {/* Carga Curricular */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block">
                  Carga Curricular Inicial (Ciclo I - 5 Asignaturas)
                </span>
                <p className="text-[11px] text-slate-600">
                  Se inscribirá al estudiante en las 5 asignaturas modulares oficiales del Ciclo I (20 créditos académicos reglamentarios).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStudentToMatricular(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmMatricular}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar y Formalizar Matrícula</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REASIGNACIÓN DE CARRERA / TURNO */}
      {studentToReasignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 px-5 py-4 text-white flex justify-between items-center border-b-2 border-amber-500">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Reasignación Académica de Carrera y Turno
                  </h3>
                  <span className="text-[10px] text-white/80 font-mono">
                    Secretaría Académica • Rectificación de Matrícula Activa
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentToReasignar(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-extrabold text-slate-900 text-sm">
                  {studentToReasignar.lastName}, {studentToReasignar.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  DNI: {studentToReasignar.dni} • Condición: Matriculado Activo
                </div>
              </div>

              {/* Selector de Carrera */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Reasignar Carrera Técnica
                </label>
                <select
                  value={reasignarCareer}
                  onChange={(e) => setReasignarCareer(e.target.value as ProgramId)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-2xs focus:ring-1 focus:ring-slate-900"
                >
                  {ACADEMIC_PROGRAMS.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Turno */}
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Reasignar Turno Institucional
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Mañana", "Tarde", "Noche"] as const).map((shiftOpt) => (
                    <button
                      key={shiftOpt}
                      type="button"
                      onClick={() => setReasignarShift(shiftOpt)}
                      className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                        reasignarShift === shiftOpt
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-extrabold">{shiftOpt}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {shiftOpt === "Tarde" ? "13:30 - 18:30" : shiftOpt === "Noche" ? "18:45 - 22:45" : "08:00 - 13:00"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStudentToReasignar(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReasignar}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Guardar Reasignación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
