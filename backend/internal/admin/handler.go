package admin

import (
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
	router.Get("/overview", h.overview)
	router.Get("/users", h.listUsers)
	router.Put("/users/{id}", h.updateUser)
	return router
}

type Overview struct {
	TotalUsers       int    `json:"total_users"`
	ActiveUsers      int    `json:"active_users"`
	InactiveUsers    int    `json:"inactive_users"`
	AdminUsers       int    `json:"admin_users"`
	RegularUsers     int    `json:"regular_users"`
	AuditLogsLast7D  int    `json:"audit_logs_last_7d"`
	PrivacyStatement string `json:"privacy_statement"`
}

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type updateInput struct {
	Role     *string `json:"role"`
	IsActive *bool   `json:"is_active"`
}

func (h Handler) overview(w http.ResponseWriter, r *http.Request) {
	var item Overview
	if err := h.db.QueryRow(r.Context(), `
		SELECT COUNT(*)::int,
		       COUNT(*) FILTER (WHERE is_active)::int,
		       COUNT(*) FILTER (WHERE NOT is_active)::int,
		       COUNT(*) FILTER (WHERE role = 'admin')::int,
		       COUNT(*) FILTER (WHERE role = 'user')::int
		FROM users
	`).Scan(&item.TotalUsers, &item.ActiveUsers, &item.InactiveUsers, &item.AdminUsers, &item.RegularUsers); err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat ringkasan admin"))
		return
	}
	if err := h.db.QueryRow(r.Context(), `SELECT COUNT(*)::int FROM audit_logs WHERE created_at >= now() - INTERVAL '7 days'`).Scan(&item.AuditLogsLast7D); err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat ringkasan audit"))
		return
	}
	item.PrivacyStatement = "Admin hanya melihat metadata akun dan audit log. Data transaksi, kas, portofolio, anggaran, dan tujuan tabungan pengguna lain tidak dibuka di dashboard admin."
	response.JSON(w, r, http.StatusOK, item, nil)
}

func (h Handler) listUsers(w http.ResponseWriter, r *http.Request) {
	search := strings.TrimSpace(r.URL.Query().Get("search"))
	role := strings.TrimSpace(r.URL.Query().Get("role"))
	active := strings.TrimSpace(r.URL.Query().Get("is_active"))
	if role != "" && role != "admin" && role != "user" {
		response.Error(w, r, validation("Filter role harus admin atau user"))
		return
	}
	if active != "" && active != "true" && active != "false" {
		response.Error(w, r, validation("Filter status aktif harus true atau false"))
		return
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, email, full_name, role, is_active, created_at, updated_at
		FROM users
		WHERE ($1 = '' OR email ILIKE '%' || $1 || '%' OR full_name ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR role = $2)
		  AND ($3 = '' OR is_active = ($3 = 'true'))
		ORDER BY created_at DESC
		LIMIT 100
	`, search, role, active)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat daftar pengguna"))
		return
	}
	defer rows.Close()

	items := []User{}
	for rows.Next() {
		var item User
		if err := rows.Scan(&item.ID, &item.Email, &item.FullName, &item.Role, &item.IsActive, &item.CreatedAt, &item.UpdatedAt); err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca pengguna"))
			return
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		response.Error(w, r, internalErr(err, "Gagal membaca pengguna"))
		return
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) updateUser(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	var in updateInput
	if err := response.DecodeJSON(r, &in); err != nil {
		response.Error(w, r, err)
		return
	}
	if in.Role == nil && in.IsActive == nil {
		response.Error(w, r, validation("Role atau status aktif wajib diisi"))
		return
	}
	if in.Role != nil {
		role := strings.TrimSpace(*in.Role)
		if role != "admin" && role != "user" {
			response.Error(w, r, validation("Role harus admin atau user"))
			return
		}
		in.Role = &role
	}

	actor, _ := auth.UserFromContext(r.Context())
	before, err := h.getUserByID(r, id)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Pengguna tidak ditemukan"))
		return
	}
	if before.ID == actor.ID {
		if in.IsActive != nil && !*in.IsActive {
			response.Error(w, r, validation("Admin tidak dapat menonaktifkan akun sendiri"))
			return
		}
		if in.Role != nil && *in.Role != "admin" {
			response.Error(w, r, validation("Admin tidak dapat menurunkan role akun sendiri"))
			return
		}
	}

	var updatedID string
	err = h.db.QueryRow(r.Context(), `
		UPDATE users
		SET role = COALESCE($2::text, role),
		    is_active = COALESCE($3::boolean, is_active),
		    updated_at = now()
		WHERE id = $1
		RETURNING id::text
	`, id, in.Role, in.IsActive).Scan(&updatedID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Pengguna tidak ditemukan"))
		return
	}
	after, err := h.getUserByID(r, updatedID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat pengguna terbaru"))
		return
	}
	h.writeAudit(r, "update", after.ID, before, after)
	response.JSON(w, r, http.StatusOK, after, nil)
}

func (h Handler) getUserByID(r *http.Request, id string) (User, error) {
	var item User
	err := h.db.QueryRow(r.Context(), `
		SELECT id::text, email, full_name, role, is_active, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id).Scan(&item.ID, &item.Email, &item.FullName, &item.Role, &item.IsActive, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (h Handler) writeAudit(r *http.Request, action string, entityID string, before any, after any) {
	user, _ := auth.UserFromContext(r.Context())
	actorID := user.ID
	_ = audit.Log(r.Context(), h.db, audit.Entry{
		ActorUserID: &actorID,
		Action:      action,
		EntityType:  "user",
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
