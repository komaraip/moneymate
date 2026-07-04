package domain

import "time"

type AssetCategory struct {
	ID                      string    `json:"id"`
	Name                    string    `json:"name"`
	Description             *string   `json:"description,omitempty"`
	TargetAllocationPercent *float64  `json:"target_allocation_percent,omitempty"`
	ColorKey                *string   `json:"color_key,omitempty"`
	SortOrder               int       `json:"sort_order"`
	CreatedAt               time.Time `json:"created_at"`
}

type Instrument struct {
	ID            string    `json:"id"`
	Type          string    `json:"type"`
	Ticker        *string   `json:"ticker,omitempty"`
	Name          string    `json:"name"`
	Provider      *string   `json:"provider,omitempty"`
	Currency      string    `json:"currency"`
	Exchange      *string   `json:"exchange,omitempty"`
	Country       *string   `json:"country,omitempty"`
	CategoryIDs   []string  `json:"category_ids,omitempty"`
	CategoryNames []string  `json:"category_names,omitempty"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CashAccount struct {
	ID          string    `json:"id"`
	AccountName string    `json:"account_name"`
	AccountType string    `json:"account_type"`
	Currency    string    `json:"currency"`
	Balance     float64   `json:"balance"`
	Notes       *string   `json:"notes,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type TransactionCategory struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	ColorKey  *string   `json:"color_key,omitempty"`
	SortOrder int       `json:"sort_order"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CashAdjustment struct {
	ID             string    `json:"id"`
	CashAccountID  string    `json:"cash_account_id"`
	AdjustmentDate time.Time `json:"adjustment_date"`
	Type           string    `json:"type"`
	Amount         float64   `json:"amount"`
	BalanceBefore  float64   `json:"balance_before"`
	BalanceAfter   float64   `json:"balance_after"`
	Currency       string    `json:"currency"`
	Note           *string   `json:"note,omitempty"`
	CreatedBy      *string   `json:"created_by,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type AuditLog struct {
	ID          string    `json:"id"`
	ActorUserID *string   `json:"actor_user_id,omitempty"`
	Action      string    `json:"action"`
	EntityType  string    `json:"entity_type"`
	EntityID    *string   `json:"entity_id,omitempty"`
	BeforeJSON  any       `json:"before_json,omitempty"`
	AfterJSON   any       `json:"after_json,omitempty"`
	IPAddress   *string   `json:"ip_address,omitempty"`
	UserAgent   *string   `json:"user_agent,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
