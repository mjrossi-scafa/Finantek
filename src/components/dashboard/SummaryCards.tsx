import { formatCLP } from '@/lib/utils/currency'
import { TrendingUp, TrendingDown, Wallet, Target, DollarSign, Calendar } from 'lucide-react'
import { BalanceInsights } from './BalanceInsights'
import { CountUp } from './CountUp'

interface SummaryCardsProps {
  income: number
  expense: number
  prevIncome?: number
  prevExpense?: number
  daysRemaining?: number
  projectedMonthEnd?: number
  isHidden?: boolean
}

export function SummaryCards({
  income,
  expense,
  prevIncome = 0,
  prevExpense = 0,
  daysRemaining = 0,
  projectedMonthEnd = 0,
  isHidden = false,
}: SummaryCardsProps) {
  const balance = income - expense
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const expenseRate = income > 0 ? Math.round((expense / income) * 100) : 0

  // REAL comparison with previous month (replacing Math.random() bug)
  const incomeChange = prevIncome > 0 ? Math.round(((income - prevIncome) / prevIncome) * 100) : 0
  const expenseChange = prevExpense > 0 ? Math.round(((expense - prevExpense) / prevExpense) * 100) : 0

  // Projection vs current expense
  const projectionDiff = projectedMonthEnd - expense
  const isOverspending = prevExpense > 0 && projectedMonthEnd > prevExpense

  return (
    <div className="space-y-6" data-tour="dashboard-stats">
      {/* Hero balance card mejorado con insights */}
      <div className="relative overflow-hidden rounded-2xl gradient-indigo shadow-xl glow-indigo">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-6 left-6 w-40 h-40 bg-white/3 rounded-full blur-2xl" />

        <div className="relative flex flex-row items-stretch h-full min-h-[220px]">
          {/* Mitad izquierda - balance actual */}
          <div className="flex-1 flex flex-col justify-between p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/70 tracking-wide">Balance del Mes</p>
                <p className="text-xs text-white/50">Ingresos - Gastos</p>
              </div>
            </div>

            {/* Número de balance más grande con código de color */}
            <div className="mb-6">
              <p className={`text-6xl font-black font-mono leading-none mb-2 ${
                balance >= 0 ? 'text-white' : 'text-red-200'
              }`}>
                {isHidden ? '•••••' : <CountUp value={balance} />}
              </p>

              {/* Badge de tendencia mejorado */}
              {income > 0 && (
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm ${
                    balance >= 0
                      ? 'bg-bamboo-take/20 text-bamboo-take border border-bamboo-take/30'
                      : 'bg-red-500/20 text-red-200 border border-red-500/30'
                  }`}>
                    {balance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-mono">{savingsRate}%</span>
                    <span>ahorro</span>
                  </span>

                  {/* Barra de progreso */}
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        balance >= 0 ? 'bg-bamboo-take' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(Math.abs(savingsRate), 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divisor */}
          <div className="w-px bg-white/10 self-stretch hidden md:block" />

          {/* Mitad derecha - insights */}
          <div className="w-64 flex flex-col items-center justify-center h-full gap-2 py-8 px-6 hidden md:flex">
            <BalanceInsights />
          </div>
        </div>
      </div>

      {/* Tarjetas de ingresos y gastos mejoradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Income card mejorada */}
        <div className="glass-card rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 hover:glow-bamboo group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-bamboo-take/10 flex items-center justify-center transition-all group-hover:bg-bamboo-take/20 group-hover:scale-110">
                <DollarSign className="h-5 w-5 text-bamboo-take" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary">Ingresos</p>
                <p className="text-xs text-text-muted">Este mes</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-bamboo-take animate-pulse shadow-lg" />
          </div>

          {/* Número más grande */}
          <div className="mb-4">
            <p className="text-4xl font-black font-mono text-bamboo-take leading-none mb-2">
              {isHidden ? '•••••' : <CountUp value={income} />}
            </p>

            {/* Comparación REAL vs mes anterior */}
            {prevIncome > 0 ? (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${
                  incomeChange >= 0 ? 'text-bamboo-take' : 'text-vermillion-shu'
                }`}>
                  {incomeChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {incomeChange >= 0 ? '+' : ''}{incomeChange}%
                </span>
                <span className="text-xs text-text-muted">vs mes anterior</span>
              </div>
            ) : (
              <p className="text-xs text-text-muted">Sin comparación disponible</p>
            )}
          </div>

          {/* Estado de hover mejorado */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-xs text-text-muted">
              {prevIncome > 0 ? `Antes: ${formatCLP(prevIncome)}` : 'Primer mes registrando'}
            </p>
          </div>
        </div>

        {/* Expense card mejorada */}
        <div className="glass-card rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 hover:glow-vermillion group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-vermillion-shu/10 flex items-center justify-center transition-all group-hover:bg-vermillion-shu/20 group-hover:scale-110">
                <Target className="h-5 w-5 text-vermillion-shu" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary">Gastos</p>
                <p className="text-xs text-text-muted">Este mes</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-vermillion-shu animate-pulse shadow-lg" />
          </div>

          {/* Número más grande */}
          <div className="mb-4">
            <p className="text-4xl font-black font-mono text-vermillion-shu leading-none mb-2">
              {isHidden ? '•••••' : <CountUp value={expense} />}
            </p>

            {/* Comparación REAL vs mes anterior */}
            {prevExpense > 0 ? (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${
                  expenseChange <= 0 ? 'text-bamboo-take' : 'text-vermillion-shu'
                }`}>
                  {expenseChange <= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {expenseChange >= 0 ? '+' : ''}{expenseChange}%
                </span>
                <span className="text-xs text-text-muted">vs mes anterior</span>
              </div>
            ) : (
              <p className="text-xs text-text-muted">Sin comparación disponible</p>
            )}
          </div>

          {/* Proyección de gasto al fin de mes */}
          {daysRemaining > 0 && projectedMonthEnd > 0 && (
            <div className="pt-3 border-t border-surface-border/50">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3 text-text-muted" />
                <span className="text-text-muted">Proyección fin de mes:</span>
                <span className={`font-mono font-bold ${
                  isOverspending ? 'text-vermillion-shu' : 'text-text-primary'
                }`}>
                  {formatCLP(projectedMonthEnd)}
                </span>
              </div>
              {prevExpense > 0 && (
                <p className={`text-[10px] mt-1 ${
                  isOverspending ? 'text-vermillion-shu' : 'text-bamboo-take'
                }`}>
                  {isOverspending
                    ? `⚠️ ${formatCLP(projectionDiff)} más si sigues el ritmo`
                    : `✓ Vas mejor que el mes pasado`
                  }
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
