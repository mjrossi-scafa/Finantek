import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })

  // Create receipt record first to get the ID
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert({
      user_id: user.id,
      file_path: '', // will update after upload
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      status: 'pending',
    })
    .select()
    .single()

  if (receiptError) {
    return NextResponse.json({ error: receiptError.message }, { status: 500 })
  }

  // Upload to Supabase Storage
  const filePath = `${user.id}/${receipt.id}/${file.name}`
  const fileBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, fileBuffer, { contentType: file.type })

  if (uploadError) {
    await supabase.from('receipts').delete().eq('id', receipt.id)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Update receipt with the actual file path
  await supabase
    .from('receipts')
    .update({ file_path: filePath })
    .eq('id', receipt.id)

  return NextResponse.json({ receiptId: receipt.id })
}
