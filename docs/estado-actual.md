# Estado actual del proyecto

## Nombre

`NOVOMEDIAlms`

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
- certificaciones externas con estado certificable por estudiante
- notificaciones y correo con entrega SMTP real

En frontend ya existen:

- navegacion por rol
- login con redireccion por rol
- dashboard admin
- dashboard docente
- dashboard estudiante
- gestion admin de usuarios
- gestion admin de instituciones, sedes y laboratorios
- gestion admin de cursos y rutas
- vista admin de contenidos
- vistas de cursos y contenidos para docente
- vistas de cursos y contenidos para estudiante

## Referencias externas cargadas

- `references/github/public-apis/repo`
- `references/github/awesome-design-md/repo`

## Decision operativa importante

Antes de seguir desarrollando, cualquier sesion nueva debe tomar estos archivos como contexto minimo:

- `docs/flujo-de-trabajo.md`
- `docs/alcance-biblia.md`
- `docs/estado-actual.md`
- `prompts/main-prompt.md`

## Estado de frontend MVP

Se implemento la `Oleada 1` del frontend funcional sobre backend estable y alineado con el pliego.

Pantallas cerradas en esta oleada:

- `login`
- `dashboard admin`
- `dashboard docente`
- `dashboard estudiante`
- `usuarios`
- `institucion / sedes / laboratorios`
- `cursos / rutas`
- `contenidos`
- `cursos docente`
- `contenidos docente`
- `cursos estudiante`
- `contenidos estudiante`

Validacion:

- `npm run build:web` correcto

## Fase en curso

Fase 1 cerrada a nivel de bootstrap de codigo y validacion de build.

La base documental y el esqueleto tecnico ya fueron preparados. Prisma genera cliente, el backend compila y el frontend compila.

## Cierre de bloqueo critico de oleada 1

Se endurecio `vigencia, acceso por 36 meses, contrato, licencia y concurrencia` para que dejen de ser datos decorativos y pasen a gobernar el acceso real.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-acceso-operativo.md`
- se agrego `AccessPolicyService` como politica central de acceso
- `auth` ahora usa esa politica para:
  - resolver membresia efectiva
  - validar ventana de acceso real
  - validar contrato vigente
  - aplicar concurrencia por contrato
  - aplicar concurrencia por licencia
- `users` ahora deriva `accessEndAt` al crear membresias usando:
  - `accessStartAt`
  - `License.durationMonths`
  - `ContractTerm.endAt`
- la vigencia de 36 meses ya no depende solo de cargar manualmente `accessEndAt`

Documentacion rectora del bloque:

- `docs/modulo-acceso-operativo.md`

## Cierre de bloqueo critico de oleada 1

Se endurecio `administracion por nivel y visibilidad transversal` para que el catalogo academico deje de exponerse de forma plana.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-visibilidad-por-nivel.md`
- se agrego `AcademicVisibilityService`
- se resolvio `accessibleCourseIds` por rol:
  - admin y soporte
  - docente segun `TeacherScopeAssignment`
  - estudiante segun matricula, ruta y reglas de visibilidad
- se aplico filtrado de visibilidad en:
  - `courses`
  - `modules`
  - `lessons`
  - `practices`
  - `quizzes`
  - `simulators`
- estudiantes ya pueden consultar contenido filtrado donde antes solo habia lectura plana o roles limitados

Documentacion rectora del bloque:

- `docs/modulo-visibilidad-por-nivel.md`

## Cierre de bloqueo critico de oleada 1

Se endurecio `bilinguismo transversal backend` para que el frontend no tenga que reconstruir localizacion con contratos inconsistentes.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-bilinguismo-transversal.md`
- se agrego modulo `i18n`
- se agrego `I18nService`
- se resolvio idioma efectivo por:
  - `lang` en query
  - `preferredLang` del usuario
  - fallback a espanol
- se agregaron campos localizados en lecturas de:
  - cursos
  - modulos
  - lecciones
  - practicas
  - quizzes
  - recursos de contenido
  - glosario
- se mantuvieron los campos base `Es/En`, pero ya existe una capa backend consistente para frontend

Documentacion rectora del bloque:

- `docs/modulo-bilinguismo-transversal.md`

## Cierre de bloqueo critico de oleada 1

Se endurecio `administracion centralizada coherente` para que los modulos troncales de operacion institucional no sigan trabajando como CRUDs globales o con referencias cruzadas inconsistentes.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-administracion-centralizada.md`
- se agrego `AdministrationScopeService`
- se fijo criterio institucional comun para:
  - `users`
  - `institutions`
  - `licenses`
  - `enrollments`
- los listados administrativos ahora se resuelven por `institutionId` activo del token
- las escrituras con `institutionId` ahora deben coincidir con la institucion activa
- se bloqueo que matriculas y rutas academicas queden firmadas por un `assignedByUserId` distinto al usuario autenticado
- se corrigio lectura de detalle de usuarios para que respete el contexto institucional

Documentacion rectora del bloque:

- `docs/modulo-administracion-centralizada.md`

## Cierre de consistencia funcional

Se endurecio `resultados consolidados` para que el LMS deje de exponer progreso, quizzes, practicas y simuladores como datos aislados.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-resultados-consolidados.md`
- se agrego resultado consolidado por matricula:
  - `GET /reports/enrollments/:enrollmentId/result`
- se agrego resultado consolidado por ruta formativa:
  - `GET /reports/learning-path-assignments/:assignmentId/result`
- ambos resultados integran:
  - progreso
  - evaluaciones pre y post
  - cuestionarios previos por modulo
  - practicas
  - simuladores
  - decision final
- las lecturas respetan permisos por:
  - admin
  - docente con alcance
  - estudiante propietario

Documentacion rectora del bloque:

- `docs/modulo-resultados-consolidados.md`

## Cierre de consistencia funcional

Se endurecio `rutas preconfiguradas con secuencia minima` para que las rutas dejen de ser agrupaciones planas y pasen a gobernar orden y desbloqueo basico.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-rutas-preconfiguradas.md`
- se agrego secuencia por ruta asignada:
  - `GET /learning-paths/assignments/:assignmentId/sequence`
- la secuencia ahora calcula por curso:
  - `LOCKED`
  - `UNLOCKED`
  - `COMPLETED`
- el desbloqueo usa:
  - `sortOrder`
  - cursos requeridos previos
  - estado de matricula
  - cierre por `POST_COURSE` o progreso consolidado
- la lectura respeta permisos por:
  - admin
  - soporte
  - docente con alcance
  - estudiante propietario

Documentacion rectora del bloque:

- `docs/modulo-rutas-preconfiguradas.md`

## Cierre de consistencia funcional

Se endurecio `exportacion PDF basica` para que la plataforma produzca salida real por modulo y no solo almacene plantillas.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-exportacion-pdf.md`
- se agrego endpoint:
  - `GET /content-resources/modules/:moduleId/pdf-export`
- la exportacion ahora integra:
  - plantilla del modulo
  - estudiante objetivo
  - progreso del modulo
  - resumen de practicas
  - evidencias de habilidad
- el backend genera un PDF valido y bilingue segun idioma efectivo

Documentacion rectora del bloque:

- `docs/modulo-exportacion-pdf.md`

## Cierre de consistencia funcional

Se endurecio `soporte y SLA operativo` para que el backend ya no trate el SLA como solo fechas guardadas sin lectura de cumplimiento.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-sla-operativo.md`
- se enriquecieron tickets con:
  - vencimiento de respuesta
  - vencimiento de resolucion
  - horas restantes
- se agrego resumen institucional:
  - `GET /support/operations/summary`
- el soporte ya puede exponer:
  - tickets vencidos
  - tickets proximos a vencer
  - carga abierta e in progress

Documentacion rectora del bloque:

- `docs/modulo-sla-operativo.md`

## Cierre de consistencia funcional

Se endurecio `simuladores integrados minimos` para que las sesiones de simulacion dejen de comportarse como launch URLs sin contexto academico.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-simuladores-integracion-minima.md`
- las sesiones ahora validan:
  - matricula valida
  - estudiante correcto
  - mapeo del simulador a practicas del curso
- se agrego contexto de sesion:
  - `GET /simulators/sessions/:sessionId/context`
- se agrego registro minimo de eventos:
  - `POST /simulators/sessions/events`
- al completar simulador, el backend ya puede generar evidencia academica basica ligada a practica

Documentacion rectora del bloque:

- `docs/modulo-simuladores-integracion-minima.md`

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

## Modulo alineado contra pliego

Se valido y documento el `modulo de simuladores` como parte integral del LMS, no como sistema externo separado.

Estado aplicado:

- se fijo la arquitectura y taxonomia del modulo en `docs/modulo-simuladores.md`
- se mantiene la clasificacion:
  - `EMBEDDABLE_EXISTING`
  - `THIRD_PARTY_ADAPTER`
  - `NATIVE_BASIC`
  - `NATIVE_ADVANCED`
- el backend ya soporta:
  - catalogo de simuladores
  - mapeo simulador a practica
  - sesiones por estudiante
  - cierre de sesion con trazabilidad
  - integracion base con progreso

Documentacion rectora del modulo:

- `docs/modulo-simuladores.md`
- `prompts/simuladores-integracion.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de contenidos, glosario y bilinguismo` para dejar de tratar recursos como adjuntos planos.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-contenidos-glosario-bilinguismo.md`
- `ContentResource` ahora soporta:
  - versiones de contenido
  - relaciones con glosario
  - contexto academico ampliado en lecturas
- se agregaron:
  - `ContentResourceVersion`
  - `GlossaryTermRelation`
  - `ModulePdfExportTemplate`
- `content-resources` ahora soporta:
  - creacion de version inicial
  - versiones adicionales
  - configuracion de plantillas PDF por modulo
- `glossary` ahora soporta relaciones explicitas entre termino tecnico y recurso de contenido

Migracion aplicada:

- `prisma/migrations/20260420131312_content_glossary_bilingual_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-contenidos-glosario-bilinguismo.md`
- `prompts/contenidos-glosario-bilinguismo.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de reportes y dashboards` para dejar de tratar analitica y paneles como simples contadores globales.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-reportes-y-dashboards.md`
- `dashboard/admin` ahora responde al contexto institucional activo
- `dashboard/teacher` ahora calcula alcance docente real sobre matriculas, cursos y progreso
- `dashboard/student/me` ahora devuelve resumen academico propio del estudiante
- se agregaron reportes accionables:
  - `GET /reports/courses/:courseId/summary`
  - `GET /reports/students/:studentId/summary`
- los reportes ahora respetan:
  - institucion activa
  - alcance docente
  - restriccion de estudiante a su propio resumen

Documentacion rectora del modulo:

- `docs/modulo-reportes-y-dashboards.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de soporte tecnico` para dejar de tratar tickets como mensajes planos sin SLA ni contexto institucional.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-soporte-tecnico.md`
- `SupportTicket` ahora soporta:
  - institucion
  - sede
  - laboratorio
  - responsable asignado
  - politica SLA
  - prioridad
  - vencimiento de respuesta
  - timestamps de respuesta, resolucion y cierre
- se agregaron:
  - `SupportTicketComment`
  - `SupportSlaPolicy`
- se agrego modulo backend `support` con endpoints para:
  - tickets
  - comentarios
  - actualizacion de ticket
  - politicas SLA

Migracion aplicada:

- `prisma/migrations/20260420132539_support_module_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-soporte-tecnico.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de notificaciones y correo` para dejar de tratar notificaciones como avisos planos sin trazabilidad de entrega.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-notificaciones-y-correo.md`
- `Notification` ahora soporta:
  - institucion
  - canal
  - estado
  - plantilla
  - referencia academica
  - marcas de lectura y envio
- se agregaron:
  - `NotificationTemplate`
  - `EmailDelivery`
  - enums `NotificationChannel` y `NotificationStatus`
- se agrego modulo backend `notifications` con endpoints para:
  - notificaciones propias
  - marcado de lectura
  - plantillas
  - creacion de notificaciones
  - envio de practica de demostracion

Migracion aplicada:

- `prisma/migrations/20260420134845_notifications_email_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-notificaciones-y-correo.md`

## Modulo endurecido contra pliego

Se rediseño e implemento el `modulo de auditoria` para dejar de tratar la trazabilidad como un log minimo sin contexto institucional ni eventos de acceso.

Cambios aplicados:

- se documento el diseno formal en `docs/modulo-auditoria.md`
- `AuditLog` ahora soporta:
  - institucion
  - membresia institucional
  - sesion
  - roles efectivos del actor
  - IP
  - user-agent
- se agrego `AccessEventLog`
- se agrego enum `AccessEventType`
- `audit` ahora soporta:
  - filtros por accion, entidad y usuario
  - consulta de eventos de acceso
- `auth` ahora registra:
  - login exitoso
  - refresh
  - logout
- se agrego endpoint:
  - `POST /auth/logout`

Migracion aplicada:

- `prisma/migrations/20260420135745_audit_alignment/migration.sql`

Documentacion rectora del modulo:

- `docs/modulo-auditoria.md`

## Estado de infraestructura local

- Docker operativo
- PostgreSQL local levantado por `docker compose`
- Migracion inicial aplicada
- Seed inicial ejecutado
- Migracion de usuarios y roles aplicada
- Seed actualizado ejecutado
- Migracion de contenidos, glosario y bilinguismo aplicada
- Migracion del modulo de soporte tecnico aplicada
- Migracion del modulo de notificaciones y correo aplicada
- Migracion del modulo de auditoria aplicada

## Estado actual del frontend MVP

- Oleada 1 cerrada sobre backend estable:
  - login con redireccion por rol
  - dashboards de admin, docente y estudiante
  - usuarios
  - institucion, sedes y laboratorios
  - cursos y rutas
  - contenidos
- Oleada 2 cerrada sobre backend estable:
  - progreso institucional, docente y estudiante
  - evaluaciones visibles por rol
  - autorizacion de reintentos
  - resultados consolidados por matricula y ruta
  - glosario y contenidos con bilinguismo visible en UI
  - exportacion PDF por modulo desde frontend
- Oleada 3 cerrada sobre backend estable:
  - simuladores integrados minimos en UI
  - soporte, tickets y SLA en UI
  - auditoria administrativa consolidada
  - navegacion por rol extendida para cierre visual del MVP

## Validacion reciente

- `npm run build:api` correcto
- `npm run build:web` correcto

## Estado de despliegue local

- `.env.example` actualizado con `WEB_ORIGIN`
- `apps/api/Dockerfile` agregado
- `apps/web/Dockerfile` agregado
- `.dockerignore` agregado
- `docker-compose.yml` ampliado para:
  - `postgres`
  - `api`
  - `web`
- documentacion operativa agregada en:
  - `docs/despliegue-local.md`
  - `infra/README.md`
- validacion de empaquetado completada:
  - `docker compose config` correcto
  - `docker compose build api web` correcto

## Estado de hardening frontend

- sesion frontend centralizada en `apps/web/lib/session.ts`
- `client-api` soporta `refresh token` automatico ante `401`
- `logout` intenta revocar sesion en backend antes de limpiar estado local
- `npm run build:web` correcto despues del endurecimiento

## Estado de arranque integrado

- `docker compose up -d --build` validado
- `docker compose ps` validado
- health API validado en `http://localhost:4000/api/v1/health`
- frontend web validado en `http://localhost:3000`
- bug de wiring corregido en:
  - `apps/api/src/quizzes/quizzes.module.ts`

## Estado de certificaciones externas

- documento rector agregado en:
  - `docs/modulo-certificaciones-externas.md`
- `CertificationTrackCourse` ahora soporta:
  - `sortOrder`
  - `isRequired`
  - `minimumScore`
- nuevo modelo:
  - `StudentCertificationStatus`
- nuevos endpoints:
  - `GET /certification-tracks/:trackId/students/:studentId/status`
  - `GET /certification-tracks/:trackId/statuses`
- migracion aplicada:
  - `prisma/migrations/20260420210656_certification_status_alignment/migration.sql`
- `npm run build:api` correcto

## Estado de notificaciones y correo

- `notifications` ahora integra entrega SMTP real
- nuevo servicio:
  - `apps/api/src/notifications/email-delivery.service.ts`
- `createNotification` y `sendPracticeDemonstration` ahora intentan entrega real por correo
- `.env.example` ahora soporta:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_SECURE`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SMTP_FROM`
- `npm run build:api` correcto

## Estado de vocalizacion y contenido interactivo

- documento rector agregado en:
  - `docs/modulo-vocalizacion-y-contenido-interactivo.md`
- nuevos enums en el modelo:
  - `VoiceoverSourceKind`
  - `VoiceoverStatus`
  - `InteractiveContentKind`
- nuevos modelos:
  - `ContentVoiceoverTrack`
  - `InteractiveContentConfig`
- `ContentResource` y `LessonSegment` ahora pueden exponer:
  - pistas de vocalizacion
  - configuraciones de contenido interactivo
- nuevos endpoints:
  - `GET /content-resources/voiceovers`
  - `POST /content-resources/voiceovers`
  - `GET /content-resources/interactive-configs`
  - `POST /content-resources/interactive-configs`
- `GET /content-resources` ahora incluye:
  - `voiceoverTracks`
  - `interactiveConfigs`
  con localizacion resuelta segun idioma
- migracion aplicada:
  - `prisma/migrations/20260421003012_vocalization_interactive_content_alignment/migration.sql`
- validacion reciente:
  - `npx prisma validate` correcto
  - `npm run prisma:generate` correcto
  - `npm run build:api` correcto

## Estado de cobertura tecnica industrial

- documento rector agregado en:
  - `docs/modulo-cobertura-tecnica-industrial.md`
- `Course` ahora soporta:
  - `vendorCoverageTags`
  - `technologyCoverageTags`
- `Simulator` ahora soporta:
  - `vendorCoverageTags`
  - `technologyCoverageTags`
- `CreateCourseDto` y `CreateSimulatorDto` ya aceptan esta metadata
- `courses` y `simulators` ya persisten esta cobertura desde backend
- migracion aplicada:
  - `prisma/migrations/20260421003648_technical_coverage_industrial_alignment/migration.sql`
- validacion reciente:
  - `npx prisma validate` correcto
  - `npm run prisma:generate` correcto
  - `npm run build:api` correcto

## Estado de historial de acceso operativo

- documento rector agregado en:
  - `docs/modulo-historial-acceso-operativo.md`
- `audit` ahora soporta filtros ampliados para:
  - `sessionId`
  - rango `from/to`
- `access-events` ahora soporta filtros ampliados para:
  - `sessionId`
  - `sessionStatus`
  - rango `from/to`
- nuevos endpoints:
  - `GET /audit/access-sessions`
  - `GET /audit/access-operations-summary`
- `access-sessions` ya expone:
  - usuario
  - membresia institucional
  - sede
  - laboratorio
  - eventos recientes por sesion
- `access-operations-summary` ya consolida:
  - sesiones activas
  - sesiones revocadas
  - sesiones expiradas
  - logins recientes
  - refresh recientes
  - logouts recientes
- validacion reciente:
  - `npm run build:api` correcto

## Estado de copy y lenguaje de producto en frontend

- se audito el copy visible del portal para eliminar lenguaje interno de desarrollo
- se corrigieron textos que hablaban de:
  - MVP
  - backend
  - alcance tecnico
  - arquitectura
  - demo
  - trazabilidad tecnica presentada como copy de usuario
- se actualizaron:
  - inicio
  - ingreso
  - navegacion por rol
  - shells compartidos
  - guardas de acceso
  - pantallas principales de administrador, docente y estudiante
  - pantallas de cursos, contenidos, progreso, evaluaciones, resultados, simuladores, soporte y auditoria
- el tono visible ahora esta orientado a:
  - operacion institucional
  - gestion academica
  - uso diario por rol
- validacion reciente:
  - `npm run build:web` correcto

## Instruccion para retomarlo

Si una sesion nueva necesita retomar el proyecto, la instruccion corta debe ser:

`Lee docs/flujo-de-trabajo.md, docs/estado-actual.md y prompts/main-prompt.md, y continua el LMS desde ahi.`
