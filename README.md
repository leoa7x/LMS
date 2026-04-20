# LMS

Repositorio base para el desarrollo de un LMS orientado a formacion tecnica con e-learning y simuladores virtuales.

## Objetivo

Construir un LMS que tome como documento rector el manual de contenido y requisitos entregado para el Instituto Profesional y Tecnico de Veraguas.

## Base documental

- Manual fuente: `SOFTWARE TERMINOS Y REFERENCIAS e-LEARNING(JUAN).pdf`
- Transcripcion de trabajo: `texto_extraido.md`
- Requisitos base: `docs/requisitos-base.md`
- Alcance rector del proyecto: `docs/alcance-biblia.md`
- Flujo de trabajo: `docs/flujo-de-trabajo.md`
- Matriz de trazabilidad de modulos: `docs/matriz-trazabilidad-modulos.md`
- Estado actual: `docs/estado-actual.md`
- Bitacora de desarrollo: `docs/bitacora-desarrollo.md`
- Comandos locales: `docs/comandos-locales.md`
- Despliegue local integrado: `docs/despliegue-local.md`
- Requisitos funcionales: `docs/requisitos-funcionales.md`
- Arquitectura del LMS: `docs/arquitectura-lms.md`
- Modelo de datos inicial: `docs/modelo-de-datos.md`
- Diseno del modulo de usuarios y roles: `docs/modulo-usuarios-y-roles.md`
- Diseno del modulo de instituciones, licencias y vigencias: `docs/modulo-instituciones-licencias-vigencias.md`
- Diseno del modulo academico: `docs/modulo-academico.md`
- Diseno del modulo de matricula e inscripcion: `docs/modulo-matricula-inscripcion.md`
- Diseno del modulo de progreso y evaluaciones: `docs/modulo-progreso-y-evaluaciones.md`
- Diseno del modulo de simuladores: `docs/modulo-simuladores.md`
- Diseno del modulo de contenidos, glosario y bilinguismo: `docs/modulo-contenidos-glosario-bilinguismo.md`
- Diseno del modulo de reportes y dashboards: `docs/modulo-reportes-y-dashboards.md`
- Diseno del modulo de soporte tecnico: `docs/modulo-soporte-tecnico.md`
- Diseno del modulo de notificaciones y correo: `docs/modulo-notificaciones-y-correo.md`
- Diseno del modulo de auditoria: `docs/modulo-auditoria.md`
- Diseno del modulo de acceso operativo: `docs/modulo-acceso-operativo.md`
- Diseno del modulo de visibilidad por nivel: `docs/modulo-visibilidad-por-nivel.md`
- Diseno del modulo de bilinguismo transversal: `docs/modulo-bilinguismo-transversal.md`
- Diseno del modulo de administracion centralizada: `docs/modulo-administracion-centralizada.md`
- Diseno del modulo de resultados consolidados: `docs/modulo-resultados-consolidados.md`
- Diseno del modulo de rutas preconfiguradas: `docs/modulo-rutas-preconfiguradas.md`
- Diseno del modulo de exportacion PDF: `docs/modulo-exportacion-pdf.md`
- Diseno del modulo de SLA operativo: `docs/modulo-sla-operativo.md`
- Diseno del modulo de simuladores integracion minima: `docs/modulo-simuladores-integracion-minima.md`
- Backlog por fases: `docs/backlog-fases.md`
- Estrategia de simuladores: `docs/simuladores-decisiones.md`
- Prompt de cursos, modulos y rutas: `prompts/cursos-modulos-rutas.md`
- Prompt de progreso y evaluaciones: `prompts/progreso-y-evaluaciones.md`
- Prompt de contenidos, glosario y bilinguismo: `prompts/contenidos-glosario-bilinguismo.md`
- Prompt institucional y de acceso: `prompts/institucional-y-acceso.md`
- Prompt de simuladores integrados: `prompts/simuladores-integracion.md`

## Estructura inicial

- `docs/` documentacion funcional y tecnica
- `prompts/` prompts rectores de trabajo
- `research/` investigacion y analisis de integraciones
- `apps/api` backend NestJS
- `apps/web` frontend Next.js
- `packages/` utilidades compartidas
- `prisma/` esquema de datos y migraciones
- `infra/` configuracion de contenedores y entorno local

## Estado

El repositorio ya tiene:

- backend base del LMS alineado con el pliego y compilando
- frontend MVP Oleada 1 cerrada
- frontend MVP Oleada 2 cerrada
- frontend MVP Oleada 3 cerrada
- base de despliegue local con contenedores para `postgres`, `api` y `web`

El siguiente bloque ya no es abrir nuevas pantallas base del MVP, sino endurecer, pulir y preparar integraciones y despliegue.
