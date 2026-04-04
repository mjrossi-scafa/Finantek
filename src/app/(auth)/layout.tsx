import { FinantekLogo } from '@/components/logo/finantek-logo'
import { BarChart3, Bot, Camera } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-center relative overflow-hidden"
        style={{
          backgroundColor: '#0F0A1E',
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Contenido centrado verticalmente */}
        <div className="relative space-y-8 max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center">
            <FinantekLogo variant="sidebar" />
          </div>

          {/* Separador */}
          <hr className="border-purple-500/20" />

          {/* Título y subtítulo */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-white leading-tight">
              Toma el control.
            </h1>
            <p className="text-base text-purple-300/70 mt-2">
              Finanzas inteligentes al estilo samurai.
            </p>
          </div>

          {/* Separador */}
          <hr className="border-purple-500/20" />

          {/* Features como cards verticales */}
          <div className="space-y-3">
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-white/80">Dashboard inteligente</span>
            </div>
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <Bot className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-white/80">Bot de Telegram</span>
            </div>
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <Camera className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-white/80">Escaneo de recibos</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center font-mono text-xs text-purple-800">
            武士道 · FINANTEK © 2025
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: '#0F0A1E' }}>
        <div className="w-full max-w-[360px] mx-auto">{children}</div>
      </div>
    </div>
  )
}
