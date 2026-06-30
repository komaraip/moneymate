package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/domain"
)

const RefreshCookieName = "moneymate_refresh_token"

type Service struct {
	db     *pgxpool.Pool
	cfg    config.Config
	tokens TokenManager
}

type LoginResult struct {
	AccessToken      string      `json:"access_token"`
	AccessExpiresAt  time.Time   `json:"access_expires_at"`
	User             domain.User `json:"user"`
	RefreshToken     string      `json:"-"`
	RefreshExpiresAt time.Time   `json:"-"`
}

func NewService(db *pgxpool.Pool, cfg config.Config) *Service {
	return &Service{
		db:     db,
		cfg:    cfg,
		tokens: NewTokenManager(cfg),
	}
}

func (s *Service) Login(ctx context.Context, email string, password string, userAgent string, ipAddress string) (LoginResult, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || password == "" {
		return LoginResult{}, apperror.New(apperror.CodeValidation, "Email dan password wajib diisi", http.StatusBadRequest)
	}

	user, err := s.getUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return LoginResult{}, apperror.New(apperror.CodeUnauthorized, "Email atau password tidak sesuai", http.StatusUnauthorized)
		}
		return LoginResult{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal memproses login", http.StatusInternalServerError)
	}
	if !user.IsActive {
		return LoginResult{}, apperror.New(apperror.CodeForbidden, "Akun tidak aktif", http.StatusForbidden)
	}

	ok, err := VerifyPassword(password, user.PasswordHash)
	if err != nil || !ok {
		return LoginResult{}, apperror.New(apperror.CodeUnauthorized, "Email atau password tidak sesuai", http.StatusUnauthorized)
	}

	accessToken, accessExpiresAt, err := s.tokens.IssueAccessToken(user)
	if err != nil {
		return LoginResult{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal membuat access token", http.StatusInternalServerError)
	}

	refreshToken, refreshHash, err := GenerateRefreshToken()
	if err != nil {
		return LoginResult{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal membuat refresh token", http.StatusInternalServerError)
	}

	refreshExpiresAt := time.Now().Add(s.cfg.RefreshTokenTTL)
	if _, err := s.db.Exec(ctx, `
		INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`, user.ID, refreshHash, userAgent, ipAddress, refreshExpiresAt); err != nil {
		return LoginResult{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal menyimpan sesi", http.StatusInternalServerError)
	}

	return LoginResult{
		AccessToken:      accessToken,
		AccessExpiresAt:  accessExpiresAt,
		User:             sanitizeUser(user),
		RefreshToken:     refreshToken,
		RefreshExpiresAt: refreshExpiresAt,
	}, nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (LoginResult, error) {
	if refreshToken == "" {
		return LoginResult{}, apperror.New(apperror.CodeUnauthorized, "Sesi tidak ditemukan", http.StatusUnauthorized)
	}

	user, err := s.getUserByRefreshToken(ctx, HashRefreshToken(refreshToken))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return LoginResult{}, apperror.New(apperror.CodeUnauthorized, "Sesi tidak valid", http.StatusUnauthorized)
		}
		return LoginResult{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal memperbarui sesi", http.StatusInternalServerError)
	}

	accessToken, accessExpiresAt, err := s.tokens.IssueAccessToken(user)
	if err != nil {
		return LoginResult{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal membuat access token", http.StatusInternalServerError)
	}

	return LoginResult{
		AccessToken:     accessToken,
		AccessExpiresAt: accessExpiresAt,
		User:            sanitizeUser(user),
	}, nil
}

func (s *Service) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}

	if _, err := s.db.Exec(ctx, `
		UPDATE sessions
		SET revoked_at = now()
		WHERE refresh_token_hash = $1 AND revoked_at IS NULL
	`, HashRefreshToken(refreshToken)); err != nil {
		return apperror.Wrap(err, apperror.CodeInternal, "Gagal logout", http.StatusInternalServerError)
	}

	return nil
}

func (s *Service) UserFromClaims(ctx context.Context, claims Claims) (domain.User, error) {
	user, err := s.getUserByID(ctx, claims.UserID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.User{}, apperror.New(apperror.CodeUnauthorized, "User tidak ditemukan", http.StatusUnauthorized)
		}
		return domain.User{}, apperror.Wrap(err, apperror.CodeInternal, "Gagal memuat user", http.StatusInternalServerError)
	}
	if !user.IsActive {
		return domain.User{}, apperror.New(apperror.CodeForbidden, "Akun tidak aktif", http.StatusForbidden)
	}

	return sanitizeUser(user), nil
}

func (s *Service) TokenManager() TokenManager {
	return s.tokens
}

func (s *Service) getUserByEmail(ctx context.Context, email string) (domain.User, error) {
	return scanUser(s.db.QueryRow(ctx, `
		SELECT id::text, email, full_name, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE lower(email) = $1
	`, strings.ToLower(email)))
}

func (s *Service) getUserByID(ctx context.Context, id string) (domain.User, error) {
	return scanUser(s.db.QueryRow(ctx, `
		SELECT id::text, email, full_name, password_hash, role, is_active, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id))
}

func (s *Service) getUserByRefreshToken(ctx context.Context, refreshHash string) (domain.User, error) {
	return scanUser(s.db.QueryRow(ctx, `
		SELECT u.id::text, u.email, u.full_name, u.password_hash, u.role, u.is_active, u.created_at, u.updated_at
		FROM sessions s
		JOIN users u ON u.id = s.user_id
		WHERE s.refresh_token_hash = $1
		  AND s.revoked_at IS NULL
		  AND s.expires_at > now()
		  AND u.is_active = TRUE
	`, refreshHash))
}

type userRow interface {
	Scan(dest ...any) error
}

func scanUser(row userRow) (domain.User, error) {
	var user domain.User
	if err := row.Scan(
		&user.ID,
		&user.Email,
		&user.FullName,
		&user.PasswordHash,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return domain.User{}, err
	}

	return user, nil
}

func sanitizeUser(user domain.User) domain.User {
	user.PasswordHash = ""
	return user
}

func ClientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		return strings.TrimSpace(parts[0])
	}

	return r.RemoteAddr
}

func RequireRole(user domain.User, allowedRoles ...string) error {
	for _, role := range allowedRoles {
		if user.Role == role {
			return nil
		}
	}

	return fmt.Errorf("role %s is not allowed", user.Role)
}
