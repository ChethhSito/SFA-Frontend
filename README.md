# 🏛️ IESTP San Francisco de Asís — Portal e Intranet Institucional (`SFA-Frontend`)

[![React](https://img.shields.io/badge/React-18.x-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
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
- 💰 **MAF (Administración & Finanzas)**: Recaudación, recibos de caja, pensiones y estados de pago.
- 🔐 **SuperAdmin**: Control total de usuarios, asignación de roles y auditoría global del sistema.

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
- **Node.js**: v18.x o superior
- **pnpm**: v8.x o superior (`npm i -g pnpm`)

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

4. **Compilar para producción**:
   ```bash
   pnpm run build
   ```

---

## 🔒 Estándares de Commits
Este proyecto utiliza el estándar **`[VERBO] + [OBJETO]` en español** definido en [`commit.md`](file:///d:/TP%20-2026/SFA-Frontend/commit.md):
- `Agrega`, `Implementa`, `Integra`, `Crea`, `Corrige`, `Optimiza`, `Refactoriza`, `Actualiza`.

---

© 2026 **IESTP San Francisco de Asís** — Todos los derechos reservados.
