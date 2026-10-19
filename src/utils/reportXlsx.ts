import type { ReportSection } from "./mgeExports";

export async function createReportWorkbook(sections: ReportSection[], date: string) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IESTP San Francisco de Asís";
  workbook.title = "Reporte de Gestión Estudiantil";
  const navy = "FF172033", burgundy = "FF9F062A", pale = "FFF2F5F9", ink = "FF243247";
  for (const section of sections) {
    const headers = section.rows[0].map(String);
    const sheet = workbook.addWorksheet(section.name, {
      views: [{ state: "frozen", ySplit: 5 }],
      pageSetup: { paperSize: 9, orientation: headers.length > 3 ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "1:5" },
    });
    const lastColumn = Math.max(headers.length, 2);
    sheet.mergeCells(1, 1, 1, lastColumn);
    const title = sheet.getCell(1, 1);
    title.value = `GESTIÓN ESTUDIANTIL | ${section.name.toLocaleUpperCase("es-PE")}`;
    title.font = { name: "Calibri", size: 17, bold: true, color: { argb: "FFFFFFFF" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: navy } };
    title.alignment = { vertical: "middle" };
    sheet.getRow(1).height = 38;
    sheet.mergeCells(2, 1, 2, lastColumn);
    sheet.getCell(2, 1).value = `IESTP San Francisco de Asís | Fecha de corte: ${date} (Lima)`;
    sheet.getCell(2, 1).font = { name: "Calibri", size: 11, color: { argb: ink } };
    sheet.getRow(2).height = 24;
    sheet.mergeCells(3, 1, 3, lastColumn);
    sheet.getCell(3, 1).value = "Registros históricos, sin filtro de semestre. Importes registrados en Caja.";
    sheet.getCell(3, 1).font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF596779" } };
    sheet.getCell(3, 1).alignment = { wrapText: true, vertical: "middle" };
    sheet.getRow(3).height = 30;
    sheet.getRow(4).height = 8;
    sheet.getRow(5).values = headers;
    sheet.getRow(5).height = 28;
    sheet.getRow(5).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: burgundy } };
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
    for (const values of section.rows.slice(1)) {
      const row = sheet.addRow(values.map((value) => value ?? "Sin datos"));
      row.height = 30;
      row.eachCell({ includeEmpty: true }, (cell, index) => {
        const header = headers[index - 1] || "";
        cell.font = { name: "Calibri", size: 11, color: { argb: ink } };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: row.number % 2 === 0 ? pale : "FFFFFFFF" } };
        cell.border = { bottom: { style: "hair", color: { argb: "FFDFE5EC" } } };
        if (header === "DNI" || header === "Operación" || header === "Identificador") cell.numFmt = "@";
        if (typeof cell.value === "number") {
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.numFmt = header === "Importe PEN" ? '"S/ "#,##0.00' : Number.isInteger(cell.value) ? "0" : "0.00";
        }
      });
      if (section.name === "Resumen") {
        row.getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: ink } };
        const label = String(values[0]);
        const value = row.getCell(2);
        if (typeof value.value === "number" && label.includes("(PEN)")) value.numFmt = '"S/ "#,##0.00';
        if (typeof value.value === "number" && label.includes("(%)")) value.numFmt = '0.00"%"';
      }
    }
    headers.forEach((header, index) => {
      const width = section.name === "Resumen" ? (index === 0 ? 62 : 56)
        : header === "Programa" || header === "Concepto" ? 42 : header === "Identificador" || header === "Operación" ? 28 : header === "Estado académico" || header === "Estado de pago" ? 24 : 18;
      sheet.getColumn(index + 1).width = width;
    });
    if (section.name !== "Resumen") sheet.autoFilter = { from: { row: 5, column: 1 }, to: { row: Math.max(sheet.rowCount, 5), column: headers.length } };
    sheet.headerFooter.oddFooter = "&LIESTP San Francisco de Asís&RPágina &P de &N";
  }
  return workbook;
}
