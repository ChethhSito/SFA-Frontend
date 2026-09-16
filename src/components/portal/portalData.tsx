import React from "react";
import { Zap, Landmark } from "lucide-react";

export interface CareerDetail {
  id: string;
  name: string;
  hours: string;
  title: string;
  profile: string;
  salaryEst: string;
  image: string;
  icon: React.ReactNode;
  careerPath: {
    cycle: string;
    courses: string[];
  }[];
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface TransparencyDoc {
  title: string;
  code: string;
  size: string;
  desc: string;
}

export const careersDetail: CareerDetail[] = [
  {
    id: "electronica",
    name: "Electricidad Industrial",
    hours: "3080 Horas Lectivas (3 Años / 6 Ciclos)",
    title: "Profesional Técnico en Electricidad Industrial",
    profile: "Diagnostica, instala, programa y realiza el mantenimiento preventivo y correctivo de sistemas eléctricos de media y baja tensión, maquinaria de potencia, automatización industrial mediante PLCs, motores eléctricos y tableros de control.",
    salaryEst: "S/. 1,900 - S/. 4,200",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=800&auto=format&fit=crop",
    icon: <Zap className="w-6 h-6 text-amber-300" />,
    careerPath: [
      { cycle: "I Ciclo", courses: ["Electricidad de Corriente Continua", "Taller de Ajuste Mecánico", "Matemática Aplicada", "Seguridad e Higiene Industrial"] },
      { cycle: "II Ciclo", courses: ["Dibujo Técnico Eléctrico", "Luminotecnia e Instalaciones", "Instalaciones de Potencia", "Física Técnica Aplicada"] },
      { cycle: "III Ciclo", courses: ["Electrónica Analógica e Instrumentación", "Mediciones Eléctricas", "Circuitos Eléctricos de CA", "Máquinas Eléctricas I"] },
      { cycle: "IV Ciclo", courses: ["Sistemas Digitales", "Bobinado de Máquinas Rotativas", "Control de Motores Eléctricos", "Programación Básica de PLCs"] },
      { cycle: "V Ciclo", courses: ["Automatización Industrial con PLCs Avanzados", "Neumática e Hidráulica Industrial", "Redes Industriales y SCADA", "Subestaciones Eléctricas"] },
      { cycle: "VI Ciclo", courses: ["Mantenimiento Electromecánico de Plantas", "Instrumentación y Control del Taller", "Gestión y Proyecto de Titulación Profesional", "Ética Profesional"] }
    ]
  },
  {
    id: "contabilidad",
    name: "Contabilidad Financiera",
    hours: "3040 Horas Lectivas (3 Años / 6 Ciclos)",
    title: "Profesional Técnico en Contabilidad",
    profile: "Domina el control tributario y financiero de acuerdo a las Normas Internacionales de Información Financiera (NIIF), auditoría tributaria en PyMEs, costos de producción y sistematización contable con software ERP moderno.",
    salaryEst: "S/. 1,700 - S/. 3,800",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    icon: <Landmark className="w-6 h-6 text-amber-300" />,
    careerPath: [
      { cycle: "I Ciclo", courses: ["Contabilidad General I", "Matemática Financiera Aplicada", "Documentación Comercial y Contable", "Tecnología de la Información"] },
      { cycle: "II Ciclo", courses: ["Plan Contable General Empresarial", "Tributación I (IGV y Comprobantes)", "Contabilidad General II", "Estadística Aplicada"] },
      { cycle: "III Ciclo", courses: ["Contabilidad de Costos Industriales", "Costeo por Procesos y Órdenes", "Tributación II (Renta y Retenciones)", "Legislación Comercial"] },
      { cycle: "IV Ciclo", courses: ["Software Contable ERP de Aplicación", "Legislación Laboral y Planillas", "Formulación de Estados Financieros", "Finanzas Empresariales"] },
      { cycle: "V Ciclo", courses: ["Auditoría Financiera e Integral", "Contabilidad Gubernamental del Estado", "Análisis e Interpretación de Estados", "Costos para la Toma de Decisiones"] },
      { cycle: "VI Ciclo", courses: ["Planeamiento Financiero y Fiscal Avanzado", "Peritaje Contable y Tributario", "Proyecto de Titulación Profesional", "Ética y Deontología Profesional"] }
    ]
  }
];

export const faqsList: FaqItem[] = [
  {
    id: 1,
    question: "¿La enseñanza en el IESTP San Francisco de Asís es gratuita?",
    answer: "Sí. Al ser un Instituto de Educación Superior Tecnológico Público, la enseñanza regular no tiene costos de pensión mensual (S/. 0.00 de pensión). Solo se abonan las tasas ordinarias institucionales por derecho de examen de admisión y matrícula semestral."
  },
  {
    id: 2,
    question: "¿Qué título obtendré al finalizar mis 3 años de estudio?",
    answer: "Obtendrás el Título Oficial a Nombre de la Nación como Profesional Técnico expedido directamente por el Ministerio de Educación (MINEDU), con pleno valor oficial para ejercer a nivel nacional e internacional."
  },
  {
    id: 3,
    question: "¿Cuáles son los requisitos para la Pre-Inscripción al Examen 2026-I?",
    answer: "Los requisitos básicos son: Copia simple de DNI vigente, Certificado de estudios de 5to de Secundaria (original o digital emitido por el Minedu) y comprobante del derecho de examen de admisión."
  },
  {
    id: 4,
    question: "¿Cuáles son los turnos de estudio disponibles?",
    answer: "Ofrecemos turnos en horario Diurno (Mañana/Tarde) y Nocturno, permitiendo a nuestros estudiantes trabajar y realizar sus prácticas profesionales mientras estudian."
  },
  {
    id: 5,
    question: "¿Cómo se realizan las Prácticas Pre-Profesionales (EFSRT)?",
    answer: "Se desarrollan progresivamente a lo largo de la carrera a través de los Módulos Formativos en empresas e instituciones mediante convenios interinstitucionales aprobados."
  },
  {
    id: 6,
    question: "¿Dónde se rinde el Examen de Admisión Ordinario?",
    answer: "El examen presencial se realiza en las instalaciones de nuestro campus principal ubicado en Villa María del Triunfo en las fechas publicadas en el cronograma institucional."
  },
  {
    id: 7,
    question: "¿Puedo convalidar estudios de otro instituto o universidad?",
    answer: "Sí, el proceso de convalidación académica se tramita mediante Secretaría Académica previa evaluación del Plan de Estudios y sílabos oficializados del postulante."
  },
  {
    id: 8,
    question: "¿Cuándo inician las clases del Semestre Académico 2026-I?",
    answer: "Las clases del Semestre 2026-I inician inmediatamente tras concluir el proceso de matrícula oficial adjudicado a los postulantes aprobados en el Examen de Admisión."
  }
];

export const transparencyDocs: TransparencyDoc[] = [
  {
    title: "Resolución de Licenciamiento R.M. 124-2021",
    code: "R.M. 124-2021-MINEDU",
    size: "2.4 MB PDF",
    desc: "Resolución Ministerial oficial expedida por el Ministerio de Educación que otorga el licenciamiento institucional."
  },
  {
    title: "Reglamento Académico Institucional 2026",
    code: "REG-ACAD-2026-I",
    size: "1.8 MB PDF",
    desc: "Normas integrales de evaluación semestral, asistencia, convalidación de asignaturas y permanencia académica."
  },
  {
    title: "Reglamento del Proceso de Admisión Ordinario",
    code: "REG-ADM-2026-I",
    size: "1.2 MB PDF",
    desc: "Lineamientos del examen de admisión, ponderación de contenidos, vacantes y adjudicación de plazas."
  },
  {
    title: "Reglamento de Titulación Profesional y EFSRT",
    code: "REG-TIT-2026",
    size: "1.5 MB PDF",
    desc: "Requisitos y procedimientos para la obtención del Título a Nombre de la Nación y prácticas pre-profesionales."
  },
  {
    title: "Reglamento de Investigación e Innovación",
    code: "REG-INV-2026",
    size: "1.1 MB PDF",
    desc: "Directivas para el desarrollo de proyectos de investigación aplicada e innovación tecnológica en módulos."
  },
  {
    title: "Reglamento de Conducta y Ética Estudiantil",
    code: "COD-ETICA-2026",
    size: "950 KB PDF",
    desc: "Código de ética, normas de convivencia, deberes, derechos y procedimiento disciplinario de la comunidad."
  },
  {
    title: "Reglamento de Protección de Datos Personales",
    code: "DIR-DATOS-2026",
    size: "820 KB PDF",
    desc: "Política de seguridad, privacidad y tratamiento de datos personales de postulantes y estudiantes matriculados."
  },
  {
    title: "Cuadro Oficial de Vacantes Admisión 2026-I",
    code: "VAC-ADM-2026",
    size: "650 KB PDF",
    desc: "Distribución oficial de vacantes por programa de estudios para los turnos diurno y nocturno."
  },
  {
    title: "Directiva de Becas y Bienestar Estudiantil",
    code: "DIR-BEC-2026",
    size: "890 KB PDF",
    desc: "Criterios y procedimientos para exoneración de tasas académicas por rendimiento o vulnerabilidad."
  }
];
