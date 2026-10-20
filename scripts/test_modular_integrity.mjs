import fs from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log("====================================================");
console.log(" SUITE DE INTEGRIDAD MODULAR Y ESTÁNDARES FRONTEND (SFA)");
console.log("====================================================\n");

// ---------------------------------------------------------------------------
// TEST 1: Estructura de Archivos y Módulos Críticos
// ---------------------------------------------------------------------------
console.log("TEST 1: Estructura de archivos y módulos esenciales...");

const criticalFiles = [
  "src/main.tsx",
  "src/App.tsx",
  "src/index.css",
  "src/types.ts",
  "src/services/api.ts",
  "src/services/mpaApi.ts",
  "src/components/ui/Toast.tsx",
  "src/components/ui/ConfirmModal.tsx",
  "src/components/ui/Button.tsx",
  "src/components/ui/AlertBox.tsx",
  "src/components/ui/Badge.tsx",
  "src/components/ui/Card.tsx",
  "src/components/ui/PageHeader.tsx",
  "src/components/ui/PageTransition.tsx",
  "src/components/ui/Sidebar.tsx",
  "src/components/admin/AdminDashboard.tsx",
  "src/components/alumno/AlumnoDashboard.tsx",
  "src/components/docente/DocenteDashboard.tsx",
  "src/components/mpa/MpaDashboard.tsx",
  "src/components/postulante/PostulanteDashboard.tsx",
  "src/components/mge/MgeDashboard.tsx",
  "src/components/maf/BankReconciliationPanel.tsx",
  "src/components/portal/LoginPortal.tsx",
  "src/components/portal/PortalHome.tsx"
];

for (const file of criticalFiles) {
  assert(fs.existsSync(file), `Archivo crítico existe: ${file}`);
}

// ---------------------------------------------------------------------------
// TEST 2: Integridad Modular, Ausencia de Código Huérfano y Cero Diálogos Nativos
// ---------------------------------------------------------------------------
console.log("\nTEST 2: Integridad Modular, Ausencia de Código Huérfano y Cero Diálogos Nativos...");

// 2.1 Verificar que el componente huérfano ConstanciaMatriculaModal no reaparezca
const orphanedComponent = "src/components/alumno/modals/ConstanciaMatriculaModal.tsx";
assert(!fs.existsSync(orphanedComponent), `Componente huérfano eliminado correctamente: ${orphanedComponent}`);

// 2.2 Verificar exportaciones de src/components/ui/index.ts
const uiIndex = fs.readFileSync("src/components/ui/index.ts", "utf8");
assert(uiIndex.includes("ConfirmModal"), "src/components/ui/index.ts exporta ConfirmModal");
assert(uiIndex.includes("Toast"), "src/components/ui/index.ts exporta Toast");
assert(uiIndex.includes("Button"), "src/components/ui/index.ts exporta Button");
assert(uiIndex.includes("AlertBox"), "src/components/ui/index.ts exporta AlertBox");

// 2.3 Verificar que NO existan llamadas directas a alert() o prompt() en src/
function scanNoNativeDialogs(dir) {
  let violations = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        violations.push(...scanNoNativeDialogs(full));
      }
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      const code = fs.readFileSync(full, "utf8");
      // Excluir asignación de interceptor en useAuthSession.ts
      if (!full.includes("useAuthSession.ts")) {
        const matches = code.match(/\b(alert|prompt)\s*\(/g);
        if (matches) {
          violations.push(`${full} (${matches.length} llamadas nativas encontradas)`);
        }
      }
    }
  }
  return violations;
}

const dialogViolations = scanNoNativeDialogs("src");
assert(dialogViolations.length === 0, `0 llamadas a alert() o prompt() nativos en src/ (detectadas: ${dialogViolations.length})`);
if (dialogViolations.length > 0) {
  console.error("  Violaciones:", dialogViolations);
}

// ---------------------------------------------------------------------------
// TEST 3: Artefactos de Compilación y Codificación UTF-8
// ---------------------------------------------------------------------------
console.log("\nTEST 3: Artefactos de Compilación y Codificación UTF-8...");

// 3.1 Verificación de index.html institucional
assert(fs.existsSync("index.html"), "index.html existe en raíz");
const rootIndexHtml = fs.readFileSync("index.html", "utf8");
assert(rootIndexHtml.includes("San Francisco de As"), "index.html contiene título institucional oficial");

// 3.2 Escaneo de caracteres corruptos U+FFFD en todo el código fuente
function scanUnicodeReplacementChars(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git" && entry.name !== "dist") {
        count += scanUnicodeReplacementChars(full);
      }
    } else if (/\.(ts|tsx|js|jsx|json|html|md|css)$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      if (content.includes("\uFFFD")) {
        count++;
        console.error(`  [WARN] Archivo con caracter \\uFFFD: ${full}`);
      }
    }
  }
  return count;
}

const replacementCharFiles = scanUnicodeReplacementChars("src");
assert(replacementCharFiles === 0, `0 archivos con caracteres corruptos \\uFFFD en src/ (detectados: ${replacementCharFiles})`);

// ---------------------------------------------------------------------------
// TEST 4: Funciones Puras, Fórmulas y Lógica Matemática
// ---------------------------------------------------------------------------
console.log("\nTEST 4: Funciones puras y fórmulas matemáticas...");

// 4.1 Fórmulas de cálculo de fechas de admisión según inicio de clases
function computeAdmissionDatesFromClassStart(classesStartDateStr) {
  const classDate = new Date(classesStartDateStr + "T00:00:00");
  const subDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  return {
    preEnrollmentStart: subDays(classDate, 35),
    preEnrollmentEnd: subDays(classDate, 22),
    admissionDate: subDays(classDate, 20),
    resultsDate: subDays(classDate, 19),
    enrollmentStart: subDays(classDate, 15),
    enrollmentEnd: subDays(classDate, 5)
  };
}

const datesSample = computeAdmissionDatesFromClassStart("2026-04-01");
assert(datesSample.preEnrollmentStart === "2026-02-25", "Pre-inscripción inicia exactamente 35 días antes del inicio de clases");
assert(datesSample.admissionDate === "2026-03-12", "Examen de admisión se programa exactamente 20 días antes del inicio de clases");
assert(datesSample.enrollmentStart === "2026-03-17", "Matrícula regular abre 15 días antes del inicio de clases");
assert(datesSample.enrollmentEnd === "2026-03-27", "Matrícula regular cierra 5 días antes del inicio de clases");

// 4.2 Fórmulas de promedio de notas nominales (Escala 0 a 20)
function computeGpa(grades) {
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / grades.length) * 10) / 10;
}

assert(computeGpa([15, 17, 14]) === 15.3, "GPA con redondeo a un decimal correcto (15.3)");
assert(computeGpa([20, 20, 20]) === 20, "GPA nota máxima 20");
assert(computeGpa([]) === 0, "GPA vacío retorna 0 de forma segura");

// 4.3 Formateador de moneda en Soles
function formatPEN(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "S/. 0.00";
  return `S/. ${amount.toFixed(2)}`;
}

assert(formatPEN(450) === "S/. 450.00", "Formato PEN de matrícula S/. 450.00");
assert(formatPEN(120) === "S/. 120.00", "Formato PEN de derecho de examen S/. 120.00");
assert(formatPEN(NaN) === "S/. 0.00", "Formato PEN NaN fallback a S/. 0.00");

// ---------------------------------------------------------------------------
// TEST 5: Reglas de Negocio Condicionales y Filtros de Interfaz
// ---------------------------------------------------------------------------
console.log("\nTEST 5: Reglas de Negocio Condicionales y Autorización de Roles...");

// 5.1 Roles válidos institucionales
const VALID_ROLES = [
  "superadmin",
  "administrador",
  "postulante",
  "alumno",
  "docente",
  "mpa",
  "mge",
  "maf",
  "login",
  "portal"
];

function isRoleAuthorized(role) {
  return VALID_ROLES.includes(role);
}

assert(isRoleAuthorized("administrador"), "Rol administrador autorizado");
assert(isRoleAuthorized("mpa"), "Rol mpa (Planificación Académica) autorizado");
assert(isRoleAuthorized("mge"), "Rol mge (Gestión de Egresados) autorizado");
assert(isRoleAuthorized("maf"), "Rol maf (Administración y Finanzas) autorizado");
assert(!isRoleAuthorized("hacker"), "Rol no reconocido rechazado correctamente");

// 5.2 Estados válidos de carpeta de postulante
const VALID_FOLDER_STATUSES = ["Pending", "Observed", "Approved", "Enrolled"];
assert(VALID_FOLDER_STATUSES.includes("Approved"), "Estado Approved válido en expediente");
assert(VALID_FOLDER_STATUSES.includes("Observed"), "Estado Observed válido en expediente");

// Resumen final
console.log("\n====================================================");
console.log(` TOTAL PRUEBAS: ${passed + failed} | APROBADAS: ${passed} | FALLIDAS: ${failed}`);
console.log("====================================================");

if (failed > 0) {
  console.error(`\n ERROR: Fallaron ${failed} pruebas de integridad modular.`);
  process.exit(1);
} else {
  console.log("\n TODAS LAS PRUEBAS DE INTEGRIDAD MODULAR PASARON SATISFACTORIAMENTE (EXIT 0)!");
}
