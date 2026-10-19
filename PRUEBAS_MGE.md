# Pruebas manuales de MGE y riesgo académico

Usar un estudiante y un entorno de pruebas. No anular matrículas ni cambiar pagos de estudiantes reales para probar.
Mantener frontend y backend en ejecución. Si el backend no está en modo watch, reiniciarlo para cargar los cambios de analytics.

## 1. Crear estudiante sin datos inventados

1. Entrar como MGE → **1. Padrón Estudiantes** → registrar estudiante.
2. Ingresar un DNI de pruebas de ocho dígitos que no exista, nombre, apellido, correo, carrera y turno. Los demás datos no deben aparecer completados con información ficticia.
3. Guardar. Debe aparecer como **ADMITIDO**, con pago **No Pagado** y documentos **No Enviado**. No debe aparecer una operación bancaria inventada.
4. Recargar el navegador. La ficha y su matrícula deben seguir existiendo.

En la ficha de creación y edición están disponibles **Distrito** y **Provincia**. Completar ambos, guardar y recargar; el distrito debe aparecer en el padrón. Si no se ingresó distrito, la tabla muestra **Sin registrar**. La dirección no se interpreta automáticamente como distrito.

Crear una ficha de estudiante no crea una cuenta de acceso para ese alumno.

## 2. Carrera, turno y matrícula

1. Abrir **2. Matrícula General**, localizar al estudiante y cambiar carrera o turno.
2. Recargar. Ambos cambios deben conservarse.
3. Intentar **Matricular Alumno** con pago sin validar: debe bloquearse con un mensaje y conservar **ADMITIDO**.
4. Para comprobar el camino de éxito, usar una matrícula de pruebas con operación registrada y pago validado; validar su operación desde **3. Pagos de Matrícula** si corresponde.
5. Pulsar **Matricular Alumno**, recargar y comprobar **MATRICULADO ACTIVO**.
6. Pulsar **Anular Matrícula** y recargar: debe volver a **ADMITIDO**.

Los botones de anulación son rojos con texto blanco. Los de matricular son verdes. Si no hay registro de matrícula, las acciones están deshabilitadas y la fila lo indica.

## 3. Pago y errores de guardado

1. En **3. Pagos de Matrícula**, una matrícula sin operación debe mostrar **Sin operación registrada** y no permitir validarla. Ingresar su número en **Número de operación** y pulsar **Registrar operación**. Debe guardarse como **Pendiente**, conservar el número al recargar y habilitar **Validar**. Registrar la operación no valida el pago automáticamente.
2. Sobre una matrícula de pruebas con operación, marcar **Observado**, recargar y verificar que persista. Después validar y volver a recargar.
3. Con la página cargada, detener temporalmente el backend e intentar cambiar el turno.
4. Debe mostrarse un error, sin cambiar el turno ni anunciar éxito. Arrancar el backend y recargar: debe mantenerse el último valor guardado.

En las herramientas de red del navegador, un cambio de matrícula debe hacer `PATCH /enrollments/{DNI}` y obtener una respuesta exitosa. Un mensaje en pantalla por sí solo no demuestra persistencia: comprobar siempre después de recargar.

Los avisos del MGE deben aparecer como toasts en la esquina inferior derecha: éxito en verde, advertencia en ámbar y error en rojo. No deben mostrar un modal con **Aceptar** ni bloquear la pantalla. Se cierran automáticamente o con **Cerrar aviso**; al pasar el puntero o enfocar el aviso se pausa su cierre.

## 4. Riesgo sin información

1. Con el estudiante nuevo, entrar en **9. Riesgo Académico IA** y pulsar **Actualizar**.
2. Buscar su DNI. Debe aparecer **Sin datos**, sin promedio, asistencia ni indicador inventados.
3. Debe contarse entre los estudiantes sin información suficiente y no entre los de riesgo bajo.
4. Detener el backend y actualizar: debe mostrarse un error de consulta, no un reporte simulado. Reiniciarlo al terminar.

## 5. Riesgo con información persistida: API

Para probar el guardado de notas desde MGE o Docente, seguir [PRUEBAS_NOTAS.md](PRUEBAS_NOTAS.md). Para verificar el cálculo de forma independiente, también se puede usar un cliente REST contra `http://127.0.0.1:3001`. Los endpoints se consultan en `http://127.0.0.1:3001/api/docs`.

Reemplazar `DNI_PRUEBA`, `ID_CURSO` e `ID_TAREA` por valores del entorno de pruebas. Usar el mismo `ID_CURSO` en asistencia y tarea. `GET /courses` permite consultar cursos y sus `_id`; `GET /enrollments` permite verificar los registros de matrícula.

1. Asegurar que la matrícula del estudiante tenga turno **Mañana** y pago **Validado**. Solo en el entorno de pruebas, si no se dispone de un flujo de caja completo, se puede preparar esa condición con `PATCH /enrollments/DNI_PRUEBA`:

```json
{ "shift": "Mañana", "paymentStatus": "Validado" }
```

2. Registrar una asistencia con `POST /courses/attendance/ID_CURSO`:

```json
{
  "date": "2026-10-18",
  "statusMap": { "DNI_PRUEBA": "Presente" }
}
```

3. Crear una tarea con vencimiento anterior a hoy mediante `POST /courses/assignments/create`:

```json
{
  "courseId": "ID_CURSO",
  "title": "Prueba controlada de riesgo académico",
  "description": "Registro de prueba para verificar el cálculo",
  "dueDate": "2026-10-18"
}
```

Copiar el `_id` devuelto como `ID_TAREA`.

4. Registrar una entrega calificada con `POST /courses/assignments/ID_TAREA/submit`:

```json
{
  "studentDni": "DNI_PRUEBA",
  "studentName": "Nombre del estudiante de pruebas",
  "fileName": "entrega-prueba.pdf",
  "submitDate": "2026-10-18",
  "grade": 18
}
```

El nombre de archivo es metadato del caso de prueba; esta petición no sube ni genera un PDF.

5. Abrir MGE → riesgo → **Actualizar**, o consultar `GET /analytics/attrition-risk`. Si este alumno solo tiene los registros de esta prueba, debe mostrar **100% asistencia**, **18/20**, **100% entregas** y **riesgo bajo**, con indicador **4/100**. Si tiene otros registros históricos, también entran en el cálculo y los valores cambiarán.
6. Repetir la petición de entrega con `"grade": 0`. Debe mostrar **0/20** y **riesgo crítico**. Un cero explícito debe contar como nota real.
7. Cambiar el registro de asistencia a `"Falta"` con la misma fecha: la asistencia debe recalcularse y no quedar fija en un porcentaje simulado.

No se calcula un indicador completo si faltan asistencia, nota, tareas vencidas, estado de pago reconocido o turno reconocido. Las tareas de cursos sin asistencia explícita del alumno no se cuentan como obligaciones suyas. El cálculo usa datos históricos, sin filtro de semestre. Las notas predeterminadas de los resúmenes de ciclos no se usan como calificaciones reales.

## Alcance pendiente

Para verificar asistencias, seguir [PRUEBAS_ASISTENCIAS.md](PRUEBAS_ASISTENCIAS.md); para tutoría, [PRUEBAS_TUTORIA.md](PRUEBAS_TUTORIA.md). La baja reversible, las exportaciones, el historial y la revisión de expedientes se prueban en [PRUEBAS_GESTION_REPORTES.md](PRUEBAS_GESTION_REPORTES.md). La emisión oficial de certificados y actas sigue pendiente. Los registros antiguos ya guardados en la base no se limpiaron automáticamente.

## Pruebas automáticas

- Frontend, desde `SFA-Frontend`: `npm test` y `npm run lint`.
- Backend, desde `SFA-Backend`: `node node_modules/jest/bin/jest.js --runInBand`.
