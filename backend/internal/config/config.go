package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Environment        string
	Port               string
	DatabaseURL        string
	BaseCurrency       string
	Timezone           string
	CORSAllowedOrigins []string
	MigrationsDir      string
	JWTAccessSecret    string
	JWTRefreshSecret   string
	CookieSecure       bool
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	SeedAdminEmail     string
	SeedAdminPassword  string
	SeedAdminName      string
}

func Load() Config {
	return Config{
		Environment:        getEnv("APP_ENV", "development"),
		Port:               getEnv("APP_PORT", "8080"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		BaseCurrency:       getEnv("BASE_CURRENCY", "IDR"),
		Timezone:           getEnv("DEFAULT_TIMEZONE", "Asia/Jakarta"),
		CORSAllowedOrigins: splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		MigrationsDir:      getEnv("MIGRATIONS_DIR", "db/migrations"),
		JWTAccessSecret:    getEnv("JWT_ACCESS_SECRET", "change_me_local_access_secret"),
		JWTRefreshSecret:   getEnv("JWT_REFRESH_SECRET", "change_me_local_refresh_secret"),
		CookieSecure:       getBool("COOKIE_SECURE", false),
		AccessTokenTTL:     15 * time.Minute,
		RefreshTokenTTL:    30 * 24 * time.Hour,
		SeedAdminEmail:     getEnv("SEED_ADMIN_EMAIL", getEnv("SEED_OWNER_EMAIL", "admin@moneymate.local")),
		SeedAdminPassword:  getEnv("SEED_ADMIN_PASSWORD", getEnv("SEED_OWNER_PASSWORD", "changeme-local-demo")),
		SeedAdminName:      getEnv("SEED_ADMIN_NAME", getEnv("SEED_OWNER_NAME", "MoneyMate Admin")),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

func getBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}

	return result
}
