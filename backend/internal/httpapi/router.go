package httpapi

import (
	"log/slog"
	"net/http"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
	httpmw "moneymate/backend/internal/httpapi/middleware"
	"moneymate/backend/internal/httpapi/response"
)

func NewRouter(cfg config.Config, logger *slog.Logger, authService *auth.Service) http.Handler {
	chiRouter := httpmw.NewChiRouter()
	chiRouter.Use(chimiddleware.RequestID)
	chiRouter.Use(chimiddleware.RealIP)
	chiRouter.Use(httpmw.Recoverer(logger))
	chiRouter.Use(httpmw.RequestLogger(logger))
	chiRouter.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Request-ID"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	chiRouter.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, r, http.StatusOK, map[string]string{
			"status":      "ok",
			"service":     "moneymate-backend",
			"environment": cfg.Environment,
		}, nil)
	})
	chiRouter.Mount("/api/v1/auth", auth.NewHandler(authService, cfg).Routes())

	return chiRouter
}
