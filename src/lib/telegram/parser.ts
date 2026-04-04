import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ParsedTransaction {
  type: 'income' | 'expense'
  amount: number
  description: string
  suggested_category: string
  date: string
}

interface ParseResult {
  action: 'transaction' | 'summary' | 'insights' | 'dashboard' | 'help' | 'unknown'
  transactions?: ParsedTransaction[]
  message?: string
}

const SYSTEM_PROMPT = `Eres un asistente financiero en un bot de Telegram. Tu trabajo es interpretar mensajes del usuario y determinar qué acción quiere realizar.

Las acciones posibles son:
1. "transaction" - El usuario quiere registrar un gasto o ingreso
2. "summary" - El usuario quiere ver un resumen (palabras como "resumen", "cuánto llevo", "total", "balance")
3. "insights" - El usuario quiere un análisis inteligente (palabras como "insight", "análisis", "cómo voy", "consejo")
4. "dashboard" - El usuario quiere el link al dashboard (palabras como "dashboard", "web", "ver gráficos", "sitio")
5. "help" - El usuario pide ayuda (palabras como "ayuda", "help", "cómo funciona", "comandos")
6. "unknown" - No puedes determinar la intención

Para transacciones, extrae: tipo (expense por defecto, income si dice "ingreso", "sueldo", "me pagaron", "recibí"), monto en CLP (número entero), descripción corta, y categoría sugerida de esta lista exacta: Alimentación, Transporte, Entretenimiento, Salud, Educación, Hogar, Ropa, Otros Gastos, Sueldo, Freelance, Inversiones, Otros Ingresos.

El usuario puede enviar múltiples transacciones en un mensaje. Ejemplos:
- "Almuerzo 8500" → expense, 8500, Almuerzo, Alimentación
- "Uber 3200" → expense, 3200, Uber, Transporte
- "Me pagaron el sueldo 1200000" → income, 1200000, Sueldo mensual, Sueldo
- "Café 2500 y pan 1500" → dos transacciones

Responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "action": "transaction|summary|insights|dashboard|help|unknown",
  "transactions": [{"type":"expense","amount":8500,"description":"Almuerzo","suggested_category":"Alimentación","date":"YYYY-MM-DD"}],
  "message": "texto opcional para respuestas no-transacción"
}`

export async function parseMessage(text: string): Promise<ParseResult> {
  const today = new Date().toISOString().split('T')[0]

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Fecha de hoy: ${today}\nMensaje del usuario: ${text}`,
    }],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(jsonText) as ParseResult
  } catch {
    return { action: 'unknown' }
  }
}
