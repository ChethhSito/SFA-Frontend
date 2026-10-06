import { MpaSchedule } from "../../types";

export function getTeacherSpecialties(teacher: any): string[] {
  if (!teacher) return [];
  if (Array.isArray(teacher.specialties) && teacher.specialties.length > 0) {
    return teacher.specialties;
  }
  if (teacher.specialty) {
    return teacher.specialty.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
}

export function calculateEndTime(startTimeStr: string, pedagogicalHours: number, durationMinutes: number): string {
  if (!startTimeStr) return "";
  const startMins = parseTimeToMinutes(startTimeStr);
  const totalMins = startMins + (pedagogicalHours * durationMinutes);
  return formatMinutesToTime(totalMins);
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!match) return 0;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  
  if (ampm === "PM" && hours < 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

export function schedulesConflict(sch1: MpaSchedule, sch2: MpaSchedule): boolean {
  if (sch1.id === sch2.id) return true;
  if (sch1.dayOfWeek.trim().toLowerCase() !== sch2.dayOfWeek.trim().toLowerCase()) return false;
  
  let start1 = sch1.startTime ? parseTimeToMinutes(sch1.startTime) : 0;
  let end1 = sch1.endTime ? parseTimeToMinutes(sch1.endTime) : 0;
  
  if (!start1 && !end1 && sch1.timeSlot) {
    const parts = sch1.timeSlot.split("-");
    if (parts.length === 2) {
      start1 = parseTimeToMinutes(parts[0]);
      end1 = parseTimeToMinutes(parts[1]);
    }
  }
  
  let start2 = sch2.startTime ? parseTimeToMinutes(sch2.startTime) : 0;
  let end2 = sch2.endTime ? parseTimeToMinutes(sch2.endTime) : 0;
  
  if (!start2 && !end2 && sch2.timeSlot) {
    const parts = sch2.timeSlot.split("-");
    if (parts.length === 2) {
      start2 = parseTimeToMinutes(parts[0]);
      end2 = parseTimeToMinutes(parts[1]);
    }
  }
  
  return start1 < end2 && start2 < end1;
}

export function hoursOverlap(day1: string, start1Str: string, end1Str: string, day2: string, start2Str: string, end2Str: string): boolean {
  if (day1.trim().toLowerCase() !== day2.trim().toLowerCase()) return false;
  const start1 = parseTimeToMinutes(start1Str);
  const end1 = parseTimeToMinutes(end1Str);
  const start2 = parseTimeToMinutes(start2Str);
  const end2 = parseTimeToMinutes(end2Str);
  return start1 < end2 && start2 < end1;
}

export function getGroupBaseAndSub(name: string) {
  const trimmed = name.trim();
  const index = trimmed.lastIndexOf("-");
  if (index !== -1) {
    const base = trimmed.substring(0, index);
    const sub = trimmed.substring(index + 1);
    if (/^\d+$/.test(sub) || sub.toLowerCase().startsWith("sub") || sub.length <= 4) {
      return { base, sub };
    }
  }
  return { base: trimmed, sub: "" };
}

export function groupNamesConflict(nameA: string, nameB: string): boolean {
  const gA = getGroupBaseAndSub(nameA);
  const gB = getGroupBaseAndSub(nameB);
  
  if (gA.base.toLowerCase() !== gB.base.toLowerCase()) {
    return false;
  }
  
  if (gA.sub === "" || gB.sub === "") {
    return true;
  }
  
  return gA.sub.toLowerCase() === gB.sub.toLowerCase();
}

export function formatMinutesToTime(totalMinutes: number): string {
  let hr = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hr >= 12 ? "PM" : "AM";
  hr = hr % 12;
  if (hr === 0) hr = 12;
  const mmStr = mins < 10 ? `0${mins}` : `${mins}`;
  const hrStr = hr < 10 ? `0${hr}` : `${hr}`;
  return `${hrStr}:${mmStr} ${ampm}`;
}

const GENERAL_CODES = [
  "CO-101", "CO-102", "CO-103", "CO-104",
  "CO-201", "CO-202", "CO-203", "CO-204", "CO-205",
  "CO-301", "CO-302", "CO-303",
  "CO-401", "CO-402",
  "CO-501", "CO-502", "CO-503",
  "CO-601", "CO-602", "CO-603",
  "EL-101", "EL-102", "EL-201"
];

export function enrichCourses(list: any[]): any[] {
  return list.map((c: any) => {
    let careerId = c.careerId;
    if (!careerId || careerId === "") {
      if (GENERAL_CODES.includes(c.code)) {
        careerId = "comun";
      } else if (c.code?.startsWith("CO-") || c.id?.startsWith("co_")) {
        careerId = "contabilidad";
      } else if (c.code?.startsWith("EL-") || c.id?.startsWith("el_")) {
        careerId = "electronica";
      } else {
        careerId = "comun";
      }
    } else if (GENERAL_CODES.includes(c.code) && careerId !== "comun") {
      careerId = "comun";
    }

    let referenceCycle = c.referenceCycle;
    if (!referenceCycle || referenceCycle === 0) {
      const match = c.code?.match(/[A-Z]+-(\d)\d\d/i);
      if (match) {
        referenceCycle = parseInt(match[1]);
      } else if (c.id?.includes("_p")) {
        const pMatch = c.id.match(/_p(\d)_/);
        if (pMatch) {
          referenceCycle = parseInt(pMatch[1]);
        }
      } else {
        referenceCycle = 1;
      }
    }
    return { ...c, careerId, referenceCycle };
  });
}

export function enrichTeachers(list: any[]): any[] {
  return list.map((t: any) => {
    let careerId = t.careerId;
    if (!careerId || careerId === "") {
      const spec = t.specialty?.toLowerCase() || "";
      if (spec.includes("contabilidad") || spec.includes("costos") || spec.includes("finanzas") || spec.includes("tribut") || spec.includes("audito")) {
        careerId = "contabilidad";
      } else if (spec.includes("electric") || spec.includes("electrónic") || spec.includes("automa") || spec.includes("plc") || spec.includes("motores") || spec.includes("física") || spec.includes("maquinas")) {
        careerId = "electronica";
      } else {
        careerId = "comun";
      }
    }
    
    let specialties = t.specialties;
    if (!Array.isArray(specialties) || specialties.length === 0) {
      specialties = t.specialty ? t.specialty.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    }

    return { ...t, careerId, specialties };
  });
}

export function enrichClassrooms(list: any[]): any[] {
  return list.map((r: any) => {
    let careerId = r.careerId;
    if (!careerId || careerId === "") {
      const name = r.name?.toLowerCase() || "";
      if (name.includes("contabilidad") || name.includes("conta")) {
        careerId = "contabilidad";
      } else if (name.includes("electric") || name.includes("electrónic") || name.includes("taller") || name.includes("tecnolog")) {
        careerId = "electronica";
      } else {
        careerId = "comun";
      }
    }
    return { ...r, careerId };
  });
}
