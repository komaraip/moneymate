CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  target_allocation_percent NUMERIC(8, 4),
  color_key TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('stock', 'etf', 'mutual_fund', 'gold', 'cash', 'other')),
  ticker TEXT,
  name TEXT NOT NULL,
  provider TEXT,
  currency TEXT NOT NULL DEFAULT 'IDR',
  exchange TEXT,
  country TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(type, ticker, name)
);

CREATE TABLE instrument_categories (
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (instrument_id, category_id)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID REFERENCES instruments(id),
  transaction_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'fee', 'adjustment')),
  price NUMERIC(22, 8) NOT NULL DEFAULT 0,
  units NUMERIC(22, 8) NOT NULL DEFAULT 0,
  gross_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  fees NUMERIC(22, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(22, 2) NOT NULL DEFAULT 0,
  net_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  fx_rate_to_idr NUMERIC(22, 8),
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cash_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'bank',
  currency TEXT NOT NULL DEFAULT 'IDR',
  balance NUMERIC(22, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cash_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_account_id UUID NOT NULL REFERENCES cash_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(22, 2) NOT NULL,
  balance_after NUMERIC(22, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  price_date DATE NOT NULL,
  price NUMERIC(22, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  source TEXT NOT NULL DEFAULT 'manual',
  is_realtime BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instrument_id, price_date, source)
);

CREATE TABLE holdings_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  average_price NUMERIC(22, 8) NOT NULL DEFAULT 0,
  current_price NUMERIC(22, 8) NOT NULL DEFAULT 0,
  units NUMERIC(22, 8) NOT NULL DEFAULT 0,
  total_cost NUMERIC(22, 2) NOT NULL DEFAULT 0,
  current_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  profit_loss_value NUMERIC(22, 2) NOT NULL DEFAULT 0,
  profit_loss_percent NUMERIC(12, 8) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  price_source TEXT NOT NULL DEFAULT 'manual',
  price_updated_at TIMESTAMPTZ,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date, instrument_id)
);

CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'xlsx', 'google_sheet', 'manual_seed')),
  original_filename TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  total_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  error_summary TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE import_job_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  row_number INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('valid', 'invalid', 'imported', 'skipped')),
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  normalized_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  errors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_instruments_ticker ON instruments(ticker);
CREATE INDEX idx_instruments_name ON instruments(name);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_instrument ON transactions(instrument_id);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);
CREATE INDEX idx_cash_adjustments_account ON cash_adjustments(cash_account_id, created_at DESC);
CREATE INDEX idx_holdings_snapshot_date ON holdings_snapshot(snapshot_date DESC);
CREATE INDEX idx_price_snapshots_instrument_date ON price_snapshots(instrument_id, price_date DESC);
CREATE INDEX idx_import_jobs_created_at ON import_jobs(created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
