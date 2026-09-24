# 📦 Respaldo Oficial de Datos Semilla (`mockData.ts`)

> **Documento de Respaldo de Emergencia** | *IESTP San Francisco de Asís*
> Ubicación de respaldo: `d:\TP -2026\SFA-Frontend Original\RESPALDO_MOCKDATA.ts` y `RESPALDO_MOCKDATA.md`

---

## 📜 Código Fuente Completo de `mockData.ts`

```typescript
import {
  Student,
  Applicant,
  Teacher,
  Classroom,
  Course,
  CourseMaterial,
  CourseAssignment,
  CourseEvaluation,
  AttendanceRecord,
  CycleStatus,
  Program,
  Enrollment,
  Graduation
} from "../types";

export interface SubjectCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  careerId: string;
  referenceCycle: number;
  type: string;
  status: "Activo" | "Inactivo";
}

export const OFFICIAL_CURRICULUM_COURSES: SubjectCourse[] = [
  // Period 1
  { id: "cnt_p1_1", name: "Contabilidad General I", code: "CNT-101", credits: 4, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "cnt_p1_2", name: "Plan Contable General Empresarial (PCGE)", code: "CNT-102", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "cnt_p1_3", name: "Documentación Comercial y Tributaria", code: "CNT-103", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "cnt_p1_4", name: "Administración Empresarial y Emprendimiento", code: "CNT-104", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "cnt_p1_5", name: "Matemática Financiera I", code: "CNT-105", credits: 3, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "cnt_p1_6", name: "Técnicas de Comunicación Oral y Escrita", code: "CNT-106", credits: 2, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "cnt_p1_7", name: "Informática e Internet Aplicada", code: "CNT-107", credits: 2, careerId: "contabilidad", referenceCycle: 1, type: "General", status: "Activo" },

  // Period 2
  { id: "cnt_p2_1", name: "Contabilidad General II", code: "CNT-201", credits: 4, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "cnt_p2_2", name: "Legislación Tributaria I (IGV y Renta)", code: "CNT-202", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "cnt_p2_3", name: "Legislación Laboral y Planillas Electrónicas (PLAME)", code: "CNT-203", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "cnt_p2_4", name: "Matemática Financiera II", code: "CNT-204", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "cnt_p2_5", name: "Estadística Aplicada a los Negocios", code: "CNT-205", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "cnt_p2_6", name: "Software Contable I (Concar / SIIGO)", code: "CNT-206", credits: 3, careerId: "contabilidad", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "cnt_p2_7", name: "Ética Profesional y Deontología", code: "CNT-207", credits: 2, careerId: "contabilidad", referenceCycle: 2, type: "General", status: "Activo" },

  // Period 3
  { id: "cnt_p3_1", name: "Contabilidad de Costos I", code: "CNT-301", credits: 4, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "cnt_p3_2", name: "Estados Financieros y Notas de Contabilidad", code: "CNT-302", credits: 4, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "cnt_p3_3", name: "Legislación Tributaria II (Fiscalización y Procedimientos)", code: "CNT-303", credits: 3, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "cnt_p3_4", name: "Contabilidad Sociedades y Reorganización", code: "CNT-304", credits: 3, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "cnt_p3_5", name: "Software Contable II (Excel Avanzado Financiero)", code: "CNT-305", credits: 3, careerId: "contabilidad", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "cnt_p3_6", name: "Inglés Técnico I para Negocios", code: "CNT-306", credits: 2, careerId: "contabilidad", referenceCycle: 3, type: "General", status: "Activo" },

  // Period 4
  { id: "cnt_p4_1", name: "Contabilidad de Costos II y Presupuestos", code: "CNT-401", credits: 4, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "cnt_p4_2", name: "Análisis e Interpretación de Estados Financieros", code: "CNT-402", credits: 4, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "cnt_p4_3", name: "Auditoría Financiera y Control Interno I", code: "CNT-403", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "cnt_p4_4", name: "Finanzas Corporativas y Gestión de Tesorería", code: "CNT-404", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "cnt_p4_5", name: "Contabilidad Gubernamental y SIAF", code: "CNT-405", credits: 3, careerId: "contabilidad", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "cnt_p4_6", name: "Inglés Técnico II para Negocios", code: "CNT-406", credits: 2, careerId: "contabilidad", referenceCycle: 4, type: "General", status: "Activo" },

  // Period 5
  { id: "cnt_p5_1", name: "Auditoría Tributaria Preventiva", code: "CNT-501", credits: 4, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "cnt_p5_2", name: "Normas Internacionales de Información Financiera (NIIF)", code: "CNT-502", credits: 4, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "cnt_p5_3", name: "Auditoría Financiera y Control Interno II", code: "CNT-503", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "cnt_p5_4", name: "Formulaciones de Proyectos de Inversión", code: "CNT-504", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "cnt_p5_5", name: "Sistemas ERP Contables (SAP Business One)", code: "CNT-505", credits: 3, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "cnt_p5_6", name: "Proyecto Empresarial I", code: "CNT-506", credits: 2, careerId: "contabilidad", referenceCycle: 5, type: "Especialidad", status: "Activo" },

  // Period 6
  { id: "cnt_p6_1", name: "Peritaje Contable y Judicial", code: "CNT-601", credits: 4, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "cnt_p6_2", name: "Planeamiento Tributario Estratégico", code: "CNT-602", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "cnt_p6_3", name: "Contabilidad de Entidades Financieras y Seguros", code: "CNT-603", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "cnt_p6_4", name: "Proyecto de Fin de Carrera (Sustentación de Titulación)", code: "CNT-604", credits: 4, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "cnt_p6_5", name: "Proyecto Empresarial II", code: "CNT-605", credits: 3, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },
  { id: "cnt_p6_6", name: "Seminario de Actualización Contable y NIIF Pymes", code: "CNT-606", credits: 2, careerId: "contabilidad", referenceCycle: 6, type: "Especialidad", status: "Activo" },

  // Electricidad Industrial - Period 1
  { id: "ele_p1_1", name: "Instalaciones Eléctricas de Interiores y Edificaciones", code: "EEI-101", credits: 4, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_2", name: "Circuitos Eléctricos I (Corriente Continua)", code: "EEI-102", credits: 4, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_3", name: "Dibujo Técnico e Interpretación de Planos Eléctricos", code: "EEI-103", credits: 3, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_4", name: "Mediciones Eléctricas y Seguridad Industrial", code: "EEI-104", credits: 3, careerId: "electronica", referenceCycle: 1, type: "Especialidad", status: "Activo" },
  { id: "ele_p1_5", name: "Matemática Aplicada a la Electrotecnia", code: "EEI-105", credits: 3, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "ele_p1_6", name: "Física e Introducción a la Mecánica", code: "EEI-106", credits: 2, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },
  { id: "ele_p1_7", name: "Técnicas de Comunicación", code: "EEI-107", credits: 2, careerId: "electronica", referenceCycle: 1, type: "General", status: "Activo" },

  // Period 2
  { id: "ele_p2_1", name: "Circuitos Eléctricos II (Corriente Alterna Monofásica y Trifásica)", code: "EEI-201", credits: 4, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_2", name: "Transformadores y Máquinas Eléctricas Estáticas", code: "EEI-202", credits: 4, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_3", name: "Electrónica Básica Industrial y Componentes Semiconductores", code: "EEI-203", credits: 3, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_4", name: "Diseño Asistido por Computadora (CAD Eléctrico / AutoCAD)", code: "EEI-204", credits: 3, careerId: "electronica", referenceCycle: 2, type: "Especialidad", status: "Activo" },
  { id: "ele_p2_5", name: "Seguridad, Salud Ocupacional y Medio Ambiente (SSOMA)", code: "EEI-205", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },
  { id: "ele_p2_6", name: "Inglés Técnico I para Electrotecnia", code: "EEI-206", credits: 2, careerId: "electronica", referenceCycle: 2, type: "General", status: "Activo" },

  // Period 3
  { id: "ele_p3_1", name: "Máquinas Eléctricas Rotativas (Motores y Generadores)", code: "EEI-301", credits: 4, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_2", name: "Control y Automatismo Industrial Cableado (Contactores y Relés)", code: "EEI-302", credits: 4, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_3", name: "Instalaciones Eléctricas Industriales de Baja y Media Tensión", code: "EEI-303", credits: 3, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_4", name: "Electrónica de Potencia (SCR, Triac, IGBT y Variadores Simples)", code: "EEI-304", credits: 3, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_5", name: "Tableros Eléctricos de Fuerza y Control", code: "EEI-305", credits: 3, careerId: "electronica", referenceCycle: 3, type: "Especialidad", status: "Activo" },
  { id: "ele_p3_6", name: "Inglés Técnico II para Electrotecnia", code: "EEI-306", credits: 2, careerId: "electronica", referenceCycle: 3, type: "General", status: "Activo" },

  // Period 4
  { id: "ele_p4_1", name: "Controladores Lógicos Programables I (PLC Siemens Logo! y S7-1200)", code: "EEI-401", credits: 4, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_2", name: "Variadores de Frecuencia y Arrancadores Suaves", code: "EEI-402", credits: 4, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_3", name: "Redes e Subestaciones Eléctricas de Distribución", code: "EEI-403", credits: 3, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_4", name: "Neumática y Electro-Neumática Industrial", code: "EEI-404", credits: 3, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_5", name: "Sistemas de Puesta a Tierra y Protección Eléctrica", code: "EEI-405", credits: 3, careerId: "electronica", referenceCycle: 4, type: "Especialidad", status: "Activo" },
  { id: "ele_p4_6", name: "Gestión y Organización de Empresas Industriales", code: "EEI-406", credits: 2, careerId: "electronica", referenceCycle: 4, type: "General", status: "Activo" },

  // Period 5
  { id: "ele_p5_1", name: "Controladores Lógicos Programables II (PLC Avanzado y TIA Portal)", code: "EEI-501", credits: 4, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_2", name: "Sistemas SCADA y Redes de Comunicación Industrial (Profinet/Modbus)", code: "EEI-502", credits: 4, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_3", name: "Hidráulica y Electro-Hidráulica Industrial", code: "EEI-503", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_4", name: "Instrumentación Industrial y Control de Procesos (PID)", code: "EEI-504", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_5", name: "Mantenimiento Eléctrico Industrial y RCM", code: "EEI-505", credits: 3, careerId: "electronica", referenceCycle: 5, type: "Especialidad", status: "Activo" },
  { id: "ele_p5_6", name: "Proyecto Empresarial I", code: "EEI-506", credits: 2, careerId: "electronica", referenceCycle: 5, type: "General", status: "Activo" },

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

export const INITIAL_APPLICANTS: Applicant[] = [];

export const INITIAL_STUDENTS_DATA: { [dni: string]: any } = {};

export const INITIAL_ENROLLMENTS: Enrollment[] = [];

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
```
