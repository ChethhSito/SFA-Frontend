// Generador de comprobantes digitales de recaudación bancaria (Banco de la Nación)
export interface VoucherTicketData {
  cycle: string;
  period: string;
  op: string;
  date: string;
  amount?: string;
  studentName?: string;
  dni?: string;
  code?: string;
  program?: string;
}

export function generateVoucherSvgDataUrl(data: VoucherTicketData): string {
  const {
    cycle,
    period,
    op,
    date,
    amount = "S/ 250.00",
    studentName = "QUISPE ROJAS, MATEO SEBASTIÁN",
    dni = "74859612",
    code = "202710001",
    program = "ELECTRICIDAD INDUSTRIAL"
  } = data;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 620" width="420" height="620">
    <style>
      .mono { font-family: 'Courier New', Courier, monospace; }
      .red { fill: #800521; }
      .dark { fill: #0f172a; }
      .muted { fill: #64748b; }
      .blue { fill: #1e40af; }
    </style>
    <!-- Fondo y marco de voucher térmico -->
    <rect width="420" height="620" fill="#f8fafc"/>
    <rect x="12" y="12" width="396" height="596" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    
    <!-- Encabezado Oficial Banco de la Nación -->
    <text x="210" y="48" text-anchor="middle" class="mono red" font-size="19" font-weight="900" letter-spacing="1">BANCO DE LA NACIÓN</text>
    <text x="210" y="66" text-anchor="middle" class="mono muted" font-size="9.5" font-weight="700">EL BANCO DE TODOS • RUC: 20100030595</text>
    <text x="210" y="80" text-anchor="middle" class="mono dark" font-size="10" font-weight="800">COMPROBANTE DE PAGO / RECAUDACIÓN OFICIAL</text>
    <line x1="30" y1="92" x2="390" y2="92" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/>
    
    <!-- Datos de Agencia y Operación -->
    <text x="30" y="110" class="mono muted" font-size="9">AGENCIA:</text>
    <text x="105" y="110" class="mono dark" font-size="9" font-weight="700">0048 - LIMA CENTRO</text>
    <text x="245" y="110" class="mono muted" font-size="9">CAJERO:</text>
    <text x="315" y="110" class="mono dark" font-size="9" font-weight="700">0842-V03</text>
    
    <text x="30" y="127" class="mono muted" font-size="9">FECHA:</text>
    <text x="105" y="127" class="mono dark" font-size="9" font-weight="700">${date}</text>
    <text x="245" y="127" class="mono muted" font-size="9">HORA:</text>
    <text x="315" y="127" class="mono dark" font-size="9" font-weight="700">10:42:18</text>
    
    <text x="30" y="144" class="mono muted" font-size="9">TERMINAL:</text>
    <text x="105" y="144" class="mono dark" font-size="9" font-weight="700">ATM-BN-7421</text>
    <text x="245" y="144" class="mono muted" font-size="9">TRANSACCIÓN:</text>
    <text x="315" y="144" class="mono dark" font-size="9" font-weight="700">004812</text>
    <line x1="30" y1="156" x2="390" y2="156" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/>
    
    <!-- Entidad y Concepto -->
    <text x="30" y="174" class="mono muted" font-size="8.5">ENTIDAD RECAUDADORA:</text>
    <text x="30" y="190" class="mono red" font-size="12" font-weight="900">IESTP SAN FRANCISCO DE ASÍS</text>
    <text x="30" y="208" class="mono muted" font-size="9">CÓD. RECAUDO INSTITUCIONAL: <tspan class="dark" font-weight="700">TASA-SFA-04218</tspan></text>
    <text x="30" y="225" class="mono muted" font-size="9">CONCEPTO: <tspan class="dark" font-weight="800">MATRÍCULA REGULAR (${cycle.toUpperCase()})</tspan></text>
    <line x1="30" y1="237" x2="390" y2="237" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/>
    
    <!-- Datos del Alumno -->
    <text x="30" y="257" class="mono muted" font-size="9">ALUMNO:</text>
    <text x="145" y="257" class="mono dark" font-size="9.5" font-weight="800">${studentName}</text>
    <text x="30" y="275" class="mono muted" font-size="9">DNI TITULAR:</text>
    <text x="145" y="275" class="mono dark" font-size="9.5" font-weight="800">${dni}</text>
    <text x="30" y="293" class="mono muted" font-size="9">CÓD. ESTUDIANTE:</text>
    <text x="145" y="293" class="mono dark" font-size="9.5" font-weight="800">${code}</text>
    <text x="30" y="311" class="mono muted" font-size="9">PROGRAMA:</text>
    <text x="145" y="311" class="mono dark" font-size="9.5" font-weight="800">${program}</text>
    <text x="30" y="329" class="mono muted" font-size="9">N° OPERACIÓN:</text>
    <text x="145" y="329" class="mono red" font-size="10.5" font-weight="900">${op}</text>
    <line x1="30" y1="341" x2="390" y2="341" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/>
    
    <!-- Importe y Liquidación -->
    <text x="30" y="364" class="mono muted" font-size="10">IMPORTE TOTAL PAGADO:</text>
    <text x="390" y="384" text-anchor="end" class="mono red" font-size="28" font-weight="900">${amount}</text>
    <text x="210" y="405" text-anchor="middle" class="mono muted" font-size="8.5">SON: DOSCIENTOS CINCUENTA Y 00/100 SOLES</text>
    
    <text x="30" y="430" class="mono muted" font-size="8.5">FORMA DE PAGO: <tspan class="dark" font-weight="700">EFECTIVO M/N</tspan></text>
    <text x="30" y="445" class="mono muted" font-size="8.5">CANAL: <tspan class="dark" font-weight="700">VENTANILLA BN - AGENCIA</tspan></text>
    
    <!-- Sello Oficial Caja Conforme -->
    <g transform="translate(295, 450) rotate(-10)">
      <circle cx="0" cy="0" r="46" fill="#eff6ff" fill-opacity="0.7" stroke="#1d4ed8" stroke-width="2" stroke-dasharray="5,2"/>
      <circle cx="0" cy="0" r="41" fill="none" stroke="#1d4ed8" stroke-width="1"/>
      <text x="0" y="-23" text-anchor="middle" class="mono blue" font-size="7.5" font-weight="800">BANCO DE LA NACIÓN</text>
      <text x="0" y="-13" text-anchor="middle" class="mono blue" font-size="6.5" font-weight="700">AGENCIA 0048 LIMA</text>
      <text x="0" y="4" text-anchor="middle" class="mono blue" font-size="11" font-weight="900">PAGADO / CAJA</text>
      <text x="0" y="19" text-anchor="middle" class="mono blue" font-size="8.5" font-weight="800">${date}</text>
      <text x="0" y="30" text-anchor="middle" class="mono blue" font-size="7.5" font-weight="800">CONFORME</text>
    </g>
    
    <!-- Código de Barras Oficial -->
    <g transform="translate(45, 510)">
      <rect x="0" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="5" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="9" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="15" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="20" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="28" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="33" y="0" width="3.5" height="30" fill="#0f172a"/>
      <rect x="40" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="44" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="52" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="57" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="64" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="68" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="74" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="82" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="87" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="94" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="98" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="104" y="0" width="5.5" height="30" fill="#0f172a"/>
      <rect x="113" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="118" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="125" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="129" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="135" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="143" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="148" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="155" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="160" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="166" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="174" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="179" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="186" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="190" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="196" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="204" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="209" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="216" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="220" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="226" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="234" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="239" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="246" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="250" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="256" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="264" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="269" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="276" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="280" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="286" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="294" y="0" width="2" height="30" fill="#0f172a"/>
      <rect x="299" y="0" width="4" height="30" fill="#0f172a"/>
      <rect x="306" y="0" width="1.5" height="30" fill="#0f172a"/>
      <rect x="310" y="0" width="3" height="30" fill="#0f172a"/>
      <rect x="316" y="0" width="5" height="30" fill="#0f172a"/>
      <rect x="324" y="0" width="6" height="30" fill="#0f172a"/>
    </g>
    <text x="210" y="555" text-anchor="middle" class="mono muted" font-size="8.5">*${op}*${dni}*25000*</text>
    <text x="210" y="580" text-anchor="middle" class="mono muted" font-size="7.5" font-weight="700">CONSERVE SU COMPROBANTE - VALIDEZ ANTE SECRETARÍA ACADÉMICA</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
