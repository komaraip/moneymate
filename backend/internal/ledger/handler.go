package ledger

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/audit"
	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/domain"
	"moneymate/backend/internal/httpapi/response"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) Handler {
	return Handler{db: db}
}

func (h Handler) TransactionRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", h.listTransactions)
	router.Post("/", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.createTransaction)).ServeHTTP)
	router.Get("/{id}", h.getTransaction)
	router.Put("/{id}", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.updateTransaction)).ServeHTTP)
	router.Delete("/{id}", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.deleteTransaction)).ServeHTTP)

	return router
}

func (h Handler) PriceRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", h.listPrices)
	router.Post("/manual", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.createManualPrice)).ServeHTTP)
	router.Post("/bulk-manual", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.createBulkManualPrices)).ServeHTTP)

	return router
}

type transactionInput struct {
	InstrumentID    *string  `json:"instrument_id"`
	TransactionDate string   `json:"transaction_date"`
	Type            string   `json:"type"`
	Price           float64  `json:"price"`
	Units           float64  `json:"units"`
	GrossValue      *float64 `json:"gross_value"`
	Fees            float64  `json:"fees"`
	Tax             float64  `json:"tax"`
	NetValue        *float64 `json:"net_value"`
	Currency        string   `json:"currency"`
	FXRateToIDR     *float64 `json:"fx_rate_to_idr"`
	Notes           *string  `json:"notes"`
}

type manualPriceInput struct {
	InstrumentID string   `json:"instrument_id"`
	PriceDate    string   `json:"price_date"`
	Price        float64  `json:"price"`
	Currency     string   `json:"currency"`
	FXRateToIDR  *float64 `json:"fx_rate_to_idr"`
}

type bulkManualPriceInput struct {
	Prices []manualPriceInput `json:"prices"`
}

func (h Handler) listTransactions(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	rows, err := h.db.Query(r.Context(), `
		SELECT t.id::text, t.instrument_id::text, i.name, i.ticker, t.transaction_date, t.type,
		       t.price::float8, t.units::float8, t.gross_value::float8, t.fees::float8,
		       t.tax::float8, t.net_value::float8, t.currency, t.fx_rate_to_idr::float8,
		       t.notes, t.source, t.created_by::text, t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		WHERE t.user_id = $1
		  AND ($2 = '' OR t.type = $2)
		  AND ($3 = '' OR t.instrument_id::text = $3)
		ORDER BY t.transaction_date DESC, t.created_at DESC
		LIMIT 200
	`, user.ID, strings.TrimSpace(r.URL.Query().Get("type")), strings.TrimSpace(r.URL.Query().Get("instrument_id")))
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat transaksi"))
		return
	}
	defer rows.Close()

	items := []domain.Transaction{}
	for rows.Next() {
		item, err := scanTransaction(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca transaksi"))
			return
		}
		items = append(items, addTransactionWarnings(item))
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) getTransaction(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}

	user, _ := auth.UserFromContext(r.Context())
	item, err := h.getTransactionByID(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Transaksi tidak ditemukan"))
		return
	}

	response.JSON(w, r, http.StatusOK, addTransactionWarnings(item), nil)
}

func (h Handler) createTransaction(w http.ResponseWriter, r *http.Request) {
	var input transactionInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	normalized, err := normalizeTransaction(input)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	user, _ := auth.UserFromContext(r.Context())
	var item domain.Transaction
	err = h.db.QueryRow(r.Context(), `
		INSERT INTO transactions (user_id, instrument_id, transaction_date, type, price, units, gross_value, fees, tax, net_value, currency, fx_rate_to_idr, notes, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $1)
		RETURNING id::text, instrument_id::text, NULL::text, NULL::text, transaction_date, type, price::float8, units::float8, gross_value::float8,
		          fees::float8, tax::float8, net_value::float8, currency, fx_rate_to_idr::float8, notes, source, created_by::text, created_at, updated_at
	`, user.ID, normalized.InstrumentID, normalized.TransactionDate, normalized.Type, normalized.Price, normalized.Units, normalized.GrossValue, normalized.Fees, normalized.Tax, normalized.NetValue, normalized.Currency, normalized.FXRateToIDR, cleanPtr(normalized.Notes)).Scan(
		&item.ID, &item.InstrumentID, &item.InstrumentName, &item.InstrumentTicker, &item.TransactionDate, &item.Type, &item.Price, &item.Units, &item.GrossValue, &item.Fees, &item.Tax, &item.NetValue, &item.Currency, &item.FXRateToIDR, &item.Notes, &item.Source, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal membuat transaksi"))
		return
	}

	h.writeAudit(r, "create", "transaction", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, addTransactionWarnings(item), nil)
}

func (h Handler) updateTransaction(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getTransactionByID(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Transaksi tidak ditemukan"))
		return
	}

	var input transactionInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	normalized, err := normalizeTransaction(input)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	var item domain.Transaction
	err = h.db.QueryRow(r.Context(), `
		UPDATE transactions
		SET instrument_id = $2, transaction_date = $3, type = $4, price = $5, units = $6,
		    gross_value = $7, fees = $8, tax = $9, net_value = $10, currency = $11,
		    fx_rate_to_idr = $12, notes = $13, updated_at = now()
		WHERE id = $1 AND user_id = $14
		RETURNING id::text, instrument_id::text, NULL::text, NULL::text, transaction_date, type, price::float8, units::float8, gross_value::float8,
		          fees::float8, tax::float8, net_value::float8, currency, fx_rate_to_idr::float8, notes, source, created_by::text, created_at, updated_at
	`, id, normalized.InstrumentID, normalized.TransactionDate, normalized.Type, normalized.Price, normalized.Units, normalized.GrossValue, normalized.Fees, normalized.Tax, normalized.NetValue, normalized.Currency, normalized.FXRateToIDR, cleanPtr(normalized.Notes), user.ID).Scan(
		&item.ID, &item.InstrumentID, &item.InstrumentName, &item.InstrumentTicker, &item.TransactionDate, &item.Type, &item.Price, &item.Units, &item.GrossValue, &item.Fees, &item.Tax, &item.NetValue, &item.Currency, &item.FXRateToIDR, &item.Notes, &item.Source, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal mengubah transaksi"))
		return
	}

	h.writeAudit(r, "update", "transaction", item.ID, before, item)
	response.JSON(w, r, http.StatusOK, addTransactionWarnings(item), nil)
}

func (h Handler) deleteTransaction(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getTransactionByID(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Transaksi tidak ditemukan"))
		return
	}

	if _, err := h.db.Exec(r.Context(), `DELETE FROM transactions WHERE id = $1 AND user_id = $2`, id, user.ID); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menghapus transaksi"))
		return
	}

	h.writeAudit(r, "delete", "transaction", id, before, nil)
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "deleted"}, nil)
}

func (h Handler) listPrices(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	instrumentID := strings.TrimSpace(r.URL.Query().Get("instrument_id"))
	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, instrument_id::text, price_date, price::float8, currency, fx_rate_to_idr::float8, source, is_realtime, created_at
		FROM price_snapshots
		WHERE user_id = $1
		  AND ($2 = '' OR instrument_id::text = $2)
		ORDER BY price_date DESC, created_at DESC
		LIMIT 200
	`, user.ID, instrumentID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat harga"))
		return
	}
	defer rows.Close()

	items := []domain.PriceSnapshot{}
	for rows.Next() {
		item, err := scanPrice(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca harga"))
			return
		}
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, map[string]any{
		"items":            items,
		"price_disclaimer": "Data bukan real-time. Semua harga MVP berasal dari input manual/mock.",
	}, nil)
}

func (h Handler) createManualPrice(w http.ResponseWriter, r *http.Request) {
	var input manualPriceInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}

	user, _ := auth.UserFromContext(r.Context())
	item, err := h.insertManualPrice(r.Context(), user.ID, input)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	h.writeAudit(r, "create", "price_snapshot", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, map[string]any{
		"price":            item,
		"price_disclaimer": "Data bukan real-time. Harga disimpan sebagai harga manual.",
	}, nil)
}

func (h Handler) createBulkManualPrices(w http.ResponseWriter, r *http.Request) {
	var input bulkManualPriceInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if len(input.Prices) == 0 {
		response.Error(w, r, validation("Minimal satu harga wajib diisi"))
		return
	}

	items := []domain.PriceSnapshot{}
	for _, priceInput := range input.Prices {
		user, _ := auth.UserFromContext(r.Context())
		item, err := h.insertManualPrice(r.Context(), user.ID, priceInput)
		if err != nil {
			response.Error(w, r, err)
			return
		}
		h.writeAudit(r, "create", "price_snapshot", item.ID, nil, item)
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusCreated, map[string]any{
		"items":            items,
		"price_disclaimer": "Data bukan real-time. Harga disimpan sebagai harga manual.",
	}, nil)
}

func (h Handler) insertManualPrice(ctx context.Context, userID string, input manualPriceInput) (domain.PriceSnapshot, error) {
	if _, err := uuid.Parse(strings.TrimSpace(input.InstrumentID)); err != nil {
		return domain.PriceSnapshot{}, validation("Instrument ID tidak valid")
	}
	if input.Price <= 0 {
		return domain.PriceSnapshot{}, validation("Harga wajib lebih dari 0")
	}
	if strings.TrimSpace(input.Currency) == "" {
		return domain.PriceSnapshot{}, validation("Currency wajib diisi")
	}

	priceDate := time.Now()
	if strings.TrimSpace(input.PriceDate) != "" {
		parsed, err := time.Parse("2006-01-02", input.PriceDate)
		if err != nil {
			return domain.PriceSnapshot{}, validation("Tanggal harga harus format YYYY-MM-DD")
		}
		priceDate = parsed
	}

	var item domain.PriceSnapshot
	err := h.db.QueryRow(ctx, `
		INSERT INTO price_snapshots (user_id, instrument_id, price_date, price, currency, fx_rate_to_idr, source, is_realtime)
		VALUES ($1, $2, $3, $4, $5, $6, 'manual', FALSE)
		ON CONFLICT (user_id, instrument_id, price_date, source) DO UPDATE
		SET price = EXCLUDED.price,
		    currency = EXCLUDED.currency,
		    fx_rate_to_idr = EXCLUDED.fx_rate_to_idr,
		    is_realtime = FALSE,
		    created_at = now()
		RETURNING id::text, instrument_id::text, price_date, price::float8, currency, fx_rate_to_idr::float8, source, is_realtime, created_at
	`, userID, input.InstrumentID, priceDate.Format("2006-01-02"), input.Price, strings.ToUpper(input.Currency), input.FXRateToIDR).Scan(
		&item.ID, &item.InstrumentID, &item.PriceDate, &item.Price, &item.Currency, &item.FXRateToIDR, &item.Source, &item.IsRealtime, &item.CreatedAt,
	)
	if err != nil {
		return domain.PriceSnapshot{}, internalErr(err, "Gagal menyimpan harga manual")
	}

	return item, nil
}

type normalizedTransaction struct {
	InstrumentID    *string
	TransactionDate time.Time
	Type            string
	Price           float64
	Units           float64
	GrossValue      float64
	Fees            float64
	Tax             float64
	NetValue        float64
	Currency        string
	FXRateToIDR     *float64
	Notes           *string
}

func normalizeTransaction(input transactionInput) (normalizedTransaction, error) {
	transactionDate, err := time.Parse("2006-01-02", input.TransactionDate)
	if err != nil {
		return normalizedTransaction{}, validation("Tanggal transaksi wajib format YYYY-MM-DD")
	}

	validTypes := map[string]bool{"buy": true, "sell": true, "dividend": true, "fee": true, "adjustment": true}
	if !validTypes[input.Type] {
		return normalizedTransaction{}, validation("Tipe transaksi tidak valid")
	}
	if input.Price < 0 {
		return normalizedTransaction{}, validation("Harga tidak boleh negatif")
	}
	if (input.Type == "buy" || input.Type == "sell") && input.Units <= 0 {
		return normalizedTransaction{}, validation("Units wajib lebih dari 0 untuk buy/sell")
	}
	if strings.TrimSpace(input.Currency) == "" {
		return normalizedTransaction{}, validation("Currency wajib diisi")
	}

	currency := strings.ToUpper(strings.TrimSpace(input.Currency))
	if currency != "IDR" && (input.FXRateToIDR == nil || *input.FXRateToIDR <= 0) {
		return normalizedTransaction{}, validation("FX rate ke IDR wajib diisi untuk transaksi non-IDR")
	}

	var instrumentID *string
	if input.InstrumentID != nil && strings.TrimSpace(*input.InstrumentID) != "" {
		if _, err := uuid.Parse(strings.TrimSpace(*input.InstrumentID)); err != nil {
			return normalizedTransaction{}, validation("Instrument ID tidak valid")
		}
		cleaned := strings.TrimSpace(*input.InstrumentID)
		instrumentID = &cleaned
	}

	grossValue := input.Price * input.Units
	if input.GrossValue != nil {
		grossValue = *input.GrossValue
	}
	netValue := grossValue + input.Fees + input.Tax
	if input.NetValue != nil {
		netValue = *input.NetValue
	}

	return normalizedTransaction{
		InstrumentID:    instrumentID,
		TransactionDate: transactionDate,
		Type:            input.Type,
		Price:           input.Price,
		Units:           input.Units,
		GrossValue:      grossValue,
		Fees:            input.Fees,
		Tax:             input.Tax,
		NetValue:        netValue,
		Currency:        currency,
		FXRateToIDR:     input.FXRateToIDR,
		Notes:           cleanPtr(input.Notes),
	}, nil
}

func (h Handler) getTransactionByID(ctx context.Context, id string, userID string) (domain.Transaction, error) {
	return scanTransaction(h.db.QueryRow(ctx, `
		SELECT t.id::text, t.instrument_id::text, i.name, i.ticker, t.transaction_date, t.type,
		       t.price::float8, t.units::float8, t.gross_value::float8, t.fees::float8,
		       t.tax::float8, t.net_value::float8, t.currency, t.fx_rate_to_idr::float8,
		       t.notes, t.source, t.created_by::text, t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		WHERE t.id = $1 AND t.user_id = $2
	`, id, userID))
}

type scanner interface {
	Scan(dest ...any) error
}

func scanTransaction(row scanner) (domain.Transaction, error) {
	var item domain.Transaction
	err := row.Scan(
		&item.ID, &item.InstrumentID, &item.InstrumentName, &item.InstrumentTicker,
		&item.TransactionDate, &item.Type, &item.Price, &item.Units, &item.GrossValue,
		&item.Fees, &item.Tax, &item.NetValue, &item.Currency, &item.FXRateToIDR,
		&item.Notes, &item.Source, &item.CreatedBy, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func scanPrice(row scanner) (domain.PriceSnapshot, error) {
	var item domain.PriceSnapshot
	err := row.Scan(&item.ID, &item.InstrumentID, &item.PriceDate, &item.Price, &item.Currency, &item.FXRateToIDR, &item.Source, &item.IsRealtime, &item.CreatedAt)
	return item, err
}

func addTransactionWarnings(item domain.Transaction) domain.Transaction {
	if item.Currency != "IDR" && item.FXRateToIDR == nil {
		item.Warnings = append(item.Warnings, "FX rate belum diisi")
	}
	return item
}

func (h Handler) writeAudit(r *http.Request, action string, entityType string, entityID string, before any, after any) {
	user, _ := auth.UserFromContext(r.Context())
	actorID := user.ID
	_ = audit.Log(r.Context(), h.db, audit.Entry{
		ActorUserID: &actorID,
		Action:      action,
		EntityType:  entityType,
		EntityID:    &entityID,
		Before:      before,
		After:       after,
		IPAddress:   auth.ClientIP(r),
		UserAgent:   r.UserAgent(),
	})
}

func pathUUID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id := chi.URLParam(r, "id")
	if _, err := uuid.Parse(id); err != nil {
		response.Error(w, r, validation("ID tidak valid"))
		return "", false
	}
	return id, true
}

func validation(message string) error {
	return apperror.New(apperror.CodeValidation, message, http.StatusBadRequest)
}

func internalErr(err error, message string) error {
	return apperror.Wrap(err, apperror.CodeInternal, message, http.StatusInternalServerError)
}

func mapGetErr(err error, notFoundMessage string) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperror.New(apperror.CodeNotFound, notFoundMessage, http.StatusNotFound)
	}
	return internalErr(err, "Gagal memuat data")
}

func cleanPtr(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
