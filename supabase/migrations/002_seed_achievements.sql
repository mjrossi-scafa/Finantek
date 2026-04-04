-- Seed achievements catalog
INSERT INTO achievements (key, name, description, icon, category, points, condition_type, condition_value, is_secret)
VALUES
  -- TRACKING
  ('first_transaction',    'Primera Transacción',      'Registra tu primera transacción',                        '⭐', 'tracking', 10,  'transaction_count',           '{"threshold": 1}',   false),
  ('ten_transactions',     'Diez Registros',           'Registra 10 transacciones',                              '📝', 'tracking', 25,  'transaction_count',           '{"threshold": 10}',  false),
  ('fifty_transactions',   'Cincuenta Registros',      'Registra 50 transacciones',                              '📊', 'tracking', 50,  'transaction_count',           '{"threshold": 50}',  false),
  ('hundred_transactions', 'Centenario',               'Registra 100 transacciones',                             '🏆', 'tracking', 100, 'transaction_count',           '{"threshold": 100}', false),
  ('week_streak_2',        'Dos Semanas Seguidas',     'Registra transacciones 2 semanas seguidas',              '🔥', 'tracking', 30,  'consecutive_weeks',           '{"threshold": 2}',   false),
  ('week_streak_4',        'Un Mes de Hábito',         'Registra transacciones 4 semanas seguidas',              '🔥', 'tracking', 75,  'consecutive_weeks',           '{"threshold": 4}',   false),
  ('week_streak_12',       'Trimestre Impecable',      'Registra transacciones 12 semanas seguidas',             '💎', 'tracking', 200, 'consecutive_weeks',           '{"threshold": 12}',  false),

  -- SAVING
  ('first_positive_month',    'Mes en Verde',           'Termina un mes con más ingresos que gastos',            '💚', 'saving', 50,  'monthly_positive',            '{"threshold": 1}',   false),
  ('three_positive_months',   'Racha Positiva',         '3 meses consecutivos con balance positivo',             '🌿', 'saving', 100, 'consecutive_positive_months', '{"threshold": 3}',   false),
  ('saved_10_percent',        'Ahorrador Principiante', 'Ahorra al menos 10% de tus ingresos en un mes',         '🐷', 'saving', 40,  'savings_rate',                '{"threshold": 0.10}', false),
  ('saved_20_percent',        'Ahorrador Experto',      'Ahorra al menos 20% de tus ingresos en un mes',         '💪', 'saving', 80,  'savings_rate',                '{"threshold": 0.20}', false),
  ('saved_30_percent',        'Maestro del Ahorro',     'Ahorra al menos 30% de tus ingresos en un mes',         '👑', 'saving', 150, 'savings_rate',                '{"threshold": 0.30}', false),

  -- BUDGET
  ('first_budget',         'Planificador',             'Crea tu primer presupuesto',                             '📋', 'budget', 20,  'budget_count',                '{"threshold": 1}',  false),
  ('budget_respected',     'Presupuesto Respetado',    'Termina un mes sin superar ningún presupuesto',          '✅', 'budget', 60,  'all_budgets_respected',       '{"threshold": 1}',  false),
  ('budget_respected_3',   'Disciplinado',             'Respeta todos tus presupuestos 3 meses seguidos',        '🎯', 'budget', 120, 'consecutive_budget_months',   '{"threshold": 3}',  false),

  -- RECEIPT
  ('first_receipt',        'Digitalizador',            'Procesa tu primer recibo con IA',                        '📸', 'receipt', 20, 'receipt_count',               '{"threshold": 1}',  false),
  ('ten_receipts',         'Escáner Pro',              'Procesa 10 recibos con IA',                              '🤖', 'receipt', 50, 'receipt_count',               '{"threshold": 10}', false),

  -- MILESTONE
  ('million_tracked',      'Millonario',               'Registra más de $1.000.000 CLP en transacciones',        '💰', 'milestone', 75,  'total_tracked_amount',      '{"threshold": 1000000}',   false),
  ('ten_million_tracked',  'Gran Empresario',          'Registra más de $10.000.000 CLP en transacciones',       '🏦', 'milestone', 150, 'total_tracked_amount',      '{"threshold": 10000000}',  false),
  ('all_categories_used',  'Categoría Completa',       'Usa todas las categorías de gastos al menos una vez',    '🎨', 'milestone', 40,  'categories_used',           '{"threshold": 1}',         false)

ON CONFLICT (key) DO NOTHING;
