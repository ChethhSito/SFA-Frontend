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

## 2. MATRIZ DE ARCHIVOS AFECTADOS

1. `SFA-Frontend/src/components/mge/MgeDashboard.tsx`: Corrección de `activePeriodName` a `Periodo Académico 2026-I`.
2. `SFA-Frontend/src/components/mge/tabs/MgeMatriculaTab.tsx`: Eliminación de iconos de sol/luna, animaciones de parpadeo y textos de 2024.
3. `SFA-Frontend/src/components/mge/tabs/MgePagosTab.tsx`: Implementación del visor de voucher y modal de auditoría de pago.
4. `SFA-Frontend/src/components/mge/tabs/MgeNotasTab.tsx`: Depuración del selector de cursos (sin duplicados ni subcomponentes) y bloqueo de input libre de notas.
5. `SFA-Frontend/src/components/mge/tabs/MgeAsistenciasTab.tsx`: Rediseño sobrio y robusto con métricas de asistencia.
