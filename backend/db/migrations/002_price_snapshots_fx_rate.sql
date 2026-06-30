ALTER TABLE price_snapshots
ADD COLUMN IF NOT EXISTS fx_rate_to_idr NUMERIC(22, 8);
