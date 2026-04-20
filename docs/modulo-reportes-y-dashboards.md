# Modulo de reportes y dashboards

## Requisitos del documento que cubre

- administracion academica y reportes;
- visibilidad del progreso por estudiante para el docente;
- seguimiento individual en tiempo real;
- control institucional de operacion;
- monitoreo de cursos, matriculas, progreso, evaluaciones, practicas y simuladores;
- trazabilidad operativa para administracion, docencia y soporte.

## Riesgo de una implementacion basica

Si se resuelve como tarjetas con contadores globales, el LMS no responde al pliego. El riesgo real es terminar con dashboards bonitos pero inutiles para operacion academica: sin contexto institucional, sin alcance docente, sin relacion con progreso, sin alertas de estudiantes rezagados y sin reportes accionables.

## Entidades involucradas

- `User`
- `UserInstitution`
- `TeacherScopeAssignment`
- `StudentEnrollment`
- `StudentLearningPathAssignment`
- `StudentProgress`
- `Quiz`
- `QuizAttempt`
- `QuizRetakeGrant`
- `PracticeAttempt`
- `SimulatorSession`
- `SupportTicket`
- `AccessSession`
- `AuditLog`
- `Course`
- `LearningPath`

## Relaciones relevantes

- un dashboard admin se calcula sobre la institucion activa del usuario, no sobre toda la base global;
- un dashboard docente se calcula sobre las matriculas y estudiantes que caen dentro de su alcance docente;
- un dashboard estudiante se calcula sobre sus matriculas activas, su progreso, quizzes, simuladores y notificaciones;
- los reportes de curso se construyen sobre matriculas, progreso, practicas, evaluaciones y simuladores del curso;
- los reportes de estudiante se construyen sobre sus matriculas, avances y actividad trazable.

## Reglas de negocio

1. `ADMIN` ve resumen institucional completo dentro de la institucion activa de su sesion.
2. `TEACHER` no ve datos globales: solo estudiantes, cursos y progreso dentro de sus `TeacherScopeAssignment` vigentes.
3. `STUDENT` solo ve su propio resumen academico.
4. Los reportes de curso y estudiante deben respetar institucion activa y alcance docente.
5. El dashboard docente debe resaltar datos accionables:
   - estudiantes segun alcance;
   - progreso promedio;
   - estudiantes con progreso bajo;
   - practicas pendientes;
   - quizzes reprobados con posible reintento;
   - actividad de simuladores.
6. El dashboard admin debe mostrar operacion institucional:
   - usuarios activos;
   - estudiantes y docentes activos;
   - matriculas activas;
   - rutas;
   - cursos publicados;
   - progreso promedio;
   - sesiones activas;
   - soporte abierto;
   - membresias proximas a vencer.
7. El reporte de estudiante debe permitir al docente seguir progreso real por curso, no solo porcentaje cosmetico.

## Roles involucrados

- `ADMIN`
- `TEACHER`
- `STUDENT`
- `SUPPORT` en fase posterior para vistas operativas especializadas

## Validaciones

- no permitir que un estudiante consulte el reporte de otro estudiante;
- no permitir que un docente consulte curso o estudiante fuera de su alcance;
- no mezclar instituciones fuera de la membresia activa del token;
- no devolver reportes globales sin contexto institucional.

## MVP

- `GET /dashboard/admin`
- `GET /dashboard/teacher`
- `GET /dashboard/student/me`
- `GET /reports/courses/:courseId/summary`
- `GET /reports/students/:studentId/summary`
- calculo institucional basico para admin
- calculo de alcance docente sobre matriculas y progreso
- resumen personal del estudiante
- reportes accionables de curso y estudiante

## Fase posterior

- snapshots historicos de reportes;
- exportacion PDF/CSV;
- comparativos por cohorte, sede y laboratorio;
- vistas operativas para soporte tecnico;
- alertas automáticas por bajo rendimiento o baja actividad.

## Como responde al documento

Este modulo evita un panel generico y lo conecta con el dominio real del LMS tecnico. El admin obtiene lectura institucional; el docente obtiene visibilidad academica accionable según nivel, curso, ruta o alcance; y el estudiante obtiene su propia lectura formativa. Asi el dashboard y los reportes dejan de ser decorativos y pasan a soportar seguimiento individual, evaluacion, simulacion y operacion academica real, que es justamente lo exigido por el pliego.
