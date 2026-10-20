import { useMemo } from "react";

export interface ScheduleConflict {
  type: "classroom" | "teacher";
  description: string;
  item1: string;
  item2: string;
  classroomOrTeacher: string;
  schedule: string;
}

function toMinutes(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59 || hour > (match[3] ? 12 : 23) || (match[3] && hour < 1)) return null;
  if (match[3]) hour = hour % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + minute;
}

export function useConflictDetector(planningItems: any[] = [], courses: any[] = [], groups: any[] = []) {
  const { conflicts, orphanCount } = useMemo(() => {
    const list: ScheduleConflict[] = [];
    const periodByGroup = new Map(groups.map(group => [group.id, group.periodId]));
    const orphans = planningItems.filter(item => !periodByGroup.has(item.groupId)).length;
    const courseName = (item: any) => {
      const course = courses.find((candidate: any) => candidate.id === item.courseId || candidate.code === item.courseId);
      return item.courseName || course?.name || item.courseId || item.name || "Curso";
    };

    for (let i = 0; i < planningItems.length; i++) {
      const first = planningItems[i];
      const period = periodByGroup.get(first.groupId);
      const firstStart = toMinutes(first.startTime);
      const firstEnd = toMinutes(first.endTime);
      if (!period || !first.dayOfWeek || firstStart === null || firstEnd === null || firstStart >= firstEnd) continue;

      for (let j = i + 1; j < planningItems.length; j++) {
        const second = planningItems[j];
        if (periodByGroup.get(second.groupId) !== period || second.dayOfWeek !== first.dayOfWeek) continue;
        const secondStart = toMinutes(second.startTime);
        const secondEnd = toMinutes(second.endTime);
        if (secondStart === null || secondEnd === null || secondStart >= secondEnd || firstStart >= secondEnd || secondStart >= firstEnd) continue;

        const schedule = `${first.dayOfWeek} ${first.startTime}-${first.endTime} / ${second.startTime}-${second.endTime}`;
        if (first.classroomId && first.classroomId === second.classroomId) {
          list.push({
            type: "classroom",
            description: `Cruce de aula: ${first.classroomId} tiene dos sesiones simultáneas el ${schedule}.`,
            item1: courseName(first), item2: courseName(second),
            classroomOrTeacher: first.classroomId, schedule,
          });
        }
        if (first.teacherDni && first.teacherDni === second.teacherDni) {
          list.push({
            type: "teacher",
            description: `Cruce de docente: hay dos sesiones simultáneas el ${schedule}.`,
            item1: courseName(first), item2: courseName(second),
            classroomOrTeacher: first.teacherDni, schedule,
          });
        }
      }
    }
    return { conflicts: list, orphanCount: orphans };
  }, [planningItems, courses, groups]);

  return { conflicts, hasConflicts: conflicts.length > 0, conflictCount: conflicts.length, orphanCount };
}
