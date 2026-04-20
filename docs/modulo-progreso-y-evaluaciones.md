# Modulo de progreso y evaluaciones

## Estado de esta decision

Este documento define el diseno del modulo antes de continuar implementacion.

No se acepta resolverlo como un sistema simple de quizzes y porcentajes.

Debe responder al pliego con seguimiento individual, evaluaciones pre y post, cuestionarios previos por modulo, practicas de comprobacion y restriccion de reintentos salvo autorizacion docente.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa:

- seguimiento individual por estudiante;
- control del avance en linea por separado;
- evaluaciones pre-curso;
- evaluaciones post-curso;
- cuestionarios previos al uso de cada modulo;
- practicas de comprobacion por segmento de contenido;
- restriccion de reintento salvo autorizacion del profesor;
- resultados administrados por la misma plataforma;
- visualizacion del progreso para el docente;
- integracion del progreso con simuladores.

## Modelo de progreso

El progreso no se mide con un solo porcentaje.

Se mide por `StudentEnrollment` y se compone de varios ejes:

- consumo de lecciones
- avance de segmentos
- practicas completadas
- evaluaciones aprobadas
- simuladores completados

### Niveles de seguimiento

#### `StudentProgress`

Consolidado por matricula.

#### `LessonProgress`

Estado de la leccion por matricula.

#### `LessonSegmentProgress`

Nueva entidad para progreso por segmento de contenido.

#### `PracticeAttempt`

Nueva entidad para practicas de comprobacion por segmento o leccion.

#### `QuizAttempt`

Intentos formales de evaluacion.

#### `SimulatorSession`

Actividad y resultado del simulador integrados al progreso.

## Metricas que se guardan

### En `StudentProgress`

MVP:

- `progressPct`
- `lessonsDone`
- `segmentsDone`
- `practicesDone`
- `quizzesPassed`
- `simulatorsDone`
- `lastActivityAt`

### En `QuizAttempt`

MVP:

- `score`
- `isPassed`
- `startedAt`
- `submittedAt`
- `attemptNumber`
- `attemptSource`
- `overrideGrantId`

### En `LessonSegmentProgress`

MVP:

- `lessonSegmentId`
- `enrollmentId`
- `completedAt`

### En `PracticeAttempt`

MVP:

- `practiceId`
- `enrollmentId`
- `studentId`
- `status`
- `score`
- `submittedAt`
- `notes`

## Flujo de evaluacion

### `PRE_COURSE`

- se habilita antes de iniciar formalmente el curso
- diagnostica el estado inicial
- no debe contarse igual que una evaluacion final

### `PRE_MODULE`

- se habilita antes del uso del modulo
- ayuda a verificar preparacion y activar contenido

### `POST_COURSE`

- mide cierre y logro de aprendizaje del curso

### `PRACTICE_CHECK`

- valida habilidad aplicada dentro de segmento, practica o leccion

## Autorizacion de reintento por parte del profesor

Se necesita una nueva entidad:

### `QuizRetakeGrant`

Campos obligatorios MVP:

- `quizId`
- `studentId`
- `grantedByUserId`
- `reason`
- `maxExtraAttempts`
- `createdAt`

Campos opcionales MVP:

- `expiresAt`
- `moduleId`
- `courseId`

### Regla

Si el estudiante agota los intentos base, solo puede volver a intentar si existe un `QuizRetakeGrant` vigente.

## Entidades y relaciones

### Nuevas entidades

- `LessonSegmentProgress`
- `PracticeAttempt`
- `QuizRetakeGrant`

### Ajustes a entidades existentes

#### `StudentProgress`

Agregar:

- `segmentsDone`
- `lastActivityAt`

#### `QuizAttempt`

Agregar:

- `attemptNumber`
- `attemptSource`
- `overrideGrantId`

#### `Practice`

Debe seguir ligada a leccion, pero el modulo debe soportar que una practica pueda validar habilidades de segmentos.

## Reglas de negocio

1. El progreso se calcula por matricula, no por usuario global.

2. Una evaluacion no puede contarse fuera de una matricula o contexto academico valido.

3. Los quizzes deben respetar `maxAttempts` salvo grant de reintento.

4. Un `QuizRetakeGrant` solo puede ser emitido por docente o admin con alcance.

5. Un segmento completado cuenta para progreso solo una vez por matricula.

6. La practica debe generar un intento o evidencia trazable, no solo un contador.

7. El progreso consolidado debe mezclar lecciones, segmentos, practicas, quizzes y simuladores segun pesos del curso.

## Integracion con cursos, modulos y simuladores

- `PRE_COURSE` y `POST_COURSE` se ligan a `Course`
- `PRE_MODULE` se liga a `Module`
- `PRACTICE_CHECK` puede ligarse a practica y afectar progreso de leccion
- `SimulatorSession` debe incrementar el eje de simuladores del progreso
- `LessonSegmentProgress` alimenta consumo real de contenido tecnico

## MVP

Entra en MVP:

- progreso por matricula enriquecido
- progreso por segmento
- intentos de practica
- quizzes con `attemptNumber`
- grants de reintento
- recálculo de progreso con lecciones, segmentos, practicas, quizzes y simuladores
- dashboard docente con resumen por matricula

## Fase posterior

Queda para siguiente fase:

- analytics avanzados por cohorte
- deteccion de riesgo academico
- rubricas complejas de practica
- evaluaciones adaptativas

## Riesgos si se simplifica

Si se simplifica este modulo:

- el progreso sera cosmetico
- los quizzes seguiran sin control docente real de reintentos
- las practicas quedaran sin trazabilidad propia
- el consumo de contenido tecnico no se medira con precision
- el docente no podra interpretar progreso real por estudiante
