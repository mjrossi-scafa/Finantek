// Using Google Gemini API instead of Anthropic

export interface ParsedTransaction {
  type: 'income' | 'expense'
  amount: number
  description: string
  suggested_category: string
  date: string
}

export interface ParsedQuestion {
  queryType: 'today' | 'week' | 'month' | 'category' | 'last_transaction' | 'search' | 'balance'
  query?: string
  category?: string
}

interface ParseResult {
  action: 'transaction' | 'question' | 'command' | 'greeting' | 'confirmation' | 'cancellation' | 'unknown'
  transactions?: ParsedTransaction[]
  question?: ParsedQuestion
  command?: string
  confirmationType?: string
  message?: string
}

const SYSTEM_PROMPT = `Analiza este mensaje de finanzas personales y responde SOLO con JSON.

EJEMPLOS:
"1500 restaurant" → {"action":"transaction","transactions":[{"type":"expense","amount":1500,"description":"restaurant","suggested_category":"Alimentación","date":"2026-04-21"}]}
"almuerzo 2500" → {"action":"transaction","transactions":[{"type":"expense","amount":2500,"description":"almuerzo","suggested_category":"Alimentación","date":"2026-04-21"}]}
"sueldo 500000" → {"action":"transaction","transactions":[{"type":"income","amount":500000,"description":"sueldo","suggested_category":"Sueldo","date":"2026-04-21"}]}
"cuánto gasté hoy" → {"action":"question","question":{"queryType":"today"}}
"hola" → {"action":"greeting"}

TIPOS:
- transaction: cualquier gasto o ingreso con número
- question: preguntas sobre dinero
- greeting: saludos
- unknown: todo lo demás

CATEGORÍAS GASTOS: Alimentación, Transporte, Entretenimiento, Salud, Educación, Hogar, Ropa, Otros Gastos
CATEGORÍAS INGRESOS: Sueldo, Freelance, Inversiones, Otros Ingresos

Responde SOLO JSON válido:`

export async function parseMessage(text: string): Promise<ParseResult> {
  const today = new Date().toISOString().split('T')[0]
  const cleanText = text.trim().toLowerCase()

  // Quick pattern matching for simple cases
  const greetings = ['hola', 'buenas', 'hey', 'buenos días', 'buenas tardes', 'buenas noches', 'hi', 'hello']
  if (greetings.some(g => cleanText.includes(g))) {
    return { action: 'greeting' }
  }

  // Simple confirmations
  if (['sí', 'si', 'ok', 'confirmo', 'dale', 'yes'].includes(cleanText)) {
    return { action: 'confirmation', confirmationType: 'boolean' }
  }

  // Numeric confirmations
  if (['1', '2', '3'].includes(cleanText)) {
    return { action: 'confirmation', confirmationType: 'numeric' }
  }

  // Cancellations
  if (['no', 'cancelar', 'salir', 'cancel'].includes(cleanText)) {
    return { action: 'cancellation' }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${SYSTEM_PROMPT}\n\nFecha de hoy: ${today}\nMensaje del usuario: ${text}`
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    return JSON.parse(jsonText) as ParseResult
  } catch (error) {
    console.error('Parser error:', error)
    return { action: 'unknown' }
  }
}
