package config

import "os"

type Config struct {
	Environment  string
	Port         string
	DatabaseURL  string
	BaseCurrency string
	Timezone     string
}

func Load() Config {
	return Config{
		Environment:  getEnv("APP_ENV", "development"),
		Port:         getEnv("APP_PORT", "8080"),
		DatabaseURL:  getEnv("DATABASE_URL", ""),
		BaseCurrency: getEnv("BASE_CURRENCY", "IDR"),
		Timezone:     getEnv("DEFAULT_TIMEZONE", "Asia/Jakarta"),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
