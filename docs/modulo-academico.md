# Modulo academico

## Estado de esta decision

Este documento define el diseno del modulo academico antes de continuar implementacion.

No se permite resolverlo como catalogo simple de cursos y lecciones.

Debe responder al pliego del sistema tecnico con simuladores virtuales, practicas, evaluaciones, rutas formativas y articulacion con certificaciones.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa:

- areas tecnicas del pliego;
- organizacion del contenido por areas, cursos, modulos y practicas;
- integracion de teoria, material didactico y simulacion;
- cuestionarios previos por modulo;
- evaluaciones pre-curso y post-curso;
- cursos preconfigurados y rutas tematicas completas;
- administracion de contenido visible segun nivel del estudiante;
- relacion con certificaciones externas;
- material bilingue y segmentado para aprendizaje tecnico.

## Jerarquia exacta del contenido

La jerarquia academica del sistema queda definida asi:

`Area tecnica > Curso > Modulo > Leccion > Segmento de contenido > Practica > Evaluacion`

### Justificacion

- `Area tecnica`: agrupa dominios mayores del pliego como Automatizacion, Electricidad, Industria 4.0 o Autotronica.
- `Curso`: unidad formativa principal evaluable y matriculable.
- `Modulo`: bloque tematico y de habilidades dentro del curso.
- `Leccion`: unidad pedagogica donde conviven teoria, recursos y actividades.
- `Segmento de contenido`: fragmento estructurado de una leccion, necesario para contenido tecnico denso, bilingue y con recursos heterogeneos.
- `Practica`: validacion aplicada de habilidades, ligada a la leccion y potencialmente al simulador.
- `Evaluacion`: medicion formal de entrada, progreso o cierre.

## Tipos de oferta academica

### `Curso normal`

Es una unidad academica independiente.

- se puede matricular por separado
- tiene modulos, lecciones, practicas y evaluaciones propias
- puede formar parte de rutas y certificaciones

### `Curso preconfigurado`

Es un curso ya armado para un objetivo tecnico concreto, con estructura y secuencia cerradas.

No es una ruta completa, pero si una unidad curricular prediseñada con:

- modulos requeridos
- practicas requeridas
- quizzes definidos
- progresion pedagogica prevista

### `Ruta formativa`

Es una secuencia ordenada de cursos, normales o preconfigurados, con reglas de avance y visibilidad.

La ruta:

- agrupa varios cursos
- define orden
- define obligatoriedad
- puede alinearse a nivel del estudiante
- puede mapearse a certificaciones externas

## Diferenciacion operativa

La diferenciacion de tipos queda asi:

- `Course`: entidad base
- `courseKind`: `STANDARD` o `PRECONFIGURED`
- `LearningPath`: entidad para rutas formativas
- `LearningPathCourse`: orden y obligatoriedad de cursos dentro de una ruta
- `CertificationTrack`: marco externo de certificacion

## Entidades y relaciones

### Entidades base

- `TechnicalArea`
- `Course`
- `Module`
- `Lesson`
- `LessonSegment`
- `Practice`
- `ContentResource`
- `Quiz`
- `Question`
- `AnswerOption`
- `LearningPath`
- `LearningPathCourse`
- `CertificationTrack`
- `CertificationTrackCourse`

### Ajustes requeridos al modelo

#### `Course`

Campos obligatorios MVP:

- `technicalAreaId`
- `slug`
- `titleEs`
- `courseKind`
- `isPublished`

Campos opcionales MVP:

- `code`
- `titleEn`
- `descriptionEs`
- `descriptionEn`
- `progressStrategy`
- pesos de progreso

#### `Module`

Campos obligatorios MVP:

- `courseId`
- `slug`
- `titleEs`
- `sortOrder`

Campos opcionales MVP:

- `titleEn`
- `description`

#### `Lesson`

Campos obligatorios MVP:

- `moduleId`
- `slug`
- `titleEs`
- `sortOrder`

Campos opcionales MVP:

- `titleEn`
- `summaryEs`
- `summaryEn`

#### `LessonSegment`

Nueva entidad obligatoria para el modulo academico.

Campos obligatorios MVP:

- `lessonId`
- `segmentType`
- `titleEs`
- `sortOrder`

Campos opcionales MVP:

- `titleEn`
- `bodyEs`
- `bodyEn`
- `resourceId`
- `voiceoverEnabled`

Justificacion:

El pliego exige contenido tecnico no trivial, glosario, vocalizacion opcional, material interactivo y mezcla de formatos. Eso no cabe limpiamente en una sola `Lesson`.

#### `Practice`

Campos obligatorios MVP:

- `lessonId`
- `titleEs`
- `requiresSimulator`

Campos opcionales MVP:

- `titleEn`
- `instructions`

#### `Quiz`

Debe soportar:

- `PRE_COURSE`
- `PRE_MODULE`
- `POST_COURSE`
- `PRACTICE_CHECK`

Ademas, en MVP:

- quiz por curso
- quiz por modulo
- intentos maximos
- puntaje aprobatorio

#### `LearningPath`

Representa ruta formativa.

Campos obligatorios MVP:

- `slug`
- `titleEs`

Campos opcionales MVP:

- `titleEn`
- `description`
- `levelCode`

#### `CertificationTrack`

Representa articulacion con certificacion externa.

Campos obligatorios MVP:

- `slug`
- `name`
- `issuer`

## Relaciones principales

- un `TechnicalArea` tiene muchos `Course`
- un `Course` tiene muchos `Module`
- un `Module` tiene muchas `Lesson`
- una `Lesson` tiene muchos `LessonSegment`
- una `Lesson` tiene muchas `Practice`
- una `Lesson` tiene muchos `ContentResource`
- un `Module` puede tener quizzes `PRE_MODULE`
- un `Course` puede tener quizzes `PRE_COURSE` y `POST_COURSE`
- una `LearningPath` agrupa `Course` mediante `LearningPathCourse`
- un `CertificationTrack` agrupa `Course` mediante `CertificationTrackCourse`

## Asignacion de contenido segun nivel del estudiante

La asignacion de contenido segun nivel no debe resolverse solo con matricula.

Se resuelve combinando:

- `StudentAcademicProfile.currentLevel`
- `StudentVisibilityAssignment`
- `StudentEnrollment`
- `LearningPath`

### Regla operativa

El estudiante puede ver contenido si se cumple al menos una de estas condiciones:

1. esta matriculado directamente en el curso;
2. el curso forma parte de una ruta asignada al estudiante;
3. existe una `StudentVisibilityAssignment` para el curso o modulo;
4. existe una regla de nivel compatible con su `currentLevel`.

## Como el docente administra acceso por nivel

El docente no habilita visibilidad global.

Lo hace dentro de su alcance mediante:

- `TeacherScopeAssignment`
- `StudentVisibilityAssignment`

### Flujo

1. el docente tiene alcance sobre curso, ruta, sede, laboratorio o nivel;
2. el docente selecciona un estudiante o grupo elegible;
3. el sistema permite habilitar:
   - ruta
   - curso
   - modulo
   - nivel
4. la visibilidad creada se guarda como regla trazable

## Reglas de negocio

1. Un curso no puede existir sin area tecnica.

2. Un modulo no puede existir sin curso.

3. Una leccion no puede existir sin modulo.

4. Un segmento no puede existir sin leccion.

5. Un quiz `PRE_MODULE` debe apuntar a un modulo.

6. Un quiz `PRE_COURSE` o `POST_COURSE` debe apuntar a un curso.

7. Una ruta formativa debe mantener orden explicito de cursos.

8. Un curso preconfigurado sigue siendo un curso, pero con estructura prediseñada y reusable.

9. Las certificaciones externas no reemplazan cursos ni rutas; los articulan.

10. El progreso academico debe considerar lecciones, practicas, evaluaciones y simuladores asociados.

## MVP

Entra en MVP:

- areas tecnicas
- cursos con tipo `STANDARD` y `PRECONFIGURED`
- modulos
- lecciones
- segmentos de contenido
- practicas
- quizzes por modulo y curso
- rutas formativas con `LearningPath`
- vinculacion inicial con certificaciones externas
- base de asignacion por nivel usando `StudentVisibilityAssignment`

## Fase posterior

Queda para siguiente fase:

- reglas avanzadas de prerequisitos entre cursos
- versionado curricular
- cohortes y calendarios academicos
- plantillas avanzadas de curso preconfigurado
- aprobaciones academicas y clonacion curricular sofisticada

## Riesgos si se simplifica

Si se simplifica este modulo:

- el LMS quedara como gestor de cursos generico
- no habra soporte real para contenido tecnico segmentado
- las rutas formativas quedaran confundidas con cursos
- el control por nivel sera artificial
- los quizzes pre/post no quedaran articulados correctamente
- la relacion con certificaciones externas quedara decorativa
