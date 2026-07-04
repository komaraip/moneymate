package importer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/audit"
	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/httpapi/response"
	"moneymate/backend/internal/portfolio"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) Handler {
	return Handler{db: db}
}

func (h Handler) Routes() chi.Router {
	router := chi.NewRouter()

	router.Post("/upload", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.upload)).ServeHTTP)
	router.Get("/jobs", h.listJobs)
	router.Get("/jobs/{id}", h.getJob)
	router.Post("/jobs/{id}/confirm", auth.RequireRoles("admin", "user")(http.HandlerFunc(h.confirm)).ServeHTTP)

	return router
}

type ImportJob struct {
	ID               string     `json:"id"`
	SourceType       string     `json:"source_type"`
	OriginalFilename *string    `json:"original_filename,omitempty"`
	Status           string     `json:"status"`
	TotalRows        int        `json:"total_rows"`
	SuccessRows      int        `json:"success_rows"`
	FailedRows       int        `json:"failed_rows"`
	ErrorSummary     *string    `json:"error_summary,omitempty"`
	CreatedBy        *string    `json:"created_by,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	CompletedAt      *time.Time `json:"completed_at,omitempty"`
}

type ImportJobDetail struct {
	ImportJob
	DetectedSections []Section    `json:"detected_sections"`
	Rows             []PreviewRow `json:"rows"`
}

type ConfirmResult struct {
	JobID                string `json:"job_id"`
	Status               string `json:"status"`
	TotalRows            int    `json:"total_rows"`
	ImportedRows         int    `json:"imported_rows"`
	SkippedRows          int    `json:"skipped_rows"`
	FailedRows           int    `json:"failed_rows"`
	HoldingsRecalculated bool   `json:"holdings_recalculated"`
	HoldingsSnapshotDate string `json:"holdings_snapshot_date"`
	HoldingsCount        int    `json:"holdings_count"`
	Message              string `json:"message"`
}

func (h Handler) upload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 10<<20)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.Error(w, r, validation("File import maksimal 10 MB dan harus dikirim sebagai multipart form"))
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		response.Error(w, r, validation("File wajib diunggah dengan field 'file'"))
		return
	}
	defer file.Close()

	preview, err := Parse(file, header.Filename)
	if err != nil {
		if errors.Is(err, ErrUnsupportedFile) {
			response.Error(w, r, validation("Format file belum didukung. Gunakan CSV atau XLSX"))
			return
		}
		response.Error(w, r, internalErr(err, "Gagal membaca file import"))
		return
	}

	user, _ := auth.UserFromContext(r.Context())
	if err := h.persistPreview(r.Context(), &preview, user.ID); err != nil {
		response.Error(w, r, err)
		return
	}

	response.JSON(w, r, http.StatusCreated, preview, nil)
}

func (h Handler) listJobs(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	rows, err := h.db.Query(r.Context(), `
		SELECT id::text, source_type, original_filename, status, total_rows, success_rows,
		       failed_rows, error_summary, created_by::text, created_at, completed_at
		FROM import_jobs
		WHERE created_by = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat riwayat import"))
		return
	}
	defer rows.Close()

	items := []ImportJob{}
	for rows.Next() {
		item, err := scanJob(rows)
		if err != nil {
			response.Error(w, r, internalErr(err, "Gagal membaca riwayat import"))
			return
		}
		items = append(items, item)
	}

	response.JSON(w, r, http.StatusOK, items, nil)
}

func (h Handler) getJob(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}

	user, _ := auth.UserFromContext(r.Context())
	job, err := h.loadJob(r.Context(), id, user.ID)
	if err != nil {
		response.Error(w, r, mapGetErr(err, "Import job tidak ditemukan"))
		return
	}
	rows, err := h.loadJobRows(r.Context(), id)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat baris import"))
		return
	}

	detected := sectionsFromRows(rows)
	response.JSON(w, r, http.StatusOK, ImportJobDetail{
		ImportJob:        job,
		DetectedSections: detected,
		Rows:             rows,
	}, nil)
}

func (h Handler) confirm(w http.ResponseWriter, r *http.Request) {
	id, ok := pathUUID(w, r)
	if !ok {
		return
	}
	user, _ := auth.UserFromContext(r.Context())
	snapshotDate := time.Now()

	result, err := h.confirmJob(r.Context(), id, user.ID, snapshotDate)
	if err != nil {
		response.Error(w, r, err)
		return
	}

	actorID := user.ID
	_ = audit.Log(r.Context(), h.db, audit.Entry{
		ActorUserID: &actorID,
		Action:      "confirm_import",
		EntityType:  "import_job",
		EntityID:    &id,
		Before:      nil,
		After:       result,
		IPAddress:   auth.ClientIP(r),
		UserAgent:   r.UserAgent(),
	})

	response.JSON(w, r, http.StatusOK, result, nil)
}

func (h Handler) persistPreview(ctx context.Context, preview *Preview, userID string) error {
	tx, err := h.db.Begin(ctx)
	if err != nil {
		return internalErr(err, "Gagal memulai import preview")
	}
	defer tx.Rollback(ctx)

	status := "pending"
	var errorSummary *string
	if preview.Summary.InvalidRows > 0 {
		status = "partial"
		summary := fmt.Sprintf("%d baris memiliki error validasi", preview.Summary.InvalidRows)
		errorSummary = &summary
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO import_jobs (
			source_type, original_filename, status, total_rows, success_rows,
			failed_rows, error_summary, created_by
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id::text
	`, preview.SourceType, preview.OriginalFilename, status, preview.Summary.TotalRows,
		preview.Summary.ValidRows, preview.Summary.InvalidRows, errorSummary, userID).Scan(&preview.JobID)
	if err != nil {
		return internalErr(err, "Gagal menyimpan import job")
	}

	for index := range preview.Rows {
		row := &preview.Rows[index]
		rawJSON, err := encodeJSON(row.Raw)
		if err != nil {
			return internalErr(err, "Gagal menyimpan raw import")
		}
		normalizedJSON, err := encodeJSON(row.Normalized)
		if err != nil {
			return internalErr(err, "Gagal menyimpan data normalisasi import")
		}
		errorsJSON, err := encodeJSON(row.Errors)
		if err != nil {
			return internalErr(err, "Gagal menyimpan error import")
		}

		err = tx.QueryRow(ctx, `
			INSERT INTO import_job_rows (
				import_job_id, section, row_number, status, raw_json,
				normalized_json, errors_json
			)
			VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb)
			RETURNING id::text
		`, preview.JobID, row.Section, row.RowNumber, row.Status, rawJSON, normalizedJSON, errorsJSON).Scan(&row.ID)
		if err != nil {
			return internalErr(err, "Gagal menyimpan baris import")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return internalErr(err, "Gagal menyelesaikan import preview")
	}
	return nil
}

func (h Handler) confirmJob(ctx context.Context, jobID string, userID string, snapshotDate time.Time) (ConfirmResult, error) {
	tx, err := h.db.Begin(ctx)
	if err != nil {
		return ConfirmResult{}, internalErr(err, "Gagal memulai konfirmasi import")
	}
	defer tx.Rollback(ctx)

	var currentStatus string
	if err := tx.QueryRow(ctx, `
		SELECT status
		FROM import_jobs
		WHERE id = $1 AND created_by = $2
		FOR UPDATE
	`, jobID, userID).Scan(&currentStatus); err != nil {
		return ConfirmResult{}, mapGetErr(err, "Import job tidak ditemukan")
	}
	if currentStatus == "completed" {
		return ConfirmResult{}, apperror.New(apperror.CodeConflict, "Import job sudah pernah dikonfirmasi", http.StatusConflict)
	}

	rows, err := tx.Query(ctx, `
		SELECT id::text, section, row_number, status, raw_json, normalized_json, errors_json
		FROM import_job_rows
		WHERE import_job_id = $1
		ORDER BY row_number ASC, created_at ASC
	`, jobID)
	if err != nil {
		return ConfirmResult{}, internalErr(err, "Gagal memuat baris import")
	}

	previewRows := []PreviewRow{}
	for rows.Next() {
		row, err := scanPreviewRow(rows)
		if err != nil {
			rows.Close()
			return ConfirmResult{}, internalErr(err, "Gagal membaca baris import")
		}
		previewRows = append(previewRows, row)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return ConfirmResult{}, internalErr(err, "Gagal membaca baris import")
	}
	rows.Close()

	importedRows := 0
	skippedRows := 0
	failedRows := 0
	totalRows := 0

	for _, row := range previewRows {
		totalRows++

		if row.Status != RowStatusValid {
			failedRows++
			continue
		}

		nextStatus, err := h.applyPreviewRow(ctx, tx, row, userID, snapshotDate)
		if err != nil {
			return ConfirmResult{}, err
		}
		if nextStatus == "skipped" {
			skippedRows++
		} else {
			importedRows++
		}

		if _, err := tx.Exec(ctx, `
			UPDATE import_job_rows
			SET status = $2
			WHERE id = $1
		`, row.ID, nextStatus); err != nil {
			return ConfirmResult{}, internalErr(err, "Gagal mengubah status baris import")
		}
	}

	jobStatus := "completed"
	var errorSummary *string
	if failedRows > 0 {
		jobStatus = "partial"
		summary := fmt.Sprintf("%d baris tidak diimport karena error validasi", failedRows)
		errorSummary = &summary
	}

	if _, err := tx.Exec(ctx, `
		UPDATE import_jobs
		SET status = $2,
		    success_rows = $3,
		    failed_rows = $4,
		    error_summary = $5,
		    completed_at = now()
		WHERE id = $1
	`, jobID, jobStatus, importedRows+skippedRows, failedRows, errorSummary); err != nil {
		return ConfirmResult{}, internalErr(err, "Gagal menyelesaikan import job")
	}

	holdings, err := portfolio.NewService(tx).Recalculate(ctx, userID, snapshotDate)
	if err != nil {
		return ConfirmResult{}, internalErr(err, "Gagal menghitung ulang holdings setelah import")
	}

	if err := tx.Commit(ctx); err != nil {
		return ConfirmResult{}, internalErr(err, "Gagal menyimpan hasil import")
	}

	return ConfirmResult{
		JobID:                jobID,
		Status:               jobStatus,
		TotalRows:            totalRows,
		ImportedRows:         importedRows,
		SkippedRows:          skippedRows,
		FailedRows:           failedRows,
		HoldingsRecalculated: true,
		HoldingsSnapshotDate: snapshotDate.Format("2006-01-02"),
		HoldingsCount:        len(holdings),
		Message:              "Import selesai. Nilai portfolio sudah dihitung ulang. Data harga tetap manual dan bukan real-time.",
	}, nil
}

func (h Handler) applyPreviewRow(ctx context.Context, tx pgx.Tx, row PreviewRow, userID string, snapshotDate time.Time) (string, error) {
	switch row.Section {
	case SectionHoldings:
		return h.applyHoldingRow(ctx, tx, row, userID, snapshotDate)
	case SectionOrders:
		return h.applyOrderRow(ctx, tx, row, userID)
	case SectionCash:
		return h.applyCashRow(ctx, tx, row, userID)
	case SectionAssetSummary:
		return "skipped", nil
	default:
		return "skipped", nil
	}
}

func (h Handler) applyHoldingRow(ctx context.Context, tx pgx.Tx, row PreviewRow, userID string, snapshotDate time.Time) (string, error) {
	instrumentID, err := h.upsertInstrument(ctx, tx, row.Normalized)
	if err != nil {
		return "", err
	}

	currentPrice, hasPrice := floatValue(row.Normalized, "current_price")
	if !hasPrice || currentPrice <= 0 {
		return "imported", nil
	}

	currency := stringValueOrDefault(row.Normalized, "currency", "IDR")
	priceDate := snapshotDate.Format("2006-01-02")
	fxRate, _ := floatValue(row.Normalized, "fx_rate_to_idr")
	var fxRatePtr *float64
	if fxRate > 0 {
		fxRatePtr = &fxRate
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO price_snapshots (user_id, instrument_id, price_date, price, currency, fx_rate_to_idr, source, is_realtime)
		VALUES ($1, $2, $3, $4, $5, $6, 'manual', FALSE)
		ON CONFLICT (user_id, instrument_id, price_date, source) DO UPDATE
		SET price = EXCLUDED.price,
		    currency = EXCLUDED.currency,
		    fx_rate_to_idr = EXCLUDED.fx_rate_to_idr,
		    is_realtime = FALSE,
		    created_at = now()
	`, userID, instrumentID, priceDate, currentPrice, currency, fxRatePtr); err != nil {
		return "", internalErr(err, "Gagal menyimpan harga dari import")
	}

	return "imported", nil
}

func (h Handler) applyOrderRow(ctx context.Context, tx pgx.Tx, row PreviewRow, userID string) (string, error) {
	instrumentID, err := h.upsertInstrument(ctx, tx, row.Normalized)
	if err != nil {
		return "", err
	}

	transactionDate := stringValueOrDefault(row.Normalized, "date", "")
	txType := stringValueOrDefault(row.Normalized, "type", "")
	price, _ := floatValue(row.Normalized, "price")
	units, _ := floatValue(row.Normalized, "units")
	grossValue, ok := floatValue(row.Normalized, "gross_value")
	if !ok {
		grossValue = price * units
	}
	netValue, ok := floatValue(row.Normalized, "net_value")
	if !ok {
		netValue = grossValue
	}
	currency := stringValueOrDefault(row.Normalized, "currency", "IDR")
	fxRate, _ := floatValue(row.Normalized, "fx_rate_to_idr")
	var fxRatePtr *float64
	if fxRate > 0 {
		fxRatePtr = &fxRate
	}
	notes := "Import spreadsheet"

	var transactionID string
	err = tx.QueryRow(ctx, `
		INSERT INTO transactions (
			user_id, instrument_id, transaction_date, type, price, units, gross_value,
			fees, tax, net_value, currency, fx_rate_to_idr, notes, source, created_by
		)
		SELECT $11, $1, $2::date, $3, $4, $5, $6, 0, 0, $7, $8, $9, $10, 'import', $11
		WHERE NOT EXISTS (
			SELECT 1
			FROM transactions
			WHERE user_id = $11
			  AND instrument_id = $1
			  AND transaction_date = $2::date
			  AND type = $3
			  AND price = $4
			  AND units = $5
			  AND net_value = $7
		)
		RETURNING id::text
	`, instrumentID, transactionDate, txType, price, units, grossValue, netValue, currency, fxRatePtr, notes, userID).Scan(&transactionID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "skipped", nil
	}
	if err != nil {
		return "", internalErr(err, "Gagal menyimpan transaksi import")
	}

	return "imported", nil
}

func (h Handler) applyCashRow(ctx context.Context, tx pgx.Tx, row PreviewRow, userID string) (string, error) {
	account := stringValueOrDefault(row.Normalized, "account", "")
	currency := stringValueOrDefault(row.Normalized, "currency", "IDR")
	balance, _ := floatValue(row.Normalized, "balance")

	var existingID string
	err := tx.QueryRow(ctx, `
		SELECT id::text
		FROM cash_accounts
		WHERE user_id = $1
		  AND lower(account_name) = lower($2)
		  AND currency = $3
		ORDER BY created_at ASC
		LIMIT 1
	`, userID, account, currency).Scan(&existingID)
	if err == nil {
		if _, err := tx.Exec(ctx, `
			UPDATE cash_accounts
			SET balance = $2,
			    is_active = TRUE,
			    updated_at = now()
			WHERE id = $1
		`, existingID, balance); err != nil {
			return "", internalErr(err, "Gagal memperbarui akun cash dari import")
		}
		return "imported", nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return "", internalErr(err, "Gagal memeriksa akun cash")
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO cash_accounts (user_id, account_name, account_type, currency, balance, notes)
		VALUES ($1, $2, 'bank', $3, $4, 'Import spreadsheet')
	`, userID, account, currency, balance); err != nil {
		return "", internalErr(err, "Gagal membuat akun cash dari import")
	}

	return "imported", nil
}

func (h Handler) upsertInstrument(ctx context.Context, tx pgx.Tx, normalized map[string]any) (string, error) {
	kind := stringValueOrDefault(normalized, "instrument_type", "other")
	ticker := strings.ToUpper(strings.TrimSpace(stringValueOrDefault(normalized, "ticker", "")))
	name := strings.TrimSpace(stringValueOrDefault(normalized, "name", ""))
	if name == "" {
		name = ticker
	}
	if name == "" {
		name = strings.TrimSpace(stringValueOrDefault(normalized, "instrument", "Imported Instrument"))
	}
	currency := stringValueOrDefault(normalized, "currency", "IDR")
	provider := "Import Spreadsheet"

	var tickerPtr *string
	if ticker != "" {
		tickerPtr = &ticker
	}

	var id string
	err := tx.QueryRow(ctx, `
		WITH existing AS (
			SELECT id
			FROM instruments
			WHERE ($2::text IS NOT NULL AND ticker IS NOT NULL AND lower(ticker) = lower($2))
			   OR (type = $1 AND COALESCE(ticker, '') = COALESCE($2, '') AND lower(name) = lower($3))
			ORDER BY created_at ASC
			LIMIT 1
		),
		inserted AS (
			INSERT INTO instruments (type, ticker, name, provider, currency)
			SELECT $1, $2, $3, $4, $5
			WHERE NOT EXISTS (SELECT 1 FROM existing)
			RETURNING id
		)
		SELECT id::text FROM inserted
		UNION ALL
		SELECT id::text FROM existing
		LIMIT 1
	`, kind, tickerPtr, name, provider, currency).Scan(&id)
	if err != nil {
		return "", internalErr(err, "Gagal menyimpan instrument dari import")
	}

	return id, nil
}

func (h Handler) loadJob(ctx context.Context, id string, userID string) (ImportJob, error) {
	return scanJob(h.db.QueryRow(ctx, `
		SELECT id::text, source_type, original_filename, status, total_rows, success_rows,
		       failed_rows, error_summary, created_by::text, created_at, completed_at
		FROM import_jobs
		WHERE id = $1 AND created_by = $2
	`, id, userID))
}

func (h Handler) loadJobRows(ctx context.Context, jobID string) ([]PreviewRow, error) {
	rows, err := h.db.Query(ctx, `
		SELECT id::text, section, row_number, status, raw_json, normalized_json, errors_json
		FROM import_job_rows
		WHERE import_job_id = $1
		ORDER BY row_number ASC, created_at ASC
	`, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []PreviewRow{}
	for rows.Next() {
		item, err := scanPreviewRow(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func sectionsFromRows(rows []PreviewRow) []Section {
	seen := map[Section]bool{}
	sections := []Section{}
	for _, row := range rows {
		if seen[row.Section] {
			continue
		}
		sections = append(sections, row.Section)
		seen[row.Section] = true
	}
	return sections
}

type scanner interface {
	Scan(dest ...any) error
}

func scanJob(row scanner) (ImportJob, error) {
	var item ImportJob
	err := row.Scan(
		&item.ID,
		&item.SourceType,
		&item.OriginalFilename,
		&item.Status,
		&item.TotalRows,
		&item.SuccessRows,
		&item.FailedRows,
		&item.ErrorSummary,
		&item.CreatedBy,
		&item.CreatedAt,
		&item.CompletedAt,
	)
	return item, err
}

func scanPreviewRow(row scanner) (PreviewRow, error) {
	var item PreviewRow
	var section string
	var rawJSON []byte
	var normalizedJSON []byte
	var errorsJSON []byte
	if err := row.Scan(&item.ID, &section, &item.RowNumber, &item.Status, &rawJSON, &normalizedJSON, &errorsJSON); err != nil {
		return PreviewRow{}, err
	}
	item.Section = Section(section)
	if err := json.Unmarshal(rawJSON, &item.Raw); err != nil {
		return PreviewRow{}, fmt.Errorf("decode raw json: %w", err)
	}
	if err := json.Unmarshal(normalizedJSON, &item.Normalized); err != nil {
		return PreviewRow{}, fmt.Errorf("decode normalized json: %w", err)
	}
	if err := json.Unmarshal(errorsJSON, &item.Errors); err != nil {
		return PreviewRow{}, fmt.Errorf("decode errors json: %w", err)
	}
	return item, nil
}

func encodeJSON(value any) (string, error) {
	bytes, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func stringValueOrDefault(values map[string]any, key string, fallback string) string {
	value, ok := stringValue(values, key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}
	return strings.TrimSpace(value)
}

func pathUUID(w http.ResponseWriter, r *http.Request) (string, bool) {
	id := chi.URLParam(r, "id")
	if _, err := uuid.Parse(id); err != nil {
		response.Error(w, r, validation("ID tidak valid"))
		return "", false
	}
	return id, true
}

func validation(message string) error {
	return apperror.New(apperror.CodeValidation, message, http.StatusBadRequest)
}

func internalErr(err error, message string) error {
	return apperror.Wrap(err, apperror.CodeInternal, message, http.StatusInternalServerError)
}

func mapGetErr(err error, notFoundMessage string) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperror.New(apperror.CodeNotFound, notFoundMessage, http.StatusNotFound)
	}
	return internalErr(err, "Gagal memuat data")
}
