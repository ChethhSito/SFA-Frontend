import React, { useState } from "react";
import { Info, Mail, Megaphone, FileText, Download, Plus, Trash2, Shield, Calendar, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import Button from "../ui-custom/Button";
import PageHeader from "../ui-custom/PageHeader";

interface AvisosReportesPrincipalProps {
  initialSubTab?: "avisos" | "comunicados" | "reportes";
}

interface AvisoItem {
  id: string;
  sender: "Dirección General" | "Coordinación Académica" | "Administración";
  title: string;
  body: string;
  date: string;
}

interface ComunicadoItem {
  id: string;
  senderName: string;
  courseCode: string;
  title: string;
  body: string;
  date: string;
}

export default function AvisosReportesPrincipal({ initialSubTab = "avisos" }: AvisosReportesPrincipalProps) {
  const [subTab, setSubTab] = useState<"avisos" | "comunicados" | "reportes">(initialSubTab);

  // Core Data Lists
  const [instNotices, setInstNotices] = useState<AvisoItem[]>([
    {
      id: "avis-1",
      sender: "Coordinación Académica",
      title: "Cierre de Carga de Syllabus - Semana 8",
      body: "Se solicita a toda la plana de catedráticos regularizar los registros de asistencia y notas parciales correspondientes a la primera mitad del semestre para consolidación de reportes.",
      date: "2026-06-01"
    },
    {
      id: "avis-2",
      sender: "Administración",
      title: "Inventario de Licencias y Módulos Siemens S7-1500",
      body: "Se han adquirido licencias educativas definitivas de Siemens TIA Portal v18 para el Laboratorio de Automatización Industrial. Validar instalación antes de clase práctica.",
      date: "2026-05-28"
    },
    {
      id: "avis-3",
      sender: "Dirección General",
      title: "Mantenimiento Preventivo de Servidores Intranet",
      body: "Se interrumpirá el acceso a los portales docente y alumno el día de mañana de 02:00 AM a 05:00 AM por actualización de base de datos regular.",
      date: "2026-05-25"
    }
  ]);

  const [acadComms, setAcadComms] = useState<ComunicadoItem[]>([
    {
      id: "comm-1",
      senderName: "Prof. Miguel Ángel Ramos Torres",
      courseCode: "EE-101",
      title: "Guía de Trabajo con Simulador PLC Factory IO",
      body: "Estimados alumnos de Automatización Industrial, he publicado las diapositivas de soporte técnico para configurar escenas 3D interconectadas con TIA Portal.",
      date: "2026-06-02"
    },
    {
      id: "comm-2",
      senderName: "Prof. Miguel Ángel Ramos Torres",
      courseCode: "SY-301",
      title: "Estructuración de EDT y diccionarios de control",
      body: "Firma obligatoria del Acta Scrum para el Sprint 2 por equipos. Sincronizar avances en la carpeta Drive de coordinación antes de la semana 5.",
      date: "2026-05-30"
    }
  ]);

  // Form states for publishing academic communication
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCourse, setNewCourse] = useState("EE-101");

  const handlePostComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const newItem: ComunicadoItem = {
      id: `comm-${Date.now()}`,
      senderName: "Prof. Miguel Ángel Ramos Torres",
      courseCode: newCourse,
      title: newTitle.trim(),
      body: newBody.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    setAcadComms([newItem, ...acadComms]);
    setNewTitle("");
    setNewBody("");

    // Success notify
    const alertId = "comm-posted-alert";
    const element = document.getElementById(alertId);
    if (element) {
      element.classList.remove("hidden");
      setTimeout(() => element.classList.add("hidden"), 3000);
    }
  };

  const handleDeleteComm = (id: string) => {
    setAcadComms(acadComms.filter((c) => c.id !== id));
  };

  return (
    <div id="avisos-reportes-principal-container" className="space-y-6 text-left">
      <PageHeader
        title="Canales de Avisos y Reportes Oficiales"
        subtitle="Regule comunicados públicos para su alumnado y supervise reportes administrativos e institucionales de acreditación escolar."
        icon={<Megaphone className="w-5 h-5 text-[#8B0026]" />}
      />

      {/* Selector SubTabs Button Groups */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border w-full font-sans select-none">
        <button
          onClick={() => setSubTab("avisos")}
          className={`flex-1 max-w-sm py-2 px-4 rounded-lg text-xs font-extrabold uppercase transition-all tracking-wide ${
            subTab === "avisos"
              ? "bg-[#8B0026] text-white shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Avisos Institucionales
        </button>
        <button
          onClick={() => setSubTab("comunicados")}
          className={`flex-1 max-w-sm py-2 px-4 rounded-lg text-xs font-extrabold uppercase transition-all tracking-wide ${
            subTab === "comunicados"
              ? "bg-[#8B0026] text-white shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Comunicados Académicos
        </button>
        <button
          onClick={() => setSubTab("reportes")}
          className={`flex-1 max-w-sm py-2 px-4 rounded-lg text-xs font-extrabold uppercase transition-all tracking-wide ${
            subTab === "reportes"
              ? "bg-[#8B0026] text-white shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Reportes Generales
        </button>
      </div>

      {/* SubView 1: Avisos Institucionales */}
      {subTab === "avisos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          <div className="lg:col-span-2 space-y-4">
            {instNotices.map((av) => {
              let senderColor = "bg-rose-50 text-[#8B0026] border-red-200";
              if (av.sender === "Coordinación Académica") senderColor = "bg-blue-50 text-blue-700 border-blue-200";
              if (av.sender === "Administración") senderColor = "bg-amber-50 text-amber-700 border-amber-200";

              return (
                <Card key={av.id} className="p-5 border border-slate-150/80 shadow-xs hover:border-slate-200 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3 text-xs font-bold text-slate-505">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#8B0026]" />
                      <span className={`px-2 py-0.5 rounded border text-[9.5px] uppercase tracking-wider font-extrabold ${senderColor}`}>
                        {av.sender}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      Publicado: {av.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{av.title}</h4>
                  <p className="text-xs text-slate-655 text-slate-600 mt-2 font-medium leading-relaxed">
                    {av.body}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card className="p-5 flex flex-col justify-between text-xs font-bold text-slate-550 border border-slate-150/80 bg-slate-50/40">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Normas del Canal</h4>
              <p className="leading-relaxed font-semibold">
                Este canal refleja avisos oficiales emitidos desde los mandos ejecutivos autorizados del IESTP San Francisco de Asís.
              </p>
              <p className="leading-relaxed font-semibold">
                Los docentes deben revisar regularmente este panel para dar cumplimiento a las memorias y pautas dictadas.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* SubView 2: Academic Communications (Postable by Teacher) */}
      {subTab === "comunicados" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 font-sans">
          {/* Create Comm Left Panel */}
          <Card className="lg:col-span-2 text-left border border-slate-150">
            <CardHeader>
              <CardTitle>Emitir Comunicado Académico</CardTitle>
              <CardDescription>Publique anuncios generales directamente en el feed de sus alumnos matriculados</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handlePostComm} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Asignatura Destino</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-white border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                  >
                    <option value="EE-101">EE-101 • Automatización Industrial y PLC</option>
                    <option value="EE-102">EE-102 • Circuitos de Media y Baja Tensión</option>
                    <option value="SY-301">SY-301 • Administración de Proyectos Informáticos</option>
                    <option value="SY-302">SY-302 • Redes y Comunicación de Datos II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Asunto / Título</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Fechas de sustentación presencial de proyectos"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase text-[9px] mb-1 font-black">Detalle del Comunicado</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Escriba los pormenores, enlaces o recordatorios para sus alumnos..."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md font-semibold text-slate-800 focus:outline-[#8B0026] resize-none"
                  />
                </div>

                <div className="pt-2">
                  <div
                    id="comm-posted-alert"
                    className="hidden mb-3 flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-250 py-1.5 px-3 rounded-lg text-[10.5px] font-bold"
                  >
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Comunicado publicado y enviado con éxito a los alumnos.</span>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="font-black text-[10.5px] py-3 uppercase tracking-wider bg-[#8B0026] text-white"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Publicar Comunicado
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Comms Feed list Right Column */}
          <div className="lg:col-span-3 space-y-4">
            {acadComms.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">No ha emitido comunicados académicos aún.</div>
            ) : (
              acadComms.map((comm) => (
                <Card key={comm.id} className="p-5 border border-slate-150 relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-extrabold text-slate-700">{comm.senderName}</span>
                      <span className="font-mono text-[9px] bg-red-50 hover:bg-slate-100 border border-red-200 text-[#8B0026] py-0.5 px-1.5 rounded font-black">
                        {comm.courseCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 font-bold">{comm.date}</span>
                      <button
                        onClick={() => handleDeleteComm(comm.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Eliminar comunicado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{comm.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed block mt-2 font-medium">
                    {comm.body}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* SubView 3: Administrative Generales Reports printable */}
      {subTab === "reportes" && (
        <div id="general-reports-panel" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans text-xs">
          {/* Report 1: Syllabus Compliance */}
          <Card className="border border-slate-150">
            <CardHeader className="flex gap-2.5">
              <div className="h-9 w-9 bg-emerald-50 rounded flex items-center justify-center text-emerald-600 border border-emerald-100">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <CardTitle>Reporte de Avance de Syllabus</CardTitle>
                <CardDescription>Consolidado y cumplimiento de unidades didácticas</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="font-semibold text-slate-600 leading-relaxed text-left space-y-1.5">
                <div className="flex justify-between">
                  <span>Semanas Cubiertas:</span>
                  <span className="font-bold text-slate-900">16 de 16 Semanas</span>
                </div>
                <div className="flex justify-between">
                  <span>Progreso de Dictado:</span>
                  <span className="font-bold text-emerald-600 font-mono">100% de Cumplimiento</span>
                </div>
                <div className="flex justify-between">
                  <span>Inconsistencias:</span>
                  <span className="font-bold text-slate-500 font-semibold">0 Incidencias registradas</span>
                </div>
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => window.print()}
                className="font-bold text-[10.5px] uppercase tracking-wider py-2 bg-slate-50"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Exportar Reporte Silábico
              </Button>
            </CardContent>
          </Card>

          {/* Report 2: Hours contract */}
          <Card className="border border-slate-150">
            <CardHeader className="flex gap-2.5">
              <div className="h-9 w-9 bg-[#8B0026]/5 rounded flex items-center justify-center text-[#8B0026] border border-red-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-left">
                <CardTitle>Horas de Dictado y Carga Horaria</CardTitle>
                <CardDescription>Sustentación de asistencia y horas presenciales de clase</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-left">
              <div className="font-semibold text-slate-650 leading-relaxed space-y-1.5">
                <div className="flex justify-between">
                  <span>Horas Contratadas:</span>
                  <span className="font-bold text-slate-900">32 Horas Mensuales</span>
                </div>
                <div className="flex justify-between">
                  <span>Horas Dictadas Sincronizadas:</span>
                  <span className="font-bold text-emerald-600 font-mono">32 Horas Sustentadas</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado de conformidad:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.2 rounded-sm text-[9.5px] uppercase">Conforme</span>
                </div>
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => window.print()}
                className="font-bold text-[10.5px] uppercase tracking-wider py-2 bg-slate-50"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Imprimir Acta de Horas
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

