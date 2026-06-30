package domain

import "time"

type Transaction struct {
	ID               string    `json:"id"`
	InstrumentID     *string   `json:"instrument_id,omitempty"`
	InstrumentName   *string   `json:"instrument_name,omitempty"`
	InstrumentTicker *string   `json:"instrument_ticker,omitempty"`
	TransactionDate  time.Time `json:"transaction_date"`
	Type             string    `json:"type"`
	Price            float64   `json:"price"`
	Units            float64   `json:"units"`
	GrossValue       float64   `json:"gross_value"`
	Fees             float64   `json:"fees"`
	Tax              float64   `json:"tax"`
	NetValue         float64   `json:"net_value"`
	Currency         string    `json:"currency"`
	FXRateToIDR      *float64  `json:"fx_rate_to_idr,omitempty"`
	Notes            *string   `json:"notes,omitempty"`
	Source           string    `json:"source"`
	CreatedBy        *string   `json:"created_by,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	Warnings         []string  `json:"warnings,omitempty"`
}

type PriceSnapshot struct {
	ID           string    `json:"id"`
	InstrumentID string    `json:"instrument_id"`
	PriceDate    time.Time `json:"price_date"`
	Price        float64   `json:"price"`
	Currency     string    `json:"currency"`
	FXRateToIDR  *float64  `json:"fx_rate_to_idr,omitempty"`
	Source       string    `json:"source"`
	IsRealtime   bool      `json:"is_realtime"`
	CreatedAt    time.Time `json:"created_at"`
}
