export interface HistoryPdfStudent {
  dni: string;
  name: string;
  lastName: string;
  academicStatus: string;
}
export interface HistoryPdfRow {
  code: string;
  courseName: string;
  credits: number | null;
  count: number;
  grade: number | null;
}

export async function createHistoryPdf(student: HistoryPdfStudent, program: string, rows: HistoryPdfRow[], date: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({ title: `Historial académico - ${student.dni}`, author: "IESTP San Francisco de Asís" });
  const width = pdf.internal.pageSize.getWidth();
  const margin = 14;
  let y = 19;
  const paragraph = (value: string, size = 10, bold = false) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(value.replace(/[\r\n\t]+/g, " "), width - margin * 2);
    pdf.text(lines, margin, y);
    y += lines.length * size * 0.44 + 3;
  };
  pdf.setTextColor(128, 5, 33);
  paragraph("HISTORIAL ACADÉMICO", 17, true);
  pdf.setTextColor(23, 32, 51);
  paragraph("IESTP San Francisco de Asís", 10);
  paragraph(`${student.lastName}, ${student.name}`, 12, true);
  paragraph(`DNI: ${student.dni} | Estado: ${student.academicStatus}`);
  paragraph(`Programa: ${program}`);
  paragraph(`Generado: ${date} (Lima). Registros históricos, sin filtro de semestre.`, 9);
  paragraph("Promedio simple de calificaciones guardadas por curso. NR: sin calificación registrada. Este resumen no sustituye un acta o certificado oficial.", 9);
  autoTable(pdf, {
    startY: y + 2,
    margin: { left: margin, right: margin, top: 32, bottom: 20 },
    head: [["Código", "Curso", "Créditos", "Notas", "Promedio /20"]],
    body: rows.length ? rows.map((row) => [row.code, row.courseName, row.credits ?? "Sin datos", row.count, row.grade ?? "NR"])
      : [[{ content: "No hay cursos o calificaciones registradas para mostrar.", colSpan: 5 }]],
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.8, overflow: "linebreak", valign: "middle" },
    headStyles: { fillColor: [23, 32, 51], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 0: { cellWidth: 23 }, 1: { cellWidth: 91 }, 2: { cellWidth: 21 }, 3: { cellWidth: 18 }, 4: { cellWidth: 29 } },
    rowPageBreak: "avoid",
    didDrawPage: () => {
      if (pdf.getCurrentPageInfo().pageNumber === 1) return;
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(128, 5, 33);
      pdf.text("HISTORIAL ACADÉMICO", margin, 16);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(23, 32, 51);
      pdf.text(`DNI: ${student.dni} | ${date} (Lima)`, margin, 23);
    },
  });
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    const height = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(210, 215, 222); pdf.line(margin, height - 15, width - margin, height - 15);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(85, 95, 110);
    pdf.text("Resumen de registros académicos", margin, height - 10);
    pdf.text(`Página ${page} de ${pages}`, width - margin, height - 10, { align: "right" });
  }
  return pdf;
}
