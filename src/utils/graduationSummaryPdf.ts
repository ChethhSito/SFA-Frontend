import type { Graduation } from "../types";
export async function graduationSummaryPdf(name: string, dni: string, program: string, record: Graduation, date: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;
  const line = (text: string, bold = false, size = 10) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size);
    for (const part of pdf.splitTextToSize(text, 180)) {
      if (y > 273) { pdf.addPage(); y = 20; }
      pdf.text(part, 15, y); y += size * 0.5;
    }
    y += 4;
  };
  pdf.setTextColor(128, 5, 33); line("RESUMEN DE EXPEDIENTE ACADÉMICO", true, 15);
  pdf.setTextColor(23, 32, 51);
  line("IESTP San Francisco de Asís"); line(name, true, 12); line(`DNI: ${dni}`); line(`Programa: ${program}`);
  line(`Generado: ${date} (Lima)`); line(`Estado registrado: ${record.status} | Etapa: ${record.step}`, true);
  const labels = { solicitud: "Solicitud", constanciaEgresado: "Constancia de egresado", practicasPre: "Prácticas preprofesionales", pagoDerecho: "Pago del derecho" };
  line("Requisitos revisados", true, 12);
  for (const [key, label] of Object.entries(labels)) line(`${label}: ${record.docsChecked[key as keyof typeof labels] ? "Revisado" : "Pendiente"}`);
  line("Observaciones", true, 12); line(record.obs || "Sin observaciones");
  line("Resumen administrativo de datos registrados. No es un certificado ni una resolución de titulación y no acredita firma digital.", false, 9);
  const count = pdf.getNumberOfPages();
  for (let page = 1; page <= count; page++) { pdf.setPage(page); pdf.setFontSize(8); pdf.text(`Página ${page} de ${count}`, 195, 287, { align: "right" }); }
  return pdf;
}
