export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseCLP(value: string): number {
  // Remove currency symbol, dots (thousands sep), spaces
  const cleaned = value.replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}

export function formatCLPCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return formatCLP(amount)
}
