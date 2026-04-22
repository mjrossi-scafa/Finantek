interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ConversationState {
  messages: Message[]
  pendingData?: {
    type: 'receipt' | 'manual' | 'correction'
    items?: any[]
    total?: number
    raw?: string
    transactionId?: string
  }
  lastActivity: number
}

const conversations = new Map<number, ConversationState>()
const CONTEXT_EXPIRY = 10 * 60 * 1000  // 10 minutos
const MAX_MESSAGES = 6  // máximo 3 pares usuario/bot

export function getConversation(chatId: number): ConversationState {
  const conv = conversations.get(chatId)

  if (!conv || Date.now() - conv.lastActivity > CONTEXT_EXPIRY) {
    const fresh: ConversationState = {
      messages: [],
      lastActivity: Date.now(),
    }
    conversations.set(chatId, fresh)
    return fresh
  }

  return conv
}

export function addMessage(
  chatId: number,
  role: 'user' | 'assistant',
  content: string
) {
  const conv = getConversation(chatId)
  conv.messages.push({ role, content, timestamp: Date.now() })

  // Mantener solo los últimos MAX_MESSAGES
  if (conv.messages.length > MAX_MESSAGES) {
    conv.messages = conv.messages.slice(-MAX_MESSAGES)
  }

  conv.lastActivity = Date.now()
  conversations.set(chatId, conv)
}

export function setPendingData(chatId: number, data: ConversationState['pendingData']) {
  const conv = getConversation(chatId)
  conv.pendingData = data
  conv.lastActivity = Date.now()
  conversations.set(chatId, conv)
}

export function clearPendingData(chatId: number) {
  const conv = getConversation(chatId)
  delete conv.pendingData
  conversations.set(chatId, conv)
}

export function clearConversation(chatId: number) {
  conversations.delete(chatId)
}