package importer

import (
	"math"
	"strings"
	"testing"
)

func TestParseCSVSampleLayoutWithInvesmentTypo(t *testing.T) {
	source := `INVESMENT
Instrument,Ticker,Name,Average Price,Current Price,Units,Total Cost,Current Value,Profit/Loss Value,Profit/Loss Percent,Currency
Saham,BBRI,Bank Rakyat Indonesia,3343.33,2730,1700,5412000,4641000,-771000,-0.1425,IDR
ORDERS
Date,Instrument,Ticker,Type,Price,Units,Total Value,Currency
2026-06-10,ETF,SPY,Buy,733.33,0.075204887,989198.6274,USD
Asset,Value
ETF,1503099.868
Total Net Worth,13648703.72
CASH
Account,Balance,Currency
Seabank,151859,IDR
`

	preview, err := Parse(strings.NewReader(source), "assets.csv")
	if err != nil {
		t.Fatalf("parse csv: %v", err)
	}

	assertSectionDetected(t, preview, SectionHoldings)
	assertSectionDetected(t, preview, SectionOrders)
	assertSectionDetected(t, preview, SectionAssetSummary)
	assertSectionDetected(t, preview, SectionCash)

	if preview.Summary.TotalRows != 5 {
		t.Fatalf("expected 5 preview rows, got %d", preview.Summary.TotalRows)
	}
	if preview.Summary.InvalidRows != 0 {
		t.Fatalf("expected no invalid rows, got %d", preview.Summary.InvalidRows)
	}

	holding := findRow(t, preview, SectionHoldings)
	if holding.Normalized["ticker"] != "BBRI" {
		t.Fatalf("expected BBRI ticker, got %v", holding.Normalized["ticker"])
	}
	if holding.Normalized["instrument_type"] != "stock" {
		t.Fatalf("expected stock instrument type, got %v", holding.Normalized["instrument_type"])
	}

	order := findRow(t, preview, SectionOrders)
	assertFloat(t, 55.15841733571, order.Normalized["net_value"])
	assertFloat(t, 989198.6274, order.Normalized["total_value_idr"])
	assertFloat(t, 17936.5119, order.Normalized["fx_rate_to_idr"])
}

func TestParseCSVInvalidRowsReturnRowErrors(t *testing.T) {
	source := `ORDERS
Date,Instrument,Ticker,Type,Price,Units,Total Value,Currency
,ETF,SPY,Buy,733.33,0.075204887,989198.6274,USD
CASH
Account,Balance,Currency
,151859,IDR
`

	preview, err := Parse(strings.NewReader(source), "assets.csv")
	if err != nil {
		t.Fatalf("parse csv: %v", err)
	}
	if preview.Summary.ValidRows != 0 {
		t.Fatalf("expected no valid rows, got %d", preview.Summary.ValidRows)
	}
	if preview.Summary.InvalidRows != 2 {
		t.Fatalf("expected 2 invalid rows, got %d", preview.Summary.InvalidRows)
	}
	for _, row := range preview.Rows {
		if row.Status != RowStatusInvalid {
			t.Fatalf("expected invalid status, got %s", row.Status)
		}
		if len(row.Errors) == 0 {
			t.Fatalf("expected row errors")
		}
	}
}

func assertSectionDetected(t *testing.T, preview Preview, section Section) {
	t.Helper()
	for _, item := range preview.DetectedSections {
		if item == section {
			return
		}
	}
	t.Fatalf("expected detected section %s, got %v", section, preview.DetectedSections)
}

func findRow(t *testing.T, preview Preview, section Section) PreviewRow {
	t.Helper()
	for _, row := range preview.Rows {
		if row.Section == section {
			return row
		}
	}
	t.Fatalf("expected row for section %s", section)
	return PreviewRow{}
}

func assertFloat(t *testing.T, expected float64, actual any) {
	t.Helper()
	value, ok := actual.(float64)
	if !ok {
		t.Fatalf("expected float64, got %T", actual)
	}
	if math.Abs(expected-value) > 0.01 {
		t.Fatalf("expected %.8f, got %.8f", expected, value)
	}
}
