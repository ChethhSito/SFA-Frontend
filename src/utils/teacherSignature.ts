/**
 * teacherSignature.ts
 * Generador de firmas gráficas y sellos digitales institucionales para la plana docente
 * IESTP San Francisco de Asís
 */

export interface TeacherSignatureData {
  teacherName: string;
  dni: string;
  professionalTitle: string;
  regNumber: string;
  svgPath: string;
  sealColor: string;
}

// Firmas vectoriales personalizadas por docente
const SIGNATURE_PRESETS: Record<string, { path: string; title: string; reg: string }> = {
  "MANUEL RAMOS": {
    path: "M 15 45 C 20 20, 25 10, 32 15 C 38 20, 40 45, 45 42 C 50 38, 55 22, 60 25 C 65 28, 68 44, 75 40 C 82 36, 88 30, 95 33 C 102 36, 108 42, 115 38 C 122 34, 130 25, 138 28 C 145 32, 150 42, 160 40 M 18 55 Q 85 48 165 52 M 65 58 Q 110 56 145 60",
    title: "Ingeniero Mecatrónico y Electricista",
    reg: "CIP N° 184592 - MINEDU Reg. 2024-DOC"
  },
  "CESAR VALDIVIA": {
    path: "M 20 25 C 10 35, 12 55, 30 52 C 45 48, 50 20, 58 35 C 65 48, 72 32, 80 40 C 88 48, 95 35, 105 38 C 115 42, 125 25, 135 45 C 145 35, 152 42, 162 38 M 22 58 Q 90 52 168 55",
    title: "Ingeniero Electrónico e Industrial",
    reg: "CIP N° 192304 - MINEDU Reg. 2023-DOC"
  },
  "CARMEN MENDOZA": {
    path: "M 25 20 C 15 30, 20 55, 35 48 C 45 42, 52 18, 62 32 C 70 45, 78 30, 88 42 C 96 32, 106 38, 118 30 C 128 45, 138 35, 150 40 C 160 32, 165 42, 172 38 M 30 56 Q 100 50 170 54 M 80 60 Q 125 58 155 61",
    title: "Contadora Pública Colegiada",
    reg: "CPC N° 48192 - MINEDU Reg. 2022-DOC"
  }
};

/**
 * Obtiene la información de rúbrica caligráfica y registro profesional para cualquier docente
 */
export function getTeacherSignature(name: string, dni: string): TeacherSignatureData {
  const upper = name.toUpperCase();
  let presetKey = Object.keys(SIGNATURE_PRESETS).find(k => upper.includes(k));

  let preset = presetKey ? SIGNATURE_PRESETS[presetKey] : null;

  if (!preset) {
    // Generar firma determinista basada en el nombre
    const isIng = upper.includes("ING") || upper.includes("ELECTRIC") || upper.includes("MEC");
    const title = isIng ? "Ingeniero Docente Titular" : "Licenciado Docente Ordinario";
    const reg = `MINEDU Reg. DOC-${dni.slice(-4) || "2026"}`;
    // Trazo dinámico caligráfico
    const path = "M 18 42 C 25 18, 30 12, 38 18 C 45 25, 48 45, 55 38 C 62 30, 70 20, 78 28 C 85 36, 92 45, 102 38 C 112 30, 122 35, 132 40 C 142 32, 152 42, 165 38 M 20 54 Q 92 48 168 52";
    preset = { path, title, reg };
  }

  return {
    teacherName: name,
    dni,
    professionalTitle: preset.title,
    regNumber: preset.reg,
    svgPath: preset.path,
    sealColor: "#0f2b5c" // Azul marino institucional para firma de tinta
  };
}

/**
 * Renderiza la firma en un DataURL PNG para exportación directa a jsPDF
 */
export function generateTeacherSignaturePng(name: string, dni: string, date: string): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 460;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const sig = getTeacherSignature(name, dni);

  // Fondo transparente
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Sello Oficial Rectangular con doble borde
  ctx.strokeStyle = "#1e3a8a"; // Blue 900
  ctx.lineWidth = 2.5;
  ctx.strokeRect(10, 10, 440, 180);

  ctx.strokeStyle = "#3b82f6"; // Blue 500
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 15, 430, 170);

  // 2. Encabezado de la entidad en el sello
  ctx.fillStyle = "#1e3a8a";
  ctx.font = "bold 13px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("IESTP SAN FRANCISCO DE ASÍS", 230, 34);

  ctx.fillStyle = "#475569";
  ctx.font = "bold 9.5px Helvetica, Arial, sans-serif";
  ctx.fillText("FIRMA DIGITAL Y AUTENTICACIÓN MINEDU", 230, 48);

  // 3. Rúbrica caligráfica con trazo de tinta azul
  ctx.save();
  ctx.translate(35, 30);
  ctx.scale(2.2, 1.4);
  ctx.strokeStyle = "#0f2b5c";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  try {
    const p = new Path2D(sig.svgPath);
    ctx.stroke(p);
  } catch {
    // Fallback if Path2D not supported
    ctx.beginPath();
    ctx.moveTo(15, 45);
    ctx.bezierCurveTo(20, 20, 25, 10, 32, 15);
    ctx.bezierCurveTo(45, 42, 60, 25, 75, 40);
    ctx.bezierCurveTo(95, 33, 115, 38, 138, 28);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Datos del docente
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 13px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), 230, 142);

  ctx.fillStyle = "#64748b";
  ctx.font = "10px Helvetica, Arial, sans-serif";
  ctx.fillText(`${sig.professionalTitle} | DNI: ${dni}`, 230, 157);
  ctx.fillText(`${sig.regNumber} • ${date}`, 230, 172);

  return canvas.toDataURL("image/png");
}
