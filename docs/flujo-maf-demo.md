# Flujo MAF de demostración

El reporte `.xlsx` representa una exportación **simulada** del Banco de la Nación. El sistema no consulta al banco real ni ejecuta cobros. MAF coteja el número de operación, DNI, concepto, monto y fecha del voucher informado en el portal con cada fila del reporte.

## Recorrido

1. El estudiante solicita `CER01` (certificado de estudios) o `CON01` (constancia de matrícula) en **Trámites de Secretaría**. El docente solicita `DOC01` (constancia de trabajo) o `DOC02` (certificado de servicios) en **Mis Trámites**. MAF consulta estas solicitudes en **Solicitudes de Obligaciones**.
2. El solicitante registra en su portal la operación, fecha y monto de su voucher. Este paso deja la solicitud **En Proceso**; no confirma el pago.
3. En **MAF → Validación de Pagos**, se carga el Excel, se revisan coincidencias y observaciones, y se confirma la importación. Solo las coincidencias respaldadas por una solicitud pendiente en MongoDB pasan a **Validado**. La operación importada se registra en MongoDB para detectar duplicados.
4. Admisión (`ADM01`) y matrícula (`MAT01`) actualizan su estado de pago en MongoDB al confirmar la conciliación. Las solicitudes de alumno y docente actualizan su estado de pago en `service_requests`.
5. Secretaría emite el documento. La carga y entrega del PDF corresponde a otro módulo y queda pendiente de integrar en su interfaz. El pago validado y el documento emitido son estados separados.

## Códigos para el Excel simulado

| Código del reporte | Concepto MAF |
| --- | --- |
| `01844` | `MAT01` Matrícula |
| `01845` | `ADM01` Admisión |
| `01846` | `CER01` Certificado de estudios |
| `01849` | `CON01` Constancia de matrícula |
| `01850` | `DOC01` Constancia de trabajo docente |
| `01851` | `DOC02` Certificado de servicios docentes |

Las tasas se leen del catálogo persistido en MongoDB. Exoneraciones y becas ya no forman parte de MAF. Los registros antiguos con estado `Exonerado` se reabren como `Pendiente` sin descuento al cargar el módulo.

## Alcance de la demostración

El PDF final debe ser preparado y revisado por Secretaría. La API conserva la capacidad de adjuntar el resultado, pero MAF ya no presenta esa pantalla; la entrega desde otro módulo aún requiere integración. No se envía correo automáticamente. El Excel es la fuente bancaria simulada y puede sustituirse en el futuro por un conector externo.
