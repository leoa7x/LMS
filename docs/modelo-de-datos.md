# Modelo de datos inicial

## Principios

- Separar identidad, catalogo academico, ejecucion academica y operacion.
- Evitar mezclar contenido, progreso y auditoria en la misma entidad.
- Dejar preparado el sistema para simuladores integrados.

## Entidades principales

### Identidad y acceso

- `User`
- `Role`
- `UserRole`
- `Institution`
- `UserInstitution`
- `ContractTerm`
- `License`

### Catalogo academico

- `TechnicalArea`
- `Course`
- `CourseTranslation`
- `Module`
- `Lesson`
- `Practice`
- `ContentResource`
- `GlossaryTerm`
- `LearningPath`
- `LearningPathCourse`
- `CertificationTrack`
- `CertificationTrackCourse`

### Evaluacion

- `Quiz`
- `Question`
- `AnswerOption`
- `QuizAttempt`
- `QuizAttemptAnswer`

### Ejecucion academica

- `StudentEnrollment`
- `StudentProgress`
- `LessonProgress`
- `PracticeSubmission`
- `SkillEvidence`

### Simulacion

- `Simulator`
- `SimulatorMapping`
- `SimulatorSession`
- `SimulatorEvent`

### Operacion

- `Notification`
- `SupportTicket`
- `AuditLog`

## Reglas de modelado

- Un `Course` pertenece a un `TechnicalArea`.
- Un `Course` tiene muchos `Module`.
- Un `Module` tiene muchas `Lesson`.
- Una `Lesson` puede tener muchas `Practice` y `ContentResource`.
- Una `LearningPath` agrupa cursos con orden y obligatoriedad.
- Un `CertificationTrack` define alineacion externa y evidencia requerida.
- `StudentProgress` consolida progreso academico global.
- `LessonProgress` y `SimulatorSession` alimentan el calculo de progreso.

## Medicion de progreso

El progreso del estudiante se calculara con peso configurable por curso:

- lecciones completadas
- practicas completadas
- quizzes obligatorios aprobados
- sesiones de simulador completadas

Formula base sugerida:

`progress = lessonWeight + practiceWeight + evaluationWeight + simulatorWeight`

Cada curso puede definir su distribucion, por ejemplo:

- lecciones: 20%
- practicas: 30%
- quizzes: 20%
- simuladores: 30%
