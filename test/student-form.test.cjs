const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/studentFormValidation.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const context = { exports: {}, require: () => ({ academicToday: () => '2026-10-27' }) };
vm.runInNewContext(compiled, context);
const { validateStudentForm, normalizeStudentSearch } = context.exports;
const valid = { dni: '00123456', name: 'Ana', lastName: 'Quispe', email: 'ana@example.com', phone: '+51 987 654 321', emergencyPhone: '', birthDate: '2004-05-15', programId: 'cont', shift: 'Mañana' };
test('student form keeps leading-zero DNI and accepts optional contact data', () => {
  assert.equal(Object.keys(validateStudentForm(valid, [])).length, 0);
});
test('duplicate email is case insensitive while editing your own email is allowed', () => {
  const existing = [{ dni: valid.dni, email: 'ANA@example.com' }];
  assert.match(validateStudentForm(valid, existing).dni, /registrado/);
  assert.match(validateStudentForm({ ...valid, dni: '12345678' }, existing).email, /otro estudiante/);
  assert.equal(Object.keys(validateStudentForm(valid, existing, valid.dni)).length, 0);
});
test('invalid dates, future birthdays, malformed phones and whitespace names are rejected', () => {
  for (const birthDate of ['2004-02-30', '2027-01-01', 'not-a-date']) assert.ok(validateStudentForm({ ...valid, birthDate }, []).birthDate);
  for (const phone of ['123', '123abc456789', '1234567890123456']) assert.ok(validateStudentForm({ ...valid, phone }, []).phone);
  assert.ok(validateStudentForm({ ...valid, name: '  ', lastName: ' ' }, []).name);
  assert.ok(validateStudentForm({ ...valid, programId: '', shift: '' }, []).programId);
});
test('student search matches names without requiring accents or capitalization', () => {
  assert.equal(normalizeStudentSearch('  Alarcón HUAMÁN  '), 'alarcon huaman');
});
