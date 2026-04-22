-- New achievements: Planificador, Insights, Telegram, Secretos, Extras
-- Add 19 new achievements covering new features and gamification improvements

-- First, drop the old CHECK constraint and add the new one with expanded categories
ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_category_check;
ALTER TABLE achievements ADD CONSTRAINT achievements_category_check
  CHECK (category IN ('tracking', 'saving', 'budget', 'receipt', 'milestone', 'planner', 'insights', 'telegram', 'secret'));

INSERT INTO achievements (key, name, description, icon, category, points, condition_type, condition_value, is_secret)
VALUES
  -- ================================================
  -- PLANIFICADOR (new category)
  -- ================================================
  ('first_planned',        'Previsor',                'Crea tu primer gasto planificado',                       '🗓️', 'planner', 20,  'planned_count',              '{"threshold": 1}',   false),
  ('five_recurring',       'Programado',              'Planifica 5 gastos recurrentes',                         '⏰', 'planner', 40,  'recurring_planned_count',    '{"threshold": 5}',   false),
  ('ten_planned_paid',     'Cumplido',                'Marca 10 gastos planificados como pagados',              '✅', 'planner', 50,  'planned_paid_count',         '{"threshold": 10}',  false),
  ('visionario',           'Visionario',              'Planifica gastos por $500.000 en un mes',                '🔮', 'planner', 60,  'planned_amount_monthly',     '{"threshold": 500000}', false),

  -- ================================================
  -- INSIGHTS (new category)
  -- ================================================
  ('first_insight',        'Analítico',               'Genera tu primer insight',                               '🧠', 'insights', 15, 'insight_count',              '{"threshold": 1}',   false),
  ('four_insights',        'Estudioso',               'Genera 4 insights (1 mes de análisis)',                  '📊', 'insights', 40, 'insight_count',              '{"threshold": 4}',   false),
  ('twelve_insights',      'Investigador',            'Genera 12 insights (3 meses de análisis)',               '🔍', 'insights', 100, 'insight_count',             '{"threshold": 12}',  false),

  -- ================================================
  -- TELEGRAM (new category)
  -- ================================================
  ('telegram_linked',      'Bot-Friendly',            'Vincula tu cuenta con el bot de Telegram',               '🤖', 'telegram', 15, 'telegram_linked',            '{"threshold": 1}',   false),
  ('fifty_telegram_tx',    'Móvil Primero',           'Registra 50 transacciones desde Telegram',               '📱', 'telegram', 60, 'telegram_transaction_count', '{"threshold": 50}',  false),
  ('five_photo_receipts',  'Foto-Fintech',            'Envía 5 recibos como foto al bot',                       '📸', 'telegram', 40, 'receipt_count',              '{"threshold": 5}',   false),

  -- ================================================
  -- SECRETOS (new category - is_secret = true)
  -- ================================================
  ('night_owl',            'Noctámbulo',              'Registra una transacción entre 2am y 5am',               '🌙', 'secret', 30,  'late_night_transaction',     '{"threshold": 1}',   true),
  ('early_samurai',        'Madrugador Samurai',      'Registra una transacción antes de las 7am',              '🌅', 'secret', 25,  'early_morning_transaction',  '{"threshold": 1}',   true),
  ('new_year_financial',   'Año Nuevo Financiero',    'Usa la app el 1 de enero',                               '🎉', 'secret', 50,  'date_jan_1',                 '{"threshold": 1}',   true),
  ('total_master',         'Maestro Total',           'Desbloquea todos los demás logros',                      '🏆', 'secret', 500, 'all_achievements_unlocked',  '{"threshold": 1}',   true),

  -- ================================================
  -- SAVING (additions)
  -- ================================================
  ('improving_month',      'Mejorando',               'Termina un mes con 20% menos gastos que el anterior',    '📈', 'saving', 60,  'month_expense_reduction',    '{"threshold": 0.20}', false),

  -- ================================================
  -- BUDGET (additions)
  -- ================================================
  ('multiple_budgets',     'Múltiples Metas',         'Mantén 5 presupuestos activos simultáneamente',          '🎯', 'budget', 40,  'active_budgets_count',       '{"threshold": 5}',   false),
  ('year_disciplined',     'Año Disciplinado',        'Respeta todos tus presupuestos 12 meses seguidos',       '💯', 'budget', 300, 'consecutive_budget_months',  '{"threshold": 12}',  false),

  -- ================================================
  -- RECEIPT (additions)
  -- ================================================
  ('twentyfive_receipts',  'Archivista',              'Procesa 25 recibos con IA',                              '📚', 'receipt', 100, 'receipt_count',             '{"threshold": 25}',  false),
  ('hundred_receipts',     'Centurión Digital',       'Procesa 100 recibos con IA',                             '💯', 'receipt', 250, 'receipt_count',             '{"threshold": 100}', false)

ON CONFLICT (key) DO NOTHING;
