package main

import (
	"log/slog"
	"net/http"
	"os"

	"moneymate/backend/internal/config"
	"moneymate/backend/internal/httpapi"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: httpapi.NewRouter(cfg, logger),
	}

	logger.Info("starting MoneyMate API", "addr", server.Addr, "env", cfg.Environment)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("api server stopped", "error", err)
		os.Exit(1)
	}
}
