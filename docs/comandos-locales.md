# Comandos locales

## Preparacion

```bash
cd ~/LMS
cp .env.example .env
npm install
```

## Base de datos con Docker

```bash
cd ~/LMS
docker compose up -d postgres
```

## Prisma

```bash
cd ~/LMS
npm run prisma:generate
npx prisma migrate dev --name init
npm run prisma:seed
```

## Desarrollo

### API

```bash
cd ~/LMS
npm run dev:api
```

### Web

```bash
cd ~/LMS
npm run dev:web
```

## Builds

```bash
cd ~/LMS
npm run build:api
npm run build:web
```

## Nota actual

La migracion SQL inicial ya fue generada en:

`prisma/migrations/20260418212000_init/migration.sql`

Si Docker no esta corriendo, `migrate dev` y `seed` no podran aplicarse todavia sobre PostgreSQL.
