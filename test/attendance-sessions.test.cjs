const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function setup(response, signedIn = true) {
  const requests = [];
  const source = fs.readFileSync(path.join(__dirname, '../src/services/attendanceSessions.ts'), 'utf8').replaceAll('import.meta.env', '({})');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: () => ({ auth: { authStateReady: async () => {}, currentUser: signedIn ? { getIdToken: async () => "verified-firebase-token" } : null } }), fetch: async (url, options) => { requests.push({ url, ...options }); return response(url, options); } };
  vm.runInNewContext(compiled, context);
  return { api: context.exports, requests };
}
test('session creation sends the actual programming identity and opens only the confirmed record', async () => {
  const record = { _id: 'session-1', programmingId: 'task-1', date: '2026-10-29', statusMap: {}, roster: [] };
  const app = setup(async () => ({ ok: true, json: async () => record }));
  const result = await app.api.createAttendanceSession({ programmingId: 'task-1', date: '2026-10-29', extraordinary: false, reason: '' });
  assert.equal(result, record);
  assert.equal(app.requests[0].method, 'POST');
  assert.equal(JSON.parse(app.requests[0].body).programmingId, 'task-1');
});
test('programming errors are shown instead of creating a simulated session', async () => {
  const app = setup(async () => ({ ok: false, json: async () => ({ message: 'El periodo está cerrado.' }) }));
  await assert.rejects(() => app.api.createAttendanceSession({ programmingId: 'task-1', date: '2026-10-29' }), /periodo está cerrado/);
});
test('session marks send a complete list and the optimistic revision using the verified session', async () => {
  const app = setup(async () => ({ ok: true, json: async () => ({ _id: 'session-1' }) }));
  await app.api.markAttendanceSession('session-1', { '12345678': 'Falta' });
  assert.ok(app.requests[0].url.endsWith('/attendance-sessions/session-1/marks'));
  assert.equal(app.requests[0].method, 'PATCH');
  assert.deepEqual(JSON.parse(app.requests[0].body), { statusMap: { '12345678': 'Falta' }, revision: 0 });
  assert.equal(app.requests[0].headers.Authorization, 'Bearer verified-firebase-token');
});
test('an unavailable server produces a retryable error without fabricated records', async () => {
  const app = setup(async () => { throw new Error('Failed to fetch'); });
  await assert.rejects(() => app.api.fetchAttendanceSessions(), /No se pudo conectar/);
});

test('attendance writes require an authenticated account before sending any network request', async () => {
 const app = setup(async () => { throw new Error('Must not fetch'); }, false);
 await assert.rejects(() => app.api.markAttendanceSession('session-1', { '12345678': 'Presente' }), /Conecte su cuenta/);
 assert.equal(app.requests.length, 0);
});
