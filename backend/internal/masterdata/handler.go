package masterdata

import (
	"context"
	"encoding/json"
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

func (h Handler) InstrumentRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", h.listInstruments)
	router.Post("/", auth.RequireAdmin()(http.HandlerFunc(h.createInstrument)).ServeHTTP)
	router.Get("/{id}", h.getInstrument)
	router.Put("/{id}", auth.RequireAdmin()(http.HandlerFunc(h.updateInstrument)).ServeHTTP)
	router.Delete("/{id}", auth.RequireAdmin()(http.HandlerFunc(h.deleteInstrument)).ServeHTTP)

	return router
}

func (h Handler) CategoryRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", h.listCategories)
	router.Post("/", auth.RequireAdmin()(http.HandlerFunc(h.createCategory)).ServeHTTP)
	router.Put("/{id}", auth.RequireAdmin()(http.HandlerFunc(h.updateCategory)).ServeHTTP)
	router.Delete("/{id}", auth.RequireAdmin()(http.HandlerFunc(h.deleteCategory)).ServeHTTP)

	return router
}

func (h Handler) CashRoutes() chi.Router {
	router := chi.NewRouter()

	router.Get("/", h.listCashAccounts)
	router.Post("/", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.createCashAccount)).ServeHTTP)
	router.Get("/{id}/adjustments", h.listCashAdjustments)
	router.Post("/{id}/adjust", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.adjustCashAccount)).ServeHTTP)
	router.Get("/{id}", h.getCashAccount)
	router.Put("/{id}", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.updateCashAccount)).ServeHTTP)
	router.Delete("/{id}", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.deleteCashAccount)).ServeHTTP)

	return router
}

func (h Handler) AuditRoutes() chi.Router {
	router := chi.NewRouter()
	router.Get("/", h.listAuditLogs)
	return router
}

type instrumentInput struct {
	Type        string   `json:"type"`
	Ticker      *string  `json:"ticker"`
	Name        string   `json:"name"`
	Provider    *string  `json:"provider"`
	Currency    string   `json:"currency"`
	Exchange    *string  `json:"exchange"`
	Country     *string  `json:"country"`
	CategoryIDs []string `json:"category_ids"`
	IsActive    *bool    `json:"is_active"`
}

type categoryInput struct {
	Name                    string   `json:"name"`
	Description             *string  `json:"description"`
	TargetAllocationPercent *float64 `json:"target_allocation_percent"`
	ColorKey                *string  `json:"color_key"`
	SortOrder               int      `json:"sort_order"`
}

type cashInput struct {
	AccountName string  `json:"account_name"`
	AccountType string  `json:"account_type"`
	Currency    string  `json:"currency"`
	Balance     float64 `json:"balance"`
	Notes       *string `json:"notes"`
	IsActive    *bool   `json:"is_active"`
}

type cashAdjustmentInput struct {
	AdjustmentDate string  `json:"adjustment_date"`
	Type           string  `json:"type"`
	Amount         float64 `json:"amount"`
	Note           *string `json:"note"`
}

func (h Handler) listInstruments(w http.ResponseWriter, r *http.Request) {
	search := strings.TrimSpace(r.URL.Query().Get("search"))
	rows, err := h.db.Query(r.Context(), `
		SELECT i.id::text, i.type, i.ticker, i.name, i.provider, i.currency, i.exchange, i.country,
		       COALESCE(array_agg(ic.category_id::text ORDER BY ac.sort_order, ac.name) FILTER (WHERE ic.category_id IS NOT NULL), ARRAY[]::text[]) AS category_ids,
		       COALESCE(array_agg(ac.name ORDER BY ac.sort_order, ac.name) FILTER (WHERE ac.id IS NOT NULL), ARRAY[]::text[]) AS category_names,
		       i.is_active, i.created_at, i.updated_at
		FROM instruments i
		LEFT JOIN instrument_categories ic ON ic.instrument_id = i.id
		LEFT JOIN asset_categories ac ON ac.id = ic.category_id
		WHERE ($1 = '' OR i.ticker ILIKE '%' || $1 || '%' OR i.name ILIKE '%' || $1 || '%')
		GROUP BY i.id, i.type, i.ticker, i.name, i.provider, i.currency, i.exchange, i.country, i.is_active, i.created_at, i.updated_at
		ORDER BY i.is_active DESC, i.type, i.ticker NULLS LAST, i.name
	`, search)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat instrumen"))
		return
	}
	defer rows.Close()

	items := []domain.Instrument{}
	for rows.Next() {
		item, err := scanInstrument(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca instrumen"))
			return
		}
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) getInstrument(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}

	item, err := h.getInstrumentByID(r.Context(), id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Instrumen tidak ditemukan"))
		return
	}

	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) createInstrument(w http.ResponseWriter, r *http.Request) {
	var input instrumentInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if err := validateInstrument(input); err != nil {
		response.Error(w, r, err)
		return
	}

	var item domain.Instrument
	tx, err := h.db.Begin(r.Context())
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal membuat instrumen"))
		return
	}
	defer tx.Rollback(r.Context())

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}
	var id string
	err = tx.QueryRow(r.Context(), `
		INSERT INTO instruments (type, ticker, name, provider, currency, exchange, country, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id::text
	`, input.Type, cleanPtr(input.Ticker), strings.TrimSpace(input.Name), cleanPtr(input.Provider), strings.ToUpper(input.Currency), cleanPtr(input.Exchange), cleanPtr(input.Country), isActive).Scan(&id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal membuat instrumen"))
		return
	}
	if err := replaceInstrumentCategories(r.Context(), tx, id, input.CategoryIDs); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyimpan kategori instrumen"))
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan pembuatan instrumen"))
		return
	}
	item, err = h.getInstrumentByID(r.Context(), id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat instrumen baru"))
		return
	}

	h.writeAudit(r, "create", "instrument", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, item, nil)
}

func (h Handler) updateInstrument(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	before, err := h.getInstrumentByID(r.Context(), id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Instrumen tidak ditemukan"))
		return
	}

	var input instrumentInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if err := validateInstrument(input); err != nil {
		response.Error(w, r, err)
		return
	}

	tx, err := h.db.Begin(r.Context())
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal mengubah instrumen"))
		return
	}
	defer tx.Rollback(r.Context())

	isActive := before.IsActive
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	var updatedID string
	err = tx.QueryRow(r.Context(), `
		UPDATE instruments
		SET type = $2, ticker = $3, name = $4, provider = $5, currency = $6,
		    exchange = $7, country = $8, is_active = $9, updated_at = now()
		WHERE id = $1
		RETURNING id::text
	`, id, input.Type, cleanPtr(input.Ticker), strings.TrimSpace(input.Name), cleanPtr(input.Provider), strings.ToUpper(input.Currency), cleanPtr(input.Exchange), cleanPtr(input.Country), isActive).Scan(&updatedID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal mengubah instrumen"))
		return
	}
	if input.CategoryIDs != nil {
		if err := replaceInstrumentCategories(r.Context(), tx, updatedID, input.CategoryIDs); err != nil {
			response.Error(w, r, internalErr(err, "Gagal menyimpan kategori instrumen"))
			return
		}
	}
	if err := tx.Commit(r.Context()); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan perubahan instrumen"))
		return
	}

	item, err := h.getInstrumentByID(r.Context(), id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat instrumen terbaru"))
		return
	}

	h.writeAudit(r, "update", "instrument", item.ID, before, item)
	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) deleteInstrument(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	before, err := h.getInstrumentByID(r.Context(), id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Instrumen tidak ditemukan"))
		return
	}

	_, err = h.db.Exec(r.Context(), `UPDATE instruments SET is_active = FALSE, updated_at = now() WHERE id = $1`, id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal menonaktifkan instrumen"))
		return
	}

	h.writeAudit(r, "delete", "instrument", id, before, map[string]any{"is_active": false})
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "deleted"}, nil)
}

func (h Handler) listCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, name, description, target_allocation_percent::float8, color_key, sort_order, created_at
		FROM asset_categories
		ORDER BY sort_order, name
	`)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat kategori aset"))
		return
	}
	defer rows.Close()

	items := []domain.AssetCategory{}
	for rows.Next() {
		var item domain.AssetCategory
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.TargetAllocationPercent, &item.ColorKey, &item.SortOrder, &item.CreatedAt); err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca kategori aset"))
			return
		}
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) createCategory(w http.ResponseWriter, r *http.Request) {
	var input categoryInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if strings.TrimSpace(input.Name) == "" {
		response.Error(w, r, validation("Nama kategori wajib diisi"))
		return
	}

	var item domain.AssetCategory
	err := h.db.QueryRow(r.Context(), `
		INSERT INTO asset_categories (name, description, target_allocation_percent, color_key, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id::text, name, description, target_allocation_percent::float8, color_key, sort_order, created_at
	`, strings.TrimSpace(input.Name), cleanPtr(input.Description), input.TargetAllocationPercent, cleanPtr(input.ColorKey), input.SortOrder).Scan(
		&item.ID, &item.Name, &item.Description, &item.TargetAllocationPercent, &item.ColorKey, &item.SortOrder, &item.CreatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal membuat kategori aset"))
		return
	}

	h.writeAudit(r, "create", "asset_category", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, item, nil)
}

func (h Handler) updateCategory(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	before, _ := h.getCategoryByID(r.Context(), id)

	var input categoryInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if strings.TrimSpace(input.Name) == "" {
		response.Error(w, r, validation("Nama kategori wajib diisi"))
		return
	}

	var item domain.AssetCategory
	err := h.db.QueryRow(r.Context(), `
		UPDATE asset_categories
		SET name = $2, description = $3, target_allocation_percent = $4, color_key = $5, sort_order = $6
		WHERE id = $1
		RETURNING id::text, name, description, target_allocation_percent::float8, color_key, sort_order, created_at
	`, id, strings.TrimSpace(input.Name), cleanPtr(input.Description), input.TargetAllocationPercent, cleanPtr(input.ColorKey), input.SortOrder).Scan(
		&item.ID, &item.Name, &item.Description, &item.TargetAllocationPercent, &item.ColorKey, &item.SortOrder, &item.CreatedAt,
	)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Kategori aset tidak ditemukan"))
		return
	}

	h.writeAudit(r, "update", "asset_category", item.ID, before, item)
	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) deleteCategory(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	before, _ := h.getCategoryByID(r.Context(), id)

	if _, err := h.db.Exec(r.Context(), `DELETE FROM asset_categories WHERE id = $1`, id); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menghapus kategori aset"))
		return
	}

	h.writeAudit(r, "delete", "asset_category", id, before, nil)
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "deleted"}, nil)
}

func (h Handler) listCashAccounts(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, account_name, account_type, currency, balance::float8, notes, is_active, created_at, updated_at
		FROM cash_accounts
		WHERE user_id = $1
		ORDER BY is_active DESC, account_name
	`, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat akun cash"))
		return
	}
	defer rows.Close()

	items := []domain.CashAccount{}
	for rows.Next() {
		item, err := scanCash(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca akun cash"))
			return
		}
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) getCashAccount(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	item, err := h.getCashByID(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Akun cash tidak ditemukan"))
		return
	}

	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) createCashAccount(w http.ResponseWriter, r *http.Request) {
	var input cashInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if err := validateCash(input); err != nil {
		response.Error(w, r, err)
		return
	}

	var item domain.CashAccount
	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}
	user, _ := auth.UserFromContext(r.Context())
	err := h.db.QueryRow(r.Context(), `
		INSERT INTO cash_accounts (user_id, account_name, account_type, currency, balance, notes, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id::text, account_name, account_type, currency, balance::float8, notes, is_active, created_at, updated_at
	`, user.ID, strings.TrimSpace(input.AccountName), defaultString(input.AccountType, "bank"), strings.ToUpper(input.Currency), input.Balance, cleanPtr(input.Notes), isActive).Scan(
		&item.ID, &item.AccountName, &item.AccountType, &item.Currency, &item.Balance, &item.Notes, &item.IsActive, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal membuat akun cash"))
		return
	}

	h.writeAudit(r, "create", "cash_account", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, item, nil)
}

func (h Handler) updateCashAccount(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getCashByID(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Akun cash tidak ditemukan"))
		return
	}

	var input cashInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	if err := validateCash(input); err != nil {
		response.Error(w, r, err)
		return
	}

	var item domain.CashAccount
	isActive := before.IsActive
	if input.IsActive != nil {
		isActive = *input.IsActive
	}
	err = h.db.QueryRow(r.Context(), `
		UPDATE cash_accounts
		SET account_name = $2, account_type = $3, currency = $4, balance = $5,
		    notes = $6, is_active = $7, updated_at = now()
		WHERE id = $1 AND user_id = $8
		RETURNING id::text, account_name, account_type, currency, balance::float8, notes, is_active, created_at, updated_at
	`, id, strings.TrimSpace(input.AccountName), defaultString(input.AccountType, "bank"), strings.ToUpper(input.Currency), input.Balance, cleanPtr(input.Notes), isActive, user.ID).Scan(
		&item.ID, &item.AccountName, &item.AccountType, &item.Currency, &item.Balance, &item.Notes, &item.IsActive, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal mengubah akun cash"))
		return
	}

	h.writeAudit(r, "update", "cash_account", item.ID, before, item)
	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) deleteCashAccount(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getCashByID(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Akun cash tidak ditemukan"))
		return
	}

	if _, err := h.db.Exec(r.Context(), `UPDATE cash_accounts SET is_active = FALSE, updated_at = now() WHERE id = $1 AND user_id = $2`, id, user.ID); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menonaktifkan akun cash"))
		return
	}

	h.writeAudit(r, "delete", "cash_account", id, before, map[string]any{"is_active": false})
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "deleted"}, nil)
}

func (h Handler) listCashAdjustments(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	if _, err := h.getCashByID(r.Context(), id, user.ID); err != nil {
		response.Error(w, r, mapGetErr(err, "Akun cash tidak ditemukan"))
		return
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, cash_account_id::text, adjustment_date, type, amount::float8,
		       balance_before::float8, balance_after::float8, currency, notes, created_by::text, created_at
		FROM cash_adjustments
		WHERE user_id = $1 AND cash_account_id = $2
		ORDER BY adjustment_date DESC, created_at DESC
		LIMIT 200
	`, user.ID, id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat histori adjustment cash"))
		return
	}
	defer rows.Close()

	items := []domain.CashAdjustment{}
	for rows.Next() {
		item, err := scanCashAdjustment(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca histori adjustment cash"))
			return
		}
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) adjustCashAccount(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}

	var input cashAdjustmentInput
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}
	adjustmentDate, normalizedType, delta, err := normalizeCashAdjustment(input)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	tx, err := h.db.Begin(r.Context())
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memulai adjustment cash"))
		return
	}
	defer tx.Rollback(r.Context())

	user, _ := auth.UserFromContext(r.Context())
	var account domain.CashAccount
	if err := tx.QueryRow(r.Context(), `
		SELECT id::text, account_name, account_type, currency, balance::float8, notes, is_active, created_at, updated_at
		FROM cash_accounts
		WHERE id = $1 AND user_id = $2
		FOR UPDATE
	`, id, user.ID).Scan(&account.ID, &account.AccountName, &account.AccountType, &account.Currency, &account.Balance, &account.Notes, &account.IsActive, &account.CreatedAt, &account.UpdatedAt); err != nil {
		response.Error(w, r, mapGetErr(err, "Akun cash tidak ditemukan"))
		return
	}
	if !account.IsActive {
		response.Error(w, r, validation("Akun cash nonaktif tidak dapat di-adjust"))
		return
	}

	balanceBefore := roundMoney(account.Balance)
	balanceAfter := roundMoney(balanceBefore + delta)
	if balanceAfter < 0 {
		response.Error(w, r, validation("Saldo cash tidak boleh negatif"))
		return
	}

	var item domain.CashAdjustment
	err = tx.QueryRow(r.Context(), `
		INSERT INTO cash_adjustments (
			user_id, cash_account_id, adjustment_date, type, amount, balance_before,
			balance_after, currency, notes, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $1)
		RETURNING id::text, cash_account_id::text, adjustment_date, type, amount::float8,
		          balance_before::float8, balance_after::float8, currency, notes, created_by::text, created_at
	`, user.ID, id, adjustmentDate, normalizedType, delta, balanceBefore, balanceAfter, account.Currency, cleanPtr(input.Note)).Scan(
		&item.ID, &item.CashAccountID, &item.AdjustmentDate, &item.Type, &item.Amount,
		&item.BalanceBefore, &item.BalanceAfter, &item.Currency, &item.Note, &item.CreatedBy, &item.CreatedAt,
	)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyimpan adjustment cash"))
		return
	}

	if _, err := tx.Exec(r.Context(), `UPDATE cash_accounts SET balance = $2, updated_at = now() WHERE id = $1 AND user_id = $3`, id, balanceAfter, user.ID); err != nil {
		response.Error(w, r, internalErr(err, "Gagal memperbarui saldo cash"))
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan adjustment cash"))
		return
	}

	h.writeAudit(r, "adjust", "cash_adjustment", item.ID, map[string]any{
		"cash_account_id": id,
		"balance_before":  balanceBefore,
	}, map[string]any{
		"adjustment":      item,
		"cash_account_id": id,
		"balance_after":   balanceAfter,
	})
	response.JSON(w, r, http.StatusCreated, item, nil)
}

func (h Handler) listAuditLogs(w http.ResponseWriter, r *http.Request) {
	entityType := strings.TrimSpace(r.URL.Query().Get("entity_type"))
	action := strings.TrimSpace(r.URL.Query().Get("action"))
	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, actor_user_id::text, action, entity_type, entity_id::text, before_json, after_json, ip_address, user_agent, created_at
		FROM audit_logs
		WHERE ($1 = '' OR entity_type = $1)
		  AND ($2 = '' OR action = $2)
		ORDER BY created_at DESC
		LIMIT 100
	`, entityType, action)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat audit log"))
		return
	}
	defer rows.Close()

	items := []domain.AuditLog{}
	for rows.Next() {
		var item domain.AuditLog
		var beforeBytes, afterBytes []byte
		if err := rows.Scan(&item.ID, &item.ActorUserID, &item.Action, &item.EntityType, &item.EntityID, &beforeBytes, &afterBytes, &item.IPAddress, &item.UserAgent, &item.CreatedAt); err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca audit log"))
			return
		}
		item.BeforeJSON = decodeJSON(beforeBytes)
		item.AfterJSON = decodeJSON(afterBytes)
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) getInstrumentByID(ctx context.Context, id string) (domain.Instrument, error) {
	return scanInstrument(h.db.QueryRow(ctx, `
		SELECT i.id::text, i.type, i.ticker, i.name, i.provider, i.currency, i.exchange, i.country,
		       COALESCE(array_agg(ic.category_id::text ORDER BY ac.sort_order, ac.name) FILTER (WHERE ic.category_id IS NOT NULL), ARRAY[]::text[]) AS category_ids,
		       COALESCE(array_agg(ac.name ORDER BY ac.sort_order, ac.name) FILTER (WHERE ac.id IS NOT NULL), ARRAY[]::text[]) AS category_names,
		       i.is_active, i.created_at, i.updated_at
		FROM instruments i
		LEFT JOIN instrument_categories ic ON ic.instrument_id = i.id
		LEFT JOIN asset_categories ac ON ac.id = ic.category_id
		WHERE i.id = $1
		GROUP BY i.id, i.type, i.ticker, i.name, i.provider, i.currency, i.exchange, i.country, i.is_active, i.created_at, i.updated_at
	`, id))
}

func (h Handler) getCategoryByID(ctx context.Context, id string) (domain.AssetCategory, error) {
	var item domain.AssetCategory
	err := h.db.QueryRow(ctx, `
		SELECT id::text, name, description, target_allocation_percent::float8, color_key, sort_order, created_at
		FROM asset_categories
		WHERE id = $1
	`, id).Scan(&item.ID, &item.Name, &item.Description, &item.TargetAllocationPercent, &item.ColorKey, &item.SortOrder, &item.CreatedAt)
	return item, err
}

func (h Handler) getCashByID(ctx context.Context, id string, userID string) (domain.CashAccount, error) {
	return scanCash(h.db.QueryRow(ctx, `
		SELECT id::text, account_name, account_type, currency, balance::float8, notes, is_active, created_at, updated_at
		FROM cash_accounts
		WHERE id = $1 AND user_id = $2
	`, id, userID))
}

type scanner interface {
	Scan(dest ...any) error
}

func scanInstrument(row scanner) (domain.Instrument, error) {
	var item domain.Instrument
	err := row.Scan(
		&item.ID,
		&item.Type,
		&item.Ticker,
		&item.Name,
		&item.Provider,
		&item.Currency,
		&item.Exchange,
		&item.Country,
		&item.CategoryIDs,
		&item.CategoryNames,
		&item.IsActive,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	return item, err
}

func scanCash(row scanner) (domain.CashAccount, error) {
	var item domain.CashAccount
	err := row.Scan(&item.ID, &item.AccountName, &item.AccountType, &item.Currency, &item.Balance, &item.Notes, &item.IsActive, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func scanCashAdjustment(row scanner) (domain.CashAdjustment, error) {
	var item domain.CashAdjustment
	err := row.Scan(
		&item.ID,
		&item.CashAccountID,
		&item.AdjustmentDate,
		&item.Type,
		&item.Amount,
		&item.BalanceBefore,
		&item.BalanceAfter,
		&item.Currency,
		&item.Note,
		&item.CreatedBy,
		&item.CreatedAt,
	)
	return item, err
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

func validateInstrument(input instrumentInput) error {
	validTypes := map[string]bool{"stock": true, "etf": true, "mutual_fund": true, "gold": true, "cash": true, "other": true}
	if !validTypes[input.Type] {
		return validation("Tipe instrumen tidak valid")
	}
	if strings.TrimSpace(input.Name) == "" {
		return validation("Nama instrumen wajib diisi")
	}
	if strings.TrimSpace(input.Currency) == "" {
		return validation("Currency wajib diisi")
	}
	for _, categoryID := range input.CategoryIDs {
		if _, err := uuid.Parse(strings.TrimSpace(categoryID)); err != nil {
			return validation("Kategori instrumen tidak valid")
		}
	}
	return nil
}

func replaceInstrumentCategories(ctx context.Context, tx pgx.Tx, instrumentID string, categoryIDs []string) error {
	if _, err := tx.Exec(ctx, `DELETE FROM instrument_categories WHERE instrument_id = $1`, instrumentID); err != nil {
		return err
	}
	for _, categoryID := range categoryIDs {
		if strings.TrimSpace(categoryID) == "" {
			continue
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO instrument_categories (instrument_id, category_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, instrumentID, strings.TrimSpace(categoryID)); err != nil {
			return err
		}
	}
	return nil
}

func validateCash(input cashInput) error {
	if strings.TrimSpace(input.AccountName) == "" {
		return validation("Nama akun cash wajib diisi")
	}
	if strings.TrimSpace(input.Currency) == "" {
		return validation("Currency wajib diisi")
	}
	return nil
}

func normalizeCashAdjustment(input cashAdjustmentInput) (string, string, float64, error) {
	adjustmentDate := strings.TrimSpace(input.AdjustmentDate)
	if adjustmentDate == "" {
		adjustmentDate = time.Now().Format("2006-01-02")
	} else {
		parsed, err := parseDate(adjustmentDate)
		if err != nil {
			return "", "", 0, validation("Tanggal adjustment wajib format YYYY-MM-DD")
		}
		adjustmentDate = parsed
	}

	kind := strings.ToLower(strings.TrimSpace(input.Type))
	validTypes := map[string]bool{
		"deposit":      true,
		"withdrawal":   true,
		"correction":   true,
		"transfer_in":  true,
		"transfer_out": true,
	}
	if !validTypes[kind] {
		return "", "", 0, validation("Tipe adjustment cash tidak valid")
	}
	if input.Amount <= 0 {
		return "", "", 0, validation("Nominal adjustment wajib lebih dari 0")
	}

	delta := roundMoney(input.Amount)
	switch kind {
	case "withdrawal", "transfer_out":
		delta = -delta
	}

	return adjustmentDate, kind, delta, nil
}

func parseDate(value string) (string, error) {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return "", err
	}
	return parsed.Format("2006-01-02"), nil
}

func roundMoney(value float64) float64 {
	return math.Round(value*100) / 100
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

func pathUUID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id := chi.URLParam(r, "id")
	if _, err := uuid.Parse(id); err != nil {
		response.Error(w, r, validation("ID tidak valid"))
		return "", false
	}
	return id, true
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

func defaultString(value string, fallback string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	return value
}

func decodeJSON(bytes []byte) any {
	if len(bytes) == 0 {
		return nil
	}
	var value any
	if err := json.Unmarshal(bytes, &value); err != nil {
		return nil
	}
	return value
}
