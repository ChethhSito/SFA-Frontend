export type GuideAudience = "student" | "teacher";

export interface GuideDocument {
  id: string;
  title: string;
  category: "Guías" | "Procedimientos" | "Reglamentos";
  description: string;
  fileName: string;
}

// These files are demonstration material. Replace the PDFs with approved
// institutional documents before presenting them as official guidance.
export const guideCatalog: Record<GuideAudience, GuideDocument[]> = {
  student: [
    { id: "pre-matricula", title: "Guía de prematrícula", category: "Guías", description: "Orientación previa a la matrícula y revisión de datos.", fileName: "estudiante-prematricula-demo.pdf" },
    { id: "matricula", title: "Guía de matrícula", category: "Guías", description: "Consulta del grupo, cursos y horario después de la matrícula.", fileName: "estudiante-matricula-demo.pdf" },
    { id: "procedimientos", title: "Procedimientos administrativos", category: "Procedimientos", description: "Ejemplo de solicitud de documentos y comunicación de un voucher a MAF.", fileName: "estudiante-procedimientos-demo.pdf" },
    { id: "reconsideracion", title: "Reconsideración de sanciones", category: "Procedimientos", description: "Ejemplo de los datos que podrían acompañar una solicitud de revisión.", fileName: "estudiante-reconsideracion-demo.pdf" },
    { id: "traslado", title: "Reglamento de traslado interno", category: "Reglamentos", description: "Estructura ilustrativa de una consulta de traslado interno.", fileName: "estudiante-traslado-demo.pdf" },
    { id: "sanciones", title: "Reglamento de sanciones", category: "Reglamentos", description: "Resumen ilustrativo para consultar la normativa aprobada.", fileName: "estudiante-sanciones-demo.pdf" },
  ],
  teacher: [
    { id: "gestion-curso", title: "Guía de gestión del curso", category: "Guías", description: "Organización de las 16 semanas y publicación de recursos.", fileName: "docente-gestion-curso-demo.pdf" },
    { id: "asistencia", title: "Guía de asistencia", category: "Guías", description: "Registro semanal y consulta del historial de asistencia.", fileName: "docente-asistencia-demo.pdf" },
    { id: "evaluaciones", title: "Procedimiento de evaluaciones", category: "Procedimientos", description: "Creación de evaluaciones y registro de notas en el portal.", fileName: "docente-evaluaciones-demo.pdf" },
    { id: "convivencia", title: "Normas y convivencia", category: "Reglamentos", description: "Estructura ilustrativa para incidencias y consulta de normas.", fileName: "docente-convivencia-demo.pdf" },
  ],
};

export function guideFileUrl(fileName: string): string {
  return `${import.meta.env.BASE_URL}guides/${encodeURIComponent(fileName)}`;
}
