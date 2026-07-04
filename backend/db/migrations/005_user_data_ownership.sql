ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

UPDATE transactions
SET user_id = COALESCE(created_by, (SELECT id FROM users ORDER BY created_at, id LIMIT 1))
WHERE user_id IS NULL;

ALTER TABLE transactions
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE cash_accounts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

UPDATE cash_accounts
SET user_id = (SELECT id FROM users ORDER BY created_at, id LIMIT 1)
WHERE user_id IS NULL;

ALTER TABLE cash_accounts
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE cash_adjustments
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

UPDATE cash_adjustments ca
SET user_id = COALESCE(ca.created_by, c.user_id)
FROM cash_accounts c
WHERE ca.cash_account_id = c.id
  AND ca.user_id IS NULL;

ALTER TABLE cash_adjustments
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE price_snapshots
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

UPDATE price_snapshots ps
SET user_id = COALESCE(
  (
    SELECT t.user_id
    FROM transactions t
    WHERE t.instrument_id = ps.instrument_id
    ORDER BY t.created_at
    LIMIT 1
  ),
  (SELECT id FROM users ORDER BY created_at, id LIMIT 1)
)
WHERE ps.user_id IS NULL;

ALTER TABLE price_snapshots
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE holdings_snapshot
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

UPDATE holdings_snapshot hs
SET user_id = COALESCE(
  (
    SELECT t.user_id
    FROM transactions t
    WHERE t.instrument_id = hs.instrument_id
    ORDER BY t.created_at
    LIMIT 1
  ),
  (SELECT id FROM users ORDER BY created_at, id LIMIT 1)
)
WHERE hs.user_id IS NULL;

ALTER TABLE holdings_snapshot
  ALTER COLUMN user_id SET NOT NULL;

UPDATE transactions
SET created_by = user_id
WHERE created_by IS NULL;

UPDATE cash_adjustments
SET created_by = user_id
WHERE created_by IS NULL;

UPDATE import_jobs
SET created_by = (SELECT id FROM users ORDER BY created_at, id LIMIT 1)
WHERE created_by IS NULL;

ALTER TABLE import_jobs
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE transactions
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE cash_adjustments
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE price_snapshots
  DROP CONSTRAINT IF EXISTS price_snapshots_instrument_id_price_date_source_key;

ALTER TABLE price_snapshots
  ADD CONSTRAINT price_snapshots_user_instrument_date_source_key
  UNIQUE (user_id, instrument_id, price_date, source);

ALTER TABLE holdings_snapshot
  DROP CONSTRAINT IF EXISTS holdings_snapshot_snapshot_date_instrument_id_key;

ALTER TABLE holdings_snapshot
  ADD CONSTRAINT holdings_snapshot_user_date_instrument_key
  UNIQUE (user_id, snapshot_date, instrument_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
ON transactions(user_id, transaction_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cash_accounts_user_active
ON cash_accounts(user_id, is_active, account_name);

CREATE INDEX IF NOT EXISTS idx_cash_adjustments_user_account_date
ON cash_adjustments(user_id, cash_account_id, adjustment_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_snapshots_user_instrument_date
ON price_snapshots(user_id, instrument_id, price_date DESC);

CREATE INDEX IF NOT EXISTS idx_holdings_snapshot_user_date
ON holdings_snapshot(user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_import_jobs_created_by_created_at
ON import_jobs(created_by, created_at DESC);
