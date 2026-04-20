# Modulo de SLA operativo

## Requisitos del pliego que cubre

- soporte tecnico local;
- tiempo de respuesta no mayor a 48 horas naturales;
- operacion institucional medible;
- administracion centralizada del soporte.

## Problema que corrige

El backend ya tenia tickets y politicas SLA, pero faltaba lectura operacional del cumplimiento.

Sin eso, el sistema podia guardar fechas limite sin exponer si el ticket estaba dentro o fuera de SLA.

## MVP

Entra en MVP:

- banderas de vencimiento de respuesta y resolucion;
- horas restantes de respuesta y resolucion;
- resumen institucional de SLA operativo;
- conteo de tickets vencidos y proximos a vencer.

## Reglas de negocio

1. Un ticket abierto o en progreso puede incumplir respuesta si `firstRespondedAt` no existe y `responseDueAt` ya vencio.
2. Un ticket puede incumplir resolucion si no esta `RESOLVED` o `CLOSED` y `resolutionDueAt` ya vencio.
3. Solo admin y soporte pueden ver el resumen institucional completo de SLA.
4. Los estudiantes solo ven sus propios tickets enriquecidos, no el tablero operacional global.

## Como responde al documento

Este modulo convierte el soporte tecnico en una operacion medible.

La plataforma ya no solo registra tickets: ahora puede indicar cumplimiento, vencimiento y carga operativa del SLA exigido por el pliego.
