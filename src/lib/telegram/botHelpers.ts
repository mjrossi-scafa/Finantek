import { createClient } from '@supabase/supabase-js'
import { sendMessage } from './bot'
import { formatCLP } from '@/lib/utils/currency'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function handleGreeting(chatId: number): Promise<void> {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' :
                   hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  await sendMessage(chatId,
    `${greeting}! ⚔️\n\n` +
    `¿Qué necesitas?\n\n` +
    `💰 Registrar gasto: "Almuerzo 8500"\n` +
    `📊 Ver resumen: "resumen" o "cuánto llevo"\n` +
    `📸 Escanear recibo: envía una foto\n` +
    `❓ Preguntas: "cuánto gasté hoy?"\n` +
    `🗑️ Editar: "borra el último gasto"\n` +
    `❓ Ayuda: "ayuda"`
  )
}

export async function handleQuestion(chatId: number, userId: string, question: any): Promise<void> {
  const supabase = getSupabase()

  switch (question.queryType) {
    case 'today':
      await handleTodayQuery(chatId, userId)
      break
    case 'week':
      await handleWeekQuery(chatId, userId)
      break
    case 'month':
      await handleMonthQuery(chatId, userId)
      break
    case 'category':
      await handleCategoryQuery(chatId, userId)
      break
    case 'last_transaction':
      await handleLastTransactionQuery(chatId, userId)
      break
    case 'search':
      await handleSearchQuery(chatId, userId, question.query)
      break
    case 'balance':
      await handleBalanceQuery(chatId, userId)
      break
    default:
      await sendMessage(chatId, "🤔 No entendí tu pregunta. Intenta ser más específico.")
  }
}

async function handleTodayQuery(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount, description, categories(name, icon)')
    .eq('user_id', userId)
    .gte('transaction_date', today)
    .lt('transaction_date', getNextDay(today))

  if (!transactions || transactions.length === 0) {
    await sendMessage(chatId, "✅ Hoy no has registrado ningún gasto. ¡Perfecto control! 💪")
    return
  }

  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)

  let message = `📅 **Resumen de hoy:**\n\n`

  if (totalExpense > 0) {
    message += `🔴 Gastos: ${formatCLP(totalExpense)} (${expenses.length} transacción${expenses.length > 1 ? 'es' : ''})\n`
  }

  if (totalIncome > 0) {
    message += `💚 Ingresos: ${formatCLP(totalIncome)} (${income.length} transacción${income.length > 1 ? 'es' : ''})\n`
  }

  if (expenses.length <= 3) {
    message += `\n**Detalles:**\n`
    for (const t of expenses) {
      const cat = t.categories as any
      message += `• ${cat?.icon || '💰'} ${t.description}: ${formatCLP(Number(t.amount))}\n`
    }
  }

  await sendMessage(chatId, message)
}

async function handleWeekQuery(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('transaction_date', weekStart)
    .lt('transaction_date', weekEnd)

  if (!transactions || transactions.length === 0) {
    await sendMessage(chatId, "✅ Esta semana no has registrado gastos. ¡Excelente disciplina! ⚔️")
    return
  }

  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  await sendMessage(chatId,
    `📊 **Resumen semanal:**\n\n` +
    `💚 Ingresos: ${formatCLP(totalIncome)}\n` +
    `🔴 Gastos: ${formatCLP(totalExpense)}\n` +
    `${balance >= 0 ? '💙' : '⚠️'} Balance: ${formatCLP(balance)}\n\n` +
    `📈 Transacciones: ${transactions.length}`
  )
}

async function handleMonthQuery(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount, categories(name, icon)')
    .eq('user_id', userId)
    .gte('transaction_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt('transaction_date', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`)

  if (!transactions || transactions.length === 0) {
    await sendMessage(chatId, "✅ Este mes no has registrado gastos. ¡Increíble autocontrol! 🗡️")
    return
  }

  const expenses = transactions.filter(t => t.type === 'expense')
  const income = transactions.filter(t => t.type === 'income')

  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)

  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

  await sendMessage(chatId,
    `📊 **Resumen de ${months[month - 1]} ${year}:**\n\n` +
    `💚 Ingresos: ${formatCLP(totalIncome)}\n` +
    `🔴 Gastos: ${formatCLP(totalExpense)}\n` +
    `${(totalIncome - totalExpense) >= 0 ? '💙' : '⚠️'} Balance: ${formatCLP(totalIncome - totalExpense)}\n\n` +
    `📈 Total transacciones: ${transactions.length}`
  )
}

async function handleCategoryQuery(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, categories(name, icon)')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt('transaction_date', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`)

  if (!transactions || transactions.length === 0) {
    await sendMessage(chatId, "✅ No tienes gastos este mes.")
    return
  }

  const categoryTotals = new Map<string, { total: number, icon: string }>()

  for (const t of transactions) {
    const cat = t.categories as any
    const name = cat?.name || 'Otros'
    const icon = cat?.icon || '💰'
    const existing = categoryTotals.get(name) || { total: 0, icon }
    existing.total += Number(t.amount)
    categoryTotals.set(name, existing)
  }

  const sorted = Array.from(categoryTotals.entries()).sort((a, b) => b[1].total - a[1].total)
  const top3 = sorted.slice(0, 3)

  let message = `📊 **Categorías que más gastas este mes:**\n\n`
  for (let i = 0; i < top3.length; i++) {
    const [name, data] = top3[i]
    const medal = ['🥇', '🥈', '🥉'][i]
    message += `${medal} ${data.icon} ${name}: ${formatCLP(data.total)}\n`
  }

  await sendMessage(chatId, message)
}

async function handleLastTransactionQuery(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()

  const { data: last } = await supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!last) {
    await sendMessage(chatId, "🤷‍♂️ No tienes transacciones registradas aún.")
    return
  }

  const cat = last.categories as any
  const emoji = last.type === 'income' ? '💚' : '🔴'
  const date = new Date(last.transaction_date).toLocaleDateString('es-CL')

  await sendMessage(chatId,
    `${emoji} **Tu última transacción:**\n\n` +
    `📝 ${last.description}\n` +
    `💰 ${formatCLP(Number(last.amount))}\n` +
    `📁 ${cat?.icon || '💰'} ${cat?.name || 'Sin categoría'}\n` +
    `📅 ${date}\n\n` +
    `💡 Escribe "borra el último" para eliminarlo`
  )
}

async function handleSearchQuery(chatId: number, userId: string, query: string): Promise<void> {
  const supabase = getSupabase()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .eq('user_id', userId)
    .ilike('description', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!transactions || transactions.length === 0) {
    await sendMessage(chatId, `🔍 No encontré transacciones que contengan "${query}"`)
    return
  }

  let message = `🔍 **Encontré ${transactions.length} transacción${transactions.length > 1 ? 'es' : ''} con "${query}":**\n\n`

  for (const t of transactions) {
    const cat = t.categories as any
    const emoji = t.type === 'income' ? '💚' : '🔴'
    const date = new Date(t.transaction_date).toLocaleDateString('es-CL')
    message += `${emoji} ${t.description} - ${formatCLP(Number(t.amount))} (${date})\n`
  }

  await sendMessage(chatId, message)
}

async function handleBalanceQuery(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const { data: transactions } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId)
    .gte('transaction_date', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt('transaction_date', month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`)

  const income = (transactions ?? []).filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = (transactions ?? []).filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance = income - expense

  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

  await sendMessage(chatId,
    `💰 **Balance de ${months[month - 1]}:**\n\n` +
    `💚 Ingresos: ${formatCLP(income)}\n` +
    `🔴 Gastos: ${formatCLP(expense)}\n` +
    `${balance >= 0 ? '💙' : '⚠️'} **Balance: ${formatCLP(balance)}**\n\n` +
    `${balance >= 0 ? '🎉 ¡Vas excelente!' : '⚔️ Tiempo de disciplina financiera'}`)
}

export async function savePendingAction(chatId: number, userId: string, actionType: string, payload: any): Promise<string> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('bot_pending_actions')
    .insert({
      telegram_chat_id: chatId,
      user_id: userId,
      action_type: actionType,
      payload,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error('Failed to save pending action')
  }

  return data.id
}

export async function getPendingAction(chatId: number): Promise<any> {
  const supabase = getSupabase()

  const { data } = await supabase
    .from('bot_pending_actions')
    .select('*')
    .eq('telegram_chat_id', chatId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function clearPendingAction(chatId: number): Promise<void> {
  const supabase = getSupabase()

  await supabase
    .from('bot_pending_actions')
    .delete()
    .eq('telegram_chat_id', chatId)
}

export async function deleteLastTransaction(userId: string): Promise<any> {
  const supabase = getSupabase()

  const { data: last } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (last) {
    await supabase.from('transactions').delete().eq('id', last.id)
  }

  return last
}

// Helper functions
function getNextDay(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const d = new Date(now)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(): string {
  const start = new Date(getWeekStart())
  start.setDate(start.getDate() + 7)
  return start.toISOString().split('T')[0]
}