# Arquitectura del LMS

## Enfoque tecnico

Se propone un monorepo modular con frontend y backend desacoplados, compartiendo tipos y contratos cuando aplique.

## Stack propuesto

- Frontend: Next.js con App Router y TypeScript estricto
- Backend: NestJS con TypeScript estricto
- Base de datos: PostgreSQL
- ORM: Prisma
- UI: Tailwind CSS
- Auth: JWT access token + refresh token
- Infra local: Docker Compose
- i18n: preparado desde Fase 1

## Justificacion del stack

- Next.js permite portal web moderno, SSR cuando convenga y una capa UI robusta.
- NestJS favorece arquitectura modular, validacion, guards y dominio mantenible.
- Prisma acelera modelado inicial y migraciones sin sacrificar claridad.
- PostgreSQL soporta bien relaciones academicas, auditoria y reportes.
- Docker Compose simplifica entorno local consistente.

## Arquitectura funcional

El sistema se divide en estos modulos:

1. Auth y roles
2. Usuarios
3. Instituciones, licencias y vigencias
4. Cursos
5. Rutas o programas preconfigurados
6. Modulos y lecciones
7. Contenidos y recursos
8. Glosario
9. Simuladores
10. Evaluaciones y quizzes
11. Progreso y seguimiento
12. Reportes
13. Notificaciones
14. Soporte tecnico
15. Auditoria
16. Configuracion e idiomas
17. Certificaciones externas

## Arquitectura de simuladores

El modulo de simuladores se disena separado del core academico pero integrado por contratos internos.

Cada simulador tendra:

- tipo de integracion
- estrategia de lanzamiento
- estrategia de captura de progreso
- modo de evaluacion

Clasificaciones:

- `embeddable_existing`
- `third_party_adapter`
- `native_basic`
- `native_advanced`

## Flujo general

1. Usuario autentica
2. Backend resuelve rol, institucion y vigencia
3. Frontend carga dashboard segun rol
4. Estudiante consume curso, modulo, leccion y practica
5. Evaluaciones y simuladores reportan eventos
6. Modulo de progreso consolida estado
7. Reportes y auditoria consultan tablas derivadas

## Riesgos y trade-offs

- Simuladores propios elevan complejidad y costo: se debe clasificar muy bien cada caso.
- Integrar proveedores terceros acelera entregas, pero aumenta dependencia externa.
- Un modelo academico demasiado rigido dificultaria expansion futura; por eso se modelan rutas y certificaciones aparte.
- La internacionalizacion temprana exige disciplina de contenido desde el inicio.
