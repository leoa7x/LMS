# Modulo de administracion centralizada coherente

## Requisitos del pliego que cubre

- administracion centralizada de contenidos, usuarios, cursos y resultados;
- operacion institucional coherente;
- crecimiento multisede sin mezclar datos entre contextos;
- consistencia entre usuarios, licencias, matriculas y estructura academica.

## Problema que corrige

El backend ya tenia muchos modulos, pero varios `findAll` y operaciones de escritura seguian trabajando con datos globales o aceptando referencias institucionales inconsistentes. Eso rompe la administracion centralizada real del LMS.

## Objetivo

Hacer que los modulos administrativos troncales operen siempre dentro de la institucion activa del usuario autenticado, salvo entidades globales explicitamente administrativas.

## Modulos afectados en MVP

- `users`
- `institutions`
- `licenses`
- `enrollments`

## Reglas MVP

1. Los listados administrativos se resuelven por `institutionId` activo del token.
2. Las escrituras que referencian `institutionId` deben coincidir con la institucion activa.
3. Las lecturas de detalle no deben exponer registros fuera de la institucion activa.
4. La administracion de usuarios, licencias, contratos, sedes, laboratorios y matriculas debe tener el mismo criterio de scoping institucional.

## Como responde al documento

Este bloque hace coherente la administracion centralizada. Ya no basta con tener los modulos: ahora operan bajo el mismo contexto institucional y dejan de comportarse como CRUDs globales.
