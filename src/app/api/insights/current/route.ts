import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentWeekBounds } from '@/lib/utils/dates'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Obtener el insight más reciente
  const { data: insight, error } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Verificar si el insight es de esta semana
  const { start: currentWeekStart } = getCurrentWeekBounds()
  const isThisWeek = insight ? insight.week_start === currentWeekStart : false

  // Intentar parsear JSON si existe
  let parsedInsight = null
  if (insight && insight.insight_text) {
    try {
      const parsed = JSON.parse(insight.insight_text)
      if (parsed.resumen && parsed.puntos && parsed.motivacion) {
        parsedInsight = parsed
      }
    } catch {
      // Fallback a texto plano
      parsedInsight = null
    }
  }

  return NextResponse.json({
    insight: insight || null,
    isThisWeek,
    parsed: parsedInsight
  })
}