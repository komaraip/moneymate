# MoneyMate Personal Finance Scope

Generated: 2026-07-05

## Product Direction

MoneyMate is moving from a local portfolio/admin dashboard MVP into a multi-user personal finance web app for individual users. The product should help each user manage daily money flows, accounts or wallets, categories, budgets, savings goals, reports, and personal net worth.

The new product direction prioritizes privacy-safe individual finance workflows over company finance, portfolio-only workflows, or advanced investment analytics.

## Final Roles

MoneyMate will use only two final roles:

- `admin`: manages platform/local user administration, service health, and audit visibility.
- `user`: manages their own personal finance data.

Deprecated roles:

- `owner`
- `viewer`

Migration must be non-destructive:

- Existing `owner` users should be mapped to `admin`.
- Existing `viewer` users should be mapped to `user`.

Admins should not read another user's private financial transactions by default. Any future admin access to private financial records requires an explicit product and privacy decision.

## MVP Scope

P0 functionality for the new direction:

- Role simplification to `admin` and `user`.
- User-scoped financial data isolation.
- Grouped sidebar navigation and grouped route/module structure.
- Theme switching: `light`, `dark`, and `system`.
- Accounts and wallets.
- Income tracking.
- Expense tracking.
- Transfer tracking.
- Category management for income and expenses.
- Personal finance dashboard with income, expenses, cashflow, balances, and net worth.

P1 functionality after P0:

- Monthly budgets.
- Savings goals.
- Monthly reports and cashflow reports.
- CSV import mapping for personal finance data.
- Admin user management.
- Improved mobile UX.

P2/later functionality:

- Recurring transactions, bill reminders, and subscription tracking.
- Debt payoff planner and emergency fund tracker.
- Forecasting and what-if simulation.
- PWA support.
- PDF/Excel export.
- Advanced investment analytics.
- Notification center.
- User data export/delete workflows.
- Financial health score.

## Out Of Scope For This Execution

The current roadmap intentionally excludes:

- Company finance workflows.
- Cloud backup or remote storage integrations.
- Production deployment.
- Real market data integration.
- FIFO, tax-lot accounting, TWR, or MWR.
- Buy/sell recommendation logic.
- Advanced investment reporting beyond the existing manual/mock portfolio foundation.

## Architecture Defaults

- All user-owned financial records must be scoped by `user_id`.
- User-facing endpoints must only return the authenticated user's records.
- Admin endpoints must be separated under an explicit admin domain.
- Sidebar navigation must be grouped and visible, not dropdown-based.
- Frontend feature folders should be grouped by personal finance domain.
- Backend handlers, services, repositories, DTOs, and validators should be grouped by domain.
- Theme preference should use `system` by default, persist locally, and later sync to the user profile.
- Existing portfolio features should move under Assets & Net Worth and remain clearly labelled as manual/mock, not real-time.

## Route Architecture

Primary frontend routes should follow the personal finance navigation groups:

```txt
/                       Overview / Ringkasan
/transactions           Money Management / Transaksi
/accounts               Money Management / Akun & Wallet
/reports                Reports / Laporan
/assets/portfolio       Assets & Net Worth / Portofolio
/assets/instruments     Assets & Net Worth / Instrumen
/imports                Assets & Net Worth / Impor Data
/admin/audit-log        Admin / Log Audit
/settings               Settings / Pengaturan
```

Compatibility routes from the earlier MVP can redirect to the primary routes while the migration is in progress.

## Demo Safety

Demo data, seed credentials, and local backup scripts are local-only. No production secrets should be committed. Database backup/export workflows remain recovery and local demo tooling; they are not personal finance report exports.

## Personal Transaction Behavior

Income, expense, and transfer records are personal finance transactions scoped to the authenticated user:

- Income increases the selected cash account balance.
- Expense decreases the selected cash account balance.
- Transfer moves money from one user-owned cash account to another and is excluded from income/expense totals.
- Editing or deleting personal transactions records balancing cash ledger movements instead of silently mutating account balances without history.
- Negative cash balances are rejected in the MVP.

Legacy investment transaction types (`buy`, `sell`, `dividend`, `fee`, `adjustment`) remain available for the Assets & Net Worth module. Holdings calculation only uses investment buy/sell/adjustment transactions and ignores personal income, expense, and transfer records.

## Current Privacy Boundary

The active MVP financial records are user-scoped:

- Investment transactions.
- Cash accounts and cash adjustment ledger rows.
- Manual price snapshots.
- Holdings snapshots.
- Import jobs and import confirmations.
- Dashboard and report aggregates.

Instrument and asset-category metadata remain shared reference data during the assets-module transition. They should not contain private financial amounts. User-specific instrument metadata can be introduced later when the Assets & Net Worth module is split from the legacy portfolio MVP.
