# Auditoria de preparacion para Fase 2 - Imagen corporativa oficial

## Objetivo

Dejar identificado el estado real de la identidad visual actual de `NOVOMEDIAlms` antes de aplicar el logo oficial y el manual de imagen corporativa.

Esta auditoria no redefine marca ni inventa una identidad nueva.
Su funcion es ubicar:

- que ya esta aplicado
- que sigue provisional
- que componentes deben tocarse
- que riesgos existen si se aplica la marca oficial sin orden

## Estado actual

### Marca visible

La marca `NOVOMEDIAlms` ya esta visible en:

- `apps/web/app/layout.tsx`
- `apps/web/components/brand-mark.tsx`

El favicon actual ya existe en:

- `apps/web/app/icon.svg`

### Paleta y tokens visuales

La paleta provisional ya esta aplicada en:

- `apps/web/app/globals.css`
- `apps/web/tailwind.config.ts`

Actualmente existen tokens base para:

- `navy`
- `steel`
- `slate`
- `cloud`
- `mist`
- `copper`
- colores de estado

### Shells principales

La marca y el layout principal viven hoy en:

- `apps/web/components/shell.tsx`
- `apps/web/components/portal-shell.tsx`
- `apps/web/components/admin-shell.tsx`

### Pantallas de mayor impacto visual

Las pantallas que primero recibiran la imagen oficial son:

- `apps/web/app/page.tsx`
- `apps/web/app/login/page.tsx`
- todas las vistas que dependen de `PortalShell`

## Lo que ya esta bien para recibir la marca oficial

- el nombre del producto ya esta unificado como `NOVOMEDIAlms`
- login y portada ya tienen estructura estable
- existe un punto unico reusable de marca en `BrandMark`
- el favicon ya esta aislado en un archivo propio
- la paleta ya esta centralizada parcialmente en variables y en tailwind
- los dashboards y navegacion por rol ya existen, por lo que la Fase 2 no tendra que inventar estructura

## Lo que sigue provisional

### 1. Isotipo y logotipo

El logo actual es conceptual y no oficial.

Esto afecta:

- `apps/web/components/brand-mark.tsx`
- `apps/web/app/icon.svg`

Ambos deben reemplazarse por:

- logo principal oficial
- isotipo oficial
- favicon oficial

### 2. Paleta visual

La paleta actual es una propuesta funcional, no una paleta corporativa oficial.

Aunque existe centralizacion parcial, varios componentes usan clases directas como:

- `bg-navy`
- `text-copper`
- `border-cloud`

Esto significa que un cambio fuerte de manual requerira revisar:

- `Shell`
- `PortalShell`
- `AdminShell`
- botones
- tarjetas
- encabezados

### 3. Eslogan visible

El mensaje:

`El ecosistema definitivo de simulacion y E-Learning tecnico`

esta repetido en:

- `apps/web/components/shell.tsx`
- `apps/web/components/portal-shell.tsx`
- `apps/web/components/admin-shell.tsx`

Si el manual o la direccion comercial define otra bajada oficial, habra que sustituirlo en todos esos puntos.

### 4. Duplicacion de identidad

La identidad visual base esta repartida en mas de un shell.

Esto hoy no rompe funcionalidad, pero complica una aplicacion exacta del manual si no se consolida primero.

## Componentes exactos a tocar en Fase 2

### Base global

- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/tailwind.config.ts`
- `apps/web/app/icon.svg`

### Marca reusable

- `apps/web/components/brand-mark.tsx`

### Shells

- `apps/web/components/shell.tsx`
- `apps/web/components/portal-shell.tsx`
- `apps/web/components/admin-shell.tsx`

### Pantallas de entrada

- `apps/web/app/page.tsx`
- `apps/web/app/login/page.tsx`

## Riesgos si la Fase 2 se aplica sin orden

### Riesgo 1 - marca inconsistente

Si se cambia el logo pero no los shells ni el favicon, la plataforma quedara visualmente partida.

### Riesgo 2 - colores oficiales mal distribuidos

Si se cambian solo tokens globales sin revisar clases directas usadas en componentes, la interfaz puede quedar con contrastes rotos o acentos fuera del manual.

### Riesgo 3 - duplicacion de trabajo

Si se toca cada pantalla por separado en vez de tocar `BrandMark`, `Shell` y `PortalShell`, el cambio se vuelve lento y propenso a inconsistencias.

### Riesgo 4 - mezcla entre branding y logica

La Fase 2 debe limitarse a marca y presentacion.
No debe alterar:

- logica academica
- permisos
- flujos
- navegacion funcional
- endpoints

## Orden recomendado de aplicacion cuando llegue el manual

1. reemplazar logo, isotipo y favicon
2. fijar tokens oficiales de color y tipografia
3. actualizar `BrandMark`
4. actualizar `Shell`, `PortalShell` y `AdminShell`
5. aplicar ajuste visual a `page.tsx` y `login/page.tsx`
6. revisar dashboards y componentes base
7. hacer pasada final de consistencia visual

## Conclusiones

`NOVOMEDIAlms` ya tiene una base visual suficientemente estable para recibir la imagen corporativa oficial.

No hace falta rediseñar el frontend desde cero.

Lo correcto sera:

- reemplazar la identidad provisional
- normalizar shells
- aplicar el manual de forma centralizada
- evitar cambios funcionales durante esa fase
