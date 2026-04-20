# Despliegue local del LMS

## Objetivo

Levantar `PostgreSQL`, `API` y `frontend web` del LMS con Docker Compose para validar el producto como sistema integrado, no solo por procesos separados.

## Requisitos

- Docker Desktop operativo
- archivo `.env` presente en la raiz

## Variables base

El archivo `.env.example` ya deja listos los valores minimos:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `APP_PORT`
- `WEB_PORT`
- `WEB_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Levantar solo base de datos

```bash
cd ~/LMS
docker compose up -d postgres
```

## Levantar stack completo

```bash
cd ~/LMS
docker compose up -d --build
```

## Aplicar Prisma

Con el stack arriba, ejecutar en otra terminal:

```bash
cd ~/LMS
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

## URLs locales

- web: `http://localhost:3000`
- api: `http://localhost:4000/api/v1`
- health api: `http://localhost:4000/api/v1/health`

## Apagar stack

```bash
cd ~/LMS
docker compose down
```

## Nota operativa

El `docker-compose.yml` ya deja preparados:

- `postgres`
- `api`
- `web`

La API usa `postgres` como host interno y el frontend queda apuntando a `http://localhost:4000/api/v1` para que el navegador del usuario resuelva correctamente el backend.
