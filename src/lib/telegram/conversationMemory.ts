import { createClient } from '@supabase/supabase-js'

// Conversation state for the Telegram bot, persisted in Supabase because
// Vercel serverless functions don't keep a stable in-memory Map between
// invocations — losing `pendingData` between the receipt summary and the
// user's follow-up ("subir todo junto") was dropping uploads into the
// free-chat fallback with no DB insert.

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PendingData {
  type: 'receipt' | 'manual' | 'correction'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[]
  total?: number
  raw?: string
  transactionId?: string
}

export interface ConversationState {
  messages: Message[]
  pendingData?: PendingData
  lastActivity: number
}

const CONTEXT_EXPIRY_MS = 10 * 60 * 1000
const MAX_MESSAGES = 6

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function expiresAt(): string {
  return new Date(Date.now() + CONTEXT_EXPIRY_MS).toISOString()
}

export async function getConversation(chatId: number): Promise<ConversationState> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('telegram_conversations')
    .select('messages, pending_data, last_activity, expires_at')
    .eq('chat_id', chatId)
    .maybeSingle()

  if (!data || new Date(data.expires_at).getTime() < Date.now()) {
    return { messages: [], lastActivity: Date.now() }
  }

  return {
    messages: (data.messages ?? []) as Message[],
    pendingData: (data.pending_data ?? undefined) as PendingData | undefined,
    lastActivity: new Date(data.last_activity).getTime(),
  }
}

// Supabase's upsert only SETs the columns provided on ON CONFLICT UPDATE,
// so partial writes below preserve the other JSONB fields. On first INSERT
// the table defaults fill in whatever we omit.

export async function addMessage(
  chatId: number,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const supabase = getSupabase()
  const current = await getConversation(chatId)
  const messages = [
    ...current.messages,
    { role, content, timestamp: Date.now() },
  ].slice(-MAX_MESSAGES)

  await supabase.from('telegram_conversations').upsert(
    {
      chat_id: chatId,
      messages,
      last_activity: new Date().toISOString(),
      expires_at: expiresAt(),
    },
    { onConflict: 'chat_id' }
  )
}

export async function setPendingData(
  chatId: number,
  data: PendingData
): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('telegram_conversations').upsert(
    {
      chat_id: chatId,
      pending_data: data,
      last_activity: new Date().toISOString(),
      expires_at: expiresAt(),
    },
    { onConflict: 'chat_id' }
  )
}

export async function clearPendingData(chatId: number): Promise<void> {
  const supabase = getSupabase()
  await supabase
    .from('telegram_conversations')
    .update({
      pending_data: null,
      last_activity: new Date().toISOString(),
      expires_at: expiresAt(),
    })
    .eq('chat_id', chatId)
}

export async function clearConversation(chatId: number): Promise<void> {
  const supabase = getSupabase()
  await supabase.from('telegram_conversations').delete().eq('chat_id', chatId)
}
