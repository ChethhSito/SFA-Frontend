export interface EfsrtCertificateParams {
  studentName: string;
  studentDni: string;
  program: string;
  companyName: string;
  ruc: string;
  department: string;
  supervisor: string;
  hours: number;
  startDate: string;
  endDate: string;
}

export function generateEfsrtCertificateSvgDataUrl(params: EfsrtCertificateParams): string {
  const {
    studentName = "Mateo Sebastián Quispe Rojas",
    studentDni = "74859612",
    program = "Electricidad Industrial",
    companyName = "ABB Perú S.A.",
    ruc = "20100123456",
    department = "Mantenimiento Eléctrico y Automatización Industrial",
    supervisor = "Ing. Roberto Chang Silva — Jefe de Planta",
    hours = 360,
    startDate = "2027-02-01",
    endDate = "2027-04-30",
  } = params;

  const formatDate = (isoStr: string) => {
    try {
      const [y, m, d] = isoStr.split("-");
      if (!y || !m || !d) return isoStr;
      const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
      const mIdx = parseInt(m, 10) - 1;
      return `${d} de ${months[mIdx] || m} de ${y}`;
    } catch {
      return isoStr;
    }
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1130" width="800" height="1130" style="background:#ffffff; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
    </filter>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF000F" />
      <stop offset="100%" stop-color="#C5000C" />
    </linearGradient>
  </defs>

  <!-- Marco A4 Institucional con doble línea -->
  <rect x="25" y="25" width="750" height="1080" fill="#ffffff" stroke="#0F172A" stroke-width="2" />
  <rect x="33" y="33" width="734" height="1064" fill="none" stroke="#D1D5DB" stroke-width="1" />

  <!-- Marca de agua central suave -->
  <g opacity="0.04" transform="translate(400, 560)">
    <circle r="180" fill="none" stroke="#0F172A" stroke-width="12" />
    <text text-anchor="middle" y="20" font-size="120" font-weight="900" fill="#0F172A" letter-spacing="10">ABB</text>
  </g>

  <!-- Encabezado Corporativo de la Empresa -->
  <!-- Logo de ABB -->
  <g transform="translate(60, 55)">
    <rect width="110" height="42" rx="4" fill="url(#headerGrad)" />
    <text x="55" y="31" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">ABB</text>
  </g>

  <g transform="translate(190, 60)">
    <text x="0" y="16" font-size="15" font-weight="900" fill="#0F172A" letter-spacing="0.5">${companyName.toUpperCase()}</text>
    <text x="0" y="32" font-size="10.5" font-weight="600" fill="#475569">DIVISIÓN INDUSTRIAL DE ELECTRIFICACIÓN Y SISTEMAS DE POTENCIA</text>
    <text x="0" y="46" font-size="9.5" font-weight="500" fill="#64748B">RUC: ${ruc} • Av. Argentina N° 3120, Lima • Tel: (01) 511-7000 • www.abb.com/pe</text>
  </g>

  <!-- Línea divisoria roja ABB -->
  <line x1="60" y1="120" x2="740" y2="120" stroke="#FF000F" stroke-width="3" />
  <line x1="60" y1="125" x2="740" y2="125" stroke="#0F172A" stroke-width="0.8" />

  <!-- Código y Fecha del Documento -->
  <text x="60" y="155" font-size="10" font-family="'Courier New', monospace" font-weight="700" fill="#64748B">EXPEDIENTE: EFSRT-2027-ABB-0482</text>
  <text x="740" y="155" font-size="10" font-weight="700" fill="#475569" text-anchor="end">Lima, 30 de abril de 2027</text>

  <!-- Título Oficial Centrado -->
  <g transform="translate(400, 210)">
    <text text-anchor="middle" y="0" font-size="21" font-weight="900" fill="#0F172A" letter-spacing="1">CONSTANCIA DE PRÁCTICAS PREPROFESIONALES</text>
    <text text-anchor="middle" y="24" font-size="13" font-weight="700" fill="#800521" letter-spacing="0.5">EXPERIENCIAS FORMATIVAS EN SITUACIONES REALES DE TRABAJO (EFSRT)</text>
    <line x1="-180" y1="36" x2="180" y2="36" stroke="#800521" stroke-width="1.5" />
  </g>

  <!-- Cuerpo del Documento Legal -->
  <g transform="translate(60, 290)">
    <text x="0" y="0" font-size="12" font-weight="800" fill="#0F172A" letter-spacing="0.5">A QUIEN CORRESPONDA:</text>

    <!-- Párrafo 1 -->
    <text x="0" y="32" font-size="11.5" font-weight="400" fill="#1E293B" line-height="1.6">
      Por intermedio de la presente, la empresa <tspan font-weight="800" fill="#0F172A">${companyName}</tspan>, identificada con RUC N° <tspan font-weight="800">${ruc}</tspan>,
    </text>
    <text x="0" y="52" font-size="11.5" font-weight="400" fill="#1E293B">
      deja constancia y certifica formalmente que el estudiante:
    </text>

    <!-- Tarjeta Destacada de Datos del Practicante -->
    <g transform="translate(0, 75)">
      <rect width="680" height="96" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
      <rect width="6" height="96" rx="3" fill="#800521" />

      <text x="25" y="28" font-size="10" font-weight="800" fill="#64748B" letter-spacing="0.5">ESTUDIANTE PRACTICANTE:</text>
      <text x="25" y="48" font-size="15" font-weight="900" fill="#0F172A">${studentName.toUpperCase()}</text>

      <text x="25" y="74" font-size="10.5" font-weight="600" fill="#475569">
        DNI: <tspan font-weight="800" font-family="'Courier New', monospace" fill="#0F172A">${studentDni}</tspan>  •  Programa: <tspan font-weight="800" fill="#0F172A">${program}</tspan>
      </text>

      <text x="440" y="28" font-size="10" font-weight="800" fill="#64748B" letter-spacing="0.5">INSTITUCIÓN EDUCATIVA:</text>
      <text x="440" y="48" font-size="12" font-weight="800" fill="#800521">IESTP San Francisco de Asís</text>
      <text x="440" y="74" font-size="10.5" font-weight="600" fill="#475569">Régimen: <tspan font-weight="800">Educación Superior Tecnológica</tspan></text>
    </g>

    <!-- Párrafo 2: Detalle de las Prácticas -->
    <text x="0" y="210" font-size="11.5" font-weight="400" fill="#1E293B">
      Ha realizado satisfactoriamente sus <tspan font-weight="700">Experiencias Formativas en Situaciones Reales de Trabajo (EFSRT)</tspan>
    </text>
    <text x="0" y="230" font-size="11.5" font-weight="400" fill="#1E293B">
      en nuestra planta industrial de Lima, habiéndose desempeñado en el área de:
    </text>

    <g transform="translate(0, 245)">
      <rect width="680" height="42" rx="6" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1" />
      <text x="20" y="26" font-size="12" font-weight="800" fill="#92400E">Área: ${department}</text>
    </g>

    <!-- Datos del Período y Horas -->
    <text x="0" y="322" font-size="11.5" font-weight="400" fill="#1E293B">
      Habiendo cumplido el período comprendido desde el <tspan font-weight="700">${formattedStart}</tspan> hasta el <tspan font-weight="700">${formattedEnd}</tspan>,
    </text>
    <text x="0" y="342" font-size="11.5" font-weight="400" fill="#1E293B">
      acumulando un total de:
    </text>

    <!-- Bloque de Horas y Evaluación -->
    <g transform="translate(0, 360)">
      <g transform="translate(0, 0)">
        <rect width="325" height="70" rx="8" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
        <text x="20" y="26" font-size="10" font-weight="800" fill="#166534" letter-spacing="0.5">TOTAL DE HORAS FORMATIVAS</text>
        <text x="20" y="54" font-size="22" font-weight="900" font-family="'Courier New', monospace" fill="#15803D">${hours} Horas Cronológicas</text>
      </g>

      <g transform="translate(355, 0)">
        <rect width="325" height="70" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <text x="20" y="26" font-size="10" font-weight="800" fill="#475569" letter-spacing="0.5">EVALUACIÓN DE DESEMPEÑO</text>
        <text x="20" y="54" font-size="18" font-weight="900" fill="#0F172A">19.0 / 20 <tspan font-size="12" font-weight="700" fill="#15803D">(Sobresaliente)</tspan></text>
      </g>
    </g>

    <!-- Párrafo 3: Conducta y Solvencia Técnica -->
    <text x="0" y="470" font-size="11" font-weight="400" fill="#334155" line-height="1.5">
      Durante el desarrollo de sus prácticas, el estudiante demostró una sólida formación técnica, alto compromiso,
    </text>
    <text x="0" y="488" font-size="11" font-weight="400" fill="#334155">
      cumplimiento riguroso de las normas de seguridad e higiene industrial y excelente disposición para el trabajo en equipo.
    </text>

    <text x="0" y="525" font-size="11" font-weight="400" fill="#334155">
      Se expide la presente constancia a solicitud del interesado para los fines de titulación técnica y acreditación curricular.
    </text>
  </g>

  <!-- Sección de Firmas, Sellos y QR -->
  <g transform="translate(60, 890)">
    <!-- Sello circular de la empresa en azul -->
    <g transform="translate(90, 60)">
      <circle r="46" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-dasharray="3,1" />
      <circle r="42" fill="none" stroke="#1D4ED8" stroke-width="1" />
      <path id="circlePath" d="M -34,0 A 34,34 0 1,1 34,0 A 34,34 0 1,1 -34,0" fill="none" />
      <text font-size="6.5" font-weight="900" fill="#1D4ED8" letter-spacing="1">
        <textPath href="#circlePath">ABB PERÚ S.A. • GERENCIA DE PLANTA • </textPath>
      </text>
      <text text-anchor="middle" y="-2" font-size="8" font-weight="900" fill="#1D4ED8">AUTORIZADO</text>
      <text text-anchor="middle" y="10" font-size="6.5" font-weight="700" fill="#1D4ED8">RUC 20100123456</text>
      <text text-anchor="middle" y="20" font-size="6" font-weight="600" fill="#1D4ED8">30/04/2027</text>
    </g>

    <!-- Firma del Supervisor en azul -->
    <g transform="translate(320, 20)">
      <!-- Trazo simulado de firma manuscrita con pluma -->
      <path d="M 10 35 Q 35 5 70 30 T 130 20 T 170 38 Q 185 10 205 32 Q 220 50 160 48 T 80 50" fill="none" stroke="#1E40AF" stroke-width="2" stroke-linecap="round" />
      <path d="M 50 30 Q 90 -5 110 35" fill="none" stroke="#1E40AF" stroke-width="1.6" stroke-linecap="round" />
      <path d="M 140 25 Q 165 5 180 30" fill="none" stroke="#1E40AF" stroke-width="1.8" stroke-linecap="round" />

      <!-- Posfirma -->
      <line x1="0" y1="58" x2="240" y2="58" stroke="#334155" stroke-width="1" />
      <text x="120" y="73" font-size="11" font-weight="900" fill="#0F172A" text-anchor="middle">${supervisor}</text>
      <text x="120" y="87" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">CIP N° 184520 • Gerencia de Mantenimiento y Operaciones</text>
      <text x="120" y="100" font-size="8.5" font-weight="600" fill="#64748B" text-anchor="middle">${companyName}</text>
    </g>

    <!-- Código QR de verificación digital -->
    <g transform="translate(590, 15)">
      <rect width="80" height="80" fill="#ffffff" stroke="#CBD5E1" stroke-width="1" rx="4" />
      <!-- Patrones QR simulados precisos -->
      <rect x="6" y="6" width="22" height="22" fill="#0F172A" />
      <rect x="9" y="9" width="16" height="16" fill="#ffffff" />
      <rect x="12" y="12" width="10" height="10" fill="#0F172A" />

      <rect x="52" y="6" width="22" height="22" fill="#0F172A" />
      <rect x="55" y="9" width="16" height="16" fill="#ffffff" />
      <rect x="58" y="12" width="10" height="10" fill="#0F172A" />

      <rect x="6" y="52" width="22" height="22" fill="#0F172A" />
      <rect x="9" y="55" width="16" height="16" fill="#ffffff" />
      <rect x="12" y="58" width="10" height="10" fill="#0F172A" />

      <!-- Módulos de datos -->
      <rect x="34" y="10" width="8" height="8" fill="#0F172A" />
      <rect x="34" y="24" width="8" height="8" fill="#0F172A" />
      <rect x="34" y="40" width="14" height="6" fill="#0F172A" />
      <rect x="14" y="34" width="12" height="8" fill="#0F172A" />
      <rect x="52" y="34" width="8" height="12" fill="#0F172A" />
      <rect x="66" y="40" width="6" height="18" fill="#0F172A" />
      <rect x="34" y="56" width="10" height="14" fill="#0F172A" />
      <rect x="50" y="56" width="16" height="8" fill="#0F172A" />

      <text x="40" y="94" font-size="7" font-weight="700" fill="#64748B" text-anchor="middle" font-family="'Courier New', monospace">ID: EFSRT-${studentDni}</text>
    </g>
  </g>

  <!-- Pie de Página Ministerial / Seguridad -->
  <line x1="60" y1="1040" x2="740" y2="1040" stroke="#CBD5E1" stroke-width="0.8" />
  <text x="60" y="1058" font-size="8" font-weight="600" fill="#94A3B8">
    DOCUMENTO VINCULADO AL EXPEDIENTE DE TITULACIÓN • SISTEMA DE GESTIÓN ACADÉMICA SFA • LEY DE INSTITUTOS Y ESCUELAS DE EDUCACIÓN SUPERIOR N° 30512
  </text>
  <text x="740" y="1058" font-size="8" font-weight="700" fill="#64748B" text-anchor="end">
    PÁGINA 1 DE 1
  </text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
