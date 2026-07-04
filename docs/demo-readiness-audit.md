# MoneyMate Demo Readiness Audit

Generated: 2026-07-04

## Scope

This audit reviews the current MoneyMate local MVP after the backup, restore, import, cash ledger, reports, OpenAPI, and test coverage phases.

The audit is intentionally demo-focused. It prioritizes visible broken flows, local safety, route completeness, validation reliability, and documentation clarity over production hardening.

## Current State Summary

- Project structure is conventional and readable: `backend/`, `frontend/`, `docs/`, `e2e/`, `scripts/`, and root validation/tooling files.
- Backend is a Go 1.26 service using chi, PostgreSQL, migrations, JWT access tokens, refresh cookies, RBAC middleware, audit logging, imports, reports, holdings, cash ledger, and local backup scripts.
- Frontend is React + TypeScript + Vite with TanStack Query, protected routes, MVP pages, component tests, generated OpenAPI types, and Playwright smoke tests.
- Local backup workflow now includes create, status, cleanup, restore, and disposable restore drill scripts.
- Market data is consistently labelled as manual/mock and not real-time.

## Validation Snapshot

Commands run during this audit:

```powershell
npm --prefix frontend run build
npm run frontend:test
npm run api:lint
npm run api:types:check
docker compose config
docker compose run --rm -v "${repoPath}:/workspace" -w /workspace/backend backend go test ./...
docker compose run --rm -v "${repoPath}:/workspace" -w /workspace/backend backend go test -tags=integration ./internal/httpapi
```

Results:

- Frontend build passed.
- Frontend component tests passed: 2 files, 13 tests.
- Backend unit tests passed through Docker Compose.
- Backend integration tests passed through Docker Compose.
- OpenAPI lint passed with 89 existing warnings about documentation style: missing license, localhost server URL, missing tag descriptions, missing operation IDs, and missing some 4XX response entries.
- OpenAPI generated types check passed.
- Docker Compose config passed.
- Local `go` is not on PATH, so backend validation currently relies on Docker.

## Findings

### P0 - Blocks Demo Or Causes Broken Core Flow

1. **Visible placeholder routes are still exposed in the main sidebar**
   - Evidence: `frontend/src/app/router.tsx` routes `asset-allocation`, `insights`, and `settings` to `PlaceholderPage`.
   - Evidence: `frontend/src/app/layouts/DashboardLayout.tsx` exposes those links in the sidebar.
   - Demo impact: clicking visible navigation items opens unfinished pages, which violates the demo-ready target of no obvious dummy UI or broken routes.
   - Recommended fix: either replace these with minimal real pages using existing data or remove them from visible navigation until implemented.

### P1 - Important Polish Or Reliability Issue

1. **Mobile navigation button is visible but does not open navigation**
   - Evidence: `DashboardLayout` renders a `Buka navigasi` button for small screens, but no state or drawer behavior is wired.
   - Demo impact: desktop demo is fine, but mobile/tablet responsive navigation is incomplete.
   - Recommended fix: add a simple mobile sidebar drawer or hide the button and expose a compact top navigation.

2. **Navigation labels are mixed English and Indonesian**
   - Evidence: labels include `Overview`, `Portfolio`, `Orders`, `Cash`, `Instruments`, `Reports`, `Import Data`, and `Audit Log`, while page copy is mostly Indonesian.
   - Demo impact: not functionally broken, but the app feels less polished for the Indonesian UI requirement.
   - Recommended fix: localize sidebar labels consistently.

3. **OpenAPI lint is valid but noisy**
   - Evidence: Redocly lint passes with 89 warnings.
   - Demo impact: not user-visible, but validation output is harder to scan.
   - Recommended fix: add license, tag descriptions, operation IDs, and common 4XX response documentation in a docs-only pass.

4. **E2E smoke tests assume default local owner credentials**
   - Evidence: `e2e/moneymate-smoke.spec.ts` uses `owner@moneymate.local` and `changeme-local-demo`.
   - Demo impact: if a developer's ignored `.env` overrides seed credentials, local E2E can fail even though CI uses defaults.
   - Recommended fix: read credentials from environment variables with default demo placeholders.

5. **Runtime setup can depend on ignored local `.env` values**
   - Evidence: Docker Compose reads `${SEED_OWNER_EMAIL}`, `${SEED_OWNER_PASSWORD}`, ports, and secrets from environment or `.env`.
   - Demo impact: local state may drift from README demo instructions.
   - Recommended fix: document a clean demo reset path using `.env.example` values and `docker compose down -v` only when explicitly acceptable.

### P2 - Later Hardening Or Nice-To-Have

1. **Realized P/L is intentionally not implemented**
   - Evidence: `docs/realized_pl_methodology_note.md`.
   - Demo impact: acceptable if clearly stated.

2. **Auth uses localStorage for access token**
   - Evidence: `frontend/src/features/auth/AuthProvider.tsx`.
   - Demo impact: acceptable for local MVP; production should revisit token storage and CSRF posture.

3. **Report calculations avoid TWR/MWR/FIFO claims**
   - Evidence: reports backend and docs clearly label simple portfolio summaries.
   - Demo impact: acceptable and safer for MVP.

4. **Backup scripts are local-only**
   - Evidence: scripts under `scripts/` are Docker/PowerShell/local filesystem based.
   - Demo impact: acceptable; no cloud backup integration should be added for this roadmap.

## Core Flow Coverage

- Auth: login, refresh, logout, `me`, protected API routes, RBAC middleware, and integration coverage exist.
- Dashboard: overview, allocation, performance, alerts, and manual/mock data disclaimers exist.
- Holdings: recalculation and list endpoints exist with unit and integration coverage.
- Transactions: create/edit/delete UI and API exist with validation and audit invalidation.
- Instruments: create/edit/deactivate UI and API exist with validation and audit invalidation.
- Cash accounts: create/edit/deactivate, adjustment ledger, history UI, audit, and report movement integration exist.
- Imports: CSV/XLSX preview and confirm flow exist; confirmed imports recalculate holdings.
- Reports: monthly, performance, CSV export, warnings, and frontend page exist.
- Audit logs: backend and filterable frontend page exist.
- Backup safety: backup, restore, status, cleanup, and restore drill scripts exist.

## Recommended Next Fix Order

1. Remove or replace visible placeholder navigation/routes.
2. Make mobile navigation functional.
3. Localize sidebar labels and top-level page labels consistently.
4. Run Playwright smoke against local services after the P0 route cleanup.
5. Reduce OpenAPI lint warning noise in a later docs-only pass.

## Demo Readiness Assessment

Current status: **not fully demo-ready yet**.

Exact blocker: visible placeholder routes in the primary navigation (`Asset Allocation`, `Insights`, `Settings`) still open unfinished pages.

Once placeholder routes are removed or completed and smoke tests pass against local services, the application should be close to demo-ready for the current MVP scope.
