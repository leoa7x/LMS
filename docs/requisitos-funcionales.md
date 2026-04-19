# Requisitos funcionales del LMS

## Alcance de producto

El sistema es un LMS tecnico con simuladores virtuales integrados. No es un gestor de cursos simples.

## Actores

- Administrador general
- Docente
- Estudiante
- Soporte tecnico

## Estructura funcional

La jerarquia funcional base del contenido sera:

`Area tecnica > Curso > Modulo > Leccion > Practica > Evaluacion`

### Justificacion

- El area tecnica agrupa dominios industriales mayores.
- El curso representa una unidad formativa principal.
- El modulo organiza bloques tematicos y de habilidad.
- La leccion concentra contenido teorico y recursos.
- La practica conecta teoria con validacion aplicada.
- La evaluacion mide entrada, avance o cierre.

## Tipos de oferta academica

### Curso estandar

Unidad academica individual reutilizable y asignable.

### Ruta preconfigurada

Conjunto ordenado de cursos y reglas de avance, orientado a un perfil o tema.

### Certificacion externa

Marco de alineacion academica con una entidad externa. No reemplaza cursos ni rutas; los agrupa bajo una meta certificable.

## Requisitos funcionales clave

### Acceso y seguridad

- Login seguro con sesiones web
- Control de acceso por rol
- Soporte para multiples sesiones concurrentes
- Vigencia de acceso por licencia o contrato

### Gestion academica

- Crear y administrar cursos, modulos, lecciones y practicas
- Matricular estudiantes
- Asignar contenidos por nivel, ruta o decision docente
- Permitir re-asignacion de evaluaciones fallidas

### Contenido

- Texto enriquecido
- PDF, e-book, video, imagen y recurso externo controlado
- Vocalizacion opcional por contenido
- Glosario tecnico integrado
- Exportacion PDF de habilidades desarrolladas
- Soporte bilingue

### Evaluacion

- Evaluacion pre-curso
- Evaluacion post-curso
- Quiz previo a modulo
- Control de intentos
- Bloqueo de repeticion sin autorizacion docente

### Progreso

El progreso del estudiante se medira en combinacion de:

- consumo minimo de lecciones
- practicas completadas
- evaluaciones requeridas aprobadas
- sesiones de simulador asociadas

### Soporte y trazabilidad

- Notificaciones basicas
- Envio por e-mail de practicas
- Tickets de soporte
- Auditoria minima
- Historial de accesos
