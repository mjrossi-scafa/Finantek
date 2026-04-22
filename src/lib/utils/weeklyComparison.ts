/**
 * Weekly comparison calculations from raw transaction data.
 * Takes ~14 days of transactions and computes:
 * - Totals per week
 * - Per-category breakdown with % changes
 * - Per-day breakdown for line chart
 */

interface TransactionRow {
  transaction_date: string
  amount: number
  category_id: string | null
  categories?: { name: string; icon: string | null; color: string | null } | null
}

export interface WeekData {
  total: number
  byDay: number[] // [mon, tue, wed, thu, fri, sat, sun]
  byCategory: Record<string, { name: string; icon: string; color: string; amount: number }>
}

export interface CategoryDiff {
  name: string
  icon: string
  color: string
  thisWeek: number
  lastWeek: number
  diff: number
  diffPct: number | null
}

export interface WeeklyComparisonData {
  thisWeek: WeekData
  lastWeek: WeekData
  diff: number
  diffPct: number | null
  categoryDiffs: CategoryDiff[]
  bestDay: { dayName: string; amount: number } | null
  worstDay: { dayName: string; amount: number } | null
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Get Monday start of a given week offset (0 = this week, -1 = last week)
 */
function getWeekStart(offset: number = 0): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  const d = new Date(now)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDayIndex(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00')
  // 0 = Mon, 6 = Sun
  return (d.getDay() + 6) % 7
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export function calculateWeeklyComparison(transactions: TransactionRow[]): WeeklyComparisonData {
  const thisWeekStart = getWeekStart(0)
  const lastWeekStart = getWeekStart(-1)
  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)

  const thisWeekStartStr = toDateStr(thisWeekStart)
  const lastWeekStartStr = toDateStr(lastWeekStart)
  const lastWeekEndStr = toDateStr(lastWeekEnd)

  const emptyWeek = (): WeekData => ({
    total: 0,
    byDay: [0, 0, 0, 0, 0, 0, 0],
    byCategory: {},
  })

  const thisWeek = emptyWeek()
  const lastWeek = emptyWeek()

  for (const tx of transactions) {
    const date = tx.transaction_date
    const amount = tx.amount
    const catId = tx.category_id || 'uncategorized'
    const cat = tx.categories

    let target: WeekData | null = null
    if (date >= thisWeekStartStr) {
      target = thisWeek
    } else if (date >= lastWeekStartStr && date <= lastWeekEndStr) {
      target = lastWeek
    }
    if (!target) continue

    target.total += amount
    const dayIdx = getDayIndex(date)
    target.byDay[dayIdx] += amount

    if (!target.byCategory[catId]) {
      target.byCategory[catId] = {
        name: cat?.name || 'Sin categoría',
        icon: cat?.icon || '💸',
        color: cat?.color || '#8B5CF6',
        amount: 0,
      }
    }
    target.byCategory[catId].amount += amount
  }

  // Overall diff
  const diff = thisWeek.total - lastWeek.total
  const diffPct = lastWeek.total > 0
    ? Math.round((diff / lastWeek.total) * 100)
    : thisWeek.total > 0 ? 100 : null

  // Category diffs (merge both weeks' categories)
  const allCatIds = new Set([...Object.keys(thisWeek.byCategory), ...Object.keys(lastWeek.byCategory)])
  const categoryDiffs: CategoryDiff[] = Array.from(allCatIds).map((id) => {
    const tw = thisWeek.byCategory[id]
    const lw = lastWeek.byCategory[id]
    const name = tw?.name || lw?.name || 'Sin categoría'
    const icon = tw?.icon || lw?.icon || '💸'
    const color = tw?.color || lw?.color || '#8B5CF6'
    const thisWeekAmt = tw?.amount || 0
    const lastWeekAmt = lw?.amount || 0
    const d = thisWeekAmt - lastWeekAmt
    const pct = lastWeekAmt > 0
      ? Math.round((d / lastWeekAmt) * 100)
      : thisWeekAmt > 0 ? 100 : null
    return { name, icon, color, thisWeek: thisWeekAmt, lastWeek: lastWeekAmt, diff: d, diffPct: pct }
  }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  // Best / worst day (this week)
  let bestDay: { dayName: string; amount: number } | null = null
  let worstDay: { dayName: string; amount: number } | null = null
  thisWeek.byDay.forEach((amt, i) => {
    if (amt <= 0) return
    if (!worstDay || amt > worstDay.amount) worstDay = { dayName: DAY_NAMES[i], amount: amt }
    if (!bestDay || amt < bestDay.amount) bestDay = { dayName: DAY_NAMES[i], amount: amt }
  })

  return {
    thisWeek,
    lastWeek,
    diff,
    diffPct,
    categoryDiffs,
    bestDay,
    worstDay,
  }
}

export { DAY_NAMES }
