package portfolio

import (
	"math"
	"testing"
	"time"
)

func TestCalculateHoldingsWeightedAverageBBRI(t *testing.T) {
	id := "bbri"
	transactions := []CalculatorTransaction{
		{InstrumentID: id, Date: mustDate("2026-04-02"), Type: "buy", Units: 600, NetValue: 2004000, Currency: "IDR"},
		{InstrumentID: id, Date: mustDate("2026-04-13"), Type: "buy", Units: 400, NetValue: 1356000, Currency: "IDR"},
		{InstrumentID: id, Date: mustDate("2026-05-07"), Type: "buy", Units: 200, NetValue: 652000, Currency: "IDR"},
	}
	prices := map[string]CalculatorPrice{
		id: {InstrumentID: id, Price: 2730, Currency: "IDR", Source: "manual", CreatedAt: time.Now()},
	}

	holdings := CalculateHoldings(transactions, prices)
	if len(holdings) != 1 {
		t.Fatalf("expected 1 holding, got %d", len(holdings))
	}

	holding := holdings[0]
	assertClose(t, 1200, holding.Units)
	assertClose(t, 4012000, holding.TotalCost)
	assertClose(t, 3343.33333333, holding.AveragePrice)
	assertClose(t, 3276000, holding.CurrentValue)
	assertClose(t, -736000, holding.ProfitLossValue)
}

func TestCalculateHoldingsSPYUSDConversion(t *testing.T) {
	id := "spy"
	fx := 18000.0
	transactions := []CalculatorTransaction{
		{InstrumentID: id, Date: mustDate("2026-06-10"), Type: "buy", Units: 0.1, NetValue: 70, Currency: "USD", FXRateToIDR: &fx},
	}
	prices := map[string]CalculatorPrice{
		id: {InstrumentID: id, Price: 735, Currency: "USD", Source: "manual", CreatedAt: time.Now()},
	}

	holdings := CalculateHoldings(transactions, prices)
	if len(holdings) != 1 {
		t.Fatalf("expected 1 holding, got %d", len(holdings))
	}

	holding := holdings[0]
	assertClose(t, 1260000, holding.TotalCost)
	assertClose(t, 13230000, holding.CurrentPrice)
	assertClose(t, 1323000, holding.CurrentValue)
	assertClose(t, 63000, holding.ProfitLossValue)
}

func mustDate(value string) time.Time {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		panic(err)
	}
	return parsed
}

func assertClose(t *testing.T, expected float64, actual float64) {
	t.Helper()
	if math.Abs(expected-actual) > 0.01 {
		t.Fatalf("expected %f, got %f", expected, actual)
	}
}
