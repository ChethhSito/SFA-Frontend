import React, { useState, useMemo } from "react";
import { Info, Mail, Megaphone, FileText, Download, Plus, Trash2, Shield, Calendar, User, ShieldCheck, School, Clock3, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { Course } from "../../types";

interface AvisosReportesPrincipalProps {
  initialSubTab?: "avisos" | "comunicados" | "reportes";
  teacherName?: string;
  courses?: Course[];
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

export default function AvisosReportesPrincipal({ 
  initialSubTab = "avisos",
  teacherName = "Docente Titular",
  courses = []
}: AvisosReportesPrincipalProps) {
  const [subTab, setSubTab] = useState<"avisos" | "comunicados" | "reportes">(initialSubTab);

  // Core Data Lists with localStorage persistence and dynamic 2027 dates
  const [instNotices, setInstNotices] = useState<AvisoItem[]>(() => {
    try {
      const stored = localStorage.getItem("sfa_inst_notices");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "avis-1",
        sender: "Coordinación Académica",
        title: "Cierre de Carga de Syllabus y Actas Parciales",
        body: "Se solicita a toda la plana de catedráticos regularizar los registros de asistencia y notas parciales correspondientes al módulo en curso para consolidación de reportes institucionales.",
        date: "2027-03-25"
      },
      {
        id: "avis-2",
        sender: "Administración",
        title: "Recursos y Equipamiento en Laboratorios Tecnológicos",
        body: "Se han actualizado las plataformas y herramientas educativas para las prácticas institucionales en talleres y laboratorios. Validar operatividad antes de las sesiones prácticas.",
        date: "2027-03-22"
      },
      {
        id: "avis-3",
        sender: "Dirección General",
        title: "Mantenimiento Preventivo de Servidores Intranet",
        body: "Se interrumpirá el acceso a los portales docente y alumno el día de mañana de 02:00 AM a 05:00 AM por actualización de base de datos y optimización de servicios de red.",
        date: "2027-03-18"
      }
    ];
  });

  const [acadComms, setAcadComms] = useState<ComunicadoItem[]>(() => {
    try {
      const stored = localStorage.getItem("sfa_teacher_comms");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "comm-1",
        senderName: teacherName,
        courseCode: courses[0]?.code || "EIND-101",
        title: "Publicación de Guía de Aprendizaje e Indicaciones",
        body: "Estimados estudiantes, se han publicado los materiales lectivos y rúbricas de evaluación correspondientes a las unidades temáticas del semestre en vigor.",
        date: "2027-03-24"
      }
    ];
  });

  // Dynamic hours calculation based on real courses
  const totalWeeklyHours = useMemo(() => {
    if (!courses || courses.length === 0) return 8;
    return courses.reduce((acc, c) => acc + (c.credits ? c.credits * 2 : 4), 0);
  }, [courses]);
  const totalMonthlyHours = totalWeeklyHours * 4;

  // Form states for publishing academic communication
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCourse, setNewCourse] = useState(courses[0]?.code || "General");

  const handlePostComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const newItem: ComunicadoItem = {
      id: `comm-${Date.now()}`,
      senderName: teacherName,
      courseCode: newCourse,
      title: newTitle.trim(),
      body: newBody.trim(),
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [newItem, ...acadComms];
    setAcadComms(updated);
    try {
      localStorage.setItem("sfa_teacher_comms", JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving sfa_teacher_comms:", err);
    }

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
    const updated = acadComms.filter((c) => c.id !== id);
    setAcadComms(updated);
    try {
      localStorage.setItem("sfa_teacher_comms", JSON.stringify(updated));
    } catch (err) {
      console.error("Error updating sfa_teacher_comms:", err);
    }
  };

  return (
    <div id="avisos-reportes-principal-container" className="space-y-6 text-left font-sans">
      {/* 1. Header Borgoña Institucional */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-8 overflow-hidden text-left border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] via-[#800521] to-slate-950/85 opacity-95" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL DOCENTE • COMUNICACIÓN Y REPORTES ACADÉMICOS
            </span>
            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Avisos Institucionales y Reportes
            </h1>
            <p className="text-xs text-white/90 font-medium max-w-2xl font-mono">
              Directivas oficiales de Dirección General, comunicados a sus comités estudiantiles y descarga de reportes curriculares.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Circulares</span>
              <span className="text-xs font-black text-white font-mono">{instNotices.length} Activas</span>
            </div>
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-300 font-extrabold block uppercase mb-0.5 tracking-wider">Comunicados</span>
              <span className="text-xs font-black text-emerald-400 font-mono">{acadComms.length} Emitidos</span>
            </div>
          </div>
        </div>

        {/* Cinta de Parámetros */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-white/90">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Emisión Oficial</span>
              <span className="font-extrabold text-white">Canal Institucional SFA</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <School className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Destinatarios</span>
              <span className="font-extrabold text-white">Plana Docente & Alumnos</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock3 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Frecuencia</span>
              <span className="font-extrabold text-white">Actualización Continua</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-white/60 block">Validez</span>
              <span className="font-extrabold text-white">Régimen Semestre 2027-I</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector SubTabs Button Groups */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full font-sans select-none gap-1">
        <button
          onClick={() => setSubTab("avisos")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
            subTab === "avisos"
              ? "bg-[#800521] text-white shadow-md font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Avisos Institucionales ({instNotices.length})
        </button>
        <button
          onClick={() => setSubTab("comunicados")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
            subTab === "comunicados"
              ? "bg-[#800521] text-white shadow-md font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Mis Comunicados ({acadComms.length})
        </button>
        <button
          onClick={() => setSubTab("reportes")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
            subTab === "reportes"
              ? "bg-[#800521] text-white shadow-md font-black"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          Reportes de Avance
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
                    {courses && courses.length > 0 ? (
                      courses.map((c) => (
                        <option key={c.id || c.code} value={c.code}>
                          {c.code} • {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="General">Todas las Asignaturas a Cargo</option>
                    )}
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
                    className="font-black text-[10.5px] py-3 uppercase tracking-wider bg-[#800521] hover:bg-[#66041a] text-white rounded-xl cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-1.5 text-amber-300" /> Publicar Comunicado
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
                  <span className="font-bold text-slate-900">{totalMonthlyHours} Horas Mensuales ({totalWeeklyHours} hrs/sem)</span>
                </div>
                <div className="flex justify-between">
                  <span>Horas Dictadas Sincronizadas:</span>
                  <span className="font-bold text-emerald-600 font-mono">{totalMonthlyHours} Horas Sustentadas</span>
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
