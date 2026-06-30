package config

import (
	"os"
	"strings"
)

type Config struct {
	Environment        string
	Port               string
	DatabaseURL        string
	BaseCurrency       string
	Timezone           string
	CORSAllowedOrigins []string
}

func Load() Config {
	return Config{
		Environment:        getEnv("APP_ENV", "development"),
		Port:               getEnv("APP_PORT", "8080"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		BaseCurrency:       getEnv("BASE_CURRENCY", "IDR"),
		Timezone:           getEnv("DEFAULT_TIMEZONE", "Asia/Jakarta"),
		CORSAllowedOrigins: splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
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
