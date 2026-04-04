import { Achievement, UserAchievement } from '@/types/database'

export type AchievementTrigger =
  | 'transaction_created'
  | 'receipt_processed'
  | 'budget_saved'

interface AchievementContext {
  userId: string
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
    }

    if (unlocked) {
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}
