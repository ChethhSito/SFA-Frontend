import React from "react";
import { Course } from "../../../types";
import { ROSTER } from "../DocenteTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";

interface ResumenCursoProps {
  course: Course;
  materialsCount: number;
  assignmentsCount: number;
  incidentsCount: number;
  studentsCount: number;
  averageGpa: number;
}

export function ResumenCurso({
  course,
  materialsCount,
  assignmentsCount,
  incidentsCount,
  studentsCount,
  averageGpa,
}: ResumenCursoProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Course Big Banner Card */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/60 opacity-95" />
        <div className="relative z-10 space-y-3">
          <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm block w-max select-none font-mono">
            INTRANET ACADÉMICA • CATEDRA DOCENTE
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-none">
            {course.name}
          </h2>
          <p className="text-xs text-white/90 font-medium">
            Plan Curricular IESTP San Francisco de Asís • Ciclo Académico Regular
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white hover:border-slate-300 transition-all">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block">Alumnos Inscritos</span>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-black text-slate-800">{studentsCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">100% act.</span>
          </div>
        </Card>

        <Card className="p-4 bg-white hover:border-slate-300 transition-all">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block">Materiales Activos</span>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-black text-slate-800">{materialsCount}</span>
            <span className="text-[9.5px] text-slate-400">archivos</span>
          </div>
        </Card>

        <Card className="p-4 bg-white hover:border-slate-300 transition-all">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block">Tareas Publicadas</span>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-black text-slate-800">{assignmentsCount}</span>
            <span className="text-[9.5px] text-slate-400">talleres</span>
          </div>
        </Card>

        <Card className="p-4 bg-white hover:border-slate-300 transition-all">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block">Notas Registradas</span>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-black text-slate-800">{(studentsCount * assignmentsCount) || 0}</span>
            <span className="text-[10px] text-slate-400">valores</span>
          </div>
        </Card>

        <Card className="p-4 bg-white hover:border-slate-300 transition-all col-span-2 md:col-span-1">
          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider block">Promedio General</span>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-black text-[#8B0026]">{averageGpa.toFixed(1)}</span>
            <span className="text-[9.5px] text-slate-500">/ 20</span>
          </div>
        </Card>
      </div>

      {/* Detail columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Ficha Técnica del Aula Asignada</CardTitle>
              <CardDescription>Detalles logísticos y de dictado para el semestre en vigor</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 text-xs font-bold text-slate-700 divide-y divide-slate-100">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Código del curso:</span>
              <span className="font-mono text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-sm">{course.code}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Nombre del curso:</span>
              <span className="text-slate-900">{course.name}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Carrera:</span>
              <span className="text-slate-900 uppercase">{course.career || "Electricidad Industrial"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Grupo:</span>
              <span className="text-slate-900 font-mono">Grupo {course.group || "A"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Currícula:</span>
              <span className="text-slate-900">{course.curriculum || "Currícula 2024"}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Créditos:</span>
              <span className="text-slate-900">{course.credits} Créditos Oficiales</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Aula o laboratorio:</span>
              <span className="text-slate-900 uppercase font-extrabold">{course.classroom}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Cantidad de alumnos:</span>
              <span className="text-slate-900">{course.studentCount || studentsCount} Alumnos Matriculados</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Horario:</span>
              <span className="text-slate-900">{course.schedule}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400 font-semibold">Fecha de inicio:</span>
              <span className="text-slate-900 font-mono">{course.startDate || "06/04/2026"}</span>
            </div>
            <div className="py-2.5 flex justify-between font-bold">
              <span className="text-slate-400 font-semibold">Fecha de fin:</span>
              <span className="text-slate-900 font-mono">{course.endDate || "24/07/2026"}</span>
            </div>
            <div className="py-2.5 flex justify-between text-slate-400 italic font-medium">
              <span>Catedrático Titular:</span>
              <span className="text-[#8B0026] not-italic font-extrabold">Ing. Miguel Ángel Ramos Torres</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Rendimiento Esperado</CardTitle>
              <CardDescription>Estadística agregada</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col justify-center items-center space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-8 border-rose-100/70 border-t-[#8B0026] shadow-inner">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-bold uppercase block leading-none">PROM</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">{averageGpa.toFixed(1)}</span>
              </div>
            </div>
            <div className="w-full text-center text-[10.5px] font-bold text-slate-600">
              <p>Clase con quórum idóneo.</p>
              <p className="text-slate-400 text-[10px] mt-1">Estimador de deserción menor al 3.5%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
