const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function setup(api, component = 'TutoringNotifications') {
  const states = [], dependencies = [], effects = [];
  let cursor = 0;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!dependencies[index] || deps.some((value, position) => value !== dependencies[index][position])) {
        dependencies[index] = deps;
        effects.push(effect);
      }
    },
  };
  const source = fs.readFileSync(path.resolve(__dirname, `../src/components/mge/tabs/${component}.tsx`), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true,
  } }).outputText;
  const context = { exports: {}, require: (name) => name === 'react' ? react : api };
  vm.runInNewContext(compiled, context);
  return {
    render(refresh = 0) { cursor = 0; return context.exports.default({ refresh }); },
    async settle() { effects.splice(0).forEach((effect) => effect()); await new Promise(setImmediate); },
  };
}
const text = (node) => !node || typeof node === 'boolean' ? '' : typeof node === 'object' ? node.children.map(text).join(' ') : String(node);
function button(node, label) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'button' && text(node).includes(label)) return node;
  return node.children.map((child) => button(child, label)).find(Boolean);
}
const item = { studentDni: '12345678', studentName: 'Alumno de prueba', reason: 'Seguimiento registrado', registeredAt: '2026-10-19T15:00:00Z', readAt: null };

test('inbox uses persisted notifications and confirms read state only from the API', async () => {
  let savedDni;
  const app = setup({ fetchTutoringReferrals: async () => [item], markTutoringReferralRead: async (dni) => {
    savedDni = dni;
    return { ...item, readAt: '2026-10-19T16:00:00Z' };
  } });
  app.render(); await app.settle();
  assert.match(text(app.render()), /1 sin leer/);
  button(app.render(), 'Marcar como leído').props.onClick(); await app.settle();
  assert.equal(savedDni, item.studentDni);
  assert.match(text(app.render()), /0 sin leer/);
  assert.equal(button(app.render(), 'Marcar como leído'), undefined);
});

test('failed read save leaves the unread notification available to retry', async () => {
  const app = setup({ fetchTutoringReferrals: async () => [item], markTutoringReferralRead: async () => null });
  app.render(); await app.settle();
  button(app.render(), 'Marcar como leído').props.onClick(); await app.settle();
  assert.match(text(app.render()), /No se pudo guardar la lectura/);
  assert.ok(button(app.render(), 'Marcar como leído'));
  assert.match(text(app.render()), /Sin leer/);
});

test('failed inbox load shows an error instead of a fabricated empty result and supports retry', async () => {
  let available = false;
  const app = setup({ fetchTutoringReferrals: async () => available ? [] : null });
  app.render(); await app.settle();
  assert.match(text(app.render()), /No se pudo cargar/);
  assert.doesNotMatch(text(app.render()), /No hay derivaciones/);
  available = true;
  button(app.render(), 'Actualizar bandeja').props.onClick(); app.render(); await app.settle();
  assert.match(text(app.render()), /No hay derivaciones registradas/);
});

test('academic alerts use the synchronized server result and persist reading only after confirmation', async () => {
  const alert = { key: '12345678:ASISTENCIA', studentDni: '12345678', studentName: 'Prueba', kind: 'ASISTENCIA', level: 'CRITICO', message: 'Asistencia registrada: 50%', active: true, evaluatedAt: '2026-10-19T15:00:00Z', readAt: null };
  const app = setup({ refreshAcademicAlerts: async () => ({ alerts: [alert] }), readAcademicAlert: async () => ({ ...alert, readAt: '2026-10-19T16:00:00Z' }) }, 'AcademicAlerts');
  app.render(); await app.settle();
  assert.match(text(app.render()), /1 activas sin leer/);
  button(app.render(), 'Marcar alerta como leída').props.onClick(); await app.settle();
  assert.match(text(app.render()), /0 activas sin leer/);
});

test('academic alert read failures preserve the unread state and allow retry', async () => {
  const alert = { key: '12345678:NOTAS', studentDni: '12345678', studentName: 'Prueba', kind: 'NOTAS', level: 'CRITICO', message: 'Promedio 0/20', active: true, evaluatedAt: '2026-10-19T15:00:00Z', readAt: null };
  const app = setup({ refreshAcademicAlerts: async () => ({ alerts: [alert] }), readAcademicAlert: async () => null }, 'AcademicAlerts');
  app.render(); await app.settle();
  button(app.render(), 'Marcar alerta como leída').props.onClick(); await app.settle();
  assert.match(text(app.render()), /No se pudo guardar la lectura/);
  assert.ok(button(app.render(), 'Marcar alerta como leída'));
});
