const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: (name) => dependencies[name] || {}, ...globals };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const reports = load('src/utils/mgeReports.ts', { './attendance': { academicToday: () => '2026-10-19' } });
const exportsApi = load('src/utils/mgeExports.ts');

test('revenue uses recorded approved enrollment payments, preserving historical receipts of inactive students', () => {
  const summary = reports.summarizeMge([
    { studentDni: '00123456', academicStatus: 'MATRICULADO', programId: 'cont', paymentStatus: 'Validado', paymentOperation: 'OP1' },
    { studentDni: '87654321', academicStatus: 'MATRICULADO', programId: 'cont', paymentStatus: 'Validado' },
    { studentDni: '11223344', academicStatus: 'ADMITIDO', programId: 'cont', paymentStatus: 'Validado' },
  ], [{ dni: '00123456' }, { dni: '87654321', active: false }, { dni: '11223344' }], [
    { studentDni: '00123456', concept: 'Matrícula 2026-I', amount: 175.25, status: 'APROBADO', receiptNumber: 'OP1' },
    { studentDni: '87654321', concept: 'Matrícula', amount: 201.5, status: 'APROBADO' },
    { studentDni: '00123456', concept: 'Prospecto', amount: 100, status: 'APROBADO' },
    { studentDni: '00123456', concept: 'Matrícula', amount: 250, status: 'ANULADO' },
    { studentDni: '11223344', concept: 'Matrícula', status: 'APROBADO' },
  ], []);
  assert.equal(summary.totalCollected, 376.75);
  assert.equal(summary.totalMatriculados, 1);
  assert.equal(summary.totalAdmitidos, 1);
  assert.equal(summary.missingPaymentAmount, 1);
  assert.equal(summary.attendanceRate, null);
});

test('attendance summary counts actual active-student marks through today without imputing unmarked days', () => {
  const summary = reports.summarizeMge([], [{ dni: '12345678' }, { dni: '87654321', active: false }], [], [
    { courseId: 'c1', date: '2026-10-18', statusMap: { '12345678': 'Presente', '87654321': 'Falta' } },
    { courseId: 'c1', date: '2026-10-19', statusMap: { '12345678': 'Falta' } },
    { courseId: 'c1', date: '2026-10-20', statusMap: { '12345678': 'Presente' } },
    { courseId: 'c2', date: '2026-10-19', statusMap: {} },
  ]);
  assert.equal(summary.attendanceRate, 50);
  assert.equal(summary.recordedMarks, 2);
});

test('history preserves recorded zero and never invents grades, credits or membership in another career', () => {
  const rows = reports.recordedHistory({ dni: '12345678', programId: 'cont' }, [
    { id: 'c1', code: 'CON1', name: 'Curso', careerId: 'cont', credits: 3 },
    { id: 'c2', code: 'CON2', name: 'Sin nota', careerId: 'cont', credits: 0 },
    { id: 'c3', code: 'ELE1', name: 'Otra carrera', careerId: 'elec' },
  ], [{ courseId: 'CON1', submissions: [
    { studentDni: '12345678', submitDate: '2020-01-01', grade: 0 },
    { studentDni: '87654321', submitDate: '2020-01-01', grade: 20 },
    { studentDni: '12345678', submitDate: '2999-01-01', grade: 20 },
  ] }]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].grade, 0);
  assert.equal(rows[0].count, 1);
  assert.equal(rows[1].grade, null);
  assert.equal(rows[1].credits, null);
  assert.equal(reports.recordedHistory({ dni: 'other', programId: '' }, [], []).length, 0);
});

test('CSV export escapes quotes, commas and newlines and protects formula-like user text', () => {
  const csv = exportsApi.reportCsv([{ name: 'Datos', rows: [['DNI', 'Nombre', 'Importe'], ['00123456', '=HYPERLINK("url")', 0], ['87654321', 'Pérez, Ana\nSegunda línea', 175.5]] }]);
  assert.equal(csv.startsWith('\uFEFFsep=,\r\n'), true);
  assert.match(csv, /"00123456"/);
  assert.match(csv, /"0"/);
  assert.match(csv, /"'=HYPERLINK\(""url""\)"/);
  assert.match(csv, /"Pérez, Ana\nSegunda línea"/);
});

test('CSV combines summary, enrollment and payment rows using a consistent header', () => {
  const csv = exportsApi.reportCsv([
    { name: 'Resumen', rows: [['Indicador', 'Valor'], ['Asistencia', null]] },
    { name: 'Matriculas', rows: [['DNI', 'Programa'], ['00123456', 'Contabilidad']] },
    { name: 'Cobros', rows: [['DNI', 'Importe'], ['00123456', 175.25]] },
  ]);
  const lines = csv.slice('\uFEFFsep=,\r\n'.length).trim().split('\r\n');
  assert.equal(lines.length, 4);
  const parse = (line) => line.slice(1, -1).split('","');
  assert.equal(parse(lines[0]).length, 6);
  for (const line of lines) assert.equal(parse(line).length, 6);
  assert.equal(parse(lines[1])[2], 'Sin datos');
  assert.equal(parse(lines[2])[3], '00123456');
  assert.equal(parse(lines[3])[5], '175.25');
});

test('history download produces a real multipage PDF with recorded zero and missing-grade labels', async () => {
  const pdfApi = load('src/utils/historyPdf.ts', { jspdf: require('jspdf'), 'jspdf-autotable': require('jspdf-autotable') });
  const rows = Array.from({ length: 85 }, (_, index) => ({ code: `CUR-${index + 1}`, courseName: `Curso registrado ${index + 1} con un nombre extenso para verificar el salto de línea`, credits: 3, count: index === 0 ? 1 : 0, grade: index === 0 ? 0 : null }));
  const pdf = await pdfApi.createHistoryPdf({ dni: '00123456', name: 'Ana Lucía', lastName: 'Pérez', academicStatus: 'BAJA' }, 'Contabilidad', rows, '2026-10-19');
  const contents = pdf.output();
  assert.equal(contents.startsWith('%PDF-'), true);
  assert.ok(pdf.getNumberOfPages() > 1);
  assert.match(contents, /\(NR\)/);
  assert.match(contents, /\(0\)/);
  assert.match(contents, /00123456/);
  assert.doesNotMatch(contents, /<!doctype html>/);
});

test('expediente summary PDF uses recorded requirements and does not fabricate a signature or certificate', async () => {
  const api = load('src/utils/graduationSummaryPdf.ts', { jspdf: require('jspdf') });
  const pdf = await api.graduationSummaryPdf('Ana de prueba', '00123456', 'Programa de prueba', { status: 'Solicitado', step: 'Solicitud', docsChecked: { solicitud: true, constanciaEgresado: false, practicasPre: false, pagoDerecho: false }, obs: 'Revisión pendiente' }, '2026-10-19');
  const contents = pdf.output();
  assert.equal(contents.startsWith('%PDF-'), true);
  assert.match(contents, /00123456/);
  assert.match(contents, /Pendiente/);
  assert.doesNotMatch(contents, /Firma Digital de Verificaci/);
});

test('XLSX round trip preserves typed values and provides styled headers, filters and frozen panes', async () => {
  const ExcelJS = require('exceljs');
  const api = load('src/utils/reportXlsx.ts', { exceljs: { default: ExcelJS } });
  const workbook = await api.createReportWorkbook([
    { name: 'Resumen', rows: [['Indicador', 'Valor'], ['Cobros (PEN)', 175.25], ['Asistencia (%)', 50]] },
    { name: 'Matriculas', rows: [['DNI', 'Programa'], ['00123456', '=texto de prueba']] },
    { name: 'Cobros de matricula', rows: [['DNI', 'Importe PEN'], ['00123456', 0]] },
  ], '2026-10-19');
  const restored = new ExcelJS.Workbook();
  await restored.xlsx.load(await workbook.xlsx.writeBuffer());
  assert.equal(restored.worksheets.length, 3);
  const enrollments = restored.getWorksheet('Matriculas');
  assert.equal(enrollments.getCell('A6').value, '00123456');
  assert.equal(enrollments.getCell('B6').value, '=texto de prueba');
  assert.equal(enrollments.getCell('A5').fill.fgColor.argb, 'FF9F062A');
  assert.equal(enrollments.getColumn(2).width, 42);
  assert.ok(enrollments.autoFilter);
  assert.equal(enrollments.views[0].ySplit, 5);
  assert.equal(restored.getWorksheet('Cobros de matricula').getCell('B6').value, 0);
  assert.equal(restored.getWorksheet('Resumen').getCell('B6').value, 175.25);
  assert.match(restored.getWorksheet('Resumen').getCell('B6').numFmt, /S\//);
});

test('download uses a temporary blob link without changing the page location', () => {
  const calls = [];
  let cleanup;
  const link = { click() { calls.push('download'); }, remove() { calls.push('remove'); } };
  const api = load('src/utils/mgeExports.ts', {}, { Blob,
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => calls.push('revoke') },
    document: { createElement: () => link, body: { appendChild: () => calls.push('append') } },
    window: { setTimeout: (fn) => { cleanup = fn; } },
  });
  api.downloadFile('CSV de prueba', 'reporte.csv', 'text/csv');
  assert.equal(link.download, 'reporte.csv');
  assert.equal(link.href, 'blob:test');
  assert.deepEqual(calls, ['append', 'download', 'remove']);
  cleanup();
  assert.equal(calls.at(-1), 'revoke');
});

test('MGE restores the selected submenu after a reload and ignores unknown saved routes', () => {
  const storage = new Map();
  const sessionStorage = { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  function mount(store = sessionStorage) {
    let value;
    const effects = [];
    const react = {
      useState: (initial) => { if (value === undefined) value = initial(); return [value, (next) => { value = next; }]; },
      useEffect: (effect) => effects.push(effect),
    };
    const api = load('src/hooks/mge/useMgeNavigation.ts', { react }, { sessionStorage: store });
    return { render() { const result = api.useMgeNavigation(); effects.splice(0).forEach((effect) => effect()); return result; } };
  }
  const page = mount();
  page.render().setActiveSubTab('reportes');
  page.render();
  assert.equal(mount().render().activeSubTab, 'reportes');
  storage.set('sfa_mge_active_tab', 'unknown');
  assert.equal(mount().render().activeSubTab, 'estudiantes');
  const blocked = mount({ getItem() { throw new Error('Storage unavailable'); }, setItem() { throw new Error('Storage unavailable'); } });
  assert.equal(blocked.render().activeSubTab, 'estudiantes');
});
