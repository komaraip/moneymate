package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/database"
	"moneymate/backend/internal/httpapi"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, cfg)
	if err != nil {
		logger.Error("database connection failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	authService := auth.NewService(db, cfg)

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: httpapi.NewRouter(cfg, logger, authService),
	}

	logger.Info("starting MoneyMate API", "addr", server.Addr, "env", cfg.Environment)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("api server stopped", "error", err)
		os.Exit(1)
	}
}
