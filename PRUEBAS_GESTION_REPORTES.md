# Baja, reportes, historial y expedientes

Usar un alumno y pagos de pruebas. Reiniciar el backend para cargar `PATCH /students/{dni}/status` y las nuevas validaciones.

## 1. Baja y reactivación

1. En **Padrón Estudiantes**, buscar al alumno y pulsar **Dar de baja**.
2. Verificar nombre y DNI en la confirmación. Con el motivo vacío no debe poder confirmarse.
3. Ingresar un motivo y confirmar. Esperar el toast: la fila debe mostrar **DE BAJA**, motivo y fecha.
4. Recargar. El estado debe permanecer. La ficha y el historial siguen disponibles; no se eliminan matrícula, pagos ni notas.
5. En **Matrícula General**, el botón del alumno indica **Estudiante de baja** y no permite matricular. Sus datos anteriores se conservan. El backend también bloquea registrar o activar su matrícula.
6. En **Reportes** ya no cuenta como matriculado activo. Los cobros históricos de Caja no se borran por darlo de baja. En **Riesgo Académico**, al actualizar, se excluye de la evaluación activa.
7. Volver al padrón → **Reactivar estudiante** → confirmar. Recargar y verificar que recupera su estado anterior de matrícula; no se crea una matrícula nueva ni se altera el pago.
8. Si el servidor falla al confirmar, debe aparecer un toast de error y conservarse el estado anterior.

La baja es administrativa: no elimina una cuenta de acceso ni sus credenciales. Se conserva la última baja (motivo y fecha) y la fecha de reactivación; no es una bitácora de todos los cambios.

## 2. Reportes y Excel

1. Entrar a **8. Reportes Estadísticos**. Verificar conteos con Matrícula General.
2. El importe proviene exclusivamente de `/payments`: pagos **APROBADO**, concepto que contiene matrícula, importe numérico válido. No multiplica matrículas por S/250. Conserva cobros históricos de alumnos de baja.
3. Se informa cuántas matrículas con pago **Validado** no tienen un cobro de Caja asociado (DNI y operación cuando esta exista). Validar una operación en MGE no crea un importe en Caja.
4. La asistencia usa marcas propias de alumnos activos hasta hoy en Lima, en todos los cursos. Las fechas futuras y días sin marcar quedan fuera. Si no existen marcas, muestra **Sin datos**.
5. Pulsar **Descargar Excel (.xlsx)**. Debe conservar abierta la pantalla de Reportes y generar un libro con **Resumen**, **Matriculas** y **Cobros de matricula**: títulos, encabezados con color, filas alternadas, columnas ajustadas, filtros en las hojas de detalle y encabezados inmovilizados. Verificar que los DNI se conservan como texto y los importes son números con formato monetario.
6. Como alternativa, pulsar **Descargar CSV**. Usa UTF-8, comas y una primera línea `sep=,` para que Excel reconozca el separador al abrirlo directamente. La columna **Sección** distingue los tres grupos de datos. Al importarlo en otras herramientas, omitir la línea `sep=,` e indicar tipo texto para DNI si se necesitan conservar ceros iniciales.
7. Recargar el navegador desde Reportes: debe permanecer en Reportes. Repetir desde otra pestaña del MGE; debe restaurar la última pestaña seleccionada dentro de la misma sesión del navegador.
8. Con el servidor detenido, pulsar **Actualizar importes**: debe mostrar error y bloquear la exportación. No debe sustituir el error por una recaudación cero.

Los reportes incluyen registros históricos, sin filtro por semestre. El porcentaje representa marcas registradas, no horas lectivas certificadas ni un umbral oficial del MINEDU.

## 3. Historial y descarga

1. Entrar a **6. Historial Académico** y seleccionar al alumno de pruebas.
2. Verificar que aparecen las notas guardadas de sus entregas/evaluaciones. Un **0** explícito sigue siendo 0; sin nota debe mostrar **NR**.
3. No deben variar las notas al cambiar de pestaña ni recargar. Los cursos sin calificaciones se muestran únicamente cuando pertenecen al programa actual del alumno; una nota propia registrada en otro curso también se conserva en el resumen.
4. **Descargar historial PDF** descarga directamente un archivo `.pdf` con el alumno, estado real, programa, fecha de Lima y la misma tabla visible.
5. Abrir el PDF y revisar acentos, nombres largos y la nota cero. Si hay varias páginas, deben repetirse el encabezado de tabla, el DNI y la numeración sin cortar filas. Puede imprimirse desde cualquier visor PDF; no requiere ventanas emergentes ni seleccionar Guardar como PDF para descargarlo.

El promedio por curso es simple sobre las calificaciones registradas. No es el promedio oficial ponderado de una planilla ni una certificación de aprobación.

## 4. Revisión de expedientes

Este apartado requiere una cuenta con sesión Firebase válida: el backend protege `/graduations`. La sesión local de demostración por sí sola no autoriza estos endpoints. Las peticiones esperan la restauración de Firebase, incluyen su token vigente y usan PATCH para actualizar.

1. Entrar a **7. Constancias y Certificados** y abrir un expediente para un alumno sin trámite previo.
2. Recargar: debe conservarse con todos los requisitos pendientes. No se marcan documentos como revisados automáticamente.
3. Marcar algunos requisitos, escribir observaciones y pulsar **Guardar revisión**. Recargar y comprobar persistencia.
4. **Marcar apto para emisión** solo se habilita con todos los requisitos guardados y sin cambios pendientes. El backend también rechaza Apto si falta algún requisito.
5. Registrar Apto y recargar. Este estado indica revisión administrativa; no anuncia firma digital ni emisión de un certificado.
6. **Descargar resumen guardado** usa la carrera real y el estado/requisitos/observaciones del servidor. No contiene créditos, módulos, resoluciones o verificaciones inventados.
7. Si falla el guardado, aparece toast de error y se conservan las marcas pendientes para reintentar.

Ahora se puede registrar el PDF emitido por la institución con su número y firmante declarados, comprobar su integridad y revocarlo conservando el archivo. El resumen del expediente se descarga directamente como PDF. Ver [PRUEBAS_SEGUIMIENTO_CERTIFICADOS.md](PRUEBAS_SEGUIMIENTO_CERTIFICADOS.md). La generación de una firma institucional, su validación criptográfica y la asignación oficial de números requieren integración institucional; no se simulan. Los estados históricos se conservan.

## Verificación técnica

- Frontend: `npm test`, `npm run lint`, `npm run build`.
- Backend: `node node_modules/jest/bin/jest.js --runInBand`, `npm run build`.
- MongoDB: `node test/mge-management.integration.cjs` después del build. Solo usa colecciones temporales aleatorias y las elimina al finalizar.
