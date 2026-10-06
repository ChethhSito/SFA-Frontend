# Plan de Proyecto: Sistema de Alerta Temprana de Deserción y Rendimiento Académico (IA / Machine Learning)
**Institución:** IESTP San Francisco de Asís  
**Proyecto:** ERP Académico Integral (SFA-Backend / SFA-Frontend)  
**Módulo Destino:** MGE (Módulo de Gestión de Estudiantes) & Dirección Académica  
**Documento Técnico:** Propuesta de Implementación para Titulación / Sustentación  

---

## 1. Resumen Ejecutivo y Justificación de Tesis

En la educación superior técnica peruana (normada por el MINEDU), la **deserción estudiantil** ocurre predominantemente durante los dos primeros ciclos lectivos por dos causas primordiales:
1. **Inasistencias Acumuladas:** La directiva oficial del MINEDU sanciona al estudiante con **DPI (Desaprobado por Inasistencias)** si acumula el **30% o más de inasistencias injustificadas**. En la gestión manual, el tutor se percata cuando el ciclo ya está culminado.
2. **Bajo Rendimiento Académico Silencioso:** Las calificaciones desaprobatorias de las primeras 4 a 6 semanas no son intervenidas oportunamente por falta de consolidación temprana de notas.

### Objetivo del Módulo IA:
Implementar un **Sistema de Alerta Temprana (SAT-IA)** basado en **Machine Learning con Inteligencia Artificial Explicable (XAI)** que analice continuamente las asistencias, calificaciones continuas, entregas de trabajos y variables de turno, clasificando en tiempo real el nivel de riesgo de cada alumno y sugiriendo planes de acción preventivos de tutoría.

---

## 2. Variables de Entrada y Ponderación del Modelo (*Feature Engineering*)

El modelo predictivo procesa un vector de características (*Feature Vector*) normalizado entre 0 y 1 para cada alumno matriculado:

| Variable (*Feature*) | Tipo de Dato | Rango Real | Ponderación | Justificación Académica / Normativa |
| :--- | :--- | :--- | :---: | :--- |
| **Tasa de Inasistencia (`attendance_rate`)** | Continua | 0% a 100% | **35%** | Límite crítico: si supera 30%, el alumno queda inhabilitado por normativa MINEDU. |
| **Promedio Ponderado Inicial (`early_gpa`)** | Continua | 0.0 a 20.0 | **30%** | Promedio de las evaluaciones continuas tempranas (Semanas 1 a 6). Nota mínima aprobatoria = 13. |
| **Cumplimiento de Tareas (`assignment_completion`)** | Continua | 0% a 100% | **15%** | Porcentaje de tareas y evidencias subidas al Aula Virtual antes del plazo límite. |
| **Historial de Pago (`payment_delay`)** | Binaria | 0 (Al día) / 1 (Deuda) | **10%** | Indicador correlacionado con vulnerabilidad socioeconómica y posible abandono. |
| **Factor de Turno (`shift_factor`)** | Categórica | Mañana / Tarde / Noche | **10%** | Estadísticamente los turnos vespertino y nocturno tienen mayor riesgo de deserción laboral. |

### Clasificación y Salida del Modelo (*Target*):

$$\text{Riesgo Global (Score)} = \sum (w_i \cdot x_i) \quad \in [0.00, 1.00]$$

* 🟢 **Bajo Riesgo (0.00 - 0.35):** Rendimiento regular y asistencia óptima. Sin intervención requerida.
* 🟡 **Riesgo Moderado (0.36 - 0.69):** Alerta preventiva. Se genera notificación al tutor para seguimiento académico.
* 🔴 **Riesgo Crítico (0.70 - 1.00):** Probabilidad inminente de deserción o DPI. Requiere intervención inmediata, llamada al estudiante y citación formal.

---

## 3. Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph BD [Base de Datos MongoDB]
        A[(Estudiantes - students)]
        B[(Matrículas - enrollments)]
        C[(Asistencias - attendance)]
        D[(Notas - courses / grades)]
    end

    subgraph Backend [SFA-Backend (NestJS API)]
        E[AnalyticsModule] --> F[Extracción y Normalización de Features]
        F --> G[Motor Predictivo XAI - Scoring & Root Cause]
        G --> H[Endpoints REST /analytics/attrition-risk]
    end

    subgraph Frontend [SFA-Frontend (React + Tailwind)]
        I[MgeDashboard] --> J[Pestaña: Alerta Temprana IA]
        J --> K[Tarjetas KPIs: Tasa Retención, Críticos, Moderados]
        J --> L[Tabla Semáforo con Filtros por Carrera y Ciclo]
        L --> M[Modal Ficha de Tutoría & Plan de Intervención]
    end

    BD --> Backend
    Backend --> Frontend
```

---

## 4. Algoritmo: Inteligencia Artificial Explicable (XAI)

Para que el modelo sea **aprobado con honores por el jurado**, no debe ser una "caja negra" incomprensible. El algoritmo no solo calcula el riesgo, sino que identifica la **Causa Raíz (*Root Cause*)**:

```typescript
// Ejemplo de lógica del motor de inferencia explicable
interface StudentRiskAssessment {
  studentDni: string;
  studentName: string;
  career: string;
  cycle: string;
  riskScore: number;          // 0.00 a 1.00
  riskLevel: "CRITICO" | "MODERADO" | "BAJO";
  primaryCause: string;       // Ej: "Inasistencias acumuladas al 28% (Próximo a DPI)"
  recommendation: string;     // Ej: "Citar a consejería académica urgente"
  metrics: {
    attendanceRate: number;
    currentGpa: number;
    homeworkCompletion: number;
    hasOverduePayment: boolean;
  };
}
```

---

## 5. Diseño de Interfaz Visual (Mockup UI en MGE)

Dentro del panel **MGE (Gestión de Estudiantes)** se agregará una pestaña especializada:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  MGE: GESTIÓN DE ESTUDIANTES  >  [SISTEMA DE ALERTA TEMPRANA IA - SAT]                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [ KPI 1: Tasa Proyectada Retención: 94.2% ]  [ KPI 2: Críticos: 3 🔴 ]  [ Moderados: 8 🟡 ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Filtros: [ Carrera: Electricidad Industrial ▾ ] [ Ciclo: Ciclo I ▾ ] [ Buscar DNI... ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  ESTUDIANTE       │ ASISTENCIA │ PROMEDIO │ TAREAS │ RIESGO IA  │ ACCIÓN SUGERIDA     │
├───────────────────┼────────────┼──────────┼────────┼────────────┼─────────────────────┤
│  Juan Pérez M.    │   71% (⚠️) │   09.8   │  40%   │ 🔴 86%     │ [ Derivar a Tutoría]│
│  Rosa Quispe C.   │   84%      │   11.5   │  75%   │ 🟡 48%     │ [ Enviar Alerta Web]│
│  Carlos Mendoza   │   98%      │   16.4   │ 100%   │ 🟢 12%     │ [ Perfil Óptimo    ]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Endpoints de la API Backend (`SFA-Backend`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/analytics/attrition-risk` | Obtiene el reporte consolidado de todos los estudiantes analizados con sus scores. |
| `GET` | `/analytics/attrition-risk/stats` | Métricas de KPIs institucionales (% de retención, distribución de alertas). |
| `GET` | `/analytics/attrition-risk/:dni` | Ficha analítica detallada de un estudiante con el desglose de sus 5 variables. |
| `POST` | `/analytics/tutoring/refer` | Registra una intervención/citación de tutoría para el estudiante derivado. |

---

## 7. Fases de Desarrollo

1. **Fase 1 (Backend - NestJS):**
   - Creación de `AnalyticsModule`, `AnalyticsService` y `AnalyticsController`.
   - Consulta a las colecciones `students`, `attendance`, `enrollments` y cálculo del vector de riesgo.
2. **Fase 2 (Frontend - React):**
   - Creación de `src/components/mge/tabs/MgeAlertaTempranaTab.tsx`.
   - Conexión con la API en `src/services/api.ts`.
   - Tarjetas de métricas, tabla semáforo y modal de derivación a tutoría.
3. **Fase 3 (Validación y Pruebas):**
   - Ejecución con estudiantes matriculados reales de Electricidad Industrial y Contabilidad.
   - Verificación de alertas ante inasistencias superiores al 30%.
