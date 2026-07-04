CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(22, 2) NOT NULL,
  current_amount NUMERIC(22, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (target_amount > 0),
  CHECK (current_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_active_target
ON savings_goals(user_id, is_active, target_date NULLS LAST, created_at DESC);
