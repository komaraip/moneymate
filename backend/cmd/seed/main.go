package main

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/database"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg)
	if err != nil {
		logger.Error("database connection failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	email := strings.TrimSpace(strings.ToLower(cfg.SeedOwnerEmail))
	password := cfg.SeedOwnerPassword
	fullName := strings.TrimSpace(cfg.SeedOwnerName)

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		logger.Error("password hash failed", "error", err)
		os.Exit(1)
	}

	_, err = db.Exec(ctx, `
		INSERT INTO users (email, full_name, password_hash, role)
		VALUES ($1, $2, $3, 'owner')
		ON CONFLICT (email) DO UPDATE
		SET full_name = EXCLUDED.full_name,
		    password_hash = EXCLUDED.password_hash,
		    role = 'owner',
		    is_active = TRUE,
		    updated_at = now()
	`, email, fullName, passwordHash)
	if err != nil {
		logger.Error("seed owner failed", "error", err)
		os.Exit(1)
	}

	if err := seedMasterData(ctx, db); err != nil {
		logger.Error("seed master data failed", "error", err)
		os.Exit(1)
	}
	if err := seedTransactionsAndPrices(ctx, db); err != nil {
		logger.Error("seed transactions and prices failed", "error", err)
		os.Exit(1)
	}

	logger.Info("seed owner complete", "email", email)
}

func seedMasterData(ctx context.Context, db *pgxpool.Pool) error {
	categories := []struct {
		name      string
		colorKey  string
		sortOrder int
	}{
		{"Emas", "gold", 10},
		{"Reksadana", "mutual_fund", 20},
		{"Saham", "stock", 30},
		{"ETF", "etf", 40},
		{"Cash", "cash", 50},
	}

	for _, category := range categories {
		if _, err := db.Exec(ctx, `
			INSERT INTO asset_categories (name, color_key, sort_order)
			VALUES ($1, $2, $3)
			ON CONFLICT (name) DO UPDATE
			SET color_key = EXCLUDED.color_key,
			    sort_order = EXCLUDED.sort_order
		`, category.name, category.colorKey, category.sortOrder); err != nil {
			return err
		}
	}

	instruments := []struct {
		kind     string
		ticker   *string
		name     string
		provider string
		currency string
		category string
	}{
		{"gold", nil, "Pegadaian", "Pegadaian", "IDR", "Emas"},
		{"mutual_fund", nil, "Sucorinvest Stable Fund", "Sucorinvest", "IDR", "Reksadana"},
		{"stock", ptr("BBRI"), "Bank Rakyat Indonesia", "IDX", "IDR", "Saham"},
		{"etf", ptr("SPY"), "S&P 500 ETF", "Manual", "USD", "ETF"},
	}

	for _, instrument := range instruments {
		if _, err := db.Exec(ctx, `
			WITH existing AS (
				SELECT id
				FROM instruments
				WHERE type = $1
				  AND COALESCE(ticker, '') = COALESCE($2, '')
				  AND name = $3
			),
			inserted AS (
				INSERT INTO instruments (type, ticker, name, provider, currency)
				SELECT $1, $2, $3, $4, $5
				WHERE NOT EXISTS (SELECT 1 FROM existing)
				RETURNING id
			),
			target AS (
				SELECT id FROM inserted
				UNION ALL
				SELECT id FROM existing
			)
			INSERT INTO instrument_categories (instrument_id, category_id)
			SELECT target.id, asset_categories.id
			FROM target
			JOIN asset_categories ON asset_categories.name = $6
			ON CONFLICT DO NOTHING
		`, instrument.kind, instrument.ticker, instrument.name, instrument.provider, instrument.currency, instrument.category); err != nil {
			return err
		}
	}

	cashAccounts := []struct {
		name    string
		balance float64
	}{
		{"BRI", 0},
		{"Seabank", 151859},
		{"Gopay", 4031},
	}

	for _, account := range cashAccounts {
		if _, err := db.Exec(ctx, `
			INSERT INTO cash_accounts (account_name, account_type, currency, balance)
			SELECT $1, 'bank', 'IDR', $2
			WHERE NOT EXISTS (
				SELECT 1 FROM cash_accounts WHERE account_name = $1 AND currency = 'IDR'
			)
		`, account.name, account.balance); err != nil {
			return err
		}
	}

	return nil
}

func ptr(value string) *string {
	return &value
}

func seedTransactionsAndPrices(ctx context.Context, db *pgxpool.Pool) error {
	transactions := []struct {
		date     string
		kind     string
		ticker   *string
		name     string
		txType   string
		price    float64
		units    float64
		netValue float64
		currency string
		fxRate   *float64
	}{
		{"2026-04-02", "stock", ptr("BBRI"), "Bank Rakyat Indonesia", "buy", 3340, 600, 2004000, "IDR", nil},
		{"2026-04-13", "stock", ptr("BBRI"), "Bank Rakyat Indonesia", "buy", 3390, 400, 1356000, "IDR", nil},
		{"2026-05-07", "stock", ptr("BBRI"), "Bank Rakyat Indonesia", "buy", 3260, 200, 652000, "IDR", nil},
		{"2026-06-10", "etf", ptr("SPY"), "S&P 500 ETF", "buy", 733.33, 0.075204887, 989198.6274, "USD", ptrFloat(17933.4939)},
		{"2026-06-10", "gold", nil, "Pegadaian", "buy", 2607000, 0.382, 995874, "IDR", nil},
		{"2026-06-10", "stock", ptr("BBRI"), "Bank Rakyat Indonesia", "buy", 2880, 300, 864000, "IDR", nil},
		{"2026-06-12", "mutual_fund", nil, "Sucorinvest Stable Fund", "buy", 1447.07, 3424.1605, 4954999.935, "IDR", nil},
		{"2026-06-25", "etf", ptr("SPY"), "S&P 500 ETF", "buy", 735.72, 0.037418923, 493789.4827, "USD", ptrFloat(17935.0305)},
		{"2026-06-25", "gold", nil, "Pegadaian", "buy", 2531000, 0.2964, 750188.4, "IDR", nil},
		{"2026-06-26", "stock", ptr("BBRI"), "Bank Rakyat Indonesia", "buy", 2860, 200, 572000, "IDR", nil},
		{"2026-06-29", "mutual_fund", nil, "Sucorinvest Stable Fund", "buy", 1451.24, 516.7994, 749999.9613, "IDR", nil},
	}

	for _, tx := range transactions {
		if _, err := db.Exec(ctx, `
			INSERT INTO transactions (instrument_id, transaction_date, type, price, units, gross_value, net_value, currency, fx_rate_to_idr, source)
			SELECT i.id, $4::date, $5, $6, $7, $8, $8, $9, $10, 'manual_seed'
			FROM instruments i
			WHERE i.type = $1
			  AND COALESCE(i.ticker, '') = COALESCE($2, '')
			  AND i.name = $3
			  AND NOT EXISTS (
				  SELECT 1
				  FROM transactions t
				  WHERE t.instrument_id = i.id
				    AND t.transaction_date = $4::date
				    AND t.type = $5
				    AND t.price = $6
				    AND t.units = $7
			  )
		`, tx.kind, tx.ticker, tx.name, tx.date, tx.txType, tx.price, tx.units, tx.netValue, tx.currency, tx.fxRate); err != nil {
			return err
		}
	}

	prices := []struct {
		kind     string
		ticker   *string
		name     string
		price    float64
		currency string
	}{
		{"gold", nil, "Pegadaian", 2397000, "IDR"},
		{"mutual_fund", nil, "Sucorinvest Stable Fund", 1452.08, "IDR"},
		{"stock", ptr("BBRI"), "Bank Rakyat Indonesia", 2730, "IDR"},
		{"etf", ptr("SPY"), "S&P 500 ETF", 735.72, "USD"},
	}

	for _, price := range prices {
		if _, err := db.Exec(ctx, `
			INSERT INTO price_snapshots (instrument_id, price_date, price, currency, source, is_realtime)
			SELECT i.id, DATE '2026-06-30', $4, $5, 'manual', FALSE
			FROM instruments i
			WHERE i.type = $1
			  AND COALESCE(i.ticker, '') = COALESCE($2, '')
			  AND i.name = $3
			ON CONFLICT (instrument_id, price_date, source) DO UPDATE
			SET price = EXCLUDED.price,
			    currency = EXCLUDED.currency,
			    is_realtime = FALSE
		`, price.kind, price.ticker, price.name, price.price, price.currency); err != nil {
			return err
		}
	}

	return nil
}

func ptrFloat(value float64) *float64 {
	return &value
}
