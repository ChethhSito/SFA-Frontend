export interface SuggestedQuestion {
  question: string;
  answer: string;
}

export const SFA_INSTITUTIONAL_TIPS = [
  "💡 ¡El proceso de Admisión 2026-I ya está abierto! Regístrate desde el botón 'Inscribirse Ahora'.",
  "📜 Recuerda que debes subir tu DNI y Certificado de Secundaria en PDF a tu Expediente Digital.",
  "⚡ La carrera de Electricidad Industrial dura 3 años (6 ciclos) con Título a Nombre de la Nación.",
  "📊 Contabilidad te capacita en auditoría financiera, NIIF, tributación y gestión empresarial.",
  "🎓 Todos nuestros títulos son Oficiales y validados ante el Ministerio de Educación (MINEDU).",
  "💳 Recuerda validar tu voucher de pago en la pestaña 'Estado de Pago' para rendir tu examen.",
  "🏛️ La Secretaría Académica atiende de Lunes a Viernes de 8:00 AM a 6:00 PM."
];

export const SFA_DEFAULT_QUESTIONS: SuggestedQuestion[] = [
  {
    question: "🎓 ¿Qué carreras ofrece el IESTP San Francisco de Asís?",
    answer: "Ofrecemos carreras profesionales técnicas de 3 años (6 ciclos) con Título a Nombre de la Nación: 1) Electricidad Industrial (montaje, PLC, subestaciones) y 2) Contabilidad (finanzas, NIIF, tributación). 🏛️"
  },
  {
    question: "📝 ¿Cuáles son los requisitos para la Admisión 2026-I?",
    answer: "Los requisitos son: 1) Certificado de Educación Secundaria en PDF, 2) Copia legible de DNI, 3) Partida de Nacimiento, 4) Foto tamaño carné a color, y 5) Voucher de Pago por derecho de admisión. 📄"
  },
  {
    question: "💳 ¿Cómo registro o valido mi pago de admisión?",
    answer: "Ingresa a la Intranet con tu DNI, ve a la pestaña 'Estado de Pago' y registra el número de operación o sube el voucher emitido en caja/banco. El equipo MAF lo validará en menos de 24 horas. 💰"
  },
  {
    question: "📄 ¿Cómo funciona el Expediente Digital de Admisión?",
    answer: "Desde tu panel de Postulante en la pestaña 'Expediente Digital', puedes subir tus 4 documentos obligatorios. Secretaría Académica verificará y aprobará tus archivos en tiempo real. 📁"
  },
  {
    question: "📊 ¿Cuáles son los requisitos para la Titulación Profesional?",
    answer: "Debes haber aprobado los 6 ciclos lectivos, acreditar 450 horas de Prácticas Pre-Profesionales en empresas del sector, idioma inglés básico y sustentación del proyecto técnico final. 🏆"
  },
  {
    question: "🏛️ ¿Dónde queda ubicado el instituto y cuál es el horario?",
    answer: "Nuestro campus está ubicado en Av. San Francisco 450, Lima. Atención presencial y virtual: Lunes a Viernes de 8:00 am a 6:00 pm. Teléfono: (01) 456-7890. 📍"
  },
  {
    question: "🔑 ¿Cómo accedo a la Intranet Académica?",
    answer: "Haz clic en 'Intranet Académica' en la barra superior del portal. Ingresa tu DNI o código institucional y tu contraseña. Si eres postulante nuevo, tu clave por defecto es 'clave123'. 🔐"
  }
];

export const SFA_SYSTEM_CONTEXT = `
  Eres "SFABot", el asistente virtual inteligente oficial del IESTP San Francisco de Asís.
  CONTEXTO DE LA INSTITUCIÓN:
  - El Instituto de Educación Superior Tecnológico Público "San Francisco de Asís" ofrece educación técnica superior de calidad con Titulación a Nombre de la Nación otorgada según las normas del Ministerio de Educación (MINEDU) del Perú.
  - Carreras Principales:
    1. Electricidad Industrial (6 ciclos / 3 años): Instalaciones eléctricas, automatización PLC, tableros industriales, máquinas de potencia.
    2. Contabilidad (6 ciclos / 3 años): Auditoría financiera, costos, NIIF, software contable, tributación corporativa.
  - Proceso de Admisión 2026-I:
    - Etapas: Pre-inscripción en portal -> Pago de admisión -> Subida de expediente digital (DNI, Certificado, Partida, Foto) -> Examen de Evaluación -> Matrícula.
  
  TU ROL Y REGLAS DE RESPUESTA:
  - Responde de forma profesional, amable, motivadora e institucional.
  - Usa emojis relacionados con educación, tecnología y eficiencia (🎓, ⚡, 📊, 🏛️, 📄, 💡).
  - Mantén las respuestas claras, concisas y orientadas al usuario (máximo 3 párrafos o puntos clave).
  - Si el usuario consulta sobre procesos académicos, indícale la pestaña exacta en la Intranet (Ejemplo: "Pestaña Estado de Pago", "Pestaña Expediente Digital").
  - Si te preguntan sobre temas totalmente ajenos al instituto o educación, responde amablemente redirigiendo hacia la oferta académica de la institución.
`;
