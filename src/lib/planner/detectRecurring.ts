import { Transaction, PlannedExpense } from '@/types/database'

export interface RecurringSuggestion {
  description: string
  amount: number
  dayOfMonth: number
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  occurrences: number
  lastSeen: string
  sampleTransactionIds: string[]
}

/**
 * Detect recurring expenses from transaction history.
 * Rules (STRICT):
 * - Same description (normalized) + same amount (±10%) + same day of month (±2 days)
 * - At least 2 occurrences in different months
 * - Not already planned
 */
export function detectRecurringExpenses(
  transactions: Transaction[],
  existingPlanned: PlannedExpense[]
): RecurringSuggestion[] {
  // Only consider expenses
  const expenses = transactions.filter((t) => t.type === 'expense')

  // Normalize description for grouping
  const normalize = (s: string | null) =>
    (s || '').toLowerCase().trim().replace(/\s+/g, ' ')

  // Group by normalized description
  const groups = new Map<string, Transaction[]>()
  for (const tx of expenses) {
    const key = normalize(tx.description)
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  const suggestions: RecurringSuggestion[] = []

  for (const [key, txs] of groups.entries()) {
    if (txs.length < 2) continue

    // Sort by date asc
    txs.sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))

    // Check if occurrences are in different months
    const monthsSet = new Set(
      txs.map((t) => {
        const d = new Date(t.transaction_date + 'T12:00:00')
        return `${d.getFullYear()}-${d.getMonth()}`
      })
    )
    if (monthsSet.size < 2) continue

    // Check amount similarity (±10%)
    const amounts = txs.map((t) => t.amount)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const amountConsistent = amounts.every(
      (a) => Math.abs(a - avgAmount) / avgAmount <= 0.1
    )
    if (!amountConsistent) continue

    // Check day of month similarity (±2 days)
    const days = txs.map((t) => new Date(t.transaction_date + 'T12:00:00').getDate())
    const avgDay = Math.round(days.reduce((a, b) => a + b, 0) / days.length)
    const dayConsistent = days.every((d) => Math.abs(d - avgDay) <= 2)
    if (!dayConsistent) continue

    // Check if already planned (same description, similar amount)
    const alreadyPlanned = existingPlanned.some(
      (p) =>
        normalize(p.description) === key &&
        Math.abs(p.amount - avgAmount) / avgAmount <= 0.1
    )
    if (alreadyPlanned) continue

    // Use the latest transaction's data for category and description
    const latest = txs[txs.length - 1]

    suggestions.push({
      description: latest.description || key,
      amount: Math.round(avgAmount),
      dayOfMonth: avgDay,
      categoryId: latest.category_id,
      categoryName: latest.categories?.name || null,
      categoryIcon: latest.categories?.icon || null,
      occurrences: txs.length,
      lastSeen: latest.transaction_date,
      sampleTransactionIds: txs.map((t) => t.id),
    })
  }

  // Sort by occurrences desc, then amount desc
  suggestions.sort((a, b) => b.occurrences - a.occurrences || b.amount - a.amount)

  return suggestions
}
