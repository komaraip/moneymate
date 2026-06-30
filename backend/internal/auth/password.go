package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"

	"golang.org/x/crypto/argon2"
)

const (
	argonMemory      = 64 * 1024
	argonIterations  = 3
	argonParallelism = 2
	argonSaltLength  = 16
	argonKeyLength   = 32
)

func HashPassword(password string) (string, error) {
	salt := make([]byte, argonSaltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("generate salt: %w", err)
	}

	hash := argon2.IDKey([]byte(password), salt, argonIterations, argonMemory, argonParallelism, argonKeyLength)

	return fmt.Sprintf(
		"$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		argonMemory,
		argonIterations,
		argonParallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	), nil
}

func VerifyPassword(password string, encodedHash string) (bool, error) {
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 || parts[1] != "argon2id" {
		return false, fmt.Errorf("invalid password hash")
	}

	params := strings.Split(parts[3], ",")
	if len(params) != 3 {
		return false, fmt.Errorf("invalid argon2 params")
	}

	memory, err := parseParam(params[0], "m")
	if err != nil {
		return false, err
	}

	iterations, err := parseParam(params[1], "t")
	if err != nil {
		return false, err
	}

	parallelism, err := parseParam(params[2], "p")
	if err != nil {
		return false, err
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, fmt.Errorf("decode salt: %w", err)
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, fmt.Errorf("decode hash: %w", err)
	}

	actualHash := argon2.IDKey([]byte(password), salt, uint32(iterations), uint32(memory), uint8(parallelism), uint32(len(expectedHash)))

	return subtle.ConstantTimeCompare(actualHash, expectedHash) == 1, nil
}

func parseParam(value string, key string) (int, error) {
	prefix := key + "="
	if !strings.HasPrefix(value, prefix) {
		return 0, fmt.Errorf("invalid argon2 param %s", key)
	}

	parsed, err := strconv.Atoi(strings.TrimPrefix(value, prefix))
	if err != nil {
		return 0, fmt.Errorf("parse argon2 param %s: %w", key, err)
	}

	return parsed, nil
}
