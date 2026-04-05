import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMessage, getFile, TelegramUpdate } from '@/lib/telegram/bot'
import { parseMessage, ParsedTransaction } from '@/lib/telegram/parser'
import { parseReceipt } from '@/lib/anthropic/receiptParser'
import { generateWeeklyInsight } from '@/lib/anthropic/insightGenerator'
import { formatCLP } from '@/lib/utils/currency'
import { Category } from '@/types/database'

export const maxDuration = 30

// Use service role client since Telegram webhook has no user session
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUserByChat(chatId: number) {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('telegram_users')
    .select('user_id')
    .eq('telegram_chat_id', chatId)
    .single()
  return data?.user_id as string | null
}

async function linkUserWithCode(chatId: number, username: string | undefined, linkCode: string): Promise<{ success: boolean; message: string; userId?: string }> {
  const supabase = getSupabase()

  // Find profile with valid code
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, telegram_link_code, telegram_link_expires_at')
    .eq('telegram_link_code', linkCode)
    .single()

  if (!profile) {
    return {
      success: false,
      message: "❌ Código inválido. Genera uno nuevo en Configuración → Bot de Telegram"
    }
  }

  if (new Date(profile.telegram_link_expires_at) < new Date()) {
    return {
      success: false,
      message: "⏰ El código expiró. Genera uno nuevo en la app."
    }
  }

  // Link user
  await supabase.from('telegram_users').upsert({
    telegram_chat_id: chatId,
    user_id: profile.id,
    telegram_username: username || null,
  }, { onConflict: 'telegram_chat_id' })

  // Clear used code
  await supabase.from('profiles')
    .update({
      telegram_link_code: null,
      telegram_link_expires_at: null
    })
    .eq('id', profile.id)

  return {
    success: true,
    message: "✅ ¡Cuenta vinculada exitosamente!\n\n" +
             "Ya puedes registrar gastos:\n" +
             "• 'Almuerzo 8500'\n" +
             "• 'Ingreso sueldo 150000'\n" +
             "• Foto de un recibo\n\n" +
             "Escribe 'ayuda' para ver todos los comandos.",
    userId: profile.id
  }
}

async function getCategories(userId: string): Promise<Category[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
  return (data ?? []) as Category[]
}

export async function POST(request: NextRequest) {
  const update: TelegramUpdate = await request.json()
  const message = update.message
  if (!message) return NextResponse.json({ ok: true })

  const chatId = message.chat.id

  // Get user
  let userId = await getUserByChat(chatId)

  // Handle unlinked users - check for linking code first
  if (!userId) {
    const text = message.text?.trim()

    // Check for linking code
    if (text && (text.match(/^\d{6}$/) || text.startsWith('/vincular'))) {
      const linkCode = text.startsWith('/vincular') ? text.replace('/vincular', '').trim() : text
      const linkResult = await linkUserWithCode(chatId, message.from.username, linkCode)

      await sendMessage(chatId, linkResult.message)

      if (linkResult.success) {
        userId = linkResult.userId!
      } else {
        return NextResponse.json({ ok: true })
      }
    } else {
      // Send registration message
      await sendMessage(chatId,
        "👋 ¡Hola! Soy el asistente de Katana.\n\n" +
        "Para vincular tu cuenta necesitas:\n" +
        "1️⃣ Registrarte en katana-omega.vercel.app\n" +
        "2️⃣ Ir a Configuración → Bot de Telegram\n" +
        "3️⃣ Copiar tu código de vinculación\n" +
        "4️⃣ Enviarlo aquí\n\n" +
        "O escribe /vincular [tu-código] para conectar tu cuenta."
      )
      return NextResponse.json({ ok: true })
    }
  }

  const categories = await getCategories(userId)

  // Handle photo (receipt)
  if (message.photo && message.photo.length > 0) {
    await sendMessage(chatId, '📸 Procesando recibo con IA...')
    try {
      const photo = message.photo[message.photo.length - 1] // highest resolution
      const fileBuffer = await getFile(photo.file_id)
      const result = await parseReceipt(fileBuffer, 'image/jpeg', categories)

      if (result.error || result.transactions.length === 0) {
        await sendMessage(chatId, '❌ No pude extraer transacciones de esta imagen. Intenta con una foto más clara.')
        return NextResponse.json({ ok: true })
      }

      // Show confirmation before saving
      const total = result.transactions.reduce((sum, t) => sum + t.amount, 0)
      const itemsList = result.transactions.slice(0, 8).map(t =>
        `• ${t.description}: ${formatCLP(t.amount)}`
      ).join('\n')

      const moreItems = result.transactions.length > 8 ?
        `\n... y ${result.transactions.length - 8} items más` : ''

      // Save pending action
      const { savePendingAction } = await import('@/lib/telegram/botHelpers')
      const defaultCat = categories.find(c => c.type === 'expense' && c.name === 'Alimentación') ||
                         categories.find(c => c.type === 'expense')

      await savePendingAction(chatId, userId, 'receipt_confirmation', {
        transactions: result.transactions,
        venue: 'Recibo',
        suggested_category_id: defaultCat?.id
      })

      await sendMessage(chatId,
        `📋 **Encontré ${result.transactions.length} transacciones:**\n\n` +
        `${itemsList}${moreItems}\n\n` +
        `💰 **Total: ${formatCLP(total)}**\n\n` +
        `¿Cómo quieres registrarlo?\n` +
        `**1️⃣** Todo junto como 'Recibo - ${formatCLP(total)}'\n` +
        `**2️⃣** Cada item por separado\n` +
        `**3️⃣** Cancelar\n\n` +
        `Responde **1**, **2** o **3**`
      )
    } catch {
      await sendMessage(chatId, '❌ Error al procesar la imagen.')
    }
    return NextResponse.json({ ok: true })
  }

  // Handle PDF document
  if (message.document && message.document.mime_type === 'application/pdf') {
    await sendMessage(chatId, '📄 Procesando PDF con IA...')
    try {
      const fileBuffer = await getFile(message.document.file_id)
      const result = await parseReceipt(fileBuffer, 'application/pdf', categories)

      if (result.error || result.transactions.length === 0) {
        await sendMessage(chatId, '❌ No pude extraer transacciones del PDF.')
        return NextResponse.json({ ok: true })
      }

      // Show confirmation for PDF too
      const total = result.transactions.reduce((sum, t) => sum + t.amount, 0)
      const itemsList = result.transactions.slice(0, 8).map(t =>
        `• ${t.description}: ${formatCLP(t.amount)}`
      ).join('\n')

      const moreItems = result.transactions.length > 8 ?
        `\n... y ${result.transactions.length - 8} items más` : ''

      // Save pending action
      const { savePendingAction } = await import('@/lib/telegram/botHelpers')
      const defaultCat = categories.find(c => c.type === 'expense' && c.name === 'Alimentación') ||
                         categories.find(c => c.type === 'expense')

      await savePendingAction(chatId, userId, 'receipt_confirmation', {
        transactions: result.transactions,
        venue: 'PDF',
        suggested_category_id: defaultCat?.id
      })

      await sendMessage(chatId,
        `📄 **Encontré ${result.transactions.length} transacciones en el PDF:**\n\n` +
        `${itemsList}${moreItems}\n\n` +
        `💰 **Total: ${formatCLP(total)}**\n\n` +
        `¿Cómo quieres registrarlo?\n` +
        `**1️⃣** Todo junto como 'PDF - ${formatCLP(total)}'\n` +
        `**2️⃣** Cada item por separado\n` +
        `**3️⃣** Cancelar\n\n` +
        `Responde **1**, **2** o **3**`
      )
    } catch {
      await sendMessage(chatId, '❌ Error al procesar el PDF.')
    }
    return NextResponse.json({ ok: true })
  }

  // Handle text messages
  const text = message.text?.trim()
  if (!text) return NextResponse.json({ ok: true })

  // Quick commands
  if (text === '/start') {
    await sendMessage(chatId,
      "⚔️ Bienvenido a Katana\n\n" +
      "La disciplina del samurai aplicada al dinero.\n\n" +
      "Si ya tienes cuenta en katana-omega.vercel.app:\n" +
      "→ Ve a Configuración → Bot de Telegram\n" +
      "→ Copia tu código y envíalo aquí\n\n" +
      "Si no tienes cuenta:\n" +
      "→ Regístrate en katana-omega.vercel.app\n\n" +
      "💡 Una vez vinculado podrás:\n" +
      "- Registrar gastos con texto o foto\n" +
      "- Ver tu resumen mensual\n" +
      "- Recibir insights de IA"
    )
    return NextResponse.json({ ok: true })
  }

  if (text === '/ayuda' || text.toLowerCase() === 'ayuda' || text.toLowerCase() === 'help') {
    await sendMessage(chatId,
      `<b>⚔️ Katana Bot - Guía Completa</b>\n\n` +

      `<b>💰 REGISTRAR GASTOS:</b>\n` +
      `• "Almuerzo 8500", "Uber 3200"\n` +
      `• "Café 2500 y pan 1500" (múltiples)\n` +
      `• "Ingreso sueldo 1500000"\n\n` +

      `<b>📸 RECIBOS:</b>\n` +
      `• Envía foto o PDF del recibo\n` +
      `• Elige si guardar todo junto o separado\n\n` +

      `<b>❓ PREGUNTAS (lenguaje natural):</b>\n` +
      `• "¿Cuánto gasté hoy?"\n` +
      `• "¿Cuánto llevo esta semana?"\n` +
      `• "¿En qué gasté más este mes?"\n` +
      `• "¿Cuál fue mi último gasto?"\n` +
      `• "¿Se registró como alimentación...?"\n\n` +

      `<b>🗑️ EDITAR:</b>\n` +
      `• "Borra el último gasto"\n` +
      `• "Edita el último gasto"\n\n` +

      `<b>📊 INFORMES:</b>\n` +
      `• "resumen" - Balance mensual\n` +
      `• "insights" - Análisis IA\n` +
      `• "dashboard" - Ver gráficos web\n\n` +

      `<b>💬 CONVERSACIÓN:</b>\n` +
      `• Salúdame con "hola", "buenas"\n` +
      `• Haz preguntas en español natural\n` +
      `• Confirma con "sí" o números (1,2,3)`
    )
    return NextResponse.json({ ok: true })
  }

  // NEW IMPROVED BOT WITH AI AND CONFIRMATIONS
  try {
    const {
      handleGreeting,
      handleQuestion,
      savePendingAction,
      getPendingAction,
      clearPendingAction,
      deleteLastTransaction
    } = await import('@/lib/telegram/botHelpers')

    const parsed = await parseMessage(text)

    // Check for pending actions first
    const pendingAction = await getPendingAction(chatId)

    if (pendingAction && (parsed.action === 'confirmation' || parsed.action === 'cancellation')) {
      if (parsed.action === 'cancellation') {
        await clearPendingAction(chatId)
        await sendMessage(chatId, '❌ Acción cancelada.')
        return NextResponse.json({ ok: true })
      }

      // Handle confirmation based on pending action type
      if (pendingAction.action_type === 'receipt_confirmation') {
        const choice = parsed.confirmationType === 'numeric' ? text.trim() : '2'
        await handleReceiptConfirmation(chatId, userId, pendingAction.payload, choice)
        await clearPendingAction(chatId)
        return NextResponse.json({ ok: true })
      }

      if (pendingAction.action_type === 'delete_confirmation') {
        const lastTransaction = pendingAction.payload
        await deleteLastTransaction(userId)
        await sendMessage(chatId,
          `🗑️ **Transacción eliminada:**\n\n` +
          `📝 ${lastTransaction.description}\n` +
          `💰 ${formatCLP(Number(lastTransaction.amount))}`
        )
        await clearPendingAction(chatId)
        return NextResponse.json({ ok: true })
      }
    }

    // Handle new message types
    switch (parsed.action) {
      case 'greeting':
        await handleGreeting(chatId)
        break

      case 'question':
        if (parsed.question) {
          await handleQuestion(chatId, userId, parsed.question)
        }
        break

      case 'command':
        await handleCommand(chatId, userId, parsed.command || '', categories)
        break

      case 'transaction':
        if (parsed.transactions && parsed.transactions.length > 0) {
          await handleTransactions(chatId, userId, parsed.transactions, categories)
        }
        break

      default:
        await sendMessage(chatId, '🤔 No entendí. Intenta con algo como "Almuerzo 8500" o escribe "ayuda" para ver los comandos.')
        break
    }
  } catch (err) {
    console.error('Telegram webhook error:', err)
    await sendMessage(chatId, '❌ Hubo un error procesando tu mensaje. Intenta de nuevo.')
  }

  return NextResponse.json({ ok: true })
}

async function handleCommand(chatId: number, userId: string, command: string, categories: Category[]): Promise<void> {
  const supabase = getSupabase()

  switch (command) {
    case 'borra_ultimo':
      const { data: last } = await supabase
        .from('transactions')
        .select('*, categories(name, icon)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!last) {
        await sendMessage(chatId, "🤷‍♂️ No tienes transacciones para eliminar.")
        return
      }

      const cat = last.categories as any
      const date = new Date(last.transaction_date).toLocaleDateString('es-CL')

      // Save pending action
      const { savePendingAction } = await import('@/lib/telegram/botHelpers')
      await savePendingAction(chatId, userId, 'delete_confirmation', last)

      await sendMessage(chatId,
        `🗑️ **¿Eliminar esta transacción?**\n\n` +
        `📝 ${last.description}\n` +
        `💰 ${formatCLP(Number(last.amount))}\n` +
        `📁 ${cat?.icon || '💰'} ${cat?.name || 'Sin categoría'}\n` +
        `📅 ${date}\n\n` +
        `Responde **"sí"** para confirmar o **"no"** para cancelar.`
      )
      break

    case 'resumen':
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
        `<b>📊 Resumen de ${months[month - 1]} ${year}:</b>\n\n` +
        `💚 Ingresos: ${formatCLP(income)}\n` +
        `🔴 Gastos: ${formatCLP(expense)}\n` +
        `${balance >= 0 ? '💙' : '⚠️'} Balance: ${formatCLP(balance)}\n\n` +
        `📈 Ve los gráficos completos en el dashboard.`
      )
      break

    case 'insights':
      await sendMessage(chatId, '💡 Generando análisis...')

      // Get weekly comparison data
      const { data: thisWeekData } = await supabase
        .from('transactions')
        .select('amount, categories(name, color, icon, id)')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('transaction_date', getWeekStart(0))
        .lt('transaction_date', getWeekEnd(0))

      const { data: lastWeekData } = await supabase
        .from('transactions')
        .select('amount, categories(name, color, icon, id)')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('transaction_date', getWeekStart(-1))
        .lt('transaction_date', getWeekEnd(-1))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const groupBy = (data: any[]) => {
        const map = new Map<string, { total: number; name: string; color: string; icon: string; id: string }>()
        for (const t of data) {
          const cat = t.categories
          if (!cat) continue
          const existing = map.get(cat.id) ?? { total: 0, name: cat.name, color: cat.color, icon: cat.icon, id: cat.id }
          existing.total += Number(t.amount)
          map.set(cat.id, existing)
        }
        return Array.from(map.values())
      }

      const thisWeek = groupBy(thisWeekData ?? [])
      const lastWeek = groupBy(lastWeekData ?? [])
      const thisWeekTotal = thisWeek.reduce((s, w) => s + w.total, 0)
      const lastWeekTotal = lastWeek.reduce((s, w) => s + w.total, 0)

      const weeklyComparison = thisWeek.map(tw => ({
        category_id: tw.id,
        category_name: tw.name,
        color: tw.color,
        icon: tw.icon,
        this_week: tw.total,
        last_week: lastWeek.find(lw => lw.id === tw.id)?.total ?? 0,
      }))

      const { generateWeeklyInsight } = await import('@/lib/anthropic/insightGenerator')
      const insightText = await generateWeeklyInsight(
        weeklyComparison, weeklyComparison,
        thisWeekTotal, lastWeekTotal,
        []
      )

      await sendMessage(chatId, `💡 <b>Insight semanal:</b>\n\n${insightText}`)
      break

    case 'dashboard':
      const url = process.env.NEXT_PUBLIC_APP_URL || 'https://finantek-omega.vercel.app'
      await sendMessage(chatId, `🌐 Abre tu dashboard aquí:\n${url}/dashboard`)
      break

    default:
      await sendMessage(chatId, '🤔 No reconozco ese comando. Escribe "ayuda" para ver las opciones.')
  }
}

async function handleTransactions(chatId: number, userId: string, transactions: ParsedTransaction[], categories: Category[]): Promise<void> {
  const supabase = getSupabase()
  const lines: string[] = []

  for (const t of transactions) {
    const matchedCat = categories.find(
      c => c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ===
           t.suggested_category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    ) || categories.find(c => c.type === t.type && c.name.includes('Otros'))

    if (!matchedCat) continue

    await supabase.from('transactions').insert({
      user_id: userId,
      category_id: matchedCat.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      transaction_date: t.date,
      source: 'manual',
    })

    const emoji = t.type === 'income' ? '💚' : '🔴'
    lines.push(`${emoji} ${t.description}: ${formatCLP(t.amount)} → ${matchedCat.icon} ${matchedCat.name}`)
  }

  await sendMessage(chatId, `✅ **Registrado:**\n\n${lines.join('\n')}`)
}

async function handleReceiptConfirmation(chatId: number, userId: string, receiptData: any, choice: string): Promise<void> {
  const supabase = getSupabase()

  const transactions = receiptData.transactions || []
  if (transactions.length === 0) return

  if (choice === '1') {
    // Save as single consolidated transaction
    const total = transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    const venue = receiptData.venue || 'Compra'

    await supabase.from('transactions').insert({
      user_id: userId,
      category_id: receiptData.suggested_category_id,
      type: 'expense',
      amount: total,
      description: `${venue} - Total compra`,
      transaction_date: new Date().toISOString().split('T')[0],
      source: 'receipt',
    })

    await sendMessage(chatId, `✅ **Registrado como una transacción:**\n\n🔴 ${venue}: ${formatCLP(total)}`)

  } else if (choice === '2') {
    // Save each item separately (original behavior)
    let registered = 0
    const lines: string[] = []

    for (const t of transactions) {
      await supabase.from('transactions').insert({
        user_id: userId,
        category_id: t.category_id || receiptData.suggested_category_id,
        type: 'expense',
        amount: t.amount,
        description: t.description,
        transaction_date: t.date || new Date().toISOString().split('T')[0],
        source: 'receipt',
      })
      registered++
      lines.push(`🔴 ${t.description}: ${formatCLP(t.amount)}`)
    }

    await sendMessage(chatId, `✅ **${registered} transacciones registradas:**\n\n${lines.join('\n')}`)
  }
  // choice === '3' is handled as cancellation above
}

function getWeekStart(offset: number): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  const d = new Date(now)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(offset: number): string {
  const start = new Date(getWeekStart(offset))
  start.setDate(start.getDate() + 7)
  return start.toISOString().split('T')[0]
}
