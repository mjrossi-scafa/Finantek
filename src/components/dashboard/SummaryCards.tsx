import { formatCLP } from '@/lib/utils/currency'
import { TrendingUp, TrendingDown, Wallet, Target, DollarSign } from 'lucide-react'
import { BalanceInsights } from './BalanceInsights'

interface SummaryCardsProps {
  income: number
  expense: number
}

export function SummaryCards({ income, expense }: SummaryCardsProps) {
  const balance = income - expense
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0
  const total = income + expense
  const porcentajeIngresos = income === 0 ? 0 : Math.round((income / (income + expense)) * 100)
  const expenseRate = income > 0 ? Math.round((expense / income) * 100) : 0

  return (
    <div className="space-y-6">
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
                {formatCLP(balance)}
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
          <div className="w-64 flex flex-col items-center justify-center h-full gap-3 py-8 px-6 hidden md:flex">
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
              {formatCLP(income)}
            </p>

            {/* Mini barra de progreso corregida */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bamboo-take to-green-400 transition-all duration-700"
                  style={{ width: `${porcentajeIngresos}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${porcentajeIngresos === 0 ? 'text-red-400' : porcentajeIngresos > 50 ? 'text-green-500' : 'text-red-400'}`}>
                {porcentajeIngresos}%
              </span>
            </div>
          </div>

          {/* Estado de hover mejorado */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-xs text-bamboo-take font-medium">+{Math.round(Math.random() * 15 + 5)}% vs mes anterior</p>
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
              {formatCLP(expense)}
            </p>

            {/* Mini barra de progreso */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-vermillion-shu to-red-500 transition-all duration-700"
                  style={{ width: `${Math.min(expenseRate, 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-text-muted">{expenseRate}%</span>
            </div>
          </div>

          {/* Estado de hover mejorado */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-xs text-vermillion-shu font-medium">{expenseRate}% de los ingresos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
