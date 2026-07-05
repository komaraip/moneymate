# MoneyMate Personal Finance

MoneyMate is a personal finance web application for individual users. Current focus:

- income, expense, transfer, and cashflow
- accounts/wallets and cash balances
- portfolio/net worth with manual/mock pricing
- monthly budgets
- savings goals
- personal reports
- user metadata admin without exposing private financial data of other users

Portfolio prices and values in this MVP are manual/mock, not real-time. The application does not provide buy/sell recommendations.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query.
- Backend: Go, chi router, slog, PostgreSQL via pgx.
- Database: PostgreSQL.

## Environment

Create a local `.env` file from the example:

```powershell
Copy-Item .env.example .env
```

## Running Locally

This repository includes the core application source. The backend, database, and frontend all run on Docker Compose for local development.

Start all services (Backend, Database, Frontend):

```powershell
docker compose up -d
```

Open:

```txt
Frontend: http://localhost:5173
Backend health: http://localhost:8080/healthz
```

## Local Build

Frontend:

```powershell
cd frontend
npx tsc --noEmit
npx vite build
```

Backend:

```powershell
cd backend
go build ./...
```

## Main Routes

```txt
/                       Summary
/transactions           Transactions
/accounts               Accounts & Wallets
/budgets                Budgets
/savings-goals          Savings Goals
/reports                Reports
/assets/portfolio       Portfolio
/assets/instruments     Instruments
/imports                Data Imports
/admin                  Admin Dashboard
/admin/users            Users
/admin/audit-log        Audit Logs
/settings               Settings
```

Old routes such as `/orders`, `/cash`, `/portfolio`, `/instruments`, `/import-data`, and `/audit-log` still redirect to the new routes for local compatibility.

## Product Notes

- Final roles are only `admin` and `user`.
- User-owned financial data must be user-scoped.
- Admins only view user metadata and audit logs. Admins do not read transactions, cash, portfolios, budgets, or savings goals of other users by default.
- Realized P/L, FIFO, TWR, MWR, tax-lot accounting, real market data, and production workflows are not included in the current scope.

## API

The API contract is located at:

```txt
docs/api/openapi.yaml
```

Generated frontend types are currently saved at:

```txt
frontend/src/lib/generated/openapi.d.ts
```
