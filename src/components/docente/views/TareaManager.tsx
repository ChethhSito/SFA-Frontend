import React, { useRef, useState } from "react";
import { Plus, Trash2, Calendar, FileText, Upload, ClipboardList, CheckCircle2, Eye, Download } from "lucide-react";
import { CourseAssignment } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";
import { courseFileUrl } from "../../../services/api";

interface Props {
  courseId: string;
  week: number;
  assignments: CourseAssignment[];
  onPublishAssignment: (title: string, desc: string, dueDate: string, attachment?: File, rubric?: string) => Promise<boolean | undefined>;
  onDeleteAssignment: (id: string) => void;
  onOpenGradingTab?: (assignment: CourseAssignment) => void;
}

export function TareaManager({ 
  courseId, 
  week, 
  assignments, 
  onPublishAssignment, 
  onDeleteAssignment,
  onOpenGradingTab
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [rubric, setRubric] = useState("");
  const [saving, setSaving] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate || saving) return;
    setSaving(true);
    let saved = false;
    try { 
      saved = !!await onPublishAssignment(title.trim(), description.trim(), dueDate, attachment || undefined, rubric.trim() || undefined); 
    } finally { 
      setSaving(false); 
    }
    if (!saved) return;
    setTitle("");
    setDescription("");
    setDueDate("");
    setAttachment(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    setRubric("");
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <PageHeader
        title={`Semana ${week}: Publicación de Tareas Evaluativas`}
        subtitle="Regule entregables de taller, especificaciones técnicas y configure fechas límite de recepción."
        icon={<Plus className="w-5 h-5 text-[#800521]" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formulario de Nueva Tarea (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-5">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">Programar Nueva Tarea</h3>
              <p className="text-xs text-slate-500 font-medium">Configure los lineamientos y plazos de entrega.</p>
            </div>
            <ClipboardList className="w-5 h-5 text-[#800521]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Título de la Tarea / Informe
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Laboratorio 1: Script de Escalamiento S7-1200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Instrucciones y Requisitos
              </label>
              <textarea
                required
                rows={3}
                placeholder="Escriba los lineamientos de entrega, formato del código, esquema eléctrico, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Fecha Límite de Bloqueo
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Guía de Práctica Adjunta (Opcional)
              </label>
              <div 
                onClick={() => attachmentInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-[#800521]/50 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 text-center cursor-pointer transition-all flex items-center justify-center gap-2.5 group"
              >
                <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#800521] transition-colors" />
                <span className="text-xs font-bold text-slate-600 truncate">
                  {attachment ? attachment.name : "Adjuntar PDF o rúbrica de taller"}
                </span>
              </div>
              <input
                type="file"
                ref={attachmentInputRef}
                accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Criterios de Evaluación / Rúbrica (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Circuito: 10pts, Lógica Ladder: 5pts, Informe: 5pts"
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !title.trim() || !description.trim() || !dueDate}
              className="w-full bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>{saving ? "Publicando..." : "Publicar Tarea"}</span>
            </button>
          </form>
        </div>

        {/* Listado de Tareas Programadas (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Tareas Abiertas en Semana {week}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Lista de entregas activas para revisión y calificación digital.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-black font-mono">
              {assignments.length} {assignments.length === 1 ? "tarea" : "tareas"}
            </span>
          </div>

          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center mb-1">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  No hay tareas programadas en esta semana
                </h4>
                <p className="text-xs text-slate-400 font-medium max-w-sm">
                  Utilice el panel lateral para formalizar guías de taller o trabajos de laboratorio para los estudiantes.
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#800521]/10 text-[#800521] border border-[#800521]/20 px-2 py-0.5 rounded text-[9.5px] font-black uppercase font-mono">
                          Semana {week}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">
                          {assignment.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteAssignment(assignment.id)}
                      className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-4 text-slate-500 font-semibold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Límite: <strong className="text-slate-700">{assignment.dueDate}</strong>
                      </span>
                      {assignment.attachmentName && (
                        <a
                          href={courseFileUrl('assignments', assignment.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[#800521] hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          {assignment.attachmentName}
                        </a>
                      )}
                    </div>

                    {onOpenGradingTab && (
                      <button
                        type="button"
                        onClick={() => onOpenGradingTab(assignment)}
                        className="bg-white hover:bg-slate-100 text-[#800521] border border-slate-200 px-3 py-1.5 rounded-xl font-extrabold text-[11px] uppercase flex items-center gap-1.5 shadow-3xs cursor-pointer transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Revisar Entregas
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
