-- Create trips table for travel expense tracking
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT,
  emoji TEXT DEFAULT '✈️',
  currency TEXT NOT NULL DEFAULT 'CLP',
  exchange_rate NUMERIC(12, 4) NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT trips_dates_valid CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_active ON trips(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);

-- RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one active trip per user
CREATE OR REPLACE FUNCTION ensure_single_active_trip()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE trips SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER enforce_single_active_trip
  BEFORE INSERT OR UPDATE OF is_active ON trips
  FOR EACH ROW EXECUTE FUNCTION ensure_single_active_trip();

-- Add trip-related columns to transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS original_amount NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS original_currency TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_trip_id ON transactions(trip_id);

COMMENT ON COLUMN transactions.trip_id IS 'Reference to trip when transaction occurred during travel';
COMMENT ON COLUMN transactions.original_amount IS 'Original amount in foreign currency';
COMMENT ON COLUMN transactions.original_currency IS 'ISO 4217 currency code (JPY, USD, EUR, etc.)';
