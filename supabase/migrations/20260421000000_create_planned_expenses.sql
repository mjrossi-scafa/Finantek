-- Create planned_expenses table for future expense planning
CREATE TABLE IF NOT EXISTS planned_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  planned_date DATE NOT NULL,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly', 'yearly')),
  is_paid BOOLEAN DEFAULT false,
  paid_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_planned_expenses_user_id ON planned_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_planned_date ON planned_expenses(planned_date);
CREATE INDEX IF NOT EXISTS idx_planned_expenses_user_date ON planned_expenses(user_id, planned_date);

-- Row Level Security
ALTER TABLE planned_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own planned expenses" ON planned_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planned expenses" ON planned_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planned expenses" ON planned_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planned expenses" ON planned_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure updated_at function exists (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_planned_expenses_updated_at
  BEFORE UPDATE ON planned_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
