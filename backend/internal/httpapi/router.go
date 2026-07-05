package httpapi

import (
	"log/slog"
	"net/http"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	adminapi "moneymate/backend/internal/admin"
	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/budget"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/dashboard"
	httpmw "moneymate/backend/internal/httpapi/middleware"
	"moneymate/backend/internal/httpapi/response"
	"moneymate/backend/internal/importer"
	"moneymate/backend/internal/ledger"
	"moneymate/backend/internal/masterdata"
	"moneymate/backend/internal/portfolio"
	"moneymate/backend/internal/reports"
	"moneymate/backend/internal/savings"
	"moneymate/backend/internal/notifications"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(cfg config.Config, logger *slog.Logger, authService *auth.Service, db *pgxpool.Pool) http.Handler {
	chiRouter := httpmw.NewChiRouter()
	chiRouter.Use(chimiddleware.RequestID)
	chiRouter.Use(chimiddleware.RealIP)
	chiRouter.Use(httpmw.Recoverer(logger))
	chiRouter.Use(httpmw.RequestLogger(logger))
	chiRouter.Use(httpmw.SecurityHeaders)
	chiRouter.Use(httpmw.MaxBytes(1048576)) // Batas maksimum payload 1 MB
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
	reportHandler := reports.NewHandler(db, cfg)
	budgetHandler := budget.NewHandler(db)
	savingsHandler := savings.NewHandler(db)
	adminHandler := adminapi.NewHandler(db)
	notificationsHandler := notifications.NewHandler(db)
	protected := chi.NewRouter()
	protected.Use(auth.RequireAuth(authService))
	mountUserRoutes(protected, masterHandler, ledgerHandler, portfolioHandler, dashboardHandler, importHandler, reportHandler, budgetHandler, savingsHandler, notificationsHandler)
	mountAdminRoutes(protected, masterHandler, adminHandler)
	chiRouter.Mount("/api/v1", protected)

	return chiRouter
}

func mountUserRoutes(
	router chi.Router,
	masterHandler masterdata.Handler,
	ledgerHandler ledger.Handler,
	portfolioHandler portfolio.Handler,
	dashboardHandler dashboard.Handler,
	importHandler importer.Handler,
	reportHandler reports.Handler,
	budgetHandler budget.Handler,
	savingsHandler savings.Handler,
	notificationsHandler notifications.Handler,
) {
	router.Mount("/dashboard", dashboardHandler.Routes())
	router.Mount("/holdings", portfolioHandler.Routes())
	router.Mount("/instruments", masterHandler.InstrumentRoutes())
	router.Mount("/asset-categories", masterHandler.CategoryRoutes())
	router.Mount("/transaction-categories", masterHandler.TransactionCategoryRoutes())
	router.Mount("/cash-accounts", masterHandler.CashRoutes())
	router.Mount("/transactions", ledgerHandler.TransactionRoutes())
	router.Mount("/prices", ledgerHandler.PriceRoutes())
	router.Mount("/imports", importHandler.Routes())
	router.Mount("/reports", reportHandler.Routes())
	router.Mount("/budgets", budgetHandler.Routes())
	router.Mount("/savings-goals", savingsHandler.Routes())
	router.Mount("/notifications", notificationsHandler.Routes())
}

func mountAdminRoutes(router chi.Router, masterHandler masterdata.Handler, adminHandler adminapi.Handler) {
	router.Group(func(admin chi.Router) {
		admin.Use(auth.RequireAdmin())
		admin.Mount("/admin", adminHandler.Routes())
		admin.Mount("/audit-logs", masterHandler.AuditRoutes())
		admin.Mount("/admin/audit-logs", masterHandler.AuditRoutes())
	})
}
