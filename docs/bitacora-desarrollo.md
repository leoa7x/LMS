# Bitacora de desarrollo

## 2026-04-18

### Contexto

Se definio que el proyecto consiste en construir un LMS tecnico profesional para el Instituto Profesional y Tecnico de Veraguas.

El documento fuente cargado al repo se establecio como la biblia funcional y academica del proyecto.

### Decisiones tomadas

- El sistema no se tratara como un LMS generico.
- La fuente principal de requisitos es `texto_extraido.md` y el PDF original asociado.
- Si algun punto no queda completamente cerrado en el documento, se debe proponer una decision razonable, justificarla y documentarla en `docs/`.
- Los simuladores no se asumiran propios por defecto.
- Todo simulador debe clasificarse como:
  - embebible existente
  - adaptacion de tercero
  - propio basico
  - propio avanzado
- El repo oficial del proyecto se llamara `LMS`.
- El repo debe existir local y en GitHub.

### Trabajo realizado

- Se ubico la carpeta del proyecto.
- Se identifico el PDF principal dentro de la carpeta de trabajo.
- Se confirmo que el PDF no era legible por extraccion directa confiable.
- Se instalo `poppler` para analisis PDF local.
- Se recibio el texto manualmente y se guardo en `texto_extraido.md`.
- Se inicializo el repo Git local.
- Se creo el repo remoto `https://github.com/leoa7x/LMS`.
- Se renombro la carpeta local de `LLM` a `LMS`.
- Se documentaron:
  - requisitos base
  - alcance biblia
  - requisitos funcionales iniciales
  - arquitectura del LMS
  - modelo de datos inicial
  - backlog por fases
  - estrategia de simuladores
  - flujo de trabajo
  - estado actual
- Se registraron prompts de trabajo en `prompts/`.
- Se crearon carpetas base del proyecto:
  - `docs/`
  - `prompts/`
  - `research/`
  - `references/`
  - `apps/`
  - `packages/`
  - `prisma/`
  - `infra/`
- Se clonaron referencias externas de apoyo:
  - `public-apis`
  - `awesome-design-md`

### Estado tecnico

- La documentacion base del proyecto ya existe.
- Hay un esqueleto inicial de Fase 0/Fase 1 preparado en el repo.
- El proyecto debe retomarse con cuidado para continuar implementacion sin romper el enfoque acordado.

### Pendientes inmediatos

- Mantener esta bitacora actualizada en cada bloque importante.
- Continuar Fase 1 de forma controlada.
- Validar el estado del bootstrap tecnico antes de seguir con instalacion y ejecucion.

### Actualizacion de Fase 1

- Se organizo el monorepo con:
  - `apps/api`
  - `apps/web`
  - `packages/shared`
  - `prisma/`
  - `infra/`
- Se documento la arquitectura, backlog, modelo de datos y decisiones de simuladores.
- Se definio un esquema Prisma inicial alineado al alcance del LMS.
- Se agrego seed inicial para usuario administrador.
- Se instalo dependencias con `npm install`.
- Se valido:
  - `npm run prisma:generate`
  - `npm run build:api`
  - `npm run build:web`
- Se genero migracion SQL inicial en:
  - `prisma/migrations/20260418212000_init/migration.sql`

### Bloqueo actual

- El bloqueo de Docker fue resuelto.
- Se levanto PostgreSQL con Docker.
- Se aplico la migracion inicial.
- Se ejecuto el seed correctamente.

### Estado de base de datos

- Contenedor PostgreSQL levantado por `docker compose`
- Migracion `init` aplicada
- Usuario administrador inicial creado:
  - correo: `admin@lms.local`

### Avance Fase 2

Se implemento la primera capa operativa de Fase 2 en backend:

- control de roles por decorator y guard
- listado de roles
- creacion y listado de usuarios
- creacion y listado de instituciones
- creacion y listado de licencias
- creacion y listado de matriculas

### Validacion

- `npm run build:api` compila correctamente con los modulos nuevos.

### Avance Fase 3

Se implemento la primera capa del catalogo academico en backend:

- areas tecnicas
- cursos
- modulos
- lecciones

### Endpoints ya disponibles

- `GET/POST /api/v1/technical-areas`
- `GET/POST /api/v1/courses`
- `GET/POST /api/v1/modules`
- `GET/POST /api/v1/lessons`

### Validacion adicional

- `npm run build:api` sigue compilando correctamente despues de agregar catalogo academico.

### Avance de contenido academico

Se implemento backend base para:

- practicas
- recursos de contenido
- glosario tecnico

### Endpoints nuevos

- `GET/POST /api/v1/practices`
- `GET/POST /api/v1/content-resources`
- `GET/POST /api/v1/glossary`

### Estado del backend

El backend ya cubre:

- identidad y roles
- administracion institucional basica
- matriculas
- catalogo academico
- contenido asociado a lecciones
- glosario global

### Avance Fase 4

Se implemento la primera capa de evaluacion:

- quizzes
- preguntas
- opciones de respuesta
- intentos de quiz

### Endpoints nuevos de evaluacion

- `GET/POST /api/v1/quizzes`
- `POST /api/v1/quizzes/questions`
- `GET /api/v1/quizzes/attempts`
- `POST /api/v1/quizzes/attempts`

### Comportamiento implementado

- soporte para quizzes `PRE_COURSE`, `PRE_MODULE`, `POST_COURSE` y `PRACTICE_CHECK`
- limite de intentos por quiz
- calculo de puntaje
- evaluacion de aprobado o reprobado
- actualizacion inicial del contador `quizzesPassed` en progreso del estudiante para quizzes ligados a curso

### Validacion

- `npm run build:api` compila correctamente despues de agregar la capa de quizzes.

## 2026-04-19

### Objetivo del dia

Continuar sobre Fase 5 del backend del LMS:

- progreso individual
- dashboards
- auditoria minima

### Trabajo realizado

Se implemento backend para:

- progreso consolidado por matricula
- marcacion de lecciones completadas
- marcacion de practicas completadas
- recalculo de progreso por pesos del curso
- dashboard administrativo
- dashboard docente
- dashboard de estudiante
- consulta de auditoria

### Endpoints nuevos

- `GET /api/v1/progress`
- `GET /api/v1/progress/student/:studentId`
- `POST /api/v1/progress/lessons/complete`
- `POST /api/v1/progress/practices/complete`
- `GET /api/v1/dashboard/admin`
- `GET /api/v1/dashboard/teacher`
- `GET /api/v1/dashboard/student/:studentId`
- `GET /api/v1/audit`

### Trazabilidad minima agregada

Se registra auditoria para acciones clave:

- creacion de usuario
- creacion de matricula
- creacion de curso
- creacion de quiz
- envio de intento de quiz
- completitud de leccion
- completitud de practica

### Validacion del dia

- `npm run build:api` compila correctamente con progreso, dashboard y auditoria.

### Avance Fase 6

Se implemento la primera capa del modulo de simuladores:

- catalogo de simuladores
- mapeo simulador a practica
- sesiones de simulador
- cierre de sesion con estado final
- trazabilidad de eventos clave de simulacion

### Endpoints nuevos de simuladores

- `GET/POST /api/v1/simulators`
- `GET/POST /api/v1/simulators/mappings`
- `GET/POST /api/v1/simulators/sessions`
- `POST /api/v1/simulators/sessions/complete`

### Taxonomia soportada

El backend ya soporta la clasificacion de simuladores en:

- `EMBEDDABLE_EXISTING`
- `THIRD_PARTY_ADAPTER`
- `NATIVE_BASIC`
- `NATIVE_ADVANCED`

### Validacion adicional

- `npm run build:api` compila correctamente con el modulo de simuladores.

### Avance frontend administrativo

Se implemento la primera capa visual del frontend administrativo siguiendo la direccion visual documentada para dashboard:

- shell administrativo con sidebar
- dashboard admin base
- vista academica
- vista de usuarios
- vista de simuladores
- vista de auditoria

### Criterio aplicado

La UI del dashboard sigue una linea:

- tecnica
- clara
- densa pero legible
- orientada a operacion y control

### Validacion frontend

- `npm run build:web` compila correctamente con las nuevas rutas administrativas.

### Avance de MVP funcional

Se implemento en frontend:

- login real contra backend
- almacenamiento local de sesion
- guard basico para panel administrativo
- consumo protegido de API desde frontend
- formularios administrativos iniciales para:
  - usuarios
  - matriculas
  - practicas
  - recursos
  - glosario

### Estado del panel admin

El panel administrativo ya no es solo maqueta.

Ahora consume backend y permite ejecutar acciones base del MVP.

### Instruccion de continuidad

Si una sesion nueva retoma el proyecto, debe leer:

- `docs/flujo-de-trabajo.md`
- `docs/estado-actual.md`
- `docs/bitacora-desarrollo.md`
- `prompts/main-prompt.md`

## 2026-04-19 - Pausa de implementacion y endurecimiento contra pliego

### Motivo

Se detuvo la implementacion para revisar arquitectura modulo por modulo contra el documento rector y evitar que el sistema derive hacia un LMS generico.

### Hallazgo principal

El modulo de usuarios y roles ya tenia base tecnica funcional, pero su arquitectura seguia siendo demasiado generica frente al pliego, especialmente en:

- control de acceso por nivel
- permisos con alcance institucional y academico
- vigencias y licencias conectadas a autenticacion
- ciclo de vida operativo del usuario

### Decision adoptada

Se definio una nueva regla operativa del proyecto:

- ningun modulo se diseña o implementa sin una trazabilidad explicita contra el pliego
- antes de implementar, se deben identificar requisitos cubiertos, entidades, relaciones, reglas de negocio, roles, validaciones y alcance MVP

### Artefactos agregados

- `docs/matriz-trazabilidad-modulos.md`

### Efecto practico

Esta matriz pasa a ser obligatoria antes de continuar con cualquier modulo del sistema.

## 2026-04-19 - Diseno formal del modulo de usuarios y roles

### Decision

Se congelo cualquier implementacion adicional del modulo de usuarios y roles hasta dejar documentado un diseno alineado con el pliego.

### Documento creado

- `docs/modulo-usuarios-y-roles.md`

### Criterios fijados

- usuarios y roles no se implementan como CRUD generico
- el rol debe tener alcance y contexto institucional
- debe existir relacion con institucion, sede y laboratorio
- debe existir vigencia o habilitacion de acceso
- el docente debe poder administrar contenido y estudiantes segun nivel
- debe existir trazabilidad del ciclo de vida del usuario

### Efecto sobre implementacion

La siguiente iteracion de este modulo debe partir de este diseno y no del esquema simplificado actual.

## 2026-04-19 - Implementacion del rediseño de usuarios y roles

### Objetivo

Aterrizar en codigo el rediseño del modulo de usuarios y roles para alinearlo con el pliego y dejar de operar sobre identidad plana.

### Cambios aplicados en datos

- se ampliaron `User`, `Institution`, `UserInstitution` y `UserRole`
- se agregaron estados de usuario, membresia y alcance
- se agregaron `Campus` y `Laboratory`
- se agregaron `Permission` y `RolePermission`
- se agregaron `StudentAcademicProfile` y `TeacherScopeAssignment`
- se agregaron `AccessSession` y `UserLifecycleAudit`

### Cambios aplicados en backend

- `CreateUserDto` ahora exige membresia y asignaciones de rol con alcance
- `UsersService` crea usuarios con contexto institucional, alcance, perfil academico y auditoria
- `UsersController` expone detalle y cambio de estado
- `AuthService` valida estado, vigencia y membresia activa antes de autenticar
- `AuthService` emite sesiones trazables y refrescos ligados a `AccessSession`
- `RolesService` ahora expone permisos por rol

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260419211526_users_roles_alignment/migration.sql`
- seed actualizado y ejecutado correctamente

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

El modulo de usuarios y roles ya no es solo identidad y login.

Ahora modela:

- contexto institucional
- sede y laboratorio
- alcance de rol
- vigencia de acceso
- perfil academico del estudiante
- alcance operativo del docente
- sesiones trazables
- auditoria del ciclo de vida

## 2026-04-19 - Implementacion del modulo de instituciones, sedes, laboratorios, licencias y vigencias

### Objetivo

Sacar este bloque de un CRUD plano y alinearlo con el pliego para soportar operacion multisede, laboratorios tecnicos y vigencia contractual real.

### Documento rector agregado

- `docs/modulo-instituciones-licencias-vigencias.md`

### Cambios aplicados en backend

- `CreateInstitutionDto` ahora soporta estado, codigo oficial y correo de contacto
- se agregaron `CreateCampusDto`, `CreateLaboratoryDto`, `CreateContractTermDto`
- `InstitutionsService` ahora maneja:
  - instituciones con relaciones
  - sedes
  - laboratorios
  - cambios de estado
- `LicensesService` ahora maneja:
  - contratos
  - licencias con validacion de consistencia institucional
- `InstitutionsController` y `LicensesController` exponen endpoints para estos recursos

### Reglas implementadas

- no se crean sedes sobre instituciones inactivas
- no se crean laboratorios sobre sedes o instituciones inactivas
- `endAt` debe ser mayor que `startAt` en contratos
- una licencia no puede enlazarse a un contrato de otra institucion

### Validacion

- `npm run build:api` correcto

### Efecto practico

El LMS ya tiene base operativa para:

- institucion
- sede
- laboratorio
- contrato
- licencia

Esto deja mejor conectado el contexto institucional con usuarios, acceso y crecimiento multisede.

## 2026-04-19 - Nuevo prompt rector para modulo academico

### Prompt agregado

- `prompts/cursos-modulos-rutas.md`

### Efecto practico

Antes de continuar con cursos, modulos, rutas y programas preconfigurados, el trabajo debe responder tambien a este prompt, ademas del pliego y la matriz de trazabilidad.

## 2026-04-19 - Nuevo prompt rector para progreso y evaluaciones

### Prompt agregado

- `prompts/progreso-y-evaluaciones.md`

### Efecto practico

Antes de continuar con progreso y evaluaciones, el trabajo debe responder tambien a este prompt, ademas del pliego y la matriz de trazabilidad.

## 2026-04-19 - Implementacion inicial del modulo academico

### Documentos rectores usados

- `prompts/cursos-modulos-rutas.md`
- `docs/modulo-academico.md`

### Objetivo

Endurecer el modulo academico para que no quede en `course > module > lesson` como estructura escolar simple.

### Cambios aplicados en modelo

- se agrego `CourseKind` para distinguir cursos `STANDARD` y `PRECONFIGURED`
- se agrego `LessonSegmentType`
- se agrego `LessonSegment`
- se agrego `levelCode` a `LearningPath`

### Cambios aplicados en backend

- `CreateCourseDto` ahora soporta tipo de curso
- se agrego modulo `lesson-segments`
- se agrego modulo `learning-paths`
- se agrego modulo `certification-tracks`
- `courses` y `lessons` ahora exponen mejor la nueva estructura academica

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260419213321_academic_module_alignment/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La base academica del LMS ya soporta:

- areas tecnicas
- cursos normales y preconfigurados
- modulos
- lecciones
- segmentos de contenido
- practicas
- quizzes por modulo y curso
- rutas formativas
- articulacion inicial con certificaciones externas

## 2026-04-19 - Implementacion del modulo de matricula e inscripcion

### Documento rector agregado

- `docs/modulo-matricula-inscripcion.md`

### Objetivo

Evitar una matricula plana y conectar nivel del estudiante, rutas formativas, visibilidad y progreso con la asignacion academica real.

### Cambios aplicados en modelo

- se amplio `StudentEnrollment`
- se agrego `StudentLearningPathAssignment`

### Cambios aplicados en backend

- `CreateEnrollmentDto` ahora soporta nivel y asignacion
- se agrego `AssignLearningPathDto`
- `EnrollmentsService` ahora soporta:
  - matricula directa por curso
  - asignacion de ruta
  - generacion de matriculas derivadas
  - visibilidad base por ruta y curso
- `EnrollmentsController` ahora expone:
  - `GET /enrollments/learning-path-assignments`
  - `POST /enrollments/learning-paths/assign`

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260419214711_enrollment_learning_paths/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La seccion de matricula e inscripcion ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- matricula por curso con nivel aplicado
- asignacion de rutas formativas
- matriculas derivadas desde rutas
- visibilidad academica base alineada con nivel y ruta

## 2026-04-19 - Implementacion del modulo de progreso y evaluaciones

### Documentos rectores usados

- `prompts/progreso-y-evaluaciones.md`
- `docs/modulo-progreso-y-evaluaciones.md`

### Objetivo

Pasar de progreso cosmetico y quizzes simples a un modulo con seguimiento individual, progreso por segmento, practicas trazables y reintentos autorizados.

### Cambios aplicados en modelo

- se agrego `PracticeAttemptStatus`
- se agrego `QuizAttemptSource`
- se ampliaron `StudentProgress` y `QuizAttempt`
- se agregaron:
  - `LessonSegmentProgress`
  - `PracticeAttempt`
  - `QuizRetakeGrant`

### Cambios aplicados en backend

- `ProgressService` ahora soporta:
  - completitud de leccion
  - completitud de segmento
  - intento de practica
  - recalculo enriquecido de progreso
- `ProgressController` ahora expone `POST /progress/segments/complete`
- `QuizzesService` ahora soporta:
  - grants de reintento
  - intentos con `attemptNumber`
  - intentos con `attemptSource`
  - integracion con recálculo de progreso
- `QuizzesController` ahora expone:
  - `GET /quizzes/retake-grants`
  - `POST /quizzes/retake-grants`

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260419215601_progress_evaluation_alignment/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La seccion de progreso y evaluaciones ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- seguimiento individual por matricula
- progreso por leccion y segmento
- practicas con intento trazable
- evaluaciones con intentos numerados
- reintentos autorizados por docente
- integracion del progreso con quizzes y simuladores
