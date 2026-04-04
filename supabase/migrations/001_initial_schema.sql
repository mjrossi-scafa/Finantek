-- Personal Finance App - Initial Schema

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  display_name text,
  currency    text NOT NULL DEFAULT 'CLP',
  theme       text NOT NULL DEFAULT 'system',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text,
  color       text,
  type        text NOT NULL CHECK (type IN ('income', 'expense')),
  is_default  boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- RECEIPTS (defined before transactions due to FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS receipts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path       text NOT NULL,
  file_name       text NOT NULL,
  file_type       text NOT NULL,
  file_size       integer,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  raw_response    jsonb,
  extracted_data  jsonb,
  error_message   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id      uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type             text NOT NULL CHECK (type IN ('income', 'expense')),
  amount           bigint NOT NULL CHECK (amount > 0),
  description      text,
  notes            text,
  transaction_date date NOT NULL,
  source           text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'receipt', 'pdf')),
  receipt_id       uuid REFERENCES receipts(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  period_type  text NOT NULL CHECK (period_type IN ('monthly', 'annual')),
  amount       bigint NOT NULL CHECK (amount > 0),
  year         integer NOT NULL,
  month        integer CHECK (month BETWEEN 1 AND 12),
  alert_80     boolean NOT NULL DEFAULT true,
  alert_100    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, period_type, year, month)
);

-- ============================================================
-- BUDGET ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS budget_alerts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id    uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  alert_type   text NOT NULL CHECK (alert_type IN ('80_percent', '100_percent')),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz
);

-- ============================================================
-- ACHIEVEMENTS (static catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key              text UNIQUE NOT NULL,
  name             text NOT NULL,
  description      text NOT NULL,
  icon             text NOT NULL,
  category         text NOT NULL CHECK (category IN ('tracking', 'saving', 'budget', 'receipt', 'milestone')),
  points           integer NOT NULL DEFAULT 10,
  condition_type   text NOT NULL,
  condition_value  jsonb NOT NULL,
  is_secret        boolean NOT NULL DEFAULT false
);

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    timestamptz NOT NULL DEFAULT now(),
  progress       integer NOT NULL DEFAULT 0,
  notified       boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, achievement_id)
);

-- ============================================================
-- WEEKLY INSIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_insights (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start    date NOT NULL,
  week_end      date NOT NULL,
  insight_text  text NOT NULL,
  spending_data jsonb,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets (user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user ON budget_alerts (user_id, dismissed_at);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user ON weekly_insights (user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements (user_id);

-- ============================================================
-- TRIGGER: auto-create profile + seed categories on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
  VALUES
    (NEW.id, 'Alimentación',    '🍔', '#ef4444', 'expense', true,  1),
    (NEW.id, 'Transporte',      '🚌', '#f97316', 'expense', true,  2),
    (NEW.id, 'Entretenimiento', '🎬', '#a855f7', 'expense', true,  3),
    (NEW.id, 'Salud',           '💊', '#22c55e', 'expense', true,  4),
    (NEW.id, 'Educación',       '📚', '#3b82f6', 'expense', true,  5),
    (NEW.id, 'Hogar',           '🏠', '#84cc16', 'expense', true,  6),
    (NEW.id, 'Ropa',            '👔', '#ec4899', 'expense', true,  7),
    (NEW.id, 'Otros Gastos',    '📦', '#6b7280', 'expense', true,  8),
    (NEW.id, 'Sueldo',          '💼', '#10b981', 'income',  true,  9),
    (NEW.id, 'Freelance',       '💻', '#06b6d4', 'income',  true, 10),
    (NEW.id, 'Inversiones',     '📈', '#f59e0b', 'income',  true, 11),
    (NEW.id, 'Otros Ingresos',  '💰', '#8b5cf6', 'income',  true, 12);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SUPABASE RPC FUNCTIONS FOR ANALYTICS
-- ============================================================

-- Monthly summary: totals by type
CREATE OR REPLACE FUNCTION get_monthly_summary(p_year int, p_month int)
RETURNS TABLE(type text, total bigint) AS $$
  SELECT t.type, SUM(t.amount) as total
  FROM transactions t
  WHERE t.user_id = auth.uid()
    AND EXTRACT(YEAR FROM t.transaction_date) = p_year
    AND EXTRACT(MONTH FROM t.transaction_date) = p_month
  GROUP BY t.type;
$$ LANGUAGE sql SECURITY INVOKER STABLE;

-- Category breakdown for expenses
CREATE OR REPLACE FUNCTION get_spending_by_category(p_year int, p_month int)
RETURNS TABLE(category_id uuid, category_name text, total bigint, color text, icon text) AS $$
  SELECT t.category_id, c.name, SUM(t.amount) as total, c.color, c.icon
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
  WHERE t.user_id = auth.uid()
    AND t.type = 'expense'
    AND EXTRACT(YEAR FROM t.transaction_date) = p_year
    AND EXTRACT(MONTH FROM t.transaction_date) = p_month
  GROUP BY t.category_id, c.name, c.color, c.icon
  ORDER BY SUM(t.amount) DESC;
$$ LANGUAGE sql SECURITY INVOKER STABLE;

-- Monthly trends: last N months
CREATE OR REPLACE FUNCTION get_monthly_trends(p_months int DEFAULT 12)
RETURNS TABLE(year int, month int, income bigint, expense bigint) AS $$
  SELECT
    EXTRACT(YEAR FROM t.transaction_date)::int as year,
    EXTRACT(MONTH FROM t.transaction_date)::int as month,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense
  FROM transactions t
  WHERE t.user_id = auth.uid()
    AND t.transaction_date >= (CURRENT_DATE - (p_months || ' months')::interval)
  GROUP BY year, month
  ORDER BY year ASC, month ASC;
$$ LANGUAGE sql SECURITY INVOKER STABLE;

-- Weekly comparison: this week vs last week by category
CREATE OR REPLACE FUNCTION get_weekly_comparison()
RETURNS TABLE(
  category_id uuid,
  category_name text,
  color text,
  icon text,
  this_week bigint,
  last_week bigint
) AS $$
  WITH this_week AS (
    SELECT t.category_id, SUM(t.amount) as total
    FROM transactions t
    WHERE t.user_id = auth.uid()
      AND t.type = 'expense'
      AND t.transaction_date >= date_trunc('week', CURRENT_DATE)
      AND t.transaction_date < date_trunc('week', CURRENT_DATE) + interval '7 days'
    GROUP BY t.category_id
  ),
  last_week AS (
    SELECT t.category_id, SUM(t.amount) as total
    FROM transactions t
    WHERE t.user_id = auth.uid()
      AND t.type = 'expense'
      AND t.transaction_date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
      AND t.transaction_date < date_trunc('week', CURRENT_DATE)
    GROUP BY t.category_id
  )
  SELECT
    c.id as category_id,
    c.name as category_name,
    c.color,
    c.icon,
    COALESCE(tw.total, 0) as this_week,
    COALESCE(lw.total, 0) as last_week
  FROM categories c
  LEFT JOIN this_week tw ON tw.category_id = c.id
  LEFT JOIN last_week lw ON lw.category_id = c.id
  WHERE c.user_id = auth.uid()
    AND c.type = 'expense'
    AND (tw.total IS NOT NULL OR lw.total IS NOT NULL)
  ORDER BY (COALESCE(tw.total, 0) + COALESCE(lw.total, 0)) DESC;
$$ LANGUAGE sql SECURITY INVOKER STABLE;
