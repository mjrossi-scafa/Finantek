import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMessage, getFile, TelegramUpdate } from '@/lib/telegram/bot'
import { parseMessage, ParsedTransaction } from '@/lib/telegram/parser'
import { parseReceipt } from '@/lib/anthropic/receiptParser'
import { generateWeeklyInsight } from '@/lib/anthropic/insightGenerator'
import { formatCLP } from '@/lib/utils/currency'
import { Category } from '@/types/database'
import { getChileToday, getChileHour, getChileGreeting, getChileNow } from '@/lib/utils/timezone'
import {
  getConversation,
  addMessage,
  setPendingData,
  clearPendingData,
  clearConversation
} from '@/lib/telegram/conversationMemory'

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

  // Handle photo (receipt) with conversational flow
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

      // Store in conversation memory instead of pending actions
      const total = result.transactions.reduce((sum, t) => sum + t.amount, 0)
      const receiptSummary = result.transactions.slice(0, 8).map((item, i) =>
        `${i + 1}. ${item.description}: ${formatCLP(item.amount)}`
      ).join('\n')

      const moreItems = result.transactions.length > 8 ?
        `\n... y ${result.transactions.length - 8} items más` : ''

      setPendingData(chatId, {
        type: 'receipt',
        items: result.transactions,
        total,
        raw: `Recibo con ${result.transactions.length} items`
      })

      const botResponse =
        `📋 Encontré ${result.transactions.length} items por ${formatCLP(total)}:\n\n` +
        `${receiptSummary}${moreItems}\n\n` +
        `¿Qué hacemos?\n` +
        `1️⃣ Subir todo junto como un gasto\n` +
        `2️⃣ Subir cada item por separado\n` +
        `3️⃣ Excluir algún item (di cuál)\n` +
        `4️⃣ Cancelar`

      addMessage(chatId, 'assistant', botResponse)
      await sendMessage(chatId, botResponse)
    } catch {
      await sendMessage(chatId, '❌ Error al procesar la imagen.')
    }
    return NextResponse.json({ ok: true })
  }

  // Handle PDF document with conversational flow
  if (message.document && message.document.mime_type === 'application/pdf') {
    await sendMessage(chatId, '📄 Procesando PDF con IA...')
    try {
      const fileBuffer = await getFile(message.document.file_id)
      const result = await parseReceipt(fileBuffer, 'application/pdf', categories)

      if (result.error || result.transactions.length === 0) {
        await sendMessage(chatId, '❌ No pude extraer transacciones del PDF.')
        return NextResponse.json({ ok: true })
      }

      // Store in conversation memory
      const total = result.transactions.reduce((sum, t) => sum + t.amount, 0)
      const receiptSummary = result.transactions.slice(0, 8).map((item, i) =>
        `${i + 1}. ${item.description}: ${formatCLP(item.amount)}`
      ).join('\n')

      const moreItems = result.transactions.length > 8 ?
        `\n... y ${result.transactions.length - 8} items más` : ''

      setPendingData(chatId, {
        type: 'receipt',
        items: result.transactions,
        total,
        raw: `PDF con ${result.transactions.length} items`
      })

      const botResponse =
        `📄 Encontré ${result.transactions.length} items por ${formatCLP(total)}:\n\n` +
        `${receiptSummary}${moreItems}\n\n` +
        `¿Qué hacemos?\n` +
        `1️⃣ Subir todo junto como un gasto\n` +
        `2️⃣ Subir cada item por separado\n` +
        `3️⃣ Excluir algún item (di cuál)\n` +
        `4️⃣ Cancelar`

      addMessage(chatId, 'assistant', botResponse)
      await sendMessage(chatId, botResponse)
    } catch {
      await sendMessage(chatId, '❌ Error al procesar el PDF.')
    }
    return NextResponse.json({ ok: true })
  }

  // Handle text messages with conversational AI
  const text = message.text?.trim()
  if (!text) return NextResponse.json({ ok: true })

  // Get conversation state
  const conv = getConversation(chatId)
  addMessage(chatId, 'user', text)

  // Quick commands
  if (text === '/start') {
    clearConversation(chatId)
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

  // Handle conversation with pending data
  if (conv.pendingData) {
    await handlePendingDataResponse(chatId, userId, text, conv, categories)
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

  // Handle correction commands
  if (text.toLowerCase().includes('corregir') || text.toLowerCase().includes('estaba mal') || text.toLowerCase().includes('cambiar')) {
    await handleCorrectionRequest(chatId, userId)
    return NextResponse.json({ ok: true })
  }

  // Parse regular message
  try {
    const parsed = await parseMessage(text)

    // Handle different message types
    switch (parsed.action) {
      case 'greeting':
        await handleGreeting(chatId, userId)
        break

      case 'question':
        if (parsed.question) {
          await handleFreeConversation(chatId, text, conv, userId)
        }
        break

      case 'command':
        await handleCommand(chatId, userId, parsed.command || '', categories)
        break

      case 'transaction':
        if (parsed.transactions && parsed.transactions.length > 0) {
          await handleSmartTransactions(chatId, userId, parsed.transactions, categories)
        }
        break

      default:
        await handleFreeConversation(chatId, text, conv, userId)
        break
    }
  } catch (err) {
    console.error('Telegram webhook error:', err)
    await sendMessage(chatId, '❌ Hubo un error procesando tu mensaje. Intenta de nuevo.')
  }

  return NextResponse.json({ ok: true })
}

// NEW CONVERSATIONAL HANDLERS

async function handlePendingDataResponse(
  chatId: number,
  userId: string,
  message: string,
  conv: any,
  categories: Category[]
): Promise<void> {
  const Anthropic = await import('@anthropic-ai/sdk')
  const anthropic = new Anthropic.default({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const systemPrompt = `Eres el asistente de Katana.
El usuario tiene una acción pendiente con estos datos:
${JSON.stringify(conv.pendingData)}

El usuario responde: "${message}"

Clasifica la intención en JSON:
{
  "action": "confirm_single" | "confirm_separate" |
            "exclude_items" | "cancel" | "unclear",
  "excludeIndices": [1,3],  // si excluye items (índices base 1)
  "customName": "string",   // si da nombre personalizado
  "category": "string"      // si menciona categoría
}

Solo JSON, sin texto extra.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: systemPrompt }]
    })

    const content = response.content[0]
    const intent = JSON.parse(content.type === 'text' ? content.text : '{}')

    switch (intent.action) {
      case 'confirm_single':
        await handleSingleConfirmation(chatId, userId, conv.pendingData, intent.customName)
        break

      case 'confirm_separate':
        await handleSeparateConfirmation(chatId, userId, conv.pendingData, categories)
        break

      case 'exclude_items':
        await handleItemExclusion(chatId, conv.pendingData, intent.excludeIndices)
        break

      case 'cancel':
        clearPendingData(chatId)
        const cancelMsg = '❌ Cancelado. ¿En qué más te ayudo?'
        addMessage(chatId, 'assistant', cancelMsg)
        await sendMessage(chatId, cancelMsg)
        break

      case 'unclear':
        await handleFreeConversation(chatId, message, conv, userId)
        break
    }
  } catch (err) {
    console.error('Intent classification error:', err)
    await handleFreeConversation(chatId, message, conv, userId)
  }
}

async function handleSingleConfirmation(chatId: number, userId: string, pendingData: any, customName?: string): Promise<void> {
  const supabase = getSupabase()
  const name = customName || `Compra ${pendingData.raw.substring(0, 30)}`

  await supabase.from('transactions').insert({
    user_id: userId,
    category_id: getDefaultExpenseCategory(await getCategories(userId))?.id,
    type: 'expense',
    amount: pendingData.total,
    description: name,
    transaction_date: getChileToday(),
    source: pendingData.type,
  })

  clearPendingData(chatId)
  const successMsg = `✅ Registrado: ${name}\n💰 ${formatCLP(pendingData.total)}`
  addMessage(chatId, 'assistant', successMsg)
  await sendMessage(chatId, successMsg)
}

async function handleSeparateConfirmation(chatId: number, userId: string, pendingData: any, categories: Category[]): Promise<void> {
  const supabase = getSupabase()
  const lines: string[] = []

  for (const item of pendingData.items) {
    const matchedCat = categories.find(c => c.type === 'expense') || categories[0]

    await supabase.from('transactions').insert({
      user_id: userId,
      category_id: matchedCat.id,
      type: 'expense',
      amount: item.amount,
      description: item.description,
      transaction_date: getChileToday(),
      source: pendingData.type,
    })

    lines.push(`🔴 ${item.description}: ${formatCLP(item.amount)}`)
  }

  clearPendingData(chatId)
  const successMsg = `✅ ${pendingData.items.length} transacciones registradas:\n\n${lines.join('\n')}`
  addMessage(chatId, 'assistant', successMsg)
  await sendMessage(chatId, successMsg)
}

async function handleItemExclusion(chatId: number, pendingData: any, excludeIndices: number[]): Promise<void> {
  const remaining = pendingData.items.filter((_: any, i: number) => !excludeIndices.includes(i + 1))
  const newTotal = remaining.reduce((s: number, i: any) => s + i.amount, 0)

  setPendingData(chatId, {
    ...pendingData,
    items: remaining,
    total: newTotal
  })

  const response =
    `✅ Excluidos. Quedan ${remaining.length} items por ${formatCLP(newTotal)}.\n\n` +
    `¿Los subo todos juntos o por separado?\n` +
    `1️⃣ Juntos\n2️⃣ Por separado\n4️⃣ Cancelar`

  addMessage(chatId, 'assistant', response)
  await sendMessage(chatId, response)
}

async function handleFreeConversation(
  chatId: number,
  message: string,
  conv: any,
  userId: string
): Promise<void> {
  const Anthropic = await import('@anthropic-ai/sdk')
  const anthropic = new Anthropic.default({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const supabase = getSupabase()

  // Get user financial context
  const { data: recentTx } = await supabase
    .from('transactions')
    .select('description, amount, type, transaction_date')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .limit(10)

  const systemPrompt = `Eres el asistente financiero de Katana.
Eres conciso, directo y usas emojis moderadamente.
Hablas en español chileno informal.

Contexto del usuario:
- Últimas transacciones: ${JSON.stringify(recentTx?.slice(0, 5))}

Puedes:
- Responder preguntas sobre sus finanzas
- Registrar gastos si te los dicen
- Dar consejos financieros breves
- Ayudar a entender sus patrones de gasto

Responde en máximo 3 oraciones. Si debes registrar
algo, termina con [REGISTRAR: descripción, monto, tipo]`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: conv.messages.slice(-4).map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    })

    const content = response.content[0]
    let botText = content.type === 'text' ? content.text : 'No entendí tu mensaje.'

    // Check if AI wants to register something
    const registerMatch = botText.match(/\[REGISTRAR: (.+), (\d+), (income|expense)\]/)
    if (registerMatch) {
      const [_, desc, amount, type] = registerMatch
      const categories = await getCategories(userId)
      const matchedCat = categories.find(c => c.type === type) || categories[0]

      await supabase.from('transactions').insert({
        user_id: userId,
        category_id: matchedCat.id,
        type: type as 'income' | 'expense',
        amount: parseInt(amount),
        description: desc,
        transaction_date: getChileToday(),
        source: 'manual'
      })

      botText = botText.replace(/\[REGISTRAR:.*?\]/, '').trim() +
        `\n\n✅ Registrado: ${desc} - ${formatCLP(parseInt(amount))}`
    }

    // Clean up any remaining tags
    botText = botText.replace(/\[REGISTRAR:.*?\]/, '').trim()

    addMessage(chatId, 'assistant', botText)
    await sendMessage(chatId, botText)

  } catch (err) {
    console.error('Free conversation error:', err)
    const fallback = '🤔 No entendí bien. ¿Podrías ser más específico?'
    addMessage(chatId, 'assistant', fallback)
    await sendMessage(chatId, fallback)
  }
}

async function handleSmartTransactions(chatId: number, userId: string, transactions: ParsedTransaction[], categories: Category[]): Promise<void> {
  if (transactions.length === 1) {
    // Single transaction - confirm and save directly
    const tx = transactions[0]
    const matchedCat = categories.find(
      c => c.name.toLowerCase().includes(tx.suggested_category.toLowerCase()) && c.type === tx.type
    ) || categories.find(c => c.type === tx.type) || categories[0]

    const supabase = getSupabase()
    await supabase.from('transactions').insert({
      user_id: userId,
      category_id: matchedCat.id,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      transaction_date: tx.date,
      source: 'manual',
    })

    const emoji = tx.type === 'income' ? '🟢' : '🔴'
    const successMsg =
      `✅ ${tx.description}: ${formatCLP(tx.amount)}\n` +
      `📁 ${matchedCat.icon || '💰'} ${matchedCat.name} · ${emoji}\n\n` +
      `_¿Incorrecto? Di "corregir"_`

    addMessage(chatId, 'assistant', successMsg)
    await sendMessage(chatId, successMsg)

  } else if (transactions.length > 1) {
    // Multiple transactions - show confirmation
    const total = transactions.reduce((s, t) => s + t.amount, 0)
    setPendingData(chatId, {
      type: 'manual',
      items: transactions,
      total,
      raw: `${transactions.length} transacciones manuales`
    })

    const itemsList = transactions.map((t, i) =>
      `${i + 1}. ${t.description}: ${formatCLP(t.amount)}`
    ).join('\n')

    const response =
      `📋 Detecté ${transactions.length} transacciones por ${formatCLP(total)}:\n\n` +
      `${itemsList}\n\n` +
      `¿Qué hacemos?\n` +
      `1️⃣ Subir todo junto\n` +
      `2️⃣ Subir por separado\n` +
      `4️⃣ Cancelar`

    addMessage(chatId, 'assistant', response)
    await sendMessage(chatId, response)
  }
}

async function handleCorrectionRequest(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()

  const { data: lastTx } = await supabase
    .from('transactions')
    .select('*, categories(name, icon)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!lastTx) {
    await sendMessage(chatId, "🤷‍♂️ No encuentro transacciones recientes para corregir.")
    return
  }

  const cat = lastTx.categories as any
  const date = new Date(lastTx.transaction_date).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' })

  const response =
    `🔧 Última transacción:\n` +
    `📝 ${lastTx.description}\n` +
    `💰 ${formatCLP(Number(lastTx.amount))}\n` +
    `📁 ${cat?.icon || '💰'} ${cat?.name || 'Sin categoría'}\n` +
    `📅 ${date}\n\n` +
    `¿Qué corrijo?\n` +
    `• "monto 5000"\n` +
    `• "categoría transporte"\n` +
    `• "nombre taxi"\n` +
    `• "borrar"`

  addMessage(chatId, 'assistant', response)
  await sendMessage(chatId, response)
}

async function handleGreeting(chatId: number, userId: string): Promise<void> {
  const supabase = getSupabase()

  // Get today's expenses (Chile time)
  const today = getChileToday()
  const { data: todayTx } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .eq('transaction_date', today)

  const todayTotal = (todayTx || []).reduce((s, t) => s + Number(t.amount), 0)

  const greeting = getChileGreeting()

  const todayMsg = todayTotal > 0
    ? `\n\n💰 Hoy has gastado ${formatCLP(todayTotal)}`
    : '\n\n💰 Aún no has gastado nada hoy'

  const response = `${greeting}${todayMsg}\n\n¿En qué te ayudo?`

  addMessage(chatId, 'assistant', response)
  await sendMessage(chatId, response)
}

function getDefaultExpenseCategory(categories: Category[]): Category | undefined {
  return categories.find(c => c.type === 'expense' && c.name === 'Alimentación') ||
         categories.find(c => c.type === 'expense')
}

async function handleCommand(chatId: number, userId: string, command: string, categories: Category[]): Promise<void> {
  const supabase = getSupabase()

  switch (command) {
    case 'borra_ultimo':
      await handleCorrectionRequest(chatId, userId)
      break

    case 'resumen':
      const now = getChileNow()
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



function getWeekStart(offset: number): string {
  const now = getChileNow()
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
