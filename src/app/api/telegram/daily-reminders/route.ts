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

// Obtener fecha de ayer en Chile
function getChileYesterday(): string {
  const now = getChileNow()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// ─── MENSAJES ──────────────────────────────────────────

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

async function getMessage9h(userId: string): Promise<string> {
  try {
    const ctx = await getUserFinancialContext(userId)
    const now = getChileNow()
    const yesterday = getChileYesterday()
    const dayNames = ['domingo','lunes','martes','miércoles',
                      'jueves','viernes','sábado']
    const yesterdayName = dayNames[
      (now.getDay() === 0 ? 6 : now.getDay() - 1)
    ]

    if (ctx.currentMonth.balance < 0) {
      return (
        `☀️ Buenos días.\n\n` +
        `El ${yesterdayName} quedó sin registrar. ` +
        `El mes va negativo — cada día sin datos dificulta el control.\n\n` +
        `¿Tuviste gastos o ingresos ayer?`
      )
    }

    const messages = [
      `☀️ Buenos días.\n\nEl ${yesterdayName} quedó sin registrar. Si tuviste gastos o ingresos ayer, aún puedes anotarlos.\n\n¿Qué pasó ayer?`,
      `☀️ Buenos días.\n\nNuevo día, nueva oportunidad. El ${yesterdayName} no tuvo registros — ¿hubo algo que agregar?`,
      `☀️ Buenos días.\n\nAntes de arrancar el día — ¿tuviste gastos ayer que no registraste?`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } catch {
    return `☀️ Buenos días.\n\nAyer quedó sin registrar. ¿Tuviste gastos o ingresos? Aún puedes anotarlos.`
  }
}

// ─── HANDLER PRINCIPAL ─────────────────────────────────

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Detectar qué recordatorio es según la hora UTC actual
  // 15:00 Chile invierno (UTC-3) = 18:00 UTC
  // 15:00 Chile verano  (UTC-4) = 19:00 UTC
  // 21:00 Chile invierno        = 00:00 UTC (día siguiente)
  // 21:00 Chile verano          = 01:00 UTC (día siguiente)
  // 09:00 Chile invierno        = 12:00 UTC
  // 09:00 Chile verano          = 13:00 UTC

  const utcHour = new Date().getUTCHours()
  const reminderType = request.headers.get('x-reminder-type') ||
    (utcHour >= 18 && utcHour <= 19 ? '15h' :
     utcHour >= 0  && utcHour <= 1  ? '21h' :
     utcHour >= 12 && utcHour <= 13 ? '9h'  : 'unknown')

  const supabase = getSupabase()
  const today = getChileToday()
  const yesterday = getChileYesterday()

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
        let shouldSend = false
        let message = ''

        if (reminderType === '15h' || reminderType === '21h') {
          // Verificar si hay gastos HOY
          const { data: todayTxs } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('transaction_date', today)

          if (!todayTxs || todayTxs.length === 0) {
            shouldSend = true
            message = reminderType === '15h'
              ? await getMessage15h(user.user_id)
              : await getMessage21h(user.user_id)
          }

        } else if (reminderType === '9h') {
          // Verificar si AYER no tuvo NINGÚN movimiento
          const { data: yesterdayTxs } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('transaction_date', yesterday)

          if (!yesterdayTxs || yesterdayTxs.length === 0) {
            shouldSend = true
            message = await getMessage9h(user.user_id)
          }
        }

        if (shouldSend && message) {
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

    console.log(`Reminder ${reminderType}: ${sent} sent, ${skipped} skipped`)
    return NextResponse.json({ ok: true, reminderType, sent, skipped })

  } catch (err) {
    console.error('Reminder error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}