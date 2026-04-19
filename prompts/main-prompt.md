# Prompt principal

Quiero que actues como Software Architect + Lead Full Stack Engineer y me ayudes a disenar e implementar un LMS (Learning Management System) profesional, modular y escalable, basado estrictamente en el alcance minimo de un proyecto de e-learning tecnico con simuladores virtuales practicos.

## Importante

Este proyecto NO es un LMS generico de cursos simples. Debe responder al alcance minimo de una plataforma de ensenanza tecnica con simuladores virtuales integrados, gestion academica, seguimiento individual de estudiantes, evaluaciones y contenidos especializados por areas tecnicas e industriales.

## Contexto de interpretacion del documento

La estructura base del LMS si se puede inferir del documento de alcance, aunque no este expresada como un diagrama de software formal.

Debes tomar como base que:

- hay dos tipos principales de usuario: profesor y estudiante
- el acceso ocurre desde un portal web unico
- el contenido se organiza por areas tecnicas, cursos, modulos y practicas
- cada modulo debe mezclar teoria, material didactico y practica/simulacion
- debe existir seguimiento del progreso por estudiante
- debe haber evaluaciones pre-curso y post-curso
- el profesor debe poder asignar contenidos, crear cuestionarios y reasignar pruebas
- debe haber glosario, exportacion o impresion PDF y acceso bilingue
- los simuladores forman parte del flujo de aprendizaje, no un sistema separado
- ademas existen cursos preconfigurados y rutas tematicas completas

## Direccion de trabajo

- Primero disenar
- Luego implementar
- No improvisar
- No construir una demo escolar
- Construir una base real, profesional y escalable

## Fases

- Fase 0: analisis, arquitectura, arbol del proyecto y modelo de datos
- Fase 1: bootstrap del repositorio, backend base, frontend base, Docker, base de datos y auth inicial
- Fase 2: usuarios, roles, instituciones, licenciamiento y matricula
- Fase 3: cursos, rutas preconfiguradas, modulos, lecciones, contenidos y glosario
- Fase 4: quizzes, evaluaciones pre y post y re-asignacion de pruebas
- Fase 5: progreso individual, dashboards, reportes y trazabilidad
- Fase 6: integracion del modulo de simuladores virtuales
- Fase 7: internacionalizacion, endurecimiento, documentacion y despliegue
