package domain

import "time"

type HoldingSnapshot struct {
	ID                string     `json:"id"`
	SnapshotDate      time.Time  `json:"snapshot_date"`
	InstrumentID      string     `json:"instrument_id"`
	InstrumentType    string     `json:"instrument_type"`
	Ticker            *string    `json:"ticker,omitempty"`
	Name              string     `json:"name"`
	AveragePrice      float64    `json:"average_price"`
	CurrentPrice      float64    `json:"current_price"`
	Units             float64    `json:"units"`
	TotalCost         float64    `json:"total_cost"`
	CurrentValue      float64    `json:"current_value"`
	ProfitLossValue   float64    `json:"profit_loss_value"`
	ProfitLossPercent float64    `json:"profit_loss_percent"`
	Currency          string     `json:"currency"`
	PriceSource       string     `json:"price_source"`
	PriceUpdatedAt    *time.Time `json:"price_updated_at,omitempty"`
	Warnings          []string   `json:"warnings,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
}
