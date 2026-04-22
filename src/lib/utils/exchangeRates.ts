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
    // Fallback rates (approximate, as of 2026). Only used when API is down.
    const FALLBACKS: Record<string, Record<string, number>> = {
      JPY: { CLP: 6.5 },
      USD: { CLP: 960 },
      EUR: { CLP: 1040 },
      AUD: { CLP: 660 },
      GBP: { CLP: 1230 },
      CAD: { CLP: 720 },
      BRL: { CLP: 195 },
      NZD: { CLP: 600 },
      ARS: { CLP: 1.1 },
      PEN: { CLP: 260 },
      MXN: { CLP: 56 },
      COP: { CLP: 0.24 },
      CLP: { JPY: 0.15, USD: 0.00104, EUR: 0.00096, AUD: 0.00152, GBP: 0.00081 },
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
    AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
    BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    NZD: new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }),
    ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }),
    PEN: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }),
    MXN: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }),
    COP: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }),
  }

  const formatter = formatters[currency] || formatters.CLP
  return formatter.format(amount)
}

/**
 * Catalogue of supported currencies for UI selectors.
 * Order matters in some places (e.g. fallback selection).
 */
export const SUPPORTED_CURRENCIES: Array<{ code: string; label: string }> = [
  { code: 'CLP', label: 'Pesos chilenos (CLP)' },
  { code: 'JPY', label: 'Yenes japoneses (JPY)' },
  { code: 'USD', label: 'Dólares estadounidenses (USD)' },
  { code: 'EUR', label: 'Euros (EUR)' },
  { code: 'AUD', label: 'Dólares australianos (AUD)' },
  { code: 'GBP', label: 'Libras esterlinas (GBP)' },
  { code: 'CAD', label: 'Dólares canadienses (CAD)' },
  { code: 'BRL', label: 'Reales brasileños (BRL)' },
  { code: 'NZD', label: 'Dólares neozelandeses (NZD)' },
  { code: 'ARS', label: 'Pesos argentinos (ARS)' },
  { code: 'PEN', label: 'Soles peruanos (PEN)' },
  { code: 'MXN', label: 'Pesos mexicanos (MXN)' },
  { code: 'COP', label: 'Pesos colombianos (COP)' },
]

/**
 * Currency aliases for user-friendly detection in messages.
 * Order matters: more specific compound aliases (e.g. "dólares australianos")
 * MUST come before generic ones ("dólar"), because detectCurrency iterates
 * in insertion order and returns on first match.
 */
export const CURRENCY_ALIASES: Record<string, string> = {
  // AUD (compounds before "dólar")
  'dólares australianos': 'AUD', 'dolares australianos': 'AUD',
  'dólar australiano': 'AUD', 'dolar australiano': 'AUD',
  aussie: 'AUD', aussies: 'AUD', aud: 'AUD', 'a$': 'AUD',
  // CAD (compounds before "dólar")
  'dólares canadienses': 'CAD', 'dolares canadienses': 'CAD',
  'dólar canadiense': 'CAD', 'dolar canadiense': 'CAD',
  cad: 'CAD', 'c$': 'CAD',
  // NZD (compounds before "dólar")
  'dólares neozelandeses': 'NZD', 'dolares neozelandeses': 'NZD',
  nzd: 'NZD',
  // JPY
  yen: 'JPY', yenes: 'JPY', jpy: 'JPY', '¥': 'JPY',
  // USD
  dolar: 'USD', dólar: 'USD', dolares: 'USD', dólares: 'USD', usd: 'USD', 'us$': 'USD',
  // EUR
  euro: 'EUR', euros: 'EUR', eur: 'EUR', '€': 'EUR',
  // GBP
  libra: 'GBP', libras: 'GBP', gbp: 'GBP', '£': 'GBP',
  // BRL
  real: 'BRL', reales: 'BRL', brl: 'BRL', 'r$': 'BRL',
  // MXN (compound before generic "pesos")
  'pesos mexicanos': 'MXN', mxn: 'MXN',
  // ARS (compound before generic "pesos")
  'pesos argentinos': 'ARS', ars: 'ARS',
  // COP (compound before generic "pesos")
  'pesos colombianos': 'COP', cop: 'COP',
  // PEN
  pen: 'PEN', soles: 'PEN', sol: 'PEN',
  // CLP (generic "pesos" defaults to chileno)
  clp: 'CLP', peso: 'CLP', pesos: 'CLP',
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
