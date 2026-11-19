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
  "EIND-101": {
    courseCode: "EIND-101",
    expression: "0.30*PC1 + 0.30*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "PC1", label: "Práctica Calificada 1 (PC1)", weight: 0.30 },
      { id: "PC2", label: "Práctica Calificada 2 (PC2)", weight: 0.30 },
      { id: "EX_FINAL", label: "Examen Final (EX_FINAL)", weight: 0.40 },
    ],
  },
  "EIND-102": {
    courseCode: "EIND-102",
    expression: "0.25*LAB1 + 0.25*LAB2 + 0.50*PROY_FINAL",
    variables: [
      { id: "LAB1", label: "Laboratorio Tableros (LAB1)", weight: 0.25 },
      { id: "LAB2", label: "Laboratorio Redes BT (LAB2)", weight: 0.25 },
      { id: "PROY_FINAL", label: "Proyecto Edificaciones (PROY_FINAL)", weight: 0.50 },
    ],
  },
  "EIND-103": {
    courseCode: "EIND-103",
    expression: "0.30*EV1 + 0.30*EV2 + 0.40*EX_FINAL",
    variables: [
      { id: "EV1", label: "Seguridad Industrial (EV1)", weight: 0.30 },
      { id: "EV2", label: "Normativa BT (EV2)", weight: 0.30 },
      { id: "EX_FINAL", label: "Evaluación Modular (EX_FINAL)", weight: 0.40 },
    ],
  },
  "EIND-104": {
    courseCode: "EIND-104",
    expression: "0.30*PC1 + 0.30*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "PC1", label: "Práctica Calificada 1 (PC1)", weight: 0.30 },
      { id: "PC2", label: "Práctica Calificada 2 (PC2)", weight: 0.30 },
      { id: "EX_FINAL", label: "Examen de Unidad (EX_FINAL)", weight: 0.40 },
    ],
  },
  "EIND-105": {
    courseCode: "EIND-105",
    expression: "0.30*TAREA + 0.30*PART + 0.40*EX_FINAL",
    variables: [
      { id: "TAREA", label: "Talleres Digitales (TAREA)", weight: 0.30 },
      { id: "PART", label: "Participación Técnica (PART)", weight: 0.30 },
      { id: "EX_FINAL", label: "Evaluación Integral (EX_FINAL)", weight: 0.40 },
    ],
  },
  "default": {
    courseCode: "default",
    expression: "0.30*PC1 + 0.30*PC2 + 0.40*EX_FINAL",
    variables: [
      { id: "PC1", label: "Práctica Calificada 1 (PC1)", weight: 0.30 },
      { id: "PC2", label: "Práctica Calificada 2 (PC2)", weight: 0.30 },
      { id: "EX_FINAL", label: "Examen Final (EX_FINAL)", weight: 0.40 },
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
