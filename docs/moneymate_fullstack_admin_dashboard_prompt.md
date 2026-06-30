# Prompt Fullstack Development — MoneyMate Admin Dashboard

Tanggal penyusunan: 30 Juni 2026  
Target stack utama: **React + TypeScript + Golang**  
Target produk: **admin dashboard personal finance, portfolio, order, cash, dan net worth tracker**

---

## Cara Menggunakan Prompt Ini

Gunakan seluruh isi file ini sebagai prompt untuk AI coding agent seperti Cursor, Windsurf, Claude Code, Codex, atau agent development internal. Prompt ini dirancang agar agent langsung membangun aplikasi fullstack modern berbasis data spreadsheet existing `Assets` yang saat ini memuat portfolio investasi, order transaksi, summary aset, dan cash account.

---

# PROMPT UTAMA UNTUK AI FULLSTACK DEVELOPER

Kamu adalah **Senior Fullstack Engineer, Product Engineer, UI/UX Designer, Data Modeler, dan DevOps Engineer**. Bangun aplikasi fullstack bernama **MoneyMate Admin Dashboard** menggunakan **React + TypeScript untuk frontend** dan **Golang untuk backend API**.

Aplikasi ini harus menjadi dashboard modern untuk mengelola dan menganalisis keuangan pribadi/investasi. Data awal berasal dari spreadsheet `Assets` yang memiliki beberapa area data utama:

1. **Investment / Portfolio Holdings**
   - Instrument
   - Ticker
   - Name
   - Average Price
   - Current Price
   - Units
   - Total Cost / Total Value Asset
   - Current Value
   - Profit/Loss Value
   - Profit/Loss Percent

2. **Orders / Transactions**
   - Date
   - Instrument
   - Ticker
   - Type, misalnya Buy/Sell
   - Price
   - Units
   - Total Value
   - Currency

3. **Asset Summary**
   - Asset category, misalnya Emas, Reksadana, Saham, ETF, Cash
   - Value
   - Total Net Worth

4. **Cash Accounts**
   - Account, misalnya BRI, Seabank, Gopay
   - Balance
   - Total Cash

Bangun ulang spreadsheet tracker ini menjadi aplikasi web yang lebih rapi, scalable, aman, mudah dipakai, dan lebih mutakhir dari sekadar tabel manual.

---

## 1. Product Vision

Bangun **MoneyMate Admin Dashboard** sebagai aplikasi web untuk:

- Melihat total net worth secara cepat.
- Melihat komposisi aset per kategori.
- Melacak portfolio saham, ETF, reksadana, emas, dan cash.
- Melihat profit/loss per instrumen dan total portfolio.
- Mencatat order transaksi buy/sell.
- Mencatat saldo cash per akun.
- Mengimpor data dari spreadsheet/CSV/XLSX.
- Mengelola data master instrumen.
- Menyediakan insight keuangan yang aman, tidak memaksa keputusan investasi, dan tidak memberi sinyal beli/jual.

Aplikasi harus terasa seperti **admin dashboard finansial modern**, bukan sekadar spreadsheet yang dipindahkan ke web.

Tone produk: **bersih, analitis, terpercaya, ringan, dan cocok untuk user Indonesia**.

---

## 2. Important Product Guardrails

Aplikasi ini menyentuh data finansial. Ikuti guardrails berikut:

1. **Jangan mengklaim harga real-time** kecuali integrasi provider market data sudah benar-benar diaktifkan.
2. Jika memakai mock/delayed/manual price, tampilkan label seperti:
   - `Harga manual`
   - `Harga terakhir diperbarui: ...`
   - `Data bukan real-time`
3. Jangan memberi rekomendasi investasi langsung seperti:
   - `Beli saham ini`
   - `Jual sekarang`
   - `Pasti profit`
4. Insight boleh berupa edukasi dan risk flag, misalnya:
   - `Porsi saham terlalu terkonsentrasi pada satu ticker.`
   - `Portfolio sedang turun X% dari modal.`
   - `Cash buffer rendah dibanding total aset.`
5. Semua angka finansial harus jelas currency-nya, terutama IDR dan USD.
6. Semua data penting harus memiliki audit trail: siapa mengubah, kapan, dan field apa yang berubah.

---

## 3. Recommended Tech Stack

### 3.1 Frontend

Gunakan:

- React 19+
- TypeScript strict mode
- Vite untuk build tool
- Tailwind CSS untuk styling
- shadcn/ui atau komponen berbasis Radix UI untuk dashboard UI
- TanStack Query untuk server-state, caching, mutation, invalidation
- TanStack Table untuk data grid holdings, orders, instruments, dan cash accounts
- React Hook Form + Zod untuk form validation
- Zustand atau Jotai untuk UI state kecil seperti sidebar, theme, filter sementara
- Recharts atau Apache ECharts untuk visualisasi dashboard
- date-fns untuk format tanggal
- lucide-react untuk icons
- Sonner atau toast system lain untuk notifikasi UI
- Playwright untuk end-to-end test
- Vitest + React Testing Library untuk unit/component test

Frontend harus berbentuk **single-page admin dashboard** yang cepat, responsive, dan enak dipakai di desktop maupun tablet. Mobile tetap usable, tetapi prioritas utama adalah desktop dashboard.

### 3.2 Backend

Gunakan:

- Go 1.26+ atau versi stable terbaru yang tersedia di environment
- net/http + chi router, atau Gin jika agent lebih nyaman, tetapi prioritaskan struktur idiomatic Go
- PostgreSQL sebagai database utama
- pgx sebagai PostgreSQL driver
- sqlc untuk type-safe query generation, atau GORM hanya jika agent punya alasan jelas
- Goose atau golang-migrate untuk migration
- OpenAPI 3.1 untuk dokumentasi API
- Zap atau slog untuk structured logging
- Argon2id untuk password hashing
- HTTP-only secure cookie untuk refresh/session token
- Access token pendek untuk API authorization
- Middleware untuk auth, RBAC, rate limit, request ID, CORS, recovery, logging
- Background worker sederhana untuk import job, sync job, dan price snapshot job

### 3.3 Infrastructure / DevOps

Gunakan:

- Docker Compose untuk local development
- PostgreSQL container
- Optional Redis container untuk job queue/cache jika diperlukan
- Makefile untuk perintah umum
- `.env.example` lengkap
- GitHub Actions untuk CI: lint, test, build
- Migration otomatis/manual via command
- Seed data dari contoh portfolio spreadsheet

### 3.4 Recommended Monorepo Structure

```txt
moneymate/
  README.md
  Makefile
  docker-compose.yml
  .env.example
  .gitignore

  frontend/
    package.json
    vite.config.ts
    tsconfig.json
    index.html
    src/
      main.tsx
      app/
        App.tsx
        router.tsx
        providers.tsx
        layouts/
          DashboardLayout.tsx
          AuthLayout.tsx
      components/
        ui/
        charts/
        tables/
        forms/
        feedback/
      features/
        auth/
        dashboard/
        portfolio/
        orders/
        cash/
        instruments/
        imports/
        reports/
        settings/
        audit-log/
      lib/
        api.ts
        query-client.ts
        format.ts
        constants.ts
        validators.ts
      styles/
        globals.css
      tests/

  backend/
    go.mod
    go.sum
    cmd/
      api/
        main.go
      worker/
        main.go
      migrate/
        main.go
      seed/
        main.go
    internal/
      config/
      domain/
      httpapi/
        handlers/
        middleware/
        response/
      service/
      repository/
        postgres/
      auth/
      importer/
      pricing/
      reporting/
      audit/
      validator/
    db/
      migrations/
      queries/
      seed/
    docs/
      openapi.yaml
    tests/

  deploy/
    nginx/
    production-notes.md
```

---

## 4. Core User Roles

Implementasikan minimal role berikut:

1. **Owner**
   - Bisa mengelola semua data.
   - Bisa melihat laporan lengkap.
   - Bisa mengelola user/admin.
   - Bisa mengubah settings dan data source.

2. **Admin**
   - Bisa CRUD portfolio, orders, cash, instrument.
   - Bisa import data.
   - Tidak bisa menghapus owner.

3. **Viewer**
   - Read-only.
   - Bisa melihat dashboard dan report.
   - Tidak bisa ubah data.

Untuk MVP single-user, tetap desain database dan middleware agar multi-user siap dikembangkan.

---

## 5. Main Navigation

Buat sidebar navigation dengan menu berikut:

1. **Overview**
2. **Portfolio**
3. **Orders**
4. **Cash**
5. **Instruments**
6. **Asset Allocation**
7. **Reports**
8. **Import Data**
9. **Insights**
10. **Audit Log**
11. **Settings**

Tambahkan command palette opsional dengan shortcut `Ctrl+K` atau `Cmd+K` untuk navigasi cepat.

---

## 6. UI/UX Direction

Desain harus modern, tidak terlalu ramai, dan menggunakan pola dashboard finansial:

### Visual Style

- Layout: sidebar kiri, topbar, content grid.
- Background: neutral slate/zinc tone.
- Card: rounded-2xl, subtle border, shadow ringan.
- Typography: jelas, angka finansial mudah dibaca.
- Gunakan warna semantik:
  - Hijau untuk profit/positive.
  - Merah untuk loss/negative.
  - Amber untuk warning.
  - Biru/indigo untuk neutral info.
- Support dark mode dan light mode.
- Jangan gunakan terlalu banyak warna pada grafik; gunakan konsisten per kategori aset.

### Dashboard Requirements

Overview page harus memuat:

1. KPI cards:
   - Total Net Worth
   - Total Portfolio Value
   - Total Cash
   - Total Profit/Loss
   - Profit/Loss Percent
   - Best Performer
   - Worst Performer

2. Charts:
   - Asset allocation donut chart
   - Net worth trend line chart
   - Portfolio value vs total cost chart
   - Profit/loss by instrument bar chart

3. Tables:
   - Top holdings by value
   - Recent orders
   - Cash account summary

4. Alerts:
   - Negative P/L alerts
   - Concentration risk alerts
   - Missing current price alerts
   - Currency mismatch alerts
   - Stale price data alerts

### Responsiveness

- Desktop: full dashboard grid.
- Tablet: 2-column grid.
- Mobile: single-column stacked cards, sidebar collapses into drawer.

### Empty States

Setiap page harus punya empty state yang jelas:

- Portfolio kosong: tampilkan CTA `Tambah Holding` atau `Import dari Spreadsheet`.
- Orders kosong: tampilkan CTA `Catat Order Pertama`.
- Cash kosong: tampilkan CTA `Tambah Akun Cash`.

---

## 7. Data Model

Buat schema PostgreSQL yang normalized tetapi tetap praktis untuk MVP.

### 7.1 users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.2 instruments

Mewakili saham, ETF, reksadana, emas, cash-like asset.

```sql
CREATE TABLE instruments (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('stock', 'etf', 'mutual_fund', 'gold', 'cash', 'other')),
  ticker TEXT,
  name TEXT NOT NULL,
  provider TEXT,
  currency TEXT NOT NULL DEFAULT 'IDR',
  exchange TEXT,
  country TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(type, ticker, name)
);
```

### 7.3 transactions

Mewakili order buy/sell/dividend/fee/adjustment.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  instrument_id UUID REFERENCES instruments(id),
  transaction_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'fee', 'adjustment')),
  price NUMERIC(22, 8) NOT NULL DEFAULT 0,
  units NUMERIC(22, 8) NOT NULL DEFAULT 0,
  gross_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  fees NUMERIC(22, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(22, 2) NOT NULL DEFAULT 0,
  net_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  fx_rate_to_idr NUMERIC(22, 8),
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.4 holdings_snapshot

Simpan calculated holding per tanggal agar dashboard cepat dan historis.

```sql
CREATE TABLE holdings_snapshot (
  id UUID PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  instrument_id UUID NOT NULL REFERENCES instruments(id),
  average_price NUMERIC(22, 8) NOT NULL DEFAULT 0,
  current_price NUMERIC(22, 8) NOT NULL DEFAULT 0,
  units NUMERIC(22, 8) NOT NULL DEFAULT 0,
  total_cost NUMERIC(22, 2) NOT NULL DEFAULT 0,
  current_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  profit_loss_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  profit_loss_percent NUMERIC(12, 8) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  price_source TEXT NOT NULL DEFAULT 'manual',
  price_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date, instrument_id)
);
```

### 7.5 cash_accounts

```sql
CREATE TABLE cash_accounts (
  id UUID PRIMARY KEY,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'bank',
  currency TEXT NOT NULL DEFAULT 'IDR',
  balance NUMERIC(22, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.6 asset_categories

```sql
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  target_allocation_percent NUMERIC(8, 4),
  color_key TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.7 instrument_categories

```sql
CREATE TABLE instrument_categories (
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES asset_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (instrument_id, category_id)
);
```

### 7.8 price_snapshots

```sql
CREATE TABLE price_snapshots (
  id UUID PRIMARY KEY,
  instrument_id UUID NOT NULL REFERENCES instruments(id),
  price_date DATE NOT NULL,
  price NUMERIC(22, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  source TEXT NOT NULL DEFAULT 'manual',
  is_realtime BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instrument_id, price_date, source)
);
```

### 7.9 import_jobs

```sql
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'xlsx', 'google_sheet', 'manual_seed')),
  original_filename TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  total_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  error_summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### 7.10 audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 8. Calculation Rules

Implementasikan calculation service di backend, bukan hanya frontend.

### Holding Calculation

Untuk setiap instrument:

- Total units = total buy units - total sell units + adjustment units.
- Total cost = sum buy net value - cost basis dari sell jika sell didukung.
- Average price = total cost / units jika units > 0.
- Current value = current price × units.
- Profit/loss value = current value - total cost.
- Profit/loss percent = profit/loss value / total cost.

Untuk MVP, jika belum mengimplementasikan metode cost basis kompleks, gunakan weighted average cost dan dokumentasikan.

### Cash Calculation

- Total cash = sum active cash account balances.
- Cash masuk/keluar dari order boleh diimplementasikan sebagai phase 2.
- MVP boleh mengelola cash balance manual.

### Net Worth

```txt
Total Net Worth = Total Current Portfolio Value + Total Cash
```

### Asset Allocation

```txt
Allocation Percent = Asset Category Current Value / Total Net Worth
```

### Currency

- Simpan currency original di transaksi dan instrument.
- Dashboard base currency default: IDR.
- Jika ada USD asset seperti ETF SPY, gunakan fx_rate_to_idr.
- Jika fx rate tidak tersedia, tampilkan warning `FX rate belum diisi`.

---

## 9. API Requirements

Buat REST API dengan JSON response standar.

### 9.1 Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "request_id": "req_xxx"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": []
  },
  "request_id": "req_xxx"
}
```

### 9.2 Auth Endpoints

```txt
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

### 9.3 Dashboard Endpoints

```txt
GET /api/v1/dashboard/overview
GET /api/v1/dashboard/net-worth-trend?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/v1/dashboard/asset-allocation
GET /api/v1/dashboard/performance
GET /api/v1/dashboard/alerts
```

### 9.4 Portfolio Endpoints

```txt
GET    /api/v1/holdings
GET    /api/v1/holdings/:id
POST   /api/v1/holdings/recalculate
GET    /api/v1/holdings/snapshots?date=YYYY-MM-DD
```

### 9.5 Instrument Endpoints

```txt
GET    /api/v1/instruments
POST   /api/v1/instruments
GET    /api/v1/instruments/:id
PUT    /api/v1/instruments/:id
DELETE /api/v1/instruments/:id
```

### 9.6 Transaction / Order Endpoints

```txt
GET    /api/v1/transactions?page=1&page_size=20&type=buy&instrument_id=...
POST   /api/v1/transactions
GET    /api/v1/transactions/:id
PUT    /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
```

### 9.7 Cash Endpoints

```txt
GET    /api/v1/cash-accounts
POST   /api/v1/cash-accounts
GET    /api/v1/cash-accounts/:id
PUT    /api/v1/cash-accounts/:id
DELETE /api/v1/cash-accounts/:id
POST   /api/v1/cash-accounts/:id/adjust
```

### 9.8 Import Endpoints

```txt
POST   /api/v1/imports/upload
GET    /api/v1/imports/jobs
GET    /api/v1/imports/jobs/:id
POST   /api/v1/imports/jobs/:id/confirm
POST   /api/v1/imports/google-sheet/preview
POST   /api/v1/imports/google-sheet/run
```

### 9.9 Price Endpoints

```txt
GET    /api/v1/prices?instrument_id=...
POST   /api/v1/prices/manual
POST   /api/v1/prices/bulk-manual
POST   /api/v1/prices/sync
```

### 9.10 Reports Endpoints

```txt
GET /api/v1/reports/monthly-summary?month=YYYY-MM
GET /api/v1/reports/portfolio-performance?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /api/v1/reports/export.csv
GET /api/v1/reports/export.xlsx
```

### 9.11 Audit Log Endpoints

```txt
GET /api/v1/audit-logs?page=1&page_size=50&entity_type=transaction
```

---

## 10. Frontend Page Specifications

### 10.1 Login Page

Fields:

- Email
- Password
- Remember device checkbox

Behavior:

- Validasi client-side dengan Zod.
- Show loading state.
- Show proper error message.
- Redirect ke Overview setelah login.

### 10.2 Overview Page

Komponen:

- `NetWorthCard`
- `PortfolioValueCard`
- `TotalCashCard`
- `ProfitLossCard`
- `AssetAllocationChart`
- `NetWorthTrendChart`
- `TopHoldingsTable`
- `RecentOrdersTable`
- `RiskAlertsPanel`

Data dari:

- `/api/v1/dashboard/overview`
- `/api/v1/dashboard/asset-allocation`
- `/api/v1/dashboard/net-worth-trend`
- `/api/v1/dashboard/alerts`

### 10.3 Portfolio Page

Tampilkan table holdings dengan fitur:

- Search by ticker/name.
- Filter instrument type.
- Filter positive/negative P&L.
- Sort by current value, P/L, P/L percent.
- Column visibility.
- Export current view to CSV.
- Row click opens detail drawer.

Columns:

- Instrument
- Ticker
- Name
- Average Price
- Current Price
- Units
- Total Cost
- Current Value
- P/L Value
- P/L %
- Price Source
- Last Updated

Actions:

- Recalculate holdings.
- Add manual price.
- Open transactions for instrument.

### 10.4 Orders Page

Tampilkan table transactions dengan fitur:

- Add transaction modal/drawer.
- Edit transaction.
- Delete with confirmation.
- Bulk import.
- Filter by date range, type, instrument, currency.
- Show total buy/sell value for current filter.

Form fields:

- Date
- Instrument
- Type
- Price
- Units
- Fees
- Tax
- Currency
- FX rate to IDR if non-IDR
- Notes

Validation:

- Date wajib.
- Type wajib.
- Price >= 0.
- Units > 0 untuk buy/sell.
- Currency wajib.
- FX rate wajib jika currency bukan IDR.

### 10.5 Cash Page

Tampilkan cash accounts:

- BRI
- Seabank
- Gopay
- Tambahkan custom account lain.

Fitur:

- Add account.
- Edit balance.
- Balance adjustment history.
- Mark account inactive.
- Total cash summary.

### 10.6 Instruments Page

Fitur:

- Master data instrument.
- Add/edit instrument.
- Assign category.
- Set currency.
- Set provider/source.
- Mark inactive.

Instrument type options:

- Saham Indonesia / stock
- ETF
- Reksadana / mutual fund
- Emas / gold
- Cash
- Other

### 10.7 Asset Allocation Page

Fitur:

- Donut chart kategori aset.
- Table asset category current value.
- Target allocation setting.
- Difference from target allocation.
- Warning jika satu kategori terlalu dominan.

Contoh risk rules:

- Jika satu ticker > 50% portfolio, warning concentration risk.
- Jika cash < 5% net worth, warning liquidity risk.
- Jika satu asset class > 80% net worth, warning diversification risk.
- Jika price_updated_at > 7 hari, warning stale price.

### 10.8 Reports Page

Reports:

- Monthly summary.
- Portfolio performance.
- Transaction summary.
- Cash summary.
- Asset allocation history.

Export:

- CSV
- XLSX
- PDF optional phase 2

### 10.9 Import Data Page

Fitur penting karena data awal berasal dari spreadsheet.

Flow:

1. User upload CSV/XLSX atau input Google Sheet URL.
2. Backend parse file.
3. Tampilkan preview rows.
4. User mapping columns ke schema:
   - Investment section
   - Orders section
   - Cash section
   - Asset summary section
5. Validasi rows.
6. Tampilkan error per row.
7. User confirm import.
8. Backend simpan import job.
9. Setelah import selesai, recalculate holdings.

Untuk MVP, implementasikan import CSV/XLSX dulu. Google Sheet URL integration boleh disiapkan sebagai adapter interface jika credential belum ada.

### 10.10 Insights Page

Berikan insight yang aman dan edukatif:

- Portfolio concentration.
- P/L summary.
- Stale data warning.
- Cash buffer warning.
- Currency exposure.
- Asset allocation drift.

Jangan membuat fitur `buy/sell recommendation`. Gunakan bahasa:

- `Perlu diperhatikan`
- `Risiko yang terlihat`
- `Data yang belum lengkap`
- `Pertanyaan reflektif`

Contoh insight:

```txt
Porsi Saham saat ini sekitar X% dari net worth. Jika tujuan kamu adalah menjaga likuiditas, pertimbangkan menetapkan target cash buffer. Ini bukan rekomendasi jual/beli, hanya ringkasan risiko alokasi.
```

### 10.11 Audit Log Page

Tampilkan:

- Time
- Actor
- Action
- Entity Type
- Entity ID
- Before/After diff summary
- IP address

Filter:

- Date range
- Actor
- Entity type
- Action

---

## 11. Dashboard Data Contracts

### 11.1 GET `/api/v1/dashboard/overview`

Response example:

```json
{
  "success": true,
  "data": {
    "base_currency": "IDR",
    "total_net_worth": 13648703.72,
    "total_portfolio_value": 13392923.72,
    "total_cash": 155890,
    "total_cost": 14382050.41,
    "profit_loss_value": -889236.69,
    "profit_loss_percent": -0.0618,
    "best_performer": {
      "ticker": "SPY",
      "name": "S&P 500 ETF",
      "profit_loss_percent": 0.0135
    },
    "worst_performer": {
      "ticker": "BBRI",
      "name": "Bank Rakyat Indonesia",
      "profit_loss_percent": -0.1481
    },
    "last_updated_at": "2026-06-30T15:01:57+07:00"
  },
  "meta": {},
  "request_id": "req_123"
}
```

### 11.2 GET `/api/v1/dashboard/asset-allocation`

```json
{
  "success": true,
  "data": [
    { "asset": "Emas", "value": 1626124.8, "percent": 0.1191 },
    { "asset": "Reksadana", "value": 5722589.05, "percent": 0.4193 },
    { "asset": "Saham", "value": 4641000, "percent": 0.3400 },
    { "asset": "ETF", "value": 1503099.87, "percent": 0.1101 },
    { "asset": "Cash", "value": 155890, "percent": 0.0114 }
  ],
  "request_id": "req_123"
}
```

---

## 12. Seed Data

Buat seed data berdasarkan data contoh berikut.

### Instruments

- Emas — Pegadaian — type: gold — currency: IDR
- Reksadana — Sucorinvest Stable Fund — type: mutual_fund — currency: IDR
- Saham — BBRI — Bank Rakyat Indonesia — type: stock — currency: IDR
- ETF — SPY — S&P 500 ETF — type: etf — currency: USD

### Cash Accounts

- BRI — balance 0
- Seabank — balance 151859
- Gopay — balance 4031

### Asset Summary Example

- Emas: 1,626,124.8
- Reksadana: 5,722,589.052
- Saham: 4,641,000
- ETF: 1,503,099.868
- Cash: 155,890
- Total Net Worth: 13,648,703.72

### Example Transactions

- 2026-04-02, Saham, BBRI, Buy, 3340, 600, 2004000, IDR
- 2026-04-13, Saham, BBRI, Buy, 3390, 400, 1356000, IDR
- 2026-05-07, Saham, BBRI, Buy, 3260, 200, 652000, IDR
- 2026-06-10, ETF, SPY, Buy, 733.33, 0.075204887, 989198.6274, USD
- 2026-06-10, Emas, Pegadaian, Buy, 2607000, 0.382, 995874, IDR
- 2026-06-10, Saham, BBRI, Buy, 2880, 300, 864000, IDR
- 2026-06-12, Reksadana, Sucorinvest Stable Fund, Buy, 1447.07, 3424.1605, 4954999.935, IDR
- 2026-06-25, ETF, SPY, Buy, 735.72, 0.037418923, 493789.4827, USD
- 2026-06-25, Emas, Pegadaian, Buy, 2531000, 0.2964, 750188.4, IDR
- 2026-06-26, Saham, BBRI, Buy, 2860, 200, 572000, IDR
- 2026-06-29, Reksadana, Sucorinvest Stable Fund, Buy, 1451.24, 516.7994, 749999.9613, IDR

---

## 13. Backend Architecture Requirements

Gunakan layered architecture:

```txt
handler -> service -> repository -> database
```

### Domain Layer

Buat domain structs:

- User
- Instrument
- Transaction
- HoldingSnapshot
- CashAccount
- AssetCategory
- PriceSnapshot
- ImportJob
- AuditLog

### Service Layer

Service minimal:

- AuthService
- DashboardService
- PortfolioService
- TransactionService
- CashService
- InstrumentService
- ImportService
- PricingService
- ReportService
- AuditService

### Repository Layer

Repository harus punya interface agar testable.

Contoh:

```go
type TransactionRepository interface {
    List(ctx context.Context, filter TransactionFilter) ([]Transaction, PaginationMeta, error)
    GetByID(ctx context.Context, id uuid.UUID) (Transaction, error)
    Create(ctx context.Context, input CreateTransactionInput) (Transaction, error)
    Update(ctx context.Context, id uuid.UUID, input UpdateTransactionInput) (Transaction, error)
    Delete(ctx context.Context, id uuid.UUID) error
}
```

### Error Handling

Buat typed errors:

- ErrNotFound
- ErrUnauthorized
- ErrForbidden
- ErrValidation
- ErrConflict
- ErrInternal

Map ke HTTP status code dengan konsisten.

### Logging

Setiap request log:

- request_id
- method
- path
- status
- duration_ms
- user_id jika tersedia

Jangan log password, token, atau data sensitif.

---

## 14. Frontend Architecture Requirements

### Folder Pattern

Gunakan feature-based structure:

```txt
src/features/portfolio/
  api.ts
  types.ts
  hooks.ts
  components/
  pages/
  schemas.ts
```

### API Client

Buat typed API client berbasis fetch atau axios.

Requirements:

- Inject base URL dari env.
- Handle 401 dengan refresh flow.
- Throw typed ApiError.
- Include request_id dari server jika error.
- Integrasi dengan TanStack Query.

### Query Keys

Buat central query key factory:

```ts
export const queryKeys = {
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    allocation: ['dashboard', 'allocation'] as const,
  },
  holdings: {
    all: ['holdings'] as const,
    list: (filter: HoldingFilter) => ['holdings', 'list', filter] as const,
  },
};
```

### Formatting Utilities

Buat formatter:

- `formatCurrency(value, currency = 'IDR')`
- `formatPercent(value)`
- `formatNumber(value)`
- `formatDate(value)`
- `formatCompactCurrency(value)`

Untuk IDR gunakan format Indonesia:

```txt
Rp13.648.704
```

Untuk USD:

```txt
US$123.45
```

---

## 15. Feature Recommendations Beyond MVP

Tambahkan rekomendasi fitur berikut ke backlog dan desain agar mudah diaktifkan:

### 15.1 Smart Import Mapping

Aplikasi mengenali struktur spreadsheet lama dan otomatis memetakan:

- `INVESMENT` atau `INVESTMENT` -> Holdings
- `ORDERS` -> Transactions
- `CASH` -> Cash Accounts
- `Asset, Value` -> Asset Summary

Jika typo ditemukan seperti `INVESMENT`, aplikasi tetap bisa membaca dan memberi warning.

### 15.2 Data Quality Center

Page khusus untuk mendeteksi:

- Harga current kosong.
- Currency tidak cocok.
- Ticker duplikat.
- Unit nol tetapi value ada.
- Transaction total tidak sama dengan price × units.
- Asset summary tidak sama dengan calculated holdings.
- FX rate kosong untuk USD asset.

### 15.3 Portfolio Risk Flags

Rules sederhana:

- Concentration by ticker.
- Concentration by asset class.
- Negative performance > threshold.
- Cash buffer too low.
- Stale price data.
- High foreign currency exposure.

### 15.4 Goal Tracking

User bisa set financial goals:

- Emergency fund target.
- Investment target.
- Monthly contribution target.
- Asset allocation target.

Dashboard menampilkan progress bar.

### 15.5 Recurring Investment Plan

Fitur untuk rencana beli berkala:

- Monthly contribution target.
- Planned asset allocation.
- Reminder only, bukan rekomendasi beli.

### 15.6 Scenario Simulator

Simulator edukatif:

- Jika harga naik/turun X%, berapa portfolio value?
- Jika tambah investasi RpX per bulan, estimasi modal bertambah berapa?
- Jika USD/IDR berubah X%, apa dampaknya pada ETF USD?

Pastikan simulator menampilkan disclaimer bahwa ini simulasi, bukan prediksi.

### 15.7 Price Provider Adapter

Siapkan interface:

```go
type PriceProvider interface {
    GetLatestPrice(ctx context.Context, instrument Instrument) (PriceQuote, error)
    GetHistoricalPrices(ctx context.Context, instrument Instrument, from, to time.Time) ([]PriceQuote, error)
}
```

Implementasi MVP:

- ManualPriceProvider
- MockPriceProvider

Future adapter:

- IDX data provider
- Mutual fund NAV provider
- Gold price provider
- FX rate provider
- US ETF provider

### 15.8 Notification Center

Notifikasi internal:

- Data stale.
- Import selesai/gagal.
- Portfolio turun melewati threshold.
- Cash buffer rendah.
- Rebalancing drift dari target allocation.

### 15.9 Multi-Portfolio

Support beberapa portfolio:

- Personal
- Retirement
- Emergency fund
- Watch-only portfolio

### 15.10 Document Attachment

Attach bukti transaksi:

- Screenshot order
- Statement broker
- Invoice pembelian emas
- Bank statement

### 15.11 Privacy Mode

Mode untuk menyembunyikan angka nominal di UI, cocok saat screen sharing:

- Toggle `Privacy Mode`
- Angka menjadi `••••••`
- Percent tetap boleh tampil opsional

### 15.12 AI Financial Summary, Safe Mode

AI boleh membuat ringkasan:

- `Apa yang berubah bulan ini?`
- `Aset mana yang paling banyak memengaruhi P/L?`
- `Data apa yang perlu dilengkapi?`

AI tidak boleh memberi rekomendasi buy/sell. Gunakan label:

```txt
Ringkasan ini bersifat informatif dan edukatif, bukan nasihat investasi.
```

---

## 16. Security Requirements

1. Password hashing: Argon2id.
2. Token/session:
   - Access token pendek.
   - Refresh/session via HTTP-only secure cookie.
3. CSRF protection jika menggunakan cookie auth.
4. RBAC middleware.
5. Input validation di backend dan frontend.
6. Rate limit endpoint auth.
7. Audit log semua create/update/delete.
8. CORS whitelist via env.
9. SQL injection prevention via parameterized queries/sqlc.
10. No secrets in repo.
11. `.env.example` tanpa nilai secret asli.
12. Security headers jika serving frontend via reverse proxy.

---

## 17. Performance Requirements

Frontend:

- Initial load cepat.
- Code splitting by route.
- Skeleton loading untuk dashboard.
- Virtualized table jika row > 500.
- Query caching dan stale time yang masuk akal.

Backend:

- Pagination wajib untuk list endpoint.
- Index database untuk transaction_date, instrument_id, user_id, created_at.
- Dashboard endpoint harus optimized; boleh pakai materialized/snapshot table.
- Use context timeout untuk DB query.
- Avoid N+1 queries.

Database indexes minimal:

```sql
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_instrument ON transactions(instrument_id);
CREATE INDEX idx_holdings_snapshot_date ON holdings_snapshot(snapshot_date DESC);
CREATE INDEX idx_price_snapshots_instrument_date ON price_snapshots(instrument_id, price_date DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## 18. Testing Requirements

### Backend Tests

- Unit test calculation service.
- Unit test validation.
- Integration test API handlers.
- Repository test with test database if possible.
- Test auth middleware.

Critical calculation tests:

- Weighted average buy.
- Multiple buy same ticker.
- USD asset with FX rate.
- Negative P/L calculation.
- Zero unit edge case.
- Missing current price.

### Frontend Tests

- Render dashboard KPI cards.
- Render holdings table.
- Form validation for transaction create.
- Query error state.
- Auth redirect.

### E2E Tests

- Login.
- Create instrument.
- Create transaction.
- Recalculate holdings.
- View dashboard.
- Import file preview.

---

## 19. MVP Scope

Implementasikan fase MVP terlebih dahulu.

### MVP Must-Have

1. Auth login/logout.
2. Overview dashboard.
3. Portfolio holdings table.
4. Orders CRUD.
5. Cash accounts CRUD.
6. Instruments CRUD.
7. Manual price update.
8. Holdings recalculation.
9. Seed data dari spreadsheet.
10. Import CSV/XLSX preview minimal.
11. Audit log untuk write action.
12. Responsive UI.
13. Docker Compose local setup.
14. README setup lengkap.

### MVP Nice-to-Have

1. Google Sheet import adapter.
2. Export CSV.
3. Net worth historical chart.
4. Target allocation setting.
5. Privacy mode.

### Phase 2

1. Scheduled price sync.
2. Multi-user collaboration.
3. AI financial summary safe mode.
4. PDF report.
5. Document attachments.
6. Recurring investment plan.
7. Scenario simulator.
8. Notification center.

---

## 20. Implementation Steps For Agent

Ikuti urutan kerja berikut:

1. Buat repo structure sesuai monorepo.
2. Buat docker-compose PostgreSQL.
3. Buat backend Go API skeleton.
4. Buat database migrations.
5. Buat seed command.
6. Implement auth.
7. Implement instruments CRUD.
8. Implement transactions CRUD.
9. Implement cash accounts CRUD.
10. Implement holdings recalculation service.
11. Implement dashboard overview endpoint.
12. Generate OpenAPI docs.
13. Buat frontend Vite React TypeScript.
14. Setup Tailwind, component library, routing, query client.
15. Implement login page.
16. Implement dashboard layout.
17. Implement overview page.
18. Implement portfolio page.
19. Implement orders page.
20. Implement cash page.
21. Implement instruments page.
22. Implement import preview page.
23. Implement audit log page.
24. Tambahkan tests.
25. Tambahkan README dan setup instructions.
26. Pastikan app bisa berjalan dengan:

```bash
make dev
```

atau:

```bash
docker compose up --build
```

---

## 21. Specific Acceptance Criteria

Aplikasi dianggap selesai jika:

1. User bisa login sebagai owner seed account.
2. Dashboard menampilkan total net worth, portfolio value, cash, dan P/L.
3. Data seed menampilkan aset seperti Emas, Reksadana, Saham BBRI, ETF SPY, dan Cash.
4. Orders page menampilkan transaksi contoh.
5. User bisa menambah transaksi baru.
6. Setelah transaksi baru ditambah, holdings bisa direcalculate.
7. P/L berubah sesuai calculation service.
8. Cash account bisa ditambah dan diedit.
9. Instrument bisa ditambah dan diedit.
10. Audit log mencatat create/update/delete.
11. API memiliki error response yang konsisten.
12. Frontend memiliki loading, empty, dan error state.
13. UI responsive dan terlihat seperti dashboard modern.
14. Tidak ada hardcoded API URL selain env.
15. README menjelaskan setup local, migration, seed, test, dan build.
16. Tidak ada secret tersimpan di repository.

---

## 22. README Requirements

Buat README dengan struktur:

1. Project overview.
2. Tech stack.
3. Architecture diagram sederhana dalam teks.
4. Prerequisites.
5. Environment variables.
6. Local development setup.
7. Database migration.
8. Seed data.
9. Running tests.
10. API docs.
11. Folder structure.
12. Known limitations.
13. Roadmap.

Sertakan contoh `.env.example`:

```env
APP_ENV=development
APP_PORT=8080
DATABASE_URL=postgres://moneymate:moneymate@localhost:5432/moneymate?sslmode=disable
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
COOKIE_SECURE=false
CORS_ALLOWED_ORIGINS=http://localhost:5173
BASE_CURRENCY=IDR
DEFAULT_TIMEZONE=Asia/Jakarta
```

---

## 23. UI Copy Bahasa Indonesia

Gunakan UI copy Bahasa Indonesia yang natural.

Examples:

- `Total Kekayaan Bersih`
- `Nilai Portfolio`
- `Total Cash`
- `Laba/Rugi`
- `Alokasi Aset`
- `Transaksi Terbaru`
- `Tambah Transaksi`
- `Update Harga Manual`
- `Import dari Spreadsheet`
- `Data bukan real-time`
- `Harga terakhir diperbarui`
- `Risiko Konsentrasi`
- `Saldo Cash Rendah`
- `Data Perlu Dilengkapi`
- `Simpan Perubahan`
- `Batalkan`
- `Hapus Data`

---

## 24. Design Details Per Component

### KPI Card

Setiap KPI card harus punya:

- Label.
- Value utama.
- Delta percent jika tersedia.
- Icon.
- Tooltip penjelasan.
- Skeleton loading.
- Error fallback.

### Data Table

Setiap table harus punya:

- Search.
- Filter.
- Sort.
- Pagination.
- Column alignment untuk angka ke kanan.
- Sticky header.
- Empty state.
- Row action menu.

### Form Drawer

Gunakan drawer kanan untuk add/edit agar workflow cepat.

Drawer fields:

- Label jelas.
- Inline validation.
- Save button disabled saat loading.
- Success toast.
- Error toast.

### Chart Cards

Chart harus punya:

- Title.
- Subtitle.
- Time range selector jika relevan.
- Empty state.
- Tooltip angka formatted.
- Legend yang readable.

---

## 25. Import Parser Requirements

Buat import parser yang robust.

### Supported Input MVP

- CSV
- XLSX

### Mapping Strategy

1. Detect section headers:
   - `INVESMENT`, `INVESTMENT`, `PORTFOLIO`, `HOLDINGS`
   - `ORDERS`, `TRANSACTIONS`
   - `CASH`
   - `ASSET`, `VALUE`, `TOTAL NET WORTH`
2. Normalize column names:
   - Lowercase.
   - Trim whitespace.
   - Remove duplicate spaces.
   - Map synonyms.
3. Validate required fields.
4. Return preview result before writing DB.
5. Store import job metadata.

### Preview Response

```json
{
  "success": true,
  "data": {
    "detected_sections": ["holdings", "orders", "cash", "asset_summary"],
    "rows": [
      {
        "section": "orders",
        "row_number": 8,
        "status": "valid",
        "normalized": {
          "date": "2026-04-02",
          "instrument": "Saham",
          "ticker": "BBRI",
          "type": "buy",
          "price": 3340,
          "units": 600,
          "total_value": 2004000,
          "currency": "IDR"
        },
        "errors": []
      }
    ]
  }
}
```

---

## 26. Financial Safety UX

Tambahkan footer atau info kecil:

```txt
MoneyMate membantu mencatat dan menganalisis data keuangan pribadi. Informasi di aplikasi ini bukan nasihat keuangan atau rekomendasi investasi.
```

Pada Insights page, tampilkan disclaimer lebih jelas:

```txt
Insight bersifat informatif berdasarkan data yang kamu masukkan. Validasi kembali sebelum mengambil keputusan finansial.
```

---

## 27. Deliverables

Saat selesai, berikan:

1. Source code lengkap.
2. README lengkap.
3. Docker Compose setup.
4. Database migrations.
5. Seed data.
6. OpenAPI spec.
7. Test suite minimal.
8. Screenshot atau deskripsi halaman utama.
9. Catatan known limitations.
10. Roadmap next phase.

---

## 28. Final Instruction To Coding Agent

Jangan hanya membuat mock UI. Buat aplikasi fullstack yang benar-benar berjalan secara lokal. Jika ada bagian eksternal yang belum bisa diintegrasikan, buat adapter interface dan fallback manual/mock yang jelas. Prioritaskan correctness calculation, struktur kode rapi, UI dashboard modern, dan keamanan dasar.

Mulai implementasi dari MVP. Gunakan defaults yang reasonable. Jangan menunggu klarifikasi kecuali benar-benar blocking. Pastikan semua command utama tersedia di README dan Makefile.

