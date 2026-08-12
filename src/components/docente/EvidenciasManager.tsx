import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Image, Trash2, Info, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import PageHeader from "../ui-custom/PageHeader";

interface EvidenciaItem {
  id: string;
  category: "Fotografia" | "Reporte" | "Laboratorio" | "Actividad";
  title: string;
  fileName: string;
  fileSize: string;
  date: string;
}

interface EvidenciasManagerProps {
  courseId: string;
  week: number;
}

export default function EvidenciasManager({ courseId, week }: EvidenciasManagerProps) {
  const [evidenceList, setEvidenceList] = useState<EvidenciaItem[]>([]);
  const [category, setCategory] = useState<"Fotografia" | "Reporte" | "Laboratorio" | "Actividad">("Laboratorio");
  const [customTitle, setCustomTitle] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const key = `sfa_evidencias_${courseId}_w${week}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setEvidenceList(JSON.parse(saved));
    } else {
      // Seed initial mock evidence
      const initial: EvidenciaItem[] = [
        {
          id: `ev-mock-1`,
          category: "Laboratorio",
          title: "Captura de lógica Siemens Step7 en ejecución",
          fileName: "plc_siemens_step_7_logic.png",
          fileSize: "1.4 MB",
          date: new Date().toLocaleDateString("es-PE")
        }
      ];
      setEvidenceList(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [courseId, week]);

  const saveEvidences = (updated: EvidenciaItem[]) => {
    setEvidenceList(updated);
    const key = `sfa_evidencias_${courseId}_w${week}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const titleText = customTitle.trim() || `Evidencia académica de clase`;
    const newEv: EvidenciaItem = {
      id: `ev-${Date.now()}`,
      category: category,
      title: titleText,
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(1) + " MB",
      date: new Date().toLocaleDateString("es-PE")
    };
    saveEvidences([newEv, ...evidenceList]);
    setCustomTitle("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDelete = (id: string) => {
    const filtered = evidenceList.filter((item) => item.id !== id);
    saveEvidences(filtered);
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Fotografia":
        return { label: "Fotografía de Aula", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "Reporte":
        return { label: "Archivo de Reporte", bg: "bg-purple-50 text-purple-800 border-purple-200" };
      case "Laboratorio":
        return { label: "Evidencia de Laboratorio", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "Actividad":
        return { label: "Actividad Académica", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      default:
        return { label: "General", bg: "bg-slate-50 text-slate-800 border-slate-200" };
    }
  };

  return (
    <div id="evidencias-section" className="space-y-6 text-left">
      <PageHeader
        title={`Semana ${week}: Archivo Histórico de Evidencias`}
        subtitle="Almacene el testimonio fotográfico y documental de las clases dictadas para sustentar avance silábico de acreditación."
        icon={<Upload className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload evidence left panel */}
        <Card className="lg:col-span-2 text-left">
          <CardHeader>
            <CardTitle>Cargar Evidencia Académica</CardTitle>
            <CardDescription>Establezca los metadatos de clasificación antes de cargar</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="text-xs font-bold text-slate-705 space-y-3.5">
              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Asignar Título o Leyenda</label>
                <input
                  type="text"
                  placeholder="Ej: Ensamblaje y pruebas de puente de diodos"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Categoría de Evidencia</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                >
                  <option value="Laboratorio">Evidencia de Laboratorio / Taller</option>
                  <option value="Fotografia">Fotografía de Aula (Presencial)</option>
                  <option value="Reporte">Archivo de Reporte Académico</option>
                  <option value="Actividad">Actividad Académica (Avance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[9px] mb-2 font-black">Archivo (Arrastre o Seleccione)</label>
                
                {/* Drag-and-drop zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerInputClick}
                  className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-[#8B0026] bg-[#8B0026]/5 text-[#8B0026]"
                      : "border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="h-10 w-10 rounded-full bg-white shadow-xs border flex items-center justify-center mb-2.5 text-slate-400">
                    <Upload className="w-5 h-5 text-[#8B0026]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-800 block">
                    Arrastre su archivo de evidencia aquí
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                    o haga clic para examinar sus carpetas locales.
                  </span>
                  <span className="text-[9px] text-[#CFA020] font-bold block mt-1.5 font-mono uppercase">
                    Formatos: PNG, JPG, PDF, DOCX (MÁX. 10MB)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded evidence history right panel */}
        <Card className="lg:col-span-3 text-left">
          <CardHeader>
            <CardTitle>Historial de Evidencias Publicadas</CardTitle>
            <CardDescription>Documentación acumulada para auditoría de acreditación institucional</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {evidenceList.length === 0 ? (
              <div className="p-12 text-center text-slate-450 italic font-bold">
                <p>No se registran archivos de evidencia para esta semana.</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Cargue capturas o reportes fotográficos en la sección izquierda.</p>
              </div>
            ) : (
              evidenceList.map((item) => {
                const catTheme = getCategoryTheme(item.category);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-4 transition-colors text-xs"
                  >
                    <div className="flex gap-3 text-left">
                      <div className="h-10 w-10 bg-white border rounded-lg flex items-center justify-center shrink-0 text-slate-400">
                        {item.category === "Fotografia" ? (
                          <Image className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#8B0026]" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`font-mono text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded border select-none ${catTheme.bg}`}>
                            {catTheme.label}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold leading-none">
                            Subido: {item.date}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-slate-900 leading-snug uppercase pt-0.5" title={item.title}>
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-slate-500 font-bold block truncate font-mono">
                          Archivo: {item.fileName} • Tamaño: {item.fileSize}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Eliminar evidencia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}

            <div className="pt-2 p-3 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl text-[10px] text-amber-900 font-bold leading-relaxed flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                **Importante**: Las evidencias almacenadas forman parte de la carpeta pedagógica digital del docente para el licenciamiento del programa de estudios ante el MINEDU.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

