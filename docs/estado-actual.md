# Estado actual del proyecto

## Nombre

`LMS`

## Repo

- Local: `~/LMS`
- GitHub: `https://github.com/leoa7x/LMS`

## Estado funcional

Ya quedaron definidos y documentados:

- documento rector
- alcance biblia
- requisitos funcionales iniciales
- arquitectura del LMS
- modelo de datos inicial
- backlog por fases
- estrategia de simuladores
- prompts de trabajo

En implementacion backend ya existen:

- auth
- roles
- usuarios
- instituciones
- licencias
- matriculas
- areas tecnicas
- cursos
- modulos
- lecciones
- practicas
- recursos de contenido
- glosario
- quizzes
- progreso
- dashboards
- auditoria minima
- simuladores

En frontend ya existen:

- shell administrativo base
- dashboard admin base
- vistas iniciales para academico, usuarios, simuladores y auditoria

## Referencias externas cargadas

- `references/github/public-apis/repo`
- `references/github/awesome-design-md/repo`

## Decision operativa importante

Antes de seguir desarrollando, cualquier sesion nueva debe tomar estos archivos como contexto minimo:

- `docs/flujo-de-trabajo.md`
- `docs/alcance-biblia.md`
- `docs/estado-actual.md`
- `prompts/main-prompt.md`

## Fase en curso

Fase 1 cerrada a nivel de bootstrap de codigo y validacion de build.

La base documental y el esqueleto tecnico ya fueron preparados. Prisma genera cliente, el backend compila y el frontend compila.

## Modulo endurecido contra pliego

Se rediseño e implemento el modulo de `usuarios y roles` para dejar de tratarlo como CRUD generico.

Cambios aplicados:

- `User` ahora incluye estado operativo, metadatos de identidad y trazabilidad de acceso
- `UserInstitution` paso a cubrir membresia institucional con vigencia, sede, laboratorio y licencia
- `UserRole` paso a soportar alcance y contexto operativo
- se agregaron `Campus`, `Laboratory`, `Permission`, `RolePermission`
- se agregaron `StudentAcademicProfile`, `TeacherScopeAssignment`, `AccessSession`, `UserLifecycleAudit`
- `auth` ahora valida estado del usuario, membresia activa, roles activos y crea sesiones trazables
- `users` ahora crea usuarios con membresia, asignacion de roles con alcance, perfil academico y auditoria de ciclo de vida

Migracion aplicada:

- `prisma/migrations/20260419211526_users_roles_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-usuarios-y-roles.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el modulo de `instituciones, sedes, laboratorios, licencias y vigencias`.

Cambios aplicados:

- `institutions` ahora expone instituciones con sedes y laboratorios relacionados
- se agregaron endpoints para crear y listar `campuses`
- se agregaron endpoints para crear y listar `laboratories`
- se agregaron endpoints para crear y listar `contract terms`
- `licenses` ahora valida consistencia con institucion y contrato
- se agregaron cambios de estado para institucion, sede y laboratorio

Documentacion rectora del modulo:

- `docs/modulo-instituciones-licencias-vigencias.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo academico` para dejar de tratar cursos y lecciones como jerarquia simple.

Cambios aplicados:

- se documento la jerarquia academica exacta en `docs/modulo-academico.md`
- `Course` ahora soporta `courseKind` para distinguir `STANDARD` y `PRECONFIGURED`
- `LearningPath` ahora soporta `levelCode`
- se agrego `LessonSegment` para contenido segmentado por leccion
- se agregaron endpoints para `lesson-segments`
- se agregaron endpoints para `learning-paths`
- se agregaron endpoints para `certification-tracks`
- `courses` y `lessons` ya incluyen estos nuevos elementos en sus lecturas

Migracion aplicada:

- `prisma/migrations/20260419213321_academic_module_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-academico.md`
- `prompts/cursos-modulos-rutas.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de matricula e inscripcion` para soportar nivel, ruta y visibilidad academica real.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-matricula-inscripcion.md`
- `StudentEnrollment` ahora soporta:
  - `learningPathAssignmentId`
  - `assignedByUserId`
  - `assignedLevelCode`
  - `notes`
- se agrego `StudentLearningPathAssignment`
- `enrollments` ahora soporta:
  - matricula directa a curso con nivel
  - asignacion de ruta formativa
  - generacion de matriculas derivadas por cursos de la ruta
  - generacion de visibilidad base por ruta y curso

Migracion aplicada:

- `prisma/migrations/20260419214711_enrollment_learning_paths/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-matricula-inscripcion.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de progreso y evaluaciones` para soportar seguimiento individual real, progreso por segmento, practicas trazables y reintentos autorizados por docente.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-progreso-y-evaluaciones.md`
- `StudentProgress` ahora soporta:
  - `segmentsDone`
  - `lastActivityAt`
- se agregaron:
  - `LessonSegmentProgress`
  - `PracticeAttempt`
  - `QuizRetakeGrant`
- `QuizAttempt` ahora soporta:
  - `attemptNumber`
  - `attemptSource`
  - `overrideGrantId`
- `progress` ahora soporta completitud por segmento
- `quizzes` ahora soporta grants de reintento y trazabilidad de intentos extendidos

Migracion aplicada:

- `prisma/migrations/20260419215601_progress_evaluation_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-progreso-y-evaluaciones.md`
- `prompts/progreso-y-evaluaciones.md`

## Estado de infraestructura local

- Docker operativo
- PostgreSQL local levantado por `docker compose`
- Migracion inicial aplicada
- Seed inicial ejecutado
- Migracion de usuarios y roles aplicada
- Seed actualizado ejecutado

## Instruccion para retomarlo

Si una sesion nueva necesita retomar el proyecto, la instruccion corta debe ser:

`Lee docs/flujo-de-trabajo.md, docs/estado-actual.md y prompts/main-prompt.md, y continua el LMS desde ahi.`
