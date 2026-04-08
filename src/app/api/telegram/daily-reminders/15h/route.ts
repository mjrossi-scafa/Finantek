import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMessage } from '@/lib/telegram/bot'
import { getChileToday, getChileNow } from '@/lib/utils/timezone'
import { getUserFinancialContext } from '@/lib/telegram/financialContext'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function isValidCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

async function getMessage15h(userId: string): Promise<string> {
  try {
    const ctx = await getUserFinancialContext(userId)
    const now = getChileNow()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (ctx.currentMonth.balance < 0 && ctx.monthProgress > 60) {
      return (
        `⚔️ Son las 3 PM y sin registro.\n\n` +
        `El mes va en negativo. ` +
        `Cada gasto sin anotar suma al descontrol.\n\n` +
        `¿Qué gastaste esta mañana?`
      )
    }

    if (isWeekend) {
      return (
        `🗡️ Tarde de ${dayOfWeek === 6 ? 'sábado' : 'domingo'} sin registro.\n\n` +
        `Los fines de semana son los más fáciles de olvidar. ` +
        `¿Tuviste gastos hoy?`
      )
    }

    const messages = [
      `⚔️ Mitad del día sin registro.\n\n¿Almorzaste? ¿Transporte? Anótalo antes de olvidarlo.`,
      `🗡️ Son las 3 PM. Sin movimientos hoy.\n\nEl guerrero registra en caliente. ¿Qué gastaste esta mañana?`,
      `⚔️ Día avanzado sin registro.\n\n¿Hubo gastos esta mañana? Escríbeme y lo anoto.`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } catch {
    return `⚔️ Mitad del día sin registro. ¿Qué gastaste hoy? Escríbeme y lo anoto.`
  }
}

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const today = getChileToday()

  try {
    const { data: users } = await supabase
      .from('telegram_users')
      .select('telegram_chat_id, user_id')
      .not('telegram_chat_id', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    let sent = 0
    let skipped = 0

    for (const user of users) {
      try {
        // Verificar si hay gastos HOY
        const { data: todayTxs } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('transaction_date', today)

        if (!todayTxs || todayTxs.length === 0) {
          const message = await getMessage15h(user.user_id)
          await sendMessage(user.telegram_chat_id, message)
          sent++
          await new Promise(resolve => setTimeout(resolve, 150))
        } else {
          skipped++
        }

      } catch (err) {
        console.error(`Error for user ${user.user_id}:`, err)
      }
    }

    console.log(`Reminder 15h: ${sent} sent, ${skipped} skipped`)
    return NextResponse.json({ ok: true, reminderType: '15h', sent, skipped })

  } catch (err) {
    console.error('Reminder error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}