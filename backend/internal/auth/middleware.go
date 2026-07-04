package auth

import (
	"context"
	"net/http"
	"strings"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/domain"
	"moneymate/backend/internal/httpapi/response"
)

type contextKey string

const userContextKey contextKey = "auth_user"

func RequireAuth(service *Service) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := bearerToken(r)
			if token == "" {
				response.Error(w, r, apperror.New(apperror.CodeUnauthorized, "Access token wajib diisi", http.StatusUnauthorized))
				return
			}

			claims, err := service.TokenManager().ParseAccessToken(token)
			if err != nil {
				response.Error(w, r, apperror.New(apperror.CodeUnauthorized, "Access token tidak valid", http.StatusUnauthorized))
				return
			}

			user, err := service.UserFromClaims(r.Context(), claims)
			if err != nil {
				response.Error(w, r, err)
				return
			}

			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), userContextKey, user)))
		})
	}
}

func RequireRoles(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := UserFromContext(r.Context())
			if !ok {
				response.Error(w, r, apperror.New(apperror.CodeUnauthorized, "User tidak ditemukan pada sesi", http.StatusUnauthorized))
				return
			}

			if err := RequireRole(user, roles...); err != nil {
				response.Error(w, r, apperror.New(apperror.CodeForbidden, "Kamu tidak memiliki akses untuk aksi ini", http.StatusForbidden))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func RequireAdmin() func(http.Handler) http.Handler {
	return RequireRoles("admin")
}

func UserFromContext(ctx context.Context) (domain.User, bool) {
	user, ok := ctx.Value(userContextKey).(domain.User)
	return user, ok
}

func bearerToken(r *http.Request) string {
	header := r.Header.Get("Authorization")
	if header == "" {
		return ""
	}

	value := strings.TrimSpace(strings.TrimPrefix(header, "Bearer"))
	if value == header {
		return ""
	}

	return value
}
