package savings

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
	router.Get("/", h.listGoals)
	router.Post("/", h.createGoal)
	router.Put("/{id}", h.updateGoal)
	router.Delete("/{id}", h.deleteGoal)
	return router
}

type SavingsGoal struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	TargetAmount    float64   `json:"target_amount"`
	CurrentAmount   float64   `json:"current_amount"`
	RemainingAmount float64   `json:"remaining_amount"`
	ProgressPercent float64   `json:"progress_percent"`
	TargetDate      *string   `json:"target_date,omitempty"`
	Notes           *string   `json:"notes,omitempty"`
	IsActive        bool      `json:"is_active"`
	IsCompleted     bool      `json:"is_completed"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type input struct {
	Name          string  `json:"name"`
	TargetAmount  float64 `json:"target_amount"`
	CurrentAmount float64 `json:"current_amount"`
	TargetDate    *string `json:"target_date"`
	Notes         *string `json:"notes"`
	IsActive      *bool   `json:"is_active"`
}

func (h Handler) listGoals(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	rows, err := h.db.Query(r.Context(), goalSelect()+`
		WHERE user_id = $1 AND is_active = TRUE
		ORDER BY is_completed ASC, target_date NULLS LAST, created_at DESC
	`, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat tujuan tabungan"))
		return
	}
	defer rows.Close()

	items := []SavingsGoal{}
	for rows.Next() {
		item, err := scanGoal(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca tujuan tabungan"))
			return
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		response.Error(w, r, internalErr(err, "Gagal membaca tujuan tabungan"))
		return
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) createGoal(w http.ResponseWriter, r *http.Request) {
	var in input
	if err := response.DecodeJSON(r, &in); err != nil {
		response.Error(w, r, err)
		return
	}
	normalized, err := normalize(in)
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
		INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, notes, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id::text
	`, user.ID, normalized.Name, normalized.TargetAmount, normalized.CurrentAmount, normalized.TargetDate, cleanPtr(in.Notes), isActive).Scan(&id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyimpan tujuan tabungan"))
		return
	}
	item, err := h.getGoalByID(r.Context(), user.ID, id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat tujuan tabungan terbaru"))
		return
	}
	h.writeAudit(r, "create", item.ID, nil, item)
	response.JSON(w, r, http.StatusCreated, item, nil)
}

func (h Handler) updateGoal(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getGoalByID(r.Context(), user.ID, id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Tujuan tabungan tidak ditemukan"))
		return
	}

	var in input
	if err := response.DecodeJSON(r, &in); err != nil {
		response.Error(w, r, err)
		return
	}
	normalized, err := normalize(in)
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
		UPDATE savings_goals
		SET name = $3, target_amount = $4, current_amount = $5, target_date = $6, notes = $7, is_active = $8, updated_at = now()
		WHERE id = $1 AND user_id = $2
		RETURNING id::text
	`, id, user.ID, normalized.Name, normalized.TargetAmount, normalized.CurrentAmount, normalized.TargetDate, cleanPtr(in.Notes), isActive).Scan(&updatedID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Tujuan tabungan tidak ditemukan"))
		return
	}
	item, err := h.getGoalByID(r.Context(), user.ID, updatedID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat tujuan tabungan terbaru"))
		return
	}
	h.writeAudit(r, "update", item.ID, before, item)
	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) deleteGoal(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	before, err := h.getGoalByID(r.Context(), user.ID, id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Tujuan tabungan tidak ditemukan"))
		return
	}
	if _, err := h.db.Exec(r.Context(), `UPDATE savings_goals SET is_active = FALSE, updated_at = now() WHERE id = $1 AND user_id = $2`, id, user.ID); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menonaktifkan tujuan tabungan"))
		return
	}
	h.writeAudit(r, "delete", id, before, map[string]any{"is_active": false})
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "deleted"}, nil)
}

type normalizedInput struct {
	Name          string
	TargetAmount  float64
	CurrentAmount float64
	TargetDate    *string
}

func normalize(in input) (normalizedInput, error) {
	name := strings.TrimSpace(in.Name)
	if name == "" {
		return normalizedInput{}, validation("Nama tujuan tabungan wajib diisi")
	}
	if in.TargetAmount <= 0 {
		return normalizedInput{}, validation("Target tabungan wajib lebih dari 0")
	}
	if in.CurrentAmount < 0 {
		return normalizedInput{}, validation("Progress tabungan tidak boleh negatif")
	}
	targetDate, err := parseDatePtr(in.TargetDate)
	if err != nil {
		return normalizedInput{}, err
	}
	return normalizedInput{
		Name:          name,
		TargetAmount:  in.TargetAmount,
		CurrentAmount: in.CurrentAmount,
		TargetDate:    targetDate,
	}, nil
}

func (h Handler) getGoalByID(ctx context.Context, userID string, id string) (SavingsGoal, error) {
	return scanGoal(h.db.QueryRow(ctx, goalSelect()+`
		WHERE user_id = $1 AND id = $2
	`, userID, id))
}

func goalSelect() string {
	return `
		SELECT id::text, name, target_amount::float8, current_amount::float8,
		       (target_amount - current_amount)::float8 AS remaining_amount,
		       CASE WHEN target_amount > 0 THEN current_amount / target_amount ELSE 0 END::float8 AS progress_percent,
		       to_char(target_date, 'YYYY-MM-DD') AS target_date,
		       notes, is_active, current_amount >= target_amount AS is_completed,
		       created_at, updated_at
		FROM savings_goals
	`
}

type scanner interface {
	Scan(dest ...any) error
}

func scanGoal(row scanner) (SavingsGoal, error) {
	var item SavingsGoal
	err := row.Scan(
		&item.ID,
		&item.Name,
		&item.TargetAmount,
		&item.CurrentAmount,
		&item.RemainingAmount,
		&item.ProgressPercent,
		&item.TargetDate,
		&item.Notes,
		&item.IsActive,
		&item.IsCompleted,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	return item, err
}

func parseDatePtr(value *string) (*string, error) {
	if value == nil {
		return nil, nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil, nil
	}
	if _, err := time.Parse("2006-01-02", trimmed); err != nil {
		return nil, validation("Deadline tujuan tabungan harus format YYYY-MM-DD")
	}
	return &trimmed, nil
}

func (h Handler) writeAudit(r *http.Request, action string, entityID string, before any, after any) {
	user, _ := auth.UserFromContext(r.Context())
	actorID := user.ID
	_ = audit.Log(r.Context(), h.db, audit.Entry{
		ActorUserID: &actorID,
		Action:      action,
		EntityType:  "savings_goal",
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
