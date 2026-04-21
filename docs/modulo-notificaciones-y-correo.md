# Modulo de notificaciones y correo

## Requisitos del documento que cubre

- envio por e-mail de practicas de demostracion;
- notificaciones basicas;
- trazabilidad de eventos operativos y academicos;
- acceso centralizado desde el mismo portal.

## Riesgo de una implementacion basica

Si se resuelve solo como mensajes sueltos en base de datos, el sistema no cubre el requisito de envio por correo ni deja rastro de entrega. El riesgo es no poder demostrar que una practica de demostracion fue notificada o enviada.

## Entidades involucradas

- `Notification`
- `NotificationTemplate`
- `EmailDelivery`
- `User`
- `Institution`
- `Practice`
- `Course`
- `Module`
- `AuditLog`

## Relaciones relevantes

- una notificacion pertenece a una institucion y a un usuario destinatario;
- una notificacion puede nacer de una plantilla;
- una notificacion puede generar uno o varios registros de entrega por correo;
- una notificacion puede referenciar una entidad academica como curso, modulo o practica.

## Reglas de negocio

1. Toda notificacion nace dentro de la institucion activa del usuario.
2. Debe existir diferencia entre notificacion interna del portal y entrega por correo.
3. El envio de practica de demostracion debe poder registrarse como evento trazable.
4. `ADMIN` y `TEACHER` pueden generar notificaciones academicas dentro de su alcance.
5. El estudiante solo consulta y marca sus notificaciones.
6. El sistema debe conservar estado de lectura y de entrega.
7. La entrega por correo debe poder ejecutarse mediante SMTP real y dejar trazabilidad por destinatario.

## Roles involucrados

- `ADMIN`
- `TEACHER`
- `STUDENT`
- `SUPPORT` en fase posterior para notificaciones operativas

## Validaciones

- no permitir generar notificaciones fuera de la institucion activa;
- no permitir que un estudiante genere notificaciones academicas globales;
- no permitir consultar notificaciones ajenas;
- no permitir crear envios de practica sin destinatario y sin referencia academica valida.

## MVP

- notificaciones internas por usuario
- listado de notificaciones propias
- marcado como leida
- plantillas basicas institucionales
- registro de entrega por correo
- envio SMTP real cuando la configuracion este disponible
- endpoint para envio de practica de demostracion
- trazabilidad en auditoria

## Fase posterior

- proveedor externo distinto de SMTP;
- programacion y reintentos automaticos;
- notificaciones masivas por curso o ruta;
- preferencias de canal por usuario;
- colas asincronas de entrega.

## Como responde al documento

Este modulo deja resuelto el requisito de notificaciones y correo como parte del dominio del LMS. No solo muestra avisos en el portal: modela plantilla, destinatario, referencia academica y entrega por correo, con capacidad de registrar envio de practicas de demostracion y mantener trazabilidad institucional.
