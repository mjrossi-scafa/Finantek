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

async function getMessage9h(userId: string): Promise<string> {
  try {
    const ctx = await getUserFinancialContext(userId)
    const now = getChileNow()
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

export async function GET(request: Request) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
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
        // Verificar si AYER no tuvo NINGÚN movimiento
        const { data: yesterdayTxs } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('transaction_date', yesterday)

        if (!yesterdayTxs || yesterdayTxs.length === 0) {
          const message = await getMessage9h(user.user_id)
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

    console.log(`Reminder 9h: ${sent} sent, ${skipped} skipped`)
    return NextResponse.json({ ok: true, reminderType: '9h', sent, skipped })

  } catch (err) {
    console.error('Reminder error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}