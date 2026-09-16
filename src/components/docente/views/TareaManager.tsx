import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CourseAssignment } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";

interface Props {
  courseId: string;
  week: number;
  assignments: CourseAssignment[];
  onPublishAssignment: (title: string, desc: string, dueDate: string, attachment?: string, rubric?: string) => void;
  onDeleteAssignment: (id: string) => void;
}

export function TareaManager({ courseId, week, assignments, onPublishAssignment, onDeleteAssignment }: Props) {
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

              <Button type="submit" variant="primary" fullWidth className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026] text-white">
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
                <div key={asg.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors">
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
