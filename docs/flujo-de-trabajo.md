# Flujo de trabajo del proyecto LMS

## Regla principal

Este proyecto desarrolla un LMS tecnico profesional para el Instituto Profesional y Tecnico de Veraguas.

No es un LMS generico.

## Fuente de verdad

La fuente principal de requisitos es:

- `texto_extraido.md`
- `SOFTWARE TERMINOS Y REFERENCIAS e-LEARNING(JUAN).pdf`
- `docs/alcance-biblia.md`

Si existe contradiccion entre ideas nuevas y estos documentos, prevalecen estos documentos.

## Reglas de trabajo

- Primero disenar, luego implementar.
- No improvisar.
- No construir demos escolares.
- Si algo no esta completamente definido, proponer una decision razonable, justificarla y documentarla en `docs/`.
- Los simuladores no se asumen propios por defecto.
- Antes de implementar cualquier modulo, revisar `docs/matriz-trazabilidad-modulos.md`.
- No se aceptan CRUD basicos o modulos genericos si no responden al pliego.
- Cada modulo debe explicitar: requisitos que cubre, entidades, campos, relaciones, reglas de negocio, roles, validaciones, alcance MVP y alcance posterior.

## Regla de simuladores

Todo simulador debe clasificarse en una de estas categorias:

- embebible existente
- adaptacion de tercero
- propio basico
- propio avanzado

La plataforma debe quedar preparada para soportar las cuatro.

## Objetivo del producto

Construir un LMS web con:

- autenticacion y roles
- gestion academica
- cursos, modulos, lecciones y practicas
- quizzes y evaluaciones pre/post
- progreso individual
- glosario
- dashboards
- soporte de contenido bilingue
- estructura integrada para simuladores

## Stack base acordado

- Frontend: Next.js
- Backend: NestJS
- Base de datos: PostgreSQL
- ORM: Prisma
- Auth: JWT + refresh tokens
- UI: Tailwind
- Infra local: Docker Compose

## Estructura del repo

- `docs/`
- `prompts/`
- `research/`
- `references/`
- `apps/`
- `packages/`
- `prisma/`
- `infra/`

## Ruta de ejecucion

1. Leer `docs/alcance-biblia.md`
2. Leer este archivo
3. Leer `docs/matriz-trazabilidad-modulos.md`
4. Leer `prompts/main-prompt.md`
5. Revisar `docs/backlog-fases.md`
6. Continuar desde la fase en curso
