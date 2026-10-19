# Seguimiento, alertas y documentos institucionales

Usar alumnos y documentos de pruebas. Ejecutar el backend actualizado y recargar el frontend. Los avisos y el seguimiento se guardan en MongoDB; no dependen de la caché local.

## 1. Seguimiento de tutoría

1. En **9. Riesgo Académico IA**, derivar un alumno con un motivo o usar una derivación existente.
2. En **Notificaciones de tutoría**, abrir **Seguimiento**. Comienza en Pendiente.
3. Seleccionar **En atención**, ingresar responsable y una observación. Guardar. Debe aparecer una actuación con estado, responsable, nota y fecha de Lima.
4. Recargar y comprobar persistencia. Marcar el aviso como leído no cambia el estado del caso.
5. Seleccionar **Cerrado**, agregar una nota de cierre y guardar. No se permite cerrar directamente desde Pendiente.
6. Reabrir como **Pendiente / Reabrir** o **En atención**, agregar motivo y guardar. El historial anterior debe mantenerse.
7. En dos pestañas, cargar el mismo caso. Guardar desde la primera e intentar guardar una versión anterior desde la segunda: debe rechazarse sin borrar la nota escrita. Actualizar la bandeja para obtener la versión vigente.

## 2. Alertas internas automáticas

1. Registrar asistencia o notas reales de un alumno activo. Solo cuentan las fechas de asistencia hasta hoy en Lima.
2. Abrir o actualizar **Riesgo Académico IA**. En **Alertas académicas automáticas** se revisan asistencia menor a 82% y promedio menor a 12.5/20. El indicador es crítico por debajo de 72% o 10.5/20, respectivamente; estos son los umbrales existentes de la aplicación.
3. Aunque el riesgo global indique Sin datos por falta de otros indicadores, un indicador conocido sí puede producir su propio aviso. Un cero registrado cuenta; un dato ausente no se inventa.
4. Marcar una alerta como leída y actualizar: si mantiene su severidad, no debe duplicarse ni volver a quedar sin leer.
5. Cambiar el indicador a otra severidad y actualizar: debe renovar el aviso como sin leer. Una pestaña con la versión anterior no debe poder marcar como leída esa alerta renovada.
6. Corregir el indicador por encima del umbral y actualizar. Activar **Mostrar alertas que ya no aplican**: debe indicar recuperación.
7. Si desaparecen los datos suficientes o el alumno deja la evaluación activa, el motivo debe distinguir **Sin datos** o **Inactivo**; no debe anunciar recuperación.
8. Con el backend detenido, actualizar o marcar leído: debe aparecer error, sin confirmar una operación no guardada.

La revisión se ejecuta al abrir o actualizar el módulo. No hay un proceso programado mientras la aplicación está cerrada ni envío por correo, WhatsApp o notificación al dispositivo. Los avisos no asignan automáticamente un tutor.

## 3. Acceso y expediente

1. Entrar a **7. Constancias y Certificados**. Si falta sesión Firebase, ingresar con una cuenta institucional existente en **Acceso a expedientes**, o reintentar con la sesión actual.
2. Abrir expediente, revisar los cuatro requisitos, agregar observaciones y **Guardar revisión**.
3. Recargar y comprobar los datos. **Marcar apto para emisión** exige todos los requisitos guardados; no basta con marcarlos sin guardar.
4. Descargar el resumen: debe ser un PDF con requisitos y observaciones reales. Es un resumen administrativo, no una firma ni un certificado oficial.

La sesión local de demostración no sustituye Firebase. Para gestionar PDFs, el token verificado necesita el custom claim `role` con valor `mge`, `administrador` o `superadmin`, configurado por el administrador institucional. El formulario no crea cuentas ni concede privilegios.

## 4. Registro del PDF institucional

1. Con el expediente **Apto** y sin cambios de revisión pendientes, en **PDF del certificado emitido** completar número real, fecha hasta hoy, firmante según el documento y un PDF válido sin contraseña de hasta 5 MB.
2. Pulsar **Registrar PDF emitido**. Esperar la confirmación en la lista; recargar y comprobar que persiste.
3. **Descargar PDF original** debe recuperar exactamente los mismos bytes. Se comprueba la huella SHA-256 antes de descargar.
4. **Verificar registro** debe mostrar vigencia. Comparar el PDF original: debe coincidir; un PDF diferente debe indicar que no coincide. La comparación del archivo se hace localmente.
5. No se permite otro certificado vigente para ese estudiante ni reutilizar un número registrado. Un reintento idéntico devuelve el registro existente.
6. Pulsar **Revocar documento**, ingresar motivo y confirmar. Debe quedar revocado, con motivo y PDF archivado, incluso después de recargar.
7. Se permite registrar un reemplazo con otro número. El documento anterior debe seguir disponible como archivado; su código debe seguir indicando revocación.
8. Si el servidor falla o faltan permisos, no debe aparecer un registro exitoso local. Se conservan los campos para reintentar.

La verificación pública `GET /certificate-verification/{codigo}` devuelve número, fechas, estado y huella, sin identidad del alumno, firmante, motivo de revocación ni PDF. El código comprueba el registro; **no valida criptográficamente una firma ni acredita por sí solo la autoridad del firmante**. El módulo conserva un documento institucional existente; no crea firmas o numeración oficial.

## Verificaciones ejecutables

- Frontend: `npm run lint`, `npm test` y `npm run build`.
- Backend: `node node_modules/jest/bin/jest.js --runInBand` y `npm run build`.
- Persistencia: desde el backend, `node test/mge-followup.integration.cjs` después del build. Usa colecciones temporales aleatorias, comprueba conflictos, historial, deduplicación, PDF original y revocación, y elimina sus colecciones al finalizar.

Pendiente de integración institucional: generación/validación de firmas, asignación oficial de números y canales externos de envío con destinatarios y credenciales autorizados. No se realizaron envíos externos ni se cambiaron permisos de cuentas para estas pruebas.
