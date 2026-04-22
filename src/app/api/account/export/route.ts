import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('transaction_date, type, amount, description, notes, source, categories(name)')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const header = ['Fecha', 'Tipo', 'Monto', 'Descripción', 'Notas', 'Categoría', 'Origen'].join(',')
  const rows = (transactions ?? []).map((t) => {
    const cat = Array.isArray(t.categories) ? t.categories[0] : t.categories
    const escape = (v: unknown) => {
      const s = String(v ?? '')
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    return [
      t.transaction_date,
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount,
      escape(t.description ?? ''),
      escape(t.notes ?? ''),
      escape(cat?.name ?? ''),
      t.source,
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')
  const filename = `katana-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
