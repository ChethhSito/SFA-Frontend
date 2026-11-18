import React, { useMemo } from 'react';
import { BookOpen, CheckCircle2, Download, FileText, Printer, ShieldCheck } from 'lucide-react';
import { Enrollment, MpaAcademicGroup, MpaClassroom, MpaCourse, MpaCurriculumItem, MpaPeriod, MpaProgramTask, MpaShift, Program, StudentPersonalData } from '../../../types';
import { generateMatriculaPdf, generateManualMatriculaPdf } from '../../../utils/matriculaPdf';

interface PlanningData {
  periods: MpaPeriod[];
  groups: MpaAcademicGroup[];
  curriculum: MpaCurriculumItem[];
  curriculumVersions: { id: string; name: string }[];
  courses: MpaCourse[];
  tasks: MpaProgramTask[];
  classrooms: MpaClassroom[];
  shifts: MpaShift[];
}

interface CourseEnrollmentTabProps {
  enrollment: Enrollment;
  studentGroup?: MpaAcademicGroup;
  data: PlanningData;
  onSaved?: (enrollment: Enrollment) => void;
  personalData?: StudentPersonalData;
  currentProgram?: Program;
}

export default function CourseEnrollmentTab({
  enrollment,
  studentGroup,
  data,
  personalData,
  currentProgram
}: CourseEnrollmentTabProps) {
  const period = data.periods.find((item) => item.id === studentGroup?.periodId);
  const periodLabel = period?.name || "2027-I";
  const studentCode = personalData?.dni ? `202710001` : "202710001";
  const studentFullName = personalData
    ? `${personalData.lastName || ''}, ${personalData.name || ''}`.trim() || "Quispe Rojas, Mateo Sebastián"
    : "Quispe Rojas, Mateo Sebastián";
  const programName = currentProgram?.name || (enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad");

  // Derive official registered courses for the student's active cycle
  const registeredCoursesList = useMemo(() => {
    // 1. Try to find courses from data.curriculum and data.courses
    const cycleNum = studentGroup?.cycle || 1;
    let list: Array<{
      id: string;
      code: string;
      name: string;
      credits: number;
      cycle: number;
      type: string;
      group: string;
      sg: number;
      tsg: string;
      status: string;
    }> = [];

    const careerCourses = data.courses.filter(
      (c) => c.careerId === enrollment.programId && (Number(c.cycle ?? c.referenceCycle) === cycleNum || Number(c.referenceCycle ?? c.cycle) === cycleNum)
    );

    if (careerCourses.length > 0) {
      list = careerCourses.map((c, idx) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits || 4,
        cycle: cycleNum,
        type: c.type === "General" ? "General" : "Obligatorio",
        group: studentGroup?.name || "EI-I-A",
        sg: 0,
        tsg: idx % 2 === 0 ? "Teoría / Taller" : idx % 3 === 0 ? "Práctica" : "Taller",
        status: "Matriculado"
      }));
    } else {
      // Fallback official Ciclo I courses
      list = [
        { id: "eind-101", code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, cycle: 1, type: "Obligatorio", group: "EI-I-A", sg: 0, tsg: "Teoría / Taller", status: "Matriculado" },
        { id: "eind-102", code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, cycle: 1, type: "Obligatorio", group: "EI-I-A", sg: 0, tsg: "Taller", status: "Matriculado" },
        { id: "eind-103", code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, cycle: 1, type: "Obligatorio", group: "EI-I-A", sg: 0, tsg: "Práctica", status: "Matriculado" },
        { id: "eind-104", code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, cycle: 1, type: "General", group: "EI-I-A", sg: 0, tsg: "Teoría", status: "Matriculado" },
        { id: "eind-105", code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, cycle: 1, type: "General", group: "EI-I-A", sg: 0, tsg: "Laboratorio", status: "Matriculado" },
      ];
    }
    return list;
  }, [data.courses, enrollment.programId, studentGroup]);

  const totalCredits = registeredCoursesList.reduce((acc, c) => acc + c.credits, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadConstancia = async () => {
    await generateMatriculaPdf({
      studentName: personalData?.name || "Mateo Sebastián",
      studentLastName: personalData?.lastName || "Quispe Rojas",
      dni: enrollment.studentDni || personalData?.dni || "74859612",
      studentCode,
      programName,
      period: periodLabel,
      cycle: "Ciclo I",
      shift: enrollment.shift || "Mañana",
      courses: registeredCoursesList.map((c) => ({
        code: c.code,
        name: c.name,
        credits: c.credits,
        cycle: c.cycle,
        type: c.type,
        group: c.group,
        tsg: c.tsg,
        status: c.status,
      })),
      totalCredits,
      totalCourses: registeredCoursesList.length,
      maxCredits: 22,
      paymentStatus: "PAGADO (S/. 250.00)",
    });
  };

  const handleDownloadManual = async () => {
    await generateManualMatriculaPdf();
  };

  return (
    <div className="space-y-4 text-left">
      {/* 1. Header Bar institucional limpio y compacto (Estilo Universidad) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#800521]" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Matrícula {periodLabel}
            </h2>
          </div>
          <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
            {studentCode} - {studentFullName}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadConstancia}
            className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Constancia</span>
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Modelo Universidad adaptado a SFA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Columna Izquierda: Tabla de Cursos Matriculados (8 de 12 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200/90 rounded-xl shadow-3xs overflow-hidden">
          <div className="py-2.5 px-4 bg-slate-50 border-b border-slate-200 text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Cursos Matriculados
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre del curso</th>
                  <th className="py-2.5 px-2 text-center">Créditos</th>
                  <th className="py-2.5 px-2 text-center">Ciclo</th>
                  <th className="py-2.5 px-2 text-center">Tipo</th>
                  <th className="py-2.5 px-2 text-center">Grupo</th>
                  <th className="py-2.5 px-2 text-center">SG</th>
                  <th className="py-2.5 px-2 text-center">TSG</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {registeredCoursesList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-black text-[#800521]">
                      {c.code}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                      {c.credits}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                      {c.cycle}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600">
                      {c.type}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-700">
                      {c.group}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                      {c.sg}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600">
                      {c.tsg}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Summary Footer (Estilo Universidad: 16 | 5 | 22) */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50/70 text-center py-2.5 text-xs font-black text-slate-800 font-mono">
            <div>
              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block">Créditos Inscritos</span>
              <span className="text-sm font-black text-[#800521]">{totalCredits}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block">Total Cursos</span>
              <span className="text-sm font-black text-slate-900">{registeredCoursesList.length}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block">Máximo Permitido</span>
              <span className="text-sm font-black text-slate-600">22</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Información (4 de 12 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200/90 rounded-xl shadow-3xs p-4 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#800521]" />
              Información
            </h3>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Carrera</span>
              <span className="font-extrabold text-slate-800 uppercase text-right truncate max-w-[150px]">{programName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Currículo</span>
              <span className="font-bold text-slate-800">52</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Especialidad</span>
              <span className="font-bold text-slate-600">-</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Ampliación de Créditos</span>
              <span className="font-bold text-slate-600">No</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Máximo Ciclo</span>
              <span className="font-bold text-slate-800 font-mono">10</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Máximo de Créditos</span>
              <span className="font-bold text-slate-800 font-mono">22</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Matrícula Especial</span>
              <span className="font-bold text-slate-600">No</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Estado de Pago</span>
              <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                Pagó
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Permitir Cruces</span>
              <span className="font-bold text-slate-600">No</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleDownloadManual}
              className="text-[#800521] hover:text-[#66041a] hover:underline text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual de Matrícula (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
