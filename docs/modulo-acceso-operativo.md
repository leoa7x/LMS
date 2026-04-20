# Modulo de acceso operativo y vigencia

## Requisitos del pliego que cubre

- acceso 24 x 7 mediante portal web;
- acceso desde multiples sitios;
- multiples accesos simultaneos;
- vigencia configurable preparada para 36 meses;
- habilitacion por contrato o licenciamiento;
- administracion centralizada del acceso;
- crecimiento multisede sin rediseño.

## Objetivo

Convertir licencias, contratos, membresias y sesiones en reglas reales de acceso. Este modulo no agrega un CRUD nuevo; agrega enforcement operativo sobre entidades que ya existen.

## Entidades involucradas

- `UserInstitution`
- `Institution`
- `License`
- `ContractTerm`
- `AccessSession`

## Reglas de negocio MVP

1. Una membresia no puede iniciar sesion si:
   - la institucion esta inactiva;
   - la membresia no esta activa;
   - la fecha actual queda fuera de la ventana efectiva;
   - el contrato asociado esta vencido o aun no inicia.

2. La ventana efectiva de acceso se calcula como el minimo entre:
   - `UserInstitution.accessEndAt` si existe;
   - `accessStartAt + License.durationMonths`;
   - `ContractTerm.endAt` si existe.

3. Si no existe `accessEndAt` pero si existe licencia, la membresia debe quedar preparada para expirar por la duracion de la licencia, inicialmente 36 meses por defecto.

4. Si un `ContractTerm.concurrentCap` existe, no se deben permitir nuevas sesiones activas que superen ese tope.

5. Si una `License.seats` existe, no se deben permitir nuevas sesiones activas que superen ese tope para esa licencia.

6. Las validaciones de acceso deben vivir en un servicio central, no duplicadas entre auth, usuarios u otros modulos.

## Roles involucrados

- `ADMIN`
- `SUPPORT` para consulta operativa
- `TEACHER`
- `STUDENT`

## Validaciones

- licencia y contrato deben pertenecer a la misma institucion que la membresia;
- el contrato debe contener la licencia cuando ambas referencias existan;
- no se deben contar sesiones revocadas o expiradas como concurrentes;
- `refresh` sobre una sesion existente no debe bloquearse por concurrencia como si fuera una sesion nueva.

## MVP

- servicio central `AccessPolicyService`
- resolucion de membresia activa y efectiva
- calculo de fecha efectiva de expiracion
- enforcement de concurrencia por contrato y licencia al login
- derivacion automatica de `accessEndAt` al crear membresia si aplica
- consulta interna reutilizable por auth y usuarios

## Fase posterior

- cupos por tipo de usuario;
- reglas de concurrencia por sede o laboratorio;
- renovacion automatica;
- dashboards de consumo de licencias.

## Como responde al documento

Este modulo hace que contrato, licencia y vigencia de 36 meses dejen de ser datos decorativos. El acceso pasa a depender de reglas reales y centralizadas, alineadas con el pliego y reutilizables por todo el sistema.
