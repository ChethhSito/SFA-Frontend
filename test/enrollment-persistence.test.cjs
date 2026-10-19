const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

// Exercise the real hook and HTTP client without a browser, Firebase or database.
function setup(hookName = 'useStudentEnrollment', firebaseAuth) {
  const states = [];
  let cursor = 0;
  const storage = new Map();
  const requests = [];
  const effects = [];
  let respond = async () => ({ ok: false, status: 503 });
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = { current: initial };
      return states[index];
    },
    useEffect(callback) { effects.push(callback); },
  };
  const localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
  function load(file, dependencies) {
    const input = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8').replaceAll('import.meta.env', '({})');
    const compiled = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const context = { exports: {}, localStorage, console: { warn() {}, error() {} },
      require: (name) => dependencies[name] || {},
      fetch: async (url, options) => { requests.push({ url, ...options }); return respond(url, options); } };
    vm.runInNewContext(compiled, context);
    return context.exports;
  }
  const api = load('src/services/api.ts', { '../firebase/config': { auth: firebaseAuth } });
  const attendanceUtils = load('src/utils/attendance.ts', {});
  const hook = load(`src/hooks/${hookName === 'useGraduationsManager' ? 'mge' : ['useMaterialUpload', 'useTeacherClassroom'].includes(hookName) ? 'docente' : 'alumno'}/${hookName}.ts`, {
    react, '../../services/api': api, '../../services/mpaApi': { fetchMpaCollection: async () => [] },
  })[hookName];
  return {
    render() { cursor = 0; return hook(); }, storage, requests, api, attendanceUtils,
    response(handler) { respond = handler; },
    async runEffects() { effects.splice(0).forEach((effect) => effect()); await new Promise(setImmediate); },
  };
}

test('MGE changes use PATCH and persist the confirmed server response', async () => {
  const app = setup();
  app.render().setEnrollments([{ studentDni: '12345678', shift: 'Noche' }]);
  const server = { studentDni: '12345678', shift: 'Tarde', programId: 'sistemas', paymentStatus: 'Validado', academicStatus: 'MATRICULADO' };
  app.response(async () => ({ ok: true, json: async () => server }));
  const saved = await app.render().handleUpdateEnrollmentByDni('12345678', { shift: 'Tarde', programId: 'sistemas', paymentStatus: 'Validado', academicStatus: 'MATRICULADO' });
  assert.equal(app.requests[0].method, 'PATCH');
  assert.equal(app.requests[0].url.endsWith('/enrollments/12345678'), true);
  assert.equal(saved, server);
  assert.equal(app.render().enrollments[0], server);
  assert.deepEqual(JSON.parse(app.storage.get('sfa_enrollments')), [server]);
});

test('a failed update leaves the previous enrollment and cache unchanged', async () => {
  const app = setup();
  app.render().setEnrollments([{ studentDni: '12345678', shift: 'Noche' }]);
  assert.equal(await app.render().handleUpdateEnrollmentByDni('12345678', { shift: 'Tarde' }), null);
  assert.equal(app.render().enrollments[0].shift, 'Noche');
  assert.equal(app.storage.has('sfa_enrollments'), false);
  assert.ok(app.render().enrollmentsError);
});

test('failed creation does not fabricate a successful local enrollment', async () => {
  const app = setup();
  assert.equal(await app.render().handleCreateEnrollment({ studentDni: '12345678' }), null);
  assert.equal(app.render().enrollments.length, 0);
  assert.equal(app.storage.has('sfa_enrollments'), false);
});

test('confirmed creation is kept once and a later update does not duplicate it', async () => {
  const app = setup();
  const saved = { studentDni: '12345678', academicStatus: 'ADMITIDO' };
  app.response(async () => ({ ok: true, json: async () => saved }));
  await app.render().handleCreateEnrollment(saved);
  await app.render().handleUpdateEnrollmentByDni(saved.studentDni, { academicStatus: 'ADMITIDO' });
  assert.equal(app.requests[0].method, 'POST');
  assert.equal(app.render().enrollments.length, 1);
});

test('network failure is reported without changing state', async () => {
  const app = setup();
  app.response(async () => { throw new Error('offline'); });
  assert.equal(await app.render().handleCreateEnrollment({ studentDni: '12345678' }), null);
  assert.equal(app.render().enrollments.length, 0);
});

test('an obsolete local cache is not used as authoritative enrollment data', () => {
  const app = setup();
  app.storage.set('sfa_enrollments', JSON.stringify([{ studentDni: 'old-mock' }]));
  assert.equal(app.render().enrollments.length, 0);
});

test('a failed personal-data save reports failure to MGE without creating a local student', async () => {
  const app = setup('useStudentGrades');
  const result = await app.render().handleUpdateStudentsData({ '12345678': { name: 'Ana' } });
  assert.equal(result, false);
  assert.equal(Object.keys(app.render().studentsData).length, 0);
  assert.equal(app.storage.has('sfa_students'), false);
});

test('grading an earlier evaluation PATCHes it instead of recreating the last evaluation', async () => {
  const app = setup('useMaterialUpload');
  const first = { id: 'eval-1', courseId: 'course-1', submissions: [{ studentDni: '12345678', grade: 15 }] };
  const second = { id: 'eval-2', courseId: 'course-1', submissions: [] };
  app.render().setAssignments([first, second]);
  const changed = { ...first, submissions: [{ studentDni: '12345678', grade: 0 }] };
  app.response(async () => ({ ok: true, json: async () => ({ ...changed, _id: first.id }) }));
  assert.equal(await app.render().handleUpdateAssignments([changed, second]), true);
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].method, 'PATCH');
  assert.ok(app.requests[0].url.endsWith('/assignments/eval-1'));
  assert.equal(app.render().assignments[0].submissions[0].grade, 0);
  assert.equal(app.render().assignments[1], second);
});

test('failed grade save leaves confirmed notes intact and reports failure', async () => {
  const app = setup('useMaterialUpload');
  const saved = { id: 'eval-1', submissions: [{ studentDni: '12345678', grade: 15 }] };
  app.render().setAssignments([saved]);
  assert.equal(await app.render().handleUpdateAssignments([{ ...saved, submissions: [{ studentDni: '12345678', grade: 8 }] }]), false);
  assert.equal(app.render().assignments[0].submissions[0].grade, 15);
});

test('creation keeps the server ID so subsequent grading updates the same record', async () => {
  const app = setup('useMaterialUpload');
  const draft = { id: 'temporary', kind: 'assessment', courseId: 'course-1', title: 'Final', submissions: [] };
  app.response(async () => ({ ok: true, json: async () => ({ ...draft, _id: 'server-id' }) }));
  assert.equal(await app.render().handleUpdateAssignments([draft]), true);
  assert.equal(app.requests[0].method, 'POST');
  assert.equal(app.render().assignments[0].id, 'server-id');
});

test('reload reads grades from the API and an empty server list clears stale evaluations', async () => {
  const app = setup('useMaterialUpload');
  app.render();
  app.response(async (url) => ({ ok: true, json: async () => url.includes('/assignments/list')
    ? [{ _id: 'eval-1', submissions: [{ studentDni: '12345678', grade: 18 }] }] : [] }));
  await app.runEffects();
  assert.equal(app.render().assignments[0].id, 'eval-1');
  assert.equal(app.render().assignments[0].submissions[0].grade, 18);
  app.response(async () => ({ ok: true, json: async () => [] }));
  await app.runEffects();
  assert.equal(app.render().assignments.length, 0);
});

test('new academic catalog courses appear beside legacy courses without duplicating their codes', async () => {
  const app = setup();
  app.response(async (url) => ({ ok: true, json: async () => url.endsWith('/mpa/courses')
    ? [{ id: 'catalog-old', code: 'OLD', careerId: 'career-1' }, { id: 'catalog-new', code: 'NEW', careerId: 'informatica' }]
    : [{ _id: 'legacy-old', code: 'OLD', career: 'Carrera anterior' }] }));
  const courses = await app.api.fetchCourses();
  assert.equal(courses.length, 2);
  assert.equal(courses.find((course) => course.code === 'OLD').id, 'legacy-old');
  assert.equal(courses.find((course) => course.code === 'OLD').careerId, 'career-1');
  assert.equal(courses.find((course) => course.code === 'NEW').id, 'catalog-new');
});

async function attendanceApp(records = []) {
  const app = setup('useTeacherClassroom');
  app.response(async (url) => ({ ok: true, json: async () => url.endsWith('/attendance/list') ? records : [] }));
  app.render();
  await app.runEffects();
  app.requests.length = 0;
  return app;
}

test('attendance reloads from the server instead of treating an old local cache as truth', async () => {
  const app = await attendanceApp([{ _id: 'server-id', courseId: 'c1', date: '2026-10-19', statusMap: { '12345678': 'Tardanza' } }]);
  assert.equal(app.render().attendance[0].id, 'server-id');
  assert.equal(app.render().attendance[0].statusMap['12345678'], 'Tardanza');
  app.response(async () => ({ ok: true, json: async () => [] }));
  await app.render().reloadAttendance();
  assert.equal(app.render().attendance.length, 0);
});

test('correcting an earlier day saves that day and sends only the changed student', async () => {
  const first = { _id: 'first', courseId: 'c1', date: '2026-10-18', statusMap: { '12345678': 'Presente', '87654321': 'Justificado' } };
  const last = { _id: 'last', courseId: 'c1', date: '2026-10-19', statusMap: { '12345678': 'Falta' } };
  const app = await attendanceApp([first, last]);
  const saved = { ...first, statusMap: { ...first.statusMap, '12345678': 'Tardanza' } };
  app.response(async () => ({ ok: true, json: async () => saved }));
  const records = app.render().attendance;
  assert.equal(await app.render().handleUpdateAttendance([{ ...records[0], statusMap: saved.statusMap }, records[1]]), true);
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].method, 'POST');
  assert.deepEqual(JSON.parse(app.requests[0].body), { date: first.date, statusMap: { '12345678': 'Tardanza' } });
  assert.equal(app.render().attendance[0].statusMap['87654321'], 'Justificado');
  assert.equal(app.render().attendance[1].statusMap['12345678'], 'Falta');
});

test('all changed attendance days are saved, not just the last one', async () => {
  const app = await attendanceApp();
  app.response(async (url, options) => ({ ok: true, json: async () => ({ _id: JSON.parse(options.body).date, courseId: 'c1', ...JSON.parse(options.body) }) }));
  assert.equal(await app.render().handleUpdateAttendance([
    { id: 'a', courseId: 'c1', date: '2026-10-18', statusMap: { '12345678': 'Falta' } },
    { id: 'b', courseId: 'c1', date: '2026-10-19', week: 2, statusMap: { '12345678': 'Presente' } },
  ]), true);
  assert.equal(app.requests.length, 2);
  assert.equal(app.render().attendance.length, 2);
  assert.equal(JSON.parse(app.requests[1].body).week, 2);
});

test('failed attendance save reports failure and preserves the last confirmed records', async () => {
  const app = await attendanceApp([{ _id: 'day', courseId: 'c1', date: '2026-10-19', statusMap: { '12345678': 'Presente' } }]);
  const cache = app.storage.get('sfa_attendance');
  app.response(async () => ({ ok: false, status: 503 }));
  assert.equal(await app.render().handleUpdateAttendance([{ ...app.render().attendance[0], statusMap: { '12345678': 'Falta' } }]), false);
  assert.equal(app.render().attendance[0].statusMap['12345678'], 'Presente');
  assert.equal(app.storage.get('sfa_attendance'), cache);
});

test('a failed initial attendance load blocks writing over unknown server records', async () => {
  const app = setup('useTeacherClassroom');
  app.render();
  assert.equal(await app.render().reloadAttendance(), false);
  assert.ok(app.render().attendanceError);
  const count = app.requests.length;
  assert.equal(await app.render().handleUpdateAttendance([{ courseId: 'c1', date: '2026-10-19', statusMap: { '12345678': 'Presente' } }]), false);
  assert.equal(app.requests.length, count);
});

test('student attendance excludes unmarked days, future days and other courses', () => {
  const app = setup();
  const rows = app.attendanceUtils.studentAttendanceRecords([
    { courseId: 'legacy-id', date: '2026-10-18', statusMap: { '12345678': 'Falta' } },
    { courseId: 'legacy-id', date: '2026-10-19', statusMap: { '87654321': 'Presente' } },
    { courseId: 'legacy-id', date: '2999-01-01', statusMap: { '12345678': 'Presente' } },
    { courseId: 'other', date: '2026-10-19', statusMap: { '12345678': 'Falta' } },
  ], ['catalog-id', 'legacy-id'], '12345678', '2026-10-19');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].statusMap['12345678'], 'Falta');
});

test('deactivation stores only the confirmed server record and preserves its academic data', async () => {
  const app = setup('useStudentGrades');
  app.render().setStudentsData({ '12345678': { dni: '12345678', name: 'Ana', active: true } });
  const saved = { dni: '12345678', name: 'Ana', active: false, deactivationReason: 'Retiro', cycleStatuses: [{ courses: [{ grade: 0 }] }] };
  app.response(async () => ({ ok: true, json: async () => saved }));
  assert.equal(await app.render().handleSetStudentActive('12345678', false, 'Retiro'), true);
  assert.equal(app.requests[0].method, 'PATCH');
  assert.equal(app.requests[0].url.endsWith('/students/12345678/status'), true);
  assert.equal(app.render().studentsData['12345678'], saved);
  assert.equal(JSON.parse(app.storage.get('sfa_students'))['12345678'].cycleStatuses[0].courses[0].grade, 0);
});

test('failed deactivation preserves the active student and cache', async () => {
  const app = setup('useStudentGrades');
  app.render().setStudentsData({ '12345678': { dni: '12345678', active: true } });
  assert.equal(await app.render().handleSetStudentActive('12345678', false, 'Retiro'), false);
  assert.equal(app.render().studentsData['12345678'].active, true);
  assert.equal(app.storage.has('sfa_students'), false);
});

test('graduation requests wait for Firebase restoration, send the valid session and use PATCH', async () => {
  let ready = false;
  const app = setup('useStudentGrades', { authStateReady: async () => { ready = true; },
    currentUser: { getIdToken: async () => { assert.equal(ready, true); return 'unit-test-token'; } } });
  app.response(async () => ({ ok: true, json: async () => ({ studentDni: '12345678', status: 'Apto' }) }));
  assert.equal((await app.api.updateGraduation('12345678', { status: 'Apto' })).status, 'Apto');
  assert.equal(app.requests[0].method, 'PATCH');
  assert.equal(app.requests[0].headers.Authorization, 'Bearer unit-test-token');
  assert.equal(app.requests[0].url.endsWith('/graduations/12345678'), true);
});

test('graduation access is not simulated when Firebase has no session and the server rejects it', async () => {
  const app = setup('useStudentGrades', { authStateReady: async () => {}, currentUser: null });
  app.response(async () => ({ ok: false, status: 401 }));
  assert.equal(await app.api.fetchGraduations(), null);
  assert.equal(app.requests[0].headers.Authorization, undefined);
});

test('failed graduation creation does not invent a locally successful expediente', async () => {
  const app = setup('useGraduationsManager');
  const result = await app.render().handleCreateGraduation({ studentDni: '12345678', status: 'Solicitado' });
  assert.equal(result, null);
  assert.equal(app.render().graduations.length, 0);
  assert.equal(app.storage.has('sfa_graduations'), false);
});

test('graduation reload supports reauthentication and clears stale cache on a confirmed empty response', async () => {
  const app = setup('useGraduationsManager');
  app.render().setGraduations([{ studentDni: '12345678', status: 'Solicitado' }]);
  assert.equal(await app.render().reloadGraduations(), false);
  assert.equal(app.render().graduations.length, 1);
  app.response(async () => ({ ok: true, json: async () => [] }));
  assert.equal(await app.render().reloadGraduations(), true);
  assert.equal(app.render().graduationsError, null);
  assert.equal(app.render().graduations.length, 0);
  assert.deepEqual(JSON.parse(app.storage.get('sfa_graduations')), []);
});

test('certificate management uses the Firebase token while public verification exposes no authorization token', async () => {
  const app = setup('useStudentGrades', { authStateReady: async () => {}, currentUser: { getIdToken: async () => 'unit-test-token' } });
  app.response(async () => ({ ok: true, json: async () => [] }));
  await app.api.fetchCertificates('12345678');
  assert.equal(app.requests[0].headers.Authorization, 'Bearer unit-test-token');
  assert.ok(app.requests[0].url.endsWith('/certificates/student/12345678'));
  await app.api.verifyCertificate('12345678-1234-1234-1234-123456789abc');
  assert.equal(app.requests[1].headers.Authorization, undefined);
});
