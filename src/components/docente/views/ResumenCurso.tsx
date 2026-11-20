import React from "react";
import { Course } from "../../../types";
import { BookOpen, Users, Calendar, Clock, MapPin, Award, CheckCircle2, AlertCircle, School, ShieldCheck } from "lucide-react";

interface ResumenCursoProps {
  course: Course;
  materialsCount: number;
  assignmentsCount: number;
  incidentsCount: number;
  studentsCount: number;
  totalGradesCount?: number;
  averageGpa: number;
}

export function ResumenCurso({
  course,
  materialsCount,
  assignmentsCount,
  incidentsCount,
  studentsCount,
  totalGradesCount,
  averageGpa,
}: ResumenCursoProps) {
  const isApproved = averageGpa >= 12.5;
  const hasGrades = averageGpa > 0;

  return (
    <div className="space-y-6 text-left font-sans">
      {/* 1. Hero Banner Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              INTRANET ACADÉMICA • CÁTEDRA DOCENTE
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              {course.name}
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Plan Curricular IESTP San Francisco de Asís • Período Académico 2027-I • Modalidad Presencial
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider font-mono">Código</span>
              <span className="text-xs font-black text-white font-mono">{course.code}</span>
            </div>
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider font-mono">Créditos</span>
              <span className="text-xs font-black text-amber-300 font-mono">{course.credits} Créditos</span>
            </div>
          </div>
        </div>

        {/* Cinta de Parámetros */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <School className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Carrera</span>
              <span className="font-extrabold text-white truncate max-w-[150px] block">{course.career || "Electricidad Industrial"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Grupo</span>
              <span className="font-extrabold text-white">Grupo {course.group || "EI-I-A"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Ambiente</span>
              <span className="font-extrabold text-white truncate max-w-[150px] block">{course.classroom || "Aula 101 - Pabellón A"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Duración</span>
              <span className="font-extrabold text-white">16 Semanas Lectivas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5 KPI Cards Modernizadas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block font-mono">Alumnos Inscritos</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{studentsCount}</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Regular</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block font-mono">Materiales Activos</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{materialsCount}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Archivos</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block font-mono">Tareas Publicadas</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{assignmentsCount}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Actividades</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 text-left">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block font-mono">Notas Registradas</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalGradesCount !== undefined ? totalGradesCount : (assignmentsCount || 0)}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Notas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-4 text-left col-span-2 md:col-span-1">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block font-mono">Promedio General</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-2xl font-black font-mono ${hasGrades ? (isApproved ? "text-emerald-600" : "text-[#800521]") : "text-slate-400"}`}>
              {hasGrades ? averageGpa.toFixed(1) : "--"}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">/ 20</span>
          </div>
        </div>
      </div>

      {/* 3. Ficha Técnica y Estado del Rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ficha Técnica Detallada */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4 text-left">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900">Ficha Técnica de la Asignatura</h3>
              <p className="text-xs text-slate-500">Detalles logísticos y de dictado para el semestre en vigor.</p>
            </div>
            <BookOpen className="w-5 h-5 text-[#800521]" />
          </div>

          <div className="text-xs font-bold text-slate-700 divide-y divide-slate-100">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Código del curso:</span>
              <span className="font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold">{course.code}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Nombre de la Asignatura:</span>
              <span className="text-slate-900 font-extrabold uppercase">{course.name}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Carrera Profesional:</span>
              <span className="text-slate-900 uppercase font-bold">{course.career || "Electricidad Industrial"}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Grupo Asignado:</span>
              <span className="text-slate-900 font-mono font-bold">Grupo {course.group || "EI-I-A"}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Plan Curricular:</span>
              <span className="text-slate-900 font-bold">{course.curriculum || "Plan de Estudios 2024 (Vigente)"}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Créditos Oficiales:</span>
              <span className="text-slate-900 font-mono font-bold">{course.credits} Créditos</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Ambiente / Laboratorio:</span>
              <span className="text-[#800521] uppercase font-black">{course.classroom}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Cantidad de Alumnos:</span>
              <span className="text-slate-900 font-bold">{course.studentCount || studentsCount} Alumno{(course.studentCount || studentsCount) === 1 ? "" : "s"} Matriculado{(course.studentCount || studentsCount) === 1 ? "" : "s"}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Horario MPA:</span>
              <span className="text-slate-900 font-medium">{course.schedule}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Inicio de Clases:</span>
              <span className="text-slate-900 font-mono font-bold">{course.startDate || "2027-03-22"}</span>
            </div>
            <div className="py-2.5 flex justify-between items-center font-bold">
              <span className="text-slate-500 font-semibold">Fin de Semestre:</span>
              <span className="text-slate-900 font-mono font-bold">{course.endDate || "2027-07-30"}</span>
            </div>
            <div className="py-2.5 flex justify-between items-start text-slate-500 font-medium gap-3">
              <span className="shrink-0 font-semibold">Plana Docente:</span>
              <span className="text-[#800521] font-extrabold text-right">
                {course.teachers && course.teachers.length > 0
                  ? course.teachers.map((t: any) => `${t.name} (${t.role || 'Cátedra'})`).join(" • ")
                  : (course.teacherName || "Docente Titular")}
              </span>
            </div>
          </div>
        </div>

        {/* Rendimiento Académico Real */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 flex flex-col justify-between items-center space-y-6 text-center">
          <div className="w-full border-b border-slate-150 pb-3">
            <h3 className="text-sm font-black uppercase text-slate-900">Rendimiento Académico</h3>
            <p className="text-xs text-slate-500">Promedio general del grupo formativo.</p>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-100 border-t-[#800521] shadow-inner">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block leading-none font-mono">PROMEDIO</span>
              <span className={`text-2xl font-black block mt-1 font-mono ${hasGrades ? (isApproved ? "text-emerald-700" : "text-[#800521]") : "text-slate-400"}`}>
                {hasGrades ? averageGpa.toFixed(1) : "--"}
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">Escala 00-20</span>
            </div>
          </div>

          <div className="w-full text-center space-y-2">
            {hasGrades ? (
              <>
                <span className={`inline-block font-black uppercase text-[10px] px-3 py-1 rounded-full border ${
                  isApproved 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                    : "bg-rose-50 text-rose-800 border-rose-300"
                }`}>
                  {isApproved ? "Promedio Aprobatorio" : "En Seguimiento"}
                </span>
                <p className="text-slate-500 text-xs font-semibold">
                  Promedio ponderado de {studentsCount} estudiante{studentsCount === 1 ? "" : "s"} matriculado{studentsCount === 1 ? "" : "s"}.
                </p>
              </>
            ) : (
              <>
                <span className="inline-block font-black uppercase text-[10px] px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Sin Evaluaciones Registradas
                </span>
                <p className="text-slate-500 text-xs font-semibold">
                  El promedio grupal se calculará automáticamente al ingresar calificaciones en las semanas lectivas.
                </p>
              </>
            )}
          </div>

          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span className="font-semibold text-slate-400">Condición:</span>
            <span className="text-emerald-700 uppercase font-black">Dictado Regular</span>
          </div>
        </div>

      </div>
    </div>
  );
}
