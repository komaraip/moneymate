package httpapi

import (
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"moneymate/backend/internal/config"
)

type routeKey struct {
	method string
	path   string
}

func TestOpenAPIPathsMatchRouter(t *testing.T) {
	documented := loadOpenAPIRoutes(t)
	actual := walkRouterRoutes(t)

	for route := range documented {
		if !actual[route] {
			t.Errorf("documented route is not registered by backend router: %s %s", route.method, route.path)
		}
	}

	for route := range actual {
		if !documented[route] {
			t.Errorf("backend route is missing from OpenAPI contract: %s %s", route.method, route.path)
		}
	}
}

func walkRouterRoutes(t *testing.T) map[routeKey]bool {
	t.Helper()

	handler := NewRouter(config.Config{
		Environment:        "test",
		BaseCurrency:       "IDR",
		CORSAllowedOrigins: []string{"http://localhost:5173"},
	}, slog.New(slog.NewTextHandler(io.Discard, nil)), nil, nil)

	routes, ok := handler.(chi.Routes)
	if !ok {
		t.Fatalf("router does not implement chi.Routes")
	}

	actual := map[routeKey]bool{}
	if err := chi.Walk(routes, func(method string, path string, _ http.Handler, _ ...func(http.Handler) http.Handler) error {
		if method == "HEAD" || method == "OPTIONS" {
			return nil
		}
		actual[routeKey{method: method, path: normalizeRoutePath(path)}] = true
		return nil
	}); err != nil {
		t.Fatalf("walk chi router: %v", err)
	}

	return actual
}

func loadOpenAPIRoutes(t *testing.T) map[routeKey]bool {
	t.Helper()

	specPath := findOpenAPIPath(t)
	content, err := os.ReadFile(specPath)
	if err != nil {
		t.Fatalf("read OpenAPI contract: %v", err)
	}

	routes := map[routeKey]bool{}
	inPaths := false
	currentPath := ""
	for _, line := range strings.Split(string(content), "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed == "paths:" {
			inPaths = true
			continue
		}
		if !inPaths || trimmed == "" {
			continue
		}
		if !strings.HasPrefix(line, " ") && trimmed != "paths:" {
			break
		}
		if strings.HasPrefix(line, "  /") && strings.HasSuffix(trimmed, ":") {
			currentPath = strings.TrimSuffix(trimmed, ":")
			continue
		}
		if currentPath == "" || !strings.HasPrefix(line, "    ") || strings.HasPrefix(line, "      ") || !strings.HasSuffix(trimmed, ":") {
			continue
		}

		method := strings.ToUpper(strings.TrimSuffix(trimmed, ":"))
		if isHTTPMethod(method) {
			routes[routeKey{method: method, path: normalizeRoutePath(currentPath)}] = true
		}
	}

	if len(routes) == 0 {
		t.Fatalf("no routes parsed from %s", specPath)
	}
	return routes
}

func findOpenAPIPath(t *testing.T) string {
	t.Helper()

	dir, err := os.Getwd()
	if err != nil {
		t.Fatalf("get working directory: %v", err)
	}

	for {
		candidate := filepath.Join(dir, "docs", "api", "openapi.yaml")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}

	t.Fatalf("docs/api/openapi.yaml not found from test working directory")
	return ""
}

func normalizeRoutePath(path string) string {
	if path != "/" {
		path = strings.TrimSuffix(path, "/")
	}
	return path
}

func isHTTPMethod(method string) bool {
	switch method {
	case "GET", "POST", "PUT", "DELETE", "PATCH":
		return true
	default:
		return false
	}
}
