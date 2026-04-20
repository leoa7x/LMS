# Modulo de simuladores

## Estado de esta decision

Este documento define el diseno del modulo antes de continuar implementacion.

No se permite tratar simuladores como subsistema externo ni como iframe decorativo desconectado del flujo academico.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa:

- simuladores integrados al portal;
- relacion entre teoria, practica y simulacion;
- uso del simulador ligado a cursos, modulos y practicas;
- emulaciones 2D y 3D;
- material interactivo;
- relacion entre diagramas y componentes reales;
- simulacion de fallas;
- trazabilidad del uso por estudiante;
- integracion con progreso individual;
- clasificacion entre embebido, adaptado de tercero, propio basico y propio avanzado.

## Entidades y relaciones

### Entidades ya existentes

- `Simulator`
- `SimulatorMapping`
- `SimulatorSession`

### Entidades que deben regir el modulo

#### `Simulator`

Representa la definicion del simulador.

Campos MVP:

- `slug`
- `name`
- `kind`
- `launchUrl`
- `configJson`
- `isTrackable`

Clasificacion obligatoria:

- `EMBEDDABLE_EXISTING`
- `THIRD_PARTY_ADAPTER`
- `NATIVE_BASIC`
- `NATIVE_ADVANCED`

#### `SimulatorMapping`

Conecta el simulador con la practica academica.

Debe existir al menos a nivel de `Practice`, pero el modulo debe quedar preparado para extenderse a `LessonSegment` o `Module`.

#### `SimulatorSession`

Representa la sesion del estudiante en el simulador.

Campos MVP:

- `simulatorId`
- `studentId`
- `enrollmentId`
- `status`
- `startedAt`
- `finishedAt`
- `score`

### Entidades necesarias para evolucion del modulo

#### `SimulatorEvent`

Preparada para fase posterior.

Registraria eventos finos dentro del simulador:

- inicio de paso
- error tecnico
- accion sobre componente
- insercion de falla
- finalizacion de actividad

#### `SimulatorFaultScenario`

Preparada para fase posterior.

Modela escenarios de falla activables.

#### `DiagramComponentReference`

Preparada para fase posterior.

Permite relacionar:

- simbolo o nodo del diagrama
- componente real
- fotografia o recurso visual

## Arquitectura del modulo

La arquitectura del modulo se apoya en tres capas:

### `Capa academica`

Define donde vive el simulador en el flujo de aprendizaje.

- curso
- modulo
- leccion
- practica

### `Capa de integracion`

Define como se lanza el simulador:

- embebido dentro del portal
- adaptador de tercero
- nativo basico
- nativo avanzado

### `Capa de trazabilidad`

Define que registra la plataforma:

- quien uso el simulador
- desde que matricula
- cuando inicio
- cuando termino
- resultado o score
- impacto sobre progreso

## Integracion con progreso del estudiante

El simulador no suma progreso por existir.

Debe sumar progreso cuando existe una `SimulatorSession` completada dentro de una matricula valida.

### Regla MVP

- `SimulatorSession` con estado `COMPLETED` incrementa el eje de simuladores del `StudentProgress`
- el recálculo de progreso debe considerar simuladores completados respecto de los simuladores trackeables del curso

## Integracion con cursos, modulos y practicas

En MVP la integracion principal sera:

- `Course` -> `Module` -> `Lesson` -> `Practice` -> `SimulatorMapping`

### Regla

El simulador se vincula a la `Practice`.

Eso permite:

- relacionarlo con teoria previa
- relacionarlo con evidencia de practica
- integrarlo al progreso
- mantener trazabilidad academica real

## MVP

Entra en MVP:

- catalogo de simuladores
- clasificacion obligatoria por tipo
- mapeo simulador a practica
- sesiones por estudiante
- cierre de sesion con estado y score
- trazabilidad minima en auditoria
- integracion con progreso por matricula

## Fase posterior

Queda preparado para:

- eventos finos de sesion
- escenarios de falla
- diagramas con componentes reales
- emulaciones 3D mas ricas
- analitica de simulacion por paso o componente

## Riesgos si se simplifica

Si se simplifica este modulo:

- el simulador quedara separado del flujo academico
- no habra trazabilidad didactica real
- el progreso no reflejara uso autentico de simuladores
- las practicas perderan relacion con teoria y simulacion
- el sistema no podra crecer hacia fallas, diagramas y 3D sin rediseño
