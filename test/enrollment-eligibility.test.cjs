const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/utils/enrollmentEligibility.ts'), 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { enrollmentBlockers } = context.exports;
const student = { dni: '00123456', active: true, enrolled: true, programId: 'cont', shift: 'Mañana', paymentStatus: 'Validado' };
test('validated payment and an assigned career and shift allow enrollment', () => {
  assert.equal(enrollmentBlockers(student).length, 0);
});
test('inactive students and missing admission records cannot be enrolled', () => {
  assert.match(enrollmentBlockers({ ...student, active: false })[0], /Reactive/);
  assert.match(enrollmentBlockers({ ...student, enrolled: false })[0], /registro/);
});
test('a paid or pending payment is not treated as validated', () => {
  for (const paymentStatus of ['Pagado', 'Pendiente', 'No Pagado', 'Sin registro']) assert.match(enrollmentBlockers({ ...student, paymentStatus })[0], /Valide el pago/);
  assert.match(enrollmentBlockers({ ...student, paymentStatus: 'Observado' })[0], /observado/);
});
test('missing assignments remain blocking even with validated payment', () => {
  const blockers = enrollmentBlockers({ ...student, programId: '', shift: '' });
  assert.equal(blockers.length, 2);
  assert.match(blockers[0], /carrera/);
  assert.match(blockers[1], /turno/);
});
