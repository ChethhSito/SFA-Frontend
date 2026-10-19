# Prueba de asistencias persistidas

## Preparación

- Reiniciar el backend si no está en modo watch: se añadió `GET /courses/attendance/list`.
- Usar un alumno de pruebas matriculado y un curso de su misma carrera. Si se prueba con un docente, este debe tener asignado el curso.
- Se guarda **una lista diaria por curso y fecha**. No hay listas independientes de teoría y laboratorio en la misma fecha.
- Las fechas se eligen de forma explícita. La semana docente es metadato, no una fecha que el sistema inventa.
- El navegador ya no usa `sfa_attendance` como fuente de verdad ni importa automáticamente sus registros antiguos. Se consulta el backend al cargar.

## A. Desde MGE

1. Entrar a **5. Asistencias Diarias** y seleccionar el curso de pruebas.
2. Elegir una fecha real, por ejemplo ayer. Sin registros previos, cada alumno debe mostrar **Sin registrar**, sin un botón de estado seleccionado por defecto.
3. En un alumno de pruebas, pulsar **Presente**. En MGE, cada botón guarda inmediatamente; esperar el toast de confirmación.
4. Recargar, volver al mismo curso y fecha: debe seguir **Presente**.
5. Elegir hoy y marcar al mismo alumno como **Falta**. Recargar y comprobar esa fecha.
6. Volver a la fecha de ayer y corregirla a **Tardanza** o **Justificado**. Recargar: debe conservar la corrección de ayer y la falta de hoy. Esto comprueba que se modifica la fecha elegida y no el último registro de la lista.
7. Dejar a otro alumno sin marcar: debe seguir **Sin registrar**. No se le debe asignar asistencia o falta por omisión.
8. Si se prueba una marca colectiva, usar un curso completo de pruebas. **Marcar Todos Presentes** y **Marcar Todos Faltas** guardan a los alumnos matriculados visibles de ese curso; no se aplican a otras carreras.

## B. Desde Docente

1. Entrar al curso → semana → **Asistencia**.
2. Elegir la misma fecha de un registro creado desde MGE: deben aparecer las marcas guardadas.
3. Marcar uno o varios alumnos. Estas marcas son borradores hasta pulsar **Guardar asistencia**.
4. Guardar, recargar y volver al mismo curso, semana y fecha. Deben recuperarse las marcas del servidor.
5. Corregir solamente un alumno: las asistencias de los demás deben permanecer intactas.
6. Revisar **Consultar Historial de Asistencia**: la fecha y estados deben coincidir. Los registros creados únicamente desde MGE no tienen semana inventada; pueden figurar con semana **Sin registrar**.

No se muestran aulas, horarios, fechas ni firmas ficticias al registrar la asistencia.

## C. Alumno y riesgo académico

1. Si el alumno de pruebas tiene cuenta, entrar a su portal → **Asistencia**.
2. Expandir el curso: deben verse las fechas y estados guardados. Los cursos sin registros propios del alumno muestran **Sin datos**, no 100%.
3. Un día en que solo se marcó a otro alumno no se cuenta como falta del alumno consultado.
4. En la asistencia semanal de **Mis Cursos** solo aparecen registros que tengan esa semana asociada. Los registros diarios sin semana se consultan en el resumen de **Asistencia**.
5. En MGE → **Riesgo Académico** → **Actualizar**, buscar al alumno. Si únicamente tiene una fecha presente y otra con falta, ambas hasta hoy (hora de Lima), la asistencia debe ser **50%**. Si tiene otros registros históricos, también cuentan. Por ejemplo, si hoy es 19/10/2026, usar 18/10 y 19/10; una falta del 20/10 todavía no cuenta.
6. Las fechas futuras no se incluyen en el porcentaje actual. Al seleccionarlas aparece un aviso en MGE y Docente; el reporte de riesgo muestra su fecha de corte en Lima. **Presente**, **Tardanza** y **Justificado** cuentan como asistencia; **Falta** no.
7. El nivel global puede seguir **Sin datos** si aún faltan calificaciones, tareas vencidas, estado de pago o turno. Registrar asistencia no crea esos datos.

## D. Fallos del servidor

1. Con la pantalla cargada, detener el backend e intentar guardar un cambio.
2. Debe aparecer un toast de error. No debe mostrarse éxito ni reemplazarse el registro confirmado por la marca no guardada.
3. En Docente, el borrador debe mantenerse para reintentar. Reiniciar el backend y volver a guardar.
4. Si el backend está detenido al cargar la página, debe mostrarse el error de carga y **Reintentar carga**. No se puede registrar sobre datos del servidor que no se han podido consultar.

## API y verificaciones

- Consulta global: `GET /courses/attendance/list`.
- Consulta por curso: `GET /courses/attendance/{courseId}`.
- Guardado: `POST /courses/attendance/{courseId}`, con `date` en formato `YYYY-MM-DD`, `statusMap` de DNI a estado y `week` opcional.
- Las lecturas normalizan fechas históricas `dd/MM/yyyy` y agrupan registros repetidos por curso y día. No se borran registros históricos automáticamente.
- Frontend: `npm test`, `npm run lint`, `npm run build`.
- Backend: `node node_modules/jest/bin/jest.js --runInBand`, `npm run build`.
- Integración real con MongoDB: después del build, `node test/attendance.integration.cjs`. Usa una colección temporal aislada y la elimina al terminar. No escribe en la colección académica de asistencias.

El flujo de notificaciones internas y derivaciones persistidas se prueba en `PRUEBAS_TUTORIA.md`. Las exportaciones y las bajas de estudiantes continúan siendo flujos separados.
