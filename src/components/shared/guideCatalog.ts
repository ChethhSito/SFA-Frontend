export type GuideAudience = "student" | "teacher";

export interface GuideDocument {
  id: string;
  title: string;
  category: "Guías" | "Procedimientos" | "Reglamentos";
  description: string;
  fileName: string;
  docCode: string;
}

export const guideCatalog: Record<GuideAudience, GuideDocument[]> = {
  student: [
    { 
      id: "pre-matricula", 
      title: "Guía Oficial de Prematrícula y Admisión", 
      category: "Guías", 
      description: "Orientación integral previa a la matrícula, verificación de requisitos y expediente digital.", 
      fileName: "estudiante-prematricula-demo.pdf",
      docCode: "SFA-G-ADM-2026"
    },
    { 
      id: "matricula", 
      title: "Guía Oficial de Matrícula y Horarios", 
      category: "Guías", 
      description: "Verificación de sección académica, asignaturas matriculadas y programación del turno mañana.", 
      fileName: "estudiante-matricula-demo.pdf",
      docCode: "SFA-G-MAT-2026"
    },
    { 
      id: "procedimientos", 
      title: "Manual de Procedimientos y Mesa de Partes", 
      category: "Procedimientos", 
      description: "Solicitud digital de certificados oficiales, constancias institucionales y validación de pagos en MAF.", 
      fileName: "estudiante-procedimientos-demo.pdf",
      docCode: "SFA-MAN-PROC-2026"
    },
    { 
      id: "reconsideracion", 
      title: "Procedimiento de Reconsideración Académica", 
      category: "Procedimientos", 
      description: "Pautas formales para solicitar revisión de calificaciones finales y recursos de reconsideración.", 
      fileName: "estudiante-reconsideracion-demo.pdf",
      docCode: "SFA-PROC-REC-2026"
    },
    { 
      id: "traslado", 
      title: "Reglamento de Traslado Interno y Convalidación", 
      category: "Reglamentos", 
      description: "Normativa institucional, requisitos curriculares y tabla de convalidación de unidades didácticas.", 
      fileName: "estudiante-traslado-demo.pdf",
      docCode: "SFA-REG-TRAS-2026"
    },
    { 
      id: "sanciones", 
      title: "Reglamento de Ética, Disciplina y Deberes", 
      category: "Reglamentos", 
      description: "Marco regulatorio de derechos, deberes, tipificación de faltas y garantías del debido proceso.", 
      fileName: "estudiante-sanciones-demo.pdf",
      docCode: "SFA-REG-SANC-2026"
    },
  ],
  teacher: [
    { 
      id: "gestion-curso", 
      title: "Guía Docente de Gestión Curricular y Sílabos", 
      category: "Guías", 
      description: "Planificación de las 16 semanas lectivas, publicación de sílabos y guías de taller en aula virtual.", 
      fileName: "docente-gestion-curso-demo.pdf",
      docCode: "SFA-GUIA-DOC-2026"
    },
    { 
      id: "asistencia", 
      title: "Manual Docente de Control de Asistencia", 
      category: "Guías", 
      description: "Registro puntual diario por bloques horarios y monitoreo del límite ministerial de inasistencias.", 
      fileName: "docente-asistencia-demo.pdf",
      docCode: "SFA-MAN-ASIS-2026"
    },
    { 
      id: "evaluaciones", 
      title: "Directiva de Evaluaciones y Cierre de Actas", 
      category: "Procedimientos", 
      description: "Calificación en escala vigesimal, ponderaciones curriculares y suscripción digital de actas finales.", 
      fileName: "docente-evaluaciones-demo.pdf",
      docCode: "SFA-DIR-EVAL-2026"
    },
    { 
      id: "convivencia", 
      title: "Reglamento Docente de Ética y Convivencia", 
      category: "Reglamentos", 
      description: "Estándares éticos del ejercicio docente, prevención de riesgos en talleres y gestión de incidencias.", 
      fileName: "docente-convivencia-demo.pdf",
      docCode: "SFA-REG-ETICA-2026"
    },
  ],
};

export function guideFileUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}guides/${encodeURIComponent(fileName)}`;
}
