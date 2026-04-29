# Bitacora de desarrollo

## 2026-04-21

### Identidad visual base de NOVOMEDIAlms

- Se documento la identidad visual base del producto en `docs/identidad-visual-novomedialms.md`.
- Se adopto la direccion `Institucional Tecnica` como linea visual recomendada.
- Se aplico el nombre `NOVOMEDIAlms` al frontend.
- Se incorporaron tokens base de color, un isotipo simple reutilizable y favicon.
- Se actualizaron portada, login y shells principales para reflejar la marca sin afectar la logica funcional.
- Se reemplazo la leyenda superior visible por:
  - `El ecosistema definitivo de simulacion y E-Learning tecnico`
- Se actualizo el nombre de institucion cargado por seed para que el frontend no vuelva a mostrar `Instituto Profesional y Tecnico de Veraguas` en vistas alimentadas por datos reales.

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
  - definido por variables de entorno de desarrollo local

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

## 2026-04-20 - Nuevo prompt rector para contenidos, glosario y bilinguismo

### Prompt agregado

- `prompts/contenidos-glosario-bilinguismo.md`

### Efecto practico

Antes de continuar con contenidos, glosario, bilinguismo y recursos del portal, el trabajo debe responder tambien a este prompt, ademas del pliego y la matriz de trazabilidad.

## 2026-04-20 - Nuevo prompt rector para institucional y acceso

### Prompt agregado

- `prompts/institucional-y-acceso.md`

### Efecto practico

Aunque el modulo institucional y de acceso ya fue endurecido, cualquier ajuste posterior sobre instituciones, sedes, laboratorios, vigencia y acceso debe responder tambien a este prompt, ademas del pliego y la matriz de trazabilidad.

## 2026-04-20 - Nuevo prompt rector para simuladores integrados

### Prompt agregado

- `prompts/simuladores-integracion.md`

### Efecto practico

El siguiente bloque en el orden de trabajo es simuladores. A partir de aqui, cualquier ajuste del modulo debe responder tambien a este prompt, ademas del pliego y la matriz de trazabilidad.

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

## 2026-04-20 - Validacion del modulo de simuladores

### Documentos rectores usados

- `prompts/simuladores-integracion.md`
- `docs/modulo-simuladores.md`

### Objetivo

Confirmar que simuladores siga integrado al flujo academico y no como modulo aislado.

### Resultado

- se documento formalmente la arquitectura del modulo
- se confirmo que la base backend ya soporta:
  - catalogo
  - taxonomia de simuladores
  - mapeo a practicas
  - sesiones por estudiante
  - trazabilidad de uso
  - integracion base con progreso

### Validacion

- `npm run build:api` correcto despues de la revision

## 2026-04-20 - Implementacion del modulo de contenidos, glosario y bilinguismo

### Documentos rectores usados

- `prompts/contenidos-glosario-bilinguismo.md`
- `docs/modulo-contenidos-glosario-bilinguismo.md`

### Objetivo

Pasar de recursos sueltos a un modulo de contenidos versionado, bilingue, enlazado al glosario y preparado para exportacion PDF por modulo.

### Cambios aplicados en modelo

- `ContentResource` ahora soporta:
  - `versions`
  - `glossaryLinks`
- `GlossaryTerm` ahora soporta:
  - `relations`
- `Module` ahora soporta:
  - `pdfExportTemplate`
- se agregaron:
  - `ContentResourceVersion`
  - `GlossaryTermRelation`
  - `ModulePdfExportTemplate`

### Cambios aplicados en backend

- `content-resources` ahora soporta:
  - version inicial automatica al crear contenido
  - nuevas versiones
  - consulta de plantillas PDF
  - configuracion de plantilla PDF por modulo
- `glossary` ahora soporta relaciones explicitas entre terminos y recursos

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260420131312_content_glossary_bilingual_alignment/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La seccion de contenidos, glosario y bilinguismo ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- contenido bilingue versionado
- enlazado de glosario tecnico a recursos de contenido
- configuracion de exportacion PDF por modulo
- base para material interactivo y vocalizacion sobre el mismo portal

## 2026-04-20 - Implementacion del modulo de reportes y dashboards

### Documento rector agregado

- `docs/modulo-reportes-y-dashboards.md`

### Objetivo

Sacar dashboards y reportes del terreno generico y alinearlos a institucion activa, alcance docente y seguimiento real del estudiante.

### Cambios aplicados en backend

- `dashboard/admin` ahora entrega lectura institucional operativa
- `dashboard/teacher` ahora calcula alcance real por `TeacherScopeAssignment`
- `dashboard/student/me` ahora expone resumen propio del estudiante
- se agrego `ReportsController`
- se agregaron endpoints:
  - `GET /reports/courses/:courseId/summary`
  - `GET /reports/students/:studentId/summary`

### Reglas implementadas

- el admin opera dentro de la institucion activa del token
- el docente solo puede ver cursos y estudiantes dentro de su alcance
- el estudiante solo puede ver su propio resumen
- los reportes mezclan progreso, practicas, quizzes y simuladores

### Validacion

- `npm run build:api` correcto

### Efecto practico

La seccion de reportes y dashboards ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- dashboard institucional para administracion
- dashboard docente con alumnos y cursos dentro de alcance
- dashboard propio del estudiante
- reportes accionables de curso y estudiante

## 2026-04-20 - Implementacion del modulo de soporte tecnico

### Documento rector agregado

- `docs/modulo-soporte-tecnico.md`

### Objetivo

Convertir soporte en un modulo institucional real con SLA, comentarios, responsable y contexto de sede/laboratorio.

### Cambios aplicados en modelo

- `SupportTicket` ahora soporta:
  - `institutionId`
  - `campusId`
  - `laboratoryId`
  - `assignedToUserId`
  - `slaPolicyId`
  - `category`
  - `priority`
  - `responseDueAt`
  - `resolutionDueAt`
  - `firstRespondedAt`
  - `resolvedAt`
  - `closedAt`
- se agregaron:
  - `SupportTicketComment`
  - `SupportSlaPolicy`
  - enum `SupportTicketPriority`

### Cambios aplicados en backend

- se agrego modulo `support`
- se agregaron endpoints:
  - `GET /support/tickets`
  - `GET /support/tickets/:ticketId`
  - `POST /support/tickets`
  - `POST /support/tickets/:ticketId/comments`
  - `PATCH /support/tickets/:ticketId`
  - `GET /support/sla-policies`
  - `POST /support/sla-policies`
- se implementaron reglas de acceso por rol
- se implemento calculo de SLA con 48h por defecto
- se agrego auditoria para creacion, comentario y actualizacion de ticket

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260420132539_support_module_alignment/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La seccion de soporte tecnico ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- tickets institucionales con contexto de sede y laboratorio
- SLA configurable por institucion
- comentarios y primera respuesta trazable
- asignacion operativa a admin o soporte

## 2026-04-20 - Implementacion del modulo de notificaciones y correo

### Documento rector agregado

- `docs/modulo-notificaciones-y-correo.md`

### Objetivo

Resolver notificaciones internas y correo como parte del dominio del LMS, incluyendo envio de practicas de demostracion y trazabilidad de entrega.

### Cambios aplicados en modelo

- `Notification` ahora soporta:
  - `institutionId`
  - `templateId`
  - `channel`
  - `status`
  - `entityType`
  - `entityId`
  - `readAt`
  - `sentAt`
- se agregaron:
  - `NotificationTemplate`
  - `EmailDelivery`
  - enums `NotificationChannel`
  - `NotificationStatus`

### Cambios aplicados en backend

- se agrego modulo `notifications`
- se agregaron endpoints:
  - `GET /notifications/mine`
  - `PATCH /notifications/:notificationId/read`
  - `GET /notifications/templates`
  - `POST /notifications/templates`
  - `POST /notifications`
  - `POST /notifications/practice-demonstrations`
- se implemento creacion de notificaciones internas
- se implemento registro de entrega por correo
- se implemento envio de practicas de demostracion con trazabilidad

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260420134845_notifications_email_alignment/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La seccion de notificaciones y correo ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- notificaciones internas por usuario
- plantillas institucionales
- registro de entrega por correo
- envio de practicas de demostracion desde el LMS

## 2026-04-20 - Implementacion del modulo de auditoria

### Documento rector agregado

- `docs/modulo-auditoria.md`

### Objetivo

Convertir auditoria en una capacidad operativa real con contexto institucional, sesion y eventos de acceso.

### Cambios aplicados en modelo

- `AuditLog` ahora soporta:
  - `institutionId`
  - `institutionMemberId`
  - `sessionId`
  - `actorRoles`
  - `ipAddress`
  - `userAgent`
- se agrego:
  - `AccessEventLog`
  - enum `AccessEventType`

### Cambios aplicados en backend

- `audit` ahora soporta filtros basicos
- se agrego endpoint:
  - `GET /audit/access-events`
- `auth` ahora soporta:
  - `POST /auth/logout`
  - registro de `LOGIN_SUCCESS`
  - registro de `TOKEN_REFRESH`
  - registro de `LOGOUT`

### Persistencia aplicada

- migracion creada y aplicada:
  - `prisma/migrations/20260420135745_audit_alignment/migration.sql`

### Validacion

- `npx prisma validate` correcto
- `npx prisma generate` correcto
- `npm run build:api` correcto

### Efecto practico

La seccion de auditoria ya quedo cerrada a nivel de backend base.

Ahora el LMS soporta:

- auditoria institucional filtrable
- historial de eventos de acceso
- trazabilidad de login, refresh y logout
- contexto de actor, sesion e institucion en auditoria

## 2026-04-20 - Cierre de bloqueo critico: acceso operativo, vigencia y concurrencia

### Documento rector agregado

- `docs/modulo-acceso-operativo.md`

### Objetivo

Hacer efectivo el requisito de acceso por vigencia, 36 meses, contrato y concurrencia antes de pasar al frontend del MVP.

### Cambios aplicados en backend

- se agrego modulo `access-policy`
- se agrego `AccessPolicyService`
- `auth` ahora delega en ese servicio para:
  - resolver membresia valida
  - calcular ventana efectiva
  - validar contrato activo
  - aplicar concurrencia por `ContractTerm.concurrentCap`
  - aplicar concurrencia por `License.seats`
- `users` ahora valida consistencia entre institucion, licencia y contrato
- `users` ahora deriva `accessEndAt` efectivo al crear membresias

### Validacion

- `npm run build:api` correcto

### Efecto practico

El primer bloqueo critico de la oleada 1 ya quedo cerrado.

Ahora el LMS ya no trata vigencia y licenciamiento como metadata pasiva; el acceso real depende de esas reglas.

## 2026-04-20 - Cierre de bloqueo critico: visibilidad por nivel y alcance academico

### Documento rector agregado

- `docs/modulo-visibilidad-por-nivel.md`

### Objetivo

Hacer efectiva la administracion por nivel para que el backend no entregue catalogo y contenido academico de manera plana.

### Cambios aplicados en backend

- se agrego modulo `academic-visibility`
- se agrego `AcademicVisibilityService`
- el servicio resuelve `accessibleCourseIds` por usuario
- se aplico visibilidad en:
  - cursos
  - modulos
  - lecciones
  - practicas
  - quizzes
  - simuladores
- se habilito lectura filtrada para `STUDENT` en endpoints de contenido donde hacia falta

### Validacion

- `npm run build:api` correcto

### Efecto practico

El segundo bloqueo critico de la oleada 1 ya quedo cerrado.

Ahora el backend ya no expone el catalogo academico solo por rol; tambien lo restringe por nivel, ruta y alcance.

## 2026-04-20 - Cierre de bloqueo critico: bilinguismo transversal backend

### Documento rector agregado

- `docs/modulo-bilinguismo-transversal.md`

### Objetivo

Dar al frontend una resolucion de idioma consistente desde backend para catalogo, contenido, evaluaciones y glosario.

### Cambios aplicados en backend

- se agrego modulo `i18n`
- se agrego `I18nService`
- se resolvio idioma efectivo por query, preferencia de usuario y fallback a espanol
- se agregaron campos localizados en:
  - cursos
  - modulos
  - lecciones
  - practicas
  - quizzes
  - content-resources
  - glossary

### Validacion

- `npm run build:api` correcto

### Efecto practico

El tercer bloqueo critico de la oleada 1 ya quedo cerrado.

Ahora el backend devuelve contenido academico localizado de forma consistente y con fallback a espanol.

## 2026-04-20 - Cierre de bloqueo critico: administracion centralizada coherente

### Documento rector agregado

- `docs/modulo-administracion-centralizada.md`

### Objetivo

Hacer que los modulos administrativos troncales operen dentro del contexto institucional activo y dejen de aceptar referencias inconsistentes entre usuarios, licencias, contratos y matriculas.

### Cambios aplicados en backend

- se agrego modulo `administration-scope`
- se agrego `AdministrationScopeService`
- se corrigio `users` para que:
  - liste usuarios solo dentro de la institucion activa
  - resuelva detalle de usuario dentro del contexto institucional
  - valide creacion de membresia dentro de la institucion activa
- se corrigio `institutions` para que sedes y laboratorios operen bajo la institucion activa
- se corrigio `licenses` para que:
  - liste licencias y contratos por institucion activa
  - cree contratos y licencias solo dentro de la institucion activa
- se corrigio `enrollments` para que:
  - liste matriculas y asignaciones de ruta por institucion activa
  - valide `institutionId` contra el contexto autenticado
  - impida `assignedByUserId` inconsistente con el usuario autenticado

### Validacion

- `npm run build:api` correcto

### Efecto practico

El cuarto cierre critico de la oleada 1 ya quedo resuelto.

Ahora los modulos administrativos troncales del LMS comparten el mismo criterio institucional y dejan de mezclar datos fuera del contexto activo.

## 2026-04-20 - Cierre de consistencia funcional: resultados consolidados

### Documento rector agregado

- `docs/modulo-resultados-consolidados.md`

### Objetivo

Cerrar la brecha entre progreso, evaluaciones, practicas y simuladores para exponer resultado academico real por matricula y por ruta formativa.

### Cambios aplicados en backend

- se agrego resultado consolidado por matricula:
  - `GET /reports/enrollments/:enrollmentId/result`
- se agrego resultado consolidado por ruta formativa:
  - `GET /reports/learning-path-assignments/:assignmentId/result`
- la consolidacion ahora integra:
  - progreso por matricula
  - evaluaciones `PRE_COURSE`
  - evaluaciones `POST_COURSE`
  - cuestionarios `PRE_MODULE`
  - `PRACTICE_CHECK`
  - practicas trazables
  - sesiones de simulador
  - decision final por matricula
- las rutas formativas ahora entregan:
  - cursos requeridos
  - cursos requeridos aprobados o completados
  - progreso promedio
  - score final promedio
  - certificaciones relacionadas

### Validacion

- `npm run build:api` correcto

### Efecto practico

El backend ya no devuelve solo telemetria academica dispersa.

Ahora el LMS puede responder con resultado consolidado por estudiante y ruta, que es lo que necesita el frontend del MVP para operar sin rehacer logica academica.

## 2026-04-20 - Cierre de consistencia funcional: rutas preconfiguradas con secuencia minima

### Documento rector agregado

- `docs/modulo-rutas-preconfiguradas.md`

### Objetivo

Hacer que las rutas formativas dejen de ser listas de cursos y pasen a exponer orden, bloqueo y desbloqueo basico por estudiante.

### Cambios aplicados en backend

- se agrego lectura de secuencia por ruta asignada:
  - `GET /learning-paths/assignments/:assignmentId/sequence`
- la secuencia ahora calcula por curso:
  - `LOCKED`
  - `UNLOCKED`
  - `COMPLETED`
- el desbloqueo considera:
  - `sortOrder`
  - cursos requeridos previos
  - estado de matricula
  - aprobacion por `POST_COURSE`
  - progreso consolidado
- la lectura ya respeta acceso de:
  - admin
  - soporte
  - docente con alcance
  - estudiante propietario

### Validacion

- `npm run build:api` correcto

### Efecto practico

Las rutas del LMS ya pueden gobernar secuencia minima en el MVP.

Eso evita que el frontend tenga que inventar la logica de desbloqueo por fuera del backend.

## 2026-04-20 - Cierre de consistencia funcional: exportacion PDF basica

### Documento rector agregado

- `docs/modulo-exportacion-pdf.md`

### Objetivo

Convertir la plantilla PDF por modulo en una exportacion real desde backend, alineada al requisito explicito del pliego.

### Cambios aplicados en backend

- se agrego endpoint:
  - `GET /content-resources/modules/:moduleId/pdf-export`
- la exportacion ahora usa:
  - plantilla del modulo
  - idioma efectivo
  - matricula del estudiante
  - progreso del modulo
  - resumen de practicas
  - evidencias de habilidad
- el backend genera un PDF valido y descargable para el modulo

### Validacion

- `npm run build:api` correcto

### Efecto practico

El LMS ya puede responder con un PDF real de habilidades desarrolladas por modulo sin delegar esa logica al frontend.

## 2026-04-20 - Cierre de consistencia funcional: soporte y SLA operativo

### Documento rector agregado

- `docs/modulo-sla-operativo.md`

### Objetivo

Hacer que el soporte tecnico del LMS entregue lectura real de cumplimiento del SLA exigido por el pliego.

### Cambios aplicados en backend

- los tickets ahora salen enriquecidos con:
  - `responseBreached`
  - `resolutionBreached`
  - `responseHoursRemaining`
  - `resolutionHoursRemaining`
- se agrego resumen operacional:
  - `GET /support/operations/summary`
- el resumen institucional ahora expone:
  - tickets abiertos
  - tickets en progreso
  - tickets vencidos de respuesta
  - tickets vencidos de resolucion
  - tickets proximos a vencer

### Validacion

- `npm run build:api` correcto

### Efecto practico

El backend ya puede medir cumplimiento operativo del soporte local comprometido en el pliego, no solo almacenar tickets y fechas.

## 2026-04-20 - Cierre de consistencia funcional: simuladores integrados minimos

### Documento rector agregado

- `docs/modulo-simuladores-integracion-minima.md`

### Objetivo

Cerrar la integracion minima entre simulador, practica, matricula y trazabilidad dentro del LMS antes de pasar a frontend.

### Cambios aplicados en backend

- la apertura de sesion ahora valida:
  - matricula valida
  - estudiante correcto
  - mapeo a practicas del curso
- se agrego contexto academico por sesion:
  - `GET /simulators/sessions/:sessionId/context`
- se agrego registro de eventos minimos:
  - `POST /simulators/sessions/events`
- al completar sesion, el backend genera evidencia academica basica ligada a practicas mapeadas

### Validacion

- `npm run build:api` correcto

### Efecto practico

Los simuladores ya no quedan como piezas separadas del flujo academico.

El backend ahora puede validar, contextualizar y trazar uso minimo real del simulador dentro del LMS.

## 2026-04-20 - Frontend MVP Oleada 1

### Objetivo

Abrir frontend real del MVP sobre backend ya cerrado, sin panel generico y con experiencia diferenciada por rol.

### Cambios aplicados

- se agrego navegacion por rol
- se agrego `PortalShell`
- se agrego `RoleGuard`
- el login ahora redirige segun rol activo
- se implementaron dashboards funcionales para:
  - admin
  - docente
  - estudiante
- se implementaron vistas de Oleada 1 para:
  - usuarios
  - institucion, sedes y laboratorios
  - cursos y rutas
  - contenidos
  - cursos docente
  - contenidos docente
  - cursos estudiante
  - contenidos estudiante

### Validacion

- `npm run build:web` correcto

### Efecto practico

El frontend del LMS ya no es solo una maqueta administrativa.

La primera oleada funcional ya quedo montada sobre el backend real y separada por rol, manteniendo la operacion academica e institucional como prioridad.

## 2026-04-20 - Frontend MVP Oleada 2

### Objetivo

Extender el frontend del MVP sobre la base backend ya cerrada para cubrir progreso, evaluaciones, resultados consolidados, bilinguismo visible y exportacion PDF.

### Cambios aplicados

- se agregaron vistas de progreso para:
  - admin
  - docente
  - estudiante
- se agregaron vistas de evaluaciones para:
  - admin
  - docente
  - estudiante
- se agregaron vistas de resultados consolidados para:
  - admin
  - docente
  - estudiante
- se expuso el bilinguismo visible en UI mediante selector de idioma en evaluaciones y contenidos
- se conecto la exportacion PDF por modulo desde las vistas de resultados
- se ajusto la navegacion por rol para incorporar:
  - progreso
  - evaluaciones
  - resultados

### Validacion

- `npm run build:web` correcto

### Efecto practico

El frontend del MVP ya cubre la operacion academica central del pliego en su parte visual inicial.

La experiencia por rol ya permite navegar entre cursos, contenidos, progreso, evaluaciones y resultados sobre contratos reales del backend, sin caer en un panel generico.

## 2026-04-20 - Frontend MVP Oleada 3

### Objetivo

Cerrar el MVP visual sobre los modulos del pliego que quedaban pendientes antes de considerar el frontend base como completo: simuladores, soporte y vistas administrativas consolidadas.

### Cambios aplicados

- se reescribio la vista administrativa de simuladores sobre `PortalShell`
- se agregaron vistas de simuladores para:
  - admin
  - docente
  - estudiante
- la vista del estudiante ahora permite:
  - abrir sesion de simulador
  - cargar contexto academico
  - registrar eventos minimos
  - completar sesion
- se agregaron vistas de soporte para:
  - admin y soporte
  - docente
  - estudiante
- la vista administrativa de soporte ahora cubre:
  - tickets
  - SLA operativo
  - comentarios internos
  - creacion de politicas SLA
- se reescribio la vista de auditoria administrativa sobre `PortalShell`
- se amplio la navegacion por rol para incorporar:
  - simuladores
  - soporte
  - auditoria

### Validacion

- `npm run build:web` correcto

### Efecto practico

El frontend MVP ya cubre las tres oleadas definidas en los prompts rectores.

La interfaz ahora refleja la operacion institucional, academica, de soporte y de simuladores sobre endpoints reales del backend, manteniendo el tono sobrio y funcional exigido por el proyecto.

## 2026-04-20 - Fase 7 inicial: despliegue local integrado

### Objetivo

Cerrar la base de despliegue local del LMS para poder levantar `postgres`, `api` y `web` como sistema integrado y no solo por procesos sueltos.

### Cambios aplicados

- se agrego `.dockerignore`
- se agrego `apps/api/Dockerfile`
- se agrego `apps/web/Dockerfile`
- se amplio `docker-compose.yml` para incluir:
  - `postgres`
  - `api`
  - `web`
- se actualizaron scripts raiz para:
  - `build`
  - `compose:up`
  - `compose:down`
  - `start:api`
  - `start:web`
  - `prisma:deploy`
- se actualizo `.env.example` con `WEB_ORIGIN`
- se documento operacion en:
  - `docs/despliegue-local.md`
  - `docs/comandos-locales.md`
  - `infra/README.md`

### Validacion

- `npm run build:api` correcto
- `npm run build:web` correcto
- `docker compose config` correcto
- `docker compose build api web` correcto

### Efecto practico

El proyecto ya queda preparado para iniciar endurecimiento y despliegue local real sobre contenedores, alineado con la Fase 7 del backlog.

## 2026-04-20 - Fase 7 inicial: hardening de sesion frontend

### Objetivo

Mejorar la estabilidad operativa del frontend para que el acceso al portal no dependa solo del `access token` inicial y pueda sostener sesion real con `refresh token`.

### Cambios aplicados

- se agrego `apps/web/lib/session.ts`
- se centralizo el contrato de sesion para:
  - `auth-provider`
  - `login`
  - `client-api`
- `client-api` ahora intenta `refresh` automatico cuando una peticion devuelve `401`
- se serializa la sesion refrescada en `localStorage`
- `logout` ahora intenta revocar la sesion en backend antes de limpiar el estado local

### Validacion

- `npm run build:web` correcto

### Efecto practico

El frontend queda mas cercano a operacion real continua, alineado con el requisito de acceso sostenido y administracion formal del portal.

## 2026-04-20 - Fase 7 inicial: validacion de arranque integrado

### Objetivo

Confirmar que el LMS no solo compila, sino que arranca como stack integrado real con `postgres`, `api` y `web`.

### Cambios aplicados

- se detecto un fallo real de arranque en Nest:
  - `QuizzesService` dependia de `ProgressService`
  - `QuizzesModule` no importaba `ProgressModule`
- se corrigio el wiring en:
  - `apps/api/src/quizzes/quizzes.module.ts`

### Validacion

- `npm run build:api` correcto
- `docker compose up -d --build` correcto
- `docker compose ps` correcto
- `curl http://localhost:4000/api/v1/health` correcto
- `curl -I http://localhost:3000` correcto

### Efecto practico

El LMS ya arranca como sistema integrado real en local, con API saludable y frontend sirviendo correctamente sobre Docker Compose.

## 2026-04-20 - Cierre parcial de pliego: certificaciones externas

### Documento rector agregado

- `docs/modulo-certificaciones-externas.md`

### Objetivo

Dejar de tratar las certificaciones como listas decorativas y conectarlas con cursos, rutas y resultados consolidados.

### Cambios aplicados

- `CertificationTrackCourse` ahora soporta:
  - `sortOrder`
  - `isRequired`
  - `minimumScore`
- se agrego `StudentCertificationStatus`
- `CertificationTracksService` ahora:
  - filtra tracks por alcance academico
  - calcula elegibilidad por estudiante
  - persiste estado certificable consolidado
  - lista estados por track dentro de la institucion activa
- se agregaron endpoints para:
  - estado certificable por estudiante
  - estados consolidados por track
- `CertificationTracksModule` ahora importa:
  - `AcademicVisibilityModule`
  - `DashboardModule`

### Validacion

- `npm run prisma:generate` correcto
- `npm run build:api` correcto
- migracion aplicada:
  - `prisma/migrations/20260420210656_certification_status_alignment/migration.sql`

### Efecto practico

El LMS ya puede mapear una certificacion externa a cursos concretos y calcular si un estudiante se encuentra en `NOT_STARTED`, `IN_PROGRESS` o `ELIGIBLE` segun sus resultados consolidados.

## 2026-04-20 - Cierre parcial de pliego: notificaciones y correo con entrega real

### Objetivo

Cerrar el gap entre cola trazable y entrega real por correo para practicas de demostracion y notificaciones academicas.

### Cambios aplicados

- se agrego `nodemailer` al backend
- se agrego `EmailDeliveryService`
- `notifications` ahora intenta envio SMTP real por cada `EmailDelivery`
- se actualiza estado de:
  - `EmailDelivery`
  - `Notification`
  segun resultado del envio
- `createNotification` y `sendPracticeDemonstration` ya no dejan solo registros `PENDING`
- `.env.example` se amplio con configuracion SMTP

### Validacion

- `npm run build:api` correcto
- `npm run build:web` se mantiene correcto

### Efecto practico

El LMS ya puede entregar correos reales cuando exista configuracion SMTP, manteniendo trazabilidad por destinatario y alineando el modulo con el requisito expreso del pliego sobre envio de practicas de demostracion por e-mail.

## 2026-04-20 - Cierre parcial de pliego: vocalizacion y contenido interactivo

### Documento rector agregado

- `docs/modulo-vocalizacion-y-contenido-interactivo.md`

### Objetivo

Cerrar el gap entre un simple flag `voiceoverEnabled` y una capa real de vocalizacion e interactividad integrada al portal y al flujo academico.

### Cambios aplicados

- se agregaron nuevos enums al modelo:
  - `VoiceoverSourceKind`
  - `VoiceoverStatus`
  - `InteractiveContentKind`
- se agregaron nuevos modelos:
  - `ContentVoiceoverTrack`
  - `InteractiveContentConfig`
- `ContentResource` y `LessonSegment` ahora pueden colgar:
  - pistas de vocalizacion
  - configuraciones de contenido interactivo
- `ContentResourcesService` ahora:
  - lista pistas de vocalizacion visibles por alcance academico
  - crea pistas de vocalizacion y activa `voiceoverEnabled`
  - lista configuraciones interactivas visibles por alcance academico
  - crea configuraciones interactivas ligadas a recurso o segmento
  - expone esta informacion tambien dentro de `GET /content-resources`
- se agregaron endpoints para:
  - `GET /content-resources/voiceovers`
  - `POST /content-resources/voiceovers`
  - `GET /content-resources/interactive-configs`
  - `POST /content-resources/interactive-configs`

### Validacion

- `npx prisma validate` correcto
- `npm run prisma:generate` correcto
- migracion aplicada:
  - `prisma/migrations/20260421003012_vocalization_interactive_content_alignment/migration.sql`
- `npm run build:api` correcto

### Efecto practico

El LMS ya no depende de una bandera plana para vocalizacion o interactividad. Ahora tiene una base real para servir audio, transcript y configuracion interactiva desde el mismo portal, ligada a recursos y segmentos academicos.

## 2026-04-20 - Cierre parcial de pliego: cobertura tecnica industrial

### Documento rector agregado

- `docs/modulo-cobertura-tecnica-industrial.md`

### Objetivo

Permitir que el LMS declare cobertura tecnica especializada en cursos y simuladores para requisitos explicitos del pliego como Allen Bradley y Siemens.

### Cambios aplicados

- `Course` ahora incluye:
  - `vendorCoverageTags`
  - `technologyCoverageTags`
- `Simulator` ahora incluye:
  - `vendorCoverageTags`
  - `technologyCoverageTags`
- se ampliaron:
  - `CreateCourseDto`
  - `CreateSimulatorDto`
- `CoursesService` y `SimulatorsService` ya persisten esta metadata y la registran en auditoria

### Validacion

- `npx prisma validate` correcto
- `npm run prisma:generate` correcto
- migracion aplicada:
  - `prisma/migrations/20260421003648_technical_coverage_industrial_alignment/migration.sql`
- `npm run build:api` correcto

### Efecto practico

El LMS ya puede declarar de forma consistente que un curso o simulador cubre fabricantes y tecnologias industriales concretas, sin deformar la jerarquia academica ni amarrar todo el sistema a un solo proveedor.

## 2026-04-20 - Cierre parcial de pliego: historial de acceso operativo

### Documento rector agregado

- `docs/modulo-historial-acceso-operativo.md`

### Objetivo

Volver util el historial de accesos para operacion institucional, soporte y control de sesiones, no dejarlo como simple lista de eventos.

### Cambios aplicados

- `FindAuditQueryDto` ahora soporta:
  - `sessionId`
  - `from`
  - `to`
- `FindAccessEventsQueryDto` ahora soporta:
  - `sessionId`
  - `sessionStatus`
  - `from`
  - `to`
- se agrego `FindAccessSessionsQueryDto`
- `AuditService` ahora soporta:
  - consulta filtrada de auditoria por fecha y sesion
  - consulta filtrada de eventos de acceso por fecha, sesion y estado
  - listado de sesiones de acceso institucionales
  - resumen operativo de acceso de los ultimos 7 dias
- se agregaron endpoints:
  - `GET /audit/access-sessions`
  - `GET /audit/access-operations-summary`

### Validacion

- `npm run build:api` correcto

### Efecto practico

El LMS ya permite revisar sesiones activas, revocadas o expiradas, navegar historial de acceso por ventana temporal y obtener un resumen operativo real para administracion y soporte.

## 2026-04-20 - Auditoria y correccion de copy visible en frontend

### Objetivo

Eliminar del portal cualquier lenguaje orientado al equipo de desarrollo y reemplazarlo por copy de producto terminado, claro para cliente final y usuarios por rol.

### Cambios aplicados

- se audito el copy visible en:
  - inicio
  - ingreso
  - navegacion
  - shells
  - pantallas de administrador
  - pantallas de docente
  - pantallas de estudiante
- se reemplazaron textos que hablaban de:
  - MVP
  - backend
  - alcance tecnico
  - demo
  - bloques activos
  - taxonomias y trazabilidad presentadas como lenguaje de usuario
- se quitaron credenciales de ejemplo precargadas en login
- se ajustaron placeholders y mensajes vacios para que suenen a uso real del sistema

### Validacion

- `npm run build:web` correcto

### Efecto practico

El frontend ahora se presenta como una plataforma institucional terminada y no como una demostracion tecnica pensada para el equipo que la construye.

## 2026-04-22 - Fase 1 de cierre de producto en frontend

### Objetivo

Corregir incoherencias funcionales visibles y terminar de limpiar el lenguaje del portal antes de cualquier aplicacion futura de imagen corporativa oficial.

### Cambios aplicados

- se corrigio el desajuste funcional entre frontend y backend en soporte:
  - prioridad `URGENT` reemplazada por `CRITICAL`
- se ajustaron formularios y tablas de soporte en:
  - administrador
  - docente
  - estudiante
- se reemplazaron labels crudos del sistema por copy de producto en:
  - soporte
  - evaluaciones
  - resultados
  - progreso
  - simuladores
- se corrigieron textos visibles como:
  - `Cargando sesion del LMS...`
  - `Quiz`
  - `Score`
  - estados tecnicos sin traducir
  - categorias y eventos de simulador expuestos como codigos internos
- se normalizo la experiencia administrativa de inscripciones para usar el mismo shell principal del portal
- se mantuvo el naming visible bajo `NOVOMEDIAlms`

### Validacion

- `npm run build:web` correcto

### Efecto practico

El frontend quedo mas coherente como producto terminado: ya no expone desajustes evidentes con backend en soporte y redujo la presencia de copy tecnico o codigos internos visibles para cliente final.

## 2026-04-26 - Auditoria de preparacion para imagen corporativa oficial

### Objetivo

Preparar el terreno para la Fase 2 de imagen corporativa oficial sin inventar una marca nueva ni tocar la logica funcional del LMS.

### Cambios aplicados

- se audito la capa visual actual del frontend
- se identificaron como puntos de entrada de marca:
  - `BrandMark`
  - `Shell`
  - `PortalShell`
  - `AdminShell`
  - `layout`
  - `globals.css`
  - `tailwind.config.ts`
  - `icon.svg`
- se documento que:
  - el logo actual sigue siendo provisional
  - la paleta actual sigue siendo provisional
  - el eslogan visible esta repetido en varios shells
  - la Fase 2 debe atacar componentes centrales antes que pantallas sueltas
- se dejo la auditoria formal en:
  - `docs/auditoria-fase-2-imagen-corporativa.md`

### Efecto practico

El proyecto ya tiene una ruta clara para aplicar el manual de marca oficial cuando llegue, sin mezclar branding con cambios funcionales ni tocar pantallas al azar.

## 2026-04-28 - Limpieza basica de seguridad y documentacion

### Objetivo

Reducir exposicion innecesaria de credenciales demo y alinear mejor la documentacion publica del repo con el nombre real del producto.

### Cambios aplicados

- `README.md` ya usa `NOVOMEDIAlms` como nombre principal del proyecto
- se ajusto la descripcion del repositorio para que deje de presentarse como un `LMS` generico
- se eliminaron referencias explicitas a credenciales demo antiguas en la bitacora
- se cambiaron defaults locales de administrador en:
  - `prisma/seed.ts`
  - `docker-compose.yml`
- los valores de desarrollo local ahora usan placeholders menos expuestos

### Efecto practico

El repositorio queda mas presentable para revision tecnica y reduce la mala practica de dejar demasiado visibles credenciales demo antiguas o naming generico en la documentacion principal.

## 2026-04-29 - Cierre de sesion y handoff

### Objetivo

Dejar el proyecto documentado para retomar desde una nueva sesion sin depender de la memoria del chat.

### Cambios aplicados

- se creo un archivo de handoff en la raiz:
  - `SESSION_HANDOFF.md`
- se dejo resumido:
  - ultimo commit publicado
  - estado funcional real
  - documentos obligatorios para retomar
  - rutas siguientes validas
  - reglas de trabajo vigentes

### Efecto practico

Cualquier nueva sesion ya puede reconstruir con rapidez:

- donde quedo el proyecto
- que bloques ya se cerraron
- que sigue despues
- que archivos mandan para continuar

## 2026-04-29 - Fase 2 de imagen corporativa oficial

### Objetivo

Sustituir la identidad provisional del frontend por la marca oficial de `NOVOMEDIAlms`, usando el logo y el manual corporativo ya versionados en `corpo/`.

### Cambios aplicados

- se leyo el manual corporativo y se aplicaron sus reglas base en frontend:
  - color principal `#182B45`
  - acento `#E37F3A`
  - apoyo `#81B2D3`
  - tipografias objetivo:
    - `Montserrat`
    - `Open Sans`
- se reemplazo la marca provisional por activos oficiales en:
  - `apps/web/public/brand/novomedialms-logo.png`
  - `apps/web/public/brand/novomedialms-isotipo.png`
  - `apps/web/app/icon.png`
- se retiro el favicon provisional anterior:
  - `apps/web/app/icon.svg`
- se actualizo la capa base visual en:
  - `apps/web/app/globals.css`
  - `apps/web/tailwind.config.ts`
- se actualizo el `BrandMark` reusable para usar el logo oficial
- se aplico la marca oficial en puntos de alto impacto:
  - `Shell`
  - `PortalShell`
  - `AdminShell`
  - portada
  - login
  - componentes base de tarjetas y paneles
- validacion reciente:
  - `npm run build:web` correcto

### Efecto practico

El portal ya no depende de la identidad visual provisional. Login, portada, navegacion principal y favicon ya reflejan la marca oficial de `NOVOMEDIAlms` con colores y tratamiento institucional coherentes con el manual.

## 2026-04-29 - Ajuste de acceso publico y logo en login

### Objetivo

Cerrar dos detalles visibles del acceso publico:

- evitar que la raiz del portal muestre menu de software antes de autenticacion
- retirar el borde visual no deseado alrededor del logo en claro

### Cambios aplicados

- `/` ahora redirige directamente a `/login`
- el `Shell` publico ya soporta modo sin navegacion
- la vista de login ya usa ese modo para mostrar solo acceso institucional
- `BrandMark` en tema claro ya no envuelve el logo en un contenedor con borde
- validacion reciente:
  - `npm run build:web` correcto
  - `docker compose up -d --build web` correcto

### Efecto practico

La primera pantalla del producto ahora se comporta como acceso institucional limpio y el logo deja de verse encerrado en un marco visual impropio.
