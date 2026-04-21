export interface Profile {
  id: string
  email: string
  display_name: string | null
  currency: string
  theme: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  type: 'income' | 'expense'
  is_default: boolean
  sort_order: number
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string
  type: 'income' | 'expense'
  amount: number
  description: string | null
  notes: string | null
  transaction_date: string
  source: 'manual' | 'receipt' | 'pdf'
  receipt_id: string | null
  created_at: string
  updated_at: string
  // joined
  categories?: Category
}

export type RecurrenceType = 'none' | 'weekly' | 'monthly' | 'yearly'

export interface PlannedExpense {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  description: string
  planned_date: string
  recurrence: RecurrenceType
  is_paid: boolean
  paid_transaction_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  categories?: Category
}

export interface Receipt {
  id: string
  user_id: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  raw_response: unknown | null
  extracted_data: ExtractedTransaction[] | null
  error_message: string | null
  created_at: string
  processed_at: string | null
}

export interface ExtractedTransaction {
  date: string
  amount: number
  description: string
  type: 'income' | 'expense'
  suggested_category: string
  confidence: number
  // after mapping
  category_id?: string
  needs_review?: boolean
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  period_type: 'monthly' | 'annual'
  amount: number
  year: number
  month: number | null
  alert_80: boolean
  alert_100: boolean
  created_at: string
  updated_at: string
  // joined
  categories?: Category
}

export interface BudgetAlert {
  id: string
  user_id: string
  budget_id: string
  alert_type: '80_percent' | '100_percent'
  triggered_at: string
  dismissed_at: string | null
  // joined
  budgets?: Budget & { categories?: Category }
  current_amount?: number
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: 'tracking' | 'saving' | 'budget' | 'receipt' | 'milestone'
  points: number
  condition_type: string
  condition_value: { threshold: number }
  is_secret: boolean
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  progress: number
  notified: boolean
  // joined
  achievements?: Achievement
}

export interface WeeklyInsight {
  id: string
  user_id: string
  week_start: string
  week_end: string
  insight_text: string
  spending_data: unknown | null
  generated_at: string
}

// Analytics types
export interface MonthlySummary {
  type: 'income' | 'expense'
  total: number
}

export interface CategorySpending {
  category_id: string
  category_name: string
  total: number
  color: string
  icon: string
}

export interface MonthlyTrend {
  year: number
  month: number
  income: number
  expense: number
}

export interface WeeklyComparison {
  category_id: string
  category_name: string
  color: string
  icon: string
  this_week: number
  last_week: number
}
