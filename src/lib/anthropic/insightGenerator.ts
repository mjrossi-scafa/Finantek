// Migrated from Anthropic to Google Gemini
import { WeeklyComparison } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'

interface BudgetContext {
  categoryName: string
  limit: number
  spent: number
}

export async function generateWeeklyInsight(
  thisWeek: WeeklyComparison[],
  lastWeek: WeeklyComparison[],
  thisWeekTotal: number,
  lastWeekTotal: number,
  budgets: BudgetContext[]
): Promise<string> {
  const thisWeekByCategory = Object.fromEntries(
    thisWeek.map((w) => [w.category_name, w.this_week])
  )
  const lastWeekByCategory = Object.fromEntries(
    lastWeek.map((w) => [w.category_name, w.last_week])
  )

  const budgetContext =
    budgets.length > 0
      ? budgets
          .map(
            (b) =>
              `${b.categoryName}: gastado ${formatCLP(b.spent)} de ${formatCLP(b.limit)} (${Math.round((b.spent / b.limit) * 100)}%)`
          )
          .join(', ')
      : 'Sin presupuestos configurados'

  const prompt = `Eres un asesor financiero personal amigable y motivador para un usuario en Chile. Analiza el gasto de esta semana versus la semana anterior y genera una respuesta en JSON con este formato exacto:

{
  "resumen": "Una oración corta del estado general (máximo 15 palabras)",
  "puntos": [
    { "tipo": "alerta", "texto": "máximo 20 palabras sobre algo preocupante" },
    { "tipo": "positivo", "texto": "máximo 20 palabras sobre algo bueno" },
    { "tipo": "sugerencia", "texto": "máximo 20 palabras con recomendación" }
  ],
  "motivacion": "Frase motivacional corta (máximo 12 palabras)"
}

Reglas para los puntos:
- "alerta": Si hay aumento significativo en alguna categoría o exceso de presupuesto
- "positivo": Si hay reducción de gastos, cumplimiento de presupuesto, o mejora
- "sugerencia": Recomendación práctica para la próxima semana

Datos de esta semana (gastos por categoría): ${JSON.stringify(thisWeekByCategory)}
Total esta semana: ${formatCLP(thisWeekTotal)}

Datos de la semana anterior: ${JSON.stringify(lastWeekByCategory)}
Total semana anterior: ${formatCLP(lastWeekTotal)}

Progreso presupuestos del mes: ${budgetContext}

Responde ÚNICAMENTE con el JSON válido, sin texto adicional, sin markdown, sin explicaciones.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return text.trim()
  } catch (err) {
    console.error('Error generating insight:', err)
    return ''
  }
}
