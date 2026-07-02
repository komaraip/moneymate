//go:build integration

package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
)

const integrationPassword = "integration-demo-pass"

var (
	integrationOnce sync.Once
	integrationApp  *apiTestApp
	integrationErr  error
	integrationSkip string
	integrationDrop func()
)

type apiTestApp struct {
	db     *pgxpool.Pool
	router http.Handler
}

type apiEnvelope struct {
	Success   bool            `json:"success"`
	Data      json.RawMessage `json:"data"`
	Error     *apiError       `json:"error"`
	RequestID string          `json:"request_id"`
}

type apiError struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Details []string `json:"details"`
}

func TestMain(m *testing.M) {
	code := m.Run()
	if integrationDrop != nil {
		integrationDrop()
	}
	os.Exit(code)
}

func TestAuthIntegration(t *testing.T) {
	app := newAPIIntegrationTest(t)
	app.seedUser(t, "owner-it@moneymate.local", "owner")

	login := app.login(t, "owner-it@moneymate.local", integrationPassword)
	if login.AccessToken == "" {
		t.Fatal("expected access token")
	}
	if login.User.Email != "owner-it@moneymate.local" {
		t.Fatalf("unexpected login user email: %s", login.User.Email)
	}

	invalid := app.requestJSON(t, http.MethodPost, "/api/v1/auth/login", "", map[string]any{
		"email":    "owner-it@moneymate.local",
		"password": "wrong-password",
	})
	assertStatus(t, invalid, http.StatusUnauthorized)
	if invalid.envelope.Success {
		t.Fatal("invalid login should not succeed")
	}

	me := app.requestJSON(t, http.MethodGet, "/api/v1/auth/me", login.AccessToken, nil)
	assertStatus(t, me, http.StatusOK)
	meUser := decodeData[userResponse](t, me.envelope)
	if meUser.Email != "owner-it@moneymate.local" {
		t.Fatalf("unexpected /me email: %s", meUser.Email)
	}
}

func TestProtectedEndpointsRejectMissingOrInvalidToken(t *testing.T) {
	app := newAPIIntegrationTest(t)

	missing := app.requestJSON(t, http.MethodGet, "/api/v1/instruments", "", nil)
	assertStatus(t, missing, http.StatusUnauthorized)

	invalid := app.requestJSON(t, http.MethodGet, "/api/v1/instruments", "not-a-valid-token", nil)
	assertStatus(t, invalid, http.StatusUnauthorized)
}

func TestRoleRestrictionsForWriteEndpoints(t *testing.T) {
	app := newAPIIntegrationTest(t)
	app.seedUser(t, "viewer-it@moneymate.local", "viewer")
	app.seedUser(t, "admin-it@moneymate.local", "admin")

	viewer := app.login(t, "viewer-it@moneymate.local", integrationPassword)
	viewerWrite := app.requestJSON(t, http.MethodPost, "/api/v1/instruments", viewer.AccessToken, instrumentPayload("VIEW", "Viewer Instrument"))
	assertStatus(t, viewerWrite, http.StatusForbidden)

	admin := app.login(t, "admin-it@moneymate.local", integrationPassword)
	adminWrite := app.requestJSON(t, http.MethodPost, "/api/v1/instruments", admin.AccessToken, instrumentPayload("ADMIN", "Admin Instrument"))
	assertStatus(t, adminWrite, http.StatusCreated)
}

func TestInstrumentWriteFlowCreatesAuditLogs(t *testing.T) {
	app := newAPIIntegrationTest(t)
	token := app.seedAndLogin(t, "owner-it@moneymate.local", "owner")

	create := app.requestJSON(t, http.MethodPost, "/api/v1/instruments", token, instrumentPayload("MMIT", "MoneyMate Integration"))
	assertStatus(t, create, http.StatusCreated)
	instrument := decodeData[instrumentResponse](t, create.envelope)
	if instrument.ID == "" {
		t.Fatal("expected created instrument id")
	}

	updatePayload := instrumentPayload("MMIT", "MoneyMate Integration Updated")
	updatePayload["is_active"] = true
	update := app.requestJSON(t, http.MethodPut, "/api/v1/instruments/"+instrument.ID, token, updatePayload)
	assertStatus(t, update, http.StatusOK)
	updated := decodeData[instrumentResponse](t, update.envelope)
	if updated.Name != "MoneyMate Integration Updated" {
		t.Fatalf("unexpected updated name: %s", updated.Name)
	}

	remove := app.requestJSON(t, http.MethodDelete, "/api/v1/instruments/"+instrument.ID, token, nil)
	assertStatus(t, remove, http.StatusOK)

	get := app.requestJSON(t, http.MethodGet, "/api/v1/instruments/"+instrument.ID, token, nil)
	assertStatus(t, get, http.StatusOK)
	deactivated := decodeData[instrumentResponse](t, get.envelope)
	if deactivated.IsActive {
		t.Fatal("expected soft-deleted instrument to be inactive")
	}

	app.assertAudit(t, "instrument", "create")
	app.assertAudit(t, "instrument", "update")
	app.assertAudit(t, "instrument", "delete")
}

func TestTransactionManualPriceHoldingsAndAuditFlow(t *testing.T) {
	app := newAPIIntegrationTest(t)
	token := app.seedAndLogin(t, "owner-it@moneymate.local", "owner")
	instrumentID := app.seedInstrument(t, "BBRI", "Bank Rakyat Indonesia", "stock", "IDR")

	txPayload := transactionPayload(instrumentID, "2026-06-30", "buy", 3000, 10, "IDR", nil)
	create := app.requestJSON(t, http.MethodPost, "/api/v1/transactions", token, txPayload)
	assertStatus(t, create, http.StatusCreated)
	transaction := decodeData[transactionResponse](t, create.envelope)
	if transaction.ID == "" {
		t.Fatal("expected transaction id")
	}

	updatePayload := transactionPayload(instrumentID, "2026-06-30", "buy", 3100, 10, "IDR", nil)
	update := app.requestJSON(t, http.MethodPut, "/api/v1/transactions/"+transaction.ID, token, updatePayload)
	assertStatus(t, update, http.StatusOK)
	updated := decodeData[transactionResponse](t, update.envelope)
	if updated.Price != 3100 {
		t.Fatalf("unexpected updated transaction price: %v", updated.Price)
	}

	price := app.requestJSON(t, http.MethodPost, "/api/v1/prices/manual", token, map[string]any{
		"instrument_id": instrumentID,
		"price_date":    "2026-06-30",
		"price":         3500,
		"currency":      "IDR",
	})
	assertStatus(t, price, http.StatusCreated)

	recalculate := app.requestJSON(t, http.MethodPost, "/api/v1/holdings/recalculate?date=2026-06-30", token, nil)
	assertStatus(t, recalculate, http.StatusOK)
	recalculateData := decodeData[map[string]any](t, recalculate.envelope)
	if recalculateData["count"].(float64) != 1 {
		t.Fatalf("expected one holding after recalculate, got %v", recalculateData["count"])
	}

	holdings := app.requestJSON(t, http.MethodGet, "/api/v1/holdings?date=2026-06-30", token, nil)
	assertStatus(t, holdings, http.StatusOK)
	holdingRows := decodeData[[]holdingResponse](t, holdings.envelope)
	if len(holdingRows) != 1 {
		t.Fatalf("expected one holding row, got %d", len(holdingRows))
	}
	if holdingRows[0].CurrentValue != 35000 {
		t.Fatalf("unexpected current value: %v", holdingRows[0].CurrentValue)
	}

	remove := app.requestJSON(t, http.MethodDelete, "/api/v1/transactions/"+transaction.ID, token, nil)
	assertStatus(t, remove, http.StatusOK)

	app.assertAudit(t, "transaction", "create")
	app.assertAudit(t, "transaction", "update")
	app.assertAudit(t, "transaction", "delete")
	app.assertAudit(t, "price_snapshot", "create")
}

func TestCashAccountWriteFlowCreatesAuditLogs(t *testing.T) {
	app := newAPIIntegrationTest(t)
	token := app.seedAndLogin(t, "owner-it@moneymate.local", "owner")

	create := app.requestJSON(t, http.MethodPost, "/api/v1/cash-accounts", token, cashPayload("Seabank Integration", 100000))
	assertStatus(t, create, http.StatusCreated)
	account := decodeData[cashAccountResponse](t, create.envelope)
	if account.ID == "" {
		t.Fatal("expected cash account id")
	}

	update := app.requestJSON(t, http.MethodPut, "/api/v1/cash-accounts/"+account.ID, token, cashPayload("Seabank Integration Updated", 125000))
	assertStatus(t, update, http.StatusOK)
	updated := decodeData[cashAccountResponse](t, update.envelope)
	if updated.Balance != 125000 {
		t.Fatalf("unexpected updated balance: %v", updated.Balance)
	}

	remove := app.requestJSON(t, http.MethodDelete, "/api/v1/cash-accounts/"+account.ID, token, nil)
	assertStatus(t, remove, http.StatusOK)

	get := app.requestJSON(t, http.MethodGet, "/api/v1/cash-accounts/"+account.ID, token, nil)
	assertStatus(t, get, http.StatusOK)
	deactivated := decodeData[cashAccountResponse](t, get.envelope)
	if deactivated.IsActive {
		t.Fatal("expected soft-deleted cash account to be inactive")
	}

	app.assertAudit(t, "cash_account", "create")
	app.assertAudit(t, "cash_account", "update")
	app.assertAudit(t, "cash_account", "delete")
}

func TestImportPreviewAndConfirmationFlow(t *testing.T) {
	app := newAPIIntegrationTest(t)
	token := app.seedAndLogin(t, "owner-it@moneymate.local", "owner")
	app.seedInstrument(t, "BBRI", "Bank Rakyat Indonesia", "stock", "IDR")

	preview := app.uploadCSV(t, token, "moneymate-import.csv", sampleImportCSV())
	assertStatus(t, preview, http.StatusCreated)
	previewData := decodeData[importPreviewResponse](t, preview.envelope)
	if previewData.JobID == "" {
		t.Fatal("expected import job id")
	}
	assertContains(t, previewData.DetectedSections, "holdings")
	assertContains(t, previewData.DetectedSections, "orders")
	assertContains(t, previewData.DetectedSections, "cash")
	if previewData.Summary.TotalRows != 4 || previewData.Summary.InvalidRows != 1 {
		t.Fatalf("unexpected preview summary: %+v", previewData.Summary)
	}
	if !previewHasError(previewData.Rows, "Nama akun cash wajib diisi") {
		t.Fatalf("expected row-level cash validation error, got %+v", previewData.Rows)
	}

	confirm := app.requestJSON(t, http.MethodPost, "/api/v1/imports/jobs/"+previewData.JobID+"/confirm", token, nil)
	assertStatus(t, confirm, http.StatusOK)
	confirmData := decodeData[importConfirmResponse](t, confirm.envelope)
	if confirmData.ImportedRows != 3 || confirmData.FailedRows != 1 {
		t.Fatalf("unexpected confirm result: %+v", confirmData)
	}
	if !confirmData.HoldingsRecalculated {
		t.Fatalf("expected holdings recalculation metadata after confirm: %+v", confirmData)
	}
	if confirmData.HoldingsSnapshotDate == "" {
		t.Fatalf("expected holdings snapshot date after confirm: %+v", confirmData)
	}
	if confirmData.HoldingsCount != 1 {
		t.Fatalf("expected one recalculated holding after confirm, got %+v", confirmData)
	}

	var instrumentCount int
	if err := app.db.QueryRow(context.Background(), `SELECT count(*) FROM instruments WHERE ticker = 'BBRI'`).Scan(&instrumentCount); err != nil {
		t.Fatalf("count BBRI instruments: %v", err)
	}
	if instrumentCount != 1 {
		t.Fatalf("expected import to reuse existing BBRI instrument, got %d rows", instrumentCount)
	}

	app.assertAudit(t, "import_job", "confirm_import")

	holdings := app.requestJSON(t, http.MethodGet, "/api/v1/holdings?date="+confirmData.HoldingsSnapshotDate, token, nil)
	assertStatus(t, holdings, http.StatusOK)
	holdingRows := decodeData[[]holdingResponse](t, holdings.envelope)
	if len(holdingRows) != 1 {
		t.Fatalf("expected one holding after import, got %d", len(holdingRows))
	}
	if holdingRows[0].CurrentValue != 35000 {
		t.Fatalf("unexpected holding current value after import: %v", holdingRows[0].CurrentValue)
	}

	overview := app.requestJSON(t, http.MethodGet, "/api/v1/dashboard/overview", token, nil)
	assertStatus(t, overview, http.StatusOK)
	overviewData := decodeData[dashboardOverviewResponse](t, overview.envelope)
	if overviewData.TotalPortfolioValue != 35000 || overviewData.TotalCash != 100000 || overviewData.TotalNetWorth != 135000 {
		t.Fatalf("unexpected dashboard totals after import: %+v", overviewData)
	}

	allocation := app.requestJSON(t, http.MethodGet, "/api/v1/dashboard/asset-allocation", token, nil)
	assertStatus(t, allocation, http.StatusOK)
	allocationRows := decodeData[[]assetAllocationResponse](t, allocation.envelope)
	if !hasAllocationValue(allocationRows, "Cash", 100000) || !hasAllocationValue(allocationRows, "stock", 35000) {
		t.Fatalf("unexpected allocation after import: %+v", allocationRows)
	}

	performance := app.requestJSON(t, http.MethodGet, "/api/v1/dashboard/performance", token, nil)
	assertStatus(t, performance, http.StatusOK)
	performanceData := decodeData[dashboardPerformanceResponse](t, performance.envelope)
	if len(performanceData.Items) != 1 || performanceData.Items[0].CurrentValue != 35000 {
		t.Fatalf("unexpected performance after import: %+v", performanceData)
	}

	alerts := app.requestJSON(t, http.MethodGet, "/api/v1/dashboard/alerts", token, nil)
	assertStatus(t, alerts, http.StatusOK)
	alertRows := decodeData[[]map[string]any](t, alerts.envelope)
	if len(alertRows) == 0 {
		t.Fatal("expected dashboard alerts to reflect imported holding")
	}
}

func newAPIIntegrationTest(t *testing.T) *apiTestApp {
	t.Helper()
	integrationOnce.Do(func() {
		integrationApp, integrationDrop, integrationErr, integrationSkip = setupIntegrationApp()
	})
	if integrationSkip != "" {
		t.Skip(integrationSkip)
	}
	if integrationErr != nil {
		t.Fatalf("setup integration app: %v", integrationErr)
	}
	integrationApp.reset(t)
	return integrationApp
}

func setupIntegrationApp() (*apiTestApp, func(), error, string) {
	databaseURL := strings.TrimSpace(os.Getenv("MONEYMATE_TEST_DATABASE_URL"))
	if databaseURL == "" {
		databaseURL = strings.TrimSpace(os.Getenv("TEST_DATABASE_URL"))
	}
	if databaseURL == "" {
		return nil, nil, nil, "set MONEYMATE_TEST_DATABASE_URL to run backend API integration tests"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	basePool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, nil, fmt.Errorf("connect base database: %w", err), ""
	}
	defer basePool.Close()

	schema := fmt.Sprintf("mm_it_%d", time.Now().UnixNano())
	quotedSchema := pgx.Identifier{schema}.Sanitize()
	if _, err := basePool.Exec(ctx, "CREATE SCHEMA "+quotedSchema); err != nil {
		return nil, nil, fmt.Errorf("create schema: %w", err), ""
	}

	drop := func() {
		cleanupCtx, cleanupCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cleanupCancel()
		cleanupPool, err := pgxpool.New(cleanupCtx, databaseURL)
		if err != nil {
			return
		}
		defer cleanupPool.Close()
		_, _ = cleanupPool.Exec(cleanupCtx, "DROP SCHEMA IF EXISTS "+quotedSchema+" CASCADE")
	}

	poolConfig, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		drop()
		return nil, nil, fmt.Errorf("parse database url: %w", err), ""
	}
	poolConfig.ConnConfig.RuntimeParams["search_path"] = schema + ",public"
	poolConfig.MaxConns = 4
	poolConfig.MinConns = 1

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		drop()
		return nil, nil, fmt.Errorf("connect schema database: %w", err), ""
	}
	if err := runIntegrationMigrations(ctx, pool); err != nil {
		pool.Close()
		drop()
		return nil, nil, err, ""
	}

	cfg := integrationConfig()
	authService := auth.NewService(pool, cfg)
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	app := &apiTestApp{
		db:     pool,
		router: NewRouter(cfg, logger, authService, pool),
	}
	return app, func() {
		pool.Close()
		drop()
	}, nil, ""
}

func runIntegrationMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	if _, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
	`); err != nil {
		return fmt.Errorf("ensure schema_migrations: %w", err)
	}

	migrationsDir, err := findMigrationsDir()
	if err != nil {
		return err
	}
	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		return fmt.Errorf("find migration files: %w", err)
	}
	sort.Strings(files)

	for _, file := range files {
		version := filepath.Base(file)
		sqlBytes, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", version, err)
		}

		tx, err := pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin migration %s: %w", version, err)
		}
		if _, err := tx.Exec(ctx, string(sqlBytes)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("apply migration %s: %w", version, err)
		}
		if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1)`, version); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("record migration %s: %w", version, err)
		}
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit migration %s: %w", version, err)
		}
	}
	return nil
}

func findMigrationsDir() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for {
		candidate := filepath.Join(dir, "db", "migrations")
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			return candidate, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return "", fmt.Errorf("db/migrations directory not found")
		}
		dir = parent
	}
}

func integrationConfig() config.Config {
	return config.Config{
		Environment:        "test",
		Port:               "0",
		BaseCurrency:       "IDR",
		Timezone:           "Asia/Jakarta",
		CORSAllowedOrigins: []string{"http://localhost:5173"},
		JWTAccessSecret:    "integration_access_secret_change_me",
		JWTRefreshSecret:   "integration_refresh_secret_change_me",
		CookieSecure:       false,
		AccessTokenTTL:     15 * time.Minute,
		RefreshTokenTTL:    24 * time.Hour,
	}
}

func (app *apiTestApp) reset(t *testing.T) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_, err := app.db.Exec(ctx, `
		TRUNCATE TABLE
			audit_logs,
			import_job_rows,
			import_jobs,
			holdings_snapshot,
			price_snapshots,
			cash_adjustments,
			cash_accounts,
			transactions,
			instrument_categories,
			instruments,
			asset_categories,
			sessions,
			users
		CASCADE
	`)
	if err != nil {
		t.Fatalf("reset integration database: %v", err)
	}
}

func (app *apiTestApp) seedAndLogin(t *testing.T, email string, role string) string {
	t.Helper()
	app.seedUser(t, email, role)
	return app.login(t, email, integrationPassword).AccessToken
}

func (app *apiTestApp) seedUser(t *testing.T, email string, role string) string {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	hash, err := auth.HashPassword(integrationPassword)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}

	var id string
	err = app.db.QueryRow(ctx, `
		INSERT INTO users (email, full_name, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id::text
	`, email, "Integration "+role, hash, role).Scan(&id)
	if err != nil {
		t.Fatalf("seed user: %v", err)
	}
	return id
}

func (app *apiTestApp) seedInstrument(t *testing.T, ticker string, name string, kind string, currency string) string {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var id string
	err := app.db.QueryRow(ctx, `
		INSERT INTO instruments (type, ticker, name, provider, currency)
		VALUES ($1, $2, $3, 'Integration Test', $4)
		RETURNING id::text
	`, kind, ticker, name, currency).Scan(&id)
	if err != nil {
		t.Fatalf("seed instrument: %v", err)
	}
	return id
}

func (app *apiTestApp) login(t *testing.T, email string, password string) loginResponse {
	t.Helper()
	res := app.requestJSON(t, http.MethodPost, "/api/v1/auth/login", "", map[string]any{
		"email":    email,
		"password": password,
	})
	assertStatus(t, res, http.StatusOK)
	return decodeData[loginResponse](t, res.envelope)
}

func (app *apiTestApp) requestJSON(t *testing.T, method string, target string, token string, body any) apiTestResponse {
	t.Helper()
	var reader io.Reader
	if body != nil {
		payload, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("marshal request body: %v", err)
		}
		reader = bytes.NewReader(payload)
	}

	req := httptest.NewRequest(method, target, reader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	rec := httptest.NewRecorder()
	app.router.ServeHTTP(rec, req)
	return parseTestResponse(t, rec)
}

func (app *apiTestApp) uploadCSV(t *testing.T, token string, filename string, contents string) apiTestResponse {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		t.Fatalf("create multipart file: %v", err)
	}
	if _, err := io.Copy(part, strings.NewReader(contents)); err != nil {
		t.Fatalf("write multipart file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/imports/upload", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	app.router.ServeHTTP(rec, req)
	return parseTestResponse(t, rec)
}

func parseTestResponse(t *testing.T, rec *httptest.ResponseRecorder) apiTestResponse {
	t.Helper()
	var envelope apiEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &envelope); err != nil {
		t.Fatalf("decode response %d %s: %v", rec.Code, rec.Body.String(), err)
	}
	return apiTestResponse{status: rec.Code, envelope: envelope, body: rec.Body.String()}
}

func decodeData[T any](t *testing.T, envelope apiEnvelope) T {
	t.Helper()
	var value T
	if len(envelope.Data) == 0 {
		t.Fatalf("response has no data: %+v", envelope)
	}
	if err := json.Unmarshal(envelope.Data, &value); err != nil {
		t.Fatalf("decode response data: %v; data=%s", err, string(envelope.Data))
	}
	return value
}

func assertStatus(t *testing.T, res apiTestResponse, expected int) {
	t.Helper()
	if res.status != expected {
		t.Fatalf("expected status %d, got %d: %s", expected, res.status, res.body)
	}
}

func (app *apiTestApp) assertAudit(t *testing.T, entityType string, action string) {
	t.Helper()
	var count int
	if err := app.db.QueryRow(context.Background(), `
		SELECT count(*)
		FROM audit_logs
		WHERE entity_type = $1 AND action = $2
	`, entityType, action).Scan(&count); err != nil {
		t.Fatalf("count audit logs: %v", err)
	}
	if count == 0 {
		t.Fatalf("expected audit log for %s/%s", entityType, action)
	}
}

func instrumentPayload(ticker string, name string) map[string]any {
	return map[string]any{
		"type":         "stock",
		"ticker":       ticker,
		"name":         name,
		"provider":     "Integration Test",
		"currency":     "IDR",
		"category_ids": []string{},
		"is_active":    true,
	}
}

func transactionPayload(instrumentID string, date string, kind string, price float64, units float64, currency string, fxRate *float64) map[string]any {
	return map[string]any{
		"instrument_id":    instrumentID,
		"transaction_date": date,
		"type":             kind,
		"price":            price,
		"units":            units,
		"fees":             0,
		"tax":              0,
		"currency":         currency,
		"fx_rate_to_idr":   fxRate,
	}
}

func cashPayload(name string, balance float64) map[string]any {
	return map[string]any{
		"account_name": name,
		"account_type": "bank",
		"currency":     "IDR",
		"balance":      balance,
		"is_active":    true,
	}
}

func sampleImportCSV() string {
	return strings.Join([]string{
		"INVESMENT",
		"Instrument,Ticker,Name,Average Price,Current Price,Units,Total Cost,Current Value,Currency",
		"Saham,BBRI,Bank Rakyat Indonesia,3000,3500,10,30000,35000,IDR",
		"",
		"ORDERS",
		"Date,Instrument,Ticker,Type,Price,Units,Total Value,Currency",
		"2026-06-30,Saham,BBRI,Buy,3000,10,30000,IDR",
		"",
		"CASH",
		"Account,Balance,Currency",
		"Seabank Import,100000,IDR",
		",123,IDR",
	}, "\n")
}

func assertContains(t *testing.T, values []string, expected string) {
	t.Helper()
	for _, value := range values {
		if value == expected {
			return
		}
	}
	t.Fatalf("expected %q in %+v", expected, values)
}

func previewHasError(rows []importPreviewRowResponse, expected string) bool {
	for _, row := range rows {
		for _, rowError := range row.Errors {
			if strings.Contains(rowError, expected) {
				return true
			}
		}
	}
	return false
}

func hasAllocationValue(rows []assetAllocationResponse, asset string, value float64) bool {
	for _, row := range rows {
		if row.Asset == asset && row.Value == value {
			return true
		}
	}
	return false
}

type apiTestResponse struct {
	status   int
	envelope apiEnvelope
	body     string
}

type loginResponse struct {
	AccessToken string       `json:"access_token"`
	User        userResponse `json:"user"`
}

type userResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
}

type instrumentResponse struct {
	ID       string `json:"id"`
	Ticker   string `json:"ticker"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
}

type transactionResponse struct {
	ID    string  `json:"id"`
	Price float64 `json:"price"`
}

type cashAccountResponse struct {
	ID       string  `json:"id"`
	Balance  float64 `json:"balance"`
	IsActive bool    `json:"is_active"`
}

type holdingResponse struct {
	CurrentValue float64 `json:"current_value"`
}

type importPreviewResponse struct {
	JobID            string                     `json:"job_id"`
	DetectedSections []string                   `json:"detected_sections"`
	Rows             []importPreviewRowResponse `json:"rows"`
	Summary          importPreviewSummary       `json:"summary"`
}

type importPreviewSummary struct {
	TotalRows   int `json:"total_rows"`
	ValidRows   int `json:"valid_rows"`
	InvalidRows int `json:"invalid_rows"`
}

type importPreviewRowResponse struct {
	Errors []string `json:"errors"`
	Status string   `json:"status"`
}

type importConfirmResponse struct {
	ImportedRows         int    `json:"imported_rows"`
	SkippedRows          int    `json:"skipped_rows"`
	FailedRows           int    `json:"failed_rows"`
	HoldingsRecalculated bool   `json:"holdings_recalculated"`
	HoldingsSnapshotDate string `json:"holdings_snapshot_date"`
	HoldingsCount        int    `json:"holdings_count"`
}

type dashboardOverviewResponse struct {
	TotalNetWorth       float64 `json:"total_net_worth"`
	TotalPortfolioValue float64 `json:"total_portfolio_value"`
	TotalCash           float64 `json:"total_cash"`
}

type assetAllocationResponse struct {
	Asset string  `json:"asset"`
	Value float64 `json:"value"`
}

type dashboardPerformanceResponse struct {
	Items []dashboardPerformanceItem `json:"items"`
}

type dashboardPerformanceItem struct {
	CurrentValue float64 `json:"current_value"`
}
