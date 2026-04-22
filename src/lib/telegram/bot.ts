const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    })
    const data = await res.json()
    return data?.result?.message_id ?? null
  } catch {
    return null
  }
}

/**
 * Show "Katana is typing..." in Telegram. Lasts ~5s or until next message.
 * Use before slow operations (Gemini calls) to reassure the user.
 */
export async function sendTypingAction(chatId: number): Promise<void> {
  try {
    await fetch(`${BASE_URL}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
    })
  } catch {
    // Silent fail - this is non-critical UX
  }
}

/**
 * Edit an existing message. Useful to replace "Procesando..." with the actual response.
 */
export async function editMessage(chatId: number, messageId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<void> {
  try {
    await fetch(`${BASE_URL}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: parseMode,
      }),
    })
  } catch {
    // Silent fail
  }
}

/**
 * Delete a message. Use to remove "Procesando..." placeholder if a fresh reply follows.
 */
export async function deleteMessage(chatId: number, messageId: number): Promise<void> {
  try {
    await fetch(`${BASE_URL}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    })
  } catch {
    // Silent fail
  }
}

export async function getFile(fileId: string): Promise<Buffer> {
  const res = await fetch(`${BASE_URL}/getFile?file_id=${fileId}`)
  const data = await res.json()
  const filePath = data.result.file_path
  const fileRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`)
  return Buffer.from(await fileRes.arrayBuffer())
}

export interface TelegramUpdate {
  message?: {
    message_id: number
    from: {
      id: number
      username?: string
      first_name?: string
    }
    chat: {
      id: number
    }
    text?: string
    photo?: { file_id: string; file_size: number }[]
    document?: {
      file_id: string
      file_name: string
      mime_type: string
    }
  }
}
