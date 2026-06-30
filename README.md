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
$backendPath = (Resolve-Path .\backend).Path
docker run --rm -v "${backendPath}:/app" -w /app golang:1.26-alpine go test ./...
```

Frontend build:

```powershell
cd frontend
npm run build
```

Compose validation:

```powershell
docker compose config
```

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
- CSV/XLSX import preview and confirm flow for holdings, orders, cash, asset summary rows, manual prices, import job rows, and import audit log.

## Known Limitations

- No external market data integration.
- Manual/mock prices only; dashboard labels data as not real-time.
- Cash balances are manually managed; orders do not automatically move cash yet.
- Frontend forms are intentionally basic and do not yet expose every edit/delete backend action.
- Confirmed imports do not fetch market data. Imported prices remain manual, and holdings snapshots still follow the existing recalculation workflow.
- No production deployment hardening, HTTPS termination, or managed secret workflow yet.

## Roadmap

Recommended next phase:

1. Expand frontend edit/delete flows for transactions, instruments, and cash accounts.
2. Add OpenAPI documentation.
3. Add frontend component tests and Playwright smoke tests.
4. Add report/export endpoints.
5. Consider automatic holdings recalculation after confirmed imports.
