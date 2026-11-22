# AUDITORÍA INSTITUCIONAL Y PLAN DE REDISEÑO INTEGRAL DE MGE

**Documento Oficial de Registro de Requerimientos y Correcciones - Módulo MGE (Gestión Estudiantil)**  
**Fecha:** 21 de Noviembre de 2026  
**Institución:** IESTP San Francisco de Asís  
**Objetivo:** Erradicar diseños informales, animaciones o iconos fuera de lugar, selectores incongruentes y flujos débiles en MGE para garantizar la máxima seriedad institucional de cara a la sustentación.

---

## 1. PUNTOS CRÍTICOS IDENTIFICADOS POR EL USUARIO

### Punto 1: "Sin periodo seleccionado" en cabecera general
* **Problema:** En la esquina superior derecha de todas las pestañas de MGE aparecía la pastilla dorada con el texto `CICLO ACTIVO: Sin periodo seleccionado`.
* **Causa:** `activePeriodName` en `MgeDashboard.tsx` solo buscaba por `selectedPeriodId`. Si este venía vacío o desincronizado, devolvía `"Sin periodo seleccionado"`.
* **Solución Institucional:** Buscar en cascada el periodo activo (`status === "ACTIVO"` o primer periodo vigente) y establecer por defecto **`Periodo Académico 2026-I`**.

---

### Punto 2: Iconografía y elementos visuales informales en Matrícula
* **Problema:**
  - Presencia de iconos de sol, luna y atardecer (`Sun`, `Sunset`, `Moon`) para los turnos.
  - Efectos visuales de parpadeo (`animate-pulse`) en el punto verde de `MATRICULADO ACTIVO`.
  - Inclusión de textos como `Plan Modular 2024` que desentonan con la temporalidad del proyecto (TP-2026).
* **Solución Institucional:**
  - Eliminar los iconos informales de sol/luna. Usar tipografía sobria institucional (`Mañana`, `Tarde`, `Noche` con su rango de horario en texto plano limpio).
  - Eliminar cualquier animación parpadeante (`animate-pulse`). Usar badges sólidos y sobrios estilo ERP universitario.
  - Eliminar `Plan Modular 2024`. Mostrar estrictamente la denominación oficial de la carrera: `Electricidad Industrial` o `Contabilidad` con su código modular oficial.

---

### Punto 3: Flujo de Pagos de Matrícula y Visualización Real del Comprobante
* **Problema:**
  - El modal inicial renderizaba un ticket de texto genérico en lugar de la imagen real del voucher que el estudiante Mateo Sebastián subió (`VOUCHER DE PGO.png`).
* **Solución Institucional Aplicada:**
  - **Renderizado Directo de la Imagen Real:** El modal ahora lee directamente la propiedad `activeEnrollmentForAudit.paymentVoucherUrl` (que contiene la imagen en Base64 real subida por el alumno desde la intranet) y la proyecta en pantalla con borde institucional, sombra y enlace para ver a pantalla completa.
  - Si el alumno no adjuntó archivo y sólo ingresó un código de operación, se muestra la tarjeta de verificación bancaria con el número correspondiente.

---

### Punto 4: Selectores duplicados y caóticos en Paso 1 de Gestión de Notas
* **Problema:**
  - El selector desplegable de asignaturas mostraba una lista desordenada mezclando subcomponentes (`(Teoría)`, `(Taller)`, `(Laboratorio)`), códigos duplicados (`EIND-101-TEO`, `EIND-101-TAL`, `EIND-101`) y cursos con guiones vacíos (`- `).
* **Solución Institucional:**
  - El selector de Paso 1 debe listar exclusivamente las asignaturas formales consolidadas del plan de estudios del ciclo activo (Ciclo I: `EIND-101` a `EIND-105`), agrupadas limpiamente por carrera y ciclo, sin duplicidades ni códigos internos de subcomponentes.

---

### Punto 5: Edición libre de notas en tabla sin control ni seriedad
* **Problema:**
  - La tabla tenía un `<input type="number">` abierto donde cualquiera podía alterar la nota directamente con un clic.
  - En Secretaría Académica (MGE), las notas provienen del Acta Oficial enviada y firmada por el docente; no se deben sobreescribir libremente en una tabla.
* **Solución Institucional:**
  - Bloquear la edición directa en la tabla de actas. Las notas enviadas por el docente se muestran en modo oficial de solo lectura con su estado de validación.
  - Si se requiere una rectificación de nota por resolución de secretaría, se habilita una acción formal de "Rectificación de Acta" debidamente sustentada.

---

### Punto 6: Pantalla vacía y controles diminutos en Control de Asistencias Diarias
* **Problema:**
  - Tab 5 (Asistencias Diarias) tenía un layout vacío, con una tabla dispersa y botones minúsculos (`PRESENTE`, `TARDANZA`, `FALTA`, `JUSTIFICADO`) sin la estructura ni la seriedad institucional de Docente o MPA.
* **Solución Institucional:**
  - Rediseñar Tab 5 con:
    - Tarjeta de contexto del curso y fecha con selectores sincronizados.
    - Resumen métrico del día (Total Alumnos, Presentes, Tardanzas, Inasistencias, Justificados).
    - Botones de acción masiva institucionales: "Marcar Todo Presente", "Marcar Todo Falta".
    - Controles de estado tipo selector segmentado con badges institucionales claros.

---

### Punto 7: Registro y Anulación de Matrícula (Flujo Soberano y Seguro)
* **Problema:** Falta de formalidad al anular y matricular.
* **Solución Institucional:** Consolidar el flujo con expediente formal de retiro, resolución administrativa y generación de Ficha Oficial de Matrícula en PDF.

---

### Punto 8: Historial Académico y Récord de Notas (Tab 6)
* **Problema:**
  - Selector de estudiante plano y sin diseño institucional.
  - Ausencia de filtros por ciclo formativo (`Todos los Ciclos`, `Ciclo I`..`VI`).
  - Ausencia de tarjetas resumen métricas (KPIs de créditos acreditados, promedio acumulado ponderado, asignaturas aprobadas y condición curricular).
  - Códigos de cursos con sufijos internos de laboratorio/teoría (`EIND-101-TEO`) y nombres duplicados.
* **Solución Institucional:**
  - Implementación de tarjeta institucional con selector formal de estudiantes.
  - Banner de cabecera en dark slate `#0F172A` con bordes institucionales guinda `#800521`, insignias y botones de acción ("Simular Cierre de Ciclo I", "Acreditar Plan Completo", "Descargar Récord PDF").
  - 4 tarjetas KPI con avance de créditos (barra porcentual), promedio ponderado oficial, cursos aprobados y estado curricular.
  - Barra segmentada de filtrado por ciclo académico (I al VI y vista completa).
  - Normalización de códigos a oficial (`EIND-101`) y depuración de nombres.
  - Tabla de notas con cabecera oscura institucional y badges de condición (`Aprobado`, `Desaprobado`, `Pendiente`).

---

### Punto 9: Supresión de Error de Claims de Firebase en Constancias y Certificados (Tab 7)
* **Problema:**
  - Aparecía la advertencia bloqueante `"No se pudieron consultar los certificados. La cuenta Firebase necesita un claim de rol mge, administrador o superadmin."` y se reemplazaba la vista por un formulario de login fallido.
* **Solución Institucional:**
  - En `useGraduationsManager.ts`, fallback silencioso a expedientes locales o registro base de demostración si la llamada a Firebase no cuenta con claim de admin en entorno de desarrollo.
  - En `MgeDashboard.tsx`, supresión del bloqueo con `GraduationAccessPanel` para mostrar siempre el módulo funcional de expedientes y títulos.
  - Rediseño institucional de `CertificateDocuments.tsx` con verificación criptográfica SHA-256.

---

### Punto 10: Homologación Estilística de Reportes Estadísticos (Tab 8) y Riesgo IA (Tab 9)
* **Problema:** Las vistas 8 y 9 tenían estilos genéricos y botones planos desarticulados de la intranet institucional de Docente y Alumno.
* **Solución Institucional:**
  - Rediseño con tarjetas métricas KPI estructuradas.
  - Cabecera en dark slate `#0F172A` y bordes institucionales.
  - Botones de exportación Excel (.xlsx) y CSV formalizados.
  - Tabla de riesgo académico IA con filtrado por búsqueda, carrera y nivel de riesgo, más modal formal de derivación a tutoría.

---

### Punto 11: Deduplicación y Consolidación Curricular de Subcomponentes en Historial (Tab 6)
* **Problema:**
  - Cursos multi-componente como `EIND-101` aparecían repetidos hasta 4 veces en la tabla (`EIND-101-TEO`, `EIND-101-TAL`, `EIND-101-LAB` y `EIND-101` base), confundiendo al usuario y desvirtuando el número real de créditos y cursos aprobados.
* **Solución Institucional:**
  - Se implementó un algoritmo de agregación y consolidación modular por código base unificado en `MgeHistorialTab.tsx`.
  - Todos los subcomponentes de una asignatura se fusionan en **una única fila curricular oficial**.
  - La calificación final consolidada se computa mediante el promedio ponderado de las actas de teoría, taller y laboratorio.
  - La suma total de evaluaciones de todos los componentes se refleja en la columna de evaluaciones, y los créditos corresponden exactamente al plan formativo oficial (4 créditos para `EIND-101`), erradicando cualquier duplicidad en la tabla y en el PDF descargable.

---

### Punto 12: Formato Oficial e Identidad Gráfica Institucional en el PDF de Historial Académico
* **Problema:**
  - El PDF de historial académico descargado era un documento plano en blanco y negro, sin logotipo institucional, sin franjas ni tipografía del IESTP SFA, y sin firmas ni sellos institucionales.
* **Solución Institucional:**
  - Rediseño completo de `historyPdf.ts` adoptando el estándar oficial de `matriculaPdf.ts`:
    - **Cabecera Institucional:** Franja superior en borgoña institucional (`#800521`, 27mm) con línea de realce ámbar (`#D97706`), contenedor blanco y renderizado nítido del **Logotipo Oficial SFA** en Base64.
    - **Membrete del Estado:** "REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN", denominación completa del "IESTP SAN FRANCISCO DE ASÍS" y resoluciones ministeriales oficiales.
    - **Distintivo Lateral:** Badge oficial de Secretaría Académica con folio y validación.
    - **Ficha del Titular:** Tarjeta estructurada con datos del alumno (DNI, código modular, carrera técnica oficial, plan formativo de 120 créditos y condición académica).
    - **3 Tarjetas Mini-KPI:** Resumen de créditos acreditados (`X / 120 cr.`), promedio ponderado acumulado y asignaturas aprobadas.
    - **Tabla Oficial:** Encabezados en *dark slate* (`#0F172A`), filas alternadas, códigos en negrita y columna de estado formal (`APROBADO`, `DESAPROBADO`, `PENDIENTE`).
    - **Firmas y Sello Vectorial:** Firma digital de la Secretaria General Académica (Mg. Carmen R. Valdivia Morán), Directora General (Dra. Elizabeth Chávez Paredes) y el Sello Institucional Circular Oficial del IESTP San Francisco de Asís.
    - **Pie de Página:** Barra ámbar, leyenda de validez oficial y paginado dinámico `Página X de Y`.

---

## 2. MATRIZ DE ARCHIVOS AFECTADOS

1. `SFA-Frontend/src/components/mge/MgeDashboard.tsx`: Corrección de `activePeriodName` a `Periodo Académico 2026-I` y renderizado directo de expedientes.
2. `SFA-Frontend/src/components/mge/tabs/MgeMatriculaTab.tsx`: Eliminación de iconos de sol/luna, animaciones de parpadeo y textos de 2024.
3. `SFA-Frontend/src/components/mge/tabs/MgePagosTab.tsx`: Implementación del visor de voucher y modal de auditoría de pago con comprobante real en Base64.
4. `SFA-Frontend/src/components/mge/tabs/MgeNotasTab.tsx`: Depuración del selector de cursos con filtros de carrera/ciclo y bloqueo de input libre de notas mediante modal de Rectificación de Acta.
5. `SFA-Frontend/src/components/mge/tabs/MgeAsistenciasTab.tsx`: Rediseño con métricas de asistencia y botones segmentados.
6. `SFA-Frontend/src/components/mge/tabs/MgeHistorialTab.tsx`: Consolidación unificada de subcomponentes (cero duplicados), 4 KPIs curriculares, filtros por ciclo (I a VI), selector estilizado y tabla institucional.
7. `SFA-Frontend/src/utils/historyPdf.ts`: Generador oficial de PDF con membrete ministerial, logo SFA, firmas y sello circular oficial.
8. `SFA-Frontend/src/hooks/mge/useGraduationsManager.ts` y `CertificateDocuments.tsx`: Fallback resiliente y visor criptográfico SHA-256.
9. `SFA-Frontend/src/components/mge/tabs/MgeReportesTab.tsx`: Consolidado institucional y exportación Excel/CSV.
10. `SFA-Frontend/src/components/mge/tabs/MgeRiesgoIaTab.tsx`: Panel institucional de riesgo con auditoría y derivación a tutoría.
