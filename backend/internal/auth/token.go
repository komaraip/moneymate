package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"moneymate/backend/internal/config"
	"moneymate/backend/internal/domain"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type TokenManager struct {
	cfg config.Config
}

func NewTokenManager(cfg config.Config) TokenManager {
	return TokenManager{cfg: cfg}
}

func (m TokenManager) IssueAccessToken(user domain.User) (string, time.Time, error) {
	expiresAt := time.Now().Add(m.cfg.AccessTokenTTL)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	})

	signed, err := token.SignedString([]byte(m.cfg.JWTAccessSecret))
	if err != nil {
		return "", time.Time{}, fmt.Errorf("sign access token: %w", err)
	}

	return signed, expiresAt, nil
}

func (m TokenManager) ParseAccessToken(rawToken string) (Claims, error) {
	claims := Claims{}
	token, err := jwt.ParseWithClaims(rawToken, &claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(m.cfg.JWTAccessSecret), nil
	})
	if err != nil {
		return Claims{}, fmt.Errorf("parse access token: %w", err)
	}
	if !token.Valid {
		return Claims{}, fmt.Errorf("invalid access token")
	}

	return claims, nil
}

func GenerateRefreshToken() (string, string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", fmt.Errorf("generate refresh token: %w", err)
	}

	raw := base64.RawURLEncoding.EncodeToString(bytes)
	return raw, HashRefreshToken(raw), nil
}

func HashRefreshToken(rawToken string) string {
	sum := sha256.Sum256([]byte(rawToken))
	return hex.EncodeToString(sum[:])
}
