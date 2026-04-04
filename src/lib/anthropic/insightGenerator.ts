import Anthropic from '@anthropic-ai/sdk'
import { WeeklyComparison } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}
