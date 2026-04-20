# Modulo de contenidos, glosario y bilinguismo

## Estado de esta decision

Este documento define el diseno del modulo antes de continuar implementacion.

No se permite tratar contenidos como simples archivos adjuntos.

Debe responder al pliego con contenido tecnico bilingue, glosario integrado, material interactivo, vocalizacion opcional y soporte para impresion PDF de desarrollos por modulo.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa:

- contenido en espanol e ingles;
- glosario tecnico integrado al mismo portal;
- e-books, videos, fotografias de componentes reales y material interactivo;
- contenido con vocalizacion habilitable;
- impresion en PDF de habilidades o desarrollos por modulo;
- acceso a nuevo contenido sin costo adicional durante la vigencia;
- acceso al material desde el mismo portal.

## Entidades

### `ContentResource`

Entidad base del recurso didactico.

Debe soportar:

- tipo de recurso
- contenido embebido o referenciado
- metadatos de visualizacion
- version actual
- activacion de vocalizacion

Campos MVP:

- `lessonId`
- `type`
- `titleEs`
- `titleEn`
- `bodyEs`
- `bodyEn`
- `uri`
- `voiceoverEnabled`

### `ContentResourceVersion`

Nueva entidad para versionado de contenido.

Campos MVP:

- `contentResourceId`
- `versionLabel`
- `titleEs`
- `titleEn`
- `bodyEs`
- `bodyEn`
- `uri`
- `isCurrent`
- `releasedAt`

Justificacion:

El pliego exige acceso a nuevo contenido durante la vigencia del servicio. Eso requiere versionado o al menos historial controlado.

### `GlossaryTerm`

Entidad base del glosario.

Debe seguir integrada al portal y ser bilingue.

### `GlossaryTermRelation`

Nueva entidad para vincular terminos con:

- recurso
- segmento
- practica
- area tecnica

MVP: se implementara contra `ContentResource`.

### `LanguageContent`

Entidad ya existente y preparada para localizacion transversal.

Se mantiene como capa auxiliar para campos localizables fuera del modelo base.

### `ModulePdfExportTemplate`

Preparada para MVP basico.

Permite definir si un modulo tiene configuracion de exportacion PDF para habilidades/desarrollos.

## Relaciones

- `ContentResource` pertenece a una `Lesson`
- `ContentResource` puede alimentar `LessonSegment`
- `ContentResource` tiene muchas `ContentResourceVersion`
- `GlossaryTerm` puede relacionarse con muchos `ContentResource`
- `Module` puede tener configuracion de exportacion PDF

## Habilitacion de contenido por nivel

El contenido no se habilita con bandera plana por recurso.

Se habilita por la combinacion de:

- matricula del estudiante
- ruta asignada
- visibilidad por curso o modulo
- nivel del estudiante

En MVP:

- el contenido se considera visible si pertenece a leccion o modulo visible para la matricula
- las reglas de nivel siguen viniendo de `StudentVisibilityAssignment`

## Soporte PDF

En MVP no se implementa generador PDF final completo, pero si la base de backend para:

- identificar modulos exportables
- consolidar contenido, practicas y evidencias por modulo
- dejar lista la estructura para renderizar PDF despues

## Bilinguismo desde backend y frontend

### Backend

El backend debe modelar:

- campos `Es` y `En` en recursos y glosario
- versionado por recurso
- `preferredLang` en usuario
- `LanguageContent` para extensiones futuras

### Frontend

El frontend debe decidir representacion usando:

- idioma preferido del usuario
- fallback a espanol
- lectura del contenido localizable desde una sola vista del portal

## MVP

Entra en MVP:

- recursos bilingues mejorados
- versionado de recursos
- glosario bilingue
- relacion glosario <-> contenido
- soporte de vocalizacion por recurso
- base para exportacion PDF de modulo

## Fase posterior

Queda preparado para:

- workflow editorial completo
- versionado con aprobaciones
- generacion PDF rica con branding y plantillas avanzadas
- referencias de glosario sobre segmentos, practicas y diagramas
- contenido nuevo liberado por vigencia y catalogo

## Riesgos si se simplifica

Si se simplifica este modulo:

- el bilinguismo quedara como parche
- el glosario no estara integrado de verdad
- el contenido tecnico se reducira a archivos sueltos
- no habra base para evolucion de contenidos durante la vigencia
- la impresion PDF quedara desconectada del dominio academico
