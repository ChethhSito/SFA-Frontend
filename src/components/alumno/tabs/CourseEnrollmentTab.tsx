import React, { useMemo, useState, useEffect } from 'react';
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
  const currentStudentDni = enrollment.studentDni || personalData?.dni || "74859612";
  const [, setStorageSync] = useState(0);
  useEffect(() => {
    const handleSync = () => setStorageSync((v) => v + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const isPromotedCycle2 = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_student_promoted_cycle2_${currentStudentDni}`) === "true" ||
    localStorage.getItem(`sfa_student_promoted_cycle2_${personalData?.dni}`) === "true" ||
    localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
    localStorage.getItem(`sfa_student_cycle_${currentStudentDni}`) === "2" ||
    localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
    localStorage.getItem("sfa_student_cycle") === "2"
  );
  const isCycle2Paid = typeof window !== "undefined" && Boolean(
    localStorage.getItem(`sfa_cycle2_payment_${currentStudentDni}`) === "true" ||
    localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
    localStorage.getItem("sfa_cycle2_payment") === "true"
  );
  const cycleNum = isPromotedCycle2 ? 2 : (studentGroup?.cycle || 1);
  const period = data.periods.find((item) => item.id === studentGroup?.periodId);
  const periodLabel = isPromotedCycle2 ? "2027-II" : (period?.name || "2027-I");
  const studentCode = personalData?.dni ? `202710001` : "202710001";
  const studentFullName = personalData
    ? `${personalData.lastName || ''}, ${personalData.name || ''}`.trim() || "Quispe Rojas, Mateo Sebastián"
    : "Quispe Rojas, Mateo Sebastián";
  const programName = currentProgram?.name || (enrollment.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad");

  // Derive official registered courses for the student's active cycle
  const registeredCoursesList = useMemo(() => {
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
        group: cycleNum === 2 ? "EI-II-A" : (studentGroup?.name || "EI-I-A"),
        sg: 0,
        tsg: idx % 2 === 0 ? "Teoría / Taller" : idx % 3 === 0 ? "Práctica" : "Taller",
        status: isPromotedCycle2 && !isCycle2Paid ? "Pendiente de Pago" : "Matriculado"
      }));
    } else {
      if (cycleNum === 2) {
        list = [
          { id: "eind-201", code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", credits: 4, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Teoría / Taller", status: isCycle2Paid ? "Matriculado" : "Pendiente de Pago" },
          { id: "eind-202", code: "EIND-202", name: "Máquinas Eléctricas Estáticas y Transformadores", credits: 4, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Taller", status: isCycle2Paid ? "Matriculado" : "Pendiente de Pago" },
          { id: "eind-203", code: "EIND-203", name: "Mediciones e Instrumentación Eléctrica", credits: 3, cycle: 2, type: "Obligatorio", group: "EI-II-A", sg: 0, tsg: "Laboratorio", status: isCycle2Paid ? "Matriculado" : "Pendiente de Pago" },
          { id: "eind-204", code: "EIND-204", name: "Electrónica Básica Aplicada", credits: 3, cycle: 2, type: "General", group: "EI-II-A", sg: 0, tsg: "Práctica", status: isCycle2Paid ? "Matriculado" : "Pendiente de Pago" },
          { id: "eind-205", code: "EIND-205", name: "Inglés Técnico para Electricidad", credits: 2, cycle: 2, type: "General", group: "EI-II-A", sg: 0, tsg: "Teoría", status: isCycle2Paid ? "Matriculado" : "Pendiente de Pago" },
        ];
      } else {
        list = [
          { id: "eind-101", code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, cycle: 1, type: "Obligatorio", group: "EI-I-A", sg: 0, tsg: "Teoría / Taller", status: "Matriculado" },
          { id: "eind-102", code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, cycle: 1, type: "Obligatorio", group: "EI-I-A", sg: 0, tsg: "Taller", status: "Matriculado" },
          { id: "eind-103", code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, cycle: 1, type: "Obligatorio", group: "EI-I-A", sg: 0, tsg: "Práctica", status: "Matriculado" },
          { id: "eind-104", code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, cycle: 1, type: "General", group: "EI-I-A", sg: 0, tsg: "Teoría", status: "Matriculado" },
          { id: "eind-105", code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, cycle: 1, type: "General", group: "EI-I-A", sg: 0, tsg: "Laboratorio", status: "Matriculado" },
        ];
      }
    }
    return list;
  }, [data.courses, enrollment.programId, studentGroup, cycleNum, isPromotedCycle2, isCycle2Paid]);

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
      {/* 1. Hero Banner Borgoña Institucional Oficial */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • MATRÍCULA ACADÉMICA
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Matrícula Periodo {periodLabel}
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Código Oficial: <span className="text-amber-300 font-bold">{studentCode}</span> • Estudiante: <span className="text-white font-bold">{studentFullName}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadConstancia}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Constancia PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner de Pago Requerido para Ciclo II si aún no canceló */}
      {isPromotedCycle2 && !isCycle2Paid && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded font-mono">
              Paso Requerido • Matrícula Ciclo II
            </span>
            <h4 className="text-sm font-black text-slate-900">
              Ciclo II Habilitado: Pago de Matrícula Pendiente (S/ 250.00)
            </h4>
            <p className="text-xs text-slate-600">
              El estudiante ha concluido y aprobado el Ciclo I. Registre o abone la tasa de matrícula del Ciclo II para su validación oficial en Caja (MAF) y Secretaría (MGE).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(`sfa_cycle2_payment_${currentStudentDni}`, "true");
              localStorage.setItem("sfa_cycle2_payment_74859612", "true");
              localStorage.setItem("sfa_cycle2_payment", "true");
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("storage"));
              }
              setStorageSync((v) => v + 1);
            }}
            className="bg-[#800521] hover:bg-[#9F062A] text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            Pagar Matrícula (S/ 250.00)
          </button>
        </div>
      )}

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
              {isPromotedCycle2 && !isCycle2Paid ? (
                <span className="font-black text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
                  Pendiente (S/ 250.00)
                </span>
              ) : (
                <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono">
                  Pagó
                </span>
              )}
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
