import { NextResponse } from 'next/server'
import { POST as handleWebhook } from '../webhook/route'
import { NextRequest } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

let lastUpdateId = 0

export async function GET() {
  try {
    const res = await fetch(`${BASE_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=0`)
    const data = await res.json()

    if (!data.ok || !data.result?.length) {
      return NextResponse.json({ processed: 0 })
    }

    let processed = 0
    for (const update of data.result) {
      lastUpdateId = update.update_id

      // Create a fake NextRequest to reuse the webhook handler
      const fakeReq = new NextRequest('http://localhost:3000/api/telegram/webhook', {
        method: 'POST',
        body: JSON.stringify(update),
        headers: { 'Content-Type': 'application/json' },
      })

      await handleWebhook(fakeReq)
      processed++
    }

    return NextResponse.json({ processed, lastUpdateId })
  } catch (err) {
    console.error('Poll error:', err)
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 })
  }
}
