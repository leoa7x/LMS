# Modulo de instituciones, sedes, laboratorios, licencias y vigencias

## Estado de esta decision

Este documento define el diseno del modulo antes de continuar implementacion.

No se acepta un CRUD simple de institucion y licencia si no cubre despliegue multisede, vigencia contractual y operacion de laboratorios tecnicos.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa estos requisitos del documento rector:

- acceso 24 x 7 desde multiples sitios;
- sin servidores on-premise en la institucion;
- soporte para multiples accesos simultaneos;
- vigencia de acceso configurable, inicialmente preparada para 36 meses;
- administracion centralizada de usuarios, contenidos y resultados;
- preparacion para multiples sedes, docentes, estudiantes, cursos, modulos y practicas;
- operacion sobre laboratorios y talleres tecnicos;
- soporte tecnico local con tiempos de respuesta configurables;
- crecimiento sin rediseño total.

## Objetivo del modulo

Modelar la estructura operativa del cliente institucional del LMS y sus restricciones de acceso:

- institucion;
- sedes;
- laboratorios o talleres;
- contratos y periodos de vigencia;
- licencias y capacidad;
- reglas basicas de concurrencia y habilitacion.

Este modulo no es solo administrativo.

Es una pieza de negocio que habilita o restringe acceso real para usuarios, cursos y operacion del sistema.

## Entidades involucradas

### `Institution`

Representa la entidad contratante o centro educativo principal.

Campos obligatorios MVP:

- `name`
- `slug`
- `status`

Campos opcionales MVP:

- `officialCode`
- `contactEmail`

### `Campus`

Representa una sede o unidad operativa fisica.

Campos obligatorios MVP:

- `institutionId`
- `name`
- `status`

Campos opcionales MVP:

- `code`
- `address`

### `Laboratory`

Representa un laboratorio o taller tecnico de una sede.

Campos obligatorios MVP:

- `campusId`
- `name`
- `status`

Campos opcionales MVP:

- `technicalAreaId`
- `description`

### `ContractTerm`

Representa el periodo de vigencia contractual.

Campos obligatorios MVP:

- `institutionId`
- `startAt`
- `endAt`

Campos opcionales MVP:

- `concurrentCap`

### `License`

Representa la licencia o habilitacion comercial/operativa de acceso.

Campos obligatorios MVP:

- `institutionId`
- `name`
- `durationMonths`

Campos opcionales MVP:

- `contractTermId`
- `seats`

## Relaciones

- una `Institution` tiene muchas `Campus`
- una `Campus` tiene muchos `Laboratory`
- una `Institution` tiene muchos `ContractTerm`
- una `Institution` tiene muchas `License`
- un `ContractTerm` puede agrupar una o varias `License`
- `UserInstitutionMembership` depende de `Institution`, y opcionalmente de `Campus`, `Laboratory`, `ContractTerm` y `License`

## Reglas de negocio

1. Una institucion inactiva no debe habilitar nuevas membresias activas ni nuevos accesos.

2. Una sede debe pertenecer a una unica institucion.

3. Un laboratorio debe pertenecer a una unica sede.

4. Una licencia no puede existir sin institucion.

5. Si una licencia referencia un `ContractTerm`, sus duraciones y uso deben estar subordinados a ese contrato.

6. La vigencia real de acceso del usuario se determina por la combinacion de:

- estado de institucion
- estado de membresia
- fecha de inicio y fin de membresia
- licencia asignada
- contrato asociado

7. El sistema debe quedar preparado para restringir concurrencia por `ContractTerm.concurrentCap` o por `License.seats`, aunque el MVP solo deje la base y la validacion minima.

8. Los laboratorios deben poder vincularse a areas tecnicas para no romper la trazabilidad operacional del LMS tecnico.

## Roles involucrados

### `ADMIN`

Puede:

- crear y actualizar instituciones
- crear y actualizar sedes
- crear y actualizar laboratorios
- crear contratos y licencias
- activar o desactivar estas entidades

### `SUPPORT`

Puede:

- consultar instituciones, sedes, laboratorios, contratos y licencias
- apoyar diagnostico operativo

Restriccion:

- no debe modificar vigencias o capacidad sin permiso explicito

### `TEACHER`

No administra la estructura institucional.

Puede verla solo si su alcance lo requiere.

### `STUDENT`

No administra ni consulta estructura institucional salvo datos indirectos necesarios en su perfil operativo.

## Validaciones

- `slug` de institucion unico
- `name` de sede unico por institucion
- `name` de laboratorio unico por sede
- `endAt` debe ser mayor a `startAt`
- `durationMonths` minimo 1
- `seats` minimo 1 cuando exista
- `concurrentCap` minimo 1 cuando exista
- `contactEmail` debe ser correo valido si se informa

## Como responde este modulo al documento

Responde al documento en cuatro frentes concretos:

1. `Multisede y crecimiento`

El pliego exige una plataforma preparada para multiples sedes, docentes, estudiantes y laboratorios. Esto se resuelve separando institucion, sede y laboratorio en lugar de dejar un solo nivel institucional.

2. `Vigencia de 36 meses y acceso contractual`

El documento exige acceso configurable por vigencia, inicialmente preparado para 36 meses. Esto se modela mediante `License.durationMonths` y `ContractTerm`.

3. `Operacion tecnica real`

El LMS no es academico abstracto; esta ligado a laboratorios y talleres tecnicos. Por eso `Laboratory` es entidad de primer nivel y no un simple texto libre.

4. `Acceso centralizado y controlado`

La administracion centralizada del pliego requiere que la estructura institucional y contractual sea visible y gobernable desde el sistema, no por configuraciones externas.

## Alcance MVP

Entra en MVP:

- CRUD funcional de instituciones
- CRUD funcional de sedes
- CRUD funcional de laboratorios
- CRUD funcional de contratos
- CRUD funcional de licencias
- listados enriquecidos con relaciones
- validaciones minimas de consistencia
- soporte para que membresias de usuario apunten a esta estructura

## Fase posterior

Queda para fase siguiente:

- enforcement duro de concurrencia por contrato o licencia
- reglas complejas de consumo de asientos
- renovaciones y versionado contractual
- historial de cambios detallado por entidad institucional
- dashboards operativos de capacidad y consumo

## Riesgos si se simplifica

Si se simplifica este modulo:

- la plataforma no soportara despliegue multisede real
- la vigencia del acceso quedara como dato decorativo
- los laboratorios quedaran fuera del dominio operativo
- usuarios y roles perderan contexto institucional
- el crecimiento del proyecto obligara a redisenar el modelo
