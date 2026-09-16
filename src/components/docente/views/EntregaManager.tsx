import React from "react";
import { Users } from "lucide-react";
import { CourseAssignment } from "../../../types";
import { ROSTER } from "../DocenteTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";

interface Props {
  courseId: string;
  week: number;
  assignment: CourseAssignment | null;
  onOpenGradingTab: () => void;
}

export function EntregaManager({ courseId, week, assignment, onOpenGradingTab }: Props) {
  const subs = (() => {
    if (!assignment) return [];
    return ROSTER.map((std, idx) => {
      const hasDelivered = idx < 3;
      const fileExtDict = ["pdf", "zip", "docx"];
      const isGraded = idx === 0;
      return {
        dni: std.dni,
        name: `${std.name} ${std.lastName}`,
        fileName: hasDelivered
          ? `${assignment.title.toLowerCase().replace(/ /g, "_")}_${std.name.toLowerCase()}.${fileExtDict[idx]}`
          : null,
        submitDate: hasDelivered ? "2026-06-03 16:40" : null,
        status: hasDelivered ? (isGraded ? "Calificado" : "Pendiente de Calificación") : "Sin Entregar",
      };
    });
  })();

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
            <CardDescription>
              {assignment ? `Fecha límite de control: ${assignment.dueDate}` : "No hay tareas programadas en esta semana"}
            </CardDescription>
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
                      <span className="text-[10px] text-slate-400 font-bold block">DNI: {sub.dni}</span>
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
                        <Button onClick={onOpenGradingTab} size="sm" variant="outline" className="font-black text-[9px] tracking-wide uppercase px-2.5 py-1.5">
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
