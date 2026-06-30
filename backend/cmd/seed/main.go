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
