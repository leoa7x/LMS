# Modulo de resultados consolidados

## Requisitos del pliego que cubre

- resultados administrados por la misma plataforma;
- seguimiento individual por estudiante;
- visualizacion del progreso para el docente;
- evaluaciones pre-curso;
- evaluaciones post-curso;
- cuestionarios previos por modulo;
- practicas de comprobacion por segmento;
- integracion del progreso con simuladores;
- rutas formativas con lectura consolidada por estudiante.

## Problema que corrige

El backend ya tenia progreso, intentos de quiz, practicas y sesiones de simulador, pero faltaba una lectura consolidada por matricula y por ruta formativa.

Sin eso, el LMS seguia teniendo datos dispersos y no un resultado academico real administrado por la plataforma.

## Entidades involucradas

- `StudentEnrollment`
- `StudentLearningPathAssignment`
- `StudentProgress`
- `LessonProgress`
- `LessonSegmentProgress`
- `PracticeAttempt`
- `Quiz`
- `QuizAttempt`
- `SimulatorSession`
- `LearningPath`
- `CertificationTrack`

## Modelo MVP

### Resultado por matricula

Debe consolidar:

- estado de la matricula;
- progreso porcentual;
- avance de lecciones, segmentos, practicas y simuladores;
- evaluacion diagnostica `PRE_COURSE`;
- cuestionarios `PRE_MODULE`;
- practicas verificables;
- evaluacion sumativa `POST_COURSE`;
- decision final de resultado.

### Resultado por ruta formativa

Debe consolidar:

- cursos totales y requeridos;
- cursos requeridos aprobados o completados;
- progreso promedio de la ruta;
- score final promedio cuando exista;
- relacion con certificaciones externas asociadas a cursos de la ruta.

## Reglas de negocio

1. El resultado consolidado se calcula por `StudentEnrollment`, no por usuario global.
2. El docente solo puede ver resultados dentro de su alcance academico.
3. El estudiante solo puede ver sus propios resultados.
4. El resultado final prioriza `POST_COURSE` cuando existe.
5. Si no existe `POST_COURSE`, la plataforma expone decision provisional basada en progreso consolidado.
6. Las rutas formativas se consideran aprobadas solo cuando sus cursos requeridos quedan aprobados o completados.
7. La consolidacion debe combinar progreso, evaluaciones, practicas y simuladores, no solo quizzes.

## MVP

Entra en MVP:

- endpoint de resultado por matricula;
- endpoint de resultado por ruta formativa;
- estado consolidado por matricula;
- resumen de evaluaciones `PRE_COURSE`, `PRE_MODULE`, `PRACTICE_CHECK`, `POST_COURSE`;
- resumen de practicas y simuladores;
- decision final por matricula;
- lectura de certificaciones relacionadas por ruta.

## Fase posterior

Queda para fase posterior:

- persistencia materializada de libro de calificaciones;
- historico de cierres academicos;
- exportaciones institucionales avanzadas;
- equivalencias completas con certificaciones externas.

## Como responde al documento

Este modulo cierra el hueco entre telemetria academica y resultado administrable.

La plataforma ya no entrega solo intentos y progreso parcial; ahora puede exponer un resultado consolidado por estudiante, curso y ruta formativa, con integracion de practicas, simuladores y evaluaciones.
