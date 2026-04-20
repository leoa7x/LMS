# Modulo de visibilidad por nivel y alcance academico

## Requisitos del pliego que cubre

- el profesor administra que contenidos puede ver cada estudiante segun su nivel;
- seguimiento individual por estudiante;
- rutas formativas y acceso segun nivel;
- acceso de estudiantes al contenido correcto dentro del mismo portal;
- integracion coherente entre cursos, modulos, practicas, quizzes y simuladores.

## Objetivo

Hacer efectiva la visibilidad academica. El modelo ya existe; lo que faltaba era usarlo de forma transversal en los endpoints del catalogo y contenido.

## Entidades involucradas

- `StudentAcademicProfile`
- `StudentVisibilityAssignment`
- `TeacherScopeAssignment`
- `StudentEnrollment`
- `StudentLearningPathAssignment`
- `Course`
- `Module`
- `Lesson`
- `Practice`
- `Quiz`
- `Simulator`

## Reglas MVP

1. `ADMIN` y `SUPPORT` pueden consultar el catalogo completo.
2. `TEACHER` solo puede ver cursos y contenido dentro de su alcance activo.
3. `STUDENT` solo puede ver cursos y contenido dentro de:
   - sus matriculas activas
   - sus rutas activas
   - sus reglas de visibilidad efectivas
4. La visibilidad se resuelve a nivel de curso y desde ahi se filtran modulo, leccion, practica, quiz y simulador.
5. Un alcance `LEVEL` para docente debe resolver cursos a partir de estudiantes matriculados en ese nivel.
6. Una regla `LEARNING_PATH` para estudiante debe expandirse a los cursos de esa ruta.

## MVP

- servicio central `AcademicVisibilityService`
- resolucion de `accessibleCourseIds`
- filtrado aplicado en:
  - cursos
  - modulos
  - lecciones
  - practicas
  - quizzes
  - simuladores

## Fase posterior

- enforcement mas fino a nivel de modulo individual;
- visibilidad por segmento;
- validaciones de escritura sobre contenido por alcance docente;
- politicas avanzadas por cohorte.

## Como responde al documento

Este modulo hace real la administracion por nivel. El docente deja de ver un universo global y el estudiante deja de recibir catalogo plano. El acceso al contenido academico pasa a respetar alcance, ruta y nivel.
