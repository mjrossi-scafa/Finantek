import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMessage, getFile, TelegramUpdate } from '@/lib/telegram/bot'
import { parseMessage } from '@/lib/telegram/parser'
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

      // Auto-register all extracted transactions
      const supabase = getSupabase()
      let registered = 0
      const lines: string[] = []

      for (const t of result.transactions) {
        const catId = t.category_id || categories.find(c => c.type === t.type)?.id
        if (!catId) continue

        await supabase.from('transactions').insert({
          user_id: userId,
          category_id: catId,
          type: t.type,
          amount: t.amount,
          description: t.description,
          transaction_date: t.date,
          source: 'receipt',
        })
        registered++
        const emoji = t.type === 'income' ? '💚' : '🔴'
        lines.push(`${emoji} ${t.description}: ${formatCLP(t.amount)}`)
      }

      await sendMessage(chatId, `✅ ${registered} transacciones registradas desde el recibo:\n\n${lines.join('\n')}`)
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

      const supabase = getSupabase()
      let registered = 0
      const lines: string[] = []

      for (const t of result.transactions) {
        const catId = t.category_id || categories.find(c => c.type === t.type)?.id
        if (!catId) continue

        await supabase.from('transactions').insert({
          user_id: userId,
          category_id: catId,
          type: t.type,
          amount: t.amount,
          description: t.description,
          transaction_date: t.date,
          source: 'pdf',
        })
        registered++
        const emoji = t.type === 'income' ? '💚' : '🔴'
        lines.push(`${emoji} ${t.description}: ${formatCLP(t.amount)}`)
      }

      await sendMessage(chatId, `✅ ${registered} transacciones registradas desde el PDF:\n\n${lines.join('\n')}`)
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
      `<b>📖 Comandos disponibles:</b>\n\n` +
      `<b>Registrar gasto:</b> Escribe la descripción y monto\n` +
      `Ej: "Almuerzo 8500", "Uber 3200", "Netflix 7500"\n\n` +
      `<b>Registrar ingreso:</b> Incluye "ingreso" o "sueldo"\n` +
      `Ej: "Ingreso sueldo 1500000", "Me pagaron freelance 200000"\n\n` +
      `<b>Varios a la vez:</b> "Café 2500 y pan 1500"\n\n` +
      `<b>📸 Foto de boleta:</b> Envía la imagen y la proceso automáticamente\n\n` +
      `<b>📊 Resumen:</b> "resumen" o "cuánto llevo"\n` +
      `<b>💡 Insights:</b> "insights" o "cómo voy"\n` +
      `<b>🌐 Dashboard:</b> "dashboard" o "web"`
    )
    return NextResponse.json({ ok: true })
  }

  // Parse with AI
  try {
    const parsed = await parseMessage(text)

    if (parsed.action === 'transaction' && parsed.transactions && parsed.transactions.length > 0) {
      const supabase = getSupabase()
      const lines: string[] = []

      for (const t of parsed.transactions) {
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

      await sendMessage(chatId, `✅ Registrado:\n\n${lines.join('\n')}`)

    } else if (parsed.action === 'summary') {
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
        `<b>📊 Resumen de ${months[month - 1]} ${year}:</b>\n\n` +
        `💚 Ingresos: ${formatCLP(income)}\n` +
        `🔴 Gastos: ${formatCLP(expense)}\n` +
        `${balance >= 0 ? '💙' : '⚠️'} Balance: ${formatCLP(balance)}\n\n` +
        `📈 Ve los gráficos completos en el dashboard.`
      )

    } else if (parsed.action === 'insights') {
      await sendMessage(chatId, '💡 Generando análisis...')
      const supabase = getSupabase()

      // Get weekly comparison data using raw SQL since we can't use RPC without user context
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

      const insightText = await generateWeeklyInsight(
        weeklyComparison, weeklyComparison,
        thisWeekTotal, lastWeekTotal,
        []
      )

      await sendMessage(chatId, `💡 <b>Insight semanal:</b>\n\n${insightText}`)

    } else if (parsed.action === 'dashboard') {
      const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      await sendMessage(chatId, `🌐 Abre tu dashboard aquí:\n${url}/dashboard`)

    } else {
      await sendMessage(chatId, '🤔 No entendí. Intenta con algo como "Almuerzo 8500" o escribe "ayuda" para ver los comandos.')
    }
  } catch (err) {
    console.error('Telegram webhook error:', err)
    await sendMessage(chatId, '❌ Hubo un error procesando tu mensaje. Intenta de nuevo.')
  }

  return NextResponse.json({ ok: true })
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
