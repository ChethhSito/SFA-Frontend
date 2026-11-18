import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { 
  MpaAcademicGroup, MpaPeriod, MpaCareer, MpaCourse, 
  MpaCurriculumItem, MpaShift, MpaClassroom, MpaProgramTask, MpaSchedule 
} from "../../../types";
import { MpaCurriculumVersion } from "./CurriculumTab";
import { PageTransition } from "../PageTransition";
import ConfirmModal from "../../ui/ConfirmModal";

import { CareerSchedulesView } from "../program/CareerSchedulesView";
import { ProgramTaskForm } from "../program/ProgramTaskForm";
import { ProgramTaskListTable } from "../program/ProgramTaskListTable";

interface ProgramTabProps {
  groups: MpaAcademicGroup[];
  periods: MpaPeriod[];
  careers: MpaCareer[];
  courses: MpaCourse[];
  curriculum: MpaCurriculumItem[];
  curriculumVersions: MpaCurriculumVersion[];
  shifts: MpaShift[];
  classrooms: MpaClassroom[];
  teachers: any[];
  tasks: MpaProgramTask[];
  schedules: MpaSchedule[];
  pedagogicalHourDuration: number;
  savePedagogicalHourDuration: (val: number) => void;
  saveDb: (key: string, value: any, setter: Function) => void;
  setTasks: React.Dispatch<React.SetStateAction<MpaProgramTask[]>>;
  isCareerSchedulesView?: boolean;
}

export function ProgramTab({
  groups,
  periods,
  careers,
  courses,
  curriculum,
  curriculumVersions,
  shifts,
  classrooms,
  teachers,
  tasks,
  schedules,
  pedagogicalHourDuration,
  savePedagogicalHourDuration,
  saveDb,
  setTasks,
  isCareerSchedulesView = false
}: ProgramTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const handleDeleteTask = (taskId: string) => {
    setDeleteTaskId(taskId);
  };

  const handleConfirmDelete = () => {
    if (!deleteTaskId) return;
    const filtered = tasks.filter(t => t.id !== deleteTaskId);
    saveDb("tasks", filtered, setTasks);
    setDeleteTaskId(null);
  };

  const assignedTeachersCount = new Set(tasks.map(t => t.teacherDni).filter(Boolean)).size;
  const assignedClassroomsCount = new Set(tasks.map(t => t.classroomId).filter(Boolean)).size;

  if (isCareerSchedulesView) {
    return (
      <CareerSchedulesView
        groups={groups}
        careers={careers}
        courses={courses}
        classrooms={classrooms}
        teachers={teachers}
        tasks={tasks}
        schedules={schedules}
      />
    );
  }

  return (
    <PageTransition id="program" className="p-5 md:p-6 space-y-4 text-left">
      {/* Barra de KPIs Compacta + Botón de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sesiones Asignadas</span>
            <span className="text-sm font-black text-[#800521] font-mono block truncate mt-0.5">
              {tasks.length} Clases Lectivas
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Docentes en Carga</span>
            <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
              {assignedTeachersCount} de {teachers.length} Catedráticos
            </span>
          </div>

          <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ambientes en Uso</span>
            <span className="text-sm font-black text-amber-600 font-mono block mt-0.5">
              {assignedClassroomsCount} de {classrooms.length} Espacios
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer border ${
            showForm 
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300" 
              : "bg-[#800521] hover:bg-[#67041a] text-white border-[#800521]"
          }`}
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showForm ? "Cerrar Programador" : "+ Programar Sesión"}</span>
        </button>
      </div>

      {/* Formulario Expandible */}
      {showForm && (
        <div className="animate-fade-in">
          <ProgramTaskForm
            groups={groups}
            periods={periods}
            careers={careers}
            courses={courses}
            curriculum={curriculum}
            curriculumVersions={curriculumVersions}
            shifts={shifts}
            classrooms={classrooms}
            teachers={teachers}
            tasks={tasks}
            pedagogicalHourDuration={pedagogicalHourDuration}
            savePedagogicalHourDuration={savePedagogicalHourDuration}
            saveDb={saveDb}
            setTasks={setTasks}
          />
        </div>
      )}

      {/* Tabla de Sesiones Programadas al 100% */}
      <ProgramTaskListTable
        tasks={tasks}
        courses={courses}
        teachers={teachers}
        classrooms={classrooms}
        schedules={schedules}
        groups={groups}
        onDeleteTask={handleDeleteTask}
      />

      {/* Modal de confirmación para eliminar sesión */}
      <ConfirmModal
        isOpen={Boolean(deleteTaskId)}
        title="Eliminar Sesión Programada"
        message="¿Está seguro de eliminar esta sesión programada del calendario académico?"
        variant="danger"
        confirmText="Eliminar Sesión"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTaskId(null)}
      />
    </PageTransition>
  );
}
