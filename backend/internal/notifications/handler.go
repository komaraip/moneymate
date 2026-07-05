package notifications

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
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

	router.Get("/", h.list)
	router.Put("/read-all", h.markAllAsRead)
	
	router.Get("/settings", h.getSettings)
	router.Put("/settings", h.updateSettings)

	return router
}

type Notification struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"desc"` // Named desc to match frontend expectation
	IsRead      bool      `json:"read"` // Named read to match frontend expectation
	Time        string    `json:"time"` // Will format created_at here
	CreatedAt   time.Time `json:"-"`
}

func (h Handler) list(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeUnauthorized, "User not found", http.StatusUnauthorized))
		return
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT id, title, description, is_read, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, user.ID)
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Failed to load notifications", http.StatusInternalServerError))
		return
	}
	defer rows.Close()

	items := []Notification{}
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.Title, &n.Description, &n.IsRead, &n.CreatedAt); err != nil {
			response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Failed to parse notifications", http.StatusInternalServerError))
			return
		}
		
		// Format time relative
		n.Time = timeSince(n.CreatedAt)
		
		items = append(items, n)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) markAllAsRead(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeUnauthorized, "User not found", http.StatusUnauthorized))
		return
	}

	_, err = h.db.Exec(r.Context(), `
		UPDATE notifications
		SET is_read = TRUE
		WHERE user_id = $1 AND is_read = FALSE
	`, user.ID)
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Failed to update notifications", http.StatusInternalServerError))
		return
	}

	response.JSON(w, r, http.StatusOK, map[string]string{"status": "success"}, nil)
}

type NotificationSettings struct {
	BudgetAlerts      bool `json:"budgetAlerts"`
	WeeklySummaries   bool `json:"weeklySummaries"`
	TransactionAlerts bool `json:"transactionAlerts"`
	SecurityAlerts    bool `json:"securityAlerts"`
}

func (h Handler) getSettings(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeUnauthorized, "User not found", http.StatusUnauthorized))
		return
	}

	settings := NotificationSettings{
		BudgetAlerts:      true,
		WeeklySummaries:   false,
		TransactionAlerts: true,
		SecurityAlerts:    true,
	}

	err = h.db.QueryRow(r.Context(), `
		SELECT budget_alerts, weekly_summaries, transaction_alerts, security_alerts
		FROM user_notification_settings
		WHERE user_id = $1
	`, user.ID).Scan(&settings.BudgetAlerts, &settings.WeeklySummaries, &settings.TransactionAlerts, &settings.SecurityAlerts)

	// If error is no rows, we just return the defaults above
	
	response.JSON(w, r, http.StatusOK, settings, nil)
}

func (h Handler) updateSettings(w http.ResponseWriter, r *http.Request) {
	user, err := auth.UserFromContext(r.Context())
	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeUnauthorized, "User not found", http.StatusUnauthorized))
		return
	}

	var req NotificationSettings
	if err := response.DecodeJSON(w, r, &req); err != nil {
		return
	}

	_, err = h.db.Exec(r.Context(), `
		INSERT INTO user_notification_settings (user_id, budget_alerts, weekly_summaries, transaction_alerts, security_alerts, updated_at)
		VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id) DO UPDATE SET
			budget_alerts = EXCLUDED.budget_alerts,
			weekly_summaries = EXCLUDED.weekly_summaries,
			transaction_alerts = EXCLUDED.transaction_alerts,
			security_alerts = EXCLUDED.security_alerts,
			updated_at = CURRENT_TIMESTAMP
	`, user.ID, req.BudgetAlerts, req.WeeklySummaries, req.TransactionAlerts, req.SecurityAlerts)

	if err != nil {
		response.Error(w, r, apperror.Wrap(err, apperror.CodeInternal, "Failed to save settings", http.StatusInternalServerError))
		return
	}

	response.JSON(w, r, http.StatusOK, map[string]string{"status": "success"}, nil)
}

func timeSince(t time.Time) string {
	d := time.Since(t)
	if d < time.Minute {
		return "Just now"
	} else if d < time.Hour {
		return string(d.Round(time.Minute).String()) + " ago"
	} else if d < 24*time.Hour {
		return string(d.Round(time.Hour).String()) + " ago"
	}
	return t.Format("Jan 02, 2006")
}
