# Modulo de historial de acceso operativo

## Estado de esta decision

Este documento endurece el uso operativo de auditoria y accesos dentro del LMS.

## Requisitos del pliego que cubre

- historial de accesos;
- trazabilidad minima de acciones academicas;
- operacion institucional multiusuario;
- soporte tecnico con capacidad de revisar acceso, vigencia y sesion.

## Problema que se corrige

La base de `AuditLog` y `AccessEventLog` ya existia, pero su consulta era demasiado plana para operacion real.

Faltaba poder:

- consultar por ventana temporal;
- revisar sesiones activas, revocadas y expiradas;
- cruzar accesos con IP y navegador;
- obtener un resumen operativo de acceso por institucion.

## Entidades involucradas

- `AccessSession`
- `AccessEventLog`
- `AuditLog`
- `User`
- `UserInstitution`
- `Institution`

## Cierre MVP

Se agrega capacidad de backend para:

- filtrar auditoria por fecha, accion, entidad, usuario y sesion;
- filtrar eventos de acceso por fecha, tipo, usuario, sesion y estado;
- listar sesiones de acceso institucionales;
- obtener resumen de:
  - sesiones activas
  - sesiones revocadas
  - sesiones expiradas
  - logins recientes
  - refresh recientes
  - logouts recientes

## Roles

- `ADMIN`
- `SUPPORT`

## Reglas de negocio

- ninguna consulta sale de la institucion activa;
- soporte y administracion pueden revisar historial y sesiones;
- la consulta de acceso no reemplaza auth, pero si permite inspeccion operativa real;
- el historial debe servir para diagnostico de soporte y control institucional.

## Que entra en MVP

- filtros ampliados
- listado de sesiones
- resumen operativo de acceso

## Que queda para fase posterior

- alertas de seguridad
- deteccion de patrones anormales
- correlacion automatica con tickets
- exportacion de historico
