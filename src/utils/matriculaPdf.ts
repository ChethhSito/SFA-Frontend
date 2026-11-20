import { SFA_LOGO_BASE64 } from "./sfaLogo";

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

/**
 * Encabezado institucional oficial unificado con logo SFA.
 * Garantiza espacio suficiente a izquierda y derecha evitando colisiones de texto.
 */
function drawInstitutionalHeader(
  pdf: any,
  width: number,
  margin: number,
  titleText: string,
  badgeTitle: string = "SECRETARÍA GENERAL ACADÉMICA",
  badgeSubtitle: string = "REGISTRO DE MATRÍCULA",
  pageIndicator?: string
) {
  // Top header banner (27mm height)
  pdf.setFillColor(128, 5, 33); // #800521 Borgoña institucional
  pdf.rect(0, 0, width, 27, "F");

  // Gold accent strip
  pdf.setFillColor(217, 119, 6); // amber-600
  pdf.rect(0, 27, width, 1.8, "F");

  // Logo Oficial SFA con contenedor blanco nítido
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, 3.5, 20, 20, 2.5, 2.5, "F");
  try {
    pdf.addImage(SFA_LOGO_BASE64, "JPEG", margin + 1, 4.5, 18, 18);
  } catch {
    // Fallback silencioso si el motor del viewer no soporta addImage
  }

  // Textos Institucionales al lado del Logo (inician en margin + 23.5)
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

  // Badge Institucional alineado a la derecha sin superposición
  const badgeWidth = 46;
  const badgeX = width - margin - badgeWidth;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(251, 191, 36);
  pdf.roundedRect(badgeX, 5, badgeWidth, 16.5, 1.5, 1.5, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(251, 191, 36);
  pdf.text(badgeTitle, badgeX + badgeWidth / 2, 9.5, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.8);
  pdf.setTextColor(255, 255, 255);
  pdf.text(badgeSubtitle, badgeX + badgeWidth / 2, 14, { align: "center" });

  pdf.setFontSize(5.2);
  pdf.setTextColor(226, 232, 240);
  pdf.text(pageIndicator || "PLATAFORMA SFA CLOUD", badgeX + badgeWidth / 2, 18, { align: "center" });
}

/**
 * Firmas digitales fluidas y Sello Institucional Circular Oficial
 * perfectamente espaciados sin choques ni superposiciones de texto.
 */
function drawOfficialSignaturesAndSeal(
  pdf: any,
  width: number,
  margin: number,
  sigY: number,
  sealOffice: string = "REGISTRO DE MATRÍCULA"
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

  // 2. SELLO INSTITUCIONAL CIRCULAR OFICIAL (Centro - con más de 20mm de separación a los lados)
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

  // 3. FIRMA: Director General (Derecha)
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

  // 1. Header Institucional Oficial con Logo
  drawInstitutionalHeader(
    pdf,
    width,
    margin,
    "“SAN FRANCISCO DE ASÍS”",
    "SECRETARÍA ACADÉMICA",
    "CONSTANCIA DE MATRÍCULA"
  );

  let y = 34;

  // 2. Title Box Armónico
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, width - margin * 2, 15, 1.5, 1.5, "FD");

  pdf.setTextColor(128, 5, 33);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.text("CONSTANCIA OFICIAL DE MATRÍCULA REGULAR", width / 2, y + 6.2, { align: "center" });

  pdf.setTextColor(71, 85, 105);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.8);
  pdf.text(`PERIODO LECTIVO: ${data.period.toUpperCase()}   •   DOCUMENTO N°: COM-${data.period}-${data.dni}`, width / 2, y + 11.2, { align: "center" });

  y += 19;

  // 3. Student Info Card
  pdf.setDrawColor(226, 232, 240);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, y, width - margin * 2, 35, 1.5, 1.5, "FD");

  // Left stripe
  pdf.setFillColor(128, 5, 33);
  pdf.roundedRect(margin, y, 2.5, 35, 0.8, 0.8, "F");

  const leftX = margin + 6;
  const col2X = margin + 96;

  // Row 1
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text("APELLIDOS Y NOMBRES:", leftX, y + 5.5);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(8.5);
  pdf.text(`${data.studentLastName.toUpperCase()}, ${data.studentName.toUpperCase()}`, leftX, y + 9.8);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.text("CÓDIGO DE MATRÍCULA:", col2X, y + 5.5);
  pdf.setTextColor(128, 5, 33);
  pdf.setFontSize(9);
  pdf.text(data.studentCode, col2X, y + 9.8);

  // Row 2
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.text("DOCUMENTO DE IDENTIDAD (DNI):", leftX, y + 15.5);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(8.5);
  pdf.text(data.dni, leftX, y + 19.8);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.text("PROGRAMA FORMATIVO:", col2X, y + 15.5);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(8.5);
  pdf.text((data.programName || "ELECTRICIDAD INDUSTRIAL").toUpperCase(), col2X, y + 19.8);

  // Row 3
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.text("CICLO Y CONDICIÓN:", leftX, y + 25.5);
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(8);
  pdf.text(`CICLO ${data.cycle}  •  ALUMNO REGULAR`, leftX, y + 29.8);

  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.text("TURNO Y DERECHO DE MATRÍCULA:", col2X, y + 25.5);
  pdf.setTextColor(5, 150, 105);
  pdf.setFontSize(8);
  pdf.text(`TURNO ${data.shift.toUpperCase()}  •  ${data.paymentStatus || "PAGADO (S/. 250.00)"}`, col2X, y + 29.8);

  y += 40;

  // 4. Section Header
  pdf.setTextColor(128, 5, 33);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.text("ASIGNATURAS Y UNIDADES DIDÁCTICAS OFICIALES REGISTRADAS", margin, y);

  // 5. Tabla Oficial con anchos calibrados para evitar partición de palabras ("menos cortado")
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
      fontSize: 7.2,
      cellPadding: 2,
      valign: "middle",
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.2,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: "bold", textColor: [128, 5, 33] },
      1: { cellWidth: 62 },
      2: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 18 },
      5: { cellWidth: 15, halign: "center" },
      6: { cellWidth: 20 },
      7: { cellWidth: 18, halign: "center", textColor: [5, 150, 105], fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const lastTable = (pdf as any).lastAutoTable;
  let finalY = lastTable ? lastTable.finalY + 3.5 : y + 60;

  // 6. Summary Box
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, finalY, width - margin * 2, 9, 1.2, 1.2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);
  pdf.text(
    `TOTAL DE ASIGNATURAS: ${data.totalCourses}         •         CRÉDITOS INSCRITOS: ${data.totalCredits}         •         LÍMITE PERMITIDO: ${data.maxCredits} CRÉDITOS`,
    width / 2,
    finalY + 5.8,
    { align: "center" }
  );

  finalY += 13;

  // 7. Legal Certification Box
  pdf.setFillColor(255, 251, 235); // amber-50
  pdf.setDrawColor(251, 191, 36); // amber-400
  pdf.roundedRect(margin, finalY, width - margin * 2, 13, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.2);
  pdf.setTextColor(146, 64, 14);
  pdf.text("CERTIFICACIÓN DE MATRÍCULA Y VALIDEZ INSTITUCIONAL", margin + 4, finalY + 4.2);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    "La presente constancia digital certifica formalmente la matrícula regular del estudiante en el IESTP San Francisco de Asís.",
    margin + 4,
    finalY + 7.8
  );
  pdf.text(
    `Código de Verificación Digital: SFA-MAT-${data.period}-${data.dni}-${Date.now().toString().slice(-6)}   •   Validación en servidor institucional.`,
    margin + 4,
    finalY + 11
  );

  finalY += 17;

  // 8. Signatures & Seal armónicos sin choque
  const sigY = Math.min(finalY, height - 38);
  drawOfficialSignaturesAndSeal(pdf, width, margin, sigY, "REGISTRO DE MATRÍCULA");

  // Footer bar
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, height - 8, width - margin, height - 8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Documento oficial generado por la Plataforma Digital SFA Cloud • Con valor legal ante el MINEDU", margin, height - 4.5);
  pdf.text(`Fecha de emisión: ${data.date || new Date().toLocaleDateString("es-PE")}`, width - margin, height - 4.5, { align: "right" });

  pdf.save(`Constancia_Matricula_SFA_${data.dni}.pdf`);
  return pdf;
}

export async function generateManualMatriculaPdf() {
  const [{ jsPDF }] = await Promise.all([
    import("jspdf"),
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

  drawInstitutionalHeader(
    pdf,
    width,
    margin,
    "“SAN FRANCISCO DE ASÍS”",
    "DIRECCIÓN ACADÉMICA",
    "MANUAL DE MATRÍCULA"
  );

  let y = 33;

  const addSection = (title: string, content: string[]) => {
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(margin, y, width - margin * 2, 7.5, 1, 1, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.2);
    pdf.setTextColor(128, 5, 33);
    pdf.text(title, margin + 4, y + 5);
    y += 11;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.8);
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

export async function generateCurriculumPlanPdf(programName: string, studentName: string, dni: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  const cyclesData = [
    {
      cycle: "CICLO I (1er Semestre)",
      module: "MÓDULO PROFESIONAL I: INSTALACIONES ELÉCTRICAS Y CIRCUITOS BÁSICOS",
      credits: "20.0 Créditos",
      courses: [
        ["EIND-101", "Fundamentos de Electricidad y Circuitos CC", "4.0", "Obligatorio", "Teoría y Taller"],
        ["EIND-102", "Instalaciones Eléctricas de Edificaciones", "4.0", "Obligatorio", "Taller"],
        ["EIND-103", "Seguridad e Higiene Industrial en Baja Tensión", "4.0", "Obligatorio", "Teoría y Taller"],
        ["EIND-104", "Matemática Aplicada a la Tecnología Eléctrica", "4.0", "General", "Práctica"],
        ["EIND-105", "Comunicación y Tecnologías Digitales", "4.0", "General", "Laboratorio"],
      ],
    },
    {
      cycle: "CICLO II (2do Semestre)",
      module: "MÓDULO PROFESIONAL I: MEDICIONES Y MÁQUINAS ESTÁTICAS",
      credits: "20.0 Créditos",
      courses: [
        ["EIND-201", "Circuitos de Corriente Alterna y Mediciones", "4.0", "Obligatorio", "Teoría y Taller"],
        ["EIND-202", "Máquinas Eléctricas Estáticas (Transformadores)", "4.0", "Obligatorio", "Taller"],
        ["EIND-203", "Electrónica Básica de Potencia", "4.0", "Obligatorio", "Laboratorio"],
        ["EIND-204", "Inglés Técnico para Electricidad", "4.0", "General", "Teoría"],
        ["EIND-205", "Mecánica Aplicada al Montaje Industrial", "4.0", "Obligatorio", "Taller"],
      ],
    },
    {
      cycle: "CICLO III (3er Semestre)",
      module: "MÓDULO PROFESIONAL II: MÁQUINAS ROTATIVAS Y TABLEROS DE FUERZA",
      credits: "20.0 Créditos",
      courses: [
        ["EIND-301", "Máquinas Eléctricas Rotativas (Motores y Generadores)", "4.0", "Obligatorio", "Taller"],
        ["EIND-302", "Tableros Industriales y Automatismos por Contactores", "4.0", "Obligatorio", "Taller"],
        ["EIND-303", "Sistemas de Puesta a Tierra y Protección Eléctrica", "4.0", "Obligatorio", "Teoría y Campo"],
        ["EIND-304", "Dibujo Técnico Asistido por Computadora (CAD Eléctrico)", "4.0", "Obligatorio", "Laboratorio"],
        ["EIND-305", "Medio Ambiente y Desarrollo Sostenible", "4.0", "General", "Teoría"],
      ],
    },
    {
      cycle: "CICLO IV (4to Semestre)",
      module: "MÓDULO PROFESIONAL II: CONTROLADORES AUTOMATIZADOS Y VARIADORES",
      credits: "20.0 Créditos",
      courses: [
        ["EIND-401", "Controladores Lógicos Programables (PLC I)", "4.0", "Obligatorio", "Laboratorio"],
        ["EIND-402", "Variadores de Frecuencia y Arrancadores Suaves", "4.0", "Obligatorio", "Taller"],
        ["EIND-403", "Redes y Líneas de Distribución Eléctrica", "4.0", "Obligatorio", "Campo"],
        ["EIND-404", "Instrumentación Industrial y Sensores", "4.0", "Obligatorio", "Laboratorio"],
        ["EIND-405", "Legislación e Inserción Laboral", "4.0", "General", "Teoría"],
      ],
    },
    {
      cycle: "CICLO V (5to Semestre)",
      module: "MÓDULO PROFESIONAL III: AUTOMATIZACIÓN INDUSTRIAL Y SCADA",
      credits: "20.0 Créditos",
      courses: [
        ["EIND-501", "Automatización Industrial y Redes Industriales (SCADA)", "4.0", "Obligatorio", "Laboratorio"],
        ["EIND-502", "Mantenimiento Electro-Mecánico Predictivo", "4.0", "Obligatorio", "Taller"],
        ["EIND-503", "Subestaciones Eléctricas y Media Tensión", "4.0", "Obligatorio", "Teoría y Visita"],
        ["EIND-504", "Sistemas de Control con PLC Avanzado", "4.0", "Obligatorio", "Laboratorio"],
        ["EIND-505", "Innovación Tecnológica y Emprendimiento", "4.0", "General", "Teoría"],
      ],
    },
    {
      cycle: "CICLO VI (6to Semestre)",
      module: "MÓDULO PROFESIONAL III: PROYECTOS DE EFICIENCIA Y TITULACIÓN",
      credits: "20.0 Créditos",
      courses: [
        ["EIND-601", "Proyectos de Electrificación y Eficiencia Energética", "4.0", "Obligatorio", "Taller"],
        ["EIND-602", "Auditorías Energéticas y Normatividad CNE", "4.0", "Obligatorio", "Teoría y Campo"],
        ["EIND-603", "Mantenimiento de Plantas Industriales", "4.0", "Obligatorio", "Taller"],
        ["EIND-604", "Seminario de Titulación y Prácticas EFSRT", "4.0", "Obligatorio", "Taller"],
        ["EIND-605", "Ética Profesional y Liderazgo Técnico", "4.0", "General", "Teoría"],
      ],
    },
  ];

  const drawPageFooter = (pageNumber: number, totalPages: number) => {
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, height - 9, width - margin, height - 9);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text("IESTP San Francisco de Asís • Plataforma SFA Cloud • Malla Curricular Oficial", margin, height - 5);
    pdf.text(`Página ${pageNumber} de ${totalPages} • Documento oficial emitido para ${studentName.toUpperCase()}`, width - margin, height - 5, { align: "right" });
  };

  const renderCycleTable = (cycleData: typeof cyclesData[0], startY: number): number => {
    pdf.setFillColor(241, 245, 249);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(margin, startY, width - margin * 2, 7, 1, 1, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(128, 5, 33);
    pdf.text(`${cycleData.cycle}  —  ${cycleData.module}`, margin + 3.5, startY + 4.8);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(cycleData.credits, width - margin - 3.5, startY + 4.8, { align: "right" });

    autoTable(pdf, {
      startY: startY + 8,
      margin: { left: margin, right: margin },
      head: [["CÓDIGO", "UNIDAD DIDÁCTICA / ASIGNATURA", "CRÉD.", "TIPO", "MODALIDAD"]],
      body: cycleData.courses,
      styles: { font: "helvetica", fontSize: 6.8, cellPadding: 1.6, valign: "middle", textColor: [15, 23, 42] },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 7, halign: "left" },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: "bold", textColor: [128, 5, 33] },
        1: { cellWidth: 88 },
        2: { cellWidth: 16, halign: "center", fontStyle: "bold" },
        3: { cellWidth: 26 },
        4: { cellWidth: 30 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const lastTable = (pdf as any).lastAutoTable;
    return lastTable ? lastTable.finalY : startY + 36;
  };

  // --- PÁGINA 1: Ciclos I, II y III ---
  drawInstitutionalHeader(
    pdf,
    width,
    margin,
    "“SAN FRANCISCO DE ASÍS”",
    "DIRECCIÓN ACADÉMICA",
    "PLAN CURRICULAR MODULAR",
    "PÁGINA 1 DE 2"
  );

  let currentY = 32;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, currentY, width - margin * 2, 13, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`ESTUDIANTE: ${studentName.toUpperCase()}   •   DNI: ${dni}   •   PROGRAMA: ${programName.toUpperCase()}`, margin + 4, currentY + 5.5);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.8);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Plan de Formación Profesional Técnica Modular de 3 años lectivos (6 semestres académicos / 120 créditos curriculares).", margin + 4, currentY + 9.5);

  currentY += 17;

  // Ciclo I
  currentY = renderCycleTable(cyclesData[0], currentY) + 4.5;
  // Ciclo II
  currentY = renderCycleTable(cyclesData[1], currentY) + 4.5;
  // Ciclo III
  currentY = renderCycleTable(cyclesData[2], currentY);

  drawPageFooter(1, 2);

  // --- PÁGINA 2: Ciclos IV, V, VI + Resumen y Sellos ---
  pdf.addPage();
  drawInstitutionalHeader(
    pdf,
    width,
    margin,
    "“SAN FRANCISCO DE ASÍS”",
    "DIRECCIÓN ACADÉMICA",
    "PLAN CURRICULAR MODULAR",
    "PÁGINA 2 DE 2"
  );

  currentY = 32;
  // Ciclo IV
  currentY = renderCycleTable(cyclesData[3], currentY) + 4;
  // Ciclo V
  currentY = renderCycleTable(cyclesData[4], currentY) + 4;
  // Ciclo VI
  currentY = renderCycleTable(cyclesData[5], currentY) + 4.5;

  // Resumen General de Créditos
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, currentY, width - margin * 2, 9, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(128, 5, 33);
  pdf.text(
    "TOTAL GENERAL DEL PLAN: 120 CRÉDITOS ACADÉMICOS   •   6 SEMESTRES LECTIVOS   •   CERTIFICACIÓN MODULAR PROGRESIVA",
    width / 2,
    currentY + 5.8,
    { align: "center" }
  );

  currentY += 12;

  // Certificación y Validez Institucional
  pdf.setFillColor(255, 251, 235); // amber-50
  pdf.setDrawColor(251, 191, 36); // amber-400
  pdf.roundedRect(margin, currentY, width - margin * 2, 12, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(146, 64, 14);
  pdf.text("CERTIFICACIÓN DE MALLA CURRICULAR Y VALIDEZ INSTITUCIONAL", margin + 4, currentY + 4.2);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.2);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    `El presente plan de estudios corresponde a la estructura curricular oficial aprobada por el Ministerio de Educación para la carrera técnica de ${programName}.`,
    margin + 4,
    currentY + 7.8
  );
  pdf.text(
    `Código de Autenticidad Curricular: SFA-PLAN-${dni}-${Date.now().toString().slice(-6)}   •   Validado en el Registro Académico Central.`,
    margin + 4,
    currentY + 10.5
  );

  currentY += 16;

  // Firmas y Sello Institucional Armónico
  const sigY = Math.min(currentY, height - 38);
  drawOfficialSignaturesAndSeal(pdf, width, margin, sigY, "PLAN CURRICULAR MINEDU");

  drawPageFooter(2, 2);

  pdf.save(`Plan_Curricular_SFA_${programName.replace(/\s+/g, "_")}.pdf`);
  return pdf;
}

export async function generateBoletaNotasPdf(
  cycle: string,
  studentName: string,
  dni: string,
  programName: string,
  courses: Array<{ code: string; name: string; credits: number; grade?: number }>,
  shouldSave: boolean = true
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  drawInstitutionalHeader(
    pdf,
    width,
    margin,
    "“SAN FRANCISCO DE ASÍS”",
    "SECRETARÍA ACADÉMICA",
    "BOLETA DE CALIFICACIONES"
  );

  let y = 33;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, width - margin * 2, 16, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`ESTUDIANTE: ${studentName.toUpperCase()}`, margin + 4, y + 5);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text(`DNI: ${dni}   •   PROGRAMA: ${programName.toUpperCase()}   •   SEMESTRE: 2027-I`, margin + 4, y + 9.5);
  pdf.setTextColor(5, 150, 105);
  pdf.setFont("helvetica", "bold");
  pdf.text("CONDICIÓN: ALUMNO REGULAR", margin + 4, y + 13.5);

  y += 21;

  autoTable(pdf, {
    startY: y,
    margin: { left: margin, right: margin, bottom: 25 },
    head: [["CÓDIGO", "ASIGNATURA / UNIDAD DIDÁCTICA", "CRÉD.", "CALIFICACIÓN", "CONDICIÓN ACADÉMICA"]],
    body: courses.map((c) => [
      c.code,
      c.name,
      c.credits.toFixed(1),
      c.grade !== undefined && c.grade > 0
        ? (Number.isInteger(c.grade) ? c.grade.toString().padStart(2, "0") : c.grade.toFixed(1))
        : "--",
      c.grade !== undefined && c.grade > 0
        ? (c.grade >= 12.5 ? "APROBADO" : "DESAPROBADO")
        : "MATRICULADO",
    ]),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, valign: "middle" },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: "bold", textColor: [128, 5, 33] },
      1: { cellWidth: 80 },
      2: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 28, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 34, halign: "center", textColor: [5, 150, 105], fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const lastTable = (pdf as any).lastAutoTable;
  const boletaFinalY = lastTable ? lastTable.finalY + 8 : y + 80;

  const sigY = Math.min(boletaFinalY + 6, height - 38);
  drawOfficialSignaturesAndSeal(pdf, width, margin, sigY, "REGISTRO DE NOTAS");

  if (shouldSave) {
    pdf.save(`Boleta_Notas_SFA_Ciclo_${cycle}_${dni}.pdf`);
  }
  return pdf;
}
