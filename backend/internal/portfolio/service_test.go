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

func TestCalculateHoldingsSeedNetWorthMatchesSpreadsheetSummary(t *testing.T) {
	now := time.Now()
	spyCurrentFX := 18140.32482170762
	spyBuyFX1 := 17933.4939
	spyBuyFX2 := 17935.0305
	transactions := []CalculatorTransaction{
		{InstrumentID: "bbri", Date: mustDate("2026-04-02"), Type: "buy", Units: 600, NetValue: 2004000, Currency: "IDR"},
		{InstrumentID: "bbri", Date: mustDate("2026-04-13"), Type: "buy", Units: 400, NetValue: 1356000, Currency: "IDR"},
		{InstrumentID: "bbri", Date: mustDate("2026-05-07"), Type: "buy", Units: 200, NetValue: 652000, Currency: "IDR"},
		{InstrumentID: "spy", Date: mustDate("2026-06-10"), Type: "buy", Units: 0.075204887, NetValue: 55.15841734, Currency: "USD", FXRateToIDR: &spyBuyFX1},
		{InstrumentID: "gold", Date: mustDate("2026-06-10"), Type: "buy", Units: 0.382, NetValue: 995874, Currency: "IDR"},
		{InstrumentID: "bbri", Date: mustDate("2026-06-10"), Type: "buy", Units: 300, NetValue: 864000, Currency: "IDR"},
		{InstrumentID: "rd", Date: mustDate("2026-06-12"), Type: "buy", Units: 3424.1605, NetValue: 4954999.935, Currency: "IDR"},
		{InstrumentID: "spy", Date: mustDate("2026-06-25"), Type: "buy", Units: 0.037418923, NetValue: 27.53213609, Currency: "USD", FXRateToIDR: &spyBuyFX2},
		{InstrumentID: "gold", Date: mustDate("2026-06-25"), Type: "buy", Units: 0.2964, NetValue: 750188.4, Currency: "IDR"},
		{InstrumentID: "bbri", Date: mustDate("2026-06-26"), Type: "buy", Units: 200, NetValue: 572000, Currency: "IDR"},
		{InstrumentID: "rd", Date: mustDate("2026-06-29"), Type: "buy", Units: 516.7994, NetValue: 749999.9613, Currency: "IDR"},
	}
	prices := map[string]CalculatorPrice{
		"gold": {InstrumentID: "gold", Price: 2397000, Currency: "IDR", Source: "manual", CreatedAt: now},
		"rd":   {InstrumentID: "rd", Price: 1452.08, Currency: "IDR", Source: "manual", CreatedAt: now},
		"bbri": {InstrumentID: "bbri", Price: 2730, Currency: "IDR", Source: "manual", CreatedAt: now},
		"spy":  {InstrumentID: "spy", Price: 735.72, Currency: "USD", FXRateToIDR: &spyCurrentFX, Source: "manual", CreatedAt: now},
	}

	holdings := CalculateHoldings(transactions, prices)
	portfolioValue := 0.0
	for _, holding := range holdings {
		portfolioValue += holding.CurrentValue
	}
	netWorth := portfolioValue + 155890

	assertClose(t, 13648703.72, math.Round(netWorth*100)/100)
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
