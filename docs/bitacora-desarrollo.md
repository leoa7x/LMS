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

### Instruccion de continuidad

Si una sesion nueva retoma el proyecto, debe leer:

- `docs/flujo-de-trabajo.md`
- `docs/estado-actual.md`
- `docs/bitacora-desarrollo.md`
- `prompts/main-prompt.md`
