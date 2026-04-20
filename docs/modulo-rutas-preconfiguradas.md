# Modulo de rutas preconfiguradas

## Requisitos del pliego que cubre

- cursos preconfigurados;
- rutas formativas;
- administracion de contenido segun nivel;
- seguimiento individual por estudiante;
- articulacion entre cursos y avance dentro de una secuencia formativa.

## Problema que corrige

El backend ya soportaba `LearningPath`, pero la ruta seguia siendo una agrupacion de cursos sin una lectura operativa de secuencia, desbloqueo y avance.

Para el MVP del pliego eso es insuficiente, porque la ruta debe gobernar recorrido academico y no solo ordenar elementos.

## Entidades involucradas

- `LearningPath`
- `LearningPathCourse`
- `StudentLearningPathAssignment`
- `StudentEnrollment`
- `StudentProgress`
- `QuizAttempt`

## Regla de secuencia MVP

La ruta se ordena por `sortOrder`.

Un curso de la ruta queda:

- `COMPLETED` si la matricula asociada ya esta completada, aprobada o con progreso consolidado de cierre;
- `UNLOCKED` si todos los cursos requeridos anteriores ya estan completados;
- `LOCKED` si aun depende de cursos requeridos previos.

## Reglas de negocio

1. La ruta se calcula por `StudentLearningPathAssignment`.
2. Solo cuentan como prerequisito los cursos anteriores marcados como `isRequired`.
3. Un curso opcional no bloquea la secuencia de los siguientes.
4. El docente solo puede ver rutas dentro de su alcance academico.
5. El estudiante solo puede ver sus propias rutas asignadas.

## MVP

Entra en MVP:

- secuencia calculada por ruta asignada;
- estado `LOCKED`, `UNLOCKED`, `COMPLETED` por curso de ruta;
- integracion con matriculas generadas por la misma ruta;
- lectura bilingue base para frontend;
- soporte para docente, admin y estudiante con permisos reales.

## Fase posterior

Queda para fase posterior:

- prerequisitos explicitos curso a curso;
- rutas con ramificaciones;
- reglas avanzadas por nivel o nota minima;
- desbloqueo por certificacion parcial.

## Como responde al documento

Este modulo convierte la ruta en una secuencia academica operable.

La plataforma deja de tratar las rutas como listas de cursos y pasa a exponer avance, bloqueo y desbloqueo dentro del flujo formativo real del estudiante.
