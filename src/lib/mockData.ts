import { 
  Program, Applicant, Enrollment, Course, Classroom, 
  Teacher, CourseMaterial, CourseAssignment, CourseEvaluation, 
  AttendanceRecord, CycleStatus, Graduation,
  MpaCareer, MpaCourse, MpaCurriculumItem
} from "../types";

export const REAL_MPA_CAREERS: MpaCareer[] = [
  { id: "electronica", name: "Electricidad Industrial", code: "EEI", durationSemesters: 6, status: "Activo" },
  { id: "contabilidad", name: "Contabilidad", code: "CON", durationSemesters: 6, status: "Activo" }
];

export const REAL_MPA_COURSES: MpaCourse[] = [
  // CONTABILIDAD
  // Period 1
  { id: "con_p1_1", name: "Técnica de Comunicación", code: "CON-101", credits: 2, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "con_p1_2", name: "Lógica y Funciones", code: "CON-102", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "con_p1_3", name: "Cultura Física y Deporte", code: "CON-103", credits: 1, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "con_p1_4", name: "Informática e Internet", code: "CON-104", credits: 2, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "con_p1_5", name: "Contabilidad General I", code: "CON-105", credits: 4, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "con_p1_6", name: "Plan Contable", code: "CON-106", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "con_p1_7", name: "Documentación Comercial y Contable", code: "CON-107", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "con_p1_8", name: "Administración Empresarial", code: "CON-108", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "con_p1_9", name: "Legislación Comercial", code: "CON-109", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  
  // Period 2
  { id: "con_p2_1", name: "Ofimática Profesional", code: "CON-201", credits: 2, careerId: "contabilidad", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "con_p2_2", name: "Estadística General", code: "CON-202", credits: 2, careerId: "contabilidad", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "con_p2_3", name: "Contabilidad General II", code: "CON-203", credits: 4, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "con_p2_4", name: "Análisis de Transacciones", code: "CON-204", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "con_p2_5", name: "Tributación I", code: "CON-205", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "con_p2_6", name: "Dinámica del Plan Contable", code: "CON-206", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "con_p2_7", name: "Derecho Comercial y Societario", code: "CON-207", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "con_p2_8", name: "Fundamentos de Marketing", code: "CON-208", credits: 2, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "con_p2_9", name: "Organización de Empresas", code: "CON-209", credits: 2, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },

  // Period 3
  { id: "con_p3_1", name: "Sociedad y Economía en la Globalización", code: "CON-301", credits: 2, careerId: "contabilidad", referenceCycle: 3, type: "General", status: "Activo" },
  { id: "con_p3_2", name: "Medio Ambiente y Desarrollo Sostenible", code: "CON-302", credits: 2, careerId: "contabilidad", referenceCycle: 3, type: "General", status: "Activo" },
  { id: "con_p3_3", name: "Investigación e Innovación Tecnológica", code: "CON-303", credits: 2, careerId: "contabilidad", referenceCycle: 3, type: "General", status: "Activo" },
  { id: "con_p3_4", name: "Contabilidad de Costos I", code: "CON-304", credits: 4, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "con_p3_5", name: "Legislación Tributaria", code: "CON-305", credits: 3, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "con_p3_6", name: "Documentación Mercantil", code: "CON-306", credits: 3, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "con_p3_7", name: "Redacción Comercial y Administrativa", code: "CON-307", credits: 2, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "con_p3_8", name: "Inglés para Negocios I", code: "CON-308", credits: 2, careerId: "contabilidad", referenceCycle: 3, type: "General", status: "Activo" },

  // Period 4
  { id: "con_p4_1", name: "Comportamiento Ético", code: "CON-401", credits: 2, careerId: "contabilidad", referenceCycle: 4, type: "General", status: "Activo" },
  { id: "con_p4_2", name: "Proyecto de Investigación Tecnológica", code: "CON-402", credits: 2, careerId: "contabilidad", referenceCycle: 4, type: "General", status: "Activo" },
  { id: "con_p4_3", name: "Contabilidad de Costos II", code: "CON-403", credits: 4, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "con_p4_4", name: "Tributación II", code: "CON-404", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "con_p4_5", name: "Contabilidad Gubernamental I", code: "CON-405", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "con_p4_6", name: "Software de Contabilidad I", code: "CON-406", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "con_p4_7", name: "Finanzas Empresariales I", code: "CON-407", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "con_p4_8", name: "Inglés para Negocios II", code: "CON-408", credits: 2, careerId: "contabilidad", referenceCycle: 4, type: "General", status: "Activo" },

  // Period 5
  { id: "con_p5_1", name: "Liderazgo y Trabajo en Equipo", code: "CON-501", credits: 2, careerId: "contabilidad", referenceCycle: 5, type: "General", status: "Activo" },
  { id: "con_p5_2", name: "Contabilidad Gubernamental II", code: "CON-502", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "con_p5_3", name: "Software de Contabilidad II", code: "CON-503", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "con_p5_4", name: "Finanzas Empresariales II", code: "CON-504", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "con_p5_5", name: "Contabilidad de Sociedades", code: "CON-505", credits: 4, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "con_p5_6", name: "Auditoría Financiera I", code: "CON-506", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "con_p5_7", name: "Planeamiento Financiero y Presupuestos", code: "CON-507", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "con_p5_8", name: "Proyecto Empresarial I", code: "CON-508", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },

  // Period 6
  { id: "con_p6_1", name: "Relaciones en el Entorno de Trabajo", code: "CON-601", credits: 2, careerId: "contabilidad", referenceCycle: 6, type: "General", status: "Activo" },
  { id: "con_p6_2", name: "Software de Contabilidad III", code: "CON-602", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "con_p6_3", name: "Auditoría Financiera II", code: "CON-603", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "con_p6_4", name: "Contabilidad de Costos III (Costeo por Procesos)", code: "CON-604", credits: 4, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "con_p6_5", name: "Contabilidad Gerencial y de Gestión", code: "CON-605", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "con_p6_6", name: "Tributación Aplicada (Casos Prácticos)", code: "CON-606", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "con_p6_7", name: "Proyecto Empresarial II", code: "CON-607", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "con_p6_8", name: "Seminario de Actualización Profesional", code: "CON-608", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },

  // ELECTRICIDAD INDUSTRIAL
  // Period 1
  { id: "ele_p1_1", name: "Instalaciones Eléctricas de Interiores", code: "EEI-101", credits: 4, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_2", name: "Circuitos Eléctricos I", code: "EEI-102", credits: 4, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_3", name: "Dibujo Técnico Eléctrico", code: "EEI-103", credits: 2, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_4", name: "Mediciones Eléctricas", code: "EEI-104", credits: 3, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_5", name: "Matemática Aplicada I", code: "EEI-105", credits: 3, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "ele_p1_6", name: "Comunicación y Redacción Técnica", code: "EEI-106", credits: 2, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "ele_p1_7", name: "Informática e Internet", code: "EEI-107", credits: 2, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "ele_p1_8", name: "Cultura Física y Deportes", code: "EEI-108", credits: 1, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "ele_p1_9", name: "Inglés Técnico I", code: "EEI-109", credits: 2, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },

  // Period 2
  { id: "ele_p2_1", name: "Seguridad e Higiene Industrial", code: "EEI-201", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "ele_p2_2", name: "Instalaciones Eléctricas de Edificaciones", code: "EEI-202", credits: 4, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_3", name: "Circuitos Eléctricos II", code: "EEI-203", credits: 4, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_4", name: "Electrónica Básica", code: "EEI-204", credits: 3, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_5", name: "Matemática Aplicada II", code: "EEI-205", credits: 3, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "ele_p2_6", name: "Medio Ambiente y Desarrollo Sostenible", code: "EEI-206", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "ele_p2_7", name: "Taller de Investigación Tecnológica", code: "EEI-207", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "ele_p2_8", name: "Inglés Técnico II", code: "EEI-208", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "ele_p2_9", name: "Liderazgo y Trabajo en Equipo", code: "EEI-209", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },

  // Period 3
  { id: "ele_p3_1", name: "Máquinas Eléctricas Estáticas (Transformadores)", code: "EEI-301", credits: 4, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_2", name: "Instalaciones Eléctricas Industriales (Automatización Cableada)", code: "EEI-302", credits: 4, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_3", name: "Electrónica de Potencia", code: "EEI-303", credits: 3, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_4", name: "Sistemas de Control Neumático e Hidráulico", code: "EEI-304", credits: 3, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_5", name: "Instrumentación Industrial", code: "EEI-305", credits: 3, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_6", name: "Sociedad y Economía en la Globalización", code: "EEI-306", credits: 2, careerId: "electronica", referenceCycle: 3, type: "General", status: "Activo" },
  { id: "ele_p3_7", name: "Proyecto de Innovación Tecnológica I", code: "EEI-307", credits: 2, careerId: "electronica", referenceCycle: 3, type: "General", status: "Activo" },
  { id: "ele_p3_8", name: "Comportamiento Ético", code: "EEI-308", credits: 2, careerId: "electronica", referenceCycle: 3, type: "General", status: "Activo" },

  // Period 4
  { id: "ele_p4_1", name: "Máquinas Eléctricas Rotativas I (Motores de Inducción)", code: "EEI-401", credits: 4, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_2", name: "Sistemas de Control de Motores Eléctricos", code: "EEI-402", credits: 4, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_3", name: "Automatización de Sistemas Eléctricos Industriales (PLC Básico)", code: "EEI-403", credits: 4, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_4", name: "Sistemas de Generación y Transmisión de Energía", code: "EEI-404", credits: 3, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_5", name: "Mantenimiento Eléctrico Industrial", code: "EEI-405", credits: 3, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_6", name: "Proyecto de Innovación Tecnológica II", code: "EEI-406", credits: 2, careerId: "electronica", referenceCycle: 4, type: "General", status: "Activo" },
  { id: "ele_p4_7", name: "Relaciones en el Entorno del Trabajo", code: "EEI-407", credits: 2, careerId: "electronica", referenceCycle: 4, type: "General", status: "Activo" },
  { id: "ele_p4_8", name: "Seminario de Legislación Laboral", code: "EEI-408", credits: 2, careerId: "electronica", referenceCycle: 4, type: "General", status: "Activo" },

  // Period 5
  { id: "ele_p5_1", name: "Máquinas Eléctricas Rotativas II (Generadores y Síncronos)", code: "EEI-501", credits: 4, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_2", name: "Sistemas de Control y Automatización Avanzada (SCADA y PLC Avanzado)", code: "EEI-502", credits: 4, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_3", name: "Subestaciones Eléctricas y Redes de Distribución", code: "EEI-503", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_4", name: "Sistemas de Energía Renovable (Solar y Eólica)", code: "EEI-504", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_5", name: "Diseño de Proyectos Eléctricos Industriales", code: "EEI-505", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_6", name: "Proyecto Empresarial I", code: "EEI-506", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_7", name: "Seminario de Ética Profesional", code: "EEI-507", credits: 2, careerId: "electronica", referenceCycle: 5, type: "General", status: "Activo" },
  { id: "ele_p5_8", name: "Gestión de Negocios y Emprendimiento", code: "EEI-508", credits: 2, careerId: "electronica", referenceCycle: 5, type: "General", status: "Activo" },

  // Period 6
  { id: "ele_p6_1", name: "Mantenimiento Preventivo de Sistemas Industriales", code: "EEI-601", credits: 4, careerId: "electronica", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "ele_p6_2", name: "Auditoría y Eficiencia Energética", code: "EEI-602", credits: 3, careerId: "electronica", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "ele_p6_3", name: "Sistemas de Climatización y Refrigeración Industrial", code: "EEI-603", credits: 3, careerId: "electronica", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "ele_p6_4", name: "Robótica Industrial Aplicada", code: "EEI-604", credits: 3, careerId: "electronica", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "ele_p6_5", name: "Proyecto de Fin de Carrera (Tesis / Memoria de Prácticas)", code: "EEI-605", credits: 4, careerId: "electronica", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "ele_p6_6", name: "Proyecto Empresarial II", code: "EEI-606", credits: 3, careerId: "electronica", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "ele_p6_7", name: "Seminario de Inserción Laboral y Coaching", code: "EEI-607", credits: 2, careerId: "electronica", referenceCycle: 6, type: "General", status: "Activo" }
];

export const ACADEMIC_PROGRAMS: Program[] = [
  {
    id: "electronica",
    name: "Electricidad Industrial",
    description: "Forma especialistas capacitados en el montaje, instalación, operación y mantenimiento de sistemas eléctricos de media y baja tensión, automatización cableada y control lógico programable (PLC) de motores industriales.",
    duration: "3 años (6 Ciclos)",
    courses: ["Instalaciones Eléctricas de Interiores", "Circuitos Eléctricos I", "Dibujo Técnico Eléctrico", "Mediciones Eléctricas"]
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    description: "Domina el control de auditorías financieras, contabilidad de costos, tributación corporativa, flujos de caja e informática aplicada a la gestión contable de acuerdo a las Normas NIIF.",
    duration: "3 años (6 Ciclos)",
    courses: ["Contabilidad General I", "Plan Contable", "Documentación Comercial y Contable", "Administración Empresarial"]
  }
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: "app-1",
    applicantCode: "202610001",
    dni: "12345678",
    name: "Luis Fernando",
    lastName: "Castillo Rivera",
    email: "luis.castillo@iestpsfa.edu.pe",
    phone: "987654322",
    programId: "electronica",
    paymentStatus: "Validado",
    paymentOperation: "MATR-88772",
    examStatus: "Finalizado",
    examScore: 18,
    examClassroom: "Laboratorio de Electricidad A",
    admitted: "ADMITIDO",
    folderStatus: "Approved",
    periodId: "p1"
  }
];

export const INITIAL_STUDENTS_DATA: { [dni: string]: any } = {
  "12345678": {
    dni: "12345678",
    birthDate: "2007-04-12",
    name: "Luis Fernando",
    lastName: "Castillo Rivera",
    gender: "MASCULINO",
    email: "luis.castillo@iestpsfa.edu.pe",
    phone: "987654322",
    address: "Av. Las Flores 123",
    district: "Chorrillos",
    province: "Lima",
    emergencyName: "Fernando Castillo Sr.",
    emergencyPhone: "987654320",
    emergencyRelation: "Padre"
  },
  "22334455": {
    dni: "22334455",
    birthDate: "2006-08-22",
    name: "María de los Ángeles",
    lastName: "Mendoza Prado",
    gender: "FEMENINO",
    email: "maria.mendoza@iestpsfa.edu.pe",
    phone: "911223344",
    address: "Jr. Puno 456",
    district: "Lima Cercado",
    province: "Lima",
    emergencyName: "María Prado",
    emergencyPhone: "911223340",
    emergencyRelation: "Madre"
  },
  "44556677": {
    dni: "44556677",
    birthDate: "2007-11-02",
    name: "Diego Valentín",
    lastName: "Ruiz Espinoza",
    gender: "MASCULINO",
    email: "diego.ruiz@iestpsfa.edu.pe",
    phone: "944556677",
    address: "Av. Próceres 789",
    district: "Santiago de Surco",
    province: "Lima",
    emergencyName: "Diego Ruiz Sr.",
    emergencyPhone: "944556670",
    emergencyRelation: "Padre"
  },
  "88776655": {
    dni: "88776655",
    birthDate: "2006-03-15",
    name: "Sofía Alejandra",
    lastName: "Torres Cáceres",
    gender: "FEMENINO",
    email: "sofia.torres@iestpsfa.edu.pe",
    phone: "988776655",
    address: "Av. Arequipa 1221",
    district: "Lince",
    province: "Lima",
    emergencyName: "Alejandra Cáceres",
    emergencyPhone: "988776650",
    emergencyRelation: "Madre"
  },
  "55667788": {
    dni: "55667788",
    birthDate: "2007-01-30",
    name: "Jean Pierre",
    lastName: "Gamarra Flores",
    gender: "MASCULINO",
    email: "jean.gamarra@iestpsfa.edu.pe",
    phone: "955667788",
    address: "Calle Los Pinos 344",
    district: "Miraflores",
    province: "Lima",
    emergencyName: "Jean Gamarra Sr.",
    emergencyPhone: "955667780",
    emergencyRelation: "Padre"
  }
};

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    studentDni: "12345678",
    programId: "electronica",
    academicStatus: "ADMITIDO",
    docs: {
      dniFile: { status: "Validado", fileName: "dni_scan.pdf" },
      certificadoFile: { status: "Validado", fileName: "certificado_estudios.pdf" },
      partidaFile: { status: "Validado", fileName: "partida_nacimiento.pdf" },
      fotoFile: { status: "Validado", fileName: "foto_perfil.jpg" }
    },
    paymentStatus: "Validado",
    paymentOperation: "MATR-88772",
    paymentType: "number"
  }
];

export const GENERAL_TEACHERS: Teacher[] = [
  {
    dni: "99887766",
    name: "César Augusto",
    lastName: "Valdivia Rojas",
    email: "cesar.valdivia@iestpsfa.edu.pe",
    specialty: "Automatización Industrial y Eléctrica",
    specialties: ["EE-101", "Automatización Industrial y PLC"],
    status: "Disponible"
  }
];

export const GENERAL_CLASSROOMS: Classroom[] = [
  { id: "cls-1", name: "Laboratorio de Electricidad A", location: "Pabellón A, Aula 102", floor: 1, capacity: 25 },
  { id: "cls-2", name: "Aula Eléctrica B", location: "Pabellón A, Aula 204", floor: 2, capacity: 30 },
  { id: "cls-3", name: "Taller Electromecánico", location: "Pabellón B, Hangar 1", floor: 1, capacity: 20 }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "cur-elec-1",
    name: "Automatización Industrial y PLC",
    code: "EE-101",
    credits: 4,
    classroom: "Laboratorio de Electricidad A",
    schedule: "Lunes 08:00 AM - 12:00 PM",
    teacherDni: "99887766",
    career: "Electricidad Industrial",
    group: "Grupo A",
    curriculum: "Diseño Curricular 2026",
    startDate: "2026-04-06",
    endDate: "2026-07-24",
    studentCount: 5
  },
  {
    id: "cur-elec-2",
    name: "Circuitos de Media y Baja Tensión",
    code: "EE-403",
    credits: 3,
    classroom: "Aula Eléctrica B",
    schedule: "Miércoles 10:00 AM - 01:00 PM",
    teacherDni: "99887766",
    career: "Electricidad Industrial",
    group: "Grupo A",
    curriculum: "Diseño Curricular 2026",
    startDate: "2026-04-06",
    endDate: "2026-07-24",
    studentCount: 5
  },
  {
    id: "cur-elec-3",
    name: "Maquinaria de Potencia",
    code: "EE-502",
    credits: 4,
    classroom: "Taller Electromecánico",
    schedule: "Viernes 08:00 AM - 12:00 PM",
    teacherDni: "99887766",
    career: "Electricidad Industrial",
    group: "Grupo A",
    curriculum: "Diseño Curricular 2026",
    startDate: "2026-04-06",
    endDate: "2026-07-24",
    studentCount: 5
  }
];

export const INITIAL_MATERIALS: CourseMaterial[] = [
  {
    id: "mat-1",
    courseId: "cur-elec-1",
    title: "Silabo e Introducción al Control Industrial",
    date: "2026-06-01",
    fileName: "Silabo_Automatizacion_EE101.pdf"
  },
  {
    id: "mat-2",
    courseId: "cur-elec-1",
    title: "Guía de Laboratorio 1: Puertas Lógicas en TIA Portal",
    date: "2026-06-08",
    fileName: "Guia_Lab01_TIAPortal.pdf"
  }
];

export const INITIAL_ASSIGNMENTS: CourseAssignment[] = [
  {
    id: "asg-1",
    courseId: "cur-elec-1",
    title: "Informe Técnico 1: Arranque Estrella-Triángulo en PLC",
    description: "Describa el direccionamiento de E/S físicas y la programación detallada en diagrama Ladder o Bloques de Funciones.",
    dueDate: "2026-06-30",
    submissions: [
      {
        studentDni: "12345678",
        studentName: "Luis Fernando Castillo Rivera",
        fileName: "informe_semana3_castillo.pdf",
        submitDate: "2026-06-18",
        grade: 17
      }
    ]
  }
];

export const INITIAL_EVALUATIONS: CourseEvaluation[] = [
  {
    id: "eval-1",
    courseId: "cur-elec-1",
    title: "Examen Parcial Teórico-Práctico",
    questionsCount: 5,
    durationMinutes: 45,
    grades: [
      {
        studentDni: "12345678",
        score: 18,
        date: "2026-06-15"
      }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    courseId: "cur-elec-1",
    date: "2026-06-01",
    statusMap: {
      "12345678": "Presente",
      "22334455": "Presente",
      "44556677": "Presente",
      "88776655": "Tardanza",
      "55667788": "Falta"
    }
  }
];

export const INITIAL_CYCLE_STATUSES: { [studentDni: string]: CycleStatus[] } = {
  "12345678": [
    {
      cycleNumber: 1,
      year: 2026,
      status: "Aprobado",
      average: 16.5,
      credits: 22,
      courses: [
        { name: "Automatización Industrial y PLC", grade: 17, approved: true },
        { name: "Circuitos de Media y Baja Tensión", grade: 16, approved: true }
      ]
    }
  ]
};

export const INITIAL_GRADUATIONS: Graduation[] = [];

export const EXAM_QUESTIONS = [
  {
    id: 1,
    question: "¿Cuál es el instrumento principal utilizado para medir voltaje, corriente y resistencia en tableros?",
    options: ["Osciloscopio", "Multímetro / Pinza Amperimétrica", "Cofímetro", "Vatímetro"],
    answer: "Multímetro / Pinza Amperimétrica"
  },
  {
    id: 2,
    question: "Si una máquina trifásica tiene un voltaje de 380V y consume una corriente de 10A con Cos Phi de 0.86, ¿cuál es su potencia activa aproximada?",
    options: ["5.6 kW", "3.0 kW", "1.2 kW", "8.1 kW"],
    answer: "5.6 kW"
  },
  {
    id: 3,
    question: "Qué contactos de seguridad se asocian en el relé térmico para desactivar y señalar falla en un motor?",
    options: [
      "95-96 (NC) / 97-98 (NA)",
      "13-14 (NA) / 21-22 (NC)",
      "A1-A2 de alimentación",
      "L1-L2 de potencia directa"
    ],
    answer: "95-96 (NC) / 97-98 (NA)"
  },
  {
    id: 4,
    question: "En contabilidad financiera de acuerdo a NIIF, ¿cuál es la ecuación fundamental de partida doble?",
    options: [
      "Activo = Pasivo + Patrimonio",
      "Ingresos = Egresos + Impuestos",
      "Utilidad = Ventas + Depreciación",
      "Caja = Bancos - Cuentas por Cobrar"
    ],
    answer: "Activo = Pasivo + Patrimonio"
  },
  {
    id: 5,
    question: "¿Cuál de los siguientes es un tributo administrado directamente por la SUNAT en las transacciones comerciales?",
    options: ["Alcabala", "Impuesto Predial", "Impuesto General a las Ventas (IGV)", "Arbitrios Municipales"],
    answer: "Impuesto General a las Ventas (IGV)"
  }
];
