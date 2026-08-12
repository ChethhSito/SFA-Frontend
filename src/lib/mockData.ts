import { 
  Program, Applicant, Enrollment, Course, Classroom, 
  Teacher, CourseMaterial, CourseAssignment, CourseEvaluation, 
  AttendanceRecord, CycleStatus, Graduation, ProgramId 
} from "@/types";

export const ACADEMIC_PROGRAMS: Program[] = [
  {
    id: "electronica",
    name: "Electricidad Industrial",
    description: "Forma especialistas capacitados en el montaje, instalación, operación y mantenimiento de sistemas eléctricos de media y baja tensión, automatización cableada y control lógico programable (PLC) de motores industriales.",
    duration: "3 años (6 Ciclos)",
    courses: ["Automatización Industrial y PLC", "Circuitos de Media y Baja Tensión", "Maquinaria de Potencia", "Instalaciones Eléctricas"]
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    description: "Domina el control de auditorías financieras, contabilidad de costos, tributación corporativa, flujos de caja e informática aplicada a la gestión contable de acuerdo a las Normas NIIF.",
    duration: "3 años (6 Ciclos)",
    courses: ["Contabilidad de Costos Financieros", "Auditoría Tributaria Corporativa", "Sistemas de Información Contable", "Tributación General"]
  }
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    applicantCode: "202610001",
    dni: "77777777",
    name: "Juan Pérez",
    lastName: "García",
    email: "juan@gmail.com",
    phone: "987654321",
    programId: "electronica",
    paymentStatus: "Pendiente",
    paymentOperation: "OP-011234",
    examStatus: "No Programado",
    admitted: false,
    docs: {
      dniFile: { status: "Validado", fileName: "dni_juan_garcia.pdf" },
      certificadoFile: { status: "Pendiente", fileName: "certificado_secundaria_juan.pdf" },
      partidaFile: { status: "No Enviado" },
      fotoFile: { status: "Pendiente", fileName: "foto_juan.jpg" }
    },
    periodId: "1",
    folderStatus: "Pending",
    password: "password123",
    supportMessages: [
      {
        id: "msg_init_1",
        sender: "postulante",
        category: "Dificultad con el formato o visualización del PDF",
        text: "Hola, mi certificado de secundaria fue escaneado en formato JPG pero la plataforma me pide PDF. ¿Pueden ayudarme a validarlo o se los envío por aquí?",
        date: "12/03/2026"
      }
    ]
  },
  {
    applicantCode: "202610002",
    dni: "76543210",
    name: "María López",
    lastName: "Torres",
    email: "maria.lopez@gmail.com",
    phone: "912345678",
    programId: "contabilidad",
    paymentStatus: "Validado",
    paymentOperation: "OP-055432",
    examStatus: "No Programado",
    admitted: true,
    docs: {
      dniFile: { status: "Validado", fileName: "dni_maria_lopez.pdf" },
      certificadoFile: { status: "Validado", fileName: "certificado_secundaria_maria.pdf" },
      partidaFile: { status: "Validado", fileName: "partida_nacimiento_maria.pdf" },
      fotoFile: { status: "Validado", fileName: "foto_maria.jpg" }
    },
    periodId: "1",
    folderStatus: "Approved",
    password: "password123"
  },
  {
    applicantCode: "202610003",
    dni: "45678912",
    name: "Carlos Ramirez",
    lastName: "Silva",
    email: "carlos.ram@gmail.com",
    phone: "934567812",
    programId: "electronica",
    paymentStatus: "Validado",
    paymentOperation: "OP-987123",
    examStatus: "No Programado",
    admitted: true,
    docs: {
      dniFile: { status: "Validado", fileName: "copia_dni_silva.pdf" },
      certificadoFile: { status: "Validado", fileName: "certificado_estudios_carlos.pdf" },
      partidaFile: { status: "Validado", fileName: "partida_nacimiento_carlos.pdf" },
      fotoFile: { status: "Validado", fileName: "foto_perfil_carlos.jpg" }
    },
    periodId: "1",
    folderStatus: "Approved",
    password: "password123"
  },
  {
    applicantCode: "202610004",
    dni: "98765432",
    name: "Ana Rodríguez",
    lastName: "Vega",
    email: "ana.rod@gmail.com",
    phone: "956890123",
    programId: "contabilidad",
    paymentStatus: "Pendiente",
    paymentOperation: "OP-889988",
    examStatus: "No Programado",
    admitted: false,
    docs: {
      dniFile: { status: "No Enviado" },
      certificadoFile: { status: "No Enviado" },
      partidaFile: { status: "No Enviado" },
      fotoFile: { status: "No Enviado" }
    },
    periodId: "1",
    folderStatus: "Pending",
    password: "password123"
  }
];

export const INITIAL_STUDENTS_DATA = {
  "12345678": {
    dni: "12345678",
    birthDate: "2000-01-15",
    name: "Luis Fernando",
    lastName: "Castillo Rivera",
    gender: "Masculino",
    email: "luis.castillo@iestpsfa.edu.pe",
    phone: "987654322",
    address: "Av. Principal 123",
    district: "San Juan de Lurigancho",
    province: "Lima",
    emergencyName: "María Rivera",
    emergencyPhone: "987654320",
    emergencyRelation: "Madre"
  }
};

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    studentDni: "12345678",
    programId: "electronica",
    academicStatus: "ADMITIDO", // Needs docs validated & matricula payment validated to go "MATRICULADO"
    docs: {
      dniFile: { status: "Validado", fileName: "dni_scan_castillo.pdf" },
      certificadoFile: { status: "Pendiente" },
      partidaFile: { status: "Observado", fileName: "partida_ilegible.jpg", observations: "La imagen está borrosa en la zona de la firma del registrador. Por favor vuelva a escanear en alta resolución." },
      fotoFile: { status: "Pendiente" }
    },
    paymentStatus: "Pendiente",
    paymentOperation: "MATR-88772"
  },
  {
    studentDni: "45678912", // Carlos Ramirez, who just got admitted
    programId: "electronica",
    academicStatus: "ADMITIDO",
    docs: {
      dniFile: { status: "No Enviado" },
      certificadoFile: { status: "No Enviado" },
      partidaFile: { status: "No Enviado" },
      fotoFile: { status: "No Enviado" }
    },
    paymentStatus: "No Pagado"
  }
];

export const GENERAL_TEACHERS: Teacher[] = [
  {
    dni: "docente",
    name: "Miguel Ángel",
    lastName: "Ramos Torres",
    email: "mramos@iestpsfa.edu.pe",
    specialty: "Sistemas & Automatización Eléctrica"
  },
  {
    dni: "99887766",
    name: "Rosa Elvira",
    lastName: "Díaz Campos",
    email: "rdiaz@iestpsfa.edu.pe",
    specialty: "Contabilidad de Costos y Tributación Corporativa"
  }
];

export const GENERAL_CLASSROOMS: Classroom[] = [
  { id: "aula-101", name: "Aula 101 - Contabilidad", location: "Edificio de Finanzas", floor: 1, capacity: 30 },
  { id: "lab-info-1", name: "Lab. Automatización I", location: "Pabellón B de Ingeniería", floor: 2, capacity: 25 },
  { id: "aula-201", name: "Aula 102 - Motores", location: "Edificio de Maquinarias", floor: 2, capacity: 40 },
  { id: "lab-202", name: "Estación de Subestaciones S1", location: "Patio Eléctrico", floor: 1, capacity: 20 }
];

export const INITIAL_COURSES: Course[] = [
  // Electricidad Industrial & Sistemas Courses for Docente Ramos Torres
  {
    id: "cur-elec-1",
    name: "Automatización Industrial y PLC",
    code: "EE-101",
    credits: 4,
    classroom: "Lab. Automatización I",
    schedule: "Lunes 08:00 AM - 11:30 AM",
    teacherDni: "docente",
    career: "Electricidad Industrial",
    group: "A",
    curriculum: "Currícula 2024",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-elec-2",
    name: "Circuitos de Media y Baja Tensión",
    code: "EE-102",
    credits: 3,
    classroom: "Estación de Subestaciones S1",
    schedule: "Miércoles 08:00 AM - 10:30 AM",
    teacherDni: "docente",
    career: "Electricidad Industrial",
    group: "A",
    curriculum: "Currícula 2024",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-proj-1",
    name: "Administración de Proyectos Informáticos",
    code: "SY-301",
    credits: 4,
    classroom: "Laboratorio de Cómputo C-2",
    schedule: "Martes 02:00 PM - 05:30 PM",
    teacherDni: "docente",
    career: "Análisis de Sistemas",
    group: "B",
    curriculum: "Currícula 2023",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-redes-2",
    name: "Redes y Comunicación de Datos II",
    code: "SY-302",
    credits: 3,
    classroom: "Laboratorio de Redes R-1",
    schedule: "Jueves 10:00 AM - 01:00 PM",
    teacherDni: "docente",
    career: "Análisis de Sistemas",
    group: "B",
    curriculum: "Currícula 2023",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-invest-1",
    name: "Taller de Investigación en Ingeniería I",
    code: "SY-303",
    credits: 4,
    classroom: "Aula B-105",
    schedule: "Viernes 08:00 AM - 11:30 AM",
    teacherDni: "docente",
    career: "Análisis de Sistemas",
    group: "A",
    curriculum: "Currícula 2023",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-bi-1",
    name: "Inteligencia de Negocios",
    code: "SY-304",
    credits: 3,
    classroom: "Laboratorio de Cómputo C-3",
    schedule: "Lunes 02:00 PM - 05:00 PM",
    teacherDni: "docente",
    career: "Análisis de Sistemas",
    group: "A",
    curriculum: "Currícula 2023",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-topicos-1",
    name: "Tópicos de Tecnologías de Información",
    code: "SY-305",
    credits: 3,
    classroom: "Laboratorio de Cómputo C-2",
    schedule: "Miércoles 03:00 PM - 06:00 PM",
    teacherDni: "docente",
    career: "Análisis de Sistemas",
    group: "B",
    curriculum: "Currícula 2023",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  // Contabilidad Courses
  {
    id: "cur-cont-1",
    name: "Contabilidad de Costos Financieros",
    code: "CF-101",
    credits: 4,
    classroom: "Aula 101 - Contabilidad",
    schedule: "Lunes 08:00 AM - 11:30 AM",
    teacherDni: "99887766",
    career: "Contabilidad",
    group: "A",
    curriculum: "Currícula 2024",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  },
  {
    id: "cur-cont-2",
    name: "Auditoría Tributaria Corporativa",
    code: "CF-102",
    credits: 3,
    classroom: "Aula 101 - Contabilidad",
    schedule: "Miércoles 08:00 AM - 10:30 AM",
    teacherDni: "99887766",
    career: "Contabilidad",
    group: "A",
    curriculum: "Currícula 2024",
    startDate: "06/04/2026",
    endDate: "24/07/2026",
    studentCount: 5
  }
];

export const INITIAL_MATERIALS: CourseMaterial[] = [
  // Electricidad (EE-101, EE-102)
  {
    id: "mat-elec-1",
    courseId: "cur-elec-1",
    title: "Syllabus y Programación Ladder en PLC S7-1200",
    date: "2026-05-10",
    fileName: "plc_siemens_ladder_intro.pdf"
  },
  {
    id: "mat-elec-2",
    courseId: "cur-elec-1",
    title: "Esquema Eléctrico de Arranque Directo de Motores",
    date: "2026-05-17",
    fileName: "esquema_arranque_motores.pdf"
  },
  // Contabilidad (CF-101, CF-102)
  {
    id: "mat-cont-1",
    courseId: "cur-cont-1",
    title: "Estructura del Estado de Situación Financiera NIIF",
    date: "2026-05-10",
    fileName: "balance_general_contable_niif.pdf"
  },
  {
    id: "mat-cont-2",
    courseId: "cur-cont-1",
    title: "Cálculo de Costos de Ventas y de Depreciación",
    date: "2026-05-17",
    fileName: "planilla_metodos_depreciacion.xlsx"
  }
];

export const INITIAL_ASSIGNMENTS: CourseAssignment[] = [
  // Electricidad Industrial Tasks
  {
    id: "asg-elec-1",
    courseId: "cur-elec-1",
    title: "Práctica 1: Diseño de Semáforo de Cruce en Ladder",
    description: "Diseñar la lógica de control para un semáforo peatonal temporizado utilizando temporizadores TON en TIA Portal. Entregar archivo .zap16 o PDF.",
    dueDate: "2026-06-05",
    submissions: [
      {
        studentDni: "12345678",
        studentName: "Luis Fernando Castillo Rivera",
        fileName: "practica1_semaforo_castillo.pdf",
        submitDate: "2026-05-25",
        grade: 17
      }
    ]
  },
  {
    id: "asg-elec-2",
    courseId: "cur-elec-1",
    title: "Práctica 2: Esquema de Inversión de Giro de Motor Síncrono",
    description: "Dibujar el diagrama de fuerza y control para un inversor de marcha de motor trifásico con enclavamiento de seguridad física y lógica.",
    dueDate: "2026-06-12",
    submissions: [
      {
        studentDni: "12345678",
        studentName: "Luis Fernando Castillo Rivera",
        fileName: "inversor_giro_motor_castillo.dwg",
        submitDate: "2026-05-27"
      }
    ]
  },
  // Contabilidad Tasks
  {
    id: "asg-cont-1",
    courseId: "cur-cont-1",
    title: "Tarea 1: Elaboración de un Balance General de Apertura",
    description: "Dado el historial comercial anexo, registrar el asiento de apertura del libro diario mayor utilizando el Plan Contable General Empresarial (PCGE).",
    dueDate: "2026-06-05",
    submissions: []
  },
  {
    id: "asg-cont-2",
    courseId: "cur-cont-1",
    title: "Tarea 2: Liquidación Mensual del IGV y Registro del R.V.",
    description: "Completar la simulación de compras y ventas gravadas para declarar en el portal SUNAT utilizando el PDT 621 correspondiente.",
    dueDate: "2026-06-15",
    submissions: []
  }
];

export const INITIAL_EVALUATIONS: CourseEvaluation[] = [
  {
    id: "eval-elec",
    courseId: "cur-elec-1",
    title: "Evaluación Escrita 1: PLC & Tableros de Distribución",
    questionsCount: 10,
    durationMinutes: 45,
    grades: [
      { studentDni: "12345678", score: 18, date: "2026-05-20" }
    ]
  },
  {
    id: "eval-cont",
    courseId: "cur-cont-1",
    title: "Evaluación Escrita 1: Plan Contable & Costos",
    questionsCount: 10,
    durationMinutes: 45,
    grades: []
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Electricidad (enrolled student 12345678)
  {
    id: "att-elec-1",
    courseId: "cur-elec-1",
    date: "2026-05-10",
    statusMap: { "12345678": "Presente" }
  },
  {
    id: "att-elec-2",
    courseId: "cur-elec-1",
    date: "2026-05-17",
    statusMap: { "12345678": "Presente" }
  },
  {
    id: "att-elec-3",
    courseId: "cur-elec-1",
    date: "2026-05-24",
    statusMap: { "12345678": "Tardanza" }
  }
];

export const INITIAL_CYCLE_STATUSES: { [studentDni: string]: CycleStatus[] } = {
  "12345678": [
    {
      cycleNumber: 1,
      year: 2025,
      status: "Aprobado",
      average: 16.5,
      credits: 22,
      courses: [
        { name: "Electrotecnia General", grade: 17, approved: true },
        { name: "Dibujo Técnico Mecánico", grade: 15, approved: true },
        { name: "Matemática Aplicada I", grade: 16, approved: true },
        { name: "Seguridad Industrial e Higiene", grade: 18, approved: true }
      ]
    },
    {
      cycleNumber: 2,
      year: 2026,
      status: "Pendiente",
      average: 15.8,
      credits: 24,
      courses: [
        { name: "Automatización Industrial y PLC", grade: 17, approved: true },
        { name: "Circuitos de Media y Baja Tensión", grade: 15, approved: true }
      ]
    }
  ]
};

export const INITIAL_GRADUATIONS: Graduation[] = [
  {
    studentDni: "12345678",
    status: "Solicitado",
    step: "Revision Documental",
    docsChecked: {
      solicitud: true,
      constanciaEgresado: true,
      practicasPre: false,
      pagoDerecho: true
    },
    obs: "Queda pendiente validar la constancia de prácticas pre-profesionales de electricidad."
  }
];

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
    question: "¿Qué contactos de seguridad se asocian en el relé térmico para desactivar y señalar falla en un motor?",
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
