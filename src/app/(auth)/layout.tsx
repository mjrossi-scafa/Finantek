import { KatanaLogo } from '@/components/logo/katana-logo'
import { BarChart3, Bot, Camera, Sparkles } from 'lucide-react'
import { JapanMapDots } from '@/components/decorations/JapanMapDots'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div
        className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-center relative overflow-hidden"
        style={{
          backgroundColor: '#0F0A1E',
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Japan map as background decoration */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <JapanMapDots className="w-[85%] h-[85%]" dotSize={4} opacity={0.45} />
        </div>

        {/* Contenido centrado verticalmente */}
        <div className="relative space-y-8 max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-56">
              <KatanaLogo variant="sidebar" />
            </div>
          </div>

          {/* Separador */}
          <hr className="border-purple-500/20" />

          {/* Título y subtítulo */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-white leading-tight">
              Toma el control
            </h1>
            <p className="text-lg text-purple-300/70 mt-2">
              La disciplina del samurai
            </p>
            <p className="text-lg text-purple-300/70">
              aplicada al dinero
            </p>
          </div>

          {/* Separador */}
          <hr className="border-purple-500/20" />

          {/* Features como cards verticales */}
          <div className="space-y-3">
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="text-sm text-white font-medium">Dashboard inteligente</div>
                <div className="text-xs text-white/40 mt-0.5">Visualiza tus finanzas en tiempo real</div>
              </div>
            </div>
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <Bot className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="text-sm text-white font-medium">Bot de Telegram</div>
                <div className="text-xs text-white/40 mt-0.5">Registra gastos desde donde estés</div>
              </div>
            </div>
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <Camera className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="text-sm text-white font-medium">Escaneo de recibos</div>
                <div className="text-xs text-white/40 mt-0.5">Fotografía y digitaliza tus boletas</div>
              </div>
            </div>
            <div className="bg-white/5 border border-purple-500/10 rounded-xl px-4 py-3 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-400 mt-0.5" />
              <div>
                <div className="text-sm text-white font-medium">Insights inteligentes</div>
                <div className="text-xs text-white/40 mt-0.5">Diagnóstico y planes claros con IA</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center font-mono text-xs text-purple-800">
            武士道 · KATANA © 2026
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
