package httpapi

import (
	"log/slog"
	"net/http"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/dashboard"
	httpmw "moneymate/backend/internal/httpapi/middleware"
	"moneymate/backend/internal/httpapi/response"
	"moneymate/backend/internal/importer"
	"moneymate/backend/internal/ledger"
	"moneymate/backend/internal/masterdata"
	"moneymate/backend/internal/portfolio"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(cfg config.Config, logger *slog.Logger, authService *auth.Service, db *pgxpool.Pool) http.Handler {
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

	masterHandler := masterdata.NewHandler(db)
	ledgerHandler := ledger.NewHandler(db)
	portfolioHandler := portfolio.NewHandler(db)
	dashboardHandler := dashboard.NewHandler(db, cfg)
	importHandler := importer.NewHandler(db)
	protected := chi.NewRouter()
	protected.Use(auth.RequireAuth(authService))
	protected.Mount("/dashboard", dashboardHandler.Routes())
	protected.Mount("/holdings", portfolioHandler.Routes())
	protected.Mount("/instruments", masterHandler.InstrumentRoutes())
	protected.Mount("/asset-categories", masterHandler.CategoryRoutes())
	protected.Mount("/cash-accounts", masterHandler.CashRoutes())
	protected.Mount("/transactions", ledgerHandler.TransactionRoutes())
	protected.Mount("/prices", ledgerHandler.PriceRoutes())
	protected.Mount("/audit-logs", masterHandler.AuditRoutes())
	protected.Mount("/imports", importHandler.Routes())
	chiRouter.Mount("/api/v1", protected)

	return chiRouter
}
