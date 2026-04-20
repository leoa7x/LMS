# Direccion visual del dashboard LMS

## Objetivo

Definir una linea visual para el dashboard administrativo y academico del LMS que sea consistente con el alcance del proyecto.

No debe parecer un sitio marketing ni un panel generico de SaaS liviano.

## Criterio base

El dashboard del LMS debe transmitir:

- operacion academica real
- control tecnico
- lectura clara de estructura, progreso y trazabilidad
- capacidad de crecimiento sin colapsar visualmente

## Referencias conceptuales

Tomando como referencia `awesome-design-md`, la direccion visual recomendada combina:

- densidad controlada de paneles tipo `Sentry` o `PostHog`
- precision y limpieza de `Linear`
- lectura tecnica y documental cercana a `IBM` o `Mintlify`

## Reglas visuales

### Estructura

- layout principal con sidebar persistente
- encabezado superior con contexto de modulo
- zona central con cards de resumen, tablas y paneles de detalle
- paginas de gestion con vista maestra y detalle

### Jerarquia

- metricas arriba
- filtros y acciones debajo del encabezado
- tablas o listados como bloque principal
- paneles secundarios para detalle, estado y relacion entre entidades

### Estilo

- interfaz clara por defecto
- fondos neutros y superficies diferenciadas por capas suaves
- acento sobrio y tecnico
- bordes definidos, no excesivamente redondeados
- sombras ligeras

### Tipografia

- sans limpia para UI
- ritmo compacto y legible
- titulos claros
- labels pequeños pero firmes

### Componentes clave

- cards de metricas
- tablas densas pero legibles
- badges de estado
- formularios administrativos
- drawers o paneles laterales de detalle
- timeline o lista para auditoria

## Que evitar

- gradientes decorativos excesivos
- hero sections de marketing
- UI juguetona
- dashboards demasiado vacios
- exceso de microanimaciones

## Aplicacion al LMS

El dashboard debe priorizar:

- usuarios
- instituciones
- licencias
- cursos
- modulos y lecciones
- practicas
- quizzes
- progreso
- simuladores
- auditoria

## Decision de implementacion

El frontend administrativo del LMS seguira esta linea:

- sidebar fija
- panel principal con modulos de gestion
- home administrativo con metricas y accesos a entidades clave
- paginas CRUD operativas sobre la API ya construida
