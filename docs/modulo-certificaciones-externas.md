# Modulo de certificaciones externas

## Estado de esta decision

Este modulo deja de tratar las certificaciones como un listado decorativo y las integra al dominio academico del LMS.

Debe responder al pliego en su parte de articulacion con certificaciones industriales externas en areas como Industria 4.0, Seguridad, CNC y Mantenimiento Industrial.

## Requisitos del pliego que cubre

- relacion con certificaciones externas promovidas por entidades ajenas al proveedor;
- articulacion de cursos y rutas con metas certificables;
- trazabilidad de avance hacia una certificacion;
- consolidacion de cumplimiento academico para rutas y cursos asociados.

## Problema si se implementa basico

Si solo existe `CertificationTrack` con nombre y cursos relacionados, la certificacion no gobierna nada.

Se pierde:

- definicion de requisitos minimos;
- relacion con cursos obligatorios u opcionales;
- posibilidad de calcular elegibilidad por estudiante;
- lectura operativa de avance certificable.

## Entidades involucradas

### `CertificationTrack`

Marco externo de certificacion.

Campos MVP:

- `slug`
- `name`
- `issuer`
- `description`

## Nuevas entidades MVP

### `CertificationTrackCourse`

Relacion entre certificacion y curso con reglas minimas.

Campos MVP:

- `certificationTrackId`
- `courseId`
- `sortOrder`
- `isRequired`
- `minimumScore`

### `StudentCertificationStatus`

Estado consolidado de avance de un estudiante respecto de una certificacion.

Campos MVP:

- `studentId`
- `certificationTrackId`
- `institutionId`
- `learningPathAssignmentId` opcional
- `status`
- `requiredCourses`
- `completedRequiredCourses`
- `averageFinalScore`
- `eligibleAt` opcional
- `lastCalculatedAt`

## Relaciones

- una `CertificationTrack` agrupa varios cursos mediante `CertificationTrackCourse`
- un curso puede pertenecer a varias certificaciones
- un `StudentCertificationStatus` consolida el estado del estudiante frente a una certificacion
- una certificacion puede relacionarse indirectamente con una `LearningPath` si los cursos del track forman parte de una ruta asignada

## Reglas de negocio

1. una certificacion debe tener al menos un curso asociado para ser util operativamente;
2. cada curso asociado debe definir orden minimo y si es obligatorio;
3. la elegibilidad del estudiante se calcula sobre cursos obligatorios del track;
4. un curso obligatorio cuenta como cumplido si:
   - existe resultado consolidado por matricula en estado aprobatorio;
   - y si `minimumScore` esta definido, el `finalScore` cumple el minimo;
5. el estado consolidado de la certificacion debe distinguir:
   - `NOT_STARTED`
   - `IN_PROGRESS`
   - `ELIGIBLE`
6. un docente solo puede consultar tracks y estados dentro de su alcance institucional;
7. un estudiante solo puede consultar su propio estado certificable.

## Roles involucrados

- `ADMIN`: crea tracks, asocia cursos y consulta estados institucionales
- `TEACHER`: consulta tracks y elegibilidad dentro de su alcance
- `STUDENT`: consulta su propio estado certificable
- `SUPPORT`: lectura operativa posterior si se requiere, no prioritaria en MVP

## Validaciones

- no permitir duplicar curso dentro del mismo track;
- `minimumScore` debe estar entre `0` y `100` si se informa;
- `sortOrder` debe ser positivo;
- no calcular estado certificable fuera de la institucion activa;
- no exponer estado de otro estudiante a un estudiante final.

## MVP

Entra en MVP:

- creacion y lectura de `CertificationTrack`
- asociacion de cursos con reglas minimas
- calculo de estado certificable por estudiante
- lectura consolidada de elegibilidad por track

Queda para fase posterior:

- equivalencias externas formales
- evidencia documental por emisor
- emision de certificados
- integracion con proveedores externos

## Respuesta al documento

Este modulo responde al pliego porque convierte la idea de certificacion externa en una capacidad operativa del LMS.

Ya no queda solo como referencia tematica: el sistema puede relacionar cursos y rutas con un marco certificable y calcular si un estudiante ya alcanzo o no la elegibilidad minima segun su desempeno consolidado.
