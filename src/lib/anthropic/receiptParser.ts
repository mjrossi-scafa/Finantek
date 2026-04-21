// Migrated from Anthropic to Google Gemini Vision API
import { z } from 'zod'
import { Category, ExtractedTransaction } from '@/types/database'

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

const PROMPT = `Eres un asistente especializado en extraer transacciones financieras de recibos, boletas, facturas y estados de cuenta bancarios chilenos.

Analiza este documento financiero e identifica TODAS las transacciones presentes.

Para cada transacción, extrae:
- date: fecha en formato YYYY-MM-DD (si no hay año, usa ${new Date().getFullYear()})
- amount: número entero en pesos chilenos sin puntos ni comas (ej: 12500)
- description: texto breve descriptivo
- type: "expense" si es pago/débito/cargo/compra, "income" si es depósito/abono/ingreso
- suggested_category: una de estas opciones exactamente: Alimentación, Transporte, Entretenimiento, Salud, Educación, Hogar, Ropa, Otros Gastos, Sueldo, Freelance, Inversiones, Otros Ingresos
- confidence: número entre 0 y 1

Responde ÚNICAMENTE con este JSON (sin markdown, sin explicación adicional):
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

  // Build Gemini request with multimodal content
  const geminiRequest = {
    contents: [{
      parts: [
        { text: PROMPT },
        {
          inline_data: {
            mime_type: fileType,
            data: base64Data,
          },
        },
      ],
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  }

  let rawText = ''

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequest),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return {
        transactions: [],
        raw: errorText,
        error: `Gemini API error (${response.status}): ${errorText.slice(0, 200)}`,
      }
    }

    const data = await response.json()
    rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (err) {
    return {
      transactions: [],
      raw: (err as Error).message,
      error: `Error llamando a Gemini: ${(err as Error).message}`,
    }
  }

  // Strip markdown code fences if present (Gemini usually returns clean JSON with responseMimeType)
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
