# Matriz de trazabilidad de modulos

## Regla de uso

Este documento es obligatorio antes de disenar o implementar cualquier modulo del sistema.

Cada modulo debe:

1. identificar los requisitos del pliego que cubre;
2. definir entidades, campos, relaciones y reglas de negocio;
3. delimitar roles y validaciones;
4. separar alcance MVP de fases posteriores;
5. evitar implementaciones genericas que no respondan al documento rector.

La fuente de verdad para esta matriz es:

- `texto_extraido.md`
- `SOFTWARE TERMINOS Y REFERENCIAS e-LEARNING(JUAN).pdf`
- `docs/alcance-biblia.md`

## Matriz

| Modulo | Requisitos del documento que cubre | Entidades base | Reglas de negocio clave | Riesgo si se implementa basico |
| --- | --- | --- | --- | --- |
| Auth y roles | Portal web unico, acceso 24/7, multiples accesos simultaneos, roles claros, acceso desde multiples sitios, vigencia configurable, sin llaves fisicas o de software | User, Role, RoleAssignment, Session, InstitutionMembership, License, ContractTerm | El acceso debe respetar rol, estado, institucion y vigencia. El token no puede ser solo identidad generica; debe reflejar contexto operativo del LMS. | Terminar con login generico sin control institucional, sin vigencia y sin permisos reales por alcance. |
| Usuarios | Gestion de profesores, estudiantes, soporte y administradores; seguimiento individual; operacion multisede; administracion centralizada | User, UserProfile, InstitutionMembership, UserStatusHistory, AccessScope | Un usuario puede pertenecer a una o varias instituciones/sedes y tener estados operativos controlados. Debe existir diferenciacion entre identidad, membresia y alcance academico. | Quedar con un CRUD de usuarios sin soporte para sedes, estados, niveles ni operacion academica real. |
| Instituciones, licencias y vigencias | Sin on-premise, acceso por 36 meses, administracion centralizada, acceso por contrato, crecimiento multisede | Institution, Campus or Site, ContractTerm, License, SubscriptionPolicy | La plataforma debe habilitar o restringir acceso por vigencia contractual e institucion. Debe soportar multiples sedes sin redisenar el modelo. | No poder modelar contratos, vigencias ni despliegue multiinstitucion. |
| Matricula e inscripcion | Asignar estudiantes por nivel, controlar que contenido puede ver cada estudiante, acceso por rutas o programas | StudentEnrollment, LearningPathEnrollment, StudentLevelAssignment, Cohort | La matricula no es solo alta a curso; define nivel, ruta, estado y visibilidad academica. | Inscripciones planas que no permitan control por nivel ni asignacion real de contenido. |
| Areas tecnicas y catalogo academico | Cobertura tematica industrial obligatoria por areas: automatizacion, electronica, electricidad, fluidos, tecnologia verde, etc. | TechnicalArea, CourseCategory, Course, LearningPath, PreconfiguredProgram | El catalogo debe respetar la taxonomia del pliego y soportar crecimiento por areas, cursos y rutas. | Tratar el contenido como lista simple de cursos sin estructura tecnica ni taxonomia industrial. |
| Cursos, modulos y lecciones | Organizacion por areas tecnicas, cursos, modulos y practicas; teoria + material didactico + simulacion; cuestionarios por modulo | Course, Module, Lesson, LessonSegment, ModuleSequenceRule | La jerarquia debe soportar contenido tecnico denso, orden de aprendizaje y vinculacion con practicas y evaluaciones. | Crear cursos tipo blog o LMS simple sin estructura suficiente para aprendizaje tecnico guiado. |
| Practicas y habilidades | Practicas de comprobacion por segmento, desarrollo de habilidades, impresion PDF de habilidades desarrolladas | Practice, Skill, SkillEvidence, PracticeAttempt, PracticeChecklist | Cada practica debe medir habilidades o evidencias, no solo marcar completado. Debe poder producir evidencia exportable. | Convertir practicas en checkboxes sin trazabilidad de habilidades. |
| Contenidos y recursos | Texto enriquecido, PDFs, e-books, videos, fotos reales, vocalizacion opcional, material bilingue, acceso unificado en un mismo portal | ContentResource, ResourceAsset, LanguageContent, MediaTranscript, ResourceLink | Todo el material debe vivir o presentarse dentro del portal. Los recursos deben soportar idioma, tipo y uso academico. | Subidas genericas de archivos sin soporte bilingue, sin metadata tecnica y sin integracion al flujo de aprendizaje. |
| Glosario | Glosario tecnico integrado accesible durante la revision del contenido dentro de la misma plataforma | GlossaryTerm, GlossaryTranslation, GlossaryRelation | El glosario debe ser contextual, bilingue y navegable desde contenido y practicas. | Glosario aislado o meramente ornamental, sin uso integrado en el aprendizaje. |
| Evaluaciones y quizzes | Pre-curso, post-curso, cuestionarios previos por modulo, intentos restringidos, reasignacion por docente, resultados administrados por la plataforma | Quiz, Question, AnswerOption, QuizAttempt, QuizAssignment, QuizAccessOverride | Los intentos deben restringirse y poder reabrirse por autorizacion docente. Debe existir trazabilidad por estudiante. | Hacer quizzes basicos sin control de intentos ni relacion con curso, modulo o autorizacion del profesor. |
| Progreso y seguimiento | Seguimiento individual en tiempo real, registro real por estudiante, practicas y evaluaciones asociadas al avance | StudentProgress, ProgressEvent, SkillEvidence, ModuleProgress, CourseProgress | El progreso debe combinar teoria, practicas, quizzes y simulacion; no basta con porcentaje por click. | Mostrar progreso cosmetico sin valor academico ni trazabilidad. |
| Simuladores | Simuladores integrados al portal, ligados al contenido teorico y practico, emulacion 2D/3D, diagramas, simulacion de fallas, captura de progreso, embebido o propio | Simulator, SimulatorMapping, SimulatorSession, SimulatorEvent, FaultScenario, DiagramComponentMap | Todo simulador debe clasificarse como embebible existente, adaptacion de tercero, propio basico o propio avanzado. Debe integrarse al flujo academico y registrar actividad. | Resolverlo como iframe suelto o sistema separado sin seguimiento, trazabilidad ni integracion didactica. |
| Reportes y dashboards | Administracion academica, reportes por rol, monitoreo de avance, visibilidad operativa para admin, docente y estudiante | DashboardView, ReportDefinition, ReportSnapshot, StudentProgress | Cada dashboard debe responder a operacion academica real: avance, asignaciones, fallos, simuladores, auditoria. | Hacer dashboards bonitos pero irrelevantes para la gestion del LMS. |
| Notificaciones y correo | Envio por e-mail de practicas de demostracion, notificaciones basicas, eventos operativos | Notification, NotificationTemplate, EmailDelivery, EventTrigger | Las notificaciones deben salir del flujo academico y operativo, no ser mensajes sueltos. | Perder trazabilidad de envios o no cubrir el requisito de practicas por e-mail. |
| Soporte tecnico | Soporte local con tiempos de respuesta configurables, modulo de soporte o tickets, operacion institucional | SupportTicket, TicketComment, SLAProfile, AssignmentQueue | El soporte debe modelar tiempos de respuesta, estados y responsable, alineado con el contrato operativo. | Crear una bandeja simple sin SLA ni trazabilidad suficiente. |
| Auditoria | Historial de accesos, auditoria minima de acciones academicas, trazabilidad de operacion | AuditLog, AccessLog, AuditActorContext | Deben registrarse accesos y acciones clave de usuarios, docentes, estudiantes y soporte. | No poder explicar quien hizo que, cuando y sobre que entidad. |
| Idiomas y localizacion | Contenidos en espanol e ingles, acceso bilingue desde etapas tempranas | LanguageContent, TranslationEntry, LocalizedLabel | El bilinguismo debe ser transversal al contenido y a la UI, no un parche final. | Duplicar contenido sin estrategia o posponer i18n hasta romper el modelo. |
| Certificaciones externas | Relacion con certificaciones industriales externas en Industria 4.0, Seguridad, CNC, Mantenimiento Industrial, etc. | CertificationTrack, CertificationRequirement, CourseCertificationLink | El LMS debe poder mapear contenido interno con rutas de certificacion externa. | Dejar las certificaciones fuera del dominio y perder trazabilidad formativa. |

## Regla MVP

Para el MVP entra solo lo indispensable para dejar funcional cada modulo sin traicionar el pliego.

Eso significa:

- si el pliego exige trazabilidad, el MVP debe dejar la trazabilidad minima real;
- si el pliego exige control por nivel o vigencia, el MVP debe modelarlo aunque no tenga todas las variantes finales;
- si el pliego exige integracion con simuladores, el MVP debe dejar la arquitectura y entidades correctas, no un placeholder vacio.

## Uso obligatorio antes de implementar

Antes de tocar un modulo se debe documentar en `docs/`:

- requisitos puntuales del pliego que cubre;
- entidades y campos obligatorios;
- relaciones y reglas de negocio;
- roles y validaciones;
- alcance MVP;
- alcance posterior;
- riesgos de una implementacion generica.
