-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inflow', 'outflow')),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plaid_items table (connected bank accounts)
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_item_id TEXT UNIQUE NOT NULL,
  plaid_access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_transaction_id TEXT UNIQUE NOT NULL,
  plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  merchant_name TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  pending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cash_snapshots table for balance tracking
CREATE TABLE IF NOT EXISTS cash_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  balance DECIMAL(12, 2) NOT NULL,
  plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(snapshot_date, plaid_item_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_item ON transactions(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_cash_snapshots_date ON cash_snapshots(snapshot_date DESC);

-- Insert default categories
INSERT INTO categories (name, type, color) VALUES
  ('Revenue', 'inflow', '#10b981'),
  ('Investment Income', 'inflow', '#34d399'),
  ('Other Income', 'inflow', '#6ee7b7'),
  ('Payroll', 'outflow', '#ef4444'),
  ('Rent', 'outflow', '#f87171'),
  ('Utilities', 'outflow', '#fca5a5'),
  ('Software & Subscriptions', 'outflow', '#f59e0b'),
  ('Marketing', 'outflow', '#fbbf24'),
  ('Professional Services', 'outflow', '#fcd34d'),
  ('Office Supplies', 'outflow', '#a78bfa'),
  ('Travel', 'outflow', '#c4b5fd'),
  ('Other Expenses', 'outflow', '#e0e7ff')
ON CONFLICT DO NOTHING;
