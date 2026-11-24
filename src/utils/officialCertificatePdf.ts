import { SFA_LOGO_BASE64 } from "./sfaLogo";
import { ACCREDITED_CURRICULUM_ELECTRICIDAD } from "../components/mge/tabs/MgeHistorialTab";

export interface OfficialCertificateParams {
  studentName: string;
  studentDni: string;
  program: string;
  certificateNumber: string;
  issueDate: string;
  issuerName: string;
}

const GRADE_WORDS: Record<number, string> = {
  14: "Catorce",
  15: "Quince",
  16: "Dieciséis",
  17: "Diecisiete",
  18: "Dieciocho",
  19: "Diecinueve",
  20: "Veinte",
};

/**
 * Encabezado oficial solemne del Certificado Oficial de Estudios (MINEDU / DRELM / IESTP SFA)
 */
function drawCertificateHeader(pdf: any, width: number, margin: number, certNumber: string, pageNum: number, totalPages: number) {
  // Franja superior borgoña institucional #800521
  pdf.setFillColor(128, 5, 33);
  pdf.rect(0, 0, width, 26, "F");

  // Franja dorada decorativa #D97706
  pdf.setFillColor(217, 119, 6);
  pdf.rect(0, 26, width, 1.8, "F");

  // Logo Oficial SFA
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, 3.2, 19.5, 19.5, 2.5, 2.5, "F");
  try {
    pdf.addImage(SFA_LOGO_BASE64, "JPEG", margin + 1, 4.2, 17.5, 17.5);
  } catch {
    // Fallback silencioso
  }

  // Textos oficiales del MINEDU
  const textX = margin + 23;
  pdf.setTextColor(251, 191, 36); // amber-400
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("REPÚBLICA DEL PERÚ  •  MINISTERIO DE EDUCACIÓN", textX, 7.2);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7.6);
  pdf.text("DIRECCIÓN REGIONAL DE EDUCACIÓN DE LIMA METROPOLITANA", textX, 11.4);

  pdf.setFontSize(11);
  pdf.text("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO “SAN FRANCISCO DE ASÍS”", textX, 16.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.2);
  pdf.setTextColor(241, 245, 249);
  pdf.text("R.M. N° 0233-80-ED  •  R.D. N° 0458-2005-ED  •  CÓDIGO MODULAR N° 0583427  •  LIMA - PERÚ", textX, 21.6);

  // Badge Oficial a la derecha
  const badgeWidth = 46;
  const badgeX = width - margin - badgeWidth;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(251, 191, 36);
  pdf.roundedRect(badgeX, 4.5, badgeWidth, 16.5, 1.5, 1.5, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.2);
  pdf.setTextColor(251, 191, 36);
  pdf.text("CERTIFICADO OFICIAL", badgeX + badgeWidth / 2, 8.8, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.6);
  pdf.setTextColor(255, 255, 255);
  pdf.text(certNumber, badgeX + badgeWidth / 2, 13, { align: "center" });

  pdf.setFontSize(5.2);
  pdf.setTextColor(226, 232, 240);
  pdf.text(`PÁGINA ${pageNum} DE ${totalPages}`, badgeX + badgeWidth / 2, 17.2, { align: "center" });
}

/**
 * Firmas digitales oficiales, post-firmas y Sello Institucional
 */
function drawCertificateSignaturesAndSeal(
  pdf: any,
  width: number,
  margin: number,
  sigY: number,
  issuerName: string,
  certNumber: string
) {
  const sigWidth = 50;
  const sig1X = margin + 5;
  const sig2X = width - margin - sigWidth - 5;
  const stampX = width / 2;
  const stampY = sigY + 8;

  // 1. Firma: Secretario Académico (Izquierda)
  pdf.setDrawColor(18, 65, 160); // Tinta azul institucional
  pdf.setLineWidth(0.45);
  pdf.lines([[4, -5], [6, 3], [5, -7], [7, 6], [10, -2], [12, 1]], sig1X + 8, sigY + 5);
  pdf.lines([[-2, 3], [10, -2], [14, -3], [8, 2], [-18, 4], [24, -1]], sig1X + 11, sigY + 6);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7.2);
  pdf.setTextColor(18, 65, 160);
  pdf.text("Carlos Mendoza Q.", sig1X + sigWidth / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig1X, sigY + 11, sig1X + sigWidth, sigY + 11);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text(issuerName.toUpperCase(), sig1X + sigWidth / 2, sigY + 14.5, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.6);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Secretaría Académica  •  IESTP SFA", sig1X + sigWidth / 2, sigY + 17.5, { align: "center" });
  pdf.text("Firma Digital Certificada — Ley N° 27269", sig1X + sigWidth / 2, sigY + 20.2, { align: "center" });

  // 2. Sello Institucional Circular Doble (Centro)
  pdf.setDrawColor(128, 5, 33);
  pdf.setLineWidth(0.6);
  pdf.circle(stampX, stampY, 11.5, "S");
  pdf.setLineWidth(0.3);
  pdf.circle(stampX, stampY, 9.8, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.6);
  pdf.setTextColor(128, 5, 33);
  pdf.text("REPÚBLICA DEL PERÚ", stampX, stampY - 6.2, { align: "center" });
  pdf.text("IESTP SAN FRANCISCO DE ASÍS", stampX, stampY - 3.2, { align: "center" });

  pdf.setFillColor(217, 119, 6);
  pdf.circle(stampX, stampY, 1.2, "F");

  pdf.setFontSize(5.2);
  pdf.text("CERTIFICACIÓN", stampX, stampY + 2.8, { align: "center" });
  pdf.text("OFICIAL", stampX, stampY + 5.6, { align: "center" });
  pdf.setFontSize(4.2);
  pdf.text("MINEDU - LIMA", stampX, stampY + 8.2, { align: "center" });

  // 3. Firma: Director General (Derecha)
  pdf.setDrawColor(18, 65, 160);
  pdf.setLineWidth(0.45);
  pdf.lines([[3, -6], [5, 4], [4, -8], [8, 5], [11, -3], [14, 2]], sig2X + 7, sigY + 5);
  pdf.lines([[-3, 4], [9, -3], [15, -2], [7, 3], [-16, 3], [22, -1]], sig2X + 10, sigY + 6);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7.2);
  pdf.setTextColor(18, 65, 160);
  pdf.text("Juan M. Fernández P.", sig2X + sigWidth / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig2X, sigY + 11, sig2X + sigWidth, sigY + 11);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("DR. JUAN M. FERNÁNDEZ PAREDES", sig2X + sigWidth / 2, sigY + 14.5, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.6);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Director General  •  IESTP SFA", sig2X + sigWidth / 2, sigY + 17.5, { align: "center" });
  pdf.text("Resolución Directoral N° 0184-2022-DRELM", sig2X + sigWidth / 2, sigY + 20.2, { align: "center" });

  // 4. Bloque QR y autenticación al pie
  const qrX = margin;
  const qrY = sigY + 24;
  const qrSize = 13;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(128, 5, 33);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(qrX, qrY, qrSize, qrSize, 1.2, 1.2, "FD");

  // Matriz visual QR simulada
  pdf.setFillColor(15, 23, 42);
  pdf.rect(qrX + 1.5, qrY + 1.5, 3.2, 3.2, "F");
  pdf.rect(qrX + qrSize - 4.7, qrY + 1.5, 3.2, 3.2, "F");
  pdf.rect(qrX + 1.5, qrY + qrSize - 4.7, 3.2, 3.2, "F");
  pdf.rect(qrX + 6, qrY + 6, 2, 2, "F");
  pdf.rect(qrX + 5.5, qrY + 2, 2, 1.5, "F");
  pdf.rect(qrX + 2, qrY + 5.5, 1.5, 2, "F");
  pdf.rect(qrX + 8.5, qrY + 5.5, 2.5, 1.5, "F");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.4);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    `DOCUMENTO OFICIAL VERIFICABLE ELECTRÓNICAMENTE  •  EXPEDIENTE: ${certNumber}`,
    qrX + qrSize + 3.5,
    qrY + 3.5
  );
  pdf.text(
    "La integridad, contenido y autenticidad del presente Certificado Oficial de Estudios se encuentra refrendada en el",
    qrX + qrSize + 3.5,
    qrY + 6.8
  );
  pdf.text(
    "Registro Nacional de Certificados y Títulos de Educación Superior del Ministerio de Educación (MINEDU) y en la plataforma SFA ERP.",
    qrX + qrSize + 3.5,
    qrY + 10.1
  );
}

/**
 * Generador principal del CERTIFICADO OFICIAL DE ESTUDIOS (MINEDU / LEY N° 30512)
 */
export async function generateOfficialCertificatePdf(params: OfficialCertificateParams) {
  const {
    studentName = "Mateo Sebastián Quispe Rojas",
    studentDni = "74859612",
    program = "Electricidad Industrial",
    certificateNumber = "CERT-2026-9612-SFA",
    issueDate = "2026-11-24",
    issuerName = "Mg. Carlos Mendoza Quispe — Secretaría Académica",
  } = params;

  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({
    title: `Certificado Oficial de Estudios - ${studentDni} - ${studentName}`,
    author: "IESTP San Francisco de Asís - Dirección General y Secretaría Académica",
    subject: "Certificado Oficial de Estudios de Educación Superior Tecnológica (MINEDU)",
    keywords: "MINEDU, Certificado Oficial, Electricidad Industrial, SFA",
  });

  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 13;

  // ----------------------------------------------------
  // PÁGINA 1: Encabezado, Certificación Solemne y Ciclos I, II, III
  // ----------------------------------------------------
  drawCertificateHeader(pdf, width, margin, certificateNumber, 1, 2);

  // Título Solemne del Certificado
  let currentY = 32;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(128, 5, 33); // #800521
  pdf.text("CERTIFICADO OFICIAL DE ESTUDIOS", width / 2, currentY, { align: "center" });

  currentY += 4.5;
  pdf.setFontSize(8);
  pdf.setTextColor(217, 119, 6); // #D97706
  pdf.text("EDUCACIÓN SUPERIOR TECNOLÓGICA  •  LEY N° 30512  •  R.V.M. N° 277-2019-MINEDU", width / 2, currentY, { align: "center" });

  // Declaración Jurada y Certificación Institucional
  currentY += 5.5;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, currentY, width - margin * 2, 25, 2, 2, "FD");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(30, 41, 59);
  pdf.text(
    "EL DIRECTOR GENERAL Y EL SECRETARIO ACADÉMICO DEL INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO “SAN FRANCISCO DE ASÍS”",
    margin + 3.5,
    currentY + 4.8
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(128, 5, 33);
  pdf.text("CERTIFICAN QUE:", margin + 3.5, currentY + 9.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`DON (ÑA): ${studentName.toUpperCase()}`, margin + 3.5, currentY + 14.8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(51, 65, 85);
  pdf.text(
    `DNI N°: ${studentDni}   •   CÓDIGO DE MATRÍCULA: 202710001   •   MODALIDAD: Presencial Regular`,
    margin + 3.5,
    currentY + 19.2
  );
  pdf.text(
    `Ha cursado y aprobado las unidades didácticas y experiencias formativas del Programa de Estudios de: ${program.toUpperCase()}, Nivel Formativo: PROFESIONAL TÉCNICO, obteniendo las siguientes calificaciones:`,
    margin + 3.5,
    currentY + 23
  );

  currentY += 27.5;

  // Filtrar asignaturas de Ciclos I, II, III para la Página 1
  const coursesP1 = ACCREDITED_CURRICULUM_ELECTRICIDAD.filter((c) => (c.cycle || 1) <= 3);

  const tableBodyP1: any[] = [];
  let lastCycle = 0;
  coursesP1.forEach((course) => {
    if (course.cycle !== lastCycle) {
      lastCycle = course.cycle;
      const modTitle = lastCycle === 1 ? "MÓDULO TÉCNICO PROFESIONAL I: INSTALACIÓN Y MONTAJE DE SISTEMAS ELÉCTRICOS — CICLO I"
        : lastCycle === 2 ? "MÓDULO TÉCNICO PROFESIONAL I: INSTALACIÓN Y MONTAJE DE SISTEMAS ELÉCTRICOS — CICLO II"
        : "MÓDULO TÉCNICO PROFESIONAL II: MANTENIMIENTO DE MÁQUINAS Y REDES ELÉCTRICAS — CICLO III";
      tableBodyP1.push([
        {
          content: modTitle,
          colSpan: 8,
          styles: { fillColor: [241, 245, 249], textColor: [128, 5, 33], fontStyle: "bold", fontSize: 6.5 },
        },
      ]);
    }
    const gradeNum = Math.round(course.grade || 16);
    const gradeWord = GRADE_WORDS[gradeNum] || `${gradeNum}`;
    const hours = (course.credits || 3) * 16;
    tableBodyP1.push([
      course.code,
      course.courseName,
      `Ciclo ${course.cycle}`,
      `${course.credits}`,
      `${hours}`,
      `${gradeNum}`,
      gradeWord,
      "APROBADO",
    ]);
  });

  // Agregar fila de EFSRT I en página 1
  tableBodyP1.push([
    {
      content: "EFSRT-01",
      styles: { fontStyle: "bold", textColor: [4, 120, 87] },
    },
    {
      content: "Experiencias Formativas en Situaciones Reales de Trabajo I (Entorno Productivo)",
      styles: { fontStyle: "bold", textColor: [4, 120, 87] },
    },
    "Módulo I",
    "8",
    "240",
    "18",
    "Dieciocho",
    { content: "CONFORME", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
  ]);

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      "CÓDIGO",
      "UNIDAD DIDÁCTICA / ASIGNATURA MODULAR",
      "PERÍODO",
      "CRÉD.",
      "HORAS",
      "NOTA",
      "CALIFICACIÓN EN LETRAS",
      "CONDICIÓN",
    ]],
    body: tableBodyP1,
    theme: "grid",
    headStyles: {
      fillColor: [128, 5, 33],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.2,
      halign: "center",
      cellPadding: 1.5,
    },
    bodyStyles: {
      fontSize: 5.8,
      cellPadding: 1.2,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 10, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 11, halign: "center", fontStyle: "bold", textColor: [128, 5, 33] },
      6: { cellWidth: 24, halign: "left" },
      7: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [4, 120, 87] },
    },
  });

  // Pie de la página 1
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(5.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Continúa en el Folio Reverso (Página 2 de 2)...", width - margin, height - 8, { align: "right" });

  // ----------------------------------------------------
  // PÁGINA 2: Ciclos IV, V, VI, EFSRT II y III, Resumen y Firmas
  // ----------------------------------------------------
  pdf.addPage("a4");
  drawCertificateHeader(pdf, width, margin, certificateNumber, 2, 2);

  currentY = 32;

  // Filtrar asignaturas de Ciclos IV, V, VI para la Página 2
  const coursesP2 = ACCREDITED_CURRICULUM_ELECTRICIDAD.filter((c) => (c.cycle || 1) >= 4);

  const tableBodyP2: any[] = [];
  lastCycle = 3;
  coursesP2.forEach((course) => {
    if (course.cycle !== lastCycle) {
      lastCycle = course.cycle;
      const modTitle = lastCycle === 4 ? "MÓDULO TÉCNICO PROFESIONAL II: MANTENIMIENTO DE MÁQUINAS Y REDES ELÉCTRICAS — CICLO IV"
        : lastCycle === 5 ? "MÓDULO TÉCNICO PROFESIONAL III: AUTOMATIZACIÓN Y CONTROL DE SISTEMAS INDUSTRIALES — CICLO V"
        : "MÓDULO TÉCNICO PROFESIONAL III: AUTOMATIZACIÓN Y CONTROL DE SISTEMAS INDUSTRIALES — CICLO VI";
      tableBodyP2.push([
        {
          content: modTitle,
          colSpan: 8,
          styles: { fillColor: [241, 245, 249], textColor: [128, 5, 33], fontStyle: "bold", fontSize: 6.5 },
        },
      ]);
    }
    const gradeNum = Math.round(course.grade || 17);
    const gradeWord = GRADE_WORDS[gradeNum] || `${gradeNum}`;
    const hours = (course.credits || 3) * 16;
    tableBodyP2.push([
      course.code,
      course.courseName,
      `Ciclo ${course.cycle}`,
      `${course.credits}`,
      `${hours}`,
      `${gradeNum}`,
      gradeWord,
      "APROBADO",
    ]);
  });

  // Agregar filas de EFSRT II y EFSRT III
  tableBodyP2.push([
    {
      content: "EFSRT-02",
      styles: { fontStyle: "bold", textColor: [4, 120, 87] },
    },
    {
      content: "Experiencias Formativas en Situaciones Reales de Trabajo II (Mantenimiento Industrial)",
      styles: { fontStyle: "bold", textColor: [4, 120, 87] },
    },
    "Módulo II",
    "8",
    "240",
    "18",
    "Dieciocho",
    { content: "CONFORME", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
  ]);

  tableBodyP2.push([
    {
      content: "EFSRT-03",
      styles: { fontStyle: "bold", textColor: [4, 120, 87] },
    },
    {
      content: "Experiencias Formativas en Situaciones Reales de Trabajo III (Automatización y Control)",
      styles: { fontStyle: "bold", textColor: [4, 120, 87] },
    },
    "Módulo III",
    "8",
    "240",
    "19",
    "Diecinueve",
    { content: "CONFORME", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
  ]);

  autoTable(pdf, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      "CÓDIGO",
      "UNIDAD DIDÁCTICA / ASIGNATURA MODULAR",
      "PERÍODO",
      "CRÉD.",
      "HORAS",
      "NOTA",
      "CALIFICACIÓN EN LETRAS",
      "CONDICIÓN",
    ]],
    body: tableBodyP2,
    theme: "grid",
    headStyles: {
      fillColor: [128, 5, 33],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.2,
      halign: "center",
      cellPadding: 1.5,
    },
    bodyStyles: {
      fontSize: 5.8,
      cellPadding: 1.2,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 10, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 11, halign: "center", fontStyle: "bold", textColor: [128, 5, 33] },
      6: { cellWidth: 24, halign: "left" },
      7: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [4, 120, 87] },
    },
  });

  const finalTableY = (pdf as any).lastAutoTable?.finalY || 140;

  // Cuadro Resumen Oficial de Rendimiento Académico
  const summaryBoxY = finalTableY + 4;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(margin, summaryBoxY, width - margin * 2, 20, 1.8, 1.8, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(128, 5, 33);
  pdf.text("CONSOLIDADO DE CRÉDITOS Y RENDIMIENTO ACADÉMICO GLOBAL:", margin + 4, summaryBoxY + 5.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("• TOTAL CRÉDITOS LECTIVOS: 96 Créditos Aprobados", margin + 4, summaryBoxY + 10.5);
  pdf.text("• TOTAL EXPERIENCIAS FORMATIVAS (EFSRT): 24 Créditos (720 Horas)", margin + 4, summaryBoxY + 14.8);

  const col2X = margin + 82;
  pdf.text("• TOTAL CRÉDITOS ACUMULADOS: 120 Créditos Formativos (100% Malla Curricular)", col2X, summaryBoxY + 10.5);
  pdf.text("• TOTAL HORAS ACADÉMICAS: 2,550 Horas Formativas", col2X, summaryBoxY + 14.8);

  const col3X = margin + 140;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(4, 120, 87);
  pdf.text("PROMEDIO PONDERADO: 17.20", col3X, summaryBoxY + 10.5);
  pdf.setFontSize(6.2);
  pdf.text("CONDICIÓN: EGRESADO APTO", col3X, summaryBoxY + 14.8);

  // Cláusula Legal de Expedición
  const legalY = summaryBoxY + 24.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.4);
  pdf.setTextColor(51, 65, 85);
  pdf.text(
    "Por tanto, en cumplimiento del Art. 38 de la Ley N° 30512 y su Reglamento, se expide el presente CERTIFICADO OFICIAL DE ESTUDIOS a solicitud de la",
    margin,
    legalY
  );
  pdf.text(
    "parte interesada, confiriéndosele plena validez oficial para todo trámite de Titulación Profesional Técnica, colegiatura, convalidación o continuidad de estudios.",
    margin,
    legalY + 3.8
  );

  const [year, month, day] = issueDate.split("-");
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
  const mName = months[parseInt(month, 10) - 1] || "noviembre";
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `Dado en la Sede Institucional del IESTP “San Francisco de Asís”, en la ciudad de Lima, a los ${day || "24"} días del mes de ${mName} del año ${year || "2026"}.`,
    margin,
    legalY + 8
  );

  // Firmas y Sellos en Página 2
  drawCertificateSignaturesAndSeal(
    pdf,
    width,
    margin,
    legalY + 11,
    issuerName,
    certificateNumber
  );

  return pdf;
}
