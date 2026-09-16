import React from "react";
import { 
  MpaAcademicGroup, MpaPeriod, MpaCareer, MpaCourse, 
  MpaCurriculumItem, MpaShift, MpaClassroom, MpaProgramTask, MpaSchedule 
} from "../../../types";
import { MpaCurriculumVersion } from "./CurriculumTab";
import { PageTransition } from "../PageTransition";

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

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm("¿Está seguro de eliminar esta sesión programada?")) return;
    const filtered = tasks.filter(t => t.id !== taskId);
    saveDb("tasks", filtered, setTasks);
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
      </div>
    </PageTransition>
  );
}
