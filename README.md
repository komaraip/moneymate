# MoneyMate Personal Finance

MoneyMate adalah aplikasi web personal finance untuk user individu. Fokus saat ini:

- income, expense, transfer, dan cashflow
- akun/wallet dan saldo kas
- portofolio/net worth dengan harga manual/mock
- anggaran bulanan
- tujuan tabungan
- laporan personal
- admin metadata pengguna tanpa membuka data finansial privat user lain

Harga dan nilai portofolio di MVP ini bersifat manual/mock, bukan real-time. Aplikasi tidak memberikan rekomendasi beli/jual.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query.
- Backend: Go, chi router, slog, PostgreSQL via pgx.
- Database: PostgreSQL.

## Environment

Buat file `.env` lokal dari contoh:

```powershell
Copy-Item .env.example .env
```

## Menjalankan Lokal

Repository ini hanya menyertakan source aplikasi inti. Jalankan service dengan tool lokal.

Terminal backend:

```powershell
cd backend
go run ./cmd/migrate
go run ./cmd/seed
go run ./cmd/api
```

Terminal frontend:

```powershell
cd frontend
npm install
npx vite --host 0.0.0.0
```

Open:

```txt
Frontend: http://localhost:5173
Backend health: http://localhost:8080/healthz
```

## Build Lokal

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

## Routes Utama

```txt
/                       Ringkasan
/transactions           Transaksi
/accounts               Akun & Wallet
/budgets                Anggaran
/savings-goals          Tujuan Tabungan
/reports                Laporan
/assets/portfolio       Portofolio
/assets/instruments     Instrumen
/imports                Impor Data
/admin                  Admin Dashboard
/admin/users            Pengguna
/admin/audit-log        Log Audit
/settings               Pengaturan
```

Route lama seperti `/orders`, `/cash`, `/portfolio`, `/instruments`, `/import-data`, dan `/audit-log` masih redirect ke route baru untuk kompatibilitas lokal.

## Catatan Produk

- Role final hanya `admin` dan `user`.
- Data finansial user-owned harus user-scoped.
- Admin hanya melihat metadata pengguna dan audit log. Admin tidak membaca transaksi, kas, portofolio, anggaran, atau tujuan tabungan user lain secara default.
- Realized P/L, FIFO, TWR, MWR, tax-lot accounting, real market data, dan workflow production tidak termasuk scope saat ini.

## API

Kontrak API ada di:

```txt
docs/api/openapi.yaml
```

Generated frontend type saat ini tersimpan di:

```txt
frontend/src/lib/generated/openapi.d.ts
```
