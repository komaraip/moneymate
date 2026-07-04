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

Reports and CSV export:

```txt
http://localhost:5173/reports
```

PowerShell API examples:

```powershell
$login = Invoke-RestMethod http://localhost:8080/api/v1/auth/login -Method Post -ContentType "application/json" -Body '{"email":"owner@moneymate.local","password":"changeme-local-demo"}' -SessionVariable session
$headers = @{ Authorization = "Bearer $($login.data.access_token)" }
Invoke-RestMethod "http://localhost:8080/api/v1/reports/monthly-summary?month=2026-06" -Headers $headers
Invoke-RestMethod "http://localhost:8080/api/v1/reports/portfolio-performance?from=2026-06-01&to=2026-06-30" -Headers $headers
Invoke-WebRequest "http://localhost:8080/api/v1/reports/export.csv" -Headers $headers -OutFile ".\moneymate-portfolio-export.csv"
```

Cash adjustment ledger:

```powershell
$cashAccountId = (Invoke-RestMethod "http://localhost:8080/api/v1/cash-accounts" -Headers $headers).data[0].id
$adjustment = @{
  adjustment_date = "2026-06-15"
  type = "deposit"
  amount = 50000
  note = "Top up cash"
} | ConvertTo-Json
Invoke-RestMethod "http://localhost:8080/api/v1/cash-accounts/$cashAccountId/adjust" -Method Post -Headers $headers -ContentType "application/json" -Body $adjustment
Invoke-RestMethod "http://localhost:8080/api/v1/cash-accounts/$cashAccountId/adjustments" -Headers $headers
```

Adjustment request amounts must be positive. `withdrawal` and `transfer_out` are stored as negative ledger movements. Cash balances are not allowed to become negative.

CSV export columns are stable for the MVP:

```txt
section,generated_at,record_id,snapshot_date,transaction_date,price_date,account_name,instrument_type,ticker,name,transaction_type,units,price,average_price_idr,current_price_idr,gross_value,fees,tax,net_value,balance,total_cost_idr,current_value_idr,profit_loss_idr,profit_loss_percent,currency,original_currency,fx_rate_to_idr,source,is_realtime,warnings,note
```

## Database Backup And Restore

The report CSV export is for user analysis in Excel or Google Sheets. It is not a recovery backup and does not contain every database table.

The database backup workflow uses PostgreSQL `pg_dump` custom format through Docker Compose. It is intended for local recovery or migration of the full MVP database, including users, sessions, instruments, asset categories, transactions, cash accounts, cash adjustment ledger rows, price snapshots, holdings snapshots, import jobs/import rows, and audit logs.

Backup files are written to `backups/`, which is ignored by Git:

```powershell
.\scripts\backup-db.ps1
```

Or with the root npm shortcut:

```powershell
npm run db:backup
```

Each backup creates:

```txt
backups/moneymate-moneymate-YYYYMMDD-HHMMSS.dump
backups/moneymate-moneymate-YYYYMMDD-HHMMSS.metadata.md
```

The metadata file records the generated timestamp, local environment name, database name, Docker Compose service, backup file name, and restore command. It intentionally does not store passwords, tokens, cookies, or production secrets.

### Local Backup Status

The backup status workflow is read-only. It inspects matched MoneyMate backup files inside `backups/` and reports backup count, total dump size, newest/oldest timestamps, old backups, largest files, and metadata coverage.

Inspect backup status:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backup-status.ps1 -OlderThanDays 30 -LargestCount 5
```

Or with the root npm shortcut:

```powershell
npm run db:backup:status
```

Use the direct PowerShell command when changing parameters such as `-OlderThanDays`, `-LargestCount`, or `-IncludeMetadataDetails`.

Show missing/orphan metadata details:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backup-status.ps1 -OlderThanDays 30 -LargestCount 5 -IncludeMetadataDetails
```

The status script never deletes or uploads files. It only matches files named like `moneymate-<database>-YYYYMMDD-HHMMSS.dump` and refuses to inspect paths outside the repository `backups/` folder.

### Local Restore Drill

The restore drill validates a local backup file and, only when explicitly confirmed, restores it into a disposable database named `moneymate_restore_drill_*`. It never restores into the active app database by default.

Validate a backup file without creating a database:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/restore-backup-drill.ps1 -BackupFile ".\backups\moneymate-moneymate-YYYYMMDD-HHMMSS.dump"
```

Or with npm by setting `BACKUP_FILE` first:

```powershell
$env:BACKUP_FILE = ".\backups\moneymate-moneymate-YYYYMMDD-HHMMSS.dump"
npm run db:backup:restore-drill
Remove-Item Env:BACKUP_FILE
```

Run a disposable restore drill:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/restore-backup-drill.ps1 -BackupFile ".\backups\moneymate-moneymate-YYYYMMDD-HHMMSS.dump" -RunRestore -ConfirmRestoreDrill RESTORE_LOCAL_BACKUP_DRILL
```

The drill refuses backup files outside `backups/`, refuses backup names outside `moneymate-<database>-YYYYMMDD-HHMMSS.dump`, rejects dangerous database names such as `moneymate` or `postgres`, and drops the disposable drill database when the drill completes. Use `-KeepDrillDatabase` only when you intentionally want to inspect the restored drill database afterward.

### Local Backup Retention

Backups are local-only and ignored by Git. The cleanup workflow is dry-run by default and only matches MoneyMate backup files named like `moneymate-<database>-YYYYMMDD-HHMMSS.dump` plus matching `.metadata.md` files inside `backups/`.

Recommended local policy: keep at least the newest 10 backups and delete older backups after 30 days.

Preview cleanup without deleting files:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/cleanup-backups.ps1 -KeepNewest 10 -OlderThanDays 30
```

Or with the root npm shortcut:

```powershell
npm run db:backup:cleanup
```

Use the direct PowerShell command when changing retention parameters.

Apply cleanup explicitly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/cleanup-backups.ps1 -KeepNewest 10 -OlderThanDays 30 -Apply -ConfirmCleanup DELETE_LOCAL_BACKUPS
```

The cleanup script:

- never deletes outside the repository `backups/` folder
- keeps the newest `-KeepNewest` matched dumps even if they are older than `-OlderThanDays`
- deletes matching metadata only when its dump is deleted
- ignores non-MoneyMate files and unrelated dump names
- prints the exact files before deleting anything

Orphan metadata files are preserved by default. To include old orphan metadata in a cleanup, pass `-IncludeOrphanMetadata`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/cleanup-backups.ps1 -KeepNewest 10 -OlderThanDays 30 -IncludeOrphanMetadata
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/cleanup-backups.ps1 -KeepNewest 10 -OlderThanDays 30 -IncludeOrphanMetadata -Apply -ConfirmCleanup DELETE_LOCAL_BACKUPS
```

Restore is intentionally explicit because it can overwrite local development data. Stop app services first so only PostgreSQL is using the database:

```powershell
docker compose stop backend frontend
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile ".\backups\moneymate-moneymate-YYYYMMDD-HHMMSS.dump" -ConfirmRestore RESTORE_LOCAL_DATABASE
```

Use the direct PowerShell command for restore operations. On Windows, npm can treat forwarded `-BackupFile` and `-ConfirmRestore` values as npm options instead of PowerShell parameters.

To validate restore without overwriting the default local database, restore into a separate local database name:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile ".\backups\moneymate-moneymate-YYYYMMDD-HHMMSS.dump" -DatabaseName moneymate_restore_smoke -ConfirmRestore RESTORE_LOCAL_DATABASE
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

Backup and restore smoke check:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/backup-db.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile ".\backups\moneymate-moneymate-YYYYMMDD-HHMMSS.dump" -DatabaseName moneymate_restore_smoke -ConfirmRestore RESTORE_LOCAL_DATABASE
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

The smoke suite logs in with the seeded owner account, recalculates holdings for `2026-06-30`, checks dashboard/portfolio/reports pages, opens create/edit/delete modal paths for transactions, instruments, and cash accounts, opens the cash adjustment/history UI without mutating data, previews a small CSV import fixture without confirming the import, and verifies CSV report download starts.

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
- Cash adjustment ledger with transactional balance updates and adjustment history.
- Weighted-average holdings calculation in backend.
- Dashboard overview, asset allocation, performance, and alerts APIs.
- Read-only report APIs for monthly summary, simple portfolio performance, and CSV export.
- React protected dashboard shell and MVP screens.
- CSV/XLSX import preview and confirm flow for holdings, orders, cash, asset summary rows, manual prices, import job rows, automatic holdings recalculation, and import audit log.
- OpenAPI 3.1 contract for implemented MVP endpoints.
- Generated frontend API declarations from the OpenAPI contract.
- Frontend component tests and Playwright MVP smoke tests.
- Backend API integration tests for auth, RBAC, write flows, import confirmation, holdings/dashboard consistency, and audit logs.
- Backend API integration tests for report endpoints, CSV export, report warnings, and auth protection.
- CI checks for backend tests, backend API integration tests, frontend tests/build, Docker Compose config, OpenAPI lint, generated type drift, and E2E smoke coverage.

## Known Limitations

- No external market data integration.
- Manual/mock prices only; dashboard labels data as not real-time.
- Cash balances are manually managed; orders do not automatically move cash yet.
- Cash adjustment ledger records manual balance movements; it does not pair transfers between accounts yet.
- Frontend forms are intentionally basic and do not yet expose every edit/delete backend action.
- Confirmed imports do not fetch market data. Imported prices remain manual; holdings snapshots are recalculated in the same database transaction as import confirmation so dashboard views use imported data immediately.
- Reports use backend holdings snapshots for portfolio values, current active cash balances for cash, and cash adjustment ledger rows for period cash movement. Beginning net worth, complete opening cash history, realized P/L, FIFO, TWR, and MWR are not invented when the current data model cannot calculate them accurately. See `docs/realized_pl_methodology_note.md`.
- No production deployment hardening, HTTPS termination, or managed secret workflow yet.

## Roadmap

Recommended next phase:

1. Consider a typed API client wrapper generated from the OpenAPI paths.
2. Tighten Redocly warning cleanup for quieter contract validation.
3. Add paired transfer workflow only after transfer modeling is explicit.
4. Add advanced realized P/L or return methodology only after the product decision is explicit.
