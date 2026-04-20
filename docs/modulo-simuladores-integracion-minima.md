# Modulo de simuladores integracion minima

## Requisitos del pliego que cubre

- simuladores integrados al portal;
- relacion entre teoria, practica y simulacion;
- trazabilidad del uso del simulador;
- integracion con progreso;
- soporte para material interactivo y relacion con componentes reales;
- preparacion para fallas y eventos de simulacion.

## Problema que corrige

El backend ya tenia catalogo, mapeo y sesiones, pero faltaba una integracion minima operativa entre sesion, contexto academico y trazabilidad de uso.

## MVP

Entra en MVP:

- validacion de sesion de simulador contra matricula y curso;
- contexto de lanzamiento por sesion;
- eventos minimos de simulacion registrados por la plataforma;
- evidencia academica basica al completar simulador.

## Reglas de negocio

1. Una sesion no puede abrirse fuera de una matricula valida del estudiante.
2. El simulador debe estar mapeado a una practica del curso de la matricula.
3. El backend debe poder devolver el puente teoria-practica-simulador desde la sesion.
4. La plataforma debe registrar eventos minimos de uso aunque el motor del simulador sea embebido o adaptado.

## Como responde al documento

Este modulo evita que el simulador quede como un launch URL sin contexto.

La plataforma ya puede validar, contextualizar y trazar el uso minimo del simulador dentro del flujo academico del LMS.
