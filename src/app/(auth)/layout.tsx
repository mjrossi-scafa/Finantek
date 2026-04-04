import { FinantekLogo } from '@/components/logo/finantek-logo'
import { BarChart3, Bot, Camera } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Patrón de puntos en el fondo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Elementos decorativos existentes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative bg-transparent">
          <FinantekLogo variant="full" />
        </div>

        {/* Contenido principal */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Toma el control de tus finanzas personales
          </h2>
          <p className="text-base text-white/70 mt-3 max-w-sm">
            Registra gastos, analiza tus hábitos y recibe insights inteligentes con IA. Todo en pesos chilenos.
          </p>

          {/* Features como cards verticales */}
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-white" />
              <span className="text-sm text-white font-medium">Dashboard inteligente</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3">
              <Bot className="h-5 w-5 text-white" />
              <span className="text-sm text-white font-medium">Bot de Telegram</span>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-3">
              <Camera className="h-5 w-5 text-white" />
              <span className="text-sm text-white font-medium">Escaneo de boletas</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-white/40">
          FINANTEK © 2025 · Powered by Claude AI
        </p>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: '#0F0A1E' }}>
        <div className="w-full max-w-[360px] mx-auto">{children}</div>
      </div>
    </div>
  )
}
