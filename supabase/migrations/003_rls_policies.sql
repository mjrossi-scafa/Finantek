-- Row Level Security Policies

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own categories"
  ON categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RECEIPTS
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts"
  ON receipts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- BUDGETS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets"
  ON budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- BUDGET ALERTS
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budget alerts"
  ON budget_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ACHIEVEMENTS (read-only catalog for all authenticated users)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read achievements"
  ON achievements FOR SELECT
  USING (auth.role() = 'authenticated');

-- USER ACHIEVEMENTS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own user achievements"
  ON user_achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- WEEKLY INSIGHTS
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own insights"
  ON weekly_insights FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
