/**
 * Exchange rate utilities with caching
 * Uses exchangerate-api.com (1500 free requests/month)
 */

const CACHE: Record<string, { rate: number; fetchedAt: number }> = {}
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

/**
 * Get exchange rate from one currency to another.
 * Returns how many units of `to` one unit of `from` equals.
 * E.g., getExchangeRate('JPY', 'CLP') = 6.5 means 1 JPY = 6.5 CLP
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1

  const cacheKey = `${from}_${to}`
  const cached = CACHE[cacheKey]
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.rate
  }

  try {
    // Free API, no API key needed for basic tier
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`)
    if (!response.ok) throw new Error(`Exchange rate API error: ${response.status}`)

    const data = await response.json()
    const rate = data?.rates?.[to]

    if (typeof rate !== 'number') {
      throw new Error(`Rate not found for ${from} → ${to}`)
    }

    CACHE[cacheKey] = { rate, fetchedAt: Date.now() }
    return rate
  } catch (err) {
    console.error('Exchange rate fetch error:', err)
    // Fallback rates (approximate, as of 2026)
    const FALLBACKS: Record<string, Record<string, number>> = {
      JPY: { CLP: 6.5, USD: 0.0067, EUR: 0.0062 },
      USD: { CLP: 960, JPY: 149, EUR: 0.92 },
      EUR: { CLP: 1040, JPY: 162, USD: 1.08 },
      CLP: { JPY: 0.15, USD: 0.00104, EUR: 0.00096 },
    }
    return FALLBACKS[from]?.[to] ?? 1
  }
}

/**
 * Convert an amount from one currency to another.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return amount
  const rate = await getExchangeRate(from, to)
  return Math.round(amount * rate)
}

/**
 * Format an amount with its currency symbol.
 */
export function formatCurrency(amount: number, currency: string): string {
  const formatters: Record<string, Intl.NumberFormat> = {
    CLP: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }),
    JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
    PEN: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }),
    MXN: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }),
    COP: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }),
  }

  const formatter = formatters[currency] || formatters.CLP
  return formatter.format(amount)
}

/**
 * Currency aliases for user-friendly detection in messages.
 */
export const CURRENCY_ALIASES: Record<string, string> = {
  // JPY
  yen: 'JPY', yenes: 'JPY', jpy: 'JPY', '¥': 'JPY',
  // USD
  dolar: 'USD', dólar: 'USD', dolares: 'USD', dólares: 'USD', usd: 'USD', 'us$': 'USD',
  // EUR
  euro: 'EUR', euros: 'EUR', eur: 'EUR', '€': 'EUR',
  // CLP
  clp: 'CLP', peso: 'CLP', pesos: 'CLP',
  // ARS
  ars: 'ARS',
  // Others
  pen: 'PEN', soles: 'PEN', sol: 'PEN',
  mxn: 'MXN',
  cop: 'COP',
}

/**
 * Detect currency from a text message.
 * Returns ISO code or null.
 */
export function detectCurrency(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [alias, code] of Object.entries(CURRENCY_ALIASES)) {
    // Match whole word or symbol
    const pattern = alias.length <= 2 ? alias : `\\b${alias}\\b`
    const regex = new RegExp(pattern, 'i')
    if (regex.test(lower)) return code
  }
  return null
}
