package reports

import (
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"moneymate/backend/internal/apperror"
	"moneymate/backend/internal/auth"
	"moneymate/backend/internal/config"
	"moneymate/backend/internal/httpapi/response"
)

const (
	dataNotRealtimeNote = "Data manual/mock, bukan real-time."
	reportDisclaimer    = "Laporan ini bersifat ringkasan pencatatan, bukan rekomendasi beli/jual."
)

type Handler struct {
	db  *pgxpool.Pool
	cfg config.Config
}

func NewHandler(db *pgxpool.Pool, cfg config.Config) Handler {
	return Handler{db: db, cfg: cfg}
}

func (h Handler) Routes() chi.Router {
	router := chi.NewRouter()

	router.Get("/monthly-summary", h.monthlySummary)
	router.Get("/portfolio-performance", h.portfolioPerformance)
	router.Get("/export.csv", h.exportCSV)

	return router
}

type ReportWarning struct {
	Code     string `json:"code"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

type MonthlySummaryReport struct {
	Month                         string                `json:"month"`
	BaseCurrency                  string                `json:"base_currency"`
	BeginningNetWorth             *float64              `json:"beginning_net_worth"`
	EndingNetWorth                float64               `json:"ending_net_worth"`
	NetWorthChange                *float64              `json:"net_worth_change"`
	CashBalance                   float64               `json:"cash_balance"`
	CashNetMovement               float64               `json:"cash_net_movement"`
	CashMovements                 []CashMovementTotal   `json:"cash_movements"`
	PortfolioValue                float64               `json:"portfolio_value"`
	PortfolioSnapshotDate         *string               `json:"portfolio_snapshot_date"`
	RealizedProfitLoss            *float64              `json:"realized_profit_loss"`
	UnrealizedProfitLoss          float64               `json:"unrealized_profit_loss"`
	TransactionTotalsByAssetType  []TransactionTotal    `json:"transaction_totals_by_asset_type"`
	TransactionTotalsByInstrument []InstrumentTotal     `json:"transaction_totals_by_instrument"`
	TopContributors               []HoldingContribution `json:"top_contributors"`
	TopDetractors                 []HoldingContribution `json:"top_detractors"`
	Warnings                      []ReportWarning       `json:"warnings"`
	DataNotRealtime               string                `json:"data_not_realtime"`
	Disclaimer                    string                `json:"disclaimer"`
	GeneratedAt                   time.Time             `json:"generated_at"`
}

type PortfolioPerformanceReport struct {
	FromDate             string               `json:"from_date"`
	ToDate               string               `json:"to_date"`
	BaseCurrency         string               `json:"base_currency"`
	Method               string               `json:"method"`
	StartingValue        *float64             `json:"starting_value"`
	StartingSnapshotDate *string              `json:"starting_snapshot_date"`
	EndingValue          float64              `json:"ending_value"`
	EndingSnapshotDate   *string              `json:"ending_snapshot_date"`
	AbsoluteChange       *float64             `json:"absolute_change"`
	PercentageChange     *float64             `json:"percentage_change"`
	AllocationBreakdown  []AllocationRow      `json:"allocation_breakdown"`
	HoldingsPerformance  []HoldingPerformance `json:"holdings_performance"`
	CashSummary          CashSummary          `json:"cash_summary"`
	Warnings             []ReportWarning      `json:"warnings"`
	DataNotRealtime      string               `json:"data_not_realtime"`
	Disclaimer           string               `json:"disclaimer"`
	GeneratedAt          time.Time            `json:"generated_at"`
}

type TransactionTotal struct {
	AssetType        string  `json:"asset_type"`
	TransactionType  string  `json:"transaction_type"`
	TransactionCount int     `json:"transaction_count"`
	TotalIDR         float64 `json:"total_idr"`
}

type CashMovementTotal struct {
	Type            string  `json:"type"`
	AdjustmentCount int     `json:"adjustment_count"`
	TotalIDR        float64 `json:"total_idr"`
}

type InstrumentTotal struct {
	InstrumentID     *string `json:"instrument_id"`
	Ticker           *string `json:"ticker"`
	Name             string  `json:"name"`
	InstrumentType   string  `json:"instrument_type"`
	OriginalCurrency string  `json:"original_currency"`
	TransactionType  string  `json:"transaction_type"`
	TransactionCount int     `json:"transaction_count"`
	TotalIDR         float64 `json:"total_idr"`
}

type HoldingContribution struct {
	InstrumentID      string   `json:"instrument_id"`
	Ticker            *string  `json:"ticker"`
	Name              string   `json:"name"`
	InstrumentType    string   `json:"instrument_type"`
	CurrentValue      float64  `json:"current_value"`
	ProfitLossValue   float64  `json:"profit_loss_value"`
	ProfitLossPercent float64  `json:"profit_loss_percent"`
	OriginalCurrency  string   `json:"original_currency"`
	PriceSource       string   `json:"price_source"`
	Warnings          []string `json:"warnings"`
}

type AllocationRow struct {
	Asset   string  `json:"asset"`
	Value   float64 `json:"value"`
	Percent float64 `json:"percent"`
}

type HoldingPerformance struct {
	InstrumentID        string     `json:"instrument_id"`
	Ticker              *string    `json:"ticker"`
	Name                string     `json:"name"`
	InstrumentType      string     `json:"instrument_type"`
	Units               float64    `json:"units"`
	AveragePriceIDR     float64    `json:"average_price_idr"`
	CurrentPriceIDR     float64    `json:"current_price_idr"`
	TotalCostIDR        float64    `json:"total_cost_idr"`
	CurrentValueIDR     float64    `json:"current_value_idr"`
	ProfitLossValueIDR  float64    `json:"profit_loss_value_idr"`
	ProfitLossPercent   float64    `json:"profit_loss_percent"`
	InstrumentCurrency  string     `json:"instrument_currency"`
	LatestPrice         *float64   `json:"latest_price"`
	LatestPriceCurrency *string    `json:"latest_price_currency"`
	FXRateToIDR         *float64   `json:"fx_rate_to_idr"`
	PriceSource         string     `json:"price_source"`
	PriceUpdatedAt      *time.Time `json:"price_updated_at"`
	Warnings            []string   `json:"warnings"`
}

type CashSummary struct {
	TotalCash        float64 `json:"total_cash"`
	PeriodMovement   float64 `json:"period_movement"`
	ActiveAccounts   int     `json:"active_accounts"`
	Currency         string  `json:"currency"`
	HistoryAvailable bool    `json:"history_available"`
	Note             string  `json:"note"`
}

type snapshotSummary struct {
	Date           *time.Time
	PortfolioValue float64
	TotalCost      float64
	UnrealizedPL   float64
}

func (h Handler) monthlySummary(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	monthStart, err := h.parseMonth(r.Context(), user.ID, strings.TrimSpace(r.URL.Query().Get("month")))
	if err != nil {
		response.Error(w, r, err)
		return
	}
	nextMonth := monthStart.AddDate(0, 1, 0)
	monthEnd := nextMonth.AddDate(0, 0, -1)

	ending, err := h.latestSnapshotSummary(r.Context(), user.ID, monthEnd)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat snapshot portfolio"))
		return
	}
	cash, err := h.cashSummary(r.Context(), user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat ringkasan cash"))
		return
	}
	cashMovements, cashNetMovement, err := h.cashMovementTotals(r.Context(), user.ID, monthStart, nextMonth)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat pergerakan cash"))
		return
	}
	assetTotals, err := h.transactionTotalsByAssetType(r.Context(), user.ID, monthStart, nextMonth)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat total transaksi per aset"))
		return
	}
	instrumentTotals, err := h.transactionTotalsByInstrument(r.Context(), user.ID, monthStart, nextMonth)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat total transaksi per instrumen"))
		return
	}
	contributors, err := h.holdingContributions(r.Context(), user.ID, ending.Date, "DESC")
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat kontributor portfolio"))
		return
	}
	detractors, err := h.holdingContributions(r.Context(), user.ID, ending.Date, "ASC")
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat detraktor portfolio"))
		return
	}

	warnings, err := h.reportWarnings(r.Context(), user.ID, ending.Date, monthStart, nextMonth)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat catatan kualitas data"))
		return
	}
	warnings = append(warnings,
		warning("BEGINNING_NET_WORTH_UNAVAILABLE", "Beginning net worth tidak dihitung karena histori cash dan snapshot awal bulan belum cukup akurat.", "info"),
		warning("REALIZED_PL_UNAVAILABLE", "Realized profit/loss belum dihitung karena metode FIFO/average realized P/L belum tersedia di MVP.", "info"),
	)

	report := MonthlySummaryReport{
		Month:                         monthStart.Format("2006-01"),
		BaseCurrency:                  h.baseCurrency(),
		BeginningNetWorth:             nil,
		EndingNetWorth:                round2(ending.PortfolioValue + cash.TotalCash),
		NetWorthChange:                nil,
		CashBalance:                   round2(cash.TotalCash),
		CashNetMovement:               cashNetMovement,
		CashMovements:                 cashMovements,
		PortfolioValue:                round2(ending.PortfolioValue),
		PortfolioSnapshotDate:         dateStringPtr(ending.Date),
		RealizedProfitLoss:            nil,
		UnrealizedProfitLoss:          round2(ending.UnrealizedPL),
		TransactionTotalsByAssetType:  assetTotals,
		TransactionTotalsByInstrument: instrumentTotals,
		TopContributors:               contributors,
		TopDetractors:                 detractors,
		Warnings:                      dedupeWarnings(warnings),
		DataNotRealtime:               dataNotRealtimeNote,
		Disclaimer:                    reportDisclaimer,
		GeneratedAt:                   time.Now(),
	}

	response.JSON(w, r, http.StatusOK, report, nil)
}

func (h Handler) portfolioPerformance(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	fromDate, toDate, err := h.parseDateRange(r.Context(), user.ID, r.URL.Query().Get("from"), r.URL.Query().Get("to"))
	if err != nil {
		response.Error(w, r, err)
		return
	}
	if toDate.Before(fromDate) {
		response.Error(w, r, validation("Tanggal akhir harus sama atau setelah tanggal awal"))
		return
	}

	starting, err := h.latestSnapshotSummary(r.Context(), user.ID, fromDate)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat snapshot awal"))
		return
	}
	ending, err := h.latestSnapshotSummary(r.Context(), user.ID, toDate)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat snapshot akhir"))
		return
	}
	cash, err := h.cashSummary(r.Context(), user.ID)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat ringkasan cash"))
		return
	}
	_, cashPeriodMovement, err := h.cashMovementTotals(r.Context(), user.ID, fromDate, toDate.AddDate(0, 0, 1))
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat pergerakan cash"))
		return
	}
	cash.PeriodMovement = cashPeriodMovement
	allocation, err := h.allocationBreakdown(r.Context(), user.ID, ending.Date, cash.TotalCash)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat alokasi portfolio"))
		return
	}
	holdings, err := h.holdingsPerformance(r.Context(), user.ID, ending.Date)
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat performa holdings"))
		return
	}
	warnings, err := h.reportWarnings(r.Context(), user.ID, ending.Date, fromDate, toDate.AddDate(0, 0, 1))
	if err != nil {
		response.Error(w, r, internalErr(err, "Gagal memuat catatan kualitas data"))
		return
	}

	var startingValue *float64
	var absoluteChange *float64
	var percentageChange *float64
	if starting.Date != nil {
		value := round2(starting.PortfolioValue)
		startingValue = &value
		change := round2(ending.PortfolioValue - starting.PortfolioValue)
		absoluteChange = &change
		if starting.PortfolioValue > 0 {
			percent := change / starting.PortfolioValue
			percentageChange = &percent
		}
	} else {
		warnings = append(warnings, warning("STARTING_VALUE_UNAVAILABLE", "Starting value tidak tersedia karena tidak ada snapshot portfolio pada atau sebelum tanggal awal.", "info"))
	}

	report := PortfolioPerformanceReport{
		FromDate:             fromDate.Format("2006-01-02"),
		ToDate:               toDate.Format("2006-01-02"),
		BaseCurrency:         h.baseCurrency(),
		Method:               "simple_portfolio_change",
		StartingValue:        startingValue,
		StartingSnapshotDate: dateStringPtr(starting.Date),
		EndingValue:          round2(ending.PortfolioValue),
		EndingSnapshotDate:   dateStringPtr(ending.Date),
		AbsoluteChange:       absoluteChange,
		PercentageChange:     percentageChange,
		AllocationBreakdown:  allocation,
		HoldingsPerformance:  holdings,
		CashSummary:          cash,
		Warnings:             dedupeWarnings(warnings),
		DataNotRealtime:      dataNotRealtimeNote,
		Disclaimer:           reportDisclaimer,
		GeneratedAt:          time.Now(),
	}

	response.JSON(w, r, http.StatusOK, report, nil)
}

func (h Handler) exportCSV(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.UserFromContext(r.Context())
	var buffer bytes.Buffer
	writer := csv.NewWriter(&buffer)
	header := []string{
		"section", "generated_at", "record_id", "snapshot_date", "transaction_date", "price_date",
		"account_name", "instrument_type", "ticker", "name", "transaction_type", "units",
		"price", "average_price_idr", "current_price_idr", "gross_value", "fees", "tax",
		"net_value", "balance", "total_cost_idr", "current_value_idr", "profit_loss_idr",
		"profit_loss_percent", "currency", "original_currency", "fx_rate_to_idr", "source",
		"is_realtime", "warnings", "note",
	}
	if err := writer.Write(header); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menulis header CSV"))
		return
	}

	generatedAt := time.Now().Format(time.RFC3339)
	_ = writer.Write(csvRow(header, map[string]string{
		"section":      "metadata",
		"generated_at": generatedAt,
		"note":         dataNotRealtimeNote,
	}))

	if err := h.writeHoldingsCSV(r.Context(), user.ID, writer, header, generatedAt); err != nil {
		response.Error(w, r, internalErr(err, "Gagal export holdings"))
		return
	}
	if err := h.writeTransactionsCSV(r.Context(), user.ID, writer, header, generatedAt); err != nil {
		response.Error(w, r, internalErr(err, "Gagal export transaksi"))
		return
	}
	if err := h.writeCashCSV(r.Context(), user.ID, writer, header, generatedAt); err != nil {
		response.Error(w, r, internalErr(err, "Gagal export akun cash"))
		return
	}
	if err := h.writePricesCSV(r.Context(), user.ID, writer, header, generatedAt); err != nil {
		response.Error(w, r, internalErr(err, "Gagal export harga manual"))
		return
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		response.Error(w, r, internalErr(err, "Gagal menyelesaikan CSV"))
		return
	}

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", `attachment; filename="moneymate-portfolio-export.csv"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(buffer.Bytes())
}

func (h Handler) parseMonth(ctx context.Context, userID string, raw string) (time.Time, error) {
	if raw == "" {
		latest, err := h.latestSnapshotDate(ctx, userID)
		if err != nil {
			return time.Time{}, internalErr(err, "Gagal memuat bulan laporan default")
		}
		if latest != nil {
			return time.Date(latest.Year(), latest.Month(), 1, 0, 0, 0, 0, time.UTC), nil
		}
		now := time.Now()
		return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC), nil
	}
	parsed, err := time.Parse("2006-01", raw)
	if err != nil {
		return time.Time{}, validation("Bulan laporan harus format YYYY-MM")
	}
	return parsed, nil
}

func (h Handler) parseDateRange(ctx context.Context, userID string, rawFrom string, rawTo string) (time.Time, time.Time, error) {
	latest, err := h.latestSnapshotDate(ctx, userID)
	if err != nil {
		return time.Time{}, time.Time{}, internalErr(err, "Gagal memuat tanggal laporan default")
	}
	defaultTo := time.Now()
	if latest != nil {
		defaultTo = *latest
	}
	defaultFrom := time.Date(defaultTo.Year(), defaultTo.Month(), 1, 0, 0, 0, 0, time.UTC)

	from := defaultFrom
	if strings.TrimSpace(rawFrom) != "" {
		parsed, err := time.Parse("2006-01-02", strings.TrimSpace(rawFrom))
		if err != nil {
			return time.Time{}, time.Time{}, validation("Tanggal awal harus format YYYY-MM-DD")
		}
		from = parsed
	}
	to := defaultTo
	if strings.TrimSpace(rawTo) != "" {
		parsed, err := time.Parse("2006-01-02", strings.TrimSpace(rawTo))
		if err != nil {
			return time.Time{}, time.Time{}, validation("Tanggal akhir harus format YYYY-MM-DD")
		}
		to = parsed
	}
	return from, to, nil
}

func (h Handler) latestSnapshotDate(ctx context.Context, userID string) (*time.Time, error) {
	var date *time.Time
	if err := h.db.QueryRow(ctx, `SELECT MAX(snapshot_date) FROM holdings_snapshot WHERE user_id = $1`, userID).Scan(&date); err != nil {
		return nil, err
	}
	return date, nil
}

func (h Handler) latestSnapshotSummary(ctx context.Context, userID string, onOrBefore time.Time) (snapshotSummary, error) {
	var summary snapshotSummary
	err := h.db.QueryRow(ctx, `
		WITH latest_date AS (
			SELECT MAX(snapshot_date) AS snapshot_date
			FROM holdings_snapshot
			WHERE user_id = $1
			  AND snapshot_date <= $2::date
		)
		SELECT latest_date.snapshot_date,
		       COALESCE(SUM(hs.current_value), 0)::float8,
		       COALESCE(SUM(hs.total_cost), 0)::float8,
		       COALESCE(SUM(hs.profit_loss_value), 0)::float8
		FROM latest_date
		LEFT JOIN holdings_snapshot hs ON hs.user_id = $1 AND hs.snapshot_date = latest_date.snapshot_date
		GROUP BY latest_date.snapshot_date
	`, userID, onOrBefore.Format("2006-01-02")).Scan(&summary.Date, &summary.PortfolioValue, &summary.TotalCost, &summary.UnrealizedPL)
	return summary, err
}

func (h Handler) cashSummary(ctx context.Context, userID string) (CashSummary, error) {
	var summary CashSummary
	err := h.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(balance), 0)::float8, COUNT(*)::int
		FROM cash_accounts
		WHERE user_id = $1 AND is_active = TRUE
	`, userID).Scan(&summary.TotalCash, &summary.ActiveAccounts)
	if err != nil {
		return CashSummary{}, err
	}
	summary.TotalCash = round2(summary.TotalCash)
	summary.Currency = h.baseCurrency()
	summary.HistoryAvailable = false
	summary.Note = "Cash balance memakai saldo aktif saat laporan dibuat; pergerakan periode memakai cash adjustment ledger."
	return summary, nil
}

func (h Handler) cashMovementTotals(ctx context.Context, userID string, from time.Time, toExclusive time.Time) ([]CashMovementTotal, float64, error) {
	rows, err := h.db.Query(ctx, `
		SELECT type, COUNT(*)::int, COALESCE(SUM(amount), 0)::float8
		FROM cash_adjustments
		WHERE user_id = $1
		  AND adjustment_date >= $2::date AND adjustment_date < $3::date
		GROUP BY type
		ORDER BY type
	`, userID, from.Format("2006-01-02"), toExclusive.Format("2006-01-02"))
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := []CashMovementTotal{}
	total := 0.0
	for rows.Next() {
		var item CashMovementTotal
		if err := rows.Scan(&item.Type, &item.AdjustmentCount, &item.TotalIDR); err != nil {
			return nil, 0, err
		}
		item.TotalIDR = round2(item.TotalIDR)
		total += item.TotalIDR
		items = append(items, item)
	}
	return items, round2(total), rows.Err()
}

func (h Handler) transactionTotalsByAssetType(ctx context.Context, userID string, from time.Time, toExclusive time.Time) ([]TransactionTotal, error) {
	rows, err := h.db.Query(ctx, `
		SELECT COALESCE(i.type, 'other') AS asset_type,
		       t.type,
		       COUNT(*)::int,
		       COALESCE(SUM(CASE WHEN t.currency = 'IDR' OR t.fx_rate_to_idr IS NULL THEN t.net_value ELSE t.net_value * t.fx_rate_to_idr END), 0)::float8
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		WHERE t.user_id = $1
		  AND t.transaction_date >= $2::date AND t.transaction_date < $3::date
		GROUP BY COALESCE(i.type, 'other'), t.type
		ORDER BY asset_type, t.type
	`, userID, from.Format("2006-01-02"), toExclusive.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []TransactionTotal{}
	for rows.Next() {
		var item TransactionTotal
		if err := rows.Scan(&item.AssetType, &item.TransactionType, &item.TransactionCount, &item.TotalIDR); err != nil {
			return nil, err
		}
		item.TotalIDR = round2(item.TotalIDR)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (h Handler) transactionTotalsByInstrument(ctx context.Context, userID string, from time.Time, toExclusive time.Time) ([]InstrumentTotal, error) {
	rows, err := h.db.Query(ctx, `
		SELECT t.instrument_id::text,
		       i.ticker,
		       COALESCE(i.name, 'Tanpa Instrumen') AS name,
		       COALESCE(i.type, 'other') AS instrument_type,
		       t.currency,
		       t.type,
		       COUNT(*)::int,
		       COALESCE(SUM(CASE WHEN t.currency = 'IDR' OR t.fx_rate_to_idr IS NULL THEN t.net_value ELSE t.net_value * t.fx_rate_to_idr END), 0)::float8
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		WHERE t.user_id = $1
		  AND t.transaction_date >= $2::date AND t.transaction_date < $3::date
		GROUP BY t.instrument_id, i.ticker, COALESCE(i.name, 'Tanpa Instrumen'), COALESCE(i.type, 'other'), t.currency, t.type
		ORDER BY name, t.type
	`, userID, from.Format("2006-01-02"), toExclusive.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []InstrumentTotal{}
	for rows.Next() {
		var item InstrumentTotal
		if err := rows.Scan(&item.InstrumentID, &item.Ticker, &item.Name, &item.InstrumentType, &item.OriginalCurrency, &item.TransactionType, &item.TransactionCount, &item.TotalIDR); err != nil {
			return nil, err
		}
		item.TotalIDR = round2(item.TotalIDR)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (h Handler) holdingContributions(ctx context.Context, userID string, snapshotDate *time.Time, direction string) ([]HoldingContribution, error) {
	if snapshotDate == nil {
		return []HoldingContribution{}, nil
	}
	orderDirection := "DESC"
	if direction == "ASC" {
		orderDirection = "ASC"
	}
	rows, err := h.db.Query(ctx, fmt.Sprintf(`
		SELECT hs.instrument_id::text, i.ticker, i.name, i.type, hs.current_value::float8,
		       hs.profit_loss_value::float8, hs.profit_loss_percent::float8, i.currency,
		       hs.price_source, hs.warnings
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = $2::date
		ORDER BY hs.profit_loss_value %s
		LIMIT 3
	`, orderDirection), userID, snapshotDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []HoldingContribution{}
	for rows.Next() {
		var item HoldingContribution
		var warningsBytes []byte
		if err := rows.Scan(&item.InstrumentID, &item.Ticker, &item.Name, &item.InstrumentType, &item.CurrentValue, &item.ProfitLossValue, &item.ProfitLossPercent, &item.OriginalCurrency, &item.PriceSource, &warningsBytes); err != nil {
			return nil, err
		}
		item.CurrentValue = round2(item.CurrentValue)
		item.ProfitLossValue = round2(item.ProfitLossValue)
		item.Warnings = decodeWarnings(warningsBytes)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (h Handler) allocationBreakdown(ctx context.Context, userID string, snapshotDate *time.Time, totalCash float64) ([]AllocationRow, error) {
	items := []AllocationRow{}
	if snapshotDate != nil {
		rows, err := h.db.Query(ctx, `
			SELECT COALESCE(ac.name, i.type) AS asset, COALESCE(SUM(hs.current_value), 0)::float8 AS value
			FROM holdings_snapshot hs
			JOIN instruments i ON i.id = hs.instrument_id
			LEFT JOIN instrument_categories ic ON ic.instrument_id = i.id
			LEFT JOIN asset_categories ac ON ac.id = ic.category_id
			WHERE hs.user_id = $1
			  AND hs.snapshot_date = $2::date
			GROUP BY COALESCE(ac.name, i.type)
			ORDER BY value DESC
		`, userID, snapshotDate.Format("2006-01-02"))
		if err != nil {
			return nil, err
		}
		defer rows.Close()
		for rows.Next() {
			var item AllocationRow
			if err := rows.Scan(&item.Asset, &item.Value); err != nil {
				return nil, err
			}
			item.Value = round2(item.Value)
			items = append(items, item)
		}
		if err := rows.Err(); err != nil {
			return nil, err
		}
	}
	if totalCash > 0 {
		items = append(items, AllocationRow{Asset: "Cash", Value: round2(totalCash)})
	}

	total := 0.0
	for _, item := range items {
		total += item.Value
	}
	for index := range items {
		if total > 0 {
			items[index].Percent = items[index].Value / total
		}
	}
	return items, nil
}

func (h Handler) holdingsPerformance(ctx context.Context, userID string, snapshotDate *time.Time) ([]HoldingPerformance, error) {
	if snapshotDate == nil {
		return []HoldingPerformance{}, nil
	}
	rows, err := h.db.Query(ctx, `
		SELECT hs.instrument_id::text, i.ticker, i.name, i.type, hs.units::float8,
		       hs.average_price::float8, hs.current_price::float8, hs.total_cost::float8,
		       hs.current_value::float8, hs.profit_loss_value::float8, hs.profit_loss_percent::float8,
		       i.currency, lp.price::float8, lp.currency, lp.fx_rate_to_idr::float8,
		       hs.price_source, hs.price_updated_at, hs.warnings
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		LEFT JOIN LATERAL (
			SELECT price, currency, fx_rate_to_idr
			FROM price_snapshots ps
			WHERE ps.user_id = $1
			  AND ps.instrument_id = i.id
			ORDER BY ps.price_date DESC, ps.created_at DESC
			LIMIT 1
		) lp ON TRUE
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = $2::date
		ORDER BY hs.current_value DESC
	`, userID, snapshotDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []HoldingPerformance{}
	for rows.Next() {
		var item HoldingPerformance
		var warningsBytes []byte
		if err := rows.Scan(
			&item.InstrumentID, &item.Ticker, &item.Name, &item.InstrumentType, &item.Units,
			&item.AveragePriceIDR, &item.CurrentPriceIDR, &item.TotalCostIDR, &item.CurrentValueIDR,
			&item.ProfitLossValueIDR, &item.ProfitLossPercent, &item.InstrumentCurrency,
			&item.LatestPrice, &item.LatestPriceCurrency, &item.FXRateToIDR,
			&item.PriceSource, &item.PriceUpdatedAt, &warningsBytes,
		); err != nil {
			return nil, err
		}
		item.AveragePriceIDR = round2(item.AveragePriceIDR)
		item.CurrentPriceIDR = round2(item.CurrentPriceIDR)
		item.TotalCostIDR = round2(item.TotalCostIDR)
		item.CurrentValueIDR = round2(item.CurrentValueIDR)
		item.ProfitLossValueIDR = round2(item.ProfitLossValueIDR)
		item.Warnings = decodeWarnings(warningsBytes)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (h Handler) reportWarnings(ctx context.Context, userID string, snapshotDate *time.Time, from time.Time, toExclusive time.Time) ([]ReportWarning, error) {
	warnings := []ReportWarning{
		warning("DATA_NOT_REALTIME", "Semua harga MVP berasal dari input manual/mock dan bukan real-time.", "info"),
		warning("NO_RECOMMENDATION", "Laporan tidak berisi rekomendasi beli/jual.", "info"),
		warning("CASH_OPENING_BALANCE_UNAVAILABLE", "Pergerakan cash memakai adjustment ledger, tetapi opening cash historis sebelum ledger lengkap belum dapat dijamin akurat.", "info"),
	}

	var missingFXTransactions int
	if err := h.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM transactions
		WHERE user_id = $1
		  AND transaction_date >= $2::date
		  AND transaction_date < $3::date
		  AND currency <> 'IDR'
		  AND fx_rate_to_idr IS NULL
	`, userID, from.Format("2006-01-02"), toExclusive.Format("2006-01-02")).Scan(&missingFXTransactions); err != nil {
		return nil, err
	}
	if missingFXTransactions > 0 {
		warnings = append(warnings, warning("MISSING_FX", "Ada transaksi non-IDR tanpa FX rate ke IDR.", "warning"))
	}

	var missingFXPrices int
	if err := h.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM price_snapshots
		WHERE user_id = $1
		  AND currency <> 'IDR'
		  AND fx_rate_to_idr IS NULL
	`, userID).Scan(&missingFXPrices); err != nil {
		return nil, err
	}
	if missingFXPrices > 0 {
		warnings = append(warnings, warning("MISSING_PRICE_FX", "Ada harga manual non-IDR tanpa FX rate ke IDR.", "warning"))
	}

	if snapshotDate == nil {
		warnings = append(warnings, warning("NO_HOLDINGS_SNAPSHOT", "Belum ada holdings snapshot untuk periode laporan.", "warning"))
		return warnings, nil
	}

	var stalePrices int
	if err := h.db.QueryRow(ctx, `
		SELECT COUNT(*)::int
		FROM holdings_snapshot
		WHERE user_id = $1
		  AND snapshot_date = $2::date
		  AND price_updated_at IS NOT NULL
		  AND price_updated_at < now() - INTERVAL '7 days'
	`, userID, snapshotDate.Format("2006-01-02")).Scan(&stalePrices); err != nil {
		return nil, err
	}
	if stalePrices > 0 {
		warnings = append(warnings, warning("STALE_PRICE", "Ada harga manual yang lebih lama dari 7 hari.", "warning"))
	}

	rows, err := h.db.Query(ctx, `
		SELECT i.name, hs.warnings
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = $2::date
		  AND jsonb_array_length(hs.warnings) > 0
	`, userID, snapshotDate.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var name string
		var warningsBytes []byte
		if err := rows.Scan(&name, &warningsBytes); err != nil {
			return nil, err
		}
		for _, item := range decodeWarnings(warningsBytes) {
			warnings = append(warnings, warning("HOLDING_DATA_QUALITY", name+": "+item, "warning"))
		}
	}
	return warnings, rows.Err()
}

func (h Handler) writeHoldingsCSV(ctx context.Context, userID string, writer *csv.Writer, header []string, generatedAt string) error {
	latest, err := h.latestSnapshotDate(ctx, userID)
	if err != nil {
		return err
	}
	if latest == nil {
		return nil
	}
	rows, err := h.db.Query(ctx, `
		SELECT hs.id::text, hs.snapshot_date, i.type, i.ticker, i.name, hs.units::float8,
		       hs.average_price::float8, hs.current_price::float8, hs.total_cost::float8,
		       hs.current_value::float8, hs.profit_loss_value::float8, hs.profit_loss_percent::float8,
		       hs.currency, i.currency, hs.price_source, hs.warnings
		FROM holdings_snapshot hs
		JOIN instruments i ON i.id = hs.instrument_id
		WHERE hs.user_id = $1
		  AND hs.snapshot_date = $2::date
		ORDER BY hs.current_value DESC
	`, userID, latest.Format("2006-01-02"))
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id, instrumentType, name, currency, originalCurrency, source string
		var ticker *string
		var snapshotDate time.Time
		var units, averagePrice, currentPrice, totalCost, currentValue, profitLoss, profitLossPercent float64
		var warningsBytes []byte
		if err := rows.Scan(&id, &snapshotDate, &instrumentType, &ticker, &name, &units, &averagePrice, &currentPrice, &totalCost, &currentValue, &profitLoss, &profitLossPercent, &currency, &originalCurrency, &source, &warningsBytes); err != nil {
			return err
		}
		if err := writer.Write(csvRow(header, map[string]string{
			"section":             "holdings",
			"generated_at":        generatedAt,
			"record_id":           id,
			"snapshot_date":       snapshotDate.Format("2006-01-02"),
			"instrument_type":     instrumentType,
			"ticker":              ptrString(ticker),
			"name":                name,
			"units":               floatString(units),
			"average_price_idr":   floatString(averagePrice),
			"current_price_idr":   floatString(currentPrice),
			"total_cost_idr":      floatString(totalCost),
			"current_value_idr":   floatString(currentValue),
			"profit_loss_idr":     floatString(profitLoss),
			"profit_loss_percent": floatString(profitLossPercent),
			"currency":            currency,
			"original_currency":   originalCurrency,
			"source":              source,
			"warnings":            strings.Join(decodeWarnings(warningsBytes), "; "),
			"note":                dataNotRealtimeNote,
		})); err != nil {
			return err
		}
	}
	return rows.Err()
}

func (h Handler) writeTransactionsCSV(ctx context.Context, userID string, writer *csv.Writer, header []string, generatedAt string) error {
	rows, err := h.db.Query(ctx, `
		SELECT t.id::text, t.transaction_date, i.type, i.ticker, i.name, t.type,
		       t.units::float8, t.price::float8, t.gross_value::float8, t.fees::float8,
		       t.tax::float8, t.net_value::float8, t.currency, t.fx_rate_to_idr::float8, t.source
		FROM transactions t
		LEFT JOIN instruments i ON i.id = t.instrument_id
		WHERE t.user_id = $1
		ORDER BY t.transaction_date DESC, t.created_at DESC
	`, userID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id, txType, currency, source string
		var instrumentType, name *string
		var ticker *string
		var txDate time.Time
		var units, price, grossValue, fees, tax, netValue float64
		var fxRate *float64
		if err := rows.Scan(&id, &txDate, &instrumentType, &ticker, &name, &txType, &units, &price, &grossValue, &fees, &tax, &netValue, &currency, &fxRate, &source); err != nil {
			return err
		}
		note := dataNotRealtimeNote
		if currency != h.baseCurrency() && fxRate == nil {
			note = note + " FX rate ke IDR belum diisi."
		}
		if err := writer.Write(csvRow(header, map[string]string{
			"section":           "transactions",
			"generated_at":      generatedAt,
			"record_id":         id,
			"transaction_date":  txDate.Format("2006-01-02"),
			"instrument_type":   ptrString(instrumentType),
			"ticker":            ptrString(ticker),
			"name":              ptrString(name),
			"transaction_type":  txType,
			"units":             floatString(units),
			"price":             floatString(price),
			"gross_value":       floatString(grossValue),
			"fees":              floatString(fees),
			"tax":               floatString(tax),
			"net_value":         floatString(netValue),
			"currency":          currency,
			"original_currency": currency,
			"fx_rate_to_idr":    floatPtrString(fxRate),
			"source":            source,
			"note":              note,
		})); err != nil {
			return err
		}
	}
	return rows.Err()
}

func (h Handler) writeCashCSV(ctx context.Context, userID string, writer *csv.Writer, header []string, generatedAt string) error {
	rows, err := h.db.Query(ctx, `
		SELECT id::text, account_name, account_type, currency, balance::float8, is_active
		FROM cash_accounts
		WHERE user_id = $1
		ORDER BY account_name
	`, userID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id, accountName, accountType, currency string
		var balance float64
		var isActive bool
		if err := rows.Scan(&id, &accountName, &accountType, &currency, &balance, &isActive); err != nil {
			return err
		}
		if err := writer.Write(csvRow(header, map[string]string{
			"section":         "cash_accounts",
			"generated_at":    generatedAt,
			"record_id":       id,
			"account_name":    accountName,
			"instrument_type": accountType,
			"balance":         floatString(balance),
			"currency":        currency,
			"is_realtime":     "false",
			"note":            fmt.Sprintf("Saldo cash aktif saat export: %t. Histori saldo cash belum tersedia.", isActive),
		})); err != nil {
			return err
		}
	}
	return rows.Err()
}

func (h Handler) writePricesCSV(ctx context.Context, userID string, writer *csv.Writer, header []string, generatedAt string) error {
	rows, err := h.db.Query(ctx, `
		SELECT ps.id::text, ps.price_date, i.type, i.ticker, i.name, ps.price::float8,
		       ps.currency, ps.fx_rate_to_idr::float8, ps.source, ps.is_realtime
		FROM price_snapshots ps
		JOIN instruments i ON i.id = ps.instrument_id
		WHERE ps.user_id = $1
		ORDER BY ps.price_date DESC, ps.created_at DESC
	`, userID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var id, instrumentType, name, currency, source string
		var ticker *string
		var priceDate time.Time
		var price float64
		var fxRate *float64
		var isRealtime bool
		if err := rows.Scan(&id, &priceDate, &instrumentType, &ticker, &name, &price, &currency, &fxRate, &source, &isRealtime); err != nil {
			return err
		}
		note := dataNotRealtimeNote
		if currency != h.baseCurrency() && fxRate == nil {
			note = note + " FX rate ke IDR belum diisi."
		}
		if err := writer.Write(csvRow(header, map[string]string{
			"section":           "manual_prices",
			"generated_at":      generatedAt,
			"record_id":         id,
			"price_date":        priceDate.Format("2006-01-02"),
			"instrument_type":   instrumentType,
			"ticker":            ptrString(ticker),
			"name":              name,
			"price":             floatString(price),
			"currency":          currency,
			"original_currency": currency,
			"fx_rate_to_idr":    floatPtrString(fxRate),
			"source":            source,
			"is_realtime":       strconv.FormatBool(isRealtime),
			"note":              note,
		})); err != nil {
			return err
		}
	}
	return rows.Err()
}

func csvRow(header []string, values map[string]string) []string {
	row := make([]string, len(header))
	for index, column := range header {
		row[index] = values[column]
	}
	return row
}

func decodeWarnings(bytes []byte) []string {
	if len(bytes) == 0 {
		return nil
	}
	var warnings []string
	if err := json.Unmarshal(bytes, &warnings); err != nil {
		return nil
	}
	return warnings
}

func warning(code string, message string, severity string) ReportWarning {
	return ReportWarning{Code: code, Message: message, Severity: severity}
}

func dedupeWarnings(items []ReportWarning) []ReportWarning {
	seen := map[string]bool{}
	result := []ReportWarning{}
	for _, item := range items {
		key := item.Code + "|" + item.Message
		if seen[key] {
			continue
		}
		seen[key] = true
		result = append(result, item)
	}
	return result
}

func dateStringPtr(value *time.Time) *string {
	if value == nil {
		return nil
	}
	formatted := value.Format("2006-01-02")
	return &formatted
}

func ptrString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func floatString(value float64) string {
	return strconv.FormatFloat(round2(value), 'f', -1, 64)
}

func floatPtrString(value *float64) string {
	if value == nil {
		return ""
	}
	return floatString(*value)
}

func round2(value float64) float64 {
	rounded, _ := strconv.ParseFloat(strconv.FormatFloat(value, 'f', 2, 64), 64)
	return rounded
}

func (h Handler) baseCurrency() string {
	if h.cfg.BaseCurrency == "" {
		return "IDR"
	}
	return h.cfg.BaseCurrency
}

func validation(message string) error {
	return apperror.New(apperror.CodeValidation, message, http.StatusBadRequest)
}

func internalErr(err error, message string) error {
	if err == pgx.ErrNoRows {
		return apperror.New(apperror.CodeNotFound, message, http.StatusNotFound)
	}
	return apperror.Wrap(err, apperror.CodeInternal, message, http.StatusInternalServerError)
}
