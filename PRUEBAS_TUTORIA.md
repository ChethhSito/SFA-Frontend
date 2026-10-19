# Derivaciones y notificaciones internas de MGE

## Flujo principal

1. Reiniciar el backend si no está ejecutándose en modo watch. Se agregó una colección MongoDB y dos rutas de consulta/lectura.
2. Entrar como MGE → **9. Riesgo Académico IA** → **Ver detalle** de un alumno de pruebas sin derivación previa.
3. Escribir un motivo reconocible, por ejemplo `Prueba de seguimiento por asistencia`, y pulsar **Registrar derivación**. Con un motivo vacío el botón debe estar deshabilitado. El máximo es 2000 caracteres.
4. Debe cerrarse el detalle y aparecer un toast de confirmación. La fila debe mostrar **Derivado**.
5. Debajo de la tabla aparece **Notificaciones de tutoría**. Verificar alumno, DNI, motivo, fecha de Lima y estado **Sin leer**.
6. Recargar la página y reiniciar el backend. La derivación debe seguir tanto en la fila como en la bandeja.
7. Pulsar **Marcar como leído**, recargar y comprobar que conserva **Leído** y disminuye el contador de avisos sin leer.
8. Volver a abrir el detalle: muestra que ya existe la derivación. Reintentar el POST desde un cliente tampoco crea un segundo aviso ni sobrescribe el motivo o la lectura original.

Un alumno **Sin datos** también puede derivarse manualmente si se escribe un motivo. Su nivel sigue siendo **Sin datos**; no se fabrican indicadores para habilitar el flujo.

## Fallos

- Con el detalle abierto, detener el backend y guardar: debe aparecer un toast de error, conservarse el motivo y no aparecer una derivación exitosa. Restaurar el backend y reintentar.
- Si falla la consulta de la bandeja, muestra error y permite **Actualizar bandeja**. No debe mostrar una bandeja vacía como si la consulta hubiera funcionado.
- Si falla **Marcar como leído**, el aviso conserva su estado anterior y aparece un mensaje de error.

## Alcance

Los avisos son internos de MGE. Leer un aviso no resuelve el caso ni confirma que tutoría ya lo atendió. Se conserva una derivación por estudiante y ahora se puede atender, cerrar y reabrir con responsable y bitácora. Las alertas automáticas por indicadores se muestran en una bandeja separada. No hay envío por correo ni WhatsApp. Ver el flujo ampliado en [PRUEBAS_SEGUIMIENTO_CERTIFICADOS.md](PRUEBAS_SEGUIMIENTO_CERTIFICADOS.md).

Los indicadores de riesgo continúan calculándose con los registros académicos al consultar; no se generan alertas ficticias para alumnos sin datos suficientes.

## Verificaciones técnicas

- `POST /analytics/tutoring/refer`: valida DNI de 8 dígitos, alumno existente y motivo; guarda antes de responder éxito.
- `GET /analytics/tutoring/referrals`: bandeja ordenada por fecha descendente.
- `PATCH /analytics/tutoring/referrals/{dni}/read`: guarda la lectura sin modificar la derivación.
- Backend: `node node_modules/jest/bin/jest.js --runInBand` y `npm run build`.
- Integración MongoDB: `node test/tutoring.integration.cjs` después del build; utiliza exclusivamente una colección temporal con nombre aleatorio y la elimina al finalizar.
- Frontend: `npm test`, `npm run lint` y `npm run build`.
