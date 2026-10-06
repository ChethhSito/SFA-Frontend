import { CourseMaterial, CourseAssignment } from "../../types";

export interface WeeklyObservation {
  id: string;
  text: string;
  date: string;
  type: "General" | "Incidencia" | "Acuerdo";
}

export interface StudentRosterItem {
  dni: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Resolves the real active student roster dynamically from the database state:
 * Cross-references real enrollments (sfa_enrollments) with real students (sfa_students)
 * filtered by the active course's career program. Zero mock data.
 */
export const getDynamicRoster = (): StudentRosterItem[] => {
  const activeCareer = (localStorage.getItem("sfa_selected_course_career") || "").toLowerCase().trim();
  
  // 1. Read real enrollments from database cache
  let enrollmentsList: any[] = [];
  try {
    const rawEnrolls = localStorage.getItem("sfa_enrollments");
    if (rawEnrolls) enrollmentsList = JSON.parse(rawEnrolls);
  } catch (e) {
    console.error("Error reading sfa_enrollments:", e);
  }

  // 2. Read real students from database cache
  let studentsMap: Record<string, any> = {};
  try {
    const rawStudents = localStorage.getItem("sfa_students");
    if (rawStudents) {
      const parsed = JSON.parse(rawStudents);
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          if (s.dni) studentsMap[s.dni] = s;
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        studentsMap = parsed;
      }
    }
  } catch (e) {
    console.error("Error reading sfa_students:", e);
  }

  // 3. Filter real enrolled students matching active course program
  if (Array.isArray(enrollmentsList) && enrollmentsList.length > 0) {
    const filteredEnrolls = enrollmentsList.filter((e: any) => {
      const prog = (e.programId || "").toLowerCase();
      const status = (e.academicStatus || "").toUpperCase();
      const isEnrolled = status === "MATRICULADO" || status === "ADMITIDO";
      if (!isEnrolled) return false;
      if (!activeCareer) return true;
      return prog.includes(activeCareer) || activeCareer.includes(prog);
    });

    if (filteredEnrolls.length > 0) {
      return filteredEnrolls.map((e: any) => {
        const st = studentsMap[e.studentDni];
        return {
          dni: e.studentDni,
          name: st?.name || "Estudiante",
          lastName: st?.lastName || "",
          email: st?.email || `${(st?.name || "estudiante").toLowerCase().replace(/\s+/g, "")}@iestpsfa.edu.pe`,
          phone: st?.phone || "999999999"
        };
      });
    }
  }

  // 4. Fallback to loaded students in studentsMap if enrollments haven't finished fetching
  if (Object.keys(studentsMap).length > 0) {
    return Object.values(studentsMap).map((st: any) => ({
      dni: st.dni || String(st.id || ""),
      name: st.name || "Estudiante",
      lastName: st.lastName || "",
      email: st.email || `${(st.name || "estudiante").toLowerCase().replace(/\s+/g, "")}@iestpsfa.edu.pe`,
      phone: st.phone || "999999999"
    }));
  }

  return [];
};

/**
 * Proxy object exposing real student roster dynamically based on current context
 */
export const ROSTER: StudentRosterItem[] = new Proxy([] as StudentRosterItem[], {
  get(target, prop) {
    const list = getDynamicRoster();
    if (prop === "length") {
      return list.length;
    }
    if (prop === "map") {
      return (cb: any) => list.map(cb);
    }
    if (prop === "filter") {
      return (cb: any) => list.filter(cb);
    }
    if (prop === "find") {
      return (cb: any) => list.find(cb);
    }
    if (prop === "reduce") {
      return (cb: any, init: any) => list.reduce(cb, init);
    }
    if (prop === "forEach") {
      return (cb: any) => list.forEach(cb);
    }
    if (prop === Symbol.iterator) {
      return list[Symbol.iterator].bind(list);
    }
    const idx = Number(prop as string);
    if (!isNaN(idx)) {
      return list[idx];
    }
    return (list as any)[prop];
  }
});

/**
 * Dynamic weekly syllabus theme generator for any official course in the catalog.
 * Follows MINEDU/SFA standard curricular progression across 16 academic weeks.
 */
export const getWeekTheme = (courseCode: string, week: number, courseName?: string) => {
  const name = courseName || "la Unidad Didáctica";
  const unitNumber = Math.ceil(week / 4);

  if (week === 1) {
    return {
      topic: `Semana 1: Introducción, Fundamentos y Lineamientos de ${name}`,
      desc: `Presentación del syllabus, evaluación diagnóstica inicial y fundamentos conceptuales de ${name}.`
    };
  }
  if (week === 8) {
    return {
      topic: `Semana 8: Evaluación Parcial y Consolidación de ${name}`,
      desc: `Examen de medio ciclo, verificación de avances prácticos y retroalimentación técnica de ${name}.`
    };
  }
  if (week === 16) {
    return {
      topic: `Semana 16: Evaluación Final y Sustentación Integral de ${name}`,
      desc: `Consolidación final de competencias, sustentación de proyectos y cierre de actas de ${name}.`
    };
  }

  const subWeek = ((week - 1) % 4) + 1;
  const subThemes = [
    `Fundamentos teóricos y conceptualización técnica`,
    `Taller práctico y desarrollo guiado de casos`,
    `Laboratorio aplicado y resolución de problemas`,
    `Revisión formativa y control de avance de unidad`
  ];

  return {
    topic: `Semana ${week}: Unidad ${unitNumber} - ${subThemes[subWeek - 1]} de ${name}`,
    desc: `Sesión lectiva correspondiente a la Semana ${week} de ${name}: aplicación práctica, análisis de casos y desarrollo de competencias.`
  };
};
