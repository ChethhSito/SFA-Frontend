import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SFA_LOGO_BASE64 } from "../src/utils/sfaLogo.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../public/guides");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function drawHeader(pdf, title, docCode) {
  const width = pdf.internal.pageSize.getWidth();
  const margin = 14;

  // Header borgoña institucional
  pdf.setFillColor(128, 5, 33); // #800521
  pdf.rect(0, 0, width, 27, "F");

  // Barra ámbar
  pdf.setFillColor(217, 119, 6);
  pdf.rect(0, 27, width, 1.8, "F");

  // Contenedor del Logo
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(margin, 3.5, 20, 20, 2.5, 2.5, "F");
  try {
    pdf.addImage(SFA_LOGO_BASE64, "JPEG", margin + 1, 4.5, 18, 18);
  } catch (e) {}

  const textX = margin + 23.5;
  pdf.setTextColor(251, 191, 36);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("REPÚBLICA DEL PERÚ  •  MINISTERIO DE EDUCACIÓN", textX, 7.5);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text("INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO", textX, 11.8);

  pdf.setFontSize(11.5);
  pdf.text("“SAN FRANCISCO DE ASÍS”", textX, 17);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(241, 245, 249);
  pdf.text("R.M. N° 0233-80-ED  •  R.D. N° 0458-2005-ED  •  LIMA - PERÚ", textX, 22.2);

  // Badge derecho
  const badgeWidth = 48;
  const badgeX = width - margin - badgeWidth;
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(251, 191, 36);
  pdf.roundedRect(badgeX, 5, badgeWidth, 16.5, 1.5, 1.5, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(251, 191, 36);
  pdf.text("DOCUMENTO OFICIAL", badgeX + badgeWidth / 2, 9.5, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.8);
  pdf.setTextColor(255, 255, 255);
  pdf.text(docCode || "SFA-NORM-2026", badgeX + badgeWidth / 2, 14, { align: "center" });

  pdf.setFontSize(5.2);
  pdf.setTextColor(226, 232, 240);
  pdf.text("DIRECCIÓN GENERAL", badgeX + badgeWidth / 2, 18, { align: "center" });
}

function drawSignaturesAndSeal(pdf, sigY, sealText = "SECRETARÍA GENERAL") {
  const width = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const sigWidth = 52;
  const sig1X = margin + 5;
  const sig3X = width - margin - sigWidth - 5;
  const stampX = width / 2;
  const stampY = sigY + 8;

  // Firma Izquierda: Secretaria General
  pdf.setDrawColor(18, 65, 160);
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

  // Sello Circular Oficial Centro
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
  pdf.text(sealText, stampX, stampY + 4.5, { align: "center" });
  pdf.setFontSize(4);
  pdf.setTextColor(100, 116, 139);
  pdf.text("LIMA - PERÚ", stampX, stampY + 7.5, { align: "center" });

  // Firma Derecha: Director General
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
  pdf.text("Director General • IESTP SFA", sig3X + sigWidth / 2, sigY + 18.2, { align: "center" });
  pdf.text("R.D. N° 0458-2005-ED • MINEDU", sig3X + sigWidth / 2, sigY + 21, { align: "center" });
}

function drawFooter(pdf) {
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(margin, height - 12, width - margin, height - 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Av. San Francisco de Asís s/n • Los Olivos, Lima • Tel: (01) 528-4091 • secretaria@iestpsfa.edu.pe", margin, height - 8);
  pdf.text("Portal Académico Institucional SFA • Acreditación MINEDU", width - margin, height - 8, { align: "right" });
}

const GUIDES_DATA = [
  {
    fileName: "estudiante-prematricula-demo.pdf",
    docCode: "SFA-G-ADM-2026",
    title: "GUÍA OFICIAL DE PREMATRÍCULA Y ADMISIÓN",
    subtitle: "Procedimiento Oficial de Postulación, Verificación de Requisitos y Cronograma Académico",
    sections: [
      {
        title: "1. Convocatoria y Período Académico",
        content: "El estudiante o postulante debe verificar la habilitación del proceso en el portal institucional (https://iestpsfa.edu.pe). El cronograma de admisión y prematrícula es publicado formalmente con aprobación de Dirección General y MINEDU."
      },
      {
        title: "2. Verificación y Registro de Documentos",
        content: "Es requisito indispensable ingresar al expediente digital y adjuntar: Certificado de Estudios Secundarios (visado por UGEL), copia legible de DNI, fotografía oficial tamaño pasaporte y declaración jurada de salud ocupacional."
      },
      {
        title: "3. Código de Matrícula y Constancia Provisional",
        content: "Una vez completado el registro, el sistema genera de forma automatizada la Constancia Oficial de Prematrícula con el código único de seguimiento institucional y número de postulación."
      },
      {
        title: "4. Regularización y Validación",
        content: "Cualquier observación en los documentos será notificada en la bandeja del portal del estudiante. La subsanación debe efectuarse dentro de los 3 días hábiles previos al cierre de matrícula regular."
      }
    ],
    tableData: [
      ["Paso 1", "Registro en el Portal", "Datos personales, carrera técnica y turno lectivo"],
      ["Paso 2", "Carga de Expediente", "Documentación en formato PDF legible y visada"],
      ["Paso 3", "Evaluación de Admisión", "Examen presencial de aptitud académica y vocacional"],
      ["Paso 4", "Publicación de Cuadro de Méritos", "Aprobación y emisión de Ficha Oficial de Matrícula"]
    ]
  },
  {
    fileName: "estudiante-matricula-demo.pdf",
    docCode: "SFA-G-MAT-2026",
    title: "GUÍA OFICIAL DE MATRÍCULA Y HORARIOS",
    subtitle: "Instrucciones de Consulta de Grupo, Asignaturas Curriculares y Horario de Turno Mañana",
    sections: [
      {
        title: "1. Consulta de Estado de Matrícula",
        content: "En el menú 'Información Personal' y 'Consulta Académica', el alumno puede corroborar su condición oficial de 'MATRICULADO', el ciclo lectivo y el grupo académico asignado (ej. EI-I-A)."
      },
      {
        title: "2. Horario Académico y Ambientes de Taller",
        content: "En la pestaña 'Mi Horario' se despliega la programación semanal completa de 08:00 AM a 01:00 PM. Se detallan las sesiones teóricas en aulas del Pabellón A y los talleres de máquinas y redes eléctricas en el Pabellón Técnico."
      },
      {
        title: "3. Módulos y Unidades Didácticas Curriculares",
        content: "En la sección 'Mis Cursos', el estudiante tiene acceso al sílabo oficial, plan de clases de 16 semanas y el enlace directo al aula virtual para descarga de guías de taller y materiales de laboratorio."
      },
      {
        title: "4. Correcciones y Rectificaciones",
        content: "Si el estudiante detecta algún desfase en su sección o en sus asignaturas registradas, podrá tramitar la rectificación gratuita ante Secretaría General dentro de la primera semana de clases."
      }
    ],
    tableData: [
      ["Turno Mañana", "08:00 AM - 10:00 AM", "Sesión Teórica / Laboratorio 1 (Pabellón A)"],
      ["Franja Libre", "10:00 AM - 11:00 AM", "Ventana de Autoestudio y Biblioteca Técnica"],
      ["Turno Mañana", "11:00 AM - 01:00 PM", "Taller de Máquinas Eléctricas / Redes BT"]
    ]
  },
  {
    fileName: "estudiante-procedimientos-demo.pdf",
    docCode: "SFA-MAN-PROC-2026",
    title: "MANUAL OFICIAL DE TRÁMITES Y SECRETARÍA",
    subtitle: "Procedimiento para la Expedición de Certificados, Constancias y Trámites Digitales",
    sections: [
      {
        title: "1. Mesa de Partes Digital y Solicitudes",
        content: "El estudiante matriculado o egresado ingresa a 'Trámites de Secretaría' y selecciona el documento requerido: Certificado de Estudios Oficial (Tasa S/ 50.00) o Constancia de Matrícula Institucional (Tasa S/ 30.00)."
      },
      {
        title: "2. Pago en Agente o Ventanilla Banco de la Nación",
        content: "El pago de la tasa oficial se efectúa mediante depósito o transferencia en la cuenta recaudadora del IESTP San Francisco de Asís (Código de Tasa Institucional en Banco de la Nación)."
      },
      {
        title: "3. Registro y Validación de Voucher por MAF",
        content: "El alumno digita en el portal el número de operación, fecha y monto exacto del comprobante. La Oficina de Administración y Finanzas (MAF) contrasta los datos con el reporte bancario para su validación oficial."
      },
      {
        title: "4. Emisión Digital con Firma y Sello Institucional",
        content: "Una vez validado el pago, Secretaría General genera el documento en formato PDF de alta resolución con firmas electrónicas de autoridades, sello institucional y código QR de verificación de autenticidad."
      }
    ],
    tableData: [
      ["Certificado de Estudios Oficial", "S/ 50.00", "Acredita asignaturas aprobadas y notas de los 6 ciclos"],
      ["Constancia de Matrícula Regular", "S/ 30.00", "Acredita condición activa para becas, pasajes y prácticas"],
      ["Constancia de No Adeudo", "S/ 20.00", "Requisito para trámite de egreso y titulación profesional"],
      ["Duplicado de Carné Institucional", "S/ 15.00", "Emisión por pérdida o deterioro de documento de identidad"]
    ]
  },
  {
    fileName: "estudiante-reconsideracion-demo.pdf",
    docCode: "SFA-PROC-REC-2026",
    title: "PROCEDIMIENTO OFICIAL DE RECONSIDERACIÓN ACADÉMICA",
    subtitle: "Pautas Institucionales para Solicitud de Revisión de Calificaciones y Procedimientos Disciplinarios",
    sections: [
      {
        title: "1. Ámbito de Aplicación y Legitimidad",
        content: "Todo estudiante con matrícula vigente tiene el derecho constitucional y normativo de solicitar la revisión formal de una calificación final o de una medida disciplinaria adoptada por su docente o coordinación de carrera."
      },
      {
        title: "2. Plazos y Canales de Presentación",
        content: "La solicitud de reconsideración debe presentarse mediante la Mesa de Partes Digital dentro de un plazo improrrogable de cinco (05) días hábiles contados a partir de la publicación oficial de la nota o resolución."
      },
      {
        title: "3. Requisitos de la Solicitud Formal",
        content: "Debe contener: Nombres completos, DNI, programa de estudios, unidad didáctica, fundamentación clara de los hechos controvertidos y pruebas documentales pertinentes (evaluaciones, informes técnicos de taller)."
      },
      {
        title: "4. Resolución y Notificación",
        content: "La Comisión Académica de Reconsideración evalúa el expediente y emite resolución motivada en un plazo máximo de siete (07) días hábiles, notificando formalmente al alumno a su correo institucional."
      }
    ],
    tableData: [
      ["Día 1 a 5", "Presentación de Expediente", "Ingreso formal de recurso por el portal digital"],
      ["Día 6 a 10", "Evaluación de Comisión", "Revisión técnica de instrumentos y pruebas con docente"],
      ["Día 11 a 12", "Emisión de Resolución", "Acta oficial aprobada por Dirección y Secretaría General"]
    ]
  },
  {
    fileName: "estudiante-traslado-demo.pdf",
    docCode: "SFA-REG-TRAS-2026",
    title: "REGLAMENTO OFICIAL DE TRASLADO INTERNO Y CONVALIDACIÓN",
    subtitle: "Normativa Institucional para Traslado de Carrera Técnica y Reconocimiento de Créditos",
    sections: [
      {
        title: "1. Objeto y Alcance del Traslado Interno",
        content: "El presente reglamento norma el procedimiento mediante el cual un estudiante regular del IESTP San Francisco de Asís solicita el cambio de programa formativo técnico (ej. de Contabilidad a Electricidad Industrial)."
      },
      {
        title: "2. Condiciones y Requisitos Básicos",
        content: "El solicitante debe contar con matrícula activa en el período inmediato anterior, haber aprobado como mínimo el Ciclo I completo (mínimo 20 créditos) y no registrar deudas ni sanciones disciplinarias vigentes."
      },
      {
        title: "3. Cuadro de Vacantes y Convalidación",
        content: "El traslado está supeditado a la existencia de vacantes aprobadas por Dirección General. La coordinación académica emite el cuadro de convalidaciones de asignaturas generales y modulares afines."
      },
      {
        title: "4. Resolución Directoral y Nueva Matrícula",
        content: "La aprobación formal se oficializa mediante Resolución Directoral, procediendo a la actualización de la ficha de matrícula y legajo académico en el nuevo plan de estudios ministerial."
      }
    ],
    tableData: [
      ["Requisito 1", "Aprobación Mínima de Ciclo I", "Haber acumulado al menos 20 créditos curriculares"],
      ["Requisito 2", "Inexistencia de Adeudos", "Constancia de no adeudo con MAF y Biblioteca Central"],
      ["Requisito 3", "Disponibilidad de Cupo", "Vacante acreditada en el turno y semestre solicitado"],
      ["Requisito 4", "Dictamen de Convalidación", "Evaluación técnica de contenidos y horas pedagógicas"]
    ]
  },
  {
    fileName: "estudiante-sanciones-demo.pdf",
    docCode: "SFA-REG-SANC-2026",
    title: "REGLAMENTO INSTITUCIONAL DE ÉTICA Y DISCIPLINA",
    subtitle: "Régimen Disciplinario, Deberes, Faltas y Sanciones Aplicables a la Comunidad Estudiantil",
    sections: [
      {
        title: "1. Principios y Cultura de Convivencia",
        content: "La comunidad educativa del IESTP San Francisco de Asís se rige por los principios de integridad, respeto mutuo, responsabilidad técnica en talleres y cuidado escrupuloso de los bienes públicos del Estado."
      },
      {
        title: "2. Tipificación de Faltas Disciplinarias",
        content: "Se clasifican en: Leves (tardanzas reiteradas, no portar carné institucional), Graves (desacato a docentes, daño a equipos de laboratorio por negligencia) y Muy Graves (fraude académico, suplantación, violencia física o verbal)."
      },
      {
        title: "3. Medidas Correctivas y Sanciones",
        content: "Las sanciones aplicables son: Amonestación verbal, Amonestación escrita registrada en legajo, Suspensión temporal de actividades presenciales (de 3 a 30 días) y Separación definitiva de la institución."
      },
      {
        title: "4. Garantía del Debido Proceso",
        content: "Ningún estudiante puede ser sancionado sin previa notificación formal de los cargos y sin el otorgamiento del plazo legal de cinco (05) días para la formulación de sus descargos ante el Comité de Ética."
      }
    ],
    tableData: [
      ["Falta Leve", "Amonestación Escrita", "Reiteración de inasistencias o negligencia menor en aula"],
      ["Falta Grave", "Suspensión de 3 a 15 Días", "Daño a maquinaria industrial o alteración del orden"],
      ["Falta Muy Grave", "Separación Definitiva", "Fraude en actas, violencia o falsificación de documentos"]
    ]
  },
  {
    fileName: "docente-gestion-curso-demo.pdf",
    docCode: "SFA-GUIA-DOC-2026",
    title: "GUÍA DOCENTE DE GESTIÓN ACADÉMICA Y SÍLABOS",
    subtitle: "Lineamientos para la Planificación Curricular de 16 Semanas y Publicación de Materiales",
    sections: [
      {
        title: "1. Elaboración del Sílabo Oficial",
        content: "Todo docente debe estructurar el sílabo de su unidad didáctica según el formato oficial MINEDU por competencias y capacidades terminales, presentándolo para visación ante la Dirección Académica."
      },
      {
        title: "2. Planificación de 16 Semanas Lectivas",
        content: "El semestre lectivo comprende exactamente 16 semanas efectivas de clases presenciales y virtuales, articulando sesiones teóricas, demostraciones prácticas y talleres de especialidad."
      },
      {
        title: "3. Aula Virtual y Publicación de Contenidos",
        content: "El docente es responsable de subir con antelación las guías de práctica de laboratorio, diapositivas y lecturas complementarias en la plataforma digital institucional."
      },
      {
        title: "4. Criterios de Evaluación Formativa",
        content: "Las fórmulas de ponderación oficial deben comunicarse en la primera sesión: Evaluaciones Parciales (EP: 20%), Trabajos de Taller (TR: 15%), Evidencias de Desempeño (EC: 15%) y Proyecto Final (PF: 50%)."
      }
    ],
    tableData: [
      ["Semanas 1 a 4", "Fase Introductoria", "Fundamentos teóricos y normas de seguridad en taller"],
      ["Semanas 5 a 8", "Desarrollo Modular I", "Prácticas de laboratorio y primera evaluación parcial"],
      ["Semanas 9 a 12", "Desarrollo Modular II", "Montajes de especialidad y avance de proyecto técnico"],
      ["Semanas 13 a 16", "Consolidación y Cierre", "Proyecto final, sustentación y entrega de actas oficiales"]
    ]
  },
  {
    fileName: "docente-asistencia-demo.pdf",
    docCode: "SFA-MAN-ASIS-2026",
    title: "MANUAL DOCENTE DE CONTROL Y ASISTENCIA",
    subtitle: "Procedimientos Digitales de Registro Semanal y Tratamiento de Inasistencias",
    sections: [
      {
        title: "1. Obligatoriedad del Registro Diario",
        content: "El docente debe pasar lista puntualmente al inicio de cada bloque horario matutino a través del Módulo Docente del portal SFA, consignando: Presente, Tarde o Falta."
      },
      {
        title: "2. Límite Ministerial de Inasistencias (30%)",
        content: "Según la normativa oficial de educación técnica superior, el estudiante que supere el 30% de inasistencias injustificadas queda automáticamente Desaprobado por Inasistencia (DPI)."
      },
      {
        title: "3. Justificación de Inasistencias",
        content: "Las justificaciones por motivos de salud (certificado médico MINSA/EsSalud) o fuerza mayor deben ser tramitadas por el estudiante ante Secretaría General para su validación en el sistema."
      },
      {
        title: "4. Auditoría y Reporte Mensual",
        content: "La Dirección Académica extrae los consolidados quincenales de asistencia para el cálculo de permanencia y remisión de informes estadísticos al Ministerio de Educación."
      }
    ],
    tableData: [
      ["Presente (P)", "Asistencia puntual al aula/taller", "Dentro de los primeros 10 minutos de tolerancia"],
      ["Tardanza (T)", "Ingreso posterior a tolerancia", "Acumulación de 3 tardanzas equivale a 1 falta"],
      ["Falta (F)", "Ausencia no justificada", "Cómputo directo al límite del 30% permitido"],
      ["Justificada (J)", "Validada por Secretaría", "No suma al porcentaje de inhabilitación DPI"]
    ]
  },
  {
    fileName: "docente-evaluaciones-demo.pdf",
    docCode: "SFA-DIR-EVAL-2026",
    title: "DIRECTIVA DOCENTE DE EVALUACIONES Y ACTAS",
    subtitle: "Procedimiento de Calificación en Escala Vigesimal y Cierre Oficial de Registros",
    sections: [
      {
        title: "1. Escala de Calificación Oficial",
        content: "La evaluación en los IESTP públicos del Perú se rige por la escala vigesimal de cero (00) a veinte (20). La nota mínima aprobatoria para cualquier unidad didáctica es trece (13)."
      },
      {
        title: "2. Registro Continuo en Plataforma",
        content: "Las calificaciones parciales deben ingresarse al sistema dentro de las 72 horas posteriores a la aplicación del instrumento de evaluación para conocimiento oportuno del estudiante."
      },
      {
        title: "3. Evaluación de Recuperación",
        content: "El estudiante con promedio final entre 10 y 12 tiene derecho a participar en el proceso de recuperación académica previa cancelación del derecho correspondiente."
      },
      {
        title: "4. Cierre y Firma Digital de Actas",
        content: "Al término de la semana 16, el docente efectúa el Cierre de Calificaciones en el sistema, generando el Acta Oficial que es suscrita digitalmente y remitida a Secretaría General."
      }
    ],
    tableData: [
      ["13 a 20", "Aprobado (AP)", "Competencia y capacidades terminales alcanzadas"],
      ["10 a 12", "Recuperación (REC)", "Derecho a evaluación extraordinaria de recuperación"],
      ["00 a 09", "Desaprobado (DP)", "Debe cursar nuevamente la unidad didáctica modular"],
      ["DPI", "Inhabilitado", "Desaprobado por acumulación de inasistencias (>30%)"]
    ]
  },
  {
    fileName: "docente-convivencia-demo.pdf",
    docCode: "SFA-REG-ETICA-2026",
    title: "REGLAMENTO DOCENTE DE ÉTICA Y CONVIVENCIA",
    subtitle: "Pautas de Conducta, Compromiso Docente y Gestión de Incidentes Académicos",
    sections: [
      {
        title: "1. Misión y Liderazgo Formativo",
        content: "El cuerpo docente del IESTP San Francisco de Asís es el pilar de la formación tecnológica del país, debiendo actuar con probidad, puntualidad y excelencia pedagógica en todo momento."
      },
      {
        title: "2. Trato Respetuoso y No Discriminación",
        content: "Se garantiza un ambiente de aprendizaje inclusivo, libre de discriminación por razón de origen, género, religión o condición socioeconómica, propiciando el desarrollo integral del alumno."
      },
      {
        title: "3. Prevención de Riesgos en Talleres",
        content: "Es deber inexcusable del docente velar por el cumplimiento estricto del uso de EPP (Equipos de Protección Personal) en los talleres de baja y media tensión y laboratorios de maquinaria."
      },
      {
        title: "4. Canalización de Incidentes",
        content: "Cualquier controversia o conflicto suscitado en el aula debe ser registrado en el cuaderno de incidencias y derivado a la Coordinación de Carrera para su resolución armónica."
      }
    ],
    tableData: [
      ["Compromiso 1", "Puntualidad Absoluta", "Inicio y término riguroso de cada bloque horario"],
      ["Compromiso 2", "Seguridad Ocupacional", "Supervisión constante en talleres con energía eléctrica"],
      ["Compromiso 3", "Transparencia Evaluativa", "Publicación oportuna y fundamentación de notas"],
      ["Compromiso 4", "Actualización Tecnológica", "Capacitación continua en nuevas tendencias del sector"]
    ]
  }
];

console.log("Generando 10 PDFs oficiales con logos, sellos y firmas...");

for (const guide of GUIDES_DATA) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Header Oficial
  drawHeader(pdf, guide.title, guide.docCode);

  // 2. Banner Título del Documento
  let currentY = 34;
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.setDrawColor(226, 232, 240); // slate-200
  pdf.roundedRect(margin, currentY, width - margin * 2, 18, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(128, 5, 33);
  pdf.text(guide.title, width / 2, currentY + 6.5, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(guide.subtitle, width / 2, currentY + 12, { align: "center" });

  currentY += 23;

  // 3. Secciones Informativas
  for (const sec of guide.sections) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.text(sec.title, margin, currentY);
    currentY += 4.2;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(51, 65, 85); // slate-700
    const splitContent = pdf.splitTextToSize(sec.content, width - margin * 2);
    pdf.text(splitContent, margin, currentY);
    currentY += splitContent.length * 3.6 + 3.5;
  }

  // 4. Tabla Oficial Resumen
  if (guide.tableData && guide.tableData.length > 0) {
    autoTable(pdf, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Etapa / Concepto", "Parámetro / Requisito", "Detalle de Aplicación Institucional"]],
      body: guide.tableData,
      theme: "striped",
      headStyles: {
        fillColor: [128, 5, 33],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "left",
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 6.8,
        textColor: [30, 41, 59],
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    currentY = pdf.lastAutoTable.finalY + 6;
  }

  // Si currentY se pasa del límite para firmas, ajustamos
  if (currentY > height - 48) {
    currentY = height - 48;
  }

  // 5. Cuadro de Certificación y Validez
  pdf.setFillColor(254, 252, 232); // amber-50
  pdf.setDrawColor(251, 191, 36); // amber-400
  pdf.roundedRect(margin, currentY, width - margin * 2, 8.5, 1.5, 1.5, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(180, 83, 9);
  pdf.text("CERTIFICACIÓN DE VALIDEZ Y CUMPLIMIENTO OBLIGATORIO", width / 2, currentY + 3.5, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text("Documento normativo aprobado mediante Resolución Directoral N° 0458-2005-ED. Aplicación obligatoria para el período lectivo 2026-I en el campus institucional.", width / 2, currentY + 6.5, { align: "center" });

  currentY += 12;

  // 6. Firmas y Sello Institucional
  drawSignaturesAndSeal(pdf, currentY);

  // 7. Pie de Página
  drawFooter(pdf);

  // Guardar archivo
  const outPath = path.join(outputDir, guide.fileName);
  fs.writeFileSync(outPath, Buffer.from(pdf.output("arraybuffer")));
  console.log(`✓ Generado: ${guide.fileName}`);
}

console.log("¡Los 10 PDFs fueron generados exitosamente con logos, firmas y sellos oficiales!");
