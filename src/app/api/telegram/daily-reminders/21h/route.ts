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

async function getMessage21h(userId: string): Promise<string> {
  try {
    const ctx = await getUserFinancialContext(userId)
    const now = getChileNow()
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isEndOfMonth = ctx.daysLeft <= 5

    if (isEndOfMonth) {
      return (
        `🌙 Buenas noches.\n\n` +
        `Quedan ${ctx.daysLeft} días del mes y hoy no registraste nada. ` +
        `Llevas $${ctx.currentMonth.expense.toLocaleString('es-CL')} en gastos.\n\n` +
        `¿Tuviste gastos hoy?`
      )
    }

    if (ctx.currentMonth.balance < 0) {
      return (
        `🌙 Buenas noches.\n\n` +
        `Cierra el día con orden — el mes va negativo. ` +
        `¿Qué gastaste hoy?`
      )
    }

    if (isWeekend) {
      return (
        `🌙 Buenas noches.\n\n` +
        `${dayOfWeek === 6 ? 'Sábado' : 'Domingo'} sin registro. ` +
        `Si tuviste gastos hoy, es buen momento para anotarlos antes de dormir.\n\n` +
        `¿Qué gastaste hoy?`
      )
    }

    const messages = [
      `🌙 Buenas noches.\n\nDía sin registro. El samurai no duerme sin cerrar sus cuentas.\n\n¿Tuviste gastos hoy?`,
      `🌙 Buenas noches.\n\nAntes de dormir — ¿hubo algún gasto hoy? Escríbemelo y lo registro.`,
      `🌙 Buenas noches.\n\nUn día sin registro es un punto ciego en tus finanzas. ¿Qué gastaste hoy?`,
      `🌙 Buenas noches.\n\nEl guerrero cierra el día con sus cuentas en orden. ¿Algo que registrar de hoy?`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } catch {
    return `🌙 Buenas noches.\n\nDía sin registro. ¿Tuviste gastos hoy? Escríbeme y lo anoto.`
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
          const message = await getMessage21h(user.user_id)
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

    console.log(`Reminder 21h: ${sent} sent, ${skipped} skipped`)
    return NextResponse.json({ ok: true, reminderType: '21h', sent, skipped })

  } catch (err) {
    console.error('Reminder error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}