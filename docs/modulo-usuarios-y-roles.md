# Modulo de usuarios y roles

## Estado de esta decision

Este documento congela el diseno del modulo antes de continuar implementacion.

La regla es explicita:

- no se implementa como CRUD generico;
- no basta con nombre, correo, contrasena y rol;
- debe responder al pliego del sistema de e-learning y simuladores virtuales.

## Requisitos del pliego que cubre

Este modulo cubre de forma directa los siguientes requisitos del documento rector:

- portal web unico para profesores y estudiantes;
- acceso 24 x 7 desde multiples sitios;
- plataforma multiusuario con accesos simultaneos;
- roles claros: administrador, docente, estudiante y soporte tecnico;
- administracion de contenidos por docente segun nivel del estudiante;
- seguimiento individual por estudiante;
- vigencia configurable de acceso, inicialmente preparada para 36 meses;
- administracion centralizada de usuarios, cursos y resultados;
- operacion preparada para multiples sedes, docentes, estudiantes, cursos y rutas;
- trazabilidad de acciones y soporte tecnico.

## Objetivo del modulo

Modelar identidad, pertenencia institucional, alcance operativo y permisos del usuario dentro del LMS tecnico.

Este modulo no solo autentica.

Tambien define:

- a que institucion, sede y laboratorio pertenece el usuario;
- que puede ver o administrar;
- bajo que vigencia puede acceder;
- como se relaciona con cursos, rutas y seguimiento;
- como se auditan los cambios de estado y permisos.

## Modelo de datos propuesto

### Entidades principales

#### `User`

Representa la identidad base de una persona dentro del sistema.

Campos obligatorios:

- `id`
- `email`
- `passwordHash`
- `firstName`
- `lastName`
- `preferredLanguage`
- `status`
- `createdAt`
- `updatedAt`

Campos opcionales:

- `documentType`
- `documentNumber`
- `phone`
- `avatarUrl`
- `lastLoginAt`
- `lastLoginIp`
- `deactivatedAt`
- `deactivationReason`

#### `Institution`

Entidad educativa o contratante principal.

Campos obligatorios:

- `id`
- `name`
- `slug`
- `status`

Campos opcionales:

- `officialCode`
- `contactEmail`

#### `Campus`

Representa una sede fisica o unidad operativa de una institucion.

Campos obligatorios:

- `id`
- `institutionId`
- `name`
- `status`

Campos opcionales:

- `code`
- `address`

#### `Laboratory`

Representa laboratorio, taller o unidad tecnica operativa donde aplica el usuario o el contenido.

Campos obligatorios:

- `id`
- `campusId`
- `name`
- `status`

Campos opcionales:

- `technicalAreaId`
- `description`

#### `Role`

Catalogo de roles del sistema.

Campos obligatorios:

- `id`
- `code`

Valores base:

- `ADMIN`
- `TEACHER`
- `STUDENT`
- `SUPPORT`

#### `Permission`

Capacidad concreta del sistema.

Ejemplos:

- `users.read`
- `users.manage`
- `courses.read`
- `courses.manage`
- `enrollments.manage`
- `progress.read`
- `support.manage`
- `simulators.read`
- `simulators.manage`

#### `RolePermission`

Relacion entre rol y permiso base.

#### `UserInstitutionMembership`

Relacion formal del usuario con institucion, sede y laboratorio cuando aplique.

Campos obligatorios:

- `id`
- `userId`
- `institutionId`
- `membershipStatus`
- `accessStartAt`

Campos opcionales:

- `campusId`
- `laboratoryId`
- `accessEndAt`
- `licenseId`
- `contractTermId`

#### `UserRoleAssignment`

Asignacion de rol con alcance operativo.

Campos obligatorios:

- `id`
- `userId`
- `roleId`
- `institutionMembershipId`
- `scopeType`
- `scopeStatus`

Campos opcionales:

- `campusId`
- `laboratoryId`
- `technicalAreaId`
- `courseId`
- `learningPathId`

Justificacion:

El rol no debe ser solo global. Un docente puede administrar ciertos cursos, rutas, niveles o sedes sin tener control total del sistema.

#### `StudentAcademicProfile`

Perfil academico del estudiante.

Campos obligatorios:

- `id`
- `userId`
- `institutionMembershipId`
- `currentLevel`
- `academicStatus`

Campos opcionales:

- `cohort`
- `entryDate`
- `expectedEndDate`

#### `StudentVisibilityAssignment`

Define que puede ver el estudiante por nivel, ruta, curso o modulo.

Campos obligatorios:

- `id`
- `studentId`
- `assignmentType`
- `assignedByUserId`
- `effectiveFrom`

Campos opcionales:

- `learningPathId`
- `courseId`
- `moduleId`
- `levelCode`
- `effectiveUntil`

Justificacion:

Este es el mecanismo que permite cumplir el requisito de que el docente administre los contenidos visibles segun nivel.

#### `TeacherScopeAssignment`

Define a que estudiantes, grupos, cursos, sedes o laboratorios puede administrar un docente.

Campos obligatorios:

- `id`
- `teacherUserId`
- `scopeType`
- `effectiveFrom`

Campos opcionales:

- `institutionId`
- `campusId`
- `laboratoryId`
- `technicalAreaId`
- `courseId`
- `learningPathId`
- `levelCode`
- `effectiveUntil`

#### `AccessSession`

Sesion operativa para trazabilidad y control de acceso concurrente.

Campos obligatorios:

- `id`
- `userId`
- `institutionMembershipId`
- `issuedAt`
- `expiresAt`
- `status`

Campos opcionales:

- `refreshTokenHash`
- `ipAddress`
- `userAgent`
- `lastSeenAt`
- `revokedAt`
- `revokedReason`

#### `UserLifecycleAudit`

Registro especializado para eventos del ciclo de vida del usuario.

Campos obligatorios:

- `id`
- `userId`
- `eventType`
- `performedByUserId`
- `occurredAt`

Campos opcionales:

- `beforeState`
- `afterState`
- `reason`

Eventos minimos:

- `CREATED`
- `UPDATED`
- `ACTIVATED`
- `DEACTIVATED`
- `ROLE_ASSIGNED`
- `ROLE_REMOVED`
- `MEMBERSHIP_CHANGED`
- `ACCESS_REVOKED`

## Relaciones principales

- `Institution` 1:N `Campus`
- `Campus` 1:N `Laboratory`
- `User` 1:N `UserInstitutionMembership`
- `UserInstitutionMembership` 1:N `UserRoleAssignment`
- `Role` N:M `Permission`
- `User` 1:1 `StudentAcademicProfile` cuando aplique
- `StudentAcademicProfile` 1:N `StudentVisibilityAssignment`
- `User` 1:N `TeacherScopeAssignment` cuando sea docente
- `User` 1:N `AccessSession`
- `User` 1:N `UserLifecycleAudit`

## Reglas de negocio

1. Un usuario no puede autenticarse si:

- esta inactivo;
- su membresia institucional no esta activa;
- su acceso esta fuera de vigencia;
- su licencia o contrato no habilita acceso;
- no tiene al menos una asignacion de rol operativa.

2. Un docente no administra todo por defecto.

Solo puede visualizar o administrar estudiantes, cursos, rutas, niveles o laboratorios dentro de su `TeacherScopeAssignment`.

3. Un estudiante no ve todo el catalogo por defecto.

Ve solo lo asignado por:

- matricula;
- ruta preconfigurada;
- asignacion de visibilidad;
- reglas de nivel.

4. Soporte tecnico tiene acceso operativo, no academico pleno.

Puede ver diagnostico, sesiones, tickets y estados de usuario, pero no modificar resultados academicos sin permisos explicitos.

5. Todo cambio relevante del usuario debe auditarse.

Minimo:

- creacion
- actualizacion
- activacion
- desactivacion
- cambio de rol
- cambio de membresia
- revocacion de acceso

6. El idioma preferido es obligatorio y debe usarse para UI y contenido cuando exista traduccion.

7. La vigencia de acceso debe poder venir de:

- contrato institucional;
- licencia asignada;
- membresia con fecha de fin;
- politica de acceso temporal.

## Permisos por rol

### Administrador

Permisos MVP:

- gestionar usuarios
- activar y desactivar usuarios
- asignar roles
- gestionar instituciones, sedes y laboratorios
- gestionar licencias y vigencias
- ver dashboards globales
- ver auditoria
- gestionar cursos, rutas y matriculas

Restriccion:

- no debe editar resultados academicos historicos sin traza.

### Docente

Permisos MVP:

- ver estudiantes dentro de su alcance
- asignar contenido visible segun nivel
- ver progreso de sus estudiantes
- gestionar quizzes y reasignaciones dentro de su alcance
- gestionar cursos, modulos o practicas solo si su asignacion lo permite

Restriccion:

- no debe administrar usuarios globales ni instituciones completas.

### Estudiante

Permisos MVP:

- acceder a contenido asignado
- rendir quizzes habilitados
- usar simuladores habilitados
- ver su progreso
- consultar glosario y recursos

Restriccion:

- no debe ver contenido no asignado ni estudiantes ajenos.

### Soporte tecnico

Permisos MVP:

- ver usuarios, sesiones, errores, tickets y estado de integraciones
- asistir en habilitacion o bloqueo tecnico de acceso
- ver auditoria operativa

Restriccion:

- no debe alterar asignaciones academicas ni evaluaciones sin permiso especial.

## Campos obligatorios y opcionales por entidad MVP

### MVP obligatorio

#### `User`

Obligatorios:

- `email`
- `firstName`
- `lastName`
- `passwordHash`
- `preferredLanguage`
- `status`

Opcionales en MVP:

- `phone`
- `avatarUrl`
- `documentType`
- `documentNumber`

#### `Institution`

Obligatorios:

- `name`
- `slug`
- `status`

#### `Campus`

Obligatorios:

- `institutionId`
- `name`
- `status`

#### `Laboratory`

Obligatorios:

- `campusId`
- `name`
- `status`

#### `UserInstitutionMembership`

Obligatorios:

- `userId`
- `institutionId`
- `membershipStatus`
- `accessStartAt`

Opcionales MVP:

- `campusId`
- `laboratoryId`
- `accessEndAt`
- `licenseId`

#### `UserRoleAssignment`

Obligatorios:

- `userId`
- `roleId`
- `institutionMembershipId`
- `scopeType`
- `scopeStatus`

Opcionales MVP:

- `courseId`
- `learningPathId`
- `levelCode`

#### `StudentAcademicProfile`

Obligatorios:

- `userId`
- `institutionMembershipId`
- `currentLevel`
- `academicStatus`

#### `TeacherScopeAssignment`

Obligatorios:

- `teacherUserId`
- `scopeType`
- `effectiveFrom`

Opcionales MVP:

- `courseId`
- `learningPathId`
- `levelCode`

#### `AccessSession`

Obligatorios:

- `userId`
- `institutionMembershipId`
- `issuedAt`
- `expiresAt`
- `status`

#### `UserLifecycleAudit`

Obligatorios:

- `userId`
- `eventType`
- `performedByUserId`
- `occurredAt`

## Como responde este modulo al documento

Responde al documento en cinco frentes concretos:

1. `Roles diferenciados`

El pliego exige administrador, docente, estudiante y soporte tecnico. Este diseno los contempla como roles de sistema, pero con alcance real y permisos operativos.

2. `Institucion, sede y laboratorio`

El documento habla de una plataforma para institucion, talleres, laboratorios y operacion tecnica. Por eso no basta con `institutionId`; se modelan sede y laboratorio para no romper el crecimiento multisede.

3. `Administracion por nivel`

El pliego dice que el profesor debe administrar los contenidos que cada estudiante ve segun su nivel. Eso se resuelve con `StudentAcademicProfile`, `StudentVisibilityAssignment` y `TeacherScopeAssignment`.

4. `Vigencia y habilitacion`

El documento exige acceso por 36 meses o vigencia contractual. Este diseno conecta el acceso del usuario con membresia, licencia, contrato y fechas operativas.

5. `Seguimiento y trazabilidad`

El usuario no es aislado del dominio academico. Queda ligado a progreso, contenido visible, sesiones y auditoria de ciclo de vida.

## Que entra en MVP

Entra en MVP:

- roles base del sistema;
- membresia usuario-institucion;
- soporte para sede y laboratorio;
- estado del usuario;
- idioma preferido;
- vigencia basica por membresia/licencia;
- asignacion de rol con alcance minimo;
- perfil academico del estudiante con nivel;
- alcance basico del docente por curso, ruta o nivel;
- sesiones trazables;
- auditoria de creacion, actualizacion, activacion y desactivacion.

## Que queda para fase posterior

Queda para siguiente fase:

- permisos mas finos por accion y submodulo;
- multiples membresias activas complejas por usuario;
- jerarquias avanzadas por laboratorio y area tecnica;
- politicas avanzadas de acceso simultaneo por licencia;
- aprobaciones formales para cambios sensibles;
- delegacion granular de soporte tecnico;
- reglas de grupo, cohorte y calendario academico mas sofisticadas.

## Riesgos si se simplifica

Si este modulo se simplifica de nuevo a un CRUD de usuario:

- el docente no podra controlar contenido por nivel;
- el acceso por vigencia quedara fuera del flujo real;
- no se soportaran sedes y laboratorios sin redisenar;
- soporte tecnico quedara mezclado con admin global;
- la auditoria sera insuficiente;
- el LMS volvera a parecer un producto generico y no el sistema exigido por el pliego.
