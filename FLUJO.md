# 🔄 Flujo Operativo e Integración Institucional — IESTP San Francisco de Asís

Este documento detalla el **Flujo de Trabajo Institucional de Extremo a Extremo (End-to-End User Journey)** del sistema **SFA-Frontend** y **SFA-Backend**, describiendo la interacción entre los 8 roles, módulos del sistema y endpoints REST API.

---

## 📊 Diagrama de Flujo del Sistema

```mermaid
graph TD
    A["🏛️ 1. MPA<br>Período académico real"] --> B["⚙️ 2. MAMC<br>Convocatoria vinculada y aperturada"]
    B --> C["🌐 3. PORTAL PÚBLICO<br>Preinscripción dentro de fechas"]
    C --> D["📋 4. POSTULANTE<br>Expediente y pagos"]
    D --> E["⚙️ 5. MAMC<br>Validación y admisión"]
    E --> F["💰 6. MAF<br>Conciliación y pago"]
    F --> G["👨‍🎓 7. ALUMNO Y DOCENTE<br>Matrícula, clases y evaluación"]
    G --> H["🎓 8. MGE<br>Seguimiento, egreso y titulación"]
```

---

## 📋 Detalle Paso a Paso del Flujo Institucional

### 1. 🌐 Fase 1: Pre-Inscripción y Admisión
0. **Preparación de períodos:** MPA guarda el período académico en `PUT /mpa/periods`. MAMC obtiene esa lista del backend y crea una convocatoria con `POST /admission-periods`, vinculada por `academicPeriodId`. Solo puede haber un período académico activo y una convocatoria `APERTURADO` a la vez. Las fechas de preinscripción, examen, resultados y matrícula deben estar ordenadas antes del inicio de clases. MAMC cambia el estado mediante `PATCH /admission-periods/:id`.
1. **Pre-Inscripción en Línea (Portal Público):** 
   - El formulario aparece solo si la convocatoria está aperturada y la fecha actual en Lima cae dentro de la preinscripción. Sin ella, el portal muestra un aviso y bloquea el registro.
   - El postulante selecciona su carrera y completa sus datos. `POST /applicants` valida otra vez la convocatoria en el backend antes de guardar en MongoDB. El correo transaccional se intenta después del alta; un fallo de correo no debe confundirse con un fallo de registro.
2. **Carga de Expediente Digital (Portal Postulante):**
   - El postulante inicia sesión con su DNI y clave temporal (`clave123`).
   - Sube sus documentos digitales: DNI escaneado, Certificado de Secundaria y Foto Carné.

### 2. ⚙️ Fase 2: Validación, Matrícula y Pago
3. **Revisión de Expedientes y Admisión (Módulo MAMC):**
   - El personal de **MAMC** (*Admisión, Matriculación y Caja*) revisa la carpeta digital y física del postulante.
   - Cambia el estado del postulante a **`ADMITIDO`** (`PUT /applicants/:dni`).
4. **Obligación, voucher y conciliación bancaria (Módulo MAF):**
   - MAF crea o recibe una obligación y registra los datos del voucher. Esa obligación pasa a **En Proceso**; actualmente su estado se mantiene en `localStorage`.
   - El personal carga un consolidado `.xlsx` en **Validación de Pagos**. `POST /bank-reconciliation/preview` compara operación, DNI, fecha, concepto y monto, y muestra coincidencias y diferencias. La carga no valida pagos por sí sola.
   - Tras la revisión, `POST /bank-reconciliation/confirm` guarda en MongoDB las filas, resultados y pagos coincidentes. MAF marca esas obligaciones como **Validadas** y sincroniza el estado local usado por MAMC/MGE. Esta conciliación no matricula automáticamente al estudiante ni guarda el Excel original.
5. **Asignación de Aula y Turno (MAMC):**
   - Se le asigna turno (*Mañana / Noche*), aula física y grupo lectivo.

### 3. 🏛️ Fase 3: Planificación y Desarrollo Académico
6. **Planificación Curricular (Módulo MPA):**
   - La jefatura de **MPA** (*Planificación Académica*) configura el plan de estudios, créditos teóricos/prácticos y mallas por ciclo (I al VI).
7. **Control Docente (Intranet Docente):**
   - El profesor registra la asistencia diaria por fecha, evalúa las notas continuas y publica tareas y sílabos.
8. **Seguimiento del Estudiante (Intranet Alumno):**
   - El alumno consulta su horario semanal, sus notas en tiempo real y su avance porcentual de créditos.

### 4. 🎓 Fase 4: Egreso y Titulación
9. **Récord de Egresados (Módulo MGE):**
   - Al aprobar los 6 ciclos académicos (120+ créditos), el estudiante pasa al Módulo **MGE** (*Gestión Estudiantil y Egresados*).
10. **Titulación Profesional:**
   - Se emite el Certificado de Egresado y se tramita el Título Profesional a Nombre de la Nación.

---

## 🔑 Cuentas de Acceso por Módulo

| Módulo | Usuario / DNI | Contraseña | Descripción |
| :--- | :--- | :--- | :--- |
| 🔐 **SuperAdmin** | `superadmin` | `clave123` | Control total del sistema y gestión de usuarios en MongoDB. |
| ⚙️ **MAMC** | `mamc` | `clave123` | Admisión, caja y carpetas físicas de documentos. |
| 🏛️ **MPA** | `mpa` | `clave123` | Editor visual de mallas curriculares y cursos. |
| 🎓 **MGE** | `mge` | `clave123` | Registro de egresados y trámites de titulación. |
| 💰 **MAF** | `maf` | `clave123` | Tesorería, recibos de caja y estado de pagos. |
| 👨‍🏫 **Docente** | `docente` | `clave123` | Asistencia por fecha, evaluaciones y materiales. |
| 👨‍🎓 **Alumno** | `alumno` / `12345678` | `clave123` | Horario, récord de notas por ciclo (I al VI) y constancias. |
| 📋 **Postulante** | `postulante` | `clave123` | Carga de expediente y consulta de resultados. |

---

© 2026 **IESTP San Francisco de Asís** — Todos los derechos reservados.
