const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/attendanceSessionRules.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const { completeAttendance, attendanceBlockReason } = context.exports;

test('complete-roster validation includes all 200 students regardless of filters or pagination', () => {
  const roster = Array.from({ length: 200 }, (_, index) => ({ dni: String(10000000 + index) }));
  const draft = Object.fromEntries(roster.slice(0, 199).map((student) => [student.dni, 'Presente']));
  draft.foreign = 'Presente';
  let result = completeAttendance(roster, {}, draft);
  assert.equal(result.missing.length, 1);
  assert.equal(result.missing[0], roster[199].dni);
  assert.equal(Object.keys(result.statusMap).length, 199);
  draft[roster[199].dni] = 'Justificado';
  result = completeAttendance(roster, {}, draft);
  assert.equal(result.missing.length, 0);
  assert.equal(Object.keys(result.statusMap).length, 200);
});
test('saved and draft marks combine without replacing missing students by an absence', () => {
  const roster = [{ dni: '11111111' }, { dni: '22222222' }];
  const result = completeAttendance(roster, { '11111111': 'Presente' }, { '22222222': 'Tardanza' });
  assert.equal(result.missing.length, 0);
  assert.equal(result.statusMap['11111111'], 'Presente');
  assert.equal(completeAttendance(roster, { '11111111': 'Invalid' }, {}).missing.length, 2);
});
test('historical dates, wrong weekdays and inactive periods remain read-only', () => {
  const row = { issues: [], periodActive: true, periodStatus: 'Activo', startDate: '2026-10-01', endDate: '2026-11-30', dayOfWeek: 'Martes' };
  assert.equal(attendanceBlockReason({ date: '2026-10-27' }, row, '2026-10-27'), '');
  assert.match(attendanceBlockReason({ date: '2026-10-20' }, row, '2026-10-27'), /día de hoy/);
  assert.match(attendanceBlockReason({ date: '2026-10-27' }, { ...row, dayOfWeek: 'Jueves' }, '2026-10-27'), /día de hoy/);
  assert.match(attendanceBlockReason({ date: '2026-10-27' }, { ...row, periodActive: false }, '2026-10-27'), /ciclo lectivo/);
});
