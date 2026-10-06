import { useMemo } from "react";

export interface ScheduleConflict {
  type: "classroom" | "teacher";
  description: string;
  item1: string;
  item2: string;
  classroomOrTeacher: string;
  schedule: string;
}

export function useConflictDetector(planningItems: any[] = [], courses: any[] = []) {
  const conflicts = useMemo(() => {
    const list: ScheduleConflict[] = [];
    if (!planningItems || planningItems.length === 0) return list;

    const classroomScheduleMap: Record<string, { courseName: string; schedule: string }[]> = {};
    const teacherScheduleMap: Record<string, { courseName: string; schedule: string }[]> = {};

    planningItems.forEach((item) => {
      const classroom = item.classroom || item.classroomId;
      const schedule = item.schedule || item.timeSlot || (item.dayOfWeek && item.startTime ? `${item.dayOfWeek} ${item.startTime}-${item.endTime}` : item.scheduleId);
      const teacher = item.teacherDni || item.teacherName;
      const courseMatch = courses.find((c: any) => c.id === item.courseId || c.code === item.courseId);
      const courseName = item.courseName || (courseMatch ? courseMatch.name : item.courseId) || item.name || "Curso";

      if (classroom && schedule) {
        const key = `${classroom}__${schedule}`;
        if (!classroomScheduleMap[key]) {
          classroomScheduleMap[key] = [];
        }
        classroomScheduleMap[key].push({ courseName, schedule });
      }

      if (teacher && schedule) {
        const key = `${teacher}__${schedule}`;
        if (!teacherScheduleMap[key]) {
          teacherScheduleMap[key] = [];
        }
        teacherScheduleMap[key].push({ courseName, schedule });
      }
    });

    // Detect classroom overlaps
    Object.entries(classroomScheduleMap).forEach(([key, matches]) => {
      if (matches.length > 1) {
        const [classroom, schedule] = key.split("__");
        list.push({
          type: "classroom",
          description: `Cruce de Aula: El aula "${classroom}" tiene ${matches.length} asignaciones simultáneas en el horario ${schedule}.`,
          item1: matches[0].courseName,
          item2: matches[1].courseName,
          classroomOrTeacher: classroom,
          schedule
        });
      }
    });

    // Detect teacher overlaps
    Object.entries(teacherScheduleMap).forEach(([key, matches]) => {
      if (matches.length > 1) {
        const [teacher, schedule] = key.split("__");
        list.push({
          type: "teacher",
          description: `Cruce de Docente: El docente "${teacher}" tiene ${matches.length} asignaciones simultáneas en el horario ${schedule}.`,
          item1: matches[0].courseName,
          item2: matches[1].courseName,
          classroomOrTeacher: teacher,
          schedule
        });
      }
    });

    return list;
  }, [planningItems, courses]);

  return {
    conflicts,
    hasConflicts: conflicts.length > 0,
    conflictCount: conflicts.length
  };
}
