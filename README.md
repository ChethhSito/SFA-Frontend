# 🏛️ IESTP San Francisco de Asís — Portal e Intranet Institucional (`SFA-Frontend`)

[![React](https://img.shields.io/badge/React-19.x-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![REST API](https://img.shields.io/badge/Backend-NestJS-E0234E.svg?logo=nestjs)](https://nestjs.com/)

Sistema de Gestión Académica, Admisión e Intranet Institucional del **IESTP San Francisco de Asís**. Diseñado con una arquitectura modular por dominios, interfaz moderna de alta gama y comunicación fluida con la REST API de `SFA-Backend`.

📘 **[Ver Guía del Flujo Institucional End-to-End (FLUJO.md)](FLUJO.md)**  
📐 **[Ver Estándar Oficial de Desarrollo Frontend (ESTANDAR_FRONTEND.md)](ESTANDAR_FRONTEND.md)**

---

## 🌟 Módulos y Roles del Sistema

El sistema cuenta con soporte para **8 roles institucionales y portales dedicados**:

- 🌐 **Portal Público & Pre-Inscripción**: Registro en línea de postulantes, información de carreras y periodos académicos activos.
- 📋 **Postulante (Admisión)**: Seguimiento de trámites, presentación de expedientes y estado de admisión.
- 👨‍🎓 **Alumno**: Matrículas, horario semanal, récord de notas, avance de ciclos (I al VI) y constancias.
- 👨‍🏫 **Docente**: Registro de asistencia, subida de tareas, sílabos y evaluación continua.
- ⚙️ **MAMC**: Control de caja de admisión, validación de carpetas físicas y matriculación.
- 🏛️ **MPA (Planificación Académica)**: Editor visual de mallas curriculares, créditos y horas pedagógicas.
- 🎓 **MGE (Gestión Estudiantil & Egresados)**: Titulación, seguimiento de egresados y trámites de grado.
- 💰 **MAF (Administración & Finanzas)**: Obligaciones, vouchers, estados de pago y conciliación de reportes bancarios.
- 🔐 **SuperAdmin**: Control total de usuarios, asignación de roles y auditoría global del sistema.

---

## 🧾 Prueba de conciliación bancaria en MAF

En **Solicitudes de Obligaciones** crea una obligación; en **Registro de Pagos (Vouchers)** registra su operación, fecha y monto. Luego abre **Validación de Pagos**, sube el consolidado `.xlsx`, pulsa **Comparar** y revisa el resultado de cada fila antes de **Confirmar e importar**. Solo las coincidencias completas pasan a **Validado**. Las tasas sin equivalencia, duplicados y diferencias quedan señalados para revisión.

Para el archivo ficticio ajustado de prueba, usa DNI `54793519`, concepto `CON01` (**S/ 30**), operación `308496` y fecha `2026-04-12`. El voucher puede tener el prefijo `OP-`. Deben coincidir operación, DNI, concepto, fecha y monto tanto con la obligación como con el voucher. Las demás filas sin voucher MAF no se validarán. La imagen del voucher es una referencia visual: el flujo carga el **Excel**, no la imagen.

El frontend lee el archivo con `read-excel-file` y envía las filas a `POST /bank-reconciliation/preview` y `POST /bank-reconciliation/confirm`. MongoDB guarda las filas extraídas, resultados y pagos confirmados; **no almacena el `.xlsx` original**. Es una automatización de conciliación con confirmación humana, no un RPA que navegue por el portal bancario. Las obligaciones MAF siguen en `localStorage`, por lo que esta versión es para pruebas locales. La API se documenta en `http://127.0.0.1:3001/api/docs`.

---

## 🏗️ Estructura del Proyecto Frontend

```text
src/
├── components/           # Componentes organizados por dominio
│   ├── admin/            # Paneles de MAMC (Caja, Admisión y Matrícula)
│   ├── alumno/           # Intranet y récord del estudiante
│   ├── docente/          # Registro de notas y asistencia
│   ├── maf/              # Tesorería y recibos de caja
│   ├── mge/              # Titulación y egresados
│   ├── mpa/              # Editor de mallas curriculares y cursos
│   ├── portal/           # Portal institucional público y Login
│   ├── postulante/       # Expediente del postulante
│   ├── routers/          # Enrutadores condicionales por rol
│   └── ui/               # Sistema de diseño, Sidebar, Card y 404
├── hooks/                # Custom Hooks por dominio
│   ├── admin/            # useApplicantsManager, useAdmissionPeriods
│   ├── alumno/           # useStudentEnrollment, useStudentGrades
│   ├── auth/             # useAuthSession (Sesión y Alertas)
│   ├── docente/          # useTeacherClassroom, useMaterialUpload
│   ├── maf/              # useFinanceManager
│   ├── mge/              # useGraduationsManager
│   ├── mpa/              # useAcademicPlanning
│   ├── superadmin/       # useUsersManager
│   └── useAppData.ts     # Hook de composición global
├── services/             # Servicios HTTP (REST API NestJS + Brevo Mail)
└── data/                 # Datos semilla y fallbacks (mockData)
```

---

## 🚀 Requisitos e Instalación Local

### Requisitos Previos
- **Node.js**: v20 o superior para ejecutar también el backend local
- **pnpm**: v9 o superior (lockfile v9)

### Pasos para Ejecutar
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/ChethhSito/SFA-Frontend.git
   cd SFA-Frontend
   ```

2. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   pnpm run dev
   ```

   La API local se consulta en `http://127.0.0.1:3001`. Para cambiarla, copia `.env.example` a `.env.local` y ajusta `VITE_API_URL`.

4. **Compilar para producción**:
   ```bash
   pnpm run build
   ```

---

## 🔒 Estándares de Commits
Este proyecto utiliza el estándar **`[VERBO] + [OBJETO]` en español** descrito en [ESTANDAR_FRONTEND.md](ESTANDAR_FRONTEND.md):
- `Agrega`, `Implementa`, `Integra`, `Crea`, `Corrige`, `Optimiza`, `Refactoriza`, `Actualiza`.

---

© 2026 **IESTP San Francisco de Asís** — Todos los derechos reservados.
