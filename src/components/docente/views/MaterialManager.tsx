import React, { useRef, useState } from "react";
import { Upload, Trash2, FileText, BookOpen, AlertCircle, CheckCircle2, Download, Eye } from "lucide-react";
import { CourseMaterial } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";
import { courseFileUrl } from "../../../services/api";

interface Props {
  courseId: string;
  week: number;
  materials: CourseMaterial[];
  onPublishMaterial: (title: string, file: File) => Promise<boolean>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

export function MaterialManager({ courseId, week, materials, onPublishMaterial, onDeleteMaterial }: Props) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file || saving) return;
    setSaving(true);
    try {
      if (await onPublishMaterial(title.trim(), file)) {
        setTitle("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } finally { 
      setSaving(false); 
    }
  };

  const getFileBadge = (fileName: string) => {
    const ext = (fileName.split(".").pop() || "PDF").toUpperCase();
    switch (ext) {
      case "PDF":
        return { label: "PDF", bg: "bg-rose-50 text-rose-700 border-rose-200" };
      case "DOC":
      case "DOCX":
        return { label: "WORD", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "PPT":
      case "PPTX":
        return { label: "PPT", bg: "bg-orange-50 text-orange-700 border-orange-200" };
      case "XLS":
      case "XLSX":
        return { label: "EXCEL", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "MP4":
        return { label: "VIDEO", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      default:
        return { label: ext, bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <PageHeader
        title={`Semana ${week}: Publicación de Material Didáctico`}
        subtitle="Comparta archivos lectivos estructurados para incentivar el estudio asíncrono y la preparación de taller."
        icon={<Upload className="w-5 h-5 text-[#800521]" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Carga */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-5">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">Subir Nuevo Recurso</h3>
              <p className="text-xs text-slate-500 font-medium">Asigne el título y adjunte el archivo para la sesión.</p>
            </div>
            <FileText className="w-5 h-5 text-[#800521]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Título del Recurso Didáctico
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Diapositivas de Arranque Estrella-Triángulo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#800521] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                Archivo Lectivo (Máximo 10 MB)
              </label>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-[#800521]/50 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 group-hover:text-[#800521] group-hover:border-[#800521] flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-700 block">Haga clic para seleccionar archivo</span>
                    <span className="text-[9.5px] text-slate-400 font-medium block">PDF, DOCX, PPTX, XLSX, MP4</span>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#800521] border border-red-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="text-xs font-bold text-slate-800 block truncate" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {(file.size / 1024).toFixed(1)} KB • Archivo cargado
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(file);
                        window.open(url, "_blank");
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
                      title="Ver contenido del archivo en nueva pestaña"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver Archivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
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
                ref={fileInputRef}
                required
                accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.mp4"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !title.trim() || !file}
              className="w-full bg-[#800521] hover:bg-[#66041a] text-white font-extrabold text-xs uppercase px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>{saving ? "Subiendo material..." : "Publicar Material"}</span>
            </button>
          </form>
        </div>

        {/* Listado de Materiales Publicados */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 space-y-4">
          <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                Archivos Publicados en Semana {week}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Recursos pedagógicos habilitados para los alumnos de la asignatura.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-black font-mono">
              {materials.length} {materials.length === 1 ? "recurso" : "recursos"}
            </span>
          </div>

          <div className="space-y-3">
            {materials.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#800521]/10 text-[#800521] border border-[#800521]/20 flex items-center justify-center mb-1">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                  No hay materiales lectivos publicados
                </h4>
                <p className="text-xs text-slate-400 font-medium max-w-sm">
                  Utilice el panel lateral para dar de alta diapositivas, hojas de operación o lecturas para la Semana {week}.
                </p>
              </div>
            ) : (
              materials.map((mat) => {
                const badge = getFileBadge(mat.fileName);

                return (
                  <div 
                    key={mat.id} 
                    className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between transition-all gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-black text-xs font-mono shrink-0 shadow-3xs ${badge.bg}`}>
                        {badge.label}
                      </div>
                      <div className="min-w-0 text-left space-y-0.5">
                        <span className="font-extrabold text-slate-900 block truncate text-xs">
                          {mat.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-bold">
                          {mat.storedFileName ? (
                            <a 
                              href={courseFileUrl('materials', mat.id)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="font-mono text-[#800521] hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              {mat.fileName}
                            </a>
                          ) : (
                            <span className="font-mono">{mat.fileName}</span>
                          )}
                          <span>•</span>
                          <span>Publicado: {mat.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                      title="Eliminar material didáctico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
