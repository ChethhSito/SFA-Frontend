# Prueba de notas persistidas

## Preparación

- Reiniciar el backend si no se está ejecutando en modo watch: hay endpoints nuevos para actualizar evaluaciones.
- Mantener frontend y backend levantados y usar un alumno de pruebas ya **MATRICULADO**.
- Debe existir un curso cuya `careerId` o `career` coincida con la carrera del alumno. Si no existe un curso de esa carrera, crearlo o asignarlo en planificación académica antes de probar. Registrar un estudiante no crea su cuenta de acceso.
- Las notas guardadas solo en cachés antiguas del navegador no se importan automáticamente. Las notas nuevas se leen de la API.

## A. Desde MGE: prueba principal

1. Abrir **4. Gestión de Notas**.
2. Elegir un curso de la carrera del alumno de pruebas y el criterio **Examen / Evaluación de Final del Módulo**.
3. Escribir **18** en la nueva nota de ese alumno. Dejar vacías las notas de alumnos que no se van a calificar.
4. Pulsar **Guardar Todas las Notas**. Debe aparecer un toast de éxito después de guardar en el servidor.
5. Recargar la página, volver al mismo curso y criterio. La columna **Nota Existente** debe mostrar **18 / 20**. Las casillas no calificadas deben continuar sin nota.
6. Cambiar únicamente esa nota a **0**, guardar y recargar: debe aparecer **0 / 20**. Cero es una nota explícita y válida.
7. Crear una nota en otro curso o criterio. Volver al primero y cambiarla otra vez: debe actualizarse la evaluación elegida, sin alterar la última de la lista ni crear una evaluación duplicada.
8. Con la pantalla cargada y una nota pendiente de guardar, detener el backend. Intentar guardar: debe aparecer un toast de error y mantenerse el borrador para reintentar. Reiniciar el backend y recargar: la nota guardada anteriormente debe permanecer. Un error no debe cambiar la nota del servidor.

En Network se verá `POST /courses/assignments/create` al crear una evaluación y `PATCH /courses/assignments/{id}` al modificar una existente. `GET /courses/assignments/list` recupera las notas después de recargar. Si aparece un 404 al actualizar, comprobar que el backend se reinició con estos cambios.

## B. Desde Docente: evaluación semanal

1. Entrar con un docente que tenga asignado el curso de pruebas.
2. Abrir su curso → semana → **Evaluaciones**.
3. Escribir un nombre y pulsar **Crear evaluación**. Debe guardarse en el servidor.
4. Seleccionar esa evaluación, introducir una nota y una observación para un alumno matriculado y pulsar **Guardar calificaciones**.
5. Recargar y volver al mismo curso, semana y evaluación: deben recuperarse la nota y la observación.
6. Las casillas vacías no se guardan como cero. Si se edita una observación sin que el alumno tenga nota, se pide introducir la calificación.
7. Desde MGE, seleccionar ese curso y la evaluación con prefijo **[Semana N]** para consultar la misma nota guardada.

La lista semanal ya no crea una evaluación ficticia al entrar ni usa un padrón de alumnos de otras carreras. Las tareas reales publicadas en esa semana también se pueden seleccionar para calificarlas. Al calificar una entrega existente se conserva su archivo y su fecha original.

## C. Desde Docente: planilla por curso

1. Abrir **Evaluación Unificada por Curso**, seleccionar el curso y editar una celda.
2. Completar el mecanismo de edición existente y guardar una nota. El cuadro debe cerrarse solo si el servidor confirma el guardado.
3. Recargar y comprobar que esa celda conserva el valor.
4. Desde MGE, elegir ese curso y el criterio **[Planilla] PC1**, **[Planilla] EX_FINAL** o el componente correspondiente para consultar la misma nota.

Las fórmulas y el mecanismo de PIN de esta pantalla son los que ya tenía el proyecto; este cambio no los convierte en firma digital. Los promedios se muestran completos cuando todos los componentes tienen nota. La publicación de actas y las exportaciones siguen pendientes y la pantalla lo indica.

## D. Alumno y riesgo académico

1. Si el alumno de pruebas tiene cuenta, entrar a su portal → **Mis Calificaciones**. Deben verse las evaluaciones guardadas para sus cursos, con **NR** cuando no haya nota.
2. Entrar a MGE → **Riesgo Académico** → **Actualizar**. Buscar al alumno: su promedio debe reflejar las calificaciones guardadas. Se trata del promedio simple de registros históricos, no del promedio ponderado de una planilla oficial.
3. Puede seguir apareciendo **Sin datos** como nivel de riesgo si aún falta asistencia, una tarea vencida, un estado de pago conocido o un turno conocido. Guardar una nota no crea esos otros registros.
4. Las evaluaciones y componentes de planilla cuentan como notas, pero no como tareas pendientes de entregar.

Para comprobar la persistencia de asistencias, seguir [PRUEBAS_ASISTENCIAS.md](PRUEBAS_ASISTENCIAS.md). Las derivaciones y sus notificaciones internas tienen un flujo separado en [PRUEBAS_TUTORIA.md](PRUEBAS_TUTORIA.md).

## Pruebas automáticas

- Frontend: `npm test`, `npm run lint`, `npm run build`.
- Backend: `node node_modules/jest/bin/jest.js --runInBand`, `npm run build`.
