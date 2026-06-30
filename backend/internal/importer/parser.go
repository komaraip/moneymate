package importer

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"math"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/xuri/excelize/v2"
)

type Section string

const (
	SectionHoldings     Section = "holdings"
	SectionOrders       Section = "orders"
	SectionAssetSummary Section = "asset_summary"
	SectionCash         Section = "cash"
)

const (
	RowStatusValid   = "valid"
	RowStatusInvalid = "invalid"
)

var ErrUnsupportedFile = errors.New("unsupported import file type")

type Preview struct {
	JobID            string         `json:"job_id,omitempty"`
	SourceType       string         `json:"source_type,omitempty"`
	OriginalFilename string         `json:"original_filename,omitempty"`
	DetectedSections []Section      `json:"detected_sections"`
	Rows             []PreviewRow   `json:"rows"`
	Summary          PreviewSummary `json:"summary"`
}

type PreviewSummary struct {
	TotalRows   int `json:"total_rows"`
	ValidRows   int `json:"valid_rows"`
	InvalidRows int `json:"invalid_rows"`
}

type PreviewRow struct {
	ID         string            `json:"id,omitempty"`
	Section    Section           `json:"section"`
	RowNumber  int               `json:"row_number"`
	Status     string            `json:"status"`
	Raw        map[string]string `json:"raw"`
	Normalized map[string]any    `json:"normalized"`
	Errors     []string          `json:"errors"`
}

func SourceType(filename string) (string, error) {
	switch strings.ToLower(filepath.Ext(filename)) {
	case ".csv":
		return "csv", nil
	case ".xlsx":
		return "xlsx", nil
	default:
		return "", ErrUnsupportedFile
	}
}

func Parse(reader io.Reader, filename string) (Preview, error) {
	sourceType, err := SourceType(filename)
	if err != nil {
		return Preview{}, err
	}

	var rows [][]string
	switch sourceType {
	case "csv":
		rows, err = readCSV(reader)
	case "xlsx":
		rows, err = readXLSX(reader)
	default:
		return Preview{}, ErrUnsupportedFile
	}
	if err != nil {
		return Preview{}, err
	}

	preview := parseRows(rows)
	preview.SourceType = sourceType
	preview.OriginalFilename = filename
	return preview, nil
}

func readCSV(reader io.Reader) ([][]string, error) {
	csvReader := csv.NewReader(reader)
	csvReader.FieldsPerRecord = -1
	csvReader.TrimLeadingSpace = true
	return csvReader.ReadAll()
}

func readXLSX(reader io.Reader) ([][]string, error) {
	file, err := excelize.OpenReader(reader)
	if err != nil {
		return nil, fmt.Errorf("open xlsx: %w", err)
	}
	defer file.Close()

	sheets := file.GetSheetList()
	if len(sheets) == 0 {
		return nil, errors.New("xlsx has no sheets")
	}

	rows, err := file.GetRows(sheets[0])
	if err != nil {
		return nil, fmt.Errorf("read xlsx rows: %w", err)
	}
	return rows, nil
}

func parseRows(rows [][]string) Preview {
	preview := Preview{
		DetectedSections: []Section{},
		Rows:             []PreviewRow{},
	}
	detected := map[Section]bool{}

	var current Section
	var headers []string

	for index, sourceRow := range rows {
		rowNumber := index + 1
		row := trimRow(sourceRow)
		if rowIsEmpty(row) {
			continue
		}

		if isAssetHeader(row) {
			current = SectionAssetSummary
			headers = canonicalHeaders(row, current)
			addDetected(&preview, detected, current)
			continue
		}

		if section, ok := detectSection(row); ok {
			current = section
			headers = nil
			addDetected(&preview, detected, current)
			continue
		}

		if current == "" {
			continue
		}

		if headers == nil {
			if looksLikeHeader(row, current) {
				headers = canonicalHeaders(row, current)
			}
			continue
		}

		raw := rowToMap(headers, row)
		if rawMapEmpty(raw) {
			continue
		}

		previewRow := normalizeRow(current, rowNumber, raw)
		preview.Rows = append(preview.Rows, previewRow)
	}

	for _, row := range preview.Rows {
		preview.Summary.TotalRows++
		if row.Status == RowStatusValid {
			preview.Summary.ValidRows++
		} else {
			preview.Summary.InvalidRows++
		}
	}

	return preview
}

func addDetected(preview *Preview, detected map[Section]bool, section Section) {
	if detected[section] {
		return
	}
	preview.DetectedSections = append(preview.DetectedSections, section)
	detected[section] = true
}

func detectSection(row []string) (Section, bool) {
	label := normalizedLabel(firstNonEmpty(row))
	switch label {
	case "invesment", "investment", "portfolio", "holdings":
		return SectionHoldings, true
	case "orders", "transactions":
		return SectionOrders, true
	case "cash":
		return SectionCash, true
	default:
		return "", false
	}
}

func isAssetHeader(row []string) bool {
	hasAsset := false
	hasValue := false
	for _, cell := range row {
		key := canonicalHeader(cell, SectionAssetSummary)
		hasAsset = hasAsset || key == "asset"
		hasValue = hasValue || key == "value"
	}
	return hasAsset && hasValue
}

func looksLikeHeader(row []string, section Section) bool {
	score := 0
	for _, cell := range row {
		key := canonicalHeader(cell, section)
		if key != "" && !strings.HasPrefix(key, "column_") {
			score++
		}
	}
	return score >= 2
}

func canonicalHeaders(row []string, section Section) []string {
	headers := make([]string, len(row))
	seen := map[string]int{}
	for index, cell := range row {
		key := canonicalHeader(cell, section)
		if key == "" {
			key = fmt.Sprintf("column_%d", index+1)
		}
		seen[key]++
		if seen[key] > 1 {
			key = fmt.Sprintf("%s_%d", key, seen[key])
		}
		headers[index] = key
	}
	return headers
}

func canonicalHeader(value string, section Section) string {
	label := normalizedLabel(value)
	if label == "" {
		return ""
	}

	switch label {
	case "instrument", "instrument type", "type instrument", "asset type", "asset category", "kategori aset", "kategori":
		if section == SectionAssetSummary {
			return "asset"
		}
		return "instrument"
	case "asset":
		if section == SectionAssetSummary {
			return "asset"
		}
		return "instrument"
	case "ticker", "symbol", "kode":
		return "ticker"
	case "name", "nama", "nama instrument", "nama instrumen":
		return "name"
	case "average price", "avg price", "average", "harga rata rata", "harga rata-rata":
		return "average_price"
	case "current price", "market price", "harga sekarang", "harga saat ini":
		return "current_price"
	case "units", "unit", "quantity", "qty", "jumlah unit":
		return "units"
	case "total cost", "total value asset", "cost", "modal", "nilai modal":
		return "total_cost"
	case "current value", "market value", "nilai saat ini":
		return "current_value"
	case "profit loss value", "profit/loss value", "p/l value", "pl value", "laba rugi", "laba rugi value":
		return "profit_loss_value"
	case "profit loss percent", "profit/loss percent", "p/l percent", "pl percent", "p/l %", "pl %", "laba rugi percent":
		return "profit_loss_percent"
	case "date", "tanggal":
		return "date"
	case "type", "transaction type", "tipe", "aksi":
		return "type"
	case "price", "harga":
		return "price"
	case "total value", "total", "amount", "nominal", "nilai":
		return "total_value"
	case "value":
		if section == SectionAssetSummary {
			return "value"
		}
		return "total_value"
	case "currency", "mata uang":
		return "currency"
	case "account", "cash account", "akun", "nama akun":
		return "account"
	case "balance", "saldo":
		return "balance"
	default:
		return ""
	}
}

func normalizeRow(section Section, rowNumber int, raw map[string]string) PreviewRow {
	normalized := map[string]any{}
	var rowErrors []string

	switch section {
	case SectionHoldings:
		normalized, rowErrors = normalizeHolding(raw)
	case SectionOrders:
		normalized, rowErrors = normalizeOrder(raw)
	case SectionAssetSummary:
		normalized, rowErrors = normalizeAssetSummary(raw)
	case SectionCash:
		normalized, rowErrors = normalizeCash(raw)
	default:
		rowErrors = append(rowErrors, "Section tidak dikenali")
	}

	status := RowStatusValid
	if len(rowErrors) > 0 {
		status = RowStatusInvalid
	}

	return PreviewRow{
		Section:    section,
		RowNumber:  rowNumber,
		Status:     status,
		Raw:        raw,
		Normalized: normalized,
		Errors:     rowErrors,
	}
}

func normalizeHolding(raw map[string]string) (map[string]any, []string) {
	errors := []string{}
	instrument := clean(raw["instrument"])
	ticker := strings.ToUpper(clean(raw["ticker"]))
	name := clean(raw["name"])
	if name == "" {
		name = fallbackName(instrument, ticker)
	}
	currency := normalizeCurrency(raw["currency"], instrument, ticker)
	instrumentType := inferInstrumentType(instrument, ticker, name)

	normalized := map[string]any{
		"instrument":      instrument,
		"instrument_type": instrumentType,
		"ticker":          ticker,
		"name":            name,
		"currency":        currency,
	}

	addNumber(raw, normalized, &errors, "average_price", false, false)
	addNumber(raw, normalized, &errors, "current_price", false, false)
	addNumber(raw, normalized, &errors, "units", false, false)
	addNumber(raw, normalized, &errors, "total_cost", false, false)
	addNumber(raw, normalized, &errors, "current_value", false, false)
	addNumber(raw, normalized, &errors, "profit_loss_value", false, true)
	addNumber(raw, normalized, &errors, "profit_loss_percent", false, true)

	if name == "" && ticker == "" {
		errors = append(errors, "Nama atau ticker instrument wajib diisi")
	}
	if units, ok := floatValue(normalized, "units"); ok && units < 0 {
		errors = append(errors, "Units tidak boleh negatif")
	}
	if currentPrice, ok := floatValue(normalized, "current_price"); ok && currentPrice < 0 {
		errors = append(errors, "Current price tidak boleh negatif")
	}
	inferCurrentFX(normalized)

	return normalized, errors
}

func normalizeOrder(raw map[string]string) (map[string]any, []string) {
	errors := []string{}
	instrument := clean(raw["instrument"])
	ticker := strings.ToUpper(clean(raw["ticker"]))
	name := clean(raw["name"])
	if name == "" {
		name = fallbackName(instrument, ticker)
	}
	currency := normalizeCurrency(raw["currency"], instrument, ticker)
	txType := normalizeTransactionType(raw["type"])
	instrumentType := inferInstrumentType(instrument, ticker, name)

	normalized := map[string]any{
		"instrument":      instrument,
		"instrument_type": instrumentType,
		"ticker":          ticker,
		"name":            name,
		"type":            txType,
		"currency":        currency,
	}

	if rawDate := clean(raw["date"]); rawDate == "" {
		errors = append(errors, "Tanggal transaksi wajib diisi")
	} else if parsed, ok := parseDate(rawDate); ok {
		normalized["date"] = parsed
	} else {
		errors = append(errors, "Tanggal transaksi harus format YYYY-MM-DD atau DD/MM/YYYY")
	}

	addNumber(raw, normalized, &errors, "price", true, false)
	addNumber(raw, normalized, &errors, "units", false, false)
	addNumber(raw, normalized, &errors, "total_value", false, false)

	price, hasPrice := floatValue(normalized, "price")
	units, hasUnits := floatValue(normalized, "units")
	totalValue, hasTotalValue := floatValue(normalized, "total_value")
	if hasPrice && hasUnits {
		grossValue := price * units
		normalized["gross_value"] = grossValue
		if !hasTotalValue {
			totalValue = grossValue
			normalized["total_value"] = totalValue
		}
		normalized["net_value"] = totalValue
		inferOrderFX(normalized, grossValue, totalValue)
	}

	if name == "" && ticker == "" {
		errors = append(errors, "Nama atau ticker instrument wajib diisi")
	}
	if txType == "" {
		errors = append(errors, "Tipe transaksi wajib diisi")
	}
	if (txType == "buy" || txType == "sell") && (!hasUnits || units <= 0) {
		errors = append(errors, "Units wajib lebih dari 0 untuk buy/sell")
	}
	if currency != "IDR" {
		if _, ok := floatValue(normalized, "fx_rate_to_idr"); !ok {
			errors = append(errors, "FX rate ke IDR tidak terdeteksi untuk transaksi non-IDR")
		}
	}

	return normalized, errors
}

func normalizeAssetSummary(raw map[string]string) (map[string]any, []string) {
	errors := []string{}
	asset := clean(raw["asset"])
	value, ok := parseNumber(raw["value"])
	normalized := map[string]any{
		"asset": asset,
	}
	if ok {
		normalized["value"] = value
	} else {
		errors = append(errors, "Value asset wajib berupa angka")
	}
	if asset == "" {
		errors = append(errors, "Nama asset wajib diisi")
	}
	return normalized, errors
}

func normalizeCash(raw map[string]string) (map[string]any, []string) {
	errors := []string{}
	account := clean(raw["account"])
	currency := normalizeCurrency(raw["currency"], "cash", "")
	normalized := map[string]any{
		"account":  account,
		"currency": currency,
	}
	addNumber(raw, normalized, &errors, "balance", true, true)
	if account == "" {
		errors = append(errors, "Nama akun cash wajib diisi")
	}
	return normalized, errors
}

func addNumber(raw map[string]string, normalized map[string]any, errors *[]string, key string, required bool, allowNegative bool) {
	value := clean(raw[key])
	if value == "" {
		if required {
			*errors = append(*errors, fmt.Sprintf("%s wajib diisi", humanKey(key)))
		}
		return
	}

	number, ok := parseNumber(value)
	if !ok {
		*errors = append(*errors, fmt.Sprintf("%s wajib berupa angka", humanKey(key)))
		return
	}
	if !allowNegative && number < 0 {
		*errors = append(*errors, fmt.Sprintf("%s tidak boleh negatif", humanKey(key)))
		return
	}
	normalized[key] = number
}

func inferCurrentFX(normalized map[string]any) {
	currency, _ := stringValue(normalized, "currency")
	if currency == "IDR" {
		return
	}
	price, hasPrice := floatValue(normalized, "current_price")
	units, hasUnits := floatValue(normalized, "units")
	currentValue, hasCurrentValue := floatValue(normalized, "current_value")
	if !hasPrice || !hasUnits || !hasCurrentValue || price <= 0 || units <= 0 {
		return
	}
	originalValue := price * units
	if currentValue > originalValue*100 {
		normalized["fx_rate_to_idr"] = currentValue / originalValue
	}
}

func inferOrderFX(normalized map[string]any, grossValue float64, totalValue float64) {
	currency, _ := stringValue(normalized, "currency")
	if currency == "IDR" || grossValue <= 0 {
		return
	}
	if totalValue > grossValue*100 {
		normalized["fx_rate_to_idr"] = totalValue / grossValue
		normalized["total_value_idr"] = totalValue
		normalized["net_value"] = grossValue
	}
}

func normalizeCurrency(rawValue string, instrument string, ticker string) string {
	value := strings.ToUpper(clean(rawValue))
	value = strings.TrimPrefix(value, "CURRENCY ")
	switch value {
	case "", "-":
		if strings.EqualFold(ticker, "SPY") || strings.Contains(strings.ToLower(instrument), "etf") {
			return "USD"
		}
		return "IDR"
	case "RP", "RUPIAH":
		return "IDR"
	case "US$", "$":
		return "USD"
	default:
		return value
	}
}

func normalizeTransactionType(value string) string {
	switch normalizedLabel(value) {
	case "buy", "beli":
		return "buy"
	case "sell", "jual":
		return "sell"
	case "dividend", "dividen":
		return "dividend"
	case "fee", "biaya":
		return "fee"
	case "adjustment", "adjust", "penyesuaian":
		return "adjustment"
	default:
		return ""
	}
}

func inferInstrumentType(instrument string, ticker string, name string) string {
	label := normalizedLabel(strings.Join([]string{instrument, ticker, name}, " "))
	switch {
	case strings.Contains(label, "reksadana"), strings.Contains(label, "reksa dana"), strings.Contains(label, "mutual fund"):
		return "mutual_fund"
	case strings.Contains(label, "saham"), strings.Contains(label, "stock"), strings.EqualFold(ticker, "BBRI"):
		return "stock"
	case strings.Contains(label, "etf"), strings.EqualFold(ticker, "SPY"):
		return "etf"
	case strings.Contains(label, "emas"), strings.Contains(label, "gold"), strings.Contains(label, "pegadaian"):
		return "gold"
	case strings.Contains(label, "cash"):
		return "cash"
	default:
		return "other"
	}
}

func fallbackName(instrument string, ticker string) string {
	if clean(ticker) != "" {
		return clean(ticker)
	}
	return clean(instrument)
}

func parseDate(value string) (string, bool) {
	value = clean(value)
	formats := []string{
		"2006-01-02",
		"02/01/2006",
		"2/1/2006",
		"02-01-2006",
		"2-1-2006",
		"01/02/2006",
		"1/2/2006",
	}
	for _, layout := range formats {
		parsed, err := time.Parse(layout, value)
		if err == nil {
			return parsed.Format("2006-01-02"), true
		}
	}
	return "", false
}

func parseNumber(value string) (float64, bool) {
	value = strings.TrimSpace(value)
	if value == "" {
		return 0, false
	}
	negative := false
	if strings.HasPrefix(value, "(") && strings.HasSuffix(value, ")") {
		negative = true
		value = strings.TrimPrefix(strings.TrimSuffix(value, ")"), "(")
	}

	replacer := strings.NewReplacer(
		"Rp", "",
		"rp", "",
		"IDR", "",
		"idr", "",
		"US$", "",
		"USD", "",
		"usd", "",
		"$", "",
		"%", "",
		" ", "",
		"\u00a0", "",
	)
	value = replacer.Replace(value)
	value = strings.TrimSpace(value)

	lastComma := strings.LastIndex(value, ",")
	lastDot := strings.LastIndex(value, ".")
	switch {
	case lastComma >= 0 && lastDot >= 0:
		if lastComma > lastDot {
			value = strings.ReplaceAll(value, ".", "")
			value = strings.ReplaceAll(value, ",", ".")
		} else {
			value = strings.ReplaceAll(value, ",", "")
		}
	case lastComma >= 0:
		if strings.Count(value, ",") > 1 {
			value = strings.ReplaceAll(value, ",", "")
		} else {
			parts := strings.Split(value, ",")
			if len(parts) == 2 && len(parts[1]) == 3 && len(parts[0]) <= 3 {
				value = strings.ReplaceAll(value, ",", "")
			} else {
				value = strings.ReplaceAll(value, ",", ".")
			}
		}
	case lastDot >= 0:
		if strings.Count(value, ".") > 1 {
			value = strings.ReplaceAll(value, ".", "")
		} else {
			parts := strings.Split(value, ".")
			if len(parts) == 2 && len(parts[1]) == 3 && len(parts[0]) <= 3 {
				value = strings.ReplaceAll(value, ".", "")
			}
		}
	}

	number, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsNaN(number) || math.IsInf(number, 0) {
		return 0, false
	}
	if negative {
		number = -number
	}
	return number, true
}

func rowToMap(headers []string, row []string) map[string]string {
	raw := map[string]string{}
	for index, header := range headers {
		if header == "" {
			continue
		}
		raw[header] = clean(rowValue(row, index))
	}
	return raw
}

func trimRow(row []string) []string {
	trimmed := make([]string, len(row))
	for index, cell := range row {
		trimmed[index] = clean(cell)
	}
	return trimmed
}

func rowIsEmpty(row []string) bool {
	for _, cell := range row {
		if clean(cell) != "" {
			return false
		}
	}
	return true
}

func rawMapEmpty(raw map[string]string) bool {
	for _, value := range raw {
		if clean(value) != "" {
			return false
		}
	}
	return true
}

func firstNonEmpty(row []string) string {
	for _, cell := range row {
		if clean(cell) != "" {
			return cell
		}
	}
	return ""
}

func rowValue(row []string, index int) string {
	if index < 0 || index >= len(row) {
		return ""
	}
	return row[index]
}

func clean(value string) string {
	return strings.TrimSpace(strings.ReplaceAll(value, "\ufeff", ""))
}

func normalizedLabel(value string) string {
	value = strings.ToLower(clean(value))
	value = strings.ReplaceAll(value, "_", " ")
	value = strings.ReplaceAll(value, "-", " ")
	value = strings.ReplaceAll(value, "%", " percent")
	var builder strings.Builder
	previousSpace := false
	for _, r := range value {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '/' {
			builder.WriteRune(r)
			previousSpace = false
			continue
		}
		if !previousSpace {
			builder.WriteRune(' ')
			previousSpace = true
		}
	}
	return strings.Join(strings.Fields(builder.String()), " ")
}

func humanKey(key string) string {
	return strings.ReplaceAll(key, "_", " ")
}

func stringValue(values map[string]any, key string) (string, bool) {
	value, ok := values[key]
	if !ok {
		return "", false
	}
	text, ok := value.(string)
	return text, ok
}

func floatValue(values map[string]any, key string) (float64, bool) {
	value, ok := values[key]
	if !ok {
		return 0, false
	}
	switch typed := value.(type) {
	case float64:
		return typed, true
	case float32:
		return float64(typed), true
	case int:
		return float64(typed), true
	case int64:
		return float64(typed), true
	case jsonNumber:
		number, err := strconv.ParseFloat(string(typed), 64)
		return number, err == nil
	default:
		return 0, false
	}
}

type jsonNumber string
