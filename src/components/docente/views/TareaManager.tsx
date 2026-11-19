import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Calendar, FileText, Upload, ClipboardList, CheckCircle2, Eye, Download, X, ExternalLink } from "lucide-react";
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
  const [previewPdfUrl, setPreviewPdfUrl] = useState<{ url: string; name: string } | null>(null);
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

              {!attachment ? (
                <div 
                  onClick={() => attachmentInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-[#800521]/50 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3.5 text-center cursor-pointer transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#800521] transition-colors" />
                  <span className="text-xs font-bold text-slate-600 truncate">
                    Adjuntar PDF o rúbrica de taller
                  </span>
                </div>
              ) : (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#800521] border border-red-200 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 block truncate" title={attachment.name}>
                          {attachment.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {(attachment.size / 1024).toFixed(1)} KB • Archivo cargado
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(attachment);
                        setPreviewPdfUrl({ url, name: attachment.name });
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                      title="Ver contenido del PDF en visor modal"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAttachment(null);
                        if (attachmentInputRef.current) attachmentInputRef.current.value = "";
                      }}
                      className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                      title="Quitar archivo adjunto"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              )}

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
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPdfUrl({
                              url: courseFileUrl('assignments', assignment.id),
                              name: assignment.attachmentName || "Guia_Practica.pdf"
                            });
                          }}
                          className="font-mono text-[#800521] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-[11px] font-bold"
                          title="Ver PDF en visor modal"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#800521]" />
                          <span>{assignment.attachmentName}</span>
                        </button>
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

      {/* Modal Visor Oficial de PDF */}
      {previewPdfUrl && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewPdfUrl(null);
            }
          }}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[85vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Visor */}
            <div className="bg-[#800521] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-xs border-b border-[#800521]/20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-white/10 text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Visor de Guía de Práctica / Documento
                  </h3>
                  <p className="text-[10.5px] text-rose-200 font-mono truncate max-w-md">
                    {previewPdfUrl.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => window.open(previewPdfUrl.url, "_blank")}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Abrir en pestaña nueva"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Pestaña Externa</span>
                </button>
                <button 
                  onClick={() => setPreviewPdfUrl(null)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cerrar visor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Visor con iframe embebido */}
            <div className="flex-1 p-2 bg-slate-100 flex flex-col overflow-hidden">
              <iframe
                src={previewPdfUrl.url}
                title={previewPdfUrl.name}
                className="w-full flex-1 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-slate-500 font-bold truncate max-w-sm">
                {previewPdfUrl.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
