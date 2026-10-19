export const escapeXml = (value: unknown) => String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

type Cell = string | number | null;
export interface ReportSection { name: string; rows: Cell[][] }
export function reportCsv(sections: ReportSection[]) {
  const columns = [...new Set(sections.flatMap((section) => section.rows[0].map(String)))];
  const rows: Cell[][] = [["Sección", ...columns]];
  for (const section of sections) {
    const headers = section.rows[0].map(String);
    for (const row of section.rows.slice(1)) {
      rows.push([section.name, ...columns.map((column) => {
        const index = headers.indexOf(column);
        return index < 0 ? "" : row[index] ?? "Sin datos";
      })]);
    }
  }
  const cell = (value: Cell) => {
    let text = String(value ?? "Sin datos");
    if (typeof value === "string" && /^\s*[=+\-@\t\r]/.test(value)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return '\uFEFFsep=,\r\n' + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

export function downloadFile(contents: BlobPart, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  try { link.click(); }
  finally { link.remove(); }
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
