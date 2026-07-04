package dashboard

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/httpapi/response"
)

type Handler struct {
	db  *pgxpool.Pool
	cfg config.Config
}

func NewHandler(db *pgxpool.Pool, cfg config.Config) Handler {
	return Handler{db: db, cfg: cfg}
}

func (h Handler) Routes() chi.Router {
	router := chi.NewRouter()

	router.Get("/overview", h.overview)
	router.Get("/asset-allocation", h.assetAllocation)
	router.Get("/performance", h.performance)
	router.Get("/alerts", h.alerts)

	return router
}

type performer struct {
	Ticker            *string `json:"ticker,omitempty"`
	Name              string  `json:"name"`
	ProfitLossPercent float64 `json:"profit_loss_percent"`
}

func (h Handler) overview(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	var portfolioValue, totalCost, totalCash float64
	var lastUpdatedAt *time.Time
	if err := h.db.QueryRow(r.Context(), `
		SELECT COALESCE(SUM(current_value), 0)::float8,
		       COALESCE(SUM(total_cost), 0)::float8,
		       MAX(created_at)
		FROM holdings_snapshot
		WHERE user_id = $1
		  AND snapshot_date = (SELECT MAX(snapshot_date) FROM holdings_snapshot WHERE user_id = $1)
	`, user.ID).Scan(&portfolioValue, &totalCost, &lastUpdatedAt); err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat ringkasan portfolio"))
		return
	}

	if err := h.db.QueryRow(r.Context(), `SELECT COALESCE(SUM(balance), 0)::float8 FROM cash_accounts WHERE user_id = $1 AND is_active = TRUE`, user.ID).Scan(&totalCash); err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat ringkasan cash"))
		return
	}

	best, _ := h.loadPerformer(r, "DESC")
	worst, _ := h.loadPerformer(r, "ASC")
	profitLoss := portfolioValue - totalCost
	profitLossPercent := 0.0
	if totalCost > 0 {
		profitLossPercent = profitLoss / totalCost
	}

	response.JSON(w, r, http.StatusOK, map[string]any{
		"base_currency":         h.cfg.BaseCurrency,
		"total_net_worth":       portfolioValue + totalCash,
		"total_portfolio_value": portfolioValue,
		"total_cash":            totalCash,
		"total_cost":            totalCost,
		"profit_loss_value":     profitLoss,
		"profit_loss_percent":   profitLossPercent,
		"best_performer":        best,
		"worst_performer":       worst,
		"last_updated_at":       lastUpdatedAt,
		"price_disclaimer":      "Data bukan real-time. Harga berasal dari input manual/mock.",
		"financial_disclaimer":  "Informasi ini bersifat pencatatan dan analisis, bukan nasihat investasi.",
	}, nil)
}

func (h Handler) assetAllocation(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	rows, err := h.db.Query(r.Context(), `
		WITH latest AS (
			SELECT *
			FROM holdings_snapshot
			WHERE user_id = $1
			  AND snapshot_date = (SELECT MAX(snapshot_date) FROM holdings_snapshot WHERE user_id = $1)
		),
		portfolio_alloc AS (
			SELECT COALESCE(ac.name, i.type) AS asset, COALESCE(SUM(latest.current_value), 0)::float8 AS value
			FROM latest
			JOIN instruments i ON i.id = latest.instrument_id
			LEFT JOIN instrument_categories ic ON ic.instrument_id = i.id
			LEFT JOIN asset_categories ac ON ac.id = ic.category_id
			GROUP BY COALESCE(ac.name, i.type)
		),
		cash_alloc AS (
			SELECT 'Cash' AS asset, COALESCE(SUM(balance), 0)::float8 AS value
			FROM cash_accounts
			WHERE user_id = $1 AND is_active = TRUE
		),
		combined AS (
			SELECT * FROM portfolio_alloc
			UNION ALL
			SELECT * FROM cash_alloc
		),
		total AS (
			SELECT COALESCE(SUM(value), 0)::float8 AS value FROM combined
		)
		SELECT combined.asset, combined.value, CASE WHEN total.value > 0 THEN combined.value / total.value ELSE 0 END AS percent
		FROM combined, total
		WHERE combined.value > 0
		ORDER BY combined.value DESC
	`, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat alokasi aset"))
		return
	}
	defer rows.Close()

	items := []map[string]any{}
	for rows.Next() {
		var asset string
		var value, percent float64
		if err := rows.Scan(&asset, &value, &percent); err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca alokasi aset"))
			return
		}
		items = append(items, map[string]any{"asset": asset, "value": value, "percent": percent})
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) performance(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	rows, err := h.db.Query(r.Context(), `
		SELECT i.ticker, i.name, hs.total_cost::float8, hs.current_value::float8,
		       hs.profit_loss_value::float8, hs.profit_loss_percent::float8
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = (SELECT MAX(snapshot_date) FROM holdings_snapshot WHERE user_id = $1)
		ORDER BY hs.profit_loss_value DESC
	`, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat performa portfolio"))
		return
	}
	defer rows.Close()

	items := []map[string]any{}
	for rows.Next() {
		var ticker *string
		var name string
		var totalCost, currentValue, plValue, plPercent float64
		if err := rows.Scan(&ticker, &name, &totalCost, &currentValue, &plValue, &plPercent); err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca performa portfolio"))
			return
		}
		items = append(items, map[string]any{
			"ticker": ticker, "name": name, "total_cost": totalCost,
			"current_value": currentValue, "profit_loss_value": plValue,
			"profit_loss_percent": plPercent,
		})
	}

	response.JSON(w, r, http.StatusOK, map[string]any{
		"items":      items,
		"disclaimer": "Ringkasan performa bersifat informatif dan bukan rekomendasi beli/jual.",
	}, nil)
}

func (h Handler) alerts(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	alerts := []map[string]any{}
	rows, err := h.db.Query(r.Context(), `
		SELECT i.ticker, i.name, hs.current_value::float8, hs.profit_loss_percent::float8, hs.warnings
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = (SELECT MAX(snapshot_date) FROM holdings_snapshot WHERE user_id = $1)
	`, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat alert"))
		return
	}
	defer rows.Close()

	totalPortfolio := 0.0
	type holding struct {
		ticker *string
		name   string
		value  float64
		plPct  float64
		warns  []string
	}
	holdings := []holding{}
	for rows.Next() {
		var item holding
		var warningsBytes []byte
		if err := rows.Scan(&item.ticker, &item.name, &item.value, &item.plPct, &warningsBytes); err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca alert"))
			return
		}
		_ = json.Unmarshal(warningsBytes, &item.warns)
		holdings = append(holdings, item)
		totalPortfolio += item.value
	}

	for _, item := range holdings {
		if item.plPct < 0 {
			alerts = append(alerts, alert("negative_pl", "Laba/Rugi Negatif", item.name+" sedang bernilai negatif terhadap modal.", "warning"))
		}
		if totalPortfolio > 0 && item.value/totalPortfolio > 0.5 {
			alerts = append(alerts, alert("concentration", "Risiko Konsentrasi", item.name+" lebih dari 50% nilai portfolio.", "warning"))
		}
		for _, warning := range item.warns {
			alerts = append(alerts, alert("data_quality", "Data Perlu Dilengkapi", item.name+": "+warning, "info"))
		}
	}

	var totalCash, netWorth float64
	_ = h.db.QueryRow(r.Context(), `SELECT COALESCE(SUM(balance), 0)::float8 FROM cash_accounts WHERE user_id = $1 AND is_active = TRUE`, user.ID).Scan(&totalCash)
	netWorth = totalCash + totalPortfolio
	if netWorth > 0 && totalCash/netWorth < 0.05 {
		alerts = append(alerts, alert("low_cash", "Saldo Cash Rendah", "Cash kurang dari 5% total kekayaan bersih.", "warning"))
	}

	response.JSON(w, r, http.StatusOK, alerts, nil)
}

func (h Handler) loadPerformer(r *http.Request, direction string) (*performer, error) {
	user, _ := auth.UserFromContext(r.Context())
	query := `
		SELECT i.ticker, i.name, hs.profit_loss_percent::float8
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = (SELECT MAX(snapshot_date) FROM holdings_snapshot WHERE user_id = $1)
		ORDER BY hs.profit_loss_percent ` + direction + `
		LIMIT 1
	`

	var item performer
	if err := h.db.QueryRow(r.Context(), query, user.ID).Scan(&item.Ticker, &item.Name, &item.ProfitLossPercent); err != nil {
		return nil, err
	}
	return &item, nil
}

func alert(code string, title string, message string, severity string) map[string]any {
	return map[string]any{
		"code":     code,
		"title":    title,
		"message":  message,
		"severity": severity,
	}
}

func internalErr(err error, message string) error {
	return apperror.Wrap(err, apperror.CodeInternal, message, http.StatusInternalServerError)
}
