# Modulo de vocalizacion y contenido interactivo

## Estado de esta decision

Este documento cierra el diseno del MVP de vocalizacion y contenido interactivo dentro del portal LMS.

No se implementa como motor externo separado ni como simple bandera booleana.

## Requisitos del pliego que cubre

- contenido con vocalizacion habilitable por el usuario;
- material interactivo dentro del mismo portal;
- relacion entre teoria, recurso y practica;
- soporte para emulaciones y componentes interactivos;
- contenidos bilingues dentro del mismo flujo academico.

## Decisiones de arquitectura

El MVP se implementa con dos entidades explicitas:

### `ContentVoiceoverTrack`

Representa una pista de voz vinculada a:

- un `ContentResource`, o
- un `LessonSegment`

Campos MVP:

- `language`
- `sourceKind`
- `status`
- `title`
- `transcriptEs`
- `transcriptEn`
- `audioUri`
- `durationSeconds`

Justificacion:

El pliego no pide solo activar un flag; pide que el contenido pueda presentarse con vocalizacion. Eso requiere modelar la pista, su origen y su estado operativo.

### `InteractiveContentConfig`

Representa la configuracion del contenido interactivo integrado al portal.

Campos MVP:

- `kind`
- `titleEs`
- `titleEn`
- `configJson`
- `embedUri`
- `isActive`

Puede estar vinculado a:

- un `ContentResource`, o
- un `LessonSegment`

Justificacion:

El pliego exige material interactivo, emulaciones y relacion con componentes reales. El MVP no necesita editor visual completo, pero si una configuracion estructurada que el frontend pueda consumir.

## Reglas de negocio MVP

- una pista de vocalizacion debe estar asociada a un recurso o a un segmento;
- una configuracion interactiva debe estar asociada a un recurso o a un segmento;
- si se crea una pista de vocalizacion, el recurso o segmento asociado debe quedar con `voiceoverEnabled = true`;
- el contenido interactivo debe pertenecer a cursos visibles para el usuario segun reglas academicas;
- los textos localizados se resuelven con el mismo mecanismo de bilingüismo transversal del backend.

## Integracion con el modulo academico

- `ContentResource` sigue siendo el contenedor didactico principal;
- `LessonSegment` sigue siendo el bloque pedagogico dentro de la leccion;
- la vocalizacion y la interactividad no viven fuera del dominio academico, sino colgadas de estos dos nodos.

## Que entra en MVP

- crear y listar pistas de vocalizacion;
- crear y listar configuraciones de contenido interactivo;
- exposicion dentro de `GET /content-resources`;
- localizacion basica de titulo y transcript;
- preparacion para recursos `AUDIO` e `INTERACTIVE`.

## Que queda para fase posterior

- generacion TTS real;
- edicion avanzada de escenas interactivas;
- analytics finos de reproduccion;
- sincronizacion texto-audio;
- versionado independiente de pistas y configuraciones.

## Riesgos si se simplifica

Si se deja solo `voiceoverEnabled`:

- no habra forma de saber que audio usar;
- no existira transcript ni origen de la pista;
- el frontend tendra que inventar estructura;
- el contenido interactivo seguira siendo una promesa sin configuracion real.
