# Modulo de auditoria

## Requisitos del documento que cubre

- historial de accesos;
- auditoria minima de acciones academicas;
- trazabilidad de operacion;
- capacidad de explicar quien hizo que, cuando y sobre que entidad.

## Riesgo de una implementacion basica

Si se deja como tabla minima de `action/entityType`, el sistema no puede responder al pliego. Se pierde contexto institucional, sesion, acceso, actor, IP y alcance de la accion. Eso inutiliza la auditoria para soporte, seguridad y operacion academica.

## Entidades involucradas

- `AuditLog`
- `AccessEventLog`
- `User`
- `Institution`
- `UserInstitution`
- `AccessSession`

## Relaciones relevantes

- una accion auditada puede pertenecer a una institucion activa;
- una accion auditada puede asociarse a una sesion de acceso;
- un evento de acceso puede asociarse a usuario y membresia institucional;
- la auditoria debe poder cruzarse con soporte, progreso, simuladores, quizzes y usuarios.

## Reglas de negocio

1. Toda accion auditada debe registrar contexto institucional cuando exista.
2. Toda accion relevante debe poder registrar actor, roles efectivos, sesion, IP y user-agent cuando exista.
3. Los accesos deben auditarse aparte de las acciones de negocio.
4. `ADMIN` y `SUPPORT` pueden consultar auditoria institucional.
5. El modulo debe permitir filtrar por usuario, accion, entidad y tipo de evento de acceso.
6. Login, refresh y logout deben dejar rastro.

## Roles involucrados

- `ADMIN`
- `SUPPORT`

## Validaciones

- no exponer auditoria fuera de la institucion activa;
- no perder contexto de actor cuando la accion viene de usuario autenticado;
- no registrar acciones ambiguas sin entidad o meta suficiente cuando el caso la requiere.

## MVP

- `AuditLog` enriquecido con institucion, membresia, sesion, IP y user-agent
- `AccessEventLog` para login, refresh y logout
- consulta de auditoria con filtros basicos
- consulta de eventos de acceso con filtros basicos
- integracion de auth con auditoria de acceso

## Fase posterior

- correlacion de eventos;
- exportacion;
- politicas de retencion;
- alertas de seguridad;
- dashboards de auditoria.

## Como responde al documento

Este modulo convierte la auditoria en una capacidad operativa real del LMS. No solo guarda acciones sueltas: deja rastro de acceso y de acciones academicas con contexto institucional, actor y sesion. Eso cubre el historial de accesos y la trazabilidad minima exigidos por el pliego.
