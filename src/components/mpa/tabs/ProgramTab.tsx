import React, { useState } from "react";
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
    <PageTransition id="program">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left items-start">
        {/* Formulario de Programación Académica por Horas Reales */}
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

        {/* Tabla de Sesiones Programadas y Resumen */}
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
      </div>
    </PageTransition>

  );
}
