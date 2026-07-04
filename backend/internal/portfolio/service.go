package portfolio

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type CalculatorTransaction struct {
	InstrumentID string
	Date         time.Time
	Type         string
	Price        float64
	Units        float64
	NetValue     float64
	Currency     string
	FXRateToIDR  *float64
}

type CalculatorPrice struct {
	InstrumentID string
	Price        float64
	Currency     string
	FXRateToIDR  *float64
	Source       string
	CreatedAt    time.Time
}

type CalculatedHolding struct {
	InstrumentID      string
	AveragePrice      float64
	CurrentPrice      float64
	Units             float64
	TotalCost         float64
	CurrentValue      float64
	ProfitLossValue   float64
	ProfitLossPercent float64
	Currency          string
	PriceSource       string
	PriceUpdatedAt    *time.Time
	Warnings          []string
}

type store interface {
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
}

type Service struct {
	db store
}

func NewService(db store) Service {
	return Service{db: db}
}

func (s Service) Recalculate(ctx context.Context, userID string, snapshotDate time.Time) ([]CalculatedHolding, error) {
	transactions, err := s.loadTransactions(ctx, userID)
	if err != nil {
		return nil, err
	}
	prices, err := s.loadLatestPrices(ctx, userID)
	if err != nil {
		return nil, err
	}

	holdings := CalculateHoldings(transactions, prices)

	for _, holding := range holdings {
		warningsJSON, err := json.Marshal(holding.Warnings)
		if err != nil {
			return nil, fmt.Errorf("encode holding warnings: %w", err)
		}

		if _, err := s.db.Exec(ctx, `
			INSERT INTO holdings_snapshot (
				user_id, snapshot_date, instrument_id, average_price, current_price, units,
				total_cost, current_value, profit_loss_value, profit_loss_percent,
				currency, price_source, price_updated_at, warnings
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'IDR', $11, $12, $13::jsonb)
			ON CONFLICT (user_id, snapshot_date, instrument_id) DO UPDATE
			SET average_price = EXCLUDED.average_price,
			    current_price = EXCLUDED.current_price,
			    units = EXCLUDED.units,
			    total_cost = EXCLUDED.total_cost,
			    current_value = EXCLUDED.current_value,
			    profit_loss_value = EXCLUDED.profit_loss_value,
			    profit_loss_percent = EXCLUDED.profit_loss_percent,
			    currency = EXCLUDED.currency,
			    price_source = EXCLUDED.price_source,
			    price_updated_at = EXCLUDED.price_updated_at,
			    warnings = EXCLUDED.warnings
		`, userID, snapshotDate.Format("2006-01-02"), holding.InstrumentID, holding.AveragePrice, holding.CurrentPrice, holding.Units,
			holding.TotalCost, holding.CurrentValue, holding.ProfitLossValue, holding.ProfitLossPercent,
			holding.PriceSource, holding.PriceUpdatedAt, string(warningsJSON)); err != nil {
			return nil, fmt.Errorf("persist holding %s: %w", holding.InstrumentID, err)
		}
	}

	return holdings, nil
}

func CalculateHoldings(transactions []CalculatorTransaction, prices map[string]CalculatorPrice) []CalculatedHolding {
	sort.Slice(transactions, func(i, j int) bool {
		return transactions[i].Date.Before(transactions[j].Date)
	})

	type state struct {
		units         float64
		totalCostIDR  float64
		latestFXToIDR *float64
	}

	states := map[string]*state{}
	for _, tx := range transactions {
		current := states[tx.InstrumentID]
		if current == nil {
			current = &state{}
			states[tx.InstrumentID] = current
		}

		if tx.FXRateToIDR != nil {
			fx := *tx.FXRateToIDR
			current.latestFXToIDR = &fx
		}

		costIDR := valueToIDR(tx.NetValue, tx.Currency, tx.FXRateToIDR)
		switch tx.Type {
		case "buy":
			current.units += tx.Units
			current.totalCostIDR += costIDR
		case "sell":
			if current.units > 0 {
				averageCost := current.totalCostIDR / current.units
				current.units -= tx.Units
				current.totalCostIDR -= averageCost * tx.Units
				if current.units < 0 {
					current.units = 0
					current.totalCostIDR = 0
				}
			}
		case "adjustment":
			current.units += tx.Units
			current.totalCostIDR += costIDR
		}
	}

	result := make([]CalculatedHolding, 0, len(states))
	for instrumentID, current := range states {
		if almostZero(current.units) {
			continue
		}

		price, hasPrice := prices[instrumentID]
		warnings := []string{}
		currentPriceIDR := 0.0
		priceSource := "manual"
		var priceUpdatedAt *time.Time
		if hasPrice {
			priceSource = price.Source
			createdAt := price.CreatedAt
			priceUpdatedAt = &createdAt
			if price.Currency != "IDR" {
				fxRate := current.latestFXToIDR
				if price.FXRateToIDR != nil {
					fxRate = price.FXRateToIDR
				}
				if fxRate == nil {
					warnings = append(warnings, "FX rate belum diisi")
					currentPriceIDR = price.Price
				} else {
					currentPriceIDR = price.Price * *fxRate
				}
			} else {
				currentPriceIDR = price.Price
			}
			if time.Since(price.CreatedAt) > 7*24*time.Hour {
				warnings = append(warnings, "Harga terakhir lebih dari 7 hari")
			}
		} else {
			warnings = append(warnings, "Harga manual belum diisi")
		}

		currentValue := currentPriceIDR * current.units
		profitLoss := currentValue - current.totalCostIDR
		profitLossPercent := 0.0
		if current.totalCostIDR > 0 {
			profitLossPercent = profitLoss / current.totalCostIDR
		}

		result = append(result, CalculatedHolding{
			InstrumentID:      instrumentID,
			AveragePrice:      round(current.totalCostIDR / current.units),
			CurrentPrice:      round(currentPriceIDR),
			Units:             round(current.units),
			TotalCost:         round(current.totalCostIDR),
			CurrentValue:      round(currentValue),
			ProfitLossValue:   round(profitLoss),
			ProfitLossPercent: profitLossPercent,
			Currency:          "IDR",
			PriceSource:       priceSource,
			PriceUpdatedAt:    priceUpdatedAt,
			Warnings:          warnings,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].CurrentValue > result[j].CurrentValue
	})

	return result
}

func (s Service) loadTransactions(ctx context.Context, userID string) ([]CalculatorTransaction, error) {
	rows, err := s.db.Query(ctx, `
		SELECT instrument_id::text, transaction_date, type, price::float8, units::float8,
		       net_value::float8, currency, fx_rate_to_idr::float8
		FROM transactions
		WHERE user_id = $1
		  AND instrument_id IS NOT NULL
		ORDER BY transaction_date ASC, created_at ASC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("load transactions: %w", err)
	}
	defer rows.Close()

	items := []CalculatorTransaction{}
	for rows.Next() {
		var item CalculatorTransaction
		if err := rows.Scan(&item.InstrumentID, &item.Date, &item.Type, &item.Price, &item.Units, &item.NetValue, &item.Currency, &item.FXRateToIDR); err != nil {
			return nil, fmt.Errorf("scan transaction: %w", err)
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (s Service) loadLatestPrices(ctx context.Context, userID string) (map[string]CalculatorPrice, error) {
	rows, err := s.db.Query(ctx, `
		SELECT DISTINCT ON (instrument_id)
		       instrument_id::text, price::float8, currency, fx_rate_to_idr::float8, source, created_at
		FROM price_snapshots
		WHERE user_id = $1
		ORDER BY instrument_id, price_date DESC, created_at DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("load latest prices: %w", err)
	}
	defer rows.Close()

	items := map[string]CalculatorPrice{}
	for rows.Next() {
		var item CalculatorPrice
		if err := rows.Scan(&item.InstrumentID, &item.Price, &item.Currency, &item.FXRateToIDR, &item.Source, &item.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan price: %w", err)
		}
		items[item.InstrumentID] = item
	}

	return items, rows.Err()
}

func valueToIDR(value float64, currency string, fx *float64) float64 {
	if currency == "IDR" || fx == nil {
		return value
	}
	return value * *fx
}

func almostZero(value float64) bool {
	return math.Abs(value) < 0.00000001
}

func round(value float64) float64 {
	return math.Round(value*100000000) / 100000000
}
