# MoneyMate Admin Dashboard

MoneyMate is a personal finance admin dashboard scaffold. This phase only sets up the local development foundation:

- React + TypeScript + Vite frontend shell.
- Minimal Go backend with `GET /healthz`.
- PostgreSQL via Docker Compose.
- Placeholder database migration folder.
- Windows PowerShell and Docker-friendly commands.

Business features such as auth, CRUD, holdings calculation, imports, reports, audit logs, and full UI pages are intentionally not implemented yet.

## Prerequisites

Recommended for this phase:

- Docker Desktop
- Node.js 20+ if running the frontend outside Docker
- Go only if running the backend outside Docker

This workspace previously showed `go` and `make` may not be available on PATH, so Docker and PowerShell commands are the primary path.

## Environment Files

Copy the example file before running locally:

```powershell
Copy-Item .env.example .env
```

The example values are local-only placeholders. Do not put production secrets in `.env.example`.

Optional per-app examples are also available:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

## Run Everything With Docker

From the repository root:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

If another PostgreSQL service already uses port `5432`, override the host port:

```powershell
$env:POSTGRES_PORT = "15432"
docker compose up --build
Remove-Item Env:POSTGRES_PORT
```

Or use the PowerShell helper:

```powershell
.\scripts\dev.ps1 -Build
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/healthz`
- PostgreSQL: `localhost:5432`

Stop services:

```powershell
docker compose down
```

Reset local database volume:

```powershell
docker compose down -v
```

## Run Without Docker

Frontend:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Backend, only if Go is installed:

```powershell
cd backend
Copy-Item .env.example .env
go run ./cmd/api
```

When using Docker, rebuild the backend image after backend code changes:

```powershell
docker compose build backend
docker compose up backend
```

## Health Check

```powershell
Invoke-RestMethod http://localhost:8080/healthz
```

Expected response:

```json
{
  "status": "ok",
  "service": "moneymate-backend",
  "environment": "development"
}
```

## Database Migrations

Run migrations with Docker:

```powershell
$env:POSTGRES_PORT = "15432"
docker compose up -d postgres
docker compose run --rm migrate
Remove-Item Env:POSTGRES_PORT
```

## Seed Data

Seed the local owner account after migrations:

```powershell
$env:POSTGRES_PORT = "15432"
docker compose run --rm seed
Remove-Item Env:POSTGRES_PORT
```

Safe local demo credentials from `.env.example`:

```txt
Email: owner@moneymate.local
Password: changeme-local-demo
```

These are local placeholders only. Do not use them in production.

## Current Project Structure

```txt
MoneyMate/
  docker-compose.yml
  .env.example
  Makefile
  scripts/dev.ps1
  backend/
    cmd/api/
    internal/config/
    internal/httpapi/
    db/migrations/
  frontend/
    src/app/
    src/styles/
```

## Next Recommended Phase

Phase 2 should add backend foundation for database connectivity, migration runner, typed response envelope, request logging, and OpenAPI scaffold before implementing auth or business CRUD.
