# Modulo de matricula e inscripcion

## Estado de esta decision

Este documento define el diseno del modulo antes de continuar implementacion.

No se acepta una matricula plana de `estudiante + curso`.

Debe responder al pliego en nivel, visibilidad de contenido, rutas formativas y seguimiento individual.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa:

- asignar estudiantes por nivel;
- permitir al docente administrar que contenido ve cada estudiante segun su nivel;
- seguimiento individual por estudiante;
- acceso por cursos o rutas;
- soporte para programas preconfigurados y rutas formativas;
- preparacion para multiples sedes, docentes y estudiantes;
- trazabilidad de asignaciones academicas.

## Objetivo del modulo

Modelar la asignacion academica real del estudiante dentro del LMS tecnico:

- matricula por curso;
- asignacion de ruta formativa;
- nivel academico aplicado a la asignacion;
- visibilidad derivada para contenido y modulos;
- enlace con progreso y evaluaciones.

## Entidades involucradas

### `StudentEnrollment`

Representa la matricula del estudiante a un curso concreto.

Campos obligatorios MVP:

- `institutionId`
- `studentId`
- `courseId`
- `status`
- `assignedByUserId`

Campos opcionales MVP:

- `learningPathAssignmentId`
- `assignedLevelCode`
- `notes`

### `StudentLearningPathAssignment`

Nueva entidad para asignar una ruta formativa al estudiante.

Campos obligatorios MVP:

- `institutionId`
- `studentId`
- `learningPathId`
- `assignedLevelCode`
- `status`
- `assignedByUserId`

Campos opcionales MVP:

- `effectiveFrom`
- `effectiveUntil`
- `notes`

### `StudentVisibilityAssignment`

Ya existe y se usara para derivar visibilidad por:

- ruta
- curso
- modulo
- nivel

## Relaciones

- un estudiante puede tener muchas matriculas de curso
- un estudiante puede tener muchas asignaciones de ruta en el tiempo
- una asignacion de ruta puede generar muchas matriculas de curso
- una matricula puede quedar ligada a una asignacion de ruta
- el progreso sigue siendo por `StudentEnrollment`

## Reglas de negocio

1. No se matricula a un usuario si no tiene `StudentAcademicProfile`.

2. No se matricula a un estudiante fuera de su institucion activa.

3. La matricula puede ser:

- directa a curso
- derivada de una ruta

4. Si se asigna una ruta, el sistema debe poder generar las matriculas de los cursos requeridos de esa ruta.

5. La visibilidad de contenido debe quedar alineada con:

- `assignedLevelCode`
- `StudentAcademicProfile.currentLevel`
- `StudentVisibilityAssignment`

6. El docente solo puede asignar o ver matriculas dentro de su alcance.

7. Toda asignacion academica debe auditarse.

## Como se asigna contenido segun nivel

La asignacion de contenido se resuelve en dos capas:

1. `StudentLearningPathAssignment` y `StudentEnrollment` determinan la pertenencia academica.
2. `StudentVisibilityAssignment` define la visibilidad fina por ruta, curso, modulo o nivel.

En MVP:

- al asignar una ruta se crea visibilidad de ruta y nivel
- al matricular a un curso se crea visibilidad de curso

## Como el docente administra acceso por nivel

El docente usa su `TeacherScopeAssignment` para:

- seleccionar estudiantes dentro de su alcance
- asignar ruta o curso
- declarar nivel aplicado a la asignacion
- generar visibilidad academica trazable

## MVP

Entra en MVP:

- matricula por curso con nivel asignado
- asignacion de ruta formativa al estudiante
- generacion de matriculas derivadas por cursos de la ruta
- visibilidad base generada desde ruta y curso
- trazabilidad de asignacion

## Fase posterior

Queda para siguiente fase:

- cohortes y grupos
- calendarios y ventanas de activacion
- prerequisitos complejos entre cursos
- reglas avanzadas de apertura/cierre por modulo

## Riesgos si se simplifica

Si se simplifica este modulo:

- la ruta formativa quedara desacoplada de la matricula
- el nivel del estudiante no controlara contenido de verdad
- el progreso seguira siendo cosmetico
- el docente no podra administrar acceso por nivel como exige el pliego
