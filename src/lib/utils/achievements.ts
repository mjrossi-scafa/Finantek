import { Achievement, UserAchievement } from '@/types/database'

export type AchievementTrigger =
  | 'transaction_created'
  | 'receipt_processed'
  | 'budget_saved'
  | 'planned_created'
  | 'planned_paid'
  | 'insight_generated'
  | 'telegram_linked'

export interface AchievementContext {
  userId: string
  // Core
  transactionCount?: number
  receiptCount?: number
  budgetCount?: number
  totalTrackedAmount?: number
  consecutiveWeeks?: number
  monthlySavingsRate?: number
  monthlyPositive?: boolean
  consecutivePositiveMonths?: number
  allBudgetsRespected?: boolean
  consecutiveBudgetMonths?: number
  allExpenseCategoriesUsed?: boolean
  // New: Planner
  plannedCount?: number
  recurringPlannedCount?: number
  plannedPaidCount?: number
  plannedAmountMonthly?: number
  // New: Insights
  insightCount?: number
  // New: Telegram
  telegramLinked?: boolean
  telegramTransactionCount?: number
  // New: Budget
  activeBudgetsCount?: number
  // New: Saving
  monthExpenseReduction?: number
  // New: Secret / time-based
  lateNightTransaction?: boolean
  earlyMorningTransaction?: boolean
  isJan1?: boolean
  allAchievementsUnlocked?: boolean
}

export function evaluateAchievements(
  achievements: Achievement[],
  unlockedKeys: Set<string>,
  ctx: AchievementContext
): Achievement[] {
  const newlyUnlocked: Achievement[] = []

  for (const achievement of achievements) {
    if (unlockedKeys.has(achievement.key)) continue

    const threshold = achievement.condition_value?.threshold ?? 0
    let unlocked = false

    switch (achievement.condition_type) {
      case 'transaction_count':
        unlocked = (ctx.transactionCount ?? 0) >= threshold
        break
      case 'receipt_count':
        unlocked = (ctx.receiptCount ?? 0) >= threshold
        break
      case 'budget_count':
        unlocked = (ctx.budgetCount ?? 0) >= threshold
        break
      case 'total_tracked_amount':
        unlocked = (ctx.totalTrackedAmount ?? 0) >= threshold
        break
      case 'consecutive_weeks':
        unlocked = (ctx.consecutiveWeeks ?? 0) >= threshold
        break
      case 'savings_rate':
        unlocked = (ctx.monthlySavingsRate ?? 0) >= threshold
        break
      case 'monthly_positive':
        unlocked = ctx.monthlyPositive === true
        break
      case 'consecutive_positive_months':
        unlocked = (ctx.consecutivePositiveMonths ?? 0) >= threshold
        break
      case 'all_budgets_respected':
        unlocked = ctx.allBudgetsRespected === true
        break
      case 'consecutive_budget_months':
        unlocked = (ctx.consecutiveBudgetMonths ?? 0) >= threshold
        break
      case 'categories_used':
        unlocked = ctx.allExpenseCategoriesUsed === true
        break

      // ==========================
      // NEW CONDITION TYPES
      // ==========================
      case 'planned_count':
        unlocked = (ctx.plannedCount ?? 0) >= threshold
        break
      case 'recurring_planned_count':
        unlocked = (ctx.recurringPlannedCount ?? 0) >= threshold
        break
      case 'planned_paid_count':
        unlocked = (ctx.plannedPaidCount ?? 0) >= threshold
        break
      case 'planned_amount_monthly':
        unlocked = (ctx.plannedAmountMonthly ?? 0) >= threshold
        break
      case 'insight_count':
        unlocked = (ctx.insightCount ?? 0) >= threshold
        break
      case 'telegram_linked':
        unlocked = ctx.telegramLinked === true
        break
      case 'telegram_transaction_count':
        unlocked = (ctx.telegramTransactionCount ?? 0) >= threshold
        break
      case 'active_budgets_count':
        unlocked = (ctx.activeBudgetsCount ?? 0) >= threshold
        break
      case 'month_expense_reduction':
        unlocked = (ctx.monthExpenseReduction ?? 0) >= threshold
        break
      case 'late_night_transaction':
        unlocked = ctx.lateNightTransaction === true
        break
      case 'early_morning_transaction':
        unlocked = ctx.earlyMorningTransaction === true
        break
      case 'date_jan_1':
        unlocked = ctx.isJan1 === true
        break
      case 'all_achievements_unlocked':
        unlocked = ctx.allAchievementsUnlocked === true
        break
    }

    if (unlocked) {
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

/**
 * Calculate progress (0-100%) for a specific achievement based on context.
 * Returns null if the achievement type doesn't have trackable progress.
 */
export function calculateProgress(
  achievement: Achievement,
  ctx: AchievementContext
): { current: number; target: number; pct: number } | null {
  const threshold = achievement.condition_value?.threshold ?? 1
  let current = 0

  switch (achievement.condition_type) {
    case 'transaction_count':
      current = ctx.transactionCount ?? 0
      break
    case 'receipt_count':
      current = ctx.receiptCount ?? 0
      break
    case 'budget_count':
      current = ctx.budgetCount ?? 0
      break
    case 'total_tracked_amount':
      current = ctx.totalTrackedAmount ?? 0
      break
    case 'consecutive_weeks':
      current = ctx.consecutiveWeeks ?? 0
      break
    case 'savings_rate':
      current = ctx.monthlySavingsRate ?? 0
      break
    case 'consecutive_positive_months':
      current = ctx.consecutivePositiveMonths ?? 0
      break
    case 'consecutive_budget_months':
      current = ctx.consecutiveBudgetMonths ?? 0
      break
    case 'planned_count':
      current = ctx.plannedCount ?? 0
      break
    case 'recurring_planned_count':
      current = ctx.recurringPlannedCount ?? 0
      break
    case 'planned_paid_count':
      current = ctx.plannedPaidCount ?? 0
      break
    case 'planned_amount_monthly':
      current = ctx.plannedAmountMonthly ?? 0
      break
    case 'insight_count':
      current = ctx.insightCount ?? 0
      break
    case 'telegram_transaction_count':
      current = ctx.telegramTransactionCount ?? 0
      break
    case 'active_budgets_count':
      current = ctx.activeBudgetsCount ?? 0
      break
    case 'month_expense_reduction':
      current = ctx.monthExpenseReduction ?? 0
      break
    // Boolean types don't have progress
    case 'monthly_positive':
    case 'all_budgets_respected':
    case 'categories_used':
    case 'telegram_linked':
    case 'late_night_transaction':
    case 'early_morning_transaction':
    case 'date_jan_1':
    case 'all_achievements_unlocked':
      return null
    default:
      return null
  }

  const pct = Math.min(Math.round((current / threshold) * 100), 100)
  return { current, target: threshold, pct }
}
