import React, { useState } from "react";
import { 
  Users, BookOpen, Clock, FileText, CheckCircle, 
  Upload, Plus, Save, Award, Trash2, Calendar, FileSpreadsheet, CheckCircle2, RefreshCw, Sparkles, MessageSquare, AlertCircle, X, HelpCircle, HardDrive, GraduationCap
} from "lucide-react";
import { Course, CourseMaterial, CourseAssignment, StudentPersonalData } from "@/types";
import { ROSTER, getWeekTheme, WeeklyObservation, StudentRosterItem } from "./DocenteTypes";
import Badge from "../ui-custom/Badge";
import Button from "../ui-custom/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui-custom/Card";
import PageHeader from "../ui-custom/PageHeader";

// 1. Component: ResumenCurso
export function ResumenCurso({
  course,
  materialsCount,
  assignmentsCount,
  incidentsCount,
  studentsCount,
  averageGpa
}: {
  course: Course;
  materialsCount: number;
  assignmentsCount: number;
  incidentsCount: number;
  studentsCount: number;
  averageGpa: number;
}) {
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

      {/* Grid of metrics KPI Cards */}
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

      {/* Main Structural Detail Column */}
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

// 2. Component: MaterialManager
export function MaterialManager({
  courseId,
  week,
  materials,
  onPublishMaterial,
  onDeleteMaterial
}: {
  courseId: string;
  week: number;
  materials: CourseMaterial[];
  onPublishMaterial: (title: string, fileName: string, type: string) => void;
  onDeleteMaterial: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("PDF");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !fileName) return;
    onPublishMaterial(title, fileName, fileType);
    setTitle("");
    setFileName("");
  };

  const getFileIconColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF": return "text-rose-650 bg-rose-50 border-rose-200";
      case "WORD": return "text-blue-600 bg-blue-50 border-blue-100";
      case "POWERPOINT": return "text-orange-500 bg-orange-50 border-orange-100";
      case "EXCEL": return "text-emerald-700 bg-emerald-50 border-emerald-100";
      case "VIDEO": return "text-purple-650 bg-purple-50 border-purple-100";
      default: return "text-slate-600 bg-slate-50 border-slate-250";
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Publicación de Material Didáctico`}
        subtitle="Comparta archivos lectivos estructurados para incentivar el estudio asíncrono."
        icon={<Upload className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Subir Nuevo Recurso</CardTitle>
              <CardDescription>Escoja el formato y asigne un membrete didáctico</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] uppercase tracking-wide mb-1">Título del Recurso</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Diapositivas de Arranque Estrella-Triángulo" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] uppercase tracking-wide mb-1">Tipo de Archivo</label>
                <select 
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                >
                  <option value="PDF">Documento PDF (.pdf)</option>
                  <option value="Word">Documento Word (.docx)</option>
                  <option value="PowerPoint">Diapositiva PowerPoint (.pptx)</option>
                  <option value="Excel">Hoja de Cálculo Excel (.xlsx)</option>
                  <option value="Video">Grabación de Clase / Video (.mp4)</option>
                  <option value="Enlace">Enlace Externo / Web URL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] uppercase tracking-wide mb-1">Nombre Simulado de Archivo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: guia_laboratorio3_automatizacion.pdf" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-mono text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026] text-white"
              >
                <Upload className="w-4 h-4 mr-1.5" /> Publicar Material
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Archivos Publicados en Semana {week}</CardTitle>
              <CardDescription>Syllabus correspondientes regulados por el docente titular</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {materials.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic font-bold">
                  <p>No ha publicado materiales en esta semana aún.</p>
                  <p className="text-[10px] mt-1 text-slate-400">Complete el formulario adjunto para dar de alta su primera lectura.</p>
                </div>
              ) : (
                materials.map((mat) => (
                  <div 
                    key={mat.id} 
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between transition-colors gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg border font-black text-[10px] uppercase font-mono ${getFileIconColor(mat.fileName.split('.').pop() || 'pdf')}`}>
                        {mat.fileName.split('.').pop()?.toUpperCase() || "ZIP"}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="font-extrabold text-slate-900 block truncate text-xs">{mat.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Archivo: <span className="font-mono underline text-blue-600">{mat.fileName}</span> • Publicado: {mat.date}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Eliminar material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 3. Component: TareaManager
export function TareaManager({
  courseId,
  week,
  assignments,
  onPublishAssignment,
  onDeleteAssignment
}: {
  courseId: string;
  week: number;
  assignments: CourseAssignment[];
  onPublishAssignment: (title: string, desc: string, dueDate: string, attachment?: string, rubric?: string) => void;
  onDeleteAssignment: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [rubric, setRubric] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dueDate) return;
    onPublishAssignment(title, description, dueDate, attachment || undefined, rubric || undefined);
    setTitle("");
    setDescription("");
    setDueDate("");
    setAttachment("");
    setRubric("");
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Publicación de Tareas Evaluativas`}
        subtitle="Regule entregables, rúbricas de control y configure fechas límite fijas."
        icon={<Plus className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Programar Nueva Tarea</CardTitle>
              <CardDescription>Establezca los requisitos y el sistema de evaluación</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Título de la Tarea</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Laboratorio 1: Script de Escalamiento S7-1200" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Instrucciones y Requisitos</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Escriba los lineamientos de entrega, formato del código, esquema eléctrico, etc." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026] resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Fecha Límite de Bloqueo</label>
                <input 
                  type="date" 
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Archivo de Guía Adjunta (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: guia_rubrica_lab1.pdf" 
                  value={attachment}
                  onChange={(e) => setAttachment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-mono text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Criterios de Evaluación/Rúbrica (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: Circuito: 10pts, Lógica Ladder: 5pts, Informe: 5pts" 
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026] text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Publicar Tarea
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div>
              <CardTitle>Tareas Abiertas de Semana {week}</CardTitle>
              <CardDescription>Lista de entregas sincrónicas para revisión digital</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {assignments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic font-bold">
                <p>No ha publicado tareas o cuestionarios en esta semana.</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Toda tarea se guardará automáticamente en el sistema.</p>
              </div>
            ) : (
              assignments.map((asg) => (
                <div 
                  key={asg.id} 
                  className="border border-slate-100 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-left space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-sm">{asg.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{asg.description}</p>
                      
                      <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                        <span className="bg-red-50 text-[#8B0026] border border-red-100 py-0.5 px-2.5 rounded-full">
                          Vence: {asg.dueDate}
                        </span>
                        {(asg as any).rubric && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 py-0.5 px-2.5 rounded-full">
                            Rúbrica: {(asg as any).rubric}
                          </span>
                        )}
                        {(asg as any).attachment && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 py-0.5 px-2.5 rounded-full font-mono">
                            📁 {(asg as any).attachment}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => onDeleteAssignment(asg.id)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 4. Component: ObservacionManager
export function ObservacionManager({
  courseId,
  week,
  observations,
  onAddObservation,
  onDeleteObservation
}: {
  courseId: string;
  week: number;
  observations: WeeklyObservation[];
  onAddObservation: (text: string, type: "General" | "Incidencia" | "Acuerdo") => void;
  onDeleteObservation: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"General" | "Incidencia" | "Acuerdo">("General");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddObservation(text, type);
    setText("");
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Incidencia": return "danger";
      case "Acuerdo": return "warning";
      default: return "brand";
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Observaciones de Clase e Incidencias`}
        subtitle="Monitoree acuerdos, fallas de equipos de laboratorio o progresos conductuales recurrentes."
        icon={<AlertCircle className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Registrar Nueva Nota</CardTitle>
              <CardDescription>Anotaciones oficiales visibles para el área de coordinación</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700 font-sans">
              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] uppercase tracking-wide mb-1">Categoría del Registro</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border rounded-md font-semibold text-slate-850 focus:outline-[#8B0026]"
                >
                  <option value="General">Observación General</option>
                  <option value="Incidencia">Incidencia Académica / Técnica</option>
                  <option value="Acuerdo">Acuerdo de Aula / Compromiso</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9.5px] uppercase tracking-wide mb-1">Detalle del Registro</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Detalle de la sesión técnica, incidentes con terminales táctiles, etc." 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026] resize-none"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026] text-white"
              >
                <Save className="w-4 h-4 mr-1.5" /> Registrar Nota
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Línea de Tiempo de Observaciones Oficiales</CardTitle>
              <CardDescription>Bitácora de seguimiento institucional</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 font-sans">
            <div className="relative border-l border-slate-200 pl-4 space-y-5 text-left">
              {observations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic font-bold border-0">
                  <p>No se han registrado observaciones en esta semana.</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Use el panel lateral para formalizar su primer apunte.</p>
                </div>
              ) : (
                observations.map((obs) => (
                  <div key={obs.id} className="relative space-y-1.5 group select-none">
                    {/* Ring dot positioning */}
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-white border-2 border-[#8B0026] block shrink-0" />
                    
                    <div className="flex justify-between items-center bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl group-hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getBadgeVariant(obs.type)} className="px-2 py-0.5 text-[8.5px] uppercase font-extrabold tracking-wider border">
                            {obs.type}
                          </Badge>
                          <span className="text-[9px] text-slate-450 font-bold">{obs.date}</span>
                        </div>
                        <p className="text-xs text-slate-850 font-semibold leading-relaxed font-sans">{obs.text}</p>
                      </div>

                      <button 
                        onClick={() => onDeleteObservation(obs.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-rose-50 rounded-md transition-all cursor-pointer opacity-80 hover:opacity-100"
                        title="Eliminar observación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 5. Component: EntregaManager
export function EntregaManager({
  courseId,
  week,
  assignment,
  onOpenGradingTab
}: {
  courseId: string;
  week: number;
  assignment: CourseAssignment | null;
  onOpenGradingTab: () => void;
}) {
  // Enriched list matching ROSTER to simulate files submitted
  const listSubmissions = () => {
    if (!assignment) return [];
    return ROSTER.map((std, idx) => {
      // 3 students delivered solutions, 2 didn't
      const hasDelivered = idx < 3;
      const fileExtDict = ["pdf", "zip", "docx"];
      const isGraded = idx === 0;

      return {
        dni: std.dni,
        name: `${std.name} ${std.lastName}`,
        fileName: hasDelivered ? `${assignment.title.toLowerCase().replace(/ /g, "_")}_${std.name.toLowerCase()}.${fileExtDict[idx]}` : null,
        submitDate: hasDelivered ? "2026-06-03 16:40" : null,
        status: hasDelivered ? (isGraded ? "Calificado" : "Pendiente de Calificación") : "Sin Entregar"
      };
    });
  };

  const subs = listSubmissions();

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Carpetas de Entrega de Soluciones`}
        subtitle="Revise el estatus de las carpetas de los alumnos y descargue el material enviado."
        icon={<Users className="w-5 h-5 text-[#8B0026]" />}
      />

      <Card>
        <CardHeader className="bg-slate-50/40">
          <div>
            <CardTitle>{assignment?.title || "Recepción de Prácticas"}</CardTitle>
            <CardDescription>{assignment ? `Fecha límite de control: ${assignment.dueDate}` : "No hay tareas programadas en esta semana"}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5 font-sans">
          {!assignment ? (
            <div className="p-12 text-center text-slate-400 font-bold italic">
              <p>No hay tareas programadas en la Semana {week}.</p>
              <p className="text-[10px] mt-1 text-slate-400 font-semibold">Cree una práctica dirigida primero para iniciar la recepción.</p>
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center text-[10px] font-black tracking-wider text-slate-450 uppercase pb-1">
                <span>Alumno Solicitante</span>
                <span>Estatus de Recepción</span>
              </div>

              {subs.map((sub) => {
                const isGradeReady = sub.status === "Calificado";
                return (
                  <div 
                    key={sub.dni}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors"
                  >
                    <div className="text-left space-y-1">
                      <span className="font-extrabold text-slate-900 block text-xs md:text-sm">{sub.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold block">DNI: DNI {sub.dni}</span>
                      {sub.fileName && (
                        <span className="text-[11px] text-blue-600 font-mono font-bold block mt-1 underline cursor-pointer select-none">
                          📁 Descargar sol.: {sub.fileName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.submitDate && (
                        <span className="text-[10px] text-slate-450 font-bold hidden md:inline">Enviado: {sub.submitDate}</span>
                      )}
                      
                      <Badge 
                        variant={sub.status === "Calificado" ? "success" : sub.status === "Sin Entregar" ? "danger" : "warning"}
                        className="font-extrabold px-2.5 py-1 text-[9px] uppercase border tracking-wider"
                      >
                        {sub.status}
                      </Badge>

                      {sub.status !== "Sin Entregar" && (
                        <Button
                          onClick={onOpenGradingTab}
                          size="sm"
                          variant="outline"
                          className="font-black text-[9px] tracking-wide uppercase px-2.5 py-1.5"
                        >
                          {isGradeReady ? "Modificar" : "Calificar"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 6. Component: CalificacionManager
export function CalificacionManager({
  courseId,
  week,
  assignment,
  grades,
  onSaveGrade
}: {
  courseId: string;
  week: number;
  assignment: CourseAssignment | null;
  grades: { [dni: string]: { grade?: number; feedback?: string } };
  onSaveGrade: (studentDni: string, grade: number, feedback: string) => void;
}) {
  const [editingGrades, setEditingGrades] = useState<{ [key: string]: string }>({});
  const [editingFeedbacks, setEditingFeedbacks] = useState<{ [key: string]: string }>({});

  const handleSave = (dni: string) => {
    const rawGrade = editingGrades[dni] || grades[dni]?.grade?.toString() || "";
    const feedback = editingFeedbacks[dni] || grades[dni]?.feedback || "";
    const parsedGrade = parseInt(rawGrade, 10);

    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 20) {
      alert("Por favor ingrese una nota válida entre 0 y 20 de la escala nominal oficial.");
      return;
    }
    
    onSaveGrade(dni, parsedGrade, feedback);
    
    // Clear temp edit caches
    setEditingGrades((prev) => {
      const copy = { ...prev };
      delete copy[dni];
      return copy;
    });
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Calificador Nominal de Alumnos`}
        subtitle="Asigne notas oficiales en la escala nacional regular (0 a 20) con comentarios cualitativos directos."
        icon={<Award className="w-5 h-5 text-[#8B0026]" />}
      />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{assignment?.title || "Planilla de Evaluaciones"}</CardTitle>
            <CardDescription>{assignment ? `Asignación de notas obligatorias: ${assignment.description}` : "No hay tareas programadas en esta semana para evaluar"}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5 font-sans">
          {!assignment ? (
            <div className="p-12 text-center text-slate-400 italic font-bold">
              <p>No se registran tareas evaluativas en la Semana {week}.</p>
              <p className="text-[10px] mt-1 text-slate-400">Las notas registradas aquí se computarán en el Acta Final del Curso.</p>
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {ROSTER.map((student) => {
                const finalGrade = editingGrades[student.dni] !== undefined 
                  ? editingGrades[student.dni] 
                  : (grades[student.dni]?.grade !== undefined ? grades[student.dni].grade?.toString() : "");
                
                const finalFeedback = editingFeedbacks[student.dni] !== undefined 
                  ? editingFeedbacks[student.dni] 
                  : (grades[student.dni]?.feedback || "");

                const hasSavedGrade = grades[student.dni]?.grade !== undefined;

                return (
                  <div 
                    key={student.dni}
                    className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-colors text-xs font-bold"
                  >
                    {/* Student Info */}
                    <div className="text-left space-y-1.5 lg:max-w-xs xl:max-w-md w-full">
                      <span className="font-extrabold text-slate-900 block text-xs md:text-sm">{student.name} {student.lastName}</span>
                      <span className="text-[10px] text-slate-400 block">DNI: DNI {student.dni} • Correo: {student.email}</span>
                      {hasSavedGrade && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10.5px] text-slate-550 italic font-medium w-64 block truncate" title={grades[student.dni]?.feedback}>
                            Ok: "{grades[student.dni]?.feedback || 'Sin observaciones'}"
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Inputs & Grade Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto">
                      {/* Comments Feedback Input */}
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">Comentario Cualitativo / Feedback:</label>
                        <input
                          type="text"
                          placeholder="Fórmula excelente, falta rótulo..."
                          value={finalFeedback}
                          onChange={(e) => setEditingFeedbacks({ ...editingFeedbacks, [student.dni]: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-md font-mono text-[11px] font-semibold text-slate-800 focus:outline-[#8B0026] h-10"
                        />
                      </div>

                      {/* Numeric Grade Input */}
                      <div className="text-left">
                        <label className="block text-[9px] text-slate-400 uppercase font-black tracking-wider mb-1">Nota (0-20):</label>
                        <input 
                          type="number" 
                          min="0"
                          max="20"
                          placeholder="Nota"
                          value={finalGrade}
                          onChange={(e) => setEditingGrades({ ...editingGrades, [student.dni]: e.target.value })}
                          className="w-16 h-10 border border-slate-200 bg-white rounded-md font-mono text-center font-black text-slate-900 text-sm focus:outline-[#8B0026]"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleSave(student.dni)}
                        variant={hasSavedGrade ? "outline" : "primary"}
                        className="font-black uppercase text-[10px] tracking-wide inline-flex items-center justify-center gap-1.5 self-end h-10 px-4 mt-auto shrink-0 bg-[#8B0026]"
                      >
                        <Save className="w-3.5 h-3.5" /> 
                        {hasSavedGrade ? "Modificar" : "Puntuar"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 7. Component: CierreCurso
export function CierreCurso({
  course,
  weeksCount,
  materialsCount,
  assignmentsCount,
  averageGpa
}: {
  course: Course;
  weeksCount: number;
  materialsCount: number;
  assignmentsCount: number;
  averageGpa: number;
}) {
  const [showActaModal, setShowActaModal] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signDni, setSignDni] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSignActa = (e: React.FormEvent) => {
    e.preventDefault();
    if (signDni.length < 8) {
      alert("Por favor ingrese un DNI válido de 8 dígitos para proceder con la firma segura.");
      return;
    }
    setIsSigned(true);
    showToast("🎉 ¡Acta firmada digitalmente con éxito! Los registros se han cerrado y enviado al Coordinador Académico del IESTP San Francisco de Asís.");
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-start gap-3 border border-emerald-500 animate-slide-up">
          <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-amber-300" />
          <div className="text-xs font-bold font-sans">
            <span className="block font-black text-white text-[13px] mb-1">PROCESAMIENTO COMPLETED</span>
            <p>{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-emerald-750 rounded text-emerald-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        title="CIERRE DE CURSO: Cómputo Final de Evaluación"
        subtitle="Cierre formal de asignatura académica regulada. Genere actas nominales autorizadas con firma digital de DNI."
        icon={<CheckCircle2 className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Statistics and summaries */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Resumen Histórico de Ejecución Académica</CardTitle>
              <CardDescription>Consolidado final de dictado semestral regular</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 text-xs text-slate-700 font-bold divide-y divide-slate-100/70">
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Total de Semanas Ejecutadas:</span>
              <span className="text-slate-900 font-extrabold">{weeksCount} de 16 Semanas Curriculares</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Materiales de Estudio Publicados:</span>
              <span className="text-slate-900">{materialsCount} recursos didácticos activos</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Talleres y Prácticas Validadas:</span>
              <span className="text-slate-900">{assignmentsCount} tareas evaluadas</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Promedio General de Rendimiento:</span>
              <span className="text-[#8B0026] font-display font-black text-sm">{averageGpa.toFixed(2)} / 20</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Estado de Envío de Actas:</span>
              <span>
                {isSigned ? (
                  <Badge variant="success" className="font-extrabold tracking-wider px-3 border py-0.5 text-[9px] uppercase">ENVIADO Y FIRMADO</Badge>
                ) : (
                  <Badge variant="warning" className="font-extrabold tracking-wider px-3 border py-0.5 text-[9px] uppercase">PENDIENTE DE FIRMA</Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Panel */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Servicios de Coordinación</CardTitle>
              <CardDescription>Acciones de fin de curso</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-3">
            <Button 
              onClick={() => setShowActaModal(true)} 
              variant="primary" 
              fullWidth
              className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026]"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-amber-300 animate-pulse" /> Generar Acta Oficial SFA
            </Button>
            <Button 
              onClick={() => showToast("📈 El Reporte Consolidado de Rendimiento ha sido exitosamente generado y enviado a Coordinación Académica.")} 
              variant="outline" 
              fullWidth
              className="font-black text-[10px]"
            >
              Generar Reporte de Rendimiento
            </Button>
            <Button 
              onClick={() => showToast("📥 El PDF oficial del curso con todas sus calificaciones ha sido descargado al sistema.")} 
              variant="outline" 
              fullWidth
              className="font-black text-[10px]"
            >
              Exportar a PDF
            </Button>
            <Button 
              onClick={() => showToast("📊 La hoja de cálculo Excel (.xlsx) de notas de alumnos se compiló y descargó.")} 
              variant="outline" 
              fullWidth
              className="font-black text-[10px]"
            >
              Exportar a Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Digital ACTA Modal overlay */}
      {showActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in font-sans">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 shadow-2xl relative border-t-8 border-[#8B0026] text-left">
            <button 
              onClick={() => setShowActaModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-450"
            >
              <X className="w-5 h-5" />
            </button>

            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>ACTA CONSOLIDADA DE EVALUACIÓN SEMESTRAL</CardTitle>
                  <CardDescription>IESTP San Francisco de Asís • Cátedra: {course.name} ({course.code})</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 font-sans space-y-5 text-slate-800 text-xs font-bold leading-normal">
              {/* Institutional Headers */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap justify-between gap-4">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">PROGRAMA ACADÉMICO</span>
                  <span className="text-slate-900 uppercase">Sistemas & Electrotecnia</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">DOCENTE AUXILIAR</span>
                  <span className="text-slate-900">Ing. Miguel Ángel Ramos Torres</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">SEMESTRE LECTIVO</span>
                  <span className="text-slate-900">Regular</span>
                </div>
              </div>

              {/* Grid ratings spreadsheet */}
              <div className="space-y-2 border rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-100 flex justify-between text-[10px] font-black text-slate-450 tracking-wider uppercase select-none">
                  <span className="w-1/3">DNI & Alumno</span>
                  <span className="w-1/4 text-center">N1 (S4)</span>
                  <span className="w-1/4 text-center">N2 (S8)</span>
                  <span className="w-1/4 text-center">Promedio Final</span>
                </div>

                {ROSTER.map((std, idx) => {
                  // Preconfigure realistic grades mapping students
                  const grade1 = [17, 15, 14, 16, 12][idx];
                  const grade2 = [18, 16, 15, 14, 11][idx];
                  const finalAvg = Math.round((grade1 + grade2) / 2);

                  return (
                    <div key={std.dni} className="p-3.5 flex justify-between items-center bg-white">
                      <div className="w-1/3 text-left">
                        <span className="font-extrabold text-slate-900 block">{std.name} {std.lastName}</span>
                        <span className="text-[9.5px] text-slate-400">DNI: {std.dni}</span>
                      </div>
                      <span className="w-1/4 text-center font-mono font-bold text-slate-700">{grade1}</span>
                      <span className="w-1/4 text-center font-mono font-bold text-slate-700">{grade2}</span>
                      <span className="w-1/4 text-center font-mono font-black text-[#8B0026] text-sm">{finalAvg}</span>
                    </div>
                  );
                })}
              </div>

              {/* Digital signature form */}
              <div className="p-5 border border-dashed rounded-xl border-[#8B0026]/40 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-left space-y-1 md:max-w-md">
                  <span className="text-[#8B0026] block font-black text-xs uppercase tracking-wider">Firma Electrónica Autorizada SFA</span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Al proceder con su firma ingresando su DNI de identificación oficial, las notas pasarán a un estado permanente de sólo lectura, sincronizadas con el sistema nacional de actas del Ministerio de Educación del Perú.
                  </p>
                </div>

                {isSigned ? (
                  <div className="flex items-center gap-2 text-emerald-600 border border-emerald-200 bg-emerald-50 px-4 py-2.5 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs uppercase font-extrabold tracking-wider">FIRMADO ELECTRÓNICAMENTE</span>
                  </div>
                ) : (
                  <form onSubmit={handleSignActa} className="flex gap-2 w-full md:w-auto">
                    <input 
                      type="password"
                      required
                      placeholder="Ingrese DNI Docente"
                      value={signDni}
                      onChange={(e) => setSignDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      className="w-44 px-3 py-2 bg-white border rounded-md font-mono text-center tracking-widest focus:outline-[#8B0026] font-black text-sm h-10"
                    />
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="font-black text-[9.5px] tracking-wider uppercase bg-[#8B0026] h-10 text-white shrink-0 px-4"
                    >
                      Firmar Acta
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 justify-end gap-2 p-4">
              <Button onClick={() => setShowActaModal(false)} variant="outline" className="font-bold text-xs">
                Cerrar Vista Preliminar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

