export interface CourseFormulaVariable {
  id: string;
  label: string;
  weight: number; // e.g. 0.30 for 30%
}

export interface CourseFormula {
  courseCode: string;
  expression: string;
  variables: CourseFormulaVariable[];
}

export const COURSE_FORMULAS: Record<string, CourseFormula> = {
  "EIND-101-TEO": {
    courseCode: "EIND-101-TEO",
    expression: "0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "NPA", label: "Nota de Participación / Informes", weight: 0.20 },
      { id: "PC1", label: "Práctica Calificada 1", weight: 0.20 },
      { id: "PC2", label: "Práctica Calificada 2", weight: 0.20 },
      { id: "EX_FINAL", label: "Examen Final Integral del Curso", weight: 0.40 },
    ],
  },
  "EIND-101-TAL": {
    courseCode: "EIND-101-TAL",
    expression: "0.30*TABLEROS + 0.30*MONTAJE + 0.40*PRACT_FINAL",
    variables: [
      { id: "TABLEROS", label: "Tableros de Distribución", weight: 0.30 },
      { id: "MONTAJE", label: "Montaje y Conexionado", weight: 0.30 },
      { id: "PRACT_FINAL", label: "Práctica Integral de Taller", weight: 0.40 },
    ],
  },
  "EIND-101-LAB": {
    courseCode: "EIND-101-LAB",
    expression: "0.50*SIMULACION + 0.50*MEDICIONES",
    variables: [
      { id: "SIMULACION", label: "Simulación de Circuitos CC", weight: 0.50 },
      { id: "MEDICIONES", label: "Mediciones e Instrumentación", weight: 0.50 },
    ],
  },
  "EIND-101": {
    courseCode: "EIND-101",
    expression: "0.60*(0.40*TEO + 0.40*TAL + 0.20*LAB) + 0.40*EX_FINAL",
    variables: [
      { id: "TEO", label: "Parte 1: Teoría (40% Continua / 2 Créditos)", weight: 0.24 },
      { id: "TAL", label: "Parte 2: Taller (40% Continua / 2 Créditos)", weight: 0.24 },
      { id: "LAB", label: "Parte 3: Laboratorio (20% Continua / 1 Crédito)", weight: 0.12 },
      { id: "EX_FINAL", label: "Examen Final Integral del Curso", weight: 0.40 },
    ],
  },
  "EIND-102": {
    courseCode: "EIND-102",
    expression: "0.20*NPA + 0.20*LAB1 + 0.20*LAB2 + 0.40*PROY_FINAL",
    variables: [
      { id: "NPA", label: "Nota de Participación", weight: 0.20 },
      { id: "LAB1", label: "Laboratorio Tableros", weight: 0.20 },
      { id: "LAB2", label: "Laboratorio Redes BT", weight: 0.20 },
      { id: "PROY_FINAL", label: "Proyecto Edificaciones", weight: 0.40 },
    ],
  },
  "EIND-103": {
    courseCode: "EIND-103",
    expression: "0.20*NPA + 0.20*EV1 + 0.20*EV2 + 0.40*EX_FINAL",
    variables: [
      { id: "NPA", label: "Nota de Participación", weight: 0.20 },
      { id: "EV1", label: "Seguridad Industrial", weight: 0.20 },
      { id: "EV2", label: "Normativa BT", weight: 0.20 },
      { id: "EX_FINAL", label: "Evaluación Modular", weight: 0.40 },
    ],
  },
  "EIND-104": {
    courseCode: "EIND-104",
    expression: "0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "NPA", label: "Nota de Participación", weight: 0.20 },
      { id: "PC1", label: "Práctica Calificada 1", weight: 0.20 },
      { id: "PC2", label: "Práctica Calificada 2", weight: 0.20 },
      { id: "EX_FINAL", label: "Examen de Unidad", weight: 0.40 },
    ],
  },
  "EIND-105": {
    courseCode: "EIND-105",
    expression: "0.20*NPA + 0.20*TAREA + 0.20*PART + 0.40*EX_FINAL",
    variables: [
      { id: "NPA", label: "Nota de Participación", weight: 0.20 },
      { id: "TAREA", label: "Talleres Digitales", weight: 0.20 },
      { id: "PART", label: "Participación Técnica", weight: 0.20 },
      { id: "EX_FINAL", label: "Evaluación Integral", weight: 0.40 },
    ],
  },
  "default": {
    courseCode: "default",
    expression: "0.20*NPA + 0.20*PC1 + 0.20*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "NPA", label: "Nota de Participación", weight: 0.20 },
      { id: "PC1", label: "Práctica Calificada 1", weight: 0.20 },
      { id: "PC2", label: "Práctica Calificada 2", weight: 0.20 },
      { id: "EX_FINAL", label: "Examen Final", weight: 0.40 },
    ],
  }
};

export const getCourseFormula = (code?: string): CourseFormula => {
  if (!code) return COURSE_FORMULAS["default"];
  if (COURSE_FORMULAS[code]) return COURSE_FORMULAS[code];
  const clean = code.trim().toUpperCase();
  if (COURSE_FORMULAS[clean]) return COURSE_FORMULAS[clean];
  const prefix = clean.split("-").slice(0, 2).join("-");
  if (prefix && COURSE_FORMULAS[prefix]) return COURSE_FORMULAS[prefix];
  return COURSE_FORMULAS["default"];
};
