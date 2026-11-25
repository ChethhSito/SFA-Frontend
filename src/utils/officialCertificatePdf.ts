import { SFA_LOGO_BASE64 } from "./sfaLogo";
import { 
  ACCREDITED_CURRICULUM_ELECTRICIDAD, 
  ACCREDITED_CURRICULUM_CONTABILIDAD 
} from "../components/mge/tabs/MgeHistorialTab";

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
 * Dibuja la elegante medalla dorada con roseta y cintas en el listón izquierdo
 */
function drawGoldenAwardMedal(pdf: any, cx: number, cy: number) {
  // Cintas colgantes inferiores de la medalla
  pdf.setFillColor(217, 119, 6); // Oro oscuro #D97706
  pdf.triangle(cx - 7, cy + 9, cx - 14, cy + 30, cx - 4, cy + 24, "F");
  pdf.triangle(cx + 7, cy + 9, cx + 14, cy + 30, cx + 4, cy + 24, "F");

  pdf.setFillColor(245, 158, 11); // Oro medio #F59E0B
  pdf.triangle(cx - 6, cy + 10, cx - 12, cy + 28, cx - 3, cy + 23, "F");
  pdf.triangle(cx + 6, cy + 10, cx + 12, cy + 28, cx + 3, cy + 23, "F");

  // Roseta dentada exterior (estilo trofeo / award)
  const outerR = 15;
  const innerR = 13.5;
  const numPoints = 28;
  pdf.setFillColor(217, 119, 6);
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const nextAngle = ((i + 1) * 2 * Math.PI) / numPoints;
    const midAngle = (angle + nextAngle) / 2;
    pdf.triangle(
      cx,
      cy,
      cx + Math.cos(angle) * outerR,
      cy + Math.sin(angle) * outerR,
      cx + Math.cos(midAngle) * (outerR + 1.6),
      cy + Math.sin(midAngle) * (outerR + 1.6),
      "F"
    );
  }

  // Disco exterior dorado
  pdf.setFillColor(245, 158, 11);
  pdf.circle(cx, cy, innerR, "F");

  // Borde intermedio oro suave
  pdf.setFillColor(254, 240, 138); // Amarillo oro claro
  pdf.circle(cx, cy, 11.8, "F");

  // Disco interior oro degradado
  pdf.setFillColor(180, 83, 9); // Ámbar intenso
  pdf.circle(cx, cy, 10.5, "F");

  pdf.setFillColor(245, 158, 11);
  pdf.circle(cx, cy, 9.8, "F");

  // Textos y estrellas dentro de la medalla
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(3.8);
  pdf.setTextColor(255, 255, 255);
  pdf.text("• EXCELENCIA ACADÉMICA •", cx, cy - 5.5, { align: "center" });

  pdf.setFontSize(6.2);
  pdf.setTextColor(255, 255, 255);
  pdf.text("120", cx, cy - 0.8, { align: "center" });
  pdf.setFontSize(3.6);
  pdf.text("CRÉDITOS", cx, cy + 2.6, { align: "center" });

  pdf.setFontSize(3.2);
  pdf.setTextColor(254, 240, 138);
  pdf.text("MINEDU • LEY 30512", cx, cy + 6.2, { align: "center" });
}

/**
 * Generador principal del CERTIFICADO OFICIAL DIPLOMA (LANDSCAPE / HORIZONTAL)
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

  // Formato A4 Horizontal (297 mm de ancho x 210 mm de alto)
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const width = pdf.internal.pageSize.getWidth(); // 297 mm
  const height = pdf.internal.pageSize.getHeight(); // 210 mm

  pdf.setProperties({
    title: `Certificado Oficial de Estudios - ${studentDni} - ${studentName}`,
    author: "IESTP San Francisco de Asís - MINEDU",
    subject: "Certificado de Estudios de Educación Superior Tecnológica",
    keywords: "MINEDU, Certificado Oficial, Diploma, SFA, Electricidad Industrial",
  });

  // =========================================================================
  // PÁGINA 1: DIPLOMA / CERTIFICADO DE EXCELENCIA (HORIZONTAL CON ONDAS Y MEDALLA)
  // =========================================================================

  // 1. Fondo marfil aperlado sutil
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, width, height, "F");

  // 2. Ondas y curvas superiores decorativas en Borgoña (#800521) y Oro (#D97706)
  // Onda dorada profunda inferior
  pdf.setFillColor(217, 119, 6);
  pdf.lines(
    [
      [140, 0],
      [width - 150, 0],
      [0, 32],
      [-100, 26],
      [-width + 250, -58],
    ],
    150,
    0,
    [1, 1],
    "F"
  );

  // Curva de acento oro brillante
  pdf.setFillColor(245, 158, 11);
  pdf.lines(
    [
      [130, 0],
      [0, 28],
      [-70, 24],
      [-60, -52],
    ],
    167,
    0,
    [1, 1],
    "F"
  );

  // Onda principal institucional en Borgoña (#800521)
  pdf.setFillColor(128, 5, 33);
  pdf.lines(
    [
      [115, 0],
      [0, 24],
      [-55, 20],
      [-60, -44],
    ],
    182,
    0,
    [1, 1],
    "F"
  );

  // Onda complementaria oscura en vino tinto
  pdf.setFillColor(85, 3, 22);
  pdf.lines(
    [
      [80, 0],
      [0, 18],
      [-40, 14],
      [-40, -32],
    ],
    217,
    0,
    [1, 1],
    "F"
  );

  // 3. Listón vertical institucional a la izquierda (conecta con la medalla)
  const ribbonX = 18;
  const ribbonW = 34;

  // Franja base borgoña
  pdf.setFillColor(128, 5, 33);
  pdf.rect(ribbonX, 0, ribbonW, 142, "F");

  // Franja sombra interna
  pdf.setFillColor(102, 4, 26);
  pdf.rect(ribbonX + 4, 0, ribbonW - 8, 142, "F");

  // Filetes laterales dorados
  pdf.setFillColor(217, 119, 6);
  pdf.rect(ribbonX - 1.2, 0, 1.2, 142, "F");
  pdf.rect(ribbonX + ribbonW, 0, 1.2, 142, "F");

  // Logo Oficial SFA centrado dentro del listón
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(ribbonX + 3.5, 8, 27, 27, 3, 3, "F");
  try {
    pdf.addImage(SFA_LOGO_BASE64, "JPEG", ribbonX + 4.5, 9, 25, 25);
  } catch {
    // Fallback silencioso
  }

  // Texto vertical o institucional en el listón
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.2);
  pdf.setTextColor(254, 240, 138); // Amarillo dorado
  pdf.text("IESTP SFA", ribbonX + ribbonW / 2, 42, { align: "center" });
  pdf.setFontSize(4.8);
  pdf.setTextColor(241, 245, 249);
  pdf.text("LIMA - PERÚ", ribbonX + ribbonW / 2, 46, { align: "center" });

  // 4. Medalla de Excelencia colgada al final del listón
  drawGoldenAwardMedal(pdf, ribbonX + ribbonW / 2, 128);

  // 5. Marco perimetral fino de seguridad (Doble línea dorada institucional)
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(0.6);
  pdf.rect(10, 10, width - 20, height - 20, "S");

  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.25);
  pdf.rect(12.5, 12.5, width - 25, height - 25, "S");

  // 6. Encabezado Oficial Institucional (Centro y Derecha)
  const contentLeft = ribbonX + ribbonW + 12; // ~64 mm
  const contentCenter = (contentLeft + width - 16) / 2; // ~172 mm

  let curY = 22;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.text("REPÚBLICA DEL PERÚ   •   MINISTERIO DE EDUCACIÓN", contentCenter, curY, { align: "center" });

  curY += 4.5;
  pdf.setFontSize(8.2);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text("DIRECCIÓN REGIONAL DE EDUCACIÓN DE LIMA METROPOLITANA", contentCenter, curY, { align: "center" });

  curY += 5.2;
  pdf.setFontSize(11);
  pdf.setTextColor(128, 5, 33); // Borgoña SFA
  pdf.text("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO", contentCenter, curY, { align: "center" });

  curY += 6.5;
  pdf.setFontSize(15.5);
  pdf.text("“SAN FRANCISCO DE ASÍS”", contentCenter, curY, { align: "center" });

  curY += 4.2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.2);
  pdf.setTextColor(71, 85, 105);
  pdf.text("R.M. N° 0233-80-ED  •  R.D. N° 0458-2005-ED  •  CÓDIGO MODULAR N° 0583427", contentCenter, curY, { align: "center" });

  // 7. Gran Título del Certificado
  curY += 9.5;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(128, 5, 33);
  pdf.text("CERTIFICADO OFICIAL DE ESTUDIOS", contentCenter, curY, { align: "center" });

  curY += 4.2;
  pdf.setFontSize(7.8);
  pdf.setTextColor(217, 119, 6);
  pdf.text("EDUCACIÓN SUPERIOR TECNOLÓGICA   •   LEY N° 30512   •   R.V.M. N° 277-2019-MINEDU", contentCenter, curY, { align: "center" });

  // 8. Texto de Otorgamiento y Reconocimiento
  curY += 6.8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);
  pdf.text(
    "EL DIRECTOR GENERAL Y LA SECRETARÍA ACADÉMICA DEL IESTP “SAN FRANCISCO DE ASÍS” CERTIFICAN QUE:",
    contentCenter,
    curY,
    { align: "center" }
  );

  // 9. Nombre del Egresado en Grande (Estilo Caligráfico / Distintivo)
  curY += 9.5;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(15, 23, 42);
  pdf.text(studentName.toUpperCase(), contentCenter, curY, { align: "center" });

  // Línea ornamental dorada debajo del nombre con rombo central
  curY += 2.5;
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(0.6);
  pdf.line(contentCenter - 65, curY, contentCenter - 6, curY);
  pdf.line(contentCenter + 6, curY, contentCenter + 65, curY);

  pdf.setFillColor(217, 119, 6);
  pdf.triangle(contentCenter, curY - 1.8, contentCenter - 2.5, curY, contentCenter + 2.5, curY, "F");
  pdf.triangle(contentCenter, curY + 1.8, contentCenter - 2.5, curY, contentCenter + 2.5, curY, "F");

  // 10. Datos Institucionales del Administrado
  curY += 5;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`DNI N° ${studentDni}    •    CÓDIGO DE MATRÍCULA: 202710001    •    EGRESADO APTO`, contentCenter, curY, { align: "center" });

  // 11. Párrafo Conmemorativo Formal
  curY += 5.2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.6);
  pdf.setTextColor(51, 65, 85);
  pdf.text(
    "Ha cursado y aprobado con distinción los módulos formativos y las Experiencias Formativas en Situaciones Reales de Trabajo (EFSRT),",
    contentCenter,
    curY,
    { align: "center" }
  );
  curY += 3.8;
  pdf.text(
    "acumulando la totalidad de los 120 Créditos Formativos y 2,550 horas académicas correspondientes al Programa de Estudios de:",
    contentCenter,
    curY,
    { align: "center" }
  );

  // 12. Nombre de la Carrera / Programa de Estudios
  curY += 6.8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(128, 5, 33);
  pdf.text(program.toUpperCase(), contentCenter, curY, { align: "center" });

  curY += 4.2;
  pdf.setFontSize(7.5);
  pdf.setTextColor(217, 119, 6);
  pdf.text("NIVEL FORMATIVO: PROFESIONAL TÉCNICO   •   DURACIÓN: 6 SEMESTRES ACADÉMICOS (3 AÑOS)", contentCenter, curY, { align: "center" });

  // 13. Tarjetas KPI de Rendimiento Académico (4 Cajas estilizadas)
  curY += 6;
  const kpiY = curY;
  const kpiW = 44;
  const kpiH = 13.5;
  const kpiGap = 4.5;
  const kpiStartX = contentCenter - (kpiW * 4 + kpiGap * 3) / 2;

  const kpis = [
    { label: "MÓDULOS CURRICULARES", val: "6 CICLOS (100%)", color: [15, 23, 42] },
    { label: "CRÉDITOS APROBADOS", val: "120 CRÉDITOS", color: [128, 5, 33] },
    { label: "HORAS ACADÉMICAS", val: "2,550 HORAS", color: [15, 23, 42] },
    { label: "PROMEDIO GENERAL", val: "17.20 (SOBRESALIENTE)", color: [4, 120, 87] },
  ];

  kpis.forEach((kpi, idx) => {
    const boxX = kpiStartX + idx * (kpiW + kpiGap);
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(boxX, kpiY, kpiW, kpiH, 1.5, 1.5, "FD");

    // Barrita superior de color
    pdf.setFillColor(...kpi.color);
    pdf.roundedRect(boxX, kpiY, kpiW, 1.4, 0.5, 0.5, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(kpi.label, boxX + kpiW / 2, kpiY + 5.2, { align: "center" });

    pdf.setFontSize(6.8);
    pdf.setTextColor(...kpi.color);
    pdf.text(kpi.val, boxX + kpiW / 2, kpiY + 10.2, { align: "center" });
  });

  // 14. Cláusula Legal de Expedición y Fecha
  curY = kpiY + kpiH + 5.2;
  const [year, month, day] = issueDate.split("-");
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
  const mName = months[parseInt(month, 10) - 1] || "noviembre";

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.8);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    `Dado en la Sede Institucional del IESTP “San Francisco de Asís”, en la ciudad de Lima, a los ${day || "24"} días del mes de ${mName} del año ${year || "2026"}.`,
    contentCenter,
    curY,
    { align: "center" }
  );

  // 15. Firmas Caligráficas, Sello Circular Oficial y Código QR
  const sigY = curY + 6;
  const sigW = 56;
  const sig1X = contentCenter - 72; // Firma izquierda (Secretario)
  const sig2X = contentCenter + 16; // Firma derecha (Director)
  const sealX = contentCenter; // Sello central
  const sealY = sigY + 9;

  // Firma 1: Secretario Académico
  pdf.setDrawColor(18, 65, 160);
  pdf.setLineWidth(0.45);
  pdf.lines([[4, -5], [6, 3], [5, -7], [7, 6], [10, -2], [12, 1]], sig1X + 12, sigY + 5);
  pdf.lines([[-2, 3], [10, -2], [14, -3], [8, 2], [-18, 4], [24, -1]], sig1X + 15, sigY + 6);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7);
  pdf.setTextColor(18, 65, 160);
  pdf.text("Carlos Mendoza Q.", sig1X + sigW / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig1X, sigY + 11, sig1X + sigW, sigY + 11);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(issuerName.toUpperCase(), sig1X + sigW / 2, sigY + 14.5, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.4);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Secretaría Académica  •  IESTP SFA", sig1X + sigW / 2, sigY + 17.5, { align: "center" });

  // Sello Circular Doble Institucional en el Centro
  pdf.setDrawColor(128, 5, 33);
  pdf.setLineWidth(0.55);
  pdf.circle(sealX, sealY, 11, "S");
  pdf.setLineWidth(0.3);
  pdf.circle(sealX, sealY, 9.4, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.4);
  pdf.setTextColor(128, 5, 33);
  pdf.text("REPÚBLICA DEL PERÚ", sealX, sealY - 5.8, { align: "center" });
  pdf.text("IESTP SFA", sealX, sealY - 3, { align: "center" });

  pdf.setFillColor(217, 119, 6);
  pdf.circle(sealX, sealY, 1, "F");

  pdf.setFontSize(4.8);
  pdf.text("CERTIFICACIÓN", sealX, sealY + 2.6, { align: "center" });
  pdf.text("OFICIAL", sealX, sealY + 5.4, { align: "center" });
  pdf.setFontSize(3.8);
  pdf.text("MINEDU - LIMA", sealX, sealY + 7.8, { align: "center" });

  // Firma 2: Director General
  pdf.setDrawColor(18, 65, 160);
  pdf.setLineWidth(0.45);
  pdf.lines([[3, -6], [5, 4], [4, -8], [8, 5], [11, -3], [14, 2]], sig2X + 11, sigY + 5);
  pdf.lines([[-3, 4], [9, -3], [15, -2], [7, 3], [-16, 3], [22, -1]], sig2X + 14, sigY + 6);

  pdf.setFont("helvetica", "bolditalic");
  pdf.setFontSize(7);
  pdf.setTextColor(18, 65, 160);
  pdf.text("Juan M. Fernández P.", sig2X + sigW / 2, sigY + 7, { align: "center" });

  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.35);
  pdf.line(sig2X, sigY + 11, sig2X + sigW, sigY + 11);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text("DR. JUAN M. FERNÁNDEZ PAREDES", sig2X + sigW / 2, sigY + 14.5, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.4);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Director General  •  IESTP SFA", sig2X + sigW / 2, sigY + 17.5, { align: "center" });

  // Pie de seguridad: Código Hash y N° Correlativo
  pdf.setFont("courier", "bold");
  pdf.setFontSize(5.2);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`REGISTRO MINEDU: ${certificateNumber}  •  FOLIO ANVERSO (DIPLOMA DE EXCELENCIA)`, width - 15, height - 12, { align: "right" });

  // =========================================================================
  // PÁGINA 2: FOLIO REVERSO - RÉCORD ACADÉMICO MODULAR OFICIAL (MINEDU)
  // =========================================================================
  pdf.addPage("a4", "landscape");

  // Marco de seguridad página 2
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(0.5);
  pdf.rect(10, 10, width - 20, height - 20, "S");

  // Encabezado del Folio Reverso
  pdf.setFillColor(128, 5, 33);
  pdf.rect(10, 10, width - 20, 12, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(254, 240, 138);
  pdf.text("FOLIO REVERSO  •  RÉCORD DE CALIFICACIONES Y UNIDADES DIDÁCTICAS ACREDITADAS", 15, 17.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`ESTUDIANTE: ${studentName.toUpperCase()}  (DNI ${studentDni})  •  ${certificateNumber}`, width - 15, 17.5, { align: "right" });

  // Construcción de la tabla completa de 30 cursos + 3 EFSRT
  const tableRows: any[] = [];
  let currentMod = 0;
  const isContabilidad = program?.toLowerCase().includes("contab");
  const curriculumSource = isContabilidad 
    ? ACCREDITED_CURRICULUM_CONTABILIDAD 
    : ACCREDITED_CURRICULUM_ELECTRICIDAD;

  curriculumSource.forEach((course) => {
    const cycle = course.cycle || 1;
    const modNum = cycle <= 2 ? 1 : cycle <= 4 ? 2 : 3;

    if (modNum !== currentMod) {
      currentMod = modNum;
      const modName = isContabilidad
        ? (currentMod === 1
            ? "MÓDULO TÉCNICO PROFESIONAL I: PROCESOS CONTABLES Y TRIBUTARIOS (Ciclos I y II)"
            : currentMod === 2
            ? "MÓDULO TÉCNICO PROFESIONAL II: CONTABILIDAD DE COSTOS Y ESTADOS FINANCIEROS (Ciclos III y IV)"
            : "MÓDULO TÉCNICO PROFESIONAL III: AUDITORÍA Y CONTROL FINANCIERO (Ciclos V y VI)")
        : (currentMod === 1
            ? "MÓDULO TÉCNICO PROFESIONAL I: INSTALACIÓN Y MONTAJE DE SISTEMAS ELÉCTRICOS (Ciclos I y II)"
            : currentMod === 2
            ? "MÓDULO TÉCNICO PROFESIONAL II: MANTENIMIENTO DE MÁQUINAS Y REDES ELÉCTRICAS (Ciclos III y IV)"
            : "MÓDULO TÉCNICO PROFESIONAL III: AUTOMATIZACIÓN Y CONTROL DE SISTEMAS INDUSTRIALES (Ciclos V y VI)");

      tableRows.push([
        {
          content: modName,
          colSpan: 8,
          styles: { fillColor: [241, 245, 249], textColor: [128, 5, 33], fontStyle: "bold", fontSize: 6.2 },
        },
      ]);
    }

    const gradeNum = Math.round(course.grade || 16);
    const gradeWord = GRADE_WORDS[gradeNum] || `${gradeNum}`;
    const hours = (course.credits || 3) * 16;

    tableRows.push([
      course.code,
      course.courseName,
      `Ciclo ${cycle}`,
      `${course.credits}`,
      `${hours}`,
      `${gradeNum}`,
      gradeWord,
      "APROBADO",
    ]);

    // Insertar fila de EFSRT al final de cada ciclo par (2, 4, 6)
    if (course.code === "EIND-205") {
      tableRows.push([
        { content: "EFSRT-01", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
        { content: "Prácticas Preprofesionales EFSRT I (Instalaciones Eléctricas en Entorno Real)", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
        "Módulo I",
        "8",
        "240",
        "18",
        "Dieciocho",
        { content: "CONFORME", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
      ]);
    } else if (course.code === "EIND-405") {
      tableRows.push([
        { content: "EFSRT-02", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
        { content: "Prácticas Preprofesionales EFSRT II (Mantenimiento de Máquinas y Redes)", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
        "Módulo II",
        "8",
        "240",
        "18",
        "Dieciocho",
        { content: "CONFORME", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
      ]);
    } else if (course.code === "EIND-605") {
      tableRows.push([
        { content: "EFSRT-03", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
        { content: "Prácticas Preprofesionales EFSRT III (Automatización, SCADA y Control)", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
        "Módulo III",
        "8",
        "240",
        "19",
        "Diecinueve",
        { content: "CONFORME", styles: { fontStyle: "bold", textColor: [4, 120, 87] } },
      ]);
    }
  });

  autoTable(pdf, {
    startY: 24,
    margin: { left: 14, right: 14 },
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
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [128, 5, 33],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 5.6,
      halign: "center",
      cellPadding: 1.1,
    },
    bodyStyles: {
      fontSize: 5.2,
      cellPadding: 0.85,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 10, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 11, halign: "center", fontStyle: "bold", textColor: [128, 5, 33] },
      6: { cellWidth: 26, halign: "left" },
      7: { cellWidth: 18, halign: "center", fontStyle: "bold", textColor: [4, 120, 87] },
    },
  });

  const finalTableY2 = (pdf as any).lastAutoTable?.finalY || 178;

  // Pie resumen final de créditos
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(14, finalTableY2 + 2, width - 28, 11.5, 1.2, 1.2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.2);
  pdf.setTextColor(128, 5, 33);
  pdf.text("RESUMEN DE EGRESADO:", 18, finalTableY2 + 6.2);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.8);
  pdf.setTextColor(15, 23, 42);
  pdf.text("Créditos Lectivos: 96 cr.  •  Créditos EFSRT: 24 cr. (720 horas)  •  Total: 120 Créditos Formativos (100%)", 50, finalTableY2 + 6.2);
  pdf.text("Total Horas Formativas: 2,550 hrs.  •  Promedio Ponderado Acumulado: 17.20 (Sobresaliente)  •  Condición: EGRESADO APTO", 50, finalTableY2 + 10);

  return pdf;
}
