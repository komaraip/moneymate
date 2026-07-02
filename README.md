# MoneyMate Admin Dashboard

MoneyMate is a local fullstack MVP for tracking personal finance data, portfolio holdings, manual prices, transactions, cash accounts, and dashboard summaries.

Current stack:

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query.
- Backend: Go, chi router, slog, PostgreSQL via pgx.
- Local services: Docker Compose with PostgreSQL, backend API, frontend Vite server.

Financial safety note: all prices are manual/mock in this MVP. The app does not provide buy/sell recommendations and does not claim real-time market data.

## Prerequisites

- Docker Desktop.
- Node.js 20+ only if running frontend outside Docker.
- Go only if running backend outside Docker.

This workspace previously showed `go` and `make` may not be available on PATH, so Docker and PowerShell commands are the primary path.

## Environment

Create local env file:

```powershell
Copy-Item .env.example .env
```

Safe local demo credentials:

```txt
Email: owner@moneymate.local
Password: changeme-local-demo
```

These are local placeholders only. Do not use them in production.

## First Run With Docker

If port `5432` is already used by another PostgreSQL service, use `15432`:

```powershell
$env:POSTGRES_PORT = "15432"
```

Build services, run migrations, seed data, then start the app:

```powershell
docker compose build backend migrate seed frontend
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm seed
docker compose up -d backend frontend
```

Open:

```txt
Frontend: http://localhost:5173
Backend health: http://localhost:8080/healthz
```

After login, click `Recalculate` on Portfolio or call:

```powershell
$login = Invoke-RestMethod http://localhost:8080/api/v1/auth/login -Method Post -ContentType "application/json" -Body '{"email":"owner@moneymate.local","password":"changeme-local-demo"}' -SessionVariable session
$headers = @{ Authorization = "Bearer $($login.data.access_token)" }
Invoke-RestMethod "http://localhost:8080/api/v1/holdings/recalculate?date=2026-06-30" -Method Post -Headers $headers
```

Import CSV/XLSX from the UI:

```txt
http://localhost:5173/import-data
```

The import parser recognizes spreadsheet-like sections named `INVESTMENT`, `INVESMENT`, `PORTFOLIO`, `HOLDINGS`, `ORDERS`, `TRANSACTIONS`, `ASSET/VALUE`, and `CASH`.

PowerShell API smoke path using `curl.exe` for multipart upload:

```powershell
$login = Invoke-RestMethod http://localhost:8080/api/v1/auth/login -Method Post -ContentType "application/json" -Body '{"email":"owner@moneymate.local","password":"changeme-local-demo"}' -SessionVariable session
$token = $login.data.access_token
$preview = curl.exe -s -X POST "http://localhost:8080/api/v1/imports/upload" -H "Authorization: Bearer $token" -F "file=@.\sample-assets.csv" | ConvertFrom-Json
$jobId = $preview.data.job_id
Invoke-RestMethod "http://localhost:8080/api/v1/imports/jobs/$jobId/confirm" -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body "{}"
```

Stop services:

```powershell
docker compose down
Remove-Item Env:POSTGRES_PORT -ErrorAction SilentlyContinue
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

Migrate and seed without Docker, only if Go and PostgreSQL are available:

```powershell
cd backend
go run ./cmd/migrate
go run ./cmd/seed
```

## Validation Commands

Backend tests through Docker:

```powershell
$repoPath = (Resolve-Path .).Path
docker run --rm -v "${repoPath}:/workspace" -w /workspace/backend golang:1.26-alpine go test ./...
```

Backend API integration tests through Docker:

```powershell
docker compose up -d postgres
$postgresPort = (docker compose port postgres 5432).Split(":")[-1]
$repoPath = (Resolve-Path .).Path
docker run --rm `
  -e MONEYMATE_TEST_DATABASE_URL="postgres://moneymate:moneymate@host.docker.internal:$postgresPort/moneymate?sslmode=disable" `
  -v "${repoPath}:/workspace" `
  -w /workspace/backend `
  golang:1.26-alpine go test -tags=integration ./internal/httpapi
```

The integration suite uses `httptest` against the actual chi router, creates a temporary PostgreSQL schema, runs migrations into that schema, truncates between tests, and drops the schema after the run. It covers auth, RBAC, write flows, manual prices, holdings recalculation, import preview/confirm, duplicate ticker handling, dashboard totals after import, and audit log creation.

If Go is available locally, the same integration suite can be run with:

```powershell
$env:MONEYMATE_TEST_DATABASE_URL = "postgres://moneymate:moneymate@localhost:$postgresPort/moneymate?sslmode=disable"
npm run backend:test:integration
```

Frontend build:

```powershell
cd frontend
npm run build
```

Frontend component tests:

```powershell
cd frontend
npm run test:run
```

Compose validation:

```powershell
docker compose config
```

## API Documentation

The MVP OpenAPI 3.1 contract is available at:

```txt
docs/api/openapi.yaml
```

It documents the implemented local REST API, response envelope format, JWT access token behavior, refresh cookie behavior, and current MVP limitations around manual/mock price data.

Install root API contract tooling:

```powershell
npm install
```

Lint the OpenAPI contract:

```powershell
npx --yes @redocly/cli lint docs/api/openapi.yaml
```

Or use the repeatable root script after `npm install`:

```powershell
npm run api:lint
```

Regenerate frontend API types after editing `docs/api/openapi.yaml`:

```powershell
npm run api:types
```

Generated declarations are committed at:

```txt
frontend/src/lib/generated/openapi.d.ts
```

Check generated type drift before committing:

```powershell
npm run api:types:check
```

Backend tests include a chi router drift check that compares documented OpenAPI paths and methods against the actual registered routes.

## Playwright Smoke Tests

The Playwright smoke suite expects the local Docker services to be running with migrated and seeded data.

Install root Playwright tooling and browsers:

```powershell
npm install
npx playwright install
```

Start local services:

```powershell
docker compose build backend migrate seed frontend
docker compose up -d postgres
docker compose run --rm migrate
docker compose run --rm seed
docker compose up -d backend frontend
```

Run the smoke suite:

```powershell
npm run e2e
```

Stop services after testing:

```powershell
docker compose down
```

The smoke suite logs in with the seeded owner account, recalculates holdings for `2026-06-30`, checks dashboard/portfolio pages, opens create/edit/delete modal paths for transactions, instruments, and cash accounts, and previews a small CSV import fixture without confirming the import. Cash adjustment is not covered because no separate adjustment UI exists in the current MVP.

## CI Validation

GitHub Actions runs:

- Backend tests with Go 1.26 in Docker.
- Backend API integration tests with PostgreSQL 16 and Go 1.26 in Docker.
- Frontend dependency install, component tests, and `npm run build`.
- `docker compose config`.
- Redocly OpenAPI lint.
- Generated OpenAPI type drift check.
- Playwright smoke tests against Docker Compose services.

## Implemented MVP Foundation

- Auth login, refresh, logout, and `/me`.
- Owner seed account with Argon2id password hash.
- JWT access token and HTTP-only refresh cookie session.
- RBAC middleware foundation.
- PostgreSQL migrations for users, sessions, instruments, categories, transactions, cash accounts, prices, holdings, imports, and audit logs.
- Instruments, asset categories, cash accounts, transactions, manual prices, holdings, dashboard, and audit APIs.
- Weighted-average holdings calculation in backend.
- Dashboard overview, asset allocation, performance, and alerts APIs.
- React protected dashboard shell and MVP screens.
- CSV/XLSX import preview and confirm flow for holdings, orders, cash, asset summary rows, manual prices, import job rows, automatic holdings recalculation, and import audit log.
- OpenAPI 3.1 contract for implemented MVP endpoints.
- Generated frontend API declarations from the OpenAPI contract.
- Frontend component tests and Playwright MVP smoke tests.
- Backend API integration tests for auth, RBAC, write flows, import confirmation, holdings/dashboard consistency, and audit logs.
- CI checks for backend tests, backend API integration tests, frontend tests/build, Docker Compose config, OpenAPI lint, generated type drift, and E2E smoke coverage.

## Known Limitations

- No external market data integration.
- Manual/mock prices only; dashboard labels data as not real-time.
- Cash balances are manually managed; orders do not automatically move cash yet.
- `cash_adjustments` exists in the schema, but no cash adjustment API route is implemented yet.
- Frontend forms are intentionally basic and do not yet expose every edit/delete backend action.
- Confirmed imports do not fetch market data. Imported prices remain manual; holdings snapshots are recalculated in the same database transaction as import confirmation so dashboard views use imported data immediately.
- No production deployment hardening, HTTPS termination, or managed secret workflow yet.

## Roadmap

Recommended next phase:

1. Add report/export endpoints.
2. Consider a typed API client wrapper generated from the OpenAPI paths.
3. Tighten Redocly warning cleanup for quieter contract validation.
4. Add deeper transaction/cash adjustment workflows if product scope requires.
