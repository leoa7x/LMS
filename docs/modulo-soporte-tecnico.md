# Modulo de soporte tecnico

## Requisitos del documento que cubre

- soporte tecnico local;
- tiempo de respuesta no mayor a 48 horas naturales una vez generada la solicitud;
- operacion institucional y multisede;
- trazabilidad minima de atencion;
- administracion centralizada del servicio.

## Riesgo de una implementacion basica

Si se implementa como una bandeja plana de tickets, no se puede controlar SLA, responsable, sede o laboratorio afectado, ni demostrar cumplimiento de tiempos. Eso rompe el alcance operativo del proyecto.

## Entidades involucradas

- `SupportTicket`
- `SupportTicketComment`
- `SupportSlaPolicy`
- `User`
- `Institution`
- `Campus`
- `Laboratory`
- `AuditLog`

## Relaciones relevantes

- un ticket pertenece a una institucion y puede referenciar sede y laboratorio;
- un ticket tiene solicitante y puede tener responsable asignado;
- un ticket puede tener multiples comentarios;
- una politica SLA puede ser institucional y aplicarse a tickets nuevos.

## Reglas de negocio

1. Todo ticket nace dentro de la institucion activa del usuario.
2. El SLA inicial debe calcular `responseDueAt` desde la politica activa o por defecto a 48 horas.
3. El solicitante puede ver sus tickets.
4. `ADMIN` y `SUPPORT` pueden ver todos los tickets de la institucion activa.
5. El primer comentario de soporte debe registrar `firstRespondedAt` si no existe.
6. El cierre y resolucion del ticket deben quedar trazables.
7. El ticket debe poder asociarse a sede o laboratorio para operacion multisede.

## Roles involucrados

- `ADMIN`
- `SUPPORT`
- `TEACHER`
- `STUDENT`

## Validaciones

- no crear ticket con sede o laboratorio fuera de la institucion activa;
- no permitir que un usuario comun vea tickets de otros;
- no permitir asignacion a un usuario que no pertenezca a la institucion activa;
- no permitir estados inconsistentes sin marcas temporales de resolucion o cierre.

## MVP

- crear ticket institucional
- listar tickets propios
- listar tickets institucionales para admin y soporte
- comentar ticket
- asignar responsable
- cambiar estado
- politica SLA basica por institucion con 48h por defecto
- timestamps de primer respuesta, resolucion y cierre

## Fase posterior

- colas de asignacion;
- categorias y subcategorias tecnicas mas finas;
- notificaciones automaticas por vencimiento;
- matriz SLA por tipo de ticket;
- dashboard de soporte.

## Como responde al documento

Este modulo deja el soporte dentro del LMS como operacion institucional real, no como un simple formulario de contacto. Modela institucion, sede, laboratorio, responsable, comentarios y SLA, con capacidad de demostrar atencion dentro del marco de 48 horas exigido por el pliego.
