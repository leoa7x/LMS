# Modulo de cobertura tecnica industrial

## Estado de esta decision

Este documento cierra el MVP para declarar cobertura tecnica especializada dentro del catalogo academico y de simulacion.

## Requisitos del pliego que cubre

- soporte para areas tecnicas industriales;
- capacidad de organizar contenidos especializados por tecnologia;
- soporte explicito para sistemas de automatizacion como Allen Bradley y Siemens;
- preparacion para cursos, practicas y simuladores con enfoque tecnico real.

## Decision de modelo

No se fija un catalogo duro por fabricante en toda la base.

Se implementa primero una capa flexible de metadatos de cobertura en:

- `Course`
- `Simulator`

Campos MVP:

- `vendorCoverageTags`
- `technologyCoverageTags`

Ejemplos validos:

- `Allen Bradley`
- `Siemens`
- `PLC`
- `SCADA`
- `CompactLogix`
- `HMI`

## Reglas de negocio MVP

- un curso puede cubrir varios fabricantes y varias tecnologias;
- un simulador puede declarar fabricantes o tecnologias soportadas;
- esta metadata debe ser visible para filtros, catalogo y trazabilidad academica;
- no reemplaza el area tecnica ni la jerarquia academica.

## Justificacion

El pliego exige cobertura tecnica especializada, no solo categorias amplias.

Si el modelo no puede expresar fabricantes o plataformas concretas, no hay forma consistente de demostrar que el LMS cubre requerimientos como Allen Bradley o Siemens.

## Que entra en MVP

- arrays de cobertura en cursos y simuladores;
- soporte de creacion y lectura desde backend;
- base para filtrado y visibilidad futura.

## Que queda para fase posterior

- catalogo normalizado de fabricantes y plataformas;
- taxonomia jerarquica avanzada;
- filtros UI mas ricos;
- cobertura por modulo, leccion y practica.
