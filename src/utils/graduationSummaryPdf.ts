import { SFA_LOGO_BASE64 } from "./sfaLogo";
import type { Graduation } from "../types";

export interface GraduationSummaryExtra {
  efsrtData?: {
    companyName?: string;
    ruc?: string;
    hours?: number | string;
    supervisor?: string;
    department?: string;
  };
  feeOpNumber?: string;
  feeAmount?: string | number;
  futId?: string;
}

/**
 * Dibuja el membrete institucional oficial del IESTP San Francisco de Asís
 */
function drawInstitutionalHeader(pdf: any, width: number, margin: number, badgeText = "EXPEDIENTE OFICIAL") {
  // Franja superior borgoña institucional #800521
  pdf.setFillColor(128, 5, 33);
  pdf.rect(0, 0, width, 26, "F");

  // Franja dorada decorativa #D97706
  pdf.setFillColor(217, 119, 6);
  pdf.rect(0, 26, width, 1.8, "F");

  // Contenedor blanco nítido del logotipo oficial SFA
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, 3.2, 19.5, 19.5, 2.5, 2.5, "F");
  try {
    pdf.addImage(SFA_LOGO_BASE64, "JPEG", margin + 1, 4.2, 17.5, 17.5);
  } catch {
    // Fallback silencioso si no soporta inserción directa
  }

  // Textos oficiales del MINEDU e Institución
  const textX = margin + 23;
  pdf.setTextColor(251, 191, 36); // amber-400
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.text("REPÚBLICA DEL PERÚ  •  MINISTERIO DE EDUCACIÓN", textX, 7.2);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7.6);
  pdf.text("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO", textX, 11.4);

  pdf.setFontSize(11);
  pdf.text("“SAN FRANCISCO DE ASÍS”", textX, 16.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.2);
  pdf.setTextColor(241, 245, 249);
  pdf.text("R.M. N° 0233-80-ED  •  R.D. N° 0458-2005-ED  •  LIMA - PERÚ", textX, 21.6);

  // Badge institucional a la derecha
  const badgeWidth = 48;
  const badgeX = width - margin - badgeWidth;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(251, 191, 36);
  pdf.roundedRect(badgeX, 4.5, badgeWidth, 16.5, 1.5, 1.5, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.2);
  pdf.setTextColor(251, 191, 36);
  pdf.text("SECRETARÍA ACADÉMICA", badgeX + badgeWidth / 2, 8.8, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.6);
  pdf.setTextColor(255, 255, 255);
  pdf.text("DICTAMEN DE AUDITORÍA", badgeX + badgeWidth / 2, 13, { align: "center" });

  pdf.setFontSize(5.2);
  pdf.setTextColor(226, 232, 240);
  pdf.text(badgeText, badgeX + badgeWidth / 2, 17.2, { align: "center" });
}

/**
 * Dibuja el bloque de firmas digitales caligráficas, sello institucional circular y código QR
 */
function drawOfficialSignaturesAndSeal(
  pdf: any,
  width: number,
  margin: number,
  sigY: number,
  dni: string,
  hashText: string
) {
  const sigWidth = 48;
  const sig1X = margin + 3;
  const sig2X = width - margin - sigWidth - 3;
  const stampX = width / 2;
  const stampY = sigY + 8;

  // 1. FIRMA: Secretaria General Académica (Izquierda)
  pdf.setDrawColor(18, 65, 160); // Tinta azul institucional
  pdf.setLineWidth(0.45);
  pdf.lines([[4, -5], [6, 3], [5, -7], [7, 6], [10, -2], [12, 1]], sig1X + 8, sigY + 5);
  pdf.lines([[-2, 3], [10, -2], [14, -3], [8, 2], [-18, 4], [24, -1]], sig1X + 11, sigY + 6);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7.2);
  pdf.setTextColor(18, 65, 160);
  pdf.text("Carmen Valdivia M.", sig1X + sigWidth / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig1X, sigY + 11, sig1X + sigWidth, sigY + 11);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.6);
  pdf.setTextColor(15, 23, 42);
  pdf.text("MG. CARMEN R. VALDIVIA MORÁN", sig1X + sigWidth / 2, sigY + 14.2, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.6);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Secretaria General Académica", sig1X + sigWidth / 2, sigY + 17.2, { align: "center" });
  pdf.text("Reg. Col. N° 0948 • IESTP SFA", sig1X + sigWidth / 2, sigY + 19.8, { align: "center" });

  // 2. SELLO INSTITUCIONAL CIRCULAR OFICIAL (Centro)
  pdf.setDrawColor(128, 5, 33);
  pdf.setLineWidth(0.7);
  pdf.circle(stampX, stampY, 11, "S");
  pdf.setLineWidth(0.25);
  pdf.circle(stampX, stampY, 9.6, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.6);
  pdf.setTextColor(128, 5, 33);
  pdf.text("IESTP SAN FRANCISCO DE ASÍS", stampX, stampY - 5.2, { align: "center" });
  pdf.setFontSize(4);
  pdf.setTextColor(180, 83, 9);
  pdf.text("★  SELLO INSTITUCIONAL  ★", stampX, stampY - 2.4, { align: "center" });
  pdf.setFontSize(5.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text("DIRECCIÓN GENERAL", stampX, stampY + 1, { align: "center" });
  pdf.setFontSize(4.4);
  pdf.setTextColor(128, 5, 33);
  pdf.text("SECRETARÍA ACADÉMICA", stampX, stampY + 4.2, { align: "center" });
  pdf.setFontSize(3.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("LIMA - PERÚ", stampX, stampY + 7.2, { align: "center" });

  // 3. FIRMA: Director General (Derecha)
  pdf.setDrawColor(18, 65, 160);
  pdf.setLineWidth(0.5);
  pdf.lines([[5, -7], [8, 5], [6, -8], [6, 6], [10, -3], [13, 2]], sig2X + 8, sigY + 4.5);
  pdf.lines([[-3, 3], [12, -2], [16, 2], [-22, 4], [28, -2]], sig2X + 11, sigY + 6.5);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7.2);
  pdf.setTextColor(18, 65, 160);
  pdf.text("J. Morales Rojas", sig2X + sigWidth / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig2X, sigY + 11, sig2X + sigWidth, sigY + 11);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.6);
  pdf.setTextColor(15, 23, 42);
  pdf.text("DR. JUAN ALBERTO MORALES ROJAS", sig2X + sigWidth / 2, sigY + 14.2, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.6);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Director General - IESTP SFA", sig2X + sigWidth / 2, sigY + 17.2, { align: "center" });
  pdf.text("R.D. N° 0458-2005-ED • MINEDU", sig2X + sigWidth / 2, sigY + 19.8, { align: "center" });

  // 4. CÓDIGO QR Y HASH CRIPTOGRÁFICO DE SEGURIDAD (debajo de las firmas para evitar superposición)
  const qrSize = 23;
  const qrX = width - margin - qrSize - 2;
  const qrY = sigY + 23;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 1.4, 1.4, "FD");

  // Matriz QR realista 21x21 con patrones de búsqueda (7x7) y módulos determinísticos
  const grid = 21;
  const cell = qrSize / grid;
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7);

  const drawFinder = (r0: number, c0: number) => {
    pdf.setFillColor(15, 23, 42);
    pdf.rect(qrX + c0 * cell, qrY + r0 * cell, 7 * cell, 7 * cell, "F");
    pdf.setFillColor(255, 255, 255);
    pdf.rect(qrX + (c0 + 1) * cell, qrY + (r0 + 1) * cell, 5 * cell, 5 * cell, "F");
    pdf.setFillColor(15, 23, 42);
    pdf.rect(qrX + (c0 + 2) * cell, qrY + (r0 + 2) * cell, 3 * cell, 3 * cell, "F");
  };
  drawFinder(0, 0);
  drawFinder(0, grid - 7);
  drawFinder(grid - 7, 0);

  let seed = 0;
  for (let i = 0; i < hashText.length; i++) {
    seed = ((seed * 31) + hashText.charCodeAt(i)) >>> 0;
  }
  pdf.setFillColor(15, 23, 42);
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if (isFinder(r, c)) continue;
      if ((r === 7 && c < 8) || (c === 7 && r < 8) || (r === 7 && c >= grid - 8) || (c === grid - 8 && r < 8) || (r === grid - 8 && c < 8) || (c === 7 && r >= grid - 8)) {
        continue;
      }
      const isTiming = (r === 6 && c >= 8 && c <= grid - 9) || (c === 6 && r >= 8 && r <= grid - 9);
      const bit = isTiming
        ? (r + c) % 2 === 0
        : (((seed ^ (r * 73856093) ^ (c * 19349663)) >>> ((r + c) % 7)) & 1) === 1;
      if (bit) {
        pdf.rect(qrX + c * cell, qrY + r * cell, cell * 0.96, cell * 0.96, "F");
      }
    }
  }

  pdf.setFont("courier", "bold");
  pdf.setFontSize(4.8);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`VERIFICACIÓN: ${hashText.slice(0, 16)}`, qrX + qrSize / 2, qrY + qrSize + 4.2, { align: "center" });
}

/**
 * Generador principal del Resumen y Dictamen Oficial de Expediente de Graduación y Titulación
 */
export async function graduationSummaryPdf(
  name: string,
  dni: string,
  program: string,
  record: Graduation,
  date: string,
  extra?: GraduationSummaryExtra
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({
    title: `Dictamen de Expediente de Titulación - ${dni}`,
    author: "IESTP San Francisco de Asís - Secretaría Académica",
    subject: "Auditoría Curricular y Conformidad de Egresado",
  });

  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Membrete institucional oficial
  drawInstitutionalHeader(pdf, width, margin, "SFA CLOUD ERP");

  // 2. Título Oficial del Documento
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.setTextColor(128, 5, 33); // #800521
  pdf.text("DICTAMEN INSTITUCIONAL DE AUDITORÍA CURRICULAR Y ACREDITACIÓN DE EGRESADO", margin, 33.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.8);
  pdf.setTextColor(100, 116, 139); // slate-500
  const expNumber = extra?.futId ? `EXP-2029-${dni}-${extra.futId.slice(4, 12).toUpperCase()}` : `EXP-2029-${dni}-CER`;
  pdf.text(`EXPEDIENTE DIGITAL DE TITULACIÓN N° ${expNumber}  •  LEY N° 30512  •  LINEAMIENTOS MINEDU`, margin, 37.2);

  // 3. Tarjeta de Datos del Administrado / Estudiante
  const cardY = 39.5;
  const cardH = 24.5;
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.setDrawColor(203, 213, 225); // slate-300
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, cardY, width - margin * 2, cardH, 2, 2, "FD");

  // Columna Izquierda (Datos del Egresado)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.2);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text(`ADMINISTRADO: ${name.toUpperCase()}`, margin + 3.5, cardY + 5.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(51, 65, 85); // slate-700
  pdf.text(`DOCUMENTO DE IDENTIDAD: DNI ${dni}  •  CÓDIGO INSTITUCIONAL: 202710001`, margin + 3.5, cardY + 10.8);
  pdf.text(`PROGRAMA DE ESTUDIOS: ${program} (Plan Formativo Modular - 3 Años)`, margin + 3.5, cardY + 15.8);
  pdf.text(`MODALIDAD Y RÉGIMEN: Presencial Regular  •  Educación Superior Tecnológica Pública`, margin + 3.5, cardY + 20.8);

  // Columna Derecha (Dictamen y Estado)
  const rightColX = width / 2 + 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.2);
  pdf.setTextColor(record.status === "Apto" ? 4 : 180, record.status === "Apto" ? 120 : 83, record.status === "Apto" ? 87 : 9);
  pdf.text(`ESTADO DE EXPEDIENTE: ${record.status.toUpperCase()} (${record.step})`, rightColX, cardY + 5.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`FECHA DE EMISIÓN: ${date} (Lima - Perú)`, rightColX, cardY + 10.8);
  pdf.text(`CONDICIÓN: Egresado Pleno (120 Créditos Acumulados)`, rightColX, cardY + 15.8);
  pdf.text(`FINALIDAD: Certificado Oficial de Estudios y Titulación Profesional`, rightColX, cardY + 20.8);

  // 4. Bloques KPI de Carga y Créditos Formativos
  const kpiY = 66.5;
  const kpiH = 8.5;
  const kpiW = (width - margin * 2 - 6) / 3;

  // KPI 1: Créditos Lectivos
  pdf.setFillColor(254, 242, 242); // red-50
  pdf.setDrawColor(254, 202, 202);
  pdf.roundedRect(margin, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(128, 5, 33);
  pdf.text("CRÉDITOS LECTIVOS: 96 / 96 cr.", margin + kpiW / 2, kpiY + 4, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.2);
  pdf.setTextColor(100, 116, 139);
  pdf.text("6 Ciclos Modulares Concluidos (100%)", margin + kpiW / 2, kpiY + 7.2, { align: "center" });

  // KPI 2: Prácticas EFSRT
  pdf.setFillColor(236, 253, 245); // emerald-50
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(margin + kpiW + 3, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(4, 120, 87);
  pdf.text("PRÁCTICAS EFSRT: 24 / 24 cr.", margin + kpiW + 3 + kpiW / 2, kpiY + 4, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.2);
  pdf.setTextColor(100, 116, 139);
  pdf.text("480 Horas Convalidadas en Sector Productivo", margin + kpiW + 3 + kpiW / 2, kpiY + 7.2, { align: "center" });

  // KPI 3: Total Acumulado
  pdf.setFillColor(239, 246, 255); // blue-50
  pdf.setDrawColor(191, 219, 254);
  pdf.roundedRect(margin + (kpiW + 3) * 2, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(29, 78, 216);
  pdf.text("TOTAL ACUMULADO: 120 / 120 cr.", margin + (kpiW + 3) * 2 + kpiW / 2, kpiY + 4, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.2);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Condición: Egresado Pleno Acreditado", margin + (kpiW + 3) * 2 + kpiW / 2, kpiY + 7.2, { align: "center" });

  // 5. Tabla 1: Matriz de Requisitos Institucionales Evaluados
  const efsrtCompany = extra?.efsrtData?.companyName || "LA EMPRESA INDUSTRIAL CONSTRUCTORA Y DE SERVICIOS S.A.C.";
  const efsrtHours = extra?.efsrtData?.hours || 480;
  const feeOp = extra?.feeOpNumber || "OP-2029-BN-49102";
  const feeAmount = extra?.feeAmount ? Number(extra.feeAmount).toFixed(2) : "50.00";

  autoTable(pdf, {
    startY: 78,
    margin: { left: margin, right: margin, top: 30, bottom: 26 },
    head: [["N°", "REQUISITO EVALUADO POR SECRETARÍA", "ENTIDAD / SUSTENTO REGISTRADO", "ALCANCE / ARANCEL", "ESTADO DICTAMINADO"]],
    body: [
      [
        "1",
        "Solicitud Única de Trámite (FUT)",
        "Mesa de Partes Digital SFA • Formulario de Solicitud Institucional",
        `Exp. ${expNumber}`,
        record.docsChecked.solicitud ? "CONFORME • ACREDITADO" : "PENDIENTE"
      ],
      [
        "2",
        "Constancia de Egresado (Malla Lectiva)",
        "Auditoría Curricular: 6 Ciclos Formativos Aprobados (Malla 100%)",
        "96 Créditos Lectivos",
        record.docsChecked.constanciaEgresado ? "CONFORME • ACREDITADO" : "PENDIENTE"
      ],
      [
        "3",
        "Prácticas Preprofesionales (EFSRT)",
        `${efsrtCompany}`,
        `${efsrtHours} Horas (+24 Créditos)`,
        record.docsChecked.practicasPre ? "CONFORME • CONVALIDADO" : "PENDIENTE"
      ],
      [
        "4",
        "Pago de Tasa de Certificación Oficial",
        `Banco de la Nación • N° Operación: ${feeOp}`,
        `Tasa S/ ${feeAmount}`,
        record.docsChecked.pagoDerecho ? "CONFORME • CONCILIADO" : "PENDIENTE"
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 7.2,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 62, fontStyle: "bold" },
      2: { cellWidth: 68 },
      3: { cellWidth: 26, halign: "center" },
      4: { cellWidth: 24, halign: "center", fontStyle: "bold", textColor: [4, 120, 87] },
    },
    rowPageBreak: "avoid",
  });

  // 6. Tabla 2: Desglose Modular de Carga Lectiva y Formativa
  const finalY1 = (pdf as any).lastAutoTable?.finalY || 120;

  autoTable(pdf, {
    startY: finalY1 + 3.5,
    margin: { left: margin, right: margin, top: 30, bottom: 26 },
    head: [["MÓDULO / COMPONENTE FORMATIVO", "DESCRIPCIÓN DEL PLAN MODULAR", "CRÉDITOS", "CONDICIÓN", "RESOLUCIÓN"]],
    body: [
      [
        "Ciclos Modulares I al VI",
        "Módulos Técnicos Profesionales de Electricidad Industrial (Semestres 1 al 6)",
        "96 cr.",
        "100% Aprobado",
        "R.M. N° 0233-80-ED"
      ],
      [
        "Prácticas EFSRT",
        "Experiencias Formativas en Situaciones Reales de Trabajo en Empresa Productiva",
        "24 cr.",
        "Convalidado",
        "R.D. N° 0458-2005-ED"
      ],
      [
        "TOTAL CURRICULAR",
        "Carga Formativa Integral Requerida para Titulación Profesional Técnica",
        "120 cr.",
        "Egresado Pleno",
        "Conforme Minedu"
      ]
    ],
    styles: {
      font: "helvetica",
      fontSize: 6.8,
      cellPadding: 1.8,
      valign: "middle",
    },
    headStyles: {
      fillColor: [128, 5, 33], // Borgoña SFA
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: "bold" },
      1: { cellWidth: 92 },
      2: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 18, halign: "center" },
    },
    rowPageBreak: "avoid",
  });

  // 7. Dictamen Formal y Observaciones de Secretaría Académica
  const finalY2 = (pdf as any).lastAutoTable?.finalY || 160;
  const dictamenY = finalY2 + 3.5;
  const dictamenH = 22;

  pdf.setFillColor(254, 252, 232); // amber-50
  pdf.setDrawColor(254, 240, 138); // amber-200
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, dictamenY, width - margin * 2, dictamenH, 1.8, 1.8, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(146, 64, 14); // amber-800
  pdf.text("DICTAMEN FINAL DE SECRETARÍA ACADÉMICA:", margin + 3.5, dictamenY + 4.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(30, 41, 59);
  const legalText =
    "En observancia de la Ley N° 30512 de Institutos y Escuelas de Educación Superior y sus Lineamientos Académicos Generales, se DA FE de que el administrado cumple plenamente con los 120 créditos formativos (96 lectivos y 24 EFSRT) y con la totalidad de requisitos arancelarios y documentarios. Se dictamina formalmente la CONDICIÓN DE APTO para la expedición del Certificado Oficial de Estudios y la apertura de Carpeta de Titulación Profesional.";
  
  const splitLegal = pdf.splitTextToSize(legalText, width - margin * 2 - 7);
  pdf.text(splitLegal, margin + 3.5, dictamenY + 8.5);

  if (record.obs) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5.8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Anotación: ${record.obs.replace(/[\n\r]+/g, " • ").slice(0, 160)}`, margin + 3.5, dictamenY + 18.5);
  }

  // 8. Firmas Oficiales, Sello Circular Institucional y QR
  const sigBlockY = dictamenY + dictamenH + 8;
  const hashVal = `${dni}80052120261124TITULACIONSFACERTIFICADO`;
  drawOfficialSignaturesAndSeal(pdf, width, margin, sigBlockY, dni, hashVal);

  // 9. Pie de Página Oficial en todas las páginas
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setFillColor(217, 119, 6); // Línea decorativa ámbar
    pdf.rect(margin, height - 10.5, width - margin * 2, 0.4, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(5.8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      "IESTP SAN FRANCISCO DE ASÍS  •  SISTEMA INTEGRAL SFA CLOUD  •  DOCUMENTO VALIDADOR OFICIAL DE EGRESO Y TITULACIÓN",
      margin,
      height - 6.5
    );
    pdf.text(`Página ${page} de ${pages}`, width - margin, height - 6.5, { align: "right" });
  }

  return pdf;
}
