package portfolio

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/domain"
	"moneymate/backend/internal/httpapi/response"
)

type Handler struct {
	db      *pgxpool.Pool
	service Service
}

func NewHandler(db *pgxpool.Pool) Handler {
	return Handler{db: db, service: NewService(db)}
}

func (h Handler) Routes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", h.listHoldings)
	router.Post("/recalculate", auth.RequireRoles("owner", "admin")(http.HandlerFunc(h.recalculate)).ServeHTTP)

	return router
}

func (h Handler) listHoldings(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `
		SELECT hs.id::text, hs.snapshot_date, hs.instrument_id::text, i.type, i.ticker, i.name,
		       hs.average_price::float8, hs.current_price::float8, hs.units::float8,
		       hs.total_cost::float8, hs.current_value::float8, hs.profit_loss_value::float8,
		       hs.profit_loss_percent::float8, hs.currency, hs.price_source, hs.price_updated_at,
		       hs.warnings, hs.created_at
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.snapshot_date = COALESCE(NULLIF($1, '')::date, (SELECT MAX(snapshot_date) FROM holdings_snapshot))
		ORDER BY hs.current_value DESC
	`, strings.TrimSpace(r.URL.Query().Get("date")))
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Gagal memuat holdings", http.StatusInternalServerError))
		return
	}
	defer rows.Close()

	items := []domain.HoldingSnapshot{}
	for rows.Next() {
		var item domain.HoldingSnapshot
		var warningsBytes []byte
		if err := rows.Scan(
			&item.ID, &item.SnapshotDate, &item.InstrumentID, &item.InstrumentType, &item.Ticker, &item.Name,
			&item.AveragePrice, &item.CurrentPrice, &item.Units, &item.TotalCost, &item.CurrentValue,
			&item.ProfitLossValue, &item.ProfitLossPercent, &item.Currency, &item.PriceSource,
			&item.PriceUpdatedAt, &warningsBytes, &item.CreatedAt,
		); err != nil {
			response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Gagal membaca holdings", http.StatusInternalServerError))
			return
		}
		item.Warnings = decodeWarnings(warningsBytes)
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) recalculate(w http.ResponseWriter, r *http.Request) {
	snapshotDate := time.Now()
	if rawDate := strings.TrimSpace(r.URL.Query().Get("date")); rawDate != "" {
		parsed, err := time.Parse("2006-01-02", rawDate)
		if err != nil {
			response.Error(w, r, apperror.New(apperror.CodeValidation, "Tanggal snapshot harus format YYYY-MM-DD", http.StatusBadRequest))
			return
		}
		snapshotDate = parsed
	}

	holdings, err := h.service.Recalculate(r.Context(), snapshotDate)
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Gagal menghitung holdings", http.StatusInternalServerError))
		return
	}

	response.JSON(w, r, http.StatusOK, map[string]any{
		"snapshot_date": snapshotDate.Format("2006-01-02"),
		"count":         len(holdings),
		"message":       "Holdings berhasil dihitung ulang",
	}, nil)
}

func decodeWarnings(bytes []byte) []string {
	if len(bytes) == 0 {
		return nil
	}
	var warnings []string
	if err := json.Unmarshal(bytes, &warnings); err != nil {
		return nil
	}
	return warnings
}
