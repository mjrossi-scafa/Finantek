import { createClient } from '@supabase/supabase-js'
import { getChileNow } from '@/lib/utils/timezone'
import { formatCLP } from '@/lib/utils/currency'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface FinancialContext {
  currentMonth: {
    income: number
    expense: number
    balance: number
    byCategory: Record<string, number>
    transactionCount: number
  }
  lastMonth: {
    expense: number
  }
  monthProgress: number
  projectedExpense: number
  variationVsLastMonth: number
  daysLeft: number
  monthName: string
}

const MONTHS = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre',
  'diciembre'
]

export async function getUserFinancialContext(
  userId: string
): Promise<FinancialContext> {
  const supabase = getSupabase()
  const now = getChileNow()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  const startOfMonth = new Date(year, month, 1).toISOString()
  const startOfLastMonth = new Date(year, month - 1, 1).toISOString()
  const endOfLastMonth = new Date(year, month, 0).toISOString()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthProgress = Math.round((day / daysInMonth) * 100)
  const daysLeft = daysInMonth - day

  // Transacciones mes actual
  const { data: currentTxs } = await supabase
    .from('transactions')
    .select('amount, type, categories(name)')
    .eq('user_id', userId)
    .gte('transaction_date', startOfMonth.split('T')[0])

  // Transacciones mes anterior
  const { data: lastTxs } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', userId)
    .gte('transaction_date', startOfLastMonth.split('T')[0])
    .lte('transaction_date', endOfLastMonth.split('T')[0])

  const currentIncome = (currentTxs ?? [])
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const currentExpense = (currentTxs ?? [])
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  const lastMonthExpense = (lastTxs ?? [])
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  // Gastos por categoría
  const byCategory = (currentTxs ?? [])
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = Array.isArray(t.categories)
        ? t.categories[0]?.name
        : (t.categories as any)?.name
      const catName = cat || 'Otros'
      acc[catName] = (acc[catName] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

  const projectedExpense = day > 0
    ? Math.round((currentExpense / day) * daysInMonth)
    : 0

  const variationVsLastMonth = lastMonthExpense > 0
    ? Math.round(
        ((currentExpense - lastMonthExpense) / lastMonthExpense) * 100
      )
    : 0

  return {
    currentMonth: {
      income: currentIncome,
      expense: currentExpense,
      balance: currentIncome - currentExpense,
      byCategory,
      transactionCount: (currentTxs ?? []).length,
    },
    lastMonth: { expense: lastMonthExpense },
    monthProgress,
    projectedExpense,
    variationVsLastMonth,
    daysLeft,
    monthName: MONTHS[month],
  }
}

export const BUSHIDO_QUOTES = [
  "La disciplina de hoy es la libertad de mañana.",
  "El guerrero planifica antes de gastar.",
  "Cada peso con intención. Cada decisión con propósito.",
  "Controlar el gasto es controlar el destino.",
  "Un presupuesto es el mapa del guerrero.",
  "La victoria financiera se gana un peso a la vez.",
  "No gastes lo que no has ganado.",
  "El camino del samurai financiero empieza hoy.",
]

export function getRandomQuote(): string {
  return BUSHIDO_QUOTES[
    Math.floor(Math.random() * BUSHIDO_QUOTES.length)
  ]
}

export function buildSmartResumen(ctx: FinancialContext): string {
  let msg = `📊 <b>Balance de ${ctx.monthName}:</b>\n\n`
  msg += `💴 Ingresos: ${formatCLP(ctx.currentMonth.income)}\n`
  msg += `🗡️ Gastos: ${formatCLP(ctx.currentMonth.expense)}\n`

  const balanceEmoji = ctx.currentMonth.balance >= 0 ? '✅' : '⚠️'
  msg += `${balanceEmoji} Balance: ${formatCLP(ctx.currentMonth.balance)}\n\n`

  // Progreso del mes
  msg += `📅 Mes al ${ctx.monthProgress}% · ${ctx.daysLeft} días restantes\n`

  // Proyección
  if (ctx.projectedExpense > 0 && ctx.currentMonth.income > 0) {
    if (ctx.projectedExpense > ctx.currentMonth.income) {
      msg += `⚠️ Proyección: ${formatCLP(ctx.projectedExpense)} — supera tus ingresos\n`
    } else {
      msg += `📈 Proyección fin de mes: ${formatCLP(ctx.projectedExpense)}\n`
    }
  }

  // Variación vs mes anterior
  if (ctx.variationVsLastMonth !== 0 && ctx.lastMonth.expense > 0) {
    const arrow = ctx.variationVsLastMonth > 0 ? '↑' : '↓'
    const sign = ctx.variationVsLastMonth > 0 ? '+' : ''
    msg += `${arrow} ${sign}${ctx.variationVsLastMonth}% vs mes anterior\n`
  }

  // Top 3 categorías
  const topCats = Object.entries(ctx.currentMonth.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  if (topCats.length > 0) {
    msg += `\n💡 <b>Top gastos:</b>\n`
    topCats.forEach(([cat, amount]) => {
      msg += `  • ${cat}: ${formatCLP(amount)}\n`
    })
  }

  // Frase motivacional
  msg += `\n<i>${getRandomQuote()}</i>`

  return msg
}

export async function checkSmartAlerts(
  userId: string,
  chatId: number,
  newTransaction: { category?: string; type: string; amount: number },
  ctx: FinancialContext,
  sendMessageFn: (chatId: number, text: string) => Promise<void>
): Promise<void> {
  if (newTransaction.type !== 'expense') return

  const alerts: string[] = []

  // 1. Gasto inusualmente alto en categoría vs mes anterior
  if (newTransaction.category) {
    const catTotal = ctx.currentMonth.byCategory[newTransaction.category] || 0
    // Si en la primera mitad del mes ya supera el total del mes anterior
    if (ctx.monthProgress < 60 && catTotal > ctx.lastMonth.expense * 0.7) {
      alerts.push(
        `⚠️ Llevas ${formatCLP(catTotal)} en ${newTransaction.category} ` +
        `— ya es alto para este punto del mes.`
      )
    }
  }

  // 2. Proyección supera ingresos
  if (
    ctx.projectedExpense > ctx.currentMonth.income &&
    ctx.currentMonth.income > 0 &&
    ctx.monthProgress > 20
  ) {
    alerts.push(
      `⚠️ Tu ritmo de gasto proyecta ` +
      `${formatCLP(ctx.projectedExpense)} al fin de mes — ` +
      `supera tus ingresos registrados.`
    )
  }

  // 3. Hito positivo — balance positivo con pocos gastos
  if (
    ctx.currentMonth.balance > 0 &&
    ctx.currentMonth.transactionCount <= 3
  ) {
    alerts.push(`✅ Buen inicio de mes. Balance positivo.`)
  }

  for (const alert of alerts) {
    await sendMessageFn(chatId, alert)
  }
}