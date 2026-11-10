const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/utils/gradeInput.ts'), 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { parseGradeInput } = context.exports;
test('grade entry preserves recorded zero and accepts the endpoints and decimals', () => {
  assert.equal(parseGradeInput('0'), 0);
  assert.equal(parseGradeInput('20'), 20);
  assert.equal(parseGradeInput(' 13.5 '), 13.5);
  assert.equal(parseGradeInput('13,5'), 13.5);
});
test('out-of-range grades are rejected instead of silently clamped', () => {
  for (const value of ['25', '20.01', '-1', '999999']) assert.equal(parseGradeInput(value), null);
});
test('empty or malformed grade entry never becomes a recorded zero', () => {
  for (const value of ['', ' ', 'abc', '1e1', 'Infinity', 'NaN', '1.2.3', '13.']) assert.equal(parseGradeInput(value), null);
});
