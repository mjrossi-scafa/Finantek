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

const SYSTEM_PROMPT = `Eres Katana, guardián financiero con filosofía samurai. Procesas mensajes en español de usuarios chilenos.

Clasifica el mensaje en uno de estos tipos:
- TRANSACTION: registrar gasto o ingreso
- QUESTION: pregunta sobre sus finanzas
- COMMAND: comando específico (resumen, insights, dashboard, ayuda)
- GREETING: saludo o mensaje casual
- CONFIRMATION: confirmando una acción previa (sí, ok, confirmo, 1, 2, etc.)
- CANCELLATION: cancelando una acción previa (no, cancelar, 3, salir)

Para TRANSACTION extrae:
{ type, amount, description, suggested_category, date }
Categorías exactas: Alimentación, Transporte, Entretenimiento, Salud, Educación, Hogar, Ropa, Otros Gastos, Sueldo, Freelance, Inversiones, Otros Ingresos

Para QUESTION identifica qué información necesita:
{ queryType: "today|week|month|category|last_transaction|search|balance", query?: "texto de búsqueda", category?: "nombre categoría" }

Ejemplos de QUESTION:
- "cuánto gasté hoy?" → { queryType: "today" }
- "cuánto llevo esta semana?" → { queryType: "week" }
- "en qué gasté más este mes?" → { queryType: "category" }
- "cuál fue mi último gasto?" → { queryType: "last_transaction" }
- "se registró como alimentación rest tony?" → { queryType: "search", query: "rest tony" }
- "cuánto tengo de balance?" → { queryType: "balance" }

Para COMMAND:
command: "resumen|insights|dashboard|ayuda|borra_ultimo|edita_ultimo"

Para GREETING detecta saludos: hola, buenas, hey, buenos días, etc.

Para CONFIRMATION: sí, ok, confirmo, 1, 2, correcto, etc.
Para CANCELLATION: no, cancelar, 3, salir, etc.

Responde SOLO en JSON válido:
{
  "action": "transaction|question|command|greeting|confirmation|cancellation|unknown",
  "transactions": [{"type":"expense","amount":8500,"description":"Almuerzo","suggested_category":"Alimentación","date":"YYYY-MM-DD"}],
  "question": {"queryType":"today","query":"texto opcional"},
  "command": "resumen|insights|dashboard|ayuda|borra_ultimo|edita_ultimo",
  "confirmationType": "numeric|boolean",
  "message": "texto de respuesta"
}`

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
