import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { transactions } = await request.json()

  // Insert all confirmed transactions
  const toInsert = transactions.map((t: {
    category_id: string
    type: 'income' | 'expense'
    amount: number
    description?: string
    date: string
  }) => ({
    user_id: user.id,
    category_id: t.category_id,
    type: t.type,
    amount: t.amount,
    description: t.description || null,
    transaction_date: t.date,
    source: 'receipt',
    receipt_id: id,
  }))

  const { error: insertError } = await supabase.from('transactions').insert(toInsert)
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  await supabase
    .from('receipts')
    .update({ status: 'completed' })
    .eq('id', id)

  return NextResponse.json({ success: true, count: toInsert.length })
}
