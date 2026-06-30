package auth

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/httpapi/response"
)

type Handler struct {
	service *Service
	cfg     config.Config
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewHandler(service *Service, cfg config.Config) Handler {
	return Handler{service: service, cfg: cfg}
}

func (h Handler) Routes() chi.Router {
	router := chi.NewRouter()

	router.Post("/login", h.login)
	router.Post("/refresh", h.refresh)
	router.Post("/logout", h.logout)
	router.With(RequireAuth(h.service)).Get("/me", h.me)

	return router
}

func (h Handler) login(w http.ResponseWriter, r *http.Request) {
	var input loginRequest
	if err := response.DecodeJSON(r, &input); err != nil {
		response.Error(w, r, err)
		return
	}

	result, err := h.service.Login(r.Context(), input.Email, input.Password, r.UserAgent(), ClientIP(r))
	if err != nil {
		response.Error(w, r, err)
		return
	}

	h.setRefreshCookie(w, result.RefreshToken, result.RefreshExpiresAt)
	response.JSON(w, r, http.StatusOK, result, nil)
}

func (h Handler) refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(RefreshCookieName)
	if err != nil {
		response.Error(w, r, apperror.New(apperror.CodeUnauthorized, "Sesi tidak ditemukan", http.StatusUnauthorized))
		return
	}

	result, err := h.service.Refresh(r.Context(), cookie.Value)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	response.JSON(w, r, http.StatusOK, result, nil)
}

func (h Handler) logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(RefreshCookieName)
	if err == nil {
		if logoutErr := h.service.Logout(r.Context(), cookie.Value); logoutErr != nil {
			response.Error(w, r, logoutErr)
			return
		}
	}

	h.clearRefreshCookie(w)
	response.JSON(w, r, http.StatusOK, map[string]string{"status": "logged_out"}, nil)
}

func (h Handler) me(w http.ResponseWriter, r *http.Request) {
	user, _ := UserFromContext(r.Context())
	response.JSON(w, r, http.StatusOK, user, nil)
}

func (h Handler) setRefreshCookie(w http.ResponseWriter, value string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     RefreshCookieName,
		Value:    value,
		Path:     "/api/v1/auth",
		Expires:  expiresAt,
		MaxAge:   int(time.Until(expiresAt).Seconds()),
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}

func (h Handler) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     RefreshCookieName,
		Value:    "",
		Path:     "/api/v1/auth",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}
