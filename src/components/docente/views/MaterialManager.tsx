import React, { useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
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
    } finally { setSaving(false); }
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
                <label className="block text-slate-500 uppercase text-[9.5px] tracking-wide mb-1">Título del Recurso</label>
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
                <label className="block text-slate-500 uppercase text-[9.5px] tracking-wide mb-1">Archivo real (máximo 10 MB)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  required
                  accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.mp4"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-md font-mono text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <Button type="submit" disabled={saving} variant="primary" fullWidth className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026] text-white">
                <Upload className="w-4 h-4 mr-1.5" /> {saving ? "Subiendo..." : "Publicar Material"}
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
                  <div key={mat.id} className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between transition-colors gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg border font-black text-[10px] uppercase font-mono ${getFileIconColor(mat.fileName.split(".").pop() || "pdf")}`}>
                        {mat.fileName.split(".").pop()?.toUpperCase() || "ZIP"}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="font-extrabold text-slate-900 block truncate text-xs">{mat.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Archivo: {mat.storedFileName ? <a href={courseFileUrl('materials', mat.id)} className="font-mono underline text-blue-600">{mat.fileName}</a> : <span className="font-mono">{mat.fileName} (registro antiguo sin archivo)</span>} • Publicado: {mat.date}
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
