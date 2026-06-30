package main

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"time"

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

	logger.Info("seed owner complete", "email", email)
}
