const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  })
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
