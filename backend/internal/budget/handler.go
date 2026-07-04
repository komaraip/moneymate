package budget

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
	"moneymate/backend/internal/httpapi/response"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) Handler {
	return Handler{db: db}
}

func (h Handler) Routes() chi.Router {
	router := chi.NewRouter()
	router.Get("/", h.listBudgets)
	router.Post("/", h.createBudget)
	router.Put("/{id}", h.updateBudget)
	router.Delete("/{id}", h.deleteBudget)
	return router
}

type Budget struct {
	ID           string    `json:"id"`
	CategoryID   string    `json:"category_id"`
	CategoryName string    `json:"category_name"`
	Month        string    `json:"month"`
	Amount       float64   `json:"amount"`
	Spent        float64   `json:"spent"`
	Remaining    float64   `json:"remaining"`
	PercentUsed  float64   `json:"percent_used"`
	OverBudget   bool      `json:"over_budget"`
	Notes        *string   `json:"notes,omitempty"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type input struct {
	CategoryID string  `json:"category_id"`
	Month      string  `json:"month"`
	Amount     float64 `json:"amount"`
	Notes      *string `json:"notes"`
	IsActive   *bool   `json:"is_active"`
}

func (h Handler) listBudgets(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	month, err := parseMonth(strings.TrimSpace(r.URL.Query().Get("month")))
	if err != nil {
		response.Error(w, r, err)
		return
	}

	items, err := h.loadBudgets(r.Context(), user.ID, month)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat anggaran"))
		return
	}
	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) createBudget(w http.ResponseWriter, r *http.Request) {
	var in input
	if err := response.DecodeJSON(r, &in); err != nil {
		response.Error(w, r, err)
		return
	}
	normalized, err := h.normalize(r.Context(), r, in)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	user, _ := auth.UserFromContext(r.Context())
	isActive := true
	if in.IsActive != nil {
		isActive = *in.IsActive
	}

	var id string
	err = h.db.QueryRow(r.Context(), `
		INSERT INTO budgets (user_id, category_id, month, amount, notes, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id, category_id, month) DO UPDATE
		SET amount = EXCLUDED.amount,
		    notes = EXCLUDED.notes,
		    is_active = EXCLUDED.is_active,
		    updated_at = now()
		RETURNING id::text
	`, user.ID, normalized.CategoryID, normalized.Month, normalized.Amount, cleanPtr(in.Notes), isActive).Scan(&id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyimpan anggaran"))
		return
	}
	item, err := h.getBudgetByID(r.Context(), user.ID, id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat anggaran terbaru"))
		return
	}
	h.writeAudit(r, "create", "budget", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, item, nil)
}

func (h Handler) updateBudget(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getBudgetByID(r.Context(), user.ID, id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Anggaran tidak ditemukan"))
		return
	}

	var in input
	if err := response.DecodeJSON(r, &in); err != nil {
		response.Error(w, r, err)
		return
	}
	normalized, err := h.normalize(r.Context(), r, in)
	if err != nil {
		response.Error(w, r, err)
		return
	}
	isActive := before.IsActive
	if in.IsActive != nil {
		isActive = *in.IsActive
	}

	var updatedID string
	err = h.db.QueryRow(r.Context(), `
		UPDATE budgets
		SET category_id = $3, month = $4, amount = $5, notes = $6, is_active = $7, updated_at = now()
		WHERE id = $1 AND user_id = $2
		RETURNING id::text
	`, id, user.ID, normalized.CategoryID, normalized.Month, normalized.Amount, cleanPtr(in.Notes), isActive).Scan(&updatedID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Anggaran tidak ditemukan"))
		return
	}
	item, err := h.getBudgetByID(r.Context(), user.ID, updatedID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat anggaran terbaru"))
		return
	}
	h.writeAudit(r, "update", "budget", item.ID, before, item)
	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) deleteBudget(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getBudgetByID(r.Context(), user.ID, id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Anggaran tidak ditemukan"))
		return
	}
	if _, err := h.db.Exec(r.Context(), `UPDATE budgets SET is_active = FALSE, updated_at = now() WHERE id = $1 AND user_id = $2`, id, user.ID); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menonaktifkan anggaran"))
		return
	}
	h.writeAudit(r, "delete", "budget", id, before, map[string]any{"is_active": false})
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "deleted"}, nil)
}

type normalizedInput struct {
	CategoryID string
	Month      string
	Amount     float64
}

func (h Handler) normalize(ctx context.Context, r *http.Request, in input) (normalizedInput, error) {
	user, _ := auth.UserFromContext(r.Context())
	if _, err := uuid.Parse(strings.TrimSpace(in.CategoryID)); err != nil {
		return normalizedInput{}, validation("Kategori anggaran wajib valid")
	}
	month, err := parseMonth(strings.TrimSpace(in.Month))
	if err != nil {
		return normalizedInput{}, err
	}
	if in.Amount <= 0 {
		return normalizedInput{}, validation("Nominal anggaran wajib lebih dari 0")
	}

	var categoryType string
	err = h.db.QueryRow(ctx, `
		SELECT type
		FROM transaction_categories
		WHERE id = $1 AND user_id = $2 AND is_active = TRUE
	`, strings.TrimSpace(in.CategoryID), user.ID).Scan(&categoryType)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return normalizedInput{}, validation("Kategori pengeluaran tidak ditemukan atau nonaktif")
		}
		return normalizedInput{}, internalErr(err, "Gagal memvalidasi kategori anggaran")
	}
	if categoryType != "expense" {
		return normalizedInput{}, validation("Anggaran hanya dapat dibuat untuk kategori pengeluaran")
	}
	return normalizedInput{CategoryID: strings.TrimSpace(in.CategoryID), Month: month, Amount: in.Amount}, nil
}

func (h Handler) loadBudgets(ctx context.Context, userID string, month string) ([]Budget, error) {
	rows, err := h.db.Query(ctx, budgetSelect()+`
		WHERE b.user_id = $1 AND b.month = $2::date AND b.is_active = TRUE
		ORDER BY over_budget DESC, percent_used DESC, tc.sort_order, tc.name
	`, userID, month)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Budget{}
	for rows.Next() {
		item, err := scanBudget(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (h Handler) getBudgetByID(ctx context.Context, userID string, id string) (Budget, error) {
	return scanBudget(h.db.QueryRow(ctx, budgetSelect()+`
		WHERE b.user_id = $1 AND b.id = $2
	`, userID, id))
}

func budgetSelect() string {
	return `
		WITH spent AS (
			SELECT t.user_id, t.category_id, date_trunc('month', t.transaction_date)::date AS month,
			       COALESCE(SUM(t.amount), 0)::float8 AS spent
			FROM transactions t
			WHERE t.type = 'expense'
			GROUP BY t.user_id, t.category_id, date_trunc('month', t.transaction_date)::date
		)
		SELECT b.id::text, b.category_id::text, tc.name, to_char(b.month, 'YYYY-MM') AS month,
		       b.amount::float8, COALESCE(spent.spent, 0)::float8,
		       (b.amount - COALESCE(spent.spent, 0))::float8 AS remaining,
		       CASE WHEN b.amount > 0 THEN COALESCE(spent.spent, 0) / b.amount ELSE 0 END::float8 AS percent_used,
		       COALESCE(spent.spent, 0) > b.amount AS over_budget,
		       b.notes, b.is_active, b.created_at, b.updated_at
		FROM budgets b
		JOIN transaction_categories tc ON tc.id = b.category_id
		LEFT JOIN spent ON spent.user_id = b.user_id AND spent.category_id = b.category_id AND spent.month = b.month
	`
}

type scanner interface {
	Scan(dest ...any) error
}

func scanBudget(row scanner) (Budget, error) {
	var item Budget
	err := row.Scan(
		&item.ID,
		&item.CategoryID,
		&item.CategoryName,
		&item.Month,
		&item.Amount,
		&item.Spent,
		&item.Remaining,
		&item.PercentUsed,
		&item.OverBudget,
		&item.Notes,
		&item.IsActive,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	return item, err
}

func parseMonth(value string) (string, error) {
	if value == "" {
		now := time.Now()
		return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC).Format("2006-01-02"), nil
	}
	parsed, err := time.Parse("2006-01", value)
	if err != nil {
		return "", validation("Bulan anggaran harus format YYYY-MM")
	}
	return parsed.Format("2006-01-02"), nil
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
