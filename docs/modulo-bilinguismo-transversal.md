# Modulo de bilinguismo transversal backend

## Requisitos del pliego que cubre

- contenidos en espanol e ingles;
- glosario tecnico bilingue;
- acceso bilingue desde etapas tempranas;
- consistencia entre backend y frontend para catalogo, contenido, evaluaciones y recursos.

## Objetivo

Evitar que el frontend tenga que decidir idioma con contratos inconsistentes. El backend debe resolver idioma preferido y fallback a espanol de forma uniforme.

## Entidades involucradas

- `User.preferredLang`
- `LanguageContent`
- entidades con campos `Es/En`
- catalogo academico
- contenido y glosario
- quizzes y evaluaciones

## Reglas MVP

1. El idioma efectivo se resuelve asi:
   - `lang` explicito en query si existe;
   - `preferredLang` del usuario autenticado;
   - fallback a `es`.
2. Si el contenido en ingles no existe, se usa espanol.
3. El backend no elimina los campos base; agrega campos localizados estables para consumo frontend.
4. Las lecturas academicas principales deben devolver contenido localizado consistente.

## MVP

- servicio central `I18nService`
- resolucion de idioma efectivo
- campos localizados en:
  - areas tecnicas
  - cursos
  - modulos
  - lecciones
  - practicas
  - quizzes
  - recursos de contenido
  - glosario

## Fase posterior

- internacionalizacion completa de labels operativos;
- uso transversal de `LanguageContent`;
- traducciones administrativas y plantillas mas complejas.

## Como responde al documento

Este modulo evita un backend bilingue a medias. El frontend recibe contenido ya resuelto por idioma, con fallback consistente y sin tener que reconstruir la logica de localizacion por cada pantalla.
