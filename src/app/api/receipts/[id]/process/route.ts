import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseReceipt } from '@/lib/anthropic/receiptParser'
import { Category } from '@/types/database'

export const maxDuration = 30

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Get receipt record
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (receiptError || !receipt) {
    return NextResponse.json({ error: 'Recibo no encontrado' }, { status: 404 })
  }

  if (receipt.status !== 'pending') {
    return NextResponse.json({ error: 'El recibo ya fue procesado' }, { status: 400 })
  }

  // Update status to processing
  await supabase.from('receipts').update({ status: 'processing' }).eq('id', id)

  try {
    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('receipts')
      .download(receipt.file_path)

    if (downloadError || !fileData) {
      throw new Error(`Error al descargar archivo: ${downloadError?.message}`)
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer())

    // Get user's categories for mapping
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)

    const result = await parseReceipt(fileBuffer, receipt.file_type, (categories ?? []) as Category[])

    if (result.error) {
      await supabase.from('receipts').update({
        status: 'failed',
        error_message: result.error,
        raw_response: result.raw,
        processed_at: new Date().toISOString(),
      }).eq('id', id)
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    await supabase.from('receipts').update({
      status: 'completed',
      extracted_data: result.transactions,
      raw_response: result.raw,
      processed_at: new Date().toISOString(),
    }).eq('id', id)

    return NextResponse.json({ success: true, count: result.transactions.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    await supabase.from('receipts').update({
      status: 'failed',
      error_message: message,
      processed_at: new Date().toISOString(),
    }).eq('id', id)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
