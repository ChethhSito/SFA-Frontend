export interface SuggestedQuestion {
  question: string;
  answer: string;
}

export const SFA_INSTITUTIONAL_TIPS = [
  "👋 ¡Hola! Soy SFABot. ¿Tienes dudas sobre la Admisión 2026-I? Haz clic aquí.",
  "🎓 ¡Asegura tu futuro! Estudia carreras técnicas de 3 años con Título a Nombre de la Nación.",
  "⚡ ¿Te apasiona la tecnología? Conoce nuestra carrera de Electricidad Industrial.",
  "📊 ¿Te gustan los negocios y las finanzas? Revisa el plan de estudios de Contabilidad.",
  "💡 ¡El proceso de Admisión 2026-I ya está abierto! Regístrate desde la web.",
  "📜 Recuerda que debes subir tu DNI y Certificado de Secundaria a tu Expediente Digital.",
  "💳 Recuerda validar tu voucher en la pestaña 'Estado de Pago' para tu examen.",
  "🏛️ ¿Necesitas atención presencial? Te atendemos de Lunes a Viernes de 8 AM a 6 PM.",
  "💬 Haz clic aquí en cualquier momento para hacer tus preguntas a SFABot."
];

export const SFA_DEFAULT_QUESTIONS: SuggestedQuestion[] = [
  {
    question: "🎓 ¿Qué carreras ofrece el IESTP San Francisco de Asís?",
    answer: "Ofrecemos **carreras profesionales técnicas de 3 años (6 ciclos)** con **Título a Nombre de la Nación**:\n\n- ⚡ **Electricidad Industrial**: Instalaciones eléctricas, automatización PLC, subestaciones y tableros de potencia.\n\n- 📊 **Contabilidad**: Auditoría financiera, NIIF, tributación corporativa y software contable especializado."
  },
  {
    question: "📝 ¿Cuáles son los requisitos para la Admisión 2026-I?",
    answer: "Para tu inscripción debes presentar los siguientes **5 requisitos obligatorios**:\n\n1. **Copia legible de DNI** (PDF o Imagen)\n2. **Certificado de Estudios Secundarios** completo\n3. **Partida de Nacimiento** oficial\n4. **Foto tamaño carné** a color\n5. **Voucher de Pago** por derecho de admisión"
  },
  {
    question: "💳 ¿Cómo registro o valido mi pago de admisión?",
    answer: "Sigue estos sencillos pasos:\n\n1. Ingresa a la **Intranet Académica** con tu DNI.\n2. Ve a la pestaña **'Estado de Pago'**.\n3. Registra el **N° de Operación** o adjunta el voucher emitido por caja/banco.\n\n> El equipo **MAF** validará tu pago en menos de **24 horas hábiles**. 💰"
  },
  {
    question: "📄 ¿Cómo funciona el Expediente Digital de Admisión?",
    answer: "Desde tu panel de **Postulante** en la pestaña **'Expediente Digital'**, puedes subir tus 4 documentos obligatorios (DNI, Certificado, Partida y Foto).\n\nSecretaría Académica verificará y aprobará tus archivos con **indicador de estado en tiempo real**. 📁"
  },
  {
    question: "📊 ¿Cuáles son los requisitos para la Titulación Profesional?",
    answer: "Para obtener el **Título Profesional a Nombre de la Nación** debes cumplir:\n\n- 📚 **Aprobar los 6 ciclos académicos** (100% de créditos)\n- 💼 **Acreditar 450 horas de Prácticas Pre-Profesionales** (EFSRT)\n- 🌐 **Constancia de idioma extranjero** (Inglés Básico)\n- 🏆 **Sustentación aprobatoria** del Proyecto Técnico Final"
  },
  {
    question: "🏛️ ¿Dónde queda ubicado el instituto y cuál es el horario?",
    answer: "📍 **Dirección**: Av. San Francisco 450, Lima, Perú.\n\n⏰ **Horario de Atención** (Presencial y Virtual):\nLunes a Viernes de 8:00 AM a 6:00 PM\n\n📞 **Central Telefónica**: (01) 456-7890\n✉️ **Correo**: contacto@iestpsfa.edu.pe"
  },
  {
    question: "🔑 ¿Cómo accedo a la Intranet Académica?",
    answer: "1. Haz clic en el botón **'Intranet Académica'** en la barra superior del portal.\n2. Ingresa tu **DNI** o código institucional y tu clave.\n3. Si eres postulante nuevo, tu clave inicial por defecto es **'clave123'**. 🔐"
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
