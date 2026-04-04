import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { Category, ExtractedTransaction } from '@/types/database'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ExtractedTransactionSchema = z.object({
  date: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  type: z.enum(['income', 'expense']),
  suggested_category: z.string(),
  confidence: z.number().min(0).max(1),
})

const ReceiptResponseSchema = z.object({
  transactions: z.array(ExtractedTransactionSchema),
  document_type: z.string(),
  currency_detected: z.string().optional(),
  extraction_notes: z.string().optional(),
})

const SYSTEM_PROMPT = `Eres un asistente especializado en extraer transacciones financieras de recibos, boletas, facturas y estados de cuenta bancarios chilenos. Tu tarea es identificar todas las transacciones presentes en el documento y devolverlas en formato JSON estricto. Siempre responde ÚNICAMENTE con JSON válido, sin texto adicional, sin bloques de código markdown.`

const USER_PROMPT = `Analiza este documento financiero e identifica todas las transacciones.
Para cada transacción, extrae:
- date: fecha en formato YYYY-MM-DD (si no hay año, usa el año actual ${new Date().getFullYear()})
- amount: número entero en pesos chilenos sin puntos ni comas (ej: 12500)
- description: texto breve descriptivo de la transacción
- type: "expense" si es un pago/débito/cargo/compra, "income" si es un depósito/abono/ingreso
- suggested_category: una de estas opciones exactamente: Alimentación, Transporte, Entretenimiento, Salud, Educación, Hogar, Ropa, Otros Gastos, Sueldo, Freelance, Inversiones, Otros Ingresos
- confidence: número entre 0 y 1 indicando confianza en la extracción

Responde con este JSON exacto:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "amount": 12500,
      "description": "descripción breve",
      "type": "expense",
      "suggested_category": "Alimentación",
      "confidence": 0.95
    }
  ],
  "document_type": "boleta|factura|estado_de_cuenta|recibo|otro",
  "currency_detected": "CLP",
  "extraction_notes": "notas opcionales"
}`

export async function parseReceipt(
  fileData: Buffer,
  fileType: string,
  categories: Category[]
): Promise<{ transactions: ExtractedTransaction[]; raw: unknown; error?: string }> {
  const base64Data = fileData.toString('base64')

  let content: Anthropic.MessageParam['content']

  if (fileType === 'application/pdf') {
    content = [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      } as Anthropic.DocumentBlockParam,
      { type: 'text', text: USER_PROMPT },
    ]
  } else {
    const mediaType = fileType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    content = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      },
      { type: 'text', text: USER_PROMPT },
    ]
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

  // Strip markdown code fences if present
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: z.infer<typeof ReceiptResponseSchema>
  try {
    parsed = ReceiptResponseSchema.parse(JSON.parse(jsonText))
  } catch {
    return {
      transactions: [],
      raw: rawText,
      error: `No se pudo parsear la respuesta del modelo: ${rawText.slice(0, 200)}`,
    }
  }

  // Map suggested_category names to actual category IDs
  const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c]))

  const transactions: ExtractedTransaction[] = parsed.transactions.map((t) => {
    const matchedCategory = categoryMap.get(t.suggested_category.toLowerCase())
    return {
      ...t,
      category_id: matchedCategory?.id,
      needs_review: t.confidence < 0.7 || !matchedCategory,
    }
  })

  return { transactions, raw: parsed }
}
