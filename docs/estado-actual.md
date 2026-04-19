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

## Estado de infraestructura local

- Docker operativo
- PostgreSQL local levantado por `docker compose`
- Migracion inicial aplicada
- Seed inicial ejecutado

## Instruccion para retomarlo

Si una sesion nueva necesita retomar el proyecto, la instruccion corta debe ser:

`Lee docs/flujo-de-trabajo.md, docs/estado-actual.md y prompts/main-prompt.md, y continua el LMS desde ahi.`
