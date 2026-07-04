ALTER TABLE cash_adjustments
ADD COLUMN IF NOT EXISTS adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE cash_adjustments
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'correction';

ALTER TABLE cash_adjustments
ADD COLUMN IF NOT EXISTS balance_before NUMERIC(22, 2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cash_adjustments_type_check'
  ) THEN
    ALTER TABLE cash_adjustments
    ADD CONSTRAINT cash_adjustments_type_check
    CHECK (type IN ('deposit', 'withdrawal', 'correction', 'transfer_in', 'transfer_out'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cash_adjustments_account_date
ON cash_adjustments(cash_account_id, adjustment_date DESC, created_at DESC);
