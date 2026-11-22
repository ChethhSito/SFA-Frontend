import { SFA_LOGO_BASE64 } from "./sfaLogo";

export interface HistoryPdfStudent {
  dni: string;
  name: string;
  lastName: string;
  academicStatus: string;
}

export interface HistoryPdfRow {
  code: string;
  courseName: string;
  credits: number | null;
  count: number;
  grade: number | null;
  cycle?: number;
}

/**
 * Encabezado institucional oficial con logotipo SFA, membrete del MINEDU
 * y distintivo oficial de Secretaría General Académica.
 */
function drawInstitutionalHeader(
  pdf: any,
  width: number,
  margin: number,
  pageIndicator?: string
) {
  // Top header banner (27mm height) - Borgoña institucional #800521
  pdf.setFillColor(128, 5, 33);
  pdf.rect(0, 0, width, 27, "F");

  // Gold accent strip - Ámbar #D97706
  pdf.setFillColor(217, 119, 6);
  pdf.rect(0, 27, width, 1.8, "F");

  // Logo Oficial SFA con contenedor blanco nítido
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, 3.5, 20, 20, 2.5, 2.5, "F");
  try {
    pdf.addImage(SFA_LOGO_BASE64, "JPEG", margin + 1, 4.5, 18, 18);
  } catch {
    // Fallback silencioso si el viewer no soporta addImage
  }

  // Textos Institucionales oficiales
  const textX = margin + 23.5;
  pdf.setTextColor(251, 191, 36); // amber-400
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("REPÚBLICA DEL PERÚ  •  MINISTERIO DE EDUCACIÓN", textX, 7.5);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7.8);
  pdf.text("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO", textX, 11.8);

  pdf.setFontSize(11.5);
  pdf.text("“SAN FRANCISCO DE ASÍS”", textX, 17);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(241, 245, 249);
  pdf.text("R.M. N° 0233-80-ED  •  R.D. N° 0458-2005-ED  •  LIMA - PERÚ", textX, 22.2);

  // Badge Institucional a la derecha
  const badgeWidth = 46;
  const badgeX = width - margin - badgeWidth;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(251, 191, 36);
  pdf.roundedRect(badgeX, 5, badgeWidth, 16.5, 1.5, 1.5, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(251, 191, 36);
  pdf.text("SECRETARÍA ACADÉMICA", badgeX + badgeWidth / 2, 9.5, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.8);
  pdf.setTextColor(255, 255, 255);
  pdf.text("RÉCORD DE CALIFICACIONES", badgeX + badgeWidth / 2, 14, { align: "center" });

  pdf.setFontSize(5.2);
  pdf.setTextColor(226, 232, 240);
  pdf.text(pageIndicator || "SFA CLOUD ERP", badgeX + badgeWidth / 2, 18, { align: "center" });
}

/**
 * Firmas digitales oficiales y Sello Institucional Circular Oficial
 */
function drawOfficialSignaturesAndSeal(
  pdf: any,
  width: number,
  margin: number,
  sigY: number,
  sealOffice: string = "SECRETARÍA ACADÉMICA"
) {
  const sigWidth = 52;
  const sig1X = margin + 5;
  const sig3X = width - margin - sigWidth - 5;
  const stampX = width / 2;
  const stampY = sigY + 8;

  // 1. FIRMA: Secretaria General Académica (Izquierda)
  pdf.setDrawColor(18, 65, 160); // Tinta azul institucional
  pdf.setLineWidth(0.45);
  pdf.lines([[4, -5], [6, 3], [5, -7], [7, 6], [10, -2], [12, 1]], sig1X + 8, sigY + 5);
  pdf.lines([[-2, 3], [10, -2], [14, -3], [8, 2], [-18, 4], [26, -1]], sig1X + 12, sigY + 6);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(18, 65, 160);
  pdf.text("Carmen Valdivia M.", sig1X + sigWidth / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig1X, sigY + 11.5, sig1X + sigWidth, sigY + 11.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("MG. CARMEN R. VALDIVIA MORÁN", sig1X + sigWidth / 2, sigY + 15, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Secretaria General Académica", sig1X + sigWidth / 2, sigY + 18.2, { align: "center" });
  pdf.text("Reg. Col. N° 0948 • IESTP SFA", sig1X + sigWidth / 2, sigY + 21, { align: "center" });

  // 2. SELLO INSTITUCIONAL CIRCULAR OFICIAL (Centro)
  pdf.setDrawColor(128, 5, 33);
  pdf.setLineWidth(0.75);
  pdf.circle(stampX, stampY, 11.5, "S");
  pdf.setLineWidth(0.25);
  pdf.circle(stampX, stampY, 10, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.8);
  pdf.setTextColor(128, 5, 33);
  pdf.text("IESTP SAN FRANCISCO DE ASÍS", stampX, stampY - 5.5, { align: "center" });
  pdf.setFontSize(4.2);
  pdf.setTextColor(180, 83, 9);
  pdf.text("★  SELLO INSTITUCIONAL  ★", stampX, stampY - 2.5, { align: "center" });
  pdf.setFontSize(5.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("DIRECCIÓN GENERAL", stampX, stampY + 1.2, { align: "center" });
  pdf.setFontSize(4.5);
  pdf.setTextColor(128, 5, 33);
  pdf.text(sealOffice, stampX, stampY + 4.5, { align: "center" });
  pdf.setFontSize(4);
  pdf.setTextColor(100, 116, 139);
  pdf.text("LIMA - PERÚ", stampX, stampY + 7.5, { align: "center" });

  // 3. FIRMA: Directora General (Derecha)
  pdf.setDrawColor(18, 65, 160);
  pdf.setLineWidth(0.5);
  pdf.lines([[5, -7], [8, 5], [6, -8], [6, 6], [10, -3], [14, 2]], sig3X + 8, sigY + 4.5);
  pdf.lines([[-3, 3], [12, -2], [16, 2], [-24, 4], [30, -2]], sig3X + 12, sigY + 6.5);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(18, 65, 160);
  pdf.text("J. Morales Rojas", sig3X + sigWidth / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig3X, sigY + 11.5, sig3X + sigWidth, sigY + 11.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("DR. JUAN ALBERTO MORALES ROJAS", sig3X + sigWidth / 2, sigY + 15, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Director General - IESTP SFA", sig3X + sigWidth / 2, sigY + 18.2, { align: "center" });
  pdf.text("R.D. N° 0458-2005-ED • MINEDU", sig3X + sigWidth / 2, sigY + 21, { align: "center" });
}

export async function createHistoryPdf(
  student: HistoryPdfStudent,
  program: string,
  rows: HistoryPdfRow[],
  date: string
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({
    title: `Historial Académico - ${student.dni}`,
    author: "IESTP San Francisco de Asís - Secretaría Académica",
  });

  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Dibujar Encabezado Institucional
  drawInstitutionalHeader(pdf, width, margin, "EXPEDIENTE OFICIAL");

  // 2. Título Oficial del Documento
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12.5);
  pdf.setTextColor(128, 5, 33); // #800521
  pdf.text("HISTORIAL ACADÉMICO Y RÉCORD DE CALIFICACIONES", margin, 34);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.2);
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.text("EXPEDIENTE OFICIAL DE DESEMPEÑO Y CONSOLIDACIÓN CURRICULAR", margin, 38);

  // 3. Tarjeta de Datos del Estudiante
  const cardY = 41;
  const cardH = 26;
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.setDrawColor(203, 213, 225); // slate-300
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, cardY, width - margin * 2, cardH, 2, 2, "FD");

  // Columna Izquierda
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text(`ESTUDIANTE TITULAR: ${student.lastName}, ${student.name}`, margin + 3.5, cardY + 6);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85); // slate-700
  pdf.text(`DNI: ${student.dni}  •  CÓDIGO MODULAR: ${student.dni}`, margin + 3.5, cardY + 12);
  pdf.text(`CARRERA TÉCNICA: ${program}`, margin + 3.5, cardY + 17.5);
  pdf.text(`PLAN DE ESTUDIOS: Plan Modular Formativo Oficial (120 Créditos)`, margin + 3.5, cardY + 23);

  // Columna Derecha
  const rightColX = width / 2 + 10;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(128, 5, 33);
  pdf.text(`CONDICIÓN ACADÉMICA: ${student.academicStatus}`, rightColX, cardY + 6);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`EMISIÓN OFICIAL: ${date} (Hora de Lima)`, rightColX, cardY + 12);
  pdf.text(`RÉGIMEN: Educación Superior Tecnológica Pública`, rightColX, cardY + 17.5);
  pdf.text(`ALCANCE: Actas oficiales consolidadas y certificadas`, rightColX, cardY + 23);

  // 4. Métricas Resumen Curriculares (KPIs)
  let totalCredits = 0;
  let gradedCredits = 0;
  let weightedPoints = 0;
  let approvedCount = 0;

  rows.forEach((r) => {
    const cr = typeof r.credits === "number" && r.credits > 0 ? r.credits : 4;
    if (r.grade !== null && r.grade !== undefined && typeof r.grade === "number") {
      const val = Number(r.grade);
      if (val >= 12.5) {
        totalCredits += cr;
        approvedCount += 1;
      }
      weightedPoints += val * cr;
      gradedCredits += cr;
    }
  });

  const weightedAvg = gradedCredits > 0 ? (weightedPoints / gradedCredits).toFixed(1) : "NR";

  const kpiY = 70;
  const kpiH = 8.5;
  const kpiW = (width - margin * 2 - 6) / 3;

  // Mini KPI 1: Créditos
  pdf.setFillColor(254, 242, 242); // red-50
  pdf.setDrawColor(254, 202, 202);
  pdf.roundedRect(margin, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(128, 5, 33);
  pdf.text(`CRÉDITOS ACREDITADOS: ${totalCredits} / 120 cr.`, margin + kpiW / 2, kpiY + 5.5, { align: "center" });

  // Mini KPI 2: Promedio
  pdf.setFillColor(236, 253, 245); // emerald-50
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(margin + kpiW + 3, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(4, 120, 87); // emerald-700
  pdf.text(`PROMEDIO PONDERADO: ${weightedAvg} / 20`, margin + kpiW + 3 + kpiW / 2, kpiY + 5.5, { align: "center" });

  // Mini KPI 3: Aprobadas
  pdf.setFillColor(239, 246, 255); // blue-50
  pdf.setDrawColor(191, 219, 254);
  pdf.roundedRect(margin + (kpiW + 3) * 2, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(29, 78, 216); // blue-700
  pdf.text(`CURSOS APROBADOS: ${approvedCount} de ${rows.length}`, margin + (kpiW + 3) * 2 + kpiW / 2, kpiY + 5.5, { align: "center" });

  // 5. Tabla Oficial de Asignaturas y Calificaciones
  autoTable(pdf, {
    startY: 82,
    margin: { left: margin, right: margin, top: 32, bottom: 28 },
    head: [["CÓDIGO", "ASIGNATURA CURRICULAR", "CRÉD.", "EVAL.", "PROMEDIO /20", "ESTADO"]],
    body: rows.length
      ? rows.map((row) => {
          const hasGrade = row.grade !== null && row.grade !== undefined && typeof row.grade === "number";
          const gradeNum = hasGrade ? Number(row.grade) : null;
          const gradeStr = gradeNum === 0 ? "0" : gradeNum !== null ? gradeNum.toFixed(1) : "NR";
          const isPassed = gradeNum !== null && gradeNum >= 12.5;
          const isFailed = gradeNum !== null && gradeNum < 12.5;
          const statusStr = isPassed ? "APROBADO" : isFailed ? "DESAPROBADO" : "PENDIENTE";

          return [
            row.code,
            row.courseName,
            row.credits ?? "Sin datos",
            row.count,
            gradeStr,
            statusStr,
          ];
        })
      : [[{ content: "No hay asignaturas o calificaciones registradas para mostrar.", colSpan: 6 }]],
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      cellPadding: 2.2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [15, 23, 42], // #0F172A Dark Slate
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: "bold" },
      1: { cellWidth: 86 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 20, halign: "center", fontStyle: "bold" },
    },
    rowPageBreak: "avoid",
    didDrawPage: () => {
      const pageNum = pdf.getCurrentPageInfo().pageNumber;
      if (pageNum > 1) {
        drawInstitutionalHeader(pdf, width, margin, `PÁGINA ${pageNum}`);
      }
    },
  });

  // 6. Firmas y Sello Institucional
  const finalY = (pdf as any).lastAutoTable?.finalY || 100;
  const neededHeight = 35;

  if (finalY + neededHeight > height - 28) {
    pdf.addPage();
    drawInstitutionalHeader(pdf, width, margin, "CERTIFICACIÓN");
    drawOfficialSignaturesAndSeal(pdf, width, margin, 45, "SECRETARÍA ACADÉMICA");
  } else {
    drawOfficialSignaturesAndSeal(pdf, width, margin, finalY + 6, "SECRETARÍA ACADÉMICA");
  }

  // 7. Pie de Página Institucional en todas las páginas
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setFillColor(217, 119, 6); // amber accent line
    pdf.rect(margin, height - 12, width - margin * 2, 0.4, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      "IESTP SAN FRANCISCO DE ASÍS  •  SISTEMA ACADÉMICO SFA CLOUD  •  DOCUMENTO OFICIAL VALIDADOR",
      margin,
      height - 7.5
    );
    pdf.text(`Página ${page} de ${pages}`, width - margin, height - 7.5, { align: "right" });
  }

  return pdf;
}
