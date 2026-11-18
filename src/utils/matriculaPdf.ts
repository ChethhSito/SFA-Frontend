export interface MatriculaCourseRow {
  code: string;
  name: string;
  credits: number;
  cycle: string | number;
  type: string;
  group: string;
  tsg?: string;
  status: string;
}

export interface MatriculaPdfData {
  studentName: string;
  studentLastName: string;
  dni: string;
  studentCode: string;
  programName: string;
  period: string;
  cycle: string;
  shift: string;
  courses: MatriculaCourseRow[];
  totalCredits: number;
  totalCourses: number;
  maxCredits: number;
  paymentStatus?: string;
  paymentAmount?: string;
  date?: string;
}

export async function generateMatriculaPdf(data: MatriculaPdfData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  pdf.setProperties({
    title: `Constancia de Matrícula - ${data.dni}`,
    subject: "Constancia Oficial de Matrícula Regular",
    author: "IESTP San Francisco de Asís",
    creator: "Sistema SFA Cloud",
  });

  // Top header banner
  pdf.setFillColor(128, 5, 33); // #800521 Borgoña institucional
  pdf.rect(0, 0, width, 24, "F");

  // Gold accent strip
  pdf.setFillColor(217, 119, 6); // amber-600
  pdf.rect(0, 24, width, 1.8, "F");

  // Header Texts
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN", margin, 7.5);

  pdf.setFontSize(13);
  pdf.text("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO", margin, 13);
  pdf.setFontSize(15);
  pdf.text("“SAN FRANCISCO DE ASÍS”", margin, 19.5);

  // Resolution info (top right)
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("R.M. N° 0233-80-ED • R.D. N° 0458-2005-ED", width - margin, 9, { align: "right" });
  pdf.text("SECRETARÍA GENERAL ACADÉMICA", width - margin, 14, { align: "right" });
  pdf.text("LIMA - PERÚ", width - margin, 18.5, { align: "right" });

  let y = 33;

  // Title box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, width - margin * 2, 16, 2, 2, "FD");

  pdf.setTextColor(128, 5, 33);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("CONSTANCIA OFICIAL DE MATRÍCULA REGULAR", width / 2, y + 6.5, { align: "center" });

  pdf.setTextColor(71, 85, 105);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text(`PERIODO LECTIVO: ${data.period.toUpperCase()}   •   DOCUMENTO N°: COM-${data.period}-${data.dni}`, width / 2, y + 12, { align: "center" });

  y += 20;

  // Student info card
  pdf.setDrawColor(226, 232, 240);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y, width - margin * 2, 38, 2, 2, "FD");

  // Left stripe
  pdf.setFillColor(128, 5, 33);
  pdf.roundedRect(margin, y, 2.5, 38, 1, 1, "F");

  pdf.setTextColor(15, 23, 42);
  const leftX = margin + 6;
  const col2X = margin + 98;

  // Row 1
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text("APELLIDOS Y NOMBRES:", leftX, y + 6);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(9);
  pdf.text(`${data.studentLastName.toUpperCase()}, ${data.studentName.toUpperCase()}`, leftX, y + 10.5);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7.5);
  pdf.text("CÓDIGO DE MATRÍCULA:", col2X, y + 6);
  pdf.setTextColor(128, 5, 33);
  pdf.setFontSize(9.5);
  pdf.text(data.studentCode, col2X, y + 10.5);

  // Row 2
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7.5);
  pdf.text("DOCUMENTO DE IDENTIDAD (DNI):", leftX, y + 16.5);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(9);
  pdf.text(data.dni, leftX, y + 21);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7.5);
  pdf.text("PROGRAMA FORMATIVO:", col2X, y + 16.5);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(9);
  pdf.text(data.programName.toUpperCase(), col2X, y + 21);

  // Row 3
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7.5);
  pdf.text("CICLO Y CONDICIÓN:", leftX, y + 27);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(9);
  pdf.text(`${data.cycle.toUpperCase()}  •  ALUMNO REGULAR`, leftX, y + 31.5);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7.5);
  pdf.text("TURNO Y DERECHO DE MATRÍCULA:", col2X, y + 27);
  pdf.setTextColor(5, 150, 105);
  pdf.setFontSize(8.5);
  pdf.text(`TURNO ${data.shift.toUpperCase()}  •  ${data.paymentStatus || "PAGADO (S/. 250.00)"}`, col2X, y + 31.5);

  y += 43;

  // Table of Enrolled Courses
  pdf.setTextColor(128, 5, 33);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.text("ASIGNATURAS Y UNIDADES DIDÁCTICAS OFICIALES REGISTRADAS", margin, y);

  autoTable(pdf, {
    startY: y + 2.5,
    margin: { left: margin, right: margin, bottom: 25 },
    head: [["CÓDIGO", "NOMBRE DE LA ASIGNATURA", "CRÉD.", "CICLO", "TIPO", "GRUPO", "MODALIDAD", "ESTADO"]],
    body: data.courses.length > 0
      ? data.courses.map((c) => [
          c.code,
          c.name,
          c.credits,
          c.cycle,
          c.type,
          c.group,
          c.tsg || "Teoría / Taller",
          "MATRICULADO",
        ])
      : [["-", "No hay asignaturas registradas", "0", "-", "-", "-", "-", "-"]],
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.4,
      valign: "middle",
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.8,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: "bold", textColor: [128, 5, 33] },
      1: { cellWidth: 68 },
      2: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 20 },
      5: { cellWidth: 15, halign: "center" },
      6: { cellWidth: 26 },
      7: { cellWidth: 21, halign: "center", textColor: [5, 150, 105], fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Table footer summary
  const lastTable = (pdf as any).lastAutoTable;
  let finalY = lastTable ? lastTable.finalY + 3 : y + 60;

  // Summary box
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, finalY, width - margin * 2, 11, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(51, 65, 85);
  pdf.text(
    `TOTAL DE ASIGNATURAS: ${data.totalCourses}         •         CRÉDITOS INSCRITOS: ${data.totalCredits}         •         LÍMITE PERMITIDO: ${data.maxCredits} CRÉDITOS`,
    width / 2,
    finalY + 7,
    { align: "center" }
  );

  finalY += 15;

  // Legal declaration & verification code
  pdf.setFillColor(255, 251, 235); // amber-50
  pdf.setDrawColor(251, 191, 36); // amber-400
  pdf.roundedRect(margin, finalY, width - margin * 2, 16, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(146, 64, 14);
  pdf.text("CERTIFICACIÓN DE MATRÍCULA Y VALIDEZ INSTITUCIONAL", margin + 4, finalY + 5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    "La presente constancia digital certifica formalmente la matrícula regular del estudiante en el IESTP San Francisco de Asís.",
    margin + 4,
    finalY + 9
  );
  pdf.text(
    `Código de Verificación Digital: SFA-MAT-${data.period}-${data.dni}-${Date.now().toString().slice(-6)}   •   Validación automática en servidor institucional.`,
    margin + 4,
    finalY + 13
  );

  finalY += 21;

  // Signatures / Stamps
  const sigY = Math.min(finalY, height - 38);
  const sigWidth = 48;
  const sig1X = margin + 12;
  const sig2X = width / 2 - sigWidth / 2;
  const sig3X = width - margin - sigWidth - 12;

  // Stamp 1: Secretaria
  pdf.setDrawColor(148, 163, 184);
  pdf.line(sig1X, sigY + 14, sig1X + sigWidth, sigY + 14);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text("SECRETARÍA ACADÉMICA", sig1X + sigWidth / 2, sigY + 18, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("IESTP San Francisco de Asís", sig1X + sigWidth / 2, sigY + 21, { align: "center" });

  // Stamp 2: Sello Digital
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(128, 5, 33);
  pdf.roundedRect(sig2X + 2, sigY - 2, sigWidth - 4, 24, 2, 2, "D");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(128, 5, 33);
  pdf.text("SELLO DIGITAL DE VALIDEZ", sig2X + sigWidth / 2, sigY + 6, { align: "center" });
  pdf.setFontSize(5.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("SFA SISTEMA INTEGRADO", sig2X + sigWidth / 2, sigY + 11, { align: "center" });
  pdf.text("FIRMA DIGITAL ELECTRÓNICA", sig2X + sigWidth / 2, sigY + 15, { align: "center" });
  pdf.text(data.date || new Date().toLocaleDateString("es-PE"), sig2X + sigWidth / 2, sigY + 19, { align: "center" });

  // Stamp 3: Direccion
  pdf.line(sig3X, sigY + 14, sig3X + sigWidth, sigY + 14);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text("DIRECCIÓN GENERAL", sig3X + sigWidth / 2, sigY + 18, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.text("IESTP San Francisco de Asís", sig3X + sigWidth / 2, sigY + 21, { align: "center" });

  // Footer bar
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, height - 9, width - margin, height - 9);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Documento oficial generado por la Plataforma Digital SFA Cloud • Página 1 de 1", margin, height - 5.5);
  pdf.text(`Fecha de emisión: ${data.date || new Date().toLocaleDateString("es-PE")}`, width - margin, height - 5.5, { align: "right" });

  // Trigger download as .pdf
  pdf.save(`Constancia_Matricula_SFA_${data.dni}.pdf`);
  return pdf;
}

export async function generateManualMatriculaPdf() {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  pdf.setProperties({
    title: "Guía y Manual de Matrícula Regular - IESTP San Francisco de Asís",
    subject: "Manual de Matrícula Institucional SFA",
    author: "IESTP San Francisco de Asís",
  });

  // Header Banner
  pdf.setFillColor(128, 5, 33);
  pdf.rect(0, 0, width, 24, "F");
  pdf.setFillColor(217, 119, 6);
  pdf.rect(0, 24, width, 1.8, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("IESTP SAN FRANCISCO DE ASÍS • DIRECCIÓN ACADÉMICA", margin, 8);
  pdf.setFontSize(13);
  pdf.text("MANUAL DEL ESTUDIANTE: PROCESO DE MATRÍCULA REGULAR", margin, 15);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("GUÍA OPERATIVA PASO A PASO PARA EL REGISTRO DE ASIGNATURAS Y EXPEDIENTE", margin, 20);

  let y = 32;

  const addSection = (title: string, content: string[]) => {
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(margin, y, width - margin * 2, 7.5, 1, 1, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(128, 5, 33);
    pdf.text(title, margin + 4, y + 5);
    y += 11;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);

    content.forEach((paragraph) => {
      const lines = pdf.splitTextToSize(paragraph, width - margin * 2 - 4);
      pdf.text(lines, margin + 2, y);
      y += lines.length * 3.8 + 2.5;
    });

    y += 2;
  };

  addSection("1. REQUISITOS PREVIOS DE MATRÍCULA", [
    "• Contar con la condición de ingresante admitido formalmente por Secretaría o ser alumno regular promovido.",
    "• Haber presentado la carpeta documentaria requisitorial completa (DNI, Certificado de Secundaria, Partida de Nacimiento y Foto Carnet).",
    "• Registrar y validar el pago de la tasa de matrícula ordinaria en Caja y Tesorería (S/. 250.00).",
  ]);

  addSection("2. CALENDARIO Y CRONOGRAMA DE REGISTRO", [
    "• La matrícula ordinaria se lleva a cabo según el calendario publicado por la Secretaría Académica.",
    "• Los estudiantes ingresantes al Ciclo I son matriculados en bloque según el plan curricular oficial de su especialidad técnica.",
    "• El límite máximo de créditos académicos para matrícula ordinaria es de 22 créditos por periodo semestral.",
  ]);

  addSection("3. ASIGNACIÓN DE GRUPOS, HORARIOS Y TURNOS", [
    "• Cada asignatura cuenta con grupos teóricos y de taller asignados por Módulo de Planificación Académica (MPA).",
    "• Los horarios no pueden superponerse ni presentar cruces pedagógicos.",
    "• Una vez consolidada la matrícula, el horario oficial se visualiza en la pestaña 'Mi Horario' y en 'Mis Cursos'.",
  ]);

  addSection("4. CONSTANCIA DIGITAL Y CARNÉ ESTUDIANTIL", [
    "• Tras registrar la matrícula, el estudiante puede descargar inmediatamente su Constancia Oficial de Matrícula en formato PDF con firma y sello digital.",
    "• Dicha constancia es válida ante el Ministerio de Educación, empresas de prácticas preprofesionales y entidades públicas.",
    "• El carné de estudiante se tramita ante la Secretaría General utilizando la fotografía oficial cargada en el perfil.",
  ]);

  addSection("5. MESA DE AYUDA Y ASISTENCIA TÉCNICA", [
    "• Ante cualquier discrepancia en pagos o asignación de grupos, comuníquese con Tesorería: caja@iestpsfa.edu.pe o Secretaría: soporte@iestpsfa.edu.pe.",
    "• Horario de atención presencial en Campus Central: Lunes a Viernes de 08:30 AM a 01:30 PM.",
  ]);

  // Footer
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, height - 10, width - margin, height - 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text("IESTP San Francisco de Asís • Plataforma SFA Cloud", margin, height - 6);
  pdf.text("Página 1 de 1 • Manual Institucional de Matrícula", width - margin, height - 6, { align: "right" });

  pdf.save("Manual_Matricula_SFA_2027.pdf");
  return pdf;
}
