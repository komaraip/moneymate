package ledger

import (
	"context"
	"errors"
	"math"
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
	InstrumentID          *string  `json:"instrument_id"`
	CashAccountID         *string  `json:"cash_account_id"`
	TransferCashAccountID *string  `json:"transfer_cash_account_id"`
	CategoryID            *string  `json:"category_id"`
	TransactionDate       string   `json:"transaction_date"`
	Type                  string   `json:"type"`
	Amount                *float64 `json:"amount"`
	Price                 float64  `json:"price"`
	Units                 float64  `json:"units"`
	GrossValue            *float64 `json:"gross_value"`
	Fees                  float64  `json:"fees"`
	Tax                   float64  `json:"tax"`
	NetValue              *float64 `json:"net_value"`
	Currency              string   `json:"currency"`
	FXRateToIDR           *float64 `json:"fx_rate_to_idr"`
	Notes                 *string  `json:"notes"`
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
	fromDate, ok := optionalQueryDate(w, r, "from")
	if !ok {
		return
	}
	toDate, ok := optionalQueryDate(w, r, "to")
	if !ok {
		return
	}
	txType := strings.TrimSpace(r.URL.Query().Get("type"))
	instrumentID := strings.TrimSpace(r.URL.Query().Get("instrument_id"))
	categoryID := strings.TrimSpace(r.URL.Query().Get("category_id"))
	cashAccountID := strings.TrimSpace(r.URL.Query().Get("cash_account_id"))
	search := strings.TrimSpace(r.URL.Query().Get("search"))
	rows, err := h.db.Query(r.Context(), `
		SELECT t.id::text, t.instrument_id::text, i.name, i.ticker,
		       t.cash_account_id::text, ca.account_name,
		       t.transfer_cash_account_id::text, transfer_ca.account_name,
		       t.category_id::text, tc.name,
		       t.transaction_date, t.type, t.amount::float8,
		       t.price::float8, t.units::float8, t.gross_value::float8, t.fees::float8,
		       t.tax::float8, t.net_value::float8, t.currency, t.fx_rate_to_idr::float8,
		       t.notes, t.source, t.created_by::text, t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		LEFT JOIN cash_accounts ca ON ca.id = t.cash_account_id AND ca.user_id = t.user_id
		LEFT JOIN cash_accounts transfer_ca ON transfer_ca.id = t.transfer_cash_account_id AND transfer_ca.user_id = t.user_id
		LEFT JOIN transaction_categories tc ON tc.id = t.category_id AND tc.user_id = t.user_id
		WHERE t.user_id = $1
		  AND ($2 = '' OR t.type = $2)
		  AND ($3 = '' OR t.instrument_id::text = $3)
		  AND ($4 = '' OR t.transaction_date >= $4::date)
		  AND ($5 = '' OR t.transaction_date <= $5::date)
		  AND ($6 = '' OR t.category_id::text = $6)
		  AND ($7 = '' OR t.cash_account_id::text = $7 OR t.transfer_cash_account_id::text = $7)
		  AND (
		    $8 = ''
		    OR t.notes ILIKE '%' || $8 || '%'
		    OR i.name ILIKE '%' || $8 || '%'
		    OR i.ticker ILIKE '%' || $8 || '%'
		    OR ca.account_name ILIKE '%' || $8 || '%'
		    OR transfer_ca.account_name ILIKE '%' || $8 || '%'
		    OR tc.name ILIKE '%' || $8 || '%'
		  )
		ORDER BY t.transaction_date DESC, t.created_at DESC
		LIMIT 200
	`, user.ID, txType, instrumentID, fromDate, toDate, categoryID, cashAccountID, search)
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
	if err := h.validateTransactionRefs(r.Context(), user.ID, normalized); err != nil {
		response.Error(w, r, err)
		return
	}

	tx, err := h.db.Begin(r.Context())
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memulai transaksi"))
		return
	}
	defer tx.Rollback(r.Context())

	var item domain.Transaction
	err = tx.QueryRow(r.Context(), `
		INSERT INTO transactions (
			user_id, instrument_id, cash_account_id, transfer_cash_account_id, category_id,
			transaction_date, type, amount, price, units, gross_value, fees, tax, net_value,
			currency, fx_rate_to_idr, notes, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $1)
		RETURNING id::text, instrument_id::text, NULL::text, NULL::text,
		          cash_account_id::text, NULL::text, transfer_cash_account_id::text, NULL::text,
		          category_id::text, NULL::text, transaction_date, type, amount::float8,
		          price::float8, units::float8, gross_value::float8, fees::float8, tax::float8,
		          net_value::float8, currency, fx_rate_to_idr::float8, notes, source, created_by::text,
		          created_at, updated_at
	`, user.ID, normalized.InstrumentID, normalized.CashAccountID, normalized.TransferCashAccountID, normalized.CategoryID, normalized.TransactionDate, normalized.Type, normalized.Amount, normalized.Price, normalized.Units, normalized.GrossValue, normalized.Fees, normalized.Tax, normalized.NetValue, normalized.Currency, normalized.FXRateToIDR, cleanPtr(normalized.Notes)).Scan(
		&item.ID, &item.InstrumentID, &item.InstrumentName, &item.InstrumentTicker,
		&item.CashAccountID, &item.CashAccountName, &item.TransferAccountID, &item.TransferAccountName,
		&item.CategoryID, &item.CategoryName, &item.TransactionDate, &item.Type, &item.Amount,
		&item.Price, &item.Units, &item.GrossValue, &item.Fees, &item.Tax, &item.NetValue,
		&item.Currency, &item.FXRateToIDR, &item.Notes, &item.Source, &item.CreatedBy,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal membuat transaksi"))
		return
	}
	if err := h.applyPersonalTransactionEffect(r.Context(), tx, user.ID, item, false); err != nil {
		response.Error(w, r, err)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan transaksi"))
		return
	}
	item, err = h.getTransactionByID(r.Context(), item.ID, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat transaksi terbaru"))
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
	if err := h.validateTransactionRefs(r.Context(), user.ID, normalized); err != nil {
		response.Error(w, r, err)
		return
	}

	tx, err := h.db.Begin(r.Context())
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memulai perubahan transaksi"))
		return
	}
	defer tx.Rollback(r.Context())
	if err := h.applyPersonalTransactionEffect(r.Context(), tx, user.ID, before, true); err != nil {
		response.Error(w, r, err)
		return
	}

	var item domain.Transaction
	err = tx.QueryRow(r.Context(), `
		UPDATE transactions
		SET instrument_id = $2, cash_account_id = $3, transfer_cash_account_id = $4,
		    category_id = $5, transaction_date = $6, type = $7, amount = $8, price = $9,
		    units = $10, gross_value = $11, fees = $12, tax = $13, net_value = $14,
		    currency = $15, fx_rate_to_idr = $16, notes = $17, updated_at = now()
		WHERE id = $1 AND user_id = $18
		RETURNING id::text, instrument_id::text, NULL::text, NULL::text,
		          cash_account_id::text, NULL::text, transfer_cash_account_id::text, NULL::text,
		          category_id::text, NULL::text, transaction_date, type, amount::float8,
		          price::float8, units::float8, gross_value::float8, fees::float8, tax::float8,
		          net_value::float8, currency, fx_rate_to_idr::float8, notes, source, created_by::text,
		          created_at, updated_at
	`, id, normalized.InstrumentID, normalized.CashAccountID, normalized.TransferCashAccountID, normalized.CategoryID, normalized.TransactionDate, normalized.Type, normalized.Amount, normalized.Price, normalized.Units, normalized.GrossValue, normalized.Fees, normalized.Tax, normalized.NetValue, normalized.Currency, normalized.FXRateToIDR, cleanPtr(normalized.Notes), user.ID).Scan(
		&item.ID, &item.InstrumentID, &item.InstrumentName, &item.InstrumentTicker,
		&item.CashAccountID, &item.CashAccountName, &item.TransferAccountID, &item.TransferAccountName,
		&item.CategoryID, &item.CategoryName, &item.TransactionDate, &item.Type, &item.Amount,
		&item.Price, &item.Units, &item.GrossValue, &item.Fees, &item.Tax, &item.NetValue,
		&item.Currency, &item.FXRateToIDR, &item.Notes, &item.Source, &item.CreatedBy,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal mengubah transaksi"))
		return
	}
	if err := h.applyPersonalTransactionEffect(r.Context(), tx, user.ID, item, false); err != nil {
		response.Error(w, r, err)
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan perubahan transaksi"))
		return
	}
	item, err = h.getTransactionByID(r.Context(), item.ID, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat transaksi terbaru"))
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

	tx, err := h.db.Begin(r.Context())
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memulai hapus transaksi"))
		return
	}
	defer tx.Rollback(r.Context())
	if err := h.applyPersonalTransactionEffect(r.Context(), tx, user.ID, before, true); err != nil {
		response.Error(w, r, err)
		return
	}
	if _, err := tx.Exec(r.Context(), `DELETE FROM transactions WHERE id = $1 AND user_id = $2`, id, user.ID); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menghapus transaksi"))
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan hapus transaksi"))
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
	InstrumentID          *string
	CashAccountID         *string
	TransferCashAccountID *string
	CategoryID            *string
	TransactionDate       time.Time
	Type                  string
	Amount                *float64
	Price                 float64
	Units                 float64
	GrossValue            float64
	Fees                  float64
	Tax                   float64
	NetValue              float64
	Currency              string
	FXRateToIDR           *float64
	Notes                 *string
}

func normalizeTransaction(input transactionInput) (normalizedTransaction, error) {
	transactionDate, err := time.Parse("2006-01-02", input.TransactionDate)
	if err != nil {
		return normalizedTransaction{}, validation("Tanggal transaksi wajib format YYYY-MM-DD")
	}

	txType := strings.ToLower(strings.TrimSpace(input.Type))
	validTypes := map[string]bool{
		"buy": true, "sell": true, "dividend": true, "fee": true, "adjustment": true,
		"income": true, "expense": true, "transfer": true,
	}
	if !validTypes[txType] {
		return normalizedTransaction{}, validation("Tipe transaksi tidak valid")
	}
	if input.Price < 0 {
		return normalizedTransaction{}, validation("Harga tidak boleh negatif")
	}
	if (txType == "buy" || txType == "sell") && input.Units <= 0 {
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
	cashAccountID, err := optionalUUID(input.CashAccountID, "Akun wajib valid")
	if err != nil {
		return normalizedTransaction{}, err
	}
	transferAccountID, err := optionalUUID(input.TransferCashAccountID, "Akun tujuan transfer wajib valid")
	if err != nil {
		return normalizedTransaction{}, err
	}
	categoryID, err := optionalUUID(input.CategoryID, "Kategori transaksi wajib valid")
	if err != nil {
		return normalizedTransaction{}, err
	}

	grossValue := input.Price * input.Units
	if input.GrossValue != nil {
		grossValue = *input.GrossValue
	}
	netValue := grossValue + input.Fees + input.Tax
	if input.NetValue != nil {
		netValue = *input.NetValue
	}
	var amount *float64
	if txType == "income" || txType == "expense" || txType == "transfer" {
		if cashAccountID == nil {
			return normalizedTransaction{}, validation("Akun wajib dipilih untuk pemasukan, pengeluaran, atau transfer")
		}
		if txType == "transfer" {
			if transferAccountID == nil {
				return normalizedTransaction{}, validation("Akun tujuan wajib dipilih untuk transfer")
			}
			if *cashAccountID == *transferAccountID {
				return normalizedTransaction{}, validation("Akun asal dan tujuan transfer harus berbeda")
			}
		}
		if txType == "income" || txType == "expense" {
			if categoryID == nil {
				return normalizedTransaction{}, validation("Kategori wajib dipilih untuk pemasukan atau pengeluaran")
			}
		}
		rawAmount := netValue
		if input.Amount != nil {
			rawAmount = *input.Amount
		}
		if rawAmount <= 0 {
			return normalizedTransaction{}, validation("Nominal transaksi wajib lebih dari 0")
		}
		cleanedAmount := roundMoney(rawAmount)
		amount = &cleanedAmount
		grossValue = cleanedAmount
		netValue = cleanedAmount
		if input.Price <= 0 {
			input.Price = cleanedAmount
		}
		if input.Units <= 0 {
			input.Units = 1
		}
	}

	return normalizedTransaction{
		InstrumentID:          instrumentID,
		CashAccountID:         cashAccountID,
		TransferCashAccountID: transferAccountID,
		CategoryID:            categoryID,
		TransactionDate:       transactionDate,
		Type:                  txType,
		Amount:                amount,
		Price:                 input.Price,
		Units:                 input.Units,
		GrossValue:            grossValue,
		Fees:                  input.Fees,
		Tax:                   input.Tax,
		NetValue:              netValue,
		Currency:              currency,
		FXRateToIDR:           input.FXRateToIDR,
		Notes:                 cleanPtr(input.Notes),
	}, nil
}

func (h Handler) getTransactionByID(ctx context.Context, id string, userID string) (domain.Transaction, error) {
	return scanTransaction(h.db.QueryRow(ctx, `
		SELECT t.id::text, t.instrument_id::text, i.name, i.ticker,
		       t.cash_account_id::text, ca.account_name,
		       t.transfer_cash_account_id::text, transfer_ca.account_name,
		       t.category_id::text, tc.name,
		       t.transaction_date, t.type, t.amount::float8,
		       t.price::float8, t.units::float8, t.gross_value::float8, t.fees::float8,
		       t.tax::float8, t.net_value::float8, t.currency, t.fx_rate_to_idr::float8,
		       t.notes, t.source, t.created_by::text, t.created_at, t.updated_at
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		LEFT JOIN cash_accounts ca ON ca.id = t.cash_account_id AND ca.user_id = t.user_id
		LEFT JOIN cash_accounts transfer_ca ON transfer_ca.id = t.transfer_cash_account_id AND transfer_ca.user_id = t.user_id
		LEFT JOIN transaction_categories tc ON tc.id = t.category_id AND tc.user_id = t.user_id
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
		&item.CashAccountID, &item.CashAccountName, &item.TransferAccountID, &item.TransferAccountName,
		&item.CategoryID, &item.CategoryName, &item.TransactionDate, &item.Type, &item.Amount, &item.Price, &item.Units, &item.GrossValue,
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

func (h Handler) validateTransactionRefs(ctx context.Context, userID string, item normalizedTransaction) error {
	if item.CashAccountID != nil {
		currency, err := h.cashAccountCurrency(ctx, userID, *item.CashAccountID)
		if err != nil {
			return err
		}
		if currency != item.Currency {
			return validation("Mata uang transaksi harus sama dengan mata uang akun")
		}
	}
	if item.TransferCashAccountID != nil {
		currency, err := h.cashAccountCurrency(ctx, userID, *item.TransferCashAccountID)
		if err != nil {
			return err
		}
		if currency != item.Currency {
			return validation("Mata uang akun tujuan harus sama dengan mata uang transaksi")
		}
	}
	if item.CategoryID != nil {
		var categoryType string
		err := h.db.QueryRow(ctx, `
			SELECT type
			FROM transaction_categories
			WHERE id = $1 AND user_id = $2 AND is_active = TRUE
		`, *item.CategoryID, userID).Scan(&categoryType)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return validation("Kategori transaksi tidak ditemukan atau nonaktif")
			}
			return internalErr(err, "Gagal memvalidasi kategori transaksi")
		}
		if (item.Type == "income" || item.Type == "expense") && categoryType != item.Type {
			return validation("Tipe kategori harus sesuai dengan tipe transaksi")
		}
	}
	return nil
}

func (h Handler) cashAccountCurrency(ctx context.Context, userID string, accountID string) (string, error) {
	var currency string
	var isActive bool
	err := h.db.QueryRow(ctx, `
		SELECT currency, is_active
		FROM cash_accounts
		WHERE id = $1 AND user_id = $2
	`, accountID, userID).Scan(&currency, &isActive)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", validation("Akun kas tidak ditemukan")
		}
		return "", internalErr(err, "Gagal memvalidasi akun kas")
	}
	if !isActive {
		return "", validation("Akun kas nonaktif tidak dapat dipakai")
	}
	return currency, nil
}

func (h Handler) applyPersonalTransactionEffect(ctx context.Context, tx pgx.Tx, userID string, item domain.Transaction, reverse bool) error {
	if !isPersonalTransaction(item.Type) {
		return nil
	}
	amount := item.NetValue
	if item.Amount != nil {
		amount = *item.Amount
	}
	amount = roundMoney(math.Abs(amount))
	if amount <= 0 {
		return validation("Nominal transaksi wajib lebih dari 0")
	}
	notePrefix := "Transaksi"
	if reverse {
		notePrefix = "Pembalikan transaksi"
	}
	note := strings.TrimSpace(notePrefix + " " + transactionTypeLabel(item.Type))
	if item.Notes != nil && strings.TrimSpace(*item.Notes) != "" {
		note = note + ": " + strings.TrimSpace(*item.Notes)
	}

	switch item.Type {
	case "income":
		if item.CashAccountID == nil {
			return validation("Akun wajib dipilih untuk pemasukan")
		}
		if reverse {
			return h.applyCashDelta(ctx, tx, userID, *item.CashAccountID, item.ID, item.TransactionDate, "withdrawal", -amount, note)
		}
		return h.applyCashDelta(ctx, tx, userID, *item.CashAccountID, item.ID, item.TransactionDate, "deposit", amount, note)
	case "expense":
		if item.CashAccountID == nil {
			return validation("Akun wajib dipilih untuk pengeluaran")
		}
		if reverse {
			return h.applyCashDelta(ctx, tx, userID, *item.CashAccountID, item.ID, item.TransactionDate, "deposit", amount, note)
		}
		return h.applyCashDelta(ctx, tx, userID, *item.CashAccountID, item.ID, item.TransactionDate, "withdrawal", -amount, note)
	case "transfer":
		if item.CashAccountID == nil || item.TransferAccountID == nil {
			return validation("Akun asal dan tujuan wajib dipilih untuk transfer")
		}
		if reverse {
			if err := h.applyCashDelta(ctx, tx, userID, *item.CashAccountID, item.ID, item.TransactionDate, "transfer_in", amount, note); err != nil {
				return err
			}
			return h.applyCashDelta(ctx, tx, userID, *item.TransferAccountID, item.ID, item.TransactionDate, "transfer_out", -amount, note)
		}
		if err := h.applyCashDelta(ctx, tx, userID, *item.CashAccountID, item.ID, item.TransactionDate, "transfer_out", -amount, note); err != nil {
			return err
		}
		return h.applyCashDelta(ctx, tx, userID, *item.TransferAccountID, item.ID, item.TransactionDate, "transfer_in", amount, note)
	}
	return nil
}

func (h Handler) applyCashDelta(ctx context.Context, tx pgx.Tx, userID string, accountID string, transactionID string, date time.Time, adjustmentType string, delta float64, note string) error {
	var balanceBefore float64
	var currency string
	var isActive bool
	err := tx.QueryRow(ctx, `
		SELECT balance::float8, currency, is_active
		FROM cash_accounts
		WHERE id = $1 AND user_id = $2
		FOR UPDATE
	`, accountID, userID).Scan(&balanceBefore, &currency, &isActive)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return validation("Akun kas tidak ditemukan")
		}
		return internalErr(err, "Gagal memuat akun kas")
	}
	if !isActive {
		return validation("Akun kas nonaktif tidak dapat dipakai")
	}

	balanceBefore = roundMoney(balanceBefore)
	balanceAfter := roundMoney(balanceBefore + delta)
	if balanceAfter < 0 {
		return validation("Saldo akun kas tidak boleh negatif")
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO cash_adjustments (
			user_id, cash_account_id, adjustment_date, type, amount, balance_before,
			balance_after, currency, notes, created_by, related_transaction_id
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $1, $10)
	`, userID, accountID, date.Format("2006-01-02"), adjustmentType, roundMoney(delta), balanceBefore, balanceAfter, currency, cleanPtr(&note), transactionID); err != nil {
		return internalErr(err, "Gagal mencatat ledger kas")
	}

	if _, err := tx.Exec(ctx, `UPDATE cash_accounts SET balance = $3, updated_at = now() WHERE id = $1 AND user_id = $2`, accountID, userID, balanceAfter); err != nil {
		return internalErr(err, "Gagal memperbarui saldo kas")
	}
	return nil
}

func isPersonalTransaction(kind string) bool {
	return kind == "income" || kind == "expense" || kind == "transfer"
}

func transactionTypeLabel(kind string) string {
	labels := map[string]string{
		"income":   "pemasukan",
		"expense":  "pengeluaran",
		"transfer": "transfer",
	}
	if label, ok := labels[kind]; ok {
		return label
	}
	return kind
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

func optionalQueryDate(w http.ResponseWriter, r *http.Request, key string) (string, bool) {
	value := strings.TrimSpace(r.URL.Query().Get(key))
	if value == "" {
		return "", true
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		response.Error(w, r, validation("Filter tanggal harus format YYYY-MM-DD"))
		return "", false
	}
	return parsed.Format("2006-01-02"), true
}

func optionalUUID(value *string, message string) (*string, error) {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil, nil
	}
	cleaned := strings.TrimSpace(*value)
	if _, err := uuid.Parse(cleaned); err != nil {
		return nil, validation(message)
	}
	return &cleaned, nil
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

func roundMoney(value float64) float64 {
	return math.Round(value*100) / 100
}
