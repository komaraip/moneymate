CREATE TABLE IF NOT EXISTS transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color_key TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_categories_user_type_name
ON transaction_categories(user_id, type, lower(name));

CREATE INDEX IF NOT EXISTS idx_transaction_categories_user_active
ON transaction_categories(user_id, type, is_active, sort_order, name);

INSERT INTO transaction_categories (user_id, name, type, color_key, sort_order)
SELECT users.id, seed.name, seed.type, seed.color_key, seed.sort_order
FROM users
CROSS JOIN (
  VALUES
    ('Gaji', 'income', 'emerald', 10),
    ('Bonus', 'income', 'teal', 20),
    ('Bunga/Dividen', 'income', 'cyan', 30),
    ('Makan & Minum', 'expense', 'orange', 10),
    ('Transportasi', 'expense', 'blue', 20),
    ('Tagihan', 'expense', 'rose', 30),
    ('Belanja', 'expense', 'violet', 40),
    ('Kesehatan', 'expense', 'red', 50)
) AS seed(name, type, color_key, sort_order)
ON CONFLICT DO NOTHING;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS cash_account_id UUID REFERENCES cash_accounts(id);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS transfer_cash_account_id UUID REFERENCES cash_accounts(id);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES transaction_categories(id);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS amount NUMERIC(22, 2);

UPDATE transactions
SET amount = ABS(net_value)
WHERE amount IS NULL;

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('buy', 'sell', 'dividend', 'fee', 'adjustment', 'income', 'expense', 'transfer'));

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_personal_amount_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_personal_amount_check
  CHECK (type NOT IN ('income', 'expense', 'transfer') OR (amount IS NOT NULL AND amount > 0));

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_personal_account_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_personal_account_check
  CHECK (type NOT IN ('income', 'expense', 'transfer') OR cash_account_id IS NOT NULL);

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_personal_category_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_personal_category_check
  CHECK (type NOT IN ('income', 'expense') OR category_id IS NOT NULL);

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_transfer_account_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_transfer_account_check
  CHECK (type <> 'transfer' OR (transfer_cash_account_id IS NOT NULL AND transfer_cash_account_id <> cash_account_id));

ALTER TABLE cash_adjustments
  ADD COLUMN IF NOT EXISTS related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date
ON transactions(user_id, type, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date
ON transactions(user_id, category_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_cash_account_date
ON transactions(user_id, cash_account_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_cash_adjustments_related_transaction
ON cash_adjustments(related_transaction_id);
