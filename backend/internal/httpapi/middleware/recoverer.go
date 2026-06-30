package middleware

import (
	"log/slog"
	"net/http"

	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/httpapi/response"
)

func Recoverer(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if recovered := recover(); recovered != nil {
					logger.Error(
						"panic recovered",
						"request_id", chimiddleware.GetReqID(r.Context()),
						"panic", recovered,
					)
					response.Error(w, r, apperror.New(
						apperror.CodeInternal,
						"Terjadi kesalahan pada server",
						http.StatusInternalServerError,
					))
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}
