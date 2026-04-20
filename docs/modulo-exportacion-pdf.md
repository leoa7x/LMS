# Modulo de exportacion PDF

## Requisitos del pliego que cubre

- impresion o exportacion en PDF de habilidades desarrolladas por modulo;
- administracion de resultados desde la misma plataforma;
- relacion entre progreso, practicas y evidencias.

## Problema que corrige

El backend ya soportaba plantillas PDF por modulo, pero no generaba un PDF real.

Eso dejaba el requisito modelado, pero no cumplido.

## Entidades involucradas

- `Module`
- `ModulePdfExportTemplate`
- `StudentEnrollment`
- `StudentProgress`
- `PracticeAttempt`
- `SkillEvidence`

## MVP

Entra en MVP:

- endpoint de exportacion PDF por modulo;
- seleccion de estudiante por contexto autenticado;
- integracion con plantilla del modulo;
- resumen de progreso, practicas y evidencias;
- PDF valido generado por backend.

## Reglas de negocio

1. El estudiante solo puede exportar su propio PDF.
2. Admin, soporte y docente pueden exportar dentro del alcance permitido.
3. La exportacion se resuelve sobre una matricula valida del estudiante para el curso del modulo.
4. El PDF debe responder al idioma efectivo del usuario o query.

## Como responde al documento

Este modulo cierra el requisito de impresion PDF de habilidades desarrolladas.

La plataforma ya no guarda solo configuracion de plantilla; ahora produce un PDF real desde backend con resumen academico del modulo.
